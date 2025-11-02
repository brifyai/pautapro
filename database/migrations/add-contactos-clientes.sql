-- Script para agregar contactos de ejemplo a todos los clientes
-- Ejecutar en Supabase SQL Editor

-- Cliente 1: Empresa Nacional S.A.
INSERT INTO contactocliente (id_cliente, nombre_contacto, telefono, email, cargo) VALUES
(1, 'María González López', '+56987654321', 'maria.gonzalez@nacional.cl', 'Gerente General'),
(1, 'Carlos Rodríguez Pérez', '+56981234567', 'carlos.rodriguez@nacional.cl', 'Jefe de Marketing');

-- Cliente 2: Corporación Industrial Ltda.
INSERT INTO contactocliente (id_cliente, nombre_contacto, telefono, email, cargo) VALUES
(2, 'Ana Martínez Silva', '+56976543210', 'ana.martinez@industrial.cl', 'Directora Ejecutiva'),
(2, 'Pedro Sánchez Torres', '+56989876543', 'pedro.sanchez@industrial.cl', 'Gerente de Ventas');

-- Cliente 3: Servicios Profesionales SpA
INSERT INTO contactocliente (id_cliente, nombre_contacto, telefono, email, cargo) VALUES
(3, 'Laura Fernández Ruiz', '+56975432109', 'laura.fernandez@servicios.cl', 'Socia Directora'),
(3, 'Diego López Morales', '+56988765432', 'diego.lopez@servicios.cl', 'Coordinador de Proyectos');

-- Cliente 4: Tecnología Avanzada S.A.
INSERT INTO contactocliente (id_cliente, nombre_contacto, telefono, email, cargo) VALUES
(4, 'Valentina Díaz Castro', '+56974321098', 'valentina.diaz@tecnologia.cl', 'CEO'),
(4, 'Felipe Ramírez Vega', '+56987654321', 'felipe.ramirez@tecnologia.cl', 'CTO');

-- Cliente 5: Construcciones Modernas Ltda.
INSERT INTO contactocliente (id_cliente, nombre_contacto, telefono, email, cargo) VALUES
(5, 'Camila Torres Mendoza', '+56973210987', 'camila.torres@construcciones.cl', 'Gerente de Operaciones'),
(5, 'Sebastián Flores Rojas', '+56986543210', 'sebastian.flores@construcciones.cl', 'Ingeniero Jefe');

-- Cliente 6: Comercio Internacional S.A.
INSERT INTO contactocliente (id_cliente, nombre_contacto, telefono, email, cargo) VALUES
(6, 'Isabella Vargas Paredes', '+56972109876', 'isabella.vargas@comercio.cl', 'Directora Comercial'),
(6, 'Matías González Soto', '+56985432109', 'matias.gonzalez@comercio.cl', 'Gerente de Exportaciones');

-- Cliente 7: Salud y Bienestar SpA
INSERT INTO contactocliente (id_cliente, nombre_contacto, telefono, email, cargo) VALUES
(7, 'Antonia Morales Castillo', '+56971098765', 'antonia.morales@salud.cl', 'Directora Médica'),
(7, 'Joaquín Silva Navarro', '+56984321098', 'joaquin.silva@salud.cl', 'Gerente Administrativo');

-- Cliente 8: Educación Superior Ltda.
INSERT INTO contactocliente (id_cliente, nombre_contacto, telefono, email, cargo) VALUES
(8, 'Francisca Reyes Guzmán', '+56970987654', 'francisca.reyes@educacion.cl', 'Rectora'),
(8, 'Tomás Castro Medina', '+56983210987', 'tomas.castro@educacion.cl', 'Decano de Estudios');

-- Cliente 9: Transporte y Logística S.A.
INSERT INTO contactocliente (id_cliente, nombre_contacto, telefono, email, cargo) VALUES
(9, 'Gabriela Hernández Flores', '+56979876543', 'gabriela.hernandez@transporte.cl', 'Gerente de Logística'),
(9, 'Emilio Torres Valdés', '+56982109876', 'emilio.torres@transporte.cl', 'Supervisor de Flota');

-- Cliente 10: Energía Renovable SpA
INSERT INTO contactocliente (id_cliente, nombre_contacto, telefono, email, cargo) VALUES
(10, 'Renata Soto Pereira', '+56978765432', 'renata.soto@energia.cl', 'Directora de Sostenibilidad'),
(10, 'Vicente Morales Aguirre', '+56981098765', 'vicente.morales@energia.cl', 'Ingeniero de Proyectos');

-- Cliente 11: Turismo y Hospitalidad Ltda.
INSERT INTO contactocliente (id_cliente, nombre_contacto, telefono, email, cargo) VALUES
(11, 'Catalina Navarro Pinto', '+56977654321', 'catalina.navarro@turismo.cl', 'Gerente de Turismo'),
(11, 'Maximiliano Ruiz Ortega', '+56980987654', 'maximiliano.ruiz@turismo.cl', 'Coordinador de Eventos');

-- Solo agregar contactos para los clientes que existen (IDs 1-11)
-- Los clientes 12-20 no existen en la base de datos actualmente

-- Verificar inserción
SELECT
    c.id_cliente,
    c.nombrecliente,
    COUNT(co.id) as total_contactos
FROM clientes c
LEFT JOIN contactocliente co ON c.id_cliente = co.id_cliente
GROUP BY c.id_cliente, c.nombrecliente
ORDER BY c.id_cliente;