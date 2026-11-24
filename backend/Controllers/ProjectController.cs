using backend.Models;
using backend.Repositories;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectController(
    IProjectRepository repository,
    IServiceReportRepository reports,
    IWebHostEnvironment environment,
    ILogger<ProjectController> logger) : ControllerBase
{
    private const string ImageFolder = "projects";

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await repository.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var project = await repository.GetByIdAsync(id);
        return project is null ? NotFound() : Ok(project);
    }

    [HttpPost]
    public Task<IActionResult> Create([FromForm] ProjectCreateDto input) => SaveAsync(null, input);

    [HttpPut("{id}")]
    public Task<IActionResult> Update(string id, [FromForm] ProjectCreateDto input) => SaveAsync(id, input);

    private async Task<IActionResult> SaveAsync(string? id, ProjectCreateDto input)
    {
        await ProjectReportWrites.Gate.WaitAsync(HttpContext.RequestAborted);
        try
        {
            var project = id is null ? new Project() : await repository.GetByIdAsync(id);
            if (project is null) return NotFound();

            var name = input.Name.Trim();
            if (!string.Equals(name, project.Name, StringComparison.Ordinal))
            {
                var existing = await repository.GetByNameAsync(name);
                if (existing is not null && existing.Id != project.Id)
                    return Conflict(new { message = "ชื่อโครงการนี้ถูกใช้งานแล้ว" });
            }

            var previousImage = project.ImageUrl;
            string? newImage = null;
            if (input.Image is not null)
            {
                try
                {
                    newImage = await ReportImageStore.SaveAsync(input.Image, environment.WebRootPath, ImageFolder);
                }
                catch (InvalidDataException exception)
                {
                    return BadRequest(new { message = exception.Message });
                }
            }

            project.Name = name;
            project.CustomerName = input.CustomerName.Trim();
            project.CustomerAddress = input.CustomerAddress?.Trim() ?? string.Empty;
            project.ContactPerson = input.ContactPerson?.Trim() ?? string.Empty;
            project.Tel = input.Tel?.Trim() ?? string.Empty;
            project.ServiceUnder = input.ServiceUnder?.Trim() ?? string.Empty;
            project.ImageUrl = newImage ?? (input.RemoveImage ? string.Empty : previousImage);

            if (id is null)
            {
                await repository.CreateAsync(project);
                return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
            }

            if (!await repository.UpdateAsync(id, project))
            {
                DeleteImage(newImage);
                return NotFound();
            }

            if (project.ImageUrl != previousImage) DeleteImage(previousImage);
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
            var project = await repository.GetByIdAsync(id);
            if (project is null) return NotFound();

            if (await reports.ExistsForProjectAsync(project.Id!))
                return Conflict(new { message = "ลบโครงการนี้ไม่ได้ เพราะยังมีรายงานบริการอ้างอิงอยู่" });

            if (!await repository.DeleteAsync(id)) return NotFound();
            DeleteImage(project.ImageUrl);
            return NoContent();
        }
        finally
        {
            ProjectReportWrites.Gate.Release();
        }
    }

    private void DeleteImage(string? image) =>
        ReportImageStore.DeleteManagedFile(image, environment.WebRootPath, ImageFolder, logger);
}
