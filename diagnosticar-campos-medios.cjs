const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (credenciales correctas del .env)
const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 DIAGNÓSTICO DETALLADO DE CAMPOS DE MEDIOS');
console.log('============================================');

async function diagnosticarCampos() {
  try {
    // 1. Obtener solo los campos específicos
    console.log('\n📋 1. Consulta específica de campos nombre_medio y tipo_medio...');
    const { data: camposEspecificos, error: errorEspecificos } = await supabase
      .from('medios')
      .select('id, nombre_medio, tipo_medio')
      .order('id', { ascending: true });
    
    if (errorEspecificos) {
      console.error('❌ Error en consulta específica:', errorEspecificos.message);
    } else {
      console.log('✅ Campos específicos:');
      camposEspecificos.forEach((medio, index) => {
        console.log(`  ${index + 1}. ID: ${medio.id}`);
        console.log(`     nombre_medio: "${medio.nombre_medio}" (tipo: ${typeof medio.nombre_medio})`);
        console.log(`     tipo_medio: "${medio.tipo_medio}" (tipo: ${typeof medio.tipo_medio})`);
        console.log('');
      });
    }
    
    // 2. Obtener todos los campos para comparar
    console.log('\n📋 2. Consulta completa de todos los campos...');
    const { data: todosCampos, error: errorTodos } = await supabase
      .from('medios')
      .select('*')
      .order('id', { ascending: true })
      .limit(3); // Solo los primeros 3 para no saturar
    
    if (errorTodos) {
      console.error('❌ Error en consulta completa:', errorTodos.message);
    } else {
      console.log('✅ Todos los campos (primeros 3 registros):');
      todosCampos.forEach((medio, index) => {
        console.log(`\n  ${index + 1}. MEDIO ID: ${medio.id}`);
        console.log('     Todos los campos y valores:');
        Object.entries(medio).forEach(([key, value]) => {
          console.log(`       ${key}: "${value}" (tipo: ${typeof value})`);
        });
      });
    }
    
    // 3. Verificar si hay diferencias entre consultas
    console.log('\n📋 3. Verificación de consistencia...');
    
    // Contar medios con nombre_medio válido
    const conNombreValido = camposEspecificos.filter(m => 
      m.nombre_medio && 
      m.nombre_medio !== 'undefined' && 
      typeof m.nombre_medio === 'string' && 
      m.nombre_medio.trim() !== ''
    ).length;
    
    const conTipoValido = camposEspecificos.filter(m => 
      m.tipo_medio && 
      m.tipo_medio !== 'undefined' && 
      typeof m.tipo_medio === 'string' && 
      m.tipo_medio.trim() !== ''
    ).length;
    
    console.log(`📊 Estadísticas:`);
    console.log(`   Total de medios: ${camposEspecificos.length}`);
    console.log(`   Con nombre_medio válido: ${conNombreValido}`);
    console.log(`   Con tipo_medio válido: ${conTipoValido}`);
    
    // 4. Probar una consulta raw para verificar
    console.log('\n📋 4. Intentando consulta SQL directa...');
    try {
      const { data: rawData, error: rawError } = await supabase
        .rpc('exec_sql', { 
          sql_query: 'SELECT id, nombre_medio, tipo_medio FROM medios ORDER BY id LIMIT 5' 
        });
      
      if (rawError) {
        console.log('⚠️  No se puede ejecutar SQL directo:', rawError.message);
      } else {
        console.log('✅ Resultado SQL directo:');
        console.log(rawData);
      }
    } catch (error) {
      console.log('⚠️  Error intentando SQL directo:', error.message);
    }
    
    // 5. Recomendaciones basadas en los resultados
    console.log('\n💡 5. ANÁLISIS Y RECOMENDACIONES:');
    
    if (conNombreValido === camposEspecificos.length) {
      console.log('✅ Todos los medios tienen nombre_medio válido');
      console.log('   El problema podría estar en el componente Medios.jsx');
      console.log('   Revisa la consola del navegador en http://localhost:3002/medios');
    } else {
      console.log('⚠️  Hay medios con nombre_medio inválido');
      console.log('   Se necesita reparar los datos');
    }
    
    console.log('\n🎯 PASOS A SEGUIR:');
    console.log('1. Abre http://localhost:3002/medios en el navegador');
    console.log('2. Abre la consola de desarrollador (F12)');
    console.log('3. Revisa si hay errores de JavaScript');
    console.log('4. Revisa la pestaña Network para ver las llamadas a Supabase');
    console.log('5. Recarga la página y observa las solicitudes');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar diagnóstico
diagnosticarCampos();