namespace backend.Models
{
    public class ServiceReportDto
    {
        public string ReportedBy { get; set; } = string.Empty;
        public string Channel { get; set; } = string.Empty;
        public string Complain { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
        public string CausesOfFailure { get; set; } = string.Empty;
        public string ActionTaken { get; set; } = string.Empty;

        public string CreatedBy { get; set; } = string.Empty;
        public string UpdatedBy { get; set; } = string.Empty;

        // สำหรับเก็บชื่อไฟล์ / path รูปภาพหลายภาพ
        public List<string>? ImagePaths { get; set; }
    }
}
