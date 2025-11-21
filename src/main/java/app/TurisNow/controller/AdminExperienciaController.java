package app.TurisNow.controller;

import app.TurisNow.dto.ExperienciaAdminRequest;
import app.TurisNow.dto.ExperienciaAdminResponse;
import app.TurisNow.service.AdminExperienciaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controlador REST para operaciones administrativas sobre experiencias.
 * Requiere autenticación y rol ADMIN.
 */
@RestController
@RequestMapping("/api/admin/experiencias")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin - Experiencias", description = "Endpoints CRUD para gestión de experiencias")
@SecurityRequirement(name = "bearerAuth")
public class AdminExperienciaController {

    private final AdminExperienciaService adminExperienciaService;

    /**
     * Listar todas las experiencias con paginación.
     */
    @Operation(
        summary = "Listar experiencias",
        description = "Obtiene un listado paginado de todas las experiencias con información administrativa"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Listado obtenido exitosamente"),
        @ApiResponse(responseCode = "401", description = "No autenticado"),
        @ApiResponse(responseCode = "403", description = "Sin permisos de administrador")
    })
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ExperienciaAdminResponse>> listarExperiencias(
            @Parameter(description = "Número de página (0-indexed)") 
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamaño de página") 
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Campo de ordenamiento") 
            @RequestParam(defaultValue = "id") String sortBy,
            @Parameter(description = "Dirección de ordenamiento") 
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") 
            ? Sort.by(sortBy).ascending() 
            : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ExperienciaAdminResponse> experiencias = adminExperienciaService.listarExperiencias(pageable);
        
        return ResponseEntity.ok(experiencias);
    }

    /**
     * Obtener una experiencia por ID.
     */
    @Operation(summary = "Obtener experiencia", description = "Obtiene los detalles completos de una experiencia")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Experiencia encontrada"),
        @ApiResponse(responseCode = "404", description = "Experiencia no encontrada"),
        @ApiResponse(responseCode = "401", description = "No autenticado"),
        @ApiResponse(responseCode = "403", description = "Sin permisos de administrador")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExperienciaAdminResponse> obtenerExperiencia(
            @Parameter(description = "ID de la experiencia") 
            @PathVariable Long id
    ) {
        try {
            ExperienciaAdminResponse experiencia = adminExperienciaService.obtenerExperiencia(id);
            return ResponseEntity.ok(experiencia);
        } catch (RuntimeException e) {
            log.error("Error al obtener experiencia {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Crear una nueva experiencia.
     */
    @Operation(summary = "Crear experiencia", description = "Crea una nueva experiencia en el sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Experiencia creada exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "401", description = "No autenticado"),
        @ApiResponse(responseCode = "403", description = "Sin permisos de administrador")
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> crearExperiencia(
            @Valid @RequestBody ExperienciaAdminRequest request
    ) {
        try {
            ExperienciaAdminResponse experiencia = adminExperienciaService.crearExperiencia(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(experiencia);
        } catch (RuntimeException e) {
            log.error("Error al crear experiencia: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Actualizar una experiencia existente.
     */
    @Operation(summary = "Actualizar experiencia", description = "Actualiza los datos de una experiencia existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Experiencia actualizada exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "404", description = "Experiencia no encontrada"),
        @ApiResponse(responseCode = "401", description = "No autenticado"),
        @ApiResponse(responseCode = "403", description = "Sin permisos de administrador")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> actualizarExperiencia(
            @Parameter(description = "ID de la experiencia") 
            @PathVariable Long id,
            @Valid @RequestBody ExperienciaAdminRequest request
    ) {
        try {
            ExperienciaAdminResponse experiencia = adminExperienciaService.actualizarExperiencia(id, request);
            return ResponseEntity.ok(experiencia);
        } catch (RuntimeException e) {
            log.error("Error al actualizar experiencia {}: {}", id, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return e.getMessage().contains("no encontrada") 
                ? ResponseEntity.notFound().build()
                : ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Eliminar una experiencia.
     */
    @Operation(summary = "Eliminar experiencia", description = "Elimina una experiencia del sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Experiencia eliminada exitosamente"),
        @ApiResponse(responseCode = "400", description = "No se puede eliminar (tiene dependencias)"),
        @ApiResponse(responseCode = "404", description = "Experiencia no encontrada"),
        @ApiResponse(responseCode = "401", description = "No autenticado"),
        @ApiResponse(responseCode = "403", description = "Sin permisos de administrador")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminarExperiencia(
            @Parameter(description = "ID de la experiencia") 
            @PathVariable Long id
    ) {
        try {
            adminExperienciaService.eliminarExperiencia(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Error al eliminar experiencia {}: {}", id, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return e.getMessage().contains("no encontrada") 
                ? ResponseEntity.notFound().build()
                : ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Buscar experiencias por query.
     */
    @Operation(summary = "Buscar experiencias", description = "Busca experiencias por título o ubicación")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Búsqueda realizada exitosamente"),
        @ApiResponse(responseCode = "401", description = "No autenticado"),
        @ApiResponse(responseCode = "403", description = "Sin permisos de administrador")
    })
    @GetMapping("/buscar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ExperienciaAdminResponse>> buscarExperiencias(
            @Parameter(description = "Texto de búsqueda") 
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ExperienciaAdminResponse> experiencias = adminExperienciaService.buscarExperiencias(q, pageable);
        return ResponseEntity.ok(experiencias);
    }
}
