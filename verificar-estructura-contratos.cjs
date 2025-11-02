const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarEstructuraContratos() {
  console.log('🔍 Verificando estructura de la tabla contratos...\n');

  try {
    // 1. Verificar estructura de la tabla contratos
    console.log('📋 Paso 1: Verificando estructura de contratos...');
    const { data: contratos, error: errorContratos } = await supabase
      .from('contratos')
      .select('*')
      .limit(1);

    if (errorContratos) {
      console.error('❌ Error al consultar contratos:', errorContratos);
      return;
    }

    if (contratos && contratos.length > 0) {
      console.log('✅ Estructura de la tabla contratos:');
      console.log('Campos:', Object.keys(contratos[0]));
      console.log('Registro ejemplo:', contratos[0]);
    } else {
      console.log('ℹ️  No hay registros en la tabla contratos');
    }

    // 2. Contar total de contratos
    console.log('\n📊 Paso 2: Contando contratos...');
    const { count, error: errorCount } = await supabase
      .from('contratos')
      .select('*', { count: 'exact', head: true });

    if (errorCount) {
      console.error('❌ Error al contar contratos:', errorCount);
    } else {
      console.log(`✅ Total de contratos: ${count}`);
    }

    // 3. Buscar campos que podrían relacionar contratos con soportes
    console.log('\n🔍 Paso 3: Buscando campos de relación...');
    if (contratos && contratos.length > 0) {
      const camposRelacion = Object.keys(contratos[0]).filter(key => 
        key.toLowerCase().includes('soporte') || 
        key.toLowerCase().includes('id') ||
        key.toLowerCase().includes('soport')
      );
      
      console.log('Campos que podrían ser de relación:', camposRelacion);
      
      camposRelacion.forEach(campo => {
        console.log(`   ${campo}: ${contratos[0][campo]}`);
      });
    }

    // 4. Verificar si hay contratos y mostrar algunos ejemplos
    console.log('\n📄 Paso 4: Mostrando ejemplos de contratos...');
    const { data: muestraContratos, error: errorMuestra } = await supabase
      .from('contratos')
      .select('*')
      .limit(3);

    if (errorMuestra) {
      console.error('❌ Error al obtener muestra:', errorMuestra);
    } else {
      console.log('✅ Muestra de contratos:');
      muestraContratos.forEach((contrato, index) => {
        console.log(`\n   Contrato ${index + 1} (ID: ${contrato.id}):`);
        Object.keys(contrato).forEach(key => {
          if (key.includes('id') || key.includes('soporte') || key.includes('nombre') || key.includes('Numero')) {
            console.log(`     ${key}: ${contrato[key]}`);
          }
        });
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verificarEstructuraContratos();