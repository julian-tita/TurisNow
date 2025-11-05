package app.TurisNow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    
    @NotBlank(message = "La contraseña actual es obligatoria")
    private String passwordActual;
    
    @NotBlank(message = "La contraseña nueva es obligatoria")
    @Size(min = 6, message = "La contraseña nueva debe tener al menos 6 caracteres")
    private String passwordNueva;
}

