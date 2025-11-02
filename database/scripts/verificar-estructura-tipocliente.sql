-- Verificar la estructura real de la tabla tipocliente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tipocliente' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar datos existentes en tipocliente
SELECT * FROM tipocliente LIMIT 10;

-- Verificar cómo se relaciona con clientes
SELECT 
    c.id_cliente,
    c.nombrecliente,
    c.id_tipocliente,
    tc.nombretipocliente
FROM clientes c
LEFT JOIN tipocliente tc ON c.id_tipocliente = tc.id_tyipoCliente
LIMIT 5;