import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosticarComunas() {
  try {
    console.log('🔍 Diagnosticando estructura de la tabla comunas...');

    // Intentar obtener todas las comunas sin especificar columnas
    const { data: comunas, error } = await supabase
      .from('comunas')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error al obtener comunas:', error);
      
      // Si hay error, intentar ver si la tabla existe
      console.log('\n🔍 Intentando verificar si la tabla comunas existe...');
      
      // Intentar insertar una comuna de prueba para ver la estructura
      const { error: insertError } = await supabase
        .from('comunas')
        .insert({ 
          nombrecomuna: 'Comuna Prueba', 
          id_region: 7 
        });

      if (insertError) {
        console.log('❌ Error al insertar comuna de prueba:', insertError);
        
        // Intentar con diferentes nombres de columna
        console.log('\n🔍 Probando diferentes estructuras de columna...');
        
        const pruebas = [
          { nombreComuna: 'Comuna Prueba', id_region: 7 },
          { nombre_comuna: 'Comuna Prueba', id_region: 7 },
          { nombre: 'Comuna Prueba', id_region: 7 }
        ];
        
        for (let i = 0; i < pruebas.length; i++) {
          const prueba = pruebas[i];
          console.log(`\n📝 Probando estructura ${i + 1}:`, Object.keys(prueba));
          
          const { error: testError } = await supabase
            .from('comunas')
            .insert(prueba);
            
          if (testError) {
            console.log(`❌ Error:`, testError.message);
          } else {
            console.log(`✅ Estructura ${i + 1} funcionó!`);
            
            // Eliminar la comuna de prueba
            await supabase
              .from('comunas')
              .delete()
              .eq('nombrecomuna', 'Comuna Prueba');
            
            break;
          }
        }
      } else {
        console.log('✅ Inserción exitosa con nombrecomuna');
      }
    } else {
      console.log('📊 Estructura de la tabla comunas:');
      if (comunas.length > 0) {
        const columnas = Object.keys(comunas[0]);
        console.log('Columnas:', columnas);
        console.log('Datos de ejemplo:', comunas[0]);
      } else {
        console.log('La tabla existe pero está vacía');
      }
    }

    // Verificar si podemos obtener el schema de la tabla
    console.log('\n🔍 Verificando información de la tabla...');
    
    // Intentar obtener información de la tabla region para comparar
    const { data: regionInfo } = await supabase
      .from('region')
      .select('*')
      .limit(1);
      
    if (regionInfo && regionInfo.length > 0) {
      console.log('📊 Estructura de tabla region (referencia):');
      console.log('Columnas:', Object.keys(regionInfo[0]));
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar diagnóstico
diagnosticarComunas();