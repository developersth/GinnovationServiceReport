using backend.Models;
using backend.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectController : ControllerBase
    {
        private readonly IProjectRepository _repository;
        private readonly IWebHostEnvironment _env;

        public ProjectController(IProjectRepository repository, IWebHostEnvironment env)
        {
            _repository = repository;
            _env = env;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await _repository.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var project = await _repository.GetByIdAsync(id);
            if (project == null) return NotFound();
            return Ok(project);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromForm] string name, [FromForm] ProjectCreateDto dto)
        {
            // Check if a project with the same name already exists
            var existingProject = await _repository.GetByNameAsync(name);
            if (existingProject != null)
            {
                return Conflict(new { message = "A project with this name already exists." });
            }

            string imageUrl = "";

            if (dto.Image != null && dto.Image.Length > 0)
            {
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Image.FileName)}";
                var imagePath = Path.Combine(_env.WebRootPath, "images/projects", fileName);

                using (var stream = new FileStream(imagePath, FileMode.Create))
                {
                    await dto.Image.CopyToAsync(stream);
                }

                imageUrl = $"/images/projects/{fileName}";
            }

            var project = new Project
            {
                Name = name,
                ImageUrl = imageUrl,
                CustomerName = dto.CustomerName,
                CustomerAddress = dto.CustomerAddress,
                ContactPerson = dto.ContactPerson,
                Tel = dto.Tel,
                ServiceUnder =dto.ServiceUnder
            };

            await _repository.CreateAsync(project);
            return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromForm] string name, [FromForm] ProjectCreateDto dto)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound();

            existing.Name = name;

            if (dto.Image != null && dto.Image.Length > 0)
            {
                // 🔴 Delete old image if exists
                if (!string.IsNullOrEmpty(existing.ImageUrl))
                {
                    var oldFileName = Path.GetFileName(existing.ImageUrl);
                    var oldImagePath = Path.Combine(_env.WebRootPath, "images/projects", oldFileName);

                    if (System.IO.File.Exists(oldImagePath))
                    {
                        System.IO.File.Delete(oldImagePath);
                    }
                }

                // 🟢 Save new image
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Image.FileName)}";
                var imagePath = Path.Combine(_env.WebRootPath, "images/projects", fileName);


                using (var stream = new FileStream(imagePath, FileMode.Create))
                {
                    await dto.Image.CopyToAsync(stream);
                }

                // Set new image URL (use full URL if needed)
                existing.ImageUrl = $"/images/projects/{fileName}";
            }
            existing.Name = name;
            existing.CustomerName = dto.CustomerName;
            existing.CustomerAddress = dto.CustomerAddress;
            existing.ContactPerson = dto.ContactPerson;
            existing.Tel = dto.Tel;
            existing.ServiceUnder = dto.ServiceUnder;

            await _repository.UpdateAsync(id, existing);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound();

            // Delete image file if it exists
            if (!string.IsNullOrEmpty(existing.ImageUrl))
            {
                // Get the filename from the URL (e.g., /images/filename.jpg)
                var fileName = Path.GetFileName(existing.ImageUrl);

                // Combine with physical path to wwwroot/images
                var filePath = Path.Combine(_env.WebRootPath, "images/projects", fileName);

                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            // Delete the project from database
            await _repository.DeleteAsync(id);

            return NoContent();
        }

    }
}
