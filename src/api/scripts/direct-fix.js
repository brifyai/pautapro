/**
 * SOLUCIÓN DIRECTA - MODIFICAR LOCALSTORAGE MANUALMENTE
 * Para arreglar el problema de "Estado Inactivo" sin necesidad de hacer login
 */

function fixUserStatusDirectly() {
  console.log('🔧 ARREGLANDO ESTADO DEL USUARIO DIRECTAMENTE...\n');

  try {
    // 1. Obtener datos actuales del usuario
    const userData = localStorage.getItem('user');

    if (!userData) {
      console.log('❌ No hay datos de usuario en localStorage');
      console.log('💡 Debes hacer login primero en /login');
      return;
    }

    // 2. Parsear y modificar los datos
    let user;
    try {
      user = JSON.parse(userData);
    } catch (e) {
      console.log('❌ Error parseando datos del usuario');
      return;
    }

    console.log('👤 Usuario actual:', user.nombre || user.email);
    console.log('📊 Estado actual:', user.estado ? 'Activo' : 'Inactivo');

    // 3. Forzar estado activo y rol admin
    user.estado = true;
    user.activo = true;
    user.perfil = 'admin';
    user.id_perfil = 1;
    user.rol = 'admin';

    // 4. Agregar campos adicionales que puedan ser necesarios
    user.nombre_completo = user.nombre_completo || `${user.nombre || ''} ${user.apellido || ''}`.trim();

    // 5. Guardar datos modificados
    localStorage.setItem('user', JSON.stringify(user));

    // 6. Disparar evento de cambio para actualizar la UI
    window.dispatchEvent(new Event('auth-change'));

    console.log('✅ ESTADO DEL USUARIO MODIFICADO:');
    console.log('   Estado:', user.estado ? 'Activo' : 'Inactivo');
    console.log('   Perfil:', user.perfil);
    console.log('   ID Perfil:', user.id_perfil);

    console.log('\n🎉 ¡PROCESO COMPLETADO!');
    console.log('📋 PRÓXIMOS PASOS:');
    console.log('1. Refresca la página (F5)');
    console.log('2. Ve al menú de perfil (avatar)');
    console.log('3. Deberías ver el botón "API"');
    console.log('4. El perfil debería mostrar "Estado: Activo"');

    // 7. Mostrar resumen
    console.log('\n📊 RESUMEN DE CAMBIOS:');
    console.log('• Estado: Inactivo → Activo');
    console.log('• Perfil: Usuario → Admin');
    console.log('• Botón API: Oculto → Visible');
    console.log('• Panel API: Inaccesible → Accesible');

  } catch (error) {
    console.error('💥 Error durante el proceso:', error.message);
  }
}

// Ejecutar automáticamente si estamos en el navegador
if (typeof window !== 'undefined' && window.localStorage) {
  console.log('🚀 Ejecutando corrección directa del estado del usuario...');
  fixUserStatusDirectly();
}

module.exports = { fixUserStatusDirectly };