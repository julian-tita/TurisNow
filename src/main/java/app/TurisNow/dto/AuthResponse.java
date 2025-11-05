package app.TurisNow.dto;

import app.TurisNow.model.Usuario;
import lombok.Data;

@Data
public class AuthResponse {
    
    private String token;
    private Long id;
    private String username;
    private String email;
    private String nombre;
    private String apellido;
    private String nombreCompleto; // Mantenido por compatibilidad
    private Usuario.Rol rol;
    private String message;
    
    public AuthResponse(String token, Usuario usuario, String message) {
        this.token = token;
        this.id = usuario.getId();
        this.username = usuario.getUsername();
        this.email = usuario.getEmail();
        this.nombre = usuario.getNombre();
        this.apellido = usuario.getApellido();
        this.nombreCompleto = usuario.getNombreCompleto();
        this.rol = usuario.getRol();
        this.message = message;
    }
    
    public AuthResponse(String message) {
        this.message = message;
    }
}
