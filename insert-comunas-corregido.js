import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

// Datos de comunas de Chile con IDs correctos de región
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
  // Región del Biobío (id=11) - Los Ángeles está en Biobío
  { nombre: 'Los Ángeles', id_region: 11 }
];

async function insertarComunas() {
  try {
    console.log('🔄 Iniciando inserción de comunas...');

    // Verificar comunas existentes
    const { data: comunasExistentes, error: errorComunas } = await supabase
      .from('comunas')
      .select('id, nombreComuna, nombre_comuna, nombre');

    if (errorComunas) {
      console.error('❌ Error al consultar comunas existentes:', errorComunas);
      return;
    }

    console.log(`📊 Comunas existentes: ${comunasExistentes.length}`);

    // Si no hay comunas, insertar todas
    if (comunasExistentes.length === 0) {
      console.log('📍 Insertando comunas...');
      
      for (const comuna of comunas) {
        // Intentar diferentes nombres de columna para el nombre de la comuna
        const { error: insertError } = await supabase
          .from('comunas')
          .insert({ 
            nombreComuna: comuna.nombre, 
            id_region: comuna.id_region 
          });

        if (insertError) {
          // Si falla con nombreComuna, intentar con nombre_comuna
          const { error: insertError2 } = await supabase
            .from('comunas')
            .insert({ 
              nombre_comuna: comuna.nombre, 
              id_region: comuna.id_region 
            });

          if (insertError2) {
            // Si falla con nombre_comuna, intentar con nombre
            const { error: insertError3 } = await supabase
              .from('comunas')
              .insert({ 
                nombre: comuna.nombre, 
                id_region: comuna.id_region 
              });

            if (insertError3) {
              console.error(`❌ Error al insertar comuna ${comuna.nombre}:`, insertError3);
            } else {
              console.log(`✅ Comuna insertada: ${comuna.nombre} (Región ID: ${comuna.id_region})`);
            }
          } else {
            console.log(`✅ Comuna insertada: ${comuna.nombre} (Región ID: ${comuna.id_region})`);
          }
        } else {
          console.log(`✅ Comuna insertada: ${comuna.nombre} (Región ID: ${comuna.id_region})`);
        }
      }
    } else {
      console.log('✅ Las comunas ya existen en la base de datos');
      console.log('Comunas existentes:');
      comunasExistentes.forEach((comuna, index) => {
        const nombre = comuna.nombreComuna || comuna.nombre_comuna || comuna.nombre;
        console.log(`${index + 1}. ${nombre} (ID: ${comuna.id}, Región: ${comuna.id_region})`);
      });
    }

    // Verificación final
    const { data: finalComunas, error: finalErrorComunas } = await supabase
      .from('comunas')
      .select('*');

    if (!finalErrorComunas) {
      console.log('\n🎉 ¡Proceso completado exitosamente!');
      console.log(`📊 Total comunas: ${finalComunas.length}`);
      console.log('\n📍 Lista de comunas disponibles:');
      finalComunas.forEach((comuna, index) => {
        const nombre = comuna.nombreComuna || comuna.nombre_comuna || comuna.nombre;
        console.log(`${index + 1}. ${nombre} (ID: ${comuna.id}, Región ID: ${comuna.id_region})`);
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
insertarComunas();