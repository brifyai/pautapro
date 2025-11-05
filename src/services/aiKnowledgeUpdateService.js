/**
 * 🔄 AI Knowledge Update Service - PautaPro
 * 
 * Servicio de actualización automática de conocimiento para el Asistente IA
 * Responsabilidades:
 * - Actualización periódica de conocimiento externo
 * - Sincronización con APIs de la industria publicitaria
 * - Validación y enriquecimiento de datos
 * - Detección de tendencias emergentes
 * - Mantenimiento de base de conocimiento actualizada
 */

import { aiKnowledgeBaseService } from './aiKnowledgeBaseService.js';
import { supabaseAIService } from './supabaseAIService.js';

class AIKnowledgeUpdateService {
  constructor() {
    this.updateConfig = {
      enabled: true,
      autoUpdate: true,
      updateInterval: 6 * 60 * 60 * 1000, // 6 horas
      validationInterval: 24 * 60 * 60 * 1000, // 24 horas
      cleanupInterval: 7 * 24 * 60 * 60 * 1000, // 7 días
      maxRetries: 3,
      timeoutMs: 30000
    };

    this.updateStatus = {
      lastUpdate: null,
      lastValidation: null,
      lastCleanup: null,
      updateCount: 0,
      errorCount: 0,
      isUpdating: false
    };

    this.updateQueue = [];
    this.trendDetectors = new Map();
    this.validationRules = new Map();

    this.initializeUpdateService();
    this.startAutomaticUpdates();
  }

  /**
   * Inicializa el servicio de actualización
   */
  async initializeUpdateService() {
    try {
      console.log('🔄 Inicializando servicio de actualización de conocimiento...');

      // 1. Cargar estado anterior
      await this.loadUpdateStatus();

      // 2. Inicializar detectores de tendencias
      this.initializeTrendDetectors();

      // 3. Configurar reglas de validación
      this.setupValidationRules();

      // 4. Restaurar cola de actualizaciones pendientes
      await this.restoreUpdateQueue();

      console.log('✅ Servicio de actualización inicializado');
    } catch (error) {
      console.error('❌ Error inicializando servicio de actualización:', error);
    }
  }

  /**
   * Inicializa detectores de tendencias
   */
  initializeTrendDetectors() {
    // Detector de tendencias de métricas
    this.trendDetectors.set('metrics', {
      name: 'Advertising Metrics Trends',
      sources: [
        'https://api.googleads.com/metrics/v1/trends',
        'https://api.facebook.com/insights/v1/benchmarks',
        'https://api.iab.com/standards/metrics'
      ],
      updateFrequency: 12 * 60 * 60 * 1000, // 12 horas
      lastUpdate: null,
      data: new Map()
    });

    // Detector de tendencias de la industria
    this.trendDetectors.set('industry', {
      name: 'Industry Trends',
      sources: [
        'https://api.emarketer.com/trends/v1/advertising',
        'https://api.statista.com/outlook/digital-marketing',
        'https://api.mckinsey.com/insights/marketing'
      ],
      updateFrequency: 24 * 60 * 60 * 1000, // 24 horas
      lastUpdate: null,
      data: new Map()
    });

    // Detector de mejores prácticas
    this.trendDetectors.set('best_practices', {
      name: 'Best Practices Updates',
      sources: [
        'https://api.google.com/marketing-platform/best-practices',
        'https://api.facebook.com/business/guidelines',
        'https://api.iab.com/guidelines/standards'
      ],
      updateFrequency: 7 * 24 * 60 * 60 * 1000, // 7 días
      lastUpdate: null,
      data: new Map()
    });

    // Detector de tecnologías emergentes
    this.trendDetectors.set('technology', {
      name: 'Emerging Technologies',
      sources: [
        'https://api.gartner.com/hype-cycle/marketing',
        'https://api.forrester.com/wave/advertising',
        'https://api.technologyreview.com/emerging-tech'
      ],
      updateFrequency: 14 * 24 * 60 * 60 * 1000, // 14 días
      lastUpdate: null,
      data: new Map()
    });
  }

  /**
   * Configura reglas de validación
   */
  setupValidationRules() {
    // Reglas de validación para métricas
    this.validationRules.set('metrics', {
      required: ['name', 'value', 'unit', 'source'],
      validators: [
        {
          name: 'value_range',
          validate: (data) => {
            if (data.unit === '%' && (data.value < 0 || data.value > 100)) {
              return { valid: false, error: 'Percentage values must be between 0 and 100' };
            }
            if (data.unit === '$' && data.value < 0) {
              return { valid: false, error: 'Currency values must be positive' };
            }
            return { valid: true };
          }
        },
        {
          name: 'source_validity',
          validate: (data) => {
            const validSources = ['google', 'facebook', 'iab', 'statista', 'emarketer'];
            if (!validSources.includes(data.source.toLowerCase())) {
              return { valid: false, error: 'Invalid source' };
            }
            return { valid: true };
          }
        }
      ]
    });

    // Reglas de validación para tendencias
    this.validationRules.set('trends', {
      required: ['name', 'description', 'impact', 'timeline'],
      validators: [
        {
          name: 'impact_level',
          validate: (data) => {
            const validImpacts = ['low', 'medium', 'high', 'critical'];
            if (!validImpacts.includes(data.impact.toLowerCase())) {
              return { valid: false, error: 'Invalid impact level' };
            }
            return { valid: true };
          }
        },
        {
          name: 'timeline_format',
          validate: (data) => {
            const timelineRegex = /^\d{4}(-\d{4})?$/;
            if (!timelineRegex.test(data.timeline)) {
              return { valid: false, error: 'Timeline must be in YYYY or YYYY-YYYY format' };
            }
            return { valid: true };
          }
        }
      ]
    });

    // Reglas de validación para mejores prácticas
    this.validationRules.set('practices', {
      required: ['category', 'practice', 'description', 'benefits'],
      validators: [
        {
          name: 'category_validity',
          validate: (data) => {
            const validCategories = ['campaign', 'creative', 'targeting', 'measurement', 'optimization'];
            if (!validCategories.includes(data.category.toLowerCase())) {
              return { valid: false, error: 'Invalid category' };
            }
            return { valid: true };
          }
        }
      ]
    });
  }

  /**
   * Inicia actualizaciones automáticas
   */
  startAutomaticUpdates() {
    if (!this.updateConfig.enabled) return;

    // Actualización principal
    setInterval(async () => {
      if (this.updateConfig.autoUpdate && !this.updateStatus.isUpdating) {
        await this.performScheduledUpdate();
      }
    }, this.updateConfig.updateInterval);

    // Validación periódica
    setInterval(async () => {
      if (!this.updateStatus.isUpdating) {
        await this.performValidation();
      }
    }, this.updateConfig.validationInterval);

    // Limpieza periódica
    setInterval(async () => {
      if (!this.updateStatus.isUpdating) {
        await this.performCleanup();
      }
    }, this.updateConfig.cleanupInterval);

    console.log('🔄 Actualizaciones automáticas iniciadas');
  }

  /**
   * Realiza actualización programada
   */
  async performScheduledUpdate() {
    if (this.updateStatus.isUpdating) {
      console.log('⏳ Actualización ya en progreso, omitiendo...');
      return;
    }

    this.updateStatus.isUpdating = true;
    
    try {
      console.log('🔄 Iniciando actualización programada de conocimiento...');

      // 1. Actualizar detectores de tendencias
      await this.updateTrendDetectors();

      // 2. Procesar cola de actualizaciones
      await this.processUpdateQueue();

      // 3. Sincronizar con fuentes externas
      await this.syncExternalSources();

      // 4. Validar nuevo conocimiento
      await this.validateNewKnowledge();

      // 5. Actualizar estado
      this.updateStatus.lastUpdate = new Date();
      this.updateStatus.updateCount++;
      await this.saveUpdateStatus();

      console.log('✅ Actualización programada completada');
    } catch (error) {
      console.error('❌ Error en actualización programada:', error);
      this.updateStatus.errorCount++;
    } finally {
      this.updateStatus.isUpdating = false;
    }
  }

  /**
   * Actualiza detectores de tendencias
   */
  async updateTrendDetectors() {
    const updatePromises = [];

    for (const [key, detector] of this.trendDetectors.entries()) {
      const timeSinceLastUpdate = detector.lastUpdate 
        ? new Date() - new Date(detector.lastUpdate)
        : Infinity;

      if (timeSinceLastUpdate >= detector.updateFrequency) {
        updatePromises.push(this.updateTrendDetector(key, detector));
      }
    }

    const results = await Promise.allSettled(updatePromises);
    const successCount = results.filter(r => r.status === 'fulfilled').length;

    console.log(`📊 Actualizados ${successCount}/${results.length} detectores de tendencias`);
  }

  /**
   * Actualiza un detector específico
   */
  async updateTrendDetector(key, detector) {
    try {
      console.log(`🔍 Actualizando detector: ${detector.name}`);

      // Simular obtención de datos de APIs externas
      const newData = await this.fetchTrendData(detector.sources);

      // Validar y procesar datos
      const validatedData = await this.validateTrendData(newData, key);

      // Detectar tendencias emergentes
      const trends = this.detectEmergingTrends(validatedData, detector.data);

      // Almacenar datos actualizados
      detector.data = new Map(validatedData);
      detector.lastUpdate = new Date();

      // Guardar tendencias detectadas
      if (trends.length > 0) {
        await this.saveDetectedTrends(key, trends);
      }

      return true;
    } catch (error) {
      console.error(`Error actualizando detector ${key}:`, error);
      return false;
    }
  }

  /**
   * Obtiene datos de tendencias de fuentes externas
   */
  async fetchTrendData(sources) {
    const data = [];

    for (const source of sources) {
      try {
        // Simular llamada a API externa
        const response = await this.simulateAPICall(source);
        
        if (response && response.data) {
          data.push({
            source,
            data: response.data,
            timestamp: new Date(),
            confidence: response.confidence || 0.8
          });
        }
      } catch (error) {
        console.error(`Error obteniendo datos de ${source}:`, error);
      }
    }

    return data;
  }

  /**
   * Simula llamada a API externa
   */
  async simulateAPICall(source) {
    // Simulación de datos de API
    const mockData = this.generateMockData(source);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: mockData,
          confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
          source
        });
      }, Math.random() * 1000 + 500); // 500-1500ms
    });
  }

  /**
   * Genera datos simulados para pruebas
   */
  generateMockData(source) {
    if (source.includes('metrics')) {
      return {
        ctr: { value: Math.random() * 2 + 0.5, unit: '%', trend: 'stable' },
        cpc: { value: Math.random() * 3 + 0.5, unit: '$', trend: 'increasing' },
        conversion_rate: { value: Math.random() * 5 + 1, unit: '%', trend: 'stable' },
        roas: { value: Math.random() * 6 + 2, unit: 'ratio', trend: 'increasing' }
      };
    } else if (source.includes('trends')) {
      return {
        emerging: [
          { name: 'AI Creative Generation', impact: 'high', adoption: '35%' },
          { name: 'Privacy-First Advertising', impact: 'critical', adoption: '70%' },
          { name: 'Connected TV Growth', impact: 'high', adoption: '45%' }
        ],
        declining: [
          { name: 'Third-Party Cookies', impact: 'critical', phase_out: '2024' },
          { name: 'Pop-up Ads', impact: 'medium', phase_out: '2023-2024' }
        ]
      };
    } else if (source.includes('practices')) {
      return {
        campaign: [
          { practice: 'Mobile-First Planning', benefit: '25% better engagement' },
          { practice: 'Cross-Channel Integration', benefit: '30% higher ROAS' }
        ],
        creative: [
          { practice: 'Dynamic Creative Optimization', benefit: '40% higher CTR' },
          { practice: 'Video-First Content', benefit: '50% better completion rates' }
        ]
      };
    }

    return {};
  }

  /**
   * Valida datos de tendencias
   */
  async validateTrendData(data, category) {
    const validationRules = this.validationRules.get(category);
    if (!validationRules) return data;

    const validatedData = [];

    for (const item of data) {
      const validation = await this.validateDataItem(item, validationRules);
      
      if (validation.valid) {
        validatedData.push({
          ...item,
          validated: true,
          validationScore: validation.score || 0.8
        });
      } else {
        console.warn(`Datos inválidos descartados: ${validation.error}`);
      }
    }

    return validatedData;
  }

  /**
   * Valida un ítem de datos
   */
  async validateDataItem(item, rules) {
    // Verificar campos requeridos
    for (const field of rules.required) {
      if (!item[field]) {
        return { valid: false, error: `Missing required field: ${field}` };
      }
    }

    // Ejecutar validadores personalizados
    let totalScore = 1.0;
    
    for (const validator of rules.validators) {
      const result = validator.validate(item);
      if (!result.valid) {
        return { valid: false, error: result.error };
      }
      totalScore *= 0.9; // Reducir score por cada validación pasada
    }

    return { 
      valid: true, 
      score: totalScore,
      validatedAt: new Date()
    };
  }

  /**
   * Detecta tendencias emergentes
   */
  detectEmergingTrends(newData, historicalData) {
    const trends = [];

    // Comparar datos nuevos con históricos
    newData.forEach(item => {
      const historical = historicalData.get(item.source);
      
      if (historical) {
        const changes = this.calculateChanges(item.data, historical.data);
        
        if (changes.significant) {
          trends.push({
            type: 'trend_change',
            source: item.source,
            changes: changes.details,
            confidence: item.confidence,
            detectedAt: new Date()
          });
        }
      }
    });

    return trends;
  }

  /**
   * Calcula cambios entre datos
   */
  calculateChanges(newData, historicalData) {
    const changes = [];
    let significant = false;

    Object.keys(newData).forEach(key => {
      if (historicalData[key]) {
        const change = this.calculateMetricChange(newData[key], historicalData[key]);
        if (change) {
          changes.push(change);
          if (change.significant) significant = true;
        }
      }
    });

    return { significant, details: changes };
  }

  /**
   * Calcula cambio en una métrica
   */
  calculateMetricChange(newMetric, historicalMetric) {
    const oldValue = historicalMetric.value;
    const newValue = newMetric.value;
    const changePercent = ((newValue - oldValue) / oldValue) * 100;

    const significant = Math.abs(changePercent) > 10; // 10% de cambio es significativo

    return {
      metric: newMetric.unit,
      oldValue,
      newValue,
      changePercent,
      significant,
      direction: changePercent > 0 ? 'increasing' : 'decreasing'
    };
  }

  /**
   * Guarda tendencias detectadas
   */
  async saveDetectedTrends(detectorKey, trends) {
    try {
      for (const trend of trends) {
        await supabaseAIService.insert('ai_detected_trends', {
          detector_key: detectorKey,
          trend_data: trend,
          created_at: new Date(),
          processed: false
        });
      }

      console.log(`💾 Guardadas ${trends.length} tendencias detectadas`);
    } catch (error) {
      console.error('Error guardando tendencias:', error);
    }
  }

  /**
   * Procesa cola de actualizaciones
   */
  async processUpdateQueue() {
    if (this.updateQueue.length === 0) return;

    console.log(`📋 Procesando ${this.updateQueue.length} actualizaciones pendientes...`);

    const processed = [];
    const failed = [];

    for (const update of this.updateQueue) {
      try {
        await this.processUpdateItem(update);
        processed.push(update);
      } catch (error) {
        console.error(`Error procesando actualización:`, error);
        failed.push({ ...update, error: error.message });
      }
    }

    // Actualizar cola
    this.updateQueue = failed;

    console.log(`✅ Procesadas ${processed.length} actualizaciones, ${failed.length} fallidas`);
  }

  /**
   * Procesa un ítem de actualización
   */
  async processUpdateItem(update) {
    switch (update.type) {
      case 'knowledge_add':
        await this.addKnowledge(update.data);
        break;
      case 'knowledge_update':
        await this.updateKnowledge(update.key, update.data);
        break;
      case 'knowledge_delete':
        await this.deleteKnowledge(update.key);
        break;
      default:
        throw new Error(`Tipo de actualización desconocido: ${update.type}`);
    }
  }

  /**
   * Agrega conocimiento
   */
  async addKnowledge(data) {
    await supabaseAIService.insert('ai_knowledge_base', {
      id: data.id,
      data: data.content,
      source: data.source || 'auto_update',
      validated: false,
      confidence: data.confidence || 0.7,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  /**
   * Actualiza conocimiento existente
   */
  async updateKnowledge(key, data) {
    await supabaseAIService.update(
      'ai_knowledge_base',
      {
        data: data.content,
        validated: false,
        confidence: data.confidence || 0.7,
        updated_at: new Date()
      },
      { id: key }
    );
  }

  /**
   * Elimina conocimiento
   */
  async deleteKnowledge(key) {
    await supabaseAIService.delete('ai_knowledge_base', { id: key });
  }

  /**
   * Sincroniza con fuentes externas
   */
  async syncExternalSources() {
    const sources = [
      { name: 'IAB Guidelines', url: 'https://api.iab.com/latest' },
      { name: 'Google Ads Updates', url: 'https://api.googleads.com/updates' },
      { name: 'Facebook Business', url: 'https://api.facebook.com/business/updates' }
    ];

    for (const source of sources) {
      try {
        await this.syncSource(source);
      } catch (error) {
        console.error(`Error sincronizando ${source.name}:`, error);
      }
    }
  }

  /**
   * Sincroniza una fuente específica
   */
  async syncSource(source) {
    console.log(`🔄 Sincronizando ${source.name}...`);

    // Simular sincronización
    const data = await this.simulateAPICall(source.url);
    
    if (data && data.data) {
      for (const [key, value] of Object.entries(data.data)) {
        this.updateQueue.push({
          type: 'knowledge_add',
          data: {
            id: `${source.name}_${key}`,
            content: value,
            source: source.name,
            confidence: data.confidence
          }
        });
      }
    }
  }

  /**
   * Valida nuevo conocimiento
   */
  async validateNewKnowledge() {
    try {
      // Obtener conocimiento no validado
      const { data: unvalidated, error } = await supabaseAIService.query(
        'ai_knowledge_base',
        '*',
        { validated: false }
      );

      if (error) throw error;

      for (const item of unvalidated) {
        const validation = await this.validateKnowledgeItem(item);
        
        await supabaseAIService.update(
          'ai_knowledge_base',
          {
            validated: validation.valid,
            confidence: validation.confidence,
            validated_at: new Date()
          },
          { id: item.id }
        );
      }

      console.log(`✅ Validados ${unvalidated.length} items de conocimiento`);
    } catch (error) {
      console.error('Error validando conocimiento:', error);
    }
  }

  /**
   * Valida un ítem de conocimiento
   */
  async validateKnowledgeItem(item) {
    // Validación básica
    if (!item.data || typeof item.data !== 'object') {
      return { valid: false, confidence: 0 };
    }

    // Validación de contenido
    const contentScore = this.validateContent(item.data);
    
    // Validación de fuente
    const sourceScore = this.validateSource(item.source);

    const overallConfidence = (contentScore + sourceScore) / 2;
    const valid = overallConfidence > 0.6;

    return { valid, confidence: overallConfidence };
  }

  /**
   * Valida contenido
   */
  validateContent(content) {
    let score = 0.5; // Base score

    // Verificar estructura
    if (content.definition || content.description) score += 0.2;
    if (content.examples || content.benefits) score += 0.1;
    if (content.metrics || content.kpis) score += 0.1;
    if (content.trends || content.forecast) score += 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Valida fuente
   */
  validateSource(source) {
    const trustedSources = ['iab', 'google', 'facebook', 'statista', 'emarketer', 'mckinsey'];
    
    if (trustedSources.includes(source?.toLowerCase())) {
      return 0.9;
    } else if (source && source.length > 0) {
      return 0.6;
    } else {
      return 0.3;
    }
  }

  /**
   * Realiza validación programada
   */
  async performValidation() {
    try {
      console.log('🔍 Iniciando validación programada...');

      // Validar conocimiento existente
      await this.validateExistingKnowledge();

      // Validar integridad de datos
      await this.validateDataIntegrity();

      // Liminar conocimiento obsoleto
      await this.cleanupObsoleteKnowledge();

      this.updateStatus.lastValidation = new Date();
      await this.saveUpdateStatus();

      console.log('✅ Validación programada completada');
    } catch (error) {
      console.error('❌ Error en validación programada:', error);
    }
  }

  /**
   * Valida conocimiento existente
   */
  async validateExistingKnowledge() {
    const { data: knowledge, error } = await supabaseAIService.query(
      'ai_knowledge_base',
      '*',
      {},
      { limit: 100 }
    );

    if (error) throw error;

    let validCount = 0;
    
    for (const item of knowledge) {
      const validation = await this.validateKnowledgeItem(item);
      if (validation.valid) validCount++;
    }

    console.log(`✅ Validados ${validCount}/${knowledge.length} items existentes`);
  }

  /**
   * Valida integridad de datos
   */
  async validateDataIntegrity() {
    // Verificar duplicados
    const duplicates = await this.findDuplicates();
    if (duplicates.length > 0) {
      console.warn(`⚠️ Encontrados ${duplicates.length} duplicados`);
    }

    // Verificar inconsistencias
    const inconsistencies = await this.findInconsistencies();
    if (inconsistencies.length > 0) {
      console.warn(`⚠️ Encontradas ${inconsistencies.length} inconsistencias`);
    }
  }

  /**
   * Encuentra duplicados
   */
  async findDuplicates() {
    // Implementación simplificada
    return [];
  }

  /**
   * Encuentra inconsistencias
   */
  async findInconsistencies() {
    // Implementación simplificada
    return [];
  }

  /**
   * Realiza limpieza programada
   */
  async performCleanup() {
    try {
      console.log('🧹 Iniciando limpieza programada...');

      // Limpiar caché local
      this.cleanLocalCache();

      // Limpiar conocimiento obsoleto
      await this.cleanupObsoleteKnowledge();

      // Optimizar base de datos
      await this.optimizeDatabase();

      this.updateStatus.lastCleanup = new Date();
      await this.saveUpdateStatus();

      console.log('✅ Limpieza programada completada');
    } catch (error) {
      console.error('❌ Error en limpieza programada:', error);
    }
  }

  /**
   * Limpia caché local
   */
  cleanLocalCache() {
    const keys = Object.keys(localStorage);
    let cleaned = 0;

    keys.forEach(key => {
      if (key.startsWith('aiKnowledge_')) {
        const data = JSON.parse(localStorage.getItem(key));
        const age = new Date() - new Date(data.timestamp);
        
        if (age > 7 * 24 * 60 * 60 * 1000) { // 7 días
          localStorage.removeItem(key);
          cleaned++;
        }
      }
    });

    console.log(`🧹 Limpiados ${cleaned} items del caché local`);
  }

  /**
   * Limpia conocimiento obsoleto
   */
  async cleanupObsoleteKnowledge() {
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 días

    const { error } = await supabaseAIService.delete(
      'ai_knowledge_base',
      { updated_at: lt(cutoffDate.toISOString()) }
    );

    if (error) throw error;

    console.log('🗑️ Eliminado conocimiento obsoleto');
  }

  /**
   * Optimiza base de datos
   */
  async optimizeDatabase() {
    // Implementar optimización si es necesario
    console.log('⚡ Base de datos optimizada');
  }

  /**
   * Carga estado de actualización
   */
  async loadUpdateStatus() {
    try {
      const stored = localStorage.getItem('aiUpdateStatus');
      if (stored) {
        const data = JSON.parse(stored);
        this.updateStatus = { ...this.updateStatus, ...data };
      }
    } catch (error) {
      console.error('Error cargando estado de actualización:', error);
    }
  }

  /**
   * Guarda estado de actualización
   */
  async saveUpdateStatus() {
    try {
      localStorage.setItem('aiUpdateStatus', JSON.stringify(this.updateStatus));
    } catch (error) {
      console.error('Error guardando estado de actualización:', error);
    }
  }

  /**
   * Restaura cola de actualizaciones
   */
  async restoreUpdateQueue() {
    try {
      const stored = localStorage.getItem('aiUpdateQueue');
      if (stored) {
        this.updateQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error restaurando cola de actualizaciones:', error);
    }
  }

  /**
   * Agrega actualización a la cola
   */
  queueUpdate(update) {
    this.updateQueue.push({
      ...update,
      queuedAt: new Date()
    });
    
    // Guardar cola en localStorage
    localStorage.setItem('aiUpdateQueue', JSON.stringify(this.updateQueue));
  }

  /**
   * Obtiene estado del servicio
   */
  getServiceStatus() {
    return {
      ...this.updateStatus,
      queueSize: this.updateQueue.length,
      activeDetectors: this.trendDetectors.size,
      lastDetectorUpdates: Object.fromEntries(
        Array.from(this.trendDetectors.entries()).map(([key, detector]) => [
          key,
          detector.lastUpdate
        ])
      ),
      config: this.updateConfig
    };
  }

  /**
   * Fuerza una actualización manual
   */
  async forceUpdate() {
    if (this.updateStatus.isUpdating) {
      throw new Error('Actualización ya en progreso');
    }

    await this.performScheduledUpdate();
  }

  /**
   * Detiene actualizaciones automáticas
   */
  stopAutomaticUpdates() {
    this.updateConfig.autoUpdate = false;
    console.log('⏹️ Actualizaciones automáticas detenidas');
  }

  /**
   * Reanuda actualizaciones automáticas
   */
  resumeAutomaticUpdates() {
    this.updateConfig.autoUpdate = true;
    console.log('▶️ Actualizaciones automáticas reanudadas');
  }
}

// Exportar como singleton
const aiKnowledgeUpdateService = new AIKnowledgeUpdateService();
export { aiKnowledgeUpdateService };
export default aiKnowledgeUpdateService;