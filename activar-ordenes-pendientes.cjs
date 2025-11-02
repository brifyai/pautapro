
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
    
    console.log(`📋 Se encontraron ${pendientes.length} órdenes pendientes`);
    
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
          console.log(`❌ Error activando orden ${orden.id_ordenes_de_comprar}: ${updateError.message}`);
          errores++;
        } else {
          console.log(`✅ Orden ${orden.id_ordenes_de_comprar} activada`);
          activadas++;
        }
      } catch (e) {
        console.log(`❌ Error procesando orden ${orden.id_ordenes_de_comprar}: ${e.message}`);
        errores++;
      }
    }
    
    console.log(`\n🎉 PROCESO COMPLETADO:`);
    console.log(`   ✅ Órdenes activadas: ${activadas}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   📊 Total procesadas: ${pendientes.length}`);
    
    // Verificar resultado
    const { data: resultado } = await supabase
      .from('ordenesdepublicidad')
      .select('estado');
    
    const conteoFinal = {};
    resultado.forEach(orden => {
      conteoFinal[orden.estado] = (conteoFinal[orden.estado] || 0) + 1;
    });
    
    console.log(`\n📊 ESTADO FINAL DE ÓRDENES:`);
    Object.entries(conteoFinal).forEach(([estado, count]) => {
      console.log(`   ${estado}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Error en proceso de activación:', error.message);
  }
}

// Ejecutar activación
activarOrdenesPendientes();
