package app.TurisNow.controller;

import app.TurisNow.dto.CheckoutResponse;
import app.TurisNow.dto.PaymentStatusDTO;
import app.TurisNow.model.WebhookLog;
import app.TurisNow.service.PagoService;
import app.TurisNow.service.WebhookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@Tag(name = "Pagos", description = "API de Pagos con Mercado Pago")
@CrossOrigin(origins = "*")
public class PagoController {
    
    private static final Logger logger = LoggerFactory.getLogger(PagoController.class);
    
    @Autowired
    private PagoService pagoService;
    
    @Autowired
    private WebhookService webhookService;
    
    /**
     * Crea una preferencia de pago con los items del carrito
     * Endpoint para el frontend: POST /api/pagos/checkout
     */
    @PostMapping("/api/pagos/checkout")
    @Operation(
        summary = "Crear preferencia de pago",
        description = "Crea una preferencia de pago en Mercado Pago con los items del carrito del usuario",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    public ResponseEntity<?> crearPreferenciaPago() {
        try {
            String username = obtenerUsernameAutenticado();
            logger.info("📝 Usuario {} iniciando checkout", username);
            
            CheckoutResponse response = pagoService.crearPreferenciaPago(username);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            logger.error("❌ Error en checkout: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                        "success", false,
                        "message", e.getMessage()
                    ));
        } catch (Exception e) {
            logger.error("❌ Error inesperado en checkout: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "success", false,
                        "message", "Error interno del servidor"
                    ));
        }
    }
    
    /**
     * Crea una preferencia de pago para una reserva directa (sin carrito)
     * Endpoint para el frontend: POST /api/pagos/checkout-directo
     */
    @PostMapping("/api/pagos/checkout-directo")
    @Operation(
        summary = "Crear preferencia de pago directo",
        description = "Crea una preferencia de pago en Mercado Pago para una reserva directa (sin usar carrito)",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    public ResponseEntity<?> crearPreferenciaPagoDirecto(@RequestBody Map<String, Object> requestData) {
        try {
            String username = obtenerUsernameAutenticado();
            logger.info("📝 Usuario {} iniciando checkout directo", username);
            
            // Extraer parámetros
            Long salidaId = Long.valueOf(requestData.get("salidaId").toString());
            Integer cantidad = Integer.valueOf(requestData.get("cantidad").toString());
            String observaciones = requestData.get("observaciones") != null 
                ? requestData.get("observaciones").toString() 
                : null;
            
            CheckoutResponse response = pagoService.crearPreferenciaPagoDirecto(
                username, 
                salidaId, 
                cantidad, 
                observaciones
            );
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            logger.error("❌ Error en checkout directo: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                        "success", false,
                        "message", e.getMessage()
                    ));
        } catch (Exception e) {
            logger.error("❌ Error inesperado en checkout directo: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "success", false,
                        "message", "Error interno del servidor"
                    ));
        }
    }
    
    /**
     * Webhook para recibir notificaciones de Mercado Pago
     * Este endpoint es llamado por Mercado Pago cuando cambia el estado de un pago
     * 
     * IMPORTANTE: Este endpoint NO requiere autenticación (es llamado por MP)
     * 
     * Incluye:
     * - Registro en base de datos para auditoría
     * - Manejo de duplicados
     * - Reintento automático en caso de error
     */
    @PostMapping("/api/webhooks/mercadopago")
    @Operation(
        summary = "Webhook de Mercado Pago",
        description = "Recibe notificaciones de cambios de estado de pagos desde Mercado Pago. " +
                     "Incluye registro de auditoría y manejo de duplicados."
    )
    public ResponseEntity<?> webhookMercadoPago(
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String id,
            @RequestBody(required = false) Map<String, Object> body,
            HttpServletRequest request
    ) {
        try {
            logger.info("📨 Webhook recibido - Topic: {}, ID: {}, IP: {}", 
                    topic, id, request.getRemoteAddr());
            
            String finalTopic = topic;
            String finalId = id;
            
            // Extraer topic e id del body si no vienen como query params
            if ((topic == null || id == null) && body != null) {
                if (body.containsKey("type")) {
                    finalTopic = (String) body.get("type");
                }
                if (body.containsKey("data")) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> data = (Map<String, Object>) body.get("data");
                    finalId = data.get("id").toString();
                }
            }
            
            if (finalTopic == null || finalId == null) {
                logger.warn("⚠️ Webhook recibido sin topic o id válidos");
                return ResponseEntity.ok(Map.of(
                    "status", "ignored",
                    "message", "Missing topic or id"
                ));
            }
            
            // Procesar webhook usando el servicio mejorado
            WebhookLog webhookLog = webhookService.procesarWebhook(finalTopic, finalId, body, request);
            
            // Preparar respuesta según el resultado
            Map<String, Object> response = new HashMap<>();
            response.put("status", "ok");
            response.put("webhookLogId", webhookLog.getId());
            response.put("estado", webhookLog.getEstado().name());
            
            if (webhookLog.getEstado() == WebhookLog.EstadoProcesamiento.ERROR) {
                response.put("error", webhookLog.getMensajeError());
            }
            
            if (webhookLog.getEstado() == WebhookLog.EstadoProcesamiento.DUPLICADO) {
                response.put("message", "Webhook duplicado, ignorado");
            }
            
            // Siempre retornar 200 para que MP no reintente
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Error crítico procesando webhook: {}", e.getMessage(), e);
            // Retornamos 200 para que MP no reintente inmediatamente
            // El reintento lo manejamos nosotros de forma controlada
            return ResponseEntity.ok(Map.of(
                "status", "error", 
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Consulta el estado de un pago
     */
    @GetMapping("/api/pagos/{id}/status")
    @Operation(
        summary = "Consultar estado de pago",
        description = "Obtiene el estado actual de un pago",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    public ResponseEntity<?> consultarEstadoPago(@PathVariable Long id) {
        try {
            String username = obtenerUsernameAutenticado();
            logger.info("🔍 Usuario {} consultando estado del pago {}", username, id);
            
            PaymentStatusDTO status = pagoService.consultarEstadoPago(id);
            
            return ResponseEntity.ok(status);
            
        } catch (RuntimeException e) {
            logger.error("❌ Error consultando estado de pago: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Error inesperado: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error interno del servidor"));
        }
    }
    
    /**
     * Endpoint administrativo para obtener estadísticas de webhooks
     */
    @GetMapping("/api/admin/webhooks/stats")
    @Operation(
        summary = "Estadísticas de webhooks",
        description = "Obtiene estadísticas de webhooks recibidos y procesados",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    public ResponseEntity<?> obtenerEstadisticasWebhooks() {
        try {
            String username = obtenerUsernameAutenticado();
            logger.info("📊 Usuario {} consultando estadísticas de webhooks", username);
            
            Map<String, Object> stats = webhookService.obtenerEstadisticas();
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            logger.error("❌ Error obteniendo estadísticas: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error obteniendo estadísticas"));
        }
    }
    
    /**
     * Endpoint administrativo para reintentar webhooks con error
     */
    @PostMapping("/api/admin/webhooks/retry")
    @Operation(
        summary = "Reintentar webhooks con error",
        description = "Reintenta procesar webhooks que fallaron anteriormente",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    public ResponseEntity<?> reintentarWebhooks() {
        try {
            String username = obtenerUsernameAutenticado();
            logger.info("🔄 Usuario {} solicitando reintento de webhooks", username);
            
            int exitosos = webhookService.reintentarWebhooksConError();
            
            return ResponseEntity.ok(Map.of(
                "message", "Reintentos completados",
                "exitosos", exitosos
            ));
            
        } catch (Exception e) {
            logger.error("❌ Error reintentando webhooks: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error reintentando webhooks"));
        }
    }
    
    /**
     * Obtiene el username del usuario autenticado
     */
    private String obtenerUsernameAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Usuario no autenticado");
        }
        return authentication.getName();
    }
}

