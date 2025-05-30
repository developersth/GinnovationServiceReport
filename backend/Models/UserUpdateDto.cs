using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class UserUpdateDto
{

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
    public string Role { get; set; } = "viewer";

    public string? Password { get; set; } // nullable
}
