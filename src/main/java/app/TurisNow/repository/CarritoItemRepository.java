package app.TurisNow.repository;

import app.TurisNow.model.CarritoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarritoItemRepository extends JpaRepository<CarritoItem, Long> {
    
    // Buscar items por carrito
    @Query("SELECT ci FROM CarritoItem ci " +
           "JOIN FETCH ci.experiencia e " +
           "JOIN FETCH ci.salida s " +
           "WHERE ci.carrito.id = :carritoId")
    List<CarritoItem> findByCarritoIdWithDetails(@Param("carritoId") Long carritoId);
    
    // Buscar item específico por carrito y salida
    @Query("SELECT ci FROM CarritoItem ci WHERE ci.carrito.id = :carritoId AND ci.salida.id = :salidaId")
    Optional<CarritoItem> findByCarritoIdAndSalidaId(
        @Param("carritoId") Long carritoId, 
        @Param("salidaId") Long salidaId
    );
    
    // Contar items en un carrito
    @Query("SELECT COUNT(ci) FROM CarritoItem ci WHERE ci.carrito.id = :carritoId")
    Long countByCarritoId(@Param("carritoId") Long carritoId);
    
    // Eliminar todos los items de un carrito
    void deleteByCarritoId(Long carritoId);
}

