/**
 * Script para arreglar el estado del usuario en localStorage
 * Fuerza recarga de datos desde la base de datos
 */

async function fixUserStatus() {
  console.log('🔧 ARREGLANDO ESTADO DEL USUARIO...\n');

  try {
    // 1. Limpiar localStorage para forzar recarga
    console.log('1️⃣ Limpiando localStorage...');
    localStorage.clear();
    sessionStorage.clear();

    // 2. Disparar evento de cambio de autenticación
    window.dispatchEvent(new Event('auth-change'));

    console.log('✅ LocalStorage limpiado');
    console.log('✅ Evento de cambio de autenticación disparado');

    // 3. Mostrar instrucciones al usuario
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('1. Ve a la página de login: /login');
    console.log('2. Ingresa tus credenciales:');
    console.log('   - Email: camiloalegriabarra@gmail.com');
    console.log('   - Password: Antonito26');
    console.log('3. El sistema ahora cargará tus datos actualizados');
    console.log('4. Deberías ver "Estado: Activo" en tu perfil');
    console.log('5. El botón "API" aparecerá en el menú de perfil');

    // 4. Mostrar mensaje de éxito
    console.log('\n🎉 ¡PROCESO COMPLETADO!');
    console.log('El usuario ahora podrá hacer login con datos actualizados.');

  } catch (error) {
    console.error('💥 Error durante el proceso:', error.message);
  }
}

// Ejecutar si se llama directamente
if (typeof window !== 'undefined' && window.location) {
  // Ejecutar automáticamente si estamos en el navegador
  fixUserStatus();
}

module.exports = { fixUserStatus };