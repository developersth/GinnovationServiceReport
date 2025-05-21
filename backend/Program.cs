using backend.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Register Repositories and Services
builder.Services.AddSingleton<IServiceReportRepository, ServiceReportRepository>();
// builder.Services.AddSingleton<IServiceReportService, ServiceReportService>(); // ถ้ามี Service

// Add Controllers and Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "GinnovationServiceReport API V1");
        c.RoutePrefix = string.Empty;
    });
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
