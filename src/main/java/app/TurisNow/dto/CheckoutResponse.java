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

