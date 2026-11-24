using backend.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace backend.Repositories;

public interface IProjectRepository
{
    Task<List<Project>> GetAllAsync();
    Task<Project?> GetByIdAsync(string id);
    Task<Project?> GetByNameAsync(string name);
    Task CreateAsync(Project project);
    Task<bool> UpdateAsync(string id, Project project);
    Task<bool> DeleteAsync(string id);
}

public class ProjectRepository : IProjectRepository
{
    private readonly IMongoCollection<Project> _collection;

    public ProjectRepository(IConfiguration configuration)
    {
        var client = new MongoClient(configuration["MongoDB:ConnectionString"]);
        var database = client.GetDatabase(configuration["MongoDB:Database"]);
        _collection = database.GetCollection<Project>("Projects");
    }

    public Task<List<Project>> GetAllAsync() =>
        _collection.Find(Builders<Project>.Filter.Empty).SortBy(project => project.Name).ToListAsync();

    public async Task<Project?> GetByIdAsync(string id) =>
        ObjectId.TryParse(id, out _)
            ? await _collection.Find(project => project.Id == id).FirstOrDefaultAsync()
            : null;

    public async Task<Project?> GetByNameAsync(string name) =>
        await _collection.Find(project => project.Name == name).FirstOrDefaultAsync();

    public Task CreateAsync(Project project) => _collection.InsertOneAsync(project);

    public async Task<bool> UpdateAsync(string id, Project project)
    {
        var fields = Builders<Project>.Update
            .Set(item => item.Name, project.Name)
            .Set(item => item.ImageUrl, project.ImageUrl)
            .Set(item => item.CustomerName, project.CustomerName)
            .Set(item => item.CustomerAddress, project.CustomerAddress)
            .Set(item => item.ContactPerson, project.ContactPerson)
            .Set(item => item.Tel, project.Tel)
            .Set(item => item.ServiceUnder, project.ServiceUnder);
        return (await _collection.UpdateOneAsync(item => item.Id == id, fields)).MatchedCount == 1;
    }

    public async Task<bool> DeleteAsync(string id) =>
        (await _collection.DeleteOneAsync(project => project.Id == id)).DeletedCount == 1;
}
