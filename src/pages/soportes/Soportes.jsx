import React, { useState, useEffect } from 'react';
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
  Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { supabase } from '../../config/supabase';
import './Soportes.css';

const Soportes = () => {
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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchTerm, startDate, endDate, rows]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Primero intentar obtener los soportes básicos
      const { data: soportesData, error: soportesError } = await supabase
        .from('soportes')
        .select('*');
        
      if (soportesError) {
        console.error('Error fetching soportes:', soportesError);
        throw soportesError;
      }
      
      // Si no hay datos, establecer arrays vacíos
      if (!soportesData || soportesData.length === 0) {
        setRows([]);
        setFilteredRows([]);
        setLoading(false);
        return;
      }
      
      // Formatear los datos básicos
      const formattedRows = soportesData.map(soporte => ({
        id: soporte.id_soporte,
        nombreidentficiador: soporte.nombreidentficiador || '',
        bonificacionano: soporte.bonificacionano || 0,
        escala: soporte.escala || 0,
        estado: soporte.estado,
        nombreproveedor: 'Sin Proveedor',
        id_proveedor: null,
        medios: 'Sin medios',
        fechaCreacion: soporte.created_at ? new Date(soporte.created_at).toLocaleDateString('es-CL', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : 'Sin fecha',
        created_at: soporte.created_at
      }));

      setRows(formattedRows);
      setFilteredRows(formattedRows);
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
      // Verificar si hay datos para filtrar
      if (!rows || rows.length === 0) {
        setFilteredRows([]);
        return;
      }
      
      let filtered = [...rows];

      if (searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        filtered = filtered.filter(row =>
          row.nombreidentficiador?.toLowerCase().includes(searchTermLower) ||
          row.nombreproveedor?.toLowerCase().includes(searchTermLower)
        );
      }

      if (startDate && endDate) {
        filtered = filtered.filter(row => {
          // Verificar si la fecha es válida
          if (!row.created_at) return false;
          
          const rowDate = new Date(row.created_at);
          const start = new Date(startDate);
          const end = new Date(endDate);
          
          // Verificar si las fechas son válidas
          if (isNaN(rowDate.getTime()) || isNaN(start.getTime()) || isNaN(end.getTime())) {
            return false;
          }
          
          return rowDate >= start && rowDate <= end;
        });
      }

      setFilteredRows(filtered);
    } catch (error) {
      console.error('Error filtering data:', error);
      // En caso de error, mostrar todos los datos
      setFilteredRows(rows);
    }
  };

  const handleExportToExcel = () => {
    try {
      // Verificar si hay datos para exportar
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
        'Proveedor': row.nombreproveedor || 'Sin proveedor',
        'Bonificación Año': row.bonificacionano || 0,
        'Escala': row.escala || 0,
        'Medios': row.medios || 'Sin medios',
        'Estado': row.estado ? 'Activo' : 'Inactivo'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Soportes');
      
      // Ajustar anchos de columna
      const colWidths = [
        { wch: 15 }, // Fecha
        { wch: 20 }, // Identificador
        { wch: 30 }, // Proveedor
        { wch: 15 }, // Bonificación
        { wch: 15 }, // Escala
        { wch: 20 }, // Medios
        { wch: 10 }  // Estado
      ];
      ws['!cols'] = colWidths;

      const fileName = searchTerm || startDate || endDate ?
        'Soportes_Filtrados.xlsx' :
        'Todos_Los_Soportes.xlsx';
      
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
      
      // Verificar que el ID sea válido
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

      // Actualizar el estado local
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

  const columns = [
    {
      field: 'nombreidentficiador',
      headerName: 'Identificador',
      width: 150,
      headerClassName: 'data-grid-header',
      flex: 1
    },
    {
      field: 'fechaCreacion',
      headerName: 'Fecha Creación',
      width: 120,
      headerClassName: 'data-grid-header'
    },
    {
      field: 'nombreproveedor',
      headerName: 'Proveedor',
      width: 200,
      headerClassName: 'data-grid-header',
      flex: 1
    },
    {
      field: 'medios',
      headerName: 'Medios',
      width: 200,
      headerClassName: 'data-grid-header',
      flex: 1.5
    },
    {
      field: 'bonificacionano',
      headerName: 'Bonificación Año',
      width: 150,
      headerClassName: 'data-grid-header'
    },
    {
      field: 'escala',
      headerName: 'Escala',
      width: 120,
      headerClassName: 'data-grid-header'
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 80,
      headerClassName: 'data-grid-header',
      renderCell: (params) => (
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
      )
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 180,
      renderCell: (params) => (
        <div className="action-buttons">
          <IconButton
            color="primary"
            size="small"
            onClick={() => {
              if (params.row.id_proveedor) {
                navigate(`/proveedores/view/${params.row.id_proveedor}`);
              } else {
                Swal.fire({
                  icon: 'warning',
                  title: 'Sin proveedor',
                  text: 'Este soporte no tiene un proveedor asignado'
                });
              }
            }}
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton
            color="success"
            size="small"
            onClick={() => {
              setEditMode(true);
              setFormData(params.row);
              setOpenModal(true);
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => {
              // Aquí iría la lógica para eliminar el soporte
            }}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      )
    }
  ];

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditMode(false);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        // Lógica para actualizar soporte existente
        const { error } = await supabase
          .from('soportes')
          .update({
            nombreidentficiador: formData.nombreidentficiador,
            bonificacionano: formData.bonificacionano,
            escala: formData.escala,
            descripcion: formData.descripcion,
            estado: formData.estado
          })
          .eq('id_soporte', formData.id);

        if (error) throw error;

        await Swal.fire({
          icon: 'success',
          title: 'Soporte actualizado',
          text: 'El soporte se ha actualizado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // Lógica para crear nuevo soporte
        const { error } = await supabase
          .from('soportes')
          .insert([{
            nombreidentficiador: formData.nombreidentficiador,
            bonificacionano: formData.bonificacionano,
            escala: formData.escala,
            descripcion: formData.descripcion,
            estado: formData.estado
          }]);

        if (error) throw error;

        await Swal.fire({
          icon: 'success',
          title: 'Soporte creado',
          text: 'El soporte se ha creado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      }

      handleCloseModal();
      fetchData(); // Recargar los datos
    } catch (error) {
      console.error('Error saving soporte:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el soporte: ' + error.message
      });
    }
  };

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
            Listado de Soportes
          </Typography>
        
        </div>

        <Grid container spacing={3} style={{ marginBottom: '20px' }}>
          <Grid item xs={12} sm={4}>
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
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            label="📅 Desde"
            InputLabelProps={{ shrink: true }}
            className="date-input"
            sx={{
            '& .MuiOutlinedInput-root': {
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
            }
            }}
          />
          </Grid>
          <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            type="date"
            variant="outlined"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            label="📅 Hasta"
            InputLabelProps={{ shrink: true }}
            className="date-input"
            sx={{
            '& .MuiOutlinedInput-root': {
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
            }
            }}
          />
          </Grid>
          <Grid item xs={12} sm={2}>
          <Button
            variant="contained"
            onClick={handleExportToExcel}
            startIcon={<FileDownloadIcon sx={{ color: '#fff' }} />}
            sx={{
            backgroundColor: '#206e43',
            color: '#fff',
            height: '72%',
            width: '70%',
            '&:hover': {
              backgroundColor: '#185735',
            },
            }}
          >
            Exportar Soportes
          </Button>
          </Grid>
        </Grid>

      </div>

      <div className="data-grid-container">
        {filteredRows && filteredRows.length > 0 ? (
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
              {loading ? 'Cargando datos...' : 'No hay datos para mostrar'}
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EditIcon />
                    </InputAdornment>
                  ),
                }}
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FileDownloadIcon />
                    </InputAdornment>
                  ),
                }}
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FileDownloadIcon />
                    </InputAdornment>
                  ),
                }}
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EditIcon />
                    </InputAdornment>
                  ),
                }}
              />
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
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Soportes;
