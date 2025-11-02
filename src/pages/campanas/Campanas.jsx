import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '../../config/supabase';
import { mapearDatos } from '../../config/mapeo-campos';
import { campaignService } from '../../services/campaignService';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import ModalAgregarCampana from './ModalAgregarCampana';
import ModalEditarCampana from './ModalEditarCampana';
import './Campanas.css';

const Campanas = () => {
    const navigate = useNavigate();
    const [campanas, setCampanas] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedCampana, setSelectedCampana] = useState(null);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        fetchCampanas();
    }, []);

    const fetchCampanas = async () => {
        try {
            setLoading(true);
            
            // Usar el servicio de campañas que actualiza estados automáticamente
            const data = await campaignService.getCampaigns();

            // Filtrar solo campañas de la tabla 'campania' (no 'campanas')
            const filteredData = data.filter(campana =>
                campana.id_campania // Solo campañas que tienen id_campania
            );

            if (filteredData.length === 0) {
                setCampanas([]);
                setLoading(false);
                return;
            }

            // Obtener todos los IDs únicos para consultas masivas
            const clienteIds = [...new Set(filteredData.filter(c => c.id_cliente).map(c => c.id_cliente))];
            const productoIds = [...new Set(filteredData.filter(c => c.id_producto).map(c => c.id_producto))];
            const agenciaIds = [...new Set(filteredData.filter(c => c.id_agencia).map(c => c.id_agencia))];
            const anioIds = [...new Set(filteredData.filter(c => c.id_anio).map(c => c.id_anio))];

            // Consultas masivas en paralelo
            const [clientesResponse, productosResponse, agenciasResponse, aniosResponse] = await Promise.all([
                clienteIds.length > 0 ? supabase
                    .from('clientes')
                    .select('id_cliente, nombrecliente')
                    .in('id_cliente', clienteIds) : Promise.resolve({ data: [] }),
                productoIds.length > 0 ? supabase
                    .from('productos')
                    .select('id, nombredelproducto, id_cliente')
                    .in('id', productoIds) : Promise.resolve({ data: [] }),
                agenciaIds.length > 0 ? supabase
                    .from('agencias')
                    .select('id, nombreidentificador')
                    .in('id', agenciaIds) : Promise.resolve({ data: [] }),
                anioIds.length > 0 ? supabase
                    .from('anios')
                    .select('id, years')
                    .in('id', anioIds) : Promise.resolve({ data: [] })
            ]);

            // Crear mapas para búsqueda rápida
            const clientesMap = new Map(clientesResponse.data?.map(c => [c.id_cliente, c]) || []);
            const productosMap = new Map(productosResponse.data?.map(p => [p.id, p]) || []);
            const agenciasMap = new Map(agenciasResponse.data?.map(a => [a.id, a]) || []);
            const aniosMap = new Map(aniosResponse.data?.map(a => [a.id, a]) || []);

            // Enriquecer datos usando los mapas (más rápido que consultas individuales)
            const enrichedData = filteredData.map(campana => ({
                ...campana,
                clientes: clientesMap.get(campana.id_cliente) || null,
                productos: productosMap.get(campana.id_producto) || null,
                agencias: agenciasMap.get(campana.id_agencia) || null,
                anios: aniosMap.get(campana.id_anio) || null
            }));

            console.log('Datos obtenidos:', enrichedData);
            setCampanas(enrichedData);
        } catch (error) {
            console.error('Error al obtener campañas:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar las campañas'
            });
        } finally {
            setLoading(false);
        }
    };


    const handleDelete = async (id) => {
        try {
            await Swal.fire({
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
                    // Verificar dependencias de manera más robusta
                    let dependencias = [];

                    try {
                        // Verificar órdenes de publicidad
                        const ordenesResult = await supabase
                            .from('ordenesdepublicidad')
                            .select('id_orden')
                            .eq('id_campania', id);

                        if (ordenesResult.data && ordenesResult.data.length > 0) {
                            dependencias.push(`${ordenesResult.data.length} orden(es) de publicidad`);
                        }
                    } catch (error) {
                        console.warn('Error al verificar órdenes:', error);
                        // Intentar con el nombre correcto de columna si existe
                        try {
                            const ordenesResultAlt = await supabase
                                .from('ordenesdepublicidad')
                                .select('id_orden')
                                .eq('id_campana', id); // Intentar con id_campana en lugar de id_campania

                            if (ordenesResultAlt.data && ordenesResultAlt.data.length > 0) {
                                dependencias.push(`${ordenesResultAlt.data.length} orden(es) de publicidad`);
                            }
                        } catch (error2) {
                            console.warn('Error alternativo al verificar órdenes:', error2);
                        }
                    }

                    try {
                        // Verificar temas de campaña (campania_temas)
                        const temasResult = await supabase
                            .from('campania_temas')
                            .select('id')
                            .eq('id_campania', id);

                        if (temasResult.data && temasResult.data.length > 0) {
                            dependencias.push(`${temasResult.data.length} tema(s) de campaña`);
                        }
                    } catch (error) {
                        console.warn('Error al verificar temas de campaña:', error);
                    }

                    try {
                        // Verificar alternativas (si la tabla existe)
                        const alternativasResult = await supabase
                            .from('alternativas')
                            .select('id_alternativa')
                            .eq('id_campania', id);

                        if (alternativasResult.data && alternativasResult.data.length > 0) {
                            dependencias.push(`${alternativasResult.data.length} alternativa(s)`);
                        }
                    } catch (error) {
                        console.warn('Error al verificar alternativas:', error);
                        // No lanzamos error, continuamos
                    }

                    try {
                        // Verificar planificaciones (si la tabla existe)
                        const planificacionesResult = await supabase
                            .from('planificacion')
                            .select('id_planificacion')
                            .eq('id_campania', id);

                        if (planificacionesResult.data && planificacionesResult.data.length > 0) {
                            dependencias.push(`${planificacionesResult.data.length} planificacion(es)`);
                        }
                    } catch (error) {
                        console.warn('Error al verificar planificaciones:', error);
                        // No lanzamos error, continuamos
                    }

                    // Si hay dependencias, mostrar mensaje detallado
                    if (dependencias.length > 0) {
                        const mensajeDependencias = dependencias.join(', ');
                        Swal.fire({
                            icon: 'error',
                            title: 'No se puede eliminar',
                            html: `Esta campaña tiene las siguientes dependencias:<br><br><strong>${mensajeDependencias}</strong><br><br>Elimine estos elementos relacionados primero.`,
                            confirmButtonColor: '#3085d6'
                        });
                        return;
                    }

                    // Si no hay dependencias, proceder con la eliminación
                    console.log('No hay dependencias, procediendo con eliminación de campaña ID:', id);

                    const { error } = await supabase
                        .from('campania')
                        .delete()
                        .eq('id_campania', id);

                    if (error) {
                        console.error('Error al eliminar campaña:', error);
                        throw error;
                    }

                    console.log('Campaña eliminada exitosamente');
                    fetchCampanas();
                    Swal.fire(
                        'Eliminado',
                        'La campaña ha sido eliminada.',
                        'success'
                    );
                }
            });
        } catch (error) {
            console.error('Error al eliminar campaña:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar la campaña'
            });
        }
    };

    const handleEdit = (campana) => {
              // Verificar si la campaña forma parte de una orden creada
              if (campana.c_orden === true) {
                Swal.fire({
                    icon: 'warning',
                    title: 'No se puede editar',
                    text: 'Este registro no se puede actualizar ya que forma parte de una Orden Creada.',
                    confirmButtonColor: '#3085d6',
                });
                return;
            }
        // Preparar los datos de la campaña para el modal
        const campanaParaEditar = {
            id_campania: campana.id_campania,
            nombrecampania: campana.nombrecampania,
            id_anio: campana.id_anio,
            id_cliente: campana.id_cliente,
            id_agencia: campana.id_agencia,
            id_producto: campana.id_producto,
            presupuesto: campana.presupuesto,
            estado: campana.estado,
            // Incluir los datos relacionados
            clientes: campana.clientes,
            productos: campana.productos,
            agencias: campana.agencias
        };
        
        setSelectedCampana(campanaParaEditar);
        setOpenEditModal(true);
    };

    const handleView = (campana) => {
        navigate(`/campanas/${campana.id_campania}`);
    };

    const handleToggleEstado = async (campana) => {
        const nuevoEstado = !campana.estado;
        const accion = nuevoEstado ? 'activar' : 'desactivar';

        try {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: `¿Deseas ${accion} esta campaña?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, confirmar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                const { error } = await supabase
                    .from('campania')
                    .update({ estado: nuevoEstado })
                    .eq('id_campania', campana.id_campania);

                if (error) throw error;

                await fetchCampanas();

                Swal.fire({
                    icon: 'success',
                    title: '¡Actualizado!',
                    text: `La campaña ha sido ${accion}da exitosamente`,
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cambiar el estado de la campaña'
            });
        }
    };

    // Función para obtener el color del estado de campaña
    const getEstadoColor = (estado) => {
        const stateConfig = campaignService.campaignStates[estado];
        return stateConfig ? stateConfig.color : '#64748b';
    };

    // Función para obtener la descripción del estado
    const getEstadoDescription = (estado) => {
        const stateConfig = campaignService.campaignStates[estado];
        return stateConfig ? stateConfig.description : '';
    };

    const filteredCampanas = campanas.filter(campana => {
        const matchesSearch = Object.values({
            id_campania: campana.id_campania,
            nombreCliente: campana.clientes?.nombrecliente,
            NombreCampania: campana.nombrecampania,
            nombreAgencia: campana.agencias?.nombreidentificador,
            NombreDelProducto: campana.productos?.nombredelproducto
        }).join(' ').toLowerCase().includes(searchText.toLowerCase());

        const fechaCreacion = campana.created_at ? new Date(campana.created_at) : new Date();
        const matchesDateFrom = !dateFrom || fechaCreacion >= new Date(dateFrom);
        const matchesDateTo = !dateTo || fechaCreacion <= new Date(dateTo);

        return matchesSearch && matchesDateFrom && matchesDateTo;
    });

    // Preparar datos para el DataGrid
    const rows = filteredCampanas.map(campana => ({
        id: campana.id_campania,
        ...campana,
        nombreCliente: campana.clientes?.nombrecliente || 'Sin cliente',
        nombreCampania: campana.nombrecampania,
        nombreAgencia: campana.agencias?.nombreidentificador || 'Sin agencia',
        nombreProducto: campana.productos?.nombredelproducto || 'Sin producto',
        anio: campana.anios?.years || 'N/A',
        presupuesto: campana.presupuesto || 0,
        fechaCreacion: campana.created_at ? new Date(campana.created_at).toLocaleDateString('es-CL') : new Date().toLocaleDateString('es-CL'),
        estado: campana.estado || false
    }));

    // Definir columnas para el DataGrid
    const columns = [
        {
            field: 'nombreCliente',
            headerName: 'Cliente',
            width: 180,
            headerClassName: 'data-grid-header',
            flex: 1
        },
        {
            field: 'nombreCampania',
            headerName: 'Nombre de campaña',
            width: 200,
            headerClassName: 'data-grid-header',
            flex: 2
        },
        {
            field: 'nombreAgencia',
            headerName: 'Agencia',
            width: 180,
            headerClassName: 'data-grid-header',
            flex: 1
        },
        {
            field: 'nombreProducto',
            headerName: 'Producto',
            width: 180,
            headerClassName: 'data-grid-header',
            flex: 1
        },
        {
            field: 'anio',
            headerName: 'Año',
            width: 100,
            headerClassName: 'data-grid-header'
        },
        {
            field: 'presupuesto',
            headerName: 'Presupuesto',
            width: 150,
            headerClassName: 'data-grid-header',
            renderCell: (params) => (
                <Typography variant="body2">
                    {params.value ? `$${params.value.toLocaleString('es-CL')}` : '$0'}
                </Typography>
            )
        },
        {
            field: 'fechaCreacion',
            headerName: 'Fecha de Creación',
            width: 150,
            headerClassName: 'data-grid-header'
        },
        {
            field: 'estado',
            headerName: 'Estado',
            width: 150,
            headerClassName: 'data-grid-header',
            renderCell: (params) => (
                <Box display="flex" alignItems="center" gap={1}>
                    {getEstadoDescription(params.row.estado || 'borrador') && (
                        <Chip
                            label={getEstadoDescription(params.row.estado || 'borrador')}
                            sx={{
                                backgroundColor: getEstadoColor(params.row.estado || 'borrador'),
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 600
                            }}
                            size="small"
                        />
                    )}
                    <Switch
                        checked={params.row.estado}
                        onChange={() => handleToggleEstado(params.row)}
                        color="primary"
                        size="small"
                    />
                </Box>
            )
        },
        {
            field: 'progreso',
            headerName: 'Progreso',
            width: 150,
            headerClassName: 'data-grid-header',
            renderCell: (params) => (
                <CampaignProgressBar
                    estado={params.row.estado || 'borrador'}
                    fechaInicio={params.row.fecha_inicio}
                    fechaFin={params.row.fecha_fin}
                />
            )
        },
        {
            field: 'actions',
            headerName: 'Acciones',
            width: 120,
            headerClassName: 'data-grid-header',
            renderCell: (params) => (
                <div className="action-buttons">
                    <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleView(params.row)}
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

    const exportToExcel = () => {
        const dataToExport = campanas.map(campana => ({
            'ID': campana.id_campania,
            'Cliente': campana.clientes?.nombrecliente,
            'Nombre Campaña': campana.nombrecampania,
            'Agencia': campana.agencias?.nombreidentificador,
            'Producto': campana.productos?.nombredelproducto,
            'Presupuesto': campana.presupuesto,
            'Fecha Creación': campana.created_at ? new Date(campana.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
            'Estado': campana.estado ? 'Activo' : 'Inactivo'
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Campañas');
        XLSX.writeFile(wb, 'Campañas.xlsx');
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="campanas-container">
            {/* Header moderno con gradiente */}
            <div className="modern-header animate-slide-down">
                <div className="modern-title" style={{ fontSize: '1rem', marginTop: '14px', lineHeight: '1' }}>
                    📋 LISTADO DE CAMPAÑAS
                </div>
            </div>

            {/* Única fila: Campos de filtro y botones */}
            <Box sx={{ mb: 2, mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        sx={{ width: '300px' }}
                        variant="outlined"
                        placeholder="🔍 Buscar campaña..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="search-input"
                        size="small"
                        InputProps={{
                            style: { height: '40px' }
                        }}
                    />
                    <TextField
                        type="date"
                        variant="outlined"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
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
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
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
                        onClick={() => setOpenModal(true)}
                        startIcon={<AddIcon sx={{ color: '#fff' }} />}
                        className="btn-agregar"
                        sx={{ height: '40px' }}
                    >
                        Nueva Campaña
                    </Button>
                    <Button
                        variant="contained"
                        onClick={exportToExcel}
                        startIcon={<FileDownloadIcon sx={{ color: '#fff' }} />}
                        className="btn-agregar"
                        sx={{ height: '40px' }}
                    >
                        Exportar
                    </Button>
                </Box>
            </Box>

            <div className="data-grid-container">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                        <Typography>Cargando...</Typography>
                    </div>
                ) : (
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10, 25, 50]}
                        disableSelectionOnClick
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
                        sx={{
                            '& .MuiDataGrid-cell:focus': {
                                outline: 'none',
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: '#f5f5f5',
                            },
                        }}
                    />
                )}
            </div>

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
        </div>
    );
};

// Componente para mostrar la barra de progreso de campaña
const CampaignProgressBar = ({ estado, fechaInicio, fechaFin }) => {
  const [progress, setProgress] = React.useState(0);
  const [nextState, setNextState] = React.useState(null);

  React.useEffect(() => {
    calculateProgress();
  }, [estado, fechaInicio, fechaFin]);

  const calculateProgress = async () => {
    try {
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
    }
  };

  const getProgressColor = () => {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'primary';
    if (progress >= 30) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {Math.round(progress)}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        color={getProgressColor()}
        sx={{ height: 6, borderRadius: 3 }}
      />
    </Box>
  );
};

export default Campanas;
