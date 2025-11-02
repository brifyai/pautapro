const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (credenciales correctas del .env)
const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

console.log('🔍 DIAGNÓSTICO DE CONEXIÓN A SUPABASE');
console.log('=====================================');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...');

try {
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Cliente Supabase creado');
  
  // Probar conexión simple
  console.log('\n🔄 Probando conexión...');
  
  // Intentar obtener información del schema
  supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Error obteniendo schema:', error.message);
      } else {
        console.log('✅ Schema obtenido:', data?.length || 0, 'tablas');
        data?.forEach(table => console.log('  -', table.table_name));
      }
    })
    .catch(err => {
      console.error('❌ Error de conexión:', err.message);
    });
  
  // Probar con tabla específica
  console.log('\n🔄 Probando tabla medios...');
  supabase
    .from('medios')
    .select('count')
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Error con tabla medios:', error.message);
        console.error('Código:', error.code);
        console.error('Detalles:', error.details);
      } else {
        console.log('✅ Tabla medios accesible:', data?.length || 0, 'registros');
      }
    })
    .catch(err => {
      console.error('❌ Error general:', err.message);
    });
    
} catch (error) {
  console.error('❌ Error creando cliente:', error.message);
}

console.log('\n🏁 Diagnóstico completado');