# Configuración de Base de Datos - Sistema de Órdenes

## 📋 Resumen

Este documento describe cómo configurar la base de datos de Supabase para el Sistema de Órdenes de Publicidad.

## 🔗 Información de Conexión

- **URL de Supabase**: https://rfjbsoxkgmuehrgteljq.supabase.co
- **Clave Anónima**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmamJzb3hrZ211ZWhyZ3RlbGpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzUyNDYsImV4cCI6MjA3NjkxMTI0Nn0.fOnd4nQJhBI2rQkiqqeF08t5mpO1vIbN5YBsCOo-Hbo
- **Clave de Servicio**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmamJzb3hrZ211ZWhyZ3RlbGpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTMzNTI0NiwiZXhwIjoyMDc2OTExMjQ2fQ.lhVey2WRoh49ZKRFxK_F6O0QCE2Afvzon5v9Y25KeHM

## 📁 Archivos Creados

1. **database-schema.sql** - Estructura completa de tablas
2. **initial-data.sql** - Datos iniciales básicos
3. **initial-data.sql** - Datos iniciales básicos
4. **initial-data-fixed.sql** - Datos iniciales corregidos (recomendado)
5. **setup-database.js** - Script de configuración (opcional)
3. **setup-database.js** - Script de configuración (opcional)

## 🚀 Pasos para Configuración Manual

### Paso 1: Acceder a la Consola de Supabase

1. Abre tu navegador web
2. Ve a: https://supabase.com/dashboard/project/rfjbsoxkgmuehrgteljq/sql
3. Inicia sesión con tu cuenta de Supabase

### Paso 2: Crear la Estructura de Tablas

1. En la consola SQL de Supabase, copia todo el contenido del archivo `database-schema.sql`
2. Pega el contenido en el editor SQL
3. Haz clic en el botón "Run" o "Ejecutar"
4. Espera a que todas las tablas se creen correctamente
5. Verifica que no haya errores en la ejecución

### Paso 3: Insertar Datos Iniciales

1. Una vez que las tablas estén creadas, copia todo el contenido del archivo `initial-data.sql`
2. Pega el contenido en el editor SQL
### Paso 3: Insertar Datos Iniciales

**Opción A: Usar el script corregido (Recomendado)**
1. Una vez que las tablas estén creadas, copia todo el contenido del archivo `initial-data-fixed.sql`
2. Pega el contenido en el editor SQL
3. Haz clic en el botón "Run" o "Ejecutar"
4. Este script evita problemas con las relaciones foráneas

**Opción B: Usar el script original**
1. Copia todo el contenido del archivo `initial-data.sql`
2. Pega el contenido en el editor SQL
3. Ejecuta primero las regiones y luego las comunas manualmente

**Para insertar comunas manualmente (si usas Opción B):**
```sql
-- Insertar comunas (ejecutar después de conocer los IDs reales)
INSERT INTO Comunas (nombreComuna, id_region) VALUES 
('Santiago', 7),      -- 7 = Región Metropolitana
('Providencia', 7),   -- 7 = Región Metropolitana
('Las Condes', 7),    -- 7 = Región Metropolitana
('Valparaíso', 6),    -- 6 = Región de Valparaíso
('Viña del Mar', 6),   -- 6 = Región de Valparaíso
('Concepción', 11),   -- 11 = Región del Biobío
('Talcahuano', 11);   -- 11 = Región del Biobío
```

3. Haz clic en el botón "Run" o "Ejecutar"
4. Espera a que todos los datos se inserten correctamente
5. Verifica que no haya errores en la ejecución

### Paso 4: Verificar la Configuración
⚠️ **Nota Importante**: Si encuentras errores de "ON CONFLICT" al ejecutar el script de datos iniciales, es normal. El script ha sido corregido para eliminar estas cláusulas. Si aparecen errores de duplicados, puedes ignorarlos ya que los datos iniciales solo necesitan insertarse una vez.


1. En la sección "Table Editor" del dashboard de Supabase, verifica que las tablas estén creadas
2. Revisa que las tablas principales contengan los datos iniciales:
   - `Usuarios` - Debería tener el usuario administrador
   - `Clientes` - Debería tener un cliente de ejemplo
   - `Proveedores` - Debería tener un proveedor de ejemplo
   - `Medios` - Debería tener los tipos de medios
   - `Region` - Debería tener las regiones de Chile

## 📊 Estructura de Base de Datos

### Tablas Principales

- **Usuarios** - Usuarios del sistema
- **Clientes** - Clientes de la agencia
- **Proveedores** - Proveedores de medios
- **Agencias** - Agencias de publicidad
- **Campañas** - Campañas publicitarias
- **OrdenesDePublicidad** - Órdenes de publicidad
- **Planes** - Planes de medios
- **Alternativas** - Alternativas de medios

### Tablas de Catálogo

- **Region** - Regiones geográficas
- **Comunas** - Comunas por región
- **Medios** - Tipos de medios publicitarios
- **Calidad** - Niveles de calidad
- **FormaDePago** - Formas de pago
- **TipoCliente** - Tipos de cliente
- **Grupos** - Grupos de usuarios
- **Perfiles** - Perfiles de usuario

### Tablas de Relación

- **proveedor_soporte** - Relación proveedores-soportes
- **soporte_medios** - Relación soportes-medios
- **campania_temas** - Relación campañas-temas
- **plan_alternativas** - Relación planes-alternativas

## 🔑 Usuario Administrador

**Email**: admin@sistema.cl  
**Contraseña**: Debe ser configurada manualmente

Para configurar la contraseña:
1. Accede a la tabla `Usuarios` en el Table Editor
2. Busca el usuario con email `admin@sistema.cl`
3. Actualiza el campo `password` con un hash BCrypt de la contraseña deseada
4. O usa la función de autenticación de Supabase para restablecer la contraseña

## 🛠️ Configuración Adicional

### Políticas de Seguridad (RLS)

Una vez que los datos estén cargados, deberás configurar las políticas de seguridad (Row Level Security):

```sql
-- Habilitar RLS en tablas principales
ALTER TABLE Usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE Clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE Proveedores ENABLE ROW LEVEL SECURITY;
-- ... y así sucesivamente para cada tabla
```

### Políticas de Acceso

```sql
-- Ejemplo: Política para que usuarios solo vean sus propios datos
CREATE POLICY "Users can view own data" ON Usuarios
    FOR SELECT USING (auth.uid()::text = email::text);
```

## ✅ Verificación Final

Para verificar que todo está funcionando correctamente:

1. Inicia la aplicación React: `npm run dev`
2. Intenta acceder a la aplicación en: http://localhost:5174
3. Prueba iniciar sesión con el usuario administrador
4. Verifica que puedas ver los datos iniciales en las diferentes secciones

## 🆘 Solución de Problemas

### Problemas Comunes

1. **Error de conexión**: Verifica que las URLs y claves en `src/config/supabase.js` sean correctas
2. **Tablas no encontradas**: Asegúrate de haber ejecutado el script `database-schema.sql` completamente
3. **Datos no cargados**: Verifica que el script `initial-data.sql` se haya ejecutado sin errores
4. **Permisos denegados**: Configura adecuadamente las políticas RLS en Supabase

### Comandos Útiles

```bash
# Verificar archivos creados
ls -la *.sql *.js

# Ejecutar script de configuración (opcional)
node setup-database.js --manual

# Iniciar aplicación
npm run dev
```

## 📞 Soporte

Si encuentras algún problema durante la configuración:

1. Revisa los logs de la consola de Supabase
2. Verifica que todos los scripts SQL se ejecutaron sin errores
3. Confirma que las credenciales en el archivo de configuración sean correctas
4. Asegúrate de tener los permisos necesarios en el proyecto de Supabase

---

## 🎉 ¡Listo!

Una vez completados estos pasos, tu Sistema de Órdenes estará completamente funcional con la base de datos configurada y los datos iniciales cargados.