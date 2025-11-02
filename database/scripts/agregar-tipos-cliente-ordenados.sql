-- Script para agregar tipos de cliente (rubros/sectores) en orden alfabético
-- Primero verificar si ya hay datos
SELECT COUNT(*) as total_tipos_cliente FROM tipocliente;

-- Limpiar tabla existente para asegurar orden correcto
DELETE FROM tipocliente;

-- Insertar tipos de cliente (rubros/sectores) en orden alfabético
INSERT INTO tipocliente (id_tyipoCliente, nombretipocliente, estado) VALUES
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
(11, 'Retail', true),
(12, 'Salud', true),
(13, 'Servicios', true),
(14, 'Tecnología', true),
(15, 'Transporte', true),
(16, 'Turismo', true),
(17, 'Inmobiliario', true),
(18, 'Minería', true),
(19, 'Textil', true),
(20, 'Automotriz', true);

-- Verificar los datos insertados en orden alfabético
SELECT * FROM tipocliente ORDER BY nombretipocliente;