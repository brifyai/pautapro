-- ========================================
-- Vistas para el Módulo de Rentabilidad Inteligente
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
    COALESCE(AVG(hn.descuento_obtenido_porcentaje), 0) as descuento_promedio
FROM Medios m
LEFT JOIN alternativa a ON EXISTS (
    SELECT 1 FROM soporte_medios sm WHERE sm.id_medio = m.id AND sm.id_soporte = a.id_soporte
)
LEFT JOIN DetallesFinancierosOrden dr ON a.id = dr.id_alternativa
LEFT JOIN HistoricoNegociacionMedios hn ON m.id = hn.id_medio
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
-- Insertar datos de ejemplo si las tablas están vacías
-- ========================================

-- Insertar configuración de comisiones por defecto si no existe
INSERT INTO ConfiguracionComisiones (id_cliente, comision_base_porcentaje, estado)
SELECT 
    c.id_cliente,
    15.0, -- 15% por defecto
    true
FROM Clientes c
WHERE NOT EXISTS (
    SELECT 1 FROM ConfiguracionComisiones cc WHERE cc.id_cliente = c.id_cliente
)
AND c.estado = true
LIMIT 10;

-- Insertar registro de bonificaciones por defecto si no existe
INSERT INTO RegistroBonificacionesMedios (id_medio, bonificacion_base_porcentaje, estado)
SELECT 
    m.id,
    10.0, -- 10% por defecto
    true
FROM Medios m
WHERE NOT EXISTS (
    SELECT 1 FROM RegistroBonificacionesMedios rbm WHERE rbm.id_medio = m.id
)
AND m.estado = true
LIMIT 10;

-- ========================================
-- Índices adicionales para rendimiento
-- ========================================

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_oportunidades_estado_prioridad ON OportunidadesRentabilidad(estado, prioridad);
CREATE INDEX IF NOT EXISTS idx_detalles_financieros_rentabilidad ON DetallesFinancierosOrden(rentabilidad_porcentaje);
CREATE INDEX IF NOT EXISTS idx_config_comisiones_cliente_estado ON ConfiguracionComisiones(id_cliente, estado);
CREATE INDEX IF NOT EXISTS idx_bonificaciones_medio_estado ON RegistroBonificacionesMedios(id_medio, estado);

-- ========================================
-- Funciones útiles para cálculos
-- ========================================

-- Función para calcular eficiencia de rentabilidad
CREATE OR REPLACE FUNCTION calcular_eficiencia_rentabilidad(
    p_rentabilidad_real DECIMAL,
    p_rentabilidad_potencial DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    IF p_rentabilidad_potencial = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN (p_rentabilidad_real / p_rentabilidad_potencial) * 100;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener categoría de rentabilidad
CREATE OR REPLACE FUNCTION categoria_rentabilidad(p_porcentaje DECIMAL) RETURNS TEXT AS $$
BEGIN
    IF p_porcentaje >= 30 THEN
        RETURN 'excelente';
    ELSIF p_porcentaje >= 25 THEN
        RETURN 'muy-buena';
    ELSIF p_porcentaje >= 20 THEN
        RETURN 'buena';
    ELSIF p_porcentaje >= 15 THEN
        RETURN 'regular';
    ELSE
        RETURN 'baja';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Triggers para mantener datos actualizados
-- ========================================

-- Trigger para actualizar métricas de rentabilidad cuando se inserta un detalle financiero
CREATE OR REPLACE FUNCTION actualizar_metricas_rentabilidad()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar métricas acumuladas (esto se implementaría en un proceso batch)
    -- Por ahora, el trigger solo registra el cambio
    INSERT INTO LogsDecisionesIA (
        id_modelo,
        contexto,
        decision_ia,
        confianza,
        usuario_afectado,
        fecha_decision
    ) VALUES (
        1, -- Modelo de métricas
        json_build_object(
            'tipo', 'actualizacion_rentabilidad',
            'id_orden', NEW.id_orden,
            'rentabilidad_neta', NEW.rentabilidad_neta
        ),
        json_build_object('accion', 'insertar_detalle_financiero'),
        100,
        NEW.calculado_por,
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS trigger_actualizar_metricas_rentabilidad ON DetallesFinancierosOrden;
CREATE TRIGGER trigger_actualizar_metricas_rentabilidad
    AFTER INSERT OR UPDATE ON DetallesFinancierosOrden
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_metricas_rentabilidad();

-- ========================================
-- Comentarios descriptivos adicionales
-- ========================================

COMMENT ON VIEW vw_rentabilidad_cliente IS 'Vista consolidada de rentabilidad por cliente con métricas clave';
COMMENT ON VIEW vw_rentabilidad_medio IS 'Vista consolidada de rentabilidad por medio con análisis de desempeño';
COMMENT ON VIEW vw_oportunidades_activas IS 'Vista de oportunidades de rentabilidad detectadas por IA pendientes de evaluación';

COMMENT ON FUNCTION calcular_eficiencia_rentabilidad IS 'Calcula el porcentaje de eficiencia entre rentabilidad real y potencial';
COMMENT ON FUNCTION categoria_rentabilidad IS 'Clasifica la rentabilidad en categorías predefinidas';

COMMENT ON TRIGGER trigger_actualizar_metricas_rentabilidad ON DetallesFinancierosOrden IS 'Registra cambios en detalles financieros para análisis posterior';