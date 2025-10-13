package app.TurisNow.repository;

import app.TurisNow.model.Salida;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SalidaRepository extends JpaRepository<Salida, Long> {
    
    // Obtener salidas futuras de una experiencia con capacidad disponible
    @Query("SELECT s FROM Salida s WHERE s.experiencia.id = :experienciaId " +
           "AND s.fechaInicio > :ahora AND s.capacidadDisponible > 0 " +
           "ORDER BY s.fechaInicio ASC")
    List<Salida> findSalidasDisponibles(
        @Param("experienciaId") Long experienciaId, 
        @Param("ahora") LocalDateTime ahora
    );
    
    // Contar salidas disponibles de una experiencia
    @Query("SELECT COUNT(s) FROM Salida s WHERE s.experiencia.id = :experienciaId " +
           "AND s.fechaInicio > :ahora AND s.capacidadDisponible > 0")
    Integer countSalidasDisponibles(
        @Param("experienciaId") Long experienciaId, 
        @Param("ahora") LocalDateTime ahora
    );
}

