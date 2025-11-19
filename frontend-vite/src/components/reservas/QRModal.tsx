import React, { useEffect } from 'react';
import type { QRData } from '../../services/reservaService';
import './QRModal.css';

interface QRModalProps {
  qrData: QRData;
  onClose: () => void;
}

const QRModal: React.FC<QRModalProps> = ({ qrData, onClose }) => {
  
  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  
  const descargarQR = () => {
    const link = document.createElement('a');
    link.href = qrData.qrCodeBase64;
    link.download = `QR-Reserva-${qrData.reservaId}.png`;
    link.click();
  };

  const copiarToken = () => {
    navigator.clipboard.writeText(qrData.tokenQr);
    alert('Token copiado al portapapeles');
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className="qr-modal-overlay" 
      onClick={onClose}
      style={{ zIndex: 9999 }}
    >
      <div 
        className="qr-modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 10000 }}
      >
        {/* Header */}
        <div className="qr-modal-header">
          <h2>🔲 Tu Código QR</h2>
          <button className="close-btn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="qr-modal-body">
          
          {/* Info de la reserva */}
          <div className="reserva-info">
            <h3>{qrData.tituloExperiencia}</h3>
            <p>📅 {formatearFecha(qrData.fechaInicio)}</p>
            <p>👥 {qrData.cantidadPersonas} persona(s)</p>
            <p className="estado-badge">Estado: {qrData.estadoReserva}</p>
          </div>

          {/* QR Code */}
          <div className="qr-container">
            <img 
              src={qrData.qrCodeBase64} 
              alt="Código QR" 
              className="qr-image"
            />
          </div>

          {/* Token */}
          <div className="token-container">
            <p className="token-label">Token de reserva:</p>
            <div className="token-wrapper">
              <code className="token-code">{qrData.tokenQr}</code>
              <button 
                className="btn-copy"
                onClick={copiarToken}
                title="Copiar token"
              >
                📋
              </button>
            </div>
          </div>

          {/* Estado de Check-in */}
          {qrData.checkinRealizado ? (
            <div className="alert alert-success">
              ✅ Check-in realizado
              {qrData.fechaCheckin && (
                <p className="checkin-date">
                  Fecha: {formatearFecha(qrData.fechaCheckin)}
                </p>
              )}
            </div>
          ) : (
            <div className="alert alert-info">
              ℹ️ Muestra este código al operador el día de la experiencia
            </div>
          )}

          {/* Instrucciones */}
          <div className="instructions">
            <h4>📌 Instrucciones:</h4>
            <ul>
              <li>Guarda una captura de este QR o descárgalo</li>
              <li>Muéstralo en tu móvil el día de la experiencia</li>
              <li>El operador lo escaneará para confirmar tu asistencia</li>
              <li>También puedes mostrar el código token si no funciona el escaneo</li>
            </ul>
          </div>

          {/* Botones */}
          <div className="modal-actions">
            <button onClick={descargarQR} className="btn btn-primary">
              💾 Descargar QR
            </button>
            <button onClick={onClose} className="btn btn-secondary">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRModal;

