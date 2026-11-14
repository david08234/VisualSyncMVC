using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisualSync.Api.Data;
using VisualSync.Api.DTOs;
using VisualSync.Api.Models;

namespace VisualSync.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class UsuariosController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsuariosController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Usuario>>> GetUsuarios()
    {
        return await _context.Usuarios.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Usuario>> GetUsuario(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null) return NotFound();
        return usuario;
    }

    [HttpPost]
    public async Task<ActionResult<Usuario>> PostUsuario(UsuarioAdminDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new ProblemDetails
            {
                Status = 400,
                Title = "Bad Request",
                Detail = "La contraseña es obligatoria para crear un usuario."
            });

        var email = dto.Email.Trim().ToLowerInvariant();
        if (await _context.Usuarios.AnyAsync(u => u.Email == email))
            return Conflict(new ProblemDetails
            {
                Status = 409,
                Title = "Conflict",
                Detail = "Ya existe una cuenta con ese correo."
            });

        var usuario = new Usuario
        {
            NombreCompleto = dto.NombreCompleto.Trim(),
            Email = email,
            Rol = dto.Rol,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, 11)
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetUsuario), new { id = usuario.IdUsuario }, usuario);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutUsuario(int id, UsuarioAdminDto dto)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null) return NotFound();

        var email = dto.Email.Trim().ToLowerInvariant();
        if (await _context.Usuarios.AnyAsync(u => u.Email == email && u.IdUsuario != id))
            return Conflict(new ProblemDetails
            {
                Status = 409,
                Title = "Conflict",
                Detail = "Ya existe una cuenta con ese correo."
            });

        usuario.NombreCompleto = dto.NombreCompleto.Trim();
        usuario.Email = email;
        usuario.Rol = dto.Rol;

        if (!string.IsNullOrWhiteSpace(dto.Password))
            usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, 11);

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUsuario(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null) return NotFound();

        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}