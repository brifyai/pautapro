/**
 * Reporte de Versiones de Órdenes
 * Permite visualizar y analizar el historial de versiones de todas las órdenes
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  Badge,
  CircularProgress
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  History as HistoryIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { ordenVersionamientoService } from '../../services/ordenVersionamientoService';
import { SweetAlertUtils } from '../../utils/sweetAlertUtils';
import HistorialVersionesOrden from '../../components/ordenes/HistorialVersionesOrden';

const ReporteVersionesOrdenes = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filtros, setFiltros] = useState({
    anio: new Date().getFullYear().toString(),
    cliente_id: '',
    estado: '',
    fecha_inicio: null,
    fecha_fin: null
  });
  const [clientes, setClientes] = useState([]);
  const [showHistorial, setShowHistorial] = useState(false);
  const [selectedOrdenBase, setSelectedOrdenBase] = useState('');
  const [estadisticas, setEstadisticas] = useState({
    totalOrdenes: 0,
    totalVersiones: 0,
    promedioVersionesPorOrden: 0,
    ordenesConModificaciones: 0,
    ordenesSinModificaciones: 0
  });

  useEffect(() => {
    cargarClientes();
    cargarReporte();
  }, []);

  useEffect(() => {
    cargarReporte();
  }, [filtros]);

  const cargarClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id_cliente, nombrecliente, razonSocial')
        .eq('estado', true)
        .order('nombrecliente');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  };

  const cargarReporte = async () => {
    setLoading(true);
    try {
      const reporteData = await ordenVersionamientoService.generarReporteVersiones(filtros);
      
      // Procesar datos para estadísticas
      const ordenesBase = {};
      let totalVersiones = 0;
      let ordenesConModificaciones = 0;

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
        
        if (!orden.esOriginal) {
          ordenesConModificaciones++;
        }
      });

      const totalOrdenes = Object.keys(ordenesBase).length;
      const ordenesSinModificaciones = totalOrdenes - ordenesConModificaciones;
      const promedioVersionesPorOrden = totalOrdenes > 0 ? totalVersiones / totalOrdenes : 0;

      setEstadisticas({
        totalOrdenes,
        totalVersiones,
        promedioVersionesPorOrden: promedioVersionesPorOrden.toFixed(2),
        ordenesConModificaciones,
        ordenesSinModificaciones
      });

      setData(reporteData);
    } catch (error) {
      console.error('Error cargando reporte:', error);
      SweetAlertUtils.showError('Error', 'No se pudo cargar el reporte de versiones', error);
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

  const handleLimpiarFiltros = () => {
    setFiltros({
      anio: new Date().getFullYear().toString(),
      cliente_id: '',
      estado: '',
      fecha_inicio: null,
      fecha_fin: null
    });
  };

  const handleExportarExcel = () => {
    try {
      if (data.length === 0) {
        SweetAlertUtils.showWarning('Sin datos', 'No hay datos para exportar');
        return;
      }

      const exportData = data.map(orden => ({
        'Número de Orden': orden.numero_correlativo,
        'Tipo Versión': orden.tipo_version,
        'Año': orden.anio,
        'Número Base': orden.numero,
        'Versión': orden.version,
        'Estado': orden.estado,
        'Cliente': orden.Clientes?.nombrecliente || 'N/A',
        'Campaña': orden.Campania?.nombrecampania || 'N/A',
        'Fecha Creación': orden.created_at ? format(new Date(orden.created_at), 'dd/MM/yyyy HH:mm') : 'N/A',
        'Usuario Registro': orden.usuarios_registro?.nombre || 'N/A',
        'ID Orden': orden.id_ordenes_de_comprar
      }));

      // Agregar fila de estadísticas
      exportData.push({});
      exportData.push({
        'Número de Orden': 'ESTADÍSTICAS',
        'Tipo Versión': '',
        'Año': filtros.anio,
        'Número Base': '',
        'Versión': '',
        'Estado': '',
        'Cliente': '',
        'Campaña': '',
        'Fecha Creación': '',
        'Usuario Registro': '',
        'ID Orden': ''
      });
      exportData.push({
        'Número de Orden': 'Total Órdenes Base',
        'Tipo Versión': estadisticas.totalOrdenes,
        'Año': '',
        'Número Base': '',
        'Versión': '',
        'Estado': '',
        'Cliente': '',
        'Campaña': '',
        'Fecha Creación': '',
        'Usuario Registro': '',
        'ID Orden': ''
      });
      exportData.push({
        'Número de Orden': 'Total Versiones',
        'Tipo Versión': estadisticas.totalVersiones,
        'Año': '',
        'Número Base': '',
        'Versión': '',
        'Estado': '',
        'Cliente': '',
        'Campaña': '',
        'Fecha Creación': '',
        'Usuario Registro': '',
        'ID Orden': ''
      });
      exportData.push({
        'Número de Orden': 'Promedio Versiones por Orden',
        'Tipo Versión': estadisticas.promedioVersionesPorOrden,
        'Año': '',
        'Número Base': '',
        'Versión': '',
        'Estado': '',
        'Cliente': '',
        'Campaña': '',
        'Fecha Creación': '',
        'Usuario Registro': '',
        'ID Orden': ''
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reporte de Versiones');

      // Ajustar anchos de columnas
      const colWidths = [
        { wch: 20 }, { wch: 15 }, { wch: 6 }, { wch: 8 }, 
        { wch: 8 }, { wch: 12 }, { wch: 20 }, { wch: 25 },
        { wch: 20 }, { wch: 15 }
      ];
      ws['!cols'] = colWidths;

      const fileName = `Reporte_Versiones_Ordenes_${filtros.anio}_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
      XLSX.writeFile(wb, fileName);

      SweetAlertUtils.showSuccess(
        'Exportación completada',
        'El reporte se ha exportado correctamente'
      );
    } catch (error) {
      console.error('Error exportando a Excel:', error);
      SweetAlertUtils.showError('Error', 'No se pudo exportar el reporte', error);
    }
  };

  const handleVerHistorial = (numeroOrden) => {
    const parsed = ordenVersionamientoService.parsearNumeroOrden(numeroOrden);
    const ordenBase = `${parsed.prefijo}-${parsed.anio}-${parsed.numero}`;
    setSelectedOrdenBase(ordenBase);
    setShowHistorial(true);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'completada': return 'success';
      case 'produccion': return 'warning';
      case 'aprobada': return 'info';
      case 'pendiente': return 'default';
      case 'cancelada': return 'error';
      default: return 'default';
    }
  };

  const getVersionColor = (esOriginal) => {
    return esOriginal ? 'primary' : 'secondary';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#206e43' }}>
          <HistoryIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Reporte de Versiones de Órdenes
        </Typography>

        {/* Tarjetas de Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Órdenes Base
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {estadisticas.totalOrdenes}
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 40, color: '#206e43' }} />
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
                      Total Versiones
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#6777ef' }}>
                      {estadisticas.totalVersiones}
                    </Typography>
                  </Box>
                  <HistoryIcon sx={{ fontSize: 40, color: '#6777ef' }} />
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
                      Promedio Versiones
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                      {estadisticas.promedioVersionesPorOrden}
                    </Typography>
                  </Box>
                  <InfoIcon sx={{ fontSize: 40, color: '#ff9800' }} />
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
                      Con Modificaciones
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                      {estadisticas.ordenesConModificaciones}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      ({((estadisticas.ordenesConModificaciones / estadisticas.totalOrdenes) * 100).toFixed(1)}%)
                    </Typography>
                  </Box>
                  <TrendingDownIcon sx={{ fontSize: 40, color: '#f44336' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filtros */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            Filtros
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Año</InputLabel>
                <Select
                  value={filtros.anio}
                  label="Año"
                  onChange={(e) => handleFiltroChange('anio', e.target.value)}
                >
                  <MenuItem value="2024">2024</MenuItem>
                  <MenuItem value="2023">2023</MenuItem>
                  <MenuItem value="2022">2022</MenuItem>
                  <MenuItem value="2021">2021</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Cliente</InputLabel>
                <Select
                  value={filtros.cliente_id}
                  label="Cliente"
                  onChange={(e) => handleFiltroChange('cliente_id', e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {clientes.map((cliente) => (
                    <MenuItem key={cliente.id_cliente} value={cliente.id_cliente}>
                      {cliente.nombrecliente}
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
                  <MenuItem value="pendiente">Pendiente</MenuItem>
                  <MenuItem value="aprobada">Aprobada</MenuItem>
                  <MenuItem value="produccion">Producción</MenuItem>
                  <MenuItem value="completada">Completada</MenuItem>
                  <MenuItem value="cancelada">Cancelada</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="Fecha Inicio"
                value={filtros.fecha_inicio}
                onChange={(newValue) => handleFiltroChange('fecha_inicio', newValue)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="Fecha Fin"
                value={filtros.fecha_fin}
                onChange={(newValue) => handleFiltroChange('fecha_fin', newValue)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={1}>
              <Button
                variant="outlined"
                onClick={handleLimpiarFiltros}
                fullWidth
                sx={{ height: '40px' }}
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Acciones */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Resultados ({data.length} versiones encontradas)
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={cargarReporte}
              disabled={loading}
            >
              Actualizar
            </Button>
            
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExportarExcel}
              disabled={loading || data.length === 0}
              sx={{ backgroundColor: '#206e43', '&:hover': { backgroundColor: '#185735' } }}
            >
              Exportar Excel
            </Button>
          </Box>
        </Box>

        {/* Tabla de Resultados */}
        <Paper>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : data.length === 0 ? (
            <Alert severity="info">
              No se encontraron resultados para los filtros seleccionados.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
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
                  {data.map((orden) => (
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
                          color={getVersionColor(orden.esOriginal)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={orden.estado}
                          color={getEstadoColor(orden.estado)}
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
                            <IconButton
                              size="small"
                              onClick={() => handleVerHistorial(orden.numero_correlativo)}
                              color="primary"
                            >
                              <HistoryIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Ver detalles">
                            <IconButton
                              size="small"
                              color="info"
                            >
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
        </Paper>

        {/* Modal de Historial */}
        <HistorialVersionesOrden
          open={showHistorial}
          onClose={() => setShowHistorial(false)}
          numeroOrdenBase={selectedOrdenBase}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default ReporteVersionesOrdenes;