-- Script para insertar 30 proveedores de medios de comunicación
-- Ejecutar en Supabase SQL Editor
-- Versión corregida con campos en orden correcto

-- Insertar 30 proveedores de medios de comunicación con datos variados y realistas
INSERT INTO proveedores (
    nombreproveedor,
    razonSocial,
    RUT,
    Direccion,
    id_region,
    id_comuna,
    Telefono,
    Email,
    estado,
    created_at,
    updated_at
) VALUES
-- Medios de Comunicación - Televisión
('Televisión Nacional de Chile', 'TVN S.A.', '96.518.740-4', 'Av. Presidente Balmaceda 2465', 13, 131, '+56992345678', 'contacto@tvn.cl', true, NOW(), NOW()),
('Mega Televisión', 'Mega S.A.', '76.123.456-7', 'Calle Santa Rosa 7630', 13, 131, '+56993456789', 'comercial@mega.cl', true, NOW(), NOW()),
('Chilevisión', 'Chilevisión SpA', '77.234.567-8', 'Calle Américo Vespucio 1737', 13, 131, '+56994567890', 'prensa@chilevision.cl', true, NOW(), NOW()),
('Canal 13', 'Canal 13 S.A.', '78.345.678-9', 'Calle Inés Matte Huerta 0190', 13, 131, '+56995678901', 'contacto@canal13.cl', true, NOW(), NOW()),

-- Medios de Comunicación - Radio
('Radio Cooperativa', 'Sociedad Radio Cooperativa Vitalicia', '79.456.789-0', 'Av. Vicuña Mackenna 425', 13, 131, '+56996789012', 'contacto@cooperativa.cl', true, NOW(), NOW()),
('Biobío Comunicaciones', 'Biobío Comunicaciones S.A.', '80.567.890-1', 'Calle San Ignacio 64', 8, 81, '+56997890123', 'prensa@biobiochile.cl', true, NOW(), NOW()),
('Radio ADN', 'Ibero Americana Radio Chile S.A.', '81.678.901-2', 'Av. Apoquindo 3846', 13, 131, '+56998901234', 'contacto@adnradio.cl', true, NOW(), NOW()),
('Radio Pudahuel', 'Radio Pudahuel S.A.', '82.789.012-3', 'Calle San Pío X 2410', 13, 131, '+56999012345', 'comercial@pudahuel.cl', true, NOW(), NOW()),

-- Medios de Comunicación - Prensa Escrita y Digital
('El Mercurio', 'Empresa Periodística El Mercurio S.A.', '83.890.123-4', 'Av. Santa Rosa 7620', 13, 131, '+56990123456', 'contacto@emol.com', true, NOW(), NOW()),
('La Tercera', 'Consorcio Periodístico de Chile S.A.', '84.901.234-5', 'Calle Morandé 80', 13, 131, '+56991234567', 'contacto@latercera.com', true, NOW(), NOW()),
('Publimetro Chile', 'Publimetro Chile S.A.', '85.012.345-6', 'Calle Antonio Bellet 99', 13, 131, '+56992345678', 'contacto@publimetro.cl', true, NOW(), NOW()),
('La Cuarta', 'Consorcio Periodístico de Chile S.A.', '86.123.456-7', 'Calle Morandé 80', 13, 131, '+56993456789', 'contacto@lacuarta.cl', true, NOW(), NOW()),

-- Medios de Comunicación - Portales de Noticias
('Emol', 'Empresa Periodística El Mercurio S.A.', '87.234.567-8', 'Av. Santa Rosa 7620', 13, 131, '+56994567890', 'contacto@emol.com', true, NOW(), NOW()),
('Biobío Chile', 'Biobío Comunicaciones S.A.', '88.345.678-9', 'Calle San Ignacio 64', 8, 81, '+56995678901', 'contacto@biobiochile.cl', true, NOW(), NOW()),
('24 Horas', 'Televisión Nacional de Chile S.A.', '89.456.789-0', 'Av. Presidente Balmaceda 2465', 13, 131, '+56996789012', 'contacto@24horas.cl', true, NOW(), NOW()),
('La Tercera Digital', 'Consorcio Periodístico de Chile S.A.', '90.567.890-1', 'Calle Morandé 80', 13, 131, '+56997890123', 'contacto@latercera.com', true, NOW(), NOW()),

-- Medios de Comunicación - Revistas
('Qué Pasa', 'Copesa Editorial S.A.', '91.678.901-2', 'Calle San Ignacio 64', 8, 81, '+56998901234', 'contacto@quepasa.cl', true, NOW(), NOW()),
('Paula', 'Copesa Editorial S.A.', '92.789.012-3', 'Calle San Ignacio 64', 8, 81, '+56999012345', 'contacto@paula.cl', true, NOW(), NOW()),
('Vanidades', 'Editorial Televisa Chile S.A.', '93.890.123-4', 'Calle Antonio Bellet 99', 13, 131, '+56990123456', 'contacto@vanidades.cl', true, NOW(), NOW()),
('Hola Chile', 'Hola Chile S.A.', '94.901.234-5', 'Calle San Pío X 2410', 13, 131, '+56991234567', 'contacto@holachile.cl', true, NOW(), NOW()),

-- Medios de Comunicación - Agencias de Noticias
('Agencia EFE Chile', 'Agencia EFE Chile S.A.', '95.012.345-6', 'Calle Antonio Bellet 99', 13, 131, '+56992345678', 'contacto@efe.cl', true, NOW(), NOW()),
('Agencia UNO', 'Agencia UNO S.A.', '96.123.456-7', 'Calle San Ignacio 64', 8, 81, '+56993456789', 'contacto@agenciauno.cl', true, NOW(), NOW()),
('Reuters Chile', 'Reuters Chile S.A.', '97.234.567-8', 'Av. Isidora Goyenechea 3000', 13, 131, '+56994567890', 'contacto@reuters.cl', true, NOW(), NOW()),
('Associated Press Chile', 'AP Chile S.A.', '98.345.678-9', 'Calle Morandé 80', 13, 131, '+56995678901', 'contacto@ap.cl', true, NOW(), NOW()),

-- Medios de Comunicación - Medios Alternativos y Digitales
('The Clinic', 'The Clinic Media S.A.', '99.456.789-0', 'Calle San Ignacio 64', 8, 81, '+56996789012', 'contacto@theclinic.cl', true, NOW(), NOW()),
('El Mostrador', 'El Mostrador S.A.', '10.567.890-1', 'Calle San Ignacio 64', 8, 81, '+56997890123', 'contacto@elmostrador.cl', true, NOW(), NOW()),
('El Dinamo', 'El Dinamo S.A.', '11.678.901-2', 'Calle San Ignacio 64', 8, 81, '+56998901234', 'contacto@eldinamo.cl', true, NOW(), NOW()),
('Biobío Radio', 'Biobío Comunicaciones S.A.', '12.789.012-3', 'Calle San Ignacio 64', 8, 81, '+56999012345', 'contacto@biobioradio.cl', true, NOW(), NOW()),
('Radio Agricultura', 'Radio Agricultura S.A.', '13.890.234-5', 'Calle San Ignacio 64', 8, 81, '+56990123456', 'contacto@agricultura.cl', true, NOW(), NOW()),
('Radio Zero', 'Zero Comunicaciones S.A.', '14.901.234-5', 'Calle San Pío X 2410', 13, 131, '+56991234567', 'contacto@radiozero.cl', true, NOW(), NOW());

-- Verificar que los proveedores se insertaron correctamente
SELECT 
    id_proveedor,
    nombreproveedor,
    RUT,
    email,
    estado,
    created_at
FROM proveedores 
ORDER BY id_proveedor ASC 
LIMIT 30;