package app.TurisNow.controller;

import app.TurisNow.dto.ExperienciaDetalleDTO;
import app.TurisNow.dto.ExperienciaListadoDTO;
import app.TurisNow.dto.ExperienciaRequest;
import app.TurisNow.service.ExperienciaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
            @RequestParam(required = false, defaultValue = "false") boolean random,
            @PageableDefault(size = 6, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        
        Page<ExperienciaListadoDTO> experiencias = experienciaService.listarExperiencias(
            categoria, ubicacion, pageable, random
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
    
    /**
     * GET /api/experiencias/categorias - Obtener todas las categorías únicas
     * @return Lista de categorías disponibles en la base de datos
     */
    @GetMapping("/categorias")
    public ResponseEntity<List<String>> obtenerCategorias() {
        List<String> categorias = experienciaService.obtenerCategorias();
        return ResponseEntity.ok(categorias);
    }
    
    /**
     * GET /api/experiencias/categorias/conteo - Obtener categorías con conteo de experiencias
     * @return Lista de objetos con categoria y cantidad
     */
    @GetMapping("/categorias/conteo")
    public ResponseEntity<List<Map<String, Object>>> obtenerCategoriasConConteo() {
        List<Map<String, Object>> categoriasConteo = experienciaService.obtenerCategoriasConConteo();
        return ResponseEntity.ok(categoriasConteo);
    }
    
    /**
     * GET /api/experiencias/destacadas - Obtener experiencias destacadas
     * Por ahora retorna las primeras N experiencias. En el futuro se implementará un flag en BD.
     * @param size - Cantidad de experiencias a retornar (default: 4)
     * @return Lista de experiencias destacadas
     */
    @GetMapping("/destacadas")
    public ResponseEntity<List<ExperienciaListadoDTO>> obtenerDestacadas(
            @RequestParam(defaultValue = "4") int size) {
        
        Pageable pageable = PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<ExperienciaListadoDTO> experiencias = experienciaService.listarExperiencias(null, null, pageable, false);
        
        return ResponseEntity.ok(experiencias.getContent());
    }
}

