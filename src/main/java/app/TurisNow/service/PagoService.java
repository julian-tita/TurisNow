package app.TurisNow.service;

import app.TurisNow.dto.*;
import app.TurisNow.model.*;
import app.TurisNow.repository.*;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.*;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PagoService {
    
    private static final Logger logger = LoggerFactory.getLogger(PagoService.class);
    
    @Autowired
    private PagoRepository pagoRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private CarritoRepository carritoRepository;
    
    @Autowired
    private CarritoItemRepository carritoItemRepository;
    
    @Autowired
    private ReservaRepository reservaRepository;
    
    @Autowired
    private SalidaRepository salidaRepository;
    
    @Autowired
    private ReservaService reservaService;
    
    @Value("${mercadopago.webhook.url}")
    private String webhookUrl;
    
    @Value("${mercadopago.success.url}")
    private String successUrl;
    
    @Value("${mercadopago.failure.url}")
    private String failureUrl;
    
    @Value("${mercadopago.pending.url}")
    private String pendingUrl;
    
    /**
     * Crea una preferencia de pago en Mercado Pago con los items del carrito
     */
    @Transactional
    public CheckoutResponse crearPreferenciaPago(String username) {
        try {
            logger.info("💳 Iniciando creación de preferencia de pago para usuario: {}", username);
            
            // 1. Obtener usuario y carrito
            Usuario usuario = usuarioRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            Carrito carrito = carritoRepository.findByUsuarioId(usuario.getId())
                    .orElseThrow(() -> new RuntimeException("Carrito vacío"));
            
            List<CarritoItem> items = carritoItemRepository.findByCarritoIdWithDetails(carrito.getId());
            
            if (items.isEmpty()) {
                throw new RuntimeException("El carrito está vacío");
            }
            
            // 2. Validar disponibilidad de stock antes de crear la preferencia
            for (CarritoItem item : items) {
                Salida salida = salidaRepository.findById(item.getSalida().getId())
                        .orElseThrow(() -> new RuntimeException("Salida no encontrada: " + item.getSalida().getId()));
                
                if (salida.getCapacidadDisponible() < item.getCantidad()) {
                    throw new RuntimeException(
                        String.format("Stock insuficiente para '%s'. Disponible: %d, Solicitado: %d",
                            item.getExperiencia().getTitulo(),
                            salida.getCapacidadDisponible(),
                            item.getCantidad())
                    );
                }
            }
            
            // 3. Calcular total
            BigDecimal montoTotal = items.stream()
                    .map(CarritoItem::getSubtotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // 4. Crear items para Mercado Pago
            List<PreferenceItemRequest> preferenceItems = items.stream()
                    .map(item -> PreferenceItemRequest.builder()
                            .title(item.getExperiencia().getTitulo())
                            .description(item.getExperiencia().getDescripcion())
                            .quantity(item.getCantidad())
                            .currencyId("ARS") // TODO: hacer configurable por país
                            .unitPrice(item.getPrecioUnitario())
                            .build())
                    .collect(Collectors.toList());
            
            // 5. Configurar URLs de retorno
            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success(successUrl)
                    .failure(failureUrl)
                    .pending(pendingUrl)
                    .build();
            
            // 6. Crear external_reference con IDs de salidas para tracking
            String externalReference = items.stream()
                    .map(item -> item.getSalida().getId().toString())
                    .collect(Collectors.joining(","));
            
            // 7. Configurar la preferencia
            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(preferenceItems)
                    .backUrls(backUrls)
                    // .autoReturn("approved") // Comentado: requiere URLs públicas (no localhost)
                    .notificationUrl(webhookUrl)
                    .externalReference(externalReference)
                    .statementDescriptor("TurisNow") // Nombre que aparece en el resumen de la tarjeta
                    .payer(PreferencePayerRequest.builder()
                            .name(usuario.getNombre())
                            .surname(usuario.getApellido())
                            .email(usuario.getEmail())
                            .build())
                    .build();
            
            // 8. Crear la preferencia en Mercado Pago
            logger.info("📤 Enviando preferencia a Mercado Pago:");
            logger.info("   Monto total: {} {}", montoTotal, "ARS");
            logger.info("   Items: {}", preferenceItems.size());
            logger.info("   Usuario: {} ({})", usuario.getEmail(), usuario.getNombre());
            logger.info("   External Reference: {}", externalReference);
            logger.info("   Webhook URL: {}", webhookUrl);
            
            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);
            
            logger.info("✅ Preferencia creada en MP: {}", preference.getId());
            
            // 9. Guardar el pago en nuestra base de datos
            Pago pago = new Pago();
            pago.setPreferenceId(preference.getId());
            pago.setUsuario(usuario);
            pago.setMontoTotal(montoTotal);
            pago.setMoneda("ARS");
            pago.setEstado(Pago.EstadoPago.PENDIENTE);
            pago.setDescripcion("Pago de " + items.size() + " experiencia(s)");
            pago.setExternalReference(externalReference);
            pago.setInitPoint(preference.getInitPoint());
            pago.setEmailComprador(usuario.getEmail());
            
            // Calcular fecha de expiración (por defecto MP da 30 días)
            if (preference.getDateOfExpiration() != null) {
                pago.setFechaExpiracion(
                    preference.getDateOfExpiration().toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDateTime()
                );
            }
            
            pago = pagoRepository.save(pago);
            
            logger.info("✅ Pago guardado en BD con ID: {}", pago.getId());
            
            // 10. Crear respuesta
            CheckoutResponse response = new CheckoutResponse();
            response.setSuccess(true);
            response.setMessage("Preferencia de pago creada exitosamente");
            response.setPagoId(pago.getId());
            response.setPreferenceId(preference.getId());
            response.setInitPoint(preference.getInitPoint());
            response.setMontoTotal(montoTotal);
            
            return response;
            
        } catch (MPApiException e) {
            // Error de la API de Mercado Pago - mostrar detalles completos
            logger.error("❌ Error API Mercado Pago:");
            logger.error("   Status Code: {}", e.getStatusCode());
            logger.error("   Message: {}", e.getMessage());
            
            // Intentar obtener el response body con más detalles
            if (e.getApiResponse() != null) {
                logger.error("   API Response: {}", e.getApiResponse().getContent());
            }
            
            throw new RuntimeException("Error de Mercado Pago: " + e.getMessage() + 
                " (Status: " + e.getStatusCode() + ")");
                
        } catch (MPException e) {
            // Error del SDK de Mercado Pago
            logger.error("❌ Error SDK Mercado Pago: {}", e.getMessage(), e);
            throw new RuntimeException("Error del SDK de Mercado Pago: " + e.getMessage());
            
        } catch (Exception e) {
            logger.error("❌ Error inesperado: {}", e.getMessage(), e);
            throw new RuntimeException("Error al procesar el pago: " + e.getMessage());
        }
    }
    
    /**
     * Crea una preferencia de pago directa (sin carrito) para una salida específica
     */
    @Transactional
    public CheckoutResponse crearPreferenciaPagoDirecto(String username, Long salidaId, Integer cantidad, String observaciones) {
        try {
            logger.info("💳 Iniciando creación de preferencia de pago DIRECTO para usuario: {}", username);
            logger.info("   Salida ID: {}, Cantidad: {}", salidaId, cantidad);
            
            // 1. Obtener usuario
            Usuario usuario = usuarioRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            // 2. Obtener la salida con la experiencia
            Salida salida = salidaRepository.findById(salidaId)
                    .orElseThrow(() -> new RuntimeException("Salida no encontrada: " + salidaId));
            
            Experiencia experiencia = salida.getExperiencia();
            if (experiencia == null) {
                throw new RuntimeException("La salida no tiene una experiencia asociada");
            }
            
            // 3. Validar disponibilidad de stock
            if (salida.getCapacidadDisponible() < cantidad) {
                throw new RuntimeException(
                    String.format("Stock insuficiente para '%s'. Disponible: %d, Solicitado: %d",
                        experiencia.getTitulo(),
                        salida.getCapacidadDisponible(),
                        cantidad)
                );
            }
            
            // 4. Calcular total
            BigDecimal precioUnitario = experiencia.getPrecio();
            BigDecimal montoTotal = precioUnitario.multiply(BigDecimal.valueOf(cantidad));
            
            // 5. Crear item para Mercado Pago
            PreferenceItemRequest preferenceItem = PreferenceItemRequest.builder()
                    .title(experiencia.getTitulo())
                    .description(experiencia.getDescripcion())
                    .quantity(cantidad)
                    .currencyId("ARS")
                    .unitPrice(precioUnitario)
                    .build();
            
            List<PreferenceItemRequest> preferenceItems = List.of(preferenceItem);
            
            // 6. Configurar URLs de retorno
            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success(successUrl)
                    .failure(failureUrl)
                    .pending(pendingUrl)
                    .build();
            
            // 7. Crear external_reference con ID de salida
            String externalReference = salidaId.toString();
            
            // 8. Configurar la preferencia
            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(preferenceItems)
                    .backUrls(backUrls)
                    // .autoReturn("approved") // Comentado: requiere URLs públicas (no localhost)
                    .notificationUrl(webhookUrl)
                    .externalReference(externalReference)
                    .statementDescriptor("TurisNow")
                    .payer(PreferencePayerRequest.builder()
                            .name(usuario.getNombre())
                            .surname(usuario.getApellido())
                            .email(usuario.getEmail())
                            .build())
                    .build();
            
            // 9. Crear la preferencia en Mercado Pago
            logger.info("📤 Enviando preferencia DIRECTA a Mercado Pago:");
            logger.info("   Monto total: {} {}", montoTotal, "ARS");
            logger.info("   Experiencia: {}", experiencia.getTitulo());
            logger.info("   Usuario: {} ({})", usuario.getEmail(), usuario.getNombre());
            logger.info("   External Reference: {}", externalReference);
            logger.info("   Webhook URL: {}", webhookUrl);
            
            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);
            
            logger.info("✅ Preferencia creada en MP: {}", preference.getId());
            
            // 10. Guardar el pago en nuestra base de datos
            Pago pago = new Pago();
            pago.setPreferenceId(preference.getId());
            pago.setUsuario(usuario);
            pago.setMontoTotal(montoTotal);
            pago.setMoneda("ARS");
            pago.setEstado(Pago.EstadoPago.PENDIENTE);
            pago.setDescripcion("Pago de experiencia: " + experiencia.getTitulo());
            pago.setExternalReference(externalReference);
            pago.setInitPoint(preference.getInitPoint());
            pago.setEmailComprador(usuario.getEmail());
            
            // Guardar observaciones en datos adicionales si existen
            if (observaciones != null && !observaciones.isEmpty()) {
                pago.setDatosAdicionales("{\"observaciones\": \"" + observaciones + "\"}");
            }
            
            // Calcular fecha de expiración (por defecto MP da 30 días)
            if (preference.getDateOfExpiration() != null) {
                pago.setFechaExpiracion(
                    preference.getDateOfExpiration().toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDateTime()
                );
            }
            
            pago = pagoRepository.save(pago);
            
            logger.info("✅ Pago DIRECTO guardado en BD con ID: {}", pago.getId());
            
            // 11. Crear respuesta
            CheckoutResponse response = new CheckoutResponse();
            response.setSuccess(true);
            response.setMessage("Preferencia de pago creada exitosamente");
            response.setPagoId(pago.getId());
            response.setPreferenceId(preference.getId());
            response.setInitPoint(preference.getInitPoint());
            response.setMontoTotal(montoTotal);
            
            return response;
            
        } catch (MPApiException e) {
            logger.error("❌ Error API Mercado Pago:");
            logger.error("   Status Code: {}", e.getStatusCode());
            logger.error("   Message: {}", e.getMessage());
            
            if (e.getApiResponse() != null) {
                logger.error("   API Response: {}", e.getApiResponse().getContent());
            }
            
            throw new RuntimeException("Error de Mercado Pago: " + e.getMessage() + 
                " (Status: " + e.getStatusCode() + ")");
                
        } catch (MPException e) {
            logger.error("❌ Error SDK Mercado Pago: {}", e.getMessage(), e);
            throw new RuntimeException("Error del SDK de Mercado Pago: " + e.getMessage());
            
        } catch (Exception e) {
            logger.error("❌ Error inesperado en checkout directo: {}", e.getMessage(), e);
            throw new RuntimeException("Error al procesar el pago: " + e.getMessage());
        }
    }
    
    /**
     * Procesa una notificación webhook de Mercado Pago
     */
    @Transactional
    public void procesarNotificacionWebhook(String topic, String id) {
        logger.info("📨 Webhook recibido - Topic: {}, ID: {}", topic, id);
        
        try {
            if ("payment".equals(topic)) {
                Long paymentId = Long.parseLong(id);
                actualizarPagoDesdeMP(paymentId);
            } else if ("merchant_order".equals(topic)) {
                logger.info("ℹ️ Notificación de merchant_order recibida, ignorando por ahora");
                // Por ahora solo procesamos payments
            } else {
                logger.warn("⚠️ Topic desconocido: {}", topic);
            }
        } catch (Exception e) {
            logger.error("❌ Error procesando webhook: {}", e.getMessage(), e);
            throw new RuntimeException("Error procesando notificación webhook: " + e.getMessage());
        }
    }
    
    /**
     * Consulta el payment en Mercado Pago y actualiza el estado en nuestra BD
     */
    @Transactional
    public void actualizarPagoDesdeMP(Long paymentId) {
        try {
            logger.info("🔍 Consultando payment {} en Mercado Pago", paymentId);
            
            // 1. Consultar el payment en MP
            PaymentClient paymentClient = new PaymentClient();
            Payment payment = paymentClient.get(paymentId);
            
            logger.info("📊 Payment de MP recibido:");
            logger.info("   ID: {}", payment.getId());
            logger.info("   Status: {}", payment.getStatus());
            logger.info("   External Reference: {}", payment.getExternalReference());
            logger.info("   Order ID: {}", payment.getOrder() != null ? payment.getOrder().getId() : "null");
            
            // 2. Buscar el pago en nuestra BD CON LOCK PESIMISTA (evita race conditions)
            // Primero intentamos por paymentId con lock
            Pago pago = pagoRepository.findByPaymentIdWithLock(paymentId).orElse(null);
            
            if (pago == null) {
                logger.info("🔍 Pago no encontrado por payment_id, buscando por external_reference...");
                
                // Buscar por external_reference CON LOCK (puede haber múltiples, obtenemos el más reciente sin payment_id)
                String externalReference = payment.getExternalReference();
                if (externalReference != null && !externalReference.isEmpty()) {
                    List<Pago> pagos = pagoRepository.findByExternalReferenceWithLock(externalReference);
                    
                    if (!pagos.isEmpty()) {
                        // Buscar el primer pago que NO tenga payment_id (es decir, que aún no fue actualizado)
                        pago = pagos.stream()
                            .filter(p -> p.getPaymentId() == null)
                            .findFirst()
                            .orElse(pagos.get(0)); // Si todos tienen payment_id, usar el más reciente
                        
                        logger.info("🔍 Encontrados {} pagos con external_reference '{}', usando el ID: {}", 
                            pagos.size(), externalReference, pago.getId());
                    } else {
                        logger.info("🔍 No se encontraron pagos con external_reference '{}'", externalReference);
                    }
                }
            }
            
            if (pago == null) {
                logger.error("❌ No se encontró el pago en BD para payment_id: {} y external_reference: {}", 
                    paymentId, payment.getExternalReference());
                return;
            }
            
            logger.info("✅ Pago encontrado en BD: {} (preference_id: {})", pago.getId(), pago.getPreferenceId());
            
            // ✅ VERIFICACIÓN DE IDEMPOTENCIA
            // Si el pago ya fue procesado (tiene paymentId y está aprobado), no procesarlo de nuevo
            if (pago.getPaymentId() != null && pago.getPaymentId().equals(payment.getId())) {
                if (pago.getEstado() == Pago.EstadoPago.APPROVED) {
                    logger.info("⚠️ Pago {} ya fue procesado anteriormente (Estado: APPROVED). Ignorando webhook duplicado.", pago.getId());
                    return;
                }
                logger.info("ℹ️ Pago {} ya tiene payment_id pero no está aprobado. Actualizando estado...", pago.getId());
            }
            
            // 3. Actualizar información del pago
            pago.setPaymentId(payment.getId());
            pago.setEstado(mapearEstadoMP(payment.getStatus()));
            pago.setStatusDetail(payment.getStatusDetail());
            pago.setMetodoPago(payment.getPaymentMethodId());
            pago.setTipoPago(payment.getPaymentTypeId());
            
            if (payment.getTransactionDetails() != null) {
                pago.setNumeroTransaccion(payment.getTransactionDetails().getExternalResourceUrl());
            }
            
            if (payment.getDateApproved() != null) {
                pago.setFechaAprobacion(
                    payment.getDateApproved().toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDateTime()
                );
            }
            
            pagoRepository.save(pago);
            
            logger.info("✅ Pago actualizado en BD: {} - Estado: {}", pago.getId(), pago.getEstado());
            
            // 4. Si el pago fue aprobado, crear las reservas
            if (pago.getEstado() == Pago.EstadoPago.APPROVED) {
                procesarPagoAprobado(pago);
            }
            
        } catch (MPException | MPApiException e) {
            logger.error("❌ Error consultando payment en MP: {}", e.getMessage(), e);
            throw new RuntimeException("Error al consultar estado del pago: " + e.getMessage());
        }
    }
    
    /**
     * Crea las reservas cuando un pago es aprobado
     */
    @Transactional
    public void procesarPagoAprobado(Pago pago) {
        logger.info("✅ Procesando pago aprobado: {}", pago.getId());
        
        try {
            // ✅ VERIFICACIÓN DE IDEMPOTENCIA: Ver si ya existen reservas para este pago
            List<Reserva> reservasExistentes = reservaRepository.findByPago(pago);
            if (!reservasExistentes.isEmpty()) {
                logger.info("⚠️ Pago {} ya tiene {} reservas creadas. Ignorando procesamiento duplicado.", 
                    pago.getId(), reservasExistentes.size());
                return;
            }
            
            // Determinar si es pago del carrito o pago directo
            // Un pago es del carrito si el external_reference contiene comas (múltiples salidas)
            // o si el carrito tiene items activos
            String externalRef = pago.getExternalReference();
            boolean esMultiplesSalidas = externalRef != null && externalRef.contains(",");
            
            List<Reserva> reservasCreadas = new ArrayList<>();
            
            // Si el external_reference tiene múltiples IDs, es definitivamente del carrito
            if (esMultiplesSalidas) {
                logger.info("🛒 Detectado pago del carrito (múltiples salidas en external_reference: {})", externalRef);
                Carrito carrito = carritoRepository.findByUsuarioId(pago.getUsuario().getId())
                        .orElse(null);
                if (carrito != null) {
                    reservasCreadas = procesarPagoDesdeCarrito(pago, carrito);
                } else {
                    logger.error("❌ No se encontró el carrito para pago múltiple. Usuario: {}", pago.getUsuario().getId());
                }
            } else {
                // External reference con un solo ID - verificar si hay items en carrito
                Carrito carrito = carritoRepository.findByUsuarioId(pago.getUsuario().getId())
                        .orElse(null);
                
                if (carrito != null) {
                    List<CarritoItem> items = carritoItemRepository.findByCarritoIdWithDetails(carrito.getId());
                    
                    if (!items.isEmpty()) {
                        // Hay items en el carrito - es pago del carrito
                        logger.info("🛒 Detectado pago del carrito ({} items encontrados)", items.size());
                        reservasCreadas = procesarPagoDesdeCarrito(pago, carrito);
                    } else {
                        // Carrito vacío - es pago directo
                        logger.info("🎯 Detectado pago directo (carrito vacío, external_reference: {})", externalRef);
                        reservasCreadas = procesarPagoDirecto(pago);
                    }
                } else {
                    // No hay carrito - definitivamente es pago directo
                    logger.info("🎯 Detectado pago directo (sin carrito, external_reference: {})", externalRef);
                    reservasCreadas = procesarPagoDirecto(pago);
                }
            }
            
            logger.info("✅ Procesamiento de pago aprobado completado. {} reservas creadas", 
                    reservasCreadas.size());
            
        } catch (Exception e) {
            logger.error("❌ Error procesando pago aprobado: {}", e.getMessage(), e);
            // No lanzamos excepción para no afectar la transacción del webhook
        }
    }
    
    /**
     * Procesa un pago que viene del carrito
     */
    private List<Reserva> procesarPagoDesdeCarrito(Pago pago, Carrito carrito) {
        List<Reserva> reservasCreadas = new ArrayList<>();
        logger.info("🛒 Iniciando procesamiento de pago desde carrito - Pago ID: {}, Usuario: {}", 
            pago.getId(), pago.getUsuario().getUsername());
        
        try {
            // Obtener items del carrito
            List<CarritoItem> items = carritoItemRepository.findByCarritoIdWithDetails(carrito.getId());
            
            if (items.isEmpty()) {
                logger.warn("⚠️ No se encontraron items en el carrito para el usuario {}", pago.getUsuario().getId());
                return reservasCreadas;
            }
            
            logger.info("📦 Se encontraron {} items en el carrito", items.size());
            
            // Crear una reserva por cada item del carrito
            for (int i = 0; i < items.size(); i++) {
                CarritoItem item = items.get(i);
                logger.info("🎫 Procesando item {}/{} - Salida: {}, Cantidad: {}", 
                    i + 1, items.size(), item.getSalida().getId(), item.getCantidad());
                
                try {
                    ReservaRequest reservaRequest = new ReservaRequest();
                    reservaRequest.setSalidaId(item.getSalida().getId());
                    reservaRequest.setCantidadPersonas(item.getCantidad());
                    reservaRequest.setPrecioTotal(item.getSubtotal());
                    reservaRequest.setObservaciones("Pago procesado del carrito - Pago ID: " + pago.getId());
                    
                    logger.info("📤 Llamando a reservaService.crearReserva()...");
                    
                    ReservaResponse reservaResponse = reservaService.crearReserva(
                            reservaRequest, 
                            pago.getUsuario().getId()
                    );
                    
                    logger.info("📥 Respuesta de crearReserva: ID={}, Mensaje={}", 
                        reservaResponse.getId(), reservaResponse.getMensaje());
                    
                    if (reservaResponse.getId() != null) {
                        Reserva reserva = reservaRepository.findById(reservaResponse.getId())
                                .orElseThrow(() -> new RuntimeException("Reserva no encontrada después de crearla: " + reservaResponse.getId()));
                        
                        reserva.setPago(pago);
                        reserva.setEstado(Reserva.EstadoReserva.CONFIRMADA);
                        reserva = reservaRepository.save(reserva);
                        reservasCreadas.add(reserva);
                        
                        logger.info("✅ Reserva {} creada y confirmada para salida: {}", 
                            reserva.getId(), item.getSalida().getId());
                    } else {
                        logger.error("❌ No se pudo crear la reserva para salida {}: {}", 
                            item.getSalida().getId(), reservaResponse.getMensaje());
                    }
                    
                } catch (Exception e) {
                    logger.error("❌ Excepción al crear reserva para salida {}: {}", 
                            item.getSalida().getId(), e.getMessage(), e);
                }
            }
            
            logger.info("📊 Resumen: Se crearon {} de {} reservas", reservasCreadas.size(), items.size());
            
            // Vaciar el carrito si se crearon reservas
            if (!reservasCreadas.isEmpty()) {
                try {
                    carritoItemRepository.deleteByCarritoId(carrito.getId());
                    logger.info("🛒 Carrito vaciado para usuario: {}", pago.getUsuario().getUsername());
                } catch (Exception e) {
                    logger.warn("⚠️ No se pudo vaciar el carrito (posiblemente ya fue vaciado): {}", e.getMessage());
                }
            } else {
                logger.error("❌ NO SE CREÓ NINGUNA RESERVA. El carrito NO será vaciado.");
            }
            
        } catch (Exception e) {
            logger.error("❌ Error crítico procesando pago del carrito: {}", e.getMessage(), e);
        }
        
        return reservasCreadas;
    }
    
    /**
     * Procesa un pago directo (sin carrito) usando el external_reference como salidaId
     */
    private List<Reserva> procesarPagoDirecto(Pago pago) {
        List<Reserva> reservasCreadas = new ArrayList<>();
        logger.info("🎯 Iniciando procesamiento de pago directo - Pago ID: {}, Usuario: {}", 
            pago.getId(), pago.getUsuario().getUsername());
        
        try {
            // El external_reference contiene el salidaId para pagos directos
            String externalReference = pago.getExternalReference();
            
            if (externalReference == null || externalReference.isEmpty()) {
                logger.error("❌ No se encontró external_reference en el pago {}", pago.getId());
                return reservasCreadas;
            }
            
            logger.info("🔍 External reference: {}", externalReference);
            
            Long salidaId = Long.parseLong(externalReference);
            logger.info("📌 Creando reserva directa para salida ID: {}", salidaId);
            
            // Verificar que la salida existe
            Salida salida = salidaRepository.findById(salidaId)
                    .orElseThrow(() -> new RuntimeException("Salida no encontrada: " + salidaId));
            
            logger.info("✓ Salida encontrada: {} - Experiencia: {}", 
                salida.getId(), salida.getExperiencia().getTitulo());
            
            // Calcular cantidad de personas desde el monto total y precio de la experiencia
            BigDecimal precioUnitario = salida.getExperiencia().getPrecio();
            int cantidadPersonas = pago.getMontoTotal().divide(precioUnitario, 0, RoundingMode.HALF_UP).intValue();
            
            logger.info("💰 Calculando cantidad: {} / {} = {} personas", 
                pago.getMontoTotal(), precioUnitario, cantidadPersonas);
            
            // Extraer observaciones de datos_adicionales si existen
            String observaciones = "Pago directo procesado - Pago ID: " + pago.getId();
            if (pago.getDatosAdicionales() != null && pago.getDatosAdicionales().contains("observaciones")) {
                // Simple parsing si tiene observaciones en el JSON
                observaciones = pago.getDatosAdicionales() + " - Pago ID: " + pago.getId();
            }
            
            // Crear la reserva
            ReservaRequest reservaRequest = new ReservaRequest();
            reservaRequest.setSalidaId(salidaId);
            reservaRequest.setCantidadPersonas(cantidadPersonas);
            reservaRequest.setPrecioTotal(pago.getMontoTotal());
            reservaRequest.setObservaciones(observaciones);
            
            logger.info("📤 Llamando a reservaService.crearReserva()...");
            
            ReservaResponse reservaResponse = reservaService.crearReserva(
                    reservaRequest, 
                    pago.getUsuario().getId()
            );
            
            logger.info("📥 Respuesta de crearReserva: ID={}, Mensaje={}", 
                reservaResponse.getId(), reservaResponse.getMensaje());
            
            if (reservaResponse.getId() != null) {
                Reserva reserva = reservaRepository.findById(reservaResponse.getId())
                        .orElseThrow(() -> new RuntimeException("Reserva no encontrada después de crearla: " + reservaResponse.getId()));
                
                reserva.setPago(pago);
                reserva.setEstado(Reserva.EstadoReserva.CONFIRMADA);
                reserva = reservaRepository.save(reserva);
                reservasCreadas.add(reserva);
                
                logger.info("✅ Reserva directa {} creada y confirmada para salida: {} ({} personas)", 
                    reserva.getId(), salidaId, cantidadPersonas);
            } else {
                logger.error("❌ No se pudo crear la reserva directa para salida {}: {}", 
                    salidaId, reservaResponse.getMensaje());
            }
            
        } catch (NumberFormatException e) {
            logger.error("❌ Error parseando external_reference '{}' como salidaId", pago.getExternalReference(), e);
        } catch (Exception e) {
            logger.error("❌ Excepción al crear reserva directa: {}", e.getMessage(), e);
        }
        
        logger.info("📊 Resumen pago directo: {} reserva(s) creada(s)", reservasCreadas.size());
        return reservasCreadas;
    }
    
    /**
     * Obtiene los items del carrito desde el external_reference del pago
     */
    private List<CarritoItem> obtenerItemsDesdeExternalReference(Pago pago) {
        // TODO: Implementar lógica para reconstruir items desde external_reference
        // Por ahora retornamos lista vacía
        return new ArrayList<>();
    }
    
    /**
     * Mapea el estado de Mercado Pago a nuestro enum
     */
    private Pago.EstadoPago mapearEstadoMP(String estadoMP) {
        if (estadoMP == null) return Pago.EstadoPago.PENDIENTE;
        
        return switch (estadoMP.toLowerCase()) {
            case "approved" -> Pago.EstadoPago.APPROVED;
            case "pending" -> Pago.EstadoPago.PENDING;
            case "in_process" -> Pago.EstadoPago.IN_PROCESS;
            case "authorized" -> Pago.EstadoPago.AUTHORIZED;
            case "rejected" -> Pago.EstadoPago.REJECTED;
            case "cancelled" -> Pago.EstadoPago.CANCELLED;
            case "refunded" -> Pago.EstadoPago.REFUNDED;
            case "charged_back" -> Pago.EstadoPago.CHARGED_BACK;
            default -> Pago.EstadoPago.PENDIENTE;
        };
    }
    
    /**
     * Consulta el estado de un pago por ID
     */
    @Transactional(readOnly = true)
    public PaymentStatusDTO consultarEstadoPago(Long pagoId) {
        Pago pago = pagoRepository.findById(pagoId)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado"));
        
        PaymentStatusDTO dto = new PaymentStatusDTO();
        dto.setId(pago.getId());
        dto.setPaymentId(pago.getPaymentId());
        dto.setPreferenceId(pago.getPreferenceId());
        dto.setEstado(pago.getEstado().name());
        dto.setEstadoDescripcion(pago.getEstado().getDescripcion());
        dto.setMontoTotal(pago.getMontoTotal());
        dto.setMoneda(pago.getMoneda());
        dto.setMetodoPago(pago.getMetodoPago());
        dto.setTipoPago(pago.getTipoPago());
        dto.setStatusDetail(pago.getStatusDetail());
        dto.setFechaCreacion(pago.getFechaCreacion());
        dto.setFechaAprobacion(pago.getFechaAprobacion());
        dto.setEmailComprador(pago.getEmailComprador());
        
        // Obtener IDs de reservas asociadas
        List<Long> reservasIds = reservaRepository.findByPago(pago).stream()
                .map(Reserva::getId)
                .collect(Collectors.toList());
        dto.setReservasIds(reservasIds);
        
        return dto;
    }
}

