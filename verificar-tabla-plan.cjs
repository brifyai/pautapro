const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkPlanTable() {
  console.log('🔍 Verificando estructura de la tabla plan...');
  
  // Intentar obtener un registro para ver la estructura
  const { data, error } = await supabase
    .from('plan')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('❌ Error:', error);
  } else if (data && data.length > 0) {
    console.log('✅ Estructura de la tabla plan:');
    console.log('Campos:', Object.keys(data[0]));
    console.log('Registro ejemplo:', data[0]);
  } else {
    console.log('ℹ️  No hay registros en la tabla plan');
  }
}

checkPlanTable();