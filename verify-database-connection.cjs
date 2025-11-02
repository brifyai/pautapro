const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmamJzb3hrZ211ZWhyZ3RlbGpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzUyNDYsImV4cCI6MjA3NjkxMTI0Nn0.fOnd4nQJhBI2rQkiqqeF08t5mpO1vIbN5YBsCOo-Hbo'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Lista de todas las tablas que deberían existir según el análisis del código
const expectedTables = [
  'Region',
  'Comunas', 
  'TipoCliente',
  'Grupos',
  'Perfiles',
  'Medios',
  'Calidad',
  'FormaDePago',
  'TipoGeneracionDeOrden',
  'Anios',
  'Meses',
  'TablaFormato',
  'Usuarios',
  'Agencias',
  'Clientes',
  'Proveedores',
  'Soportes',
  'proveedor_soporte',
  'soporte_medios',
  'Productos',
  'Contratos',
  'Programas',
  'programa_medios',
  'Clasificacion',
  'Campania',
  'Temas',
  'campania_temas',
  'plan',
  'campana_planes',
  'alternativa',
  'plan_alternativas',
  'OrdenesDePublicidad',
  'Facturas',
  'Comisiones',
  'contactocliente',
  'contactos',
  'OtrosDatos',
  'aviso'
]

// Campos críticos que deben existir en cada tabla
const criticalFields = {
  'Usuarios': ['id_usuario', 'nombre', 'email', 'password', 'id_perfil', 'id_grupo'],
  'Clientes': ['id_cliente', 'nombreCliente', 'RUT', 'id_region', 'id_tipo_cliente', 'id_grupo'],
  'Proveedores': ['id_proveedor', 'nombreProveedor', 'RUT', 'id_region', 'id_comuna'],
  'Agencias': ['id', 'NombreIdentificador', 'NombreDeFantasia', 'RUT', 'id_region', 'id_comuna'],
  'Campania': ['id_campania', 'NombreCampania', 'id_Cliente', 'id_Agencia', 'id_anio', 'Presupuesto'],
  'OrdenesDePublicidad': ['id_ordenes_de_comprar', 'numero_correlativo', 'id_cliente', 'id_campania', 'id_plan'],
  'alternativa': ['id', 'id_alternativa', 'id_soporte', 'id_programa', 'numerorden'],
  'Medios': ['id', 'NombredelMedio', 'Estado'],
  'Soportes': ['id_soporte', 'nombreIdentficiador', 'estado', 'c_orden'],
  'Programas': ['id', 'id_soporte', 'soporte_id', 'nombre_programa', 'cod_prog_megatime'],
  'Temas': ['id_tema', 'nombre_tema', 'id_medio', 'id_calidad'],
  'Clasificacion': ['id', 'id_medio', 'IdMedios', 'nombre_clasificacion'],
  'Facturas': ['id', 'id_campania', 'IdCampania', 'numero_factura'],
  'Region': ['id', 'nombreRegion'],
  'Comunas': ['id', 'nombreComuna', 'id_region'],
  'Contratos': ['id', 'IdMedios', 'id_proveedor', 'id_cliente', 'numero_contrato']
}

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    if (error) {
      if (error.code === 'PGRST116') {
        return { exists: false, error: `Tabla ${tableName} no existe` }
      }
      return { exists: false, error: error.message }
    }
    
    return { exists: true, sampleData: data }
  } catch (err) {
    return { exists: false, error: err.message }
  }
}

async function checkTableColumns(tableName) {
  try {
    // Intentar obtener información de columnas usando una consulta que falle si no existen las columnas
    const criticalFieldsForTable = criticalFields[tableName] || []
    
    if (criticalFieldsForTable.length === 0) {
      return { exists: true, message: 'No hay campos críticos definidos para esta tabla' }
    }
    
    // Construir una consulta SELECT con todos los campos críticos
    const selectFields = criticalFieldsForTable.join(', ')
    
    const { data, error } = await supabase
      .from(tableName)
      .select(selectFields)
      .limit(1)
    
    if (error) {
      return { 
        exists: false, 
        error: `Error verificando campos en ${tableName}: ${error.message}`,
        missingFields: criticalFieldsForTable
      }
    }
    
    // Verificar qué campos faltan en la respuesta
    const returnedFields = Object.keys(data[0] || {})
    const missingFields = criticalFieldsForTable.filter(field => !returnedFields.includes(field))
    
    return { 
      exists: true, 
      returnedFields,
      missingFields,
      allFieldsPresent: missingFields.length === 0
    }
  } catch (err) {
    return { exists: false, error: err.message }
  }
}

async function verifyDatabaseConnection() {
  console.log('🔍 Verificando conexión con la base de datos Supabase...')
  console.log(`🔗 URL: ${supabaseUrl}`)
  
  // Verificar conexión básica
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(1)
    
    if (error && !error.message.includes('does not exist')) {
      console.log('❌ Error de conexión básica:', error.message)
      return false
    }
    
    console.log('✅ Conexión básica establecida')
  } catch (err) {
    console.log('❌ Error al verificar conexión:', err.message)
    return false
  }
  
  return true
}

async function verifyAllTables() {
  console.log('\n📊 Verificando todas las tablas del sistema...')
  
  const results = {
    totalTables: expectedTables.length,
    existingTables: [],
    missingTables: [],
    tableDetails: {}
  }
  
  for (const tableName of expectedTables) {
    console.log(`\n🔍 Verificando tabla: ${tableName}`)
    
    // Verificar si la tabla existe
    const tableCheck = await checkTableExists(tableName)
    
    if (!tableCheck.exists) {
      console.log(`❌ Tabla ${tableName} no existe: ${tableCheck.error}`)
      results.missingTables.push(tableName)
      results.tableDetails[tableName] = { exists: false, error: tableCheck.error }
      continue
    }
    
    console.log(`✅ Tabla ${tableName} existe`)
    results.existingTables.push(tableName)
    
    // Verificar campos críticos
    const columnCheck = await checkTableColumns(tableName)
    
    if (columnCheck.exists) {
      if (columnCheck.allFieldsPresent) {
        console.log(`✅ Todos los campos críticos presentes en ${tableName}`)
        results.tableDetails[tableName] = { 
          exists: true, 
          fields: 'OK',
          returnedFields: columnCheck.returnedFields
        }
      } else {
        console.log(`⚠️  Tabla ${tableName} existe pero faltan campos: ${columnCheck.missingFields.join(', ')}`)
        results.tableDetails[tableName] = { 
          exists: true, 
          fields: 'INCOMPLETE',
          missingFields: columnCheck.missingFields,
          returnedFields: columnCheck.returnedFields
        }
      }
    } else {
      console.log(`❌ Error verificando campos en ${tableName}: ${columnCheck.error}`)
      results.tableDetails[tableName] = { 
        exists: true, 
        fields: 'ERROR',
        error: columnCheck.error
      }
    }
  }
  
  return results
}

async function checkDataPresence() {
  console.log('\n📋 Verificando presencia de datos iniciales...')
  
  const criticalTables = ['Usuarios', 'Clientes', 'Proveedores', 'Medios', 'Region']
  const dataResults = {}
  
  for (const tableName of criticalTables) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ Error verificando datos en ${tableName}: ${error.message}`)
        dataResults[tableName] = { error: error.message, count: 0 }
      } else {
        console.log(`✅ Tabla ${tableName}: ${count} registros encontrados`)
        dataResults[tableName] = { count, hasData: count > 0 }
      }
    } catch (err) {
      console.log(`❌ Error verificando ${tableName}: ${err.message}`)
      dataResults[tableName] = { error: err.message, count: 0 }
    }
  }
  
  return dataResults
}

async function generateReport(results, dataResults) {
  console.log('\n📄 GENERANDO REPORTE COMPLETO')
  console.log('=' .repeat(60))
  
  // Resumen general
  console.log(`\n📊 RESUMEN GENERAL:`)
  console.log(`   Total de tablas esperadas: ${results.totalTables}`)
  console.log(`   Tablas existentes: ${results.existingTables.length}`)
  console.log(`   Tablas faltantes: ${results.missingTables.length}`)
  console.log(`   Porcentaje completado: ${Math.round((results.existingTables.length / results.totalTables) * 100)}%`)
  
  // Tablas faltantes
  if (results.missingTables.length > 0) {
    console.log(`\n❌ TABLAS FALTANTES:`)
    results.missingTables.forEach(table => {
      console.log(`   - ${table}: ${results.tableDetails[table].error}`)
    })
  }
  
  // Problemas de campos
  const tablesWithFieldIssues = Object.entries(results.tableDetails)
    .filter(([_, details]) => details.exists && details.fields !== 'OK')
  
  if (tablesWithFieldIssues.length > 0) {
    console.log(`\n⚠️  PROBLEMAS DE CAMPOS:`)
    tablesWithFieldIssues.forEach(([tableName, details]) => {
      console.log(`   - ${tableName}:`)
      if (details.missingFields) {
        console.log(`     Campos faltantes: ${details.missingFields.join(', ')}`)
      }
      if (details.error) {
        console.log(`     Error: ${details.error}`)
      }
    })
  }
  
  // Datos iniciales
  console.log(`\n📋 DATOS INICIALES:`)
  Object.entries(dataResults).forEach(([tableName, info]) => {
    if (info.error) {
      console.log(`   ❌ ${tableName}: Error - ${info.error}`)
    } else {
      const status = info.hasData ? '✅' : '⚠️ '
      console.log(`   ${status} ${tableName}: ${info.count} registros`)
    }
  })
  
  // Usuario administrador
  if (dataResults.Usuarios && dataResults.Usuarios.hasData) {
    try {
      const { data: adminUser } = await supabase
        .from('Usuarios')
        .select('email, nombre')
        .eq('email', 'admin@sistema.cl')
        .single()
      
      if (adminUser) {
        console.log(`\n🔑 USUARIO ADMINISTRADOR:`)
        console.log(`   ✅ Email: ${adminUser.email}`)
        console.log(`   ✅ Nombre: ${adminUser.nombre}`)
      } else {
        console.log(`\n🔑 USUARIO ADMINISTRADOR:`)
        console.log(`   ❌ No se encontró el usuario admin@sistema.cl`)
      }
    } catch (err) {
      console.log(`\n🔑 USUARIO ADMINISTRADOR:`)
      console.log(`   ❌ Error verificando usuario: ${err.message}`)
    }
  }
  
  // Conclusión
  console.log(`\n🎯 CONCLUSIÓN:`)
  const successRate = Math.round((results.existingTables.length / results.totalTables) * 100)
  
  if (successRate === 100) {
    console.log(`   ✅ Todas las tablas existen (${successRate}%)`)
    const fieldIssuesCount = tablesWithFieldIssues.length
    if (fieldIssuesCount === 0) {
      console.log(`   ✅ Todos los campos críticos están presentes`)
      console.log(`   🎉 La base de datos está completamente configurada`)
    } else {
      console.log(`   ⚠️  ${fieldIssuesCount} tablas tienen problemas de campos`)
    }
  } else {
    console.log(`   ⚠️  Faltan ${results.missingTables.length} tablas (${successRate}%)`)
    console.log(`   🔧 Se necesita completar la configuración de la base de datos`)
  }
  
  console.log('\n' + '=' .repeat(60))
  
  return {
    success: successRate === 100 && tablesWithFieldIssues.length === 0,
    successRate,
    missingTables: results.missingTables,
    fieldIssues: tablesWithFieldIssues,
    dataResults
  }
}

async function main() {
  console.log('🚀 INICIANDO VERIFICACIÓN COMPLETA DE BASE DE DATOS')
  console.log('🌐 Base de datos:', supabaseUrl)
  console.log('📅 Fecha y hora:', new Date().toLocaleString())
  
  // Paso 1: Verificar conexión
  const connectionOk = await verifyDatabaseConnection()
  if (!connectionOk) {
    console.log('\n❌ No se pudo establecer conexión con la base de datos')
    return
  }
  
  // Paso 2: Verificar todas las tablas
  const tableResults = await verifyAllTables()
  
  // Paso 3: Verificar datos iniciales
  const dataResults = await checkDataPresence()
  
  // Paso 4: Generar reporte
  const finalReport = await generateReport(tableResults, dataResults)
  
  // Retornar resultado para posible uso programático
  return finalReport
}

// Ejecutar verificación
if (require.main === module) {
  main()
    .then((result) => {
      console.log('\n✅ Verificación completada')
      process.exit(result.success ? 0 : 1)
    })
    .catch((error) => {
      console.error('\n❌ Error durante la verificación:', error)
      process.exit(1)
    })
}

module.exports = { verifyDatabase: main }