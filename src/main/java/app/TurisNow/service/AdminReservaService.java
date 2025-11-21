package app.TurisNow.service;

import app.TurisNow.dto.ReservaAdminResponse;
import app.TurisNow.model.Pago;
import app.TurisNow.model.Reserva;
import app.TurisNow.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio para operaciones administrativas sobre reservas.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminReservaService {

    private final ReservaRepository reservaRepository;

    /**
     * Listar todas las reservas con paginación.
     */
    @Transactional(readOnly = true)
    public Page<ReservaAdminResponse> listarReservas(Pageable pageable) {
        return reservaRepository.findAll(pageable)
                .map(this::convertirAResponse);
    }

    /**
     * Filtrar reservas por estado.
     */
    @Transactional(readOnly = true)
    public Page<ReservaAdminResponse> filtrarPorEstado(String estado, Pageable pageable) {
        Reserva.EstadoReserva estadoEnum = Reserva.EstadoReserva.valueOf(estado.toUpperCase());
        return reservaRepository.findByEstado(estadoEnum, pageable)
                .map(this::convertirAResponse);
    }

    /**
     * Obtener una reserva por ID con detalles completos.
     */
    @Transactional(readOnly = true)
    public ReservaAdminResponse obtenerReserva(Long id) {
        Reserva reserva = reservaRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con id: " + id));
        return convertirAResponse(reserva);
    }

    /**
     * Cancelar una reserva.
     */
    @Transactional
    public ReservaAdminResponse cancelarReserva(Long id, String motivo) {
        log.info("Cancelando reserva ID: {}", id);
        
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con id: " + id));
        
        if (reserva.getEstado() == Reserva.EstadoReserva.CANCELADA) {
            throw new RuntimeException("La reserva ya está cancelada");
        }
        
        if (reserva.getEstado() == Reserva.EstadoReserva.COMPLETADA) {
            throw new RuntimeException("No se puede cancelar una reserva completada");
        }
        
        // Liberar capacidad de la salida
        if (reserva.getSalida() != null) {
            reserva.getSalida().setCapacidadDisponible(
                reserva.getSalida().getCapacidadDisponible() + reserva.getCantidadPersonas()
            );
        }
        
        reserva.setEstado(Reserva.EstadoReserva.CANCELADA);
        reserva.setFechaCancelacion(java.time.LocalDateTime.now());
        
        if (motivo != null && !motivo.isEmpty()) {
            String obs = reserva.getObservaciones() != null 
                ? reserva.getObservaciones() + "\nMotivo cancelación: " + motivo
                : "Motivo cancelación: " + motivo;
            reserva.setObservaciones(obs);
        }
        
        Reserva actualizada = reservaRepository.save(reserva);
        log.info("Reserva cancelada: {}", id);
        
        return convertirAResponse(actualizada);
    }

    /**
     * Marcar una reserva como completada.
     */
    @Transactional
    public ReservaAdminResponse completarReserva(Long id) {
        log.info("Completando reserva ID: {}", id);
        
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con id: " + id));
        
        if (reserva.getEstado() != Reserva.EstadoReserva.CONFIRMADA) {
            throw new RuntimeException("Solo se pueden completar reservas confirmadas");
        }
        
        reserva.setEstado(Reserva.EstadoReserva.COMPLETADA);
        
        Reserva actualizada = reservaRepository.save(reserva);
        log.info("Reserva completada: {}", id);
        
        return convertirAResponse(actualizada);
    }

    /**
     * Realizar check-in de una reserva.
     */
    @Transactional
    public ReservaAdminResponse realizarCheckin(Long id, String checkinPor) {
        log.info("Realizando check-in de reserva ID: {}", id);
        
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con id: " + id));
        
        if (reserva.getCheckinRealizado()) {
            throw new RuntimeException("Ya se realizó el check-in de esta reserva");
        }
        
        if (reserva.getEstado() != Reserva.EstadoReserva.CONFIRMADA) {
            throw new RuntimeException("Solo se puede hacer check-in de reservas confirmadas");
        }
        
        reserva.setCheckinRealizado(true);
        reserva.setFechaCheckin(java.time.LocalDateTime.now());
        reserva.setCheckinPor(checkinPor);
        
        Reserva actualizada = reservaRepository.save(reserva);
        log.info("Check-in realizado para reserva: {}", id);
        
        return convertirAResponse(actualizada);
    }

    // ========== Métodos privados ==========

    private ReservaAdminResponse convertirAResponse(Reserva reserva) {
        ReservaAdminResponse response = new ReservaAdminResponse();
        response.setId(reserva.getId());
        response.setUsuarioId(reserva.getUsuario().getId());
        response.setUsuarioNombre(reserva.getUsuario().getNombreCompleto());
        response.setUsuarioEmail(reserva.getUsuario().getEmail());
        response.setSalidaId(reserva.getSalida().getId());
        response.setExperienciaTitulo(reserva.getSalida().getExperiencia().getTitulo());
        response.setFechaSalida(reserva.getSalida().getFechaInicio());
        response.setCantidadPersonas(reserva.getCantidadPersonas());
        response.setPrecioTotal(reserva.getPrecioTotal());
        response.setEstado(reserva.getEstado().name());
        response.setFechaReserva(reserva.getFechaReserva());
        response.setFechaConfirmacion(reserva.getFechaConfirmacion());
        response.setFechaCancelacion(reserva.getFechaCancelacion());
        response.setObservaciones(reserva.getObservaciones());
        response.setTokenQr(reserva.getTokenQr());
        response.setCheckinRealizado(reserva.getCheckinRealizado());
        response.setFechaCheckin(reserva.getFechaCheckin());
        
        // Información del pago si existe
        if (reserva.getPago() != null) {
            Pago pago = reserva.getPago();
            ReservaAdminResponse.PagoInfoDTO pagoInfo = new ReservaAdminResponse.PagoInfoDTO();
            pagoInfo.setId(pago.getId());
            pagoInfo.setPreferenceId(pago.getPreferenceId());
            pagoInfo.setPaymentId(pago.getPaymentId());
            pagoInfo.setEstado(pago.getEstado().name());
            pagoInfo.setMetodoPago(pago.getMetodoPago());
            pagoInfo.setFechaCreacion(pago.getFechaCreacion());
            pagoInfo.setFechaAprobacion(pago.getFechaAprobacion());
            response.setPago(pagoInfo);
        }
        
        return response;
    }
}
