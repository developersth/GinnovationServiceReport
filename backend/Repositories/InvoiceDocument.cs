using backend.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

public class InvoiceDocument : IDocument
{
    private readonly InvoiceModel _model;

    public InvoiceDocument(InvoiceModel model)
    {
        _model = model;
    }

    public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.Margin(20);

            page.Header().Text($"Invoice: {_model.InvoiceNo}")
                .SemiBold().FontSize(20).AlignCenter();

            page.Content().PaddingVertical(10).Column(col =>
            {
                col.Spacing(10);

                col.Item().Text($"Customer: {_model.CustomerName}");
                col.Item().Text($"Date: {_model.Date:dd/MM/yyyy}");

                col.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(4);
                        columns.RelativeColumn(1);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                    });

                    // Header
                    table.Header(header =>
                    {
                        header.Cell().Text("Item").Bold();
                        header.Cell().Text("Qty").Bold();
                        header.Cell().Text("Price").Bold();
                        header.Cell().Text("Total").Bold();
                    });

                    // Rows
                    foreach (var item in _model.Items)
                    {
                        table.Cell().Text(item.Name);
                        table.Cell().Text(item.Qty.ToString());
                        table.Cell().Text(item.Price.ToString("N2"));
                        table.Cell().Text((item.Qty * item.Price).ToString("N2"));
                    }
                });

                // Total
                var total = _model.Items.Sum(x => x.Price * x.Qty);

                col.Item().AlignRight().Text($"Total: {total:N2} THB")
                    .Bold().FontSize(14);
            });

            page.Footer()
                .AlignCenter()
                .Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                });
        });
    }
}