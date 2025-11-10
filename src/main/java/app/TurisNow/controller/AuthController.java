package app.TurisNow.controller;

import app.TurisNow.dto.*;
import app.TurisNow.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@Tag(name = "Autenticación", description = "Endpoints para login, registro y gestión de usuarios")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @Operation(summary = "Iniciar sesión", description = "Autentica un usuario y devuelve un token JWT")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login exitoso", 
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
        @ApiResponse(responseCode = "400", description = "Credenciales inválidas", 
                    content = @Content(schema = @Schema(implementation = AuthResponse.class)))
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        
        if (response.getToken() != null) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @Operation(summary = "Registrar usuario", description = "Crea un nuevo usuario en el sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuario registrado exitosamente", 
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
        @ApiResponse(responseCode = "400", description = "Error en el registro (usuario/email ya existe)", 
                    content = @Content(schema = @Schema(implementation = AuthResponse.class)))
    })
    @PostMapping("/registro")
    public ResponseEntity<AuthResponse> registro(@Valid @RequestBody RegistroRequest request) {
        AuthResponse response = authService.registrar(request);
        
        if (response.getToken() != null) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @Operation(summary = "Login con Google", description = "Autentica un usuario mediante Google OAuth y devuelve un token JWT")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login con Google exitoso", 
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
        @ApiResponse(responseCode = "400", description = "Token de Google inválido", 
                    content = @Content(schema = @Schema(implementation = AuthResponse.class)))
    })
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleAuth(@Valid @RequestBody GoogleLoginRequest request) {
        AuthResponse response = authService.googleAuth(request);
        
        if (response.getToken() != null) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @Operation(
        summary = "Obtener perfil del usuario autenticado", 
        description = "Devuelve la información completa del perfil del usuario actual",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponse(responseCode = "200", description = "Perfil obtenido exitosamente")
    @GetMapping("/me")
    public ResponseEntity<PerfilUsuarioDTO> obtenerPerfil() {
        String username = obtenerUsernameAutenticado();
        PerfilUsuarioDTO perfil = authService.obtenerPerfil(username);
        return ResponseEntity.ok(perfil);
    }
    
    @Operation(
        summary = "Actualizar perfil del usuario", 
        description = "Actualiza los datos del perfil del usuario autenticado",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponse(responseCode = "200", description = "Perfil actualizado exitosamente")
    @PutMapping("/me")
    public ResponseEntity<?> actualizarPerfil(@Valid @RequestBody UpdateProfileRequest request) {
        try {
            String username = obtenerUsernameAutenticado();
            PerfilUsuarioDTO perfil = authService.actualizarPerfil(username, request);
            return ResponseEntity.ok(perfil);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @Operation(
        summary = "Cambiar contraseña", 
        description = "Permite al usuario cambiar su contraseña",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponse(responseCode = "200", description = "Contraseña cambiada exitosamente")
    @PutMapping("/me/password")
    public ResponseEntity<?> cambiarPassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            String username = obtenerUsernameAutenticado();
            authService.cambiarPassword(username, request);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Contraseña actualizada exitosamente");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @Operation(
        summary = "Cambiar email", 
        description = "Permite al usuario cambiar su dirección de email",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponse(responseCode = "200", description = "Email cambiado exitosamente")
    @PutMapping("/me/email")
    public ResponseEntity<?> cambiarEmail(@Valid @RequestBody ChangeEmailRequest request) {
        try {
            String username = obtenerUsernameAutenticado();
            authService.cambiarEmail(username, request);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Email actualizado exitosamente");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @Operation(summary = "Verificar estado del servicio", description = "Endpoint para verificar que el servicio de autenticación está funcionando")
    @ApiResponse(responseCode = "200", description = "Servicio funcionando correctamente")
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Auth service is running");
    }
    
    /**
     * Helper para obtener el username del usuario autenticado desde el SecurityContext
     */
    private String obtenerUsernameAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}
