const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 DIAGNÓSTICO DE RELACIÓN CAMPAÑAS-PRODUCTOS');
console.log('============================================\n');

async function diagnosticarRelacion() {
  try {
    // 1. Verificar la relación específica que intentamos hacer
    console.log('1. Probando la relación exacta que usa el componente...');
    
    const clienteId = 1; // Empresa Ejemplo S.A.
    const { data: campanasConProductos, error: relacionError } = await supabase
      .from('campania')
      .select(`
        *,
        anios (
          id,
          years
        ),
        productos (
          id,
          nombredelproducto
        )
      `)
      .eq('id_cliente', clienteId)
      .limit(3);

    if (relacionError) {
      console.error('❌ Error en la relación:', relacionError);
      console.log('Detalles del error:', JSON.stringify(relacionError, null, 2));
    } else {
      console.log('✅ Relación funcionando:');
      campanasConProductos.forEach((campana, index) => {
        console.log(`\nCampaña ${index + 1}:`);
        console.log(`  ID: ${campana.id_campania}`);
        console.log(`  Nombre: ${campana.nombrecampania}`);
        console.log(`  id_producto: ${campana.id_producto}`);
        console.log(`  productos: ${JSON.stringify(campana.productos)}`);
        console.log(`  productos.nombredelproducto: ${campana.productos?.nombredelproducto || 'NULL'}`);
      });
    }

    // 2. Verificar si los productos existen para los id_producto de las campañas
    console.log('\n2. Verificando existencia de productos...');
    
    // Obtener todos los id_producto de las campañas del cliente
    const { data: campanas, error: campanasError } = await supabase
      .from('campania')
      .select('id_campania, nombrecampania, id_producto')
      .eq('id_cliente', clienteId);

    if (campanasError) {
      console.error('❌ Error al obtener campañas:', campanasError);
      return;
    }

    console.log(`Campañas encontradas: ${campanas.length}`);
    
    for (const campana of campanas) {
      console.log(`\nCampaña: ${campana.nombrecampania}`);
      console.log(`  id_producto: ${campana.id_producto}`);
      
      if (campana.id_producto) {
        // Verificar si existe el producto
        const { data: producto, error: productoError } = await supabase
          .from('productos')
          .select('*')
          .eq('id', campana.id_producto)
          .single();

        if (productoError) {
          console.error(`  ❌ Producto no encontrado: ${productoError.message}`);
        } else {
          console.log(`  ✅ Producto encontrado: ${producto.nombredelproducto}`);
        }
      } else {
        console.log(`  ⚠️ No tiene id_producto`);
      }
    }

    // 3. Probar diferentes nombres de relación
    console.log('\n3. Probando diferentes nombres de relación...');
    
    const nombresPosibles = ['producto', 'Producto', 'productos', 'Productos'];
    
    for (const nombreRelacion of nombresPosibles) {
      try {
        const { data, error } = await supabase
          .from('campania')
          .select(`
            *,
            ${nombreRelacion} (
              id,
              nombredelproducto
            )
          `)
          .eq('id_cliente', clienteId)
          .limit(1);

        if (error) {
          console.log(`❌ Relación "${nombreRelacion}": ${error.message}`);
        } else {
          console.log(`✅ Relación "${nombreRelacion}" funciona`);
          if (data.length > 0) {
            console.log(`   Producto: ${JSON.stringify(data[0][nombreRelacion])}`);
          }
        }
      } catch (e) {
        console.log(`❌ Relación "${nombreRelacion}": Error de sintaxis`);
      }
    }

    // 4. Verificar estructura de la tabla productos
    console.log('\n4. Estructura de la tabla productos...');
    const { data: productosEstructura, error: estructuraError } = await supabase
      .from('productos')
      .select('*')
      .limit(1);

    if (estructuraError) {
      console.error('❌ Error al obtener estructura:', estructuraError);
    } else {
      console.log('✅ Campos de productos:');
      if (productosEstructura.length > 0) {
        Object.keys(productosEstructura[0]).forEach(key => {
          console.log(`  ${key}: ${typeof productosEstructura[0][key]}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar diagnóstico
diagnosticarRelacion().then(() => {
  console.log('\n🏁 DIAGNÓSTICO COMPLETADO');
});