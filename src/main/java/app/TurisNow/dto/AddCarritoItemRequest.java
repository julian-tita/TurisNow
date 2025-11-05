package app.TurisNow.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class AddCarritoItemRequest {
    
    @NotNull(message = "El ID de la experiencia es obligatorio")
    @Positive(message = "El ID de la experiencia debe ser positivo")
    private Long experienciaId;
    
    @NotNull(message = "El ID de la salida es obligatorio")
    @Positive(message = "El ID de la salida debe ser positivo")
    private Long salidaId;
    
    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser mayor a 0")
    private Integer cantidad;
}

