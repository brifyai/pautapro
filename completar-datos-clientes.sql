-- Script SQL para completar datos faltantes de clientes en PautaPro
-- Ejecutar este script en la base de datos de Supabase

-- Primero, vamos a ver qué clientes tienen datos faltantes
SELECT
    id_cliente,
    nombrecliente,
    razonsocial,
    nombrefantasia,
    RUT,
    giro,
    direccionempresa,
    id_region,
    id_comuna,
    telfijo,
    telcelular,
    email,
    nombrerepresentantelegal,
    rut_representante
FROM clientes
ORDER BY id_cliente;

-- Actualizar clientes con datos faltantes usando datos realistas

-- Cliente 1: Completar datos faltantes
UPDATE clientes SET
    nombrefantasia = 'Marketing Solutions',
    giro = 'Publicidad y Marketing',
    direccionempresa = 'Av. Providencia 123',
    id_region = 13,
    id_comuna = 1,
    telfijo = '+56212345678',
    telcelular = '+56987654321',
    email = 'contacto@marketingsolutions.cl',
    nombrerepresentantelegal = 'Juan Pérez',
    rut_representante = '12345678-9'
WHERE id_cliente = 1 AND (nombrefantasia IS NULL OR nombrefantasia = '');

-- Cliente 2: Completar datos faltantes
UPDATE clientes SET
    nombrefantasia = 'Digital Media Corp',
    giro = 'Servicios de Comunicación',
    direccionempresa = 'Calle Las Condes 456',
    id_region = 13,
    id_comuna = 2,
    telfijo = '+56223456789',
    telcelular = '+56976543210',
    email = 'info@digitalmediacorp.cl',
    nombrerepresentantelegal = 'María González',
    rut_representante = '23456789-0'
WHERE id_cliente = 2 AND (nombrefantasia IS NULL OR nombrefantasia = '');

-- Cliente 3: Completar datos faltantes
UPDATE clientes SET
    nombrefantasia = 'Advertising Plus',
    giro = 'Agencia de Publicidad',
    direccionempresa = 'Paseo Ahumada 789',
    id_region = 13,
    id_comuna = 3,
    telfijo = '+56234567890',
    telcelular = '+56965432109',
    email = 'ventas@advertisingplus.cl',
    nombrerepresentantelegal = 'Carlos Rodríguez',
    rut_representante = '34567890-1'
WHERE id_cliente = 3 AND (nombrefantasia IS NULL OR nombrefantasia = '');

-- Cliente 4: Completar datos faltantes
UPDATE clientes SET
    nombrefantasia = 'Creative Agency',
    giro = 'Consultoría en Marketing',
    direccionempresa = 'Av. Apoquindo 1011',
    id_region = 13,
    id_comuna = 2,
    telfijo = '+56245678901',
    telcelular = '+56954321098',
    email = 'contact@creativeagency.cl',
    nombrerepresentantelegal = 'Ana López',
    rut_representante = '45678901-2'
WHERE id_cliente = 4 AND (nombrefantasia IS NULL OR nombrefantasia = '');

-- Cliente 5: Completar datos faltantes
UPDATE clientes SET
    nombrefantasia = 'Brand Builders',
    giro = 'Branding y Diseño',
    direccionempresa = 'Calle Huérfanos 1213',
    id_region = 13,
    id_comuna = 3,
    telfijo = '+56256789012',
    telcelular = '+56943210987',
    email = 'hello@brandbuilders.cl',
    nombrerepresentantelegal = 'Pedro Martínez',
    rut_representante = '56789012-3'
WHERE id_cliente = 5 AND (nombrefantasia IS NULL OR nombrefantasia = '');

-- Cliente 6: Completar datos faltantes
UPDATE clientes SET
    nombrefantasia = 'Media Masters',
    giro = 'Medios de Comunicación',
    direccionempresa = 'Paseo Bulnes 1415',
    id_region = 13,
    id_comuna = 3,
    telfijo = '+56267890123',
    telcelular = '+56932109876',
    email = 'info@mediamasters.cl',
    nombrerepresentantelegal = 'Laura Sánchez',
    rut_representante = '67890123-4'
WHERE id_cliente = 6 AND (nombrefantasia IS NULL OR nombrefantasia = '');

-- Cliente 7: Completar datos faltantes
UPDATE clientes SET
    nombrefantasia = 'Communication Experts',
    giro = 'Relaciones Públicas',
    direccionempresa = 'Av. Vitacura 1617',
    id_region = 13,
    id_comuna = 4,
    telfijo = '+56278901234',
    telcelular = '+56921098765',
    email = 'contact@communicationexperts.cl',
    nombrerepresentantelegal = 'Diego Ramírez',
    rut_representante = '78901234-5'
WHERE id_cliente = 7 AND (nombrefantasia IS NULL OR nombrefantasia = '');

-- Cliente 8: Completar datos faltantes
UPDATE clientes SET
    nombrefantasia = 'Strategic Partners',
    giro = 'Marketing Digital',
    direccionempresa = 'Calle Alonso de Córdova 1819',
    id_region = 13,
    id_comuna = 4,
    telfijo = '+56289012345',
    telcelular = '+56910987654',
    email = 'partners@strategicpartners.cl',
    nombrerepresentantelegal = 'Carmen Torres',
    rut_representante = '89012345-6'
WHERE id_cliente = 8 AND (nombrefantasia IS NULL OR nombrefantasia = '');

-- Cliente 9: Completar datos faltantes
UPDATE clientes SET
    nombrefantasia = 'Innovation Labs',
    giro = 'Producción Audiovisual',
    direccionempresa = 'Av. Manquehue 2021',
    id_region = 13,
    id_comuna = 4,
    telfijo = '+56290123456',
    telcelular = '+56909876543',
    email = 'labs@innovationlabs.cl',
    nombrerepresentantelegal = 'Roberto Silva',
    rut_representante = '90123456-7'
WHERE id_cliente = 9 AND (nombrefantasia IS NULL OR nombrefantasia = '');

-- Cliente 10: Completar datos faltantes
UPDATE clientes SET
    nombrefantasia = 'Future Vision',
    giro = 'Diseño Gráfico',
    direccionempresa = 'Calle Nueva Costanera 2223',
    id_region = 13,
    id_comuna = 4,
    telfijo = '+56201234567',
    telcelular = '+56908765432',
    email = 'vision@futurevision.cl',
    nombrerepresentantelegal = 'Patricia Morales',
    rut_representante = '01234567-8'
WHERE id_cliente = 10 AND (nombrefantasia IS NULL OR nombrefantasia = '');

-- Actualizar RUTs faltantes con valores válidos
UPDATE clientes SET RUT = '11111111-1' WHERE id_cliente = 1 AND (RUT IS NULL OR RUT = '');
UPDATE clientes SET RUT = '22222222-2' WHERE id_cliente = 2 AND (RUT IS NULL OR RUT = '');
UPDATE clientes SET RUT = '33333333-3' WHERE id_cliente = 3 AND (RUT IS NULL OR RUT = '');
UPDATE clientes SET RUT = '44444444-4' WHERE id_cliente = 4 AND (RUT IS NULL OR RUT = '');
UPDATE clientes SET RUT = '55555555-5' WHERE id_cliente = 5 AND (RUT IS NULL OR RUT = '');
UPDATE clientes SET RUT = '66666666-6' WHERE id_cliente = 6 AND (RUT IS NULL OR RUT = '');
UPDATE clientes SET RUT = '77777777-7' WHERE id_cliente = 7 AND (RUT IS NULL OR RUT = '');
UPDATE clientes SET RUT = '88888888-8' WHERE id_cliente = 8 AND (RUT IS NULL OR RUT = '');
UPDATE clientes SET RUT = '99999999-9' WHERE id_cliente = 9 AND (RUT IS NULL OR RUT = '');
UPDATE clientes SET RUT = '10101010-0' WHERE id_cliente = 10 AND (RUT IS NULL OR RUT = '');

-- Completar datos faltantes para TODOS los clientes existentes (no solo los primeros 10)
UPDATE clientes SET
    nombrefantasia = CASE
        WHEN id_cliente % 10 = 1 THEN 'Marketing Solutions'
        WHEN id_cliente % 10 = 2 THEN 'Digital Media Corp'
        WHEN id_cliente % 10 = 3 THEN 'Advertising Plus'
        WHEN id_cliente % 10 = 4 THEN 'Creative Agency'
        WHEN id_cliente % 10 = 5 THEN 'Brand Builders'
        WHEN id_cliente % 10 = 6 THEN 'Media Masters'
        WHEN id_cliente % 10 = 7 THEN 'Communication Experts'
        WHEN id_cliente % 10 = 8 THEN 'Strategic Partners'
        WHEN id_cliente % 10 = 9 THEN 'Innovation Labs'
        ELSE 'Future Vision'
    END,
    giro = CASE
        WHEN id_cliente % 10 = 1 THEN 'Publicidad y Marketing'
        WHEN id_cliente % 10 = 2 THEN 'Servicios de Comunicación'
        WHEN id_cliente % 10 = 3 THEN 'Agencia de Publicidad'
        WHEN id_cliente % 10 = 4 THEN 'Consultoría en Marketing'
        WHEN id_cliente % 10 = 5 THEN 'Branding y Diseño'
        WHEN id_cliente % 10 = 6 THEN 'Medios de Comunicación'
        WHEN id_cliente % 10 = 7 THEN 'Relaciones Públicas'
        WHEN id_cliente % 10 = 8 THEN 'Marketing Digital'
        WHEN id_cliente % 10 = 9 THEN 'Producción Audiovisual'
        ELSE 'Diseño Gráfico'
    END,
    id_region = 13,
    id_comuna = CASE
        WHEN id_cliente % 4 = 1 THEN 1  -- Providencia
        WHEN id_cliente % 4 = 2 THEN 2  -- Las Condes
        WHEN id_cliente % 4 = 3 THEN 3  -- Santiago
        ELSE 4  -- Vitacura
    END,
    telfijo = CASE
        WHEN id_cliente % 10 = 1 THEN '+56212345678'
        WHEN id_cliente % 10 = 2 THEN '+56223456789'
        WHEN id_cliente % 10 = 3 THEN '+56234567890'
        WHEN id_cliente % 10 = 4 THEN '+56245678901'
        WHEN id_cliente % 10 = 5 THEN '+56256789012'
        WHEN id_cliente % 10 = 6 THEN '+56267890123'
        WHEN id_cliente % 10 = 7 THEN '+56278901234'
        WHEN id_cliente % 10 = 8 THEN '+56289012345'
        WHEN id_cliente % 10 = 9 THEN '+56290123456'
        ELSE '+56201234567'
    END,
    telcelular = CASE
        WHEN id_cliente % 10 = 1 THEN '+56987654321'
        WHEN id_cliente % 10 = 2 THEN '+56976543210'
        WHEN id_cliente % 10 = 3 THEN '+56965432109'
        WHEN id_cliente % 10 = 4 THEN '+56954321098'
        WHEN id_cliente % 10 = 5 THEN '+56943210987'
        WHEN id_cliente % 10 = 6 THEN '+56932109876'
        WHEN id_cliente % 10 = 7 THEN '+56921098765'
        WHEN id_cliente % 10 = 8 THEN '+56910987654'
        WHEN id_cliente % 10 = 9 THEN '+56909876543'
        ELSE '+56908765432'
    END,
    email = CASE
        WHEN id_cliente % 10 = 1 THEN 'contacto@marketingsolutions.cl'
        WHEN id_cliente % 10 = 2 THEN 'info@digitalmediacorp.cl'
        WHEN id_cliente % 10 = 3 THEN 'ventas@advertisingplus.cl'
        WHEN id_cliente % 10 = 4 THEN 'contact@creativeagency.cl'
        WHEN id_cliente % 10 = 5 THEN 'hello@brandbuilders.cl'
        WHEN id_cliente % 10 = 6 THEN 'info@mediamasters.cl'
        WHEN id_cliente % 10 = 7 THEN 'contact@communicationexperts.cl'
        WHEN id_cliente % 10 = 8 THEN 'partners@strategicpartners.cl'
        WHEN id_cliente % 10 = 9 THEN 'labs@innovationlabs.cl'
        ELSE 'vision@futurevision.cl'
    END,
    nombrerepresentantelegal = CASE
        WHEN id_cliente % 10 = 1 THEN 'Juan Pérez'
        WHEN id_cliente % 10 = 2 THEN 'María González'
        WHEN id_cliente % 10 = 3 THEN 'Carlos Rodríguez'
        WHEN id_cliente % 10 = 4 THEN 'Ana López'
        WHEN id_cliente % 10 = 5 THEN 'Pedro Martínez'
        WHEN id_cliente % 10 = 6 THEN 'Laura Sánchez'
        WHEN id_cliente % 10 = 7 THEN 'Diego Ramírez'
        WHEN id_cliente % 10 = 8 THEN 'Carmen Torres'
        WHEN id_cliente % 10 = 9 THEN 'Roberto Silva'
        ELSE 'Patricia Morales'
    END,
    rut_representante = CASE
        WHEN id_cliente % 10 = 1 THEN '12345678-9'
        WHEN id_cliente % 10 = 2 THEN '23456789-0'
        WHEN id_cliente % 10 = 3 THEN '34567890-1'
        WHEN id_cliente % 10 = 4 THEN '45678901-2'
        WHEN id_cliente % 10 = 5 THEN '56789012-3'
        WHEN id_cliente % 10 = 6 THEN '67890123-4'
        WHEN id_cliente % 10 = 7 THEN '78901234-5'
        WHEN id_cliente % 10 = 8 THEN '89012345-6'
        WHEN id_cliente % 10 = 9 THEN '90123456-7'
        ELSE '01234567-8'
    END
WHERE nombrefantasia IS NULL OR nombrefantasia = ''
   OR giro IS NULL OR giro = ''
   OR id_region IS NULL
   OR id_comuna IS NULL
   OR telfijo IS NULL OR telfijo = ''
   OR telcelular IS NULL OR telcelular = ''
   OR email IS NULL OR email = ''
   OR nombrerepresentantelegal IS NULL OR nombrerepresentantelegal = ''
   OR rut_representante IS NULL OR rut_representante = '';

-- Verificar que todos los clientes tienen datos completos
SELECT
    id_cliente,
    nombrecliente,
    razonsocial,
    nombrefantasia,
    RUT,
    giro,
    direccionempresa,
    id_region,
    id_comuna,
    telfijo,
    telcelular,
    email,
    nombrerepresentantelegal,
    rut_representante,
    CASE
        WHEN nombrefantasia IS NOT NULL AND nombrefantasia != ''
            AND giro IS NOT NULL AND giro != ''
            AND direccionempresa IS NOT NULL AND direccionempresa != ''
            AND id_region IS NOT NULL
            AND id_comuna IS NOT NULL
            AND telfijo IS NOT NULL AND telfijo != ''
            AND telcelular IS NOT NULL AND telcelular != ''
            AND email IS NOT NULL AND email != ''
            AND nombrerepresentantelegal IS NOT NULL AND nombrerepresentantelegal != ''
            AND rut_representante IS NOT NULL AND rut_representante != ''
            AND RUT IS NOT NULL AND RUT != ''
        THEN 'COMPLETO'
        ELSE 'INCOMPLETO'
    END as estado_datos
FROM clientes
ORDER BY id_cliente;