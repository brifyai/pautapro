const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function diagnosticarBasesCompletas() {
  try {
    console.log('🔍 DIAGNÓSTICO COMPLETO DE BASES DE DATOS');
    console.log('='.repeat(60));
    
    // 1. Verificar todas las tablas que existen
    console.log('\n📋 Paso 1: Identificando todas las tablas...');
    
    const tablasConocidas = [
      'ordenes', 'ordenesdepublicidad', 'orden',
      'clientes', 'cliente', 
      'campanas', 'campania', 'campaña',
      'alternativas', 'alternativa',
      'planes', 'plan',
      'medios', 'medio',
      'contratos', 'contrato',
      'proveedores', 'proveedor'
    ];
    
    const tablasEncontradas = [];
    
    for (const tabla of tablasConocidas) {
      try {
        const { data, error } = await supabase
          .from(tabla)
          .select('*')
          .limit(1);
        
        if (!error) {
          tablasEncontradas.push(tabla);
          console.log(`✅ Tabla encontrada: ${tabla}`);
        }
      } catch (e) {
        // Tabla no existe
      }
    }
    
    console.log(`\n📊 Total tablas encontradas: ${tablasEncontradas.length}`);
    
    // 2. Analizar cada tabla encontrada
    console.log('\n🔍 Paso 2: Analizando estructura y datos de cada tabla...');
    
    for (const tabla of tablasEncontradas) {
      console.log(`\n--- ANÁLISIS DE TABLA: ${tabla} ---`);
      
      try {
        // Obtener estructura y conteo
        const { data, error, count } = await supabase
          .from(tabla)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          console.log(`📊 Registros totales: ${count || 0}`);
          
          // Obtener muestra de datos para ver estructura
          const { data: muestra, error: errorMuestra } = await supabase
            .from(tabla)
            .select('*')
            .limit(1);
          
          if (!errorMuestra && muestra && muestra.length > 0) {
            console.log(`📋 Columnas: ${Object.keys(muestra[0]).join(', ')}`);
            console.log(`🔍 Muestra de datos:`, JSON.stringify(muestra[0], null, 2));
          }
        }
      } catch (e) {
        console.log(`❌ Error analizando tabla ${tabla}: ${e.message}`);
      }
    }
    
    // 3. Identificar problemas de duplicación
    console.log('\n🚨 Paso 3: Identificando problemas de duplicación...');
    
    const gruposProblematicos = [
      ['ordenes', 'ordenesdepublicidad', 'orden'],
      ['clientes', 'cliente'],
      ['campanas', 'campania', 'campaña'],
      ['alternativas', 'alternativa'],
      ['planes', 'plan'],
      ['medios', 'medio'],
      ['contratos', 'contrato'],
      ['proveedores', 'proveedor']
    ];
    
    for (const grupo of gruposProblematicos) {
      const tablasDelGrupo = grupo.filter(tabla => tablasEncontradas.includes(tabla));
      
      if (tablasDelGrupo.length > 1) {
        console.log(`\n⚠️  GRUPO PROBLEMÁTICO: ${tablasDelGrupo.join(', ')}`);
        
        for (const tabla of tablasDelGrupo) {
          try {
            const { count } = await supabase
              .from(tabla)
              .select('*', { count: 'exact', head: true });
            
            console.log(`   - ${tabla}: ${count || 0} registros`);
          } catch (e) {
            console.log(`   - ${tabla}: Error al contar`);
          }
        }
      }
    }
    
    // 4. Verificar relaciones entre tablas
    console.log('\n🔗 Paso 4: Verificando relaciones...');
    
    // Verificar relaciones de órdenes
    if (tablasEncontradas.includes('ordenesdepublicidad')) {
      console.log('\n📋 Relaciones en ordenesdepublicidad:');
      
      try {
        const { data: ordenes } = await supabase
          .from('ordenesdepublicidad')
          .select('*')
          .limit(1);
        
        if (ordenes && ordenes.length > 0) {
          const orden = ordenes[0];
          console.log('Columnas de relación encontradas:');
          
          if (orden.id_cliente) console.log('  - id_cliente');
          if (orden.id_campania) console.log('  - id_campania');
          if (orden.id_plan) console.log('  - id_plan');
          if (orden.alternativas_plan_orden) console.log('  - alternativas_plan_orden');
        }
      } catch (e) {
        console.log('Error verificando relaciones:', e.message);
      }
    }
    
    // 5. Recomendaciones
    console.log('\n💡 Paso 5: Recomendaciones...');
    console.log('='.repeat(40));
    
    console.log('\n🔧 ACCIONES RECOMENDADAS:');
    
    // Analizar每组 duplicadas
    for (const grupo of gruposProblematicos) {
      const tablasDelGrupo = grupo.filter(tabla => tablasEncontradas.includes(tabla));
      
      if (tablasDelGrupo.length > 1) {
        console.log(`\n📊 Para el grupo ${grupo[0]}:`);
        
        // Encontrar la tabla con más datos
        let tablaPrincipal = null;
        let maxRegistros = 0;
        
        for (const tabla of tablasDelGrupo) {
          try {
            const { count } = await supabase
              .from(tabla)
              .select('*', { count: 'exact', head: true });
            
            if ((count || 0) > maxRegistros) {
              maxRegistros = count || 0;
              tablaPrincipal = tabla;
            }
          } catch (e) {
            // Ignorar errores
          }
        }
        
        if (tablaPrincipal) {
          console.log(`  ✅ Usar como principal: ${tablaPrincipal} (${maxRegistros} registros)`);
          console.log(`  🗑️  Considerar eliminar: ${tablasDelGrupo.filter(t => t !== tablaPrincipal).join(', ')}`);
        }
      }
    }
    
    console.log('\n🎯 CONCLUSIÓN:');
    console.log('El sistema tiene múltiples tablas con nombres similares que causan confusión.');
    console.log('Se recomienda estandarizar a una sola tabla por entidad y migrar los datos.');
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error.message);
  }
}

diagnosticarBasesCompletas();