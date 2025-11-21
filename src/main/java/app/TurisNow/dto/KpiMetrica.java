package app.TurisNow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO que representa una métrica individual de KPI con su valor, variación y datos históricos.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KpiMetrica {
    private String nombre; // Ej: "Ingresos Totales", "Reservas Activas"
    private BigDecimal valor; // Valor actual
    private Double variacion; // Porcentaje de variación respecto al periodo anterior (positivo o negativo)
    private String tendencia; // "up" | "down" | "stable"
    private List<KpiDataPoint> datos; // Datos para el gráfico temporal
}
