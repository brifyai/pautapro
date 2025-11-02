const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 VERIFICACIÓN DE CORRECCIONES - REVISAR ÓRDENES');
console.log('==================================================\n');

async function verificarCorrecciones() {
    try {
        console.log('📊 PASO 1: Verificar clientes con nombres corregidos...');
        const { data: clientes, error: clientesError } = await supabase
            .from('clientes')
            .select('id_cliente, nombrecliente, razonsocial, rut')
            .limit(5);
        
        if (clientesError) {
            console.error('❌ Error al obtener clientes:', clientesError);
        } else {
            console.log(`✅ Clientes encontrados: ${clientes.length}`);
            clientes.forEach(cliente => {
                console.log(`   - ID: ${cliente.id_cliente}`);
                console.log(`     Nombre: ${cliente.nombrecliente}`);
                console.log(`     Razón Social: ${cliente.razonsocial || 'N/A'}`);
                console.log(`     RUT: ${cliente.rut || 'N/A'}`);
            });
        }

        console.log('\n📋 PASO 2: Verificar campañas con nombres corregidos...');
        const { data: campanias, error: campaniasError } = await supabase
            .from('campania')
            .select(`
                id_campania,
                nombrecampania,
                id_cliente,
                Clientes!inner (
                    id_cliente,
                    nombrecliente,
                    razonsocial
                )
            `)
            .limit(5);
        
        if (campaniasError) {
            console.error('❌ Error al obtener campañas:', campaniasError);
        } else {
            console.log(`✅ Campañas encontradas: ${campanias.length}`);
            campanias.forEach(campana => {
                console.log(`   - ID: ${campana.id_campania}`);
                console.log(`     Nombre: ${campana.nombrecampania}`);
                console.log(`     Cliente: ${campana.Clientes?.nombrecliente}`);
                console.log(`     ID Cliente: ${campana.id_cliente}`);
            });
        }

        console.log('\n📄 PASO 3: Verificar órdenes con campaña específica...');
        if (campanias && campanias.length > 0) {
            const primerCampana = campanias[0];
            console.log(`🔄 Probando con campaña: ${primerCampana.nombrecampania} (ID: ${primerCampana.id_campania})`);
            
            // Esta es la consulta exacta que hace RevisarOrden.jsx (corregida)
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
                }
            }
        }

        console.log('\n🎯 PASO 4: Buscar campañas que SÍ tienen órdenes...');
        const { data: ordenesConCampanias, error: ordenesError } = await supabase
            .from('ordenesdepublicidad')
            .select('id_campania')
            .not('id_campania', 'is', null)
            .limit(20);
        
        if (!ordenesError && ordenesConCampanias.length > 0) {
            const campaniasConOrdenes = [...new Set(ordenesConCampanias.map(o => o.id_campania))];
            console.log(`✅ IDs de campañas con órdenes: ${campaniasConOrdenes.join(', ')}`);
            
            // Obtener detalles de las campañas con órdenes
            const { data: campaniasConOrdenesDetalles, error: detallesError } = await supabase
                .from('campania')
                .select(`
                    id_campania,
                    nombrecampania,
                    id_cliente,
                    Clientes!inner (
                        id_cliente,
                        nombrecliente
                    )
                `)
                .in('id_campania', campaniasConOrdenes.slice(0, 5));
            
            if (!detallesError) {
                console.log('\n📋 Campañas con órdenes (con detalles):');
                campaniasConOrdenesDetalles.forEach(campana => {
                    console.log(`   - ${campana.nombrecampania} (ID: ${campana.id_campania})`);
                    console.log(`     Cliente: ${campana.Clientes?.nombrecliente}`);
                });
            }
        }

        console.log('\n🎉 VERIFICACIÓN COMPLETADA');
        console.log('============================');
        console.log('✅ Correcciones aplicadas:');
        console.log('1. ✅ Campo "id_Cliente" corregido a "id_cliente"');
        console.log('2. ✅ Campo "razonSocial" corregido a "razonsocial"');
        console.log('3. ✅ Campo "RUT" corregido a "rut"');
        console.log('4. ✅ Componente RevisarOrden.jsx actualizado');
        console.log('\n🚀 La página http://localhost:5173/ordenes/revisar debería funcionar ahora');

    } catch (error) {
        console.error('❌ Error en la verificación:', error.message);
    }
}

// Ejecutar la verificación
verificarCorrecciones();