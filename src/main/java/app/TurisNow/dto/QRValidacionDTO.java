package app.TurisNow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO para respuesta de validación de QR
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QRValidacionDTO {
    
    // Estado de la validación
    private Boolean valido;
    private String mensaje;
    
    // Información de la reserva
    private Long reservaId;
    private String tokenQr;
    private String estadoReserva;
    
    // Información del cliente
    private String nombreCliente;
    private String emailCliente;
    private String telefonoCliente;
    
    // Información de la experiencia
    private String tituloExperiencia;
    private String categoriaExperiencia;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private String ubicacion;
    
    // Detalles de la reserva
    private Integer cantidadPersonas;
    private BigDecimal precioTotal;
    private String moneda;
    private LocalDateTime fechaReserva;
    
    // Check-in
    private Boolean checkinRealizado;
    private LocalDateTime fechaCheckin;
    private String checkinPor;
    
    // Alertas
    private Boolean alertaCapacidad; // Si la cantidad es muy alta
    private Boolean alertaFecha; // Si la fecha es diferente
}

