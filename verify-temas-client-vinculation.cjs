const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rfjbsoxkgmuehrgteljq.supabase.co',
  'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C'
);

async function verifyTemasClientVinculation() {
  try {
    console.log('=== VERIFICANDO VÍNCULOS TEMAS-CLIENTES ===\n');
    
    // 1. Obtener todas las campañas con sus clientes
    const { data: campanas, error: campanasError } = await supabase
      .from('campania')
      .select('id_campania, nombrecampania, id_cliente');
    
    if (campanasError) throw campanasError;
    console.log(`Campañas encontradas: ${campanas.length}`);
    
    // 2. Obtener todos los temas con sus relaciones
    const { data: temas, error: temasError } = await supabase
      .from('temas')
      .select(`
        id_tema,
        nombre_tema,
        id_medio,
        estado,
        campania_temas!inner(
          id_campania
        )
      `);
    
    if (temasError) throw temasError;
    console.log(`Temas encontrados: ${temas.length}`);
    
    // 3. Obtener todos los contratos para verificar medios por cliente
    const { data: contratos, error: contratosError } = await supabase
      .from('contratos')
      .select('*');
    
    if (contratosError) throw contratosError;
    console.log(`Contratos encontrados: ${contratos.length}`);
    
    // 4. Obtener todos los medios
    const { data: medios, error: mediosError } = await supabase
      .from('medios')
      .select('id, nombredelmedio');
    
    if (mediosError) throw mediosError;
    
    // 5. Analizar cada tema y sus vínculos
    console.log('\n=== ANÁLISIS DE VÍNCULOS ===');
    
    for (const tema of temas) {
      const idCampania = tema.campania_temas[0]?.id_campania;
      const campana = campanas.find(c => c.id_campania === idCampania);
      
      if (!campana) {
        console.log(`⚠️  Tema "${tema.nombre_tema}" (ID: ${tema.id_tema}) - SIN CAMPAÑA ASOCIADA`);
        continue;
      }
      
      const medio = medios.find(m => m.id === tema.id_medio);
      const contratosCliente = contratos.filter(c => c.id_cliente === campana.id_cliente);
      const contratoConMedio = contratosCliente.find(c => c.idmedios === tema.id_medio);
      
      console.log(`📋 Tema: "${tema.nombre_tema}" (ID: ${tema.id_tema})`);
      console.log(`   Campaña: "${campana.nombrecampania}" (ID: ${campana.id_campania})`);
      console.log(`   Cliente ID: ${campana.id_cliente}`);
      console.log(`   Medio: ${medio?.nombredelmedio || 'No asignado'} (ID: ${tema.id_medio})`);
      console.log(`   Contratos del cliente: ${contratosCliente.length}`);
      console.log(`   ¿Tiene contrato con este medio?: ${contratoConMedio ? '✅ SÍ' : '❌ NO'}`);
      
      if (!contratoConMedio) {
        console.log(`   ⚠️  PROBLEMA: El cliente ${campana.id_cliente} no tiene contratos con el medio ${tema.id_medio}`);
        
        // Verificar si el cliente tiene algún contrato
        if (contratosCliente.length === 0) {
          console.log(`   🚨 El cliente ${campana.id_cliente} no tiene NINGÚN contrato`);
        } else {
          console.log(`   📝 Medios disponibles para este cliente:`);
          contratosCliente.forEach(c => {
            const medioDisponible = medios.find(m => m.id === c.idmedios);
            console.log(`      - ${medioDisponible?.nombredelmedio || 'Medio no encontrado'} (ID: ${c.idmedios})`);
          });
        }
      }
      
      console.log('');
    }
    
    // 6. Resumen de problemas
    console.log('=== RESUMEN DE PROBLEMAS ===');
    let problemasEncontrados = 0;
    
    for (const tema of temas) {
      const idCampania = tema.campania_temas[0]?.id_campania;
      const campana = campanas.find(c => c.id_campania === idCampania);
      
      if (campana) {
        const contratosCliente = contratos.filter(c => c.id_cliente === campana.id_cliente);
        const contratoConMedio = contratosCliente.find(c => c.idmedios === tema.id_medio);
        
        if (!contratoConMedio) {
          problemasEncontrados++;
          console.log(`❌ Tema "${tema.nombre_tema}" - Cliente ${campana.id_cliente} sin contrato con medio ${tema.id_medio}`);
        }
      }
    }
    
    if (problemasEncontrados === 0) {
      console.log('✅ Todos los temas están correctamente vinculados a clientes con contratos apropiados');
    } else {
      console.log(`🚨 Se encontraron ${problemasEncontrados} temas con problemas de vinculación`);
    }
    
  } catch (error) {
    console.error('Error en la verificación:', error);
  }
}

verifyTemasClientVinculation();