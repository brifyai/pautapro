# 🚀 SISTEMA DE USUARIOS PAUTAPRO - GUÍA COMPLETA

## 📋 RESUMEN EJECUTIVO

Se ha reconstruido completamente el sistema de login y gestión de usuarios de PautaPro con las siguientes características:

- **Usuario principal**: Camilo Alegria (camiloalegriabarra@gmail.com)
- **Contraseña**: Antonito26
- **Rol**: Gerente
- **Autenticación segura** con hashing SHA-256
- **Sistema de permisos granular** por módulos y acciones
- **6 roles jerárquicos** con diferentes niveles de acceso

---

## 🔐 ACCESO AL SISTEMA

### Credenciales Principales
```
📧 Email: camiloalegriabarra@gmail.com
🔑 Contraseña: Antonito26
👤 Rol: Gerente
🏢 Departamento: Gerencia
```

### URL de Acceso
- **Local**: http://localhost:3002
- **Red**: http://192.168.6.64:3002

---

## 👥 ROLES Y PERMISOS

### Jerarquía de Roles (Nivel de Acceso)

| Rol | Nivel | Descripción | Acceso Principal |
|-----|-------|-------------|------------------|
| **Director** | 5 | Acceso completo a todo el sistema | ✅ Todos los módulos |
| **Gerente** | 4 | Gestión completa y reportes | ✅ Dashboard, Clientes, Campañas, Órdenes, Reportes |
| **Financiero** | 3 | Presupuestos y finanzas | ✅ Reportes financieros, facturación |
| **Supervisor** | 3 | Supervisión de equipos | ✅ Campañas, equipos, reportes básicos |
| **Planificador** | 2 | Creación de campañas | ✅ Planificación, campañas básicas |
| **Asistente** | 1 | Funciones administrativas | ✅ Consultas básicas |

---

## 🔧 ESTRUCTURA DE LA BASE DE DATOS

### Tablas Principales

#### 1. **perfiles** (Roles)
```sql
- id_perfil (PK)
- nombre_perfil (único)
- descripción
- nivel_acceso (1-5)
- created_at
```

#### 2. **grupos** (Departamentos)
```sql
- id_grupo (PK)
- nombre_grupo (único)
- descripción
- created_at
```

#### 3. **usuarios**
```sql
- id_usuario (PK)
- nombre, apellido
- email (único)
- password (hash SHA-256)
- teléfono, avatar
- estado (activo/inactivo)
- id_perfil (FK)
- id_grupo (FK)
- ultimo_acceso
- fecha_creacion, fecha_actualizacion
```

#### 4. **permisos** (Acciones del sistema)
```sql
- id_permiso (PK)
- nombre_permiso
- modulo (dashboard, clientes, campañas, etc.)
- descripción
```

#### 5. **permisos_perfil** (Asignación de permisos a roles)
```sql
- id_perfil (FK)
- id_permiso (FK)
```

---

## 🛡️ SEGURIDAD IMPLEMENTADA

### Hashing de Contraseñas
- **Algoritmo**: SHA-256 con salt personalizado
- **Salt**: "pautapro-salt"
- **Método**: Crypto Web API para frontend, Node.js crypto para backend

### Validaciones de Seguridad
- ✅ Validación de formato de email con regex
- ✅ Contraseña requerida para nuevos usuarios
- ✅ Estados de usuario (activo/inactivo)
- ✅ Auditoría de últimos accesos
- ✅ Manejo seguro de sesiones

---

## 🌐 COMPONENTES DEL SISTEMA

### 1. **authServiceImproved.js**
- Autenticación segura con verificación de contraseña
- Gestión de permisos y roles
- Registro y actualización de usuarios
- Recuperación de información de usuario

### 2. **ProtectedRoute.jsx**
- Protección de rutas basada en permisos
- Validación por módulo y acción específica
- Redirección automática si no hay acceso

### 3. **UserManager.jsx**
- Interfaz completa para gestión de usuarios
- Creación, edición y desactivación
- Asignación de roles y grupos
- Visualización de información completa

### 4. **Header.jsx** (Actualizado)
- Muestra información del usuario actual
- Indicadores visuales de rol y departamento
- Menú contextual con opciones según permisos

---

## 📊 PERMISOS POR MÓDULO

### Dashboard
- `ver_dashboard` - Acceso al dashboard principal
- `ver_kpis` - Ver indicadores clave

### Clientes
- `ver_clientes` - Ver lista de clientes
- `crear_clientes` - Crear nuevos clientes
- `editar_clientes` - Editar clientes existentes
- `eliminar_clientes` - Eliminar clientes

### Campañas
- `ver_campanas` - Ver lista de campañas
- `crear_campanas` - Crear nuevas campañas
- `editar_campanas` - Editar campañas existentes
- `eliminar_campanas` - Eliminar campañas
- `aprobar_campanas` - Aprobar campañas

### Órdenes
- `ver_ordenes` - Ver órdenes de compra
- `crear_ordenes` - Crear nuevas órdenes
- `editar_ordenes` - Editar órdenes existentes
- `eliminar_ordenes` - Eliminar órdenes
- `aprobar_ordenes` - Aprobar órdenes

### Reportes
- `ver_reportes` - Ver reportes generales
- `ver_reportes_financieros` - Ver reportes financieros
- `exportar_reportes` - Exportar reportes
- `programar_reportes` - Programar reportes automáticos

### Usuarios
- `ver_usuarios` - Ver lista de usuarios
- `crear_usuarios` - Crear nuevos usuarios
- `editar_usuarios` - Editar usuarios existentes
- `eliminar_usuarios` - Eliminar usuarios
- `asignar_roles` - Asignar roles a usuarios

---

## 🚀 INSTALACIÓN Y CONFIGURACIÓN

### Paso 1: Ejecutar Script SQL
```sql
-- Ejecutar en Supabase SQL Editor
-- Archivo: create-user-system.sql
```

### Paso 2: Configurar Variables de Entorno
```bash
# .env
SUPABASE_URL=tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu-service-key
```

### Paso 3: Ejecutar Script de Inicialización (Opcional)
```bash
node setup-user-system.js
```

### Paso 4: Iniciar Aplicación
```bash
npm run dev -- --port 3002
```

---

## 🔍 VERIFICACIÓN DEL SISTEMA

### 1. Verificar Usuario Creado
```sql
SELECT * FROM vista_usuarios_completa 
WHERE email = 'camiloalegriabarra@gmail.com';
```

### 2. Verificar Permisos Asignados
```sql
SELECT 
  p.nombre_perfil,
  COUNT(pp.id_permiso) AS cantidad_permisos
FROM perfiles p
LEFT JOIN permisos_perfil pp ON p.id_perfil = pp.id_perfil
GROUP BY p.id_perfil, p.nombre_perfil
ORDER BY p.nivel_acceso DESC;
```

### 3. Verificar Estructura Completa
```sql
-- Ver todas las tablas creadas
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('usuarios', 'perfiles', 'grupos', 'permisos', 'permisos_perfil');
```

---

## 🎯 FLUJO DE USUARIO

### 1. Login
- Usuario ingresa email y contraseña
- Sistema verifica credenciales en base de datos
- Contraseña verificada con hash SHA-256
- Se crea sesión con información completa del usuario

### 2. Navegación
- Cada ruta está protegida por `ProtectedRoute`
- Se verifican permisos específicos por módulo
- Redirección automática si no hay acceso

### 3. Gestión de Usuario
- Solo roles con permiso pueden acceder a `/usuarios`
- Interfaz completa para CRUD de usuarios
- Asignación de roles y grupos

---

## 🔄 MANTENIMIENTO

### Cambiar Contraseña de Usuario
```sql
-- Generar nuevo hash (usando el servicio)
UPDATE usuarios 
SET password = 'nuevo_hash_sha256', 
    fecha_actualizacion = CURRENT_TIMESTAMP
WHERE email = 'camiloalegriabarra@gmail.com';
```

### Desactivar Usuario
```sql
UPDATE usuarios 
SET estado = false, 
    fecha_actualizacion = CURRENT_TIMESTAMP
WHERE id_usuario = ID_USUARIO;
```

### Cambiar Rol de Usuario
```sql
UPDATE usuarios 
SET id_perfil = NUEVO_ID_PERFIL,
    fecha_actualizacion = CURRENT_TIMESTAMP
WHERE id_usuario = ID_USUARIO;
```

---

## 📱 CARACTERÍSTICAS ADICIONALES

### Dashboard Personalizado
- Muestra información según rol del usuario
- KPIs y métricas relevantes por permisos
- Acceso rápido a módulos permitidos

### Notificaciones por Rol
- Sistema de notificaciones contextual
- Alertas según responsabilidades del usuario
- Mensajes automáticos por cambios de estado

### Auditoría Completa
- Registro de últimos accesos
- Historial de cambios en usuarios
- Logs de acciones importantes

---

## 🎉 BENEFICIOS DEL NUEVO SISTEMA

### ✅ Seguridad Mejorada
- Contraseñas hasheadas con SHA-256
- Validación de email y formatos
- Control de acceso granular

### ✅ Gestión Centralizada
- Todos los usuarios en una base de datos
- Roles y permisos estructurados
- Interfaz administrativa completa

### ✅ Escalabilidad
- Sistema modular de permisos
- Fácil adición de nuevos roles
- Estructura flexible para futuros módulos

### ✅ Experiencia de Usuario
- Login intuitivo y seguro
- Información contextual en el header
- Acceso rápido según permisos

---

## 🆘 SOPORTE Y SOLUCIÓN DE PROBLEMAS

### Problemas Comunes

#### 1. "Usuario no encontrado"
- Verificar que el script SQL se ejecutó correctamente
- Revisar que el usuario exista en la tabla `usuarios`
- Verificar que el estado del usuario sea `true`

#### 2. "Contraseña incorrecta"
- Asegurarse de usar la contraseña exacta: `Antonito26`
- Verificar mayúsculas y minúsculas
- Revisar que el hash se generó correctamente

#### 3. "Acceso denegado"
- Verificar que el rol tenga los permisos necesarios
- Revisar configuración de `ProtectedRoute`
- Validar que el usuario esté activo

### Logs y Depuración
```javascript
// En consola del navegador
localStorage.getItem('user'); // Ver usuario actual

// En authServiceImproved
console.log('Usuario:', user);
console.log('Permisos:', user.permisos);
```

---

## 📞 CONTACTO Y SOPORTE

Para cualquier problema o consulta sobre el sistema de usuarios:

1. **Verificar logs** en la consola del navegador
2. **Revisar conexión** con Supabase
3. **Validar estructura** de la base de datos
4. **Consultar documentación** técnica

---

**✨ Sistema listo para producción con usuario Camilo Alegria configurado como Gerente! ✨**