using System.Globalization;
using backend.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

public enum ServiceReportDocumentFormat
{
    Summary,
    WithJobDetails,
    Single
}

public class ServiceReportDocument(
    ServiceReportViewModel model,
    IWebHostEnvironment? environment = null,
    ServiceReportDocumentFormat format = ServiceReportDocumentFormat.Summary) : IDocument
{
    private const string Green = "#176443";
    private const string Red = "#BC2629";
    private const string Ink = "#162825";
    private const string Muted = "#526760";
    private const string Line = "#CAD9D2";
    private const string Surface = "#EFF5F2";
    private static readonly CultureInfo Culture = CultureInfo.InvariantCulture;

    public void Compose(IDocumentContainer container)
    {
        var logo = ReadImage("images/logo.png");
        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.Margin(32);
            page.DefaultTextStyle(style => style.FontFamily("TH Sarabun New").FontSize(15).FontColor(Ink));
            page.Header().Element(header => ComposeHeader(header, logo));
            page.Footer().Element(ComposeFooter);
            page.Content().PaddingTop(12).Column(column =>
            {
                column.Spacing(12);
                column.Item().Element(ComposeProject);

                if (format != ServiceReportDocumentFormat.Single)
                    column.Item().Element(ComposeSummary);

                if (format != ServiceReportDocumentFormat.Summary)
                {
                    foreach (var report in model.Reports)
                        column.Item().EnsureSpace(140).Element(item => ComposeJobDetails(item, report));
                }

                column.Item().ShowEntire().Element(ComposeSignatures);
            });
        });
    }

    private void ComposeHeader(IContainer container, Image? logo)
    {
        var label = format switch
        {
            ServiceReportDocumentFormat.Single => "รายงานการบริการ",
            ServiceReportDocumentFormat.WithJobDetails => "รายงานสรุปพร้อมรายละเอียดงาน",
            _ => "รายงานสรุปการบริการ"
        };

        container.BorderBottom(1.2f).BorderColor(Green).PaddingBottom(8).Row(row =>
        {
            row.Spacing(10);
            if (logo is not null)
                row.ConstantItem(64).Height(38).AlignMiddle().Image(logo).FitArea();

            row.RelativeItem().AlignMiddle().Column(column =>
            {
                column.Item().Text("G INNOVATION CO., LTD.").FontSize(17).SemiBold().FontColor(Green);
                column.Item().Text("SERVICE REPORT").FontSize(11).FontColor(Muted);
            });
            row.RelativeItem().AlignMiddle().AlignRight().Text(label).FontSize(22).SemiBold();
        });
    }

    private void ComposeProject(IContainer container)
    {
        var project = model.Project;
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.ConstantColumn(114);
                columns.RelativeColumn();
            });
            AddInfoRow(table, "โครงการ / Project", project.Name);
            AddInfoRow(table, "ลูกค้า / Customer", project.CustomerName);
            AddInfoRow(table, "ที่อยู่ / Address", project.CustomerAddress);
            AddInfoRow(table, "ผู้ติดต่อ / Contact", project.ContactPerson);
            AddInfoRow(table, "โทรศัพท์ / Tel.", project.Tel);
            AddInfoRow(table, "การบริการ / Service", project.ServiceUnder);
        });
    }

    private void ComposeSummary(IContainer container)
    {
        container.Column(column =>
        {
            column.Spacing(5);
            column.Item().Text($"สรุปรายการ ({model.Reports.Count} รายงาน)").FontSize(18).SemiBold().FontColor(Green);
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(67);
                    columns.RelativeColumn(1.35f);
                    columns.RelativeColumn();
                    columns.RelativeColumn();
                });
                table.Header(header =>
                {
                    foreach (var title in new[] { "วันที่", "เรื่องที่แจ้ง", "สาเหตุ", "การแก้ไข / ดำเนินการ" })
                        header.Cell().Element(HeadingCell).Text(title);
                });

                foreach (var report in model.Reports)
                {
                    table.Cell().Element(DataCell).Text(FormatDate(report.ReportDate));
                    table.Cell().Element(DataCell).Text(ShowValue(report.Complain));
                    table.Cell().Element(DataCell).Text(ShowValue(report.CausesOfFailure));
                    table.Cell().Element(DataCell).Text(ShowValue(report.ActionTaken));
                }

                if (model.Reports.Count == 0)
                    table.Cell().ColumnSpan(4).Element(DataCell).Text("ไม่มีข้อมูลการปฏิบัติงาน");
            });
        });
    }

    private void ComposeJobDetails(IContainer container, ServiceReport report)
    {
        container.Column(column =>
        {
            column.Spacing(8);
            column.Item().BorderLeft(3).BorderColor(Red).Background(Surface).Padding(7).Row(row =>
            {
                row.RelativeItem().Text("รายละเอียดการปฏิบัติงาน").FontSize(18).SemiBold().FontColor(Green);
                row.RelativeItem().AlignRight().Text(ShowValue(report.Id)).FontColor(Muted);
            });
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(114);
                    columns.RelativeColumn();
                });
                AddInfoRow(table, "วันที่แจ้ง", FormatDate(report.ReportDate, "dd/MM/yyyy HH:mm"));
                AddInfoRow(table, "ผู้แจ้ง", report.ReportedBy);
                AddInfoRow(table, "ช่องทาง", report.Channel);
                AddInfoRow(table, "สถานะ", report.Status);
                AddInfoRow(table, "เรื่องที่แจ้ง", report.Complain);
                AddInfoRow(table, "รายละเอียดงาน", report.Details);
                AddInfoRow(table, "สาเหตุของปัญหา", report.CausesOfFailure);
                AddInfoRow(table, "การแก้ไข / ดำเนินการ", report.ActionTaken);
            });
            column.Item().EnsureSpace(78).Element(item => ComposeStaff(item, report));
            column.Item().Element(item => ComposeImages(item, report));
        });
    }

    private static void ComposeStaff(IContainer container, ServiceReport report)
    {
        var staff = report.StaffWorkingTime?.OfType<StaffWorkingTime>().ToArray() ?? [];
        container.Column(column =>
        {
            column.Spacing(5);
            column.Item().Text("เจ้าหน้าที่และเวลาปฏิบัติงาน").FontSize(17).SemiBold().FontColor(Green);
            if (staff.Length == 0)
            {
                column.Item().Text("ไม่มีข้อมูลเวลาปฏิบัติงาน").FontColor(Muted);
                return;
            }

            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(1.1f);
                    columns.ConstantColumn(72);
                    columns.ConstantColumn(76);
                    columns.ConstantColumn(83);
                    columns.RelativeColumn(1.15f);
                });
                table.Header(header =>
                {
                    foreach (var title in new[] { "เจ้าหน้าที่", "วันที่", "เริ่ม / สิ้นสุด", "ทำงาน / เดินทาง (ชม.)", "รายละเอียด" })
                        header.Cell().Element(HeadingCell).Text(title);
                });
                foreach (var entry in staff)
                {
                    table.Cell().Element(DataCell).Text(ShowValue(entry.EngineerName));
                    table.Cell().Element(DataCell).Text(FormatDate(entry.WorkingDate));
                    table.Cell().Element(DataCell).Text($"{ShowValue(entry.StartTime)} / {ShowValue(entry.EndTime)}");
                    table.Cell().Element(DataCell)
                        .Text(FormattableString.Invariant($"{entry.WorkingHours:0.##} / {entry.TravellingHours:0.##}"));
                    table.Cell().Element(DataCell).Column(details =>
                    {
                        details.Item().Text(ShowValue(entry.Description));
                        details.Item().Text(entry.IsCharging ? "คิดค่าบริการ" : "ไม่คิดค่าบริการ").FontColor(Muted);
                    });
                }
            });
        });
    }

    private void ComposeImages(IContainer container, ServiceReport report)
    {
        var attachments = report.ImagePaths?.Where(path => !string.IsNullOrWhiteSpace(path)).ToArray() ?? [];
        container.EnsureSpace(attachments.Length == 0 ? 40 : 205).Column(column =>
        {
            column.Spacing(6);
            column.Item().Text("รูปภาพประกอบ").FontSize(17).SemiBold().FontColor(Green);

            if (attachments.Length == 0)
            {
                column.Item().Text("ไม่มีรูปแนบ").FontColor(Muted);
                return;
            }

            var number = 0;
            foreach (var row in attachments.Chunk(2))
            {
                column.Item().ShowEntire().Row(grid =>
                {
                    grid.Spacing(8);
                    foreach (var path in row)
                    {
                        var image = ReadImage(path);
                        var figure = ++number;
                        grid.RelativeItem().Border(0.6f).BorderColor(Line).Padding(6).Column(cell =>
                        {
                            var imageArea = cell.Item().Height(150).Background(Surface).Padding(5).AlignCenter().AlignMiddle();
                            if (image is not null)
                                imageArea.Image(image).FitArea();
                            else
                                imageArea.Text("ไม่สามารถเปิดรูปแนบได้").FontColor(Muted);

                            cell.Item().PaddingTop(3).AlignCenter().Text($"รูปแนบ {figure}").FontColor(Muted);
                        });
                    }

                    if (row.Length == 1)
                        grid.RelativeItem();
                });
            }
        });
    }

    private Image? ReadImage(string path)
    {
        if (environment is null)
            return null;

        var relativePath = path.Replace('\\', '/').TrimStart('/');
        if (!relativePath.StartsWith("images/", StringComparison.OrdinalIgnoreCase) ||
            relativePath.Split('/').Any(part => part is "." or ".."))
            return null;

        try
        {
            var file = environment.WebRootFileProvider.GetFileInfo(relativePath);
            if (!file.Exists || file.IsDirectory)
                return null;

            using var stream = file.CreateReadStream();
            return Image.FromStream(stream);
        }
        catch (Exception exception) when (exception is not OutOfMemoryException and not OperationCanceledException)
        {
            // Missing, unreadable and unsupported historical attachments all get a visible placeholder.
            return null;
        }
    }

    private static void ComposeSignatures(IContainer container)
    {
        container.PaddingTop(14).Row(row =>
        {
            row.Spacing(40);
            row.RelativeItem().Element(item => Signature(item, "ผู้รับทราบผลการปฏิบัติงาน"));
            row.RelativeItem().Element(item => Signature(item, "เจ้าหน้าที่บริการ"));
        });
    }

    private static void Signature(IContainer container, string label)
    {
        container.Column(column =>
        {
            column.Item().PaddingTop(36).LineHorizontal(0.7f).LineColor(Line);
            column.Item().AlignCenter().Text(label).SemiBold();
            column.Item().AlignCenter().Text("วันที่ ______ / ______ / ______").FontColor(Muted);
        });
    }

    private static void ComposeFooter(IContainer container)
    {
        container.BorderTop(0.7f).BorderColor(Line).PaddingTop(5).Row(row =>
        {
            row.RelativeItem().Text("G INNOVATION CO., LTD.  |  238/5 Ratchadapisek Rd., Huai Khwang, Bangkok 10320")
                .FontSize(11).FontColor(Muted);
            row.ConstantItem(75).AlignRight().Text(text =>
            {
                text.Span("หน้า ");
                text.CurrentPageNumber();
                text.Span(" / ");
                text.TotalPages();
            });
        });
    }

    private static void AddInfoRow(TableDescriptor table, string label, string? value)
    {
        table.Cell().Element(HeadingCell).Text(label);
        table.Cell().Element(DataCell).Text(ShowValue(value));
    }

    private static IContainer HeadingCell(IContainer box) =>
        DataCell(box).Background(Surface).DefaultTextStyle(style => style.SemiBold().FontColor(Green));

    private static IContainer DataCell(IContainer box) =>
        box.BorderBottom(0.5f).BorderColor(Line).PaddingHorizontal(6).PaddingVertical(3);

    private static string ShowValue(string? value) => string.IsNullOrWhiteSpace(value) ? "-" : value;

    private static string FormatDate(DateTime value, string format = "dd/MM/yyyy") =>
        value == default ? "-" : ThaiTime(value).ToString(format, Culture);

    internal static DateTime ThaiTime(DateTime value)
    {
        var utc = value.Kind == DateTimeKind.Local ? value.ToUniversalTime() : DateTime.SpecifyKind(value, DateTimeKind.Utc);
        return new DateTimeOffset(utc).ToOffset(TimeSpan.FromHours(7)).DateTime;
    }
}
