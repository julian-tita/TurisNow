package app.TurisNow.repository;

import app.TurisNow.model.WebhookLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WebhookLogRepository extends JpaRepository<WebhookLog, Long> {
    
    // Buscar por tipo y recurso ID
    Optional<WebhookLog> findByTipoAndRecursoId(String tipo, String recursoId);
    
    // Buscar logs recientes de un recurso (para detectar duplicados)
    @Query("SELECT w FROM WebhookLog w WHERE w.tipo = :tipo AND w.recursoId = :recursoId " +
           "AND w.fechaRecepcion >= :fechaDesde ORDER BY w.fechaRecepcion DESC")
    List<WebhookLog> findRecentByTipoAndRecursoId(
            @Param("tipo") String tipo, 
            @Param("recursoId") String recursoId,
            @Param("fechaDesde") LocalDateTime fechaDesde);
    
    // Buscar por estado
    List<WebhookLog> findByEstadoOrderByFechaRecepcionDesc(WebhookLog.EstadoProcesamiento estado);
    
    // Buscar webhooks con error para reintentar
    @Query("SELECT w FROM WebhookLog w WHERE w.estado = 'ERROR' AND w.intentos < :maxIntentos " +
           "ORDER BY w.fechaRecepcion DESC")
    List<WebhookLog> findErroredWebhooksForRetry(@Param("maxIntentos") Integer maxIntentos);
    
    // Estadísticas: contar por estado
    @Query("SELECT w.estado, COUNT(w) FROM WebhookLog w GROUP BY w.estado")
    List<Object[]> countByEstado();
    
    // Webhooks recientes (últimas 24 horas)
    @Query("SELECT w FROM WebhookLog w WHERE w.fechaRecepcion >= :fechaDesde " +
           "ORDER BY w.fechaRecepcion DESC")
    List<WebhookLog> findRecent(@Param("fechaDesde") LocalDateTime fechaDesde);
}



