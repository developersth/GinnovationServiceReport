using System;
using System.ComponentModel.DataAnnotations; // For data annotations if needed

namespace backend.Models // Changed namespace to backend.Models
{
    /// <summary>
    /// Represents a User entity in the system.
    /// (Based on previous frontend discussions, useful for a complete API)
    /// </summary>
    public class User
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        [Required]
        [EmailAddress] // Optional: Data annotation for email format validation
        public string Email { get; set; } = string.Empty;
        [Required]
        public string Role { get; set; } = "viewer"; // e.g., "admin", "editor", "viewer"
    }
}
