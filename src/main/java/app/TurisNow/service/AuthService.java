package app.TurisNow.service;

import app.TurisNow.dto.*;
import app.TurisNow.model.Usuario;
import app.TurisNow.repository.UsuarioRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;

@Service
public class AuthService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private JwtService jwtService;
    
    @Value("${google.client.id}")
    private String googleClientId;
    
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
    
    /**
     * Autentica un usuario mediante Google OAuth.
     * Verifica el token de Google y crea/actualiza el usuario en la BD.
     */
    public AuthResponse googleAuth(GoogleLoginRequest request) {
        try {
            // Crear verificador de token de Google
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), 
                GsonFactory.getDefaultInstance()
            )
            .setAudience(Collections.singletonList(googleClientId))
            .build();
            
            // Verificar el token
            GoogleIdToken idToken = verifier.verify(request.getCredential());
            
            if (idToken == null) {
                return new AuthResponse("Token de Google inválido");
            }
            
            // Extraer información del payload
            GoogleIdToken.Payload payload = idToken.getPayload();
            String googleId = payload.getSubject(); // ID único de Google
            String email = payload.getEmail();
            String nombre = (String) payload.get("given_name");
            String apellido = (String) payload.get("family_name");
            
            // Buscar usuario por googleId
            Usuario usuario = usuarioRepository.findByGoogleId(googleId).orElse(null);
            
            // Si no existe por googleId, buscar por email (para vincular cuentas existentes)
            if (usuario == null) {
                usuario = usuarioRepository.findByEmail(email).orElse(null);
                
                // Si existe por email, vincular cuenta de Google
                if (usuario != null) {
                    usuario.setGoogleId(googleId);
                } else {
                    // Crear nuevo usuario
                    usuario = new Usuario();
                    usuario.setGoogleId(googleId);
                    usuario.setEmail(email);
                    usuario.setUsername(email.split("@")[0] + "_" + System.currentTimeMillis()); // Username único
                    usuario.setPassword(""); // Sin password (login solo por Google)
                    usuario.setNombre(nombre != null ? nombre : "Usuario");
                    usuario.setApellido(apellido != null ? apellido : "Google");
                    usuario.setNombreCompleto((nombre != null ? nombre : "Usuario") + " " + (apellido != null ? apellido : "Google"));
                    usuario.setRol(Usuario.Rol.USER);
                    usuario.setActivo(true);
                }
            }
            
            // Actualizar último acceso
            usuario.setUltimoAcceso(LocalDateTime.now());
            usuario = usuarioRepository.save(usuario);
            
            // Generar token JWT propio
            String token = jwtService.generateToken(usuario);
            
            return new AuthResponse(token, usuario, "Login con Google exitoso");
            
        } catch (Exception e) {
            return new AuthResponse("Error al verificar token de Google: " + e.getMessage());
        }
    }
}
