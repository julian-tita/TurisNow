package app.TurisNow.service;

import app.TurisNow.dto.*;
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
        
        // Verificar unicidad de documento si se proporciona
        if (request.getDocumento() != null && usuarioRepository.existsByDocumento(request.getDocumento())) {
            return new AuthResponse("El documento ya está registrado");
        }
        
        // Crear nuevo usuario
        Usuario usuario = new Usuario();
        usuario.setUsername(request.getUsername());
        usuario.setPassword(request.getPassword()); // Sin encriptación
        usuario.setEmail(request.getEmail());
        usuario.setNombre(request.getNombre());
        usuario.setApellido(request.getApellido());
        // Setear nombreCompleto para compatibilidad con BD (hasta que se ejecute migración)
        usuario.setNombreCompleto(request.getNombre() + " " + request.getApellido());
        usuario.setTelefono(request.getTelefono());
        usuario.setDocumento(request.getDocumento());
        usuario.setFechaNacimiento(request.getFechaNacimiento());
        usuario.setDireccion(request.getDireccion());
        usuario.setRol(request.getRol());
        usuario.setActivo(true);
        
        usuario = usuarioRepository.save(usuario);
        
        // Generar token JWT
        String token = jwtService.generateToken(usuario);
        
        return new AuthResponse(token, usuario, "Usuario registrado exitosamente");
    }
    
    public AuthResponse login(LoginRequest request) {
        // Buscar usuario por email
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail()).orElse(null);
        
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
    
    public PerfilUsuarioDTO obtenerPerfil(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return new PerfilUsuarioDTO(usuario);
    }
    
    public PerfilUsuarioDTO actualizarPerfil(String username, UpdateProfileRequest request) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Verificar unicidad de documento si se está cambiando
        if (request.getDocumento() != null && !request.getDocumento().equals(usuario.getDocumento())) {
            if (usuarioRepository.existsByDocumento(request.getDocumento())) {
                throw new RuntimeException("El documento ya está registrado");
            }
        }
        
        // Actualizar campos
        if (request.getNombre() != null) usuario.setNombre(request.getNombre());
        if (request.getApellido() != null) usuario.setApellido(request.getApellido());
        if (request.getTelefono() != null) usuario.setTelefono(request.getTelefono());
        if (request.getDocumento() != null) usuario.setDocumento(request.getDocumento());
        if (request.getFechaNacimiento() != null) usuario.setFechaNacimiento(request.getFechaNacimiento());
        if (request.getDireccion() != null) usuario.setDireccion(request.getDireccion());
        
        usuario = usuarioRepository.save(usuario);
        return new PerfilUsuarioDTO(usuario);
    }
    
    public void cambiarPassword(String username, ChangePasswordRequest request) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Verificar contraseña actual
        if (!usuario.getPassword().equals(request.getPasswordActual())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }
        
        // Actualizar contraseña
        usuario.setPassword(request.getPasswordNueva());
        usuarioRepository.save(usuario);
    }
    
    public void cambiarEmail(String username, ChangeEmailRequest request) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Verificar que el nuevo email no esté en uso
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }
        
        // Actualizar email
        usuario.setEmail(request.getEmail());
        usuarioRepository.save(usuario);
    }
}
