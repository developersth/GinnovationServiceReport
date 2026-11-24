namespace backend.Services;

internal static class ProjectReportWrites
{
    // The API instance serializes project removal with report writes targeting the project.
    public static SemaphoreSlim Gate { get; } = new(1, 1);
}
