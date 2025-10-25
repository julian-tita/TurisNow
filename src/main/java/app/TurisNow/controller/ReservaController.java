package app.TurisNow.controller;

import app.TurisNow.dto.ReservaDetalleDTO;
import app.TurisNow.dto.ReservaRequest;
import app.TurisNow.dto.ReservaResponse;
import app.TurisNow.model.Reserva;
import app.TurisNow.service.ReservaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Reservas", description = "Endpoints para gestión de reservas de experiencias")
public class ReservaController {
    
    private final ReservaService reservaService;
    
    /**
     * Crear una nueva reserva
     */
    @Operation(summary = "Crear reserva", description = "Crea una nueva reserva para una experiencia")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Reserva creada exitosamente", 
                    content = @Content(schema = @Schema(implementation = ReservaResponse.class))),
        @ApiResponse(responseCode = "400", description = "Error en la creación de la reserva", 
                    content = @Content(schema = @Schema(implementation = ReservaResponse.class)))
    })
    @PostMapping
    public ResponseEntity<ReservaResponse> crearReserva(@Valid @RequestBody ReservaRequest request) {
        Long usuarioId = obtenerUsuarioIdActual();
        ReservaResponse response = reservaService.crearReserva(request, usuarioId);
        
        if (response.getMensaje().contains("exitosamente")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Obtener reservas del usuario actual (versión simplificada)
     */
    @Operation(summary = "Obtener mis reservas", description = "Obtiene todas las reservas del usuario autenticado")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de reservas obtenida exitosamente")
    })
    @GetMapping("/mis-reservas")
    public ResponseEntity<List<ReservaDetalleDTO>> obtenerMisReservas() {
        try {
            Long usuarioId = obtenerUsuarioIdActual();
            // Usar el método existente pero convertir Page a List
            Page<ReservaDetalleDTO> reservasPage = reservaService.obtenerReservasUsuario(usuarioId, 
                org.springframework.data.domain.PageRequest.of(0, 1000, 
                    org.springframework.data.domain.Sort.by("fechaReserva").descending()));
            List<ReservaDetalleDTO> reservas = reservasPage.getContent();
            return ResponseEntity.ok(reservas);
        } catch (Exception e) {
            // Si hay error de autenticación, devolver lista vacía
            return ResponseEntity.ok(List.of());
        }
    }
    
    
    /**
     * Obtener reservas del usuario por estado
     */
    @Operation(summary = "Obtener reservas por estado", description = "Obtiene las reservas del usuario filtradas por estado")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de reservas obtenida exitosamente")
    })
    @GetMapping("/mis-reservas/estado/{estado}")
    public ResponseEntity<Page<ReservaDetalleDTO>> obtenerReservasPorEstado(
            @PathVariable String estado,
            @PageableDefault(size = 10, sort = "fechaReserva", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {
        Long usuarioId = obtenerUsuarioIdActual();
        Reserva.EstadoReserva estadoReserva = mapearEstadoReserva(estado);
        Page<ReservaDetalleDTO> reservas = reservaService.obtenerReservasUsuarioPorEstado(usuarioId, estadoReserva, pageable);
        return ResponseEntity.ok(reservas);
    }
    
    /**
     * Obtener detalle de una reserva específica
     */
    @Operation(summary = "Obtener detalle de reserva", description = "Obtiene el detalle completo de una reserva específica")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Detalle de reserva obtenido exitosamente"),
        @ApiResponse(responseCode = "404", description = "Reserva no encontrada"),
        @ApiResponse(responseCode = "403", description = "No tienes permisos para ver esta reserva")
    })
    @GetMapping("/{reservaId}")
    public ResponseEntity<ReservaDetalleDTO> obtenerReservaPorId(@PathVariable Long reservaId) {
        Long usuarioId = obtenerUsuarioIdActual();
        try {
            ReservaDetalleDTO reserva = reservaService.obtenerReservaPorId(reservaId, usuarioId);
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
    
    /**
     * Confirmar una reserva
     */
    @Operation(summary = "Confirmar reserva", description = "Confirma una reserva pendiente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Reserva confirmada exitosamente", 
                    content = @Content(schema = @Schema(implementation = ReservaResponse.class))),
        @ApiResponse(responseCode = "400", description = "Error al confirmar la reserva", 
                    content = @Content(schema = @Schema(implementation = ReservaResponse.class)))
    })
    @PutMapping("/{reservaId}/confirmar")
    public ResponseEntity<ReservaResponse> confirmarReserva(@PathVariable Long reservaId) {
        Long usuarioId = obtenerUsuarioIdActual();
        ReservaResponse response = reservaService.confirmarReserva(reservaId, usuarioId);
        
        if (response.getMensaje().contains("exitosamente")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Cancelar una reserva
     */
    @Operation(summary = "Cancelar reserva", description = "Cancela una reserva (siempre que no sea muy tarde)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Reserva cancelada exitosamente", 
                    content = @Content(schema = @Schema(implementation = ReservaResponse.class))),
        @ApiResponse(responseCode = "400", description = "Error al cancelar la reserva", 
                    content = @Content(schema = @Schema(implementation = ReservaResponse.class)))
    })
    @PutMapping("/{reservaId}/cancelar")
    public ResponseEntity<ReservaResponse> cancelarReserva(@PathVariable Long reservaId) {
        Long usuarioId = obtenerUsuarioIdActual();
        ReservaResponse response = reservaService.cancelarReserva(reservaId, usuarioId);
        
        if (response.getMensaje().contains("exitosamente")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Obtener estadísticas de reservas del usuario
     */
    @Operation(summary = "Obtener estadísticas", description = "Obtiene estadísticas de las reservas del usuario")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Estadísticas obtenidas exitosamente")
    })
    @GetMapping("/mis-reservas/estadisticas")
    public ResponseEntity<ReservaDetalleDTO.EstadisticasDTO> obtenerEstadisticas() {
        Long usuarioId = obtenerUsuarioIdActual();
        ReservaDetalleDTO.EstadisticasDTO estadisticas = reservaService.obtenerEstadisticasUsuario(usuarioId);
        return ResponseEntity.ok(estadisticas);
    }
    
    /**
     * Obtener el ID del usuario actual desde el contexto de seguridad
     */
    private Long obtenerUsuarioIdActual() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            String username = authentication.getName();
            // Buscar el usuario por username para obtener su ID
            return reservaService.obtenerUsuarioIdPorUsername(username);
        }
        throw new RuntimeException("Usuario no autenticado");
    }
    
    /**
     * Mapear string de estado a enum
     */
    private Reserva.EstadoReserva mapearEstadoReserva(String estado) {
        return switch (estado.toUpperCase()) {
            case "PENDIENTE" -> Reserva.EstadoReserva.PENDIENTE;
            case "CONFIRMADA" -> Reserva.EstadoReserva.CONFIRMADA;
            case "CANCELADA" -> Reserva.EstadoReserva.CANCELADA;
            case "COMPLETADA" -> Reserva.EstadoReserva.COMPLETADA;
            default -> throw new IllegalArgumentException("Estado de reserva no válido: " + estado);
        };
    }
}
