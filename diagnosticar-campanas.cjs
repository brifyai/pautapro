const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://hacxgtjkqzokzngdjthg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhY3hndGprcXpva3puZ2RqdGhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc0NjUxNjIsImV4cCI6MjA0MzA0MTE2Mn0.7w4nQJdXtK2mY1R_BwZvQjVqHhNqV_8Xo5xLkM8sXp4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosticarCampanas() {
  console.log('🔍 DIAGNÓSTICO DE CAMPAÑAS PARA CREAR ORDEN\n');
  
  try {
    // 1. Verificar estructura de la tabla campania
    console.log('1. Estructura de la tabla campania:');
    const { data: campaniaColumns, error: campaniaError } = await supabase
      .from('campania')
      .select('*')
      .limit(1);
    
    if (campaniaError) {
      console.error('❌ Error accediendo a tabla campania:', campaniaError);
    } else {
      console.log('✅ Tabla campania accesible');
      if (campaniaColumns.length > 0) {
        console.log('Columnas encontradas:', Object.keys(campaniaColumns[0]));
      }
    }
    
    // 2. Verificar si existe la tabla productos
    console.log('\n2. Verificando tabla productos:');
    const { data: productosColumns, error: productosError } = await supabase
      .from('productos')
      .select('*')
      .limit(1);
    
    if (productosError) {
      console.error('❌ Error accediendo a tabla productos:', productosError);
      console.log('   La tabla productos puede no existir o tener otro nombre');
    } else {
      console.log('✅ Tabla productos accesible');
      if (productosColumns.length > 0) {
        console.log('Columnas encontradas:', Object.keys(productosColumns[0]));
      }
    }
    
    // 3. Verificar relaciones en campania
    console.log('\n3. Verificando relaciones en campania:');
    const { data: campaniaSample, error: sampleError } = await supabase
      .from('campania')
      .select(`
        id_campania,
        nombrecampania,
        id_cliente,
        id_producto
      `)
      .limit(3);
    
    if (sampleError) {
      console.error('❌ Error obteniendo muestra de campañas:', sampleError);
    } else {
      console.log('✅ Muestra de campañas:');
      campaniaSample.forEach((campana, index) => {
        console.log(`   ${index + 1}. ID: ${campana.id_campania}, Nombre: ${campana.nombrecampania}`);
        console.log(`      id_cliente: ${campana.id_cliente}, id_producto: ${campana.id_producto}`);
      });
    }
    
    // 4. Probar consulta simple sin relaciones
    console.log('\n4. Probando consulta simple de campañas:');
    const { data: simpleCampanas, error: simpleError } = await supabase
      .from('campania')
      .select('*')
      .eq('id_cliente', 1) // Usar un cliente ID de ejemplo
      .limit(5);
    
    if (simpleError) {
      console.error('❌ Error en consulta simple:', simpleError);
    } else {
      console.log('✅ Consulta simple exitosa, campañas encontradas:', simpleCampanas.length);
    }
    
    // 5. Probar consulta con relación Clientes
    console.log('\n5. Probando consulta con relación Clientes:');
    const { data: campanasConClientes, error: clientesError } = await supabase
      .from('campania')
      .select(`
        *,
        Clientes!inner (
          id_cliente,
          nombrecliente
        )
      `)
      .eq('id_cliente', 1)
      .limit(3);
    
    if (clientesError) {
      console.error('❌ Error con relación Clientes:', clientesError);
    } else {
      console.log('✅ Relación Clientes funciona correctamente');
    }
    
    // 6. Probar consulta con relación Anios
    console.log('\n6. Probando consulta con relación Anios:');
    const { data: campanasConAnios, error: aniosError } = await supabase
      .from('campania')
      .select(`
        *,
        Anios:Anio (
          id,
          years
        )
      `)
      .eq('id_cliente', 1)
      .limit(3);
    
    if (aniosError) {
      console.error('❌ Error con relación Anios:', aniosError);
    } else {
      console.log('✅ Relación Anios funciona correctamente');
    }
    
    // 7. Probar consulta con relación Productos (la problemática)
    console.log('\n7. Probando consulta con relación Productos:');
    const { data: campanasConProductos, error: productosRelError } = await supabase
      .from('campania')
      .select(`
        *,
        Productos (
          id,
          nombredelproducto
        )
      `)
      .eq('id_cliente', 1)
      .limit(3);
    
    if (productosRelError) {
      console.error('❌ Error con relación Productos:', productosRelError);
      console.log('   Esta es la relación que está causando el problema');
    } else {
      console.log('✅ Relación Productos funciona correctamente');
    }
    
    // 8. Verificar si hay campañas para un cliente específico
    console.log('\n8. Verificando campañas por cliente:');
    const { data: clientes, error: clientesListError } = await supabase
      .from('clientes')
      .select('id_cliente, nombrecliente')
      .limit(3);
    
    if (clientesListError) {
      console.error('❌ Error obteniendo clientes:', clientesListError);
    } else {
      console.log('✅ Clientes disponibles:');
      for (const cliente of clientes) {
        const { data: campanasDelCliente, error: campanasClienteError } = await supabase
          .from('campania')
          .select('id_campania, nombrecampania')
          .eq('id_cliente', cliente.id_cliente);
        
        if (campanasClienteError) {
          console.error(`❌ Error con cliente ${cliente.nombrecliente}:`, campanasClienteError);
        } else {
          console.log(`   ${cliente.nombrecliente} (ID: ${cliente.id_cliente}): ${campanasDelCliente.length} campañas`);
        }
      }
    }
    
    // 9. Recomendación final
    console.log('\n📋 RECOMENDACIONES:');
    console.log('1. Si la relación Productos falla, eliminarla de la consulta fetchCampanas');
    console.log('2. Usar consulta simple sin relaciones problemáticas');
    console.log('3. Verificar que la tabla productos exista y tenga la relación configurada');
    console.log('4. Considerar hacer un left join en lugar de inner join para relaciones opcionales');
    
  } catch (error) {
    console.error('❌ Error general en diagnóstico:', error);
  }
}

// Ejecutar diagnóstico
diagnosticarCampanas().then(() => {
  console.log('\n🏁 Diagnóstico completado');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});