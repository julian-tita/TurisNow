package app.TurisNow.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearer-jwt";
        
        return new OpenAPI()
                .info(new Info()
                        .title("TurisNow API")
                        .description("API para el sistema de turismo TurisNow - Permite explorar, reservar y pagar experiencias turísticas locales")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("TurisNow Team")
                                .email("contacto@turisnow.com")
                                .url("https://turisnow.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, 
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .in(SecurityScheme.In.HEADER)
                                        .description("Ingresa SOLO el token JWT (sin 'Bearer')")));
    }
}
