package app.TurisNow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para devolver el estado de un pago
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatusDTO {
    
    private Long id;
    private Long paymentId;
    private String preferenceId;
    private String estado;
    private String estadoDescripcion;
    private BigDecimal montoTotal;
    private String moneda;
    private String metodoPago;
    private String tipoPago;
    private String statusDetail;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaAprobacion;
    private String emailComprador;
    private List<Long> reservasIds; // IDs de las reservas asociadas
}


