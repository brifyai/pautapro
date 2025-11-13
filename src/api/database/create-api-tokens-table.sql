-- =====================================================
-- TABLA DE TOKENS DE API - PAUTAPRO EMPRESARIAL v2.0
-- =====================================================
-- Creado: 13 de noviembre de 2024
-- Descripción: Tabla para gestionar tokens de API empresarial
-- =====================================================

-- Crear tabla principal de tokens
CREATE TABLE IF NOT EXISTS api_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    token VARCHAR(255) UNIQUE NOT NULL,
    
    -- Configuración de permisos
    permisos TEXT[] NOT NULL DEFAULT '{}',
    
    -- Plan y limitaciones
    plan VARCHAR(50) NOT NULL DEFAULT 'standard',
    limite_requests_hora INTEGER DEFAULT 1000,
    limite_requests_dia INTEGER DEFAULT 10000,
    limite_requests_mes INTEGER DEFAULT 100000,
    
    -- Estados y métricas
    activo BOOLEAN DEFAULT true,
    requests_realizadas INTEGER DEFAULT 0,
    requests_restantes INTEGER DEFAULT 1000,
    
    -- Fechas
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_expiracion TIMESTAMPTZ,
    fecha_regeneracion TIMESTAMPTZ,
    fecha_ultimo_uso TIMESTAMPTZ,
    
    -- Metadatos adicionales
    user_agent TEXT,
    ip_creacion INET,
    notas TEXT,
    
    -- Timestamps automáticos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Crear tabla de logs de API para auditoría
CREATE TABLE IF NOT EXISTS api_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token_id UUID REFERENCES api_tokens(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER,
    response_time INTEGER, -- en milisegundos
    ip_address INET,
    user_agent TEXT,
    request_size INTEGER,
    response_size INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de métricas de API
CREATE TABLE IF NOT EXISTS api_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token_id UUID REFERENCES api_tokens(id) ON DELETE CASCADE,
    fecha DATE DEFAULT CURRENT_DATE,
    hora INTEGER NOT NULL,
    requests_totales INTEGER DEFAULT 0,
    requests_exitosas INTEGER DEFAULT 0,
    requests_error INTEGER DEFAULT 0,
    bandwidth_entrada INTEGER DEFAULT 0, -- bytes
    bandwidth_salida INTEGER DEFAULT 0, -- bytes
    tiempo_respuesta_promedio INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de clientes OAuth para API Keys
CREATE TABLE IF NOT EXISTS api_oauth_clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id VARCHAR(255) UNIQUE NOT NULL,
    client_secret_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    redirect_uris TEXT[],
    
    -- Configuración
    plan VARCHAR(50) NOT NULL DEFAULT 'standard',
    limite_requests_hora INTEGER DEFAULT 1000,
    scopes TEXT[] DEFAULT '{}',
    activo BOOLEAN DEFAULT true,
    
    -- Metadatos
    empresa VARCHAR(255),
    contacto_email VARCHAR(255),
    contacto_telefono VARCHAR(50),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de tokens OAuth
CREATE TABLE IF NOT EXISTS api_oauth_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES api_oauth_clients(id) ON DELETE CASCADE,
    access_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    scope TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

-- Crear tabla de webhooks
CREATE TABLE IF NOT EXISTS api_webhooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    secret VARCHAR(255),
    eventos TEXT[] NOT NULL,
    
    -- Configuración
    activo BOOLEAN DEFAULT true,
    retry_attempts INTEGER DEFAULT 3,
    timeout_seconds INTEGER DEFAULT 30,
    
    -- Estadísticas
    total_envios INTEGER DEFAULT 0,
    envios_exitosos INTEGER DEFAULT 0,
    envios_fallidos INTEGER DEFAULT 0,
    ultimo_envio TIMESTAMPTZ,
    
    -- Metadatos
    creado_por UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de logs de webhooks
CREATE TABLE IF NOT EXISTS api_webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_id UUID REFERENCES api_webhooks(id) ON DELETE CASCADE,
    evento VARCHAR(100) NOT NULL,
    payload TEXT,
    status_code INTEGER,
    response_body TEXT,
    response_time INTEGER,
    retry_attempt INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para api_tokens
CREATE INDEX IF NOT EXISTS idx_api_tokens_token ON api_tokens(token);
CREATE INDEX IF NOT EXISTS idx_api_tokens_plan ON api_tokens(plan);
CREATE INDEX IF NOT EXISTS idx_api_tokens_activo ON api_tokens(activo);
CREATE INDEX IF NOT EXISTS idx_api_tokens_fecha_creacion ON api_tokens(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_api_tokens_expiracion ON api_tokens(fecha_expiracion);

-- Índices para api_logs
CREATE INDEX IF NOT EXISTS idx_api_logs_token_id ON api_logs(token_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_logs_status_code ON api_logs(status_code);

-- Índices para api_metrics
CREATE INDEX IF NOT EXISTS idx_api_metrics_token_id ON api_metrics(token_id);
CREATE INDEX IF NOT EXISTS idx_api_metrics_fecha_hora ON api_metrics(fecha, hora);
CREATE INDEX IF NOT EXISTS idx_api_metrics_fecha ON api_metrics(fecha);

-- Índices para oauth_clients
CREATE INDEX IF NOT EXISTS idx_oauth_clients_client_id ON api_oauth_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_oauth_clients_activo ON api_oauth_clients(activo);

-- Índices para oauth_tokens
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_access_token ON api_oauth_tokens(access_token);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_refresh_token ON api_oauth_tokens(refresh_token);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_client_id ON api_oauth_tokens(client_id);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_expires_at ON api_oauth_tokens(expires_at);

-- Índices para webhooks
CREATE INDEX IF NOT EXISTS idx_webhooks_activo ON api_webhooks(activo);
CREATE INDEX IF NOT EXISTS idx_webhooks_eventos ON api_webhooks USING GIN(eventos);

-- Índices para webhook_logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON api_webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_evento ON api_webhook_logs(evento);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON api_webhook_logs(created_at);

-- =====================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a tablas relevantes
DROP TRIGGER IF EXISTS update_api_tokens_updated_at ON api_tokens;
CREATE TRIGGER update_api_tokens_updated_at 
    BEFORE UPDATE ON api_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_oauth_clients_updated_at ON api_oauth_clients;
CREATE TRIGGER update_oauth_clients_updated_at 
    BEFORE UPDATE ON api_oauth_clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_webhooks_updated_at ON api_webhooks;
CREATE TRIGGER update_webhooks_updated_at 
    BEFORE UPDATE ON api_webhooks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_metrics_updated_at ON api_metrics;
CREATE TRIGGER update_metrics_updated_at 
    BEFORE UPDATE ON api_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCIONES DE UTILIDAD
-- =====================================================

-- Función para limpiar tokens expirados
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    UPDATE api_tokens 
    SET deleted_at = NOW(),
        activo = false
    WHERE fecha_expiracion < NOW() 
    AND deleted_at IS NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Función para validar token
CREATE OR REPLACE FUNCTION validate_api_token(input_token VARCHAR)
RETURNS TABLE(
    valid BOOLEAN,
    token_id UUID,
    plan VARCHAR,
    permisos TEXT[],
    limite_requests_hora INTEGER,
    activo BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN t.fecha_expiracion IS NOT NULL AND t.fecha_expiracion < NOW() THEN false
            WHEN t.deleted_at IS NOT NULL THEN false
            ELSE t.activo
        END as valid,
        t.id as token_id,
        t.plan as plan,
        t.permisos as permisos,
        t.limite_requests_hora as limite_requests_hora,
        t.activo as activo
    FROM api_tokens t
    WHERE t.token = input_token;
END;
$$ LANGUAGE plpgsql;

-- Función para registrar uso de token
CREATE OR REPLACE FUNCTION record_token_usage(
    input_token VARCHAR,
    input_endpoint VARCHAR,
    input_method VARCHAR,
    input_status_code INTEGER,
    input_response_time INTEGER DEFAULT NULL,
    input_ip_address INET DEFAULT NULL,
    input_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    token_record RECORD;
BEGIN
    -- Obtener información del token
    SELECT id, plan, limite_requests_hora INTO token_record
    FROM api_tokens 
    WHERE token = input_token 
    AND activo = true 
    AND (fecha_expiracion IS NULL OR fecha_expiracion > NOW())
    AND deleted_at IS NULL
    LIMIT 1;
    
    -- Si el token es válido, registrar el log
    IF FOUND THEN
        INSERT INTO api_logs (
            token_id, endpoint, method, status_code, 
            response_time, ip_address, user_agent
        ) VALUES (
            token_record.id, input_endpoint, input_method, input_status_code,
            input_response_time, input_ip_address, input_user_agent
        );
        
        -- Actualizar métricas del token
        UPDATE api_tokens 
        SET 
            requests_realizadas = requests_realizadas + 1,
            requests_restantes = GREATEST(0, requests_restantes - 1),
            fecha_ultimo_uso = NOW()
        WHERE id = token_record.id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- =====================================================

-- Insertar un token de ejemplo para desarrollo
INSERT INTO api_tokens (
    nombre,
    descripcion,
    token,
    permisos,
    plan,
    limite_requests_hora,
    fecha_expiracion,
    activo
) VALUES (
    'Sistema de Facturación Desarrollo',
    'Token para integrar con sistema de facturación en desarrollo',
    'pk_dev_' || substr(encode(gen_random_bytes(32), 'hex'), 1, 32),
    ARRAY['clientes.read', 'clientes.create', 'ordenes.read', 'ordenes.create', 'reportes.read'],
    'standard',
    1000,
    NOW() + INTERVAL '1 year',
    true
) ON CONFLICT (token) DO NOTHING;

-- Insertar cliente OAuth de ejemplo
INSERT INTO api_oauth_clients (
    client_id,
    client_secret_hash,
    nombre,
    descripcion,
    scopes,
    plan
) VALUES (
    'pautapro_dev_client',
    encode(digest('dev_secret_123', 'sha256'), 'hex'),
    'PautaPro Client Development',
    'Cliente OAuth para desarrollo y pruebas',
    ARRAY['read:clientes', 'write:clientes', 'read:ordenes', 'write:ordenes', 'read:reportes'],
    'development'
) ON CONFLICT (client_id) DO NOTHING;

-- =====================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE api_tokens IS 'Tabla principal para gestionar tokens de API empresarial';
COMMENT ON TABLE api_logs IS 'Logs de todas las requests a la API para auditoría';
COMMENT ON TABLE api_metrics IS 'Métricas agregadas por hora para monitoreo de performance';
COMMENT ON TABLE api_oauth_clients IS 'Clientes OAuth 2.0 para autenticación empresarial';
COMMENT ON TABLE api_oauth_tokens IS 'Tokens de acceso OAuth 2.0';
COMMENT ON TABLE api_webhooks IS 'Configuración de webhooks para notificaciones';
COMMENT ON TABLE api_webhook_logs IS 'Logs de entrega de webhooks';

COMMENT ON FUNCTION validate_api_token IS 'Valida un token de API y retorna información del mismo';
COMMENT ON FUNCTION record_token_usage IS 'Registra el uso de un token para métricas y auditoría';
COMMENT ON FUNCTION cleanup_expired_tokens IS 'Limpia tokens expirados automáticamente';