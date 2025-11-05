package app.TurisNow.dto;

import app.TurisNow.model.Usuario;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class UsuarioAdminDTO {
    
    private Long id;
    private String username;
    private String email;
    private String nombre;
    private String apellido;
    private String nombreCompleto;
    private String telefono;
    private String documento;
    private LocalDate fechaNacimiento;
    private String direccion;
    private Usuario.Rol rol;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime ultimoAcceso;
    
    public UsuarioAdminDTO(Usuario usuario) {
        this.id = usuario.getId();
        this.username = usuario.getUsername();
        this.email = usuario.getEmail();
        this.nombre = usuario.getNombre();
        this.apellido = usuario.getApellido();
        this.nombreCompleto = usuario.getNombreCompleto();
        this.telefono = usuario.getTelefono();
        this.documento = usuario.getDocumento();
        this.fechaNacimiento = usuario.getFechaNacimiento();
        this.direccion = usuario.getDireccion();
        this.rol = usuario.getRol();
        this.activo = usuario.getActivo();
        this.fechaCreacion = usuario.getFechaCreacion();
        this.ultimoAcceso = usuario.getUltimoAcceso();
    }
}

