package app.TurisNow.controller;

import app.TurisNow.dto.AuthResponse;
import app.TurisNow.dto.LoginRequest;
import app.TurisNow.dto.RegistroRequest;
import app.TurisNow.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    
    @Operation(summary = "Verificar estado del servicio", description = "Endpoint para verificar que el servicio de autenticación está funcionando")
    @ApiResponse(responseCode = "200", description = "Servicio funcionando correctamente")
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Auth service is running");
    }
}
