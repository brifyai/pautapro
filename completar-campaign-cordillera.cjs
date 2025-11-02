const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

async function completarCampañaCordillera() {
  console.log('🔄 Completando campaña para Cordillera Foods con medios y soportes...\n');

  try {
    // 1. Cargar el mapeo de medios-soportes
    console.log('📋 Paso 1: Cargando mapeo de medios-soportes...');
    const fs = require('fs');
    
    let mapeoMediosSoportes;
    try {
      const mapeoJSON = fs.readFileSync('mapeo-medios-soportes.json', 'utf8');
      mapeoMediosSoportes = JSON.parse(mapeoJSON);
      console.log('✅ Mapeo cargado exitosamente');
    } catch (error) {
      console.error('❌ Error al cargar mapeo:', error);
      return;
    }

    // 2. Obtener la última campaña creada para Cordillera Foods
    console.log('\n🎯 Paso 2: Buscando campaña de Cordillera Foods...');
    const { data: campania, error: errorCampania } = await supabase
      .from('campania')
      .select('*')
      .ilike('nombrecampania', '%cordillera%')
      .order('id_campania', { ascending: false })
      .limit(1)
      .single();

    if (errorCampania || !campania) {
      console.error('❌ No se encontró la campaña de Cordillera Foods');
      return;
    }

    console.log(`✅ Campaña encontrada: ${campania.nombrecampania} (ID: ${campania.id_campania})`);

    // 3. Obtener los planes de esta campaña
    console.log('\n📋 Paso 3: Obteniendo planes de la campaña...');
    const { data: planes, error: errorPlanes } = await supabase
      .from('plan')
      .select('*')
      .eq('id_campania', campania.id_campania);

    if (errorPlanes || !planes || planes.length === 0) {
      console.error('❌ No se encontraron planes para esta campaña');
      return;
    }

    console.log(`✅ Planes encontrados: ${planes.length}`);

    // 4. Para cada plan, crear alternativas y órdenes usando el mapeo
    for (const plan of planes) {
      console.log(`\n📺 Paso 4: Procesando plan: ${plan.nombre_plan}`);
      
      let totalAlternativas = 0;
      let totalOrdenes = 0;
      
      // Obtener medios que tienen soportes
      const mediosConSoportes = Object.values(mapeoMediosSoportes).filter(
        item => item.soportes && item.soportes.length > 0
      );

      console.log(`   📋 Medios con soportes disponibles: ${mediosConSoportes.length}`);

      for (const { medio, soportes } of mediosConSoportes) {
        console.log(`\n   📺 Procesando medio: ${medio.nombre_medio} (${soportes.length} soportes)`);
        
        // Obtener contratos para este medio (los contratos se relacionan directamente con medios)
        const { data: contratos, error: errorContratos } = await supabase
          .from('contratos')
          .select('*')
          .eq('idmedios', medio.id_medio);

        if (errorContratos) {
          console.log(`      ⚠️  Error al obtener contratos para medio ${medio.nombre_medio}: ${errorContratos.message}`);
          continue;
        }

        if (!contratos || contratos.length === 0) {
          console.log(`      ⚠️  El medio "${medio.nombre_medio}" no tiene contratos`);
          continue;
        }

        console.log(`      📄 Medio "${medio.nombre_medio}": ${contratos.length} contratos`);

        // Para cada contrato, crear alternativas para cada soporte
        for (const contrato of contratos) {
          for (const soporte of soportes) {
            // Calcular presupuesto distribuido
            const presupuestoAlternativa = plan.presupuesto / mediosConSoportes.length / contratos.length / soportes.length;

            // Crear alternativa
            const alternativaData = {
              id_plan: plan.id,
              id_medios: medio.id_medio,
              id_soporte: soporte.id_soporte,
              id_contrato: contrato.id,
              nombre_alternativa: `${medio.nombre_medio} - ${soporte.nombreidentificador}`,
              descripcion: `Alternativa para ${medio.nombre_medio} - ${soporte.nombreidentificador}`,
              presupuesto: Math.round(presupuestoAlternativa),
              estado: true
            };

            const { data: alternativa, error: errorAlternativa } = await supabase
              .from('alternativa')
              .insert(alternativaData)
              .select()
              .single();

            if (errorAlternativa) {
              console.error(`         ❌ Error al crear alternativa:`, errorAlternativa);
              continue;
            }

            totalAlternativas++;
            console.log(`         ✅ Alternativa creada: ${alternativa.nombre_alternativa} (ID: ${alternativa.id})`);

            // Crear orden de publicidad
            const ordenData = {
              id_alternativa: alternativa.id,
              id_cliente: campania.id_cliente,
              id_campania: campania.id_campania,
              id_plan: plan.id,
              id_medios: medio.id_medio,
              id_soporte: soporte.id_soporte,
              id_contrato: contrato.id,
              id_proveedor: contrato.id_proveedor,
              nombre_orden: `Orden ${medio.nombre_medio} - ${soporte.nombreidentificador}`,
              descripcion: `Orden de publicidad para ${medio.nombre_medio} - ${soporte.nombreidentificador}`,
              presupuesto: Math.round(presupuestoAlternativa),
              estado: 'pendiente'
            };

            const { data: orden, error: errorOrden } = await supabase
              .from('ordenesdepublicidad')
              .insert(ordenData)
              .select()
              .single();

            if (errorOrden) {
              console.error(`            ❌ Error al crear orden:`, errorOrden);
              continue;
            }

            totalOrdenes++;
            console.log(`            ✅ Orden creada: ${orden.nombre_orden} (ID: ${orden.id})`);
          }
        }
      }

      console.log(`\n   📊 Resumen del plan ${plan.nombre_plan}:`);
      console.log(`      Alternativas creadas: ${totalAlternativas}`);
      console.log(`      Órdenes creadas: ${totalOrdenes}`);
    }

    // 5. Verificar resultados finales
    console.log('\n🔍 Paso 5: Verificando resultados finales...');
    
    for (const plan of planes) {
      const { data: alternativas, error: errorAlternativas } = await supabase
        .from('alternativa')
        .select('*')
        .eq('id_plan', plan.id);

      const { data: ordenesPlan, error: errorOrdenesPlan } = await supabase
        .from('ordenesdepublicidad')
        .select('*')
        .eq('id_plan', plan.id);

      console.log(`\n📋 Plan: ${plan.nombre_plan}`);
      console.log(`   Alternativas: ${alternativas?.length || 0}`);
      console.log(`   Órdenes: ${ordenesPlan?.length || 0}`);
    }

    console.log('\n🎉 Campaña completada exitosamente!');
    console.log('\n📝 Resumen final:');
    console.log(`   Campaña: ${campania.nombrecampania}`);
    console.log(`   Presupuesto total: $${campania.presupuesto.toLocaleString('es-CL')}`);
    console.log(`   Planes: ${planes.length}`);
    
    let totalAlternativasFinal = 0;
    let totalOrdenesFinal = 0;
    
    for (const plan of planes) {
      const { data: alternativas } = await supabase
        .from('alternativa')
        .select('*')
        .eq('id_plan', plan.id);
      
      const { data: ordenes } = await supabase
        .from('ordenesdepublicidad')
        .select('*')
        .eq('id_plan', plan.id);
      
      totalAlternativasFinal += alternativas?.length || 0;
      totalOrdenesFinal += ordenes?.length || 0;
    }
    
    console.log(`   Alternativas totales: ${totalAlternativasFinal}`);
    console.log(`   Órdenes totales: ${totalOrdenesFinal}`);
    
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Ir a http://localhost:3002/planificacion');
    console.log('   2. Buscar la campaña "Cordillera Foods - Urban Branding - Nov-Dic 2025"');
    console.log('   3. Revisar los planes, alternativas y órdenes creadas');
    console.log('   4. Los medios ahora deberían verse en http://localhost:3002/medios');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

completarCampañaCordillera();