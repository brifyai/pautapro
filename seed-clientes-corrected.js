import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rfjbsoxkgmuehrgteljq.supabase.co',
  'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C'
)

async function seedClientes() {
  console.log('🌱 Iniciando seeding de clientes con esquema correcto...')

  const clientes = [
    {
      nombrecliente: 'Andes Media Group',
      rut: '76.123.456-7',
      razonsocial: 'Andes Media Group SpA',
      direccion: 'Av. Providencia 1208, Santiago',
      telefono: '+56 2 2754 3210',
      email: 'contacto@andesmedia.cl',
      estado: true
    },
    {
      nombrecliente: 'Pacífico Retail Partners',
      rut: '76.234.567-8',
      razonsocial: 'Pacífico Retail Partners Ltda.',
      direccion: 'Av. Apoquindo 4501, Las Condes',
      telefono: '+56 2 2587 1144',
      email: 'marketing@pacificoretail.cl',
      estado: true
    },
    {
      nombrecliente: 'BioSur Laboratorios',
      rut: '76.345.678-9',
      razonsocial: 'Laboratorios BioSur S.A.',
      direccion: 'Camino La Pirámide 5670, Huechuraba',
      telefono: '+56 2 2378 2200',
      email: 'comercial@biosur.cl',
      estado: true
    },
    {
      nombrecliente: 'Altamar Cruceros',
      rut: '76.456.789-0',
      razonsocial: 'Altamar Cruceros S.A.',
      direccion: 'Av. Alonso de Córdova 5870, Las Condes',
      telefono: '+56 2 2487 9900',
      email: 'ventas@altamarcruises.com',
      estado: true
    },
    {
      nombrecliente: 'Cordillera Foods',
      rut: '76.567.890-1',
      razonsocial: 'Cordillera Foods S.A.',
      direccion: 'Ruta 5 Sur Km 52, Paine',
      telefono: '+56 2 2578 4400',
      email: 'marketing@cordillerafoods.cl',
      estado: true
    },
    {
      nombrecliente: 'LuzNorte Energía',
      rut: '76.678.901-2',
      razonsocial: 'LuzNorte Energía Renovable Ltda.',
      direccion: 'Av. Andrés Bello 2299, Providencia',
      telefono: '+56 2 2734 5566',
      email: 'contacto@luznorte.cl',
      estado: true
    },
    {
      nombrecliente: 'Marítima del Pacífico',
      rut: '76.789.012-3',
      razonsocial: 'Compañía Marítima del Pacífico S.A.',
      direccion: 'Av. Errázuriz 1450, Valparaíso',
      telefono: '+56 32 223 8899',
      email: 'logistica@marpac.cl',
      estado: true
    },
    {
      nombrecliente: 'Finanzas Andina',
      rut: '76.890.123-4',
      razonsocial: 'Finanzas Andina S.A.',
      direccion: 'Av. El Golf 150, Las Condes',
      telefono: '+56 2 2604 7788',
      email: 'contacto@andinafinance.cl',
      estado: true
    },
    {
      nombrecliente: 'InnovaTech Solutions',
      rut: '76.901.234-5',
      razonsocial: 'InnovaTech Solutions SpA',
      direccion: 'Av. Italia 1449, Ñuñoa',
      telefono: '+56 2 2401 5566',
      email: 'info@innovatech.cl',
      estado: true
    },
    {
      nombrecliente: 'Patagonia Outdoor Retail',
      rut: '76.912.345-6',
      razonsocial: 'Patagonia Outdoor Retail Ltda.',
      direccion: 'Av. Los Militares 5001, Las Condes',
      telefono: '+56 2 2798 4455',
      email: 'ventas@patagoniaoutdoor.cl',
      estado: true
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
      console.log(`${index + 1}. ${cliente.nombrecliente} (${cliente.rut})`)
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