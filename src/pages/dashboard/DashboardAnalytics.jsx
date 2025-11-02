
/**
 * Dashboard Analytics con Métricas Avanzadas
 * Proporciona visualización completa del rendimiento del sistema
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Timeline as TimelineIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../../config/supabase';
import { SweetAlertUtils } from '../../utils/sweetAlertUtils';

const DashboardAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [periodo, setPeriodo] = useState('30d');
  const [datos, setDatos] = useState({
    generales: {},
    graficos: {
      tendenciasOrdenes: [],
      rentabilidadMensual: [],
      distribucionEstados: [],
      rendimientoClientes: [],
      actividadUsuarios: []
    },
    alertas: []
  });

  useEffect(() => {
    cargarDatosDashboard();
  }, [periodo]);

  const cargarDatosDashboard = async () => {
    setLoading(true);
    try {
      // Cargar métricas generales
      const generales = await cargarMetricasGenerales();
      
      // Cargar datos para gráficos
      const graficos = await cargarDatosGraficos();
      
      // Cargar alertas
      const alertas = await cargarAlertas();

      setDatos({
        generales,
        graficos,
        alertas
      });
    } catch (error) {
      console.error('Error cargando dashboard:', error);
      SweetAlertUtils.showError('Error', 'No se pudieron cargar los datos del dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarMetricasGenerales = async () => {
    try {
      const [clientesCount, ordenesCount, campañasCount, proveedoresCount] = await Promise.all([
        supabase.from('clientes').select('id', { count: 'exact', head: true }),
        supabase.from('ordenesdepublicidad').select('id', { count: 'exact', head: true }),
        supabase.from('campania').select('id', { count: 'exact', head: true }),
        supabase.from('proveedores').select('id', { count: 'exact', head: true })
      ]);

      // Obtener métricas financieras
      const { data: ordenesFinancieras } = await supabase
        .from('ordenesdepublicidad')
        .select('monto_total, created_at')
        .gte('created_at', getFechaInicioPeriodo());

      const montoTotal = ordenesFinancieras?.reduce((sum, orden) => sum + (orden.monto_total || 0), 0) || 0;
      const ordenPromedio = ordenesFinancieras?.length > 0 ? montoTotal / ordenesFinancieras.length : 0;

      // Obtener órdenes por estado
      const { data: ordenesPorEstado } = await supabase
        .from('ordenesdepublicidad')
        .select('estado')
        .gte('created_at', getFechaInicioPeriodo());

      const estadosCount = ordenesPorEstado?.reduce((acc, orden) => {
        acc[orden.estado] = (acc[orden.estado] || 0) + 1;
        return acc;
      }, {});

      return {
        totalClientes: clientesCount.count || 0,
        totalOrdenes: ordenesCount.count || 0,
        totalCampañas: campañasCount.count || 0,
        totalProveedores: proveedoresCount.count || 0,
        montoTotal,
        ordenPromedio,
        ordenesPorEstado: estadosCount,
        tasaConversion: calcularTasaConversion(),
        crecimientoMensual: await calcularCrecimientoMensual()
      };
    } catch (error) {
      console.error('Error cargando métricas generales:', error);
      return {};
    }
  };

  const cargarDatosGraficos = async () => {
    try {
      // Tendencias de órdenes (últimos 30 días)
      const tendenciasOrdenes = await cargarTendenciasOrdenes();
      
      // Rentabilidad mensual
      const rentabilidadMensual = await cargarRentabilidadMensual();
      
      // Distribución de estados
      const distribucionEstados = await cargarDistribucionEstados();
      
      // Rendimiento por cliente
      const rendimientoClientes = await cargarRendimientoClientes();
      
      // Actividad de usuarios
      const actividadUsuarios = await cargarActividadUsuarios();

      return {
        tendenciasOrdenes,
        rentabilidadMensual,
        distribucionEstados,
        rendimientoClientes,
        actividadUsuarios
      };
    } catch (error) {
      console.error('Error cargando datos gráficos:', error);
      return {
        tendenciasOrdenes: [],
        rentabilidadMensual: [],
        distribucionEstados: [],
        rendimientoClientes: [],
        actividadUsuarios: []
      };
    }
  };

  const cargarTendenciasOrdenes = async () => {
    try {
      const { data } = await supabase
        .from('ordenesdepublicidad')
        .select('created_at, monto_total, estado')
        .gte('created_at', subDays(new Date(), 30).toISOString())
        .order('created_at', { ascending: true });

      if (!data || data.length === 0) return [];

      // Agrupar por día
      const tendenciasPorDia = data.reduce((acc, orden) => {
        const dia = format(new Date(orden.created_at), 'dd/MM');
        if (!acc[dia]) {
          acc[dia] = { fecha: dia, ordenes: 0, monto: 0 };
        }
        acc[dia].ordenes += 1;
        acc[dia].monto += orden.monto_total || 0;
        return acc;
      }, {});

      return Object.values(tendenciasPorDia);
    } catch (error) {
      console.error('Error cargando tendencias de órdenes:', error);
      return [];
    }
  };

  const cargarRentabilidadMensual = async () => {
    try {
      const { data } = await supabase
        .from('ordenesdepublicidad')
        .select('created_at, monto_total')
        .gte('created_at', startOfMonth(new Date()).toISOString())
        .lte('created_at', endOfMonth(new Date()).toISOString());

      if (!data || data.length === 0) return [];

      // Agrupar por semana del mes
      const rentabilidadPorSemana = data.reduce((acc, orden) => {
        const semana = Math.ceil(new Date(orden.created_at).getDate() / 7);
        if (!acc[semana]) {
          acc[semana] = { semana: `Semana ${semana}`, monto: 0 };
        }
        acc[semana].monto += orden.monto_total || 0;
        return acc;
      }, {});

      return Object.values(rentabilidadPorSemana);
    } catch (error) {
      console.error('Error cargando rentabilidad mensual:', error);
      return [];
    }
  };

  const cargarDistribucionEstados = async () => {
    try {
      const { data } = await supabase
        .from('ordenesdepublicidad')
        .select('estado')
        .gte('created_at', getFechaInicioPeriodo());

      if (!data || data.length === 0) return [];

      const distribucion = data.reduce((acc, orden) => {
        const estado = orden.estado || 'desconocido';
        acc[estado] = (acc[estado] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(distribucion).map(([estado, count]) => ({
        name: estado.charAt(0).toUpperCase() + estado.slice(1),
        value: count
      }));
    } catch (error) {
      console.error('Error cargando distribución de estados:', error);
      return [];
    }
  };

  const cargarRendimientoClientes = async () => {
    try {
      const { data } = await supabase
        .from('ordenesdepublicidad')
        .select(`
          monto_total,
          created_at,
          Clientes!inner(nombrecliente)
        `)
        .gte('created_at', getFechaInicioPeriodo())
        .limit(10);

      if (!data || data.length === 0) return [];

      const rendimientoPorCliente = data.reduce((acc, orden) => {
        const cliente = orden.Clientes?.nombrecliente || 'Desconocido';
        if (!acc[cliente]) {
          acc[cliente] = { cliente, monto: 0, ordenes: 0 };
        }
        acc[cliente].monto += orden.monto_total || 0;
        acc[cliente].ordenes += 1;
        return acc;
      }, {});

      return Object.values(rendimientoPorCliente)
        .sort((a, b) => b.monto - a.monto)
        .slice(0, 10);
    } catch (error) {
      console.error('Error cargando rendimiento por clientes:', error);
      return [];
    }
  };

  const cargarActividadUsuarios = async () => {
    try {
      // Simulación de datos de actividad de usuarios
      return [
        { dia: 'Lun', actividad: 45 },
        { dia: 'Mar', actividad: 52 },
        { dia: 'Mié', actividad: 38 },
        { dia: 'Jue', actividad: 65 },
        { dia: 'Vie', actividad: 78 },
        { dia: 'Sáb', actividad: 25 },
        { dia: 'Dom', actividad: 15 }
      ];
    } catch (error) {
      console.error('Error cargando actividad de usuarios:', error);
      return [];
    }
  };

  const cargarAlertas = async () => {
    try {
      const alertas = [];

      // Alerta de bajo rendimiento
      if (datos.generales.tasaConversion < 10) {
        alertas.push({
          tipo: 'warning',
          titulo: 'Baja tasa de conversión',
          mensaje: `La tasa de conversión actual es del ${datos.generales.tasaConversion}%`,
          accion: 'Revisar estrategias de ventas'
        });
      }

      // Alerta de crecimiento negativo
      if (datos.generales.crecimientoMensual < 0) {
        alertas.push({
          tipo: 'error',
          titulo: 'Crecimiento negativo',
          mensaje: `El crecimiento mensual es del ${datos.generales.crecimientoMensual}%`,
          accion: 'Analizar causas y tomar medidas correctivas'
        });
      }

      // Alerta de alto volumen
      if (datos.generales.totalOrdenes > 100) {
        alertas.push({
          tipo: 'success',
          titulo: 'Alto volumen de órdenes',
          mensaje: `Se han procesado ${datos.generales.totalOrdenes} órdenes este período`,
          accion: 'Considerar optimizar procesos'
        });
      }

      return alertas;
    } catch (error) {
      console.error('Error cargando alertas:', error);
      return [];
    }
  };

  const getFechaInicioPeriodo = () => {
    const ahora = new Date();
    switch (periodo) {
      case '7d':
        return subDays(ahora, 7).toISOString();
      case '30d':
        return subDays(ahora, 30).toISOString();
      case '90d':
        return subDays(ahora, 90).toISOString();
      case '1y':
        return subDays(ahora, 365).toISOString();
      default:
        return subDays(ahora, 30).toISOString();
    }
  };

  const calcularTasaConversion = () => {
    // Simulación - en implementación real calcularía basado en campañas vs órdenes
    return 15.5;
  };

  const calcularCrecimientoMensual = async () => {
    try {
      const mesActual = new Date().getMonth();
      const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
      const añoActual = new Date().getFullYear();
      const añoAnterior = mesActual === 0 ? añoActual - 1 : añoActual;

      const [ordenesActuales, ordenesAnteriores] = await Promise.all([
        supabase
          .from('ordenesdepublicidad')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(añoActual, mesActual, 1).toISOString())
          .lt('created_at', new Date(añoActual, mesActual + 1, 1).toISOString()),
        supabase
          .from('ordenesdepublicidad')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(añoAnterior, mesAnterior, 1).toISOString())
          .lt('created_at', new Date(añoAnterior, mesAnterior + 1, 1).toISOString())
      ]);

      const crecimiento = ordenesAnteriores.count > 0
        ? ((ordenesActuales.count - ordenesAnteriores.count) / ordenesAnteriores.count) * 100
        : 0;

      return Math.round(crecimiento * 100) / 100;
    } catch (error) {
      console.error('Error calculando crecimiento mensual:', error);
      return 0;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await cargarDatosDashboard();
    setRefreshing(false);
  };

  const handleExportar = () => {
    SweetAlertUtils.showInfo('Exportación', 'Función de exportación próximamente disponible');
  };

  const getTendenciaIcon = (valor) => {
    return valor >= 0 ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />;
  };

  const getTendenciaColor = (valor) => {
    return valor >= 0 ? 'success' : 'error';
  };

  const COLORS = ['#206e43', '#6777ef', '#ff9800', '#f44336', '#9c27b0', '#00bcd4'];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#206e43' }}>
          <AssessmentIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Dashboard Analytics
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={periodo}
              label="Período"
              onChange={(e) => setPeriodo(e.target.value)}
            >
              <MenuItem value="7d">Últimos 7 días</MenuItem>
              <MenuItem value="30d">Últimos 30 días</MenuItem>
              <MenuItem value="90d">Últimos 90 días</MenuItem>
              <MenuItem value="1y">Último año</MenuItem>
            </Select>
          </FormControl>
          
          <Tooltip title="Actualizar datos">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon sx={{ transform: refreshing ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Exportar reporte">
            <IconButton onClick={handleExportar}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Alertas */}
      {datos.alertas.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {datos.alertas.map((alerta, index) => (
            <Alert
              key={index}
              severity={alerta.tipo}
              sx={{ mb: 1 }}
              action={
                <Button size="small" color="inherit">
                  {alerta.accion}
                </Button>
              }
            >
              <AlertTitle>{alerta.titulo}</AlertTitle>
              {alerta.mensaje}
            </Alert>
          ))}
        </Box>
      )}

      {/* Métricas Principales */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <PeopleIcon sx={{ fontSize: 40, color: '#6777ef' }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {datos.generales.totalClientes}
                </Typography>
              </Box>
              <Typography color="textSecondary">Total Clientes</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {getTendenciaIcon(datos.generales.crecimientoMensual)}
                <Typography variant="body2" sx={{ ml: 1, color: getTendenciaColor(datos.generales.crecimientoMensual) }}>
                  {datos.generales.crecimientoMensual}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <ShoppingCartIcon sx={{ fontSize: 40, color: '#206e43' }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {datos.generales.totalOrdenes}
                </Typography>
              </Box>
              <Typography color="textSecondary">Total Órdenes</Typography>
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((datos.generales.totalOrdenes / 100) * 100, 100)}
                  sx={{ mt: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <AttachMoneyIcon sx={{ fontSize: 40, color: '#ff9800' }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  ${datos.generales.montoTotal?.toLocaleString('es-CL') || '0'}
                </Typography>
              </Box>
              <Typography color="textSecondary">Monto Total</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Promedio: ${datos.generales.ordenPromedio?.toLocaleString('es-CL') || '0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <SpeedIcon sx={{ fontSize: 40, color: '#f44336' }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {datos.generales.tasaConversion}%
                </Typography>
              </Box>
              <Typography color="textSecondary">Tasa Conversión</Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={datos.generales.tasaConversion > 15 ? 'Buena' : 'Mejorar'}
                  color={datos.generales.tasaConversion > 15 ? 'success' : 'warning'}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Tendencias de Órdenes */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Tendencias de Órdenes
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={datos.graficos.tendenciasOrdenes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="ordenes"
                  stroke="#206e43"
                  fill="#206e43"
                  fillOpacity={0.3}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="monto"
                  stroke="#ff9800"
                  fill="#ff9800"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Distribución de Estados */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Distribución de Estados
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datos.graficos.distribucionEstados}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {datos.graficos.distribucionEstados.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Rentabilidad Mensual */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Rentabilidad Mensual
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={datos.graficos.rentabilidadMensual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semana" />
                <YAxis />
                <RechartsTooltip formatter={(value) => [`$${value.toLocaleString('es-CL')}`, 'Monto']} />
                <Bar dataKey="monto" fill="#206e43" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Clientes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Clientes por Rendimiento
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell align="right">Monto</TableCell>
                    <TableCell align="center">Órdenes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {datos.graficos.rendimientoClientes.map((cliente, index) => (
                    <TableRow key={index}>
                      <TableCell>{cliente.cliente}</TableCell>
                      <TableCell align="right">
                        ${cliente.monto.toLocaleString('es-CL')}
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={cliente.ordenes} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardAnalytics;
   