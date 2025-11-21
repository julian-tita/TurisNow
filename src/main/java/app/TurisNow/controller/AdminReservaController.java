package app.TurisNow.controller;

import app.TurisNow.dto.ReservaAdminResponse;
import app.TurisNow.service.AdminReservaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
 * Controlador REST para operaciones administrativas sobre reservas.
 */
@RestController
@RequestMapping("/api/admin/reservas")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin - Reservas", description = "Endpoints para gestión de reservas y pagos")
@SecurityRequirement(name = "bearerAuth")
public class AdminReservaController {

    private final AdminReservaService adminReservaService;

    @Operation(summary = "Listar reservas", description = "Obtiene un listado paginado de todas las reservas")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ReservaAdminResponse>> listarReservas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fechaReserva") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @Parameter(description = "Filtrar por estado") @RequestParam(required = false) String estado
    ) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") 
            ? Sort.by(sortBy).ascending() 
            : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ReservaAdminResponse> reservas = estado != null && !estado.isEmpty()
            ? adminReservaService.filtrarPorEstado(estado, pageable)
            : adminReservaService.listarReservas(pageable);
        
        return ResponseEntity.ok(reservas);
    }

    @Operation(summary = "Obtener reserva", description = "Obtiene los detalles completos de una reserva")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReservaAdminResponse> obtenerReserva(@PathVariable Long id) {
        try {
            ReservaAdminResponse reserva = adminReservaService.obtenerReserva(id);
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            log.error("Error al obtener reserva {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Cancelar reserva", description = "Cancela una reserva y libera la capacidad")
    @PostMapping("/{id}/cancelar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> cancelarReserva(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        try {
            String motivo = body != null ? body.get("motivo") : null;
            ReservaAdminResponse reserva = adminReservaService.cancelarReserva(id, motivo);
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            log.error("Error al cancelar reserva {}: {}", id, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return e.getMessage().contains("no encontrada") 
                ? ResponseEntity.notFound().build()
                : ResponseEntity.badRequest().body(error);
        }
    }

    @Operation(summary = "Completar reserva", description = "Marca una reserva como completada")
    @PostMapping("/{id}/completar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> completarReserva(@PathVariable Long id) {
        try {
            ReservaAdminResponse reserva = adminReservaService.completarReserva(id);
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            log.error("Error al completar reserva {}: {}", id, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return e.getMessage().contains("no encontrada") 
                ? ResponseEntity.notFound().build()
                : ResponseEntity.badRequest().body(error);
        }
    }

    @Operation(summary = "Realizar check-in", description = "Realiza el check-in de una reserva")
    @PostMapping("/{id}/checkin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> realizarCheckin(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        try {
            String checkinPor = body.get("checkinPor");
            ReservaAdminResponse reserva = adminReservaService.realizarCheckin(id, checkinPor);
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            log.error("Error al realizar check-in de reserva {}: {}", id, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return e.getMessage().contains("no encontrada") 
                ? ResponseEntity.notFound().build()
                : ResponseEntity.badRequest().body(error);
        }
    }
}
