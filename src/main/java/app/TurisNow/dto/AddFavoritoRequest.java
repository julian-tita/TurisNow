package app.TurisNow.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class AddFavoritoRequest {
    
    @NotNull(message = "El ID de la experiencia es obligatorio")
    @Positive(message = "El ID de la experiencia debe ser positivo")
    private Long experienciaId;
}

