package app.TurisNow.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para crear o actualizar una salida desde el panel admin.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalidaAdminRequest {
    
    @NotNull(message = "El ID de la experiencia es obligatorio")
    private Long experienciaId;
    
    @NotNull(message = "La fecha de inicio es obligatoria")
    @Future(message = "La fecha de inicio debe ser futura")
    private LocalDateTime fechaInicio;
    
    private LocalDateTime fechaFin;
    
    @NotNull(message = "La capacidad total es obligatoria")
    @Min(value = 1, message = "La capacidad debe ser al menos 1")
    @Max(value = 1000, message = "La capacidad no puede exceder 1000")
    private Integer capacidadTotal;
}
