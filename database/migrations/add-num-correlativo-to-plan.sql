-- Agregar campo num_correlativo a la tabla plan
-- Este campo se necesita para el funcionamiento del sistema

ALTER TABLE plan 
ADD COLUMN IF NOT EXISTS num_correlativo INTEGER DEFAULT 0;

-- Opcional: Crear un índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_plan_num_correlativo ON plan(num_correlativo);

-- Comentario descriptivo
COMMENT ON COLUMN plan.num_correlativo IS 'Número correlativo del plan para secuenciación interna';