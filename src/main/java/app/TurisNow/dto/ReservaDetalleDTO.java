package app.TurisNow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservaDetalleDTO {
    
    private Long id;
    private Long salidaId;
    private Long experienciaId;
    private String tituloExperiencia;
    private String descripcionExperiencia;
    private String imagenUrlExperiencia;
    private String categoriaExperiencia;
    private String monedaExperiencia;
    private BigDecimal precioExperiencia;
    
    // Ubicación de la experiencia
    private UbicacionDTO ubicacion;
    
    // Detalles de la salida
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private Integer capacidadTotal;
    private Integer capacidadDisponible;
    
    // Detalles de la reserva
    private Integer cantidadPersonas;
    private BigDecimal precioTotal;
    private String estado;
    private LocalDateTime fechaReserva;
    private LocalDateTime fechaConfirmacion;
    private LocalDateTime fechaCancelacion;
    private String observaciones;
    
    // QR Code y Check-in
    private String tokenQr;
    private Boolean checkinRealizado;
    private LocalDateTime fechaCheckin;
    private String checkinPor;
    
    // Información del usuario
    private String nombreUsuario;
    private String emailUsuario;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UbicacionDTO {
        private String ciudad;
        private String region;
        private String pais;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EstadisticasDTO {
        private Long totalReservas;
        private Long reservasPendientes;
        private Long reservasConfirmadas;
        private Long reservasCanceladas;
        private Long reservasCompletadas;
    }
}
