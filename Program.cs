using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using VisualSync.Api.Data;
using VisualSync.Api.Models;

var builder = WebApplication.CreateBuilder(args);

// Configuración obligatoria
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Falta la configuración Jwt:Key.");
if (jwtKey.Length < 32)
    throw new InvalidOperationException("Jwt:Key debe tener al menos 32 caracteres.");

// Orígenes permitidos: varias direcciones separadas por coma, sin "/" final
var corsOrigenes = (builder.Configuration["Cors:Origen"] ?? "http://localhost:5173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .Select(o => o.TrimEnd('/'))
    .ToArray();

// Base de datos: PostgreSQL (Supabase) con Npgsql
builder.Services.AddDbContext<ApplicationDbContext>(o =>
    o.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Controladores y JSON
builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// CORS: las direcciones de la lista y los despliegues de Vercel de este proyecto
builder.Services.AddCors(o => o.AddPolicy("Frontend", p =>
    p.SetIsOriginAllowed(origin =>
    {
        if (corsOrigenes.Contains(origin.TrimEnd('/'))) return true;

        return Uri.TryCreate(origin, UriKind.Absolute, out var uri)
            && uri.Scheme == Uri.UriSchemeHttps
            && uri.Host.StartsWith("visual-sync-")
            && uri.Host.EndsWith("-miguelxd.vercel.app");
    })
    .AllowAnyHeader()
    .AllowAnyMethod()));

// Autenticación con JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o => o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = "VisualSync.Api",
        ValidateAudience = true,
        ValidAudience = "VisualSync.Web",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        RoleClaimType = ClaimTypes.Role
    });
builder.Services.AddAuthorization();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Cabeceras reenviadas por el proxy de la plataforma (producción)
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

// app.UseMiddleware<ExceptionMiddleware>(); // descomenta si ya creaste el middleware de errores

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Administrador inicial (solo si no existe ninguno)
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var adminEmail = app.Configuration["Seed:AdminEmail"]?.Trim().ToLowerInvariant();
        var adminPassword = app.Configuration["Seed:AdminPassword"];

        if (!string.IsNullOrWhiteSpace(adminEmail) && !string.IsNullOrWhiteSpace(adminPassword)
            && !db.Usuarios.Any(u => u.Rol == "Admin"))
        {
            db.Usuarios.Add(new Usuario
            {
                NombreCompleto = "Administrador del Sistema",
                Email = adminEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword, 11),
                Rol = "Admin"
            });
            db.SaveChanges();
            logger.LogInformation("Administrador inicial creado.");
        }
    }
    catch (Exception ex)
    {
        // Si la base de datos no responde al arrancar, la API sigue encendida
        logger.LogError(ex, "No se pudo ejecutar la semilla del administrador.");
    }
}

app.Run();