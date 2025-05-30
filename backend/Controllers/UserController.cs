using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public UserController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpGet]
        public async Task<ActionResult<List<User>>> Get()
        {
            var users = await _userRepository.GetAllAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> Get(string id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }

        [HttpPost]
        public async Task<ActionResult<User>> Create([FromBody] User user)
        {
            user.Id = null; // Ensure ID is not set by client

            if (await _userRepository.CheckUsernameExistsAsync(user.Username))
            {
                return Conflict(new { message = "Username already exists. Please choose a different username." });
            }

            if (await _userRepository.CheckEmailExistsAsync(user.Email))
            {
                return Conflict(new { message = "Email already registered. Please use a different email address." });
            }

            // Hash the password before saving
            user.Password = HashPassword(user.Password);

            await _userRepository.CreateAsync(user);
            return CreatedAtAction(nameof(Get), new { id = user.Id }, user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UserUpdateDto updatedUser)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingUser = await _userRepository.GetByIdAsync(id);
            if (existingUser == null)
            {
                return NotFound();
            }

            existingUser.Username = updatedUser.Username;
            existingUser.Name = updatedUser.Name;
            existingUser.Email = updatedUser.Email;
            existingUser.Role = updatedUser.Role;

            if (!string.IsNullOrWhiteSpace(updatedUser.Password))
            {
                existingUser.Password = HashPassword(updatedUser.Password);
            }

            await _userRepository.UpdateAsync(id, existingUser);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            await _userRepository.DeleteAsync(id);
            return NoContent();
        }

        // Helper function to hash password
        private string HashPassword(string plainPassword)
        {
            return BCrypt.Net.BCrypt.HashPassword(plainPassword);
        }
    }
}
