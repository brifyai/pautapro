/**
 * Servicio de Scoring de Clientes para CRM
 * Proporciona un sistema avanzado de evaluación y clasificación de clientes
 */

import { supabase } from '../config/supabase';

class ClientScoringService {
  constructor() {
    this.scoringModels = {
      basic: 'basic',
      advanced: 'advanced',
      predictive: 'predictive'
    };
    
    this.scoringFactors = {
      demographic: {
        weight: 0.15,
        subFactors: {
          industry: 0.3,
          companySize: 0.4,
          location: 0.2,
          yearsInBusiness: 0.1
        }
      },
      behavioral: {
        weight: 0.35,
        subFactors: {
          purchaseFrequency: 0.3,
          averageOrderValue: 0.3,
          productVariety: 0.2,
          engagementLevel: 0.2
        }
      },
      transactional: {
        weight: 0.30,
        subFactors: {
          totalRevenue: 0.4,
          revenueGrowth: 0.3,
          paymentHistory: 0.2,
          profitability: 0.1
        }
      },
      relational: {
        weight: 0.20,
        subFactors: {
          interactionFrequency: 0.3,
          responseRate: 0.3,
          satisfactionScore: 0.2,
          loyaltyIndicators: 0.2
        }
      }
    };

    this.scoreCategories = {
      elite: { min: 90, label: 'Élite', color: '#FF6B6B' },
      premium: { min: 75, label: 'Premium', color: '#4ECDC4' },
      valuable: { min: 60, label: 'Valioso', color: '#45B7D1' },
      standard: { min: 40, label: 'Estándar', color: '#96CEB4' },
      developing: { min: 20, label: 'En Desarrollo', color: '#FFEAA7' },
      at_risk: { min: 0, label: 'En Riesgo', color: '#DFE6E9' }
    };
  }

  /**
   * Calcular score completo del cliente
   */
  async calculateClientScore(clientId, model = 'advanced') {
    try {
      const clientData = await this.getClientData(clientId);
      
      let score;
      switch (model) {
        case 'basic':
          score = await this.calculateBasicScore(clientData);
          break;
        case 'advanced':
          score = await this.calculateAdvancedScore(clientData);
          break;
        case 'predictive':
          score = await this.calculatePredictiveScore(clientData);
          break;
        default:
          score = await this.calculateAdvancedScore(clientData);
      }

      // Determinar categoría
      const category = this.determineScoreCategory(score.totalScore);
      
      // Generar insights y recomendaciones
      const insights = this.generateScoreInsights(score, category);
      const recommendations = this.generateScoreRecommendations(score, category);
      
      const finalScore = {
        clientId,
        model,
        totalScore: score.totalScore,
        category: category.label,
        categoryColor: category.color,
        breakdown: score.breakdown,
        insights,
        recommendations,
        calculatedAt: new Date().toISOString(),
        confidence: score.confidence || 85
      };

      // Guardar en base de datos
      await this.saveClientScore(finalScore);
      
      return finalScore;
    } catch (error) {
      console.error('Error calculating client score:', error);
      throw error;
    }
  }

  /**
   * Calcular score básico
   */
  async calculateBasicScore(clientData) {
    const scores = {
      demographic: this.calculateDemographicScore(clientData),
      behavioral: this.calculateBehavioralScore(clientData),
      transactional: this.calculateTransactionalScore(clientData)
    };

    const totalScore = (
      scores.demographic * 0.25 +
      scores.behavioral * 0.35 +
      scores.transactional * 0.40
    );

    return {
      totalScore: Math.round(totalScore),
      breakdown: scores,
      confidence: 70
    };
  }

  /**
   * Calcular score avanzado
   */
  async calculateAdvancedScore(clientData) {
    const scores = {
      demographic: this.calculateDemographicScore(clientData),
      behavioral: this.calculateBehavioralScore(clientData),
      transactional: this.calculateTransactionalScore(clientData),
      relational: await this.calculateRelationalScore(clientData)
    };

    const totalScore = (
      scores.demographic * this.scoringFactors.demographic.weight +
      scores.behavioral * this.scoringFactors.behavioral.weight +
      scores.transactional * this.scoringFactors.transactional.weight +
      scores.relational * this.scoringFactors.relational.weight
    );

    return {
      totalScore: Math.round(totalScore),
      breakdown: scores,
      confidence: 85
    };
  }

  /**
   * Calcular score predictivo
   */
  async calculatePredictiveScore(clientData) {
    // Obtener score avanzado base
    const advancedScore = await this.calculateAdvancedScore(clientData);
    
    // Aplicar factores predictivos
    const predictiveFactors = await this.calculatePredictiveFactors(clientData);
    
    // Ajustar score basado en predicciones
    const predictiveAdjustment = (
      predictiveFactors.churnRisk * -0.2 +
      predictiveFactors.growthPotential * 0.15 +
      predictiveFactors.marketFit * 0.1 +
      predictiveFactors.competitivePosition * 0.05
    );

    const adjustedScore = Math.max(0, Math.min(100, 
      advancedScore.totalScore + (predictiveAdjustment * 100)
    ));

    return {
      totalScore: Math.round(adjustedScore),
      breakdown: {
        ...advancedScore.breakdown,
        predictive: predictiveFactors
      },
      confidence: 75,
      predictiveAdjustment: Math.round(predictiveAdjustment * 100)
    };
  }

  /**
   * Obtener datos del cliente
   */
  async getClientData(clientId) {
    try {
      const [client, orders, interactions, campaigns] = await Promise.all([
        supabase
          .from('clientes')
          .select('*')
          .eq('id_cliente', clientId)
          .single(),
        
        supabase
          .from('ordenes')
          .select('*')
          .eq('id_cliente', clientId)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('client_interactions')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('campanas')
          .select('*')
          .eq('id_cliente', clientId)
          .order('created_at', { ascending: false })
      ]);

      return {
        client: client.data,
        orders: orders.data || [],
        interactions: interactions.data || [],
        campaigns: campaigns.data || []
      };
    } catch (error) {
      console.error('Error getting client data:', error);
      return {
        client: {},
        orders: [],
        interactions: [],
        campaigns: []
      };
    }
  }

  /**
   * Calcular score demográfico
   */
  calculateDemographicScore(clientData) {
    const { client } = clientData;
    let score = 0;
    const factors = this.scoringFactors.demographic.subFactors;

    // Industria
    if (client.industria) {
      const highValueIndustries = ['tecnologia', 'finanzas', 'salud', 'manufactura'];
      score += highValueIndustries.includes(client.industria.toLowerCase()) ? 100 * factors.industry : 60 * factors.industry;
    }

    // Tamaño de empresa
    if (client.tamano_empresa) {
      const sizeScores = {
        'grande': 100,
        'mediana': 80,
        'pequena': 60,
        'micro': 40
      };
      score += (sizeScores[client.tamano_empresa.toLowerCase()] || 50) * factors.companySize;
    }

    // Ubicación
    if (client.region || client.ciudad) {
      // Simulación de evaluación de ubicación
      score += 70 * factors.location;
    }

    // Años en el negocio
    if (client.fecha_creacion) {
      const yearsInBusiness = (Date.now() - new Date(client.fecha_creacion)) / (1000 * 60 * 60 * 24 * 365);
      score += Math.min(100, yearsInBusiness * 5) * factors.yearsInBusiness;
    }

    return Math.round(score);
  }

  /**
   * Calcular score de comportamiento
   */
  calculateBehavioralScore(clientData) {
    const { orders, interactions } = clientData;
    let score = 0;
    const factors = this.scoringFactors.behavioral.subFactors;

    // Frecuencia de compra
    if (orders.length > 0) {
      const firstOrder = new Date(orders[orders.length - 1]?.created_at);
      const daysSinceFirstOrder = (Date.now() - firstOrder) / (1000 * 60 * 60 * 24);
      const purchaseFrequency = daysSinceFirstOrder > 0 ? (orders.length / daysSinceFirstOrder) * 30 : 0;
      score += Math.min(100, purchaseFrequency * 20) * factors.purchaseFrequency;
    }

    // Valor promedio de orden
    if (orders.length > 0) {
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const avgOrderValue = totalRevenue / orders.length;
      score += Math.min(100, avgOrderValue / 1000) * factors.averageOrderValue;
    }

    // Variedad de productos
    const uniqueProducts = new Set(orders.flatMap(order => order.productos || [])).size;
    score += Math.min(100, uniqueProducts * 10) * factors.productVariety;

    // Nivel de engagement
    const interactionScore = Math.min(100, interactions.length * 5);
    score += interactionScore * factors.engagementLevel;

    return Math.round(score);
  }

  /**
   * Calcular score transaccional
   */
  calculateTransactionalScore(clientData) {
    const { orders } = clientData;
    let score = 0;
    const factors = this.scoringFactors.transactional.subFactors;

    if (orders.length === 0) return 0;

    // Ingresos totales
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    score += Math.min(100, totalRevenue / 50000) * factors.totalRevenue;

    // Crecimiento de ingresos
    if (orders.length >= 2) {
      const recentOrders = orders.slice(0, Math.ceil(orders.length / 2));
      const olderOrders = orders.slice(Math.ceil(orders.length / 2));
      
      const recentRevenue = recentOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const olderRevenue = olderOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      const growthRate = olderRevenue > 0 ? ((recentRevenue - olderRevenue) / olderRevenue) * 100 : 0;
      score += Math.max(0, Math.min(100, 50 + growthRate)) * factors.revenueGrowth;
    }

    // Historial de pagos (simulado)
    score += 85 * factors.paymentHistory;

    // Rentabilidad (simulada)
    score += 75 * factors.profitability;

    return Math.round(score);
  }

  /**
   * Calcular score relacional
   */
  async calculateRelationalScore(clientData) {
    const { interactions, campaigns } = clientData;
    let score = 0;
    const factors = this.scoringFactors.relational.subFactors;

    // Frecuencia de interacción
    const interactionFrequency = Math.min(100, interactions.length * 3);
    score += interactionFrequency * factors.interactionFrequency;

    // Tasa de respuesta (simulada)
    const responseRate = Math.random() * 30 + 60; // 60-90%
    score += responseRate * factors.responseRate;

    // Score de satisfacción (simulado)
    const satisfactionScore = Math.random() * 20 + 70; // 70-90%
    score += satisfactionScore * factors.satisfactionScore;

    // Indicadores de lealtad
    const loyaltyIndicators = this.calculateLoyaltyIndicators(clientData);
    score += loyaltyIndicators * factors.loyaltyIndicators;

    return Math.round(score);
  }

  /**
   * Calcular indicadores de lealtad
   */
  calculateLoyaltyIndicators(clientData) {
    const { orders, campaigns } = clientData;
    let indicators = 50;

    // Antigüedad como cliente
    if (orders.length > 0) {
      const firstOrder = new Date(orders[orders.length - 1].created_at);
      const monthsAsClient = (Date.now() - firstOrder) / (1000 * 60 * 60 * 24 * 30);
      indicators += Math.min(25, monthsAsClient);
    }

    // Participación en campañas
    if (campaigns.length > 0) {
      indicators += Math.min(25, campaigns.length * 5);
    }

    return Math.min(100, indicators);
  }

  /**
   * Calcular factores predictivos
   */
  async calculatePredictiveFactors(clientData) {
    return {
      churnRisk: await this.calculateChurnRisk(clientData),
      growthPotential: await this.calculateGrowthPotential(clientData),
      marketFit: this.calculateMarketFit(clientData),
      competitivePosition: this.calculateCompetitivePosition(clientData)
    };
  }

  /**
   * Calcular riesgo de churn
   */
  async calculateChurnRisk(clientData) {
    // Simulación de cálculo de riesgo de churn
    const { orders, interactions } = clientData;
    
    let risk = 0.1; // Base 10%

    // Factores que aumentan el riesgo
    if (orders.length > 0) {
      const lastOrder = new Date(orders[0].created_at);
      const daysSinceLastOrder = (Date.now() - lastOrder) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastOrder > 90) risk += 0.3;
      else if (daysSinceLastOrder > 60) risk += 0.2;
      else if (daysSinceLastOrder > 30) risk += 0.1;
    }

    if (interactions.length < 5) risk += 0.2;

    return Math.min(0.9, risk);
  }

  /**
   * Calcular potencial de crecimiento
   */
  async calculateGrowthPotential(clientData) {
    // Simulación de cálculo de potencial de crecimiento
    const { client, orders } = clientData;
    
    let potential = 0.5; // Base 50%

    // Factores que aumentan el potencial
    if (client.tamano_empresa === 'mediana' || client.tamano_empresa === 'grande') {
      potential += 0.2;
    }

    if (orders.length > 0) {
      const avgOrderValue = orders.reduce((sum, order) => sum + (order.total || 0), 0) / orders.length;
      if (avgOrderValue < 5000) potential += 0.2; // Espacio para crecimiento
    }

    return Math.min(1.0, potential);
  }

  /**
   * Calcular fit de mercado
   */
  calculateMarketFit(clientData) {
    // Simulación de cálculo de fit de mercado
    return Math.random() * 0.4 + 0.6; // 60-100%
  }

  /**
   * Calcular posición competitiva
   */
  calculateCompetitivePosition(clientData) {
    // Simulación de cálculo de posición competitiva
    return Math.random() * 0.5 + 0.5; // 50-100%
  }

  /**
   * Determinar categoría de score
   */
  determineScoreCategory(score) {
    for (const [key, category] of Object.entries(this.scoreCategories)) {
      if (score >= category.min) {
        return category;
      }
    }
    return this.scoreCategories.at_risk;
  }

  /**
   * Generar insights del score
   */
  generateScoreInsights(score, category) {
    const insights = [];

    // Insights basados en el score total
    if (score.totalScore >= 80) {
      insights.push('Cliente con alto valor y potencial de crecimiento');
    } else if (score.totalScore >= 60) {
      insights.push('Cliente estable con oportunidades de mejora');
    } else if (score.totalScore >= 40) {
      insights.push('Cliente requiere atención y desarrollo');
    } else {
      insights.push('Cliente en riesgo, requiere intervención inmediata');
    }

    // Insights basados en breakdown
    const breakdown = score.breakdown;
    if (breakdown.behavioral && breakdown.behavioral < 50) {
      insights.push('Bajo nivel de engagement, recomendamos aumentar interacción');
    }

    if (breakdown.transactional && breakdown.transactional > 80) {
      insights.push('Alto valor transaccional, cliente clave para el negocio');
    }

    if (breakdown.relational && breakdown.relational < 40) {
      insights.push('Relación débil, necesita fortalecimiento de vínculo');
    }

    return insights;
  }

  /**
   * Generar recomendaciones
   */
  generateScoreRecommendations(score, category) {
    const recommendations = [];

    switch (category.label) {
      case 'Élite':
        recommendations.push({
          priority: 'medium',
          action: 'Programa VIP exclusivo',
          reason: 'Mantener y recompensar lealtad'
        });
        recommendations.push({
          priority: 'low',
          action: 'Referidos y testimonios',
          reason: 'Aprovechar satisfacción para crecimiento'
        });
        break;

      case 'Premium':
        recommendations.push({
          priority: 'high',
          action: 'Cross-selling y upselling',
          reason: 'Maximizar valor del cliente'
        });
        recommendations.push({
          priority: 'medium',
          action: 'Contacto personalizado',
          reason: 'Fortalecer relación'
        });
        break;

      case 'Valioso':
        recommendations.push({
          priority: 'high',
          action: 'Plan de desarrollo',
          reason: 'Potencial de crecimiento'
        });
        recommendations.push({
          priority: 'medium',
          action: 'Capacitación y soporte',
          reason: 'Aumentar engagement'
        });
        break;

      case 'Estándar':
        recommendations.push({
          priority: 'medium',
          action: 'Segmentación de contenido',
          reason: 'Personalizar comunicación'
        });
        recommendations.push({
          priority: 'low',
          action: 'Encuestas de satisfacción',
          reason: 'Conocer mejor al cliente'
        });
        break;

      case 'En Desarrollo':
        recommendations.push({
          priority: 'high',
          action: 'Nurturing activo',
          reason: 'Desarrollar potencial'
        });
        recommendations.push({
          priority: 'medium',
          action: 'Ofertas especiales',
          reason: 'Estimular primeras compras'
        });
        break;

      case 'En Riesgo':
        recommendations.push({
          priority: 'urgent',
          action: 'Plan de retención',
          reason: 'Evitar pérdida del cliente'
        });
        recommendations.push({
          priority: 'high',
          action: 'Análisis de causas',
          reason: 'Identificar problemas raíz'
        });
        break;
    }

    return recommendations;
  }

  /**
   * Guardar score del cliente
   */
  async saveClientScore(scoreData) {
    try {
      const { error } = await supabase
        .from('client_scoring')
        .upsert({
          client_id: scoreData.clientId,
          model: scoreData.model,
          total_score: scoreData.totalScore,
          category: scoreData.category,
          category_color: scoreData.categoryColor,
          breakdown: scoreData.breakdown,
          insights: scoreData.insights,
          recommendations: scoreData.recommendations,
          confidence: scoreData.confidence,
          calculated_at: scoreData.calculatedAt,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving client score:', error);
    }
  }

  /**
   * Obtener scores de clientes
   */
  async getClientScores(clientId = null, model = 'advanced') {
    try {
      let query = supabase
        .from('client_scoring')
        .select('*')
        .eq('model', model)
        .order('calculated_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting client scores:', error);
      return [];
    }
  }

  /**
   * Obtener distribución de scores
   */
  async getScoreDistribution(model = 'advanced') {
    try {
      const scores = await this.getClientScores(null, model);
      
      const distribution = scores.reduce((acc, score) => {
        const category = score.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      return distribution;
    } catch (error) {
      console.error('Error getting score distribution:', error);
      return {};
    }
  }

  /**
   * Obtener top clientes por score
   */
  async getTopClients(limit = 10, model = 'advanced') {
    try {
      const { data, error } = await supabase
        .from('client_scoring')
        .select('*')
        .eq('model', model)
        .order('total_score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting top clients:', error);
      return [];
    }
  }

  /**
   * Recalcular scores de todos los clientes
   */
  async recalculateAllScores(model = 'advanced') {
    try {
      const { data: clients, error } = await supabase
        .from('clientes')
        .select('id_cliente')
        .eq('estado', 'activo');

      if (error) throw error;

      const results = [];
      for (const client of clients) {
        try {
          const score = await this.calculateClientScore(client.id_cliente, model);
          results.push(score);
        } catch (error) {
          console.error(`Error calculating score for client ${client.id_cliente}:`, error);
        }
      }

      return results;
    } catch (error) {
      console.error('Error recalculating all scores:', error);
      throw error;
    }
  }

  /**
   * Obtener modelos de scoring disponibles
   */
  getAvailableModels() {
    return Object.keys(this.scoringModels);
  }

  /**
   * Obtener categorías de scoring
   */
  getScoreCategories() {
    return this.scoreCategories;
  }

  /**
   * Obtener factores de scoring
   */
  getScoringFactors() {
    return this.scoringFactors;
  }

  /**
   * Obtener estadísticas de scoring para el dashboard
   */
  async getScoringStats() {
    try {
      const scores = await this.getClientScores();
      
      const stats = {
        totalScored: scores.length,
        averageScore: scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score.total_score, 0) / scores.length) : 0,
        eliteCount: scores.filter(s => s.category === 'Élite').length,
        premiumCount: scores.filter(s => s.category === 'Premium').length,
        valuableCount: scores.filter(s => s.category === 'Valioso').length,
        standardCount: scores.filter(s => s.category === 'Estándar').length,
        developingCount: scores.filter(s => s.category === 'En Desarrollo').length,
        atRiskCount: scores.filter(s => s.category === 'En Riesgo').length
      };

      return stats;
    } catch (error) {
      console.error('Error getting scoring stats:', error);
      return {
        totalScored: 0,
        averageScore: 0,
        eliteCount: 0,
        premiumCount: 0,
        valuableCount: 0,
        standardCount: 0,
        developingCount: 0,
        atRiskCount: 0
      };
    }
  }

  /**
   * Obtener tasa de retención de clientes
   */
  async getClientRetentionRate() {
    try {
      // Simulación de cálculo de tasa de retención
      // En un caso real, esto calcularía basado en datos históricos
      const { data: activeClients, error } = await supabase
        .from('clientes')
        .select('id_cliente')
        .eq('estado', true);

      if (error) throw error;

      // Simulación: asumimos 85% de retención
      const retentionRate = 85;
      
      return retentionRate;
    } catch (error) {
      console.error('Error calculating client retention rate:', error);
      return 85; // Valor por defecto
    }
  }

  /**
   * Obtener score de un cliente específico
   */
  async getClientScore(clientId) {
    try {
      const { data, error } = await supabase
        .from('client_scoring')
        .select('*')
        .eq('client_id', clientId)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // Si no hay score guardado, calcular uno nuevo
        return await this.calculateClientScore(clientId);
      }

      return {
        clientId: data.client_id,
        level: this.determineScoreCategory(data.total_score).label,
        totalScore: data.total_score,
        trends: {
          direction: 'stable' // Simulación
        },
        riskLevel: {
          riskLevel: 'low', // Simulación
          probability: 10 // Simulación
        },
        calculatedAt: data.calculated_at,
        breakdown: data.breakdown || {},
        recommendations: data.recommendations || []
      };
    } catch (error) {
      console.error('Error getting client score:', error);
      throw error;
    }
  }

  /**
   * Niveles de cliente para UI
   */
  get clientLevels() {
    return {
      elite: {
        label: 'Élite',
        color: '#FF6B6B',
        icon: '👑',
        benefits: ['Soporte prioritario', 'Descuentos exclusivos', 'Acceso anticipado']
      },
      premium: {
        label: 'Premium',
        color: '#4ECDC4',
        icon: '⭐',
        benefits: ['Soporte extendido', 'Promociones especiales', 'Eventos exclusivos']
      },
      valuable: {
        label: 'Valioso',
        color: '#45B7D1',
        icon: '💎',
        benefits: ['Soporte preferencial', 'Ofertas personalizadas']
      },
      standard: {
        label: 'Estándar',
        color: '#96CEB4',
        icon: '👤',
        benefits: ['Soporte estándar', 'Promociones generales']
      },
      developing: {
        label: 'En Desarrollo',
        color: '#FFEAA7',
        icon: '🌱',
        benefits: ['Soporte básico', 'Programa de desarrollo']
      },
      prospect: {
        label: 'Prospecto',
        color: '#DFE6E9',
        icon: '🔍',
        benefits: ['Información básica', 'Seguimiento inicial']
      }
    };
  }
}

export default new ClientScoringService();