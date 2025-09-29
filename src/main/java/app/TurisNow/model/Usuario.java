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
    
    @NotBlank(message = "El nombre completo es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre completo debe tener entre 2 y 100 caracteres")
    @Column(nullable = false)
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
    
    public enum Rol {
        USER, ADMIN
    }
}
