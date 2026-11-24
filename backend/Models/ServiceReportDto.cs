using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class ServiceReportDto
    {

        [Required(ErrorMessage = "กรุณาเลือกโครงการ")]
        public string ProjectId { get; set; } = string.Empty;
        [Required(ErrorMessage = "กรุณาระบุผู้แจ้ง")]
        [StringLength(100, ErrorMessage = "ชื่อผู้แจ้งต้องไม่เกิน 100 ตัวอักษร")]
        public string ReportedBy { get; set; } = string.Empty;
        [Required(ErrorMessage = "กรุณาระบุช่องทางรับแจ้ง")]
        [StringLength(50, ErrorMessage = "ช่องทางรับแจ้งต้องไม่เกิน 50 ตัวอักษร")]
        public string Channel { get; set; } = string.Empty;
        [Required(ErrorMessage = "กรุณาระบุอาการหรือปัญหาที่แจ้ง")]
        public string Complain { get; set; } = string.Empty;
        [DisplayFormat(ConvertEmptyStringToNull = false)]
        public string? Details { get; set; }
        public string? CausesOfFailure { get; set; }
        public string? ActionTaken { get; set; }
        [Required(ErrorMessage = "กรุณาระบุสถานะรายงาน")]
        [StringLength(20, ErrorMessage = "สถานะต้องไม่เกิน 20 ตัวอักษร")]
        public string Status { get; set; } = "Open";
        [Required(ErrorMessage = "กรุณาระบุวันที่รายงาน")]
        public DateTimeOffset? ReportDate { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }

        // สำหรับเก็บชื่อไฟล์ / path รูปภาพหลายภาพ
        public List<string>? ExistingImagePathsToKeep { get; set; }
        public bool ReplaceExistingImages { get; set; }

        public List<StaffWorkingTime>? StaffWorkingTime { get; set; }
    }
}
