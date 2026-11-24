using backend.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace backend.Repositories;

public interface IServiceReportRepository
{
    Task<List<ServiceReport>> GetAllAsync();
    Task<List<ServiceReport>> FindAsync(string? projectId, DateTime? from, DateTime? to);
    Task<ServiceReport?> GetByIdAsync(string id);
    Task<List<ServiceReport>> GetByProjectAndIdsAsync(string projectId, IReadOnlyCollection<string> ids, CancellationToken cancellationToken = default);
    Task<List<ServiceReport>> GetByIdsAsync(IReadOnlyCollection<string> ids, CancellationToken cancellationToken = default);
    Task<bool> ExistsForProjectAsync(string projectId);
    Task CreateAsync(ServiceReport report);
    Task<bool> UpdateAsync(string id, DateTime previousUpdate, ServiceReport report);
    Task<bool> DeleteAsync(string id);
}

public class ServiceReportRepository : IServiceReportRepository
{
    private readonly IMongoCollection<ServiceReport> _collection;

    public ServiceReportRepository(IConfiguration configuration)
    {
        var client = new MongoClient(configuration["MongoDB:ConnectionString"]);
        var database = client.GetDatabase(configuration["MongoDB:Database"]);
        _collection = database.GetCollection<ServiceReport>("ServiceReports");
    }

    public Task<List<ServiceReport>> GetAllAsync() => FindAsync(null, null, null);

    public Task<List<ServiceReport>> FindAsync(string? projectId, DateTime? from, DateTime? to)
    {
        var filters = Builders<ServiceReport>.Filter;
        var filter = filters.Empty;
        if (projectId is not null) filter &= filters.Eq(report => report.ProjectId, projectId);
        if (from is not null) filter &= filters.Gte(report => report.ReportDate, from.Value);
        if (to is not null) filter &= filters.Lt(report => report.ReportDate, to.Value);

        return _collection.Find(filter)
            .SortByDescending(report => report.ReportDate)
            .ThenByDescending(report => report.Id)
            .ToListAsync();
    }

    public async Task<ServiceReport?> GetByIdAsync(string id) =>
        ObjectId.TryParse(id, out _)
            ? await _collection.Find(report => report.Id == id).FirstOrDefaultAsync()
            : null;

    public Task<List<ServiceReport>> GetByProjectAndIdsAsync(
        string projectId, IReadOnlyCollection<string> ids, CancellationToken cancellationToken = default)
    {
        var filters = Builders<ServiceReport>.Filter;
        return _collection.Find(filters.Eq(report => report.ProjectId, projectId) & filters.In(report => report.Id, ids))
            .SortByDescending(report => report.ReportDate)
            .ThenByDescending(report => report.Id)
            .ToListAsync(cancellationToken);
    }

    public Task<List<ServiceReport>> GetByIdsAsync(IReadOnlyCollection<string> ids, CancellationToken cancellationToken = default) =>
        _collection.Find(Builders<ServiceReport>.Filter.In(report => report.Id, ids))
            .Project(report => new ServiceReport { Id = report.Id, ProjectId = report.ProjectId })
            .ToListAsync(cancellationToken);

    public Task<bool> ExistsForProjectAsync(string projectId) =>
        _collection.Find(report => report.ProjectId == projectId).AnyAsync();

    public Task CreateAsync(ServiceReport report) => _collection.InsertOneAsync(report);

    public async Task<bool> UpdateAsync(string id, DateTime previousUpdate, ServiceReport report)
    {
        var fields = Builders<ServiceReport>.Update
            .Set(item => item.ProjectId, report.ProjectId)
            .Set(item => item.ReportedBy, report.ReportedBy)
            .Set(item => item.Channel, report.Channel)
            .Set(item => item.Complain, report.Complain)
            .Set(item => item.Details, report.Details)
            .Set(item => item.CausesOfFailure, report.CausesOfFailure)
            .Set(item => item.ActionTaken, report.ActionTaken)
            .Set(item => item.ReportDate, report.ReportDate)
            .Set(item => item.Status, report.Status)
            .Set(item => item.UpdatedBy, report.UpdatedBy)
            .Set(item => item.UpdatedAt, report.UpdatedAt)
            .Set(item => item.ImagePaths, report.ImagePaths)
            .Set(item => item.StaffWorkingTime, report.StaffWorkingTime);
        var filters = Builders<ServiceReport>.Filter;
        var version = filters.Eq(item => item.UpdatedAt, previousUpdate) | filters.Exists(item => item.UpdatedAt, false);
        var result = await _collection.UpdateOneAsync(filters.Eq(item => item.Id, id) & version, fields);
        return result.MatchedCount == 1;
    }

    public async Task<bool> DeleteAsync(string id) =>
        (await _collection.DeleteOneAsync(report => report.Id == id)).DeletedCount == 1;
}
