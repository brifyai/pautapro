-- Script para actualizar los 30 proveedores con los nuevos campos agregados
-- Ejecutar en Supabase SQL Editor después de haber agregado las columnas

-- Actualizar proveedores con información completa en los nuevos campos
UPDATE proveedores SET 
    direccion_facturacion = 'Av. Presidente Balmaceda 2465, Providencia, Santiago',
    telefono_celular = '+56992345678',
    telefono_fijo = '+562 2757 2000',
    identificador = 'TVN-001',
    bonificacion_anio = 5.0,
    escala_rango = 10.0,
    updated_at = NOW()
WHERE nombreproveedor = 'Televisión Nacional de Chile';

UPDATE proveedores SET 
    direccion_facturacion = 'Calle Santa Rosa 7630, San Miguel, Santiago',
    telefono_celular = '+56993456789',
    telefono_fijo = '+562 2757 7300',
    identificador = 'MEGA-002',
    bonificacion_anio = 4.5,
    escala_rango = 9.5,
    updated_at = NOW()
WHERE nombreproveedor = 'Mega Televisión';

UPDATE proveedores SET 
    direccion_facturacion = 'Calle Américo Vespucio 1737, La Florida, Santiago',
    telefono_celular = '+56994567890',
    telefono_fijo = '+562 2757 8888',
    identificador = 'CHV-003',
    bonificacion_anio = 6.0,
    escala_rango = 11.0,
    updated_at = NOW()
WHERE nombreproveedor = 'Chilevisión';

UPDATE proveedores SET 
    direccion_facturacion = 'Calle Inés Matte Huerta 0190, Providencia, Santiago',
    telefono_celular = '+56995678901',
    telefono_fijo = '+562 2757 1313',
    identificador = 'C13-004',
    bonificacion_anio = 7.0,
    escala_rango = 12.0,
    updated_at = NOW()
WHERE nombreproveedor = 'Canal 13';

-- Radio
UPDATE proveedores SET 
    direccion_facturacion = 'Av. Vicuña Mackenna 425, Santiago',
    telefono_celular = '+56996789012',
    telefono_fijo = '+562 2697 8000',
    identificador = 'COOP-005',
    bonificacion_anio = 3.5,
    escala_rango = 8.0,
    updated_at = NOW()
WHERE nombreproveedor = 'Radio Cooperativa';

UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Ignacio 64, Concepción',
    telefono_celular = '+56997890123',
    telefono_fijo = '+562 2757 4000',
    identificador = 'BIOBIO-006',
    bonificacion_anio = 4.0,
    escala_rango = 8.5,
    updated_at = NOW()
WHERE nombreproveedor = 'Biobío Comunicaciones';

UPDATE proveedores SET 
    direccion_facturacion = 'Av. Apoquindo 3846, Las Condes, Santiago',
    telefono_celular = '+56998901234',
    telefono_fijo = '+562 2757 8800',
    identificador = 'ADN-007',
    bonificacion_anio = 3.0,
    escala_rango = 7.5,
    updated_at = NOW()
WHERE nombreproveedor = 'Radio ADN';

UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Pío X 2410, Providencia, Santiago',
    telefono_celular = '+56999012345',
    telefono_fijo = '+562 2757 2001',
    identificador = 'PUDA-008',
    bonificacion_anio = 2.5,
    escala_rango = 7.0,
    updated_at = NOW()
WHERE nombreproveedor = 'Radio Pudahuel';

-- Prensa Escrita
UPDATE proveedores SET 
    direccion_facturacion = 'Av. Santa Rosa 7620, San Miguel, Santiago',
    telefono_celular = '+56990123456',
    telefono_fijo = '+562 2697 8000',
    identificador = 'MERCURIO-009',
    bonificacion_anio = 8.0,
    escala_rango = 15.0,
    updated_at = NOW()
WHERE nombreproveedor = 'El Mercurio';

UPDATE proveedores SET 
    direccion_facturacion = 'Calle Morandé 80, Santiago',
    telefono_celular = '+56991234567',
    telefono_fijo = '+562 2697 8100',
    identificador = 'TERCERA-010',
    bonificacion_anio = 7.5,
    escala_rango = 14.0,
    updated_at = NOW()
WHERE nombreproveedor = 'La Tercera';

UPDATE proveedores SET 
    direccion_facturacion = 'Calle Antonio Bellet 99, Providencia, Santiago',
    telefono_celular = '+56992345678',
    telefono_fijo = '+562 2757 2200',
    identificador = 'PUBLIMETRO-011',
    bonificacion_anio = 2.0,
    escala_rango = 6.0,
    updated_at = NOW()
WHERE nombreproveedor = 'Publimetro Chile';

UPDATE proveedores SET 
    direccion_facturacion = 'Calle Morandé 80, Santiago',
    telefono_celular = '+56993456789',
    telefono_fijo = '+562 2697 8200',
    identificador = 'CUARTA-012',
    bonificacion_anio = 1.5,
    escala_rango = 5.5,
    updated_at = NOW()
WHERE nombreproveedor = 'La Cuarta';

-- Portales Digitales
UPDATE proveedores SET 
    direccion_facturacion = 'Av. Santa Rosa 7620, San Miguel, Santiago',
    telefono_celular = '+56994567890',
    telefono_fijo = '+562 2697 8300',
    identificador = 'EMOL-013',
    bonificacion_anio = 5.5,
    escala_rango = 10.5,
    updated_at = NOW()
WHERE nombreproveedor = 'Emol';

UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Ignacio 64, Concepción',
    telefono_celular = '+56995678901',
    telefono_fijo = '+562 2697 8400',
    identificador = 'BIOBIO-CL-014',
    bonificacion_anio = 4.5,
    escala_rango = 9.0,
    updated_at = NOW()
WHERE nombreproveedor = 'Biobío Chile';

UPDATE proveedores SET 
    direccion_facturacion = 'Av. Presidente Balmaceda 2465, Providencia, Santiago',
    telefono_celular = '+56996789012',
    telefono_fijo = '+562 2697 8500',
    identificador = '24HRS-015',
    bonificacion_anio = 5.0,
    escala_rango = 10.0,
    updated_at = NOW()
WHERE nombreproveedor = '24 Horas';

UPDATE proveedores SET 
    direccion_facturacion = 'Calle Morandé 80, Santiago',
    telefono_celular = '+56997890123',
    telefono_fijo = '+562 2697 8600',
    identificador = 'TERCERA-DIG-016',
    bonificacion_anio = 4.0,
    escala_rango = 8.5,
    updated_at = NOW()
WHERE nombreproveedor = 'La Tercera Digital';

-- Revistas
UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Ignacio 64, Concepción',
    telefono_celular = '+56998901234',
    telefono_fijo = '+562 2697 8700',
    identificador = 'QUEPASA-017',
    bonificacion_anio = 6.5,
    escala_rango = 12.5,
    updated_at = NOW()
WHERE nombreproveedor = 'Qué Pasa';

UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Ignacio 64, Concepción',
    telefono_celular = '+56999012345',
    telefono_fijo = '+562 2697 8800',
    identificador = 'PAULA-018',
    bonificacion_anio = 5.0,
    escala_rango = 10.0,
    updated_at = NOW()
WHERE nombreproveedor = 'Paula';

UPDATE proveedores SET 
    direccion_facturacion = 'Calle Antonio Bellet 99, Providencia, Santiago',
    telefono_celular = '+56990123456',
    telefono_fijo = '+562 2697 8900',
    identificador = 'VANIDADES-019',
    bonificacion_anio = 4.5,
    escala_rango = 9.5,
    updated_at = NOW()
WHERE nombreproveedor = 'Vanidades';

UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Pío X 2410, Providencia, Santiago',
    telefono_celular = '+56991234567',
    telefono_fijo = '+562 2697 9000',
    identificador = 'HOLA-020',
    bonificacion_anio = 3.5,
    escala_rango = 8.0,
    updated_at = NOW()
WHERE nombreproveedor = 'Hola Chile';

-- Agencias de Noticias
UPDATE proveedores SET 
    direccion_facturacion = 'Calle Antonio Bellet 99, Providencia, Santiago',
    telefono_celular = '+56992345678',
    telefono_fijo = '+562 2697 9100',
    identificador = 'EFE-021',
    bonificacion_anio = 2.5,
    escala_rango = 7.0,
    updated_at = NOW()
WHERE nombreproveedor = 'Agencia EFE Chile';

UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Ignacio 64, Concepción',
    telefono_celular = '+56993456789',
    telefono_fijo = '+562 2697 9200',
    identificador = 'UNO-022',
    bonificacion_anio = 2.0,
    escala_rango = 6.5,
    updated_at = NOW()
WHERE nombreproveedor = 'Agencia UNO';

UPDATE proveedores SET 
    direccion_facturacion = 'Av. Isidora Goyenechea 3000, Las Condes, Santiago',
    telefono_celular = '+56994567890',
    telefono_fijo = '+562 2697 9300',
    identificador = 'REUTERS-023',
    bonificacion_anio = 3.0,
    escala_rango = 7.5,
    updated_at = NOW()
WHERE nombreproveedor = 'Reuters Chile';

UPDATE proveedores SET 
    direccion_facturacion = 'Calle Morandé 80, Santiago',
    telefono_celular = '+56995678901',
    telefono_fijo = '+562 2697 9400',
    identificador = 'AP-024',
    bonificacion_anio = 2.5,
    escala_rango = 7.0,
    updated_at = NOW()
WHERE nombreproveedor = 'Associated Press Chile';

-- Medios Alternativos y Digitales
UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Ignacio 64, Concepción',
    telefono_celular = '+56996789012',
    telefono_fijo = '+562 2697 9500',
    identificador = 'CLINIC-025',
    bonificacion_anio = 1.5,
    escala_rango = 5.0,
    updated_at = NOW()
WHERE nombreproveedor = 'The Clinic';

UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Ignacio 64, Concepción',
    telefono_celular = '+56997890123',
    telefono_fijo = '+562 2697 9600',
    identificador = 'MOSTRADOR-026',
    bonificacion_anio = 1.5,
    escala_rango = 5.0,
    updated_at = NOW()
WHERE nombreproveedor = 'El Mostrador';

UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Ignacio 64, Concepción',
    telefono_celular = '+56998901234',
    telefono_fijo = '+562 2697 9700',
    identificador = 'DINAMO-027',
    bonificacion_anio = 1.0,
    escala_rango = 4.5,
    updated_at = NOW()
WHERE nombreproveedor = 'El Dinamo';

UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Ignacio 64, Concepción',
    telefono_celular = '+56999012345',
    telefono_fijo = '+562 2697 9800',
    identificador = 'BIOBIO-RADIO-028',
    bonificacion_anio = 2.0,
    escala_rango = 6.0,
    updated_at = NOW()
WHERE nombreproveedor = 'Biobío Radio';

UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Ignacio 64, Concepción',
    telefono_celular = '+56990123456',
    telefono_fijo = '+562 2697 9900',
    identificador = 'AGRICULTURA-029',
    bonificacion_anio = 2.5,
    escala_rango = 6.5,
    updated_at = NOW()
WHERE nombreproveedor = 'Radio Agricultura';

UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Pío X 2410, Providencia, Santiago',
    telefono_celular = '+56991234567',
    telefono_fijo = '+562 2697 9999',
    identificador = 'ZERO-030',
    bonificacion_anio = 1.5,
    escala_rango = 5.5,
    updated_at = NOW()
WHERE nombreproveedor = 'Radio Zero';

-- Verificar que todos los proveedores tengan los nuevos campos completos
SELECT 
    id_proveedor,
    nombreproveedor,
    razonSocial,
    RUT,
    Direccion,
    direccion_facturacion,
    telefono_celular,
    telefono_fijo,
    identificador,
    bonificacion_anio,
    escala_rango,
    estado,
    updated_at
FROM proveedores 
ORDER BY id_proveedor ASC 
LIMIT 30;