-- Script para completar datos faltantes de clientes en PautaPro
-- Agrega direcciones y fechas de ingreso a clientes que no las tienen

-- Primero, veamos qué clientes existen actualmente
SELECT id_cliente, nombrecliente, direccion, created_at
FROM clientes
ORDER BY id_cliente;

-- Actualizar clientes que no tienen dirección con direcciones inventadas pero realistas
UPDATE clientes
SET
  direccion = CASE
    WHEN id_cliente = 1 THEN 'Av. Providencia 1234, Santiago, Región Metropolitana'
    WHEN id_cliente = 2 THEN 'Calle Los Leones 567, Providencia, Santiago'
    WHEN id_cliente = 3 THEN 'Av. Apoquindo 789, Las Condes, Santiago'
    WHEN id_cliente = 4 THEN 'Calle Huérfanos 1011, Santiago Centro'
    WHEN id_cliente = 5 THEN 'Av. Kennedy 1213, Vitacura, Santiago'
    WHEN id_cliente = 6 THEN 'Calle Bandera 1415, Ñuñoa, Santiago'
    WHEN id_cliente = 7 THEN 'Av. La Florida 1617, La Florida, Santiago'
    WHEN id_cliente = 8 THEN 'Calle Manuel Montt 1819, Providencia, Santiago'
    WHEN id_cliente = 9 THEN 'Av. Vicuña Mackenna 2021, Santiago, Región Metropolitana'
    WHEN id_cliente = 10 THEN 'Calle San Diego 2223, Santiago Centro'
    WHEN id_cliente = 11 THEN 'Av. Matta 2425, Santiago, Región Metropolitana'
    WHEN id_cliente = 12 THEN 'Calle Agustinas 2627, Santiago Centro'
    WHEN id_cliente = 13 THEN 'Av. Ossa 2829, Providencia, Santiago'
    WHEN id_cliente = 14 THEN 'Calle Teatinos 3031, Santiago, Región Metropolitana'
    WHEN id_cliente = 15 THEN 'Av. Pedro de Valdivia 3233, Providencia, Santiago'
    WHEN id_cliente = 16 THEN 'Calle Alonso de Córdova 3435, Vitacura, Santiago'
    WHEN id_cliente = 17 THEN 'Av. Manquehue 3637, Las Condes, Santiago'
    WHEN id_cliente = 18 THEN 'Calle Nueva Costanera 3839, Vitacura, Santiago'
    WHEN id_cliente = 19 THEN 'Av. Isidora Goyenechea 4041, Las Condes, Santiago'
    WHEN id_cliente = 20 THEN 'Calle El Bosque Norte 4243, Las Condes, Santiago'
    WHEN id_cliente = 21 THEN 'Av. Santa María 4445, Ñuñoa, Santiago'
    WHEN id_cliente = 22 THEN 'Calle Irarrázaval 4647, Ñuñoa, Santiago'
    WHEN id_cliente = 23 THEN 'Av. Grecia 4849, Ñuñoa, Santiago'
    WHEN id_cliente = 24 THEN 'Calle Duble Almeyda 5051, Ñuñoa, Santiago'
    WHEN id_cliente = 25 THEN 'Av. La Chascona 5253, La Chascona, Santiago'
    WHEN id_cliente = 26 THEN 'Calle Bellavista 5455, Providencia, Santiago'
    WHEN id_cliente = 27 THEN 'Av. Suecia 5657, Providencia, Santiago'
    WHEN id_cliente = 28 THEN 'Calle Lyon 5859, Providencia, Santiago'
    WHEN id_cliente = 29 THEN 'Av. Holanda 6061, Providencia, Santiago'
    WHEN id_cliente = 30 THEN 'Calle Pedro de Valdivia 6263, Ñuñoa, Santiago'
    WHEN id_cliente = 31 THEN 'Av. Francisco Bilbao 6465, Providencia, Santiago'
    WHEN id_cliente = 32 THEN 'Calle General del Canto 6667, Providencia, Santiago'
    WHEN id_cliente = 33 THEN 'Av. 11 de Septiembre 6869, Ñuñoa, Santiago'
    WHEN id_cliente = 34 THEN 'Calle Simón Bolívar 7071, Ñuñoa, Santiago'
    WHEN id_cliente = 35 THEN 'Av. José Pedro Alessandri 7273, Ñuñoa, Santiago'
    WHEN id_cliente = 36 THEN 'Calle Salvador 7475, Providencia, Santiago'
    WHEN id_cliente = 37 THEN 'Av. Salvador 7677, Providencia, Santiago'
    WHEN id_cliente = 38 THEN 'Calle Antonio Varas 7879, Providencia, Santiago'
    WHEN id_cliente = 39 THEN 'Av. Ricardo Lyon 8081, Providencia, Santiago'
    WHEN id_cliente = 40 THEN 'Calle Los Militares 8283, Las Condes, Santiago'
    WHEN id_cliente = 41 THEN 'Av. Las Condes 8485, Las Condes, Santiago'
    WHEN id_cliente = 42 THEN 'Calle El Golf 8687, Las Condes, Santiago'
    WHEN id_cliente = 43 THEN 'Av. El Bosque 8889, Las Condes, Santiago'
    WHEN id_cliente = 44 THEN 'Calle Cristóbal Colón 9091, Las Condes, Santiago'
    WHEN id_cliente = 45 THEN 'Av. Vitacura 9293, Vitacura, Santiago'
    WHEN id_cliente = 46 THEN 'Calle Nueva Tajamar 9495, Vitacura, Santiago'
    WHEN id_cliente = 47 THEN 'Av. La Dehesa 9697, Lo Barnechea, Santiago'
    WHEN id_cliente = 48 THEN 'Calle El Manzano 9899, Lo Barnechea, Santiago'
    WHEN id_cliente = 49 THEN 'Av. La Reina 10101, La Reina, Santiago'
    WHEN id_cliente = 50 THEN 'Calle Príncipe de Gales 10203, La Reina, Santiago'
    ELSE 'Dirección por confirmar, Santiago, Chile'
  END,
WHERE direccion IS NULL OR direccion = '' OR LENGTH(TRIM(direccion)) = 0;

-- Para clientes que no tienen fecha de creación, asignar fechas aleatorias en los últimos 2 años
UPDATE clientes
SET
  created_at = CASE
    WHEN id_cliente = 1 THEN '2023-01-15 10:30:00+00'
    WHEN id_cliente = 2 THEN '2023-02-20 14:15:00+00'
    WHEN id_cliente = 3 THEN '2023-03-10 09:45:00+00'
    WHEN id_cliente = 4 THEN '2023-04-05 16:20:00+00'
    WHEN id_cliente = 5 THEN '2023-05-12 11:30:00+00'
    WHEN id_cliente = 6 THEN '2023-06-18 13:45:00+00'
    WHEN id_cliente = 7 THEN '2023-07-22 15:10:00+00'
    WHEN id_cliente = 8 THEN '2023-08-08 10:55:00+00'
    WHEN id_cliente = 9 THEN '2023-09-14 12:25:00+00'
    WHEN id_cliente = 10 THEN '2023-10-03 14:40:00+00'
    WHEN id_cliente = 11 THEN '2023-11-19 09:15:00+00'
    WHEN id_cliente = 12 THEN '2023-12-07 16:50:00+00'
    WHEN id_cliente = 13 THEN '2024-01-25 11:20:00+00'
    WHEN id_cliente = 14 THEN '2024-02-14 13:35:00+00'
    WHEN id_cliente = 15 THEN '2024-03-08 15:45:00+00'
    WHEN id_cliente = 16 THEN '2024-04-22 10:10:00+00'
    WHEN id_cliente = 17 THEN '2024-05-16 12:55:00+00'
    WHEN id_cliente = 18 THEN '2024-06-03 14:30:00+00'
    WHEN id_cliente = 19 THEN '2024-07-19 09:25:00+00'
    WHEN id_cliente = 20 THEN '2024-08-11 16:15:00+00'
    WHEN id_cliente = 21 THEN '2024-09-27 11:40:00+00'
    WHEN id_cliente = 22 THEN '2024-10-09 13:50:00+00'
    WHEN id_cliente = 23 THEN '2024-11-01 15:05:00+00'
    WHEN id_cliente = 24 THEN '2024-11-15 10:35:00+00'
    WHEN id_cliente = 25 THEN '2024-11-20 12:45:00+00'
    WHEN id_cliente = 26 THEN '2024-11-25 14:55:00+00'
    WHEN id_cliente = 27 THEN '2024-11-28 09:20:00+00'
    WHEN id_cliente = 28 THEN '2024-12-02 16:40:00+00'
    WHEN id_cliente = 29 THEN '2024-12-05 11:15:00+00'
    WHEN id_cliente = 30 THEN '2024-12-08 13:25:00+00'
    WHEN id_cliente = 31 THEN '2024-12-10 15:35:00+00'
    WHEN id_cliente = 32 THEN '2024-12-12 10:50:00+00'
    WHEN id_cliente = 33 THEN '2024-12-15 12:05:00+00'
    WHEN id_cliente = 34 THEN '2024-12-18 14:20:00+00'
    WHEN id_cliente = 35 THEN '2024-12-20 09:40:00+00'
    WHEN id_cliente = 36 THEN '2024-12-22 16:55:00+00'
    WHEN id_cliente = 37 THEN '2024-12-24 11:30:00+00'
    WHEN id_cliente = 38 THEN '2024-12-26 13:45:00+00'
    WHEN id_cliente = 39 THEN '2024-12-28 15:00:00+00'
    WHEN id_cliente = 40 THEN '2024-12-30 10:25:00+00'
    WHEN id_cliente = 41 THEN '2025-01-02 12:40:00+00'
    WHEN id_cliente = 42 THEN '2025-01-05 14:50:00+00'
    WHEN id_cliente = 43 THEN '2025-01-08 09:35:00+00'
    WHEN id_cliente = 44 THEN '2025-01-10 16:45:00+00'
    WHEN id_cliente = 45 THEN '2025-01-12 11:55:00+00'
    WHEN id_cliente = 46 THEN '2025-01-15 13:10:00+00'
    WHEN id_cliente = 47 THEN '2025-01-18 15:25:00+00'
    WHEN id_cliente = 48 THEN '2025-01-20 10:40:00+00'
    WHEN id_cliente = 49 THEN '2025-01-22 12:55:00+00'
    WHEN id_cliente = 50 THEN '2025-01-25 14:05:00+00'
    ELSE NOW() - INTERVAL '30 days'
  END
WHERE created_at IS NULL;

-- Verificar que todos los clientes tienen dirección y fecha de creación
SELECT
  id_cliente,
  nombrecliente,
  direccion,
  created_at
FROM clientes
WHERE direccion IS NULL OR direccion = '' OR created_at IS NULL
ORDER BY id_cliente;

-- Mostrar resumen final de clientes actualizados
SELECT
  COUNT(*) as total_clientes,
  COUNT(CASE WHEN direccion IS NOT NULL AND LENGTH(TRIM(direccion)) > 0 THEN 1 END) as clientes_con_direccion,
  COUNT(CASE WHEN created_at IS NOT NULL THEN 1 END) as clientes_con_fecha_creacion
FROM clientes;