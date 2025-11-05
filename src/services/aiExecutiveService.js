/**
 * 🤖 AI Executive Service - PautaPro
 * 
 * Servicio avanzado de procesamiento de lenguaje natural para el Asistente IA
 * Responsable de:
 * - Análisis semántico de instrucciones
 * - Extracción de entidades con contexto
 * - Validación de intenciones
 * - Manejo de conversaciones multi-turno
 */

class AIExecutiveService {
  constructor() {
    this.conversationHistory = [];
    this.currentContext = {};
    this.entityCache = {};
    
    // Diccionario de intenciones y palabras clave
    this.intentPatterns = {
      CREATE: {
        keywords: ['crear', 'nuevo', 'agregar', 'añadir', 'generar', 'hacer'],
        entities: ['cliente', 'proveedor', 'medio', 'soporte', 'campaña', 'orden', 'contrato', 'agencia']
      },
      READ: {
        keywords: ['buscar', 'busca', 'encuentra', 'muestra', 'muéstrame', 'dame', 'obtén', 'dame', 'listar', 'lista'],
        entities: ['cliente', 'proveedor', 'medio', 'soporte', 'campaña', 'orden', 'contrato', 'agencia']
      },
      UPDATE: {
        keywords: ['actualizar', 'modificar', 'cambiar', 'editar', 'actualiza', 'modifica', 'cambia'],
        entities: ['cliente', 'proveedor', 'medio', 'soporte', 'campaña', 'orden', 'contrato', 'agencia']
      },
      DELETE: {
        keywords: ['eliminar', 'borrar', 'quitar', 'elimina', 'borra', 'quita'],
        entities: ['cliente', 'proveedor', 'medio', 'soporte', 'campaña', 'orden', 'contrato', 'agencia']
      },
      REPORT: {
        keywords: ['reporte', 'informe', 'genera', 'análisis', 'estadísticas', 'métricas', 'rendimiento'],
        entities: ['clientes', 'proveedores', 'medios', 'campañas', 'órdenes', 'contratos']
      },
      EXPORT: {
        keywords: ['exportar', 'descargar', 'excel', 'csv', 'pdf'],
        entities: ['clientes', 'proveedores', 'medios', 'campañas', 'órdenes', 'contratos']
      },
      NAVIGATE: {
        keywords: ['ir a', 'llévame a', 'navega a', 'abre', 'muéstrame', 've a'],
        entities: ['clientes', 'proveedores', 'medios', 'soportes', 'campañas', 'órdenes', 'contratos', 'agencias', 'reportes', 'dashboard']
      },
      SEARCH_ADVANCED: {
        keywords: ['busca', 'encuentra', 'filtra', 'con', 'donde', 'que', 'mayor', 'menor', 'entre'],
        entities: ['cliente', 'proveedor', 'medio', 'orden', 'campaña']
      }
    };

    // Patrones de extracción de valores
    this.valuePatterns = {
      monto: /\$?\s*(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)/g,
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      telefono: /\+?56?9?\d{8,9}/g,
      rut: /\d{1,2}\.\d{3}\.\d{3}-[\dkK]/g,
      fecha: /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/g,
      porcentaje: /(\d+(?:[.,]\d{1,2})?)\s*%/g
    };

    // Sinónimos y variaciones
    this.synonyms = {
      cliente: ['cliente', 'clientes', 'empresa', 'empresas', 'compañía', 'compañías'],
      proveedor: ['proveedor', 'proveedores', 'vendor', 'vendors', 'agencia', 'agencias'],
      medio: ['medio', 'medios', 'canal', 'canales', 'tv', 'radio', 'prensa', 'digital'],
      soporte: ['soporte', 'soportes', 'programa', 'programas', 'espacio', 'espacios'],
      campaña: ['campaña', 'campañas', 'plan', 'planes', 'proyecto', 'proyectos'],
      orden: ['orden', 'órdenes', 'orden de compra', 'oc', 'pedido', 'pedidos'],
      contrato: ['contrato', 'contratos', 'acuerdo', 'acuerdos'],
      agencia: ['agencia', 'agencias', 'sucursal', 'sucursales'],
      estado: ['estado', 'estatus', 'situación', 'condición'],
      activo: ['activo', 'activado', 'habilitado', 'vigente'],
      inactivo: ['inactivo', 'desactivado', 'deshabilitado', 'vencido']
    };
  }

  /**
   * Procesa una instrucción del usuario
   * @param {string} message - Mensaje del usuario
   * @param {object} context - Contexto de la conversación
   * @returns {object} Resultado del procesamiento
   */
  async parseInstruction(message, context = {}) {
    try {
      const lowerMessage = message.toLowerCase().trim();
      
      // Actualizar contexto
      this.currentContext = { ...this.currentContext, ...context };
      
      // Agregar al historial
      this.conversationHistory.push({
        message,
        timestamp: new Date(),
        role: 'user'
      });

      // Detectar intención
      const intention = this.detectIntention(lowerMessage);
      
      // Extraer entidades
      const entities = this.extractEntities(lowerMessage, intention);
      
      // Extraer valores
      const values = this.extractValues(lowerMessage);
      
      // Validar intención
      const validation = this.validateIntention(intention, entities);

      return {
        success: validation.valid,
        intention,
        entities,
        values,
        validation,
        confidence: this.calculateConfidence(intention, entities, values),
        suggestions: validation.suggestions,
        message: validation.message
      };
    } catch (error) {
      console.error('Error en parseInstruction:', error);
      return {
        success: false,
        error: error.message,
        message: 'Error al procesar tu instrucción'
      };
    }
  }

  /**
   * Detecta la intención del usuario
   * @param {string} message - Mensaje normalizado
   * @returns {string} Intención detectada
   */
  detectIntention(message) {
    let maxMatches = 0;
    let detectedIntention = 'UNKNOWN';

    for (const [intention, pattern] of Object.entries(this.intentPatterns)) {
      const matches = pattern.keywords.filter(keyword => message.includes(keyword)).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedIntention = intention;
      }
    }

    return detectedIntention;
  }

  /**
   * Extrae entidades del mensaje
   * @param {string} message - Mensaje normalizado
   * @param {string} intention - Intención detectada
   * @returns {object} Entidades extraídas
   */
  extractEntities(message, intention) {
    const entities = {
      type: null,
      target: null,
      filters: [],
      actions: []
    };

    // Buscar tipo de entidad
    const intentPattern = this.intentPatterns[intention];
    if (intentPattern) {
      for (const entity of intentPattern.entities) {
        if (message.includes(entity)) {
          entities.type = entity;
          break;
        }
      }
    }

    // Buscar sinónimos
    if (!entities.type) {
      for (const [canonical, synonyms] of Object.entries(this.synonyms)) {
        if (synonyms.some(syn => message.includes(syn))) {
          entities.type = canonical;
          break;
        }
      }
    }

    // Extraer nombre/identificador
    const nameMatch = message.match(/(?:llamad[ao]|nombr[ao]|id|identificador|rut|email|teléfono)\s+([a-záéíóú0-9\s\-\.@]+)/i);
    if (nameMatch) {
      entities.target = nameMatch[1].trim();
    }

    // Extraer filtros
    entities.filters = this.extractFilters(message);

    return entities;
  }

  /**
   * Extrae filtros del mensaje
   * @param {string} message - Mensaje normalizado
   * @returns {array} Filtros extraídos
   */
  extractFilters(message) {
    const filters = [];

    // Patrones de filtros comunes
    const filterPatterns = [
      { pattern: /de\s+([a-záéíóú\s]+)/i, type: 'location' },
      { pattern: /en\s+estado\s+([a-záéíóú\s]+)/i, type: 'status' },
      { pattern: /con\s+([a-záéíóú\s]+)/i, type: 'condition' },
      { pattern: /mayor\s+a\s+\$?([\d.,]+)/i, type: 'min_amount' },
      { pattern: /menor\s+a\s+\$?([\d.,]+)/i, type: 'max_amount' },
      { pattern: /entre\s+\$?([\d.,]+)\s+y\s+\$?([\d.,]+)/i, type: 'amount_range' }
    ];

    for (const { pattern, type } of filterPatterns) {
      const match = message.match(pattern);
      if (match) {
        filters.push({
          type,
          value: match[1],
          raw: match[0]
        });
      }
    }

    return filters;
  }

  /**
   * Extrae valores específicos del mensaje
   * @param {string} message - Mensaje original
   * @returns {object} Valores extraídos
   */
  extractValues(message) {
    const values = {};

    for (const [type, pattern] of Object.entries(this.valuePatterns)) {
      const matches = message.match(pattern);
      if (matches) {
        values[type] = matches.map(m => m.replace(/[^\d.,]/g, ''));
      }
    }

    return values;
  }

  /**
   * Valida la intención y entidades
   * @param {string} intention - Intención a validar
   * @param {object} entities - Entidades a validar
   * @returns {object} Resultado de validación
   */
  validateIntention(intention, entities) {
    const validation = {
      valid: true,
      message: '',
      suggestions: []
    };

    // Validar que se detectó una intención
    if (intention === 'UNKNOWN') {
      validation.valid = false;
      validation.message = 'No pude entender tu instrucción. ¿Puedes ser más específico?';
      validation.suggestions = [
        'Ejemplo: "Crea un cliente llamado TechCorp"',
        'Ejemplo: "Busca órdenes en estado producción"',
        'Ejemplo: "Genera reporte de campañas"'
      ];
      return validation;
    }

    // Validar que se detectó una entidad
    if (!entities.type && ['CREATE', 'READ', 'UPDATE', 'DELETE'].includes(intention)) {
      validation.valid = false;
      validation.message = 'Necesito saber qué tipo de elemento quieres ' + intention.toLowerCase();
      validation.suggestions = [
        'Clientes, Proveedores, Medios, Soportes, Campañas, Órdenes, Contratos, Agencias'
      ];
      return validation;
    }

    // Validar que se proporcionó un identificador para UPDATE/DELETE
    if (['UPDATE', 'DELETE'].includes(intention) && !entities.target) {
      validation.valid = false;
      validation.message = 'Necesito saber cuál es el elemento que quieres ' + intention.toLowerCase();
      validation.suggestions = [
        'Proporciona el nombre, ID o RUT del elemento'
      ];
      return validation;
    }

    validation.message = `Entendí que quieres ${intention.toLowerCase()} un ${entities.type || 'elemento'}`;
    return validation;
  }

  /**
   * Calcula la confianza de la extracción
   * @param {string} intention - Intención detectada
   * @param {object} entities - Entidades extraídas
   * @param {object} values - Valores extraídos
   * @returns {number} Confianza (0-100)
   */
  calculateConfidence(intention, entities, values) {
    let confidence = 50; // Base

    // Aumentar confianza si se detectó intención clara
    if (intention !== 'UNKNOWN') confidence += 20;

    // Aumentar confianza si se detectó entidad
    if (entities.type) confidence += 15;

    // Aumentar confianza si se detectó identificador
    if (entities.target) confidence += 10;

    // Aumentar confianza si se detectaron valores
    if (Object.keys(values).length > 0) confidence += 5;

    return Math.min(confidence, 100);
  }

  /**
   * Obtiene sugerencias contextuales
   * @param {string} topic - Tema para el cual obtener sugerencias
   * @returns {array} Sugerencias
   */
  getContextualHelp(topic) {
    const helpTopics = {
      clientes: [
        '✅ "Crea un cliente llamado TechCorp con RUT 12.345.678-9"',
        '✅ "Busca clientes de Santiago"',
        '✅ "Actualiza el teléfono del cliente ABC"',
        '✅ "Desactiva clientes sin órdenes"'
      ],
      proveedores: [
        '✅ "Agrega proveedor de TV llamado Canal 13"',
        '✅ "Busca proveedores de radio"',
        '✅ "Actualiza condiciones de pago"',
        '✅ "Genera reporte de proveedores"'
      ],
      campañas: [
        '✅ "Crea campaña para Cliente ABC"',
        '✅ "Busca campañas en estado borrador"',
        '✅ "Cambia estado de campaña a aprobada"',
        '✅ "Calcula presupuesto total"'
      ],
      órdenes: [
        '✅ "Crea orden para Cliente XYZ por $1.000.000"',
        '✅ "Busca órdenes en producción"',
        '✅ "Actualiza estado de orden"',
        '✅ "Genera PDF de orden"'
      ],
      reportes: [
        '✅ "Genera reporte de inversión por cliente"',
        '✅ "Muéstrame el rendimiento de medios"',
        '✅ "Calcula comisiones por proveedor"',
        '✅ "Análisis de rentabilidad"'
      ]
    };

    return helpTopics[topic.toLowerCase()] || helpTopics.clientes;
  }

  /**
   * Obtiene el historial de conversación
   * @returns {array} Historial
   */
  getConversationHistory() {
    return this.conversationHistory;
  }

  /**
   * Limpia el historial de conversación
   */
  clearConversationHistory() {
    this.conversationHistory = [];
    this.currentContext = {};
  }

  /**
   * Obtiene el contexto actual
   * @returns {object} Contexto
   */
  getCurrentContext() {
    return this.currentContext;
  }

  /**
   * Actualiza el contexto
   * @param {object} newContext - Nuevo contexto
   */
  updateContext(newContext) {
    this.currentContext = { ...this.currentContext, ...newContext };
  }
}

// Exportar como singleton
const aiExecutiveService = new AIExecutiveService();
export { aiExecutiveService };
export default aiExecutiveService;
