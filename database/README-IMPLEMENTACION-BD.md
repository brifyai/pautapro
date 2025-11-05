# 🗄️ GUÍA DE IMPLEMENTACIÓN DE BASE DE DATOS - PAUTAPRO

## 📋 Tabla de Contenidos
1. [Resumen de Estado](#resumen-de-estado)
2. [Scripts Disponibles](#scripts-disponibles)
3. [Orden de Ejecución](#orden-de-ejecución)
4. [Verificación Post-Implementación](#verificación-post-implementación)
5. [Troubleshooting](#troubleshooting)

---

## 📊 RESUMEN DE ESTADO

### Estado Actual de la Base de Datos

| Categoría | Tablas Existentes | Tablas Faltantes | Estado General |
|-----------|-------------------|-------------------|----------------|
| Core (Básicas) | 34 | 0 | ✅ 100% |
| Rentabilidad | 0-8 | 0-8 | ⚠️ 0-100% |
| Servicios Avanzados | 0 | 10 | ⚠️ 0% |
| Auditoría | 0 | 2 | ⚠️ 0% |

**Funcionalidad Actual**: 70-85% (sin módulos avanzados)
**Funcionalidad Objetivo**: 100% (con todos los módulos)

---

## 📚 SCRIPTS DISPONIBLES

### 1. Schemas Base
- `schemas/database-schema.sql` - 34 tablas principales ✅
- `schemas/database-rentabilidad-schema.sql` - 8 tablas de rentabilidad ⚠️
- `schemas/database-rentabilidad-views.sql` - Vistas SQL de rentabilidad ⚠️

### 2. Scripts de Migración
- `migrations/001_corregir_inconsistencias_campos.sql` - Correcciones de campos ⚠️

### 3. Scripts de Creación
- `scripts/crear-tablas-manualmente.sql` - Tablas de auditoría ⚠️
- `scripts/crear-tablas-faltantes-completo.sql` - Todas las tablas faltantes ⚠️

---

## 🚀 ORDEN DE EJECUCIÓN

### PASO 1: Verificar Tablas Base (OBLIGATORIO)

```sql
-- En Supabase SQL Editor, ejecutar:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Si faltan tablas base**, ejecutar:
```
📄 database/schemas/database-schema.sql
```

### PASO 2: Corregir Inconsistencias (RECOMENDADO)

```
📄 database/migrations/001_corregir_inconsistencias_campos.sql
```

**Qué hace**:
- ✅ Renombra `nombredelmedio` → `nombre_medio`
- ✅ Renombra `NombreClasificacion` → `nombre_clasificacion`
- ✅ Renombra `NombreTema` → `nombre_tema`
- ✅ Estandariza campos de Proveedores
- ✅ Agrega campos `created_at` y `updated_at` faltantes
- ✅ Agrega campos detectados en código: `total_invertido`, `Avatar`, etc.
- ✅ Crea vista de compatibilidad

### PASO 3: Crear Tablas de Prioritarias (SI REQUIERES FUNCIONALIDAD COMPLETA)

#### 3A. Módulo de Rentabilidad (Alta Prioridad)
```
📄 database/schemas/database-rentabilidad-schema.sql
📄 database/schemas/database-rentabilidad-views.sql
```

**Tablas que crea**:
- DetallesFinancierosOrden
- ConfiguracionComisiones
- RegistroBonificacionesMedios
- HistoricoNegociacionMedios
- MetricasRentabilidad
- OportunidadesRentabilidad
- ConfiguracionModelosIA
- LogsDecisionesIA

#### 3B. Tablas de Auditoría (Alta Prioridad)
```
📄 database/scripts/crear-tablas-manualmente.sql
```

**Tablas que crea**:
- campaign_audit_log
- order_audit_log

### PASO 4: Crear Tablas de Servicios Avanzados (Opcional)

```
📄 database/scripts/crear-tablas-faltantes-completo.sql
```

**Tab que crea**:
- client_scoring
- client_interactions
- notifications
- reminders
- user_gamification
- automation_rules
- export_records
- user_preferences
- predictions
- configuracion_ia
- Y más...

---

## ✅ VERIFICACIÓN POST-IMPLEMENTACIÓN

### Script de Verificación

```sql
-- Verificar que todas las tablas estén creadas
DO $$
DECLARE
    tablas_requeridas TEXT[] := ARRAY[
        'Region', 'Comunas', 'Usuarios', 'Perfiles', 'Grupos',
        'Agencias', 'Clientes', 'Proveedores', 'Campania', 'Productos',
        'Medios', 'Calidad', 'Soportes', 'Contratos', 'OrdenesDePublicidad',
        'Programas', 'Clasificacion', 'Temas', 'plan', 'alternativa',
        'campaign_audit_log', 'order_audit_log',
        'DetallesFinancierosOrden', 'ConfiguracionComisiones',
        'client_scoring', 'notifications'
    ];
    tabla TEXT;
    existe BOOLEAN;
    faltantes TEXT[] := ARRAY[]::TEXT[];
BEGIN
    FOREACH tabla IN ARRAY tablas_requeridas
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = LOWER(tabla) 
            AND table_schema = 'public'
        ) INTO existe;
        
        IF NOT existe THEN
            faltantes := array_append(faltantes, tabla);
        END IF;
    END LOOP;
    
    IF array_length(faltantes, 1) > 0 THEN
        RAISE NOTICE '⚠️  TABLAS FALTANTES: %', array_to_string(faltantes, ', ');
    ELSE
        RAISE NOTICE '✅ TODAS LAS TABLAS PRINCIPALES EXISTEN';
    END IF;
END $$;
```

### Verificar Índices

```sql
-- Contar índices por tabla
SELECT 
    tablename,
    COUNT(*) as num_indices
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY num_indices DESC;
```

### Verificar Relaciones Foráneas

```sql
-- Ver todas las foreign keys
SELECT
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, kcu.column_name;
```

---

## 🔧 TROUBLESHOOTING

### Problema: "Tabla no encontrada"
**Solución**: Ejecutar el script correspondiente en orden

### Problema: "Columna no existe"
**Solución**: Ejecutar migración 001 para corregir inconsistencias

### Problema: "Foreign key violation"
**Solución**: Verificar que las tablas padre existan primero

### Problema: "Permission denied"
**Solución**: Configurar RLS policies en Supabase Dashboard

---

## 📞 SOPORTE

### Logs y Depuración

```sql
-- Ver últimas notificaciones (si tabla existe)
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;

-- Ver auditoría de campañas (si tabla existe)
SELECT * FROM campaign_audit_log ORDER BY created_at DESC LIMIT 10;

-- Ver scoring de clientes (si tabla existe)
SELECT * FROM client_scoring ORDER BY score DESC LIMIT 10;
```

### Backup Antes de Migrar

```bash
# Hacer backup en Supabase Dashboard:
# 1. Ir a Database > Backups
# 2. Crear nuevo backup manual
# 3. Esperar confirmación
# 4. Luego ejecutar migraciones
```

---

## 📈 ROADMAP DE IMPLEMENTACIÓN

### Fase 1: INMEDIATA (Semana 1)
- ✅ Verificar tablas base
- ⚠️ Ejecutar corrección de inconsistencias
- ⚠️ Crear tablas de auditoría

### Fase 2: CORTO PLAZO (Semana 2-3)
- ⚠️ Implementar módulo de rentabilidad completo
- ⚠️ Crear tablas de scoring y tracking

### Fase 3: MEDIANO PLAZO (Mes 1-2)
- ⚠️ Implementar notificaciones y recordatorios
- ⚠️ Configurar automatizaciones

### Fase 4: LARGO PLAZO (Mes 3+)
- ⚠️ Implementar gamificación
- ⚠️ Análisis predictivo con IA

---

## ✨ BENEFICIOS POR MÓDULO

### Con Auditoría activada:
- 📝 Rastreo completo de cambios
- 🔍 Compliance y trazabilidad
- 🛡️ Seguridad mejorada

### Con Rentabilidad activada:
- 💰 Análisis financiero preciso
- 📊 Métricas de negocio en tiempo real
- 🎯 Optimización de márgenes

### Con Servicios Avanzados:
- 🤖 Automatización de procesos
- 📧 Notificaciones inteligentes
- 🎮 Gamificación de equipos
- 🔮 Predicciones con IA

---

## 🎯 RESUMEN EJECUTIVO

**Estado Actual**: Sistema funcional con 34 tablas core (85% funcionalidad)

**Para 100% Funcionalidad**:
1. Ejecutar: `001_corregir_inconsistencias_campos.sql`
2. Ejecutar: `crear-tablas-faltantes-completo.sql`
3. Ejecutar: `database-rentabilidad-schema.sql`
4. Ejecutar: `database-rentabilidad-views.sql`

**Tiempo estimado**: 30-60 minutos
**Riesgo**: Bajo (todos los scripts usan IF NOT EXISTS)
**Rollback**: Disponible vía backups de Supabase

---

**Última actualización**: 2025-01-04
**Versión documento**: 1.0
**Mantenedor**: Equipo PautaPro