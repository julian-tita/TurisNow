package app.TurisNow.controller;

import app.TurisNow.dto.AddFavoritoRequest;
import app.TurisNow.dto.FavoritoDTO;
import app.TurisNow.service.FavoritoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favoritos")
@CrossOrigin(origins = "*")
@Tag(name = "Favoritos", description = "Gestión de experiencias favoritas del usuario")
public class FavoritoController {
    
    @Autowired
    private FavoritoService favoritoService;
    
    @Operation(
        summary = "Obtener favoritos del usuario",
        description = "Lista todas las experiencias marcadas como favoritas por el usuario autenticado",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponse(responseCode = "200", description = "Lista de favoritos obtenida exitosamente")
    @GetMapping
    public ResponseEntity<List<FavoritoDTO>> obtenerFavoritos() {
        String username = obtenerUsernameAutenticado();
        List<FavoritoDTO> favoritos = favoritoService.obtenerFavoritos(username);
        return ResponseEntity.ok(favoritos);
    }
    
    @Operation(
        summary = "Agregar experiencia a favoritos",
        description = "Marca una experiencia como favorita (idempotente - no genera error si ya existe)",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponse(responseCode = "200", description = "Experiencia agregada a favoritos exitosamente")
    @PostMapping
    public ResponseEntity<?> agregarFavorito(@Valid @RequestBody AddFavoritoRequest request) {
        try {
            String username = obtenerUsernameAutenticado();
            FavoritoDTO favorito = favoritoService.agregarFavorito(username, request.getExperienciaId());
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Experiencia agregada a favoritos");
            response.put("favorito", favorito);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @Operation(
        summary = "Eliminar experiencia de favoritos",
        description = "Elimina una experiencia de la lista de favoritos del usuario",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponse(responseCode = "200", description = "Experiencia eliminada de favoritos exitosamente")
    @DeleteMapping("/{experienciaId}")
    public ResponseEntity<?> eliminarFavorito(@PathVariable Long experienciaId) {
        try {
            String username = obtenerUsernameAutenticado();
            favoritoService.eliminarFavorito(username, experienciaId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Experiencia eliminada de favoritos");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @Operation(
        summary = "Verificar si una experiencia es favorita",
        description = "Verifica si una experiencia específica está en la lista de favoritos del usuario",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponse(responseCode = "200", description = "Verificación realizada exitosamente")
    @GetMapping("/check/{experienciaId}")
    public ResponseEntity<?> verificarFavorito(@PathVariable Long experienciaId) {
        try {
            String username = obtenerUsernameAutenticado();
            boolean esFavorito = favoritoService.esFavorito(username, experienciaId);
            Map<String, Boolean> response = new HashMap<>();
            response.put("esFavorito", esFavorito);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Helper para obtener el username del usuario autenticado
     */
    private String obtenerUsernameAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}

