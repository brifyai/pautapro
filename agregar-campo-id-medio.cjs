const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

async function agregarCampoIdMedio() {
  console.log('🔧 Agregando campo id_medio a la tabla soportes...\n');

  try {
    // 1. Primero verificar si podemos ejecutar SQL directamente
    console.log('🔍 Paso 1: Verificando si podemos ejecutar SQL...');
    
    // Intentar ejecutar SQL para agregar la columna
    const sql = `
      ALTER TABLE soportes 
      ADD COLUMN IF NOT EXISTS id_medio INTEGER;
    `;
    
    console.log('📝 SQL a ejecutar:', sql);
    
    // Nota: Supabase JS client no permite ejecutar SQL directamente
    // Necesitamos usar la API REST de Supabase o el dashboard
    
    console.log('\n⚠️  No se puede ejecutar SQL directamente con el cliente JS de Supabase.');
    console.log('💡 Opciones:');
    console.log('   1. Ir al dashboard de Supabase y ejecutar el SQL manualmente');
    console.log('   2. Usar la API REST de Supabase con el service role key');
    console.log('   3. Crear una migración con Supabase CLI');
    
    console.log('\n📋 Instrucciones para el dashboard de Supabase:');
    console.log('   1. Ir a https://supabase.com/dashboard');
    console.log('   2. Seleccionar el proyecto');
    console.log('   3. Ir a SQL Editor');
    console.log('   4. Ejecutar el siguiente SQL:');
    console.log('      ALTER TABLE soportes ADD COLUMN IF NOT EXISTS id_medio INTEGER;');
    
    console.log('\n🔄 Después de agregar la columna, ejecutar:');
    console.log('   node crear-relaciones-medios-soportes.cjs');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

agregarCampoIdMedio();