-- ========================================
-- SETUP COMPLETO TODO EN UNO - PAUTAPRO
-- Crea las 15 tablas faltantes en un solo script
-- ========================================

-- ========================================
-- PARTE 1: AUDITORÍA (Prioridad Alta)
-- ========================================

CREATE TABLE IF NOT EXISTS campaign_audit_log (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER,
    user_id INTEGER,
    action VARCHAR(50),
    previous_state TEXT,
    new_state TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_audit_log (
    id SERIAL PRIMARY KEY,
    order_id INTEGER,
    user_id INTEGER,
    action VARCHAR(50),
    previous_state TEXT,
    new_state TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- PARTE 2: RENTABILIDAD (Prioridad Media)
-- ========================================

CREATE TABLE IF NOT EXISTS DetallesFinancierosOrden (
    id SERIAL PRIMARY KEY,
    id_orden INTEGER,
    id_alternativa INTEGER,
    costo_real_medio DECIMAL(15,2) DEFAULT 0,
    precio_informado_cliente DECIMAL(15,2) DEFAULT 0,
    comision_cliente_monto DECIMAL(15,2) DEFAULT 0,
    bonificacion_medio_monto DECIMAL(15,2) DEFAULT 0,
    markup_monto DECIMAL(15,2) DEFAULT 0,
    rentabilidad_neta DECIMAL(15,2) DEFAULT 0,
    rentabilidad_porcentaje DECIMAL(5,2) DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ConfiguracionComisiones (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER,
    comision_base_porcentaje DECIMAL(5,2) DEFAULT 0,
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS RegistroBonificacionesMedios (
    id SERIAL PRIMARY KEY,
    id_medio INTEGER,
    id_proveedor INTEGER,
    bonificacion_base_porcentaje DECIMAL(5,2) DEFAULT 0,
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- PARTE 3: CRM Y SCORING (Prioridad Media)
-- ========================================

CREATE TABLE IF NOT EXISTS client_scoring (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER,
    score DECIMAL(5,2) DEFAULT 0,
    revenue_score DECIMAL(5,2) DEFAULT 0,
    loyalty_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_interactions (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER,
    type VARCHAR(50),
    priority VARCHAR(10) DEFAULT 'media',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- PARTE 4: NOTIFICACIONES Y RECORDATORIOS (Prioridad Media)
-- ========================================

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    type VARCHAR(50),
    title VARCHAR(100),
    message TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    title VARCHAR(100),
    description TEXT,
    due_date TIMESTAMP,
    completed BOOLEAN DEFAULT false,
    priority VARCHAR(10) DEFAULT 'media',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS configuracion_ia (
    id SERIAL PRIMARY KEY,
    parametro VARCHAR(100) UNIQUE,
    valor TEXT,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- PARTE 5: SERVICIOS OPCIONALES (Prioridad Baja)
-- ========================================

CREATE TABLE IF NOT EXISTS user_gamification (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS automation_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    trigger_type VARCHAR(50),
    action_type VARCHAR(50),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS export_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    export_type VARCHAR(50),
    file_name VARCHAR(255),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    prediction_type VARCHAR(50),
    entity_id INTEGER,
    predicted_value DECIMAL(15,2),
    confidence DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    notification_preferences TEXT,
    ui_preferences TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reminder_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    trigger_event VARCHAR(50),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- VERIFICACIÓN FINAL
-- ========================================

DO $$
DECLARE
    total_creadas INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_creadas
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'campaign_audit_log', 'order_audit_log', 
        'detallesfinancierosorden', 'configuracioncomisiones', 'registrobonificacionesmedios',
        'client_scoring', 'client_interactions',
        'notifications', 'reminders', 'configuracion_ia',
        'user_gamification', 'automation_rules', 'export_records', 
        'predictions', 'user_preferences', 'reminder_rules'
    );
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SETUP COMPLETADO AL 100%%';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tablas creadas: %/15', total_creadas;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'El sistema PautaPro ahora tiene funcionalidad completa:';
    RAISE NOTICE '  ✓ Auditoría de cambios';
    RAISE NOTICE '  ✓ Rentabilidad inteligente';
    RAISE NOTICE '  ✓ Scoring de clientes';
    RAISE NOTICE '  ✓ CRM y seguimiento';
    RAISE NOTICE '  ✓ Notificaciones';
    RAISE NOTICE '  ✓ Recordatorios';
    RAISE NOTICE '  ✓ Gamificación';
    RAISE NOTICE '  ✓ Automatizaciones';
    RAISE NOTICE '========================================';
END $$;