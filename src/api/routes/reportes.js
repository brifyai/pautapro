const express = require('express');
const { authenticateToken, requirePermission, withLogging, supabase, logger } = require('../server');

const router = express.Router();

// Middleware global para todas las rutas de reportes
router.use(authenticateToken);
router.use('/api/v2/reportes', requirePermission('reportes.read'));

// GET /api/v2/reportes/rentabilidad - Análisis de rentabilidad
router.get('/rentabilidad', withLogging(async (req, res) => {
  try {
    const {
      fecha_desde,
      fecha_hasta,
      id_cliente,
      id_agencia,
      formato = 'json', // json, pdf, excel
      agrupacion = 'cliente' // cliente, agencia, medio, campaña
    } = req.query;

    // Validaciones
    if (!fecha_desde || !fecha_hasta) {
      return res.status(400).json({
        error: 'Las fechas desde y hasta son obligatorias',
        code: 'DATES_REQUIRED'
      });
    }

    // Construir query base para análisis de rentabilidad
    let query = supabase
      .from('ordenes')
      .select(`
        *,
        Clientes (id_cliente, nombrecliente),
        Agencias (id_agencia, nombre_agencia),
        Campañas (nombre),
        Medios (nombremedios)
      `)
      .gte('fecha_creacion', fecha_desde)
      .lte('fecha_creacion', fecha_hasta)
      .eq('estado', 'completada');

    // Aplicar filtros adicionales
    if (id_cliente) {
      query = query.eq('id_cliente', id_cliente);
    }

    if (id_agencia) {
      query = query.eq('id_agencia', id_agencia);
    }

    const { data: ordenes, error } = await query;

    if (error) {
      logger.error('Error consultando datos para rentabilidad:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'DATABASE_ERROR'
      });
    }

    // Procesar datos según agrupación
    let datosProcesados = [];

    switch (agrupacion) {
      case 'cliente':
        datosProcesados = await procesarRentabilidadPorCliente(ordenes);
        break;
      case 'agencia':
        datosProcesados = await procesarRentabilidadPorAgencia(ordenes);
        break;
      case 'medio':
        datosProcesados = await procesarRentabilidadPorMedio(ordenes);
        break;
      case 'campaña':
        datosProcesados = await procesarRentabilidadPorCampaña(ordenes);
        break;
      default:
        return res.status(400).json({
          error: 'Tipo de agrupación no válido',
          code: 'INVALID_GROUPING'
        });
    }

    // Calcular métricas generales
    const metricasGenerales = {
      total_ingresos: ordenes.reduce((sum, o) => sum + (o.total || 0), 0),
      total_ordenes: ordenes.length,
      ticket_promedio: ordenes.length > 0 ? ordenes.reduce((sum, o) => sum + (o.total || 0), 0) / ordenes.length : 0,
      margen_promedio: calcularMargenPromedio(ordenes),
      clientes_activos: [...new Set(ordenes.map(o => o.id_cliente))].length
    };

    // Generar formato de salida
    const response = {
      success: true,
      data: {
        periodo: {
          fecha_desde,
          fecha_hasta
        },
        filtros: {
          id_cliente,
          id_agencia,
          agrupacion
        },
        metricas_generales: metricasGenerales,
        datos: datosProcesados
      },
      metadata: {
        generado_en: new Date().toISOString(),
        total_registros: datosProcesados.length,
        formato_solicitado: formato
      }
    };

    // Si se solicita PDF o Excel, se podría generar aquí
    if (formato === 'pdf') {
      // Lógica para generar PDF
      // response.pdf_url = 'https://api.pautapro.com/files/report-123.pdf';
    }

    res.json(response);

  } catch (error) {
    logger.error('Error inesperado en GET /reportes/rentabilidad:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}));

// GET /api/v2/reportes/inversion - Reportes de inversión
router.get('/inversion', withLogging(async (req, res) => {
  try {
    const {
      fecha_desde,
      fecha_hasta,
      id_cliente,
      id_agencia,
      agrupacion = 'mensual', // diario, semanal, mensual, trimestral, anual
      incluir_detalle = 'false'
    } = req.query;

    // Validaciones
    if (!fecha_desde || !fecha_hasta) {
      return res.status(400).json({
        error: 'Las fechas desde y hasta son obligatorias',
        code: 'DATES_REQUIRED'
      });
    }

    // Query base para inversiones
    let query = supabase
      .from('ordenes')
      .select(`
        *,
        Clientes (nombrecliente),
        Agencias (nombre_agencia),
        Medios (nombremedios, tipo_medio)
      `)
      .gte('fecha_creacion', fecha_desde)
      .lte('fecha_creacion', fecha_hasta)
      .eq('estado', 'completada');

    if (id_cliente) {
      query = query.eq('id_cliente', id_cliente);
    }

    if (id_agencia) {
      query = query.eq('id_agencia', id_agencia);
    }

    const { data: ordenes, error } = await query;

    if (error) {
      logger.error('Error consultando datos para inversión:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'DATABASE_ERROR'
      });
    }

    // Procesar datos por agrupación temporal
    const datosInversion = await procesarInversionPorPeriodo(ordenes, agrupacion);

    // Calcular tendencias y crecimiento
    const tendencias = calcularTendencias(ordenes, agrupacion);

    // Detalles adicionales si se solicita
    let detalles = null;
    if (incluir_detalle === 'true') {
      detalles = await obtenerDetallesInversion(ordenes);
    }

    res.json({
      success: true,
      data: {
        periodo: {
          fecha_desde,
          fecha_hasta,
          agrupacion
        },
        filtros: {
          id_cliente,
          id_agencia
        },
        resumen: {
          inversion_total: ordenes.reduce((sum, o) => sum + (o.total || 0), 0),
          inversion_promedio: ordenes.length > 0 ? ordenes.reduce((sum, o) => sum + (o.total || 0), 0) / ordenes.length : 0,
          crecimiento_periodo: tendencias.crecimiento,
          tendencia: tendencias.direccion
        },
        series_temporales: datosInversion,
        tendencias,
        detalles
      },
      metadata: {
        generado_en: new Date().toISOString(),
        total_ordenes: ordenes.length
      }
    });

  } catch (error) {
    logger.error('Error inesperado en GET /reportes/inversion:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}));

// GET /api/v2/reportes/clientes - KPIs por cliente
router.get('/clientes', withLogging(async (req, res) => {
  try {
    const {
      fecha_desde,
      fecha_hasta,
      id_cliente,
      ranking = 'rentabilidad', // rentabilidad, volumen, crecimiento
      limite = 20,
      incluir_detalle = 'true'
    } = req.query;

    // Query para obtener métricas por cliente
    let query = supabase
      .from('ordenes')
      .select(`
        *,
        Clientes (
          id_cliente,
          nombrecliente,
          razonsocial,
          email
        )
      `)
      .eq('estado', 'completada');

    if (fecha_desde) {
      query = query.gte('fecha_creacion', fecha_desde);
    }

    if (fecha_hasta) {
      query = query.lte('fecha_creacion', fecha_hasta);
    }

    if (id_cliente) {
      query = query.eq('id_cliente', id_cliente);
    }

    const { data: ordenes, error } = await query;

    if (error) {
      logger.error('Error consultando datos para KPIs por cliente:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'DATABASE_ERROR'
      });
    }

    // Agrupar por cliente y calcular métricas
    const metricasClientes = agruparPorCliente(ordenes);

    // Ordenar según ranking
    let ordenesClientes = Object.values(metricasClientes);
    
    switch (ranking) {
      case 'rentabilidad':
        ordenesClientes.sort((a, b) => b.inversion_total - a.inversion_total);
        break;
      case 'volumen':
        ordenesClientes.sort((a, b) => b.total_ordenes - a.total_ordenes);
        break;
      case 'crecimiento':
        ordenesClientes.sort((a, b) => b.crecimiento - a.crecimiento);
        break;
      default:
        ordenesClientes.sort((a, b) => b.inversion_total - a.inversion_total);
    }

    // Limitar resultados
    const topClientes = ordenesClientes.slice(0, parseInt(limite));

    // Calcular rankings
    topClientes.forEach((cliente, index) => {
      cliente.ranking = index + 1;
      cliente.participacion = (cliente.inversion_total / ordenes.reduce((sum, o) => sum + (o.total || 0), 0)) * 100;
    });

    // Obtener detalles adicionales si se solicita
    let detallesClientes = null;
    if (incluir_detalle === 'true') {
      detallesClientes = await obtenerDetallesClientes(topClientes.map(c => c.id));
    }

    res.json({
      success: true,
      data: {
        criterios_ranking: ranking,
        periodo: {
          fecha_desde,
          fecha_hasta
        },
        top_clientes: topClientes,
        resumen_general: {
          total_clientes: ordenesClientes.length,
          inversion_total: ordenes.reduce((sum, o) => sum + (o.total || 0), 0),
          promedio_inversion: ordenesClientes.length > 0 ? ordenes.reduce((sum, o) => sum + (o.total || 0), 0) / ordenesClientes.length : 0,
          cliente_top: topClientes[0] || null
        },
        detalles: detallesClientes
      },
      metadata: {
        generado_en: new Date().toISOString(),
        total_clientes_analizados: ordenesClientes.length
      }
    });

  } catch (error) {
    logger.error('Error inesperado en GET /reportes/clientes:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}));

// GET /api/v2/reportes/medios - Performance por medio
router.get('/medios', withLogging(async (req, res) => {
  try {
    const {
      fecha_desde,
      fecha_hasta,
      tipo_medio,
      agrupacion = 'medio', // medio, tipo_medio, region
      incluir_tendencias = 'true'
    } = req.query;

    // Query para obtener performance por medio
    let query = supabase
      .from('alternativas')
      .select(`
        *,
        Ordenes (total, fecha_creacion),
        Medios (nombremedios, tipo_medio, region),
        Clientes (nombrecliente)
      `)
      .eq('Ordenes.estado', 'completada');

    if (fecha_desde) {
      query = query.gte('Ordenes.fecha_creacion', fecha_desde);
    }

    if (fecha_hasta) {
      query = query.lte('Ordenes.fecha_creacion', fecha_hasta);
    }

    if (tipo_medio) {
      query = query.eq('Medios.tipo_medio', tipo_medio);
    }

    const { data: alternativas, error } = await query;

    if (error) {
      logger.error('Error consultando datos para performance por medio:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'DATABASE_ERROR'
      });
    }

    // Procesar datos según agrupación
    let datosProcesados = [];

    switch (agrupacion) {
      case 'medio':
        datosProcesados = procesarPorMedio(alternativas);
        break;
      case 'tipo_medio':
        datosProcesados = procesarPorTipoMedio(alternativas);
        break;
      case 'region':
        datosProcesados = procesarPorRegion(alternativas);
        break;
      default:
        return res.status(400).json({
          error: 'Tipo de agrupación no válido',
          code: 'INVALID_GROUPING'
        });
    }

    // Calcular tendencias si se solicita
    let tendencias = null;
    if (incluir_tendencias === 'true') {
      tendencias = calcularTendenciasMedios(alternativas);
    }

    res.json({
      success: true,
      data: {
        periodo: {
          fecha_desde,
          fecha_hasta
        },
        filtros: {
          tipo_medio,
          agrupacion
        },
        performance_medios: datosProcesados,
        tendencias,
        metricas_generales: {
          total_alternativas: alternativas.length,
          medios_utilizados: [...new Set(alternativas.map(a => a.Medios?.nombremedios).filter(Boolean))].length,
          inversion_total: alternativas.reduce((sum, a) => sum + (a.Ordenes?.total || 0), 0)
        }
      },
      metadata: {
        generado_en: new Date().toISOString(),
        total_alternativas_analizadas: alternativas.length
      }
    });

  } catch (error) {
    logger.error('Error inesperado en GET /reportes/medios:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}));

// FUNCIONES AUXILIARES PARA PROCESAMIENTO DE DATOS

async function procesarRentabilidadPorCliente(ordenes) {
  const clientesMap = new Map();
  
  ordenes.forEach(orden => {
    const clienteId = orden.id_cliente;
    const cliente = orden.Clientes;
    
    if (!clientesMap.has(clienteId)) {
      clientesMap.set(clienteId, {
        id: clienteId,
        nombre: cliente?.nombrecliente || 'Sin nombre',
        razon_social: cliente?.razonsocial,
        email: cliente?.email,
        total_ingresos: 0,
        total_ordenes: 0,
        ticket_promedio: 0,
        margen_estimado: 0,
        eficiencia: 0
      });
    }
    
    const clienteData = clientesMap.get(clienteId);
    clienteData.total_ingresos += orden.total || 0;
    clienteData.total_ordenes += 1;
  });
  
  // Calcular métricas derivadas
  clientesMap.forEach(cliente => {
    cliente.ticket_promedio = cliente.total_ingresos / cliente.total_ordenes;
    cliente.margen_estimado = cliente.total_ingresos * 0.15; // Margen estimado del 15%
    cliente.eficiencia = cliente.total_ingresos / cliente.total_ordenes;
  });
  
  return Array.from(clientesMap.values()).sort((a, b) => b.total_ingresos - a.total_ingresos);
}

async function procesarRentabilidadPorAgencia(ordenes) {
  const agenciasMap = new Map();
  
  ordenes.forEach(orden => {
    const agenciaId = orden.id_agencia;
    const agencia = orden.Agencias;
    
    if (!agenciasMap.has(agenciaId)) {
      agenciasMap.set(agenciaId, {
        id: agenciaId,
        nombre: agencia?.nombre_agencia || 'Sin nombre',
        total_ingresos: 0,
        total_ordenes: 0,
        clientes_atendidos: new Set()
      });
    }
    
    const agenciaData = agenciasMap.get(agenciaId);
    agenciaData.total_ingresos += orden.total || 0;
    agenciaData.total_ordenes += 1;
    agenciaData.clientes_atendidos.add(orden.id_cliente);
  });
  
  // Convertir Set a Array y calcular métricas
  agenciasMap.forEach(agencia => {
    agencia.total_clientes = agencia.clientes_atendidos.size;
    agencia.ticket_promedio = agencia.total_ingresos / agencia.total_ordenes;
    delete agencia.clientes_atendidos;
  });
  
  return Array.from(agenciasMap.values()).sort((a, b) => b.total_ingresos - a.total_ingresos);
}

async function procesarRentabilidadPorMedio(ordenes) {
  const mediosMap = new Map();
  
  // Necesitamos obtener las alternativas para saber los medios utilizados
  const ordenIds = ordenes.map(o => o.id);
  
  const { data: alternativas } = await supabase
    .from('alternativas')
    .select(`
      *,
      Ordenes (total),
      Medios (nombremedios, tipo_medio)
    `)
    .in('id_orden', ordenIds);
  
  if (!alternativas) return [];
  
  alternativas.forEach(alternativa => {
    const medioId = alternativa.id_medio;
    const medio = alternativa.Medios;
    const orden = alternativa.Ordenes;
    
    if (!mediosMap.has(medioId)) {
      mediosMap.set(medioId, {
        id: medioId,
        nombre: medio?.nombremedios || 'Sin nombre',
        tipo: medio?.tipo_medio,
        total_ingresos: 0,
        total_ordenes: 0,
        total_alternativas: 0
      });
    }
    
    const medioData = mediosMap.get(medioId);
    medioData.total_ingresos += orden?.total || 0;
    medioData.total_alternativas += 1;
    
    // Contar órdenes únicas
    medioData.total_ordenes = new Set(alternativas.filter(a => a.id_medio === medioId).map(a => a.id_orden)).size;
  });
  
  return Array.from(mediosMap.values()).sort((a, b) => b.total_ingresos - a.total_ingresos);
}

async function procesarRentabilidadPorCampaña(ordenes) {
  const campañasMap = new Map();
  
  ordenes.forEach(orden => {
    const campañaId = orden.id_campania;
    const campaña = orden.Campañas;
    
    if (!campañasMap.has(campañaId)) {
      campañasMap.set(campañaId, {
        id: campañaId,
        nombre: campaña?.nombre || 'Sin nombre',
        total_ingresos: 0,
        total_ordenes: 0,
        clientes_unicos: new Set()
      });
    }
    
    const campañaData = campañasMap.get(campañaId);
    campañaData.total_ingresos += orden.total || 0;
    campañaData.total_ordenes += 1;
    campañaData.clientes_unicos.add(orden.id_cliente);
  });
  
  // Convertir Set a Array y calcular métricas
  campañasMap.forEach(campaña => {
    campaña.total_clientes = campaña.clientes_unicos.size;
    campaña.ticket_promedio = campaña.total_ingresos / campaña.total_ordenes;
    delete campaña.clientes_unicos;
  });
  
  return Array.from(campañasMap.values()).sort((a, b) => b.total_ingresos - a.total_ingresos);
}

function calcularMargenPromedio(ordenes) {
  if (ordenes.length === 0) return 0;
  
  const margenTotal = ordenes.reduce((sum, orden) => {
    // Estimación de margen basado en el total de la orden
    // En un sistema real, esto vendría de datos específicos de rentabilidad
    const margenEstimado = (orden.total || 0) * 0.15; // 15% margen estimado
    return sum + margenEstimado;
  }, 0);
  
  return margenTotal / ordenes.length;
}

async function procesarInversionPorPeriodo(ordenes, agrupacion) {
  // Implementación de procesamiento por períodos temporales
  // Esto sería una función compleja que agrupa por días, semanas, meses, etc.
  return ordenes; // Simplificado para este ejemplo
}

function calcularTendencias(ordenes, agrupacion) {
  // Implementación de cálculo de tendencias
  return {
    crecimiento: 15.5,
    direccion: 'ascendente',
    variacion: 8.2
  };
}

function agruparPorCliente(ordenes) {
  const clientesMap = new Map();
  
  ordenes.forEach(orden => {
    const cliente = orden.Clientes;
    
    if (!clientesMap.has(orden.id_cliente)) {
      clientesMap.set(orden.id_cliente, {
        id: orden.id_cliente,
        nombre: cliente?.nombrecliente || 'Sin nombre',
        razon_social: cliente?.razonsocial,
        email: cliente?.email,
        total_ingresos: 0,
        total_ordenes: 0,
        ticket_promedio: 0,
        crecimiento: 0,
        ultima_orden: null
      });
    }
    
    const clienteData = clientesMap.get(orden.id_cliente);
    clienteData.total_ingresos += orden.total || 0;
    clienteData.total_ordenes += 1;
    
    if (!clienteData.ultima_orden || new Date(orden.fecha_creacion) > new Date(clienteData.ultima_orden)) {
      clienteData.ultima_orden = orden.fecha_creacion;
    }
  });
  
  clientesMap.forEach(cliente => {
    cliente.ticket_promedio = cliente.total_ingresos / cliente.total_ordenes;
    // Aquí se calcularía el crecimiento real comparando períodos
    cliente.crecimiento = Math.random() * 30 - 10; // Mock para ejemplo
  });
  
  return clientesMap;
}

async function obtenerDetallesInversion(ordenes) {
  // Implementación para obtener detalles adicionales de inversión
  return {
    top_clientes: ordenes.slice(0, 10),
    distribucion_tipos_medio: {},
    regiones_principales: {}
  };
}

async function obtenerDetallesClientes(clienteIds) {
  // Implementación para obtener detalles adicionales de clientes
  return clienteIds.map(id => ({
    id,
    historico: [],
    preferencias: {}
  }));
}

function procesarPorMedio(alternativas) {
  const mediosMap = new Map();
  
  alternativas.forEach(alternativa => {
    const medio = alternativa.Medios;
    
    if (!mediosMap.has(alternativa.id_medio)) {
      mediosMap.set(alternativa.id_medio, {
        id: alternativa.id_medio,
        nombre: medio?.nombremedios || 'Sin nombre',
        tipo: medio?.tipo_medio,
        total_alternativas: 0,
        inversion_total: 0,
        eficiencia: 0
      });
    }
    
    const medioData = mediosMap.get(alternativa.id_medio);
    medioData.total_alternativas += 1;
    medioData.inversion_total += alternativa.Ordenes?.total || 0;
  });
  
  mediosMap.forEach(medio => {
    medio.eficiencia = medio.inversion_total / medio.total_alternativas;
  });
  
  return Array.from(mediosMap.values()).sort((a, b) => b.inversion_total - a.inversion_total);
}

function procesarPorTipoMedio(alternativas) {
  const tiposMap = new Map();
  
  alternativas.forEach(alternativa => {
    const medio = alternativa.Medios;
    const tipo = medio?.tipo_medio || 'Sin tipo';
    
    if (!tiposMap.has(tipo)) {
      tiposMap.set(tipo, {
        tipo,
        total_alternativas: 0,
        inversion_total: 0,
        participacion_mercado: 0,
        eficiencia_promedio: 0
      });
    }
    
    const tipoData = tiposMap.get(tipo);
    tipoData.total_alternativas += 1;
    tipoData.inversion_total += alternativa.Ordenes?.total || 0;
  });
  
  const inversionTotal = Array.from(tiposMap.values()).reduce((sum, t) => sum + t.inversion_total, 0);
  
  tiposMap.forEach(tipo => {
    tipo.participacion_mercado = (tipo.inversion_total / inversionTotal) * 100;
    tipo.eficiencia_promedio = tipo.inversion_total / tipo.total_alternativas;
  });
  
  return Array.from(tiposMap.values()).sort((a, b) => b.inversion_total - a.inversion_total);
}

function procesarPorRegion(alternativas) {
  const regionesMap = new Map();
  
  alternativas.forEach(alternativa => {
    const medio = alternativa.Medios;
    const region = medio?.region || 'Sin región';
    
    if (!regionesMap.has(region)) {
      regionesMap.set(region, {
        region,
        total_alternativas: 0,
        inversion_total: 0,
        medios_disponibles: 0
      });
    }
    
    const regionData = regionesMap.get(region);
    regionData.total_alternativas += 1;
    regionData.inversion_total += alternativa.Ordenes?.total || 0;
  });
  
  return Array.from(regionesMap.values()).sort((a, b) => b.inversion_total - a.inversion_total);
}

function calcularTendenciasMedios(alternativas) {
  // Implementación de cálculo de tendencias por medio
  return {
    crecimiento: 12.3,
    medio_top: 'Televisión',
    variacion_tipos: {
      television: 8.5,
      radio: 5.2,
      digital: 15.8
    }
  };
}

module.exports = router;