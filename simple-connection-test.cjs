// Test simple de conexión a Supabase
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (actualizada con credenciales correctas)
const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmamJzb3hrZ211ZWhyZ3RlbGpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzUyNDYsImV4cCI6MjA3NjkxMTI0Nn0.fOnd4nQJhBI2rQkiqqeF08t5mpO1vIbN5YBsCOo-Hbo';

console.log('🔍 Probando conexión básica con Supabase...');
console.log('🌐 URL:', supabaseUrl);

try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Intentar una consulta simple
    supabase.from('_test_connection_').select('*').limit(1)
        .then(response => {
            if (response.error) {
                if (response.error.code === 'PGRST116') {
                    console.log('✅ Conexión exitosa - La base de datos está vacía (esperado)');
                    console.log('📝 Mensaje: La tabla _test_connection_ no existe, pero la conexión funciona');
                    console.log('🎯 Acción recomendada: Ejecuta los scripts SQL manualmente');
                } else {
                    console.log('❌ Error de conexión:', response.error.message);
                    console.log('🔍 Código:', response.error.code);
                }
            } else {
                console.log('✅ Conexión exitosa - Base de datos respondiendo');
            }
        })
        .catch(error => {
            console.log('❌ Error general:', error.message);
        });
        
} catch (error) {
    console.log('❌ Error al crear cliente Supabase:', error.message);
}

console.log('\n📋 Próximos pasos:');
console.log('1. Ve a: https://supabase.com/dashboard/project/rfjbsoxkgmuehrgteljq/sql');
console.log('2. Ejecuta: reset-database.sql');
console.log('3. Ejecuta: database-schema.sql');
console.log('4. Ejecuta: initial-data-fixed.sql');
console.log('5. Vuelve a verificar con: node simple-connection-test.cjs');