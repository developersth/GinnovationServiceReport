using System.Text;
using backend.Models;
using backend.Repositories;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController(IUserRepository repository) : ControllerBase
{
    private static readonly SemaphoreSlim UserWrites = new(1, 1);
    private static readonly HashSet<string> Roles = new(StringComparer.Ordinal)
    {
        "admin", "editor", "viewer", "maintainer"
    };

    [HttpGet]
    public async Task<ActionResult<List<User>>> GetAll() => Ok(await repository.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetById(string id)
    {
        var user = await repository.GetByIdAsync(id);
        if (user is null) return NotFound();
        return Ok(user);
    }

    [HttpPost]
    public Task<IActionResult> Create([FromBody] UserUpdateDto input) => SaveAsync(null, input);

    [HttpPut("{id}")]
    public Task<IActionResult> Update(string id, [FromBody] UserUpdateDto input) => SaveAsync(id, input);

    private async Task<IActionResult> SaveAsync(string? id, UserUpdateDto input)
    {
        var password = string.IsNullOrWhiteSpace(input.Password) ? null : input.Password;
        if (id is null && password is null)
            return BadRequest(new { message = "กรุณาระบุรหัสผ่าน" });

        if (password is not null && (password.Length < 6 || Encoding.UTF8.GetByteCount(password) > 72))
            return BadRequest(new { message = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษรและไม่เกิน 72 ไบต์" });

        await UserWrites.WaitAsync(HttpContext.RequestAborted);
        try
        {
            var user = id is null ? new User() : await repository.GetByIdAsync(id);
            if (user is null) return NotFound();

            var username = input.Username.Trim();
            var email = input.Email.Trim();
            var role = input.Role.Trim();
            if (!Roles.Contains(role) && (id is null || role != user.Role))
                return BadRequest(new { message = "บทบาทผู้ใช้ไม่ถูกต้อง" });

            if (username != user.Username && await repository.CheckUsernameExistsAsync(username, id))
                return Conflict(new { message = "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" });

            if (email != user.Email && await repository.CheckEmailExistsAsync(email, id))
                return Conflict(new { message = "อีเมลนี้ถูกใช้งานแล้ว" });

            var passwordHash = password is null ? null : BCrypt.Net.BCrypt.HashPassword(password);
            user.Username = username;
            user.Email = email;
            user.Name = input.Name.Trim();
            user.Role = role;

            if (id is null)
            {
                user.Password = passwordHash!;
                await repository.CreateAsync(user);
                return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
            }

            if (!await repository.UpdateAsync(id, user, passwordHash)) return NotFound();
            return NoContent();
        }
        catch (MongoWriteException exception) when (exception.WriteError.Category == ServerErrorCategory.DuplicateKey)
        {
            return Conflict(new { message = "ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานแล้ว" });
        }
        finally
        {
            UserWrites.Release();
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id) =>
        await repository.DeleteAsync(id) ? NoContent() : NotFound();
}
