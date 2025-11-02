import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  FormControl,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Card,
  CardContent,
  Autocomplete,
  TextField,
  CircularProgress,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Collapse,
  FormControlLabel,
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { supabase } from '../../config/supabase';
import { planningService } from '../../services/planningService';
import Swal from 'sweetalert2';
import './NuevoPlan.css';

const steps = ['Seleccionar Cliente', 'Seleccionar Campaña', 'Alternativas'];

const NuevoPlan = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [clientes, setClientes] = useState([]);
  const [searchCliente, setSearchCliente] = useState('');
  const [campanas, setCampanas] = useState([]);
  const [temas, setTemas] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedCampana, setSelectedCampana] = useState('');
  const [selectedTemas, setSelectedTemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openTemaModal, setOpenTemaModal] = useState(false);
  const [nuevoTema, setNuevoTema] = useState({
    nombre_tema: '',
    descripcion: '',
    id_medio: '',
    id_calidad: '',
    estado: true
  });
  const [medios, setMedios] = useState([]);
  const [calidades, setCalidades] = useState([]);
  const [anios, setAnios] = useState([]);
  const [meses, setMeses] = useState([]);
  const [planData, setPlanData] = useState({
    nombre_plan: '',
    anio: '',
    mes: '',
  });
  const [validationResult, setValidationResult] = useState(null);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    fetchClientes();
    fetchAnios();
    fetchMeses();
    fetchMedios();
    fetchCalidades();
  }, []);

  useEffect(() => {
    if (selectedCliente) {
      fetchCampanas(selectedCliente.id_cliente);
    }
  }, [selectedCliente]);

  useEffect(() => {
    if (selectedCampana) {
      fetchTemas(selectedCampana);
    }
  }, [selectedCampana]);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nombrecliente');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampanas = async (clienteId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('campania')
        .select(`
          *,
          clientes!id_cliente (
            id_cliente,
            nombrecliente
          ),
          productos!id_producto (
            id,
            nombredelproducto
          ),
          anios!id_anio (
            id,
            years
          )
        `)
        .eq('id_cliente', clienteId)
        .order('nombrecampania');

      if (error) {
        console.error('Error detallado:', error);
        throw error;
      }
      console.log('Datos de campañas:', data);
      setCampanas(data || []);
    } catch (error) {
      console.error('Error al cargar campañas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemas = async (campanaId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('campania_temas')
        .select(`
          id_temas,
          temas!inner (
            id_tema,
            nombre_tema,
            descripcion,
            id_medio,
            id_calidad,
            estado,
            medios!id_medio (
              id,
              nombredelmedio
            ),
            calidad!id_calidad (
              id,
              nombrecalidad
            )
          )
        `)
        .eq('id_campania', campanaId);

      if (error) throw error;

      // Transformar la estructura de datos
      const temasTransformados = data?.map(item => ({
        ...item.temas,
        id_tema: item.id_temas,
        Calidad: item.temas.calidad ? {
          id_calidad: item.temas.calidad.id,
          nombrecalidad: item.temas.calidad.nombrecalidad
        } : null,
        Medios: item.temas.medios ? {
          id_medio: item.temas.medios.id,
          nombredelmedio: item.temas.medios.nombredelmedio
        } : null
      })) || [];

      console.log('Temas transformados:', temasTransformados);
      setTemas(temasTransformados);
    } catch (error) {
      console.error('Error al cargar temas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnios = async () => {
    try {
      const { data, error } = await supabase
        .from('anios')
        .select('id, years')
        .order('years', { ascending: false });

      if (error) throw error;
      setAnios(data || []);
    } catch (error) {
      console.error('Error al cargar años:', error);
    }
  };

  const fetchMeses = async () => {
    try {
      const { data, error } = await supabase
        .from('meses')
        .select('*')
        .order('id');

      if (error) throw error;
      console.log('Datos de meses recibidos:', data);
      setMeses(data || []);
    } catch (error) {
      console.error('Error al cargar meses:', error);
    }
  };

  const fetchMedios = async () => {
    try {
      const { data, error } = await supabase
        .from('medios')
        .select('*')
        .order('nombredelmedio');

      if (error) throw error;
      setMedios(data || []);
    } catch (error) {
      console.error('Error al cargar medios:', error);
    }
  };

  const fetchCalidades = async () => {
    try {
      const { data, error } = await supabase
        .from('calidad')
        .select('*')
        .order('nombrecalidad');

      if (error) throw error;
      setCalidades(data || []);
    } catch (error) {
      console.error('Error al cargar calidades:', error);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSearchChange = (event) => {
    setSearchCliente(event.target.value);
  };

  const handleClienteChange = (event, newValue) => {
    setSelectedCliente(newValue);
    setSelectedCampana('');
    setSelectedTemas([]);
    setCampanas([]);
    setTemas([]);
    if (newValue) {
      fetchCampanas(newValue.id_cliente);
    }
  };

  const handleCampanaChange = (event) => {
    setSelectedCampana(event.target.value);
    setSelectedTemas([]);
    setTemas([]);
  };

  const handleTemaSelect = (temaId) => {
    setSelectedTemas(prev => {
      if (prev.includes(temaId)) {
        return prev.filter(id => id !== temaId);
      }
      return [...prev, temaId];
    });
  };

  const handlePlanDataChange = (field) => (event) => {
    setPlanData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const validateAndCreatePlan = async () => {
    // Simplemente crear el plan sin validaciones complejas
    createPlan();
  };

  const handleCreateTema = async () => {
    try {
      if (!nuevoTema.nombre_tema || !nuevoTema.id_medio || !nuevoTema.id_calidad) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos incompletos',
          text: 'Por favor, complete todos los campos requeridos',
          confirmButtonColor: '#3085d6'
        });
        return;
      }

      setLoading(true);

      // Insertar nuevo tema
      const { data: temaData, error: temaError } = await supabase
        .from('temas')
        .insert([nuevoTema])
        .select()
        .single();

      if (temaError) throw temaError;

      // Asociar el tema a la campaña actual
      if (selectedCampana) {
        const { error: relacionError } = await supabase
          .from('campania_temas')
          .insert([{
            id_campania: selectedCampana,
            id_temas: temaData.id_tema
          }]);

        if (relacionError) throw relacionError;
      }

      // Limpiar formulario y cerrar modal
      setNuevoTema({
        nombre_tema: '',
        descripcion: '',
        id_medio: '',
        id_calidad: '',
        estado: true
      });
      setOpenTemaModal(false);

      // Recargar temas
      if (selectedCampana) {
        await fetchTemas(selectedCampana);
      }

      Swal.fire({
        icon: 'success',
        title: '¡Tema creado exitosamente!',
        text: 'El tema ha sido creado y asociado a la campaña',
        confirmButtonColor: '#3085d6',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Error al crear tema:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al crear tema',
        text: error.message || 'Ha ocurrido un error inesperado',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTemaChange = (field) => (event) => {
    setNuevoTema(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleOpenTemaModal = () => {
    if (!selectedCampana) {
      Swal.fire({
        icon: 'warning',
        title: 'Seleccione una campaña',
        text: 'Debe seleccionar una campaña antes de crear temas',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
    setOpenTemaModal(true);
  };

  const createPlan = async () => {
    try {
      setLoading(true);

      // Validar datos del plan
      if (!planData.nombre_plan || !planData.anio || !planData.mes) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos incompletos',
          text: 'Por favor, complete todos los campos del plan',
          confirmButtonColor: '#3085d6'
        });
        setLoading(false);
        return;
      }

      // Validar que se hayan seleccionado temas
      if (selectedTemas.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Sin temas seleccionados',
          text: 'Debe seleccionar al menos un tema para crear el plan',
          confirmButtonColor: '#3085d6'
        });
        setLoading(false);
        return;
      }

      console.log('Creando plan con datos:', {
        id_campania: selectedCampana,
        planData,
        selectedTemas
      });

      // Insertar en la tabla plan
      const { data: planInsertData, error: planError } = await supabase
        .from('plan')
        .insert([
          {
            id_campania: selectedCampana,
            anio: planData.anio,
            mes: planData.mes,
            nombre_plan: planData.nombre_plan,
            estado: true,
            estado2: 'Pendiente',
            num_correlativo: 0
          }
        ])
        .select()
        .single();

      if (planError) {
        console.error('Error al insertar plan:', planError);
        throw new Error('Error al crear el plan: ' + planError.message);
      }

      console.log('Plan creado con ID:', planInsertData.id);

      // Insertar las alternativas (relación plan-temas)
      const alternativasData = selectedTemas.map(temaId => ({
        id_plan: planInsertData.id,
        id_tema: temaId
      }));

      console.log('Insertando alternativas:', alternativasData);

      const { error: alternativasError } = await supabase
        .from('plan_alternativas')
        .insert(alternativasData);

      if (alternativasError) {
        console.error('Error al insertar alternativas:', alternativasError);
        // No lanzar error, solo loguearlo
        console.warn('Las alternativas no se pudieron insertar, pero el plan se creó');
      }

      // Insertar en la tabla campana_planes
      const { error: relError } = await supabase
        .from('campana_planes')
        .insert([
          {
            id_plan: planInsertData.id,
            id_campania: selectedCampana
          }
        ]);

      if (relError) {
        console.error('Error al insertar relación campaña-plan:', relError);
        // No lanzar error, solo loguearlo
        console.warn('La relación campaña-plan no se pudo insertar, pero el plan se creó');
      }

      setOpenModal(false);
      setValidationResult(null);
      setShowValidation(false);

      // Mostrar mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: '¡Plan creado exitosamente!',
        text: 'El plan ha sido creado y guardado correctamente',
        confirmButtonColor: '#3085d6',
        timer: 3000,
        timerProgressBar: true
      });

      // Navegar a la vista de alternativas
      navigate(`/planificacion/alternativas/${planInsertData.id}`);
    } catch (error) {
      console.error('Error al crear el plan:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al crear el plan',
        text: error.message || 'Ha ocurrido un error inesperado',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    // Simplemente crear el plan desde el modal
    createPlan();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Autocomplete
              fullWidth
              options={clientes}
              getOptionLabel={(option) => option.nombrecliente}
              value={selectedCliente}
              onChange={handleClienteChange}
              loading={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar y Seleccionar Cliente"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                    endAdornment: (
                      <>
                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              filterOptions={(options, { inputValue }) => {
                const inputValueLower = inputValue.toLowerCase();
                return options.filter(option =>
                  option.nombrecliente.toLowerCase().includes(inputValueLower)
                );
              }}
              isOptionEqualToValue={(option, value) => option.id_cliente === value?.id_cliente}
              noOptionsText="No se encontraron clientes"
              loadingText="Cargando..."
            />
          </Box>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Card variant="outlined" className="campaign-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Campañas Disponibles
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Campaña</TableCell>
                          <TableCell>Año</TableCell>
                          <TableCell>Cliente</TableCell>
                          <TableCell>Producto</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {campanas.map((campana) => (
                          <TableRow
                            key={campana.id_campania}
                            hover
                            selected={selectedCampana === campana.id_campania}
                            onClick={() => handleCampanaChange({ target: { value: campana.id_campania } })}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell>{campana.nombrecampania}</TableCell>
                            <TableCell>{campana.anios?.years}</TableCell>
                            <TableCell>{campana.clientes?.nombrecliente}</TableCell>
                            <TableCell>{campana.productos?.nombredelproducto}</TableCell>
                            <TableCell>
                              {selectedCampana === campana.id_campania && (
                                <CheckCircleIcon color="primary" fontSize="small" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card variant="outlined" className="themes-card">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Temas de la Campaña
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleOpenTemaModal}
                      startIcon={<AddIcon sx={{ color: 'white' }} />}
                      disabled={!selectedCampana}
                      sx={{
                        background: 'var(--gradient-primary)',
                        color: '#fff',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        padding: '6px 12px',
                        '&:hover': {
                          background: 'var(--gradient-secondary)',
                        }
                      }}
                    >
                      Nuevo Tema
                    </Button>
                  </Box>
                  {temas.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Tema</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Medio</TableCell>
                            <TableCell>Calidad</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {temas.map((tema) => (
                            <TableRow
                              key={tema.id_tema}
                              hover
                              selected={selectedTemas.includes(tema.id_tema)}
                              onClick={() => handleTemaSelect(tema.id_tema)}
                              sx={{ cursor: 'pointer' }}
                            >
                              <TableCell>{tema.nombre_tema}</TableCell>
                              <TableCell>{tema.descripcion || '-'}</TableCell>
                              <TableCell>{tema.Medios?.nombredelmedio}</TableCell>
                              <TableCell>{tema.Calidad?.nombrecalidad}</TableCell>
                              <TableCell>
                                {tema.estado ? 'Activo' : 'Inactivo'}
                              </TableCell>
                              <TableCell>
                                {selectedTemas.includes(tema.id_tema) && (
                                  <CheckCircleIcon color="primary" fontSize="small" />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      minHeight: 200,
                      bgcolor: '#f5f5f5',
                      borderRadius: 1,
                      p: 2
                    }}>
                      <Typography variant="body1" color="text.secondary" align="center">
                        {selectedCampana ? 
                          "Esta campaña no tiene temas asociados" : 
                          "Seleccione una campaña para ver sus temas"}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      case 2:
        const campanaSeleccionada = campanas.find(c => c.id_campania === selectedCampana);
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Alternativas de Plan
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Campaña Seleccionada
              </Typography>
              <Typography variant="body1">
                {campanaSeleccionada?.nombrecampania}
              </Typography>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenModal(true)}
                startIcon={<AddIcon sx={{ color: 'white' }} />}
              >
                Crear Nuevo Plan
              </Button>
            </Box>

            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
              <DialogTitle>Crear Nuevo Plan</DialogTitle>
              <DialogContent>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Nombre del Plan"
                      value={planData.nombre_plan}
                      onChange={handlePlanDataChange('nombre_plan')}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Año</InputLabel>
                      <Select
                        value={planData.anio}
                        onChange={handlePlanDataChange('anio')}
                        label="Año"
                      >
                        {anios.map((anio) => (
                          <MenuItem key={anio.id} value={anio.years}>
                            {anio.years}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Mes</InputLabel>
                      <Select
                        value={planData.mes}
                        onChange={handlePlanDataChange('mes')}
                        label="Mes"
                      >
                        {meses.map((mes) => {
                          const monthId = mes.id || mes.Id || mes.id_mes;
                          const monthName = mes.nombre || mes.Nombre || mes.nombremes;
                          return (
                            <MenuItem key={monthId} value={monthId}>
                              {monthName}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Mostrar validaciones si existen */}
                  <Grid item xs={12}>
                    <Collapse in={showValidation && validationResult}>
                      <Box sx={{ mb: 2 }}>
                        {validationResult?.errors.map((error, index) => (
                          <Alert
                            key={`error-${index}`}
                            severity="error"
                            sx={{ mb: 1 }}
                            icon={<ErrorIcon />}
                          >
                            {error}
                          </Alert>
                        ))}

                        {validationResult?.warnings.map((warning, index) => (
                          <Alert
                            key={`warning-${index}`}
                            severity="warning"
                            sx={{ mb: 1 }}
                            icon={<WarningIcon />}
                          >
                            {warning}
                          </Alert>
                        ))}

                        {validationResult?.suggestions.map((suggestion, index) => (
                          <Alert
                            key={`suggestion-${index}`}
                            severity="info"
                            sx={{ mb: 1 }}
                            icon={<InfoIcon />}
                          >
                            💡 {suggestion}
                          </Alert>
                        ))}

                        {validationResult?.isValid && (
                          <Alert
                            severity="success"
                            sx={{ mb: 1 }}
                            icon={<SuccessIcon />}
                          >
                            ✅ Planificación validada correctamente
                          </Alert>
                        )}
                      </Box>
                    </Collapse>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
                <Button
                  variant="contained"
                  onClick={handleCreatePlan}
                  disabled={loading || !planData.nombre_plan || !planData.anio || !planData.mes}
                >
                  {loading ? <CircularProgress size={24} /> : 'Crear Plan'}
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" className="nuevo-plan-container">
      <Paper elevation={3} className="plan-paper">
        <Typography variant="h5" gutterBottom>
          Nuevo Plan de Medios
        </Typography>
        
        <Stepper activeStep={activeStep} className="stepper">
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box className="step-content">
          {renderStepContent(activeStep)}
        </Box>

        <Box className="step-actions">
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<NavigateBeforeIcon />}
          >
            Atrás
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? () => setOpenModal(true) : handleNext}
            endIcon={<NavigateNextIcon sx={{ color: 'white' }} />}
            disabled={
              (activeStep === 0 && !selectedCliente) ||
              (activeStep === 1 && !selectedCampana) ||
              (activeStep === steps.length - 1 && selectedTemas.length === 0)
            }
          >
            {activeStep === steps.length - 1 ? 'Crear Plan' : 'Siguiente'}
          </Button>
        </Box>
      </Paper>

      {/* Modal para crear nuevo tema */}
      <Dialog
        open={openTemaModal}
        onClose={() => setOpenTemaModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Crear Nuevo Tema</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Nombre del Tema"
                value={nuevoTema.nombre_tema}
                onChange={handleTemaChange('nombre_tema')}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={nuevoTema.descripcion}
                onChange={handleTemaChange('descripcion')}
                variant="outlined"
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth required>
                <InputLabel>Medio</InputLabel>
                <Select
                  value={nuevoTema.id_medio}
                  onChange={handleTemaChange('id_medio')}
                  label="Medio"
                >
                  {medios.map((medio) => (
                    <MenuItem key={medio.id} value={medio.id}>
                      {medio.nombredelmedio}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth required>
                <InputLabel>Calidad</InputLabel>
                <Select
                  value={nuevoTema.id_calidad}
                  onChange={handleTemaChange('id_calidad')}
                  label="Calidad"
                >
                  {calidades.map((calidad) => (
                    <MenuItem key={calidad.id} value={calidad.id}>
                      {calidad.nombrecalidad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={nuevoTema.estado}
                    onChange={(e) => setNuevoTema(prev => ({
                      ...prev,
                      estado: e.target.checked
                    }))}
                    color="primary"
                  />
                }
                label="Activo"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTemaModal(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCreateTema}
            disabled={loading || !nuevoTema.nombre_tema || !nuevoTema.id_medio || !nuevoTema.id_calidad}
          >
            {loading ? <CircularProgress size={24} /> : 'Crear Tema'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NuevoPlan;
