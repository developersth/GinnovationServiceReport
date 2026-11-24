using backend.Models;

public class ServiceReportViewModel
{
    public Project Project { get; set; } = new();
    public List<ServiceReport> Reports { get; set; } = new();
}