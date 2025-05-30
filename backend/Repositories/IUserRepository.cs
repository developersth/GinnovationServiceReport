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
    Task<User?> GetByUserNameAsync(string name);
    Task<bool> CheckUsernameExistsAsync(string username);
    Task<bool> CheckEmailExistsAsync(string email);
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

    public async Task<User?> GetByUserNameAsync(string name) =>
         await _collection.Find(p => p.Username == name).FirstOrDefaultAsync();

    public async Task CreateAsync(User user)
    {
        // Hash the password before inserting
        //user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
        await _collection.InsertOneAsync(user);
    }
    public async Task UpdateAsync(string id, User user)
    {
        var existingUser = await _collection.Find(r => r.Id == id).FirstOrDefaultAsync();
        if (existingUser == null)
            throw new Exception("User not found");

        // อัปเดตฟิลด์อื่น
        existingUser.Username = user.Username;
        existingUser.Name = user.Name;
        existingUser.Email = user.Email;
        existingUser.Role = user.Role;

        // อัปเดตรหัสผ่านเฉพาะกรณีมีการส่งรหัสใหม่
        if (!string.IsNullOrWhiteSpace(user.Password))
        {
            existingUser.Password = user.Password;
            //existingUser.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
        }

        await _collection.ReplaceOneAsync(r => r.Id == id, existingUser);
    }

    public async Task DeleteAsync(string id) =>
        await _collection.DeleteOneAsync(r => r.Id == id);

    // NEW: Implement CheckUsernameExistsAsync
    public async Task<bool> CheckUsernameExistsAsync(string username)
    {
        // Use Find and AnyAsync to efficiently check for existence
        return await _collection.Find(u => u.Username == username).AnyAsync();
    }

    // NEW: Implement CheckEmailExistsAsync
    public async Task<bool> CheckEmailExistsAsync(string email)
    {
        // Assuming your User model has an 'Email' property
        return await _collection.Find(u => u.Email == email).AnyAsync();
    }
}
