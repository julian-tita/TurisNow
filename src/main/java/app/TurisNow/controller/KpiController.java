package app.TurisNow.controller;

import app.TurisNow.dto.KpiResponse;
import app.TurisNow.service.KpiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para endpoints administrativos de KPIs.
 * Requiere autenticación y rol ADMIN.
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin - KPIs", description = "Endpoints para métricas y estadísticas del dashboard administrativo")
@SecurityRequirement(name = "bearerAuth")
public class KpiController {

    private final KpiService kpiService;

    /**
     * Endpoint para obtener KPIs del dashboard administrativo.
     * 
     * @param periodo El periodo de tiempo: "dia", "semana", "mes", "año"
     * @return ResponseEntity con las métricas calculadas
     */
    @Operation(
        summary = "Obtener KPIs del dashboard",
        description = "Retorna todas las métricas KPI del dashboard administrativo para el periodo especificado. Incluye ingresos totales, reservas activas, nuevos usuarios y tasa de conversión."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "KPIs obtenidos exitosamente",
            content = @Content(schema = @Schema(implementation = KpiResponse.class))
        ),
        @ApiResponse(
            responseCode = "401", 
            description = "No autenticado"
        ),
        @ApiResponse(
            responseCode = "403", 
            description = "Sin permisos de administrador"
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "Periodo inválido"
        )
    })
    @GetMapping("/kpis")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<KpiResponse> obtenerKpis(
            @Parameter(description = "Periodo de tiempo para las métricas", example = "mes")
            @RequestParam(defaultValue = "mes") String periodo
    ) {
        log.info("Solicitando KPIs para periodo: {}", periodo);
        
        // Validar periodo
        if (!periodo.matches("(?i)(dia|semana|mes|año)")) {
            log.warn("Periodo inválido recibido: {}", periodo);
            return ResponseEntity.badRequest().build();
        }
        
        try {
            KpiResponse response = kpiService.obtenerKpis(periodo.toLowerCase());
            log.info("KPIs calculados exitosamente para periodo: {}", periodo);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al calcular KPIs para periodo {}: {}", periodo, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
