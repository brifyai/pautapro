-- Script para insertar 10 agencias creativas + 1 agencia de medios
-- Datos de ejemplo para probar el formulario de agencias

-- Primero agregar las columnas faltantes si no existen
ALTER TABLE agencias ADD COLUMN IF NOT EXISTS nombrefantasia VARCHAR(100);
ALTER TABLE agencias ADD COLUMN IF NOT EXISTS rutagencia VARCHAR(20);
ALTER TABLE agencias ADD COLUMN IF NOT EXISTS giro VARCHAR(100);
ALTER TABLE agencias ADD COLUMN IF NOT EXISTS nombrerepresentantelegal VARCHAR(100);
ALTER TABLE agencias ADD COLUMN IF NOT EXISTS rutrepresentante VARCHAR(20);
ALTER TABLE agencias ADD COLUMN IF NOT EXISTS direccionagencia VARCHAR(200);
ALTER TABLE agencias ADD COLUMN IF NOT EXISTS region INTEGER;
ALTER TABLE agencias ADD COLUMN IF NOT EXISTS comuna INTEGER;
ALTER TABLE agencias ADD COLUMN IF NOT EXISTS telcelular VARCHAR(20);
ALTER TABLE agencias ADD COLUMN IF NOT EXISTS telfijo VARCHAR(20);
ALTER TABLE agencias ADD COLUMN IF NOT EXISTS email VARCHAR(100);
ALTER TABLE agencias ADD COLUMN IF NOT EXISTS codigo_megatime VARCHAR(20);
ALTER TABLE agencias ADD COLUMN IF NOT EXISTS estado BOOLEAN DEFAULT true;
ALTER TABLE agencias ADD COLUMN IF NOT EXISTS razonsocial VARCHAR(100);

INSERT INTO agencias (
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
) VALUES
-- Agencia 1: Agencia Creativa Digital
('Agencia Digital Creativa', 'Digital Creativa', '76.543.210-8', 'Servicios de Marketing Digital', 'María González', '12.345.678-9', 'Av. Providencia 1234, Providencia', 7, 120, '+56987654321', '+56226987654', 'contacto@digitalcreativa.cl', 'DIG-001', true, 'Digital Creativa SpA'),

-- Agencia 2: Agencia de Branding Urbano
('Urban Branding Agency', 'Urban Brand', '87.654.321-7', 'Diseño de Marca y Branding', 'Carlos Rodríguez', '23.456.789-0', 'Calle Lastarria 456, Santiago Centro', 7, 110, '+56976543210', '+56227896543', 'info@urbanbranding.cl', 'URB-002', true, 'Urban Branding Ltda.'),

-- Agencia 3: Agencia de Eventos Creativos
('Eventos Creativos Agency', 'Eventos Creativos', '98.765.432-6', 'Organización de Eventos', 'Ana Martínez', '34.567.890-1', 'Av. Apoquindo 789, Las Condes', 7, 116, '+56965432109', '+56228567432', 'eventos@creativos.cl', 'EVT-003', true, 'Eventos Creativos SpA'),

-- Agencia 4: Agencia de Comunicación Estratégica
('Comunicación Estratégica', 'ComEst', '65.432.109-5', 'Comunicación Corporativa', 'Pedro Sánchez', '45.678.901-2', 'Calle Huérfanos 321, Santiago', 7, 110, '+56954321098', '+56227654321', 'contacto@comest.cl', 'COM-004', true, 'ComEst SpA'),

-- Agencia 5: Agencia de Diseño Gráfico
('Diseño Gráfico Studio', 'DG Studio', '54.321.098-4', 'Diseño Gráfico y Publicitario', 'Laura Torres', '56.789.012-3', 'Av. Vitacura 654, Vitacura', 7, 118, '+56943210987', '+56228765432', 'studio@dgstudio.cl', 'DGS-005', true, 'DG Studio Ltda.'),

-- Agencia 6: Agencia de Marketing Deportivo
('Sports Marketing Agency', 'Sports Marketing', '43.210.987-3', 'Marketing Deportivo', 'Diego Vargas', '67.890.123-4', 'Calle Bandera 987, Ñuñoa', 7, 119, '+56932109876', '+56227876543', 'sports@sportsmarketing.cl', 'SPM-006', true, 'Sports Marketing SpA'),

-- Agencia 7: Agencia de Contenido Digital
('Contenido Digital Agency', 'Contenido Digital', '32.109.876-2', 'Producción de Contenido Digital', 'Sofia Ramírez', '78.901.234-5', 'Av. La Chascona 147, Santiago', 7, 110, '+56921098765', '+56227687654', 'contenido@digital.cl', 'CDG-007', true, 'Contenido Digital Ltda.'),

-- Agencia 8: Agencia de Relaciones Públicas
('PR Agency Chile', 'PR Chile', '21.098.765-1', 'Relaciones Públicas', 'Miguel Herrera', '89.012.345-6', 'Calle Merced 258, Santiago Centro', 7, 110, '+56910987654', '+56227698765', 'pr@prchile.cl', 'PRC-008', true, 'PR Chile SpA'),

-- Agencia 9: Agencia de Fotografía Publicitaria
('Foto Publicidad Agency', 'Foto Publicidad', '10.987.654-0', 'Fotografía Publicitaria', 'Camila Flores', '90.123.456-7', 'Av. Pedro de Valdivia 369, Providencia', 7, 120, '+56909876543', '+56227809876', 'foto@fotopublicidad.cl', 'FPA-009', true, 'Foto Publicidad Ltda.'),

-- Agencia 10: Agencia de Producción Audiovisual
('Audiovisual Production', 'Audiovisual Prod', '99.876.543-9', 'Producción Audiovisual', 'Javier Morales', '01.234.567-8', 'Calle Duble Almeyda 456, Ñuñoa', 7, 119, '+56998765432', '+56227810987', 'prod@audiovisual.cl', 'AVP-010', true, 'Audiovisual Prod SpA'),

-- Agencia 11: Agencia de Medios de Comunicación (la solicitada específicamente)
('Medios Comunicación Agency', 'Medios Comunicación', '88.765.432-8', 'Medios de Comunicación', 'Roberto Silva', '12.345.678-9', 'Av. Libertador Bernardo O''Higgins 1234, Santiago Centro', 7, 110, '+56987654321', '+56226987654', 'medios@comunicacion.cl', 'MCA-011', true, 'Medios Comunicación SpA');

-- Verificar que se insertaron correctamente
SELECT
    id,
    nombreidentificador,
    razonsocial,
    rutagencia,
    region,
    comuna,
    email,
    estado
FROM agencias
WHERE nombreidentificador LIKE '%Agency%' OR nombreidentificador LIKE '%Studio%' OR nombreidentificador LIKE '%Medios%'
ORDER BY id DESC
LIMIT 12;