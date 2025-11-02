import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  FormControlLabel,
  Switch,
  InputAdornment,
  Breadcrumbs,
  Link,
  Box,
  Paper,
  CircularProgress,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  Numbers as NumbersIcon
} from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ApartmentIcon from '@mui/icons-material/Apartment';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import UploadIcon from '@mui/icons-material/Upload';
import AssistantIcon from '@mui/icons-material/Assistant';
import { supabase } from '../../config/supabase';
import { mapearDatos } from '../../config/mapeo-campos';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import './Proveedores.css';

const Proveedores = () => {
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [regiones, setRegiones] = useState({});
  const [todasLasComunas, setTodasLasComunas] = useState([]);
  const [comunasFiltradas, setComunasFiltradas] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [newProveedor, setNewProveedor] = useState({
    nombreproveedor: '',
    razonSocial: '',
    nombreFantasia: '',
    rutProveedor: '',
    giroProveedor: '',
    nombreRepresentante: '',
    rutRepresentante: '',
    direccionFacturacion: '',
    id_region: '',
    id_comuna: '',
    telCelular: '',
    telFijo: '',
    email: '',
    estado: true,
    nombreidentificador: '',
    bonificacionano: '',
    escala_rango: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validarRut = (rut) => {
    if (!rut) return false;
    
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
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(email);
  };

  const validarTelefonoCelular = (telefono) => {
    if (!telefono) return true; // No es obligatorio
    // Acepta formatos: 96666666, +56966666666, 56966666666, 9 6666 6666
    const re = /^(\+?56)?(\s?)(0?9)?(\s?)[9]\d{7}$/;
    return re.test(telefono);
  };

  const validarTelefonoFijo = (telefono) => {
    if (!telefono) return true; // No es obligatorio
    // Acepta formatos: +562226978200, 226978200, +56 2 2697 8200, 2 2697 8200
    const re = /^(\+?56)?(\s?)(0?2)?(\s?)[2-9]\d{7,8}$/;
    return re.test(telefono);
  };

  const validarFormulario = (proveedorData) => {
    const newErrors = {};

    // Validar nombre del proveedor (campo requerido)
    const nombreproveedor = proveedorData.nombreproveedor;
    if (!nombreproveedor || nombreproveedor.trim() === '') {
      newErrors.nombreproveedor = 'El nombre del proveedor es requerido';
    }

    // Validar dirección (campo requerido) - Buscar en múltiples posibles campos
    const direccionFacturacion = proveedorData.direccionFacturacion || proveedorData.direccion || proveedorData.Direccion || proveedorData.direccion_facturacion;
    if (!direccionFacturacion || direccionFacturacion.trim() === '') {
      newErrors.direccionFacturacion = 'La dirección de facturación es requerida';
    }

    // Validar región (campo requerido)
    if (!proveedorData.id_region || proveedorData.id_region === '') {
      newErrors.id_region = 'La región es requerida';
    }

    // Validar comuna (campo requerido)
    if (!proveedorData.id_comuna || proveedorData.id_comuna === '') {
      newErrors.id_comuna = 'La comuna es requerida';
    }

    // Validar Email (campo requerido)
    const email = proveedorData.email || proveedorData.Email;
    if (!email || email.trim() === '') {
      newErrors.email = 'El correo electrónico es requerido';
    } else {
      const emailValido = validarEmail(email);
      if (!emailValido) {
        newErrors.email = 'Correo electrónico inválido';
      }
    }

    // Validar teléfonos (al menos uno es requerido) - Buscar en múltiples posibles campos
    const telCelular = proveedorData.telCelular || proveedorData.telefono_celular || proveedorData.telcelular;
    const telFijo = proveedorData.telFijo || proveedorData.telefono_fijo || proveedorData.telfijo;

    const tieneCelular = telCelular && telCelular.trim() !== '';
    const tieneFijo = telFijo && telFijo.trim() !== '';

    if (!tieneCelular && !tieneFijo) {
      newErrors.telefono = 'Se requiere al menos un teléfono (celular o fijo)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchTerm, startDate, endDate, rows]);

  // Efecto para cargar comunas cuando se selecciona un proveedor para editar
  useEffect(() => {
    console.log('=== useEffect de comunas para edición ===');
    console.log('selectedProveedor:', selectedProveedor);
    console.log('selectedProveedor?.id_region:', selectedProveedor?.id_region);
    console.log('selectedProveedor?.id_comuna:', selectedProveedor?.id_comuna);
    console.log('todasLasComunas.length:', todasLasComunas.length);
    
    if (selectedProveedor && selectedProveedor.id_region && todasLasComunas.length > 0) {
      console.log('Cargando comunas para proveedor editado, región:', selectedProveedor.id_region);
      
      // Usar la misma lógica que en Clientes.jsx para filtrar comunas
      const comunasDeRegion = todasLasComunas
        .filter(comuna => comuna.id_region === parseInt(selectedProveedor.id_region))
        .sort((a, b) => a.nombrecomuna.localeCompare(b.nombrecomuna, 'es', { sensitivity: 'base' }))
        .reduce((acc, comuna) => {
          acc[comuna.id] = comuna.nombrecomuna;
          return acc;
        }, {});
      
      console.log('Comunas filtradas para edición:', comunasDeRegion);
      console.log('Comuna del proveedor (', selectedProveedor.id_comuna, ') está en las comunas filtradas?', comunasDeRegion[selectedProveedor.id_comuna]);
      setComunasFiltradas(comunasDeRegion);
    } else {
      console.log('No se cumplen las condiciones para cargar comunas');
    }
    console.log('=== FIN useEffect de comunas para edición ===');
  }, [selectedProveedor?.id_region, todasLasComunas]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Obtener proveedores y contar sus soportes
      const { data: proveedoresData, error: proveedoresError } = await supabase
        .from('proveedores')
        .select(`
          *,
          proveedor_soporte:proveedor_soporte(count)
        `);

      if (proveedoresError) throw proveedoresError;

      // DEPURACIÓN: Mostrar estructura completa de los datos
      console.log('=== DEPURACIÓN PROVEEDORES ===');
      console.log('Número de proveedores cargados:', proveedoresData.length);
      if (proveedoresData.length > 0) {
        console.log('Estructura del primer proveedor:', JSON.stringify(proveedoresData[0], null, 2));
        console.log('Campos disponibles:', Object.keys(proveedoresData[0]));
        
        // Verificar específicamente los campos nuevos
        console.log('Campos nuevos específicos:');
        console.log('direccion_facturacion:', proveedoresData[0].direccion_facturacion);
        console.log('telefono_celular:', proveedoresData[0].telefono_celular);
        console.log('telefono_fijo:', proveedoresData[0].telefono_fijo);
        console.log('identificador:', proveedoresData[0].identificador);
        console.log('bonificacion_anio:', proveedoresData[0].bonificacion_anio);
        console.log('escala_rango:', proveedoresData[0].escala_rango);
      }
      console.log('=== FIN DEPURACIÓN ===');

      const { data: regionesData } = await supabase
        .from('region')
        .select('*');

      const { data: comunasData } = await supabase
        .from('comunas')
        .select('*');

      // Convertir regiones a objeto para fácil acceso
      const regionesObj = regionesData.reduce((acc, region) => {
        acc[region.id] = region.nombreregion;
        return acc;
      }, {});

      // Convertir comunas a objeto con la misma estructura que en Clientes.jsx
      const comunasObj = comunasData.reduce((acc, comuna) => {
        acc[comuna.id] = {
          nombrecomuna: comuna.nombrecomuna,
          id_region: comuna.id_region
        };
        return acc;
      }, {});

      setRegiones(regionesObj);
      setTodasLasComunas(comunasData);

      // Inicialmente mostramos todas las comunas filtradas y ordenadas alfabéticamente
      const comunasFiltradasObj = comunasData
        .sort((a, b) => a.nombrecomuna.localeCompare(b.nombrecomuna, 'es', { sensitivity: 'base' }))
        .reduce((acc, comuna) => {
          acc[comuna.id] = comuna.nombrecomuna;
          return acc;
        }, {});
      setComunasFiltradas(comunasFiltradasObj);

      const formattedRows = proveedoresData.map(proveedor => {
        const fecha = new Date(proveedor.created_at);
        return {
          ...proveedor,
          id: proveedor.id_proveedor,
          region: regionesObj[proveedor.id_region] || '',
          comuna: comunasData.find(c => c.id === proveedor.id_comuna)?.nombrecomuna || '',
          fecha_formateada: fecha.toLocaleString('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          num_soportes: proveedor.proveedor_soporte?.[0]?.count || 0
        };
      });

      setRows(formattedRows);
      setFilteredRows(formattedRows);
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los datos'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = [...rows];

    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(row =>
        row.nombreproveedor?.toLowerCase().includes(searchTermLower) ||
        row.nombreidentificador?.toLowerCase().includes(searchTermLower) ||
        row.rutProveedor?.toLowerCase().includes(searchTermLower)
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
      'Identificador': row.nombreidentificador,
      'Proveedor': row.nombreproveedor,
      'Nombre Fantasía': row.nombreFantasia,
      'RUT': row.rutProveedor,
      'Giro': row.giroProveedor,
      'Representante': row.nombreRepresentante,
      'RUT Representante': row.rutRepresentante,
      'Razón Social': row.razonSocial,
      'Dirección': row.direccionFacturacion,
      'Región': row.region,
      'Comuna': row.comuna,
      'Teléfono Celular': row.telCelular,
      'Teléfono Fijo': row.telFijo,
      'Email': row.email,
      'Estado': row.estado ? 'Activo' : 'Inactivo',
      'Fecha Creación': row.fecha_formateada,
      'N° Soportes': row.num_soportes
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Proveedores');
    XLSX.writeFile(wb, 'Proveedores.xlsx');
  };

  const handleEstadoChange = async (event, id) => {
    try {
      const newEstado = event.target.checked;
      const { error } = await supabase
        .from('proveedores')
        .update({ estado: newEstado })
        .eq('id_proveedor', id);

      if (error) throw error;

      // Actualizar el estado en la interfaz
      setRows(rows.map(row =>
        row.id === id ? { ...row, estado: newEstado } : row
      ));
      setFilteredRows(filteredRows.map(row =>
        row.id === id ? { ...row, estado: newEstado } : row
      ));

      await Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `El proveedor ha sido ${newEstado ? 'activado' : 'desactivado'}`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating estado:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el estado del proveedor'
      });
    }
  };


  const columns = [
    {
      field: 'id_proveedor',
      headerName: 'ID',
      width: 60
    },
    {
      field: 'nombreproveedor',
      headerName: 'Nombre',
      width: 150,
      flex: 1
    },
    {
      field: 'razonsocial',
      headerName: 'Razón Social',
      width: 150,
      flex: 1
    },
    {
      field: 'rut',
      headerName: 'RUT',
      width: 120
    },
    {
      field: 'direccion_facturacion',
      headerName: 'Dirección Facturación',
      width: 200,
      flex: 1
    },
    {
      field: 'telefono_celular',
      headerName: 'Teléfono Celular',
      width: 130
    },
    {
      field: 'telefono_fijo',
      headerName: 'Teléfono Fijo',
      width: 130
    },
    {
      field: 'identificador',
      headerName: 'Identificador',
      width: 120
    },
    {
      field: 'bonificacion_anio',
      headerName: 'Bonificación Año',
      width: 120,
      type: 'number',
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'escala_rango',
      headerName: 'Escala Rango',
      width: 100,
      type: 'number',
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'fecha_formateada',
      headerName: 'Fecha Creación',
      width: 160,
      renderCell: (params) => {
        return params.value;
      }
    },
    {
      field: 'num_soportes',
      headerName: 'N° Soportes',
      width: 100,
      type: 'number',
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 100,
      renderCell: (params) => (
        <Switch
          checked={params.value}
          onChange={(e) => handleEstadoChange(e, params.row.id_proveedor)}
          size="small"
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
      field: 'actions',
      headerName: 'Acciones',
      width: 180,
      renderCell: (params) => (
        <div className="action-buttons">
          <IconButton
            color="primary"
            size="small"
            onClick={() => navigate(`/proveedores/view/${params.row.id}`)}
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton
            color="success"
            size="small"
            onClick={() => handleEdit(params.row)}
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
      )
    }
  ];

  const handleEdit = (row) => {
    console.log('=== DEPURACIÓN handleEdit ===');
    console.log('Row recibido:', JSON.stringify(row, null, 2));
    console.log('Campos específicos:');
    console.log('  - rutProveedor:', row.rut || row.RUT || row.rutProveedor);
    console.log('  - direccionFacturacion:', row.direccion_facturacion || row.direccion || row.Direccion || row.direccionFacturacion);
    console.log('  - telCelular:', row.telefono_celular || row.telcelular || row.telCelular);
    console.log('  - telFijo:', row.telefono_fijo || row.telfijo || row.telFijo);
    console.log('  - id_comuna del row:', row.id_comuna);
    console.log('  - id_region del row:', row.id_region);
    
    setSelectedProveedor(row);
    
    // Construir objeto con todos los campos necesarios para el formulario
    const proveedorFormateado = {
      nombreproveedor: row.nombreproveedor || '',
      razonSocial: row.razonsocial || row.razonSocial || '',
      nombreFantasia: row.nombrefantasia || row.nombreFantasia || '',
      rutProveedor: row.rut || row.RUT || row.rutProveedor || '',
      giroProveedor: row.giro || row.giroProveedor || '',
      nombreRepresentante: row.nombrerepresentante || row.nombreRepresentante || '',
      rutRepresentante: row.rutrepresentante || row.rutRepresentante || '',
      direccionFacturacion: row.direccion_facturacion || row.direccion || row.Direccion || row.direccionFacturacion || '',
      id_region: row.id_region || '',
      id_comuna: row.id_comuna || '',
      telCelular: row.telefono_celular || row.telcelular || row.telCelular || '',
      telFijo: row.telefono_fijo || row.telfijo || row.telFijo || '',
      email: row.email || row.Email || '',
      estado: row.estado !== undefined ? row.estado : true,
      nombreidentificador: row.identificador || row.nombreidentificador || '',
      bonificacionano: row.bonificacion_anio !== undefined ? String(row.bonificacion_anio) : '',
      escala_rango: row.escala_rango !== undefined ? String(row.escala_rango) : ''
    };
    
    console.log('proveedorFormateado:', proveedorFormateado);
    setNewProveedor(proveedorFormateado);
    
    setOpenModal(true);
    console.log('=== FIN DEPURACIÓN handleEdit ===');
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción. Si el proveedor tiene relaciones asociadas, estas también serán eliminadas.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Mostrar loading
          Swal.fire({
            title: 'Procesando...',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          // Intentar eliminar directamente el proveedor
          const { error: errorProveedor } = await supabase
            .from('proveedores')
            .delete()
            .eq('id_proveedor', id);
          
          if (errorProveedor) {
            // Si hay error de clave externa, intentar eliminar las relaciones primero
            if (errorProveedor.code === '23503') {
              console.log('Detectado error de clave externa, intentando eliminar relaciones...');
              
              // Intentar eliminar relaciones de forma segura
              try {
                // Eliminar relaciones de soportes si existen
                await supabase
                  .from('proveedor_soporte')
                  .delete()
                  .eq('id_proveedor', id);
              } catch (e) {
                console.log('No se encontró tabla proveedor_soporte o ya está vacía');
              }

              try {
                // Eliminar contactos si existen
                await supabase
                  .from('contactos')
                  .delete()
                  .eq('id_proveedor', id);
              } catch (e) {
                console.log('No se encontró tabla contactos o ya está vacía');
              }

              // Intentar eliminar el proveedor nuevamente
              const { error: errorSegundoIntento } = await supabase
                .from('proveedores')
                .delete()
                .eq('id_proveedor', id);

              if (errorSegundoIntento) {
                throw errorSegundoIntento;
              }
            } else {
              throw errorProveedor;
            }
          }
          
          // Actualizar la interfaz
          setRows(rows.filter(row => row.id !== id));
          setFilteredRows(filteredRows.filter(row => row.id !== id));
          
          Swal.fire(
            'Eliminado',
            'El proveedor ha sido eliminado exitosamente.',
            'success'
          );
        } catch (error) {
          console.error('Error completo al eliminar:', error);
          
          // Proporcionar un mensaje más específico según el error
          let mensajeError = 'No se pudo eliminar el proveedor.';
          
          if (error.code === '23503') {
            mensajeError = 'No se puede eliminar el proveedor porque tiene registros asociados en otras tablas. Contacte al administrador para eliminar las relaciones manualmente.';
          } else if (error.message) {
            mensajeError += ` Error: ${error.message}`;
          }
          
          Swal.fire({
            icon: 'error',
            title: 'Error al eliminar',
            text: mensajeError,
            confirmButtonText: 'Entendido'
          });
        }
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    console.log(`handleInputChange - name: ${name}, value: ${value}`);
    console.log('selectedProveedor:', selectedProveedor);
    console.log('newProveedor antes:', newProveedor);
    
    if (name === 'id_region') {
      // Cuando se selecciona una región, filtramos las comunas (usando la misma lógica que en Clientes.jsx)
      const comunasFiltradas = todasLasComunas
        .filter(comuna => comuna.id_region === parseInt(value))
        .sort((a, b) => a.nombrecomuna.localeCompare(b.nombrecomuna, 'es', { sensitivity: 'base' }))
        .reduce((acc, comuna) => {
          acc[comuna.id] = comuna.nombrecomuna;
          return acc;
        }, {});
      
      setComunasFiltradas(comunasFiltradas);
      
      // Actualizar el estado correcto según si estamos editando o creando
      if (selectedProveedor) {
        setSelectedProveedor(prev => ({
          ...prev,
          [name]: value,
          id_comuna: ''
        }));
      } else {
        console.log('Actualizando newProveedor con región');
        setNewProveedor(prev => {
          const updated = {
            ...prev,
            [name]: value,
            id_comuna: ''
          };
          console.log('newProveedor después de actualizar región:', updated);
          return updated;
        });
      }
    } else if (name === 'id_comuna') {
      // Manejo específico para el campo id_comuna
      console.log('Manejando cambio en id_comuna con valor:', value);

      // Convertir a número si es necesario
      const numericValue = value === '' ? '' : parseInt(value, 10);

      // Actualizar el estado correcto según si estamos editando o creando
      if (selectedProveedor) {
        console.log('Actualizando selectedProveedor.id_comuna');
        setSelectedProveedor(prev => {
          const updated = { ...prev, [name]: numericValue };
          console.log('selectedProveedor después de actualizar id_comuna:', updated);
          return updated;
        });
      } else {
        console.log('Actualizando newProveedor.id_comuna');
        setNewProveedor(prev => {
          const updated = { ...prev, [name]: numericValue };
          console.log('newProveedor después de actualizar id_comuna:', updated);
          return updated;
        });
      }
    } else {
      // Para otros campos, actualizar el estado correcto
      if (selectedProveedor) {
        console.log('Actualizando selectedProveedor con campo:', name);
        setSelectedProveedor(prev => {
          const updated = { ...prev, [name]: value };
          console.log('selectedProveedor después de actualizar:', updated);
          return updated;
        });
      } else {
        console.log('Actualizando newProveedor con campo:', name);
        setNewProveedor(prev => {
          const updated = { ...prev, [name]: value };
          console.log('newProveedor después de actualizar:', updated);
          return updated;
        });
      }
    }
  };

  const handleSave = async () => {
    try {
      // Determinar qué datos usar: edición o creación
      const proveedorData = selectedProveedor ? selectedProveedor : newProveedor;

      // Logging minimal para producción
      console.log('Guardando proveedor - Modo:', selectedProveedor ? 'EDITANDO' : 'CREANDO');

      // Validar antes de guardar
      const validationResult = validarFormulario(proveedorData);

      if (!validationResult) {
        const errorMessages = Object.values(errors).filter(msg => msg !== '');

        Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: errorMessages.length > 0 ? errorMessages.join(', ') : 'Por favor, corrija los errores antes de guardar'
        });
        return;
      }

      setIsSaving(true);

      // Preparar datos para guardar - usar exactamente los nombres de campos de la BD
      // Nombres correctos según la estructura real de la tabla proveedores
      const dataToSave = {
        nombreproveedor: proveedorData.nombreproveedor,
        razonsocial: proveedorData.razonSocial || null,
        rut: proveedorData.rutProveedor || proveedorData.rut || proveedorData.RUT || null,
        direccion: proveedorData.direccionFacturacion || proveedorData.direccion || proveedorData.Direccion || '',
        id_region: parseInt(proveedorData.id_region),
        id_comuna: parseInt(proveedorData.id_comuna),
        telefono_celular: proveedorData.telCelular || proveedorData.telefono_celular || null,
        telefono_fijo: proveedorData.telFijo || proveedorData.telefono_fijo || null,
        direccion_facturacion: proveedorData.direccionFacturacion || proveedorData.direccion || proveedorData.Direccion || '',
        email: proveedorData.email || proveedorData.Email,
        estado: proveedorData.estado,
        identificador: proveedorData.nombreidentificador || proveedorData.identificador || null,
        bonificacion_anio: parseFloat(proveedorData.bonificacionano || proveedorData.bonificacion_anio) || 0,
        escala_rango: parseFloat(proveedorData.escala_rango) || 0
      };

      let result;
      if (selectedProveedor) {
        result = await supabase
          .from('proveedores')
          .update(dataToSave)
          .eq('id_proveedor', selectedProveedor.id_proveedor);
      } else {
        result = await supabase
          .from('proveedores')
          .insert([dataToSave]);
      }

      if (result.error) {
        throw result.error;
      }

      await fetchData();

      // Limpiar formulario
      setOpenModal(false);
      setSelectedProveedor(null);
      setNewProveedor({
        nombreproveedor: '',
        razonSocial: '',
        nombreFantasia: '',
        rutProveedor: '',
        giroProveedor: '',
        nombreRepresentante: '',
        rutRepresentante: '',
        direccionFacturacion: '',
        id_region: '',
        id_comuna: '',
        telCelular: '',
        telFijo: '',
        email: '',
        estado: true,
        nombreidentificador: '',
        bonificacionano: '',
        escala_rango: ''
      });

      Swal.fire({
        icon: 'success',
        title: 'Proveedor guardado',
        text: 'Los cambios se han guardado correctamente',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error al guardar proveedor:', error);

      let errorMessage = 'No se pudo guardar el proveedor';
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }

      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: errorMessage
      });
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="proveedores-container animate-fade-in">
      {/* Header moderno con gradiente */}
      <div className="modern-header animate-slide-down">
        <div className="modern-title" style={{ fontSize: '1rem', marginTop: '14px', lineHeight: '1' }}>
          🏢 GESTIÓN DE PROVEEDORES
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Administración de proveedores del sistema
          </Typography>
        </div>
      </div>

      {/* Controles de búsqueda y acciones */}
      <Box sx={{ p: 3, pt: 6 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3
        }}>
          {/* Campos de búsqueda y fechas - lado izquierdo */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              variant="outlined"
              placeholder="🔍 Buscar proveedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
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

          {/* Botones de acción - lado derecho */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              onClick={handleExportToExcel}
              startIcon={<FileDownloadIcon sx={{ color: 'white' }} />}
              className="btn-agregar"
            >
              Exportar Excel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setSelectedProveedor(null);
                setNewProveedor({
                  nombreproveedor: '',
                  razonSocial: '',
                  nombreFantasia: '',
                  rutProveedor: '',
                  giroProveedor: '',
                  nombreRepresentante: '',
                  rutRepresentante: '',
                  direccionFacturacion: '',
                  id_region: '',
                  id_comuna: '',
                  telCelular: '',
                  telFijo: '',
                  email: '',
                  estado: true,
                  nombreidentificador: '',
                  bonificacionano: '',
                  escala_rango: ''
                });
                setOpenModal(true);
              }}
              startIcon={<AddIcon sx={{ color: 'white' }} />}
              className="btn-agregar"
            >
              Agregar Nuevo Proveedor
            </Button>
          </Box>
        </Box>
      </Box>

      {/* DataGrid Container */}
      <Box sx={{ p: 3, pt: 0 }}>
        <div className="data-grid-container">
          <DataGrid
            rows={filteredRows}
            columns={columns}
            pageSize={pageSize}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            rowsPerPageOptions={[5, 10, 25]}
            disableSelectionOnClick
            loading={loading}
            autoHeight
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
            pageSizeOptions={[5, 10, 25]}
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                transform: 'scale(1.01)',
                transition: 'all 0.2s ease',
              },
              '& .MuiDataGrid-row:nth-of-type(even)': {
                backgroundColor: 'rgba(102, 126, 234, 0.02)',
              },
              '& .MuiDataGrid-columnHeaders': {
                background: '#4d559a !important',
                borderBottom: 'none !important',
                minHeight: '56px !important',
              },
              '& .MuiDataGrid-columnHeader': {
                display: 'flex !important',
                alignItems: 'center !important',
                justifyContent: 'flex-start !important',
                padding: '12px 16px !important',
                minHeight: '56px !important',
                color: 'white !important',
                fontWeight: '600 !important',
                fontSize: '0.875rem !important',
                background: 'transparent !important',
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                color: 'white !important',
                fontWeight: '600 !important',
                textShadow: '0 1px 2px rgba(0,0,0,0.3) !important',
              },
              '& .MuiDataGrid-columnHeaderTitleContainer': {
                color: 'white !important',
              },
              '& .MuiDataGrid-columnHeaderTitleContainer .MuiDataGrid-columnHeaderTitle': {
                color: 'white !important',
                fontWeight: '600 !important',
              },
              '& .MuiDataGrid-columnHeader *': {
                color: 'white !important',
              },
              '& .MuiDataGrid-columnHeader svg': {
                color: 'rgba(255, 255, 255, 0.9) !important',
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
              },
              '& .MuiDataGrid-virtualScroller': {
                overflowX: 'hidden !important',
              },
              border: 'none',
              borderRadius: '12px',
            }}
          />
        </div>
      </Box>

      {/* Botón flotante del Asistente */}
      <Tooltip title="🤖 Asistente Inteligente - Gestión de Proveedores" placement="left">
        <Fab
          color="primary"
          aria-label="asistente"
          className="animate-float"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 64,
            height: 64,
            background: 'var(--gradient-primary)',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            border: '2px solid rgba(255,255,255,0.2)',
            '&:hover': {
              background: 'var(--gradient-secondary)',
              transform: 'scale(1.1)',
              boxShadow: '0 12px 40px rgba(247, 107, 138, 0.4)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onClick={() => window.open('/asistente', '_blank')}
        >
          <AssistantIcon sx={{ fontSize: 28 }} />
        </Fab>
      </Tooltip>

      {/* Modal de Nuevo/Editar Proveedor */}
      <Dialog 
        open={openModal} 
        onClose={() => setOpenModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Proveedor"
                name="nombreproveedor"
                value={selectedProveedor?.nombreproveedor || newProveedor.nombreproveedor || ''}
                onChange={handleInputChange}
                error={!!errors.nombreproveedor}
                helperText={errors.nombreproveedor}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre Fantasía"
                name="nombreFantasia"
                value={selectedProveedor?.nombreFantasia || newProveedor.nombreFantasia || ''}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="RUT Proveedor"
                name="rutProveedor"
                value={selectedProveedor?.rut || selectedProveedor?.RUT || selectedProveedor?.rutProveedor || newProveedor.rutProveedor || ''}
                onChange={handleInputChange}
                error={!!errors.rutProveedor}
                helperText={errors.rutProveedor}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Razón Social"
                name="razonSocial"
                value={selectedProveedor?.razonsocial || selectedProveedor?.razonSocial || newProveedor.razonSocial || ''}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre Representante"
                name="nombreRepresentante"
                value={selectedProveedor?.nombrerepresentante || selectedProveedor?.nombreRepresentante || newProveedor.nombreRepresentante || ''}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="RUT Representante"
                name="rutRepresentante"
                value={selectedProveedor?.rutrepresentante || selectedProveedor?.rutRepresentante || newProveedor.rutRepresentante || ''}
                onChange={handleInputChange}
                error={!!errors.rutRepresentante}
                helperText={errors.rutRepresentante}
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
              <TextField
                required
                fullWidth
                label="Dirección Facturación"
                name="direccionFacturacion"
                value={selectedProveedor?.direccion_facturacion || selectedProveedor?.Direccion || selectedProveedor?.direccionFacturacion || newProveedor.direccionFacturacion || ''}
                onChange={handleInputChange}
                error={!!errors.direccionFacturacion}
                helperText={errors.direccionFacturacion}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Región *</InputLabel>
                <Select
                  name="id_region"
                  value={selectedProveedor?.id_region || newProveedor.id_region || ''}
                  onChange={handleInputChange}
                  label="Región"
                  error={!!errors.id_region}
                >
                  <MenuItem value="">
                    <em>Seleccione una región</em>
                  </MenuItem>
                  {Object.keys(regiones).map((region, index) => (
                    <MenuItem key={index} value={region}>
                      {regiones[region]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Comuna *</InputLabel>
                <Select
                  name="id_comuna"
                  value={selectedProveedor?.id_comuna || newProveedor.id_comuna || ''}
                  onChange={handleInputChange}
                  label="Comuna"
                  disabled={!(selectedProveedor?.id_region || newProveedor.id_region)}
                  error={!!errors.id_comuna}
                >
                  <MenuItem value="">
                    <em>Seleccione una comuna</em>
                  </MenuItem>
                  {Object.entries(comunasFiltradas).map(([id, nombre]) => (
                    <MenuItem key={id} value={id}>
                      {nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono Celular"
                name="telCelular"
                value={selectedProveedor?.telefono_celular || selectedProveedor?.telcelular || selectedProveedor?.telCelular || newProveedor.telCelular || ''}
                onChange={handleInputChange}
                error={!!errors.telCelular}
                helperText={errors.telCelular || 'Formato: +569XXXXXXXX'}
                sx={{ mt: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono Fijo"
                name="telFijo"
                value={selectedProveedor?.telefono_fijo || selectedProveedor?.telfijo || selectedProveedor?.telFijo || newProveedor.telFijo || ''}
                onChange={handleInputChange}
                error={!!errors.telFijo}
                helperText={errors.telFijo || 'Formato: +562XXXXXXX'}
                sx={{ mt: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {errors.telefono && (
              <Grid item xs={12}>
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {errors.telefono}
                </Typography>
              </Grid>
            )}
            {errors.id_region && (
              <Grid item xs={12}>
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {errors.id_region}
                </Typography>
              </Grid>
            )}
            {errors.id_comuna && (
              <Grid item xs={12}>
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {errors.id_comuna}
                </Typography>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={selectedProveedor?.email || selectedProveedor?.Email || newProveedor.email || ''}
                onChange={handleInputChange}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Identificador"
                name="nombreidentificador"
                value={selectedProveedor?.identificador || selectedProveedor?.nombreidentificador || newProveedor.nombreidentificador || ''}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bonificación Año"
                name="bonificacionano"
                value={selectedProveedor?.bonificacion_anio || selectedProveedor?.bonificacionano || newProveedor.bonificacionano || ''}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <NumbersIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Escala Rango"
                name="escala_rango"
                value={selectedProveedor?.escala_rango || newProveedor.escala_rango || ''}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <NumbersIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedProveedor ? selectedProveedor.estado : newProveedor.estado}
                    onChange={(e) => {
                      if (selectedProveedor) {
                        setSelectedProveedor({
                          ...selectedProveedor,
                          estado: e.target.checked
                        });
                      } else {
                        setNewProveedor({
                          ...newProveedor,
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
          <Button onClick={() => setOpenModal(false)} color="primary">
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={20} /> : null}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Proveedores;
