using backend.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace backend.Repositories;

public interface IUserRepository
{
    Task<List<User>> GetAllAsync();
    Task<User?> GetByIdAsync(string id);
    Task<User?> GetByUserNameAsync(string name);
    Task CreateAsync(User user);
    Task<bool> UpdateAsync(string id, User user, string? passwordHash);
    Task<bool> DeleteAsync(string id);
    Task<bool> CheckUsernameExistsAsync(string username, string? exceptId = null);
    Task<bool> CheckEmailExistsAsync(string email, string? exceptId = null);
}

public class UserRepository : IUserRepository
{
    private readonly IMongoCollection<User> _collection;

    public UserRepository(IConfiguration configuration)
    {
        var client = new MongoClient(configuration["MongoDB:ConnectionString"]);
        var database = client.GetDatabase(configuration["MongoDB:Database"]);
        _collection = database.GetCollection<User>("Users");
    }

    public Task<List<User>> GetAllAsync() =>
        _collection.Find(Builders<User>.Filter.Empty).SortBy(user => user.Username).ToListAsync();

    public async Task<User?> GetByIdAsync(string id) =>
        ObjectId.TryParse(id, out _)
            ? await _collection.Find(user => user.Id == id).FirstOrDefaultAsync()
            : null;

    public async Task<User?> GetByUserNameAsync(string username) =>
        await _collection.Find(user => user.Username == username).FirstOrDefaultAsync();

    public Task CreateAsync(User user) => _collection.InsertOneAsync(user);

    public async Task<bool> UpdateAsync(string id, User user, string? passwordHash)
    {
        var fields = Builders<User>.Update
            .Set(item => item.Username, user.Username)
            .Set(item => item.Name, user.Name)
            .Set(item => item.Email, user.Email)
            .Set(item => item.Role, user.Role);
        if (passwordHash is not null)
            fields = fields.Set(item => item.Password, passwordHash);

        return (await _collection.UpdateOneAsync(item => item.Id == id, fields)).MatchedCount == 1;
    }

    public async Task<bool> DeleteAsync(string id) =>
        ObjectId.TryParse(id, out _) && (await _collection.DeleteOneAsync(user => user.Id == id)).DeletedCount == 1;

    public Task<bool> CheckUsernameExistsAsync(string username, string? exceptId = null) =>
        ExistsAsync(Builders<User>.Filter.Eq(user => user.Username, username), exceptId);

    public Task<bool> CheckEmailExistsAsync(string email, string? exceptId = null) =>
        ExistsAsync(Builders<User>.Filter.Eq(user => user.Email, email), exceptId);

    private Task<bool> ExistsAsync(FilterDefinition<User> filter, string? exceptId)
    {
        if (exceptId is not null)
            filter &= Builders<User>.Filter.Ne(user => user.Id, exceptId);

        return _collection.Find(filter).AnyAsync();
    }
}
