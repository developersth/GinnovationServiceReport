using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class UserUpdateDto
{
    [Required(ErrorMessage = "กรุณาระบุชื่อผู้ใช้")]
    [StringLength(100, ErrorMessage = "ชื่อผู้ใช้ต้องไม่เกิน 100 ตัวอักษร")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "กรุณาระบุชื่อ")]
    [StringLength(200, ErrorMessage = "ชื่อต้องไม่เกิน 200 ตัวอักษร")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "กรุณาระบุอีเมล")]
    [EmailAddress(ErrorMessage = "รูปแบบอีเมลไม่ถูกต้อง")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "กรุณาระบุบทบาท")]
    public string Role { get; set; } = "viewer";

    public string? Password { get; set; }
}
