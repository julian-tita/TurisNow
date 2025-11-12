package app.TurisNow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutResponse {
    
    private boolean success;
    private String message;
    
    // Datos de Mercado Pago
    private Long pagoId; // ID de nuestro registro de pago
    private String preferenceId; // ID de la preferencia de MP
    private String initPoint; // URL para redirigir al usuario a MP
    private BigDecimal montoTotal;
    
    // Datos de las reservas (cuando el pago se complete)
    private List<ReservaCreada> reservas = new ArrayList<>();
    private List<ErrorItem> errores = new ArrayList<>();
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReservaCreada {
        private Long id;
        private Long salidaId;
        private Integer cantidadPersonas;
        private BigDecimal precioTotal;
        private String estado;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorItem {
        private Long salidaId;
        private String titulo;
        private String mensaje;
    }
}

