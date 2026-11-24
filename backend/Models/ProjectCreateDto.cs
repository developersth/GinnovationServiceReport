using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class ProjectCreateDto
{
    [Required(ErrorMessage = "กรุณาระบุชื่อโครงการ")]
    [StringLength(100, ErrorMessage = "ชื่อโครงการต้องไม่เกิน 100 ตัวอักษร")]
    public string Name { get; set; } = string.Empty;

    public IFormFile? Image { get; set; }
    public bool RemoveImage { get; set; }

    [Required(ErrorMessage = "กรุณาระบุชื่อลูกค้า")]
    [StringLength(100, ErrorMessage = "ชื่อลูกค้าต้องไม่เกิน 100 ตัวอักษร")]
    public string CustomerName { get; set; } = string.Empty;
    [StringLength(200, ErrorMessage = "ที่อยู่ลูกค้าต้องไม่เกิน 200 ตัวอักษร")]
    public string? CustomerAddress { get; set; }
    [StringLength(100, ErrorMessage = "ชื่อผู้ติดต่อต้องไม่เกิน 100 ตัวอักษร")]
    public string? ContactPerson { get; set; }
    [StringLength(20, ErrorMessage = "เบอร์โทรต้องไม่เกิน 20 ตัวอักษร")]
    public string? Tel { get; set; }
    [StringLength(50, ErrorMessage = "เงื่อนไขบริการต้องไม่เกิน 50 ตัวอักษร")]
    public string? ServiceUnder { get; set; }
}
