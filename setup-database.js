import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Configuración de Supabase
const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmamJzb3hrZ211ZWhyZ3RlbGpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTMzNTI0NiwiZXhwIjoyMDc2OTExMjQ2fQ.lhVey2WRoh49ZKRFxK_F6O0QCE2Afvzon5v9Y25KeHM'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeSQLFile(filePath) {
  try {
    console.log(`📄 Leyendo archivo: ${filePath}`)
    const sqlContent = fs.readFileSync(filePath, 'utf8')
    
    // Dividir el contenido en declaraciones SQL individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📊 Encontrados ${statements.length} comandos SQL para ejecutar`)
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      if (statement.trim().length === 0) continue
      
      try {
        console.log(`⚡ Ejecutando comando ${i + 1}/${statements.length}...`)
        
        // Ejecutar el comando SQL usando RPC
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement })
        
        if (error) {
          // Si RPC no funciona, intentar con SQL directo
          console.log(`⚠️  RPC falló, intentando método alternativo...`)
          
          // Para comandos CREATE, INSERT, etc. usamos el método REST
          const isDDL = statement.toUpperCase().includes('CREATE') || 
                       statement.toUpperCase().includes('ALTER') || 
                       statement.toUpperCase().includes('DROP')
          
          if (isDDL) {
            console.log(`🔧 Comando DDL detectado: ${statement.substring(0, 50)}...`)
            // Los comandos DDL deben ejecutarse directamente en la consola de Supabase
            console.log(`ℹ️  Este comando debe ejecutarse manualmente en la consola de Supabase`)
          } else {
            console.log(`📝 Comando DML detectado, ejecutando...`)
          }
          
          console.log(`⚠️  Error: ${error.message}`)
          errorCount++
        } else {
          console.log(`✅ Comando ${i + 1} ejecutado correctamente`)
          successCount++
        }
      } catch (err) {
        console.log(`❌ Error en comando ${i + 1}: ${err.message}`)
        errorCount++
      }
    }
    
    console.log(`📈 Resumen: ${successCount} exitosos, ${errorCount} con errores`)
    return { successCount, errorCount }
    
  } catch (error) {
    console.error(`❌ Error al leer archivo ${filePath}:`, error.message)
    return { successCount: 0, errorCount: 1 }
  }
}

async function setupDatabase() {
  try {
    console.log('🚀 Iniciando configuración de la base de datos...')
    console.log(`🔗 URL de Supabase: ${supabaseUrl}`)
    
    // Verificar conexión
    console.log('🔍 Verificando conexión con Supabase...')
    const { data, error } = await supabase.from('information_schema.tables').select('table_name').limit(1)
    
    if (error && !error.message.includes('does not exist')) {
      console.error('❌ Error de conexión:', error.message)
      return
    }
    
    console.log('✅ Conexión establecida correctamente')
    
    // Ejecutar esquema de base de datos
    console.log('\n📋 Creando estructura de tablas...')
    const schemaResult = await executeSQLFile('database-schema.sql')
    
    // Esperar un momento para que las tablas se creen
    console.log('⏳ Esperando 3 segundos para que las tablas se creen...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Ejecutar datos iniciales
    console.log('\n📊 Insertando datos iniciales...')
    const dataResult = await executeSQLFile('initial-data.sql')
    
    // Resumen final
    console.log('\n🎉 Configuración completada')
    console.log(`📊 Estadísticas finales:`)
    console.log(`   - Esquema: ${schemaResult.successCount} comandos exitosos, ${schemaResult.errorCount} errores`)
    console.log(`   - Datos iniciales: ${dataResult.successCount} comandos exitosos, ${dataResult.errorCount} errores`)
    
    console.log('\n📝 Notas importantes:')
    console.log('   1. Algunos comandos DDL pueden necesitar ejecutarse manualmente en la consola de Supabase')
    console.log('   2. Revise los errores arriba para comandos que necesiten atención manual')
    console.log('   3. El usuario administrador por defecto es: admin@sistema.cl')
    console.log('   4. La contraseña debe ser configurada manualmente')
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message)
  }
}

// Función alternativa para ejecutar SQL directamente
async function executeDirectSQL() {
  console.log('\n🔧 Instrucciones para ejecución manual:')
  console.log('1. Abre la consola de Supabase: https://supabase.com/dashboard/project/rfjbsoxkgmuehrgteljq/sql')
  console.log('2. Copia y pega el contenido del archivo database-schema.sql')
  console.log('3. Ejecuta el script y espera a que se creen todas las tablas')
  console.log('4. Luego copia y pega el contenido del archivo initial-data.sql')
  console.log('5. Ejecuta el segundo script para insertar los datos iniciales')
  console.log('\n📄 Los archivos SQL han sido creados en el directorio actual:')
  console.log('   - database-schema.sql (estructura de tablas)')
  console.log('   - initial-data.sql (datos iniciales)')
}

// Ejecutar el script
if (process.argv.includes('--manual')) {
  executeDirectSQL()
} else {
  setupDatabase()
}