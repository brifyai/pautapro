# 🔧 FIX: Parpadeo de Gráficos en Dashboard

## 📋 Problema Identificado

Los gráficos del Dashboard parpadean (flashing) constantemente porque:

1. **Recreación innecesaria de funciones**: `getLast6MonthsLabels()` se recreaba en cada render
2. **Dependencias circulares**: `loadDashboardData` dependía de `getLast6MonthsLabels`, causando re-renders infinitos
3. **Keys dinámicas**: Los gráficos usaban `key` basado en `lastUpdate.getTime()`, forzando re-montaje completo

## ✅ Soluciones Aplicadas

### 1️⃣ Memoizar `getLast6MonthsLabels` (Línea 94)

**Antes:**
```javascript
const getLast6MonthsLabels = () => {
  // ... lógica
};
```

**Después:**
```javascript
const getLast6MonthsLabels = useCallback(() => {
  // ... lógica
}, []);
```

**Impacto**: La función ahora se crea UNA SOLA VEZ y se reutiliza en todos los renders.

---

### 2️⃣ Remover dependencia problemática de `loadDashboardData` (Línea 226)

**Antes:**
```javascript
const loadDashboardData = useCallback(async () => {
  // ... código
  const validMonthlyData = monthlyData && ... ? monthlyData : {
    labels: getLast6MonthsLabels(),  // ❌ Llamaba función
    // ...
  };
}, [getLast6MonthsLabels]);  // ❌ Dependencia circular
```

**Después:**
```javascript
const loadDashboardData = useCallback(async () => {
  // ... código
  const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const labels = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    labels.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);
  }
  
  const validMonthlyData = monthlyData && ... ? monthlyData : {
    labels: labels,  // ✅ Usa variable local
    // ...
  };
}, []);  // ✅ Sin dependencias
```

**Impacto**: `loadDashboardData` ahora es estable y no causa re-renders infinitos.

---

### 3️⃣ Cambiar Keys de Gráficos (Líneas 528, 545, 826, 847)

**Antes:**
```javascript
<Pie key={`pie-${lastUpdate.getTime()}-${(computedPieData.labels||[]).join('|')}`} data={computedPieData} options={pieOptions} />
<Bar key={`bar-${lastUpdate.getTime()}-${(computedBarData.labels||[]).join('|')}`} data={computedBarData} options={barOptions} />
```

**Después:**
```javascript
<Pie key="pie-chart" data={computedPieData} options={pieOptions} />
<Bar key="bar-chart" data={computedBarData} options={barOptions} />
```

**Impacto**: Los gráficos NO se re-montan en cada actualización. Chart.js actualiza los datos internamente sin perder estado.

---

## 🎯 Comportamiento Esperado Ahora

✅ **Gráficos NO parpadean**
- Los gráficos permanecen visibles y estables
- Los datos se actualizan suavemente sin re-montaje

✅ **Página NO se mueve constantemente**
- No hay ciclos infinitos de re-renders
- El scroll permanece en su posición

✅ **Actualización manual funciona**
- Botón "Actualizar" (RefreshIcon) carga nuevos datos
- Los gráficos se actualizan sin parpadear

✅ **Performance mejorado**
- Menos re-renders
- Menos cálculos innecesarios
- Mejor experiencia de usuario

---

## 🔄 Cómo Funciona la Actualización

### Opción 1: Actualización Manual (Ya existe)
```javascript
<Tooltip title="Actualizar datos">
  <IconButton
    onClick={loadDashboardData}  // ← Botón de actualización
    size="small"
    className="modern-btn-outline"
    sx={{ borderRadius: '50%' }}
  >
    <RefreshIcon />
  </IconButton>
</Tooltip>
```

El usuario puede hacer clic en el botón de actualización para recargar datos manualmente.

### Opción 2: Actualización Automática (Deshabilitada)
```javascript
// DESHABILITADO: Actualización automática cada 5 minutos
// const interval = setInterval(() => {
//   loadDashboardData();
// }, 300000);
```

Está comentada porque causaba que los gráficos desaparecieran.

---

## 📊 Resumen de Cambios

| Línea | Cambio | Razón |
|-------|--------|-------|
| 94-103 | `getLast6MonthsLabels` → `useCallback` | Evitar recreación en cada render |
| 226-317 | `loadDashboardData` sin dependencias | Evitar ciclo infinito |
| 226-269 | Lógica de labels inline | No depender de función externa |
| 528 | `key="pie-chart-mobile"` | Evitar re-montaje en móvil |
| 545 | `key="bar-chart-mobile"` | Evitar re-montaje en móvil |
| 826 | `key="pie-chart"` | Evitar re-montaje en desktop |
| 847 | `key="bar-chart"` | Evitar re-montaje en desktop |

---

## 🧪 Verificación

Para confirmar que el fix funciona:

1. **Abre el Dashboard** en `http://localhost:3005`
2. **Inicia sesión** con tus credenciales
3. **Observa los gráficos**:
   - ✅ Deben cargar sin parpadear
   - ✅ Deben permanecer visibles
   - ✅ La página NO debe moverse constantemente

4. **Prueba actualización manual**:
   - Haz clic en el botón de actualización (🔄)
   - Los datos deben recargar sin parpadeo

5. **Abre la consola** (F12):
   - Busca logs: `📊 CHART DATA (Pie):` y `📊 MONTHLY DATA (Bar):`
   - Verifica que los datos se cargan correctamente

---

## 🚀 Próximos Pasos Opcionales

### 1. Agregar Skeleton Loaders
Mientras se cargan los datos, mostrar placeholders animados:
```javascript
{loading ? (
  <SkeletonChart height={330} />
) : (
  <Pie key="pie-chart" data={computedPieData} options={pieOptions} />
)}
```

### 2. Implementar React Query
Para mejor caché y manejo de datos:
```javascript
const { data: chartData, refetch } = useQuery('chartData', () => 
  dashboardService.getClientDistribution()
);
```

### 3. Agregar Error Boundaries
Para capturar errores en gráficos:
```javascript
<ErrorBoundary fallback={<ErrorChart />}>
  <Pie key="pie-chart" data={computedPieData} options={pieOptions} />
</ErrorBoundary>
```

---

## 📝 Notas Técnicas

- **Chart.js** actualiza datos internamente sin necesidad de re-montar
- **React keys estables** permiten que Chart.js mantenga su estado
- **useCallback** con dependencias vacías crea funciones estables
- **useMemo** en `computedPieData` y `computedBarData` evita cálculos innecesarios

---

**Fecha de implementación**: 2025-11-05
**Versión**: 1.0
**Estado**: ✅ Completado
