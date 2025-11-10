package app.TurisNow.repository;

import app.TurisNow.model.Experiencia;
import app.TurisNow.model.Experiencia.Categoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExperienciaRepository extends JpaRepository<Experiencia, Long> {
    
    // Buscar por categoría
    Page<Experiencia> findByCategoria(Categoria categoria, Pageable pageable);
    
    // Buscar por ubicación (ciudad, región o país)
    @Query("SELECT e FROM Experiencia e WHERE " +
           "LOWER(e.ubicacion.ciudad) LIKE LOWER(CONCAT('%', :ubicacion, '%')) OR " +
           "LOWER(e.ubicacion.region) LIKE LOWER(CONCAT('%', :ubicacion, '%')) OR " +
           "LOWER(e.ubicacion.pais) LIKE LOWER(CONCAT('%', :ubicacion, '%'))")
    Page<Experiencia> findByUbicacion(@Param("ubicacion") String ubicacion, Pageable pageable);
    
    // Buscar por categoría y ubicación
    @Query("SELECT e FROM Experiencia e WHERE e.categoria = :categoria AND " +
           "(LOWER(e.ubicacion.ciudad) LIKE LOWER(CONCAT('%', :ubicacion, '%')) OR " +
           "LOWER(e.ubicacion.region) LIKE LOWER(CONCAT('%', :ubicacion, '%')) OR " +
           "LOWER(e.ubicacion.pais) LIKE LOWER(CONCAT('%', :ubicacion, '%')))")
    Page<Experiencia> findByCategoriaAndUbicacion(
        @Param("categoria") Categoria categoria, 
        @Param("ubicacion") String ubicacion, 
        Pageable pageable
    );
    
    /**
     * Obtener todas las categorías únicas que existen en la base de datos
     * @return Lista de categorías ordenadas alfabéticamente
     */
    @Query("SELECT DISTINCT e.categoria FROM Experiencia e ORDER BY e.categoria")
    List<Categoria> findDistinctCategorias();
    
    /**
     * Obtener categorías con conteo de experiencias
     * @return Lista de objetos con categoria y cantidad
     */
    @Query("SELECT e.categoria as categoria, COUNT(e) as cantidad FROM Experiencia e GROUP BY e.categoria ORDER BY e.categoria")
    List<Object[]> findCategoriasConConteo();
}

