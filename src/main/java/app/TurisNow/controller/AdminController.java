package app.TurisNow.controller;

import app.TurisNow.dto.ChangeRoleRequest;
import app.TurisNow.dto.ChangeStatusRequest;
import app.TurisNow.dto.UsuarioAdminDTO;
import app.TurisNow.model.Usuario;
import app.TurisNow.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@Tag(name = "Administración", description = "Endpoints para administración de usuarios (solo ADMIN)")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Operation(
        summary = "Listar usuarios (ADMIN)",
        description = "Obtiene una lista paginada y filtrable de todos los usuarios del sistema",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponse(responseCode = "200", description = "Lista de usuarios obtenida exitosamente")
    @GetMapping("/users")
    public ResponseEntity<Page<UsuarioAdminDTO>> listarUsuarios(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Usuario.Rol rol,
            @RequestParam(required = false) Boolean activo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("ASC") 
            ? Sort.by(sortBy).ascending() 
            : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Usuario> usuarios = usuarioRepository.buscarUsuarios(query, rol, activo, pageable);
        Page<UsuarioAdminDTO> usuariosDTO = usuarios.map(UsuarioAdminDTO::new);
        
        return ResponseEntity.ok(usuariosDTO);
    }
    
    @Operation(
        summary = "Obtener usuario por ID (ADMIN)",
        description = "Obtiene los detalles completos de un usuario específico",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponse(responseCode = "200", description = "Usuario obtenido exitosamente")
    @GetMapping("/users/{id}")
    public ResponseEntity<?> obtenerUsuario(@PathVariable Long id) {
        try {
            Usuario usuario = usuarioRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            return ResponseEntity.ok(new UsuarioAdminDTO(usuario));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @Operation(
        summary = "Cambiar rol de usuario (ADMIN)",
        description = "Cambia el rol de un usuario entre USER y ADMIN",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponse(responseCode = "200", description = "Rol cambiado exitosamente")
    @PatchMapping("/users/{id}/role")
    public ResponseEntity<?> cambiarRol(
            @PathVariable Long id,
            @Valid @RequestBody ChangeRoleRequest request) {
        try {
            Usuario usuario = usuarioRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            usuario.setRol(request.getRol());
            usuarioRepository.save(usuario);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Rol actualizado exitosamente");
            response.put("usuario", new UsuarioAdminDTO(usuario));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @Operation(
        summary = "Cambiar estado de usuario (ADMIN)",
        description = "Activa o desactiva una cuenta de usuario",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponse(responseCode = "200", description = "Estado cambiado exitosamente")
    @PatchMapping("/users/{id}/status")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody ChangeStatusRequest request) {
        try {
            Usuario usuario = usuarioRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            usuario.setActivo(request.getActivo());
            usuarioRepository.save(usuario);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Estado actualizado exitosamente");
            response.put("usuario", new UsuarioAdminDTO(usuario));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @Operation(
        summary = "Eliminar usuario (ADMIN)",
        description = "Elimina permanentemente un usuario del sistema",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponse(responseCode = "200", description = "Usuario eliminado exitosamente")
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        try {
            Usuario usuario = usuarioRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            // Evitar que un admin se elimine a sí mismo
            // (opcional, dependiendo de las reglas de negocio)
            
            usuarioRepository.delete(usuario);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Usuario eliminado exitosamente");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @Operation(
        summary = "Estadísticas de usuarios (ADMIN)",
        description = "Obtiene estadísticas generales del sistema de usuarios",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponse(responseCode = "200", description = "Estadísticas obtenidas exitosamente")
    @GetMapping("/users/stats")
    public ResponseEntity<?> obtenerEstadisticas() {
        long totalUsuarios = usuarioRepository.count();
        long usuariosActivos = usuarioRepository.buscarUsuarios(null, null, true, Pageable.unpaged()).getTotalElements();
        long usuariosInactivos = usuarioRepository.buscarUsuarios(null, null, false, Pageable.unpaged()).getTotalElements();
        long admins = usuarioRepository.buscarUsuarios(null, Usuario.Rol.ADMIN, null, Pageable.unpaged()).getTotalElements();
        long users = usuarioRepository.buscarUsuarios(null, Usuario.Rol.USER, null, Pageable.unpaged()).getTotalElements();
        
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsuarios", totalUsuarios);
        stats.put("usuariosActivos", usuariosActivos);
        stats.put("usuariosInactivos", usuariosInactivos);
        stats.put("administradores", admins);
        stats.put("usuariosRegulares", users);
        
        return ResponseEntity.ok(stats);
    }
}

