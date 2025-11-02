import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid,
    InputAdornment,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import BusinessIcon from '@mui/icons-material/Business';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CategoryIcon from '@mui/icons-material/Category';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { supabase } from '../../config/supabase';
import Swal from 'sweetalert2';

const ModalAgregarCampana = ({ open, onClose, onCampanaAdded }) => {
    const initialFormData = {
        nombrecampania: '',
        id_anio: '',
        id_cliente: '',
        id_agencia: '',
        id_producto: '',
        presupuesto: '',
    };

    const [formData, setFormData] = useState(initialFormData);

    const [loading, setLoading] = useState(false);
    const [clientes, setClientes] = useState([]);
    const [agencias, setAgencias] = useState([]);
    const [productos, setProductos] = useState([]);
    const [anios, setAnios] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);

    useEffect(() => {
        if (open) {
            fetchData();
        }
    }, [open]);

    useEffect(() => {
        if (formData.id_cliente) {
            setProductosFiltrados(
                productos.filter(producto => producto.id_cliente === formData.id_cliente)
            );
        } else {
            setProductosFiltrados([]);
        }
    }, [formData.id_cliente, productos]);

    // Resetear formulario cuando se cierra el modal
    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
            setProductosFiltrados([]);
        }
    }, [open]);

    const fetchData = async () => {
        try {
            // Fetch Clientes
            const { data: clientesData, error: clientesError } = await supabase
                .from('clientes')
                .select('id_cliente, nombrecliente');
            if (clientesError) throw clientesError;
            setClientes(clientesData);

            // Fetch Agencias
            const { data: agenciasData, error: agenciasError } = await supabase
                .from('agencias')
                .select('id, nombreidentificador');
            if (agenciasError) throw agenciasError;
            setAgencias(agenciasData);

            // Fetch Productos
            const { data: productosData, error: productosError } = await supabase
                .from('productos')
                .select('id, nombredelproducto, id_cliente');
            if (productosError) throw productosError;
            setProductos(productosData);

            // Fetch Años
            const { data: aniosData, error: aniosError } = await supabase
                .from('anios')
                .select('id, years');
            if (aniosError) throw aniosError;
            setAnios(aniosData);

        } catch (error) {
            console.error('Error al cargar datos:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al cargar los datos'
            });
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        
        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: value
            };

            // Si se cambia el cliente, resetear el producto
            if (name === 'id_cliente') {
                newData.id_producto = '';
            }

            return newData;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('campania')
                .insert([
                    {
                        nombrecampania: formData.nombrecampania,
                        id_anio: formData.id_anio,
                        id_cliente: formData.id_cliente,
                        id_agencia: formData.id_agencia,
                        id_producto: formData.id_producto,
                        presupuesto: parseFloat(formData.presupuesto),
                        estado: true,
                        created_at: new Date().toISOString()
                    }
                ])
                .select();

            if (error) throw error;

            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Campaña agregada correctamente'
            });

            setFormData(initialFormData);
            onCampanaAdded();
            onClose();
        } catch (error) {
            console.error('Error al agregar campaña:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo agregar la campaña'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Agregar Campaña
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
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Nombre Campaña"
                                name="nombrecampania"
                                value={formData.nombrecampania}
                                onChange={handleChange}
                                required
                                margin="normal"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EditIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Año"
                                name="id_anio"
                                value={formData.id_anio}
                                onChange={handleChange}
                                required
                                margin="normal"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CalendarTodayIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            >
                                {anios.map((anio) => (
                                    <MenuItem key={anio.id} value={anio.id}>
                                        {anio.years}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Cliente"
                                name="id_cliente"
                                value={formData.id_cliente}
                                onChange={handleChange}
                                required
                                margin="normal"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <BusinessIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            >
                                {clientes.map((cliente) => (
                                    <MenuItem key={cliente.id_cliente} value={cliente.id_cliente}>
                                        {cliente.nombrecliente}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Agencia"
                                name="id_agencia"
                                value={formData.id_agencia}
                                onChange={handleChange}
                                required
                                margin="normal"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <StorefrontIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            >
                                {agencias.map((agencia) => (
                                    <MenuItem key={agencia.id} value={agencia.id}>
                                        {agencia.nombreidentificador}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Producto"
                                name="id_producto"
                                value={formData.id_producto}
                                onChange={handleChange}
                                required
                                margin="normal"
                                disabled={!formData.id_cliente}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CategoryIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            >
                                {productosFiltrados.map((producto) => (
                                    <MenuItem key={producto.id} value={producto.id}>
                                        {producto.nombredelproducto}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Presupuesto"
                                name="presupuesto"
                                type="number"
                                value={formData.presupuesto}
                                onChange={handleChange}
                                required
                                margin="normal"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">$</InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit">
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : 'Guardar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ModalAgregarCampana;
