package app.TurisNow.service;

import app.TurisNow.dto.SalidaAdminRequest;
import app.TurisNow.dto.SalidaAdminResponse;
import app.TurisNow.model.Experiencia;
import app.TurisNow.model.Salida;
import app.TurisNow.repository.ExperienciaRepository;
import app.TurisNow.repository.SalidaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Servicio para operaciones administrativas sobre salidas.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminSalidaService {

    private final SalidaRepository salidaRepository;
    private final ExperienciaRepository experienciaRepository;

    /**
     * Listar todas las salidas con paginación.
     */
    @Transactional(readOnly = true)
    public Page<SalidaAdminResponse> listarSalidas(Pageable pageable) {
        return salidaRepository.findAll(pageable)
                .map(this::convertirAResponse);
    }

    /**
     * Listar salidas de una experiencia específica.
     */
    @Transactional(readOnly = true)
    public Page<SalidaAdminResponse> listarSalidasPorExperiencia(Long experienciaId, Pageable pageable) {
        Experiencia experiencia = experienciaRepository.findById(experienciaId)
                .orElseThrow(() -> new RuntimeException("Experiencia no encontrada"));
        
        return salidaRepository.findAll(pageable)
                .map(this::convertirAResponse);
    }

    /**
     * Obtener una salida por ID.
     */
    @Transactional(readOnly = true)
    public SalidaAdminResponse obtenerSalida(Long id) {
        Salida salida = salidaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salida no encontrada con id: " + id));
        return convertirAResponse(salida);
    }

    /**
     * Crear una nueva salida.
     */
    @Transactional
    public SalidaAdminResponse crearSalida(SalidaAdminRequest request) {
        log.info("Creando nueva salida para experiencia: {}", request.getExperienciaId());
        
        Experiencia experiencia = experienciaRepository.findById(request.getExperienciaId())
                .orElseThrow(() -> new RuntimeException("Experiencia no encontrada con id: " + request.getExperienciaId()));
        
        Salida salida = new Salida();
        salida.setExperiencia(experiencia);
        salida.setFechaInicio(request.getFechaInicio());
        salida.setFechaFin(request.getFechaFin());
        salida.setCapacidadTotal(request.getCapacidadTotal());
        salida.setCapacidadDisponible(request.getCapacidadTotal()); // Inicialmente toda disponible
        
        Salida guardada = salidaRepository.save(salida);
        log.info("Salida creada con ID: {}", guardada.getId());
        
        return convertirAResponse(guardada);
    }

    /**
     * Actualizar una salida existente.
     */
    @Transactional
    public SalidaAdminResponse actualizarSalida(Long id, SalidaAdminRequest request) {
        log.info("Actualizando salida ID: {}", id);
        
        Salida salida = salidaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salida no encontrada con id: " + id));
        
        // Calcular personas ya reservadas
        int personasReservadas = salida.getCapacidadTotal() - salida.getCapacidadDisponible();
        
        // Validar que la nueva capacidad sea suficiente
        if (request.getCapacidadTotal() < personasReservadas) {
            throw new RuntimeException("La nueva capacidad (" + request.getCapacidadTotal() + 
                ") es menor que las reservas existentes (" + personasReservadas + ")");
        }
        
        salida.setFechaInicio(request.getFechaInicio());
        salida.setFechaFin(request.getFechaFin());
        salida.setCapacidadTotal(request.getCapacidadTotal());
        salida.setCapacidadDisponible(request.getCapacidadTotal() - personasReservadas);
        
        // Si cambió la experiencia
        if (!salida.getExperiencia().getId().equals(request.getExperienciaId())) {
            Experiencia nuevaExperiencia = experienciaRepository.findById(request.getExperienciaId())
                    .orElseThrow(() -> new RuntimeException("Experiencia no encontrada"));
            salida.setExperiencia(nuevaExperiencia);
        }
        
        Salida actualizada = salidaRepository.save(salida);
        log.info("Salida actualizada: {}", actualizada.getId());
        
        return convertirAResponse(actualizada);
    }

    /**
     * Eliminar una salida.
     */
    @Transactional
    public void eliminarSalida(Long id) {
        log.info("Eliminando salida ID: {}", id);
        
        Salida salida = salidaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salida no encontrada con id: " + id));
        
        // Verificar si hay reservas
        int personasReservadas = salida.getCapacidadTotal() - salida.getCapacidadDisponible();
        if (personasReservadas > 0) {
            throw new RuntimeException("No se puede eliminar la salida porque tiene " + 
                personasReservadas + " personas reservadas");
        }
        
        salidaRepository.delete(salida);
        log.info("Salida eliminada: {}", id);
    }

    // ========== Métodos privados ==========

    private SalidaAdminResponse convertirAResponse(Salida salida) {
        SalidaAdminResponse response = new SalidaAdminResponse();
        response.setId(salida.getId());
        response.setExperienciaId(salida.getExperiencia().getId());
        response.setExperienciaTitulo(salida.getExperiencia().getTitulo());
        response.setFechaInicio(salida.getFechaInicio());
        response.setFechaFin(salida.getFechaFin());
        response.setCapacidadTotal(salida.getCapacidadTotal());
        response.setCapacidadDisponible(salida.getCapacidadDisponible());
        
        int reservasActivas = salida.getCapacidadTotal() - salida.getCapacidadDisponible();
        response.setReservasActivas(reservasActivas);
        
        // Determinar estado
        LocalDateTime ahora = LocalDateTime.now();
        String estado;
        if (salida.getFechaInicio().isBefore(ahora)) {
            estado = "PASADA";
        } else if (salida.getCapacidadDisponible() == 0) {
            estado = "COMPLETA";
        } else {
            estado = "DISPONIBLE";
        }
        response.setEstado(estado);
        
        return response;
    }
}
