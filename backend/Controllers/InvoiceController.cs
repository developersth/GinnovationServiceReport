using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;
using backend.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using QuestPDF.Fluent;
namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class InvoiceController : ControllerBase
    {
        private readonly ILogger<InvoiceController> _logger;
        private readonly IProjectRepository _projectRepository;
        private readonly IServiceReportRepository _serviceReportRepository;

        public InvoiceController(ILogger<InvoiceController> logger, IProjectRepository projectRepository, IServiceReportRepository serviceReportRepository)
        {
            _logger = logger;
            _projectRepository = projectRepository;
            _serviceReportRepository = serviceReportRepository;
        }
        [HttpGet("invoice")]
        public IActionResult GetInvoice()
        {
            var model = new InvoiceModel
            {
                InvoiceNo = "INV-001",
                Date = DateTime.Now,
                CustomerName = "Kittadee",
                Items = new List<InvoiceItem>
            {
                new InvoiceItem { Name = "Product A", Qty = 2, Price = 150 },
                new InvoiceItem { Name = "Product B", Qty = 1, Price = 300 }
            }
            };

            var document = new InvoiceDocument(model);
            var pdf = document.GeneratePdf();

            return File(pdf, "application/pdf", "invoice.pdf");
        }
        [HttpGet("get-report-pdf/{projectId}")]
        public async Task<byte[]> GenerateReportPdf(string projectId)
        {
            // 1. ดึงข้อมูลโปรเจกต์
            var project = await _projectRepository.GetByIdAsync(projectId);
            if (project == null) throw new Exception("Project not found");

            // 2. ดึงรายการ Report ทั้งหมดของโปรเจกต์นั้น
            var reports = await _serviceReportRepository.GetAllAsync();
            reports = reports.Where(r => r.ProjectId == projectId).ToList();    

            // 3. รวมข้อมูลเข้า ViewModel
            var viewModel = new ServiceReportViewModel
            {
                Project = project,
                Reports = reports
            };

            // 4. สร้าง PDF
            var document = new ServiceReportDocument(viewModel);
            return document.GeneratePdf();
        }

    }
}