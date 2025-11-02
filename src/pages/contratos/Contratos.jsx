import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Container,
    IconButton,
    TextField,
    Grid,
    InputAdornment,
    Breadcrumbs,
    Link,
    Typography,
    Button,
    Switch,
    CircularProgress,
    Box,
    Tooltip,
    Fab
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssistantIcon from '@mui/icons-material/Assistant';
import { supabase } from '../../config/supabase';
import { mapearDatos } from '../../config/mapeo-campos';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import ModalAgregarContrato from './ModalAgregarContrato';
import ModalEditarContrato from './ModalEditarContrato';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Contratos.css';

// Constantes para mejor mantenibilidad
const ESTADOS_CONTRATO = {
    VIGENTE: 'Vigente',
    CONSUMIDO: 'Consumido',
    ANULADO: 'Anulado'
};

const COLUMNAS_POR_DEFECTO = 5;

const Contratos = () => {
    const navigate = useNavigate();

    // Estados principales
    const [contratos, setContratos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados de filtros
    const [filtros, setFiltros] = useState({
        searchText: '',
        dateFrom: '',
        dateTo: ''
    });
    
    // Estados de modales
    const [modales, setModales] = useState({
        agregar: false,
        editar: false
    });
    
    // Estados de UI
    const [pageSize, setPageSize] = useState(COLUMNAS_POR_DEFECTO);
    const [selectedContrato, setSelectedContrato] = useState(null);

    // Cargar datos iniciales
    useEffect(() => {
        fetchContratos();
    }, []);

    // Función para obtener contratos con manejo mejorado de errores
    const fetchContratos = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const { data: contratosData, error } = await supabase
                .from('contratos')
                .select(`
                    *,
                    cliente:clientes(id_cliente, nombrecliente),
                    proveedor:proveedores(id_proveedor, nombreproveedor),
                    medio:medios(id, nombre_medio),
                    formaPago:formadepago(id, nombreformadepago),
                    tipoOrden:tipogeneraciondeorden(id, nombretipoorden),
                    c_orden
                `);

            if (error) throw error;
            
            // Validar y normalizar datos
            const contratosNormalizados = (contratosData || []).map(contrato => ({
                ...contrato,
                nombrecontrato: contrato.numero_contrato || contrato.nombrecontrato || contrato.NombreContrato || '',
                estado: contrato.estado ?? false,
                FechaInicio: contrato.fecha_inicio || contrato.FechaInicio || contrato.fechaInicio,
                FechaTermino: contrato.fecha_fin || contrato.FechaTermino || contrato.fechaFin,
                // Asegurar que las relaciones anidadas tengan valores por defecto
                cliente: contrato.cliente || { id_cliente: null, nombrecliente: 'N/A' },
                proveedor: contrato.proveedor || { id_proveedor: null, nombreproveedor: 'N/A' },
                medio: contrato.medio || { id: null, nombre_medio: 'N/A' },
                formaPago: contrato.formaPago || { id: null, nombreformadepago: 'N/A' },
                tipoOrden: contrato.tipoOrden || { id: null, nombretipoorden: 'N/A' },
                // Mantener los IDs originales para el modal de edición
                id_cliente: contrato.id_cliente,
                id_proveedor: contrato.id_proveedor,
                idmedios: contrato.idmedios,
                id_forma_pago: contrato.id_forma_pago,
                id_tipo_orden: contrato.id_tipo_orden,
                numero_contrato: contrato.numero_contrato,
                descripcion: contrato.descripcion,
                fecha_inicio: contrato.fecha_inicio,
                fecha_fin: contrato.fecha_fin
            }));
            
            setContratos(contratosNormalizados);
        } catch (error) {
            console.error('Error al cargar contratos:', error);
            setError(error.message);
            setContratos([]); // Asegurar que contratos sea un array vacío en caso de error
            
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los contratos. Por favor, intente nuevamente.'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    // Manejadores de eventos con useCallback para optimizar rendimiento
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

    const handleDelete = useCallback(async (id) => {
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
                    .from('contratos')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                await fetchContratos();
                Swal.fire(
                    'Eliminado',
                    'El contrato ha sido eliminado.',
                    'success'
                );
            }
        } catch (error) {
            console.error('Error al eliminar:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el contrato'
            });
        }
    }, [fetchContratos]);

    const handleEstadoChange = useCallback(async (event, id) => {
        try {
            const newEstado = event.target.checked;
            const { error } = await supabase
                .from('contratos')
                .update({ estado: newEstado })
                .eq('id', id);

            if (error) throw error;

            // Actualizar el estado en la interfaz de forma optimista
            setContratos(prev => prev.map(contrato =>
                contrato.id === id ? { ...contrato, estado: newEstado } : contrato
            ));

            await Swal.fire({
                icon: 'success',
                title: 'Estado actualizado',
                text: `El contrato ha sido ${newEstado ? 'activado' : 'desactivado'}`,
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Error updating estado:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar el estado del contrato'
            });
            // Recargar datos para sincronizar
            fetchContratos();
        }
    }, [fetchContratos]);


    const handleEdit = useCallback((contrato) => {
        // Verificar si el contrato forma parte de una orden creada
        if (contrato.c_orden === true) {
            Swal.fire({
                icon: 'warning',
                title: 'No se puede editar',
                text: 'Este registro no se puede actualizar ya que forma parte de una Orden Creada.',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        // Buscar el contrato original (no normalizado) para pasar al modal
        const contratoOriginal = contratos.find(c => c.id === contrato.id);
        console.log('=== DEPURACIÓN handleEdit ===');
        console.log('Contrato de tabla:', contrato);
        console.log('Contrato original encontrado:', contratoOriginal);

        setSelectedContrato(contratoOriginal || contrato);
        handleModalChange('editar', true);
    }, [handleModalChange, contratos]);

    const handleView = useCallback((contrato) => {
        if (contrato?.id) {
            navigate(`/contratos/view/${contrato.id}`);
        }
    }, [navigate]);

    // Función para exportar a Excel
    const exportToExcel = useCallback(() => {
        try {
            const dataToExport = contratos.map(contrato => ({
                'ID': contrato.id || '',
                'Cliente': contrato.cliente?.nombrecliente || 'N/A',
                'Nombre de Contrato': contrato.nombrecontrato || '',
                'Proveedor': contrato.proveedor?.nombreproveedor || 'N/A',
                'Medio': contrato.medio?.nombre_medio || 'N/A',
                'Forma de Pago': contrato.formaPago?.nombreformadepago || 'N/A',
                'Tipo de Orden': contrato.tipoOrden?.nombretipoorden || 'N/A',
                'Fecha Inicio': contrato.FechaInicio ? new Date(contrato.FechaInicio).toLocaleDateString() : '',
                'Fecha Fin': contrato.FechaTermino ? new Date(contrato.FechaTermino).toLocaleDateString() : '',
                'Estado': contrato.estado ? 'Activo' : 'Inactivo'
            }));

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Contratos');
            XLSX.writeFile(wb, 'Contratos.xlsx');
        } catch (error) {
            console.error('Error al exportar a Excel:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo exportar el archivo Excel'
            });
        }
    }, [contratos]);

    // Memoizar datos filtrados para optimizar rendimiento
    const filteredContratos = useMemo(() => {
        if (!Array.isArray(contratos)) return [];
        
        return contratos
            .map(contrato => ({
                id: contrato.id,
                nombrecontrato: contrato.nombrecontrato || '',
                cliente: contrato.cliente?.nombrecliente || 'N/A',
                proveedor: contrato.proveedor?.nombreproveedor || 'N/A',
                medio: contrato.medio?.nombre_medio || 'N/A',
                formaPago: contrato.formaPago?.nombreformadepago || 'N/A',
                fechaInicio: contrato.FechaInicio ? new Date(contrato.FechaInicio).toLocaleDateString() : '',
                fechaFin: contrato.FechaTermino ? new Date(contrato.FechaTermino).toLocaleDateString() : '',
                estado: contrato.estado ?? false
            }))
            .filter(contrato => {
                const textoBusqueda = filtros.searchText.toLowerCase();
                const camposBusqueda = [
                    contrato.nombrecontrato,
                    contrato.cliente,
                    contrato.proveedor,
                    contrato.medio,
                    contrato.formaPago
                ].join(' ').toLowerCase();
                
                return camposBusqueda.includes(textoBusqueda);
            });
    }, [contratos, filtros.searchText]);

    // Definición de columnas memoizada
    const columnas = useMemo(() => [
        {
            field: 'id',
            headerName: 'ID',
            flex: 0.5,
            headerClassName: 'data-grid-header'
        },
        {
            field: 'nombrecontrato',
            headerName: 'Nombre del Contrato',
            flex: 1,
            headerClassName: 'data-grid-header'
        },
        {
            field: 'cliente',
            headerName: 'Cliente',
            flex: 1,
            headerClassName: 'data-grid-header'
        },
        {
            field: 'proveedor',
            headerName: 'Proveedor',
            flex: 1,
            headerClassName: 'data-grid-header'
        },
        {
            field: 'medio',
            headerName: 'Medio',
            flex: 1,
            headerClassName: 'data-grid-header'
        },
        {
            field: 'formaPago',
            headerName: 'Forma de Pago',
            flex: 1,
            headerClassName: 'data-grid-header'
        },
        {
            field: 'fechaInicio',
            headerName: 'Fecha de Inicio',
            flex: 1,
            headerClassName: 'data-grid-header'
        },
        {
            field: 'fechaFin',
            headerName: 'Fecha de Término',
            flex: 1,
            headerClassName: 'data-grid-header'
        },
        {
            field: 'estado',
            headerName: 'Estado',
            flex: 1,
            headerClassName: 'data-grid-header',
            renderCell: (params) => (
                <Switch
                    checked={params.row.estado || false}
                    onChange={(e) => handleEstadoChange(e, params.row.id)}
                    size="small"
                    sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#4caf50 !important',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#4caf50 !important',
                        },
                        '& .MuiSwitch-switchBase': {
                            color: '#f44336',
                        },
                        '& .MuiSwitch-switchBase + .MuiSwitch-track': {
                            backgroundColor: '#f44336',
                        },
                    }}
                />
            )
        },
        {
            field: 'acciones',
            headerName: 'Acciones',
            width: 180,
            renderCell: (params) => (
                <div className="action-buttons">
                    <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleView(params.row)}
                        disabled={!params.row?.id}
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
                        disabled={!params.row?.id}
                    >
                        <DeleteIcon />
                    </IconButton>
                </div>
            )
        }
    ], [handleEstadoChange, handleView, handleEdit, handleDelete]);

    // Manejo de estado de carga
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    // Manejo de estado de error
    if (error) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh">
                <Typography variant="h6" color="error" gutterBottom>
                    Error al cargar los datos
                </Typography>
                <Button variant="contained" onClick={fetchContratos}>
                    Reintentar
                </Button>
            </Box>
        );
    }

    return (
        <div className="dashboard animate-fade-in">
            {/* Header moderno con gradiente */}
            <div className="modern-header animate-slide-down">
                <div className="modern-title" style={{ fontSize: '1.25rem' }}>
                    📄 GESTIÓN DE CONTRATOS
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Administración de contratos comerciales
                    </Typography>
                </div>
            </div>

            {/* Breadcrumbs */}
            <Box sx={{ p: 3, pb: 0 }}>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
                    <Link component={RouterLink} to="/dashboard" sx={{ color: 'var(--gradient-primary)', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                        Dashboard
                    </Link>
                    <Typography color="text.primary" sx={{ fontWeight: 600 }}>Contratos</Typography>
                </Breadcrumbs>
            </Box>

            {/* Controles de búsqueda y acciones */}
            <Box sx={{ p: 3, pt: 0 }}>
                <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="🔍 Buscar contratos..."
                            value={filtros.searchText}
                            onChange={(e) => handleFiltroChange('searchText', e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: 'var(--gradient-primary)' }}/>
                                    </InputAdornment>
                                ),
                            }}
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
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            fullWidth
                            type="date"
                            variant="outlined"
                            value={filtros.dateFrom}
                            onChange={(e) => handleFiltroChange('dateFrom', e.target.value)}
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
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            fullWidth
                            type="date"
                            variant="outlined"
                            value={filtros.dateTo}
                            onChange={(e) => handleFiltroChange('dateTo', e.target.value)}
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
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Button
                            variant="contained"
                            startIcon={<FileDownloadIcon sx={{ color: 'white' }} />}
                            onClick={exportToExcel}
                            disabled={contratos.length === 0}
                            sx={{
                                background: 'var(--gradient-success)',
                                color: '#fff',
                                height: '56px',
                                width: '100%',
                                borderRadius: '12px',
                                fontWeight: 600,
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            📊 Exportar
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            variant="contained"
                            onClick={() => handleModalChange('agregar', true)}
                            startIcon={<AddIcon sx={{ color: 'white' }} />}
                            sx={{
                                background: 'var(--gradient-primary)',
                                color: '#fff',
                                height: '56px',
                                width: '100%',
                                borderRadius: '12px',
                                fontWeight: 600,
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                '&:hover': {
                                    background: 'var(--gradient-secondary)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 16px rgba(247, 107, 138, 0.4)',
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            ➕ Nuevo Contrato
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            {/* DataGrid Container */}
            <Box sx={{ p: 3, pt: 0 }}>
                <div className="data-grid-container">
                    <DataGrid
                        rows={filteredContratos}
                        columns={columnas}
                        pageSize={pageSize}
                        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                        rowsPerPageOptions={[5, 10, 20, 50]}
                        pagination
                        autoHeight
                        disableSelectionOnClick
                        getRowId={(row) => row.id}
                        sx={{
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#f5f5f5',
                                color: '#333',
                                fontWeight: 'bold',
                            },
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid #ddd',
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: '#f9f9f9',
                            },
                        }}
                    />
                </div>
            </Box>

            {/* Botón flotante del Asistente */}
            <Tooltip title="🤖 Asistente Inteligente - Gestión de Contratos" placement="left">
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

            <ModalAgregarContrato
                open={modales.agregar}
                onClose={() => handleModalChange('agregar', false)}
                onContratoAdded={fetchContratos}
            />

            <ModalEditarContrato
                open={modales.editar}
                onClose={() => handleModalChange('editar', false)}
                contrato={selectedContrato}
                onContratoUpdated={fetchContratos}
            />
        </div>
    );
};

export default Contratos;
