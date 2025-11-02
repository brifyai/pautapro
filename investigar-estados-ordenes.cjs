const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 INVESTIGANDO ESTADOS DE ÓRDENES');
console.log('===================================\n');

async function investigarEstadosOrdenes() {
  try {
    console.log('📊 Analizando todos los estados de las órdenes...\n');

    // 1. Verificar todos los estados posibles
    console.log('1️⃣ DISTRIBUCIÓN COMPLETA DE ESTADOS:');
    
    const { data: allOrders, error: allOrdersError } = await supabase
      .from('ordenesdepublicidad')
      .select('estado, id_ordenes_de_comprar, created_at');

    if (allOrdersError) {
      console.log(`   ❌ Error obteniendo órdenes: ${allOrdersError.message}`);
      return;
    }

    // Contar todos los estados
    const estadoCounts = {};
    allOrders?.forEach(order => {
      const estado = order.estado || 'sin_estado';
      estadoCounts[estado] = (estadoCounts[estado] || 0) + 1;
    });

    console.log('   📈 Estados encontrados:');
    Object.entries(estadoCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([estado, count]) => {
        console.log(`      ${estado}: ${count} órdenes`);
      });

    // 2. Verificar órdenes recientes
    console.log('\n2️⃣ ÓRDENES RECIENTES (últimas 10):');
    
    const { data: recentOrders, error: recentError } = await supabase
      .from('ordenesdepublicidad')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      console.log(`   ❌ Error obteniendo órdenes recientes: ${recentError.message}`);
    } else {
      console.log('   📅 Últimas 10 órdenes creadas:');
      recentOrders?.forEach((order, index) => {
        const fecha = new Date(order.created_at).toLocaleDateString('es-ES');
        console.log(`      ${index + 1}. ID: ${order.id_ordenes_de_comprar} | Estado: ${order.estado} | Fecha: ${fecha}`);
      });
    }

    // 3. Verificar si hay órdenes en estados de producción
    console.log('\n3️⃣ ÓRDENES EN ESTADOS DE PRODUCCIÓN:');
    
    const productionStates = ['produccion', 'producción', 'en_produccion', 'en_producción', 'produciendo', 'manufactura'];
    let productionOrders = [];

    for (const state of productionStates) {
      const { data: orders, error } = await supabase
        .from('ordenesdepublicidad')
        .select('id_ordenes_de_comprar, estado, created_at')
        .eq('estado', state);

      if (!error && orders && orders.length > 0) {
        productionOrders.push(...orders.map(o => ({...o, estado_buscado: state})));
      }
    }

    if (productionOrders.length > 0) {
      console.log(`   ✅ Se encontraron ${productionOrders.length} órdenes en producción:`);
      productionOrders.forEach(order => {
        console.log(`      ID: ${order.id_ordenes_de_comprar} | Estado: ${order.estado} (buscado como: ${order.estado_buscado})`);
      });
    } else {
      console.log('   ❌ No se encontraron órdenes en estados de producción');
    }

    // 4. Verificar estados similares y posibles errores de tipeo
    console.log('\n4️⃣ ANÁLISIS DE ESTADOS (posibles variaciones):');
    
    const uniqueStates = Object.keys(estadoCounts);
    console.log('   🔍 Estados únicos encontrados:');
    uniqueStates.forEach(estado => {
      console.log(`      - "${estado}"`);
    });

    // 5. Verificar estructura completa de una orden muestra
    console.log('\n5️⃣ ESTRUCTURA DE UNA ORDEN MUESTRA:');
    
    if (recentOrders && recentOrders.length > 0) {
      const sampleOrder = recentOrders[0];
      console.log('   📋 Campos disponibles:');
      Object.keys(sampleOrder).forEach(key => {
        const value = sampleOrder[key];
        const displayValue = typeof value === 'string' && value.length > 50 
          ? value.substring(0, 50) + '...' 
          : value;
        console.log(`      ${key}: ${displayValue}`);
      });
    }

    // 6. Verificar si hay campos de estado alternativos
    console.log('\n6️⃣ VERIFICANDO CAMPOS DE ESTADO ALTERNATIVOS:');
    
    const possibleStateFields = ['estado', 'status', 'state', 'situacion', 'condicion', 'estado_orden'];
    
    for (const field of possibleStateFields) {
      try {
        const { data, error } = await supabase
          .from('ordenesdepublicidad')
          .select(field)
          .limit(1);

        if (!error && data && data.length > 0) {
          const hasData = data[0][field] !== null && data[0][field] !== undefined;
          if (hasData) {
            console.log(`   ✅ Campo "${field}" tiene datos: ${data[0][field]}`);
          }
        }
      } catch (e) {
        // Campo no existe, ignorar
      }
    }

    // 7. Recomendaciones
    console.log('\n💡 ANÁLISIS Y RECOMENDACIONES:');
    console.log('================================');
    
    const totalOrders = allOrders?.length || 0;
    const hasProductionOrders = productionOrders.length > 0;
    
    if (totalOrders > 0 && !hasProductionOrders) {
      console.log('📊 SITUACIÓN ACTUAL:');
      console.log(`   - Total órdenes: ${totalOrders}`);
      console.log(`   - Órdenes en producción: 0`);
      console.log('   - Todas las órdenes están en estados iniciales o finales');
      
      console.log('\n🔍 POSIBLES CAUSAS:');
      console.log('   1. Las órdenes son antiguas y ya finalizaron');
      console.log('   2. El flujo de producción no se está utilizando');
      console.log('   3. Los nombres de estados son diferentes a los esperados');
      console.log('   4. Las órdenes se crean pero no avanzan en el flujo');
      
      console.log('\n🎯 RECOMENDACIONES:');
      console.log('   1. Verificar el flujo de estados en el sistema');
      console.log('   2. Actualizar algunas órdenes a estado "produccion" para prueba');
      console.log('   3. Revisar si el sistema de gestión de órdenes está operativo');
    }

    console.log('\n✅ Investigación completada');

  } catch (error) {
    console.error('❌ Error en investigación:', error.message);
  }
}

investigarEstadosOrdenes();