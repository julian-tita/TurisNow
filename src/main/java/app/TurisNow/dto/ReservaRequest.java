package app.TurisNow.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservaRequest {
    
    @NotNull(message = "El ID de la salida es obligatorio")
    private Long salidaId;
    
    @NotNull(message = "La cantidad de personas es obligatoria")
    @Positive(message = "La cantidad de personas debe ser mayor a 0")
    private Integer cantidadPersonas;
    
    @NotNull(message = "El precio total es obligatorio")
    private BigDecimal precioTotal;
    
    private String observaciones;
}
