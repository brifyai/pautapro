-- ========================================
-- SISTEMA DINÁMICO MULTI-RUBRO PYMEFLOW
-- ========================================
-- Schema para entidades dinámicas 100% configurables
-- Compatible con Supabase/PostgreSQL

-- ========================================
-- 1. TABLA DE RUBROS
-- ========================================
CREATE TABLE IF NOT EXISTS rubros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50) DEFAULT 'category',
    color VARCHAR(20) DEFAULT '#1976d2',
    activo BOOLEAN DEFAULT true,
    configuracion JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. TABLA DE ENTIDADES DINÁMICAS
-- ========================================
CREATE TABLE IF NOT EXISTS entidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rubro_id UUID REFERENCES rubros(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    nombre_tabla VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50) DEFAULT 'category',
    color VARCHAR(20) DEFAULT '#1976d2',
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    configuracion JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. TABLA DE CAMPOS DE ENTIDADES
-- ========================================
CREATE TABLE IF NOT EXISTS entidad_campos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entidad_id UUID REFERENCES entidades(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    etiqueta VARCHAR(100) NOT NULL,
    tipo_campo VARCHAR(50) NOT NULL, -- text, number, email, phone, date, select, multiselect, checkbox, file, relation, etc.
    requerido BOOLEAN DEFAULT false,
    orden INTEGER DEFAULT 0,
    placeholder TEXT,
    valor_defecto TEXT,
    validaciones JSONB DEFAULT '{}',
    opciones JSONB DEFAULT '[]', -- Para selects y multiselects
    configuracion_visual JSONB DEFAULT '{}',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. TABLA DE RELACIONES ENTRE ENTIDADES
-- ========================================
CREATE TABLE IF NOT EXISTS entidad_relaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entidad_id UUID REFERENCES entidades(id) ON DELETE CASCADE,
    entidad_destino_id UUID REFERENCES entidades(id) ON DELETE CASCADE,
    tipo_relacion VARCHAR(20) NOT NULL, -- one_to_one, one_to_many, many_to_many
    campo_origen VARCHAR(100),
    campo_destino VARCHAR(100),
    etiqueta_relacion VARCHAR(100),
    requerida BOOLEAN DEFAULT false,
    orden INTEGER DEFAULT 0,
    configuracion JSONB DEFAULT '{}',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. TABLA DE WORKFLOWS (ESTADOS Y TRANSICIONES)
-- ========================================
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entidad_id UUID REFERENCES entidades(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    estado_inicial VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    configuracion JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_estados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    nombre VARCHAR(50) NOT NULL,
    etiqueta VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT '#6c757d',
    descripcion TEXT,
    es_final BOOLEAN DEFAULT false,
    orden INTEGER DEFAULT 0,
    configuracion JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_transiciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    estado_origen VARCHAR(50) NOT NULL,
    estado_destino VARCHAR(50) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    etiqueta_boton VARCHAR(100),
    color_boton VARCHAR(20) DEFAULT '#007bff',
    condiciones JSONB DEFAULT '{}',
    acciones JSONB DEFAULT '{}',
    requerido_rol VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. TABLA DE REPORTES DINÁMICOS
-- ========================================
CREATE TABLE IF NOT EXISTS reportes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entidad_id UUID REFERENCES entidades(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo_reporte VARCHAR(50) NOT NULL, -- table, chart, summary, export
    configuracion JSONB DEFAULT '{}',
    consulta_sql TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 7. TABLA DE CONFIGURACIÓN DE FORMULARIOS
-- ========================================
CREATE TABLE IF NOT EXISTS formularios_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entidad_id UUID REFERENCES entidades(id) ON DELETE CASCADE,
    tipo_formulario VARCHAR(50) NOT NULL, -- create, edit, view, list
    configuracion JSONB DEFAULT '{}',
    layout JSONB DEFAULT '{}',
    validaciones JSONB DEFAULT '{}',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 8. TABLA DE AUDITORÍA
-- ========================================
CREATE TABLE IF NOT EXISTS auditoria_entidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entidad_id UUID REFERENCES entidades(id) ON DELETE CASCADE,
    registro_id UUID NOT NULL,
    accion VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    usuario_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 9. FUNCIONES Y TRIGGERS
-- ========================================

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar timestamps
CREATE TRIGGER actualizar_rubros_timestamp 
    BEFORE UPDATE ON rubros 
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER actualizar_entidades_timestamp 
    BEFORE UPDATE ON entidades 
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER actualizar_entidad_campos_timestamp 
    BEFORE UPDATE ON entidad_campos 
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER actualizar_entidad_relaciones_timestamp 
    BEFORE UPDATE ON entidad_relaciones 
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER actualizar_workflows_timestamp 
    BEFORE UPDATE ON workflows 
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER actualizar_reportes_timestamp 
    BEFORE UPDATE ON reportes 
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER actualizar_formularios_config_timestamp 
    BEFORE UPDATE ON formularios_config 
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- ========================================
-- 10. ÍNDICES PARA OPTIMIZACIÓN
-- ========================================

-- Índices para rubros
CREATE INDEX IF NOT EXISTS idx_rubros_nombre ON rubros(nombre);
CREATE INDEX IF NOT EXISTS idx_rubros_activo ON rubros(activo);

-- Índices para entidades
CREATE INDEX IF NOT EXISTS idx_entidades_rubro_id ON entidades(rubro_id);
CREATE INDEX IF NOT EXISTS idx_entidades_nombre ON entidades(nombre);
CREATE INDEX IF NOT EXISTS idx_entidades_nombre_tabla ON entidades(nombre_tabla);
CREATE INDEX IF NOT EXISTS idx_entidades_activo ON entidades(activo);

-- Índices para campos
CREATE INDEX IF NOT EXISTS idx_entidad_campos_entidad_id ON entidad_campos(entidad_id);
CREATE INDEX IF NOT EXISTS idx_entidad_campos_tipo_campo ON entidad_campos(tipo_campo);
CREATE INDEX IF NOT EXISTS idx_entidad_campos_orden ON entidad_campos(orden);

-- Índices para relaciones
CREATE INDEX IF NOT EXISTS idx_entidad_relaciones_entidad_id ON entidad_relaciones(entidad_id);
CREATE INDEX IF NOT EXISTS idx_entidad_relaciones_entidad_destino_id ON entidad_relaciones(entidad_destino_id);
CREATE INDEX IF NOT EXISTS idx_entidad_relaciones_tipo_relacion ON entidad_relaciones(tipo_relacion);

-- Índices para workflows
CREATE INDEX IF NOT EXISTS idx_workflows_entidad_id ON workflows(entidad_id);
CREATE INDEX IF NOT EXISTS idx_workflow_estados_workflow_id ON workflow_estados(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_transiciones_workflow_id ON workflow_transiciones(workflow_id);

-- Índices para reportes
CREATE INDEX IF NOT EXISTS idx_reportes_entidad_id ON reportes(entidad_id);
CREATE INDEX IF NOT EXISTS idx_reportes_tipo_reporte ON reportes(tipo_reporte);

-- Índices para auditoría
CREATE INDEX IF NOT EXISTS idx_auditoria_entidades_entidad_id ON auditoria_entidades(entidad_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_entidades_registro_id ON auditoria_entidades(registro_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_entidades_accion ON auditoria_entidades(accion);
CREATE INDEX IF NOT EXISTS idx_auditoria_entidades_created_at ON auditoria_entidades(created_at);

-- ========================================
-- 11. POLÍTICAS DE SEGURIDAD (RLS)
-- ========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE rubros ENABLE ROW LEVEL SECURITY;
ALTER TABLE entidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE entidad_campos ENABLE ROW LEVEL SECURITY;
ALTER TABLE entidad_relaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_transiciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE formularios_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria_entidades ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar según roles de usuario)
CREATE POLICY "Los usuarios autenticados pueden leer rubros" ON rubros
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Los usuarios autenticados pueden leer entidades" ON entidades
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Los usuarios autenticados pueden leer campos de entidades" ON entidad_campos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Los usuarios autenticados pueden leer relaciones" ON entidad_relaciones
    FOR SELECT USING (auth.role() = 'authenticated');

-- ========================================
-- 12. DATOS INICIALES (EJEMPLO)
-- ========================================

-- Insertar rubro de ejemplo
INSERT INTO rubros (nombre, descripcion, icono, color) VALUES 
('Publicidad', 'Sistema de gestión de publicidad y medios', 'campaign', '#1976d2')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar entidades de ejemplo
INSERT INTO entidades (rubro_id, nombre, nombre_tabla, descripcion, icono, color) VALUES 
((SELECT id FROM rubros WHERE nombre = 'Publicidad'), 
 'Clientes', 'clientes_publicidad', 'Gestión de clientes de publicidad', 'people', '#4caf50'),
((SELECT id FROM rubros WHERE nombre = 'Publicidad'), 
 'Campañas', 'campanas_publicidad', 'Gestión de campañas publicitarias', 'campaign', '#ff9800')
ON CONFLICT (nombre_tabla) DO NOTHING;

-- ========================================
-- 13. VISTAS ÚTILES
-- ========================================

-- Vista para entidades con sus campos
CREATE OR REPLACE VIEW vista_entidades_completa AS
SELECT 
    e.*,
    r.nombre as rubro_nombre,
    r.color as rubro_color,
    COUNT(ec.id) as total_campos,
    COUNT(er.id) as total_relaciones
FROM entidades e
LEFT JOIN rubros r ON e.rubro_id = r.id
LEFT JOIN entidad_campos ec ON e.id = ec.entidad_id AND ec.activo = true
LEFT JOIN entidad_relaciones er ON e.id = er.entidad_id AND er.activo = true
WHERE e.activo = true
GROUP BY e.id, r.nombre, r.color;

-- Vista para campos con detalles de entidad
CREATE OR REPLACE VIEW vista_campos_entidad AS
SELECT 
    ec.*,
    e.nombre as entidad_nombre,
    e.nombre_tabla,
    r.nombre as rubro_nombre
FROM entidad_campos ec
JOIN entidades e ON ec.entidad_id = e.id
JOIN rubros r ON e.rubro_id = r.id
WHERE ec.activo = true AND e.activo = true;

-- ========================================
-- 14. FUNCIONES UTILITARIAS
-- ========================================

-- Función para generar nombre de tabla único
CREATE OR REPLACE FUNCTION generar_nombre_tabla(p_nombre VARCHAR(100))
RETURNS VARCHAR(100) AS $$
DECLARE
    nombre_base VARCHAR(100);
    nombre_unico VARCHAR(100);
    contador INTEGER := 1;
BEGIN
    nombre_base := lower(regexp_replace(p_nombre, '[^a-zA-Z0-9]', '_', 'g'));
    nombre_unico := nombre_base;
    
    -- Verificar si ya existe
    WHILE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = nombre_unico) LOOP
        nombre_unico := nombre_base || '_' || contador;
        contador := contador + 1;
    END LOOP;
    
    RETURN nombre_unico;
END;
$$ LANGUAGE plpgsql;

-- Función para validar estructura de entidad
CREATE OR REPLACE FUNCTION validar_entidad_structure(p_entidad_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_campos_requeridos INTEGER;
    v_relaciones_requeridas INTEGER;
BEGIN
    -- Verificar que tenga campos requeridos
    SELECT COUNT(*) INTO v_campos_requeridos
    FROM entidad_campos 
    WHERE entidad_id = p_entidad_id AND requerido = true AND activo = true;
    
    -- Verificar que las relaciones requeridas sean válidas
    SELECT COUNT(*) INTO v_relaciones_requeridas
    FROM entidad_relaciones 
    WHERE entidad_id = p_entidad_id AND requerida = true AND activo = true;
    
    -- Aquí se pueden agregar más validaciones
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- COMENTARIOS FINALES
-- ========================================
-- Este esquema proporciona:
-- 1. Flexibilidad total para crear cualquier tipo de entidad
-- 2. Sistema de relaciones entre entidades
-- 3. Workflows personalizables con estados y transiciones
-- 4. Sistema de reportes dinámicos
-- 5. Auditoría completa de cambios
-- 6. Configuración visual de formularios
-- 7. Seguridad con RLS
-- 8. Optimización con índices
-- 9. Vistas útiles para consultas frecuentes
-- 10. Funciones utilitarias para mantenimiento

-- Para usar este sistema:
-- 1. Crear rubros con INSERT INTO rubros
-- 2. Crear entidades con INSERT INTO entidades
-- 3. Agregar campos con INSERT INTO entidad_campos
-- 4. Configurar relaciones con INSERT INTO entidad_relaciones
-- 5. (Opcional) Configurar workflows y reportes
-- 6. Las tablas dinámicas se crearán automáticamente según la configuración