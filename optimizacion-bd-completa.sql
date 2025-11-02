
-- =====================================================
-- SCRIPT COMPLETO DE OPTIMIZACIÓN DE BASE DE DATOS
-- =====================================================
-- Ejecutar en orden: 1, 2, 3, 4, 5, 6

-- [1] CREAR TABLAS FALTANTES

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


-- [2] LIMPIAR COLUMNAS INNECESARIAS

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


-- [3] UNIFICAR IDS DUPLICADOS

-- Unificar IDs en tabla medios (eliminar id redundante)
-- Primero, actualizar referencias en otras tablas
UPDATE soportes SET id_medio = id WHERE id_medio IS NOT NULL;
UPDATE temas SET id_medio = id WHERE id_medio IS NOT NULL;

-- Eliminar columna duplicada
ALTER TABLE medios DROP COLUMN IF EXISTS id_medio;


-- [4] ESTANDARIZAR NOMBRES

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
