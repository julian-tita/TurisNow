package app.TurisNow.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ItinerarioResponse {

    private String destino;
    private Resumen resumen;
    private List<DiaItinerario> itinerario;
    private List<Alternativa> alternativas;
    private List<String> suposiciones;
    private String fuenteModelo;

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Resumen {
        private int dias;
        private Perfil perfil;
        @JsonProperty("idea_general")
        private String ideaGeneral;
        private List<String> consejos;
    }

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Perfil {
        private List<String> intereses;
        @JsonProperty("nivel_actividad")
        private String nivelActividad;
        private String presupuesto;
        private String transporte;
    }

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class DiaItinerario {
        private int dia;
        @JsonProperty("rango_horario")
        private String rangoHorario;
        private List<Bloque> bloques;
    }

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Bloque {
        private String inicio;
        private String fin;
        private String titulo;
        private String tipo;
        private String zona;
        @JsonProperty("descripcion_corta")
        private String descripcionCorta;
        @JsonProperty("duracion_min")
        private Integer duracionMin;
        @JsonProperty("traslado_prev")
        private Traslado trasladoPrev;
        @JsonProperty("costo_estimado_ars")
        private Double costoEstimadoArs;
        @JsonProperty("reserva_recomendada")
        private Boolean reservaRecomendada;
        private Enlaces enlaces;
        private String notas;
    }

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Traslado {
        private String modo;
        @JsonProperty("distancia_km_aprox")
        private Double distanciaKmAprox;
        @JsonProperty("duracion_min_aprox")
        private Integer duracionMinAprox;
        private String nota;
    }

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Enlaces {
        @JsonProperty("sitio_oficial")
        private String sitioOficial;
        private String mapa;
    }

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Alternativa {
        private String motivo;
        private String sustituto;
    }
}
