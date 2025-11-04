import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Container, Paper, Button, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, InputAdornment, Checkbox, FormControlLabel, Switch, Box, useMediaQuery, Fab, Avatar, Card, CardContent, Pagination, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Search as SearchIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import CodeIcon from '@mui/icons-material/Code';
import TimerIcon from '@mui/icons-material/Timer';
import DataObjectIcon from '@mui/icons-material/DataObject';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import HighQualityIcon from '@mui/icons-material/HighQuality';
import HandshakeIcon from '@mui/icons-material/Handshake';
import CategoryIcon from '@mui/icons-material/Category';
import { supabase } from '../../config/supabase';
import { mapearDatos } from '../../config/mapeo-campos';
import './Medios.css';
import Swal from 'sweetalert2';
import { Link as RouterLink } from 'react-router-dom';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function Medios() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [medios, setMedios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [mobilePage, setMobilePage] = useState(1);

  // Estado inicial para un nuevo medio
  const initialFormState = {
    NombredelMedio: '',
    codigo: '',
    estado: true,
    duracion: false,
    codigo_megatime: false,
    color: false,
    calidad: false,
    cooperado: false,
    rubro: false
  };

  const [medioForm, setMedioForm] = useState(initialFormState);

  // Columnas para el DataGrid
  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'nombre', headerName: 'Nombre del Medio', width: 200 },
   
    { field: 'codigo', headerName: 'Código', width: 130 },
    { field: 'duracion', headerName: 'Duración', width: 100,
      renderCell: (params) => (
        <span>{params.value ? 'Sí' : 'No'}</span>
      )
    },
    { field: 'codigo_megatime', headerName: 'Código Megatime', width: 150,
      renderCell: (params) => (
        <span>{params.value ? 'Sí' : 'No'}</span>
      )
    },
    { field: 'color', headerName: 'Color', width: 100,
      renderCell: (params) => (
        <span>{params.value ? 'Sí' : 'No'}</span>
      )
    },
    { field: 'calidad', headerName: 'Calidad', width: 100,
      renderCell: (params) => (
        <span>{params.value ? 'Sí' : 'No'}</span>
      )
    },
    { field: 'cooperado', headerName: 'Cooperado', width: 120,
      renderCell: (params) => (
        <span>{params.value ? 'Sí' : 'No'}</span>
      )
    },
    { field: 'rubro', headerName: 'Rubro', width: 100,
      renderCell: (params) => (
        <span>{params.value ? 'Sí' : 'No'}</span>
      )
    },
    { field: 'estado', headerName: 'Estado', width: 100,
      renderCell: (params) => (
        <Switch
          checked={params.value}
          onChange={(e) => handleEstadoChange(params.row.id, e.target.checked)}
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
        <>
          <IconButton
            onClick={() => handleView(params.row)}
            color="primary"
            size="small"
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton onClick={() => handleEdit(params.row)} color="success" size="small">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)} color="error" size="small">
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  // Cargar medios
  useEffect(() => {
    fetchMedios();
  }, []);

  const fetchMedios = async () => {
    try {
      const { data, error } = await supabase
        .from('medios')
        .select('*');

      if (error) throw error;

      // Mapear los datos al formato esperado por el frontend
      const datosMapeados = mapearDatos('medios', data);
      console.log('Datos originales:', data);
      console.log('Datos mapeados:', datosMapeados);

      setMedios(datosMapeados);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar medios:', error);
      setLoading(false);
    }
  };

  // Manejadores de eventos
  const handleOpenDialog = () => {
    setMedioForm(initialFormState);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setMedioForm(initialFormState);
  };

  const handleEdit = (medio) => {
    setMedioForm({
      id: medio.id,
      NombredelMedio: medio.nombre || medio.nombre_medio || '',
      codigo: medio.codigo || '',
      estado: medio.estado || false,
      duracion: medio.duracion || false,
      codigo_megatime: medio.codigo_megatime || false,
      color: medio.color || false,
      calidad: medio.calidad || false,
      cooperado: medio.cooperado || false,
      rubro: medio.rubro || false
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    try {
      // Mostrar confirmación antes de eliminar
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
        const { error } = await supabase
          .from('medios')
          .delete()
          .eq('id', id);

        if (error) throw error;

        // Mostrar mensaje de éxito
        await Swal.fire(
          '¡Eliminado!',
          'El medio ha sido eliminado.',
          'success'
        );

        fetchMedios();
      }
    } catch (error) {
      console.error('Error al eliminar medio:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el medio'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let operation;
      
      if (medioForm.id) {
        // Actualización de un medio existente
        operation = supabase
          .from('medios')
          .update({
            nombre_medio: medioForm.NombredelMedio,
            codigo: medioForm.codigo,
            estado: medioForm.estado,
            duracion: medioForm.duracion,
            codigo_megatime: medioForm.codigo_megatime,
            color: medioForm.color,
            calidad: medioForm.calidad,
            cooperado: medioForm.cooperado,
            rubro: medioForm.rubro
          })
          .eq('id', medioForm.id);
      } else {
        // Inserción de un nuevo medio
        operation = supabase
          .from('medios')
          .insert([{
            nombre_medio: medioForm.NombredelMedio,
            codigo: medioForm.codigo || null,
            estado: medioForm.estado,
            duracion: medioForm.duracion,
            codigo_megatime: medioForm.codigo_megatime,
            color: medioForm.color,
            calidad: medioForm.calidad,
            cooperado: medioForm.cooperado,
            rubro: medioForm.rubro
          }]);
      }
      
      const { error } = await operation;

      if (error) throw error;

      // Actualizar la lista de medios
      await fetchMedios();
      
      // Cerrar el diálogo y limpiar el formulario
      setOpenDialog(false);
      setMedioForm(initialFormState);

      // Mostrar mensaje de éxito
      await Swal.fire({
        icon: 'success',
        title: medioForm.id ? 'Medio Actualizado' : 'Medio Agregado',
        text: medioForm.id 
          ? 'El medio ha sido actualizado exitosamente' 
          : 'El medio ha sido agregado exitosamente',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error al guardar medio:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el medio'
      });
    }
  };

  const handleEstadoChange = async (id, newValue) => {
    try {
      const { error } = await supabase
        .from('medios')
        .update({ estado: newValue })
        .eq('id', id);

      if (error) throw error;

      // Actualizar el estado local
      setMedios(medios.map(medio =>
        medio.id === id ? { ...medio, estado: newValue } : medio
      ));

      // Mostrar mensaje de éxito
      await Swal.fire({
        icon: 'success',
        title: 'Estado Actualizado',
        text: `El estado ha sido ${newValue ? 'activado' : 'desactivado'} exitosamente`,
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error al actualizar estado:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el estado'
      });
    }
  };

  const handleView = (medio) => {
    // Por ahora solo mostrar información del medio
    Swal.fire({
      title: 'Información del Medio',
      html: `
        <div style="text-align: left;">
          <p><strong>ID:</strong> ${medio.id}</p>
          <p><strong>Nombre:</strong> ${medio.nombre || medio.nombre_medio}</p>
          <p><strong>Código:</strong> ${medio.codigo || 'N/A'}</p>
          <p><strong>Estado:</strong> ${medio.estado ? 'Activo' : 'Inactivo'}</p>
          <p><strong>Duración:</strong> ${medio.duracion ? 'Sí' : 'No'}</p>
          <p><strong>Código Megatime:</strong> ${medio.codigo_megatime ? 'Sí' : 'No'}</p>
          <p><strong>Color:</strong> ${medio.color ? 'Sí' : 'No'}</p>
          <p><strong>Calidad:</strong> ${medio.calidad ? 'Sí' : 'No'}</p>
          <p><strong>Cooperado:</strong> ${medio.cooperado ? 'Sí' : 'No'}</p>
          <p><strong>Rubro:</strong> ${medio.rubro ? 'Sí' : 'No'}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  };

  // Filtrado de medios
  const filteredMedios = medios.filter(medio =>
    ((medio.nombre || medio.nombre_medio) && (medio.nombre || medio.nombre_medio).toLowerCase().includes(searchTerm.toLowerCase())) ||
    (medio.codigo && medio.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="medios-container animate-fade-in">
      {/* Header moderno con gradiente - Oculto en móvil */}
      {!isMobile && (
        <div className="modern-header animate-slide-down">
          <div className="modern-title" style={{ fontSize: '1rem', marginTop: '14px', lineHeight: '1' }}>
            📺 LISTADO DE MEDIOS
          </div>
        </div>
      )}

      {/* Versión móvil */}
      {isMobile ? (
        <>
          <Box sx={{ p: 2 }}>
            {/* Barra de búsqueda móvil */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="🔍 Buscar medio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            {/* Botones de acción */}
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                className="btn-agregar"
                startIcon={<AddIcon sx={{ color: 'white' }} />}
                onClick={handleOpenDialog}
                sx={{ borderRadius: '12px', flex: 1 }}
              >
                Agregar
              </Button>
            </Box>

            {/* Cards creativos para medios */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              {filteredMedios.slice((mobilePage - 1) * 10, mobilePage * 10).map((medio, index) => (
                <Card
                  key={medio.id}
                  sx={{
                    background: `linear-gradient(135deg, ${
                      index % 4 === 0 ? '#667eea 0%, #764ba2 100%' :
                      index % 4 === 1 ? '#f093fb 0%, #f5576c 100%' :
                      index % 4 === 2 ? '#4facfe 0%, #00f2fe 100%' :
                      '#43e97b 0%, #38f9d7 100%'
                    })`,
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  {/* Header del Card */}
                  <Box sx={{
                    background: 'rgba(255,255,255,0.95)',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    {/* Avatar con iniciales */}
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        background: `linear-gradient(135deg, ${
                          index % 4 === 0 ? '#667eea 0%, #764ba2 100%' :
                          index % 4 === 1 ? '#f093fb 0%, #f5576c 100%' :
                          index % 4 === 2 ? '#4facfe 0%, #00f2fe 100%' :
                          '#43e97b 0%, #38f9d7 100%'
                        })`,
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'white'
                      }}
                    >
                      {(medio.nombre || medio.nombre_medio || medio.NombredelMedio)?.charAt(0) || '?'}
                    </Avatar>

                    {/* Información principal */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          color: '#1e293b',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {medio.nombre || medio.nombre_medio || medio.NombredelMedio}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}>
                        <Chip
                          label={medio.codigo || 'Sin código'}
                          size="small"
                          icon={<CodeIcon />}
                          sx={{
                            height: '24px',
                            fontSize: '0.75rem',
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            color: '#667eea',
                            fontWeight: 600
                          }}
                        />
                        <Chip
                          label={medio.estado ? '✓ Activo' : '✗ Inactivo'}
                          size="small"
                          sx={{
                            height: '24px',
                            fontSize: '0.75rem',
                            backgroundColor: medio.estado ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: medio.estado ? '#16a34a' : '#dc2626',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Botones de acción */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleView(medio)}
                        sx={{
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.2)' }
                        }}
                      >
                        <VisibilityIcon fontSize="small" sx={{ color: '#3b82f6' }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(medio)}
                        sx={{
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          '&:hover': { backgroundColor: 'rgba(34, 197, 94, 0.2)' }
                        }}
                      >
                        <EditIcon fontSize="small" sx={{ color: '#22c55e' }} />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Detalles adicionales */}
                  <Box sx={{
                    background: 'rgba(255,255,255,0.85)',
                    p: 2,
                    pt: 1
                  }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                          📺 Código Megatime
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {medio.codigo_megatime ? 'Sí' : 'No'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                          ⏱️ Duración
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {medio.duracion ? 'Sí' : 'No'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                          🎨 Color
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {medio.color ? 'Sí' : 'No'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                          ⭐ Calidad
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {medio.calidad ? 'Sí' : 'No'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                          🤝 Cooperado
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {medio.cooperado ? 'Sí' : 'No'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                          📁 Rubro
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {medio.rubro ? 'Sí' : 'No'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              ))}

              {/* Mensaje si no hay medios */}
              {filteredMedios.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="body1" color="text.secondary">
                    No se encontraron medios
                  </Typography>
                </Box>
              )}

            </Box>

            {/* Paginación móvil */}
            {filteredMedios.length > 10 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
                <Pagination
                  count={Math.ceil(filteredMedios.length / 10)}
                  page={mobilePage}
                  onChange={(event, value) => {
                    setMobilePage(value);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  color="primary"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: '12px',
                      fontWeight: 600,
                      minWidth: '40px',
                      height: '40px',
                      '&.Mui-selected': {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 700,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        }
                      }
                    }
                  }}
                />
              </Box>
            )}

            {/* Contador de resultados */}
            <Box sx={{ textAlign: 'center', mb: 10 }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                Mostrando {Math.min((mobilePage - 1) * 10 + 1, filteredMedios.length)}-{Math.min(mobilePage * 10, filteredMedios.length)} de {filteredMedios.length} medio{filteredMedios.length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            {/* FAB para agregar medio */}
            <Fab
              color="primary"
              aria-label="add"
              onClick={handleOpenDialog}
              sx={{
                position: 'fixed',
                bottom: 80,
                right: 16,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                }
              }}
            >
              <AddIcon />
            </Fab>
          </Box>
        </>
      ) : (
        /* Versión escritorio */
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
          mt: 3
        }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              variant="outlined"
              placeholder="🔍 Buscar medio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              sx={{
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': {
                    borderColor: 'var(--gradient-primary)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--gradient-primary)',
                  },
                }
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              className="btn-agregar"
              startIcon={<AddIcon sx={{ color: 'white' }} />}
              onClick={handleOpenDialog}
            >
              Agregar Nuevo Medio
            </Button>
          </Box>
        </Box>
      )}

      {/* DataGrid solo visible en escritorio */}
      {!isMobile && (
        <div className="data-grid-container">
          <DataGrid
            rows={filteredMedios}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            disableSelectionOnClick
            loading={loading}
            autoHeight
            rowHeight={56}
            columnHeaderHeight={56}
            localeText={{
              noRowsLabel: 'No hay datos para mostrar',
              footerRowSelected: count => `${count} fila${count !== 1 ? 's' : ''} seleccionada${count !== 1 ? 's' : ''}`,
              footerTotalRows: 'Filas totales:',
              footerTotalVisibleRows: (visibleCount, totalCount) => `${visibleCount.toLocaleString()} de ${totalCount.toLocaleString()}`,
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
            pageSizeOptions={[10]}
            sx={{
              '& .MuiDataGrid-footerContainer': {
                borderTop: '1px solid rgba(102, 126, 234, 0.1) !important',
                background: 'rgba(255,255,255,0.8) !important',
              },
              '& .MuiDataGrid-footerContainer .MuiTablePagination-root .MuiTablePagination-selectLabel': {
                display: 'none'
              },
              '& .MuiDataGrid-footerContainer .MuiTablePagination-root .MuiTablePagination-select': {
                display: 'none'
              },
              '& .MuiDataGrid-footerContainer .MuiTablePagination-root .MuiTablePagination-selectIcon': {
                display: 'none'
              },
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          />
        </div>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{medioForm.id ? 'Editar Medio' : 'Agregar Medio'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre del Medio"
            value={medioForm.NombredelMedio}
            onChange={(e) => setMedioForm({ ...medioForm, NombredelMedio: e.target.value })}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <NewspaperIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Código"
            value={medioForm.codigo}
            onChange={(e) => setMedioForm({ ...medioForm, codigo: e.target.value })}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CodeIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={medioForm.estado}
                onChange={(e) => setMedioForm({ ...medioForm, estado: e.target.checked })}
                color="primary"
              />
            }
            label="Estado Activo"
            sx={{ marginTop: 2, marginBottom: 1 }}
          />

          {/* Campos booleanos */}
          <div className="checkbox-group">
            <FormControl component="fieldset" margin="normal">
              <div className="checkbox-container">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={medioForm.duracion}
                      onChange={(e) => setMedioForm({ ...medioForm, duracion: e.target.checked })}
                      size="small"
                    />
                  }
                  label="Duración"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={medioForm.calidad}
                      onChange={(e) => setMedioForm({ ...medioForm, calidad: e.target.checked })}
                      size="small"
                    />
                  }
                  label="Calidad"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={medioForm.codigo_megatime}
                      onChange={(e) => setMedioForm({ ...medioForm, codigo_megatime: e.target.checked })}
                      size="small"
                    />
                  }
                  label="Código Megatime"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={medioForm.cooperado}
                      onChange={(e) => setMedioForm({ ...medioForm, cooperado: e.target.checked })}
                      size="small"
                    />
                  }
                  label="Cooperado"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={medioForm.color}
                      onChange={(e) => setMedioForm({ ...medioForm, color: e.target.checked })}
                      size="small"
                    />
                  }
                  label="Color"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={medioForm.rubro}
                      onChange={(e) => setMedioForm({ ...medioForm, rubro: e.target.checked })}
                      size="small"
                    />
                  }
                  label="Rubro"
                />
              </div>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} color="primary">
            {medioForm.id ? 'Guardar' : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
