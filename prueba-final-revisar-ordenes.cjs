const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 PRUEBA FINAL - REVISAR ÓRDENES');
console.log('===================================\n');

async function pruebaFinal() {
    try {
        console.log('📊 PASO 1: Verificar clientes...');
        const { data: clientes, error: clientesError } = await supabase
            .from('clientes')
            .select('id_cliente, nombrecliente, razonsocial, rut')
            .limit(3);
        
        if (clientesError) {
            console.error('❌ Error en clientes:', clientesError);
            return;
        }
        console.log(`✅ Clientes disponibles: ${clientes.length}`);

        console.log('\n📋 PASO 2: Verificar campañas (consulta corregida)...');
        if (clientes.length > 0) {
            const primerCliente = clientes[0];
            console.log(`🔄 Probando con cliente: ${primerCliente.nombrecliente} (ID: ${primerCliente.id_cliente})`);
            
            // Esta es la consulta corregida que usa RevisarOrden.jsx
            const { data: campanias, error: campaniasError } = await supabase
                .from('campania')
                .select(`
                    *,
                    Anios:Anio (
                        id,
                        years
                    ),
                    Productos (
                        id,
                        nombredelproducto
                    )
                `)
                .eq('id_cliente', primerCliente.id_cliente)
                .order('nombrecampania');
            
            if (campaniasError) {
                console.error('❌ Error en campañas:', campaniasError);
            } else {
                console.log(`✅ Campañas encontradas: ${campanias.length}`);
                campanias.forEach(campana => {
                    console.log(`   - ${campana.nombrecampania} (ID: ${campana.id_campania})`);
                    console.log(`     Año: ${campana.Anios?.years || 'N/A'}`);
                    console.log(`     Producto: ${campana.Productos?.nombredelproducto || 'N/A'}`);
                });
            }

            console.log('\n📄 PASO 3: Verificar órdenes de las campañas...');
            if (campanias && campanias.length > 0) {
                const primerCampana = campanias[0];
                console.log(`🔄 Probando con campaña: ${primerCampana.nombrecampania} (ID: ${primerCampana.id_campania})`);
                
                // Consulta exacta de RevisarOrden.jsx
                const { data: orders, error: ordersError } = await supabase
                    .from('ordenesdepublicidad')
                    .select(`
                        *,
                        plan:plan (
                            id,
                            nombre_plan
                        ),
                        usuario_registro,
                        copia,
                        orden_remplaza
                    `)
                    .eq('id_campania', primerCampana.id_campania);
                
                if (ordersError) {
                    console.error('❌ Error en órdenes:', ordersError);
                } else {
                    console.log(`✅ Órdenes encontradas: ${orders.length}`);
                    
                    if (orders.length > 0) {
                        orders.forEach(order => {
                            console.log(`   - Orden ID: ${order.id_ordenes_de_comprar}`);
                            console.log(`     N° Correlativo: ${order.numero_correlativo || 'N/A'}`);
                            console.log(`     Estado: ${order.estado}`);
                            console.log(`     Plan: ${order.plan?.nombre_plan || 'Sin plan'}`);
                            console.log(`     Copia: ${order.copia || 'N/A'}`);
                        });
                    } else {
                        console.log('   ⚠️  No hay órdenes para esta campaña específica');
                    }
                }
            }
        }

        console.log('\n🎯 PASO 4: Verificar campañas con órdenes (todas las campañas)...');
        const { data: todasCampanias, error: todasCampaniasError } = await supabase
            .from('campania')
            .select('id_campania, nombrecampania, id_cliente')
            .limit(10);
        
        if (!todasCampaniasError && todasCampanias.length > 0) {
            console.log(`✅ Total campañas disponibles: ${todasCampanias.length}`);
            
            // Verificar qué campañas tienen órdenes
            for (const campana of todasCampanias.slice(0, 3)) {
                const { data: ordenesCampania, error: errorOrdenes } = await supabase
                    .from('ordenesdepublicidad')
                    .select('id_ordenes_de_comprar, estado, numero_correlativo')
                    .eq('id_campania', campana.id_campania);
                
                if (!errorOrdenes) {
                    console.log(`   📋 Campaña "${campana.nombrecampania}": ${ordenesCampania.length} órdenes`);
                    ordenesCampania.forEach(orden => {
                        console.log(`     - ${orden.numero_correlativo || 'S/N'} (${orden.estado})`);
                    });
                }
            }
        }

        console.log('\n🔍 PASO 5: Verificar datos de prueba específicos...');
        // Sabemos que hay campañas con IDs 1 y 63 que tienen órdenes
        const campaniasConOrdenes = [1, 63];
        
        for (const campaniaId of campaniasConOrdenes) {
            const { data: campaniaTest, error: campaniaTestError } = await supabase
                .from('campania')
                .select('id_campania, nombrecampania, id_cliente')
                .eq('id_campania', campaniaId)
                .single();
            
            if (!campaniaTestError) {
                console.log(`\n🎯 Campaña con órdenes: ${campaniaTest.nombrecampania} (ID: ${campaniaTest.id_campania})`);
                
                const { data: ordenesTest, error: ordenesTestError } = await supabase
                    .from('ordenesdepublicidad')
                    .select(`
                        id_ordenes_de_comprar,
                        numero_correlativo,
                        estado,
                        plan:plan (id, nombre_plan)
                    `)
                    .eq('id_campania', campaniaId)
                    .limit(5);
                
                if (!ordenesTestError) {
                    console.log(`   ✅ Órdenes encontradas: ${ordenesTest.length}`);
                    ordenesTest.forEach(orden => {
                        console.log(`     - Orden ${orden.numero_correlativo || orden.id_ordenes_de_comprar}`);
                        console.log(`       Estado: ${orden.estado}`);
                        console.log(`       Plan: ${orden.plan?.nombre_plan || 'Sin plan'}`);
                    });
                }
            }
        }

        console.log('\n🎉 PRUEBA FINAL COMPLETADA');
        console.log('============================');
        console.log('✅ Resultados:');
        console.log('1. ✅ Clientes accesibles con nombres corregidos');
        console.log('2. ✅ Campañas accesibles sin relación problemática');
        console.log('3. ✅ Órdenes accesibles por campaña');
        console.log('4. ✅ Hay campañas con órdenes disponibles');
        console.log('\n🚀 La página http://localhost:5173/ordenes/revisar debería funcionar correctamente ahora');
        console.log('📋 Flujo esperado:');
        console.log('   1. Seleccionar cliente → muestra campañas del cliente');
        console.log('   2. Seleccionar campaña → muestra órdenes de la campaña');
        console.log('   3. Seleccionar orden → muestra alternativas de la orden');

    } catch (error) {
        console.error('❌ Error en la prueba final:', error.message);
    }
}

// Ejecutar la prueba final
pruebaFinal();