-- ========================================
-- SETUP SIMPLIFICADO - SOLO TABLAS CRÍTICAS
-- PautaPro - Supabase
-- ========================================

-- Este script solo crea las tablas más críticas
-- Sin mensajes complejos, solo SQL puro

-- ========================================
-- 1. TABLAS DE AUDITORÍA (CRÍTICAS)
-- ========================================

CREATE TABLE IF NOT EXISTS campaign_audit_log (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER,
    user_id INTEGER,
    action VARCHAR(50) NOT NULL,
    previous_state TEXT,
    new_state TEXT,
    changes TEXT,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_audit_log_campaign ON campaign_audit_log(campaign_id);
CREATE INDEX IF NOT EXISTS idx_order_audit_log_order ON order_audit_log(order_id);

-- ========================================
-- 2. CLIENT SCORING (IMPORTANTE)
-- ========================================

CREATE TABLE IF NOT EXISTS client_scoring (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER REFERENCES Clientes(id_cliente) ON DELETE CASCADE,
    score DECIMAL(5,2) DEFAULT 0,
    revenue_score DECIMAL(5,2) DEFAULT 0,
    loyalty_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id_cliente)
);

CREATE INDEX IF NOT EXISTS idx_client_scoring_cliente ON client_scoring(id_cliente);

-- ========================================
-- 3. CLIENT INTERACTIONS (CRM BÁSICO)
-- ========================================

CREATE TABLE IF NOT EXISTS client_interactions (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER REFERENCES Clientes(id_cliente) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(10) DEFAULT 'media',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_interactions_cliente ON client_interactions(id_cliente);

-- ========================================
-- 4. NOTIFICATIONS (SISTEMA DE NOTIFICACIONES)
-- ========================================

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ========================================
-- 5. REMINDERS (RECORDATORIOS)
-- ========================================

CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed BOOLEAN DEFAULT false,
    priority VARCHAR(10) DEFAULT 'media',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due ON reminders(due_date);

-- ========================================
-- 6. CONFIGURACIÓN IA
-- ========================================

CREATE TABLE IF NOT EXISTS configuracion_ia (
    id SERIAL PRIMARY KEY,
    parametro VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 7. REMINDERS RULES (REGLAS DE RECORDATORIOS)
-- ========================================

CREATE TABLE IF NOT EXISTS reminder_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    trigger_event VARCHAR(50),
    days_before INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 8. USER PREFERENCES (PREFERENCIAS)
-- ========================================

CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Usuarios(id_usuario) ON DELETE CASCADE UNIQUE,
    notification_preferences TEXT,
    ui_preferences TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- ========================================
-- VERIFICACIÓN Y MENSAJE FINAL
-- ========================================

DO $$
DECLARE
    total_creadas INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_creadas
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'campaign_audit_log', 'order_audit_log', 'client_scoring',
        'client_interactions', 'notifications', 'reminders',
        'configuracion_ia', 'reminder_rules', 'user_preferences'
    );
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SETUP COMPLETADO EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tablas críticas verificadas: %/9', total_creadas;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tablas creadas:';
    RAISE NOTICE '  ✓ campaign_audit_log (auditoría campañas)';
    RAISE NOTICE '  ✓ order_audit_log (auditoría órdenes)';
    RAISE NOTICE '  ✓ client_scoring (scoring clientes)';
    RAISE NOTICE '  ✓ client_interactions (CRM)';
    RAISE NOTICE '  ✓ notifications (notificaciones)';
    RAISE NOTICE '  ✓ reminders (recordatorios)';
    RAISE NOTICE '  ✓ configuracion_ia (configuración IA)';
    RAISE NOTICE '  ✓ reminder_rules (reglas recordatorios)';
    RAISE NOTICE '  ✓ user_preferences (preferencias usuario)';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Para funcionalidad 100% ejecutar también:';
    RAISE NOTICE '  - database/schemas/database-rentabilidad-schema.sql';
    RAISE NOTICE '  - database/schemas/database-rentabilidad-views.sql';
    RAISE NOTICE '========================================';
END $$;