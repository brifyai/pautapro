// Script para diagnosticar problemas de login
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugLogin() {
  console.log('🔍 DIAGNÓSTICO DEL SISTEMA DE LOGIN');
  console.log('=====================================');

  try {
    // 1. Verificar conexión con Supabase
    console.log('\n1. Verificando conexión con Supabase...');
    const { data, error } = await supabase.from('usuarios').select('count').single();
    
    if (error) {
      console.error('❌ Error de conexión:', error.message);
      console.log('\n💡 Solución:');
      console.log('   - Verifica que las credenciales de Supabase sean correctas');
      console.log('   - Revisa el archivo .env o src/config/supabase.js');
      console.log('   - Asegúrate que el proyecto de Supabase exista');
      return;
    }
    
    console.log('✅ Conexión con Supabase exitosa');

    // 2. Verificar si las tablas existen
    console.log('\n2. Verificando tablas...');
    
    const tables = ['usuarios', 'perfiles', 'grupos', 'vista_usuarios_completa'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.error(`❌ Tabla '${table}' no existe o no es accesible:`, error.message);
        } else {
          console.log(`✅ Tabla '${table}' existe y es accesible`);
        }
      } catch (err) {
        console.error(`❌ Error verificando tabla '${table}':`, err.message);
      }
    }

    // 3. Verificar usuario Camilo
    console.log('\n3. Buscando usuario Camilo Alegria...');
    
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', 'camiloalegriabarra@gmail.com')
      .single();

    if (userError) {
      console.error('❌ Usuario no encontrado:', userError.message);
      console.log('\n💡 Solución:');
      console.log('   - Ejecuta el script create-user-system.sql en Supabase');
      console.log('   - Verifica que el usuario se haya creado correctamente');
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log(`   ID: ${usuario.id_usuario}`);
    console.log(`   Nombre: ${usuario.nombre} ${usuario.apellido}`);
    console.log(`   Email: ${usuario.email}`);
    console.log(`   Estado: ${usuario.estado ? 'Activo' : 'Inactivo'}`);
    console.log(`   Perfil ID: ${usuario.id_perfil}`);
    console.log(`   Grupo ID: ${usuario.id_grupo}`);

    // 4. Verificar vista completa
    console.log('\n4. Verificando vista completa del usuario...');
    
    const { data: vistaUsuario, error: vistaError } = await supabase
      .from('vista_usuarios_completa')
      .select('*')
      .eq('email', 'camiloalegriabarra@gmail.com')
      .single();

    if (vistaError) {
      console.error('❌ Error en vista completa:', vistaError.message);
      console.log('\n💡 Solución:');
      console.log('   - Asegúrate que la vista vista_usuarios_completa exista');
      console.log('   - Verifica que la vista tenga los campos correctos');
    } else {
      console.log('✅ Vista completa funciona:');
      console.log(`   Rol: ${vistaUsuario.nombre_perfil}`);
      console.log(`   Grupo: ${vistaUsuario.nombre_grupo}`);
      console.log(`   Nivel acceso: ${vistaUsuario.nivel_acceso}`);
    }

    // 5. Verificar contraseña
    console.log('\n5. Verificando contraseña...');
    
    if (usuario.password) {
      console.log('✅ Contraseña almacenada en la base de datos');
      console.log(`   Hash: ${usuario.password.substring(0, 20)}...`);
    } else {
      console.error('❌ No hay contraseña almacenada');
      console.log('\n💡 Solución:');
      console.log('   - Ejecuta el script para actualizar la contraseña');
    }

    console.log('\n🎯 DIAGNÓSTICO COMPLETADO');
    console.log('Si todo está en ✅, el problema puede estar en:');
    console.log('1. El hashing de contraseña en el frontend');
    console.log('2. La comparación de hashes');
    console.log('3. El flujo de autenticación en authServiceImproved.js');

  } catch (error) {
    console.error('❌ Error general en diagnóstico:', error.message);
  }
}

// Ejecutar diagnóstico
debugLogin();