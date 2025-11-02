const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rfjbsoxkgmuehrgteljq.supabase.co',
  'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C'
);

async function createTemasForAllCampaigns() {
  try {
    console.log('=== CREACIÓN DE TEMAS PARA TODAS LAS CAMPAÑAS ===\n');
    
    // 1. Obtener todas las campañas
    const { data: campanas, error: campanasError } = await supabase
      .from('campania')
      .select('id_campania, nombrecampania, id_cliente');
    
    if (campanasError) throw campanasError;
    console.log(`Campañas encontradas: ${campanas.length}`);
    
    // 2. Obtener todos los medios disponibles
    const { data: medios, error: mediosError } = await supabase
      .from('medios')
      .select('id, nombredelmedio');
    
    if (mediosError) throw mediosError;
    console.log(`Medios disponibles: ${medios.length}`);
    
    // 3. Obtener todas las calidades
    const { data: calidades, error: calidadesError } = await supabase
      .from('calidad')
      .select('id, nombrecalidad');
    
    if (calidadesError) throw calidadesError;
    console.log(`Calidades disponibles: ${calidades.length}`);
    
    // 4. Para cada campaña, crear temas vinculados a los medios del cliente
    for (const campana of campanas) {
      console.log(`\n--- Procesando campaña: ${campana.nombrecampania} (ID: ${campana.id_campania}) ---`);
      console.log(`Cliente ID: ${campana.id_cliente}`);
      
      // Asignar medios específicos para cada cliente
      const mediosPorCliente = getMediosPorCliente(campana.id_cliente, medios);
      console.log(`Medios asignados: ${mediosPorCliente.map(m => m.nombredelmedio).join(', ')}`);
      
      // Crear temas para cada medio asignado
      for (const medio of mediosPorCliente) {
        await createTemaForCampania(campana, medio, calidades);
      }
    }
    
    console.log('\n=== PROCESO COMPLETADO ===');
    console.log('Se han creado temas para todas las campañas con sus respectivos vínculos');
    
  } catch (error) {
    console.error('Error en el proceso:', error);
  }
}

function getMediosPorCliente(clienteId, medios) {
  // Asignar medios específicos según el cliente
  const asignaciones = {
    1: [1, 2, 5], // Cliente 1: Televisión, Radio, Digital
    2: [3, 4, 6], // Cliente 2: Prensa Escrita, Revistas, Redes Sociales
    4: [5, 6, 8], // Cliente 4: Digital, Redes Sociales, Publicidad Exterior
    5: [1, 7, 9], // Cliente 5: Televisión, Cine, Transporte
    6: [2, 8, 10]  // Cliente 6: Radio, Publicidad Exterior, Marketing Directo
  };
  
  const mediosIds = asignaciones[clienteId] || [1, 5]; // Default: Televisión y Digital
  return medios.filter(m => mediosIds.includes(m.id));
}

async function createTemaForCampania(campana, medio, calidades) {
  try {
    // Obtener el siguiente ID para temas
    const { data: maxIdData, error: maxIdError } = await supabase
      .from('temas')
      .select('id_tema')
      .order('id_tema', { ascending: false })
      .limit(1);
    
    if (maxIdError) throw maxIdError;
    const nextId = maxIdData.length > 0 ? maxIdData[0].id_tema + 1 : 1;
    
    // Seleccionar una calidad aleatoria
    const calidadAleatoria = calidades[Math.floor(Math.random() * calidades.length)];
    
    // Crear datos del tema según el medio
    const temaData = {
      id_tema: nextId,
      nombre_tema: `${campana.nombrecampania} - ${medio.nombredelmedio}`,
      id_medio: medio.id,
      estado: '1'
    };
    
    // Agregar campos específicos según el medio
    if (medio.nombredelmedio === 'Televisión' || medio.nombredelmedio === 'Radio') {
      temaData.duracion = Math.floor(Math.random() * 60) + 15; // 15-75 segundos
    }
    
    if (medio.nombredelmedio === 'Digital' || medio.nombredelmedio === 'Redes Sociales') {
      temaData.color = '#' + Math.floor(Math.random()*16777215).toString(16);
      temaData.cooperado = Math.random() > 0.5 ? 'Sí' : 'No';
    }
    
    if (medio.nombredelmedio === 'Prensa Escrita' || medio.nombredelmedio === 'Revistas') {
      temaData.codigo_megatime = 'MG' + Math.floor(Math.random() * 10000);
      temaData.rubro = 'Publicidad';
    }
    
    if (medio.nombredelmedio === 'Cine') {
      temaData.duracion = Math.floor(Math.random() * 30) + 10; // 10-40 segundos
      temaData.calidad = calidadAleatoria.id;
    }
    
    // Insertar el tema
    const { data: temaInsertado, error: temaError } = await supabase
      .from('temas')
      .insert([temaData])
      .select()
      .single();
    
    if (temaError) throw temaError;
    
    // Crear la relación campaña-tema
    const { error: relacionError } = await supabase
      .from('campania_temas')
      .insert([{
        id_campania: campana.id_campania,
        id_temas: nextId
      }]);
    
    if (relacionError) throw relacionError;
    
    console.log(`  ✓ Tema creado: "${temaData.nombre_tema}" (ID: ${nextId})`);
    
  } catch (error) {
    console.error(`  ✗ Error creando tema para campaña ${campana.id_campania}:`, error.message);
  }
}

// Ejecutar el proceso
createTemasForAllCampaigns();