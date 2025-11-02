import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosticarRegiones() {
  try {
    console.log('🔍 Diagnosticando regiones en la base de datos...');

    // Obtener todas las regiones
    const { data: regiones, error } = await supabase
      .from('region')
      .select('*');

    if (error) {
      console.error('❌ Error al obtener regiones:', error);
      return;
    }

    console.log('📊 Regiones encontradas:');
    regiones.forEach((region, index) => {
      console.log(`${index + 1}. ID: ${region.id}, Nombre: ${region.nombreregion || region.nombre_region || region.nombre}`);
    });

    // Verificar estructura de la tabla
    console.log('\n🔍 Estructura de la tabla region:');
    if (regiones.length > 0) {
      const columnas = Object.keys(regiones[0]);
      console.log('Columnas:', columnas);
    }

    // Ahora verificar comunas
    const { data: comunas, error: errorComunas } = await supabase
      .from('comunas')
      .select('*');

    if (errorComunas) {
      console.error('❌ Error al obtener comunas:', errorComunas);
    } else {
      console.log(`\n📊 Comunas encontradas: ${comunas.length}`);
      if (comunas.length > 0) {
        comunas.forEach((comuna, index) => {
          console.log(`${index + 1}. ID: ${comuna.id}, Nombre: ${comuna.nombreComuna || comuna.nombre_comuna || comuna.nombre}, ID Región: ${comuna.id_region}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar diagnóstico
diagnosticarRegiones();