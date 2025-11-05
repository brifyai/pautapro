import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import {
  Container,
  Paper,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  DialogActions,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  InputAdornment,
  Switch,
  FormControlLabel,
  Radio,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  Title as TitleIcon,
  CalendarMonth as CalendarMonthIcon,
  EventNote as EventNoteIcon,
  Flag as FlagIcon,
  Topic as TopicIcon,
  Timer as TimerIcon,
  ColorLens as ColorLensIcon,
  Code as CodeIcon,
  Category as CategoryIcon
} from '@mui/icons-material';

import './Planificacion.css';
import Swal from 'sweetalert2';

const Planificacion = () => {
  const navigate = useNavigate();
  
  const handleClose = () => {
    navigate('/');
  };
  const [openClienteModal, setOpenClienteModal] = useState(true);
  const [openCampanaModal, setOpenCampanaModal] = useState(false);
  const [openNuevoPlanModal, setOpenNuevoPlanModal] = useState(false);
  const [openEditPlanModal, setOpenEditPlanModal] = useState(false);
  const [openNuevoTemaModal, setOpenNuevoTemaModal] = useState(false);
  const [openEditTemaModal, setOpenEditTemaModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [campanas, setCampanas] = useState([]);
  const [temas, setTemas] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedCampana, setSelectedCampana] = useState(null);
  const [tempSelectedCampana, setTempSelectedCampana] = useState(null);
  const [selectedCampanaFromClick, setSelectedCampanaFromClick] = useState(false);
  const [nuevoPlan, setNuevoPlan] = useState({
    nombre_plan: '',
    anio: '',
    mes: '',
    estado: null,
    estado2: null
  });
  const [editingPlan, setEditingPlan] = useState({
    id: null,
    nombre_plan: '',
    anio: '',
    mes: '',
    estado: '',
    estado2: ''
  });
  const [selectedTema, setSelectedTema] = useState(null);
  const [nuevoTema, setNuevoTema] = useState({
    NombreTema: '',
    Duracion: '',
    id_medio: '',
    id_Calidad: '',
    color: '',
    CodigoMegatime: '',
    rubro: '',
    cooperado: ''
  });
  const [anios, setAnios] = useState([]);
  const [meses, setMeses] = useState([]);
  const [medios, setMedios] = useState([]);
  const [calidades, setCalidades] = useState([]);
  const [visibleFields, setVisibleFields] = useState({
    duracion: false,
    color: false,
    codigo_megatime: false,
    calidad: false,
    cooperado: false,
    rubro: false
  });
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchClientes();
    fetchMedios();
    fetchCalidades();
  }, []);

  useEffect(() => {
    if (selectedCampana) {
      console.log('✅ useEffect: selectedCampana cambió a:', selectedCampana);
      fetchTemasForCampana(selectedCampana.id_campania);
      fetchPlanes(selectedCampana);
    }
  }, [selectedCampana]);

  useEffect(() => {
    fetchAniosYMeses();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
        const { data, error } = await supabase
        .from('clientes')
        .select('id_cliente, nombrecliente, rut, razonsocial')
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
          clientes!inner (
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

      if (error) throw error;
      setCampanas(data || []);
    } catch (error) {
      console.error('Error al cargar campañas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemasForCampana = async (campaniaId) => {
    try {
      setLoading(true);
      
      // Primero obtener los IDs de los temas de la campaña
      const { data: campaniaTemas, error: campaniaError } = await supabase
        .from('campania_temas')
        .select('id_temas')
        .eq('id_campania', campaniaId);

      if (campaniaError) throw campaniaError;

      if (!campaniaTemas || campaniaTemas.length === 0) {
        setTemas([]);
        return;
      }

      // Luego obtener los detalles de los temas sin relaciones
      const temaIds = campaniaTemas.map(ct => ct.id_temas);
      const { data: temasData, error: temasError } = await supabase
        .from('temas')
        .select(`
          id_tema,
          nombre_tema,
          id_medio,
          id_calidad,
          descripcion,
          estado,
          c_orden,
          created_at,
          updated_at
        `)
        .in('id_tema', temaIds);

      if (temasError) throw temasError;

      // Obtener medios y calidades por separado
      const [mediosData, calidadesData] = await Promise.all([
        supabase.from('medios').select('id, nombre_medio'),
        supabase.from('calidad').select('id, nombrecalidad')
      ]);

      const temasTransformados = temasData?.map(tema => {
        const medio = mediosData.data?.find(m => m.id === tema.id_medio);
        const calidad = calidadesData.data?.find(c => c.id === tema.id_calidad);
        
        return {
          ...tema,
          NombreTema: tema.nombre_tema, // Mapear nombre_tema a NombreTema
          Duracion: tema.descripcion || '', // Usar descripción como duración si existe
          color: '', // Campo vacío ya que no existe en el esquema
          CodigoMegatime: '', // Campo vacío ya que no existe en el esquema
          rubro: '', // Campo vacío ya que no existe en el esquema
          cooperado: '', // Campo vacío ya que no existe en el esquema
          id_Calidad: tema.id_calidad, // Mapear id_calidad a id_Calidad
          Calidad: calidad ? {
            id_calidad: calidad.id,
            nombrecalidad: calidad.nombrecalidad
          } : null,
          Medios: medio ? {
            id_medio: medio.id,
            nombre_medio: medio.nombre_medio,
            nombredelmedio: medio.nombre_medio,
            NombredelMedio: medio.nombre_medio
          } : null
        };
      }) || [];

      setTemas(temasTransformados);
    } catch (error) {
      console.error('Error al cargar temas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanes = async (campanaData = null) => {
    const campanaParaBuscar = campanaData || selectedCampana;
    
    if (!campanaParaBuscar) {
      console.log('❌ fetchPlanes: No hay campaña seleccionada');
      setPlanes([]);
      return;
    }
    
    try {
      setLoading(true);
      console.log('🔍 fetchPlanes: Buscando planes para campaña:', campanaParaBuscar.id_campania);
      console.log('🔍 fetchPlanes: Datos completos de campaña:', campanaParaBuscar);
      
      let planesEncontrados = [];
      
      // 🔥 MÉTODO CORRECTO: Buscar planes a través de la tabla de relaciones campana_planes
      console.log('🔍 Buscando planes a través de relaciones campaña-planes...');
      
      // 1. Primero buscar las relaciones para esta campaña
      const { data: relacionesDeCampania, error: errorRelaciones } = await supabase
        .from('campana_planes')
        .select('id_plan')
        .eq('id_campania', campanaParaBuscar.id_campania);
      
      if (errorRelaciones) {
        console.error('❌ Error buscando relaciones:', errorRelaciones);
      } else {
        console.log('📗 Relaciones encontradas para campaña', campanaParaBuscar.id_campania, ':', relacionesDeCampania?.length || 0);
        
        if (relacionesDeCampania && relacionesDeCampania.length > 0) {
          // 2. Obtener los IDs de los planes relacionados
          const idsPlanes = relacionesDeCampania.map(rel => rel.id_plan);
          console.log('🎯 IDs de planes relacionados:', idsPlanes);
          
          // 3. Obtener los datos completos de esos planes
          const { data: planesRelacionados, error: errorPlanesRelacionados } = await supabase
            .from('plan')
            .select(`
              id,
              id_cliente,
              id_campania,
              anio,
              mes,
              nombre_plan,
              descripcion,
              presupuesto,
              estado,
              estado2,
              created_at,
              updated_at,
              anios (id, years),
              meses (id, nombre)
            `)
            .in('id', idsPlanes);
          
          if (!errorPlanesRelacionados && planesRelacionados) {
            planesEncontrados = planesRelacionados;
            console.log('✅ Planes encontrados a través de relaciones:', planesRelacionados.length, planesRelacionados);
          } else {
            console.error('❌ Error obteniendo planes relacionados:', errorPlanesRelacionados);
          }
        } else {
          console.log('📝 No hay relaciones para esta campaña en campana_planes');
        }
      }
      
      // 🔍 MÉTODO ALTERNATIVO: Si no hay relaciones, buscar por campo directo (fallback)
      if (planesEncontrados.length === 0) {
        console.log('🔄 Intentando búsqueda directa por id_campania...');
        
        const { data: planesPorCampania, error: errorCampania } = await supabase
          .from('plan')
          .select(`
            id,
            id_cliente,
            id_campania,
            anio,
            mes,
            nombre_plan,
            descripcion,
            presupuesto,
            estado,
            estado2,
            created_at,
            updated_at,
            anios (id, years),
            meses (id, nombre)
          `)
          .eq('id_campania', campanaParaBuscar.id_campania);

        if (!errorCampania && planesPorCampania) {
          planesEncontrados = planesPorCampania;
          console.log('✅ Planes encontrados por id_campania directo:', planesPorCampania.length, planesPorCampania);
        }
      }
      
      console.log('✅ fetchPlanes: Planes finales encontrados:', planesEncontrados.length, planesEncontrados);
      
      // Si no hay planes, mostrar mensaje informativo
      if (planesEncontrados.length === 0) {
        console.log('⚠️ No hay planes para esta campaña. Puedes crear uno usando el botón "Nuevo Plan"');
        console.log('💡 Sugerencia: Usa el botón "🔍 Diagnóstico" para ver todos los datos disponibles');
      }
      
      setPlanes(planesEncontrados);
    } catch (error) {
      console.error('❌ Error fetching planes:', error);
      setPlanes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAniosYMeses = async () => {
    try {
      const [aniosResult, mesesResult] = await Promise.all([
        supabase.from('anios').select('*').order('years'),
        supabase.from('meses').select('*').order('id')
      ]);

      if (aniosResult.error) throw aniosResult.error;
      if (mesesResult.error) throw mesesResult.error;

      setAnios(aniosResult.data || []);
      setMeses(mesesResult.data || []);
    } catch (error) {
      console.error('Error al cargar años y meses:', error);
    }
  };

  // Función de diagnóstico para verificar datos existentes
  const diagnosticarDatos = async () => {
    console.log('🔍 === DIAGNÓSTICO COMPLETO DE DATOS ===');
    
    try {
      // 1. Verificar todas las campañas
      const { data: campanias, error: errorCampanias } = await supabase
        .from('campania')
        .select('*');
      
      console.log('📊 Campañas existentes:', campanias?.length || 0, campanias);
      if (errorCampanias) console.error('❌ Error campañas:', errorCampanias);

      // 2. Verificar todos los planes
      const { data: planes, error: errorPlanes } = await supabase
        .from('plan')
        .select('*');
      
      console.log('📊 Planes existentes:', planes?.length || 0, planes);
      if (errorPlanes) console.error('❌ Error planes:', errorPlanes);

      // 3. Verificar relaciones campaña-planes
      const { data: campanaPlanes, error: errorCampanaPlanes } = await supabase
        .from('campana_planes')
        .select('*');
      
      console.log('📊 Relaciones campaña-planes:', campanaPlanes?.length || 0, campanaPlanes);
      if (errorCampanaPlanes) console.error('❌ Error relaciones:', errorCampanaPlanes);

      // 4. Verificar planes por campaña específica
      if (selectedCampana) {
        console.log('🎯 Campaña seleccionada:', selectedCampana);
        
        // 4.1 🔍 NUEVO: Buscar planes a través de la tabla de relaciones campana_planes
        console.log('🔍 Buscando planes a través de relaciones campaña-planes...');
        const { data: relacionesDeCampania, error: errorRelaciones } = await supabase
          .from('campana_planes')
          .select('*')
          .eq('id_campania', selectedCampana.id_campania);
        
        console.log('📗 Relaciones para campaña', selectedCampana.id_campania, ':', relacionesDeCampania?.length || 0, relacionesDeCampania);
        
        if (relacionesDeCampania && relacionesDeCampania.length > 0) {
          // Obtener los planes relacionados a través de la tabla de relaciones
          const idsPlanes = relacionesDeCampania.map(rel => rel.id_plan);
          console.log('🎯 IDs de planes relacionados:', idsPlanes);
          
          const { data: planesRelacionados, error: errorPlanesRelacionados } = await supabase
            .from('plan')
            .select(`
              id,
              id_cliente,
              id_campania,
              anio,
              mes,
              nombre_plan,
              descripcion,
              presupuesto,
              estado,
              estado2,
              created_at,
              updated_at,
              anios (id, years),
              meses (id, nombre)
            `)
            .in('id', idsPlanes);
          
          console.log('✅ Planes encontrados a través de relaciones:', planesRelacionados?.length || 0, planesRelacionados);
          
          if (planesRelacionados && planesRelacionados.length > 0) {
            console.log('🎉 SOLUCIÓN ENCONTRADA: Los planes están relacionados a través de la tabla campana_planes');
            // Actualizar el estado con estos planes
            setPlanes(planesRelacionados);
            return; // Salir temprano ya que encontramos la solución
          }
        }

        // 4.2 Buscar planes por id_campania directo
        const { data: planesPorCampania, error: errorPlanesPorCampania } = await supabase
          .from('plan')
          .select('*')
          .eq('id_campania', selectedCampana.id_campania);
        
        console.log('📊 Planes por id_campania directo:', planesPorCampania?.length || 0, planesPorCampania);
        if (errorPlanesPorCampania) console.error('❌ Error planes por campaña:', errorPlanesPorCampania);

        // 4.3 Verificar si hay planes con otros IDs de campaña
        const { data: todosLosPlanesConCampania } = await supabase
          .from('plan')
          .select('id, id_campania, nombre_plan');
        
        console.log('📊 Todos los planes con sus id_campania:', todosLosPlanesConCampania);

        // 4.4 Verificar estructura exacta de la tabla plan
        const { data: estructuraPlan } = await supabase
          .from('plan')
          .select('*')
          .limit(1);
        
        console.log('🏗️ Estructura de tabla plan (primer registro):', estructuraPlan);
      }

      console.log('🔍 === FIN DIAGNÓSTICO ===');
    } catch (error) {
      console.error('❌ Error en diagnóstico:', error);
    }
  };

  const fetchMedios = async () => {
    try {
      const { data, error } = await supabase
        .from('medios')
        .select(`
          id,
          nombre_medio,
          duracion,
          color,
          codigo_megatime,
          calidad,
          cooperado,
          rubro
        `)
        .order('nombre_medio');

      if (error) throw error;
      
      const mediosConCampos = data.map(medio => ({
        ...medio,
        nombredelmedio: medio.nombre_medio, // Mapear para compatibilidad
        NombredelMedio: medio.nombre_medio, // Mapeo adicional para compatibilidad
        duracion: Boolean(medio.duracion),
        color: Boolean(medio.color),
        codigo_megatime: Boolean(medio.codigo_megatime),
        calidad: Boolean(medio.calidad),
        cooperado: Boolean(medio.cooperado),
        rubro: Boolean(medio.rubro)
      }));

      setMedios(mediosConCampos || []);
    } catch (error) {
      console.error('Error al cargar medios:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar los medios: ' + error.message
      });
    }
  };

  const fetchCalidades = async () => {
    try {
      // Intentar con diferentes nombres de tabla que podrían existir
      let data, error;
      
      // Primero intentar con 'calidad' (minúscula)
      ({ data, error } = await supabase
        .from('calidad')
        .select('id, nombrecalidad')
        .order('nombrecalidad'));

      if (error) {
        // Si falla, intentar con 'Calidad' (mayúscula)
        ({ data, error } = await supabase
          .from('Calidad')
          .select('id, NombreCalidad')
          .order('NombreCalidad'));
      }

      if (error) {
        console.warn('No se encontró tabla de calidad, usando array vacío');
        data = [];
      }
      
      // Mapear para compatibilidad con el componente
      const calidadesMapeadas = data?.map(calidad => ({
        ...calidad,
        nombrecalidad: calidad.nombrecalidad || calidad.NombreCalidad,
        NombreCalidad: calidad.NombreCalidad || calidad.nombrecalidad
      })) || [];
      
      setCalidades(calidadesMapeadas);
    } catch (error) {
      console.error('Error al cargar calidades:', error);
      setCalidades([]); // Establecer array vacío en caso de error
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

  const handleCampanaClick = async (campana) => {
    setSelectedCampanaFromClick(true);
    setTempSelectedCampana(campana);
    await fetchTemasForCampana(campana.id_campania);
  };

  const handleConfirmSelection = () => {
    console.log('🔄 handleConfirmSelection: Confirmando selección de campaña:', tempSelectedCampana);
    setSelectedCampana(tempSelectedCampana);
    setOpenCampanaModal(false);
    // El useEffect se encargará de cargar temas y planes cuando selectedCampana cambie
  };

  const handleCloseCampanaModal = () => {
    setOpenCampanaModal(false);
    setTempSelectedCampana(null);
    setSelectedCampanaFromClick(false);
  };

  const handleResetSelection = () => {
    setSelectedCliente(null);
    setSelectedCampana(null);
    setTemas([]);
    setPlanes([]);
    setOpenClienteModal(true);
  };

  const handleNuevoPlanChange = (field, value) => {
    setNuevoPlan(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreatePlan = async () => {
    try {
      setLoading(true);

      if (!selectedCampana?.id_campania) {
        throw new Error('No hay una campaña seleccionada');
      }

      // Create the plan
      const { data: planData, error: planError } = await supabase
        .from('plan')
        .insert([{
          nombre_plan: nuevoPlan.nombre_plan,
          anio: nuevoPlan.anio,
          mes: nuevoPlan.mes,
          estado: 'P',
          estado2: null,
          id_campania: selectedCampana.id_campania
        }])
        .select()
        .single();

      if (planError) {
        console.error('Error al crear plan:', planError);
 
      }

      console.log('Plan creado:', planData);

      // Create the campaign-plan relationship
      const { error: relError } = await supabase
        .from('campana_planes')
        .insert([{
          id_campania: selectedCampana.id_campania,
          id_plan: planData.id
        }]);

      if (relError) {
        console.error('Error al crear relación campana_planes:', relError);
        throw relError;
      }

      // Update plans list
      await fetchPlanes(selectedCampana);

      // Close modal and reset form
      setOpenNuevoPlanModal(false);
      setNuevoPlan({
        nombre_plan: '',
        anio: '',
        mes: '',
        estado: null,
        estado2: null
      });

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Plan creado exitosamente',
        showConfirmButton: false,
        timer: 1500
      });

    } catch (error) {
      console.error('Error al crear plan:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo crear el plan'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlanStatus = async (planId, newStatus) => {
    try {
      const { error } = await supabase
        .from('plan')
        .update({ estado2: newStatus })
        .eq('id', planId);

      if (error) throw error;

      await fetchPlanes(selectedCampana);
      
      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el estado del plan'
      });
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan({
      id: plan.id,
      nombre_plan: plan.nombre_plan,
      anio: plan.anio,
      mes: plan.mes,
      estado: plan.estado,
      estado2: plan.estado2
    });
    setOpenEditPlanModal(true);
  };

  const handleUpdatePlan = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('plan')
        .update({
          nombre_plan: editingPlan.nombre_plan,
          anio: editingPlan.anio,
          mes: editingPlan.mes,
          estado: editingPlan.estado,
          estado2: editingPlan.estado2
        })
        .eq('id', editingPlan.id);

      if (error) throw error;

      await fetchPlanes(selectedCampana);
      setOpenEditPlanModal(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Plan actualizado',
        text: 'El plan se ha actualizado exitosamente',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error al actualizar el plan:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el plan'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlanChange = (field) => (event) => {
    setEditingPlan(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleNuevoTemaClick = () => {
    console.log('Abriendo modal de nuevo tema');
    setOpenNuevoTemaModal(true);
  };

  const handleEditTemaClick = async (tema) => {
    console.log('Tema a editar:', tema); // Para debugging
    setIsEditMode(true);
    setSelectedTema(tema);

    // Asegurarse de que los medios estén cargados
    if (medios.length === 0) {
      await fetchMedios();
    }

    // Asegurarse de que las calidades estén cargadas
    if (calidades.length === 0) {
      await fetchCalidades();
    }

    // Obtener el id_medio del objeto Medios anidado
    const medioId = tema.Medios?.id_medio || '';

    setNuevoTema({
      id_tema: tema.id_tema,
      NombreTema: tema.NombreTema || '',
      Duracion: tema.Duracion || '',
      id_medio: medioId.toString(), // Usar el id_medio del objeto Medios
      id_Calidad: tema.id_Calidad?.toString() || '',
      color: tema.color || '',
      CodigoMegatime: tema.CodigoMegatime || '',
      rubro: tema.rubro || '',
      cooperado: tema.cooperado || ''
    });

    // Actualizar los campos visibles según el medio seleccionado
    if (medioId) {
      const medio = medios.find(m => m.id === medioId);
      if (medio) {
        setVisibleFields({
          duracion: medio.duracion,
          color: medio.color,
          codigo_megatime: medio.codigo_megatime,
          calidad: medio.calidad,
          cooperado: medio.cooperado,
          rubro: medio.rubro
        });
      }
    }

    setOpenNuevoTemaModal(true);
  };

  const handleCloseModals = () => {
    setOpenNuevoTemaModal(false);
    setOpenEditTemaModal(false);
    setSelectedTema(null);
    setIsEditMode(false);
    setNuevoTema({
      NombreTema: '',
      Duracion: '',
      id_medio: '',
      id_Calidad: '',
      color: '',
      CodigoMegatime: '',
      rubro: '',
      cooperado: ''
    });
  };

  const handleMedioChange = (event) => {
    const medioId = event.target.value;
    console.log('Medio seleccionado:', medioId); // Para debugging

    // Encontrar el medio seleccionado
    const selectedMedio = medios.find(m => m.id.toString() === medioId);
    
    if (selectedMedio) {
      // Actualizar los campos visibles según el medio
      setVisibleFields({
        duracion: selectedMedio.duracion,
        color: selectedMedio.color,
        codigo_megatime: selectedMedio.codigo_megatime,
        calidad: selectedMedio.calidad,
        cooperado: selectedMedio.cooperado,
        rubro: selectedMedio.rubro
      });
    }

    // Actualizar el valor del medio en el estado
    setNuevoTema(prev => ({
      ...prev,
      id_medio: medioId,
      // Resetear valores relacionados si el medio cambia
      ...(isEditMode ? {} : {
        id_Calidad: '',
        Duracion: '',
        color: '',
        CodigoMegatime: '',
        rubro: '',
        cooperado: ''
      })
    }));
  };

  const handleNuevoTemaChange = (event) => {
    const { name, value } = event.target;
    setNuevoTema(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGuardarTema = async () => {
    try {
      setLoading(true);

      const campaniaActual = selectedCampana || tempSelectedCampana;
      if (!campaniaActual?.id_campania) {
        throw new Error('No hay una campaña seleccionada');
      }

      // Convertir el id_medio a número para la base de datos
      const id_medio = nuevoTema.id_medio ? parseInt(nuevoTema.id_medio) : null;

      if (isEditMode) {
        // Actualizar tema existente
        const { error: updateError } = await supabase
          .from('temas')
          .update({
            nombre_tema: nuevoTema.NombreTema,
            id_medio: id_medio,
            id_calidad: nuevoTema.id_Calidad ? parseInt(nuevoTema.id_Calidad) : null
          })
          .eq('id_tema', selectedTema.id_tema);

        if (updateError) {
          console.error('Error actualizando tema:', updateError);
          throw updateError;
        }

        console.log('Tema actualizado exitosamente');

      } else {
        // Crear nuevo tema usando auto-incremento de la base de datos
        const temaDataToInsert = {
          nombre_tema: nuevoTema.NombreTema,
          id_medio: id_medio,
          id_calidad: nuevoTema.id_Calidad ? parseInt(nuevoTema.id_Calidad) : null,
          estado: true,
          c_orden: false
        };

        console.log('Insertando tema:', temaDataToInsert);

        const { data: insertedTema, error: temaError } = await supabase
          .from('temas')
          .insert([temaDataToInsert])
          .select()
          .single();

        if (temaError) {
          console.error('Error insertando tema:', temaError);
          throw temaError;
        }

        console.log('Tema insertado:', insertedTema);

        // Crear relación con la campaña
        const { error: campaniaTemasError } = await supabase
          .from('campania_temas')
          .insert([{
            id_campania: campaniaActual.id_campania,
            id_temas: insertedTema.id_tema
          }]);

        if (campaniaTemasError) {
          console.error('Error creando relación campaña-tema:', campaniaTemasError);
          throw campaniaTemasError;
        }

        console.log('Relación campaña-tema creada exitosamente');
      }

      // Actualizar la lista de temas
      await fetchTemasForCampana(campaniaActual.id_campania);

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: isEditMode ? 'Tema actualizado correctamente' : 'Tema agregado correctamente'
      });

      handleCloseModals();
    } catch (error) {
      console.error('Error al guardar el tema:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `No se pudo ${isEditMode ? 'actualizar' : 'agregar'} el tema: ` + (error.message || 'Error desconocido')
      });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCliente || !selectedCampana) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        {/* Modal de Selección de Cliente */}
        <Dialog 
          open={openClienteModal} 
          maxWidth="md" 
          fullWidth
          disableEscapeKeyDown
        >
          <DialogTitle sx={{ m: 0, p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ textAlign: 'left' }}>
            Seleccionar Cliente
            </Typography>
            <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'black',
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
              {clientes
                .filter(cliente =>
                (cliente.nombrecliente && cliente.nombrecliente.toLowerCase().includes(searchTerm.toLowerCase())) ||
                cliente.razonsocial?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((cliente) => (
                <TableRow key={`cliente-${cliente.id_cliente}`}>
                  <TableCell>{cliente.nombrecliente}</TableCell>
                  <TableCell>{cliente.razonsocial}</TableCell>
                  <TableCell>{cliente.rut}</TableCell>
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
          maxWidth={false}
          fullWidth
          disableEscapeKeyDown
          PaperProps={{
          sx: {
            minHeight: '90vh',
            maxHeight: '90vh',
            width: '95%',
            margin: '16px'
          }
          }}
        >
          <DialogTitle sx={{ 
          textAlign: 'center', 
          borderBottom: '1px solid #e0e0e0',
          pb: 2,
          position: 'relative'
          }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
            <Typography variant="h6">
              Seleccionar Campaña
            </Typography>
            <Typography variant="subtitle2" color="primary">
              Cliente: {selectedCliente?.nombrecliente}
            </Typography>
            </Box>
            <IconButton
            aria-label="close"
            onClick={handleCloseCampanaModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'black',
            }}
            >
            <CloseIcon />
            </IconButton>
          </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" className="campaign-card" sx={{ height: 'calc(75vh - 100px)' }}>
                  <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" gutterBottom>
                      Campañas Disponibles
                    </Typography>
                    <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Campaña</TableCell>
                            <TableCell>Año</TableCell>
                            <TableCell>Cliente</TableCell>
                            <TableCell>Producto</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {campanas.map((campana) => (
                            <TableRow
                              key={`campania-${campana.id_campania}`}
                              onClick={() => handleCampanaClick(campana)}
                              sx={{
                                cursor: 'pointer',
                                backgroundColor: tempSelectedCampana?.id_campania === campana.id_campania && selectedCampanaFromClick ? '#e3f2fd' : 'inherit',
                                '&:hover': {
                                  backgroundColor: '#f5f5f5',
                                },
                              }}
                            >
                              <TableCell>{campana.nombrecampania}</TableCell>
                              <TableCell>{campana.anios?.years}</TableCell>
                              <TableCell>{campana.clientes?.nombrecliente}</TableCell>
                              <TableCell>{campana.productos?.nombredelproducto}</TableCell>
                            </TableRow>
                          ))}
                          {campanas.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} align="center">
                                No hay campañas disponibles
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" className="themes-card" sx={{ height: 'calc(75vh - 100px)' }}>
                  <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Temas de la Campaña
                      </Typography>
                      {tempSelectedCampana && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<AddIcon sx={{ color: 'white' }} />}
                            onClick={() => setOpenNuevoTemaModal(true)}
                            sx={{
                              backgroundColor: '#1976d2',
                              '&:hover': {
                                backgroundColor: '#1565c0'
                              }
                            }}
                          >
                            Agregar Tema
                          </Button>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => selectedTema && handleEditTemaClick(selectedTema)}
                            disabled={!selectedTema}
                          >
                            Editar Tema
                          </Button>
                        </Box>
                      )}
                    </Box>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                        <CircularProgress />
                      </Box>
                    ) : temas.length > 0 ? (
                      <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>TEMA-AVISO</TableCell>
                              <TableCell>Duración</TableCell>
                              <TableCell>Medio</TableCell>
                              <TableCell>Calidad</TableCell>
                              <TableCell>Color</TableCell>
                              <TableCell>Código Megatime</TableCell>
                              <TableCell>Rubro</TableCell>
                              <TableCell>Cooperado</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {temas.map((tema) => (
                              <TableRow
                                key={tema.id_tema}
                                hover
                                selected={selectedTema?.id_tema === tema.id_tema}
                                onClick={() => setSelectedTema(tema)}
                                sx={{ 
                                  cursor: 'pointer',
                                  '&.Mui-selected': {
                                    backgroundColor: 'primary.lighter'
                                  }
                                }}
                              >
                                <TableCell>{tema.NombreTema}</TableCell>
                                <TableCell>{tema.Duracion}</TableCell>
                                <TableCell>{tema.Medios?.nombre_medio}</TableCell>
                                <TableCell>{tema.Calidad?.nombrecalidad}</TableCell>
                                <TableCell>{tema.color}</TableCell>
                                <TableCell>{tema.CodigoMegatime}</TableCell>
                                <TableCell>{tema.rubro}</TableCell>
                                <TableCell>{tema.cooperado ? 'Sí' : 'No'}</TableCell>
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
                        flexGrow: 1,
                        bgcolor: '#f5f5f5',
                        borderRadius: 1,
                        p: 2
                      }}>
                        <Typography variant="body1" color="text.secondary" align="center">
                          {tempSelectedCampana ? 
                            "No hay temas disponibles para esta campaña" : 
                            "Seleccione una campaña para ver sus temas"}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
            <Button 
              onClick={() => {
                setOpenCampanaModal(false);
                setOpenClienteModal(true);
              }}
              variant="outlined"
            >
              Volver
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmSelection}
              disabled={!tempSelectedCampana}
              size="large"
            >
              Confirmar Selección
            </Button>
          </DialogActions>

          {/* Modal de Nuevo Tema (anidado dentro del modal de campañas) */}
          <Dialog 
            open={openNuevoTemaModal} 
            onClose={handleCloseModals}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Agregar Nuevo Tema</Typography>
                <IconButton onClick={handleCloseModals}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Medio</InputLabel>
                    <Select
                      value={nuevoTema.id_medio || ''}
                      onChange={handleMedioChange}
                      name="id_medio"
                      label="Medio"
                      required
                    >
                      <MenuItem value="">
                        <em>Seleccione un medio</em>
                      </MenuItem>
                      {medios.map((medio) => (
                        <MenuItem key={medio.id} value={medio.id}>
                          {medio.nombre_medio}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre del Tema"
                    name="NombreTema"
                    value={nuevoTema.NombreTema}
                    onChange={handleNuevoTemaChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TopicIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                {visibleFields.duracion && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Duración"
                      name="Duracion"
                      value={nuevoTema.Duracion}
                      onChange={handleNuevoTemaChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TimerIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                )}
                {visibleFields.color && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Color"
                      name="color"
                      value={nuevoTema.color}
                      onChange={handleNuevoTemaChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ColorLensIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                )}
                {visibleFields.codigo_megatime && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Código Megatime"
                      name="CodigoMegatime"
                      value={nuevoTema.CodigoMegatime}
                      onChange={handleNuevoTemaChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CodeIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                )}
                {visibleFields.calidad && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Calidad</InputLabel>
                      <Select
                        value={nuevoTema.id_Calidad || ''}
                        onChange={handleNuevoTemaChange}
                        name="id_Calidad"
                        label="Calidad"
                      >
                        <MenuItem value="">
                          <em>Seleccione una calidad</em>
                        </MenuItem>
                        {calidades.map((calidad) => (
                          <MenuItem key={calidad.id} value={calidad.id}>
                            {calidad.nombrecalidad}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                {visibleFields.cooperado && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Cooperado</InputLabel>
                      <Select
                        value={nuevoTema.cooperado}
                        onChange={handleNuevoTemaChange}
                        name="cooperado"
                        label="Cooperado"
                      >
                        <MenuItem value="">No</MenuItem>
                        <MenuItem value="Sí">Sí</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                {visibleFields.rubro && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Rubro"
                      name="rubro"
                      value={nuevoTema.rubro}
                      onChange={handleNuevoTemaChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CategoryIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModals}>Cancelar</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGuardarTema}
                disabled={loading || !nuevoTema.NombreTema || !nuevoTema.id_medio}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogActions>
          </Dialog>
        </Dialog>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              Planificación de Medios
            </Typography>
            <Typography variant="subtitle1" color="primary">
              {selectedCliente?.nombrecliente} - {selectedCampana?.nombrecampania}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={handleResetSelection}
          >
            Cambiar Selección
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Planes de la Campaña
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon sx={{ color: 'white' }} />}
                    onClick={() => setOpenNuevoPlanModal(true)}
                  >
                    Nuevo Plan
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={diagnosticarDatos}
                    sx={{ ml: 2 }}
                  >
                    🔍 Diagnóstico
                  </Button>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nombre del Plan</TableCell>
                        <TableCell>Campaña</TableCell>
                        <TableCell>Año</TableCell>
                        <TableCell>Mes</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Estado 2</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                        <TableCell align="center">Alternativas</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {planes.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell>{plan.nombre_plan}</TableCell>
                          <TableCell>{selectedCampana?.nombrecampania}</TableCell>
                          <TableCell>{plan.anios?.years}</TableCell>
                          <TableCell>{plan.meses?.nombre}</TableCell>
                          <TableCell>
                            <Box sx={{ 
                              color: plan.estado === 'P' ? 'warning.main' : 'success.main',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}>
                              <Typography variant="body2">
                                {plan.estado === 'P' ? 'Pendiente' : 'Cerrado'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color={
                              plan.estado2 === 'aprobado' ? 'success.main' :
                              plan.estado2 === 'cancelado' ? 'error.main' :
                              'text.secondary'
                            }>
                              {plan.estado2 ? plan.estado2.charAt(0).toUpperCase() + plan.estado2.slice(1) : 'Sin estado'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <IconButton
                                color="primary"
                                onClick={() => handleEditPlan(plan)}
                                size="small"
                                title="Editar plan"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                color="success"
                                onClick={() => handleUpdatePlanStatus(plan.id, 'aprobado')}
                                size="small"
                                title="Aprobar"
                                disabled={plan.estado2 === 'aprobado'}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => handleUpdatePlanStatus(plan.id, 'cancelado')}
                                size="small"
                                title="Cancelar"
                                disabled={plan.estado2 === 'cancelado'}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={() => {
                                console.log('Navegando a alternativas con plan:', plan);
                                // Asegurarse de que el ID existe y es un número
                                const planId = plan?.id;
                                if (!planId) {
                                  console.error('No se encontró el ID del plan');
                                  return;
                                }
                                navigate(`/planificacion/alternativas/${planId}`);
                              }}
                            >
                              Alternativas
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {planes.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            No hay planes disponibles para esta campaña
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

        {/* Modal de Nuevo Plan */}
        <Dialog
        open={openNuevoPlanModal}
        onClose={() => setOpenNuevoPlanModal(false)}
        maxWidth="sm"
        fullWidth
        >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
          <AddIcon />
          Nuevo Plan
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
            label="Nombre del Plan"
            fullWidth
            value={nuevoPlan.nombre_plan}
            onChange={(e) => handleNuevoPlanChange('nombre_plan', e.target.value)}
            InputProps={{
              startAdornment: (
              <InputAdornment position="start">
                <TitleIcon />
              </InputAdornment>
              ),
            }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
            <InputLabel>Año</InputLabel>
            <Select
              value={nuevoPlan.anio}
              onChange={(e) => handleNuevoPlanChange('anio', e.target.value)}
              label="Año"
              startAdornment={
              <InputAdornment position="start">
                <CalendarMonthIcon />
              </InputAdornment>
              }
            >
              {anios.map((anio) => (
              <MenuItem key={anio.id} value={anio.id}>
                {anio.years}
              </MenuItem>
              ))}
            </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
            <InputLabel>Mes</InputLabel>
            <Select
              value={nuevoPlan.mes}
              onChange={(e) => handleNuevoPlanChange('mes', e.target.value)}
              label="Mes"
              startAdornment={
              <InputAdornment position="start">
                <EventNoteIcon />
              </InputAdornment>
              }
            >
              {meses.map((mes) => (
              <MenuItem key={mes.Id} value={mes.Id}>
                {mes.Nombre}
              </MenuItem>
              ))}
            </Select>
            </FormControl>
          </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
          onClick={() => setOpenNuevoPlanModal(false)}
          startIcon={<CancelIcon />}
          >
          Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreatePlan}
            disabled={loading || !nuevoPlan.nombre_plan || !nuevoPlan.anio || !nuevoPlan.mes}
            startIcon={<AddIcon />}
          >
            {loading ? <CircularProgress size={24} /> : 'Crear Plan'}
          </Button>
        </DialogActions>
        </Dialog>

        {/* Modal de Edición de Plan */}
        <Dialog 
        open={openEditPlanModal} 
        onClose={() => setOpenEditPlanModal(false)}
        maxWidth="sm"
        fullWidth
        >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
          <EditIcon />
          Editar Plan
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
            <TextField
              label="Nombre del Plan"
              fullWidth
              value={editingPlan.nombre_plan}
              onChange={handleEditPlanChange('nombre_plan')}
              InputProps={{
              startAdornment: (
              <InputAdornment position="start">
                <TitleIcon />
              </InputAdornment>
              ),
              }}
            />
            </Grid>
            <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Año</InputLabel>
              <Select
              value={editingPlan.anio}
              onChange={handleEditPlanChange('anio')}
              label="Año"
              startAdornment={
              <InputAdornment position="start">
                <CalendarMonthIcon />
              </InputAdornment>
              }
            >
              {anios.map((anio) => (
              <MenuItem key={anio.id} value={anio.id}>
                {anio.years}
              </MenuItem>
              ))}
            </Select>
            </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Mes</InputLabel>
              <Select
              value={editingPlan.mes}
              onChange={handleEditPlanChange('mes')}
              label="Mes"
              startAdornment={
              <InputAdornment position="start">
                <EventNoteIcon />
              </InputAdornment>
              }
            >
              {meses.map((mes) => (
              <MenuItem key={mes.Id} value={mes.Id}>
                {mes.Nombre}
              </MenuItem>
              ))}
            </Select>
            </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
              value={editingPlan.estado}
              onChange={handleEditPlanChange('estado')}
              label="Estado"
              startAdornment={
              <InputAdornment position="start">
                <FlagIcon />
              </InputAdornment>
              }
            >
              <MenuItem value="P">Pendiente</MenuItem>
              <MenuItem value="C">Cerrado</MenuItem>
            </Select>
            </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Estado 2</InputLabel>
              <Select
                value={editingPlan.estado2}
                onChange={handleEditPlanChange('estado2')}
                label="Estado 2"
                startAdornment={
                <InputAdornment position="start">
                  <FlagIcon />
                </InputAdornment>
                }
              >
              <MenuItem value="">Sin estado</MenuItem>
              <MenuItem value="aprobado">Aprobado</MenuItem>
              <MenuItem value="cancelado">Cancelado</MenuItem>
            </Select>
            </FormControl>
            </Grid>
          </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
          onClick={() => setOpenEditPlanModal(false)}
          color="inherit"
          startIcon={<CancelIcon />}
          >
          Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdatePlan}
            disabled={loading}
            startIcon={<CheckCircleIcon />}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
        </Dialog>

        {/* Modal de Nuevo Tema */}
        <Dialog 
          open={openNuevoTemaModal} 
          onClose={handleCloseModals}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Agregar Nuevo Tema</Typography>
              <IconButton onClick={handleCloseModals}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Medio</InputLabel>
                  <Select
                    value={nuevoTema.id_medio || ''}
                    onChange={handleMedioChange}
                    name="id_medio"
                    label="Medio"
                    required
                  >
                    <MenuItem value="">
                      <em>Seleccione un medio</em>
                    </MenuItem>
                    {medios.map((medio) => (
                      <MenuItem key={medio.id} value={medio.id}>
                        {medio.nombre_medio}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre del Tema"
                  name="NombreTema"
                  value={nuevoTema.NombreTema}
                  onChange={handleNuevoTemaChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TopicIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              {visibleFields.duracion && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Duración"
                    name="Duracion"
                    value={nuevoTema.Duracion}
                    onChange={handleNuevoTemaChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TimerIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}
              {visibleFields.color && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Color"
                    name="color"
                    value={nuevoTema.color}
                    onChange={handleNuevoTemaChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ColorLensIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}
              {visibleFields.codigo_megatime && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Código Megatime"
                    name="CodigoMegatime"
                    value={nuevoTema.CodigoMegatime}
                    onChange={handleNuevoTemaChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CodeIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}
              {visibleFields.calidad && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Calidad</InputLabel>
                    <Select
                      value={nuevoTema.id_Calidad || ''}
                      onChange={handleNuevoTemaChange}
                      name="id_Calidad"
                      label="Calidad"
                    >
                      <MenuItem value="">
                        <em>Seleccione una calidad</em>
                      </MenuItem>
                      {calidades.map((calidad) => (
                        <MenuItem key={calidad.id} value={calidad.id}>
                          {calidad.nombrecalidad}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {visibleFields.cooperado && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Cooperado</InputLabel>
                    <Select
                      value={nuevoTema.cooperado}
                      onChange={handleNuevoTemaChange}
                      name="cooperado"
                      label="Cooperado"
                    >
                      <MenuItem value="">No</MenuItem>
                      <MenuItem value="Sí">Sí</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {visibleFields.rubro && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Rubro"
                    name="rubro"
                    value={nuevoTema.rubro}
                    onChange={handleNuevoTemaChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CategoryIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModals}>Cancelar</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGuardarTema}
              disabled={loading || !nuevoTema.NombreTema || !nuevoTema.id_medio}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de Editar Tema */}
        <Dialog 
          open={openEditTemaModal} 
          onClose={handleCloseModals}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Editar Tema
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre del Tema"
                  value={selectedTema?.NombreTema || ''}
                  onChange={(e) => setSelectedTema({ ...selectedTema, NombreTema: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Duración"
                  value={selectedTema?.Duracion || ''}
                  onChange={(e) => setSelectedTema({ ...selectedTema, Duracion: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Color"
                  value={selectedTema?.color || ''}
                  onChange={(e) => setSelectedTema({ ...selectedTema, color: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Código Megatime"
                  value={selectedTema?.CodigoMegatime || ''}
                  onChange={(e) => setSelectedTema({ ...selectedTema, CodigoMegatime: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Rubro"
                  value={selectedTema?.rubro || ''}
                  onChange={(e) => setSelectedTema({ ...selectedTema, rubro: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedTema?.cooperado || false}
                      onChange={(e) => setSelectedTema({ ...selectedTema, cooperado: e.target.checked })}
                    />
                  }
                  label="Cooperado"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModals}>Cancelar</Button>
            <Button variant="contained" color="primary" onClick={() => {
              // Aquí irá la lógica para actualizar el tema
              handleCloseModals();
            }}>
              Guardar Cambios
            </Button>
          </DialogActions>
        </Dialog>

    </Container>
  );
};

export default Planificacion;
