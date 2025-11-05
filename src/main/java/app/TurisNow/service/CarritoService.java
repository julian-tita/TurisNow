package app.TurisNow.service;

import app.TurisNow.dto.*;
import app.TurisNow.model.*;
import app.TurisNow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CarritoService {
    
    @Autowired
    private CarritoRepository carritoRepository;
    
    @Autowired
    private CarritoItemRepository carritoItemRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private ExperienciaRepository experienciaRepository;
    
    @Autowired
    private SalidaRepository salidaRepository;
    
    @Autowired
    private ReservaService reservaService;
    
    @Autowired
    private ReservaRepository reservaRepository;
    
    private static final DateTimeFormatter FECHA_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    
    /**
     * Obtiene o crea el carrito del usuario
     */
    @Transactional
    private Carrito obtenerOCrearCarrito(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        return carritoRepository.findByUsuarioId(usuario.getId())
                .orElseGet(() -> {
                    Carrito nuevoCarrito = new Carrito();
                    nuevoCarrito.setUsuario(usuario);
                    return carritoRepository.save(nuevoCarrito);
                });
    }
    
    /**
     * Obtiene el carrito completo con todos sus items
     */
    @Transactional(readOnly = true)
    public CarritoDTO obtenerCarrito(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Carrito carrito = carritoRepository.findByUsuarioId(usuario.getId())
                .orElseGet(() -> {
                    // Carrito vacío
                    Carrito nuevo = new Carrito();
                    nuevo.setUsuario(usuario);
                    return nuevo;
                });
        
        List<CarritoItem> items = carrito.getId() != null 
            ? carritoItemRepository.findByCarritoIdWithDetails(carrito.getId())
            : List.of();
        
        CarritoDTO carritoDTO = new CarritoDTO();
        
        List<CarritoDTO.CarritoItemDTO> itemsDTO = items.stream()
                .map(item -> {
                    CarritoDTO.CarritoItemDTO itemDTO = new CarritoDTO.CarritoItemDTO();
                    itemDTO.setItemId(item.getId());
                    itemDTO.setExperienciaId(item.getExperiencia().getId());
                    itemDTO.setSalidaId(item.getSalida().getId());
                    itemDTO.setTitulo(item.getExperiencia().getTitulo());
                    itemDTO.setDescripcion(item.getExperiencia().getDescripcion());
                    itemDTO.setImagenUrl(item.getExperiencia().getImagenUrl());
                    itemDTO.setFechaInicio(item.getSalida().getFechaInicio().format(FECHA_FORMATTER));
                    itemDTO.setFechaFin(item.getSalida().getFechaFin() != null 
                        ? item.getSalida().getFechaFin().format(FECHA_FORMATTER) : null);
                    itemDTO.setCantidad(item.getCantidad());
                    itemDTO.setPrecioUnitario(item.getPrecioUnitario());
                    itemDTO.setMoneda(item.getMoneda());
                    itemDTO.setSubtotal(item.getSubtotal());
                    return itemDTO;
                })
                .collect(Collectors.toList());
        
        carritoDTO.setItems(itemsDTO);
        
        // Calcular total (asumiendo misma moneda)
        BigDecimal total = itemsDTO.stream()
                .map(CarritoDTO.CarritoItemDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        carritoDTO.setTotal(total);
        carritoDTO.setMoneda(itemsDTO.isEmpty() ? "ARS" : itemsDTO.get(0).getMoneda());
        
        return carritoDTO;
    }
    
    /**
     * Agrega un item al carrito
     */
    @Transactional
    public CarritoDTO agregarItem(String username, AddCarritoItemRequest request) {
        Carrito carrito = obtenerOCrearCarrito(username);
        
        // Validar experiencia
        Experiencia experiencia = experienciaRepository.findById(request.getExperienciaId())
                .orElseThrow(() -> new RuntimeException("Experiencia no encontrada"));
        
        // Validar salida
        Salida salida = salidaRepository.findById(request.getSalidaId())
                .orElseThrow(() -> new RuntimeException("Salida no encontrada"));
        
        // Validar capacidad
        if (salida.getCapacidadDisponible() < request.getCantidad()) {
            throw new RuntimeException("No hay suficiente capacidad disponible");
        }
        
        // Validar que la salida pertenece a la experiencia
        if (!salida.getExperiencia().getId().equals(experiencia.getId())) {
            throw new RuntimeException("La salida no pertenece a la experiencia especificada");
        }
        
        // Validar que la fecha no haya pasado
        if (salida.getFechaInicio().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("No se puede agregar una salida que ya ha pasado");
        }
        
        // Verificar si ya existe el item (misma salida)
        carritoItemRepository.findByCarritoIdAndSalidaId(carrito.getId(), request.getSalidaId())
                .ifPresent(item -> {
                    throw new RuntimeException("Esta salida ya está en el carrito. Use actualizar para modificar la cantidad.");
                });
        
        // Crear nuevo item
        CarritoItem item = new CarritoItem();
        item.setCarrito(carrito);
        item.setExperiencia(experiencia);
        item.setSalida(salida);
        item.setCantidad(request.getCantidad());
        item.setPrecioUnitario(experiencia.getPrecio());
        item.setMoneda(experiencia.getMoneda().name());
        
        carritoItemRepository.save(item);
        
        return obtenerCarrito(username);
    }
    
    /**
     * Actualiza la cantidad de un item del carrito
     */
    @Transactional
    public CarritoDTO actualizarItem(String username, Long itemId, UpdateCarritoItemRequest request) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        CarritoItem item = carritoItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item no encontrado"));
        
        // Verificar que el item pertenece al carrito del usuario
        if (!item.getCarrito().getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("No tienes permiso para modificar este item");
        }
        
        // Validar capacidad
        if (item.getSalida().getCapacidadDisponible() < request.getCantidad()) {
            throw new RuntimeException("No hay suficiente capacidad disponible");
        }
        
        item.setCantidad(request.getCantidad());
        carritoItemRepository.save(item);
        
        return obtenerCarrito(username);
    }
    
    /**
     * Elimina un item del carrito
     */
    @Transactional
    public void eliminarItem(String username, Long itemId) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        CarritoItem item = carritoItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item no encontrado"));
        
        // Verificar que el item pertenece al carrito del usuario
        if (!item.getCarrito().getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("No tienes permiso para eliminar este item");
        }
        
        carritoItemRepository.delete(item);
    }
    
    /**
     * Vacía completamente el carrito
     */
    @Transactional
    public void vaciarCarrito(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        carritoRepository.findByUsuarioId(usuario.getId())
                .ifPresent(carrito -> {
                    carritoItemRepository.deleteByCarritoId(carrito.getId());
                });
    }
    
    /**
     * Realiza el checkout del carrito creando reservas
     */
    @Transactional
    public CheckoutResponse checkout(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Carrito carrito = carritoRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Carrito vacío"));
        
        List<CarritoItem> items = carritoItemRepository.findByCarritoIdWithDetails(carrito.getId());
        
        if (items.isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }
        
        CheckoutResponse response = new CheckoutResponse();
        
        // Procesar cada item del carrito
        for (CarritoItem item : items) {
            try {
                // Validar disponibilidad nuevamente
                Salida salida = salidaRepository.findById(item.getSalida().getId())
                        .orElseThrow(() -> new RuntimeException("Salida no encontrada"));
                
                if (salida.getCapacidadDisponible() < item.getCantidad()) {
                    CheckoutResponse.ErrorItem error = new CheckoutResponse.ErrorItem();
                    error.setSalidaId(salida.getId());
                    error.setTitulo(item.getExperiencia().getTitulo());
                    error.setMensaje("Capacidad insuficiente. Disponible: " + salida.getCapacidadDisponible());
                    response.getErrores().add(error);
                    continue;
                }
                
                // Crear la reserva usando el servicio existente
                ReservaRequest reservaRequest = new ReservaRequest();
                reservaRequest.setSalidaId(item.getSalida().getId());
                reservaRequest.setCantidadPersonas(item.getCantidad());
                reservaRequest.setPrecioTotal(item.getSubtotal());
                reservaRequest.setObservaciones("Reserva desde carrito de compras");
                
                ReservaResponse reservaResponse = reservaService.crearReserva(reservaRequest, usuario.getId());
                
                if (reservaResponse.getId() != null) {
                    // Éxito - crear DTO de respuesta
                    CheckoutResponse.ReservaCreada reservaCreada = new CheckoutResponse.ReservaCreada();
                    reservaCreada.setId(reservaResponse.getId());
                    reservaCreada.setSalidaId(reservaResponse.getSalidaId());
                    reservaCreada.setCantidadPersonas(reservaResponse.getCantidadPersonas());
                    reservaCreada.setPrecioTotal(reservaResponse.getPrecioTotal());
                    reservaCreada.setEstado(reservaResponse.getEstado());
                    response.getReservas().add(reservaCreada);
                } else {
                    // Error
                    CheckoutResponse.ErrorItem error = new CheckoutResponse.ErrorItem();
                    error.setSalidaId(item.getSalida().getId());
                    error.setTitulo(item.getExperiencia().getTitulo());
                    error.setMensaje(reservaResponse.getMensaje());
                    response.getErrores().add(error);
                }
                
            } catch (Exception e) {
                CheckoutResponse.ErrorItem error = new CheckoutResponse.ErrorItem();
                error.setSalidaId(item.getSalida().getId());
                error.setTitulo(item.getExperiencia().getTitulo());
                error.setMensaje("Error al procesar: " + e.getMessage());
                response.getErrores().add(error);
            }
        }
        
        // Si hubo al menos una reserva exitosa, vaciar el carrito
        if (!response.getReservas().isEmpty()) {
            carritoItemRepository.deleteByCarritoId(carrito.getId());
        }
        
        return response;
    }
}

