package app.TurisNow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de respuesta con información de una salida para admin.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalidaAdminResponse {
    private Long id;
    private Long experienciaId;
    private String experienciaTitulo;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private Integer capacidadTotal;
    private Integer capacidadDisponible;
    private Integer reservasActivas;
    private String estado; // "DISPONIBLE", "COMPLETA", "PASADA"
}
