
import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import './GestionOrdenes.css';

const GestionOrdenes = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('pendiente');

  useEffect(() => {
    cargarOrdenes();
  }, [filtroEstado]);

  const cargarOrdenes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ordenesdepublicidad')
        .select(`
          id_ordenes_de_comprar,
          estado,
          created_at,
          fecha_orden,
          fecha_ejecucion,
          monto_total,
          clientes(nombrecliente),
          campania(nombrecampania)
        `)
        .eq('estado', filtroEstado)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrdenes(data || []);
    } catch (error) {
      console.error('Error cargando órdenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (idOrden, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from('ordenesdepublicidad')
        .update({ 
          estado: nuevoEstado,
          updated_at: new Date().toISOString()
        })
        .eq('id_ordenes_de_comprar', idOrden);

      if (error) throw error;
      
      // Recargar lista
      await cargarOrdenes();
      alert(`Orden ${idOrden} cambiada a estado: ${nuevoEstado}`);
    } catch (error) {
      console.error('Error cambiando estado:', error);
      alert('Error al cambiar estado');
    }
  };

  const activarTodasPendientes = async () => {
    if (!confirm('¿Está seguro de activar todas las órdenes pendientes?')) return;
    
    try {
      const { error } = await supabase
        .from('ordenesdepublicidad')
        .update({ 
          estado: 'activo',
          updated_at: new Date().toISOString(),
          fecha_orden: new Date().toISOString().split('T')[0]
        })
        .eq('estado', 'pendiente');

      if (error) throw error;
      
      await cargarOrdenes();
      alert('Todas las órdenes pendientes han sido activadas');
    } catch (error) {
      console.error('Error activando órdenes:', error);
      alert('Error al activar órdenes');
    }
  };

  const estadosDisponibles = ['pendiente', 'activo', 'en_produccion', 'completado', 'cancelado'];

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="gestion-ordenes">
      <div className="header">
        <h2>Gestión de Órdenes</h2>
        <div className="filtros">
          <select 
            value={filtroEstado} 
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            {estadosDisponibles.map(estado => (
              <option key={estado} value={estado}>
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
              </option>
            ))}
          </select>
          
          {filtroEstado === 'pendiente' && ordenes.length > 0 && (
            <button 
              className="btn-activar-todas"
              onClick={activarTodasPendientes}
            >
              Activar Todas ({ordenes.length})
            </button>
          )}
        </div>
      </div>

      <div className="ordenes-lista">
        {ordenes.length === 0 ? (
          <div className="no-ordenes">
            No hay órdenes con estado "{filtroEstado}"
          </div>
        ) : (
          <table className="ordenes-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Campaña</th>
                <th>Monto</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map(orden => (
                <tr key={orden.id_ordenes_de_comprar}>
                  <td>{orden.id_ordenes_de_comprar}</td>
                  <td>{orden.clientes?.nombrecliente || 'N/A'}</td>
                  <td>{orden.campania?.nombrecampania || 'N/A'}</td>
                  <td>
                    {orden.monto_total 
                      ? `$${parseInt(orden.monto_total).toLocaleString()}`
                      : 'N/A'
                    }
                  </td>
                  <td>
                    {new Date(orden.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td>
                    <select 
                      value={orden.estado}
                      onChange={(e) => cambiarEstado(orden.id_ordenes_de_comprar, e.target.value)}
                      className="estado-select"
                    >
                      {estadosDisponibles.map(estado => (
                        <option key={estado} value={estado}>
                          {estado.charAt(0).toUpperCase() + estado.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GestionOrdenes;
