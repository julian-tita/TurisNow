package app.TurisNow.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "carrito_items",
    uniqueConstraints = @UniqueConstraint(columnNames = {"carrito_id", "salida_id"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarritoItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrito_id", nullable = false)
    private Carrito carrito;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experiencia_id", nullable = false)
    private Experiencia experiencia;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salida_id", nullable = false)
    private Salida salida;
    
    @Column(nullable = false)
    @Positive(message = "La cantidad debe ser mayor a 0")
    private Integer cantidad;
    
    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;
    
    @Column(nullable = false, length = 10)
    private String moneda;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    /**
     * Calcula el subtotal del item (cantidad * precioUnitario)
     */
    public BigDecimal getSubtotal() {
        return precioUnitario.multiply(BigDecimal.valueOf(cantidad));
    }
}

