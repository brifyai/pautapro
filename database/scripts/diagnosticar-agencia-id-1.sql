-- Script para diagnosticar qué datos tiene la agencia con ID 1
-- Verificar todos los campos de la tabla agencias

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
    razonsocial,
    created_at,
    updated_at
FROM agencias
WHERE id = 1;

-- Verificar si la tabla tiene las columnas correctas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'agencias'
ORDER BY ordinal_position;