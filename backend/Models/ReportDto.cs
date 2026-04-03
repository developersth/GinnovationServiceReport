public class ReportDto
{
    public string Project { get; set; }
    public string Customer { get; set; }
    public string Address { get; set; }
    public string ContactPerson { get; set; }
    public string ContactTel { get; set; }

    public List<ServiceItemDto> Items { get; set; }
}

public class ServiceItemDto
{
    public string Date { get; set; }
    public string Detail { get; set; }
    public string Cause { get; set; }
    public string Solution { get; set; }
}