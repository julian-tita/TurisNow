package app.TurisNow.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/test")
@Tag(name = "Endpoints de Prueba", description = "Endpoints para probar la autenticación y autorización")
public class TestController {
    
    @Operation(summary = "Endpoint público", description = "Endpoint accesible sin autenticación")
    @ApiResponse(responseCode = "200", description = "Respuesta exitosa")
    @GetMapping("/public")
    public String publicEndpoint() {
        return "Este es un endpoint público - accesible sin autenticación";
    }
    
    @Operation(summary = "Endpoint para usuarios autenticados", description = "Requiere autenticación con rol USER o ADMIN")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Acceso exitoso"),
        @ApiResponse(responseCode = "401", description = "No autorizado - token requerido")
    })
    @SecurityRequirement(name = "bearer-jwt")
    @GetMapping("/user")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public String userEndpoint() {
        return "Este es un endpoint para usuarios autenticados (USER o ADMIN)";
    }
    
    @Operation(summary = "Endpoint para administradores", description = "Requiere autenticación con rol ADMIN")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Acceso exitoso"),
        @ApiResponse(responseCode = "401", description = "No autorizado - token requerido"),
        @ApiResponse(responseCode = "403", description = "Prohibido - se requiere rol ADMIN")
    })
    @SecurityRequirement(name = "bearer-jwt")
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminEndpoint() {
        return "Este es un endpoint solo para administradores";
    }
    
    @Operation(summary = "Debug de autenticación", description = "Muestra información del usuario autenticado y sus roles")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Información del usuario"),
        @ApiResponse(responseCode = "401", description = "No autorizado - token requerido")
    })
    @SecurityRequirement(name = "bearer-jwt")
    @GetMapping("/auth-debug")
    public Map<String, Object> authDebug() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> info = new HashMap<>();
        
        if (auth != null) {
            info.put("authenticated", auth.isAuthenticated());
            info.put("username", auth.getName());
            info.put("principal", auth.getPrincipal().getClass().getName());
            info.put("authorities", auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
        } else {
            info.put("message", "No hay autenticación en el contexto de seguridad");
        }
        
        return info;
    }
}
