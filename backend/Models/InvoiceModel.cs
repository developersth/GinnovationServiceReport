using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class InvoiceModel
    {
        public string InvoiceNo { get; set; }
        public DateTime Date { get; set; }
        public string CustomerName { get; set; }
        public List<InvoiceItem> Items { get; set; }
    }

    public class InvoiceItem
    {
        public string Name { get; set; }
        public int Qty { get; set; }
        public decimal Price { get; set; }
    }
}