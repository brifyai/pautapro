import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { supabase } from '../../config/supabase';
import { safeFetchClientes } from '../../services/dataNormalization';
import { orderService } from '../../services/orderService';
import Swal from 'sweetalert2';
import TablaOrden from '../../components/ordenes/TablaOrden';
import { generateOrderPDF } from '../../utils/pdfGenerator';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  CircularProgress,
  InputAdornment,
  DialogActions,
  ButtonGroup,
  Tooltip,
  IconButton,
  Checkbox,
  Chip,
  Alert,
  useMediaQuery,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Fab,
  Avatar,
  Pagination,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  CheckCircle as SuccessIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import MobileLayout from '../../components/mobile/MobileLayout';
import MobileCard from '../../components/mobile/MobileCard';

const CrearOrden = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const handleClose = () => {
    navigate('/');
  };

  const [openClienteModal, setOpenClienteModal] = useState(true);
  const [mobileStep, setMobileStep] = useState(0);
  const [openCampanaModal, setOpenCampanaModal] = useState(false);
  const [mobilePage, setMobilePage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [campanas, setCampanas] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedCampana, setSelectedCampana] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [planes, setPlanes] = useState([]);
  const [alternativas, setAlternativas] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedAlternativas, setSelectedAlternativas] = useState([]);
  const [ordenCreada, setOrdenCreada] = useState(null);
  const [alternativasOrden, setAlternativasOrden] = useState([]);
  const [user, setUser] = useState(null);
  const [orderState, setOrderState] = useState('solicitada');
  const [orderAlerts, setOrderAlerts] = useState([]);
  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    if (selectedCampana) {
      fetchPlanes(selectedCampana.id_campania);
    }
  }, [selectedCampana]);
  useEffect(() => {
    const getUserSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session) {
        const { data: userData, error: userError } = await supabase
          .from('usuarios') // or your users table name
          .select('nombre, email')
          .eq('id', session.user.id)
          .single();
        
        if (!userError && userData) {
          setUser(userData);
        }
      }
    };
    
    getUserSession();
  }, []);
  const fetchAlternativas = async () => {
    if (selectedPlan) {
      setLoading(true);
      try {
        // Primero obtenemos los id_alternativa relacionados con el plan
        const { data: planAlternativas, error: planAltError } = await supabase
          .from('plan_alternativas')
          .select('id_alternativa')
          .eq('id_plan', selectedPlan.id);

        if (planAltError) {
          console.error('Error al obtener plan_alternativas:', planAltError);
          throw planAltError;
        }

        if (!planAlternativas?.length) {
          console.log('No se encontraron alternativas para este plan');
          setAlternativas([]);
          setLoading(false);
          return;
        }

        // Obtenemos los ids de las alternativas
        const alternativaIds = planAlternativas
          .map(pa => pa.id_alternativa)
          .filter(id => id != null);

        // Ahora obtenemos los detalles de las alternativas
        const { data: alternativasData, error: altError } = await supabase
          .from('alternativa')
            .select(`
            *,
            Anios (id, years),
            Meses (Id, Nombre),
            Contratos (id, NombreContrato, num_contrato, id_FormadePago, IdProveedor,
              FormaDePago (id, NombreFormadePago),
              Proveedores (id_proveedor, nombreProveedor, rutProveedor, direccionFacturacion, id_comuna),
              TipoGeneracionDeOrden (id, NombreTipoOrden)
            ),
            tipo_item,
            Soportes (id_soporte, nombreIdentficiador),
            Clasificacion (id, NombreClasificacion),
            Temas (id_tema, NombreTema, Duracion, CodigoMegatime),
            Programas (id, codigo_programa, hora_inicio, hora_fin, descripcion)
            `)
          .in('id', alternativaIds)
          .or('ordencreada.is.null,ordencreada.eq.false');

        if (altError) {
          console.error('Error al obtener alternativas:', altError);
          throw altError;
        }

        console.log('Alternativas cargadas:', alternativasData);
        setAlternativas(alternativasData || []);
      } catch (error) {
        console.error('Error al cargar alternativas:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las alternativas',
          customClass: {
            container: 'swal2-container',
            popup: 'swal2-popup',
            title: 'swal2-title',
            content: 'swal2-content',
            actions: 'swal2-actions',
            confirmButton: 'swal2-confirm',
            cancelButton: 'swal2-cancel',
            footer: 'swal2-footer'
          }
        });
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAlternativas();
  }, [selectedPlan]);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const data = await safeFetchClientes({ onlyActive: false });
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
          Clientes!inner (
            id_cliente,
            nombrecliente
          ),
          Anios:Anio (
            id,
            years
          ),
          Productos (
            id,
            nombredelproducto
          )
        `)
        .eq('id_Cliente', clienteId)
        .order('nombrecampania');

      if (error) throw error;
      setCampanas(data || []);
    } catch (error) {
      console.error('Error al cargar campañas:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleClienteSelect = async (cliente) => {
    try {
      setSelectedCliente(cliente);
      await fetchCampanas(cliente.id_cliente);
      setOpenClienteModal(false);
      setOpenCampanaModal(true);
    } catch (error) {
      console.error('Error al seleccionar cliente:', error);
    }
  };

  const handleCampanaSelect = (campana) => {
    setSelectedCampana(campana);
    setOpenCampanaModal(false);
    // Aquí continuaremos con la creación de la orden
  };

  const handleResetSelection = () => {
    setSelectedCliente(null);
    setSelectedCampana(null);
    setOpenClienteModal(true);
  };

  const fetchPlanes = async (campaniaId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plan')
        .select(`
          id,
          nombre_plan,
          Anios (id, years),
          Meses (Id, Nombre)
        `)
        .eq('id_campania', campaniaId)
        .eq('estado2', 'aprobado');

      if (error) throw error;
      console.log('Planes cargados:', data);
      setPlanes(data || []);
    } catch (error) {
      console.error('Error al cargar planes:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los planes',
        customClass: {
          container: 'swal2-container',
          popup: 'swal2-popup',
          title: 'swal2-title',
          content: 'swal2-content',
          actions: 'swal2-actions',
          confirmButton: 'swal2-confirm',
          cancelButton: 'swal2-cancel',
          footer: 'swal2-footer'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAlternativa = (alternativaId) => {
    setSelectedAlternativas(prev => {
      if (prev.includes(alternativaId)) {
        return prev.filter(id => id !== alternativaId);
      } else {
        return [...prev, alternativaId];
      }
    });
  };

  const handleSelectAllAlternativas = (event) => {
    if (event.target.checked) {
      setSelectedAlternativas(alternativas.map(alt => alt.id));
    } else {
      setSelectedAlternativas([]);
    }
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Add debugging
  console.log('Current user info:', {
    nombre: user?.nombre || 'No name available',
    email: user?.email || 'No email available'
  });

  try {
    const orderData = {
      // ... your existing order data ...
      usuario_registro: {
        nombre: user?.nombre,
        email: user?.email
      }
    };

    console.log('Order data being sent:', orderData);

    const response = await axios.post('/api/orders', orderData);
    
    // Add debugging for response
    console.log('Order creation response:', response.data);

    // ... rest of your code ...
  } catch (error) {
    console.error('Error creating order:', error);
    // Handle error appropriately
  }
};
const [user2] = useState(JSON.parse(localStorage.getItem('user')));
const handleCrearOrden = async () => {
  try {
    if (!selectedAlternativas.length) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Debe seleccionar al menos una alternativa',
        customClass: {
          container: 'swal2-container',
          popup: 'swal2-popup',
          title: 'swal2-title',
          content: 'swal2-content',
          actions: 'swal2-actions',
          confirmButton: 'swal2-confirm',
          cancelButton: 'swal2-cancel',
          footer: 'swal2-footer'
        }
      });
      return;
    }

    // Verificar si ya existe una orden con estas alternativas para evitar duplicación
    const { data: ordenExistente } = await supabase
      .from('ordenesdepublicidad')
      .select('id_ordenes_de_comprar, numero_correlativo, creada_con_rentabilidad')
      .eq('id_cliente', selectedCliente.id_cliente)
      .eq('id_campania', selectedCampana.id_campania)
      .eq('id_plan', selectedPlan.id)
      .contains('alternativas_plan_orden', JSON.stringify(selectedAlternativas))
      .in('estado', ['pendiente', 'aprobada', 'produccion'])
      .single();

    if (ordenExistente) {
      const mensaje = ordenExistente.creada_con_rentabilidad
        ? `Ya existe una orden (#${ordenExistente.numero_correlativo}) con las mismas alternativas seleccionadas, creada con análisis de rentabilidad.`
        : `Ya existe una orden (#${ordenExistente.numero_correlativo}) con las mismas alternativas seleccionadas.`;
      
      Swal.fire({
        icon: 'warning',
        title: 'Orden Duplicada',
        text: mensaje,
        customClass: {
          container: 'swal2-container',
          popup: 'swal2-popup',
          title: 'swal2-title',
          content: 'swal2-content',
          actions: 'swal2-actions',
          confirmButton: 'swal2-confirm',
          cancelButton: 'swal2-cancel',
          footer: 'swal2-footer'
        }
      });
      return;
    }

    // Limpiar alertas previas
    setOrderAlerts([]);

    // Obtener el último número correlativo válido (no nulo)
    const { data: ultimaOrden, error: errorCorrelativo } = await supabase
      .from('ordenesdepublicidad')
      .select('numero_correlativo')
      .not('numero_correlativo', 'is', null)
      .order('numero_correlativo', { ascending: false })
      .limit(1)
      .single();

    if (errorCorrelativo && errorCorrelativo.code !== 'PGRST116') {
      throw errorCorrelativo;
    }

    let nuevoCorrelativo = (ultimaOrden?.numero_correlativo || 33992) + 1;

    // Obtener las alternativas seleccionadas
    const alternativasSeleccionadas = alternativas.filter(alt => selectedAlternativas.includes(alt.id));

    // Agrupar alternativas por soporte, contrato y proveedor
    const alternativasPorGrupo = alternativasSeleccionadas.reduce((acc, alt) => {
      const soporteId = alt.Soportes?.id_soporte;
      const contratoId = alt.Contratos?.id;
      const proveedorId = alt.Contratos?.IdProveedor;
      const tipoItem = alt.tipo_item;

      // Crear una clave única combinando soporte, contrato y proveedor
      const grupoKey = `${soporteId}-${contratoId}-${proveedorId}-${tipoItem}`;

      if (!acc[grupoKey]) {
        acc[grupoKey] = {
          alternativas: [],
          soporte: alt.Soportes,
          contrato: alt.Contratos,
          proveedor: alt.Contratos?.Proveedores,
          tipo_item: alt.tipo_item
        };
      }
      acc[grupoKey].alternativas.push(alt);
      return acc;
    }, {});

     // Recolectar IDs únicos para actualizar las tablas relacionadas
     const campaniaId = selectedCampana.id_campania;
     const soporteIds = [...new Set(alternativasSeleccionadas.map(alt => alt.Soportes?.id_soporte).filter(Boolean))];
     const contratoIds = [...new Set(alternativasSeleccionadas.map(alt => alt.Contratos?.id).filter(Boolean))];
     const temaIds = [...new Set(alternativasSeleccionadas.map(alt => alt.Temas?.id_tema).filter(Boolean))];
     const programaIds = [...new Set(alternativasSeleccionadas.map(alt => alt.Programas?.id).filter(Boolean))];

   // Para cada grupo (combinación única de soporte, contrato y proveedor), crear una orden y un PDF independiente
   for (const [grupoKey, grupo] of Object.entries(alternativasPorGrupo)) {
     const altsDelGrupo = grupo.alternativas;

     // Calcular fecha estimada de entrega basada en el estado
     const estimatedDelivery = orderService.calculateEstimatedDelivery(orderState);

     // Crear el registro en OrdenesDePublicidad con estados inteligentes
     const { data, error } = await supabase
       .from('ordenesdepublicidad')
       .insert({
         id_campania: selectedCampana.id_campania,
         id_plan: selectedPlan.id,
         id_compania: selectedCampana.id_compania,
         alternativas_plan_orden: altsDelGrupo.map(alt => alt.id),
         numero_correlativo: nuevoCorrelativo,
         usuario_registro: user2 ? {
           nombre: user2.Nombre,
           email: user2.Email
         } : null,
         // Campos de estado inteligente
         estado: orderState,
         fecha_estimada_entrega: estimatedDelivery,
         fecha_inicio_produccion: orderState === 'produccion' ? new Date().toISOString() : null,
         // Solo incluir los campos que existen en la tabla
         id_soporte: grupo.soporte?.id_soporte,
         id_contrato: grupo.contrato?.id
       })
       .select()
       .single();

     if (error) {
       console.error('Error al crear la orden:', error);
       throw error;
     }

     // Actualizar las alternativas de este grupo
     const { error: updateError } = await supabase
       .from('alternativa')
       .update({
         ordencreada: true,
         numerorden: nuevoCorrelativo
       })
       .in('id', altsDelGrupo.map(alt => alt.id));

     if (updateError) {
       console.error('Error al actualizar alternativas:', updateError);
       throw updateError;
     }

     // Generar el PDF para este grupo de alternativas
     generateOrderPDF(data, altsDelGrupo, selectedCliente, selectedCampana, selectedPlan);

     // Incrementar el correlativo para la siguiente orden
     nuevoCorrelativo++;
   }

      // Actualizar campo c_orden en las tablas relacionadas
      const updatePromises = [];

      // Actualizar campaña
      if (campaniaId) {
        updatePromises.push(
          supabase
            .from('campania')
            .update({ c_orden: true })
            .eq('id_campania', campaniaId)
        );
      }

      // Actualizar soportes
      if (soporteIds.length > 0) {
        updatePromises.push(
          supabase
            .from('soportes')
            .update({ c_orden: true })
            .in('id_soporte', soporteIds)
        );
      }

      // Actualizar contratos
      if (contratoIds.length > 0) {
        updatePromises.push(
          supabase
            .from('contratos')
            .update({ c_orden: true })
            .in('id', contratoIds)
        );
      }

      // Actualizar temas
      if (temaIds.length > 0) {
        updatePromises.push(
          supabase
            .from('temas')
            .update({ c_orden: true })
            .in('id_tema', temaIds)
        );
      }

      // Actualizar programas
      if (programaIds.length > 0) {
        updatePromises.push(
          supabase
            .from('programas')
            .update({ c_orden: true })
            .in('id', programaIds)
        );
      }

      // Ejecutar todas las actualizaciones en paralelo
      await Promise.all(updatePromises);

   // Mostrar mensaje de éxito con información del estado
   const cantidadOrdenes = Object.keys(alternativasPorGrupo).length;
   const stateConfig = orderService.orderStates[orderState];

   Swal.fire({
     icon: 'success',
     title: '¡Éxito!',
     text: cantidadOrdenes > 1
       ? `Se han creado ${cantidadOrdenes} órdenes correctamente`
       : 'La orden ha sido creada correctamente',
     footer: `Estado inicial: ${stateConfig.description}`,
     showConfirmButton: true,
     timer: 3000,
     customClass: {
       container: 'swal2-container',
       popup: 'swal2-popup',
       title: 'swal2-title',
       content: 'swal2-content',
       actions: 'swal2-actions',
       confirmButton: 'swal2-confirm',
       cancelButton: 'swal2-cancel',
       footer: 'swal2-footer'
     }
   });

   // Agregar alerta de seguimiento
   const newAlert = {
     id: Date.now(),
     type: 'info',
     title: 'Orden creada',
     message: `Orden(es) creada(s) en estado "${stateConfig.description}". ${stateConfig.notifications.length > 0 ? 'Notificaciones enviadas.' : ''}`,
     timestamp: new Date()
   };
   setOrderAlerts(prev => [newAlert, ...prev]);

   // Refrescar la tabla de alternativas
   await fetchAlternativas();

   // Limpiar selecciones
   setSelectedAlternativas([]);

 } catch (error) {
   console.error('Error al crear la orden:', error);

   // Agregar alerta de error
   const errorAlert = {
     id: Date.now(),
     type: 'error',
     title: 'Error al crear orden',
     message: error.message || 'Ocurrió un error al crear la orden',
     timestamp: new Date()
   };
   setOrderAlerts(prev => [errorAlert, ...prev]);

   Swal.fire({
     icon: 'error',
     title: 'Error',
     text: 'Ocurrió un error al crear la orden',
     customClass: {
       container: 'swal2-container',
       popup: 'swal2-popup',
       title: 'swal2-title',
       content: 'swal2-content',
       actions: 'swal2-actions',
       confirmButton: 'swal2-confirm',
       cancelButton: 'swal2-cancel',
       footer: 'swal2-footer'
     }
   });
 }
};

  const filteredClientes = clientes.filter(cliente =>
    (cliente.nombrecliente && cliente.nombrecliente.toLowerCase().includes(searchTerm.toLowerCase())) ||
    cliente.razonSocial?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // VERSIÓN MÓVIL con diseño de Agencias
  if (isMobile) {
    return (
      <>
        <Box sx={{ p: 2 }}>
          {/* Header con gradiente como Agencias */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#34395e', textAlign: 'center' }}>
              📝 Crear Orden
            </Typography>
            
            {/* Stepper simplificado */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {['Cliente', 'Campaña', 'Plan', 'Alternativas'].map((label, index) => (
                  <Box key={label} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: mobileStep >= index
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : '#e0e0e0',
                        color: mobileStep >= index ? 'white' : '#666',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {index + 1}
                    </Box>
                    {index < 3 && (
                      <Box
                        sx={{
                          width: 20,
                          height: 2,
                          background: mobileStep > index ? '#667eea' : '#e0e0e0',
                          mx: 0.5
                        }}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Paso 1: Seleccionar Cliente con cards creativos */}
          {mobileStep === 0 && (
            <Box>
              {/* Barra de búsqueda móvil */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="🔍 Buscar cliente..."
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

              {/* Cards creativos para clientes */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  filteredClientes.slice((mobilePage - 1) * 10, mobilePage * 10).map((cliente, index) => (
                    <Card
                      key={cliente.id_cliente}
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
                          {cliente.nombrecliente?.charAt(0)?.toUpperCase() || '?'}
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
                            {cliente.nombrecliente}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}>
                            <Chip
                              label={cliente.RUT || 'Sin RUT'}
                              size="small"
                              sx={{
                                height: '24px',
                                fontSize: '0.75rem',
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                color: '#667eea',
                                fontWeight: 600
                              }}
                            />
                            <Chip
                              label={cliente.estado ? '✓ Activo' : '✗ Inactivo'}
                              size="small"
                              sx={{
                                height: '24px',
                                fontSize: '0.75rem',
                                backgroundColor: cliente.estado ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: cliente.estado ? '#16a34a' : '#dc2626',
                                fontWeight: 600
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Botón de acción */}
                        <IconButton
                          size="small"
                          onClick={() => {
                            handleClienteSelect(cliente);
                            setMobileStep(1);
                          }}
                          sx={{
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.2)' }
                          }}
                        >
                          <ArrowForwardIcon fontSize="small" sx={{ color: '#3b82f6' }} />
                        </IconButton>
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
                              🏢 Razón Social
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                              {cliente.razonSocial || 'No especificada'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                              📞 Teléfono
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                              {cliente.telefono || 'No especificado'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Card>
                  ))
                )}

                {/* Mensaje si no hay clientes */}
                {filteredClientes.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      No se encontraron clientes
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Paginación móvil */}
              {filteredClientes.length > 10 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
                  <Pagination
                    count={Math.ceil(filteredClientes.length / 10)}
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
                  Mostrando {Math.min((mobilePage - 1) * 10 + 1, filteredClientes.length)}-{Math.min(mobilePage * 10, filteredClientes.length)} de {filteredClientes.length} cliente{filteredClientes.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Paso 2: Seleccionar Campaña con cards creativos */}
          {mobileStep === 1 && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', color: '#34395e' }}>
                  Seleccionar Campaña
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Cliente: {selectedCliente?.nombrecliente}
                </Typography>
              </Box>

              {/* Cards creativos para campañas */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  campanas.map((campana, index) => (
                    <Card
                      key={campana.id_campania}
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
                          {campana.nombrecampania?.charAt(0)?.toUpperCase() || 'C'}
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
                            {campana.nombrecampania}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}>
                            <Chip
                              label={campana.Anios?.years || 'Sin año'}
                              size="small"
                              sx={{
                                height: '24px',
                                fontSize: '0.75rem',
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                color: '#667eea',
                                fontWeight: 600
                              }}
                            />
                            <Chip
                              label={campana.Productos?.nombredelproducto || 'Sin producto'}
                              size="small"
                              sx={{
                                height: '24px',
                                fontSize: '0.75rem',
                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                color: '#16a34a',
                                fontWeight: 600
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Botón de acción */}
                        <IconButton
                          size="small"
                          onClick={() => {
                            handleCampanaSelect(campana);
                            setMobileStep(2);
                          }}
                          sx={{
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.2)' }
                          }}
                        >
                          <ArrowForwardIcon fontSize="small" sx={{ color: '#3b82f6' }} />
                        </IconButton>
                      </Box>
                    </Card>
                  ))
                )}
              </Box>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => setMobileStep(0)}
                sx={{ mb: 2, borderRadius: '12px' }}
              >
                Volver a Clientes
              </Button>
            </Box>
          )}

          {/* Paso 3: Seleccionar Plan con cards creativos */}
          {mobileStep === 2 && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', color: '#34395e' }}>
                  Seleccionar Plan
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Campaña: {selectedCampana?.nombrecampania}
                </Typography>
              </Box>

              {/* Cards creativos para planes */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  planes.map((plan, index) => (
                    <Card
                      key={plan.id}
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
                        position: 'relative',
                        border: selectedPlan?.id === plan.id ? '3px solid #667eea' : 'none'
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
                          {plan.nombre_plan?.charAt(0)?.toUpperCase() || 'P'}
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
                            {plan.nombre_plan}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}>
                            <Chip
                              label={plan.Anios?.years || 'Sin año'}
                              size="small"
                              sx={{
                                height: '24px',
                                fontSize: '0.75rem',
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                color: '#667eea',
                                fontWeight: 600
                              }}
                            />
                            <Chip
                              label={plan.Meses?.Nombre || 'Sin mes'}
                              size="small"
                              sx={{
                                height: '24px',
                                fontSize: '0.75rem',
                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                color: '#16a34a',
                                fontWeight: 600
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Botón de acción */}
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedPlan(plan);
                            setMobileStep(3);
                          }}
                          sx={{
                            backgroundColor: selectedPlan?.id === plan.id ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                            '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.2)' }
                          }}
                        >
                          <ArrowForwardIcon fontSize="small" sx={{ color: selectedPlan?.id === plan.id ? '#22c55e' : '#3b82f6' }} />
                        </IconButton>
                      </Box>
                    </Card>
                  ))
                )}
              </Box>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => setMobileStep(1)}
                sx={{ mb: 2, borderRadius: '12px' }}
              >
                Volver a Campañas
              </Button>
            </Box>
          )}

          {/* Paso 4: Seleccionar Alternativas con cards creativos */}
          {mobileStep === 3 && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', color: '#34395e' }}>
                  Alternativas Disponibles
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Plan: {selectedPlan?.nombre_plan} | {selectedAlternativas.length} seleccionada{selectedAlternativas.length !== 1 ? 's' : ''}
                </Typography>
              </Box>

              {/* Cards creativos para alternativas */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  alternativas.map((alt, index) => (
                    <Card
                      key={alt.id}
                      sx={{
                        background: selectedAlternativas.includes(alt.id)
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : `linear-gradient(135deg, ${
                              index % 4 === 0 ? '#f093fb 0%, #f5576c 100%' :
                              index % 4 === 1 ? '#4facfe 0%, #00f2fe 100%' :
                              index % 4 === 2 ? '#43e97b 0%, #38f9d7 100%' :
                              '#fa709a 0%, #fee140 100%'
                            })`,
                        borderRadius: '16px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        overflow: 'hidden',
                        position: 'relative',
                        border: selectedAlternativas.includes(alt.id) ? '3px solid #667eea' : 'none'
                      }}
                    >
                      {/* Header del Card */}
                      <Box sx={{
                        background: selectedAlternativas.includes(alt.id)
                          ? 'rgba(255,255,255,1)'
                          : 'rgba(255,255,255,0.95)',
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}>
                        {/* Checkbox y Avatar */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Checkbox
                            checked={selectedAlternativas.includes(alt.id)}
                            onChange={() => handleSelectAlternativa(alt.id)}
                            sx={{
                              color: selectedAlternativas.includes(alt.id) ? '#667eea' : 'default'
                            }}
                          />
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              background: selectedAlternativas.includes(alt.id)
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : `linear-gradient(135deg, ${
                                    index % 4 === 0 ? '#f093fb 0%, #f5576c 100%' :
                                    index % 4 === 1 ? '#4facfe 0%, #00f2fe 100%' :
                                    index % 4 === 2 ? '#43e97b 0%, #38f9d7 100%' :
                                    '#fa709a 0%, #fee140 100%'
                                  })`,
                              fontSize: '1.2rem',
                              fontWeight: 'bold',
                              color: 'white'
                            }}
                          >
                            {alt.nlinea || '?'}
                          </Avatar>
                        </Box>

                        {/* Información principal */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 'bold',
                              fontSize: '0.9rem',
                              color: selectedAlternativas.includes(alt.id) ? '#1e293b' : '#1e293b',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            Línea {alt.nlinea} - {alt.Soportes?.nombreidentificador || 'N/A'}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}>
                            <Chip
                              label={alt.Contratos?.nombrecontrato || 'Sin contrato'}
                              size="small"
                              sx={{
                                height: '20px',
                                fontSize: '0.7rem',
                                backgroundColor: selectedAlternativas.includes(alt.id)
                                  ? 'rgba(102, 126, 234, 0.2)'
                                  : 'rgba(102, 126, 234, 0.1)',
                                color: selectedAlternativas.includes(alt.id) ? '#667eea' : '#667eea',
                                fontWeight: 600
                              }}
                            />
                            <Chip
                              label={alt.tipo_item || 'N/A'}
                              size="small"
                              sx={{
                                height: '20px',
                                fontSize: '0.7rem',
                                backgroundColor: selectedAlternativas.includes(alt.id)
                                  ? 'rgba(34, 197, 94, 0.2)'
                                  : 'rgba(34, 197, 94, 0.1)',
                                color: selectedAlternativas.includes(alt.id) ? '#16a34a' : '#16a34a',
                                fontWeight: 600
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>

                      {/* Detalles adicionales */}
                      <Box sx={{
                        background: selectedAlternativas.includes(alt.id)
                          ? 'rgba(255,255,255,0.9)'
                          : 'rgba(255,255,255,0.85)',
                        p: 2,
                        pt: 1
                      }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                              💰 Valor Unitario
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                              ${alt.valor_unitario?.toLocaleString('es-CL') || '0'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                              📏 Segundos
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                              {alt.segundos || '0'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Card>
                  ))
                )}
              </Box>

              {/* Botones de acción */}
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexDirection: 'column' }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCrearOrden}
                  disabled={selectedAlternativas.length === 0 || loading}
                  sx={{
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    }
                  }}
                >
                  Crear Orden ({selectedAlternativas.length})
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => setMobileStep(2)}
                  sx={{ borderRadius: '12px' }}
                >
                  Volver a Planes
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </>
    );
  }

  // VERSIÓN ESCRITORIO (original)
  return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Modal de Selección de Cliente */}
        <Dialog 
        open={openClienteModal} 
        maxWidth="md" 
        fullWidth
        disableEscapeKeyDown
        >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" color="success.main">Crear Nueva Orden</Typography>
            <Typography variant="subtitle2" color="textSecondary">Seleccionar Cliente</Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          </Box>
          <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mt: 2 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
          }}
          />
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box display="flex" justifyContent="center" m={3}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                  <TableCell>Nombre del Cliente</TableCell>
                  <TableCell>Razón Social</TableCell>
                  <TableCell>RUT</TableCell>
                  <TableCell>Acción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id_cliente}>
                    <TableCell>{cliente.nombrecliente}</TableCell>
                    <TableCell>{cliente.razonSocial}</TableCell>
                    <TableCell>{cliente.RUT}</TableCell>
                    <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleClienteSelect(cliente)}
                    >
                      Seleccionar
                    </Button>
                    </TableCell>
                  </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Selección de Campaña */}
        <Dialog 
        open={openCampanaModal} 
        maxWidth="md" 
        fullWidth
        >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" color="success.main">
              Crear Nueva Orden - Seleccionar Campaña
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
            Cliente: {selectedCliente?.nombrecliente}
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box display="flex" justifyContent="center" m={3}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                  <TableCell>Nombre de Campaña</TableCell>
                  <TableCell>Año</TableCell>
                  <TableCell>Producto</TableCell>
                  <TableCell>Acción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {campanas.map((campana) => (
                  <TableRow key={campana.id_campania}>
                    <TableCell>{campana.nombrecampania}</TableCell>
                    <TableCell>{campana.Anios?.years || 'No especificado'}</TableCell>
                    <TableCell>{campana.Productos?.nombredelproducto || 'No especificado'}</TableCell>
                    <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleCampanaSelect(campana)}
                    >
                      Seleccionar
                    </Button>
                    </TableCell>
                  </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetSelection} startIcon={<CancelIcon />}>
            Cambiar Cliente
          </Button>
        </DialogActions>
      </Dialog>

        {selectedCliente && selectedCampana && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Header Section */}
            <Paper 
              elevation={3}
              sx={{ 
              p: 3,
              backgroundColor: '#ffffff',
              position: 'relative'
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                Crear Nueva Orden de Publicidad
              </Typography>
              
              <Typography variant="subtitle1">
                <strong>Cliente:</strong> {selectedCliente.nombrecliente}
              </Typography>
              
              <Typography variant="subtitle1">
                <strong>Campaña:</strong> {selectedCampana.nombrecampania}
              </Typography>
              </Box>
              
              <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleResetSelection}
              >
                Cambiar Selección
              </Button>
              </Box>
            </Paper>


            {/* Tables Container */}
            <Box sx={{ 
              display: 'flex', 
              gap: 3,
              height: 'calc(100vh - 280px)'
            }}>
              {/* Planes Section */}
              <Box sx={{ 
                flex: '0 0 35%',
                p: 3,
                borderRadius: 2,
                backgroundColor: '#f8f9fa',
                border: '1px solid #e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'success.main', fontWeight: 'bold' }}>
                  Planes Aprobados para Crear Orden
                </Typography>
                {selectedCampana ? (
                  <TableContainer sx={{ 
                    flex: 1, 
                    overflow: 'auto',
                    backgroundColor: '#ffffff',
                    borderRadius: 1,
                    border: '1px solid #e0e0e0'
                  }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Nombre</TableCell>
                          <TableCell>Año</TableCell>
                          <TableCell>Mes</TableCell>
                          <TableCell>Acción</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {planes.map((plan) => (
                          <TableRow 
                            key={plan.id}
                            selected={selectedPlan?.id === plan.id}
                          >
                            <TableCell>{plan.nombre_plan}</TableCell>
                            <TableCell>{plan.Anios?.years}</TableCell>
                            <TableCell>{plan.Meses?.Nombre}</TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                  console.log('Seleccionando plan:', plan);
                                  setSelectedPlan(plan);
                                }}
                              >
                                Seleccionar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="textSecondary" align="center">
                    Seleccione una campaña para ver sus planes
                  </Typography>
                )}
              </Box>

              {/* Alternativas Section */}
              <Box sx={{ 
                flex: 1,
                p: 3,
                borderRadius: 2,
                backgroundColor: '#f8f9fa',
                border: '1px solid #e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                    Alternativas para Nueva Orden
                  </Typography>
                  {selectedPlan && (
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleCrearOrden}
                        disabled={selectedAlternativas.length === 0 || loading}
                      >
                        Crear Orden
                      </Button>

                      {/* Selector de estado inicial */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Estado inicial:
                        </Typography>
                        <Chip
                          label={orderService.orderStates[orderState]?.description || 'Estado desconocido'}
                          sx={{
                            backgroundColor: orderService.orderStates[orderState]?.color || '#64748b',
                            color: 'white',
                            fontSize: '0.75rem'
                          }}
                          size="small"
                        />
                      </Box>
                    </Box>
                  )}

                  {/* Mostrar alertas de órdenes */}
                  {orderAlerts.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      {orderAlerts.slice(0, 3).map((alert) => (
                        <Alert
                          key={alert.id}
                          severity={alert.type}
                          sx={{ mb: 1 }}
                          icon={alert.type === 'error' ? <CancelIcon /> :
                                alert.type === 'warning' ? <WarningIcon /> :
                                alert.type === 'success' ? <SuccessIcon /> : <InfoIcon />}
                        >
                          <Typography variant="body2" fontWeight="bold">
                            {alert.title}
                          </Typography>
                          <Typography variant="body2">
                            {alert.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {alert.timestamp.toLocaleTimeString()}
                          </Typography>
                        </Alert>
                      ))}
                    </Box>
                  )}
                </Box>
              {selectedPlan ? (
                <TableContainer sx={{ 
                  flex: 1,
                  overflow: 'auto',
                  '& .MuiTable-root': {
                    minWidth: 1500 
                  }
                }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox" style={{backgroundColor: '#f5f5f5'}}>
                          <Checkbox
                            indeterminate={
                              selectedAlternativas.length > 0 && 
                              selectedAlternativas.length < alternativas.length
                            }
                            checked={
                              alternativas.length > 0 && 
                              selectedAlternativas.length === alternativas.length
                            }
                            onChange={handleSelectAllAlternativas}
                          />
                        </TableCell>
                        <TableCell style={{backgroundColor: '#f5f5f5'}}>N° Línea</TableCell>
                        <TableCell style={{backgroundColor: '#f5f5f5'}}>N° Orden</TableCell>
                        <TableCell style={{backgroundColor: '#f5f5f5'}}>Contrato</TableCell>
                        <TableCell style={{backgroundColor: '#f5f5f5'}}>Soporte</TableCell>
                        <TableCell style={{backgroundColor: '#f5f5f5'}}>Programa</TableCell>
                        <TableCell style={{backgroundColor: '#f5f5f5'}}>Clasificación</TableCell>
                        <TableCell style={{backgroundColor: '#f5f5f5'}}>Tema</TableCell>
                        <TableCell style={{backgroundColor: '#f5f5f5'}}>Tipo Item</TableCell>
                        <TableCell style={{backgroundColor: '#f5f5f5'}}>Detalle</TableCell>
                        <TableCell style={{backgroundColor: '#f5f5f5'}}>Segundos</TableCell>
                        <TableCell style={{backgroundColor: '#f5f5f5'}}>Valor Unit.</TableCell>
                        <TableCell style={{backgroundColor: '#f5f5f5'}}>Desc.</TableCell>
                        <TableCell style={{backgroundColor: '#f5f5f5'}}>Rec.</TableCell>
                        <TableCell style={{backgroundColor: '#f5f5f5'}}>Total Bruto</TableCell>
                        <TableCell style={{backgroundColor: '#f5f5f5'}}>Total Neto</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {alternativas.map((alt) => (
                        <TableRow 
                          key={alt.id}
                          selected={selectedAlternativas.includes(alt.id)}
                          hover
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedAlternativas.includes(alt.id)}
                              onChange={() => handleSelectAlternativa(alt.id)}
                            />
                          </TableCell>
                          <TableCell>{alt.nlinea}</TableCell>
                          <TableCell>{alt.numerorden}</TableCell>
                          <TableCell>{alt.Contratos?.nombrecontrato}</TableCell>
                          <TableCell>{alt.Soportes?.nombreidentificador}</TableCell>
                          <TableCell>{alt.Programas?.descripcion}</TableCell>
                          <TableCell>{alt.Clasificacion?.NombreClasificacion}</TableCell>
                          <TableCell>{alt.Temas?.NombreTema}</TableCell>
                          <TableCell>{alt.tipo_item}</TableCell>
                          <TableCell>{alt.detalle}</TableCell>
                          <TableCell>{alt.segundos}</TableCell>
                          <TableCell>
                            {alt.valor_unitario?.toLocaleString('es-CL', {
                              style: 'currency',
                              currency: 'CLP'
                            })}
                          </TableCell>
                          <TableCell>{alt.descuento_plan}%</TableCell>
                          <TableCell>{alt.recargo_plan}%</TableCell>
                          <TableCell>
                            {alt.total_bruto?.toLocaleString('es-CL', {
                              style: 'currency',
                              currency: 'CLP'
                            })}
                          </TableCell>
                          <TableCell>
                            {alt.total_neto?.toLocaleString('es-CL', {
                              style: 'currency',
                              currency: 'CLP'
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary" align="center">
                  Seleccione un plan para ver sus alternativas
                </Typography>
              )}
              </Box>
            </Box>
            </Box>
          )}
      {/* Mostrar la tabla de orden después de crearla */}
      {ordenCreada && alternativasOrden.length > 0 && (
        <TablaOrden
          ordenData={ordenCreada}
          alternativas={alternativasOrden}
          cliente={selectedCliente}
          campana={selectedCampana}
        />
      )}
    </Container>
  );
};

export default CrearOrden;
