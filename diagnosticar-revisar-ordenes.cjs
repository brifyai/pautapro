const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERROR: No se encontraron las variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY');
    console.log('Variables disponibles:', Object.keys(process.env).filter(key => key.includes('SUPABASE')));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 DIAGNÓSTICO ESPECÍFICO PARA REVISAR ÓRDENES');
console.log('==================================================\n');

async function diagnosticarRevisarOrdenes() {
    try {
        console.log('📊 PASO 1: Verificar conexión a la base de datos...');
        const { data: testData, error: testError } = await supabase
            .from('clientes')
            .select('id_cliente')
            .limit(1);
        
        if (testError) {
            console.error('❌ Error de conexión:', testError);
            return;
        }
        console.log('✅ Conexión exitosa a la base de datos\n');

        console.log('📋 PASO 2: Analizar la consulta exacta que hace RevisarOrden.jsx...');
        console.log('Consulta SQL equivalente:');
        console.log('SELECT *, plan:plan(id, nombre_plan), usuario_registro, copia, orden_remplaza');
        console.log('FROM ordenesdepublicidad');
        console.log('WHERE id_campania = [campaignId];\n');

        console.log('👥 PASO 3: Verificar clientes disponibles...');
        const { data: clientes, error: clientesError } = await supabase
            .from('clientes')
            .select('id_cliente, nombrecliente, razonSocial')
            .limit(5);
        
        if (clientesError) {
            console.error('❌ Error al obtener clientes:', clientesError);
        } else {
            console.log(`✅ Clientes encontrados: ${clientes.length}`);
            clientes.forEach(cliente => {
                console.log(`   - ID: ${cliente.id_cliente}, Nombre: ${cliente.nombrecliente}`);
            });
        }
        console.log('');

        console.log('🎯 PASO 4: Verificar campañas disponibles...');
        const { data: campanas, error: campanasError } = await supabase
            .from('campania')
            .select(`
                id_campania,
                nombrecampania,
                id_Cliente,
                Clientes!inner (
                    id_cliente,
                    nombrecliente
                )
            `)
            .limit(10);
        
        if (campanasError) {
            console.error('❌ Error al obtener campañas:', campanasError);
        } else {
            console.log(`✅ Campañas encontradas: ${campanas.length}`);
            campanas.forEach(campana => {
                console.log(`   - ID: ${campana.id_campania}, Nombre: ${campana.nombrecampania}, Cliente: ${campana.Clientes?.nombrecliente}`);
            });
        }
        console.log('');

        console.log('📄 PASO 5: Verificar órdenes por campaña (simulando el flujo de RevisarOrden)...');
        
        if (campanas && campanas.length > 0) {
            for (const campana of campanas.slice(0, 3)) { // Revisar primeras 3 campañas
                console.log(`\n🔍 Analizando campaña: ${campana.nombrecampania} (ID: ${campana.id_campania})`);
                
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
                    .eq('id_campania', campana.id_campania);
                
                if (ordersError) {
                    console.error(`❌ Error al obtener órdenes para campaña ${campana.id_campania}:`, ordersError);
                } else {
                    console.log(`   ✅ Órdenes encontradas: ${orders.length}`);
                    
                    if (orders.length > 0) {
                        orders.forEach(order => {
                            console.log(`     - Orden ID: ${order.id_ordenes_de_comprar}`);
                            console.log(`       N° Correlativo: ${order.numero_correlativo}`);
                            console.log(`       Estado: ${order.estado}`);
                            console.log(`       Plan: ${order.plan?.nombre_plan || 'Sin plan'}`);
                            console.log(`       Copia: ${order.copia || 'N/A'}`);
                            console.log(`       Creada: ${order.created_at}`);
                        });
                    } else {
                        console.log(`   ⚠️  No hay órdenes para esta campaña`);
                        
                        // Verificar si hay órdenes con id_campania nulo o diferente
                        const { data: allOrders, error: allOrdersError } = await supabase
                            .from('ordenesdepublicidad')
                            .select('id_ordenes_de_comprar, id_campania, estado, numero_correlativo')
                            .limit(5);
                        
                        if (!allOrdersError && allOrders.length > 0) {
                            console.log(`   📋 Muestra de todas las órdenes (para diagnóstico):`);
                            allOrders.forEach(order => {
                                console.log(`     - ID: ${order.id_ordenes_de_comprar}, id_campania: ${order.id_campania}, Estado: ${order.estado}`);
                            });
                        }
                    }
                }
            }
        } else {
            console.log('⚠️  No hay campañas para analizar');
        }

        console.log('\n📊 PASO 6: Análisis completo de estados de órdenes...');
        const { data: estadoStats, error: estadoError } = await supabase
            .from('ordenesdepublicidad')
            .select('estado')
            .then(({ data, error }) => {
                if (error) throw error;
                const stats = {};
                data.forEach(order => {
                    stats[order.estado] = (stats[order.estado] || 0) + 1;
                });
                return { data: stats, error: null };
            });
        
        if (estadoError) {
            console.error('❌ Error al analizar estados:', estadoError);
        } else {
            console.log('✅ Distribución de estados:');
            Object.entries(estadoStats).forEach(([estado, count]) => {
                console.log(`   - ${estado}: ${count} órdenes`);
            });
        }

        console.log('\n🔗 PASO 7: Verificar relaciones con planes...');
        const { data: planes, error: planesError } = await supabase
            .from('plan')
            .select('id, nombre_plan')
            .limit(5);
        
        if (planesError) {
            console.error('❌ Error al obtener planes:', planesError);
        } else {
            console.log(`✅ Planes encontrados: ${planes.length}`);
            planes.forEach(plan => {
                console.log(`   - ID: ${plan.id}, Nombre: ${plan.nombre_plan}`);
            });
        }

        console.log('\n🎯 PASO 8: Simulación completa del flujo de RevisarOrden...');
        if (clientes && clientes.length > 0 && campanas && campanas.length > 0) {
            const primerCliente = clientes[0];
            const campanasDelCliente = campanas.filter(c => c.id_Cliente === primerCliente.id_cliente);
            
            if (campanasDelCliente.length > 0) {
                const primerCampana = campanasDelCliente[0];
                console.log(`🔄 Simulando selección:`);
                console.log(`   Cliente: ${primerCliente.nombrecliente} (ID: ${primerCliente.id_cliente})`);
                console.log(`   Campaña: ${primerCampana.nombrecampania} (ID: ${primerCampana.id_campania})`);
                
                // Ejecutar la consulta exacta
                const { data: simulatedOrders, error: simulatedError } = await supabase
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
                
                if (simulatedError) {
                    console.error('❌ Error en simulación:', simulatedError);
                } else {
                    console.log(`✅ Resultado de simulación: ${simulatedOrders.length} órdenes encontradas`);
                    
                    if (simulatedOrders.length === 0) {
                        console.log('\n🚨 ANÁLISIS DE PROBLEMAS POSIBLES:');
                        console.log('1. ¿Las órdenes tienen id_campania correcto?');
                        console.log('2. ¿Las órdenes están en estado "activa"?');
                        console.log('3. ¿Hay problemas con la relación plan:plan?');
                        console.log('4. ¿El frontend está filtrando por algún estado específico?');
                        
                        // Verificar órdenes sin campaña
                        const { data: ordersWithoutCampaign, error: withoutCampaignError } = await supabase
                            .from('ordenesdepublicidad')
                            .select('id_ordenes_de_comprar, id_campania, estado')
                            .is('id_campania', null)
                            .limit(5);
                        
                        if (!withoutCampaignError && ordersWithoutCampaign.length > 0) {
                            console.log(`⚠️  Hay ${ordersWithoutCampaign.length} órdenes sin id_campania asignado`);
                        }
                    }
                }
            }
        }

        console.log('\n🎉 DIAGNÓSTICO COMPLETADO');
        console.log('=====================================');
        console.log('✅ Si ves órdenes en este diagnóstico, el problema está en el frontend');
        console.log('✅ Si no ves órdenes, el problema está en los datos o en la lógica de filtrado');
        console.log('✅ Revisa los resultados para identificar la causa exacta');

    } catch (error) {
        console.error('❌ Error en el diagnóstico:', error.message);
    }
}

// Ejecutar el diagnóstico
diagnosticarRevisarOrdenes();