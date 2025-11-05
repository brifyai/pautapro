-- ========================================
-- SETUP MÍNIMO - SOLO TABLAS INDEPENDIENTES
-- Sin foreign keys, sin índices complejos
-- ========================================

-- AUDITORÍA
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

-- SCORING
CREATE TABLE IF NOT EXISTS client_scoring (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER,
    score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- INTERACTIONS
CREATE TABLE IF NOT EXISTS client_interactions (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER,
    type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    title VARCHAR(100),
    message TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- REMINDERS
CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    title VARCHAR(100),
    due_date TIMESTAMP,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- CONFIGURACIÓN
CREATE TABLE IF NOT EXISTS configuracion_ia (
    id SERIAL PRIMARY KEY,
    parametro VARCHAR(100) UNIQUE,
    valor TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- MENSAJE
DO $$
BEGIN
    RAISE NOTICE '✅ 7 tablas creadas exitosamente';
END $$;