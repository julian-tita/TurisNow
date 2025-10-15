package app.TurisNow.service;

import app.TurisNow.dto.ExperienciaDetalleDTO;
import app.TurisNow.dto.ExperienciaListadoDTO;
import app.TurisNow.dto.ExperienciaRequest;
import app.TurisNow.model.Experiencia;
import app.TurisNow.model.Experiencia.Categoria;

import app.TurisNow.model.Ubicacion;
import app.TurisNow.model.Salida;
import app.TurisNow.repository.ExperienciaRepository;
import app.TurisNow.repository.SalidaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExperienciaService {
    
    private final ExperienciaRepository experienciaRepository;
    private final SalidaRepository salidaRepository;
    
    /**
     * Listar experiencias con filtros opcionales
     */
    public Page<ExperienciaListadoDTO> listarExperiencias(
            String categoria, 
            String ubicacion, 
            Pageable pageable) {
        
        Page<Experiencia> experiencias;
        
        // Aplicar filtros según los parámetros
        if (categoria != null && !categoria.isEmpty() && ubicacion != null && !ubicacion.isEmpty()) {
            // Ambos filtros
            Categoria cat = mapearCategoria(categoria);
            experiencias = experienciaRepository.findByCategoriaAndUbicacion(cat, ubicacion, pageable);
        } else if (categoria != null && !categoria.isEmpty()) {
            // Solo categoría
            Categoria cat = mapearCategoria(categoria);
            experiencias = experienciaRepository.findByCategoria(cat, pageable);
        } else if (ubicacion != null && !ubicacion.isEmpty()) {
            // Solo ubicación
            experiencias = experienciaRepository.findByUbicacion(ubicacion, pageable);
        } else {
            // Sin filtros
            experiencias = experienciaRepository.findAll(pageable);
        }
        
        return experiencias.map(this::mapearAListadoDTO);
    }
    
    /**
     * Obtener detalle de una experiencia por ID
     */
    public ExperienciaDetalleDTO obtenerExperienciaPorId(Long id) {
        Experiencia experiencia = experienciaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Experiencia no encontrada con id: " + id));
        
        return mapearADetalleDTO(experiencia);
    }
    
    /**
     * Mapear Experiencia a ExperienciaListadoDTO
     */
    private ExperienciaListadoDTO mapearAListadoDTO(Experiencia experiencia) {
        ExperienciaListadoDTO dto = new ExperienciaListadoDTO();
        dto.setId(experiencia.getId());
        dto.setTitulo(experiencia.getTitulo());
        dto.setDescripcion(experiencia.getDescripcion());
        dto.setPrecio(experiencia.getPrecio());
        dto.setMoneda(experiencia.getMoneda().name());
        dto.setCategoria(experiencia.getCategoria().getValor());
        dto.setImagenUrl(experiencia.getImagenUrl());
        dto.setTags(experiencia.getTags());
        
        // Mapear ubicación
        ExperienciaListadoDTO.UbicacionDTO ubicacionDTO = new ExperienciaListadoDTO.UbicacionDTO();
        ubicacionDTO.setCiudad(experiencia.getUbicacion().getCiudad());
        ubicacionDTO.setRegion(experiencia.getUbicacion().getRegion());
        ubicacionDTO.setPais(experiencia.getUbicacion().getPais());
        dto.setUbicacion(ubicacionDTO);
        
        // Contar salidas disponibles
        Integer salidas = salidaRepository.countSalidasDisponibles(
            experiencia.getId(), 
            LocalDateTime.now()
        );
        dto.setProximasSalidas(salidas);
        
        return dto;
    }
    
    /**
     * Mapear Experiencia a ExperienciaDetalleDTO
     */
    private ExperienciaDetalleDTO mapearADetalleDTO(Experiencia experiencia) {
        ExperienciaDetalleDTO dto = new ExperienciaDetalleDTO();
        dto.setId(experiencia.getId());
        dto.setTitulo(experiencia.getTitulo());
        dto.setDescripcion(experiencia.getDescripcion());
        dto.setPrecio(experiencia.getPrecio());
        dto.setMoneda(experiencia.getMoneda().name());
        dto.setCategoria(experiencia.getCategoria().getValor());
        dto.setImagenUrl(experiencia.getImagenUrl());
        dto.setTags(experiencia.getTags());
        
        // Mapear ubicación
        ExperienciaDetalleDTO.UbicacionDTO ubicacionDTO = new ExperienciaDetalleDTO.UbicacionDTO();
        ubicacionDTO.setCiudad(experiencia.getUbicacion().getCiudad());
        ubicacionDTO.setRegion(experiencia.getUbicacion().getRegion());
        ubicacionDTO.setPais(experiencia.getUbicacion().getPais());
        dto.setUbicacion(ubicacionDTO);
        
        // Mapear salidas disponibles
        List<Salida> salidas = salidaRepository.findSalidasDisponibles(
            experiencia.getId(), 
            LocalDateTime.now()
        );
        
        List<ExperienciaDetalleDTO.SalidaDTO> salidasDTO = salidas.stream()
            .map(this::mapearSalidaDTO)
            .collect(Collectors.toList());
        
        dto.setSalidas(salidasDTO);
        
        return dto;
    }
    
    /**
     * Mapear Salida a SalidaDTO
     */
    private ExperienciaDetalleDTO.SalidaDTO mapearSalidaDTO(Salida salida) {
        ExperienciaDetalleDTO.SalidaDTO dto = new ExperienciaDetalleDTO.SalidaDTO();
        dto.setId(salida.getId());
        dto.setFechaInicio(salida.getFechaInicio());
        dto.setFechaFin(salida.getFechaFin());
        dto.setCapacidadTotal(salida.getCapacidadTotal());
        dto.setCapacidadDisponible(salida.getCapacidadDisponible());
        return dto;
    }
    
    /**
     * Crear nueva experiencia
     */
    @Transactional
    public ExperienciaDetalleDTO crearExperiencia(ExperienciaRequest request) {
        Experiencia experiencia = new Experiencia();
        
        // Mapear datos básicos
        experiencia.setTitulo(request.getTitulo());
        experiencia.setDescripcion(request.getDescripcion());
        experiencia.setPrecio(request.getPrecio());
        experiencia.setMoneda(mapearMoneda(request.getMoneda()));
        experiencia.setCategoria(mapearCategoria(request.getCategoria()));
        experiencia.setImagenUrl(request.getImagenUrl());
        experiencia.setTags(request.getTags() != null ? request.getTags() : new ArrayList<>());
        
        // Mapear ubicación
        Ubicacion ubicacion = new Ubicacion();
        ubicacion.setCiudad(request.getUbicacion().getCiudad());
        ubicacion.setRegion(request.getUbicacion().getRegion());
        ubicacion.setPais(request.getUbicacion().getPais());
        experiencia.setUbicacion(ubicacion);
        
        // Guardar
        experiencia = experienciaRepository.save(experiencia);
        
        return mapearADetalleDTO(experiencia);
    }
    
    /**
     * Actualizar experiencia existente
     */
    @Transactional
    public ExperienciaDetalleDTO actualizarExperiencia(Long id, ExperienciaRequest request) {
        Experiencia experiencia = experienciaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Experiencia no encontrada con id: " + id));
        
        // Actualizar datos básicos
        experiencia.setTitulo(request.getTitulo());
        experiencia.setDescripcion(request.getDescripcion());
        experiencia.setPrecio(request.getPrecio());
        experiencia.setMoneda(mapearMoneda(request.getMoneda()));
        experiencia.setCategoria(mapearCategoria(request.getCategoria()));
        experiencia.setImagenUrl(request.getImagenUrl());
        experiencia.setTags(request.getTags() != null ? request.getTags() : new ArrayList<>());
        
        // Actualizar ubicación
        if (experiencia.getUbicacion() == null) {
            experiencia.setUbicacion(new Ubicacion());
        }
        experiencia.getUbicacion().setCiudad(request.getUbicacion().getCiudad());
        experiencia.getUbicacion().setRegion(request.getUbicacion().getRegion());
        experiencia.getUbicacion().setPais(request.getUbicacion().getPais());
        
        // Guardar
        experiencia = experienciaRepository.save(experiencia);
        
        return mapearADetalleDTO(experiencia);
    }
    
    /**
     * Eliminar experiencia
     */
    @Transactional
    public void eliminarExperiencia(Long id) {
        if (!experienciaRepository.existsById(id)) {
            throw new RuntimeException("Experiencia no encontrada con id: " + id);
        }
        experienciaRepository.deleteById(id);
    }
    
    /**
     * Toggle estado de experiencia (activar/desactivar)
     * Por ahora solo retorna la experiencia ya que no tenemos campo de estado
     */
    @Transactional
    public ExperienciaDetalleDTO toggleEstadoExperiencia(Long id) {
        Experiencia experiencia = experienciaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Experiencia no encontrada con id: " + id));
        
        // TODO: Implementar campo 'activa' en el modelo Experiencia
        // Por ahora solo retornamos la experiencia
        
        return mapearADetalleDTO(experiencia);
    }

    /**
     * Mapear string de categoría a Enum
     */
    private Categoria mapearCategoria(String categoria) {
        return switch (categoria.toUpperCase()) {
            case "PLAYA" -> Categoria.PLAYA;
            case "MONTANA" -> Categoria.MONTANA;
            case "AVENTURA" -> Categoria.AVENTURA;
            case "GASTRONOMIA" -> Categoria.GASTRONOMIA;
            case "CULTURA" -> Categoria.CULTURA;
            default -> throw new IllegalArgumentException("Categoría no válida: " + categoria);
        };
    }
    
    /**
     * Mapear string de moneda a Enum
     */
    private Experiencia.Moneda mapearMoneda(String moneda) {
        return switch (moneda.toUpperCase()) {
            case "ARS" -> Experiencia.Moneda.ARS;
            case "USD" -> Experiencia.Moneda.USD;
            case "CLP" -> Experiencia.Moneda.CLP;
            case "EUR" -> Experiencia.Moneda.EUR;
            default -> throw new IllegalArgumentException("Moneda no válida: " + moneda);
        };
    }
}

