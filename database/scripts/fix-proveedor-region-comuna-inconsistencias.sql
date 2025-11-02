-- Script para corregir inconsistencias de región-comuna en proveedores
-- Problema: Algunos proveedores tienen comunas que no pertenecen a su región asignada

-- Primero, identifiquemos todas las inconsistencias
SELECT
    p.id_proveedor,
    p.nombreproveedor,
    p.id_region,
    r.nombreregion as region_actual,
    p.id_comuna,
    c.nombrecomuna as comuna_actual,
    c.id_region as region_real_de_comuna
FROM proveedores p
LEFT JOIN region r ON p.id_region = r.id
LEFT JOIN comunas c ON p.id_comuna = c.id
WHERE p.id_region != c.id_region OR c.id_region IS NULL;

-- Corrección para comunas que pertenecen a la Región Metropolitana (7)
-- Comuna 120 (Providencia) -> Región Metropolitana (7)
UPDATE proveedores
SET id_region = 7
WHERE id_comuna = 120 AND id_region != 7;

-- Comuna 131 (Calera de Tango) -> Región Metropolitana (7)
UPDATE proveedores
SET id_region = 7
WHERE id_comuna = 131 AND id_region != 7;

-- Comuna 134 (Alhué) -> Región Metropolitana (7)
UPDATE proveedores
SET id_region = 7
WHERE id_comuna = 134 AND id_region != 7;

-- Comuna 135 (Curacaví) -> Región Metropolitana (7)
UPDATE proveedores
SET id_region = 7
WHERE id_comuna = 135 AND id_region != 7;

-- Comuna 136 (María Pinto) -> Región Metropolitana (7)
UPDATE proveedores
SET id_region = 7
WHERE id_comuna = 136 AND id_region != 7;

-- Comuna 137 (Melipilla) -> Región Metropolitana (7)
UPDATE proveedores
SET id_region = 7
WHERE id_comuna = 137 AND id_region != 7;

-- Comuna 138 (San Pedro) -> Región Metropolitana (7)
UPDATE proveedores
SET id_region = 7
WHERE id_comuna = 138 AND id_region != 7;

-- Comuna 139 (Talagante) -> Región Metropolitana (7)
UPDATE proveedores
SET id_region = 7
WHERE id_comuna = 139 AND id_region != 7;

-- Comuna 140 (El Monte) -> Región Metropolitana (7)
UPDATE proveedores
SET id_region = 7
WHERE id_comuna = 140 AND id_region != 7;

-- Comuna 141 (Isla de Maipo) -> Región Metropolitana (7)
UPDATE proveedores
SET id_region = 7
WHERE id_comuna = 141 AND id_region != 7;

-- Comuna 142 (Padre Hurtado) -> Región Metropolitana (7)
UPDATE proveedores
SET id_region = 7
WHERE id_comuna = 142 AND id_region != 7;

-- Comuna 143 (Peñaflor) -> Región Metropolitana (7)
UPDATE proveedores
SET id_region = 7
WHERE id_comuna = 143 AND id_region != 7;

-- Corrección para comunas que pertenecen a la Región de Los Ríos (13)
-- Comuna 298 (La Unión) -> Región de Los Ríos (13)
UPDATE proveedores
SET id_region = 13
WHERE id_comuna = 298 AND id_region != 13;

-- Comuna 299 (Río Bueno) -> Región de Los Ríos (13)
UPDATE proveedores
SET id_region = 13
WHERE id_comuna = 299 AND id_region != 13;

-- Comuna 300 (Paillaco) -> Región de Los Ríos (13)
UPDATE proveedores
SET id_region = 13
WHERE id_comuna = 300 AND id_region != 13;

-- Comuna 301 (Lago Ranco) -> Región de Los Ríos (13)
UPDATE proveedores
SET id_region = 13
WHERE id_comuna = 301 AND id_region != 13;

-- Comuna 302 (Corral) -> Región de Los Ríos (13)
UPDATE proveedores
SET id_region = 13
WHERE id_comuna = 302 AND id_region != 13;

-- Comuna 303 (Máfil) -> Región de Los Ríos (13)
UPDATE proveedores
SET id_region = 13
WHERE id_comuna = 303 AND id_region != 13;

-- Comuna 304 (Valdivia) -> Región de Los Ríos (13)
UPDATE proveedores
SET id_region = 13
WHERE id_comuna = 304 AND id_region != 13;

-- Comuna 305 (Lanco) -> Región de Los Ríos (13)
UPDATE proveedores
SET id_region = 13
WHERE id_comuna = 305 AND id_region != 13;

-- Comuna 306 (Panguipulli) -> Región de Los Ríos (13)
UPDATE proveedores
SET id_region = 13
WHERE id_comuna = 306 AND id_region != 13;

-- Comuna 307 (Futrono) -> Región de Los Ríos (13)
UPDATE proveedores
SET id_region = 13
WHERE id_comuna = 307 AND id_region != 13;

-- Comuna 308 (Los Lagos) -> Región de Los Ríos (13)
UPDATE proveedores
SET id_region = 13
WHERE id_comuna = 308 AND id_region != 13;

-- Comuna 309 (Mariquina) -> Región de Los Ríos (13)
UPDATE proveedores
SET id_region = 13
WHERE id_comuna = 309 AND id_region != 13;

-- Verificación final
SELECT
    p.id_proveedor,
    p.nombreproveedor,
    p.id_region,
    r.nombreregion as region_corregida,
    p.id_comuna,
    c.nombrecomuna as comuna_actual,
    c.id_region as region_real_de_comuna,
    CASE WHEN p.id_region = c.id_region THEN '✅ CORRECTO' ELSE '❌ INCORRECTO' END as estado
FROM proveedores p
LEFT JOIN region r ON p.id_region = r.id
LEFT JOIN comunas c ON p.id_comuna = c.id
ORDER BY estado DESC, p.nombreproveedor;

-- Actualizar timestamps para todos los proveedores corregidos
UPDATE proveedores
SET updated_at = NOW()
WHERE id_comuna IN (
    120, 131, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143,
    298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309
);