// Debug para verificar el problema de API 400
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSupabaseAPI() {
    console.log('🔍 Debug de API Supabase - Error 400\n');
    
    try {
        // 1. Verificar conexión básica
        console.log('1. Verificando conexión básica...');
        const { data: connectionTest, error: connectionError } = await supabase
            .from('usuarios')
            .select('*')
            .limit(1);
            
        if (connectionError) {
            console.error('❌ Error de conexión:', connectionError);
            console.log('Detalles:', JSON.stringify(connectionError, null, 2));
            return;
        }
        console.log('✅ Conexión básica exitosa\n');
        
        // 2. Verificar estructura de la tabla
        console.log('2. Verificando estructura de la tabla usuarios...');
        const { data: tableInfo, error: tableError } = await supabase
            .from('usuarios')
            .select('*')
            .limit(0);
            
        if (tableError) {
            console.error('❌ Error al verificar tabla:', tableError);
            return;
        }
        console.log('✅ Estructura de tabla accesible\n');
        
        // 3. Intentar consulta específica que falla
        console.log('3. Reproduciendo consulta que falla...');
        console.log('Consulta: SELECT id_usuario, Email, Nombre, Apellido, Avatar, Estado, Password FROM usuarios WHERE Email = eq.camiloalegriabarra@gmail.com');
        
        const { data: specificQuery, error: specificError } = await supabase
            .from('usuarios')
            .select('id_usuario, Email, Nombre, Apellido, Avatar, Estado, Password')
            .eq('Email', 'camiloalegriabarra@gmail.com');
            
        if (specificError) {
            console.error('❌ Error en consulta específica:', specificError);
            console.log('Código:', specificError.code);
            console.log('Mensaje:', specificError.message);
            console.log('Detalles:', specificError.details);
            
            // Analizar posible causa
            console.log('\n🔍 Análisis del error:');
            if (specificError.code === '400') {
                console.log('Posibles causas de error 400:');
                console.log('1. La tabla "usuarios" no existe');
                console.log('2. Los nombres de columnas son incorrectos');
                console.log('3. Problema de permisos RLS');
                console.log('4. La API key no tiene permisos');
            }
        } else {
            console.log('✅ Consulta específica exitosa:', specificQuery);
        }
        
        // 4. Verificar si la tabla existe realmente
        console.log('\n4. Verificando existencia de tabla usuarios...');
        const { data: allTables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .eq('table_name', 'usuarios');
            
        if (tablesError) {
            console.error('❌ Error al verificar tablas:', tablesError);
        } else {
            if (allTables && allTables.length > 0) {
                console.log('✅ Tabla usuarios existe en information_schema');
            } else {
                console.log('❌ Tabla usuarios NO existe en information_schema');
                console.log('💡 Solución: Ejecuta create-users-simple.sql para crear la tabla');
            }
        }
        
        // 5. Listar todas las tablas disponibles
        console.log('\n5. Listando todas las tablas disponibles...');
        try {
            const { data: allUserTables, error: allTablesError } = await supabase
                .from('pg_tables')
                .select('tablename')
                .eq('schemaname', 'public');
                
            if (allTablesError) {
                console.error('❌ Error al listar tablas:', allTablesError);
            } else {
                console.log('Tablas encontradas:');
                if (allUserTables && allUserTables.length > 0) {
                    allUserTables.forEach(table => {
                        console.log(`  - ${table.tablename}`);
                    });
                } else {
                    console.log('  (No se encontraron tablas)');
                }
            }
        } catch (err) {
            console.error('❌ Error al consultar pg_tables:', err.message);
        }
        
        // 6. Verificar permisos RLS
        console.log('\n6. Verificando políticas RLS...');
        try {
            const { data: rlsPolicies, error: rlsError } = await supabase
                .from('pg_policies')
                .select('policyname, tablename, permissive, roles, cmd')
                .eq('tablename', 'usuarios');
                
            if (rlsError) {
                console.error('❌ Error al verificar políticas RLS:', rlsError);
            } else {
                if (rlsPolicies && rlsPolicies.length > 0) {
                    console.log('Políticas RLS encontradas:');
                    rlsPolicies.forEach(policy => {
                        console.log(`  - ${policy.policyname} (${policy.cmd})`);
                    });
                } else {
                    console.log('❌ No hay políticas RLS para la tabla usuarios');
                    console.log('💡 Esto puede causar el error 400');
                }
            }
        } catch (err) {
            console.error('❌ Error al consultar pg_policies:', err.message);
        }
        
        // 7. Resumen y solución
        console.log('\n=== RESUMEN Y SOLUCIÓN ===');
        console.log('El error 400 indica que la API no puede procesar la solicitud.');
        console.log('Causas más probables:');
        console.log('1. La tabla "usuarios" no existe');
        console.log('2. Los nombres de columnas no coinciden');
        console.log('3. Problemas con políticas RLS');
        console.log('');
        console.log('SOLUCIÓN RECOMENDADA:');
        console.log('1. Ejecuta el script create-users-simple.sql en Supabase');
        console.log('2. Verifica que la tabla se cree correctamente');
        console.log('3. Recarga la aplicación');
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

// Ejecutar debug
debugSupabaseAPI();