package app.TurisNow.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "El nombre de usuario es obligatorio")
    @Size(min = 3, max = 50, message = "El nombre de usuario debe tener entre 3 y 50 caracteres")
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato del email no es válido")
    @Column(unique = true, nullable = false)
    private String email;
    
    // Campos nuevos de perfil
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    @Column(length = 100)
    private String nombre;
    
    @Size(min = 2, max = 100, message = "El apellido debe tener entre 2 y 100 caracteres")
    @Column(length = 100)
    private String apellido;
    
    @Size(max = 50, message = "El teléfono no puede exceder 50 caracteres")
    @Column(length = 50)
    private String telefono;
    
    @Size(max = 50, message = "El documento no puede exceder 50 caracteres")
    @Column(length = 50, unique = true)
    private String documento;
    
    @Column(name = "fecha_nacimiento")
    private java.time.LocalDate fechaNacimiento;
    
    @Size(max = 255, message = "La dirección no puede exceder 255 caracteres")
    @Column(length = 255)
    private String direccion;
    
    // DEPRECATED: Mantenido por compatibilidad, usar getNombreCompleto()
    @Column(nullable = true)
    private String nombreCompleto;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rol rol = Rol.USER;
    
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
    
    @Column(name = "ultimo_acceso")
    private LocalDateTime ultimoAcceso;
    
    @Column(name = "activo")
    private Boolean activo = true;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
    
    // Implementación de UserDetails para Spring Security
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + rol.name()));
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return activo;
    }
    
    /**
     * Devuelve el nombre completo construido a partir de nombre y apellido.
     * Si no existen, intenta usar el campo nombreCompleto legacy.
     */
    public String getNombreCompleto() {
        if (nombre != null && apellido != null) {
            return nombre + " " + apellido;
        }
        // Fallback para compatibilidad con datos legacy
        return nombreCompleto != null ? nombreCompleto : "";
    }
    
    /**
     * Setter para nombre completo (legacy).
     * Intenta dividir en nombre y apellido si es posible.
     */
    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
        // Si nombre/apellido aún no están seteados, intentar parsear
        if (nombreCompleto != null && (this.nombre == null || this.apellido == null)) {
            String[] partes = nombreCompleto.trim().split("\\s+", 2);
            if (partes.length >= 1 && this.nombre == null) {
                this.nombre = partes[0];
            }
            if (partes.length >= 2 && this.apellido == null) {
                this.apellido = partes[1];
            } else if (partes.length == 1 && this.apellido == null) {
                this.apellido = "Apellido";
            }
        }
    }
    
    public enum Rol {
        USER, ADMIN
    }
}
