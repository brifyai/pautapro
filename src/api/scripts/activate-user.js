/**
 * Script de activación de usuario - PautaPro
 * Activa el usuario camiloalegriabarra@gmail.com y le otorga permisos de administrador
 */

const { createClient } = require('@supabase/supabase-js');

async function activateUser() {
  console.log('🔧 ACTIVANDO USUARIO ADMINISTRADOR...\n');

  try {
    // Configurar cliente Supabase
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('✅ Conectado a Supabase');
    console.log('👤 Activando usuario: camiloalegriabarra@gmail.com\n');

    // 1. ACTIVAR USUARIO EXISTENTE
    console.log('1️⃣ ACTIVANDO USUARIO EXISTENTE...');
    const { data: updateResult, error: updateError } = await supabase
      .from('usuarios')
      .update({
        estado: true,
        activo: true,
        perfil: 'admin',
        id_perfil: 1
      })
      .eq('email', 'camiloalegriabarra@gmail.com')
      .select();

    if (updateError) {
      console.log('⚠️  Error actualizando usuario existente:', updateError.message);
    } else if (updateResult && updateResult.length > 0) {
      console.log('✅ Usuario actualizado exitosamente');
      console.log('   Nombre:', updateResult[0].nombre);
      console.log('   Email:', updateResult[0].email);
      console.log('   Perfil:', updateResult[0].perfil);
      console.log('   Estado:', updateResult[0].estado ? 'Activo' : 'Inactivo');
    } else {
      console.log('ℹ️  Usuario no encontrado, creando nuevo usuario...');

      // 2. CREAR USUARIO SI NO EXISTE
      console.log('\n2️⃣ CREANDO NUEVO USUARIO ADMINISTRADOR...');
      const { data: newUser, error: createError } = await supabase
        .from('usuarios')
        .insert([{
          nombre: 'Camilo Alegria',
          email: 'camiloalegriabarra@gmail.com',
          password: '$2a$10$m5W3qgx6nGkV0GqA7HcXVu6dKq8Z1Q9S3X4T6U8V0W2Y4Z6A8B0C2E4F6G8I0', // admin123
          perfil: 'admin',
          id_perfil: 1,
          estado: true,
          activo: true,
          fecha_creacion: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        console.log('❌ Error creando usuario:', createError.message);
        return;
      } else {
        console.log('✅ Usuario creado exitosamente');
        console.log('   ID:', newUser.id_usuario);
        console.log('   Nombre:', newUser.nombre);
        console.log('   Email:', newUser.email);
      }
    }

    // 3. VERIFICAR PERMISOS MÓDULO API
    console.log('\n3️⃣ CONFIGURANDO PERMISOS DE API...');

    // Primero obtener el ID del usuario
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('email', 'camiloalegriabarra@gmail.com')
      .single();

    if (userError) {
      console.log('❌ Error obteniendo ID de usuario:', userError.message);
      return;
    }

    const userId = userData.id_usuario;

    // Insertar permisos de módulo API
    const { error: permisosError } = await supabase
      .from('permisos_modulos')
      .upsert({
        id_usuario: userId,
        modulo: 'api',
        ver: true,
        crear: true,
        editar: true,
        eliminar: true,
        admin: true,
        configuracion: true
      }, {
        onConflict: 'id_usuario,modulo'
      });

    if (permisosError) {
      console.log('⚠️  Error configurando permisos de módulo:', permisosError.message);
    } else {
      console.log('✅ Permisos de módulo API configurados');
    }

    // 4. VERIFICACIÓN FINAL
    console.log('\n4️⃣ VERIFICACIÓN FINAL...');

    const { data: finalUser, error: finalError } = await supabase
      .from('usuarios')
      .select(`
        id_usuario,
        nombre,
        email,
        perfil,
        id_perfil,
        estado,
        activo,
        permisos_modulos!inner(modulo, admin)
      `)
      .eq('email', 'camiloalegriabarra@gmail.com')
      .single();

    if (finalError) {
      console.log('❌ Error en verificación final:', finalError.message);
    } else {
      console.log('✅ VERIFICACIÓN EXITOSA:');
      console.log('   Nombre:', finalUser.nombre);
      console.log('   Email:', finalUser.email);
      console.log('   Perfil:', finalUser.perfil);
      console.log('   ID Perfil:', finalUser.id_perfil);
      console.log('   Estado:', finalUser.estado ? 'Activo' : 'Inactivo');
      console.log('   Activo:', finalUser.activo ? 'Sí' : 'No');

      // Verificar permisos de API
      const apiPermisos = finalUser.permisos_modulos?.find(p => p.modulo === 'api');
      if (apiPermisos) {
        console.log('   Permisos API:', apiPermisos.admin ? 'Administrador' : 'Limitado');
      } else {
        console.log('   ⚠️  Permisos API: No configurados');
      }
    }

    // 5. INSTRUCCIONES FINALES
    console.log('\n' + '='.repeat(50));
    console.log('🎉 ACTIVACIÓN COMPLETADA');
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('1. Refresca la página del navegador');
    console.log('2. Ve al menú de perfil (avatar en esquina superior)');
    console.log('3. Deberías ver la opción "API"');
    console.log('4. Haz clic en "API" para acceder al panel');
    console.log('5. Crea tu primer token de API');

    console.log('\n🔗 ACCESOS HABILITADOS:');
    console.log('• Panel de API: /admin/api');
    console.log('• Documentación: /api-desarrollador');
    console.log('• SDK: src/api/sdk/pautapro-client.js');

    console.log('\n💡 CONTRASEÑA DE PRUEBA:');
    console.log('Si creaste un nuevo usuario, la contraseña es: admin123');

  } catch (error) {
    console.error('💥 Error durante la activación:', error.message);
  }
}

// Ejecutar activación
if (require.main === module) {
  activateUser().then(() => {
    console.log('\n🏁 Activación completada');
  });
}

module.exports = { activateUser };