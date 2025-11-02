/**
 * Componente Dashboard Optimizado con manejo mejorado de estados y rendimiento
 * Incorpora useAsyncState, SweetAlert2 y manejo robusto de errores
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Dashboard.css';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { dashboardService } from '../../services/dashboardService';
import { campaignService } from '../../services/campaignService';
import { orderService } from '../../services/orderService';
import clientScoringService from '../../services/clientScoringService';
import { useAsyncState } from '../../hooks/useAsyncState';
import { errorHandlingService } from '../../services/errorHandlingService';
import { SweetAlertUtils } from '../../utils/sweetAlertUtils';
import {
  Alert,
  AlertTitle,
  Box,
  Chip,
  Grid,
  Paper,
  Typography,
  IconButton,
  LinearProgress,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  People as PeopleIcon,
  Campaign as CampaignIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement);

const DashboardOptimized = () => {
  // Estados principales usando useState normal (useAsyncState es para operaciones asíncronas)
  const [stats, setStats] = useState({
    agencias: 0,
    clientes: 0,
    campanas: 0,
    medios: 0,
    ordenesActivas: 0,
    campañasPendientes: 0,
    presupuestoTotal: 0,
    crecimientoMensual: 0
  });

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
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: '#3b82f6',
      borderWidth: 0,
    }]
  });

  const [recentClients, setRecentClients] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [kpiData, setKpiData] = useState({
    avgCampaignDuration: 0,
    clientRetentionRate: 0,
    orderCompletionRate: 0,
    topPerformingMedium: ''
  });

  // Estados de carga
  const [statsLoading, setStatsLoading] = useState(false);
  const [pieLoading, setPieLoading] = useState(false);
  const [barLoading, setBarLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [kpiLoading, setKpiLoading] = useState(false);

  // Estados de error
  const [statsError, setStatsError] = useState(null);
  const [pieError, setPieError] = useState(null);
  const [barError, setBarError] = useState(null);
  const [clientsError, setClientsError] = useState(null);
  const [messagesError, setMessagesError] = useState(null);
  const [kpiError, setKpiError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Opciones de gráficos memorizadas para evitar recreación
  const pieOptions = useMemo(() => ({
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    }
  }), []);

  const barOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          drawBorder: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }), []);

  // Función para cargar datos del dashboard con manejo de errores mejorado
  const loadDashboardData = useCallback(async (showLoadingAlert = false) => {
    try {
      if (showLoadingAlert) {
        setIsRefreshing(true);
        SweetAlertUtils.showLoading('Cargando datos del dashboard...');
      }

      // Cargar estadísticas básicas
      const statsData = await dashboardService.getDashboardStats();
      
      // Cargar estadísticas adicionales en paralelo
      const [campaignStats, orderStats, scoringStats, monthlyData] = await Promise.all([
        campaignService.getCampaignStats(),
        orderService.getOrderStats(),
        clientScoringService.getScoringStats(),
        dashboardService.getMonthlyCampaignData()
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

      // Cargar datos del gráfico de clientes
      const chartData = await dashboardService.getClientDistribution();
      setPieData(chartData);

      // Cargar datos del gráfico de barras (mensual)
      setBarData(monthlyData);

      // Cargar clientes recientes
      const clients = await dashboardService.getRecentClients();
      setRecentClients(clients);

      // Cargar mensajes recientes
      const messages = await dashboardService.getRecentMessages();
      setRecentMessages(messages);

      // Cargar KPIs avanzados
      const kpiStats = await Promise.all([
        dashboardService.getAvgCampaignDuration(),
        clientScoringService.getClientRetentionRate(),
        orderService.getCompletionRate(),
        dashboardService.getTopPerformingMedium()
      ]);

      setKpiData({
        avgCampaignDuration: kpiStats[0] || 0,
        clientRetentionRate: kpiStats[1] || 0,
        orderCompletionRate: kpiStats[2] || 0,
        topPerformingMedium: kpiStats[3] || 'N/A'
      });

      setLastUpdate(new Date());

      if (showLoadingAlert) {
        SweetAlertUtils.close();
      }

    } catch (error) {
      errorHandlingService.handleError(error, 'loadDashboardData');
      
      if (showLoadingAlert) {
        SweetAlertUtils.showError(
          'Error de carga',
          'No se pudieron cargar los datos del dashboard. Por favor, intente nuevamente.'
        );
      } else {
        // Agregar alerta de error silenciosa
        setAlerts(prev => [{
          id: Date.now(),
          type: 'error',
          title: 'Error de carga',
          message: 'No se pudieron cargar los datos del dashboard',
          timestamp: new Date(),
          ...prev
        }]);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [setStats, setPieData, setBarData, setRecentClients, setRecentMessages, setKpiData, setAlerts]);

  // Generador de alertas automáticas memorizado
  const generateAutomaticAlerts = useCallback(() => {
    const newAlerts = [];

    // Alertas de campañas pendientes
    if (stats.campañasPendientes > 5) {
      newAlerts.push({
        id: Date.now() + 1,
        type: 'warning',
        title: 'Campañas pendientes',
        message: `Hay ${stats.campañasPendientes} campañas esperando aprobación`,
        timestamp: new Date()
      });
    }

    // Alertas de órdenes en producción
    if (stats.ordenesActivas > 10) {
      newAlerts.push({
        id: Date.now() + 2,
        type: 'info',
        title: 'Alta actividad',
        message: `Hay ${stats.ordenesActivas} órdenes en producción`,
        timestamp: new Date()
      });
    }

    // Alertas de crecimiento
    if (stats.crecimientoMensual < 0) {
      newAlerts.push({
        id: Date.now() + 3,
        type: 'error',
        title: 'Crecimiento negativo',
        message: `El crecimiento mensual es de ${stats.crecimientoMensual}%`,
        timestamp: new Date()
      });
    }

    // Alertas de KPIs
    if (kpiData.orderCompletionRate < 80) {
      newAlerts.push({
        id: Date.now() + 4,
        type: 'warning',
        title: 'Tasa de completación baja',
        message: `La tasa de completación de órdenes es del ${kpiData.orderCompletionRate}%`,
        timestamp: new Date()
      });
    }

    setAlerts(newAlerts.slice(0, 3)); // Máximo 3 alertas visibles
  }, [stats, kpiData, setAlerts]);

  // Manejador de refresco optimizado
  const handleRefresh = useCallback(() => {
    loadDashboardData(true);
  }, [loadDashboardData]);

  // Efectos optimizados
  useEffect(() => {
    loadDashboardData();

    // Actualización automática cada 5 minutos
    const interval = setInterval(() => loadDashboardData(), 300000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  useEffect(() => {
    generateAutomaticAlerts();
  }, [generateAutomaticAlerts]);

  // Funciones utilitarias memorizadas
  const getTrendIcon = useCallback((value) => {
    if (value > 0) return <TrendingUpIcon sx={{ color: 'green', fontSize: 16 }} />;
    if (value < 0) return <TrendingDownIcon sx={{ color: 'red', fontSize: 16 }} />;
    return null;
  }, []);

  const getAlertIcon = useCallback((type) => {
    switch (type) {
      case 'error': return <ErrorIcon />;
      case 'warning': return <WarningIcon />;
      case 'success': return <CheckCircleIcon />;
      default: return <InfoIcon />;
    }
  }, []);

  // Estado de carga combinado
  const isLoading = statsLoading || pieLoading || barLoading || clientsLoading || messagesLoading || kpiLoading;

  // Manejador de errores para mostrar alertas silenciosas
  useEffect(() => {
    if (statsError || pieError || barError || clientsError || messagesError || kpiError) {
      const error = statsError || pieError || barError || clientsError || messagesError || kpiError;
      errorHandlingService.handleError(error, 'Dashboard Data Loading');
    }
  }, [statsError, pieError, barError, clientsError, messagesError, kpiError]);

  return (
    <div className="dashboard">
      {/* Header con última actualización */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
          Dashboard Inteligente Optimizado
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </Typography>
          <Tooltip title="Actualizar datos">
            <IconButton 
              onClick={handleRefresh} 
              size="small"
              disabled={isRefreshing}
            >
              <RefreshIcon sx={{ 
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Alertas automáticas */}
      {alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {alerts.map((alert) => (
            <Alert key={alert.id} severity={alert.type} sx={{ mb: 1 }}>
              <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getAlertIcon(alert.type)}
                {alert.title}
              </AlertTitle>
              <Typography variant="body2">{alert.message}</Typography>
              <Typography variant="caption" color="text.secondary">
                {alert.timestamp.toLocaleTimeString()}
              </Typography>
            </Alert>
          ))}
        </Box>
      )}

      {/* Grid de estadísticas mejoradas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Clientes
                  </Typography>
                  <Typography variant="h4" component="div">
                    {isLoading ? '...' : stats.clientes}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {getTrendIcon(stats.crecimientoMensual)}
                    <Typography variant="body2" color="text.secondary">
                      {stats.crecimientoMensual?.toFixed(1)}% este mes
                    </Typography>
                  </Box>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: '#3b82f6', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Campañas
                  </Typography>
                  <Typography variant="h4" component="div">
                    {isLoading ? '...' : stats.campanas}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Chip
                      label={`${stats.campañasPendientes} pendientes`}
                      size="small"
                      color={stats.campañasPendientes > 5 ? 'warning' : 'default'}
                    />
                  </Box>
                </Box>
                <CampaignIcon sx={{ fontSize: 40, color: '#10b981', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Órdenes Activas
                  </Typography>
                  <Typography variant="h4" component="div">
                    {isLoading ? '...' : stats.ordenesActivas}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tasa completación: {kpiData.orderCompletionRate}%
                    </Typography>
                  </Box>
                </Box>
                <ShoppingCartIcon sx={{ fontSize: 40, color: '#f59e0b', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Presupuesto Total
                  </Typography>
                  <Typography variant="h4" component="div">
                    {isLoading ? '...' : `$${(stats.presupuestoTotal / 1000000).toFixed(1)}M`}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Duración promedio: {kpiData.avgCampaignDuration} días
                    </Typography>
                  </Box>
                </Box>
                <AttachMoneyIcon sx={{ fontSize: 40, color: '#8b5cf6', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Grid de gráficos y contenido */}
      <Grid container spacing={3}>
        {/* Gráfico de distribución de clientes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribución de Clientes por Inversión
              </Typography>
              <Box sx={{ height: 300, position: 'relative' }}>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <LinearProgress sx={{ width: '100%' }} />
                  </Box>
                ) : (
                  <Pie data={pieData} options={pieOptions} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de campañas mensuales */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Campañas por Mes (Últimos 6 meses)
              </Typography>
              <Box sx={{ height: 300, position: 'relative' }}>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <LinearProgress sx={{ width: '100%' }} />
                  </Box>
                ) : (
                  <Bar data={barData} options={barOptions} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* KPIs Avanzados */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Indicadores Clave de Rendimiento
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tasa de Retención de Clientes
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={kpiData.clientRetentionRate}
                      sx={{ flex: 1 }}
                      color={kpiData.clientRetentionRate > 80 ? 'success' : 'warning'}
                    />
                    <Typography variant="body2" sx={{ minWidth: 40 }}>
                      {kpiData.clientRetentionRate}%
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tasa de Completación de Órdenes
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={kpiData.orderCompletionRate}
                      sx={{ flex: 1 }}
                      color={kpiData.orderCompletionRate > 80 ? 'success' : 'warning'}
                    />
                    <Typography variant="body2" sx={{ minWidth: 40 }}>
                      {kpiData.orderCompletionRate}%
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Medio con Mejor Rendimiento
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {kpiData.topPerformingMedium}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Duración Promedio de Campañas
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {kpiData.avgCampaignDuration} días
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Clientes recientes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Clientes Recientes
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <LinearProgress sx={{ width: '100%' }} />
                  </Box>
                ) : recentClients.length > 0 ? (
                  recentClients.map((client, index) => (
                    <Box key={index} sx={{ py: 1, borderBottom: '1px solid #f0f0f0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <PeopleIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {client.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {client.address}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <PeopleIcon sx={{ fontSize: 40, color: '#cbd5e1', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No hay clientes recientes
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Mensajes recientes */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actividad Reciente
              </Typography>
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <LinearProgress sx={{ width: '100%' }} />
                  </Box>
                ) : recentMessages.length > 0 ? (
                  recentMessages.map((message, index) => (
                    <Box key={index} sx={{ py: 1, borderBottom: '1px solid #f0f0f0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TimelineIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {message.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {message.date}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <TimelineIcon sx={{ fontSize: 40, color: '#cbd5e1', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No hay actividad reciente
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default DashboardOptimized;