using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

public class ReportService
{
    public byte[] Generate(ReportDto data)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(20);

                // 🔹 HEADER
                page.Header().Row(row =>
                {
                    row.RelativeItem().Text("G Innovation Co.,Ltd.").Bold();
                    row.ConstantItem(150).AlignRight().Text("Service Report").Bold();
                });

                // 🔹 CONTENT
                page.Content().Column(col =>
                {
                    col.Spacing(10);

                    // INFO TABLE
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.ConstantColumn(120);
                            c.RelativeColumn();
                        });

                        void Cell(string t, string v)
                        {
                            table.Cell().Border(1).Padding(5).Text(t).Bold();
                            table.Cell().Border(1).Padding(5).Text(v ?? "-");
                        }

                        Cell("Project", data.Project);
                        Cell("Customer", data.Customer);
                        Cell("Address", data.Address);
                        Cell("Contact", data.ContactPerson);
                        Cell("Tel", data.ContactTel);
                    });

                    // DETAIL TABLE
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.ConstantColumn(80);
                            c.RelativeColumn();
                            c.RelativeColumn();
                            c.RelativeColumn();
                        });

                        table.Header(header =>
                        {
                            header.Cell().Border(1).Text("วันที่");
                            header.Cell().Border(1).Text("รายละเอียด");
                            header.Cell().Border(1).Text("สาเหตุ");
                            header.Cell().Border(1).Text("การแก้ไข");
                        });

                        foreach (var item in data.Items)
                        {
                            table.Cell().Border(1).Padding(5).Text(item.Date);
                            table.Cell().Border(1).Padding(5).Text(item.Detail);
                            table.Cell().Border(1).Padding(5).Text(item.Cause);
                            table.Cell().Border(1).Padding(5).Text(item.Solution);
                        }
                    });

                    // SIGN
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().AlignCenter().Column(c =>
                        {
                            c.Item().Height(40);
                            c.Item().LineHorizontal(1);
                            c.Item().Text("Customer Sign");
                        });

                        row.RelativeItem().AlignCenter().Column(c =>
                        {
                            c.Item().Height(40);
                            c.Item().LineHorizontal(1);
                            c.Item().Text("Report by");
                        });
                    });
                });

                // FOOTER
                page.Footer().AlignCenter().Text("G Innovation Co.,Ltd.");
            });
        }).GeneratePdf();
    }
}