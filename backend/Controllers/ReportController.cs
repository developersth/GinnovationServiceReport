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

    public ReportController(IProjectRepository projectRepo, IServiceReportRepository serviceRepo)
    {
        _projectRepo = projectRepo;
        _serviceRepo = serviceRepo;
    }

    [HttpGet("project/{projectId}/pdf")]
    public async Task<IActionResult> GetProjectServiceReport(string projectId)
    {
        // 1. ดึงข้อมูล Project จาก MongoDB
        var project = await _projectRepo.GetByIdAsync(projectId);
        if (project == null) return NotFound("Project not found");

        // 2. ดึง ServiceReports ทั้งหมดที่เชื่อมกับ ProjectId นี้
        // หมายเหตุ: คุณอาจต้องเพิ่ม Method ใน IServiceReportRepository 
        // เพื่อ Find By ProjectId (ดูวิธีแก้ในข้อถัดไป)
        var allReports = await _serviceRepo.GetAllAsync();
        var projectReports = allReports.Where(r => r.ProjectId == projectId)
                                       .OrderByDescending(r => r.ReportDate)
                                       .ToList();

        // 3. เตรียม ViewModel
        var viewModel = new ServiceReportViewModel
        {
            Project = project,
            Reports = projectReports
        };

        // 4. สร้าง PDF ด้วย QuestPDF
        var document = new ServiceReportDocument(viewModel);
        byte[] pdfBytes = document.GeneratePdf();

        // 5. ส่งไฟล์กลับไปที่ Browser/Client
        string fileName = $"ServiceReport_{project.Name.Replace(" ", "_")}.pdf";
        return File(pdfBytes, "application/pdf", fileName);
    }
}