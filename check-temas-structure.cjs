const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rfjbsoxkgmuehrgteljq.supabase.co',
  'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C'
);

async function checkTemasStructure() {
  try {
    console.log('=== VERIFICANDO ESTRUCTURA DE TABLA TEMAS ===\n');
    
    // Intentar obtener un tema existente para ver la estructura
    const { data: temas, error: temasError } = await supabase
      .from('temas')
      .select('*')
      .limit(3);
    
    if (temasError) {
      console.error('Error al obtener temas:', temasError);
      return;
    }
    
    console.log('Temas existentes:');
    if (temas && temas.length > 0) {
      console.log('Estructura de datos:');
      console.log(JSON.stringify(temas[0], null, 2));
      
      console.log('\nCampos encontrados:');
      Object.keys(temas[0]).forEach(key => {
        console.log(`  - ${key}: ${typeof temas[0][key]} (${temas[0][key]})`);
      });
    } else {
      console.log('No hay temas existentes. Intentando insertar uno de prueba...');
      
      // Intentar insertar un tema básico para ver qué campos acepta
      const temaPrueba = {
        nombre_tema: 'Tema de prueba',
        id_medio: 1,
        estado: '1'
      };
      
      const { data: insertResult, error: insertError } = await supabase
        .from('temas')
        .insert([temaPrueba])
        .select()
        .single();
      
      if (insertError) {
        console.error('Error al insertar tema de prueba:', insertError);
      } else {
        console.log('Tema de prueba insertado:');
        console.log(JSON.stringify(insertResult, null, 2));
        
        // Eliminar el tema de prueba
        await supabase
          .from('temas')
          .delete()
          .eq('id_tema', insertResult.id_tema);
      }
    }
    
    // Verificar también la estructura de campania_temas
    console.log('\n=== VERIFICANDO ESTRUCTURA DE TABLA CAMPANIA_TEMAS ===');
    const { data: relaciones, error: relacionesError } = await supabase
      .from('campania_temas')
      .select('*')
      .limit(3);
    
    if (relacionesError) {
      console.error('Error al obtener relaciones:', relacionesError);
    } else {
      console.log('Relaciones campaña-temas existentes:');
      if (relaciones && relaciones.length > 0) {
        console.log(JSON.stringify(relaciones[0], null, 2));
        
        console.log('\nCampos encontrados en campania_temas:');
        Object.keys(relaciones[0]).forEach(key => {
          console.log(`  - ${key}: ${typeof relaciones[0][key]} (${relaciones[0][key]})`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error en la verificación:', error);
  }
}

checkTemasStructure();