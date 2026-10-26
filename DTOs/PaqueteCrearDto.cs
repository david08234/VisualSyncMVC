using System.ComponentModel.DataAnnotations;

namespace VisualSync.Api.DTOs;

public class PaqueteCrearDto
{
    [Required(ErrorMessage = "El nombre es obligatorio."), StringLength(100)]
    public string Nombre { get; set; } = "";

    [Required, StringLength(500)]
    public string Descripcion { get; set; } = "";

    [Range(0.01, 1000000, ErrorMessage = "El precio debe ser mayor a 0.")]
    public decimal Precio { get; set; }

    [Range(1, 24)]
    public int Duracion { get; set; }

    [Range(1, 5000)]
    public int CantidadFotos { get; set; }

    public bool IncluyeVideo { get; set; }
    public bool Activo { get; set; } = true;
}