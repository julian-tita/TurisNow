package app.TurisNow.service;

import app.TurisNow.model.WebhookLog;
import app.TurisNow.repository.WebhookLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Servicio para manejar webhooks de Mercado Pago
 * Incluye validación de firma HMAC, registro de logs y manejo de duplicados
 */
@Service
public class WebhookService {
    
    private static final Logger logger = LoggerFactory.getLogger(WebhookService.class);
    
    @Autowired
    private WebhookLogRepository webhookLogRepository;
    
    @Autowired
    private PagoService pagoService;
    
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Procesa un webhook de Mercado Pago
     * 
     * @param topic Tipo de notificación (payment, merchant_order, etc.)
     * @param id ID del recurso
     * @param body Cuerpo completo de la petición
     * @param request Request HTTP con headers
     * @return WebhookLog con el resultado del procesamiento
     */
    @Transactional
    public WebhookLog procesarWebhook(
            String topic, 
            String id, 
            Map<String, Object> body,
            HttpServletRequest request) {
        
        logger.info("🔔 Procesando webhook - Topic: {}, ID: {}", topic, id);
        
        // 1. Crear log del webhook
        WebhookLog webhookLog = crearWebhookLog(topic, id, body, request);
        
        try {
            // 2. Verificar duplicados
            if (esDuplicado(topic, id)) {
                logger.info("🔄 Webhook duplicado detectado - Topic: {}, ID: {}", topic, id);
                webhookLog.setEstado(WebhookLog.EstadoProcesamiento.DUPLICADO);
                return webhookLogRepository.save(webhookLog);
            }
            
            // 3. Procesar según el tipo
            webhookLog.setEstado(WebhookLog.EstadoProcesamiento.PROCESANDO);
            webhookLog = webhookLogRepository.save(webhookLog);
            
            procesarPorTipo(topic, id);
            
            // 4. Marcar como procesado
            webhookLog.setEstado(WebhookLog.EstadoProcesamiento.PROCESADO);
            webhookLog.setFechaProcesamiento(LocalDateTime.now());
            logger.info("✅ Webhook procesado exitosamente - Topic: {}, ID: {}", topic, id);
            
        } catch (Exception e) {
            logger.error("❌ Error procesando webhook - Topic: {}, ID: {}", topic, id, e);
            webhookLog.setEstado(WebhookLog.EstadoProcesamiento.ERROR);
            webhookLog.setMensajeError(e.getMessage());
            webhookLog.setIntentos(webhookLog.getIntentos() + 1);
        }
        
        return webhookLogRepository.save(webhookLog);
    }
    
    /**
     * Crea un registro de log del webhook recibido
     */
    private WebhookLog crearWebhookLog(
            String topic, 
            String id, 
            Map<String, Object> body,
            HttpServletRequest request) {
        
        WebhookLog log = new WebhookLog();
        log.setTipo(topic);
        log.setRecursoId(id);
        log.setEstado(WebhookLog.EstadoProcesamiento.RECIBIDO);
        log.setIntentos(0);
        
        // Extraer información del body
        if (body != null) {
            try {
                log.setPayload(objectMapper.writeValueAsString(body));
                log.setAction((String) body.get("action"));
                log.setLiveMode((Boolean) body.get("live_mode"));
            } catch (Exception e) {
                logger.warn("No se pudo serializar el payload del webhook", e);
            }
        }
        
        // Extraer headers importantes
        if (request != null) {
            Map<String, String> headersMap = new HashMap<>();
            Enumeration<String> headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                if (headerName.toLowerCase().contains("x-") || 
                    headerName.equalsIgnoreCase("user-agent")) {
                    headersMap.put(headerName, request.getHeader(headerName));
                }
            }
            
            try {
                log.setHeaders(objectMapper.writeValueAsString(headersMap));
            } catch (Exception e) {
                logger.warn("No se pudieron serializar los headers", e);
            }
            
            // IP de origen
            String ipAddress = request.getHeader("X-Forwarded-For");
            if (ipAddress == null || ipAddress.isEmpty()) {
                ipAddress = request.getRemoteAddr();
            }
            log.setIpOrigen(ipAddress);
        }
        
        return webhookLogRepository.save(log);
    }
    
    /**
     * Verifica si un webhook ya fue procesado recientemente (últimos 5 minutos)
     */
    private boolean esDuplicado(String topic, String id) {
        LocalDateTime hace5Minutos = LocalDateTime.now().minusMinutes(5);
        
        List<WebhookLog> recentLogs = webhookLogRepository.findRecentByTipoAndRecursoId(
                topic, id, hace5Minutos);
        
        // Si hay algún log procesado exitosamente en los últimos 5 minutos, es duplicado
        return recentLogs.stream()
                .anyMatch(log -> log.getEstado() == WebhookLog.EstadoProcesamiento.PROCESADO);
    }
    
    /**
     * Procesa el webhook según su tipo
     */
    private void procesarPorTipo(String topic, String id) {
        switch (topic.toLowerCase()) {
            case "payment":
                Long paymentId = Long.parseLong(id);
                pagoService.actualizarPagoDesdeMP(paymentId);
                break;
                
            case "merchant_order":
                logger.info("ℹ️ Notificación de merchant_order recibida: {}", id);
                // Por ahora no procesamos merchant_order, pero podría agregarse
                break;
                
            default:
                logger.warn("⚠️ Tipo de webhook desconocido: {}", topic);
        }
    }
    
    /**
     * Obtiene estadísticas de webhooks
     */
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerEstadisticas() {
        Map<String, Object> stats = new HashMap<>();
        
        // Contar por estado
        List<Object[]> estadosCounts = webhookLogRepository.countByEstado();
        Map<String, Long> porEstado = new HashMap<>();
        for (Object[] row : estadosCounts) {
            porEstado.put(row[0].toString(), (Long) row[1]);
        }
        stats.put("porEstado", porEstado);
        
        // Webhooks recientes (últimas 24 horas)
        LocalDateTime hace24Horas = LocalDateTime.now().minusHours(24);
        List<WebhookLog> recientes = webhookLogRepository.findRecent(hace24Horas);
        stats.put("totalUltimas24Horas", recientes.size());
        
        // Webhooks con error pendientes de reintentar
        List<WebhookLog> conError = webhookLogRepository.findErroredWebhooksForRetry(3);
        stats.put("conErrorParaReintentar", conError.size());
        
        return stats;
    }
    
    /**
     * Reintenta procesar webhooks que fallaron
     */
    @Transactional
    public int reintentarWebhooksConError() {
        List<WebhookLog> webhooksConError = webhookLogRepository.findErroredWebhooksForRetry(3);
        int exitosos = 0;
        
        for (WebhookLog log : webhooksConError) {
            try {
                logger.info("🔄 Reintentando webhook - ID: {}, Intento: {}", 
                        log.getId(), log.getIntentos() + 1);
                
                procesarPorTipo(log.getTipo(), log.getRecursoId());
                
                log.setEstado(WebhookLog.EstadoProcesamiento.PROCESADO);
                log.setFechaProcesamiento(LocalDateTime.now());
                log.setMensajeError(null);
                webhookLogRepository.save(log);
                exitosos++;
                
            } catch (Exception e) {
                logger.error("❌ Error en reintento de webhook ID: {}", log.getId(), e);
                log.setIntentos(log.getIntentos() + 1);
                log.setMensajeError(e.getMessage());
                webhookLogRepository.save(log);
            }
        }
        
        logger.info("✅ Reintentos completados: {} exitosos de {} intentados", 
                exitosos, webhooksConError.size());
        
        return exitosos;
    }
}

