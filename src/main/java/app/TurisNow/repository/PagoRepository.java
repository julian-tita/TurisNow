package app.TurisNow.repository;

import app.TurisNow.model.Pago;
import app.TurisNow.model.Usuario;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    
    Optional<Pago> findByPreferenceId(String preferenceId);
    
    Optional<Pago> findByPaymentId(Long paymentId);
    
    // Buscar por external_reference ordenado por fecha (más reciente primero)
    List<Pago> findByExternalReferenceOrderByFechaCreacionDesc(String externalReference);
    
    List<Pago> findByUsuarioOrderByFechaCreacionDesc(Usuario usuario);
    
    List<Pago> findByUsuarioAndEstadoOrderByFechaCreacionDesc(Usuario usuario, Pago.EstadoPago estado);
    
    // Métodos con lock pesimista para evitar race conditions en webhooks
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Pago p WHERE p.paymentId = :paymentId")
    Optional<Pago> findByPaymentIdWithLock(@Param("paymentId") Long paymentId);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Pago p WHERE p.externalReference = :externalReference ORDER BY p.fechaCreacion DESC")
    List<Pago> findByExternalReferenceWithLock(@Param("externalReference") String externalReference);
}

