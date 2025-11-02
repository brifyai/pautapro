const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔧 COMPLETANDO RUTS FALTANTES DE CLIENTES');
console.log('========================================\n');

// RUTs de ejemplo para los clientes que no tienen
const rutsDeEjemplo = [
  '77.111.222-3',
  '77.333.444-4', 
  '77.555.666-5',
  '77.777.888-6',
  '77.999.000-7',
  '78.111.222-8',
  '78.333.444-9',
  '78.555.666-0',
  '78.777.888-1',
  '78.999.000-2'
];

async function completarRuts() {
  try {
    // 1. Obtener clientes sin RUT
    console.log('1. Buscando clientes sin RUT...');
    const { data: clientesSinRut, error: clientesError } = await supabase
      .from('clientes')
      .select('id_cliente, nombrecliente, razonsocial')
      .is('rut', null);

    if (clientesError) {
      console.error('❌ Error al obtener clientes sin RUT:', clientesError);
      return;
    }

    console.log(`✅ Se encontraron ${clientesSinRut.length} clientes sin RUT`);

    if (clientesSinRut.length === 0) {
      console.log('🎉 Todos los clientes ya tienen RUT');
      return;
    }

    // 2. Mostrar clientes que se van a actualizar
    console.log('\n2. Clientes que se van a actualizar:');
    clientesSinRut.forEach((cliente, index) => {
      console.log(`   ${index + 1}. ${cliente.nombrecliente} - ${cliente.razonsocial}`);
    });

    // 3. Actualizar cada cliente con un RUT de ejemplo
    console.log('\n3. Actualizando RUTs...');
    let actualizados = 0;
    let errores = 0;

    for (let i = 0; i < clientesSinRut.length; i++) {
      const cliente = clientesSinRut[i];
      const nuevoRut = rutsDeEjemplo[i % rutsDeEjemplo.length];

      try {
        const { error: updateError } = await supabase
          .from('clientes')
          .update({ rut: nuevoRut })
          .eq('id_cliente', cliente.id_cliente);

        if (updateError) {
          console.error(`❌ Error al actualizar cliente ${cliente.nombrecliente}:`, updateError);
          errores++;
        } else {
          console.log(`✅ Actualizado: ${cliente.nombrecliente} -> RUT: ${nuevoRut}`);
          actualizados++;
        }
      } catch (error) {
        console.error(`❌ Error inesperado con cliente ${cliente.nombrecliente}:`, error);
        errores++;
      }
    }

    // 4. Verificación final
    console.log('\n4. Verificación final...');
    const { data: verificacion, error: verificacionError } = await supabase
      .from('clientes')
      .select('id_cliente, nombrecliente, rut')
      .is('rut', null);

    if (verificacionError) {
      console.error('❌ Error en verificación:', verificacionError);
    } else {
      console.log(`✅ Clientes sin RUT después de la actualización: ${verificacion.length}`);
    }

    // 5. Resumen
    console.log('\n📊 RESUMEN DE LA OPERACIÓN:');
    console.log(`   ✅ Clientes actualizados correctamente: ${actualizados}`);
    console.log(`   ❌ Clientes con errores: ${errores}`);
    console.log(`   📋 Total procesados: ${clientesSinRut.length}`);

    if (errores === 0) {
      console.log('\n🎉 ¡Todos los RUTs fueron completados exitosamente!');
    } else {
      console.log('\n⚠️ Algunos clientes no pudieron ser actualizados. Revisa los errores arriba.');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar la función
completarRuts().then(() => {
  console.log('\n🏁 OPERACIÓN COMPLETADA');
});