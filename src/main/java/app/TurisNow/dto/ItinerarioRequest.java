package app.TurisNow.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

@Data
public class ItinerarioRequest {
    @NotNull(message = "La experiencia es obligatoria")
    private Long experienciaId;

    private String fechaInicio;     // Permite override manual, por defecto se usa la salida
    private String fechaFin;        // Si falta, se usa fecha de fin de la salida

    @Size(max = 8, message = "Máximo 8 intereses permitidos")
    private List<String> intereses;
    
    private String presupuesto;      // Ej: "bajo", "medio", "alto"
    
    private String nivelActividad;   // Ej: "relajado", "moderado", "intenso"

    private String horaInicio;       // Ej: "09:00"

    private String horaFin;          // Ej: "19:00"

    private String puntoPartida;     // Ej: "Centro"

    private String transporte;       // Ej: "a pie"
}
