-- Script para crear tablas faltantes en Supabase
-- Ejecutar este script manualmente en la consola SQL de Supabase

-- 1. Crear tabla 'ordenes' si no existe
CREATE TABLE IF NOT EXISTS ordenes (
  id SERIAL PRIMARY KEY,
  id_cliente INTEGER REFERENCES clientes(id_cliente),
  id_proveedor INTEGER REFERENCES proveedores(id_proveedor),
  numero_orden VARCHAR(50) UNIQUE NOT NULL,
  fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_entrega_estimada DATE,
  fecha_entrega_real DATE,
  estado VARCHAR(50) DEFAULT 'solicitada',
  total_amount DECIMAL(15,2) DEFAULT 0,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para la tabla ordenes
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_cliente ON ordenes(id_cliente);
CREATE INDEX IF NOT EXISTS idx_ordenes_fecha ON ordenes(fecha_pedido);

-- 2. Verificar y crear tabla 'plan_alternativas' si no existe
CREATE TABLE IF NOT EXISTS plan_alternativas (
  id SERIAL PRIMARY KEY,
  id_plan INTEGER REFERENCES plan(id) ON DELETE CASCADE,
  id_alternativa INTEGER REFERENCES alternativa(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(id_plan, id_alternativa)
);

-- Índices para plan_alternativas
CREATE INDEX IF NOT EXISTS idx_plan_alternativas_plan ON plan_alternativas(id_plan);
CREATE INDEX IF NOT EXISTS idx_plan_alternativas_alternativa ON plan_alternativas(id_alternativa);

-- 3. Crear tabla 'campaign_audit_log' si no existe
CREATE TABLE IF NOT EXISTS campaign_audit_log (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES campania(id_campania),
  action VARCHAR(100) NOT NULL,
  details JSONB,
  user_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para campaign_audit_log
CREATE INDEX IF NOT EXISTS idx_campaign_audit_log_campaign ON campaign_audit_log(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_audit_log_action ON campaign_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_campaign_audit_log_created ON campaign_audit_log(created_at);

-- 4. Crear tabla 'order_audit_log' si no existe
CREATE TABLE IF NOT EXISTS order_audit_log (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES ordenes(id),
  action VARCHAR(100) NOT NULL,
  details JSONB,
  user_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para order_audit_log
CREATE INDEX IF NOT EXISTS idx_order_audit_log_order ON order_audit_log(order_id);
CREATE INDEX IF NOT EXISTS idx_order_audit_log_action ON order_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_order_audit_log_created ON order_audit_log(created_at);

-- 5. Insertar datos de prueba si las tablas están vacías

-- Verificar si hay datos en ordenes y insertar si está vacía
INSERT INTO ordenes (id_cliente, numero_orden, estado, total_amount, descripcion)
SELECT 
  1, 
  'ORD-001', 
  'solicitada', 
  100000, 
  'Orden de prueba 1'
WHERE NOT EXISTS (SELECT 1 FROM ordenes);

INSERT INTO ordenes (id_cliente, numero_orden, estado, total_amount, descripcion)
SELECT 
  2, 
  'ORD-002', 
  'aprobada', 
  150000, 
  'Orden de prueba 2'
WHERE NOT EXISTS (SELECT 1 FROM ordenes WHERE numero_orden = 'ORD-002');

-- Verificar si hay datos en alternativa y insertar si está vacía
INSERT INTO alternativa (
  nlinea, numerorden, anio, mes, id_campania, num_contrato, 
  tipo_item, valor_unitario, total_bruto, total_neto, ordencreada
)
SELECT 
  1, 
  1, 
  2024, 
  1, 
  1, 
  1, 
  'PAUTA LIBRE', 
  10000, 
  10000, 
  8500, 
  true
WHERE NOT EXISTS (SELECT 1 FROM alternativa);

INSERT INTO alternativa (
  nlinea, numerorden, anio, mes, id_campania, num_contrato, 
  tipo_item, valor_unitario, total_bruto, total_neto, ordencreada
)
SELECT 
  2, 
  2, 
  2024, 
  1, 
  1, 
  1, 
  'AUSPICIO', 
  15000, 
  15000, 
  12750, 
  false
WHERE NOT EXISTS (SELECT 1 FROM alternativa WHERE numerorden = 2);

-- 6. Crear función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Crear triggers para actualizar updated_at
CREATE TRIGGER update_ordenes_updated_at 
    BEFORE UPDATE ON ordenes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Mensajes de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Tablas creadas exitosamente: ordenes, plan_alternativas, campaign_audit_log, order_audit_log';
    RAISE NOTICE '✅ Índices creados correctamente';
    RAISE NOTICE '✅ Triggers para updated_at configurados';
    RAISE NOTICE '✅ Datos de prueba insertados si era necesario';
    RAISE NOTICE '🎉 Proceso completado exitosamente';
END $$;