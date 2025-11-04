/**
 * Dashboard de Rentabilidad Inteligente
 * Visualización multi-dimensional de rentabilidad para agencias de medios
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { rentabilidadInteligenteService } from '../../services/rentabilidadInteligenteService';
import { errorHandlingService } from '../../services/errorHandlingService';
import { SweetAlertUtils } from '../../utils/sweetAlertUtils';
import './RentabilidadDashboard.css';
import {
  Alert,
  AlertTitle,
  Box,
  Chip,
  Grid,
  Paper,
  Typography,
  IconButton,
  LinearProgress,
  Card,
  CardContent,
  Tooltip,
  Button,
  CircularProgress,
  Fab,
  useMediaQuery,
  useTheme,
  Avatar,
  Pagination
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  People as PeopleIcon,
  Campaign as CampaignIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  Assistant as AssistantIcon,
  AccountBalance as AccountBalanceIcon,
  ShowChart as ShowChartIcon,
  BusinessCenter as BusinessCenterIcon,
  Star as StarIcon,
  EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material';

const RentabilidadDashboard = () => {
    // Estados principales
    const [loading, setLoading] = useState(true);
    const [metricsData, setMetricsData] = useState({
        rentabilidadGeneral: {},
        rentabilidadPorCliente: [],
        rentabilidadPorMedio: [],
        oportunidadesActivas: [],
        tendencias: []
    });
    const [filtros, setFiltros] = useState({
        periodo: 'mes_actual',
        id_cliente: null,
    });
    const [vistaActual, setVistaActual] = useState('general');
    const [clientes, setClientes] = useState([]);

    // Estados para móvil
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobilePage, setMobilePage] = useState(1);

    // Función de utilidad para formatear moneda (disponible en todo el componente)
    const formatearMoneda = (monto) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(monto || 0);
    };

    // Debug de estado móvil y ruta actual
    useEffect(() => {
        console.log('RentabilidadDashboard: isMobile =', isMobile, 'pathname =', window.location?.pathname);
    }, [isMobile]);

    // Estados para análisis detallado
    const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
    const [analisisDetalle, setAnalisisDetalle] = useState(null);
    const [mostrarAnalisis, setMostrarAnalisis] = useState(false);

    // Carga inicial de datos
    useEffect(() => {
        cargarDatosIniciales();
    }, [filtros]);

    const cargarDatosIniciales = async () => {
        setLoading(true);
        try {
            // Cargar métricas principales
            const [rentabilidadGeneral, rentabilidadClientes, rentabilidadMedios, oportunidades] = await Promise.all([
                cargarRentabilidadGeneral(),
                cargarRentabilidadPorCliente(),
                cargarRentabilidadPorMedio(),
                cargarOportunidadesActivas()
            ]);

            setMetricsData({
                rentabilidadGeneral,
                rentabilidadPorCliente: rentabilidadClientes,
                rentabilidadPorMedio: rentabilidadMedios,
                oportunidadesActivas: oportunidades,
                tendencias: await cargarTendencias()
            });

        } catch (error) {
            errorHandlingService.handleError(error, 'cargarDatosIniciales');
            SweetAlertUtils.showError('Error', 'No se pudieron cargar los datos de rentabilidad');
        } finally {
            setLoading(false);
        }
    };

    // Cargar rentabilidad general
    const cargarRentabilidadGeneral = async () => {
        try {
            const data = await rentabilidadInteligenteService.obtenerMetricasDashboard(filtros);

            // Calcular totales y promedios
            const totals = data.reduce((acc, cliente) => ({
                inversionTotal: acc.inversionTotal + (cliente.inversion_total || 0),
                rentabilidadTotal: acc.rentabilidadTotal + (cliente.rentabilidad_total || 0),
                comisionesTotal: acc.comisionesTotal + (cliente.comisiones_total || 0),
                bonificacionesTotal: acc.bonificacionesTotal + (cliente.bonificaciones_total || 0),
                markupTotal: acc.markupTotal + (cliente.markup_total || 0),
                totalClientes: acc.totalClientes + 1
            }), {
                inversionTotal: 0,
                rentabilidadTotal: 0,
                comisionesTotal: 0,
                bonificacionesTotal: 0,
                markupTotal: 0,
                totalClientes: 0
            });

            const rentabilidadPromedio = totals.totalClientes > 0
                ? (totals.rentabilidadTotal / totals.totalClientes)
                : 0;

            const rentabilidadPorcentajeGeneral = totals.inversionTotal > 0
                ? (totals.rentabilidadTotal / totals.inversionTotal) * 100
                : 0;

            return {
                ...totals,
                rentabilidadPromedio,
                rentabilidadPorcentajeGeneral,
                eficienciaGeneral: calcularEficienciaGeneral(totals)
            };
        } catch (error) {
            errorHandlingService.handleError(error, 'cargarRentabilidadGeneral');
            return {};
        }
    };

    // Cargar rentabilidad por cliente
    const cargarRentabilidadPorCliente = async () => {
        try {
            const data = await rentabilidadInteligenteService.obtenerMetricasDashboard(filtros);
            return data.map(cliente => ({
                ...cliente,
                eficiencia: calcularEficienciaCliente(cliente),
                categoria: categorizarRentabilidad(cliente.rentabilidad_porcentaje)
            }));
        } catch (error) {
            errorHandlingService.handleError(error, 'cargarRentabilidadPorCliente');
            return [];
        }
    };

    // Cargar rentabilidad por medio
    const cargarRentabilidadPorMedio = async () => {
        try {
            // Simulación - en implementación real vendría de la vista vw_rentabilidad_medio
            const data = await rentabilidadInteligenteService.obtenerMetricasPorMedio(filtros);
            return data.map(medio => ({
                ...medio,
                eficiencia: calcularEficienciaMedio(medio),
                categoria: categorizarRentabilidad(medio.rentabilidad_porcentaje)
            }));
        } catch (error) {
            errorHandlingService.handleError(error, 'cargarRentabilidadPorMedio');
            return [];
        }
    };

    // Cargar oportunidades activas
    const cargarOportunidadesActivas = async () => {
        try {
            const data = await rentabilidadInteligenteService.obtenerOportunidadesActivas();
            return data.map(oportunidad => ({
                ...oportunidad,
                impactoFormateado: formatearMoneda(oportunidad.impacto_estimado),
                prioridadClase: obtenerClasePrioridad(oportunidad.prioridad),
                confianzaClase: obtenerClaseConfianza(oportunidad.confianza_ia)
            }));
        } catch (error) {
            errorHandlingService.handleError(error, 'cargarOportunidadesActivas');
            return [];
        }
    };

    // Cargar tendencias
    const cargarTendencias = async () => {
        try {
            // Simulación de datos de tendencia
            return [
                { mes: 'Ene', rentabilidad: 22, inversion: 1500000 },
                { mes: 'Feb', rentabilidad: 24, inversion: 1800000 },
                { mes: 'Mar', rentabilidad: 26, inversion: 2100000 },
                { mes: 'Abr', rentabilidad: 25, inversion: 1950000 },
                { mes: 'May', rentabilidad: 28, inversion: 2300000 },
                { mes: 'Jun', rentabilidad: 30, inversion: 2500000 }
            ];
        } catch (error) {
            errorHandlingService.handleError(error, 'cargarTendencias');
            return [];
        }
    };

    // Análisis detallado de orden
    const analizarOrden = async (idOrden) => {
        try {
            SweetAlertUtils.showLoading('Analizando rentabilidad con IA...');

            const analisis = await rentabilidadInteligenteService.analizarRentabilidadOrden(idOrden);
            setAnalisisDetalle(analisis);
            setMostrarAnalisis(true);

            SweetAlertUtils.close();

            // Mostrar resumen de resultados
            await mostrarResumenAnalisis(analisis);

        } catch (error) {
            errorHandlingService.handleError(error, 'analizarOrden');
            SweetAlertUtils.showError('Error', 'No se pudo analizar la rentabilidad de la orden');
        }
    };

    // Mostrar resumen del análisis con SweetAlert2
    const mostrarResumenAnalisis = async (analisis) => {
        const { rentabilidad, oportunidades } = analisis;

        let htmlResumen = `
            <div class="analisis-resumen">
                <div class="metrica-principal">
                    <h4>📊 Rentabilidad Total</h4>
                    <div class="valor-destacado ${rentabilidad.rentabilidadPorcentaje >= 25 ? 'positivo' : 'negativo'}">
                        ${rentabilidad.rentabilidadPorcentaje.toFixed(1)}%
                    </div>
                    <div class="detalle-valor">
                        ${formatearMoneda(rentabilidad.rentabilidadNeta)}
                    </div>
                </div>

                <div class="desglose-rentabilidad">
                    <h5>Desglose de Fuentes:</h5>
                    <div class="fuente-rentabilidad">
                        <span>💰 Comisiones:</span>
                        <span>${formatearMoneda(rentabilidad.comisionesTotal)}</span>
                    </div>
                    <div class="fuente-rentabilidad">
                        <span>🎯 Bonificaciones:</span>
                        <span>${formatearMoneda(rentabilidad.bonificacionesTotal)}</span>
                    </div>
                    <div class="fuente-rentabilidad">
                        <span>📈 Markup:</span>
                        <span>${formatearMoneda(rentabilidad.markupTotal)}</span>
                    </div>
                </div>
        `;

        if (oportunidades.length > 0) {
            htmlResumen += `
                <div class="oportunidades-resumen">
                    <h5>🚀 Oportunidades Detectadas (${oportunidades.length}):</h5>
                    ${oportunidades.slice(0, 3).map(opp => `
                        <div class="oportunidad-item">
                            <strong>${opp.tipo_oportunidad}:</strong> ${opp.descripcion}
                            <br><small>Impacto: ${formatearMoneda(opp.impacto_estimado)}</small>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        htmlResumen += '</div>';

        const resultado = await SweetAlertUtils.showCustom({
            title: '🤖 Análisis de Rentabilidad IA',
            html: htmlResumen,
            showCancelButton: true,
            confirmButtonText: '📋 Ver Detalle Completo',
            cancelButtonText: '✅ Entendido',
            customClass: {
                popup: 'rentabilidad-analysis-popup'
            }
        });

        if (resultado.isConfirmed) {
            // El usuario quiere ver el detalle completo (ya está visible)
        }
    };

    // Aplicar optimizaciones sugeridas por IA
    const aplicarOptimizaciones = async (oportunidades) => {
        try {
            SweetAlertUtils.showLoading('Aplicando optimizaciones de IA...');

            let resultados = [];
            for (const oportunidad of oportunidades) {
                const resultado = await rentabilidadInteligenteService.aplicarOptimizacion(oportunidad);
                resultados.push(resultado);
            }

            SweetAlertUtils.close();

            await SweetAlertUtils.showSuccess(
                '✅ Optimizaciones Aplicadas',
                `Se aplicaron ${resultados.length} optimizaciones con éxito.\nImpacto estimado: ${formatearMoneda(
                    resultados.reduce((sum, r) => sum + (r.impacto_real || 0), 0)
                )}`
            );

            // Recargar datos
            await cargarDatosIniciales();

        } catch (error) {
            errorHandlingService.handleError(error, 'aplicarOptimizaciones');
            SweetAlertUtils.showError('Error', 'No se pudieron aplicar las optimizaciones');
        }
    };

    // Funciones utilitarias
    const calcularEficienciaGeneral = (totals) => {
        const eficienciaComision = totals.inversionTotal > 0 ? (totals.comisionesTotal / totals.inversionTotal) * 100 : 0;
        const eficienciaMarkup = totals.inversionTotal > 0 ? (totals.markupTotal / totals.inversionTotal) * 100 : 0;
        return (eficienciaComision + eficienciaMarkup) / 2;
    };

    const calcularEficienciaCliente = (cliente) => {
        const eficienciaComision = cliente.inversion_total > 0 ? (cliente.comisiones_total / cliente.inversion_total) * 100 : 0;
        const eficienciaMarkup = cliente.inversion_total > 0 ? (cliente.markup_total / cliente.inversion_total) * 100 : 0;
        return (eficienciaComision + eficienciaMarkup) / 2;
    };

    const calcularEficienciaMedio = (medio) => {
        const eficienciaBonificacion = medio.inversion_total > 0 ? (medio.bonificaciones_total / medio.inversion_total) * 100 : 0;
        const eficienciaMarkup = medio.inversion_total > 0 ? (medio.markup_total / medio.inversion_total) * 100 : 0;
        return (eficienciaBonificacion + eficienciaMarkup) / 2;
    };

    const categorizarRentabilidad = (porcentaje) => {
        if (porcentaje >= 30) return { nombre: 'Excelente', clase: 'excelente' };
        if (porcentaje >= 25) return { nombre: 'Muy Buena', clase: 'muy-buena' };
        if (porcentaje >= 20) return { nombre: 'Buena', clase: 'buena' };
        if (porcentaje >= 15) return { nombre: 'Regular', clase: 'regular' };
        return { nombre: 'Baja', clase: 'baja' };
    };


    const obtenerClasePrioridad = (prioridad) => {
        const clases = {
            'critica': 'prioridad-critica',
            'alta': 'prioridad-alta',
            'media': 'prioridad-media',
            'baja': 'prioridad-baja'
        };
        return clases[prioridad] || 'prioridad-media';
    };

    const obtenerClaseConfianza = (confianza) => {
        if (confianza >= 80) return 'confianza-alta';
        if (confianza >= 60) return 'confianza-media';
        return 'confianza-baja';
    };


    // Renderizado principal
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Box textAlign="center">
                    <CircularProgress size={60} sx={{ mb: 2, color: '#10b981' }} />
                    <Typography variant="h6" color="text.secondary">
                        Analizando rentabilidad con IA...
                    </Typography>
                </Box>
            </Box>
        );
    }

    // Versión móvil
    if (isMobile) {
        console.log('RentabilidadDashboard: Renderizando versión móvil');
        console.log('Datos disponibles:', metricsData);
        
        return (
            <Box className="animate-fade-in" sx={{ p: 0, backgroundColor: '#f5f7fa', minHeight: 'calc(100vh - 56px - 64px)' }}>
                {/* Header móvil mejorado */}
                <Box sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white !important',
                    borderRadius: '0 0 24px 24px',
                    position: 'relative',
                    overflow: 'hidden',
                    '& .MuiTypography-root': {
                        color: 'white !important'
                    }
                }}>
                    <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                        <ShowChartIcon sx={{ fontSize: 120, color: 'white !important' }} />
                    </Box>
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <AttachMoneyIcon sx={{ fontSize: 32, color: 'white !important' }} />
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white !important' }}>
                                Rentabilidad IA
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, color: 'white !important' }}>
                            Análisis inteligente en tiempo real
                        </Typography>
                    </Box>
                </Box>

                {/* Card principal de resumen con animación */}
                <Box sx={{ p: 2, pb: 1 }}>
                    <Box sx={{ maxWidth: '600px', mx: 'auto' }}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white !important',
                            borderRadius: '24px',
                            p: 3,
                            textAlign: 'center',
                            boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)'
                            },
                            '& .MuiTypography-root': {
                                color: 'white !important'
                            }
                        }}>
                            <Box sx={{ position: 'absolute', top: -15, right: -15, opacity: 0.1 }}>
                                <TrendingUpIcon sx={{ fontSize: 100, color: 'white !important' }} />
                            </Box>
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, color: 'white !important' }}>
                                    {metricsData.rentabilidadGeneral.rentabilidadPorcentajeGeneral?.toFixed(1) || '0.0'}%
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9, mb: 2, color: 'white !important' }}>
                                    Rentabilidad General
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                    <AccountBalanceIcon sx={{ fontSize: 20, color: 'white !important' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'white !important' }}>
                                        {formatearMoneda(metricsData.rentabilidadGeneral.rentabilidadTotal || 0)}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block', color: 'white !important' }}>
                                    Rentabilidad neta
                                </Typography>
                            </Box>
                        </Card>
                    </Box>
                </Box>

                {/* Cards KPI móviles con iconos y animaciones */}
                <Box sx={{ px: 2, pb: 2 }}>
                    <Grid container spacing={2} sx={{ maxWidth: '600px', mx: 'auto', ml: '-5.5px' }}>
                        <Grid item xs={12}>
                            <Card sx={{
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                color: 'white !important',
                                borderRadius: '20px',
                                p: 2,
                                textAlign: 'center',
                                boxShadow: '0 6px 24px rgba(240, 147, 251, 0.4)',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)'
                                },
                                '& .MuiTypography-root': {
                                    color: 'white !important'
                                }
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                                    <BusinessCenterIcon sx={{ fontSize: 20, color: 'white !important' }} />
                                    <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 'medium', color: 'white !important' }}>
                                        Inversión Total
                                    </Typography>
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white !important' }}>
                                    {formatearMoneda(metricsData.rentabilidadGeneral.inversionTotal || 0)}
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                <Card sx={{
                                    flex: 1,
                                    maxWidth: '280px',
                                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                    color: 'white !important',
                                    borderRadius: '20px',
                                    p: 2,
                                    textAlign: 'center',
                                    boxShadow: '0 6px 24px rgba(79, 172, 254, 0.4)',
                                    transition: 'transform 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)'
                                    },
                                    '& .MuiTypography-root': {
                                        color: 'white !important'
                                    }
                                }}>
                                    <ShoppingCartIcon sx={{ fontSize: 20, mb: 1, color: 'white !important' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white !important' }}>
                                        {formatearMoneda(metricsData.rentabilidadGeneral.comisionesTotal || 0)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.9, color: 'white !important' }}>
                                        Comisiones
                                    </Typography>
                                </Card>
                                <Card sx={{
                                    flex: 1,
                                    maxWidth: '280px',
                                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                    color: 'white !important',
                                    borderRadius: '20px',
                                    p: 2,
                                    textAlign: 'center',
                                    boxShadow: '0 6px 24px rgba(67, 233, 123, 0.4)',
                                    transition: 'transform 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)'
                                    },
                                    '& .MuiTypography-root': {
                                        color: 'white !important'
                                    }
                                }}>
                                    <StarIcon sx={{ fontSize: 20, mb: 1, color: 'white !important' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white !important' }}>
                                        {formatearMoneda(metricsData.rentabilidadGeneral.bonificacionesTotal || 0)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.9, color: 'white !important' }}>
                                        Bonificaciones
                                    </Typography>
                                </Card>
                            </Box>
                        </Grid>
                    </Grid>

                        {/* Navegación móvil */}
                        <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                            <Chip
                                label="General"
                                onClick={() => {
                                    console.log('Cambiando a vista general');
                                    setVistaActual('general');
                                }}
                                color={vistaActual === 'general' ? 'primary' : 'default'}
                                variant={vistaActual === 'general' ? 'filled' : 'outlined'}
                                size="small"
                                sx={{
                                    '& .MuiChip-label': {
                                        color: vistaActual === 'general' ? 'white' : 'inherit'
                                    }
                                }}
                            />
                            <Chip
                                label="Clientes"
                                onClick={() => {
                                    console.log('Cambiando a vista clientes');
                                    setVistaActual('clientes');
                                    setMobilePage(1); // Resetear página al cambiar vista
                                }}
                                color={vistaActual === 'clientes' ? 'primary' : 'default'}
                                variant={vistaActual === 'clientes' ? 'filled' : 'outlined'}
                                size="small"
                                sx={{
                                    '& .MuiChip-label': {
                                        color: vistaActual === 'clientes' ? 'white' : 'inherit'
                                    }
                                }}
                            />
                            <Chip
                                label="Medios"
                                onClick={() => {
                                    console.log('Cambiando a vista medios');
                                    setVistaActual('medios');
                                    setMobilePage(1); // Resetear página al cambiar vista
                                }}
                                color={vistaActual === 'medios' ? 'primary' : 'default'}
                                variant={vistaActual === 'medios' ? 'filled' : 'outlined'}
                                size="small"
                                sx={{
                                    '& .MuiChip-label': {
                                        color: vistaActual === 'medios' ? 'white' : 'inherit'
                                    }
                                }}
                            />
                        </Box>

                        {/* Contenido móvil */}
                        <Box sx={{ mt: 2 }}>
                            {vistaActual === 'general' && <VistaGeneralMobile metrics={metricsData} formatearMoneda={formatearMoneda} />}
                            {vistaActual === 'clientes' && (
                                <VistaPorClienteMobile
                                    clientes={metricsData.rentabilidadPorCliente || []}
                                    mobilePage={mobilePage}
                                    setMobilePage={setMobilePage}
                                    formatearMoneda={formatearMoneda}
                                />
                            )}
                            {vistaActual === 'medios' && (
                                <VistaPorMedioMobile
                                    medios={metricsData.rentabilidadPorMedio || []}
                                    mobilePage={mobilePage}
                                    setMobilePage={setMobilePage}
                                    formatearMoneda={formatearMoneda}
                                />
                            )}
                        </Box>
                    </Box>
                </Box>
        );
    }

    return (
        <div className="dashboard animate-fade-in">
            {/* Header moderno con gradiente */}
            <div className="modern-header animate-slide-down">
                <div className="modern-title">
                    💰 DASHBOARD DE RENTABILIDAD INTELIGENTE
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Análisis multi-dimensional con IA
                    </Typography>
                    <Tooltip title="Actualizar datos">
                        <IconButton
                            onClick={cargarDatosIniciales}
                            size="small"
                            className="modern-btn-outline"
                            sx={{ borderRadius: '50%' }}
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>

            {/* Filtros */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                    Período:
                </Typography>
                <Chip
                    label={filtros.periodo === 'mes_actual' ? 'Mes Actual' :
                           filtros.periodo === 'mes_anterior' ? 'Mes Anterior' :
                           filtros.periodo === 'trimestre_actual' ? 'Trimestre Actual' : 'Año Actual'}
                    onClick={() => {
                        const periodos = ['mes_actual', 'mes_anterior', 'trimestre_actual', 'anio_actual'];
                        const currentIndex = periodos.indexOf(filtros.periodo);
                        const nextIndex = (currentIndex + 1) % periodos.length;
                        setFiltros({...filtros, periodo: periodos[nextIndex]});
                    }}
                    color="primary"
                    variant="outlined"
                    size="small"
                />
            </Box>

            {/* Grid de estadísticas de rentabilidad mejoradas */}
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={4} className="animate-slide-up card-hover" style={{ animationDelay: '0.1s' }}>
                    <Card className="modern-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography color="textSecondary" gutterBottom variant="overline" className="text-gradient">
                                        💰 Rentabilidad General
                                    </Typography>
                                    <Typography variant="h4" component="div" className="text-gradient" sx={{ fontWeight: 700 }}>
                                        {metricsData.rentabilidadGeneral.rentabilidadPorcentajeGeneral?.toFixed(1)}%
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        {formatearMoneda(metricsData.rentabilidadGeneral.rentabilidadTotal)}
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    background: 'var(--gradient-success)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
                                    flexShrink: 0
                                }}>
                                    <AttachMoneyIcon sx={{ fontSize: 32, color: 'white' }} className="icon-hover animate-pulse" />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4} className="animate-slide-up card-hover" style={{ animationDelay: '0.2s' }}>
                    <Card className="modern-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography color="textSecondary" gutterBottom variant="overline" className="text-gradient">
                                        📊 Inversión Total
                                    </Typography>
                                    <Typography variant="h4" component="div" className="text-gradient" sx={{ fontWeight: 700 }}>
                                        {formatearMoneda(metricsData.rentabilidadGeneral.inversionTotal)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        {metricsData.rentabilidadGeneral.totalClientes} clientes
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    background: 'var(--gradient-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
                                    flexShrink: 0
                                }}>
                                    <CampaignIcon sx={{ fontSize: 32, color: 'white' }} className="icon-hover animate-pulse" />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4} className="animate-slide-up card-hover" style={{ animationDelay: '0.3s' }}>
                    <Card className="modern-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography color="textSecondary" gutterBottom variant="overline" className="text-gradient">
                                        🛒 Comisiones
                                    </Typography>
                                    <Typography variant="h4" component="div" className="text-gradient" sx={{ fontWeight: 700 }}>
                                        {formatearMoneda(metricsData.rentabilidadGeneral.comisionesTotal)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        {metricsData.rentabilidadGeneral.inversionTotal > 0
                                            ? ((metricsData.rentabilidadGeneral.comisionesTotal / metricsData.rentabilidadGeneral.inversionTotal) * 100).toFixed(1)
                                            : 0}% del total
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    background: 'var(--gradient-warning)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)',
                                    flexShrink: 0
                                }}>
                                    <ShoppingCartIcon sx={{ fontSize: 32, color: 'white' }} className="icon-hover animate-pulse" />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4} className="animate-slide-up card-hover" style={{ animationDelay: '0.4s' }}>
                    <Card className="modern-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography color="textSecondary" gutterBottom variant="overline" className="text-gradient">
                                        🎁 Bonificaciones
                                    </Typography>
                                    <Typography variant="h4" component="div" className="text-gradient" sx={{ fontWeight: 700 }}>
                                        {formatearMoneda(metricsData.rentabilidadGeneral.bonificacionesTotal)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        {metricsData.rentabilidadGeneral.inversionTotal > 0
                                            ? ((metricsData.rentabilidadGeneral.bonificacionesTotal / metricsData.rentabilidadGeneral.inversionTotal) * 100).toFixed(1)
                                            : 0}% del total
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    background: 'var(--gradient-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 8px 16px rgba(139, 92, 246, 0.3)',
                                    flexShrink: 0
                                }}>
                                    <TrendingUpIcon sx={{ fontSize: 32, color: 'white' }} className="icon-hover animate-pulse" />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4} className="animate-slide-up card-hover" style={{ animationDelay: '0.5s' }}>
                    <Card className="modern-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography color="textSecondary" gutterBottom variant="overline" className="text-gradient">
                                        📈 Markup
                                    </Typography>
                                    <Typography variant="h4" component="div" className="text-gradient" sx={{ fontWeight: 700 }}>
                                        {formatearMoneda(metricsData.rentabilidadGeneral.markupTotal)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        {metricsData.rentabilidadGeneral.inversionTotal > 0
                                            ? ((metricsData.rentabilidadGeneral.markupTotal / metricsData.rentabilidadGeneral.inversionTotal) * 100).toFixed(1)
                                            : 0}% del total
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    background: 'var(--gradient-error)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 8px 16px rgba(239, 68, 68, 0.3)',
                                    flexShrink: 0
                                }}>
                                    <TimelineIcon sx={{ fontSize: 32, color: 'white' }} className="icon-hover animate-pulse" />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4} className="animate-slide-up card-hover" style={{ animationDelay: '0.6s' }}>
                    <Card className="modern-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography color="textSecondary" gutterBottom variant="overline" className="text-gradient">
                                        ⚡ Eficiencia
                                    </Typography>
                                    <Typography variant="h4" component="div" className="text-gradient" sx={{ fontWeight: 700 }}>
                                        {metricsData.rentabilidadGeneral.eficienciaGeneral?.toFixed(1)}%
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        Optimización general
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    background: 'var(--gradient-success)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 8px 16px rgba(6, 182, 212, 0.3)',
                                    flexShrink: 0
                                }}>
                                    <CheckCircleIcon sx={{ fontSize: 32, color: 'white' }} className="icon-hover animate-pulse" />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Navegación de Vistas */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                    label="General"
                    onClick={() => setVistaActual('general')}
                    color={vistaActual === 'general' ? 'primary' : 'default'}
                    variant={vistaActual === 'general' ? 'filled' : 'outlined'}
                />
                <Chip
                    label="Por Cliente"
                    onClick={() => setVistaActual('clientes')}
                    color={vistaActual === 'clientes' ? 'primary' : 'default'}
                    variant={vistaActual === 'clientes' ? 'filled' : 'outlined'}
                />
                <Chip
                    label="Por Medio"
                    onClick={() => setVistaActual('medios')}
                    color={vistaActual === 'medios' ? 'primary' : 'default'}
                    variant={vistaActual === 'medios' ? 'filled' : 'outlined'}
                />
                <Chip
                    label="Oportunidades IA"
                    onClick={() => setVistaActual('oportunidades')}
                    color={vistaActual === 'oportunidades' ? 'primary' : 'default'}
                    variant={vistaActual === 'oportunidades' ? 'filled' : 'outlined'}
                />
                <Chip
                    label="Tendencias"
                    onClick={() => setVistaActual('tendencias')}
                    color={vistaActual === 'tendencias' ? 'primary' : 'default'}
                    variant={vistaActual === 'tendencias' ? 'filled' : 'outlined'}
                />
            </Box>

            {/* Contenido Dinámico */}
            <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12}>
                    {vistaActual === 'general' && <VistaGeneral metrics={metricsData} />}
                    {vistaActual === 'clientes' && <VistaPorCliente clientes={metricsData.rentabilidadPorCliente} />}
                    {vistaActual === 'medios' && <VistaPorMedio medios={metricsData.rentabilidadPorMedio} />}
                    {vistaActual === 'oportunidades' && (
                        <VistaOportunidades
                            oportunidades={metricsData.oportunidadesActivas}
                            onAplicarOptimizaciones={aplicarOptimizaciones}
                        />
                    )}
                    {vistaActual === 'tendencias' && <VistaTendencias datos={metricsData.tendencias} />}
                </Grid>
            </Grid>

            {/* Modal de Análisis Detallado */}
            {mostrarAnalisis && analisisDetalle && (
                <ModalAnalisisDetalle
                    analisis={analisisDetalle}
                    onClose={() => setMostrarAnalisis(false)}
                />
            )}
        </div>
    );
};

// Componentes de Vista
const VistaGeneral = ({ metrics }) => (
    <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Top Clientes Rentables
                    </Typography>
                    <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                        {metrics.rentabilidadPorCliente.slice(0, 5).map((cliente, index) => (
                            <Box key={cliente.id_cliente} sx={{ py: 1, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Chip label={`#${index + 1}`} size="small" color="primary" />
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" fontWeight="medium">
                                        {cliente.nombreCliente}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: cliente.rentabilidad_porcentaje >= 25 ? '#10b981' : '#ef4444' }}>
                                    {cliente.rentabilidad_porcentaje?.toFixed(1)}%
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>
        </Grid>

        <Grid item xs={12} md={4}>
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Medios Más Rentables
                    </Typography>
                    <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                        {metrics.rentabilidadPorMedio.slice(0, 5).map((medio, index) => (
                            <Box key={medio.id} sx={{ py: 1, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Chip label={`#${index + 1}`} size="small" color="secondary" />
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" fontWeight="medium">
                                        {medio.nombredelmedio}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: medio.rentabilidad_porcentaje >= 25 ? '#10b981' : '#ef4444' }}>
                                    {medio.rentabilidad_porcentaje?.toFixed(1)}%
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>
        </Grid>

        <Grid item xs={12} md={4}>
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Oportunidades Críticas
                    </Typography>
                    <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                        {metrics.oportunidadesActivas
                            .filter(o => o.prioridad === 'critica' || o.prioridad === 'alta')
                            .slice(0, 5)
                            .map((oportunidad, index) => (
                                <Box key={oportunidad.id} sx={{ py: 1, borderBottom: '1px solid #f0f0f0' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Chip
                                            label={oportunidad.tipo_oportunidad}
                                            size="small"
                                            color={oportunidad.prioridad === 'critica' ? 'error' : 'warning'}
                                        />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Impacto: {oportunidad.impactoFormateado}
                                    </Typography>
                                </Box>
                            ))}
                    </Box>
                </CardContent>
            </Card>
        </Grid>
    </Grid>
);

const VistaPorCliente = ({ clientes }) => (
    <Grid item xs={12}>
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Rentabilidad por Cliente
                </Typography>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {clientes.map(cliente => (
                            <Card key={cliente.id_cliente} variant="outlined" sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {cliente.nombreCliente}
                                    </Typography>
                                    <Chip
                                        label={`${cliente.rentabilidad_porcentaje?.toFixed(1)}%`}
                                        color={cliente.rentabilidad_porcentaje >= 25 ? 'success' : 'warning'}
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="body2" color="text.secondary">Inversión</Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(cliente.inversion_total)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="body2" color="text.secondary">Comisiones</Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(cliente.comisiones_total)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="body2" color="text.secondary">Bonificaciones</Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(cliente.bonificaciones_total)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="body2" color="text.secondary">Categoría</Typography>
                                        <Chip
                                            label={cliente.categoria?.nombre}
                                            size="small"
                                            color={cliente.categoria?.clase === 'excelente' ? 'success' : 'default'}
                                        />
                                    </Grid>
                                </Grid>
                            </Card>
                        ))}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    </Grid>
);

const VistaPorMedio = ({ medios }) => (
    <Grid item xs={12}>
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Rentabilidad por Medio
                </Typography>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {medios.map(medio => (
                            <Card key={medio.id} variant="outlined" sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {medio.nombredelmedio}
                                    </Typography>
                                    <Chip
                                        label={`${medio.rentabilidad_porcentaje?.toFixed(1)}%`}
                                        color={medio.rentabilidad_porcentaje >= 25 ? 'success' : 'warning'}
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="body2" color="text.secondary">Inversión</Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(medio.inversion_total)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="body2" color="text.secondary">Bonificaciones</Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(medio.bonificaciones_total)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="body2" color="text.secondary">Markup</Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(medio.markup_total)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="body2" color="text.secondary">Órdenes</Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {medio.numero_ordenes}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Card>
                        ))}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    </Grid>
);

const VistaOportunidades = ({ oportunidades, onAplicarOptimizaciones }) => (
    <Grid item xs={12}>
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                        Oportunidades Detectadas por IA
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => onAplicarOptimizaciones(oportunidades.slice(0, 5))}
                        disabled={oportunidades.length === 0}
                        startIcon={<TrendingUpIcon />}
                    >
                        ⚡ Aplicar Top 5 Optimizaciones
                    </Button>
                </Box>

                <Grid container spacing={3}>
                    {oportunidades.map(oportunidad => (
                        <Grid item xs={12} md={6} lg={4} key={oportunidad.id}>
                            <Card
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    borderLeft: `4px solid ${
                                        oportunidad.prioridad === 'critica' ? '#ef4444' :
                                        oportunidad.prioridad === 'alta' ? '#f59e0b' : '#3b82f6'
                                    }`
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {oportunidad.tipo_oportunidad}
                                    </Typography>
                                    <Chip
                                        label={oportunidad.prioridad}
                                        size="small"
                                        color={
                                            oportunidad.prioridad === 'critica' ? 'error' :
                                            oportunidad.prioridad === 'alta' ? 'warning' : 'primary'
                                        }
                                    />
                                </Box>

                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    {oportunidad.descripcion}
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">Métricas:</Typography>
                                    <Grid container spacing={1}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption">Impacto:</Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                {oportunidad.impactoFormateado}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption">Probabilidad:</Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                {oportunidad.probabilidad_exito}%
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption">Confianza IA:</Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                {oportunidad.confianza_ia}%
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Acción recomendada:
                                    </Typography>
                                    <Typography variant="body2">
                                        {oportunidad.accion_recomendada}
                                    </Typography>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    </Grid>
);

const VistaTendencias = ({ datos }) => (
    <Grid item xs={12}>
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Tendencias de Rentabilidad
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'end', height: 300 }}>
                    {datos.map(dato => (
                        <Box key={dato.mes} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: `${dato.rentabilidad * 8}px`,
                                    backgroundColor: dato.rentabilidad >= 25 ? '#10b981' : '#f59e0b',
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'top',
                                    justifyContent: 'center',
                                    pt: 1,
                                    minHeight: 20
                                }}
                            >
                                <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    {dato.rentabilidad}%
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                {dato.mes}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    </Grid>
);

// Componentes móviles
const VistaGeneralMobile = ({ metrics, formatearMoneda }) => {
    console.log('VistaGeneralMobile: Renderizando con métricas:', metrics);
    
    return (
        <Box sx={{ pb: 2 }}>
            {/* Tarjeta de resumen principal mejorada */}
            <Card sx={{
                mb: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white !important',
                borderRadius: '24px',
                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)'
                },
                '& .MuiTypography-root': {
                    color: 'white !important'
                }
            }}>
                <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                    <AccountBalanceIcon sx={{ fontSize: 120, color: 'white !important' }} />
                </Box>
                <Box sx={{ p: 3, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                        <TrendingUpIcon sx={{ fontSize: 24, color: 'white !important' }} />
                        <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 'medium', color: 'white !important' }}>
                            Rentabilidad Total
                        </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, color: 'white !important' }}>
                        {formatearMoneda(metrics.rentabilidadGeneral?.rentabilidadTotal || 0)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <ShowChartIcon sx={{ fontSize: 16, color: 'white !important' }} />
                        <Typography variant="body2" sx={{ opacity: 0.9, color: 'white !important' }}>
                            {metrics.rentabilidadGeneral?.rentabilidadPorcentajeGeneral?.toFixed(1) || '0.0'}% del total
                        </Typography>
                    </Box>
                </Box>
            </Card>

            {/* Métricas clave mejoradas */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Card sx={{
                    flex: 1,
                    p: 2,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white !important',
                    borderRadius: '20px',
                    boxShadow: '0 6px 24px rgba(240, 147, 251, 0.4)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)'
                    },
                    '& .MuiTypography-root': {
                        color: 'white !important'
                    }
                }}>
                    <PeopleIcon sx={{ fontSize: 24, mb: 1, color: 'white !important' }} />
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white !important' }}>
                        {metrics.rentabilidadPorCliente?.length || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, color: 'white !important' }}>
                        Clientes
                    </Typography>
                </Card>
                <Card sx={{
                    flex: 1,
                    p: 2,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white !important',
                    borderRadius: '20px',
                    boxShadow: '0 6px 24px rgba(79, 172, 254, 0.4)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)'
                    },
                    '& .MuiTypography-root': {
                        color: 'white !important'
                    }
                }}>
                    <CampaignIcon sx={{ fontSize: 24, mb: 1, color: 'white !important' }} />
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white !important' }}>
                        {metrics.rentabilidadPorMedio?.length || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, color: 'white !important' }}>
                        Medios
                    </Typography>
                </Card>
            </Box>

            {/* Top Clientes Rentables mejorado */}
            {(metrics.rentabilidadPorCliente?.length || 0) > 0 && (
                <Card sx={{
                    p: 2,
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    color: 'white !important',
                    borderRadius: '24px',
                    boxShadow: '0 8px 32px rgba(67, 233, 123, 0.4)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)'
                    },
                    '& .MuiTypography-root': {
                        color: 'white !important'
                    }
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <EmojiEventsIcon sx={{ fontSize: 24, color: 'white !important' }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white !important' }}>
                            Top Clientes Rentables
                        </Typography>
                    </Box>
                    <Box sx={{ maxHeight: 280, overflow: 'auto' }}>
                        {metrics.rentabilidadPorCliente.slice(0, 5).map((cliente, index) => (
                            <Box key={cliente.id_cliente} sx={{
                                py: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                backgroundColor: 'rgba(255,255,255,0.15)',
                                borderRadius: '16px',
                                px: 2,
                                mb: 2,
                                transition: 'background-color 0.2s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.25)'
                                },
                                '& .MuiTypography-root': {
                                    color: 'white !important'
                                }
                            }}>
                                <Box sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    color: 'white !important'
                                }}>
                                    {index + 1}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'white !important' }}>
                                        {cliente.nombreCliente || cliente.nombre_cliente || 'Cliente sin nombre'}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'white !important' }}>
                                        {cliente.rentabilidad_porcentaje?.toFixed(1) || '0.0'}%
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, color: 'white !important' }}>
                                        {formatearMoneda(cliente.rentabilidad_total || 0)}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Card>
            )}
        </Box>
    );
};

const VistaPorClienteMobile = ({ clientes, mobilePage, setMobilePage, formatearMoneda }) => {
    console.log('VistaPorClienteMobile: Renderizando con clientes:', clientes);
    console.log('📄 Página actual:', mobilePage);
    
    const itemsPerPage = 10;
    const totalPages = Math.ceil((clientes?.length || 0) / itemsPerPage);
    const startIndex = (mobilePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentClientes = (clientes || []).slice(startIndex, endIndex);

    if (!clientes || clientes.length === 0) {
        return (
            <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'white' }}>
                    Rentabilidad por Cliente
                </Typography>
                <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        No hay datos de clientes disponibles
                    </Typography>
                </Card>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'white' }}>
                Rentabilidad por Cliente ({clientes.length} clientes)
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.8)' }}>
                Mostrando {startIndex + 1}-{Math.min(endIndex, clientes.length)} de {clientes.length}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {currentClientes.map((cliente, index) => {
                    const globalIndex = startIndex + index;
                    const gradients = [
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                    ];
                    const gradient = gradients[globalIndex % 4];

                    return (
                        <Card key={cliente.id_cliente} sx={{
                            background: gradient,
                            color: 'white',
                            borderRadius: '16px',
                            p: 2
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {cliente.nombreCliente || cliente.nombre_cliente || 'Cliente sin nombre'}
                                </Typography>
                                <Chip
                                    label={`${cliente.rentabilidad_porcentaje?.toFixed(1) || '0.0'}%`}
                                    sx={{
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}
                                />
                            </Box>
                            <Grid container spacing={1}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Inversión</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        {formatearMoneda(cliente.inversion_total || 0)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Comisiones</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        {formatearMoneda(cliente.comisiones_total || 0)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Bonificaciones</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        {formatearMoneda(cliente.bonificaciones_total || 0)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Categoría</Typography>
                                    <Chip
                                        label={cliente.categoria?.nombre || 'Sin categoría'}
                                        size="small"
                                        sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                    />
                                </Grid>
                            </Grid>
                        </Card>
                    );
                })}
            </Box>

            {totalPages > 1 && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                        count={totalPages}
                        page={mobilePage}
                        onChange={(event, value) => {
                            console.log('📄 Cambiando a página:', value);
                            setMobilePage(value);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        size="large"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                color: 'white',
                                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                                '&.Mui-selected': {
                                    backgroundColor: '#667eea',
                                    color: 'white',
                                    fontWeight: 'bold'
                                }
                            }
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

const VistaPorMedioMobile = ({ medios, mobilePage, setMobilePage, formatearMoneda }) => {
    console.log('📺 VistaPorMedioMobile: Renderizando con medios:', medios);
    console.log('📄 Página actual:', mobilePage);
    
    const itemsPerPage = 10;
    const totalPages = Math.ceil((medios?.length || 0) / itemsPerPage);
    const startIndex = (mobilePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentMedios = (medios || []).slice(startIndex, endIndex);

    if (!medios || medios.length === 0) {
        return (
            <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'white' }}>
                    📺 Rentabilidad por Medio
                </Typography>
                <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        No hay datos de medios disponibles
                    </Typography>
                </Card>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'white' }}>
                📺 Rentabilidad por Medio ({medios.length} medios)
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.8)' }}>
                Mostrando {startIndex + 1}-{Math.min(endIndex, medios.length)} de {medios.length}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {currentMedios.map((medio, index) => {
                    const globalIndex = startIndex + index;
                    const gradients = [
                        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                    ];
                    const gradient = gradients[globalIndex % 4];

                    return (
                        <Card key={medio.id} sx={{
                            background: gradient,
                            color: 'white',
                            borderRadius: '16px',
                            p: 2
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {medio.nombredelmedio || medio.nombre_medio || 'Medio sin nombre'}
                                </Typography>
                                <Chip
                                    label={`${medio.rentabilidad_porcentaje?.toFixed(1) || '0.0'}%`}
                                    sx={{
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}
                                />
                            </Box>
                            <Grid container spacing={1}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Inversión</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        {formatearMoneda(medio.inversion_total || 0)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Bonificaciones</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        {formatearMoneda(medio.bonificaciones_total || 0)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Markup</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        {formatearMoneda(medio.markup_total || 0)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Órdenes</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        {medio.numero_ordenes || medio.total_alternativas || 0}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Card>
                    );
                })}
            </Box>

            {totalPages > 1 && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                        count={totalPages}
                        page={mobilePage}
                        onChange={(event, value) => {
                            console.log('📄 Cambiando a página:', value);
                            setMobilePage(value);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        size="large"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                color: 'white',
                                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                                '&.Mui-selected': {
                                    backgroundColor: '#667eea',
                                    color: 'white',
                                    fontWeight: 'bold'
                                }
                            }
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

const ModalAnalisisDetalle = ({ analisis, onClose }) => (
    <div className="modal-analisis-detalle">
        <div className="modal-content">
            <div className="modal-header">
                <h2>Análisis Detallado de Rentabilidad</h2>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>

            <div className="modal-body">
                <div className="analisis-seccion">
                    <h3>Resumen de Rentabilidad</h3>
                    <div className="resumen-grid">
                        <div className="resumen-item">
                            <span className="label">Rentabilidad Total:</span>
                            <span className="valor">{analisis.rentabilidad.rentabilidadPorcentaje.toFixed(1)}%</span>
                        </div>
                        <div className="resumen-item">
                            <span className="label">Monto Total:</span>
                            <span className="valor">{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(analisis.rentabilidad.rentabilidadNeta)}</span>
                        </div>
                    </div>
                </div>

                <div className="analisis-seccion">
                    <h3>Análisis por Alternativa</h3>
                    {analisis.alternativas.map((alt, index) => (
                        <div key={index} className="alternativa-analisis">
                            <h4>Alternativa {index + 1}</h4>
                            <div className="alternativa-metricas">
                                <div className="metrica">
                                    <span>Rentabilidad:</span>
                                    <span>{alt.calculos.rentabilidadPorcentaje.toFixed(1)}%</span>
                                </div>
                                <div className="metrica">
                                    <span>Potencial Mejora:</span>
                                    <span>{alt.potencialMejora > 0 ? `+${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(alt.potencialMejora)}` : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {analisis.oportunidades.length > 0 && (
                    <div className="analisis-seccion">
                        <h3>Oportunidades Identificadas</h3>
                        {analisis.oportunidades.map((oportunidad, index) => (
                            <div key={index} className="oportunidad-detalle">
                                <h4>{oportunidad.tipo_oportunidad}</h4>
                                <p>{oportunidad.descripcion}</p>
                                <p><strong>Impacto:</strong> {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(oportunidad.impacto_estimado)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
);

export default RentabilidadDashboard;