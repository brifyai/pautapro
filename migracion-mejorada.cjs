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

// Función de logging mejorada
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    message,
    data
  };
  
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
  
  // Guardar en archivo de log
  fs.appendFileSync('migracion-mejorada.log', JSON.stringify(logEntry) + '\n');
}

// Función para ejecutar SQL raw
async function executeRawSQL(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      // Si el RPC no existe, intentar con REST API directa
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey
        },
        body: JSON.stringify({ sql_query: sql })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    }
    return data;
  } catch (error) {
    log('ERROR', `Error ejecutando SQL: ${error.message}`);
    throw error;
  }
}

// Función para crear tablas con SQL directo
async function crearTablasConSQL() {
  log('INFO', '🔄 CREANDO TABLAS CON SQL DIRECTO...');
  
  const tablasSQL = [
    // Tabla clientes
    `CREATE TABLE IF NOT EXISTS clientes_nueva (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      rut VARCHAR(20),
      direccion TEXT,
      telefono VARCHAR(50),
      email VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Tabla campanas
    `CREATE TABLE IF NOT EXISTS campanas_nueva (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      cliente_id INTEGER REFERENCES clientes_nueva(id),
      descripcion TEXT,
      fecha_inicio DATE,
      fecha_termino DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Tabla medios
    `CREATE TABLE IF NOT EXISTS medios_nueva (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      tipo VARCHAR(100),
      descripcion TEXT,
      costo_por_unidad DECIMAL(10,2),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Tabla proveedores
    `CREATE TABLE IF NOT EXISTS proveedores_nueva (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      rut VARCHAR(20),
      direccion TEXT,
      telefono VARCHAR(50),
      email VARCHAR(255),
      tipo VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Tabla contratos
    `CREATE TABLE IF NOT EXISTS contratos_nueva (
      id SERIAL PRIMARY KEY,
      proveedor_id INTEGER REFERENCES proveedores_nueva(id),
      numero_contrato VARCHAR(255) NOT NULL,
      tipo VARCHAR(100),
      fecha_inicio DATE,
      fecha_termino DATE,
      monto_total DECIMAL(15,2),
      estado VARCHAR(50) DEFAULT 'activo',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Tabla planes
    `CREATE TABLE IF NOT EXISTS planes_nueva (
      id SERIAL PRIMARY KEY,
      campana_id INTEGER REFERENCES campanas_nueva(id),
      nombre VARCHAR(255) NOT NULL,
      descripcion TEXT,
      estado VARCHAR(50) DEFAULT 'borrador',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Tabla alternativas
    `CREATE TABLE IF NOT EXISTS alternativas_nueva (
      id SERIAL PRIMARY KEY,
      plan_id INTEGER REFERENCES planes_nueva(id),
      medio_id INTEGER REFERENCES medios_nueva(id),
      nombre VARCHAR(255) NOT NULL,
      descripcion TEXT,
      cantidad INTEGER DEFAULT 1,
      costo_unitario DECIMAL(10,2),
      costo_total DECIMAL(15,2),
      fecha_inicio DATE,
      fecha_termino DATE,
      estado VARCHAR(50) DEFAULT 'activa',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Tabla ordenes
    `CREATE TABLE IF NOT EXISTS ordenes_nueva (
      id SERIAL PRIMARY KEY,
      numero_orden VARCHAR(255) NOT NULL UNIQUE,
      cliente_id INTEGER REFERENCES clientes_nueva(id),
      campana_id INTEGER REFERENCES campanas_nueva(id),
      plan_id INTEGER REFERENCES planes_nueva(id),
      proveedor_id INTEGER REFERENCES proveedores_nueva(id),
      contrato_id INTEGER REFERENCES contratos_nueva(id),
      estado VARCHAR(50) DEFAULT 'borrador',
      monto_total DECIMAL(15,2),
      fecha_creacion DATE DEFAULT CURRENT_DATE,
      fecha_aprobacion DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`
  ];
  
  for (const sql of tablasSQL) {
    try {
      await executeRawSQL(sql);
      log('INFO', '✅ Tabla creada con SQL directo');
      await sleep(1000); // Esperar 1 segundo entre tablas
    } catch (error) {
      log('ERROR', `Error creando tabla: ${error.message}`);
      throw error;
    }
  }
}

// Función para migrar datos con SQL directo
async function migrarDatosConSQL() {
  log('INFO', '🔄 MIGRANDO DATOS CON SQL DIRECTO...');
  
  const migracionesSQL = [
    // Migrar clientes
    `INSERT INTO clientes_nueva (id, nombre, rut, direccion, telefono, email, created_at, updated_at)
     SELECT id, nombre, rut, direccion, telefono, email, created_at, updated_at
     FROM clientes
     ON CONFLICT (id) DO NOTHING;`,
    
    // Migrar campanas
    `INSERT INTO campanas_nueva (id, nombre, cliente_id, descripcion, fecha_inicio, fecha_termino, created_at, updated_at)
     SELECT id, nombre, cliente_id, descripcion, fecha_inicio, fecha_termino, created_at, updated_at
     FROM campania
     ON CONFLICT (id) DO NOTHING;`,
    
    // Migrar medios
    `INSERT INTO medios_nueva (id, nombre, tipo, descripcion, costo_por_unidad, created_at, updated_at)
     SELECT id, nombre, tipo, descripcion, costo_por_unidad, created_at, updated_at
     FROM medios
     ON CONFLICT (id) DO NOTHING;`,
    
    // Migrar proveedores
    `INSERT INTO proveedores_nueva (id, nombre, rut, direccion, telefono, email, tipo, created_at, updated_at)
     SELECT id, nombre, rut, direccion, telefono, email, tipo, created_at, updated_at
     FROM proveedores
     ON CONFLICT (id) DO NOTHING;`,
    
    // Migrar contratos
    `INSERT INTO contratos_nueva (id, proveedor_id, numero_contrato, tipo, fecha_inicio, fecha_termino, monto_total, estado, created_at, updated_at)
     SELECT id, proveedor_id, numero_contrato, tipo, fecha_inicio, fecha_termino, monto_total, estado, created_at, updated_at
     FROM contratos
     ON CONFLICT (id) DO NOTHING;`,
    
    // Migrar planes
    `INSERT INTO planes_nueva (id, campana_id, nombre, descripcion, estado, created_at, updated_at)
     SELECT id, campana_id, nombre, descripcion, estado, created_at, updated_at
     FROM plan
     ON CONFLICT (id) DO NOTHING;`,
    
    // Migrar alternativas
    `INSERT INTO alternativas_nueva (id, plan_id, medio_id, nombre, descripcion, cantidad, costo_unitario, costo_total, fecha_inicio, fecha_termino, estado, created_at, updated_at)
     SELECT id, plan_id, medio_id, nombre, descripcion, cantidad, costo_unitario, costo_total, fecha_inicio, fecha_termino, estado, created_at, updated_at
     FROM alternativa
     ON CONFLICT (id) DO NOTHING;`,
    
    // Migrar ordenes
    `INSERT INTO ordenes_nueva (id, numero_orden, cliente_id, campana_id, plan_id, proveedor_id, contrato_id, estado, monto_total, fecha_creacion, fecha_aprobacion, created_at, updated_at)
     SELECT id, numero_orden, cliente_id, campana_id, plan_id, proveedor_id, contrato_id, estado, monto_total, fecha_creacion, fecha_aprobacion, created_at, updated_at
     FROM ordenesdepublicidad
     ON CONFLICT (id) DO NOTHING;`
  ];
  
  for (const sql of migracionesSQL) {
    try {
      await executeRawSQL(sql);
      log('INFO', '✅ Datos migrados con SQL directo');
      await sleep(500); // Esperar medio segundo entre migraciones
    } catch (error) {
      log('ERROR', `Error migrando datos: ${error.message}`);
      throw error;
    }
  }
}

// Función para verificar migración
async function verificarMigracion() {
  log('INFO', '🔍 VERIFICANDO MIGRACIÓN...');
  
  const tablas = ['clientes_nueva', 'campanas_nueva', 'medios_nueva', 'proveedores_nueva', 'contratos_nueva', 'planes_nueva', 'alternativas_nueva', 'ordenes_nueva'];
  
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
}

// Función para intercambiar tablas
async function intercambiarTablas() {
  log('INFO', '🔄 INTERCAMBIANDO TABLAS...');
  
  const intercambiosSQL = [
    // Renombrar tablas originales a _backup
    `ALTER TABLE IF EXISTS clientes RENAME TO clientes_backup;`,
    `ALTER TABLE IF EXISTS campania RENAME TO campania_backup;`,
    `ALTER TABLE IF EXISTS medios RENAME TO medios_backup;`,
    `ALTER TABLE IF EXISTS proveedores RENAME TO proveedores_backup;`,
    `ALTER TABLE IF EXISTS contratos RENAME TO contratos_backup;`,
    `ALTER TABLE IF EXISTS plan RENAME TO plan_backup;`,
    `ALTER TABLE IF EXISTS alternativa RENAME TO alternativa_backup;`,
    `ALTER TABLE IF EXISTS ordenesdepublicidad RENAME TO ordenesdepublicidad_backup;`,
    
    // Renombrar tablas nuevas a nombres finales
    `ALTER TABLE clientes_nueva RENAME TO clientes;`,
    `ALTER TABLE campanas_nueva RENAME TO campania;`,
    `ALTER TABLE medios_nueva RENAME TO medios;`,
    `ALTER TABLE proveedores_nueva RENAME TO proveedores;`,
    `ALTER TABLE contratos_nueva RENAME TO contratos;`,
    `ALTER TABLE planes_nueva RENAME TO plan;`,
    `ALTER TABLE alternativas_nueva RENAME TO alternativa;`,
    `ALTER TABLE ordenes_nueva RENAME TO ordenesdepublicidad;`
  ];
  
  for (const sql of intercambiosSQL) {
    try {
      await executeRawSQL(sql);
      log('INFO', '✅ Intercambio de tabla realizado');
      await sleep(500);
    } catch (error) {
      log('ERROR', `Error intercambiando tabla: ${error.message}`);
      throw error;
    }
  }
}

// Función principal de migración
async function migrarBaseDeDatos() {
  try {
    log('INFO', '🚀 INICIANDO MIGRACIÓN MEJORADA DE BASE DE DATOS');
    log('INFO', '================================================');
    
    // Paso 1: Crear tablas nuevas con SQL directo
    await crearTablasConSQL();
    
    // Paso 2: Migrar datos con SQL directo
    await migrarDatosConSQL();
    
    // Paso 3: Verificar migración
    await verificarMigracion();
    
    // Paso 4: Intercambiar tablas
    await intercambiarTablas();
    
    log('INFO', '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
    log('INFO', '🎉 Todas las tablas han sido migradas y estandarizadas');
    
  } catch (error) {
    log('ERROR', `❌ Error en migración: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar migración
migrarBaseDeDatos();