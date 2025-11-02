
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
    
    console.log(`📋 Se encontraron ${pendientes.length} órdenes pendientes`);
    
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
        console.log(`❌ Error activando orden ${orden.id_ordenes_de_comprar}: ${updateError.message}`);
      } else {
        console.log(`✅ Orden ${orden.id_ordenes_de_comprar} activada`);
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
    
    console.log(`✅ Orden ${idOrden} cambiada a estado: ${nuevoEstado}`);
    return data;
  } catch (error) {
    console.error(`❌ Error cambiando estado orden ${idOrden}:`, error.message);
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
