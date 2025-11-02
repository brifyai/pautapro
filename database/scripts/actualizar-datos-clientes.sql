-- Script para actualizar todos los clientes existentes con datos completos
-- Este script llena los campos faltantes con información realista

-- Primero, verifiquemos cuántos clientes existen y qué campos están vacíos
SELECT 
    id_cliente,
    nombrecliente,
    nombrefantasia,
    giro,
    id_grupo,
    nombrerepresentantelegal,
    rut_representante,
    telcelular,
    telfijo,
    id_region,
    id_comuna,
    razonsocial
FROM clientes 
ORDER BY id_cliente;

-- Actualizar clientes con datos realistas
-- Cliente 1
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
    id_comuna = 341,
    direccion = 'Av. Providencia 1234, Oficina 501',
    email = 'contacto@techcorp.cl',
    web_cliente = 'www.techcorp.cl'
WHERE id_cliente = 1;

-- Cliente 2
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
    id_comuna = 322,
    direccion = 'Ahumada 567, Piso 3',
    email = 'ventas@retailmax.cl',
    web_cliente = 'www.retailmax.cl'
WHERE id_cliente = 2;

-- Cliente 3
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
    id_comuna = 289,
    direccion = 'Vitacura 789, Torre A, Oficina 1203',
    email = 'info@construyeando.cl',
    web_cliente = 'www.construyeando.cl'
WHERE id_cliente = 3;

-- Cliente 4
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
    id_comuna = 261,
    direccion = 'Las Condes 234, Local 45',
    email = 'contacto@foodexpress.cl',
    web_cliente = 'www.foodexpress.cl'
WHERE id_cliente = 4;

-- Cliente 5
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
    id_comuna = 335,
    direccion = 'Moneda 890, Piso 15',
    email = 'info@edulearn.cl',
    web_cliente = 'www.edulearn.cl'
WHERE id_cliente = 5;

-- Cliente 6 (si existe)
UPDATE clientes 
SET 
    nombrefantasia = 'SaludPlus',
    giro = 'Servicios Médicos y Salud',
    id_grupo = 3,
    nombrerepresentantelegal = 'Ana María',
    apellidorepresentante = 'López Soto',
    rut_representante = '13.456.789-0',
    telcelular = '+56984567890',
    telfijo = '+56278901234',
    id_region = 7,
    id_comuna = 274,
    direccion = 'Marcoleta 345, Clínica Central',
    email = 'contacto@saludplus.cl',
    web_cliente = 'www.saludplus.cl'
WHERE id_cliente = 6;

-- Cliente 7 (si existe)
UPDATE clientes 
SET 
    nombrefantasia = 'AutoMotive',
    giro = 'Venta y Reparación de Vehículos',
    id_grupo = 1,
    nombrerepresentantelegal = 'Luis Alberto',
    apellidorepresentante = 'Martínez Vargas',
    rut_representante = '16.789.012-3',
    telcelular = '+56995678901',
    telfijo = '+56289012345',
    id_region = 7,
    id_comuna = 309,
    direccion = 'Américo Vespucio 1234, Local 2',
    email = 'ventas@automotive.cl',
    web_cliente = 'www.automotive.cl'
WHERE id_cliente = 7;

-- Cliente 8 (si existe)
UPDATE clientes 
SET 
    nombrefantasia = 'FashionStyle',
    giro = 'Textil y Moda',
    id_grupo = 2,
    nombrerepresentantelegal = 'Patricia Alejandra',
    apellidorepresentante = 'Ramírez Castro',
    rut_representante = '14.567.890-1',
    telcelular = '+56986789012',
    telfijo = '+56290123456',
    id_region = 7,
    id_comuna = 298,
    direccion = 'Apoquindo 4567, Mall Costanera',
    email = 'info@fashionstyle.cl',
    web_cliente = 'www.fashionstyle.cl'
WHERE id_cliente = 8;

-- Cliente 9 (si existe)
UPDATE clientes 
SET 
    nombrefantasia = 'LogisticsPro',
    giro = 'Transporte y Logística',
    id_grupo = 3,
    nombrerepresentantelegal = 'Jorge Eduardo',
    apellidorepresentante = 'Fernández Bravo',
    rut_representante = '17.890.123-4',
    telcelular = '+56997890123',
    telfijo = '+56291234567',
    id_region = 7,
    id_comuna = 320,
    direccion = 'General Velásquez 890, Bodega 12',
    email = 'operaciones@logisticspro.cl',
    web_cliente = 'www.logisticspro.cl'
WHERE id_cliente = 9;

-- Cliente 10 (si existe)
UPDATE clientes 
SET 
    nombrefantasia = 'GreenEnergy',
    giro = 'Energías Renovables',
    id_grupo = 1,
    nombrerepresentantelegal = 'Claudia Andrea',
    apellidorepresentante = 'Soto Navarro',
    rut_representante = '19.012.345-6',
    telcelular = '+56988901234',
    telfijo = '+56292345678',
    id_region = 7,
    id_comuna = 285,
    direccion = 'El Bosque Norte 123, Oficina 201',
    email = 'contacto@greenenergy.cl',
    web_cliente = 'www.greenenergy.cl'
WHERE id_cliente = 10;

-- Verificar los resultados
SELECT 
    id_cliente,
    nombrecliente,
    nombrefantasia,
    giro,
    id_grupo,
    nombrerepresentantelegal,
    apellidorepresentante,
    rut_representante,
    telcelular,
    telfijo,
    id_region,
    id_comuna,
    direccion,
    email,
    web_cliente
FROM clientes 
ORDER BY id_cliente;