/**
 * Componente CrearOrden con Rentabilidad Inteligente Integrada
 * Incorpora análisis de rentabilidad en tiempo real durante la creación de órdenes
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { safeFetchClientes } from '../../services/dataNormalization';
import { rentabilidadInteligenteService } from '../../services/rentabilidadInteligenteService';
import { errorHandlingService } from '../../services/errorHandlingService';
import { SweetAlertUtils } from '../../utils/sweetAlertUtils';
import './CrearOrdenConRentabilidad.css';

const CrearOrdenConRentabilidad = () => {
    const navigate = useNavigate();
    
    // Estados principales del formulario
    const [formData, setFormData] = useState({
        id_cliente: '',
        id_campania: '',
        id_plan: '',
        fecha_orden: new Date().toISOString().split('T')[0],
        fecha_ejecucion: new Date().toISOString().split('T')[0],
        observaciones: '',
        alternativas_seleccionadas: []
    });
    
    // Estados para datos relacionados
    const [clientes, setClientes] = useState([]);
    const [campanias, setCampanias] = useState([]);
    const [planes, setPlanes] = useState([]);
    const [alternativas, setAlternativas] = useState([]);
    
    // Estados para rentabilidad inteligente
    const [analisisRentabilidad, setAnalisisRentabilidad] = useState(null);
    const [oportunidadesDetectadas, setOportunidadesDetectadas] = useState([]);
    const [mostrarAnalisis, setMostrarAnalisis] = useState(false);
    const [rentabilidadEnTiempoReal, setRentabilidadEnTiempoReal] = useState({
        rentabilidadTotal: 0,
        rentabilidadPorcentaje: 0,
        comisiones: 0,
        bonificaciones: 0,
        markup: 0
    });
    
    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [loadingAnalisis, setLoadingAnalisis] = useState(false);
    const [step, setStep] = useState(1); // Step 1: Datos básicos, Step 2: Alternativas, Step 3: Rentabilidad
    
    // Carga inicial de datos
    useEffect(() => {
        cargarDatosIniciales();
    }, []);
    
    // Cargar campañas cuando se selecciona un cliente
    useEffect(() => {
        if (formData.id_cliente) {
            cargarCampaniasPorCliente(formData.id_cliente);
        } else {
            setCampanias([]);
            setPlanes([]);
            setAlternativas([]);
        }
    }, [formData.id_cliente]);
    
    // Cargar planes cuando se selecciona una campaña
    useEffect(() => {
        if (formData.id_campania) {
            cargarPlanesPorCampania(formData.id_campania);
        } else {
            setPlanes([]);
            setAlternativas([]);
        }
    }, [formData.id_campania]);
    
    // Cargar alternativas cuando se selecciona un plan
    useEffect(() => {
        if (formData.id_plan) {
            cargarAlternativasPorPlan(formData.id_plan);
        } else {
            setAlternativas([]);
        }
    }, [formData.id_plan]);
    
    // Análisis de rentabilidad en tiempo real
    useEffect(() => {
        if (formData.alternativas_seleccionadas.length > 0) {
            analizarRentabilidadEnTiempoReal();
        } else {
            setRentabilidadEnTiempoReal({
                rentabilidadTotal: 0,
                rentabilidadPorcentaje: 0,
                comisiones: 0,
                bonificaciones: 0,
                markup: 0
            });
        }
    }, [formData.alternativas_seleccionadas]);
    
    const cargarDatosIniciales = async () => {
        setLoading(true);
        try {
            // Paso 1: Intentar lecturas seguras sin asumir columnas específicas
            // Evita errores 400 por seleccionar columnas inexistentes (p.ej., RUT)
            let clientesData = null;
            let lastError = null;

            for (const tableName of ['clientes', 'Clientes']) {
                try {
                    const { data, error } = await supabase
                        .from(tableName)
                        .select('*');
                    if (!error && Array.isArray(data)) {
                        clientesData = data;
                        break;
                    } else {
                        lastError = error || new Error('Respuesta inválida');
                    }
                } catch (e) {
                    lastError = e;
                }
            }

            if (!clientesData) {
                throw lastError || new Error('No fue posible obtener clientes');
            }

            // Paso 2: Normalizar y filtrar en memoria para no depender de nombres exactos
            const normalizados = clientesData.map((c) => {
                const id = c.id_cliente ?? c.id ?? c.idCliente ?? null;
                const nombre =
                    c.nombrecliente ??
                    c.nombreCliente ??
                    c.nombreFantasia ??
                    c.nombrefantasia ??
                    c.razonSocial ??
                    c.razonsocial ??
                    '';
                const rut =
                    c.rut ??
                    c.RUT ??
                    c.rutempresa ??
                    c.rutEmpresa ??
                    '';
                // Interpretar 'estado' en distintos formatos
                const estadoVal = typeof c.estado === 'boolean'
                    ? c.estado
                    : (c.estado === 'true' || c.estado === 1 || c.estado === '1');

                return {
                    id_cliente: id,
                    nombrecliente: nombre,
                    RUT: rut,
                    estado: estadoVal !== false
                };
            })
            .filter((c) => c.id_cliente != null && c.estado !== false);

            // Ordenar por nombre si existe
            normalizados.sort((a, b) =>
                (a.nombrecliente || '').localeCompare(b.nombrecliente || '', 'es', { sensitivity: 'base' })
            );

            setClientes(normalizados);
        } catch (error) {
            errorHandlingService.handleError(error, 'cargarDatosIniciales');
            SweetAlertUtils.showError('Error', 'No se pudieron cargar los clientes');
        } finally {
            setLoading(false);
        }
    };
    
    const cargarCampaniasPorCliente = async (idCliente) => {
        try {
            // Selección segura sin asumir nombres exactos de columnas
            const { data: raw, error } = await supabase
                .from('campania')
                .select('*')
                .eq('id_Cliente', idCliente)
                .order('nombrecampania', { ascending: true });
            if (error) throw error;

            // Normalización mínima para mantener compatibilidad con UI
            const normalizadas = (raw || []).map(c => ({
                ...c,
                NombreCampania: c.NombreCampania ?? c.nombrecampania ?? c.nombreCampania ?? 'Sin nombre',
                Presupuesto: c.Presupuesto ?? c.presupuesto ?? 0,
                estado: typeof c.estado === 'boolean' ? c.estado : (c.estado === 'true' || c.estado === 1 || c.estado === '1')
            })).filter(c => c.estado !== false);

            setCampanias(normalizadas);
        } catch (error) {
            errorHandlingService.handleError(error, 'cargarCampaniasPorCliente');
            SweetAlertUtils.showError('Error', 'No se pudieron cargar las campañas');
        }
    };
    
    const cargarPlanesPorCampania = async (idCampania) => {
        try {
            // Alinear con otros flujos: filtrar por id_campania y estado2='aprobado'
            const { data: planesData, error: planesError } = await supabase
                .from('plan')
                .select(`
                    id,
                    nombre_plan,
                    presupuesto,
                    Anios (id, years),
                    Meses (Id, Nombre)
                `)
                .eq('id_campania', idCampania)
                .eq('estado2', 'aprobado')
                .order('nombre_plan', { ascending: true });

            if (planesError) throw planesError;
            setPlanes(planesData || []);
        } catch (error) {
            errorHandlingService.handleError(error, 'cargarPlanesPorCampania');
            SweetAlertUtils.showError('Error', 'No se pudieron cargar los planes');
        }
    };
    
    const cargarAlternativasPorPlan = async (idPlan) => {
        try {
            const { data: alternativasData, error: alternativasError } = await supabase
                .from('alternativa')
                .select(`
                    id,
                    descripcion,
                    costo,
                    duracion,
                    soporte:Soportes(
                        id_soporte,
                        nombreidentificador,
                        bonificacionano
                    ),
                    programa:Programas(
                        id,
                        nombre_programa,
                        costo
                    ),
                    contrato:Contratos(
                        id,
                        monto
                    )
                `)
                .in('id', (
                    await supabase
                        .from('plan_alternativas')
                        .select('id_alternativa')
                        .eq('id_plan', idPlan)
                ).data?.map(pa => pa.id_alternativa) || [])
                .eq('estado', true);
            
            if (alternativasError) throw alternativasError;
            setAlternativas(alternativasData || []);
            
        } catch (error) {
            errorHandlingService.handleError(error, 'cargarAlternativasPorPlan');
            SweetAlertUtils.showError('Error', 'No se pudieron cargar las alternativas');
        }
    };
    
    const analizarRentabilidadEnTiempoReal = async () => {
        try {
            const analisis = await Promise.all(
                formData.alternativas_seleccionadas.map(async (alternativaId) => {
                    const alternativa = alternativas.find(a => a.id === alternativaId);
                    if (!alternativa) return null;
                    
                    // Obtener configuración de comisiones del cliente
                    const configComision = await rentabilidadInteligenteService.obtenerConfiguracionComision(formData.id_cliente);
                    
                    // Obtener bonificaciones del medio
                    const bonificacionMedio = await rentabilidadInteligenteService.obtenerBonificacionMedio(alternativa.soporte?.id_soporte);
                    
                    // Calcular rentabilidad
                    const calculos = rentabilidadInteligenteService.calcularRentabilidadDetallada(
                        alternativa.costo || 0,
                        alternativa.costo || 0, // Precio informado (inicialmente igual al costo)
                        configComision,
                        bonificacionMedio
                    );
                    
                    return {
                        alternativa,
                        calculos
                    };
                })
            );
            
            const analisisValido = analisis.filter(a => a !== null);
            
            // Calcular totales
            const totales = analisisValido.reduce((acc, item) => ({
                inversionTotal: acc.inversionTotal + (item.calculos.precioInformado || 0),
                comisiones: acc.comisiones + (item.calculos.comisionMonto || 0),
                bonificaciones: acc.bonificaciones + (item.calculos.bonificacionMonto || 0),
                markup: acc.markup + (item.calculos.markupMonto || 0),
                rentabilidadTotal: acc.rentabilidadTotal + (item.calculos.rentabilidadNeta || 0)
            }), {
                inversionTotal: 0,
                comisiones: 0,
                bonificaciones: 0,
                markup: 0,
                rentabilidadTotal: 0
            });
            
            const rentabilidadPorcentaje = totales.inversionTotal > 0 
                ? (totales.rentabilidadTotal / totales.inversionTotal) * 100 
                : 0;
            
            setRentabilidadEnTiempoReal({
                ...totales,
                rentabilidadPorcentaje
            });
            
        } catch (error) {
            errorHandlingService.handleError(error, 'analizarRentabilidadEnTiempoReal');
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleAlternativaToggle = (alternativaId) => {
        setFormData(prev => ({
            ...prev,
            alternativas_seleccionadas: prev.alternativas_seleccionadas.includes(alternativaId)
                ? prev.alternativas_seleccionadas.filter(id => id !== alternativaId)
                : [...prev.alternativas_seleccionadas, alternativaId]
        }));
    };
    
    const analizarRentabilidadCompleta = async () => {
        if (formData.alternativas_seleccionadas.length === 0) {
            SweetAlertUtils.showWarning('Atención', 'Debes seleccionar al menos una alternativa para analizar la rentabilidad');
            return;
        }
        
        setLoadingAnalisis(true);
        try {
            // Crear objeto de orden simulado para análisis
            const ordenSimulada = {
                id_cliente: formData.id_cliente,
                id_campania: formData.id_campania,
                id_plan: formData.id_plan,
                monto_total: rentabilidadEnTiempoReal.inversionTotal,
                fecha_ejecucion: formData.fecha_ejecucion,
                alternativas: formData.alternativas_seleccionadas.map(id => ({
                    id,
                    ...alternativas.find(a => a.id === id)
                }))
            };
            
            const analisis = await rentabilidadInteligenteService.analizarRentabilidadOrden(ordenSimulada);
            setAnalisisRentabilidad(analisis);
            setOportunidadesDetectadas(analisis.oportunidades || []);
            setMostrarAnalisis(true);
            
            // Mostrar resumen con SweetAlert2
            await mostrarResumenRentabilidad(analisis);
            
        } catch (error) {
            errorHandlingService.handleError(error, 'analizarRentabilidadCompleta');
            SweetAlertUtils.showError('Error', 'No se pudo analizar la rentabilidad');
        } finally {
            setLoadingAnalisis(false);
        }
    };
    
    const mostrarResumenRentabilidad = async (analisis) => {
        const { rentabilidad, oportunidades } = analisis;
        
        let htmlContent = `
            <div class="rentabilidad-resumen-orden">
                <div class="metrica-principal-orden">
                    <h4>💰 Rentabilidad Estimada</h4>
                    <div class="valor-destacado-orden ${rentabilidad.rentabilidadPorcentaje >= 25 ? 'positivo' : 'negativo'}">
                        ${rentabilidad.rentabilidadPorcentaje.toFixed(1)}%
                    </div>
                    <div class="detalle-valor-orden">
                        ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(rentabilidad.rentabilidadNeta)}
                    </div>
                </div>
                
                <div class="desglose-fuentes">
                    <h5>Desglose de Ingresos:</h5>
                    <div class="fuente-ingreso">
                        <span>📊 Comisiones Cliente:</span>
                        <span>${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(rentabilidad.comisionesTotal)}</span>
                    </div>
                    <div class="fuente-ingreso">
                        <span>🎯 Bonificaciones Medios:</span>
                        <span>${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(rentabilidad.bonificacionesTotal)}</span>
                    </div>
                    <div class="fuente-ingreso">
                        <span>📈 Markup:</span>
                        <span>${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(rentabilidad.markupTotal)}</span>
                    </div>
                </div>
        `;
        
        if (oportunidades.length > 0) {
            htmlContent += `
                <div class="oportunidades-orden">
                    <h5>🚀 Oportunidades de Mejora (${oportunidades.length}):</h5>
                    ${oportunidades.slice(0, 3).map(opp => `
                        <div class="oportunidad-breve">
                            <strong>${opp.tipo_oportunidad}:</strong> ${opp.descripcion}
                            <br><small>Impacto potencial: ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(opp.impacto_estimado)}</small>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        htmlContent += '</div>';
        
        const resultado = await SweetAlertUtils.showCustom({
            title: '🤖 Análisis de Rentabilidad IA',
            html: htmlContent,
            showCancelButton: true,
            confirmButtonText: '💾 Guardar Orden',
            cancelButtonText: '🔄 Seguir Editando',
            customClass: {
                popup: 'rentabilidad-orden-popup'
            }
        });
        
        if (resultado.isConfirmed) {
            await guardarOrden();
        }
    };
    
    const guardarOrden = async () => {
        try {
            SweetAlertUtils.showLoading('Guardando orden...');
            
            // Verificar si ya existe una orden con estas alternativas para evitar duplicación
            const { data: ordenExistente } = await supabase
                .from('ordenesdepublicidad')
                .select('id_ordenes_de_comprar, numero_correlativo')
                .eq('id_cliente', formData.id_cliente)
                .eq('id_campania', formData.id_campania)
                .eq('id_plan', formData.id_plan)
                .contains('alternativas_plan_orden', JSON.stringify(formData.alternativas_seleccionadas))
                .in('estado', ['pendiente', 'aprobada', 'produccion'])
                .single();
            
            if (ordenExistente) {
                SweetAlertUtils.close();
                await SweetAlertUtils.showWarning(
                    'Orden Duplicada',
                    `Ya existe una orden (#${ordenExistente.numero_correlativo}) con las mismas alternativas seleccionadas.`
                );
                return;
            }
            
            // Generar número correlativo
            const { data: maxCorrelativo } = await supabase
                .from('ordenesdepublicidad')
                .select('numero_correlativo')
                .order('numero_correlativo', { ascending: false })
                .limit(1)
                .single();
            
            const nuevoCorrelativo = (maxCorrelativo?.numero_correlativo || 0) + 1;
            
            // Insertar orden
            const { data: ordenData, error: ordenError } = await supabase
                .from('ordenesdepublicidad')
                .insert({
                    numero_correlativo: nuevoCorrelativo,
                    id_cliente: formData.id_cliente,
                    id_campania: formData.id_campania,
                    id_plan: formData.id_plan,
                    alternativas_plan_orden: JSON.stringify(formData.alternativas_seleccionadas),
                    fecha_orden: formData.fecha_orden,
                    fecha_ejecucion: formData.fecha_ejecucion,
                    monto_total: rentabilidadEnTiempoReal.inversionTotal,
                    estado: 'pendiente',
                    observaciones: formData.observaciones,
                    // Marcar que esta orden fue creada con rentabilidad para evitar duplicación
                    creada_con_rentabilidad: true
                })
                .select()
                .single();
            
            if (ordenError) throw ordenError;
            
            // Guardar detalles financieros
            for (const alternativaId of formData.alternativas_seleccionadas) {
                const alternativa = alternativas.find(a => a.id === alternativaId);
                if (!alternativa) continue;
                
                const configComision = await rentabilidadInteligenteService.obtenerConfiguracionComision(formData.id_cliente);
                const bonificacionMedio = await rentabilidadInteligenteService.obtenerBonificacionMedio(alternativa.soporte?.id_soporte);
                const calculos = rentabilidadInteligenteService.calcularRentabilidadDetallada(
                    alternativa.costo || 0,
                    alternativa.costo || 0,
                    configComision,
                    bonificacionMedio
                );
                
                try {
                    await supabase.from('DetallesFinancierosOrden').insert({
                        id_orden: ordenData.id_ordenes_de_comprar,
                        id_alternativa: alternativaId,
                        costo_real_medio: calculos.costoReal,
                        precio_informado_cliente: calculos.precioInformado,
                        comision_cliente_porcentaje: calculos.comisionPorcentaje,
                        comision_cliente_monto: calculos.comisionMonto,
                        bonificacion_medio_porcentaje: calculos.bonificacionPorcentaje,
                        bonificacion_medio_monto: calculos.bonificacionMonto,
                        markup_porcentaje: calculos.markupPorcentaje,
                        markup_monto: calculos.markupMonto,
                        rentabilidad_neta: calculos.rentabilidadNeta,
                        rentabilidad_porcentaje: calculos.rentabilidadPorcentaje
                    });
                } catch (e) {
                    console.warn('DetallesFinancierosOrden no disponible o sin permisos:', e?.message || e);
                }
            }
            
            // Guardar oportunidades detectadas
            for (const oportunidad of oportunidadesDetectadas) {
                await rentabilidadInteligenteService.guardarOportunidad({
                    ...oportunidad,
                    id_orden: ordenData.id_ordenes_de_comprar
                });
            }
            
            SweetAlertUtils.close();
            
            await SweetAlertUtils.showSuccess(
                '✅ Orden Creada',
                `Orden #${nuevoCorrelativo} creada exitosamente con análisis de rentabilidad.\nRentabilidad estimada: ${rentabilidadEnTiempoReal.rentabilidadPorcentaje.toFixed(1)}%`
            );
            
            navigate('/ordenes');
            
        } catch (error) {
            errorHandlingService.handleError(error, 'guardarOrden');
            SweetAlertUtils.showError('Error', 'No se pudo guardar la orden');
        }
    };
    
    const siguienteStep = () => {
        if (step === 1 && !formData.id_cliente) {
            SweetAlertUtils.showWarning('Atención', 'Debes seleccionar un cliente para continuar');
            return;
        }
        if (step === 2 && formData.alternativas_seleccionadas.length === 0) {
            SweetAlertUtils.showWarning('Atención', 'Debes seleccionar al menos una alternativa para continuar');
            return;
        }
        setStep(step + 1);
    };
    
    const anteriorStep = () => {
        setStep(step - 1);
    };
    
    if (loading) {
        return (
            <div className="crear-orden-rentabilidad loading">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando datos...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="crear-orden-rentabilidad">
            <div className="header-orden">
                <h1>🧠 Crear Orden con Rentabilidad Inteligente</h1>
                <p>Análisis de rentabilidad en tiempo real durante la creación de órdenes</p>
            </div>
            
            {/* Indicador de Steps */}
            <div className="steps-indicator">
                <div className={`step ${step === 1 ? 'activo' : step > 1 ? 'completado' : ''}`}>
                    <div className="step-number">1</div>
                    <div className="step-label">Datos Básicos</div>
                </div>
                <div className={`step ${step === 2 ? 'activo' : step > 2 ? 'completado' : ''}`}>
                    <div className="step-number">2</div>
                    <div className="step-label">Alternativas</div>
                </div>
                <div className={`step ${step === 3 ? 'activo' : ''}`}>
                    <div className="step-number">3</div>
                    <div className="step-label">Rentabilidad</div>
                </div>
            </div>
            
            {/* Panel de Rentabilidad en Tiempo Real */}
            {formData.alternativas_seleccionadas.length > 0 && (
                <div className="rentabilidad-panel">
                    <h3>📊 Rentabilidad en Tiempo Real</h3>
                    <div className="rentabilidad-metricas">
                        <div className="metrica-rt">
                            <span className="label">Rentabilidad:</span>
                            <span className={`valor ${rentabilidadEnTiempoReal.rentabilidadPorcentaje >= 25 ? 'positivo' : 'negativo'}`}>
                                {rentabilidadEnTiempoReal.rentabilidadPorcentaje.toFixed(1)}%
                            </span>
                        </div>
                        <div className="metrica-rt">
                            <span className="label">Comisiones:</span>
                            <span className="valor">{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(rentabilidadEnTiempoReal.comisiones)}</span>
                        </div>
                        <div className="metrica-rt">
                            <span className="label">Bonificaciones:</span>
                            <span className="valor">{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(rentabilidadEnTiempoReal.bonificaciones)}</span>
                        </div>
                        <div className="metrica-rt">
                            <span className="label">Markup:</span>
                            <span className="valor">{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(rentabilidadEnTiempoReal.markup)}</span>
                        </div>
                        <div className="metrica-rt total">
                            <span className="label">Total Rentabilidad:</span>
                            <span className="valor">{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(rentabilidadEnTiempoReal.rentabilidadTotal)}</span>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="form-container">
                {/* Step 1: Datos Básicos */}
                {step === 1 && (
                    <div className="step-content">
                        <h2>📋 Datos Básicos de la Orden</h2>
                        
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Cliente *</label>
                                <select
                                    name="id_cliente"
                                    value={formData.id_cliente}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    required
                                >
                                    <option value="">Seleccionar cliente...</option>
                                    {clientes.map(cliente => (
                                        <option key={cliente.id_cliente} value={cliente.id_cliente}>
                                            {cliente.nombrecliente}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Campaña *</label>
                                <select
                                    name="id_campania"
                                    value={formData.id_campania}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    required
                                    disabled={!formData.id_cliente}
                                >
                                    <option value="">Seleccionar campaña...</option>
                                    {campanias.map(campania => (
                                        <option key={campania.id_campania} value={campania.id_campania}>
                                            {campania.NombreCampania} - Presupuesto: ${new Intl.NumberFormat('es-CL').format(campania.Presupuesto || 0)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Plan *</label>
                                <select
                                    name="id_plan"
                                    value={formData.id_plan}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    required
                                    disabled={!formData.id_campania}
                                >
                                    <option value="">Seleccionar plan...</option>
                                    {planes.map(plan => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.nombre_plan} - Presupuesto: ${new Intl.NumberFormat('es-CL').format(plan.presupuesto || 0)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Fecha Orden</label>
                                <input
                                    type="date"
                                    name="fecha_orden"
                                    value={formData.fecha_orden}
                                    onChange={handleInputChange}
                                    className="form-control"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Fecha Ejecución</label>
                                <input
                                    type="date"
                                    name="fecha_ejecucion"
                                    value={formData.fecha_ejecucion}
                                    onChange={handleInputChange}
                                    className="form-control"
                                />
                            </div>
                            
                            <div className="form-group full-width">
                                <label>Observaciones</label>
                                <textarea
                                    name="observaciones"
                                    value={formData.observaciones}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    rows="3"
                                    placeholder="Observaciones adicionales sobre la orden..."
                                />
                            </div>
                        </div>
                        
                        <div className="step-actions">
                            <button 
                                type="button" 
                                onClick={siguienteStep}
                                className="btn btn-primary"
                                disabled={!formData.id_cliente || !formData.id_campania || !formData.id_plan}
                            >
                                Siguiente: Alternativas →
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Step 2: Alternativas */}
                {step === 2 && (
                    <div className="step-content">
                        <h2>📺 Selección de Alternativas</h2>
                        
                        {alternativas.length === 0 ? (
                            <div className="no-alternativas">
                                <p>No hay alternativas disponibles para este plan.</p>
                            </div>
                        ) : (
                            <div className="alternativas-grid">
                                {alternativas.map(alternativa => (
                                    <div 
                                        key={alternativa.id} 
                                        className={`alternativa-card ${formData.alternativas_seleccionadas.includes(alternativa.id) ? 'seleccionada' : ''}`}
                                        onClick={() => handleAlternativaToggle(alternativa.id)}
                                    >
                                        <div className="alternativa-header">
                                            <h4>{alternativa.descripcion || 'Sin descripción'}</h4>
                                            <div className="check-icon">
                                                {formData.alternativas_seleccionadas.includes(alternativa.id) && '✓'}
                                            </div>
                                        </div>
                                        
                                        <div className="alternativa-detalles">
                                            <div className="detalle">
                                                <span>Soporte:</span>
                                                <span>{alternativa.soporte?.nombreidentificador || 'N/A'}</span>
                                            </div>
                                            <div className="detalle">
                                                <span>Programa:</span>
                                                <span>{alternativa.programa?.nombre_programa || 'N/A'}</span>
                                            </div>
                                            <div className="detalle">
                                                <span>Costo:</span>
                                                <span>{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(alternativa.costo || 0)}</span>
                                            </div>
                                            <div className="detalle">
                                                <span>Duración:</span>
                                                <span>{alternativa.duracion || 'N/A'} segs</span>
                                            </div>
                                            {alternativa.soporte?.bonificacionano > 0 && (
                                                <div className="detalle bonificacion">
                                                    <span>Bonificación:</span>
                                                    <span>{alternativa.soporte.bonificacionano}%</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="step-actions">
                            <button type="button" onClick={anteriorStep} className="btn btn-secondary">
                                ← Anterior
                            </button>
                            <button 
                                type="button" 
                                onClick={siguienteStep}
                                className="btn btn-primary"
                                disabled={formData.alternativas_seleccionadas.length === 0}
                            >
                                Siguiente: Rentabilidad →
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Step 3: Rentabilidad */}
                {step === 3 && (
                    <div className="step-content">
                        <h2>🧠 Análisis de Rentabilidad Inteligente</h2>
                        
                        <div className="rentabilidad-analisis">
                            <div className="analisis-header">
                                <h3>Resumen de Rentabilidad Estimada</h3>
                                <button 
                                    onClick={analizarRentabilidadCompleta}
                                    disabled={loadingAnalisis}
                                    className="btn btn-analisis"
                                >
                                    {loadingAnalisis ? '⏳ Analizando...' : '🤖 Análisis Completo con IA'}
                                </button>
                            </div>
                            
                            <div className="rentabilidad-resumen">
                                <div className="resumen-card principal">
                                    <h4>Rentabilidad Total</h4>
                                    <div className={`valor-grande ${rentabilidadEnTiempoReal.rentabilidadPorcentaje >= 25 ? 'positivo' : 'negativo'}`}>
                                        {rentabilidadEnTiempoReal.rentabilidadPorcentaje.toFixed(1)}%
                                    </div>
                                    <div className="valor-detalle">
                                        {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(rentabilidadEnTiempoReal.rentabilidadTotal)}
                                    </div>
                                </div>
                                
                                <div className="resumen-grid">
                                    <div className="resumen-card">
                                        <h4>Comisiones</h4>
                                        <div className="valor">
                                            {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(rentabilidadEnTiempoReal.comisiones)}
                                        </div>
                                    </div>
                                    
                                    <div className="resumen-card">
                                        <h4>Bonificaciones</h4>
                                        <div className="valor">
                                            {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(rentabilidadEnTiempoReal.bonificaciones)}
                                        </div>
                                    </div>
                                    
                                    <div className="resumen-card">
                                        <h4>Markup</h4>
                                        <div className="valor">
                                            {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(rentabilidadEnTiempoReal.markup)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {oportunidadesDetectadas.length > 0 && (
                                <div className="oportunidades-section">
                                    <h4>🚀 Oportunidades Detectadas por IA</h4>
                                    <div className="oportunidades-lista">
                                        {oportunidadesDetectadas.slice(0, 5).map((oportunidad, index) => (
                                            <div key={index} className={`oportunidad-item ${oportunidad.prioridad}`}>
                                                <div className="oportunidad-header">
                                                    <strong>{oportunidad.tipo_oportunidad}</strong>
                                                    <span className="impacto">
                                                        {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(oportunidad.impacto_estimado)}
                                                    </span>
                                                </div>
                                                <p>{oportunidad.descripcion}</p>
                                                <div className="oportunidad-meta">
                                                    <span>Probabilidad: {oportunidad.probabilidad_exito}%</span>
                                                    <span>Confianza IA: {oportunidad.confianza_ia}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="step-actions">
                            <button type="button" onClick={anteriorStep} className="btn btn-secondary">
                                ← Anterior
                            </button>
                            <button 
                                type="button" 
                                onClick={guardarOrden}
                                className="btn btn-success btn-large"
                                disabled={formData.alternativas_seleccionadas.length === 0}
                            >
                                💾 Guardar Orden con Análisis de Rentabilidad
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CrearOrdenConRentabilidad;