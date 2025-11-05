package app.TurisNow.dto;

import app.TurisNow.model.Experiencia;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoritoDTO {
    
    private Long experienciaId;
    private String titulo;
    private String descripcion;
    private BigDecimal precio;
    private String moneda;
    private String categoria;
    private String imagenUrl;
    
    public FavoritoDTO(Long experienciaId, String titulo, String categoria, String imagenUrl, BigDecimal precio, String moneda) {
        this.experienciaId = experienciaId;
        this.titulo = titulo;
        this.categoria = categoria;
        this.imagenUrl = imagenUrl;
        this.precio = precio;
        this.moneda = moneda;
    }
}

