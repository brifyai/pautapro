import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rfjbsoxkgmuehrgteljq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmamJzb3hrZ211ZWhyZ3RlbGpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAwMDI4NDUsImV4cCI6MjA0NTU3ODg0NX0.8Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C'
)

async function seedClientes() {
  console.log('🌱 Iniciando seeding de clientes...')

  const clientes = [
    {
      nombreCliente: 'Andes Media Group',
      nombreFantasia: 'Andes Media',
      razonSocial: 'Andes Media Group SpA',
      RUT: '76.123.456-7',
      direccionEmpresa: 'Av. Providencia 1208, Santiago',
      giro: 'Servicios publicitarios',
      estado: true,
      email: 'contacto@andesmedia.cl',
      telFijo: '+56 2 2754 3210',
      telCelular: '+56 9 8123 4567',
      web_cliente: 'https://www.andesmedia.cl'
    },
    {
      nombreCliente: 'Pacífico Retail Partners',
      nombreFantasia: 'Pacífico Retail',
      razonSocial: 'Pacífico Retail Partners Ltda.',
      RUT: '76.234.567-8',
      direccionEmpresa: 'Av. Apoquindo 4501, Las Condes',
      giro: 'Comercio minorista',
      estado: true,
      email: 'marketing@pacificoretail.cl',
      telFijo: '+56 2 2587 1144',
      telCelular: '+56 9 9345 6789',
      web_cliente: 'https://www.pacificoretail.cl'
    },
    {
      nombreCliente: 'BioSur Laboratorios',
      nombreFantasia: 'BioSur',
      razonSocial: 'Laboratorios BioSur S.A.',
      RUT: '76.345.678-9',
      direccionEmpresa: 'Camino La Pirámide 5670, Huechuraba',
      giro: 'Industria farmacéutica',
      estado: true,
      email: 'comercial@biosur.cl',
      telFijo: '+56 2 2378 2200',
      telCelular: '+56 9 7765 4321',
      web_cliente: 'https://www.biosur.cl'
    },
    {
      nombreCliente: 'Altamar Cruceros',
      nombreFantasia: 'Altamar Cruises',
      razonSocial: 'Altamar Cruceros S.A.',
      RUT: '76.456.789-0',
      direccionEmpresa: 'Av. Alonso de Córdova 5870, Las Condes',
      giro: 'Turismo y viajes',
      estado: true,
      email: 'ventas@altamarcruises.com',
      telFijo: '+56 2 2487 9900',
      telCelular: '+56 9 9001 2233',
      web_cliente: 'https://www.altamarcruises.com'
    },
    {
      nombreCliente: 'Cordillera Foods',
      nombreFantasia: 'Cordillera Foods',
      razonSocial: 'Cordillera Foods S.A.',
      RUT: '76.567.890-1',
      direccionEmpresa: 'Ruta 5 Sur Km 52, Paine',
      giro: 'Industria alimentaria',
      estado: true,
      email: 'marketing@cordillerafoods.cl',
      telFijo: '+56 2 2578 4400',
      telCelular: '+56 9 8210 3344',
      web_cliente: 'https://www.cordillerafoods.cl'
    },
    {
      nombreCliente: 'LuzNorte Energía',
      nombreFantasia: 'LuzNorte',
      razonSocial: 'LuzNorte Energía Renovable Ltda.',
      RUT: '76.678.901-2',
      direccionEmpresa: 'Av. Andrés Bello 2299, Providencia',
      giro: 'Energía renovable',
      estado: true,
      email: 'contacto@luznorte.cl',
      telFijo: '+56 2 2734 5566',
      telCelular: '+56 9 7654 9876',
      web_cliente: 'https://www.luznorte.cl'
    },
    {
      nombreCliente: 'Marítima del Pacífico',
      nombreFantasia: 'MarPac',
      razonSocial: 'Compañía Marítima del Pacífico S.A.',
      RUT: '76.789.012-3',
      direccionEmpresa: 'Av. Errázuriz 1450, Valparaíso',
      giro: 'Logística portuaria',
      estado: true,
      email: 'logistica@marpac.cl',
      telFijo: '+56 32 223 8899',
      telCelular: '+56 9 9123 6543',
      web_cliente: 'https://www.marpac.cl'
    },
    {
      nombreCliente: 'Finanzas Andina',
      nombreFantasia: 'Andina Finance',
      razonSocial: 'Finanzas Andina S.A.',
      RUT: '76.890.123-4',
      direccionEmpresa: 'Av. El Golf 150, Las Condes',
      giro: 'Servicios financieros',
      estado: true,
      email: 'contacto@andinafinance.cl',
      telFijo: '+56 2 2604 7788',
      telCelular: '+56 9 8456 7890',
      web_cliente: 'https://www.andinafinance.cl'
    },
    {
      nombreCliente: 'InnovaTech Solutions',
      nombreFantasia: 'InnovaTech',
      razonSocial: 'InnovaTech Solutions SpA',
      RUT: '76.901.234-5',
      direccionEmpresa: 'Av. Italia 1449, Ñuñoa',
      giro: 'Tecnología e innovación',
      estado: true,
      email: 'info@innovatech.cl',
      telFijo: '+56 2 2401 5566',
      telCelular: '+56 9 9988 7766',
      web_cliente: 'https://www.innovatech.cl'
    },
    {
      nombreCliente: 'Patagonia Outdoor Retail',
      nombreFantasia: 'Patagonia Outdoor',
      razonSocial: 'Patagonia Outdoor Retail Ltda.',
      RUT: '76.912.345-6',
      direccionEmpresa: 'Av. Los Militares 5001, Las Condes',
      giro: 'Comercio de artículos deportivos',
      estado: true,
      email: 'ventas@patagoniaoutdoor.cl',
      telFijo: '+56 2 2798 4455',
      telCelular: '+56 9 9555 4477',
      web_cliente: 'https://www.patagoniaoutdoor.cl'
    }
  ]

  try {
    const { data, error } = await supabase
      .from('clientes')
      .insert(clientes)
      .select()

    if (error) {
      console.error('❌ Error insertando clientes:', error)
      return
    }

    console.log('✅ Clientes insertados exitosamente:', data.length)
    console.log('📋 Clientes creados:')
    data.forEach((cliente, index) => {
      console.log(`${index + 1}. ${cliente.nombreCliente} (${cliente.RUT})`)
    })

  } catch (error) {
    console.error('❌ Error en el seeding:', error)
  }
}

// Ejecutar seeding
seedClientes().then(() => {
  console.log('🎉 Seeding completado')
  process.exit(0)
}).catch((error) => {
  console.error('💥 Error fatal:', error)
  process.exit(1)
})