# 🚀 Guía de Instalación de Base de Datos - Versión Corregida

## ⚠️ **PROBLEMAS RESUELTOS**

### **Error 1: Constraint already exists**
- **Problema**: `ERROR: 42710: constraint "chk_clientes_estado" for relation "clientes" already exists`
- **Solución**: Eliminadas las restricciones duplicadas del script `database-schema.sql`

### **Error 2: INSERT has more target columns**
- **Problema**: `ERROR: 42601: INSERT has more target columns than expressions` en tabla Medios
- **Solución**: Corregidos los valores en el script `initial-data-fixed.sql`

---

## 📋 **PASOS CORREGIDOS PARA INSTALACIÓN**

### **Paso 0: LIMPIAR BASE DE DATOS (OBLIGATORIO)**
Si ya ejecutó scripts anteriormente, primero limpie la base de datos:

1. Acceda a: https://supabase.com/dashboard/project/rfjbsoxkgmuehrgteljq/sql
2. Copie y pegue todo el contenido de `reset-database.sql`
3. Ejecute el script para eliminar todas las tablas existentes

### **Paso 1: CREAR ESTRUCTURA DE TABLAS**
1. En la misma consola SQL, copie y pegue todo el contenido de `database-schema.sql`
2. Ejecute el script
3. ✅ **Verifique que no aparezcan errores de constraint duplicadas**

### **Paso 2: INSERTAR DATOS INICIALES**
1. Copie y pegue todo el contenido de `initial-data-fixed.sql`
2. Ejecute el script
3. ✅ **Verifique que no aparezcan errores de column mismatch**

### **Paso 3: VERIFICAR INSTALACIÓN**
1. Ejecute en la terminal: `node verify-database-connection.cjs`
2. Confirme que todas las tablas existen
3. Verifique que los datos iniciales estén presentes

---

## 🔧 **SCRIPTS CORREGIDOS DISPONIBLES**

| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `reset-database.sql` | Limpia base de datos existente | ✅ Nuevo |
| `database-schema.sql` | Crea estructura completa | ✅ Corregido |
| `initial-data-fixed.sql` | Inserta datos iniciales | ✅ Corregido |
| `verify-database-connection.cjs` | Verifica instalación | ✅ Listo |

---

## 🎯 **RESULTADO ESPERADO**

### **Tablas Creadas: 37**
- Usuarios, Clientes, Proveedores, Agencias
- Campañas, Órdenes, Alternativas, Planes
- Tablas de catálogo y relaciones

### **Datos Iniciales Insertados:**
- 15 Regiones de Chile
- 6 Tipos de Cliente
- 7 Grupos de Usuarios
- 7 Perfiles de Usuario
- 10 Medios Publicitarios
- 4 Calidades de Medios
- 8 Formas de Pago
- 6 Tipos de Generación de Orden
- 11 Años (2020-2030)
- 12 Meses
- 8 Formatos
- Usuario administrador por defecto

### **Usuario Administrador:**
- **Email**: admin@sistema.cl
- **Contraseña**: debe ser configurada (hash placeholder)
- **Perfil**: Super Administrador

---

## 🚨 **IMPORTANTE**

1. **Orden de ejecución**: Reset → Schema → Datos → Verificación
2. **No omita el paso de reset** si ya ejecutó scripts antes
3. **Verifique cada paso** antes de continuar al siguiente
4. **Guarde una copia** de los scripts corregidos para referencia futura

---

## 📞 **SOPORTE**

Si encuentra algún error durante la instalación:

1. **Revise los mensajes de error** en la consola SQL de Supabase
2. **Ejecute el script de reset** y comience nuevamente
3. **Verifique los scripts corregidos** en este directorio
4. **Confirme que está usando las versiones corregidas** de los archivos

**Los scripts originales han sido reemplazados por versiones corregidas que solucionan los errores reportados.**