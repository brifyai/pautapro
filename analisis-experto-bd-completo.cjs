const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🗄️  ANÁLISIS EXPERTO DE BASE DE DATOS - SUPABASE');
console.log('==============================================\n');

async function analizarBaseDeDatosCompleta() {
  try {
    console.log('📊 ANALIZANDO ESTRUCTURA COMPLETA DE LA BASE DE DATOS...\n');

    // 1. Obtener todas las tablas
    console.log('1️⃣ OBTENIENDO LISTADO COMPLETO DE TABLAS:');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');

    if (tablesError) {
      console.log('   ⚠️  No se puede acceder a information_schema, usando método alternativo...');
      
      // Método alternativo: probar tablas conocidas
      const knownTables = [
        'clientes', 'medios', 'campania', 'ordenesdepublicidad', 'proveedores',
        'agencias', 'contratos', 'productos', 'soportes', 'alternativas',
        'planes', 'temas', 'mensajes', 'usuarios', 'perfiles'
      ];
      
      console.log('   🔍 Verificando tablas conocidas:');
      const existingTables = [];
      
      for (const table of knownTables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          if (!error) {
            existingTables.push(table);
            console.log(`      ✅ ${table}`);
          } else {
            console.log(`      ❌ ${table}: ${error.message}`);
          }
        } catch (e) {
          console.log(`      ❌ ${table}: No existe o sin acceso`);
        }
      }
      
      await analizarTablasExistente(existingTables);
      
    } else {
      const tableNames = tables.map(t => t.table_name);
      console.log('   📋 Tablas encontradas:', tableNames);
      await analizarTablasExistente(tableNames);
    }

  } catch (error) {
    console.error('❌ Error en análisis:', error.message);
  }
}

async function analizarTablasExistente(tables) {
  console.log('\n2️⃣ ANÁLISIS DETALLADO DE TABLAS EXISTENTES:');
  
  const tableAnalysis = {};
  
  for (const tableName of tables) {
    console.log(`\n   📊 Analizando tabla: ${tableName}`);
    
    try {
      // Obtener estructura de la tabla
      const { data: sampleData, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`      ❌ Error: ${error.message}`);
        continue;
      }

      if (sampleData && sampleData.length > 0) {
        const columns = Object.keys(sampleData[0]);
        const sample = sampleData[0];
        
        // Contar registros
        const { count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        tableAnalysis[tableName] = {
          columns,
          sample,
          recordCount: count || 0,
          hasData: count > 0
        };

        console.log(`      ✅ ${count} registros`);
        console.log(`      📋 Columnas (${columns.length}): ${columns.join(', ')}`);
        
        // Analizar tipos de datos y relaciones potenciales
        console.log(`      🔍 Análisis de columnas:`);
        columns.forEach(col => {
          const value = sample[col];
          const type = typeof value;
          const isFK = col.includes('id_') || col.includes('_id');
          const isRelation = col.includes('id_') && col !== 'id_' + tableName;
          
          let analysis = `         ${col}: ${type}`;
          if (isFK) analysis += ' [FK potencial]';
          if (isRelation) analysis += ' [Relación]';
          if (value === null) analysis += ' [NULL]';
          if (value !== null && value !== undefined) {
            const display = typeof value === 'string' && value.length > 30 
              ? value.substring(0, 30) + '...' 
              : value;
            analysis += ` = ${display}`;
          }
          console.log(analysis);
        });
      } else {
        console.log(`      ⚠️  Tabla vacía o sin datos`);
        tableAnalysis[tableName] = {
          columns: [],
          sample: null,
          recordCount: 0,
          hasData: false
        };
      }
      
    } catch (e) {
      console.log(`      ❌ Error analizando tabla: ${e.message}`);
    }
  }

  // 3. Análisis de relaciones
  console.log('\n3️⃣ ANÁLISIS DE RELACIONES Y CLAVES FORÁNEAS:');
  
  const relationships = [];
  const allColumns = {};
  
  Object.entries(tableAnalysis).forEach(([table, info]) => {
    if (info.hasData) {
      info.columns.forEach(col => {
        if (!allColumns[col]) allColumns[col] = [];
        allColumns[col].push(table);
      });
    }
  });

  console.log('   🔗 Posibles relaciones identificadas:');
  
  Object.entries(allColumns).forEach(([column, tables]) => {
    if (tables.length > 1 && (column.includes('id_') || column.includes('_id'))) {
      console.log(`      🔗 ${column}: ${tables.join(' ↔ ')}`);
      relationships.push({ column, tables });
    }
  });

  // 4. Análisis de consistencia
  console.log('\n4️⃣ ANÁLISIS DE CONSISTENCIA DE DATOS:');
  
  // Verificar IDs únicos
  console.log('   🔍 Verificando consistencia de IDs:');
  
  for (const [tableName, info] of Object.entries(tableAnalysis)) {
    if (info.hasData && info.recordCount > 0) {
      const idColumns = info.columns.filter(col => 
        col === 'id' || col === `id_${tableName}` || col === `${tableName}_id`
      );
      
      if (idColumns.length > 0) {
        const idCol = idColumns[0];
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select(idCol)
            .limit(10);

          if (!error && data) {
            const uniqueIds = [...new Set(data.map(d => d[idCol]))];
            const isConsistent = uniqueIds.length === data.length;
            console.log(`      ${tableName}.${idCol}: ${isConsistent ? '✅' : '❌'} Únicos`);
          }
        } catch (e) {
          console.log(`      ${tableName}.${idCol}: ❌ Error verificando`);
        }
      }
    }
  }

  // 5. Análisis de problemas potenciales
  console.log('\n5️⃣ ANÁLISIS DE PROBLEMAS POTENCIALES:');
  
  const issues = [];
  
  // Tablas vacías
  Object.entries(tableAnalysis).forEach(([table, info]) => {
    if (!info.hasData) {
      issues.push({ type: 'empty_table', table, message: `Tabla ${table} está vacía` });
    }
  });

  // Columnas con valores nulos
  Object.entries(tableAnalysis).forEach(([table, info]) => {
    if (info.hasData && info.sample) {
      Object.entries(info.sample).forEach(([col, value]) => {
        if (value === null) {
          issues.push({ 
            type: 'null_column', 
            table, 
            column: col, 
            message: `Columna ${table}.${col} tiene valores nulos` 
          });
        }
      });
    }
  });

  if (issues.length > 0) {
    console.log('   ⚠️  Problemas identificados:');
    issues.forEach((issue, index) => {
      console.log(`      ${index + 1}. [${issue.type}] ${issue.message}`);
    });
  } else {
    console.log('   ✅ No se encontraron problemas graves');
  }

  // 6. Recomendaciones
  console.log('\n6️⃣ RECOMENDACIONES DE OPTIMIZACIÓN:');
  
  const recommendations = [];

  // Tablas para eliminar (vacías y sin uso aparente)
  Object.entries(tableAnalysis).forEach(([table, info]) => {
    if (!info.hasData) {
      recommendations.push({
        type: 'delete_table',
        table,
        reason: 'Tabla vacía y sin datos',
        priority: 'medium'
      });
    }
  });

  // Columnas para optimizar
  Object.entries(tableAnalysis).forEach(([table, info]) => {
    if (info.hasData && info.sample) {
      Object.entries(info.sample).forEach(([col, value]) => {
        if (value === null && col.includes('id_')) {
          recommendations.push({
            type: 'review_column',
            table,
            column: col,
            reason: 'Columna de ID potencialmente innecesaria con valores nulos',
            priority: 'low'
          });
        }
      });
    }
  });

  if (recommendations.length > 0) {
    console.log('   💡 Recomendaciones:');
    recommendations.forEach((rec, index) => {
      const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
      console.log(`      ${index + 1}. ${priority} [${rec.type}] ${rec.table || ''}${rec.column ? '.' + rec.column : ''}: ${rec.reason}`);
    });
  } else {
    console.log('   ✅ Estructura de datos optimizada');
  }

  // 7. Generar reporte final
  console.log('\n7️⃣ REPORTE FINAL DE ANÁLISIS:');
  console.log('===============================');
  
  const totalTables = Object.keys(tableAnalysis).length;
  const tablesWithData = Object.values(tableAnalysis).filter(t => t.hasData).length;
  const totalRecords = Object.values(tableAnalysis).reduce((sum, t) => sum + t.recordCount, 0);
  
  console.log(`   📊 Estadísticas generales:`);
  console.log(`      - Tablas totales: ${totalTables}`);
  console.log(`      - Tablas con datos: ${tablesWithData}`);
  console.log(`      - Registros totales: ${totalRecords}`);
  console.log(`      - Relaciones identificadas: ${relationships.length}`);
  console.log(`      - Problemas encontrados: ${issues.length}`);
  console.log(`      - Recomendaciones: ${recommendations.length}`);

  console.log('\n✅ Análisis completado exitosamente');

  return {
    tableAnalysis,
    relationships,
    issues,
    recommendations,
    statistics: {
      totalTables,
      tablesWithData,
      totalRecords,
      relationshipsCount: relationships.length,
      issuesCount: issues.length,
      recommendationsCount: recommendations.length
    }
  };
}

analizarBaseDeDatosCompleta();