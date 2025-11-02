-- ========================================
-- Módulo de Rentabilidad Inteligente - Esquema de Base de Datos
-- ========================================

-- Tablas para el Sistema de Rentabilidad de Agencias de Medios
-- ========================================

-- 1. Detalles Financieros de Órdenes (para tracking completo de costos y precios)
CREATE TABLE IF NOT EXISTS DetallesFinancierosOrden (
    id SERIAL PRIMARY KEY,
    id_orden INTEGER REFERENCES OrdenesDePublicidad(id_ordenes_de_comprar),
    id_alternativa INTEGER REFERENCES alternativa(id),
    
    -- Costos reales del medio
    costo_real_medio DECIMAL(15,2) NOT NULL,
    
    -- Precios informados al cliente
    precio_informado_cliente DECIMAL(15,2) NOT NULL,
    
    -- Comisiones
    comision_cliente_porcentaje DECIMAL(5,2) DEFAULT 0,
    comision_cliente_monto DECIMAL(15,2) DEFAULT 0,
    
    -- Bonificaciones del medio
    bonificacion_medio_porcentaje DECIMAL(5,2) DEFAULT 0,
    bonificacion_medio_monto DECIMAL(15,2) DEFAULT 0,
    
    -- Markup calculado
    markup_porcentaje DECIMAL(5,2) DEFAULT 0,
    markup_monto DECIMAL(15,2) DEFAULT 0,
    
    -- Rentabilidad neta
    rentabilidad_neta DECIMAL(15,2) DEFAULT 0,
    rentabilidad_porcentaje DECIMAL(5,2) DEFAULT 0,
    
    -- Metadatos
    fecha_calculo TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    calculado_por INTEGER REFERENCES Usuarios(id_usuario),
    estado VARCHAR(20) DEFAULT 'activo',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Configuración de Comisiones por Cliente
CREATE TABLE IF NOT EXISTS ConfiguracionComisiones (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER REFERENCES Clientes(id_cliente),
    
    -- Comisiones estándar
    comision_base_porcentaje DECIMAL(5,2) DEFAULT 0,
    comision_base_monto DECIMAL(15,2) DEFAULT 0,
    
    -- Comisiones escalables (por volumen)
    comision_escalable BOOLEAN DEFAULT false,
    umbral_volumen DECIMAL(15,2) DEFAULT 0,
    comision_sobre_umbral DECIMAL(5,2) DEFAULT 0,
    
    -- Comisiones especiales por tipo de medio
    comisiones_por_medio TEXT, -- JSON con configuraciones específicas
    
    -- Vigencia
    fecha_inicio DATE,
    fecha_fin DATE,
    
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Registro de Bonificaciones de Medios
CREATE TABLE IF NOT EXISTS RegistroBonificacionesMedios (
    id SERIAL PRIMARY KEY,
    id_medio INTEGER REFERENCES Medios(id),
    id_proveedor INTEGER REFERENCES Proveedores(id_proveedor),
    
    -- Configuración de bonificación
    bonificacion_base_porcentaje DECIMAL(5,2) DEFAULT 0,
    bonificacion_escala BOOLEAN DEFAULT false,
    
    -- Escalas de bonificación (JSON)
    escalas_bonificacion TEXT, -- JSON: [{"umbral": 1000000, "bonificacion": 15}, {"umbral": 5000000, "bonificacion": 20}]
    
    -- Condiciones especiales
    condiciones TEXT, -- JSON con condiciones específicas
    
    -- Vigencia
    fecha_inicio DATE,
    fecha_fin DATE,
    
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Histórico de Negociación con Medios
CREATE TABLE IF NOT EXISTS HistoricoNegociacionMedios (
    id SERIAL PRIMARY KEY,
    id_medio INTEGER REFERENCES Medios(id),
    id_proveedor INTEGER REFERENCES Proveedores(id_proveedor),
    id_orden INTEGER REFERENCES OrdenesDePublicidad(id_ordenes_de_comprar),
    
    -- Datos de negociación
    precio_lista DECIMAL(15,2),
    descuento_obtenido_porcentaje DECIMAL(5,2),
    descuento_obtenido_monto DECIMAL(15,2),
    precio_final DECIMAL(15,2),
    
    -- Factores de negociación
    volumen_total DECIMAL(15,2),
    temporada VARCHAR(20), -- 'alta', 'media', 'baja'
    urgencia BOOLEAN DEFAULT false,
    competencia VARCHAR(100),
    
    -- Resultado
    exito_negociacion BOOLEAN DEFAULT false,
    factores_exito TEXT, -- JSON con factores que influyeron
    
    -- Metadatos
    fecha_negociacion DATE,
    negociado_por INTEGER REFERENCES Usuarios(id_usuario),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Métricas de Rentabilidad Acumulada
CREATE TABLE IF NOT EXISTS MetricasRentabilidad (
    id SERIAL PRIMARY KEY,
    
    -- Dimensiones de análisis
    id_cliente INTEGER REFERENCES Clientes(id_cliente),
    id_campania INTEGER REFERENCES Campania(id_campania),
    id_medio INTEGER REFERENCES Medios(id),
    id_agente INTEGER REFERENCES Usuarios(id_usuario),
    
    -- Período
    anio INTEGER,
    mes INTEGER,
    trimestre INTEGER,
    
    -- Métricas financieras
    inversion_total DECIMAL(15,2) DEFAULT 0,
    comisiones_cliente DECIMAL(15,2) DEFAULT 0,
    bonificaciones_medios DECIMAL(15,2) DEFAULT 0,
    markup_total DECIMAL(15,2) DEFAULT 0,
    rentabilidad_neta DECIMAL(15,2) DEFAULT 0,
    rentabilidad_porcentaje DECIMAL(5,2) DEFAULT 0,
    
    -- Métricas operativas
    numero_ordenes INTEGER DEFAULT 0,
    numero_alternativas INTEGER DEFAULT 0,
    ticket_promedio DECIMAL(15,2) DEFAULT 0,
    
    -- Métricas de eficiencia
    eficiencia_markup DECIMAL(5,2) DEFAULT 0, -- markup_real / markup_potencial
    eficiencia_comision DECIMAL(5,2) DEFAULT 0, -- comision_real / comision_maxima
    tasa_conversion DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Oportunidades de Rentabilidad (detectadas por IA)
CREATE TABLE IF NOT EXISTS OportunidadesRentabilidad (
    id SERIAL PRIMARY KEY,
    
    -- Tipo de oportunidad
    tipo_oportunidad VARCHAR(50), -- 'markup', 'comision', 'bonificacion', 'negociacion'
    
    -- Entidades relacionadas
    id_cliente INTEGER REFERENCES Clientes(id_cliente),
    id_medio INTEGER REFERENCES Medios(id),
    id_proveedor INTEGER REFERENCES Proveedores(id_proveedor),
    id_orden INTEGER REFERENCES OrdenesDePublicidad(id_ordenes_de_comprar),
    
    -- Datos de la oportunidad
    descripcion TEXT NOT NULL,
    impacto_estimado DECIMAL(15,2),
    impacto_porcentaje DECIMAL(5,2),
    probabilidad_exito DECIMAL(5,2),
    
    -- Acciones recomendadas
    accion_recomendada TEXT,
    pasos_seguimiento TEXT, -- JSON con pasos específicos
    
    -- Estado de la oportunidad
    estado VARCHAR(20) DEFAULT 'detectada', -- 'detectada', 'evaluando', 'aplicada', 'rechazada'
    prioridad VARCHAR(10) DEFAULT 'media', -- 'baja', 'media', 'alta', 'critica'
    
    -- IA Metadata
    confianza_ia DECIMAL(5,2), -- nivel de confianza de la predicción
    modelo_ia VARCHAR(100),
    fecha_deteccion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Seguimiento
    asignado_a INTEGER REFERENCES Usuarios(id_usuario),
    fecha_resolucion DATE,
    resultado_obtenido DECIMAL(15,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Configuración de Modelos de IA
CREATE TABLE IF NOT EXISTS ConfiguracionModelosIA (
    id SERIAL PRIMARY KEY,
    nombre_modelo VARCHAR(100) NOT NULL,
    tipo_modelo VARCHAR(50), -- 'markup_prediction', 'comision_optimization', 'negotiation_success'
    
    -- Configuración del modelo
    parametros_configuracion TEXT, -- JSON con hiperparámetros
    datos_entrenamiento TEXT, -- JSON con datasets utilizados
    
    -- Métricas de rendimiento
    precision DECIMAL(5,2),
    recall DECIMAL(5,2),
    f1_score DECIMAL(5,2),
    accuracy DECIMAL(5,2),
    
    -- Estado
    activo BOOLEAN DEFAULT true,
    version VARCHAR(20),
    fecha_entrenamiento DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Logs de Decisiones de IA
CREATE TABLE IF NOT EXISTS LogsDecisionesIA (
    id SERIAL PRIMARY KEY,
    id_modelo INTEGER REFERENCES ConfiguracionModelosIA(id),
    
    -- Contexto de la decisión
    contexto TEXT, -- JSON con datos de entrada
    decision_ia TEXT, -- JSON con decisión tomada
    
    -- Resultado
    confianza DECIMAL(5,2),
    tiempo_procesamiento INTEGER, -- milisegundos
    
    -- Impacto medido
    impacto_real DECIMAL(15,2),
    impacto_predicho DECIMAL(15,2),
    error_prediccion DECIMAL(5,2),
    
    -- Metadatos
    usuario_afectado INTEGER REFERENCES Usuarios(id_usuario),
    fecha_decision TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- Índices para optimizar rendimiento
-- ========================================

-- Índices para tablas de rentabilidad
CREATE INDEX IF NOT EXISTS idx_detalles_financieros_orden ON DetallesFinancierosOrden(id_orden);
CREATE INDEX IF NOT EXISTS idx_detalles_financieros_alternativa ON DetallesFinancierosOrden(id_alternativa);
CREATE INDEX IF NOT EXISTS idx_detalles_financieros_rentabilidad ON DetallesFinancierosOrden(rentabilidad_porcentaje);

CREATE INDEX IF NOT EXISTS idx_config_comisiones_cliente ON ConfiguracionComisiones(id_cliente);
CREATE INDEX IF NOT EXISTS idx_config_comisiones_vigencia ON ConfiguracionComisiones(fecha_inicio, fecha_fin);

CREATE INDEX IF NOT EXISTS idx_bonificaciones_medio ON RegistroBonificacionesMedios(id_medio);
CREATE INDEX IF NOT EXISTS idx_bonificaciones_proveedor ON RegistroBonificacionesMedios(id_proveedor);

CREATE INDEX IF NOT EXISTS idx_historico_negociacion_medio ON HistoricoNegociacionMedios(id_medio);
CREATE INDEX IF NOT EXISTS idx_historico_negociacion_fecha ON HistoricoNegociacionMedios(fecha_negociacion);

CREATE INDEX IF NOT EXISTS idx_metricas_rentabilidad_cliente ON MetricasRentabilidad(id_cliente);
CREATE INDEX IF NOT EXISTS idx_metricas_rentabilidad_periodo ON MetricasRentabilidad(anio, mes);
CREATE INDEX IF NOT EXISTS idx_metricas_rentabilidad_rentabilidad ON MetricasRentabilidad(rentabilidad_porcentaje);

CREATE INDEX IF NOT EXISTS idx_oportunidades_tipo ON OportunidadesRentabilidad(tipo_oportunidad);
CREATE INDEX IF NOT EXISTS idx_oportunidades_estado ON OportunidadesRentabilidad(estado);
CREATE INDEX IF NOT EXISTS idx_oportunidades_prioridad ON OportunidadesRentabilidad(prioridad);

CREATE INDEX IF NOT EXISTS idx_logs_decisiones_modelo ON LogsDecisionesIA(id_modelo);
CREATE INDEX IF NOT EXISTS idx_logs_decisiones_fecha ON LogsDecisionesIA(fecha_decision);

-- ========================================
-- Vistas para análisis simplificado
-- ========================================

-- Vista de rentabilidad por cliente
CREATE OR REPLACE VIEW vw_rentabilidad_cliente AS
SELECT 
    c.id_cliente,
    c.nombreCliente,
    COALESCE(SUM(dr.rentabilidad_neta), 0) as rentabilidad_total,
    COALESCE(SUM(dr.comision_cliente_monto), 0) as comisiones_total,
    COALESCE(SUM(dr.bonificacion_medio_monto), 0) as bonificaciones_total,
    COALESCE(SUM(dr.markup_monto), 0) as markup_total,
    COALESCE(SUM(dr.precio_informado_cliente), 0) as inversion_total,
    CASE 
        WHEN COALESCE(SUM(dr.precio_informado_cliente), 0) > 0 
        THEN (COALESCE(SUM(dr.rentabilidad_neta), 0) / COALESCE(SUM(dr.precio_informado_cliente), 0)) * 100 
        ELSE 0 
    END as rentabilidad_porcentaje,
    COUNT(DISTINCT dr.id_orden) as numero_ordenes
FROM Clientes c
LEFT JOIN OrdenesDePublicidad o ON c.id_cliente = o.id_cliente
LEFT JOIN DetallesFinancierosOrden dr ON o.id_ordenes_de_comprar = dr.id_orden
WHERE dr.estado = 'activo' OR dr.estado IS NULL
GROUP BY c.id_cliente, c.nombreCliente;

-- Vista de rentabilidad por medio
CREATE OR REPLACE VIEW vw_rentabilidad_medio AS
SELECT 
    m.id,
    m.nombredelmedio,
    COALESCE(SUM(dr.rentabilidad_neta), 0) as rentabilidad_total,
    COALESCE(SUM(dr.bonificacion_medio_monto), 0) as bonificaciones_total,
    COALESCE(SUM(dr.markup_monto), 0) as markup_total,
    COALESCE(SUM(dr.precio_informado_cliente), 0) as inversion_total,
    CASE 
        WHEN COALESCE(SUM(dr.precio_informado_cliente), 0) > 0 
        THEN (COALESCE(SUM(dr.rentabilidad_neta), 0) / COALESCE(SUM(dr.precio_informado_cliente), 0)) * 100 
        ELSE 0 
    END as rentabilidad_porcentaje,
    COUNT(DISTINCT dr.id_orden) as numero_ordenes,
    AVG(dr.descuento_obtenido_porcentaje) as descuento_promedio
FROM Medios m
LEFT JOIN alternativa a ON m.id = a.id_soporte
LEFT JOIN DetallesFinancierosOrden dr ON a.id = dr.id_alternativa
WHERE dr.estado = 'activo' OR dr.estado IS NULL
GROUP BY m.id, m.nombredelmedio;

-- Vista de oportunidades activas
CREATE OR REPLACE VIEW vw_oportunidades_activas AS
SELECT 
    or_.*,
    c.nombreCliente as nombre_cliente,
    m.nombredelmedio as nombre_medio,
    p.nombreProveedor as nombre_proveedor,
    u.nombre as nombre_asignado
FROM OportunidadesRentabilidad or_
LEFT JOIN Clientes c ON or_.id_cliente = c.id_cliente
LEFT JOIN Medios m ON or_.id_medio = m.id
LEFT JOIN Proveedores p ON or_.id_proveedor = p.id_proveedor
LEFT JOIN Usuarios u ON or_.asignado_a = u.id_usuario
WHERE or_.estado IN ('detectada', 'evaluando')
ORDER BY or_.prioridad DESC, or_.impacto_estimado DESC;

-- ========================================
-- Comentarios descriptivos
-- ========================================

COMMENT ON TABLE DetallesFinancierosOrden IS 'Detalles financieros completos de cada orden para cálculo de rentabilidad';
COMMENT ON TABLE ConfiguracionComisiones IS 'Configuración de comisiones por cliente con reglas escalables';
COMMENT ON TABLE RegistroBonificacionesMedios IS 'Registro de bonificaciones ofrecidas por los medios';
COMMENT ON TABLE HistoricoNegociacionMedios IS 'Histórico de negociaciones con medios para aprendizaje de IA';
COMMENT ON TABLE MetricasRentabilidad IS 'Métricas acumuladas de rentabilidad por diferentes dimensiones';
COMMENT ON TABLE OportunidadesRentabilidad IS 'Oportunidades de mejora de rentabilidad detectadas por IA';
COMMENT ON TABLE ConfiguracionModelosIA IS 'Configuración de modelos de machine learning';
COMMENT ON TABLE LogsDecisionesIA IS 'Registro de decisiones tomadas por la IA para análisis y mejora';