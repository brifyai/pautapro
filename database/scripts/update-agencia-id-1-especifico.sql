-- Script específico para actualizar SOLO la agencia con ID 1
-- Sin crear nuevas agencias

-- Verificar qué existe actualmente en ID 1
SELECT id, nombreidentificador, rutagencia, email FROM agencias WHERE id = 1;

-- Actualizar específicamente la agencia ID 1 con datos completos
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
    estado = true,
    updated_at = NOW()
WHERE id = 1;

-- Verificar que se actualizó correctamente
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
    estado,
    updated_at
FROM agencias
WHERE id = 1;

-- Si no existe la agencia ID 1, mostrar mensaje
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN 'No existe agencia con ID 1'
        ELSE 'Agencia ID 1 encontrada y actualizada'
    END as resultado
FROM agencias
WHERE id = 1;