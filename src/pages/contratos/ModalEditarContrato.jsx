import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    MenuItem,
    IconButton,
    CircularProgress,
    InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import BusinessIcon from '@mui/icons-material/Business';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CategoryIcon from '@mui/icons-material/Category';
import EventIcon from '@mui/icons-material/Event';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CircleIcon from '@mui/icons-material/Circle';
import { supabase } from '../../config/supabase';
import Swal from 'sweetalert2';

const ModalEditarContrato = ({ open, onClose, contrato, onContratoUpdated, clienteId, clienteNombre, disableClienteSelect }) => {
    const [formData, setFormData] = useState({
        nombrecontrato: '',
        IdCliente: '',
        IdProveedor: '', // Normalizado para consistencia
        idmedios: '',
        FechaInicio: '',
        FechaTermino: '',
        Estado: '',
        id_FormadePago: '',
        id_GeneraracionOrdenTipo: ''
    });

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [proveedoresFiltrados, setProveedoresFiltrados] = useState([]);
    const [medios, setMedios] = useState([]);
    const [formasPago, setFormasPago] = useState([]);
    const [tiposOrden, setTiposOrden] = useState([]);
    useEffect(() => {
        if (contrato && open) {
            console.log('=== DEPURACIÓN DETALLADA ModalEditarContrato ===');
            console.log('Contrato recibido completo:', JSON.stringify(contrato, null, 2));
            console.log('Cliente ID:', clienteId);
            console.log('Cliente Nombre:', clienteNombre);
            console.log('Open:', open);

            // Verificar cada campo individualmente
            console.log('--- ANÁLISIS DE CAMPOS ---');
            console.log('contrato.numero_contrato:', contrato.numero_contrato);
            console.log('contrato.nombrecontrato:', contrato.nombrecontrato);
            console.log('contrato.descripcion:', contrato.descripcion);
            console.log('contrato.id_cliente:', contrato.id_cliente);
            console.log('contrato.cliente?.id_cliente:', contrato.cliente?.id_cliente);
            console.log('contrato.id_proveedor:', contrato.id_proveedor);
            console.log('contrato.proveedor?.id_proveedor:', contrato.proveedor?.id_proveedor);
            console.log('contrato.idmedios:', contrato.idmedios);
            console.log('contrato.medio?.id:', contrato.medio?.id);
            console.log('contrato.fecha_inicio:', contrato.fecha_inicio);
            console.log('contrato.fecha_fin:', contrato.fecha_fin);
            console.log('contrato.estado:', contrato.estado);
            console.log('contrato.id_forma_pago:', contrato.id_forma_pago);
            console.log('contrato.formaPago?.id:', contrato.formaPago?.id);
            console.log('contrato.id_tipo_orden:', contrato.id_tipo_orden);
            console.log('contrato.tipoOrden?.id:', contrato.tipoOrden?.id);

            // Los contratos nuevos tienen campos diferentes a los antiguos
            const formDataMapped = {
                nombrecontrato: contrato.numero_contrato || contrato.nombrecontrato || contrato.NombreContrato || contrato.descripcion || '',
                IdCliente: contrato.id_cliente || clienteId || contrato.cliente?.id_cliente || contrato.idcliente || '',
                IdProveedor: contrato.id_proveedor || contrato.proveedor?.id_proveedor || contrato.idproveedor || '',
                idmedios: contrato.idmedios || contrato.medio?.id || contrato.id_medios || '',
                FechaInicio: contrato.fecha_inicio ?
                    new Date(contrato.fecha_inicio).toISOString().split('T')[0] : '',
                FechaTermino: contrato.fecha_fin ?
                    new Date(contrato.fecha_fin).toISOString().split('T')[0] : '',
                Estado: contrato.estado === true ? 'Vigente' : contrato.estado === false ? 'Anulado' : contrato.Estado || 'Vigente',
                id_FormadePago: contrato.id_forma_pago || contrato.formaPago?.id || contrato.id_FormadePago || '',
                id_GeneraracionOrdenTipo: contrato.id_tipo_orden || contrato.tipoOrden?.id || contrato.id_GeneraracionOrdenTipo || ''
            };

            console.log('--- FORMDATA FINAL ---');
            console.log('FormData mapeado:', JSON.stringify(formDataMapped, null, 2));
            setFormData(formDataMapped);

            // Si hay un medio seleccionado, cargar proveedores filtrados
            if (formDataMapped.idmedios) {
                console.log('Cargando proveedores para medio:', formDataMapped.idmedios);
                fetchProveedoresByMedio(parseInt(formDataMapped.idmedios));
            } else {
                console.log('No hay medio seleccionado, limpiando proveedores');
                setProveedoresFiltrados([]);
            }

            console.log('=== FIN DEPURACIÓN ===');
        }
    }, [contrato, clienteId, clienteNombre, open]);

    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);
            try {
                // Solo cargar clientes si no está deshabilitada la selección
                if (!disableClienteSelect) {
                    const { data: clientesData, error: clientesError } = await supabase
                        .from('clientes')
                        .select('id_cliente, nombrecliente')
                        .eq('estado', true);
                    if (clientesError) throw clientesError;
                    setClientes(clientesData);
                }

                const [proveedoresResponse, mediosResponse, formasPagoResponse, tiposOrdenResponse] = await Promise.all([
                    supabase.from('proveedores')
                        .select('id_proveedor, nombreproveedor')
                        .eq('estado', true),
                    supabase.from('medios')
                        .select('id, nombre_medio'),
                    supabase.from('formadepago')
                        .select('id, nombreformadepago'),
                    supabase.from('tipogeneraciondeorden')
                        .select('id, nombretipoorden')
                ]);

                if (proveedoresResponse.error) throw proveedoresResponse.error;
                if (mediosResponse.error) throw mediosResponse.error;
                if (formasPagoResponse.error) throw formasPagoResponse.error;
                if (tiposOrdenResponse.error) throw tiposOrdenResponse.error;

                setProveedores(proveedoresResponse.data || []);
                setMedios(mediosResponse.data || []);
                setFormasPago(formasPagoResponse.data || []);
                setTiposOrden(tiposOrdenResponse.data || []);

            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al cargar los datos'
                });
            } finally {
                setLoadingData(false);
            }
        };

        if (open) {
            fetchData();
        }
    }, [open, disableClienteSelect]);
    useEffect(() => {
        if (formData.idmedios) {
            fetchProveedoresByMedio(parseInt(formData.idmedios));
        } else {
            setProveedoresFiltrados([]);
        }
    }, [formData.idmedios]);

    const fetchProveedoresByMedio = async (medioId) => {
        try {
            console.log('=== fetchProveedoresByMedio ===');
            console.log('medioId:', medioId);

            if (!medioId) {
                console.log('No hay medioId, limpiando proveedores');
                setProveedoresFiltrados([]);
                return;
            }

            // Primero obtenemos los soportes asociados al medio
            const { data: soporteMediosData, error: soporteMediosError } = await supabase
                .from('soporte_medios')
                .select('id_soporte')
                .eq('id_medio', medioId);

            if (soporteMediosError) throw soporteMediosError;

            console.log('soporteMediosData:', soporteMediosData);

            if (!soporteMediosData || soporteMediosData.length === 0) {
                console.log('No hay soportes asociados a este medio');
                setProveedoresFiltrados([]);
                return;
            }

            // Filtramos cualquier id_soporte que sea null
            const soporteIds = soporteMediosData
                .map(s => s.id_soporte)
                .filter(id => id != null);

            console.log('soporteIds filtrados:', soporteIds);

            if (soporteIds.length === 0) {
                console.log('No hay soportes válidos asociados a este medio');
                setProveedoresFiltrados([]);
                return;
            }

            // Obtenemos los proveedores asociados a estos soportes
            const { data: proveedorSoporteData, error: proveedorSoporteError } = await supabase
                .from('proveedor_soporte')
                .select(`
                    id_proveedor,
                    proveedores!inner (
                        id_proveedor,
                        nombreproveedor,
                        estado
                    )
                `)
                .in('id_soporte', soporteIds);

            if (proveedorSoporteError) throw proveedorSoporteError;

            console.log('proveedorSoporteData:', proveedorSoporteData);

            // Transformamos los datos para tener un formato más simple y filtramos por estado
            const proveedoresProcesados = proveedorSoporteData
                .filter(item => item.proveedores && item.proveedores.estado) // Solo proveedores activos
                .map(item => ({
                    id_proveedor: item.proveedores.id_proveedor,
                    nombreproveedor: item.proveedores.nombreproveedor
                }))
                .filter((proveedor, index, self) => // Eliminamos duplicados
                    index === self.findIndex((p) => p.id_proveedor === proveedor.id_proveedor)
                );

            console.log('proveedoresProcesados:', proveedoresProcesados);

            // Si el proveedor actual del contrato no está en la lista filtrada, agregarlo
            let proveedoresFinales = [...proveedoresProcesados];
            if (formData.IdProveedor && !proveedoresProcesados.some(p => p.id_proveedor === parseInt(formData.IdProveedor))) {
                console.log('Proveedor actual no está en la lista filtrada, agregándolo');

                // Buscar el proveedor actual en la lista completa de proveedores
                const proveedorActual = proveedores.find(p => p.id_proveedor === parseInt(formData.IdProveedor));
                if (proveedorActual) {
                    proveedoresFinales.push(proveedorActual);
                    console.log('Proveedor agregado:', proveedorActual);
                } else {
                    console.log('Proveedor no encontrado en lista completa, ID:', formData.IdProveedor);
                    console.log('Proveedores disponibles:', proveedores.map(p => ({id: p.id_proveedor, nombre: p.nombreproveedor})));
                }
            }

            console.log('Proveedores finales:', proveedoresFinales.map(p => ({id: p.id_proveedor, nombre: p.nombreproveedor})));
            setProveedoresFiltrados(proveedoresFinales);

            if (proveedoresProcesados.length === 0) {
                console.log('No hay proveedores activos asociados a los soportes de este medio');
            }
        } catch (error) {
            console.error('Error al cargar proveedores:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al cargar los proveedores'
            });
            setProveedoresFiltrados([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            console.log('=== INICIO GUARDADO ===');
            console.log('Contrato ID:', contrato.id);
            console.log('FormData a guardar:', JSON.stringify(formData, null, 2));

            // Usar los nombres exactos de campos de la base de datos
            const datosNormalizados = {
                numero_contrato: formData.nombrecontrato,
                id_cliente: parseInt(formData.IdCliente),
                id_proveedor: parseInt(formData.IdProveedor),
                idmedios: parseInt(formData.idmedios),
                fecha_inicio: formData.FechaInicio,
                fecha_fin: formData.FechaTermino,
                estado: formData.Estado === 'Vigente' ? true : false,
                id_forma_pago: parseInt(formData.id_FormadePago),
                id_tipo_orden: parseInt(formData.id_GeneraracionOrdenTipo)
            };

            console.log('Datos normalizados para BD:', JSON.stringify(datosNormalizados, null, 2));

            const { data, error } = await supabase
                .from('contratos')
                .update(datosNormalizados)
                .eq('id', contrato.id)
                .select();

            if (error) {
                console.error('Error de Supabase:', error);
                throw error;
            }

            console.log('Respuesta de Supabase:', data);
            console.log('=== GUARDADO EXITOSO ===');

            // Verificar que los datos se guardaron correctamente
            if (data && data.length > 0) {
                console.log('Datos guardados en BD:', JSON.stringify(data[0], null, 2));
            }

            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Contrato actualizado correctamente'
            });

            console.log('Llamando a onContratoUpdated...');
            onContratoUpdated();

            console.log('Cerrando modal...');
            onClose();
        } catch (error) {
            console.error('Error completo:', error);
            setError(error.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error al actualizar el contrato: ${error.message}`
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Si cambia el medio, resetear el proveedor
        if (name === 'idmedios' || name === 'IdMedios') {
            setFormData(prev => ({
                ...prev,
                idmedios: value,
                IdMedios: value,
                IdProveedor: ''
            }));
        }
    };

    if (loadingData) {
        return (
            <Grid container justifyContent="center" sx={{ py: 3 }}>
                <CircularProgress />
            </Grid>
        );
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Editar Contrato
                <IconButton
                    aria-label="close"
                    onClick={onClose}
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
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Nombre del Contrato"
                            name="nombrecontrato"
                            value={formData.nombrecontrato}
                            onChange={handleChange}
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <DriveFileRenameOutlineIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            select
                            fullWidth
                            label="Cliente"
                            name="IdCliente"
                            value={formData.IdCliente}
                            onChange={handleChange}
                            disabled={loading || disableClienteSelect}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <BusinessIcon />
                                    </InputAdornment>
                                ),
                            }}
                        >
                            {disableClienteSelect ? (
                                <MenuItem value={clienteId}>{clienteNombre}</MenuItem>
                            ) : (
                                clientes.map((cliente) => (
                                    <MenuItem key={cliente.id_cliente} value={cliente.id_cliente}>
                                        {cliente.nombrecliente}
                                    </MenuItem>
                                ))
                            )}
                        </TextField>
                    </Grid>
                   
                      {/* Primero seleccionar el Medio */}
                      <Grid item xs={12}>
                        <TextField
                            select
                            fullWidth
                            label="Medio"
                            name="idmedios"
                            value={formData.idmedios || ''}
                            onChange={handleChange}
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CategoryIcon />
                                    </InputAdornment>
                                ),
                            }}
                        >
                            <MenuItem value="">Seleccionar Medio</MenuItem>
                            {medios.map((medio) => (
                                <MenuItem key={medio.id} value={medio.id}>
                                    {medio.nombre_medio || 'Sin nombre'}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    {/* Luego seleccionar el Proveedor filtrado por el Medio */}
                    <Grid item xs={12}>
                        <TextField
                            select
                            fullWidth
                            label="Proveedor"
                            name="IdProveedor"
                            value={formData.IdProveedor || ''}
                            onChange={handleChange}
                            disabled={loading || !formData.idmedios}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <StorefrontIcon />
                                    </InputAdornment>
                                ),
                            }}
                        >
                            <MenuItem value="">Seleccionar Proveedor</MenuItem>
                            {proveedoresFiltrados.map((proveedor) => (
                                <MenuItem key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                                    {proveedor.nombreproveedor || 'Sin nombre'}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            select
                            fullWidth
                            label="Forma de Pago"
                            name="id_FormadePago"
                            value={formData.id_FormadePago}
                            onChange={handleChange}
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PaymentIcon />
                                    </InputAdornment>
                                ),
                            }}
                        >
                            {formasPago.map((forma) => (
                                <MenuItem key={forma.id} value={forma.id}>
                                    {forma.nombreformadepago}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Fecha de Inicio"
                            type="date"
                            name="FechaInicio"
                            value={formData.FechaInicio}
                            onChange={handleChange}
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EventIcon />
                                    </InputAdornment>
                                ),
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Fecha de Término"
                            type="date"
                            name="FechaTermino"
                            value={formData.FechaTermino}
                            onChange={handleChange}
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EventIcon />
                                    </InputAdornment>
                                ),
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            select
                            fullWidth
                            label="Estado"
                            name="Estado"
                            value={formData.Estado}
                            onChange={handleChange}
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CircleIcon />
                                    </InputAdornment>
                                ),
                            }}
                        >
                            <MenuItem value="Vigente">Vigente</MenuItem>
                            <MenuItem value="Consumido">Consumido</MenuItem>
                            <MenuItem value="Anulado">Anulado</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancelar
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    color="primary" 
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Guardar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalEditarContrato;
