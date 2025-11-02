import React, { useState, useEffect } from 'react';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import './Planificacion.css';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Checkbox, 
  ListItemText, 
  OutlinedInput,
  FormHelperText,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  Autocomplete,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  InputAdornment,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Tooltip
} from '@mui/material';
import ModalEditarTema from '../campanas/ModalEditarTema';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PriceChange as PriceChangeIcon,
  Discount as DiscountIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Description as DescriptionIcon,
  Topic as TopicIcon,
  Radio as RadioIcon,
  Timer as TimerIcon,
  Category as CategoryIcon,
  PlaylistPlay as PlaylistPlayIcon,
  Class as ClassIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
  AddCircle as AddCircleIcon,
  Payment as PaymentIcon,
  ColorLens as ColorLensIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import ModalAgregarContrato from '../contratos/ModalAgregarContrato';
import ModalEditarContrato from '../contratos/ModalEditarContrato';
import ModalAgregarTema from '../campanas/ModalAgregarTema';
import Swal from 'sweetalert2';

const TIPO_ITEMS = [
  'PAUTA LIBRE',
  'AUSPICIO',
  'VPS',
  'CPR',
  'CPM',
  'CPC',
  'BONIF%',
  'CANJE'
];

const Alternativas = () => {
  const [formasDePago, setFormasDePago] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const [autoFillCantidades, setAutoFillCantidades] = useState(false);
  console.log('Componente Alternativas - ID del plan:', id);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [alternativas, setAlternativas] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [soportes, setSoportes] = useState([]);
  const [clasificaciones, setClasificaciones] = useState([]);
  const [temas, setTemas] = useState([]);
  const [programas, setProgramas] = useState([]); 
  const [nextNumeroOrden, setNextNumeroOrden] = useState(1);
  const [planData, setPlanData] = useState(null);
  const [clienteId, setClienteId] = useState(null);
  const [proveedorId, setProveedorId] = useState(null);
  const [campaniaId, setCampaniaId] = useState(null);
  const [planInfo, setPlanInfo] = useState({
    anio: '',
    mes: '',
    campana: '',
    cliente: '',
    producto: ''
  });

  const [nuevaAlternativa, setNuevaAlternativa] = useState({
    nlinea: '',
    numerorden: 1,
    anio: '',
    mes: '',
    id_campania: '',
    num_contrato: '',
    id_soporte: '',
    id_programa: '',
    tipo_item: '',
    id_clasificacion: '',
    detalle: '',
    id_tema: '',
    segundos: '',
    id_medio: '',
    cantidades: [],
    valor_unitario: '',
    descuento_plan: '',
    recargo_plan: '',
    total_bruto: '',
    total_neto: '',
    medio: '',
    bonificacionano: '',
    escala: '',
    formaDePago: '',
    nombreFormaPago: '',
    soporte: '',
    descripcion: '',
    iva: '',
    total_orden: '',
    // Add missing fields that might be causing errors
    color: '',
    codigo_megatime: '',
    calidad: '',
    cooperado: '',
    rubro: ''
  });

  const [visibleFields, setVisibleFields] = useState({
    duracion: false,
    color: false,
    codigo_megatime: false,
    calidad: false,
    cooperado: false,
    rubro: false
  });

  const [editandoAlternativa, setEditandoAlternativa] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [openContratosModal, setOpenContratosModal] = useState(false);
  const [openAddContratoModal, setOpenAddContratoModal] = useState(false);
  const [openEditContratoModal, setOpenEditContratoModal] = useState(false);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
  const [contratosFiltrados, setContratosFiltrados] = useState([]);
  const [loadingContratos, setLoadingContratos] = useState(false);
  const [searchContrato, setSearchContrato] = useState('');
  const [openAddSoporteModal, setOpenAddSoporteModal] = useState(false);
  const [openTemasModal, setOpenTemasModal] = useState(false);
  const [openAddTemaModal, setOpenAddTemaModal] = useState(false);
  const [temaSeleccionado, setTemaSeleccionado] = useState(null);
  const [temasFiltrados, setTemasFiltrados] = useState([]);
  const [loadingTemas, setLoadingTemas] = useState(false);
  const [searchTema, setSearchTema] = useState('');
  const [nuevoSoporte, setNuevoSoporte] = useState({
    nombreidentificador: '',
    bonificacionano: 0,
    escala: 0,
    id_medio: '',
    medios: []
  });
  const [mediosOptions, setMediosOptions] = useState([]);
  const [loadingMedios, setLoadingMedios] = useState(false);
  const [openSoportesModal, setOpenSoportesModal] = useState(false);
  const [selectedSoporte, setSelectedSoporte] = useState(null);
  const [allSoportes, setAllSoportes] = useState([]);
  const [soportesFiltrados, setSoportesFiltrados] = useState([]);
  const [loadingSoportes, setLoadingSoportes] = useState(false);
  const [searchSoporte, setSearchSoporte] = useState('');

  const [openProgramasModal, setOpenProgramasModal] = useState(false);
  const [searchPrograma, setSearchPrograma] = useState('');
  const [loadingProgramas, setLoadingProgramas] = useState(false);
  const [selectedPrograma, setSelectedPrograma] = useState(null);
  const [programasFiltrados, setProgramasFiltrados] = useState([]);

  const [openClasificacionModal, setOpenClasificacionModal] = useState(false);
  const [openAddEditClasificacionModal, setOpenAddEditClasificacionModal] = useState(false);
  const [searchClasificacion, setSearchClasificacion] = useState('');
  const [loadingClasificaciones, setLoadingClasificaciones] = useState(false);
  const [clasificacionesList, setClasificacionesList] = useState([]);
  const [selectedClasificacion, setSelectedClasificacion] = useState(null);
  const [editingClasificacion, setEditingClasificacion] = useState(null);
  const [nuevaClasificacion, setNuevaClasificacion] = useState({
    NombreClasificacion: '',
    IdMedios: '' 
  });

  const [openAddEditProgramaModal, setOpenAddEditProgramaModal] = useState(false);
  const [editingPrograma, setEditingPrograma] = useState(null);
  const [newPrograma, setNewPrograma] = useState({
    descripcion: '',
    hora_inicio: '',
    hora_fin: '',
    cod_prog_megatime: '',
    codigo_programa: '',
    soporte_id: ''
  });
  const [soportesParaPrograma, setSoportesParaPrograma] = useState([]);

  const handleOpenAddContratoModal = () => {
    setOpenAddContratoModal(true);
  };

  const handleCloseAddContratoModal = () => {
    setOpenAddContratoModal(false);
    handleSearchContrato(); // Actualizar la lista después de agregar
  };
  const handleOpenAddSoporteModal = () => {
    // Verificar que contratoSeleccionado exista
    if (!contratoSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Primero debe seleccionar un contrato'
      });
      return;
    }
    
    // Verificar que el proveedor exista en el contrato (considerando ambas estructuras posibles)
    const proveedorId = contratoSeleccionado.proveedor?.id_proveedor || contratoSeleccionado.IdProveedor;
    
    if (!proveedorId) {
      console.log('Contrato sin proveedor válido:', contratoSeleccionado);
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'El contrato seleccionado no tiene un proveedor válido'
      });
      return;
    }
    
    // Si llegamos aquí, el contrato y el proveedor son válidos
    console.log('Abriendo modal de soporte con contrato:', contratoSeleccionado);
    console.log('ID del proveedor identificado:', proveedorId);
    
    // Establecer el ID del proveedor para usarlo en la función handleSaveSoporte
    setProveedorId(proveedorId);
    
    // Inicializar el nuevo soporte con el medio del contrato seleccionado
    const medioId = contratoSeleccionado.medio?.id || contratoSeleccionado.IdMedios;
    
    if (medioId) {
      setNuevoSoporte({
        nombreidentificador: '',
        bonificacionano: 0,
        escala: 0,
        id_medio: medioId,
        medios: [medioId]
      });
    } else {
      setNuevoSoporte({
        nombreidentificador: '',
        bonificacionano: 0,
        escala: 0,
        id_medio: '',
        medios: []
      });
    }
    
    // Cargar los medios disponibles
    fetchMedios();
    setOpenAddSoporteModal(true);
  };
  // Función para cerrar el modal de agregar soporte
  const handleCloseAddSoporteModal = () => {
    setOpenAddSoporteModal(false);
    setNuevoSoporte({
      nombreidentificador: '',
      bonificacionano: 0,
      escala: 0,
      id_medio: '',
      medios: []
    });
  };

  // Función para cargar los medios disponibles
  const fetchMedios = async () => {
    setLoadingMedios(true);
    try {
      const { data, error } = await supabase
        .from('medios')
        .select('id, nombredelmedio')
        .order('nombredelmedio', { ascending: true });

      if (error) throw error;
      setMediosOptions(data || []);
    } catch (error) {
      console.error('Error al cargar medios:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar los medios'
      });
    } finally {
      setLoadingMedios(false);
    }
  };

  // Función para guardar el nuevo soporte
  const handleSaveSoporte = async () => {
    console.log('handleSaveSoporte: INICIO - Guardando nuevo soporte');
    console.log('handleSaveSoporte: Datos actuales:', {
      nuevoSoporte,
      contratoSeleccionado
    });

    if (!nuevoSoporte.nombreidentificador) {
      console.log('handleSaveSoporte: Validación fallida - nombreidentificador vacío');
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'El nombre del soporte es obligatorio'
      });
      return;
    }

    // Obtener el ID del proveedor del contrato seleccionado
    const proveedorId = contratoSeleccionado.proveedor?.id_proveedor || contratoSeleccionado.IdProveedor;
    
    if (!proveedorId) {
      console.error('handleSaveSoporte: No se pudo identificar el proveedor del contrato');
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'No se pudo identificar el proveedor del contrato'
      });
      return;
    }

    console.log('handleSaveSoporte: Proveedor ID identificado:', proveedorId);

    // Verificar los medios
    let mediosToInsert = [];
    if (contratoSeleccionado && contratoSeleccionado.medio && contratoSeleccionado.medio.id) {
      // Si hay un medio en el contrato con estructura anidada
      mediosToInsert = [contratoSeleccionado.medio.id];
    } else if (contratoSeleccionado && contratoSeleccionado.IdMedios) {
      // Si hay un medio en el contrato con estructura plana
      mediosToInsert = [contratoSeleccionado.IdMedios];
    } else if (nuevoSoporte.medios && nuevoSoporte.medios.length > 0) {
      // Si no hay medio en el contrato pero hay medios seleccionados
      mediosToInsert = nuevoSoporte.medios;
    } else {
      console.log('handleSaveSoporte: Validación fallida - No hay medios seleccionados');
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Debe seleccionar al menos un medio'
      });
      return;
    }

    console.log('handleSaveSoporte: Medios a insertar:', mediosToInsert);

    try {
      // Sistema de reintentos para obtener el máximo ID
      const tablasSoportesIntentos = ['soportes', 'soporte'];
      let maxId = 0;
      let maxIdError = null;

      for (const nombreTabla of tablasSoportesIntentos) {
        try {
          console.log(`handleSaveSoporte - Intentando obtener máximo ID de tabla "${nombreTabla}"`);
          
          const { data, error } = await supabase
            .from(nombreTabla)
            .select('id_soporte')
            .order('id_soporte', { ascending: false })
            .limit(1);

          if (error) {
            console.error(`handleSaveSoporte - Error al obtener máximo ID de ${nombreTabla}:`, error);
            maxIdError = error;
            continue;
          }

          maxId = data && data.length > 0 ? data[0].id_soporte : 0;
          console.log(`handleSaveSoporte - Máximo ID encontrado en ${nombreTabla}:`, maxId);
          break;

        } catch (error) {
          console.error(`handleSaveSoporte - Error catch al obtener máximo ID de ${nombreTabla}:`, error);
          maxIdError = error;
        }
      }

      const nuevoId = maxId + 1;
      console.log('handleSaveSoporte: Nuevo id_soporte a usar:', nuevoId);

      // Sistema de reintentos para insertar el soporte
      let nuevoSoporteId = null;
      let soporteError = null;

      for (const nombreTabla of tablasSoportesIntentos) {
        try {
          console.log(`handleSaveSoporte - Intentando insertar en tabla "${nombreTabla}"`);
          
          const soporteData = {
            id_soporte: nuevoId,
            nombreidentificador: nuevoSoporte.nombreidentificador,
            bonificacionano: nuevoSoporte.bonificacionano || 0,
            escala: nuevoSoporte.escala || 0
          };
          
          const { data, error } = await supabase
            .from(nombreTabla)
            .insert([soporteData])
            .select();

          if (error) {
            console.error(`handleSaveSoporte - Error al insertar en ${nombreTabla}:`, error);
            soporteError = error;
            continue;
          }

          if (!data || data.length === 0) {
            console.error(`handleSaveSoporte - No se obtuvo respuesta al insertar en ${nombreTabla}`);
            soporteError = new Error('No se pudo obtener el ID del soporte insertado');
            continue;
          }

          nuevoSoporteId = data[0].id_soporte;
          console.log(`handleSaveSoporte - Éxito al insertar en ${nombreTabla}, ID:`, nuevoSoporteId);
          break;

        } catch (error) {
          console.error(`handleSaveSoporte - Error catch al insertar en ${nombreTabla}:`, error);
          soporteError = error;
        }
      }

      if (!nuevoSoporteId) {
        throw soporteError || new Error('No se pudo insertar el soporte');
      }

      // Sistema de reintentos para insertar relaciones soporte-medio
      const tablasRelacionIntentos = ['soporte_medios', 'soporte_medio'];
      let relacionError = null;

      for (const nombreTabla of tablasRelacionIntentos) {
        try {
          console.log(`handleSaveSoporte - Intentando insertar relaciones en "${nombreTabla}"`);
          
          const soporteMediosInserts = mediosToInsert.map(medioId => ({
            id_soporte: nuevoSoporteId,
            id_medio: medioId
          }));

          const { error } = await supabase
            .from(nombreTabla)
            .insert(soporteMediosInserts);

          if (error) {
            console.error(`handleSaveSoporte - Error al insertar relaciones en ${nombreTabla}:`, error);
            relacionError = error;
            continue;
          }

          console.log(`handleSaveSoporte - Éxito al insertar relaciones en ${nombreTabla}`);
          relacionError = null;
          break;

        } catch (error) {
          console.error(`handleSaveSoporte - Error catch al insertar relaciones en ${nombreTabla}:`, error);
          relacionError = error;
        }
      }

      if (relacionError) {
        throw relacionError;
      }

      // Sistema de reintentos para insertar relación proveedor-soporte
      const tablasProveedorIntentos = ['proveedor_soporte', 'proveedor_soportes'];
      let proveedorError = null;

      for (const nombreTabla of tablasProveedorIntentos) {
        try {
          console.log(`handleSaveSoporte - Intentando insertar relación proveedor en "${nombreTabla}"`);
          
          const proveedorSoporteData = {
            id_proveedor: proveedorId,
            id_soporte: nuevoSoporteId
          };
          
          const { error } = await supabase
            .from(nombreTabla)
            .insert([proveedorSoporteData]);

          if (error) {
            console.error(`handleSaveSoporte - Error al insertar relación proveedor en ${nombreTabla}:`, error);
            proveedorError = error;
            continue;
          }

          console.log(`handleSaveSoporte - Éxito al insertar relación proveedor en ${nombreTabla}`);
          proveedorError = null;
          break;

        } catch (error) {
          console.error(`handleSaveSoporte - Error catch al insertar relación proveedor en ${nombreTabla}:`, error);
          proveedorError = error;
        }
      }

      if (proveedorError) {
        throw proveedorError;
      }

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Soporte agregado correctamente'
      });

      // Actualizar la lista de soportes
      await handleSearchSoporte(''); // Recargar soportes
      
      handleCloseAddSoporteModal();
    } catch (error) {
      console.error('handleSaveSoporte: Error general:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error al guardar el soporte: ${error.message || JSON.stringify(error)}`
      });
    }
    console.log('handleSaveSoporte: FIN');
  };
  const handleCloseModal = () => {
    setOpenModal(false);
    setModoEdicion(false);
    setEditandoAlternativa(null);
    // Reset nueva alternativa with all required fields including empty cantidades array
    setNuevaAlternativa({
      nlinea: '',
      numerorden: nextNumeroOrden,
      anio: planData?.anio || '',
      mes: planData?.mes || '',
      id_campania: planData?.id_campania || '',
      num_contrato: '',
      id_soporte: '',
      id_programa: '',
      tipo_item: '',
      id_clasificacion: '',
      detalle: '',
      id_tema: '',
      segundos: '',
      id_medio: '',
      cantidades: [], // Ensure this is always initialized as an empty array
      valor_unitario: '',
      descuento_plan: '',
      recargo_plan: '',
      total_bruto: '',
      total_neto: '',
      medio: '',
      bonificacionano: '',
      escala: '',
      formaDePago: '',
      nombreFormaPago: '',
      soporte: '',
      descripcion: '',
      iva: '',
      total_orden: '',
      // Add missing fields that might be causing errors
      color: '',
      codigo_megatime: '',
      calidad: '',
      cooperado: '',
      rubro: ''
    });
    // Reset selected items
    setContratoSeleccionado(null);
    setSelectedSoporte(null);
    setSelectedPrograma(null);
    setTemaSeleccionado(null);
    setSelectedClasificacion(null);
  };

  const handleOpenEditContratoModal = () => {
    if (!contratoSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Primero debe seleccionar un contrato'
      });
      return;
    }
    console.log('Abriendo modal con contrato:', contratoSeleccionado); // Para debugging
    setOpenEditContratoModal(true);
  };

  const handleCloseEditContratoModal = () => {
    setOpenEditContratoModal(false);
    handleSearchContrato(); // Actualizar la lista después de editar
  };
  const [validationErrors, setValidationErrors] = useState({
    contrato: false,
    soporte: false
  });

  useEffect(() => {
    const fetchContratos = async () => {
      if (!clienteId) {
        console.log('clienteId no está disponible aún');
        return;
      }

      console.log('Buscando contratos para clienteId:', clienteId);
      
      // Sistema de reintentos para diferentes nombres de tablas/campos
      const intentos = [
        {
          tabla: 'contratos',
          campoCliente: 'idcliente',
          campoId: 'id',
          campoNombre: 'nombrecontrato',
          campoEstado: 'Estado',
          relaciones: {
            cliente: 'IdCliente',
            proveedor: 'IdProveedor',
            medio: 'IdMedios',
            formaPago: 'id_FormadePago'
          }
        },
        {
          tabla: 'contratos',
          campoCliente: 'id_cliente',
          campoId: 'id',
          campoNombre: 'nombrecontrato',
          campoEstado: 'Estado',
          relaciones: {
            cliente: 'IdCliente',
            proveedor: 'IdProveedor',
            medio: 'IdMedios',
            formaPago: 'id_FormadePago'
          }
        },
        {
          tabla: 'contratos',
          campoCliente: 'idcliente',
          campoId: 'id',
          campoNombre: 'nombre_contrato',
          campoEstado: 'estado',
          relaciones: {
            cliente: 'IdCliente',
            proveedor: 'IdProveedor',
            medio: 'IdMedios',
            formaPago: 'id_FormadePago'
          }
        },
        {
          tabla: 'contratos',
          campoCliente: 'id_cliente',
          campoId: 'id',
          campoNombre: 'nombre_contrato',
          campoEstado: 'estado',
          relaciones: {
            cliente: 'IdCliente',
            proveedor: 'IdProveedor',
            medio: 'IdMedios',
            formaPago: 'id_FormadePago'
          }
        }
      ];

      let datosEncontrados = null;
      let ultimoError = null;

      for (let i = 0; i < intentos.length; i++) {
        const intento = intentos[i];
        console.log(`Intento ${i + 1}: Usando ${intento.tabla}.${intento.campoCliente} y campo nombre ${intento.campoNombre}`);
        
        try {
          const { data, error } = await supabase
            .from(intento.tabla)
            .select(`
              ${intento.campoId},
              ${intento.campoNombre},
              ${intento.campoEstado},
              cliente:${intento.relaciones.cliente} (id_cliente, nombrecliente, nombre_cliente),
              proveedor:${intento.relaciones.proveedor} (id_proveedor, nombreProveedor, nombre_proveedor),
              medio:${intento.relaciones.medio} (id, NombredelMedio, nombredelmedio),
              formaPago:${intento.relaciones.formaPago}(
                id,
                nombreformadepago
              )
            `)
            .eq(intento.campoCliente, clienteId);

          if (error) {
            console.error(`Error al obtener contratos con ${intento.campoCliente}:`, error);
            ultimoError = error;
            continue;
          }

          console.log(`Contratos obtenidos con intento ${i + 1}:`, data);
          
          // Transformar los datos para tener una estructura consistente
          const contratosTransformados = (data || []).map(contrato => ({
            id: contrato[intento.campoId],
            nombrecontrato: contrato[intento.campoNombre],
            Estado: contrato[intento.campoEstado],
            cliente: {
              id_cliente: contrato.cliente?.id_cliente,
              nombrecliente: contrato.cliente?.nombrecliente || contrato.cliente?.nombre_cliente
            },
            proveedor: {
              id_proveedor: contrato.proveedor?.id_proveedor,
              nombreProveedor: contrato.proveedor?.nombreProveedor || contrato.proveedor?.nombre_proveedor
            },
            medio: {
              id: contrato.medio?.id,
              NombredelMedio: contrato.medio?.NombredelMedio || contrato.medio?.nombredelmedio,
              nombredelmedio: contrato.medio?.nombredelmedio || contrato.medio?.NombredelMedio
            },
            formaPago: contrato.formaPago,
            IdCliente: contrato.cliente?.id_cliente,
            IdProveedor: contrato.proveedor?.id_proveedor,
            IdMedios: contrato.medio?.id
          }));

          setContratos(contratosTransformados);
          datosEncontrados = contratosTransformados;
          break; // Salir del bucle si tenemos éxito

        } catch (error) {
          console.error(`Error en intento ${i + 1}:`, error);
          ultimoError = error;
        }
      }

      if (!datosEncontrados) {
        console.error('No se pudieron cargar los contratos después de todos los intentos');
        console.log('Último error:', ultimoError);
        // Mostrar mensaje informativo
        Swal.fire({
          icon: 'warning',
          title: 'No se encontraron contratos',
          text: `No se pudieron cargar los contratos para este cliente. Puede intentar agregar un nuevo contrato.`
        });
        setContratos([]);
      }
    };

    fetchContratos();
  }, [clienteId]);
  const fetchClasificacionesByContrato = async (contratoId) => {
    try {
      setLoadingClasificaciones(true);
      
      // Primero obtenemos el contrato para saber su IdMedios
      const { data: contratoData, error: contratoError } = await supabase
        .from('contratos')
        .select('idmedios')
        .eq('id', contratoId)
        .single();
      
      if (contratoError) throw contratoError;
      
      if (!contratoData || !(contratoData.IdMedios || contratoData.idmedios)) {
        console.log('El contrato no tiene un medio asociado');
        setClasificacionesList([]);
        return;
      }
      
      // Ahora obtenemos las clasificaciones que coincidan con el medio del contrato
      const { data, error } = await supabase
        .from('clasificacion')
        .select('*')
        .eq('idmedios', contratoData.IdMedios || contratoData.idmedios);
      
      if (error) throw error;
      
      console.log('Clasificaciones filtradas por medio:', data);
      setClasificacionesList(data || []);
    } catch (error) {
      console.error('Error al cargar clasificaciones:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las clasificaciones'
      });
      setClasificacionesList([]);
    } finally {
      setLoadingClasificaciones(false);
    }
  };
  useEffect(() => {
    const fetchSoportes = async () => {
      if (!proveedorId) {
        setSoportes([]);
        return;
      }

      try {
        // Obtener los soportes del proveedor con sus medios asociados
        const { data: proveedorSoportes, error: soportesError } = await supabase
          .from('proveedor_soporte')
          .select(`
            id_soporte,
            Soportes!inner (
              id_soporte,
              nombreidentificador,
              bonificacionano,
              escala,
              soporte_medios!inner (
                Medios!inner (
                  id,
                  nombredelmedio
                )
              )
            )
          `)
          .eq('id_proveedor', proveedorId);

        if (soportesError) throw soportesError;

        // Transformar los datos para tener la estructura correcta
        const soportesFiltrados = proveedorSoportes.map(item => {
          // Obtener los nombres de los medios asociados al soporte
          const medios = item.Soportes.soporte_medios
            ? item.Soportes.soporte_medios
                .map(sm => sm.Medios.nombredelmedio)
                .join(', ')
            : '';
          
          return {
            id_soporte: item.Soportes.id_soporte,
            nombreidentificador: item.Soportes.nombreidentificador,
            Medios: medios,
            bonificacionano: item.Soportes.bonificacionano,
            escala: item.Soportes.escala
          };
        });

        console.log('Soportes filtrados por proveedor:', soportesFiltrados);
        setSoportes(soportesFiltrados);
      } catch (error) {
        console.error('Error al obtener soportes:', error);
      }
    };

    fetchSoportes();
  }, [proveedorId]);

  useEffect(() => {
    const fetchTemas = async () => {
      if (!campaniaId) {
        console.log('fetchTemas: No hay campaniaId disponible');
        setTemas([]);
        return;
      }

      console.log('fetchTemas: Buscando temas para campaña:', campaniaId);
      
      // Sistema de reintentos para diferentes nombres de tablas/campos
      const intentos = [
        {
          tablaRelacion: 'campania_temas',
          campoRelacion: 'id_temas',
          tablaTemas: 'temas',
          campoId: 'id_tema',
          campoNombre: 'NombreTema',
          campoDuracion: 'Duracion'
        },
        {
          tablaRelacion: 'campania_temas',
          campoRelacion: 'id_temas',
          tablaTemas: 'temas',
          campoId: 'id_tema',
          campoNombre: 'nombre_tema',
          campoDuracion: 'duracion'
        },
        {
          tablaRelacion: 'campania_temas',
          campoRelacion: 'id_tema',
          tablaTemas: 'temas',
          campoId: 'id_tema',
          campoNombre: 'NombreTema',
          campoDuracion: 'Duracion'
        },
        {
          tablaRelacion: 'campania_temas',
          campoRelacion: 'id_tema',
          tablaTemas: 'temas',
          campoId: 'id_tema',
          campoNombre: 'nombre_tema',
          campoDuracion: 'duracion'
        }
      ];

      let datosEncontrados = null;
      let ultimoError = null;

      for (let i = 0; i < intentos.length; i++) {
        const intento = intentos[i];
        console.log(`fetchTemas - Intento ${i + 1}: Usando ${intento.tablaRelacion}.${intento.campoRelacion} y ${intento.tablaTemas}.${intento.campoId}`);
        
        try {
          // Primero obtener las relaciones campaña-temas
          console.log(`fetchTemas - Intento ${i + 1}: Consultando relaciones en ${intento.tablaRelacion} para campania ${campaniaId}`);
          const { data: campaniaTemas, error: campaniaError } = await supabase
            .from(intento.tablaRelacion)
            .select(intento.campoRelacion)
            .eq('id_campania', campaniaId);

          if (campaniaError) {
            console.error(`fetchTemas - Error al obtener ${intento.tablaRelacion}:`, campaniaError);
            ultimoError = campaniaError;
            continue;
          }

          console.log(`fetchTemas - Intento ${i + 1}: Relaciones encontradas:`, campaniaTemas);

          if (!campaniaTemas || campaniaTemas.length === 0) {
            console.log(`fetchTemas - Intento ${i + 1}: No hay temas para esta campaña en ${intento.tablaRelacion}`);
            // No retornar aquí, intentar con el siguiente intento
            continue;
          }

          // Extraer los IDs de temas
          const temaIds = campaniaTemas.map(item => item[intento.campoRelacion]).filter(id => id != null);
          console.log(`fetchTemas - Intento ${i + 1}: IDs de temas extraídos:`, temaIds);

          if (temaIds.length === 0) {
            console.log(`fetchTemas - Intento ${i + 1}: No se encontraron IDs válidos de temas`);
            continue;
          }

          // Obtener los detalles de los temas
          console.log(`fetchTemas - Intento ${i + 1}: Consultando detalles de temas en ${intento.tablaTemas}`);
          const { data: temasData, error: temasError } = await supabase
            .from(intento.tablaTemas)
            .select(`
              ${intento.campoId},
              ${intento.campoNombre},
              ${intento.campoDuracion},
              id_medio
            `)
            .in(intento.campoId, temaIds);

          if (temasError) {
            console.error(`fetchTemas - Error al obtener temas:`, temasError);
            ultimoError = temasError;
            continue;
          }

          console.log(`fetchTemas - Intento ${i + 1}: Datos de temas obtenidos:`, temasData);

          // Obtener información de medios si es necesario
          const mediosIds = temasData.map(tema => tema.id_medio).filter(id => id != null);
          let mediosData = [];
          
          if (mediosIds.length > 0) {
            console.log(`fetchTemas - Intento ${i + 1}: Consultando medios para IDs:`, mediosIds);
            const { data: medios, error: mediosError } = await supabase
              .from('medios')
              .select('id, nombredelmedio')
              .in('id', mediosIds);
            
            if (!mediosError) {
              mediosData = medios || [];
              console.log(`fetchTemas - Intento ${i + 1}: Medios obtenidos:`, mediosData);
            } else {
              console.error(`fetchTemas - Error al obtener medios:`, mediosError);
            }
          }

          // Transformar los datos para tener la estructura correcta
          const temasFiltrados = temasData.map(tema => {
            const medio = mediosData.find(m => m.id === tema.id_medio);
            return {
              id_tema: tema[intento.campoId],
              NombreTema: tema[intento.campoNombre],
              segundos: tema[intento.campoDuracion],
              nombreMedio: medio?.nombredelmedio || '',
              id_medio: tema.id_medio
            };
          });

          console.log(`fetchTemas - Intento ${i + 1}: Temas transformados:`, temasFiltrados);
          setTemas(temasFiltrados);
          datosEncontrados = temasFiltrados;
          break; // Salir del bucle si tenemos éxito

        } catch (error) {
          console.error(`fetchTemas - Error en intento ${i + 1}:`, error);
          ultimoError = error;
        }
      }

      if (!datosEncontrados) {
        console.error('fetchTemas: No se pudieron cargar los temas después de todos los intentos');
        console.log('fetchTemas: Último error:', ultimoError);
        console.log('fetchTemas: campaniaId utilizado:', campaniaId);
        
        // Intentar consulta directa como último recurso
        try {
          console.log('fetchTemas: Intentando consulta directa a tabla temas');
          const { data: temasDirectos, error: errorDirecto } = await supabase
            .from('temas')
            .select('*')
            .limit(5);
          
          if (!errorDirecto && temasDirectos) {
            console.log('fetchTemas: Temas encontrados en consulta directa:', temasDirectos);
            // Mostrar los temas disponibles sin filtrar por campaña
            const temasFormateados = temasDirectos.map(tema => ({
              id_tema: tema.id_tema || tema.id,
              NombreTema: tema.NombreTema || tema.nombre_tema || `Tema ${tema.id_tema || tema.id}`,
              segundos: tema.Duracion || tema.duracion || 0,
              nombreMedio: 'Sin medio',
              id_medio: tema.id_medio
            }));
            setTemas(temasFormateados);
            return;
          }
        } catch (errorDirecto) {
          console.error('fetchTemas: Error en consulta directa:', errorDirecto);
        }
        
        // Mostrar mensaje informativo en lugar de error
        Swal.fire({
          icon: 'warning',
          title: 'No se encontraron temas',
          text: `No se pudieron cargar los temas para esta campaña. Puede continuar sin seleccionar un tema.`
        });
        setTemas([]);
      }
    };

    fetchTemas();
  }, [campaniaId]);

  useEffect(() => {
    const fetchProgramas = async () => {
      if (!nuevaAlternativa.id_soporte) {
        setProgramasFiltrados([]);
        return;
      }

      try {
        console.log('Buscando programas para soporte:', nuevaAlternativa.id_soporte);
        
        const { data, error } = await supabase
          .from('programas')
          .select('*')
          .eq('soporte_id', nuevaAlternativa.id_soporte)
          .eq('estado', true)  // Solo programas activos
          .ilike('descripcion', `%${searchPrograma}%`)
          .order('descripcion', { ascending: true });

        if (error) throw error;

        console.log('Programas filtrados por soporte:', data);
        setProgramasFiltrados(data || []);
      } catch (error) {
        console.error('Error al obtener programas:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar los programas'
        });
      }
    };

    fetchProgramas();
  }, [nuevaAlternativa.id_soporte, searchPrograma]);

  useEffect(() => {
    const fetchFormasDePago = async () => {
      try {
        const { data, error } = await supabase
          .from('formadepago')
          .select('id, nombreformadepago');

        if (error) throw error;
        setFormasDePago(data || []);
      } catch (error) {
        console.error('Error al obtener formas de pago:', error);
      }
    };

    fetchFormasDePago();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      console.log('loadData: INICIO - Cargando datos del plan');
      console.log('loadData: Plan ID:', id);

      if (!id) {
        console.error('loadData: No se encontró el ID del plan');
        setError('No se encontró el ID del plan');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        // Sistema de reintentos para obtener datos del plan
        const tablasPlanIntentos = ['plan', 'planes'];
        let plan = null;
        let planError = null;

        for (const nombreTabla of tablasPlanIntentos) {
          try {
            console.log(`loadData - Intentando obtener plan de tabla "${nombreTabla}"`);
            
            const { data, error } = await supabase
              .from(nombreTabla)
              .select('*')
              .eq('id', id)
              .single();

            if (error) {
              console.error(`loadData - Error al obtener plan de ${nombreTabla}:`, error);
              planError = error;
              continue;
            }

            plan = data;
            console.log(`loadData - Plan obtenido de ${nombreTabla}:`, plan);
            break;

          } catch (error) {
            console.error(`loadData - Error catch al obtener plan de ${nombreTabla}:`, error);
            planError = error;
          }
        }

        if (!plan) {
          throw planError || new Error('No se pudo obtener el plan');
        }

        console.log('loadData: Plan obtenido:', plan);
        console.log('loadData: ID de campaña del plan:', plan.id_campania);
        console.log('loadData: ID de cliente del plan:', plan.id_cliente);
        console.log('loadData: ¿Tiene id_campania?', !!plan.id_campania);
        console.log('loadData: ¿Tiene id_cliente?', !!plan.id_cliente);
        
        // Obtener información relacionada por separado
        let anioData = null;
        let mesData = null;
        let campaniaData = null;
        let clienteData = null;
        let productoData = null;

        // Obtener año
        if (plan.anio) {
          console.log('loadData: Buscando año con ID:', plan.anio);
          const { data, error: anioError } = await supabase
            .from('anios')
            .select('*')
            .eq('id', plan.anio)
            .single();
          console.log('loadData: Resultado de año:', { data, error: anioError });
          if (!anioError && data) anioData = data;
        }

        // Obtener mes
        if (plan.mes) {
          console.log('loadData: Buscando mes con ID:', plan.mes);
          const { data, error: mesError } = await supabase
            .from('meses')
            .select('*')
            .eq('id', plan.mes)
            .single();
          console.log('loadData: Resultado de mes:', { data, error: mesError });
          if (!mesError && data) mesData = data;
        }

        // OBTENER CLIENTE DIRECTAMENTE DESDE EL PLAN (método principal)
        const planClienteId = plan.id_cliente;
        if (planClienteId) {
          console.log('loadData: Buscando cliente directamente del plan con ID:', planClienteId);
          
          const tablasClienteIntentos = ['Clientes', 'clientes', 'cliente'];
          let clienteEncontrado = null;
          
          for (const nombreTabla of tablasClienteIntentos) {
            try {
              console.log(`loadData - Intentando obtener cliente de tabla "${nombreTabla}"`);
              
              const { data: cliente, error: clienteError } = await supabase
                .from(nombreTabla)
                .select('id_cliente, nombreCliente, nombrecliente, nombre_cliente')
                .eq('id_cliente', planClienteId)
                .single();
              
              if (!clienteError && cliente) {
                console.log(`loadData - Cliente encontrado en ${nombreTabla}:`, cliente);
                clienteEncontrado = cliente;
                break;
              } else {
                console.log(`loadData - Error en ${nombreTabla}:`, clienteError);
              }
            } catch (error) {
              console.error(`loadData - Error catch en ${nombreTabla}:`, error);
            }
          }
          
          if (clienteEncontrado) {
            clienteData = clienteEncontrado;
          } else {
            console.error('loadData: No se pudo encontrar el cliente directamente del plan');
          }
        }

        // Obtener campaña (si existe)
        if (plan.id_campania) {
          console.log('loadData: Buscando campaña con ID:', plan.id_campania);
          
          // Intentar con diferentes nombres de tabla y campos
          let data = null;
          let campaniaError = null;
          
          // Primer intento: campania con minúscula
          const result1 = await supabase
            .from('campania')
            .select('*')
            .eq('id_campania', plan.id_campania)
            .single();
          
          console.log('loadData: Intento 1 - campania (minúscula, todos los campos):', { data: result1.data, error: result1.error });
          
          if (!result1.error && result1.data) {
            data = result1.data;
          } else {
            // Segundo intento: intentar con diferentes nombres de campos
            const result2 = await supabase
              .from('campania')
              .select('id_campania, nombre_campania, id_cliente, id_producto')
              .eq('id_campania', plan.id_campania)
              .single();
            
            console.log('loadData: Intento 2 - campania (campos en minúscula):', { data: result2.data, error: result2.error });
            
            if (!result2.error && result2.data) {
              data = result2.data;
            } else {
              campaniaError = result2.error;
            }
          }
          
          if (data && !campaniaError) {
            campaniaData = data;
            
            // Si no encontramos cliente por el plan, intentar por la campaña
            if (!clienteData) {
              const campaniaClienteId = campaniaData.id_Cliente || campaniaData.id_cliente;
              if (campaniaClienteId) {
                console.log('loadData: Buscando cliente desde campaña con ID:', campaniaClienteId);
                
                const tablasClienteIntentos = ['Clientes', 'clientes', 'cliente'];
                let clienteEncontrado = null;
                
                for (const nombreTabla of tablasClienteIntentos) {
                  try {
                    console.log(`loadData - Intentando obtener cliente de campaña desde tabla "${nombreTabla}"`);
                    
                    const { data: cliente, error: clienteError } = await supabase
                      .from(nombreTabla)
                      .select('id_cliente, nombreCliente, nombrecliente, nombre_cliente')
                      .eq('id_cliente', campaniaClienteId)
                      .single();
                    
                    if (!clienteError && cliente) {
                      console.log(`loadData - Cliente de campaña encontrado en ${nombreTabla}:`, cliente);
                      clienteEncontrado = cliente;
                      break;
                    } else {
                      console.log(`loadData - Error en cliente de campaña ${nombreTabla}:`, clienteError);
                    }
                  } catch (error) {
                    console.error(`loadData - Error catch en cliente de campaña ${nombreTabla}:`, error);
                  }
                }
                
                if (clienteEncontrado) {
                  clienteData = clienteEncontrado;
                }
              }
            }

            // Obtener producto
            if (campaniaData?.id_producto) {
              console.log('loadData: Buscando producto con ID:', campaniaData.id_producto);
              const { data: producto, error: productoError } = await supabase
                .from('productos')
                .select('id, nombredelproducto')
                .eq('id', campaniaData.id_producto)
                .single();
              
              console.log('loadData: Resultado de producto:', { data: producto, error: productoError });
              
              if (!productoError && producto) {
                productoData = producto;
              } else {
                console.error('loadData: Error al obtener producto:', productoError);
              }
            }
          }
        }

        // Construir el objeto del plan con las relaciones
        const planCompleto = {
          ...plan,
          Anios: anioData,
          Meses: mesData,
          Campania: campaniaData ? {
            ...campaniaData,
            Clientes: clienteData,
            Productos: productoData
          } : null
        };

        setPlanData(planCompleto);
        
        // Guardar los IDs necesarios - IMPORTANTE: Verificar que no sean null
        const clienteIdFinal = clienteData?.id_cliente;
        const campaniaIdFinal = campaniaData?.id_campania;
        
        console.log('loadData: IDs a guardar:', {
          clienteId: clienteIdFinal,
          campaniaId: campaniaIdFinal,
          fuenteCliente: clienteIdFinal ? (planClienteId ? 'directo del plan' : 'desde campaña') : 'no encontrado'
        });
        
        setClienteId(clienteIdFinal);
        setCampaniaId(campaniaIdFinal);

        const planInfoData = {
          anio: anioData?.years || plan.anio || '',
          mes: mesData?.Nombre || mesData?.nombre || plan.mes || '',
          campana: campaniaData?.NombreCampania || campaniaData?.nombre_campania || campaniaData?.nombreCampania || `Campaña ID: ${plan.id_campania}`,
          cliente: clienteData?.nombreCliente || clienteData?.nombrecliente || clienteData?.nombre_cliente || `Cliente ID: ${clienteIdFinal || 'no disponible'}`,
          producto: productoData?.NombreDelProducto || productoData?.nombredelproducto || productoData?.nombre_producto || 'Producto no especificado'
        };
        
        console.log('loadData: Datos del plan a mostrar:', planInfoData);
        console.log('loadData: Datos completos:', {
          plan,
          anioData,
          mesData,
          campaniaData,
          clienteData,
          productoData
        });
        
        setPlanInfo(planInfoData);

        setNuevaAlternativa(prev => ({
          ...prev,
          anio: plan.anio,
          mes: plan.mes,
          id_campania: plan.id_campania
        }));

        await Promise.all([
          fetchAlternativas(),
          fetchDependencies()
        ]);

      } catch (error) {
        console.error('loadData: Error al cargar los datos:', error);
        setError(error.message);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudo cargar la información del plan'
        });
      } finally {
        setLoading(false);
      }
      console.log('loadData: FIN');
    };

    loadData();
  }, [id]);

  const fetchAlternativas = async () => {
    try {
      // Primero obtenemos las relaciones de plan_alternativas
      const { data: planAlternativas, error: planAltError } = await supabase
        .from('plan_alternativas')
        .select('id_alternativa')
        .eq('id_plan', id);

      if (planAltError) {
        console.error('Error al obtener plan_alternativas:', planAltError);
        throw planAltError;
      }

      // Si no hay alternativas, establecemos un array vacío y salimos
      if (!planAlternativas || planAlternativas.length === 0) {
        console.log('No hay alternativas para este plan');
        setAlternativas([]);
        return;
      }

      // Obtenemos los IDs de las alternativas (asegurándonos de que no sean null)
      const alternativaIds = planAlternativas
        .map(pa => pa.id_alternativa)
        .filter(id => id != null);

      console.log('IDs de alternativas encontrados:', alternativaIds);

      // Si no hay IDs válidos después del filtrado, salimos
      if (alternativaIds.length === 0) {
        setAlternativas([]);
        return;
      }

      // Obtener alternativas sin relaciones complejas
      const { data: alternativasData, error } = await supabase
        .from('alternativa')
        .select('*')
        .in('id', alternativaIds)
        .order('numerorden', { ascending: true });

      if (error) {
        console.error('Error al obtener alternativas:', error);
        throw error;
      }

      // Obtener información relacionada por separado
      const alternativasConRelaciones = await Promise.all(
        alternativasData.map(async (alternativa) => {
          let anioData = null;
          let mesData = null;
          let contratoData = null;
          let soporteData = null;
          let clasificacionData = null;
          let temaData = null;
          let medioData = null;

          // Obtener año
          if (alternativa.anio) {
            const { data } = await supabase
              .from('anios')
              .select('id, years')
              .eq('id', alternativa.anio)
              .single();
            anioData = data;
          }

          // Obtener mes
          if (alternativa.mes) {
            const { data } = await supabase
              .from('meses')
              .select('Id, Nombre')
              .eq('Id', alternativa.mes)
              .single();
            mesData = data;
          }

          // Obtener contrato
          if (alternativa.num_contrato) {
            const { data } = await supabase
              .from('contratos')
              .select('id, nombrecontrato')
              .eq('id', alternativa.num_contrato)
              .single();
            contratoData = data;
          }

          // Obtener soporte
          if (alternativa.id_soporte) {
            const { data } = await supabase
              .from('soportes')
              .select('id_soporte, nombreidentificador')
              .eq('id_soporte', alternativa.id_soporte)
              .single();
            soporteData = data;
          }

          // Obtener clasificación
          if (alternativa.id_clasificacion) {
            const { data } = await supabase
              .from('clasificacion')
              .select('id, NombreClasificacion')
              .eq('id', alternativa.id_clasificacion)
              .single();
            clasificacionData = data;
          }

          // Obtener tema
          if (alternativa.id_tema) {
            const { data } = await supabase
              .from('temas')
              .select('id_tema, NombreTema')
              .eq('id_tema', alternativa.id_tema)
              .single();
            temaData = data;
          }

          // Obtener medio
          if (alternativa.medio) {
            const { data } = await supabase
              .from('medios')
              .select('id, nombredelmedio')
              .eq('id', alternativa.medio)
              .single();
            medioData = data;
          }

          return {
            ...alternativa,
            Anios: anioData,
            Meses: mesData,
            Contratos: contratoData,
            Soportes: soporteData,
            Clasificacion: clasificacionData,
            Temas: temaData,
            Medios: medioData
          };
        })
      );

      console.log('Alternativas obtenidas:', alternativasConRelaciones);
      setAlternativas(alternativasConRelaciones || []);
      if (alternativasConRelaciones && alternativasConRelaciones.length > 0) {
        setNextNumeroOrden(Math.max(...alternativasConRelaciones.map(a => a.numerorden)) + 1);
      }
    } catch (error) {
      console.error('Error al obtener alternativas:', error);
      setAlternativas([]);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar las alternativas'
      });
    }
  };

  const fetchDependencies = async () => {
    try {
      const { data: clasificaciones, error } = await supabase
        .from('clasificacion')
        .select('*');

      if (error) throw error;
      
      setClasificaciones(clasificaciones || []);
    } catch (error) {
      console.error('Error al cargar las dependencias:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar las dependencias'
      });
    }
  };

  const handleDuplicateAlternativa = async (alternativa) => {

    console.log('Nueva alternativa insertada:', alternativa);
  

    try {
      // Create a new alternativa object with the same values but without the id
      const duplicatedAlternativaData = {
        ...alternativa,
        // Handle nlinea properly - if it's null or not a number, generate a new one
        // otherwise append a number to make it unique
        // nlinea: alternativa.nlinea ? (Number(alternativa.nlinea) + 1).toString() : '1',
        // numerorden: nextNumeroOrden
        nlinea: null,
        ordencreada: null,
  numerorden: null
      };
      delete duplicatedAlternativaData.id;
      delete duplicatedAlternativaData.Anios;
      delete duplicatedAlternativaData.Meses;
      delete duplicatedAlternativaData.Contratos;
      delete duplicatedAlternativaData.Soportes;
      delete duplicatedAlternativaData.Clasificacion;
      delete duplicatedAlternativaData.Temas;
      delete duplicatedAlternativaData.Medios;

      console.log('Datos de la nueva alternativa:', duplicatedAlternativaData);

   
      // First insert the new alternativa
      const { data: newAlternativa, error: alternativaError } = await supabase
        .from('alternativa')
        .insert([duplicatedAlternativaData])
        .select();


        
      if (alternativaError) throw alternativaError;

      // Then create the plan_alternativas relationship
      const { error: planAltError } = await supabase
        .from('plan_alternativas')
        .insert([{
          id_plan: id,
          id_alternativa: newAlternativa[0].id
        }]);

      if (planAltError) throw planAltError;

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Alternativa duplicada correctamente'
      });

      // Refresh the alternativas list
      await fetchAlternativas();
      setNextNumeroOrden(prev => prev + 1);

    } catch (error) {
      console.error('Error al duplicar la alternativa:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo duplicar la alternativa'
      });
    }
  };


  const handleDeleteAlternativa = async (alternativaId) => {
    try {
      const { data: alternativaCheck, error: checkError } = await supabase
      .from('alternativa')
      .select('numerorden')
      .eq('id', alternativaId)
      .single();
    
    if (checkError) throw checkError;
    
    // Si tiene número de orden, bloqueamos la eliminación
    if (alternativaCheck && alternativaCheck.numerorden) {
      Swal.fire({
        icon: 'warning',
        title: 'Acción bloqueada',
        text: 'No se puede eliminar una alternativa que ya tiene número de orden asignado'
      });
      return;
    }
      // Mostrar confirmación antes de eliminar
      const { isConfirmed } = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (!isConfirmed) return;

      setLoading(true);

      // Primero eliminar la relación en plan_alternativas
      const { error: planAltError } = await supabase
        .from('plan_alternativas')
        .delete()
        .eq('id_plan', id)
        .eq('id_alternativa', alternativaId);

      if (planAltError) throw planAltError;

      // Luego eliminar la alternativa
      const { error: altError } = await supabase
        .from('alternativa')
        .delete()
        .eq('id', alternativaId);

      if (altError) throw altError;

      // Recargar la lista de alternativas
      await fetchAlternativas();

      Swal.fire(
        '¡Eliminado!',
        'La alternativa ha sido eliminada.',
        'success'
      );
    } catch (error) {
      console.error('Error al eliminar alternativa:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la alternativa'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleEditAlternativa = async (alternativaId) => {
    try {
      setLoading(true);
       // Primero verificamos si la alternativa tiene número de orden
    const { data: alternativaCheck, error: checkError } = await supabase
    .from('alternativa')
    .select('numerorden')
    .eq('id', alternativaId)
    .single();
  
  if (checkError) throw checkError;
   // Si tiene número de orden, bloqueamos la edición
   if (alternativaCheck && alternativaCheck.numerorden) {
    Swal.fire({
      icon: 'warning',
      title: 'Acción bloqueada',
      text: 'No se puede editar una alternativa que ya tiene número de orden asignado'
    });
    setLoading(false);
    return;
  }
      
      // Updated query to include more detailed Temas and Medios information
      const { data: alternativa, error } = await supabase
        .from('alternativa')
        .select(`
          *,
          Contratos:num_contrato (*,
            formaPago:id_FormadePago (id, nombreformadepago),
            medio:IdMedios (id, NombredelMedio)
          ),
          Soportes:id_soporte (*),
          Programas:id_programa (*),
          Temas:id_tema (
            id_tema,
            NombreTema,
            Duracion,
            id_medio,
            Medios:id_medio (
              id,
              nombredelmedio
            )
          ),
          Clasificacion:id_clasificacion (*)
        `)
        .eq('id', alternativaId)
        .single();
  
      if (error) throw error;
  
      console.log('Alternativa loaded:', alternativa);
      
      // Asegurarse de que los valores numéricos sean números y no strings
      const valor_unitario = parseFloat(alternativa.valor_unitario) || 0;
      const descuento_plan = parseFloat(alternativa.descuento_plan) || 0;
      const recargo_plan = parseFloat(alternativa.recargo_plan) || 0;
      const total_bruto = parseFloat(alternativa.total_bruto) || 0;
      const total_neto = parseFloat(alternativa.total_neto) || 0;
      const iva = parseFloat(alternativa.iva) || 0;
      const total_orden = parseFloat(alternativa.total_orden) || 0;
      
      const contratoConMedio = {
        ...alternativa.Contratos,
        medio: alternativa.Contratos?.medio || null
      };
      setContratoSeleccionado(contratoConMedio);
      setSelectedSoporte(alternativa.Soportes);
      setSelectedPrograma(alternativa.Programas);
      setSelectedClasificacion(alternativa.Clasificacion);
      
      // Set tema with proper structure
      if (alternativa.Temas) {
        const temaData = {
          id_tema: alternativa.Temas.id_tema,
          NombreTema: alternativa.Temas.NombreTema, // Changed from nombre_tema to NombreTema
          segundos: alternativa.Temas.Duracion,
          id_medio: alternativa.Temas.id_medio,
          Medios: alternativa.Temas.Medios,
          nombreMedio: alternativa.Temas.Medios?.nombredelmedio || ''
        };
        setTemaSeleccionado(temaData);
      }
  
      // Prepare calendar data
      const calendarData = alternativa.calendar || [];
      
      // Recalcular los valores monetarios para asegurar consistencia
      const tipoGeneracionOrden = alternativa.Contratos?.id_GeneraracionOrdenTipo || 1;
      let calculatedTotalBruto = total_bruto;
      let calculatedTotalNeto = total_neto;
      
      // Si no hay valores, recalcularlos según la lógica de handleMontoChange
      if (!total_bruto || !total_neto) {
        const totalCantidades = (alternativa.calendar || []).reduce((sum, item) => {
          return sum + (Number(item.cantidad) || 0);
        }, 0);
        
        if (tipoGeneracionOrden === 1) { // Neto
          calculatedTotalNeto = valor_unitario * totalCantidades;
          calculatedTotalBruto = Math.round(calculatedTotalNeto / 0.85);
        } else { // Bruto
          calculatedTotalBruto = valor_unitario * totalCantidades;
          calculatedTotalNeto = Math.round(calculatedTotalBruto * 0.85);
        }
      }
      
      // Calcular IVA y total orden si no existen
      const calculatedIva = iva || Math.round(calculatedTotalNeto * 0.19);
      const calculatedTotalOrden = total_orden || (calculatedTotalNeto + calculatedIva);
  
      // Set complete alternative data for editing
      setNuevaAlternativa(prev => ({
        ...prev,
        ...alternativa,
        cantidades: alternativa.calendar || [],
        formaDePago: alternativa.Contratos?.formaPago?.id || '',
        nombreFormaPago: alternativa.Contratos?.formaPago?.nombreformadepago || '',
        segundos: alternativa.Temas?.Duracion || '',
        id_medio: alternativa.Contratos?.medio?.id || null,
        nombreMedio: alternativa.Contratos?.medio?.nombredelmedio || '',
        Medios: alternativa.Contratos?.medio || null,
        // Asegurar que los valores monetarios sean números
        valor_unitario: alternativa.valor_unitario || '',
        descuento_plan: alternativa.descuento_pl || alternativa.descuento_plan || '',
        recargo_plan: recargo_plan,
        total_bruto: calculatedTotalBruto || 0,
        total_neto: calculatedTotalNeto || 0,
        iva: calculatedIva || 0,
        total_orden: calculatedTotalOrden || 0,
        // Ensure all fields are properly initialized
        color: alternativa.color || '',
        codigo_megatime: alternativa.codigo_megatime || '',
        calidad: alternativa.calidad || '',
        cooperado: alternativa.cooperado || '',
        rubro: alternativa.rubro || ''
      }));
  
      // Set edit mode and open modal
      setEditandoAlternativa(alternativaId);
      setModoEdicion(true);
      setOpenModal(true);
  
    } catch (error) {
      console.error('Error al cargar alternativa para editar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la alternativa para editar'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarEdicion = async () => {
    console.log('handleGuardarEdicion: INICIO - Editando alternativa existente');
    console.log('handleGuardarEdicion: Datos actuales:', {
      editandoAlternativa,
      nuevaAlternativa,
      contratoSeleccionado,
      selectedSoporte
    });

    try {
      setLoading(true);
  
      // Function to clean numeric values
      const cleanNumericValue = (value) => {
        if (value === "" || value === null || value === undefined) return null;
        return Number(value);
      };
  
      // Filter calendar data
      const calendarData = nuevaAlternativa.cantidades
        .filter(item => item.cantidad && item.cantidad > 0)
        .map(item => ({
          dia: item.dia.toString().padStart(2, '0'),
          cantidad: parseInt(item.cantidad)
        }));
      
      console.log('handleGuardarEdicion: Calendar data procesado:', calendarData);
  
      // Prepare data for update, only including valid table columns
      const datosActualizacion = {
        nlinea: cleanNumericValue(nuevaAlternativa.nlinea),
        numerorden: cleanNumericValue(nuevaAlternativa.numerorden),
        anio: cleanNumericValue(nuevaAlternativa.anio),
        mes: cleanNumericValue(nuevaAlternativa.mes),
        id_campania: cleanNumericValue(nuevaAlternativa.id_campania),
        num_contrato: cleanNumericValue(nuevaAlternativa.num_contrato),
        id_soporte: cleanNumericValue(nuevaAlternativa.id_soporte),
        id_programa: cleanNumericValue(nuevaAlternativa.id_programa),
        tipo_item: nuevaAlternativa.tipo_item,
        id_clasificacion: cleanNumericValue(nuevaAlternativa.id_clasificacion),
        detalle: nuevaAlternativa.detalle || null,
        id_tema: cleanNumericValue(nuevaAlternativa.id_tema),
        segundos: cleanNumericValue(nuevaAlternativa.segundos),
        total_general: cleanNumericValue(nuevaAlternativa.total_bruto),
        total_neto: cleanNumericValue(nuevaAlternativa.total_neto),
        descuento_pl: cleanNumericValue(nuevaAlternativa.descuento_plan),
        recargo_plan: cleanNumericValue(nuevaAlternativa.recargo_plan),
        valor_unitario: cleanNumericValue(nuevaAlternativa.valor_unitario),
        medio: cleanNumericValue(nuevaAlternativa.id_medio),
        total_bruto: cleanNumericValue(nuevaAlternativa.total_bruto),
        calendar: calendarData && calendarData.length > 0 ? calendarData : null
      };
  
      // Remove any undefined or null properties
      Object.keys(datosActualizacion).forEach(key => {
        if (datosActualizacion[key] === undefined) {
          delete datosActualizacion[key];
        }
      });

      console.log('handleGuardarEdicion: Datos para actualización:', datosActualizacion);

      // Sistema de reintentos para diferentes nombres de tabla
      const tablasIntentos = ['alternativa', 'alternativas'];
      let updateError = null;

      for (const nombreTabla of tablasIntentos) {
        try {
          console.log(`handleGuardarEdicion: Intentando actualizar en tabla "${nombreTabla}"`);
          
          const { error } = await supabase
            .from(nombreTabla)
            .update(datosActualizacion)
            .eq('id', editandoAlternativa);

          if (error) {
            console.error(`handleGuardarEdicion: Error al actualizar en ${nombreTabla}:`, error);
            updateError = error;
            continue;
          }

          console.log(`handleGuardarEdicion: Éxito al actualizar en ${nombreTabla}`);
          updateError = null;
          break;
        } catch (error) {
          console.error(`handleGuardarEdicion: Error catch al actualizar en ${nombreTabla}:`, error);
          updateError = error;
        }
      }

      if (updateError) {
        throw updateError;
      }

      // Refresh the alternatives list
      await fetchAlternativas();
      
      // Close modal and reset states
      setOpenModal(false);
      setModoEdicion(false);
      setEditandoAlternativa(null);
      
      // Reset nueva alternativa state
      setNuevaAlternativa({
        nlinea: '',
        numerorden: nextNumeroOrden,
        anio: planData?.anio || '',
        mes: planData?.mes || '',
        id_campania: planData?.id_campania || '',
        num_contrato: '',
        id_soporte: '',
        id_programa: '',
        tipo_item: '',
        id_clasificacion: '',
        detalle: '',
        id_tema: '',
        segundos: '',
        id_medio: '',
        cantidades: [],
        valor_unitario: '',
        descuento_plan: '',
        recargo_plan: '',
        total_bruto: '',
        total_neto: '',
        medio: '',
        bonificacionano: '',
        escala: '',
        formaDePago: '',
        nombreFormaPago: '',
        soporte: '',
        descripcion: '',
        iva: '',
        total_orden: '',
        // Add missing fields that might be causing errors
        color: '',
        codigo_megatime: '',
        calidad: '',
        cooperado: '',
        rubro: ''
      });

      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Alternativa actualizada correctamente'
      });
    } catch (error) {
      console.error('handleGuardarEdicion: Error general:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al actualizar la alternativa'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenContratosModal = () => {
    setOpenContratosModal(true);
    handleSearchContrato(); // Actualizar la lista después de agregar
  };

  const handleCloseContratosModal = () => {
    setOpenContratosModal(false);
    setSearchContrato('');
  };

  const handleSeleccionarContrato = async (contrato) => {
    if (!contrato || !contrato.id) {
      console.error('Contrato inválido:', contrato);
      return;
    }

    // Asegurarnos de que el contrato tenga la estructura correcta con el proveedor
    const contratoCompleto = {
      ...contrato,
      proveedor: contrato.proveedor || { 
        id_proveedor: contrato.IdProveedor,
        nombreProveedor: contrato.proveedor?.nombreproveedor 
      }
    };

    console.log('Contrato seleccionado con forma de pago:', contratoCompleto);
    setContratoSeleccionado(contratoCompleto);
    
    setNuevaAlternativa(prev => ({
      ...prev,
      num_contrato: contrato.id,
      // Limpiar los montos
      valor_unitario: '',
      descuento_plan: '',
      recargo_plan: '',
      total_bruto: '',
      total_neto: '',
      iva: '',
      total_orden: '',
      // Limpiar el calendario
      cantidades: [],
      // Establecer la forma de pago del contrato
      formaDePago: contrato.formaPago?.id || '',
      nombreFormaPago: contrato.formaPago?.nombreformadepago || '',
      // Establecer el medio del contrato
      id_medio: contrato.medio?.id || contrato.IdMedios || '',
      nombreMedio: contrato.medio?.nombredelmedio || '',
      Medios: contrato.medio || null
    }));
    
    try {
      // Cargar soportes del proveedor
      const { data: proveedorSoportes, error: soportesError } = await supabase
        .from('proveedor_soporte')
        .select(`
          id_soporte,
          Soportes!inner (
            id_soporte,
            nombreidentificador,
            bonificacionano,
            escala,
            soporte_medios!inner (
              Medios!inner (
                id,
                nombredelmedio
              )
            )
          )
        `)
        .eq('id_proveedor', contrato.IdProveedor);

      if (soportesError) throw soportesError;

      const soportesFiltrados = proveedorSoportes
        .filter(item => item.Soportes)
        .map(item => {
          const medios = item.Soportes.soporte_medios
            ? item.Soportes.soporte_medios
                .map(sm => sm.Medios.nombredelmedio)
                .join(', ')
            : '';
          
          // Agregar el id_medio para facilitar el filtrado
          const id_medio = item.Soportes.soporte_medios && 
                          item.Soportes.soporte_medios.length > 0 ? 
                          item.Soportes.soporte_medios[0].Medios.id : null;
          
          return {
            id_soporte: item.Soportes.id_soporte,
            nombreidentificador: item.Soportes.nombreidentificador,
            Medios: medios,
            id_medio: id_medio,
            bonificacionano: item.Soportes.bonificacionano,
            escala: item.Soportes.escala
          };
        });

      console.log('Soportes filtrados por proveedor:', soportesFiltrados);
      setAllSoportes(soportesFiltrados);
      
      // Si el contrato tiene un medio asociado, filtrar los soportes por ese medio
      if (contrato.medio && contrato.medio.id) {
        const soportesPorMedio = soportesFiltrados.filter(soporte => 
          soporte.Medios.includes(contrato.medio.nombredelmedio)
        );
        setSoportes(soportesPorMedio);
      } else {
        setSoportes(soportesFiltrados);
      }
      
      setSoportesFiltrados([]);
      
      // NUEVO: Cargar clasificaciones filtradas por el medio del contrato
      try {
        setLoadingClasificaciones(true);
        
        // Obtener el IdMedios del contrato
        const medioId = contrato.IdMedios || contrato.idmedios || (contrato.medio ? contrato.medio.id : null);
        
        if (!medioId) {
          console.log('El contrato no tiene un medio asociado');
          setClasificacionesList([]);
        } else {
          // Obtener clasificaciones que coincidan con el medio del contrato
          const { data: clasificacionesData, error: clasificacionesError } = await supabase
            .from('clasificacion')
            .select('*')
            .eq('idmedios', medioId);
          
          if (clasificacionesError) throw clasificacionesError;
          
          console.log('Clasificaciones filtradas por medio:', clasificacionesData);
          setClasificacionesList(clasificacionesData || []);
        }
      } catch (errorClasificaciones) {
        console.error('Error al cargar clasificaciones:', errorClasificaciones);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las clasificaciones'
        });
        setClasificacionesList([]);
      } finally {
        setLoadingClasificaciones(false);
      }
      
    } catch (error) {
      console.error('Error al obtener soportes del proveedor:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar los soportes del proveedor'
      });
    }
    setOpenContratosModal(false);
  };

  const handleSearchContrato = async () => {
    console.log('handleSearchContrato: INICIO - Buscando contratos');
    console.log('handleSearchContrato: Parámetros:', { clienteId, searchContrato });

    if (!clienteId) {
      console.log('handleSearchContrato: No se puede buscar contratos sin clienteId');
      setContratosFiltrados([]);
      return;
    }

    setLoadingContratos(true);
    console.log('handleSearchContrato: Buscando contratos con clienteId:', clienteId, 'y término:', searchContrato);
    
    // Sistema de reintentos para diferentes nombres de tablas/campos
    const intentos = [
      {
        tabla: 'contratos',
        campoCliente: 'idcliente',
        campoId: 'id',
        campoNombre: 'nombrecontrato',
        campoEstado: 'Estado',
        relaciones: {
          cliente: 'IdCliente',
          proveedor: 'IdProveedor',
          medio: 'IdMedios',
          formaPago: 'id_FormadePago'
        }
      },
      {
        tabla: 'contratos',
        campoCliente: 'id_cliente',
        campoId: 'id',
        campoNombre: 'nombrecontrato',
        campoEstado: 'Estado',
        relaciones: {
          cliente: 'IdCliente',
          proveedor: 'IdProveedor',
          medio: 'IdMedios',
          formaPago: 'id_FormadePago'
        }
      },
      {
        tabla: 'contratos',
        campoCliente: 'idcliente',
        campoId: 'id',
        campoNombre: 'nombre_contrato',
        campoEstado: 'estado',
        relaciones: {
          cliente: 'IdCliente',
          proveedor: 'IdProveedor',
          medio: 'IdMedios',
          formaPago: 'id_FormadePago'
        }
      },
      {
        tabla: 'contratos',
        campoCliente: 'id_cliente',
        campoId: 'id',
        campoNombre: 'nombre_contrato',
        campoEstado: 'estado',
        relaciones: {
          cliente: 'IdCliente',
          proveedor: 'IdProveedor',
          medio: 'IdMedios',
          formaPago: 'id_FormadePago'
        }
      }
    ];

    let datosEncontrados = null;
    let ultimoError = null;

    for (let i = 0; i < intentos.length; i++) {
      const intento = intentos[i];
      console.log(`handleSearchContrato - Intento ${i + 1}/${intentos.length}:`);
      console.log(`  Tabla: ${intento.tabla}`);
      console.log(`  Campo cliente: ${intento.campoCliente}`);
      console.log(`  Campo nombre: ${intento.campoNombre}`);
      console.log(`  Campo estado: ${intento.campoEstado}`);
      
      try {
        let query = supabase
          .from(intento.tabla)
          .select(`
            ${intento.campoId},
            ${intento.campoNombre},
            ${intento.campoEstado},
            cliente:${intento.relaciones.cliente} (id_cliente, nombrecliente, nombre_cliente),
            proveedor:${intento.relaciones.proveedor} (id_proveedor, nombreProveedor, nombre_proveedor),
            medio:${intento.relaciones.medio} (id, NombredelMedio, nombredelmedio),
            formaPago:${intento.relaciones.formaPago}(
              id,
              nombreformadepago
            )
          `)
          .eq(intento.campoCliente, clienteId);

        // Agregar filtro de búsqueda si hay un término
        if (searchContrato && searchContrato.trim() !== '') {
          query = query.ilike(intento.campoNombre, `%${searchContrato}%`);
        }

        console.log(`handleSearchContrato - Ejecutando consulta para intento ${i + 1}`);
        const { data, error } = await query;

        console.log(`handleSearchContrato - Resultado intento ${i + 1}:`, {
          data: data,
          error: error,
          cantidad: data?.length || 0
        });

        if (error) {
          console.error(`handleSearchContrato - Error en intento ${i + 1}:`, error);
          ultimoError = error;
          continue;
        }

        if (!data || data.length === 0) {
          console.log(`handleSearchContrato - No hay datos en intento ${i + 1}`);
          continue;
        }
        
        // Transformar los datos para tener una estructura consistente
        const contratosTransformados = data.map(contrato => ({
          id: contrato[intento.campoId],
          nombrecontrato: contrato[intento.campoNombre],
          Estado: contrato[intento.campoEstado],
          cliente: {
            id_cliente: contrato.cliente?.id_cliente,
            nombrecliente: contrato.cliente?.nombrecliente || contrato.cliente?.nombre_cliente
          },
          proveedor: {
            id_proveedor: contrato.proveedor?.id_proveedor,
            nombreProveedor: contrato.proveedor?.nombreProveedor || contrato.proveedor?.nombre_proveedor
          },
          medio: {
            id: contrato.medio?.id,
            NombredelMedio: contrato.medio?.NombredelMedio || contrato.medio?.nombredelmedio,
            nombredelmedio: contrato.medio?.nombredelmedio || contrato.medio?.NombredelMedio
          },
          formaPago: contrato.formaPago,
          IdCliente: contrato.cliente?.id_cliente,
          IdProveedor: contrato.proveedor?.id_proveedor,
          IdMedios: contrato.medio?.id
        }));

        console.log(`handleSearchContrato - Contratos transformados en intento ${i + 1}:`, contratosTransformados);
        setContratosFiltrados(contratosTransformados);
        datosEncontrados = contratosTransformados;
        break; // Salir del bucle si tenemos éxito

      } catch (error) {
        console.error(`handleSearchContrato - Error catch en intento ${i + 1}:`, error);
        ultimoError = error;
      }
    }

    if (!datosEncontrados) {
      console.error(`handleSearchContrato - ERROR FINAL: No se pudieron cargar los contratos después de ${intentos.length} intentos`);
      console.error(`handleSearchContrato - Último error:`, ultimoError);
      console.error(`handleSearchContrato - Resumen:`, {
        clienteId,
        searchContrato,
        intentosRealizados: intentos.length
      });
      
      // Mostrar mensaje informativo
      Swal.fire({
        icon: 'warning',
        title: 'No se encontraron contratos',
        text: `No se pudieron cargar los contratos para este cliente. Puede intentar agregar un nuevo contrato.`
      });
      setContratosFiltrados([]);
    } else {
      console.log(`handleSearchContrato - ÉXITO: Se encontraron ${datosEncontrados.length} contratos`);
    }
    
    setLoadingContratos(false);
    console.log('handleSearchContrato: FIN');
  };

  useEffect(() => {
    if (clienteId) {
      handleSearchContrato();
    } else {
      console.log('clienteId no disponible para buscar contratos');
    }
  }, [clienteId, searchContrato]);

  useEffect(() => {
    if (!openContratosModal) {
      setSearchContrato('');
    }
  }, [openContratosModal]);

  const handleAgregarContrato = () => {
    Swal.fire({
      title: 'Función en desarrollo',
      text: 'La funcionalidad de agregar contratos estará disponible próximamente',
      icon: 'info'
    });
  };

  const handleActualizarContrato = (contrato) => {
    Swal.fire({
      title: 'Función en desarrollo',
      text: 'La funcionalidad de actualizar contratos estará disponible próximamente',
      icon: 'info'
    });
  };

  const handleEliminarContrato = (contrato) => {
    Swal.fire({
      title: 'Función en desarrollo',
      text: 'La funcionalidad de eliminar contratos estará disponible próximamente',
      icon: 'info'
    });
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Vigente':
        return 'success.main';
      case 'Consumido':
        return 'warning.main';
      case 'Anulado':
        return 'error.main';
      default:
        return 'text.primary';
    }
  };

  const handleOpenTemasModal = () => {
    if (!contratoSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Primero debe seleccionar un contrato'
      });
      return;
    }
  
    // Get medium info with fallbacks
    const medioId = contratoSeleccionado.medio?.id || 
                   contratoSeleccionado.IdMedios || 
                   nuevaAlternativa.id_medio;
  
    const medioNombre = contratoSeleccionado.medio?.nombredelmedio || 
                       nuevaAlternativa.nombreMedio || 
                       contratoSeleccionado.medio?.nombredelmedio;
  
    console.log('Media Info:', { medioId, medioNombre, contratoSeleccionado });
  
    // Update the alternative with complete media information
    setNuevaAlternativa(prev => ({
      ...prev,
      id_medio: medioId,
      nombreMedio: medioNombre,
      Medios: {
        id: medioId,
        NombredelMedio: medioNombre
      }
    }));
  
    setOpenTemasModal(true);
    fetchTemasFiltrados();
  };

  const handleCloseTemasModal = () => {
    setOpenTemasModal(false);
    setSearchTema('');
  };

  const handleSeleccionarTema = (tema) => {
    setTemaSeleccionado(tema);
    setNuevaAlternativa(prev => ({
      ...prev,
      id_tema: tema.id_tema,
      segundos: tema.duracion || tema.Duracion || '',
      id_medio: tema.id_medio || null
    }));
    handleCloseTemasModal();
  };

  const fetchTemasFiltrados = async () => {
    if (!campaniaId) {
      console.log('fetchTemasFiltrados: No hay campaniaId disponible');
      return;
    }
    
    setLoadingTemas(true);
    console.log('fetchTemasFiltrados: INICIO - Buscando temas para campaña:', campaniaId);
    console.log('fetchTemasFiltrados: contratoSeleccionado:', contratoSeleccionado);
    console.log('fetchTemasFiltrados: searchTema:', searchTema);
    
    // Get the media ID from the selected contract
    const medioId = contratoSeleccionado?.IdMedios || contratoSeleccionado?.medio?.id;
    console.log('fetchTemasFiltrados: medioId del contrato:', medioId);
    
    // Sistema de reintentos para diferentes nombres de tablas/campos
    const intentos = [
      {
        tablaRelacion: 'campania_temas',
        campoRelacion: 'id_temas',
        tablaTemas: 'temas',
        campoId: 'id_tema',
        campoNombre: 'NombreTema',
        campoDuracion: 'Duracion'
      },
      {
        tablaRelacion: 'campania_temas',
        campoRelacion: 'id_temas',
        tablaTemas: 'temas',
        campoId: 'id_tema',
        campoNombre: 'nombre_tema',
        campoDuracion: 'duracion'
      },
      {
        tablaRelacion: 'campania_temas',
        campoRelacion: 'id_tema',
        tablaTemas: 'temas',
        campoId: 'id_tema',
        campoNombre: 'NombreTema',
        campoDuracion: 'Duracion'
      },
      {
        tablaRelacion: 'campania_temas',
        campoRelacion: 'id_tema',
        tablaTemas: 'temas',
        campoId: 'id_tema',
        campoNombre: 'nombre_tema',
        campoDuracion: 'duracion'
      }
    ];

    let datosEncontrados = null;
    let ultimoError = null;

    for (let i = 0; i < intentos.length; i++) {
      const intento = intentos[i];
      console.log(`fetchTemasFiltrados - Intento ${i + 1}/${intentos.length}:`);
      console.log(`  Tabla relación: ${intento.tablaRelacion}`);
      console.log(`  Campo relación: ${intento.campoRelacion}`);
      console.log(`  Tabla temas: ${intento.tablaTemas}`);
      console.log(`  Campo ID: ${intento.campoId}`);
      console.log(`  Campo nombre: ${intento.campoNombre}`);
      console.log(`  Campo duración: ${intento.campoDuracion}`);
      
      try {
        // Paso 1: Obtener relaciones campaña-temas
        console.log(`fetchTemasFiltrados - Paso 1: Consultando relaciones en ${intento.tablaRelacion} para campania ${campaniaId}`);
        const { data: campaniaTemas, error: campaniaError } = await supabase
          .from(intento.tablaRelacion)
          .select(intento.campoRelacion)
          .eq('id_campania', campaniaId);

        console.log(`fetchTemasFiltrados - Paso 1 - Resultado:`, {
          data: campaniaTemas,
          error: campaniaError,
          cantidad: campaniaTemas?.length || 0
        });

        if (campaniaError) {
          console.error(`fetchTemasFiltrados - Error en Paso 1:`, campaniaError);
          ultimoError = campaniaError;
          continue;
        }

        if (!campaniaTemas || campaniaTemas.length === 0) {
          console.log(`fetchTemasFiltrados - Paso 1: No hay relaciones campaña-temas para esta campaña`);
          // Intentar consulta directa a temas como fallback
          console.log(`fetchTemasFiltrados - Intentando consulta directa a temas como fallback`);
          try {
            const { data: temasDirectos, error: errorDirecto } = await supabase
              .from('temas')
              .select('*')
              .limit(10);
            
            if (!errorDirecto && temasDirectos && temasDirectos.length > 0) {
              console.log(`fetchTemasFiltrados - Temas directos encontrados:`, temasDirectos);
              const temasFormateados = temasDirectos.map(tema => ({
                id_tema: tema.id_tema || tema.id,
                nombre_tema: tema.NombreTema || tema.nombre_tema || `Tema ${tema.id_tema || tema.id}`,
                duracion: tema.Duracion || tema.duracion || 0,
                descripcion: tema.descripcion || '',
                estado: tema.estado || 'Activo',
                Medios: tema.id_medio ? { id_medio: tema.id_medio, NombredelMedio: 'Medio desconocido' } : null
              }));
              
              // Aplicar filtros de búsqueda y medio
              const temasFiltradosFinales = temasFormateados.filter(tema => {
                const matchesSearch = !searchTema ||
                  tema.nombre_tema?.toLowerCase().includes(searchTema.toLowerCase()) ||
                  tema.descripcion?.toLowerCase().includes(searchTema.toLowerCase());
                
                const matchesMedia = !medioId || tema.Medios?.id_medio === medioId;
      
                return matchesSearch && matchesMedia;
              });
              
              console.log(`fetchTemasFiltrados - Temas finales después de filtros:`, temasFiltradosFinales);
              setTemasFiltrados(temasFiltradosFinales);
              setLoadingTemas(false);
              return;
            }
          } catch (errorDirecto) {
            console.error(`fetchTemasFiltrados - Error en consulta directa:`, errorDirecto);
          }
          
          console.log(`fetchTemasFiltrados - No se encontraron temas en ninguna consulta`);
          setTemasFiltrados([]);
          setLoadingTemas(false);
          return;
        }

        // Paso 2: Extraer IDs de temas
        const temaIds = campaniaTemas.map(item => item[intento.campoRelacion]).filter(id => id != null);
        console.log(`fetchTemasFiltrados - Paso 2: IDs de temas extraídos:`, temaIds);

        if (temaIds.length === 0) {
          console.log(`fetchTemasFiltrados - Paso 2: No se encontraron IDs válidos de temas`);
          continue;
        }

        // Paso 3: Obtener detalles de temas
        console.log(`fetchTemasFiltrados - Paso 3: Consultando detalles de temas en ${intento.tablaTemas}`);
        const { data: temasData, error: temasError } = await supabase
          .from(intento.tablaTemas)
          .select(`
            ${intento.campoId},
            ${intento.campoNombre},
            ${intento.campoDuracion},
            id_medio,
            descripcion,
            estado
          `)
          .in(intento.campoId, temaIds);

        console.log(`fetchTemasFiltrados - Paso 3 - Resultado:`, {
          data: temasData,
          error: temasError,
          cantidad: temasData?.length || 0
        });

        if (temasError) {
          console.error(`fetchTemasFiltrados - Error en Paso 3:`, temasError);
          ultimoError = temasError;
          continue;
        }

        if (!temasData || temasData.length === 0) {
          console.log(`fetchTemasFiltrados - Paso 3: No se encontraron detalles de temas`);
          continue;
        }

        // Paso 4: Obtener información de medios
        const mediosIds = temasData.map(tema => tema.id_medio).filter(id => id != null);
        console.log(`fetchTemasFiltrados - Paso 4: IDs de medios a consultar:`, mediosIds);
        
        let mediosData = [];
        if (mediosIds.length > 0) {
          console.log(`fetchTemasFiltrados - Paso 4: Consultando medios`);
          const { data: medios, error: mediosError } = await supabase
            .from('medios')
            .select('id, nombredelmedio')
            .in('id', mediosIds);
          
          console.log(`fetchTemasFiltrados - Paso 4 - Resultado medios:`, {
            data: medios,
            error: mediosError,
            cantidad: medios?.length || 0
          });
          
          if (!mediosError) {
            mediosData = medios || [];
          } else {
            console.error(`fetchTemasFiltrados - Error consultando medios:`, mediosError);
          }
        }

        // Paso 5: Formatear temas con información de medios
        console.log(`fetchTemasFiltrados - Paso 5: Formateando temas`);
        const temasFormateados = temasData.map(tema => {
          const medio = mediosData.find(m => m.id === tema.id_medio);
          const temaFormateado = {
            ...tema,
            id_tema: tema[intento.campoId],
            nombre_tema: tema[intento.campoNombre],
            duracion: tema[intento.campoDuracion],
            descripcion: tema.descripcion,
            estado: tema.estado,
            Medios: medio ? {
              id_medio: medio.id,
              NombredelMedio: medio.nombredelmedio
            } : null
          };
          console.log(`fetchTemasFiltrados - Tema formateado:`, temaFormateado);
          return temaFormateado;
        });

        // Paso 6: Aplicar filtros
        console.log(`fetchTemasFiltrados - Paso 6: Aplicando filtros`);
        console.log(`fetchTemasFiltrados - Filtros: searchTema="${searchTema}", medioId=${medioId}`);
        
        const temasFiltradosFinales = temasFormateados.filter(tema => {
          const matchesSearch =
            !searchTema ||
            tema.nombre_tema?.toLowerCase().includes(searchTema.toLowerCase()) ||
            tema.descripcion?.toLowerCase().includes(searchTema.toLowerCase());
          
          const matchesMedia = !medioId || tema.Medios?.id_medio === medioId;
          
          const resultado = matchesSearch && matchesMedia;
          console.log(`fetchTemasFiltrados - Tema "${tema.nombre_tema}": matchesSearch=${matchesSearch}, matchesMedia=${matchesMedia}, resultado=${resultado}`);
          
          return resultado;
        });
    
        console.log(`fetchTemasFiltrados - Paso 6 - Temas finales:`, temasFiltradosFinales);
        console.log(`fetchTemasFiltrados - ÉXITO en intento ${i + 1}`);
        
        setTemasFiltrados(temasFiltradosFinales);
        datosEncontrados = temasFiltradosFinales;
        break; // Salir del bucle si tenemos éxito

      } catch (error) {
        console.error(`fetchTemasFiltrados - Error en intento ${i + 1}:`, error);
        ultimoError = error;
      }
    }

    if (!datosEncontrados) {
      console.error(`fetchTemasFiltrados - ERROR FINAL: No se pudieron cargar los temas después de ${intentos.length} intentos`);
      console.error(`fetchTemasFiltrados - Último error:`, ultimoError);
      console.error(`fetchTemasFiltrados - Resumen:`, {
        campaniaId,
        medioId,
        searchTema,
        contratoSeleccionado
      });
      
      // Mostrar mensaje informativo en lugar de error
      Swal.fire({
        icon: 'warning',
        title: 'No se encontraron temas',
        text: `No se pudieron cargar los temas para esta campaña. Puede continuar sin seleccionar un tema.`
      });
      setTemasFiltrados([]);
    }
    
    setLoadingTemas(false);
    console.log('fetchTemasFiltrados: FIN');
  };

  useEffect(() => {
    if (campaniaId && openTemasModal) {
      fetchTemasFiltrados();
    }
  }, [campaniaId, searchTema, openTemasModal, contratoSeleccionado?.medio?.id]);

  const formatDuracion = (segundos) => {
    if (!segundos) return '-';
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  const handleSearchSoporte = (searchTerm) => {
    setSearchSoporte(searchTerm);
    
    if (!searchTerm.trim()) {
      // Si la búsqueda está vacía, mostrar todos los soportes que coincidan con el medio del contrato
      if (contratoSeleccionado && contratoSeleccionado.medio) {
        const filteredSoportes = allSoportes.filter(soporte => 
          soporte.Medios.includes(contratoSeleccionado.medio.nombredelmedio)
        );
        setSoportes(filteredSoportes);
        setSoportesFiltrados([]);
      } else {
        setSoportes(allSoportes);
        setSoportesFiltrados([]);
      }
      return;
    }

    // Filtrar basado en el término de búsqueda
    let filtrados = allSoportes.filter(soporte =>
      (soporte.nombreidentificador && soporte.nombreidentificador.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (soporte.Medios && soporte.Medios.toLowerCase().includes(searchTerm.toLowerCase())) ||
      String(soporte.id_soporte).includes(searchTerm)
    );
    
    // Filtro adicional por medio si hay un contrato seleccionado
    if (contratoSeleccionado && contratoSeleccionado.medio) {
      filtrados = filtrados.filter(soporte => 
        soporte.Medios.includes(contratoSeleccionado.medio.nombredelmedio)
      );
    }

    setSoportesFiltrados(filtrados);
  };

  const handleOpenSoportesModal = () => {
    if (!contratoSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Primero debe seleccionar un contrato'
      });
      return;
    }
    
    setOpenSoportesModal(true);
    
    // Filtrar soportes basados en el medio del contrato seleccionado
    if (contratoSeleccionado && contratoSeleccionado.medio) {
      const filteredSoportes = allSoportes.filter(soporte => 
        soporte.Medios.includes(contratoSeleccionado.medio.nombredelmedio)
      );
      
      setSoportes(filteredSoportes);
      setSoportesFiltrados([]);
    }
  };

  const handleCloseSoportesModal = () => {
    setOpenSoportesModal(false);
    setSearchSoporte('');
  };

  const handleSeleccionarSoporte = (soporte) => {
    console.log('Soporte seleccionado:', soporte);
    setSelectedSoporte(soporte);
    setNuevaAlternativa(prev => ({
      ...prev,
      id_soporte: soporte.id_soporte,
      soporte: soporte.nombreidentificador,
      bonificacionano: soporte.bonificacionano,
      escala: soporte.escala
    }));
    setOpenSoportesModal(false);
  };

  const handleSearchPrograma = async (searchValue) => {
    if (!nuevaAlternativa.id_soporte) {
      setProgramasFiltrados([]);
      return;
    }
    
    setLoadingProgramas(true);
    try {
      console.log('Buscando programas para soporte:', nuevaAlternativa.id_soporte);
      
      const { data, error } = await supabase
        .from('programas')
        .select('*')
        .eq('soporte_id', nuevaAlternativa.id_soporte)
        .eq('estado', true)  // Solo programas activos
        .ilike('descripcion', `%${searchValue}%`)
        .order('descripcion', { ascending: true });

      if (error) throw error;

      console.log('Programas encontrados:', data);
      setProgramasFiltrados(data || []);
    } catch (error) {
      console.error('Error al buscar programas:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al buscar programas'
      });
      setProgramasFiltrados([]);
    } finally {
      setLoadingProgramas(false);
    }
  };

  const handleOpenProgramasModal = () => {
    if (!nuevaAlternativa.id_soporte) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Primero debe seleccionar un soporte'
      });
      return;
    }
    setOpenProgramasModal(true);
    handleSearchPrograma('');
  };

  const handleCloseProgramasModal = () => {
    setOpenProgramasModal(false);
    setSearchPrograma('');
  };

  const handleSeleccionarPrograma = (programa) => {
    setSelectedPrograma(programa);
    setNuevaAlternativa(prev => ({
      ...prev,
      id_programa: programa.id
    }));
    handleCloseProgramasModal();
  };
  const handleSearchClasificacion = async (searchTerm) => {
    try {
      setLoadingClasificaciones(true);
      setSearchClasificacion(searchTerm);
      
      if (!nuevaAlternativa.num_contrato) {
        setClasificacionesList([]);
        return;
      }
      
      // Primero obtenemos el contrato para saber su IdMedios
      const { data: contratoData, error: contratoError } = await supabase
        .from('contratos')
        .select('idmedios')
        .eq('id', nuevaAlternativa.num_contrato)
        .single();
      
      if (contratoError) throw contratoError;
      
      if (!contratoData || !(contratoData.IdMedios || contratoData.idmedios)) {
        console.log('El contrato no tiene un medio asociado');
        setClasificacionesList([]);
        return;
      }
      
      let query = supabase
        .from('clasificacion')
        .select('*')
        .eq('idmedios', contratoData.IdMedios || contratoData.idmedios);
      
      if (searchTerm) {
        query = query.ilike('NombreClasificacion', `%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setClasificacionesList(data || []);
    } catch (error) {
      console.error('Error al buscar clasificaciones:', error);
      setClasificacionesList([]);
    } finally {
      setLoadingClasificaciones(false);
    }
  };

  const handleOpenClasificacionModal = () => {
    if (!nuevaAlternativa.num_contrato) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Primero debe seleccionar un contrato'
      });
      return;
    }
    setOpenClasificacionModal(true);
    handleSearchClasificacion('');
  };

  const handleCloseClasificacionModal = () => {
    setOpenClasificacionModal(false);
    setSearchClasificacion('');
  };

  const handleSeleccionarClasificacion = (clasificacion) => {
    setSelectedClasificacion(clasificacion);
    setNuevaAlternativa(prev => ({
      ...prev,
      id_clasificacion: clasificacion.id
    }));
    handleCloseClasificacionModal();
  };

  const handleOpenAddEditClasificacionModal = (clasificacion = null) => {
    if (clasificacion) {
      setEditingClasificacion(clasificacion);
      setNuevaClasificacion({
        NombreClasificacion: clasificacion.NombreClasificacion,
        id_contrato: clasificacion.id_contrato
      });
    } else {
      setEditingClasificacion(null);
      setNuevaClasificacion({
        NombreClasificacion: '',
        id_contrato: nuevaAlternativa.num_contrato
      });
    }
    setOpenAddEditClasificacionModal(true);
  };

  const handleCloseAddEditClasificacionModal = () => {
    setOpenAddEditClasificacionModal(false);
    setEditingClasificacion(null);
    setNuevaClasificacion({
      NombreClasificacion: '',
      id_contrato: ''
    });
  };

  const handleSaveClasificacion = async () => {
    console.log('handleSaveClasificacion: INICIO - Guardando clasificación');
    console.log('handleSaveClasificacion: Datos actuales:', {
      nuevaClasificacion,
      editingClasificacion,
      contratoSeleccionado
    });

    try {
      if (!nuevaClasificacion.NombreClasificacion) {
        console.log('handleSaveClasificacion: Validación fallida - NombreClasificacion vacío');
        Swal.fire({
          icon: 'warning',
          title: 'Atención',
          text: 'El nombre de la clasificación es obligatorio'
        });
        return;
      }

      // Obtener el IdMedios del contrato seleccionado
      const medioId = contratoSeleccionado?.IdMedios ||
                     contratoSeleccionado?.idmedios ||
                     contratoSeleccionado?.id_medios ||
                     (contratoSeleccionado?.medio ? contratoSeleccionado.medio.id : null);
      
      if (!medioId) {
        console.error('handleSaveClasificacion: No se pudo identificar el medio del contrato');
        Swal.fire({
          icon: 'warning',
          title: 'Atención',
          text: 'No se pudo identificar el medio del contrato'
        });
        return;
      }

      console.log('handleSaveClasificacion: Medio ID identificado:', medioId);

      // Sistema de reintentos para diferentes nombres de tabla/campos
      const intentos = [
        {
          tabla: 'clasificacion',
          campoNombre: 'NombreClasificacion',
          campoMedio: 'IdMedios'
        },
        {
          tabla: 'clasificacion',
          campoNombre: 'nombre_clasificacion',
          campoMedio: 'IdMedios'
        },
        {
          tabla: 'clasificacion',
          campoNombre: 'NombreClasificacion',
          campoMedio: 'id_medios'
        },
        {
          tabla: 'clasificaciones',
          campoNombre: 'NombreClasificacion',
          campoMedio: 'IdMedios'
        }
      ];

      let response = null;
      let ultimoError = null;

      for (let i = 0; i < intentos.length; i++) {
        const intento = intentos[i];
        console.log(`handleSaveClasificacion - Intento ${i + 1}/${intentos.length}:`);
        console.log(`  Tabla: ${intento.tabla}`);
        console.log(`  Campo nombre: ${intento.campoNombre}`);
        console.log(`  Campo medio: ${intento.campoMedio}`);
        
        try {
          const clasificacionData = {
            [intento.campoNombre]: nuevaClasificacion.NombreClasificacion,
            [intento.campoMedio]: medioId
          };

          console.log(`handleSaveClasificacion - Datos a guardar:`, clasificacionData);

          let result;
          if (editingClasificacion) {
            // Actualizar clasificación existente
            console.log(`handleSaveClasificacion - Actualizando clasificación existente`);
            result = await supabase
              .from(intento.tabla)
              .update(clasificacionData)
              .eq('id', editingClasificacion.id);
          } else {
            // Insertar nueva clasificación
            console.log(`handleSaveClasificacion - Insertando nueva clasificación`);
            result = await supabase
              .from(intento.tabla)
              .insert([clasificacionData]);
          }

          if (result.error) {
            console.error(`handleSaveClasificacion - Error en intento ${i + 1}:`, result.error);
            ultimoError = result.error;
            continue;
          }

          console.log(`handleSaveClasificacion - Éxito en intento ${i + 1}:`, result);
          response = result;
          break;

        } catch (error) {
          console.error(`handleSaveClasificacion - Error catch en intento ${i + 1}:`, error);
          ultimoError = error;
        }
      }

      if (!response) {
        console.error('handleSaveClasificacion: No se pudo guardar después de todos los intentos');
        throw ultimoError || new Error('No se pudo guardar la clasificación');
      }

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: editingClasificacion
          ? 'Clasificación actualizada correctamente'
          : 'Clasificación agregada correctamente'
      });

      // Limpiar el formulario y cerrar el modal
      setNuevaClasificacion({
        NombreClasificacion: '',
        IdMedios: ''
      });
      setEditingClasificacion(null);
      setOpenAddEditClasificacionModal(false);

      // Actualizar la lista de clasificaciones
      if (contratoSeleccionado) {
        console.log('handleSaveClasificacion: Actualizando lista de clasificaciones');
        await handleSearchClasificacion(''); // Recargar clasificaciones
      }
    } catch (error) {
      console.error('handleSaveClasificacion: Error general:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error al guardar la clasificación: ${error.message || JSON.stringify(error)}`
      });
    }
    console.log('handleSaveClasificacion: FIN');
  };

  const handleOpenAddTemaModal = () => {
    if (!contratoSeleccionado?.IdMedios) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Primero debe seleccionar un contrato con medio asociado'
      });
      return;
    }
    setOpenAddTemaModal(true);
  };

  const handleCloseAddTemaModal = () => {
    setOpenAddTemaModal(false);
  };

  const handleTemaAdded = () => {
    fetchTemasFiltrados();
    handleCloseAddTemaModal();
  };

  const loadSoportesParaPrograma = async () => {
    try {
      const { data: soportes, error } = await supabase
        .from('soportes')
        .select('id_soporte, nombreidentificador');
      
      if (error) throw error;
      setSoportesParaPrograma(soportes);
    } catch (error) {
      console.error('Error al cargar soportes:', error);
    }
  };

  const handleOpenAddEditProgramaModal = async (programa = null) => {
    await loadSoportesParaPrograma();
    if (programa) {
      setEditingPrograma(programa);
      setNewPrograma({
        descripcion: programa.descripcion,
        hora_inicio: programa.hora_inicio,
        hora_fin: programa.hora_fin,
        cod_prog_megatime: programa.cod_prog_megatime,
        codigo_programa: programa.codigo_programa,
        soporte_id: programa.soporte_id
      });
    } else {
      setEditingPrograma(null);
      setNewPrograma({
        descripcion: '',
        hora_inicio: '',
        hora_fin: '',
        cod_prog_megatime: '',
        codigo_programa: '',
        soporte_id: ''
      });
    }
    setOpenAddEditProgramaModal(true);
  };

  const handleCloseAddEditProgramaModal = () => {
    setOpenAddEditProgramaModal(false);
    setEditingPrograma(null);
    setNewPrograma({
      descripcion: '',
      hora_inicio: '',
      hora_fin: '',
      cod_prog_megatime: '',
      codigo_programa: '',
      soporte_id: ''
    });
    // Restaurar los soportes originales al cerrar
    setSoportes(allSoportes);
    setSoportesFiltrados([]);
  };

  const handleSavePrograma = async () => {
    console.log('handleSavePrograma: INICIO - Guardando programa');
    console.log('handleSavePrograma: Datos actuales:', {
      newPrograma,
      editingPrograma,
      selectedSoporte,
      searchPrograma
    });

    // Validaciones existentes
    if (!newPrograma.descripcion) {
      console.log('handleSavePrograma: Validación fallida - descripción vacía');
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'La descripción del programa es obligatoria'
      });
      return;
    }

    if (!selectedSoporte || !selectedSoporte.id_soporte) {
      console.log('handleSavePrograma: Validación fallida - no hay soporte seleccionado');
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Debe seleccionar un soporte para el programa'
      });
      return;
    }
  
    try {
      setLoading(true);
      
      // Sistema de reintentos para obtener el último código Megatime
      const tablasIntentos = ['programas', 'programa'];
      let nextCodProgMegatime = 3998; // Valor base por defecto
      let ultimoError = null;

      for (const nombreTabla of tablasIntentos) {
        try {
          console.log(`handleSavePrograma - Intentando obtener último código de tabla "${nombreTabla}"`);
          
          const { data, error } = await supabase
            .from(nombreTabla)
            .select('cod_prog_megatime')
            .not('cod_prog_megatime', 'is', null)
            .not('cod_prog_megatime', 'eq', '')
            .order('created_at', { ascending: false })
            .limit(100);
          
          if (error) {
            console.error(`handleSavePrograma - Error al obtener códigos de ${nombreTabla}:`, error);
            ultimoError = error;
            continue;
          }

          if (data && data.length > 0) {
            const codigosNumericos = data
              .map(prog => prog.cod_prog_megatime)
              .filter(codigo => !isNaN(parseInt(codigo)))
              .map(codigo => parseInt(codigo));
            
            if (codigosNumericos.length > 0) {
              const maxCodigo = Math.max(...codigosNumericos);
              nextCodProgMegatime = maxCodigo + 1;
              console.log(`handleSavePrograma - Último código encontrado en ${nombreTabla}:`, maxCodigo);
              break;
            }
          }
        } catch (error) {
          console.error(`handleSavePrograma - Error catch al obtener códigos de ${nombreTabla}:`, error);
          ultimoError = error;
        }
      }
      
      console.log('handleSavePrograma: Próximo código Megatime a usar:', nextCodProgMegatime);
      
      // Sistema de reintentos para guardar el programa
      let response = null;
      let saveError = null;

      for (const nombreTabla of tablasIntentos) {
        try {
          console.log(`handleSavePrograma - Intentando guardar en tabla "${nombreTabla}"`);
          
          // Preparar datos del programa con diferentes posibles nombres de campos
          const programaData = {
            descripcion: newPrograma.descripcion,
            hora_inicio: newPrograma.hora_inicio,
            hora_fin: newPrograma.hora_fin,
            codigo_programa: newPrograma.codigo_programa || '',
            soporte_id: selectedSoporte.id_soporte,
            estado: true
          };
          
          // Solo asignar nuevo código si es un nuevo programa, no en edición
          if (!editingPrograma) {
            programaData.cod_prog_megatime = nextCodProgMegatime.toString();
          } else if (editingPrograma && !editingPrograma.cod_prog_megatime) {
            programaData.cod_prog_megatime = nextCodProgMegatime.toString();
          } else if (editingPrograma) {
            programaData.cod_prog_megatime = editingPrograma.cod_prog_megatime;
          }
          
          console.log(`handleSavePrograma - Datos a guardar:`, programaData);
          
          let result;
          if (editingPrograma) {
            // Actualizar programa existente
            console.log(`handleSavePrograma - Actualizando programa existente`);
            result = await supabase
              .from(nombreTabla)
              .update(programaData)
              .eq('id', editingPrograma.id)
              .select();
          } else {
            // Insertar nuevo programa
            console.log(`handleSavePrograma - Insertando nuevo programa`);
            result = await supabase
              .from(nombreTabla)
              .insert([programaData])
              .select();
          }
          
          if (result.error) {
            console.error(`handleSavePrograma - Error al guardar en ${nombreTabla}:`, result.error);
            saveError = result.error;
            continue;
          }

          console.log(`handleSavePrograma - Éxito al guardar en ${nombreTabla}:`, result);
          response = result;
          break;

        } catch (error) {
          console.error(`handleSavePrograma - Error catch al guardar en ${nombreTabla}:`, error);
          saveError = error;
        }
      }

      if (!response) {
        console.error('handleSavePrograma: No se pudo guardar después de todos los intentos');
        throw saveError || ultimoError || new Error('No se pudo guardar el programa');
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: editingPrograma ? 'Programa actualizado correctamente' : 'Programa agregado correctamente'
      });
      
      // Cerrar el modal y limpiar el formulario
      setOpenAddEditProgramaModal(false);
      setNewPrograma({
        descripcion: '',
        hora_inicio: '',
        hora_inicio_hora: '00',
        hora_inicio_min: '00',
        hora_fin: '',
        hora_fin_hora: '00',
        hora_fin_min: '00',
        cod_prog_megatime: '',
        codigo_programa: '',
        soporte_id: selectedSoporte?.id_soporte || ''
      });
      setEditingPrograma(null);
      
      // Actualizar la lista de programas
      if (selectedSoporte) {
        console.log('handleSavePrograma: Actualizando lista de programas');
        await handleSearchPrograma(searchPrograma || ''); // Recargar programas
      }
      
    } catch (error) {
      console.error('handleSavePrograma: Error general:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error al guardar el programa: ${error.message || JSON.stringify(error)}`
      });
    } finally {
      setLoading(false);
    }
    console.log('handleSavePrograma: FIN');
  };


  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/planificacion')}
          >
            Volver a Planificación
          </Button>
        </Paper>
      </Container>
    );
  }

  const getDiasDelMes = (anio, mes) => {
    if (!anio || !mes) return [];
    
    const diasEnMes = new Date(anio, mes, 0).getDate();
    const diasSemana = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
    const dias = [];
    
    for (let i = 1; i <= diasEnMes; i++) {
      const fecha = new Date(anio, mes - 1, i);
      const nombreDia = diasSemana[fecha.getDay()];
      dias.push({
        dia: i.toString().padStart(2, '0'),
        nombreDia,
        fecha: fecha.toISOString().split('T')[0]
      });
    }
    
    return dias;
  };

  const calcularTarifas = (valores) => {
    const valorUnitario = parseFloat(valores.valor_unitario) || 0;
    const descuento = parseFloat(valores.descuento_plan) || 0;
    const recargo = parseFloat(valores.recargo_plan) || 0;
    const IVA = 19;
    
    const valorConIVA = valorUnitario * (1 + (IVA / 100));
    const tarifaBruta = valorConIVA * (1 + (recargo / 100));
    const tarifaNeta = tarifaBruta * (1 - (descuento / 100));

    const cantidadTotal = nuevaAlternativa.cantidades.reduce((sum, item) => sum + (Number(item.cantidad) || 0), 0);
    
    const totalGeneralBruto = tarifaBruta * cantidadTotal;
    const totalGeneralNeto = tarifaNeta * cantidadTotal;

    return {
      tarifa_bruta: tarifaBruta.toFixed(2),
      tarifa_neta: tarifaNeta.toFixed(2),
      total_bruto: totalGeneralBruto.toFixed(2),
      total_general: totalGeneralBruto.toFixed(2),
      total_neto: totalGeneralNeto.toFixed(2)
    };
  };

  const handleMontoChange = (campo, valor) => {
    setNuevaAlternativa(prev => {
      const tipoGeneracionOrden = contratoSeleccionado?.id_GeneraracionOrdenTipo || 1;
      const valorNumerico = Number(valor) || 0;
      
      // Crear una copia del estado anterior
      const updated = { ...prev };
      
      // Actualizar el campo específico con el nuevo valor
      updated[campo] = valorNumerico;
      
      // Obtener los valores actuales para los cálculos
      const valorUnitario = campo === 'valor_unitario' ? valorNumerico : Number(prev.valor_unitario) || 0;
      const descuento = campo === 'descuento_plan' ? valorNumerico : Number(prev.descuento_plan) || 0;
      const recargo = campo === 'recargo_plan' ? valorNumerico : Number(prev.recargo_plan) || 0;
      
      let totalBruto = 0;
      let totalNeto = 0;
      
      // Verificar si el medio del contrato es 35 o 38 para aplicar multiplicación por cantidades
      const medioId = contratoSeleccionado?.medio?.id || contratoSeleccionado?.IdMedios;
      const aplicarMultiplicacion = medioId === 35 || medioId === 38;
      
      // Calcular totales basados en cantidades solo si el medio es 35 o 38
      const totalCantidades = prev.cantidades.reduce((sum, item) => {
        return sum + (Number(item.cantidad) || 0);
      }, 0);
      
      // Determinar el multiplicador según el tipo de medio
      const multiplicador = aplicarMultiplicacion ? (totalCantidades > 0 ? totalCantidades : 1) : 1;
      
      if (tipoGeneracionOrden === 1) { // Neto
        // Calcular el total neto base (sin descuentos/recargos)
        const totalNetoBase = valorUnitario * multiplicador;
        
        // Aplicar descuento si existe
        let totalConDescuento = totalNetoBase;
        if (descuento > 0) {
          totalConDescuento = totalNetoBase - (totalNetoBase * (descuento / 100));
        }
        
        // Aplicar recargo si existe
        if (recargo > 0) {
          totalNeto = totalConDescuento + (totalConDescuento * (recargo / 100));
        } else {
          totalNeto = totalConDescuento;
        }
        
        // Calcular el total bruto a partir del neto
        totalBruto = Math.round(totalNeto / 0.85);
      } else { // Bruto
        // Calcular el total bruto base (sin descuentos/recargos)
        const totalBrutoBase = valorUnitario * multiplicador;
        
        // Aplicar descuento si existe
        let totalConDescuento = totalBrutoBase;
        if (descuento > 0) {
          totalConDescuento = totalBrutoBase - (totalBrutoBase * (descuento / 100));
        }
        
        // Aplicar recargo si existe
        if (recargo > 0) {
          totalBruto = totalConDescuento + (totalConDescuento * (recargo / 100));
        } else {
          totalBruto = totalConDescuento;
        }
        
        // Calcular el total neto a partir del bruto
        totalNeto = Math.round(totalBruto * 0.85);
      }
      
      // Calcular IVA y total orden
      const iva = Math.round(totalNeto * 0.19);
      const totalOrden = totalNeto + iva;
      
      return {
        ...updated,
        total_bruto: Math.round(totalBruto),
        total_neto: Math.round(totalNeto),
        iva: Math.round(iva),
        total_orden: Math.round(totalOrden)
      };
    });
  };

  const handleCantidadChange = (dia, valor) => {
    setNuevaAlternativa(prev => {
      // Crear una copia del array de cantidades
      const cantidadesActualizadas = [...prev.cantidades];
      
      // Buscar si ya existe una entrada para este día
      const index = cantidadesActualizadas.findIndex(item => item.dia === dia);
      
      if (index !== -1) {
        // Actualizar la cantidad existente
        cantidadesActualizadas[index] = {
          ...cantidadesActualizadas[index],
          cantidad: valor
        };
      } else {
        // Agregar nueva cantidad
        cantidadesActualizadas.push({
          dia,
          cantidad: valor
        });
      }
      
      // Si autoFillCantidades está activado, rellenar todas las casillas siguientes
      if (autoFillCantidades && valor !== '') {
        // Convertir el día actual a número para comparar
        const diaActual = parseInt(dia, 10);
        
        // Rellenar todas las casillas siguientes con el mismo valor
        for (let i = diaActual + 1; i <= 31; i++) {
          const diaSiguiente = i.toString().padStart(2, '0');
          const indexSiguiente = cantidadesActualizadas.findIndex(item => item.dia === diaSiguiente);
          
          if (indexSiguiente !== -1) {
            // Actualizar cantidad existente
            cantidadesActualizadas[indexSiguiente] = {
              ...cantidadesActualizadas[indexSiguiente],
              cantidad: valor
            };
          } else {
            // Agregar nueva cantidad
            cantidadesActualizadas.push({
              dia: diaSiguiente,
              cantidad: valor
            });
          }
        }
      }
      
      // Obtener valores actuales para recalcular
      const valorUnitario = Number(prev.valor_unitario) || 0;
      const descuento = Number(prev.descuento_plan) || 0;
      const recargo = Number(prev.recargo_plan) || 0;
      const tipoGeneracionOrden = contratoSeleccionado?.id_GeneraracionOrdenTipo || 1;
      
      // Verificar si el medio del contrato es 35 o 38 para aplicar multiplicación por cantidades
      const medioId = contratoSeleccionado?.medio?.id || contratoSeleccionado?.IdMedios;
      const aplicarMultiplicacion = medioId === 35 || medioId === 38;
      
      // Calcular el total de cantidades
      const totalCantidades = cantidadesActualizadas.reduce((sum, item) => {
        return sum + (Number(item.cantidad) || 0);
      }, 0);
      
      // Determinar el multiplicador según el tipo de medio
      const multiplicador = aplicarMultiplicacion ? (totalCantidades > 0 ? totalCantidades : 1) : 1;
      
      let totalBruto = 0;
      let totalNeto = 0;
      
      if (tipoGeneracionOrden === 1) { // Neto
        // Calcular el total neto base (sin descuentos/recargos)
        const totalNetoBase = valorUnitario * multiplicador;
        
        // Aplicar descuento si existe
        let totalConDescuento = totalNetoBase;
        if (descuento > 0) {
          totalConDescuento = totalNetoBase - (totalNetoBase * (descuento / 100));
        }
        
        // Aplicar recargo si existe
        if (recargo > 0) {
          totalNeto = totalConDescuento + (totalConDescuento * (recargo / 100));
        } else {
          totalNeto = totalConDescuento;
        }
        
        // Calcular el total bruto a partir del neto
        totalBruto = Math.round(totalNeto / 0.85);
      } else { // Bruto
        // Calcular el total bruto base (sin descuentos/recargos)
        const totalBrutoBase = valorUnitario * multiplicador;
        
        // Aplicar descuento si existe
        let totalConDescuento = totalBrutoBase;
        if (descuento > 0) {
          totalConDescuento = totalBrutoBase - (totalBrutoBase * (descuento / 100));
        }
        
        // Aplicar recargo si existe
        if (recargo > 0) {
          totalBruto = totalConDescuento + (totalConDescuento * (recargo / 100));
        } else {
          totalBruto = totalConDescuento;
        }
        
        // Calcular el total neto a partir del bruto
        totalNeto = Math.round(totalBruto * 0.85);
      }
      
      // Calcular IVA y total orden
      const iva = Math.round(totalNeto * 0.19);
      const totalOrden = totalNeto + iva;
      
      return {
        ...prev,
        cantidades: cantidadesActualizadas,
        total_bruto: Math.round(totalBruto),
        total_neto: Math.round(totalNeto),
        iva: Math.round(iva),
        total_orden: Math.round(totalOrden)
      };
    });
  };
  const handleLimpiarCantidades = () => {
    setNuevaAlternativa(prev => {
      return {
        ...prev,
        cantidades: [],
        total_bruto: 0,
        total_neto: 0,
        iva: 0,
        total_orden: 0
      };
    });
  };
  const CalendarioAlternativa = ({ anio, mes, cantidades = [], onChange }) => {
    const dias = getDiasDelMes(anio, mes);
    
    const getCantidad = (dia) => {
      const item = cantidades?.find(c => c.dia === dia);
      return item ? item.cantidad : '';
    };

    const calcularTotal = () => { 
      // Array con el número de días de cada mes (índice 0 = enero, 1 = febrero, etc.)
      const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      
      // Obtener el mes (restando 1 porque en JavaScript los meses van de 0 a 11)
      const mes = (planData?.mes || nuevaAlternativa.mes) - 1;
      const anio = planData?.anio || nuevaAlternativa.anio;
      
      // Ajustar febrero en años bisiestos
      if (mes === 1 && ((anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0)) {
        diasPorMes[1] = 29;
      }
      
      // Número de días en el mes actual
      const diasEnMes = diasPorMes[mes];
      
      // Filtrar las cantidades para incluir solo los días válidos
      const cantidadesValidas = (cantidades || []).filter((item, index) => index < diasEnMes);
      
      const total = cantidadesValidas.reduce((sum, item) => { 
        const cantidad = parseInt(item.cantidad) || 0; 
        return sum + cantidad; 
      }, 0); 
      
      return total;
    };
    
    return (
      <Box sx={{ mt: 2 }}>
       <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
  <Typography variant="h6">Calendario de Cantidades</Typography>
  <Box display="flex" alignItems="center">
    <FormControlLabel
      control={
        <Checkbox
          checked={autoFillCantidades}
          onChange={(e) => setAutoFillCantidades(e.target.checked)}
          color="primary"
        />
      }
      label="Rellenar automáticamente todas las casillas"
    />
    <Button 
      variant="outlined" 
      color="secondary" 
      size="small" 
      onClick={handleLimpiarCantidades}
      sx={{ ml: 2 }}
    >
      Limpiar
    </Button>
  </Box>
</Box>
        <TableContainer sx={{
          maxWidth: '100%',
          overflowX: 'auto',
          '& .MuiTable-root': {
            tableLayout: 'fixed',
            minWidth: 'max-content'
          }
        }}>
          <Table size="small" sx={{
            '& .MuiTableCell-root': {
              padding: '0px',
              border: '1px solid #e0e0e0',
              minWidth: '36px',
              maxWidth: '36px',
              height: '36px',
              verticalAlign: 'middle',
              textAlign: 'center',
              boxSizing: 'border-box'
            }
          }}>
            <TableHead>
              <TableRow>
                {dias.map(({ dia, nombreDia }) => (
                  <TableCell key={dia} align="center" sx={{
                    backgroundColor: '#f5f5f5',
                    minWidth: '36px',
                    maxWidth: '36px',
                    padding: '2px',
                    height: '36px',
                    verticalAlign: 'middle',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      gap: '1px'
                    }}>
                      <Typography variant="caption" sx={{ fontSize: '0.55rem', color: '#666', lineHeight: 1, display: 'block' }}>
                        {nombreDia}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#333', lineHeight: 1, fontWeight: 'bold' }}>
                        {dia}
                      </Typography>
                    </Box>
                  </TableCell>
                ))}
                <TableCell align="center" sx={{
                  backgroundColor: '#f5f5f5',
                  minWidth: '40px',
                  maxWidth: '40px',
                  padding: '2px',
                  height: '36px',
                  verticalAlign: 'middle',
                  textAlign: 'center',
                  boxSizing: 'border-box'
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%'
                  }}>
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#333', fontWeight: 'bold', lineHeight: 1 }}>
                      Tot
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {dias.map(({ dia }) => (
                  <TableCell key={dia} align="center" padding="none" sx={{
                    width: '36px',
                    height: '36px',
                    minWidth: '36px',
                    maxWidth: '36px',
                    padding: '1px',
                    verticalAlign: 'middle',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                    border: '1px solid #e0e0e0'
                  }}>
                   <input
    type="number"
    value={getCantidad(dia)}
    onChange={(e) => onChange(dia, e.target.value)}
    style={{
      width: '32px',
      height: '32px',
      padding: '0px',
      border: 'none',
      borderRadius: '0px',
      textAlign: 'center',
      fontSize: '0.7rem',
      backgroundColor: '#fff',
      // Estilos para ocultar los punteros en diferentes navegadores
      WebkitAppearance: 'none',
      MozAppearance: 'textfield',
      appearance: 'textfield',
      margin: '0px',
      display: 'block',
      boxSizing: 'border-box',
      lineHeight: '1',
      outline: 'none'
    }}
    step="any"
    min="0"
   />
                  </TableCell>
                ))}
                <TableCell align="center" sx={{
                  backgroundColor: '#f8f9fa',
                  minWidth: '40px',
                  maxWidth: '40px',
                  height: '36px',
                  padding: '2px',
                  verticalAlign: 'middle',
                  textAlign: 'center',
                  boxSizing: 'border-box'
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%'
                  }}>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#333', lineHeight: 1 }}>
                      {calcularTotal()}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const calcularTotalesGenerales = () => {
    return alternativas.reduce((acc, alt) => ({
      totalBruto: acc.totalBruto + Number(alt.total_bruto || 0),
      totalNeto: acc.totalNeto + Number(alt.total_neto || 0)
    }), { totalBruto: 0, totalNeto: 0 });
  };

  const handleGuardarAlternativa = async () => {
    console.log('handleGuardarAlternativa: INICIO - Guardando nueva alternativa');
    console.log('handleGuardarAlternativa: Datos actuales:', {
      contratoSeleccionado,
      selectedSoporte,
      planData,
      nuevaAlternativa
    });

    const errors = {
      contrato: !contratoSeleccionado,
      soporte: !selectedSoporte
    };
    
    setValidationErrors(errors);
    
    // Si hay errores, mostrar mensaje y detener el proceso
    if (errors.contrato || errors.soporte) {
      console.log('handleGuardarAlternativa: Errores de validación:', errors);
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Debe seleccionar un Contrato y un Soporte para continuar'
      });
      return;
    }

    try {
      setLoading(true);
  
      if (!planData || !planData.id) {
        console.error('handleGuardarAlternativa: No hay un plan seleccionado');
        throw new Error('No hay un plan seleccionado');
      }
  
      console.log('handleGuardarAlternativa: Plan ID:', planData.id);
  
      // Function to clean numeric values
      const cleanNumericValue = (value) => {
        if (value === "" || value === null || value === undefined) return null;
        return Number(value);
      };
  
      // Filter calendar data
      const calendarData = nuevaAlternativa.cantidades
        .filter(item => item.cantidad && item.cantidad > 0)
        .map(item => ({
          dia: item.dia.toString().padStart(2, '0'),
          cantidad: parseInt(item.cantidad)
        }));
      
      console.log('handleGuardarAlternativa: Calendar data procesado:', calendarData);
  
      // Prepare data with proper numeric handling - SOLO campos que existen en la tabla
      const alternativaData = {
        nlinea: cleanNumericValue(nuevaAlternativa.nlinea),
        numerorden: cleanNumericValue(nuevaAlternativa.numerorden) || 1,
        anio: cleanNumericValue(nuevaAlternativa.anio),
        mes: cleanNumericValue(nuevaAlternativa.mes),
        id_campania: cleanNumericValue(nuevaAlternativa.id_campania),
        num_contrato: cleanNumericValue(nuevaAlternativa.num_contrato),
        id_soporte: cleanNumericValue(nuevaAlternativa.id_soporte),
        descripcion: nuevaAlternativa.descripcion || nuevaAlternativa.detalle || null,
        tipo_item: nuevaAlternativa.tipo_item,
        id_clasificacion: cleanNumericValue(nuevaAlternativa.id_clasificacion),
        detalle: nuevaAlternativa.detalle || null,
        id_tema: cleanNumericValue(nuevaAlternativa.id_tema),
        segundos: cleanNumericValue(nuevaAlternativa.segundos),
        total_general: cleanNumericValue(nuevaAlternativa.total_bruto),
        total_neto: cleanNumericValue(nuevaAlternativa.total_neto),
        descuento_pl: cleanNumericValue(nuevaAlternativa.descuento_plan),
        id_programa: cleanNumericValue(nuevaAlternativa.id_programa),
        recargo_plan: cleanNumericValue(nuevaAlternativa.recargo_plan),
        valor_unitario: cleanNumericValue(nuevaAlternativa.valor_unitario),
        medio: cleanNumericValue(nuevaAlternativa.id_medio),
        total_bruto: cleanNumericValue(nuevaAlternativa.total_bruto),
        calendar: calendarData && calendarData.length > 0 ? calendarData : null
      };

      // Eliminar campos que no existen en la tabla para evitar errores
      delete alternativaData.formaDePago;
      delete alternativaData.nombreFormaPago;
      delete alternativaData.bonificacionano;
      delete alternativaData.escala;
      delete alternativaData.iva;
      delete alternativaData.total_orden;

      console.log('handleGuardarAlternativa: Datos para inserción en alternativa:', alternativaData);

      // Sistema de reintentos para diferentes nombres de tabla
      const tablasIntentos = ['alternativa', 'alternativas'];
      let nuevaAlternativaInsertada = null;
      let errorAlternativa = null;

      for (const nombreTabla of tablasIntentos) {
        try {
          console.log(`handleGuardarAlternativa: Intentando insertar en tabla "${nombreTabla}"`);
          
          const { data, error } = await supabase
            .from(nombreTabla)
            .insert(alternativaData)
            .select()
            .single();

          if (error) {
            console.error(`handleGuardarAlternativa: Error al insertar en ${nombreTabla}:`, error);
            errorAlternativa = error;
            continue;
          }

          console.log(`handleGuardarAlternativa: Éxito al insertar en ${nombreTabla}:`, data);
          nuevaAlternativaInsertada = data;
          break;
        } catch (error) {
          console.error(`handleGuardarAlternativa: Error catch al insertar en ${nombreTabla}:`, error);
          errorAlternativa = error;
        }
      }

      if (!nuevaAlternativaInsertada) {
        console.error('handleGuardarAlternativa: No se pudo insertar en ninguna tabla');
        throw errorAlternativa || new Error('No se pudo insertar la alternativa');
      }

      // Preparar los datos para la tabla plan_alternativas
      const planAlternativaData = {
        id_plan: planData.id,
        id_alternativa: nuevaAlternativaInsertada.id
      };

      console.log('handleGuardarAlternativa: Datos para inserción en plan_alternativas:', planAlternativaData);

      // Sistema de reintentos para plan_alternativas
      const tablasRelacionIntentos = ['plan_alternativas', 'plan_alternativa'];
      let errorPlanAlternativa = null;

      for (const nombreTabla of tablasRelacionIntentos) {
        try {
          console.log(`handleGuardarAlternativa: Intentando insertar relación en "${nombreTabla}"`);
          
          const { error } = await supabase
            .from(nombreTabla)
            .insert(planAlternativaData);

          if (error) {
            console.error(`handleGuardarAlternativa: Error al insertar relación en ${nombreTabla}:`, error);
            errorPlanAlternativa = error;
            continue;
          }

          console.log(`handleGuardarAlternativa: Éxito al insertar relación en ${nombreTabla}`);
          errorPlanAlternativa = null;
          break;
        } catch (error) {
          console.error(`handleGuardarAlternativa: Error catch al insertar relación en ${nombreTabla}:`, error);
          errorPlanAlternativa = error;
        }
      }

      if (errorPlanAlternativa) {
        console.error('handleGuardarAlternativa: Error al insertar relación, eliminando alternativa creada');
        // Si falla la inserción en plan_alternativas, eliminamos la alternativa creada
        await supabase
          .from('alternativa')
          .delete()
          .eq('id', nuevaAlternativaInsertada.id);
        throw errorPlanAlternativa;
      }

      // Limpiar el formulario y cerrar el modal
      setNuevaAlternativa({
        nlinea: '',
        numerorden: 1,
        anio: '',
        mes: '',
        id_campania: '',
        num_contrato: '',
        id_soporte: '',
        id_programa: '',
        tipo_item: '',
        id_clasificacion: '',
        detalle: '',
        id_tema: '',
        segundos: '',
        id_medio: '',
        cantidades: [],
        valor_unitario: '',
        descuento_plan: '',
        recargo_plan: '',
        total_bruto: '',
        total_neto: '',
        medio: '',
        bonificacionano: '',
        escala: '',
        formaDePago: '',
        nombreFormaPago: '',
        soporte: '',
        descripcion: '',
        iva: '',
        total_orden: '',
        // Add missing fields that might be causing errors
        color: '',
        codigo_megatime: '',
        calidad: '',
        cooperado: '',
        rubro: ''
      });

      setOpenModal(false);
      
      // Mostrar mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Alternativa guardada correctamente'
      }).then(() => {
        // Refrescar la página después de mostrar el mensaje
        window.location.reload();
      });

    } catch (error) {
      console.error('handleGuardarAlternativa: Error general:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al guardar la alternativa'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = modoEdicion ? handleGuardarEdicion : handleGuardarAlternativa;

  const tituloModal = modoEdicion ? 'Editar Alternativa' : 'Nueva Alternativa';

  const handleTemaChange = (_, newValue) => {
    const selectedMedio = newValue?.Medios;
    
    if (selectedMedio) {
      setVisibleFields({
        duracion: Boolean(selectedMedio.duracion),
        color: Boolean(selectedMedio.color),
        codigo_megatime: Boolean(selectedMedio.codigo_megatime),
        calidad: Boolean(selectedMedio.calidad),
        cooperado: Boolean(selectedMedio.cooperado),
        rubro: Boolean(selectedMedio.rubro)
      });
    } else {
      setVisibleFields({
        duracion: false,
        color: false,
        codigo_megatime: false,
        calidad: false,
        cooperado: false,
        rubro: false
      });
    }
  
    setNuevaAlternativa(prev => ({ 
      ...prev, 
      id_tema: newValue?.id_tema || '',
      segundos: newValue?.segundos || '',
      id_medio: newValue?.id_medio || null,
      nombreMedio: newValue?.Medios?.nombredelmedio || ''
    }));
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ width: '100%', mt: 3 }}>
        <Paper 
          elevation={3}
          sx={{ 
            width: '100%',
            mb: 2,
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8f9fa',
              borderBottom: '1px solid #e2e8f0'
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: '#1e293b',
                fontWeight: 600
              }}
            >
              Lista de Alternativas
              {planInfo.campana && (
                <Typography variant="subtitle1" color="text.secondary">
                  Campaña: {planInfo.campana}
                </Typography>
              )}
            </Typography>
            <Button
              variant="contained"
              onClick={() => setOpenModal(true)}
              startIcon={<AddIcon sx={{ color: 'white' }} />}
              sx={{
                backgroundColor: '#4F46E5',
                '&:hover': {
                  backgroundColor: '#4338CA',
                },
                textTransform: 'none',
                borderRadius: 2
              }}
            >
              Nueva Alternativa
            </Button>
          </Box>

          <Box sx={{ p: 2 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>N° Línea</TableCell>
                    <TableCell>N° Orden</TableCell>
                    <TableCell>Año</TableCell>
                    <TableCell>Mes</TableCell>
                    <TableCell>Contrato</TableCell>
                    <TableCell>Soporte</TableCell>
                    <TableCell>Tipo Item</TableCell>
                    <TableCell>Clasificación</TableCell>
                    <TableCell>Detalle</TableCell>
                    <TableCell>Tema</TableCell>
                    <TableCell>Segundos</TableCell>
                    <TableCell>Medio</TableCell>
                    <TableCell>Total Bruto</TableCell>
                    <TableCell>Total Neto</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alternativas.map((alternativa) => (
                    <TableRow key={alternativa.id}>
                      <TableCell>{alternativa.nlinea}</TableCell>
                      <TableCell>{alternativa.numerorden}</TableCell>
                      <TableCell>{alternativa.Anios?.years}</TableCell>
                      <TableCell>{alternativa.Meses?.Nombre}</TableCell>
                      <TableCell>{alternativa.Contratos?.nombrecontrato}</TableCell>
                      <TableCell>{alternativa.Soportes?.nombreidentificador}</TableCell>
                      <TableCell>{alternativa.tipo_item}</TableCell>
                      <TableCell>{alternativa.Clasificacion?.NombreClasificacion}</TableCell>
                      <TableCell>{alternativa.detalle}</TableCell>
                      <TableCell>{alternativa.Temas?.NombreTema}</TableCell>
                      <TableCell>{alternativa.segundos}</TableCell>
                      <TableCell>{alternativa.Medios?.nombredelmedio}</TableCell>
                      <TableCell>{alternativa.total_bruto}</TableCell>
                      <TableCell>{alternativa.total_neto}</TableCell>
                      <TableCell>
                      <Tooltip title={alternativa.numerorden ? "No se puede editar con N° de Orden asignado" : "Editar"}>
        <span>
          <IconButton 
            onClick={() => handleEditAlternativa(alternativa.id)} 
            disabled={!!alternativa.numerorden}
            style={{ 
              color: alternativa.numerorden ? 'gray' : '#1976d2' // Azul para habilitado, gris para deshabilitado
            }}
          >
            <EditIcon />
          </IconButton>
        </span>
      </Tooltip>
      
      <Tooltip title={alternativa.numerorden ? "No se puede eliminar con N° de Orden asignado" : "Eliminar"}>
        <span>
          <IconButton 
            onClick={() => handleDeleteAlternativa(alternativa.id)} 
            disabled={!!alternativa.numerorden}
            style={{ 
              color: alternativa.numerorden ? 'gray' : '#d32f2f' // Rojo para habilitado, gris para deshabilitado
            }}
          >
            <DeleteIcon />
          </IconButton>
        </span>
      </Tooltip>
                        <Tooltip title="Duplicar">
                          <IconButton
                            onClick={() => handleDuplicateAlternativa(alternativa)}
                            size="small"
                            color="primary"
                          >
                            <FileCopyIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>

        <Paper 
          elevation={3} 
          sx={{ 
            mt: 3,
            p: 2.5, 
            bgcolor: '#f8f9fa',
            borderRadius: '8px'
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                Resumen de Totales
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 2.5, 
                bgcolor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
              }}>
                <AccountBalanceIcon sx={{ fontSize: '2.2rem', color: '#2196f3', mr: 2 }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Bruto
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    ${calcularTotalesGenerales().totalBruto.toLocaleString('es-CL')}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 2.5, 
                bgcolor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
              }}>
                <ReceiptIcon sx={{ fontSize: '2.2rem', color: '#4caf50', mr: 2 }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total General Neto
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    ${calcularTotalesGenerales().totalNeto.toLocaleString('es-CL')}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Dialog 
          open={openModal} 
          onClose={handleCloseModal}
          maxWidth="xl"
          fullWidth
          PaperProps={{
            sx: {
              height: 'auto',
              maxHeight: '90vh',
              width: '95%',
              '& .MuiDialogContent-root': {
                padding: 2,
                overflowX: 'hidden'
              }
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" component="h2">
              {tituloModal}
            </Typography>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 2,
              mt: 2,
              backgroundColor: '#f8f9fa',
              p: 2,
              borderRadius: 1,
              '& > div': {
                backgroundColor: '#fff',
                p: 2,
                borderRadius: 1,
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }
            }}>
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Período
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {planInfo.anio} / {planInfo.mes}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Campaña / Cliente
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {planInfo.campana}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {planInfo.cliente}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Producto
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {planInfo.producto}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: 2 }}>
            <input type="hidden" value={nuevaAlternativa.nlinea} />
            <input type="hidden" value={nuevaAlternativa.numerorden} />
            <input type="hidden" name="anio" value={nuevaAlternativa.anio} />
            <input type="hidden" name="mes" value={nuevaAlternativa.mes} />

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={9}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <FormControl fullWidth>
                        <Box sx={{ position: 'relative', width: '100%' }}>
                          <TextField
                            label="Contrato"
                            value={contratoSeleccionado ? contratoSeleccionado.nombrecontrato : ''}
                            InputProps={{
                              readOnly: true,
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    edge="end"
                                    onClick={handleOpenContratosModal}
                                  >
                                    <SearchIcon />
                                  </IconButton>
                                </InputAdornment>
                              ),
                              startAdornment: (
                                <InputAdornment position="start">
                                  <ReceiptIcon />
                                </InputAdornment>
                              )
                            }}
                            onClick={handleOpenContratosModal}
                            sx={{ cursor: 'pointer', width: '100%' }}
                          />
                        </Box>
                      </FormControl>
                    </Box>
                  </Grid>

                  {/* Campos dinámicos basados en el medio seleccionado */}
                  {visibleFields.duracion && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Duración"
                        value={nuevaAlternativa.segundos || ''}
                        onChange={(e) => setNuevaAlternativa(prev => ({ ...prev, segundos: e.target.value }))}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <TimerIcon />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                  )}

                  {visibleFields.color && (
                 <Grid item xs={12} sm={6}>
                   <TextField
                     label="Color"
                     value={nuevaAlternativa.color || ''}
                     onChange={(e) => setNuevaAlternativa(prev => ({ ...prev, color: e.target.value }))}
                     fullWidth
                     InputProps={{
                       startAdornment: (
                         <InputAdornment position="start">
                           <ColorLensIcon />
                         </InputAdornment>
                       )
                     }}
                   />
                 </Grid>
               )}

               {visibleFields.codigo_megatime && (
                 <Grid item xs={12} sm={6}>
                   <TextField
                     label="Código Megatime"
                     value={nuevaAlternativa.codigo_megatime || ''}
                     onChange={(e) => setNuevaAlternativa(prev => ({ ...prev, codigo_megatime: e.target.value }))}
                     fullWidth
                     InputProps={{
                       startAdornment: (
                         <InputAdornment position="start">
                           <CodeIcon />
                         </InputAdornment>
                       )
                     }}
                   />
                 </Grid>
               )}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Forma de Pago"
                      value={nuevaAlternativa.nombreFormaPago || ''}
                      disabled
                      fullWidth
                      sx={{ width: '100%' }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PaymentIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4} sx={{ width: '100%' }}>
                        <FormControl fullWidth>
                          <Box sx={{ position: 'relative', width: '100%' }}>
                          <TextField
   label="Tema"
   value={temaSeleccionado ? (temaSeleccionado.NombreTema || temaSeleccionado.nombre_tema) : ''}
   InputProps={{
     readOnly: true,
     endAdornment: (
       <InputAdornment position="end">
         <IconButton
           edge="end"
           onClick={() => nuevaAlternativa.num_contrato && handleOpenTemasModal()}
           disabled={!nuevaAlternativa.num_contrato}
         >
           <SearchIcon />
         </IconButton>
       </InputAdornment>
     ),
     startAdornment: (
       <InputAdornment position="start">
         <TopicIcon />
       </InputAdornment>
     )
   }}
   onClick={() => nuevaAlternativa.num_contrato && handleOpenTemasModal()}
   sx={{ cursor: nuevaAlternativa.num_contrato ? 'pointer' : 'not-allowed', width: '100%' }}
   helperText={!nuevaAlternativa.num_contrato ? "Primero seleccione un contrato" : ""}
 />
                          </Box>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Medio"
                          size="small"
                          fullWidth
                          value={temaSeleccionado?.Medios?.nombredelmedio || temaSeleccionado?.Medios?.NombredelMedio || ''}
                          disabled
                          sx={{ width: '100%' }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <RadioIcon sx={{ fontSize: '1.1rem' }} />
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Segundos"
                          size="small"
                          fullWidth
                          value={nuevaAlternativa.segundos || ''}
                          disabled
                          sx={{ width: '100%' }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <TimerIcon sx={{ fontSize: '1.1rem' }} />
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={3} sx={{ width: '100%' }}>
                        <FormControl fullWidth>
                          <Box sx={{ position: 'relative', width: '100%' }}>
                            <TextField
                              label="Soporte"
                              value={selectedSoporte ? selectedSoporte.nombreidentificador : ''}
                              onClick={() => {
                                if (nuevaAlternativa.num_contrato) {
                                  handleOpenSoportesModal();
                                } else {
                                  Swal.fire({
                                    icon: 'warning',
                                    title: 'Atención',
                                    text: 'Primero debe seleccionar un contrato'
                                  });
                                }
                              }}
                              InputProps={{
                                readOnly: true,
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      edge="end"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (nuevaAlternativa.num_contrato) {
                                          handleOpenSoportesModal();
                                        } else {
                                          Swal.fire({
                                            icon: 'warning',
                                            title: 'Atención',
                                            text: 'Primero debe seleccionar un contrato'
                                          });
                                        }
                                      }}
                                    >
                                      <SearchIcon />
                                    </IconButton>
                                  </InputAdornment>
                                ),
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CategoryIcon sx={{ fontSize: '1.1rem' }} />
                                  </InputAdornment>
                                )
                              }}
                              sx={{ cursor: 'pointer', width: '100%' }}
                              helperText={!nuevaAlternativa.num_contrato ? "Primero seleccione un contrato" : ""}
                            />
                          </Box>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="Programa"
                          value={selectedPrograma ? selectedPrograma.descripcion : ''}
                          InputProps={{
                            readOnly: true,
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  edge="end"
                                  onClick={() => nuevaAlternativa.id_soporte && handleOpenProgramasModal()}
                                  disabled={!nuevaAlternativa.id_soporte}
                                >
                                  <SearchIcon />
                                </IconButton>
                              </InputAdornment>
                            ),
                            startAdornment: (
                              <InputAdornment position="start">
                                <PlaylistPlayIcon sx={{ fontSize: '1.1rem' }} />
                              </InputAdornment>
                            )
                          }}
                          onClick={() => nuevaAlternativa.id_soporte && handleOpenProgramasModal()}
                          sx={{ cursor: nuevaAlternativa.id_soporte ? 'pointer' : 'not-allowed', width: '100%' }}
                          helperText={!nuevaAlternativa.id_soporte ? "Primero seleccione un soporte" : ""}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="Horario Inicio"
                          value={selectedPrograma ? selectedPrograma.hora_inicio : ''}
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <InputAdornment position="start">
                                <AccessTimeIcon sx={{ fontSize: '1.1rem' }} />
                              </InputAdornment>
                            )
                          }}
                          sx={{ width: '100%' }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="Horario Fin"
                          value={selectedPrograma ? selectedPrograma.hora_fin : ''}
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <InputAdornment position="start">
                                <AccessTimeIcon sx={{ fontSize: '1.1rem' }} />
                              </InputAdornment>
                            )
                          }}
                          sx={{ width: '100%' }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4} sx={{ width: '100%' }}>
                        <FormControl fullWidth>
                          <Box sx={{ position: 'relative', width: '100%' }}>
                            <TextField
                              label="Clasificación"
                              value={selectedClasificacion ? selectedClasificacion.NombreClasificacion : ''}
                              InputProps={{
                                readOnly: true,
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      edge="end"
                                      onClick={() => nuevaAlternativa.num_contrato && handleOpenClasificacionModal()}
                                      disabled={!nuevaAlternativa.num_contrato}
                                    >
                                      <SearchIcon />
                                    </IconButton>
                                  </InputAdornment>
                                ),
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CategoryIcon sx={{ fontSize: '1.1rem' }} />
                                  </InputAdornment>
                                )
                              }}
                              onClick={() => nuevaAlternativa.num_contrato && handleOpenClasificacionModal()}
                              sx={{ cursor: nuevaAlternativa.num_contrato ? 'pointer' : 'not-allowed', width: '100%' }}
                              helperText={!nuevaAlternativa.num_contrato ? "Primero seleccione un contrato" : ""}
                            />
                          </Box>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          select
                          label="Tipo Item"
                          fullWidth
                          value={nuevaAlternativa.tipo_item}
                          onChange={(e) => setNuevaAlternativa(prev => ({ ...prev, tipo_item: e.target.value }))}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <InventoryIcon sx={{ fontSize: '1.1rem' }} />
                              </InputAdornment>
                            )
                          }}
                        >
                          {TIPO_ITEMS.map((tipo) => (
                            <MenuItem key={tipo} value={tipo}>
                              {tipo}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Detalle"
                          fullWidth
                          value={nuevaAlternativa.detalle}
                          onChange={(e) => setNuevaAlternativa(prev => ({ ...prev, detalle: e.target.value }))}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <DescriptionIcon sx={{ fontSize: '1.1rem' }} />
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>       <Box  sx={{ mt: 2 }}>
              <CalendarioAlternativa
                anio={nuevaAlternativa.anio}
                mes={nuevaAlternativa.mes}
                cantidades={nuevaAlternativa.cantidades}
                onChange={handleCantidadChange}
              />
            </Box></Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={3}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8f9fa', height: '100%' }}>
  <Typography variant="subtitle2" gutterBottom>
    Montos
  </Typography>
  <Grid container spacing={2}>
    <Grid item xs={12}>
    <TextField
  label="Valor Unitario"
  type="number"
  fullWidth
  value={nuevaAlternativa.valor_unitario}
  onChange={(e) => handleMontoChange('valor_unitario', e.target.value)}
  InputProps={{
    startAdornment: <InputAdornment position="start">$</InputAdornment>,
  }}
/>
    </Grid>
    <Grid item xs={12}>
    <TextField
  label="Descuento Plan (%)"
  type="number"
  fullWidth
  value={nuevaAlternativa.descuento_plan}
  onChange={(e) => handleMontoChange('descuento_plan', e.target.value)}
  InputProps={{
    endAdornment: <InputAdornment position="end">%</InputAdornment>,
  }}
/>
    </Grid>
    <Grid item xs={12}>
    <TextField
  label="Recargo Plan (%)"
  type="number"
  fullWidth
  value={nuevaAlternativa.recargo_plan}
  onChange={(e) => handleMontoChange('recargo_plan', e.target.value)}
  InputProps={{
    endAdornment: <InputAdornment position="end">%</InputAdornment>,
  }}
/>
    </Grid>
    <Grid item xs={12}>
      <TextField
        label={contratoSeleccionado?.id_GeneraracionOrdenTipo === 1 ? 'TOTAL NETO' : 'TOTAL BRUTO'}
        size="small"
        fullWidth
        type="number"
        value={contratoSeleccionado?.id_GeneraracionOrdenTipo === 1 ? 
          nuevaAlternativa.total_neto : 
          nuevaAlternativa.total_bruto}
        disabled
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <AccountBalanceIcon sx={{ fontSize: '1.1rem' }} />
            </InputAdornment>
          )
        }}
      />
    </Grid>
    <Grid item xs={12}>
      <TextField
        label="IVA 19%"
        size="small"
        fullWidth
        type="number"
        value={nuevaAlternativa.iva}
        disabled
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <ReceiptIcon sx={{ fontSize: '1.1rem' }} />
            </InputAdornment>
          )
        }}
      />
    </Grid>
    <Grid item xs={12}>
      <TextField
        label="TOTAL ORDEN"
        size="small"
        fullWidth
        type="number"
        value={nuevaAlternativa.total_orden}
        disabled
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <ReceiptIcon sx={{ fontSize: '1.1rem' }} />
            </InputAdornment>
          )
        }}
      />
    </Grid>
  </Grid>
</Paper>
              </Grid>
            </Grid>

     

          </DialogContent>
          <DialogActions>
  <Button onClick={handleCloseModal}>


Cancelar

  </Button>
  <Button 
    onClick={handleGuardar}
    variant="contained" 
    color="primary"
  >
    {modoEdicion ? 'Guardar Cambios' : 'Guardar'}
  </Button>
</DialogActions>
        </Dialog>

        <Dialog 
          open={openContratosModal} 
          onClose={handleCloseContratosModal}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="h6">Seleccionar Contrato</Typography>
              <IconButton onClick={handleCloseContratosModal} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                label="Buscar contrato"
                value={searchContrato}
                onChange={(e) => {
                  setSearchContrato(e.target.value);
                  handleSearchContrato();
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                size="small"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenAddContratoModal}
                startIcon={<AddIcon />}
                size="small"
              >
                Agregar
              </Button>
            </Box>
          </DialogTitle>

          <DialogContent>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nombre Contrato</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Proveedor</TableCell>
                    <TableCell>Medio</TableCell>
                    <TableCell>Forma de Pago</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingContratos ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : contratosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No se encontraron contratos
                      </TableCell>
                    </TableRow>
                  ) : (
                    contratosFiltrados.map((contrato) => (
                      <TableRow key={contrato.id}>
                        <TableCell>{contrato.id}</TableCell>
                        <TableCell>{contrato.nombrecontrato}</TableCell>
                        <TableCell>{contrato.cliente?.nombrecliente}</TableCell>
                        <TableCell>{contrato.proveedor?.nombreproveedor}</TableCell>
                        <TableCell>{contrato.medio?.nombredelmedio}</TableCell>
                        <TableCell>{contrato.formaPago?.nombreformadepago}</TableCell>
                        <TableCell>
                          <Typography color={getEstadoColor(contrato.Estado)}>
                            {contrato.Estado}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Seleccionar">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleSeleccionarContrato(contrato)}
                              >
                                <CheckIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  setContratoSeleccionado(contrato);
                                  handleOpenEditContratoModal();
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
        </Dialog>

        <Dialog 
          open={openTemasModal} 
          onClose={handleCloseTemasModal}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="h6">Seleccionar Tema</Typography>
              <IconButton onClick={handleCloseTemasModal} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar tema..."
                value={searchTema}
                onChange={(e) => {
                  setSearchTema(e.target.value);
                  fetchTemasFiltrados();
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                size="small"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenAddTemaModal}
                startIcon={<AddIcon />}
                size="small"
              >
                Agregar
              </Button>
            </Box>
          </DialogTitle>


          <DialogContent>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nombre Tema</TableCell>
                      <TableCell>Medio</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Duración</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Calidad</TableCell>
                  
                    <TableCell>Fecha Creación</TableCell>
                    <TableCell>Fecha Modificación</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingTemas ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center">
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : temasFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center">
                        No se encontraron temas
                      </TableCell>
                    </TableRow>
                  ) : (
                    temasFiltrados.map((tema) => (
                      <TableRow 
                        key={tema.id_tema}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleSeleccionarTema(tema)}
                      >
                        <TableCell>{tema.id_tema}</TableCell>
                        <TableCell>{tema.nombre_tema || tema.NombreTema}</TableCell>
                        <TableCell>
                          {tema.Medios?.nombredelmedio || tema.Medios?.NombredelMedio || 'N/A'}
                        </TableCell>
                        <TableCell>{tema.descripcion}</TableCell>
                        <TableCell>{formatDuracion(tema.duracion || tema.Duracion)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={tema.estado || 'N/A'} 
                            color={tema.estado === 'Activo' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {tema.Calidad?.nombrecalidad || 'N/A'}
                        </TableCell>
                       
                        <TableCell>{new Date(tema.fecha_creacion).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(tema.fecha_modificacion).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSeleccionarTema(tema);
                            }}
                            color="primary"
                            title="Seleccionar"
                          >
                            <CheckIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
        </Dialog>

        <Dialog 
    open={openSoportesModal} 
    onClose={handleCloseSoportesModal}
    maxWidth="md"
    fullWidth
  >
    <DialogTitle>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h6">Seleccionar Soporte</Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddSoporteModal}
            size="small"
            sx={{ mr: 1 }}
          >
            Nuevo Soporte
          </Button>
          <IconButton onClick={handleCloseSoportesModal} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      <TextField
        label="Buscar Soporte"
        variant="outlined"
        fullWidth
        value={searchSoporte}
        onChange={(e) => handleSearchSoporte(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }}
        size="small"
      />
      {contratoSeleccionado && contratoSeleccionado.medio && (
        <Typography variant="subtitle2" color="primary" sx={{ mt: 1 }}>
          Filtrando soportes para el medio: {contratoSeleccionado.medio.nombredelmedio}
        </Typography>
      )}
    </DialogTitle>
    <DialogContent>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Bonificación Año</TableCell>
              <TableCell>Escala</TableCell>
              <TableCell>Medios</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingSoportes ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : (soportesFiltrados.length > 0 ? soportesFiltrados : soportes).length > 0 ? (
              (soportesFiltrados.length > 0 ? soportesFiltrados : soportes).map((soporte) => (
                <TableRow key={soporte.id_soporte}>
                  <TableCell>{soporte.id_soporte}</TableCell>
                  <TableCell>{soporte.nombreidentificador}</TableCell>
                  <TableCell>{soporte.bonificacionano}</TableCell>
                  <TableCell>{soporte.escala}</TableCell>
                  <TableCell>{soporte.Medios}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleSeleccionarSoporte(soporte)}
                      title="Seleccionar"
                    >
                      <CheckIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {contratoSeleccionado && contratoSeleccionado.medio ? 
                    `No hay soportes para el medio "${contratoSeleccionado.medio.nombredelmedio}"` : 
                    "No se encontraron soportes"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </DialogContent>
  </Dialog>

  {/* Agregar el modal para crear un nuevo soporte */}
  {/* Modificar el modal para crear un nuevo soporte */}
  <Dialog
    open={openAddSoporteModal}
    onClose={handleCloseAddSoporteModal}
    maxWidth="sm"
    fullWidth
  >
    <DialogTitle>
      Nuevo Soporte
      <IconButton
        aria-label="close"
        onClick={handleCloseAddSoporteModal}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent>
      <Box sx={{ mt: 2 }}>
        <TextField
          label="Nombre del Soporte"
          fullWidth
          value={nuevoSoporte.nombreidentificador}
          onChange={(e) => setNuevoSoporte({ ...nuevoSoporte, nombreidentificador: e.target.value })}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          label="Bonificación Año"
          fullWidth
          type="number"
          value={nuevoSoporte.bonificacionano}
          onChange={(e) => setNuevoSoporte({ ...nuevoSoporte, bonificacionano: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Escala"
          fullWidth
          type="number"
          value={nuevoSoporte.escala}
          onChange={(e) => setNuevoSoporte({ ...nuevoSoporte, escala: e.target.value })}
          sx={{ mb: 2 }}
        />
        
        {/* Modificar el selector de medios para que esté bloqueado si hay un medio en el contrato */}
        {contratoSeleccionado && contratoSeleccionado.medio ? (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="medios-select-label">Medio</InputLabel>
            <Select
              labelId="medios-select-label"
              value={[contratoSeleccionado.medio.id]}
              input={<OutlinedInput label="Medio" />}
              disabled={true}
              renderValue={() => contratoSeleccionado.medio.nombredelmedio}
            >
              <MenuItem value={contratoSeleccionado.medio.id}>
                {contratoSeleccionado.medio.nombredelmedio}
              </MenuItem>
            </Select>
            <FormHelperText>
              El medio está preseleccionado según el contrato y no puede ser modificado
            </FormHelperText>
          </FormControl>
        ) : (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="medios-select-label">Medios</InputLabel>
            <Select
              labelId="medios-select-label"
              multiple
              value={nuevoSoporte.medios}
              onChange={(e) => setNuevoSoporte({ ...nuevoSoporte, medios: e.target.value })}
              input={<OutlinedInput label="Medios" />}
              renderValue={(selected) => {
                const selectedMedios = mediosOptions.filter(medio => selected.includes(medio.id));
                return selectedMedios.map(medio => medio.nombredelmedio).join(', ');
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 224,
                    width: 250,
                  },
                },
              }}
            >
              {loadingMedios ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : (
                mediosOptions.map((medio) => (
                  <MenuItem key={medio.id} value={medio.id}>
                    <Checkbox checked={nuevoSoporte.medios.indexOf(medio.id) > -1} />
                    <ListItemText primary={medio.nombredelmedio} />
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        )}
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleCloseAddSoporteModal}>Cancelar</Button>
      <Button onClick={handleSaveSoporte} variant="contained" color="primary">
        Guardar
      </Button>
    </DialogActions>
  </Dialog>

        <Dialog 
          open={openProgramasModal} 
          onClose={handleCloseProgramasModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="h6">Seleccionar Programa</Typography>
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenAddEditProgramaModal()}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  Nuevo Programa
                </Button>
                <IconButton onClick={handleCloseProgramasModal} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar programa..."
              value={searchPrograma}
              onChange={(e) => {
                setSearchPrograma(e.target.value);
                handleSearchPrograma(e.target.value);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              size="small"
            />
          </DialogTitle>

          <DialogContent>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Código Programa</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Hora Inicio</TableCell>
                    <TableCell>Hora Fin</TableCell>
                    <TableCell>Cód. Prog. Megatime</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingProgramas ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : programasFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No se encontraron programas
                      </TableCell>
                    </TableRow>
                  ) : (
                    programasFiltrados.map((programa) => (
                      <TableRow 
                        key={programa.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleSeleccionarPrograma(programa)}
                      >
                        <TableCell>{programa.id}</TableCell>
                        <TableCell>{programa.codigo_programa}</TableCell>
                        <TableCell>{programa.descripcion}</TableCell>
                        <TableCell>{programa.hora_inicio}</TableCell>
                        <TableCell>{programa.hora_fin}</TableCell>
                        <TableCell>{programa.cod_prog_megatime}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSeleccionarPrograma(programa);
                            }}
                            color="primary"
                            title="Seleccionar"
                          >
                            <CheckIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
        </Dialog>

        <Dialog 
          open={openClasificacionModal} 
          onClose={handleCloseClasificacionModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="h6">Seleccionar Clasificación</Typography>
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenAddEditClasificacionModal()}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  Nueva Clasificación
                </Button>
                <IconButton onClick={handleCloseClasificacionModal} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar clasificación..."
                value={searchClasificacion}
                onChange={(e) => {
                  setSearchClasificacion(e.target.value);
                  handleSearchClasificacion(e.target.value);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                size="small"
              />
            </Box>
          </DialogTitle>

          <DialogContent>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nombre Clasificación</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingClasificaciones ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : clasificacionesList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No se encontraron clasificaciones
                      </TableCell>
                    </TableRow>
                  ) : (
                    clasificacionesList.map((clasificacion) => (
                      <TableRow 
                        key={clasificacion.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleSeleccionarClasificacion(clasificacion)}
                      >
                        <TableCell>{clasificacion.id}</TableCell>
                        <TableCell>{clasificacion.NombreClasificacion}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAddEditClasificacionModal(clasificacion);
                            }}
                            color="primary"
                            title="Editar"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSeleccionarClasificacion(clasificacion);
                            }}
                            color="primary"
                            title="Seleccionar"
                          >
                            <CheckIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
        </Dialog>

        <Dialog
          open={openAddEditClasificacionModal}
          onClose={handleCloseAddEditClasificacionModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingClasificacion ? 'Editar' : 'Agregar'} Clasificación
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Nombre Clasificación"
                value={nuevaClasificacion.NombreClasificacion}
                onChange={(e) => setNuevaClasificacion(prev => ({
                  ...prev,
                  NombreClasificacion: e.target.value
                }))}
                margin="normal"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddEditClasificacionModal}>
              Cancelar
            </Button>
            <Button onClick={handleSaveClasificacion} variant="contained" color="primary">
              Guardar
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog 
          open={openAddContratoModal} 
          onClose={handleCloseAddContratoModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Agregar Contrato
            <IconButton
              aria-label="close"
              onClick={handleCloseAddContratoModal}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <ModalAgregarContrato 
              open={openAddContratoModal}
              onClose={handleCloseAddContratoModal}
              onContratoAdded={() => {
                handleCloseAddContratoModal();
                handleSearchContrato();
              }}
              clienteId={clienteId} 
              clienteNombre={planInfo.cliente} 
              disableClienteSelect={true} 
            />
          </DialogContent>
        </Dialog>

        <Dialog 
          open={openEditContratoModal} 
          onClose={handleCloseEditContratoModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Modificar Contrato
            <IconButton
              aria-label="close"
              onClick={handleCloseEditContratoModal}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {contratoSeleccionado && (
              <ModalEditarContrato 
                open={openEditContratoModal}
                onClose={handleCloseEditContratoModal}
                contrato={contratoSeleccionado}
                onContratoUpdated={() => {
                  handleCloseEditContratoModal();
                  handleSearchContrato();
                }}
                clienteId={clienteId}
                clienteNombre={planInfo.cliente}
                disableClienteSelect={true}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog 
          open={openAddTemaModal} 
          onClose={handleCloseAddTemaModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Agregar Tema
            <IconButton
              aria-label="close"
              onClick={handleCloseAddTemaModal}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
          <ModalAgregarTema
  open={openAddTemaModal}
  onClose={handleCloseAddTemaModal}
  onTemaAdded={handleTemaAdded}
  idCampania={campaniaId}
  medioId={contratoSeleccionado?.IdMedios}
  medioNombre={contratoSeleccionado?.medio?.nombredelmedio}
/>
          </DialogContent>
        </Dialog>

        <Dialog
          open={openAddEditProgramaModal}
          onClose={handleCloseAddEditProgramaModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingPrograma ? 'Editar Programa' : 'Nuevo Programa'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Descripción"
                fullWidth
                value={newPrograma.descripcion}
                onChange={(e) => setNewPrograma({ ...newPrograma, descripcion: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                label="Código Programa"
                fullWidth
                value={newPrograma.codigo_programa}
                onChange={(e) => setNewPrograma({ ...newPrograma, codigo_programa: e.target.value })}
                sx={{ mb: 2, mt: '10px' }}
              />
        
                  {/* Hora de inicio - Reemplazar el campo actual por dos selects */}
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
                value={newPrograma.hora_inicio_hora || ""}
                onChange={(e) => {
                  const horaValue = e.target.value;
                  const minValue = newPrograma.hora_inicio_min || "00";
                  setNewPrograma({
                    ...newPrograma, 
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
      value={newPrograma.hora_inicio_min || ""}
      onChange={(e) => {
        const minValue = e.target.value;
        const horaValue = newPrograma.hora_inicio_hora || "00";
        setNewPrograma({
          ...newPrograma, 
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
      
      {/* Hora fin - Reemplazar el campo actual por dos selects */}
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
                value={newPrograma.hora_fin_hora || ""}
                onChange={(e) => {
                  const horaValue = e.target.value;
                  const minValue = newPrograma.hora_fin_min || "00";
                  setNewPrograma({
                    ...newPrograma, 
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
      value={newPrograma.hora_fin_min || ""}
      onChange={(e) => {
        const minValue = e.target.value;
        const horaValue = newPrograma.hora_fin_hora || "00";
        setNewPrograma({
          ...newPrograma, 
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
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddEditProgramaModal}>Cancelar</Button>
            <Button onClick={handleSavePrograma} variant="contained" color="primary">
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Alternativas;
