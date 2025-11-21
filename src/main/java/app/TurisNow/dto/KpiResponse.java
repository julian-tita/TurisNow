package app.TurisNow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO de respuesta para el endpoint de KPIs.
 * Contiene todas las métricas organizadas por nombre.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KpiResponse {
    private String periodo; // "dia", "semana", "mes", "año"
    private Map<String, KpiMetrica> metricas; // Mapeo de nombre_metrica -> KpiMetrica
}
