package app.TurisNow.controller;

import app.TurisNow.dto.UserDTO;
import app.TurisNow.model.Usuario;
import app.TurisNow.model.Usuario.Rol;
import app.TurisNow.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@PreAuthorize("hasRole('ADMIN')") // Todos los endpoints requieren rol ADMIN
public class UserController {
    
    private final UsuarioRepository usuarioRepository;
    
    /**
     * GET /api/users - Obtener lista paginada de usuarios con filtros
     * @param page - Número de página (default: 0)
     * @param size - Tamaño de página (default: 10)
     * @param sort - Campo para ordenar (default: id)
     * @param direction - Dirección de ordenamiento (ASC/DESC)
     * @param rol - Filtro por rol (USER/ADMIN/ALL)
     * @param search - Búsqueda por nombre, apellido, email o username
     * @return Página de usuarios
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "ASC") String direction,
            @RequestParam(required = false) String rol,
            @RequestParam(required = false) String search) {
        
        try {
            Sort.Direction sortDirection = direction.equalsIgnoreCase("DESC") 
                ? Sort.Direction.DESC 
                : Sort.Direction.ASC;
            
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
            
            Page<Usuario> usuariosPage;
            
            // Aplicar filtros
            if (search != null && !search.trim().isEmpty()) {
                // Búsqueda por texto en múltiples campos
                String searchTerm = search.toLowerCase();
                if (rol != null && !rol.equals("ALL")) {
                    Rol rolEnum = Rol.valueOf(rol.toUpperCase());
                    usuariosPage = usuarioRepository.findBySearchAndRol(searchTerm, rolEnum, pageable);
                } else {
                    usuariosPage = usuarioRepository.findBySearch(searchTerm, pageable);
                }
            } else if (rol != null && !rol.equals("ALL")) {
                // Solo filtro por rol
                Rol rolEnum = Rol.valueOf(rol.toUpperCase());
                usuariosPage = usuarioRepository.findByRol(rolEnum, pageable);
            } else {
                // Sin filtros
                usuariosPage = usuarioRepository.findAll(pageable);
            }
            
            // Mapear a DTO
            Page<UserDTO> userDTOPage = usuariosPage.map(this::mapToDTO);
            
            // Construir respuesta con metadatos de paginación
            Map<String, Object> response = new HashMap<>();
            response.put("content", userDTOPage.getContent());
            response.put("totalElements", userDTOPage.getTotalElements());
            response.put("totalPages", userDTOPage.getTotalPages());
            response.put("size", userDTOPage.getSize());
            response.put("number", userDTOPage.getNumber());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * PUT /api/users/{id} - Actualizar usuario
     * @param id - ID del usuario a actualizar
     * @param userDTO - Datos del usuario
     * @return Usuario actualizado
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        try {
            Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            // Actualizar campos permitidos
            if (userDTO.getNombre() != null) usuario.setNombre(userDTO.getNombre());
            if (userDTO.getApellido() != null) usuario.setApellido(userDTO.getApellido());
            if (userDTO.getEmail() != null) usuario.setEmail(userDTO.getEmail());
            if (userDTO.getTelefono() != null) usuario.setTelefono(userDTO.getTelefono());
            if (userDTO.getDocumento() != null) usuario.setDocumento(userDTO.getDocumento());
            if (userDTO.getFechaNacimiento() != null) usuario.setFechaNacimiento(userDTO.getFechaNacimiento());
            if (userDTO.getDireccion() != null) usuario.setDireccion(userDTO.getDireccion());
            
            Usuario updated = usuarioRepository.save(usuario);
            return ResponseEntity.ok(mapToDTO(updated));
            
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * DELETE /api/users/{id} - Eliminar usuario
     * @param id - ID del usuario a eliminar
     * @return Respuesta vacía
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            if (!usuarioRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            usuarioRepository.deleteById(id);
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * PUT /api/users/{id}/toggle-status - Activar/Desactivar usuario
     * @param id - ID del usuario
     * @return Usuario con estado actualizado
     */
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<UserDTO> toggleUserStatus(@PathVariable Long id) {
        try {
            Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            usuario.setActivo(!usuario.getActivo());
            Usuario updated = usuarioRepository.save(usuario);
            
            return ResponseEntity.ok(mapToDTO(updated));
            
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * PUT /api/users/{id}/change-role - Cambiar rol de usuario
     * @param id - ID del usuario
     * @param payload - Objeto con el nuevo rol
     * @return Usuario con rol actualizado
     */
    @PutMapping("/{id}/change-role")
    public ResponseEntity<UserDTO> changeUserRole(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            String rolStr = payload.get("rol");
            if (rolStr == null || rolStr.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            Rol newRol = Rol.valueOf(rolStr.toUpperCase());
            usuario.setRol(newRol);
            Usuario updated = usuarioRepository.save(usuario);
            
            return ResponseEntity.ok(mapToDTO(updated));
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Mapea Usuario entity a UserDTO
     */
    private UserDTO mapToDTO(Usuario usuario) {
        UserDTO dto = new UserDTO();
        dto.setId(usuario.getId());
        dto.setUsername(usuario.getUsername());
        dto.setEmail(usuario.getEmail());
        dto.setNombre(usuario.getNombre());
        dto.setApellido(usuario.getApellido());
        dto.setNombreCompleto(usuario.getNombreCompleto());
        dto.setTelefono(usuario.getTelefono());
        dto.setDocumento(usuario.getDocumento());
        dto.setFechaNacimiento(usuario.getFechaNacimiento());
        dto.setDireccion(usuario.getDireccion());
        dto.setRol(usuario.getRol().name());
        dto.setActivo(usuario.getActivo());
        dto.setFechaCreacion(usuario.getFechaCreacion());
        dto.setUltimoAcceso(usuario.getUltimoAcceso());
        return dto;
    }
}
