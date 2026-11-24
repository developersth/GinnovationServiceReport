public class ReportJobDetail
{
    // ข้อมูลพื้นฐานของใบงาน
    public string Id { get; set; }
    public DateTime ReportDate { get; set; }
    public string Complain { get; set; }
    public string CausesOfFailure { get; set; }
    public string ActionTaken { get; set; }
    public string ReportedBy { get; set; }
    public string Remark { get; set; }

    // สถานะการทำงาน (สำหรับ Checkbox)
    public bool IsCompleted { get; set; }
    public bool IsFollowUp { get; set; }

    // ส่วนข้อมูลเพิ่มเติมที่ดึงมาแสดงในหน้า Job Details
    public List<StaffWorkingTime> StaffTimes { get; set; } = new List<StaffWorkingTime>();
    
    // รายรายการ Path ของรูปภาพ (เช่น "uploads/reports/img01.jpg")
    public List<string> ImagePaths { get; set; } = new List<string>();
}