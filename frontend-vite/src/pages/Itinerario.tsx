import React, { useEffect, useMemo, useState } from 'react';
import { itinerarioService, type ItinerarioRequest, type ItinerarioResponse } from '../services/itinerarioService';
import experienciaService from '../services/experienciaService';
import type { ExperienciaDetalleDTO, ExperienciaListadoDTO, SalidaDTO } from '../types/experiencia.types';
import '../assets/css/itinerario.css';

const CATEGORIAS_INTERESES = [
  'cultura',
  'gastronomía',
  'aventura',
  'naturaleza',
  'historia',
  'familia',
  'playa',
  'montaña'
];

const TRANSPORTE_OPTIONS = [
  { value: 'a pie', label: 'A pie' },
  { value: 'transporte publico', label: 'Transporte público' },
  { value: 'mixto', label: 'Mixto' }
];

type ItinerarioFormState = ItinerarioRequest & { intereses: string[] };

const Itinerario: React.FC = () => {
  const [catalogoLoading, setCatalogoLoading] = useState(true);
  const [catalogoError, setCatalogoError] = useState<string | null>(null);
  const [experiencias, setExperiencias] = useState<ExperienciaListadoDTO[]>([]);
  const [experienciaSeleccionada, setExperienciaSeleccionada] = useState<ExperienciaDetalleDTO | null>(null);
  const [salidaSeleccionada, setSalidaSeleccionada] = useState<SalidaDTO | null>(null);

  const [form, setForm] = useState<ItinerarioFormState>({
    experienciaId: 0,
    intereses: [],
    presupuesto: 'medio',
    nivelActividad: 'moderado',
    horaInicio: '09:00',
    horaFin: '19:00',
    puntoPartida: 'Centro',
    transporte: 'a pie'
  });

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ItinerarioResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarExperiencias = async () => {
      try {
        setCatalogoLoading(true);
        const { content } = await experienciaService.getAllExperiencias({ size: 50, page: 0 });
        setExperiencias(content);
      } catch (err: any) {
        console.error('Error cargando experiencias', err);
        setCatalogoError('No se pudieron cargar las experiencias disponibles.');
      } finally {
        setCatalogoLoading(false);
      }
    };

    cargarExperiencias();
  }, []);

  const normalizarFecha = (value?: string) => {
    if (!value) return '';
    return value.includes('T') ? value.split('T')[0] : value;
  };

  const formatFecha = (value?: string) => {
    if (!value) return 'Sin definir';
    try {
      const fecha = new Date(value.includes('T') ? value : `${value}T00:00:00`);
      return fecha.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return value;
    }
  };

  const handleExperienciaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setData(null);
    setError(null);

    if (!id) {
      setExperienciaSeleccionada(null);
      setSalidaSeleccionada(null);
      setForm(prev => ({ ...prev, experienciaId: 0, fechaInicio: undefined, fechaFin: undefined }));
      return;
    }

    setForm(prev => ({ ...prev, experienciaId: id }));

    try {
      const detalle = await experienciaService.getExperienciaById(id);
      setExperienciaSeleccionada(detalle);

      const primeraSalida = detalle.salidas?.[0] ?? null;
      setSalidaSeleccionada(primeraSalida);

      setForm(prev => ({
        ...prev,
        experienciaId: id,
        fechaInicio: primeraSalida ? normalizarFecha(primeraSalida.fechaInicio) : prev.fechaInicio,
        fechaFin: primeraSalida && !prev.fechaFin
          ? normalizarFecha(primeraSalida.fechaFin) || normalizarFecha(primeraSalida.fechaInicio)
          : prev.fechaFin,
        intereses: prev.intereses.length
          ? prev.intereses
          : (detalle.tags?.slice(0, 6) ?? [])
      }));
    } catch (err: any) {
      console.error('Error obteniendo experiencia', err);
      setError('No se pudo obtener la información de la experiencia seleccionada.');
    }
  };

  const handleSalidaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!experienciaSeleccionada) return;
    const salidaId = Number(e.target.value);
    const salida = experienciaSeleccionada.salidas.find(s => s.id === salidaId) || null;
    setSalidaSeleccionada(salida || null);
    setForm(prev => ({
      ...prev,
      fechaInicio: salida ? normalizarFecha(salida.fechaInicio) : prev.fechaInicio,
      fechaFin: salida ? normalizarFecha(salida.fechaFin) || normalizarFecha(salida.fechaInicio) : prev.fechaFin
    }));
  };

  const toggleInteres = (interes: string) => {
    setForm(prev => {
      const yaSeleccionado = prev.intereses.includes(interes);
      if (yaSeleccionado) {
        return {
          ...prev,
          intereses: prev.intereses.filter(item => item !== interes)
        };
      }
      if (prev.intereses.length >= 8) {
        return prev;
      }
      return {
        ...prev,
        intereses: [...prev.intereses, interes]
      };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const fechaInicioDisplay = useMemo(
    () => form.fechaInicio || normalizarFecha(salidaSeleccionada?.fechaInicio),
    [form.fechaInicio, salidaSeleccionada]
  );
  const fechaFinDisplay = useMemo(
    () => form.fechaFin || normalizarFecha(salidaSeleccionada?.fechaFin) || fechaInicioDisplay,
    [form.fechaFin, salidaSeleccionada, fechaInicioDisplay]
  );

  const descripcionResumida = useMemo(() => {
    if (!experienciaSeleccionada?.descripcion) return '';
    const texto = experienciaSeleccionada.descripcion.trim();
    return texto.length > 180 ? `${texto.slice(0, 180)}…` : texto;
  }, [experienciaSeleccionada]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setData(null);

    if (!form.experienciaId || form.experienciaId === 0) {
      setError('Selecciona una experiencia para generar el itinerario.');
      return;
    }

    setLoading(true);

    try {
      const payload: ItinerarioRequest = {
        ...form,
        fechaInicio: fechaInicioDisplay || undefined,
        fechaFin: fechaFinDisplay || undefined,
        intereses: form.intereses.length ? form.intereses : undefined
      };

      const response = await itinerarioService.generar(payload);
      setData(response);
    } catch (err: any) {
      console.error('Error generando itinerario', err);
      setError(err.response?.data?.message || err.message || 'Error al generar el itinerario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="itinerario-container">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-11 col-xl-10">
            <div className="text-center mb-5 text-white">
              <h1 className="display-5 fw-bold mb-3">
                <i className="bi bi-map me-2"></i>
                Planificador dinámico de itinerarios
              </h1>
              <p className="lead opacity-75">
                Selecciona una experiencia y deja que la IA construya un itinerario de 1 a 3 días alrededor de ella.
              </p>
            </div>

            <div className="card shadow-lg border-0 mb-4">
              <div className="card-body p-4 p-lg-5">
                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    <div className="col-12">
                      <label className="form-label fw-bold">
                        <i className="bi bi-compass text-primary me-2"></i>
                        Experiencia base
                      </label>
                      <select
                        className="form-select form-select-lg"
                        value={form.experienciaId || ''}
                        onChange={handleExperienciaChange}
                        required
                        disabled={catalogoLoading}
                      >
                        <option value="">Selecciona una experiencia...</option>
                        {experiencias.map(exp => (
                          <option key={exp.id} value={exp.id}>
                            {exp.titulo} • {exp.ubicacion.ciudad}, {exp.ubicacion.pais}
                          </option>
                        ))}
                      </select>
                      {catalogoLoading && (
                        <small className="text-muted d-block mt-2">
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Cargando catálogo...
                        </small>
                      )}
                      {catalogoError && (
                        <small className="text-danger d-block mt-2">{catalogoError}</small>
                      )}
                    </div>

                    {experienciaSeleccionada && (
                      <div className="col-12">
                        <div className="alert alert-light border shadow-sm">
                          <div className="d-flex justify-content-between flex-wrap gap-2">
                            <div>
                              <h5 className="fw-semibold mb-1">{experienciaSeleccionada.titulo}</h5>
                              {descripcionResumida && (
                                <p className="mb-2 text-muted small">{descripcionResumida}</p>
                              )}
                              <div className="d-flex flex-wrap gap-3 small text-muted">
                                <span><i className="bi bi-geo-alt-fill me-1"></i>{experienciaSeleccionada.ubicacion.ciudad}, {experienciaSeleccionada.ubicacion.pais}</span>
                                <span><i className="bi bi-tag me-1"></i>{experienciaSeleccionada.categoria}</span>
                                <span><i className="bi bi-cash-stack me-1"></i>{experienciaSeleccionada.precio} {experienciaSeleccionada.moneda}</span>
                              </div>
                            </div>
                            {experienciaSeleccionada.tags?.length > 0 && (
                              <div className="d-flex flex-wrap gap-2 align-items-start">
                                {experienciaSeleccionada.tags.slice(0, 6).map(tag => (
                                  <span key={tag} className="badge bg-primary-subtle text-primary">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {experienciaSeleccionada && (
                      <>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">
                            <i className="bi bi-calendar-event text-primary me-2"></i>
                            Salida sugerida (opcional)
                          </label>
                          <select
                            className="form-select"
                            value={salidaSeleccionada?.id || ''}
                            onChange={handleSalidaChange}
                          >
                            {(!experienciaSeleccionada.salidas || experienciaSeleccionada.salidas.length === 0) && (
                              <option value="">Sin salidas futuras registradas</option>
                            )}
                            {experienciaSeleccionada.salidas?.map(salida => (
                              <option key={salida.id} value={salida.id}>
                                {formatFecha(salida.fechaInicio)}
                                {salida.fechaFin ? ` → ${formatFecha(salida.fechaFin)}` : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-bold">
                            <i className="bi bi-calendar-check text-primary me-2"></i>
                            Ajustar fecha de inicio
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            name="fechaInicio"
                            value={fechaInicioDisplay || ''}
                            onChange={handleChange}
                          />
                          <small className="text-muted">Se utilizará la salida seleccionada si dejas este campo vacío.</small>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-bold">
                            <i className="bi bi-calendar2-week text-primary me-2"></i>
                            Ajustar fecha de fin
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            name="fechaFin"
                            value={fechaFinDisplay || ''}
                            onChange={handleChange}
                            min={fechaInicioDisplay || undefined}
                          />
                          <small className="text-muted">Si lo dejas vacío, se usará la fecha de la salida.</small>
                        </div>
                      </>
                    )}

                    <div className="col-md-4">
                      <label className="form-label fw-bold">
                        <i className="bi bi-cash-coin text-primary me-2"></i>
                        Presupuesto
                      </label>
                      <select
                        name="presupuesto"
                        className="form-select"
                        value={form.presupuesto}
                        onChange={handleChange}
                      >
                        <option value="bajo">Bajo</option>
                        <option value="medio">Medio</option>
                        <option value="alto">Alto</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-bold">
                        <i className="bi bi-activity text-primary me-2"></i>
                        Nivel de actividad
                      </label>
                      <select
                        name="nivelActividad"
                        className="form-select"
                        value={form.nivelActividad}
                        onChange={handleChange}
                      >
                        <option value="bajo">Bajo</option>
                        <option value="moderado">Moderado</option>
                        <option value="alto">Alto</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-bold">
                        <i className="bi bi-bus-front-fill text-primary me-2"></i>
                        Medio principal
                      </label>
                      <select
                        name="transporte"
                        className="form-select"
                        value={form.transporte}
                        onChange={handleChange}
                      >
                        {TRANSPORTE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        <i className="bi bi-clock-history text-primary me-2"></i>
                        Horario diario (inicio)
                      </label>
                      <input
                        type="time"
                        className="form-control"
                        name="horaInicio"
                        value={form.horaInicio || '09:00'}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        <i className="bi bi-clock text-primary me-2"></i>
                        Horario diario (fin)
                      </label>
                      <input
                        type="time"
                        className="form-control"
                        name="horaFin"
                        value={form.horaFin || '19:00'}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        <i className="bi bi-geo text-primary me-2"></i>
                        Punto de partida (opcional)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="puntoPartida"
                        value={form.puntoPartida || ''}
                        onChange={handleChange}
                        placeholder="Ej: Hotel Centro, Barrio Norte…"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        <i className="bi bi-bookmark-heart text-primary me-2"></i>
                        Intereses adicionales (máx. 8)
                      </label>
                      <div className="d-flex flex-wrap gap-2">
                        {CATEGORIAS_INTERESES.map(categoria => (
                          <button
                            type="button"
                            key={categoria}
                            className={`btn btn-sm ${form.intereses.includes(categoria) ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => toggleInteres(categoria)}
                          >
                            {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                          </button>
                        ))}
                      </div>
                      <small className="text-muted d-block mt-2">
                        Seleccionados: {form.intereses.length}/8
                      </small>
                    </div>
                  </div>

                  <div className="text-center mt-5">
                    <button
                      className="btn btn-primary btn-lg px-5"
                      type="submit"
                      disabled={loading || !form.experienciaId}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Generando itinerario...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-stars me-2"></i>
                          Generar itinerario
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-3"></i>
                <div>{error}</div>
              </div>
            )}

            {data && (
              <div className="card shadow-lg border-0 resultado-card">
                <div className="card-header bg-primary text-white p-4">
                  <div className="d-flex justify-content-between flex-wrap gap-2">
                    <div>
                      <h3 className="mb-1">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        Itinerario para {data.destino}
                      </h3>
                      <p className="mb-0 opacity-75">
                        {data.resumen?.dias ?? 1} {data.resumen?.dias === 1 ? 'día' : 'días'} de actividades
                        {fechaInicioDisplay && (
                          <> • {formatFecha(fechaInicioDisplay)} → {formatFecha(fechaFinDisplay)}</>
                        )}
                      </p>
                    </div>
                    <div className="text-end small">
                      <span className="badge bg-light text-primary">
                        Fuente: {data.fuenteModelo}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-body p-4 p-lg-5">
                  {data.resumen && (
                    <div className="mb-4">
                      <h5 className="text-primary mb-3">
                        <i className="bi bi-info-circle me-2"></i>
                        Resumen del enfoque
                      </h5>
                      <p className="mb-2 fw-semibold">{data.resumen.idea_general || 'Sin resumen disponible'}</p>
                      <div className="d-flex flex-wrap gap-3 small text-muted">
                        <span><i className="bi bi-person-walking me-1"></i>Nivel: {data.resumen.perfil?.nivel_actividad ?? 'desconocido'}</span>
                        <span><i className="bi bi-wallet2 me-1"></i>Presupuesto: {data.resumen.perfil?.presupuesto ?? 'desconocido'}</span>
                        <span><i className="bi bi-bicycle me-1"></i>Transporte: {data.resumen.perfil?.transporte ?? 'desconocido'}</span>
                      </div>
                      {data.resumen.consejos?.length > 0 && (
                        <ul className="mt-3 small text-muted">
                          {data.resumen.consejos.map((consejo, idx) => (
                            <li key={idx}>{consejo}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <h5 className="text-primary mb-3">
                    <i className="bi bi-list-check me-2"></i>
                    Plan día a día
                  </h5>
                  <div className="timeline">
                    {data.itinerario?.map(dia => (
                      <div key={dia.dia} className="timeline-item mb-4">
                        <div className="d-flex">
                          <div className="timeline-marker bg-primary text-white me-3">
                            {dia.dia}
                          </div>
                          <div className="timeline-content flex-grow-1">
                            <div className="card border-0 shadow-sm">
                              <div className="card-header bg-light fw-semibold">
                                Día {dia.dia} • {dia.rango_horario}
                              </div>
                              <div className="card-body">
                                {dia.bloques?.map((bloque, idx) => (
                                  <div key={`${dia.dia}-${idx}`} className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                      <h6 className="mb-1">{bloque.titulo}</h6>
                                      <span className="badge bg-secondary-subtle text-secondary">
                                        {bloque.inicio} - {bloque.fin}
                                      </span>
                                    </div>
                                    <p className="text-muted small mb-2">{bloque.descripcion_corta}</p>
                                    <div className="d-flex flex-wrap gap-3 small text-muted">
                                      {bloque.tipo && <span className="badge bg-primary-subtle text-primary text-uppercase">{bloque.tipo}</span>}
                                      {bloque.zona && <span><i className="bi bi-geo-alt me-1"></i>{bloque.zona}</span>}
                                      {bloque.duracion_min && <span><i className="bi bi-hourglass-split me-1"></i>{bloque.duracion_min} min</span>}
                                    </div>
                                    {bloque.traslado_prev && (
                                      <div className="alert alert-light border-start mt-3 py-2 small">
                                        <i className="bi bi-arrow-right-short me-2"></i>
                                        Traslado {bloque.traslado_prev.modo || 'desconocido'} •
                                        {' '}{bloque.traslado_prev.distancia_km_aprox ?? '–'} km •
                                        {' '}{bloque.traslado_prev.duracion_min_aprox ?? '–'} min
                                        {bloque.traslado_prev.nota && (<span className="ms-2">({bloque.traslado_prev.nota})</span>)}
                                      </div>
                                    )}
                                    {bloque.notas && <div className="alert alert-warning py-2 small mb-0"><i className="bi bi-info-circle me-2"></i>{bloque.notas}</div>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="row mt-4 g-4">
                    {data.alternativas?.length > 0 && (
                      <div className="col-md-6">
                        <div className="card h-100 border-0 shadow-sm">
                          <div className="card-body">
                            <h6 className="text-primary mb-3"><i className="bi bi-shuffle me-2"></i>Alternativas</h6>
                            <ul className="small mb-0">
                              {data.alternativas.map((alt, idx) => (
                                <li key={idx} className="mb-2">
                                  <strong>{alt.motivo}:</strong> {alt.sustituto}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                    {data.suposiciones?.length > 0 && (
                      <div className="col-md-6">
                        <div className="card h-100 border-0 shadow-sm">
                          <div className="card-body">
                            <h6 className="text-primary mb-3"><i className="bi bi-lightbulb me-2"></i>Suposiciones</h6>
                            <ul className="small mb-0">
                              {data.suposiciones.map((sup, idx) => (
                                <li key={idx}>{sup}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Itinerario;
