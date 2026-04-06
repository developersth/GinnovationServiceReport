public class StaffWorkingTime
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string EngineerName { get; set; }
    public DateTime WorkingDate { get; set; }
    public string StartTime { get; set; }
    public string EndTime { get; set; }
    public double WorkingHours { get; set; }
    public double TravellingHours { get; set; }
    public string Description { get; set; }
    public bool IsCharging { get; set; }
}