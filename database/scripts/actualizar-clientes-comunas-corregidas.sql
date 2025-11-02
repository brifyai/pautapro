-- Script SQL para actualizar TODOS los clientes con datos completos y comunas correctas
-- Ejecutar este script directamente en el editor SQL de Supabase

-- Primero, veamos cuántos clientes existen
SELECT COUNT(*) as total_clientes FROM clientes;

-- Actualizar TODOS los clientes existentes con datos realistas y comunas correctas
-- Este script actualizará cada cliente individualmente con datos únicos

-- Cliente 1 - Tecnología (Providencia, Región Metropolitana)
UPDATE clientes
SET
    nombrefantasia = 'TechCorp Solutions',
    giro = 'Tecnología y Servicios Informáticos',
    id_grupo = 1,
    nombrerepresentantelegal = 'Juan Carlos',
    apellidorepresentante = 'Rodríguez Pérez',
    rut_representante = '12.345.678-9',
    telcelular = '+56987654321',
    telfijo = '+56223456789',
    id_region = 7,
    id_comuna = 274,  -- Providencia
    direccion = 'Av. Providencia 1234, Oficina 501',
    email = 'contacto@techcorp.cl',
    web_cliente = 'www.techcorp.cl'
WHERE id_cliente = 1;

-- Cliente 2 - Retail (Santiago, Región Metropolitana)
UPDATE clientes
SET
    nombrefantasia = 'RetailMax',
    giro = 'Comercio Minorista y Ventas al por Mayor',
    id_grupo = 2,
    nombrerepresentantelegal = 'María Alejandra',
    apellidorepresentante = 'González Muñoz',
    rut_representante = '15.678.901-2',
    telcelular = '+56998765432',
    telfijo = '+56234567890',
    id_region = 7,
    id_comuna = 322,  -- Santiago
    direccion = 'Ahumada 567, Piso 3',
    email = 'ventas@retailmax.cl',
    web_cliente = 'www.retailmax.cl'
WHERE id_cliente = 2;

-- Cliente 3 - Construcción (Vitacura, Región Metropolitana)
UPDATE clientes
SET
    nombrefantasia = 'ConstruyeAndo',
    giro = 'Construcción y Obras Civiles',
    id_grupo = 3,
    nombrerepresentantelegal = 'Pedro Antonio',
    apellidorepresentante = 'Silva Torres',
    rut_representante = '18.901.234-5',
    telcelular = '+56982345678',
    telfijo = '+56245678901',
    id_region = 7,
    id_comuna = 289,  -- Vitacura
    direccion = 'Vitacura 789, Torre A, Oficina 1203',
    email = 'info@construyeando.cl',
    web_cliente = 'www.construyeando.cl'
WHERE id_cliente = 3;

-- Cliente 4 - Restaurantes (Las Condes, Región Metropolitana)
UPDATE clientes
SET
    nombrefantasia = 'FoodExpress',
    giro = 'Restaurantes y Servicios de Alimentación',
    id_grupo = 1,
    nombrerepresentantelegal = 'Catalina Isabel',
    apellidorepresentante = 'Morales Fuentes',
    rut_representante = '11.234.567-8',
    telcelular = '+56971234567',
    telfijo = '+56256789012',
    id_region = 7,
    id_comuna = 261,  -- Las Condes
    direccion = 'Las Condes 234, Local 45',
    email = 'contacto@foodexpress.cl',
    web_cliente = 'www.foodexpress.cl'
WHERE id_cliente = 4;

-- Cliente 5 - Educación (Santiago, Región Metropolitana)
UPDATE clientes
SET
    nombrefantasia = 'EduLearn',
    giro = 'Educación y Capacitación',
    id_grupo = 2,
    nombrerepresentantelegal = 'Roberto Carlos',
    apellidorepresentante = 'Díaz Rojas',
    rut_representante = '20.123.456-7',
    telcelular = '+56993456789',
    telfijo = '+56267890123',
    id_region = 7,
    id_comuna = 322,  -- Santiago
    direccion = 'Moneda 890, Piso 15',
    email = 'info@edulearn.cl',
    web_cliente = 'www.edulearn.cl'
WHERE id_cliente = 5;

-- Cliente 6 - Logística (Valparaíso, Región de Valparaíso)
UPDATE clientes
SET
    nombrefantasia = 'LogisticsPro',
    giro = 'Transporte y Logística',
    id_grupo = 3,
    nombrerepresentantelegal = 'Luis Alberto',
    apellidorepresentante = 'Martínez Vargas',
    rut_representante = '16.789.012-3',
    telcelular = '+56995678901',
    telfijo = '+56322456789',
    id_region = 5,  -- Valparaíso
    id_comuna = 281,  -- Valparaíso
    direccion = 'Av. Argentina 1234, Puerto',
    email = 'operaciones@logisticspro.cl',
    web_cliente = 'www.logisticspro.cl'
WHERE id_cliente = 6;

-- Cliente 7 - Moda (Las Condes, Región Metropolitana)
UPDATE clientes
SET
    nombrefantasia = 'FashionStyle',
    giro = 'Textil y Moda',
    id_grupo = 2,
    nombrerepresentantelegal = 'Patricia Alejandra',
    apellidorepresentante = 'Ramírez Castro',
    rut_representante = '14.567.890-1',
    telcelular = '+56986789012',
    telfijo = '+56222345678',
    id_region = 7,  -- Región Metropolitana
    id_comuna = 261,  -- Las Condes
    direccion = 'Apoquindo 4567, Mall Costanera Center',
    email = 'info@fashionstyle.cl',
    web_cliente = 'www.fashionstyle.cl'
WHERE id_cliente = 7;

-- Cliente 8 - Energía Renovable (Concepción, Región del Biobío)
UPDATE clientes
SET
    nombrefantasia = 'GreenEnergy',
    giro = 'Energías Renovables',
    id_grupo = 1,
    nombrerepresentantelegal = 'Claudia Andrea',
    apellidorepresentante = 'Soto Navarro',
    rut_representante = '19.012.345-6',
    telcelular = '+56941901234',
    telfijo = '+56412234567',
    id_region = 8,  -- Biobío
    id_comuna = 141,  -- Concepción
    direccion = 'Aníbal Pinto 123, Oficina 502',
    email = 'contacto@greenenergy.cl',
    web_cliente = 'www.greenenergy.cl'
WHERE id_cliente = 8;

-- Cliente 9 - Salud (Providencia, Región Metropolitana)
UPDATE clientes
SET
    nombrefantasia = 'SaludPlus',
    giro = 'Servicios Médicos y Salud',
    id_grupo = 3,
    nombrerepresentantelegal = 'Ana María',
    apellidorepresentante = 'López Soto',
    rut_representante = '13.456.789-0',
    telcelular = '+56994567890',
    telfijo = '+56227456789',
    id_region = 7,  -- Región Metropolitana
    id_comuna = 274,  -- Providencia
    direccion = 'Marcoleta 345, Clínica Santa María',
    email = 'contacto@saludplus.cl',
    web_cliente = 'www.saludplus.cl'
WHERE id_cliente = 9;

-- Cliente 10 - Automotriz (Maipú, Región Metropolitana)
UPDATE clientes
SET
    nombrefantasia = 'AutoMotive',
    giro = 'Venta y Reparación de Vehículos',
    id_grupo = 1,
    nombrerepresentantelegal = 'Jorge Eduardo',
    apellidorepresentante = 'Fernández Bravo',
    rut_representante = '17.890.123-4',
    telcelular = '+56997890123',
    telfijo = '+56253345678',
    id_region = 7,  -- Región Metropolitana
    id_comuna = 320,  -- Maipú
    direccion = 'Camino a Melipilla 1234, Concesionario Oficial',
    email = 'ventas@automotive.cl',
    web_cliente = 'www.automotive.cl'
WHERE id_cliente = 10;

-- Cliente 11 - Finanzas (Santiago, Región Metropolitana)
UPDATE clientes
SET
    nombrefantasia = 'FinanceHub',
    giro = 'Servicios Financieros',
    id_grupo = 2,
    nombrerepresentantelegal = 'Carlos Andrés',
    apellidorepresentante = 'Herrera González',
    rut_representante = '21.234.567-8',
    telcelular = '+56992345678',
    telfijo = '+56269123456',
    id_region = 7,  -- Región Metropolitana
    id_comuna = 322,  -- Santiago
    direccion = 'Bandera 123, Piso 8, Torre Financiera',
    email = 'info@financehub.cl',
    web_cliente = 'www.financehub.cl'
WHERE id_cliente = 11;

-- Cliente 12 - Medios (Providencia, Región Metropolitana)
UPDATE clientes
SET
    nombrefantasia = 'MediaGroup',
    giro = 'Medios y Comunicación',
    id_grupo = 1,
    nombrerepresentantelegal = 'Sofía Beatriz',
    apellidorepresentante = 'Pérez Morales',
    rut_representante = '22.345.678-9',
    telcelular = '+56993456789',
    telfijo = '+56277234567',
    id_region = 7,  -- Región Metropolitana
    id_comuna = 274,  -- Providencia
    direccion = 'San Antonio 456, Estudio de Grabación',
    email = 'contacto@mediagroup.cl',
    web_cliente = 'www.mediagroup.cl'
WHERE id_cliente = 12;

-- Cliente 13 - Deportes (Chillán, Región de Ñuble)
UPDATE clientes
SET
    nombrefantasia = 'SportLife',
    giro = 'Deporte y Entretenimiento',
    id_grupo = 3,
    nombrerepresentantelegal = 'Diego Martín',
    apellidorepresentante = 'Sánchez Silva',
    rut_representante = '23.456.789-0',
    telcelular = '+56422345678',
    telfijo = '+56422345678',
    id_region = 10,  -- Ñuble
    id_comuna = 120,  -- Chillán
    direccion = 'Avenida O''Higgins 123, Centro Deportivo Municipal',
    email = 'info@sportlife.cl',
    web_cliente = 'www.sportlife.cl'
WHERE id_cliente = 13;

-- Cliente 14 - Hogar (Viña del Mar, Región de Valparaíso)
UPDATE clientes
SET
    nombrefantasia = 'HomeDecor',
    giro = 'Decoración y Hogar',
    id_grupo = 2,
    nombrerepresentantelegal = 'Valentina Paz',
    apellidorepresentante = 'Ramírez Fernández',
    rut_representante = '24.567.890-1',
    telcelular = '+56322345678',
    telfijo = '+56322345678',
    id_region = 6,  -- Valparaíso
    id_comuna = 283,  -- Viña del Mar
    direccion = 'Av. Perú 1234, Local Comercial',
    email = 'ventas@homedecor.cl',
    web_cliente = 'www.homedecor.cl'
WHERE id_cliente = 14;

-- Cliente 15 - Turismo (Antofagasta, Región de Antofagasta)
UPDATE clientes
SET
    nombrefantasia = 'TravelPlus',
    giro = 'Turismo y Hotelería',
    id_grupo = 1,
    nombrerepresentantelegal = 'Francisco Javier',
    apellidorepresentante = 'Torres Díaz',
    rut_representante = '25.678.901-2',
    telcelular = '+56922345678',
    telfijo = '+56222345678',
    id_region = 2,  -- Antofagasta
    id_comuna = 21,  -- Antofagasta
    direccion = 'Baquedano 456, Hotel del Norte',
    email = 'reservas@travelplus.cl',
    web_cliente = 'www.travelplus.cl'
WHERE id_cliente = 15;

-- Verificar resultados
SELECT 
    id_cliente,
    nombrecliente,
    nombrefantasia,
    giro,
    nombrerepresentantelegal,
    apellidorepresentante,
    rut_representante,
    telcelular,
    id_region,
    id_comuna,
    direccion,
    email,
    web_cliente
FROM clientes 
ORDER BY id_cliente;

-- Verificar relación región-comuna
SELECT 
    cl.id_cliente,
    cl.nombrefantasia,
    cl.id_region,
    r.nombre_region,
    cl.id_comuna,
    c.nombrecomuna,
    CASE 
        WHEN cl.id_region = c.id_region THEN '✓ Correcto'
        ELSE '✗ Incorrecto'
    END as relacion_correcta
FROM clientes cl
LEFT JOIN region r ON cl.id_region = r.id
LEFT JOIN comunas c ON cl.id_comuna = c.id
ORDER BY cl.id_cliente;