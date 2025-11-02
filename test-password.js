import bcrypt from 'bcryptjs';

// Hash almacenado en la base de datos
const storedHash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm';

// Contraseñas comunes para probar
const passwordsToTest = [
  'Antonito26',
  'Antonito',
  'antonito26',
  'antonito',
  'password',
  '123456',
  'admin',
  'camilo',
  'Camilo26',
  'camilo26'
];

async function testPasswords() {
  console.log('🔍 Probando contraseñas contra el hash almacenado:');
  console.log('Hash:', storedHash);
  console.log('');
  
  for (const password of passwordsToTest) {
    try {
      const isMatch = await bcrypt.compare(password, storedHash);
      console.log(`Contraseña "${password}": ${isMatch ? '✅ COINCIDE' : '❌ No coincide'}`);
      
      if (isMatch) {
        console.log(`🎉 ¡CONTRASEÑA ENCONTRADA: "${password}"`);
        break;
      }
    } catch (error) {
      console.log(`Error probando "${password}":`, error.message);
    }
  }
  
  // También generar un nuevo hash para "Antonito26" para comparar
  console.log('\n📝 Generando nuevo hash para "Antonito26":');
  try {
    const newHash = await bcrypt.hash('Antonito26', 12);
    console.log('Nuevo hash:', newHash);
    
    // Verificar que el nuevo hash funciona
    const verifyNewHash = await bcrypt.compare('Antonito26', newHash);
    console.log('Verificación nuevo hash:', verifyNewHash ? '✅ Funciona' : '❌ No funciona');
  } catch (error) {
    console.log('Error generando hash:', error.message);
  }
}

testPasswords();