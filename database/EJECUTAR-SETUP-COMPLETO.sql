-- ========================================
-- SCRIPT MAESTRO: SETUP COMPLETO DE BASE DE DATOS PAUTAPRO
-- ========================================
-- Este script ejecuta todos los cambios necesarios en el orden correcto
-- Ejecutar en Supabase SQL Editor
-- Tiempo estimado: 5-10 minutos
-- ========================================

-- Habilitar mensajes de información
SET client_min_messages TO NOTICE;

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '🚀 INICIANDO SETUP COMPLETO DE PAUTAPRO';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE '========================================';
END $$;

-- ========================================
-- PASO 1: CORRECCIÓN DE INCONSISTENCIAS
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '📝 PASO 1/4: Corrigiendo inconsistencias de campos...';
END $$;

-- NOTA: Para correcciones de campos, ejecutar por separado:
-- database/migrations/001_corregir_inconsistencias_campos.sql

-- ========================================
-- PASO 2: TABLAS DE AUDITORÍA (PRIORIDAD ALTA)
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '📝 PASO 2/4: Creando tablas de auditoría...';
END $$;

BEGIN;

CREATE TABLE IF NOT EXISTS campaign_audit_log (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER,
    user_id INTEGER,
    action VARCHAR(50) NOT NULL,
    previous_state TEXT,
    new_state TEXT,
    changes TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_audit_log (
    id SERIAL PRIMARY KEY,
    order_id INTEGER,
    user_id INTEGER,
    action VARCHAR(50) NOT NULL,
    previous_state TEXT,
    new_state TEXT,
    changes TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_audit_log_campaign ON campaign_audit_log(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_audit_log_created ON campaign_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_order_audit_log_order ON order_audit_log(order_id);
CREATE INDEX IF NOT EXISTS idx_order_audit_log_created ON order_audit_log(created_at);

COMMIT;

DO $$
BEGIN
    RAISE NOTICE '✅ Tablas de auditoría creadas';
END $$;

-- ========================================
-- PASO 3: MÓDULO DE RENTABILIDAD (PRIORIDAD MEDIA)
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '📝 PASO 3/4: Creando módulo de rentabilidad...';
    RAISE NOTICE 'NOTA: Ejecutar por separado database/schemas/database-rentabilidad-schema.sql';
    RAISE NOTICE 'NOTA: Ejecutar por separado database/schemas/database-rentabilidad-views.sql';
END $$;

-- ========================================
-- PASO 4: SERVICIOS AVANZADOS (OPCIONALES)
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '📝 PASO 4/4: Creando servicios avanzados (opcional)...';
END $$;

BEGIN;

-- client_scoring
CREATE TABLE IF NOT EXISTS client_scoring (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER REFERENCES Clientes(id_cliente) ON DELETE CASCADE,
    score DECIMAL(5,2) DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    revenue_score DECIMAL(5,2) DEFAULT 0,
    loyalty_score DECIMAL(5,2) DEFAULT 0,
    quality_score DECIMAL(5,2) DEFAULT 0,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id_cliente)
);

-- client_interactions
CREATE TABLE IF NOT EXISTS client_interactions (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER REFERENCES Clientes(id_cliente) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(10) DEFAULT 'media',
    subject VARCHAR(255),
    notes TEXT,
    created_by INTEGER REFERENCES Usuarios(id_usuario),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- reminders
CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    type VARCHAR(50),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed BOOLEAN DEFAULT false,
    priority VARCHAR(10) DEFAULT 'media',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- configuracion_ia
CREATE TABLE IF NOT EXISTS configuracion_ia (
    id SERIAL PRIMARY KEY,
    parametro VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para servicios avanzados
CREATE INDEX IF NOT EXISTS idx_client_scoring_cliente ON client_scoring(id_cliente);
CREATE INDEX IF NOT EXISTS idx_client_interactions_cliente ON client_interactions(id_cliente);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due ON reminders(due_date);

COMMIT;

DO $$
BEGIN
    RAISE NOTICE '✅ Servicios avanzados creados (scoring, interactions, notifications, reminders, configuracion_ia)';
END $$;

-- ========================================
-- VERIFICACIÓN FINAL
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '🔍 Verificando instalación...';
END $$;

DO $$
DECLARE
    total_tablas INTEGER;
    tablas_core TEXT[] := ARRAY[
        'region', 'comunas', 'usuarios', 'perfiles', 'grupos',
        'agencias', 'clientes', 'proveedores', 'campania', 'productos',
        'medios', 'calidad', 'soportes', 'contratos', 'ordenesdepublicidad'
    ];
    tabla TEXT;
    existe BOOLEAN;
    contador INTEGER := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '🔍 VERIFICACIÓN DE TABLAS CORE';
    RAISE NOTICE '========================================';
    
    FOREACH tabla IN ARRAY tablas_core
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE LOWER(table_name) = LOWER(tabla)
            AND table_schema = 'public'
        ) INTO existe;
        
        IF existe THEN
            contador := contador + 1;
        ELSE
            RAISE WARNING '❌ FALTA: %', tabla;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ Tablas core verificadas: %/%', contador, array_length(tablas_core, 1);
    
    -- Contar total de tablas
    SELECT COUNT(*) INTO total_tablas
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
    
    RAISE NOTICE '📊 Total de tablas en base de datos: %', total_tablas;
    RAISE NOTICE '========================================';
END $$;

-- ========================================
-- RESUMEN FINAL
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SETUP COMPLETADO';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Próximos pasos:';
    RAISE NOTICE '1. Verificar en Supabase Dashboard que las tablas estén visibles';
    RAISE NOTICE '2. Configurar Row Level Security (RLS) según necesidades';
    RAISE NOTICE '3. Ejecutar scripts de seeds si se requieren datos de prueba';
    RAISE NOTICE '4. Reiniciar la aplicación para verificar conexiones';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📚 Documentación disponible en:';
    RAISE NOTICE '   - ANALISIS-SUPABASE-COMPLETO.md';
    RAISE NOTICE '   - database/README-IMPLEMENTACION-BD.md';
    RAISE NOTICE '========================================';
END $$;