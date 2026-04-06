using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using QuestPDF.Helpers;
using backend.Models;
using System.IO;

public class ServiceReportDocument : IDocument
{
    private readonly ServiceReportViewModel _model;

    private readonly IWebHostEnvironment _env;
    // รับ webRootPath เข้ามาเพื่อให้เข้าถึงไฟล์ images ได้แม่นยำ
    public ServiceReportDocument(ServiceReportViewModel model, IWebHostEnvironment env = null)
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
            // แนะนำFontSize 12-14 สำหรับ TH Sarabun จะอ่านง่ายพอดี
            page.DefaultTextStyle(x => x.FontFamily("TH Sarabun New").FontSize(14));
            page.Margin(1, Unit.Centimetre);

            page.Header().Element(ComposeHeader);
            page.Content().Element(ComposeContent);
            page.Footer().Element(ComposeFooter);
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
                    table.Cell().Element(ContentCellStyle).Text(report.Details);
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

    void ComposeFooter(IContainer container)
    {
        container.Column(column =>
        {
            column.Item().PaddingTop(30).Row(row =>
            {
                // --- ฝั่งลูกค้า (ชิดซ้ายของหน้ากระดาษ) ---
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

                // --- ฝั่งเจ้าหน้าที่ (ชิดขวาของหน้ากระดาษ) ---
                row.RelativeItem().AlignRight().Column(c =>
                {
                    c.Item().Width(170).Column(innerCol =>
                    {
                        // ถ้าต้องการโชว์ชื่อคนทำ Report เหนือเส้น (เหมือนต้นฉบับ)
                        //innerCol.Item().Height(40).AlignCenter().AlignBottom().Text(_model.Reports?.FirstOrDefault()?.ReportedBy ?? "Kritsadee Satewin");
                        innerCol.Item().Height(40).AlignCenter().AlignBottom().Text("");
                        innerCol.Item().LineHorizontal(0.5f);
                        innerCol.Item().AlignCenter().PaddingTop(2).Text($"Date: {DateTime.Now:dd/MM/yyyy}").FontSize(10);
                        innerCol.Item().AlignCenter().Text("Report by").SemiBold();
                        innerCol.Item().AlignCenter().Text("(เจ้าหน้าที่บริการ)").FontSize(10);
                    });
                });
            });

            // เลขหน้า
            column.Item().PaddingTop(10).AlignCenter().Text(x =>
            {
                x.Span("Page ");
                x.CurrentPageNumber();
                x.Span(" / ");
                x.TotalPages();
            });

            // ส่วนท้ายสุด (ที่อยู่บริษัท)
            column.Item().PaddingTop(5).AlignCenter().Text("G INNOVATION CO., LTD. 238/5 Ratchadapisek Rd., Huai Khwang, Bangkok 10320").FontSize(9).FontColor(Colors.Grey.Medium);
        });
    }

    void AddInfoRow(TableDescriptor table, string label, string value)
    {
        table.Cell().Border(0.5f).PaddingLeft(5).PaddingVertical(2).Text(label).SemiBold();
        table.Cell().Border(0.5f).PaddingLeft(5).PaddingVertical(2).Text(value ?? "-");
    }
}