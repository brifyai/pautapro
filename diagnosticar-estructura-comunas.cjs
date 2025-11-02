const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rfjbsoxkgmuehrgteljq.supabase.co',
  'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C'
);

async function diagnosticarEstructura() {
  try {
    console.log('Verificando estructura de la tabla comunas...');
    
    // Intentar obtener datos para ver la estructura
    const { data, error } = await supabase
      .from('comunas')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Error al consultar comunas:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Estructura encontrada (primer registro):');
      console.log(data[0]);
      console.log('\nColumnas disponibles:', Object.keys(data[0]));
    } else {
      console.log('La tabla comunas está vacía o no existe');
    }
    
    // También verificar si hay alguna otra tabla similar
    console.log('\nVerificando tablas disponibles...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%comuna%');
    
    if (tablesError) {
      console.log('No se puede verificar tablas (posiblemente por permisos)');
    } else {
      console.log('Tablas con "comuna" en el nombre:', tables);
    }
    
  } catch (error) {
    console.error('Error general:', error);
  }
}

diagnosticarEstructura();