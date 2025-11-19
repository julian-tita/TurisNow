package app.TurisNow.repository;

import app.TurisNow.model.Pago;
import app.TurisNow.model.Reserva;
import app.TurisNow.model.Reserva.EstadoReserva;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    
    // Buscar reservas por usuario
    @Query("SELECT r FROM Reserva r WHERE r.usuario.id = :usuarioId ORDER BY r.fechaReserva DESC")
    Page<Reserva> findByUsuarioId(@Param("usuarioId") Long usuarioId, Pageable pageable);
    
    
    // Buscar reservas por usuario con estado específico
    @Query("SELECT r FROM Reserva r WHERE r.usuario.id = :usuarioId AND r.estado = :estado ORDER BY r.fechaReserva DESC")
    Page<Reserva> findByUsuarioIdAndEstado(@Param("usuarioId") Long usuarioId, @Param("estado") EstadoReserva estado, Pageable pageable);
    
    // Buscar reservas por salida
    @Query("SELECT r FROM Reserva r WHERE r.salida.id = :salidaId ORDER BY r.fechaReserva DESC")
    List<Reserva> findBySalidaId(@Param("salidaId") Long salidaId);
    
    // Buscar reservas activas por salida (no canceladas)
    @Query("SELECT r FROM Reserva r WHERE r.salida.id = :salidaId AND r.estado IN ('PENDIENTE', 'CONFIRMADA') ORDER BY r.fechaReserva DESC")
    List<Reserva> findReservasActivasBySalidaId(@Param("salidaId") Long salidaId);
    
    // Contar reservas activas por salida
    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.salida.id = :salidaId AND r.estado IN ('PENDIENTE', 'CONFIRMADA')")
    Integer countReservasActivasBySalidaId(@Param("salidaId") Long salidaId);
    
    // Sumar cantidad de personas reservadas por salida
    @Query("SELECT COALESCE(SUM(r.cantidadPersonas), 0) FROM Reserva r WHERE r.salida.id = :salidaId AND r.estado IN ('PENDIENTE', 'CONFIRMADA')")
    Integer sumCantidadPersonasBySalidaId(@Param("salidaId") Long salidaId);
    
    // Buscar reservas por estado
    @Query("SELECT r FROM Reserva r WHERE r.estado = :estado ORDER BY r.fechaReserva DESC")
    Page<Reserva> findByEstado(@Param("estado") EstadoReserva estado, Pageable pageable);
    
    // Buscar reservas por rango de fechas
    @Query("SELECT r FROM Reserva r WHERE r.fechaReserva BETWEEN :fechaInicio AND :fechaFin ORDER BY r.fechaReserva DESC")
    Page<Reserva> findByFechaReservaBetween(@Param("fechaInicio") LocalDateTime fechaInicio, @Param("fechaFin") LocalDateTime fechaFin, Pageable pageable);
    
    // Verificar si un usuario ya tiene una reserva activa para una salida
    @Query("SELECT r FROM Reserva r WHERE r.usuario.id = :usuarioId AND r.salida.id = :salidaId AND r.estado IN ('PENDIENTE', 'CONFIRMADA')")
    Optional<Reserva> findReservaActivaByUsuarioAndSalida(@Param("usuarioId") Long usuarioId, @Param("salidaId") Long salidaId);
    
    // Buscar reservas próximas a vencer (para notificaciones)
    @Query("SELECT r FROM Reserva r WHERE r.salida.fechaInicio BETWEEN :ahora AND :fechaLimite AND r.estado = 'CONFIRMADA' ORDER BY r.salida.fechaInicio ASC")
    List<Reserva> findReservasProximasAVencer(@Param("ahora") LocalDateTime ahora, @Param("fechaLimite") LocalDateTime fechaLimite);
    
    // Estadísticas de reservas por usuario
    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.usuario.id = :usuarioId AND r.estado = :estado")
    Long countByUsuarioIdAndEstado(@Param("usuarioId") Long usuarioId, @Param("estado") EstadoReserva estado);
    
    // Buscar reservas con detalles completos para reportes
    @Query("SELECT r FROM Reserva r " +
           "JOIN FETCH r.usuario u " +
           "JOIN FETCH r.salida s " +
           "JOIN FETCH s.experiencia e " +
           "WHERE r.id = :reservaId")
    Optional<Reserva> findByIdWithDetails(@Param("reservaId") Long reservaId);
    
    // Buscar reservas por pago (para verificar idempotencia)
    List<Reserva> findByPago(Pago pago);
    
    // Buscar reserva por token QR
    @Query("SELECT r FROM Reserva r " +
           "JOIN FETCH r.usuario u " +
           "JOIN FETCH r.salida s " +
           "JOIN FETCH s.experiencia e " +
           "JOIN FETCH e.ubicacion " +
           "WHERE r.tokenQr = :tokenQr")
    Optional<Reserva> findByTokenQrWithDetails(@Param("tokenQr") String tokenQr);
}
