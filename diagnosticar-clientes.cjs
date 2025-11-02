const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rfjbsoxkgmuehrgteljq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmamJzb3hrZ211aHJndGVsanEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczODAwNjQzNSwiZXhwIjoyMDUzNTgyMDM1fQ.qR5sP5mYZJJJqiQYvNqF8yWJrVH1W8m7oE_5j9Q2x0Y'
);

async function diagnosticarClientes() {
  try {
    console.log('=== DIAGNÓSTICO DE TABLA CLIENTES ===\n');
    
    // 1. Obtener estructura de la tabla
    console.log('1. Obteniendo estructura de la tabla clientes...');
    const { data: columns, error: columnsError } = await supabase
      .from('clientes')
      .select('*')
      .limit(1);
    
    if (columnsError) {
      console.log('Error obteniendo estructura:', columnsError.message);
      return;
    }
    
    if (columns && columns.length > 0) {
      console.log('Columnas encontradas:');
      Object.keys(columns[0]).forEach(key => {
        console.log(`  - ${key}: ${typeof columns[0][key]} (${columns[0][key]})`);
      });
    }
    
    // 2. Obtener todos los clientes
    console.log('\n2. Obteniendo todos los clientes...');
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('*')
      .limit(5);
    
    if (clientesError) {
      console.log('Error obteniendo clientes:', clientesError.message);
      return;
    }
    
    console.log(`Total de clientes: ${clientes.length}`);
    
    // 3. Analizar cada cliente en detalle
    for (let i = 0; i < clientes.length; i++) {
      const cliente = clientes[i];
      console.log(`\n=== CLIENTE ${i + 1} (ID: ${cliente.id_cliente}) ===`);
      console.log('Todos los campos:');
      Object.entries(cliente).forEach(([key, value]) => {
        console.log(`  ${key}: ${value !== null ? value : 'NULL'} (${typeof value})`);
      });
    }
    
    // 4. Verificar cliente específico ID 1
    console.log('\n4. Verificando cliente ID 1 específicamente...');
    const { data: cliente1, error: cliente1Error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id_cliente', 1)
      .single();
    
    if (cliente1Error) {
      console.log('Error obteniendo cliente ID 1:', cliente1Error.message);
    } else {
      console.log('Cliente ID 1 encontrado:');
      Object.entries(cliente1).forEach(([key, value]) => {
        console.log(`  ${key}: ${value !== null ? value : 'NULL'} (${typeof value})`);
      });
    }
    
    // 5. Comparar con nombres de campos esperados
    console.log('\n5. Análisis de mapeo de campos...');
    const camposEsperados = [
      'id_cliente', 'nombrecliente', 'nombrefantasia', 'id_grupo', 'razonSocial',
      'id_tipo_cliente', 'RUT', 'id_region', 'id_comuna', 'estado', 'id_tablaformato',
      'id_moneda', 'valor', 'giro', 'direccionEmpresa', 'nombreRepresentanteLegal',
      'apellidoRepresentante', 'rut_representante', 'telcelular', 'telfijo',
      'email', 'web_cliente', 'created_at', 'updated_at'
    ];
    
    if (clientes.length > 0) {
      const camposReales = Object.keys(clientes[0]);
      console.log('Campos esperados vs reales:');
      
      camposEsperados.forEach(campo => {
        const existe = camposReales.includes(campo);
        console.log(`  ${campo}: ${existe ? '✅ EXISTE' : '❌ FALTA'}`);
        if (!existe) {
          // Buscar similares
          const similares = camposReales.filter(real => 
            real.toLowerCase().includes(campo.toLowerCase()) || 
            campo.toLowerCase().includes(real.toLowerCase())
          );
          if (similares.length > 0) {
            console.log(`    → Campos similares encontrados: ${similares.join(', ')}`);
          }
        }
      });
      
      console.log('\nCampos adicionales no esperados:');
      camposReales.forEach(campo => {
        if (!camposEsperados.includes(campo)) {
          console.log(`  ${campo}: ${clientes[0][campo]} (${typeof clientes[0][campo]})`);
        }
      });
    }
    
  } catch (error) {
    console.error('Error general:', error.message);
  }
}

diagnosticarClientes();