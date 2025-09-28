package app.TurisNow.service;

import app.TurisNow.dto.AuthResponse;
import app.TurisNow.dto.LoginRequest;
import app.TurisNow.dto.RegistroRequest;
import app.TurisNow.model.Usuario;
import app.TurisNow.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    
    
    @Autowired
    private JwtService jwtService;
    
    public AuthResponse registrar(RegistroRequest request) {
        // Verificar si el usuario ya existe
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            return new AuthResponse("El nombre de usuario ya está en uso");
        }
        
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse("El email ya está registrado");
        }
        
        // Crear nuevo usuario
        Usuario usuario = new Usuario();
        usuario.setUsername(request.getUsername());
        usuario.setPassword(request.getPassword()); // Sin encriptación
        usuario.setEmail(request.getEmail());
        usuario.setNombreCompleto(request.getNombreCompleto());
        usuario.setRol(request.getRol());
        usuario.setActivo(true);
        
        usuario = usuarioRepository.save(usuario);
        
        // Generar token JWT
        String token = jwtService.generateToken(usuario);
        
        return new AuthResponse(token, usuario, "Usuario registrado exitosamente");
    }
    
    public AuthResponse login(LoginRequest request) {
        // Buscar usuario por username
        Usuario usuario = usuarioRepository.findByUsername(request.getUsername()).orElse(null);
        
        if (usuario == null) {
            return new AuthResponse("Usuario no encontrado");
        }
        
        // Verificar contraseña (comparación directa sin encriptación)
        if (!usuario.getPassword().equals(request.getPassword())) {
            return new AuthResponse("Contraseña incorrecta");
        }
        
        // Verificar que el usuario esté activo
        if (!usuario.getActivo()) {
            return new AuthResponse("Usuario inactivo");
        }
        
        // Actualizar último acceso
        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);
        
        // Generar token JWT
        String token = jwtService.generateToken(usuario);
        
        return new AuthResponse(token, usuario, "Login exitoso");
    }
}
