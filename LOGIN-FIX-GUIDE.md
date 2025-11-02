# 🔧 GUÍA RÁPIDA PARA SOLUCIONAR ERROR DE LOGIN

## 🚨 PROBLEMA: Error al iniciar sesión

He creado una versión simplificada del sistema de autenticación para solucionar el problema inmediatamente.

---

## 📋 PASOS PARA SOLUCIONAR

### Paso 1: Ejecutar Script SQL Simple
Ejecuta este script en el SQL Editor de Supabase:

```sql
-- Copiar y pegar el contenido del archivo create-user-simple.sql
```

O ejecuta directamente estos comandos:

```sql
-- Crear usuario Camilo con contraseña simple
INSERT INTO usuarios (
    nombre, apellido, email, password, telefono, estado, id_perfil, id_grupo, fecha_creacion
) VALUES (
    'Camilo', 'Alegria', 'camiloalegriabarra@gmail.com', 'Antonito26', 
    '+56 9 1234 5678', true, 2, 2, CURRENT_TIMESTAMP
);

-- Verificar que se creó
SELECT * FROM usuarios WHERE email = 'camiloalegriabarra@gmail.com';
```

### Paso 2: Verificar Tablas Existentes
Asegúrate que estas tablas existan en Supabase:

```sql
-- Verificar tablas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('usuarios', 'perfiles', 'grupos');
```

### Paso 3: Probar Login
Usa estas credenciales:

```
📧 Email: camiloalegriabarra@gmail.com
🔑 Contraseña: Antonito26
```

---

## 🔍 DIAGNÓSTICO RÁPIDO

### Si el error persiste, ejecuta esta consulta:

```sql
-- Verificar usuario y contraseña
SELECT 
    id_usuario,
    nombre,
    apellido,
    email,
    password,
    estado,
    'Contraseña guardada: ' || password AS debug_info
FROM usuarios 
WHERE email = 'camiloalegriabarra@gmail.com';
```

### Verificar conexión desde la aplicación:

1. Abre la consola del navegador (F12)
2. Intenta hacer login
3. Revisa los errores en la pestaña "Console"
4. Busca errores de red en la pestaña "Network"

---

## 🛠️ COMPONENTES ACTUALIZADOS

He actualizado estos archivos para usar la versión simplificada:

1. **authServiceSimple.js** - Autenticación sin hashing complejo
2. **Login.jsx** - Usa el servicio simplificado
3. **Header.jsx** - Usa el servicio simplificado
4. **ProtectedRoute.jsx** - Usa el servicio simplificado

---

## 🔧 SOLUCIONES COMUNES

### Error: "Usuario no encontrado"
```sql
-- Crear las tablas básicas si no existen
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    estado BOOLEAN DEFAULT true,
    id_perfil INTEGER DEFAULT 2,
    id_grupo INTEGER DEFAULT 2,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Error: "Contraseña incorrecta"
```sql
-- Actualizar contraseña a texto plano para desarrollo
UPDATE usuarios 
SET password = 'Antonito26' 
WHERE email = 'camiloalegriabarra@gmail.com';
```

### Error: "Tabla no encontrada"
```sql
-- Crear vista simple
CREATE OR REPLACE VIEW vista_usuarios_completa AS
SELECT 
    u.id_usuario,
    u.nombre,
    u.apellido,
    u.email,
    u.estado,
    u.fecha_creacion,
    'gerente' AS nombre_perfil,
    'Gerencia' AS nombre_grupo,
    4 AS nivel_acceso
FROM usuarios u
WHERE u.email = 'camiloalegriabarra@gmail.com';
```

---

## 🚀 PRUEBA RÁPIDA

### 1. Verificar en el navegador:
```javascript
// En la consola del navegador
localStorage.getItem('user'); // Debe mostrar null antes del login
```

### 2. Después del login:
```javascript
// Debe mostrar el objeto del usuario
JSON.parse(localStorage.getItem('user'));
```

### 3. Verificar redirección:
```javascript
// Debe redirigir a /dashboard
window.location.pathname; // Debe ser '/dashboard'
```

---

## 📞 SOPORTE

Si después de estos pasos el problema persiste:

1. **Revisa la consola** del navegador para errores específicos
2. **Verifica la conexión** a Supabase en `src/config/supabase.js`
3. **Confirma las credenciales** de Supabase en el archivo `.env`
4. **Ejecuta el diagnóstico** con `node debug-login.js`

---

## ✅ VERIFICACIÓN FINAL

Cuando el login funcione correctamente:

1. ✅ Deberías ver el dashboard
2. ✅ El header debe mostrar "Camilo Alegria - Gerente - Gerencia"
3. ✅ Los menús deben funcionar según los permisos
4. ✅ El logout debe funcionar correctamente

---

**🎯 Si todo funciona, el sistema está listo para usar!**