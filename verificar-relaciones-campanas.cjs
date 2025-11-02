const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://hacxgtjkqzokzngdjthg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhY3hndGprcXpva3puZ2RqdGhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc0NjUxNjIsImV4cCI6MjA0MzA0MTE2Mn0.7w4nQJdXtK2mY1R_BwZvQjVqHhNqV_8Xo5xLkM8sXp4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarRelaciones() {
  console.log('🔍 VERIFICANDO RELACIONES CORRECTAS PARA CAMPAÑAS\n');
  
  try {
    // 1. Verificar estructura de tablas relacionadas
    console.log('1. Verificando tabla clientes:');
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('id_cliente, nombrecliente')
      .limit(1);
    
    if (clientesError) {
      console.error('❌ Error en clientes:', clientesError);
    } else {
      console.log('✅ Clientes accesible');
    }
    
    // 2. Verificar tabla anio (no Anios)
    console.log('\n2. Verificando tabla anio:');
    const { data: anios, error: aniosError } = await supabase
      .from('anio')
      .select('id, years')
      .limit(1);
    
    if (aniosError) {
      console.error('❌ Error en anio:', aniosError);
    } else {
      console.log('✅ Tabla anio accesible');
    }
    
    // 3. Verificar tabla productos
    console.log('\n3. Verificando tabla productos:');
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('id, nombredelproducto')
      .limit(1);
    
    if (productosError) {
      console.error('❌ Error en productos:', productosError);
    } else {
      console.log('✅ Tabla productos accesible');
    }
    
    // 4. Verificar estructura de campania
    console.log('\n4. Verificando estructura de campania:');
    const { data: campaniaEstructura, error: campaniaError } = await supabase
      .from('campania')
      .select('*')
      .limit(1);
    
    if (campaniaError) {
      console.error('❌ Error en campania:', campaniaError);
    } else {
      console.log('✅ Estructura de campania:');
      if (campaniaEstructura.length > 0) {
        console.log('   Columnas:', Object.keys(campaniaEstructura[0]));
      }
    }
    
    // 5. Probar relación con clientes (nombre correcto de la tabla)
    console.log('\n5. Probando relación con clientes:');
    const { data: campanasClientes, error: relClientesError } = await supabase
      .from('campania')
      .select(`
        id_campania,
        nombrecampania,
        id_cliente,
        clientes!inner (
          id_cliente,
          nombrecliente
        )
      `)
      .limit(1);
    
    if (relClientesError) {
      console.error('❌ Error con relación clientes:', relClientesError);
    } else {
      console.log('✅ Relación clientes funciona');
    }
    
    // 6. Probar relación con anio (singular)
    console.log('\n6. Probando relación con anio:');
    const { data: campanasAnio, error: relAnioError } = await supabase
      .from('campania')
      .select(`
        id_campania,
        nombrecampania,
        id_anio,
        anio (
          id,
          years
        )
      `)
      .limit(1);
    
    if (relAnioError) {
      console.error('❌ Error con relación anio:', relAnioError);
    } else {
      console.log('✅ Relación anio funciona');
    }
    
    // 7. Probar relación con productos
    console.log('\n7. Probando relación con productos:');
    const { data: campanasProductos, error: relProductosError } = await supabase
      .from('campania')
      .select(`
        id_campania,
        nombrecampania,
        id_producto,
        productos (
          id,
          nombredelproducto
        )
      `)
      .limit(1);
    
    if (relProductosError) {
      console.error('❌ Error con relación productos:', relProductosError);
    } else {
      console.log('✅ Relación productos funciona');
    }
    
    // 8. Probar consulta completa con todas las relaciones
    console.log('\n8. Probando consulta completa:');
    const { data: consultaCompleta, error: consultaError } = await supabase
      .from('campania')
      .select(`
        *,
        clientes!inner (
          id_cliente,
          nombrecliente
        ),
        anio (
          id,
          years
        ),
        productos (
          id,
          nombredelproducto
        )
      `)
      .limit(1);
    
    if (consultaError) {
      console.error('❌ Error en consulta completa:', consultaError);
    } else {
      console.log('✅ Consulta completa funciona');
      if (consultaCompleta.length > 0) {
        console.log('   Estructura de datos:', Object.keys(consultaCompleta[0]));
      }
    }
    
    // 9. Obtener una muestra de campañas con relaciones
    console.log('\n9. Obteniendo muestra de campañas:');
    const { data: muestraCampanas, error: muestraError } = await supabase
      .from('campania')
      .select(`
        id_campania,
        nombrecampania,
        id_cliente,
        id_anio,
        id_producto,
        clientes!inner (nombrecliente),
        anio (years),
        productos (nombredelproducto)
      `)
      .eq('id_cliente', 1)
      .limit(3);
    
    if (muestraError) {
      console.error('❌ Error obteniendo muestra:', muestraError);
    } else {
      console.log('✅ Muestra de campañas:');
      muestraCampanas.forEach((campana, index) => {
        console.log(`   ${index + 1}. ${campana.nombrecampania}`);
        console.log(`      Cliente: ${campana.clientes?.nombrecliente}`);
        console.log(`      Año: ${campana.anio?.years}`);
        console.log(`      Producto: ${campana.productos?.nombredelproducto}`);
      });
    }
    
    console.log('\n📋 RESUMEN DE RELACIONES CORRECTAS:');
    console.log('- Tabla clientes: usar "clientes" (minúsculas)');
    console.log('- Tabla anio: usar "anio" (singular, minúsculas)');
    console.log('- Tabla productos: usar "productos" (minúsculas)');
    console.log('- Campo en campania: id_cliente, id_anio, id_producto');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar verificación
verificarRelaciones().then(() => {
  console.log('\n🏁 Verificación completada');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});