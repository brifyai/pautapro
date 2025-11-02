-- Verificar qué tipos de cliente existen actualmente en la base de datos
SELECT * FROM tipocliente ORDER BY id_tyipoCliente;

-- Verificar qué tipos de cliente están usando los clientes existentes
SELECT DISTINCT id_tipo_cliente, COUNT(*) as cantidad_clientes
FROM clientes 
WHERE id_tipo_cliente IS NOT NULL
GROUP BY id_tipo_cliente
ORDER BY id_tipo_cliente;

-- Verificar ejemplos de clientes con sus tipos
SELECT id_cliente, nombrecliente, id_tipo_cliente, giro
FROM clientes 
WHERE id_tipo_cliente IS NOT NULL
LIMIT 10;