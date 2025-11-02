/**
 * Script para verificar la estructura de las tablas principales
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarEstructuraTablas() {
  console.log('🔍 Verificando estructura de tablas...\n');

  try {
    // 1. Verificar estructura de tabla campaña
    console.log('📋 Estructura de tabla "campania":');
    const { data: campanias, error: errorCampanias } = await supabase
      .from('campania')
      .select('*')
      .limit(1);

    if (errorCampanias) {
      console.error('❌ Error al consultar campaña:', errorCampanias);
    } else if (campanias && campanias.length > 0) {
      console.log('Campos disponibles:');
      console.log(`   ${Object.keys(campanias[0]).join(', ')}`);
      console.log('\nEjemplo de datos:');
      Object.entries(campanias[0]).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    }

    // 2. Verificar estructura de tabla plan
    console.log('\n📋 Estructura de tabla "plan":');
    const { data: planes, error: errorPlanes } = await supabase
      .from('plan')
      .select('*')
      .limit(1);

    if (errorPlanes) {
      console.error('❌ Error al consultar plan:', errorPlanes);
    } else if (planes && planes.length > 0) {
      console.log('Campos disponibles:');
      console.log(`   ${Object.keys(planes[0]).join(', ')}`);
    }

    // 3. Verificar estructura de tabla ordenesdepublicidad
    console.log('\n📋 Estructura de tabla "ordenesdepublicidad":');
    const { data: ordenes, error: errorOrdenes } = await supabase
      .from('ordenesdepublicidad')
      .select('*')
      .limit(1);

    if (errorOrdenes) {
      console.error('❌ Error al consultar ordenes:', errorOrdenes);
    } else if (ordenes && ordenes.length > 0) {
      console.log('Campos disponibles:');
      console.log(`   ${Object.keys(ordenes[0]).join(', ')}`);
    }

    // 4. Verificar estructura de tabla alternativa
    console.log('\n📋 Estructura de tabla "alternativa":');
    const { data: alternativas, error: errorAlternativas } = await supabase
      .from('alternativa')
      .select('*')
      .limit(1);

    if (errorAlternativas) {
      console.error('❌ Error al consultar alternativa:', errorAlternativas);
    } else if (alternativas && alternativas.length > 0) {
      console.log('Campos disponibles:');
      console.log(`   ${Object.keys(alternativas[0]).join(', ')}`);
    }

    // 5. Verificar estructura de tabla soportes
    console.log('\n📋 Estructura de tabla "soportes":');
    const { data: soportes, error: errorSoportes } = await supabase
      .from('soportes')
      .select('*')
      .limit(1);

    if (errorSoportes) {
      console.error('❌ Error al consultar soportes:', errorSoportes);
    } else if (soportes && soportes.length > 0) {
      console.log('Campos disponibles:');
      console.log(`   ${Object.keys(soportes[0]).join(', ')}`);
    }

    // 6. Verificar estructura de tabla contratos
    console.log('\n📋 Estructura de tabla "contratos":');
    const { data: contratos, error: errorContratos } = await supabase
      .from('contratos')
      .select('*')
      .limit(1);

    if (errorContratos) {
      console.error('❌ Error al consultar contratos:', errorContratos);
    } else if (contratos && contratos.length > 0) {
      console.log('Campos disponibles:');
      console.log(`   ${Object.keys(contratos[0]).join(', ')}`);
    }

    // 7. Verificar estructura de tabla proveedores
    console.log('\n📋 Estructura de tabla "proveedores":');
    const { data: proveedores, error: errorProveedores } = await supabase
      .from('proveedores')
      .select('*')
      .limit(1);

    if (errorProveedores) {
      console.error('❌ Error al consultar proveedores:', errorProveedores);
    } else if (proveedores && proveedores.length > 0) {
      console.log('Campos disponibles:');
      console.log(`   ${Object.keys(proveedores[0]).join(', ')}`);
    }

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
verificarEstructuraTablas();