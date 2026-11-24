using System.Text;
using backend.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using QuestPDF.Drawing;
using QuestPDF.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// 🔧 Add Services and Repositories
builder.Services.AddSingleton<IServiceReportRepository, ServiceReportRepository>();
builder.Services.AddSingleton<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<ReportService>();

QuestPDF.Settings.License = LicenseType.Community;
using (var font = File.OpenRead(Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "fonts", "THSarabunNew.ttf")))
{
    FontManager.RegisterFont(font);
}
// ✅ CORS Setup
var allowedOrigins = new[]
{
    "https://localhost:7001",
    "http://backend:5000",
    "https://localhost/service-api",
    "https://service.g-innovation.org",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
};
var configuredOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins", policy =>
    {
        policy.WithOrigins(configuredOrigins is { Length: > 0 } ? configuredOrigins : allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .WithExposedHeaders("Content-Disposition")
              .AllowCredentials();
    });
});

// ✅ JWT Setup
var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT key is not configured."));
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

// ✅ Swagger in Development
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "GinnovationServiceReport API V1");
        c.RoutePrefix = string.Empty;
    });
}

// ✅ Middleware Setup (ลำดับสำคัญมาก)
app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseCors("AllowSpecificOrigins");   // ✅ ชื่อ policy ต้องตรงกัน!
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
