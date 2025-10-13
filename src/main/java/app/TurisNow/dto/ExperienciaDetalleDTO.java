package app.TurisNow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExperienciaDetalleDTO {
    private Long id;
    private String titulo;
    private String descripcion;
    private BigDecimal precio;
    private String moneda;
    private UbicacionDTO ubicacion;
    private String categoria;
    private String imagenUrl;
    private List<String> tags;
    private List<SalidaDTO> salidas;
    
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
    public static class SalidaDTO {
        private Long id;
        private LocalDateTime fechaInicio;
        private LocalDateTime fechaFin;
        private Integer capacidadTotal;
        private Integer capacidadDisponible;
    }
}

