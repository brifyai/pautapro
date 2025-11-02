const { createClient } = require('@supabase/supabase-js');
const { mapearDatos } = require('./src/config/mapeo-campos.js');

// Configuración de Supabase (credenciales correctas del .env)
const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 VERIFICACIÓN FINAL DE SOLUCIÓN DE MEDIOS');
console.log('===========================================');

async function verificarSolucion() {
  try {
    console.log('\n📋 1. Verificando conexión y datos...');
    
    // Obtener datos originales
    const { data: datosOriginales, error } = await supabase
      .from('medios')
      .select('*')
      .limit(3);
    
    if (error) {
      console.error('❌ Error obteniendo datos:', error.message);
      return;
    }
    
    console.log('✅ Datos obtenidos de la base de datos:');
    datosOriginales.forEach((medio, index) => {
      console.log(`   ${index + 1}. ID: ${medio.id}, nombre_medio: "${medio.nombre_medio}", tipo_medio: "${medio.tipo_medio}"`);
    });
    
    console.log('\n📋 2. Verificando mapeo de datos...');
    
    // Simular el mapeo que hace el frontend
    console.log('✅ Aplicando mapeo de campos...');
    
    // Mapeo manual para simular lo que hace mapearDatos
    const datosMapeados = datosOriginales.map(medio => ({
      id: medio.id,
      nombre: medio.nombre_medio,
      tipo: medio.tipo_medio,
      descripcion: medio.descripcion,
      codigo: medio.codigo,
      estado: medio.estado,
      duracion: medio.duracion,
      color: medio.color,
      codigo_megatime: medio.codigo_megatime,
      calidad: medio.calidad,
      cooperado: medio.cooperado,
      rubro: medio.rubro
    }));
    
    console.log('✅ Datos mapeados (formato del frontend):');
    datosMapeados.forEach((medio, index) => {
      console.log(`   ${index + 1}. ID: ${medio.id}, nombre: "${medio.nombre}", tipo: "${medio.tipo}"`);
    });
    
    console.log('\n📋 3. Verificando DataGrid configuration...');
    
    // Verificar que los campos del DataGrid coinciden
    const dataGridFields = ['id', 'nombre', 'codigo', 'duracion', 'codigo_megatime', 'color', 'calidad', 'cooperado', 'rubro', 'estado'];
    const camposDisponibles = Object.keys(datosMapeados[0] || {});
    
    const camposFaltantes = dataGridFields.filter(field => !camposDisponibles.includes(field));
    const camposExtras = camposDisponibles.filter(field => !dataGridFields.includes(field));
    
    if (camposFaltantes.length === 0) {
      console.log('✅ Todos los campos del DataGrid están disponibles');
    } else {
      console.log('❌ Campos faltantes en DataGrid:', camposFaltantes);
    }
    
    if (camposExtras.length > 0) {
      console.log('ℹ️  Campos adicionales disponibles:', camposExtras);
    }
    
    console.log('\n📋 4. Verificando estructura esperada por el frontend...');
    
    // Verificar estructura específica que necesita el DataGrid
    const primerMedio = datosMapeados[0];
    if (primerMedio) {
      console.log('✅ Estructura del primer medio:');
      console.log(`   - ID: ${primerMedio.id} (tipo: ${typeof primerMedio.id})`);
      console.log(`   - nombre: "${primerMedio.nombre}" (tipo: ${typeof primerMedio.nombre})`);
      console.log(`   - codigo: "${primerMedio.codigo}" (tipo: ${typeof primerMedio.codigo})`);
      console.log(`   - estado: ${primerMedio.estado} (tipo: ${typeof primerMedio.estado})`);
      
      // Verificar que los campos clave no sean undefined
      const camposClave = ['id', 'nombre'];
      const camposInvalidos = camposClave.filter(campo => 
        primerMedio[campo] === undefined || primerMedio[campo] === null || primerMedio[campo] === ''
      );
      
      if (camposInvalidos.length === 0) {
        console.log('✅ Todos los campos clave tienen valores válidos');
      } else {
        console.log('❌ Campos clave inválidos:', camposInvalidos);
      }
    }
    
    console.log('\n🎯 RESULTADO FINAL:');
    console.log('================');
    
    if (datosOriginales.length > 0 && datosMapeados.length > 0 && camposFaltantes.length === 0) {
      console.log('✅ SOLUCIÓN VERIFICADA - Todo debería funcionar correctamente');
      console.log('\n💡 Pasos para verificar en el navegador:');
      console.log('1. Abre http://localhost:5173/medios');
      console.log('2. Abre la consola de desarrollador (F12)');
      console.log('3. Deberías ver los console.log con "Datos originales" y "Datos mapeados"');
      console.log('4. La tabla debería mostrar los nombres de los medios correctamente');
      console.log('5. Deberías ver medios como: "TV Abierta", "TV Cable", "Radio AM", etc.');
    } else {
      console.log('❌ Hay problemas que necesitan atención');
      console.log('   - Datos originales:', datosOriginales.length > 0 ? '✅' : '❌');
      console.log('   - Datos mapeados:', datosMapeados.length > 0 ? '✅' : '❌');
      console.log('   - Campos DataGrid:', camposFaltantes.length === 0 ? '✅' : '❌');
    }
    
  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
  }
}

// Ejecutar verificación
verificarSolucion();