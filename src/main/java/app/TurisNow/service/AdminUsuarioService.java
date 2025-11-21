package app.TurisNow.service;

import app.TurisNow.dto.UsuarioAdminRequest;
import app.TurisNow.dto.UsuarioAdminResponse;
import app.TurisNow.model.Reserva;
import app.TurisNow.model.Usuario;
import app.TurisNow.repository.ReservaRepository;
import app.TurisNow.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio para operaciones administrativas sobre usuarios.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminUsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final ReservaRepository reservaRepository;

    /**
     * Listar todos los usuarios con paginación.
     */
    @Transactional(readOnly = true)
    public Page<UsuarioAdminResponse> listarUsuarios(Pageable pageable) {
        return usuarioRepository.findAll(pageable)
                .map(this::convertirAResponse);
    }

    /**
     * Buscar usuarios por query (nombre, email, username).
     */
    @Transactional(readOnly = true)
    public Page<UsuarioAdminResponse> buscarUsuarios(String query, Pageable pageable) {
        return usuarioRepository.findBySearch(query, pageable)
                .map(this::convertirAResponse);
    }

    /**
     * Filtrar usuarios por rol.
     */
    @Transactional(readOnly = true)
    public Page<UsuarioAdminResponse> filtrarPorRol(String rol, Pageable pageable) {
        Usuario.Rol rolEnum = Usuario.Rol.valueOf(rol.toUpperCase());
        return usuarioRepository.findByRol(rolEnum, pageable)
                .map(this::convertirAResponse);
    }

    /**
     * Obtener un usuario por ID.
     */
    @Transactional(readOnly = true)
    public UsuarioAdminResponse obtenerUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
        return convertirAResponse(usuario);
    }

    /**
     * Actualizar un usuario.
     */
    @Transactional
    public UsuarioAdminResponse actualizarUsuario(Long id, UsuarioAdminRequest request) {
        log.info("Actualizando usuario ID: {}", id);
        
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
        
        // Validar username único (si cambió)
        if (!usuario.getUsername().equals(request.getUsername()) && 
            usuarioRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("El nombre de usuario ya está en uso");
        }
        
        // Validar email único (si cambió)
        if (!usuario.getEmail().equals(request.getEmail()) && 
            usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está en uso");
        }
        
        // Actualizar campos
        usuario.setUsername(request.getUsername());
        usuario.setEmail(request.getEmail());
        usuario.setNombre(request.getNombre());
        usuario.setApellido(request.getApellido());
        usuario.setTelefono(request.getTelefono());
        usuario.setDocumento(request.getDocumento());
        usuario.setFechaNacimiento(request.getFechaNacimiento());
        usuario.setDireccion(request.getDireccion());
        
        try {
            usuario.setRol(Usuario.Rol.valueOf(request.getRol().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Rol inválido: " + request.getRol());
        }
        
        if (request.getActivo() != null) {
            usuario.setActivo(request.getActivo());
        }
        
        Usuario actualizado = usuarioRepository.save(usuario);
        log.info("Usuario actualizado: {}", actualizado.getId());
        
        return convertirAResponse(actualizado);
    }

    /**
     * Cambiar el rol de un usuario.
     */
    @Transactional
    public UsuarioAdminResponse cambiarRol(Long id, String nuevoRol) {
        log.info("Cambiando rol del usuario {} a {}", id, nuevoRol);
        
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
        
        try {
            usuario.setRol(Usuario.Rol.valueOf(nuevoRol.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Rol inválido: " + nuevoRol);
        }
        
        Usuario actualizado = usuarioRepository.save(usuario);
        return convertirAResponse(actualizado);
    }

    /**
     * Activar/desactivar un usuario.
     */
    @Transactional
    public UsuarioAdminResponse toggleActivo(Long id) {
        log.info("Cambiando estado activo del usuario {}", id);
        
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
        
        usuario.setActivo(!usuario.getActivo());
        Usuario actualizado = usuarioRepository.save(usuario);
        
        log.info("Usuario {} ahora está {}", id, actualizado.getActivo() ? "activo" : "inactivo");
        return convertirAResponse(actualizado);
    }

    // ========== Métodos privados ==========

    private UsuarioAdminResponse convertirAResponse(Usuario usuario) {
        UsuarioAdminResponse response = new UsuarioAdminResponse();
        response.setId(usuario.getId());
        response.setUsername(usuario.getUsername());
        response.setEmail(usuario.getEmail());
        response.setGoogleId(usuario.getGoogleId());
        response.setNombre(usuario.getNombre());
        response.setApellido(usuario.getApellido());
        response.setTelefono(usuario.getTelefono());
        response.setDocumento(usuario.getDocumento());
        response.setFechaNacimiento(usuario.getFechaNacimiento());
        response.setDireccion(usuario.getDireccion());
        response.setRol(usuario.getRol().name());
        response.setFechaCreacion(usuario.getFechaCreacion());
        response.setUltimoAcceso(usuario.getUltimoAcceso());
        response.setActivo(usuario.getActivo());
        
        // Contar reservas (usando queries correctas del repositorio)
        // TODO: Implementar countByUsuarioId en ReservaRepository
        response.setTotalReservas(0);
        response.setReservasActivas(0);
        
        return response;
    }
}
