package app.TurisNow.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reserva {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @NotNull(message = "El usuario es obligatorio")
    private Usuario usuario;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salida_id", nullable = false)
    @NotNull(message = "La salida es obligatoria")
    private Salida salida;
    
    @Column(name = "cantidad_personas", nullable = false)
    @Positive(message = "La cantidad de personas debe ser mayor a 0")
    private Integer cantidadPersonas;
    
    @Column(name = "precio_total", nullable = false, precision = 10, scale = 2)
    @NotNull(message = "El precio total es obligatorio")
    private BigDecimal precioTotal;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoReserva estado = EstadoReserva.PENDIENTE;
    
    @Column(name = "fecha_reserva", nullable = false)
    private LocalDateTime fechaReserva;
    
    @Column(name = "fecha_confirmacion")
    private LocalDateTime fechaConfirmacion;
    
    @Column(name = "fecha_cancelacion")
    private LocalDateTime fechaCancelacion;
    
    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pago_id")
    private Pago pago; // Relación con el pago asociado
    
    @PrePersist
    protected void onCreate() {
        fechaReserva = LocalDateTime.now();
    }
    
    // Enums
    public enum EstadoReserva {
        PENDIENTE_PAGO("Pendiente de Pago"), // Reserva creada pero pago no completado
        PENDIENTE("Pendiente"), // Pago completado, pendiente de confirmación
        CONFIRMADA("Confirmada"),
        CANCELADA("Cancelada"),
        COMPLETADA("Completada");
        
        private final String descripcion;
        
        EstadoReserva(String descripcion) {
            this.descripcion = descripcion;
        }
        
        public String getDescripcion() {
            return descripcion;
        }
    }
}
