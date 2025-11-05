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
        private Long itemId;
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
    }
}

