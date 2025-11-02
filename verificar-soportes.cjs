const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarSoportes() {
  console.log('🔍 Verificando estructura y datos de soportes...\n');

  try {
    // 1. Verificar estructura de la tabla soportes
    console.log('📋 Paso 1: Verificando estructura de la tabla soportes...');
    const { data: soportes, error: errorSoportes } = await supabase
      .from('soportes')
      .select('*')
      .limit(1);

    if (errorSoportes) {
      console.error('❌ Error al consultar soportes:', errorSoportes);
      return;
    }

    if (soportes && soportes.length > 0) {
      console.log('✅ Estructura de la tabla soportes:');
      console.log('Campos:', Object.keys(soportes[0]));
      console.log('Registro ejemplo:', soportes[0]);
    } else {
      console.log('ℹ️  No hay registros en la tabla soportes');
    }

    // 2. Contar total de soportes
    console.log('\n📊 Paso 2: Contando soportes...');
    const { count, error: errorCount } = await supabase
      .from('soportes')
      .select('*', { count: 'exact', head: true });

    if (errorCount) {
      console.error('❌ Error al contar soportes:', errorCount);
    } else {
      console.log(`✅ Total de soportes: ${count}`);
    }

    // 3. Verificar estructura de la tabla medios
    console.log('\n🔗 Paso 3: Verificando estructura de la tabla medios...');
    const { data: medios, error: errorMedios } = await supabase
      .from('medios')
      .select('*')
      .limit(1);

    if (errorMedios) {
      console.error('❌ Error al consultar medios:', errorMedios);
      return;
    }

    if (medios && medios.length > 0) {
      console.log('✅ Estructura de la tabla medios:');
      console.log('Campos:', Object.keys(medios[0]));
      console.log('Registro ejemplo:', medios[0]);
    }

    // 4. Verificar relación medios-soportes
    console.log('\n🔗 Paso 4: Verificando relación medios-soportes...');
    const { data: todosMedios, error: errorTodosMedios } = await supabase
      .from('medios')
      .select('*')
      .limit(5);

    if (errorTodosMedios) {
      console.error('❌ Error al consultar medios:', errorTodosMedios);
      return;
    }

    console.log('✅ Medios disponibles (primeros 5):');
    for (const medio of todosMedios) {
      const medioId = medio.id_medio || medio.id || medio.id_medios;
      console.log(`   - ${medio.nombre_medio || medio.nombre || 'Medio sin nombre'} (ID: ${medioId})`);
      
      // Intentar diferentes campos de relación
      const camposRelacion = ['id_medio', 'id_medios', 'id'];
      
      for (const campo of camposRelacion) {
        const { data: soportesMedio, error: errorSoportesMedio } = await supabase
          .from('soportes')
          .select('*')
          .eq(campo, medioId);

        if (!errorSoportesMedio && soportesMedio && soportesMedio.length > 0) {
          console.log(`     📋 Soportes encontrados con campo ${campo}: ${soportesMedio.length}`);
          soportesMedio.forEach(s => {
            console.log(`       - ${s.nombreidentificador || s.nombre || 'Sin nombre'} (ID: ${s.id_soporte})`);
          });
          break;
        }
      }
    }

    // 5. Verificar estructura completa de soportes para encontrar el campo de relación
    console.log('\n🔍 Paso 5: Buscando campo de relación en soportes...');
    const { data: muestraSoportes, error: errorMuestra } = await supabase
      .from('soportes')
      .select('*')
      .limit(3);

    if (errorMuestra) {
      console.error('❌ Error al consultar muestra de soportes:', errorMuestra);
    } else {
      console.log('✅ Muestra de soportes:');
      muestraSoportes.forEach((s, index) => {
        console.log(`   Soporte ${index + 1}:`);
        Object.keys(s).forEach(key => {
          if (key.includes('id') || key.includes('medio')) {
            console.log(`     ${key}: ${s[key]}`);
          }
        });
      });
    }

    // 6. Verificar si hay datos en archivos SQL
    console.log('\n📄 Paso 6: Verificando archivos SQL disponibles...');
    const fs = require('fs');
    const path = require('path');
    
    const sqlFiles = [
      'initial-data.sql',
      'medios-simple-sin-errores.sql'
    ];
    
    for (const sqlFile of sqlFiles) {
      const filePath = path.join(__dirname, sqlFile);
      if (fs.existsSync(filePath)) {
        console.log(`✅ Archivo encontrado: ${sqlFile}`);
        
        // Buscar INSERT INTO soportes en el archivo
        const content = fs.readFileSync(filePath, 'utf8');
        const soportesMatches = content.match(/INSERT INTO\s+soportes\s*\([^)]*\)\s*VALUES/gi);
        
        if (soportesMatches) {
          console.log(`   📋 Found ${soportesMatches.length} INSERT statements for soportes`);
        } else {
          console.log(`   ⚠️  No se encontraron INSERT INTO soportes en ${sqlFile}`);
        }
      } else {
        console.log(`❌ Archivo no encontrado: ${sqlFile}`);
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verificarSoportes();