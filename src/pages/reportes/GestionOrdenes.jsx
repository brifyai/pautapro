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
  IconButton,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import HistoryIcon from '@mui/icons-material/History';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import { ordenVersionamientoService } from '../../services/ordenVersionamientoService';
import { reportService } from '../../services/reportService';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`gestion-tabpanel-${index}`}
      aria-labelledby={`gestion-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function GestionOrdenes() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ordenes, setOrdenes] = useState([]);
  const [ordenesVersiones, setOrdenesVersiones] = useState([]);
  const [reportesProgramados, setReportesProgramados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [campanas, setCampanas] = useState([]);
  const [filtros, setFiltros] = useState({
    cliente: '',
    campana: '',
    estado: '',
    fechaInicio: null,
    fechaFin: null
  });

  // Estadísticas generales
  const [estadisticas, setEstadisticas] = useState({
    totalOrdenes: 0,
    ordenesActivas: 0,
    ordenesCompletadas: 0,
    totalVersiones: 0,
    reportesActivos: 0
  });

  // Estado para programación de reportes
  const [programacionDialog, setProgramacionDialog] = useState(false);
  const [nuevaProgramacion, setNuevaProgramacion] = useState({
    tipo: 'diario',
    hora: '09:00',
    activo: true,
    destinatarios: '',
    asunto: ''
  });

  useEffect(() => {
    cargarDatosIniciales();
    cargarReportesProgramados();
  }, []);

  useEffect(() => {
    if (tabValue === 0) cargarOrdenesActivas();
    if (tabValue === 1) cargarVersionesOrdenes();
    if (tabValue === 2) cargarReportesDiarios();
  }, [tabValue, filtros]);

  const cargarDatosIniciales = async () => {
    try {
      const [clientesRes, campanasRes] = await Promise.all([
        supabase.from('clientes').select('id_cliente, nombrecliente').order('nombrecliente'),
        supabase.from('campania').select('id_campania, nombrecampania, id_Cliente').eq('c_orden', true).order('nombrecampania')
      ]);

      setClientes(clientesRes.data || []);
      setCampanas(campanasRes.data || []);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    }
  };

  const cargarOrdenesActivas = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('ordenesdepublicidad')
        .select(`
          id_ordenes_de_comprar,
          fechaCreacion,
          created_at,
          numero_correlativo,
          estado,
          copia,
          monto_total,
          alternativas_plan_orden,
          usuario_registro,
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
          ),
          OrdenesUsuarios!left (
            id_orden_usuario,
            estado,
            Usuarios (id_usuario, Nombre, Email, id_grupo,
              Grupos (id_grupo, nombre_grupo)
            )
          )
        `);

      // Aplicar filtros
      if (filtros.cliente) {
        query = query.eq('campania.id_Cliente', filtros.cliente);
      }
      if (filtros.campana) {
        query = query.eq('campania.id_campania', filtros.campana);
      }
      if (filtros.estado) {
        query = query.eq('estado', filtros.estado);
      }
      if (filtros.fechaInicio) {
        const fechaInicioFormateada = format(new Date(filtros.fechaInicio), 'yyyy-MM-dd');
        query = query.gte('fechaCreacion', fechaInicioFormateada);
      }
      if (filtros.fechaFin) {
        const fechaFinFormateada = format(new Date(filtros.fechaFin), 'yyyy-MM-dd');
        query = query.lte('fechaCreacion', fechaFinFormateada);
      }

      const { data: ordenesData, error } = await query.order('fechaCreacion', { ascending: false });

      if (error) throw error;

      // Procesar datos
      const procesados = await Promise.all(ordenesData.map(async (orden) => {
        let inversionTotal = orden.monto_total || 0;

        // Calcular desde alternativas si es necesario
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
          proveedor: orden.Contratos?.Proveedores?.nombreproveedor || '',
          contrato: orden.Contratos?.num_contrato || '',
          soporte: orden.Soportes?.nombreIdentificador || '',
          fecha: orden.fechaCreacion,
          anio: orden.plan?.anios?.years || '',
          mes: orden.plan?.meses?.Nombre || '',
          inversion: inversionTotal,
          presupuesto: orden.Campania?.Presupuesto || 0,
          estado: orden.estado || 'activa',
          version: orden.copia || '1',
          usuario: orden.usuario_registro?.nombre || orden.OrdenesUsuarios?.[0]?.Usuarios?.Nombre || '',
          grupo: orden.OrdenesUsuarios?.[0]?.Usuarios?.Grupos?.nombre_grupo || '',
          alternativasCount: orden.alternativas_plan_orden ? 
            (Array.isArray(orden.alternativas_plan_orden) ? orden.alternativas_plan_orden.length : 1) : 0
        };
      }));

      setOrdenes(procesados);

      // Calcular estadísticas
      const totalOrdenes = procesados.length;
      const ordenesActivas = procesados.filter(o => o.estado === 'activa' || !o.estado).length;
      const ordenesCompletadas = procesados.filter(o => o.estado === 'completada').length;

      setEstadisticas(prev => ({
        ...prev,
        totalOrdenes,
        ordenesActivas,
        ordenesCompletadas
      }));

    } catch (error) {
      console.error('Error cargando órdenes activas:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarVersionesOrdenes = async () => {
    setLoading(true);
    try {
      const reporteData = await ordenVersionamientoService.generarReporteVersiones(filtros);
      setOrdenesVersiones(reporteData);

      // Calcular estadísticas de versiones
      const ordenesBase = {};
      let totalVersiones = 0;

      reporteData.forEach(orden => {
        const baseKey = `${orden.prefijo}-${orden.anio}-${orden.numero}`;
        
        if (!ordenesBase[baseKey]) {
          ordenesBase[baseKey] = {
            versiones: [],
            esOriginal: orden.esOriginal
          };
        }
        
        ordenesBase[baseKey].versiones.push(orden);
        totalVersiones++;
      });

      setEstadisticas(prev => ({
        ...prev,
        totalVersiones
      }));

    } catch (error) {
      console.error('Error cargando versiones de órdenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarReportesDiarios = async () => {
    setLoading(true);
    try {
      const reportes = await reportService.obtenerReportesProgramados();
      setReportesProgramados(reportes);

      setEstadisticas(prev => ({
        ...prev,
        reportesActivos: reportes.filter(r => r.activo).length
      }));

    } catch (error) {
      console.error('Error cargando reportes diarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarReportesProgramados = async () => {
    try {
      const reportes = await reportService.obtenerReportesProgramados();
      setReportesProgramados(reportes);
    } catch (error) {
      console.error('Error cargando reportes programados:', error);
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
      campana: '',
      estado: '',
      fechaInicio: null,
      fechaFin: null
    });
  };

  const exportarExcel = (tipoReporte) => {
    try {
      let datosExportar = [];
      let nombreArchivo = '';

      switch (tipoReporte) {
        case 'ordenes':
          datosExportar = ordenes.map(item => ({
            'N° Orden': item.numeroOrden,
            'Cliente': item.cliente,
            'Razón Social': item.razonSocial,
            'Campaña': item.campaña,
            'Proveedor': item.proveedor,
            'Contrato': item.contrato,
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
            'Estado': item.estado,
            'Versión': item.version,
            'Usuario': item.usuario,
            'Grupo': item.grupo,
            'N° Alternativas': item.alternativasCount
          }));
          nombreArchivo = 'ordenes_activas';
          break;

        case 'versiones':
          datosExportar = ordenesVersiones.map(orden => ({
            'Número de Orden': orden.numero_correlativo,
            'Tipo Versión': orden.tipo_version,
            'Año': orden.anio,
            'Número Base': orden.numero,
            'Versión': orden.version,
            'Estado': orden.estado,
            'Cliente': orden.Clientes?.nombrecliente || 'N/A',
            'Campaña': orden.Campania?.nombrecampania || 'N/A',
            'Fecha Creación': orden.created_at ? format(new Date(orden.created_at), 'dd/MM/yyyy HH:mm') : 'N/A',
            'Usuario Registro': orden.usuarios_registro?.nombre || 'N/A'
          }));
          nombreArchivo = 'versiones_ordenes';
          break;

        case 'diario':
          datosExportar = reportesProgramados.map(reporte => ({
            'Tipo Reporte': reporte.tipo,
            'Frecuencia': reporte.frecuencia,
            'Hora Ejecución': reporte.hora_ejecucion,
            'Destinatarios': reporte.destinatarios,
            'Activo': reporte.activo ? 'Sí' : 'No',
            'Última Ejecución': reporte.ultima_ejecucion ? format(new Date(reporte.ultima_ejecucion), 'dd/MM/yyyy HH:mm') : 'N/A',
            'Próxima Ejecución': reporte.proxima_ejecucion ? format(new Date(reporte.proxima_ejecucion), 'dd/MM/yyyy HH:mm') : 'N/A'
          }));
          nombreArchivo = 'reportes_programados';
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCrearProgramacion = async () => {
    try {
      await reportService.crearReporteProgramado({
        ...nuevaProgramacion,
        filtros: filtros
      });

      setProgramacionDialog(false);
      setNuevaProgramacion({
        tipo: 'diario',
        hora: '09:00',
        activo: true,
        destinatarios: '',
        asunto: ''
      });

      cargarReportesProgramados();
      cargarReportesDiarios();

    } catch (error) {
      console.error('Error creando programación:', error);
    }
  };

  const handleToggleReporte = async (id, activo) => {
    try {
      await reportService.actualizarReporteProgramado(id, { activo });
      cargarReportesProgramados();
      cargarReportesDiarios();
    } catch (error) {
      console.error('Error actualizando reporte:', error);
    }
  };

  const columnasOrdenes = [
    { field: 'numeroOrden', headerName: 'N° Orden', width: 120 },
    { field: 'cliente', headerName: 'Cliente', width: 200 },
    { field: 'campaña', headerName: 'Campaña', width: 200 },
    { field: 'proveedor', headerName: 'Proveedor', width: 150 },
    { field: 'contrato', headerName: 'Contrato', width: 120 },
    { field: 'fecha', headerName: 'Fecha', width: 120,
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
      field: 'estado', 
      headerName: 'Estado', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value === 'activa' || !params.value ? 'ACTIVA' : params.value.toUpperCase()} 
          color={params.value === 'activa' || !params.value ? 'success' : 'default'}
          size="small"
        />
      )
    },
    { field: 'usuario', headerName: 'Usuario', width: 150 },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Ver detalles">
            <IconButton size="small" color="primary">
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ver historial">
            <IconButton size="small" color="info">
              <HistoryIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <>
      {/* Header moderno con gradiente - Igual que clientes y reporte de inversión */}
      {!isMobile && (
        <div className="modern-header animate-slide-down" style={{ maxWidth: '1400px', margin: '0 auto', marginBottom: '12px', padding: '2px 12px' }}>
          <div className="modern-title" style={{ fontSize: '1rem', marginTop: '14px', lineHeight: '1' }}>
            GESTIÓN DE ÓRDENES UNIFICADA
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
                <InputLabel>Campaña</InputLabel>
                <Select
                  value={filtros.campana}
                  label="Campaña"
                  onChange={(e) => handleFiltroChange('campana', e.target.value)}
                >
                  <MenuItem value="">Todas las campañas</MenuItem>
                  {campanas
                    .filter(c => !filtros.cliente || c.id_Cliente === filtros.cliente)
                    .map((campaña) => (
                    <MenuItem key={campaña.id_campania} value={campaña.id_campania}>
                      {campaña.nombrecampania}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filtros.estado}
                  label="Estado"
                  onChange={(e) => handleFiltroChange('estado', e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="activa">Activa</MenuItem>
                  <MenuItem value="completada">Completada</MenuItem>
                  <MenuItem value="cancelada">Cancelada</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  label="Fecha Inicio"
                  value={filtros.fechaInicio}
                  onChange={(newValue) => handleFiltroChange('fechaInicio', newValue)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
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
                  if (tabValue === 0) cargarOrdenesActivas();
                  if (tabValue === 1) cargarVersionesOrdenes();
                  if (tabValue === 2) cargarReportesDiarios();
                }}
                disabled={loading}
                startIcon={<SearchIcon sx={{ color: 'white' }} />}
                fullWidth
                sx={{
                  height: '40px',
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#1565c0' }
                }}
              >
                {loading ? <CircularProgress size={20} /> : 'Buscar'}
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  if (tabValue === 0) exportarExcel('ordenes');
                  if (tabValue === 1) exportarExcel('versiones');
                  if (tabValue === 2) exportarExcel('diario');
                }}
                startIcon={<FileDownloadIcon sx={{ color: 'white' }} />}
                fullWidth
                sx={{
                  height: '40px',
                  backgroundColor: '#2e7d32',
                  '&:hover': { backgroundColor: '#1b5e20' }
                }}
              >
                Exportar
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Estadísticas Generales */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
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

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Órdenes Activas
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                      {estadisticas.ordenesActivas}
                    </Typography>
                  </Box>
                  <RefreshIcon sx={{ fontSize: 40, color: '#2e7d32' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Completadas
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                      {estadisticas.ordenesCompletadas}
                    </Typography>
                  </Box>
                  <AssessmentIcon sx={{ fontSize: 40, color: '#ff9800' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Versiones
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                      {estadisticas.totalVersiones}
                    </Typography>
                  </Box>
                  <HistoryIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Reportes Activos
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                      {estadisticas.reportesActivos}
                    </Typography>
                  </Box>
                  <ScheduleIcon sx={{ fontSize: 40, color: '#f44336' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Pestañas */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="Gestión de órdenes">
            <Tab label="Órdenes Activas" icon={<AssessmentIcon />} />
            <Tab label="Historial de Versiones" icon={<HistoryIcon />} />
            <Tab label="Reportes Diarios" icon={<ScheduleIcon />} />
          </Tabs>
        </Box>

        {/* Contenido de las pestañas */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Órdenes Activas
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <div style={{ height: 500, width: '100%' }}>
              <DataGrid
                rows={ordenes}
                columns={columnasOrdenes}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50]}
                disableSelectionOnClick
              />
            </div>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Historial de Versiones de Órdenes
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Este reporte muestra todas las versiones de las órdenes, incluyendo las originales y las modificaciones.
          </Alert>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Número de Orden</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Campaña</TableCell>
                    <TableCell>Fecha Creación</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ordenesVersiones.map((orden) => (
                    <TableRow key={orden.id_ordenes_de_comprar} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                            {orden.numero_correlativo}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Base: {orden.numero}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={orden.tipo_version}
                          color={orden.esOriginal ? 'primary' : 'secondary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={orden.estado}
                          color={
                            orden.estado === 'completada' ? 'success' :
                            orden.estado === 'produccion' ? 'warning' :
                            orden.estado === 'aprobada' ? 'info' :
                            orden.estado === 'cancelada' ? 'error' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {orden.Clientes?.nombrecliente || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {orden.Campania?.nombrecampania || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {orden.created_at ? format(new Date(orden.created_at), 'dd/MM/yyyy HH:mm') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {orden.usuarios_registro?.nombre || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Ver historial completo">
                            <IconButton size="small" color="primary">
                              <HistoryIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Ver detalles">
                            <IconButton size="small" color="info">
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Reportes Diarios Programados
            </Typography>
            <Button
              variant="contained"
              startIcon={<ScheduleIcon />}
              onClick={() => setProgramacionDialog(true)}
            >
              Programar Nuevo Reporte
            </Button>
          </Box>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Configure reportes automáticos que se generarán y enviarán según la programación establecida.
          </Alert>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tipo Reporte</TableCell>
                    <TableCell>Frecuencia</TableCell>
                    <TableCell>Hora Ejecución</TableCell>
                    <TableCell>Destinatarios</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Última Ejecución</TableCell>
                    <TableCell>Próxima Ejecución</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportesProgramados.map((reporte) => (
                    <TableRow key={reporte.id} hover>
                      <TableCell>{reporte.tipo}</TableCell>
                      <TableCell>{reporte.frecuencia}</TableCell>
                      <TableCell>{reporte.hora_ejecucion}</TableCell>
                      <TableCell>{reporte.destinatarios}</TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={reporte.activo}
                              onChange={(e) => handleToggleReporte(reporte.id, e.target.checked)}
                              color="primary"
                            />
                          }
                          label={reporte.activo ? 'Activo' : 'Inactivo'}
                        />
                      </TableCell>
                      <TableCell>
                        {reporte.ultima_ejecucion ? 
                          format(new Date(reporte.ultima_ejecucion), 'dd/MM/yyyy HH:mm') : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        {reporte.proxima_ejecucion ? 
                          format(new Date(reporte.proxima_ejecucion), 'dd/MM/yyyy HH:mm') : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Configurar">
                            <IconButton size="small" color="primary">
                              <SettingsIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Ejecutar ahora">
                            <IconButton size="small" color="success">
                              <RefreshIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>

      {/* Diálogo para programar reportes */}
      <Dialog open={programacionDialog} onClose={() => setProgramacionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Programar Nuevo Reporte</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo de Reporte</InputLabel>
                <Select
                  value={nuevaProgramacion.tipo}
                  label="Tipo de Reporte"
                  onChange={(e) => setNuevaProgramacion(prev => ({ ...prev, tipo: e.target.value }))}
                >
                  <MenuItem value="diario">Diario</MenuItem>
                  <MenuItem value="semanal">Semanal</MenuItem>
                  <MenuItem value="mensual">Mensual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Hora de Ejecución"
                type="time"
                value={nuevaProgramacion.hora}
                onChange={(e) => setNuevaProgramacion(prev => ({ ...prev, hora: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Destinatarios (correos separados por coma)"
                value={nuevaProgramacion.destinatarios}
                onChange={(e) => setNuevaProgramacion(prev => ({ ...prev, destinatarios: e.target.value }))}
                placeholder="ejemplo@correo.com, otro@correo.com"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Asunto del correo"
                value={nuevaProgramacion.asunto}
                onChange={(e) => setNuevaProgramacion(prev => ({ ...prev, asunto: e.target.value }))}
                placeholder="Reporte automático de órdenes"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={nuevaProgramacion.activo}
                    onChange={(e) => setNuevaProgramacion(prev => ({ ...prev, activo: e.target.checked }))}
                    color="primary"
                  />
                }
                label="Reporte activo"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProgramacionDialog(false)}>Cancelar</Button>
          <Button onClick={handleCrearProgramacion} variant="contained">Crear Programación</Button>
        </DialogActions>
      </Dialog>
    </div>
    </div>
    </>
  );
}