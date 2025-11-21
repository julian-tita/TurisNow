package app.TurisNow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO de respuesta con información de un usuario para admin.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioAdminResponse {
    private Long id;
    private String username;
    private String email;
    private String googleId;
    private String nombre;
    private String apellido;
    private String telefono;
    private String documento;
    private LocalDate fechaNacimiento;
    private String direccion;
    private String rol;
    private LocalDateTime fechaCreacion;
    private LocalDateTime ultimoAcceso;
    private Boolean activo;
    private Integer totalReservas;
    private Integer reservasActivas;
}
