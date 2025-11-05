-- ========================================
-- SCRIPT COMPLETO PARA CREAR TABLAS FALTANTES EN SUPABASE
-- Sistema: PautaPro
-- Fecha: 2025-01-04
-- ========================================

-- IMPORTANTE: Ejecutar este script en Supabase SQL Editor
-- Este script crea todas las tablas que el sistema requiere pero que podrían no existir

BEGIN;

-- ========================================
-- 1. TABLAS DE AUDITORÍA (PRIORIDAD ALTA)
-- ========================================

-- Auditoría de Campañas
CREATE TABLE IF NOT EXISTS campaign_audit_log (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER,
    user_id INTEGER REFERENCES Usuarios(id_usuario),
    action VARCHAR(50) NOT NULL,
    previous_state TEXT,
    new_state TEXT,
    changes TEXT, -- JSON con cambios específicos
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auditoría de Órdenes
CREATE TABLE IF NOT EXISTS order_audit_log (
    id SERIAL PRIMARY KEY,
    order_id INTEGER,
    user_id INTEGER REFERENCES Usuarios(id_usuario),
    action VARCHAR(50) NOT NULL,
    previous_state TEXT,
    new_state TEXT,
    changes TEXT, -- JSON con cambios específicos
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para auditoría
CREATE INDEX IF NOT EXISTS idx_campaign_audit_log_campaign ON campaign_audit_log(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_audit_log_action ON campaign_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_campaign_audit_log_created ON campaign_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_order_audit_log_order ON order_audit_log(order_id);
CREATE INDEX IF NOT EXISTS idx_order_audit_log_action ON order_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_order_audit_log_created ON order_audit_log(created_at);

-- ========================================
-- 2. TABLAS DE SCORING Y TRACKING (PRIORIDAD MEDIA)
-- ========================================

-- Client Scoring
CREATE TABLE IF NOT EXISTS client_scoring (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER REFERENCES Clientes(id_cliente) ON DELETE CASCADE,
    score DECIMAL(5,2) DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    revenue_score DECIMAL(5,2) DEFAULT 0,
    loyalty_score DECIMAL(5,2) DEFAULT 0,
    quality_score DECIMAL(5,2) DEFAULT 0,
    engagement_score DECIMAL(5,2) DEFAULT 0,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id_cliente)
);

-- Client Interactions
CREATE TABLE IF NOT EXISTS client_interactions (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER REFERENCES Clientes(id_cliente) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'email', 'call', 'meeting', 'note'
    priority VARCHAR(10) DEFAULT 'media', -- 'baja', 'media', 'alta', 'urgente'
    subject VARCHAR(255),
    notes TEXT,
    interaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES Usuarios(id_usuario),
    status VARCHAR(20) DEFAULT 'pendiente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para client scoring y tracking
CREATE INDEX IF NOT EXISTS idx_client_scoring_cliente ON client_scoring(id_cliente);
CREATE INDEX IF NOT EXISTS idx_client_scoring_score ON client_scoring(score DESC);
CREATE INDEX IF NOT EXISTS idx_client_interactions_cliente ON client_interactions(id_cliente);
CREATE INDEX IF NOT EXISTS idx_client_interactions_type ON client_interactions(type);
CREATE INDEX IF NOT EXISTS idx_client_interactions_date ON client_interactions(interaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_client_interactions_priority ON client_interactions(priority);

-- ========================================
-- 3. TABLAS DE NOTIFICACIONES Y RECORDATORIOS (PRIORIDAD MEDIA)
-- ========================================

-- Notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'info', 'warning', 'error', 'success'
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(10) DEFAULT 'normal',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recordatorios
CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    type VARCHAR(50), -- 'campaign', 'order', 'meeting', 'custom'
    title VARCHAR(100) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(10) DEFAULT 'media',
    reminder_sent BOOLEAN DEFAULT false,
    snooze_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reglas de Recordatorios
CREATE TABLE IF NOT EXISTS reminder_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    trigger_event VARCHAR(50), -- 'campaign_start', 'order_due', etc.
    days_before INTEGER DEFAULT 0,
    reminder_type VARCHAR(50),
    template_message TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para notificaciones y recordatorios
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due ON reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_completed ON reminders(completed);
CREATE INDEX IF NOT EXISTS idx_reminders_priority ON reminders(priority);

-- ========================================
-- 4. TABLAS DE GAMIFICACIÓN (PRIORIDAD BAJA)
-- ========================================

-- User Gamification
CREATE TABLE IF NOT EXISTS user_gamification (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Usuarios(id_usuario) ON DELETE CASCADE UNIQUE,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    badges TEXT, -- JSON array de badges obtenidos
    achievements TEXT, -- JSON array de logros
    streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    total_orders INTEGER DEFAULT 0,
    total_campaigns INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Points Transactions
CREATE TABLE IF NOT EXISTS points_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    reason VARCHAR(255),
    transaction_type VARCHAR(20), -- 'earn', 'spend', 'bonus'
    related_entity_type VARCHAR(50),
    related_entity_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom Challenges
CREATE TABLE IF NOT EXISTS custom_challenges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    points_reward INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    target_type VARCHAR(50),
    target_value INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para gamificación
CREATE INDEX IF NOT EXISTS idx_user_gamification_user ON user_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gamification_points ON user_gamification(points DESC);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created ON points_transactions(created_at DESC);

-- ========================================
-- 5. TABLAS DE AUTOMATIZACIÓN (PRIORIDAD BAJA)
-- ========================================

-- Automation Rules
CREATE TABLE IF NOT EXISTS automation_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(50), -- 'campaign_created', 'order_completed', etc.
    action_type VARCHAR(50), -- 'send_email', 'create_task', 'send_notification'
    conditions TEXT, -- JSON con condiciones
    actions TEXT, -- JSON con acciones a ejecutar
    active BOOLEAN DEFAULT true,
    last_triggered TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks (para automatización)
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to INTEGER REFERENCES Usuarios(id_usuario),
    status VARCHAR(20) DEFAULT 'pendiente',
    priority VARCHAR(10) DEFAULT 'media',
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    automation_rule_id INTEGER REFERENCES automation_rules(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Logs (para tracking de emails automáticos)
CREATE TABLE IF NOT EXISTS email_logs (
    id SERIAL PRIMARY KEY,
    email_type VARCHAR(50),
    recipient_email VARCHAR(255),
    subject VARCHAR(255),
    status VARCHAR(20), -- 'sent', 'failed', 'pending'
    error_message TEXT,
    automation_rule_id INTEGER REFERENCES automation_rules(id),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para automatización
CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger ON automation_rules(trigger_type);
CREATE INDEX IF NOT EXISTS idx_automation_rules_active ON automation_rules(active);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created ON email_logs(created_at DESC);

-- ========================================
-- 6. TABLAS DE EXPORTACIÓN Y REPORTES (PRIORIDAD BAJA)
-- ========================================

-- Export Records
CREATE TABLE IF NOT EXISTS export_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Usuarios(id_usuario),
    export_type VARCHAR(50),
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_size INTEGER,
    status VARCHAR(20), -- 'processing', 'completed', 'failed'
    error_message TEXT,
    downloaded BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled Exports
CREATE TABLE IF NOT EXISTS scheduled_exports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    schedule VARCHAR(50), -- cron expression
    export_type VARCHAR(50),
    parameters TEXT, -- JSON con parámetros
    recipients TEXT, -- JSON con emails
    active BOOLEAN DEFAULT true,
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Export Templates
CREATE TABLE IF NOT EXISTS export_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    template_type VARCHAR(50),
    columns TEXT, -- JSON con columnas a exportar
    filters TEXT, -- JSON con filtros por defecto
    created_by INTEGER REFERENCES Usuarios(id_usuario),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled Reports
CREATE TABLE IF NOT EXISTS scheduled_reports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    report_type VARCHAR(50),
    schedule VARCHAR(50),
    parameters TEXT,
    recipients TEXT,
    active BOOLEAN DEFAULT true,
    last_run TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para exportación
CREATE INDEX IF NOT EXISTS idx_export_records_user ON export_records(user_id);
CREATE INDEX IF NOT EXISTS idx_export_records_status ON export_records(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_exports_active ON scheduled_exports(active);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_active ON scheduled_reports(active);

-- ========================================
-- 7. TABLAS DE PREFERENCIAS (PRIORIDAD MEDIA)
-- ========================================

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Usuarios(id_usuario) ON DELETE CASCADE UNIQUE,
    notification_preferences TEXT, -- JSON con preferencias de notificaciones
    ui_preferences TEXT, -- JSON con preferencias de interfaz
    report_preferences TEXT, -- JSON con preferencias de reportes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para preferencias
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- ========================================
-- 8. TABLAS DE ANÁLISIS PREDICTIVO (PRIORIDAD BAJA)
-- ========================================

-- Predictions
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    prediction_type VARCHAR(50), -- 'revenue', 'churn', 'performance'
    entity_type VARCHAR(50), -- 'client', 'campaign', 'order'
    entity_id INTEGER,
    predicted_value DECIMAL(15,2),
    actual_value DECIMAL(15,2),
    confidence DECIMAL(5,2),
    model_version VARCHAR(20),
    features_used TEXT, -- JSON con features del modelo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    measured_at TIMESTAMP WITH TIME ZONE
);

-- Índices para predicciones
CREATE INDEX IF NOT EXISTS idx_predictions_type ON predictions(prediction_type);
CREATE INDEX IF NOT EXISTS idx_predictions_entity ON predictions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created ON predictions(created_at DESC);

-- ========================================
-- 9. TABLA DE CONFIGURACIÓN IA (PRIORIDAD MEDIA)
-- ========================================

-- Configuración IA
CREATE TABLE IF NOT EXISTS configuracion_ia (
    id SERIAL PRIMARY KEY,
    parametro VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT,
    tipo_dato VARCHAR(20), -- 'string', 'number', 'boolean', 'json'
    descripcion TEXT,
    categoria VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para configuración
CREATE INDEX IF NOT EXISTS idx_configuracion_ia_parametro ON configuracion_ia(parametro);
CREATE INDEX IF NOT EXISTS idx_configuracion_ia_categoria ON configuracion_ia(categoria);

-- ========================================
-- 10. TABLAS DE PLANIFICACIÓN ADICIONALES (VERIFICAR)
-- ========================================

-- Planning Validations (para guardar validaciones)
CREATE TABLE IF NOT EXISTS planning_validations (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES plan(id) ON DELETE CASCADE,
    validation_type VARCHAR(50),
    is_valid BOOLEAN,
    messages TEXT, -- JSON con mensajes de validación
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client Discounts (descuentos especiales)
CREATE TABLE IF NOT EXISTS client_discounts (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER REFERENCES Clientes(id_cliente) ON DELETE CASCADE,
    discount_type VARCHAR(50),
    discount_value DECIMAL(5,2),
    start_date DATE,
    end_date DATE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para planificación
CREATE INDEX IF NOT EXISTS idx_planning_validations_plan ON planning_validations(plan_id);
CREATE INDEX IF NOT EXISTS idx_client_discounts_cliente ON client_discounts(id_cliente);
CREATE INDEX IF NOT EXISTS idx_client_discounts_active ON client_discounts(active);

-- ========================================
-- 11. DATOS INICIALES Y CONFIGURACIÓN
-- ========================================

-- Insertar configuración IA por defecto
INSERT INTO configuracion_ia (parametro, valor, tipo_dato, descripcion, categoria, activo)
VALUES
    ('modelo_scoring_activo', 'true', 'boolean', 'Activar modelo de scoring de clientes', 'scoring', true),
    ('umbral_scoring_bajo', '50', 'number', 'Umbral para scoring bajo', 'scoring', true),
    ('umbral_scoring_medio', '70', 'number', 'Umbral para scoring medio', 'scoring', true),
    ('dias_inactividad_alerta', '30', 'number', 'Días de inactividad para alerta', 'alertas', true),
    ('modelo_rentabilidad_activo', 'true', 'boolean', 'Activar cálculos de rentabilidad', 'rentabilidad', true)
ON CONFLICT (parametro) DO NOTHING;

-- Crear notificaciones de bienvenida para usuarios existentes (solo si no tienen)
INSERT INTO notifications (user_id, type, title, message, read, created_at)
SELECT
    id_usuario,
    'info',
    'Bienvenido a PautaPro',
    'Sistema de gestión de órdenes de publicidad ahora disponible',
    false,
    NOW()
FROM Usuarios
WHERE NOT EXISTS (
    SELECT 1 FROM notifications n WHERE n.user_id = Usuarios.id_usuario
)
LIMIT 10;

-- ========================================
-- 12. FUNCIONES ÚTILES
-- ========================================

-- Función para limpiar notificaciones antiguas
CREATE OR REPLACE FUNCTION limpiar_notificaciones_antiguas()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications
    WHERE read = true
    AND created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular score de cliente
CREATE OR REPLACE FUNCTION calcular_score_cliente(p_id_cliente INTEGER)
RETURNS DECIMAL AS $$
DECLARE
    v_score DECIMAL(5,2);
    v_num_ordenes INTEGER;
    v_total_invertido DECIMAL(15,2);
BEGIN
    -- Obtener número de órdenes
    SELECT COUNT(*) INTO v_num_ordenes
    FROM OrdenesDePublicidad
    WHERE id_cliente = p_id_cliente;
    
    -- Calcular score básico (esto es un ejemplo simplificado)
    v_score := LEAST(100, (v_num_ordenes * 10));
    
    RETURN COALESCE(v_score, 0);
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 13. TRIGGERS ÚTILES
-- ========================================

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas relevantes
DROP TRIGGER IF EXISTS update_client_scoring_updated_at ON client_scoring;
CREATE TRIGGER update_client_scoring_updated_at
    BEFORE UPDATE ON client_scoring
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_gamification_updated_at ON user_gamification;
CREATE TRIGGER update_user_gamification_updated_at
    BEFORE UPDATE ON user_gamification
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 14. COMENTARIOS DESCRIPTIVOS
-- ========================================

COMMENT ON TABLE campaign_audit_log IS 'Registro de auditoría de cambios en campañas';
COMMENT ON TABLE order_audit_log IS 'Registro de auditoría de cambios en órdenes';
COMMENT ON TABLE client_scoring IS 'Sistema de puntuación de clientes basado en múltiples factores';
COMMENT ON TABLE client_interactions IS 'Registro de interacciones con clientes para CRM';
COMMENT ON TABLE notifications IS 'Sistema de notificaciones del aplicativo';
COMMENT ON TABLE reminders IS 'Sistema de recordatorios y seguimiento';
COMMENT ON TABLE user_gamification IS 'Sistema de gamificación para usuarios';
COMMENT ON TABLE automation_rules IS 'Reglas de automatización de procesos';
COMMENT ON TABLE export_records IS 'Registro de exportaciones realizadas';
COMMENT ON TABLE user_preferences IS 'Preferencias personalizadas de usuario';
COMMENT ON TABLE predictions IS 'Predicciones de IA para análisis predictivo';
COMMENT ON TABLE configuracion_ia IS 'Configuración de parámetros de inteligencia artificial';

-- ========================================
-- FINALIZACIÓN
-- =======================================

COMMIT;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Script ejecutado exitosamente';
    RAISE NOTICE '✅ Tablas creadas: campaign_audit_log, order_audit_log, client_scoring, client_interactions';
    RAISE NOTICE '✅ Tablas creadas: notifications, reminders, user_gamification, automation_rules';
    RAISE NOTICE '✅ Tablas creadas: export_records, scheduled_exports, user_preferences, predictions';
    RAISE NOTICE '✅ Tablas creadas: configuracion_ia, planning_validations, tasks, email_logs';
    RAISE NOTICE '✅ Índices y triggers creados correctamente';
    RAISE NOTICE '📝 Revisar permisos RLS en Supabase Dashboard si es necesario';
END $$;