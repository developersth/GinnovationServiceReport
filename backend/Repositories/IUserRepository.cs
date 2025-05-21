using MongoDB.Driver;
using backend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using BCrypt.Net;

namespace backend.Repositories;

public interface IUserRepository
{
    Task<List<User>> GetAllAsync();
    Task<User?> GetByIdAsync(string id);
    Task CreateAsync(User user);
    Task UpdateAsync(string id, User user);
    Task DeleteAsync(string id);
    Task<User?> GetByNameAsync(string name);
}

public class UserRepository : IUserRepository
{
    private readonly IMongoCollection<User> _collection;

    public UserRepository(IConfiguration config)
    {
        var client = new MongoClient(config["MongoDB:ConnectionString"]);
        var database = client.GetDatabase(config["MongoDB:Database"]);
        _collection = database.GetCollection<User>("Users");
    }

    public async Task<List<User>> GetAllAsync() =>
        await _collection.Find(_ => true).ToListAsync();

    public async Task<User?> GetByIdAsync(string id) =>
        await _collection.Find(r => r.Id == id).FirstOrDefaultAsync();

    public async Task<User?> GetByNameAsync(string name)  =>
         await _collection.Find(p => p.Name == name).FirstOrDefaultAsync();

    public async Task CreateAsync(User user)
    {
        // Hash the password before inserting
        user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
        await _collection.InsertOneAsync(user);
    }

    public async Task UpdateAsync(string id, User user)
    {
        // Optionally re-hash password only if it's not already hashed
        // This logic depends on how you handle password updates
        user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
        await _collection.ReplaceOneAsync(r => r.Id == id, user);
    }

    public async Task DeleteAsync(string id) =>
        await _collection.DeleteOneAsync(r => r.Id == id);
}
