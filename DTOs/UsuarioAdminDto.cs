using System.ComponentModel.DataAnnotations;

namespace VisualSync.Api.DTOs;

public class UsuarioAdminDto
{
    [Required, StringLength(120, MinimumLength = 3)]
    public string NombreCompleto { get; set; } = "";

    [Required, EmailAddress, StringLength(150)]
    public string Email { get; set; } = "";

    [Required, RegularExpression("^(Admin|Cliente)$")]
    public string Rol { get; set; } = "Cliente";

    [MinLength(8), MaxLength(72)]
    public string? Password { get; set; }
}
