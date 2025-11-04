import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import clientScoringService from '../../services/clientScoringService';
import {
  Button,
  Container,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  InputAdornment,
  Breadcrumbs,
  Link,
  Typography,
  FormControl,
  InputLabel,
  Select,
  Switch,
  Chip,
  Card,
  CardContent,
  Box,
  LinearProgress,
  Tooltip,
  CircularProgress,
  useMediaQuery,
  Fab,
  Avatar,
  CardActions,
  Collapse,
  Pagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import GroupsIcon from '@mui/icons-material/Groups';
import BadgeIcon from '@mui/icons-material/Badge';
import CategoryIcon from '@mui/icons-material/Category';
import NumbersIcon from '@mui/icons-material/Numbers';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ApartmentIcon from '@mui/icons-material/Apartment';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import PhoneIcon from '@mui/icons-material/Phone';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import FormControlLabel from '@mui/material/FormControlLabel';
import { supabase } from '../../config/supabase';
import { mapearDatos } from '../../config/mapeo-campos';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import './Clientes.css';
import MobileLayout from '../../components/mobile/MobileLayout';
import MobileTable from '../../components/mobile/MobileTable';

// Constantes para mejor mantenibilidad
const ESTADOS_CLIENTE = {
  ACTIVO: true,
  INACTIVO: false
};

const CAMPOS_REQUERIDOS = [
  'nombreCliente',
  'RUT'
];

// Funciones de utilidad regulares (no useCallback fuera del componente)
const formatRut = (rut) => {
  if (!rut) return '';
  
  // Remover cualquier caracter que no sea número o K
  rut = rut.replace(/[^\dKk]/g, '');
  
  // Obtener el dígito verificador
  const dv = rut.slice(-1);
  // Obtener el cuerpo del RUT
  const rutBody = rut.slice(0, -1);
  
  // Formatear el cuerpo del RUT con puntos
  let formattedRut = '';
  for (let i = rutBody.length - 1, j = 0; i >= 0; i--, j++) {
    formattedRut = rutBody[i] + formattedRut;
    if (j === 2 && i !== 0) {
      formattedRut = '.' + formattedRut;
    }
    if (j === 5 && i !== 0) {
      formattedRut = '.' + formattedRut;
    }
  }
  
  // Retornar RUT formateado con guión y dígito verificador
  return `${formattedRut}-${dv}`;
};

const validateRutRepresentante = (rut) => {
  if (!rut) return true; // No es obligatorio
  
  // Remover puntos y guión
  rut = rut.replace(/\./g, '').replace(/-/g, '');
  
  // Validar formato
  if (!/^\d{7,8}[0-9Kk]$/.test(rut)) {
    return false;
  }
  
  // Validar dígito verificador
  const rutDigits = rut.slice(0, -1);
  const dv = rut.slice(-1).toUpperCase();
  
  let sum = 0;
  let multiplier = 2;
  
  // Calcular suma ponderada
  for (let i = rutDigits.length - 1; i >= 0; i--) {
    sum += parseInt(rutDigits[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  // Calcular dígito verificador esperado
  const expectedDV = 11 - (sum % 11);
  const expectedDVStr = expectedDV === 11 ? '0' : expectedDV === 10 ? 'K' : expectedDV.toString();
  
  return dv === expectedDVStr;
};

const validatePhoneNumber = (phone) => {
  if (!phone) return true; // No es obligatorio
  // Validar formato de teléfono chileno (puede ser fijo o celular)
  return /^(\+?56|0)?(\s?)(2|9)(\s?)[0-9]{8}$/.test(phone);
};

const Clientes = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Estados principales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [mobilePage, setMobilePage] = useState(1);
  
  // Estado para paginación
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0
  });
  
  // Forzar que siempre sea 10 por página
  const handlePaginationChange = (newModel) => {
    const forcedModel = {
      ...newModel,
      pageSize: 10
    };
    console.log('📄 Forzando paginación a 10:', forcedModel);
    setPaginationModel(forcedModel);
  };
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    searchTerm: '',
    startDate: '',
    endDate: ''
  });
  
  
  // Estados de modales
  const [modales, setModales] = useState({
    agregar: false,
    editar: false
  });
  
  // Estados de datos relacionados
  const [datosRelacionados, setDatosRelacionados] = useState({
    tiposCliente: {},
    regiones: {},
    comunas: {},
    grupos: {},
    comunasFiltradas: {}
  });
  
  // Estados de formularios
  const [selectedClient, setSelectedClient] = useState(null);
  const [newClient, setNewClient] = useState({
    nombreCliente: '',
    nombreFantasia: '',
    grupo: '',
    razonSocial: '',
    id_tipoCliente: '',
    RUT: '',
    id_region: '',
    id_comuna: '',
    estado: ESTADOS_CLIENTE.ACTIVO,
    giro: '',
    direccionEmpresa: '',
    nombreRepresentanteLegal: '',
    apellidoRepresentante: '',
    RUT_representante: '',
    telCelular: '',
    telFijo: '',
    email: '',
    web_cliente: ''
  });
  
  const [errors, setErrors] = useState({
    RUT_representante: '',
    telCelular: '',
    telFijo: '',
    RUT_representante_edit: '',
    telCelular_edit: '',
    telFijo_edit: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    fetchData();
  }, []);

  // Actualizar datos filtrados cuando cambian los filtros o los datos
  useEffect(() => {
    // La función filterData ahora está integrada en filteredRows (useMemo)
  }, [filtros.searchTerm, filtros.startDate, filtros.endDate, rows]);

  // Actualizar comunas filtradas cuando cambia la región del cliente seleccionado
  useEffect(() => {
    if (selectedClient?.id_region) {
      const comunasDeRegion = Object.entries(datosRelacionados.comunas)
        .filter(([_, comuna]) => comuna.id_region === parseInt(selectedClient.id_region))
        .sort(([_, a], [__, b]) => a.nombrecomuna.localeCompare(b.nombrecomuna, 'es', { sensitivity: 'base' }))
        .reduce((acc, [id, comuna]) => {
          acc[id] = comuna.nombrecomuna;
          return acc;
        }, {});
      
      setDatosRelacionados(prev => ({
        ...prev,
        comunasFiltradas: comunasDeRegion
      }));
      
      // Si la comuna actual no pertenece a la región seleccionada, la limpiamos
      if (selectedClient.id_comuna && !comunasDeRegion[selectedClient.id_comuna]) {
        setSelectedClient(prev => ({ ...prev, id_comuna: '' }));
      }
    } else {
      setDatosRelacionados(prev => ({
        ...prev,
        comunasFiltradas: {}
      }));
    }
  }, [selectedClient?.id_region, datosRelacionados.comunas]);

  // Función principal para obtener datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      
      const [
        { data: clientesData, error: clientesError },
        { data: tiposClienteData, error: tiposClienteError },
        { data: regionesData, error: regionesError },
        { data: comunasData, error: comunasError },
        { data: gruposData, error: gruposError }
      ] = await Promise.all([
        supabase.from('clientes').select('*'),
        supabase.from('tipocliente').select('*'),
        supabase.from('region').select('*'),
        supabase.from('comunas').select('*'),
        supabase.from('grupos').select('*')
      ]);


      if (clientesError) throw clientesError;
      if (tiposClienteError) throw tiposClienteError;
      if (regionesError) throw regionesError;
      if (comunasError) throw comunasError;
      if (gruposError) throw gruposError;

      // Procesar datos relacionados
      const tiposClienteMap = tiposClienteData.reduce((acc, tipo) => {
        acc[tipo.id_tyipoCliente] = tipo;
        return acc;
      }, {});

      const regionesMap = regionesData.reduce((acc, region) => {
        acc[region.id] = region.nombreregion;
        return acc;
      }, {});

      const gruposMap = gruposData.reduce((acc, grupo) => {
        acc[grupo.id_grupo] = grupo.nombre_grupo;
        return acc;
      }, {});

      const comunasMap = comunasData.reduce((acc, comuna) => {
        acc[comuna.id] = {
          nombrecomuna: comuna.nombrecomuna,
          id_region: comuna.id_region
        };
        return acc;
      }, {});

      // Normalizar datos de clientes
      const transformedData = (clientesData || []).map(cliente => ({
        id: cliente.id_cliente,
        id_cliente: cliente.id_cliente,
        _created_at: cliente.created_at,
        fechaIngreso: cliente.created_at ? new Date(cliente.created_at).toLocaleDateString('es-CL', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : '',
        nombreCliente: cliente.nombrecliente || '',
        nombreFantasia: cliente.nombrefantasia || '',
        grupo: gruposMap[cliente.id_grupo] || 'No especificado',
        id_grupo: cliente.id_grupo,
        razonSocial: cliente.razonsocial || '',
        tipoCliente: tiposClienteMap[cliente.id_tipocliente]?.nombretipocliente || 'No especificado',
        rutEmpresa: cliente.rut || '',
        region: regionesMap[cliente.id_region] || 'No especificada',
        comuna: comunasMap[cliente.id_comuna]?.nombrecomuna || 'No especificada',
        estado: cliente.estado ?? ESTADOS_CLIENTE.ACTIVO
      }));

      setRows(transformedData);
      setDatosRelacionados({
        tiposCliente: tiposClienteMap,
        regiones: regionesMap,
        comunas: comunasMap,
        grupos: gruposMap,
        comunasFiltradas: comunasMap
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
      setRows([]); // Asegurar que rows sea un array vacío
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los datos de clientes'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Función de filtrado memoizada
  const filteredRows = useMemo(() => {
    let filtered = [...rows];

    // Filtrar por término de búsqueda
    if (filtros.searchTerm) {
      const searchTermLower = filtros.searchTerm.toLowerCase();
      filtered = filtered.filter(row =>
        row.nombreCliente?.toLowerCase().includes(searchTermLower) ||
        row.nombreFantasia?.toLowerCase().includes(searchTermLower) ||
        row.razonSocial?.toLowerCase().includes(searchTermLower) ||
        row.rutEmpresa?.toLowerCase().includes(searchTermLower) ||
        row.grupo?.toLowerCase().includes(searchTermLower)
      );
    }

    // Filtrar por rango de fechas
    if (filtros.startDate || filtros.endDate) {
      filtered = filtered.filter(row => {
        // Si no hay fecha de creación, incluir el registro (no filtrar por fechas)
        if (!row._created_at) {
          return true;
        }
        
        const clientDate = new Date(row._created_at);
        
        // Si la fecha es inválida, incluir el registro (no filtrar por fechas)
        if (isNaN(clientDate.getTime())) {
          return true;
        }
        
        const start = filtros.startDate ? new Date(filtros.startDate) : null;
        const end = filtros.endDate ? new Date(filtros.endDate) : null;

        if (start && !end) {
          return clientDate >= start;
        }
        if (!start && end) {
          return clientDate <= end;
        }
        if (start && end) {
          return clientDate >= start && clientDate <= end;
        }
        return true;
      });
    }

    return filtered;
  }, [rows, filtros]);

  // Manejadores de eventos optimizados
  const handleFiltroChange = useCallback((campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  }, []);

  const handleModalChange = useCallback((modal, valor) => {
    setModales(prev => ({
      ...prev,
      [modal]: valor
    }));
  }, []);

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    
    if (name === 'RUT_representante') {
      const formattedRut = formatRut(value);
      setNewClient(prev => ({ ...prev, [name]: formattedRut }));
      
      // Validar RUT del representante
      if (!validateRutRepresentante(value)) {
        setErrors(prev => ({ ...prev, RUT_representante: 'RUT del representante inválido' }));
      } else {
        setErrors(prev => ({ ...prev, RUT_representante: '' }));
      }
    } else if (name === 'telCelular') {
      setNewClient(prev => ({ ...prev, [name]: value }));
      if (!validatePhoneNumber(value) && value !== '') {
        setErrors(prev => ({ ...prev, telCelular: 'Número de celular inválido' }));
      } else {
        setErrors(prev => ({ ...prev, telCelular: '' }));
      }
    } else if (name === 'telFijo') {
      setNewClient(prev => ({ ...prev, [name]: value }));
      if (!validatePhoneNumber(value) && value !== '') {
        setErrors(prev => ({ ...prev, telFijo: 'Número de teléfono fijo inválido' }));
      } else {
        setErrors(prev => ({ ...prev, telFijo: '' }));
      }
    } else {
      setNewClient(prev => ({ ...prev, [name]: value }));
    }
  }, [formatRut, validateRutRepresentante, validatePhoneNumber]);

  const handleEditInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setSelectedClient(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleOpenModal = useCallback(() => {
    handleModalChange('agregar', true);
  }, [handleModalChange]);


  const getTrendIcon = (value) => {
    if (value > 0) return <TrendingUpIcon sx={{ color: 'green', fontSize: 16 }} />;
    if (value < 0) return <TrendingDownIcon sx={{ color: 'red', fontSize: 16 }} />;
    return null;
  };

  const handleCloseModal = useCallback(() => {
    handleModalChange('agregar', false);
    setNewClient({
      nombreCliente: '',
      nombreFantasia: '',
      grupo: '',
      razonSocial: '',
      id_tipoCliente: '',
      RUT: '',
      id_region: '',
      id_comuna: '',
      estado: ESTADOS_CLIENTE.ACTIVO,
      giro: '',
      direccionEmpresa: '',
      nombreRepresentanteLegal: '',
      apellidoRepresentante: '',
      RUT_representante: '',
      telCelular: '',
      telFijo: '',
      email: '',
      web_cliente: ''
    });
  }, [handleModalChange]);

  const handleOpenEditModal = useCallback(async (client) => {
    try {
      // Obtener los datos completos del cliente
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id_cliente', client.id_cliente)
        .single();

      if (clienteError) throw clienteError;

      // Normalizar datos del cliente
      const clienteNormalizado = {
        ...clienteData,
        id_cliente: clienteData.id_cliente,
        nombreCliente: clienteData.nombrecliente || '',
        nombreFantasia: clienteData.nombrefantasia || '',
        grupo: clienteData.grupo || '',
        id_grupo: clienteData.id_grupo || '',
        razonSocial: clienteData.razonsocial || '',
        id_tipoCliente: clienteData.id_tipocliente || '',
        RUT: clienteData.rut || '',
        id_region: clienteData.id_region || '',
        id_comuna: clienteData.id_comuna || '',
        estado: clienteData.estado ?? ESTADOS_CLIENTE.ACTIVO,
        giro: clienteData.giro || '',
        direccionEmpresa: clienteData.direccion || '',
        nombreRepresentanteLegal: clienteData.nombreRepresentanteLegal || '',
        apellidoRepresentante: clienteData.apellidoRepresentante || '',
        RUT_representante: clienteData.rut_representante || '',
        telCelular: clienteData.telcelular || '',
        telFijo: clienteData.telfijo || '',
        email: clienteData.email || '',
        web_cliente: clienteData.web_cliente || ''
      };

      setSelectedClient(clienteNormalizado);
      handleModalChange('editar', true);
    } catch (error) {
      console.error('Error al cargar datos para edición:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar los datos para edición'
      });
    }
  }, [handleModalChange]);

  const handleCloseEditModal = useCallback(() => {
    handleModalChange('editar', false);
    setSelectedClient(null);
  }, [handleModalChange]);

  const handleSubmit = useCallback(async () => {
    if (errors.RUT_representante || errors.telCelular || errors.telFijo) {
      await Swal.fire({
        icon: 'error',
        title: 'Error de Validación',
        text: 'Por favor, ingrese información válida',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([{
          nombrecliente: newClient.nombreCliente,
          nombrefantasia: newClient.nombreFantasia,
          grupo: newClient.grupo,
          razonsocial: newClient.razonSocial,
          id_tipocliente: newClient.id_tipoCliente,
          rut: newClient.RUT,
          id_region: newClient.id_region,
          id_comuna: newClient.id_comuna,
          estado: newClient.estado,
          giro: newClient.giro,
          direccion: newClient.direccionEmpresa,
          nombreRepresentanteLegal: newClient.nombreRepresentanteLegal,
          apellidoRepresentante: newClient.apellidoRepresentante,
          rut_representante: newClient.RUT_representante,
          telcelular: newClient.telCelular,
          telfijo: newClient.telFijo,
          email: newClient.email,
          web_cliente: newClient.web_cliente
        }]);

      if (error) throw error;

      await fetchData();
      handleCloseModal();
      
      await Swal.fire({
        icon: 'success',
        title: '¡Cliente Agregado!',
        text: 'El cliente ha sido agregado exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error adding client:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo agregar el cliente'
      });
    }
  }, [errors, newClient, fetchData, handleCloseModal]);

  const handleEditSubmit = useCallback(async () => {
    try {
      if (!selectedClient || !selectedClient.id_cliente) {
        throw new Error('No hay cliente seleccionado');
      }

      // Validar campos requeridos
      if (!selectedClient.nombreCliente || !selectedClient.RUT) {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Por favor complete los campos obligatorios'
        });
        return;
      }

      // Preparar los datos para la actualización
      const updateData = {
        nombrecliente: selectedClient.nombreCliente,
        nombrefantasia: selectedClient.nombreFantasia || null,
        id_grupo: selectedClient.id_grupo || null,
        razonsocial: selectedClient.razonSocial || null,
        id_tipocliente: selectedClient.id_tipoCliente || null,
        rut: selectedClient.RUT,
        id_region: selectedClient.id_region || null,
        id_comuna: selectedClient.id_comuna || null,
        estado: selectedClient.estado,
        giro: selectedClient.giro || null,
        direccion: selectedClient.direccionEmpresa || null,
        nombreRepresentanteLegal: selectedClient.nombreRepresentanteLegal || null,
        apellidoRepresentante: selectedClient.apellidoRepresentante || null,
        rut_representante: selectedClient.RUT_representante || null,
        telcelular: selectedClient.telCelular || null,
        telfijo: selectedClient.telFijo || null,
        email: selectedClient.email || null,
        web_cliente: selectedClient.web_cliente || null
      };

      // Remover campos con valor vacío
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === undefined || updateData[key] === '') {
          delete updateData[key];
        }
      });

      const { error: updateError } = await supabase
        .from('clientes')
        .update(updateData)
        .eq('id_cliente', selectedClient.id_cliente);

      if (updateError) {
        console.error('Error al actualizar:', updateError);
        throw updateError;
      }

      // Actualizar la tabla
      const { data: updatedClient, error: fetchError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id_cliente', selectedClient.id_cliente)
        .single();

      if (fetchError) throw fetchError;

      // Actualizar el estado local
      setRows(prevRows => 
        prevRows.map(row => 
          row.id_cliente === selectedClient.id_cliente 
            ? {
                ...row,
                ...updatedClient,
                grupo: datosRelacionados.grupos[updatedClient.id_grupo] || 'No especificado',
                region: datosRelacionados.regiones[updatedClient.id_region] || 'No especificada',
                comuna: datosRelacionados.comunas[updatedClient.id_comuna]?.nombrecomuna || 'No especificada'
              }
            : row
        )
      );

      handleCloseEditModal();

      setTimeout(async () => {
        await Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Cliente actualizado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      }, 100);

    } catch (error) {
      console.error('Error en handleEditSubmit:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el cliente'
      });
    }
  }, [selectedClient, datosRelacionados, handleCloseEditModal]);

  const handleEstadoChange = useCallback(async (clienteId, newValue) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .update({ estado: newValue })
        .eq('id_cliente', clienteId);

      if (error) throw error;

      // Actualizar el estado local
      setRows(rows.map(cliente => 
        cliente.id_cliente === clienteId ? { ...cliente, estado: newValue } : cliente
      ));

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
  }, [rows]);

  const exportToExcel = useCallback(() => {
    try {
      const dataToExport = filteredRows.map(row => ({
        'ID': row.id,
        'Fecha de Ingreso': row.fechaIngreso,
        'Nombre Cliente': row.nombreCliente,
        'Nombre de Fantasía': row.nombreFantasia,
        'Grupo': row.grupo,
        'Razón Social': row.razonSocial,
        'Tipo de Cliente': row.tipoCliente,
        'RUT': row.rutEmpresa,
        'Región': row.region,
        'Comuna': row.comuna || 'No especificada',
        'Estado': row.estado ? 'Activo' : 'Inactivo'
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dataToExport);

      const colWidths = [
        { wch: 10 }, // ID
        { wch: 15 }, // Fecha
        { wch: 30 }, // Nombre
        { wch: 30 }, // Fantasía
        { wch: 20 }, // Grupo
        { wch: 30 }, // Razón Social
        { wch: 20 }, // Tipo
        { wch: 15 }, // RUT
        { wch: 25 }, // Región
        { wch: 20 }, // Comuna
        { wch: 10 }  // Estado
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
      
      const fileName = filtros.searchTerm || filtros.startDate || filtros.endDate ? 
        'Clientes_Filtrados.xlsx' : 
        'Todos_Los_Clientes.xlsx';
      
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo exportar el archivo Excel'
      });
    }
  }, [filteredRows, filtros]);

  // Definición de columnas memoizada
  const columns = useMemo(() => [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 50,
      headerClassName: 'data-grid-header',
    },
    { 
      field: 'fechaIngreso', 
      headerName: 'Fecha de Ingreso', 
      width: 110,
      headerClassName: 'data-grid-header',
    },
    { 
      field: 'nombreCliente', 
      headerName: 'Nombre Cliente', 
      width: 130,
      headerClassName: 'data-grid-header',
      flex: 1,
    },
    { 
      field: 'nombreFantasia', 
      headerName: 'Nombre de Fantasía', 
      width: 130,
      headerClassName: 'data-grid-header',
      flex: 1,
    },
    { 
      field: 'grupo', 
      headerName: 'Grupo', 
      width: 100,
      headerClassName: 'data-grid-header',
    },
    { 
      field: 'razonSocial', 
      headerName: 'Razón Social', 
      width: 130,
      headerClassName: 'data-grid-header',
      flex: 1,
    },
    { 
      field: 'tipoCliente', 
      headerName: 'Tipo de Cliente', 
      width: 110,
      headerClassName: 'data-grid-header',
    },
    { 
      field: 'rutEmpresa', 
      headerName: 'Rut Empresa', 
      width: 100,
      headerClassName: 'data-grid-header',
    },
    { 
      field: 'region', 
      headerName: 'Región', 
      width: 150,
      headerClassName: 'data-grid-header',
      flex: 1,
    },
    { 
      field: 'comuna', 
      headerName: 'Comuna', 
      width: 100,
      headerClassName: 'data-grid-header',
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 80,
      headerClassName: 'data-grid-header',
      renderCell: (params) => (
        <Switch
          checked={params.value}
          onChange={(e) => handleEstadoChange(params.row.id_cliente, e.target.checked)}
          size="small"
          color="primary"
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#206e43 !important',
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#206e43 !important',
            },
            '& .MuiSwitch-switchBase:not(.Mui-checked)': {
              color: '#dc3545 !important',
            },
            '& .MuiSwitch-switchBase:not(.Mui-checked) + .MuiSwitch-track': {
              backgroundColor: '#dc3545 !important',
            },
          }}
        />
      ),
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 180,
      headerClassName: 'data-grid-header',
      renderCell: (params) => (
        <div className="action-buttons">
          <IconButton
            color="primary"
            size="small"
            component={RouterLink}
            to={`/clientes/view/${params.row.id_cliente}`}
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton
            color="success"
            size="small"
            onClick={() => handleOpenEditModal(params.row)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => {
              // Aquí iría la lógica para eliminar el cliente
              console.log('Eliminar cliente:', params.row.id_cliente);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      ),
    },
  ], [handleEstadoChange, handleOpenEditModal]);

  // Manejo de estados de carga y error
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography variant="h6" color="error" gutterBottom>
          Error al cargar los datos
        </Typography>
        <Button variant="contained" onClick={fetchData}>
          Reintentar
        </Button>
      </Box>
    );
  }

  // VERSIÓN MÓVIL optimizada
  if (isMobile) {
    const mobileColumns = [
      { field: 'nombreCliente', headerName: 'Cliente', width: 200 },
      { field: 'rutEmpresa', headerName: 'RUT', width: 120 },
      { field: 'grupo', headerName: 'Grupo', width: 150 },
      { field: 'tipoCliente', headerName: 'Tipo', width: 150, hideInMobile: true },
      { field: 'region', headerName: 'Región', width: 150, hideInMobile: true },
      { field: 'comuna', headerName: 'Comuna', width: 120, hideInMobile: true },
      {
        field: 'estado',
        headerName: 'Estado',
        width: 100,
        hideInMobile: true,
        renderCell: (params) => (
          <Chip
            label={params.value ? 'Activo' : 'Inactivo'}
            color={params.value ? 'success' : 'default'}
            size="small"
          />
        )
      }
    ];

    return (
      <>
        <Box sx={{ p: 2 }}>

          {/* Barra de búsqueda móvil */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="🔍 Buscar cliente..."
              value={filtros.searchTerm}
              onChange={(e) => handleFiltroChange('searchTerm', e.target.value)}
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

          {/* Botón de filtros */}
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <Button
              variant={showFilters ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<FilterListIcon />}
              sx={{ borderRadius: '12px' }}
            >
              Filtros
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={exportToExcel}
              startIcon={<FileDownloadIcon />}
              sx={{ borderRadius: '12px' }}
            >
              Exportar
            </Button>
          </Box>

          {/* Filtros avanzados (colapsables) */}
          {showFilters && (
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
              <TextField
                type="date"
                size="small"
                label="Desde"
                value={filtros.startDate}
                onChange={(e) => handleFiltroChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
              <TextField
                type="date"
                size="small"
                label="Hasta"
                value={filtros.endDate}
                onChange={(e) => handleFiltroChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
            </Box>
          )}

          {/* Cards creativos para clientes */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
            {filteredRows.slice((mobilePage - 1) * 10, mobilePage * 10).map((cliente, index) => (
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
                    {cliente.nombreCliente?.charAt(0) || '?'}
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
                      {cliente.nombreCliente}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}>
                      <Chip
                        label={cliente.rutEmpresa || 'Sin RUT'}
                        size="small"
                        icon={<BadgeIcon />}
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

                  {/* Botones de acción */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => window.location.href = `/clientes/view/${cliente.id_cliente}`}
                      sx={{
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.2)' }
                      }}
                    >
                      <VisibilityIcon fontSize="small" sx={{ color: '#3b82f6' }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEditModal(cliente)}
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
                        Grupo
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {cliente.grupo}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        📍 Región
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {cliente.region}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        🏙️ Comuna
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {cliente.comuna}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        🏢 Tipo
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {cliente.tipoCliente}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Badge de fecha */}
                <Box sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: '8px',
                  px: 1,
                  py: 0.5
                }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>
                    📅 {cliente.fechaIngreso}
                  </Typography>
                </Box>
              </Card>
            ))}

            {/* Mensaje si no hay clientes */}
            {filteredRows.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body1" color="text.secondary">
                  No se encontraron clientes
                </Typography>
              </Box>
            )}

          </Box>

          {/* Paginación móvil */}
          {filteredRows.length > 10 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
              <Pagination
                count={Math.ceil(filteredRows.length / 10)}
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
              Mostrando {Math.min((mobilePage - 1) * 10 + 1, filteredRows.length)}-{Math.min(mobilePage * 10, filteredRows.length)} de {filteredRows.length} cliente{filteredRows.length !== 1 ? 's' : ''}
            </Typography>
          </Box>

          {/* FAB para agregar cliente */}
          <Fab
            color="primary"
            aria-label="add"
            onClick={handleOpenModal}
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

        {/* Modales (compartidos entre móvil y escritorio) */}
        {/* Modal para agregar cliente */}
        <Dialog open={modales.agregar} onClose={handleCloseModal} maxWidth="md" fullWidth>
          <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Información básica del cliente */}
              <Grid item xs={12} md={6}>
                <TextField
                  name="nombreCliente"
                  label="Nombre Cliente *"
                  value={newClient.nombreCliente}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="nombreFantasia"
                  label="Nombre de Fantasía"
                  value={newClient.nombreFantasia}
                  onChange={handleInputChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Grupo y Razón Social */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Grupo</InputLabel>
                  <Select
                    name="id_grupo"
                    value={newClient.id_grupo || ''}
                    onChange={handleInputChange}
                    label="Grupo"
                  >
                    {Object.entries(datosRelacionados.grupos).map(([id, nombre]) => (
                      <MenuItem key={id} value={id}>
                        {nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="razonSocial"
                  label="Razón Social"
                  value={newClient.razonSocial}
                  onChange={handleInputChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <StorefrontIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Tipo de cliente y RUT */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Cliente</InputLabel>
                  <Select
                    name="id_tipoCliente"
                    value={newClient.id_tipoCliente || ''}
                    onChange={handleInputChange}
                    label="Tipo de Cliente"
                  >
                    {Object.entries(datosRelacionados.tiposCliente).map(([id, tipo]) => (
                      <MenuItem key={id} value={id}>
                        {tipo.nombreTipoCliente}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="RUT"
                  label="RUT Empresa *"
                  value={newClient.RUT}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Región y Comuna */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Región</InputLabel>
                  <Select
                    name="id_region"
                    value={newClient.id_region || ''}
                    onChange={handleInputChange}
                    label="Región"
                  >
                    {Object.entries(datosRelacionados.regiones).map(([id, nombre]) => (
                      <MenuItem key={id} value={id}>
                        {nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Comuna</InputLabel>
                  <Select
                    name="id_comuna"
                    value={newClient.id_comuna || ''}
                    onChange={handleInputChange}
                    label="Comuna"
                    disabled={!newClient.id_region}
                  >
                    {Object.entries(datosRelacionados.comunasFiltradas).map(([id, comuna]) => (
                      <MenuItem key={id} value={id}>
                        {comuna.nombrecomuna}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Giro y Dirección */}
              <Grid item xs={12} md={6}>
                <TextField
                  name="giro"
                  label="Giro"
                  value={newClient.giro}
                  onChange={handleInputChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CategoryIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="direccionEmpresa"
                  label="Dirección Empresa"
                  value={newClient.direccionEmpresa}
                  onChange={handleInputChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Representante Legal */}
              <Grid item xs={12} md={6}>
                <TextField
                  name="nombreRepresentanteLegal"
                  label="Nombre Representante Legal"
                  value={newClient.nombreRepresentanteLegal}
                  onChange={handleInputChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="apellidoRepresentante"
                  label="Apellido Representante"
                  value={newClient.apellidoRepresentante}
                  onChange={handleInputChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* RUT Representante */}
              <Grid item xs={12} md={6}>
                <TextField
                  name="RUT_representante"
                  label="RUT Representante Legal"
                  value={newClient.RUT_representante}
                  onChange={handleInputChange}
                  fullWidth
                  error={!!errors.RUT_representante}
                  helperText={errors.RUT_representante}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Contactos */}
              <Grid item xs={12} md={6}>
                <TextField
                  name="telCelular"
                  label="Teléfono Celular"
                  value={newClient.telCelular}
                  onChange={handleInputChange}
                  fullWidth
                  error={!!errors.telCelular}
                  helperText={errors.telCelular}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneAndroidIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="telFijo"
                  label="Teléfono Fijo"
                  value={newClient.telFijo}
                  onChange={handleInputChange}
                  fullWidth
                  error={!!errors.telFijo}
                  helperText={errors.telFijo}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Email y Web */}
              <Grid item xs={12} md={6}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  value={newClient.email}
                  onChange={handleInputChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="web_cliente"
                  label="Sitio Web"
                  value={newClient.web_cliente}
                  onChange={handleInputChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LanguageIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} color="primary" variant="contained">
              Guardar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de edición (simplificado para móvil) */}
        <Dialog open={modales.editar} onClose={handleCloseEditModal} maxWidth="sm" fullWidth fullScreen={isMobile}>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Editar Cliente</Typography>
              <IconButton onClick={handleCloseEditModal}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre Cliente *"
                  name="nombreCliente"
                  value={selectedClient?.nombreCliente || ''}
                  onChange={handleEditInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="RUT Empresa *"
                  name="RUT"
                  value={selectedClient?.RUT || ''}
                  onChange={handleEditInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Región</InputLabel>
                  <Select
                    name="id_region"
                    value={selectedClient?.id_region || ''}
                    onChange={handleEditInputChange}
                    label="Región"
                  >
                    {Object.entries(datosRelacionados.regiones).map(([id, nombre]) => (
                      <MenuItem key={id} value={id}>
                        {nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Comuna</InputLabel>
                  <Select
                    name="id_comuna"
                    value={selectedClient?.id_comuna || ''}
                    onChange={handleEditInputChange}
                    label="Comuna"
                    disabled={!selectedClient?.id_region}
                  >
                    {Object.entries(datosRelacionados.comunasFiltradas).map(([id, nombre]) => (
                      <MenuItem key={id} value={id}>
                        {typeof nombre === 'object' ? nombre.nombrecomuna : nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedClient?.estado ?? true}
                      onChange={(e) => setSelectedClient(prev => ({ ...prev, estado: e.target.checked }))}
                      color="primary"
                    />
                  }
                  label="Cliente Activo"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditModal}>Cancelar</Button>
            <Button onClick={handleEditSubmit} variant="contained" color="primary">
              Guardar Cambios
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  // VERSIÓN ESCRITORIO (original)
  return (
      <div className="clientes-container animate-fade-in">
      {/* Header moderno con gradiente - Oculto en móvil */}
      {!isMobile && (
        <div className="modern-header animate-slide-down">
          <div className="modern-title" style={{ fontSize: '1rem', marginTop: '14px', lineHeight: '1' }}>
            LISTADO DE CLIENTES
          </div>
        </div>
      )}


      {/* Única fila: Campos de filtro y botones */}
      <Box sx={{ mb: 2, mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            variant="outlined"
            placeholder="🔍 Buscar cliente..."
            value={filtros.searchTerm}
            onChange={(e) => handleFiltroChange('searchTerm', e.target.value)}
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
          <TextField
            type="date"
            variant="outlined"
            value={filtros.startDate}
            onChange={(e) => handleFiltroChange('startDate', e.target.value)}
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
          <TextField
            type="date"
            variant="outlined"
            value={filtros.endDate}
            onChange={(e) => handleFiltroChange('endDate', e.target.value)}
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
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            className="btn-agregar"
            startIcon={<PersonIcon sx={{ color: 'white' }} />}
            onClick={handleOpenModal}
          >
            Agregar Nuevo Cliente
          </Button>
          <Button
            variant="contained"
            onClick={exportToExcel}
            startIcon={<FileDownloadIcon sx={{ color: 'white' }} />}
            className="btn-agregar"
          >
            Exportar Excel
          </Button>
        </Box>
      </Box>

      <div className="data-grid-container">
          {console.log('🔍 DataGrid recibiendo:', {
            totalRows: filteredRows.length,
            paginationModel,
            loading,
            firstPageRows: filteredRows.slice(0, 10).length,
            actualPage: paginationModel.page,
            pageSize: paginationModel.pageSize
          })}
          <DataGrid
            rows={filteredRows}
            columns={columns}
            loading={loading}
            disableSelectionOnClick
            autoHeight={true}
            rowHeight={56}
            columnHeaderHeight={56}
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                
              },
              '& .MuiDataGrid-row:nth-of-type(even)': {
                backgroundColor: 'rgba(102, 126, 234, 0.02)',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid rgba(102, 126, 234, 0.1) !important',
                display: 'flex !important',
                alignItems: 'center !important',
                padding: '12px 16px !important',
                minHeight: '56px !important',
                transition: 'background-color 0.2s ease !important',
              },
              '& .MuiDataGrid-row': {
                minHeight: '56px !important',
                transition: 'background-color 0.2s ease !important',
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '1px solid rgba(102, 126, 234, 0.1) !important',
                background: 'rgba(255,255,255,0.8) !important',
                '& .MuiTablePagination-root': {
                  '& .MuiTablePagination-selectLabel': {
                    display: 'none'
                  },
                  '& .MuiTablePagination-select': {
                    display: 'none'
                  },
                  '& .MuiTablePagination-selectIcon': {
                    display: 'none'
                  }
                }
              },
              '& .MuiDataGrid-virtualScroller': {
                overflowX: 'hidden !important',
              },
              border: 'none',
              borderRadius: '12px',
            }}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationChange}
            pageSizeOptions={[10]}
            hideFooterSelectedRowCount
            rowCount={filteredRows.length}
            pagination
            paginationMode="client"
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
            }}
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
          />
        </div>

      {/* Modal para agregar cliente */}
      <Dialog open={modales.agregar} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Información básica del cliente */}
            <Grid item xs={12} md={6}>
              <TextField
                name="nombreCliente"
                label="Nombre Cliente *"
                value={newClient.nombreCliente}
                onChange={handleInputChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="nombreFantasia"
                label="Nombre de Fantasía"
                value={newClient.nombreFantasia}
                onChange={handleInputChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Grupo y Razón Social */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Grupo</InputLabel>
                <Select
                  name="id_grupo"
                  value={newClient.id_grupo || ''}
                  onChange={handleInputChange}
                  label="Grupo"
                >
                  {Object.entries(datosRelacionados.grupos).map(([id, nombre]) => (
                    <MenuItem key={id} value={id}>
                      {nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="razonSocial"
                label="Razón Social"
                value={newClient.razonSocial}
                onChange={handleInputChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StorefrontIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Tipo de cliente y RUT */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Cliente</InputLabel>
                <Select
                  name="id_tipoCliente"
                  value={newClient.id_tipoCliente || ''}
                  onChange={handleInputChange}
                  label="Tipo de Cliente"
                >
                  {Object.entries(datosRelacionados.tiposCliente).map(([id, tipo]) => (
                    <MenuItem key={id} value={id}>
                      {tipo.nombreTipoCliente}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="RUT"
                label="RUT Empresa *"
                value={newClient.RUT}
                onChange={handleInputChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Región y Comuna */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Región</InputLabel>
                <Select
                  name="id_region"
                  value={newClient.id_region || ''}
                  onChange={handleInputChange}
                  label="Región"
                >
                  {Object.entries(datosRelacionados.regiones).map(([id, nombre]) => (
                    <MenuItem key={id} value={id}>
                      {nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Comuna</InputLabel>
                <Select
                  name="id_comuna"
                  value={newClient.id_comuna || ''}
                  onChange={handleInputChange}
                  label="Comuna"
                  disabled={!newClient.id_region}
                >
                  {Object.entries(datosRelacionados.comunasFiltradas).map(([id, comuna]) => (
                    <MenuItem key={id} value={id}>
                      {comuna.nombrecomuna}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Giro y Dirección */}
            <Grid item xs={12} md={6}>
              <TextField
                name="giro"
                label="Giro"
                value={newClient.giro}
                onChange={handleInputChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="direccionEmpresa"
                label="Dirección Empresa"
                value={newClient.direccionEmpresa}
                onChange={handleInputChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Representante Legal */}
            <Grid item xs={12} md={6}>
              <TextField
                name="nombreRepresentanteLegal"
                label="Nombre Representante Legal"
                value={newClient.nombreRepresentanteLegal}
                onChange={handleInputChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="apellidoRepresentante"
                label="Apellido Representante"
                value={newClient.apellidoRepresentante}
                onChange={handleInputChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* RUT Representante */}
            <Grid item xs={12} md={6}>
              <TextField
                name="RUT_representante"
                label="RUT Representante Legal"
                value={newClient.RUT_representante}
                onChange={handleInputChange}
                fullWidth
                error={!!errors.RUT_representante}
                helperText={errors.RUT_representante}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Contactos */}
            <Grid item xs={12} md={6}>
              <TextField
                name="telCelular"
                label="Teléfono Celular"
                value={newClient.telCelular}
                onChange={handleInputChange}
                fullWidth
                error={!!errors.telCelular}
                helperText={errors.telCelular}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneAndroidIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="telFijo"
                label="Teléfono Fijo"
                value={newClient.telFijo}
                onChange={handleInputChange}
                fullWidth
                error={!!errors.telFijo}
                helperText={errors.telFijo}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Email y Web */}
            <Grid item xs={12} md={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={newClient.email}
                onChange={handleInputChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="web_cliente"
                label="Sitio Web"
                value={newClient.web_cliente}
                onChange={handleInputChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LanguageIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para editar cliente - Se mantiene la estructura original pero optimizada */}
      <Dialog open={modales.editar} onClose={handleCloseEditModal} maxWidth="md" fullWidth>
        <DialogTitle>Editar Cliente</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Campos del formulario de edición - Se mantiene la estructura original */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre Cliente"
                name="nombreCliente"
                value={selectedClient?.nombreCliente || ''}
                onChange={handleEditInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* ... resto de los campos del formulario de edición ... */}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleEditSubmit} color="primary" variant="contained">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Clientes;