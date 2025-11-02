import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rfjbsoxkgmuehrgteljq.supabase.co',
  'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C'
)

async function checkClientesIds() {
  console.log('🔍 Verificando IDs de clientes insertados...')

  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('id_cliente, nombrecliente, rut')
      .order('id_cliente')

    if (error) {
      console.error('❌ Error consultando clientes:', error)
      return
    }

    console.log('📋 Clientes encontrados:')
    data.forEach((cliente, index) => {
      console.log(`${index + 1}. ID: ${cliente.id_cliente} - ${cliente.nombrecliente} (${cliente.rut})`)
    })

    console.log(`\n🎯 Total de clientes: ${data.length}`)
    console.log(`📍 Para ver el primer cliente, usa la URL: http://localhost:3000/clientes/view/${data[0]?.id_cliente || '1'}`)

  } catch (error) {
    console.error('❌ Error en la verificación:', error)
  }
}

// Ejecutar verificación
checkClientesIds().then(() => {
  console.log('🎉 Verificación completada')
  process.exit(0)
}).catch((error) => {
  console.error('💥 Error fatal:', error)
  process.exit(1)
})