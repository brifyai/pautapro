const { createClient } = require('@supabase/supabase-js');

// Usar la misma configuración que el frontend
const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

console.log('🔧 VERIFICANDO CONEXIÓN CON CONFIGURACIÓN DEL FRONTEND');
console.log('====================================================\n');

console.log(`📍 URL Supabase: ${supabaseUrl}`);
console.log(`🔑 Key: ${supabaseKey.substring(0, 20)}...\n`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarConexion() {
  try {
    console.log('📊 Probando conexión con la base de datos...\n');

    // 1. Probar conexión básica
    console.log('1️⃣ CONEXIÓN BÁSICA:');
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('count')
        .limit(1);

      if (error) {
        console.log(`   ❌ Error de conexión: ${error.message}`);
        console.log(`   🔍 Código: ${error.code || 'N/A'}`);
        console.log(`   📝 Detalles: ${error.details || 'N/A'}`);
        return;
      } else {
        console.log('   ✅ Conexión exitosa a Supabase');
      }
    } catch (connError) {
      console.log(`   ❌ Error de red: ${connError.message}`);
      return;
    }

    // 2. Verificar tablas principales
    console.log('\n2️⃣ VERIFICANDO TABLAS PRINCIPALES:');
    
    const tablas = [
      { nombre: 'clientes', campo: 'id_cliente' },
      { nombre: 'medios', campo: 'id_medio' },
      { nombre: 'campania', campo: 'id_campania' },
      { nombre: 'ordenesdepublicidad', campo: 'id_ordenes_de_comprar' },
      { nombre: 'proveedores', campo: 'id_proveedor' }
    ];

    for (const tabla of tablas) {
      try {
        const { data, error } = await supabase
          .from(tabla.nombre)
          .select(tabla.campo)
          .limit(5);

        if (error) {
          console.log(`   ❌ ${tabla.nombre}: ${error.message}`);
        } else {
          console.log(`   ✅ ${tabla.nombre}: ${data.length} registros encontrados`);
        }
      } catch (tableError) {
        console.log(`   ❌ ${tabla.nombre}: Error de conexión - ${tableError.message}`);
      }
    }

    // 3. Verificar datos específicos para el Dashboard
    console.log('\n3️⃣ VERIFICANDO DATOS PARA DASHBOARD:');
    
    try {
      const { data: clientes, error: clientesError } = await supabase
        .from('clientes')
        .select('id_cliente');

      if (clientesError) {
        console.log(`   ❌ Clientes: ${clientesError.message}`);
      } else {
        console.log(`   ✅ Clientes totales: ${clientes?.length || 0}`);
      }
    } catch (e) {
      console.log(`   ❌ Clientes: Error - ${e.message}`);
    }

    try {
      const { data: campanas, error: campanasError } = await supabase
        .from('campania')
        .select('id_campania')
        .eq('estado', 'activa');

      if (campanasError) {
        console.log(`   ❌ Campañas activas: ${campanasError.message}`);
      } else {
        console.log(`   ✅ Campañas activas: ${campanas?.length || 0}`);
      }
    } catch (e) {
      console.log(`   ❌ Campañas activas: Error - ${e.message}`);
    }

    try {
      const { data: ordenes, error: ordenesError } = await supabase
        .from('ordenesdepublicidad')
        .select('id_ordenes_de_comprar')
        .eq('estado', 'produccion');

      if (ordenesError) {
        console.log(`   ❌ Órdenes en producción: ${ordenesError.message}`);
      } else {
        console.log(`   ✅ Órdenes en producción: ${ordenes?.length || 0}`);
      }
    } catch (e) {
      console.log(`   ❌ Órdenes en producción: Error - ${e.message}`);
    }

    // 4. Verificar medios
    console.log('\n4️⃣ VERIFICANDO MEDIOS (problema original):');
    
    try {
      const { data: medios, error: mediosError } = await supabase
        .from('medios')
        .select('id_medio, nombre_medio, tipo_medio')
        .limit(13);

      if (mediosError) {
        console.log(`   ❌ Medios: ${mediosError.message}`);
      } else {
        console.log(`   ✅ Medios encontrados: ${medios?.length || 0}`);
        if (medios && medios.length > 0) {
          console.log('   📺 Lista de medios:');
          medios.forEach((medio, index) => {
            console.log(`      ${index + 1}. ${medio.nombre_medio} (${medio.tipo_medio})`);
          });
        }
      }
    } catch (e) {
      console.log(`   ❌ Medios: Error - ${e.message}`);
    }

    console.log('\n✅ Verificación completada');
    console.log('\n💡 ANÁLISIS:');
    
    if (clientes?.length > 0 || campanas?.length > 0 || ordenes?.length > 0) {
      console.log('   🎯 Los datos existen en la base de datos');
      console.log('   🔍 El problema puede estar en:');
      console.log('      - El frontend no está cargando las variables de entorno');
      console.log('      - Hay errores en los servicios del Dashboard');
      console.log('      - El Dashboard está corriendo en un puerto diferente');
    } else {
      console.log('   ⚠️  No hay datos o hay problemas de conexión');
      console.log('   🔍 Verificar:');
      console.log('      - La URL de Supabase es correcta');
      console.log('      - La clave de Supabase es válida');
      console.log('      - La base de datos tiene datos');
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

verificarConexion();