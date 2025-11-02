const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rfjbsoxkgmuehrgteljq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmamJzb3hrZ211aHJndGVsanEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczODAwNjQzNSwiZXhwIjoyMDUzNTgyMDM1fQ.qR5sP5mYZJJJqiQYvNqF8yWJrVH1W8m7oE_5j9Q2x0Y'
);

// Datos de ejemplo para actualizar clientes
const datosClientes = [
  {
    id_cliente: 1,
    nombrefantasia: 'TechCorp Solutions',
    giro: 'Tecnología y Servicios Informáticos',
    id_grupo: 1,
    nombrerepresentantelegal: 'Juan Carlos',
    apellidorepresentante: 'Rodríguez Pérez',
    rut_representante: '12.345.678-9',
    telcelular: '+56987654321',
    telfijo: '+56223456789',
    id_region: 7,
    id_comuna: 341, // Santiago
    direccion: 'Av. Providencia 1234, Oficina 501',
    email: 'contacto@techcorp.cl',
    web_cliente: 'www.techcorp.cl'
  },
  {
    id_cliente: 2,
    nombrefantasia: 'RetailMax',
    giro: 'Comercio Minorista y Ventas al por Mayor',
    id_grupo: 2,
    nombrerepresentantelegal: 'María Alejandra',
    apellidorepresentante: 'González Muñoz',
    rut_representante: '15.678.901-2',
    telcelular: '+56998765432',
    telfijo: '+56234567890',
    id_region: 7,
    id_comuna: 322, // Santiago
    direccion: 'Ahumada 567, Piso 3',
    email: 'ventas@retailmax.cl',
    web_cliente: 'www.retailmax.cl'
  },
  {
    id_cliente: 3,
    nombrefantasia: 'ConstruyeAndo',
    giro: 'Construcción y Obras Civiles',
    id_grupo: 3,
    nombrerepresentantelegal: 'Pedro Antonio',
    apellidorepresentante: 'Silva Torres',
    rut_representante: '18.901.234-5',
    telcelular: '+56982345678',
    telfijo: '+56245678901',
    id_region: 7,
    id_comuna: 289, // Vitacura
    direccion: 'Vitacura 789, Torre A, Oficina 1203',
    email: 'info@construyeando.cl',
    web_cliente: 'www.construyeando.cl'
  },
  {
    id_cliente: 4,
    nombrefantasia: 'FoodExpress',
    giro: 'Restaurantes y Servicios de Alimentación',
    id_grupo: 1,
    nombrerepresentantelegal: 'Catalina Isabel',
    apellidorepresentante: 'Morales Fuentes',
    rut_representante: '11.234.567-8',
    telcelular: '+56971234567',
    telfijo: '+56256789012',
    id_region: 7,
    id_comuna: 261, // Las Condes
    direccion: 'Las Condes 234, Local 45',
    email: 'contacto@foodexpress.cl',
    web_cliente: 'www.foodexpress.cl'
  },
  {
    id_cliente: 5,
    nombrefantasia: 'EduLearn',
    giro: 'Educación y Capacitación',
    id_grupo: 2,
    nombrerepresentantelegal: 'Roberto Carlos',
    apellidorepresentante: 'Díaz Rojas',
    rut_representante: '20.123.456-7',
    telcelular: '+56993456789',
    telfijo: '+56267890123',
    id_region: 7,
    id_comuna: 335, // Santiago
    direccion: 'Moneda 890, Piso 15',
    email: 'info@edulearn.cl',
    web_cliente: 'www.edulearn.cl'
  }
];

async function actualizarClientes() {
  try {
    console.log('🔄 Iniciando actualización de datos de clientes...\n');

    // Primero, obtener todos los clientes existentes
    const { data: clientesExistentes, error: errorClientes } = await supabase
      .from('clientes')
      .select('id_cliente, nombrecliente, nombrefantasia, giro')
      .order('id_cliente');

    if (errorClientes) {
      console.error('❌ Error obteniendo clientes existentes:', errorClientes.message);
      return;
    }

    console.log(`📊 Se encontraron ${clientesExistentes.length} clientes en la base de datos:`);
    clientesExistentes.forEach(cliente => {
      console.log(`  - ID: ${cliente.id_cliente}, Nombre: ${cliente.nombrecliente}, Fantasía: ${cliente.nombrefantasia || 'SIN DATO'}, Giro: ${cliente.giro || 'SIN DATO'}`);
    });
    console.log('');

    // Actualizar cada cliente
    for (const datos of datosClientes) {
      console.log(`🔄 Actualizando cliente ID ${datos.id_cliente}...`);
      
      const { data, error } = await supabase
        .from('clientes')
        .update(datos)
        .eq('id_cliente', datos.id_cliente)
        .select();

      if (error) {
        console.error(`❌ Error actualizando cliente ${datos.id_cliente}:`, error.message);
      } else {
        console.log(`✅ Cliente ${datos.id_cliente} actualizado exitosamente`);
        if (data && data.length > 0) {
          const actualizado = data[0];
          console.log(`   Nombre: ${actualizado.nombrecliente}`);
          console.log(`   Fantasía: ${actualizado.nombrefantasia}`);
          console.log(`   Giro: ${actualizado.giro}`);
          console.log(`   Representante: ${actualizado.nombrerepresentantelegal} ${actualizado.apellidorepresentante}`);
          console.log(`   Teléfono: ${actualizado.telcelular}`);
          console.log(`   Región: ${actualizado.id_region}, Comuna: ${actualizado.id_comuna}`);
        }
      }
      console.log('');
    }

    // Verificar resultados finales
    console.log('🔍 Verificando resultados finales...');
    const { data: clientesFinales, error: errorFinales } = await supabase
      .from('clientes')
      .select('id_cliente, nombrecliente, nombrefantasia, giro, nombrerepresentantelegal, telcelular, id_region, id_comuna')
      .order('id_cliente');

    if (errorFinales) {
      console.error('❌ Error obteniendo resultados finales:', errorFinales.message);
    } else {
      console.log('\n📋 Estado final de los clientes:');
      clientesFinales.forEach(cliente => {
        const tieneDatos = cliente.nombrefantasia && cliente.giro && cliente.nombrerepresentantelegal && cliente.telcelular;
        console.log(`  ${tieneDatos ? '✅' : '⚠️'} ID: ${cliente.id_cliente} | ${cliente.nombrecliente} | Fantasía: ${cliente.nombrefantasia || 'SIN DATO'} | Giro: ${cliente.giro || 'SIN DATO'} | Tel: ${cliente.telcelular || 'SIN DATO'}`);
      });
    }

    console.log('\n🎉 Proceso de actualización completado');

  } catch (error) {
    console.error('❌ Error general en el proceso:', error.message);
  }
}

// Ejecutar la función
actualizarClientes();