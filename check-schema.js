import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rfjbsoxkgmuehrgteljq.supabase.co',
  'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C'
)

async function checkSchema() {
  console.log('🔍 Verificando esquema de la tabla clientes...')

  try {
    // Intentar obtener un registro para ver las columnas disponibles
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Error consultando tabla:', error)
      return
    }

    if (data && data.length > 0) {
      console.log('📋 Columnas disponibles en la tabla clientes:')
      Object.keys(data[0]).forEach(col => {
        console.log(`  - ${col}: ${typeof data[0][col]}`)
      })
    } else {
      console.log('📋 La tabla está vacía, pero las columnas disponibles son:')
      // Intentar insertar un registro vacío para ver qué columnas acepta
      const { error: insertError } = await supabase
        .from('clientes')
        .insert({})

      if (insertError) {
        console.log('Columnas requeridas o disponibles:', insertError.message)
      }
    }

  } catch (error) {
    console.error('❌ Error en la verificación:', error)
  }
}

// Ejecutar verificación
checkSchema().then(() => {
  console.log('🎉 Verificación completada')
  process.exit(0)
}).catch((error) => {
  console.error('💥 Error fatal:', error)
  process.exit(1)
})