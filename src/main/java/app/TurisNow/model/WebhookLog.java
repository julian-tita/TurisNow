package app.TurisNow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidad para registrar todas las notificaciones webhook recibidas de Mercado Pago
 * Útil para debugging, auditoría y manejo de reintentos
 */
@Entity
@Table(name = "webhook_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WebhookLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "tipo", length = 50)
    private String tipo; // payment, merchant_order, etc.
    
    @Column(name = "recurso_id", length = 255)
    private String recursoId; // ID del payment o merchant_order
    
    @Column(name = "action", length = 100)
    private String action; // payment.created, payment.updated, etc.
    
    @Column(name = "live_mode")
    private Boolean liveMode; // true = producción, false = test
    
    @Column(name = "payload", columnDefinition = "TEXT")
    private String payload; // JSON completo del webhook
    
    @Column(name = "headers", columnDefinition = "TEXT")
    private String headers; // Headers HTTP recibidos
    
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoProcesamiento estado = EstadoProcesamiento.RECIBIDO;
    
    @Column(name = "mensaje_error", columnDefinition = "TEXT")
    private String mensajeError;
    
    @Column(name = "fecha_recepcion", nullable = false)
    private LocalDateTime fechaRecepcion;
    
    @Column(name = "fecha_procesamiento")
    private LocalDateTime fechaProcesamiento;
    
    @Column(name = "intentos")
    private Integer intentos = 0;
    
    @Column(name = "ip_origen", length = 45)
    private String ipOrigen;
    
    @PrePersist
    protected void onCreate() {
        if (fechaRecepcion == null) {
            fechaRecepcion = LocalDateTime.now();
        }
    }
    
    // Enums
    public enum EstadoProcesamiento {
        RECIBIDO("Recibido"),
        PROCESANDO("Procesando"),
        PROCESADO("Procesado"),
        ERROR("Error"),
        DUPLICADO("Duplicado"),
        IGNORADO("Ignorado");
        
        private final String descripcion;
        
        EstadoProcesamiento(String descripcion) {
            this.descripcion = descripcion;
        }
        
        public String getDescripcion() {
            return descripcion;
        }
    }
}

