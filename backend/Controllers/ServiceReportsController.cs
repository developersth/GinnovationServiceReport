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
            var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            foreach (var image in images)
            {
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using var stream = new FileStream(filePath, FileMode.Create);
                await image.CopyToAsync(stream);

                imageUrls.Add($"/uploads/{fileName}");
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

        var remainingPaths = reportDto.RemainingImagePaths ?? new List<string>();

        // 🔥 ลบเฉพาะรูปที่ไม่มีใน remainingPaths
        var pathsToDelete = existing.ImagePaths?.Where(p => !remainingPaths.Contains(p)).ToList();
        if (pathsToDelete != null)
        {
            foreach (var path in pathsToDelete)
            {
                var fileName = Path.GetFileName(path);
                var fullPath = Path.Combine(_env.WebRootPath, "uploads", fileName);
                if (System.IO.File.Exists(fullPath))
                {
                    System.IO.File.Delete(fullPath);
                }
            }
        }

        // 📥 อัปโหลดรูปใหม่
        var imageUrls = new List<string>(remainingPaths); // เริ่มจากรูปเดิมที่เหลือ
        if (images != null && images.Count > 0)
        {
            var uploadDir = Path.Combine(_env.WebRootPath, "uploads");
            Directory.CreateDirectory(uploadDir);

            foreach (var image in images)
            {
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
                var filePath = Path.Combine(uploadDir, fileName);

                using var stream = new FileStream(filePath, FileMode.Create);
                await image.CopyToAsync(stream);

                imageUrls.Add($"/uploads/{fileName}"); // เก็บ relative path
            }
        }

        // ✏️ อัปเดตข้อมูล ServiceReport
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
        existing.ImagePaths = imageUrls;
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

        // ลบไฟล์ภาพที่เกี่ยวข้องทั้งหมด
        foreach (var imagePath in existing.ImagePaths)
        {
            var fullImagePath = Path.Combine("wwwroot/uploads", imagePath); // ปรับ path ให้ตรงกับที่คุณบันทึก
            if (System.IO.File.Exists(fullImagePath))
            {
                System.IO.File.Delete(fullImagePath);
            }
        }

        // ลบข้อมูลในฐานข้อมูล
        await _repository.DeleteAsync(id);
        return NoContent();
    }

}
