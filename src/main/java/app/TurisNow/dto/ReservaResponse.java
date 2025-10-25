package app.TurisNow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservaResponse {
    
    private Long id;
    private Long salidaId;
    private String tituloExperiencia;
    private String ciudadExperiencia;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private Integer cantidadPersonas;
    private BigDecimal precioTotal;
    private String estado;
    private LocalDateTime fechaReserva;
    private LocalDateTime fechaConfirmacion;
    private String observaciones;
    private String mensaje;
    
    // Constructor para respuestas de error
    public ReservaResponse(String mensaje) {
        this.mensaje = mensaje;
    }
}
