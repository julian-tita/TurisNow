package app.TurisNow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExperienciaRequest {
    
    private String titulo;
    private String descripcion;
    private BigDecimal precio;
    private String moneda;
    private UbicacionRequest ubicacion;
    private String categoria;
    private String imagenUrl;
    private List<String> tags;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UbicacionRequest {
        private String ciudad;
        private String region;
        private String pais;
    }
}