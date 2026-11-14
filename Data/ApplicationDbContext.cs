using Microsoft.EntityFrameworkCore;
using VisualSync.Api.Models;

namespace VisualSync.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<PaqueteServicio> PaquetesServicio => Set<PaqueteServicio>();
    public DbSet<Reserva> Reservas => Set<Reserva>();
    public DbSet<ArchivoGaleria> ArchivosGaleria => Set<ArchivoGaleria>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        b.Entity<Usuario>().HasIndex(u => u.Email).IsUnique();
        
        b.Entity<PaqueteServicio>().Property(p => p.Precio).HasPrecision(10, 2);
        
        // Ficha F: Valor por defecto en la base de datos para Activo
        b.Entity<PaqueteServicio>().Property(p => p.Activo).HasDefaultValue(true);
        
        b.Entity<Reserva>().Property(r => r.FechaEvento).HasColumnType("timestamp without time zone");

        b.Entity<Reserva>()
            .HasOne(r => r.Usuario)
            .WithMany(u => u.Reservas)
            .HasForeignKey(r => r.IdUsuario)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<Reserva>()
            .HasOne(r => r.Paquete)
            .WithMany(p => p.Reservas)
            .HasForeignKey(r => r.IdPaquete)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<ArchivoGaleria>()
            .HasOne(a => a.Reserva)
            .WithMany(r => r.Archivos)
            .HasForeignKey(a => a.IdReserva)
            .OnDelete(DeleteBehavior.Cascade);
    }
}