/**
 * 🔄 AI Feedback Service - PautaPro
 * 
 * Servicio de retroalimentación y aprendizaje adaptativo para el Asistente IA
 * Responsabilidades:
 * - Recopilar feedback del usuario
 * - Analizar patrones de satisfacción
 * - Adaptar respuestas basadas en feedback
 * - Mejorar continuamente el modelo
 * - Generar insights de mejora
 */

import { supabaseAIService } from './supabaseAIService.js';
import { aiLearningService } from './aiLearningService.js';

class AIFeedbackService {
  constructor() {
    this.feedbackData = {
      userFeedback: new Map(),
      responsePatterns: new Map(),
      satisfactionMetrics: {
        overall: 0,
        byIntent: new Map(),
        byCategory: new Map(),
        byTimeOfDay: new Map()
      },
      improvementSuggestions: [],
      adaptationHistory: []
    };

    this.feedbackConfig = {
      enabled: true,
      autoAdapt: true,
      feedbackThreshold: 5,
      adaptationThreshold: 0.7,
      maxHistorySize: 1000,
      analysisInterval: 60 * 60 * 1000 // 1 hora
    };

    this.feedbackTypes = {
      explicit: ['thumbs_up', 'thumbs_down', 'star_rating', 'comment'],
      implicit: ['response_time', 'follow_up_questions', 'task_completion', 'repeat_queries'],
      behavioral: ['session_duration', 'feature_usage', 'navigation_patterns']
    };

    this.adaptationStrategies = {
      response_improvement: 'Improve response structure and content',
      pattern_adjustment: 'Adjust response patterns based on feedback',
      knowledge_enhancement: 'Enhance knowledge base with new information',
      flow_optimization: 'Optimize conversation flow and user experience'
    };

    this.initializeFeedbackService();
    this.startFeedbackAnalysis();
  }

  /**
   * Inicializa el servicio de feedback
   */
  async initializeFeedbackService() {
    try {
      console.log('🔄 Inicializando servicio de feedback...');

      // 1. Cargar feedback histórico
      await this.loadHistoricalFeedback();

      // 2. Inicializar métricas
      this.initializeMetrics();

      // 3. Configurar patrones de respuesta
      this.setupResponsePatterns();

      // 4. Sincronizar con Supabase
      await this.syncWithSupabase();

      console.log('✅ Servicio de feedback inicializado');
    } catch (error) {
      console.error('❌ Error inicializando servicio de feedback:', error);
    }
  }

  /**
   * Carga feedback histórico
   */
  async loadHistoricalFeedback() {
    try {
      const { data: feedback, error } = await supabaseAIService.query(
        'ai_feedback',
        '*',
        { order: 'created_at', ascending: false },
        { limit: 500 }
      );

      if (error) throw error;

      feedback.forEach(item => {
        this.feedbackData.userFeedback.set(item.id, {
          ...item,
          processed: false
        });
      });

      console.log(`📊 Cargados ${feedback.length} registros de feedback histórico`);
    } catch (error) {
      console.error('Error cargando feedback histórico:', error);
    }
  }

  /**
   * Inicializa métricas
   */
  initializeMetrics() {
    // Inicializar métricas por intención
    const intents = ['create', 'read', 'update', 'delete', 'report', 'help'];
    intents.forEach(intent => {
      this.feedbackData.satisfactionMetrics.byIntent.set(intent, {
        positive: 0,
        negative: 0,
        neutral: 0,
        score: 0
      });
    });

    // Inicializar métricas por categoría
    const categories = ['cliente', 'proveedor', 'medio', 'campaña', 'orden', 'reporte'];
    categories.forEach(category => {
      this.feedbackData.satisfactionMetrics.byCategory.set(category, {
        positive: 0,
        negative: 0,
        neutral: 0,
        score: 0
      });
    });

    // Inicializar métricas por hora del día
    for (let hour = 0; hour < 24; hour++) {
      this.feedbackData.satisfactionMetrics.byTimeOfDay.set(hour, {
        positive: 0,
        negative: 0,
        neutral: 0,
        score: 0
      });
    }
  }

  /**
   * Configura patrones de respuesta
   */
  setupResponsePatterns() {
    const defaultPatterns = {
      greeting: {
        pattern: /hola|buenos|buenas|hey/i,
        responses: ['¡Hola! ¿En qué puedo ayudarte?', '¡Buenos días! ¿Qué necesitas?', '¡Hola! ¿Cómo asistirte?'],
        success_rate: 0.8
      },
      help_request: {
        pattern: /ayuda|cómo|help|necesito/i,
        responses: ['Claro, te ayudo con eso...', 'Por supuesto, aquí está la ayuda...', 'Te asisto con lo que necesitas...'],
        success_rate: 0.7
      },
      creation: {
        pattern: /crear|nuevo|agregar|registrar/i,
        responses: ['Voy a crear eso para ti...', 'Procedo a registrar...', 'Creando nuevo elemento...'],
        success_rate: 0.9
      },
      search: {
        pattern: /buscar|mostrar|ver|listar/i,
        responses: ['Buscando la información...', 'Aquí está lo que encontré...', 'Mostrando resultados...'],
        success_rate: 0.8
      }
    };

    Object.entries(defaultPatterns).forEach(([key, pattern]) => {
      this.feedbackData.responsePatterns.set(key, {
        ...pattern,
        feedback_count: 0,
        adaptations: []
      });
    });
  }

  /**
   * Sincroniza con Supabase
   */
  async syncWithSupabase() {
    try {
      // Obtener adaptaciones previas
      const { data: adaptations, error } = await supabaseAIService.query(
        'ai_adaptations',
        '*',
        { order: 'created_at', ascending: false }
      );

      if (error) throw error;

      this.feedbackData.adaptationHistory = adaptations || [];
      console.log(`📊 Sincronizadas ${adaptations.length} adaptaciones previas`);
    } catch (error) {
      console.error('Error sincronizando con Supabase:', error);
    }
  }

  /**
   * Inicia análisis de feedback
   */
  startFeedbackAnalysis() {
    if (!this.feedbackConfig.enabled) return;

    setInterval(async () => {
      await this.performFeedbackAnalysis();
    }, this.feedbackConfig.analysisInterval);

    console.log('🔄 Análisis de feedback iniciado');
  }

  /**
   * Registra feedback explícito del usuario
   */
  async registerExplicitFeedback(interactionId, feedback, metadata = {}) {
    try {
      const feedbackEntry = {
        id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        interaction_id: interactionId,
        type: 'explicit',
        feedback_type: feedback.type, // thumbs_up, thumbs_down, star_rating, comment
        value: feedback.value, // 1-5 estrellas, true/false, texto
        comment: feedback.comment || '',
        metadata: {
          ...metadata,
          timestamp: new Date(),
          user_context: this.getUserContext()
        },
        created_at: new Date(),
        processed: false
      };

      // Guardar en memoria
      this.feedbackData.userFeedback.set(feedbackEntry.id, feedbackEntry);

      // Guardar en Supabase
      await supabaseAIService.insert('ai_feedback', feedbackEntry);

      // Procesar feedback inmediatamente si es crítico
      if (this.isCriticalFeedback(feedback)) {
        await this.processFeedback(feedbackEntry);
      }

      console.log(`📝 Feedback registrado: ${feedback.type} - ${feedback.value}`);
      return feedbackEntry;
    } catch (error) {
      console.error('Error registrando feedback:', error);
      throw error;
    }
  }

  /**
   * Registra feedback implícito
   */
  async registerImplicitFeedback(interactionId, feedbackType, value, metadata = {}) {
    try {
      const feedbackEntry = {
        id: `implicit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        interaction_id: interactionId,
        type: 'implicit',
        feedback_type: feedbackType, // response_time, follow_up, completion, repeat
        value: value,
        metadata: {
          ...metadata,
          timestamp: new Date(),
          user_context: this.getUserContext()
        },
        created_at: new Date(),
        processed: false
      };

      this.feedbackData.userFeedback.set(feedbackEntry.id, feedbackEntry);
      await supabaseAIService.insert('ai_feedback', feedbackEntry);

      return feedbackEntry;
    } catch (error) {
      console.error('Error registrando feedback implícito:', error);
    }
  }

  /**
   * Registra feedback comportamental
   */
  async registerBehavioralFeedback(sessionData, metadata = {}) {
    try {
      const feedbackEntry = {
        id: `behavioral_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'behavioral',
        session_data: sessionData,
        metadata: {
          ...metadata,
          timestamp: new Date(),
          user_context: this.getUserContext()
        },
        created_at: new Date(),
        processed: false
      };

      this.feedbackData.userFeedback.set(feedbackEntry.id, feedbackEntry);
      await supabaseAIService.insert('ai_feedback', feedbackEntry);

      return feedbackEntry;
    } catch (error) {
      console.error('Error registrando feedback comportamental:', error);
    }
  }

  /**
   * Determina si el feedback es crítico
   */
  isCriticalFeedback(feedback) {
    // Feedback negativo explícito es crítico
    if (feedback.type === 'thumbs_down' || 
        (feedback.type === 'star_rating' && feedback.value <= 2) ||
        (feedback.type === 'comment' && this.isNegativeComment(feedback.comment))) {
      return true;
    }

    // Tiempo de respuesta muy lento es crítico
    if (feedback.type === 'response_time' && feedback.value > 10000) { // 10 segundos
      return true;
    }

    return false;
  }

  /**
   * Determina si un comentario es negativo
   */
  isNegativeComment(comment) {
    const negativeWords = ['malo', 'terrible', 'no sirve', 'inútil', 'frustrante', 'confuso', 'incorrecto'];
    const lowerComment = comment.toLowerCase();
    
    return negativeWords.some(word => lowerComment.includes(word));
  }

  /**
   * Procesa feedback individual
   */
  async processFeedback(feedbackEntry) {
    try {
      // 1. Actualizar métricas de satisfacción
      this.updateSatisfactionMetrics(feedbackEntry);

      // 2. Analizar patrones de respuesta
      await this.analyzeResponsePatterns(feedbackEntry);

      // 3. Generar sugerencias de mejora
      await this.generateImprovementSuggestions(feedbackEntry);

      // 4. Adaptar si es necesario
      if (this.shouldAdapt(feedbackEntry)) {
        await this.performAdaptation(feedbackEntry);
      }

      // 5. Marcar como procesado
      feedbackEntry.processed = true;
      await supabaseAIService.update(
        'ai_feedback',
        { processed: true, processed_at: new Date() },
        { id: feedbackEntry.id }
      );

      console.log(`✅ Feedback procesado: ${feedbackEntry.id}`);
    } catch (error) {
      console.error('Error procesando feedback:', error);
    }
  }

  /**
   * Actualiza métricas de satisfacción
   */
  updateSatisfactionMetrics(feedback) {
    const sentiment = this.calculateSentiment(feedback);
    const hour = new Date(feedback.created_at).getHours();

    // Actualizar métrica general
    this.updateMetricScore('overall', sentiment);

    // Actualizar por intención
    if (feedback.metadata.intent) {
      this.updateMetricScore(`byIntent.${feedback.metadata.intent}`, sentiment);
    }

    // Actualizar por categoría
    if (feedback.metadata.category) {
      this.updateMetricScore(`byCategory.${feedback.metadata.category}`, sentiment);
    }

    // Actualizar por hora del día
    this.updateMetricScore(`byTimeOfDay.${hour}`, sentiment);
  }

  /**
   * Calcula sentimiento del feedback
   */
  calculateSentiment(feedback) {
    if (feedback.type === 'explicit') {
      switch (feedback.feedback_type) {
        case 'thumbs_up':
          return 1.0;
        case 'thumbs_down':
          return -1.0;
        case 'star_rating':
          return (feedback.value - 3) / 2; // Convertir 1-5 a -1 a 1
        case 'comment':
          return this.analyzeCommentSentiment(feedback.comment);
        default:
          return 0;
      }
    } else if (feedback.type === 'implicit') {
      switch (feedback.feedback_type) {
        case 'response_time':
          return feedback.value < 3000 ? 0.5 : (feedback.value < 5000 ? 0 : -0.5);
        case 'follow_up_questions':
          return feedback.value < 2 ? 0.5 : -0.5;
        case 'task_completion':
          return feedback.value ? 1.0 : -1.0;
        case 'repeat_queries':
          return feedback.value < 2 ? 0.5 : -0.5;
        default:
          return 0;
      }
    }

    return 0;
  }

  /**
   * Analiza sentimiento de comentario
   */
  analyzeCommentSentiment(comment) {
    const positiveWords = ['bueno', 'excelente', 'útil', 'claro', 'perfecto', 'gracias', 'ayudó'];
    const negativeWords = ['malo', 'terrible', 'no sirve', 'inútil', 'confuso', 'incorrecto'];
    
    const lowerComment = comment.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerComment.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerComment.includes(word)).length;
    
    if (positiveCount > negativeCount) return 0.8;
    if (negativeCount > positiveCount) return -0.8;
    return 0;
  }

  /**
   * Actualiza score de métrica
   */
  updateMetricScore(metricPath, sentiment) {
    const pathParts = metricPath.split('.');
    let metric = this.feedbackData.satisfactionMetrics;

    // Navegar al objeto correcto
    for (let i = 0; i < pathParts.length - 1; i++) {
      metric = metric[pathParts[i]];
    }

    const finalKey = pathParts[pathParts.length - 1];

    // Actualizar contadores
    if (sentiment > 0.3) {
      metric[finalKey].positive = (metric[finalKey].positive || 0) + 1;
    } else if (sentiment < -0.3) {
      metric[finalKey].negative = (metric[finalKey].negative || 0) + 1;
    } else {
      metric[finalKey].neutral = (metric[finalKey].neutral || 0) + 1;
    }

    // Calcular score
    const total = metric[finalKey].positive + metric[finalKey].negative + metric[finalKey].neutral;
    const score = (metric[finalKey].positive - metric[finalKey].negative) / total;
    metric[finalKey].score = score;
  }

  /**
   * Analiza patrones de respuesta
   */
  async analyzeResponsePatterns(feedback) {
    if (!feedback.metadata.response_pattern) return;

    const patternKey = feedback.metadata.response_pattern;
    const pattern = this.feedbackData.responsePatterns.get(patternKey);

    if (pattern) {
      pattern.feedback_count++;
      
      // Actualizar tasa de éxito
      const sentiment = this.calculateSentiment(feedback);
      const newSuccessRate = (pattern.success_rate * (pattern.feedback_count - 1) + 
                             (sentiment > 0 ? 1 : 0)) / pattern.feedback_count;
      pattern.success_rate = newSuccessRate;

      // Si la tasa de éxito es baja, marcar para adaptación
      if (newSuccessRate < 0.6 && pattern.feedback_count >= 5) {
        pattern.needs_adaptation = true;
      }
    }
  }

  /**
   * Genera sugerencias de mejora
   */
  async generateImprovementSuggestions(feedback) {
    const suggestions = [];

    // Analizar feedback negativo
    if (this.calculateSentiment(feedback) < -0.3) {
      suggestions.push(this.generateNegativeFeedbackSuggestion(feedback));
    }

    // Analizar patrones de respuesta problemáticos
    if (feedback.metadata.response_pattern) {
      const pattern = this.feedbackData.responsePatterns.get(feedback.metadata.response_pattern);
      if (pattern && pattern.success_rate < 0.6) {
        suggestions.push(this.generatePatternSuggestion(pattern));
      }
    }

    // Analizar comentarios específicos
    if (feedback.type === 'comment' && feedback.comment) {
      const commentSuggestions = this.analyzeCommentForSuggestions(feedback.comment);
      suggestions.push(...commentSuggestions);
    }

    // Agregar sugerencias a la lista
    suggestions.forEach(suggestion => {
      this.feedbackData.improvementSuggestions.push({
        ...suggestion,
        feedback_id: feedback.id,
        created_at: new Date(),
        implemented: false
      });
    });

    // Guardar sugerencias en Supabase
    if (suggestions.length > 0) {
      await this.saveImprovementSuggestions(suggestions);
    }
  }

  /**
   * Genera sugerencia para feedback negativo
   */
  generateNegativeFeedbackSuggestion(feedback) {
    return {
      type: 'response_improvement',
      priority: 'high',
      description: 'Mejorar respuesta basada en feedback negativo',
      details: {
        feedback_type: feedback.feedback_type,
        feedback_value: feedback.value,
        interaction_id: feedback.interaction_id
      },
      suggested_action: 'Revisar y mejorar la respuesta generada'
    };
  }

  /**
   * Genera sugerencia para patrón problemático
   */
  generatePatternSuggestion(pattern) {
    return {
      type: 'pattern_adjustment',
      priority: 'medium',
      description: `Ajustar patrón de respuesta: ${pattern.pattern}`,
      details: {
        current_success_rate: pattern.success_rate,
        feedback_count: pattern.feedback_count,
        pattern_responses: pattern.responses
      },
      suggested_action: 'Optimizar respuestas del patrón para mejorar tasa de éxito'
    };
  }

  /**
   * Analiza comentario en busca de sugerencias
   */
  analyzeCommentForSuggestions(comment) {
    const suggestions = [];
    const lowerComment = comment.toLowerCase();

    if (lowerComment.includes('confuso') || lowerComment.includes('no entiendo')) {
      suggestions.push({
        type: 'clarity_improvement',
        priority: 'medium',
        description: 'Mejorar claridad de las respuestas',
        suggested_action: 'Usar lenguaje más simple y estructurado'
      });
    }

    if (lowerComment.includes('lento') || lowerComment.includes('tarda')) {
      suggestions.push({
        type: 'performance_optimization',
        priority: 'high',
        description: 'Optimizar tiempo de respuesta',
        suggested_action: 'Mejorar eficiencia del procesamiento'
      });
    }

    if (lowerComment.includes('incorrecto') || lowerComment.includes('mal')) {
      suggestions.push({
        type: 'accuracy_improvement',
        priority: 'high',
        description: 'Mejorar precisión de la información',
        suggested_action: 'Validar y actualizar base de conocimiento'
      });
    }

    return suggestions;
  }

  /**
   * Guarda sugerencias de mejora
   */
  async saveImprovementSuggestions(suggestions) {
    try {
      for (const suggestion of suggestions) {
        await supabaseAIService.insert('ai_improvement_suggestions', suggestion);
      }
      console.log(`💾 Guardadas ${suggestions.length} sugerencias de mejora`);
    } catch (error) {
      console.error('Error guardando sugerencias:', error);
    }
  }

  /**
   * Determina si se debe adaptar
   */
  shouldAdapt(feedback) {
    if (!this.feedbackConfig.autoAdapt) return false;

    const sentiment = this.calculateSentiment(feedback);
    
    // Adaptar si hay feedback negativo repetido
    if (sentiment < -0.5) {
      const recentNegative = this.getRecentNegativeFeedback(feedback.metadata.intent);
      if (recentNegative.length >= 3) {
        return true;
      }
    }

    // Adaptar si el patrón de respuesta tiene baja tasa de éxito
    if (feedback.metadata.response_pattern) {
      const pattern = this.feedbackData.responsePatterns.get(feedback.metadata.response_pattern);
      if (pattern && pattern.success_rate < 0.6 && pattern.feedback_count >= 5) {
        return true;
      }
    }

    return false;
  }

  /**
   * Obtiene feedback negativo reciente
   */
  getRecentNegativeFeedback(intent) {
    const recent = [];
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 horas

    for (const [id, feedback] of this.feedbackData.userFeedback.entries()) {
      if (new Date(feedback.created_at) > cutoff &&
          this.calculateSentiment(feedback) < -0.3 &&
          feedback.metadata.intent === intent) {
        recent.push(feedback);
      }
    }

    return recent;
  }

  /**
   * Realiza adaptación
   */
  async performAdaptation(feedback) {
    try {
      const adaptation = {
        id: `adaptation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        feedback_id: feedback.id,
        strategy: this.selectAdaptationStrategy(feedback),
        changes: this.generateAdaptationChanges(feedback),
        created_at: new Date(),
        applied: false
      };

      // Aplicar adaptación
      await this.applyAdaptation(adaptation);

      // Registrar adaptación
      this.feedbackData.adaptationHistory.push(adaptation);
      await supabaseAIService.insert('ai_adaptations', adaptation);

      console.log(`🔄 Adaptación aplicada: ${adaptation.strategy}`);
    } catch (error) {
      console.error('Error realizando adaptación:', error);
    }
  }

  /**
   * Selecciona estrategia de adaptación
   */
  selectAdaptationStrategy(feedback) {
    const sentiment = this.calculateSentiment(feedback);

    if (sentiment < -0.7) {
      return 'response_improvement';
    } else if (feedback.metadata.response_pattern) {
      return 'pattern_adjustment';
    } else if (feedback.type === 'comment' && feedback.comment.includes('incorrecto')) {
      return 'knowledge_enhancement';
    } else {
      return 'flow_optimization';
    }
  }

  /**
   * Genera cambios de adaptación
   */
  generateAdaptationChanges(feedback) {
    const changes = {};

    if (feedback.metadata.response_pattern) {
      changes.pattern = feedback.metadata.response_pattern;
      changes.new_responses = this.generateImprovedResponses(feedback);
    }

    if (feedback.type === 'comment') {
      changes.comment_analysis = this.analyzeCommentForAdaptation(feedback.comment);
    }

    return changes;
  }

  /**
   * Genera respuestas mejoradas
   */
  generateImprovedResponses(feedback) {
    // Simulación de generación de respuestas mejoradas
    return [
      'Respuesta mejorada 1 basada en feedback',
      'Respuesta mejorada 2 más clara y concisa',
      'Respuesta mejorada 3 con más detalles'
    ];
  }

  /**
   * Analiza comentario para adaptación
   */
  analyzeCommentForAdaptation(comment) {
    return {
      sentiment: this.analyzeCommentSentiment(comment),
      key_issues: this.extractKeyIssues(comment),
      improvement_areas: this.identifyImprovementAreas(comment)
    };
  }

  /**
   * Extrae problemas clave del comentario
   */
  extractKeyIssues(comment) {
    const issues = [];
    const lowerComment = comment.toLowerCase();

    if (lowerComment.includes('confuso')) issues.push('confusion');
    if (lowerComment.includes('lento')) issues.push('performance');
    if (lowerComment.includes('incorrecto')) issues.push('accuracy');
    if (lowerComment.includes('incompleto')) issues.push('completeness');

    return issues;
  }

  /**
   * Identifica áreas de mejora
   */
  identifyImprovementAreas(comment) {
    const areas = [];
    const lowerComment = comment.toLowerCase();

    if (lowerComment.includes('explicar') || lowerComment.includes('claro')) {
      areas.push('explanation_clarity');
    }
    if (lowerComment.includes('rápido') || lowerComment.includes('tiempo')) {
      areas.push('response_speed');
    }
    if (lowerComment.includes('detalles') || lowerComment.includes('información')) {
      areas.push('information_depth');
    }

    return areas;
  }

  /**
   * Aplica adaptación
   */
  async applyAdaptation(adaptation) {
    switch (adaptation.strategy) {
      case 'response_improvement':
        await this.applyResponseImprovement(adaptation);
        break;
      case 'pattern_adjustment':
        await this.applyPatternAdjustment(adaptation);
        break;
      case 'knowledge_enhancement':
        await this.applyKnowledgeEnhancement(adaptation);
        break;
      case 'flow_optimization':
        await this.applyFlowOptimization(adaptation);
        break;
    }

    adaptation.applied = true;
    adaptation.applied_at = new Date();
  }

  /**
   * Aplica mejora de respuesta
   */
  async applyResponseImprovement(adaptation) {
    // Implementar mejora de respuesta
    console.log('🔧 Aplicando mejora de respuesta...');
  }

  /**
   * Aplica ajuste de patrón
   */
  async applyPatternAdjustment(adaptation) {
    const pattern = this.feedbackData.responsePatterns.get(adaptation.changes.pattern);
    if (pattern && adaptation.changes.new_responses) {
      pattern.responses = adaptation.changes.new_responses;
      pattern.adaptations.push({
        timestamp: new Date(),
        changes: adaptation.changes
      });
    }
  }

  /**
   * Aplica mejora de conocimiento
   */
  async applyKnowledgeEnhancement(adaptation) {
    // Implementar mejora de conocimiento
    console.log('🧠 Aplicando mejora de conocimiento...');
  }

  /**
   * Aplica optimización de flujo
   */
  async applyFlowOptimization(adaptation) {
    // Implementar optimización de flujo
    console.log('⚡ Aplicando optimización de flujo...');
  }

  /**
   * Realiza análisis de feedback programado
   */
  async performFeedbackAnalysis() {
    try {
      console.log('🔍 Iniciando análisis de feedback...');

      // 1. Procesar feedback no procesado
      await this.processUnprocessedFeedback();

      // 2. Analizar tendencias de satisfacción
      await this.analyzeSatisfactionTrends();

      // 3. Identificar patrones problemáticos
      await this.identifyProblematicPatterns();

      // 4. Generar informe de mejora
      await this.generateImprovementReport();

      console.log('✅ Análisis de feedback completado');
    } catch (error) {
      console.error('❌ Error en análisis de feedback:', error);
    }
  }

  /**
   * Procesa feedback no procesado
   */
  async processUnprocessedFeedback() {
    const unprocessed = [];

    for (const [id, feedback] of this.feedbackData.userFeedback.entries()) {
      if (!feedback.processed) {
        unprocessed.push(feedback);
      }
    }

    for (const feedback of unprocessed) {
      await this.processFeedback(feedback);
    }

    if (unprocessed.length > 0) {
      console.log(`📊 Procesados ${unprocessed.length} feedback pendientes`);
    }
  }

  /**
   * Analiza tendencias de satisfacción
   */
  async analyzeSatisfactionTrends() {
    const trends = {
      overall: this.calculateTrend('overall'),
      byIntent: {},
      byCategory: {},
      byTimeOfDay: {}
    };

    // Analizar tendencias por intención
    for (const [intent, metrics] of this.feedbackData.satisfactionMetrics.byIntent.entries()) {
      trends.byIntent[intent] = this.calculateTrend(metrics);
    }

    // Analizar tendencias por categoría
    for (const [category, metrics] of this.feedbackData.satisfactionMetrics.byCategory.entries()) {
      trends.byCategory[category] = this.calculateTrend(metrics);
    }

    // Guardar tendencias
    await this.saveSatisfactionTrends(trends);
  }

  /**
   * Calcula tendencia
   */
  calculateTrend(metrics) {
    if (!metrics.score) return 'stable';

    const score = metrics.score;
    if (score > 0.3) return 'improving';
    if (score < -0.3) return 'declining';
    return 'stable';
  }

  /**
   * Guarda tendencias de satisfacción
   */
  async saveSatisfactionTrends(trends) {
    try {
      await supabaseAIService.insert('ai_satisfaction_trends', {
        trends,
        created_at: new Date()
      });
    } catch (error) {
      console.error('Error guardando tendencias:', error);
    }
  }

  /**
   * Identifica patrones problemáticos
   */
  async identifyProblematicPatterns() {
    const problematic = [];

    for (const [key, pattern] of this.feedbackData.responsePatterns.entries()) {
      if (pattern.success_rate < 0.6 && pattern.feedback_count >= 5) {
        problematic.push({
          pattern: key,
          success_rate: pattern.success_rate,
          feedback_count: pattern.feedback_count,
          priority: pattern.success_rate < 0.4 ? 'high' : 'medium'
        });
      }
    }

    if (problematic.length > 0) {
      console.log(`⚠️ Identificados ${problematic.length} patrones problemáticos`);
      await this.saveProblematicPatterns(problematic);
    }
  }

  /**
   * Guarda patrones problemáticos
   */
  async saveProblematicPatterns(patterns) {
    try {
      for (const pattern of patterns) {
        await supabaseAIService.insert('ai_problematic_patterns', {
          ...pattern,
          created_at: new Date()
        });
      }
    } catch (error) {
      console.error('Error guardando patrones problemáticos:', error);
    }
  }

  /**
   * Genera informe de mejora
   */
  async generateImprovementReport() {
    const report = {
      period: 'last_24_hours',
      total_feedback: this.feedbackData.userFeedback.size,
      satisfaction_score: this.feedbackData.satisfactionMetrics.overall.score,
      adaptations_applied: this.feedbackData.adaptationHistory.filter(a => a.applied).length,
      improvement_suggestions: this.feedbackData.improvementSuggestions.filter(s => !s.implemented).length,
      top_issues: this.getTopIssues(),
      recommendations: this.generateRecommendations()
    };

    await this.saveImprovementReport(report);
  }

  /**
   * Obtiene problemas principales
   */
  getTopIssues() {
    const issues = {};

    // Contar tipos de problemas
    for (const suggestion of this.feedbackData.improvementSuggestions) {
      if (!issues[suggestion.type]) {
        issues[suggestion.type] = 0;
      }
      issues[suggestion.type]++;
    }

    // Ordenar por frecuencia
    return Object.entries(issues)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }

  /**
   * Genera recomendaciones
   */
  generateRecommendations() {
    const recommendations = [];

    // Basado en métricas de satisfacción
    if (this.feedbackData.satisfactionMetrics.overall.score < 0) {
      recommendations.push({
        type: 'general_improvement',
        priority: 'high',
        description: 'La satisfacción general es baja, se requiere revisión completa del sistema'
      });
    }

    // Basado en patrones problemáticos
    const problematicPatterns = Array.from(this.feedbackData.responsePatterns.values())
      .filter(p => p.success_rate < 0.6);
    
    if (problematicPatterns.length > 0) {
      recommendations.push({
        type: 'pattern_optimization',
        priority: 'medium',
        description: 'Optimizar patrones de respuesta con baja tasa de éxito'
      });
    }

    return recommendations;
  }

  /**
   * Guarda informe de mejora
   */
  async saveImprovementReport(report) {
    try {
      await supabaseAIService.insert('ai_improvement_reports', report);
      console.log('📊 Informe de mejora generado y guardado');
    } catch (error) {
      console.error('Error guardando informe:', error);
    }
  }

  /**
   * Obtiene contexto del usuario
   */
  getUserContext() {
    return {
      timestamp: new Date(),
      session_id: sessionStorage.getItem('session_id') || 'unknown',
      user_agent: navigator.userAgent,
      page: window.location.pathname
    };
  }

  /**
   * Obtiene métricas de feedback
   */
  getFeedbackMetrics() {
    return {
      ...this.feedbackData.satisfactionMetrics,
      total_feedback: this.feedbackData.userFeedback.size,
      unprocessed_feedback: Array.from(this.feedbackData.userFeedback.values())
        .filter(f => !f.processed).length,
      adaptation_history: this.feedbackData.adaptationHistory.length,
      improvement_suggestions: this.feedbackData.improvementSuggestions.length,
      response_patterns: this.feedbackData.responsePatterns.size
    };
  }

  /**
   * Exporta datos de feedback
   */
  exportFeedbackData() {
    return {
      feedbackData: {
        userFeedback: Object.fromEntries(this.feedbackData.userFeedback),
        satisfactionMetrics: this.feedbackData.satisfactionMetrics,
        adaptationHistory: this.feedbackData.adaptationHistory,
        improvementSuggestions: this.feedbackData.improvementSuggestions,
        responsePatterns: Object.fromEntries(this.feedbackData.responsePatterns)
      },
      config: this.feedbackConfig,
      exportedAt: new Date()
    };
  }
}

// Exportar como singleton
const aiFeedbackService = new AIFeedbackService();
export { aiFeedbackService };
export default aiFeedbackService;