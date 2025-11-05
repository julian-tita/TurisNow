package app.TurisNow.service;

import app.TurisNow.dto.FavoritoDTO;
import app.TurisNow.model.Experiencia;
import app.TurisNow.model.Favorito;
import app.TurisNow.model.Usuario;
import app.TurisNow.repository.ExperienciaRepository;
import app.TurisNow.repository.FavoritoRepository;
import app.TurisNow.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FavoritoService {
    
    @Autowired
    private FavoritoRepository favoritoRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private ExperienciaRepository experienciaRepository;
    
    /**
     * Obtiene todos los favoritos de un usuario
     */
    @Transactional(readOnly = true)
    public List<FavoritoDTO> obtenerFavoritos(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        List<Favorito> favoritos = favoritoRepository.findByUsuarioId(usuario.getId());
        
        return favoritos.stream()
                .map(f -> new FavoritoDTO(
                    f.getExperiencia().getId(),
                    f.getExperiencia().getTitulo(),
                    f.getExperiencia().getDescripcion(),
                    f.getExperiencia().getPrecio(),
                    f.getExperiencia().getMoneda().name(),
                    f.getExperiencia().getCategoria().name(),
                    f.getExperiencia().getImagenUrl()
                ))
                .collect(Collectors.toList());
    }
    
    /**
     * Agrega una experiencia a favoritos (idempotente)
     */
    @Transactional
    public FavoritoDTO agregarFavorito(String username, Long experienciaId) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Experiencia experiencia = experienciaRepository.findById(experienciaId)
                .orElseThrow(() -> new RuntimeException("Experiencia no encontrada"));
        
        // Verificar si ya existe (idempotente)
        if (favoritoRepository.existsByUsuarioIdAndExperienciaId(usuario.getId(), experienciaId)) {
            // Ya existe, devolver la info de la experiencia
            return new FavoritoDTO(
                experiencia.getId(),
                experiencia.getTitulo(),
                experiencia.getDescripcion(),
                experiencia.getPrecio(),
                experiencia.getMoneda().name(),
                experiencia.getCategoria().name(),
                experiencia.getImagenUrl()
            );
        }
        
        // Crear nuevo favorito
        Favorito favorito = new Favorito();
        favorito.setUsuario(usuario);
        favorito.setExperiencia(experiencia);
        
        favoritoRepository.save(favorito);
        
        return new FavoritoDTO(
            experiencia.getId(),
            experiencia.getTitulo(),
            experiencia.getDescripcion(),
            experiencia.getPrecio(),
            experiencia.getMoneda().name(),
            experiencia.getCategoria().name(),
            experiencia.getImagenUrl()
        );
    }
    
    /**
     * Elimina una experiencia de favoritos
     */
    @Transactional
    public void eliminarFavorito(String username, Long experienciaId) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Favorito favorito = favoritoRepository.findByUsuarioIdAndExperienciaId(usuario.getId(), experienciaId)
                .orElseThrow(() -> new RuntimeException("Favorito no encontrado"));
        
        favoritoRepository.delete(favorito);
    }
    
    /**
     * Verifica si una experiencia está en favoritos
     */
    @Transactional(readOnly = true)
    public boolean esFavorito(String username, Long experienciaId) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        return favoritoRepository.existsByUsuarioIdAndExperienciaId(usuario.getId(), experienciaId);
    }
}

