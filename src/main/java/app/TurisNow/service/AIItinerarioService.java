package app.TurisNow.service;

import app.TurisNow.dto.ItinerarioRequest;
import app.TurisNow.dto.ItinerarioResponse;
import app.TurisNow.model.Experiencia;
import app.TurisNow.model.Salida;
import app.TurisNow.model.Ubicacion;
import app.TurisNow.repository.ExperienciaRepository;
import app.TurisNow.repository.SalidaRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AIItinerarioService {

    private static final Logger logger = LoggerFactory.getLogger(AIItinerarioService.class);
    private static final String DEFAULT_HORA_INICIO = "09:00";
    private static final String DEFAULT_HORA_FIN = "19:00";
    private static final String DEFAULT_PUNTO_PARTIDA = "Centro";
    private static final String DEFAULT_TRANSPORTE = "a pie";
    private static final int MAX_DIAS = 3;

    private static final String PROMPT_TEMPLATE = """
SYSTEM
Eres un planificador de viajes. Debes generar itinerarios de 1–3 días optimizados y devolver ÚNICAMENTE JSON válido, sin comentarios ni texto extra. No expliques tu razonamiento interno. Si falta información, asume valores por defecto definidos abajo.

INSTRUCCIONES

Objetivo: crear un itinerario de {{dias}} día(s) en {{destino}} para un/a viajero/a con:

Intereses: {{intereses_coma}}.

Nivel de actividad: {{nivel_actividad}}.

Presupuesto: {{presupuesto}}.

Ventana diaria aproximada: {{hora_inicio}}–{{hora_fin}}.

Punto de partida: {{punto_partida}}.

Medio principal: {{transporte}}.

Reglas simples (demo sin APIs):

Duraciones por tipo:

Museo/exhibición: 75–120 min; Mirador/plaza: 20–40 min; Barrio/recorrido: 45–90 min;
Café/merienda: 20–40 min; Almuerzo: 50–75 min.

Traslados (a pie): 12 min por km (aprox. 5 km/h). Si “bajo”, máximo 2 km seguidos; si “alto”, hasta 4 km seguidos.

Ordenar por cercanía (evitar zig-zag). Priorizar clusters de barrio.

Insertar almuerzo entre 12:30–14:30 y merienda 16:30–18:00.

Balance indoor/outdoor según clima desconocido → balance neutro.

Si algún horario/entrada es incierto, colocar "desconocido" y añadir nota corta.

No inventes precios exactos: usa rangos (bajo/medio/alto) y deja costo_estimado_ars en null si no hay base.

Adaptación por actividad y presupuesto:

Actividad “bajo”: más pausas, menos tramos largos, >1 café posible.

Actividad “alto”: añade un mirador extra o paseo largo.

Presupuesto “alto”: sugerí 1 experiencia premium (ej.: tour guiado o rooftop).

Presupuesto “bajo”: prioriza actividades gratuitas/low-cost y comida económica.

Salida: devolver SOLO el siguiente JSON, completo y válido:

{
"destino": "{{destino}}",
"resumen": {
"dias": {{dias}},
"perfil": {
"intereses": ["..."],
"nivel_actividad": "{{nivel_actividad}}",
"presupuesto": "{{presupuesto}}",
"transporte": "{{transporte}}"
},
"idea_general": "1–2 frases sobre el enfoque del itinerario",
"consejos": ["tip breve 1", "tip breve 2"]
},
"itinerario": [
{
"dia": 1,
"rango_horario": "{{hora_inicio}}-{{hora_fin}}",
"bloques": [
{
"inicio": "09:00",
"fin": "10:15",
"titulo": "Nombre del lugar o actividad",
"tipo": "museo|mirador|barrio|cafe|almuerzo|parque|mercado|otro",
"zona": "Barrio/Zona",
"descripcion_corta": "Máx. 25 palabras, útil y concreta",
"duracion_min": 75,
"traslado_prev": {
"modo": "a_pie|transporte_publico|mixto",
"distancia_km_aprox": 0.8,
"duracion_min_aprox": 10,
"nota": "Si aplica"
},
"costo_estimado_ars": null,
"reserva_recomendada": false,
"enlaces": {
"sitio_oficial": null,
"mapa": null
},
"notas": "‘Horario desconocido’ u otra advertencia breve"
}
]
}
],
"alternativas": [
{
"motivo": "Clima lluvioso / aforo / cierre",
"sustituto": "Actividad alternativa breve y cercana"
}
],
"suposiciones": [
"Qué asumiste por falta de datos, p. ej. ‘punto de partida en Centro’"
]
}

VALIDACIÓN

Produce EXCLUSIVAMENTE JSON. No incluyas “```”, texto, ni comentarios.

Todos los campos solicitados deben existir (usa null o strings “desconocido” cuando aplique).

La suma de duraciones + traslados debe caber dentro de {{hora_inicio}}–{{hora_fin}}.

Evita repetir el mismo tipo consecutivamente salvo que tenga sentido (ej.: barrio + mirador ok).

ENTRADA
{
"destino": "{{destino}}",
"dias": {{dias}},
"intereses": [{{intereses_array}}],
"nivel_actividad": "{{nivel_actividad}}",
"presupuesto": "{{presupuesto}}",
"hora_inicio": "{{hora_inicio}}",
"hora_fin": "{{hora_fin}}",
"punto_partida": "{{punto_partida}}",
"transporte": "{{transporte}}"
}
""";

    private final ExperienciaRepository experienciaRepository;
    private final SalidaRepository salidaRepository;
    private final ObjectMapper objectMapper;

    @Value("${ai.provider:local}")
    private String provider;

    @Value("${ai.apiKey:}")
    private String apiKey;

    public ItinerarioResponse generar(ItinerarioRequest request) {
        Experiencia experiencia = experienciaRepository.findById(request.getExperienciaId())
                .orElseThrow(() -> new IllegalArgumentException("Experiencia no encontrada con id: " + request.getExperienciaId()));

        LocalDate fechaInicio = determinarFechaInicio(request, experiencia);
        LocalDate fechaFin = determinarFechaFin(request, experiencia, fechaInicio);

        long diasCalculados = ChronoUnit.DAYS.between(fechaInicio, fechaFin) + 1;
        if (diasCalculados < 1) {
            diasCalculados = 1;
            fechaFin = fechaInicio;
        }
        if (diasCalculados > MAX_DIAS) {
            diasCalculados = MAX_DIAS;
            fechaFin = fechaInicio.plusDays(MAX_DIAS - 1);
        }

        String destino = construirDestino(experiencia);
        List<String> intereses = determinarIntereses(request, experiencia);
        String horaInicio = valorSeguro(request.getHoraInicio(), DEFAULT_HORA_INICIO);
        String horaFin = valorSeguro(request.getHoraFin(), DEFAULT_HORA_FIN);
        String puntoPartida = valorSeguro(request.getPuntoPartida(), DEFAULT_PUNTO_PARTIDA);
        String transporte = valorSeguro(request.getTransporte(), DEFAULT_TRANSPORTE);
        String presupuesto = valorSeguro(request.getPresupuesto(), "medio");
        String nivelActividad = valorSeguro(request.getNivelActividad(), "moderado");

        String prompt = construirPrompt(destino, (int) diasCalculados, intereses, horaInicio, horaFin,
                puntoPartida, transporte, presupuesto, nivelActividad);

        logger.info("Generando itinerario IA para experiencia {} ({})", experiencia.getTitulo(), destino);

        if ("huggingface".equalsIgnoreCase(provider) && apiKey != null && !apiKey.isBlank()) {
            String respuesta = invokeHuggingFace(prompt);
            if (respuesta != null && !respuesta.isBlank()) {
                ItinerarioResponse generado = parsearRespuestaIA(respuesta, destino);
                if (generado != null) {
                    generado.setFuenteModelo("huggingface");
                    completarCamposPorDefecto(generado, destino, intereses, presupuesto, nivelActividad, transporte, (int) diasCalculados);
                    return generado;
                }
            }
        }

        ItinerarioResponse fallback = generarFallback(destino, intereses, puntoPartida, transporte,
                presupuesto, nivelActividad, (int) diasCalculados, horaInicio, horaFin);
        fallback.setFuenteModelo("fallback");
        return fallback;
    }

    private LocalDate determinarFechaInicio(ItinerarioRequest request, Experiencia experiencia) {
        if (request.getFechaInicio() != null && !request.getFechaInicio().isBlank()) {
            return LocalDate.parse(request.getFechaInicio());
        }
        Optional<Salida> proximaSalida = salidaRepository.findSalidasDisponibles(
                experiencia.getId(), LocalDateTime.now())
                .stream()
                .findFirst();
        return proximaSalida.map(salida -> salida.getFechaInicio().toLocalDate())
                .orElse(LocalDate.now());
    }

    private LocalDate determinarFechaFin(ItinerarioRequest request, Experiencia experiencia, LocalDate fechaInicio) {
        if (request.getFechaFin() != null && !request.getFechaFin().isBlank()) {
            return LocalDate.parse(request.getFechaFin());
        }
        Optional<Salida> proximaSalida = salidaRepository.findSalidasDisponibles(
                experiencia.getId(), LocalDateTime.now())
                .stream()
                .findFirst();
        return proximaSalida.map(salida -> {
            LocalDate fin = salida.getFechaFin() != null ? salida.getFechaFin().toLocalDate() : fechaInicio;
            return fin.isBefore(fechaInicio) ? fechaInicio : fin;
        }).orElse(fechaInicio);
    }

    private List<String> determinarIntereses(ItinerarioRequest request, Experiencia experiencia) {
        if (request.getIntereses() != null && !request.getIntereses().isEmpty()) {
            return request.getIntereses();
        }
        return experiencia.getTags() != null && !experiencia.getTags().isEmpty()
                ? experiencia.getTags()
                : Collections.singletonList(experiencia.getCategoria().getValor());
    }

    private String construirDestino(Experiencia experiencia) {
        Ubicacion ubicacion = experiencia.getUbicacion();
        if (ubicacion == null) {
            return experiencia.getTitulo();
        }
        List<String> partes = new ArrayList<>();
        if (ubicacion.getCiudad() != null && !ubicacion.getCiudad().isBlank()) {
            partes.add(ubicacion.getCiudad());
        }
        if (ubicacion.getRegion() != null && !ubicacion.getRegion().isBlank()) {
            partes.add(ubicacion.getRegion());
        }
        if (ubicacion.getPais() != null && !ubicacion.getPais().isBlank()) {
            partes.add(ubicacion.getPais());
        }
        if (partes.isEmpty()) {
            partes.add(experiencia.getTitulo());
        }
        return String.join(", ", partes);
    }

    private String construirPrompt(String destino, int dias, List<String> intereses, String horaInicio,
                                   String horaFin, String puntoPartida, String transporte,
                                   String presupuesto, String nivelActividad) {
        String interesesComa = intereses.isEmpty() ? "experiencias variadas" : String.join(", ", intereses);
        String interesesArray = intereses.stream()
            .map(i -> "\"" + i + "\"")
            .collect(Collectors.joining(", "));

        return PROMPT_TEMPLATE
                .replace("{{destino}}", escapar(destino))
                .replace("{{dias}}", String.valueOf(dias))
                .replace("{{intereses_coma}}", escapar(interesesComa))
                .replace("{{intereses_array}}", interesesArray)
                .replace("{{nivel_actividad}}", nivelActividad)
                .replace("{{presupuesto}}", presupuesto)
                .replace("{{hora_inicio}}", horaInicio)
                .replace("{{hora_fin}}", horaFin)
                .replace("{{punto_partida}}", escapar(puntoPartida))
                .replace("{{transporte}}", transporte);
    }

    private String escapar(String valor) {
        return valor.replace("\"", "'");
    }

    private String invokeHuggingFace(String prompt) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(5))
                    .build();

            String payload = objectMapper.writeValueAsString(
                    java.util.Map.of(
                            "inputs", prompt,
                            "parameters", java.util.Map.of("max_new_tokens", 800)
                    )
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api-inference.huggingface.co/models/google/flan-t5-large"))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(30))
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                logger.info("Respuesta exitosa de HuggingFace");
                return response.body();
            } else {
                logger.warn("HuggingFace retornó status: {}", response.statusCode());
            }
        } catch (Exception e) {
            logger.error("Error al invocar HuggingFace", e);
        }
        return null;
    }

    private ItinerarioResponse parsearRespuestaIA(String respuesta, String destino) {
        try {
            String contenido = extraerTextoGenerado(respuesta);
            if (contenido == null || contenido.isBlank()) {
                return null;
            }
            ItinerarioResponse respuestaIA = objectMapper.readValue(contenido, ItinerarioResponse.class);
            if (respuestaIA.getDestino() == null || respuestaIA.getDestino().isBlank()) {
                respuestaIA.setDestino(destino);
            }
            return respuestaIA;
        } catch (Exception e) {
            logger.warn("No se pudo parsear la respuesta IA, se usará fallback", e);
            return null;
        }
    }

    private String extraerTextoGenerado(String respuesta) {
        try {
            JsonNode root = objectMapper.readTree(respuesta);
            if (root.isArray() && root.size() > 0) {
                JsonNode first = root.get(0);
                if (first.has("generated_text")) {
                    return first.get("generated_text").asText();
                }
            }
        } catch (Exception e) {
            logger.warn("Error extrayendo texto generado", e);
        }
        return respuesta;
    }

    private void completarCamposPorDefecto(ItinerarioResponse generado, String destino, List<String> intereses,
                                           String presupuesto, String nivelActividad, String transporte, int dias) {
        if (generado.getResumen() == null) {
            ItinerarioResponse.Resumen resumen = new ItinerarioResponse.Resumen();
            resumen.setDias(dias);
            ItinerarioResponse.Perfil perfil = new ItinerarioResponse.Perfil();
            perfil.setIntereses(intereses);
            perfil.setNivelActividad(nivelActividad);
            perfil.setPresupuesto(presupuesto);
            perfil.setTransporte(transporte);
            resumen.setPerfil(perfil);
            resumen.setIdeaGeneral("Itinerario generado en base a la experiencia seleccionada.");
            resumen.setConsejos(List.of("Reservar con antelación", "Verificar horarios actualizados"));
            generado.setResumen(resumen);
        } else {
            if (generado.getResumen().getPerfil() == null) {
                ItinerarioResponse.Perfil perfil = new ItinerarioResponse.Perfil();
                perfil.setIntereses(intereses);
                perfil.setNivelActividad(nivelActividad);
                perfil.setPresupuesto(presupuesto);
                perfil.setTransporte(transporte);
                generado.getResumen().setPerfil(perfil);
            }
            if (generado.getResumen().getDias() == 0) {
                generado.getResumen().setDias(dias);
            }
        }
        if (generado.getDestino() == null || generado.getDestino().isBlank()) {
            generado.setDestino(destino);
        }
        if (generado.getAlternativas() == null || generado.getAlternativas().isEmpty()) {
            ItinerarioResponse.Alternativa alternativa = new ItinerarioResponse.Alternativa();
            alternativa.setMotivo("Clima adverso");
            alternativa.setSustituto("Visitar museo local cubierto");
            generado.setAlternativas(List.of(alternativa));
        }
        if (generado.getSuposiciones() == null || generado.getSuposiciones().isEmpty()) {
            generado.setSuposiciones(List.of("Punto de partida en zona céntrica", "Horarios sujetos a disponibilidad"));
        }
    }

    private ItinerarioResponse generarFallback(String destino, List<String> intereses, String puntoPartida,
                                               String transporte, String presupuesto, String nivelActividad,
                                               int dias, String horaInicio, String horaFin) {
        ItinerarioResponse response = new ItinerarioResponse();
        response.setDestino(destino);

        ItinerarioResponse.Resumen resumen = new ItinerarioResponse.Resumen();
        resumen.setDias(dias);
        ItinerarioResponse.Perfil perfil = new ItinerarioResponse.Perfil();
        perfil.setIntereses(intereses);
        perfil.setNivelActividad(nivelActividad);
        perfil.setPresupuesto(presupuesto);
        perfil.setTransporte(transporte);
        resumen.setPerfil(perfil);
        resumen.setIdeaGeneral("Plan sugerido automáticamente basado en preferencias.");
        resumen.setConsejos(List.of("Verificar horarios y reservas con anticipación", "Llevar calzado cómodo"));
        response.setResumen(resumen);

        List<ItinerarioResponse.DiaItinerario> diasItinerario = new ArrayList<>();
        for (int d = 0; d < dias; d++) {
            ItinerarioResponse.DiaItinerario dia = new ItinerarioResponse.DiaItinerario();
            dia.setDia(d + 1);
            dia.setRangoHorario(horaInicio + "-" + horaFin);

            List<ItinerarioResponse.Bloque> bloques = new ArrayList<>();
            ItinerarioResponse.Bloque manana = new ItinerarioResponse.Bloque();
            manana.setInicio("09:00");
            manana.setFin("11:00");
            manana.setTitulo("Recorrido cultural");
            manana.setTipo("barrio");
            manana.setZona(destino);
            manana.setDescripcionCorta("Paseo guiado por puntos históricos destacados.");
            manana.setDuracionMin(120);
            ItinerarioResponse.Traslado trasladoManana = new ItinerarioResponse.Traslado();
            trasladoManana.setModo("a_pie");
            trasladoManana.setDistanciaKmAprox(1.2);
            trasladoManana.setDuracionMinAprox(15);
            trasladoManana.setNota("Salida desde " + puntoPartida);
            manana.setTrasladoPrev(trasladoManana);
            manana.setReservaRecomendada(false);
            bloques.add(manana);

            ItinerarioResponse.Bloque almuerzo = new ItinerarioResponse.Bloque();
            almuerzo.setInicio("12:45");
            almuerzo.setFin("14:00");
            almuerzo.setTitulo("Almuerzo típico");
            almuerzo.setTipo("almuerzo");
            almuerzo.setZona(destino);
            almuerzo.setDescripcionCorta("Restaurante recomendado con cocina local afín al presupuesto.");
            almuerzo.setDuracionMin(75);
            almuerzo.setReservaRecomendada(true);
            bloques.add(almuerzo);

            ItinerarioResponse.Bloque tarde = new ItinerarioResponse.Bloque();
            tarde.setInicio("15:00");
            tarde.setFin("17:30");
            tarde.setTitulo("Actividad destacada de la experiencia");
            tarde.setTipo("otro");
            tarde.setZona(destino);
            tarde.setDescripcionCorta("Actividad principal alineada con los intereses seleccionados.");
            tarde.setDuracionMin(150);
            ItinerarioResponse.Traslado trasladoTarde = new ItinerarioResponse.Traslado();
            trasladoTarde.setModo(transporte.replace(" ", "_"));
            trasladoTarde.setDuracionMinAprox(20);
            trasladoTarde.setDistanciaKmAprox(1.5);
            tarde.setTrasladoPrev(trasladoTarde);
            bloques.add(tarde);

            ItinerarioResponse.Bloque merienda = new ItinerarioResponse.Bloque();
            merienda.setInicio("17:45");
            merienda.setFin("18:30");
            merienda.setTitulo("Merienda/descanso");
            merienda.setTipo("cafe");
            merienda.setZona(destino);
            merienda.setDescripcionCorta("Café o heladería local para cerrar el día con calma.");
            merienda.setDuracionMin(45);
            bloques.add(merienda);

            dia.setBloques(bloques);
            diasItinerario.add(dia);
        }
        response.setItinerario(diasItinerario);

        ItinerarioResponse.Alternativa alternativa = new ItinerarioResponse.Alternativa();
        alternativa.setMotivo("Clima lluvioso");
        alternativa.setSustituto("Visitar museo cubierto cercano a " + puntoPartida);
        response.setAlternativas(List.of(alternativa));

        response.setSuposiciones(List.of(
                "Punto de partida en " + puntoPartida,
                "Intereses principales: " + String.join(", ", intereses)
        ));

        return response;
    }

    private String valorSeguro(String valor, String porDefecto) {
        return (valor == null || valor.isBlank()) ? porDefecto : valor;
    }
}
