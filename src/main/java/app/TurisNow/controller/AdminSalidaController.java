package app.TurisNow.controller;

import app.TurisNow.dto.SalidaAdminRequest;
import app.TurisNow.dto.SalidaAdminResponse;
import app.TurisNow.service.AdminSalidaService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controlador REST para operaciones administrativas sobre salidas.
 */
@RestController
@RequestMapping("/api/admin/salidas")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin - Salidas", description = "Endpoints CRUD para gestión de salidas")
@SecurityRequirement(name = "bearerAuth")
public class AdminSalidaController {

    private final AdminSalidaService adminSalidaService;

    @Operation(summary = "Listar salidas", description = "Obtiene un listado paginado de todas las salidas")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<SalidaAdminResponse>> listarSalidas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fechaInicio") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir,
            @Parameter(description = "Filtrar por experiencia") @RequestParam(required = false) Long experienciaId
    ) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") 
            ? Sort.by(sortBy).ascending() 
            : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<SalidaAdminResponse> salidas = experienciaId != null
            ? adminSalidaService.listarSalidasPorExperiencia(experienciaId, pageable)
            : adminSalidaService.listarSalidas(pageable);
        
        return ResponseEntity.ok(salidas);
    }

    @Operation(summary = "Obtener salida", description = "Obtiene los detalles de una salida")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SalidaAdminResponse> obtenerSalida(@PathVariable Long id) {
        try {
            SalidaAdminResponse salida = adminSalidaService.obtenerSalida(id);
            return ResponseEntity.ok(salida);
        } catch (RuntimeException e) {
            log.error("Error al obtener salida {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Crear salida", description = "Crea una nueva salida para una experiencia")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> crearSalida(@Valid @RequestBody SalidaAdminRequest request) {
        try {
            SalidaAdminResponse salida = adminSalidaService.crearSalida(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(salida);
        } catch (RuntimeException e) {
            log.error("Error al crear salida: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @Operation(summary = "Actualizar salida", description = "Actualiza los datos de una salida")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> actualizarSalida(
            @PathVariable Long id,
            @Valid @RequestBody SalidaAdminRequest request
    ) {
        try {
            SalidaAdminResponse salida = adminSalidaService.actualizarSalida(id, request);
            return ResponseEntity.ok(salida);
        } catch (RuntimeException e) {
            log.error("Error al actualizar salida {}: {}", id, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return e.getMessage().contains("no encontrada") 
                ? ResponseEntity.notFound().build()
                : ResponseEntity.badRequest().body(error);
        }
    }

    @Operation(summary = "Eliminar salida", description = "Elimina una salida del sistema")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminarSalida(@PathVariable Long id) {
        try {
            adminSalidaService.eliminarSalida(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Error al eliminar salida {}: {}", id, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return e.getMessage().contains("no encontrada") 
                ? ResponseEntity.notFound().build()
                : ResponseEntity.badRequest().body(error);
        }
    }
}
