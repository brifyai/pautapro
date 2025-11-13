/**
 * PautaPro API Client - SDK JavaScript/Node.js
 * 
 * @version 2.0.0
 * @author PautaPro Development Team
 * @description Cliente oficial para integración con PautaPro API
 */

const axios = require('axios');
const FormData = require('form-data');

class PautaProClient {
  constructor(options = {}) {
    // Configuración base
    this.baseURL = options.baseURL || 'https://api.pautapro.com/v2';
    this.timeout = options.timeout || 30000;
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;

    // Autenticación
    this.apiKey = options.apiKey;
    this.accessToken = options.accessToken;

    // Configuración de logging
    this.debug = options.debug || false;
    this.logger = options.logger || console;

    // Headers por defecto
    this.defaultHeaders = {
      'User-Agent': 'PautaPro-SDK/2.0.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    // Crear instancia de Axios
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: this.defaultHeaders
    });

    // Interceptors para autenticación y logging
    this.setupInterceptors();

    // Validaciones iniciales
    this.validateConfig();
  }

  /**
   * Configura interceptors para autenticación y manejo de errores
   */
  setupInterceptors() {
    // Request interceptor - Agregar autenticación
    this.client.interceptors.request.use(
      (config) => {
        const authHeaders = this.getAuthHeaders();
        config.headers = { ...config.headers, ...authHeaders };

        if (this.debug) {
          this.logger.log('🔵 Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            headers: config.headers,
            data: config.data
          });
        }

        return config;
      },
      (error) => {
        this.logger.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - Manejo de errores y logging
    this.client.interceptors.response.use(
      (response) => {
        if (this.debug) {
          this.logger.log('🟢 Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data
          });
        }
        return response;
      },
      async (error) => {
        if (this.debug) {
          this.logger.error('🔴 Response Error:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message,
            data: error.response?.data
          });
        }

        // Retry automático para ciertos errores
        if (this.shouldRetry(error)) {
          return this.retryRequest(error.config);
        }

        // Mejorar mensajes de error
        if (error.response) {
          const apiError = new PautaProError(
            error.response.data?.error || 'Error de API',
            error.response.data?.code || 'API_ERROR',
            error.response.status,
            error.response.data?.details
          );
          throw apiError;
        } else if (error.request) {
          const networkError = new PautaProError(
            'Error de red - Sin respuesta del servidor',
            'NETWORK_ERROR',
            0
          );
          throw networkError;
        } else {
          const configError = new PautaProError(
            'Error de configuración de la solicitud',
            'CONFIG_ERROR',
            0
          );
          throw configError;
        }
      }
    );
  }

  /**
   * Obtiene headers de autenticación
   */
  getAuthHeaders() {
    if (this.apiKey) {
      return { 'X-API-Key': this.apiKey };
    } else if (this.accessToken) {
      return { 'Authorization': `Bearer ${this.accessToken}` };
    }
    return {};
  }

  /**
   * Valida configuración inicial
   */
  validateConfig() {
    if (!this.apiKey && !this.accessToken) {
      throw new Error('Se requiere API Key o Access Token para autenticación');
    }
  }

  /**
   * Determina si se debe reintentar la request
   */
  shouldRetry(error) {
    if (error.config && error.config.__retryCount < this.retryAttempts) {
      return (
        error.response?.status >= 500 || // Errores del servidor
        error.response?.status === 429 || // Rate limiting
        error.code === 'ECONNRESET' || // Problemas de red
        error.code === 'ETIMEDOUT' // Timeout
      );
    }
    return false;
  }

  /**
   * Reintenta una request
   */
  async retryRequest(config) {
    config.__retryCount = (config.__retryCount || 0) + 1;
    await new Promise(resolve => setTimeout(resolve, this.retryDelay * config.__retryCount));
    return this.client(config);
  }

  // ================== MÉTODOS PARA CLIENTES ==================

  /**
   * Lista clientes con filtros
   */
  async listarClientes(filtros = {}) {
    const params = {
      page: filtros.page || 1,
      limit: filtros.limit || 50,
      search: filtros.search,
      estado: filtros.estado,
      id_region: filtros.id_region,
      id_grupo: filtros.id_grupo
    };

    const response = await this.client.get('/clientes', { params });
    return response.data;
  }

  /**
   * Obtiene un cliente específico
   */
  async obtenerCliente(id) {
    const response = await this.client.get(`/clientes/${id}`);
    return response.data.data;
  }

  /**
   * Crea un nuevo cliente
   */
  async crearCliente(datosCliente) {
    const response = await this.client.post('/clientes', datosCliente);
    return response.data.data;
  }

  /**
   * Actualiza un cliente
   */
  async actualizarCliente(id, datosCliente) {
    const response = await this.client.put(`/clientes/${id}`, datosCliente);
    return response.data.data;
  }

  /**
   * Elimina un cliente (soft delete)
   */
  async eliminarCliente(id) {
    const response = await this.client.delete(`/clientes/${id}`);
    return response.data.success;
  }

  /**
   * Obtiene órdenes de un cliente
   */
  async obtenerOrdenesDeCliente(id, filtros = {}) {
    const params = {
      page: filtros.page || 1,
      limit: filtros.limit || 20,
      estado: filtros.estado
    };

    const response = await this.client.get(`/clientes/${id}/ordenes`, { params });
    return response.data.data;
  }

  // ================== MÉTODOS PARA ÓRDENES ==================

  /**
   * Lista órdenes con filtros
   */
  async listarOrdenes(filtros = {}) {
    const params = {
      page: filtros.page || 1,
      limit: filtros.limit || 50,
      search: filtros.search,
      estado: filtros.estado,
      id_cliente: filtros.id_cliente,
      fecha_desde: filtros.fecha_desde,
      fecha_hasta: filtros.fecha_hasta
    };

    const response = await this.client.get('/ordenes', { params });
    return response.data;
  }

  /**
   * Obtiene una orden específica
   */
  async obtenerOrden(id) {
    const response = await this.client.get(`/ordenes/${id}`);
    return response.data.data;
  }

  /**
   * Crea una nueva orden
   */
  async crearOrden(datosOrden) {
    const response = await this.client.post('/ordenes', datosOrden);
    return response.data.data;
  }

  /**
   * Actualiza una orden
   */
  async actualizarOrden(id, datosOrden) {
    const response = await this.client.put(`/ordenes/${id}`, datosOrden);
    return response.data.data;
  }

  /**
   * Agrega alternativa a una orden
   */
  async agregarAlternativaAOrden(id, datosAlternativa) {
    const response = await this.client.post(`/ordenes/${id}/alternativas`, datosAlternativa);
    return response.data.data;
  }

  // ================== MÉTODOS PARA REPORTES ==================

  /**
   * Genera reporte de rentabilidad
   */
  async obtenerReporteRentabilidad(filtros) {
    if (!filtros.fecha_desde || !filtros.fecha_hasta) {
      throw new Error('fecha_desde y fecha_hasta son obligatorios para el reporte de rentabilidad');
    }

    const params = {
      fecha_desde: filtros.fecha_desde,
      fecha_hasta: filtros.fecha_hasta,
      agrupacion: filtros.agrupacion || 'cliente',
      id_cliente: filtros.id_cliente,
      formato: filtros.formato || 'json'
    };

    const response = await this.client.get('/reportes/rentabilidad', { params });
    return response.data.data;
  }

  /**
   * Genera reporte de inversión
   */
  async obtenerReporteInversion(filtros) {
    if (!filtros.fecha_desde || !filtros.fecha_hasta) {
      throw new Error('fecha_desde y fecha_hasta son obligatorios para el reporte de inversión');
    }

    const params = {
      fecha_desde: filtros.fecha_desde,
      fecha_hasta: filtros.fecha_hasta,
      agrupacion: filtros.agrupacion || 'mensual',
      id_cliente: filtros.id_cliente,
      incluir_detalle: filtros.incluir_detalle || 'false'
    };

    const response = await this.client.get('/reportes/inversion', { params });
    return response.data.data;
  }

  /**
   * Obtiene KPIs por cliente
   */
  async obtenerKPIsClientes(filtros = {}) {
    const params = {
      fecha_desde: filtros.fecha_desde,
      fecha_hasta: filtros.fecha_hasta,
      ranking: filtros.ranking || 'rentabilidad',
      limite: filtros.limite || 20,
      incluir_detalle: filtros.incluir_detalle || 'true'
    };

    const response = await this.client.get('/reportes/clientes', { params });
    return response.data.data;
  }

  /**
   * Obtiene performance por medio
   */
  async obtenerPerformanceMedios(filtros = {}) {
    const params = {
      fecha_desde: filtros.fecha_desde,
      fecha_hasta: filtros.fecha_hasta,
      tipo_medio: filtros.tipo_medio,
      agrupacion: filtros.agrupacion || 'medio',
      incluir_tendencias: filtros.incluir_tendencias || 'true'
    };

    const response = await this.client.get('/reportes/medios', { params });
    return response.data.data;
  }

  // ================== MÉTODOS DE UTILIDAD ==================

  /**
   * Health check de la API
   */
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }

  /**
   * Obtiene métricas de la API
   */
  async obtenerMetricas(periodo = '24h') {
    const response = await this.client.get('/metrics', {
      params: { period: periodo }
    });
    return response.data.data;
  }

  /**
   * Valida token de acceso
   */
  async validarToken() {
    const response = await this.client.post('/oauth/validate');
    return response.data;
  }

  // ================== MÉTODOS PARA WEBHOOKS ==================

  /**
   * Registra un nuevo webhook
   */
  async registrarWebhook(config) {
    const response = await this.client.post('/webhooks', {
      url: config.url,
      events: config.events,
      secret: config.secret
    });
    return response.data.data;
  }

  /**
   * Lista webhooks registrados
   */
  async listarWebhooks(filtros = {}) {
    const params = { activo: filtros.activo || 'true' };
    const response = await this.client.get('/webhooks', { params });
    return response.data.data;
  }

  // ================== MÉTODOS BATCH ==================

  /**
   * Carga masiva de clientes
   */
  async cargaMasivaClientes(clientes) {
    const resultados = [];
    const batchSize = 10; // Procesar en lotes de 10

    for (let i = 0; i < clientes.length; i += batchSize) {
      const batch = clientes.slice(i, i + batchSize);
      const promises = batch.map(async (cliente) => {
        try {
          const resultado = await this.crearCliente(cliente);
          return { success: true, data: resultado, original: cliente };
        } catch (error) {
          return { success: false, error: error.message, original: cliente };
        }
      });

      const batchResults = await Promise.all(promises);
      resultados.push(...batchResults);

      // Pequeña pausa entre lotes para evitar sobrecarga
      if (i + batchSize < clientes.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return resultados;
  }

  /**
   * Sincronización bidireccional con CRM
   */
  async sincronizarConCRM(crmData, direction = 'both') {
    const syncResults = {
      created: [],
      updated: [],
      errors: []
    };

    try {
      if (direction === 'from_crm' || direction === 'both') {
        // Importar clientes del CRM a PautaPro
        for (const crmClient of crmData) {
          try {
            // Buscar cliente existente por RUT
            const existingClients = await this.listarClientes({ 
              search: crmClient.rut 
            });

            if (existingClients.data.length > 0) {
              // Actualizar cliente existente
              const updated = await this.actualizarCliente(
                existingClients.data[0].id_cliente, 
                this.mapCRMToPautaPro(crmClient)
              );
              syncResults.updated.push(updated);
            } else {
              // Crear nuevo cliente
              const created = await this.crearCliente(
                this.mapCRMToPautaPro(crmClient)
              );
              syncResults.created.push(created);
            }
          } catch (error) {
            syncResults.errors.push({
              action: 'import_from_crm',
              data: crmClient,
              error: error.message
            });
          }
        }
      }

      if (direction === 'to_crm' || direction === 'both') {
        // Exportar clientes de PautaPro al CRM
        const pautaProClients = await this.listarClientes({ limit: 1000 });
        
        for (const pautaClient of pautaProClients.data) {
          try {
            const crmFormatted = this.mapPautaProToCRM(pautaClient);
            // Aquí iría la lógica específica del CRM
            // await crmClient.upsertContact(crmFormatted);
          } catch (error) {
            syncResults.errors.push({
              action: 'export_to_crm',
              data: pautaClient,
              error: error.message
            });
          }
        }
      }

      return syncResults;

    } catch (error) {
      throw new Error(`Error en sincronización: ${error.message}`);
    }
  }

  // ================== MÉTODOS DE MAPEEO ==================

  /**
   * Mapea datos de CRM a formato PautaPro
   */
  mapCRMToPautaPro(crmData) {
    return {
      nombrecliente: crmData.nombre || crmData.company_name,
      nombrefantasia: crmData.fantasy_name || crmData.company_name,
      rut: crmData.rut || crmData.tax_id,
      email: crmData.email || crmData.contact_email,
      telcelular: crmData.phone || crmData.mobile_phone,
      direccion: crmData.address || crmData.street_address,
      giro: crmData.business_type || crmData.industry
    };
  }

  /**
   * Mapea datos de PautaPro a formato CRM
   */
  mapPautaProToCRM(pautaData) {
    return {
      nombre: pautaData.nombrecliente,
      company_name: pautaData.nombrefantasia || pautaData.razonsocial,
      rut: pautaData.rut,
      email: pautaData.email,
      phone: pautaData.telcelular,
      address: pautaData.direccion,
      industry: pautaData.giro,
      pautapro_id: pautaData.id_cliente,
      rentabilidad_promedio: pautaData.estadisticas?.inversion_total || 0
    };
  }

  /**
   * Cierra la conexión y limpia recursos
   */
  destroy() {
    this.client = null;
  }
}

/**
 * Clase para errores específicos de PautaPro
 */
class PautaProError extends Error {
  constructor(message, code, status, details) {
    super(message);
    this.name = 'PautaProError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      details: this.details
    };
  }
}

module.exports = {
  PautaProClient,
  PautaProError
};