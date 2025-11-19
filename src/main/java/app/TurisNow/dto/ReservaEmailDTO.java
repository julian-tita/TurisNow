package app.TurisNow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO con información para enviar email de confirmación de reserva
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservaEmailDTO {
    
    // Información del usuario
    private String nombreUsuario;
    private String emailUsuario;
    
    // Información de la reserva
    private Long reservaId;
    private LocalDateTime fechaReserva;
    private Integer cantidadPersonas;
    private BigDecimal precioTotal;
    private String moneda;
    
    // Información de la experiencia
    private String tituloExperiencia;
    private String descripcionExperiencia;
    private String imagenUrlExperiencia;
    private String categoriaExperiencia;
    
    // Información de la salida
    private Long salidaId;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    
    // Información de ubicación
    private String ciudad;
    private String region;
    private String pais;
    
    // Información del pago
    private Long pagoId;
    private Long paymentId;
    private String metodoPago;
    private LocalDateTime fechaPago;
    
    // Observaciones
    private String observaciones;
    
    // QR Code
    private String tokenQr;
    private String qrCodeBase64; // Imagen QR en formato Base64
}

