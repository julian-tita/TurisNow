package app.TurisNow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para solicitud de check-in
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckInRequest {
    
    private String tokenQr;
    private String operador; // Nombre del operador que hace el check-in (opcional)
}

