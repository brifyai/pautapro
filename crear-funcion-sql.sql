-- Función para ejecutar comandos SQL en Supabase
-- Esto debe ser ejecutado en el panel de SQL de Supabase

CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS TABLE(result text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Ejecutar el SQL dinámico
    EXECUTE sql;
    RETURN QUERY SELECT 'SQL executed successfully'::text as result;
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'Error: ' || SQLERRM::text as result;
END;
$$;

-- Grant de permisos
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;