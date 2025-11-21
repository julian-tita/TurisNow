package app.TurisNow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que representa un punto de datos en el tiempo para la gráfica de KPIs.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KpiDataPoint {
    private String fecha; // Ej: "2024-01-15", "2024-W03", "2024-01"
    private Double valor;
}
