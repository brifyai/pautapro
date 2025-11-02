-- ========================================
-- Script de Migración de Datos
-- Transforma datos del esquema antiguo al nuevo con snake_case
-- ========================================

-- PASO 1: Crear tablas nuevas con snake_case
-- (Ejecutar primero database-schema-updated.sql)

-- PASO 2: Migrar datos de tablas de catálogos
-- ========================================

-- Migrar Regiones
INSERT INTO region (id, nombre_region, created_at, updated_at)
SELECT id, "nombreRegion", created_at, updated_at FROM "Region"
ON CONFLICT (id) DO NOTHING;

-- Migrar Comunas
INSERT INTO comunas (id, nombre_comuna, id_region, created_at, updated_at)
SELECT id, "nombreComuna", id_region, created_at, updated_at FROM "Comunas"
ON CONFLICT (id) DO NOTHING;

-- Migrar Tipos de Cliente
INSERT INTO tipo_cliente (id, nombre_tipo_cliente, created_at, updated_at)
SELECT id, "nombreTipoCliente", created_at, updated_at FROM "TipoCliente"
ON CONFLICT (id) DO NOTHING;

-- Migrar Grupos
INSERT INTO grupos (id_grupo, nombre_grupo, created_at, updated_at)
SELECT id_grupo, nombre_grupo, created_at, updated_at FROM "Grupos"
ON CONFLICT (id_grupo) DO NOTHING;

-- Migrar Perfiles
INSERT INTO perfiles (id, nombre_perfil, descripcion, created_at, updated_at)
SELECT id, "NombrePerfil", descripcion, created_at, updated_at FROM "Perfiles"
ON CONFLICT (id) DO NOTHING;

-- Migrar Medios
INSERT INTO medios (id, nombre_del_medio, codigo, duracion, color, codigo_megatime, calidad, cooperado, rubro, estado, created_at, updated_at)
SELECT id, nombredelmedio, codigo, duracion, color, codigo_megatime, calidad, cooperado, rubro, estado, created_at, updated_at FROM "Medios"
ON CONFLICT (id) DO NOTHING;

-- Migrar Calidad
INSERT INTO calidad (id, nombre_calidad, created_at, updated_at)
SELECT id, "NombreCalidad", created_at, updated_at FROM "Calidad"
ON CONFLICT (id) DO NOTHING;

-- Migrar Forma de Pago
INSERT INTO forma_de_pago (id, nombre_forma_de_pago, created_at, updated_at)
SELECT id, "NombreFormadePago", created_at, updated_at FROM "FormaDePago"
ON CONFLICT (id) DO NOTHING;

-- Migrar Tipo Generación de Orden
INSERT INTO tipo_generacion_de_orden (id, nombre_tipo_orden, created_at, updated_at)
SELECT id, "NombreTipoOrden", created_at, updated_at FROM "TipoGeneracionDeOrden"
ON CONFLICT (id) DO NOTHING;

-- Migrar Años
INSERT INTO anios (id, years, created_at, updated_at)
SELECT id, years, created_at, updated_at FROM "Anios"
ON CONFLICT (id) DO NOTHING;

-- Migrar Meses
INSERT INTO meses (id, nombre, created_at, updated_at)
SELECT "Id", "Nombre", created_at, updated_at FROM "Meses"
ON CONFLICT (id) DO NOTHING;

-- Migrar Tabla Formato
INSERT INTO tabla_formato (id, nombre_formato, created_at, updated_at)
SELECT id, nombreFormato, created_at, updated_at FROM "TablaFormato"
ON CONFLICT (id) DO NOTHING;

-- PASO 3: Migrar tablas principales
-- ========================================

-- Migrar Usuarios
INSERT INTO usuarios (id_usuario, nombre, email, password, id_perfil, id_grupo, estado, created_at, updated_at)
SELECT id_usuario, nombre, email, password, id_perfil, id_grupo, estado, created_at, updated_at FROM "Usuarios"
ON CONFLICT (id_usuario) DO NOTHING;

-- Migrar Agencias
INSERT INTO agencias (id, nombre_identificador, nombre_de_fantasia, rut, direccion, id_region, id_comuna, telefono, email, estado, created_at, updated_at)
SELECT id, "NombreIdentificador", "NombreDeFantasia", "RUT", "Direccion", id_region, id_comuna, "Telefono", "Email", estado, created_at, updated_at FROM "Agencias"
ON CONFLICT (id) DO NOTHING;

-- Migrar Clientes
INSERT INTO clientes (id_cliente, nombre_cliente, rut, razon_social, direccion, id_region, id_comuna, telefono, email, id_tipo_cliente, id_grupo, estado, created_at, updated_at)
SELECT id_cliente, nombreCliente, "RUT", razonSocial, "Direccion", id_region, id_comuna, "Telefono", "Email", id_tipo_cliente, id_grupo, estado, created_at, updated_at FROM "Clientes"
ON CONFLICT (id_cliente) DO NOTHING;

-- Migrar Proveedores
INSERT INTO proveedores (id_proveedor, nombre_proveedor, rut, razon_social, direccion, id_region, id_comuna, telefono, email, estado, created_at, updated_at)
SELECT id_proveedor, nombreProveedor, "RUT", razonSocial, "Direccion", id_region, id_comuna, "Telefono", "Email", estado, created_at, updated_at FROM "Proveedores"
ON CONFLICT (id_proveedor) DO NOTHING;

-- Migrar Soportes
INSERT INTO soportes (id_soporte, nombre_identificador, bonificacion_ano, escala, descripcion, estado, c_orden, created_at, updated_at)
SELECT id_soporte, nombreidentificador, bonificacionano, escala, descripcion, estado, c_orden, created_at, updated_at FROM "Soportes"
ON CONFLICT (id_soporte) DO NOTHING;

-- PASO 4: Migrar tablas de relación
-- ========================================

-- Migrar proveedor_soporte
INSERT INTO proveedor_soporte (id, id_proveedor, id_soporte, created_at)
SELECT id, id_proveedor, id_soporte, created_at FROM proveedor_soporte
ON CONFLICT (id) DO NOTHING;

-- Migrar soporte_medios
INSERT INTO soporte_medios (id, id_soporte, id_medio, created_at)
SELECT id, id_soporte, id_medio, created_at FROM soporte_medios
ON CONFLICT (id) DO NOTHING;

-- Migrar Productos
INSERT INTO productos (id, nombre_del_producto, id_cliente, estado, created_at, updated_at)
SELECT id, "NombreDelProducto", "Id_Cliente", "Estado", created_at, updated_at FROM "Productos"
ON CONFLICT (id) DO NOTHING;

-- Migrar Contratos
INSERT INTO contratos (id, id_medios, id_proveedor, id_cliente, id_forma_pago, id_tipo_orden, numero_contrato, descripcion, monto, fecha_inicio, fecha_fin, estado, c_orden, created_at, updated_at)
SELECT id, "IdMedios", id_proveedor, id_cliente, id_forma_pago, id_tipo_orden, numero_contrato, descripcion, monto, fecha_inicio, fecha_fin, estado, c_orden, created_at, updated_at FROM "Contratos"
ON CONFLICT (id) DO NOTHING;

-- Migrar Programas
INSERT INTO programas (id, id_soporte, nombre_programa, cod_prog_megatime, descripcion, duracion, costo, estado, c_orden, created_at, updated_at)
SELECT id, id_soporte, nombre_programa, cod_prog_megatime, descripcion, duracion, costo, estado, c_orden, created_at, updated_at FROM "Programas"
ON CONFLICT (id) DO NOTHING;

-- Migrar programa_medios
INSERT INTO programa_medios (id, id_programa, id_medio, created_at)
SELECT id, id_programa, id_medio, created_at FROM programa_medios
ON CONFLICT (id) DO NOTHING;

-- Migrar Clasificación
INSERT INTO clasificacion (id, id_medio, id_contrato, nombre_clasificacion, descripcion, created_at, updated_at)
SELECT id, id_medio, id_contrato, nombre_clasificacion, descripcion, created_at, updated_at FROM "Clasificacion"
ON CONFLICT (id) DO NOTHING;

-- Migrar Campañas
INSERT INTO campania (id_campania, nombre_campania, id_cliente, id_agencia, id_producto, id_anio, presupuesto, descripcion, estado, c_orden, created_at, updated_at)
SELECT id_campania, "NombreCampania", "id_Cliente", "id_Agencia", id_producto, id_anio, "Presupuesto", descripcion, estado, c_orden, created_at, updated_at FROM "Campania"
ON CONFLICT (id_campania) DO NOTHING;

-- Migrar Temas
INSERT INTO temas (id_tema, nombre_tema, id_medio, id_calidad, descripcion, estado, c_orden, created_at, updated_at)
SELECT id_tema, nombre_tema, id_medio, id_calidad, descripcion, estado, c_orden, created_at, updated_at FROM "Temas"
ON CONFLICT (id_tema) DO NOTHING;

-- Migrar campania_temas
INSERT INTO campania_temas (id, id_campania, id_temas, created_at)
SELECT id, id_campania, id_temas, created_at FROM campania_temas
ON CONFLICT (id) DO NOTHING;

-- Migrar Planes
INSERT INTO plan (id, id_cliente, id_campania, anio, mes, nombre_plan, descripcion, presupuesto, estado, estado2, created_at, updated_at)
SELECT id, id_cliente, id_campania, anio, mes, nombre_plan, descripcion, presupuesto, estado, estado2, created_at, updated_at FROM plan
ON CONFLICT (id) DO NOTHING;

-- Migrar campana_planes
INSERT INTO campana_planes (id, id_campania, id_plan, created_at)
SELECT id, id_campania, id_plan, created_at FROM campana_planes
ON CONFLICT (id) DO NOTHING;

-- Migrar Alternativas
INSERT INTO alternativa (id, id_soporte, id_programa, id_contrato, id_tema, id_clasificacion, numero_orden, descripcion, costo, duracion, estado, created_at, updated_at)
SELECT id, id_soporte, id_programa, id_contrato, id_tema, id_clasificacion, numerorden, descripcion, costo, duracion, estado, created_at, updated_at FROM alternativa
ON CONFLICT (id) DO NOTHING;

-- Migrar plan_alternativas
INSERT INTO plan_alternativas (id, id_plan, id_alternativa, created_at)
SELECT id, id_plan, id_alternativa, created_at FROM plan_alternativas
ON CONFLICT (id) DO NOTHING;

-- Migrar Órdenes de Publicidad
INSERT INTO ordenes_de_publicidad (id_ordenes_de_compra, numero_correlativo, id_cliente, id_campania, id_plan, alternativas_plan_orden, alternativa_actual, fecha_orden, fecha_ejecucion, monto_total, estado, observaciones, created_at, updated_at)
SELECT id_ordenes_de_comprar, numero_correlativo, id_cliente, id_campania, id_plan, alternativas_plan_orden, alternativaActual, fecha_orden, fecha_ejecucion, monto_total, estado, observaciones, created_at, updated_at FROM "OrdenesDePublicidad"
ON CONFLICT (id_ordenes_de_compra) DO NOTHING;

-- Migrar Facturas
INSERT INTO facturas (id, id_campania, numero_factura, fecha_emision, fecha_vencimiento, monto, estado, created_at, updated_at)
SELECT id, id_campania, numero_factura, fecha_emision, fecha_vencimiento, monto, estado, created_at, updated_at FROM "Facturas"
ON CONFLICT (id) DO NOTHING;

-- Migrar Comisiones
INSERT INTO comisiones (id_comision, id_cliente, porcentaje, monto_fijo, tipo_comision, descripcion, estado, created_at, updated_at)
SELECT id_comision, id_cliente, porcentaje, monto_fijo, tipo_comision, descripcion, estado, created_at, updated_at FROM "Comisiones"
ON CONFLICT (id_comision) DO NOTHING;

-- Migrar Contactos de Clientes
INSERT INTO contacto_cliente (id, id_cliente, nombre_contacto, cargo, telefono, email, created_at, updated_at)
SELECT id, id_cliente, nombre_contacto, cargo, telefono, email, created_at, updated_at FROM contactocliente
ON CONFLICT (id) DO NOTHING;

-- Migrar Contactos de Proveedores
INSERT INTO contacto_proveedor (id, id_proveedor, nombre_contacto, cargo, telefono, email, created_at, updated_at)
SELECT id, id_proveedor, nombre_contacto, cargo, telefono, email, created_at, updated_at FROM contactos
ON CONFLICT (id) DO NOTHING;

-- Migrar Otros Datos
INSERT INTO otros_datos (id, id_cliente, tipo_dato, valor_dato, created_at, updated_at)
SELECT id, id_cliente, tipo_dato, valor_dato, created_at, updated_at FROM "OtrosDatos"
ON CONFLICT (id) DO NOTHING;

-- Migrar Avisos
INSERT INTO aviso (id, titulo, mensaje, tipo, fecha_inicio, fecha_fin, estado, created_at, updated_at)
SELECT id, titulo, mensaje, tipo, fecha_inicio, fecha_fin, estado, created_at, updated_at FROM aviso
ON CONFLICT (id) DO NOTHING;

-- PASO 5: Actualizar secuencias
-- ========================================

SELECT setval('region_id_seq', (SELECT MAX(id) FROM region) + 1);
SELECT setval('comunas_id_seq', (SELECT MAX(id) FROM comunas) + 1);
SELECT setval('tipo_cliente_id_seq', (SELECT MAX(id) FROM tipo_cliente) + 1);
SELECT setval('grupos_id_grupo_seq', (SELECT MAX(id_grupo) FROM grupos) + 1);
SELECT setval('perfiles_id_seq', (SELECT MAX(id) FROM perfiles) + 1);
SELECT setval('medios_id_seq', (SELECT MAX(id) FROM medios) + 1);
SELECT setval('calidad_id_seq', (SELECT MAX(id) FROM calidad) + 1);
SELECT setval('forma_de_pago_id_seq', (SELECT MAX(id) FROM forma_de_pago) + 1);
SELECT setval('tipo_generacion_de_orden_id_seq', (SELECT MAX(id) FROM tipo_generacion_de_orden) + 1);
SELECT setval('anios_id_seq', (SELECT MAX(id) FROM anios) + 1);
SELECT setval('meses_id_seq', (SELECT MAX(id) FROM meses) + 1);
SELECT setval('tabla_formato_id_seq', (SELECT MAX(id) FROM tabla_formato) + 1);
SELECT setval('usuarios_id_usuario_seq', (SELECT MAX(id_usuario) FROM usuarios) + 1);
SELECT setval('agencias_id_seq', (SELECT MAX(id) FROM agencias) + 1);
SELECT setval('clientes_id_cliente_seq', (SELECT MAX(id_cliente) FROM clientes) + 1);
SELECT setval('proveedores_id_proveedor_seq', (SELECT MAX(id_proveedor) FROM proveedores) + 1);
SELECT setval('soportes_id_soporte_seq', (SELECT MAX(id_soporte) FROM soportes) + 1);
SELECT setval('productos_id_seq', (SELECT MAX(id) FROM productos) + 1);
SELECT setval('contratos_id_seq', (SELECT MAX(id) FROM contratos) + 1);
SELECT setval('programas_id_seq', (SELECT MAX(id) FROM programas) + 1);
SELECT setval('clasificacion_id_seq', (SELECT MAX(id) FROM clasificacion) + 1);
SELECT setval('campania_id_campania_seq', (SELECT MAX(id_campania) FROM campania) + 1);
SELECT setval('temas_id_tema_seq', (SELECT MAX(id_tema) FROM temas) + 1);
SELECT setval('plan_id_seq', (SELECT MAX(id) FROM plan) + 1);
SELECT setval('alternativa_id_seq', (SELECT MAX(id) FROM alternativa) + 1);
SELECT setval('ordenes_de_publicidad_id_ordenes_de_compra_seq', (SELECT MAX(id_ordenes_de_compra) FROM ordenes_de_publicidad) + 1);
SELECT setval('facturas_id_seq', (SELECT MAX(id) FROM facturas) + 1);
SELECT setval('comisiones_id_comision_seq', (SELECT MAX(id_comision) FROM comisiones) + 1);
SELECT setval('aviso_id_seq', (SELECT MAX(id) FROM aviso) + 1);

-- ========================================
-- Fin de la migración
-- ========================================
