import { createClient } from '@supabase/supabase-js';

// Variables de entorno directamente
const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseAnonKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

console.log('🔍 Probando conexión con Supabase...');
console.log('📡 URL:', supabaseUrl);
console.log('🔑 Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'UNDEFINED');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Falta configuración de Supabase en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('🔄 Intentando conectar...');
    
    // Probar conexión básica
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error.message);
      console.error('📋 Detalles:', error);
      
      // Probar una consulta más simple
      console.log('🔄 Intentando consulta simple...');
      const { data: simpleData, error: simpleError } = await supabase
        .rpc('version');
      
      if (simpleError) {
        console.error('❌ Error en consulta simple:', simpleError.message);
      } else {
        console.log('✅ Conexión básica funciona');
      }
      
      return false;
    }
    
    console.log('✅ Conexión exitosa');
    console.log('📊 Tablas encontradas:', data.length);
    
    // Listar tablas disponibles
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (tablesError) {
      console.error('❌ Error obteniendo tablas:', tablesError.message);
    } else {
      console.log('📋 Tablas disponibles:');
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
    return true;
    
  } catch (err) {
    console.error('❌ Error general:', err.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('🎉 Prueba completada exitosamente');
  } else {
    console.log('💥 La prueba falló');
    console.log('\n🔧 Posibles soluciones:');
    console.log('1. Verificar que el proyecto de Supabase exista');
    console.log('2. Verificar que la clave anónima sea correcta');
    console.log('3. Verificar que las tablas estén creadas');
    console.log('4. Verificar permisos de acceso');
  }
  process.exit(success ? 0 : 1);
});