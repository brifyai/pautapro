-- Script para actualizar nombres identificadores descriptivos en soportes
-- Ejecutar en Supabase SQL Editor

-- PRIMERO: Agregar la columna nombreidentificador si no existe
ALTER TABLE soportes
ADD COLUMN IF NOT EXISTS nombreidentificador VARCHAR(255);

-- Conglomerado (Proveedor 1)
UPDATE soportes SET nombreidentificador = 'TV Prime Time Nacional' WHERE id_soporte = 1;
UPDATE soportes SET nombreidentificador = 'TV Nacional General' WHERE id_soporte = 2;
UPDATE soportes SET nombreidentificador = 'Radio Nacional General' WHERE id_soporte = 3;
UPDATE soportes SET nombreidentificador = 'Prensa Nacional General' WHERE id_soporte = 4;
UPDATE soportes SET nombreidentificador = 'Digital Nacional General' WHERE id_soporte = 5;
UPDATE soportes SET nombreidentificador = 'Revistas Nacionales General' WHERE id_soporte = 6;
UPDATE soportes SET nombreidentificador = 'Agencia Nacional General' WHERE id_soporte = 7;

-- TV Abierta (Proveedores 2-5)
UPDATE soportes SET nombreidentificador = 'TV Abierta - Canal 13' WHERE id_soporte = 8;
UPDATE soportes SET nombreidentificador = 'TV Digital - Canal 13' WHERE id_soporte = 9;
UPDATE soportes SET nombreidentificador = 'TV Abierta - Mega' WHERE id_soporte = 10;
UPDATE soportes SET nombreidentificador = 'TV Digital - Mega' WHERE id_soporte = 11;
UPDATE soportes SET nombreidentificador = 'TV Abierta - Chilevisión' WHERE id_soporte = 12;
UPDATE soportes SET nombreidentificador = 'TV Digital - Chilevisión' WHERE id_soporte = 13;
UPDATE soportes SET nombreidentificador = 'TV Abierta - TVN' WHERE id_soporte = 14;
UPDATE soportes SET nombreidentificador = 'TV Digital - TVN' WHERE id_soporte = 15;

-- Radio (Proveedores 6-9)
UPDATE soportes SET nombreidentificador = 'Radio AM - Cooperativa' WHERE id_soporte = 16;
UPDATE soportes SET nombreidentificador = 'Radio Digital - Cooperativa' WHERE id_soporte = 17;
UPDATE soportes SET nombreidentificador = 'Radio AM - Biobío' WHERE id_soporte = 18;
UPDATE soportes SET nombreidentificador = 'Radio Digital - Biobío' WHERE id_soporte = 19;
UPDATE soportes SET nombreidentificador = 'Radio AM - ADN' WHERE id_soporte = 20;
UPDATE soportes SET nombreidentificador = 'Radio Digital - ADN' WHERE id_soporte = 21;
UPDATE soportes SET nombreidentificador = 'Radio AM - Pudahuel' WHERE id_soporte = 22;
UPDATE soportes SET nombreidentificador = 'Radio Digital - Pudahuel' WHERE id_soporte = 23;

-- Prensa Escrita (Proveedores 10-13)
UPDATE soportes SET nombreidentificador = 'Prensa Escrita - El Mercurio' WHERE id_soporte = 24;
UPDATE soportes SET nombreidentificador = 'Digital - El Mercurio' WHERE id_soporte = 25;
UPDATE soportes SET nombreidentificador = 'Prensa Escrita - La Tercera' WHERE id_soporte = 26;
UPDATE soportes SET nombreidentificador = 'Digital - La Tercera' WHERE id_soporte = 27;
UPDATE soportes SET nombreidentificador = 'Prensa Escrita - Publimetro' WHERE id_soporte = 28;
UPDATE soportes SET nombreidentificador = 'Digital - Publimetro' WHERE id_soporte = 29;
UPDATE soportes SET nombreidentificador = 'Prensa Escrita - La Cuarta' WHERE id_soporte = 30;
UPDATE soportes SET nombreidentificador = 'Digital - La Cuarta' WHERE id_soporte = 31;

-- Digital/News (Proveedores 14-17)
UPDATE soportes SET nombreidentificador = 'Digital - Emol' WHERE id_soporte = 32;
UPDATE soportes SET nombreidentificador = 'Digital - Biobío Chile' WHERE id_soporte = 33;
UPDATE soportes SET nombreidentificador = 'Digital - 24 Horas' WHERE id_soporte = 34;
UPDATE soportes SET nombreidentificador = 'Digital - La Tercera' WHERE id_soporte = 35;

-- Revistas (Proveedores 18-21)
UPDATE soportes SET nombreidentificador = 'Revista Impresa - Qué Pasa' WHERE id_soporte = 36;
UPDATE soportes SET nombreidentificador = 'Digital - Qué Pasa' WHERE id_soporte = 37;
UPDATE soportes SET nombreidentificador = 'Revista Impresa - Paula' WHERE id_soporte = 38;
UPDATE soportes SET nombreidentificador = 'Digital - Paula' WHERE id_soporte = 39;
UPDATE soportes SET nombreidentificador = 'Revista Impresa - Vanidades' WHERE id_soporte = 40;
UPDATE soportes SET nombreidentificador = 'Digital - Vanidades' WHERE id_soporte = 41;
UPDATE soportes SET nombreidentificador = 'Revista Impresa - Hola Chile' WHERE id_soporte = 42;
UPDATE soportes SET nombreidentificador = 'Digital - Hola Chile' WHERE id_soporte = 43;

-- Agencias de Noticias (Proveedores 22-25)
UPDATE soportes SET nombreidentificador = 'Agencia EFE' WHERE id_soporte = 44;
UPDATE soportes SET nombreidentificador = 'Agencia UNO' WHERE id_soporte = 45;
UPDATE soportes SET nombreidentificador = 'Reuters' WHERE id_soporte = 46;
UPDATE soportes SET nombreidentificador = 'Associated Press' WHERE id_soporte = 47;

-- Medios Alternativos (Proveedores 26-28)
UPDATE soportes SET nombreidentificador = 'The Clinic' WHERE id_soporte = 48;
UPDATE soportes SET nombreidentificador = 'El Mostrador' WHERE id_soporte = 49;
UPDATE soportes SET nombreidentificador = 'El Dinamo' WHERE id_soporte = 50;

-- Radio adicional (Proveedores 29-31)
UPDATE soportes SET nombreidentificador = 'Radio Digital - Biobío' WHERE id_soporte = 51;
UPDATE soportes SET nombreidentificador = 'Radio AM - Agricultura' WHERE id_soporte = 52;
UPDATE soportes SET nombreidentificador = 'Radio Digital - Agricultura' WHERE id_soporte = 53;
UPDATE soportes SET nombreidentificador = 'Radio Digital - Zero' WHERE id_soporte = 54;

-- Verificar actualización
SELECT id_soporte, nombreidentificador
FROM soportes
ORDER BY id_soporte
LIMIT 10;