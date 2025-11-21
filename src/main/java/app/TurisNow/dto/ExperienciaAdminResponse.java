package app.TurisNow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO de respuesta con información completa de una experiencia para admin.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExperienciaAdminResponse {
    private Long id;
    private String titulo;
    private String descripcion;
    private BigDecimal precio;
    private String moneda;
    private UbicacionDTO ubicacion;
    private String categoria;
    private String imagenUrl;
    private List<String> tags;
    private Integer totalSalidas;
    private Integer salidasActivas;
    private Integer totalReservas;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UbicacionDTO {
        private String ciudad;
        private String region;
        private String pais;
    }
}
