-- ========================================
-- SETUP ULTRA SIMPLE - SIN FOREIGN KEYS
-- PautaPro - Compatible con cualquier esquema
-- ========================================

-- Solo crea las tablas básicas sin relaciones
-- Para evitar errores de foreign keys

-- ========================================
-- 1. AUDITORÍA
-- ========================================

CREATE TABLE IF NOT EXISTS campaign_audit_log (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER,
    user_id INTEGER,
    action VARCHAR(50) NOT NULL,
    previous_state TEXT,
    new_state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_audit_log (
    id SERIAL PRIMARY KEY,
    order_id INTEGER,
    user_id INTEGER,
    action VARCHAR(50) NOT NULL,
    previous_state TEXT,
    new_state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. SCORING Y CRM
-- ========================================

CREATE TABLE IF NOT EXISTS client_scoring (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER,
    score DECIMAL(5,2) DEFAULT 0,
    revenue_score DECIMAL(5,2) DEFAULT 0,
    loyalty_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_interactions (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER,
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(10) DEFAULT 'media',
    notes TEXT,
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. NOTIFICACIONES Y RECORDATORIOS
-- ========================================

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    type VARCHAR(50),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed BOOLEAN DEFAULT false,
    priority VARCHAR(10) DEFAULT 'media',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reminder_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    trigger_event VARCHAR(50),
    days_before INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. PREFERENCIAS Y CONFIGURACIÓN
-- ========================================

CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    notification_preferences TEXT,
    ui_preferences TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS configuracion_ia (
    id SERIAL PRIMARY KEY,
    parametro VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ÍNDICES BÁSICOS (solo en tablas propias)
-- ========================================

CREATE INDEX IF NOT EXISTS idx_campaign_audit_log_campaign ON campaign_audit_log(campaign_id);
CREATE INDEX IF NOT EXISTS idx_order_audit_log_order ON order_audit_log(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due ON reminders(due_date);

-- ========================================
-- MENSAJE FINAL
-- ========================================

DO $$
DECLARE
    total INTEGER;
BEGIN
    SELECT COUNT(*) INTO total
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'campaign_audit_log', 'order_audit_log', 'client_scoring',
        'client_interactions', 'notifications', 'reminders',
        'reminder_rules', 'user_preferences', 'configuracion_ia'
    );
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SETUP COMPLETADO EXITOSAMENTE';
    RAISE NOTICE 'Tablas creadas: %/9', total;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tablas disponibles:';
    RAISE NOTICE '  - campaign_audit_log';
    RAISE NOTICE '  - order_audit_log';
    RAISE NOTICE '  - client_scoring';
    RAISE NOTICE '  - client_interactions';
    RAISE NOTICE '  - notifications';
    RAISE NOTICE '  - reminders';
    RAISE NOTICE '  - reminder_rules';
    RAISE NOTICE '  - user_preferences';
    RAISE NOTICE '  - configuracion_ia';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Sistema listo para usar con funcionalidad avanzada';
    RAISE NOTICE '========================================';
END $$;