/**
 * 📚 AI Knowledge Base Service - PautaPro
 * 
 * Servicio de base de conocimiento externo para el Asistente IA
 * Responsabilidades:
 * - Acceso a conocimiento general del dominio publicitario
 * - Integración con APIs externas de conocimiento
 * - Actualización automática de información
 * - Validación y enriquecimiento de datos
 * - Síntesis de información de múltiples fuentes
 */

import { supabaseAIService } from './supabaseAIService.js';

class AIKnowledgeBaseService {
  constructor() {
    this.knowledgeSources = {
      internal: new Map(),
      external: new Map(),
      cached: new Map(),
      validated: new Map()
    };

    this.knowledgeConfig = {
      enabled: true,
      autoUpdate: true,
      cacheExpiry: 24 * 60 * 60 * 1000, // 24 horas
      validationThreshold: 0.8,
      maxCacheSize: 1000,
      updateInterval: 12 * 60 * 60 * 1000 // 12 horas
    };

    this.externalAPIs = {
      advertising: {
        endpoints: [
          'https://api.iab.com/guidelines',
          'https://api.googleads.com/metrics',
          'https://api.facebook.com/insights'
        ],
        rateLimit: 1000,
        lastUpdate: null
      },
      market: {
        endpoints: [
          'https://api.statista.com/advertising',
          'https://api.emarketer.com/trends',
          'https://api.nielsen.com/media'
        ],
        rateLimit: 500,
        lastUpdate: null
      },
      industry: {
        endpoints: [
          'https://api.adage.com/news',
          'https://api.campaignlive.com/insights',
          'https://api.mediapost.com/trends'
        ],
        rateLimit: 200,
        lastUpdate: null
      }
    };

    this.initializeKnowledgeBase();
    this.startKnowledgeUpdates();
  }

  /**
   * Inicializa la base de conocimiento
   */
  async initializeKnowledgeBase() {
    try {
      console.log('📚 Inicializando base de conocimiento...');

      // 1. Cargar conocimiento interno
      await this.loadInternalKnowledge();

      // 2. Sincronizar con Supabase
      await this.syncWithSupabase();

      // 3. Cargar caché local
      await this.loadLocalCache();

      // 4. Validar conocimiento existente
      await this.validateExistingKnowledge();

      console.log('✅ Base de conocimiento inicializada');
    } catch (error) {
      console.error('❌ Error inicializando base de conocimiento:', error);
    }
  }

  /**
   * Carga conocimiento interno predefinido
   */
  async loadInternalKnowledge() {
    const internalKnowledge = {
      // Glosario publicitario completo
      advertisingGlossary: {
        'programmatic advertising': {
          definition: 'Publicidad programática que utiliza algoritmos para comprar y vender espacios publicitarios en tiempo real',
          category: 'digital',
          relatedTerms: ['rtb', 'dsp', 'ssp', 'ad exchange'],
          examples: ['Google Ads', 'Facebook Ads Manager', 'The Trade Desk'],
          metrics: ['cpm', 'cpc', 'ctr', 'conversion rate'],
          trends: ['AI optimization', 'header bidding', 'private marketplace']
        },
        'rtb': {
          definition: 'Real-Time Bidding - Sistema de subastas en tiempo real para espacios publicitarios',
          category: 'programmatic',
          relatedTerms: ['programmatic', 'dsp', 'ssp'],
          examples: ['Google AdX', 'AppNexus', 'OpenX'],
          metrics: ['bid rate', 'win rate', 'ecpm'],
          trends: ['header bidding', 'first-price auctions']
        },
        'dsp': {
          definition: 'Demand-Side Platform - Plataforma para compradores de publicidad programática',
          category: 'programmatic',
          relatedTerms: ['rtb', 'ssp', 'dmp'],
          examples: ['Google Display & Video 360', 'Amazon DSP', 'MediaMath'],
          metrics: ['reach', 'frequency', 'roas'],
          trends: ['cross-device targeting', 'AI bidding']
        },
        'ssp': {
          definition: 'Supply-Side Platform - Plataforma para vendedores de inventario publicitario',
          category: 'programmatic',
          relatedTerms: ['rtb', 'dsp', 'ad exchange'],
          examples: ['Google Ad Manager', 'OpenX', 'PubMatic'],
          metrics: ['fill rate', 'ecpm', 'revenue'],
          trends: ['header bidding', 'private deals']
        },
        'dmp': {
          definition: 'Data Management Platform - Plataforma para gestionar datos de audiencia',
          category: 'data',
          relatedTerms: ['crm', 'cdp', 'analytics'],
          examples: ['Adobe Audience Manager', 'Salesforce Audience Studio', 'Oracle BlueKai'],
          metrics: ['audience size', 'match rate', 'segment quality'],
          trends: ['privacy-first', 'first-party data', 'cookieless targeting']
        },
        'cdp': {
          definition: 'Customer Data Platform - Plataforma unificada de datos del cliente',
          category: 'data',
          relatedTerms: ['dmp', 'crm', 'personalization'],
          examples: ['Segment', 'Tealium', 'ActionIQ'],
          metrics: ['customer profiles', 'journey mapping', 'attribution'],
          trends: ['real-time sync', 'AI segmentation', 'privacy compliance']
        },
        'attribution': {
          definition: 'Atribución - Proceso de asignar crédito a diferentes puntos de contacto en la conversión',
          category: 'analytics',
          relatedTerms: ['conversion tracking', 'multi-touch', 'roas'],
          examples: ['Google Analytics', 'Adobe Analytics', 'AppsFlyer'],
          models: ['last-click', 'first-click', 'linear', 'time-decay', 'position-based', 'data-driven'],
          trends: ['multi-touch attribution', 'incrementality testing', 'marketing mix modeling']
        },
        'roas': {
          definition: 'Return On Ad Spend - Retorno sobre la inversión publicitaria',
          category: 'performance',
          formula: '(Ingresos generados por publicidad - Costo publicitario) / Costo publicitario',
          relatedTerms: ['roi', 'cpa', 'ltv'],
          benchmarks: {
            ecommerce: '4:1 a 8:1',
            b2b: '2:1 a 5:1',
            services: '3:1 a 6:1'
          },
          trends: ['incremental ROAS', 'merging online and offline', 'predictive ROAS']
        },
        'ltv': {
          definition: 'Lifetime Value - Valor del ciclo de vida del cliente',
          category: 'performance',
          formula: 'Ingresos totales del cliente - Costos totales de adquirir y servir al cliente',
          relatedTerms: ['cac', 'retention', 'churn'],
          calculation: ['historic LTV', 'predictive LTV', 'cohort-based LTV'],
          trends: ['AI-powered prediction', 'real-time LTV', 'segment-specific LTV']
        },
        'cac': {
          definition: 'Customer Acquisition Cost - Costo de adquisición de cliente',
          category: 'performance',
          formula: 'Costos totales de marketing y ventas / Número de nuevos clientes',
          relatedTerms: ['ltv', 'cpa', 'roas'],
          components: ['ad spend', 'marketing salaries', 'creative costs', 'tech costs'],
          benchmarks: {
            saas: '< 12 meses de LTV',
            ecommerce: '< 20% de LTV',
            services: '< 30% de LTV'
          }
        }
      },

      // Métricas y KPIs del sector
      industryMetrics: {
        digital: {
          'display ads': {
            avg_ctr: '0.05%',
            avg_cpm: '$2.80',
            avg_viewability: '68%',
            benchmarks: {
              good_ctr: '> 0.08%',
              good_cpm: '< $2.00',
              good_viewability: '> 70%'
            }
          },
          'search ads': {
            avg_ctr: '3.17%',
            avg_cpc: '$2.69',
            avg_conversion_rate: '4.40%',
            benchmarks: {
              good_ctr: '> 5%',
              good_cpc: '< $2.00',
              good_conversion: '> 6%'
            }
          },
          'social media': {
            avg_ctr: '1.21%',
            avg_cpc: '$1.72',
            avg_engagement_rate: '1.22%',
            benchmarks: {
              good_ctr: '> 2%',
              good_cpc: '< $1.00',
              good_engagement: '> 2%'
            }
          },
          'video ads': {
            avg_vtr: '31.9%',
            avg_cpv: '$0.26',
            avg_completion_rate: '77%',
            benchmarks: {
              good_vtr: '> 40%',
              good_cpv: '< $0.20',
              good_completion: '> 80%'
            }
          }
        },
        traditional: {
          'tv': {
            avg_cpm: '$25-45',
            avg_grps: '100-300',
            reach_potential: '90%+',
            benchmarks: {
              prime_time_cpm: '$35-50',
              off_peak_cpm: '$15-25',
              good_frequency: '3-5 exposiciones'
            }
          },
          'radio': {
            avg_cpm: '$10-20',
            avg_frequency: '2.5-4',
            reach_potential: '60-80%',
            benchmarks: {
              prime_time_cpm: '$15-25',
              off_peak_cpm: '$8-15',
              good_frequency: '3-4 exposiciones'
            }
          },
          'print': {
            avg_cpm: '$15-30',
            avg_readership: '2.5x circulation',
            engagement_time: '20-45 minutos',
            benchmarks: {
              newspaper_cpm: '$15-25',
              magazine_cpm: '$20-35',
              good_placement: 'derecha, página impar'
            }
          }
        }
      },

      // Tendencias y pronósticos
      industryTrends: {
        '2024': {
          emerging: [
            {
              trend: 'AI-Powered Creative',
              description: 'Generación y optimización de creatividades mediante inteligencia artificial',
              impact: 'Alto',
              adoption: '25-40%',
              timeline: '2024-2025'
            },
            {
              trend: 'Cookieless Advertising',
              description: 'Transición a modelos sin cookies de terceros',
              impact: 'Crítico',
              adoption: '60-80%',
              timeline: '2024'
            },
            {
              trend: 'Connected TV (CTV)',
              description: 'Crecimiento de publicidad en televisión conectada',
              impact: 'Alto',
              adoption: '45-65%',
              timeline: '2024-2026'
            },
            {
              trend: 'Privacy-First Marketing',
              description: 'Estrategias centradas en privacidad y consentimiento',
              impact: 'Crítico',
              adoption: '70-85%',
              timeline: '2024'
            }
          ],
          declining: [
            {
              trend: 'Third-Party Cookies',
              description: 'Deprecación de cookies de terceros',
              impact: 'Crítico',
              phase_out: '2024',
              alternatives: ['first-party data', 'contextual targeting', 'privacy-safe APIs']
            },
            {
              trend: 'Pop-up Ads',
              description: 'Declive de ventanas emergentes intrusivas',
              impact: 'Medio',
              phase_out: '2023-2024',
              alternatives: ['native ads', 'push notifications', 'in-app messaging']
            }
          ]
        },
        '2025-forecast': {
          predictions: [
            {
              area: 'Programmatic Advertising',
              prediction: '85% del display advertising será programático',
              confidence: '90%',
              drivers: ['AI optimization', 'automation', 'cross-channel']
            },
            {
              area: 'Video Advertising',
              prediction: 'CTV superará el 50% del presupuesto de video',
              confidence: '85%',
              drivers: ['cord-cutting', 'addressable TV', 'measurement improvements']
            },
            {
              area: 'Mobile Advertising',
              prediction: '75% del presupuesto digital será móvil',
              confidence: '95%',
              drivers: ['5G adoption', 'in-app commerce', 'location targeting']
            }
          ]
        }
      },

      // Mejores prácticas y guías
      bestPractices: {
        campaign_planning: {
          objectives: {
            awareness: {
              kpis: ['reach', 'impressions', 'brand lift'],
              benchmarks: {
                reach: '60-80% del target',
                frequency: '3-5 exposiciones',
                brand_lift: '+5-15%'
              }
            },
            consideration: {
              kpis: ['engagement', 'clicks', 'time on site'],
              benchmarks: {
                ctr: '1-3% (display), 3-8% (search)',
                engagement_rate: '2-5%',
                time_on_site: '2-4 minutos'
              }
            },
            conversion: {
              kpis: ['conversions', 'cpa', 'roas'],
              benchmarks: {
                conversion_rate: '2-5% (ecommerce)',
                cpa: '< 20% de LTV',
                roas: '> 4:1'
              }
            },
            retention: {
              kpis: ['retention rate', 'repeat purchases', 'ltv'],
              benchmarks: {
                retention_rate: '60-80%',
                repeat_rate: '20-40%',
                ltv_growth: '+10-25% anual'
              }
            }
          },
          budget_allocation: {
            digital_traditional: {
              b2c: '70% digital / 30% tradicional',
              b2b: '60% digital / 40% tradicional',
              local: '50% digital / 50% tradicional'
            },
            channel_mix: {
              awareness: '40% display, 30% video, 20% social, 10% search',
              consideration: '30% social, 25% search, 20% video, 15% display, 10% native',
              conversion: '40% search, 30% social, 20% native, 10% display'
            }
          }
        },
        creative_optimization: {
          principles: [
            'Mobile-first design',
            'Clear call-to-action',
            'Brand consistency',
            'A/B testing continuous',
            'Performance-based iteration'
          ],
          formats: {
            display: {
              sizes: ['300x250', '728x90', '300x600', '320x50'],
              best_practices: ['< 150KB', 'HTML5', 'responsive', 'alt text']
            },
            video: {
              durations: {
                pre_roll: '15-30 segundos',
                mid_roll: '15-60 segundos',
                social: '6-15 segundos'
              },
              best_practices: ['branding en primeros 3s', 'subtítulos', 'vertical para móvil']
            },
            social: {
              image_specs: {
                facebook: '1200x628 px',
                instagram: '1080x1080 px',
                twitter: '1200x675 px',
                linkedin: '1200x627 px'
              }
            }
          }
        }
      },

      // Frameworks y metodologías
      frameworks: {
        funnels: {
          aida: {
            stages: ['Awareness', 'Interest', 'Desire', 'Action'],
            metrics: ['reach', 'engagement', 'consideration', 'conversion'],
            tactics: [
              'Broad reach campaigns',
              'Educational content',
              'Product demonstrations',
              'Limited time offers'
            ]
          },
          rfm: {
            stages: ['Reach', 'Frequency', 'Monetary'],
            segments: {
              champions: 'Recent, frequent, high value',
              loyal_customers: 'Not recent, frequent, high value',
              potential_loyalist: 'Recent, average frequency, high value',
              new_customers: 'Recent, low frequency, low value',
              at_risk: 'Not recent, average frequency, average value',
              lost: 'Not recent, low frequency, low value'
            }
          }
        },
        attribution_models: {
          single_touch: {
            last_click: '100% crédito a último toque',
            first_click: '100% crédito a primer toque',
            use_cases: ['simple analysis', 'quick decisions']
          },
          multi_touch: {
            linear: 'Crédito igual distribuido',
            time_decay: 'Más crédito a toques recientes',
            position_based: '40% primero/último, 20% intermedios',
            data_driven: 'Basado en algoritmos ML'
          }
        }
      }
    };

    // Almacenar conocimiento interno
    Object.entries(internalKnowledge).forEach(([category, data]) => {
      this.knowledgeSources.internal.set(category, {
        data,
        lastUpdated: new Date(),
        source: 'internal',
        validated: true,
        confidence: 1.0
      });
    });
  }

  /**
   * Sincroniza con Supabase
   */
  async syncWithSupabase() {
    try {
      // Obtener conocimiento almacenado en Supabase
      const { data: storedKnowledge, error } = await supabaseAIService.query(
        'ai_knowledge_base',
        '*',
        { order: 'updated_at', ascending: false }
      );

      if (error) throw error;

      // Actualizar conocimiento local con datos de Supabase
      storedKnowledge.forEach(item => {
        this.knowledgeSources.external.set(item.id, {
          data: item.data,
          lastUpdated: item.updated_at,
          source: 'supabase',
          validated: item.validated,
          confidence: item.confidence || 0.8
        });
      });

      console.log(`📊 Sincronizados ${storedKnowledge.length} registros desde Supabase`);
    } catch (error) {
      console.error('Error sincronizando con Supabase:', error);
    }
  }

  /**
   * Carga caché local
   */
  async loadLocalCache() {
    try {
      const cachedData = localStorage.getItem('aiKnowledgeCache');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        const now = new Date();
        
        Object.entries(parsed).forEach(([key, value]) => {
          const age = now - new Date(value.lastUpdated);
          if (age < this.knowledgeConfig.cacheExpiry) {
            this.knowledgeSources.cached.set(key, value);
          }
        });
        
        console.log(`🗂️ Cargados ${this.knowledgeSources.cached.size} items desde caché local`);
      }
    } catch (error) {
      console.error('Error cargando caché local:', error);
    }
  }

  /**
   * Valida conocimiento existente
   */
  async validateExistingKnowledge() {
    const validationPromises = [];
    
    // Validar conocimiento interno
    for (const [key, knowledge] of this.knowledgeSources.internal.entries()) {
      validationPromises.push(this.validateKnowledge(key, knowledge));
    }
    
    // Validar conocimiento externo
    for (const [key, knowledge] of this.knowledgeSources.external.entries()) {
      validationPromises.push(this.validateKnowledge(key, knowledge));
    }
    
    const results = await Promise.allSettled(validationPromises);
    const validCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    
    console.log(`✅ Validados ${validCount}/${results.length} items de conocimiento`);
  }

  /**
   * Busca conocimiento en todas las fuentes
   */
  async searchKnowledge(query, options = {}) {
    const {
      category = null,
      source = 'all',
      confidence = 0.5,
      limit = 10
    } = options;

    const results = [];
    const sources = source === 'all' 
      ? ['internal', 'external', 'cached', 'validated']
      : [source];

    for (const sourceName of sources) {
      const sourceData = this.knowledgeSources[sourceName];
      if (!sourceData) continue;

      for (const [key, knowledge] of sourceData.entries()) {
        if (category && !key.includes(category)) continue;
        if (knowledge.confidence < confidence) continue;

        const relevance = this.calculateRelevance(query, knowledge.data);
        if (relevance > 0.3) {
          results.push({
            id: key,
            source: sourceName,
            data: knowledge.data,
            relevance,
            confidence: knowledge.confidence,
            lastUpdated: knowledge.lastUpdated
          });
        }
      }
    }

    // Ordenar por relevancia y limitar resultados
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);
  }

  /**
   * Obtiene término específico del glosario
   */
  async getTermDefinition(term) {
    // Buscar en conocimiento interno
    const internalResult = await this.searchInSource('internal', term);
    if (internalResult) return internalResult;

    // Buscar en conocimiento externo
    const externalResult = await this.searchInSource('external', term);
    if (externalResult) return externalResult;

    // Buscar en caché
    const cachedResult = await this.searchInSource('cached', term);
    if (cachedResult) return cachedResult;

    // Si no se encuentra, buscar externamente
    return await this.fetchExternalKnowledge(term);
  }

  /**
   * Busca en fuente específica
   */
  async searchInSource(sourceName, term) {
    const source = this.knowledgeSources[sourceName];
    if (!source) return null;

    for (const [key, knowledge] of source.entries()) {
      if (key.toLowerCase().includes(term.toLowerCase()) || 
          JSON.stringify(knowledge.data).toLowerCase().includes(term.toLowerCase())) {
        return {
          term: key,
          definition: knowledge.data,
          source: sourceName,
          confidence: knowledge.confidence,
          lastUpdated: knowledge.lastUpdated
        };
      }
    }

    return null;
  }

  /**
   * Obtiene conocimiento externo
   */
  async fetchExternalKnowledge(term) {
    try {
      // En una implementación real, esto llamaría a APIs externas
      // Por ahora, simulamos la respuesta
      
      const externalData = {
        term,
        definition: `Definición externa de ${term}`,
        source: 'external_api',
        confidence: 0.7,
        lastUpdated: new Date()
      };

      // Almacenar en caché
      this.knowledgeSources.cached.set(term, externalData);
      
      // Guardar en Supabase
      await this.saveToSupabase(term, externalData);

      return externalData;
    } catch (error) {
      console.error('Error obteniendo conocimiento externo:', error);
      return null;
    }
  }

  /**
   * Guarda conocimiento en Supabase
   */
  async saveToSupabase(key, knowledge) {
    try {
      const { data, error } = await supabaseAIService.insert(
        'ai_knowledge_base',
        {
          id: key,
          data: knowledge.data || knowledge,
          source: knowledge.source || 'external',
          validated: knowledge.validated || false,
          confidence: knowledge.confidence || 0.7,
          created_at: new Date(),
          updated_at: new Date()
        }
      );

      if (error) throw error;
      
      console.log(`💾 Guardado conocimiento "${key}" en Supabase`);
    } catch (error) {
      console.error('Error guardando en Supabase:', error);
    }
  }

  /**
   * Actualiza conocimiento automáticamente
   */
  async updateKnowledge() {
    try {
      console.log('🔄 Actualizando base de conocimiento...');

      // 1. Actualizar APIs externas
      await this.updateExternalAPIs();

      // 2. Validar conocimiento existente
      await this.validateExistingKnowledge();

      // 3. Limpiar caché obsoleto
      this.cleanExpiredCache();

      // 4. Sincronizar con Supabase
      await this.syncWithSupabase();

      console.log('✅ Base de conocimiento actualizada');
    } catch (error) {
      console.error('❌ Error actualizando conocimiento:', error);
    }
  }

  /**
   * Actualiza datos de APIs externas
   */
  async updateExternalAPIs() {
    const updatePromises = Object.entries(this.externalAPIs).map(async ([category, config]) => {
      try {
        // Simular actualización de APIs
        console.log(`📡 Actualizando ${category}...`);
        
        // En una implementación real, haría llamadas HTTP reales
        config.lastUpdate = new Date();
        
        return true;
      } catch (error) {
        console.error(`Error actualizando ${category}:`, error);
        return false;
      }
    });

    const results = await Promise.allSettled(updatePromises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    
    console.log(`📊 Actualizadas ${successCount}/${results.length} fuentes externas`);
  }

  /**
   * Inicia actualizaciones automáticas
   */
  startKnowledgeUpdates() {
    if (!this.knowledgeConfig.autoUpdate) return;

    setInterval(() => {
      this.updateKnowledge();
    }, this.knowledgeConfig.updateInterval);

    console.log('🔄 Actualizaciones automáticas de conocimiento iniciadas');
  }

  /**
   * Calcula relevancia de búsqueda
   */
  calculateRelevance(query, data) {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const dataString = JSON.stringify(data).toLowerCase();
    
    let relevance = 0;
    queryTerms.forEach(term => {
      const matches = (dataString.match(new RegExp(term, 'g')) || []).length;
      relevance += matches * 0.1;
    });

    return Math.min(relevance, 1.0);
  }

  /**
   * Valida conocimiento
   */
  async validateKnowledge(key, knowledge) {
    // Validación básica de estructura
    if (!knowledge.data || typeof knowledge.data !== 'object') {
      return false;
    }

    // Validación de confianza
    if (knowledge.confidence < this.knowledgeConfig.validationThreshold) {
      return false;
    }

    // Validación de antigüedad
    const age = new Date() - new Date(knowledge.lastUpdated);
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
    
    if (age > maxAge) {
      return false;
    }

    return true;
  }

  /**
   * Limpia caché expirado
   */
  cleanExpiredCache() {
    const now = new Date();
    let cleaned = 0;

    for (const [key, value] of this.knowledgeSources.cached.entries()) {
      const age = now - new Date(value.lastUpdated);
      if (age > this.knowledgeConfig.cacheExpiry) {
        this.knowledgeSources.cached.delete(key);
        cleaned++;
      }
    }

    console.log(`🧹 Limpiados ${cleaned} items expirados del caché`);
  }

  /**
   * Obtiene métricas de la base de conocimiento
   */
  getKnowledgeMetrics() {
    return {
      internal: this.knowledgeSources.internal.size,
      external: this.knowledgeSources.external.size,
      cached: this.knowledgeSources.cached.size,
      validated: this.knowledgeSources.validated.size,
      total: this.getTotalKnowledgeSize(),
      lastUpdate: new Date(),
      coverage: this.calculateCoverage()
    };
  }

  /**
   * Calcula tamaño total del conocimiento
   */
  getTotalKnowledgeSize() {
    return Object.values(this.knowledgeSources)
      .reduce((total, source) => total + source.size, 0);
  }

  /**
   * Calcula cobertura del conocimiento
   */
  calculateCoverage() {
    const totalCategories = 10; // Categorías esperadas
    const coveredCategories = new Set();
    
    Object.values(this.knowledgeSources).forEach(source => {
      source.forEach((value, key) => {
        const category = key.split('_')[0];
        coveredCategories.add(category);
      });
    });

    return (coveredCategories.size / totalCategories) * 100;
  }

  /**
   * Exporta base de conocimiento
   */
  exportKnowledgeBase() {
    const exportData = {
      knowledgeSources: {},
      config: this.knowledgeConfig,
      externalAPIs: this.externalAPIs,
      exportedAt: new Date()
    };

    Object.entries(this.knowledgeSources).forEach(([key, value]) => {
      exportData.knowledgeSources[key] = Object.fromEntries(value);
    });

    return exportData;
  }

  /**
   * Importa base de conocimiento
   */
  importKnowledgeBase(data) {
    if (data.knowledgeSources) {
      Object.entries(data.knowledgeSources).forEach(([sourceName, sourceData]) => {
        this.knowledgeSources[sourceName] = new Map(Object.entries(sourceData));
      });
    }

    if (data.config) {
      this.knowledgeConfig = { ...this.knowledgeConfig, ...data.config };
    }

    if (data.externalAPIs) {
      this.externalAPIs = { ...this.externalAPIs, ...data.externalAPIs };
    }

    console.log('📥 Base de conocimiento importada exitosamente');
  }
}

// Exportar como singleton
const aiKnowledgeBaseService = new AIKnowledgeBaseService();
export { aiKnowledgeBaseService };
export default aiKnowledgeBaseService;