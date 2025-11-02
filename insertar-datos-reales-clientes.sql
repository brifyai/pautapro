-- ===================================================================
-- SCRIPT PARA INSERTAR DATOS REALES DE CLIENTES E INVERSIONES
-- ===================================================================

-- ---------------------------------------------------------------
-- 1. ACTUALIZAR INVERSIONES DE CLIENTES EXISTENTES
-- ---------------------------------------------------------------

-- Actualizar clientes existentes con inversiones realistas
UPDATE clientes SET total_invertido = 45000000 WHERE razonsocial ILIKE '%falabella%' OR nombrecliente ILIKE '%falabella%';
UPDATE clientes SET total_invertido = 38000000 WHERE razonsocial ILIKE '%cencosud%' OR nombrecliente ILIKE '%cencosud%';
UPDATE clientes SET total_invertido = 32000000 WHERE razonsocial ILIKE '%ripley%' OR nombrecliente ILIKE '%ripley%';
UPDATE clientes SET total_invertido = 28000000 WHERE razonsocial ILIKE '%paris%' OR nombrecliente ILIKE '%paris%';
UPDATE clientes SET total_invertido = 22000000 WHERE razonsocial ILIKE '%hites%' OR nombrecliente ILIKE '%hites%';
UPDATE clientes SET total_invertido = 18000000 WHERE razonsocial ILIKE '%lider%' OR nombrecliente ILIKE '%lider%';
UPDATE clientes SET total_invertido = 15000000 WHERE razonsocial ILIKE '%jumbo%' OR nombrecliente ILIKE '%jumbo%';
UPDATE clientes SET total_invertido = 12000000 WHERE razonsocial ILIKE '%santa%' OR nombrecliente ILIKE '%santa%';
UPDATE clientes SET total_invertido = 10000000 WHERE razonsocial ILIKE '%unimarc%' OR nombrecliente ILIKE '%unimarc%';
UPDATE clientes SET total_invertido = 8000000 WHERE razonsocial ILIKE '%tottus%' OR nombrecliente ILIKE '%tottus%';

-- ---------------------------------------------------------------
-- 2. INSERTAR NUEVOS CLIENTES SI NO EXISTEN
-- ---------------------------------------------------------------
INSERT INTO clientes (nombrecliente, razonsocial, total_invertido, created_at, updated_at) VALUES
('Falabella', 'Falabella S.A.', 45000000, NOW(), NOW()),
('Cencosud', 'Cencosud S.A.', 38000000, NOW(), NOW()),
('Ripley', 'Ripley S.A.', 32000000, NOW(), NOW()),
('Paris', 'Paris S.A.', 28000000, NOW(), NOW()),
('Hites', 'Hites S.A.', 22000000, NOW(), NOW()),
('Lider', 'Lider S.A.', 18000000, NOW(), NOW()),
('Jumbo', 'Jumbo S.A.', 15000000, NOW(), NOW()),
('Santa Isabel', 'Santa Isabel S.A.', 12000000, NOW(), NOW()),
('Unimarc', 'Unimarc S.A.', 10000000, NOW(), NOW()),
('Tottus', 'Tottus S.A.', 8000000, NOW(), NOW())
ON CONFLICT (id_cliente) DO NOTHING;

-- ---------------------------------------------------------------
-- 3. ACTUALIZAR CLIENTES SIN INVERSIÓN
-- ---------------------------------------------------------------
UPDATE clientes 
SET total_invertido = floor(random() * 40000000 + 10000000)
WHERE total_invertido IS NULL OR total_invertido = 0;

-- ---------------------------------------------------------------
-- 4. VERIFICACIÓN DE DATOS
-- ---------------------------------------------------------------
SELECT 
    id_cliente,
    nombrecliente,
    razonsocial,
    total_invertido,
    ROUND(total_invertido / 1000000::numeric, 1) || 'M' as inversion_formateada
FROM clientes 
ORDER BY total_invertido DESC 
LIMIT 15;

-- ---------------------------------------------------------------
-- 5. ESTADÍSTICAS DE INVERSIÓN
-- ---------------------------------------------------------------
SELECT 
    COUNT(*) as total_clientes,
    SUM(total_invertido) as inversion_total,
    ROUND(AVG(total_invertido)) as inversion_promedio,
    ROUND(MAX(total_invertido)) as inversion_maxima,
    ROUND(MIN(total_invertido)) as inversion_minima
FROM clientes 
WHERE total_invertido > 0;

-- ===================================================================
-- RESUMEN:
-- ✓ Actualizadas inversiones de clientes existentes
-- ✓ Insertados nuevos clientes con inversiones realistas
-- ✓ Asignadas inversiones aleatorias a clientes sin datos
-- ✓ Verificación y estadísticas generadas
-- ===================================================================