import { supabase } from './src/config/supabase.js';

async function checkClientesSchema() {
  try {
    console.log('🔍 Verificando esquema de tabla clientes...');
    
    // Obtener primeros 5 clientes con todos los campos
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Clientes encontrados:', data.length);
      console.log('📋 Campos disponibles:', Object.keys(data[0]));
      console.log('📊 Primer cliente:', JSON.stringify(data[0], null, 2));
    } else {
      console.log('⚠️ No hay clientes en la tabla');
    }
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkClientesSchema();
