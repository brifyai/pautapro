# 🖥️ Guía Visual de Instalación - Base de Datos Supabase

## 📋 **ESTADO ACTUAL CONFIRMADO**
- ✅ Scripts SQL corregidos y listos
- ✅ Conexión a Supabase funcionando
- ❌ Base de datos vacía (necesita ejecución manual)

---

## 🚀 **PASO 0: EJECUTAR TEST DE CONEXIÓN**

Primero, ejecuta este comando para confirmar la conexión:

```bash
node simple-connection-test.cjs
```

**Resultado esperado:**
```
✅ Conexión exitosa - La base de datos está vacía (esperado)
📝 Mensaje: La tabla _test_connection_ no existe, pero la conexión funciona
```

---

## 🌐 **PASO 1: ACCEDER A CONSOLE SUPABASE**

### 1.1 Abre tu navegador y ve a:
```
https://supabase.com/dashboard/project/rfjbsoxkgmuehrgteljq/sql
```

### 1.2 Verás la interfaz SQL Editor:
```
┌─────────────────────────────────────────┐
│ SQL Editor - rfjbsoxkgmuehrgteljq       │
├─────────────────────────────────────────┤
│ ▶ New query                             │
│ ┌─────────────────────────────────────┐ │
│ │ -- Escribe tu SQL aquí              │ │
│ │                                     │ │
│ │                                     │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                        │
│ [▶ RUN] [💾 SAVE] [📁 LOAD]            │
└─────────────────────────────────────────┘
```

---

## 🧹 **PASO 2: LIMPIAR BASE DE DATOS**

### 2.1 Abre el archivo `reset-database.sql`
### 2.2 Copia TODO el contenido (Ctrl+A, Ctrl+C)
### 2.3 Pega en el editor SQL de Supabase
### 2.4 Haz clic en **[▶ RUN]**

**Resultado esperado:**
```
NOTICE:  Base de datos reseteada exitosamente
NOTICE:  Todas las tablas han sido eliminadas
NOTICE:  Ahora puede ejecutar database-schema.sql para crear la estructura nueva
Query executed successfully
```

---

## 🏗️ **PASO 3: CREAR ESTRUCTURA DE TABLAS**

### 3.1 Limpia el editor SQL
### 3.2 Abre el archivo `database-schema.sql`
### 3.3 Copia TODO el contenido
### 3.4 Pega en el editor SQL
### 3.5 Haz clic en **[▶ RUN]**

**Resultado esperado:**
```
Query executed successfully
-- Sin mensajes de error de constraint duplicadas --
```

---

## 📊 **PASO 4: INSERTAR DATOS INICIALES**

### 4.1 Limpia el editor SQL nuevamente
### 4.2 Abre el archivo `initial-data-fixed.sql`
### 4.3 Copia TODO el contenido
### 4.4 Pega en el editor SQL
### 4.5 Haz clic en **[▶ RUN]**

**Resultado esperado:**
```
NOTICE:  Base de datos inicializada con éxito
NOTICE:  Se han creado las tablas principales y datos iniciales
NOTICE:  Usuario administrador: admin@sistema.cl
Query executed successfully
```

---

## ✅ **PASO 5: VERIFICAR INSTALACIÓN**

### 5.1 En tu terminal, ejecuta:
```bash
node verify-database-connection.cjs
```

### 5.2 Resultado esperado:
```
🚀 INICIANDO VERIFICACIÓN COMPLETA DE BASE DE DATOS
✅ Conexión exitosa con Supabase
📊 Total de tablas verificadas: 37
✅ Todas las tablas existen
📊 Total de campos verificados: 146
✅ Todos los campos están presentes
✅ VERIFICACIÓN COMPLETADA EXITOSAMENTE
```

---

## 🔍 **PASO 6: VERIFICACIÓN VISUAL EN SUPABASE**

### 6.1 En el dashboard de Supabase, ve a **Table Editor**
### 6.2 Deberías ver las tablas creadas:
```
📁 Tables
├── 📄 Region (15 rows)
├── 📄 Comunas (0 rows)
├── 📄 TipoCliente (6 rows)
├── 📄 Grupos (7 rows)
├── 📄 Perfiles (7 rows)
├── 📄 Medios (10 rows)
├── 📄 Usuarios (1 rows)
├── 📄 Clientes (1 rows)
├── 📄 Proveedores (1 rows)
├── 📄 Agencias (1 rows)
├── 📄 Campania (1 rows)
├── 📄 OrdenesDePublicidad (0 rows)
├── 📄 alternativa (1 rows)
├── 📄 plan (1 rows)
└── ... (37 tablas en total)
```

---

## 🎯 **RESUMEN FINAL**

### ✅ **Qué está listo:**
- Base de datos completamente estructurada
- 37 tablas creadas con todas las relaciones
- Datos iniciales insertados
- Usuario administrador configurado
- 100% de campos del sistema vinculados

### 🚀 **Sistema listo para:**
- Iniciar sesión como administrador
- Crear clientes, campañas y órdenes
- Probar todas las funcionalidades
- Desarrollar nuevas características

---

## 🆘 **SOLUCIÓN DE PROBLEMAS**

### **Si aparece error en cualquier paso:**
1. **Vuelve al Paso 2** (limpiar base de datos)
2. **Ejecuta en orden**: Reset → Schema → Datos
3. **Verifica mensajes de error** en consola SQL
4. **Confirma que copiaste TODO** el contenido de cada archivo

### **Si la verificación falla:**
1. **Ejecuta `node simple-connection-test.cjs`**
2. **Confirma conexión básica**
3. **Repite los pasos 2-4**
4. **Verifica que no haya errores SQL**

---

## 📞 **CONTACTO DE SOPORTE**

Si después de seguir todos los pasos aún tienes problemas:

1. **Captura de pantalla** del error exacto
2. **Mensaje completo** de error SQL
3. **Paso específico** donde falla
4. **Resultado del comando** `node simple-connection-test.cjs`

**El sistema está completamente configurado y listo para funcionar una vez que completes estos pasos.**