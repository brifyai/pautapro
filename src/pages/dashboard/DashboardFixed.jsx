import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import './Dashboard.css';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { dashboardService } from '../../services/dashboardService';
import { campaignService } from '../../services/campaignService';
import { orderService } from '../../services/orderService';
import clientScoringService from '../../services/clientScoringService';
import MobileLayout from '../../components/mobile/MobileLayout';
import MobileCard from '../../components/mobile/MobileCard';
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
  Tooltip,
  Fab,
  Zoom,
  TextField,
  Button
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
  AttachMoney as AttachMoneyIcon,
  Lightbulb as LightbulbIcon,
  Assistant as AssistantIcon,
} from '@mui/icons-material';

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement);

const DashboardFixed = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Usar useRef para evitar re-renders por cambios de estado
  const isMountedRef = useRef(true);
  const loadingRef = useRef(false);
  
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
  const [kpiData, setKpiData] = useState({
    avgCampaignDuration: 0,
    clientRetentionRate: 0,
    orderCompletionRate: 0,
    topPerformingMedium: ''
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 8,
          font: { size: 12 },
          boxWidth: 12,
          boxHeight: 12
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0,0,0,0.9)',
        titleColor: '#667eea',
        bodyColor: 'white',
        cornerRadius: 12,
        displayColors: true,
        titleFont: { size: 16, weight: 'bold' },
        bodyFont: { size: 14 },
        padding: 12,
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `Valor: ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
    layout: {
      padding: { left: 2, right: 2, top: 2, bottom: 2 }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: true, drawBorder: false }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  const loadDashboardData = async () => {
    // Protección contra múltiples cargas simultáneas
    if (loadingRef.current && !isRefreshing) {
      console.log('🔄 Ya hay una carga en progreso, evitando duplicación');
      return;
    }

    try {
      loadingRef.current = true;
      console.log('🚀 Iniciando carga del dashboard (Fixed version)');

      // Cargar estadísticas básicas
      const statsData = await dashboardService.getDashboardStats();

      // Cargar gráficos con manejo individual de errores
      let monthlyData = null;
      let chartData = null;

      try {
        monthlyData = await dashboardService.getMonthlyCampaignData();
      } catch (error) {
        console.error('❌ Error cargando monthlyData:', error);
        monthlyData = null;
      }

      try {
        chartData = await dashboardService.getClientDistribution();
      } catch (error) {
        console.error('❌ Error cargando chartData:', error);
        chartData = null;
      }

      // Cargar otros datos en paralelo
      const [campaignStats, orderStats, scoringStats] = await Promise.all([
        campaignService.getCampaignStats(),
        orderService.getOrderStats(),
        clientScoringService.getScoringStats()
      ]);

      // Validar y procesar datos de gráficos
      const validChartData = chartData || {
        labels: ['Sin datos'],
        datasets: [{
          data: [100],
          backgroundColor: ['#cbd5e1'],
          borderWidth: 0,
        }]
      };

      const validMonthlyData = monthlyData || {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
          label: 'Campañas',
          data: [0, 0, 0, 0, 0, 0],
          backgroundColor: '#3b82f6',
          borderWidth: 0,
        }]
      };

      // Combinar todas las estadísticas
      const enhancedStats = {
        ...statsData,
        ordenesActivas: orderStats.inProductionOrders || 0,
        campañasPendientes: campaignStats.revision + campaignStats.borrador || 0,
        presupuestoTotal: await dashboardService.getTotalBudget(),
        crecimientoMensual: await dashboardService.getMonthlyGrowth()
      };

      // Actualizar estados solo si el componente está montado
      if (isMountedRef.current) {
        setStats(enhancedStats);
        setPieData(validChartData);
        setBarData(validMonthlyData);

        // Cargar clientes recientes
        const clients = await dashboardService.getRecentClients();
        if (isMountedRef.current) setRecentClients(clients);

        // Cargar mensajes recientes
        const messages = await dashboardService.getRecentMessages();
        if (isMountedRef.current) setRecentMessages(messages);

        // Cargar KPIs avanzados
        const kpiStats = await Promise.all([
          dashboardService.getAvgCampaignDuration(),
          clientScoringService.getClientRetentionRate(),
          orderService.getCompletionRate(),
          dashboardService.getTopPerformingMedium()
        ]);

        if (isMountedRef.current) {
          setKpiData({
            avgCampaignDuration: kpiStats[0] || 0,
            clientRetentionRate: kpiStats[1] || 0,
            orderCompletionRate: kpiStats[2] || 0,
            topPerformingMedium: kpiStats[3] || 'N/A'
          });

          setLastUpdate(new Date());
          console.log('✅ Dashboard cargado exitosamente (Fixed version)');
        }
      }

    } catch (error) {
      console.error('❌ Error general cargando dashboard:', error);
      
      // En caso de error, mostrar gráficos con datos de fallback
      if (isMountedRef.current) {
        setPieData({
          labels: ['Sin datos'],
          datasets: [{
            data: [100],
            backgroundColor: ['#cbd5e1'],
            borderWidth: 0,
          }]
        });
        
        setBarData({
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          datasets: [{
            label: 'Campañas',
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: '#3b82f6',
            borderWidth: 0,
          }]
        });
      }
    } finally {
      loadingRef.current = false;
      if (isMountedRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  };

  const handleManualRefresh = async () => {
    if (isRefreshing || loadingRef.current) {
      console.log('🔄 Ya se está actualizando, evitando múltiples clics');
      return;
    }
    
    console.log('🔄 Iniciando refresh manual del dashboard (Fixed)');
    setIsRefreshing(true);
    setLoading(true);
    
    try {
      await loadDashboardData();
    } catch (error) {
      console.error('❌ Error en refresh manual:', error);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ejecutar solo una vez al montar el componente
    console.log('🚀 DashboardFixed useEffect - Carga inicial única');
    loadDashboardData();
    
    // ABSOLUTAMENTE SIN ACTUALIZACIONES AUTOMÁTICAS
    // Los gráficos permanecen estáticos después de la carga inicial
    
    return () => {
      isMountedRef.current = false;
      loadingRef.current = false;
      console.log('🧹 DashboardFixed desmontado');
    };
  }, []); // Array vacío = ejecutar solo una vez

  const getTrendIcon = (value) => {
    if (value > 0) return <TrendingUpIcon sx={{ color: 'green', fontSize: 16 }} />;
    if (value < 0) return <TrendingDownIcon sx={{ color: 'red', fontSize: 16 }} />;
    return null;
  };

  // VERSIÓN MÓVIL
  if (isMobile) {
    return (
      <>
        {/* Header */}
        <Box sx={{ p: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '0 0 16px 16px', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography component="div" variant="h6" sx={{ fontWeight: 'bold' }} style={{ color: '#fff' }}>
                Dashboard General (Fixed)
              </Typography>
              <Typography component="div" variant="caption" sx={{ opacity: 0.8 }} style={{ color: '#fff' }}>
                Última actualización: {lastUpdate.toLocaleTimeString()}
              </Typography>
            </Box>
            <Tooltip title="Actualizar datos">
              <IconButton
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                sx={{
                  color: 'white',
                  background: 'rgba(255,255,255,0.1)',
                  '&.Mui-disabled': {
                    color: 'rgba(255,255,255,0.5)',
                    background: 'rgba(255,255,255,0.05)'
                  }
                }}
              >
                <RefreshIcon sx={{
                  animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
                }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Cards KPI principales */}
        <Box sx={{ p: 2, pt: 0 }}>
          <MobileCard
            title="Clientes"
            value={loading ? '...' : stats.clientes.toLocaleString()}
            titleColor="white"
            subtitle={`${stats.crecimientoMensual?.toFixed(1)}% este mes`}
            trend={stats.crecimientoMensual > 0 ? 'up' : stats.crecimientoMensual < 0 ? 'down' : null}
            trendValue={`${Math.abs(stats.crecimientoMensual || 0).toFixed(1)}%`}
            icon={<PeopleIcon sx={{ fontSize: 28, color: 'white' }} />}
            color="primary"
          />
          <MobileCard
            title="Campañas"
            value={loading ? '...' : stats.campanas.toLocaleString()}
            titleColor="white"
            subtitle={`${stats.campañasPendientes} pendientes`}
            icon={<CampaignIcon sx={{ fontSize: 28, color: 'white' }} />}
            color="secondary"
            chips={[{ label: `${stats.campañasPendientes} pendientes`, color: stats.campañasPendientes > 5 ? 'warning' : 'success' }]}
          />
          <MobileCard
            title="Órdenes Activas"
            value={loading ? '...' : stats.ordenesActivas.toLocaleString()}
            titleColor="white"
            subtitle={`Completación: ${kpiData.orderCompletionRate}%`}
            icon={<ShoppingCartIcon sx={{ fontSize: 28, color: 'white' }} />}
            color="success"
            progress="Tasa de Completación"
            progressValue={kpiData.orderCompletionRate}
          />
          <MobileCard
            title="Presupuesto Total"
            value={loading ? '...' : `$${stats.presupuestoTotal ? Math.round(stats.presupuestoTotal / 1000000).toLocaleString('es-CL') : '0'}M`}
            titleColor="white"
            subtitle={`Duración promedio: ${kpiData.avgCampaignDuration} días`}
            icon={<AttachMoneyIcon sx={{ fontSize: 28, color: 'white' }} />}
            color="warning"
          />

          {/* Gráficos */}
          <MobileCard
            title="Distribución de Clientes"
            subtitle="Por inversión"
            titleColor="white"
            icon={<PeopleIcon sx={{ fontSize: 28, color: 'white' }} />}
            color="info"
          >
            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {loading ? (
                <div className="modern-loading"></div>
              ) : (
                <Box sx={{ width: '100%', height: '100%', maxWidth: '300px' }}>
                  <Pie key="pie-chart-fixed-mobile" data={pieData} options={pieOptions} />
                </Box>
              )}
            </Box>
          </MobileCard>

          <MobileCard
            title="Campañas por Mes"
            subtitle="Últimos 6 meses"
            titleColor="white"
            icon={<CampaignIcon sx={{ fontSize: 28, color: 'white' }} />}
            color="secondary"
          >
            <Box sx={{ height: 200, mt: 2 }}>
              {loading ? (
                <div className="modern-loading"></div>
              ) : (
                <Bar key="bar-chart-fixed-mobile" data={barData} options={barOptions} />
              )}
            </Box>
          </MobileCard>
        </Box>
      </>
    );
  }

  // VERSIÓN ESCRITORIO
  return (
    <div className="dashboard animate-fade-in">
      {/* Header con última actualización */}
      <div className="modern-header animate-slide-down">
        <div className="modern-title">
          DASHBOARD GENERAL (FIXED)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Última actualización:
            </Typography>
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
              {lastUpdate.toLocaleTimeString()}
            </Typography>
          </Box>
          <Tooltip title="Actualizar datos">
            <IconButton
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              size="small"
              className="modern-btn-outline"
              sx={{
                borderRadius: '50%',
                '&.Mui-disabled': {
                  opacity: 0.5,
                  color: 'rgba(255,255,255,0.5)'
                }
              }}
            >
              <RefreshIcon sx={{
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
              }} />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Grid de estadísticas mejoradas */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3} className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Card className="modern-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography color="textSecondary" gutterBottom variant="overline" className="text-gradient">
                    Clientes
                  </Typography>
                  <Typography variant="h4" component="div" className="text-gradient" sx={{ fontWeight: 700 }}>
                    {loading ? '...' : stats.clientes.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {getTrendIcon(stats.crecimientoMensual)}
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {stats.crecimientoMensual?.toFixed(1)}% este mes
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
                  flexShrink: 0
                }}>
                  <PeopleIcon sx={{ fontSize: 32, color: 'white' }} className="icon-hover animate-pulse" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Card className="modern-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography color="textSecondary" gutterBottom variant="overline" className="text-gradient">
                    Campañas
                  </Typography>
                  <Typography variant="h4" component="div" className="text-gradient" sx={{ fontWeight: 700 }}>
                    {loading ? '...' : stats.campanas.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Chip
                      label={`${stats.campañasPendientes} pendientes`}
                      size="small"
                      color={stats.campañasPendientes > 5 ? 'warning' : 'success'}
                      className="animate-pulse"
                      sx={{
                        background: stats.campañasPendientes > 5 ? 'var(--gradient-warning)' : 'var(--gradient-success)',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Box>
                <Box sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'var(--gradient-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(247, 107, 138, 0.3)',
                  flexShrink: 0
                }}>
                  <CampaignIcon sx={{ fontSize: 32, color: 'white' }} className="icon-hover animate-pulse" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Card className="modern-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography color="textSecondary" gutterBottom variant="overline" className="text-gradient">
                    Órdenes Activas
                  </Typography>
                  <Typography variant="h4" component="div" className="text-gradient" sx={{ fontWeight: 700 }}>
                    {loading ? '...' : stats.ordenesActivas.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Completación: {kpiData.orderCompletionRate}%
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'var(--gradient-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(79, 172, 254, 0.3)',
                  flexShrink: 0
                }}>
                  <ShoppingCartIcon sx={{ fontSize: 32, color: 'white' }} className="icon-hover animate-pulse" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Card className="modern-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography color="textSecondary" gutterBottom variant="overline" className="text-gradient">
                    Presupuesto Total
                  </Typography>
                  <Typography variant="h4" component="div" className="text-gradient" sx={{ fontWeight: 700 }}>
                    {loading ? '...' : `$${stats.presupuestoTotal ? Math.round(stats.presupuestoTotal / 1000000).toLocaleString('es-CL') : '0'}M`}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Duración promedio: {kpiData.avgCampaignDuration} días
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'var(--gradient-warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(250, 112, 154, 0.3)',
                  flexShrink: 0
                }}>
                  <AttachMoneyIcon sx={{ fontSize: 32, color: 'white' }} className="icon-hover animate-pulse" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Grid de gráficos */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Gráfico de distribución de clientes */}
        <Grid item xs={12} md={6} className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <Card className="modern-card" sx={{ height: 'auto', maxHeight: { xs: 350, sm: 400, md: 450 } }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom className="text-gradient" sx={{ fontWeight: 600, mb: 2, fontSize: '1.1rem' }}>
                Distribución de Clientes por Inversión
              </Typography>
              <Box sx={{ height: { xs: 250, sm: 300, md: 330 }, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <div className="modern-loading"></div>
                  </Box>
                ) : (
                  <Box sx={{ width: '100%', height: '100%', maxWidth: '380px', maxHeight: '380px' }}>
                    <Pie key="pie-chart-fixed" data={pieData} options={pieOptions} />
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de campañas mensuales */}
        <Grid item xs={12} md={6} className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <Card className="modern-card" sx={{ height: 'auto', maxHeight: { xs: 350, sm: 400, md: 450 } }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom className="text-gradient" sx={{ fontWeight: 600, mb: 2, fontSize: '1.1rem' }}>
                Campañas por Mes (Últimos 6 meses)
              </Typography>
              <Box sx={{ height: { xs: 250, sm: 300, md: 330 }, position: 'relative' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <div className="modern-loading"></div>
                  </Box>
                ) : (
                  <Bar key="bar-chart-fixed" data={barData} options={barOptions} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default DashboardFixed;