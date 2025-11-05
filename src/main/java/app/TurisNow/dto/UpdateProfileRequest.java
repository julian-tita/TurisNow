package app.TurisNow.dto;

import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateProfileRequest {
    
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    private String nombre;
    
    @Size(min = 2, max = 100, message = "El apellido debe tener entre 2 y 100 caracteres")
    private String apellido;
    
    @Size(max = 50, message = "El teléfono no puede exceder 50 caracteres")
    private String telefono;
    
    @Size(max = 50, message = "El documento no puede exceder 50 caracteres")
    private String documento;
    
    @Past(message = "La fecha de nacimiento debe ser anterior a hoy")
    private LocalDate fechaNacimiento;
    
    @Size(max = 255, message = "La dirección no puede exceder 255 caracteres")
    private String direccion;
}

