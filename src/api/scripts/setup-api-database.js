/**
 * Script de configuración de base de datos para API Empresarial
 * Ejecuta la creación de tablas en Supabase
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function setupApiDatabase() {
  try {
    console.log('🚀 Configurando base de datos para API Empresarial...');

    // Configurar cliente Supabase
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Leer el script SQL
    const sqlFilePath = path.join(__dirname, '../database/create-api-tokens-table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📋 Ejecutando script SQL de configuración...');

    // Dividir el SQL en statements individuales para evitar errores
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    let executedCount = 0;
    let errors = [];

    // Ejecutar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        // Usar el cliente de Supabase para ejecutar SQL raw
        const { data, error } = await supabase.rpc('exec_sql', {
          query: statement + ';'
        });

        if (error) {
          // Si el error es que la función no existe, intentemos otra forma
          if (error.message.includes('exec_sql')) {
            console.log('🔄 Método RPC no disponible, intentando vía API...');
            
            // Método alternativo: usar la API de Supabase
            const response = await fetch(`${supabaseUrl}/rest/v1/`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/sql',
                'apikey': supabaseServiceKey
              },
              body: statement + ';'
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }
          } else {
            throw error;
          }
        }

        executedCount++;
        console.log(`✅ Statement ${i + 1}/${statements.length} ejecutado correctamente`);
        
      } catch (error) {
        console.warn(`⚠️  Error en statement ${i + 1}:`, error.message);
        errors.push({
          statement: statement.substring(0, 100) + '...',
          error: error.message
        });
      }
    }

    console.log('\n📊 RESUMEN DE EJECUCIÓN:');
    console.log(`✅ Statements ejecutados exitosamente: ${executedCount}`);
    console.log(`❌ Statements con errores: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n⚠️  ERRORES ENCONTRADOS:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.error}`);
        console.log(`   Query: ${error.statement}\n`);
      });
    }

    // Verificar que las tablas se crearon correctamente
    console.log('\n🔍 Verificando tablas creadas...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', 'api_%');

    if (tablesError) {
      console.warn('⚠️  No se pudieron verificar las tablas:', tablesError.message);
    } else {
      console.log('📋 Tablas de API encontradas:');
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }

    // Insertar datos de ejemplo si las tablas existen
    console.log('\n🔄 Insertando datos de ejemplo...');
    try {
      // Insertar token de ejemplo
      const { error: tokenError } = await supabase
        .from('api_tokens')
        .upsert({
          nombre: 'Sistema de Facturación Desarrollo',
          descripcion: 'Token para integrar con sistema de facturación en desarrollo',
          token: `pk_dev_${Math.random().toString(36).substring(2, 34)}`,
          permisos: ['clientes.read', 'clientes.create', 'ordenes.read', 'ordenes.create', 'reportes.read'],
          plan: 'standard',
          limite_requests_hora: 1000,
          fecha_expiracion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          activo: true
        }, {
          onConflict: 'token'
        });

      if (tokenError) {
        console.warn('⚠️  Error insertando token de ejemplo:', tokenError.message);
      } else {
        console.log('✅ Token de ejemplo insertado correctamente');
      }

    } catch (exampleError) {
      console.warn('⚠️  Error insertando datos de ejemplo:', exampleError.message);
    }

    console.log('\n🎉 CONFIGURACIÓN COMPLETADA');
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('1. Ve al panel de administración de API en /admin/api');
    console.log('2. Genera tokens para tus integraciones');
    console.log('3. Consulta la documentación de la API');
    console.log('4. Prueba los endpoints con el SDK');

    return {
      success: true,
      executedCount,
      errors: errors.length,
      tables: tables || []
    };

  } catch (error) {
    console.error('💥 Error configurando base de datos:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupApiDatabase().then(result => {
    if (result.success) {
      console.log('\n✅ Configuración exitosa');
      process.exit(0);
    } else {
      console.log('\n❌ Configuración falló');
      process.exit(1);
    }
  });
}

module.exports = { setupApiDatabase };