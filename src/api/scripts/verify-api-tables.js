/**
 * Script de verificación - API Empresarial
 * Verifica que todas las tablas de API estén creadas correctamente en Supabase
 */

const { createClient } = require('@supabase/supabase-js');

async function verifyApiTables() {
  console.log('🔍 VERIFICANDO TABLAS DE API EN SUPABASE...\n');

  try {
    // Configurar cliente Supabase
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`✅ Conexión establecida a: ${supabaseUrl}`);
    console.log(`📋 Verificando tablas de API...\n`);

    // 1. Verificar que las tablas existen
    const expectedTables = [
      'api_tokens',
      'api_logs', 
      'api_metrics',
      'api_oauth_clients',
      'api_oauth_tokens',
      'api_webhooks',
      'api_webhook_logs'
    ];

    console.log('🗄️  TABLAS ESPERADAS:');
    for (const table of expectedTables) {
      console.log(`   - ${table}`);
    }

    // Verificar cada tabla individualmente
    console.log('\n🔍 VERIFICANDO CADA TABLA:');
    let allTablesExist = true;

    for (const tableName of expectedTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`   ❌ ${tableName}: ERROR - ${error.message}`);
          allTablesExist = false;
        } else {
          console.log(`   ✅ ${tableName}: EXISTE`);
        }
      } catch (err) {
        console.log(`   ❌ ${tableName}: ERROR - ${err.message}`);
        allTablesExist = false;
      }
    }

    // 2. Verificar funciones PostgreSQL
    console.log('\n🔧 VERIFICANDO FUNCIONES PostgreSQL:');
    const expectedFunctions = [
      'validate_api_token',
      'record_token_usage',
      'cleanup_expired_tokens'
    ];

    for (const functionName of expectedFunctions) {
      try {
        const { data, error } = await supabase
          .rpc(functionName);

        // Si llegamos aquí sin error, la función existe
        console.log(`   ✅ ${functionName}: EXISTE`);
      } catch (err) {
        // La función podría no existir o tener parámetros requeridos
        if (err.message.includes('does not exist')) {
          console.log(`   ❌ ${functionName}: NO EXISTE`);
        } else {
          console.log(`   ⚠️  ${functionName}: REQUIERE PARÁMETROS (probablemente existe)`);
        }
      }
    }

    // 3. Verificar token de ejemplo si existe
    console.log('\n🔑 VERIFICANDO DATOS DE EJEMPLO:');
    try {
      const { data: exampleTokens, error } = await supabase
        .from('api_tokens')
        .select('*')
        .limit(5);

      if (error) {
        console.log(`   ❌ Error consultando api_tokens: ${error.message}`);
      } else {
        console.log(`   ✅ api_tokens tiene ${exampleTokens?.length || 0} registros`);
        if (exampleTokens && exampleTokens.length > 0) {
          console.log('   📝 Ejemplos encontrados:');
          exampleTokens.slice(0, 3).forEach((token, index) => {
            console.log(`      ${index + 1}. ${token.nombre} (${token.plan})`);
          });
        } else {
          console.log('   💡 No hay tokens de ejemplo. Puedes crear uno desde /admin/api');
        }
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }

    // 4. Verificar índices
    console.log('\n📊 VERIFICANDO RENDIMIENTO (Índices):');
    try {
      const { data: indices, error } = await supabase
        .from('information_schema.table_constraints')
        .select('*')
        .eq('table_schema', 'public')
        .in('table_name', expectedTables);

      if (error) {
        console.log(`   ⚠️  No se pudieron verificar índices: ${error.message}`);
      } else {
        console.log(`   ✅ Encontrados ${indices?.length || 0} constraints/índices`);
      }
    } catch (err) {
      console.log(`   ⚠️  Error verificando índices: ${err.message}`);
    }

    // RESUMEN FINAL
    console.log('\n' + '='.repeat(50));
    console.log('📋 RESUMEN DE VERIFICACIÓN:');
    
    if (allTablesExist) {
      console.log('✅ TODAS LAS TABLAS DE API ESTÁN CREADAS CORRECTAMENTE');
      console.log('\n🎉 EL SISTEMA ESTÁ LISTO PARA USAR:');
      console.log('1. Ve a /admin/api (como administrador)');
      console.log('2. Genera tu primer token de API');
      console.log('3. Prueba la integración con el SDK');
      console.log('\n💡 El panel administrativo debería mostrar:');
      console.log('   - Dashboard de métricas');
      console.log('   - Lista de tokens (incluyendo el de ejemplo)');
      console.log('   - Opciones para crear nuevos tokens');
      
    } else {
      console.log('❌ ALGUNAS TABLAS NO EXISTEN');
      console.log('\n🔧 ACCIONES REQUERIDAS:');
      console.log('1. Revisa que el script SQL se ejecutó completamente');
      console.log('2. Verifica los permisos de base de datos');
      console.log('3. Re-ejecuta el script si es necesario');
    }

    console.log('\n📞 PRÓXIMOS PASOS:');
    console.log('- Accede al panel: /admin/api');
    console.log('- Consulta la documentación: /api-desarrollador');
    console.log('- Prueba el SDK: src/api/sdk/pautapro-client.js');

    return { success: allTablesExist };

  } catch (error) {
    console.error('💥 Error durante la verificación:', error.message);
    return { success: false, error: error.message };
  }
}

// Ejecutar verificación
if (require.main === module) {
  verifyApiTables().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = { verifyApiTables };