import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

// Datos de regiones de Chile
const regiones = [
  'Región de Arica y Parinacota',
  'Región de Tarapacá',
  'Región de Antofagasta',
  'Región de Atacama',
  'Región de Coquimbo',
  'Región de Valparaíso',
  'Región Metropolitana de Santiago',
  'Región del Libertador General Bernardo O\'Higgins',
  'Región del Maule',
  'Región de Ñuble',
  'Región del Biobío',
  'Región de La Araucanía',
  'Región de Los Ríos',
  'Región de Los Lagos',
  'Región de Aysén del General Carlos Ibáñez del Campo',
  'Región de Magallanes y de la Antártica Chilena'
];

// Datos de comunas de Chile
const comunas = [
  // Región Metropolitana (id=7)
  { nombre: 'Santiago', id_region: 7 },
  { nombre: 'Providencia', id_region: 7 },
  { nombre: 'Las Condes', id_region: 7 },
  { nombre: 'Vitacura', id_region: 7 },
  { nombre: 'La Reina', id_region: 7 },
  { nombre: 'Peñalolén', id_region: 7 },
  { nombre: 'La Florida', id_region: 7 },
  { nombre: 'Puente Alto', id_region: 7 },
  { nombre: 'Maipú', id_region: 7 },
  { nombre: 'San Bernardo', id_region: 7 },
  // Región de Valparaíso (id=6)
  { nombre: 'Valparaíso', id_region: 6 },
  { nombre: 'Viña del Mar', id_region: 6 },
  { nombre: 'Quilpué', id_region: 6 },
  { nombre: 'Villa Alemana', id_region: 6 },
  { nombre: 'Quillota', id_region: 6 },
  // Región del Biobío (id=11)
  { nombre: 'Concepción', id_region: 11 },
  { nombre: 'Talcahuano', id_region: 11 },
  // Región de Ñuble (id=10)
  { nombre: 'Chillán', id_region: 10 },
  { nombre: 'Los Ángeles', id_region: 11 }
];

async function insertarRegionesYComunas() {
  try {
    console.log('🔄 Iniciando inserción de regiones y comunas...');

    // Primero verificar si ya existen datos
    const { data: regionesExistentes, error: errorRegiones } = await supabase
      .from('region')
      .select('id, nombreregion');

    if (errorRegiones) {
      console.error('❌ Error al consultar regiones:', errorRegiones);
      return;
    }

    console.log(`📊 Regiones existentes: ${regionesExistentes.length}`);

    // Insertar regiones si no existen
    if (regionesExistentes.length === 0) {
      console.log('📍 Insertando regiones...');
      
      for (const region of regiones) {
        const { error: insertError } = await supabase
          .from('region')
          .insert({ nombreregion: region });

        if (insertError) {
          console.error(`❌ Error al insertar región ${region}:`, insertError);
        } else {
          console.log(`✅ Región insertada: ${region}`);
        }
      }
    } else {
      console.log('✅ Las regiones ya existen en la base de datos');
    }

    // Obtener las regiones para mapear IDs correctos
    const { data: regionesActualizadas, error: errorActualizado } = await supabase
      .from('region')
      .select('id, nombreregion');

    if (errorActualizado) {
      console.error('❌ Error al obtener regiones actualizadas:', errorActualizado);
      return;
    }

    // Crear mapa de nombre de región a ID
    const regionMap = {};
    regionesActualizadas.forEach(region => {
      regionMap[region.nombre_region] = region.id;
    });

    console.log('🗺️ Mapa de regiones creado');

    // Verificar comunas existentes
    const { data: comunasExistentes, error: errorComunas } = await supabase
      .from('comunas')
      .select('id');

    if (errorComunas) {
      console.error('❌ Error al consultar comunas:', errorComunas);
      return;
    }

    console.log(`📊 Comunas existentes: ${comunasExistentes.length}`);

    // Insertar comunas si no existen
    if (comunasExistentes.length === 0) {
      console.log('📍 Insertando comunas...');
      
      for (const comuna of comunas) {
        // Buscar el ID de región correspondiente
        const idRegion = regionMap[regiones[comuna.id_region - 1]];
        
        if (idRegion) {
          const { error: insertError } = await supabase
            .from('comunas')
            .insert({ 
              nombre_comuna: comuna.nombre, 
              id_region: idRegion 
            });

          if (insertError) {
            console.error(`❌ Error al insertar comuna ${comuna.nombre}:`, insertError);
          } else {
            console.log(`✅ Comuna insertada: ${comuna.nombre} (Región ID: ${idRegion})`);
          }
        } else {
          console.error(`❌ No se encontró región para ${comuna.nombre} con id_region ${comuna.id_region}`);
        }
      }
    } else {
      console.log('✅ Las comunas ya existen en la base de datos');
    }

    // Verificación final
    const { data: finalRegiones, error: finalErrorRegiones } = await supabase
      .from('region')
      .select('count');

    const { data: finalComunas, error: finalErrorComunas } = await supabase
      .from('comunas')
      .select('count');

    if (!finalErrorRegiones && !finalErrorComunas) {
      console.log('🎉 ¡Proceso completado exitosamente!');
      console.log(`📊 Total regiones: ${finalRegiones.length}`);
      console.log(`📊 Total comunas: ${finalComunas.length}`);
      console.log('📍 Las comunas y regiones ahora están disponibles para "Agregar Nuevo Cliente"');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
insertarRegionesYComunas();