-- ========================================
-- Insertar Datos Faltantes - Manejo de Duplicados
-- ========================================
-- Este script solo inserta datos que no existen

-- Insertar Regiones que no existan
INSERT INTO Region (nombreRegion) 
SELECT 'Región de Arica y Parinacota' WHERE NOT EXISTS (SELECT 1 FROM Region WHERE nombreRegion = 'Región de Arica y Parinacota');
INSERT INTO Region (nombreRegion) 
SELECT 'Región de Tarapacá' WHERE NOT EXISTS (SELECT 1 FROM Region WHERE nombreRegion = 'Región de Tarapacá');
INSERT INTO Region (nombreRegion) 
SELECT 'Región de Antofagasta' WHERE NOT EXISTS (SELECT 1 FROM Region WHERE nombreRegion = 'Región de Antofagasta');
INSERT INTO Region (nombreRegion) 
SELECT 'Región de Atacama' WHERE NOT EXISTS (SELECT 1 FROM Region WHERE nombreRegion = 'Región de Atacama');
INSERT INTO Region (nombreRegion) 
SELECT 'Región de Coquimbo' WHERE NOT EXISTS (SELECT 1 FROM Region WHERE nombreRegion = 'Región de Coquimbo');
INSERT INTO Region (nombreRegion) 
SELECT 'Región de Valparaíso' WHERE NOT EXISTS (SELECT 1 FROM Region WHERE nombreRegion = 'Región de Valparaíso');
INSERT INTO Region (nombreRegion) 
SELECT 'Región Metropolitana de Santiago' WHERE NOT EXISTS (SELECT 1 FROM Region WHERE nombreRegion = 'Región Metropolitana de Santiago');
INSERT INTO Region (nombreRegion) 
SELECT 'Región del Libertador General Bernardo O''Higgins' WHERE NOT EXISTS (SELECT 1 FROM Region WHERE nombreRegion = 'Región del Libertador General Bernardo O''Higgins');
INSERT INTO Region (nombreRegion) 
SELECT 'Región del Maule' WHERE NOT EXISTS (SELECT 1 FROM Region WHERE nombreRegion = 'Región del Maule');
INSERT INTO Region (nombreRegion) 
SELECT 'Región de Ñuble' WHERE NOT EXISTS (SELECT 1 FROM Region WHERE nombreRegion = 'Región de Ñuble');
INSERT INTO Region (nombreRegion) 
SELECT 'Región del Biobío' WHERE NOT EXISTS (SELECT 1 FROM Region WHERE nombreRegion = 'Región del Biobío');
INSERT INTO Region (nombreRegion) 
SELECT 'Región de La Araucanía' WHERE NOT EXISTS (SELECT 1 FROM Region WHERE nombreRegion = 'Región de La Araucanía');
INSERT INTO Region (nombreRegion) 
SELECT 'Región de Los Ríos' WHERE NOT EXISTS (SELECT 1 FROM Region WHERE nombreRegion = 'Región de Los Ríos');
INSERT INTO Region (nombreRegion) 
SELECT 'Región de Los Lagos' WHERE NOT EXISTS (SELECT 1 FROM Region WHERE nombreRegion = 'Región de Los Lagos');
INSERT INTO Region (nombreRegion) 
SELECT 'Región de Aysén del General Carlos Ibáñez del Campo' WHERE NOT EXISTS (SELECT 1 FROM Region WHERE nombreRegion = 'Región de Aysén del General Carlos Ibáñez del Campo');
INSERT INTO Region (nombreRegion) 
SELECT 'Región de Magallanes y de la Antártica Chilena' WHERE NOT EXISTS (SELECT 1 FROM Region WHERE nombreRegion = 'Región de Magallanes y de la Antártica Chilena');

-- Insertar Tipos de Cliente que no existan
INSERT INTO TipoCliente (nombreTipoCliente) 
SELECT 'Corporativo' WHERE NOT EXISTS (SELECT 1 FROM TipoCliente WHERE nombreTipoCliente = 'Corporativo');
INSERT INTO TipoCliente (nombreTipoCliente) 
SELECT 'PyME' WHERE NOT EXISTS (SELECT 1 FROM TipoCliente WHERE nombreTipoCliente = 'PyME');
INSERT INTO TipoCliente (nombreTipoCliente) 
SELECT 'Persona Natural' WHERE NOT EXISTS (SELECT 1 FROM TipoCliente WHERE nombreTipoCliente = 'Persona Natural');
INSERT INTO TipoCliente (nombreTipoCliente) 
SELECT 'Institución Gubernamental' WHERE NOT EXISTS (SELECT 1 FROM TipoCliente WHERE nombreTipoCliente = 'Institución Gubernamental');
INSERT INTO TipoCliente (nombreTipoCliente) 
SELECT 'ONG' WHERE NOT EXISTS (SELECT 1 FROM TipoCliente WHERE nombreTipoCliente = 'ONG');
INSERT INTO TipoCliente (nombreTipoCliente) 
SELECT 'Educacional' WHERE NOT EXISTS (SELECT 1 FROM TipoCliente WHERE nombreTipoCliente = 'Educacional');

-- Insertar Grupos que no existan
INSERT INTO Grupos (nombre_grupo) 
SELECT 'Administradores' WHERE NOT EXISTS (SELECT 1 FROM Grupos WHERE nombre_grupo = 'Administradores');
INSERT INTO Grupos (nombre_grupo) 
SELECT 'Gerencia' WHERE NOT EXISTS (SELECT 1 FROM Grupos WHERE nombre_grupo = 'Gerencia');
INSERT INTO Grupos (nombre_grupo) 
SELECT 'Planificación' WHERE NOT EXISTS (SELECT 1 FROM Grupos WHERE nombre_grupo = 'Planificación');
INSERT INTO Grupos (nombre_grupo) 
SELECT 'Ejecución de Campañas' WHERE NOT EXISTS (SELECT 1 FROM Grupos WHERE nombre_grupo = 'Ejecución de Campañas');
INSERT INTO Grupos (nombre_grupo) 
SELECT 'Facturación' WHERE NOT EXISTS (SELECT 1 FROM Grupos WHERE nombre_grupo = 'Facturación');
INSERT INTO Grupos (nombre_grupo) 
SELECT 'Reportes' WHERE NOT EXISTS (SELECT 1 FROM Grupos WHERE nombre_grupo = 'Reportes');
INSERT INTO Grupos (nombre_grupo) 
SELECT 'Clientes' WHERE NOT EXISTS (SELECT 1 FROM Grupos WHERE nombre_grupo = 'Clientes');

-- Insertar Perfiles que no existan
INSERT INTO Perfiles (NombrePerfil, descripcion) 
SELECT 'Super Administrador', 'Acceso completo a todo el sistema' 
WHERE NOT EXISTS (SELECT 1 FROM Perfiles WHERE NombrePerfil = 'Super Administrador');
INSERT INTO Perfiles (NombrePerfil, descripcion) 
SELECT 'Administrador', 'Acceso completo a configuración y usuarios' 
WHERE NOT EXISTS (SELECT 1 FROM Perfiles WHERE NombrePerfil = 'Administrador');
INSERT INTO Perfiles (NombrePerfil, descripcion) 
SELECT 'Gerente', 'Acceso a reportes y aprobaciones' 
WHERE NOT EXISTS (SELECT 1 FROM Perfiles WHERE NombrePerfil = 'Gerente');
INSERT INTO Perfiles (NombrePerfil, descripcion) 
SELECT 'Planificador', 'Gestión de planes y campañas' 
WHERE NOT EXISTS (SELECT 1 FROM Perfiles WHERE NombrePerfil = 'Planificador');
INSERT INTO Perfiles (NombrePerfil, descripcion) 
SELECT 'Ejecutivo', 'Gestión de órdenes y ejecución' 
WHERE NOT EXISTS (SELECT 1 FROM Perfiles WHERE NombrePerfil = 'Ejecutivo');
INSERT INTO Perfiles (NombrePerfil, descripcion) 
SELECT 'Analista', 'Acceso a reportes y análisis' 
WHERE NOT EXISTS (SELECT 1 FROM Perfiles WHERE NombrePerfil = 'Analista');
INSERT INTO Perfiles (NombrePerfil, descripcion) 
SELECT 'Cliente', 'Acceso limitado a sus propios datos' 
WHERE NOT EXISTS (SELECT 1 FROM Perfiles WHERE NombrePerfil = 'Cliente');

-- Insertar Medios que no existan
INSERT INTO Medios (NombredelMedio, Estado) 
SELECT 'Televisión', true WHERE NOT EXISTS (SELECT 1 FROM Medios WHERE NombredelMedio = 'Televisión');
INSERT INTO Medios (NombredelMedio, Estado) 
SELECT 'Radio', true WHERE NOT EXISTS (SELECT 1 FROM Medios WHERE NombredelMedio = 'Radio');
INSERT INTO Medios (NombredelMedio, Estado) 
SELECT 'Prensa Escrita', true WHERE NOT EXISTS (SELECT 1 FROM Medios WHERE NombredelMedio = 'Prensa Escrita');
INSERT INTO Medios (NombredelMedio, Estado) 
SELECT 'Revistas', true WHERE NOT EXISTS (SELECT 1 FROM Medios WHERE NombredelMedio = 'Revistas');
INSERT INTO Medios (NombredelMedio, Estado) 
SELECT 'Digital', true WHERE NOT EXISTS (SELECT 1 FROM Medios WHERE NombredelMedio = 'Digital');
INSERT INTO Medios (NombredelMedio, Estado) 
SELECT 'Redes Sociales', true WHERE NOT EXISTS (SELECT 1 FROM Medios WHERE NombredelMedio = 'Redes Sociales');
INSERT INTO Medios (NombredelMedio, Estado) 
SELECT 'Cine', true WHERE NOT EXISTS (SELECT 1 FROM Medios WHERE NombredelMedio = 'Cine');
INSERT INTO Medios (NombredelMedio, Estado) 
SELECT 'Publicidad Exterior', true WHERE NOT EXISTS (SELECT 1 FROM Medios WHERE NombredelMedio = 'Publicidad Exterior');
INSERT INTO Medios (NombredelMedio, Estado) 
SELECT 'Transporte', true WHERE NOT EXISTS (SELECT 1 FROM Medios WHERE NombredelMedio = 'Transporte');
INSERT INTO Medios (NombredelMedio, Estado) 
SELECT 'Marketing Directo', true WHERE NOT EXISTS (SELECT 1 FROM Medios WHERE NombredelMedio = 'Marketing Directo');

-- Insertar Calidad que no exista
INSERT INTO Calidad (NombreCalidad) 
SELECT 'Premium' WHERE NOT EXISTS (SELECT 1 FROM Calidad WHERE NombreCalidad = 'Premium');
INSERT INTO Calidad (NombreCalidad) 
SELECT 'Estándar' WHERE NOT EXISTS (SELECT 1 FROM Calidad WHERE NombreCalidad = 'Estándar');
INSERT INTO Calidad (NombreCalidad) 
SELECT 'Básico' WHERE NOT EXISTS (SELECT 1 FROM Calidad WHERE NombreCalidad = 'Básico');
INSERT INTO Calidad (NombreCalidad) 
SELECT 'Económico' WHERE NOT EXISTS (SELECT 1 FROM Calidad WHERE NombreCalidad = 'Económico');

-- Insertar Forma de Pago que no exista
INSERT INTO FormaDePago (NombreFormadePago) 
SELECT 'Transferencia Bancaria' WHERE NOT EXISTS (SELECT 1 FROM FormaDePago WHERE NombreFormadePago = 'Transferencia Bancaria');
INSERT INTO FormaDePago (NombreFormadePago) 
SELECT 'Cheque' WHERE NOT EXISTS (SELECT 1 FROM FormaDePago WHERE NombreFormadePago = 'Cheque');
INSERT INTO FormaDePago (NombreFormadePago) 
SELECT 'Tarjeta de Crédito' WHERE NOT EXISTS (SELECT 1 FROM FormaDePago WHERE NombreFormadePago = 'Tarjeta de Crédito');
INSERT INTO FormaDePago (NombreFormadePago) 
SELECT 'Tarjeta de Débito' WHERE NOT EXISTS (SELECT 1 FROM FormaDePago WHERE NombreFormadePago = 'Tarjeta de Débito');
INSERT INTO FormaDePago (NombreFormadePago) 
SELECT 'Efectivo' WHERE NOT EXISTS (SELECT 1 FROM FormaDePago WHERE NombreFormadePago = 'Efectivo');
INSERT INTO FormaDePago (NombreFormadePago) 
SELECT 'Crédito 30 días' WHERE NOT EXISTS (SELECT 1 FROM FormaDePago WHERE NombreFormadePago = 'Crédito 30 días');
INSERT INTO FormaDePago (NombreFormadePago) 
SELECT 'Crédito 60 días' WHERE NOT EXISTS (SELECT 1 FROM FormaDePago WHERE NombreFormadePago = 'Crédito 60 días');
INSERT INTO FormaDePago (NombreFormadePago) 
SELECT 'Crédito 90 días' WHERE NOT EXISTS (SELECT 1 FROM FormaDePago WHERE NombreFormadePago = 'Crédito 90 días');

-- Insertar Tipo Generación de Orden que no exista
INSERT INTO TipoGeneracionDeOrden (NombreTipoOrden) 
SELECT 'Manual' WHERE NOT EXISTS (SELECT 1 FROM TipoGeneracionDeOrden WHERE NombreTipoOrden = 'Manual');
INSERT INTO TipoGeneracionDeOrden (NombreTipoOrden) 
SELECT 'Automática' WHERE NOT EXISTS (SELECT 1 FROM TipoGeneracionDeOrden WHERE NombreTipoOrden = 'Automática');
INSERT INTO TipoGeneracionDeOrden (NombreTipoOrden) 
SELECT 'Por Campaña' WHERE NOT EXISTS (SELECT 1 FROM TipoGeneracionDeOrden WHERE NombreTipoOrden = 'Por Campaña');
INSERT INTO TipoGeneracionDeOrden (NombreTipoOrden) 
SELECT 'Por Plan' WHERE NOT EXISTS (SELECT 1 FROM TipoGeneracionDeOrden WHERE NombreTipoOrden = 'Por Plan');
INSERT INTO TipoGeneracionDeOrden (NombreTipoOrden) 
SELECT 'Urgente' WHERE NOT EXISTS (SELECT 1 FROM TipoGeneracionDeOrden WHERE NombreTipoOrden = 'Urgente');
INSERT INTO TipoGeneracionDeOrden (NombreTipoOrden) 
SELECT 'Programada' WHERE NOT EXISTS (SELECT 1 FROM TipoGeneracionDeOrden WHERE NombreTipoOrden = 'Programada');

-- Insertar Años que no existan
INSERT INTO Anios (years) 
SELECT 2020 WHERE NOT EXISTS (SELECT 1 FROM Anios WHERE years = 2020);
INSERT INTO Anios (years) 
SELECT 2021 WHERE NOT EXISTS (SELECT 1 FROM Anios WHERE years = 2021);
INSERT INTO Anios (years) 
SELECT 2022 WHERE NOT EXISTS (SELECT 1 FROM Anios WHERE years = 2022);
INSERT INTO Anios (years) 
SELECT 2023 WHERE NOT EXISTS (SELECT 1 FROM Anios WHERE years = 2023);
INSERT INTO Anios (years) 
SELECT 2024 WHERE NOT EXISTS (SELECT 1 FROM Anios WHERE years = 2024);
INSERT INTO Anios (years) 
SELECT 2025 WHERE NOT EXISTS (SELECT 1 FROM Anios WHERE years = 2025);
INSERT INTO Anios (years) 
SELECT 2026 WHERE NOT EXISTS (SELECT 1 FROM Anios WHERE years = 2026);
INSERT INTO Anios (years) 
SELECT 2027 WHERE NOT EXISTS (SELECT 1 FROM Anios WHERE years = 2027);
INSERT INTO Anios (years) 
SELECT 2028 WHERE NOT EXISTS (SELECT 1 FROM Anios WHERE years = 2028);
INSERT INTO Anios (years) 
SELECT 2029 WHERE NOT EXISTS (SELECT 1 FROM Anios WHERE years = 2029);
INSERT INTO Anios (years) 
SELECT 2030 WHERE NOT EXISTS (SELECT 1 FROM Anios WHERE years = 2030);

-- Insertar Meses que no existan
INSERT INTO Meses (Id, Nombre) 
SELECT 1, 'Enero' WHERE NOT EXISTS (SELECT 1 FROM Meses WHERE Id = 1);
INSERT INTO Meses (Id, Nombre) 
SELECT 2, 'Febrero' WHERE NOT EXISTS (SELECT 1 FROM Meses WHERE Id = 2);
INSERT INTO Meses (Id, Nombre) 
SELECT 3, 'Marzo' WHERE NOT EXISTS (SELECT 1 FROM Meses WHERE Id = 3);
INSERT INTO Meses (Id, Nombre) 
SELECT 4, 'Abril' WHERE NOT EXISTS (SELECT 1 FROM Meses WHERE Id = 4);
INSERT INTO Meses (Id, Nombre) 
SELECT 5, 'Mayo' WHERE NOT EXISTS (SELECT 1 FROM Meses WHERE Id = 5);
INSERT INTO Meses (Id, Nombre) 
SELECT 6, 'Junio' WHERE NOT EXISTS (SELECT 1 FROM Meses WHERE Id = 6);
INSERT INTO Meses (Id, Nombre) 
SELECT 7, 'Julio' WHERE NOT EXISTS (SELECT 1 FROM Meses WHERE Id = 7);
INSERT INTO Meses (Id, Nombre) 
SELECT 8, 'Agosto' WHERE NOT EXISTS (SELECT 1 FROM Meses WHERE Id = 8);
INSERT INTO Meses (Id, Nombre) 
SELECT 9, 'Septiembre' WHERE NOT EXISTS (SELECT 1 FROM Meses WHERE Id = 9);
INSERT INTO Meses (Id, Nombre) 
SELECT 10, 'Octubre' WHERE NOT EXISTS (SELECT 1 FROM Meses WHERE Id = 10);
INSERT INTO Meses (Id, Nombre) 
SELECT 11, 'Noviembre' WHERE NOT EXISTS (SELECT 1 FROM Meses WHERE Id = 11);
INSERT INTO Meses (Id, Nombre) 
SELECT 12, 'Diciembre' WHERE NOT EXISTS (SELECT 1 FROM Meses WHERE Id = 12);

-- Insertar Tabla Formato que no exista
INSERT INTO TablaFormato (nombreFormato) 
SELECT 'Horizontal' WHERE NOT EXISTS (SELECT 1 FROM TablaFormato WHERE nombreFormato = 'Horizontal');
INSERT INTO TablaFormato (nombreFormato) 
SELECT 'Vertical' WHERE NOT EXISTS (SELECT 1 FROM TablaFormato WHERE nombreFormato = 'Vertical');
INSERT INTO TablaFormato (nombreFormato) 
SELECT 'Cuadrado' WHERE NOT EXISTS (SELECT 1 FROM TablaFormato WHERE nombreFormato = 'Cuadrado');
INSERT INTO TablaFormato (nombreFormato) 
SELECT 'Banner' WHERE NOT EXISTS (SELECT 1 FROM TablaFormato WHERE nombreFormato = 'Banner');
INSERT INTO TablaFormato (nombreFormato) 
SELECT 'Story' WHERE NOT EXISTS (SELECT 1 FROM TablaFormato WHERE nombreFormato = 'Story');
INSERT INTO TablaFormato (nombreFormato) 
SELECT 'Video' WHERE NOT EXISTS (SELECT 1 FROM TablaFormato WHERE nombreFormato = 'Video');
INSERT INTO TablaFormato (nombreFormato) 
SELECT 'Audio' WHERE NOT EXISTS (SELECT 1 FROM TablaFormato WHERE nombreFormato = 'Audio');
INSERT INTO TablaFormato (nombreFormato) 
SELECT 'Texto' WHERE NOT EXISTS (SELECT 1 FROM TablaFormato WHERE nombreFormato = 'Texto');

-- Insertar Usuario Administrador si no existe
INSERT INTO Usuarios (nombre, email, password, id_perfil, id_grupo, estado) 
SELECT 'Administrador del Sistema', 'admin@sistema.cl', '$2b$12$placeholder_hash_real', 1, 1, true 
WHERE NOT EXISTS (SELECT 1 FROM Usuarios WHERE email = 'admin@sistema.cl');

-- Mostrar mensaje de finalización
DO $$
BEGIN
    RAISE NOTICE 'Datos faltantes insertados exitosamente';
    RAISE NOTICE 'Se han agregado solo los datos que no existían previamente';
    RAISE NOTICE 'Usuario administrador: admin@sistema.cl';
END $$;