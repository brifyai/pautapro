import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  Tab,
  Tabs,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Container,
  Breadcrumbs
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import BadgeIcon from '@mui/icons-material/Badge';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import HomeIcon from '@mui/icons-material/Home';
import StoreIcon from '@mui/icons-material/Store';
import LanguageIcon from '@mui/icons-material/Language';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PercentIcon from '@mui/icons-material/Percent';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import InventoryIcon from '@mui/icons-material/Inventory';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NumbersIcon from '@mui/icons-material/Numbers';
import Swal from 'sweetalert2';
import { supabase } from '../../config/supabase';
import './Clientes.css';

// Componente TabPanel
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ViewCliente = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [contactos, setContactos] = useState([]);
  const [comisiones, setComisiones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [datosFacturacion, setDatosFacturacion] = useState(null);
  const [tiposMoneda, setTiposMoneda] = useState([]);
  const [formatosComision, setFormatosComision] = useState([]);
  const [otrosDatos, setOtrosDatos] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [openContactoModal, setOpenContactoModal] = useState(false);
  const [openComisionModal, setOpenComisionModal] = useState(false);
  const [openProductosModal, setOpenProductosModal] = useState(false);
  const [openOtrosDatosModal, setOpenOtrosDatosModal] = useState(false);
  const [contactoForm, setContactoForm] = useState({
    nombre_contacto: '',
    telefono: '',
    email: '',
    cargo: '',
    id_cliente: ''
  });

  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [grupos, setGrupos] = useState({});
  const [regiones, setRegiones] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [comunasFiltradas, setComunasFiltradas] = useState([]);
  const [tiposCliente, setTiposCliente] = useState([]);
  const [formatos, setFormatos] = useState([]);
  const [errors, setErrors] = useState({
    RUT: '',
    RUT_representante: '',
    telCelular: '',
    telFijo: '',
    RUT_edit: '',
    RUT_representante_edit: '',
    telCelular_edit: '',
    telFijo_edit: ''
  });

  const [newComision, setNewComision] = useState({
    tipo_comision: '',
    porcentaje: '',
    monto_fijo: '',
    descripcion: '',
    estado: true
  });

  const [editingComision, setEditingComision] = useState(null);

  const tiposComision = [
    'ONLINE %',
    'ONLINE FEE',
    'OFF LINE %',
    'OFF LINE FEE',
    'FEE',
    'COMISION % FEE'
  ];

  const monedasDisponibles = ['UF', 'PESO', 'DOLAR'];

  const fetchClienteData = async () => {
    try {
      setLoading(true);
      console.log('Buscando cliente con ID:', id);
      
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .select(`
          *
        `)
        .eq('id_cliente', id)
        .single();

      if (clienteError) {
        console.error('Error de Supabase:', clienteError);
        if (clienteError.code === 'PGRST116') {
          // No rows returned, cliente no encontrado
          throw new Error(`Cliente con ID ${id} no encontrado`);
        }
        throw clienteError;
      }

      if (clienteData) {
        console.log('Cliente encontrado:', clienteData.nombrecliente);
        setCliente(clienteData);
      } else {
        throw new Error(`Cliente con ID ${id} no encontrado`);
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
      setError(error.message);
      await Swal.fire({
        icon: 'error',
        title: 'Cliente No Encontrado',
        text: `No se pudo encontrar el cliente con ID ${id}. Verifique que el ID sea correcto.`,
        confirmButtonText: 'Volver a Clientes',
        showCancelButton: true,
        cancelButtonText: 'Permanecer aquí'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/clientes';
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComisiones = async () => {
    try {
      const { data: comisionesData, error } = await supabase
        .from('comisiones')
        .select('*')
        .eq('id_cliente', id);

      if (error) {
        console.error('Error fetching comisiones:', error);
        throw error;
      }

      setComisiones(comisionesData || []);
    } catch (error) {
      console.error('Error al obtener comisiones:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      if (id) {
        await Promise.all([
          fetchClienteData(),
          fetchContactos(),
          fetchComisiones(),
          fetchProductos()
        ]);
      }
    };
    loadInitialData();
  }, [id]);

  useEffect(() => {
    if (cliente?.id_cliente) {
      setContactoForm(prev => ({
        ...prev,
        id_cliente: cliente.id_cliente
      }));
    }
  }, [cliente]);

  // Eliminada la función duplicada - ahora solo usamos fetchClienteData definida arriba



  const fetchContactos = async () => {
    try {
      console.log('Buscando contactos para cliente ID:', id);

      const { data: contactosData, error } = await supabase
        .from('contactocliente')
        .select('*')
        .eq('id_cliente', id);

      if (error) {
        console.error('Error al obtener contactos:', error);
        throw error;
      }

      console.log('Contactos obtenidos:', contactosData);
      setContactos(contactosData || []);
    } catch (error) {
      console.error('Error en fetchContactos:', error);
      setError(error.message);
    }
  };




  const fetchProductos = async () => {
    try {
      const { data: productosData, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id_cliente', id);

      if (error) {
        console.error('Error fetching productos:', error);
        throw error;
      }

      console.log('Productos received:', productosData);
      setProductos(productosData || []);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      setError(error.message);
    }
  };

  const handleAddContacto = async () => {
    try {
      if (!cliente?.id_cliente) {
        throw new Error('ID de cliente no disponible');
      }

      const { error } = await supabase
        .from('contactocliente')
        .insert([{
          ...contactoForm,
          id_cliente: cliente.id_cliente
        }]);

      if (error) {
        console.error('Error adding contact:', error);
        throw error;
      }

      setOpenContactoModal(false);
      setContactoForm({
        nombre_contacto: '',
        telefono: '',
        email: '',
        cargo: '',
        id_cliente: cliente?.id_cliente || ''
      });

      // Actualizar la lista de contactos
      await fetchContactos();

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Contacto agregado correctamente',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleDeleteContacto = async (contactoId) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        // Primero veamos qué datos tenemos
        console.log('Intentando eliminar contacto con ID:', contactoId);

        const { error } = await supabase
          .from('contactocliente')
          .delete()
          .eq('id', contactoId);

        if (error) {
          console.error('Error completo de Supabase:', error);
          throw new Error(`Error al eliminar: ${error.message} (Código: ${error.code})`);
        }

        // Si llegamos aquí, la eliminación fue exitosa
        await fetchContactos();

        await Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Contacto eliminado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
      }
    } catch (error) {
      console.error('Error completo:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error al eliminar el contacto',
        text: error.message,
        confirmButtonText: 'Entendido'
      });
    }
  };

  const handleOpenContactoModal = () => {
    setOpenContactoModal(true);
  };

  const handleCloseContactoModal = () => {
    setOpenContactoModal(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const renderContactosTable = () => (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Listado de Contactos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenContactoModal}
        >
          Agregar Contacto
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Correo</TableCell>
              <TableCell>Cargo</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contactos.map((contacto) => (
              <TableRow key={contacto.id}>
                <TableCell>{contacto.nombre || '-'}</TableCell>
                <TableCell>{contacto.telefono || '-'}</TableCell>
                <TableCell>{contacto.correo || '-'}</TableCell>
                <TableCell>{contacto.cargo || '-'}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleDeleteContacto(contacto.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  const renderComisionesTable = () => (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Listado de Comisiones</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ color: 'white' }} />}
          onClick={() => setOpenComisionModal(true)}
        >
          Agregar Comisión
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tipo Comisión</TableCell>
              <TableCell>Porcentaje</TableCell>
              <TableCell>Monto Fijo</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comisiones.map((comision) => (
              <TableRow key={comision.id_comision}>
                <TableCell>{comision.tipo_comision}</TableCell>
                <TableCell>{comision.porcentaje ? `${comision.porcentaje}%` : '-'}</TableCell>
                <TableCell>{comision.monto_fijo ? `$${comision.monto_fijo}` : '-'}</TableCell>
                <TableCell>{comision.descripcion}</TableCell>
                <TableCell>{comision.estado ? 'Activo' : 'Inactivo'}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleEditComision(comision)}
                    color="primary"
                  >
                    <OpenInNewIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteComision(comision.id_comision)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  const renderProductosTable = () => (
    <TableContainer component={Paper}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Listado de Productos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ color: 'white' }} />}
          onClick={() => setOpenProductosModal(true)}
        >
          Agregar Producto
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre del Producto</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {productos.map((producto) => (
            <TableRow key={producto.id}>
              <TableCell>{producto.nombredelproducto}</TableCell>
              <TableCell>
                <Switch
                  checked={producto.estado}
                  onChange={() => handleToggleProductoEstado(producto.id, producto.estado)}
                  color="primary"
                />
              </TableCell>
              <TableCell align="center">
                <IconButton
                  onClick={() => handleDeleteProducto(producto.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const handleSaveOtroDato = async (datoData) => {
    try {
      if (datoData.id) {
        const { error } = await supabase
          .from('otrosdatos')
          .update(datoData)
          .eq('id', datoData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('otrosdatos')
          .insert([{ ...datoData, id_cliente: id }]);
        if (error) throw error;
      }
      setOtrosDatos(prev => [...prev, datoData]);
      handleCloseOtrosDatosModal();
    } catch (error) {
      console.error('Error saving otro dato:', error);
    }
  };

  const handleDeleteOtroDato = async (datoId) => {
    try {
      const { error } = await supabase
        .from('otrosdatos')
        .delete()
        .eq('id', datoId);
      if (error) throw error;
      setOtrosDatos(prev => prev.filter(dato => dato.id !== datoId));
    } catch (error) {
      console.error('Error deleting otro dato:', error);
    }
  };

  const handleOpenOtrosDatosModal = (item = null) => {
    setOpenOtrosDatosModal(true);
  };

  const handleCloseOtrosDatosModal = () => {
    setOpenOtrosDatosModal(false);
  };

  const handleDeleteComision = async (id_comision) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        const { error } = await supabase
          .from('comisiones')
          .delete()
          .eq('id_comision', id_comision);

        if (error) throw error;

        // Actualizar la tabla inmediatamente
        await fetchComisiones();

        await Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'La comisión ha sido eliminada',
          showConfirmButton: false,
          timer: 1500
        });
      }
    } catch (error) {
      console.error('Error al eliminar comisión:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la comisión'
      });
    }
  };

  const handleEditComision = (comision) => {
    setEditingComision(comision);
    setNewComision({
      tipo_comision: comision.tipo_comision,
      porcentaje: comision.porcentaje,
      monto_fijo: comision.monto_fijo,
      descripcion: comision.descripcion,
      estado: comision.estado
    });
    setOpenComisionModal(true);
  };

  const handleOpenComisionModal = () => {
    setOpenComisionModal(true);
  };

  const handleCloseComisionModal = () => {
    setOpenComisionModal(false);
    setEditingComision(null);
    setNewComision({
      tipo_comision: '',
      porcentaje: '',
      monto_fijo: '',
      descripcion: '',
      estado: true
    });
  };

  const handleComisionInputChange = (event) => {
    const { name, value } = event.target;
    setNewComision(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleComisionSubmit = async () => {
    try {
      // Validar campos requeridos
      const camposFaltantes = [];
      if (!newComision.tipo_comision) camposFaltantes.push('Tipo de Comisión');
      if (!newComision.descripcion) camposFaltantes.push('Descripción');

      if (camposFaltantes.length > 0) {
        await Swal.fire({
          icon: 'warning',
          title: 'Campos Requeridos',
          text: `Por favor complete los siguientes campos: ${camposFaltantes.join(', ')}`
        });
        return;
      }

      if (editingComision) {
        // Actualizar comisión existente
        const { error } = await supabase
          .from('comisiones')
          .update({
            tipo_comision: newComision.tipo_comision,
            porcentaje: newComision.porcentaje,
            monto_fijo: newComision.monto_fijo,
            descripcion: newComision.descripcion,
            estado: newComision.estado
          })
          .eq('id_comision', editingComision.id_comision);

        if (error) throw error;

        await Swal.fire({
          icon: 'success',
          title: 'Comisión actualizada',
          text: 'La comisión se ha actualizado exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // Insertar nueva comisión
        const { error } = await supabase
          .from('comisiones')
          .insert([{
            id_cliente: id,
            tipo_comision: newComision.tipo_comision,
            porcentaje: newComision.porcentaje,
            monto_fijo: newComision.monto_fijo,
            descripcion: newComision.descripcion,
            estado: newComision.estado
          }]);

        if (error) throw error;

        await Swal.fire({
          icon: 'success',
          title: 'Comisión agregada',
          text: 'La comisión se ha agregado exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
      }

      handleCloseComisionModal();
      fetchComisiones();
    } catch (error) {
      console.error('Error al procesar comisión:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `No se pudo ${editingComision ? 'actualizar' : 'agregar'} la comisión: ${error.message}`
      });
    }
  };

  const handleOpenProductosModal = () => {
    setOpenProductosModal(true);
  };

  const handleCloseProductosModal = () => {
    setOpenProductosModal(false);
  };

  const handleAddProducto = async (productoData) => {
    try {
      const { error } = await supabase
        .from('productos')
        .insert([{
          ...productoData,
          id_cliente: id,
          estado: true // Por defecto activo
        }]);

      if (error) {
        console.error('Error adding producto:', error);
        throw error;
      }

      // Actualizar la lista de productos
      await fetchProductos();
      setOpenProductosModal(false);

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Producto agregado correctamente',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleDeleteProducto = async (productoId) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        const { error } = await supabase
          .from('productos')
          .delete()
          .eq('id', productoId);

        if (error) throw error;

        // Actualizar la lista de productos
        await fetchProductos();

        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Producto eliminado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
      }
    } catch (error) {
      console.error('Error:', error);
      const mensaje = error.code === '23503' 
        ? 'El producto no se puede eliminar porque está asociado a un plan'
        : 'Error al eliminar el producto';
        
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: mensaje
      });
    }
  };

  const handleToggleProductoEstado = async (productoId, estadoActual) => {
    try {
      const { error } = await supabase
        .from('productos')
        .update({ estado: !estadoActual })
        .eq('id', productoId);

      if (error) throw error;

      // Actualizar la lista de productos
      await fetchProductos();

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Estado actualizado correctamente',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleOpenEditModal = () => {
    if (cliente) {
      console.log('Datos originales del cliente:', cliente);
      console.log('id_comuna original:', cliente.id_comuna);
      console.log('id_region original:', cliente.id_region);
      
      const clientData = {
        ...cliente,
        nombrecliente: cliente.nombrecliente || '',
        nombrefantasia: cliente.nombrefantasia || '',
        id_grupo: cliente.id_grupo || null,
        razonsocial: cliente.razonsocial || cliente.razonSocial || '',
        id_tipo_cliente: cliente.id_tipo_cliente || null,
        rut: cliente.rut || cliente.RUT || '',
        id_region: cliente.id_region || null,
        id_comuna: cliente.id_comuna || null,
        estado: cliente.estado !== undefined ? cliente.estado : true,
        id_tablaformato: cliente.id_tablaformato || null,
        id_moneda: cliente.id_moneda || null,
        valor: cliente.valor || '',
        giro: cliente.giro || '',
        direccion: cliente.direccion || cliente.direccionEmpresa || '',
        nombrerepresentantelegal: cliente.nombrerepresentantelegal || cliente.nombreRepresentanteLegal || '',
        apellidorepresentante: cliente.apellidorepresentante || cliente.apellidoRepresentante || '',
        rut_representante: cliente.rut_representante || '',
        telcelular: cliente.telcelular || '',
        telfijo: cliente.telfijo || '',
        email: cliente.email || '',
        web_cliente: cliente.web_cliente || ''
      };
      
      console.log('Datos que se establecerán en selectedClient:', clientData);
      console.log('id_comuna en selectedClient:', clientData.id_comuna);
      
      setSelectedClient(clientData);
      setOpenEditModal(true);
    }
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedClient(null);
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

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    
    // Agregar log para depurar el campo de comuna
    if (name === 'id_comuna') {
      console.log('Cambio en id_comuna:', value);
    }
    
    if (name === 'rut') {
      const formattedRut = formatRut(value);
      setSelectedClient(prev => ({ ...prev, [name]: formattedRut }));
      
      // Validar RUT del cliente
      if (!validateRutRepresentante(value)) {
        setErrors(prev => ({ ...prev, RUT_edit: 'RUT inválido' }));
      } else {
        setErrors(prev => ({ ...prev, RUT_edit: '' }));
      }
    } else if (name === 'rut_representante') {
      const formattedRut = formatRut(value);
      setSelectedClient(prev => ({ ...prev, [name]: formattedRut }));
      
      // Validar RUT del representante
      if (!validateRutRepresentante(value)) {
        setErrors(prev => ({ ...prev, RUT_representante_edit: 'RUT del representante inválido' }));
      } else {
        setErrors(prev => ({ ...prev, RUT_representante_edit: '' }));
      }
    } else if (name === 'telcelular') {
      setSelectedClient(prev => ({ ...prev, [name]: value }));
      if (!validatePhoneNumber(value) && value !== '') {
        setErrors(prev => ({ ...prev, telCelular_edit: 'Número de celular inválido' }));
      } else {
        setErrors(prev => ({ ...prev, telCelular_edit: '' }));
      }
    } else if (name === 'telfijo') {
      setSelectedClient(prev => ({ ...prev, [name]: value }));
      if (!validatePhoneNumber(value) && value !== '') {
        setErrors(prev => ({ ...prev, telFijo_edit: 'Número de teléfono fijo inválido' }));
      } else {
        setErrors(prev => ({ ...prev, telFijo_edit: '' }));
      }
    } else {
      setSelectedClient(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubmit = async () => {
    // Validar campos antes de enviar
    if (errors.RUT_edit || errors.rut_representante_edit || errors.telcelular_edit || errors.telfijo_edit) {
      await Swal.fire({
        icon: 'error',
        title: 'Error de Validación',
        text: 'Por favor, corrija los campos inválidos antes de guardar',
      });
      return;
    }
    
    try {
      if (!selectedClient || !selectedClient.id_cliente) {
        throw new Error('No hay cliente seleccionado');
      }

      // Validar campos requeridos
      if (!selectedClient.nombrecliente || !selectedClient.rut) {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Por favor complete los campos obligatorios: Nombre Cliente y RUT'
        });
        return;
      }

      // Preparar los datos para la actualización usando los nombres correctos de la base de datos
      const updateData = {
        nombrecliente: selectedClient.nombrecliente,
        nombrefantasia: selectedClient.nombrefantasia || null,
        id_grupo: selectedClient.id_grupo || null,
        razonsocial: selectedClient.razonsocial || null,
        id_tipo_cliente: selectedClient.id_tipo_cliente || null,
        rut: selectedClient.rut,
        id_region: selectedClient.id_region || null,
        id_comuna: selectedClient.id_comuna || null,
        estado: selectedClient.estado,
        id_tablaformato: selectedClient.id_tablaformato || null,
        id_moneda: selectedClient.id_moneda || null,
        valor: selectedClient.valor || '',
        giro: selectedClient.giro || '',
        direccion: selectedClient.direccion || '',
        nombrerepresentantelegal: selectedClient.nombrerepresentantelegal || '',
        apellidorepresentante: selectedClient.apellidorepresentante || '',
        rut_representante: selectedClient.rut_representante || null,
        telcelular: selectedClient.telcelular || null,
        telfijo: selectedClient.telfijo || null,
        email: selectedClient.email || null,
        web_cliente: selectedClient.web_cliente || null
      };

      // Remover campos con valor vacío, pero mantener id_comuna si tiene un valor válido
      Object.keys(updateData).forEach(key => {
        if (key === 'id_comuna') {
          // No eliminar id_comuna si tiene un valor numérico válido
          if (updateData[key] === null || updateData[key] === undefined || updateData[key] === '') {
            console.log('id_comuna será eliminado porque su valor es:', updateData[key]);
          } else {
            console.log('id_comuna se mantendrá con valor:', updateData[key]);
          }
        } else {
          // Para otros campos, eliminar si están vacíos
          if (updateData[key] === null || updateData[key] === undefined || updateData[key] === '') {
            delete updateData[key];
          }
        }
      });

      console.log('Datos que se enviarán a la base de datos:', updateData);
      console.log('ID del cliente a actualizar:', selectedClient.id_cliente);

      const { data: updateResult, error: updateError } = await supabase
        .from('clientes')
        .update(updateData)
        .eq('id_cliente', selectedClient.id_cliente)
        .select(); // Agregar .select() para obtener los datos actualizados

      if (updateError) {
        console.error('Error al actualizar:', updateError);
        throw updateError;
      } else {
        console.log('✓ Actualización exitosa. Resultado:', updateResult);
        console.log('✓ id_comuna en resultado:', updateResult?.[0]?.id_comuna);
        console.log('✓ id_region en resultado:', updateResult?.[0]?.id_region);
      }

      // Actualizar los datos del cliente
      console.log('Antes de fetchClienteData - cliente actual:', cliente);
      await fetchClienteData();
      console.log('Después de fetchClienteData - cliente actualizado:', cliente);
      
      // Verificar directamente en la base de datos
      const { data: verifyData, error: verifyError } = await supabase
        .from('clientes')
        .select('id_comuna, id_region')
        .eq('id_cliente', selectedClient.id_cliente)
        .single();
      
      if (verifyError) {
        console.error('Error al verificar en base de datos:', verifyError);
      } else {
        console.log('Verificación directa en base de datos:', verifyData);
      }

      // Primero cerrar el modal
      setOpenEditModal(false);
      setSelectedClient(null);

      // Luego mostrar el mensaje de éxito
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
        text: 'Error al actualizar el cliente'
      });
    }
  };

  // Cargar datos necesarios para el formulario de edición
  useEffect(() => {
    const fetchDatosEdicion = async () => {
      try {
        console.log('Iniciando carga de datos de edición...');
        
        // Usar Promise.all como en Clientes.jsx para cargar todo en paralelo
        const [
          { data: gruposData, error: gruposError },
          { data: regionesData, error: regionesError },
          { data: comunasData, error: comunasError },
          { data: tiposClienteData, error: tiposClienteError },
          { data: formatosData, error: formatosError }
        ] = await Promise.all([
          supabase.from('grupos').select('*'),
          supabase.from('region').select('*'),
          supabase.from('comunas').select('*'),
          supabase.from('tipocliente').select('*'),
          supabase.from('tablaformato').select('*')
        ]);

        // Verificar errores
        if (gruposError) throw gruposError;
        if (regionesError) throw regionesError;
        if (comunasError) throw comunasError;
        if (tiposClienteError) throw tiposClienteError;
        if (formatosError) throw formatosError;

        console.log('Regiones cargadas:', regionesData);
        console.log('Comunas cargadas:', comunasData);
        console.log('Tipos de cliente cargados:', tiposClienteData);
        console.log('Número de comunas:', comunasData?.length || 0);
        
        // Si no hay comunas, insertar datos de prueba
        let comunasFinales = comunasData || [];
        if (!comunasData || comunasData.length === 0) {
          console.log('No hay comunas, insertando datos de prueba...');
          
          const comunasDePrueba = [
            // Región Metropolitana (id=7)
            { nombrecomuna: 'Santiago', id_region: 7 },
            { nombrecomuna: 'Providencia', id_region: 7 },
            { nombrecomuna: 'Las Condes', id_region: 7 },
            { nombrecomuna: 'Vitacura', id_region: 7 },
            { nombrecomuna: 'La Reina', id_region: 7 },
            { nombrecomuna: 'Peñalolén', id_region: 7 },
            { nombrecomuna: 'La Florida', id_region: 7 },
            { nombrecomuna: 'Puente Alto', id_region: 7 },
            { nombrecomuna: 'Maipú', id_region: 7 },
            { nombrecomuna: 'San Bernardo', id_region: 7 },
            // Región de Valparaíso (id=6)
            { nombrecomuna: 'Valparaíso', id_region: 6 },
            { nombrecomuna: 'Viña del Mar', id_region: 6 },
            { nombrecomuna: 'Quilpué', id_region: 6 },
            { nombrecomuna: 'Villa Alemana', id_region: 6 },
            { nombrecomuna: 'Quillota', id_region: 6 },
            // Región del Biobío (id=11)
            { nombrecomuna: 'Concepción', id_region: 11 },
            { nombrecomuna: 'Talcahuano', id_region: 11 },
            // Región de Ñuble (id=10)
            { nombrecomuna: 'Chillán', id_region: 10 },
            { nombrecomuna: 'Los Ángeles', id_region: 11 }
          ];

          const { data: insertedComunas, error: insertError } = await supabase
            .from('comunas')
            .insert(comunasDePrueba)
            .select();

          if (insertError) {
            console.error('Error al insertar comunas de prueba:', insertError);
          } else {
            console.log('Comunas de prueba insertadas:', insertedComunas);
            comunasFinales = insertedComunas;
          }
        }

        // Verificar estructura de datos
        if (comunasFinales && comunasFinales.length > 0) {
          console.log('Estructura de la primera comuna:', comunasFinales[0]);
        }

        if (tiposClienteData && tiposClienteData.length > 0) {
          console.log('Estructura del primer tipo de cliente:', tiposClienteData[0]);
        }

        // Procesar datos
        const gruposMap = gruposData.reduce((acc, grupo) => {
          acc[grupo.id_grupo] = grupo.nombre_grupo;
          return acc;
        }, {});

        // Ya no procesamos tiposCliente como un mapa, lo dejamos como array para usarlo directamente en el Select

        // Actualizar estados
        setGrupos(gruposMap);
        setRegiones(regionesData);
        setComunas(comunasFinales);
        setTiposCliente(tiposClienteData); // Ahora es un array, no un objeto
        setFormatos(formatosData);

        console.log('Datos de edición cargados exitosamente');

      } catch (error) {
        console.error('Error fetching datos edición:', error);
        console.error('Error completo:', error);
      }
    };

    fetchDatosEdicion();
  }, []);

  // Actualizar comunas filtradas cuando cambia la región
  useEffect(() => {
    console.log('useEffect de comunas filtradas - selectedClient?.id_region:', selectedClient?.id_region);
    console.log('useEffect de comunas filtradas - comunas.length:', comunas.length);
    
    if (selectedClient?.id_region) {
      const comunasDeLaRegion = comunas.filter(
        comuna => comuna.id_region === selectedClient.id_region
      );
      // Ordenar comunas alfabéticamente por nombre
      const comunasOrdenadas = comunasDeLaRegion.sort((a, b) =>
        a.nombrecomuna.localeCompare(b.nombrecomuna, 'es', { sensitivity: 'base' })
      );
      console.log('Comunas filtradas y ordenadas para región', selectedClient.id_region, ':', comunasOrdenadas);
      setComunasFiltradas(comunasOrdenadas);
    } else {
      console.log('No hay región seleccionada, limpiando comunas filtradas');
      setComunasFiltradas([]);
    }
  }, [selectedClient?.id_region, comunas]);

  useEffect(() => {
    console.log('Estado actual de comisiones:', comisiones);
  }, [comisiones]);

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!cliente) {
    return <div className="not-found">Cliente no encontrado</div>;
  }

  return (
    <Container maxWidth="xl">
      {/* Breadcrumb */}
      <Box sx={{ mb: 3, mt: 2 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Link
            to="/clientes"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <GroupIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Clientes
          </Link>
          <Typography
            color="text.primary"
            sx={{
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <PersonIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            {loading ? 'Cargando...' : cliente?.nombrecliente}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
              {cliente?.nombrecliente?.toUpperCase()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Registrado el: {new Date(cliente?.created_at).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Representante Legal: {`${cliente?.nombreRepresentanteLegal || ''} ${cliente?.apellidoRepresentante || ''}`}
            </Typography>
          </Paper>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">Detalles del Cliente</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<OpenInNewIcon sx={{ color: 'white' }} />}
                  onClick={handleOpenEditModal}
                >
                  Editar Cliente
                </Button>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <div className="mb-4">
                    <Typography variant="subtitle2" color="textSecondary">
                      Nombre Cliente
                    </Typography>
                    <Typography variant="body1">{cliente?.nombrecliente || '-'}</Typography>
                  </div>
                </Grid>

                <Grid item xs={6}>
                  <div className="mb-4">
                    <Typography variant="subtitle2" color="textSecondary">
                      Nombre de Fantasía
                    </Typography>
                    <Typography variant="body1">{cliente?.nombrefantasia || '-'}</Typography>
                  </div>
                </Grid>

                <Grid item xs={6}>
                  <div className="mb-4">
                    <Typography variant="subtitle2" color="textSecondary">
                      Razón Social
                    </Typography>
                    <Typography variant="body1">{cliente?.razonsocial || cliente?.razonSocial || '-'}</Typography>
                  </div>
                </Grid>

                <Grid item xs={6}>
                  <div className="mb-4">
                    <Typography variant="subtitle2" color="textSecondary">
                      RUT
                    </Typography>
                    <Typography variant="body1">{cliente?.rut || cliente?.RUT || '-'}</Typography>
                  </div>
                </Grid>

                <Grid item xs={6}>
                  <div className="mb-4">
                    <Typography variant="subtitle2" color="textSecondary">
                      Giro
                    </Typography>
                    <Typography variant="body1">{cliente?.giro || '-'}</Typography>
                  </div>
                </Grid>

                <Grid item xs={6}>
                  <div className="mb-4">
                    <Typography variant="subtitle2" color="textSecondary">
                      Grupo
                    </Typography>
                    <Typography variant="body1">{grupos[cliente?.id_grupo] || '-'}</Typography>
                  </div>
                </Grid>

                <Grid item xs={6}>
                  <div className="mb-4">
                    <Typography variant="subtitle2" color="textSecondary">
                      Representante Legal
                    </Typography>
                    <Typography variant="body1">{`${cliente?.nombrerepresentantelegal || cliente?.nombreRepresentanteLegal || ''} ${cliente?.apellidorepresentante || cliente?.apellidoRepresentante || ''}`}</Typography>
                  </div>
                </Grid>

                <Grid item xs={6}>
                  <div className="mb-4">
                    <Typography variant="subtitle2" color="textSecondary">
                      RUT Representante
                    </Typography>
                    <Typography variant="body1">{cliente?.rut_representante || '-'}</Typography>
                  </div>
                </Grid>

                <Grid item xs={6}>
                  <div className="mb-4">
                    <Typography variant="subtitle2" color="textSecondary">
                      Dirección
                    </Typography>
                    <Typography variant="body1">{cliente?.direccion || cliente?.direccionEmpresa || '-'}</Typography>
                  </div>
                </Grid>

                <Grid item xs={6}>
                  <div className="mb-4">
                    <Typography variant="subtitle2" color="textSecondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{cliente?.email || '-'}</Typography>
                  </div>
                </Grid>

                <Grid item xs={6}>
                  <div className="mb-4">
                    <Typography variant="subtitle2" color="textSecondary">
                      Teléfono Celular
                    </Typography>
                    <Typography variant="body1">{cliente?.telcelular || '-'}</Typography>
                  </div>
                </Grid>

                <Grid item xs={6}>
                  <div className="mb-4">
                    <Typography variant="subtitle2" color="textSecondary">
                      Teléfono Fijo
                    </Typography>
                    <Typography variant="body1">{cliente?.telfijo || '-'}</Typography>
                  </div>
                </Grid>

              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange}
                >
                  <Tab label="Datos Facturación" />
                  <Tab label="Datos de Contacto" />
                  <Tab label="Listado de Comisiones" />
                  <Tab label="Productos" />
                </Tabs>
              </Box>

              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={3}>
                    <div className="detail-item">
                      <Typography variant="subtitle2" color="textSecondary">
                        Razón Social
                      </Typography>
                      <Typography variant="body1">
                        {cliente?.razonsocial || cliente?.razonSocial || '-'}
                      </Typography>
                    </div>
                  </Grid>

                  <Grid item xs={3}>
                    <div className="detail-item">
                      <Typography variant="subtitle2" color="textSecondary">
                        RUT Empresa
                      </Typography>
                      <Typography variant="body1">
                        {cliente?.rut || cliente?.RUT || '-'}
                      </Typography>
                    </div>
                  </Grid>

                  <Grid item xs={3}>
                    <div className="detail-item">
                      <Typography variant="subtitle2" color="textSecondary">
                        Región
                      </Typography>
                      <Typography variant="body1">
                        {cliente?.id_region || '-'}
                      </Typography>
                    </div>
                  </Grid>

                  <Grid item xs={3}>
                    <div className="detail-item">
                      <Typography variant="subtitle2" color="textSecondary">
                        Comuna
                      </Typography>
                      <Typography variant="body1">
                        {cliente?.id_comuna || '-'}
                      </Typography>
                    </div>
                  </Grid>

                  <Grid item xs={3}>
                    <div className="detail-item">
                      <Typography variant="subtitle2" color="textSecondary">
                        Dirección
                      </Typography>
                      <Typography variant="body1">
                        {cliente?.direccion || cliente?.direccionEmpresa || '-'}
                      </Typography>
                    </div>
                  </Grid>

                  <Grid item xs={3}>
                    <div className="detail-item">
                      <Typography variant="subtitle2" color="textSecondary">
                        Tipo de Cliente
                      </Typography>
                      <Typography variant="body1">
                        {(() => {
                          // Buscar el tipo de cliente por ID
                          const tipo = tiposCliente.find(t =>
                            t.id === cliente.id_tipo_cliente
                          );
                          return tipo ? tipo.nombretipocliente || tipo.nombre_tipo_cliente || tipo.nombre : 'Directo';
                        })()}
                      </Typography>
                    </div>
                  </Grid>

                  <Grid item xs={3}>
                    <div className="detail-item">
                      <Typography variant="subtitle2" color="textSecondary">
                        Giro
                      </Typography>
                      <Typography variant="body1">
                        {cliente?.giro || '-'}
                      </Typography>
                    </div>
                  </Grid>

                  <Grid item xs={3}>
                    <div className="detail-item">
                      <Typography variant="subtitle2" color="textSecondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {cliente?.email || '-'}
                      </Typography>
                    </div>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Listado de Contactos</Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon sx={{ color: 'white' }} />}
                      onClick={handleOpenContactoModal}
                    >
                      Agregar Contacto
                    </Button>
                  </Box>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Nombre</TableCell>
                          <TableCell>Teléfono</TableCell>
                          <TableCell>Correo</TableCell>
                          <TableCell>Cargo</TableCell>
                          <TableCell>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {contactos.map((contacto) => (
                          <TableRow key={contacto.id}>
                            <TableCell>{contacto.nombre_contacto || '-'}</TableCell>
                            <TableCell>{contacto.telefono || '-'}</TableCell>
                            <TableCell>{contacto.email || '-'}</TableCell>
                            <TableCell>{contacto.cargo || '-'}</TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() => handleDeleteContacto(contacto.id)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                {renderComisionesTable()}
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                {renderProductosTable()}
              </TabPanel>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openComisionModal} onClose={handleCloseComisionModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingComision ? 'Editar Comisión' : 'Agregar Nueva Comisión'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Tipo de Comisión"
                  name="tipo_comision"
                  value={newComision.tipo_comision}
                  onChange={(e) => setNewComision({
                    ...newComision,
                    tipo_comision: e.target.value
                  })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalOfferIcon />
                      </InputAdornment>
                    ),
                  }}
                >
                  {tiposComision.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  name="descripcion"
                  multiline
                  rows={3}
                  value={newComision.descripcion}
                  onChange={(e) => setNewComision({
                    ...newComision,
                    descripcion: e.target.value
                  })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FormatListBulletedIcon />
                      </InputAdornment>
                    ),
                  }}
                />

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Porcentaje (%)"
                  name="porcentaje"
                  type="number"
                  value={newComision.porcentaje}
                  onChange={(e) => setNewComision({
                    ...newComision,
                    porcentaje: e.target.value
                  })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PercentIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Monto Fijo"
                  name="monto_fijo"
                  type="number"
                  value={newComision.monto_fijo}
                  onChange={(e) => setNewComision({
                    ...newComision,
                    monto_fijo: e.target.value
                  })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseComisionModal}>Cancelar</Button>
          <Button onClick={handleComisionSubmit} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openProductosModal} onClose={handleCloseProductosModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          Agregar Producto
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Nombre del Producto"
              name="nombredelproducto"
              defaultValue={''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <InventoryIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProductosModal}>Cancelar</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => {
              const nombreProducto = document.querySelector('input[name="nombredelproducto"]').value;
              handleAddProducto({ NombreDelProducto: nombreProducto });
            }}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openContactoModal} onClose={handleCloseContactoModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          Agregar Contacto
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <input
              type="hidden"
              name="id_cliente"
              value={contactoForm.id_cliente}
            />
            <TextField
              fullWidth
              label="Nombre"
              name="nombre_contacto"
              value={contactoForm.nombre_contacto}
              onChange={(e) => setContactoForm({
                ...contactoForm,
                nombre_contacto: e.target.value
              })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Teléfono"
              name="telefono"
              value={contactoForm.telefono}
              onChange={(e) => setContactoForm({
                ...contactoForm,
                telefono: e.target.value
              })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Correo"
              name="email"
              type="email"
              value={contactoForm.email}
              onChange={(e) => setContactoForm({
                ...contactoForm,
                email: e.target.value
              })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Cargo"
              name="cargo"
              value={contactoForm.cargo}
              onChange={(e) => setContactoForm({
                ...contactoForm,
                cargo: e.target.value
              })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContactoModal}>Cancelar</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleAddContacto}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <OpenInNewIcon sx={{ mr: 1 }} />
            Editar Cliente
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box component="form" noValidate>
            {/* Datos Básicos */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <TextField
                    label="Nombre Cliente"
                    name="nombrecliente"
                    value={selectedClient?.nombrecliente || ''}
                    onChange={handleEditInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <TextField
                    label="Nombre Fantasía"
                    name="nombrefantasia"
                    value={selectedClient?.nombrefantasia || ''}
                    onChange={handleEditInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Grupo</InputLabel>
                  <Select
                    value={selectedClient?.id_grupo || ''}
                    onChange={handleEditInputChange}
                    name="id_grupo"
                    startAdornment={
                      <InputAdornment position="start">
                        <GroupIcon />
                      </InputAdornment>
                    }
                  >
                    {Object.entries(grupos).map(([id, grupo]) => (
                      <MenuItem key={id} value={id}>
                        {grupo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <TextField
                    label="Razón Social"
                    name="razonsocial"
                    value={selectedClient?.razonsocial || ''}
                    onChange={handleEditInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Cliente</InputLabel>
                  <Select
                    value={selectedClient?.id_tipo_cliente || ''}
                    onChange={handleEditInputChange}
                    name="id_tipo_cliente"
                    startAdornment={
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    }
                  >
                    {tiposCliente
                      .sort((a, b) => {
                        const nombreA = a.nombretipocliente || a.nombre_tipo_cliente || a.nombre || '';
                        const nombreB = b.nombretipocliente || b.nombre_tipo_cliente || b.nombre || '';
                        return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
                      })
                      .map((tipo) => (
                        <MenuItem key={tipo.id} value={tipo.id}>
                          {tipo.nombretipocliente || tipo.nombre_tipo_cliente || tipo.nombre}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <TextField
                    label="RUT"
                    name="rut"
                    value={selectedClient?.rut || ''}
                    onChange={handleEditInputChange}
                    error={!!errors.RUT_edit}
                    helperText={errors.RUT_edit}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Región</InputLabel>
                  <Select
                    value={selectedClient?.id_region || ''}
                    onChange={handleEditInputChange}
                    name="id_region"
                    startAdornment={
                      <InputAdornment position="start">
                        <LocationOnIcon />
                      </InputAdornment>
                    }
                  >
                    {regiones.map((region) => (
                      <MenuItem key={region.id} value={region.id}>
                        {region.nombreregion}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Comuna</InputLabel>
                  <Select
                    value={selectedClient?.id_comuna || ''}
                    onChange={handleEditInputChange}
                    name="id_comuna"
                    startAdornment={
                      <InputAdornment position="start">
                        <LocationOnIcon />
                      </InputAdornment>
                    }
                  >
                    {console.log('Renderizando Select - comunasFiltradas:', comunasFiltradas)}
                    {comunasFiltradas.length === 0 ? (
                      <MenuItem disabled>No hay comunas disponibles</MenuItem>
                    ) : (
                      comunasFiltradas.map((comuna) => {
                        console.log('Renderizando comuna:', comuna);
                        return (
                          <MenuItem key={comuna.id} value={comuna.id}>
                            {comuna.nombrecomuna}
                          </MenuItem>
                        );
                      })
                    )}
                  </Select>
                </FormControl>
              </Grid>

              {/* Información de la Empresa */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                  Información de la Empresa
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <TextField
                    label="Giro"
                    name="giro"
                    value={selectedClient?.giro || ''}
                    onChange={handleEditInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <StoreIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <TextField
                    label="Dirección de la Empresa"
                    name="direccion"
                    value={selectedClient?.direccion || ''}
                    onChange={handleEditInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HomeIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
              </Grid>

              {/* Información del Representante Legal */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                  Información del Representante Legal
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <TextField
                    label="Nombre del Representante Legal"
                    name="nombrerepresentantelegal"
                    value={selectedClient?.nombrerepresentantelegal || ''}
                    onChange={handleEditInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <TextField
                    label="Apellido del Representante"
                    name="apellidorepresentante"
                    value={selectedClient?.apellidorepresentante || ''}
                    onChange={handleEditInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={12}>
                <FormControl fullWidth>
                  <TextField
                    label="RUT del Representante"
                    name="rut_representante"
                    value={selectedClient?.rut_representante || ''}
                    onChange={handleEditInputChange}
                    error={!!errors.rut_representante_edit}
                    helperText={errors.rut_representante_edit}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
              </Grid>

              {/* Información de Contacto */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                  Información de Contacto
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <TextField
                    label="Teléfono Celular"
                    name="telcelular"
                    value={selectedClient?.telcelular || ''}
                    onChange={handleEditInputChange}
                    error={!!errors.telcelular_edit}
                    helperText={errors.telcelular_edit}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneAndroidIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <TextField
                    label="Teléfono Fijo"
                    name="telfijo"
                    value={selectedClient?.telfijo || ''}
                    onChange={handleEditInputChange}
                    error={!!errors.telfijo_edit}
                    helperText={errors.telfijo_edit}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <TextField
                    label="Email"
                    name="email"
                    value={selectedClient?.email || ''}
                    onChange={handleEditInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <TextField
                    label="Sitio Web"
                    name="web_cliente"
                    value={selectedClient?.web_cliente || ''}
                    onChange={handleEditInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LanguageIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ViewCliente;
