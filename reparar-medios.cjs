const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (credenciales correctas del .env)
const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 REPARANDO DATOS DE MEDIOS');
console.log('=============================');

async function repararMedios() {
  try {
    // 1. Obtener todos los medios
    console.log('\n📋 1. Obteniendo medios existentes...');
    const { data: medios, error: errorMedios } = await supabase
      .from('medios')
      .select('*')
      .order('id', { ascending: true });
    
    if (errorMedios) {
      console.error('❌ Error obteniendo medios:', errorMedios.message);
      return;
    }
    
    console.log(`✅ Encontrados ${medios.length} medios`);
    
    // 2. Analizar y reparar cada medio
    console.log('\n🔍 2. Analizando y reparando medios...');
    
    for (const medio of medios) {
      console.log(`\n📝 Procesando medio ID: ${medio.id}`);
      
      // Verificar el estado actual
      console.log(`   Nombre actual: ${medio.nombre_medio}`);
      console.log(`   Tipo actual: ${medio.tipo_medio}`);
      console.log(`   Descripción: ${medio.descripcion || 'N/A'}`);
      
      // Determinar el nombre correcto basado en el ID o descripción
      let nombreCorrecto = null;
      let tipoCorrecto = null;
      
      if (medio.descripcion) {
        // Extraer nombre de la descripción
        if (medio.descripcion.includes('Google')) {
          nombreCorrecto = 'Google Ads';
          tipoCorrecto = 'Digital';
        } else if (medio.descripcion.includes('Facebook') || medio.descripcion.includes('Instagram')) {
          nombreCorrecto = 'Facebook & Instagram';
          tipoCorrecto = 'Redes Sociales';
        } else if (medio.descripcion.includes('YouTube')) {
          nombreCorrecto = 'YouTube';
          tipoCorrecto = 'Video';
        } else if (medio.descripcion.includes('Televisión')) {
          nombreCorrecto = 'Televisión';
          tipoCorrecto = 'TV';
        } else if (medio.descripcion.includes('Radio')) {
          nombreCorrecto = 'Radio';
          tipoCorrecto = 'Audio';
        } else if (medio.descripcion.includes('Prensa') || medio.descripcion.includes('Diario')) {
          nombreCorrecto = 'Prensa Escrita';
          tipoCorrecto = 'Impreso';
        } else {
          nombreCorrecto = medio.descripcion.split(' ').slice(0, 3).join(' ');
          tipoCorrecto = 'General';
        }
      } else {
        // Asignar nombres genéricos basados en ID
        const nombresGenericos = [
          'Televisión', 'Radio', 'Prensa', 'Revista', 'Cine', 
          'Vallas Publicitarias', 'Transporte', 'Digital', 'Redes Sociales', 'Email Marketing'
        ];
        const tiposGenericos = ['TV', 'Radio', 'Impreso', 'Digital', 'Exterior', 'Transporte', 'Social Media', 'Email'];
        
        nombreCorrecto = nombresGenericos[(medio.id - 1) % nombresGenericos.length];
        tipoCorrecto = tiposGenericos[(medio.id - 1) % tiposGenericos.length];
      }
      
      // 3. Actualizar el medio si es necesario
      if (!medio.nombre_medio || medio.nombre_medio === 'undefined' || medio.nombre_medio.trim() === '') {
        console.log(`   🔄 Actualizando nombre a: ${nombreCorrecto}`);
        console.log(`   🔄 Actualizando tipo a: ${tipoCorrecto}`);
        
        const { error: errorUpdate } = await supabase
          .from('medios')
          .update({
            nombre_medio: nombreCorrecto,
            tipo_medio: tipoCorrecto,
            updated_at: new Date().toISOString()
          })
          .eq('id', medio.id);
        
        if (errorUpdate) {
          console.error(`   ❌ Error actualizando medio ${medio.id}:`, errorUpdate.message);
        } else {
          console.log(`   ✅ Medio ${medio.id} actualizado correctamente`);
        }
      } else {
        console.log(`   ✅ Medio ${medio.id} ya tiene nombre válido: ${medio.nombre_medio}`);
      }
    }
    
    // 4. Verificar resultados
    console.log('\n🔍 3. Verificando resultados...');
    const { data: mediosActualizados, error: errorVerificacion } = await supabase
      .from('medios')
      .select('id, nombre_medio, tipo_medio, descripcion')
      .order('id', { ascending: true });
    
    if (errorVerificacion) {
      console.error('❌ Error en verificación:', errorVerificacion.message);
    } else {
      console.log('\n📊 Estado final de los medios:');
      mediosActualizados.forEach((medio, index) => {
        console.log(`  ${index + 1}. ID: ${medio.id}`);
        console.log(`     Nombre: ${medio.nombre_medio}`);
        console.log(`     Tipo: ${medio.tipo_medio || 'N/A'}`);
        console.log(`     Descripción: ${medio.descripcion || 'N/A'}`);
        console.log('');
      });
    }
    
    // 5. Estadísticas finales
    const mediosConNombre = mediosActualizados.filter(m => m.nombre_medio && m.nombre_medio !== 'undefined').length;
    const mediosConTipo = mediosActualizados.filter(m => m.tipo_medio).length;
    
    console.log('📈 ESTADÍSTICAS FINALES:');
    console.log(`   Total de medios: ${mediosActualizados.length}`);
    console.log(`   Medios con nombre válido: ${mediosConNombre} (${((mediosConNombre/mediosActualizados.length)*100).toFixed(1)}%)`);
    console.log(`   Medios con tipo válido: ${mediosConTipo} (${((mediosConTipo/mediosActualizados.length)*100).toFixed(1)}%)`);
    
    if (mediosConNombre === mediosActualizados.length) {
      console.log('\n🎉 ¡TODOS LOS MEDIOS HAN SIDO REPARADOS!');
      console.log('   Ahora deberían verse correctamente en la aplicación.');
    } else {
      console.log('\n⚠️  Algunos medios podrían necesitar revisión manual.');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar reparación
repararMedios();