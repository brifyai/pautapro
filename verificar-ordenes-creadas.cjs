const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarOrdenesCreadas() {
  console.log('🔍 Verificando órdenes creadas en la base de datos...\n');

  try {
    // 1. Contar total de órdenes
    console.log('📊 Paso 1: Contando órdenes creadas...');
    const { count, error: errorCount } = await supabase
      .from('ordenesdepublicidad')
      .select('*', { count: 'exact', head: true });

    if (errorCount) {
      console.error('❌ Error al contar órdenes:', errorCount);
      return;
    }

    console.log(`✅ Total de órdenes en BD: ${count}`);

    // 2. Obtener últimas órdenes creadas
    console.log('\n📋 Paso 2: Obteniendo últimas órdenes...');
    const { data: ordenes, error: errorOrdenes } = await supabase
      .from('ordenesdepublicidad')
      .select('*')
      .order('id_ordenes_de_comprar', { ascending: false })
      .limit(10);

    if (errorOrdenes) {
      console.error('❌ Error al obtener órdenes:', errorOrdenes);
      return;
    }

    console.log(`✅ Últimas ${ordenes.length} órdenes:`);
    ordenes.forEach((orden, index) => {
      console.log(`\n   Orden ${index + 1}:`);
      console.log(`     ID: ${orden.id_ordenes_de_comprar}`);
      console.log(`     Cliente: ${orden.id_cliente}`);
      console.log(`     Campaña: ${orden.id_campania}`);
      console.log(`     Plan: ${orden.id_plan}`);
      console.log(`     Monto: $${orden.monto_total?.toLocaleString('es-CL') || 'N/A'}`);
      console.log(`     Estado: ${orden.estado}`);
      console.log(`     Fecha: ${orden.fecha_orden || 'N/A'}`);
      console.log(`     Alternativas: ${orden.alternativas_plan_orden || 'N/A'}`);
    });

    // 3. Verificar órdenes de la campaña Cordillera Foods
    console.log('\n🎯 Paso 3: Verificando órdenes de la campaña Cordillera Foods...');
    const { data: ordenesCordillera, error: errorCordillera } = await supabase
      .from('ordenesdepublicidad')
      .select('*')
      .eq('id_campania', 63) // ID de la campaña Cordillera Foods
      .order('id_ordenes_de_comprar', { ascending: false });

    if (errorCordillera) {
      console.error('❌ Error al obtener órdenes de Cordillera:', errorCordillera);
      return;
    }

    console.log(`✅ Órdenes de la campaña Cordillera Foods: ${ordenesCordillera.length}`);
    ordenesCordillera.forEach((orden, index) => {
      console.log(`   ${index + 1}. ID: ${orden.id_ordenes_de_comprar}, Plan: ${orden.id_plan}, Monto: $${orden.monto_total?.toLocaleString('es-CL') || 'N/A'}`);
    });

    // 4. Verificar alternativas creadas
    console.log('\n📋 Paso 4: Verificando alternativas creadas...');
    const { count: countAlternativas, error: errorCountAlternativas } = await supabase
      .from('alternativa')
      .select('*', { count: 'exact', head: true });

    if (errorCountAlternativas) {
      console.error('❌ Error al contar alternativas:', errorCountAlternativas);
    } else {
      console.log(`✅ Total de alternativas en BD: ${countAlternativas}`);
    }

    // 5. Verificar relación entre alternativas y planes
    console.log('\n🔗 Paso 5: Verificando relación alternativas->planes...');
    const { data: alternativasConPlan, error: errorAlternativasPlan } = await supabase
      .from('alternativa')
      .select('id, id_plan, id_campania, id_medios, id_soporte, id_contrato, nombre_alternativa, presupuesto')
      .eq('id_plan', 11) // Plan noviembre
      .limit(5);

    if (!errorAlternativasPlan && alternativasConPlan) {
      console.log(`✅ Alternativas del plan noviembre (primeras 5):`);
      alternativasConPlan.forEach((alt, index) => {
        console.log(`   ${index + 1}. ID: ${alt.id}, Plan: ${alt.id_plan}, Medio: ${alt.id_medios}, Soporte: ${alt.id_soporte}, Presupuesto: $${alt.presupuesto?.toLocaleString('es-CL') || 'N/A'}`);
      });
    }

    // 6. Verificar planes de la campaña
    console.log('\n📋 Paso 6: Verificando planes de la campaña...');
    const { data: planesCordillera, error: errorPlanes } = await supabase
      .from('plan')
      .select('*')
      .eq('id_campania', 63);

    if (errorPlanes) {
      console.error('❌ Error al obtener planes:', errorPlanes);
    } else {
      console.log(`✅ Planes de la campaña Cordillera Foods: ${planesCordillera.length}`);
      planesCordillera.forEach((plan, index) => {
        console.log(`   ${index + 1}. ID: ${plan.id}, Nombre: ${plan.nombre_plan}, Presupuesto: $${plan.presupuesto?.toLocaleString('es-CL') || 'N/A'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verificarOrdenesCreadas();