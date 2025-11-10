package app.TurisNow.repository;

import app.TurisNow.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    Optional<Usuario> findByUsername(String username);
    
    Optional<Usuario> findByEmail(String email);
    
    Optional<Usuario> findByGoogleId(String googleId);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    boolean existsByDocumento(String documento);
    
    // Buscar por rol
    Page<Usuario> findByRol(Usuario.Rol rol, Pageable pageable);
    
    // Búsqueda por texto en múltiples campos
    @Query("SELECT u FROM Usuario u WHERE " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(COALESCE(u.nombre, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(COALESCE(u.apellido, '')) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Usuario> findBySearch(@Param("search") String search, Pageable pageable);
    
    // Búsqueda por texto y rol
    @Query("SELECT u FROM Usuario u WHERE " +
           "u.rol = :rol AND (" +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(COALESCE(u.nombre, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(COALESCE(u.apellido, '')) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Usuario> findBySearchAndRol(@Param("search") String search, @Param("rol") Usuario.Rol rol, Pageable pageable);
    
    // Búsqueda avanzada para administradores (método legacy, mantener por compatibilidad)
    @Query("SELECT u FROM Usuario u WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(CAST(u.username AS string)) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(CAST(u.email AS string)) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(CAST(COALESCE(u.nombre, '') AS string)) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(CAST(COALESCE(u.apellido, '') AS string)) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:rol IS NULL OR u.rol = :rol) " +
           "AND (:activo IS NULL OR u.activo = :activo)")
    Page<Usuario> buscarUsuarios(
        @Param("query") String query,
        @Param("rol") Usuario.Rol rol,
        @Param("activo") Boolean activo,
        Pageable pageable
    );
}
