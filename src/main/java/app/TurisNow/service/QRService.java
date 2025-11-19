package app.TurisNow.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Servicio para generar códigos QR
 */
@Service
public class QRService {
    
    private static final Logger logger = LoggerFactory.getLogger(QRService.class);
    
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom random = new SecureRandom();
    
    @Value("${turisnow.qr.url.base:http://localhost:9090}")
    private String baseUrl;
    
    /**
     * Genera un token único para una reserva
     * Formato: R{reservaId}-{random8chars}
     * Ejemplo: R27-A3F9K2M8
     */
    public String generarTokenReserva(Long reservaId) {
        StringBuilder token = new StringBuilder("R");
        token.append(reservaId);
        token.append("-");
        
        // Agregar 8 caracteres aleatorios
        for (int i = 0; i < 8; i++) {
            token.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        
        return token.toString();
    }
    
    /**
     * Genera un código QR para una reserva
     * El QR contiene una URL para validar la reserva
     * 
     * @param tokenQr Token único de la reserva
     * @param width Ancho de la imagen QR
     * @param height Alto de la imagen QR
     * @return Imagen QR en formato Base64
     */
    public String generarQRParaReserva(String tokenQr, int width, int height) {
        try {
            // URL que contendrá el QR: {baseUrl}/api/reservas/verificar?token=R27-A3F9K2M8
            String url = baseUrl + "/api/reservas/verificar?token=" + tokenQr;
            
            logger.info("🔲 Generando QR para token: {} - URL: {}", tokenQr, url);
            
            // Configurar hints para el QR
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.MARGIN, 1); // Margen mínimo
            
            // Generar matriz QR
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(url, BarcodeFormat.QR_CODE, width, height, hints);
            
            // Convertir a imagen
            BufferedImage bufferedImage = MatrixToImageWriter.toBufferedImage(bitMatrix);
            
            // Convertir a Base64
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ImageIO.write(bufferedImage, "PNG", outputStream);
            byte[] imageBytes = outputStream.toByteArray();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            
            logger.info("✅ QR generado exitosamente para token: {}", tokenQr);
            
            return "data:image/png;base64," + base64Image;
            
        } catch (WriterException | IOException e) {
            logger.error("❌ Error generando QR para token {}: {}", tokenQr, e.getMessage(), e);
            throw new RuntimeException("Error al generar código QR: " + e.getMessage());
        }
    }
    
    /**
     * Genera un QR con tamaño por defecto (300x300)
     */
    public String generarQRParaReserva(String tokenQr) {
        return generarQRParaReserva(tokenQr, 300, 300);
    }
    
    /**
     * Valida el formato de un token
     */
    public boolean esTokenValido(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }
        
        // Formato esperado: R{numero}-{8chars}
        // Ejemplo: R27-A3F9K2M8
        return token.matches("^R\\d+-[A-Z0-9]{8}$");
    }
    
    /**
     * Extrae el ID de reserva del token
     */
    public Long extraerReservaIdDeToken(String token) {
        try {
            // Extraer el número entre "R" y "-"
            String[] parts = token.split("-");
            if (parts.length == 2 && parts[0].startsWith("R")) {
                return Long.parseLong(parts[0].substring(1));
            }
            return null;
        } catch (NumberFormatException e) {
            return null;
        }
    }
}

