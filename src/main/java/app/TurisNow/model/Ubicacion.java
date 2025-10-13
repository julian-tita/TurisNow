package app.TurisNow.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ubicacion {
    
    @Column(nullable = false)
    private String ciudad;
    
    @Column
    private String region;
    
    @Column(nullable = false)
    private String pais;
}

