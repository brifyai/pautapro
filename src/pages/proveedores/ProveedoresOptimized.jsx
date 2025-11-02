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
import './Proveedores.css';

// Estado inicial del formulario
const INITIAL_PROVEEDOR_STATE = {
  nombreproveedor: '',
  razonSocial: '',
  nombreFantasia: '',
  rutProveedor: '',
  giroProveedor: '',
  nombreRepresentante: '',
  rutRepresentante: '',
  direccionFacturacion: '',
  id_region: '',
  id_comuna: '',
  telCelular: '',
  telFijo: '',
  email: '',
  estado: true,
  nombreidentificador: '',
  bonificacionano: '',
  escala_rango: ''
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
const ProveedoresService = {
  async fetchProveedores() {
    const { data, error } = await supabase
      .from('proveedores')
      .select(`
        *,
        proveedor_soporte:proveedor_soporte(count)
      `);
    
    if (error) throw error;
    return data;
  },

  async fetchRegiones() {
    const { data, error } = await supabase
      .from('region')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  async fetchComunas() {
    const { data, error } = await supabase
      .from('comunas')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  async saveProveedor(proveedorData, id = null) {
    if (id) {
      const { error } = await supabase
        .from('proveedores')
        .update(proveedorData)
        .eq('id_proveedor', id);
      
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('proveedores')
        .insert([proveedorData]);
      
      if (error) throw error;
    }
  },

  async deleteProveedor(id) {
    const { error } = await supabase
      .from('proveedores')
      .delete()
      .eq('id_proveedor', id);
    
    if (error) throw error;
  },

  async updateEstado(id, estado) {
    const { error } = await supabase
      .from('proveedores')
      .update({ estado })
      .eq('id_proveedor', id);
    
    if (error) throw error;
  }
};

const ProveedoresOptimized = () => {
  const navigate = useNavigate();
  const { handleError } = useErrorHandler({ component: 'Proveedores' });

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
    regiones: {},
    todasLasComunas: [],
    comunasFiltradas: {},
    selectedProveedor: null
  });

  const [formState, setFormState] = useState(INITIAL_PROVEEDOR_STATE);
  const [errors, setErrors] = useState({});

  // Hook para carga de datos
  const {
    data: proveedoresData,
    loading,
    error: fetchError,
    execute: fetchAllData
  } = useAsyncState({
    asyncFn: async () => {
      const [proveedores, regiones, comunas] = await Promise.all([
        ProveedoresService.fetchProveedores(),
        ProveedoresService.fetchRegiones(),
        ProveedoresService.fetchComunas()
      ]);

      return { proveedores, regiones, comunas };
    },
    immediate: true,
    onError: (error) => handleError(error, { action: 'fetchProveedores' })
  });

  // Procesamiento de datos cuando se cargan
  useEffect(() => {
    if (proveedoresData) {
      const { proveedores, regiones, comunas } = proveedoresData;
      
      const regionesObj = regiones.reduce((acc, region) => {
        acc[region.id] = region.nombreregion;
        return acc;
      }, {});

      const comunasObj = comunas.reduce((acc, comuna) => {
        acc[comuna.id_comuna] = comuna.nombreComuna;
        return acc;
      }, {});

      const formattedRows = proveedores.map(proveedor => {
        const fecha = new Date(proveedor.created_at);
        return {
          ...proveedor,
          id: proveedor.id_proveedor,
          region: regionesObj[proveedor.id_region] || '',
          comuna: comunas.find(c => c.id_comuna === proveedor.id_comuna)?.nombreComuna || '',
          fecha_formateada: fecha.toLocaleString('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          num_soportes: proveedor.proveedor_soporte?.[0]?.count || 0
        };
      });

      setDataState(prev => ({
        ...prev,
        rows: formattedRows,
        filteredRows: formattedRows,
        regiones: regionesObj,
        todasLasComunas: comunas,
        comunasFiltradas: comunasObj
      }));
    }
  }, [proveedoresData]);

  // Manejo de errores de carga
  useEffect(() => {
    if (fetchError) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los datos de proveedores'
      });
    }
  }, [fetchError]);

  // Función de filtrado optimizada con useMemo
  const filteredData = useMemo(() => {
    let filtered = [...dataState.rows];

    if (uiState.searchTerm) {
      const searchTermLower = uiState.searchTerm.toLowerCase();
      filtered = filtered.filter(row =>
        row.nombreproveedor?.toLowerCase().includes(searchTermLower) ||
        row.nombreidentificador?.toLowerCase().includes(searchTermLower) ||
        row.rutProveedor?.toLowerCase().includes(searchTermLower)
      );
    }

    if (uiState.startDate && uiState.endDate) {
      filtered = filtered.filter(row => {
        const rowDate = new Date(row.created_at);
        const start = new Date(uiState.startDate);
        const end = new Date(uiState.endDate);
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
  const validarFormulario = useCallback((proveedorData) => {
    const newErrors = {};

    if (!ValidationUtils.validarRut(proveedorData.rutProveedor)) {
      newErrors.rutProveedor = 'RUT inválido';
    }

    if (!ValidationUtils.validarRut(proveedorData.rutRepresentante)) {
      newErrors.rutRepresentante = 'RUT inválido';
    }

    if (!ValidationUtils.validarEmail(proveedorData.email)) {
      newErrors.email = 'Correo electrónico inválido';
    }

    const celularValido = !proveedorData.telCelular || ValidationUtils.validarTelefonoCelular(proveedorData.telCelular);
    const fijoValido = !proveedorData.telFijo || ValidationUtils.validarTelefonoFijo(proveedorData.telFijo);

    if (proveedorData.telCelular && !celularValido) {
      newErrors.telCelular = 'Formato inválido para celular chileno';
    }

    if (proveedorData.telFijo && !fijoValido) {
      newErrors.telFijo = 'Formato inválido para teléfono fijo chileno';
    }

    if (!proveedorData.telCelular && !proveedorData.telFijo) {
      newErrors.telefono = 'Se requiere al menos un teléfono';
    } else if (proveedorData.telCelular && !celularValido && proveedorData.telFijo && !fijoValido) {
      newErrors.telefono = 'Al menos un teléfono debe tener formato válido';
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

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    if (name === 'id_region') {
      const comunasFiltradas = dataState.todasLasComunas
        .filter(comuna => comuna.id_region === parseInt(value))
        .reduce((acc, comuna) => {
          acc[comuna.id_comuna] = comuna.nombreComuna;
          return acc;
        }, {});
      
      handleDataStateChange({ comunasFiltradas });
      
      if (dataState.selectedProveedor) {
        handleDataStateChange({
          selectedProveedor: {
            ...dataState.selectedProveedor,
            [name]: value,
            id_comuna: ''
          }
        });
      } else {
        handleFormStateChange({ [name]: value, id_comuna: '' });
      }
    } else {
      if (dataState.selectedProveedor) {
        handleDataStateChange({
          selectedProveedor: {
            ...dataState.selectedProveedor,
            [name]: value
          }
        });
      } else {
        handleFormStateChange({ [name]: value });
      }
    }
  }, [dataState.selectedProveedor, dataState.todasLasComunas, handleDataStateChange, handleFormStateChange]);

  const handleEdit = useCallback((row) => {
    handleDataStateChange({ selectedProveedor: row });
    handleFormStateChange({
      nombreproveedor: row.nombreproveedor,
      razonSocial: row.razonSocial,
      nombreFantasia: row.nombreFantasia,
      rutProveedor: row.rutProveedor,
      giroProveedor: row.giroProveedor,
      nombreRepresentante: row.nombreRepresentante,
      rutRepresentante: row.rutRepresentante,
      direccionFacturacion: row.direccionFacturacion,
      id_region: row.id_region,
      id_comuna: row.id_comuna,
      telCelular: row.telCelular,
      telFijo: row.telFijo,
      email: row.email,
      estado: row.estado,
      nombreidentificador: row.nombreidentificador,
      bonificacionano: row.bonificacionano,
      escala_rango: row.escala_rango
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
        await ProveedoresService.deleteProveedor(id);
        
        handleDataStateChange({
          rows: dataState.rows.filter(row => row.id !== id),
          filteredRows: dataState.filteredRows.filter(row => row.id !== id)
        });
        
        Swal.fire('Eliminado', 'El proveedor ha sido eliminado.', 'success');
      } catch (error) {
        handleError(error, { action: 'deleteProveedor', id });
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el proveedor'
        });
      }
    }
  }, [dataState.rows, dataState.filteredRows, handleDataStateChange, handleError]);

  const handleEstadoChange = useCallback(async (event, id) => {
    try {
      const newEstado = event.target.checked;
      await ProveedoresService.updateEstado(id, newEstado);

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
        text: `El proveedor ha sido ${newEstado ? 'activado' : 'desactivado'}`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      handleError(error, { action: 'updateEstado', id });
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el estado del proveedor'
      });
    }
  }, [dataState.rows, dataState.filteredRows, handleDataStateChange, handleError]);

  const handleSave = useCallback(async () => {
    try {
      const proveedorData = dataState.selectedProveedor || formState;
      
      if (!validarFormulario(proveedorData)) {
        Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: 'Por favor, corrija los errores antes de guardar'
        });
        return;
      }

      handleUiStateChange({ isSaving: true });
      
      const dataToSave = {
        nombreproveedor: proveedorData.nombreproveedor,
        razonSocial: proveedorData.razonSocial,
        nombreFantasia: proveedorData.nombreFantasia,
        rutProveedor: proveedorData.rutProveedor,
        giroProveedor: proveedorData.giroProveedor,
        nombreRepresentante: proveedorData.nombreRepresentante,
        rutRepresentante: proveedorData.rutRepresentante,
        direccionFacturacion: proveedorData.direccionFacturacion,
        id_region: proveedorData.id_region,
        id_comuna: proveedorData.id_comuna,
        telCelular: proveedorData.telCelular,
        telFijo: proveedorData.telFijo,
        email: proveedorData.email,
        estado: proveedorData.estado,
        nombreidentificador: proveedorData.nombreidentificador,
        bonificacionano: proveedorData.bonificacionano,
        escala_rango: proveedorData.escala_rango
      };

      await ProveedoresService.saveProveedor(
        dataToSave, 
        dataState.selectedProveedor?.id_proveedor
      );

      await fetchAllData();
      
      handleUiStateChange({ openModal: false, isSaving: false });
      handleDataStateChange({ selectedProveedor: null });
      handleFormStateChange(INITIAL_PROVEEDOR_STATE);

      Swal.fire({
        icon: 'success',
        title: 'Proveedor guardado',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      handleError(error, { action: 'saveProveedor' });
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el proveedor'
      });
      handleUiStateChange({ isSaving: false });
    }
  }, [dataState.selectedProveedor, formState, validarFormulario, handleUiStateChange, handleDataStateChange, handleFormStateChange, fetchAllData, handleError]);

  const handleExportToExcel = useCallback(() => {
    const exportData = dataState.filteredRows.map(row => ({
      'Identificador': row.nombreidentificador,
      'Proveedor': row.nombreproveedor,
      'Nombre Fantasía': row.nombreFantasia,
      'RUT': row.rutProveedor,
      'Giro': row.giroProveedor,
      'Representante': row.nombreRepresentante,
      'RUT Representante': row.rutRepresentante,
      'Razón Social': row.razonSocial,
      'Dirección': row.direccionFacturacion,
      'Región': row.region,
      'Comuna': row.comuna,
      'Teléfono Celular': row.telCelular,
      'Teléfono Fijo': row.telFijo,
      'Email': row.email,
      'Estado': row.estado ? 'Activo' : 'Inactivo',
      'Fecha Creación': row.fecha_formateada,
      'N° Soportes': row.num_soportes
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Proveedores');
    XLSX.writeFile(wb, 'Proveedores.xlsx');
  }, [dataState.filteredRows]);

  const handleOpenModal = useCallback(() => {
    handleDataStateChange({ selectedProveedor: null });
    handleFormStateChange(INITIAL_PROVEEDOR_STATE);
    handleUiStateChange({ openModal: true });
  }, [handleDataStateChange, handleFormStateChange, handleUiStateChange]);

  // Definición de columnas memoizada
  const columns = useMemo(() => [
    { 
      field: 'id_proveedor', 
      headerName: 'ID', 
      width: 60
    },
    { 
      field: 'nombreIdentificador', 
      headerName: 'Nombre', 
      width: 150,
      flex: 1
    },
    { 
      field: 'razonSocial', 
      headerName: 'Razón Social', 
      width: 150,
      flex: 1
    },
    { 
      field: 'rutProveedor', 
      headerName: 'RUT', 
      width: 120
    },
    { 
      field: 'region', 
      headerName: 'Región', 
      width: 130,
      flex: 1
    },
    { 
      field: 'comuna', 
      headerName: 'Comuna', 
      width: 130
    },
    {
      field: 'fecha_formateada',
      headerName: 'Fecha Creación',
      width: 160
    },
    {
      field: 'num_soportes',
      headerName: 'N° Soportes',
      width: 100,
      type: 'number',
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 100,
      renderCell: (params) => (
        <Switch
          checked={params.value}
          onChange={(e) => handleEstadoChange(e, params.row.id_proveedor)}
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
            onClick={() => navigate(`/proveedores/view/${params.row.id}`)}
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
            onClick={() => handleDelete(params.row.id)}
          >
            <i className="fas fa-trash-alt" style={{ color: '#206e43' }}></i>
          </IconButton>
        </div>
      )
    }
  ], [handleEdit, handleDelete, handleEstadoChange, navigate]);

  // Obtener datos del formulario actual
  const getCurrentFormData = useCallback(() => {
    return dataState.selectedProveedor || formState;
  }, [dataState.selectedProveedor, formState]);

  if (loading) {
    return <LoadingOptimized message="Cargando proveedores..." fullScreen />;
  }

  return (
    <div className="proveedores-container">
      <div className="header">
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          className="breadcrumb"
        >
          <Link component={RouterLink} to="/dashboard">
            Home
          </Link>
          <Typography color="text.primary">Proveedores</Typography>
        </Breadcrumbs>

        <div className="header-content">
          <Typography variant="h5" component="h1">
            Listado de Proveedores
          </Typography>
          <Button
            variant="contained"
            className="btn-agregar"
            onClick={handleOpenModal}
          >
            Agregar Proveedor
          </Button>
        </div>

        <Grid container spacing={3} style={{ marginBottom: '20px' }}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar proveedor..."
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
              Exportar Proveedores
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

      {/* Modal de Nuevo/Editar Proveedor */}
      <Dialog 
        open={uiState.openModal} 
        onClose={() => handleUiStateChange({ openModal: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dataState.selectedProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Proveedor"
                name="nombreproveedor"
                value={getCurrentFormData().nombreproveedor}
                onChange={handleInputChange}
                error={!!errors.nombreproveedor}
                helperText={errors.nombreproveedor}
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
                fullWidth
                label="Nombre Fantasía"
                name="nombreFantasia"
                value={getCurrentFormData().nombreFantasia}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="RUT Proveedor"
                name="rutProveedor"
                value={getCurrentFormData().rutProveedor}
                onChange={handleInputChange}
                error={!!errors.rutProveedor}
                helperText={errors.rutProveedor}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Razón Social"
                name="razonSocial"
                value={getCurrentFormData().razonSocial}
                onChange={handleInputChange}
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
                fullWidth
                label="Nombre Representante"
                name="nombreRepresentante"
                value={getCurrentFormData().nombreRepresentante}
                onChange={handleInputChange}
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
                fullWidth
                label="RUT Representante"
                name="rutRepresentante"
                value={getCurrentFormData().rutRepresentante}
                onChange={handleInputChange}
                error={!!errors.rutRepresentante}
                helperText={errors.rutRepresentante}
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
                required
                fullWidth
                label="Dirección Facturación"
                name="direccionFacturacion"
                value={getCurrentFormData().direccionFacturacion}
                onChange={handleInputChange}
                error={!!errors.direccionFacturacion}
                helperText={errors.direccionFacturacion}
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
                <InputLabel>Región</InputLabel>
                <Select
                  name="id_region"
                  value={getCurrentFormData().id_region}
                  onChange={handleInputChange}
                  label="Región"
                >
                  {Object.keys(dataState.regiones).map((region, index) => (
                    <MenuItem key={index} value={region}>
                      {dataState.regiones[region]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Comuna</InputLabel>
                <Select
                  name="id_comuna"
                  value={getCurrentFormData().id_comuna}
                  onChange={handleInputChange}
                  label="Comuna"
                  disabled={!getCurrentFormData().id_region}
                >
                  {Object.keys(dataState.comunasFiltradas).map((comuna, index) => (
                    <MenuItem key={index} value={comuna}>
                      {dataState.comunasFiltradas[comuna]}
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
                onChange={handleInputChange}
                error={!!errors.telCelular}
                helperText={errors.telCelular || 'Formato: +569XXXXXXXX'}
                sx={{ mt: 2 }}
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
                onChange={handleInputChange}
                error={!!errors.telFijo}
                helperText={errors.telFijo || 'Formato: +562XXXXXXX'}
                sx={{ mt: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {errors.telefono && (
              <Grid item xs={12}>
                <Typography color="error" variant="caption">
                  {errors.telefono}
                </Typography>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={getCurrentFormData().email}
                onChange={handleInputChange}
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Identificador"
                name="nombreidentificador"
                value={getCurrentFormData().nombreidentificador}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bonificación Año"
                name="bonificacionano"
                value={getCurrentFormData().bonificacionano}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <NumbersIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Escala Rango"
                name="escala_rango"
                value={getCurrentFormData().escala_rango}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <NumbersIcon />
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
                    onChange={(e) => {
                      if (dataState.selectedProveedor) {
                        handleDataStateChange({
                          selectedProveedor: {
                            ...dataState.selectedProveedor,
                            estado: e.target.checked
                          }
                        });
                      } else {
                        handleFormStateChange({ estado: e.target.checked });
                      }
                    }}
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

export default ProveedoresOptimized;