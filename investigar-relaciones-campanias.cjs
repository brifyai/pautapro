const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 INVESTIGACIÓN DE RELACIONES DE CAMPAÑAS');
console.log('==========================================\n');

async function investigarRelaciones() {
    try {
        console.log('📊 PASO 1: Estructura de la tabla clientes...');
        const { data: clientesColumns, error: clientesError } = await supabase
            .from('clientes')
            .select('*')
            .limit(1);
        
        if (clientesError) {
            console.error('❌ Error en clientes:', clientesError);
        } else if (clientesColumns.length > 0) {
            console.log('✅ Columnas encontradas en clientes:');
            console.log('   ', Object.keys(clientesColumns[0]));
        }

        console.log('\n📋 PASO 2: Estructura de la tabla campania...');
        const { data: campaniaColumns, error: campaniaError } = await supabase
            .from('campania')
            .select('*')
            .limit(1);
        
        if (campaniaError) {
            console.error('❌ Error en campania:', campaniaError);
        } else if (campaniaColumns.length > 0) {
            console.log('✅ Columnas encontradas en campania:');
            console.log('   ', Object.keys(campaniaColumns[0]));
        }

        console.log('\n🎯 PASO 3: Datos de clientes (corregidos)...');
        const { data: clientes, error: clientesDataError } = await supabase
            .from('clientes')
            .select('id_cliente, nombrecliente, razonsocial, RUT')
            .limit(5);
        
        if (clientesDataError) {
            console.error('❌ Error al obtener clientes:', clientesDataError);
        } else {
            console.log(`✅ Clientes encontrados: ${clientes.length}`);
            clientes.forEach(cliente => {
                console.log(`   - ID: ${cliente.id_cliente}, Nombre: ${cliente.nombrecliente}, Razón Social: ${cliente.razonsocial || 'N/A'}`);
            });
        }

        console.log('\n🎯 PASO 4: Datos de campañas sin relaciones...');
        const { data: campanias, error: campaniasDataError } = await supabase
            .from('campania')
            .select('id_campania, nombrecampania, id_Cliente')
            .limit(10);
        
        if (campaniasDataError) {
            console.error('❌ Error al obtener campañas:', campaniasDataError);
        } else {
            console.log(`✅ Campañas encontradas: ${campanias.length}`);
            campanias.forEach(campana => {
                console.log(`   - ID: ${campana.id_campania}, Nombre: ${campana.nombrecampania}, id_Cliente: ${campana.id_Cliente}`);
            });
        }

        console.log('\n📄 PASO 5: Órdenes y sus relaciones con campañas...');
        const { data: ordenesConCampanias, error: ordenesError } = await supabase
            .from('ordenesdepublicidad')
            .select('id_ordenes_de_comprar, id_campania, estado, numero_correlativo')
            .limit(10);
        
        if (ordenesError) {
            console.error('❌ Error al obtener órdenes:', ordenesError);
        } else {
            console.log(`✅ Órdenes encontradas: ${ordenesConCampanias.length}`);
            ordenesConCampanias.forEach(orden => {
                console.log(`   - Orden ID: ${orden.id_ordenes_de_comprar}, Campaña ID: ${orden.id_campania}, Estado: ${orden.estado}, N°: ${orden.numero_correlativo}`);
            });
        }

        console.log('\n🔗 PASO 6: Verificar si las campañas tienen clientes válidos...');
        if (campanias && clientes) {
            console.log('🔍 Verificando relaciones campaña-cliente:');
            campanias.forEach(campana => {
                const clienteAsociado = clientes.find(c => c.id_cliente === campana.id_Cliente);
                if (clienteAsociado) {
                    console.log(`   ✅ Campaña "${campana.nombrecampania}" → Cliente "${clienteAsociado.nombrecliente}"`);
                } else {
                    console.log(`   ❌ Campaña "${campana.nombrecampania}" → Cliente ID ${campana.id_Cliente} NO ENCONTRADO`);
                }
            });
        }

        console.log('\n🎯 PASO 7: Simular consulta de RevisarOrden con datos reales...');
        if (campanias && campanias.length > 0) {
            const primerCampana = campanias[0];
            console.log(`🔄 Probando con campaña: ${primerCampana.nombrecampania} (ID: ${primerCampana.id_campania})`);
            
            // Esta es la consulta exacta que hace RevisarOrden.jsx
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
                console.error('❌ Error en consulta de órdenes:', ordersError);
            } else {
                console.log(`✅ Órdenes para campaña ${primerCampana.id_campania}: ${orders.length}`);
                
                if (orders.length > 0) {
                    orders.forEach(order => {
                        console.log(`     - Orden ID: ${order.id_ordenes_de_comprar}`);
                        console.log(`       N° Correlativo: ${order.numero_correlativo}`);
                        console.log(`       Estado: ${order.estado}`);
                        console.log(`       Plan: ${order.plan?.nombre_plan || 'Sin plan'}`);
                        console.log(`       Copia: ${order.copia || 'N/A'}`);
                    });
                } else {
                    console.log('   ⚠️  No hay órdenes para esta campaña específica');
                    
                    // Verificar qué campañas SÍ tienen órdenes
                    console.log('\n🔍 Buscando campañas que SÍ tienen órdenes...');
                    const { data: ordenesAgrupadas, error: agrupError } = await supabase
                        .from('ordenesdepublicidad')
                        .select('id_campania')
                        .not('id_campania', 'is', null);
                    
                    if (!agrupError && ordenesAgrupadas.length > 0) {
                        const campaniasConOrdenes = [...new Set(ordenesAgrupadas.map(o => o.id_campania))];
                        console.log(`✅ Campañas con órdenes: ${campaniasConOrdenes.length}`);
                        console.log('   IDs de campañas con órdenes:', campaniasConOrdenes);
                        
                        // Para cada campaña con órdenes, mostrar detalles
                        for (const campaniaId of campaniasConOrdenes.slice(0, 3)) {
                            const campaniaConOrdenes = campanias.find(c => c.id_campania === campaniaId);
                            console.log(`\n📋 Campaña con órdenes: ${campaniaConOrdenes?.nombrecampania || 'ID ' + campaniaId}`);
                            
                            const { data: ordenesDeCampania, error: errorCampania } = await supabase
                                .from('ordenesdepublicidad')
                                .select('id_ordenes_de_comprar, numero_correlativo, estado')
                                .eq('id_campania', campaniaId);
                            
                            if (!errorCampania) {
                                console.log(`   Órdenes (${ordenesDeCampania.length}):`);
                                ordenesDeCampania.forEach(orden => {
                                    console.log(`     - ${orden.numero_correlativo} (${orden.estado})`);
                                });
                            }
                        }
                    }
                }
            }
        }

        console.log('\n🎉 ANÁLISIS COMPLETADO');
        console.log('========================');
        console.log('✅ Problemas identificados:');
        console.log('1. Campo "razonSocial" debe ser "razonsocial"');
        console.log('2. No hay relación configurada entre campania y Clientes en Supabase');
        console.log('3. Las consultas están fallando por los problemas de relaciones');
        console.log('4. Necesario corregir el frontend para usar los nombres correctos');

    } catch (error) {
        console.error('❌ Error en la investigación:', error.message);
    }
}

// Ejecutar la investigación
investigarRelaciones();