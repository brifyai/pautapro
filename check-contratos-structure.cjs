const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rfjbsoxkgmuehrgteljq.supabase.co',
  'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C'
);

async function checkContratosStructure() {
  try {
    console.log('=== VERIFICANDO ESTRUCTURA DE TABLA CONTRATOS ===\n');
    
    // Obtener contratos existentes para ver la estructura
    const { data: contratos, error: contratosError } = await supabase
      .from('contratos')
      .select('*')
      .limit(3);
    
    if (contratosError) {
      console.error('Error al obtener contratos:', contratosError);
      return;
    }
    
    console.log('Contratos existentes:');
    if (contratos && contratos.length > 0) {
      console.log('Estructura de datos:');
      console.log(JSON.stringify(contratos[0], null, 2));
      
      console.log('\nCampos encontrados:');
      Object.keys(contratos[0]).forEach(key => {
        console.log(`  - ${key}: ${typeof contratos[0][key]} (${contratos[0][key]})`);
      });
    } else {
      console.log('No hay contratos existentes. Intentando insertar uno de prueba...');
      
      // Intentar insertar un contrato básico para ver qué campos acepta
      const contratoPrueba = {
        id_cliente: 1,
        idmedios: 1,
        estado: true
      };
      
      const { data: insertResult, error: insertError } = await supabase
        .from('contratos')
        .insert([contratoPrueba])
        .select()
        .single();
      
      if (insertError) {
        console.error('Error al insertar contrato de prueba:', insertError);
      } else {
        console.log('Contrato de prueba insertado:');
        console.log(JSON.stringify(insertResult, null, 2));
        
        // Eliminar el contrato de prueba
        await supabase
          .from('contratos')
          .delete()
          .eq('id', insertResult.id);
      }
    }
    
  } catch (error) {
    console.error('Error en la verificación:', error);
  }
}

checkContratosStructure();