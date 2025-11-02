const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function investigarRelaciones() {
  try {
    console.log('🔍 INVESTIGANDO RELACIONES ENTRE ÓRDENES Y ALTERNATIVAS');
    console.log('='.repeat(60));
    
    // 1. Verificar el campo alternativas_plan_orden
    console.log('\n📋 Paso 1: Analizando campo alternativas_plan_orden...');
    
    const { data: ordenes, error } = await supabase
      .from('ordenesdepublicidad')
      .select('id_ordenes_de_comprar, alternativas_plan_orden, id_plan')
      .not('alternativas_plan_orden', 'is', null)
      .limit(10);
    
    if (!error && ordenes) {
      console.log(`✅ Encontradas ${ordenes.length} órdenes con alternativas_plan_orden:`);
      
      for (const orden of ordenes) {
        console.log(`\n  Orden ${orden.id_ordenes_de_comprar}:`);
        console.log(`    alternativas_plan_orden: ${orden.alternativas_plan_orden}`);
        console.log(`    id_plan: ${orden.id_plan}`);
        
        // Si hay alternativas, buscarlas
        if (orden.alternativas_plan_orden) {
          const alternativasIds = orden.alternativas_plan_orden.split(',').map(id => id.trim());
          console.log(`    IDs de alternativas: [${alternativasIds.join(', ')}]`);
          
          // Buscar estas alternativas
          const { data: alternativas, error: altError } = await supabase
            .from('alternativa')
            .select(`
              id,
              descripcion,
              costo,
              id_contrato,
              id_plan,
              id_medios
            `)
            .in('id', alternativasIds);
          
          if (!altError && alternativas) {
            console.log(`    ✅ Encontradas ${alternativas.length} alternativas:`);
            
            for (const alt of alternativas) {
              console.log(`      * Alternativa ${alt.id}: ${alt.descripcion}`);
              console.log(`        Costo: $${alt.costo?.toLocaleString() || 'N/A'}`);
              console.log(`        Contrato: ${alt.id_contrato}`);
              console.log(`        Plan: ${alt.id_plan}`);
              console.log(`        Medio: ${alt.id_medios}`);
              
              // Si hay contrato, buscar el medio
              if (alt.id_contrato) {
                const { data: contrato, error: contratoError } = await supabase
                  .from('contratos')
                  .select(`
                    id,
                    numero_contrato,
                    idmedios,
                    proveedores!inner(id_proveedor, nombreproveedor)
                  `)
                  .eq('id', alt.id_contrato)
                  .single();
                
                if (!contratoError && contrato) {
                  console.log(`        ✅ Contrato: ${contrato.numero_contrato}`);
                  console.log(`        Proveedor: ${contrato.proveedores.nombreproveedor}`);
                  
                  // Buscar el medio del contrato
                  if (contrato.idmedios) {
                    const { data: medio, error: medioError } = await supabase
                      .from('medios')
                      .select('id, nombre_medio')
                      .eq('id', contrato.idmedios)
                      .single();
                    
                    if (!medioError && medio) {
                      console.log(`        🎯 MEDIO: ${medio.nombre_medio}`);
                    }
                  }
                }
              }
            }
          } else {
            console.log(`    ❌ Error buscando alternativas: ${altError?.message}`);
          }
        }
      }
    } else {
      console.log('❌ No se encontraron órdenes con alternativas_plan_orden');
    }
    
    // 2. Verificar relación por id_plan
    console.log('\n📋 Paso 2: Analizando relación por id_plan...');
    
    const { data: ordenesConPlan, error: planError } = await supabase
      .from('ordenesdepublicidad')
      .select('id_ordenes_de_comprar, id_plan')
      .not('id_plan', 'is', null)
      .limit(5);
    
    if (!planError && ordenesConPlan) {
      console.log(`✅ Encontradas ${ordenesConPlan.length} órdenes con id_plan:`);
      
      for (const orden of ordenesConPlan) {
        console.log(`\n  Orden ${orden.id_ordenes_de_comprar} - Plan ${orden.id_plan}:`);
        
        // Buscar alternativas de este plan
        const { data: alternativasPlan, error: altPlanError } = await supabase
          .from('alternativa')
          .select(`
            id,
            descripcion,
            costo,
            id_contrato,
            id_medios
          `)
          .eq('id_plan', orden.id_plan)
          .limit(3);
        
        if (!altPlanError && alternativasPlan) {
          console.log(`    ✅ Encontradas ${alternativasPlan.length} alternativas para este plan:`);
          
          for (const alt of alternativasPlan) {
            console.log(`      * Alternativa ${alt.id}: ${alt.descripcion}`);
            
            // Buscar el medio a través del contrato
            if (alt.id_contrato) {
              const { data: contratoMedio, error: contratoMedioError } = await supabase
                .from('contratos')
                .select(`
                  idmedios,
                  medios!inner(id, nombre_medio),
                  proveedores!inner(nombreproveedor)
                `)
                .eq('id', alt.id_contrato)
                .single();
              
              if (!contratoMedioError && contratoMedio) {
                console.log(`        🎯 MEDIO: ${contratoMedio.medios.nombre_medio}`);
                console.log(`        🏢 PROVEEDOR: ${contratoMedio.proveedores.nombreproveedor}`);
              }
            }
          }
        }
      }
    }
    
    // 3. Resumen
    console.log('\n📊 Paso 3: Resumen de relaciones encontradas...');
    console.log('✅ Las relaciones funcionan a través de:');
    console.log('   1. alternativas_plan_orden (IDs separados por comas)');
    console.log('   2. id_plan (alternativas asociadas a un plan)');
    console.log('   3. alternativa.id_contrato → contratos.idmedios → medios.nombre_medio');
    
  } catch (error) {
    console.error('❌ Error en investigación:', error.message);
  }
}

investigarRelaciones();