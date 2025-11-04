import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
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
  Box,
  Paper,
  FormControlLabel,
  CircularProgress,
  useMediaQuery,
  Fab,
  Avatar,
  Card,
  CardContent,
  Pagination,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import NumbersIcon from '@mui/icons-material/Numbers';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '../../config/supabase';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import './Agencias.css';

const Agencias = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(10);
  const [mobilePage, setMobilePage] = useState(1);
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [selectedAgencia, setSelectedAgencia] = useState(null);
  const [regiones, setRegiones] = useState({});
  const [comunas, setComunas] = useState([]);
  const [comunasFiltradas, setComunasFiltradas] = useState({});
  const [todasLasComunas, setTodasLasComunas] = useState([]);
  const [newAgencia, setNewAgencia] = useState({
    NombreIdentificador: '',
    RazonSocial: '',
    NombreDeFantasia: '',
    RutAgencia: '',
    Giro: '',
    NombreRepresentanteLegal: '',
    rutRepresentante: '',
    DireccionAgencia: '',
    Region: '',
    Comuna: '',
    telCelular: '',
    telFijo: '',
    Email: '',
    codigo_megatime: '',
    estado: true
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const validarRut = (rut) => {
    if (!rut || rut.trim() === '') return true; // Permitir campo vacío durante la edición
    
    // Limpiar el RUT de puntos y guión
    let valor = rut.replace(/\./g, '').replace(/-/g, '');
    
    // Aislar Cuerpo y Dígito Verificador
    let cuerpo = valor.slice(0, -1);
    let dv = valor.slice(-1).toUpperCase();
    
    // Si no cumple con el mínimo de dígitos, es inválido
    if (cuerpo.length < 7) return false;
    
    // Calcular Dígito Verificador esperado
    let suma = 0;
    let multiplo = 2;
    
    // Para cada dígito del Cuerpo
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += Number(cuerpo[i]) * multiplo;
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }
    
    // Calcular Dígito Verificador
    let dvEsperado = 11 - (suma % 11);
    
    // Casos Especiales
    if (dvEsperado === 11) dvEsperado = '0';
    if (dvEsperado === 10) dvEsperado = 'K';
    else dvEsperado = String(dvEsperado);
    
    // Validar que el Dígito Verificador ingresado sea igual al esperado
    return dv === dvEsperado;
  };

  const validarEmail = (email) => {
    if (!email || email.trim() === '') return true;
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(email);
  };

  const validarTelefonoCelular = (telefono) => {
    if (!telefono || telefono.trim() === '') return true;
    const re = /^(\+?56)?(\s?)(0?9)(\s?)[98765432]\d{7}$/;
    return re.test(telefono);
  };

  const validarTelefonoFijo = (telefono) => {
    if (!telefono || telefono.trim() === '') return true;
    const re = /^(\+?56)?(\s?)([2-9]\d{7,8})$/;
    return re.test(telefono);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'Region') {
      // Cuando se selecciona una región, filtrar comunas
      const comunasFiltradas = todasLasComunas
        .filter(comuna => comuna.id_region === parseInt(value))
        .sort((a, b) => a.nombrecomuna.localeCompare(b.nombrecomuna, 'es', { sensitivity: 'base' }))
        .reduce((acc, comuna) => {
          acc[comuna.id] = comuna.nombrecomuna;
          return acc;
        }, {});

      console.log('Comunas filtradas para región', value, ':', comunasFiltradas);
      setComunasFiltradas(comunasFiltradas);

      // Actualizar el estado correspondiente
      if (selectedAgencia) {
        setSelectedAgencia({
          ...selectedAgencia,
          [name]: value,
          Comuna: '' // Reset comuna cuando cambia la región
        });
      } else {
        setNewAgencia({
          ...newAgencia,
          [name]: value,
          Comuna: '' // Reset comuna cuando cambia la región
        });
      }
    } else if (name === 'Comuna') {
      // Para comuna, solo actualizar el estado
      if (selectedAgencia) {
        setSelectedAgencia({
          ...selectedAgencia,
          [name]: value
        });
      } else {
        setNewAgencia({
          ...newAgencia,
          [name]: value
        });
      }
    } else {
      // Para otros campos
      if (selectedAgencia) {
        setSelectedAgencia({
          ...selectedAgencia,
          [name]: value
        });
      } else {
        setNewAgencia({
          ...newAgencia,
          [name]: value
        });
      }
    }
  };

  const validarFormulario = (agenciaData) => {
    const newErrors = {};
    let isValid = true;

    // Validar Nombre Identificador
    const nombreIdentificador = agenciaData.NombreIdentificador || agenciaData.nombreidentificador;
    if (!nombreIdentificador?.trim()) {
      newErrors.NombreIdentificador = 'El nombre identificador es requerido';
      isValid = false;
    }

    // Validar Razón Social - Buscar en múltiples campos posibles
    const razonSocial = agenciaData.RazonSocial || agenciaData.razonsocial;
    if (!razonSocial?.trim()) {
      newErrors.RazonSocial = 'La razón social es requerida';
      isValid = false;
    }

    // Validar RUT Agencia - Solo si está presente
    const rutAgencia = agenciaData.RutAgencia || agenciaData.rutagencia;
    if (rutAgencia && rutAgencia.trim()) {
      // Validación permisiva: solo verificar longitud mínima
      if (rutAgencia.trim().length < 8) {
        newErrors.RutAgencia = 'RUT debe tener al menos 8 caracteres';
        isValid = false;
      }
    }

    // Validar RUT Representante - Solo si está presente
    const rutRepresentante = agenciaData.rutRepresentante || agenciaData.rutrepresentante;
    if (rutRepresentante && rutRepresentante.trim()) {
      // Validación permisiva: solo verificar longitud mínima
      if (rutRepresentante.trim().length < 8) {
        newErrors.rutRepresentante = 'RUT del representante debe tener al menos 8 caracteres';
        isValid = false;
      }
    }

    // Validar Email - Solo si está presente
    if (agenciaData.Email && agenciaData.Email.trim()) {
      if (!validarEmail(agenciaData.Email)) {
        newErrors.Email = 'Correo electrónico inválido';
        isValid = false;
      }
    }

    // Validar teléfonos (al menos uno debe estar presente)
    const tieneCelular = agenciaData.telCelular?.trim();
    const tieneFijo = agenciaData.telFijo?.trim();

    if (!tieneCelular && !tieneFijo) {
      newErrors.telefono = 'Se requiere al menos un número de teléfono';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchTerm, startDate, endDate, rows]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: agenciasData, error: agenciasError } = await supabase
        .from('agencias')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: regionesData, error: regionesError } = await supabase
        .from('region')
        .select('*');

      const { data: comunasData, error: comunasError } = await supabase
        .from('comunas')
        .select('*');

      if (agenciasError) throw agenciasError;
      if (regionesError) throw regionesError;
      if (comunasError) throw comunasError;

      const regionesObj = regionesData.reduce((acc, region) => {
        acc[region.id] = region.nombreregion;
        return acc;
      }, {});

      const comunasArray = comunasData.map(comuna => ({
        id: comuna.id_comuna,
        nombrecomuna: comuna.nombreComuna,
        id_region: comuna.id_region
      }));

      const comunasObj = comunasData.reduce((acc, comuna) => {
        acc[comuna.id_comuna] = {
          nombreComuna: comuna.nombreComuna,
          id_region: comuna.id_region
        };
        return acc;
      }, {});

      const transformedData = agenciasData.map(agencia => ({
        id: agencia.id,
        nombreidentificador: agencia.nombreidentificador || '',
        razonsocial: agencia.razonsocial || '',
        NombreDeFantasia: agencia.nombrefantasia || '',
        RutAgencia: agencia.rutagencia || '',
        Giro: agencia.giro || '',
        NombreRepresentanteLegal: agencia.nombrerepresentantelegal || '',
        rutRepresentante: agencia.rutrepresentante || '',
        DireccionAgencia: agencia.direccionagencia || '',
        Region: agencia.region || '',
        Comuna: agencia.comuna || '',
        region: regionesObj[agencia.region] || 'No especificada',
        comuna: comunasObj[agencia.comuna]?.nombreComuna || 'No especificada',
        telCelular: agencia.telcelular || '',
        telFijo: agencia.telfijo || '',
        Email: agencia.email || '',
        codigo_megatime: agencia.codigo_megatime || '',
        estado: agencia.estado || false,
        created_at: agencia.created_at,
        fechaCreacion: agencia.created_at ? new Date(agencia.created_at).toLocaleDateString('es-CL') : ''
      }));

      setRows(transformedData);
      setFilteredRows(transformedData);
      setRegiones(regionesObj);
      setComunas(comunasArray);
      setTodasLasComunas(comunasData);

      // Inicialmente mostramos todas las comunas filtradas y ordenadas alfabéticamente
      const comunasFiltradasObj = comunasData
        .sort((a, b) => a.nombrecomuna.localeCompare(b.nombrecomuna, 'es', { sensitivity: 'base' }))
        .reduce((acc, comuna) => {
          acc[comuna.id] = comuna.nombrecomuna;
          return acc;
        }, {});
      setComunasFiltradas(comunasFiltradasObj);

      console.log('Comunas cargadas:', comunasArray);
      console.log('Comunas filtradas iniciales:', comunasFiltradasObj);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = [...rows];

    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(row =>
        row.nombreidentificador?.toLowerCase().includes(searchTermLower) ||
        row.razonsocial?.toLowerCase().includes(searchTermLower) ||
        row.Email?.toLowerCase().includes(searchTermLower) ||
        row.NombreDeFantasia?.toLowerCase().includes(searchTermLower)
      );
    }

    if (startDate && endDate) {
      filtered = filtered.filter(row => {
        const rowDate = new Date(row.created_at);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return rowDate >= start && rowDate <= end;
      });
    }

    setFilteredRows(filtered);
  };

  const handleExportToExcel = () => {
    const exportData = filteredRows.map(row => ({
      'Fecha Creación': row.fechaCreacion,
      'Nombre Identificador': row.nombreidentificador,
      'Razón Social': row.razonsocial,
      'Nombre de Fantasía': row.NombreDeFantasia,
      'RUT': row.RutAgencia,
      'Giro': row.Giro,
      'Nombre Representante Legal': row.NombreRepresentanteLegal,
      'RUT Representante': row.rutRepresentante,
      'Dirección': row.DireccionAgencia,
      'Región': row.region,
      'Comuna': row.comuna,
      'Teléfono Celular': row.telCelular,
      'Teléfono Fijo': row.telFijo,
      'Email': row.Email,
      'Código Megatime': row.codigo_megatime,
      'Estado': row.estado ? 'Activo' : 'Inactivo'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Agencias');
    
    const colWidths = [
      { wch: 15 }, // Fecha
      { wch: 30 }, // Nombre Identificador
      { wch: 30 }, // Razón Social
      { wch: 30 }, // Nombre de Fantasía
      { wch: 15 }, // RUT
      { wch: 20 }, // Giro
      { wch: 30 }, // Nombre Representante Legal
      { wch: 15 }, // RUT Representante
      { wch: 30 }, // Dirección
      { wch: 20 }, // Región
      { wch: 20 }, // Comuna
      { wch: 15 }, // Teléfono Celular
      { wch: 15 }, // Teléfono Fijo
      { wch: 30 }, // Email
      { wch: 20 }, // Código Megatime
      { wch: 10 }  // Estado
    ];
    ws['!cols'] = colWidths;

    const fileName = searchTerm || startDate || endDate ? 
      'Agencias_Filtradas.xlsx' : 
      'Todas_Las_Agencias.xlsx';
    
    XLSX.writeFile(wb, fileName);
  };

  const handleEstadoChange = async (event, id) => {
    try {
      const newEstado = event.target.checked;
      const { error } = await supabase
        .from('agencias')
        .update({ estado: newEstado })
        .eq('id', id);

      if (error) throw error;

      setRows(rows.map(row =>
        row.id === id ? { ...row, estado: newEstado } : row
      ));
      setFilteredRows(filteredRows.map(row =>
        row.id === id ? { ...row, estado: newEstado } : row
      ));

      await Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `La agencia ha sido ${newEstado ? 'activada' : 'desactivada'}`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating estado:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el estado de la agencia'
      });
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { error } = await supabase
            .from('agencias')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
          setRows(rows.filter(row => row.id !== id));
          setFilteredRows(filteredRows.filter(row => row.id !== id));
          
          Swal.fire(
            'Eliminado',
            'La agencia ha sido eliminada.',
            'success'
          );
        } catch (error) {
          console.error('Error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar la agencia'
          });
        }
      }
    });
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'nombreidentificador', headerName: 'Nombre Identificador', flex: 1 },
    { field: 'razonsocial', headerName: 'Razón Social', flex: 1 },
    { field: 'NombreDeFantasia', headerName: 'Nombre de Fantasía', flex: 1 },
    { field: 'RutAgencia', headerName: 'RUT', width: 130 },
    { field: 'Giro', headerName: 'Giro', width: 130 },
    { field: 'NombreRepresentanteLegal', headerName: 'Nombre Representante Legal', flex: 1 },
    { field: 'rutRepresentante', headerName: 'RUT Representante', width: 130 },
    { field: 'DireccionAgencia', headerName: 'Dirección', flex: 1 },
    { field: 'telCelular', headerName: 'Teléfono', width: 130 },
    { field: 'Email', headerName: 'Email', flex: 1 },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 180,
      renderCell: (params) => (
        <div className="action-buttons">
          <IconButton
            color="primary"
            size="small"
            onClick={() => navigate(`/agencias/view/${params.row.id}`)}
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton
            color="success"
            size="small"
            onClick={() => {
              setSelectedAgencia(params.row);
              setNewAgencia({
                NombreIdentificador: params.row.nombreidentificador || '',
                RazonSocial: params.row.razonsocial || '',
                NombreDeFantasia: params.row.NombreDeFantasia || '',
                RutAgencia: params.row.RutAgencia || '',
                Giro: params.row.Giro || '',
                NombreRepresentanteLegal: params.row.NombreRepresentanteLegal || '',
                rutRepresentante: params.row.rutRepresentante || '',
                DireccionAgencia: params.row.DireccionAgencia || '',
                Region: params.row.Region || '',
                Comuna: params.row.Comuna || '',
                telCelular: params.row.telCelular || '',
                telFijo: params.row.telFijo || '',
                Email: params.row.Email || '',
                codigo_megatime: params.row.codigo_megatime || '',
                estado: params.row.estado ?? true
              });
              // Forzar recarga de comunas para la región seleccionada
              if (params.row.Region) {
                const comunasFiltradas = todasLasComunas
                  .filter(comuna => comuna.id_region === parseInt(params.row.Region))
                  .sort((a, b) => a.nombrecomuna.localeCompare(b.nombrecomuna, 'es', { sensitivity: 'base' }))
                  .reduce((acc, comuna) => {
                    acc[comuna.id] = comuna.nombrecomuna;
                    return acc;
                  }, {});
                setComunasFiltradas(comunasFiltradas);
              }
              setOpenModal(true);
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDelete(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      ),
    },
  ];

  const insertAgencia = async () => {
    try {
      const dataToInsert = {
        nombreidentificador: newAgencia.NombreIdentificador || null,
        razonsocial: newAgencia.RazonSocial || null,
        nombrefantasia: newAgencia.NombreDeFantasia || null,
        rutagencia: newAgencia.RutAgencia,
        giro: newAgencia.Giro || null,
        nombrerepresentantelegal: newAgencia.NombreRepresentanteLegal || null,
        rutrepresentante: newAgencia.rutRepresentante,
        direccionagencia: newAgencia.DireccionAgencia || null,
        region: newAgencia.Region || null,
        comuna: newAgencia.Comuna || null,
        telcelular: newAgencia.telCelular || null,
        telfijo: newAgencia.telFijo || null,
        email: newAgencia.Email,
        codigo_megatime: newAgencia.codigo_megatime || null,
        estado: newAgencia.estado
      };

      console.log('Insertando agencia con datos:', dataToInsert);

      const { error } = await supabase
        .from('agencias')
        .insert([dataToInsert]);

      if (error) throw error;

      await Swal.fire({
        icon: 'success',
        title: 'Agencia agregada',
        text: 'La agencia ha sido agregada exitosamente',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al insertar agencia:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo agregar la agencia'
      });
      throw error;
    }
  };

  const updateAgencia = async () => {
    try {
      const dataToUpdate = {
        nombreidentificador: selectedAgencia.nombreidentificador,
        razonsocial: selectedAgencia.RazonSocial || selectedAgencia.razonsocial,
        nombrefantasia: selectedAgencia.NombreDeFantasia,
        rutagencia: selectedAgencia.RutAgencia,
        giro: selectedAgencia.Giro,
        nombrerepresentantelegal: selectedAgencia.NombreRepresentanteLegal,
        rutrepresentante: selectedAgencia.rutRepresentante,
        direccionagencia: selectedAgencia.DireccionAgencia,
        region: selectedAgencia.Region || null,
        comuna: selectedAgencia.Comuna || null,
        telcelular: selectedAgencia.telCelular,
        telfijo: selectedAgencia.telFijo,
        email: selectedAgencia.Email,
        codigo_megatime: selectedAgencia.codigo_megatime || null,
        estado: selectedAgencia.estado
      };

      console.log('Actualizando agencia con datos:', dataToUpdate);

      const { error } = await supabase
        .from('agencias')
        .update(dataToUpdate)
        .eq('id', selectedAgencia.id);

      if (error) throw error;

      await Swal.fire({
        icon: 'success',
        title: 'Agencia actualizada',
        text: 'La agencia ha sido actualizada exitosamente',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al actualizar agencia:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar la agencia'
      });
      throw error;
    }
  };

  const handleSave = async () => {
    const dataToValidate = selectedAgencia || newAgencia;
    
    if (!validarFormulario(dataToValidate)) {
      Swal.fire({
        icon: 'error',
        title: 'Error de validación',
        text: 'Por favor, complete todos los campos requeridos y corrija los errores',
        customClass: {
          container: 'swal-container-class'
        }
      });
      return;
    }

    setIsSaving(true);

    try {
      if (selectedAgencia) {
        await updateAgencia();
      } else {
        await insertAgencia();
      }
      handleCloseModal();
      fetchData();
      Swal.fire({
        icon: 'success',
        title: selectedAgencia ? 'Agencia actualizada' : 'Agencia creada',
        showConfirmButton: false,
        timer: 1500,
        customClass: {
          container: 'swal-container-class'
        }
      });
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la agencia',
        customClass: {
          container: 'swal-container-class'
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAgencia(null);
    setErrors({}); // Limpiar errores
    setNewAgencia({
      NombreIdentificador: '',
      RazonSocial: '',
      NombreDeFantasia: '',
      RutAgencia: '',
      Giro: '',
      NombreRepresentanteLegal: '',
      rutRepresentante: '',
      DireccionAgencia: '',
      Region: '',
      Comuna: '',
      telCelular: '',
      telFijo: '',
      Email: '',
      codigo_megatime: '',
      estado: true
    });
  };

  return (
    <div className="agencias-container animate-fade-in">
      {/* Header moderno con gradiente - Oculto en móvil */}
      {!isMobile && (
        <div className="modern-header animate-slide-down">
          <div className="modern-title" style={{ fontSize: '1rem', marginTop: '14px', lineHeight: '1' }}>
            🏢 LISTADO DE AGENCIAS
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
                placeholder="🔍 Buscar agencia..."
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

            {/* Filtros de fechas */}
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
              <TextField
                type="date"
                size="small"
                label="Desde"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
              <TextField
                type="date"
                size="small"
                label="Hasta"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
            </Box>

            {/* Botones de acción */}
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                className="btn-agregar"
                onClick={handleExportToExcel}
                startIcon={<FileDownloadIcon sx={{ color: 'white' }} />}
                sx={{ borderRadius: '12px', flex: 1 }}
              >
                📊 Exportar Excel
              </Button>
              <Button
                variant="contained"
                className="btn-agregar"
                startIcon={<AddIcon sx={{ color: 'white' }} />}
                onClick={() => {
                  setSelectedAgencia(null);
                  setNewAgencia({
                    NombreIdentificador: '',
                    RazonSocial: '',
                    NombreDeFantasia: '',
                    RutAgencia: '',
                    Giro: '',
                    NombreRepresentanteLegal: '',
                    rutRepresentante: '',
                    DireccionAgencia: '',
                    Region: '',
                    Comuna: '',
                    telCelular: '',
                    telFijo: '',
                    Email: '',
                    codigo_megatime: '',
                    estado: true
                  });
                  setOpenModal(true);
                }}
                sx={{ borderRadius: '12px', flex: 1 }}
              >
                Agregar
              </Button>
            </Box>

            {/* Cards creativos para agencias */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              {filteredRows.slice((mobilePage - 1) * 10, mobilePage * 10).map((agencia, index) => (
                <Card
                  key={agencia.id}
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
                      {agencia.nombreidentificador?.charAt(0) || '?'}
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
                        {agencia.nombreidentificador}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}>
                        <Chip
                          label={agencia.RutAgencia || 'Sin RUT'}
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
                          label={agencia.estado ? '✓ Activa' : '✗ Inactiva'}
                          size="small"
                          sx={{
                            height: '24px',
                            fontSize: '0.75rem',
                            backgroundColor: agencia.estado ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: agencia.estado ? '#16a34a' : '#dc2626',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Botones de acción */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/agencias/view/${agencia.id}`)}
                        sx={{
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.2)' }
                        }}
                      >
                        <VisibilityIcon fontSize="small" sx={{ color: '#3b82f6' }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedAgencia(agencia);
                          setNewAgencia({
                            NombreIdentificador: agencia.nombreidentificador || '',
                            RazonSocial: agencia.razonsocial || '',
                            NombreDeFantasia: agencia.NombreDeFantasia || '',
                            RutAgencia: agencia.RutAgencia || '',
                            Giro: agencia.Giro || '',
                            NombreRepresentanteLegal: agencia.NombreRepresentanteLegal || '',
                            rutRepresentante: agencia.rutRepresentante || '',
                            DireccionAgencia: agencia.DireccionAgencia || '',
                            Region: agencia.Region || '',
                            Comuna: agencia.Comuna || '',
                            telCelular: agencia.telCelular || '',
                            telFijo: agencia.telFijo || '',
                            Email: agencia.Email || '',
                            codigo_megatime: agencia.codigo_megatime || '',
                            estado: agencia.estado ?? true
                          });
                          setOpenModal(true);
                        }}
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
                          Razón Social
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {agencia.razonsocial || 'No especificada'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                          📍 Región
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {agencia.region}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                          🏙️ Comuna
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {agencia.comuna}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                          📞 Teléfono
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {agencia.telCelular || agencia.telFijo || 'No especificado'}
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
                      📅 {agencia.fechaCreacion}
                    </Typography>
                  </Box>
                </Card>
              ))}

              {/* Mensaje si no hay agencias */}
              {filteredRows.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="body1" color="text.secondary">
                    No se encontraron agencias
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
                Mostrando {Math.min((mobilePage - 1) * 10 + 1, filteredRows.length)}-{Math.min(mobilePage * 10, filteredRows.length)} de {filteredRows.length} agencia{filteredRows.length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            {/* FAB para agregar agencia */}
            <Fab
              color="primary"
              aria-label="add"
              onClick={() => {
                setSelectedAgencia(null);
                setNewAgencia({
                  NombreIdentificador: '',
                  RazonSocial: '',
                  NombreDeFantasia: '',
                  RutAgencia: '',
                  Giro: '',
                  NombreRepresentanteLegal: '',
                  rutRepresentante: '',
                  DireccionAgencia: '',
                  Region: '',
                  Comuna: '',
                  telCelular: '',
                  telFijo: '',
                  Email: '',
                  codigo_megatime: '',
                  estado: true
                });
                setOpenModal(true);
              }}
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
              placeholder="🔍 Buscar agencia..."
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
            <TextField
              type="date"
              variant="outlined"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
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
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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
              startIcon={<AddIcon sx={{ color: 'white' }} />}
              onClick={() => {
                setSelectedAgencia(null);
                setNewAgencia({
                  NombreIdentificador: '',
                  RazonSocial: '',
                  NombreDeFantasia: '',
                  RutAgencia: '',
                  Giro: '',
                  NombreRepresentanteLegal: '',
                  rutRepresentante: '',
                  DireccionAgencia: '',
                  Region: '',
                  Comuna: '',
                  telCelular: '',
                  telFijo: '',
                  Email: '',
                  codigo_megatime: '',
                  estado: true
                });
                setOpenModal(true);
              }}
            >
              Agregar Nueva Agencia
            </Button>
            <Button
              variant="contained"
              onClick={handleExportToExcel}
              startIcon={<FileDownloadIcon sx={{ color: 'white' }} />}
              className="btn-agregar"
            >
              📊 Exportar Excel
            </Button>
          </Box>
        </Box>
      )}

      {/* DataGrid solo visible en escritorio */}
      {!isMobile && (
        <div className="data-grid-container">
          <DataGrid
            rows={filteredRows}
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
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 }
              },
            }}
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#f5f5f5',
              },
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
              }
            }}
          />
        </div>
      )}

      {/* Modal de Nuevo/Editar Agencia */}
      <Dialog 
        open={openModal} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            '& .MuiDialogContent-root': {
              paddingTop: '20px'
            }
          }
        }}
      >
        <DialogTitle>
          {selectedAgencia ? 'Editar Agencia' : 'Nueva Agencia'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Nombre Identificador"
                name="NombreIdentificador"
                value={selectedAgencia ? selectedAgencia.nombreidentificador : newAgencia.NombreIdentificador}
                onChange={handleInputChange}
                error={!!errors.NombreIdentificador}
                helperText={errors.NombreIdentificador}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: errors.NombreIdentificador ? 0 : '8px' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="RUT"
                name="RutAgencia"
                value={selectedAgencia ? selectedAgencia.RutAgencia : newAgencia.RutAgencia}
                onChange={handleInputChange}
                error={!!errors.RutAgencia}
                helperText={errors.RutAgencia}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="fas fa-id-card" style={{ color: 'black' }}></i>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: errors.RutAgencia ? 0 : '8px' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Razón Social"
                name="RazonSocial"
                value={selectedAgencia ? (selectedAgencia.RazonSocial !== undefined ? selectedAgencia.RazonSocial : selectedAgencia.razonsocial) : newAgencia.RazonSocial}
                error={!!errors.RazonSocial}
                helperText={errors.RazonSocial}
                sx={{ mb: errors.RazonSocial ? 0 : '8px' }}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="fas fa-building" style={{ color: 'black' }}></i>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre de Fantasía"
                name="NombreDeFantasia"
                value={selectedAgencia ? selectedAgencia.NombreDeFantasia : newAgencia.NombreDeFantasia}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="fas fa-store" style={{ color: 'black' }}></i>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: '8px' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giro"
                name="Giro"
                value={selectedAgencia ? selectedAgencia.Giro : newAgencia.Giro}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="fas fa-briefcase" style={{ color: 'black' }}></i>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: '8px' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre Representante Legal"
                name="NombreRepresentanteLegal"
                value={selectedAgencia ? selectedAgencia.NombreRepresentanteLegal : newAgencia.NombreRepresentanteLegal}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="fas fa-user-tie" style={{ color: 'black' }}></i>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: '8px' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="RUT Representante"
                name="rutRepresentante"
                value={selectedAgencia ? selectedAgencia.rutRepresentante : newAgencia.rutRepresentante}
                onChange={handleInputChange}
                error={!!errors.rutRepresentante}
                helperText={errors.rutRepresentante}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="fas fa-id-badge" style={{ color: 'black' }}></i>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: errors.rutRepresentante ? 0 : '8px' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código Megatime"
                name="codigo_megatime"
                value={selectedAgencia ? selectedAgencia.codigo_megatime : newAgencia.codigo_megatime}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="fas fa-barcode" style={{ color: 'black' }}></i>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: '8px' }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                name="DireccionAgencia"
                value={selectedAgencia ? selectedAgencia.DireccionAgencia : newAgencia.DireccionAgencia}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="fas fa-map-marker-alt" style={{ color: 'black' }}></i>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: '8px' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Región</InputLabel>
                <Select
                  value={selectedAgencia ? selectedAgencia.Region || '' : newAgencia.Region || ''}
                  name="Region"
                  label="Región"
                  onChange={handleInputChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <i className="fas fa-map" style={{ color: 'black' }}></i>
                    </InputAdornment>
                  }
                >
                  {Object.entries(regiones).map(([id, nombre]) => (
                    <MenuItem key={id} value={id}>{nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Comuna</InputLabel>
                <Select
                  value={selectedAgencia ? selectedAgencia.Comuna || '' : newAgencia.Comuna || ''}
                  name="Comuna"
                  label="Comuna"
                  onChange={handleInputChange}
                  disabled={!selectedAgencia?.Region && !newAgencia.Region}
                  startAdornment={
                    <InputAdornment position="start">
                      <i className="fas fa-city" style={{ color: 'black' }}></i>
                    </InputAdornment>
                  }
                >
                  {Object.entries(comunasFiltradas).length > 0 ? (
                    Object.entries(comunasFiltradas).map(([id, nombre]) => (
                      <MenuItem key={id} value={id}>{nombre}</MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      <em>Selecciona una región primero</em>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono Celular"
                name="telCelular"
                value={selectedAgencia ? selectedAgencia.telCelular : newAgencia.telCelular}
                onChange={handleInputChange}
                error={!!errors.telCelular}
                helperText={errors.telCelular || 'Formato: +569XXXXXXXX'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="fas fa-phone" style={{ color: 'black' }}></i>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: errors.telCelular ? 0 : '8px', mt: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono Fijo"
                name="telFijo"
                value={selectedAgencia ? selectedAgencia.telFijo : newAgencia.telFijo}
                onChange={handleInputChange}
                error={!!errors.telFijo}
                helperText={errors.telFijo || 'Formato: +562XXXXXXX'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="fas fa-phone-alt" style={{ color: 'black' }}></i>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: errors.telFijo ? 0 : '8px', mt: 2 }}
              />
            </Grid>
            {errors.telefono && (
              <Grid item xs={12}>
                <Typography color="error" variant="caption">
                  {errors.telefono}
                </Typography>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email"
                name="Email"
                type="email"
                value={selectedAgencia ? selectedAgencia.Email : newAgencia.Email}
                onChange={handleInputChange}
                error={!!errors.Email}
                helperText={errors.Email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="fas fa-envelope" style={{ color: 'black' }}></i>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedAgencia ? selectedAgencia.estado : newAgencia.estado}
                    onChange={(e) => {
                      if (selectedAgencia) {
                        setSelectedAgencia({
                          ...selectedAgencia,
                          estado: e.target.checked
                        });
                      } else {
                        setNewAgencia({
                          ...newAgencia,
                          estado: e.target.checked
                        });
                      }
                    }}
                    color="primary"
                  />
                }
                label="Activo"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            disabled={isSaving}
          >
            {isSaving ? (
              <CircularProgress size={24} />
            ) : (
              'Guardar'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Agencias;
