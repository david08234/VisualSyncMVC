using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisualSync.Api.Data;
using VisualSync.Api.DTOs;
using VisualSync.Api.Models;

namespace VisualSync.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PaquetesServicioController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PaquetesServicioController(ApplicationDbContext context) => _context = context;

    // PÚBLICO: catálogo de paquetes activos (Ficha D: Búsqueda por nombre)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PaqueteServicio>>> GetPaquetes([FromQuery] string? buscar)
    {
        var consulta = _context.PaquetesServicio.Where(p => p.Activo);
        
        if (!string.IsNullOrWhiteSpace(buscar))
        {
            var termino = buscar.Trim().ToLower();
            consulta = consulta.Where(p => p.Nombre.ToLower().Contains(termino));
        }
        
        return await consulta.ToListAsync();
    }

    // PÚBLICO: detalle de un paquete activo
    [HttpGet("{id:int}")]
    public async Task<ActionResult<PaqueteServicio>> GetPaquete(int id)
    {
        var paquete = await _context.PaquetesServicio.FindAsync(id);
        if (paquete == null) return NotFound();
        return paquete;
    }

    // ADMIN: crear (Ficha E: Impedir duplicados)
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<PaqueteServicio>> PostPaquete(PaqueteCrearDto dto)
    {
        // validamos que no exita otro paquete con el mismo nombre 
        var normalizado = dto.Nombre.Replace(" ", "").ToLower();
        bool existe = await _context.PaquetesServicio
            .AnyAsync(p => p.Nombre.Replace(" ", "").ToLower() == normalizado);
            
        if (existe)
        {
            return Conflict(new ProblemDetails
            {
                Status = 409,
                Title = "Conflict",
                Detail = "Ya existe un paquete con ese nombre."
            });
        }

        var paquete = new PaqueteServicio
        {
            Nombre = dto.Nombre,
            Descripcion = dto.Descripcion,
            Precio = dto.Precio,
            Duracion = dto.Duracion,
            CantidadFotos = dto.CantidadFotos,
            IncluyeVideo = dto.IncluyeVideo,
            Activo = dto.Activo
            
        };
        _context.PaquetesServicio.Add(paquete);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetPaquete), new { id = paquete.IdPaquete }, paquete);
    }

    // ADMIN: actualizar (Ficha E: Impedir duplicados al editar)
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<PaqueteServicio>> PutPaquete(int id, PaqueteCrearDto dto)
    {
        // aqui se hace la validación de duplicados ignorando el paquete actual
        var normalizado = dto.Nombre.Replace(" ", "").ToLower();
        bool existe = await _context.PaquetesServicio
            .AnyAsync(p => p.Nombre.Replace(" ", "").ToLower() == normalizado && p.IdPaquete != id);
            
        if (existe)
        {
            return Conflict(new ProblemDetails
            {
                Status = 409,
                Title = "Conflict",
                Detail = "Ya existe un paquete con ese nombre."
            });
        }

        var paquete = await _context.PaquetesServicio.FindAsync(id);
if (paquete == null) return NotFound();
        paquete.Nombre = dto.Nombre;
        paquete.Descripcion = dto.Descripcion;
        paquete.Precio = dto.Precio;
        paquete.Duracion = dto.Duracion;
        paquete.CantidadFotos = dto.CantidadFotos;
        paquete.IncluyeVideo = dto.IncluyeVideo;
        paquete.Activo = dto.Activo;

        await _context.SaveChangesAsync();
        return paquete;
    }

    // ADMIN: desactivar (baja lógica)
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeletePaquete(int id)
    {
        var paquete = await _context.PaquetesServicio.FindAsync(id);
        if (paquete == null) return NotFound();

        paquete.Activo = false;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}