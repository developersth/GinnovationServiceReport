using backend.Repositories;

var builder = WebApplication.CreateBuilder(args);

// 🔧 Add Services and Repositories
builder.Services.AddSingleton<IServiceReportRepository, ServiceReportRepository>();
builder.Services.AddSingleton<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();


// CORS Setup
var MyAllowSpecificOrigins = "https://localhost:7001,http://backend:5000,*";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      builder =>
                      {
                          builder.AllowAnyOrigin()
                                 .AllowAnyHeader()
                                 .AllowAnyMethod();
                      });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Needed for file uploads & static file serving
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

// ✅ Swagger in Development
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage(); // 👈 Add this
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "GinnovationServiceReport API V1");
        c.RoutePrefix = string.Empty; // Set Swagger at root
    });
}

// ✅ Middleware Setup
app.UseCors(MyAllowSpecificOrigins);
app.UseHttpsRedirection();
app.UseStaticFiles();           // <-- Must be before MapControllers to serve wwwroot/*
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
