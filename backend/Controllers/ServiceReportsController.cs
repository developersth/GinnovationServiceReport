using backend.Models;
using backend.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServiceReportController : ControllerBase
{
    private readonly IServiceReportRepository _repository;
    private readonly IWebHostEnvironment _env;

    public ServiceReportController(IServiceReportRepository repository, IWebHostEnvironment env)
    {
        _repository = repository;
        _env = env;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ServiceReportDto>>> GetAll()
    {
        var reports = await _repository.GetAllAsync();

        // กำหนด timezone Asia/Bangkok (UTC+7)
        var timeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");

        var result = reports.Select(r => new ServiceReport
        {
            Id = r.Id,
            ProjectId = r.ProjectId,
            ReportedBy = r.ReportedBy,
            Channel = r.Channel,
            Complain = r.Complain,
            Details = r.Details,
            CausesOfFailure = r.CausesOfFailure,
            ActionTaken = r.ActionTaken,
            ImagePaths = r.ImagePaths,
            // แปลงเวลาจาก UTC เป็นเวลาไทย
            ReportDate = TimeZoneInfo.ConvertTimeFromUtc(r.ReportDate, timeZone),
            Status = r.Status,
            CreatedBy = r.CreatedBy,
            CreatedAt = TimeZoneInfo.ConvertTimeFromUtc(r.CreatedAt, timeZone),
            UpdatedBy = r.UpdatedBy,
            UpdatedAt = TimeZoneInfo.ConvertTimeFromUtc(r.UpdatedAt, timeZone),
        });

        return Ok(result);
    }

    [HttpGet("{id:length(24)}")]
    public async Task<ActionResult<ServiceReport>> GetById(string id)
    {
        var report = await _repository.GetByIdAsync(id);
        if (report == null)
            return NotFound();

        return Ok(report);
    }

    [HttpPost]
    public async Task<IActionResult> CreateWithImages(
        [FromForm] ServiceReportDto reportDto,
        [FromForm] List<IFormFile>? images)
    {
        var imageUrls = new List<string>();

        if (images != null && images.Count > 0)
        {
            var uploadsFolder = Path.Combine(_env.WebRootPath, "images", "service-reports");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            foreach (var image in images)
            {
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using var stream = new FileStream(filePath, FileMode.Create);
                await image.CopyToAsync(stream);

                imageUrls.Add($"/images/service-reports/{fileName}");
            }
        }

        var serviceReport = new ServiceReport
        {
            ProjectId = reportDto.ProjectId,
            ReportedBy = reportDto.ReportedBy,
            Channel = reportDto.Channel,
            Complain = reportDto.Complain,
            Details = reportDto.Details,
            CausesOfFailure = reportDto.CausesOfFailure,
            ActionTaken = reportDto.ActionTaken,
            Status = reportDto.Status,
            ReportDate = reportDto.ReportDate,
            CreatedBy = reportDto.CreatedBy,
            UpdatedBy = reportDto.UpdatedBy,
            ImagePaths = imageUrls
        };

        await _repository.CreateAsync(serviceReport);
        return CreatedAtAction(nameof(GetById), new { id = serviceReport.Id }, serviceReport);
    }


    // Assuming Get and CreateWithImages methods are defined above

    [HttpPut("{id:length(24)}")]
    public async Task<IActionResult> UpdateWithImages(
        string id,
        [FromForm] ServiceReportDto reportDto,
        [FromForm] List<IFormFile>? images)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var existing = await _repository.GetByIdAsync(id);
        if (existing == null)
            return NotFound();

        var webRoot = _env.WebRootPath;
        var uploadDir = Path.Combine(webRoot, "images", "service-reports");
        Directory.CreateDirectory(uploadDir);

        var newImagePaths = new List<string>();

        // ✅ ถ้ามีภาพใหม่ -> ลบภาพเดิมทั้งหมดก่อน แล้วแทนที่
        if (images is { Count: > 0 })
        {
            // 🔥 ลบภาพเดิมทั้งหมด
            if (existing.ImagePaths != null)
            {
                foreach (var path in existing.ImagePaths)
                {
                    var fileName = Path.GetFileName(path);
                    var fullPath = Path.Combine(uploadDir, fileName);
                    if (System.IO.File.Exists(fullPath))
                    {
                        try
                        {
                            System.IO.File.Delete(fullPath);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"❌ Failed to delete file: {fullPath} - {ex.Message}");
                        }
                    }
                }
            }

            // 📥 อัปโหลดภาพใหม่
            foreach (var image in images)
            {
                if (image.Length > 0)
                {
                    var ext = Path.GetExtension(image.FileName);
                    var fileName = $"{Guid.NewGuid()}{ext}";
                    var filePath = Path.Combine(uploadDir, fileName);

                    try
                    {
                        await using var stream = new FileStream(filePath, FileMode.Create);
                        await image.CopyToAsync(stream);
                        newImagePaths.Add($"/images/service-reports/{fileName}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"❌ Failed to save image: {filePath} - {ex.Message}");
                        return StatusCode(500, "Image upload failed.");
                    }
                }
            }
        }
        else
        {
            // ❗ ไม่มีภาพใหม่แนบมา → ใช้ภาพเดิม
            newImagePaths = existing.ImagePaths ?? new List<string>();
        }

        // ✏️ อัปเดตข้อมูล
        existing.ProjectId = reportDto.ProjectId;
        existing.ReportedBy = reportDto.ReportedBy;
        existing.Complain = reportDto.Complain;
        existing.Details = reportDto.Details;
        existing.CausesOfFailure = reportDto.CausesOfFailure;
        existing.ActionTaken = reportDto.ActionTaken;
        existing.Channel = reportDto.Channel;
        existing.ReportDate = reportDto.ReportDate;
        existing.Status = reportDto.Status;
        existing.CreatedBy = reportDto.CreatedBy;
        existing.UpdatedBy = reportDto.UpdatedBy;
        existing.ImagePaths = newImagePaths;
        existing.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(id, existing);

        return NoContent();
    }



[HttpDelete("{id:length(24)}")]
public async Task<ActionResult> Delete(string id)
{
    var existing = await _repository.GetByIdAsync(id);
    if (existing == null)
        return NotFound();

    // ลบไฟล์ภาพทั้งหมดที่เกี่ยวข้อง
    if (existing.ImagePaths != null)
    {
        foreach (var imagePath in existing.ImagePaths)
        {
            // ตัด / ออกแล้วต่อ path ให้ถูกต้อง
            var fileName = Path.GetFileName(imagePath);
            var fullPath = Path.Combine(_env.WebRootPath, "images", "service-reports", fileName);

            if (System.IO.File.Exists(fullPath))
            {
                try
                {
                    System.IO.File.Delete(fullPath);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Failed to delete image: {fullPath} - {ex.Message}");
                    // หากต้องการ: return StatusCode(500, "Failed to delete image.");
                }
            }
        }
    }

    // ลบข้อมูลจากฐานข้อมูล
    await _repository.DeleteAsync(id);

    return NoContent();
}


}
