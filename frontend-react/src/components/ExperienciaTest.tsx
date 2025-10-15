import React, { useState, useEffect } from 'react';
import experienciaService from '../services/experienciaService';
import { ExperienciaListadoDTO, ExperienciaDetalleDTO } from '../types/experiencia.types';

const ExperienciaTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [experiencias, setExperiencias] = useState<ExperienciaListadoDTO[]>([]);
  const [selectedExperiencia, setSelectedExperiencia] = useState<ExperienciaDetalleDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test de conexión al montar el componente
  useEffect(() => {
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    try {
      setConnectionStatus('testing');
      const isConnected = await experienciaService.testConnection();
      setConnectionStatus(isConnected ? 'success' : 'error');
      
      if (isConnected) {
        loadExperiencias();
      }
    } catch (error) {
      setConnectionStatus('error');
      setError('Error de conexión con el backend');
    }
  };

  const loadExperiencias = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await experienciaService.getAllExperiencias({ size: 5 });
      setExperiencias(response.content);
      
      console.log('📊 Experiencias loaded:', response);
    } catch (error: any) {
      setError(`Error cargando experiencias: ${error.message}`);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExperienciaDetail = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const detail = await experienciaService.getExperienciaById(id);
      setSelectedExperiencia(detail);
      
      console.log('📋 Experiencia detail loaded:', detail);
    } catch (error: any) {
      setError(`Error cargando detalle: ${error.message}`);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'testing': return 'orange';
      case 'success': return 'green';
      case 'error': return 'red';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'testing': return '🔄 Probando conexión...';
      case 'success': return '✅ Conexión exitosa';
      case 'error': return '❌ Error de conexión';
    }
  };

  return (
    <div className="experiencia-test" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>🧪 Test de Conexión - ExperienciaService</h2>
      
      {/* Estado de conexión */}
      <div style={{ 
        padding: '10px', 
        borderRadius: '5px', 
        backgroundColor: '#f5f5f5',
        border: `2px solid ${getConnectionStatusColor()}`,
        marginBottom: '20px'
      }}>
        <h3 style={{ color: getConnectionStatusColor() }}>
          {getConnectionStatusText()}
        </h3>
        <p><strong>Backend URL:</strong> http://localhost:9090/api/experiencias</p>
      </div>

      {/* Botones de acción */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testBackendConnection}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#4A90E2',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 Probar Conexión
        </button>
        
        <button 
          onClick={loadExperiencias}
          disabled={connectionStatus !== 'success' || loading}
          style={{ 
            padding: '10px 20px',
            backgroundColor: connectionStatus === 'success' ? '#28A745' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: connectionStatus === 'success' ? 'pointer' : 'not-allowed'
          }}
        >
          📋 Cargar Experiencias
        </button>
      </div>

      {/* Errores */}
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <p>🔄 Cargando...</p>
        </div>
      )}

      {/* Lista de experiencias */}
      {experiencias.length > 0 && (
        <div>
          <h3>📋 Experiencias Encontradas ({experiencias.length})</h3>
          <div style={{ display: 'grid', gap: '15px' }}>
            {experiencias.map((exp) => (
              <div 
                key={exp.id}
                onClick={() => loadExperienciaDetail(exp.id)}
                style={{ 
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                  {exp.titulo}
                </h4>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Precio:</strong> {exp.precio} {exp.moneda}
                </p>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Ubicación:</strong> {exp.ubicacion.ciudad}, {exp.ubicacion.pais}
                </p>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Categoría:</strong> {exp.categoria}
                </p>
                {exp.tags.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    {exp.tags.map((tag, index) => (
                      <span 
                        key={index}
                        style={{ 
                          display: 'inline-block',
                          padding: '2px 8px',
                          margin: '2px',
                          backgroundColor: '#e9ecef',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#495057'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p style={{ 
                  margin: '10px 0 0 0', 
                  fontSize: '12px', 
                  color: '#28A745',
                  fontWeight: 'bold'
                }}>
                  👆 Click para ver detalle
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detalle de experiencia seleccionada */}
      {selectedExperiencia && (
        <div style={{ 
          marginTop: '30px',
          padding: '20px',
          border: '2px solid #4A90E2',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa'
        }}>
          <h3>🔍 Detalle de Experiencia</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            <p><strong>ID:</strong> {selectedExperiencia.id}</p>
            <p><strong>Título:</strong> {selectedExperiencia.titulo}</p>
            <p><strong>Descripción:</strong> {selectedExperiencia.descripcion}</p>
            <p><strong>Precio:</strong> {selectedExperiencia.precio} {selectedExperiencia.moneda}</p>
            <p><strong>Categoría:</strong> {selectedExperiencia.categoria}</p>
            <p><strong>Ubicación:</strong> {selectedExperiencia.ubicacion.ciudad}, {selectedExperiencia.ubicacion.pais}</p>
            
            {selectedExperiencia.salidas.length > 0 && (
              <div>
                <strong>Salidas disponibles ({selectedExperiencia.salidas.length}):</strong>
                <ul style={{ marginTop: '10px' }}>
                  {selectedExperiencia.salidas.map((salida) => (
                    <li key={salida.id} style={{ margin: '5px 0' }}>
                      📅 {new Date(salida.fechaInicio).toLocaleDateString()} - 
                      👥 {salida.capacidadDisponible}/{salida.capacidadTotal} disponibles
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setSelectedExperiencia(null)}
            style={{ 
              marginTop: '15px',
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ❌ Cerrar Detalle
          </button>
        </div>
      )}
    </div>
  );
};

export default ExperienciaTest;