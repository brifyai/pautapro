# 🔍 DIAGNÓSTICO: Gráficos No Aparecen al Actualizar Dashboard

## 🎯 Problema Identificado

Cuando se actualiza la página (`F5` o `Cmd+R`), los dos gráficos no aparecen:
- ❌ "Distribución de Clientes por Inversión" (Pie Chart)
- ❌ "Campañas por Mes (Últimos 6 meses)" (Bar Chart)

Los demás elementos sí cargan correctamente.

---

## 🔎 Causa Raíz

### **Problema 1: Race Condition en `loadDashboardData()`**

En [`Dashboard.jsx`](src/pages/dashboard/Dashboard.jsx) línea 238-302:

```javascript
const loadDashboardData = useCallback(async () => {
  try {
    setLoading(true);

    // Cargar estadísticas básicas
    const statsData = await dashboardService.getDashboardStats();

    // Cargar estadísticas adicionales
    const [campaignStats, orderStats, scoringStats, monthlyData] = await Promise.all([
      campaignService.getCampaignStats(),
      orderService.getOrderStats(),
      clientScoringService.getScoringStats(),
      dashboardService.getMonthlyCampaignData()  // ← AQUÍ
    ]);

    // ... más código ...

    // Cargar datos del gráfico de clientes
    const chartData = await dashboardService.getClientDistribution();  // ← Y AQUÍ
    setPieData(chartData);

    // Cargar datos del gráfico de barras (mensual)
    setBarData(monthlyData);  // ← PERO monthlyData YA FUE CARGADO ARRIBA
```

**PROBLEMA:** `getMonthlyCampaignData()` se llama DOS VECES:
1. Primera vez en `Promise.all()` (línea 250)
2. Segunda vez se asigna a `monthlyData` (línea 269)

Pero `getClientDistribution()` se llama DESPUÉS del `Promise.all()`, causando un delay.

### **Problema 2: Estado Inicial Incorrecto**

En [`Dashboard.jsx`](src/pages/dashboard/Dashboard.jsx) línea 65-81:

```javascript
const [pieData, setPieData] = useState({
  labels: ['Cargando...'],
  datasets: [{
    data: [100],
    backgroundColor: ['#cbd5e1'],
    borderWidth: 0,
  }]
});

const [barData, setBarData] = useState({
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
  datasets: [{
    label: 'Campañas',
    data: [0, 0, 0, 0, 0, 0],  // ← TODOS CEROS
    backgroundColor: '#3b82f6',
    borderWidth: 0,
  }]
});
```

El estado inicial tiene datos vacíos que pueden no actualizarse correctamente.

### **Problema 3: Falta de Manejo de Errores**

En [`dashboardService.js`](src/services/dashboardService.js) línea 177-233:

```javascript
async getMonthlyCampaignData() {
  try {
    // ... código ...
  } catch (error) {
    console.error('Error obteniendo datos mensuales de campañas:', error);
    return {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [{
        label: 'Campañas',
        data: [0, 0, 0, 0, 0, 0],  // ← RETORNA CEROS
        backgroundColor: '#3b82f6',
        borderWidth: 0,
      }]
    };
  }
}
```

Si hay error, retorna datos vacíos sin indicar el problema.

---

## 🛠️ Solución Propuesta

### **Paso 1: Optimizar `loadDashboardData()` en Dashboard.jsx**

Eliminar la llamada duplicada a `getMonthlyCampaignData()`:

```javascript
const loadDashboardData = useCallback(async () => {
  try {
    setLoading(true);

    // Cargar estadísticas básicas
    const statsData = await dashboardService.getDashboardStats();

    // Cargar estadísticas adicionales EN PARALELO
    const [campaignStats, orderStats, scoringStats, monthlyData, chartData] = await Promise.all([
      campaignService.getCampaignStats(),
      orderService.getOrderStats(),
      clientScoringService.getScoringStats(),
      dashboardService.getMonthlyCampaignData(),
      dashboardService.getClientDistribution()  // ← AGREGAR AQUÍ
    ]);

    // Combinar todas las estadísticas
    const enhancedStats = {
      ...statsData,
      ordenesActivas: orderStats.inProductionOrders || 0,
      campañasPendientes: campaignStats.revision + campaignStats.borrador || 0,
      presupuestoTotal: await dashboardService.getTotalBudget(),
      crecimientoMensual: await dashboardService.getMonthlyGrowth()
    };

    setStats(enhancedStats);

    // Asignar datos de gráficos directamente
    setPieData(chartData);  // ← USAR chartData del Promise.all
    setBarData(monthlyData);

    // ... resto del código ...
  } catch (error) {
    console.error('Error cargando datos del dashboard:', error);
  } finally {
    setLoading(false);
  }
}, []);
```

### **Paso 2: Mejorar Manejo de Errores en dashboardService.js**

Agregar logging detallado:

```javascript
async getClientDistribution() {
  try {
    const { data: clientes, error } = await supabase
      .from('clientes')
      .select('razonsocial, total_invertido')
      .order('total_invertido', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error en getClientDistribution:', error);
      // Retornar datos de ejemplo
      return { /* ... */ };
    }

    if (!clientes || clientes.length === 0) {
      console.warn('⚠️ No hay clientes en la base de datos');
      return { /* ... */ };
    }

    // ... resto del código ...
  } catch (error) {
    console.error('❌ Error crítico en getClientDistribution:', error);
    return { /* ... */ };
  }
}
```

### **Paso 3: Agregar Validación de Datos**

En `Dashboard.jsx`, validar que los datos sean válidos antes de renderizar:

```javascript
// Validar que pieData tiene datos válidos
const hasPieData = pieData?.datasets?.[0]?.data?.length > 0 && 
                   pieData.datasets[0].data.some(d => d > 0);

// Validar que barData tiene datos válidos
const hasBarData = barData?.datasets?.[0]?.data?.length > 0 && 
                   barData.datasets[0].data.some(d => d > 0);

// En el JSX:
{loading ? (
  <div className="modern-loading"></div>
) : hasPieData ? (
  <Box sx={{ width: '100%', height: '100%', maxWidth: '380px', maxHeight: '380px' }}>
    <Pie data={pieData} options={pieOptions} />
  </Box>
) : (
  <Box sx={{ textAlign: 'center', py: 4 }}>
    <Typography color="text.secondary">No hay datos disponibles</Typography>
  </Box>
)}
```

---

## 📋 Cambios Específicos Requeridos

### **Archivo: `src/pages/dashboard/Dashboard.jsx`**

**Línea 238-302:** Refactorizar `loadDashboardData()`

```diff
- const loadDashboardData = useCallback(async () => {
+ const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Cargar estadísticas básicas
      const statsData = await dashboardService.getDashboardStats();

      // Cargar estadísticas adicionales
-     const [campaignStats, orderStats, scoringStats, monthlyData] = await Promise.all([
+     const [campaignStats, orderStats, scoringStats, monthlyData, chartData] = await Promise.all([
        campaignService.getCampaignStats(),
        orderService.getOrderStats(),
        clientScoringService.getScoringStats(),
-       dashboardService.getMonthlyCampaignData()
+       dashboardService.getMonthlyCampaignData(),
+       dashboardService.getClientDistribution()
      ]);

      // ... código de enhancedStats ...

      setStats(enhancedStats);

      // Cargar datos del gráfico de clientes
-     const chartData = await dashboardService.getClientDistribution();
      setPieData(chartData);

      // Cargar datos del gráfico de barras (mensual)
      setBarData(monthlyData);
```

**Línea 745-748:** Agregar validación para Pie Chart

```diff
  {loading ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <div className="modern-loading"></div>
    </Box>
- ) : (
+ ) : pieData?.datasets?.[0]?.data?.length > 0 ? (
    <Box sx={{ width: '100%', height: '100%', maxWidth: '380px', maxHeight: '380px' }}>
      <Pie data={pieData} options={pieOptions} />
    </Box>
+ ) : (
+   <Box sx={{ textAlign: 'center', py: 4 }}>
+     <Typography color="text.secondary">No hay datos de clientes disponibles</Typography>
+   </Box>
  )}
```

**Línea 766-768:** Agregar validación para Bar Chart

```diff
  {loading ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <div className="modern-loading"></div>
    </Box>
- ) : (
+ ) : barData?.datasets?.[0]?.data?.length > 0 && barData.datasets[0].data.some(d => d > 0) ? (
    <Bar data={barData} options={barOptions} />
+ ) : (
+   <Box sx={{ textAlign: 'center', py: 4 }}>
+     <Typography color="text.secondary">No hay datos de campañas disponibles</Typography>
+   </Box>
  )}
```

---

## ✅ Verificación

Después de aplicar los cambios:

1. ✅ Actualizar página (`F5`)
2. ✅ Verificar que ambos gráficos aparecen
3. ✅ Verificar que los datos son correctos
4. ✅ Abrir consola y verificar que no hay errores
5. ✅ Probar en diferentes navegadores

---

## 📊 Resumen

| Aspecto | Valor |
|--------|-------|
| **Causa Principal** | Race condition + llamada duplicada |
| **Archivos Afectados** | 1 (Dashboard.jsx) |
| **Líneas a Modificar** | ~30 líneas |
| **Esfuerzo** | Bajo (< 30 minutos) |
| **Impacto** | Alto (gráficos aparecerán correctamente) |

