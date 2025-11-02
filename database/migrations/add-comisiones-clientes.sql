-- Script para agregar comisiones de ejemplo a todos los clientes registrados
-- Ejecutar en Supabase SQL Editor

-- Cliente 1: Empresa Ejemplo S.A.
INSERT INTO comisiones (id_cliente, tipo_comision, porcentaje, monto_fijo, descripcion, estado) VALUES
(1, 'ONLINE %', 8.5, NULL, 'Comisión por ventas online - Empresa Ejemplo', true),
(1, 'OFF LINE %', 12.0, NULL, 'Comisión por ventas presenciales - Empresa Ejemplo', true);

-- Cliente 2: Andes Media Group
INSERT INTO comisiones (id_cliente, tipo_comision, porcentaje, monto_fijo, descripcion, estado) VALUES
(2, 'ONLINE FEE', NULL, 15000, 'Tarifa fija por campaña digital - Andes Media', true),
(2, 'COMISION % FEE', 6.0, 8000, 'Comisión mixta digital - Andes Media', true);

-- Cliente 3: Pacífico Retail Partners
INSERT INTO comisiones (id_cliente, tipo_comision, porcentaje, monto_fijo, descripcion, estado) VALUES
(3, 'OFF LINE %', 15.0, NULL, 'Comisión retail tradicional - Pacífico Retail', true),
(3, 'FEE', NULL, 25000, 'Tarifa mensual por servicios - Pacífico Retail', true);

-- Cliente 4: BioSur Laboratorios
INSERT INTO comisiones (id_cliente, tipo_comision, porcentaje, monto_fijo, descripcion, estado) VALUES
(4, 'ONLINE %', 10.0, NULL, 'Comisión por ventas farmacéuticas online - BioSur', true),
(4, 'OFF LINE FEE', NULL, 20000, 'Tarifa por distribución física - BioSur', true);

-- Cliente 5: Altamar Cruceros
INSERT INTO comisiones (id_cliente, tipo_comision, porcentaje, monto_fijo, descripcion, estado) VALUES
(5, 'COMISION % FEE', 8.0, 12000, 'Comisión mixta turismo - Altamar', true),
(5, 'ONLINE FEE', NULL, 18000, 'Tarifa por reservas online - Altamar', true);

-- Cliente 6: Cordillera Foods
INSERT INTO comisiones (id_cliente, tipo_comision, porcentaje, monto_fijo, descripcion, estado) VALUES
(6, 'OFF LINE %', 14.0, NULL, 'Comisión por distribución alimentaria - Cordillera', true),
(6, 'FEE', NULL, 22000, 'Tarifa mensual por cadena de suministro - Cordillera', true);

-- Cliente 7: LuzNorte Energía
INSERT INTO comisiones (id_cliente, tipo_comision, porcentaje, monto_fijo, descripcion, estado) VALUES
(7, 'ONLINE %', 7.5, NULL, 'Comisión por servicios energéticos online - LuzNorte', true),
(7, 'COMISION % FEE', 5.0, 10000, 'Comisión mixta energía renovable - LuzNorte', true);

-- Cliente 8: Marítima del Pacífico
INSERT INTO comisiones (id_cliente, tipo_comision, porcentaje, monto_fijo, descripcion, estado) VALUES
(8, 'OFF LINE FEE', NULL, 35000, 'Tarifa por servicios portuarios - Marítima', true),
(8, 'ONLINE %', 9.0, NULL, 'Comisión por reservas online - Marítima', true);

-- Cliente 9: Finanzas Andina
INSERT INTO comisiones (id_cliente, tipo_comision, porcentaje, monto_fijo, descripcion, estado) VALUES
(9, 'FEE', NULL, 30000, 'Tarifa mensual por asesoría financiera - Finanzas Andina', true),
(9, 'COMISION % FEE', 6.5, 15000, 'Comisión mixta inversiones - Finanzas Andina', true);

-- Cliente 10: InnovaTech Solutions
INSERT INTO comisiones (id_cliente, tipo_comision, porcentaje, monto_fijo, descripcion, estado) VALUES
(10, 'ONLINE %', 11.0, NULL, 'Comisión por soluciones tecnológicas - InnovaTech', true),
(10, 'ONLINE FEE', NULL, 25000, 'Tarifa por desarrollo de software - InnovaTech', true);

-- Cliente 11: Patagonia Outdoor Retail
INSERT INTO comisiones (id_cliente, tipo_comision, porcentaje, monto_fijo, descripcion, estado) VALUES
(11, 'OFF LINE %', 13.0, NULL, 'Comisión por ventas outdoor - Patagonia', true),
(11, 'COMISION % FEE', 7.0, 14000, 'Comisión mixta productos outdoor - Patagonia', true);

-- Verificar inserción
SELECT
    c.id_cliente,
    cl.nombrecliente,
    COUNT(co.id_comision) as total_comisiones,
    STRING_AGG(co.tipo_comision || ' (' || COALESCE(co.porcentaje::text || '%', '$' || co.monto_fijo::text) || ')', ', ') as tipos_comision
FROM clientes cl
LEFT JOIN comisiones co ON cl.id_cliente = co.id_cliente
LEFT JOIN clientes c ON cl.id_cliente = c.id_cliente
GROUP BY c.id_cliente, cl.nombrecliente
ORDER BY c.id_cliente;