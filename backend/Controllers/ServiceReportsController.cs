using backend.Models;
using backend.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServiceReportController : ControllerBase
{
    private readonly IServiceReportRepository _repository;

    public ServiceReportController(IServiceReportRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ServiceReport>>> GetAll()
    {
        var reports = await _repository.GetAllAsync();
        return Ok(reports);
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
    public async Task<ActionResult> Create(ServiceReport report)
    {
        await _repository.CreateAsync(report);
        return CreatedAtAction(nameof(GetById), new { id = report.Id }, report);
    }

    [HttpPost("with-images")]
    public async Task<IActionResult> CreateWithImages([FromForm] ServiceReportDto reportDto, List<IFormFile>? images)
    {
        var imagePaths = new List<string>();

        if (images != null && images.Count > 0)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            foreach (var image in images)
            {
                var filePath = Path.Combine(uploadsFolder, $"{Guid.NewGuid()}_{image.FileName}");
                using var stream = new FileStream(filePath, FileMode.Create);
                await image.CopyToAsync(stream);
                imagePaths.Add(filePath);
            }
        }

        // เก็บ path รูปทั้งหมดใน DTO หรือ model
        reportDto.ImagePaths = imagePaths;

        var serviceReport = new ServiceReport
        {
            ReportedBy = reportDto.ReportedBy,
            Complain = reportDto.Complain,
            // ... map fields อื่น ๆ
            ImagePaths = reportDto.ImagePaths
        };

        await _repository.CreateAsync(serviceReport);
        return CreatedAtAction(nameof(GetById), new { id = serviceReport.Id }, serviceReport);
    }


    [HttpPut("{id:length(24)}")]
    public async Task<ActionResult> Update(string id, ServiceReport report)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null)
            return NotFound();

        report.Id = id; // ensure ID is consistent
        await _repository.UpdateAsync(id, report);
        return NoContent();
    }

    [HttpDelete("{id:length(24)}")]
    public async Task<ActionResult> Delete(string id)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null)
            return NotFound();

        await _repository.DeleteAsync(id);
        return NoContent();
    }
}
