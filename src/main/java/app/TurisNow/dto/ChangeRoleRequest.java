package app.TurisNow.dto;

import app.TurisNow.model.Usuario;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChangeRoleRequest {
    
    @NotNull(message = "El rol es obligatorio")
    private Usuario.Rol rol;
}

