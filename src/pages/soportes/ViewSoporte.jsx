import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tab,
  Tabs,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Stack,
  CircularProgress,
  Breadcrumbs,
  InputAdornment,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  MenuItem,
  FormControl,
  Checkbox,
  Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import BusinessIcon from '@mui/icons-material/Business';
import CodeIcon from '@mui/icons-material/Code';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { supabase } from '../../config/supabase';
import Swal from 'sweetalert2';

// Componente de lista de checkboxes personalizado
const CustomCheckboxList = ({ medios, selectedMedios, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleToggle = () => setIsOpen(!isOpen);
  
  const handleCheckboxChange = (medioId) => {
    const newSelection = selectedMedios.includes(medioId)
      ? selectedMedios.filter(id => id !== medioId)
      : [...selectedMedios, medioId];
    onChange(newSelection);
  };

  return (
    <FormControl fullWidth>
      <Box sx={{ position: 'relative' }}>
        <Box
          onClick={handleToggle}
          sx={{
            border: '1px solid #ccc',
            borderRadius: 1,
            p: 1,
            minHeight: '40px',
            cursor: 'pointer',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5
          }}
        >
          {selectedMedios.length > 0 ? (
            selectedMedios.map(medioId => {
              const medio = medios.find(m => m.id === medioId);
              return medio ? (
                <Chip
                  key={medio.id}
                  label={medio.nombre_medio}
                  onDelete={() => handleCheckboxChange(medio.id)}
                  size="small"
                />
              ) : null;
            })
          ) : (
            <Typography color="text.secondary">Seleccionar medios</Typography>
          )}
        </Box>
        {isOpen && (
          <Paper
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              mt: 1,
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: 3
            }}
          >
            <Box sx={{ p: 1 }}>
              {medios.map((medio) => (
                <FormControlLabel
                  key={medio.id}
                  control={
                    <Checkbox
                      checked={selectedMedios.includes(medio.id)}
                      onChange={() => handleCheckboxChange(medio.id)}
                    />
                  }
                  label={medio.nombre_medio}
                />
              ))}
            </Box>
          </Paper>
        )}
      </Box>
    </FormControl>
  );
};

// Modal de edición
const EditModal = ({ open, onClose, soporte, onSave, medios }) => {
  const [form, setForm] = useState({
    nombreidentificador: '',
    bonificacionano: '',
    escala: '',
    estado: true,
    selectedMedios: []
  });

  useEffect(() => {
    if (soporte) {
      const mediosIds = medios
        .filter(m => soporte.medios?.includes(m.nombre_medio))
        .map(m => m.id);

      setForm({
        nombreidentificador: soporte.nombreidentificador || '',
        bonificacionano: soporte.bonificacionano || '',
        escala: soporte.escala || '',
        estado: soporte.estado,
        selectedMedios: mediosIds
      });
    }
  }, [soporte, medios]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Soporte</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Identificador"
                name="nombreidentificador"
                value={form.nombreidentificador}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckboxList
                medios={medios}
                selectedMedios={form.selectedMedios}
                onChange={(newMedios) => setForm(prev => ({ ...prev, selectedMedios: newMedios }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Bonificación"
                name="bonificacionano"
                type="number"
                value={form.bonificacionano}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Escala"
                name="escala"
                type="number"
                value={form.escala}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.estado}
                    onChange={(e) => setForm(prev => ({ ...prev, estado: e.target.checked }))}
                    name="estado"
                  />
                }
                label="Estado"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ViewSoporte = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [value, setValue] = useState(0);
  const [soporte, setSoporte] = useState(null);
  const [proveedor, setProveedor] = useState(null);
  const [programas, setProgramas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openProgramaModal, setOpenProgramaModal] = useState(false);
  const [isEditingPrograma, setIsEditingPrograma] = useState(false);
  const [medios, setMedios] = useState([]);
  const [programaForm, setProgramaForm] = useState({
    id: null,
    codigo_programa: '',
    descripcion: '',
    hora_inicio: '',
    hora_inicio_hora: '00',
    hora_inicio_min: '00',
    hora_fin: '',
    hora_fin_hora: '00',
    hora_fin_min: '00',
    cod_prog_megatime: '',
    estado: true
  });

  // Manejo de pestañas
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Cargar lista de medios
  const fetchMedios = async () => {
    try {
      const { data, error } = await supabase
        .from('medios')
        .select('*')
        .order('nombre_medio');

      if (error) throw error;
      setMedios(data);
    } catch (error) {
      console.error('Error al cargar medios:', error);
    }
  };

  useEffect(() => {
    fetchMedios();
  }, []);

  // Función para obtener los datos del soporte y su proveedor
  const fetchSoporte = async () => {
    setIsLoading(true);
    try {
      // Obtener datos del soporte
      const { data: soporteData, error: soporteError } = await supabase
        .from('soportes')
        .select('*')
        .eq('id_soporte', id)
        .single();

      if (soporteError) throw soporteError;

      // Obtener medios del soporte
      const { data: mediosData, error: mediosError } = await supabase
        .from('soporte_medios')
        .select('medios(id, nombre_medio)')
        .eq('id_soporte', id);

      if (mediosError) throw mediosError;

      const mediosNombres = mediosData
        .map(m => m.Medios?.nombre_medio)
        .filter(Boolean);

      setSoporte({
        ...soporteData,
        medios: mediosNombres
      });

      // Obtener el proveedor asociado (si existe id_proveedor en el soporte)
      if (soporteData.id_proveedor) {
        const { data: proveedorData, error: proveedorError } = await supabase
          .from('proveedores')
          .select('*')
          .eq('id_proveedor', soporteData.id_proveedor)
          .single();

        if (proveedorError) {
          console.warn('No se encontró proveedor para el soporte:', proveedorError);
        } else {
          setProveedor(proveedorData);
        }
      }

    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar los datos del soporte'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSoporte();
  }, [id]);

  // Función para cargar los programas asociados
  const fetchProgramas = async () => {
    try {
      console.log('Fetching programas for soporte:', id);
      // Como no existe el campo soporte_id, mostramos mensaje informativo
      setProgramas([]);
      console.log('La tabla programas no tiene relación directa con soportes');
    } catch (error) {
      console.error('Error al cargar los programas:', error);
      setProgramas([]);
    }
  };

  useEffect(() => {
    fetchProgramas();
  }, [id]);

  // Columnas para la tabla de programas
  const programasColumns = [
    { 
      field: 'codigo_programa', 
      headerName: 'Código', 
      flex: 1 
    },
    { 
      field: 'descripcion', 
      headerName: 'Descripción', 
      flex: 2 
    },
    { 
      field: 'hora_inicio', 
      headerName: 'Hora Inicio', 
      flex: 1,
      renderCell: (params) => (
        <Typography>
          {params.value || '-'}
        </Typography>
      )
    },
    { 
      field: 'hora_fin', 
      headerName: 'Hora Fin', 
      flex: 1,
      renderCell: (params) => (
        <Typography>
          {params.value || '-'}
        </Typography>
      )
    },
    { 
      field: 'cod_prog_megatime', 
      headerName: 'Cód. Megatime', 
      flex: 1 
    },
    {
      field: 'estado',
      headerName: 'Estado',
      flex: 0.8,
      renderCell: (params) => (
        <Typography color={params.value ? 'success.main' : 'error.main'}>
          {params.value ? 'Activo' : 'Inactivo'}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      flex: 1,
      renderCell: (params) => {
        // Verificar si el programa tiene c_orden = true
        const isOrdenCreada = params.row.c_orden === true;
        
        return (
          <Box>
            <IconButton 
              color="primary" 
              onClick={() => startEditPrograma(params.row)}
              disabled={isOrdenCreada}
              sx={{ 
                opacity: isOrdenCreada ? 0.5 : 1,
                '&:hover': {
                  backgroundColor: isOrdenCreada ? 'transparent' : undefined
                }
              }}
            >
              <EditIcon />
            </IconButton>
            <IconButton 
              color="error" 
              onClick={() => handleDeletePrograma(params.row.id)}
              disabled={isOrdenCreada}
              sx={{ 
                opacity: isOrdenCreada ? 0.5 : 1,
                '&:hover': {
                  backgroundColor: isOrdenCreada ? 'transparent' : undefined
                }
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        );
      }
    }
  ];

  // Función para obtener el siguiente ID disponible
  const getNextProgramaId = async () => {
    try {
      const { data, error } = await supabase
        .from('programas')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      // Si hay datos, retorna el siguiente ID, si no, empieza desde 1
      return data && data.length > 0 ? data[0].id + 1 : 1;
    } catch (error) {
      console.error('Error al obtener el siguiente ID:', error);
      throw error;
    }
  };

  // Función para guardar los cambios del soporte
  const handleSaveEdit = async (formData) => {
    try {
      // Actualizar datos básicos del soporte
      const { error: updateError } = await supabase
        .from('soportes')
        .update({
          nombreidentificador: formData.nombreidentificador,
          bonificacionano: formData.bonificacionano,
          escala: formData.escala,
          estado: formData.estado
        })
        .eq('id_soporte', id);

      if (updateError) throw updateError;

      // Eliminar medios existentes
      const { error: deleteError } = await supabase
        .from('soporte_medios')
        .delete()
        .eq('id_soporte', id);

      if (deleteError) throw deleteError;

      // Insertar nuevos medios
      if (formData.selectedMedios.length > 0) {
        const mediosToInsert = formData.selectedMedios.map(medioId => ({
          id_soporte: id,
          id_medio: medioId
        }));

        const { error: insertError } = await supabase
          .from('soporte_medios')
          .insert(mediosToInsert);

        if (insertError) throw insertError;
      }

      // Actualizar los datos
      await fetchSoporte();
      
      setOpenEditModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Soporte actualizado',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el soporte'
      });
    }
  };
  // Función para obtener el último código de programa megatime
  const fetchLastCodProgMegatime = async () => {
    try {
      // Consultar el último valor de cod_prog_megatime
      const { data, error } = await supabase
        .from('programas')
        .select('cod_prog_megatime')
        .not('cod_prog_megatime', 'is', null)
        .not('cod_prog_megatime', 'eq', '')
        .limit(100); // Obtener varios para asegurar encontrar valores numéricos
  
      if (error) throw error;
  
      if (data && data.length > 0) {
        // Filtrar solo los valores numéricos y encontrar el máximo
        const codigosNumericos = data
          .map(prog => prog.cod_prog_megatime)
          .filter(codigo => !isNaN(parseInt(codigo)))
          .map(codigo => parseInt(codigo));
        
        if (codigosNumericos.length > 0) {
          const maxCodigo = Math.max(...codigosNumericos);
          return (maxCodigo + 1).toString();
        }
      }
      
      // Si no hay datos o no se encontraron códigos numéricos, comenzar desde 4001
      return '4001';
    } catch (error) {
      console.error('Error al obtener último código:', error);
      // En caso de error, asignar un valor predeterminado
      return '4001';
    }
  };

  const handleSavePrograma = async () => {
    try {
      const nextId = await getNextProgramaId();
      
      // Obtener el siguiente código megatime
      const nextCodProgMegatime = await fetchLastCodProgMegatime();
      
      // Actualizar el formulario con el nuevo código
      const { codigo_programa, descripcion, hora_inicio, hora_fin, estado } = programaForm;
      
      console.log('Saving programa with hours:', { hora_inicio, hora_fin });

      const newPrograma = {
        id: nextId,
        codigo_programa,
        descripcion,
        hora_inicio,
        hora_fin,
        cod_prog_megatime: nextCodProgMegatime, // Usar el código generado automáticamente
        estado,
        soporte_id: id
      };

      console.log('New programa data:', newPrograma);

      const { data, error } = await supabase
        .from('programas')
        .insert([newPrograma])
        .select();

      if (error) throw error;

      console.log('Saved programa:', data);

      await fetchProgramas();
      setOpenProgramaModal(false);
      setProgramaForm({
        id: null,
        codigo_programa: '',
        descripcion: '',
        hora_inicio: '',
        hora_fin: '',
        cod_prog_megatime: '',
        estado: true
      });

      Swal.fire({
        icon: 'success',
        title: 'Programa agregado',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo agregar el programa'
      });
    }
  };

  // Función para editar un programa
  const handleEditPrograma = async () => {

    try {
      const { id: programaId, ...formData } = programaForm;
      
      const updateData = {
        ...formData,
        hora_inicio: formData.hora_inicio.length === 5 ? formData.hora_inicio : null,
        hora_fin: formData.hora_fin.length === 5 ? formData.hora_fin : null
      };

      const { error } = await supabase
        .from('programas')
        .update(updateData)
        .eq('id', programaId);

      if (error) throw error;

      await fetchProgramas();
      setOpenProgramaModal(false);
      setProgramaForm({
        id: null,
        codigo_programa: '',
        descripcion: '',
        hora_inicio: '',
        hora_fin: '',
        cod_prog_megatime: '',
        estado: true
      });
      setIsEditingPrograma(false);

      Swal.fire({
        icon: 'success',
        title: 'Programa actualizado',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo actualizar el programa'
      });
    }
  };

  // Función para eliminar un programa
  const handleDeletePrograma = async (programaId) => {
    try {
      // Primero verificar si el programa tiene c_orden = true
      const { data: programa, error: fetchError } = await supabase
        .from('programas')
        .select('c_orden')
        .eq('id', programaId)
        .single();
  
      if (fetchError) throw fetchError;
  
      // Si c_orden es true, mostrar mensaje y no permitir la eliminación
      if (programa.c_orden === true) {
        Swal.fire({
          icon: 'warning',
          title: 'No se puede eliminar',
          text: 'Este registro no se puede eliminar ya que forma parte de una Orden Creada.',
          confirmButtonColor: '#3085d6',
        });
        return;
      }
  
      // Si c_orden no es true, continuar con la eliminación
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });
  
      if (result.isConfirmed) {
        const { error } = await supabase
          .from('programas')
          .delete()
          .eq('id', programaId);
  
        if (error) throw error;
  
        await fetchProgramas();
  
        Swal.fire({
          icon: 'success',
          title: 'Programa eliminado',
          showConfirmButton: false,
          timer: 1500
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo eliminar el programa'
      });
    }
  };

  // Función para iniciar la edición de un programa
  const startEditPrograma = (programa) => {
    if (programa.c_orden === true) {
      Swal.fire({
        icon: 'warning',
        title: 'No se puede editar',
        text: 'Este registro no se puede actualizar ya que forma parte de una Orden Creada.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }
    
    // Extraer horas y minutos
    let hora_inicio_hora = '00';
    let hora_inicio_min = '00';
    let hora_fin_hora = '00';
    let hora_fin_min = '00';
    
    if (programa.hora_inicio && programa.hora_inicio.includes(':')) {
      const [horas, minutos] = programa.hora_inicio.split(':');
      hora_inicio_hora = horas;
      hora_inicio_min = minutos;
    }
    
    if (programa.hora_fin && programa.hora_fin.includes(':')) {
      const [horas, minutos] = programa.hora_fin.split(':');
      hora_fin_hora = horas;
      hora_fin_min = minutos;
    }
    
    setProgramaForm({
      id: programa.id,
      codigo_programa: programa.codigo_programa,
      descripcion: programa.descripcion,
      hora_inicio: programa.hora_inicio || '',
      hora_inicio_hora,
      hora_inicio_min,
      hora_fin: programa.hora_fin || '',
      hora_fin_hora,
      hora_fin_min,
      cod_prog_megatime: programa.cod_prog_megatime,
      estado: programa.estado
    });
    setIsEditingPrograma(true);
    setOpenProgramaModal(true);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link to="/soportes" style={{ textDecoration: 'none', color: 'inherit' }}>
            Soportes
          </Link>
          <Typography color="text.primary">Detalle del Soporte</Typography>
        </Breadcrumbs>
      </Box>
      <Grid container spacing={3}>
        {/* Contenedor izquierdo */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2,
              width: '100%',
              position: 'relative'
            }}
          >
            <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
              <IconButton
                size="small"
                color="primary"
                onClick={() => setOpenEditModal(true)}
              >
                <i className="fas fa-edit" style={{ color: 'white' }} />
              </IconButton>
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#4F46E5',
                textAlign: 'center',
                mb: 1
              }}
            >
              {soporte?.nombreidentificador || soporte?.nombreidentficiador}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#6B7280',
                textAlign: 'center',
                mb: 0.5
              }}
            >
              Medios: {soporte?.medios?.join(', ') || 'Sin medios asignados'}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#6B7280',
                textAlign: 'center',
                mb: 0.5
              }}
            >
              Bonificación: {soporte?.bonificacionano || 0}%
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#6B7280',
                textAlign: 'center',
                mb: 0.5
              }}
            >
              Escala: {soporte?.escala || 0}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#6B7280',
                textAlign: 'center'
              }}
            >
              Estado: {soporte?.estado ? 'Activo' : 'Inactivo'}
            </Typography>
          </Paper>
        </Grid>

        {/* Panel derecho con pestañas */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3}>
            <Box sx={{ padding: 1, width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange}>
                  <Tab label="Proveedor" />
                  <Tab label="Programas" />
                </Tabs>
              </Box>

              {/* Panel de Proveedor */}
              <TabPanel value={value} index={0}>
                {proveedor ? (
                  <>
                    <Typography variant="h6" gutterBottom>Datos Generales</Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <div className="mb-4">
                          <Typography variant="subtitle2" color="textSecondary">
                            Razón Social
                          </Typography>
                          <Typography variant="body1">{proveedor?.razonsocial || '-'}</Typography>
                        </div>
                      </Grid>
                      <Grid item xs={6}>
                        <div className="mb-4">
                          <Typography variant="subtitle2" color="textSecondary">
                            Nombre Fantasía
                          </Typography>
                          <Typography variant="body1">{proveedor?.nombrefantasia || '-'}</Typography>
                        </div>
                      </Grid>
                      <Grid item xs={6}>
                        <div className="mb-4">
                          <Typography variant="subtitle2" color="textSecondary">
                            Giro
                          </Typography>
                          <Typography variant="body1">{proveedor?.giro || '-'}</Typography>
                        </div>
                      </Grid>
                      <Grid item xs={6}>
                        <div className="mb-4">
                          <Typography variant="subtitle2" color="textSecondary">
                            Región
                          </Typography>
                          <Typography variant="body1">{proveedor?.Region || '-'}</Typography>
                        </div>
                      </Grid>
                      <Grid item xs={6}>
                        <div className="mb-4">
                          <Typography variant="subtitle2" color="textSecondary">
                            Comuna
                          </Typography>
                          <Typography variant="body1">{proveedor?.Comunas || '-'}</Typography>
                        </div>
                      </Grid>
                      <Grid item xs={6}>
                        <div className="mb-4">
                          <Typography variant="subtitle2" color="textSecondary">
                            Dirección
                          </Typography>
                          <Typography variant="body1">{proveedor?.direccion || '-'}</Typography>
                        </div>
                      </Grid>
                    </Grid>

                    <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Datos de Facturación</Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Stack spacing={2}>
                          <Typography><strong>Email:</strong> {proveedor?.email || '-'}</Typography>
                          <Typography><strong>Teléfono:</strong> {proveedor?.telefono || '-'}</Typography>
                          <Typography><strong>RUT:</strong> {proveedor?.rut || '-'}</Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </>
                ) : (
                  <Typography>No se encontró información del proveedor</Typography>
                )}
              </TabPanel>

              {/* Panel de Programas */}
              <TabPanel value={value} index={1}>
                <Box sx={{ mb: 2 }}>
                <Button 
  variant="contained" 
  color="primary" 
  startIcon={<AddIcon />}
  onClick={() => {
    setProgramaForm({
      id: null,
      codigo_programa: '',
      descripcion: '',
      hora_inicio: '00:00',
      hora_inicio_hora: '00',
      hora_inicio_min: '00',
      hora_fin: '00:00',
      hora_fin_hora: '00',
      hora_fin_min: '00',
      cod_prog_megatime: '',
      estado: true
    });
    setIsEditingPrograma(false);
    setOpenProgramaModal(true);
  }}
  sx={{ mb: 2 }}
>
  Agregar Programa
</Button>
                </Box>
                <Box sx={{ height: 400, width: '100%' }}>
                  <DataGrid
                    getRowId={(row) => row.id}
                    rows={programas}
                    columns={programasColumns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    disableSelectionOnClick
                  />
                </Box>
              </TabPanel>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <EditModal 
        open={openEditModal} 
        onClose={() => setOpenEditModal(false)} 
        soporte={soporte} 
        onSave={handleSaveEdit}
        medios={medios}
      />
      {/* Modal de Programa */}
      <Dialog open={openProgramaModal} onClose={() => setOpenProgramaModal(false)} maxWidth="sm" fullWidth>
  <DialogTitle>{isEditingPrograma ? 'Editar Programa' : 'Agregar Programa'}</DialogTitle>
  <DialogContent>
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Código de Programa"
            name="codigo_programa"
            value={programaForm.codigo_programa}
            onChange={(e) => setProgramaForm(prev => ({
              ...prev,
              codigo_programa: e.target.value
            }))}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Descripción"
            name="descripcion"
            value={programaForm.descripcion}
            onChange={(e) => setProgramaForm(prev => ({
              ...prev,
              descripcion: e.target.value
            }))}
            required
          />
        </Grid>
        
        {/* Hora inicio - Selectores */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Hora Inicio
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="hora-inicio-label">Hora</InputLabel>
                <Select
                  labelId="hora-inicio-label"
                  value={programaForm.hora_inicio_hora || "00"}
                  onChange={(e) => {
                    const horaValue = e.target.value;
                    const minValue = programaForm.hora_inicio_min || "00";
                    setProgramaForm({
                      ...programaForm,
                      hora_inicio_hora: horaValue,
                      hora_inicio: `${horaValue}:${minValue}`
                    });
                  }}
                  label="Hora"
                >
                  {Array.from({ length: 31 }, (_, i) => {
                    const hora = i.toString().padStart(2, '0');
                    return (
                      <MenuItem key={`hora-inicio-${hora}`} value={hora}>{hora}</MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="min-inicio-label">Minutos</InputLabel>
                <Select
                  labelId="min-inicio-label"
                  value={programaForm.hora_inicio_min || "00"}
                  onChange={(e) => {
                    const minValue = e.target.value;
                    const horaValue = programaForm.hora_inicio_hora || "00";
                    setProgramaForm({
                      ...programaForm,
                      hora_inicio_min: minValue,
                      hora_inicio: `${horaValue}:${minValue}`
                    });
                  }}
                  label="Minutos"
                >
                  {Array.from({ length: 60 }, (_, i) => {
                    const min = i.toString().padStart(2, '0');
                    return (
                      <MenuItem key={`min-inicio-${min}`} value={min}>{min}</MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
        
        {/* Hora fin - Selectores */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Hora Fin
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="hora-fin-label">Hora</InputLabel>
                <Select
                  labelId="hora-fin-label"
                  value={programaForm.hora_fin_hora || "00"}
                  onChange={(e) => {
                    const horaValue = e.target.value;
                    const minValue = programaForm.hora_fin_min || "00";
                    setProgramaForm({
                      ...programaForm,
                      hora_fin_hora: horaValue,
                      hora_fin: `${horaValue}:${minValue}`
                    });
                  }}
                  label="Hora"
                >
                  {Array.from({ length: 31 }, (_, i) => {
                    const hora = i.toString().padStart(2, '0');
                    return (
                      <MenuItem key={`hora-fin-${hora}`} value={hora}>{hora}</MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="min-fin-label">Minutos</InputLabel>
                <Select
                  labelId="min-fin-label"
                  value={programaForm.hora_fin_min || "00"}
                  onChange={(e) => {
                    const minValue = e.target.value;
                    const horaValue = programaForm.hora_fin_hora || "00";
                    setProgramaForm({
                      ...programaForm,
                      hora_fin_min: minValue,
                      hora_fin: `${horaValue}:${minValue}`
                    });
                  }}
                  label="Minutos"
                >
                  {Array.from({ length: 60 }, (_, i) => {
                    const min = i.toString().padStart(2, '0');
                    return (
                      <MenuItem key={`min-fin-${min}`} value={min}>{min}</MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Código Megatime"
            name="cod_prog_megatime"
            value={programaForm.cod_prog_megatime}
            onChange={(e) => setProgramaForm(prev => ({
              ...prev,
              cod_prog_megatime: e.target.value
            }))}
            disabled={!isEditingPrograma}
            helperText={!isEditingPrograma ? "Generado automáticamente" : ""}
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={programaForm.estado}
                onChange={(e) => setProgramaForm(prev => ({ ...prev, estado: e.target.checked }))}
                name="estado"
              />
            }
            label="Activo"
          />
        </Grid>
      </Grid>
    </Box>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenProgramaModal(false)}>Cancelar</Button>
    <Button onClick={isEditingPrograma ? handleEditPrograma : handleSavePrograma} variant="contained">
      {isEditingPrograma ? 'Actualizar' : 'Guardar'}
    </Button>
  </DialogActions>
</Dialog>
    </Container>
  );
};

// Componente TabPanel para manejar el contenido de las pestañas
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default ViewSoporte;
