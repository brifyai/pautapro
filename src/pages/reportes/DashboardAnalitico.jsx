import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Breadcrumbs,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  Box,
  Chip,
  Rating,
  LinearProgress,
  Button
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { supabase } from '../../config/supabase';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as RouterLink } from 'react-router-dom';
import * as XLSX from 'xlsx';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CampaignIcon from '@mui/icons-material/Campaign';
import TvIcon from '@mui/icons-material/Tv';
import BusinessIcon from '@mui/icons-material/Business';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import '../clientes/Clientes.css';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function DashboardAnalitico() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [periodoAnalisis, setPeriodoAnalisis] = useState('mes');
  const [campanas, setCampanas] = useState([]);
  const [medios, setMedios] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  // Estadísticas generales consolidadas
  const [estadisticasGenerales, setEstadisticasGenerales] = useState({
    totalCampañas: 0,
    totalMedios: 0,
    totalProveedores: 0,
    inversionTotal: 0,
    rendimientoPromedio: 0,
    roiPromedio: 0
  });

  // Métricas detalladas
  const [metricasCampañas, setMetricasCampañas] = useState([]);
  const [metricasMedios, setMetricasMedios] = useState([]);
  const [metricasProveedores, setMetricasProveedores] = useState([]);

  useEffect(() => {
    cargarDashboardGeneral();
  }, [periodoAnalisis]);

  useEffect(() => {
    if (tabValue === 0) cargarMetricasCampañas();
    if (tabValue === 1) cargarMetricasMedios();
    if (tabValue === 2) cargarMetricasProveedores();
  }, [tabValue, periodoAnalisis]);

  const cargarDashboardGeneral = async () => {
    setLoading(true);
    try {
      // Cargar todas las métricas en paralelo
      const [campañasData, mediosData, proveedoresData] = await Promise.all([
        cargarCampañasConMetricas(),
        cargarMediosConMetricas(),
        cargarProveedoresConMetricas()
      ]);

      setCampanas(campañasData);
      setMedios(mediosData);
      setProveedores(proveedoresData);

      // Calcular estadísticas generales consolidadas
      const totalInversion = [
        ...campañasData.map(c => c.inversionTotal || 0),
        ...mediosData.map(m => m.inversionTotal || 0),
        ...proveedoresData.map(p => p.volumenNegocios || 0)
      ].reduce((sum, val) => sum + val, 0);

      const rendimientoPromedio = (
        campañasData.reduce((sum, c) => sum + (c.rendimiento || 0), 0) / campañasData.length +
        mediosData.reduce((sum, m) => sum + (m.efectividad || 0), 0) / mediosData.length +
        proveedoresData.reduce((sum, p) => sum + (p.cumplimientoPlazos || 0), 0) / proveedoresData.length
      ) / 3;

      const roiPromedio = (
        campañasData.reduce((sum, c) => sum + parseFloat(c.roi || 0), 0) / campañasData.length
      );

      setEstadisticasGenerales({
        totalCampañas: campañasData.length,
        totalMedios: mediosData.length,
        totalProveedores: proveedoresData.length,
        inversionTotal: totalInversion,
        rendimientoPromedio: rendimientoPromedio || 0,
        roiPromedio: roiPromedio || 0
      });

    } catch (error) {
      console.error('Error cargando dashboard general:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarCampañasConMetricas = async () => {
    try {
      const { data, error } = await supabase
        .from('campania')
        .select(`
          *,
          clientes!inner (
            id_cliente,
            nombrecliente,
            razonsocial
          ),
          ordenesdepublicidad (
            id_ordenes_de_comprar,
            estado,
            monto_total,
            fechaCreacion,
            created_at,
            alternativas_plan_orden
          )
        `)
        .order('fechaCreacion', { ascending: false });

      if (error) throw error;

      const campanasConMetricas = await Promise.all(
        data.map(async (campana) => {
          const metricas = await calcularMetricasRealesCampana(campana);
          
          return {
            ...campana,
            id: campana.id_campania,
            nombre: campana.NombreCampania || campana.nombrecampania,
            fechaInicio: campana.fechaCreacion,
            fechaFin: campana.fechaCreacion,
            rendimiento: metricas.rendimiento,
            impactoEstimado: metricas.impactoEstimado,
            roi: metricas.roi,
            totalOrdenes: metricas.totalOrdenes,
            inversionTotal: metricas.inversionTotal,
            ordenesActivas: metricas.ordenesActivas,
            ordenesCompletadas: metricas.ordenesCompletadas
          };
        })
      );

      return campanasConMetricas;
    } catch (error) {
      console.error('Error cargando campañas con métricas:', error);
      return [];
    }
  };

  const cargarMediosConMetricas = async () => {
    try {
      const { data: mediosData, error: mediosError } = await supabase
        .from('medios')
        .select(`
          *,
          contratos (
            id,
            num_contrato,
            id_proveedor
          )
        `);

      if (mediosError) throw mediosError;

      const mediosConMetricas = await Promise.all(
        mediosData.map(async (medio) => {
          const metricas = await calcularMetricasRealesMedio(medio);
          
          return {
            ...medio,
            id: medio.id,
            nombre: medio.NombredelMedio || medio.nombredelmedio,
            alcance: metricas.alcance,
            efectividad: metricas.efectividad,
            inversionTotal: metricas.inversionTotal,
            frecuenciaUso: metricas.frecuenciaUso,
            totalContratos: metricas.totalContratos,
            totalOrdenes: metricas.totalOrdenes,
            ordenesActivas: metricas.ordenesActivas,
            proveedoresAsociados: metricas.proveedoresAsociados
          };
        })
      );

      return mediosConMetricas;
    } catch (error) {
      console.error('Error cargando medios con métricas:', error);
      return [];
    }
  };

  const cargarProveedoresConMetricas = async () => {
    try {
      const { data: proveedoresData, error: proveedoresError } = await supabase
        .from('proveedores')
        .select(`
          *,
          contratos (
            id,
            num_contrato
          )
        `);

      if (proveedoresError) throw proveedoresError;

      const proveedoresConMetricas = await Promise.all(
        proveedoresData.map(async (proveedor) => {
          const metricas = await calcularMetricasRealesProveedor(proveedor);
          
          return {
            ...proveedor,
            id: proveedor.id_proveedor,
            nombre: proveedor.nombreproveedor || proveedor.nombre,
            cumplimientoPlazos: metricas.cumplimientoPlazos,
            calidadServicio: metricas.calidadServicio,
            volumenNegocios: metricas.volumenNegocios,
            satisfaccionCliente: metricas.satisfaccionCliente,
            totalContratos: metricas.totalContratos,
            totalOrdenes: metricas.totalOrdenes,
            ordenesActivas: metricas.ordenesActivas,
            inversionTotal: metricas.inversionTotal
          };
        })
      );

      return proveedoresConMetricas;
    } catch (error) {
      console.error('Error cargando proveedores con métricas:', error);
      return [];
    }
  };

  const calcularMetricasRealesCampana = async (campana) => {
    try {
      const ordenes = campana.ordenesdepublicidad || [];
      
      const totalOrdenes = ordenes.length;
      const ordenesActivas = ordenes.filter(o => o.estado === 'activa' || o.estado === null || o.estado === '').length;
      const ordenesCompletadas = ordenes.filter(o => o.estado === 'completada').length;
      
      let inversionTotal = 0;
      for (const orden of ordenes) {
        if (orden.monto_total) {
          inversionTotal += orden.monto_total;
        } else {
          if (orden.alternativas_plan_orden) {
            const alternativasIds = typeof orden.alternativas_plan_orden === 'string'
              ? JSON.parse(orden.alternativas_plan_orden)
              : orden.alternativas_plan_orden;
            
            if (Array.isArray(alternativasIds)) {
              const { data: alternativas } = await supabase
                .from('alternativa')
                .select('total_general, total_neto')
                .in('id', alternativasIds);
              
              if (alternativas) {
                inversionTotal += alternativas.reduce((sum, alt) => sum + (alt.total_neto || alt.total_general || 0), 0);
              }
            }
          }
        }
      }

      const rendimiento = totalOrdenes > 0
        ? (ordenesCompletadas / totalOrdenes) * 100
        : 0;

      const impactoEstimado = inversionTotal > 0
        ? Math.floor(inversionTotal * 1.5)
        : 0;

      const roi = inversionTotal > 0
        ? ((impactoEstimado - inversionTotal) / inversionTotal * 100).toFixed(2)
        : 0;

      return {
        rendimiento,
        impactoEstimado,
        roi,
        totalOrdenes,
        inversionTotal,
        ordenesActivas,
        ordenesCompletadas
      };
    } catch (error) {
      console.error('Error calculando métricas reales de campaña:', error);
      return {
        rendimiento: 0,
        impactoEstimado: 0,
        roi: 0,
        totalOrdenes: 0,
        inversionTotal: 0,
        ordenesActivas: 0,
        ordenesCompletadas: 0
      };
    }
  };

  const calcularMetricasRealesMedio = async (medio) => {
    try {
      const contratos = medio.contratos || [];
      
      // Obtener órdenes directamente para este medio
      const { data: ordenesDelMedio } = await supabase
        .from('ordenesdepublicidad')
        .select('id_ordenes_de_comprar, estado, monto_total, alternativas_plan_orden')
        .eq('id_medio', medio.id);

      const totalContratos = contratos.length;
      const totalOrdenes = ordenesDelMedio?.length || 0;
      const ordenesActivas = ordenesDelMedio?.filter(o => o.estado === 'activa' || o.estado === null || o.estado === '').length || 0;

      let inversionTotal = 0;
      if (ordenesDelMedio) {
        for (const orden of ordenesDelMedio) {
          if (orden.monto_total) {
            inversionTotal += orden.monto_total;
          } else {
            if (orden.alternativas_plan_orden) {
              const alternativasIds = typeof orden.alternativas_plan_orden === 'string'
                ? JSON.parse(orden.alternativas_plan_orden)
                : orden.alternativas_plan_orden;
              
              if (Array.isArray(alternativasIds)) {
                const { data: alternativas } = await supabase
                  .from('alternativa')
                  .select('total_general, total_neto')
                  .in('id', alternativasIds);
                
                if (alternativas) {
                  inversionTotal += alternativas.reduce((sum, alt) => sum + (alt.total_neto || alt.total_general || 0), 0);
                }
              }
            }
          }
        }
      }

      const frecuenciaUso = totalOrdenes;
      const efectividad = totalOrdenes > 0
        ? ((ordenesActivas / totalOrdenes) * 100).toFixed(2)
        : 0;

      const alcance = inversionTotal > 0
        ? Math.floor(inversionTotal * 2.5)
        : 0;

      return {
        alcance,
        efectividad,
        inversionTotal,
        frecuenciaUso,
        totalContratos,
        totalOrdenes,
        ordenesActivas,
        proveedoresAsociados: contratos.length // Simplificado: número de contratos como proxy
      };
    } catch (error) {
      console.error('Error calculando métricas reales del medio:', error);
      return {
        alcance: 0,
        efectividad: 0,
        inversionTotal: 0,
        frecuenciaUso: 0,
        totalContratos: 0,
        totalOrdenes: 0,
        ordenesActivas: 0,
        proveedoresAsociados: 0
      };
    }
  };

  const calcularMetricasRealesProveedor = async (proveedor) => {
    try {
      const contratos = proveedor.contratos || [];
      
      // Obtener órdenes directamente para este proveedor
      const { data: ordenesDelProveedor } = await supabase
        .from('ordenesdepublicidad')
        .select('id_ordenes_de_comprar, estado, monto_total, alternativas_plan_orden')
        .eq('id_proveedor', proveedor.id_proveedor);

      const totalContratos = contratos.length;
      const totalOrdenes = ordenesDelProveedor?.length || 0;
      const ordenesActivas = ordenesDelProveedor?.filter(o => o.estado === 'activa' || o.estado === null || o.estado === '').length || 0;

      let inversionTotal = 0;
      if (ordenesDelProveedor) {
        for (const orden of ordenesDelProveedor) {
          if (orden.monto_total) {
            inversionTotal += orden.monto_total;
          } else {
            if (orden.alternativas_plan_orden) {
              const alternativasIds = typeof orden.alternativas_plan_orden === 'string'
                ? JSON.parse(orden.alternativas_plan_orden)
                : orden.alternativas_plan_orden;
              
              if (Array.isArray(alternativasIds)) {
                const { data: alternativas } = await supabase
                  .from('alternativa')
                  .select('total_general, total_neto')
                  .in('id', alternativasIds);
                
                if (alternativas) {
                  inversionTotal += alternativas.reduce((sum, alt) => sum + (alt.total_neto || alt.total_general || 0), 0);
                }
              }
            }
          }
        }
      }

      const cumplimientoPlazos = totalOrdenes > 0
        ? ((ordenesActivas / totalOrdenes) * 100).toFixed(2)
        : 0;

      let calidadServicio = 0;
      if (totalContratos > 0 && inversionTotal > 0) {
        const avgInversionPerContract = inversionTotal / totalContratos;
        calidadServicio = Math.min(5, Math.max(1,
          (avgInversionPerContract > 1000000 ? 5 :
           avgInversionPerContract > 500000 ? 4 :
           avgInversionPerContract > 100000 ? 3 :
           avgInversionPerContract > 50000 ? 2 : 1)
        )).toFixed(1);
      }

      const volumenNegocios = inversionTotal;
      const satisfaccionCliente = (parseFloat(cumplimientoPlazos) * 0.6 + (parseFloat(calidadServicio) / 5 * 100) * 0.4).toFixed(2);

      return {
        cumplimientoPlazos,
        calidadServicio,
        volumenNegocios,
        satisfaccionCliente,
        totalContratos,
        totalOrdenes,
        ordenesActivas,
        inversionTotal
      };
    } catch (error) {
      console.error('Error calculando métricas reales del proveedor:', error);
      return {
        cumplimientoPlazos: 0,
        calidadServicio: 0,
        volumenNegocios: 0,
        satisfaccionCliente: 0,
        totalContratos: 0,
        totalOrdenes: 0,
        ordenesActivas: 0,
        inversionTotal: 0
      };
    }
  };

  const cargarMetricasCampañas = async () => {
    const data = await cargarCampañasConMetricas();
    setMetricasCampañas(data);
  };

  const cargarMetricasMedios = async () => {
    const data = await cargarMediosConMetricas();
    setMetricasMedios(data);
  };

  const cargarMetricasProveedores = async () => {
    const data = await cargarProveedoresConMetricas();
    setMetricasProveedores(data);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const exportarExcel = (tipoReporte) => {
    try {
      let datosExportar = [];
      let nombreArchivo = '';

      switch (tipoReporte) {
        case 'campañas':
          datosExportar = metricasCampañas.map(campaña => ({
            'Nombre Campaña': campaña.nombre,
            'Cliente': campaña.clientes?.nombrecliente || 'Sin cliente',
            'Fecha Inicio': format(new Date(campaña.fechaInicio), 'dd/MM/yyyy'),
            'Total Órdenes': campaña.totalOrdenes,
            'Órdenes Activas': campaña.ordenesActivas,
            'Órdenes Completadas': campaña.ordenesCompletadas,
            'Inversión Total': new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
              minimumFractionDigits: 0
            }).format(campaña.inversionTotal),
            'Rendimiento': `${campaña.rendimiento.toFixed(2)}%`,
            'Impacto Estimado': campaña.impactoEstimado.toLocaleString(),
            'ROI': `${campaña.roi}%`
          }));
          nombreArchivo = 'analisis_campanas';
          break;

        case 'medios':
          datosExportar = metricasMedios.map(medio => ({
            'Medio': medio.nombre,
            'Alcance': medio.alcance.toLocaleString(),
            'Efectividad': `${medio.efectividad}%`,
            'Inversión Total': new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
              minimumFractionDigits: 0
            }).format(medio.inversionTotal),
            'Frecuencia Uso': `${medio.frecuenciaUso} veces`,
            'Total Contratos': medio.totalContratos,
            'Total Órdenes': medio.totalOrdenes,
            'Órdenes Activas': medio.ordenesActivas,
            'Proveedores Asociados': medio.proveedoresAsociados
          }));
          nombreArchivo = 'analisis_medios';
          break;

        case 'proveedores':
          datosExportar = metricasProveedores.map(proveedor => ({
            'Proveedor': proveedor.nombre,
            'Cumplimiento Plazos': `${proveedor.cumplimientoPlazos}%`,
            'Calidad Servicio': proveedor.calidadServicio,
            'Volumen Negocios': new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
              minimumFractionDigits: 0
            }).format(proveedor.volumenNegocios),
            'Satisfacción Cliente': `${proveedor.satisfaccionCliente}%`,
            'Total Contratos': proveedor.totalContratos,
            'Total Órdenes': proveedor.totalOrdenes,
            'Órdenes Activas': proveedor.ordenesActivas,
            'Inversión Total': new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
              minimumFractionDigits: 0
            }).format(proveedor.inversionTotal)
          }));
          nombreArchivo = 'analisis_proveedores';
          break;
      }

      const ws = XLSX.utils.json_to_sheet(datosExportar);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Análisis');

      const fechaActual = new Date().toLocaleDateString('es-CL');
      XLSX.writeFile(wb, `${nombreArchivo}_${fechaActual}.xlsx`);

    } catch (error) {
      console.error('Error exportando a Excel:', error);
    }
  };

  const columnasCampañas = [
    { field: 'nombre', headerName: 'Campaña', width: 250 },
    { field: 'totalOrdenes', headerName: 'Total Órdenes', width: 120 },
    { field: 'ordenesActivas', headerName: 'Órdenes Activas', width: 130 },
    { field: 'ordenesCompletadas', headerName: 'Órdenes Completadas', width: 150 },
    {
      field: 'inversionTotal',
      headerName: 'Inversión Total',
      width: 150,
      renderCell: (params) => new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
      }).format(params.value || 0)
    },
    {
      field: 'rendimiento',
      headerName: 'Rendimiento',
      width: 130,
      renderCell: (params) => {
        const value = params.value || 0;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={value} 
              sx={{ width: 60 }}
            />
            <Typography variant="body2">{value.toFixed(2)}%</Typography>
          </Box>
        );
      }
    },
    {
      field: 'roi',
      headerName: 'ROI',
      width: 120,
      renderCell: (params) => {
        const value = parseFloat(params.value) || 0;
        const color = value >= 0 ? '#4caf50' : '#f44336';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {value >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
            <Typography variant="body2" sx={{ color, fontWeight: 'bold' }}>
              {value.toFixed(2)}%
            </Typography>
          </Box>
        );
      }
    }
  ];

  const columnasMedios = [
    { field: 'nombre', headerName: 'Medio', width: 200 },
    {
      field: 'alcance',
      headerName: 'Alcance',
      width: 150,
      renderCell: (params) => params.value?.toLocaleString() || '0'
    },
    {
      field: 'efectividad',
      headerName: 'Efectividad',
      width: 130,
      renderCell: (params) => `${params.value || 0}%`
    },
    {
      field: 'inversionTotal',
      headerName: 'Inversión Total',
      width: 150,
      renderCell: (params) => new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
      }).format(params.value || 0)
    },
    {
      field: 'frecuenciaUso',
      headerName: 'Frecuencia de Uso',
      width: 150,
      renderCell: (params) => `${params.value || 0} veces`
    },
    {
      field: 'proveedoresAsociados',
      headerName: 'Proveedores',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value || 0} 
          color="primary" 
          size="small" 
        />
      )
    }
  ];

  const columnasProveedores = [
    { field: 'nombre', headerName: 'Proveedor', width: 200 },
    {
      field: 'cumplimientoPlazos',
      headerName: 'Cumplimiento',
      width: 130,
      renderCell: (params) => `${params.value || 0}%`
    },
    {
      field: 'calidadServicio',
      headerName: 'Calidad',
      width: 150,
      renderCell: (params) => (
        <Rating
          value={parseFloat(params.value) || 0}
          precision={0.1}
          readOnly
          size="small"
        />
      )
    },
    {
      field: 'volumenNegocios',
      headerName: 'Volumen de Negocios',
      width: 180,
      renderCell: (params) => new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
      }).format(params.value || 0)
    },
    {
      field: 'satisfaccionCliente',
      headerName: 'Satisfacción',
      width: 130,
      renderCell: (params) => {
        const value = parseFloat(params.value) || 0;
        const color = value >= 80 ? '#4caf50' : value >= 60 ? '#ff9800' : '#f44336';
        return (
          <Chip 
            label={`${params.value || 0}%`}
            sx={{ backgroundColor: color, color: 'white' }}
            size="small"
          />
        );
      }
    }
  ];

  return (
    <>
      {/* Header moderno con gradiente - Igual que clientes, reporte de inversión y gestión de órdenes */}
      {!isMobile && (
        <div className="modern-header animate-slide-down" style={{ maxWidth: '1400px', margin: '0 auto', marginBottom: '12px', padding: '2px 12px' }}>
          <div className="modern-title" style={{ fontSize: '1rem', marginTop: '14px', lineHeight: '1' }}>
            DASHBOARD ANALÍTICO
          </div>
        </div>
      )}

      <div className="clientes-container animate-fade-in">
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <Paper sx={{ p: 3, mb: 4, mx: '24px' }}>

        {/* Filtro de período */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Período de Análisis</InputLabel>
                <Select
                  value={periodoAnalisis}
                  label="Período de Análisis"
                  onChange={(e) => setPeriodoAnalisis(e.target.value)}
                >
                  <MenuItem value="mes">Último Mes</MenuItem>
                  <MenuItem value="trimestre">Último Trimestre</MenuItem>
                  <MenuItem value="ano">Último Año</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Estadísticas Generales Consolidadas */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Métricas Generales Consolidadas
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Campañas
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {estadisticasGenerales.totalCampañas}
                    </Typography>
                  </Box>
                  <CampaignIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Medios
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                      {estadisticasGenerales.totalMedios}
                    </Typography>
                  </Box>
                  <TvIcon sx={{ fontSize: 40, color: '#388e3c' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Proveedores
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                      {estadisticasGenerales.totalProveedores}
                    </Typography>
                  </Box>
                  <BusinessIcon sx={{ fontSize: 40, color: '#f57c00' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Inversión Total
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(estadisticasGenerales.inversionTotal)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 40, color: '#7b1fa2' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Rendimiento Promedio
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#c62828' }}>
                      {estadisticasGenerales.rendimientoPromedio.toFixed(1)}%
                    </Typography>
                  </Box>
                  <BarChartIcon sx={{ fontSize: 40, color: '#c62828' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      ROI Promedio
                    </Typography>
                    <Typography variant="h5" sx={{
                      fontWeight: 'bold',
                      color: estadisticasGenerales.roiPromedio >= 0 ? '#2e7d32' : '#d32f2f'
                    }}>
                      {estadisticasGenerales.roiPromedio.toFixed(1)}%
                    </Typography>
                  </Box>
                  <ShowChartIcon sx={{
                    fontSize: 40,
                    color: estadisticasGenerales.roiPromedio >= 0 ? '#2e7d32' : '#d32f2f'
                  }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Pestañas de análisis detallado */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="Análisis detallado">
            <Tab label="Análisis por Campaña" icon={<CampaignIcon />} />
            <Tab label="Análisis por Medios" icon={<TvIcon />} />
            <Tab label="Análisis por Proveedores" icon={<BusinessIcon />} />
          </Tabs>
        </Box>

        {/* Contenido de las pestañas */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Análisis Detallado por Campaña
            </Typography>
            <Button
              variant="contained"
              color="success"
              onClick={() => exportarExcel('campañas')}
              startIcon={<AssessmentIcon />}
            >
              Exportar Análisis
            </Button>
          </Box>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Análisis completo del rendimiento de cada campaña con métricas de inversión, ROI y estado de órdenes.
          </Alert>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <div style={{ height: 500, width: '100%' }}>
              <DataGrid
                rows={metricasCampañas}
                columns={columnasCampañas}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50]}
                disableSelectionOnClick
              />
            </div>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Análisis Detallado por Medios
            </Typography>
            <Button
              variant="contained"
              color="success"
              onClick={() => exportarExcel('medios')}
              startIcon={<AssessmentIcon />}
            >
              Exportar Análisis
            </Button>
          </Box>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Análisis de rendimiento de medios publicitarios con métricas de alcance, efectividad y frecuencia de uso.
          </Alert>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <div style={{ height: 500, width: '100%' }}>
              <DataGrid
                rows={metricasMedios}
                columns={columnasMedios}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50]}
                disableSelectionOnClick
              />
            </div>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Análisis Detallado por Proveedores
            </Typography>
            <Button
              variant="contained"
              color="success"
              onClick={() => exportarExcel('proveedores')}
              startIcon={<AssessmentIcon />}
            >
              Exportar Análisis
            </Button>
          </Box>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Análisis de efectividad de proveedores con métricas de cumplimiento, calidad y satisfacción del cliente.
          </Alert>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <div style={{ height: 500, width: '100%' }}>
              <DataGrid
                rows={metricasProveedores}
                columns={columnasProveedores}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50]}
                disableSelectionOnClick
              />
            </div>
          )}
        </TabPanel>
      </Paper>
    </div>
    </div>
    </>
  );
}