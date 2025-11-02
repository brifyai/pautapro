const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://lfjnapdxfqyqjfwjlvep.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmam5hcGR4ZnF5cWpmd2psdmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0MTk3NjEsImV4cCI6MjA0NjA5NTc2MX0.q2s1rKs2xTnLdJRpQqVg5cB8IwEY3tFqLjQaXhXoZk';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 DIAGNÓSTICO ESPECÍFICO DEL DASHBOARD');
console.log('==========================================\n');

async function diagnosticarDashboard() {
  try {
    console.log('📊 Verificando las consultas exactas del Dashboard...\n');

    // 1. Verificar estadísticas principales como lo hace el dashboardService
    console.log('1️⃣ ESTADÍSTICAS PRINCIPALES (getDashboardStats):');
    
    const { data: agencias, error: agenciasError } = await supabase
      .from('agencias')
      .select('id')
      .eq('estado', true);

    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('id_cliente');

    const { data: campanas, error: campanasError } = await supabase
      .from('campania')
      .select('id_campania')
      .eq('estado', 'activa');

    const { data: medios, error: mediosError } = await supabase
      .from('medios')
      .select('id_medio');

    console.log(`   ✅ Agencias activas: ${agencias?.length || 0}`);
    if (agenciasError) console.log(`   ❌ Error agencias: ${agenciasError.message}`);
    
    console.log(`   ✅ Clientes totales: ${clientes?.length || 0}`);
    if (clientesError) console.log(`   ❌ Error clientes: ${clientesError.message}`);
    
    console.log(`   ✅ Campañas activas: ${campanas?.length || 0}`);
    if (campanasError) console.log(`   ❌ Error campañas: ${campanasError.message}`);
    
    console.log(`   ✅ Medios totales: ${medios?.length || 0}`);
    if (mediosError) console.log(`   ❌ Error medios: ${mediosError.message}`);

    // 2. Verificar estadísticas de campañas
    console.log('\n2️⃣ ESTADÍSTICAS DE CAMPAÑAS (getCampaignStats):');
    
    const { data: allCampanas, error: allCampanasError } = await supabase
      .from('campania')
      .select('estado');

    if (allCampanasError) {
      console.log(`   ❌ Error en campañas: ${allCampanasError.message}`);
    } else {
      const stats = {
        borrador: 0,
        revision: 0,
        aprobada: 0,
        produccion: 0,
        live: 0,
        finalizada: 0,
        cancelada: 0
      };

      allCampanas?.forEach(campaign => {
        if (stats.hasOwnProperty(campaign.estado)) {
          stats[campaign.estado]++;
        }
      });

      console.log('   📈 Distribución de campañas:');
      Object.entries(stats).forEach(([estado, count]) => {
        if (count > 0) {
          console.log(`      ${estado}: ${count}`);
        }
      });
    }

    // 3. Verificar estadísticas de órdenes
    console.log('\n3️⃣ ESTADÍSTICAS DE ÓRDENES (getOrderStats):');
    
    const { data: orders, error: ordersError } = await supabase
      .from('ordenesdepublicidad')
      .select('estado, created_at, fecha_estimada_entrega, fecha_entrega_real');

    if (ordersError) {
      console.log(`   ❌ Error en órdenes: ${ordersError.message}`);
    } else {
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
    }

    // 4. Verificar distribución de clientes
    console.log('\n4️⃣ DISTRIBUCIÓN DE CLIENTES (getClientDistribution):');
    
    const { data: clientesDist, error: clientesDistError } = await supabase
      .from('clientes')
      .select('razonsocial, total_invertido')
      .order('total_invertido', { ascending: false })
      .limit(10);

    if (clientesDistError) {
      console.log(`   ❌ Error en distribución clientes: ${clientesDistError.message}`);
    } else {
      console.log('   💰 Top 10 clientes por inversión:');
      clientesDist?.forEach((cliente, index) => {
        console.log(`      ${index + 1}. ${cliente.razonsocial}: $${(cliente.total_invertido || 0).toLocaleString()}`);
      });
    }

    // 5. Verificar clientes recientes
    console.log('\n5️⃣ CLIENTES RECIENTES (getRecentClients):');
    
    const { data: recentClients, error: recentClientsError } = await supabase
      .from('clientes')
      .select('razonsocial, direccionempresa, telfijo')
      .order('created_at', { ascending: false })
      .limit(4);

    if (recentClientsError) {
      console.log(`   ❌ Error en clientes recientes: ${recentClientsError.message}`);
    } else {
      console.log('   🆕 Clientes recientes:');
      recentClients?.forEach((cliente, index) => {
        console.log(`      ${index + 1}. ${cliente.razonsocial}`);
      });
    }

    // 6. Verificar presupuesto total
    console.log('\n6️⃣ PRESUPUESTO TOTAL (getTotalBudget):');
    
    const { data: presupuesto, error: presupuestoError } = await supabase
      .from('campania')
      .select('presupuesto')
      .not('presupuesto', 'is', null);

    if (presupuestoError) {
      console.log(`   ❌ Error en presupuesto: ${presupuestoError.message}`);
    } else {
      const totalBudget = presupuesto?.reduce((sum, campaign) => sum + (campaign.presupuesto || 0), 0) || 0;
      console.log(`   💎 Presupuesto total: $${totalBudget.toLocaleString()}`);
    }

    // 7. Resumen para el Dashboard
    console.log('\n📋 RESUMEN PARA EL DASHBOARD:');
    console.log('=============================');
    
    const dashboardStats = {
      agencias: agencias?.length || 0,
      clientes: clientes?.length || 0,
      campanas: campanas?.length || 0,
      medios: medios?.length || 0,
      ordenesActivas: orders?.filter(o => o.estado === 'produccion').length || 0,
      campañasPendientes: allCampanas?.filter(c => c.estado === 'revision' || c.estado === 'borrador').length || 0
    };

    console.log(`   🏢 Agencias: ${dashboardStats.agencias}`);
    console.log(`   👥 Clientes: ${dashboardStats.clientes}`);
    console.log(`   📢 Campañas: ${dashboardStats.campanas}`);
    console.log(`   📺 Medios: ${dashboardStats.medios}`);
    console.log(`   🔄 Órdenes activas: ${dashboardStats.ordenesActivas}`);
    console.log(`   ⏳ Campañas pendientes: ${dashboardStats.campañasPendientes}`);

    // 8. Verificar problema específico
    console.log('\n🔍 ANÁLISIS DEL PROBLEMA:');
    console.log('========================');
    
    if (dashboardStats.clientes === 0) {
      console.log('   ⚠️  PROBLEMA: No hay clientes - Verificar tabla clientes');
    }
    if (dashboardStats.campanas === 0) {
      console.log('   ⚠️  PROBLEMA: No hay campañas activas - Verificar estado "activa"');
    }
    if (dashboardStats.ordenesActivas === 0) {
      console.log('   ⚠️  PROBLEMA: No hay órdenes en producción - Verificar tabla ordenesdepublicidad');
    }

    console.log('\n✅ Diagnóstico completado');
    console.log('\n💡 RECOMENDACIONES:');
    console.log('   1. Si los valores son 0, verificar que los datos existen');
    console.log('   2. Verificar que el Dashboard esté corriendo en el puerto correcto');
    console.log('   3. Revisar la consola del navegador para errores JavaScript');
    console.log('   4. Asegurarse de que los servicios se estén importando correctamente');

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error.message);
  }
}

diagnosticarDashboard();