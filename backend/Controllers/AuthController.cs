using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Repositories;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AuthController(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }



        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequest)
        {
            var user = await _userRepository.GetByUserNameAsync(loginRequest.Username.Trim());
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            // Verify password
            bool validPassword = !string.IsNullOrWhiteSpace(user.Password) &&
                VerifyPassword(loginRequest.Password, user.Password);
            if (!validPassword)
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                token,
                username = user.Username,
                name = user.Name
            });
        }

        private static bool VerifyPassword(string password, string hash)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(password, hash);
            }
            catch (BCrypt.Net.SaltParseException)
            {
                return false;
            }
        }

        // Method to generate JWT token
        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey))
            {
                throw new InvalidOperationException("JWT key is not configured.");
            }
            var key = Encoding.ASCII.GetBytes(jwtKey);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id ?? ""),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role ?? "viewer")
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                Expires = DateTime.UtcNow.AddHours(2),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    // DTO for login request
    public class LoginRequestDto
    {
        [System.ComponentModel.DataAnnotations.Required]
        public string Username { get; set; } = string.Empty;

        [System.ComponentModel.DataAnnotations.Required]
        public string Password { get; set; } = string.Empty;
    }
}
