const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmamJzb3hrZ211ZWhyZ3RlbGpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzUyNDYsImV4cCI6MjA3NjkxMTI0Nn0.fOnd4nQJhBI2rQkiqqeF08t5mpO1vIbN5YBsCOo-Hbo';

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🚀 VERIFICACIÓN DE TABLAS - SISTEMA DE ÓRDENES')
console.log('🌐 Base de datos:', supabaseUrl)
console.log('📅 Fecha y hora:', new Date().toLocaleString())
console.log('')

// Lista de tablas principales a verificar
const mainTables = [
    { name: 'Region', description: 'Regiones de Chile' },
    { name: 'Comunas', description: 'Comunas por región' },
    { name: 'TipoCliente', description: 'Tipos de cliente' },
    { name: 'Grupos', description: 'Grupos de usuarios' },
    { name: 'Perfiles', description: 'Perfiles de usuario' },
    { name: 'Medios', description: 'Medios publicitarios' },
    { name: 'Usuarios', description: 'Usuarios del sistema' },
    { name: 'Clientes', description: 'Clientes de la agencia' },
    { name: 'Proveedores', description: 'Proveedores de medios' },
    { name: 'Agencias', description: 'Agencias de publicidad' },
    { name: 'Campania', description: 'Campañas publicitarias' },
    { name: 'OrdenesDePublicidad', description: 'Órdenes de publicidad' },
    { name: 'alternativa', description: 'Alternativas de medios' },
    { name: 'plan', description: 'Planes de medios' }
]

async function verifyTables() {
    let successCount = 0
    let errorCount = 0
    const results = []

    console.log('🔍 Verificando tablas principales...')
    console.log('')

    for (const table of mainTables) {
        try {
            console.log(`📋 Verificando tabla: ${table.name} (${table.description})`)
            
            // Intentar consultar la tabla
            const { data, error, count } = await supabase
                .from(table.name)
                .select('*', { count: 'exact', head: true })

            if (error) {
                if (error.code === 'PGRST116') {
                    console.log(`❌ La tabla '${table.name}' NO existe`)
                    results.push({ table: table.name, status: 'NO EXISTE', rows: 0 })
                    errorCount++
                } else {
                    console.log(`⚠️  Error en tabla '${table.name}': ${error.message}`)
                    results.push({ table: table.name, status: 'ERROR', rows: 0, error: error.message })
                    errorCount++
                }
            } else {
                console.log(`✅ Tabla '${table.name}' existe - Registros: ${count || 0}`)
                results.push({ table: table.name, status: 'EXISTS', rows: count || 0 })
                successCount++
            }
        } catch (err) {
            console.log(`❌ Error crítico en tabla '${table.name}': ${err.message}`)
            results.push({ table: table.name, status: 'CRITICAL_ERROR', rows: 0, error: err.message })
            errorCount++
        }
        console.log('')
    }

    // Resumen final
    console.log('📊 RESUMEN DE VERIFICACIÓN')
    console.log('=====================================')
    console.log(`✅ Tablas verificadas exitosamente: ${successCount}`)
    console.log(`❌ Tablas con errores: ${errorCount}`)
    console.log(`📋 Total de tablas verificadas: ${mainTables.length}`)
    console.log('')

    // Detalles de resultados
    console.log('📋 DETALLE DE RESULTADOS')
    console.log('=====================================')
    results.forEach(result => {
        const status = result.status === 'EXISTS' ? '✅' : '❌'
        const rows = result.rows > 0 ? ` (${result.rows} registros)` : ' (vacía)'
        const error = result.error ? ` - ${result.error}` : ''
        console.log(`${status} ${result.table}${rows}${error}`)
    })

    console.log('')

    // Verificación de datos iniciales
    if (successCount > 0) {
        console.log('🔍 Verificando datos iniciales...')
        
        // Verificar tabla Region
        try {
            const { data: regionData, error: regionError } = await supabase
                .from('Region')
                .select('count')
                .limit(1)

            if (!regionError && regionData) {
                console.log('✅ Datos de regiones parecen estar presentes')
            }
        } catch (err) {
            console.log('⚠️  No se pudo verificar datos de regiones')
        }

        // Verificar tabla Usuarios
        try {
            const { data: userData, error: userError } = await supabase
                .from('Usuarios')
                .select('count')
                .limit(1)

            if (!userError && userData) {
                console.log('✅ Datos de usuarios parecen estar presentes')
            }
        } catch (err) {
            console.log('⚠️  No se pudo verificar datos de usuarios')
        }
    }

    console.log('')
    console.log('🎯 CONCLUSIÓN')
    console.log('=====================================')
    
    if (successCount === mainTables.length) {
        console.log('🎉 ¡TODAS LAS TABLAS PRINCIPALES EXISTEN!')
        console.log('✅ Base de datos completamente configurada')
        console.log('🚀 Sistema listo para funcionar')
        console.log('')
        console.log('📝 Siguientes pasos:')
        console.log('1. Iniciar sesión en la aplicación')
        console.log('2. Probar funcionalidades básicas')
        console.log('3. Crear datos de prueba si es necesario')
    } else if (successCount > 0) {
        console.log('⚠️  ALGUNAS TABLAS EXISTEN, PERO FALTAN OTRAS')
        console.log(`📊 ${successCount}/${mainTables.length} tablas presentes`)
        console.log('🔧 Revisa la ejecución de los scripts SQL')
    } else {
        console.log('❌ NINGUNA TABLA PRINCIPAL EXISTE')
        console.log('🔧 Debes ejecutar los scripts SQL manualmente')
        console.log('📋 Sigue la guía en GUIA-INSTALACION-VISUAL.md')
    }

    return { successCount, errorCount, total: mainTables.length, results }
}

// Ejecutar verificación
verifyTables()
    .then(result => {
        console.log('')
        console.log('✅ Verificación completada')
        process.exit(result.errorCount === 0 ? 0 : 1)
    })
    .catch(error => {
        console.error('❌ Error durante la verificación:', error.message)
        process.exit(1)
    })