const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔄 SISTEMA DE GESTIÓN DE ESTADOS DE ÓRDENES');
console.log('==========================================\n');

async function crearSistemaGestionOrdenes() {
  try {
    console.log('📊 ANALIZANDO SISTEMA DE GESTIÓN DE ÓRDENES...\n');

    // 1. Análisis actual de estados
    console.log('1️⃣ ANÁLISIS ACTUAL DE ESTADOS DE ÓRDENES:');
    
    const { data: ordenes, error } = await supabase
      .from('ordenesdepublicidad')
      .select('id_ordenes_de_comprar, estado, created_at, fecha_orden, fecha_ejecucion, monto_total')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.log(`   ❌ Error obteniendo órdenes: ${error.message}`);
      return;
    }

    // Contar estados actuales
    const estadosConteo = {};
    ordenes?.forEach(orden => {
      const estado = orden.estado || 'sin_estado';
      estadosConteo[estado] = (estadosConteo[estado] || 0) + 1;
    });

    console.log('   📈 Distribución actual de estados:');
    Object.entries(estadosConteo).forEach(([estado, count]) => {
      console.log(`      ${estado}: ${count} órdenes`);
    });

    // 2. Mostrar órdenes pendientes
    console.log('\n2️⃣ ÓRDENES PENDIENTES PARA ACTIVAR:');
    
    const ordenesPendientes = ordenes?.filter(o => o.estado === 'pendiente') || [];
    
    if (ordenesPendientes.length > 0) {
      console.log(`   📋 Se encontraron ${ordenesPendientes.length} órdenes pendientes:`);
      ordenesPendientes.forEach((orden, index) => {
        const fecha = new Date(orden.created_at).toLocaleDateString('es-ES');
        const monto = orden.monto_total ? `$${parseInt(orden.monto_total).toLocaleString()}` : 'Sin monto';
        console.log(`      ${index + 1}. ID: ${orden.id_ordenes_de_comprar} | Fecha: ${fecha} | Monto: ${monto}`);
      });
    } else {
      console.log('   ℹ️  No hay órdenes pendientes para activar');
    }

    // 3. Crear script para activar órdenes
    console.log('\n3️⃣ CREANDO SCRIPT PARA GESTIONAR ESTADOS:');
    
    const scriptGestion = `
// ========================================
// SISTEMA DE GESTIÓN DE ESTADOS DE ÓRDENES
// ========================================

// 1. FUNCIÓN PARA ACTIVAR ÓRDENES PENDIENTES
async function activarOrdenesPendientes() {
  try {
    // Obtener órdenes pendientes
    const { data: pendientes, error } = await supabase
      .from('ordenesdepublicidad')
      .select('*')
      .eq('estado', 'pendiente');
    
    if (error) throw error;
    
    console.log(\`📋 Se encontraron \${pendientes.length} órdenes pendientes\`);
    
    // Activar todas las órdenes pendientes
    for (const orden of pendientes) {
      const { error: updateError } = await supabase
        .from('ordenesdepublicidad')
        .update({ 
          estado: 'activo',
          updated_at: new Date().toISOString(),
          fecha_orden: new Date().toISOString().split('T')[0] // Fecha actual
        })
        .eq('id_ordenes_de_comprar', orden.id_ordenes_de_comprar);
      
      if (updateError) {
        console.log(\`❌ Error activando orden \${orden.id_ordenes_de_comprar}: \${updateError.message}\`);
      } else {
        console.log(\`✅ Orden \${orden.id_ordenes_de_comprar} activada\`);
      }
    }
    
    console.log('🎉 Proceso de activación completado');
  } catch (error) {
    console.error('❌ Error activando órdenes:', error.message);
  }
}

// 2. FUNCIÓN PARA CAMBIAR ESTADO DE UNA ORDEN ESPECÍFICA
async function cambiarEstadoOrden(idOrden, nuevoEstado) {
  try {
    const { data, error } = await supabase
      .from('ordenesdepublicidad')
      .update({ 
        estado: nuevoEstado,
        updated_at: new Date().toISOString()
      })
      .eq('id_ordenes_de_comprar', idOrden)
      .select();
    
    if (error) throw error;
    
    console.log(\`✅ Orden \${idOrden} cambiada a estado: \${nuevoEstado}\`);
    return data;
  } catch (error) {
    console.error(\`❌ Error cambiando estado orden \${idOrden}:\`, error.message);
    throw error;
  }
}

// 3. FUNCIÓN PARA OBTENER ESTADÍSTICAS DE ESTADOS
async function getEstadosOrdenes() {
  try {
    const { data, error } = await supabase
      .from('ordenesdepublicidad')
      .select('estado');
    
    if (error) throw error;
    
    const conteo = {};
    data.forEach(orden => {
      conteo[orden.estado] = (conteo[orden.estado] || 0) + 1;
    });
    
    return conteo;
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error.message);
    return {};
  }
}

// 4. FLUJO DE ESTADOS PERMITIDOS
const flujoEstados = {
  'pendiente': ['activo', 'cancelado'],
  'activo': ['en_produccion', 'completado', 'cancelado'],
  'en_produccion': ['completado', 'cancelado'],
  'completado': [], // Estado final
  'cancelado': []   // Estado final
};

// 5. VALIDAR CAMBIO DE ESTADO
function validarCambioEstado(estadoActual, nuevoEstado) {
  const estadosPermitidos = flujoEstados[estadoActual] || [];
  return estadosPermitidos.includes(nuevoEstado);
}

// Exportar funciones para uso en el frontend
export {
  activarOrdenesPendientes,
  cambiarEstadoOrden,
  getEstadosOrdenes,
  flujoEstados,
  validarCambioEstado
};
`;

    // Guardar script de gestión
    const fs = require('fs');
    fs.writeFileSync('src/services/ordenEstadoService.js', scriptGestion);
    console.log('   ✅ Script de gestión creado: src/services/ordenEstadoService.js');

    // 4. Crear componente frontend para gestión
    console.log('\n4️⃣ CREANDO COMPONENTE FRONTEND PARA GESTIÓN:');
    
    const componenteGestion = `
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
        .select(\`
          id_ordenes_de_comprar,
          estado,
          created_at,
          fecha_orden,
          fecha_ejecucion,
          monto_total,
          clientes(nombrecliente),
          campania(nombrecampania)
        \`)
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
      alert(\`Orden \${idOrden} cambiada a estado: \${nuevoEstado}\`);
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
                      ? \`$\${parseInt(orden.monto_total).toLocaleString()}\`
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
`;

    // Crear directorio si no existe
    if (!fs.existsSync('src/pages/ordenes')) {
      fs.mkdirSync('src/pages/ordenes');
    }

    fs.writeFileSync('src/pages/ordenes/GestionOrdenes.jsx', componenteGestion);
    console.log('   ✅ Componente de gestión creado: src/pages/ordenes/GestionOrdenes.jsx');

    // 5. Crear CSS para el componente
    const cssGestion = `
.gestion-ordenes {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.gestion-ordenes .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.gestion-ordenes h2 {
  color: #2c3e50;
  margin: 0;
}

.filtros {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filtros select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.btn-activar-todas {
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-activar-todas:hover {
  background: #218838;
}

.ordenes-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.ordenes-table th,
.ordenes-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.ordenes-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.ordenes-table tr:hover {
  background: #f8f9fa;
}

.estado-select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.no-ordenes {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-style: italic;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}
`;

    fs.writeFileSync('src/pages/ordenes/GestionOrdenes.css', cssGestion);
    console.log('   ✅ CSS creado: src/pages/ordenes/GestionOrdenes.css');

    // 6. Crear script para activación masiva
    console.log('\n5️⃣ CREANDO SCRIPT DE ACTIVACIÓN MASIVA:');
    
    const scriptActivacion = `
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

async function activarOrdenesPendientes() {
  try {
    console.log('🔄 ACTIVANDO ÓRDENES PENDIENTES...');
    
    // Obtener órdenes pendientes
    const { data: pendientes, error } = await supabase
      .from('ordenesdepublicidad')
      .select('id_ordenes_de_comprar, estado, created_at')
      .eq('estado', 'pendiente');
    
    if (error) {
      console.error('❌ Error obteniendo órdenes pendientes:', error.message);
      return;
    }
    
    if (!pendientes || pendientes.length === 0) {
      console.log('ℹ️  No hay órdenes pendientes para activar');
      return;
    }
    
    console.log(\`📋 Se encontraron \${pendientes.length} órdenes pendientes\`);
    
    // Activar todas las órdenes pendientes
    let activadas = 0;
    let errores = 0;
    
    for (const orden of pendientes) {
      try {
        const { error: updateError } = await supabase
          .from('ordenesdepublicidad')
          .update({ 
            estado: 'activo',
            updated_at: new Date().toISOString(),
            fecha_orden: new Date().toISOString().split('T')[0]
          })
          .eq('id_ordenes_de_comprar', orden.id_ordenes_de_comprar);
        
        if (updateError) {
          console.log(\`❌ Error activando orden \${orden.id_ordenes_de_comprar}: \${updateError.message}\`);
          errores++;
        } else {
          console.log(\`✅ Orden \${orden.id_ordenes_de_comprar} activada\`);
          activadas++;
        }
      } catch (e) {
        console.log(\`❌ Error procesando orden \${orden.id_ordenes_de_comprar}: \${e.message}\`);
        errores++;
      }
    }
    
    console.log(\`\\n🎉 PROCESO COMPLETADO:\`);
    console.log(\`   ✅ Órdenes activadas: \${activadas}\`);
    console.log(\`   ❌ Errores: \${errores}\`);
    console.log(\`   📊 Total procesadas: \${pendientes.length}\`);
    
    // Verificar resultado
    const { data: resultado } = await supabase
      .from('ordenesdepublicidad')
      .select('estado');
    
    const conteoFinal = {};
    resultado.forEach(orden => {
      conteoFinal[orden.estado] = (conteoFinal[orden.estado] || 0) + 1;
    });
    
    console.log(\`\\n📊 ESTADO FINAL DE ÓRDENES:\`);
    Object.entries(conteoFinal).forEach(([estado, count]) => {
      console.log(\`   \${estado}: \${count}\`);
    });
    
  } catch (error) {
    console.error('❌ Error en proceso de activación:', error.message);
  }
}

// Ejecutar activación
activarOrdenesPendientes();
`;

    fs.writeFileSync('activar-ordenes-pendientes.cjs', scriptActivacion);
    console.log('   ✅ Script de activación creado: activar-ordenes-pendientes.cjs');

    // 7. Resumen y recomendaciones
    console.log('\n6️⃣ RESUMEN DEL SISTEMA DE GESTIÓN CREADO:');
    
    console.log('   🎯 SISTEMA COMPLETO DE GESTIÓN DE ÓRDENES:');
    console.log('      1. ✅ Servicio de gestión de estados (ordenEstadoService.js)');
    console.log('      2. ✅ Componente frontend para gestión (GestionOrdenes.jsx)');
    console.log('      3. ✅ Estilos visuales (GestionOrdenes.css)');
    console.log('      4. ✅ Script de activación masiva (activar-ordenes-pendientes.cjs)');
    
    console.log('\n   🔧 OPCIONES PARA GESTIONAR ÓRDENES:');
    console.log('      OPCIÓN 1 - Interface Web:');
    console.log('         • Agregar el componente GestionOrdenes al routing');
    console.log('         • Acceder a la interfaz para gestionar estados manualmente');
    console.log('         • Usar botón "Activar Todas" para activación masiva');
    
    console.log('\n      OPCIÓN 2 - Script Automático:');
    console.log('         • Ejecutar: node activar-ordenes-pendientes.cjs');
    console.log('         • Activará automáticamente todas las órdenes pendientes');
    console.log('         • Proceso rápido y sin intervención manual');
    
    console.log('\n      OPCIÓN 3 - API Endpoint:');
    console.log('         • Usar las funciones del servicio ordenEstadoService');
    console.log('         • Integrar con botones existentes en la aplicación');
    console.log('         • Crear endpoints específicos para gestión de estados');

    console.log('\n   📋 PASOS RECOMENDADOS:');
    console.log('      1. Para activar AHORA: node activar-ordenes-pendientes.cjs');
    console.log('      2. Para gestión continua: Integrar componente GestionOrdenes');
    console.log('      3. Para control total: Usar servicio ordenEstadoService');

    console.log('\n✅ SISTEMA DE GESTIÓN COMPLETO CREADO');

  } catch (error) {
    console.error('❌ Error creando sistema de gestión:', error.message);
  }
}

crearSistemaGestionOrdenes();