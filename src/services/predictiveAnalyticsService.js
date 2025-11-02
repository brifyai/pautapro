/**
 * Servicio de Análisis Predictivo para CRM
 * Proporciona funcionalidades avanzadas de predicción y análisis
 */

import { supabase } from '../config/supabase';

class PredictiveAnalyticsService {
  constructor() {
    this.models = {
      customerChurn: null,
      salesForecast: null,
      leadScoring: null,
      marketTrends: null
    };
    
    this.predictions = new Map();
    this.modelAccuracy = new Map();
  }

  /**
   * Predecir probabilidad de churn (abandono) de clientes
   */
  async predictCustomerChurn(clientId, options = {}) {
    try {
      const {
        lookbackDays = 90,
        includeBehavioral = true,
        includeTransactional = true
      } = options;

      // Obtener datos históricos del cliente
      const clientData = await this.getClientHistoricalData(clientId, lookbackDays);
      
      // Calcular factores de riesgo
      const riskFactors = this.calculateChurnRiskFactors(clientData);
      
      // Aplicar modelo predictivo simplificado
      const churnProbability = this.calculateChurnProbability(riskFactors);
      
      // Generar recomendaciones
      const recommendations = this.generateChurnRecommendations(riskFactors, churnProbability);
      
      const prediction = {
        clientId,
        churnProbability,
        riskLevel: this.getRiskLevel(churnProbability),
        riskFactors,
        recommendations,
        confidence: this.calculateConfidence(riskFactors),
        generatedAt: new Date().toISOString(),
        modelVersion: '1.0'
      };

      // Guardar predicción
      this.predictions.set(`churn_${clientId}`, prediction);
      
      // Guardar en base de datos
      await this.savePrediction('churn', prediction);

      return prediction;
    } catch (error) {
      console.error('Error predicting customer churn:', error);
      throw error;
    }
  }

  /**
   * Predecir ventas futuras
   */
  async predictSalesForecast(period = 'monthly', periods = 12) {
    try {
      const historicalData = await this.getSalesHistoricalData(periods * 2);
      
      // Calcular tendencias
      const trends = this.calculateSalesTrends(historicalData);
      
      // Aplicar modelo de pronóstico
      const forecast = this.generateSalesForecast(trends, periods);
      
      // Calcular intervalos de confianza
      const confidenceIntervals = this.calculateConfidenceIntervals(forecast, historicalData);
      
      const prediction = {
        period,
        forecast,
        confidenceIntervals,
        trends,
        accuracy: this.calculateForecastAccuracy(historicalData, forecast),
        generatedAt: new Date().toISOString(),
        modelVersion: '1.0'
      };

      await this.savePrediction('sales_forecast', prediction);
      
      return prediction;
    } catch (error) {
      console.error('Error predicting sales forecast:', error);
      throw error;
    }
  }

  /**
   * Calcular score de leads (clientes potenciales)
   */
  async calculateLeadScore(clientId, options = {}) {
    try {
      const {
        includeDemographics = true,
        includeBehavioral = true,
        includeContextual = true
      } = options;

      const clientData = await this.getClientData(clientId);
      
      // Calcular factores de scoring
      const demographicScore = includeDemographics ? this.calculateDemographicScore(clientData) : 0;
      const behavioralScore = includeBehavioral ? this.calculateBehavioralScore(clientData) : 0;
      const contextualScore = includeContextual ? this.calculateContextualScore(clientData) : 0;
      
      // Calcular score total
      const totalScore = demographicScore + behavioralScore + contextualScore;
      const normalizedScore = Math.min(100, Math.max(0, totalScore));
      
      // Determinar categoría
      const category = this.getLeadCategory(normalizedScore);
      
      const scoring = {
        clientId,
        totalScore: normalizedScore,
        category,
        breakdown: {
          demographic: demographicScore,
          behavioral: behavioralScore,
          contextual: contextualScore
        },
        recommendations: this.generateLeadRecommendations(normalizedScore, category),
        generatedAt: new Date().toISOString()
      };

      await this.savePrediction('lead_scoring', scoring);
      
      return scoring;
    } catch (error) {
      console.error('Error calculating lead score:', error);
      throw error;
    }
  }

  /**
   * Analizar tendencias del mercado
   */
  async analyzeMarketTrends(industry = 'general', timeframe = '12months') {
    try {
      const marketData = await this.getMarketData(industry, timeframe);
      
      // Identificar patrones
      const patterns = this.identifyMarketPatterns(marketData);
      
      // Calcular índices de tendencia
      const trendIndices = this.calculateTrendIndices(patterns);
      
      // Generar insights
      const insights = this.generateMarketInsights(patterns, trendIndices);
      
      const analysis = {
        industry,
        timeframe,
        patterns,
        trendIndices,
        insights,
        recommendations: this.generateMarketRecommendations(insights),
        generatedAt: new Date().toISOString()
      };

      await this.savePrediction('market_trends', analysis);
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing market trends:', error);
      throw error;
    }
  }

  /**
   * Obtener datos históricos del cliente
   */
  async getClientHistoricalData(clientId, days) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const [orders, interactions, campaigns] = await Promise.all([
        supabase
          .from('ordenes')
          .select('*')
          .eq('id_cliente', clientId)
          .gte('created_at', cutoffDate.toISOString()),
        
        supabase
          .from('client_interactions')
          .select('*')
          .eq('client_id', clientId)
          .gte('created_at', cutoffDate.toISOString()),
        
        supabase
          .from('campanas')
          .select('*')
          .eq('id_cliente', clientId)
          .gte('created_at', cutoffDate.toISOString())
      ]);

      return {
        orders: orders.data || [],
        interactions: interactions.data || [],
        campaigns: campaigns.data || []
      };
    } catch (error) {
      console.error('Error getting client historical data:', error);
      return { orders: [], interactions: [], campaigns: [] };
    }
  }

  /**
   * Calcular factores de riesgo de churn
   */
  calculateChurnRiskFactors(clientData) {
    const factors = {
      recency: 0,
      frequency: 0,
      monetary: 0,
      engagement: 0,
      satisfaction: 0
    };

    // Análisis de recencia
    if (clientData.orders.length > 0) {
      const lastOrder = new Date(clientData.orders[0].created_at);
      const daysSinceLastOrder = (Date.now() - lastOrder) / (1000 * 60 * 60 * 24);
      factors.recency = Math.min(100, daysSinceLastOrder / 30 * 100);
    } else {
      factors.recency = 100;
    }

    // Análisis de frecuencia
    const orderFrequency = clientData.orders.length;
    factors.frequency = Math.max(0, 100 - orderFrequency * 10);

    // Análisis monetario
    const totalSpent = clientData.orders.reduce((sum, order) => sum + (order.total || 0), 0);
    factors.monetary = totalSpent > 10000 ? 0 : totalSpent > 5000 ? 25 : totalSpent > 1000 ? 50 : 75;

    // Análisis de engagement
    const interactionCount = clientData.interactions.length;
    factors.engagement = Math.max(0, 100 - interactionCount * 5);

    // Análisis de satisfacción (simulado)
    factors.satisfaction = Math.random() * 30; // Simulación de encuestas de satisfacción

    return factors;
  }

  /**
   * Calcular probabilidad de churn
   */
  calculateChurnProbability(riskFactors) {
    const weights = {
      recency: 0.3,
      frequency: 0.25,
      monetary: 0.2,
      engagement: 0.15,
      satisfaction: 0.1
    };

    let weightedScore = 0;
    for (const [factor, value] of Object.entries(riskFactors)) {
      weightedScore += value * weights[factor];
    }

    return Math.min(100, Math.max(0, weightedScore));
  }

  /**
   * Generar recomendaciones para reducir churn
   */
  generateChurnRecommendations(riskFactors, probability) {
    const recommendations = [];

    if (riskFactors.recency > 70) {
      recommendations.push({
        priority: 'high',
        action: 'Contactar cliente inmediatamente',
        reason: 'Ha pasado mucho tiempo desde la última compra'
      });
    }

    if (riskFactors.frequency > 60) {
      recommendations.push({
        priority: 'medium',
        action: 'Ofrecer programa de fidelización',
        reason: 'Baja frecuencia de compras'
      });
    }

    if (riskFactors.engagement > 50) {
      recommendations.push({
        priority: 'medium',
        action: 'Aumentar comunicación y seguimiento',
        reason: 'Bajo nivel de engagement'
      });
    }

    if (probability > 70) {
      recommendations.push({
        priority: 'urgent',
        action: 'Asignar gestor de cuenta dedicado',
        reason: 'Alto riesgo de abandono'
      });
    }

    return recommendations;
  }

  /**
   * Obtener nivel de riesgo
   */
  getRiskLevel(probability) {
    if (probability >= 80) return 'critical';
    if (probability >= 60) return 'high';
    if (probability >= 40) return 'medium';
    if (probability >= 20) return 'low';
    return 'minimal';
  }

  /**
   * Calcular confianza de la predicción
   */
  calculateConfidence(riskFactors) {
    const dataPoints = Object.values(riskFactors).filter(v => v > 0).length;
    return Math.min(95, Math.max(50, dataPoints * 15));
  }

  /**
   * Obtener datos históricos de ventas
   */
  async getSalesHistoricalData(months) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - months);

      const { data, error } = await supabase
        .from('ordenes')
        .select('created_at, total')
        .gte('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error getting sales historical data:', error);
      return [];
    }
  }

  /**
   * Calcular tendencias de ventas
   */
  calculateSalesTrends(historicalData) {
    // Agrupar por mes
    const monthlyData = {};
    historicalData.forEach(order => {
      const month = order.created_at.substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, count: 0 };
      }
      monthlyData[month].total += order.total || 0;
      monthlyData[month].count += 1;
    });

    // Calcular tendencias
    const months = Object.keys(monthlyData).sort();
    const values = months.map(month => monthlyData[month].total);
    
    return {
      months,
      values,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      growth: this.calculateGrowthRate(values)
    };
  }

  /**
   * Calcular tasa de crecimiento
   */
  calculateGrowthRate(values) {
    if (values.length < 2) return 0;
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    return ((lastValue - firstValue) / firstValue) * 100;
  }

  /**
   * Generar pronóstico de ventas
   */
  generateSalesForecast(trends, periods) {
    const forecast = [];
    const lastValue = trends.values[trends.values.length - 1] || 0;
    const growthRate = trends.growth / 100 / 12; // Crecimiento mensual

    for (let i = 1; i <= periods; i++) {
      const predictedValue = lastValue * Math.pow(1 + growthRate, i);
      forecast.push({
        period: i,
        value: predictedValue,
        confidence: Math.max(70, 95 - i * 2) // La confianza disminuye con el tiempo
      });
    }

    return forecast;
  }

  /**
   * Calcular intervalos de confianza
   */
  calculateConfidenceIntervals(forecast, historicalData) {
    const variance = this.calculateVariance(historicalData.map(d => d.total || 0));
    const stdDev = Math.sqrt(variance);

    return forecast.map(item => ({
      period: item.period,
      lower: Math.max(0, item.value - 1.96 * stdDev),
      upper: item.value + 1.96 * stdDev,
      confidence: item.confidence
    }));
  }

  /**
   * Calcular varianza
   */
  calculateVariance(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
  }

  /**
   * Calcular precisión del pronóstico
   */
  calculateForecastAccuracy(historicalData, forecast) {
    // Simulación de precisión basada en volatilidad histórica
    const variance = this.calculateVariance(historicalData.map(d => d.total || 0));
    const mean = historicalData.reduce((sum, d) => sum + (d.total || 0), 0) / historicalData.length;
    const coefficientOfVariation = Math.sqrt(variance) / mean;
    
    return Math.max(60, Math.min(95, 100 - coefficientOfVariation * 50));
  }

  /**
   * Obtener datos del cliente
   */
  async getClientData(clientId) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id_cliente', clientId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting client data:', error);
      return {};
    }
  }

  /**
   * Calcular score demográfico
   */
  calculateDemographicScore(clientData) {
    let score = 0;
    
    // Industria
    if (clientData.industria) score += 15;
    
    // Tamaño de empresa
    if (clientData.tamano_empresa === 'grande') score += 20;
    else if (clientData.tamano_empresa === 'mediana') score += 15;
    else if (clientData.tamano_empresa === 'pequena') score += 10;
    
    // Ubicación
    if (clientData.region) score += 10;
    
    // Antigüedad
    if (clientData.fecha_creacion) {
      const yearsInBusiness = (Date.now() - new Date(clientData.fecha_creacion)) / (1000 * 60 * 60 * 24 * 365);
      score += Math.min(15, yearsInBusiness * 3);
    }

    return Math.min(40, score);
  }

  /**
   * Calcular score de comportamiento
   */
  calculateBehavioralScore(clientData) {
    let score = 0;
    
    // Historial de compras
    if (clientData.total_compras > 50000) score += 25;
    else if (clientData.total_compras > 20000) score += 20;
    else if (clientData.total_compras > 5000) score += 15;
    
    // Frecuencia de compra
    if (clientData.frecuencia_compra === 'mensual') score += 20;
    else if (clientData.frecuencia_compra === 'trimestral') score += 15;
    else if (clientData.frecuencia_compra === 'anual') score += 10;
    
    // Interacciones
    score += Math.min(15, (clientData.interacciones || 0) * 2);

    return Math.min(40, score);
  }

  /**
   * Calcular score contextual
   */
  calculateContextualScore(clientData) {
    let score = 0;
    
    // Temporada (simulación)
    const currentSeason = new Date().getMonth();
    if (currentSeason >= 9 && currentSeason <= 11) score += 10; // Q4
    
    // Condiciones del mercado (simulación)
    score += Math.random() * 10;
    
    // Competencia (simulación)
    score += Math.random() * 10;

    return Math.min(20, score);
  }

  /**
   * Obtener categoría de lead
   */
  getLeadCategory(score) {
    if (score >= 80) return 'hot';
    if (score >= 60) return 'warm';
    if (score >= 40) return 'cool';
    return 'cold';
  }

  /**
   * Generar recomendaciones para leads
   */
  generateLeadRecommendations(score, category) {
    const recommendations = [];

    switch (category) {
      case 'hot':
        recommendations.push({
          priority: 'high',
          action: 'Contactar inmediatamente',
          reason: 'Lead con alto potencial de conversión'
        });
        recommendations.push({
          priority: 'medium',
          action: 'Ofrecer demo personalizada',
          reason: 'Alto interés demostrado'
        });
        break;
      case 'warm':
        recommendations.push({
          priority: 'medium',
          action: 'Nurturing con contenido relevante',
          reason: 'Interés moderado, requiere seguimiento'
        });
        break;
      case 'cool':
        recommendations.push({
          priority: 'low',
          action: 'Agregar a campaña de email marketing',
          reason: 'Potencial a largo plazo'
        });
        break;
      case 'cold':
        recommendations.push({
          priority: 'low',
          action: 'Mantener en base de datos',
          reason: 'Bajo potencial actual'
        });
        break;
    }

    return recommendations;
  }

  /**
   * Guardar predicción en base de datos
   */
  async savePrediction(type, prediction) {
    try {
      const { error } = await supabase
        .from('predictions')
        .insert({
          type,
          client_id: prediction.clientId || null,
          prediction_data: prediction,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving prediction:', error);
    }
  }

  /**
   * Obtener predicciones guardadas
   */
  async getPredictions(type = null, clientId = null) {
    try {
      let query = supabase
        .from('predictions')
        .select('*')
        .order('created_at', { ascending: false });

      if (type) query = query.eq('type', type);
      if (clientId) query = query.eq('client_id', clientId);

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting predictions:', error);
      return [];
    }
  }

  /**
   * Generar reporte de análisis predictivo
   */
  async generatePredictiveReport(clientId = null) {
    try {
      const report = {
        generatedAt: new Date().toISOString(),
        clientId,
        sections: []
      };

      if (clientId) {
        // Análisis específico del cliente
        const [churnPrediction, leadScore] = await Promise.all([
          this.predictCustomerChurn(clientId),
          this.calculateLeadScore(clientId)
        ]);

        report.sections.push({
          title: 'Análisis de Cliente',
          data: {
            churnPrediction,
            leadScore
          }
        });
      } else {
        // Análisis general
        const [salesForecast, marketTrends] = await Promise.all([
          this.predictSalesForecast(),
          this.analyzeMarketTrends()
        ]);

        report.sections.push({
          title: 'Análisis General',
          data: {
            salesForecast,
            marketTrends
          }
        });
      }

      return report;
    } catch (error) {
      console.error('Error generating predictive report:', error);
      throw error;
    }
  }
}

export default new PredictiveAnalyticsService();