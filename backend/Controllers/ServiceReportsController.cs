using System.Text.Json;
using System.Text.Json.Serialization;
using backend.Models;
using backend.Repositories;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServiceReportController(
    IServiceReportRepository repository,
    IProjectRepository projects,
    IWebHostEnvironment environment,
    ILogger<ServiceReportController> logger) : ControllerBase
{
    private const string ImageFolder = "service-reports";
    private static readonly JsonSerializerOptions StaffJsonOptions = new(JsonSerializerDefaults.Web)
    {
        NumberHandling = JsonNumberHandling.AllowReadingFromString
    };

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ServiceReport>>> GetAll(
        [FromQuery] string? projectId, [FromQuery] DateTimeOffset? from, [FromQuery] DateTimeOffset? to)
    {
        if (projectId is not null)
        {
            if (!ObjectId.TryParse(projectId, out var parsed))
                return BadRequest(new { message = "รหัสโครงการไม่ถูกต้อง" });

            projectId = parsed.ToString();
        }

        if (from.HasValue && to.HasValue && from.Value >= to.Value)
            return BadRequest(new { message = "วันที่เริ่มต้นต้องมาก่อนวันสิ้นสุดช่วงค้นหา" });

        var reports = await repository.FindAsync(projectId, from?.UtcDateTime, to?.UtcDateTime);
        return Ok(reports.Select(WithCollections));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceReport>> GetById(string id)
    {
        var report = await repository.GetByIdAsync(id);
        if (report is null) return NotFound();
        return Ok(WithCollections(report));
    }

    [HttpPost]
    public Task<IActionResult> CreateWithImages([FromForm] ServiceReportDto reportDto, [FromForm] List<IFormFile>? images) =>
        SaveAsync(null, reportDto, images);

    [HttpPut("{id}")]
    public Task<IActionResult> UpdateWithImages(string id, [FromForm] ServiceReportDto reportDto, [FromForm] List<IFormFile>? images) =>
        SaveAsync(id, reportDto, images);

    private async Task<IActionResult> SaveAsync(string? id, ServiceReportDto input, List<IFormFile>? images)
    {
        List<StaffWorkingTime>? staff;
        try
        {
            staff = await ReadStaffAsync(input.StaffWorkingTime);
        }
        catch (JsonException)
        {
            return BadRequest(new { message = "ข้อมูลเวลาปฏิบัติงานไม่ถูกต้อง" });
        }

        if (staff?.Any(entry => entry is null || !double.IsFinite(entry.WorkingHours) ||
                                !double.IsFinite(entry.TravellingHours) || entry.WorkingHours < 0 ||
                                entry.TravellingHours < 0) == true)
            return BadRequest(new { message = "ชั่วโมงทำงานและชั่วโมงเดินทางต้องเป็นตัวเลขที่ไม่ติดลบ" });

        if (staff is not null)
        {
            foreach (var entry in staff)
            {
                if (entry.WorkingDate.Kind == DateTimeKind.Local)
                    entry.WorkingDate = entry.WorkingDate.ToUniversalTime();
                else if (entry.WorkingDate.Kind == DateTimeKind.Unspecified && entry.WorkingDate != default)
                    entry.WorkingDate = new DateTimeOffset(entry.WorkingDate, TimeSpan.FromHours(7)).UtcDateTime;
            }
        }

        await ProjectReportWrites.Gate.WaitAsync(HttpContext.RequestAborted);
        try
        {
            var report = id is null ? new ServiceReport() : await repository.GetByIdAsync(id);
            if (report is null) return NotFound();

            var project = await projects.GetByIdAsync(input.ProjectId);
            if (project is null)
                return BadRequest(new { message = "ไม่พบโครงการที่เลือก กรุณาเลือกโครงการอีกครั้ง" });

            var oldImages = report.ImagePaths ?? [];
            var retained = oldImages;
            if (input.ReplaceExistingImages || input.ExistingImagePathsToKeep is not null)
            {
                var requested = input.ExistingImagePathsToKeep ?? [];
                if (requested.Except(oldImages, StringComparer.Ordinal).Any())
                    return Conflict(new { message = "รายการรูปแนบเปลี่ยนแล้ว กรุณาโหลดรายงานใหม่" });

                retained = requested.Distinct(StringComparer.Ordinal).ToList();
            }

            List<string> uploaded = [];
            try
            {
                if (images is not null)
                {
                    foreach (var image in images)
                        uploaded.Add(await ReportImageStore.SaveAsync(image, environment.WebRootPath, ImageFolder));
                }
            }
            catch (InvalidDataException exception)
            {
                DeleteImages(uploaded);
                return BadRequest(new { message = exception.Message });
            }
            catch
            {
                DeleteImages(uploaded);
                throw;
            }

            var previousUpdate = report.UpdatedAt;
            report.ProjectId = project.Id!;
            report.ReportedBy = input.ReportedBy.Trim();
            report.Channel = input.Channel.Trim();
            report.Complain = input.Complain.Trim();
            report.Details = input.Details ?? report.Details;
            report.CausesOfFailure = input.CausesOfFailure ?? string.Empty;
            report.ActionTaken = input.ActionTaken ?? string.Empty;
            report.Status = input.Status.Trim();
            report.ReportDate = input.ReportDate!.Value.UtcDateTime;
            report.ImagePaths = [.. retained, .. uploaded];
            report.StaffWorkingTime = staff ?? report.StaffWorkingTime ?? [];
            report.UpdatedBy = User.Identity?.Name ?? input.UpdatedBy ?? report.UpdatedBy;
            report.UpdatedAt = DateTime.UtcNow;

            if (id is null)
            {
                report.CreatedBy = User.Identity?.Name ?? input.CreatedBy ?? report.UpdatedBy;
                report.CreatedAt = report.UpdatedAt;
                await repository.CreateAsync(report);
                return CreatedAtAction(nameof(GetById), new { id = report.Id }, report);
            }

            // MongoDB timestamps are stored with millisecond precision.
            if (report.UpdatedAt <= previousUpdate.AddMilliseconds(1))
                report.UpdatedAt = previousUpdate.AddMilliseconds(1);

            // A failed network response can leave the database write outcome unknown.
            // Keep newly uploaded files in that case so successful writes retain valid links.
            if (!await repository.UpdateAsync(id, previousUpdate, report))
            {
                DeleteImages(uploaded);
                return Conflict(new { message = "รายงานถูกแก้ไขระหว่างบันทึก กรุณาโหลดข้อมูลใหม่" });
            }

            DeleteImages(oldImages.Except(retained, StringComparer.Ordinal));
            return NoContent();
        }
        finally
        {
            ProjectReportWrites.Gate.Release();
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await ProjectReportWrites.Gate.WaitAsync(HttpContext.RequestAborted);
        try
        {
            var report = await repository.GetByIdAsync(id);
            if (report is null || !await repository.DeleteAsync(id)) return NotFound();

            DeleteImages(report.ImagePaths ?? []);
            return NoContent();
        }
        finally
        {
            ProjectReportWrites.Gate.Release();
        }
    }

    private async Task<List<StaffWorkingTime>?> ReadStaffAsync(List<StaffWorkingTime>? bound)
    {
        var form = await Request.ReadFormAsync(HttpContext.RequestAborted);
        if (!form.TryGetValue("reportDto.staffWorkingTime", out var legacyJson) &&
            !form.TryGetValue("staffWorkingTime", out legacyJson))
            return bound;

        return JsonSerializer.Deserialize<List<StaffWorkingTime>>(legacyJson.ToString(), StaffJsonOptions) ?? [];
    }

    private void DeleteImages(IEnumerable<string> imagePaths)
    {
        foreach (var file in imagePaths)
            ReportImageStore.DeleteManagedFile(file, environment.WebRootPath, ImageFolder, logger);
    }

    private static ServiceReport WithCollections(ServiceReport report)
    {
        report.ImagePaths ??= [];
        report.StaffWorkingTime ??= [];
        return report;
    }
}
