using backend.Models;
using backend.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using QuestPDF.Fluent;

namespace backend.Controllers;

[ApiController]
[Authorize]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
[Route("api/Report")]
[Route("api/Reports")]
public class ReportController(
    IProjectRepository projectRepository,
    IServiceReportRepository serviceReportRepository,
    IWebHostEnvironment environment,
    ILogger<ReportController> logger) : ControllerBase
{
    [HttpGet("service-report/{id}/pdf")]
    public Task<IActionResult> GenerateSingleServiceReport(string id, CancellationToken cancellationToken) =>
        ExecuteExportAsync(
            () => GenerateSingleReport(id, cancellationToken), ServiceReportDocumentFormat.Single, cancellationToken);

    [HttpPost("GenerateServiceReport/pdf")]
    public Task<IActionResult> GenerateServiceReport(
        [FromBody] GenerateReportRequest request, CancellationToken cancellationToken) =>
        ExecuteExportAsync(
            () => GenerateCombinedReport(request, ServiceReportDocumentFormat.Summary, cancellationToken),
            ServiceReportDocumentFormat.Summary, cancellationToken);

    [HttpPost("GenerateServiceReportJobDetails/pdf")]
    public Task<IActionResult> GenerateServiceReportJobDetails(
        [FromBody] GenerateReportRequest request, CancellationToken cancellationToken) =>
        ExecuteExportAsync(
            () => GenerateCombinedReport(request, ServiceReportDocumentFormat.WithJobDetails, cancellationToken),
            ServiceReportDocumentFormat.WithJobDetails, cancellationToken);

    private async Task<IActionResult> ExecuteExportAsync(
        Func<Task<IActionResult>> export, ServiceReportDocumentFormat format, CancellationToken cancellationToken)
    {
        try
        {
            cancellationToken.ThrowIfCancellationRequested();
            var result = await export();
            cancellationToken.ThrowIfCancellationRequested();
            return result;
        }
        catch (Exception exception) when (!cancellationToken.IsCancellationRequested)
        {
            logger.LogError(exception, "Failed to generate a {ReportFormat} service report PDF.", format);
            return Problem(
                statusCode: StatusCodes.Status500InternalServerError,
                title: "สร้างรายงาน PDF ไม่สำเร็จ",
                detail: "ไม่สามารถสร้างรายงาน PDF ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
        }
    }

    private async Task<IActionResult> GenerateSingleReport(string id, CancellationToken cancellationToken)
    {
        if (!ObjectId.TryParse(id, out var reportId))
            return Problem(statusCode: 400, detail: "รหัสรายงานไม่ถูกต้อง");

        var report = await serviceReportRepository.GetByIdAsync(reportId.ToString());
        if (report is null)
            return Problem(statusCode: 404, detail: "ไม่พบรายงานที่ระบุ");

        // Historical reports can reference a project that was deleted before deletion was guarded.
        Project? project = null;
        if (ObjectId.TryParse(report.ProjectId, out var projectId))
            project = await projectRepository.GetByIdAsync(projectId.ToString());

        project ??= new Project { Name = report.ProjectId ?? string.Empty };

        cancellationToken.ThrowIfCancellationRequested();
        var date = ServiceReportDocument.ThaiTime(report.ReportDate);
        var filename = FormattableString.Invariant($"ServiceReport_{date:yyyyMMdd}_{reportId}.pdf");
        return RenderPdf(project, [report], ServiceReportDocumentFormat.Single, filename);
    }

    private async Task<IActionResult> GenerateCombinedReport(
        GenerateReportRequest request, ServiceReportDocumentFormat format, CancellationToken cancellationToken)
    {
        if (!ObjectId.TryParse(request.ProjectId, out var projectObjectId))
            return Problem(statusCode: 400, detail: "รหัสโครงการไม่ถูกต้อง");

        if (request.ServiceReportIds is not { Count: > 0 })
            return Problem(statusCode: 400, detail: "กรุณาเลือกรายงานอย่างน้อยหนึ่งรายการ");

        var ids = new HashSet<string>(StringComparer.Ordinal);
        foreach (var id in request.ServiceReportIds)
        {
            if (!ObjectId.TryParse(id, out var reportId))
                return Problem(statusCode: 400, detail: "รหัสรายงานอย่างน้อยหนึ่งรายการไม่ถูกต้อง");

            ids.Add(reportId.ToString());
        }

        var projectId = projectObjectId.ToString();
        var project = await projectRepository.GetByIdAsync(projectId);
        if (project is null)
            return Problem(statusCode: 404, detail: "ไม่พบโครงการที่ระบุ");

        var reports = await serviceReportRepository.GetByProjectAndIdsAsync(projectId, ids, cancellationToken);
        var unavailableIds = ids.Except(reports.Select(report => report.Id).OfType<string>(), StringComparer.Ordinal).ToArray();
        if (unavailableIds.Length > 0)
            return await InvalidReportSelection(unavailableIds, cancellationToken);

        cancellationToken.ThrowIfCancellationRequested();
        var prefix = format == ServiceReportDocumentFormat.WithJobDetails ? "ServiceReportDetails" : "ServiceReport";
        var now = ServiceReportDocument.ThaiTime(DateTime.UtcNow);
        var filename = FormattableString.Invariant($"{prefix}_{projectId}_{now:yyyyMMdd_HHmmss}.pdf");
        return RenderPdf(project, reports, format, filename);
    }

    private async Task<IActionResult> InvalidReportSelection(string[] unavailableIds, CancellationToken cancellationToken)
    {
        var otherReports = await serviceReportRepository.GetByIdsAsync(unavailableIds, cancellationToken);
        var wrongProjectIds = otherReports.Select(report => report.Id).OfType<string>().ToArray();
        var missingIds = unavailableIds.Except(wrongProjectIds, StringComparer.Ordinal).ToArray();
        var issues = new List<string>();

        if (missingIds.Length > 0)
            issues.Add($"ไม่พบรายงาน: {string.Join(", ", missingIds)}");

        if (wrongProjectIds.Length > 0)
            issues.Add($"รายงานอยู่คนละโครงการ: {string.Join(", ", wrongProjectIds)}");

        return Problem(
            statusCode: wrongProjectIds.Length > 0 ? 400 : 404,
            detail: string.Join(" | ", issues),
            extensions: new Dictionary<string, object?>
            {
                ["missingReportIds"] = missingIds,
                ["wrongProjectReportIds"] = wrongProjectIds
            });
    }

    private FileContentResult RenderPdf(
        Project project, List<ServiceReport> reports, ServiceReportDocumentFormat format, string filename)
    {
        var viewModel = new ServiceReportViewModel { Project = project, Reports = reports };
        var document = new ServiceReportDocument(viewModel, environment, format);
        return File(document.GeneratePdf(), "application/pdf", filename);
    }
}
