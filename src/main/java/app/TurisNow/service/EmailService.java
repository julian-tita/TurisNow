package app.TurisNow.service;

import app.TurisNow.dto.ReservaEmailDTO;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Servicio para envío de emails
 */
@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private TemplateEngine templateEngine;
    
    @Value("${turisnow.email.from}")
    private String emailFrom;
    
    @Value("${turisnow.email.fromName}")
    private String emailFromName;
    
    @Value("${turisnow.email.enabled:true}")
    private boolean emailEnabled;
    
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    
    /**
     * Envía email de confirmación de reserva (asíncrono)
     * No bloquea el proceso de pago si falla el envío
     */
    @Async
    public void enviarEmailConfirmacionReserva(ReservaEmailDTO reservaInfo) {
        if (!emailEnabled) {
            logger.info("📧 Envío de emails deshabilitado. Email para {} no será enviado.", reservaInfo.getEmailUsuario());
            return;
        }
        
        try {
            logger.info("📧 Preparando email de confirmación para: {}", reservaInfo.getEmailUsuario());
            
            // Crear contexto con datos para el template
            Context context = new Context(new Locale("es", "AR"));
            context.setVariable("nombreUsuario", reservaInfo.getNombreUsuario());
            context.setVariable("reservaId", reservaInfo.getReservaId());
            context.setVariable("tituloExperiencia", reservaInfo.getTituloExperiencia());
            context.setVariable("descripcionExperiencia", reservaInfo.getDescripcionExperiencia());
            context.setVariable("imagenUrl", reservaInfo.getImagenUrlExperiencia());
            context.setVariable("categoria", reservaInfo.getCategoriaExperiencia());
            
            // Fechas formateadas
            context.setVariable("fechaInicio", reservaInfo.getFechaInicio().format(DATETIME_FORMATTER));
            context.setVariable("fechaFin", reservaInfo.getFechaFin() != null ? 
                reservaInfo.getFechaFin().format(DATETIME_FORMATTER) : "No especificada");
            context.setVariable("fechaReserva", reservaInfo.getFechaReserva().format(DATETIME_FORMATTER));
            
            // Ubicación
            String ubicacionCompleta = String.format("%s, %s, %s", 
                reservaInfo.getCiudad(), 
                reservaInfo.getRegion(), 
                reservaInfo.getPais());
            context.setVariable("ubicacion", ubicacionCompleta);
            
            // Detalles de la reserva
            context.setVariable("cantidadPersonas", reservaInfo.getCantidadPersonas());
            context.setVariable("precioTotal", String.format("%.2f", reservaInfo.getPrecioTotal()));
            context.setVariable("moneda", reservaInfo.getMoneda());
            
            // Información del pago
            context.setVariable("pagoId", reservaInfo.getPagoId());
            context.setVariable("paymentId", reservaInfo.getPaymentId());
            context.setVariable("metodoPago", reservaInfo.getMetodoPago() != null ? 
                formatearMetodoPago(reservaInfo.getMetodoPago()) : "No especificado");
            context.setVariable("fechaPago", reservaInfo.getFechaPago() != null ? 
                reservaInfo.getFechaPago().format(DATETIME_FORMATTER) : "No especificada");
            
            // Observaciones
            context.setVariable("observaciones", reservaInfo.getObservaciones());
            
            // Procesar template HTML
            String htmlContent = templateEngine.process("email-confirmacion-reserva", context);
            
            // Crear mensaje
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(emailFrom, emailFromName);
            helper.setTo(reservaInfo.getEmailUsuario());
            helper.setSubject("✅ Confirmación de Reserva #" + reservaInfo.getReservaId() + " - " + reservaInfo.getTituloExperiencia());
            helper.setText(htmlContent, true);
            
            // Enviar email
            mailSender.send(message);
            
            logger.info("✅ Email de confirmación enviado exitosamente a: {}", reservaInfo.getEmailUsuario());
            
        } catch (MessagingException e) {
            logger.error("❌ Error al preparar el email para {}: {}", 
                reservaInfo.getEmailUsuario(), e.getMessage(), e);
        } catch (Exception e) {
            logger.error("❌ Error inesperado al enviar email a {}: {}", 
                reservaInfo.getEmailUsuario(), e.getMessage(), e);
        }
    }
    
    /**
     * Formatea el nombre del método de pago para mostrar
     */
    private String formatearMetodoPago(String metodoPago) {
        return switch (metodoPago.toLowerCase()) {
            case "visa" -> "Visa";
            case "master" -> "Mastercard";
            case "amex" -> "American Express";
            case "debvisa" -> "Visa Débito";
            case "debmaster" -> "Mastercard Débito";
            case "mercadopago" -> "Mercado Pago";
            default -> metodoPago.toUpperCase();
        };
    }
    
    /**
     * Envía email genérico (para uso futuro)
     */
    @Async
    public void enviarEmail(String destinatario, String asunto, String contenidoHtml) {
        if (!emailEnabled) {
            logger.info("📧 Envío de emails deshabilitado.");
            return;
        }
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(emailFrom, emailFromName);
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(contenidoHtml, true);
            
            mailSender.send(message);
            
            logger.info("✅ Email enviado exitosamente a: {}", destinatario);
            
        } catch (Exception e) {
            logger.error("❌ Error al enviar email a {}: {}", destinatario, e.getMessage(), e);
        }
    }
}

