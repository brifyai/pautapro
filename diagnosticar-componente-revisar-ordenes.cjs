const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 DIAGNÓSTICO EN TIEMPO REAL DEL COMPONENTE REVISAR ÓRDENES');
console.log('========================================================\n');

// Simular exactamente la misma consulta que hace el componente
async function diagnosticarComponente() {
  try {
    console.log('1. Simulando fetchClientes() del componente...');
    
    // Esta es la misma consulta que hace el componente RevisarOrden
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('*')
      .order('nombrecliente');

    if (clientesError) {
      console.error('❌ Error en la consulta:', clientesError);
      return;
    }

    console.log(`✅ Se obtuvieron ${clientes.length} clientes\n`);

    console.log('2. Analizando datos que recibe el componente:');
    console.log('===========================================');
    
    clientes.forEach((cliente, index) => {
      console.log(`\nCliente ${index + 1}:`);
      console.log(`  ID: ${cliente.id_cliente}`);
      console.log(`  nombrecliente: "${cliente.nombrecliente}" (tipo: ${typeof cliente.nombrecliente})`);
      console.log(`  razonsocial: "${cliente.razonsocial}" (tipo: ${typeof cliente.razonsocial})`);
      console.log(`  rut: "${cliente.rut}" (tipo: ${typeof cliente.rut})`);
      
      // Verificar si los valores son null, undefined o strings vacíos
      const nombreVacio = !cliente.nombrecliente || cliente.nombrecliente.trim() === '';
      const razonSocialVacia = !cliente.razonsocial || cliente.razonsocial.trim() === '';
      const rutVacio = !cliente.rut || cliente.rut.trim() === '';
      
      console.log(`  ¿nombrecliente vacío?: ${nombreVacio}`);
      console.log(`  ¿razonsocial vacía?: ${razonSocialVacia}`);
      console.log(`  ¿rut vacío?: ${rutVacio}`);
      
      if (index < 3) { // Mostrar primeros 3 en detalle
        console.log('  Todos los campos:', Object.keys(cliente));
        Object.keys(cliente).forEach(key => {
          console.log(`    ${key}: ${JSON.stringify(cliente[key])}`);
        });
      }
    });

    console.log('\n3. Simulando filteredClientes del componente:');
    console.log('==============================================');
    
    const searchTerm = ''; // Sin búsqueda inicial
    const filteredClientes = clientes.filter(cliente =>
      (cliente.nombrecliente && cliente.nombrecliente.toLowerCase().includes(searchTerm.toLowerCase())) ||
      cliente.razonsocial?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log(`✅ Clientes filtrados: ${filteredClientes.length}`);

    console.log('\n4. Verificación de campos críticos:');
    console.log('==================================');
    
    let conNombre = 0;
    let conRazonSocial = 0;
    let conRut = 0;
    
    clientes.forEach(cliente => {
      if (cliente.nombrecliente && cliente.nombrecliente.trim() !== '') conNombre++;
      if (cliente.razonsocial && cliente.razonsocial.trim() !== '') conRazonSocial++;
      if (cliente.rut && cliente.rut.trim() !== '') conRut++;
    });
    
    console.log(`Con nombrecliente: ${conNombre}/${clientes.length} (${((conNombre/clientes.length)*100).toFixed(1)}%)`);
    console.log(`Con razonsocial: ${conRazonSocial}/${clientes.length} (${((conRazonSocial/clientes.length)*100).toFixed(1)}%)`);
    console.log(`Con rut: ${conRut}/${clientes.length} (${((conRut/clientes.length)*100).toFixed(1)}%)`);

    console.log('\n5. Simulando renderizado de la tabla:');
    console.log('===================================');
    
    console.log('Encabezado de la tabla:');
    console.log('  | Nombre del Cliente | Razón Social | RUT | Acción |');
    console.log('  |-------------------|-------------|-----|--------|');
    
    filteredClientes.slice(0, 5).forEach((cliente, index) => {
      const nombre = cliente.nombrecliente || 'Sin nombre';
      const razonSocial = cliente.razonsocial || 'Sin razón social';
      const rut = cliente.rut || 'Sin RUT';
      
      console.log(`  | ${nombre.padEnd(17)} | ${razonSocial.padEnd(11)} | ${rut.padEnd(3)} | Seleccionar |`);
    });

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar diagnóstico
diagnosticarComponente().then(() => {
  console.log('\n🏁 DIAGNÓSTICO COMPLETADO');
});