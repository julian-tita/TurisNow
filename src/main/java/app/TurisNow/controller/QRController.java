package app.TurisNow.controller;

import app.TurisNow.dto.CheckInRequest;
import app.TurisNow.dto.QRValidacionDTO;
import app.TurisNow.service.ReservaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reservas")
@Tag(name = "QR y Check-in", description = "API para validación de QR y check-in de reservas")
@CrossOrigin(origins = "*")
public class QRController {
    
    private static final Logger logger = LoggerFactory.getLogger(QRController.class);
    
    @Autowired
    private ReservaService reservaService;
    
    /**
     * Endpoint para verificar un código QR
     * Puede ser llamado desde el navegador cuando se escanea el QR
     * o desde una app móvil
     */
    @GetMapping("/verificar")
    @Operation(
        summary = "Verificar código QR",
        description = "Valida un código QR y retorna la información de la reserva"
    )
    public ResponseEntity<?> verificarQR(@RequestParam String token) {
        try {
            logger.info("🔍 Verificando QR - Token: {}", token);
            
            QRValidacionDTO resultado = reservaService.validarQR(token);
            
            if (!resultado.getValido()) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(resultado);
            }
            
            return ResponseEntity.ok(resultado);
            
        } catch (Exception e) {
            logger.error("❌ Error verificando QR: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "valido", false,
                        "mensaje", "Error al verificar el código QR: " + e.getMessage()
                    ));
        }
    }
    
    /**
     * Endpoint para realizar check-in mediante QR
     * El operador escanea el QR y confirma la llegada del cliente
     */
    @PostMapping("/checkin")
    @Operation(
        summary = "Realizar check-in",
        description = "Registra el check-in de una reserva mediante código QR"
    )
    public ResponseEntity<?> realizarCheckin(@RequestBody CheckInRequest request) {
        try {
            logger.info("✅ Solicitando check-in - Token: {}, Operador: {}", 
                request.getTokenQr(), request.getOperador());
            
            QRValidacionDTO resultado = reservaService.realizarCheckin(
                request.getTokenQr(), 
                request.getOperador()
            );
            
            if (!resultado.getValido()) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(resultado);
            }
            
            return ResponseEntity.ok(resultado);
            
        } catch (Exception e) {
            logger.error("❌ Error en check-in: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "valido", false,
                        "mensaje", "Error al realizar check-in: " + e.getMessage()
                    ));
        }
    }
    
    /**
     * Endpoint simple para verificar QR (solo retorna si es válido o no)
     */
    @GetMapping("/validar-token")
    @Operation(
        summary = "Validar token QR",
        description = "Verifica rápidamente si un token QR es válido (solo true/false)"
    )
    public ResponseEntity<?> validarToken(@RequestParam String token) {
        try {
            QRValidacionDTO resultado = reservaService.validarQR(token);
            
            return ResponseEntity.ok(Map.of(
                "valido", resultado.getValido(),
                "mensaje", resultado.getMensaje()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "valido", false,
                "mensaje", "Error al validar token"
            ));
        }
    }
    
    /**
     * Endpoint para que el usuario obtenga el QR de su reserva
     * Este endpoint SÍ requiere autenticación
     */
    @GetMapping("/{reservaId}/qr")
    @Operation(
        summary = "Obtener QR de una reserva",
        description = "Obtiene el código QR de una reserva específica del usuario autenticado"
    )
    public ResponseEntity<?> obtenerQRReserva(@PathVariable Long reservaId) {
        try {
            logger.info("🔲 Solicitando QR para reserva: {}", reservaId);
            
            Map<String, Object> qrInfo = reservaService.obtenerQRReserva(reservaId);
            
            if (qrInfo == null) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(Map.of("mensaje", "Reserva no encontrada"));
            }
            
            return ResponseEntity.ok(qrInfo);
            
        } catch (Exception e) {
            logger.error("❌ Error obteniendo QR: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al obtener el código QR"));
        }
    }
}

