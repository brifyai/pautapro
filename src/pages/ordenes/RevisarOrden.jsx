import React, { useState, useEffect } from 'react';
import EditarAlternativaReemplazo from '../../components/alternativas/EditarAlternativaReemplazo';
import { useNavigate } from 'react-router-dom';
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
    IconButton
} from '@mui/material';
import { 
    Search as SearchIcon,
    Print as PrintIcon,
    Cancel as CancelIcon,
    SwapHoriz as SwapHorizIcon,
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { supabase } from '../../config/supabase';
import { safeFetchClientes } from '../../services/dataNormalization';
import Swal from 'sweetalert2';


const RevisarOrden = () => {
    const navigate = useNavigate();
    const [openClienteModal, setOpenClienteModal] = useState(true);
    const [modifiedAlternatives, setModifiedAlternatives] = useState([]);
    const [isCreatingNewAlternative, setIsCreatingNewAlternative] = useState(false);
    const handleClose = () => {
    navigate('/');
    };
	const [openReplaceModal, setOpenReplaceModal] = useState(false);
    const [selectedAlternativeToReplace, setSelectedAlternativeToReplace] = useState(null);
    const [openCampanaModal, setOpenCampanaModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [clientes, setClientes] = useState([]);
    const [campanas, setCampanas] = useState([]);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [selectedCampana, setSelectedCampana] = useState(null);
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [alternatives, setAlternatives] = useState([]);
    const [selectedAlternative, setSelectedAlternative] = useState(null);

	
    const handlePrint = async () => {
    if (!selectedOrder) {
    Swal.fire({
    icon: 'warning',
    title: 'Selección requerida',
    text: 'Por favor, seleccione una orden para imprimir'
    });
    return;
    }

    try {
    await generateOrderPDF(
    selectedOrder,
    alternatives, // Pass all alternatives of the selected order
    selectedCliente,
    selectedCampana
    );
    } catch (error) {
    console.error('Error al generar PDF:', error);
    Swal.fire({
    icon: 'error',
    title: 'Error',
    text: 'No se pudo generar el PDF'
    });
    }
    };
        // Función para obtener y mostrar información detallada del contrato
        const fetchContratoInfo = async (id_contrato) => {
            try {
                const { data, error } = await supabase
                    .from('contratos')
                    .select(`
                        *,
                        cliente:Clientes(*),
                        proveedor:Proveedores(*),
                        medio:Medios(*),
                        formaPago:FormaDePago(*),
                        tipoOrden:TipoGeneracionDeOrden(*)
                    `)
                    .eq('id', id_contrato)
                    .single();
    
                if (error) throw error;
    
                console.log('Información del contrato:', data);
                console.log('Medio asociado (IdMedios):', data.medio);
                console.log('Tipo de generación de orden:', data.tipoOrden);
    
                return data;
            } catch (error) {
                console.error('Error al obtener información del contrato:', error);
                return null;
            }
        };
// Modificar la función handleEditAlternative para manejar alternativas temporales
const handleEditAlternative = (alternativa) => {
    // Si es una alternativa temporal, obtenerla del sessionStorage
    if (alternativa.id && alternativa.id.toString().startsWith('temp_')) {
        const tempAlternativas = JSON.parse(sessionStorage.getItem('tempAlternativas') || '[]');
        const tempAlternativa = tempAlternativas.find(alt => alt.id === alternativa.id);
        
        if (tempAlternativa) {
            setSelectedAlternativeToReplace(tempAlternativa);
            return;
        }
    }
    
    // Si no es temporal o no se encontró, usar la alternativa proporcionada
    setSelectedAlternativeToReplace(alternativa);
};
 // Modificamos la función handleCancel
 const handleCancel = async () => {
    if (!selectedOrder) {
    Swal.fire({
    icon: 'warning',
    title: 'Selección requerida',
    text: 'Por favor, seleccione una orden para anular'
    });
    return;
    }
  
    const result = await Swal.fire({
    title: '¿Está seguro?',
    text: "Esta orden será anulada y no podrá revertir esta acción",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, anular',
    cancelButtonText: 'Cancelar'
    });
  
    if (result.isConfirmed) {
    try {
    setLoading(true);
    
    // Eliminamos la actualización de la tabla alternativa ya que no tiene campo estado
    // Solo actualizamos la orden principal
    const { error: ordenError } = await supabase
    .from('ordenesdepublicidad')
    .update({ estado: 'anulada' })
    .eq('id_ordenes_de_comprar', selectedOrder.id_ordenes_de_comprar);
  
    if (ordenError) throw ordenError;
  
    Swal.fire(
    'Anulada',
    'La orden ha sido anulada correctamente',
    'success'
    );
  
    // Actualizamos la lista de órdenes para reflejar el cambio
    fetchOrders(selectedCampana.id_campania);
    
    // Actualizamos las alternativas si hay una orden seleccionada
    if (selectedOrder) {
    fetchAlternatives(selectedOrder.alternativas_plan_orden);
    }
    
    // Actualizamos el estado de la orden seleccionada en el estado local
    setSelectedOrder({
    ...selectedOrder,
    estado: 'anulada'
    });
    
    } catch (error) {
    console.error('Error al anular:', error);
    Swal.fire({
    icon: 'error',
    title: 'Error',
    text: 'No se pudo anular la orden'
    });
    } finally {
    setLoading(false);
    }
    }
  };
  const handleCancelAndReplace = () => {
    if (!selectedOrder) {
        Swal.fire({
            icon: 'warning',
            title: 'Selección requerida',
            text: 'Por favor, seleccione una orden para anular y reemplazar'
        });
        return;
    }

    // Inicializar las alternativas modificadas con las alternativas actuales
    setModifiedAlternatives([...alternatives]);
    setOpenReplaceModal(true);
};
   // Agregar función para manejar la creación de una nueva alternativa
   const handleCreateNewAlternative = async () => {
    try {
        setLoading(true);
        
        // Obtener información del contrato y soporte directamente de la orden
        const { data: ordenData, error: ordenError } = await supabase
            .from('ordenesdepublicidad')
            .select(`
                id_ordenes_de_comprar,
                id_contrato,
                id_soporte,
                Contratos (
                    id,
                    nombrecontrato
                ),
                Soportes (
                    id_soporte,
                    nombreidentificador
                )
            `)
            .eq('id_ordenes_de_comprar', selectedOrder.id_ordenes_de_comprar)
            .single();
        
        if (ordenError) {
            console.error('Error al obtener datos de la orden:', ordenError);
            throw ordenError;
        }
        
        // Obtener el contrato y soporte de la primera alternativa existente (si hay alguna)
        // o directamente de la orden
        const baseAlternative = modifiedAlternatives.length > 0 ? modifiedAlternatives[0] : null;
        
        // Obtener información del plan para extraer año y mes
        const { data: planData, error: planError } = await supabase
            .from('plan')
            .select('anio, mes')
            .eq('id', selectedOrder.id_plan)
            .single();
            
        if (planError) {
            console.error('Error al obtener información del plan:', planError);
            throw planError;
        }
        
        setIsCreatingNewAlternative(true);
        setSelectedAlternativeToReplace({
            numerorden: selectedOrder?.id_ordenes_de_comprar, // Usar numerorden en lugar de id_orden
            // Usar datos de alternativa existente o de la orden
            num_contrato: baseAlternative?.num_contrato || ordenData?.id_contrato, // Usar num_contrato en lugar de id_contrato
            id_soporte: baseAlternative?.id_soporte || ordenData?.id_soporte,
            // También incluimos los objetos relacionados para mostrarlos en los campos de solo lectura
            Contratos: baseAlternative?.Contratos || ordenData?.Contratos,
            Soportes: baseAlternative?.Soportes || ordenData?.Soportes,
            // Usar los valores de año y mes del plan
            anio: planData?.anio || null,
            mes: planData?.mes || null,
            // Incluir id_campania de la orden
            id_campania: selectedOrder.id_campania,
            // Inicializar el calendario como un array vacío
            calendar: '[]',
            cantidades: [] // Inicializar cantidades para la UI
        });
    } catch (error) {
        console.error('Error al crear nueva alternativa:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo crear la nueva alternativa: ' + error.message
        });
    } finally {
        setLoading(false);
    }
};
// Modifica la función handleSaveModifiedAlternative para asignar correctamente el número de orden
const handleSaveModifiedAlternative = (modifiedAlternative) => {
    console.log('Guardando alternativa modificada:', modifiedAlternative);
    
    // Crear una copia para no modificar el original
    const alternativaCopy = { ...modifiedAlternative };
    
    // Asegurarse de que calendar sea un string JSON si cantidades existe
    if (alternativaCopy.cantidades && Array.isArray(alternativaCopy.cantidades)) {
        alternativaCopy.calendar = alternativaCopy.cantidades;
        delete alternativaCopy.cantidades;
    } else if (alternativaCopy.calendar && typeof alternativaCopy.calendar === 'string') {
        try {
            alternativaCopy.calendar = JSON.parse(alternativaCopy.calendar);
        } catch (e) {
            console.error('Error al parsear calendar:', e);
            alternativaCopy.calendar = [];
        }
    }
    
    // Cambiar id_orden a numerorden si existe
    if (alternativaCopy.id_orden !== undefined) {
        alternativaCopy.numerorden = alternativaCopy.id_orden;
        delete alternativaCopy.id_orden;
    }
    
    // Cambiar id_contrato a num_contrato si existe
    if (alternativaCopy.id_contrato !== undefined) {
        alternativaCopy.num_contrato = alternativaCopy.id_contrato;
        delete alternativaCopy.id_contrato;
    }
    
    // Cambiar id_medio a medio si existe
    if (alternativaCopy.id_medio !== undefined) {
        alternativaCopy.medio = alternativaCopy.id_medio;
        delete alternativaCopy.id_medio;
    }
    
    setModifiedAlternatives(prevAlternatives => {
        // Verificar si esta alternativa ya existe en nuestra lista modificada
        const existingIndex = prevAlternatives.findIndex(alt => String(alt.id) === String(alternativaCopy.id));
        
        // Si la alternativa tiene un ID que no es temporal (es una pre-cargada)
        // y no es una alternativa que ya hayamos reemplazado antes
        if (existingIndex >= 0 && 
            !String(alternativaCopy.id).startsWith('temp_') && 
            !alternativaCopy._isReplacement) {
            
            // Crear una nueva alternativa con ID temporal que reemplaza a la original
            const newTempId = `temp_${Date.now()}`;
            
            // Guardar una copia completa de la alternativa original para referencia
            const originalData = prevAlternatives[existingIndex];
            
            const replacementAlternative = {
                ...alternativaCopy,
                id: newTempId,
                original_id: alternativaCopy.id, // Guardar referencia al ID original
                _isReplacement: true, // Marcar como reemplazo
                _lastUpdated: new Date().getTime(),
                // Mantener el mismo número de orden
                numerorden: alternativaCopy.numerorden || selectedOrder.numero_correlativo
                // No guardar _originalData ya que no existe en la tabla
            };
            
            console.log('Reemplazando alternativa pre-cargada con nueva versión:', replacementAlternative);
            
            // Filtrar la alternativa original y agregar la nueva versión
            return [
                ...prevAlternatives.filter(alt => String(alt.id) !== String(alternativaCopy.id)),
                replacementAlternative
            ];
        } 
        // Si es una alternativa temporal o ya es un reemplazo, solo actualizamos sus datos
        else if (existingIndex >= 0) {
            const updatedAlternatives = [...prevAlternatives];
            updatedAlternatives[existingIndex] = {
                ...alternativaCopy,
                _lastUpdated: new Date().getTime(),
                // Asegurarse de mantener el mismo número de orden
                numerorden: prevAlternatives[existingIndex].numerorden || selectedOrder.numero_correlativo
            };
            
            console.log('Actualizando alternativa temporal:', updatedAlternatives[existingIndex]);
            return updatedAlternatives;
        } 
        // Si es una alternativa completamente nueva
        else {
            const newTempId = `temp_${Date.now()}`;
            const newAlternative = {
                ...alternativaCopy,
                id: String(alternativaCopy.id).startsWith('temp_') ? alternativaCopy.id : newTempId,
                numerorden: selectedOrder.numero_correlativo,
                _lastUpdated: new Date().getTime()
            };
            console.log('Nueva alternativa agregada:', newAlternative);
            return [...prevAlternatives, newAlternative];
        }
    });
    
    // Mostrar mensaje de confirmación
    Swal.fire({
        icon: 'success',
        title: 'Guardado',
        text: 'La alternativa ha sido guardada correctamente',
        timer: 1500,
        showConfirmButton: false
    });
    
    // Limpiar la selección para volver a la lista
    setSelectedAlternativeToReplace(null);
    setIsCreatingNewAlternative(false);
};
    
    // Agregar función para eliminar una alternativa (solo de la lista temporal)
    const handleDeleteAlternative = (alternativeId) => {
        setModifiedAlternatives(prevAlternatives => 
            prevAlternatives.filter(alt => alt.id !== alternativeId)
        );
    };

   // Agregar función para guardar y reemplazar la orden
// Modifica la función handleSaveAndReplaceOrder para corregir el tipo de dato
const handleSaveAndReplaceOrder = async () => {
    try {
        setLoading(true);
        
        // 1. Marcar la orden original como anulada
        const { error: cancelError } = await supabase
            .from('ordenesdepublicidad')
            .update({ 
                estado: 'anulada'
            })
            .eq('id_ordenes_de_comprar', selectedOrder.id_ordenes_de_comprar);
        
        if (cancelError) throw cancelError;
        
        // 2. Crear una nueva orden con los datos base de la orden original
        const { data: newOrder, error: newOrderError } = await supabase
            .from('ordenesdepublicidad')
            .insert({
                numero_correlativo: selectedOrder.numero_correlativo,
                id_plan: selectedOrder.id_plan,
                id_campania: selectedOrder.id_campania,
                id_contrato: selectedOrder.id_contrato,
                id_soporte: selectedOrder.id_soporte,
                usuario_registro: selectedOrder.usuario_registro,
                estado: 'activa',
                // Corregir la lógica para el campo copia
                copia: selectedOrder.copia === null || selectedOrder.copia === undefined ? 2 : (selectedOrder.copia + 1),
                orden_remplaza: selectedOrder.id_ordenes_de_comprar
            })
            .select();
        
        if (newOrderError) throw newOrderError;
        
        // 3. Crear nuevas alternativas basadas en las modificadas
        const newAlternativesPromises = modifiedAlternatives.map(async (alt) => {
            // Crear una copia para no modificar el original
            const alternativaData = { ...alt };
            
            // Eliminar el id si es temporal o si es una alternativa reemplazada
            if (alternativaData.id && (
                String(alternativaData.id).startsWith('temp_') || 
                alternativaData._isReplacement
            )) {
                delete alternativaData.id;
            }
            
            // IMPORTANTE: Siempre eliminar el ID para permitir que la base de datos genere uno nuevo
            delete alternativaData.id;
            
            // Eliminar campos internos de control que no existen en la tabla
            delete alternativaData._lastUpdated;
            delete alternativaData._isReplacement;
            delete alternativaData.original_id;
            delete alternativaData._originalData;
            
            // Corregir los nombres de las columnas
            // Cambiar id_anio a anio si existe
            if (alternativaData.id_anio !== undefined) {
                alternativaData.anio = alternativaData.id_anio;
                delete alternativaData.id_anio;
            }
            
            // Cambiar id_mes a mes si existe
            if (alternativaData.id_mes !== undefined) {
                alternativaData.mes = alternativaData.id_mes;
                delete alternativaData.id_mes;
            }
            
            // Cambiar id_orden a numerorden si existe
            if (alternativaData.id_orden !== undefined) {
                alternativaData.numerorden = alternativaData.id_orden;
                delete alternativaData.id_orden;
            }
            
            // Cambiar id_contrato a num_contrato si existe
            if (alternativaData.id_contrato !== undefined) {
                alternativaData.num_contrato = alternativaData.id_contrato;
                delete alternativaData.id_contrato;
            }
            
            // Cambiar id_medio a medio si existe
            if (alternativaData.id_medio !== undefined) {
                alternativaData.medio = alternativaData.id_medio;
                delete alternativaData.id_medio;
            }
            
           // Asegurarse de que calendar sea un string JSON
           if (alternativaData.cantidades && Array.isArray(alternativaData.cantidades)) {
            // Guardar directamente el array de cantidades como calendar
            alternativaData.calendar = alternativaData.cantidades;
            delete alternativaData.cantidades;
        } else if (alternativaData.calendar && typeof alternativaData.calendar === 'string') {
            // Si calendar ya es un string, parsearlo para convertirlo a array
            try {
                alternativaData.calendar = JSON.parse(alternativaData.calendar);
            } catch (e) {
                console.error('Error al parsear calendar:', e);
                alternativaData.calendar = [];
            }
        }
            
            // Eliminar objetos relacionados que no deben insertarse
            delete alternativaData.Anios;
            delete alternativaData.Meses;
            delete alternativaData.Contratos;
            delete alternativaData.Soportes;
            delete alternativaData.Clasificacion;
            delete alternativaData.Temas;
            delete alternativaData.Programas;
            delete alternativaData.Medios;
            
            // Asegurarse de que los campos booleanos sean números
            Object.keys(alternativaData).forEach(key => {
                if (typeof alternativaData[key] === 'boolean') {
                    alternativaData[key] = alternativaData[key] ? 1 : 0;
                }
            });
            
            // Asegurarse de que id_campania esté incluido
            alternativaData.id_campania = selectedOrder.id_campania;
            
            console.log('Insertando alternativa con datos:', alternativaData);
            
            // Crear nueva alternativa
            const { data: newAlternative, error: altError } = await supabase
                .from('alternativa')
                .insert({
                    ...alternativaData,
                    // Usar numero_correlativo en lugar de id_ordenes_de_comprar para numerorden
                    numerorden: newOrder[0].numero_correlativo,
                    // Establecer copia igual que en la orden
                    copia: newOrder[0].copia
                })
                .select();
            
            if (altError) {
                console.error('Error al insertar alternativa:', altError);
                throw altError;
            }
            
            return newAlternative[0];
        });
        
        // Esperar a que todas las alternativas se creen y obtener los resultados
        const createdAlternatives = await Promise.all(newAlternativesPromises);
        
        // 4. Actualizar la nueva orden con la lista de IDs de alternativas
        const alternativeIds = createdAlternatives.map(alt => alt.id);
        
        const { error: updateOrderError } = await supabase
            .from('ordenesdepublicidad')
            .update({
                alternativas_plan_orden: alternativeIds
            })
            .eq('id_ordenes_de_comprar', newOrder[0].id_ordenes_de_comprar);
        
        if (updateOrderError) throw updateOrderError;
        
        // 5. Registrar en la tabla plan_alternativas
        const planAlternativasData = alternativeIds.map(altId => ({
            id_plan: selectedOrder.id_plan,
            id_alternativa: altId
        }));
        
        console.log('Insertando en plan_alternativas:', planAlternativasData);
        
        const { error: planAltError } = await supabase
            .from('plan_alternativas')
            .insert(planAlternativasData);
        
        if (planAltError) {
            console.error('Error al insertar en plan_alternativas:', planAltError);
            throw planAltError;
        }
        
        // 6. Limpiar las alternativas temporales del sessionStorage
        sessionStorage.removeItem('tempAlternativas');
        
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'La orden ha sido anulada y reemplazada correctamente'
        });
        
        // Actualizar la lista de órdenes
        fetchOrders(selectedCampana.id_campania);
        setOpenReplaceModal(false);
        
    } catch (error) {
        console.error('Error al anular y reemplazar:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo anular y reemplazar la orden: ' + error.message
        });
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
    fetchClientes();
    }, []);

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
    // Obtener campañas con relación a productos
    const { data, error } = await supabase
    .from('campania')
    .select(`
    *,
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
    
    console.log('🔍 DEBUG: Campañas recibidas con productos:', data);
    
    // Para cada campaña, verificar si tiene órdenes
    const campaniasConOrdenes = await Promise.all(
        (data || []).map(async (campana) => {
            const { data: ordenesCount, error: countError } = await supabase
                .from('ordenesdepublicidad')
                .select('id_ordenes_de_comprar')
                .eq('id_campania', campana.id_campania);
            
            return {
                ...campana,
                tieneOrdenes: !countError && ordenesCount.length > 0,
                cantidadOrdenes: ordenesCount?.length || 0
            };
        })
    );
    
    setCampanas(campaniasConOrdenes || []);
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
    fetchOrders(campana.id_campania);
    };

    const handleResetSelection = () => {
    setSelectedCliente(null);
    setSelectedCampana(null);
    setOpenClienteModal(true);
    };

    const fetchOrders = async (campaignId) => {
    try {
    setLoading(true);
    const { data, error } = await supabase
    .from('ordenesdepublicidad')
    .select(`
    *,
    plan:plan (
    id,
    nombre_plan
    )
    `)
    .eq('id_campania', campaignId);
    
    if (error) throw error;
    setOrders(data || []);
    } catch (error) {
    console.error('Error fetching orders:', error);
    } finally {
    setLoading(false);
    }
    };

    const fetchAlternatives = async (alternativeIds) => {
        if (!alternativeIds || alternativeIds.length === 0) return;
        
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('alternativa')
                .select(`
                    *,
                    Anios (
                        id,
                        years
                    ),
                    Meses (
                        Id,
                        Nombre
                    ),
                    Contratos!inner (
                        id,
                        NombreContrato,
                        num_contrato,
                        id_FormadePago,
                        IdProveedor,
                        FormaDePago (
                            id,
                            nombreformadepago
                        ),
                        Proveedores (
                            id_proveedor,
                            nombreProveedor,
                            rutProveedor,
                            direccionFacturacion,
                            id_comuna
                        )
                    ),
                    tipo_item,
                    Soportes (
                        id_soporte,
                        nombreidentificador
                    ),
                    Clasificacion (
                        id,
                        NombreClasificacion
                    ),
                    Temas (
                        id_tema,
                        NombreTema,
                        Duracion
                    ),
                    Programas (
                        id,
                        codigo_programa,
                        hora_inicio,
                        hora_fin,
                        descripcion
                    )
                `)
                .in('id', alternativeIds);
            
            if (error) throw error;
            
            // Procesar los datos para asegurarse de que cantidades esté disponible para la UI
            const processedData = (data || []).map(alt => {
                // Si calendar existe y es un string JSON, convertirlo a cantidades para la UI
                if (alt.calendar && typeof alt.calendar === 'string') {
                    try {
                        alt.cantidades = JSON.parse(alt.calendar);
                    } catch (e) {
                        console.error('Error al parsear calendar:', e);
                        alt.cantidades = [];
                    }
                } else {
                    alt.cantidades = [];
                }
                return alt;
            });
            
            setAlternatives(processedData);
        } catch (error) {
            console.error('Error fetching alternatives:', error);
        } finally {
            setLoading(false);
        }
    };


    const filteredClientes = clientes.filter(cliente =>
    (cliente.nombrecliente && cliente.nombrecliente.toLowerCase().includes(searchTerm.toLowerCase())) ||
    cliente.razonSocial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.razonsocial?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
    {/* Modal de Selección de Cliente */}
    <Dialog
    open={openClienteModal}
    maxWidth="md"
    fullWidth
    disableEscapeKeyDown
    disableEnforceFocus
    >
    <DialogTitle sx={{ m: 0, p: 2 }}>
    <Box display="flex" alignItems="center" justifyContent="space-between">
    <Box>
      <Typography variant="h6" color="primary">Revisar Órdenes</Typography>
      <Typography variant="subtitle2" color="textSecondary">Seleccionar Cliente</Typography>
    </Box>
    <IconButton
    aria-label="close"
    onClick={handleClose}
    sx={{
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
    <TableCell>{cliente.nombrecliente || 'Sin nombre'}</TableCell>
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
    open={openCampanaModal}
    maxWidth="md"
    fullWidth
    disableEnforceFocus
    >
    <DialogTitle sx={{ m: 0, p: 2 }}>
    <Box>
    <Typography variant="h6" sx={{ textAlign: 'left' }} color="primary">
      Revisar Órdenes - Seleccionar Campaña
    </Typography>
    <Typography variant="subtitle1" sx={{ textAlign: 'left' }}color="textSecondary">
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
    </DialogTitle>
    <DialogContent>
    {loading ? (
    <Box display="flex" justifyContent="center" m={3}>
    <CircularProgress />
    </Box>
    ) : campanas.length === 0 ? (
    <Box display="flex" justifyContent="center" m={3}>
    <Typography>No hay campañas asociadas</Typography>
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
    <Button onClick={handleResetSelection} color="primary">
    Cambiar Cliente
    </Button>
    </DialogActions>
    </Dialog>

    {/* Contenido principal - Se mostrará después de seleccionar cliente y campaña */}
    {selectedCliente && selectedCampana && (
    <Grid container spacing={3}>
    {/* Información de la Campaña */}
    <Grid item xs={12}>
    <Paper sx={{ p: 2 }}>
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
    <Typography variant="h6" color="primary">Revisar Órdenes - Información de la Campaña</Typography>
    <Button variant="outlined" onClick={handleResetSelection}>
    Cambiar Selección
    </Button>
    </Box>
    <Typography>Cliente: {selectedCliente.nombrecliente}</Typography>
    <Typography>Campaña: {selectedCampana.nombrecampania}</Typography>
    <Typography>Año: {selectedCampana.anios?.years || 'No especificado'}</Typography>
    <Typography>Producto: {selectedCampana.productos?.nombredelproducto || 'No especificado'}</Typography>
<div className='espaciadorx'></div>

					{/* Órdenes */}
					<Grid item xs={12}>
						<Paper sx={{ p: 2 }}>
							<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
								<Typography variant="h6" color="primary">
									Órdenes Existentes para Revisar ({orders.length})
								</Typography>
								<ButtonGroup variant="contained">
									<Tooltip title="Imprimir orden">
										<span>
											<Button
												onClick={handlePrint}
												startIcon={<PrintIcon sx={{ color: 'white' }} />}
												disabled={!selectedOrder}
											>
												Imprimir
											</Button>
										</span>
									</Tooltip>
									<Tooltip title="Anular y reemplazar orden">
										<span>
											<Button
												onClick={handleCancelAndReplace}
												startIcon={<SwapHorizIcon sx={{ color: 'white' }} />}
												disabled={!selectedOrder}
											>
												Anular y reemplazar
											</Button>
										</span>
									</Tooltip>
									<Tooltip title="Anular orden">
										<span>
											<Button
												onClick={handleCancel}
												startIcon={<CancelIcon sx={{ color: 'white' }} />}
												color="error"
												disabled={!selectedOrder}
											>
												Anular
											</Button>
										</span>
									</Tooltip>
								</ButtonGroup>
							</Box>
							{orders.length === 0 ? (
								<Box
									display="flex"
									flexDirection="column"
									alignItems="center"
									justifyContent="center"
									p={4}
									sx={{
										border: '2px dashed #ccc',
										borderRadius: 2,
										textAlign: 'center',
										backgroundColor: 'rgba(0, 0, 0, 0.02)'
									}}
								>
									<Typography variant="h6" color="textSecondary" gutterBottom>
										No hay órdenes en esta campaña
									</Typography>
									<Typography variant="body2" color="textSecondary">
										Esta campaña no tiene órdenes registradas.
										Selecciona otra campaña que tenga órdenes (marcadas en verde).
									</Typography>
									<Button
variant="outlined"
onClick={() => {
setSelectedCliente(null);
setSelectedCampana(null);
setOpenClienteModal(true);
setOpenCampanaModal(false);
}}
sx={{ mt: 2 }}
>
Seleccionar otra campaña
</Button>
								</Box>
							) : (
								<TableContainer>
									<Table>
										<TableHead>
											<TableRow>
												
												<TableCell>N° de Orden</TableCell>
												<TableCell>N° de copias</TableCell>
												<TableCell>Plan</TableCell>
												<TableCell>Fecha</TableCell>
												<TableCell>Estado</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{orders.map((order) => (
												<TableRow
													key={order.id_ordenes_de_comprar}
													onClick={() => {
														setSelectedOrder(order);
														fetchAlternatives(order.alternativas_plan_orden);
													}}
													sx={{
														cursor: 'pointer',
														backgroundColor: selectedOrder?.id_ordenes_de_comprar === order.id_ordenes_de_comprar
															? 'rgba(0, 0, 0, 0.04)'
															: 'inherit'
													}}
												>
													
													<TableCell>{order.numero_correlativo || '-'}</TableCell>
													<TableCell>-</TableCell>
													<TableCell>{order.plan?.nombre_plan || 'Sin plan'}</TableCell>
													<TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
													<TableCell>
														<Box
															component="span"
															sx={{
																backgroundColor: order.estado === 'activo' ? '#4caf50' : '#ff9800',
																color: 'white',
																px: 1,
																py: 0.25,
																borderRadius: 1,
																fontSize: '0.75rem',
																fontWeight: 'bold'
															}}
														>
															{order.estado}
														</Box>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</TableContainer>
							)}
						</Paper>
					</Grid>

    </Paper>
    </Grid>


											    {/* Add the new Replace Modal */}
                                                 <Dialog
                                                 open={openReplaceModal}
                                                 maxWidth="1650px"
                                                 fullWidth
                                                 onClose={() => setOpenReplaceModal(false)}
                                                 disableEnforceFocus
                                                 PaperProps={{
                                                     sx: {
                                                         maxHeight: '90vh',
                                                         height: '90vh'
                                                     }
                                                 }}
                                                 >
    <DialogTitle sx={{ m: 0, p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" color="primary">Anular y Reemplazar Orden</Typography>
            <IconButton
                aria-label="close"
                onClick={() => setOpenReplaceModal(false)}
                sx={{ color: (theme) => theme.palette.grey[500] }}
            >
                <CloseIcon />
            </IconButton>
        </Box>
    </DialogTitle>
    <DialogContent sx={{ p: 2 }}>
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1">
                        Orden: {selectedOrder?.numero_correlativo} - {selectedOrder?.plan?.nombre_plan}
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={handleCreateNewAlternative}
                    >
                        Agregar Nueva Alternativa
                    </Button>
                </Box>
            </Grid>

            <Grid item xs={4}>
                <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                        Alternativas de la Orden
                    </Typography>
                    <TableContainer sx={{ maxHeight: '65vh' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell  sx={{ fontSize: '10px' }}>N° Orden</TableCell>
                                    <TableCell sx={{ fontSize: '10px' }}>Soporte</TableCell>
                                    <TableCell sx={{ fontSize: '10px' }}>Tipo Item</TableCell>
                                    <TableCell sx={{ fontSize: '10px' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {modifiedAlternatives.map((alternative) => (
                                    <TableRow 
                                        key={alternative.id}
                                        sx={{ 
                                            cursor: 'pointer',
                                            backgroundColor: selectedAlternativeToReplace?.id === alternative.id 
                                                ? 'rgba(0, 0, 0, 0.04)' 
                                                : 'inherit'
                                        }}
                                    >
                                        <TableCell sx={{ fontSize: '10px' }}>{alternative.numerorden}</TableCell>
                                        <TableCell sx={{ fontSize: '10px' }}>{alternative.Soportes?.nombreidentificador}</TableCell>
                                        <TableCell sx={{ fontSize: '10px' }}>{alternative.tipo_item}</TableCell>
                                        <TableCell sx={{ fontSize: '10px' }}>
                                        <ButtonGroup size="small">
                                        <Button sx={{ fontSize: '10px', marginRight:'10px' }} 
    variant="contained"
    onClick={() => {
        // Asegurarse de que se carga la alternativa completa y actualizada
        // Usar toString() para evitar problemas de comparación entre tipos
        const alternativaCompleta = modifiedAlternatives.find(alt => String(alt.id) === String(alternative.id));
        console.log('Alternativa seleccionada para editar:', alternativaCompleta);
        
        if (!alternativaCompleta) {
            console.error('No se encontró la alternativa con ID:', alternative.id);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se encontró la alternativa seleccionada'
            });
            return;
        }
        
        // Crear una copia fresca para evitar referencias compartidas
        const freshCopy = JSON.parse(JSON.stringify(alternativaCompleta));
        
        // Agregar marca de tiempo para forzar actualización
        freshCopy._lastUpdated = new Date().getTime();
        
        setSelectedAlternativeToReplace(freshCopy);
        setIsCreatingNewAlternative(false);
    }}
>
    Editar
</Button>
    <Button sx={{ fontSize: '10px' }} 
        variant="contained"
        color="error"
        onClick={() => handleDeleteAlternative(alternative.id)}
    >
    Eliminar
</Button>
</ButtonGroup>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Grid>

            <Grid item xs={8}>
                <Paper sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
                    {(selectedAlternativeToReplace || isCreatingNewAlternative) ? (
                        <>
                            <Typography variant="h6" gutterBottom>
                                {isCreatingNewAlternative ? 'Crear Nueva Alternativa' : 'Editar Alternativa'}
                            </Typography>

                            <EditarAlternativaReemplazo 
    alternativaId={selectedAlternativeToReplace?.id}
    isCreatingNew={isCreatingNewAlternative}
    initialData={selectedAlternativeToReplace}
    onSave={handleSaveModifiedAlternative}
    onCancel={() => {
        setSelectedAlternativeToReplace(null);
        setIsCreatingNewAlternative(false);
    }}
    // Indicar si debe usar los datos proporcionados directamente (para IDs temporales)
    useProvidedDataOnly={String(selectedAlternativeToReplace?.id || '').startsWith('temp_')}
    // Usar un key único que incluya un timestamp para forzar re-render
    key={`alt-${selectedAlternativeToReplace?.id || 'new'}-${selectedAlternativeToReplace?._lastUpdated || new Date().getTime()}`}
 />
                        </>
                    ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <Typography color="textSecondary">
                                Seleccione una alternativa para editar o cree una nueva
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Grid>
        </Grid>
    </DialogContent>
    <DialogActions>
        <Button onClick={() => setOpenReplaceModal(false)} color="primary">
            Cancelar
        </Button>
        <Button 
            variant="contained" 
            color="primary"
            onClick={handleSaveAndReplaceOrder}
            disabled={loading || modifiedAlternatives.length === 0}
        >
            {loading ? <CircularProgress size={24} /> : 'Guardar y Reemplazar Orden'}
        </Button>
    </DialogActions>
</Dialog>

    {/* Alternativas - Solo se muestra si hay una orden seleccionada y no está anulada */}
    {selectedOrder && selectedOrder.estado !== 'anulada' && (
    <Grid item xs={12}>
    <Paper sx={{ p: 2 }}>
    <Typography variant="h6" color="primary" gutterBottom>
    Alternativas de la Orden Seleccionada
    </Typography>
    <TableContainer>
    <Table size="small">
    <TableHead>
    <TableRow>
    <TableCell>N° Orden</TableCell>
    <TableCell>Año</TableCell>
    <TableCell>Mes</TableCell>
    <TableCell>Contrato</TableCell>
    <TableCell>Soporte</TableCell>
    <TableCell>Tipo Item</TableCell>
    <TableCell>Clasificación</TableCell>
    <TableCell>Detalle</TableCell>
    <TableCell>Tema</TableCell>
    <TableCell>Duración</TableCell>
    <TableCell>Programa</TableCell>
    <TableCell align="right">Valor Unitario</TableCell>
    <TableCell align="right">Total Bruto</TableCell>
    <TableCell align="right">Total General</TableCell>
    <TableCell align="right">Total Neto</TableCell>
    </TableRow>
    </TableHead>
    <TableBody>
    {alternatives.map((alternative) => (
    <TableRow 
    key={alternative.id}
    onClick={() => setSelectedAlternative(alternative)}
    selected={selectedAlternative?.id === alternative.id}
    sx={{ 
    cursor: 'pointer',
    '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)'
    }
    }}
    >
    <TableCell>{alternative.numerorden}</TableCell>
    <TableCell>{alternative.Anios?.years}</TableCell>
    <TableCell>{alternative.Meses?.Nombre}</TableCell>
    <TableCell>{alternative.Contratos?.nombrecontrato}</TableCell>
    <TableCell>{alternative.Soportes?.nombreidentificador}</TableCell>
    <TableCell>{alternative.tipo_item}</TableCell>
    <TableCell>{alternative.Clasificacion?.NombreClasificacion}</TableCell>
    <TableCell>{alternative.detalle}</TableCell>
    <TableCell>{alternative.Temas?.NombreTema}</TableCell>
    <TableCell>{alternative.Temas?.Duracion}</TableCell>
    <TableCell>{alternative.Programas?.codigo_programa}</TableCell>
    <TableCell align="right">
    {alternative.valor_unitario?.toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP'
    })}
    </TableCell>
    <TableCell align="right">
    {alternative.total_bruto?.toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP'
    })}
    </TableCell>
    <TableCell align="right">
    {alternative.total_general?.toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP'
    })}
    </TableCell>
    <TableCell align="right">
    {alternative.total_neto?.toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP'
    })}
    </TableCell>
    </TableRow>
    ))}
    {alternatives.length > 0 && (
    <TableRow>
    <TableCell colSpan={11} align="right">
    <strong>Totales:</strong>
    </TableCell>
    <TableCell align="right">
    <strong>
    {alternatives.reduce((sum, alt) => sum + (alt.valor_unitario || 0), 0)
    .toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP'
    })}
    </strong>
    </TableCell>
    <TableCell align="right">
    <strong>
    {alternatives.reduce((sum, alt) => sum + (alt.total_bruto || 0), 0)
    .toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP'
    })}
    </strong>
    </TableCell>
    <TableCell align="right">
    <strong>
    {alternatives.reduce((sum, alt) => sum + (alt.total_general || 0), 0)
    .toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP'
    })}
    </strong>
    </TableCell>
    <TableCell align="right">
    <strong>
    {alternatives.reduce((sum, alt) => sum + (alt.total_neto || 0), 0)
    .toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP'
    })}
    </strong>
    </TableCell>
    </TableRow>
    )}
    </TableBody>
    </Table>
    </TableContainer>
    </Paper>
    </Grid>
    )}
    </Grid>
    )}
    </Container>
    );
};

export default RevisarOrden;
