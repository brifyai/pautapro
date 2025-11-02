-- Script para actualizar los 30 proveedores con información completa y detallada
-- Ejecutar en Supabase SQL Editor después de haber insertado los proveedores

-- Actualizar proveedores con información más completa y realista
UPDATE proveedores SET 
    razonSocial = 'Televisión Nacional de Chile S.A.',
    Direccion = 'Av. Presidente Balmaceda 2465, Providencia',
    Telefono = '+562 2757 2000',
    Email = 'contacto@tvn.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'Televisión Nacional de Chile';

UPDATE proveedores SET 
    razonSocial = 'Mega Televisión S.A.',
    Direccion = 'Calle Santa Rosa 7630, San Miguel',
    Telefono = '+562 2757 7300',
    Email = 'comercial@mega.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'Mega Televisión';

UPDATE proveedores SET 
    razonSocial = 'Chilevisión SpA',
    Direccion = 'Calle Américo Vespucio 1737, La Florida',
    Telefono = '+562 2757 8888',
    Email = 'prensa@chilevision.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'Chilevisión';

UPDATE proveedores SET 
    razonSocial = 'Canal 13 S.A.',
    Direccion = 'Calle Inés Matte Huerta 0190, Providencia',
    Telefono = '+562 2757 1313',
    Email = 'contacto@canal13.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'Canal 13';

-- Radio
UPDATE proveedores SET 
    razonSocial = 'Sociedad Radio Cooperativa Vitalicia',
    Direccion = 'Av. Vicuña Mackenna 425, Santiago',
    Telefono = '+562 2697 8000',
    Email = 'contacto@cooperativa.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'Radio Cooperativa';

UPDATE proveedores SET
    razonSocial = 'Biobío Comunicaciones S.A.',
    Direccion = 'Calle San Ignacio 64, Concepción',
    Telefono = '+562 2757 4000',
    Email = 'prensa@biobiochile.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'Biobío Comunicaciones';

UPDATE proveedores SET 
    razonSocial = 'Ibero Americana Radio Chile S.A.',
    Direccion = 'Av. Apoquindo 3846, Las Condes',
    Telefono = '+562 2757 8800',
    Email = 'contacto@adnradio.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'Radio ADN';

UPDATE proveedores SET 
    razonSocial = 'Radio Pudahuel S.A.',
    Direccion = 'Calle San Pío X 2410, Providencia',
    Telefono = '+562 2757 2001',
    Email = 'comercial@pudahuel.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'Radio Pudahuel';

-- Prensa Escrita
UPDATE proveedores SET 
    razonSocial = 'Empresa Periodística El Mercurio S.A.',
    Direccion = 'Av. Santa Rosa 7620, San Miguel',
    Telefono = '+562 2697 8000',
    Email = 'contacto@emol.com',
    updated_at = NOW()
WHERE nombreproveedor = 'El Mercurio';

UPDATE proveedores SET 
    razonSocial = 'Consorcio Periodístico de Chile S.A.',
    Direccion = 'Calle Morandé 80, Santiago',
    Telefono = '+562 2697 8100',
    Email = 'contacto@latercera.com',
    updated_at = NOW()
WHERE nombreproveedor = 'La Tercera';

UPDATE proveedores SET 
    razonSocial = 'Publimetro Chile S.A.',
    Direccion = 'Calle Antonio Bellet 99, Providencia',
    Telefono = '+562 2757 2200',
    Email = 'contacto@publimetro.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'Publimetro Chile';

UPDATE proveedores SET 
    razonSocial = 'Consorcio Periodístico de Chile S.A.',
    Direccion = 'Calle Morandé 80, Santiago',
    Telefono = '+562 2697 8200',
    Email = 'contacto@lacuarta.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'La Cuarta';

-- Portales Digitales
UPDATE proveedores SET 
    razonSocial = 'Empresa Periodística El Mercurio S.A.',
    Direccion = 'Av. Santa Rosa 7620, San Miguel',
    Telefono = '+562 2697 8300',
    Email = 'contacto@emol.com',
    updated_at = NOW()
WHERE nombreproveedor = 'Emol';

UPDATE proveedores SET 
    razonSocial = 'Biobío Comunicaciones S.A.',
    Direccion = 'Calle San Ignacio 64, Concepción',
    Telefono = '+562 2697 8400',
    Email = 'contacto@biobiochile.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'Biobío Chile';

UPDATE proveedores SET 
    razonSocial = 'Televisión Nacional de Chile S.A.',
    Direccion = 'Av. Presidente Balmaceda 2465, Providencia',
    Telefono = '+562 2697 8500',
    Email = 'contacto@24horas.cl',
    updated_at = NOW()
WHERE nombreproveedor = '24 Horas';

UPDATE proveedores SET 
    razonSocial = 'Consorcio Periodístico de Chile S.A.',
    Direccion = 'Calle Morandé 80, Santiago',
    Telefono = '+562 2697 8600',
    Email = 'contacto@latercera.com',
    updated_at = NOW()
WHERE nombreproveedor = 'La Tercera Digital';

-- Revistas
UPDATE proveedores SET 
    razonSocial = 'Copesa Editorial S.A.',
    Direccion = 'Calle San Ignacio 64, Concepción',
    Telefono = '+562 2697 8700',
    Email = 'contacto@quepasa.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'Qué Pasa';

UPDATE proveedores SET 
    razonSocial = 'Copesa Editorial S.A.',
    Direccion = 'Calle San Ignacio 64, Concepción',
    Telefono = '+562 2697 8800',
    Email = 'contacto@paula.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'Paula';

UPDATE proveedores SET 
    razonSocial = 'Editorial Televisa Chile S.A.',
    Direccion = 'Calle Antonio Bellet 99, Providencia',
    Telefono = '+562 2697 8900',
    Email = 'contacto@vanidades.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'Vanidades';

UPDATE proveedores SET 
    razonSocial = 'Hola Chile S.A.',
    Direccion = 'Calle San Pío X 2410, Providencia',
    Telefono = '+562 2697 9000',
    Email = 'contacto@holachile.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'Hola Chile';

-- Agencias de Noticias
UPDATE proveedores SET 
    razonSocial = 'Agencia EFE Chile S.A.',
    Direccion = 'Calle Antonio Bellet 99, Providencia',
    Telefono = '+562 2697 9100',
    Email = 'contacto@efe.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'Agencia EFE Chile';

UPDATE proveedores SET 
    razonSocial = 'Agencia UNO S.A.',
    Direccion = 'Calle San Ignacio 64, Concepción',
    Telefono = '+562 2697 9200',
    Email = 'contacto@agenciauno.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'Agencia UNO';

UPDATE proveedores SET 
    razonSocial = 'Reuters Chile S.A.',
    Direccion = 'Av. Isidora Goyenechea 3000, Las Condes',
    Telefono = '+562 2697 9300',
    Email = 'contacto@reuters.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'Reuters Chile';

UPDATE proveedores SET 
    razonSocial = 'AP Chile S.A.',
    Direccion = 'Calle Morandé 80, Santiago',
    Telefono = '+562 2697 9400',
    Email = 'contacto@ap.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'Associated Press Chile';

-- Medios Alternativos y Digitales
UPDATE proveedores SET 
    razonSocial = 'The Clinic Media S.A.',
    Direccion = 'Calle San Ignacio 64, Concepción',
    Telefono = '+562 2697 9500',
    Email = 'contacto@theclinic.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'The Clinic';

UPDATE proveedores SET 
    razonSocial = 'El Mostrador S.A.',
    Direccion = 'Calle San Ignacio 64, Concepción',
    Telefono = '+562 2697 9600',
    Email = 'contacto@elmostrador.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'El Mostrador';

UPDATE proveedores SET 
    razonSocial = 'El Dinamo S.A.',
    Direccion = 'Calle San Ignacio 64, Concepción',
    Telefono = '+562 2697 9700',
    Email = 'contacto@eldinamo.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'El Dinamo';

UPDATE proveedores SET 
    razonSocial = 'Biobío Comunicaciones S.A.',
    Direccion = 'Calle San Ignacio 64, Concepción',
    Telefono = '+562 2697 9800',
    Email = 'contacto@biobioradio.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'Biobío Radio';

UPDATE proveedores SET 
    razonSocial = 'Radio Agricultura S.A.',
    Direccion = 'Calle San Ignacio 64, Concepción',
    Telefono = '+562 2697 9900',
    Email = 'contacto@agricultura.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'Radio Agricultura';

UPDATE proveedores SET 
    razonSocial = 'Zero Comunicaciones S.A.',
    Direccion = 'Calle San Pío X 2410, Providencia',
    Telefono = '+562 2697 9999',
    Email = 'contacto@radiozero.cl',
    updated_at = NOW()
WHERE nombreproveedor = 'Radio Zero';

-- Verificar que todos los proveedores tengan datos completos
SELECT 
    id_proveedor,
    nombreproveedor,
    razonSocial,
    RUT,
    Direccion,
    id_region,
    id_comuna,
    Telefono,
    Email,
    estado,
    updated_at
FROM proveedores 
ORDER BY id_proveedor ASC 
LIMIT 30;