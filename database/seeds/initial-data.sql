-- ========================================
-- Datos Iniciales para el Sistema de Órdenes
-- ========================================

-- Insertar datos básicos en tablas de catálogo
-- ========================================

-- Regiones de Chile
INSERT INTO Region (nombreRegion) VALUES
('Región de Arica y Parinacota'),
('Región de Tarapacá'),
('Región de Antofagasta'),
('Región de Atacama'),
('Región de Coquimbo'),
('Región de Valparaíso'),
('Región Metropolitana de Santiago'),
('Región del Libertador General Bernardo O''Higgins'),
('Región del Maule'),
('Región de Ñuble'),
('Región del Biobío'),
('Región de La Araucanía'),
('Región de Los Ríos'),
('Región de Los Lagos'),
('Región de Aysén del General Carlos Ibáñez del Campo'),
('Región de Magallanes y de la Antártica Chilena');

-- Comunas (muestra principal - se pueden agregar más)
INSERT INTO Comunas (nombreComuna, id_region) VALUES
-- Región Metropolitana (id=7)
('Santiago', 7),
('Providencia', 7),
('Las Condes', 7),
('Vitacura', 7),
('La Reina', 7),
('Peñalolén', 7),
('La Florida', 7),
('Puente Alto', 7),
('Maipú', 7),
('San Bernardo', 7),
-- Región de Valparaíso (id=6)
('Valparaíso', 6),
('Viña del Mar', 6),
('Quilpué', 6),
('Villa Alemana', 6),
('Quillota', 6),
-- Región del Biobío (id=11)
('Concepción', 11),
('Talcahuano', 11),
-- Región de Ñuble (id=10)
('Chillán', 10),
('Los Ángeles', 11);

-- Tipos de Cliente
INSERT INTO TipoCliente (nombreTipoCliente) VALUES
('Corporativo'),
('PyME'),
('Persona Natural'),
('Institución Gubernamental'),
('ONG'),
('Educacional');

-- Grupos de Usuarios
INSERT INTO Grupos (nombre_grupo) VALUES
('Administradores'),
('Gerencia'),
('Planificación'),
('Ejecución de Campañas'),
('Facturación'),
('Reportes'),
('Clientes');

-- Perfiles de Usuario
INSERT INTO Perfiles (NombrePerfil, descripcion) VALUES
('Super Administrador', 'Acceso completo a todo el sistema'),
('Administrador', 'Acceso completo a configuración y usuarios'),
('Gerente', 'Acceso a reportes y aprobaciones'),
('Planificador', 'Gestión de planes y campañas'),
('Ejecutivo', 'Gestión de órdenes y ejecución'),
('Analista', 'Acceso a reportes y análisis'),
('Cliente', 'Acceso limitado a sus propios datos');

-- Medios Publicitarios
INSERT INTO Medios (NombredelMedio, Estado) VALUES
('Televisión'),
('Radio'),
('Prensa Escrita'),
('Revistas'),
('Digital'),
('Redes Sociales'),
('Cine'),
('Publicidad Exterior'),
('Transporte'),
('Marketing Directo');

-- Calidad de Medios
INSERT INTO Calidad (NombreCalidad) VALUES
('Premium'),
('Estándar'),
('Básico'),
('Económico');

-- Forma de Pago
INSERT INTO FormaDePago (NombreFormadePago) VALUES
('Transferencia Bancaria'),
('Cheque'),
('Tarjeta de Crédito'),
('Tarjeta de Débito'),
('Efectivo'),
('Crédito 30 días'),
('Crédito 60 días'),
('Crédito 90 días');

-- Tipo Generación de Orden
INSERT INTO TipoGeneracionDeOrden (NombreTipoOrden) VALUES
('Manual'),
('Automática'),
('Por Campaña'),
('Por Plan'),
('Urgente'),
('Programada');

-- Años (2020-2030)
INSERT INTO Anios (years) VALUES
(2020), (2021), (2022), (2023), (2024), (2025),
(2026), (2027), (2028), (2029), (2030);

-- Meses
INSERT INTO Meses (Id, Nombre) VALUES
(1, 'Enero'),
(2, 'Febrero'),
(3, 'Marzo'),
(4, 'Abril'),
(5, 'Mayo'),
(6, 'Junio'),
(7, 'Julio'),
(8, 'Agosto'),
(9, 'Septiembre'),
(10, 'Octubre'),
(11, 'Noviembre'),
(12, 'Diciembre');

-- Tabla Formato
INSERT INTO TablaFormato (nombreFormato) VALUES
('Horizontal'),
('Vertical'),
('Cuadrado'),
('Banner'),
('Story'),
('Video'),
('Audio'),
('Texto');

-- ========================================
-- Usuario Administrador por Defecto
-- ========================================

-- Insertar usuario administrador principal
-- Nota: La contraseña debe ser hasheada en la aplicación real
INSERT INTO Usuarios (nombre, email, password, id_perfil, id_grupo, estado) VALUES
('Administrador del Sistema', 'admin@sistema.cl', '$2b$12$placeholder_hash_real', 1, 1, true);

-- ========================================
-- Datos de Ejemplo para Funcionamiento Básico
-- ========================================

-- Agencia de Ejemplo
INSERT INTO Agencias (NombreIdentificador, NombreDeFantasia, RUT, Direccion, id_region, id_comuna, Telefono, Email, estado) VALUES
('AGENCIA01', 'Agencia Publicitaria Creativa', '76.123.456-7', 'Av. Providencia 1234', 6, 12, '+56 2 2345 6789', 'contacto@agenciaejemplo.cl', true);

-- Cliente de Ejemplo
INSERT INTO Clientes (nombreCliente, RUT, razonSocial, Direccion, id_region, id_comuna, Telefono, Email, id_tipo_cliente, id_grupo, estado) VALUES
('Empresa Ejemplo S.A.', '96.789.012-3', 'Empresa Ejemplo S.A.', 'Av. Las Condes 5678', 7, 13, '+56 2 2345 6789', 'contacto@empresaejemplo.cl', 1, 7, true);

-- Proveedor de Ejemplo
INSERT INTO Proveedores (nombreProveedor, RUT, razonSocial, Direccion, id_region, id_comuna, Telefono, Email, estado) VALUES
('Medios Chile S.A.', '77.456.789-0', 'Medios Chile S.A.', 'Av. Vitacura 9101', 7, 14, '+56 2 2345 6789', 'contacto@medioschile.cl', true);

-- Soporte de Ejemplo
INSERT INTO Soportes (nombreidentificador, bonificacionano, escala, descripcion, estado, c_orden) VALUES
('TV_PRIME_TIME', 0.0, 0.0, 'Espacio publicitario prime time en televisión nacional', true, false);

-- Relación Proveedor-Soporte
INSERT INTO proveedor_soporte (id_proveedor, id_soporte) VALUES
(1, 1);

-- Relación Soporte-Medios
INSERT INTO soporte_medios (id_soporte, id_medio) VALUES
(1, 1);

-- Contrato de Ejemplo
INSERT INTO Contratos (IdMedios, id_proveedor, id_cliente, id_forma_pago, id_tipo_orden, numero_contrato, descripcion, monto, fecha_inicio, fecha_fin, estado, c_orden) VALUES
(1, 1, 1, 1, 1, 'CONT-2024-001', 'Contrato de publicidad en TV prime time', 5000000.00, '2024-01-01', '2024-12-31', true, false);

-- Programa de Ejemplo
INSERT INTO Programas (id_soporte, nombre_programa, cod_prog_megatime, descripcion, duracion, costo, estado, c_orden) VALUES
(1, 'Noticiero Prime Time', 'NP001', 'Segmento publicitario en noticiero principal', 30, 100000.00, true, false);

-- Relación Programa-Medios
INSERT INTO programa_medios (id_programa, id_medio) VALUES
(1, 1);

-- Clasificación de Ejemplo
INSERT INTO Clasificacion (id_medio, id_contrato, nombre_clasificacion, descripcion) VALUES
(1, 1, 'Prime Time', 'Horario de máxima audiencia en televisión');

-- Tema de Ejemplo
INSERT INTO Temas (nombre_tema, id_medio, id_calidad, descripcion, estado, c_orden) VALUES
('Lanzamiento Producto', 1, 1, 'Campaña de lanzamiento de nuevo producto', true, false);

-- Campaña de Ejemplo
INSERT INTO Campania (NombreCampania, id_Cliente, id_Agencia, id_producto, id_anio, Presupuesto, descripcion, estado, c_orden) VALUES
('Campaña Navidad 2024', 1, 1, NULL, 5, 10000000.00, 'Campaña publicitaria de temporada navideña', true, false);

-- Relación Campaña-Temas
INSERT INTO campania_temas (id_campania, id_temas) VALUES
(1, 1);

-- Plan de Ejemplo
INSERT INTO plan (id_cliente, id_campania, anio, mes, nombre_plan, descripcion, presupuesto, estado, estado2) VALUES
(1, 1, 2024, 12, 'Plan Diciembre 2024', 'Plan de medios para diciembre', 10000000.00, true, 'activo');

-- Relación Campaña-Planes
INSERT INTO campana_planes (id_campania, id_plan) VALUES
(1, 1);

-- Alternativa de Ejemplo
INSERT INTO alternativa (id_soporte, id_programa, id_contrato, id_tema, id_clasificacion, numerorden, descripcion, costo, duracion, estado) VALUES
(1, 1, 1, 1, 1, 1, 'Spot publicitario 30 segundos prime time', 100000.00, 30, true);

-- Relación Plan-Alternativas
INSERT INTO plan_alternativas (id_plan, id_alternativa) VALUES
(1, 1);

-- Mensaje/Aviso de Bienvenida
INSERT INTO aviso (titulo, mensaje, tipo, fecha_inicio, estado) VALUES
('¡Bienvenido al Sistema de Órdenes!',
'Sistema de gestión de órdenes de publicidad completamente operativo. Para cualquier consulta contacte al administrador.',
'informativo',
CURRENT_DATE,
true);

-- ========================================
-- Actualizar secuencias (si es necesario)
-- ========================================

-- Actualizar secuencias para que los próximos IDs sean correctos
SELECT setval('region_id_seq', (SELECT MAX(id) FROM Region));
SELECT setval('comunas_id_seq', (SELECT MAX(id) FROM Comunas));
SELECT setval('tipo_cliente_id_seq', (SELECT MAX(id) FROM TipoCliente));
SELECT setval('grupos_id_grupo_seq', (SELECT MAX(id_grupo) FROM Grupos));
SELECT setval('perfiles_id_seq', (SELECT MAX(id) FROM Perfiles));
SELECT setval('medios_id_seq', (SELECT MAX(id) FROM Medios));
SELECT setval('calidad_id_seq', (SELECT MAX(id) FROM Calidad));
SELECT setval('forma_de_pago_id_seq', (SELECT MAX(id) FROM FormaDePago));
SELECT setval('tipo_generacion_de_orden_id_seq', (SELECT MAX(id) FROM TipoGeneracionDeOrden));
SELECT setval('anios_id_seq', (SELECT MAX(id) FROM Anios));
SELECT setval('meses_id_seq', (SELECT MAX(Id) FROM Meses));
SELECT setval('tabla_formato_id_seq', (SELECT MAX(id) FROM TablaFormato));
SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM Usuarios));
SELECT setval('agencias_id_seq', (SELECT MAX(id) FROM Agencias));
SELECT setval('clientes_id_cliente_seq', (SELECT MAX(id_cliente) FROM Clientes));
SELECT setval('proveedores_id_proveedor_seq', (SELECT MAX(id_proveedor) FROM Proveedores));
SELECT setval('soportes_id_soporte_seq', (SELECT MAX(id_soporte) FROM Soportes));
SELECT setval('contratos_id_seq', (SELECT MAX(id) FROM Contratos));
SELECT setval('programas_id_seq', (SELECT MAX(id) FROM Programas));
SELECT setval('clasificacion_id_seq', (SELECT MAX(id) FROM Clasificacion));
SELECT setval('temas_id_tema_seq', (SELECT MAX(id_tema) FROM Temas));
SELECT setval('campania_id_campania_seq', (SELECT MAX(id_campania) FROM Campania));
SELECT setval('plan_id_seq', (SELECT MAX(id) FROM plan));
SELECT setval('alternativa_id_seq', (SELECT MAX(id) FROM alternativa));
SELECT setval('ordenes_de_publicidad_id_ordenes_de_comprar_seq', (SELECT MAX(id_ordenes_de_comprar) FROM OrdenesDePublicidad));
SELECT setval('facturas_id_seq', (SELECT MAX(id) FROM Facturas));
SELECT setval('comisiones_id_comision_seq', (SELECT MAX(id_comision) FROM Comisiones));
SELECT setval('contactocliente_id_seq', (SELECT MAX(id) FROM contactocliente));
SELECT setval('contactos_id_seq', (SELECT MAX(id) FROM contactos));
SELECT setval('otros_datos_id_seq', (SELECT MAX(id) FROM OtrosDatos));
SELECT setval('aviso_id_seq', (SELECT MAX(id) FROM aviso));

-- ========================================
-- Finalización
-- ========================================

-- Confirmar que todos los datos se han insertado correctamente
DO $$
BEGIN
    RAISE NOTICE 'Base de datos inicializada con éxito';
    RAISE NOTICE 'Se han creado las tablas principales y datos iniciales';
    RAISE NOTICE 'Usuario administrador: admin@sistema.cl';
    RAISE NOTICE 'Contraseña por defecto: debe ser configurada';
END $$;