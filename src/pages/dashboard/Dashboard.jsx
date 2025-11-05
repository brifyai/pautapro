import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  TextField
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
import ChatIA from '../../components/chat/ChatIA';

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

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
          font: {
            size: 12
          },
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
        titleFont: {
          size: 16,
          weight: 'bold'
        },
        bodyFont: {
          size: 14
        },
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
      padding: {
        left: 2,
        right: 2,
        top: 2,
        bottom: 2
      }
    }
  };

  const barOptions = {
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
  };

  useEffect(() => {
    // Prevenir scroll automático al cargar el dashboard - MÉTODO ROBUSTO
    // 1. Guardar posición actual del scroll
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;
    
    // 2. Forzar scroll a la parte superior inmediatamente
    window.scrollTo(0, 0);
    
    // 3. Prevenir cualquier scroll automático durante la carga
    const preventScroll = (e) => {
      e.preventDefault();
      window.scrollTo(0, 0);
    };
    
    // 4. Bloquear scroll temporalmente
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('scroll', preventScroll, { passive: false });
    
    // 5. Cargar datos del dashboard
    loadDashboardData();

    // 6. Restaurar scroll después de cargar completamente
    setTimeout(() => {
      // Restaurar estilos de scroll
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.removeEventListener('scroll', preventScroll);
      
      // Forzar mantener posición en la parte superior
      window.scrollTo(0, 0);
      
      // Doble aseguramiento después de un pequeño delay
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 50);
    }, 200);

    // Actualización automática cada 5 minutos
    const interval = setInterval(() => {
      loadDashboardData();
      // Prevenir scroll en actualizaciones automáticas también
      setTimeout(() => window.scrollTo(0, 0), 100);
    }, 300000);
    
    return () => {
      clearInterval(interval);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.removeEventListener('scroll', preventScroll);
    };
  }, []);

  // Memoizar datos para evitar re-renders innecesarios
  const memoizedStats = useMemo(() => stats, [stats]);
  const memoizedKpiData = useMemo(() => kpiData, [kpiData]);
  const memoizedPieData = useMemo(() => pieData, [pieData]);
  const memoizedBarData = useMemo(() => barData, [barData]);

  useEffect(() => {
    // Generar alertas automáticas basadas en los datos
    generateAutomaticAlerts();
  }, [stats]);

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

    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      // No mostrar alertas de error generales, solo log en consola
    } finally {
      setLoading(false);
    }
  }, []);

  const generateAutomaticAlerts = () => {
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
  };

  const getTrendIcon = (value) => {
    if (value > 0) return <TrendingUpIcon sx={{ color: 'green', fontSize: 16 }} />;
    if (value < 0) return <TrendingDownIcon sx={{ color: 'red', fontSize: 16 }} />;
    return null;
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return <ErrorIcon />;
      case 'warning': return <WarningIcon />;
      case 'success': return <CheckCircleIcon />;
      default: return <InfoIcon />;
    }
  };

  // VERSIÓN MÓVIL: early return seguro (no toca el JSX de escritorio)
  if (isMobile) {
    return (
      <>
        {/* Header */}
        <Box sx={{ p: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '0 0 16px 16px', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography component="div" variant="h6" sx={{ fontWeight: 'bold' }} style={{ color: '#fff' }}>
                Dashboard General
              </Typography>
              <Typography component="div" variant="caption" sx={{ opacity: 0.8 }} style={{ color: '#fff' }}>
                Última actualización: {lastUpdate.toLocaleTimeString()}
              </Typography>
            </Box>
            <Tooltip title="Actualizar datos">
              <IconButton
                onClick={loadDashboardData}
                sx={{ color: 'white', background: 'rgba(255,255,255,0.1)' }}
              >
                <RefreshIcon />
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
                  <Pie data={pieData} options={pieOptions} />
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
                <Bar data={barData} options={barOptions} />
              )}
            </Box>
          </MobileCard>

          {/* Actividad / KPIs */}
          <MobileCard
            title="KPIs de Rendimiento"
            icon={<LightbulbIcon sx={{ fontSize: 28, color: 'white' }} />}
            titleColor="white"
            color="warning"
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Retención de Clientes</Typography>
                  <Typography variant="body2" fontWeight="600">{kpiData.clientRetentionRate}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={kpiData.clientRetentionRate} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Completación de Órdenes</Typography>
                  <Typography variant="body2" fontWeight="600">{kpiData.orderCompletionRate}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={kpiData.orderCompletionRate} />
              </Box>
              <Box sx={{ p: 1.5, background: 'rgba(102, 126, 234, 0.1)', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight="600">
                  🏆 Mejor Medio: {kpiData.topPerformingMedium}
                </Typography>
                <Typography variant="caption">
                  ⏱️ Duración promedio: {kpiData.avgCampaignDuration} días
                </Typography>
              </Box>
            </Box>
          </MobileCard>

          <MobileCard
            title="Actividad Reciente"
            icon={<TimelineIcon sx={{ fontSize: 28, color: 'white' }} />}
            titleColor="white"
            color="success"
          >
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {loading ? (
                <div className="modern-loading"></div>
              ) : recentMessages.length > 0 ? (
                recentMessages.map((message, index) => (
                  <Box key={index} sx={{ py: 1.5, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" fontWeight="600">
                      {message.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      📅 {message.date}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                  No hay actividad reciente
                </Typography>
              )}
            </Box>
          </MobileCard>

          <MobileCard
            title="Asistente IA"
            icon={<AssistantIcon sx={{ fontSize: 28, color: 'white' }} />}
            titleColor="white"
            color="secondary"
            sx={{ maxHeight: 600, overflow: 'hidden' }}
          >
            <Box sx={{ height: 400, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <ChatIA userRole="gerente" />
            </Box>
          </MobileCard>
        </Box>

      </>
    );
  }

  // VERSIÓN ESCRITORIO (original)
  return (
    <div className="dashboard animate-fade-in">
      {/* Header con última actualización */}
      <div className="modern-header animate-slide-down">
        <div className="modern-title">
          DASHBOARD GENERAL
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
              onClick={loadDashboardData}
              size="small"
              className="modern-btn-outline"
              sx={{ borderRadius: '50%' }}
            >
              <RefreshIcon />
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

      {/* Grid de gráficos y contenido */}
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
                    <Pie data={pieData} options={pieOptions} />
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
                  <Bar data={barData} options={barOptions} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>


        {/* Cuatro cajas del mismo tamaño en cuadrícula 2x2 */}
        <Grid item xs={12} sm={6} className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <Card className="modern-card" sx={{ height: '100%', minHeight: 400, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom className="text-gradient" sx={{ fontWeight: 600, mb: 3 }}>
                Clientes Recientes
              </Typography>
              <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.05)' }, '&::-webkit-scrollbar-thumb': { background: 'var(--gradient-primary)', borderRadius: '3px' } }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <div className="modern-loading"></div>
                  </Box>
                ) : recentClients.length > 0 ? (
                  recentClients.map((client, index) => (
                    <Box key={index} sx={{ py: 2, px: 1, borderRadius: 2, mb: 1, transition: 'all 0.3s ease', '&:hover': { background: 'rgba(102, 126, 234, 0.05)' } }} className="animate-slide-up" style={{ animationDelay: `${0.8 + index * 0.1}s` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <PeopleIcon sx={{ fontSize: 20, color: 'white' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="600" sx={{ color: '#374151' }}>
                            {client.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            📍 {client.address}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            📅 {client.created_at ? new Date(client.created_at).toLocaleDateString('es-CL', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            }) : 'Fecha no disponible'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Box sx={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(203, 213, 225, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                      <PeopleIcon sx={{ fontSize: 30, color: '#cbd5e1' }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      No hay clientes recientes
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* KPIs Avanzados */}
        <Grid item xs={12} sm={6} className="animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <Card className="modern-card" sx={{ height: '100%', minHeight: 400, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom className="text-gradient" sx={{ fontWeight: 600, mb: 3 }}>
                Indicadores Clave de Rendimiento
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Tasa de Retención de Clientes
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--gradient-success)' }}>
                      {kpiData.clientRetentionRate}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={kpiData.clientRetentionRate}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(79, 172, 254, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'var(--gradient-success)',
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Tasa de Completación de Órdenes
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: kpiData.orderCompletionRate > 80 ? 'var(--gradient-success)' : 'var(--gradient-warning)' }}>
                      {kpiData.orderCompletionRate}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={kpiData.orderCompletionRate}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(250, 112, 154, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: kpiData.orderCompletionRate > 80 ? 'var(--gradient-success)' : 'var(--gradient-warning)',
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>

                <Box sx={{ p: 2, background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
                    🏆 Medio con Mejor Rendimiento
                  </Typography>
                  <Typography variant="h6" className="text-gradient" sx={{ fontWeight: 700 }}>
                    {kpiData.topPerformingMedium}
                  </Typography>
                </Box>

                <Box sx={{ p: 2, background: 'linear-gradient(135deg, rgba(247, 107, 138, 0.1) 0%, rgba(250, 112, 154, 0.1) 100%)', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
                    ⏱️ Duración Promedio de Campañas
                  </Typography>
                  <Typography variant="h6" className="text-gradient" sx={{ fontWeight: 700 }}>
                    {kpiData.avgCampaignDuration} días
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Chat IA Asistente */}
        <Grid item xs={12} sm={6} className="animate-slide-up" style={{ animationDelay: '0.9s' }}>
          <Card className="modern-card" sx={{ height: '100%', minHeight: 400, maxHeight: 600, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', p: 2 }}>
              <ChatIA userRole="gerente" />
            </CardContent>
          </Card>
        </Grid>

        {/* Mensajes recientes */}
        <Grid item xs={12} sm={6} className="animate-slide-up" style={{ animationDelay: '1.0s' }}>
          <Card className="modern-card" sx={{ height: '100%', minHeight: 400, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom className="text-gradient" sx={{ fontWeight: 600, mb: 3 }}>
                Actividad Reciente
              </Typography>
              <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.05)' }, '&::-webkit-scrollbar-thumb': { background: 'var(--gradient-primary)', borderRadius: '3px' } }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <div className="modern-loading"></div>
                  </Box>
                ) : recentMessages.length > 0 ? (
                  recentMessages.map((message, index) => (
                    <Box key={index} sx={{ py: 2, px: 1, borderRadius: 2, mb: 1, transition: 'all 0.3s ease', '&:hover': { background: 'rgba(102, 126, 234, 0.05)' } }} className="animate-slide-up" style={{ animationDelay: `${1.1 + index * 0.1}s` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <TimelineIcon sx={{ fontSize: 20, color: 'white' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="600" sx={{ color: '#374151' }}>
                            {message.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            📅 {message.date}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Box sx={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(203, 213, 225, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                      <TimelineIcon sx={{ fontSize: 30, color: '#cbd5e1' }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
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

export default Dashboard;