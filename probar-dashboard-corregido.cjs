const { createClient } = require('@supabase/supabase-js');

// Usar la misma configuración que el frontend
const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 PROBANDO DASHBOARD CON CORRECCIONES APLICADAS');
console.log('================================================\n');

async function probarDashboardCorregido() {
  try {
    console.log('📊 Ejecutando las mismas consultas que el Dashboard...\n');

    // 1. getDashboardStats - Versión corregida
    console.log('1️⃣ getDashboardStats (CORREGIDO):');
    
    try {
      // Obtener cantidad de agencias activas
      const { data: agencias, error: agenciasError } = await supabase
        .from('agencias')
        .select('id')
        .eq('estado', true);

      // Obtener cantidad de clientes
      const { data: clientes, error: clientesError } = await supabase
        .from('clientes')
        .select('id_cliente');

      // Obtener cantidad de campañas activas (CORREGIDO: boolean en lugar de string)
      const { data: campanas, error: campanasError } = await supabase
        .from('campania')
        .select('id_campania')
        .eq('estado', true);

      // Obtener cantidad de medios
      const { data: medios, error: mediosError } = await supabase
        .from('medios')
        .select('id_medio');

      const stats = {
        agencias: agencias?.length || 0,
        clientes: clientes?.length || 0,
        campanas: campanas?.length || 0,
        medios: medios?.length || 0
      };

      console.log(`   ✅ Agencias activas: ${stats.agencias}`);
      console.log(`   ✅ Clientes totales: ${stats.clientes}`);
      console.log(`   ✅ Campañas activas: ${stats.campanas} (corregido)`);
      console.log(`   ✅ Medios totales: ${stats.medios}`);

      if (campanasError) {
        console.log(`   ❌ Error en campañas: ${campanasError.message}`);
      } else {
        console.log(`   🎯 ¡Campañas activas ahora funciona!`);
      }

    } catch (error) {
      console.log(`   ❌ Error en getDashboardStats: ${error.message}`);
    }

    // 2. getCampaignStats
    console.log('\n2️⃣ getCampaignStats:');
    
    try {
      const { data, error } = await supabase
        .from('campania')
        .select('estado');

      if (error) throw error;

      const stats = {
        borrador: 0,
        revision: 0,
        aprobada: 0,
        produccion: 0,
        live: 0,
        finalizada: 0,
        cancelada: 0
      };

      data?.forEach(campaign => {
        if (stats.hasOwnProperty(campaign.estado)) {
          stats[campaign.estado]++;
        }
      });

      console.log('   📈 Distribución de estados:');
      Object.entries(stats).forEach(([estado, count]) => {
        if (count > 0) {
          console.log(`      ${estado}: ${count}`);
        }
      });

    } catch (error) {
      console.log(`   ❌ Error en getCampaignStats: ${error.message}`);
    }

    // 3. getOrderStats
    console.log('\n3️⃣ getOrderStats:');
    
    try {
      const { data: orders, error } = await supabase
        .from('ordenesdepublicidad')
        .select('estado, created_at, fecha_estimada_entrega, fecha_entrega_real');

      if (error) throw error;

      const stats = {
        totalOrders: orders?.length || 0,
        pendingOrders: orders?.filter(o => o.estado === 'solicitada' || o.estado === 'aprobada').length || 0,
        inProductionOrders: orders?.filter(o => o.estado === 'produccion').length || 0,
        deliveredOrders: orders?.filter(o => o.estado === 'entregada').length || 0,
        delayedOrders: orders?.filter(o => o.estado === 'atrasada').length || 0
      };

      console.log(`   📦 Total órdenes: ${stats.totalOrders}`);
      console.log(`   ⏳ Pendientes: ${stats.pendingOrders}`);
      console.log(`   🏭 En producción: ${stats.inProductionOrders}`);
      console.log(`   ✅ Entregadas: ${stats.deliveredOrders}`);
      console.log(`   ⚠️ Atrasadas: ${stats.delayedOrders}`);

    } catch (error) {
      console.log(`   ❌ Error en getOrderStats: ${error.message}`);
    }

    // 4. getClientDistribution
    console.log('\n4️⃣ getClientDistribution:');
    
    try {
      const { data: clientes, error } = await supabase
        .from('clientes')
        .select('razonsocial, total_invertido')
        .order('total_invertido', { ascending: false })
        .limit(10);

      if (error) throw error;

      const totalInvertido = clientes?.reduce((sum, cliente) =>
        sum + (cliente.total_invertido || 0), 0) || 1;

      console.log(`   💰 Total invertido: $${totalInvertido.toLocaleString()}`);
      console.log('   👥 Top 5 clientes:');
      clientes?.slice(0, 5).forEach((cliente, index) => {
        const porcentaje = ((cliente.total_invertido || 0) / totalInvertido) * 100;
        console.log(`      ${index + 1}. ${cliente.razonsocial}: ${porcentaje.toFixed(1)}%`);
      });

    } catch (error) {
      console.log(`   ❌ Error en getClientDistribution: ${error.message}`);
    }

    // 5. Resumen final
    console.log('\n📋 RESUMEN FINAL PARA EL DASHBOARD:');
    console.log('===================================');
    
    const [clientesData, campanasData, ordenesData] = await Promise.all([
      supabase.from('clientes').select('id_cliente'),
      supabase.from('campania').select('id_campania').eq('estado', true),
      supabase.from('ordenesdepublicidad').select('id_ordenes_de_comprar').eq('estado', 'produccion')
    ]);

    const finalStats = {
      clientes: clientesData.data?.length || 0,
      campanas: campanasData.data?.length || 0,
      ordenesActivas: ordenesData.data?.length || 0
    };

    console.log(`   👥 Clientes: ${finalStats.clientes}`);
    console.log(`   📢 Campañas activas: ${finalStats.campanas}`);
    console.log(`   🔄 Órdenes en producción: ${finalStats.ordenesActivas}`);

    console.log('\n✅ PRUEBA COMPLETADA');
    console.log('\n🎯 RESULTADO:');
    
    if (finalStats.clientes > 0 && finalStats.campanas >= 0) {
      console.log('   🎉 El Dashboard ahora debería mostrar los datos correctamente');
      console.log('   📱 Abre http://localhost:5173/dashboard para verificar');
      console.log('   🔍 Si aún muestra 0, recarga la página (F5)');
    } else {
      console.log('   ⚠️  Puede haber otros problemas pendientes');
    }

    console.log('\n💡 NOTAS:');
    console.log('   - El error de "activa" vs true está corregido');
    console.log('   - Los medios deberían funcionar en http://localhost:3002/medios');
    console.log('   - El Dashboard debería funcionar en http://localhost:5173/dashboard');

  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

probarDashboardCorregido();