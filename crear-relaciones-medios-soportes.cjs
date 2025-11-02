const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

async function crearRelacionesMediosSoportes() {
  console.log('🔗 Creando relaciones entre medios y soportes...\n');

  try {
    // 1. Obtener todos los medios
    console.log('📺 Paso 1: Obteniendo medios disponibles...');
    const { data: medios, error: errorMedios } = await supabase
      .from('medios')
      .select('*')
      .order('id');

    if (errorMedios) {
      console.error('❌ Error al obtener medios:', errorMedios);
      return;
    }

    console.log(`✅ Medios encontrados: ${medios.length}`);

    // 2. Obtener todos los soportes
    console.log('\n📋 Paso 2: Obteniendo soportes disponibles...');
    const { data: soportes, error: errorSoportes } = await supabase
      .from('soportes')
      .select('*')
      .order('id_soporte');

    if (errorSoportes) {
      console.error('❌ Error al obtener soportes:', errorSoportes);
      return;
    }

    console.log(`✅ Soportes encontrados: ${soportes.length}`);

    // 3. Verificar si la tabla soportes tiene el campo id_medio
    console.log('\n🔍 Paso 3: Verificando estructura de soportes...');
    const primerSoporte = soportes[0];
    console.log('Campos de soportes:', Object.keys(primerSoporte));

    // 4. Crear relaciones basadas en el nombre del soporte
    console.log('\n🔗 Paso 4: Creando relaciones...');
    
    let relacionesCreadas = 0;
    
    for (const soporte of soportes) {
      const nombreSoporte = (soporte.nombreidentificador || soporte.nombreidentficiador || '').toLowerCase();
      let medioId = null;

      // Asignar soportes a medios basado en el nombre
      if (nombreSoporte.includes('tv') || nombreSoporte.includes('televisión') || nombreSoporte.includes('television')) {
        // Asignar a TV Abierta o TV Cable
        if (nombreSoporte.includes('cable') || nombreSoporte.includes('satelital')) {
          medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('cable'))?.id_medio;
        } else {
          medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('abierta'))?.id_medio;
        }
      } else if (nombreSoporte.includes('radio') || nombreSoporte.includes('fm') || nombreSoporte.includes('am')) {
        // Asignar a Radio AM o FM
        if (nombreSoporte.includes('fm')) {
          medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('fm'))?.id_medio;
        } else {
          medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('am'))?.id_medio;
        }
      } else if (nombreSoporte.includes('diario') || nombreSoporte.includes('periódico') || nombreSoporte.includes('periodico')) {
        medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('diario'))?.id_medio;
      } else if (nombreSoporte.includes('revista')) {
        medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('revista'))?.id_medio;
      } else if (nombreSoporte.includes('internet') || nombreSoporte.includes('banner') || nombreSoporte.includes('web')) {
        medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('internet'))?.id_medio;
      } else if (nombreSoporte.includes('redes') || nombreSoporte.includes('social') || nombreSoporte.includes('facebook') || nombreSoporte.includes('instagram')) {
        medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('redes'))?.id_medio;
      } else if (nombreSoporte.includes('cine')) {
        medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('cine'))?.id_medio;
      } else if (nombreSoporte.includes('vía') || nombreSoporte.includes('via') || nombreSoporte.includes('publica') || nombreSoporte.includes('público')) {
        medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('vía'))?.id_medio;
      } else if (nombreSoporte.includes('transporte') || nombreSoporte.includes('bus') || nombreSoporte.includes('metro')) {
        medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('transporte'))?.id_medio;
      } else if (nombreSoporte.includes('digital') || nombreSoporte.includes('marketing') || nombreSoporte.includes('seo') || nombreSoporte.includes('google')) {
        medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('digital'))?.id_medio;
      } else if (nombreSoporte.includes('streaming') || nombreSoporte.includes('netflix') || nombreSoporte.includes('youtube')) {
        medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('streaming'))?.id_medio;
      }

      // Si no se encontró coincidencia específica, asignar al primer medio disponible
      if (!medioId && medios.length > 0) {
        medioId = medios[0].id_medio;
      }

      if (medioId) {
        // Actualizar el soporte con el id_medio
        const { error: errorUpdate } = await supabase
          .from('soportes')
          .update({ id_medio: medioId })
          .eq('id_soporte', soporte.id_soporte);

        if (errorUpdate) {
          console.error(`❌ Error al actualizar soporte ${soporte.id_soporte}:`, errorUpdate);
        } else {
          const medioNombre = medios.find(m => m.id_medio === medioId)?.nombre_medio || 'Medio desconocido';
          console.log(`✅ Soporte "${soporte.nombreidentificador}" asignado a ${medioNombre}`);
          relacionesCreadas++;
        }
      } else {
        console.log(`⚠️  No se pudo asignar el soporte "${soporte.nombreidentificador}" a ningún medio`);
      }
    }

    console.log(`\n🎉 Relaciones creadas: ${relacionesCreadas} de ${soportes.length} soportes`);

    // 5. Verificar las relaciones creadas
    console.log('\n🔍 Paso 5: Verificando relaciones...');
    
    for (const medio of medios.slice(0, 5)) { // Solo los primeros 5 para no saturar
      const { data: soportesMedio, error: errorSoportesMedio } = await supabase
        .from('soportes')
        .select('*')
        .eq('id_medio', medio.id_medio);

      if (errorSoportesMedio) {
        console.error(`❌ Error al verificar soportes de ${medio.nombre_medio}:`, errorSoportesMedio);
      } else {
        console.log(`📋 ${medio.nombre_medio}: ${soportesMedio.length} soportes asignados`);
      }
    }

    console.log('\n✅ Proceso completado. Ahora los medios deberían verse en http://localhost:3002/medios');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

crearRelacionesMediosSoportes();