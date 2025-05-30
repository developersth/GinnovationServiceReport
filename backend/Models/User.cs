using System;
using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models
{
    /// <summary>
    /// Represents a User entity in the system.
    /// </summary>
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = "viewer"; // e.g., "admin", "editor", "viewer"

        [MinLength(6, ErrorMessage = "Password must be at least 6 characters long.")]
        public string Password { get; set; } = string.Empty; // Store hashed password here
    }
}
