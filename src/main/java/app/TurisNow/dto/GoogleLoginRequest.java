package app.TurisNow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para recibir el token de Google OAuth en el login.
 * El credential es el token JWT que Google envía desde el frontend.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleLoginRequest {
    
    @NotBlank(message = "El credential de Google es obligatorio")
    private String credential;
}
