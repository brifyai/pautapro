# 🔧 INSTRUCCIONES DE CONFIGURACIÓN - API EMPRESARIAL PAUTAPRO

## 🚀 EJECUTAR BASE DE DATOS EN SUPABASE

### MÉTODO 1: Ejecutar SQL Directamente en Supabase Dashboard

1. **Abre el Dashboard de Supabase:**
   - Ve a [supabase.com](https://supabase.com)
   - Accede a tu proyecto de PautaPro

2. **Ejecuta el Script SQL:**
   - Ve a "SQL Editor" en el sidebar
   - Copia el contenido completo del archivo: `src/api/database/create-api-tokens-table.sql`
   - Pégalo en el editor
   - Ejecuta el script

3. **Verificar Creación de Tablas:**
   - Ve a "Table Editor"
   - Deberías ver las nuevas tablas:
     - `api_tokens`
     - `api_logs`
     - `api_metrics`
     - `api_oauth_clients`
     - `api_oauth_tokens`
     - `api_webhooks`
     - `api_webhook_logs`

### MÉTODO 2: Usar el Script de Setup Automático

```bash
# Instalar dependencias necesarias
npm install @supabase/supabase-js

# Configurar variables de entorno
export SUPABASE_URL="tu-url-supabase"
export SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"

# Ejecutar script de setup
node src/api/scripts/setup-api-database.js
```

## 📋 QUÉ SE CREARÁ AUTOMÁTICAMENTE

### 🔐 Tablas de Base de Datos (7 tablas):

1. **`api_tokens`** - Gestión principal de tokens de API
2. **`api_logs`** - Registro de todas las requests a la API
3. **`api_metrics`** - Métricas agregadas por hora
4. **`api_oauth_clients`** - Clientes OAuth 2.0
5. **`api_oauth_tokens`** - Tokens de acceso OAuth
6. **`api_webhooks`** - Configuración de webhooks
7. **`api_webhook_logs`** - Logs de entrega de webhooks

### 🛠️ Funciones PostgreSQL (3 funciones):

1. **`validate_api_token()`** - Valida tokens y retorna información
2. **`record_token_usage()`** - Registra uso de tokens para métricas
3. **`cleanup_expired_tokens()`** - Limpia tokens expirados

### 📊 Índices de Optimización (15 índices):

- Índices para búsqueda rápida de tokens
- Índices para logs de auditoría
- Índices para métricas y webhooks

### 🎁 Datos de Ejemplo:

- Token de desarrollo para pruebas
- Cliente OAuth de ejemplo

## ⚠️ REQUISITOS IMPORTANTES

### Permisos Necesarios:

1. **Service Role Key:** Necesitas el `service_role` key, no el `anon` key
2. **Acceso SQL:** Permisos para ejecutar DDL y DML
3. **Base de datos:** Acceso completo a la base de datos

### Configuración de Variables de Entorno:

```env
# Estas variables son necesarias:
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-muy-secreto
```

## 🔍 VERIFICACIÓN POST-SETUP

### 1. Verificar Tablas:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'api_%';
```

### 2. Verificar Funciones:
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name LIKE '%api%';
```

### 3. Probar Token de Ejemplo:
```sql
SELECT * FROM api_tokens WHERE nombre LIKE '%Desarrollo%';
```

## 🚨 SOLUCIÓN DE PROBLEMAS

### Error: "relation does not exist"
- **Causa:** Las tablas no se crearon
- **Solución:** Verificar que el script SQL se ejecutó completamente

### Error: "permission denied"
- **Causa:** Service role key incorrecto o sin permisos
- **Solución:** Verificar credenciales en Supabase Dashboard

### Error: "function does not exist"
- **Causa:** Funciones no se crearon
- **Solución:** Re-ejecutar la parte de funciones del script SQL

## 🎯 PRÓXIMOS PASOS DESPUÉS DEL SETUP

1. **Acceder al Panel de Administración:**
   - Ve a `/admin/api` (requiere rol de administrador)
   - Deberías ver el dashboard de API

2. **Generar Primer Token:**
   - Haz clic en "Nuevo Token"
   - Configura permisos según tu caso de uso
   - Copia el token generado

3. **Probar API:**
   - Usa el token con el SDK de JavaScript
   - Prueba endpoints básicos
   - Verifica métricas en tiempo real

4. **Configurar Webhooks (Opcional):**
   - Configura URLs de webhooks
   - Prueba notificaciones en tiempo real

## 📞 SOPORTE

Si tienes problemas con el setup:

1. **Verifica permisos** en Supabase
2. **Revisa los logs** en Supabase Dashboard
3. **Confirma variables** de entorno
4. **Ejecuta verificación SQL** manual

¡El sistema estará completamente funcional una vez ejecutadas estas instrucciones!