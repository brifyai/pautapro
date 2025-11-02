-- Script simple para restaurar medios sin errores de sintaxis
-- Ejecutar en Supabase SQL Editor

-- 1. Crear tabla si no existe
CREATE TABLE IF NOT EXISTS medios (
    id INTEGER PRIMARY KEY,
    nombredelmedio VARCHAR(255) NOT NULL UNIQUE,
    codigo VARCHAR(50),
    estado BOOLEAN DEFAULT true,
    duracion BOOLEAN DEFAULT false,
    codigo_megatime BOOLEAN DEFAULT false,
    color BOOLEAN DEFAULT false,
    calidad BOOLEAN DEFAULT false,
    cooperado BOOLEAN DEFAULT false,
    rubro BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Limpiar datos existentes
DELETE FROM medios;

-- 3. Insertar medios de ejemplo
INSERT INTO medios (id, nombredelmedio, codigo, estado, duracion, codigo_megatime, color, calidad, cooperado, rubro) VALUES
(1, 'TV Abierta', 'TV001', true, true, false, false, true, false, false),
(2, 'TV Cable', 'TV002', true, true, false, false, true, false, false),
(3, 'Radio AM', 'RA001', true, true, false, false, false, false, false),
(4, 'Radio FM', 'RA002', true, true, false, false, false, false, false),
(5, 'Diario', 'DI001', true, false, false, false, false, false, false, false),
(6, 'Revista', 'RV001', true, false, false, false, false, false, false, false),
(7, 'Internet Banner', 'IN001', true, false, false, true, false, false, false, false),
(8, 'Redes Sociales', 'RS001', true, false, false, true, false, false, false, false),
(9, 'Cine', 'CI001', true, true, false, false, true, false, false, false),
(10, 'Vía Pública', 'VP001', true, false, false, false, false, false, false, false),
(11, 'Transporte', 'TR001', true, false, false, false, false, false, false, false),
(12, 'Marketing Digital', 'MD001', true, false, false, true, false, false, false, false),
(13, 'Streaming', 'ST001', true, true, false, true, false, true, false, false);

-- 4. Verificar resultados
SELECT COUNT(*) as total_medios FROM medios;

-- 5. Mostrar todos los medios
SELECT id, nombredelmedio, codigo, estado FROM medios ORDER BY id;