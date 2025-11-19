package app.TurisNow.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Servicio para configurar webhooks en Mercado Pago
 * Permite crear, actualizar y consultar webhooks programáticamente
 */
@Service
public class MercadoPagoWebhookConfigService {
    
    private static final Logger logger = LoggerFactory.getLogger(MercadoPagoWebhookConfigService.class);
    private static final String MP_API_BASE_URL = "https://api.mercadopago.com/v1";
    
    @Value("${mercadopago.access.token}")
    private String accessToken;
    
    @Value("${mercadopago.webhook.url}")
    private String webhookUrl;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Configura un webhook para la aplicación en Mercado Pago
     * 
     * @param topic Tipo de evento: "payment", "merchant_order", etc.
     * @return ID del webhook configurado
     */
    public String configurarWebhook(String topic) {
        try {
            logger.info("🔧 Configurando webhook en MP - Topic: {}, URL: {}", topic, webhookUrl);
            
            // Endpoint para configurar webhooks
            URL url = new URL(MP_API_BASE_URL + "/webhooks");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", "Bearer " + accessToken);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            
            // Crear payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("url", webhookUrl);
            
            List<Map<String, String>> events = new ArrayList<>();
            Map<String, String> event = new HashMap<>();
            event.put("topic", topic);
            events.add(event);
            payload.put("events", events);
            
            // Enviar request
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = objectMapper.writeValueAsBytes(payload);
                os.write(input, 0, input.length);
            }
            
            // Leer respuesta
            int responseCode = conn.getResponseCode();
            
            if (responseCode == 201 || responseCode == 200) {
                Scanner scanner = new Scanner(conn.getInputStream(), StandardCharsets.UTF_8);
                String response = scanner.useDelimiter("\\A").next();
                scanner.close();
                
                JsonNode jsonResponse = objectMapper.readTree(response);
                String webhookId = jsonResponse.get("id").asText();
                
                logger.info("✅ Webhook configurado exitosamente - ID: {}", webhookId);
                return webhookId;
                
            } else {
                Scanner scanner = new Scanner(conn.getErrorStream(), StandardCharsets.UTF_8);
                String errorResponse = scanner.useDelimiter("\\A").next();
                scanner.close();
                
                logger.error("❌ Error configurando webhook - Code: {}, Response: {}", 
                        responseCode, errorResponse);
                throw new RuntimeException("Error configurando webhook: " + errorResponse);
            }
            
        } catch (Exception e) {
            logger.error("❌ Error configurando webhook en MP", e);
            throw new RuntimeException("Error configurando webhook: " + e.getMessage());
        }
    }
    
    /**
     * Lista todos los webhooks configurados
     */
    public List<Map<String, Object>> listarWebhooks() {
        try {
            logger.info("📋 Listando webhooks configurados en MP");
            
            URL url = new URL(MP_API_BASE_URL + "/webhooks");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Authorization", "Bearer " + accessToken);
            
            int responseCode = conn.getResponseCode();
            
            if (responseCode == 200) {
                Scanner scanner = new Scanner(conn.getInputStream(), StandardCharsets.UTF_8);
                String response = scanner.useDelimiter("\\A").next();
                scanner.close();
                
                // Parsear respuesta como lista
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> webhooks = objectMapper.readValue(
                        response, List.class);
                
                logger.info("✅ Se encontraron {} webhooks configurados", webhooks.size());
                return webhooks;
                
            } else {
                logger.warn("⚠️ No se pudieron listar webhooks - Code: {}", responseCode);
                return new ArrayList<>();
            }
            
        } catch (Exception e) {
            logger.error("❌ Error listando webhooks", e);
            return new ArrayList<>();
        }
    }
    
    /**
     * Elimina un webhook por su ID
     */
    public boolean eliminarWebhook(String webhookId) {
        try {
            logger.info("🗑️ Eliminando webhook - ID: {}", webhookId);
            
            URL url = new URL(MP_API_BASE_URL + "/webhooks/" + webhookId);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            
            conn.setRequestMethod("DELETE");
            conn.setRequestProperty("Authorization", "Bearer " + accessToken);
            
            int responseCode = conn.getResponseCode();
            
            if (responseCode == 200 || responseCode == 204) {
                logger.info("✅ Webhook eliminado exitosamente - ID: {}", webhookId);
                return true;
            } else {
                logger.warn("⚠️ No se pudo eliminar webhook - ID: {}, Code: {}", 
                        webhookId, responseCode);
                return false;
            }
            
        } catch (Exception e) {
            logger.error("❌ Error eliminando webhook", e);
            return false;
        }
    }
    
    /**
     * Actualiza la URL de un webhook existente
     */
    public boolean actualizarWebhook(String webhookId, String nuevaUrl) {
        try {
            logger.info("🔄 Actualizando webhook - ID: {}, Nueva URL: {}", webhookId, nuevaUrl);
            
            URL url = new URL(MP_API_BASE_URL + "/webhooks/" + webhookId);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            
            conn.setRequestMethod("PUT");
            conn.setRequestProperty("Authorization", "Bearer " + accessToken);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            
            // Crear payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("url", nuevaUrl);
            
            // Enviar request
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = objectMapper.writeValueAsBytes(payload);
                os.write(input, 0, input.length);
            }
            
            int responseCode = conn.getResponseCode();
            
            if (responseCode == 200) {
                logger.info("✅ Webhook actualizado exitosamente - ID: {}", webhookId);
                return true;
            } else {
                logger.warn("⚠️ No se pudo actualizar webhook - Code: {}", responseCode);
                return false;
            }
            
        } catch (Exception e) {
            logger.error("❌ Error actualizando webhook", e);
            return false;
        }
    }
    
    /**
     * Obtiene el secret para validar firmas HMAC
     * Nota: El secret se genera automáticamente al crear un webhook
     */
    public String obtenerWebhookSecret(String webhookId) {
        try {
            logger.info("🔐 Obteniendo secret del webhook - ID: {}", webhookId);
            
            URL url = new URL(MP_API_BASE_URL + "/webhooks/" + webhookId);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Authorization", "Bearer " + accessToken);
            
            int responseCode = conn.getResponseCode();
            
            if (responseCode == 200) {
                Scanner scanner = new Scanner(conn.getInputStream(), StandardCharsets.UTF_8);
                String response = scanner.useDelimiter("\\A").next();
                scanner.close();
                
                JsonNode jsonResponse = objectMapper.readTree(response);
                
                if (jsonResponse.has("secret")) {
                    String secret = jsonResponse.get("secret").asText();
                    logger.info("✅ Secret obtenido exitosamente");
                    return secret;
                } else {
                    logger.warn("⚠️ Webhook no tiene secret configurado");
                    return null;
                }
            } else {
                logger.warn("⚠️ No se pudo obtener webhook - Code: {}", responseCode);
                return null;
            }
            
        } catch (Exception e) {
            logger.error("❌ Error obteniendo secret del webhook", e);
            return null;
        }
    }
}



