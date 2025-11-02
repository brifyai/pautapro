const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rfjbsoxkgmuehrgteljq.supabase.co',
  'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C'
);

async function createCompleteTemas() {
  try {
    console.log('=== CREANDO TEMAS COMPLETOS PARA TODAS LAS CAMPAÑAS ===\n');
    
    // 1. Obtener todas las campañas
    const { data: campanas, error: campanasError } = await supabase
      .from('campania')
      .select('id_campania, nombrecampania, id_cliente');
    
    if (campanasError) throw campanasError;
    console.log(`Campañas encontradas: ${campanas.length}`);
    
    // 2. Obtener todos los medios
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
    
    // 4. Obtener el siguiente ID para temas
    const { data: maxTema, error: maxTemaError } = await supabase
      .from('temas')
      .select('id_tema')
      .order('id_tema', { ascending: false })
      .limit(1);
    
    if (maxTemaError) throw maxTemaError;
    let siguienteIdTema = maxTema.length > 0 ? maxTema[0].id_tema + 1 : 1;
    
    console.log(`Siguiente ID de tema: ${siguienteIdTema}`);
    
    // 5. Asignación de medios por cliente
    const mediosPorCliente = {
      1: [1, 2, 5], // Cliente 1: Televisión, Radio, Digital
      2: [3, 4, 6], // Cliente 2: Prensa Escrita, Revistas, Redes Sociales
      3: [1, 5, 8], // Cliente 3: Televisión, Digital, Publicidad Exterior
      4: [5, 6, 8], // Cliente 4: Digital, Redes Sociales, Publicidad Exterior
      5: [1, 7, 9], // Cliente 5: Televisión, Cine, Transporte
      6: [2, 8, 10], // Cliente 6: Radio, Publicidad Exterior, Marketing Directo
      7: [1, 5, 8], // Cliente 7: Televisión, Digital, Publicidad Exterior
      8: [1, 5, 9], // Cliente 8: Televisión, Digital, Transporte
      9: [1, 5],    // Cliente 9: Televisión, Digital
      10: [1, 5],   // Cliente 10: Televisión, Digital
      11: [1, 5, 9]  // Cliente 11: Televisión, Digital, Transporte
    };
    
    let temasCreados = 0;
    let relacionesCreadas = 0;
    
    // 6. Crear temas para cada campaña
    for (const campana of campanas) {
      console.log(`\n--- Procesando campaña: ${campana.nombrecampania} (ID: ${campana.id_campania}) ---`);
      console.log(`Cliente ID: ${campana.id_cliente}`);
      
      // Obtener medios asignados para este cliente
      const mediosAsignadosIds = mediosPorCliente[campana.id_cliente] || [1, 5]; // Default
      const mediosAsignados = medios.filter(m => mediosAsignadosIds.includes(m.id));
      
      console.log(`Medios asignados: ${mediosAsignados.map(m => m.nombredelmedio).join(', ')}`);
      
      // Crear un tema para cada medio asignado
      for (const medio of mediosAsignados) {
        try {
          // Seleccionar una calidad aleatoria
          const calidadAleatoria = calidades[Math.floor(Math.random() * calidades.length)];
          
          // Crear datos del tema
          const temaData = {
            id_tema: siguienteIdTema,
            nombre_tema: `${campana.nombrecampania} - ${medio.nombredelmedio}`,
            descripcion: `Tema de ${medio.nombredelmedio} para la campaña ${campana.nombrecampania}`,
            id_medio: medio.id,
            id_calidad: calidadAleatoria.id,
            estado: true,
            c_orden: false
          };
          
          console.log(`  📝 Creando tema: "${temaData.nombre_tema}"`);
          
          // Insertar el tema
          const { data: temaInsertado, error: temaError } = await supabase
            .from('temas')
            .insert([temaData])
            .select()
            .single();
          
          if (temaError) {
            console.log(`  ❌ Error creando tema: ${temaError.message}`);
            continue;
          }
          
          // Crear la relación campaña-tema
          const { error: relacionError } = await supabase
            .from('campania_temas')
            .insert([{
              id_campania: campana.id_campania,
              id_temas: siguienteIdTema
            }]);
          
          if (relacionError) {
            console.log(`  ❌ Error creando relación: ${relacionError.message}`);
            continue;
          }
          
          console.log(`  ✅ Tema y relación creados (ID: ${siguienteIdTema})`);
          temasCreados++;
          relacionesCreadas++;
          siguienteIdTema++;
          
        } catch (error) {
          console.log(`  ❌ Error procesando medio ${medio.nombredelmedio}: ${error.message}`);
        }
      }
    }
    
    console.log('\n=== RESUMEN FINAL ===');
    console.log(`✅ Temas creados: ${temasCreados}`);
    console.log(`✅ Relaciones campaña-tema creadas: ${relacionesCreadas}`);
    console.log(`📋 Campañas procesadas: ${campanas.length}`);
    
    if (temasCreados > 0) {
      console.log('\n🎉 Todos los temas han sido creados y vinculados correctamente');
      console.log('Ahora deberían ser visibles en la interfaz de usuario');
    } else {
      console.log('\n📝 No se crearon temas nuevos');
    }
    
  } catch (error) {
    console.error('Error en el proceso:', error);
  }
}

// Ejecutar el proceso
createCompleteTemas();