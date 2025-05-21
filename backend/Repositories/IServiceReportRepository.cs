using backend.Models;

namespace backend.Repositories;

public interface IServiceReportRepository
{
    Task<List<ServiceReport>> GetAllAsync();
    Task<ServiceReport?> GetByIdAsync(string id);
    Task CreateAsync(ServiceReport report);
    Task UpdateAsync(string id, ServiceReport report);
    Task DeleteAsync(string id);
}
