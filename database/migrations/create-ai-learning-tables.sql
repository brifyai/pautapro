-- ============================================
-- FASE 6: Tablas para Aprendizaje Automático IA
-- ============================================
-- Sistema de aprendizaje continuo, conocimiento externo y actualización automática

-- 1. Tabla de base de conocimiento IA
CREATE TABLE IF NOT EXISTS ai_knowledge_base (
    id VARCHAR(255) PRIMARY KEY,
    data JSONB NOT NULL,
    source VARCHAR(100) DEFAULT 'internal',
    category VARCHAR(100),
    validated BOOLEAN DEFAULT FALSE,
    confidence DECIMAL(3,2) DEFAULT 0.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    validated_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_base_category ON ai_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_base_source ON ai_knowledge_base(source);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_base_validated ON ai_knowledge_base(validated);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_base_confidence ON ai_knowledge_base(confidence);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_base_updated_at ON ai_knowledge_base(updated_at);

-- 2. Tabla de feedback de usuarios
CREATE TABLE IF NOT EXISTS ai_feedback (
    id VARCHAR(255) PRIMARY KEY,
    interaction_id VARCHAR(255),
    type VARCHAR(50) NOT NULL CHECK (type IN ('explicit', 'implicit', 'behavioral')),
    feedback_type VARCHAR(50),
    value JSONB,
    comment TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Índices para feedback
CREATE INDEX IF NOT EXISTS idx_ai_feedback_interaction_id ON ai_feedback(interaction_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_type ON ai_feedback(type);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_processed ON ai_feedback(processed);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_created_at ON ai_feedback(created_at);

-- 3. Tabla de tendencias detectadas
CREATE TABLE IF NOT EXISTS ai_detected_trends (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    detector_key VARCHAR(100) NOT NULL,
    trend_data JSONB NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 0.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Índices para tendencias
CREATE INDEX IF NOT EXISTS idx_ai_detected_trends_detector_key ON ai_detected_trends(detector_key);
CREATE INDEX IF NOT EXISTS idx_ai_detected_trends_processed ON ai_detected_trends(processed);
CREATE INDEX IF NOT EXISTS idx_ai_detected_trends_created_at ON ai_detected_trends(created_at);

-- 4. Tabla de adaptaciones aplicadas
CREATE TABLE IF NOT EXISTS ai_adaptations (
    id VARCHAR(255) PRIMARY KEY,
    feedback_id VARCHAR(255) REFERENCES ai_feedback(id),
    strategy VARCHAR(100) NOT NULL,
    changes JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applied BOOLEAN DEFAULT FALSE,
    applied_at TIMESTAMP WITH TIME ZONE,
    effectiveness_score DECIMAL(3,2),
    metadata JSONB DEFAULT '{}'
);

-- Índices para adaptaciones
CREATE INDEX IF NOT EXISTS idx_ai_adaptations_feedback_id ON ai_adaptations(feedback_id);
CREATE INDEX IF NOT EXISTS idx_ai_adaptations_strategy ON ai_adaptations(strategy);
CREATE INDEX IF NOT EXISTS idx_ai_adaptations_applied ON ai_adaptations(applied);
CREATE INDEX IF NOT EXISTS idx_ai_adaptations_created_at ON ai_adaptations(created_at);

-- 5. Tabla de sugerencias de mejora
CREATE TABLE IF NOT EXISTS ai_improvement_suggestions (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_id VARCHAR(255) REFERENCES ai_feedback(id),
    type VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    suggested_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    implemented BOOLEAN DEFAULT FALSE,
    implemented_at TIMESTAMP WITH TIME ZONE,
    implementation_result JSONB
);

-- Índices para sugerencias
CREATE INDEX IF NOT EXISTS idx_ai_improvement_suggestions_feedback_id ON ai_improvement_suggestions(feedback_id);
CREATE INDEX IF NOT EXISTS idx_ai_improvement_suggestions_type ON ai_improvement_suggestions(type);
CREATE INDEX IF NOT EXISTS idx_ai_improvement_suggestions_priority ON ai_improvement_suggestions(priority);
CREATE INDEX IF NOT EXISTS idx_ai_improvement_suggestions_implemented ON ai_improvement_suggestions(implemented);

-- 6. Tabla de métricas de satisfacción
CREATE TABLE IF NOT EXISTS ai_satisfaction_metrics (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type VARCHAR(100) NOT NULL,
    metric_key VARCHAR(100) NOT NULL,
    positive_count INTEGER DEFAULT 0,
    negative_count INTEGER DEFAULT 0,
    neutral_count INTEGER DEFAULT 0,
    score DECIMAL(3,2) DEFAULT 0,
    period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Índices para métricas
CREATE INDEX IF NOT EXISTS idx_ai_satisfaction_metrics_type ON ai_satisfaction_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_ai_satisfaction_metrics_key ON ai_satisfaction_metrics(metric_key);
CREATE INDEX IF NOT EXISTS idx_ai_satisfaction_metrics_period ON ai_satisfaction_metrics(period_start, period_end);

-- 7. Tabla de tendencias de satisfacción
CREATE TABLE IF NOT EXISTS ai_satisfaction_trends (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    trends JSONB NOT NULL,
    analysis_period VARCHAR(50) DEFAULT '24h',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- 8. Tabla de patrones problemáticos
CREATE TABLE IF NOT EXISTS ai_problematic_patterns (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern VARCHAR(255) NOT NULL,
    success_rate DECIMAL(3,2) NOT NULL,
    feedback_count INTEGER NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Índices para patrones problemáticos
CREATE INDEX IF NOT EXISTS idx_ai_problematic_patterns_pattern ON ai_problematic_patterns(pattern);
CREATE INDEX IF NOT EXISTS idx_ai_problematic_patterns_priority ON ai_problematic_patterns(priority);
CREATE INDEX IF NOT EXISTS idx_ai_problematic_patterns_resolved ON ai_problematic_patterns(resolved);

-- 9. Tabla de informes de mejora
CREATE TABLE IF NOT EXISTS ai_improvement_reports (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    period VARCHAR(50) NOT NULL,
    total_feedback INTEGER NOT NULL,
    satisfaction_score DECIMAL(3,2) NOT NULL,
    adaptations_applied INTEGER DEFAULT 0,
    improvement_suggestions INTEGER DEFAULT 0,
    top_issues JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- 10. Tabla de interacciones IA (para seguimiento completo)
CREATE TABLE IF NOT EXISTS ai_interactions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    intent VARCHAR(100),
    entities JSONB DEFAULT '[]',
    context JSONB DEFAULT '{}',
    response_time_ms INTEGER,
    confidence DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Índices para interacciones
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_session_id ON ai_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_intent ON ai_interactions(intent);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_created_at ON ai_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_confidence ON ai_interactions(confidence);

-- 11. Tabla de aprendizaje de patrones
CREATE TABLE IF NOT EXISTS ai_learning_patterns (
    id VARCHAR(255) PRIMARY KEY,
    pattern_key VARCHAR(255) NOT NULL,
    pattern_type VARCHAR(100) NOT NULL,
    success_rate DECIMAL(3,2) DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    feedback_count INTEGER DEFAULT 0,
    adaptations JSONB DEFAULT '[]',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Índices para patrones de aprendizaje
CREATE INDEX IF NOT EXISTS idx_ai_learning_patterns_pattern_key ON ai_learning_patterns(pattern_key);
CREATE INDEX IF NOT EXISTS idx_ai_learning_patterns_pattern_type ON ai_learning_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_ai_learning_patterns_success_rate ON ai_learning_patterns(success_rate);

-- 12. Tabla de conocimiento del dominio publicitario
CREATE TABLE IF NOT EXISTS ai_advertising_knowledge (
    id VARCHAR(255) PRIMARY KEY,
    term VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    definition TEXT,
    formula TEXT,
    examples JSONB DEFAULT '[]',
    related_terms JSONB DEFAULT '[]',
    benchmarks JSONB DEFAULT '{}',
    trends JSONB DEFAULT '[]',
    source VARCHAR(100) DEFAULT 'internal',
    confidence DECIMAL(3,2) DEFAULT 0.8,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Índices para conocimiento publicitario
CREATE INDEX IF NOT EXISTS idx_ai_advertising_knowledge_term ON ai_advertising_knowledge(term);
CREATE INDEX IF NOT EXISTS idx_ai_advertising_knowledge_category ON ai_advertising_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_ai_advertising_knowledge_source ON ai_advertising_knowledge(source);

-- 13. Tabla de actualizaciones externas
CREATE TABLE IF NOT EXISTS ai_external_updates (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    source_name VARCHAR(255) NOT NULL,
    source_url TEXT,
    update_type VARCHAR(100) NOT NULL,
    data JSONB NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 0.7,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Índices para actualizaciones externas
CREATE INDEX IF NOT EXISTS idx_ai_external_updates_source_name ON ai_external_updates(source_name);
CREATE INDEX IF NOT EXISTS idx_ai_external_updates_update_type ON ai_external_updates(update_type);
CREATE INDEX IF NOT EXISTS idx_ai_external_updates_processed ON ai_external_updates(processed);

-- 14. Funciones y triggers para actualización automática de timestamps

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_ai_knowledge_base_updated_at 
    BEFORE UPDATE ON ai_knowledge_base 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_advertising_knowledge_updated_at 
    BEFORE UPDATE ON ai_advertising_knowledge 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. Vistas para consultas optimizadas

-- Vista de conocimiento validado
CREATE OR REPLACE VIEW ai_validated_knowledge AS
SELECT 
    id,
    data,
    source,
    category,
    confidence,
    created_at,
    updated_at
FROM ai_knowledge_base 
WHERE validated = TRUE 
  AND confidence >= 0.7;

-- Vista de feedback reciente no procesado
CREATE OR REPLACE VIEW ai_unprocessed_feedback AS
SELECT 
    id,
    interaction_id,
    type,
    feedback_type,
    value,
    comment,
    created_at
FROM ai_feedback 
WHERE processed = FALSE 
  AND created_at >= NOW() - INTERVAL '24 hours';

-- Vista de métricas de satisfacción recientes
CREATE OR REPLACE VIEW ai_recent_satisfaction AS
SELECT 
    metric_type,
    metric_key,
    score,
    period_start,
    period_end
FROM ai_satisfaction_metrics 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Vista de adaptaciones efectivas
CREATE OR REPLACE VIEW ai_effective_adaptations AS
SELECT 
    id,
    strategy,
    changes,
    effectiveness_score,
    applied_at
FROM ai_adaptations 
WHERE applied = TRUE 
  AND effectiveness_score >= 0.7;

-- 16. Políticas de seguridad (RLS)

-- Habilitar RLS en todas las tablas
ALTER TABLE ai_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_detected_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_adaptations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_improvement_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_satisfaction_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_satisfaction_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_problematic_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_improvement_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_advertising_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_external_updates ENABLE ROW LEVEL SECURITY;

-- Políticas para conocimiento base
CREATE POLICY "Allow full access to AI knowledge base" ON ai_knowledge_base
    FOR ALL USING (true);

-- Políticas para feedback
CREATE POLICY "Allow full access to AI feedback" ON ai_feedback
    FOR ALL USING (true);

-- Políticas para interacciones
CREATE POLICY "Allow full access to AI interactions" ON ai_interactions
    FOR ALL USING (true);

-- Políticas para las demás tablas (acceso completo para el sistema)
CREATE POLICY "Allow full access to AI detected trends" ON ai_detected_trends
    FOR ALL USING (true);

CREATE POLICY "Allow full access to AI adaptations" ON ai_adaptations
    FOR ALL USING (true);

CREATE POLICY "Allow full access to AI improvement suggestions" ON ai_improvement_suggestions
    FOR ALL USING (true);

CREATE POLICY "Allow full access to AI satisfaction metrics" ON ai_satisfaction_metrics
    FOR ALL USING (true);

CREATE POLICY "Allow full access to AI satisfaction trends" ON ai_satisfaction_trends
    FOR ALL USING (true);

CREATE POLICY "Allow full access to AI problematic patterns" ON ai_problematic_patterns
    FOR ALL USING (true);

CREATE POLICY "Allow full access to AI improvement reports" ON ai_improvement_reports
    FOR ALL USING (true);

CREATE POLICY "Allow full access to AI learning patterns" ON ai_learning_patterns
    FOR ALL USING (true);

CREATE POLICY "Allow full access to AI advertising knowledge" ON ai_advertising_knowledge
    FOR ALL USING (true);

CREATE POLICY "Allow full access to AI external updates" ON ai_external_updates
    FOR ALL USING (true);

-- 17. Datos iniciales para conocimiento publicitario

-- Insertar términos publicitarios básicos
INSERT INTO ai_advertising_knowledge (id, term, category, definition, formula, examples, related_terms, benchmarks) VALUES
('advertising_reach', 'reach', 'metrics', 'Alcance - Número de personas únicas expuestas a un anuncio', 'Reach = Impresiones únicas', 
 '["Campaña TV con 1M de reach", "Display ads con 500K reach"]', 
 '["frequency", "impressions", "coverage"]',
 '{"tv": {"min": 1000000, "max": 5000000}, "digital": {"min": 100000, "max": 1000000}}'),

('advertising_frequency', 'frequency', 'metrics', 'Frecuencia - Número de veces que una persona ve el anuncio', 'Frequency = Impresiones totales / Reach',
 '["Frecuencia óptima de 3-4", "Alta frecuencia puede causar fatiga"]',
 '["reach", "impressions", "recency"]',
 '{"brand_awareness": {"min": 3, "max": 5}, "direct_response": {"min": 5, "max": 8}}'),

('advertising_ctr', 'ctr', 'metrics', 'Click-Through Rate - Porcentaje de clics sobre impresiones', 'CTR = (Clics / Impresiones) × 100',
 '["CTR display 0.05%", "CTR search 3.17%", "CTR social 1.21%"]',
 '["cpc", "cpl", "conversion_rate"]',
 '{"display": {"avg": 0.05, "good": 0.08}, "search": {"avg": 3.17, "good": 5.0}, "social": {"avg": 1.21, "good": 2.0}}'),

('advertising_cpc', 'cpc', 'metrics', 'Cost Per Click - Costo por cada clic obtenido', 'CPC = Costo total / Clics',
 '["CPC search $2.69", "CPC social $1.72", "CPC display $0.50"]',
 '["cpm", "cpa", "roas"]',
 '{"search": {"avg": 2.69, "good": 2.0}, "social": {"avg": 1.72, "good": 1.0}, "display": {"avg": 0.50, "good": 0.30}}'),

('advertising_roas', 'roas', 'metrics', 'Return On Ad Spend - Retorno sobre inversión publicitaria', 'ROAS = (Ingresos - Costo) / Costo',
 '["ROAS 4:1 es considerado bueno", "ROAS 8:1 es excelente"]',
 '["roi", "cpa", "ltv"]',
 '{"ecommerce": {"min": 4, "good": 8}, "b2b": {"min": 2, "good": 5}, "services": {"min": 3, "good": 6}}')

ON CONFLICT (id) DO NOTHING;

-- 18. Comentarios de documentación
COMMENT ON TABLE ai_knowledge_base IS 'Base de conocimiento central del sistema IA';
COMMENT ON TABLE ai_feedback IS 'Feedback de usuarios para aprendizaje continuo';
COMMENT ON TABLE ai_detected_trends IS 'Tendencias detectadas por los algoritmos de IA';
COMMENT ON TABLE ai_adaptations IS 'Adaptaciones automáticas aplicadas al sistema';
COMMENT ON TABLE ai_improvement_suggestions IS 'Sugerencias generadas para mejorar el sistema';
COMMENT ON TABLE ai_satisfaction_metrics IS 'Métricas de satisfacción del usuario';
COMMENT ON TABLE ai_interactions IS 'Registro completo de interacciones con la IA';
COMMENT ON TABLE ai_advertising_knowledge IS 'Conocimiento especializado del dominio publicitario';

-- 19. Estadísticas iniciales
ANALYZE ai_knowledge_base;
ANALYZE ai_feedback;
ANALYZE ai_advertising_knowledge;
ANALYZE ai_interactions;

-- ============================================
-- FIN DE MIGRACIÓN FASE 6
-- ============================================