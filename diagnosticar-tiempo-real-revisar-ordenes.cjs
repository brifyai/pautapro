const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 DIAGNÓSTICO EN TIEMPO REAL - REVISAR ÓRDENES');
console.log('===============================================\n');

async function diagnosticarTiempoReal() {
    try {
        console.log('📊 PASO 1: Verificar conexión básica...');
        const { data: testData, error: testError } = await supabase
            .from('clientes')
            .select('id_cliente')
            .limit(1);
        
        if (testError) {
            console.error('❌ Error de conexión:', testError);
            return;
        }
        console.log('✅ Conexión exitosa');

        console.log('\n👥 PASO 2: Obtener TODOS los clientes disponibles...');
        const { data: todosClientes, error: todosClientesError } = await supabase
            .from('clientes')
            .select('id_cliente, nombrecliente, razonsocial, rut')
            .eq('estado', true);
        
        if (todosClientesError) {
            console.error('❌ Error al obtener clientes:', todosClientesError);
            return;
        }
        console.log(`✅ Total clientes activos: ${todosClientes.length}`);
        todosClientes.forEach(cliente => {
            console.log(`   - ID: ${cliente.id_cliente}, Nombre: ${cliente.nombrecliente}`);
        });

        console.log('\n📋 PASO 3: Para cada cliente, verificar sus campañas...');
        for (const cliente of todosClientes.slice(0, 3)) {
            console.log(`\n🔍 Cliente: ${cliente.nombrecliente} (ID: ${cliente.id_cliente})`);
            
            const { data: campanasCliente, error: campanasError } = await supabase
                .from('campania')
                .select(`
                    id_campania,
                    nombrecampania,
                    id_cliente,
                    anios (id, years),
                    Productos (id, nombredelproducto)
                `)
                .eq('id_cliente', cliente.id_cliente);
            
            if (campanasError) {
                console.error(`❌ Error en campañas del cliente ${cliente.id_cliente}:`, campanasError);
                continue;
            }
            
            console.log(`   ✅ Campañas encontradas: ${campanasCliente.length}`);
            
            if (campanasCliente.length === 0) {
                console.log('   ⚠️  Este cliente no tiene campañas');
                continue;
            }
            
            // Para cada campaña, verificar sus órdenes
            for (const campana of campanasCliente) {
                console.log(`   📋 Campaña: ${campana.nombrecampania} (ID: ${campana.id_campania})`);
                
                const { data: ordenesCampania, error: ordenesError } = await supabase
                    .from('ordenesdepublicidad')
                    .select(`
                        *,
                        plan:plan (id, nombre_plan),
                        usuario_registro,
                        copia,
                        orden_remplaza
                    `)
                    .eq('id_campania', campana.id_campania);
                
                if (ordenesError) {
                    console.error(`     ❌ Error en órdenes de campaña ${campana.id_campania}:`, ordenesError);
                    continue;
                }
                
                console.log(`     ✅ Órdenes encontradas: ${ordenesCampania.length}`);
                
                if (ordenesCampania.length > 0) {
                    ordenesCampania.forEach(orden => {
                        console.log(`       - Orden ID: ${orden.id_ordenes_de_comprar}`);
                        console.log(`         N°: ${orden.numero_correlativo || 'S/N'}`);
                        console.log(`         Estado: ${orden.estado}`);
                        console.log(`         Plan: ${orden.plan?.nombre_plan || 'Sin plan'}`);
                        console.log(`         Creada: ${orden.created_at}`);
                    });
                } else {
                    console.log('     ⚠️  Esta campaña no tiene órdenes');
                }
            }
        }

        console.log('\n🎯 PASO 4: Verificar campañas que SÍ tienen órdenes (sin importar cliente)...');
        const { data: ordenesConCampanias, error: ordenesCampaniasError } = await supabase
            .from('ordenesdepublicidad')
            .select('id_campania, estado, numero_correlativo')
            .not('id_campania', 'is', null)
            .limit(20);
        
        if (ordenesCampaniasError) {
            console.error('❌ Error al obtener órdenes con campañas:', ordenesCampaniasError);
            return;
        }
        
        console.log(`✅ Total órdenes con campaña: ${ordenesConCampanias.length}`);
        
        // Agrupar por campaña
        const ordenesPorCampania = {};
        ordenesConCampanias.forEach(orden => {
            if (!ordenesPorCampania[orden.id_campania]) {
                ordenesPorCampania[orden.id_campania] = [];
            }
            ordenesPorCampania[orden.id_campania].push(orden);
        });
        
        console.log('\n📋 Distribución de órdenes por campaña:');
        Object.entries(ordenesPorCampania).forEach(([campaniaId, ordenes]) => {
            console.log(`   Campaña ID ${campaniaId}: ${ordenes.length} órdenes`);
            ordenes.slice(0, 3).forEach(orden => {
                console.log(`     - ${orden.numero_correlativo || 'S/N'} (${orden.estado})`);
            });
        });

        console.log('\n🔍 PASO 5: Verificar detalles de las campañas con órdenes...');
        const campaniasConOrdenesIds = Object.keys(ordenesPorCampania);
        
        for (const campaniaId of campaniasConOrdenesIds.slice(0, 3)) {
            const { data: campaniaDetalles, error: campaniaDetallesError } = await supabase
                .from('campania')
                .select(`
                    id_campania,
                    nombrecampania,
                    id_cliente,
                    anios (id, years),
                    Productos (id, nombredelproducto)
                `)
                .eq('id_campania', parseInt(campaniaId))
                .single();
            
            if (campaniaDetallesError) {
                console.error(`❌ Error al obtener detalles de campaña ${campaniaId}:`, campaniaDetallesError);
                continue;
            }
            
            console.log(`\n📋 Campaña con órdenes: ${campaniaDetalles.nombrecampania}`);
            console.log(`   ID: ${campaniaDetalles.id_campania}`);
            console.log(`   Cliente ID: ${campaniaDetalles.id_cliente}`);
            console.log(`   Año: ${campaniaDetalles.anios?.years || 'N/A'}`);
            console.log(`   Producto: ${campaniaDetalles.Productos?.nombredelproducto || 'N/A'}`);
            console.log(`   Órdenes: ${ordenesPorCampania[campaniaId].length}`);
            
            // Verificar si el cliente de esta campaña existe
            const { data: clienteCampania, error: clienteError } = await supabase
                .from('clientes')
                .select('id_cliente, nombrecliente, estado')
                .eq('id_cliente', campaniaDetalles.id_cliente)
                .single();
            
            if (clienteError) {
                console.error(`     ❌ Error al obtener cliente ${campaniaDetalles.id_cliente}:`, clienteError);
            } else {
                console.log(`   ✅ Cliente: ${clienteCampania.nombrecliente} (Estado: ${clienteCampania.estado})`);
                
                if (!clienteCampania.estado) {
                    console.log(`   ⚠️  ¡EL CLIENTE ESTÁ INACTIVO! Esto podría causar que no aparezca en el frontend.`);
                }
            }
        }

        console.log('\n🎉 DIAGNÓSTICO COMPLETADO');
        console.log('============================');
        console.log('✅ Si ves órdenes en este diagnóstico, el problema está en el frontend.');
        console.log('✅ Si no ves órdenes, el problema está en los datos o en el flujo del usuario.');
        console.log('\n🔍 POSIBLES CAUSAS SI NO SE VEN LAS ÓRDENES:');
        console.log('1. Los clientes están inactivos (estado = false)');
        console.log('2. Las campañas están inactivas');
        console.log('3. El frontend está filtrando por algún estado específico');
        console.log('4. Hay errores en la consola del navegador');
        console.log('5. El componente no está actualizando correctamente');

    } catch (error) {
        console.error('❌ Error en el diagnóstico:', error.message);
    }
}

// Ejecutar el diagnóstico
diagnosticarTiempoReal();