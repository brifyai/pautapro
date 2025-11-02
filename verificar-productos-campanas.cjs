const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://vlxujefzjkqznfwmpkhe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZseHVqZWZ6amtxem5md21wa2hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0MDk3NzQsImV4cCI6MjA0NTk4NTc3NH0.8p2b7c2y3s7Q9w1d6r5x4f3g2h1j9k8l7m6n5o2p1q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarProductosEnCampanas() {
    console.log('🔍 Verificando productos en campañas...\n');
    
    try {
        // 1. Obtener todas las campañas con sus productos
        const { data: campanas, error: campanasError } = await supabase
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
            .limit(5);
        
        if (campanasError) {
            console.error('❌ Error al obtener campañas:', campanasError);
            return;
        }
        
        console.log('📋 Campañas encontradas:');
        campanas.forEach((campana, index) => {
            console.log(`\n${index + 1}. Campaña: ${campana.nombrecampania}`);
            console.log(`   ID: ${campana.id_campania}`);
            console.log(`   ID Producto: ${campana.id_producto}`);
            console.log(`   Producto: ${campana.productos?.nombredelproducto || 'SIN PRODUCTO'}`);
        });
        
        // 2. Verificar específicamente campañas que tienen productos
        const { data: campanasConProductos, error: conProductosError } = await supabase
            .from('campania')
            .select(`
                id_campania,
                nombrecampania,
                productos (
                    id,
                    nombredelproducto
                )
            `)
            .not('id_producto', 'is', null)
            .limit(3);
        
        if (conProductosError) {
            console.error('❌ Error al obtener campañas con productos:', conProductosError);
            return;
        }
        
        console.log('\n🎯 Campañas con productos asociados:');
        campanasConProductos.forEach((campana, index) => {
            console.log(`\n${index + 1}. Campaña: ${campana.nombrecampania}`);
            console.log(`   Producto: ${campana.productos?.nombredelproducto || 'ERROR - NO SE CARGÓ'}`);
            console.log(`   Objeto productos completo:`, campana.productos);
        });
        
        // 3. Verificar la tabla productos
        const { data: productos, error: productosError } = await supabase
            .from('productos')
            .select('*')
            .limit(5);
        
        if (productosError) {
            console.error('❌ Error al obtener productos:', productosError);
            return;
        }
        
        console.log('\n📦 Productos en la base de datos:');
        productos.forEach((producto, index) => {
            console.log(`\n${index + 1}. Producto: ${producto.nombredelproducto}`);
            console.log(`   ID: ${producto.id}`);
        });
        
        console.log('\n✅ Verificación completada');
        
    } catch (error) {
        console.error('❌ Error en la verificación:', error);
    }
}

verificarProductosEnCampanas();