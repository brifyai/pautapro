/**
 * AI Integration Service
 * Conecta el Asistente IA con los handlers y la interfaz ChatIA
 * Maneja el flujo completo de procesamiento de comandos
 */

import { advancedNLPService } from './advancedNLPService';
import { actionOrchestrator } from './actionOrchestrator';
import { executeIntention, getIntentionInfo } from './aiHandlers';

class AIIntegrationService {
  constructor() {
    this.logger = this.createLogger();
    this.conversationHistory = [];
    this.maxHistoryLength = 50;
  }

  createLogger() {
    return {
      info: (msg, data) => console.log(`[AIIntegration] ${msg}`, data || ''),
      error: (msg, err) => console.error(`[AIIntegration ERROR] ${msg}`, err || ''),
      warn: (msg, data) => console.warn(`[AIIntegration WARN] ${msg}`, data || '')
    };
  }

  /**
   * Procesar comando del usuario
   */
  async processCommand(userMessage, userRole = 'asistente') {
    try {
      this.logger.info('Procesando comando', { userMessage, userRole });

      // 1. Análisis NLP avanzado
      const nlpResult = await advancedNLPService.analyzeText(userMessage);
      this.logger.info('Análisis NLP completado', nlpResult);

      // 2. Detectar intención
      const intention = this.detectIntention(nlpResult);
      if (!intention) {
        return {
          success: false,
          type: 'NO_INTENTION',
          message: 'No pude entender qué deseas hacer. ¿Puedes ser más específico?',
          suggestions: this.getSuggestions(nlpResult)
        };
      }

      // 3. Extraer parámetros
      const params = this.extractParameters(nlpResult, intention);

      // 4. Validar permisos
      const permissionCheck = await actionOrchestrator.checkPermissions(
        userRole,
        intention
      );

      if (!permissionCheck.allowed) {
        return {
          success: false,
          type: 'PERMISSION_DENIED',
          message: `No tienes permiso para realizar esta acción: ${permissionCheck.reason}`,
          requiredRole: permissionCheck.requiredRole
        };
      }

      // 5. Ejecutar intención
      const result = await executeIntention(intention, params);

      // 6. Guardar en historial
      this.addToHistory({
        userMessage,
        intention,
        params,
        result,
        timestamp: new Date().toISOString()
      });

      // 7. Formatear respuesta
      const response = this.formatResponse(intention, result);

      return {
        success: result.success,
        type: 'ACTION_EXECUTED',
        intention,
        result,
        response,
        requiresConfirmation: this.requiresConfirmation(intention, result)
      };
    } catch (err) {
      this.logger.error('Error procesando comando', err);
      return {
        success: false,
        type: 'PROCESSING_ERROR',
        message: 'Ocurrió un error al procesar tu comando',
        error: err.message
      };
    }
  }

  /**
   * Detectar intención del usuario
   */
  detectIntention(nlpResult) {
    const { mainVerb, entities, sentiment } = nlpResult;

    // Mapeo de verbos a intenciones
    const verbIntentionMap = {
      'crear': 'CREATE',
      'crear': 'CREATE',
      'agregar': 'CREATE',
      'nuevo': 'CREATE',
      'nueva': 'CREATE',
      'buscar': 'SEARCH',
      'encontrar': 'SEARCH',
      'listar': 'SEARCH',
      'obtener': 'READ',
      'ver': 'READ',
      'mostrar': 'READ',
      'actualizar': 'UPDATE',
      'cambiar': 'UPDATE',
      'modificar': 'UPDATE',
      'editar': 'UPDATE',
      'eliminar': 'DELETE',
      'borrar': 'DELETE',
      'remover': 'DELETE',
      'exportar': 'EXPORT',
      'descargar': 'EXPORT',
      'estadísticas': 'REPORT',
      'estadisticas': 'REPORT',
      'resumen': 'REPORT',
      'reporte': 'REPORT'
    };

    const action = verbIntentionMap[mainVerb?.toLowerCase()];
    if (!action) return null;

    // Detectar entidad
    const entityType = this.detectEntityType(entities);
    if (!entityType) return null;

    // Construir intención
    const intention = `${action}_${entityType}`.toUpperCase();
    return intention;
  }

  /**
   * Detectar tipo de entidad
   */
  detectEntityType(entities) {
    const entityKeywords = {
      CLIENT: ['cliente', 'clientes', 'empresa', 'empresas', 'contacto', 'contactos'],
      PROVIDER: ['proveedor', 'proveedores', 'vendor', 'vendors', 'agencia', 'agencias'],
      MEDIA: ['medio', 'medios', 'canal', 'canales', 'radio', 'tv', 'digital'],
      TEMA: ['tema', 'temas', 'contenido', 'contenidos', 'spot', 'spots'],
      CAMPAIGN: ['campaña', 'campañas', 'campaign', 'campaigns'],
      ORDER: ['orden', 'órdenes', 'order', 'orders', 'compra', 'compras']
    };

    for (const [type, keywords] of Object.entries(entityKeywords)) {
      for (const keyword of keywords) {
        if (entities.some(e => e.toLowerCase().includes(keyword))) {
          return type;
        }
      }
    }

    return null;
  }

  /**
   * Extraer parámetros del análisis NLP
   */
  extractParameters(nlpResult, intention) {
    const params = {};
    const { namedEntities, values } = nlpResult;

    // Mapear entidades nombradas a parámetros
    for (const entity of namedEntities) {
      if (entity.type === 'EMAIL') params.email = entity.value;
      if (entity.type === 'PHONE') params.telefono = entity.value;
      if (entity.type === 'RUT') params.rut = entity.value;
      if (entity.type === 'AMOUNT') params.monto = entity.value;
      if (entity.type === 'DATE') params.fecha = entity.value;
      if (entity.type === 'PERCENTAGE') params.porcentaje = entity.value;
      if (entity.type === 'NAME') params.nombre = entity.value;
    }

    // Agregar valores extraídos
    for (const [key, value] of Object.entries(values)) {
      if (!params[key]) params[key] = value;
    }

    return params;
  }

  /**
   * Formatear respuesta para el usuario
   */
  formatResponse(intention, result) {
    if (!result.success) {
      return {
        type: 'ERROR',
        message: result.error,
        code: result.code
      };
    }

    // Respuestas personalizadas por tipo de resultado
    if (Array.isArray(result.data)) {
      return {
        type: 'TABLE',
        message: result.message,
        data: result.data,
        count: result.data.length
      };
    }

    if (result.data?.totalClients !== undefined || result.data?.totalProviders !== undefined) {
      return {
        type: 'STATS',
        message: result.message,
        data: result.data
      };
    }

    if (result.data?.budgetSpent !== undefined) {
      return {
        type: 'CAMPAIGN_SUMMARY',
        message: result.message,
        data: result.data
      };
    }

    if (result.filename) {
      return {
        type: 'EXPORT',
        message: result.message,
        filename: result.filename,
        data: result.data
      };
    }

    if (typeof result.data === 'object') {
      return {
        type: 'DETAIL',
        message: result.message,
        data: result.data
      };
    }

    return {
      type: 'SUCCESS',
      message: result.message
    };
  }

  /**
   * Determinar si requiere confirmación
   */
  requiresConfirmation(intention, result) {
    const criticalActions = ['DELETE', 'CHANGE_STATUS', 'CHANGE_PRIORITY'];
    const actionType = intention.split('_')[0];

    return criticalActions.includes(actionType) && result.success;
  }

  /**
   * Obtener sugerencias basadas en análisis NLP
   */
  getSuggestions(nlpResult) {
    const suggestions = [];

    if (nlpResult.sentiment === 'NEGATIVE') {
      suggestions.push('¿Necesitas ayuda para resolver un problema?');
    }

    if (nlpResult.mainVerb === 'UNKNOWN') {
      suggestions.push('Intenta usar verbos como: crear, buscar, actualizar, eliminar');
    }

    suggestions.push('Puedo ayudarte con: clientes, proveedores, medios, campañas, órdenes');

    return suggestions;
  }

  /**
   * Agregar al historial de conversación
   */
  addToHistory(entry) {
    this.conversationHistory.push(entry);

    // Limitar tamaño del historial
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory.shift();
    }
  }

  /**
   * Obtener historial de conversación
   */
  getConversationHistory() {
    return this.conversationHistory;
  }

  /**
   * Limpiar historial
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Obtener contexto de conversación
   */
  getConversationContext() {
    if (this.conversationHistory.length === 0) return null;

    const lastEntries = this.conversationHistory.slice(-5);
    return {
      lastIntention: lastEntries[lastEntries.length - 1]?.intention,
      lastEntity: this.extractEntityFromIntention(lastEntries[lastEntries.length - 1]?.intention),
      recentActions: lastEntries.map(e => e.intention),
      totalInteractions: this.conversationHistory.length
    };
  }

  /**
   * Extraer entidad de intención
   */
  extractEntityFromIntention(intention) {
    if (!intention) return null;
    const parts = intention.split('_');
    return parts[parts.length - 1];
  }

  /**
   * Obtener ayuda contextual
   */
  async getContextualHelp(topic) {
    try {
      const intentions = this.getIntentionsByTopic(topic);
      return {
        success: true,
        topic,
        intentions: intentions.map(i => ({
          intention: i,
          info: getIntentionInfo(i),
          examples: this.getExamples(i)
        }))
      };
    } catch (err) {
      this.logger.error('Error obteniendo ayuda contextual', err);
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * Obtener intenciones por tema
   */
  getIntentionsByTopic(topic) {
    const topicMap = {
      'clientes': ['CREATE_CLIENT', 'SEARCH_CLIENTS', 'UPDATE_CLIENT', 'DELETE_CLIENT'],
      'proveedores': ['CREATE_PROVIDER', 'SEARCH_PROVIDERS', 'UPDATE_PROVIDER', 'DELETE_PROVIDER'],
      'medios': ['CREATE_MEDIA', 'SEARCH_MEDIAS', 'UPDATE_MEDIA', 'DELETE_MEDIA'],
      'temas': ['CREATE_TEMA', 'SEARCH_TEMAS', 'UPDATE_TEMA', 'DELETE_TEMA'],
      'campañas': ['CREATE_CAMPAIGN', 'SEARCH_CAMPAIGNS', 'UPDATE_CAMPAIGN', 'DELETE_CAMPAIGN'],
      'órdenes': ['CREATE_ORDER', 'SEARCH_ORDERS', 'UPDATE_ORDER', 'DELETE_ORDER']
    };

    return topicMap[topic?.toLowerCase()] || [];
  }

  /**
   * Obtener ejemplos de uso
   */
  getExamples(intention) {
    const examples = {
      'CREATE_CLIENT': [
        'Crear cliente Acme Corp con email contacto@acme.com',
        'Nuevo cliente en Santiago, región Metropolitana',
        'Agregar cliente tipo empresa'
      ],
      'SEARCH_CLIENTS': [
        'Buscar clientes activos',
        'Listar clientes en Santiago',
        'Encontrar cliente Acme'
      ],
      'CREATE_ORDER': [
        'Crear orden para cliente 5 con proveedor 3',
        'Nueva orden urgente para el 15 de diciembre',
        'Agregar orden con monto $1.500.000'
      ],
      'SEARCH_ORDERS': [
        'Mostrar órdenes pendientes',
        'Listar órdenes urgentes',
        'Buscar órdenes del cliente 5'
      ]
    };

    return examples[intention] || [];
  }

  /**
   * Validar comando antes de ejecutar
   */
  async validateCommand(intention, params) {
    try {
      const intentionInfo = getIntentionInfo(intention);
      if (!intentionInfo) {
        return {
          valid: false,
          error: 'Intención no reconocida'
        };
      }

      // Validar parámetros requeridos
      const missingParams = intentionInfo.requiredParams.filter(p => !params[p]);
      if (missingParams.length > 0) {
        return {
          valid: false,
          error: `Parámetros requeridos faltantes: ${missingParams.join(', ')}`,
          missingParams
        };
      }

      return {
        valid: true,
        intentionInfo
      };
    } catch (err) {
      this.logger.error('Error validando comando', err);
      return {
        valid: false,
        error: err.message
      };
    }
  }

  /**
   * Obtener sugerencias de autocompletado
   */
  getAutocompleteSuggestions(input) {
    const suggestions = [];

    // Sugerencias de verbos
    const verbs = ['crear', 'buscar', 'actualizar', 'eliminar', 'exportar'];
    const matchingVerbs = verbs.filter(v => v.startsWith(input.toLowerCase()));
    suggestions.push(...matchingVerbs.map(v => ({ type: 'verb', value: v })));

    // Sugerencias de entidades
    const entities = ['cliente', 'proveedor', 'medio', 'tema', 'campaña', 'orden'];
    const matchingEntities = entities.filter(e => e.startsWith(input.toLowerCase()));
    suggestions.push(...matchingEntities.map(e => ({ type: 'entity', value: e })));

    return suggestions;
  }
}

// Exportar instancia singleton
export const aiIntegrationService = new AIIntegrationService();
export default AIIntegrationService;
