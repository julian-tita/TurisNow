package app.TurisNow.controller;

import app.TurisNow.dto.ExperienciaDetalleDTO;
import app.TurisNow.dto.ExperienciaListadoDTO;
import app.TurisNow.service.ExperienciaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/experiencias")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ExperienciaController {
    
    private final ExperienciaService experienciaService;
    
    /**
     * GET /api/experiencias - Listar experiencias con filtros opcionales
     * @param categoria - Filtro por categoría (opcional)
     * @param ubicacion - Filtro por ubicación (opcional)
     * @param pageable - Parámetros de paginación
     * @return Página de experiencias
     */
    @GetMapping
    public ResponseEntity<Page<ExperienciaListadoDTO>> listarExperiencias(
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String ubicacion,
            @PageableDefault(size = 6, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        
        Page<ExperienciaListadoDTO> experiencias = experienciaService.listarExperiencias(
            categoria, ubicacion, pageable
        );
        return ResponseEntity.ok(experiencias);
    }
    
    /**
     * GET /api/experiencias/{id} - Obtener detalle de una experiencia
     * @param id - ID de la experiencia
     * @return Detalle completo de la experiencia con salidas
     */
    @GetMapping("/{id}")
    public ResponseEntity<ExperienciaDetalleDTO> obtenerExperiencia(@PathVariable Long id) {
        try {
            ExperienciaDetalleDTO experiencia = experienciaService.obtenerExperienciaPorId(id);
            return ResponseEntity.ok(experiencia);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

