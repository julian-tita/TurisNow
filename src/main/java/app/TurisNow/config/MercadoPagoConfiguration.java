package app.TurisNow.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de Mercado Pago SDK
 * Inicializa el SDK con el Access Token configurado en application.properties
 */
@Configuration
public class MercadoPagoConfiguration {
    
    private static final Logger logger = LoggerFactory.getLogger(MercadoPagoConfiguration.class);
    
    @Value("${mercadopago.access.token}")
    private String accessToken;
    
    @PostConstruct
    public void init() {
        try {
            // Usar el nombre completo de la clase del SDK para evitar conflictos
            com.mercadopago.MercadoPagoConfig.setAccessToken(accessToken);
            logger.info("✅ Mercado Pago SDK inicializado correctamente");
        } catch (Exception e) {
            logger.error("❌ Error al inicializar Mercado Pago SDK: {}", e.getMessage());
            throw new RuntimeException("No se pudo inicializar Mercado Pago SDK", e);
        }
    }
}

