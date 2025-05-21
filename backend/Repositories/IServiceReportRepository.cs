using backend.Models;
using MongoDB.Driver;

namespace backend.Repositories;

public interface IServiceReportRepository
{
    Task<List<ServiceReport>> GetAllAsync();
    Task<ServiceReport?> GetByIdAsync(string id);
    Task CreateAsync(ServiceReport report);
    Task UpdateAsync(string id, ServiceReport report);
    Task DeleteAsync(string id);
}

public class ServiceReportRepository : IServiceReportRepository
{
    private readonly IMongoCollection<ServiceReport> _collection;

    public ServiceReportRepository(IConfiguration config)
    {
        var client = new MongoClient(config["MongoDB:ConnectionString"]);
        var database = client.GetDatabase(config["MongoDB:Database"]);
        _collection = database.GetCollection<ServiceReport>("ServiceReports");
    }

    public async Task<List<ServiceReport>> GetAllAsync() =>
        await _collection.Find(_ => true).ToListAsync();

    public async Task<ServiceReport?> GetByIdAsync(string id) =>
        await _collection.Find(r => r.Id == id).FirstOrDefaultAsync();

    public async Task CreateAsync(ServiceReport report) =>
        await _collection.InsertOneAsync(report);

    public async Task UpdateAsync(string id, ServiceReport report) =>
        await _collection.ReplaceOneAsync(r => r.Id == id, report);

    public async Task DeleteAsync(string id) =>
        await _collection.DeleteOneAsync(r => r.Id == id);
}
