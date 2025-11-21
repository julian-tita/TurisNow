package app.TurisNow.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO para crear o actualizar una experiencia desde el panel admin.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExperienciaAdminRequest {
    
    @NotBlank(message = "El título es obligatorio")
    @Size(min = 5, max = 200, message = "El título debe tener entre 5 y 200 caracteres")
    private String titulo;
    
    @NotBlank(message = "La descripción es obligatoria")
    @Size(min = 20, message = "La descripción debe tener al menos 20 caracteres")
    private String descripcion;
    
    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El precio debe ser mayor a 0")
    private BigDecimal precio;
    
    @NotBlank(message = "La moneda es obligatoria")
    private String moneda; // ARS, USD, CLP, EUR
    
    @NotNull(message = "La ubicación es obligatoria")
    private UbicacionRequest ubicacion;
    
    @NotBlank(message = "La categoría es obligatoria")
    private String categoria; // PLAYA, MONTANA, AVENTURA, GASTRONOMIA, CULTURA
    
    private String imagenUrl;
    
    private List<String> tags;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UbicacionRequest {
        @NotBlank(message = "La ciudad es obligatoria")
        private String ciudad;
        
        private String region;
        
        @NotBlank(message = "El país es obligatorio")
        private String pais;
    }
}
