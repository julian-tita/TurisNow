package app.TurisNow.service;

import app.TurisNow.dto.QRValidacionDTO;
import app.TurisNow.dto.ReservaDetalleDTO;
import app.TurisNow.dto.ReservaRequest;
import app.TurisNow.dto.ReservaResponse;
import app.TurisNow.model.*;
import app.TurisNow.repository.ReservaRepository;
import app.TurisNow.repository.SalidaRepository;
import app.TurisNow.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservaService {
    
    private static final Logger logger = LoggerFactory.getLogger(ReservaService.class);
    
    private final ReservaRepository reservaRepository;
    private final SalidaRepository salidaRepository;
    private final UsuarioRepository usuarioRepository;
    private final QRService qrService;
    
    /**
     * Crear una nueva reserva
     */
    @Transactional
    public ReservaResponse crearReserva(ReservaRequest request, Long usuarioId) {
        logger.info("🎫 Iniciando creación de reserva - Usuario: {}, Salida: {}, Cantidad: {}", 
            usuarioId, request.getSalidaId(), request.getCantidadPersonas());
        
        try {
            // Validar que la salida existe
            Salida salida = salidaRepository.findById(request.getSalidaId())
                .orElseThrow(() -> new RuntimeException("Salida no encontrada con id: " + request.getSalidaId()));
            
            logger.info("✓ Salida encontrada: {} - Capacidad disponible: {}", 
                salida.getId(), salida.getCapacidadDisponible());
            
            // Validar que el usuario existe
            Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + usuarioId));
            
            logger.info("✓ Usuario encontrado: {} ({})", usuario.getId(), usuario.getUsername());
            
            // Validar que la salida tiene capacidad disponible
            if (salida.getCapacidadDisponible() < request.getCantidadPersonas()) {
                logger.warn("❌ Capacidad insuficiente. Disponible: {}, Solicitado: {}", 
                    salida.getCapacidadDisponible(), request.getCantidadPersonas());
                return new ReservaResponse("No hay suficiente capacidad disponible. Disponible: " + salida.getCapacidadDisponible());
            }
            
            // Validar que la salida no ha pasado
            if (salida.getFechaInicio().isBefore(LocalDateTime.now())) {
                logger.warn("❌ Salida ya pasó. Fecha inicio: {}", salida.getFechaInicio());
                return new ReservaResponse("No se puede reservar una salida que ya ha pasado");
            }
            
            // Verificar si el usuario ya tiene una reserva activa para esta salida
            Optional<Reserva> reservaExistente = reservaRepository.findReservaActivaByUsuarioAndSalida(usuarioId, request.getSalidaId());
            if (reservaExistente.isPresent()) {
                logger.warn("❌ Usuario {} ya tiene reserva activa para salida {}: Reserva ID {}", 
                    usuarioId, request.getSalidaId(), reservaExistente.get().getId());
                return new ReservaResponse("Ya tienes una reserva activa para esta salida");
            }
            
            // Validar que el precio total sea correcto
            BigDecimal precioEsperado = salida.getExperiencia().getPrecio().multiply(BigDecimal.valueOf(request.getCantidadPersonas()));
            if (request.getPrecioTotal().compareTo(precioEsperado) != 0) {
                logger.warn("❌ Precio incorrecto. Esperado: {}, Recibido: {}", precioEsperado, request.getPrecioTotal());
                return new ReservaResponse("El precio total no coincide con el precio de la experiencia");
            }
            
            // Crear la reserva
            Reserva reserva = new Reserva();
            reserva.setUsuario(usuario);
            reserva.setSalida(salida);
            reserva.setCantidadPersonas(request.getCantidadPersonas());
            reserva.setPrecioTotal(request.getPrecioTotal());
            reserva.setEstado(Reserva.EstadoReserva.PENDIENTE);
            reserva.setObservaciones(request.getObservaciones());
            
            // Guardar la reserva primero para obtener el ID
            reserva = reservaRepository.save(reserva);
            
            // Generar token QR único
            String tokenQr = qrService.generarTokenReserva(reserva.getId());
            reserva.setTokenQr(tokenQr);
            reserva = reservaRepository.save(reserva);
            
            logger.info("✅ Reserva creada exitosamente: ID {} - Token QR: {}", reserva.getId(), tokenQr);
            
            // Actualizar la capacidad disponible de la salida
            int capacidadAnterior = salida.getCapacidadDisponible();
            salida.setCapacidadDisponible(salida.getCapacidadDisponible() - request.getCantidadPersonas());
            salidaRepository.save(salida);
            
            logger.info("✅ Capacidad actualizada para salida {}: {} -> {}", 
                salida.getId(), capacidadAnterior, salida.getCapacidadDisponible());
            
            // Mapear a response
            return mapearAResponse(reserva);
            
        } catch (Exception e) {
            logger.error("❌ Error al crear reserva - Usuario: {}, Salida: {}", 
                usuarioId, request.getSalidaId(), e);
            return new ReservaResponse("Error al crear la reserva: " + e.getMessage());
        }
    }
    
    /**
     * Obtener reservas de un usuario
     */
    public Page<ReservaDetalleDTO> obtenerReservasUsuario(Long usuarioId, Pageable pageable) {
        Page<Reserva> reservas = reservaRepository.findByUsuarioId(usuarioId, pageable);
        return reservas.map(this::mapearADetalleDTO);
    }
    
    
    /**
     * Obtener reservas de un usuario por estado
     */
    public Page<ReservaDetalleDTO> obtenerReservasUsuarioPorEstado(Long usuarioId, Reserva.EstadoReserva estado, Pageable pageable) {
        Page<Reserva> reservas = reservaRepository.findByUsuarioIdAndEstado(usuarioId, estado, pageable);
        return reservas.map(this::mapearADetalleDTO);
    }
    
    /**
     * Obtener detalle de una reserva específica
     */
    public ReservaDetalleDTO obtenerReservaPorId(Long reservaId, Long usuarioId) {
        Reserva reserva = reservaRepository.findById(reservaId)
            .orElseThrow(() -> new RuntimeException("Reserva no encontrada con id: " + reservaId));
        
        // Verificar que la reserva pertenece al usuario (o es admin)
        if (!reserva.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("No tienes permisos para ver esta reserva");
        }
        
        return mapearADetalleDTO(reserva);
    }
    
    /**
     * Confirmar una reserva
     */
    @Transactional
    public ReservaResponse confirmarReserva(Long reservaId, Long usuarioId) {
        try {
            Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con id: " + reservaId));
            
            // Verificar que la reserva pertenece al usuario
            if (!reserva.getUsuario().getId().equals(usuarioId)) {
                return new ReservaResponse("No tienes permisos para confirmar esta reserva");
            }
            
            // Verificar que la reserva está pendiente
            if (reserva.getEstado() != Reserva.EstadoReserva.PENDIENTE) {
                return new ReservaResponse("Solo se pueden confirmar reservas pendientes");
            }
            
            // Confirmar la reserva
            reserva.setEstado(Reserva.EstadoReserva.CONFIRMADA);
            reserva.setFechaConfirmacion(LocalDateTime.now());
            reservaRepository.save(reserva);
            
            return mapearAResponse(reserva);
            
        } catch (Exception e) {
            return new ReservaResponse("Error al confirmar la reserva: " + e.getMessage());
        }
    }
    
    /**
     * Cancelar una reserva
     */
    @Transactional
    public ReservaResponse cancelarReserva(Long reservaId, Long usuarioId) {
        try {
            Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con id: " + reservaId));
            
            // Verificar que la reserva pertenece al usuario
            if (!reserva.getUsuario().getId().equals(usuarioId)) {
                return new ReservaResponse("No tienes permisos para cancelar esta reserva");
            }
            
            // Verificar que la reserva se puede cancelar
            if (reserva.getEstado() == Reserva.EstadoReserva.CANCELADA) {
                return new ReservaResponse("La reserva ya está cancelada");
            }
            
            if (reserva.getEstado() == Reserva.EstadoReserva.COMPLETADA) {
                return new ReservaResponse("No se puede cancelar una reserva completada");
            }
            
            // Verificar que no es muy tarde para cancelar (24 horas antes)
            LocalDateTime limiteCancelacion = reserva.getSalida().getFechaInicio().minusHours(24);
            if (LocalDateTime.now().isAfter(limiteCancelacion)) {
                return new ReservaResponse("No se puede cancelar la reserva menos de 24 horas antes de la salida");
            }
            
            // Cancelar la reserva
            reserva.setEstado(Reserva.EstadoReserva.CANCELADA);
            reserva.setFechaCancelacion(LocalDateTime.now());
            reservaRepository.save(reserva);
            
            // Liberar la capacidad de la salida
            Salida salida = reserva.getSalida();
            salida.setCapacidadDisponible(salida.getCapacidadDisponible() + reserva.getCantidadPersonas());
            salidaRepository.save(salida);
            
            return mapearAResponse(reserva);
            
        } catch (Exception e) {
            return new ReservaResponse("Error al cancelar la reserva: " + e.getMessage());
        }
    }
    
    /**
     * Obtener estadísticas de reservas de un usuario
     */
    public ReservaDetalleDTO.EstadisticasDTO obtenerEstadisticasUsuario(Long usuarioId) {
        Long totalReservas = reservaRepository.countByUsuarioIdAndEstado(usuarioId, null);
        Long reservasPendientes = reservaRepository.countByUsuarioIdAndEstado(usuarioId, Reserva.EstadoReserva.PENDIENTE);
        Long reservasConfirmadas = reservaRepository.countByUsuarioIdAndEstado(usuarioId, Reserva.EstadoReserva.CONFIRMADA);
        Long reservasCanceladas = reservaRepository.countByUsuarioIdAndEstado(usuarioId, Reserva.EstadoReserva.CANCELADA);
        Long reservasCompletadas = reservaRepository.countByUsuarioIdAndEstado(usuarioId, Reserva.EstadoReserva.COMPLETADA);
        
        ReservaDetalleDTO.EstadisticasDTO estadisticas = new ReservaDetalleDTO.EstadisticasDTO();
        estadisticas.setTotalReservas(totalReservas);
        estadisticas.setReservasPendientes(reservasPendientes);
        estadisticas.setReservasConfirmadas(reservasConfirmadas);
        estadisticas.setReservasCanceladas(reservasCanceladas);
        estadisticas.setReservasCompletadas(reservasCompletadas);
        
        return estadisticas;
    }
    
    /**
     * Obtener ID de usuario por username
     */
    public Long obtenerUsuarioIdPorUsername(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con username: " + username));
        return usuario.getId();
    }
    
    
    /**
     * Mapear Reserva a ReservaResponse
     */
    private ReservaResponse mapearAResponse(Reserva reserva) {
        ReservaResponse response = new ReservaResponse();
        response.setId(reserva.getId());
        response.setSalidaId(reserva.getSalida().getId());
        response.setTituloExperiencia(reserva.getSalida().getExperiencia().getTitulo());
        response.setCiudadExperiencia(reserva.getSalida().getExperiencia().getUbicacion().getCiudad());
        response.setFechaInicio(reserva.getSalida().getFechaInicio());
        response.setFechaFin(reserva.getSalida().getFechaFin());
        response.setCantidadPersonas(reserva.getCantidadPersonas());
        response.setPrecioTotal(reserva.getPrecioTotal());
        response.setEstado(reserva.getEstado().getDescripcion());
        response.setFechaReserva(reserva.getFechaReserva());
        response.setFechaConfirmacion(reserva.getFechaConfirmacion());
        response.setObservaciones(reserva.getObservaciones());
        response.setMensaje("Reserva procesada exitosamente");
        
        return response;
    }
    
    /**
     * Validar código QR y obtener información de la reserva
     */
    public QRValidacionDTO validarQR(String tokenQr) {
        try {
            logger.info("🔍 Validando QR con token: {}", tokenQr);
            
            // Validar formato del token
            if (!qrService.esTokenValido(tokenQr)) {
                logger.warn("❌ Token con formato inválido: {}", tokenQr);
                return QRValidacionDTO.builder()
                        .valido(false)
                        .mensaje("Código QR inválido")
                        .build();
            }
            
            // Buscar reserva por token
            Optional<Reserva> reservaOpt = reservaRepository.findByTokenQrWithDetails(tokenQr);
            
            if (reservaOpt.isEmpty()) {
                logger.warn("❌ No se encontró reserva con token: {}", tokenQr);
                return QRValidacionDTO.builder()
                        .valido(false)
                        .mensaje("Código QR no encontrado en el sistema")
                        .build();
            }
            
            Reserva reserva = reservaOpt.get();
            
            // Validar estado de la reserva
            if (reserva.getEstado() == Reserva.EstadoReserva.CANCELADA) {
                logger.warn("❌ Reserva cancelada: {}", reserva.getId());
                return QRValidacionDTO.builder()
                        .valido(false)
                        .mensaje("Esta reserva ha sido cancelada")
                        .reservaId(reserva.getId())
                        .tokenQr(tokenQr)
                        .estadoReserva(reserva.getEstado().getDescripcion())
                        .build();
            }
            
            // Construir respuesta exitosa
            Experiencia experiencia = reserva.getSalida().getExperiencia();
            Ubicacion ubicacion = experiencia.getUbicacion();
            Usuario usuario = reserva.getUsuario();
            
            String ubicacionCompleta = String.format("%s, %s, %s", 
                ubicacion.getCiudad(), ubicacion.getRegion(), ubicacion.getPais());
            
            // Verificar si la fecha de la experiencia es hoy
            LocalDateTime ahora = LocalDateTime.now();
            LocalDateTime inicioExperiencia = reserva.getSalida().getFechaInicio();
            boolean alertaFecha = !inicioExperiencia.toLocalDate().equals(ahora.toLocalDate());
            
            logger.info("✅ QR válido para reserva: {} - Cliente: {}", reserva.getId(), usuario.getNombreCompleto());
            
            return QRValidacionDTO.builder()
                    .valido(true)
                    .mensaje(reserva.getCheckinRealizado() ? 
                        "Reserva válida - Check-in ya realizado" : 
                        "Reserva válida - Lista para check-in")
                    // Reserva
                    .reservaId(reserva.getId())
                    .tokenQr(tokenQr)
                    .estadoReserva(reserva.getEstado().getDescripcion())
                    // Cliente
                    .nombreCliente(usuario.getNombreCompleto())
                    .emailCliente(usuario.getEmail())
                    // Experiencia
                    .tituloExperiencia(experiencia.getTitulo())
                    .categoriaExperiencia(experiencia.getCategoria().getValor())
                    .fechaInicio(inicioExperiencia)
                    .fechaFin(reserva.getSalida().getFechaFin())
                    .ubicacion(ubicacionCompleta)
                    // Detalles
                    .cantidadPersonas(reserva.getCantidadPersonas())
                    .precioTotal(reserva.getPrecioTotal())
                    .moneda(experiencia.getMoneda().name())
                    .fechaReserva(reserva.getFechaReserva())
                    // Check-in
                    .checkinRealizado(reserva.getCheckinRealizado())
                    .fechaCheckin(reserva.getFechaCheckin())
                    .checkinPor(reserva.getCheckinPor())
                    // Alertas
                    .alertaFecha(alertaFecha)
                    .alertaCapacidad(reserva.getCantidadPersonas() > 10)
                    .build();
                    
        } catch (Exception e) {
            logger.error("❌ Error validando QR {}: {}", tokenQr, e.getMessage(), e);
            return QRValidacionDTO.builder()
                    .valido(false)
                    .mensaje("Error al validar el código QR: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Realizar check-in de una reserva mediante QR
     */
    @Transactional
    public QRValidacionDTO realizarCheckin(String tokenQr, String operador) {
        try {
            logger.info("✅ Iniciando check-in para token: {} - Operador: {}", tokenQr, operador);
            
            // Primero validar el QR
            QRValidacionDTO validacion = validarQR(tokenQr);
            
            if (!validacion.getValido()) {
                return validacion;
            }
            
            // Buscar la reserva
            Reserva reserva = reservaRepository.findByTokenQrWithDetails(tokenQr)
                    .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
            
            // Verificar si ya se hizo check-in
            if (reserva.getCheckinRealizado()) {
                logger.warn("⚠️ Check-in ya realizado previamente para reserva: {}", reserva.getId());
                validacion.setMensaje("Check-in ya realizado el " + 
                    reserva.getFechaCheckin().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
                return validacion;
            }
            
            // Realizar check-in
            reserva.setCheckinRealizado(true);
            reserva.setFechaCheckin(LocalDateTime.now());
            reserva.setCheckinPor(operador != null && !operador.isEmpty() ? operador : "Sistema");
            reservaRepository.save(reserva);
            
            logger.info("✅ Check-in completado para reserva: {} - Operador: {}", 
                reserva.getId(), reserva.getCheckinPor());
            
            // Actualizar respuesta
            validacion.setCheckinRealizado(true);
            validacion.setFechaCheckin(reserva.getFechaCheckin());
            validacion.setCheckinPor(reserva.getCheckinPor());
            validacion.setMensaje("Check-in realizado exitosamente");
            
            return validacion;
            
        } catch (Exception e) {
            logger.error("❌ Error en check-in para token {}: {}", tokenQr, e.getMessage(), e);
            return QRValidacionDTO.builder()
                    .valido(false)
                    .mensaje("Error al realizar check-in: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Obtener el QR de una reserva para el usuario
     */
    public Map<String, Object> obtenerQRReserva(Long reservaId) {
        try {
            Optional<Reserva> reservaOpt = reservaRepository.findById(reservaId);
            
            if (reservaOpt.isEmpty()) {
                return null;
            }
            
            Reserva reserva = reservaOpt.get();
            
            // Si la reserva no tiene token, generarlo ahora
            if (reserva.getTokenQr() == null || reserva.getTokenQr().isEmpty()) {
                String tokenQr = qrService.generarTokenReserva(reserva.getId());
                reserva.setTokenQr(tokenQr);
                reservaRepository.save(reserva);
                logger.info("🔲 Token QR generado para reserva existente: {} - Token: {}", reservaId, tokenQr);
            }
            
            // Generar código QR
            String qrBase64 = qrService.generarQRParaReserva(reserva.getTokenQr());
            
            Map<String, Object> resultado = new java.util.HashMap<>();
            resultado.put("reservaId", reserva.getId());
            resultado.put("tokenQr", reserva.getTokenQr());
            resultado.put("qrCodeBase64", qrBase64);
            resultado.put("estadoReserva", reserva.getEstado().getDescripcion());
            resultado.put("checkinRealizado", reserva.getCheckinRealizado());
            resultado.put("fechaCheckin", reserva.getFechaCheckin());
            
            // Información adicional de la reserva
            resultado.put("tituloExperiencia", reserva.getSalida().getExperiencia().getTitulo());
            resultado.put("fechaInicio", reserva.getSalida().getFechaInicio());
            resultado.put("cantidadPersonas", reserva.getCantidadPersonas());
            
            return resultado;
            
        } catch (Exception e) {
            logger.error("❌ Error obteniendo QR de reserva {}: {}", reservaId, e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Mapear Reserva a ReservaDetalleDTO
     */
    private ReservaDetalleDTO mapearADetalleDTO(Reserva reserva) {
        ReservaDetalleDTO dto = new ReservaDetalleDTO();
        dto.setId(reserva.getId());
        dto.setSalidaId(reserva.getSalida().getId());
        dto.setExperienciaId(reserva.getSalida().getExperiencia().getId());
        dto.setTituloExperiencia(reserva.getSalida().getExperiencia().getTitulo());
        dto.setDescripcionExperiencia(reserva.getSalida().getExperiencia().getDescripcion());
        dto.setImagenUrlExperiencia(reserva.getSalida().getExperiencia().getImagenUrl());
        dto.setCategoriaExperiencia(reserva.getSalida().getExperiencia().getCategoria().getValor());
        dto.setMonedaExperiencia(reserva.getSalida().getExperiencia().getMoneda().name());
        dto.setPrecioExperiencia(reserva.getSalida().getExperiencia().getPrecio());
        
        // Mapear ubicación
        ReservaDetalleDTO.UbicacionDTO ubicacionDTO = new ReservaDetalleDTO.UbicacionDTO();
        ubicacionDTO.setCiudad(reserva.getSalida().getExperiencia().getUbicacion().getCiudad());
        ubicacionDTO.setRegion(reserva.getSalida().getExperiencia().getUbicacion().getRegion());
        ubicacionDTO.setPais(reserva.getSalida().getExperiencia().getUbicacion().getPais());
        dto.setUbicacion(ubicacionDTO);
        
        // Detalles de la salida
        dto.setFechaInicio(reserva.getSalida().getFechaInicio());
        dto.setFechaFin(reserva.getSalida().getFechaFin());
        dto.setCapacidadTotal(reserva.getSalida().getCapacidadTotal());
        dto.setCapacidadDisponible(reserva.getSalida().getCapacidadDisponible());
        
        // Detalles de la reserva
        dto.setCantidadPersonas(reserva.getCantidadPersonas());
        dto.setPrecioTotal(reserva.getPrecioTotal());
        dto.setEstado(reserva.getEstado().getDescripcion());
        dto.setFechaReserva(reserva.getFechaReserva());
        dto.setFechaConfirmacion(reserva.getFechaConfirmacion());
        dto.setFechaCancelacion(reserva.getFechaCancelacion());
        dto.setObservaciones(reserva.getObservaciones());
        
        // QR Code y Check-in
        dto.setTokenQr(reserva.getTokenQr());
        dto.setCheckinRealizado(reserva.getCheckinRealizado());
        dto.setFechaCheckin(reserva.getFechaCheckin());
        dto.setCheckinPor(reserva.getCheckinPor());
        
        // Información del usuario
        dto.setNombreUsuario(reserva.getUsuario().getNombreCompleto());
        dto.setEmailUsuario(reserva.getUsuario().getEmail());
        
        return dto;
    }
}
