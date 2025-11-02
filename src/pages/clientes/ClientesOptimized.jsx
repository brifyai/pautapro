import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Button, 
  Container,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  FormControlLabel,
  Switch,
  InputAdornment,
  Breadcrumbs,
  Link,
  Box,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  Numbers as NumbersIcon
} from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { supabase } from '../../config/supabase';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { useAsyncState } from '../../hooks/useAsyncState';
import { useErrorHandler } from '../../services/errorHandlingService';
import LoadingOptimized from '../../components/Loading/LoadingOptimized';
import './Clientes.css';

// Estado inicial del formulario
const INITIAL_CLIENTE_STATE = {
  nombrecliente: '',
  RUT: '',
  razonSocial: '',
  direccionEmpresa: '',
  id_comuna: '',
  telCelular: '',
  telFijo: '',
  email: '',
  nombre_representante: '',
  RUT_representante: '',
  direccion_representante: '',
  telcelular_representante: '',
  telfijo_representante: '',
  email_representante: '',
  estado: true
};

// Utilidades de validación
const ValidationUtils = {
  validarRut: (rut) => {
    if (!rut) return false;
    
    let valor = rut.replace(/\./g, '').replace(/-/g, '');
    let cuerpo = valor.slice(0, -1);
    let dv = valor.slice(-1).toUpperCase();
    
    if (cuerpo.length < 7) return false;
    
    let suma = 0;
    let multiplo = 2;
    
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += Number(cuerpo[i]) * multiplo;
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }
    
    let dvEsperado = 11 - (suma % 11);
    
    if (dvEsperado === 11) dvEsperado = '0';
    if (dvEsperado === 10) dvEsperado = 'K';
    else dvEsperado = String(dvEsperado);
    
    return dv === dvEsperado;
  },

  validarEmail: (email) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(email);
  },

  validarTelefonoCelular: (telefono) => {
    const re = /^(\+?56)?(\s?)(0?9)(\s?)[98765432]\d{7}$/;
    return re.test(telefono);
  },

  validarTelefonoFijo: (telefono) => {
    const re = /^(\+?56)?(\s?)([2-9]\d{7,8})$/;
    return re.test(telefono);
  }
};

// Servicios de datos
const ClientesService = {
  async fetchClientes() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nombrecliente');
    
    if (error) throw error;
    return data || [];
  },

  async fetchComunas() {
    const { data, error } = await supabase
      .from('comunas')
      .select('id_comuna, nombrecomuna, nombre');
    
    if (error) throw error;
    return data || [];
  },

  async saveCliente(clienteData, id = null) {
    if (id) {
      const { error } = await supabase
        .from('clientes')
        .update(clienteData)
        .eq('id_cliente', id);
      
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('clientes')
        .insert([clienteData]);
      
      if (error) throw error;
    }
  },

  async deleteCliente(id) {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id_cliente', id);
    
    if (error) throw error;
  },

  async updateEstado(id, estado) {
    const { error } = await supabase
      .from('clientes')
      .update({ estado })
      .eq('id_cliente', id);
    
    if (error) throw error;
  }
};

const ClientesOptimized = () => {
  const navigate = useNavigate();
  const { handleError } = useErrorHandler({ component: 'Clientes' });

  // Estados agrupados por funcionalidad
  const [uiState, setUiState] = useState({
    pageSize: 10,
    searchTerm: '',
    startDate: '',
    endDate: '',
    openModal: false,
    isSaving: false
  });

  const [dataState, setDataState] = useState({
    rows: [],
    filteredRows: [],
    comunas: [],
    selectedCliente: null
  });

  const [formState, setFormState] = useState(INITIAL_CLIENTE_STATE);
  const [errors, setErrors] = useState({});

  // Hook para carga de datos
  const {
    data: clientes,
    loading,
    error: fetchError,
    execute: fetchClientes
  } = useAsyncState({
    asyncFn: async () => {
      const [clientes, comunas] = await Promise.all([
        ClientesService.fetchClientes(),
        ClientesService.fetchComunas()
      ]);

      return { clientes, comunas };
    },
    immediate: true,
    onError: (error) => {
      handleError(error, { action: 'fetchClientes' });
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los datos de clientes'
      });
    }
  });

  // Procesamiento de datos cuando se cargan
  useEffect(() => {
    if (clientes) {
      const { clientes: clientesData, comunas } = clientes;
      
      const comunasObj = comunas.reduce((acc, comuna) => {
        acc[comuna.id] = comuna.nombrecomuna || comuna.nombre;
        return acc;
      }, {});

      const formattedRows = clientesData.map(cliente => ({
        ...cliente,
        id: cliente.id_cliente,
        comuna_nombre: comunasObj[cliente.id_comuna] || ''
      }));

      setDataState(prev => ({
        ...prev,
        rows: formattedRows,
        filteredRows: formattedRows,
        comunas: comunasObj
      }));
    }
  }, [clientes]);

  // Manejo de errores de carga
  useEffect(() => {
    if (fetchError) {
      console.error('Error fetching clientes:', fetchError);
    }
  }, [fetchError]);

  // Función de filtrado optimizada con useMemo
  const filteredData = useMemo(() => {
    let filtered = [...dataState.rows];

    if (uiState.searchTerm) {
      const searchTermLower = uiState.searchTerm.toLowerCase();
      filtered = filtered.filter(row =>
        row.nombrecliente?.toLowerCase().includes(searchTermLower) ||
        row.razonSocial?.toLowerCase().includes(searchTermLower) ||
        row.RUT?.toLowerCase().includes(searchTermLower)
      );
    }

    if (uiState.startDate && uiState.endDate) {
      filtered = filtered.filter(row => {
        if (!row.created_at) return false;
        const rowDate = new Date(row.created_at);
        const start = new Date(uiState.startDate + 'T00:00:00');
        const end = new Date(uiState.endDate + 'T23:59:59');
        return rowDate >= start && rowDate <= end;
      });
    }

    return filtered;
  }, [dataState.rows, uiState.searchTerm, uiState.startDate, uiState.endDate]);

  // Actualizar filteredRows cuando cambia filteredData
  useEffect(() => {
    setDataState(prev => ({ ...prev, filteredRows: filteredData }));
  }, [filteredData]);

  // Validación de formulario
  const validarFormulario = useCallback((clienteData) => {
    const newErrors = {};

    if (!ValidationUtils.validarRut(clienteData.RUT)) {
      newErrors.RUT = 'RUT inválido';
    }

    if (!ValidationUtils.validarRut(clienteData.RUT_representante)) {
      newErrors.RUT_representante = 'RUT inválido';
    }

    if (!ValidationUtils.validarEmail(clienteData.email)) {
      newErrors.email = 'Correo electrónico inválido';
    }

    if (!ValidationUtils.validarEmail(clienteData.email_representante)) {
      newErrors.email_representante = 'Correo electrónico inválido';
    }

    const celularValido = !clienteData.telCelular || ValidationUtils.validarTelefonoCelular(clienteData.telCelular);
    const fijoValido = !clienteData.telFijo || ValidationUtils.validarTelefonoFijo(clienteData.telFijo);

    if (clienteData.telCelular && !celularValido) {
      newErrors.telCelular = 'Formato inválido para celular chileno';
    }

    if (clienteData.telFijo && !fijoValido) {
      newErrors.telFijo = 'Formato inválido para teléfono fijo chileno';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  // Manejadores de eventos
  const handleUiStateChange = useCallback((updates) => {
    setUiState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleDataStateChange = useCallback((updates) => {
    setDataState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleFormStateChange = useCallback((updates) => {
    setFormState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleEdit = useCallback((row) => {
    handleDataStateChange({ selectedCliente: row });
    handleFormStateChange({
      nombrecliente: row.nombrecliente,
      RUT: row.RUT,
      razonSocial: row.razonSocial,
      direccionEmpresa: row.direccionEmpresa,
      id_comuna: row.id_comuna,
      telCelular: row.telCelular,
      telFijo: row.telFijo,
      email: row.email,
      nombre_representante: row.nombre_representante,
      RUT_representante: row.RUT_representante,
      direccion_representante: row.direccion_representante,
      telcelular_representante: row.telcelular_representante,
      telfijo_representante: row.telfijo_representante,
      email_representante: row.email_representante,
      estado: row.estado
    });
    handleUiStateChange({ openModal: true });
  }, [handleDataStateChange, handleFormStateChange, handleUiStateChange]);

  const handleDelete = useCallback(async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await ClientesService.deleteCliente(id);
        
        handleDataStateChange({
          rows: dataState.rows.filter(row => row.id !== id),
          filteredRows: dataState.filteredRows.filter(row => row.id !== id)
        });
        
        Swal.fire('Eliminado', 'El cliente ha sido eliminado.', 'success');
      } catch (error) {
        handleError(error, { action: 'deleteCliente', id });
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el cliente'
        });
      }
    }
  }, [dataState.rows, dataState.filteredRows, handleDataStateChange, handleError]);

  const handleEstadoChange = useCallback(async (event, id) => {
    try {
      const newEstado = event.target.checked;
      await ClientesService.updateEstado(id, newEstado);

      handleDataStateChange({
        rows: dataState.rows.map(row =>
          row.id === id ? { ...row, estado: newEstado } : row
        ),
        filteredRows: dataState.filteredRows.map(row =>
          row.id === id ? { ...row, estado: newEstado } : row
        )
      });

      await Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `El cliente ha sido ${newEstado ? 'activado' : 'desactivado'}`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      handleError(error, { action: 'updateEstado', id });
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el estado del cliente'
      });
    }
  }, [dataState.rows, dataState.filteredRows, handleDataStateChange, handleError]);

  const handleSave = useCallback(async () => {
    try {
      const clienteData = dataState.selectedCliente || formState;
      
      if (!validarFormulario(clienteData)) {
        await Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: 'Por favor, corrija los errores antes de guardar'
        });
        return;
      }

      handleUiStateChange({ isSaving: true });
      
      await ClientesService.saveCliente(
        clienteData, 
        dataState.selectedCliente?.id_cliente
      );

      await fetchClientes();
      
      handleUiStateChange({ openModal: false, isSaving: false });
      handleDataStateChange({ selectedCliente: null });
      handleFormStateChange(INITIAL_CLIENTE_STATE);

      await Swal.fire({
        icon: 'success',
        title: 'Cliente guardado',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      handleError(error, { action: 'saveCliente' });
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el cliente'
      });
      handleUiStateChange({ isSaving: false });
    }
  }, [dataState.selectedCliente, formState, validarFormulario, handleUiStateChange, handleDataStateChange, handleFormStateChange, fetchClientes, handleError]);

  const handleExportToExcel = useCallback(() => {
    const exportData = dataState.filteredRows.map(row => ({
      'Nombre Cliente': row.nombrecliente,
      'RUT': row.RUT,
      'Razón Social': row.razonSocial,
      'Dirección': row.direccionEmpresa,
      'Comuna': row.comuna_nombre,
      'Teléfono Celular': row.telCelular,
      'Teléfono Fijo': row.telFijo,
      'Email': row.email,
      'Nombre Representante': row.nombre_representante,
      'RUT Representante': row.RUT_representante,
      'Email Representante': row.email_representante,
      'Estado': row.estado ? 'Activo' : 'Inactivo',
      'Fecha Creación': row.created_at ? new Date(row.created_at).toLocaleDateString('es-CL') : ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
    XLSX.writeFile(wb, 'Clientes.xlsx');
  }, [dataState.filteredRows]);

  const handleOpenModal = useCallback(() => {
    handleDataStateChange({ selectedCliente: null });
    handleFormStateChange(INITIAL_CLIENTE_STATE);
    handleUiStateChange({ openModal: true });
  }, [handleDataStateChange, handleFormStateChange, handleUiStateChange]);

  // Definición de columnas memoizada
  const columns = useMemo(() => [
    { 
      field: 'id_cliente', 
      headerName: 'ID', 
      width: 60
    },
    { 
      field: 'nombrecliente', 
      headerName: 'Nombre Cliente', 
      width: 180,
      flex: 1
    },
    { 
      field: 'razonSocial', 
      headerName: 'Razón Social', 
      width: 150,
      flex: 1
    },
    { 
      field: 'RUT', 
      headerName: 'RUT', 
      width: 120
    },
    { 
      field: 'comuna_nombre', 
      headerName: 'Comuna', 
      width: 130
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      flex: 1
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 100,
      renderCell: (params) => (
        <Switch
          checked={params.value}
          onChange={(e) => handleEstadoChange(e, params.row.id_cliente)}
          size="small"
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#206e43 !important',
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#206e43 !important',
            },
            '& .MuiSwitch-switchBase:not(.Mui-checked)': {
              color: '#dc3545 !important',
            },
            '& .MuiSwitch-switchBase:not(.Mui-checked) + .MuiSwitch-track': {
              backgroundColor: '#dc3545 !important',
            },
          }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 140,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div className="action-buttons">
          <IconButton 
            size="small" 
            className="view-button"
            onClick={() => navigate(`/clientes/view/${params.row.id_cliente}`)}
          >
            <i className="fas fa-eye" style={{ color: '#206e43' }}></i>
          </IconButton>
          <IconButton 
            size="small" 
            className="edit-button"
            onClick={() => handleEdit(params.row)}
          >
            <i className="fas fa-edit" style={{ color: 'white' }} />
          </IconButton>
          <IconButton
            size="small"
            className="delete-button"
            onClick={() => handleDelete(params.row.id_cliente)}
          >
            <i className="fas fa-trash-alt" style={{ color: '#206e43' }}></i>
          </IconButton>
        </div>
      )
    }
  ], [handleEdit, handleDelete, handleEstadoChange, navigate]);

  // Obtener datos del formulario actual
  const getCurrentFormData = useCallback(() => {
    return dataState.selectedCliente || formState;
  }, [dataState.selectedCliente, formState]);

  if (loading) {
    return <LoadingOptimized message="Cargando clientes..." fullScreen />;
  }

  return (
    <div className="clientes-container">
      <div className="header">
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          className="breadcrumb"
        >
          <Link component={RouterLink} to="/dashboard">
            Home
          </Link>
          <Typography color="text.primary">Clientes</Typography>
        </Breadcrumbs>

        <div className="header-content">
          <Typography variant="h5" component="h1">
            Listado de Clientes
          </Typography>
          <Button
            variant="contained"
            className="btn-agregar"
            onClick={handleOpenModal}
          >
            Agregar Cliente
          </Button>
        </div>

        <Grid container spacing={3} style={{ marginBottom: '20px' }}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar cliente..."
              value={uiState.searchTerm}
              onChange={(e) => handleUiStateChange({ searchTerm: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#6777ef' }}/>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#6777ef',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6777ef',
                  },
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              type="date"
              variant="outlined"
              value={uiState.startDate}
              onChange={(e) => handleUiStateChange({ startDate: e.target.value })}
              label="Fecha Desde"
              InputLabelProps={{
                shrink: true,
                sx: { color: '#666' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#6777ef',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6777ef',
                  },
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              type="date"
              variant="outlined"
              value={uiState.endDate}
              onChange={(e) => handleUiStateChange({ endDate: e.target.value })}
              label="Fecha Hasta"
              InputLabelProps={{
                shrink: true,
                sx: { color: '#666' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#6777ef',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6777ef',
                  },
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              onClick={handleExportToExcel}
              startIcon={<FileDownloadIcon sx={{ color: 'white' }} />}
              sx={{
                backgroundColor: '#206e43',
                color: '#fff',
                height: '72%',
                width: '80%',
                '&:hover': {
                  backgroundColor: '#185735',
                },
              }}
            >
              Exportar Clientes
            </Button>
          </Grid>
        </Grid>
      </div>

      <div className="data-grid-container">
        <DataGrid
          rows={dataState.filteredRows}
          columns={columns}
          pageSize={uiState.pageSize}
          onPageSizeChange={(newPageSize) => handleUiStateChange({ pageSize: newPageSize })}
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
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 }
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f5f5f5',
            },
          }}
        />
      </div>

      {/* Modal de Nuevo/Editar Cliente */}
      <Dialog 
        open={uiState.openModal} 
        onClose={() => handleUiStateChange({ openModal: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dataState.selectedCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Nombre Cliente"
                name="nombrecliente"
                value={getCurrentFormData().nombrecliente}
                onChange={(e) => handleFormStateChange({ nombrecliente: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="RUT"
                name="RUT"
                value={getCurrentFormData().RUT}
                onChange={(e) => handleFormStateChange({ RUT: e.target.value })}
                error={!!errors.RUT}
                helperText={errors.RUT}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Razón Social"
                name="razonSocial"
                value={getCurrentFormData().razonSocial}
                onChange={(e) => handleFormStateChange({ razonSocial: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Dirección Empresa"
                name="direccionEmpresa"
                value={getCurrentFormData().direccionEmpresa}
                onChange={(e) => handleFormStateChange({ direccionEmpresa: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Comuna</InputLabel>
                <Select
                  name="id_comuna"
                  value={getCurrentFormData().id_comuna}
                  onChange={(e) => handleFormStateChange({ id_comuna: e.target.value })}
                  label="Comuna"
                >
                  {Object.keys(dataState.comunas)
                    .sort((a, b) => dataState.comunas[a].localeCompare(dataState.comunas[b], 'es', { sensitivity: 'base' }))
                    .map((comuna, index) => (
                    <MenuItem key={index} value={comuna}>
                      {dataState.comunas[comuna]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono Celular"
                name="telCelular"
                value={getCurrentFormData().telCelular}
                onChange={(e) => handleFormStateChange({ telCelular: e.target.value })}
                error={!!errors.telCelular}
                helperText={errors.telCelular || 'Formato: +569XXXXXXXX'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono Fijo"
                name="telFijo"
                value={getCurrentFormData().telFijo}
                onChange={(e) => handleFormStateChange({ telFijo: e.target.value })}
                error={!!errors.telFijo}
                helperText={errors.telFijo || 'Formato: +562XXXXXXX'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={getCurrentFormData().email}
                onChange={(e) => handleFormStateChange({ email: e.target.value })}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Datos del Representante
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre Representante"
                name="nombre_representante"
                value={getCurrentFormData().nombre_representante}
                onChange={(e) => handleFormStateChange({ nombre_representante: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="RUT Representante"
                name="RUT_representante"
                value={getCurrentFormData().RUT_representante}
                onChange={(e) => handleFormStateChange({ RUT_representante: e.target.value })}
                error={!!errors.RUT_representante}
                helperText={errors.RUT_representante}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección Representante"
                name="direccion_representante"
                value={getCurrentFormData().direccion_representante}
                onChange={(e) => handleFormStateChange({ direccion_representante: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono Celular Representante"
                name="telcelular_representante"
                value={getCurrentFormData().telcelular_representante}
                onChange={(e) => handleFormStateChange({ telcelular_representante: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono Fijo Representante"
                name="telfijo_representante"
                value={getCurrentFormData().telfijo_representante}
                onChange={(e) => handleFormStateChange({ telfijo_representante: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Representante"
                name="email_representante"
                type="email"
                value={getCurrentFormData().email_representante}
                onChange={(e) => handleFormStateChange({ email_representante: e.target.value })}
                error={!!errors.email_representante}
                helperText={errors.email_representante}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={getCurrentFormData().estado}
                    onChange={(e) => handleFormStateChange({ estado: e.target.checked })}
                    color="primary"
                  />
                }
                label="Activo"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleUiStateChange({ openModal: false })} color="primary">
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={uiState.isSaving}
            startIcon={uiState.isSaving ? <CircularProgress size={20} /> : null}
          >
            {uiState.isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ClientesOptimized;