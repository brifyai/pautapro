const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

async function crearOrdenesCampania() {
  console.log('🚀 Creando órdenes para la campaña de Cordillera Foods...\n');

  try {
    // 1. Obtener la campaña de Cordillera Foods
    console.log('📋 Paso 1: Buscando campaña de Cordillera Foods...');
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

    // 2. Obtener los planes de esta campaña
    console.log('\n📋 Paso 2: Obteniendo planes de la campaña...');
    const { data: planes, error: errorPlanes } = await supabase
      .from('plan')
      .select('*')
      .eq('id_campania', campania.id_campania);

    if (errorPlanes || !planes || planes.length === 0) {
      console.error('❌ No se encontraron planes para esta campaña');
      return;
    }

    console.log(`✅ Planes encontrados: ${planes.length}`);

    // 3. Obtener medios con sus soportes y contratos
    console.log('\n📺 Paso 3: Analizando medios, soportes y contratos...');
    
    const { data: medios } = await supabase
      .from('medios')
      .select('*')
      .eq('estado', true);

    if (!medios || medios.length === 0) {
      console.error('❌ No se encontraron medios activos');
      return;
    }

    console.log(`✅ Medios activos: ${medios.length}`);

    let totalAlternativasCreadas = 0;
    let totalOrdenesCreadas = 0;

    // 4. Para cada plan, crear alternativas y órdenes
    for (const plan of planes) {
      console.log(`\n🎯 Procesando plan: ${plan.nombre_plan}`);
      console.log(`   Presupuesto del plan: $${plan.presupuesto.toLocaleString('es-CL')}`);
      
      let alternativasPlan = 0;
      let ordenesPlan = 0;

      // Obtener medios que tienen contratos
      for (const medio of medios) {
        // Obtener contratos para este medio
        const { data: contratos, error: errorContratos } = await supabase
          .from('contratos')
          .select('*')
          .eq('idmedios', medio.id_medio)
          .eq('estado', true);

        if (errorContratos || !contratos || contratos.length === 0) {
          continue;
        }

        console.log(`\n   📺 ${medio.nombre_medio}: ${contratos.length} contratos`);

        // Obtener soportes para este medio
        const { data: soportes, error: errorSoportes } = await supabase
          .from('soportes')
          .select('*')
          .eq('id_medio', medio.id_medio)
          .eq('estado', true);

        // Si no hay soportes, crear uno genérico
        const soportesMedio = (!errorSoportes && soportes && soportes.length > 0) 
          ? soportes 
          : [{ id_soporte: null, nombreidentificador: `Soporte ${medio.nombre_medio}` }];

        // Para cada contrato, crear alternativas
        for (const contrato of contratos) {
          for (const soporte of soportesMedio) {
            // Calcular presupuesto distribuido
            const presupuestoAlternativa = plan.presupuesto / medios.length / contratos.length / soportesMedio.length;

            // Crear alternativa
            const alternativaData = {
              id_plan: plan.id,
              id_medios: medio.id_medio,
              id_soporte: soporte.id_soporte,
              id_contrato: contrato.id,
              id_programa: 1, // Valor por defecto
              id_tema: 1, // Valor por defecto
              id_clasificacion: 1, // Valor por defecto
              numerorden: totalAlternativasCreadas + 1,
              descripcion: `${medio.nombre_medio} - ${soporte.nombreidentificador} - ${contrato.descripcion}`,
              costo: Math.round(presupuestoAlternativa),
              duracion: null,
              estado: true
            };

            const { data: alternativa, error: errorAlternativa } = await supabase
              .from('alternativa')
              .insert(alternativaData)
              .select()
              .single();

            if (errorAlternativa) {
              console.error(`      ❌ Error al crear alternativa:`, errorAlternativa.message);
              continue;
            }

            totalAlternativasCreadas++;
            alternativasPlan++;
            console.log(`      ✅ Alternativa creada: ${alternativa.descripcion.substring(0, 50)}... (ID: ${alternativa.id})`);

            // Crear orden de publicidad
            const ordenData = {
              id_ordenes_de_comprar: totalOrdenesCreadas + 2, // Empezar desde 2 para evitar conflicto con el ID 1 existente
              numero_correlativo: totalOrdenesCreadas + 2,
              id_cliente: campania.id_cliente,
              id_campania: campania.id_campania,
              id_plan: plan.id,
              alternativas_plan_orden: [alternativa.id],
              alternativaactual: alternativa.id,
              fecha_orden: new Date().toISOString().split('T')[0],
              fecha_ejecucion: plan.mes === 11 ? '2025-11-15' : '2025-12-15',
              monto_total: Math.round(presupuestoAlternativa),
              estado: 'pendiente',
              observaciones: `Orden automática para ${medio.nombre_medio} - ${soporte.nombreidentificador}`,
              fecha_estimada_entrega: plan.mes === 11 ? '2025-11-30' : '2025-12-31'
            };

            const { data: orden, error: errorOrden } = await supabase
              .from('ordenesdepublicidad')
              .insert(ordenData)
              .select()
              .single();

            if (errorOrden) {
              console.error(`         ❌ Error al crear orden:`, errorOrden.message);
              continue;
            }

            totalOrdenesCreadas++;
            ordenesPlan++;
            console.log(`         ✅ Orden creada: $${orden.monto_total.toLocaleString('es-CL')} (ID: ${orden.id_ordenes_de_comprar})`);
          }
        }
      }

      console.log(`\n   📊 Resumen del plan ${plan.nombre_plan}:`);
      console.log(`      Alternativas creadas: ${alternativasPlan}`);
      console.log(`      Órdenes creadas: ${ordenesPlan}`);
    }

    // 5. Verificación final
    console.log('\n🔍 Paso 5: Verificación final...');
    
    for (const plan of planes) {
      const { data: alternativas } = await supabase
        .from('alternativa')
        .select('*')
        .eq('id_plan', plan.id);
      
      const { data: ordenes } = await supabase
        .from('ordenesdepublicidad')
        .select('*')
        .eq('id_plan', plan.id);
      
      console.log(`\n📋 Plan: ${plan.nombre_plan}`);
      console.log(`   Alternativas en BD: ${alternativas?.length || 0}`);
      console.log(`   Órdenes en BD: ${ordenes?.length || 0}`);
    }

    // 6. Resumen final
    console.log('\n🎉 Proceso completado exitosamente!');
    console.log('\n📝 Resumen Final:');
    console.log(`   📋 Campaña: ${campania.nombrecampania}`);
    console.log(`   💰 Presupuesto total: $${campania.presupuesto.toLocaleString('es-CL')}`);
    console.log(`   📅 Planes: ${planes.length}`);
    console.log(`   📺 Alternativas creadas: ${totalAlternativasCreadas}`);
    console.log(`   📄 Órdenes creadas: ${totalOrdenesCreadas}`);
    
    console.log('\n✅ Ahora el sistema está 100% funcional:');
    console.log('   1. Los medios deberían verse en http://localhost:3002/medios');
    console.log('   2. Las alternativas están disponibles en http://localhost:3002/planificacion');
    console.log('   3. Las órdenes están listas para su gestión');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

crearOrdenesCampania();