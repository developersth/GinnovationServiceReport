using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using QuestPDF.Helpers;
using backend.Models;

public class ServiceReportDocument : IDocument
{
    private readonly ServiceReportViewModel _model;

    public ServiceReportDocument(ServiceReportViewModel model)
    {
        _model = model;
    }

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
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
            column.Item().Row(row =>
            {
                row.RelativeItem().Text("G Innovation Co., Ltd.").FontSize(16).SemiBold();
                row.RelativeItem().AlignRight().Text("Service Report").FontSize(18).SemiBold();
            });

            column.Item().PaddingTop(10).LineHorizontal(1);

            column.Item().PaddingTop(10).Border(0.5f).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(120);
                    columns.RelativeColumn();
                });

                AddInfoRow(table, "Project", _model.Project.Name);
                AddInfoRow(table, "Customer", _model.Project.CustomerName);
                AddInfoRow(table, "Address", _model.Project.CustomerAddress);
                AddInfoRow(table, "Contact Person", _model.Project.ContactPerson);
                AddInfoRow(table, "Contact Tel", _model.Project.Tel);
                AddInfoRow(table, "Service under", _model.Project.ServiceUnder);
            });
        });
    }

    void ComposeContent(IContainer container)
    {
        container.PaddingTop(15).Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.ConstantColumn(90);  // วันที่
                columns.RelativeColumn();    // รายละเอียด
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
                    container.DefaultTextStyle(x => x.SemiBold()).Border(0.5f).AlignCenter().Padding(5);
            });

            // วนลูปจากข้อมูลใน MongoDB
            foreach (var report in _model.Reports)
            {
                table.Cell().Element(ContentCellStyle).Text(report.ReportDate.ToString("dd/MM/yyyy"));
                table.Cell().Element(ContentCellStyle).Text(report.Details);
                table.Cell().Element(ContentCellStyle).Text(report.CausesOfFailure);
                table.Cell().Element(ContentCellStyle).Text(report.ActionTaken);
            }

            static IContainer ContentCellStyle(IContainer container) => 
                container.Border(0.5f).Padding(5).ShowEntire();
        });
    }

    void ComposeFooter(IContainer container)
    {
        container.Column(column => 
        {
            column.Item().PaddingTop(20).Row(row =>
            {
                row.RelativeItem().Column(c => {
                    c.Item().PaddingTop(40).Width(150).LineHorizontal(0.5f);
                    c.Item().AlignCenter().Width(150).Text("Customer Sign");
                });
                
                row.RelativeItem().AlignRight().Column(c => {
                    // ดึงชื่อคนทำ Report จากข้อมูลล่าสุด หรือตัวแปรที่ต้องการ
                    c.Item().AlignCenter().Width(150).Text(_model.Reports.FirstOrDefault()?.ReportedBy ?? "");
                    c.Item().Width(150).LineHorizontal(0.5f);
                    c.Item().AlignCenter().Width(150).Text("Report by");
                });
            });
        });
    }

    void AddInfoRow(TableDescriptor table, string label, string value)
    {
        table.Cell().Border(0.5f).PaddingLeft(5).PaddingVertical(2).Text(label).SemiBold();
        table.Cell().Border(0.5f).PaddingLeft(5).PaddingVertical(2).Text(value ?? "-");
    }
}