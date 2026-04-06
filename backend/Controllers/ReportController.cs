using Microsoft.AspNetCore.Mvc;
using backend.Repositories;
using backend.Models;
using QuestPDF.Fluent;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportController : ControllerBase
{
    private readonly IProjectRepository _projectRepo;
    private readonly IServiceReportRepository _serviceRepo;
    private readonly IWebHostEnvironment _env;

    public ReportController(IProjectRepository projectRepo, IServiceReportRepository serviceRepo, IWebHostEnvironment env)
    {
        _projectRepo = projectRepo;
        _serviceRepo = serviceRepo;
        _env = env;
    }
    [HttpPost("GenerateServiceReport/pdf")]
    public async Task<IActionResult> GenerateServiceReport([FromBody] GenerateReportRequest request)
    {
        // 1. ดึงข้อมูล Project
        var project = await _projectRepo.GetByIdAsync(request.ProjectId);
        if (project == null) return NotFound("Project not found");

        // 2. ดึงเฉพาะ ServiceReports ที่มี ID อยู่ใน list ที่ส่งมา
        // วิธีที่มีประสิทธิภาพที่สุดคือใช้ Filter Definition ของ MongoDB
        var allReports = await _serviceRepo.GetAllAsync(); // หรือใช้ Repo เฉพาะทางจะดีกว่า
        var selectedReports = allReports
            .Where(r => request.ServiceReportIds.Contains(r.Id!) && r.ProjectId == request.ProjectId)
            .OrderByDescending(r => r.ReportDate)
            .ToList();

        if (!selectedReports.Any()) return NotFound("No service reports found for the provided IDs");

        // 3. เตรียม ViewModel
        var viewModel = new ServiceReportViewModel
        {
            Project = project,
            Reports = selectedReports
        };

        // 4. สร้าง PDF
        var document = new ServiceReportDocument(viewModel, _env);
        byte[] pdfBytes = document.GeneratePdf();

        // 5. ตั้งชื่อไฟล์พร้อม Timestamp
        string timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
        string fileName = $"ServiceReport_{project.Name.Replace(" ", "_")}_{timestamp}.pdf";

        return File(pdfBytes, "application/pdf", fileName);
    }
    [HttpPost("GenerateServiceReportJobDetails/pdf")]
    public async Task<IActionResult> GenerateServiceReportJobDetails([FromBody] GenerateReportRequest request)
    {
        // 1. ดึงข้อมูล Project
        var project = await _projectRepo.GetByIdAsync(request.ProjectId);
        if (project == null) return NotFound("Project not found");

        // 2. ดึงเฉพาะ ServiceReports ที่มี ID อยู่ใน list ที่ส่งมา
        // วิธีที่มีประสิทธิภาพที่สุดคือใช้ Filter Definition ของ MongoDB
        var allReports = await _serviceRepo.GetAllAsync(); // หรือใช้ Repo เฉพาะทางจะดีกว่า
        var selectedReports = allReports
            .Where(r => request.ServiceReportIds.Contains(r.Id!) && r.ProjectId == request.ProjectId)
            .OrderByDescending(r => r.ReportDate)
            .ToList();

        if (!selectedReports.Any()) return NotFound("No service reports found for the provided IDs");

        // 3. เตรียม ViewModel
        var viewModel = new ServiceReportViewModel
        {
            Project = project,
            Reports = selectedReports
        };

        // 4. สร้าง PDF
        var document = new ServiceReportOneDocument(viewModel, _env);
        byte[] pdfBytes = document.GeneratePdf();

        // 5. ตั้งชื่อไฟล์พร้อม Timestamp
        string timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
        string fileName = $"ServiceReportDetails_{project.Name.Replace(" ", "_")}_{timestamp}.pdf";

        return File(pdfBytes, "application/pdf", fileName);
    }
}