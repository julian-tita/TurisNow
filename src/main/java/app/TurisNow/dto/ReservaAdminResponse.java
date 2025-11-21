package app.TurisNow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO de respuesta con información de una reserva para admin.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservaAdminResponse {
    private Long id;
    private Long usuarioId;
    private String usuarioNombre;
    private String usuarioEmail;
    private Long salidaId;
    private String experienciaTitulo;
    private LocalDateTime fechaSalida;
    private Integer cantidadPersonas;
    private BigDecimal precioTotal;
    private String estado;
    private LocalDateTime fechaReserva;
    private LocalDateTime fechaConfirmacion;
    private LocalDateTime fechaCancelacion;
    private String observaciones;
    private String tokenQr;
    private Boolean checkinRealizado;
    private LocalDateTime fechaCheckin;
    private PagoInfoDTO pago;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PagoInfoDTO {
        private Long id;
        private String preferenceId;
        private Long paymentId;
        private String estado;
        private String metodoPago;
        private LocalDateTime fechaCreacion;
        private LocalDateTime fechaAprobacion;
    }
}
