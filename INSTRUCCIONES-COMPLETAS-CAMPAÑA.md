# 🚀 Instrucciones Completas para Activar el Sistema 100%

## 📋 Resumen
Se ha creado la campaña para Cordillera Foods pero faltan las modificaciones en la base de datos y la creación de las órdenes. Sigue estos pasos:

## 🔧 Paso 1: Modificar la Base de Datos en Supabase

### 1.1 Ir al Dashboard de Supabase
1. Abre https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor**

### 1.2 Ejecutar el Script SQL
Copia y pega el siguiente código en el SQL Editor y ejecútalo:

```sql
-- ============================================
-- Script COMPLETO para corregir la estructura de la base de datos
-- ============================================

-- 1. Agregar campo id_medio a la tabla soportes
ALTER TABLE soportes
ADD COLUMN IF NOT EXISTS id_medio INTEGER;

-- 2. Agregar campos faltantes a la tabla alternativa
ALTER TABLE alternativa
ADD COLUMN IF NOT EXISTS id_medios INTEGER,
ADD COLUMN IF NOT EXISTS id_plan INTEGER;

-- 3. Crear relaciones entre soportes y medios
-- Radio AM (id_medio = 1)
UPDATE soportes SET id_medio = 1 WHERE id_soporte IN (
    3, 16, 17, 18, 19, 20, 21, 22, 23, 51, 52, 53, 54
);

-- Revista (id_medio = 4)
UPDATE soportes SET id_medio = 4 WHERE id_soporte IN (
    6, 36, 38, 40, 42
);

-- TV Abierta (id_medio = 9)
UPDATE soportes SET id_medio = 9 WHERE id_soporte IN (
    1, 2, 4, 7, 8, 9, 10, 11, 12, 13, 14, 15, 24, 26, 28, 30, 44, 45, 46, 47, 48, 49, 50
);

-- Marketing Digital (id_medio = 14)
UPDATE soportes SET id_medio = 14 WHERE id_soporte IN (
    5, 25, 27, 29, 31, 32, 33, 34, 35, 37, 39, 41, 43
);

-- 4. Asignar soportes restantes al primer medio
UPDATE soportes SET id_medio = 1 WHERE id_medio IS NULL;

-- 5. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_soportes_id_medio ON soportes(id_medio);
CREATE INDEX IF NOT EXISTS idx_alternativa_id_medios ON alternativa(id_medios);
CREATE INDEX IF NOT EXISTS idx_alternativa_id_plan ON alternativa(id_plan);

-- 6. Verificar la estructura actualizada
SELECT 'soportes' as tabla_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'soportes' AND column_name IN ('id_soporte', 'id_medio')
UNION ALL
SELECT 'alternativa' as tabla_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'alternativa' AND column_name IN ('id', 'id_medios', 'id_plan')
ORDER BY tabla_name, column_name;
```

### 1.3 Verificar que se ejecutó correctamente
Deberías ver un mensaje de éxito y las tablas ahora tendrán los nuevos campos.

## 🎯 Paso 2: Crear las Órdenes de la Campaña

### 2.1 Ejecutar el Script de Creación de Órdenes
En tu terminal, ejecuta:

```bash
node crear-ordenes-campania.cjs
```

Este script:
- ✅ Creará alternativas para cada medio y contrato
- ✅ Generará órdenes de compra automáticas
- ✅ Distribuirá el presupuesto de $300.000.000
- ✅ Asignará fechas correspondientes a noviembre y diciembre

### 2.2 Verificar la Creación
El script mostrará un resumen como:
```
📝 Resumen Final:
   📋 Campaña: Cordillera Foods - Urban Branding - Nov-Dic 2025
   💰 Presupuesto total: $300.000.000
   📅 Planes: 2
   📺 Alternativas creadas: XX
   📄 Órdenes creadas: XX
```

## 🔍 Paso 3: Verificación en el Sistema

### 3.1 Verificar Medios
Ve a: http://localhost:3002/medios
- Deberías ver los medios con sus soportes asignados
- Cada medio mostrará la cantidad de soportes disponibles

### 3.2 Verificar Planificación
Ve a: http://localhost:3002/planificacion
- Busca la campaña "Cordillera Foods - Urban Branding - Nov-Dic 2025"
- Verás los planes para noviembre y diciembre
- Cada plan tendrá sus alternativas y órdenes creadas

### 3.3 Verificar Órdenes
Ve a: http://localhost:3002/ordenes
- Deberías ver todas las órdenes creadas automáticamente
- Cada orden tendrá su presupuesto asignado
- El estado será "pendiente"

## 📊 Esperado Resultado Final

### Campaña Creada:
- **Cliente**: Cordillera Foods
- **Agencia**: Urban Branding Agency  
- **Presupuesto**: $300.000.000
- **Período**: Noviembre - Diciembre 2025

### Distribución:
- **Planes**: 2 (Noviembre y Diciembre)
- **Medios utilizados**: TV Abierta, Radio AM, Revista, Marketing Digital
- **Alternativas**: Varias por medio y contrato
- **Órdenes**: Una por cada alternativa

## 🚨 Si Hay Problemas

### Error en SQL:
- Verifica que tengas permisos de administrador en Supabase
- Ejecuta cada sección del SQL por separado

### Error en Node.js:
- Asegúrate de estar en el directorio correcto
- Verifica que el archivo .env tenga las credenciales correctas

### No se ven los medios:
- Refresca la página del navegador
- Verifica que el SQL se ejecutó correctamente
- Revisa la consola del navegador por errores

## ✅ Checklist Final

- [ ] SQL ejecutado en Supabase correctamente
- [ ] Script de órdenes ejecutado sin errores
- [ ] Medios visibles en http://localhost:3002/medios
- [ ] Campaña visible en planificación
- [ ] Órdenes creadas y visibles
- [ ] Presupuesto distribuido correctamente

¡Listo! El sistema estará 100% funcional y la campaña de Cordillera Foods estará completamente operativa.