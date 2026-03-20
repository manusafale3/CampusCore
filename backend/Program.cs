using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using CampusCoreAPI.Data;
using CampusCoreAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
    sqlOptions => sqlOptions.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null)));

// Register services
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<StudentService>();
builder.Services.AddScoped<CourseService>();
builder.Services.AddScoped<GradeService>();
builder.Services.AddScoped<AttendanceService>();
builder.Services.AddScoped<AssignmentService>();
builder.Services.AddScoped<AnnouncementService>();
builder.Services.AddScoped<FeeService>();

// JWT Authentication — reads the token from the Authorization header,
// validates it against the same key/issuer/audience used to create it
var jwtKey = builder.Configuration["Jwt:Key"] 
    ?? throw new InvalidOperationException("Jwt:Key is missing from appsettings.json");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// CORS — allows React frontend (localhost:5173 for Vite, 3000 for CRA) to call the API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "https://brave-ocean-06ad60300.1.azurestaticapps.net")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Controllers + JSON options to avoid circular reference errors from navigation properties
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

var app = builder.Build();

// Middleware pipeline — ORDER MATTERS
// CORS must come before auth, auth must come before controllers
app.UseCors("AllowFrontend");
app.UseHttpsRedirection();
app.UseAuthentication();   // reads the JWT token
app.UseAuthorization();    // enforces [Authorize] attributes
app.MapControllers();

app.Run();
