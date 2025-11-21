package app.TurisNow.controller;

import app.TurisNow.dto.UsuarioAdminRequest;
import app.TurisNow.dto.UsuarioAdminResponse;
import app.TurisNow.service.AdminUsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controlador REST para operaciones administrativas sobre usuarios.
 */
@RestController
@RequestMapping("/api/admin/usuarios")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin - Usuarios", description = "Endpoints para gestión de usuarios")
@SecurityRequirement(name = "bearerAuth")
public class AdminUsuarioController {

    private final AdminUsuarioService adminUsuarioService;

    @Operation(summary = "Listar usuarios", description = "Obtiene un listado paginado de todos los usuarios")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UsuarioAdminResponse>> listarUsuarios(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @Parameter(description = "Búsqueda por nombre, email o username") @RequestParam(required = false) String q,
            @Parameter(description = "Filtrar por rol") @RequestParam(required = false) String rol
    ) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") 
            ? Sort.by(sortBy).ascending() 
            : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<UsuarioAdminResponse> usuarios;
        
        if (q != null && !q.isEmpty()) {
            usuarios = adminUsuarioService.buscarUsuarios(q, pageable);
        } else if (rol != null && !rol.isEmpty()) {
            usuarios = adminUsuarioService.filtrarPorRol(rol, pageable);
        } else {
            usuarios = adminUsuarioService.listarUsuarios(pageable);
        }
        
        return ResponseEntity.ok(usuarios);
    }

    @Operation(summary = "Obtener usuario", description = "Obtiene los detalles de un usuario")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioAdminResponse> obtenerUsuario(@PathVariable Long id) {
        try {
            UsuarioAdminResponse usuario = adminUsuarioService.obtenerUsuario(id);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            log.error("Error al obtener usuario {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Actualizar usuario", description = "Actualiza los datos de un usuario")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> actualizarUsuario(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioAdminRequest request
    ) {
        try {
            UsuarioAdminResponse usuario = adminUsuarioService.actualizarUsuario(id, request);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            log.error("Error al actualizar usuario {}: {}", id, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return e.getMessage().contains("no encontrado") 
                ? ResponseEntity.notFound().build()
                : ResponseEntity.badRequest().body(error);
        }
    }

    @Operation(summary = "Cambiar rol", description = "Cambia el rol de un usuario")
    @PatchMapping("/{id}/rol")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> cambiarRol(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        try {
            String nuevoRol = body.get("rol");
            if (nuevoRol == null || nuevoRol.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El rol es obligatorio");
                return ResponseEntity.badRequest().body(error);
            }
            
            UsuarioAdminResponse usuario = adminUsuarioService.cambiarRol(id, nuevoRol);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            log.error("Error al cambiar rol del usuario {}: {}", id, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return e.getMessage().contains("no encontrado") 
                ? ResponseEntity.notFound().build()
                : ResponseEntity.badRequest().body(error);
        }
    }

    @Operation(summary = "Activar/Desactivar usuario", description = "Cambia el estado activo de un usuario")
    @PatchMapping("/{id}/toggle-activo")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleActivo(@PathVariable Long id) {
        try {
            UsuarioAdminResponse usuario = adminUsuarioService.toggleActivo(id);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            log.error("Error al cambiar estado del usuario {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
