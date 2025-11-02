-- ========================================
-- Datos Iniciales para el Sistema de Órdenes (Versión Idempotente)
-- ========================================

-- Insertar datos básicos en tablas de catálogo
-- ========================================

-- Regiones de Chile (usando INSERT ... ON CONFLICT DO NOTHING)
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
('Región de Magallanes y de la Antártica Chilena')
ON CONFLICT (nombreRegion) DO NOTHING;

-- Tipos de Cliente
INSERT INTO TipoCliente (nombreTipoCliente) VALUES
('Corporativo'),
('PyME'),
('Persona Natural'),
('Institución Gubernamental'),
('ONG'),
('Educacional')
ON CONFLICT (nombreTipoCliente) DO NOTHING;

-- Grupos de Usuarios
INSERT INTO Grupos (nombre_grupo) VALUES
('Administradores'),
('Gerencia'),
('Planificación'),
('Ejecución de Campañas'),
('Facturación'),
('Reportes'),
('Clientes')
ON CONFLICT (nombre_grupo) DO NOTHING;

-- Perfiles de Usuario
INSERT INTO Perfiles (NombrePerfil, descripcion) VALUES
('Super Administrador', 'Acceso completo a todo el sistema'),
('Administrador', 'Acceso completo a configuración y usuarios'),
('Gerente', 'Acceso a reportes y aprobaciones'),
('Planificador', 'Gestión de planes y campañas'),
('Ejecutivo', 'Gestión de órdenes y ejecución'),
('Analista', 'Acceso a reportes y análisis'),
('Cliente', 'Acceso limitado a sus propios datos')
ON CONFLICT (NombrePerfil) DO NOTHING;

-- Medios Publicitarios
INSERT INTO Medios (NombredelMedio, Estado) VALUES
('Televisión', true),
('Radio', true),
('Prensa Escrita', true),
('Revistas', true),
('Digital', true),
('Redes Sociales', true),
('Cine', true),
('Publicidad Exterior', true),
('Transporte', true),
('Marketing Directo', true)
ON CONFLICT (NombredelMedio) DO NOTHING;

-- Calidad de Medios
INSERT INTO Calidad (NombreCalidad) VALUES
('Premium'),
('Estándar'),
('Básico'),
('Económico')
ON CONFLICT (NombreCalidad) DO NOTHING;

-- Forma de Pago
INSERT INTO FormaDePago (NombreFormadePago) VALUES
('Transferencia Bancaria'),
('Cheque'),
('Tarjeta de Crédito'),
('Tarjeta de Débito'),
('Efectivo'),
('Crédito 30 días'),
('Crédito 60 días'),
('Crédito 90 días')
ON CONFLICT (NombreFormadePago) DO NOTHING;

-- Tipo Generación de Orden
INSERT INTO TipoGeneracionDeOrden (NombreTipoOrden) VALUES
('Manual'),
('Automática'),
('Por Campaña'),
('Por Plan'),
('Urgente'),
('Programada')
ON CONFLICT (NombreTipoOrden) DO NOTHING;

-- Años (2020-2030)
INSERT INTO Anios (years) VALUES
(2020), (2021), (2022), (2023), (2024), (2025),
(2026), (2027), (2028), (2029), (2030)
ON CONFLICT (years) DO NOTHING;

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
(12, 'Diciembre')
ON CONFLICT (Id) DO NOTHING;

-- Tabla Formato
INSERT INTO TablaFormato (nombreFormato) VALUES
('Horizontal'),
('Vertical'),
('Cuadrado'),
('Banner'),
('Story'),
('Video'),
('Audio'),
('Texto')
ON CONFLICT (nombreFormato) DO NOTHING;

-- ========================================
-- Usuario Administrador por Defecto
-- ========================================

-- Insertar usuario administrador principal (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE email = 'admin@sistema.cl') THEN
        INSERT INTO Usuarios (nombre, email, password, id_perfil, id_grupo, estado) VALUES
        ('Administrador del Sistema', 'admin@sistema.cl', '$2b$12$placeholder_hash_real', 1, 1, true);
    END IF;
END $$;

-- ========================================
-- Datos de Ejemplo para Funcionamiento Básico
-- ========================================

-- Agencia de Ejemplo (en Valparaíso) - solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Agencias WHERE NombreIdentificador = 'AGENCIA01') THEN
        INSERT INTO Agencias (NombreIdentificador, NombreDeFantasia, RUT, Direccion, id_region, Telefono, Email, estado) VALUES
        ('AGENCIA01', 'Agencia Publicitaria Creativa', '76.123.456-7', 'Av. Valparaíso 1234', 6, '+56 2 2345 6789', 'contacto@agenciaejemplo.cl', true);
    END IF;
END $$;

-- Cliente de Ejemplo (en Región Metropolitana) - solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Clientes WHERE nombreCliente = 'Empresa Ejemplo S.A.') THEN
        INSERT INTO Clientes (nombreCliente, RUT, razonSocial, Direccion, id_region, Telefono, Email, id_tipo_cliente, id_grupo, estado) VALUES
        ('Empresa Ejemplo S.A.', '96.789.012-3', 'Empresa Ejemplo S.A.', 'Av. Principal 5678', 7, '+56 2 2345 6789', 'contacto@empresaejemplo.cl', 1, 7, true);
    END IF;
END $$;

-- Proveedor de Ejemplo (en Región Metropolitana) - solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Proveedores WHERE nombreProveedor = 'Medios Chile S.A.') THEN
        INSERT INTO Proveedores (nombreProveedor, RUT, razonSocial, Direccion, id_region, Telefono, Email, estado) VALUES
        ('Medios Chile S.A.', '77.456.789-0', 'Medios Chile S.A.', 'Av. Central 9101', 7, '+56 2 2345 6789', 'contacto@medioschile.cl', true);
    END IF;
END $$;

-- Soporte de Ejemplo - solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Soportes WHERE nombreidentficiador = 'TV_PRIME_TIME') THEN
        INSERT INTO Soportes (nombreidentficiador, descripcion, estado, c_orden) VALUES
        ('TV_PRIME_TIME', 'Espacio publicitario prime time en televisión nacional', true, false);
    END IF;
END $$;

-- Relación Proveedor-Soporte - solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM proveedor_soporte WHERE id_proveedor = 1 AND id_soporte = 1) THEN
        INSERT INTO proveedor_soporte (id_proveedor, id_soporte) VALUES (1, 1);
    END IF;
END $$;

-- Relación Soporte-Medios - solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM soporte_medios WHERE id_soporte = 1 AND id_medio = 1) THEN
        INSERT INTO soporte_medios (id_soporte, id_medio) VALUES (1, 1);
    END IF;
END $$;

-- Contrato de Ejemplo - solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Contratos WHERE numero_contrato = 'CONT-2024-001') THEN
        INSERT INTO Contratos (IdMedios, id_proveedor, id_cliente, id_forma_pago, id_tipo_orden, numero_contrato, descripcion, monto, fecha_inicio, fecha_fin, estado, c_orden) VALUES
        (1, 1, 1, 1, 1, 'CONT-2024-001', 'Contrato de publicidad en TV prime time', 5000000.00, '2024-01-01', '2024-12-31', true, false);
    END IF;
END $$;

-- Programa de Ejemplo - solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Programas WHERE nombre_programa = 'Noticiero Prime Time') THEN
        INSERT INTO Programas (id_soporte, nombre_programa, cod_prog_megatime, descripcion, duracion, costo, estado, c_orden) VALUES
        (1, 'Noticiero Prime Time', 'NP001', 'Segmento publicitario en noticiero principal', 30, 100000.00, true, false);
    END IF;
END $$;

-- Relación Programa-Medios - solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM programa_medios WHERE id_programa = 1 AND id_medio = 1) THEN
        INSERT INTO programa_medios (id_programa, id_medio) VALUES (1, 1);
    END IF;
END $$;

-- Clasificación de Ejemplo - solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Clasificacion WHERE nombre_clasificacion = 'Prime Time') THEN
        INSERT INTO Clasificacion (id_medio, id_contrato, nombre_clasificacion, descripcion) VALUES
        (1, 1, 'Prime Time', 'Horario de máxima audiencia en televisión');
    END IF;
END $$;

-- Tema de Ejemplo - solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Temas WHERE nombre_tema = 'Lanzamiento Producto') THEN
        INSERT INTO Temas (nombre_tema, id_medio, id_calidad, descripcion, estado, c_orden) VALUES
        ('Lanzamiento Producto', 1, 1, 'Campaña de lanzamiento de nuevo producto', true, false);
    END IF;
END $$;

-- Campaña de Ejemplo - solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Campania WHERE NombreCampania = 'Campaña Navidad 2024') THEN
        INSERT INTO Campania (NombreCampania, id_Cliente, id_Agencia, id_producto, id_anio, Presupuesto, descripcion, estado, c_orden) VALUES
        ('Campaña Navidad 2024', 1, 1, NULL, 5, 10000000.00, 'Campaña publicitaria de temporada navideña', true, false);
    END IF;
END $$;

-- Relación Campaña-Temas - solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM campania_temas WHERE id_campania = 1 AND id_temas = 1) THEN
        INSERT INTO campania_temas (id_campania, id_temas) VALUES (1, 1);
    END IF;
END $$;

-- Plan de Ejemplo - solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM plan WHERE nombre_plan = 'Plan Diciembre 2024') THEN
        INSERT INTO plan (id_cliente, id_campania, anio, mes, nombre_plan, descripcion, presupuesto, estado, estado2) VALUES
        (1, 1, 2024, 12, 'Plan Diciembre 2024', 'Plan de medios para diciembre', 10000000.00, true, 'activo');
    END IF;
END $$;

-- Relación Campaña-Planes - solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM campana_planes WHERE id_campania = 1 AND id_plan = 1) THEN
        INSERT INTO campana_planes (id_campania, id_plan) VALUES (1, 1);
    END IF;
END $$;

-- Alternativa de Ejemplo - solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM alternativa WHERE descripcion = 'Spot publicitario 30 segundos prime time') THEN
        INSERT INTO alternativa (id_soporte, id_programa, id_contrato, id_tema, id_clasificacion, numerorden, descripcion, costo, duracion, estado) VALUES
        (1, 1, 1, 1, 1, 1, 'Spot publicitario 30 segundos prime time', 100000.00, 30, true);
    END IF;
END $$;

-- Relación Plan-Alternativas - solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM plan_alternativas WHERE id_plan = 1 AND id_alternativa = 1) THEN
        INSERT INTO plan_alternativas (id_plan, id_alternativa) VALUES (1, 1);
    END IF;
END $$;

-- Mensaje/Aviso de Bienvenida - solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM aviso WHERE titulo = '¡Bienvenido al Sistema de Órdenes!') THEN
        INSERT INTO aviso (titulo, mensaje, tipo, fecha_inicio, estado) VALUES
        ('¡Bienvenido al Sistema de Órdenes!',
         'Sistema de gestión de órdenes de publicidad completamente operativo. Para cualquier consulta contacte al administrador.',
         'informativo',
         CURRENT_DATE,
         true);
    END IF;
END $$;

-- ========================================
-- Finalización
-- ========================================

DO $$
BEGIN
    RAISE NOTICE 'Base de datos inicializada exitosamente';
    RAISE NOTICE 'Se han insertado datos iniciales sin duplicados';
    RAISE NOTICE 'Usuario administrador: admin@sistema.cl';
    RAISE NOTICE 'Este script es idempotente y se puede ejecutar múltiples veces';
END $$;