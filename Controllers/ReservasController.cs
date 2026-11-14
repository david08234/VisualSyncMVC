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
public class ReservasController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ReservasController(ApplicationDbContext context)
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
    public async Task<ActionResult<IEnumerable<Reserva>>> GetReservas()
    {
        IQueryable<Reserva> consulta = _context.Reservas
            .Include(r => r.Paquete);

        if (!EsAdmin)
        {
            var idUsuario = UsuarioActualId;
            if (idUsuario == null) return Forbid();
            consulta = consulta.Where(r => r.IdUsuario == idUsuario.Value);
        }

        return await consulta.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Reserva>> GetReserva(int id)
    {
        var reserva = await _context.Reservas
            .Include(r => r.Paquete)
            .FirstOrDefaultAsync(r => r.IdReserva == id);

        if (reserva == null) return NotFound();
        if (!EsAdmin && reserva.IdUsuario != UsuarioActualId) return Forbid();
        return reserva;
    }

    [Authorize(Roles = "Cliente")]
    [HttpPost]
    public async Task<ActionResult<Reserva>> PostReserva(Reserva reserva)
    {
        var idUsuario = UsuarioActualId;
        if (idUsuario == null) return Forbid();

        reserva.IdUsuario = idUsuario.Value;
        reserva.EstadoReserva = "Solicitada";
        reserva.EstadoPago = "SinComprobante";
        reserva.RutaComprobanteQR = null;
        reserva.MotivoRechazo = null;
        reserva.DescargasHabilitadas = false;
        reserva.Usuario = null;
        reserva.Paquete = null;

        bool fechaOcupada = await _context.Reservas
            .AnyAsync(r => r.FechaEvento == reserva.FechaEvento && r.EstadoReserva != "Cancelada");

        if (fechaOcupada)
        {
            return Conflict(new { detail = "Ya existe una reserva para esta fecha y hora. Por favor, elige otro horario." });
        }

        _context.Reservas.Add(reserva);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetReserva), new { id = reserva.IdReserva }, reserva);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutReserva(int id, Reserva reserva)
    {
        if (id != reserva.IdReserva) return BadRequest();

        var reservaActual = await _context.Reservas.FindAsync(id);
        if (reservaActual == null) return NotFound();

        var idUsuario = UsuarioActualId;
        if (!EsAdmin && reservaActual.IdUsuario != idUsuario) return Forbid();

        if (EsAdmin)
        {
            reservaActual.IdUsuario = reserva.IdUsuario;
            reservaActual.IdPaquete = reserva.IdPaquete;
            reservaActual.FechaEvento = reserva.FechaEvento;
            reservaActual.LugarEvento = reserva.LugarEvento;
            reservaActual.EstadoReserva = reserva.EstadoReserva;
            reservaActual.EstadoPago = reserva.EstadoPago;
            reservaActual.RutaComprobanteQR = reserva.RutaComprobanteQR;
            reservaActual.MotivoRechazo = reserva.MotivoRechazo;
            reservaActual.DescargasHabilitadas = reserva.DescargasHabilitadas;
        }
        else
        {
            if (reserva.EstadoPago != "PendienteValidacion" && reserva.EstadoPago != "SinComprobante")
                return Forbid();

            reservaActual.EstadoPago = reserva.EstadoPago;
            reservaActual.RutaComprobanteQR = reserva.RutaComprobanteQR;
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Reservas.Any(e => e.IdReserva == id)) return NotFound();
            else throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReserva(int id)
    {
        var reserva = await _context.Reservas.FindAsync(id);
        if (reserva == null) return NotFound();
        if (!EsAdmin && reserva.IdUsuario != UsuarioActualId) return Forbid();

        _context.Reservas.Remove(reserva);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
