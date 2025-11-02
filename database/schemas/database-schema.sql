-- ========================================
-- Sistema de Órdenes - Esquema de Base de Datos
-- ========================================

-- Tablas de Catálogos y Configuración
-- ========================================

-- Regiones
CREATE TABLE IF NOT EXISTS Region (
    id SERIAL PRIMARY KEY,
    nombreRegion VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comunas
CREATE TABLE IF NOT EXISTS Comunas (
    id SERIAL PRIMARY KEY,
    nombreComuna VARCHAR(100) NOT NULL,
    id_region INTEGER REFERENCES Region(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tipos de Cliente
CREATE TABLE IF NOT EXISTS TipoCliente (
    id SERIAL PRIMARY KEY,
    nombreTipoCliente VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grupos
CREATE TABLE IF NOT EXISTS Grupos (
    id_grupo SERIAL PRIMARY KEY,
    nombre_grupo VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Perfiles
CREATE TABLE IF NOT EXISTS Perfiles (
    id SERIAL PRIMARY KEY,
    NombrePerfil VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medios
CREATE TABLE IF NOT EXISTS Medios (
    id SERIAL PRIMARY KEY,
    nombredelmedio VARCHAR(100) NOT NULL UNIQUE,
    codigo VARCHAR(50),
    duracion BOOLEAN DEFAULT false,
    color BOOLEAN DEFAULT false,
    codigo_megatime BOOLEAN DEFAULT false,
    calidad BOOLEAN DEFAULT false,
    cooperado BOOLEAN DEFAULT false,
    rubro BOOLEAN DEFAULT false,
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calidad
CREATE TABLE IF NOT EXISTS Calidad (
    id SERIAL PRIMARY KEY,
    NombreCalidad VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forma de Pago
CREATE TABLE IF NOT EXISTS FormaDePago (
    id SERIAL PRIMARY KEY,
    NombreFormadePago VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tipo Generación de Orden
CREATE TABLE IF NOT EXISTS TipoGeneracionDeOrden (
    id SERIAL PRIMARY KEY,
    NombreTipoOrden VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Años
CREATE TABLE IF NOT EXISTS Anios (
    id SERIAL PRIMARY KEY,
    years INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meses
CREATE TABLE IF NOT EXISTS Meses (
    Id SERIAL PRIMARY KEY,
    Nombre VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla Formato
CREATE TABLE IF NOT EXISTS TablaFormato (
    id SERIAL PRIMARY KEY,
    nombreFormato VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tablas Principales del Sistema
-- ========================================

-- Usuarios
CREATE TABLE IF NOT EXISTS Usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id SERIAL UNIQUE, -- Para compatibilidad con referencias existentes
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    id_perfil INTEGER REFERENCES Perfiles(id),
    id_grupo INTEGER REFERENCES Grupos(id_grupo),
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agencias
CREATE TABLE IF NOT EXISTS Agencias (
    id SERIAL PRIMARY KEY,
    NombreIdentificador VARCHAR(100) NOT NULL,
    NombreDeFantasia VARCHAR(100),
    RUT VARCHAR(20),
    Direccion VARCHAR(200),
    id_region INTEGER REFERENCES Region(id),
    id_comuna INTEGER REFERENCES Comunas(id),
    Telefono VARCHAR(20),
    Email VARCHAR(100),
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clientes
CREATE TABLE IF NOT EXISTS Clientes (
    id_cliente SERIAL PRIMARY KEY,
    nombreCliente VARCHAR(100) NOT NULL,
    RUT VARCHAR(20),
    razonSocial VARCHAR(100),
    Direccion VARCHAR(200),
    id_region INTEGER REFERENCES Region(id),
    id_comuna INTEGER REFERENCES Comunas(id),
    Telefono VARCHAR(20),
    Email VARCHAR(100),
    id_tipo_cliente INTEGER REFERENCES TipoCliente(id),
    id_grupo INTEGER REFERENCES Grupos(id_grupo),
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proveedores
CREATE TABLE IF NOT EXISTS Proveedores (
    id_proveedor SERIAL PRIMARY KEY,
    nombreProveedor VARCHAR(100) NOT NULL,
    RUT VARCHAR(20),
    razonSocial VARCHAR(100),
    Direccion VARCHAR(200),
    id_region INTEGER REFERENCES Region(id),
    id_comuna INTEGER REFERENCES Comunas(id),
    Telefono VARCHAR(20),
    Email VARCHAR(100),
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Soportes
CREATE TABLE IF NOT EXISTS Soportes (
    id_soporte SERIAL PRIMARY KEY,
    nombreidentificador VARCHAR(100) NOT NULL,
    bonificacionano DECIMAL(5,2) DEFAULT 0,
    escala DECIMAL(5,2) DEFAULT 0,
    descripcion TEXT,
    estado BOOLEAN DEFAULT true,
    c_orden BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tablas de Relación
-- ========================================

-- proveedor_soporte (Relación entre Proveedores y Soportes)
CREATE TABLE IF NOT EXISTS proveedor_soporte (
    id SERIAL PRIMARY KEY,
    id_proveedor INTEGER REFERENCES Proveedores(id_proveedor),
    id_soporte INTEGER REFERENCES Soportes(id_soporte),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id_proveedor, id_soporte)
);

-- soporte_medios (Relación entre Soportes y Medios)
CREATE TABLE IF NOT EXISTS soporte_medios (
    id SERIAL PRIMARY KEY,
    id_soporte INTEGER REFERENCES Soportes(id_soporte),
    id_medio INTEGER REFERENCES Medios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id_soporte, id_medio)
);

-- Productos
CREATE TABLE IF NOT EXISTS Productos (
    id SERIAL PRIMARY KEY,
    NombreDelProducto VARCHAR(100) NOT NULL,
    Id_Cliente INTEGER REFERENCES Clientes(id_cliente),
    Estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contratos
CREATE TABLE IF NOT EXISTS Contratos (
    id SERIAL PRIMARY KEY,
    IdMedios INTEGER REFERENCES Medios(id),
    id_proveedor INTEGER REFERENCES Proveedores(id_proveedor),
    id_cliente INTEGER REFERENCES Clientes(id_cliente),
    id_forma_pago INTEGER REFERENCES FormaDePago(id),
    id_tipo_orden INTEGER REFERENCES TipoGeneracionDeOrden(id),
    numero_contrato VARCHAR(50),
    descripcion TEXT,
    monto DECIMAL(15,2),
    fecha_inicio DATE,
    fecha_fin DATE,
    estado BOOLEAN DEFAULT true,
    c_orden BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programas
CREATE TABLE IF NOT EXISTS Programas (
    id SERIAL PRIMARY KEY,
    id_soporte INTEGER REFERENCES Soportes(id_soporte),
    nombre_programa VARCHAR(100),
    cod_prog_megatime VARCHAR(50),
    descripcion TEXT,
    duracion INTEGER,
    costo DECIMAL(15,2),
    estado BOOLEAN DEFAULT true,
    c_orden BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- programa_medios (Relación entre Programas y Medios)
CREATE TABLE IF NOT EXISTS programa_medios (
    id SERIAL PRIMARY KEY,
    id_programa INTEGER REFERENCES Programas(id),
    id_medio INTEGER REFERENCES Medios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id_programa, id_medio)
);

-- Clasificación
CREATE TABLE IF NOT EXISTS Clasificacion (
    id SERIAL PRIMARY KEY,
    id_medio INTEGER REFERENCES Medios(id),
    id_contrato INTEGER REFERENCES Contratos(id),
    nombre_clasificacion VARCHAR(100),
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campañas
CREATE TABLE IF NOT EXISTS Campania (
    id_campania SERIAL PRIMARY KEY,
    NombreCampania VARCHAR(100) NOT NULL,
    id_Cliente INTEGER REFERENCES Clientes(id_cliente),
    id_Agencia INTEGER REFERENCES Agencias(id),
    id_producto INTEGER REFERENCES Productos(id),
    id_anio INTEGER REFERENCES Anios(id),
    Presupuesto DECIMAL(15,2),
    descripcion TEXT,
    estado BOOLEAN DEFAULT true,
    c_orden BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Temas
CREATE TABLE IF NOT EXISTS Temas (
    id_tema SERIAL PRIMARY KEY,
    nombre_tema VARCHAR(100) NOT NULL,
    id_medio INTEGER REFERENCES Medios(id),
    id_calidad INTEGER REFERENCES Calidad(id),
    descripcion TEXT,
    estado BOOLEAN DEFAULT true,
    c_orden BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- campania_temas (Relación entre Campañas y Temas)
CREATE TABLE IF NOT EXISTS campania_temas (
    id SERIAL PRIMARY KEY,
    id_campania INTEGER REFERENCES Campania(id_campania),
    id_temas INTEGER REFERENCES Temas(id_tema),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id_campania, id_temas)
);

-- Planes
CREATE TABLE IF NOT EXISTS plan (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER REFERENCES Clientes(id_cliente),
    id_campania INTEGER REFERENCES Campania(id_campania),
    anio INTEGER REFERENCES Anios(years),
    mes INTEGER REFERENCES Meses(Id),
    nombre_plan VARCHAR(100),
    descripcion TEXT,
    presupuesto DECIMAL(15,2),
    estado BOOLEAN DEFAULT true,
    estado2 VARCHAR(20) DEFAULT 'activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- campana_planes (Relación entre Campañas y Planes)
CREATE TABLE IF NOT EXISTS campana_planes (
    id SERIAL PRIMARY KEY,
    id_campania INTEGER REFERENCES Campania(id_campania),
    id_plan INTEGER REFERENCES plan(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id_campania, id_plan)
);

-- Alternativas
CREATE TABLE IF NOT EXISTS alternativa (
    id SERIAL PRIMARY KEY,
    id_soporte INTEGER REFERENCES Soportes(id_soporte),
    id_programa INTEGER REFERENCES Programas(id),
    id_contrato INTEGER REFERENCES Contratos(id),
    id_tema INTEGER REFERENCES Temas(id_tema),
    id_clasificacion INTEGER REFERENCES Clasificacion(id),
    numerorden INTEGER,
    descripcion TEXT,
    costo DECIMAL(15,2),
    duracion INTEGER,
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- plan_alternativas (Relación entre Planes y Alternativas)
CREATE TABLE IF NOT EXISTS plan_alternativas (
    id SERIAL PRIMARY KEY,
    id_plan INTEGER REFERENCES plan(id),
    id_alternativa INTEGER REFERENCES alternativa(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id_plan, id_alternativa)
);

-- Órdenes de Publicidad
CREATE TABLE IF NOT EXISTS OrdenesDePublicidad (
    id_ordenes_de_comprar SERIAL PRIMARY KEY,
    numero_correlativo INTEGER UNIQUE,
    id_cliente INTEGER REFERENCES Clientes(id_cliente),
    id_campania INTEGER REFERENCES Campania(id_campania),
    id_plan INTEGER REFERENCES plan(id),
    alternativas_plan_orden TEXT, -- JSON con IDs de alternativas
    alternativaActual INTEGER REFERENCES alternativa(id),
    fecha_orden DATE,
    fecha_ejecucion DATE,
    monto_total DECIMAL(15,2),
    estado VARCHAR(20) DEFAULT 'pendiente',
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Facturas
CREATE TABLE IF NOT EXISTS Facturas (
    id SERIAL PRIMARY KEY,
    id_campania INTEGER REFERENCES Campania(id_campania),
    numero_factura VARCHAR(50) UNIQUE,
    fecha_emision DATE,
    fecha_vencimiento DATE,
    monto DECIMAL(15,2),
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comisiones
CREATE TABLE IF NOT EXISTS Comisiones (
    id_comision SERIAL PRIMARY KEY,
    id_cliente INTEGER REFERENCES Clientes(id_cliente),
    porcentaje DECIMAL(5,2),
    monto_fijo DECIMAL(15,2),
    tipo_comision VARCHAR(20), -- 'porcentual' o 'fijo'
    descripcion TEXT,
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contactos de Clientes
CREATE TABLE IF NOT EXISTS contactocliente (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER REFERENCES Clientes(id_cliente),
    nombre_contacto VARCHAR(100) NOT NULL,
    cargo VARCHAR(50),
    telefono VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contactos de Proveedores
CREATE TABLE IF NOT EXISTS contactos (
    id SERIAL PRIMARY KEY,
    id_proveedor INTEGER REFERENCES Proveedores(id_proveedor),
    nombre_contacto VARCHAR(100) NOT NULL,
    cargo VARCHAR(50),
    telefono VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Otros Datos de Clientes
CREATE TABLE IF NOT EXISTS OtrosDatos (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER REFERENCES Clientes(id_cliente),
    tipo_dato VARCHAR(50),
    valor_dato TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mensajes/Avisos
CREATE TABLE IF NOT EXISTS aviso (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(20) DEFAULT 'informativo', -- 'informativo', 'alerta', 'error'
    fecha_inicio DATE,
    fecha_fin DATE,
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- Índices para mejorar el rendimiento
-- ========================================

-- Índices para tablas principales
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON Usuarios(email);
CREATE INDEX IF NOT EXISTS idx_clientes_rut ON Clientes(RUT);
CREATE INDEX IF NOT EXISTS idx_proveedores_rut ON Proveedores(RUT);
CREATE INDEX IF NOT EXISTS idx_campanias_cliente ON Campania(id_Cliente);
CREATE INDEX IF NOT EXISTS idx_ordenes_cliente ON OrdenesDePublicidad(id_cliente);
CREATE INDEX IF NOT EXISTS idx_ordenes_campania ON OrdenesDePublicidad(id_campania);
CREATE INDEX IF NOT EXISTS idx_alternativas_soporte ON alternativa(id_soporte);
CREATE INDEX IF NOT EXISTS idx_alternativas_programa ON alternativa(id_programa);

-- Índices para tablas de relación
CREATE INDEX IF NOT EXISTS idx_proveedor_soporte_proveedor ON proveedor_soporte(id_proveedor);
CREATE INDEX IF NOT EXISTS idx_proveedor_soporte_soporte ON proveedor_soporte(id_soporte);
CREATE INDEX IF NOT EXISTS idx_soporte_medios_soporte ON soporte_medios(id_soporte);
CREATE INDEX IF NOT EXISTS idx_soporte_medios_medio ON soporte_medios(id_medio);
CREATE INDEX IF NOT EXISTS idx_campania_temas_campania ON campania_temas(id_campania);
CREATE INDEX IF NOT EXISTS idx_campania_temas_tema ON campania_temas(id_temas);
CREATE INDEX IF NOT EXISTS idx_plan_alternativas_plan ON plan_alternativas(id_plan);
CREATE INDEX IF NOT EXISTS idx_plan_alternativas_alternativa ON plan_alternativas(id_alternativa);

-- ========================================
-- Restricciones adicionales
-- ========================================

-- Asegurar que los campos de estado tengan valores válidos
-- Nota: Las restricciones ya están definidas en las tablas, no es necesario agregarlas nuevamente
-- ALTER TABLE Clientes ADD CONSTRAINT IF NOT EXISTS chk_clientes_estado CHECK (estado IN (true, false));
-- ALTER TABLE Proveedores ADD CONSTRAINT IF NOT EXISTS chk_proveedores_estado CHECK (estado IN (true, false));
-- ALTER TABLE Agencias ADD CONSTRAINT IF NOT EXISTS chk_agencias_estado CHECK (estado IN (true, false));
-- ALTER TABLE Medios ADD CONSTRAINT IF NOT EXISTS chk_medios_estado CHECK (Estado IN (true, false));
-- ALTER TABLE Campania ADD CONSTRAINT IF NOT EXISTS chk_campania_estado CHECK (estado IN (true, false));
-- ALTER TABLE OrdenesDePublicidad ADD CONSTRAINT IF NOT EXISTS chk_ordenes_estado CHECK (estado IN ('pendiente', 'aprobada', 'ejecutada', 'anulada', 'facturada'));

-- ========================================
-- Comentarios descriptivos
-- ========================================

COMMENT ON TABLE Region IS 'Catálogo de regiones geográficas';
COMMENT ON TABLE Comunas IS 'Catálogo de comunas por región';
COMMENT ON TABLE Usuarios IS 'Usuarios del sistema con perfiles y grupos';
COMMENT ON TABLE Clientes IS 'Clientes de la agencia de publicidad';
COMMENT ON TABLE Proveedores IS 'Proveedores de medios y servicios';
COMMENT ON TABLE Agencias IS 'Agencias de publicidad asociadas';
COMMENT ON TABLE Campania IS 'Campañas publicitarias por cliente';
COMMENT ON TABLE OrdenesDePublicidad IS 'Órdenes de publicidad generadas';
COMMENT ON TABLE alternativa IS 'Alternativas de medios para planes';
COMMENT ON TABLE plan IS 'Planes de medios por campaña';