package app.TurisNow.controller;

import app.TurisNow.dto.ItinerarioRequest;
import app.TurisNow.dto.ItinerarioResponse;
import app.TurisNow.service.AIItinerarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/itinerario")
@Tag(name = "Itinerario IA", description = "Generación asistida de itinerarios turísticos")
@SecurityRequirement(name = "Bearer Authentication")
public class ItinerarioController {

    @Autowired
    private AIItinerarioService aiItinerarioService;

    @Operation(
        summary = "Generar itinerario",
        description = "Genera un itinerario personalizado usando criterios del usuario y asistencia IA (con fallback automático)"
    )
    @PostMapping("/generar")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ItinerarioResponse> generar(@Valid @RequestBody ItinerarioRequest request) {
        ItinerarioResponse response = aiItinerarioService.generar(request);
        return ResponseEntity.ok(response);
    }
}
