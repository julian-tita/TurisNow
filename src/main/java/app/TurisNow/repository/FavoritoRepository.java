package app.TurisNow.repository;

import app.TurisNow.model.Favorito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoritoRepository extends JpaRepository<Favorito, Long> {
    
    // Buscar favoritos por usuario
    @Query("SELECT f FROM Favorito f WHERE f.usuario.id = :usuarioId ORDER BY f.createdAt DESC")
    List<Favorito> findByUsuarioId(@Param("usuarioId") Long usuarioId);
    
    // Buscar un favorito específico por usuario y experiencia
    @Query("SELECT f FROM Favorito f WHERE f.usuario.id = :usuarioId AND f.experiencia.id = :experienciaId")
    Optional<Favorito> findByUsuarioIdAndExperienciaId(
        @Param("usuarioId") Long usuarioId, 
        @Param("experienciaId") Long experienciaId
    );
    
    // Verificar si existe un favorito
    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Favorito f WHERE f.usuario.id = :usuarioId AND f.experiencia.id = :experienciaId")
    boolean existsByUsuarioIdAndExperienciaId(
        @Param("usuarioId") Long usuarioId, 
        @Param("experienciaId") Long experienciaId
    );
    
    // Contar favoritos de un usuario
    @Query("SELECT COUNT(f) FROM Favorito f WHERE f.usuario.id = :usuarioId")
    Long countByUsuarioId(@Param("usuarioId") Long usuarioId);
}

