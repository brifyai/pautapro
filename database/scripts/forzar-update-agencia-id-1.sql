-- Script para forzar la actualización de la agencia ID 1
-- Usar UPSERT para asegurar que los datos se actualicen

-- Primero verificar qué existe actualmente
SELECT * FROM agencias WHERE id = 1;

-- Forzar actualización usando un enfoque diferente
UPDATE agencias SET
    nombreidentificador = 'Agencia Digital Creativa',
    rutagencia = '76.543.210-8',
    giro = 'Servicios de Marketing Digital',
    nombrerepresentantelegal = 'María González',
    rutrepresentante = '12.345.678-9',
    direccionagencia = 'Av. Providencia 1234, Providencia',
    region = 7,
    comuna = 120,
    telcelular = '+56987654321',
    telfijo = '+56226987654',
    email = 'contacto@digitalcreativa.cl',
    estado = true
WHERE id = 1;

-- Verificar que se actualizó
SELECT
    id,
    nombreidentificador,
    rutagencia,
    giro,
    nombrerepresentantelegal,
    rutrepresentante,
    direccionagencia,
    region,
    comuna,
    telcelular,
    telfijo,
    email,
    estado
FROM agencias
WHERE id = 1;

-- Si no hay agencia con ID 1, crear una nueva
INSERT INTO agencias (
    nombreidentificador,
    rutagencia,
    giro,
    nombrerepresentantelegal,
    rutrepresentante,
    direccionagencia,
    region,
    comuna,
    telcelular,
    telfijo,
    email,
    estado
) VALUES (
    'Agencia Digital Creativa',
    '76.543.210-8',
    'Servicios de Marketing Digital',
    'María González',
    '12.345.678-9',
    'Av. Providencia 1234, Providencia',
    7,
    120,
    '+56987654321',
    '+56226987654',
    'contacto@digitalcreativa.cl',
    true
) ON CONFLICT (id) DO UPDATE SET
    nombreidentificador = EXCLUDED.nombreidentificador,
    rutagencia = EXCLUDED.rutagencia,
    giro = EXCLUDED.giro,
    nombrerepresentantelegal = EXCLUDED.nombrerepresentantelegal,
    rutrepresentante = EXCLUDED.rutrepresentante,
    direccionagencia = EXCLUDED.direccionagencia,
    region = EXCLUDED.region,
    comuna = EXCLUDED.comuna,
    telcelular = EXCLUDED.telcelular,
    telfijo = EXCLUDED.telfijo,
    email = EXCLUDED.email,
    estado = EXCLUDED.estado;

-- Verificación final
SELECT * FROM agencias WHERE id = 1;