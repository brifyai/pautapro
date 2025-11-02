-- Script corregido para agregar tipos de cliente (usando columna 'id')
-- Primero verificar qué tipos de cliente existen actualmente
SELECT * FROM tipocliente ORDER BY id;

-- Verificar qué clientes usan qué tipos de cliente
SELECT DISTINCT id_tipo_cliente, COUNT(*) as cantidad_clientes
FROM clientes 
WHERE id_tipo_cliente IS NOT NULL
GROUP BY id_tipo_cliente
ORDER BY id_tipo_cliente;

-- Insertar tipos de cliente en orden alfabético (usando IDs secuenciales)
INSERT INTO tipocliente (id, nombretipocliente, estado) VALUES
(1, 'Agricultura', true),
(2, 'Alimentos', true),
(3, 'Comunicaciones', true),
(4, 'Construcción', true),
(5, 'Educacional', true),
(6, 'Energía', true),
(7, 'Entretenimiento', true),
(8, 'Financiero', true),
(9, 'Gobierno', true),
(10, 'Industrial', true),
(11, 'Inmobiliario', true),
(12, 'Minería', true),
(13, 'Retail', true),
(14, 'Salud', true),
(15, 'Servicios', true),
(16, 'Tecnología', true),
(17, 'Textil', true),
(18, 'Transporte', true),
(19, 'Turismo', true),
(20, 'Automotriz', true)
ON CONFLICT (id) DO NOTHING;

-- Verificar todos los tipos de cliente después de la inserción
SELECT * FROM tipocliente ORDER BY nombretipocliente;