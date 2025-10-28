// TurisNow: Calendario de Disponibilidad Component
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarioDisponibilidad.css';

export interface SalidaCalendario {
  id: number;
  fechaInicio: string;
  capacidadDisponible: number;
  capacidadTotal: number;
}

interface CalendarioDisponibilidadProps {
  salidas: SalidaCalendario[];
  onDateSelect?: (fecha: Date, salidaId: number | null) => void;
  selectedDate?: Date | null;
  className?: string;
}

const CalendarioDisponibilidad: React.FC<CalendarioDisponibilidadProps> = ({
  salidas,
  onDateSelect,
  selectedDate,
  className = ''
}) => {
  const [date, setDate] = useState<Date>(selectedDate || new Date());

  // Crear un mapa de fechas con disponibilidad
  const fechasConSalidas = new Map<string, SalidaCalendario>();
  salidas.forEach(salida => {
    const fecha = new Date(salida.fechaInicio);
    const fechaKey = fecha.toISOString().split('T')[0];
    fechasConSalidas.set(fechaKey, salida);
  });

  // Obtener el estado de disponibilidad para una fecha
  const getDisponibilidadStatus = (fecha: Date): 'disponible' | 'limitado' | 'sin-cupos' | 'no-disponible' => {
    const fechaKey = fecha.toISOString().split('T')[0];
    const salida = fechasConSalidas.get(fechaKey);

    if (!salida) return 'no-disponible';

    const porcentajeDisponible = (salida.capacidadDisponible / salida.capacidadTotal) * 100;

    if (salida.capacidadDisponible === 0) return 'sin-cupos';
    if (porcentajeDisponible <= 25) return 'limitado';
    return 'disponible';
  };

  // Aplicar clases personalizadas a las tiles del calendario
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // No mostrar fechas pasadas
    if (date < today) return 'fecha-pasada';

    const status = getDisponibilidadStatus(date);
    const classes = [`disponibilidad-${status}`];

    // Añadir clase si es la fecha seleccionada
    if (selectedDate) {
      const selectedKey = selectedDate.toISOString().split('T')[0];
      const dateKey = date.toISOString().split('T')[0];
      if (selectedKey === dateKey) {
        classes.push('fecha-seleccionada');
      }
    }

    return classes.join(' ');
  };

  // Deshabilitar fechas sin disponibilidad o pasadas
  const tileDisabled = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Deshabilitar fechas pasadas
    if (date < today) return true;

    const status = getDisponibilidadStatus(date);
    return status === 'sin-cupos' || status === 'no-disponible';
  };

  // Contenido personalizado para cada tile
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return null;

    const fechaKey = date.toISOString().split('T')[0];
    const salida = fechasConSalidas.get(fechaKey);

    if (!salida) return null;

    return (
      <div className="tile-indicator">
        <span className="cupos-disponibles">
          {salida.capacidadDisponible}/{salida.capacidadTotal}
        </span>
      </div>
    );
  };

  // Handler para cuando se selecciona una fecha
  const handleDateChange = (value: any) => {
    if (value instanceof Date) {
      setDate(value);
      
      const fechaKey = value.toISOString().split('T')[0];
      const salida = fechasConSalidas.get(fechaKey);

      if (onDateSelect) {
        onDateSelect(value, salida?.id || null);
      }
    }
  };

  return (
    <div className={`calendario-disponibilidad ${className}`}>
      <div className="calendario-header">
        <h3>📅 Selecciona una fecha</h3>
        <div className="leyenda">
          <div className="leyenda-item">
            <span className="leyenda-color disponible"></span>
            <span className="leyenda-texto">Disponible</span>
          </div>
          <div className="leyenda-item">
            <span className="leyenda-color limitado"></span>
            <span className="leyenda-texto">Cupos limitados</span>
          </div>
          <div className="leyenda-item">
            <span className="leyenda-color sin-cupos"></span>
            <span className="leyenda-texto">Sin cupos</span>
          </div>
        </div>
      </div>

      <Calendar
        onChange={handleDateChange}
        value={date}
        locale="es-ES"
        minDate={new Date()}
        tileClassName={tileClassName}
        tileDisabled={tileDisabled}
        tileContent={tileContent}
        showNeighboringMonth={false}
        prev2Label={null}
        next2Label={null}
      />

      {selectedDate && fechasConSalidas.get(selectedDate.toISOString().split('T')[0]) && (
        <div className="fecha-seleccionada-info">
          <p className="info-titulo">Fecha seleccionada:</p>
          <p className="info-fecha">
            {selectedDate.toLocaleDateString('es-AR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          {(() => {
            const salida = fechasConSalidas.get(selectedDate.toISOString().split('T')[0]);
            if (salida) {
              return (
                <p className="info-cupos">
                  <strong>{salida.capacidadDisponible}</strong> cupos disponibles de <strong>{salida.capacidadTotal}</strong>
                </p>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
};

export default CalendarioDisponibilidad;
