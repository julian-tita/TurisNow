package app.TurisNow.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pago {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "preference_id", unique = true)
    private String preferenceId; // ID de la preferencia creada en Mercado Pago
    
    @Column(name = "payment_id", unique = true)
    private Long paymentId; // ID del pago en Mercado Pago (llega por webhook)
    
    @Column(name = "merchant_order_id")
    private Long merchantOrderId; // ID de la orden del comerciante
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @NotNull(message = "El usuario es obligatorio")
    private Usuario usuario;
    
    @Column(name = "monto_total", nullable = false, precision = 10, scale = 2)
    @NotNull(message = "El monto total es obligatorio")
    private BigDecimal montoTotal;
    
    @Column(name = "moneda", length = 3)
    private String moneda = "ARS"; // ARS, USD, etc.
    
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoPago estado = EstadoPago.PENDIENTE;
    
    @Column(name = "metodo_pago", length = 50)
    private String metodoPago; // visa, master, etc.
    
    @Column(name = "tipo_pago", length = 50)
    private String tipoPago; // credit_card, debit_card, etc.
    
    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(name = "external_reference", length = 255)
    private String externalReference; // Referencia externa (ej: múltiples IDs de reserva)
    
    @Column(name = "status_detail", length = 100)
    private String statusDetail; // Detalle del estado en MP
    
    @Column(name = "init_point", columnDefinition = "TEXT")
    private String initPoint; // URL de pago de Mercado Pago
    
    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    @Column(name = "fecha_aprobacion")
    private LocalDateTime fechaAprobacion;
    
    @Column(name = "fecha_expiracion")
    private LocalDateTime fechaExpiracion;
    
    @Column(name = "email_comprador", length = 255)
    private String emailComprador;
    
    @Column(name = "numero_transaccion", length = 100)
    private String numeroTransaccion; // Número de transacción del banco
    
    @Column(name = "datos_adicionales", columnDefinition = "TEXT")
    private String datosAdicionales; // JSON con información extra
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
    
    // Enums
    public enum EstadoPago {
        PENDIENTE("Pendiente"), // Recién creada la preferencia, aún no pagó
        PENDING("Pending"), // Pago iniciado pero pendiente (MP)
        IN_PROCESS("En proceso"), // Pago en proceso
        APPROVED("Aprobado"), // Pago aprobado
        AUTHORIZED("Autorizado"), // Pago autorizado
        REJECTED("Rechazado"), // Pago rechazado
        CANCELLED("Cancelado"), // Pago cancelado
        REFUNDED("Reembolsado"), // Pago reembolsado
        CHARGED_BACK("Contracargo"), // Contracargo
        EXPIRED("Expirado"); // Preferencia expirada
        
        private final String descripcion;
        
        EstadoPago(String descripcion) {
            this.descripcion = descripcion;
        }
        
        public String getDescripcion() {
            return descripcion;
        }
    }
}


