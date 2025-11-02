const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 OPTIMIZACIÓN EXPERTA DE BASE DE DATOS');
console.log('======================================\n');

async function generarOptimizacionBD() {
  try {
    console.log('📊 GENERANDO PLAN DE OPTIMIZACIÓN BASADO EN ANÁLISIS...\n');

    // 1. Análisis de tablas faltantes vs usadas en frontend
    console.log('1️⃣ ANÁLISIS DE TABLAS: EXISTENTES VS USADAS EN FRONTEND');
    
    const tablasExistentes = [
      'clientes', 'medios', 'campania', 'ordenesdepublicidad', 'proveedores',
      'agencias', 'contratos', 'productos', 'soportes', 'temas', 
      'mensajes', 'usuarios', 'perfiles'
    ];
    
    const tablasFaltantes = ['alternativas', 'planes'];
    
    console.log('   ✅ Tablas existentes con datos:');
    tablasExistentes.forEach(tabla => console.log(`      - ${tabla}`));
    
    console.log('   ❌ Tablas faltantes (referenciadas en frontend):');
    tablasFaltantes.forEach(tabla => console.log(`      - ${tabla} [CRÍTICO]`));

    // 2. Análisis de problemas críticos encontrados
    console.log('\n2️⃣ PROBLEMAS CRÍTICOS IDENTIFICADOS');
    
    const problemasCriticos = [
      {
        tipo: 'tabla_faltante',
        tabla: 'alternativas',
        impacto: 'ALTO',
        descripcion: 'Tabla alternativas no existe pero es referenciada en el frontend',
        accion: 'CREAR_TABLA'
      },
      {
        tipo: 'tabla_faltante',
        tabla: 'planes',
        impacto: 'ALTO',
        descripcion: 'Tabla planes no existe pero es referenciada en el frontend',
        accion: 'CREAR_TABLA'
      },
      {
        tipo: 'duplicidad_id',
        tabla: 'medios',
        impacto: 'MEDIO',
        descripcion: 'Tabla medios tiene tanto "id" como "id_medio"',
        accion: 'UNIFICAR_IDS'
      },
      {
        tipo: 'columnas_innecesarias',
        tabla: 'ordenesdepublicidad',
        impacto: 'MEDIO',
        descripcion: 'Múltiples columnas con valores nulos innecesarios',
        accion: 'LIMPIAR_COLUMNAS'
      },
      {
        tipo: 'inconsistencia_nombres',
        tabla: 'agencias',
        impacto: 'BAJO',
        descripción: 'Nombres de columnas inconsistentes',
        accion: 'ESTANDARIZAR_NOMBRES'
      }
    ];

    console.log('   🚨 Problemas por orden de prioridad:');
    problemasCriticos.forEach((problema, index) => {
      const icono = problema.impacto === 'ALTO' ? '🔴' : problema.impacto === 'MEDIO' ? '🟡' : '🟢';
      console.log(`      ${index + 1}. ${icono} [${problema.accion}] ${problema.tabla}: ${problema.descripcion}`);
    });

    // 3. Generar SQL para crear tablas faltantes
    console.log('\n3️⃣ SQL PARA CREAR TABLAS FALTANTES');
    
    console.log('   📝 Script SQL para tabla ALTERNATIVAS:');
    const sqlAlternativas = `
-- Crear tabla alternativas
CREATE TABLE IF NOT EXISTS alternativas (
    id_alternativa SERIAL PRIMARY KEY,
    id_plan INTEGER REFERENCES planes(id_plan),
    id_medio INTEGER REFERENCES medios(id_medio),
    id_soporte INTEGER REFERENCES soportes(id_soporte),
    nombre_alternativa VARCHAR(255) NOT NULL,
    descripcion TEXT,
    costo_unitario DECIMAL(10,2),
    duracion_segundos INTEGER,
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_alternativas_plan ON alternativas(id_plan);
CREATE INDEX IF NOT EXISTS idx_alternativas_medio ON alternativas(id_medio);
CREATE INDEX IF NOT EXISTS idx_alternativas_estado ON alternativas(estado);
`;
    console.log(sqlAlternativas);

    console.log('\n   📝 Script SQL para tabla PLANES:');
    const sqlPlanes = `
-- Crear tabla planes
CREATE TABLE IF NOT EXISTS planes (
    id_plan SERIAL PRIMARY KEY,
    id_campania INTEGER REFERENCES campania(id_campania),
    id_cliente INTEGER REFERENCES clientes(id_cliente),
    nombre_plan VARCHAR(255) NOT NULL,
    descripcion TEXT,
    presupuesto_total DECIMAL(12,2),
    fecha_inicio DATE,
    fecha_fin DATE,
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_planes_campania ON planes(id_campania);
CREATE INDEX IF NOT EXISTS idx_planes_cliente ON planes(id_cliente);
CREATE INDEX IF NOT EXISTS idx_planes_estado ON planes(estado);
`;
    console.log(sqlPlanes);

    // 4. Generar SQL para limpiar columnas innecesarias
    console.log('\n4️⃣ SQL PARA LIMPIAR COLUMNAS INNECESARIAS');
    
    console.log('   📝 Script para eliminar columnas con valores nulos persistentes:');
    const sqlLimpieza = `
-- Eliminar columnas innecesarias en tabla clientes
ALTER TABLE clientes DROP COLUMN IF EXISTS id_tipo_cliente;
ALTER TABLE clientes DROP COLUMN IF EXISTS id_tablaformato;
ALTER TABLE clientes DROP COLUMN IF EXISTS id_moneda;
ALTER TABLE clientes DROP COLUMN IF EXISTS valor;

-- Eliminar columnas innecesarias en tabla ordenesdepublicidad
ALTER TABLE ordenesdepublicidad DROP COLUMN IF EXISTS id_plan;
ALTER TABLE ordenesdepublicidad DROP COLUMN IF EXISTS id_campana; -- Duplicado con id_campania

-- Eliminar columnas innecesarias en tabla agencias
ALTER TABLE agencias DROP COLUMN IF EXISTS id_region;
ALTER TABLE agencias DROP COLUMN IF EXISTS id_comuna;

-- Eliminar columnas innecesarias en tabla proveedores
ALTER TABLE proveedores DROP COLUMN IF EXISTS telcelular;
ALTER TABLE proveedores DROP COLUMN IF EXISTS telfijo;
ALTER TABLE proveedores DROP COLUMN IF EXISTS nombreidentificador;
ALTER TABLE proveedores DROP COLUMN IF EXISTS bonificacionano;

-- Eliminar columnas innecesarias en tabla usuarios
ALTER TABLE usuarios DROP COLUMN IF EXISTS apellido;
ALTER TABLE usuarios DROP COLUMN IF EXISTS avatar;
`;
    console.log(sqlLimpieza);

    // 5. Generar SQL para unificar IDs duplicados
    console.log('\n5️⃣ SQL PARA UNIFICAR IDS DUPLICADOS');
    
    console.log('   📝 Script para unificar IDs en tabla medios:');
    const sqlUnificacion = `
-- Unificar IDs en tabla medios (eliminar id redundante)
-- Primero, actualizar referencias en otras tablas
UPDATE soportes SET id_medio = id WHERE id_medio IS NOT NULL;
UPDATE temas SET id_medio = id WHERE id_medio IS NOT NULL;

-- Eliminar columna duplicada
ALTER TABLE medios DROP COLUMN IF EXISTS id_medio;
`;
    console.log(sqlUnificacion);

    // 6. Generar SQL para estandarizar nombres
    console.log('\n6️⃣ SQL PARA ESTANDARIZAR NOMBRES DE COLUMNAS');
    
    console.log('   📝 Script para estandarizar nombres en agencias:');
    const sqlEstandarizacion = `
-- Estandarizar nombres en tabla agencias
ALTER TABLE agencias RENAME COLUMN nombreidentificador TO nombre_agencia;
ALTER TABLE agencias RENAME COLUMN nombrefantasia TO nombre_fantasia;
ALTER TABLE agencias RENAME COLUMN rutagencia TO rut_agencia;
ALTER TABLE agencias RENAME COLUMN nombrerepresentantelegal TO nombre_representante;
ALTER TABLE agencias RENAME COLUMN rutrepresentante TO rut_representante;
ALTER TABLE agencias RENAME COLUMN direccionagencia TO direccion_agencia;

-- Estandarizar nombres en tabla proveedores
ALTER TABLE proveedores RENAME COLUMN nombreproveedor TO nombre_proveedor;
ALTER TABLE proveedores RENAME COLUMN nombrefantasia TO nombre_fantasia;
ALTER TABLE proveedores RENAME COLUMN nombrerepresentante TO nombre_representante;
ALTER TABLE proveedores RENAME COLUMN rutrepresentante TO rut_representante;
ALTER TABLE proveedores RENAME COLUMN direccion_facturacion TO direccion_facturacion;

-- Estandarizar nombres en tabla clientes
ALTER TABLE clientes RENAME COLUMN nombrecliente TO nombre_cliente;
ALTER TABLE clientes RENAME COLUMN razonsocial TO razon_social;
ALTER TABLE clientes RENAME COLUMN nombrefantasia TO nombre_fantasia;
ALTER TABLE clientes RENAME COLUMN nombrerepresentantelegal TO nombre_representante;
ALTER TABLE clientes RENAME COLUMN apellidorepresentante TO apellido_representante;
ALTER TABLE clientes RENAME COLUMN rut_representante TO rut_representante;
ALTER TABLE clientes RENAME COLUMN direccionempresa TO direccion_empresa;
ALTER TABLE clientes RENAME COLUMN telcelular TO telefono_celular;
ALTER TABLE clientes RENAME COLUMN telfijo TO telefono_fijo;
ALTER TABLE clientes RENAME COLUMN web_cliente TO sitio_web;

-- Estandarizar nombres en tabla campania
ALTER TABLE campania RENAME COLUMN nombrecampania TO nombre_campana;
ALTER TABLE campania RENAME COLUMN id_anio TO id_anio;

-- Estandarizar nombres en tabla medios
ALTER TABLE medios RENAME COLUMN nombre_medio TO nombre_medio;
ALTER TABLE medios RENAME COLUMN tipo_medio TO tipo_medio;
ALTER TABLE medios RENAME COLUMN codigo_megatime TO codigo_megatime;

-- Estandarizar nombres en tabla productos
ALTER TABLE productos RENAME COLUMN nombredelproducto TO nombre_producto;
`;
    console.log(sqlEstandarizacion);

    // 7. Generar script completo de optimización
    console.log('\n7️⃣ SCRIPT COMPLETO DE OPTIMIZACIÓN');
    
    const scriptCompleto = `
-- =====================================================
-- SCRIPT COMPLETO DE OPTIMIZACIÓN DE BASE DE DATOS
-- =====================================================
-- Ejecutar en orden: 1, 2, 3, 4, 5, 6

-- [1] CREAR TABLAS FALTANTES
${sqlAlternativas}
${sqlPlanes}

-- [2] LIMPIAR COLUMNAS INNECESARIAS
${sqlLimpieza}

-- [3] UNIFICAR IDS DUPLICADOS
${sqlUnificacion}

-- [4] ESTANDARIZAR NOMBRES
${sqlEstandarizacion}

-- [5] CREAR ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_clientes_estado ON clientes(estado);
CREATE INDEX IF NOT EXISTS idx_campania_estado ON campania(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenesdepublicidad(estado);
CREATE INDEX IF NOT EXISTS idx_proveedores_estado ON proveedores(estado);
CREATE INDEX IF NOT EXISTS idx_contratos_estado ON contratos(estado);

-- [6] ACTUALIZAR MAPPINGS EN FRONTEND
-- Después de ejecutar este SQL, actualizar el archivo:
-- src/config/mapeo-campos.js con los nuevos nombres de columnas

-- =====================================================
-- FIN DEL SCRIPT DE OPTIMIZACIÓN
-- =====================================================
`;
    
    // Guardar script completo en archivo
    const fs = require('fs');
    fs.writeFileSync('optimizacion-bd-completa.sql', scriptCompleto);
    console.log('   💾 Script completo guardado en: optimizacion-bd-completa.sql');

    // 8. Resumen y recomendaciones finales
    console.log('\n8️⃣ RESUMEN Y RECOMENDACIONES FINALES');
    
    console.log('   📊 ESTADÍSTICAS DE OPTIMIZACIÓN:');
    console.log('      - Tablas a crear: 2 (alternativas, planes)');
    console.log('      - Columnas a eliminar: ~15');
    console.log('      - Columnas a renombrar: ~20');
    console.log('      - Índices a crear: 10+');
    console.log('      - Impacto en frontend: MODERADO (requiere actualizar mapeo)');
    
    console.log('\n   🎯 BENEFICIOS ESPERADOS:');
    console.log('      ✅ Consistencia en nombres de columnas');
    console.log('      ✅ Eliminación de datos nulos innecesarios');
    console.log('      ✅ Mejor rendimiento con índices');
    console.log('      ✅ Estructura normalizada');
    console.log('      ✅ Compatibilidad completa frontend-backend');
    
    console.log('\n   ⚠️  CONSIDERACIONES IMPORTANTES:');
    console.log('      1. Hacer backup de la base de datos antes de ejecutar');
    console.log('      2. Ejecutar en ambiente de desarrollo primero');
    console.log('      3. Actualizar mapeo-campos.js después de los cambios');
    console.log('      4. Probar todas las funcionalidades del sistema');
    console.log('      5. Algunos componentes del frontend podrían necesitar ajustes');
    
    console.log('\n   📋 PASOS SIGUIENTES:');
    console.log('      1. Revisar el script generado: optimizacion-bd-completa.sql');
    console.log('      2. Hacer backup de la base de datos');
    console.log('      3. Ejecutar el script en orden');
    console.log('      4. Actualizar src/config/mapeo-campos.js');
    console.log('      5. Probar el sistema completo');

    console.log('\n✅ Análisis de optimización completado');

  } catch (error) {
    console.error('❌ Error en optimización:', error.message);
  }
}

generarOptimizacionBD();