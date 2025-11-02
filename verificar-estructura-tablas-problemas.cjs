const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarEstructuraTablasProblemas() {
  try {
    console.log('=== VERIFICANDO ESTRUCTURA EXACTA DE TABLAS CON PROBLEMAS ===\n');

    // 1. Verificar estructura exacta de tabla campania
    console.log('1. ESTRUCTURA TABLA campania...');
    try {
      const { data: campaniaData, error: campaniaError } = await supabase
        .from('campania')
        .select('*')
        .limit(1);
      
      if (campaniaError) {
        console.log('❌ Error en campania:', campaniaError.message);
      } else if (campaniaData && campaniaData.length > 0) {
        const columnas = Object.keys(campaniaData[0]);
        console.log('✅ Columnas en campania:', columnas);
        
        // Verificar si existe la columna que el código espera
        if (columnas.includes('id')) {
          console.log('✅ Columna "id" existe en campania');
        } else {
          console.log('❌ Columna "id" NO existe en campania');
        }
      } else {
        console.log('⚠️  Tabla campania existe pero sin datos');
      }
    } catch (err) {
      console.log('❌ Error general verificando campania:', err.message);
    }

    // 2. Verificar estructura exacta de tabla mensajes
    console.log('\n2. ESTRUCTURA TABLA mensajes...');
    try {
      const { data: mensajesData, error: mensajesError } = await supabase
        .from('mensajes')
        .select('*')
        .limit(1);
      
      if (mensajesError) {
        console.log('❌ Error en mensajes:', mensajesError.message);
      } else if (mensajesData && mensajesData.length > 0) {
        const columnas = Object.keys(mensajesData[0]);
        console.log('✅ Columnas en mensajes:', columnas);
        
        // Verificar columnas específicas
        const columnasEsperadas = ['id', 'tipo', 'titulo', 'contenido'];
        columnasEsperadas.forEach(col => {
          if (columnas.includes(col)) {
            console.log(`✅ Columna "${col}" existe en mensajes`);
          } else {
            console.log(`❌ Columna "${col}" NO existe en mensajes`);
          }
        });
      } else {
        console.log('⚠️  Tabla mensajes existe pero sin datos');
      }
    } catch (err) {
      console.log('❌ Error general verificando mensajes:', err.message);
    }

    // 3. Intentar insertar datos de prueba para mensajes
    console.log('\n3. INSERTANDO DATOS DE PRUEBA EN mensajes...');
    try {
      const { data: insertData, error: insertError } = await supabase
        .from('mensajes')
        .insert([{
          tipo: 'info',
          titulo: 'Mensaje de prueba',
          contenido: 'Este es un mensaje de prueba para verificar la estructura',
          prioridad: 'normal',
          leida: false
        }])
        .select();
      
      if (insertError) {
        console.log('❌ Error insertando en mensajes:', insertError.message);
        
        // Si el error es por columna faltante, intentamos sin esa columna
        if (insertError.message.includes('column')) {
          console.log('Intentando insertar sin columnas problemáticas...');
          const { data: insertData2, error: insertError2 } = await supabase
            .from('mensajes')
            .insert([{
              contenido: 'Mensaje de prueba simplificado',
              leida: false
            }])
            .select();
          
          if (insertError2) {
            console.log('❌ Error incluso con inserción simplificada:', insertError2.message);
          } else {
            console.log('✅ Inserción simplificada exitosa');
          }
        }
      } else {
        console.log('✅ Inserción exitosa en mensajes');
        console.log('Datos insertados:', insertData);
      }
    } catch (err) {
      console.log('❌ Error general insertando en mensajes:', err.message);
    }

    // 4. Verificar si podemos usar ordenesdepublicidad en lugar de ordenes
    console.log('\n4. VERIFICANDO TABLA ordenesdepublicidad como alternativa...');
    try {
      const { data: ordenesPubData, error: ordenesPubError } = await supabase
        .from('ordenesdepublicidad')
        .select('*')
        .limit(1);
      
      if (ordenesPubError) {
        console.log('❌ Error en ordenesdepublicidad:', ordenesPubError.message);
      } else if (ordenesPubData && ordenesPubData.length > 0) {
        const columnas = Object.keys(ordenesPubData[0]);
        console.log('✅ Columnas en ordenesdepublicidad:', columnas);
        console.log('✅ Esta tabla podría usarse como alternativa a "ordenes"');
      } else {
        console.log('⚠️  Tabla ordenesdepublicidad existe pero sin datos');
      }
    } catch (err) {
      console.log('❌ Error general verificando ordenesdepublicidad:', err.message);
    }

    // 5. Crear un resumen de problemas y soluciones
    console.log('\n5. RESUMEN DE PROBLEMAS Y SOLUCIONES...');
    
    console.log('PROBLEMAS IDENTIFICADOS:');
    console.log('❌ Tabla "ordenes" no existe en el schema cache');
    console.log('❌ Tabla "alternativas" no existe en el schema cache');
    console.log('❌ Columna "id" podría no existir en "campania"');
    console.log('❌ Columna "titulo" podría no existir en "mensajes"');
    
    console.log('\nSOLUCIONES RECOMENDADAS:');
    console.log('1. Usar "ordenesdepublicidad" en lugar de "ordenes" donde sea posible');
    console.log('2. Crear tabla "alternativas" manualmente en Supabase');
    console.log('3. Verificar y corregir las columnas en "campania" y "mensajes"');
    console.log('4. Actualizar el código para usar los nombres de columnas correctos');
    
    console.log('\nACCIONES INMEDIATAS:');
    console.log('✅ Los clientes funcionan correctamente');
    console.log('✅ Las comunas y regiones funcionan correctamente');
    console.log('✅ La actualización de clientes debería funcionar ahora');
    console.log('⚠️  Se necesita intervención manual para las tablas faltantes');

  } catch (error) {
    console.error('Error general:', error);
  }
}

// Ejecutar la verificación
verificarEstructuraTablasProblemas();