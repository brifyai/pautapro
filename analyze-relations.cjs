const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rfjbsoxkgmuehrgteljq.supabase.co',
  'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C'
);

async function analyzeRelations() {
  try {
    console.log('=== ANÁLISIS DE RELACIONES ENTRE TABLAS ===\n');
    
    // 1. Verificar campañas con sus clientes
    console.log('1. CAMPAÑAS Y SUS CLIENTES:');
    const { data: campanas, error: campanasError } = await supabase
      .from('campania')
      .select('id_campania, nombrecampania, id_cliente, id_agencia, id_producto, id_anio')
      .limit(10);
    
    if (campanasError) throw campanasError;
    console.log('Campañas encontradas:', campanas.length);
    campanas.forEach(c => {
      console.log(`  - ${c.nombrecampania} (ID: ${c.id_campania}) → Cliente ID: ${c.id_cliente}`);
    });
    
    // 2. Verificar contratos con sus clientes y medios
    console.log('\n2. CONTRATOS Y SUS RELACIONES:');
    const { data: contratos, error: contratosError } = await supabase
      .from('contratos')
      .select('*')
      .limit(15);
    
    if (contratosError) throw contratosError;
    console.log('Contratos encontrados:', contratos.length);
    contratos.forEach(c => {
      console.log(`  - ${c.nombrecontrato} (ID: ${c.id}) → Cliente ID: ${c.id_cliente}, Medio ID: ${c.id_medio}`);
    });
    
    // 3. Verificar medios disponibles
    console.log('\n3. MEDIOS DISPONIBLES:');
    const { data: medios, error: mediosError } = await supabase
      .from('medios')
      .select('id, nombredelmedio')
      .order('nombredelmedio');
    
    if (mediosError) throw mediosError;
    console.log('Medios encontrados:', medios.length);
    medios.forEach(m => {
      console.log(`  - ${m.nombredelmedio} (ID: ${m.id})`);
    });
    
    // 4. Verificar clientes únicos en campañas
    console.log('\n4. CLIENTES ÚNICOS EN CAMPAÑAS:');
    const uniqueClienteIds = [...new Set(campanas.map(c => c.id_cliente).filter(id => id))];
    console.log('Clientes únicos con campañas:', uniqueClienteIds.length);
    
    // 5. Para cada cliente, mostrar sus contratos y medios disponibles
    console.log('\n5. ANÁLISIS POR CLIENTE:');
    for (const clienteId of uniqueClienteIds) {
      console.log(`\n  Cliente ID: ${clienteId}`);
      
      // Contratos del cliente
      const { data: contratosCliente, error: contratosClienteError } = await supabase
        .from('contratos')
        .select('*')
        .eq('id_cliente', clienteId);
      
      if (contratosClienteError) throw contratosClienteError;
      console.log(`    Contratos: ${contratosCliente.length}`);
      contratosCliente.forEach(c => {
        const medio = medios.find(m => m.id === c.id_medio);
        console.log(`      - ${c.nombrecontrato} → Medio: ${medio?.nombredelmedio || 'No encontrado'}`);
      });
      
      // Campañas del cliente
      const campanasCliente = campanas.filter(c => c.id_cliente === clienteId);
      console.log(`    Campañas: ${campanasCliente.length}`);
      campanasCliente.forEach(c => {
        console.log(`      - ${c.nombrecampania} (ID: ${c.id_campania})`);
      });
    }
    
    // 6. Verificar temas existentes
    console.log('\n6. TEMAS EXISTENTES:');
    const { data: temas, error: temasError } = await supabase
      .from('temas')
      .select('id_tema, NombreTema, id_medio')
      .limit(10);
    
    if (temasError) throw temasError;
    console.log('Temas encontrados:', temas.length);
    temas.forEach(t => {
      const medio = medios.find(m => m.id === t.id_medio);
      console.log(`  - ${t.NombreTema} (ID: ${t.id_tema}) → Medio: ${medio?.nombredelmedio || 'No asignado'}`);
    });
    
    // 7. Verificar relaciones campaña-temas
    console.log('\n7. RELACIONES CAMPAÑA-TEMAS:');
    const { data: relaciones, error: relacionesError } = await supabase
      .from('campania_temas')
      .select('*')
      .limit(10);
    
    if (relacionesError) throw relacionesError;
    console.log('Relaciones encontradas:', relaciones.length);
    relaciones.forEach(r => {
      console.log(`  - Campaña ID: ${r.id_campania} → Tema ID: ${r.id_temas}`);
    });
    
    console.log('\n=== RESUMEN PARA CREACIÓN DE TEMAS ===');
    console.log('Para crear temas correctamente, necesito:');
    console.log('1. Para cada campaña, identificar su cliente');
    console.log('2. Para cada cliente, obtener sus contratos con medios');
    console.log('3. Para cada contrato, crear temas vinculados al medio correspondiente');
    console.log('4. Asegurar que cada tema se vincule correctamente a la campaña');
    
  } catch (error) {
    console.error('Error en el análisis:', error);
  }
}

analyzeRelations();