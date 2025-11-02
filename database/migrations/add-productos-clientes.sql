-- Script para agregar productos de ejemplo a todos los clientes registrados
-- Ejecutar en Supabase SQL Editor

-- Cliente 1: Empresa Ejemplo S.A. (Empresa general)
INSERT INTO productos (id_cliente, nombredelproducto, estado) VALUES
(1, 'Día de la Madre 2025', true),
(1, 'Navidad 2024', true),
(1, 'Especial de Ofertas Primavera', true),
(1, 'Cyber Monday 2024', true);

-- Cliente 2: Andes Media Group (Medios de comunicación)
INSERT INTO productos (id_cliente, nombredelproducto, estado) VALUES
(2, 'Campaña Día del Padre', true),
(2, 'Especial Fiestas Patrias', true),
(2, 'Black Friday 2024', true),
(2, 'Año Nuevo 2025', true);

-- Cliente 3: Pacífico Retail Partners (Retail)
INSERT INTO productos (id_cliente, nombredelproducto, estado) VALUES
(3, 'Liquidación Verano', true),
(3, 'Día de los Enamorados', true),
(3, 'Especial Back to School', true),
(3, 'Navidad Premium', true);

-- Cliente 4: BioSur Laboratorios (Farmacéutico)
INSERT INTO productos (id_cliente, nombredelproducto, estado) VALUES
(4, 'Campaña Salud Dental', true),
(4, 'Especial Vitaminas', true),
(4, 'Día Mundial de la Salud', true),
(4, 'Cyber Salud', true);

-- Cliente 5: Altamar Cruceros (Turismo)
INSERT INTO productos (id_cliente, nombredelproducto, estado) VALUES
(5, 'Cruceros de Verano', true),
(5, 'Especial Luna de Miel', true),
(5, 'Navidad en el Mar', true),
(5, 'Viajes de Invierno', true);

-- Cliente 6: Cordillera Foods (Alimentos)
INSERT INTO productos (id_cliente, nombredelproducto, estado) VALUES
(6, 'Especial Día del Niño', true),
(6, 'Campaña Productos Orgánicos', true),
(6, 'Navidad Gourmet', true),
(6, 'Especial Desayunos', true);

-- Cliente 7: LuzNorte Energía (Energía)
INSERT INTO productos (id_cliente, nombredelproducto, estado) VALUES
(7, 'Campaña Energía Solar', true),
(7, 'Especial Ahorro Energético', true),
(7, 'Día Mundial del Medio Ambiente', true),
(7, 'Planes Residenciales', true);

-- Cliente 8: Marítima del Pacífico (Transporte marítimo)
INSERT INTO productos (id_cliente, nombredelproducto, estado) VALUES
(8, 'Especial Carga Internacional', true),
(8, 'Campaña Puertos del Pacífico', true),
(8, 'Navidad Logística', true),
(8, 'Especial Contenedores', true);

-- Cliente 9: Finanzas Andina (Finanzas)
INSERT INTO productos (id_cliente, nombredelproducto, estado) VALUES
(9, 'Campaña Créditos Personales', true),
(9, 'Especial Inversión', true),
(9, 'Planes de Ahorro', true),
(9, 'Cyber Finanzas', true);

-- Cliente 10: InnovaTech Solutions (Tecnología)
INSERT INTO productos (id_cliente, nombredelproducto, estado) VALUES
(10, 'Especial Software Empresarial', true),
(10, 'Campaña Cloud Computing', true),
(10, 'Día Mundial de Internet', true),
(10, 'Especial Ciberseguridad', true);

-- Cliente 11: Patagonia Outdoor Retail (Retail outdoor)
INSERT INTO productos (id_cliente, nombredelproducto, estado) VALUES
(11, 'Especial Montañismo', true),
(11, 'Campaña Camping', true),
(11, 'Navidad Outdoor', true),
(11, 'Especial Invierno', true);

-- Verificar inserción
SELECT
    c.id_cliente,
    cl.nombrecliente,
    COUNT(p.id) as total_productos,
    STRING_AGG(p.nombredelproducto, ', ') as productos
FROM clientes cl
LEFT JOIN productos p ON cl.id_cliente = p.id_cliente
LEFT JOIN clientes c ON cl.id_cliente = c.id_cliente
GROUP BY c.id_cliente, cl.nombrecliente
ORDER BY c.id_cliente;