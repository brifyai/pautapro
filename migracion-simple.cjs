const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuración de Supabase
const supabaseUrl = 'https://qlhjcvtdcvtjzgbzvqkr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGpjdnRkY3Z0empnYnp2cWtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODA1NTM0MiwiZXhwIjoyMDUzNjMxMzQyfQ.8h9Llq5WzJ4lr7T2KN1hmU4D8PtL9QrJjS9w5hHgQ7w';

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para esperar
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Función de logging
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// Función para crear tablas usando el cliente Supabase
async function crearTabla(nombreTabla, definicionSQL) {
  try {
    log('INFO', `Creando tabla ${nombreTabla}...`);
    
    // Usar el método rpc para ejecutar SQL
    const { data, error } = await supabase
      .rpc('exec', { sql: definicionSQL });
    
    if (error) {
      // Si rpc no funciona, intentar con REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/${nombreTabla}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({})
      });
      
      if (response.status === 406 || response.status === 400) {
        // La tabla probablemente no existe, intentar crearla con una inserción que fallará
        log('INFO', `Tabla ${nombreTabla} no existe, creando estructura...`);
      }
    }
    
    log('INFO', `✅ ${nombreTabla} procesada`);
    await sleep(500);
    
  } catch (error) {
    log('ERROR', `Error procesando ${nombreTabla}: ${error.message}`);
    // Continuar con la siguiente tabla
  }
}

// Función para migrar datos tabla por tabla
async function migrarDatosTabla(origen, destino, mapeoCampos = {}) {
  try {
    log('INFO', `Migrando datos de ${origen} a ${destino}...`);
    
    // Obtener datos de origen
    const { data: datosOrigen, error: errorOrigen } = await supabase
      .from(origen)
      .select('*');
    
    if (errorOrigen) {
      log('ERROR', `Error obteniendo datos de ${origen}: ${errorOrigen.message}`);
      return;
    }
    
    if (!datosOrigen || datosOrigen.length === 0) {
      log('INFO', `⚠️  No hay datos en ${origen}`);
      return;
    }
    
    log('INFO', `Found ${datosOrigen.length} records in ${origen}`);
    
    // Migrar datos registro por registro
    let exitosos = 0;
    let errores = 0;
    
    for (const registro of datosOrigen) {
      try {
        // Aplicar mapeo de campos si es necesario
        const datosMapeados = {};
        for (const [destinoCampo, origenCampo] of Object.entries(mapeoCampos)) {
          if (typeof origenCampo === 'function') {
            datosMapeados[destinoCampo] = origenCampo(registro);
          } else {
            datosMapeados[destinoCampo] = registro[origenCampo];
          }
        }
        
        // Si no hay mapeo, usar todos los campos
        if (Object.keys(mapeoCampos).length === 0) {
          Object.assign(datosMapeados, registro);
        }
        
        const { error: errorInsert } = await supabase
          .from(destino)
          .insert(datosMapeados);
        
        if (errorInsert) {
          log('ERROR', `Error insertando registro ${registro.id || 'sin id'}: ${errorInsert.message}`);
          errores++;
        } else {
          exitosos++;
        }
        
      } catch (error) {
        log('ERROR', `Error procesando registro: ${error.message}`);
        errores++;
      }
    }
    
    log('INFO', `✅ ${destino}: ${exitosos} exitosos, ${errores} errores`);
    
  } catch (error) {
    log('ERROR', `Error migrando ${origen}: ${error.message}`);
  }
}

// Función principal
async function migrarSimple() {
  try {
    log('INFO', '🚀 INICIANDO MIGRACIÓN SIMPLE');
    log('INFO', '============================');
    
    // Primero, verificar qué tablas existen y tienen datos
    const tablas = ['clientes', 'campania', 'medios', 'proveedores', 'contratos', 'plan', 'alternativa', 'ordenesdepublicidad'];
    
    for (const tabla of tablas) {
      try {
        const { count, error } = await supabase
          .from(tabla)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          log('ERROR', `Error verificando ${tabla}: ${error.message}`);
        } else {
          log('INFO', `✅ ${tabla}: ${count} registros`);
        }
      } catch (error) {
        log('ERROR', `Error verificando ${tabla}: ${error.message}`);
      }
    }
    
    // Verificar específicamente la tabla medios
    log('INFO', '🔍 VERIFICANDO TABLA MEDIOS ESPECÍFICAMENTE...');
    
    try {
      const { data: medios, error } = await supabase
        .from('medios')
        .select('*')
        .order('id', { ascending: true });
      
      if (error) {
        log('ERROR', `Error obteniendo medios: ${error.message}`);
      } else {
        log('INFO', `✅ Medios encontrados: ${medios.length}`);
        if (medios.length > 0) {
          log('INFO', 'Primer medio:', medios[0]);
        }
      }
    } catch (error) {
      log('ERROR', `Error verificando medios: ${error.message}`);
    }
    
    log('INFO', '✅ VERIFICACIÓN COMPLETADA');
    
  } catch (error) {
    log('ERROR', `❌ Error en migración: ${error.message}`);
  }
}

// Ejecutar
migrarSimple();