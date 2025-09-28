package app.TurisNow.dto;

import app.TurisNow.model.Usuario;
import lombok.Data;

@Data
public class AuthResponse {
    
    private String token;
    private String username;
    private String email;
    private String nombreCompleto;
    private Usuario.Rol rol;
    private String message;
    
    public AuthResponse(String token, Usuario usuario, String message) {
        this.token = token;
        this.username = usuario.getUsername();
        this.email = usuario.getEmail();
        this.nombreCompleto = usuario.getNombreCompleto();
        this.rol = usuario.getRol();
        this.message = message;
    }
    
    public AuthResponse(String message) {
        this.message = message;
    }
}
