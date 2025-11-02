-- Script para agregar tipos de cliente (rubros/sectores) si no existen
-- Primero verificar si ya hay datos
SELECT COUNT(*) as total_tipos_cliente FROM tipocliente;

-- Insertar tipos de cliente (usados como rubros/sectores) si la tabla está vacía
INSERT INTO tipocliente (id_tyipoCliente, nombretipocliente, estado) VALUES
(1, 'Educacional', true),
(2, 'Retail', true),
(3, 'Servicios', true),
(4, 'Salud', true),
(5, 'Financiero', true),
(6, 'Gobierno', true),
(7, 'Industrial', true),
(8, 'Tecnología', true),
(9, 'Construcción', true),
(10, 'Transporte', true),
(11, 'Alimentos', true),
(12, 'Entretenimiento', true),
(13, 'Comunicaciones', true),
(14, 'Energía', true),
(15, 'Agricultura', true)
ON CONFLICT (id_tyipoCliente) DO NOTHING;

-- Verificar los datos insertados
SELECT * FROM tipocliente ORDER BY id_tyipoCliente;