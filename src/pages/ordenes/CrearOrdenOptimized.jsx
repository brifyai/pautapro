import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { safeFetchClientes } from '../../services/dataNormalization';
import { orderService } from '../../services/orderService';
import { rentabilidadInteligenteService } from '../../services/rentabilidadInteligenteService';
import Swal from 'sweetalert2';
import TablaOrden from '../../components/ordenes/TablaOrden';
import { generateOrderPDF } from '../../utils/pdfGenerator';
import '../../styles/sweetalert2-custom.css';
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
  Alert
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
  Info as InfoIcon
} from '@mui/icons-material';

// Configuración de SweetAlert2 personalizada
const sweetAlertConfig = {
  customClass: {
    container: 'swal2-container',
    popup: 'swal2-popup',
    title: 'swal2-title',
    content: 'swal2-content',
    actions: 'swal2-actions',
    confirmButton: 'swal2-confirm',
    cancelButton: 'swal2-cancel',
    footer: 'swal2-footer'
  },
  buttonsStyling: true,
  confirmButtonColor: '#206e43',
  cancelButtonColor: '#dc3545',
  reverseButtons: true
};

// Utilidades para SweetAlert2
const SweetAlertUtils = {
  showLoading: (title = 'Procesando...') => {
    Swal.fire({
      title,
      html: '<div class="swal2-loading"></div>',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      ...sweetAlertConfig
    });
  },

  showSuccess: (title, text, footer = null) => {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      footer,
      timer: 3000,
      showConfirmButton: true,
      ...sweetAlertConfig
    });
  },

  showError: (title, text, error = null) => {
    console.error('SweetAlert Error:', error);
    return Swal.fire({
      icon: 'error',
      title,
      text,
      ...(error && {
        footer: `<small>Error: ${error.message || 'Error desconocido'}</small>`
      }),
      ...sweetAlertConfig
    });
  },

  showWarning: (title, text) => {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      ...sweetAlertConfig
    });
  },

  showConfirmation: async (title, text, confirmText = 'Confirmar', cancelText = 'Cancelar') => {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      ...sweetAlertConfig
    });
  },

  showInfo: (title, text) => {
    return Swal.fire({
      icon: 'info',
      title,
      text,
      ...sweetAlertConfig
    });
  },

  close: () => {
    Swal.close();
  }
};

// Servicios de datos optimizados
const OrdenService = {
  async fetchClientes() {
    // Usa helper resiliente que selecciona '*' y normaliza en memoria
    return await safeFetchClientes({ onlyActive: false });
  },

  async fetchCampanas(clienteId) {
    const { data, error } = await supabase
      .from('campania')
      .select(`
        *,
        clientes!inner (
          id_cliente,
          nombrecliente
        ),
        anios (
          id,
          years
        ),
        productos (
          id,
          nombredelproducto
        )
      `)
      .eq('id_cliente', clienteId)
      .order('nombrecampania');

    if (error) throw error;
    return data || [];
  },

  async fetchPlanes(campaniaId) {
    const { data, error } = await supabase
      .from('plan')
      .select(`
        id,
        nombre_plan,
        anios (id, years),
        meses (id, nombre)
      `)
      .eq('id_campania', campaniaId)
      .eq('estado2', 'aprobado');

    if (error) throw error;
    return data || [];
  },

  async fetchAlternativas(planId) {
    // Primero obtenemos los id_alternativa relacionados con el plan
    const { data: planAlternativas, error: planAltError } = await supabase
      .from('plan_alternativas')
      .select('id_alternativa')
      .eq('id_plan', planId);

    if (planAltError) throw planAltError;

    if (!planAlternativas?.length) {
      return [];
    }

    const alternativaIds = planAlternativas
      .map(pa => pa.id_alternativa)
      .filter(id => id != null);

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

    if (altError) throw altError;
    return alternativasData || [];
  },

  async createOrden(orderData) {
    const { data, error } = await supabase
      .from('ordenesdepublicidad')
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAlternativas(alternativaIds, updateData) {
    const { error } = await supabase
      .from('alternativa')
      .update(updateData)
      .in('id', alternativaIds);

    if (error) throw error;
  },

  async updateRelatedTables(updateData) {
    const updatePromises = [];

    Object.entries(updateData).forEach(([table, ids]) => {
      if (ids.length > 0) {
        updatePromises.push(
          supabase
            .from(table)
            .update({ c_orden: true })
            .in(table === 'campania' ? 'id_campania' : 
                table === 'soportes' ? 'id_soporte' : 
                table === 'contratos' ? 'id' : 
                table === 'temas' ? 'id_tema' : 'id', ids)
        );
      }
    });

    await Promise.all(updatePromises);
  },

  async getLastCorrelativo() {
    const { data, error } = await supabase
      .from('ordenesdepublicidad')
      .select('numero_correlativo')
      .not('numero_correlativo', 'is', null)
      .order('numero_correlativo', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.numero_correlativo || 33992;
  }
};

const CrearOrdenOptimized = () => {
  const navigate = useNavigate();

  // Estados agrupados por funcionalidad
  const [uiState, setUiState] = useState({
    openClienteModal: true,
    openCampanaModal: false,
    searchTerm: '',
    orderState: 'solicitada'
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
    ordenCreada: null,
    alternativasOrden: [],
    user: null,
    orderAlerts: []
  });

  // Estados para rentabilidad inteligente
  const [analisisRentabilidad, setAnalisisRentabilidad] = useState(null);
  const [oportunidadesDetectadas, setOportunidadesDetectadas] = useState([]);
  const [mostrarAnalisis, setMostrarAnalisis] = useState(false);
  const [loadingAnalisis, setLoadingAnalisis] = useState(false);
  const [rentabilidadEnTiempoReal, setRentabilidadEnTiempoReal] = useState({
    rentabilidadTotal: 0,
    rentabilidadPorcentaje: 0,
    comisiones: 0,
    bonificaciones: 0,
    markup: 0
  });

  // Estados de carga simplificados
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingCampanas, setLoadingCampanas] = useState(false);
  const [loadingPlanes, setLoadingPlanes] = useState(false);
  const [loadingAlternativas, setLoadingAlternativas] = useState(false);

  // Funciones de carga simplificadas
  const fetchClientes = useCallback(async () => {
    setLoadingClientes(true);
    try {
      const data = await OrdenService.fetchClientes();
      setDataState(prev => ({ ...prev, clientes: data }));
    } catch (error) {
      console.error('Error cargando clientes:', error);
      SweetAlertUtils.showError('Error', 'No se pudieron cargar los clientes', error);
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  const fetchCampanas = useCallback(async (clienteId) => {
    setLoadingCampanas(true);
    try {
      const data = await OrdenService.fetchCampanas(clienteId);
      setDataState(prev => ({ ...prev, campanas: data }));
    } catch (error) {
      console.error('Error cargando campañas:', error);
      SweetAlertUtils.showError('Error', 'No se pudieron cargar las campañas', error);
    } finally {
      setLoadingCampanas(false);
    }
  }, []);

  const fetchPlanes = useCallback(async (campaniaId) => {
    setLoadingPlanes(true);
    try {
      const data = await OrdenService.fetchPlanes(campaniaId);
      setDataState(prev => ({ ...prev, planes: data }));
    } catch (error) {
      console.error('Error cargando planes:', error);
      SweetAlertUtils.showError('Error', 'No se pudieron cargar los planes', error);
    } finally {
      setLoadingPlanes(false);
    }
  }, []);

  const fetchAlternativas = useCallback(async (planId) => {
    setLoadingAlternativas(true);
    try {
      const data = await OrdenService.fetchAlternativas(planId);
      setDataState(prev => ({ ...prev, alternativas: data }));
    } catch (error) {
      console.error('Error cargando alternativas:', error);
      SweetAlertUtils.showError('Error', 'No se pudieron cargar las alternativas', error);
    } finally {
      setLoadingAlternativas(false);
    }
  }, []);


  // Obtener sesión de usuario
  useEffect(() => {
    const getUserSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session) {
          const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('nombre, email')
            .eq('id', session.user.id)
            .single();
          
          if (!userError && userData) {
            setDataState(prev => ({ ...prev, user: userData }));
          }
        }
      } catch (error) {
        console.error('Error getting user session:', error);
      }
    };
    
    getUserSession();
    
    // Cargar clientes al iniciar
    fetchClientes();
  }, []);

  // Cargar campañas cuando se selecciona cliente
  useEffect(() => {
    if (selectionState.selectedCliente) {
      fetchCampanas(selectionState.selectedCliente.id_cliente);
    }
  }, [selectionState.selectedCliente]);

  // Cargar planes cuando se selecciona campaña
  useEffect(() => {
    if (selectionState.selectedCampana) {
      fetchPlanes(selectionState.selectedCampana.id_campania);
    }
  }, [selectionState.selectedCampana]);

  // Cargar alternativas cuando se selecciona plan
  useEffect(() => {
    if (selectionState.selectedPlan) {
      fetchAlternativas(selectionState.selectedPlan.id);
    }
  }, [selectionState.selectedPlan]);

  // Análisis de rentabilidad en tiempo real cuando cambian alternativas seleccionadas
  useEffect(() => {
    if (selectionState.selectedAlternativas.length > 0) {
      analizarRentabilidadEnTiempoReal();
    } else {
      setRentabilidadEnTiempoReal({
        rentabilidadTotal: 0,
        rentabilidadPorcentaje: 0,
        comisiones: 0,
        bonificaciones: 0,
        markup: 0
      });
    }
  }, [selectionState.selectedAlternativas]);

  // Manejadores de eventos con useCallback
  const handleUiStateChange = useCallback((updates) => {
    setUiState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleSelectionStateChange = useCallback((updates) => {
    setSelectionState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleDataStateChange = useCallback((updates) => {
    setDataState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleClose = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleClienteSelect = useCallback(async (cliente) => {
    try {
      handleSelectionStateChange({ selectedCliente: cliente });
      handleUiStateChange({ openClienteModal: false, openCampanaModal: true });
    } catch (error) {
      console.error('Error seleccionando cliente:', error);
      SweetAlertUtils.showError('Error', 'Error al seleccionar cliente', error);
    }
  }, [handleSelectionStateChange, handleUiStateChange]);

  const handleCampanaSelect = useCallback((campana) => {
    handleSelectionStateChange({ selectedCampana: campana });
    handleUiStateChange({ openCampanaModal: false });
  }, [handleSelectionStateChange, handleUiStateChange]);

  const handleResetSelection = useCallback(() => {
    handleSelectionStateChange({
      selectedCliente: null,
      selectedCampana: null,
      selectedPlan: null,
      selectedAlternativas: []
    });
    handleUiStateChange({
      openClienteModal: true,
      openCampanaModal: false
    });
  }, [handleSelectionStateChange, handleUiStateChange]);

  const handleSelectAlternativa = useCallback((alternativaId) => {
    handleSelectionStateChange(prev => ({
      selectedAlternativas: prev.selectedAlternativas.includes(alternativaId)
        ? prev.selectedAlternativas.filter(id => id !== alternativaId)
        : [...prev.selectedAlternativas, alternativaId]
    }));
  }, [handleSelectionStateChange]);

  // Función para analizar rentabilidad en tiempo real
  const analizarRentabilidadEnTiempoReal = useCallback(async () => {
    try {
      const alternativasSeleccionadas = dataState.alternativas.filter(alt =>
        selectionState.selectedAlternativas.includes(alt.id)
      );

      const analisis = await Promise.all(
        alternativasSeleccionadas.map(async (alternativa) => {
          // Obtener configuración de comisiones del cliente
          const configComision = await rentabilidadInteligenteService.obtenerConfiguracionComision(selectionState.selectedCliente.id_cliente);

          // Obtener bonificaciones del medio
          const bonificacionMedio = await rentabilidadInteligenteService.obtenerBonificacionMedio(alternativa.Soportes?.id_soporte);

          // Calcular rentabilidad
          const calculos = rentabilidadInteligenteService.calcularRentabilidadDetallada(
            alternativa.total_bruto || 0,
            alternativa.total_bruto || 0, // Precio informado (inicialmente igual al costo)
            configComision,
            bonificacionMedio
          );

          return {
            alternativa,
            calculos
          };
        })
      );

      const analisisValido = analisis.filter(a => a !== null);

      // Calcular totales
      const totales = analisisValido.reduce((acc, item) => ({
        inversionTotal: acc.inversionTotal + (item.calculos.precioInformado || 0),
        comisiones: acc.comisiones + (item.calculos.comisionMonto || 0),
        bonificaciones: acc.bonificaciones + (item.calculos.bonificacionMonto || 0),
        markup: acc.markup + (item.calculos.markupMonto || 0),
        rentabilidadTotal: acc.rentabilidadTotal + (item.calculos.rentabilidadNeta || 0)
      }), {
        inversionTotal: 0,
        comisiones: 0,
        bonificaciones: 0,
        markup: 0,
        rentabilidadTotal: 0
      });

      const rentabilidadPorcentaje = totales.inversionTotal > 0
        ? (totales.rentabilidadTotal / totales.inversionTotal) * 100
        : 0;

      setRentabilidadEnTiempoReal({
        ...totales,
        rentabilidadPorcentaje
      });

    } catch (error) {
      console.error('Error analizando rentabilidad:', error);
    }
  }, [dataState.alternativas, selectionState.selectedAlternativas, selectionState.selectedCliente]);

  // Función para analizar rentabilidad completa
  const analizarRentabilidadCompleta = useCallback(async () => {
    if (selectionState.selectedAlternativas.length === 0) {
      SweetAlertUtils.showWarning('Atención', 'Debes seleccionar al menos una alternativa para analizar la rentabilidad');
      return;
    }

    setLoadingAnalisis(true);
    try {
      // Crear objeto de orden simulado para análisis
      const ordenSimulada = {
        id_cliente: selectionState.selectedCliente.id_cliente,
        id_campania: selectionState.selectedCampana.id_campania,
        id_plan: selectionState.selectedPlan.id,
        monto_total: rentabilidadEnTiempoReal.inversionTotal,
        fecha_ejecucion: new Date().toISOString().split('T')[0],
        alternativas: selectionState.selectedAlternativas.map(id => ({
          id,
          ...dataState.alternativas.find(a => a.id === id)
        }))
      };

      const analisis = await rentabilidadInteligenteService.analizarRentabilidadOrden(ordenSimulada);
      setAnalisisRentabilidad(analisis);
      setOportunidadesDetectadas(analisis.oportunidades || []);
      setMostrarAnalisis(true);

      // Mostrar resumen con SweetAlert2
      await mostrarResumenRentabilidad(analisis);

    } catch (error) {
      console.error('Error analizando rentabilidad completa:', error);
      SweetAlertUtils.showError('Error', 'No se pudo analizar la rentabilidad');
    } finally {
      setLoadingAnalisis(false);
    }
  }, [selectionState, dataState.alternativas, rentabilidadEnTiempoReal.inversionTotal]);

  // Función para mostrar resumen de rentabilidad
  const mostrarResumenRentabilidad = useCallback(async (analisis) => {
    const { rentabilidad, oportunidades } = analisis;

    let htmlContent = `
      <div class="rentabilidad-resumen-orden">
        <div class="metrica-principal-orden">
          <h4>💰 Rentabilidad Estimada</h4>
          <div class="valor-destacado-orden ${rentabilidad.rentabilidadPorcentaje >= 25 ? 'positivo' : 'negativo'}">
            ${rentabilidad.rentabilidadPorcentaje.toFixed(1)}%
          </div>
          <div class="detalle-valor-orden">
            ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(rentabilidad.rentabilidadNeta)}
          </div>
        </div>

        <div class="desglose-fuentes">
          <h5>Desglose de Ingresos:</h5>
          <div class="fuente-ingreso">
            <span>📊 Comisiones Cliente:</span>
            <span>${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(rentabilidad.comisionesTotal)}</span>
          </div>
          <div class="fuente-ingreso">
            <span>🎯 Bonificaciones Medios:</span>
            <span>${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(rentabilidad.bonificacionesTotal)}</span>
          </div>
          <div class="fuente-ingreso">
            <span>📈 Markup:</span>
            <span>${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(rentabilidad.markupTotal)}</span>
          </div>
        </div>
    `;

    if (oportunidades.length > 0) {
      htmlContent += `
        <div class="oportunidades-orden">
          <h5>🚀 Oportunidades Detectadas (${oportunidades.length}):</h5>
          ${oportunidades.slice(0, 3).map(opp => `
            <div class="oportunidad-breve">
              <strong>${opp.tipo_oportunidad}:</strong> ${opp.descripcion}
              <br><small>Impacto potencial: ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(opp.impacto_estimado)}</small>
            </div>
          `).join('')}
        </div>
      `;
    }

    htmlContent += '</div>';

    const resultado = await Swal.fire({
      title: '🤖 Análisis de Rentabilidad IA',
      html: htmlContent,
      showCancelButton: true,
      confirmButtonText: '💾 Guardar Orden',
      cancelButtonText: '🔄 Seguir Editando',
      customClass: {
        popup: 'rentabilidad-orden-popup'
      },
      ...sweetAlertConfig
    });

    if (resultado.isConfirmed) {
      // Llamar directamente a la lógica de crear orden para evitar referencia circular
      await (async () => {
        try {
          // Validación inicial
          if (selectionState.selectedAlternativas.length === 0) {
            await SweetAlertUtils.showWarning(
              'Advertencia',
              'Debe seleccionar al menos una alternativa para crear la orden'
            );
            return;
          }

          // Confirmación antes de crear
          const result = await SweetAlertUtils.showConfirmation(
            '¿Crear Orden?',
            `Está a punto de crear ${selectionState.selectedAlternativas.length} alternativa(s) en una nueva orden. ¿Desea continuar?`,
            'Sí, crear orden',
            'Cancelar'
          );

          if (!result.isConfirmed) return;

          // Mostrar loading
          SweetAlertUtils.showLoading('Creando orden...');

          // Limpiar alertas previas
          handleDataStateChange({ orderAlerts: [] });

          // Verificar si ya existe una orden con estas alternativas para evitar duplicación
          const { data: ordenExistente } = await supabase
            .from('ordenesdepublicidad')
            .select('id_ordenes_de_comprar, numero_correlativo, creada_con_rentabilidad')
            .eq('id_cliente', selectionState.selectedCliente.id_cliente)
            .eq('id_campania', selectionState.selectedCampana.id_campania)
            .eq('id_plan', selectionState.selectedPlan.id)
            .contains('alternativas_plan_orden', JSON.stringify(selectionState.selectedAlternativas))
            .in('estado', ['pendiente', 'aprobada', 'produccion'])
            .single();

          if (ordenExistente) {
            SweetAlertUtils.close();
            const mensaje = ordenExistente.creada_con_rentabilidad
              ? `Ya existe una orden (#${ordenExistente.numero_correlativo}) con las mismas alternativas seleccionadas, creada con análisis de rentabilidad.`
              : `Ya existe una orden (#${ordenExistente.numero_correlativo}) con las mismas alternativas seleccionadas.`;
            
            await SweetAlertUtils.showWarning('Orden Duplicada', mensaje);
            return;
          }

          // Obtener correlativo
          const ultimoCorrelativo = await OrdenService.getLastCorrelativo();
          let nuevoCorrelativo = ultimoCorrelativo + 1;

          // Obtener alternativas seleccionadas
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

          // Recolectar IDs únicos para actualizar tablas relacionadas
          const updateData = {
            campania: selectionState.selectedCampana.id_campania ? [selectionState.selectedCampana.id_campania] : [],
            soportes: [...new Set(alternativasSeleccionadas.map(alt => alt.Soportes?.id_soporte).filter(Boolean))],
            contratos: [...new Set(alternativasSeleccionadas.map(alt => alt.Contratos?.id).filter(Boolean))],
            temas: [...new Set(alternativasSeleccionadas.map(alt => alt.Temas?.id_tema).filter(Boolean))],
            programas: [...new Set(alternativasSeleccionadas.map(alt => alt.Programas?.id).filter(Boolean))]
          };

          const user2 = JSON.parse(localStorage.getItem('user'));

          // Crear órdenes para cada grupo
          for (const [grupoKey, grupo] of Object.entries(alternativasPorGrupo)) {
            const altsDelGrupo = grupo.alternativas;
            const estimatedDelivery = orderService.calculateEstimatedDelivery(uiState.orderState);

            // Crear orden
            const ordenData = {
              id_campania: selectionState.selectedCampana.id_campania,
              id_plan: selectionState.selectedPlan.id,
              id_compania: selectionState.selectedCampana.id_compania,
              alternativas_plan_orden: altsDelGrupo.map(alt => alt.id),
              numero_correlativo: nuevoCorrelativo,
              usuario_registro: user2 ? {
                nombre: user2.Nombre,
                email: user2.Email
              } : dataState.user ? {
                nombre: dataState.user.nombre,
                email: dataState.user.email
              } : null,
              estado: uiState.orderState,
              fecha_estimada_entrega: estimatedDelivery,
              fecha_inicio_produccion: uiState.orderState === 'produccion' ? new Date().toISOString() : null,
              id_soporte: grupo.soporte?.id_soporte,
              id_contrato: grupo.contrato?.id,
              creada_con_rentabilidad: true
            };

            await OrdenService.createOrden(ordenData);

            // Actualizar alternativas
            await OrdenService.updateAlternativas(
              altsDelGrupo.map(alt => alt.id),
              {
                ordencreada: true,
                numerorden: nuevoCorrelativo
              }
            );

            // Generar PDF
            generateOrderPDF(
              { ...ordenData, id: nuevoCorrelativo },
              altsDelGrupo,
              selectionState.selectedCliente,
              selectionState.selectedCampana,
              selectionState.selectedPlan
            );

            nuevoCorrelativo++;
          }

          // Actualizar tablas relacionadas
          await OrdenService.updateRelatedTables(updateData);

          // Cerrar loading y mostrar éxito
          SweetAlertUtils.close();

          const cantidadOrdenes = Object.keys(alternativasPorGrupo).length;
          const stateConfig = orderService.orderStates[uiState.orderState];

          await SweetAlertUtils.showSuccess(
            '¡Orden Creada!',
            cantidadOrdenes > 1
              ? `Se han creado ${cantidadOrdenes} órdenes correctamente con análisis de rentabilidad.`
              : 'La orden ha sido creada correctamente con análisis de rentabilidad.',
            `Estado inicial: ${stateConfig.description}`
          );

          // Refrescar alternativas y limpiar selecciones
          await fetchAlternativas();
          handleSelectionStateChange({ selectedAlternativas: [] });

        } catch (error) {
          SweetAlertUtils.close();
          console.error('Error en handleCrearOrden:', error);
          await SweetAlertUtils.showError(
            'Error al Crear Orden',
            'No se pudo crear la orden. Por favor, intente nuevamente.',
            error
          );
        }
      })();
    }
  }, [selectionState, dataState, uiState.orderState, dataState.user, fetchAlternativas, handleSelectionStateChange, handleDataStateChange]);

  const handleSelectAllAlternativas = useCallback((event) => {
    handleSelectionStateChange(prev => ({
      selectedAlternativas: event.target.checked 
        ? dataState.alternativas.map(alt => alt.id)
        : []
    }));
  }, [dataState.alternativas, handleSelectionStateChange]);

  // Función principal para crear orden con SweetAlert2 mejorado
  const handleCrearOrden = useCallback(async () => {
    try {
      // Validación inicial
      if (selectionState.selectedAlternativas.length === 0) {
        await SweetAlertUtils.showWarning(
          'Advertencia',
          'Debe seleccionar al menos una alternativa para crear la orden'
        );
        return;
      }

      // Confirmación antes de crear
      const result = await SweetAlertUtils.showConfirmation(
        '¿Crear Orden?',
        `Está a punto de crear ${selectionState.selectedAlternativas.length} alternativa(s) en una nueva orden. ¿Desea continuar?`,
        'Sí, crear orden',
        'Cancelar'
      );

      if (!result.isConfirmed) return;

      // Mostrar loading
      SweetAlertUtils.showLoading('Creando orden...');

      // Limpiar alertas previas
      handleDataStateChange({ orderAlerts: [] });

      // Obtener correlativo
      const ultimoCorrelativo = await OrdenService.getLastCorrelativo();
      let nuevoCorrelativo = ultimoCorrelativo + 1;

      // Obtener alternativas seleccionadas
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

      // Recolectar IDs únicos para actualizar tablas relacionadas
      const updateData = {
        campania: selectionState.selectedCampana.id_campania ? [selectionState.selectedCampana.id_campania] : [],
        soportes: [...new Set(alternativasSeleccionadas.map(alt => alt.Soportes?.id_soporte).filter(Boolean))],
        contratos: [...new Set(alternativasSeleccionadas.map(alt => alt.Contratos?.id).filter(Boolean))],
        temas: [...new Set(alternativasSeleccionadas.map(alt => alt.Temas?.id_tema).filter(Boolean))],
        programas: [...new Set(alternativasSeleccionadas.map(alt => alt.Programas?.id).filter(Boolean))]
      };

      const user2 = JSON.parse(localStorage.getItem('user'));

      // Crear órdenes para cada grupo
      for (const [grupoKey, grupo] of Object.entries(alternativasPorGrupo)) {
        const altsDelGrupo = grupo.alternativas;
        const estimatedDelivery = orderService.calculateEstimatedDelivery(uiState.orderState);

        // Crear orden
        const ordenData = {
          id_campania: selectionState.selectedCampana.id_campania,
          id_plan: selectionState.selectedPlan.id,
          id_compania: selectionState.selectedCampana.id_compania,
          alternativas_plan_orden: altsDelGrupo.map(alt => alt.id),
          numero_correlativo: nuevoCorrelativo,
          usuario_registro: user2 ? {
            nombre: user2.Nombre,
            email: user2.Email
          } : dataState.user ? {
            nombre: dataState.user.nombre,
            email: dataState.user.email
          } : null,
          estado: uiState.orderState,
          fecha_estimada_entrega: estimatedDelivery,
          fecha_inicio_produccion: uiState.orderState === 'produccion' ? new Date().toISOString() : null,
          id_soporte: grupo.soporte?.id_soporte,
          id_contrato: grupo.contrato?.id
        };

        await OrdenService.createOrden(ordenData);

        // Actualizar alternativas
        await OrdenService.updateAlternativas(
          altsDelGrupo.map(alt => alt.id),
          {
            ordencreada: true,
            numerorden: nuevoCorrelativo
          }
        );

        // Generar PDF
        generateOrderPDF(
          { ...ordenData, id: nuevoCorrelativo },
          altsDelGrupo,
          selectionState.selectedCliente,
          selectionState.selectedCampana,
          selectionState.selectedPlan
        );

        nuevoCorrelativo++;
      }

      // Actualizar tablas relacionadas
      await OrdenService.updateRelatedTables(updateData);

      // Cerrar loading y mostrar éxito
      SweetAlertUtils.close();

      const cantidadOrdenes = Object.keys(alternativasPorGrupo).length;
      const stateConfig = orderService.orderStates[uiState.orderState];

      await SweetAlertUtils.showSuccess(
        '¡Orden Creada!',
        cantidadOrdenes > 1
          ? `Se han creado ${cantidadOrdenes} órdenes correctamente`
          : 'La orden ha sido creada correctamente',
        `Estado inicial: ${stateConfig.description}`
      );

      // Agregar alerta de seguimiento
      const newAlert = {
        id: Date.now(),
        type: 'success',
        title: 'Orden creada',
        message: `Orden(es) creada(s) en estado "${stateConfig.description}". ${stateConfig.notifications.length > 0 ? 'Notificaciones enviadas.' : ''}`,
        timestamp: new Date()
      };
      handleDataStateChange(prev => ({
        orderAlerts: [newAlert, ...prev.orderAlerts]
      }));

      // Refrescar alternativas y limpiar selecciones
      await fetchAlternativas();
      handleSelectionStateChange({ selectedAlternativas: [] });

    } catch (error) {
      SweetAlertUtils.close();
      console.error('Error en handleCrearOrden:', error);
      
      // Agregar alerta de error
      const errorAlert = {
        id: Date.now(),
        type: 'error',
        title: 'Error al crear orden',
        message: error.message || 'Ocurrió un error al crear la orden',
        timestamp: new Date()
      };
      handleDataStateChange(prev => ({
        orderAlerts: [errorAlert, ...prev.orderAlerts]
      }));

      await SweetAlertUtils.showError(
        'Error al Crear Orden',
        'No se pudo crear la orden. Por favor, intente nuevamente.',
        error
      );
    }
  }, [
    selectionState,
    dataState,
    uiState.orderState,
    dataState.user,
    fetchAlternativas,
    handleSelectionStateChange,
    handleDataStateChange
  ]);

  // Clientes filtrados con useMemo
  const filteredClientes = useMemo(() => {
    return dataState.clientes.filter(cliente =>
      (cliente.nombrecliente && cliente.nombrecliente.toLowerCase().includes(uiState.searchTerm.toLowerCase())) ||
      cliente.razonSocial?.toLowerCase().includes(uiState.searchTerm.toLowerCase()) ||
      cliente.razonsocial?.toLowerCase().includes(uiState.searchTerm.toLowerCase())
    );
  }, [dataState.clientes, uiState.searchTerm]);

  // Verificar si hay loading general
  const isLoading = loadingClientes || loadingCampanas || loadingPlanes || loadingAlternativas;

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
            value={uiState.searchTerm}
            onChange={(e) => handleUiStateChange({ searchTerm: e.target.value })}
            sx={{ mt: 2 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
            }}
          />
        </DialogTitle>
        <DialogContent>
          {loadingClientes ? (
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
                      <TableCell>{cliente.razonSocial || cliente.razonsocial || 'Sin razón social'}</TableCell>
                      <TableCell>{cliente.RUT || cliente.rut || 'Sin RUT'}</TableCell>
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
          {loadingCampanas ? (
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
                      <TableCell>{campana.anios?.years || 'No especificado'}</TableCell>
                      <TableCell>{campana.productos?.nombredelproducto || 'No especificado'}</TableCell>
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

      {selectionState.selectedCliente && selectionState.selectedCampana && (
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
              {selectionState.selectedCampana ? (
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
                        >
                          <TableCell>{plan.nombre_plan}</TableCell>
                          <TableCell>{plan.anios?.years}</TableCell>
                          <TableCell>{plan.meses?.nombre}</TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              onClick={() => handleSelectionStateChange({ selectedPlan: plan })}
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
              {/* Panel de Rentabilidad en Tiempo Real */}
              {selectionState.selectedAlternativas.length > 0 && (
                <Box sx={{
                  mb: 2,
                  p: 2,
                  backgroundColor: '#ffffff',
                  borderRadius: 1,
                  border: '1px solid #e0e0e0'
                }}>
                  <Typography variant="h6" sx={{ color: 'success.main', mb: 1 }}>
                    📊 Rentabilidad en Tiempo Real
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ minWidth: 120 }}>
                      <Typography variant="body2" color="text.secondary">Rentabilidad:</Typography>
                      <Typography variant="h6" sx={{
                        color: rentabilidadEnTiempoReal.rentabilidadPorcentaje >= 25 ? 'success.main' : 'error.main',
                        fontWeight: 'bold'
                      }}>
                        {rentabilidadEnTiempoReal.rentabilidadPorcentaje.toFixed(1)}%
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 120 }}>
                      <Typography variant="body2" color="text.secondary">Comisiones:</Typography>
                      <Typography variant="body1">
                        {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(rentabilidadEnTiempoReal.comisiones)}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 120 }}>
                      <Typography variant="body2" color="text.secondary">Bonificaciones:</Typography>
                      <Typography variant="body1">
                        {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(rentabilidadEnTiempoReal.bonificaciones)}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 120 }}>
                      <Typography variant="body2" color="text.secondary">Markup:</Typography>
                      <Typography variant="body1">
                        {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(rentabilidadEnTiempoReal.markup)}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 120 }}>
                      <Typography variant="body2" color="text.secondary">Total Rentabilidad:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(rentabilidadEnTiempoReal.rentabilidadTotal)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                  Alternativas para Nueva Orden
                </Typography>
                {selectionState.selectedPlan && (
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleCrearOrden}
                      disabled={selectionState.selectedAlternativas.length === 0 || loadingAlternativas}
                    >
                      Crear Orden
                    </Button>

                    {/* Botón de análisis de rentabilidad */}
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<InfoIcon />}
                      onClick={analizarRentabilidadCompleta}
                      disabled={selectionState.selectedAlternativas.length === 0 || loadingAnalisis}
                    >
                      {loadingAnalisis ? '⏳ Analizando...' : '🤖 Análisis Rentabilidad'}
                    </Button>

                    {/* Selector de estado inicial */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Estado inicial:
                      </Typography>
                      <Chip
                        label={orderService.orderStates[uiState.orderState]?.description || 'Estado desconocido'}
                        sx={{
                          backgroundColor: orderService.orderStates[uiState.orderState]?.color || '#64748b',
                          color: 'white',
                          fontSize: '0.75rem'
                        }}
                        size="small"
                      />
                    </Box>
                  </Box>
                )}

                {/* Mostrar alertas de órdenes */}
                {dataState.orderAlerts.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    {dataState.orderAlerts.slice(0, 3).map((alert) => (
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
              {selectionState.selectedPlan ? (
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
      {dataState.ordenCreada && dataState.alternativasOrden.length > 0 && (
        <TablaOrden
          ordenData={dataState.ordenCreada}
          alternativas={dataState.alternativasOrden}
          cliente={selectionState.selectedCliente}
          campana={selectionState.selectedCampana}
        />
      )}
    </Container>
  );
};

export default CrearOrdenOptimized;