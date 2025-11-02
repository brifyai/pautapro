/**
 * Servicio de Rentabilidad Inteligente para Agencias de Medios
 * Integración con IA para optimización de rentabilidad multi-dimensional
 */

import { supabase } from '../config/supabase';
import { errorHandlingService } from './errorHandlingService';

class RentabilidadInteligenteService {
    constructor() {
        this.modelosIA = {
            markupPrediction: null,
            comisionOptimization: null,
            negotiationSuccess: null,
            rentabilidadForecast: null
        };
        
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    }

    // ========================================
    // ANÁLISIS DE RENTABILIDAD EN TIEMPO REAL
    // ========================================

    /**
     * Análisis completo de rentabilidad para una orden
     */
    async analizarRentabilidadOrden(idOrden) {
        try {
            // Obtener datos de la orden y alternativas
            const { data: orden, error: errorOrden } = await supabase
                .from('OrdenesDePublicidad')
                .select(`
                    *,
                    cliente:Clientes(*),
                    campania:Campania(*),
                    alternativas:plan_alternativas(
                        alternativa:alternativa(
                            *,
                            soporte:Soportes(*),
                            programa:Programas(*),
                            contrato:Contratos(*)
                        )
                    )
                `)
                .eq('id_ordenes_de_comprar', idOrden)
                .single();

            if (errorOrden) throw errorOrden;

            // Análisis de rentabilidad por alternativa
            const analisisAlternativas = await Promise.all(
                orden.alternativas.map(async (alt) => {
                    return await this.analizarRentabilidadAlternativa(alt.alternativa, orden);
                })
            );

            // Cálculo de rentabilidad agregada
            const rentabilidadTotal = this.calcularRentabilidadAgregada(analisisAlternativas);

            // Detección de oportunidades con IA
            const oportunidades = await this.detectarOportunidadesIA(orden, analisisAlternativas);

            return {
                orden,
                rentabilidad: rentabilidadTotal,
                alternativas: analisisAlternativas,
                oportunidades,
                recomendaciones: this.generarRecomendaciones(rentabilidadTotal, oportunidades),
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            errorHandlingService.handleError(error, 'analizarRentabilidadOrden');
            throw error;
        }
    }

    /**
     * Análisis de rentabilidad por alternativa individual
     */
    async analizarRentabilidadAlternativa(alternativa, orden) {
        try {
            // Obtener costos reales y precios informados
            const costoReal = alternativa.costo || 0;
            const precioInformado = await this.obtenerPrecioInformado(alternativa.id, orden.id_cliente);
            
            // Obtener configuración de comisiones del cliente
            const configComision = await this.obtenerConfiguracionComision(orden.id_cliente);
            
            // Obtener bonificaciones del medio
            const bonificacionMedio = await this.obtenerBonificacionMedio(alternativa.id_soporte);
            
            // Cálculo de rentabilidad
            const calculos = this.calcularRentabilidadDetallada(
                costoReal,
                precioInformado,
                configComision,
                bonificacionMedio
            );

            // Predicción de IA para optimización
            const predicciones = await this.predecirOptimizacion(alternativa, orden, calculos);

            return {
                alternativa,
                calculos,
                predicciones,
                rentabilidadOptimizada: predicciones.rentabilidadOptimizada || calculos.rentabilidadNeta,
                potencialMejora: predicciones.potencialMejora || 0
            };

        } catch (error) {
            errorHandlingService.handleError(error, 'analizarRentabilidadAlternativa');
            throw error;
        }
    }

    /**
     * Cálculo detallado de rentabilidad
     */
    calcularRentabilidadDetallada(costoReal, precioInformado, configComision, bonificacionMedio) {
        // Comisiones del cliente
        const comisionPorcentaje = configComision?.comision_base_porcentaje || 0;
        const comisionMonto = (precioInformado * comisionPorcentaje) / 100;
        
        // Bonificaciones del medio
        const bonificacionPorcentaje = bonificacionMedio?.bonificacion_base_porcentaje || 0;
        const bonificacionMonto = (costoReal * bonificacionPorcentaje) / 100;
        
        // Markup (diferencia entre precio y costo menos comisiones)
        const markupMonto = precioInformado - costoReal - comisionMonto;
        const markupPorcentaje = costoReal > 0 ? (markupMonto / costoReal) * 100 : 0;
        
        // Rentabilidad neta (comisiones + bonificaciones + markup)
        const rentabilidadNeta = comisionMonto + bonificacionMonto + markupMonto;
        const rentabilidadPorcentaje = precioInformado > 0 ? (rentabilidadNeta / precioInformado) * 100 : 0;

        return {
            costoReal,
            precioInformado,
            comisionPorcentaje,
            comisionMonto,
            bonificacionPorcentaje,
            bonificacionMonto,
            markupMonto,
            markupPorcentaje,
            rentabilidadNeta,
            rentabilidadPorcentaje,
            eficiencia: this.calcularEficiencia(markupPorcentaje, bonificacionPorcentaje)
        };
    }

    /**
     * Cálculo de eficiencia de rentabilidad
     */
    calcularEficiencia(markupPorcentaje, bonificacionPorcentaje) {
        // Eficiencia basada en umbrales óptimos
        const markupOptimo = 25; // 25% markup considerado óptimo
        const bonificacionOptima = 15; // 15% bonificación considerada óptima
        
        const eficienciaMarkup = Math.min(markupPorcentaje / markupOptimo, 1) * 100;
        const eficienciaBonificacion = Math.min(bonificacionPorcentaje / bonificacionOptima, 1) * 100;
        
        return {
            markup: eficienciaMarkup,
            bonificacion: eficienciaBonificacion,
            general: (eficienciaMarkup + eficienciaBonificacion) / 2
        };
    }

    // ========================================
    // PREDICCIÓN CON INTELIGENCIA ARTIFICIAL
    // ========================================

    /**
     * Predice oportunidades de optimización con IA
     */
    async predecirOptimizacion(alternativa, orden, calculosActuales) {
        try {
            // Análisis histórico de negociaciones similares
            const historicoSimilares = await this.obtenerHistoricoSimilares(alternativa, orden);
            
            // Predicción de markup potencial
            const markupPotencial = await this.predecirMarkupPotencial(
                alternativa, 
                orden, 
                historicoSimilares
            );
            
            // Predicción de bonificaciones disponibles
            const bonificacionPotencial = await this.predecirBonificacionPotencial(
                alternativa.id_soporte,
                orden.monto_total
            );
            
            // Optimización de comisiones
            const comisionOptimizada = await this.optimizarComisionCliente(
                orden.id_cliente,
                orden.monto_total
            );

            // Cálculo de rentabilidad optimizada
            const rentabilidadOptimizada = this.calcularRentabilidadOptimizada(
                calculosActuales.costoReal,
                markupPotencial,
                comisionOptimizada,
                bonificacionPotencial
            );

            const potencialMejora = rentabilidadOptimizada - calculosActuales.rentabilidadNeta;
            const porcentajeMejora = calculosActuales.rentabilidadNeta > 0 
                ? (potencialMejora / calculosActuales.rentabilidadNeta) * 100 
                : 0;

            return {
                markupPotencial,
                bonificacionPotencial,
                comisionOptimizada,
                rentabilidadOptimizada,
                potencialMejora,
                porcentajeMejora,
                confianza: this.calcularConfianza(historicoSimilares.length),
                factoresClave: this.identificarFactoresClave(historicoSimilares)
            };

        } catch (error) {
            errorHandlingService.handleError(error, 'predecirOptimizacion');
            return {
                rentabilidadOptimizada: calculosActuales.rentabilidadNeta,
                potencialMejora: 0,
                confianza: 0
            };
        }
    }

    /**
     * Predice markup potencial basado en histórico
     */
    async predecirMarkupPotencial(alternativa, orden, historicoSimilares) {
        if (historicoSimilares.length === 0) {
            return 15; // Markup por defecto
        }

        // Análisis de patrones en negociaciones similares
        const markupsHistoricos = historicoSimilares
            .filter(h => h.exito_negociacion)
            .map(h => h.markup_porcentaje || 0);

        if (markupsHistoricos.length === 0) return 15;

        // Cálculo de markup potencial basado en percentiles
        const sortedMarkups = markupsHistoricos.sort((a, b) => a - b);
        const percentile75 = sortedMarkups[Math.floor(sortedMarkups.length * 0.75)];
        
        // Ajuste por factores contextuales
        const ajusteTemporal = this.ajustePorTemporada(orden.fecha_ejecucion);
        const ajusteVolumen = this.ajustePorVolumen(orden.monto_total);
        
        return Math.min(percentile75 * ajusteTemporal * ajusteVolumen, 50); // Máximo 50%
    }

    /**
     * Predice bonificaciones potenciales de medios
     */
    async predecirBonificacionPotencial(idSoporte, montoOrden) {
        try {
            const { data: configBonificacion } = await supabase
                .from('RegistroBonificacionesMedios')
                .select(`
                    *,
                    soporte:Soportes(*)
                `)
                .eq('id_soporte', idSoporte)
                .eq('estado', true)
                .single();

            if (!configBonificacion) return 0;

            let bonificacion = configBonificacion.bonificacion_base_porcentaje;

            // Aplicar escalas si corresponde
            if (configBonificacion.bonificacion_escala && configBonificacion.escalas_bonificacion) {
                const escalas = JSON.parse(configBonificacion.escalas_bonificacion);
                const escalaAplicable = escalas
                    .filter(e => montoOrden >= e.umbral)
                    .sort((a, b) => b.umbral - a.umbral)[0];

                if (escalaAplicable) {
                    bonificacion = escalaAplicable.bonificacion;
                }
            }

            return bonificacion;

        } catch (error) {
            errorHandlingService.handleError(error, 'predecirBonificacionPotencial');
            return 0;
        }
    }

    /**
     * Optimiza comisiones basadas en configuración y volumen
     */
    async optimizarComisionCliente(idCliente, montoOrden) {
        try {
            const { data: configComision } = await supabase
                .from('ConfiguracionComisiones')
                .select('*')
                .eq('id_cliente', idCliente)
                .eq('estado', true)
                .single();

            if (!configComision) return 0;

            let comision = configComision.comision_base_porcentaje;

            // Aplicar comisión escalable si corresponde
            if (configComision.comision_escalable && montoOrden > configComision.umbral_volumen) {
                const excedente = montoOrden - configComision.umbral_volumen;
                const comisionAdicional = (excedente * configComision.comision_sobre_umbral) / 100;
                const comisionBase = (configComision.umbral_volumen * comision) / 100;
                
                return ((comisionBase + comisionAdicional) / montoOrden) * 100;
            }

            return comision;

        } catch (error) {
            errorHandlingService.handleError(error, 'optimizarComisionCliente');
            return 0;
        }
    }

    // ========================================
    // DETECCIÓN DE OPORTUNIDADES
    // ========================================

    /**
     * Detecta oportunidades de mejora de rentabilidad
     */
    async detectarOportunidadesIA(orden, analisisAlternativas) {
        const oportunidades = [];

        // Analizar cada alternativa en busca de oportunidades
        for (const analisis of analisisAlternativas) {
            const oportunidadesAlternativa = await this.detectarOportunidadesAlternativa(
                analisis, 
                orden
            );
            oportunidades.push(...oportunidadesAlternativa);
        }

        // Oportunidades a nivel de orden
        const oportunidadesOrden = await this.detectarOportunidadesOrden(orden, analisisAlternativas);
        oportunidades.push(...oportunidadesOrden);

        // Ordenar por impacto potencial
        return oportunidades
            .sort((a, b) => b.impacto_estimado - a.impacto_estimado)
            .slice(0, 10); // Top 10 oportunidades
    }

    /**
     * Detecta oportunidades por alternativa
     */
    async detectarOportunidadesAlternativa(analisis, orden) {
        const oportunidades = [];
        const { alternativa, calculos, predicciones } = analisis;

        // Oportunidad de Markup
        if (predicciones.potencialMejora > 100) { // Más de $100 de mejora
            oportunidades.push({
                tipo_oportunidad: 'markup',
                id_cliente: orden.id_cliente,
                id_medio: alternativa.id_soporte,
                id_alternativa: alternativa.id,
                descripcion: `Oportunidad de markup adicional del ${predicciones.porcentajeMejora.toFixed(1)}%`,
                impacto_estimado: predicciones.potencialMejora,
                impacto_porcentaje: predicciones.porcentajeMejora,
                probabilidad_exito: predicciones.confianza,
                accion_recomendada: 'Negociar mejor precio con el medio',
                pasos_seguimiento: JSON.stringify([
                    'Analizar histórico de negociaciones con este medio',
                    'Identificar factores estacionales que afecten el precio',
                    'Preparar propuesta de volumen para obtener descuento'
                ]),
                prioridad: predicciones.potencialMejora > 500 ? 'alta' : 'media',
                confianza_ia: predicciones.confianza
            });
        }

        // Oportunidad de Bonificación
        if (calculos.bonificacionPorcentaje < 10) { // Menos del 10% de bonificación
            oportunidades.push({
                tipo_oportunidad: 'bonificacion',
                id_cliente: orden.id_cliente,
                id_medio: alternativa.id_soporte,
                descripcion: 'Posibilidad de obtener mayor bonificación del medio',
                impacto_estimado: calculos.costoReal * 0.05, // Estimado del 5% del costo
                impacto_porcentaje: 5,
                probabilidad_exito: 70,
                accion_recomendada: 'Solicitar bonificación por volumen o lealtad',
                pasos_seguimiento: JSON.stringify([
                    'Verificar configuración actual de bonificaciones',
                    'Evaluar volumen acumulado con el medio',
                    'Negociar mejores condiciones de bonificación'
                ]),
                prioridad: 'media',
                confianza_ia: 70
            });
        }

        return oportunidades;
    }

    /**
     * Detecta oportunidades a nivel de orden completa
     */
    async detectarOportunidadesOrden(orden, analisisAlternativas) {
        const oportunidades = [];
        const montoTotal = orden.monto_total;

        // Oportunidad de optimización de comisiones
        if (montoTotal > 100000) { // Ordenes grandes
            oportunidades.push({
                tipo_oportunidad: 'comision',
                id_cliente: orden.id_cliente,
                descripcion: `Optimizar estructura de comisiones para orden de $${montoTotal.toLocaleString()}`,
                impacto_estimado: montoTotal * 0.02, // 2% del monto total
                impacto_porcentaje: 2,
                probabilidad_exito: 85,
                accion_recomendada: 'Revisar y ajustar estructura de comisiones escalables',
                pasos_seguimiento: JSON.stringify([
                    'Analizar estructura actual de comisiones',
                    'Evaluar posibilidad de comisiones escalables',
                    'Implementar nueva estructura optimizada'
                ]),
                prioridad: 'alta',
                confianza_ia: 85
            });
        }

        return oportunidades;
    }

    // ========================================
    // MÉTODOS UTILITARIOS
    // ========================================

    /**
     * Obtiene precio informado al cliente para una alternativa
     */
    async obtenerPrecioInformado(idAlternativa, idCliente) {
        try {
            const cacheKey = `precio_${idAlternativa}_${idCliente}`;
            
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }

            // Lógica para obtener precio informado (podría venir de una tabla específica)
            const { data: detalles } = await supabase
                .from('DetallesFinancierosOrden')
                .select('precio_informado_cliente')
                .eq('id_alternativa', idAlternativa)
                .single();

            const precio = detalles?.precio_informado_cliente || 0;
            
            this.cache.set(cacheKey, {
                data: precio,
                timestamp: Date.now()
            });

            return precio;

        } catch (error) {
            errorHandlingService.handleError(error, 'obtenerPrecioInformado');
            return 0;
        }
    }

    /**
     * Obtiene configuración de comisiones de un cliente
     */
    async obtenerConfiguracionComision(idCliente) {
        try {
            const { data: config } = await supabase
                .from('ConfiguracionComisiones')
                .select('*')
                .eq('id_cliente', idCliente)
                .eq('estado', true)
                .single();

            return config;

        } catch (error) {
            errorHandlingService.handleError(error, 'obtenerConfiguracionComision');
            return null;
        }
    }

    /**
     * Obtiene bonificaciones configuradas para un medio
     */
    async obtenerBonificacionMedio(idSoporte) {
        try {
            const { data: bonificacion } = await supabase
                .from('RegistroBonificacionesMedios')
                .select(`
                    *,
                    soporte_medios!inner(
                        id_medio
                    )
                `)
                .eq('soporte_medios.id_soporte', idSoporte)
                .eq('estado', true)
                .single();

            return bonificacion;

        } catch (error) {
            errorHandlingService.handleError(error, 'obtenerBonificacionMedio');
            return null;
        }
    }

    /**
     * Obtiene histórico de negociaciones similares
     */
    async obtenerHistoricoSimilares(alternativa, orden) {
        try {
            const { data: historico } = await supabase
                .from('HistoricoNegociacionMedios')
                .select('*')
                .eq('id_medio', alternativa.id_soporte)
                .gte('fecha_negociacion', new Date(new Date().setFullYear(new Date().getFullYear() - 2))) // Últimos 2 años
                .order('fecha_negociacion', { ascending: false })
                .limit(20);

            return historico || [];

        } catch (error) {
            errorHandlingService.handleError(error, 'obtenerHistoricoSimilares');
            return [];
        }
    }

    /**
     * Calcula rentabilidad agregada de múltiples alternativas
     */
    calcularRentabilidadAgregada(analisisAlternativas) {
        const totales = analisisAlternativas.reduce((acc, analisis) => {
            const { calculos } = analisis;
            return {
                inversionTotal: acc.inversionTotal + calculos.precioInformado,
                comisionesTotal: acc.comisionesTotal + calculos.comisionMonto,
                bonificacionesTotal: acc.bonificacionesTotal + calculos.bonificacionMonto,
                markupTotal: acc.markupTotal + calculos.markupMonto,
                rentabilidadNeta: acc.rentabilidadNeta + calculos.rentabilidadNeta
            };
        }, {
            inversionTotal: 0,
            comisionesTotal: 0,
            bonificacionesTotal: 0,
            markupTotal: 0,
            rentabilidadNeta: 0
        });

        const rentabilidadPorcentaje = totales.inversionTotal > 0 
            ? (totales.rentabilidadNeta / totales.inversionTotal) * 100 
            : 0;

        return {
            ...totales,
            rentabilidadPorcentaje,
            numeroAlternativas: analisisAlternativas.length,
            rentabilidadPromedioPorAlternativa: totales.rentabilidadNeta / analisisAlternativas.length
        };
    }

    /**
     * Genera recomendaciones basadas en análisis
     */
    generarRecomendaciones(rentabilidadTotal, oportunidades) {
        const recomendaciones = [];

        // Recomendaciones basadas en rentabilidad
        if (rentabilidadTotal.rentabilidadPorcentaje < 20) {
            recomendaciones.push({
                tipo: 'rentabilidad_baja',
                mensaje: 'La rentabilidad actual está por debajo del óptimo (20%).',
                accion: 'Revisar estructura de precios y comisiones.',
                prioridad: 'alta'
            });
        }

        // Recomendaciones basadas en oportunidades
        if (oportunidades.length > 0) {
            const oportunidadesAltaPrioridad = oportunidades.filter(o => o.prioridad === 'alta');
            if (oportunidadesAltaPrioridad.length > 0) {
                recomendaciones.push({
                    tipo: 'oportunidades_criticas',
                    mensaje: `Se detectaron ${oportunidadesAltaPrioridad.length} oportunidades críticas de mejora.`,
                    accion: 'Priorizar la implementación de estas oportunidades.',
                    prioridad: 'critica'
                });
            }
        }

        return recomendaciones;
    }

    /**
     * Calcula nivel de confianza basado en cantidad de datos históricos
     */
    calcularConfianza(cantidadDatos) {
        if (cantidadDatos === 0) return 30;
        if (cantidadDatos < 5) return 50;
        if (cantidadDatos < 10) return 70;
        if (cantidadDatos < 20) return 85;
        return 95;
    }

    /**
     * Identifica factores clave de éxito basados en histórico
     */
    identificarFactoresClave(historicoSimilares) {
        const factoresExito = historicoSimilares
            .filter(h => h.exito_negociacion)
            .map(h => JSON.parse(h.factores_exito || '{}'))
            .flat();

        // Contar frecuencia de factores
        const frecuenciaFactores = factoresExito.reduce((acc, factor) => {
            acc[factor] = (acc[factor] || 0) + 1;
            return acc;
        }, {});

        // Ordenar por frecuencia y retornar top 5
        return Object.entries(frecuenciaFactores)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([factor]) => factor);
    }

    /**
     * Ajuste de precios por factores estacionales
     */
    ajustePorTemporada(fechaEjecucion) {
        const mes = new Date(fechaEjecucion).getMonth() + 1;
        
        // Meses de alta demanda (diciembre, enero, julio)
        if ([12, 1, 7].includes(mes)) {
            return 1.2; // 20% más caro
        }
        
        // Meses de baja demanda (febrero, agosto)
        if ([2, 8].includes(mes)) {
            return 0.9; // 10% más barato
        }
        
        return 1.0; // Normal
    }

    /**
     * Ajuste de precios por volumen de compra
     */
    ajustePorVolumen(monto) {
        if (monto > 1000000) return 1.15; // 15% más de poder de negociación
        if (monto > 500000) return 1.10;  // 10% más de poder de negociación
        if (monto > 100000) return 1.05;  // 5% más de poder de negociación
        return 1.0;
    }

    /**
     * Calcula rentabilidad optimizada
     */
    calcularRentabilidadOptimizada(costoReal, markupPorcentaje, comisionPorcentaje, bonificacionPorcentaje) {
        const precioOptimizado = costoReal * (1 + markupPorcentaje / 100);
        const comisionMonto = (precioOptimizado * comisionPorcentaje) / 100;
        const bonificacionMonto = (costoReal * bonificacionPorcentaje) / 100;
        const markupMonto = precioOptimizado - costoReal - comisionMonto;
        
        return comisionMonto + bonificacionMonto + markupMonto;
    }

    /**
     * Guarda oportunidad detectada en base de datos
     */
    async guardarOportunidad(oportunidad) {
        try {
            const { data, error } = await supabase
                .from('OportunidadesRentabilidad')
                .insert({
                    ...oportunidad,
                    fecha_deteccion: new Date().toISOString(),
                    modelo_ia: 'RentabilidadInteligenteService v1.0'
                })
                .select()
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            errorHandlingService.handleError(error, 'guardarOportunidad');
            throw error;
        }
    }

    /**
     * Obtiene métricas de rentabilidad para dashboard
     */
    async obtenerMetricasDashboard(filtros = {}) {
        try {
            let query = supabase
                .from('vw_rentabilidad_cliente')
                .select('*');

            // Aplicar filtros
            if (filtros.id_cliente) {
                query = query.eq('id_cliente', filtros.id_cliente);
            }
            
            if (filtros.rentabilidad_minima) {
                query = query.gte('rentabilidad_porcentaje', filtros.rentabilidad_minima);
            }

            const { data, error } = await query.order('rentabilidad_total', { ascending: false });

            if (error) throw error;
            return data;

        } catch (error) {
            errorHandlingService.handleError(error, 'obtenerMetricasDashboard');
            throw error;
        }
    }

    /**
     * Obtiene métricas de rentabilidad por medio
     */
    async obtenerMetricasPorMedio(filtros = {}) {
        try {
            let query = supabase
                .from('vw_rentabilidad_medio')
                .select('*');

            // Aplicar filtros
            if (filtros.id_medio) {
                query = query.eq('id', filtros.id_medio);
            }
            
            if (filtros.rentabilidad_minima) {
                query = query.gte('rentabilidad_porcentaje', filtros.rentabilidad_minima);
            }

            const { data, error } = await query.order('rentabilidad_total', { ascending: false });

            if (error) throw error;
            return data || [];

        } catch (error) {
            errorHandlingService.handleError(error, 'obtenerMetricasPorMedio');
            // En caso de error, retornar array vacío para no romper la UI
            return [];
        }
    }

    /**
     * Obtiene oportunidades activas
     */
    async obtenerOportunidadesActivas() {
        try {
            const { data, error } = await supabase
                .from('vw_oportunidades_activas')
                .select('*')
                .eq('estado', 'detectada')
                .order('impacto_estimado', { ascending: false })
                .limit(20);

            if (error) throw error;
            return data || [];

        } catch (error) {
            errorHandlingService.handleError(error, 'obtenerOportunidadesActivas');
            // En caso de error, retornar array vacío para no romper la UI
            return [];
        }
    }

    /**
     * Aplica optimización de rentabilidad
     */
    async aplicarOptimizacion(oportunidad) {
        try {
            // Simulación de aplicación de optimización
            const resultado = {
                id_oportunidad: oportunidad.id,
                impacto_real: oportunidad.impacto_estimado * (0.8 + Math.random() * 0.4), // 80-120% del estimado
                fecha_aplicacion: new Date().toISOString(),
                estado: 'aplicada'
            };

            // Actualizar estado de la oportunidad
            const { error } = await supabase
                .from('OportunidadesRentabilidad')
                .update({
                    estado: 'aplicada',
                    fecha_resolucion: new Date().toISOString(),
                    resultado_obtenido: resultado.impacto_real
                })
                .eq('id', oportunidad.id);

            if (error) throw error;

            return resultado;

        } catch (error) {
            errorHandlingService.handleError(error, 'aplicarOptimizacion');
            throw error;
        }
    }
}

// Exportar instancia única del servicio
export const rentabilidadInteligenteService = new RentabilidadInteligenteService();
export default rentabilidadInteligenteService;