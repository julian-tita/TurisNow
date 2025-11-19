package app.TurisNow.controller;

import app.TurisNow.dto.*;
import app.TurisNow.service.CarritoService;
import app.TurisNow.service.PagoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
@Tag(name = "Carrito", description = "Gestión del carrito de compras")
public class CarritoController {
    
    @Autowired
    private CarritoService carritoService;
    
    @Autowired
    private PagoService pagoService;
    
    @Operation(
        summary = "Obtener carrito",
        description = "Obtiene el contenido completo del carrito del usuario autenticado",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponse(responseCode = "200", description = "Carrito obtenido exitosamente")
    @GetMapping
    public ResponseEntity<CarritoDTO> obtenerCarrito() {
        String username = obtenerUsernameAutenticado();
        CarritoDTO carrito = carritoService.obtenerCarrito(username);
        return ResponseEntity.ok(carrito);
    }
    
    @Operation(
        summary = "Agregar item al carrito",
        description = "Agrega una experiencia con salida específica al carrito",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponse(responseCode = "200", description = "Item agregado exitosamente")
    @PostMapping("/items")
    public ResponseEntity<?> agregarItem(@Valid @RequestBody AddCarritoItemRequest request) {
        try {
            String username = obtenerUsernameAutenticado();
            CarritoDTO carrito = carritoService.agregarItem(username, request);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Item agregado al carrito exitosamente");
            response.put("carrito", carrito);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @Operation(
        summary = "Actualizar cantidad de item",
        description = "Actualiza la cantidad de personas para un item específico del carrito",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponse(responseCode = "200", description = "Item actualizado exitosamente")
    @PutMapping("/items/{itemId}")
    public ResponseEntity<?> actualizarItem(
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCarritoItemRequest request) {
        try {
            String username = obtenerUsernameAutenticado();
            CarritoDTO carrito = carritoService.actualizarItem(username, itemId, request);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Item actualizado exitosamente");
            response.put("carrito", carrito);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @Operation(
        summary = "Eliminar item del carrito",
        description = "Elimina un item específico del carrito",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponse(responseCode = "200", description = "Item eliminado exitosamente")
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<?> eliminarItem(@PathVariable Long itemId) {
        try {
            String username = obtenerUsernameAutenticado();
            carritoService.eliminarItem(username, itemId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Item eliminado del carrito");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @Operation(
        summary = "Vaciar carrito",
        description = "Elimina todos los items del carrito",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponse(responseCode = "200", description = "Carrito vaciado exitosamente")
    @DeleteMapping("/clear")
    public ResponseEntity<?> vaciarCarrito() {
        try {
            String username = obtenerUsernameAutenticado();
            carritoService.vaciarCarrito(username);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Carrito vaciado exitosamente");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @Operation(
        summary = "Realizar checkout con Mercado Pago",
        description = "Inicia el proceso de pago creando una preferencia en Mercado Pago. Retorna la URL (init_point) a la que se debe redirigir al usuario para completar el pago.",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponse(responseCode = "200", description = "Preferencia creada, usar el init_point para redirigir al usuario")
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout() {
        try {
            String username = obtenerUsernameAutenticado();
            
            // Ahora el checkout crea una preferencia de pago en Mercado Pago
            CheckoutResponse response = pagoService.crearPreferenciaPago(username);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @Operation(
        summary = "Checkout directo (sin pasarela de pago)",
        description = "[DEPRECADO] Convierte los items del carrito en reservas directamente, sin pasar por Mercado Pago. Solo para testing o casos especiales.",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponse(responseCode = "200", description = "Reservas creadas directamente")
    @PostMapping("/checkout-direct")
    public ResponseEntity<?> checkoutDirect() {
        try {
            String username = obtenerUsernameAutenticado();
            CheckoutResponse response = carritoService.checkout(username);
            
            if (response.getReservas().isEmpty() && !response.getErrores().isEmpty()) {
                // Todos los items fallaron
                return ResponseEntity.badRequest().body(response);
            }
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Helper para obtener el username del usuario autenticado
     */
    private String obtenerUsernameAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}

