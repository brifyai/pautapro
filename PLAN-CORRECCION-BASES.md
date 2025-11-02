# 🚨 PLAN DE CORRECCIÓN DE BASES DE DATOS

## Problema Identificado

El sistema tiene **SERIOS PROBLEMAS DE ARQUITECTURA** con múltiples tablas que no convergen:

### 📊 Estado Actual de Tablas

| Entidad | Tabla Usada | Registros | Problema |
|---------|-------------|-----------|----------|
| Órdenes | `ordenesdepublicidad` | 371 | ✅ Tabla correcta |
| Clientes | `clientes` | 21 | ✅ Tabla correcta |
| Campañas | `campania` | 62 | ✅ Tabla correcta |
| Alternativas | `alternativa` | 741 | ✅ Tabla correcta |
| Planes | `plan` | 11 | ✅ Tabla correcta |
| Medios | `medios` | 13 | ✅ Tabla correcta |
| Contratos | `contratos` | 45 | ✅ Tabla correcta |
| Proveedores | `proveedores` | 31 | ✅ Tabla correcta |

### 🔍 Problemas Críticos Detectados

1. **Nombres inconsistentes**: Algunas tablas en singular, otras en plural
2. **Relaciones rotas**: Las tablas no están conectadas correctamente
3. **Datos huérfanos**: Hay información que no se puede relacionar
4. **Confusión en el código**: El frontend usa nombres diferentes a las tablas reales

## 🎯 Análisis de Relaciones

### Relaciones Actuales (Funcionales)
- `ordenesdepublicidad.id_cliente` → `clientes.id_cliente` ✅
- `ordenesdepublicidad.id_campania` → `campania.id_campania` ✅

### Relaciones Rotas o Inexistentes
- `ordenesdepublicidad` → `alternativa` ❌ (No hay conexión directa)
- `alternativa.id_plan` → `plan.id` ❌ (La mayoría son NULL)
- `alternativa.id_contrato` → `contratos.id` ❌ (No hay verificación)
- `contratos.idmedios` → `medios.id` ❌ (Inconsistente)

## 🔧 Plan de Acción Inmediato

### FASE 1: Corregir el Frontend (Prioridad Alta)

#### 1.1 Estandarizar nombres en el código
```javascript
// ESTADO ACTUAL (INCORRECTO)
- Tabla: 'ordenes' → No existe
- Tabla: 'campanas' → Debería ser 'campania'
- Tabla: 'clientes' → ✅ Correcto
- Tabla: 'alternativas' → Debería ser 'alternativa'

// ESTADO CORREGIDO
- Tabla: 'ordenesdepublicidad' ✅
- Tabla: 'campania' ✅
- Tabla: 'clientes' ✅
- Tabla: 'alternativa' ✅
```

#### 1.2 Corregir ReporteOrdenDeCompra.jsx
- [x] Ya está usando `ordenesdepublicidad`
- [x] Ya está usando `campania`
- [x] Ya está usando `clientes`
- [ ] Falta conectar con `alternativa`

### FASE 2: Conectar Datos Faltantes (Prioridad Media)

#### 2.1 Crear vista unificada de órdenes con alternativas
```sql
CREATE VIEW vista_ordenes_completas AS
SELECT 
    o.*,
    c.nombrecliente as cliente_nombre,
    cam.nombrecampania as campana_nombre,
    -- Aquí necesitamos conectar con alternativas
FROM ordenesdepublicidad o
LEFT JOIN clientes c ON o.id_cliente = c.id_cliente
LEFT JOIN campania cam ON o.id_campania = cam.id_campania
```

#### 2.2 Investigar conexión entre órdenes y alternativas
- Revisar si `alternativas_plan_orden` contiene IDs de alternativas
- Verificar si hay alguna tabla intermedia faltante

### FASE 3: Limpieza de Base de Datos (Prioridad Baja)

#### 3.1 Estandarizar nombres de tablas
```sql
-- Opción 1: Renombrar tablas a plural
ALTER TABLE campania RENAME TO campanias;
ALTER TABLE alternativa RENAME TO alternativas;
ALTER TABLE plan RENAME TO planes;

-- Opción 2: Mantener nombres actuales y actualizar código
-- (Recomendado para no romper el sistema)
```

## 🚀 Acciones Inmediatas

### 1. Corregir el reporte para mostrar medios
El usuario quiere ver los medios en las órdenes. Necesitamos:

```javascript
// En ReporteOrdenDeCompra.jsx
const query = supabase
  .from('ordenesdepublicidad')
  .select(`
    id_ordenes_de_comprar,
    numero_correlativo,
    monto_total,
    estado,
    created_at,
    id_cliente,
    id_campania,
    id_plan,
    alternativas_plan_orden,
    clientes!inner(id_cliente, nombrecliente),
    campania!inner(id_campania, nombrecampania)
  `);
```

### 2. Conectar con alternativas para mostrar medios
```javascript
// Para cada orden, buscar sus alternativas
const alternativasIds = orden.alternativas_plan_orden;
if (alternativasIds) {
  const { data: alternativas } = await supabase
    .from('alternativa')
    .select(`
      id,
      descripcion,
      costo,
      contratos!inner(id, numero_contrato, idmedios),
      contratos!inner(medios!inner(id, nombre_medio))
    `)
    .in('id', alternativasIds.split(','));
}
```

## 📋 Verificación Final

1. **Ver que los medios se vean en `/reportes/ordendecompra`**
2. **Ver que las relaciones funcionen correctamente**
3. **Ver que los filtros funcionen**
4. **Ver que la exportación a Excel funcione**

## ⚠️ Advertencia Importante

**NO ELIMINAR TABLAS** sin antes hacer backup completo. 
La estructura actual, aunque confusa, está funcionando y contiene datos reales.

## 🎯 Solución a Corto Plazo

Para resolver el problema inmediato del usuario:

1. ✅ Ya corregimos `ReporteOrdenDeCompra.jsx` para usar las tablas correctas
2. 🔄 Ahora necesitamos conectar las alternativas para mostrar los medios
3. 🔄 Verificar que los datos se muestren correctamente

## 🔄 Próximos Pasos

1. **IMMEDIATO**: Probar el reporte corregido
2. **HOY**: Conectar alternativas para mostrar medios
3. **ESTA SEMANA**: Documentar toda la estructura
4. **PRÓXIMA SEMANA**: Planificar migración a estructura limpia

---

**ESTADO CRÍTICO**: El sistema funciona pero es frágil. Se necesita intervención urgente para estabilizar.