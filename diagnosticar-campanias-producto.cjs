const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 DIAGNÓSTICO DE CAMPAÑAS Y PRODUCTOS VINCULADOS');
console.log('==================================================\n');

async function diagnosticarCampaniasProductos() {
  try {
    // 1. Verificar estructura de la tabla campania
    console.log('1. Analizando estructura de la tabla campania...');
    const { data: campanias, error: campaniasError } = await supabase
      .from('campania')
      .select('*')
      .limit(3);

    if (campaniasError) {
      console.error('❌ Error al obtener campañas:', campaniasError);
      return;
    }

    console.log('✅ Estructura de campañas:');
    if (campanias.length > 0) {
      Object.keys(campanias[0]).forEach(key => {
        const value = campanias[0][key];
        const tipo = typeof value;
        const estado = value !== null && value !== undefined ? '✅' : '❌';
        console.log(`  ${estado} ${key}: ${tipo} = ${value}`);
      });
    }

    // 2. Verificar si hay tablas de productos
    console.log('\n2. Buscando tablas relacionadas con productos...');
    const tablasPosibles = ['productos', 'Productos', 'producto', 'Producto', 'items', 'Items'];
    
    for (const tabla of tablasPosibles) {
      try {
        const { data, error } = await supabase
          .from(tabla)
          .select('*')
          .limit(1);
        
        if (!error && data) {
          console.log(`✅ Tabla encontrada: ${tabla}`);
          console.log(`   Campos: ${Object.keys(data[0] || {}).join(', ')}`);
        }
      } catch (e) {
        // Tabla no existe, continuar
      }
    }

    // 3. Verificar relaciones en campañas
    console.log('\n3. Analizando relaciones en campañas...');
    const { data: campaniasConRelaciones, error: relacionesError } = await supabase
      .from('campania')
      .select(`
        *,
        cliente:clientes (*),
        anios (*)
      `)
      .limit(5);

    if (relacionesError) {
      console.error('❌ Error al obtener relaciones:', relacionesError);
    } else {
      console.log('✅ Relaciones encontradas:');
      campaniasConRelaciones.forEach((campana, index) => {
        console.log(`\nCampaña ${index + 1}:`);
        console.log(`  ID: ${campana.id_campania}`);
        console.log(`  Nombre: ${campana.nombrecampania}`);
        console.log(`  Cliente: ${campana.cliente?.nombrecliente || 'Sin cliente'}`);
        console.log(`  Año: ${campana.anios?.years || 'Sin año'}`);
        
        // Buscar campos que podrían ser producto
        Object.keys(campana).forEach(key => {
          if (key.toLowerCase().includes('product') || 
              key.toLowerCase().includes('item') ||
              key.toLowerCase().includes('servicio')) {
            console.log(`  ${key}: ${campana[key]}`);
          }
        });
      });
    }

    // 4. Verificar qué hace el componente actualmente
    console.log('\n4. Simulando consulta del componente RevisarOrden...');
    const clienteId = 1; // Empresa Ejemplo S.A.
    
    const { data: campanasComponente, error: componenteError } = await supabase
      .from('campania')
      .select(`
        *,
        anios (
          id,
          years
        )
      `)
      .eq('id_cliente', clienteId)
      .order('nombrecampania');

    if (componenteError) {
      console.error('❌ Error en consulta del componente:', componenteError);
    } else {
      console.log(`✅ Campañas para cliente ID ${clienteId}: ${campanasComponente.length}`);
      campanasComponente.forEach((campana, index) => {
        console.log(`\nCampaña ${index + 1}:`);
        console.log(`  nombrecampania: "${campana.nombrecampania}"`);
        console.log(`  anios.years: "${campana.anios?.years || 'No especificado'}"`);
        
        // Verificar si hay algún campo que podría ser producto
        const camposPosiblesProducto = Object.keys(campana).filter(key => 
          !['id_campania', 'nombrecampania', 'id_cliente', 'id_anio', 'created_at', 'updated_at', 'anios'].includes(key)
        );
        
        if (camposPosiblesProducto.length > 0) {
          console.log(`  Campos adicionales (posibles productos):`);
          camposPosiblesProducto.forEach(key => {
            console.log(`    ${key}: "${campana[key]}"`);
          });
        } else {
          console.log(`  ❌ No se encontraron campos de producto`);
        }
      });
    }

    // 5. Verificar si hay datos de productos en alguna parte
    console.log('\n5. Búsqueda de productos en toda la base de datos...');
    const { data: productosEncontrados, error: productosError } = await supabase
      .from('campania')
      .select('id_campania, nombrecampania')
      .or('producto.ilike.%%,producto.ilike.%%,item.ilike.%%,item.ilike.%%')
      .limit(10);

    if (productosError) {
      console.log('ℹ️ No se encontraron campañas con campos de producto usando búsqueda directa');
    } else {
      console.log(`✅ Se encontraron ${productosEncontrados.length} campañas con posibles productos:`);
      productosEncontrados.forEach(campana => {
        console.log(`  - ${campana.nombrecampania} (ID: ${campana.id_campania})`);
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar diagnóstico
diagnosticarCampaniasProductos().then(() => {
  console.log('\n🏁 DIAGNÓSTICO COMPLETADO');
});