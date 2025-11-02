import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import {
  Button,
  TextField,
  InputAdornment,
  Link,
  Breadcrumbs,
  Typography,
  Switch,
  Box,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Checkbox,
  ListItemText,
  OutlinedInput,
  FormControlLabel,
  FormGroup,
  Badge
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { supabase } from '../../config/supabase';
import './Soportes.css';

const SoportesMejorado = () => {
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(5);
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  
  // Estados para mejoras de UX
  const [saving, setSaving] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterProveedor, setFilterProveedor] = useState('todos');
  const [filterCliente, setFilterCliente] = useState('todos');
  
  // Estados para los datos relacionados
  const [proveedores, setProveedores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [medios, setMedios] = useState([]);
  const [selectedMedios, setSelectedMedios] = useState([]);

  useEffect(() => {
    fetchData();
    fetchProveedores();
    fetchClientes();
    fetchMedios();
  }, []);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl+N: Nuevo soporte
      if (event.ctrlKey && event.key === 'n') {
        event.preventDefault();
        handleNew();
      }
      // Ctrl+F: Búsqueda
      else if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        document.querySelector('input[placeholder*="Buscar"]')?.focus();
      }
      // Ctrl+E: Exportar
      else if (event.ctrlKey && event.key === 'e') {
        event.preventDefault();
        handleExportToExcel();
      }
      // Ctrl+/: Mostrar atajos
      else if (event.ctrlKey && event.key === '/') {
        event.preventDefault();
        setShowShortcuts(!showShortcuts);
      }
      // ESC: Cerrar modales
      else if (event.key === 'Escape') {
        if (openModal) {
          handleCloseModal();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openModal, showShortcuts]);

  useEffect(() => {
    filterData();
  }, [searchTerm, startDate, endDate, rows, filterEstado, filterProveedor, filterCliente]);

  const fetchProveedores = async () => {
    try {
      const { data, error } = await supabase
        .from('proveedores')
        .select('id_proveedor, nombreproveedor')
        .eq('estado', true)
        .order('nombreproveedor');
      
      if (error) throw error;
      setProveedores(data || []);
    } catch (error) {
      console.error('Error fetching proveedores:', error);
    }
  };

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id_cliente, nombrecliente')
        .eq('estado', true)
        .order('nombrecliente');
      
      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Error fetching clientes:', error);
    }
  };

  const fetchMedios = async () => {
    try {
      const { data, error } = await supabase
        .from('medios')
        .select('id, nombre_medio')
        .eq('estado', true)
        .order('nombre_medio');
      
      if (error) throw error;
      setMedios(data || []);
    } catch (error) {
      console.error('Error fetching medios:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Obtener soportes con relaciones
      const { data: soportesData, error: soportesError } = await supabase
        .from('soportes')
        .select('*');
        
      if (soportesError) {
        console.error('Error fetching soportes:', soportesError);
        throw soportesError;
      }
      
      if (!soportesData || soportesData.length === 0) {
        setRows([]);
        setFilteredRows([]);
        setLoading(false);
        return;
      }
      
      // Para cada soporte, obtener sus medios relacionados
      const soportesConMedios = await Promise.all(
        soportesData.map(async (soporte) => {
          // Obtener medios del soporte
          const { data: mediosData, error: mediosError } = await supabase
            .from('soporte_medios')
            .select(`
              id_medio,
              medios!inner(id, nombre_medio)
            `)
            .eq('id_soporte', soporte.id_soporte);

          let mediosNombres = [];
          if (!mediosError && mediosData) {
            mediosNombres = mediosData.map(m => m.medios?.nombre_medio).filter(Boolean);
          }

          return {
            id: soporte.id_soporte,
            nombreidentficiador: soporte.nombreidentficiador || soporte.nombreidentificador || '',
            bonificacionano: soporte.bonificacionano || 0,
            escala: soporte.escala || 0,
            estado: soporte.estado,
            descripcion: soporte.descripcion || '',
            id_proveedor: soporte.id_proveedor || null,
            id_cliente: soporte.id_cliente || null,
            medios: mediosNombres.length > 0 ? mediosNombres.join(', ') : 'Sin medios',
            mediosIds: mediosData ? mediosData.map(m => m.id_medio) : [],
            fechaCreacion: soporte.created_at ? new Date(soporte.created_at).toLocaleDateString('es-CL', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }) : 'Sin fecha',
            created_at: soporte.created_at
          };
        })
      );

      setRows(soportesConMedios);
      setFilteredRows(soportesConMedios);
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los datos: ' + error.message
      });
      setRows([]);
      setFilteredRows([]);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    try {
      if (!rows || rows.length === 0) {
        setFilteredRows([]);
        return;
      }
      
      let filtered = [...rows];

      // Filtro por término de búsqueda
      if (searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        filtered = filtered.filter(row =>
          row.nombreidentficiador?.toLowerCase().includes(searchTermLower) ||
          row.medios?.toLowerCase().includes(searchTermLower)
        );
      }

      // Filtro por estado
      if (filterEstado !== 'todos') {
        filtered = filtered.filter(row => row.estado === (filterEstado === 'activo'));
      }

      // Filtro por proveedor
      if (filterProveedor !== 'todos') {
        filtered = filtered.filter(row => row.id_proveedor === parseInt(filterProveedor));
      }

      // Filtro por cliente
      if (filterCliente !== 'todos') {
        filtered = filtered.filter(row => row.id_cliente === parseInt(filterCliente));
      }

      // Filtro por fechas
      if (startDate && endDate) {
        filtered = filtered.filter(row => {
          if (!row.created_at) return false;
          
          const rowDate = new Date(row.created_at);
          const start = new Date(startDate);
          const end = new Date(endDate);
          
          if (isNaN(rowDate.getTime()) || isNaN(start.getTime()) || isNaN(end.getTime())) {
            return false;
          }
          
          return rowDate >= start && rowDate <= end;
        });
      }

      setFilteredRows(filtered);
    } catch (error) {
      console.error('Error filtering data:', error);
      setFilteredRows(rows);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setFilterEstado('todos');
    setFilterProveedor('todos');
    setFilterCliente('todos');
  };

  const hasActiveFilters = searchTerm || startDate || endDate ||
    filterEstado !== 'todos' || filterProveedor !== 'todos' || filterCliente !== 'todos';

  const handleExportToExcel = () => {
    try {
      if (!filteredRows || filteredRows.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Sin datos',
          text: 'No hay datos para exportar'
        });
        return;
      }
      
      const exportData = filteredRows.map(row => ({
        'Fecha Creación': row.fechaCreacion || 'Sin fecha',
        'Identificador': row.nombreidentficiador || 'Sin identificador',
        'Medios': row.medios || 'Sin medios',
        'Bonificación Año': row.bonificacionano || 0,
        'Escala': row.escala || 0,
        'Estado': row.estado ? 'Activo' : 'Inactivo'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Soportes');
      
      const colWidths = [
        { wch: 15 }, { wch: 20 }, { wch: 30 }, 
        { wch: 15 }, { wch: 15 }, { wch: 10 }
      ];
      ws['!cols'] = colWidths;

      const fileName = 'Soportes_Filtrados.xlsx';
      XLSX.writeFile(wb, fileName);
      
      Swal.fire({
        icon: 'success',
        title: 'Exportación completada',
        text: 'Los datos se han exportado correctamente',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron exportar los datos: ' + error.message
      });
    }
  };

  const handleEstadoChange = async (event, id) => {
    try {
      const newEstado = event.target.checked;
      
      if (!id) {
        throw new Error('ID de soporte no válido');
      }
      
      const { error } = await supabase
        .from('soportes')
        .update({ estado: newEstado })
        .eq('id_soporte', id);

      if (error) {
        console.error('Error updating estado:', error);
        throw error;
      }

      setRows(rows.map(row =>
        row.id === id ? { ...row, estado: newEstado } : row
      ));
      setFilteredRows(filteredRows.map(row =>
        row.id === id ? { ...row, estado: newEstado } : row
      ));

      await Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `El soporte ha sido ${newEstado ? 'activado' : 'desactivado'}`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating estado:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el estado del soporte: ' + error.message
      });
    }
  };

  const handleEdit = (row) => {
    setEditMode(true);
    setFormData({
      ...row,
      id_proveedor: row.id_proveedor || '',
      id_cliente: row.id_cliente || '',
      mediosIds: row.mediosIds || []
    });
    setSelectedMedios(row.mediosIds || []);
    setOpenModal(true);
  };

  const handleNew = () => {
    setEditMode(false);
    setFormData({
      nombreidentficiador: '',
      bonificacionano: 0,
      escala: 0,
      descripcion: '',
      estado: true,
      id_proveedor: '',
      id_cliente: '',
      mediosIds: []
    });
    setSelectedMedios([]);
    setOpenModal(true);
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        // Actualizar soporte existente
        const { error: updateError } = await supabase
          .from('soportes')
          .update({
            nombreidentficiador: formData.nombreidentficiador,
            bonificacionano: formData.bonificacionano,
            escala: formData.escala,
            descripcion: formData.descripcion,
            estado: formData.estado
          })
          .eq('id_soporte', formData.id);

        if (updateError) throw updateError;

        // Actualizar medios relacionados
        if (selectedMedios.length > 0) {
          // Eliminar relaciones existentes
          await supabase
            .from('soporte_medios')
            .delete()
            .eq('id_soporte', formData.id);

          // Insertar nuevas relaciones
          const nuevasRelaciones = selectedMedios.map(medioId => ({
            id_soporte: formData.id,
            id_medio: medioId
          }));

          const { error: relacionesError } = await supabase
            .from('soporte_medios')
            .insert(nuevasRelaciones);

          if (relacionesError) throw relacionesError;
        }

        await Swal.fire({
          icon: 'success',
          title: 'Soporte actualizado',
          text: 'El soporte se ha actualizado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // Crear nuevo soporte
        const { data: newSoporte, error: insertError } = await supabase
          .from('soportes')
          .insert([{
            nombreidentficiador: formData.nombreidentficiador,
            bonificacionano: formData.bonificacionano,
            escala: formData.escala,
            descripcion: formData.descripcion,
            estado: formData.estado
          }])
          .select();

        if (insertError) throw insertError;

        // Agregar medios relacionados
        if (selectedMedios.length > 0 && newSoporte[0]) {
          const nuevasRelaciones = selectedMedios.map(medioId => ({
            id_soporte: newSoporte[0].id_soporte,
            id_medio: medioId
          }));

          const { error: relacionesError } = await supabase
            .from('soporte_medios')
            .insert(nuevasRelaciones);

          if (relacionesError) throw relacionesError;
        }

        await Swal.fire({
          icon: 'success',
          title: 'Soporte creado',
          text: 'El soporte se ha creado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      }

      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('Error saving soporte:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el soporte: ' + error.message
      });
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditMode(false);
    setFormData({});
    setSelectedMedios([]);
  };

  const columns = [
    {
      field: 'nombreidentficiador',
      headerName: 'Identificador',
      width: 180,
      headerClassName: 'data-grid-header',
      flex: 1,
      renderCell: (params) => (
        <Tooltip title={params.value} placement="top">
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {params.value || 'Sin identificador'}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'medios',
      headerName: 'Medios Asociados',
      width: 250,
      headerClassName: 'data-grid-header',
      flex: 2,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {params.value.split(', ').map((medio, index) => (
            <Chip
              key={index}
              label={medio}
              size="small"
              variant="outlined"
              color="primary"
            />
          ))}
        </Box>
      )
    },
    {
      field: 'bonificacionano',
      headerName: 'Bonificación Año',
      width: 150,
      headerClassName: 'data-grid-header',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2">
            {params.value ? `$${params.value.toLocaleString('es-CL')}` : '$0'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'escala',
      headerName: 'Escala',
      width: 120,
      headerClassName: 'data-grid-header',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2">
            {params.value || 0}
          </Typography>
        </Box>
      )
    },
    {
      field: 'fechaCreacion',
      headerName: 'Fecha Creación',
      width: 140,
      headerClassName: 'data-grid-header',
      renderCell: (params) => (
        <Typography variant="body2" color="textSecondary">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 120,
      headerClassName: 'data-grid-header',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Switch
            checked={params.value}
            onChange={(e) => handleEstadoChange(e, params.row.id)}
            size="small"
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#4caf50 !important',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#4caf50 !important',
              },
              '& .MuiSwitch-switchBase': {
                color: '#f44336',
              },
              '& .MuiSwitch-switchBase + .MuiSwitch-track': {
                backgroundColor: '#f44336',
              },
            }}
          />
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      renderCell: (params) => (
        <div className="action-buttons">
          <Tooltip title="Editar soporte" placement="top">
            <IconButton
              color="success"
              size="small"
              onClick={() => handleEdit(params.row)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ver detalles del soporte" placement="top">
            <IconButton
              color="primary"
              size="small"
              onClick={() => navigate(`/soportes/view/${params.row.id}`)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <div className="soportes-container">
      <div className="header">
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          className="breadcrumb"
        >
          <Link component={RouterLink} to="/dashboard">
            Home
          </Link>
          <Typography color="text.primary">Soportes</Typography>
        </Breadcrumbs>

        <div className="header-content">
          <Typography variant="h5" component="h1">
            Gestión de Soportes
          </Typography>
        </div>

        {/* Contador de resultados */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            {loading ? 'Cargando...' : (
              <>
                Mostrando <strong>{filteredRows.length}</strong> de <strong>{rows.length}</strong> soportes
                {hasActiveFilters && ' (con filtros aplicados)'}
              </>
            )}
          </Typography>
          
          <Typography variant="body2" color="textSecondary">
            {rows.filter(r => r.estado).length} activos / {rows.filter(r => !r.estado).length} inactivos
          </Typography>
        </Box>

        {/* Barra de búsqueda y acciones principales */}
        <Grid container spacing={2} style={{ marginBottom: '16px' }}>
          <Grid item xs={12} md={4}>
            <Tooltip title="Buscar por identificador o medios (Ctrl+F)" placement="top">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar soporte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#6777ef' }}/>
                    </InputAdornment>
                  ),
                }}
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Tooltip title="Filtros avanzados" placement="top">
                <Button
                  variant={hasActiveFilters ? "contained" : "outlined"}
                  onClick={() => setShowFilters(!showFilters)}
                  startIcon={<FilterListIcon />}
                  sx={{
                    borderColor: hasActiveFilters ? '#6777ef' : undefined,
                    backgroundColor: hasActiveFilters ? '#6777ef' : undefined,
                    color: hasActiveFilters ? '#fff' : '#6777ef',
                    height: '56px',
                  }}
                >
                  Filtros
                  {hasActiveFilters && (
                    <Badge
                      badgeContent="!"
                      color="error"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Button>
              </Tooltip>
              
              <Tooltip title="Limpiar todos los filtros" placement="top">
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  startIcon={<ClearIcon />}
                  sx={{ height: '56px' }}
                  disabled={!hasActiveFilters}
                >
                  Limpiar
                </Button>
              </Tooltip>

              <Tooltip title="Exportar datos a Excel (Ctrl+E)" placement="top">
                <Button
                  variant="contained"
                  onClick={handleExportToExcel}
                  startIcon={<FileDownloadIcon sx={{ color: '#fff' }} />}
                  sx={{
                    backgroundColor: '#206e43',
                    color: '#fff',
                    height: '56px',
                    '&:hover': {
                      backgroundColor: '#185735',
                    },
                  }}
                >
                  Exportar
                </Button>
              </Tooltip>

              <Tooltip title="Crear nuevo soporte (Ctrl+N)" placement="top">
                <Button
                  variant="contained"
                  onClick={handleNew}
                  startIcon={<AddIcon sx={{ color: '#fff' }} />}
                  sx={{
                    backgroundColor: '#6777ef',
                    color: '#fff',
                    height: '56px',
                    '&:hover': {
                      backgroundColor: '#5a67d8',
                    },
                  }}
                >
                  Nuevo Soporte
                </Button>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>

        {/* Panel de filtros avanzados */}
        {showFilters && (
          <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f8f9fa' }}>
            <Typography variant="h6" gutterBottom>
              Filtros Avanzados
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={filterEstado}
                    label="Estado"
                    onChange={(e) => setFilterEstado(e.target.value)}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    <MenuItem value="activo">Activos</MenuItem>
                    <MenuItem value="inactivo">Inactivos</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Proveedor</InputLabel>
                  <Select
                    value={filterProveedor}
                    label="Proveedor"
                    onChange={(e) => setFilterProveedor(e.target.value)}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    {proveedores.map((proveedor) => (
                      <MenuItem key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                        {proveedor.nombreproveedor}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Cliente</InputLabel>
                  <Select
                    value={filterCliente}
                    label="Cliente"
                    onChange={(e) => setFilterCliente(e.target.value)}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    {clientes.map((cliente) => (
                      <MenuItem key={cliente.id_cliente} value={cliente.id_cliente}>
                        {cliente.nombrecliente}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha Inicio"
                  size="small"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha Fin"
                  size="small"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Paper>
        )}
      </div>

      <div className="data-grid-container">
        {loading ? (
          // Skeleton de carga
          <div style={{ padding: '16px' }}>
            {[...Array(5)].map((_, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
              </Box>
            ))}
          </div>
        ) : filteredRows && filteredRows.length > 0 ? (
          <DataGrid
            getRowId={(row) => row.id}
            rows={filteredRows}
            columns={columns}
            pageSize={pageSize}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            rowsPerPageOptions={[5, 10, 25]}
            disableSelectionOnClick
            loading={loading}
            autoHeight
            localeText={{
              noRowsLabel: 'No hay datos para mostrar',
              footerRowSelected: count => `${count} fila${count !== 1 ? 's' : ''} seleccionada${count !== 1 ? 's' : ''}`,
              footerTotalRows: 'Filas totales:',
              footerTotalVisibleRows: (visibleCount, totalCount) =>
                `${visibleCount.toLocaleString()} de ${totalCount.toLocaleString()}`,
              footerPaginationRowsPerPage: 'Filas por página:',
              columnMenuLabel: 'Menú',
              columnMenuShowColumns: 'Mostrar columnas',
              columnMenuFilter: 'Filtrar',
              columnMenuHideColumn: 'Ocultar',
              columnMenuUnsort: 'Desordenar',
              columnMenuSortAsc: 'Ordenar ASC',
              columnMenuSortDesc: 'Ordenar DESC',
              columnHeaderSortIconLabel: 'Ordenar',
              MuiTablePagination: {
                labelRowsPerPage: 'Filas por página:',
                labelDisplayedRows: ({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`,
              },
            }}
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          />
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            padding: '16px'
          }}>
            <Typography variant="h6" color="textSecondary">
              No hay datos para mostrar
            </Typography>
          </div>
        )}
      </div>

      {/* Modal de Nuevo/Editar Soporte */}
      <Dialog 
        open={openModal} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? 'Editar Soporte' : 'Nuevo Soporte'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Identificador"
                name="nombreidentficiador"
                value={formData.nombreidentficiador || ''}
                onChange={(e) => setFormData({...formData, nombreidentficiador: e.target.value})}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bonificación Año"
                name="bonificacionano"
                type="number"
                value={formData.bonificacionano || ''}
                onChange={(e) => setFormData({...formData, bonificacionano: parseFloat(e.target.value) || 0})}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Escala"
                name="escala"
                type="number"
                value={formData.escala || ''}
                onChange={(e) => setFormData({...formData, escala: parseFloat(e.target.value) || 0})}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="descripcion"
                multiline
                rows={3}
                value={formData.descripcion || ''}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Medios Asociados</InputLabel>
                <Select
                  multiple
                  value={selectedMedios}
                  onChange={(e) => setSelectedMedios(e.target.value)}
                  input={<OutlinedInput label="Medios Asociados" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const medio = medios.find(m => m.id === value);
                        return (
                          <Chip key={value} label={medio?.nombre_medio || value} />
                        );
                      })}
                    </Box>
                  )}
                >
                  {medios.map((medio) => (
                    <MenuItem key={medio.id} value={medio.id}>
                      <Checkbox checked={selectedMedios.indexOf(medio.id) > -1} />
                      <ListItemText primary={medio.nombre_medio} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            color="primary"
          >
            {editMode ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Atajos de Teclado */}
      <Dialog
        open={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Atajos de Teclado</Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                <strong>Ctrl + N</strong> - Nuevo soporte
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                <strong>Ctrl + F</strong> - Buscar
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                <strong>Ctrl + E</strong> - Exportar a Excel
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                <strong>Ctrl + /</strong> - Mostrar/Ocultar atajos
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                <strong>ESC</strong> - Cerrar modales
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowShortcuts(false)} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Botón flotante de atajos */}
      <Tooltip title="Atajos de teclado (Ctrl+/)" placement="left">
        <IconButton
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            backgroundColor: '#6777ef',
            color: 'white',
            width: 56,
            height: 56,
            '&:hover': {
              backgroundColor: '#5a67d8',
            },
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
          onClick={() => setShowShortcuts(true)}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            ?
          </Typography>
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default SoportesMejorado;