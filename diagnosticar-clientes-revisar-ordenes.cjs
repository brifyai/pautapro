const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 DIAGNÓSTICO DE CLIENTES PARA REVISAR ÓRDENES');
console.log('==========================================\n');

async function diagnosticarClientes() {
  try {
    // 1. Verificar conexión
    console.log('1. Verificando conexión a la base de datos...');
    const { data: testData, error: testError } = await supabase
      .from('clientes')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error de conexión:', testError);
      return;
    }
    console.log('✅ Conexión exitosa\n');

    // 2. Obtener todos los clientes con todos los campos
    console.log('2. Obteniendo todos los clientes...');
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('*')
      .order('nombrecliente');

    if (clientesError) {
      console.error('❌ Error al obtener clientes:', clientesError);
      return;
    }

    console.log(`✅ Se encontraron ${clientes.length} clientes\n`);

    // 3. Analizar estructura de los datos
    console.log('3. Analizando estructura de los datos...');
    if (clientes.length > 0) {
      const primerCliente = clientes[0];
      console.log('Campos disponibles en el primer cliente:');
      Object.keys(primerCliente).forEach(key => {
        const value = primerCliente[key];
        const tipo = typeof value;
        const estado = value !== null && value !== undefined ? '✅' : '❌';
        console.log(`  ${estado} ${key}: ${tipo} = ${value}`);
      });
      console.log('');
    }

    // 4. Verificar específicamente los campos problemáticos
    console.log('4. Verificación específica de campos problemáticos...');
    let razonsocialVacios = 0;
    let rutVacios = 0;
    let nombreclienteVacios = 0;

    clientes.forEach((cliente, index) => {
      const tieneRazonSocial = cliente.razonsocial && cliente.razonsocial.trim() !== '';
      const tieneRut = cliente.rut && cliente.rut.trim() !== '';
      const tieneNombreCliente = cliente.nombrecliente && cliente.nombrecliente.trim() !== '';

      if (!tieneRazonSocial) razonsocialVacios++;
      if (!tieneRut) rutVacios++;
      if (!tieneNombreCliente) nombreclienteVacios++;

      if (index < 5) { // Mostrar primeros 5 como ejemplo
        console.log(`\nCliente ${index + 1}:`);
        console.log(`  ID: ${cliente.id_cliente}`);
        console.log(`  Nombre Cliente: ${tieneNombreCliente ? '✅' : '❌'} "${cliente.nombrecliente}"`);
        console.log(`  Razón Social: ${tieneRazonSocial ? '✅' : '❌'} "${cliente.razonsocial}"`);
        console.log(`  RUT: ${tieneRut ? '✅' : '❌'} "${cliente.rut}"`);
      }
    });

    console.log('\n5. Resumen de calidad de datos:');
    console.log(`  Clientes con razón social vacía: ${razonsocialVacios}/${clientes.length} (${((razonsocialVacios/clientes.length)*100).toFixed(1)}%)`);
    console.log(`  Clientes con RUT vacío: ${rutVacios}/${clientes.length} (${((rutVacios/clientes.length)*100).toFixed(1)}%)`);
    console.log(`  Clientes con nombre cliente vacío: ${nombreclienteVacios}/${clientes.length} (${((nombreclienteVacios/clientes.length)*100).toFixed(1)}%)`);

    // 6. Verificar si hay clientes con datos completos
    console.log('\n6. Clientes con datos completos (razón social y RUT):');
    const clientesCompletos = clientes.filter(c => 
      c.razonsocial && c.razonsocial.trim() !== '' && 
      c.rut && c.rut.trim() !== ''
    );

    if (clientesCompletos.length > 0) {
      console.log(`✅ Se encontraron ${clientesCompletos.length} clientes con datos completos:`);
      clientesCompletos.slice(0, 10).forEach((cliente, index) => {
        console.log(`  ${index + 1}. ${cliente.nombrecliente} - ${cliente.razonsocial} - ${cliente.rut}`);
      });
    } else {
      console.log('❌ No se encontraron clientes con razón social y RUT completos');
    }

    // 7. Simular la consulta que hace el componente RevisarOrden
    console.log('\n7. Simulando consulta del componente RevisarOrden...');
    const { data: simulatedData, error: simulatedError } = await supabase
      .from('clientes')
      .select('id_cliente, nombrecliente, razonsocial, rut')
      .limit(5);

    if (simulatedError) {
      console.error('❌ Error en simulación:', simulatedError);
    } else {
      console.log('✅ Datos que recibiría el componente:');
      simulatedData.forEach((cliente, index) => {
        console.log(`  Cliente ${index + 1}:`);
        console.log(`    id_cliente: ${cliente.id_cliente}`);
        console.log(`    nombrecliente: "${cliente.nombrecliente}"`);
        console.log(`    razonsocial: "${cliente.razonsocial}"`);
        console.log(`    rut: "${cliente.rut}"`);
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar diagnóstico
diagnosticarClientes().then(() => {
  console.log('\n🏁 DIAGNÓSTICO COMPLETADO');
});