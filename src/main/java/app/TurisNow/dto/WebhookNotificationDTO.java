package app.TurisNow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para recibir notificaciones webhook de Mercado Pago
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WebhookNotificationDTO {
    
    private String action; // payment.updated, payment.created, etc.
    private String apiVersion; // v1
    private WebhookData data;
    private String dateCreated;
    private Long id;
    private Boolean liveMode;
    private String type; // payment, merchant_order, etc.
    private Long userId;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WebhookData {
        private String id; // ID del payment o merchant_order
    }
}


