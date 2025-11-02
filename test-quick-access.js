// Test para verificar el acceso rápido sin contraseña
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuickAccess() {
    console.log('🚀 Probando acceso rápido sin contraseña...\n');
    
    try {
        // 1. Verificar conexión a la base de datos
        console.log('1. Verificando conexión a Supabase...');
        const { data: connectionTest, error: connectionError } = await supabase
            .from('usuarios')
            .select('count')
            .limit(1);
            
        if (connectionError) {
            console.error('❌ Error de conexión:', connectionError);
            return;
        }
        console.log('✅ Conexión exitosa\n');
        
        // 2. Verificar si la tabla usuarios existe
        console.log('2. Verificando tabla usuarios...');
        const { data: tableExists, error: tableError } = await supabase
            .from('usuarios')
            .select('*')
            .limit(1);
            
        if (tableError) {
            console.error('❌ La tabla usuarios no existe:', tableError);
            console.log('💡 Ejecuta el script ensure-register-works.sql en Supabase');
            return;
        }
        console.log('✅ Tabla usuarios existe\n');
        
        // 3. Buscar usuario camiloalegriabarra@gmail.com
        console.log('3. Buscando usuario camiloalegriabarra@gmail.com...');
        const { data: camiloUser, error: camiloError } = await supabase
            .from('usuarios')
            .select('id_usuario, Email, Nombre, Apellido, Avatar, Estado, Password')
            .eq('Email', 'camiloalegriabarra@gmail.com')
            .single();
            
        if (camiloError) {
            console.log('⚠️  Usuario camiloalegriabarra@gmail.com no encontrado');
        } else {
            console.log('✅ Usuario Camilo encontrado:', {
                id: camiloUser.id_usuario,
                email: camiloUser.Email,
                nombre: camiloUser.Nombre + ' ' + camiloUser.Apellido,
                estado: camiloUser.Estado ? 'Activo' : 'Inactivo'
            });
        }
        
        // 4. Buscar usuario admin@sistema.cl
        console.log('\n4. Buscando usuario admin@sistema.cl...');
        const { data: adminUser, error: adminError } = await supabase
            .from('usuarios')
            .select('id_usuario, Email, Nombre, Apellido, Avatar, Estado, Password')
            .eq('Email', 'admin@sistema.cl')
            .single();
            
        if (adminError) {
            console.log('⚠️  Usuario admin@sistema.cl no encontrado');
        } else {
            console.log('✅ Usuario Admin encontrado:', {
                id: adminUser.id_usuario,
                email: adminUser.Email,
                nombre: adminUser.Nombre + ' ' + adminUser.Apellido,
                estado: adminUser.Estado ? 'Activo' : 'Inactivo'
            });
        }
        
        // 5. Verificar políticas RLS
        console.log('\n5. Verificando políticas RLS...');
        const { data: rlsTest, error: rlsError } = await supabase
            .from('usuarios')
            .select('*')
            .limit(1);
            
        if (rlsError) {
            console.error('❌ Error en políticas RLS:', rlsError);
            console.log('💡 Las políticas RLS pueden estar bloqueando el acceso');
        } else {
            console.log('✅ Políticas RLS funcionan correctamente');
        }
        
        // 6. Resumen
        console.log('\n=== RESUMEN DE ACCESO RÁPIDO ===');
        
        if (!camiloError && camiloUser.Estado) {
            console.log('✅ ACCESO RÁPIDO CON CAMILO: DISPONIBLE');
        } else if (!adminError && adminUser.Estado) {
            console.log('✅ ACCESO RÁPIDO CON ADMIN: DISPONIBLE');
        } else {
            console.log('❌ ACCESO RÁPIDO: NO DISPONIBLE');
            console.log('💡 Solución: Ejecuta ensure-register-works.sql en Supabase');
        }
        
        console.log('\n=== PASOS PARA ACTIVAR ACCESO RÁPIDO ===');
        console.log('1. Abre https://app.supabase.com');
        console.log('2. Ve a tu proyecto: rfjbsoxkgmuehrgteljq');
        console.log('3. Ve a SQL Editor');
        console.log('4. Copia y pega el contenido de ensure-register-works.sql');
        console.log('5. Ejecuta el script');
        console.log('6. Recarga la aplicación y prueba el botón "🚀 ACCESO RÁPIDO"');
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

// Ejecutar test
testQuickAccess();