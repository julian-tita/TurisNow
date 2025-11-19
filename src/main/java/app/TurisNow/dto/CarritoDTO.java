package app.TurisNow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarritoDTO {
    
    private List<CarritoItemDTO> items = new ArrayList<>();
    private BigDecimal total;
    private String moneda;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CarritoItemDTO {
        private Long id;  // Alias para compatibilidad con frontend
        private Long itemId;  // Mantener por compatibilidad
        private Long experienciaId;
        private Long salidaId;
        private String titulo;
        private String descripcion;
        private String imagenUrl;
        private String fechaInicio;
        private String fechaFin;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private String moneda;
        private BigDecimal subtotal;
        
        // Constructor personalizado que inicializa ambos (id e itemId con el mismo valor)
        public CarritoItemDTO(Long id, Long experienciaId, Long salidaId, String titulo, 
                              String descripcion, String imagenUrl, String fechaInicio, 
                              String fechaFin, Integer cantidad, BigDecimal precioUnitario, 
                              String moneda, BigDecimal subtotal) {
            this.id = id;
            this.itemId = id;  // itemId = id para mantener compatibilidad
            this.experienciaId = experienciaId;
            this.salidaId = salidaId;
            this.titulo = titulo;
            this.descripcion = descripcion;
            this.imagenUrl = imagenUrl;
            this.fechaInicio = fechaInicio;
            this.fechaFin = fechaFin;
            this.cantidad = cantidad;
            this.precioUnitario = precioUnitario;
            this.moneda = moneda;
            this.subtotal = subtotal;
        }
        
        // Setter personalizado para mantener sincronizado id e itemId
        public void setId(Long id) {
            this.id = id;
            this.itemId = id;
        }
        
        public void setItemId(Long itemId) {
            this.itemId = itemId;
            this.id = itemId;
        }
    }
}

