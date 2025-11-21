package app.TurisNow.service;

import app.TurisNow.dto.KpiDataPoint;
import app.TurisNow.dto.KpiMetrica;
import app.TurisNow.dto.KpiResponse;
import app.TurisNow.model.Pago;
import app.TurisNow.model.Reserva;
import app.TurisNow.repository.PagoRepository;
import app.TurisNow.repository.ReservaRepository;
import app.TurisNow.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Servicio para calcular KPIs del dashboard administrativo.
 * Calcula métricas en tiempo real desde la base de datos.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KpiService {

    private final PagoRepository pagoRepository;
    private final ReservaRepository reservaRepository;
    private final UsuarioRepository usuarioRepository;

    /**
     * Obtiene todas las métricas KPI para el periodo especificado.
     *
     * @param periodo "dia", "semana", "mes", "año"
     * @return KpiResponse con todas las métricas calculadas
     */
    @Transactional(readOnly = true)
    public KpiResponse obtenerKpis(String periodo) {
        log.info("Calculando KPIs para periodo: {}", periodo);

        // Determinar rango de fechas según el periodo
        PeriodoInfo periodoInfo = calcularPeriodo(periodo);

        // Calcular cada métrica
        KpiMetrica ingresosTotales = calcularIngresosTotales(periodoInfo);
        KpiMetrica reservasActivas = calcularReservasActivas(periodoInfo);
        KpiMetrica nuevosUsuarios = calcularNuevosUsuarios(periodoInfo);
        KpiMetrica tasaConversion = calcularTasaConversion(periodoInfo);

        // Construir respuesta
        Map<String, KpiMetrica> metricas = new LinkedHashMap<>();
        metricas.put("ingresosTotales", ingresosTotales);
        metricas.put("reservasActivas", reservasActivas);
        metricas.put("nuevosUsuarios", nuevosUsuarios);
        metricas.put("tasaConversion", tasaConversion);

        return new KpiResponse(periodo, metricas);
    }

    /**
     * Calcula ingresos totales del periodo actual y su variación.
     */
    private KpiMetrica calcularIngresosTotales(PeriodoInfo periodoInfo) {
        // Obtener pagos aprobados del periodo actual
        List<Pago> pagosActuales = pagoRepository.findAll().stream()
                .filter(p -> p.getEstado() == Pago.EstadoPago.APPROVED)
                .filter(p -> p.getFechaAprobacion() != null)
                .filter(p -> estaEnRango(p.getFechaAprobacion(), periodoInfo.fechaInicio, periodoInfo.fechaFin))
                .collect(Collectors.toList());

        BigDecimal totalActual = pagosActuales.stream()
                .map(Pago::getMontoTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Obtener pagos del periodo anterior
        List<Pago> pagosAnteriores = pagoRepository.findAll().stream()
                .filter(p -> p.getEstado() == Pago.EstadoPago.APPROVED)
                .filter(p -> p.getFechaAprobacion() != null)
                .filter(p -> estaEnRango(p.getFechaAprobacion(), periodoInfo.fechaInicioAnterior, periodoInfo.fechaFinAnterior))
                .collect(Collectors.toList());

        BigDecimal totalAnterior = pagosAnteriores.stream()
                .map(Pago::getMontoTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calcular variación
        double variacion = calcularVariacion(totalActual, totalAnterior);
        String tendencia = calcularTendencia(variacion);

        // Generar datos para gráfico
        List<KpiDataPoint> datos = generarDatosGrafico(pagosActuales, periodoInfo);

        return new KpiMetrica("Ingresos Totales", totalActual, variacion, tendencia, datos);
    }

    /**
     * Calcula el número de reservas activas (CONFIRMADA o PENDIENTE).
     */
    private KpiMetrica calcularReservasActivas(PeriodoInfo periodoInfo) {
        // Reservas activas del periodo actual
        List<Reserva> reservasActuales = reservaRepository.findAll().stream()
                .filter(r -> r.getEstado() == Reserva.EstadoReserva.CONFIRMADA || 
                             r.getEstado() == Reserva.EstadoReserva.PENDIENTE)
                .filter(r -> estaEnRango(r.getFechaReserva(), periodoInfo.fechaInicio, periodoInfo.fechaFin))
                .collect(Collectors.toList());

        BigDecimal totalActual = BigDecimal.valueOf(reservasActuales.size());

        // Reservas activas del periodo anterior
        List<Reserva> reservasAnteriores = reservaRepository.findAll().stream()
                .filter(r -> r.getEstado() == Reserva.EstadoReserva.CONFIRMADA || 
                             r.getEstado() == Reserva.EstadoReserva.PENDIENTE)
                .filter(r -> estaEnRango(r.getFechaReserva(), periodoInfo.fechaInicioAnterior, periodoInfo.fechaFinAnterior))
                .collect(Collectors.toList());

        BigDecimal totalAnterior = BigDecimal.valueOf(reservasAnteriores.size());

        double variacion = calcularVariacion(totalActual, totalAnterior);
        String tendencia = calcularTendencia(variacion);

        // Datos para gráfico
        List<KpiDataPoint> datos = generarDatosGraficoReservas(reservasActuales, periodoInfo);

        return new KpiMetrica("Reservas Activas", totalActual, variacion, tendencia, datos);
    }

    /**
     * Calcula el número de nuevos usuarios registrados en el periodo.
     */
    private KpiMetrica calcularNuevosUsuarios(PeriodoInfo periodoInfo) {
        List<app.TurisNow.model.Usuario> usuariosActuales = usuarioRepository.findAll().stream()
                .filter(u -> u.getFechaCreacion() != null)
                .filter(u -> estaEnRango(u.getFechaCreacion(), periodoInfo.fechaInicio, periodoInfo.fechaFin))
                .collect(Collectors.toList());

        BigDecimal totalActual = BigDecimal.valueOf(usuariosActuales.size());

        List<app.TurisNow.model.Usuario> usuariosAnteriores = usuarioRepository.findAll().stream()
                .filter(u -> u.getFechaCreacion() != null)
                .filter(u -> estaEnRango(u.getFechaCreacion(), periodoInfo.fechaInicioAnterior, periodoInfo.fechaFinAnterior))
                .collect(Collectors.toList());

        BigDecimal totalAnterior = BigDecimal.valueOf(usuariosAnteriores.size());

        double variacion = calcularVariacion(totalActual, totalAnterior);
        String tendencia = calcularTendencia(variacion);

        List<KpiDataPoint> datos = generarDatosGraficoUsuarios(usuariosActuales, periodoInfo);

        return new KpiMetrica("Nuevos Usuarios", totalActual, variacion, tendencia, datos);
    }

    /**
     * Calcula la tasa de conversión (% de reservas confirmadas vs totales).
     */
    private KpiMetrica calcularTasaConversion(PeriodoInfo periodoInfo) {
        List<Reserva> todasReservasActuales = reservaRepository.findAll().stream()
                .filter(r -> estaEnRango(r.getFechaReserva(), periodoInfo.fechaInicio, periodoInfo.fechaFin))
                .collect(Collectors.toList());

        long confirmadasActuales = todasReservasActuales.stream()
                .filter(r -> r.getEstado() == Reserva.EstadoReserva.CONFIRMADA)
                .count();

        BigDecimal tasaActual = todasReservasActuales.isEmpty() ? BigDecimal.ZERO :
                BigDecimal.valueOf(confirmadasActuales)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(todasReservasActuales.size()), 2, RoundingMode.HALF_UP);

        // Periodo anterior
        List<Reserva> todasReservasAnteriores = reservaRepository.findAll().stream()
                .filter(r -> estaEnRango(r.getFechaReserva(), periodoInfo.fechaInicioAnterior, periodoInfo.fechaFinAnterior))
                .collect(Collectors.toList());

        long confirmadasAnteriores = todasReservasAnteriores.stream()
                .filter(r -> r.getEstado() == Reserva.EstadoReserva.CONFIRMADA)
                .count();

        BigDecimal tasaAnterior = todasReservasAnteriores.isEmpty() ? BigDecimal.ZERO :
                BigDecimal.valueOf(confirmadasAnteriores)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(todasReservasAnteriores.size()), 2, RoundingMode.HALF_UP);

        double variacion = calcularVariacion(tasaActual, tasaAnterior);
        String tendencia = calcularTendencia(variacion);

        // Datos del gráfico (tasa de conversión por subperiodo)
        List<KpiDataPoint> datos = generarDatosGraficoTasa(todasReservasActuales, periodoInfo);

        return new KpiMetrica("Tasa de Conversión", tasaActual, variacion, tendencia, datos);
    }

    // ========== Métodos auxiliares ==========

    /**
     * Calcula los rangos de fecha para el periodo actual y anterior.
     */
    private PeriodoInfo calcularPeriodo(String periodo) {
        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime fechaInicio, fechaFin, fechaInicioAnterior, fechaFinAnterior;
        int intervalos;

        switch (periodo.toLowerCase()) {
            case "dia":
                fechaInicio = ahora.toLocalDate().atStartOfDay();
                fechaFin = ahora;
                fechaFinAnterior = fechaInicio.minusNanos(1);
                fechaInicioAnterior = fechaInicio.minusDays(1);
                intervalos = 24; // Horas
                break;

            case "semana":
                fechaInicio = ahora.toLocalDate().with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY)).atStartOfDay();
                fechaFin = ahora;
                fechaFinAnterior = fechaInicio.minusNanos(1);
                fechaInicioAnterior = fechaInicio.minusWeeks(1);
                intervalos = 7; // Días
                break;

            case "mes":
                fechaInicio = ahora.toLocalDate().withDayOfMonth(1).atStartOfDay();
                fechaFin = ahora;
                fechaFinAnterior = fechaInicio.minusNanos(1);
                fechaInicioAnterior = fechaInicio.minusMonths(1);
                intervalos = 30; // Días (aproximado)
                break;

            case "año":
            default:
                fechaInicio = ahora.toLocalDate().withDayOfYear(1).atStartOfDay();
                fechaFin = ahora;
                fechaFinAnterior = fechaInicio.minusNanos(1);
                fechaInicioAnterior = fechaInicio.minusYears(1);
                intervalos = 12; // Meses
                break;
        }

        return new PeriodoInfo(fechaInicio, fechaFin, fechaInicioAnterior, fechaFinAnterior, intervalos, periodo);
    }

    private boolean estaEnRango(LocalDateTime fecha, LocalDateTime inicio, LocalDateTime fin) {
        return !fecha.isBefore(inicio) && !fecha.isAfter(fin);
    }

    /**
     * Calcula el porcentaje de variación entre dos valores.
     */
    private double calcularVariacion(BigDecimal actual, BigDecimal anterior) {
        if (anterior.compareTo(BigDecimal.ZERO) == 0) {
            return actual.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        return actual.subtract(anterior)
                .divide(anterior, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }

    private String calcularTendencia(double variacion) {
        if (variacion > 0.5) return "up";
        if (variacion < -0.5) return "down";
        return "stable";
    }

    /**
     * Genera puntos de datos para el gráfico de ingresos.
     */
    private List<KpiDataPoint> generarDatosGrafico(List<Pago> pagos, PeriodoInfo info) {
        Map<String, BigDecimal> agrupado = agruparPorFecha(
                pagos.stream().collect(Collectors.toMap(
                        p -> p.getFechaAprobacion(),
                        Pago::getMontoTotal,
                        BigDecimal::add
                )),
                info
        );

        return agrupado.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new KpiDataPoint(e.getKey(), e.getValue().doubleValue()))
                .collect(Collectors.toList());
    }

    private List<KpiDataPoint> generarDatosGraficoReservas(List<Reserva> reservas, PeriodoInfo info) {
        Map<String, Long> agrupado = reservas.stream()
                .collect(Collectors.groupingBy(
                        r -> formatearFecha(r.getFechaReserva(), info.periodo),
                        Collectors.counting()
                ));

        return completarDatosGrafico(agrupado, info).entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new KpiDataPoint(e.getKey(), e.getValue().doubleValue()))
                .collect(Collectors.toList());
    }

    private List<KpiDataPoint> generarDatosGraficoUsuarios(List<app.TurisNow.model.Usuario> usuarios, PeriodoInfo info) {
        Map<String, Long> agrupado = usuarios.stream()
                .collect(Collectors.groupingBy(
                        u -> formatearFecha(u.getFechaCreacion(), info.periodo),
                        Collectors.counting()
                ));

        return completarDatosGrafico(agrupado, info).entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new KpiDataPoint(e.getKey(), e.getValue().doubleValue()))
                .collect(Collectors.toList());
    }

    private List<KpiDataPoint> generarDatosGraficoTasa(List<Reserva> reservas, PeriodoInfo info) {
        Map<String, List<Reserva>> agrupado = reservas.stream()
                .collect(Collectors.groupingBy(r -> formatearFecha(r.getFechaReserva(), info.periodo)));

        Map<String, Double> tasas = agrupado.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> {
                            long total = e.getValue().size();
                            long confirmadas = e.getValue().stream()
                                    .filter(r -> r.getEstado() == Reserva.EstadoReserva.CONFIRMADA)
                                    .count();
                            return total == 0 ? 0.0 : (confirmadas * 100.0) / total;
                        }
                ));

        return completarDatosGraficoDouble(tasas, info).entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new KpiDataPoint(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }

    private Map<String, BigDecimal> agruparPorFecha(Map<LocalDateTime, BigDecimal> datos, PeriodoInfo info) {
        Map<String, BigDecimal> resultado = new LinkedHashMap<>();
        
        datos.forEach((fecha, valor) -> {
            String key = formatearFecha(fecha, info.periodo);
            resultado.merge(key, valor, BigDecimal::add);
        });

        return completarDatosGraficoBigDecimal(resultado, info);
    }

    private String formatearFecha(LocalDateTime fecha, String periodo) {
        switch (periodo.toLowerCase()) {
            case "dia":
                return fecha.format(DateTimeFormatter.ofPattern("HH:00"));
            case "semana":
                return fecha.format(DateTimeFormatter.ofPattern("EEE", new Locale("es", "ES")));
            case "mes":
                return fecha.format(DateTimeFormatter.ofPattern("dd/MM"));
            case "año":
            default:
                return fecha.format(DateTimeFormatter.ofPattern("MMM", new Locale("es", "ES")));
        }
    }

    private Map<String, Long> completarDatosGrafico(Map<String, Long> datos, PeriodoInfo info) {
        Map<String, Long> completo = new LinkedHashMap<>();
        LocalDateTime fecha = info.fechaInicio;

        while (!fecha.isAfter(info.fechaFin)) {
            String key = formatearFecha(fecha, info.periodo);
            completo.put(key, datos.getOrDefault(key, 0L));

            switch (info.periodo.toLowerCase()) {
                case "dia":
                    fecha = fecha.plusHours(1);
                    break;
                case "semana":
                    fecha = fecha.plusDays(1);
                    break;
                case "mes":
                    fecha = fecha.plusDays(1);
                    break;
                case "año":
                    fecha = fecha.plusMonths(1);
                    break;
            }
        }

        return completo;
    }

    private Map<String, Double> completarDatosGraficoDouble(Map<String, Double> datos, PeriodoInfo info) {
        Map<String, Double> completo = new LinkedHashMap<>();
        LocalDateTime fecha = info.fechaInicio;

        while (!fecha.isAfter(info.fechaFin)) {
            String key = formatearFecha(fecha, info.periodo);
            completo.put(key, datos.getOrDefault(key, 0.0));

            switch (info.periodo.toLowerCase()) {
                case "dia":
                    fecha = fecha.plusHours(1);
                    break;
                case "semana":
                    fecha = fecha.plusDays(1);
                    break;
                case "mes":
                    fecha = fecha.plusDays(1);
                    break;
                case "año":
                    fecha = fecha.plusMonths(1);
                    break;
            }
        }

        return completo;
    }

    private Map<String, BigDecimal> completarDatosGraficoBigDecimal(Map<String, BigDecimal> datos, PeriodoInfo info) {
        Map<String, BigDecimal> completo = new LinkedHashMap<>();
        LocalDateTime fecha = info.fechaInicio;

        while (!fecha.isAfter(info.fechaFin)) {
            String key = formatearFecha(fecha, info.periodo);
            completo.put(key, datos.getOrDefault(key, BigDecimal.ZERO));

            switch (info.periodo.toLowerCase()) {
                case "dia":
                    fecha = fecha.plusHours(1);
                    break;
                case "semana":
                    fecha = fecha.plusDays(1);
                    break;
                case "mes":
                    fecha = fecha.plusDays(1);
                    break;
                case "año":
                    fecha = fecha.plusMonths(1);
                    break;
            }
        }

        return completo;
    }

    /**
     * Clase interna para almacenar información del periodo.
     */
    private static class PeriodoInfo {
        LocalDateTime fechaInicio;
        LocalDateTime fechaFin;
        LocalDateTime fechaInicioAnterior;
        LocalDateTime fechaFinAnterior;
        int intervalos;
        String periodo;

        PeriodoInfo(LocalDateTime fechaInicio, LocalDateTime fechaFin,
                    LocalDateTime fechaInicioAnterior, LocalDateTime fechaFinAnterior,
                    int intervalos, String periodo) {
            this.fechaInicio = fechaInicio;
            this.fechaFin = fechaFin;
            this.fechaInicioAnterior = fechaInicioAnterior;
            this.fechaFinAnterior = fechaFinAnterior;
            this.intervalos = intervalos;
            this.periodo = periodo;
        }
    }
}
