/**
 * 🧠 AI Learning Service - PautaPro
 * 
 * Servicio de aprendizaje automático continuo para el Asistente IA
 * Responsabilidades:
 * - Aprendizaje adaptativo de patrones de usuario
 * - Actualización automática de base de conocimiento
 * - Análisis de dominio publicitario externo
 * - Mejora continua de respuestas
 * - Detección de tendencias y patrones
 */

class AILearningService {
  constructor() {
    this.learningData = {
      userPatterns: new Map(),
      responseFeedback: new Map(),
      domainKnowledge: new Map(),
      interactionHistory: [],
      performanceMetrics: {
        accuracy: 0,
        userSatisfaction: 0,
        responseTime: 0,
        learningRate: 0.1
      }
    };
    
    this.baseConocimientoPublicitario = this.inicializarBaseConocimientoPublicitario();
    this.learningConfig = {
      enabled: true,
      autoUpdate: true,
      feedbackThreshold: 5,
      learningInterval: 24 * 60 * 60 * 1000, // 24 horas
      maxHistorySize: 1000
    };
    
    this.startContinuousLearning();
  }

  /**
   * Inicializa base de conocimiento del dominio publicitario
   */
  inicializarBaseConocimientoPublicitario() {
    return {
      terminosPublicitarios: {
        // Métricas y KPIs
        'reach': {
          definicion: 'Alcance - Número de personas únicas expuestas a un anuncio',
          formula: 'Reach = Impresiones únicas',
          unidad: 'personas',
          contexto: 'métrica fundamental para evaluar cobertura'
        },
        'frequency': {
          definicion: 'Frecuencia - Número de veces que una persona ve el anuncio',
          formula: 'Frequency = Impresiones totales / Reach',
          unidad: 'veces',
          contexto: 'métrica de intensidad de campaña'
        },
        'ctr': {
          definicion: 'Click-Through Rate - Porcentaje de clics sobre impresiones',
          formula: 'CTR = (Clics / Impresiones) × 100',
          unidad: '%',
          contexto: 'métrica de efectividad de anuncios'
        },
        'cpc': {
          definicion: 'Cost Per Click - Costo por cada clic obtenido',
          formula: 'CPC = Costo total / Clics',
          unidad: '$',
          contexto: 'métrica de eficiencia de costo'
        },
        'cpm': {
          definicion: 'Cost Per Mille - Costo por 1000 impresiones',
          formula: 'CPM = (Costo total / Impresiones) × 1000',
          unidad: '$',
          contexto: 'métrica de costo de cobertura'
        },
        'roas': {
          definicion: 'Return On Ad Spend - Retorno sobre inversión publicitaria',
          formula: 'ROAS = (Ingresos - Costo) / Costo',
          unidad: 'ratio',
          contexto: 'métrica de rentabilidad'
        }
      },
      
      tiposMedios: {
        'tv': {
          caracteristicas: ['masivo', 'audiovisual', 'alta cobertura', 'costo elevado'],
          ventajas: ['alcance masivo', 'impacto emocional', 'credibilidad'],
          desventajas: ['costo alto', 'difícil medición exacta'],
          kpisTipicos: ['reach', 'frequency', 'grps', 'trp'],
          formatos: ['comercial 30s', 'programa patrocinado', 'infomercial']
        },
        'radio': {
          caracteristicas: ['audio', 'segmentación por demographics', 'costo medio'],
          ventajas: ['targeting preciso', 'costo efectivo', 'alta frecuencia'],
          desventajas: ['solo audio', 'sin impacto visual'],
          kpisTipicos: ['reach', 'frequency', 'cume', 'share'],
          formatos: ['spot 30s', 'programa patrocinado', 'jingle']
        },
        'prensa': {
          caracteristicas: ['impreso', 'credibilidad', 'lector específico', 'vida útil corta'],
          ventajas: ['credibilidad alta', 'lectura detallada', 'permanencia'],
          desventajas: ['alcance limitado', 'sin elementos multimedia'],
          kpisTipicos: ['circulación', 'readership', 'engagement'],
          formatos: 'página completa, 1/4 página, clasificados'
        },
        'digital': {
          caracteristicas: ['interactivo', 'medible', 'segmentable', 'costo variable'],
          ventajas: ['targeting preciso', 'medición en tiempo real', 'optimizable'],
          desventajas: ['ad blindness', 'fraude clics', 'saturación'],
          kpisTipicos: ['clicks', 'conversions', 'ctr', 'cpa'],
          formatos: ['display ads', 'video ads', 'social media', 'search']
        }
      },
      
      estrategiasCampaña: {
        'awareness': {
          objetivo: 'Generar conocimiento de marca',
          kpisFoco: ['reach', 'frequency', 'brand lift'],
          canalesRecomendados: ['tv', 'radio', 'digital display'],
          mensaje: 'enfocado en branding y storytelling'
        },
        'consideration': {
          objetivo: 'Generar interés y consideración',
          kpisFoco: ['engagement', 'clics', 'tiempo en sitio'],
          canalesRecomendados: ['digital', 'social media', 'content marketing'],
          mensaje: 'enfocado en beneficios y diferenciadores'
        },
        'conversion': {
          objetivo: 'Generar acciones y ventas',
          kpisFoco: ['conversiones', 'cpa', 'roas'],
          canalesRecomendados: ['search', 'performance marketing', 'retargeting'],
          mensaje: 'enfocado en llamada a la acción y ofertas'
        },
        'retention': {
          objetivo: 'Mantener clientes existentes',
          kpisFoco: ['retention rate', 'ltv', 'repeat purchases'],
          canalesRecomendados: ['email marketing', 'crm', 'loyalty programs'],
          mensaje: 'enfocado en relación y valor agregado'
        }
      },
      
      tendenciasPublicitarias: {
        '2024': {
          'programmatic': 'Publicidad programática y automatizada',
          'video_short': 'Contenido de video corto (TikTok, Reels)',
          'influencer': 'Marketing de influencers',
          'privacy_first': 'Publicidad respetuosa de la privacidad',
          'ai_driven': 'Publicidad impulsada por IA',
          'sustainability': 'Mensajes de sostenibilidad',
          'shoppable_media': 'Contenido comprable directamente'
        },
        'best_practices': {
          'mobile_first': 'Diseño prioritario para móviles',
          'data_driven': 'Decisiones basadas en datos',
          'personalization': 'Personalización masiva',
          'omnichannel': 'Experiencia integrada multicanal',
          'attribution': 'Modelos de atribución avanzados'
        }
      }
    };
  }

  /**
   * Inicia el aprendizaje continuo
   */
  startContinuousLearning() {
    if (!this.learningConfig.enabled) return;

    // Actualización automática de conocimiento
    setInterval(() => {
      if (this.learningConfig.autoUpdate) {
        this.performKnowledgeUpdate();
      }
    }, this.learningConfig.learningInterval);

    // Análisis de patrones de usuario
    setInterval(() => {
      this.analyzeUserPatterns();
    }, this.learningConfig.learningInterval / 4);

    console.log('🧠 Sistema de aprendizaje automático iniciado');
  }

  /**
   * Registra interacción para aprendizaje
   */
  async registerInteraction(userMessage, aiResponse, userFeedback = null, metadata = {}) {
    const interaction = {
      timestamp: new Date(),
      userMessage,
      aiResponse,
      userFeedback,
      metadata,
      context: this.extractContext(userMessage),
      intent: this.detectIntent(userMessage),
      entities: this.extractEntities(userMessage)
    };

    // Agregar al historial
    this.learningData.interactionHistory.push(interaction);
    
    // Mantener tamaño del historial
    if (this.learningData.interactionHistory.length > this.learningConfig.maxHistorySize) {
      this.learningData.interactionHistory.shift();
    }

    // Aprender de la interacción
    await this.learnFromInteraction(interaction);

    // Actualizar patrones de usuario
    this.updateUserPatterns(interaction);

    return interaction;
  }

  /**
   * Aprende de una interacción específica
   */
  async learnFromInteraction(interaction) {
    try {
      // 1. Aprender de feedback del usuario
      if (interaction.userFeedback) {
        this.learnFromFeedback(interaction);
      }

      // 2. Mejorar patrones de respuesta
      this.improveResponsePatterns(interaction);

      // 3. Actualizar conocimiento del dominio
      this.updateDomainKnowledge(interaction);

      // 4. Optimizar métricas de rendimiento
      this.updatePerformanceMetrics(interaction);

    } catch (error) {
      console.error('Error en aprendizaje de interacción:', error);
    }
  }

  /**
   * Aprende del feedback del usuario
   */
  learnFromFeedback(interaction) {
    const feedback = interaction.userFeedback;
    const context = interaction.context;

    // Crear clave para el patrón de respuesta
    const patternKey = this.generatePatternKey(interaction);

    // Obtener feedback existente o crear nuevo
    let feedbackData = this.learningData.responseFeedback.get(patternKey) || {
      positive: 0,
      negative: 0,
      improvements: [],
      lastUpdated: new Date()
    };

    // Actualizar contadores
    if (feedback.type === 'positive') {
      feedbackData.positive++;
    } else if (feedback.type === 'negative') {
      feedbackData.negative++;
      
      // Guardar sugerencias de mejora
      if (feedback.suggestions) {
        feedbackData.improvements.push(...feedback.suggestions);
      }
    }

    feedbackData.lastUpdated = new Date();
    this.learningData.responseFeedback.set(patternKey, feedbackData);
  }

  /**
   * Mejora patrones de respuesta basados en feedback
   */
  improveResponsePatterns(interaction) {
    const patternKey = this.generatePatternKey(interaction);
    const feedbackData = this.learningData.responseFeedback.get(patternKey);

    if (!feedbackData || feedbackData.positive <= feedbackData.negative) {
      // Si hay más feedback negativo, generar mejoras
      this.generateResponseImprovements(interaction, feedbackData);
    }
  }

  /**
   * Genera mejoras para respuestas
   */
  generateResponseImprovements(interaction, feedbackData) {
    const improvements = [];

    // Analizar feedback negativo común
    if (feedbackData.negative > 2) {
      improvements.push({
        type: 'structure',
        suggestion: 'Reestructurar respuesta para mayor claridad',
        confidence: 0.8
      });
    }

    // Analizar sugerencias de usuarios
    if (feedbackData.improvements.length > 0) {
      const commonImprovements = this.findCommonImprovements(feedbackData.improvements);
      if (commonImprovements) {
        improvements.push({
          type: 'content',
          suggestion: commonImprovements,
          confidence: 0.9
        });
      }
    }

    // Guardar mejoras sugeridas
    this.learningData.userPatterns.set(patternKey, {
      improvements,
      lastAnalyzed: new Date(),
      priority: this.calculateImprovementPriority(feedbackData)
    });
  }

  /**
   * Actualiza conocimiento del dominio publicitario
   */
  updateDomainKnowledge(interaction) {
    // Detectar nuevos términos o conceptos
    const newTerms = this.detectNewTerms(interaction);
    
    newTerms.forEach(term => {
      if (!this.baseConocimientoPublicitario.terminosPublicitarios[term]) {
        // Solicitar definición al usuario o inferir del contexto
        this.requestTermDefinition(term, interaction.context);
      }
    });

    // Actualizar tendencias basadas en interacciones recientes
    this.updateTrends(interaction);
  }

  /**
   * Detecta nuevos términos en las interacciones
   */
  detectNewTerms(interaction) {
    const knownTerms = Object.keys(this.baseConocimientoPublicitario.terminosPublicitarios);
    const messageTerms = this.extractTerms(interaction.userMessage);
    const responseTerms = this.extractTerms(interaction.aiResponse);

    const allTerms = [...messageTerms, ...responseTerms];
    const newTerms = allTerms.filter(term => 
      !knownTerms.includes(term.toLowerCase()) && 
      term.length > 3 // Ignorar términos muy cortos
    );

    return newTerms;
  }

  /**
   * Extrae términos de un texto
   */
  extractTerms(text) {
    // Extraer términos técnicos y de negocio
    const technicalTerms = text.match(/\b(audience|reach|frequency|ctr|cpc|cpm|roas|impressions|clicks|conversions|engagement|targeting|segmentation)\b/gi) || [];
    const businessTerms = text.match(/\b(campaña|cliente|proveedor|medio|presupuesto|inversión|rentabilidad|métricas|kpi|dashboard)\b/gi) || [];
    
    return [...new Set([...technicalTerms, ...businessTerms])];
  }

  /**
   * Solicita definición de un nuevo término
   */
  async requestTermDefinition(term, context) {
    // En una implementación real, esto podría:
    // 1. Buscar en APIs externas
    // 2. Preguntar al usuario
    // 3. Inferir del contexto
    
    const definition = {
      term,
      context,
      requestedAt: new Date(),
      status: 'pending'
    };

    this.learningData.domainKnowledge.set(term, definition);
    
    console.log(`📚 Nuevo término detectado: "${term}" - Contexto: ${context}`);
  }

  /**
   * Realiza actualización automática de conocimiento
   */
  async performKnowledgeUpdate() {
    try {
      console.log('🔄 Iniciando actualización automática de conocimiento...');

      // 1. Analizar tendencias recientes
      await this.analyzeTrends();

      // 2. Optimizar patrones de usuario
      await this.optimizeUserPatterns();

      // 3. Actualizar métricas de aprendizaje
      this.updateLearningMetrics();

      // 4. Limpiar datos obsoletos
      this.cleanupOldData();

      console.log('✅ Actualización de conocimiento completada');
    } catch (error) {
      console.error('❌ Error en actualización de conocimiento:', error);
    }
  }

  /**
   * Analiza tendencias en las interacciones
   */
  async analyzeTrends() {
    const recentInteractions = this.learningData.interactionHistory.slice(-100);
    
    // Detectar patrones emergentes
    const emergingPatterns = this.detectEmergingPatterns(recentInteractions);
    
    // Actualizar base de conocimiento con tendencias
    emergingPatterns.forEach(pattern => {
      this.updateTrendKnowledge(pattern);
    });
  }

  /**
   * Detecta patrones emergentes
   */
  detectEmergingPatterns(interactions) {
    const patterns = [];
    
    // Analizar frecuencia de términos
    const termFrequency = this.calculateTermFrequency(interactions);
    
    // Detectar términos en aumento
    const increasingTerms = Object.entries(termFrequency)
      .filter(([term, data]) => data.trend === 'increasing')
      .map(([term]) => term);

    patterns.push({
      type: 'increasing_terms',
      data: increasingTerms,
      confidence: this.calculatePatternConfidence(increasingTerms)
    });

    return patterns;
  }

  /**
   * Calcula frecuencia de términos
   */
  calculateTermFrequency(interactions) {
    const frequency = {};
    
    interactions.forEach(interaction => {
      const terms = this.extractTerms(interaction.userMessage);
      terms.forEach(term => {
        if (!frequency[term]) {
          frequency[term] = {
            count: 0,
            trend: 'stable',
            firstSeen: interaction.timestamp,
            lastSeen: interaction.timestamp
          };
        }
        frequency[term].count++;
        frequency[term].lastSeen = interaction.timestamp;
      });
    });

    // Calcular tendencias
    Object.keys(frequency).forEach(term => {
      const data = frequency[term];
      const timeSpan = data.lastSeen - data.firstSeen;
      const avgFrequency = data.count / (timeSpan / (1000 * 60 * 60 * 24)); // por día
      
      if (avgFrequency > 1) {
        data.trend = 'increasing';
      } else if (avgFrequency < 0.1) {
        data.trend = 'decreasing';
      }
    });

    return frequency;
  }

  /**
   * Actualiza conocimiento de tendencias
   */
  updateTrendKnowledge(pattern) {
    const trendInfo = {
      pattern: pattern.type,
      data: pattern.data,
      detectedAt: new Date(),
      confidence: pattern.confidence
    };

    this.learningData.domainKnowledge.set(`trend_${pattern.type}`, trendInfo);
  }

  /**
   * Analiza patrones de usuario
   */
  analyzeUserPatterns() {
    const recentInteractions = this.learningData.interactionHistory.slice(-50);
    
    // Agrupar por tipo de intención
    const intentPatterns = this.groupByIntent(recentInteractions);
    
    // Identificar patrones de comportamiento
    Object.entries(intentPatterns).forEach(([intent, interactions]) => {
      const pattern = this.analyzeBehaviorPattern(interactions);
      this.learningData.userPatterns.set(`pattern_${intent}`, pattern);
    });
  }

  /**
   * Agrupa interacciones por intención
   */
  groupByIntent(interactions) {
    const grouped = {};
    
    interactions.forEach(interaction => {
      const intent = interaction.intent || 'unknown';
      if (!grouped[intent]) {
        grouped[intent] = [];
      }
      grouped[intent].push(interaction);
    });

    return grouped;
  }

  /**
   * Analiza patrón de comportamiento
   */
  analyzeBehaviorPattern(interactions) {
    const pattern = {
      intent: interactions[0]?.intent,
      frequency: interactions.length,
      avgResponseTime: this.calculateAvgResponseTime(interactions),
      commonEntities: this.findCommonEntities(interactions),
      successRate: this.calculateSuccessRate(interactions),
      preferences: this.detectPreferences(interactions)
    };

    return pattern;
  }

  /**
   * Optimiza patrones de usuario
   */
  async optimizeUserPatterns() {
    const patterns = Array.from(this.learningData.userPatterns.entries());
    
    patterns.forEach(([key, pattern]) => {
      if (pattern.improvements && pattern.improvements.length > 0) {
        // Implementar mejoras sugeridas
        this.applyPatternImprovements(key, pattern);
      }
    });
  }

  /**
   * Aplica mejoras a patrones
   */
  applyPatternImprovements(patternKey, pattern) {
    console.log(`🔧 Aplicando mejoras al patrón: ${patternKey}`);
    
    // En una implementación real, esto modificaría
    // los servicios de IA para usar los patrones mejorados
  }

  /**
   * Actualiza métricas de aprendizaje
   */
  updateLearningMetrics() {
    const totalInteractions = this.learningData.interactionHistory.length;
    const recentInteractions = this.learningData.interactionHistory.slice(-100);
    
    if (totalInteractions > 0) {
      // Calcular precisión basada en feedback positivo
      const positiveFeedback = Array.from(this.learningData.responseFeedback.values())
        .filter(f => f.positive > f.negative).length;
      
      this.learningData.performanceMetrics.accuracy = (positiveFeedback / this.learningData.responseFeedback.size) * 100;
      
      // Calcular satisfacción del usuario
      const recentPositiveFeedback = recentInteractions
        .filter(i => i.userFeedback && i.userFeedback.type === 'positive').length;
      
      this.learningData.performanceMetrics.userSatisfaction = (recentPositiveFeedback / recentInteractions.length) * 100;
      
      // Calcular tasa de aprendizaje
      this.learningData.performanceMetrics.learningRate = this.calculateLearningRate();
    }
  }

  /**
   * Calcula tasa de aprendizaje
   */
  calculateLearningRate() {
    const recentMetrics = this.learningData.performanceMetrics;
    const improvement = (recentMetrics.accuracy + recentMetrics.userSatisfaction) / 2;
    
    return improvement / 100; // Normalizar a 0-1
  }

  /**
   * Limpia datos obsoletos
   */
  cleanupOldData() {
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
    const cutoffDate = new Date(Date.now() - maxAge);
    
    // Limpiar interacciones antiguas
    this.learningData.interactionHistory = this.learningData.interactionHistory.filter(
      interaction => interaction.timestamp > cutoffDate
    );
    
    // Limpiar feedback antiguo
    for (const [key, feedback] of this.learningData.responseFeedback.entries()) {
      if (feedback.lastUpdated < cutoffDate) {
        this.learningData.responseFeedback.delete(key);
      }
    }
  }

  /**
   * Obtiene término de conocimiento publicitario
   */
  getDomainTerm(term) {
    return this.baseConocimientoPublicitario.terminosPublicitarios[term.toLowerCase()] ||
           this.baseConocimientoPublicitario.tiposMedios[term.toLowerCase()] ||
           this.baseConocimientoPublicitario.estrategiasCampaña[term.toLowerCase()];
  }

  /**
   * Busca términos relacionados
   */
  findRelatedTerms(term) {
    const related = [];
    
    // Buscar en todas las categorías
    const categories = [
      this.baseConocimientoPublicitario.terminosPublicitarios,
      this.baseConocimientoPublicitario.tiposMedios,
      this.baseConocimientoPublicitario.estrategiasCampaña
    ];
    
    categories.forEach(category => {
      Object.keys(category).forEach(key => {
        if (key.toLowerCase().includes(term.toLowerCase()) || 
            term.toLowerCase().includes(key.toLowerCase())) {
          related.push({
            term: key,
            category: this.getCategoryName(category, key),
            data: category[key]
          });
        }
      });
    });
    
    return related;
  }

  /**
   * Obtiene nombre de categoría
   */
  getCategoryName(category, key) {
    if (category === this.baseConocimientoPublicitario.terminosPublicitarios) return 'terminos';
    if (category === this.baseConocimientoPublicitario.tiposMedios) return 'medios';
    if (category === this.baseConocimientoPublicitario.estrategiasCampaña) return 'estrategias';
    return 'desconocido';
  }

  /**
   * Genera clave para patrón de respuesta
   */
  generatePatternKey(interaction) {
    const intent = interaction.intent || 'unknown';
    const entities = interaction.entities.slice(0, 2).join('_');
    const context = interaction.context.slice(0, 3).join('_');
    
    return `${intent}_${entities}_${context}`;
  }

  /**
   * Extrae contexto del mensaje
   */
  extractContext(message) {
    // Extraer palabras clave relevantes
    const keywords = message.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 5);
    
    return keywords;
  }

  /**
   * Detecta intención del mensaje
   */
  detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('crear') || lowerMessage.includes('nuevo')) return 'create';
    if (lowerMessage.includes('buscar') || lowerMessage.includes('muestra')) return 'read';
    if (lowerMessage.includes('actualizar') || lowerMessage.includes('modificar')) return 'update';
    if (lowerMessage.includes('eliminar') || lowerMessage.includes('borrar')) return 'delete';
    if (lowerMessage.includes('reporte') || lowerMessage.includes('análisis')) return 'report';
    if (lowerMessage.includes('ayuda') || lowerMessage.includes('cómo')) return 'help';
    
    return 'unknown';
  }

  /**
   * Extrae entidades del mensaje
   */
  extractEntities(message) {
    const entities = [];
    const knownEntities = ['cliente', 'proveedor', 'medio', 'campaña', 'orden', 'contrato'];
    
    knownEntities.forEach(entity => {
      if (message.toLowerCase().includes(entity)) {
        entities.push(entity);
      }
    });
    
    return entities;
  }

  /**
   * Obtiene métricas de aprendizaje
   */
  getLearningMetrics() {
    return {
      ...this.learningData.performanceMetrics,
      totalInteractions: this.learningData.interactionHistory.length,
      knownPatterns: this.learningData.userPatterns.size,
      feedbackEntries: this.learningData.responseFeedback.size,
      domainKnowledge: this.learningData.domainKnowledge.size,
      lastUpdate: new Date()
    };
  }

  /**
   * Exporta datos de aprendizaje
   */
  exportLearningData() {
    return {
      learningData: this.learningData,
      baseConocimiento: this.baseConocimientoPublicitario,
      config: this.learningConfig,
      exportedAt: new Date()
    };
  }

  /**
   * Importa datos de aprendizaje
   */
  importLearningData(data) {
    if (data.learningData) {
      this.learningData = { ...this.learningData, ...data.learningData };
    }
    if (data.baseConocimiento) {
      this.baseConocimientoPublicitario = { ...this.baseConocimientoPublicitario, ...data.baseConocimiento };
    }
    if (data.config) {
      this.learningConfig = { ...this.learningConfig, ...data.config };
    }
    
    console.log('📥 Datos de aprendizaje importados exitosamente');
  }
}

// Exportar como singleton
const aiLearningService = new AILearningService();
export { aiLearningService };
export default aiLearningService;