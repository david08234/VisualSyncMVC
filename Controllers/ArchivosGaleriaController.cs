using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisualSync.Api.Data;
using VisualSync.Api.Models;

namespace VisualSync.Api.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class ArchivosGaleriaController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ArchivosGaleriaController(ApplicationDbContext context)
    {
        _context = context;
    }

    private int? UsuarioActualId
    {
        get
        {
            var valor = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(valor, out var id) ? id : null;
        }
    }

    private bool EsAdmin => User.IsInRole("Admin");

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ArchivoGaleria>>> GetArchivos()
    {
        IQueryable<ArchivoGaleria> consulta = _context.ArchivosGaleria;

        if (!EsAdmin)
        {
            var idUsuario = UsuarioActualId;
            if (idUsuario == null) return Forbid();

            consulta = consulta.Where(a =>
                _context.Reservas.Any(r => r.IdReserva == a.IdReserva && r.IdUsuario == idUsuario.Value));
        }

        return await consulta.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ArchivoGaleria>> GetArchivo(int id)
    {
        var archivo = await _context.ArchivosGaleria.FindAsync(id);
        if (archivo == null) return NotFound();

        if (!EsAdmin)
        {
            var idUsuario = UsuarioActualId;
            if (idUsuario == null) return Forbid();

            bool esPropietario = await _context.Reservas
                .AnyAsync(r => r.IdReserva == archivo.IdReserva && r.IdUsuario == idUsuario.Value);
            if (!esPropietario) return Forbid();
        }

        return archivo;
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<ArchivoGaleria>> PostArchivo(ArchivoGaleria archivoGaleria)
    {
        archivoGaleria.Reserva = null!;
        _context.ArchivosGaleria.Add(archivoGaleria);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetArchivo), new { id = archivoGaleria.IdArchivo }, archivoGaleria);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> PutArchivo(int id, ArchivoGaleria archivoGaleria)
    {
        if (id != archivoGaleria.IdArchivo) return BadRequest();

        var archivoActual = await _context.ArchivosGaleria.FindAsync(id);
        if (archivoActual == null) return NotFound();

        archivoActual.IdReserva = archivoGaleria.IdReserva;
        archivoActual.RutaBajaRes = archivoGaleria.RutaBajaRes;
        archivoActual.RutaAltaRes = archivoGaleria.RutaAltaRes;
        archivoActual.TipoArchivo = archivoGaleria.TipoArchivo;
        archivoActual.SeleccionadaPorCliente = archivoGaleria.SeleccionadaPorCliente;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteArchivo(int id)
    {
        var archivo = await _context.ArchivosGaleria.FindAsync(id);
        if (archivo == null) return NotFound();

        _context.ArchivosGaleria.Remove(archivo);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
