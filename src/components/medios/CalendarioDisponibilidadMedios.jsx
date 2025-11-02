/**
 * Calendario de Disponibilidad de Medios
 * Permite visualizar y gestionar la disponibilidad de medios en tiempo real
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Badge,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  EventAvailable as AvailableIcon,
  EventBusy as BusyIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import {
  Calendar,
  dateFnsLocalizer,
  momentLocalizer,
  Views,
} from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../../config/supabase';
import { SweetAlertUtils } from '../../utils/sweetAlertUtils';

moment.locale('es');

const localizer = momentLocalizer(moment);

const CalendarioDisponibilidadMedios = () => {
  const [loading, setLoading] = useState(false);
  const [medios, setMedios] = useState([]);
  const [medioSeleccionado, setMedioSeleccionado] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [vista, setVista] = useState(Views.MONTH);
  const [fechaActual, setFechaActual] = useState(new Date());
  const [filtros, setFiltros] = useState({
    tipoMedio: '',
    estado: 'todos'
  });
  const [showDetalles, setShowDetalles] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [showConfiguracion, setShowConfiguracion] = useState(false);
  const [configuracion, setConfiguracion] = useState({
    mostrarDisponibles: true,
    mostrarOcupados: true,
    mostrarMantenimiento: true,
    colorDisponible: '#4caf50',
    colorOcupado: '#f44336',
    colorMantenimiento: '#ff9800'
  });

  useEffect(() => {
    cargarMedios();
  }, []);

  useEffect(() => {
    if (medioSeleccionado) {
      cargarEventos();
    }
  }, [medioSeleccionado, fechaActual, filtros]);

  const cargarMedios = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medios')
        .select(`
          id,
          nombre_medio,
          tipo_medio,
          capacidad_maxima,
          estado,
          descripcion,
          contacto,
          horario_operacion
        `)
        .eq('estado', true)
        .order('nombre_medio');

      if (error) throw error;
      setMedios(data || []);
      
      // Seleccionar el primer medio por defecto
      if (data && data.length > 0) {
        setMedioSeleccionado(data[0]);
      }
    } catch (error) {
      console.error('Error cargando medios:', error);
      SweetAlertUtils.showError('Error', 'No se pudieron cargar los medios', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarEventos = async () => {
    if (!medioSeleccionado) return;

    setLoading(true);
    try {
      const inicioMes = startOfMonth(fechaActual);
      const finMes = endOfMonth(fechaActual);

      // Cargar órdenes existentes
      const { data: ordenes, error: ordenesError } = await supabase
        .from('ordenesdepublicidad')
        .select(`
          id_ordenes_de_comprar,
          numero_correlativo,
          fecha_ejecucion,
          estado,
          Campania!inner(nombrecampania),
          created_at
        `)
        .eq('id_soporte', medioSeleccionado.id)
        .gte('fecha_ejecucion', inicioMes.toISOString())
        .lte('fecha_ejecucion', finMes.toISOString());

      if (ordenesError) throw ordenesError;

      // Cargar bloqueos de mantenimiento
      const { data: mantenimientos, error: mantenimientosError } = await supabase
        .from('medio_mantenimiento')
        .select('*')
        .eq('id_medio', medioSeleccionado.id)
        .gte('fecha_inicio', inicioMes.toISOString())
        .lte('fecha_fin', finMes.toISOString());

      if (mantenimientosError) throw mantenimientosError;

      // Procesar eventos para el calendario
      const eventosProcesados = [];

      // Agregar órdenes como eventos ocupados
      if (ordenes) {
        ordenes.forEach(orden => {
          eventosProcesados.push({
            id: orden.id_ordenes_de_comprar,
            title: `OC: ${orden.numero_correlativo}`,
            start: new Date(orden.fecha_ejecucion),
            end: new Date(orden.fecha_ejecucion),
            allDay: true,
            type: 'ocupado',
            estado: orden.estado,
            campaña: orden.Campania?.nombrecampania,
            data: orden
          });
        });
      }

      // Agregar mantenimientos como eventos de mantenimiento
      if (mantenimientos) {
        mantenimientos.forEach(mantenimiento => {
          eventosProcesados.push({
            id: `mant-${mantenimiento.id}`,
            title: `Mantenimiento: ${mantenimiento.descripcion || 'Programado'}`,
            start: new Date(mantenimiento.fecha_inicio),
            end: new Date(mantenimiento.fecha_fin),
            allDay: true,
            type: 'mantenimiento',
            data: mantenimiento
          });
        });
      }

      // Agregar días disponibles
      const diasMes = eachDayOfInterval({ start: inicioMes, end: finMes });
      diasMes.forEach(dia => {
        const tieneEvento = eventosProcesados.some(evento => 
          isSameDay(dia, evento.start)
        );

        if (!tieneEvento) {
          eventosProcesados.push({
            id: `disp-${dia.getTime()}`,
            title: 'Disponible',
            start: dia,
            end: dia,
            allDay: true,
            type: 'disponible'
          });
        }
      });

      setEventos(eventosProcesados);
    } catch (error) {
      console.error('Error cargando eventos:', error);
      SweetAlertUtils.showError('Error', 'No se pudieron cargar los eventos', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMedioChange = (medio) => {
    setMedioSeleccionado(medio);
  };

  const handleFechaChange = (date) => {
    setFechaActual(date);
  };

  const handleVistaChange = (nuevaVista) => {
    setVista(nuevaVista);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleEventoClick = (evento) => {
    setEventoSeleccionado(evento);
    setShowDetalles(true);
  };

  const handleConfiguracionChange = (campo, valor) => {
    setConfiguracion(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const getEventosFiltrados = () => {
    let eventosFiltrados = [...eventos];

    // Filtrar por tipo
    if (!configuracion.mostrarDisponibles) {
      eventosFiltrados = eventosFiltrados.filter(e => e.type !== 'disponible');
    }
    if (!configuracion.mostrarOcupados) {
      eventosFiltrados = eventosFiltrados.filter(e => e.type !== 'ocupado');
    }
    if (!configuracion.mostrarMantenimiento) {
      eventosFiltrados = eventosFiltrados.filter(e => e.type !== 'mantenimiento');
    }

    return eventosFiltrados;
  };

  const getEventoStyle = (evento) => {
    let backgroundColor = '#e8f5e8';
    let color = '#2e7d32';
    let borderLeft = '4px solid #4caf50';

    switch (evento.type) {
      case 'ocupado':
        backgroundColor = '#ffebee';
        color = '#c62828';
        borderLeft = '4px solid #f44336';
        break;
      case 'mantenimiento':
        backgroundColor = '#fff3e0';
        color = '#ef6c00';
        borderLeft = '4px solid #ff9800';
        break;
      case 'disponible':
        backgroundColor = '#e8f5e8';
        color = '#2e7d32';
        borderLeft = '4px solid #4caf50';
        break;
    }

    return {
      style: {
        backgroundColor,
        color,
        borderLeft,
        borderRadius: '4px',
        padding: '2px 4px'
      }
    };
  };

  const getTiposMedios = () => {
    const tipos = [...new Set(medios.map(m => m.tipo_medio))];
    return tipos.filter(Boolean);
  };

  const getEstadosMedio = () => {
    return [
      { value: 'todos', label: 'Todos' },
      { value: 'activo', label: 'Activo' },
      { value: 'inactivo', label: 'Inactivo' },
      { value: 'mantenimiento', label: 'Mantenimiento' }
    ];
  };

  const EventoDetallesDialog = () => {
    if (!eventoSeleccionado) return null;

    return (
      <Dialog 
        open={showDetalles} 
        onClose={() => setShowDetalles(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {eventoSeleccionado.type === 'ocupado' && <BusyIcon color="error" />}
            {eventoSeleccionado.type === 'disponible' && <AvailableIcon color="success" />}
            {eventoSeleccionado.type === 'mantenimiento' && <ScheduleIcon color="warning" />}
            Detalles del Evento
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {eventoSeleccionado.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {format(eventoSeleccionado.start, 'EEEE, d [de] MMMM [de] yyyy', { locale: es })}
              </Typography>
            </Grid>

            {eventoSeleccionado.type === 'ocupado' && eventoSeleccionado.data && (
              <>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Número de Orden:</Typography>
                  <Typography variant="body1">
                    {eventoSeleccionado.data.numero_correlativo}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Estado:</Typography>
                  <Chip
                    label={eventoSeleccionado.data.estado}
                    color={
                      eventoSeleccionado.data.estado === 'completada' ? 'success' :
                      eventoSeleccionado.data.estado === 'produccion' ? 'warning' :
                      eventoSeleccionado.data.estado === 'aprobada' ? 'info' : 'default'
                    }
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Campaña:</Typography>
                  <Typography variant="body1">
                    {eventoSeleccionado.campaña || 'No asignada'}
                  </Typography>
                </Grid>
              </>
            )}

            {eventoSeleccionado.type === 'mantenimiento' && eventoSeleccionado.data && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Descripción:</Typography>
                  <Typography variant="body1">
                    {eventoSeleccionado.data.descripcion || 'Mantenimiento programado'}
                  </Typography>
                </Grid>
                {eventoSeleccionado.data.responsable && (
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Responsable:</Typography>
                    <Typography variant="body1">
                      {eventoSeleccionado.data.responsable}
                    </Typography>
                  </Grid>
                )}
              </>
            )}

            {eventoSeleccionado.type === 'disponible' && (
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  El medio está disponible para asignación en esta fecha.
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetalles(false)}>
            Cerrar
          </Button>
          {eventoSeleccionado.type === 'disponible' && (
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => {
                SweetAlertUtils.showInfo('Información', 'Función de reserva próximamente disponible');
                setShowDetalles(false);
              }}
            >
              Reservar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  const ConfiguracionDialog = () => (
    <Dialog 
      open={showConfiguracion} 
      onClose={() => setShowConfiguracion(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FilterIcon />
          Configuración de Visualización
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={configuracion.mostrarDisponibles}
                onChange={(e) => handleConfiguracionChange('mostrarDisponibles', e.target.checked)}
              />
            }
            label="Mostrar días disponibles"
            sx={{ mb: 2 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={configuracion.mostrarOcupados}
                onChange={(e) => handleConfiguracionChange('mostrarOcupados', e.target.checked)}
              />
            }
            label="Mostrar días ocupados"
            sx={{ mb: 2 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={configuracion.mostrarMantenimiento}
                onChange={(e) => handleConfiguracionChange('mostrarMantenimiento', e.target.checked)}
              />
            }
            label="Mostrar mantenimientos"
            sx={{ mb: 3 }}
          />

          <Divider sx={{ mb: 2 }} />

          <Typography variant="h6" gutterBottom>
            Colores de Eventos
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                label="Disponible"
                type="color"
                value={configuracion.colorDisponible}
                onChange={(e) => handleConfiguracionChange('colorDisponible', e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Ocupado"
                type="color"
                value={configuracion.colorOcupado}
                onChange={(e) => handleConfiguracionChange('colorOcupado', e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Mantenimiento"
                type="color"
                value={configuracion.colorMantenimiento}
                onChange={(e) => handleConfiguracionChange('colorMantenimiento', e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowConfiguracion(false)}>
          Cerrar
        </Button>
        <Button 
          variant="contained" 
          onClick={() => setShowConfiguracion(false)}
        >
          Aplicar
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading && medios.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#206e43' }}>
          <CalendarIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Calendario de Disponibilidad de Medios
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Tooltip title="Actualizar">
            <IconButton onClick={cargarEventos} disabled={loading}>
              <RefreshIcon sx={{ transform: loading ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Configuración">
            <IconButton onClick={() => setShowConfiguracion(true)}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Controles */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Medio</InputLabel>
            <Select
              value={medioSeleccionado?.id || ''}
              label="Medio"
              onChange={(e) => {
                const medio = medios.find(m => m.id === e.target.value);
                handleMedioChange(medio);
              }}
            >
              {medios.map((medio) => (
                <MenuItem key={medio.id} value={medio.id}>
                  {medio.nombre_medio}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Tipo de Medio</InputLabel>
            <Select
              value={filtros.tipoMedio}
              label="Tipo de Medio"
              onChange={(e) => handleFiltroChange('tipoMedio', e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {getTiposMedios().map((tipo) => (
                <MenuItem key={tipo} value={tipo}>
                  {tipo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Estado</InputLabel>
            <Select
              value={filtros.estado}
              label="Estado"
              onChange={(e) => handleFiltroChange('estado', e.target.value)}
            >
              {getEstadosMedio().map((estado) => (
                <MenuItem key={estado.value} value={estado.value}>
                  {estado.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ py: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Medio Seleccionado:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {medioSeleccionado?.nombre_medio || 'No seleccionado'}
              </Typography>
              {medioSeleccionado && (
                <>
                  <Typography variant="body2" color="textSecondary">
                    Capacidad: {medioSeleccionado.capacidad_maxima || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Contacto: {medioSeleccionado.contacto || 'N/A'}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Leyenda */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <Chip
          icon={<AvailableIcon />}
          label="Disponible"
          sx={{ backgroundColor: '#e8f5e8', color: '#2e7d32' }}
        />
        <Chip
          icon={<BusyIcon />}
          label="Ocupado"
          sx={{ backgroundColor: '#ffebee', color: '#c62828' }}
        />
        <Chip
          icon={<ScheduleIcon />}
          label="Mantenimiento"
          sx={{ backgroundColor: '#fff3e0', color: '#ef6c00' }}
        />
      </Box>

      {/* Calendario */}
      <Paper sx={{ height: 600, p: 2 }}>
        {medioSeleccionado ? (
          <Calendar
            localizer={localizer}
            events={getEventosFiltrados()}
            startAccessor="start"
            endAccessor="end"
            view={vista}
            date={fechaActual}
            onNavigate={handleFechaChange}
            onView={handleVistaChange}
            onSelectEvent={handleEventoClick}
            eventPropGetter={getEventoStyle}
            messages={{
              showMore(total) {
                return `+${total} más`;
              },
              noEventsInRange: 'No hay eventos en este rango',
              noEventsDisplayed: 'No hay eventos para mostrar'
            }}
          />
        ) : (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%' 
          }}>
            <Alert severity="info">
              Por favor, seleccione un medio para ver su calendario de disponibilidad.
            </Alert>
          </Box>
        )}
      </Paper>

      {/* Diálogos */}
      <EventoDetallesDialog />
      <ConfiguracionDialog />
    </Box>
  );
};

export default CalendarioDisponibilidadMedios;