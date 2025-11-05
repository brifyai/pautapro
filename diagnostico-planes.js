import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env');
  console.error('URL:', supabaseUrl);
  console.error('KEY:', supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosticar() {
  console.log('🔍 === DIAGNÓSTICO COMPLETO DE PLANES ===\n');

  try {
    // 1. Contar planes totales
    console.log('1️⃣ CONTEO DE PLANES:');
    const { data: planesCount, error: errorCount } = await supabase
      .from('plan')
      .select('id', { count: 'exact', head: true });
    
    if (errorCount) {
      console.error('❌ Error contando planes:', errorCount);
    } else {
      console.log(`   ✅ Total de planes: ${planesCount?.length || 0}\n`);
    }

    // 2. Ver estructura de tabla plan
    console.log('2️⃣ ESTRUCTURA DE TABLA "plan":');
    const { data: planSample, error: errorPlanSample } = await supabase
      .from('plan')
      .select('*')
      .limit(1);
    
    if (errorPlanSample) {
      console.error('❌ Error obteniendo muestra de plan:', errorPlanSample);
    } else if (planSample && planSample.length > 0) {
      console.log('   Campos disponibles:');
      Object.keys(planSample[0]).forEach(key => {
        console.log(`   - ${key}: ${typeof planSample[0][key]}`);
      });
      console.log('');
    }

    // 3. Ver todos los planes
    console.log('3️⃣ TODOS LOS PLANES EN LA BD:');
    const { data: allPlanes, error: errorAllPlanes } = await supabase
      .from('plan')
      .select('id, nombre_plan, id_campania, anio, mes, estado, estado2');
    
    if (errorAllPlanes) {
      console.error('❌ Error obteniendo planes:', errorAllPlanes);
    } else {
      console.log(`   Total: ${allPlanes?.length || 0} planes`);
      if (allPlanes && allPlanes.length > 0) {
        allPlanes.forEach(plan => {
          console.log(`   - ID: ${plan.id}, Nombre: ${plan.nombre_plan}, Campaña: ${plan.id_campania}`);
        });
      }
      console.log('');
    }

    // 4. Ver relaciones campana_planes
    console.log('4️⃣ RELACIONES EN TABLA "campana_planes":');
    const { data: relaciones, error: errorRelaciones } = await supabase
      .from('campana_planes')
      .select('id_campania, id_plan');
    
    if (errorRelaciones) {
      console.error('❌ Error obteniendo relaciones:', errorRelaciones);
    } else {
      console.log(`   Total: ${relaciones?.length || 0} relaciones`);
      if (relaciones && relaciones.length > 0) {
        relaciones.forEach(rel => {
          console.log(`   - Campaña: ${rel.id_campania}, Plan: ${rel.id_plan}`);
        });
      }
      console.log('');
    }

    // 5. Verificar planes para campaña específica (ID 5)
    console.log('5️⃣ PLANES PARA CAMPAÑA ID 5:');
    
    // Método 1: Búsqueda directa por id_campania
    const { data: planesCampania5, error: errorCampania5 } = await supabase
      .from('plan')
      .select('id, nombre_plan, id_campania')
      .eq('id_campania', 5);
    
    console.log('   Método 1 - Búsqueda directa por id_campania:');
    if (errorCampania5) {
      console.error('   ❌ Error:', errorCampania5);
    } else {
      console.log(`   ✅ Encontrados: ${planesCampania5?.length || 0} planes`);
      planesCampania5?.forEach(p => console.log(`      - ${p.nombre_plan}`));
    }
    console.log('');

    // Método 2: Búsqueda a través de campana_planes
    console.log('   Método 2 - Búsqueda a través de campana_planes:');
    const { data: relacionesCampania5, error: errorRelacionesCampania5 } = await supabase
      .from('campana_planes')
      .select('id_plan')
      .eq('id_campania', 5);
    
    if (errorRelacionesCampania5) {
      console.error('   ❌ Error:', errorRelacionesCampania5);
    } else {
      console.log(`   ✅ Relaciones encontradas: ${relacionesCampania5?.length || 0}`);
      
      if (relacionesCampania5 && relacionesCampania5.length > 0) {
        const idsPlanes = relacionesCampania5.map(r => r.id_plan);
        console.log(`   IDs de planes: ${idsPlanes.join(', ')}`);
        
        // Obtener detalles de los planes
        const { data: planesDetalles, error: errorDetalles } = await supabase
          .from('plan')
          .select('id, nombre_plan, id_campania')
          .in('id', idsPlanes);
        
        if (errorDetalles) {
          console.error('   ❌ Error obteniendo detalles:', errorDetalles);
        } else {
          planesDetalles?.forEach(p => console.log(`      - ${p.nombre_plan}`));
        }
      }
    }
    console.log('');

    // 6. Verificar campañas disponibles
    console.log('6️⃣ CAMPAÑAS DISPONIBLES:');
    const { data: campanas, error: errorCampanas } = await supabase
      .from('campania')
      .select('id_campania, nombrecampania')
      .limit(10);
    
    if (errorCampanas) {
      console.error('❌ Error obteniendo campañas:', errorCampanas);
    } else {
      console.log(`   Total: ${campanas?.length || 0} campañas`);
      campanas?.forEach(c => console.log(`   - ID: ${c.id_campania}, Nombre: ${c.nombrecampania}`));
    }
    console.log('');

    console.log('🔍 === FIN DIAGNÓSTICO ===');

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  }
}

diagnosticar();
