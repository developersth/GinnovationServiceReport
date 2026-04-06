using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using QuestPDF.Helpers;
using backend.Models;
using System.IO;

public class ServiceReportOneDocument : IDocument
{
    private readonly ServiceReportViewModel _model;

    private readonly IWebHostEnvironment _env;
    // รับ webRootPath เข้ามาเพื่อให้เข้าถึงไฟล์ images ได้แม่นยำ
    public ServiceReportOneDocument(ServiceReportViewModel model, IWebHostEnvironment env = null)
    {
        _model = model;
        _env = env;
    }

    private DateTime GetThaiTime(DateTime utcDate)
    {
        // สำหรับรันบน Mac/Linux/Docker ต้องใช้ ID: "Asia/Bangkok"
        // ถ้าบน Windows จะใช้ "SE Asia Standard Time"
        // แต่ .NET 6+ บน Mac/Linux ส่วนใหญ่รองรับ "Asia/Bangkok"
        try
        {
            var thaiZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Bangkok");
            return TimeZoneInfo.ConvertTimeFromUtc(utcDate.ToUniversalTime(), thaiZone);
        }
        catch
        {
            // Fallback กรณีหา TimeZone ไม่เจอ (เช่น รันบน Windows บาง version)
            return utcDate.AddHours(7);
        }
    }
    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.DefaultTextStyle(x => x.FontFamily("TH Sarabun New").FontSize(14));
            page.Margin(1, Unit.Centimetre);

            // หน้าแรก: Header (โชว์ครั้งเดียว) + ตารางสรุป
            page.Header().ShowOnce().Element(ComposeHeader);

            page.Content().Column(column =>
            {
                column.Item().Element(ComposeContent); // ตารางสรุปเดิม

                // แสดงรูปภาพทั้งหมดจากทุกงาน
                column.Item().Element(ComposeAllImages);

                // วนลูปสร้างหน้ารายละเอียดใบงาน (แสดงต่อเนื่องในหน้าเดียว)
                foreach (var report in _model.Reports)
                {
                    column.Item().Element(c => ComposeJobDetails(c, report));
                }

                // ลายเซ็นจะปรากฏต่อท้ายหน้ารายละเอียดสุดท้าย
                column.Item().Element(ComposeSignatures);
            });

            page.Footer().Element(ComposePageNumberAndAddress);
        });
    }

    void ComposeJobDetails(IContainer container, ServiceReport report)
    {
        container.Column(column =>
        {
            column.Spacing(10);
            column.Item().Text($"รายละเอียดการปฏิบัติงาน: {report.Id}").FontSize(16).SemiBold().Underline();

            // --- ส่วนที่ 1: Status & Info ---
            column.Item().Row(row =>
            {
                // Status of work (จำลอง Checkbox)
                row.RelativeItem().Column(c =>
                {
                    c.Item().Text("Status of work").SemiBold();
                    // c.Item().Text(report.IsCompleted ? "[✓] Completed" : "[ ] Completed");
                    // c.Item().Text(!report.IsCompleted ? "[✓] Follow-up" : "[ ] Follow-up");
                    c.Item().Text("[ ] Completed");
                    c.Item().Text("[ ] Follow-up");
                });

                // Reporter Info
                row.RelativeItem().Table(table =>
                {
                    table.ColumnsDefinition(cols => { cols.ConstantColumn(60); cols.RelativeColumn(); });
                    table.Cell().Text("Report by:"); table.Cell().Text(report.ReportedBy);
                    table.Cell().Text("Date:"); table.Cell().Text(GetThaiTime(report.ReportDate).ToString("dd/MM/yyyy"));
                });
            });

            // --- ส่วนที่ 2: Service Staff Working Time ---
            // Comment out for now - requires StaffTimes property in ServiceReport
            /*
            column.Item().Text("Service staff and working time").SemiBold();
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(cols =>
                {
                    cols.RelativeColumn(); // Name
                    cols.ConstantColumn(70); // Date
                    cols.ConstantColumn(50); // Start/End
                    cols.ConstantColumn(50);
                    cols.ConstantColumn(60); // Working Hrs
                });

                table.Header(h =>
                {
                    h.Cell().Element(HeaderStyle).Text("Engineer name");
                    h.Cell().Element(HeaderStyle).Text("Date");
                    h.Cell().Element(HeaderStyle).Text("Start");
                    h.Cell().Element(HeaderStyle).Text("End");
                    h.Cell().Element(HeaderStyle).Text("Hours");
                    static IContainer HeaderStyle(IContainer c) => c.Border(0.5f).AlignCenter().Background(Colors.Grey.Lighten4);
                });

                // ดึงข้อมูล Staff จาก Model (ถ้ามี)
                if (report.StaffTimes != null)
                {
                    foreach (var staff in report.StaffTimes)
                    {
                        table.Cell().Element(BodyStyle).Text(staff.EngineerName.ToString()); 
                        table.Cell().Element(BodyStyle).Text(staff.Date.ToString("dd/MM/yyyy")); 
                        table.Cell().Element(BodyStyle).AlignCenter().Text(staff.StartTime.ToString("HH:mm"));
                        table.Cell().Element(BodyStyle).AlignCenter().Text(staff.EndTime.ToString("HH:mm"));
                        table.Cell().Element(BodyStyle).AlignCenter().Text(staff.TravellingHours.ToString("N0"));
                    }
                }
                static IContainer BodyStyle(IContainer c) => c.Border(0.5f).PaddingHorizontal(5);
            });
            */

            // --- ส่วนที่ 3: ภาพถ่ายการปฏิบัติงาน ---
            // ย้ายไปแสดงรวมทั้งหมดก่อนรายละเอียดงาน
            /*
            if (report.ImagePaths != null && report.ImagePaths.Any())
            {
                column.Item().PaddingTop(10).Text("รูปภาพประกอบการปฏิบัติงาน").SemiBold();
                column.Item().Grid(grid =>
                {
                    grid.Columns(2); // แสดง 2 รูปต่อแถว
                    grid.Spacing(5);
                    foreach (var imgPath in report.ImagePaths)
                    {
                        var fullPath = Path.Combine(_env.WebRootPath, imgPath);
                        if (File.Exists(fullPath))
                            grid.Item().Image(fullPath).FitArea();
                    }
                });
            }
            */
        });
    }
    void ComposeSignatures(IContainer container)
    {
        container.PaddingTop(10).Column(column =>
        {
            column.Item().Row(row =>
            {
                // --- ฝั่งลูกค้า ---
                row.RelativeItem().Column(c =>
                {
                    c.Item().Width(170).Column(innerCol =>
                    {
                        innerCol.Item().PaddingTop(40).LineHorizontal(0.5f);
                        innerCol.Item().AlignCenter().PaddingTop(2).Text("Date:      /      /      ").FontSize(10);
                        innerCol.Item().AlignCenter().Text("Customer Sign").SemiBold();
                        innerCol.Item().AlignCenter().Text("(ผู้รับทราบผลการปฏิบัติงาน)").FontSize(10);
                    });
                });

                // --- ฝั่งเจ้าหน้าที่ ---
                row.RelativeItem().AlignRight().Column(c =>
                {
                    c.Item().Width(170).Column(innerCol =>
                    {
                        innerCol.Item().Height(40).AlignCenter().AlignBottom().Text("");
                        innerCol.Item().LineHorizontal(0.5f);
                        innerCol.Item().AlignCenter().PaddingTop(2).Text($"Date: {DateTime.Now:dd/MM/yyyy}").FontSize(10);
                        innerCol.Item().AlignCenter().Text("Report by").SemiBold();
                        innerCol.Item().AlignCenter().Text("(เจ้าหน้าที่บริการ)").FontSize(10);
                    });
                });
            });
        });
    }
    void ComposeHeader(IContainer container)
    {
        container.Column(column =>
        {
            // แถวที่ 1: Logo + ชื่อบริษัท + หัวข้อ Report
            column.Item().Row(row =>
            {
                // ฝั่งซ้าย: Logo และ ชื่อ
                row.RelativeItem().Row(logoAndName =>
                {
                    var logoPath = (_env?.WebRootPath != null)
                        ? Path.Combine(_env.WebRootPath, "images", "logo.png")
                        : string.Empty;

                    if (!string.IsNullOrEmpty(logoPath) && File.Exists(logoPath))
                    {
                        logoAndName.ConstantItem(50).Height(50).Image(logoPath);
                    }

                    logoAndName.RelativeItem().PaddingLeft(10).AlignMiddle().Text("G Innovation Co., Ltd.").FontSize(14).SemiBold();
                });

                // ฝั่งขวา: คำว่า Service Report
                row.ConstantItem(120).AlignRight().AlignMiddle().Text("Service Report").FontSize(18).SemiBold();
            });

            // เส้นคั่นกลาง
            column.Item().PaddingVertical(5).LineHorizontal(1).LineColor(Colors.Black);

            // ส่วนตารางข้อมูล (ปรับให้ใช้ความกว้างที่แน่นอนขึ้น)
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(100);
                    columns.RelativeColumn();
                });

                // ใช้ฟังก์ชันเดิมของคุณ
                AddInfoRow(table, "Project", _model.Project?.Name);
                AddInfoRow(table, "Customer", _model.Project?.CustomerName);
                AddInfoRow(table, "Address", _model.Project?.CustomerAddress);
                AddInfoRow(table, "Contact Person", _model.Project?.ContactPerson);
                AddInfoRow(table, "Contact Tel", _model.Project?.Tel);
                AddInfoRow(table, "Service under", _model.Project?.ServiceUnder);
            });

        });

    }
    void ComposePageNumberAndAddress(IContainer container)
    {
        container.Column(column =>
        {
            // เลขหน้า
            column.Item().PaddingTop(10).AlignCenter().Text(x =>
            {
                x.Span("Page ");
                x.CurrentPageNumber();
                x.Span(" / ");
                x.TotalPages();
            });

            // ส่วนท้ายสุด (ที่อยู่บริษัท)
            column.Item().PaddingTop(5).AlignCenter().Text("G INNOVATION CO., LTD. 238/5 Ratchadapisek Rd., Huai Khwang, Bangkok 10320")
                .FontSize(9).FontColor(Colors.Grey.Medium);
        });
    }
    void ComposeContent(IContainer container)
    {
        container.PaddingTop(15).Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.ConstantColumn(80);  // วันที่ (ปรับแคบลงหน่อย)
                columns.RelativeColumn(1.5f); // รายละเอียด
                columns.RelativeColumn();    // สาเหตุ
                columns.RelativeColumn();    // การแก้ไข
            });

            table.Header(header =>
            {
                header.Cell().Element(CellStyle).Text("วันที่");
                header.Cell().Element(CellStyle).Text("รายละเอียดที่แจ้ง");
                header.Cell().Element(CellStyle).Text("สาเหตุของปัญหา");
                header.Cell().Element(CellStyle).Text("การแก้ไข/ดำเนินการ");

                static IContainer CellStyle(IContainer container) =>
                    container.DefaultTextStyle(x => x.SemiBold()).Border(0.5f).AlignCenter().Padding(5).Background(Colors.Grey.Lighten4);
            });

            if (_model.Reports != null && _model.Reports.Any())
            {

                foreach (var report in _model.Reports)
                {
                    var localDate = GetThaiTime(report.ReportDate);
                    table.Cell().Element(ContentCellStyle).AlignCenter().Text(localDate.ToString("dd/MM/yyyy"));
                    table.Cell().Element(ContentCellStyle).Text(report.Complain);
                    table.Cell().Element(ContentCellStyle).Text(report.CausesOfFailure);
                    table.Cell().Element(ContentCellStyle).Text(report.ActionTaken);
                }
            }
            else
            {
                table.Cell().ColumnSpan(4).Element(ContentCellStyle).AlignCenter().Text("ไม่มีข้อมูลการปฏิบัติงาน");
            }

            static IContainer ContentCellStyle(IContainer container) =>
                container.Border(0.5f).Padding(5).ShowEntire();
        });
    }

    void ComposeAllImages(IContainer container)
    {
        if (_env?.WebRootPath == null)
            return;

        var allImages = _model.Reports
            .Where(r => r.ImagePaths != null)
            .SelectMany(r => r.ImagePaths)
            .Distinct()
            .ToList();

        if (allImages.Any())
        {
            container.PaddingTop(10).Column(col =>
            {
                col.Item().Text("รูปภาพประกอบการปฏิบัติงานทั้งหมด").FontSize(14).SemiBold();
                col.Item().PaddingTop(6).Grid(grid =>
                {
                    grid.Columns(4);
                    grid.Spacing(4);
                    foreach (var imgPath in allImages.Take(4)) // แสดงสูงสุด 4 ภาพ
                    {
                        var fullPath = Path.Combine(_env.WebRootPath, imgPath.TrimStart('/'));
                        if (File.Exists(fullPath))
                            grid.Item().Width(100).Height(100).AlignCenter().Image(fullPath).FitArea();
                    }
                });
            });
        }
    }

    void AddInfoRow(TableDescriptor table, string label, string value)
    {
        table.Cell().Border(0.5f).PaddingLeft(5).PaddingVertical(2).Text(label).SemiBold();
        table.Cell().Border(0.5f).PaddingLeft(5).PaddingVertical(2).Text(value ?? "-");
    }
}