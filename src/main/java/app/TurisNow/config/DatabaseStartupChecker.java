package app.TurisNow.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;

@Slf4j
@Component
public class DatabaseStartupChecker {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private DataSource dataSource;

    @PostConstruct
    public void checkConnection() {
        try (Connection connection = dataSource.getConnection()) {
            // Ejecuta una consulta trivial para validar conectividad
            jdbcTemplate.execute("SELECT 1");

            DatabaseMetaData meta = connection.getMetaData();
            String url = meta != null ? meta.getURL() : "(URL no disponible)";

            String okMsg = "Conexión a la base de datos OK -> " + url;
            log.info(okMsg);
            System.out.println(okMsg);
        } catch (Exception ex) {
            String err = "No se pudo conectar a la base de datos configurada en application.properties. " +
                         "Verifica URL/usuario/contraseña/puerto. Causa: " + ex.getMessage();
            log.error(err);
            System.err.println(err);
        }
    }
}


