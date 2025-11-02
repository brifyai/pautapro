/**
 * Componente CrearOrden con Sistema de Versionamiento Inteligente
 * Implementa numeración correlativa con versión: ORD-YYYY-NNN-V
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { safeFetchClientes } from '../../services/dataNormalization';
import { orderService } from '../../services/orderService';
import { ordenVersionamientoService } from '../../services/ordenVersionamientoService';
import { SweetAlertUtils } from '../../utils/sweetAlertUtils';
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
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
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
  History as HistoryIcon,
  Version as VersionIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

const CrearOrdenConVersionamiento = () => {
  const navigate = useNavigate();

  // Estados principales
  const [uiState, setUiState] = useState({
    openClienteModal: true,
    openCampanaModal: false,
    searchTerm: '',
    orderState: 'solicitada',
    showVersionInfo: false,
    showHistorial: false
  });

  const [selectionState, setSelectionState] = useState({
    selectedCliente: null,
    selectedCampana: null,
    selectedPlan: null,
    selectedAlternativas: []
  });

  const [dataState, setDataState] = useState({
    clientes: [],
    campanas: [],
    planes: [],
    alternativas: [],
    user: null,
    ordenesExistentes: [],
    versionesRelacionadas: []
  });

  const [versionamientoState, setVersionamientoState] = useState({
    proximoNumero: '',
    esModificacion: false,
    ordenBase: null,
    historialVersiones: [],
    puedeModificar: true
  });

  // Estados de carga
  const [loading, setLoading] = useState({
    clientes: false,
    campanas: false,
    planes: false,
    alternativas: false,
    generandoNumero: false,
    creandoOrden: false
  });

  // Efectos
  useEffect(() => {
    cargarDatosIniciales();
    obtenerSesionUsuario();
  }, []);

  useEffect(() => {
    if (selectionState.selectedCliente) {
      cargarCampanias(selectionState.selectedCliente.id_cliente);
    }
  }, [selectionState.selectedCliente]);

  useEffect(() => {
    if (selectionState.selectedCampana) {
      cargarPlanes(selectionState.selectedCampana.id_campania);
    }
  }, [selectionState.selectedCampana]);

  useEffect(() => {
    if (selectionState.selectedPlan) {
      cargarAlternativas(selectionState.selectedPlan.id);
      verificarOrdenesExistentes();
    }
  }, [selectionState.selectedPlan]);

  useEffect(() => {
    if (selectionState.selectedAlternativas.length > 0) {
      generarProximoNumero();
    }
  }, [selectionState.selectedAlternativas]);

  // Funciones de carga de datos
  const cargarDatosIniciales = async () => {
    setLoading(prev => ({ ...prev, clientes: true }));
    try {
      const data = await safeFetchClientes({ onlyActive: false });
      setDataState(prev => ({ ...prev, clientes: data }));
    } catch (error) {
      SweetAlertUtils.showError('Error', 'No se pudieron cargar los clientes', error);
    } finally {
      setLoading(prev => ({ ...prev, clientes: false }));
    }
  };

  const obtenerSesionUsuario = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userData } = await supabase
          .from('usuarios')
          .select('nombre, email')
          .eq('id', session.user.id)
          .single();
        
        if (userData) {
          setDataState(prev => ({ ...prev, user: userData }));
        }
      }
    } catch (error) {
      console.error('Error obteniendo sesión:', error);
    }
  };

  const cargarCampanias = async (clienteId) => {
    setLoading(prev => ({ ...prev, campanas: true }));
    try {
      const { data, error } = await supabase
        .from('campania')
        .select(`
          *,
          Clientes!inner (id_cliente, nombrecliente),
          Anios:Anio (id, years),
          Productos (id, nombredelproducto)
        `)
        .eq('id_Cliente', clienteId)
        .order('nombrecampania');

      if (error) throw error;
      setDataState(prev => ({ ...prev, campanas: data || [] }));
    } catch (error) {
      SweetAlertUtils.showError('Error', 'No se pudieron cargar las campañas', error);
    } finally {
      setLoading(prev => ({ ...prev, campanas: false }));
    }
  };

  const cargarPlanes = async (campaniaId) => {
    setLoading(prev => ({ ...prev, planes: true }));
    try {
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
      setDataState(prev => ({ ...prev, planes: data || [] }));
    } catch (error) {
      SweetAlertUtils.showError('Error', 'No se pudieron cargar los planes', error);
    } finally {
      setLoading(prev => ({ ...prev, planes: false }));
    }
  };

  const cargarAlternativas = async (planId) => {
    setLoading(prev => ({ ...prev, alternativas: true }));
    try {
      const { data: planAlternativas } = await supabase
        .from('plan_alternativas')
        .select('id_alternativa')
        .eq('id_plan', planId);

      if (!planAlternativas?.length) {
        setDataState(prev => ({ ...prev, alternativas: [] }));
        return;
      }

      const alternativaIds = planAlternativas.map(pa => pa.id_alternativa);

      const { data: alternativasData, error } = await supabase
        .from('alternativa')
        .select(`
          *,
          Anios (id, years),
          Meses (Id, Nombre),
          Contratos (id, NombreContrato, num_contrato, IdProveedor,
            Proveedores (id_proveedor, nombreProveedor),
            FormaDePago (id, NombreFormadePago),
            TipoGeneracionDeOrden (id, NombreTipoOrden)
          ),
          Soportes (id_soporte, nombreIdentficiador),
          Temas (id_tema, NombreTema, Duracion),
          Programas (id, codigo_programa, descripcion)
        `)
        .in('id', alternativaIds)
        .or('ordencreada.is.null,ordencreada.eq.false');

      if (error) throw error;
      setDataState(prev => ({ ...prev, alternativas: alternativasData || [] }));
    } catch (error) {
      SweetAlertUtils.showError('Error', 'No se pudieron cargar las alternativas', error);
    } finally {
      setLoading(prev => ({ ...prev, alternativas: false }));
    }
  };

  const verificarOrdenesExistentes = async () => {
    if (!selectionState.selectedCliente || !selectionState.selectedCampania || !selectionState.selectedPlan) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ordenesdepublicidad')
        .select('*')
        .eq('id_cliente', selectionState.selectedCliente.id_cliente)
        .eq('id_campania', selectionState.selectedCampana.id_campania)
        .eq('id_plan', selectionState.selectedPlan.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setDataState(prev => ({ ...prev, ordenesExistentes: data || [] }));
    } catch (error) {
      console.error('Error verificando órdenes existentes:', error);
    }
  };

  const generarProximoNumero = async () => {
    if (selectionState.selectedAlternativas.length === 0) return;

    setLoading(prev => ({ ...prev, generandoNumero: true }));
    try {
      // Verificar si hay órdenes existentes similares
      const ordenesSimilares = dataState.ordenesExistentes.filter(orden => {
        const alternativasOrden = JSON.stringify(orden.alternativas_plan_orden || []);
        const alternativasSeleccionadas = JSON.stringify(selectionState.selectedAlternativas.sort());
        return alternativasOrden === alternativasSeleccionadas;
      });

      let proximoNumero;
      let esModificacion = false;
      let ordenBase = null;

      if (ordenesSimilares.length > 0) {
        // Hay una orden similar, verificar si puede ser modificada
        const ultimaOrden = ordenesSimilares[0];
        const puedeModificar = await ordenVersionamientoService.puedeSerModificada(ultimaOrden.numero_correlativo);
        
        if (puedeModificar) {
          // Generar nueva versión
          const parsed = ordenVersionamientoService.parsearNumeroOrden(ultimaOrden.numero_correlativo);
          const nuevaVersion = parseInt(parsed.version) + 1;
          proximoNumero = `${parsed.prefijo}-${parsed.anio}-${parsed.numero}-${nuevaVersion}`;
          esModificacion = true;
          ordenBase = ultimaOrden;

          // Cargar historial de versiones
          const historial = await ordenVersionamientoService.obtenerHistorialVersiones(
            `${parsed.prefijo}-${parsed.anio}-${parsed.numero}`
          );
          setVersionamientoState(prev => ({
            ...prev,
            historialVersiones: historial
          }));
        } else {
          // No puede modificar, generar nuevo número
          proximoNumero = await ordenVersionamientoService.generarProximoNumeroOrden();
        }
      } else {
        // No hay órdenes similares, generar nuevo número
        proximoNumero = await ordenVersionamientoService.generarProximoNumeroOrden();
      }

      setVersionamientoState(prev => ({
        ...prev,
        proximoNumero,
        esModificacion,
        ordenBase,
        puedeModificar: true
      }));

    } catch (error) {
      console.error('Error generando próximo número:', error);
      SweetAlertUtils.showError('Error', 'No se pudo generar el número de orden', error);
    } finally {
      setLoading(prev => ({ ...prev, generandoNumero: false }));
    }
  };

  // Manejadores de eventos
  const handleClienteSelect = async (cliente) => {
    setSelectionState(prev => ({ ...prev, selectedCliente: cliente }));
    setUiState(prev => ({ ...prev, openClienteModal: false, openCampanaModal: true }));
  };

  const handleCampanaSelect = (campana) => {
    setSelectionState(prev => ({ ...prev, selectedCampana: campana }));
    setUiState(prev => ({ ...prev, openCampanaModal: false }));
  };

  const handleResetSelection = () => {
    setSelectionState({
      selectedCliente: null,
      selectedCampana: null,
      selectedPlan: null,
      selectedAlternativas: []
    });
    setUiState({
      ...uiState,
      openClienteModal: true,
      openCampanaModal: false
    });
    setVersionamientoState({
      proximoNumero: '',
      esModificacion: false,
      ordenBase: null,
      historialVersiones: [],
      puedeModificar: true
    });
  };

  const handleSelectAlternativa = (alternativaId) => {
    setSelectionState(prev => ({
      selectedAlternativas: prev.selectedAlternativas.includes(alternativaId)
        ? prev.selectedAlternativas.filter(id => id !== alternativaId)
        : [...prev.selectedAlternativas, alternativaId]
    }));
  };

  const handleSelectAllAlternativas = (event) => {
    setSelectionState(prev => ({
      selectedAlternativas: event.target.checked 
        ? dataState.alternativas.map(alt => alt.id)
        : []
    }));
  };

  const handleCrearOrden = async () => {
    if (selectionState.selectedAlternativas.length === 0) {
      SweetAlertUtils.showWarning('Advertencia', 'Debe seleccionar al menos una alternativa');
      return;
    }

    setLoading(prev => ({ ...prev, creandoOrden: true }));
    try {
      SweetAlertUtils.showLoading('Creando orden...');

      // Verificar duplicados
      const { data: ordenExistente } = await supabase
        .from('ordenesdepublicidad')
        .select('id_ordenes_de_comprar, numero_correlativo')
        .eq('id_cliente', selectionState.selectedCliente.id_cliente)
        .eq('id_campania', selectionState.selectedCampana.id_campania)
        .eq('id_plan', selectionState.selectedPlan.id)
        .contains('alternativas_plan_orden', JSON.stringify(selectionState.selectedAlternativas))
        .in('estado', ['pendiente', 'aprobada', 'produccion'])
        .single();

      if (ordenExistente && !versionamientoState.esModificacion) {
        SweetAlertUtils.close();
        SweetAlertUtils.showWarning(
          'Orden Duplicada',
          `Ya existe una orden (#${ordenExistente.numero_correlativo}) con las mismas alternativas seleccionadas.`
        );
        return;
      }

      // Preparar datos de la orden
      const alternativasSeleccionadas = dataState.alternativas.filter(alt =>
        selectionState.selectedAlternativas.includes(alt.id)
      );

      // Agrupar alternativas por soporte, contrato y proveedor
      const alternativasPorGrupo = alternativasSeleccionadas.reduce((acc, alt) => {
        const soporteId = alt.Soportes?.id_soporte;
        const contratoId = alt.Contratos?.id;
        const proveedorId = alt.Contratos?.IdProveedor;
        const tipoItem = alt.tipo_item;
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

      let numeroBase = versionamientoState.proximoNumero;
      const parsed = ordenVersionamientoService.parsearNumeroOrden(numeroBase);
      const numeroOrdenBase = `${parsed.prefijo}-${parsed.anio}-${parsed.numero}`;

      // Crear órdenes para cada grupo
      const ordenesCreadas = [];
      let numeroCorrelativoActual = numeroBase;

      for (const [grupoKey, grupo] of Object.entries(alternativasPorGrupo)) {
        const altsDelGrupo = grupo.alternativas;
        const estimatedDelivery = orderService.calculateEstimatedDelivery(uiState.orderState);

        const ordenData = {
          id_campania: selectionState.selectedCampana.id_campania,
          id_plan: selectionState.selectedPlan.id,
          id_compania: selectionState.selectedCampana.id_compania,
          alternativas_plan_orden: altsDelGrupo.map(alt => alt.id),
          numero_correlativo: numeroCorrelativoActual,
          usuario_registro: dataState.user ? {
            nombre: dataState.user.nombre,
            email: dataState.user.email
          } : null,
          estado: uiState.orderState,
          fecha_estimada_entrega: estimatedDelivery,
          fecha_inicio_produccion: uiState.orderState === 'produccion' ? new Date().toISOString() : null,
          id_soporte: grupo.soporte?.id_soporte,
          id_contrato: grupo.contrato?.id,
          es_version: versionamientoState.esModificacion,
          version_anterior: versionamientoState.ordenBase?.numero_correlativo,
          fecha_creacion_version: versionamientoState.esModificacion ? new Date().toISOString() : null
        };

        const { data: ordenCreada, error } = await supabase
          .from('ordenesdepublicidad')
          .insert(ordenData)
          .select()
          .single();

        if (error) throw error;
        ordenesCreadas.push(ordenCreada);

        // Actualizar alternativas
        await supabase
          .from('alternativa')
          .update({
            ordencreada: true,
            numerorden: numeroCorrelativoActual
          })
          .in('id', altsDelGrupo.map(alt => alt.id));

        // Incrementar para siguiente orden si hay múltiples grupos
        if (Object.keys(alternativasPorGrupo).length > 1) {
          const siguienteParsed = ordenVersionamientoService.parsearNumeroOrden(numeroCorrelativoActual);
          const siguienteNumero = parseInt(siguienteParsed.numero) + 1;
          const siguienteNumeroFormateado = siguienteNumero.toString().padStart(3, '0');
          numeroCorrelativoActual = `${siguienteParsed.prefijo}-${siguienteParsed.anio}-${siguienteNumeroFormateado}-${siguienteParsed.version}`;
        }
      }

      // Actualizar tablas relacionadas
      const updatePromises = [];
      const campaniaId = selectionState.selectedCampana.id_campania;
      const soporteIds = [...new Set(alternativasSeleccionadas.map(alt => alt.Soportes?.id_soporte).filter(Boolean))];
      const contratoIds = [...new Set(alternativasSeleccionadas.map(alt => alt.Contratos?.id).filter(Boolean))];
      const temaIds = [...new Set(alternativasSeleccionadas.map(alt => alt.Temas?.id_tema).filter(Boolean))];
      const programaIds = [...new Set(alternativasSeleccionadas.map(alt => alt.Programas?.id).filter(Boolean))];

      if (campaniaId) {
        updatePromises.push(
          supabase.from('campania').update({ c_orden: true }).eq('id_campania', campaniaId)
        );
      }
      if (soporteIds.length > 0) {
        updatePromises.push(
          supabase.from('soportes').update({ c_orden: true }).in('id_soporte', soporteIds)
        );
      }
      if (contratoIds.length > 0) {
        updatePromises.push(
          supabase.from('contratos').update({ c_orden: true }).in('id', contratoIds)
        );
      }

      await Promise.all(updatePromises);

      SweetAlertUtils.close();

      // Mostrar mensaje de éxito
      const cantidadOrdenes = ordenesCreadas.length;
      const mensaje = versionamientoState.esModificacion
        ? `Se ha creado la versión ${parsed.version} de la orden ${numeroOrdenBase}`
        : cantidadOrdenes > 1
          ? `Se han creado ${cantidadOrdenes} órdenes correctamente`
          : 'La orden ha sido creada correctamente';

      await SweetAlertUtils.showSuccess(
        '✅ Orden Creada',
        mensaje,
        `Número${cantidadOrdenes > 1 ? 'es' : ''}: ${ordenesCreadas.map(o => o.numero_correlativo).join(', ')}`
      );

      // Resetear y refrescar
      handleResetSelection();
      await cargarAlternativas(selectionState.selectedPlan.id);

    } catch (error) {
      SweetAlertUtils.close();
      console.error('Error creando orden:', error);
      SweetAlertUtils.showError('Error', 'No se pudo crear la orden', error);
    } finally {
      setLoading(prev => ({ ...prev, creandoOrden: false }));
    }
  };

  // Componentes UI
  const VersionInfoCard = () => {
    if (!versionamientoState.proximoNumero) return null;

    const parsed = ordenVersionamientoService.parsearNumeroOrden(versionamientoState.proximoNumero);

    return (
      <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <VersionIcon sx={{ color: '#6777ef' }} />
          <Typography variant="h6" sx={{ color: '#6777ef' }}>
            Información de Versionamiento
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="textSecondary">Número de Orden:</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#206e43' }}>
              {versionamientoState.proximoNumero}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="textSecondary">Tipo:</Typography>
            <Chip
              label={versionamientoState.esModificacion ? 'Nueva Versión' : 'Orden Original'}
              color={versionamientoState.esModificacion ? 'warning' : 'success'}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="textSecondary">Versión:</Typography>
            <Typography variant="body1">
              {parsed.version === '0' ? 'Original' : `Versión ${parsed.version}`}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="textSecondary">Alternativas:</Typography>
            <Typography variant="body1">
              {selectionState.selectedAlternativas.length} seleccionada(s)
            </Typography>
          </Grid>
        </Grid>

        {versionamientoState.esModificacion && versionamientoState.ordenBase && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Modificación de orden existente:</strong> {versionamientoState.ordenBase.numero_correlativo}
              <br />
              Esta acción creará una nueva versión manteniendo el historial de cambios.
            </Typography>
          </Alert>
        )}

        {versionamientoState.historialVersiones.length > 0 && (
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2">
                  Historial de Versiones ({versionamientoState.historialVersiones.length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Versión</TableCell>
                      <TableCell>Número</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Fecha Creación</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {versionamientoState.historialVersiones.map((version, index) => {
                      const parsedVersion = ordenVersionamientoService.parsearNumeroOrden(version.numero_correlativo);
                      return (
                        <TableRow key={version.id_ordenes_de_comprar}>
                          <TableCell>
                            <Chip
                              label={parsedVersion.version === '0' ? 'Original' : `V${parsedVersion.version}`}
                              size="small"
                              color={parsedVersion.version === '0' ? 'primary' : 'default'}
                            />
                          </TableCell>
                          <TableCell>{version.numero_correlativo}</TableCell>
                          <TableCell>
                            <Chip
                              label={version.estado}
                              size="small"
                              color={
                                version.estado === 'completada' ? 'success' :
                                version.estado === 'produccion' ? 'warning' :
                                version.estado === 'aprobada' ? 'info' : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(version.created_at).toLocaleDateString('es-CL')}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        )}
      </Paper>
    );
  };

  // Clientes filtrados
  const filteredClientes = useMemo(() => {
    return dataState.clientes.filter(cliente =>
      (cliente.nombrecliente && cliente.nombrecliente.toLowerCase().includes(uiState.searchTerm.toLowerCase())) ||
      cliente.razonSocial?.toLowerCase().includes(uiState.searchTerm.toLowerCase())
    );
  }, [dataState.clientes, uiState.searchTerm]);

  const isLoading = Object.values(loading).some(state => state);

  if (isLoading && !dataState.clientes.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Cargando datos iniciales...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Modal de Selección de Cliente */}
      <Dialog 
        open={uiState.openClienteModal} 
        maxWidth="md" 
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" color="success.main">
                Crear Nueva Orden con Versionamiento
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                Seleccionar Cliente
              </Typography>
            </Box>
            <IconButton
              aria-label="close"
              onClick={() => navigate('/')}
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
            value={uiState.searchTerm}
            onChange={(e) => setUiState(prev => ({ ...prev, searchTerm: e.target.value }))}
            sx={{ mt: 2 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
            }}
          />
        </DialogTitle>
        <DialogContent>
          {loading.clientes ? (
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
        open={uiState.openCampanaModal} 
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
                Cliente: {selectionState.selectedCliente?.nombrecliente}
              </Typography>
            </Box>
            <IconButton
              aria-label="close"
              onClick={() => navigate('/')}
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
          {loading.campanas ? (
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
                  {dataState.campanas.map((campana) => (
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

      {/* Contenido Principal */}
      {selectionState.selectedCliente && selectionState.selectedCampana && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Header */}
          <Paper elevation={3} sx={{ p: 3, backgroundColor: '#ffffff', position: 'relative' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                Crear Nueva Orden con Versionamiento Inteligente
              </Typography>
              
              <Typography variant="subtitle1">
                <strong>Cliente:</strong> {selectionState.selectedCliente.nombrecliente}
              </Typography>
              
              <Typography variant="subtitle1">
                <strong>Campaña:</strong> {selectionState.selectedCampana.nombrecampania}
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

          {/* Información de Versionamiento */}
          <VersionInfoCard />

          {/* Contenedor de Tablas */}
          <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 400px)' }}>
            {/* Planes */}
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
                Planes Aprobados
              </Typography>
              
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
                    {dataState.planes.map((plan) => (
                      <TableRow 
                        key={plan.id}
                        selected={selectionState.selectedPlan?.id === plan.id}
                        hover
                      >
                        <TableCell>{plan.nombre_plan}</TableCell>
                        <TableCell>{plan.Anios?.years}</TableCell>
                        <TableCell>{plan.Meses?.Nombre}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => setSelectionState(prev => ({ ...prev, selectedPlan: plan }))}
                          >
                            Seleccionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Alternativas */}
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
                  Alternativas para Orden
                </Typography>
                
                {selectionState.selectedPlan && (
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {loading.generandoNumero && (
                      <CircularProgress size={20} />
                    )}
                    
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleCrearOrden}
                      disabled={
                        selectionState.selectedAlternativas.length === 0 || 
                        loading.creandoOrden ||
                        loading.generandoNumero
                      }
                    >
                      {versionamientoState.esModificacion ? 'Crear Nueva Versión' : 'Crear Orden'}
                    </Button>
                  </Box>
                )}
              </Box>

              {selectionState.selectedPlan ? (
                <TableContainer sx={{ 
                  flex: 1,
                  overflow: 'auto',
                  '& .MuiTable-root': { minWidth: 1500 }
                }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox" style={{backgroundColor: '#f5f5f5'}}>
                          <Checkbox
                            indeterminate={
                              selectionState.selectedAlternativas.length > 0 && 
                              selectionState.selectedAlternativas.length < dataState.alternativas.length
                            }
                            checked={
                              dataState.alternativas.length > 0 && 
                              selectionState.selectedAlternativas.length === dataState.alternativas.length
                            }
                            onChange={handleSelectAllAlternativas}
                          />
                        </TableCell>
                        <TableCell style={{backgroundColor: '#f5f5f5'}}>N° Línea</TableCell>
                        <TableCell style={{backgroundColor: '#f5f5f5'}}>Contrato</TableCell>
                        <TableCell style={{backgroundColor: '#f5f5f5'}}>Soporte</TableCell>
                        <TableCell style={{backgroundColor: '#f5f5f5'}}>Programa</TableCell>
                        <TableCell style={{backgroundColor: '#f5f5f5'}}>Valor Unit.</TableCell>
                        <TableCell style={{backgroundColor: '#f5f5f5'}}>Total Neto</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dataState.alternativas.map((alt) => (
                        <TableRow 
                          key={alt.id}
                          selected={selectionState.selectedAlternativas.includes(alt.id)}
                          hover
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectionState.selectedAlternativas.includes(alt.id)}
                              onChange={() => handleSelectAlternativa(alt.id)}
                            />
                          </TableCell>
                          <TableCell>{alt.nlinea}</TableCell>
                          <TableCell>{alt.Contratos?.nombrecontrato}</TableCell>
                          <TableCell>{alt.Soportes?.nombreidentificador}</TableCell>
                          <TableCell>{alt.Programas?.descripcion}</TableCell>
                          <TableCell>
                            {alt.valor_unitario?.toLocaleString('es-CL', {
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
    </Container>
  );
};

export default CrearOrdenConVersionamiento;