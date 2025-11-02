const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarEstructuraOrdenes() {
  console.log('🔍 Verificando estructura de la tabla ordenesdepublicidad...\n');

  try {
    // 1. Verificar estructura de la tabla
    console.log('📋 Paso 1: Verificando estructura de ordenesdepublicidad...');
    const { data: ordenes, error: errorOrdenes } = await supabase
      .from('ordenesdepublicidad')
      .select('*')
      .limit(1);

    if (errorOrdenes) {
      console.error('❌ Error al consultar ordenes:', errorOrdenes);
      return;
    }

    if (ordenes && ordenes.length > 0) {
      console.log('✅ Estructura de la tabla ordenesdepublicidad:');
      console.log('Campos:', Object.keys(ordenes[0]));
      console.log('Registro ejemplo:', ordenes[0]);
    } else {
      console.log('ℹ️  No hay registros en la tabla ordenesdepublicidad');
    }

    // 2. Contar total de órdenes existentes
    console.log('\n📊 Paso 2: Contando órdenes existentes...');
    const { count, error: errorCount } = await supabase
      .from('ordenesdepublicidad')
      .select('*', { count: 'exact', head: true });

    if (errorCount) {
      console.error('❌ Error al contar órdenes:', errorCount);
    } else {
      console.log(`✅ Total de órdenes existentes: ${count}`);
    }

    // 3. Obtener el máximo ID actual
    console.log('\n🔢 Paso 3: Obtenendo máximo ID actual...');
    const { data: maxId, error: errorMaxId } = await supabase
      .from('ordenesdepublicidad')
      .select('id_ordenes_de_comprar')
      .order('id_ordenes_de_comprar', { ascending: false })
      .limit(1);

    if (errorMaxId) {
      console.error('❌ Error al obtener máximo ID:', errorMaxId);
    } else if (maxId && maxId.length > 0) {
      console.log(`✅ Máximo ID actual: ${maxId[0].id_ordenes_de_comprar}`);
    } else {
      console.log('ℹ️  No hay órdenes, empezando desde ID 1');
    }

    // 4. Verificar si hay restricciones únicas
    console.log('\n🔍 Paso 4: Verificando restricciones...');
    // No podemos verificar restricciones directamente con el cliente JS, pero podemos inferir

    // 5. Mostrar algunos ejemplos de IDs existentes
    console.log('\n📄 Paso 5: Mostrando ejemplos de IDs existentes...');
    const { data: muestraOrdenes, error: errorMuestra } = await supabase
      .from('ordenesdepublicidad')
      .select('id_ordenes_de_comprar, numero_correlativo')
      .limit(5);

    if (errorMuestra) {
      console.error('❌ Error al obtener muestra:', errorMuestra);
    } else {
      console.log('✅ Muestra de IDs existentes:');
      muestraOrdenes.forEach((orden, index) => {
        console.log(`   Orden ${index + 1}: id_ordenes_de_comprar=${orden.id_ordenes_de_comprar}, numero_correlativo=${orden.numero_correlativo}`);
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verificarEstructuraOrdenes();