-- Script para actualizar la agencia con ID 1 con todos los campos faltantes
-- Completa los datos de la primera agencia existente

UPDATE agencias SET
    nombreidentificador = 'Agencia Digital Creativa',
    nombrefantasia = 'Digital Creativa',
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
    codigo_megatime = 'DIG-001',
    estado = true,
    razonsocial = 'Digital Creativa SpA'
WHERE id = 1;

-- Verificar que se actualizó correctamente
SELECT
    id,
    nombreidentificador,
    nombrefantasia,
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
    codigo_megatime,
    estado,
    razonsocial
FROM agencias
WHERE id = 1;