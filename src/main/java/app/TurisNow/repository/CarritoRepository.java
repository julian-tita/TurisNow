package app.TurisNow.repository;

import app.TurisNow.model.Carrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CarritoRepository extends JpaRepository<Carrito, Long> {
    
    // Buscar carrito por usuario
    @Query("SELECT c FROM Carrito c LEFT JOIN FETCH c.items WHERE c.usuario.id = :usuarioId")
    Optional<Carrito> findByUsuarioIdWithItems(@Param("usuarioId") Long usuarioId);
    
    // Buscar carrito simple por usuario
    @Query("SELECT c FROM Carrito c WHERE c.usuario.id = :usuarioId")
    Optional<Carrito> findByUsuarioId(@Param("usuarioId") Long usuarioId);
    
    // Verificar si existe carrito para un usuario
    boolean existsByUsuarioId(Long usuarioId);
}

