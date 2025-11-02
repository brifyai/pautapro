const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

async function solucionAlternativaMedios() {
  console.log('🔧 Creando solución alternativa para medios-soportes...\n');

  try {
    // 1. Verificar si hay alguna tabla intermedia
    console.log('🔍 Paso 1: Buscando tablas relacionadas...');
    
    const tablasPosibles = ['medios_soportes', 'medio_soporte', 'soporte_medio', 'rel_medios_soportes'];
    
    for (const tabla of tablasPosibles) {
      try {
        const { data, error } = await supabase
          .from(tabla)
          .select('*')
          .limit(1);
        
        if (!error) {
          console.log(`✅ Tabla encontrada: ${tabla}`);
          if (data && data.length > 0) {
            console.log('   Campos:', Object.keys(data[0]));
          }
        }
      } catch (e) {
        // Tabla no existe, continuar
      }
    }

    // 2. Verificar estructura completa de soportes para encontrar campos ocultos
    console.log('\n🔍 Paso 2: Analizando estructura completa de soportes...');
    const { data: soportes, error: errorSoportes } = await supabase
      .from('soportes')
      .select('*')
      .limit(3);

    if (errorSoportes) {
      console.error('❌ Error:', errorSoportes);
      return;
    }

    console.log('✅ Estructura completa de soportes:');
    soportes.forEach((soporte, index) => {
      console.log(`\n   Soporte ${index + 1} (ID: ${soporte.id_soporte}):`);
      Object.keys(soporte).forEach(key => {
        const valor = soporte[key];
        const tipo = typeof valor;
        console.log(`     ${key}: ${valor} (${tipo})`);
      });
    });

    // 3. Crear una tabla temporal de relaciones si no existe
    console.log('\n🔧 Paso 3: Creando solución temporal...');
    
    // Vamos a crear un mapeo manual en el frontend
    console.log('💡 Creando mapeo manual de medios a soportes...');
    
    // Obtener medios y soportes
    const { data: medios } = await supabase.from('medios').select('*');
    const { data: todosSoportes } = await supabase.from('soportes').select('*');
    
    if (!medios || !todosSoportes) {
      console.error('❌ No se pudieron obtener medios o soportes');
      return;
    }

    // Crear mapeo basado en nombres
    const mapeoMediosSoportes = {};
    
    // Inicializar todos los medios con arrays vacíos
    medios.forEach(medio => {
      mapeoMediosSoportes[medio.id_medio] = {
        medio: medio,
        soportes: []
      };
    });

    // Asignar soportes a medios basado en el nombre
    todosSoportes.forEach(soporte => {
      const nombre = (soporte.nombreidentificador || '').toLowerCase();
      let medioId = null;

      if (nombre.includes('tv') || nombre.includes('televisión')) {
        if (nombre.includes('cable')) {
          medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('cable'))?.id_medio;
        } else {
          medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('abierta'))?.id_medio;
        }
      } else if (nombre.includes('radio')) {
        if (nombre.includes('fm')) {
          medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('fm'))?.id_medio;
        } else {
          medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('am'))?.id_medio;
        }
      } else if (nombre.includes('diario')) {
        medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('diario'))?.id_medio;
      } else if (nombre.includes('revista')) {
        medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('revista'))?.id_medio;
      } else if (nombre.includes('internet') || nombre.includes('banner')) {
        medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('internet'))?.id_medio;
      } else if (nombre.includes('redes') || nombre.includes('social')) {
        medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('redes'))?.id_medio;
      } else if (nombre.includes('cine')) {
        medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('cine'))?.id_medio;
      } else if (nombre.includes('vía') || nombre.includes('publica')) {
        medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('vía'))?.id_medio;
      } else if (nombre.includes('transporte')) {
        medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('transporte'))?.id_medio;
      } else if (nombre.includes('digital') || nombre.includes('marketing')) {
        medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('digital'))?.id_medio;
      } else if (nombre.includes('streaming')) {
        medioId = medios.find(m => m.nombre_medio.toLowerCase().includes('streaming'))?.id_medio;
      }

      // Si no se encontró coincidencia, asignar al primer medio
      if (!medioId && medios.length > 0) {
        medioId = medios[0].id_medio;
      }

      if (medioId && mapeoMediosSoportes[medioId]) {
        mapeoMediosSoportes[medioId].soportes.push(soporte);
      }
    });

    // 4. Mostrar resultados
    console.log('\n📊 Paso 4: Resultados del mapeo:');
    Object.values(mapeoMediosSoportes).forEach(({ medio, soportes }) => {
      console.log(`\n📺 ${medio.nombre_medio} (ID: ${medio.id_medio}):`);
      console.log(`   Soportes asignados: ${soportes.length}`);
      soportes.slice(0, 3).forEach(soporte => {
        console.log(`     - ${soporte.nombreidentificador}`);
      });
      if (soportes.length > 3) {
        console.log(`     ... y ${soportes.length - 3} más`);
      }
    });

    // 5. Crear archivo JSON con el mapeo para el frontend
    const fs = require('fs');
    const mapeoJSON = JSON.stringify(mapeoMediosSoportes, null, 2);
    
    fs.writeFileSync('mapeo-medios-soportes.json', mapeoJSON);
    console.log('\n✅ Archivo mapeo-medios-soportes.json creado para uso en el frontend');

    console.log('\n🎉 Solución alternativa creada!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. El frontend puede usar el archivo mapeo-medios-soportes.json');
    console.log('   2. O ejecutar el SQL en Supabase: ALTER TABLE soportes ADD COLUMN IF NOT EXISTS id_medio INTEGER;');
    console.log('   3. Luego ejecutar: node crear-relaciones-medios-soportes.cjs');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

solucionAlternativaMedios();