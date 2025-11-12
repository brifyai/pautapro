import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import {
    Button,
    TextField,
    InputAdornment,
    Breadcrumbs,
    Link,
    Typography,
    Switch,
    Box,
    Paper,
    IconButton,
    Grid,
    Chip,
    useMediaQuery,
    useTheme,
    Card,
    CardContent,
    Avatar,
    Pagination,
    Fab,
    Skeleton,
    Tooltip,
    CircularProgress
} from '@mui/material';
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
import '../agencias/Agencias.css';

// Constantes para mejor mantenibilidad
const ESTADOS_CONTRATO = {
    VIGENTE: 'Vigente',
    CONSUMIDO: 'Consumido',
    ANULADO: 'Anulado'
};

const COLUMNAS_POR_DEFECTO = 5;

const Contratos = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobilePage, setMobilePage] = useState(1);

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
    // Paginación forzada 10 en 10 (mismo sistema que Clientes)
    const [paginationModel, setPaginationModel] = useState({
        pageSize: 10,
        page: 0
    });

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
    // Forzar que siempre sea 10 por página
    const handlePaginationChange = useCallback((newModel) => {
        const forcedModel = { ...newModel, pageSize: 10 };
        setPaginationModel(forcedModel);
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
        <div className="agencias-container contratos-wrapper animate-fade-in">
            {!isMobile && (
                <div className="modern-header animate-slide-down">
                    <div className="modern-title" style={{ fontSize: '1rem', marginTop: '14px', lineHeight: '1' }}>
                        📄 LISTADO DE CONTRATOS
                    </div>
                </div>
            )}
            {/* Versión móvil - Cards creativos */}
            {isMobile ? (
                <>
                    <Box sx={{ p: 2 }}>
                        {/* Barra de búsqueda móvil */}
                        <Box sx={{ mb: 2 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="🔍 Buscar contratos..."
                                value={filtros.searchText}
                                onChange={(e) => handleFiltroChange('searchText', e.target.value)}
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

                        {/* Filtros de fecha móvil */}
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                            <TextField
                                type="date"
                                variant="outlined"
                                value={filtros.dateFrom}
                                onChange={(e) => handleFiltroChange('dateFrom', e.target.value)}
                                label="📅 Desde"
                                InputLabelProps={{ shrink: true }}
                                size="small"
                                sx={{
                                    flex: 1,
                                    minWidth: 120,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    }
                                }}
                            />
                            <TextField
                                type="date"
                                variant="outlined"
                                value={filtros.dateTo}
                                onChange={(e) => handleFiltroChange('dateTo', e.target.value)}
                                label="📅 Hasta"
                                InputLabelProps={{ shrink: true }}
                                size="small"
                                sx={{
                                    flex: 1,
                                    minWidth: 120,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    }
                                }}
                            />
                        </Box>

                        {/* Botones de acción */}
                        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                startIcon={<FileDownloadIcon sx={{ color: 'white' }} />}
                                onClick={exportToExcel}
                                disabled={contratos.length === 0}
                                className="btn-agregar"
                                sx={{ borderRadius: '12px', flex: 1 }}
                            >
                                📊 Exportar
                            </Button>
                            <Button
                                variant="contained"
                                className="btn-agregar"
                                startIcon={<AddIcon sx={{ color: 'white' }} />}
                                onClick={() => handleModalChange('agregar', true)}
                                sx={{ borderRadius: '12px', flex: 1 }}
                            >
                                Agregar
                            </Button>
                        </Box>

                        {/* Cards creativos para contratos */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                            {filteredContratos.slice((mobilePage - 1) * 10, mobilePage * 10).map((contrato, index) => (
                                <Card
                                    key={contrato.id}
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
                                            {contrato.nombrecontrato?.charAt(0)?.toUpperCase() || 'C'}
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
                                                {contrato.nombrecontrato || 'Sin nombre'}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}>
                                                <Chip
                                                    label={contrato.fechaInicio || 'Sin fecha'}
                                                    size="small"
                                                    sx={{
                                                        height: '24px',
                                                        fontSize: '0.75rem',
                                                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                                        color: '#667eea',
                                                        fontWeight: 600
                                                    }}
                                                />
                                                <Chip
                                                    label={contrato.estado ? '✓ Activo' : '✗ Inactivo'}
                                                    size="small"
                                                    sx={{
                                                        height: '24px',
                                                        fontSize: '0.75rem',
                                                        backgroundColor: contrato.estado ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                        color: contrato.estado ? '#16a34a' : '#dc2626',
                                                        fontWeight: 600
                                                    }}
                                                />
                                            </Box>
                                        </Box>

                                        {/* Botones de acción */}
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleView(contrato)}
                                                sx={{
                                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                    '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.2)' }
                                                }}
                                            >
                                                <VisibilityIcon fontSize="small" sx={{ color: '#3b82f6' }} />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEdit(contrato)}
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
                                                    👤 Cliente
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                    {contrato.cliente || 'Sin cliente'}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                                    🏢 Proveedor
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                    {contrato.proveedor || 'Sin proveedor'}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                                    📺 Medio
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                    {contrato.medio || 'Sin medio'}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                                    💳 Forma Pago
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                    {contrato.formaPago || 'Sin forma pago'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Card>
                            ))}

                            {/* Mensaje si no hay contratos */}
                            {filteredContratos.length === 0 && (
                                <Box sx={{ textAlign: 'center', py: 8 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        {loading ? 'Cargando datos...' : 'No se encontraron contratos'}
                                    </Typography>
                                </Box>
                            )}

                        </Box>

                        {/* Paginación móvil */}
                        {filteredContratos.length > 10 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
                                <Pagination
                                    count={Math.ceil(filteredContratos.length / 10)}
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
                                Mostrando {Math.min((mobilePage - 1) * 10 + 1, filteredContratos.length)}-{Math.min(mobilePage * 10, filteredContratos.length)} de {filteredContratos.length} contrato{filteredContratos.length !== 1 ? 's' : ''}
                            </Typography>
                        </Box>

                        {/* FAB para agregar contrato */}
                        <Fab
                            color="primary"
                            aria-label="add"
                            onClick={() => handleModalChange('agregar', true)}
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
                /* Versión escritorio - DataGrid */
                <>
                    {/* Breadcrumbs */}
                    <Box sx={{ p: 3, pb: 0, display: 'none' }}>
                        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
                            <Link component={RouterLink} to="/dashboard" sx={{ color: 'var(--gradient-primary)', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                Dashboard
                            </Link>
                            <Typography color="text.primary" sx={{ fontWeight: 600 }}>Contratos</Typography>
                        </Breadcrumbs>
                    </Box>

                    {/* Caja de búsqueda */}
                    <Box sx={{
                        mb: 2,
                        mt: 3
                    }}>
                        <TextField
                            variant="outlined"
                            placeholder="🔍 Buscar contratos..."
                            value={filtros.searchText}
                            onChange={(e) => handleFiltroChange('searchText', e.target.value)}
                            className="search-input"
                            fullWidth
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
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#6777ef' }}/>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    {/* Filtros de fecha */}
                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        mb: 2,
                        flexWrap: 'wrap'
                    }}>
                        <TextField
                            type="date"
                            variant="outlined"
                            value={filtros.dateFrom}
                            onChange={(e) => handleFiltroChange('dateFrom', e.target.value)}
                            label="📅 Desde"
                            InputLabelProps={{ shrink: true }}
                            className="date-input"
                            sx={{
                                flex: 1,
                                minWidth: 150,
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
                            value={filtros.dateTo}
                            onChange={(e) => handleFiltroChange('dateTo', e.target.value)}
                            label="📅 Hasta"
                            InputLabelProps={{ shrink: true }}
                            className="date-input"
                            sx={{
                                flex: 1,
                                minWidth: 150,
                                '& .MuiOutlinedInput-root': {
                                    background: 'rgba(255,255,255,0.9)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '12px',
                                }
                            }}
                        />
                    </Box>

                    {/* Botones de acción */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 2,
                        mb: 2,
                        flexWrap: 'wrap'
                    }}>
                        <Button
                            variant="contained"
                            startIcon={<FileDownloadIcon sx={{ color: 'white' }} />}
                            onClick={exportToExcel}
                            disabled={contratos.length === 0}
                            className="btn-agregar"
                        >
                            📊 Exportar Excel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => handleModalChange('agregar', true)}
                            startIcon={<AddIcon sx={{ color: 'white' }} />}
                            className="btn-agregar"
                        >
                            Nuevo Contrato
                        </Button>
                    </Box>

                    {/* DataGrid Container */}
                    <Box sx={{ p: 0, pt: 0 }}>
                        <div className="data-grid-container">
                            <DataGrid
                                rows={filteredContratos}
                                columns={columnas}
                                pagination
                                paginationMode="client"
                                paginationModel={paginationModel}
                                onPaginationModelChange={handlePaginationChange}
                                pageSizeOptions={[10]}
                                autoHeight
                                rowHeight={56}
                                columnHeaderHeight={56}
                                disableSelectionOnClick
                                getRowId={(row) => row.id}
                                initialState={{
                                    pagination: {
                                        paginationModel: {
                                            pageSize: 10
                                        }
                                    }
                                }}
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
                    </Box>

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
                </>
            )}
        </div>
    );
};

export default Contratos;
