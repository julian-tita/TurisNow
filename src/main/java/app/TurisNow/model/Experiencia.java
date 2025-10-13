package app.TurisNow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "experiencias")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Experiencia {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String titulo;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Moneda moneda;
    
    @Embedded
    private Ubicacion ubicacion;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Categoria categoria;
    
    @Column(name = "imagen_url")
    private String imagenUrl;
    
    @ElementCollection
    @CollectionTable(name = "experiencia_tags", joinColumns = @JoinColumn(name = "experiencia_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();
    
    @OneToMany(mappedBy = "experiencia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Salida> salidas = new ArrayList<>();
    
    // Enums
    public enum Moneda {
        ARS, USD
    }
    
    public enum Categoria {
        PLAYA("playa"),
        MONTANA("montaña"),
        AVENTURA("aventura"),
        GASTRONOMIA("gastronomía"),
        CULTURA("cultura");
        
        private final String valor;
        
        Categoria(String valor) {
            this.valor = valor;
        }
        
        public String getValor() {
            return valor;
        }
    }
}

