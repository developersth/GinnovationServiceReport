public class GenerateReportRequest
{
    public string ProjectId { get; set; } = string.Empty;
    public List<string> ServiceReportIds { get; set; } = new();
}