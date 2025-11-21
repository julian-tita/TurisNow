package app.TurisNow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO para actualizar un usuario desde el panel admin.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioAdminRequest {
    
    @NotBlank(message = "El nombre de usuario es obligatorio")
    @Size(min = 3, max = 50)
    private String username;
    
    @NotBlank(message = "El email es obligatorio")
    @Email
    private String email;
    
    @Size(min = 2, max = 100)
    private String nombre;
    
    @Size(min = 2, max = 100)
    private String apellido;
    
    @Size(max = 50)
    private String telefono;
    
    @Size(max = 50)
    private String documento;
    
    private LocalDate fechaNacimiento;
    
    @Size(max = 255)
    private String direccion;
    
    @NotBlank(message = "El rol es obligatorio")
    private String rol; // USER o ADMIN
    
    private Boolean activo;
}
