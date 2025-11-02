const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rfjbsoxkgmuehrgteljq.supabase.co',
  'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C'
);

async function checkRegiones() {
  try {
    const { data, error } = await supabase
      .from('region')
      .select('*')
      .order('id');
    
    if (error) throw error;
    
    console.log('Regiones encontradas:');
    data.forEach(region => {
      console.log(`ID: ${region.id}, Nombre: ${region.nombreregion}`);
    });
    
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

checkRegiones();