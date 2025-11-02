import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

// Datos de comunas de Chile con IDs correctos de región
const comunas = [
  // Región Metropolitana (id=7)
  { nombrecomuna: 'Santiago', id_region: 7 },
  { nombrecomuna: 'Providencia', id_region: 7 },
  { nombrecomuna: 'Las Condes', id_region: 7 },
  { nombrecomuna: 'Vitacura', id_region: 7 },
  { nombrecomuna: 'La Reina', id_region: 7 },
  { nombrecomuna: 'Peñalolén', id_region: 7 },
  { nombrecomuna: 'La Florida', id_region: 7 },
  { nombrecomuna: 'Puente Alto', id_region: 7 },
  { nombrecomuna: 'Maipú', id_region: 7 },
  { nombrecomuna: 'San Bernardo', id_region: 7 },
  // Región de Valparaíso (id=6)
  { nombrecomuna: 'Valparaíso', id_region: 6 },
  { nombrecomuna: 'Viña del Mar', id_region: 6 },
  { nombrecomuna: 'Quilpué', id_region: 6 },
  { nombrecomuna: 'Villa Alemana', id_region: 6 },
  { nombrecomuna: 'Quillota', id_region: 6 },
  // Región del Biobío (id=11)
  { nombrecomuna: 'Concepción', id_region: 11 },
  { nombrecomuna: 'Talcahuano', id_region: 11 },
  // Región de Ñuble (id=10)
  { nombrecomuna: 'Chillán', id_region: 10 },
  // Región del Biobío (id=11) - Los Ángeles está en Biobío
  { nombrecomuna: 'Los Ángeles', id_region: 11 }
];

async function insertarComunasFinal() {
  try {
    console.log('🔄 Iniciando inserción final de comunas...');

    // Verificar comunas existentes
    const { data: comunasExistentes, error: errorComunas } = await supabase
      .from('comunas')
      .select('*')
      .limit(1);

    if (errorComunas) {
      console.error('❌ Error al consultar comunas existentes:', errorComunas);
      return;
    }

    console.log(`📊 Comunas existentes: ${comunasExistentes.length}`);

    // Si no hay comunas, insertar todas
    if (comunasExistentes.length === 0) {
      console.log('📍 Insertando comunas...');
      
      for (const comuna of comunas) {
        const { error: insertError } = await supabase
          .from('comunas')
          .insert(comuna);

        if (insertError) {
          console.error(`❌ Error al insertar comuna ${comuna.nombrecomuna}:`, insertError);
        } else {
          console.log(`✅ Comuna insertada: ${comuna.nombrecomuna} (Región ID: ${comuna.id_region})`);
        }
      }
    } else {
      console.log('✅ Las comunas ya existen en la base de datos');
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
        console.log(`${index + 1}. ${comuna.nombrecomuna} (ID: ${comuna.id}, Región ID: ${comuna.id_region})`);
      });
      
      console.log('\n🔍 Verificando relación con regiones...');
      
      // Obtener algunas regiones para verificar
      const { data: regiones } = await supabase
        .from('region')
        .select('id, nombreregion')
        .in('id', [6, 7, 10, 11]);
      
      console.log('Regiones relevantes:');
      regiones.forEach(region => {
        console.log(`- ID ${region.id}: ${region.nombreregion}`);
      });
      
      console.log('\n✅ ¡Las comunas y regiones ahora están disponibles para "Agregar Nuevo Cliente"!');
      console.log('📍 El formulario de clientes debería mostrar las comunas correctamente.');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
insertarComunasFinal();