using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace VisualSync.Api.Models;

public class Usuario
{
    [Key]
    public int IdUsuario { get; set; }

    [Required]
    [MaxLength(20)]
    public string Rol { get; set; } = "Cliente";

    [Required]
    [MaxLength(120)]
    public string NombreCompleto { get; set; } = null!;

    [Required]
    [MaxLength(150)]
    public string Email { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    [JsonIgnore]
    public string PasswordHash { get; set; } = null!;
    public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
}