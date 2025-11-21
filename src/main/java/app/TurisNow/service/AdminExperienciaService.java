package app.TurisNow.service;

import app.TurisNow.dto.ExperienciaAdminRequest;
import app.TurisNow.dto.ExperienciaAdminResponse;
import app.TurisNow.model.Experiencia;
import app.TurisNow.model.Ubicacion;
import app.TurisNow.repository.ExperienciaRepository;
import app.TurisNow.repository.SalidaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para operaciones administrativas sobre experiencias.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminExperienciaService {

    private final ExperienciaRepository experienciaRepository;
    private final SalidaRepository salidaRepository;

    /**
     * Listar todas las experiencias con paginación.
     */
    @Transactional(readOnly = true)
    public Page<ExperienciaAdminResponse> listarExperiencias(Pageable pageable) {
        return experienciaRepository.findAll(pageable)
                .map(this::convertirAResponse);
    }

    /**
     * Obtener una experiencia por ID.
     */
    @Transactional(readOnly = true)
    public ExperienciaAdminResponse obtenerExperiencia(Long id) {
        Experiencia experiencia = experienciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Experiencia no encontrada con id: " + id));
        return convertirAResponse(experiencia);
    }

    /**
     * Crear una nueva experiencia.
     */
    @Transactional
    public ExperienciaAdminResponse crearExperiencia(ExperienciaAdminRequest request) {
        log.info("Creando nueva experiencia: {}", request.getTitulo());
        
        Experiencia experiencia = new Experiencia();
        mapearRequestAEntidad(request, experiencia);
        
        Experiencia guardada = experienciaRepository.save(experiencia);
        log.info("Experiencia creada con ID: {}", guardada.getId());
        
        return convertirAResponse(guardada);
    }

    /**
     * Actualizar una experiencia existente.
     */
    @Transactional
    public ExperienciaAdminResponse actualizarExperiencia(Long id, ExperienciaAdminRequest request) {
        log.info("Actualizando experiencia ID: {}", id);
        
        Experiencia experiencia = experienciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Experiencia no encontrada con id: " + id));
        
        mapearRequestAEntidad(request, experiencia);
        
        Experiencia actualizada = experienciaRepository.save(experiencia);
        log.info("Experiencia actualizada: {}", actualizada.getId());
        
        return convertirAResponse(actualizada);
    }

    /**
     * Eliminar una experiencia (soft delete o validación de dependencias).
     */
    @Transactional
    public void eliminarExperiencia(Long id) {
        log.info("Eliminando experiencia ID: {}", id);
        
        Experiencia experiencia = experienciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Experiencia no encontrada con id: " + id));
        
        // Verificar si hay salidas asociadas
        if (experiencia.getSalidas() != null && !experiencia.getSalidas().isEmpty()) {
            throw new RuntimeException("No se puede eliminar la experiencia porque tiene " + 
                experiencia.getSalidas().size() + " salidas asociadas");
        }
        
        experienciaRepository.delete(experiencia);
        log.info("Experiencia eliminada: {}", id);
    }

    /**
     * Buscar experiencias por título o ubicación.
     */
    @Transactional(readOnly = true)
    public Page<ExperienciaAdminResponse> buscarExperiencias(String query, Pageable pageable) {
        // Implementación simple - puede mejorarse con búsqueda full-text
        return experienciaRepository.findAll(pageable)
                .map(this::convertirAResponse);
    }

    // ========== Métodos privados de mapeo ==========

    private void mapearRequestAEntidad(ExperienciaAdminRequest request, Experiencia experiencia) {
        experiencia.setTitulo(request.getTitulo());
        experiencia.setDescripcion(request.getDescripcion());
        experiencia.setPrecio(request.getPrecio());
        
        try {
            experiencia.setMoneda(Experiencia.Moneda.valueOf(request.getMoneda().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Moneda inválida: " + request.getMoneda());
        }
        
        try {
            experiencia.setCategoria(Experiencia.Categoria.valueOf(request.getCategoria().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Categoría inválida: " + request.getCategoria());
        }
        
        Ubicacion ubicacion = new Ubicacion(
            request.getUbicacion().getCiudad(),
            request.getUbicacion().getRegion(),
            request.getUbicacion().getPais()
        );
        experiencia.setUbicacion(ubicacion);
        
        experiencia.setImagenUrl(request.getImagenUrl());
        experiencia.setTags(request.getTags() != null ? request.getTags() : new ArrayList<>());
    }

    private ExperienciaAdminResponse convertirAResponse(Experiencia experiencia) {
        ExperienciaAdminResponse response = new ExperienciaAdminResponse();
        response.setId(experiencia.getId());
        response.setTitulo(experiencia.getTitulo());
        response.setDescripcion(experiencia.getDescripcion());
        response.setPrecio(experiencia.getPrecio());
        response.setMoneda(experiencia.getMoneda().name());
        response.setCategoria(experiencia.getCategoria().name());
        response.setImagenUrl(experiencia.getImagenUrl());
        response.setTags(experiencia.getTags());
        
        if (experiencia.getUbicacion() != null) {
            ExperienciaAdminResponse.UbicacionDTO ubicacionDTO = new ExperienciaAdminResponse.UbicacionDTO();
            ubicacionDTO.setCiudad(experiencia.getUbicacion().getCiudad());
            ubicacionDTO.setRegion(experiencia.getUbicacion().getRegion());
            ubicacionDTO.setPais(experiencia.getUbicacion().getPais());
            response.setUbicacion(ubicacionDTO);
        }
        
        // Calcular estadísticas
        if (experiencia.getSalidas() != null) {
            response.setTotalSalidas(experiencia.getSalidas().size());
            // TODO: Contar salidas activas (con fecha > now)
            response.setSalidasActivas(experiencia.getSalidas().size());
            // TODO: Contar reservas desde las salidas
            response.setTotalReservas(0);
        } else {
            response.setTotalSalidas(0);
            response.setSalidasActivas(0);
            response.setTotalReservas(0);
        }
        
        return response;
    }
}
