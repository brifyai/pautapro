-- Script final para agregar tipos de cliente (solo con columnas existentes)
-- Primero verificar qué tipos de cliente existen actualmente
SELECT * FROM tipocliente ORDER BY id;

-- Verificar qué clientes usan qué tipos de cliente
SELECT DISTINCT id_tipo_cliente, COUNT(*) as cantidad_clientes
FROM clientes 
WHERE id_tipo_cliente IS NOT NULL
GROUP BY id_tipo_cliente
ORDER BY id_tipo_cliente;

-- Insertar tipos de cliente en orden alfabético (solo id y nombretipocliente)
INSERT INTO tipocliente (id, nombretipocliente) VALUES
(1, 'Agricultura'),
(2, 'Alimentos'),
(3, 'Comunicaciones'),
(4, 'Construcción'),
(5, 'Educacional'),
(6, 'Energía'),
(7, 'Entretenimiento'),
(8, 'Financiero'),
(9, 'Gobierno'),
(10, 'Industrial'),
(11, 'Inmobiliario'),
(12, 'Minería'),
(13, 'Retail'),
(14, 'Salud'),
(15, 'Servicios'),
(16, 'Tecnología'),
(17, 'Textil'),
(18, 'Transporte'),
(19, 'Turismo'),
(20, 'Automotriz')
ON CONFLICT (id) DO NOTHING;

-- Verificar todos los tipos de cliente después de la inserción
SELECT * FROM tipocliente ORDER BY nombretipocliente;