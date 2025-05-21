using backend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace backend.Repositories;

public interface IProjectRepository
{
    Task<List<Project>> GetAllAsync();
    Task<Project?> GetByIdAsync(string id);
    Task CreateAsync(Project project);
    Task UpdateAsync(string id, Project project);
    Task DeleteAsync(string id);
Task<Project?> GetByNameAsync(string name);
}

public class ProjectRepository : IProjectRepository
{
    private readonly IMongoCollection<Project> _collection;

    public ProjectRepository(IConfiguration config)
    {
        var client = new MongoClient(config["MongoDB:ConnectionString"]);
        var database = client.GetDatabase(config["MongoDB:Database"]);
        _collection = database.GetCollection<Project>("Projects");
    }

    public async Task<List<Project>> GetAllAsync() =>
        await _collection.Find(_ => true).ToListAsync();

    public async Task<Project?> GetByIdAsync(string id) =>
        await _collection.Find(p => p.Id == id).FirstOrDefaultAsync();

    public async Task CreateAsync(Project project) =>
        await _collection.InsertOneAsync(project);

    public async Task UpdateAsync(string id, Project project) =>
        await _collection.ReplaceOneAsync(p => p.Id == id, project);

    public async Task DeleteAsync(string id) =>
        await _collection.DeleteOneAsync(p => p.Id == id);

    public async Task<Project?> GetByNameAsync(string name)  =>
         await _collection.Find(p => p.Name == name).FirstOrDefaultAsync();
    
}
