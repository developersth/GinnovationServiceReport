namespace backend.Models;

public class ProjectCreateDto
{
    public IFormFile? Image { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public string CustomerAddress { get; set; } = string.Empty;

    public string ContactPerson { get; set; } = string.Empty;

    public string Tel { get; set; } = string.Empty;
}
