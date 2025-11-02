const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 DIAGNÓSTICO EXACTO COMO EN NAVEGADOR');
console.log('======================================\n');

async function diagnosticarExactoNavegador() {
    try {
        console.log('📊 PASO 1: Simular fetchClientes() exactamente como en el componente...');
        
        // Simulando la función fetchClientes() de RevisarOrden.jsx
        const { data: clientes, error: clientesError } = await supabase
            .from('clientes')
            .select('id_cliente, nombrecliente, razonsocial, rut')
            .eq('estado', true);
        
        if (clientesError) {
            console.error('❌ Error en fetchClientes():', clientesError);
            return;
        }
        console.log(`✅ fetchClientes() exitoso: ${clientes.length} clientes`);
        
        if (clientes.length === 0) {
            console.log('❌ No hay clientes activos, esto podría ser el problema');
            return;
        }

        console.log('\n📋 PASO 2: Simular handleClienteSelect() con el primer cliente...');
        const primerCliente = clientes[0];
        console.log(`🔄 Cliente seleccionado: ${primerCliente.nombrecliente} (ID: ${primerCliente.id_cliente})`);
        
        // Simulando la función fetchCampanas() de RevisarOrden.jsx
        const { data: campanias, error: campaniasError } = await supabase
            .from('campania')
            .select(`
                *,
                anios (
                    id,
                    years
                )
            `)
            .eq('id_cliente', primerCliente.id_cliente)
            .order('nombrecampania');
        
        if (campaniasError) {
            console.error('❌ Error en fetchCampanas():', campaniasError);
            return;
        }
        console.log(`✅ fetchCampanas() exitoso: ${campanias.length} campañas`);
        
        if (campanias.length === 0) {
            console.log('⚠️  Este cliente no tiene campañas, probando con otro cliente...');
            
            // Probar con otros clientes hasta encontrar uno con campañas
            for (let i = 1; i < Math.min(clientes.length, 5); i++) {
                const cliente = clientes[i];
                console.log(`🔄 Probando con cliente: ${cliente.nombrecliente} (ID: ${cliente.id_cliente})`);
                
                const { data: campaniasTest, error: campaniasTestError } = await supabase
                    .from('campania')
                    .select('id_campania, nombrecampania, id_cliente')
                    .eq('id_cliente', cliente.id_cliente);
                
                if (!campaniasTestError && campaniasTest.length > 0) {
                    console.log(`✅ Cliente con campañas encontrado: ${cliente.nombrecliente}`);
                    campanias.push(...campaniasTest);
                    break;
                }
            }
        }
        
        if (campanias.length === 0) {
            console.log('❌ No se encontraron campañas para ningún cliente');
            return;
        }

        console.log('\n📄 PASO 3: Simular handleCampanaSelect() con la primera campaña...');
        const primerCampania = campanias[0];
        console.log(`🔄 Campaña seleccionada: ${primerCampania.nombrecampania} (ID: ${primerCampania.id_campania})`);
        
        // Simulando la función fetchOrders() de RevisarOrden.jsx exactamente
        const { data: orders, error: ordersError } = await supabase
            .from('ordenesdepublicidad')
            .select(`
                *,
                plan:plan (
                    id,
                    nombre_plan
                )
            `)
            .eq('id_campania', primerCampania.id_campania);
        
        if (ordersError) {
            console.error('❌ Error en fetchOrders():', ordersError);
            console.error('Detalles del error:', JSON.stringify(ordersError, null, 2));
            return;
        }
        
        console.log(`✅ fetchOrders() exitoso: ${orders.length} órdenes encontradas`);
        
        if (orders.length === 0) {
            console.log('⚠️  Esta campaña no tiene órdenes, buscando campañas con órdenes...');
            
            // Buscar campañas que sí tengan órdenes
            const { data: campaniasConOrdenes, error: campaniasConOrdenesError } = await supabase
                .from('ordenesdepublicidad')
                .select('id_campania')
                .not('id_campania', 'is', null)
                .limit(10);
            
            if (!campaniasConOrdenesError && campaniasConOrdenes.length > 0) {
                const campaniasUnicas = [...new Set(campaniasConOrdenes.map(o => o.id_campania))];
                console.log(`✅ Se encontraron ${campaniasUnicas.length} campañas con órdenes: ${campaniasUnicas.join(', ')}`);
                
                // Probar con la primera campaña que tiene órdenes
                const campaniaConOrdenId = campaniasUnicas[0];
                console.log(`🔄 Probando con campaña ID: ${campaniaConOrdenId}`);
                
                const { data: ordersTest, error: ordersTestError } = await supabase
                    .from('ordenesdepublicidad')
                    .select(`
                        *,
                        plan:plan (
                            id,
                            nombre_plan
                        )
                    `)
                    .eq('id_campania', campaniaConOrdenId);
                
                if (ordersTestError) {
                    console.error('❌ Error al obtener órdenes de campaña con órdenes:', ordersTestError);
                } else {
                    console.log(`✅ Órdenes encontradas en campaña con órdenes: ${ordersTest.length}`);
                    orders.push(...ordersTest);
                }
            }
        }
        
        if (orders.length > 0) {
            console.log('\n📋 DETALLE DE ÓRDENES ENCONTRADAS:');
            orders.forEach((order, index) => {
                console.log(`${index + 1}. Orden ID: ${order.id_ordenes_de_comprar}`);
                console.log(`   N° Correlativo: ${order.numero_correlativo || 'S/N'}`);
                console.log(`   Estado: ${order.estado}`);
                console.log(`   Plan: ${order.plan?.nombre_plan || 'Sin plan'}`);
                console.log(`   Creada: ${order.created_at}`);
                console.log(`   ID Campaña: ${order.id_campania}`);
                console.log('');
            });
        } else {
            console.log('❌ NO SE ENCONTRARON ÓRDENES EN NINGUNA CAMPAÑA');
        }

        console.log('\n🎯 PASO 4: Verificar si hay algún filtro o problema en el componente...');
        console.log('Posibles problemas en el navegador:');
        console.log('1. ¿El componente está mostrando errores en la consola?');
        console.log('2. ¿Hay algún estado que no se está actualizando correctamente?');
        console.log('3. ¿Hay algún filtro que no estamos viendo?');
        console.log('4. ¿El componente está esperando alguna acción del usuario?');

        console.log('\n🔍 PASO 5: Verificar estructura exacta de las órdenes...');
        if (orders.length > 0) {
            console.log('Estructura de la primera orden:');
            console.log(JSON.stringify(orders[0], null, 2));
        }

        console.log('\n🎉 DIAGNÓSTICO COMPLETADO');
        console.log('============================');
        console.log('✅ Si ves órdenes en este diagnóstico, el problema está en el frontend.');
        console.log('✅ Si no ves órdenes, el problema podría estar en:');
        console.log('   - Estados del componente React');
        console.log('   - Errores en la consola del navegador');
        console.log('   - Problemas de renderizado');
        console.log('   - Filtros o condiciones no visibles');

    } catch (error) {
        console.error('❌ Error en el diagnóstico:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Ejecutar el diagnóstico
diagnosticarExactoNavegador();