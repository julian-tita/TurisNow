package app.TurisNow.controller;

import app.TurisNow.dto.ExperienciaDetalleDTO;
import app.TurisNow.dto.ExperienciaListadoDTO;
import app.TurisNow.dto.ExperienciaRequest;
import app.TurisNow.service.ExperienciaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/experiencias")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
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
    
    /**
     * POST /api/experiencias - Crear nueva experiencia
     * @param request - Datos de la nueva experiencia
     * @return Experiencia creada
     */
    @PostMapping
    public ResponseEntity<ExperienciaDetalleDTO> crearExperiencia(@RequestBody ExperienciaRequest request) {
        try {
            ExperienciaDetalleDTO experiencia = experienciaService.crearExperiencia(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(experiencia);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * PUT /api/experiencias/{id} - Actualizar experiencia existente
     * @param id - ID de la experiencia a actualizar
     * @param request - Nuevos datos de la experiencia
     * @return Experiencia actualizada
     */
    @PutMapping("/{id}")
    public ResponseEntity<ExperienciaDetalleDTO> actualizarExperiencia(
            @PathVariable Long id, 
            @RequestBody ExperienciaRequest request) {
        try {
            ExperienciaDetalleDTO experiencia = experienciaService.actualizarExperiencia(id, request);
            return ResponseEntity.ok(experiencia);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * DELETE /api/experiencias/{id} - Eliminar experiencia
     * @param id - ID de la experiencia a eliminar
     * @return Respuesta sin contenido
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarExperiencia(@PathVariable Long id) {
        try {
            experienciaService.eliminarExperiencia(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * PUT /api/experiencias/{id}/toggle-status - Activar/Desactivar experiencia
     * @param id - ID de la experiencia
     * @return Experiencia con estado actualizado
     */
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<ExperienciaDetalleDTO> toggleEstadoExperiencia(@PathVariable Long id) {
        try {
            ExperienciaDetalleDTO experiencia = experienciaService.toggleEstadoExperiencia(id);
            return ResponseEntity.ok(experiencia);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

