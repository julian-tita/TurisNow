package app.TurisNow.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChangeStatusRequest {
    
    @NotNull(message = "El estado activo es obligatorio")
    private Boolean activo;
}

