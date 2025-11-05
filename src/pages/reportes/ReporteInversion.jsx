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
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Chip,
  Alert,
  Tooltip
} from '@mui/material';
import '../clientes/Clientes.css';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { supabase } from '../../config/supabase';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as RouterLink } from 'react-router-dom';
import * as XLSX from 'xlsx';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reporte-tabpanel-${index}`}
      aria-labelledby={`reporte-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ReporteInversion() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [dataPorCliente, setDataPorCliente] = useState([]);
  const [dataBruto, setDataBruto] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [medios, setMedios] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [soportes, setSoportes] = useState([]);
  const [filtros, setFiltros] = useState({
    cliente: '',
    medio: '',
    proveedor: '',
    soporte: '',
    fechaInicio: null,
    fechaFin: null
  });

  // Estadísticas generales
  const [estadisticas, setEstadisticas] = useState({
    totalInversion: 0,
    totalOrdenes: 0,
    clientesActivos: 0,
    promedioInversion: 0
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    if (tabValue === 0) cargarReporteGeneral();
    if (tabValue === 1) cargarReportePorCliente();
    if (tabValue === 2) cargarReporteBruto();
  }, [tabValue, filtros]);

  const cargarDatosIniciales = async () => {
    try {
      const [clientesRes, mediosRes, proveedoresRes, soportesRes] = await Promise.all([
        supabase.from('clientes').select('id_cliente, nombrecliente').order('nombrecliente'),
        supabase.from('medios').select('id, nombredelmedio').order('nombredelmedio'),
        supabase.from('proveedores').select('id_proveedor, nombreproveedor').order('nombreproveedor'),
        supabase.from('soportes').select('id_soporte, nombreIdentificador').order('nombreIdentificador')
      ]);

      setClientes(clientesRes.data || []);
      setMedios(mediosRes.data || []);
      setProveedores(proveedoresRes.data || []);
      setSoportes(soportesRes.data || []);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    }
  };

  const cargarReporteGeneral = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('ordenesdepublicidad')
        .select(`
          id_ordenes_de_comprar,
          fechaCreacion,
          numero_correlativo,
          estado,
          copia,
          monto_total,
          alternativas_plan_orden,
          Campania!inner (
            id_campania,
            NombreCampania,
            id_Cliente,
            Presupuesto,
            Clientes!inner (id_cliente, nombrecliente, razonSocial)
          ),
          Contratos (
            id,
            num_contrato,
            id_proveedor,
            Proveedores!inner (id_proveedor, nombreproveedor)
          ),
          Soportes (id_soporte, nombreIdentificador),
          plan (id, nombre_plan, anio, mes,
            Anios!anio (id, years),
            Meses (Id, Nombre)
          )
        `);

      // Aplicar filtros
      if (filtros.cliente) {
        query = query.eq('campania.id_Cliente', filtros.cliente);
      }
      if (filtros.fechaInicio) {
        const fechaInicioFormateada = format(new Date(filtros.fechaInicio), 'yyyy-MM-dd');
        query = query.gte('fechaCreacion', fechaInicioFormateada);
      }
      if (filtros.fechaFin) {
        const fechaFinFormateada = format(new Date(filtros.fechaFin), 'yyyy-MM-dd');
        query = query.lte('fechaCreacion', fechaFinFormateada);
      }

      const { data: ordenes, error } = await query.order('fechaCreacion', { ascending: false });

      if (error) throw error;

      // Procesar datos para el reporte general
      const procesados = await Promise.all(ordenes.map(async (orden) => {
        let inversionTotal = orden.monto_total || 0;

        // Si no hay monto_total, calcular desde alternativas
        if (!inversionTotal && orden.alternativas_plan_orden) {
          const ids = typeof orden.alternativas_plan_orden === 'string' 
            ? JSON.parse(orden.alternativas_plan_orden)
            : orden.alternativas_plan_orden;

          if (Array.isArray(ids) && ids.length > 0) {
            const { data: alternativas } = await supabase
              .from('alternativa')
              .select('total_neto, total_general')
              .in('id', ids);

            if (alternativas) {
              inversionTotal = alternativas.reduce((sum, alt) => 
                sum + (alt.total_neto || alt.total_general || 0), 0);
            }
          }
        }

        return {
          id: orden.id_ordenes_de_comprar,
          numeroOrden: orden.numero_correlativo,
          cliente: orden.Campania?.Clientes?.nombrecliente || 'Sin cliente',
          razonSocial: orden.Campania?.Clientes?.razonSocial || '',
          campaña: orden.Campania?.NombreCampania || '',
          medio: orden.Contratos?.Proveedores?.nombreproveedor || '',
          proveedor: orden.Contratos?.Proveedores?.nombreproveedor || '',
          soporte: orden.Soportes?.nombreIdentificador || '',
          fecha: orden.fechaCreacion,
          anio: orden.plan?.anios?.years || '',
          mes: orden.plan?.meses?.Nombre || '',
          inversion: inversionTotal,
          presupuesto: orden.Campania?.Presupuesto || 0,
          estado: orden.estado || 'activa'
        };
      }));

      setData(procesados);

      // Calcular estadísticas
      const totalInversion = procesados.reduce((sum, item) => sum + item.inversion, 0);
      const clientesUnicos = new Set(procesados.map(item => item.cliente)).size;

      setEstadisticas({
        totalInversion,
        totalOrdenes: procesados.length,
        clientesActivos: clientesUnicos,
        promedioInversion: procesados.length > 0 ? totalInversion / procesados.length : 0
      });

    } catch (error) {
      console.error('Error cargando reporte general:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarReportePorCliente = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('ordenesdepublicidad')
        .select(`
          id_ordenes_de_comprar,
          fechaCreacion,
          monto_total,
          alternativas_plan_orden,
          Campania!inner (
            id_campania,
            NombreCampania,
            id_Cliente,
            Presupuesto,
            Clientes!inner (id_cliente, nombrecliente, razonSocial)
          ),
          plan (id, anio, mes,
            Anios!anio (id, years),
            Meses (Id, Nombre)
          )
        `);

      // Aplicar filtros
      if (filtros.cliente) {
        query = query.eq('campania.id_Cliente', filtros.cliente);
      }
      if (filtros.fechaInicio) {
        const fechaInicioFormateada = format(new Date(filtros.fechaInicio), 'yyyy-MM-dd');
        query = query.gte('fechaCreacion', fechaInicioFormateada);
      }
      if (filtros.fechaFin) {
        const fechaFinFormateada = format(new Date(filtros.fechaFin), 'yyyy-MM-dd');
        query = query.lte('fechaCreacion', fechaFinFormateada);
      }

      const { data: ordenes, error } = await query;

      if (error) throw error;

      // Agrupar por cliente y mes
      const agrupado = {};
      
      for (const orden of ordenes) {
        const cliente = orden.Campania?.Clientes?.nombrecliente || 'Sin cliente';
        const mes = orden.plan?.meses?.Nombre || 'Sin mes';
        const anio = orden.plan?.anios?.years || new Date().getFullYear();
        const claveMes = `${mes}-${anio}`;

        if (!agrupado[cliente]) {
          agrupado[cliente] = {
            cliente,
            razonSocial: orden.Campania?.Clientes?.razonSocial || '',
            meses: {},
            totalInversion: 0,
            totalPresupuesto: 0,
            totalOrdenes: 0
          };
        }

        if (!agrupado[cliente].meses[claveMes]) {
          agrupado[cliente].meses[claveMes] = {
            mes,
            anio,
            inversion: 0,
            presupuesto: 0,
            ordenes: 0
          };
        }

        let inversionOrden = orden.monto_total || 0;
        
        // Calcular desde alternativas si es necesario
        if (!inversionOrden && orden.alternativas_plan_orden) {
          const ids = typeof orden.alternativas_plan_orden === 'string' 
            ? JSON.parse(orden.alternativas_plan_orden)
            : orden.alternativas_plan_orden;

          if (Array.isArray(ids) && ids.length > 0) {
            const { data: alternativas } = await supabase
              .from('alternativa')
              .select('total_neto, total_general')
              .in('id', ids);

            if (alternativas) {
              inversionOrden = alternativas.reduce((sum, alt) => 
                sum + (alt.total_neto || alt.total_general || 0), 0);
            }
          }
        }

        agrupado[cliente].meses[claveMes].inversion += inversionOrden;
        agrupado[cliente].meses[claveMes].presupuesto += orden.Campania?.Presupuesto || 0;
        agrupado[cliente].meses[claveMes].ordenes += 1;
        
        agrupado[cliente].totalInversion += inversionOrden;
        agrupado[cliente].totalPresupuesto += orden.Campania?.Presupuesto || 0;
        agrupado[cliente].totalOrdenes += 1;
      }

      const resultado = Object.values(agrupado);
      setDataPorCliente(resultado);

    } catch (error) {
      console.error('Error cargando reporte por cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarReporteBruto = async () => {
    setLoading(true);
    try {
      // Similar al reporte general pero con más detalles
      await cargarReporteGeneral();
      setDataBruto(data);
    } catch (error) {
      console.error('Error cargando reporte bruto:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      cliente: '',
      medio: '',
      proveedor: '',
      soporte: '',
      fechaInicio: null,
      fechaFin: null
    });
  };

  const exportarExcel = (tipoReporte) => {
    try {
      let datosExportar = [];
      let nombreArchivo = '';

      switch (tipoReporte) {
        case 'general':
          datosExportar = data.map(item => ({
            'N° Orden': item.numeroOrden,
            'Cliente': item.cliente,
            'Razón Social': item.razonSocial,
            'Campaña': item.campaña,
            'Medio': item.medio,
            'Soporte': item.soporte,
            'Fecha': format(new Date(item.fecha), 'dd/MM/yyyy'),
            'Año': item.anio,
            'Mes': item.mes,
            'Inversión': new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
              minimumFractionDigits: 0
            }).format(item.inversion),
            'Presupuesto': new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
              minimumFractionDigits: 0
            }).format(item.presupuesto),
            'Estado': item.estado
          }));
          nombreArchivo = 'reporte_inversion_general';
          break;

        case 'porCliente':
          datosExportar = dataPorCliente.map(cliente => {
            const filaBase = {
              'Cliente': cliente.cliente,
              'Razón Social': cliente.razonSocial,
              'Inversión Total': new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
                minimumFractionDigits: 0
              }).format(cliente.totalInversion),
              'Presupuesto Total': new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
                minimumFractionDigits: 0
              }).format(cliente.totalPresupuesto),
              'Total Órdenes': cliente.totalOrdenes
            };

            // Agregar columnas dinámicas por mes
            Object.values(cliente.meses).forEach(mes => {
              filaBase[`${mes.mes}-${mes.anio}`] = new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
                minimumFractionDigits: 0
              }).format(mes.inversion);
            });

            return filaBase;
          });
          nombreArchivo = 'reporte_inversion_por_cliente';
          break;

        case 'bruto':
          datosExportar = dataBruto.map(item => ({
            'Razón Social Cliente': item.razonSocial,
            'Cliente': item.cliente,
            'Año': item.anio,
            'Mes': item.mes,
            'N° de Orden': item.numeroOrden,
            'Versión': item.copia || '1',
            'Medio': item.medio,
            'Razón Soc. Proveedor': item.proveedor,
            'Proveedor': item.proveedor,
            'Soporte': item.soporte,
            'Campaña': item.campaña,
            'Fecha Creación': format(new Date(item.fecha), 'dd/MM/yyyy'),
            'Inversión Neta': new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
              minimumFractionDigits: 0
            }).format(item.inversion),
            'Presupuesto': new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
              minimumFractionDigits: 0
            }).format(item.presupuesto),
            'Estado': item.estado
          }));
          nombreArchivo = 'reporte_inversion_bruto';
          break;
      }

      const ws = XLSX.utils.json_to_sheet(datosExportar);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reporte');

      const fechaActual = format(new Date(), 'dd-MM-yyyy');
      XLSX.writeFile(wb, `${nombreArchivo}_${fechaActual}.xlsx`);

    } catch (error) {
      console.error('Error exportando a Excel:', error);
    }
  };

  const columnasGenerales = [
    { field: 'numeroOrden', headerName: 'N° Orden', width: 120 },
    { field: 'cliente', headerName: 'Cliente', width: 200 },
    { field: 'campaña', headerName: 'Campaña', width: 200 },
    { field: 'medio', headerName: 'Medio', width: 150 },
    { field: 'soporte', headerName: 'Soporte', width: 150 },
    { 
      field: 'fecha', 
      headerName: 'Fecha', 
      width: 120,
      renderCell: (params) => format(new Date(params.value), 'dd/MM/yyyy')
    },
    { 
      field: 'inversion', 
      headerName: 'Inversión', 
      width: 150,
      renderCell: (params) => new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
      }).format(params.value)
    },
    { 
      field: 'presupuesto', 
      headerName: 'Presupuesto', 
      width: 150,
      renderCell: (params) => new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
      }).format(params.value)
    },
    { 
      field: 'estado', 
      headerName: 'Estado', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'activa' ? 'success' : 'default'}
          size="small"
        />
      )
    }
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <>
      {/* Header moderno con gradiente - Igual que clientes */}
      {!isMobile && (
        <div className="modern-header animate-slide-down" style={{ maxWidth: '1400px', margin: '0 auto', marginBottom: '12px', padding: '2px 12px' }}>
          <div className="modern-title" style={{ fontSize: '1rem', marginTop: '14px', lineHeight: '1' }}>
            REPORTE DE INVERSIÓN UNIFICADO
          </div>
        </div>
      )}

      <div className="clientes-container animate-fade-in">
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <Paper sx={{ p: 3, mb: 4, mx: '24px' }}>

        {/* Filtros */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>Filtros</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Cliente</InputLabel>
                <Select
                  value={filtros.cliente}
                  label="Cliente"
                  onChange={(e) => handleFiltroChange('cliente', e.target.value)}
                >
                  <MenuItem value="">Todos los clientes</MenuItem>
                  {clientes.map((cliente) => (
                    <MenuItem key={cliente.id_cliente} value={cliente.id_cliente}>
                      {cliente.nombrecliente}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Medio</InputLabel>
                <Select
                  value={filtros.medio}
                  label="Medio"
                  onChange={(e) => handleFiltroChange('medio', e.target.value)}
                >
                  <MenuItem value="">Todos los medios</MenuItem>
                  {medios.map((medio) => (
                    <MenuItem key={medio.id} value={medio.id}>
                      {medio.nombredelmedio}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  label="Fecha Inicio"
                  value={filtros.fechaInicio}
                  onChange={(newValue) => handleFiltroChange('fechaInicio', newValue)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  label="Fecha Fin"
                  value={filtros.fechaFin}
                  onChange={(newValue) => handleFiltroChange('fechaFin', newValue)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="outlined"
                onClick={limpiarFiltros}
                fullWidth
                sx={{ height: '40px' }}
              >
                Limpiar
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="contained"
                onClick={() => {
                  if (tabValue === 0) cargarReporteGeneral();
                  if (tabValue === 1) cargarReportePorCliente();
                  if (tabValue === 2) cargarReporteBruto();
                }}
                disabled={loading}
                startIcon={<SearchIcon sx={{ color: 'white' }} />}
                fullWidth
                sx={{
                  height: '40px',
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  }
                }}
              >
                {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Buscar'}
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="contained"
                onClick={() => {
                  if (tabValue === 0) exportarExcel('general');
                  if (tabValue === 1) exportarExcel('porCliente');
                  if (tabValue === 2) exportarExcel('bruto');
                }}
                startIcon={<FileDownloadIcon sx={{ color: 'white' }} />}
                fullWidth
                sx={{
                  height: '40px',
                  backgroundColor: '#2e7d32',
                  '&:hover': {
                    backgroundColor: '#1b5e20'
                  }
                }}
              >
                Exportar
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Estadísticas Generales */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Inversión Total
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0
                      }).format(estadisticas.totalInversion)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 40, color: '#2e7d32' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Órdenes
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {estadisticas.totalOrdenes}
                    </Typography>
                  </Box>
                  <AssessmentIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Clientes Activos
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                      {estadisticas.clientesActivos}
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 40, color: '#ff9800' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Promedio Inversión
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0
                      }).format(estadisticas.promedioInversion)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Pestañas */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="Reportes de inversión">
            <Tab label="Resumen General" icon={<AssessmentIcon />} />
            <Tab label="Por Cliente" icon={<PeopleIcon />} />
            <Tab label="Detalle Bruto" icon={<TrendingUpIcon />} />
          </Tabs>
        </Box>

        {/* Contenido de las pestañas */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Resumen General de Inversión
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <div style={{ height: 500, width: '100%' }}>
              <DataGrid
                rows={data}
                columns={columnasGenerales}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50]}
                disableSelectionOnClick
              />
            </div>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Inversión Agrupada por Cliente
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Razón Social</TableCell>
                    <TableCell align="right">Inversión Total</TableCell>
                    <TableCell align="right">Presupuesto Total</TableCell>
                    <TableCell align="center">Total Órdenes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataPorCliente.map((cliente) => (
                    <TableRow key={cliente.cliente} hover>
                      <TableCell component="th" scope="row">
                        {cliente.cliente}
                      </TableCell>
                      <TableCell>{cliente.razonSocial}</TableCell>
                      <TableCell align="right">
                        {new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                          minimumFractionDigits: 0
                        }).format(cliente.totalInversion)}
                      </TableCell>
                      <TableCell align="right">
                        {new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                          minimumFractionDigits: 0
                        }).format(cliente.totalPresupuesto)}
                      </TableCell>
                      <TableCell align="center">{cliente.totalOrdenes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Detalle Bruto de Inversión
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Este reporte muestra todos los detalles brutos de las inversiones con información completa de cada orden.
          </Alert>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Razón Social</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Año</TableCell>
                    <TableCell>Mes</TableCell>
                    <TableCell>N° Orden</TableCell>
                    <TableCell>Campaña</TableCell>
                    <TableCell>Medio</TableCell>
                    <TableCell>Soporte</TableCell>
                    <TableCell align="right">Inversión</TableCell>
                    <TableCell align="right">Presupuesto</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataBruto.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.razonSocial}</TableCell>
                      <TableCell>{item.cliente}</TableCell>
                      <TableCell>{item.anio}</TableCell>
                      <TableCell>{item.mes}</TableCell>
                      <TableCell>{item.numeroOrden}</TableCell>
                      <TableCell>{item.campaña}</TableCell>
                      <TableCell>{item.medio}</TableCell>
                      <TableCell>{item.soporte}</TableCell>
                      <TableCell align="right">
                        {new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                          minimumFractionDigits: 0
                        }).format(item.inversion)}
                      </TableCell>
                      <TableCell align="right">
                        {new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                          minimumFractionDigits: 0
                        }).format(item.presupuesto)}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={item.estado} 
                          color={item.estado === 'activa' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>
    </div>
    </div>
    </>
  );
}