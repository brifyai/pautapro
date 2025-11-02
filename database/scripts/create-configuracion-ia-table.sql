-- Crear tabla para configuración de Inteligencia Artificial
CREATE TABLE IF NOT EXISTS configuracion_ia (
    id SERIAL PRIMARY KEY,
    groq_api_key VARCHAR(255),
    selected_model VARCHAR(100) DEFAULT 'gemma2-9b-it',
    max_tokens INTEGER DEFAULT 4096,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    ai_enabled BOOLEAN DEFAULT true,
    modules JSONB DEFAULT '{
        "dashboard": true,
        "planificacion": true,
        "ordenes": true,
        "campanas": true,
        "reportes": true
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración por defecto si no existe
INSERT INTO configuracion_ia (groq_api_key, selected_model, max_tokens, temperature, ai_enabled, modules)
SELECT '', 'gemma2-9b-it', 4096, 0.7, true, '{
    "dashboard": true,
    "planificacion": true,
    "ordenes": true,
    "campanas": true,
    "reportes": true
}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM configuracion_ia LIMIT 1);

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_configuracion_ia_updated_at
    BEFORE UPDATE ON configuracion_ia
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();