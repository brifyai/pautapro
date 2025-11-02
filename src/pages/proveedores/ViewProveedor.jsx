import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tab,
  Tabs,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Stack,
  FormGroup,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  FormLabel,
  FormControl,
  Chip,
  CircularProgress,
  Breadcrumbs,
  Switch
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import PercentIcon from '@mui/icons-material/Percent';
import GroupIcon from '@mui/icons-material/Group';
import ScaleIcon from '@mui/icons-material/Straighten';
import LaunchIcon from '@mui/icons-material/Launch';
import EditIcon from '@mui/icons-material/Edit';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DataGrid } from '@mui/x-data-grid';
import { supabase } from '../../config/supabase';
import Swal from 'sweetalert2';
import { format } from 'date-fns';

const ViewProveedor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [value, setValue] = useState(0);
  const [proveedor, setProveedor] = useState(null);
  const [contactos, setContactos] = useState([]);
  const [soportes, setSoportes] = useState([]);
  const [openContactoModal, setOpenContactoModal] = useState(false);
  const [openSoporteModal, setOpenSoporteModal] = useState(false);
  const [contactoForm, setContactoForm] = useState({
    nombres: '',
    apellidos: '',
    telefono: '',
    email: '',
    id_proveedor: id
  });
  const [soporteForm, setSoporteForm] = useState({
    nombreidentificador: '',
    bonificacionano: '0',
    escala: '0',
    estado: true,
    id_proveedor: id
  });
  const [medios, setMedios] = useState([]);
  const [selectedMedios, setSelectedMedios] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    nombreProveedor: '',
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
  const [regiones, setRegiones] = useState({});
  const [comunas, setComunas] = useState({});
  const [comunasData, setComunasData] = useState([]);
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
    const re = /^(\+?56)?(\s?)(0?9)(\s?)[98765432]\d{7}$/;
    return re.test(telefono);
  };

  const validarTelefonoFijo = (telefono) => {
    const re = /^(\+?56)?(\s?)([2-9]\d{7,8})$/;
    return re.test(telefono);
  };

  const validarFormularioProveedor = () => {
    const newErrors = {};

    if (!validarRut(editForm.rutproveedor)) {
      newErrors.rutproveedor = 'RUT inválido';
    }
    if (!validarRut(editForm.rutRepresentante)) {
      newErrors.rutRepresentante = 'RUT inválido';
    }
    if (!validarEmail(editForm.email)) {
      newErrors.email = 'Correo electrónico inválido';
    }
    
    // Validar que al menos uno de los teléfonos esté presente y sea válido
    const celularValido = !editForm.telcelular || validarTelefonoCelular(editForm.telcelular);
    const fijoValido = !editForm.telfijo || validarTelefonoFijo(editForm.telfijo);
    
    if (!celularValido) {
      newErrors.telcelular = 'Formato inválido. Debe ser un número celular chileno';
    }
    if (!fijoValido) {
      newErrors.telfijo = 'Formato inválido. Debe ser un número fijo chileno';
    }
    
    if (!editForm.telcelular && !editForm.telfijo) {
      newErrors.telefono = 'Se requiere al menos un teléfono';
    } else if (!celularValido && !fijoValido) {
      newErrors.telefono = 'Al menos un teléfono debe tener formato válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validarFormularioContacto = () => {
    const newErrors = {};

    if (!validarEmail(contactoForm.email)) {
      newErrors.contactoEmail = 'Correo electrónico inválido';
    }
    // Para contactos, asumimos que puede ser cualquier tipo de teléfono
    if (!validarTelefonoCelular(contactoForm.telefono) && !validarTelefonoFijo(contactoForm.telefono)) {
      newErrors.contactoTelefono = 'Teléfono inválido. Debe ser un número chileno válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchRegionesyComunas = async () => {
      try {
        const { data: regionesData } = await supabase
          .from('region')
          .select('*');

        const { data: comunasData } = await supabase
          .from('comunas')
          .select('*');

        const regionesObj = regionesData.reduce((acc, region) => {
          acc[region.id] = region.nombreregion;
          return acc;
        }, {});

        const comunasObj = comunasData.reduce((acc, comuna) => {
          acc[comuna.id_comuna] = comuna.nombrecomuna;
          return acc;
        }, {});

        setRegiones(regionesObj);
        setComunas(comunasObj);
        setComunasData(comunasData);
      } catch (error) {
        console.error('Error al cargar regiones y comunas:', error);
      }
    };

    fetchRegionesyComunas();
  }, []);

  useEffect(() => {
    if (proveedor) {
      setEditForm({
        nombreProveedor: proveedor.nombreproveedor || '',
        razonSocial: proveedor.razonSocial || '',
        nombreFantasia: proveedor.nombrefantasia || '',
        rutProveedor: proveedor.rutproveedor || '',
        giroProveedor: proveedor.giroProveedor || '',
        nombreRepresentante: proveedor.nombreRepresentante || '',
        rutRepresentante: proveedor.rutRepresentante || '',
        direccionFacturacion: proveedor.direccionFacturacion || '',
        id_region: proveedor.id_region || '',
        id_comuna: proveedor.id_comuna || '',
        telCelular: proveedor.telcelular || '',
        telFijo: proveedor.telfijo || '',
        email: proveedor.email || '',
        estado: proveedor.estado,
        nombreidentificador: proveedor.nombreidentificador || '',
        bonificacionano: proveedor.bonificacionano || '',
        escala_rango: proveedor.escala_rango || ''
      });
    }
  }, [proveedor]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      console.log('Fetching data for provider:', id);

      // Obtener datos del proveedor básico
      const { data: proveedorData, error: proveedorError } = await supabase
        .from('proveedores')
        .select('*')
        .eq('id_proveedor', id)
        .single();

      if (proveedorError) {
        console.error('Error fetching proveedor:', proveedorError);
        throw proveedorError;
      }

      console.log('Proveedor data:', proveedorData);

      // Obtener datos de región si existe
      let regionData = null;
      if (proveedorData.id_region) {
        const { data: regionResult, error: regionError } = await supabase
          .from('region')
          .select('nombreregion')
          .eq('id', proveedorData.id_region)
          .single();

        if (regionError) {
          console.error('Error fetching region:', regionError);
        } else {
          regionData = regionResult;
        }
      }

      // Obtener datos de comuna si existe
      let comunaData = null;
      if (proveedorData.id_comuna) {
        const { data: comunaResult, error: comunaError } = await supabase
          .from('comunas')
          .select('nombrecomuna')
          .eq('id', proveedorData.id_comuna) // La columna es 'id', no 'id_comuna'
          .single();

        if (comunaError) {
          console.error('Error fetching comuna:', comunaError);
        } else {
          comunaData = comunaResult;
        }
      }

      // Combinar todos los datos en un objeto completo
      const proveedorCompleto = {
        ...proveedorData,
        region: regionData || null,
        comunas: comunaData || null
      };

      console.log('Proveedor completo:', proveedorCompleto);
      setProveedor(proveedorCompleto);

      // Obtener contactos
      const { data: contactosData, error: contactosError } = await supabase
        .from('contactos')
        .select('*')
        .eq('id_proveedor', id);

      if (contactosError) {
        console.error('Error fetching contactos:', contactosError);
        throw contactosError;
      }

      setContactos(contactosData.map(contacto => ({
        ...contacto,
        id: contacto.id // Usar el campo 'id' de la tabla contactos
      })));

      // Obtener soportes
      const { data: proveedorSoportes, error: soportesError } = await supabase
        .from('proveedor_soporte')
        .select('id_soporte')
        .eq('id_proveedor', id);

      if (soportesError) {
        console.error('Error fetching soporte ids:', soportesError);
        throw soportesError;
      }

      if (proveedorSoportes && proveedorSoportes.length > 0) {
        // Filtrar IDs nulos y obtener array de IDs válidos
        const idsSoportes = proveedorSoportes
          .map(ps => ps.id_soporte)
          .filter(id => id != null);

        if (idsSoportes.length > 0) {
          // Obtener detalles de los soportes
          const { data: soportesData, error: soportesDetailsError } = await supabase
            .from('soportes')
            .select('id_soporte, nombreidentificador, descripcion, estado, bonificacionano, escala')
            .in('id_soporte', idsSoportes);

          if (soportesDetailsError) {
            console.error('Error fetching soportes details:', soportesDetailsError);
            throw soportesDetailsError;
          }

          // Obtener medios para cada soporte
          const soportesConMedios = await Promise.all(
            soportesData.map(async (soporte) => {
              const { data: mediosData, error: mediosError } = await supabase
                .from('soporte_medios')
                .select(`
                  id_medio,
                  medios!inner(id, nombre_medio)
                `)
                .eq('id_soporte', soporte.id_soporte);

              if (mediosError) {
                console.error('Error fetching medios for soporte:', mediosError);
                return {
                  ...soporte,
                  id: soporte.id_soporte,
                  medios: []
                };
              }

              return {
                ...soporte,
                id: soporte.id_soporte,
                medios: mediosData
                  .map(m => m.medios?.nombre_medio)
                  .filter(Boolean)
              };
            })
          );

          setSoportes(soportesConMedios);
        } else {
          setSoportes([]);
        }
      } else {
        setSoportes([]);
      }

      // Obtener lista completa de medios para el modal
      const { data: mediosData, error: mediosError } = await supabase
        .from('medios')
        .select('*')
        .order('nombre_medio');

      if (mediosError) {
        console.error('Error fetching medios:', mediosError);
        throw mediosError;
      }

      setMedios(mediosData || []);

    } catch (error) {
      console.error('Error general:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar los datos'
      });
    }
  };

  const handleContactoSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormularioContacto()) {
      Swal.fire({
        icon: 'error',
        title: 'Error de validación',
        text: 'Por favor, corrija los errores antes de guardar'
      });
      return;
    }
    setIsSubmitting(true); 
    showLoading();

    try {
      if (contactoForm.id_contacto) {
        // Actualizar contacto existente
        const { error } = await supabase
          .from('contactos')
          .update({
            nombre_contacto: contactoForm.nombres + ' ' + contactoForm.apellidos,
            cargo: 'Contacto',
            telefono: contactoForm.telefono,
            email: contactoForm.email
          })
          .eq('id', contactoForm.id_contacto);

        if (error) throw error;
      } else {
        // Crear nuevo contacto
        const { error } = await supabase
          .from('contactos')
          .insert([{
            id_proveedor: parseInt(id),
            nombre_contacto: contactoForm.nombres + ' ' + contactoForm.apellidos,
            cargo: 'Contacto',
            telefono: contactoForm.telefono,
            email: contactoForm.email
          }]);

        if (error) throw error;
      }

      // Actualizar datos
      await fetchData();

      hideLoading();
      setOpenContactoModal(false);
      setIsSubmitting(false); 

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: contactoForm.id_contacto ? 'Contacto actualizado correctamente' : 'Contacto agregado correctamente',
        timer: 1500
      });

      // Resetear formulario
      setContactoForm({
        nombres: '',
        apellidos: '',
        telefono: '',
        email: '',
        id_proveedor: id
      });

    } catch (error) {
      console.error('Error:', error);
      hideLoading();
      setIsSubmitting(false); 
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al guardar el contacto'
      });
    }
  };

  const getNextSoporteId = async () => {
    try {
      // Obtener el máximo id_soporte actual
      const { data, error } = await supabase
        .from('soportes')
        .select('id_soporte')
        .order('id_soporte', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      // Si no hay registros, empezar desde 1
      if (!data) return 1;

      // Retornar el siguiente ID
      return data.id_soporte + 1;
    } catch (error) {
      console.error('Error al obtener siguiente ID:', error);
      throw error;
    }
  };

  const showLoading = () => {
    Swal.fire({
      title: 'Procesando...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  };

  const hideLoading = () => {
    Swal.close();
  };

  const prepararDatosSoporte = (datos) => {
    return {
      nombreidentificador: datos.nombreidentificador,
      bonificacionano: datos.bonificacionano === '' ? '0' : datos.bonificacionano,
      escala: datos.escala === '' ? '0' : datos.escala,
      estado: datos.estado
    };
  };

  const handleSoporteSubmit = async (e) => {
    e.preventDefault();
    setOpenSoporteModal(false);
    showLoading();

    try {
      let soporteId;
      if (soporteForm.id_soporte) {
        // Actualizar soporte existente
        const datosActualizados = prepararDatosSoporte(soporteForm);
        const { error } = await supabase
          .from('soportes')
          .update(datosActualizados)
          .eq('id_soporte', soporteForm.id_soporte);

        if (error) throw error;
        soporteId = soporteForm.id_soporte;
      } else {
        // Obtener el siguiente ID disponible
        const nextId = await getNextSoporteId();
        const datosNuevos = prepararDatosSoporte(soporteForm);

        // Crear nuevo soporte con ID específico
        const { data, error } = await supabase
          .from('soportes')
          .insert([{
            id_soporte: nextId,
            ...datosNuevos,
            id_proveedor: id
          }])
          .select('id_soporte')
          .single();

        if (error) throw error;
        soporteId = data.id_soporte;

        // Crear relación proveedor_soporte
        const { error: relError } = await supabase
          .from('proveedor_soporte')
          .insert([{
            id_proveedor: parseInt(id),
            id_soporte: soporteId
          }]);

        if (relError) throw relError;
      }

      // Actualizar relaciones con medios en paralelo
      if (soporteId) {
        await Promise.all([
          // Eliminar relaciones existentes
          supabase
            .from('soporte_medios')
            .delete()
            .eq('id_soporte', soporteId),
          
          // Si hay medios seleccionados, prepararlos para inserción
          selectedMedios.length > 0 
            ? supabase
                .from('soporte_medios')
                .insert(selectedMedios.map(medioId => ({
                  id_soporte: soporteId,
                  id_medio: parseInt(medioId)
                })))
            : Promise.resolve()
        ]);
      }

      // Actualizar datos en segundo plano
      fetchData();

      hideLoading();
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: soporteForm.id_soporte ? 'Soporte actualizado correctamente' : 'Soporte agregado correctamente',
        timer: 1500
      });

      // Resetear el formulario
      setSoporteForm({
        nombreidentificador: '',
        bonificacionano: '0',
        escala: '0',
        estado: true,
        id_proveedor: id
      });
      setSelectedMedios([]);

    } catch (error) {
      console.error('Error completo:', error);
      hideLoading();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al guardar el soporte: ' + (error.message || error.details || 'Error desconocido')
      });
    }
  };

  const handleMedioChange = (medioId) => {
    setSelectedMedios(prev => {
      if (prev.includes(medioId)) {
        return prev.filter(id => id !== medioId);
      } else {
        return [...prev, medioId];
      }
    });
  };

  const handleEditContacto = async (contacto) => {
    // Separar nombre completo en nombres y apellidos
    const nombreCompleto = contacto.nombre_contacto || '';
    const partes = nombreCompleto.split(' ');
    const nombres = partes.slice(0, -1).join(' ') || '';
    const apellidos = partes[partes.length - 1] || '';

    setContactoForm({
      id_contacto: contacto.id,
      nombres: nombres,
      apellidos: apellidos,
      telefono: contacto.telefono,
      email: contacto.email,
      id_proveedor: id
    });
    setOpenContactoModal(true);
  };

  const handleDeleteContacto = async (id_contacto) => {
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
            .from('contactos')
            .delete()
            .eq('id', id_contacto);

          if (error) throw error;

          await fetchData();
          Swal.fire(
            'Eliminado!',
            'El contacto ha sido eliminado.',
            'success'
          );
        } catch (error) {
          console.error('Error:', error);
          Swal.fire(
            'Error',
            'No se pudo eliminar el contacto',
            'error'
          );
        }
      }
    });
  };

  const handleEditSoporte = async (soporte) => {
      // Verificar si el soporte forma parte de una orden creada
      if (soporte.c_orden === true) {
        Swal.fire({
          icon: 'warning',
          title: 'No se puede editar',
          text: 'Este registro no se puede actualizar ya que forma parte de una Orden Creada.',
          confirmButtonColor: '#3085d6',
        });
        return;
      }
    try {
      showLoading();
      
      // Obtener los medios asociados al soporte
      const { data: mediosData, error: mediosError } = await supabase
        .from('soporte_medios')
        .select('id_medio')
        .eq('id_soporte', soporte.id_soporte);

      if (mediosError) throw mediosError;

      // Establecer el formulario con los datos del soporte
      setSoporteForm({
        id_soporte: soporte.id_soporte,
        nombreidentificador: soporte.nombreidentificador || '',
        bonificacionano: soporte.bonificacionano || '0',
        escala: soporte.escala || '0',
        estado: soporte.estado,
        id_proveedor: id
      });

      // Establecer los medios seleccionados
      setSelectedMedios(mediosData.map(m => m.id_medio));

      hideLoading();
      // Abrir el modal
      setOpenSoporteModal(true);
    } catch (error) {
      console.error('Error al cargar datos para edición:', error);
      hideLoading();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar los datos para edición'
      });
    }
  };

  const handleDeleteSoporte = async (id_soporte) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        showLoading();

        // Ejecutar todas las eliminaciones en paralelo
        await Promise.all([
          // Eliminar relaciones de medios
          supabase
            .from('soporte_medios')
            .delete()
            .eq('id_soporte', id_soporte),

          // Eliminar relación proveedor_soporte
          supabase
            .from('proveedor_soporte')
            .delete()
            .eq('id_soporte', id_soporte),

          // Eliminar el soporte
          supabase
            .from('soportes')
            .delete()
            .eq('id_soporte', id_soporte)
        ]);

        // Actualizar datos en segundo plano
        fetchData();

        hideLoading();
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El soporte ha sido eliminado correctamente',
          timer: 1500
        });
      }
    } catch (error) {
      console.error('Error:', error);
      hideLoading();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al eliminar el soporte'
      });
    }
  };

  const handleEstadoChange = async (event, id_soporte) => {
    const newEstado = event.target.checked;
    try {
      const { error } = await supabase
        .from('soportes')
        .update({ estado: newEstado })
        .eq('id_soporte', id_soporte);

      if (error) throw error;

      // Actualizar el estado en la interfaz
      setSoportes(soportes.map(soporte =>
        soporte.id_soporte === id_soporte ? { ...soporte, estado: newEstado } : soporte
      ));

      await Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `El soporte ha sido ${newEstado ? 'activado' : 'desactivado'}`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating estado:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el estado del soporte'
      });
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    if (!validarFormularioProveedor()) {
      Swal.fire({
        icon: 'error',
        title: 'Error de validación',
        text: 'Por favor, corrija los errores antes de guardar'
      });
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('proveedores')
        .update(editForm)
        .eq('id_proveedor', id);

      if (error) throw error;

      await fetchData();
      setOpenEditModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Proveedor actualizado',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el proveedor'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const CustomCheckboxList = ({ medios, selectedMedios, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const handleToggle = () => setIsOpen(!isOpen);
    
    const handleCheckboxChange = (medioId) => {
      const newSelection = selectedMedios.includes(medioId)
        ? selectedMedios.filter(id => id !== medioId)
        : [...selectedMedios, medioId];
      onChange(newSelection);
    };

    return (
      <FormControl fullWidth>
        <Box sx={{ position: 'relative' }}>
          <Box
            onClick={handleToggle}
            sx={{
              border: '1px solid #ccc',
              borderRadius: 1,
              p: 1,
              minHeight: '40px',
              cursor: 'pointer',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.5
            }}
          >
            {selectedMedios.length > 0 ? (
              selectedMedios.map(medioId => {
                const medio = medios.find(m => m.id === medioId);
                return medio ? (
                  <Chip
                    key={medio.id}
                    label={medio.nombre_medio}
                    onDelete={() => handleCheckboxChange(medio.id)}
                    size="small"
                  />
                ) : null;
              })
            ) : (
              <Typography color="text.secondary">Seleccionar medios</Typography>
            )}
          </Box>
          {isOpen && (
            <Paper
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                mt: 1,
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: 3
              }}
            >
              <Box sx={{ p: 1 }}>
                {medios.map((medio) => (
                  <FormControlLabel
                    key={medio.id}
                    control={
                      <Checkbox
                        checked={selectedMedios.includes(medio.id)}
                        onChange={() => handleCheckboxChange(medio.id)}
                      />
                    }
                    label={medio.nombre_medio}
                  />
                ))}
              </Box>
            </Paper>
          )}
        </Box>
      </FormControl>
    );
  };

  if (!proveedor) return <div>Cargando...</div>;

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
           {/* Breadcrumb */}
           <Box sx={{ mb: 3, mt: 2 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Link
            to="/proveedores"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <GroupIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Proveedores
          </Link>
          <Typography
            color="text.primary"
            sx={{
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <PersonIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            {proveedor?.nombreproveedor}
          </Typography>
        </Breadcrumbs>
      </Box>
      <Grid container spacing={3}>
        {/* Contenedor izquierdo */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2,
              width: '100%',
              position: 'relative'
            }}
          >
            <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
              <IconButton
                size="small"
                color="primary"
                onClick={() => setOpenEditModal(true)}
              >
                <i className="fas fa-edit" style={{ color: 'white' }} />
              </IconButton>
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: '#4F46E5',
                textAlign: 'center',
                mb: 1
              }}
            >
              {proveedor?.nombreproveedor || `Proveedor ${id}`}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#6B7280',
                textAlign: 'center',
                mb: 0.5
              }}
            >
              Registrado el: {new Date(proveedor?.created_at).toLocaleDateString()}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#6B7280',
                textAlign: 'center'
              }}
            >
              RUT: {proveedor?.rut || proveedor?.rutproveedor || '-'}
            </Typography>
          </Paper>
        </Grid>

        {/* Contenedor derecho */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3}>
            <Box sx={{ padding:1, width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={(e, newValue) => setValue(newValue)}>
                  <Tab label="Datos Generales" />
                  <Tab label="Datos de Facturación" />
                  <Tab label="Contactos" />
                  <Tab label="Soportes" />
                </Tabs>
              </Box>

              {/* Panel de Datos Generales */}
              <Box role="tabpanel" hidden={value !== 0} sx={{ p: 3 }}>
                {value === 0 && (
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <div className="mb-4">
                        <Typography variant="subtitle2" color="textSecondary">
                          Razón Social
                        </Typography>
                        <Typography variant="body1">{proveedor?.razonsocial || proveedor?.razonSocial || 'Televisión Nacional de Chile S.A.'}</Typography>
                      </div>
                    </Grid>
                    <Grid item xs={6}>
                      <div className="mb-4">
                        <Typography variant="subtitle2" color="textSecondary">
                          Nombre Fantasía
                        </Typography>
                        <Typography variant="body1">{proveedor?.nombrefantasia || '-'}</Typography>
                      </div>
                    </Grid>
                    <Grid item xs={6}>
                      <div className="mb-4">
                        <Typography variant="subtitle2" color="textSecondary">
                          Giro
                        </Typography>
                        <Typography variant="body1">{proveedor?.giro || proveedor?.giroProveedor || 'Medios de Comunicación'}</Typography>
                      </div>
                    </Grid>
                    <Grid item xs={6}>
                      <div className="mb-4">
                        <Typography variant="subtitle2" color="textSecondary">
                          Región
                        </Typography>
                        <Typography variant="body1">{proveedor?.region?.nombreregion || proveedor?.Region?.nombreregion || '-'}</Typography>
                      </div>
                    </Grid>
                    <Grid item xs={6}>
                      <div className="mb-4">
                        <Typography variant="subtitle2" color="textSecondary">
                          Comuna
                        </Typography>
                        <Typography variant="body1">{proveedor?.comunas?.nombrecomuna || proveedor?.Comunas?.nombreComuna || '-'}</Typography>
                      </div>
                    </Grid>
                    <Grid item xs={6}>
                      <div className="mb-4">
                        <Typography variant="subtitle2" color="textSecondary">
                          Dirección
                        </Typography>
                        <Typography variant="body1">{proveedor?.direccion_facturacion || proveedor?.direccionFacturacion || '-'}</Typography>
                      </div>
                    </Grid>
                  </Grid>
                )}
              </Box>

              {/* Panel de Datos de Facturación */}
              <Box role="tabpanel" hidden={value !== 1} sx={{ p: 3 }}>
                {value === 1 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={2}>
                        <Typography><strong>Email:</strong> {proveedor?.email || '-'}</Typography>
                        <Typography><strong>Teléfono Celular:</strong> {proveedor?.telefono_celular || proveedor?.telcelular || '-'}</Typography>
                        <Typography><strong>Teléfono Fijo:</strong> {proveedor?.telefono_fijo || proveedor?.telfijo || '-'}</Typography>
                        <Typography><strong>Identificador:</strong> {proveedor?.identificador || '-'}</Typography>
                        <Typography><strong>Bonificación Año:</strong> {proveedor?.bonificacion_anio || proveedor?.bonificacionano || '-'}</Typography>
                        <Typography><strong>Escala Rango:</strong> {proveedor?.escala_rango || '-'}</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                )}
              </Box>

              {/* Panel de Contactos */}
              <Box role="tabpanel" hidden={value !== 2} sx={{ p: 3 }}>
                {value === 2 && (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Button 
                        variant="contained" 
                        onClick={() => {
                          setContactoForm({
                            nombres: '',
                            apellidos: '',
                            telefono: '',
                            email: '',
                            id_proveedor: id
                          });
                          setOpenContactoModal(true);
                        }}
                      >
                        Agregar Contacto
                      </Button>
                    </Box>
                    <DataGrid
                      rows={contactos}
                      columns={[
                        { field: 'nombre_contacto', headerName: 'Nombre Completo', flex: 1.5 },
                        { field: 'cargo', headerName: 'Cargo', flex: 1 },
                        { field: 'telefono', headerName: 'Teléfono', flex: 1 },
                        { field: 'email', headerName: 'Email', flex: 1.5 },
                        {
                          field: 'actions',
                          headerName: 'Acciones',
                          flex: 0.7,
                          renderCell: (params) => (
                            <>
                              <IconButton
                                color="primary"
                                onClick={() => handleEditContacto(params.row)}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteContacto(params.row.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </>
                          )
                        }
                      ]}
                      pageSize={5}
                      rowsPerPageOptions={[5]}
                      disableSelectionOnClick
                      autoHeight
                    />
                  </>
                )}
              </Box>

              {/* Panel de Soportes */}
              <Box role="tabpanel" hidden={value !== 3} sx={{ p: 3 }}>
                {value === 3 && (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Button 
                        variant="contained" 
                        onClick={() => setOpenSoporteModal(true)}
                      >
                        Agregar Soporte
                      </Button>
                    </Box>
                    <DataGrid
                      rows={soportes}
                      columns={[
                        { field: 'nombreidentificador', headerName: 'Identificador', flex: 1.5 },
                        {
                          field: 'medios',
                          headerName: 'Medios',
                          flex: 2,
                          renderCell: (params) => {
                            const mediosArray = params.row.medios || [];
                            return mediosArray.length > 0 ? mediosArray.join(', ') : 'Sin medios asignados';
                          }
                        },
                        { field: 'bonificacionano', headerName: 'Bonificación %', flex: 1, renderCell: (params) => `${params.value || 0}%` },
                        { field: 'escala', headerName: 'Escala', flex: 1, renderCell: (params) => params.value || 0 },
                        { 
                          field: 'estado', 
                          headerName: 'Estado', 
                          flex: 0.7,
                          renderCell: (params) => (
                            <Switch
                              checked={params.row.estado}
                              onChange={(e) => handleEstadoChange(e, params.row.id_soporte)}
                              size="small"
                            />
                          )
                        },
                        {
                          field: 'actions',
                          headerName: 'Acciones',
                          flex: 1,
                          renderCell: (params) => (
                            <>
                              <IconButton
                                color="info"
                                onClick={() => navigate(`/soportes/view/${params.row.id_soporte}`)}
                                title="Ver detalle del soporte"
                              >
                                <VisibilityIcon />
                              </IconButton>
                              <IconButton
                                color="primary"
                                onClick={() => handleEditSoporte(params.row)}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton 
                                color="error"
                                onClick={() => handleDeleteSoporte(params.row.id_soporte)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </>
                          )
                        }
                      ]}
                      pageSize={5}
                      rowsPerPageOptions={[5]}
                      disableSelectionOnClick
                      autoHeight
                    />
                  </>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Modales */}
      <Dialog open={openContactoModal} onClose={() => !isSubmitting && setOpenContactoModal(false)}>
        <DialogTitle>
          {contactoForm.id_contacto ? 'Editar Contacto' : 'Agregar Contacto'}
        </DialogTitle>
        <form onSubmit={handleContactoSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombres"
                  name="nombres"
                  value={contactoForm.nombres}
                  onChange={(e) => setContactoForm({ ...contactoForm, nombres: e.target.value })}
                  disabled={isSubmitting}
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
                  fullWidth
                  label="Apellidos"
                  name="apellidos"
                  value={contactoForm.apellidos}
                  onChange={(e) => setContactoForm({ ...contactoForm, apellidos: e.target.value })}
                  disabled={isSubmitting}
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="telefono"
                  value={contactoForm.telefono}
                  onChange={(e) => setContactoForm({ ...contactoForm, telefono: e.target.value })}
                  disabled={isSubmitting}
                  required
                  error={!!errors.contactoTelefono}
                  helperText={errors.contactoTelefono}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={contactoForm.email}
                  onChange={(e) => setContactoForm({ ...contactoForm, email: e.target.value })}
                  disabled={isSubmitting}
                  required
                  error={!!errors.contactoEmail}
                  helperText={errors.contactoEmail}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => !isSubmitting && setOpenContactoModal(false)} 
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog 
        open={openSoporteModal} 
        onClose={() => setOpenSoporteModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {soporteForm.id_soporte ? 'Editar Soporte' : 'Agregar Soporte'}
        </DialogTitle>
        <form onSubmit={handleSoporteSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre Identificador"
                  name="nombreidentificador"
                  value={soporteForm.nombreidentificador}
                  onChange={(e) => setSoporteForm({...soporteForm, nombreidentificador: e.target.value})}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
          
                <CustomCheckboxList
                  medios={medios}
                  selectedMedios={selectedMedios}
                  onChange={setSelectedMedios}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bonificación Año"
                  name="bonificacionano"
                  type="text"
                  value={soporteForm.bonificacionano}
                  onChange={(e) => setSoporteForm({...soporteForm, bonificacionano: e.target.value})}
                  sx={{ mt: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PercentIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Escala"
                  name="escala"
                  value={soporteForm.escala}
                  onChange={(e) => setSoporteForm({...soporteForm, escala: e.target.value})}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ScaleIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSoporteModal(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {soporteForm.id_soporte ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog 
        open={openEditModal} 
        onClose={() => setOpenEditModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Editar Proveedor
        </DialogTitle>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSaveEdit();
        }}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre Proveedor"
                  name="nombreproveedor"
                  value={editForm.nombreproveedor}
                  onChange={handleEditInputChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Razón Social"
                  name="razonSocial"
                  value={editForm.razonSocial}
                  onChange={handleEditInputChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre Fantasía"
                  name="nombrefantasia"
                  value={editForm.nombrefantasia}
                  onChange={handleEditInputChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="RUT Proveedor"
                  name="rutproveedor"
                  value={editForm.rutproveedor}
                  onChange={handleEditInputChange}
                  required
                  error={!!errors.rutproveedor}
                  helperText={errors.rutproveedor}
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
                  fullWidth
                  label="Giro Proveedor"
                  name="giroProveedor"
                  value={editForm.giroProveedor}
                  onChange={handleEditInputChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WorkIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre Representante"
                  name="nombreRepresentante"
                  value={editForm.nombreRepresentante}
                  onChange={handleEditInputChange}
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
                  fullWidth
                  label="RUT Representante"
                  name="rutRepresentante"
                  value={editForm.rutRepresentante}
                  onChange={handleEditInputChange}
                  required
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
                  fullWidth
                  label="Dirección Facturación"
                  name="direccionFacturacion"
                  value={editForm.direccionFacturacion}
                  onChange={handleEditInputChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Región"
                  name="id_region"
                  value={editForm.id_region}
                  onChange={handleEditInputChange}
                  select
                  SelectProps={{ native: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon />
                      </InputAdornment>
                    ),
                  }}
                >
                  <option value="">Seleccione una región</option>
                  {Object.keys(regiones).map((id) => (
                    <option key={id} value={id}>{regiones[id]}</option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Comuna"
                  name="id_comuna"
                  value={editForm.id_comuna}
                  onChange={handleEditInputChange}
                  select
                  SelectProps={{ native: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon />
                      </InputAdornment>
                    ),
                  }}
                >
                  <option value="">Seleccione una comuna</option>
                  {Object.keys(comunas)
                    .filter(comunaId => {
                      const comuna = comunasData.find(c => c.id_comuna === parseInt(comunaId));
                      return comuna && comuna.id_region === parseInt(editForm.id_region);
                    })
                    .sort((a, b) => {
                      const comunaA = comunasData.find(c => c.id_comuna === parseInt(a));
                      const comunaB = comunasData.find(c => c.id_comuna === parseInt(b));
                      return (comunaA?.nombrecomuna || '').localeCompare(comunaB?.nombrecomuna || '', 'es', { sensitivity: 'base' });
                    })
                    .map((comunaId) => {
                      const comuna = comunasData.find(c => c.id_comuna === parseInt(comunaId));
                      return (
                        <option key={comunaId} value={comunaId}>
                          {comuna?.nombrecomuna || comuna?.nombreComuna || ''}
                        </option>
                      );
                    })}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Teléfono Celular"
                  name="telcelular"
                  value={editForm.telcelular}
                  onChange={handleEditInputChange}
                  error={!!errors.telcelular}
                  helperText={errors.telcelular || 'Formato: +569XXXXXXXX'}
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
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Teléfono Fijo"
                  name="telfijo"
                  value={editForm.telfijo}
                  onChange={handleEditInputChange}
                  error={!!errors.telfijo}
                  helperText={errors.telfijo || 'Formato: +562XXXXXXX'}
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
                  <Typography color="error" variant="caption">
                    {errors.telefono}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditInputChange}
                  required
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
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editForm.estado}
                      onChange={(e) => handleEditInputChange({
                        target: {
                          name: 'estado',
                          value: e.target.checked
                        }
                      })}
                    />
                  }
                  label="Estado"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditModal(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default ViewProveedor;
