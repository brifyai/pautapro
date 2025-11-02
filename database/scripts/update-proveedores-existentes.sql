-- Script para actualizar los proveedores EXISTENTES con los nuevos campos
-- Basado en los datos reales de la base de datos

-- Actualizar el primer proveedor (Medios Chile S.A.)
UPDATE proveedores SET
    direccion_facturacion = 'Av. Presidente Balmaceda 2465, Providencia, Santiago',
    telefono_celular = '+56992345678',
    telefono_fijo = '+562 2757 2000',
    identificador = 'MEDIOS-CL-001',
    bonificacion_anio = 5.0,
    escala_rango = 10.0,
    nombrefantasia = 'Medios Chile Group',
    nombrerepresentante = 'Juan Pérez García',
    rutrepresentante = '12.345.678-9',
    id_comuna = 131, -- Providencia
    updated_at = NOW()
WHERE id_proveedor = 1;

-- Actualizar los siguientes 30 proveedores (si existen)
-- Televisión
UPDATE proveedores SET
    direccion_facturacion = 'Calle Santa Rosa 7630, San Miguel, Santiago',
    telefono_celular = '+56993456789',
    telefono_fijo = '+562 2757 7300',
    identificador = 'TVN-002',
    bonificacion_anio = 4.5,
    escala_rango = 9.5,
    nombrefantasia = 'TVN Media Group',
    nombrerepresentante = 'María González López',
    rutrepresentante = '15.678.901-2',
    id_comuna = 120, -- San Miguel
    updated_at = NOW()
WHERE id_proveedor = 2 AND nombreproveedor LIKE '%Televisión%';

UPDATE proveedores SET
    direccion_facturacion = 'Calle Américo Vespucio 1737, La Florida, Santiago',
    telefono_celular = '+56994567890',
    telefono_fijo = '+562 2757 8888',
    identificador = 'CHV-003',
    bonificacion_anio = 6.0,
    escala_rango = 11.0,
    nombrefantasia = 'Chilevisión Plus',
    nombrerepresentante = 'Carlos Rodríguez Silva',
    rutrepresentante = '18.901.234-5',
    id_comuna = 134, -- La Florida
    updated_at = NOW()
WHERE id_proveedor = 3;

UPDATE proveedores SET
    direccion_facturacion = 'Calle Inés Matte Huerta 0190, Providencia, Santiago',
    telefono_celular = '+56995678901',
    telefono_fijo = '+562 2757 1313',
    identificador = 'C13-004',
    bonificacion_anio = 7.0,
    escala_rango = 12.0,
    nombrefantasia = 'Canal 13 Networks',
    nombrerepresentante = 'Ana Martínez Torres',
    rutrepresentante = '11.234.567-8',
    id_comuna = 131, -- Providencia
    updated_at = NOW()
WHERE id_proveedor = 4;

-- Radio
UPDATE proveedores SET 
    direccion_facturacion = 'Av. Vicuña Mackenna 425, Santiago',
    telefono_celular = '+56996789012',
    telefono_fijo = '+562 2697 8000',
    identificador = 'COOP-005',
    bonificacion_anio = 3.5,
    escala_rango = 8.0,
    updated_at = NOW()
WHERE id_proveedor = 5;

UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Ignacio 64, Concepción',
    telefono_celular = '+56997890123',
    telefono_fijo = '+562 2757 4000',
    identificador = 'BIOBIO-006',
    bonificacion_anio = 4.0,
    escala_rango = 8.5,
    updated_at = NOW()
WHERE id_proveedor = 6;

UPDATE proveedores SET 
    direccion_facturacion = 'Av. Apoquindo 3846, Las Condes, Santiago',
    telefono_celular = '+56998901234',
    telefono_fijo = '+562 2757 8800',
    identificador = 'ADN-007',
    bonificacion_anio = 3.0,
    escala_rango = 7.5,
    updated_at = NOW()
WHERE id_proveedor = 7;

UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Pío X 2410, Providencia, Santiago',
    telefono_celular = '+56999012345',
    telefono_fijo = '+562 2757 2001',
    identificador = 'PUDA-008',
    bonificacion_anio = 2.5,
    escala_rango = 7.0,
    updated_at = NOW()
WHERE id_proveedor = 8;

-- Prensa Escrita
UPDATE proveedores SET 
    direccion_facturacion = 'Av. Santa Rosa 7620, San Miguel, Santiago',
    telefono_celular = '+56990123456',
    telefono_fijo = '+562 2697 8000',
    identificador = 'MERCURIO-009',
    bonificacion_anio = 8.0,
    escala_rango = 15.0,
    updated_at = NOW()
WHERE id_proveedor = 9;

UPDATE proveedores SET 
    direccion_facturacion = 'Calle Morandé 80, Santiago',
    telefono_celular = '+56991234567',
    telefono_fijo = '+562 2697 8100',
    identificador = 'TERCERA-010',
    bonificacion_anio = 7.5,
    escala_rango = 14.0,
    updated_at = NOW()
WHERE id_proveedor = 10;

UPDATE proveedores SET 
    direccion_facturacion = 'Calle Antonio Bellet 99, Providencia, Santiago',
    telefono_celular = '+56992345678',
    telefono_fijo = '+562 2757 2200',
    identificador = 'PUBLIMETRO-011',
    bonificacion_anio = 2.0,
    escala_rango = 6.0,
    updated_at = NOW()
WHERE id_proveedor = 11;

UPDATE proveedores SET 
    direccion_facturacion = 'Calle Morandé 80, Santiago',
    telefono_celular = '+56993456789',
    telefono_fijo = '+562 2697 8200',
    identificador = 'CUARTA-012',
    bonificacion_anio = 1.5,
    escala_rango = 5.5,
    updated_at = NOW()
WHERE id_proveedor = 12;

-- Portales Digitales
UPDATE proveedores SET 
    direccion_facturacion = 'Av. Santa Rosa 7620, San Miguel, Santiago',
    telefono_celular = '+56994567890',
    telefono_fijo = '+562 2697 8300',
    identificador = 'EMOL-013',
    bonificacion_anio = 5.5,
    escala_rango = 10.5,
    updated_at = NOW()
WHERE id_proveedor = 13;

UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Ignacio 64, Concepción',
    telefono_celular = '+56995678901',
    telefono_fijo = '+562 2697 8400',
    identificador = 'BIOBIO-CL-014',
    bonificacion_anio = 4.5,
    escala_rango = 9.0,
    updated_at = NOW()
WHERE id_proveedor = 14;

UPDATE proveedores SET 
    direccion_facturacion = 'Av. Presidente Balmaceda 2465, Providencia, Santiago',
    telefono_celular = '+56996789012',
    telefono_fijo = '+562 2697 8500',
    identificador = '24HRS-015',
    bonificacion_anio = 5.0,
    escala_rango = 10.0,
    updated_at = NOW()
WHERE id_proveedor = 15;

UPDATE proveedores SET 
    direccion_facturacion = 'Calle Morandé 80, Santiago',
    telefono_celular = '+56997890123',
    telefono_fijo = '+562 2697 8600',
    identificador = 'TERCERA-DIG-016',
    bonificacion_anio = 4.0,
    escala_rango = 8.5,
    updated_at = NOW()
WHERE id_proveedor = 16;

-- Revistas
UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Ignacio 64, Concepción',
    telefono_celular = '+56998901234',
    telefono_fijo = '+562 2697 8700',
    identificador = 'QUEPASA-017',
    bonificacion_anio = 6.5,
    escala_rango = 12.5,
    updated_at = NOW()
WHERE id_proveedor = 17;

UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Ignacio 64, Concepción',
    telefono_celular = '+56999012345',
    telefono_fijo = '+562 2697 8800',
    identificador = 'PAULA-018',
    bonificacion_anio = 5.0,
    escala_rango = 10.0,
    updated_at = NOW()
WHERE id_proveedor = 18;

UPDATE proveedores SET 
    direccion_facturacion = 'Calle Antonio Bellet 99, Providencia, Santiago',
    telefono_celular = '+56990123456',
    telefono_fijo = '+562 2697 8900',
    identificador = 'VANIDADES-019',
    bonificacion_anio = 4.5,
    escala_rango = 9.5,
    updated_at = NOW()
WHERE id_proveedor = 19;

UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Pío X 2410, Providencia, Santiago',
    telefono_celular = '+56991234567',
    telefono_fijo = '+562 2697 9000',
    identificador = 'HOLA-020',
    bonificacion_anio = 3.5,
    escala_rango = 8.0,
    updated_at = NOW()
WHERE id_proveedor = 20;

-- Agencias de Noticias
UPDATE proveedores SET 
    direccion_facturacion = 'Calle Antonio Bellet 99, Providencia, Santiago',
    telefono_celular = '+56992345678',
    telefono_fijo = '+562 2697 9100',
    identificador = 'EFE-021',
    bonificacion_anio = 2.5,
    escala_rango = 7.0,
    updated_at = NOW()
WHERE id_proveedor = 21;

UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Ignacio 64, Concepción',
    telefono_celular = '+56993456789',
    telefono_fijo = '+562 2697 9200',
    identificador = 'UNO-022',
    bonificacion_anio = 2.0,
    escala_rango = 6.5,
    updated_at = NOW()
WHERE id_proveedor = 22;

UPDATE proveedores SET 
    direccion_facturacion = 'Av. Isidora Goyenechea 3000, Las Condes, Santiago',
    telefono_celular = '+56994567890',
    telefono_fijo = '+562 2697 9300',
    identificador = 'REUTERS-023',
    bonificacion_anio = 3.0,
    escala_rango = 7.5,
    updated_at = NOW()
WHERE id_proveedor = 23;

UPDATE proveedores SET 
    direccion_facturacion = 'Calle Morandé 80, Santiago',
    telefono_celular = '+56995678901',
    telefono_fijo = '+562 2697 9400',
    identificador = 'AP-024',
    bonificacion_anio = 2.5,
    escala_rango = 7.0,
    updated_at = NOW()
WHERE id_proveedor = 24;

-- Medios Alternativos y Digitales
UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Ignacio 64, Concepción',
    telefono_celular = '+56996789012',
    telefono_fijo = '+562 2697 9500',
    identificador = 'CLINIC-025',
    bonificacion_anio = 1.5,
    escala_rango = 5.0,
    updated_at = NOW()
WHERE id_proveedor = 25;

UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Ignacio 64, Concepción',
    telefono_celular = '+56997890123',
    telefono_fijo = '+562 2697 9600',
    identificador = 'MOSTRADOR-026',
    bonificacion_anio = 1.5,
    escala_rango = 5.0,
    updated_at = NOW()
WHERE id_proveedor = 26;

UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Ignacio 64, Concepción',
    telefono_celular = '+56998901234',
    telefono_fijo = '+562 2697 9700',
    identificador = 'DINAMO-027',
    bonificacion_anio = 1.0,
    escala_rango = 4.5,
    updated_at = NOW()
WHERE id_proveedor = 27;

UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Ignacio 64, Concepción',
    telefono_celular = '+56999012345',
    telefono_fijo = '+562 2697 9800',
    identificador = 'BIOBIO-RADIO-028',
    bonificacion_anio = 2.0,
    escala_rango = 6.0,
    updated_at = NOW()
WHERE id_proveedor = 28;

UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Ignacio 64, Concepción',
    telefono_celular = '+56990123456',
    telefono_fijo = '+562 2697 9900',
    identificador = 'AGRICULTURA-029',
    bonificacion_anio = 2.5,
    escala_rango = 6.5,
    updated_at = NOW()
WHERE id_proveedor = 29;

UPDATE proveedores SET 
    direccion_facturacion = 'Calle San Pío X 2410, Providencia, Santiago',
    telefono_celular = '+56991234567',
    telefono_fijo = '+562 2697 9999',
    identificador = 'ZERO-030',
    bonificacion_anio = 1.5,
    escala_rango = 5.5,
    updated_at = NOW()
WHERE id_proveedor = 30;

-- Para cualquier proveedor restante que no tenga los campos completos
UPDATE proveedores SET
    direccion_facturacion = COALESCE(direccion_facturacion, 'Av. Providencia 1000, Santiago'),
    telefono_celular = COALESCE(telefono_celular, '+56990000000'),
    telefono_fijo = COALESCE(telefono_fijo, '+562 2000000'),
    identificador = COALESCE(identificador, 'PROV-' || LPAD(id_proveedor::text, 3, '0')),
    bonificacion_anio = COALESCE(bonificacion_anio, 2.0),
    escala_rango = COALESCE(escala_rango, '5.0'),
    nombrefantasia = COALESCE(nombrefantasia, 'Proveedor ' || id_proveedor),
    nombrerepresentante = COALESCE(nombrerepresentante, 'Representante Default'),
    rutrepresentante = COALESCE(rutrepresentante, '99.999.999-9'),
    id_comuna = COALESCE(id_comuna, 131), -- Providencia por defecto
    updated_at = NOW()
WHERE direccion_facturacion IS NULL
   OR telefono_celular IS NULL
   OR telefono_fijo IS NULL
   OR identificador IS NULL
   OR escala_rango IS NULL
   OR nombrefantasia IS NULL
   OR nombrerepresentante IS NULL
   OR rutrepresentante IS NULL
   OR id_comuna IS NULL;

-- Verificar resultados
SELECT 
    id_proveedor,
    nombreproveedor,
    direccion_facturacion,
    telefono_celular,
    telefono_fijo,
    identificador,
    bonificacion_anio,
    escala_rango,
    updated_at
FROM proveedores 
ORDER BY id_proveedor ASC 
LIMIT 31;