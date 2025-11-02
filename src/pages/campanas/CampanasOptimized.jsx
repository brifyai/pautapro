/**
 * Componente Campanas Optimizado con manejo mejorado de estados y rendimiento
 * Incorpora useAsyncState, SweetAlert2 y manejo robusto de errores
 */

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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Switch,
    Chip,
    Box,
    LinearProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import { supabase } from '../../config/supabase';
import { campaignService } from '../../services/campaignService';
import { useAsyncState } from '../../hooks/useAsyncState';
import { errorHandlingService } from '../../services/errorHandlingService';
import { SweetAlertUtils } from '../../utils/sweetAlertUtils';
import * as XLSX from 'xlsx';
import ModalAgregarCampana from './ModalAgregarCampana';
import ModalEditarCampana from './ModalEditarCampana';
import '@fortawesome/fontawesome-free/css/all.min.css';

const CampanasOptimized = () => {
    const navigate = useNavigate();
    
    // Estados con useState normal (useAsyncState es para operaciones asíncronas complejas)
    const [campanas, setCampanas] = useState([]);
    const [campanasLoading, setCampanasLoading] = useState(false);
    const [campanasError, setCampanasError] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedCampana, setSelectedCampana] = useState(null);

    // Función para cargar campañas con manejo de errores mejorado
    const fetchCampanas = useCallback(async () => {
        try {
            setCampanasLoading(true);
            setCampanasError(null);
            SweetAlertUtils.showLoading('Cargando campañas...');
            
            // Usar el servicio de campañas que actualiza estados automáticamente
            const data = await campaignService.getCampaigns();

            // Filtrar solo campañas de la tabla 'campania' (no 'campanas')
            const filteredData = data.filter(campana =>
                campana.id_campania // Solo campañas que tienen id_campania
            );

            // Enriquecer con datos relacionados en paralelo
            const enrichedData = await Promise.all(
                filteredData.map(async (campana) => {
                    try {
                        // Obtener datos relacionados en paralelo
                        const [clienteData, productoData, agenciaData] = await Promise.all([
                            campana.id_Cliente ? supabase
                                .from('clientes')
                                .select('id_cliente, nombrecliente')
                                .eq('id_cliente', campana.id_Cliente)
                                .single() : Promise.resolve({ data: null }),
                            campana.id_Producto ? supabase
                                .from('productos')
                                .select('id, nombredelproducto, id_cliente')
                                .eq('id', campana.id_Producto)
                                .single() : Promise.resolve({ data: null }),
                            campana.Id_Agencia ? supabase
                                .from('agencias')
                                .select('id, nombreidentificador')
                                .eq('id', campana.Id_Agencia)
                                .single() : Promise.resolve({ data: null })
                        ]);

                        return {
                            ...campana,
                            clientes: clienteData.data,
                            productos: productoData.data,
                            agencias: agenciaData.data
                        };
                    } catch (relationError) {
                        errorHandlingService.handleError(relationError, `fetchCampanas-relations-${campana.id_campania}`);
                        return campana;
                    }
                })
            );

            setCampanas(enrichedData);
            SweetAlertUtils.close();
            
        } catch (error) {
            setCampanasError(error);
            errorHandlingService.handleError(error, 'fetchCampanas');
            SweetAlertUtils.showError(
                'Error de carga',
                'No se pudieron cargar las campañas. Por favor, intente nuevamente.'
            );
        } finally {
            setCampanasLoading(false);
        }
    }, [setCampanas, setCampanasLoading, setCampanasError]);

    // Manejador de eliminación con SweetAlert2 mejorado
    const handleDelete = useCallback(async (id) => {
        try {
            const result = await SweetAlertUtils.showConfirmation(
                '¿Estás seguro?',
                'No podrás revertir esta acción',
                'warning'
            );

            if (result.isConfirmed) {
                SweetAlertUtils.showLoading('Eliminando campaña...');
                
                const { error } = await supabase
                    .from('campania')
                    .delete()
                    .eq('id_campania', id);

                if (error) throw error;

                await fetchCampanas();
                
                SweetAlertUtils.showSuccess(
                    'Eliminado',
                    'La campaña ha sido eliminada exitosamente.'
                );
            }
        } catch (error) {
            errorHandlingService.handleError(error, 'handleDelete');
            SweetAlertUtils.showError(
                'Error',
                'No se pudo eliminar la campaña'
            );
        }
    }, [fetchCampanas]);

    // Manejador de edición optimizado
    const handleEdit = useCallback((campana) => {
        // Verificar si la campaña forma parte de una orden creada
        if (campana.c_orden === true) {
            SweetAlertUtils.showWarning(
                'No se puede editar',
                'Este registro no se puede actualizar ya que forma parte de una Orden Creada.'
            );
            return;
        }

        // Preparar los datos de la campaña para el modal
        const campanaParaEditar = {
            id_campania: campana.id_campania,
            NombreCampania: campana.nombrecampania,
            Anio: campana.Anio,
            id_Cliente: campana.id_Cliente,
            Id_Agencia: campana.Id_Agencia,
            id_Producto: campana.id_Producto,
            Presupuesto: campana.Presupuesto,
            estado: campana.estado,
            // Incluir los datos relacionados
            clientes: campana.clientes,
            productos: campana.productos,
            agencias: campana.agencias
        };
        
        setSelectedCampana(campanaParaEditar);
        setOpenEditModal(true);
    }, []);

    // Manejador de vista
    const handleView = useCallback((campana) => {
        navigate(`/campanas/${campana.id_campania}`);
    }, [navigate]);

    // Manejador de toggle de estado con SweetAlert2
    const handleToggleEstado = useCallback(async (campana) => {
        const nuevoEstado = !campana.estado;
        const accion = nuevoEstado ? 'activar' : 'desactivar';

        try {
            const result = await SweetAlertUtils.showConfirmation(
                '¿Estás seguro?',
                `¿Deseas ${accion} esta campaña?`,
                'warning'
            );

            if (result.isConfirmed) {
                SweetAlertUtils.showLoading('Actualizando estado...');
                
                const { error } = await supabase
                    .from('campania')
                    .update({ estado: nuevoEstado })
                    .eq('id_campania', campana.id_campania);

                if (error) throw error;

                await fetchCampanas();

                SweetAlertUtils.showSuccess(
                    '¡Actualizado!',
                    `La campaña ha sido ${accion}da exitosamente`
                );
            }
        } catch (error) {
            errorHandlingService.handleError(error, 'handleToggleEstado');
            SweetAlertUtils.showError(
                'Error',
                'No se pudo cambiar el estado de la campaña'
            );
        }
    }, [fetchCampanas]);

    // Funciones utilitarias memorizadas
    const getEstadoColor = useCallback((estado) => {
        const stateConfig = campaignService.campaignStates[estado];
        return stateConfig ? stateConfig.color : '#64748b';
    }, []);

    const getEstadoDescription = useCallback((estado) => {
        const stateConfig = campaignService.campaignStates[estado];
        return stateConfig ? stateConfig.description : 'Estado desconocido';
    }, []);

    // Filtro memorizado para optimizar rendimiento
    const filteredCampanas = useMemo(() => {
        return campanas.filter(campana => {
            const matchesSearch = Object.values({
                id_campania: campana.id_campania,
                nombreCliente: campana.clientes?.nombrecliente,
                NombreCampania: campana.nombrecampania,
                nombreAgencia: campana.agencias?.nombreidentificador,
                NombreDelProducto: campana.productos?.nombredelproducto
            }).join(' ').toLowerCase().includes(searchText.toLowerCase());

            const fechaCreacion = new Date(campana.fechaCreacion);
            const matchesDateFrom = !dateFrom || fechaCreacion >= new Date(dateFrom);
            const matchesDateTo = !dateTo || fechaCreacion <= new Date(dateTo);

            return matchesSearch && matchesDateFrom && matchesDateTo;
        });
    }, [campanas, searchText, dateFrom, dateTo]);

    // Función de exportación optimizada
    const exportToExcel = useCallback(() => {
        try {
            const dataToExport = campanas.map(campana => ({
                'ID': campana.id_campania,
                'Cliente': campana.clientes?.nombrecliente,
                'Nombre Campaña': campana.nombrecampania,
                'Agencia': campana.agencias?.nombreidentificador,
                'Producto': campana.productos?.nombredelproducto,
                'Presupuesto': campana.presupuesto,
                'Fecha Creación': new Date(campana.fechaCreacion).toLocaleDateString(),
                'Estado': campana.estado ? 'Activo' : 'Inactivo'
            }));

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Campañas');
            XLSX.writeFile(wb, 'Campañas.xlsx');
            
            SweetAlertUtils.showSuccess(
                'Exportación exitosa',
                'Las campañas han sido exportadas correctamente'
            );
        } catch (error) {
            errorHandlingService.handleError(error, 'exportToExcel');
            SweetAlertUtils.showError(
                'Error de exportación',
                'No se pudieron exportar las campañas'
            );
        }
    }, [campanas]);

    // Manejador de errores para mostrar alertas silenciosas
    useEffect(() => {
        if (campanasError) {
            errorHandlingService.handleError(campanasError, 'Campanas Data Loading');
        }
    }, [campanasError]);

    // Efecto para carga inicial
    useEffect(() => {
        fetchCampanas();
    }, [fetchCampanas]);

    if (campanasLoading) {
        return (
            <Container maxWidth="xl">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <LinearProgress sx={{ width: '50%' }} />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <div style={{ marginBottom: '20px', marginTop: '20px' }}>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
                    <Link component={RouterLink} to="/dashboard" color="inherit">
                        Inicio
                    </Link>
                    <Typography color="textPrimary">Campañas Optimizadas</Typography>
                </Breadcrumbs>
            </div>

            <Grid container spacing={3} style={{ marginBottom: '20px' }}>
                <Grid item xs={12} sm={4}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Buscar..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            )
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <TextField
                        fullWidth
                        type="date"
                        variant="outlined"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        label="Fecha desde"
                    />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <TextField
                        fullWidth
                        type="date"
                        variant="outlined"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        label="Fecha hasta"
                    />
                </Grid>
                <Grid item xs={12} sm={4} container justifyContent="flex-end" spacing={1}>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<FileDownloadIcon sx={{ color: 'white' }} />}
                            onClick={exportToExcel}
                        >
                            Exportar
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon sx={{ color: 'white' }} />}
                            onClick={() => setOpenModal(true)}
                        >
                            Nueva Campaña
                        </Button>
                    </Grid>
                </Grid>
            </Grid>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Cliente</TableCell>
                            <TableCell>Nombre de campaña</TableCell>
                            <TableCell>Agencia</TableCell>
                            <TableCell>Producto</TableCell>
                            <TableCell>Año</TableCell>
                            <TableCell>Presupuesto</TableCell>
                            <TableCell>Fecha de Creación</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Progreso</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCampanas.map((campana) => (
                            <TableRow key={campana.id_campania}>
                                <TableCell>{campana.clientes?.nombrecliente}</TableCell>
                                <TableCell>{campana.nombrecampania}</TableCell>
                                <TableCell>{campana.agencias?.nombreidentificador}</TableCell>
                                <TableCell>{campana.productos?.nombredelproducto}</TableCell>
                                <TableCell>{campana.Anio}</TableCell>
                                <TableCell>{campana.Presupuesto?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</TableCell>
                                <TableCell>{new Date(campana.fechaCreacion).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Chip
                                            label={getEstadoDescription(campana.estado || 'borrador')}
                                            sx={{
                                                backgroundColor: getEstadoColor(campana.estado || 'borrador'),
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                fontWeight: 600
                                            }}
                                            size="small"
                                        />
                                        <Switch
                                            checked={campana.estado}
                                            onChange={() => handleToggleEstado(campana)}
                                            color="primary"
                                            size="small"
                                        />
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <CampaignProgressBarOptimized
                                        estado={campana.estado || 'borrador'}
                                        fechaInicio={campana.fecha_inicio}
                                        fechaFin={campana.fecha_fin}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        color="primary"
                                        size="small"
                                        onClick={() => handleView(campana)}
                                    >
                                        <i className="fas fa-eye" style={{ color: 'white' }}></i>
                                    </IconButton>
                                    <IconButton
                                        color="success"
                                        size="small"
                                        onClick={() => handleEdit(campana)}
                                    >
                                        <i className="fas fa-edit" style={{ color: 'white' }} />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        size="small"
                                        onClick={() => handleDelete(campana.id_campania)}
                                    >
                                        <i className="fas fa-trash-alt" style={{ color: 'white' }}></i>
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <ModalAgregarCampana 
                open={openModal}
                onClose={() => setOpenModal(false)}
                onCampanaAdded={fetchCampanas}
            />

            <ModalEditarCampana
                open={openEditModal}
                onClose={() => {
                    setOpenEditModal(false);
                    setSelectedCampana(null);
                }}
                onCampanaUpdated={fetchCampanas}
                campanaData={selectedCampana}
            />
        </Container>
    );
};

// Componente optimizado para mostrar la barra de progreso de campaña
const CampaignProgressBarOptimized = ({ estado, fechaInicio, fechaFin }) => {
    const [progress, setProgress] = React.useState(0);
    const [nextState, setNextState] = React.useState(null);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        calculateProgress();
    }, [estado, fechaInicio, fechaFin]);

    const calculateProgress = React.useCallback(async () => {
        try {
            setLoading(true);
            
            // Calcular progreso basado en el estado actual
            const stateOrder = ['borrador', 'revision', 'aprobada', 'produccion', 'live', 'finalizada'];
            const currentIndex = stateOrder.indexOf(estado || 'borrador');
            const totalStates = stateOrder.length;
            const baseProgress = ((currentIndex + 1) / totalStates) * 100;

            // Si está en 'live', calcular progreso basado en tiempo
            if (estado === 'live' && fechaInicio && fechaFin) {
                const start = new Date(fechaInicio);
                const end = new Date(fechaFin);
                const now = new Date();
                
                if (now >= start && now <= end) {
                    const totalTime = end - start;
                    const elapsedTime = now - start;
                    const timeProgress = (elapsedTime / totalTime) * 100;
                    setProgress(Math.min(baseProgress * 0.7 + timeProgress * 0.3, 100));
                } else if (now > end) {
                    setProgress(100);
                } else {
                    setProgress(baseProgress);
                }
            } else {
                setProgress(baseProgress);
            }

            // Simplificado: sin predicción para evitar errores
            setNextState(null);
        } catch (error) {
            console.error('Error calculando progreso:', error);
            setProgress(0);
        } finally {
            setLoading(false);
        }
    }, [estado, fechaInicio, fechaFin]);

    const getProgressColor = React.useCallback(() => {
        if (progress >= 80) return 'success';
        if (progress >= 50) return 'primary';
        if (progress >= 30) return 'warning';
        return 'error';
    }, [progress]);

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                    {loading ? 'Calculando...' : `${Math.round(progress)}%`}
                </Typography>
            </Box>
            <LinearProgress
                variant={loading ? 'indeterminate' : 'determinate'}
                value={progress}
                color={getProgressColor()}
                sx={{ height: 6, borderRadius: 3 }}
            />
        </Box>
    );
};

export default CampanasOptimized;