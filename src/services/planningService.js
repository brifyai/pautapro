import { supabase } from '../config/supabase';

export const planningService = {
  // Validar planificación completa (versión mejorada)
  async validatePlanning(planData) {
    const errors = [];
    const warnings = [];
    const suggestions = [];
    const metrics = {};

    try {
      // Validar presupuesto vs histórico
      const budgetValidation = await this.validateBudget(planData);
      errors.push(...budgetValidation.errors);
      warnings.push(...budgetValidation.warnings);
      suggestions.push(...budgetValidation.suggestions);
      metrics.budget = budgetValidation.metrics;

      // Validar disponibilidad de fechas
      const dateValidation = await this.validateDates(planData);
      errors.push(...dateValidation.errors);
      warnings.push(...dateValidation.warnings);
      suggestions.push(...dateValidation.suggestions);
      metrics.dates = dateValidation.metrics;

      // Validar capacidad del medio
      const capacityValidation = await this.validateCapacity(planData);
      errors.push(...capacityValidation.errors);
      warnings.push(...capacityValidation.warnings);
      suggestions.push(...capacityValidation.suggestions);
      metrics.capacity = capacityValidation.metrics;

      // Validar sinergia entre medios
      const synergyValidation = await this.validateMediaSynergy(planData);
      errors.push(...synergyValidation.errors);
      warnings.push(...synergyValidation.warnings);
      suggestions.push(...synergyValidation.suggestions);
      metrics.synergy = synergyValidation.metrics;

      // Validar ROI esperado
      const roiValidation = await this.validateExpectedROI(planData);
      errors.push(...roiValidation.errors);
      warnings.push(...roiValidation.warnings);
      suggestions.push(...roiValidation.suggestions);
      metrics.roi = roiValidation.metrics;

      // Generar recomendaciones inteligentes
      const recommendations = await this.generateSmartRecommendations(planData, metrics);
      suggestions.push(...recommendations);

    } catch (error) {
      console.error('Error validando planificación:', error);
      errors.push('Error interno del sistema de validación');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      metrics,
      severity: this.calculateSeverity(errors, warnings),
      score: this.calculatePlanningScore(metrics, errors, warnings)
    };
  },

  // Validar sinergia entre medios
  async validateMediaSynergy(planData) {
    const errors = [];
    const warnings = [];
    const suggestions = [];
    const metrics = {};

    try {
      if (!planData.mediaIds || planData.mediaIds.length < 2) {
        return {
          errors,
          warnings: ['Considera usar múltiples medios para mayor alcance'],
          suggestions: ['La combinación de medios puede aumentar el efectividad hasta en 40%'],
          metrics: { synergyScore: 0 }
        };
      }

      // Obtener información de los medios seleccionados
      const { data: media, error } = await supabase
        .from('medios')
        .select('*')
        .in('id', planData.mediaIds);

      if (error) throw error;

      // Analizar complementariedad de medios
      const mediaTypes = media.map(m => m.tipo_medio).filter(Boolean);
      const uniqueTypes = [...new Set(mediaTypes)];
      
      if (uniqueTypes.length === 1) {
        warnings.push('Todos los medios son del mismo tipo - considera diversificar');
        suggestions.push('Combina medios digitales con tradicionales para mayor cobertura');
      }

      // Calcular score de sinergia
      let synergyScore = 0;
      if (uniqueTypes.length >= 2) synergyScore += 30;
      if (planData.mediaIds.length >= 3) synergyScore += 20;
      
      // Verificar campañas previas con misma combinación
      const { data: historicalCampaigns } = await supabase
        .from('campania')
        .select('id, Presupuesto, estado')
        .in('id_Producto', planData.mediaIds)
        .eq('estado', 'finalizada');

      if (historicalCampaigns && historicalCampaigns.length > 0) {
        synergyScore += 25;
        suggestions.push('Esta combinación de medios ha sido exitosa en campañas anteriores');
      }

      metrics.synergyScore = Math.min(synergyScore, 100);

    } catch (error) {
      console.error('Error validando sinergia de medios:', error);
      errors.push('Error al validar sinergia de medios');
    }

    return { errors, warnings, suggestions, metrics };
  },

  // Validar ROI esperado
  async validateExpectedROI(planData) {
    const errors = [];
    const warnings = [];
    const suggestions = [];
    const metrics = {};

    try {
      if (!planData.budget || !planData.expectedReach) {
        return {
          errors,
          warnings: ['Faltan datos para calcular ROI esperado'],
          suggestions: ['Define presupuesto y alcance esperado para mejor análisis'],
          metrics: { expectedROI: 0, costPerReach: 0 }
        };
      }

      // Calcular métricas básicas
      const costPerReach = planData.budget / planData.expectedReach;
      const industryAvgCostPerReach = await this.getIndustryAvgCostPerReach(planData.industry);
      
      metrics.costPerReach = costPerReach;
      metrics.industryAvgCostPerReach = industryAvgCostPerReach;

      // Comparar con promedio de la industria
      if (costPerReach > industryAvgCostPerReach * 1.5) {
        warnings.push('El costo por alcance es significativamente más alto que el promedio de la industria');
        suggestions.push('Considera optimizar el presupuesto o aumentar el alcance esperado');
      } else if (costPerReach < industryAvgCostPerReach * 0.7) {
        suggestions.push('Excelente costo por alcance comparado con la industria');
      }

      // Calcular ROI esperado basado en históricos
      const expectedROI = await this.calculateExpectedROI(planData);
      metrics.expectedROI = expectedROI;

      if (expectedROI < 100) {
        warnings.push('ROI esperado bajo - considera ajustar la estrategia');
        suggestions.push('Revisa la selección de medios y el presupuesto asignado');
      } else if (expectedROI > 300) {
        suggestions.push('ROI esperado muy optimista - asegúrate de que las cifras sean realistas');
      }

    } catch (error) {
      console.error('Error validando ROI esperado:', error);
      errors.push('Error al calcular ROI esperado');
    }

    return { errors, warnings, suggestions, metrics };
  },

  // Obtener promedio de costo por alcance de la industria
  async getIndustryAvgCostPerReach(industry) {
    // Valores de ejemplo por industria
    const industryAverages = {
      'retail': 0.50,
      'automotriz': 2.30,
      'tecnologia': 1.80,
      'banca': 1.20,
      'salud': 0.80,
      'default': 1.00
    };

    return industryAverages[industry?.toLowerCase()] || industryAverages.default;
  },

  // Calcular ROI esperado
  async calculateExpectedROI(planData) {
    try {
      // Basado en históricos de campañas similares
      const { data: similarCampaigns } = await supabase
        .from('campania')
        .select('Presupuesto, id_Producto')
        .eq('id_Producto', planData.mediumId)
        .eq('estado', 'finalizada');

      if (!similarCampaigns || similarCampaigns.length === 0) {
        return 150; // ROI estimado por defecto
      }

      // Calcular ROI promedio histórico
      const avgBudget = similarCampaigns.reduce((sum, c) => sum + (c.Presupuesto || 0), 0) / similarCampaigns.length;
      
      // Estimar ROI basado en presupuesto vs promedio
      const budgetRatio = planData.budget / avgBudget;
      let expectedROI = 150;

      if (budgetRatio > 1.5) {
        expectedROI = 120; // Mayor presupuesto puede reducir ROI porcentual
      } else if (budgetRatio < 0.7) {
        expectedROI = 180; // Presupuesto más eficiente puede aumentar ROI
      }

      return Math.round(expectedROI);
    } catch (error) {
      console.error('Error calculando ROI esperado:', error);
      return 150;
    }
  },

  // Generar recomendaciones inteligentes mejoradas
  async generateSmartRecommendations(planData, metrics) {
    const suggestions = [];

    try {
      // Recomendaciones basadas en métricas
      if (metrics.budget?.budgetEfficiency < 70) {
        suggestions.push('Presupuesto ineficiente - considera redistribuir a medios de mayor rendimiento');
      }

      if (metrics.dates?.seasonalityScore < 50) {
        suggestions.push('Las fechas seleccionadas corresponden a temporada baja - considera aumentar presupuesto');
      }

      if (metrics.capacity?.utilizationRate > 90) {
        suggestions.push('Alta ocupación de medios - reserva con anticipación o considera fechas alternativas');
      }

      if (metrics.synergy?.synergyScore < 50) {
        suggestions.push('Baja sinergia entre medios - considera combinar canales complementarios');
      }

      if (metrics.roi?.expectedROI < 100) {
        suggestions.push('ROI proyectado bajo - revisa estrategia de medios y asignación presupuestaria');
      }

      // Recomendaciones de optimización automática
      const optimization = await this.generateOptimizationPlan(planData, metrics);
      suggestions.push(...optimization);

    } catch (error) {
      console.error('Error generando recomendaciones inteligentes:', error);
    }

    return suggestions;
  },

  // Generar plan de optimización
  async generateOptimizationPlan(planData, metrics) {
    const suggestions = [];

    try {
      // Optimización de presupuesto
      if (metrics.budget?.overBudget) {
        suggestions.push(`Reduce presupuesto en ${metrics.budget.overBudgetAmount} para alinear con históricos`);
      }

      // Optimización de fechas
      if (metrics.dates?.hasConflicts) {
        suggestions.push('Reprograma fechas para evitar conflictos con campañas existentes');
      }

      // Optimización de medios
      if (metrics.synergy?.synergyScore < 70) {
        const alternativeMedia = await this.getSynergisticMedia(planData.mediaIds);
        if (alternativeMedia.length > 0) {
          suggestions.push(`Considera agregar: ${alternativeMedia.join(', ')}`);
        }
      }

    } catch (error) {
      console.error('Error generando plan de optimización:', error);
    }

    return suggestions;
  },

  // Obtener medios sinérgicos
  async getSynergisticMedia(currentMediaIds) {
    try {
      const { data: allMedia } = await supabase
        .from('medios')
        .select('id, nombre_medio, tipo_medio')
        .not('id', 'in', `(${currentMediaIds.join(',')})`);

      if (!allMedia || allMedia.length === 0) return [];

      // Filtrar medios complementarios
      return allMedia
        .slice(0, 3)
        .map(m => m.nombre_medio);
    } catch (error) {
      console.error('Error obteniendo medios sinérgicos:', error);
      return [];
    }
  },

  // Calcular score de planificación
  calculatePlanningScore(metrics, errors, warnings) {
    let score = 100;

    // Restar puntos por errores y advertencias
    score -= errors.length * 20;
    score -= warnings.length * 5;

    // Ajustar según métricas
    if (metrics.budget?.budgetEfficiency) {
      score += (metrics.budget.budgetEfficiency - 50) * 0.3;
    }

    if (metrics.synergy?.synergyScore) {
      score += (metrics.synergy.synergyScore - 50) * 0.2;
    }

    if (metrics.roi?.expectedROI) {
      score += Math.min((metrics.roi.expectedROI - 150) * 0.1, 20);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  },

  // Validar presupuesto contra histórico
  async validateBudget(planData) {
    const errors = [];
    const warnings = [];
    const suggestions = [];

    try {
      if (!planData.mediumId || !planData.budget) {
        return { errors, warnings, suggestions };
      }

      // Obtener presupuestos históricos para este medio
      const { data: historicalData, error } = await supabase
        .from('campania')
        .select('Presupuesto')
        .eq('id_Producto', planData.mediumId)
        .not('Presupuesto', 'is', null);

      if (error) throw error;

      if (historicalData && historicalData.length > 0) {
        const budgets = historicalData.map(item => item.Presupuesto).filter(b => b > 0);
        const avgBudget = budgets.reduce((sum, b) => sum + b, 0) / budgets.length;
        const maxBudget = Math.max(...budgets);
        const minBudget = Math.min(...budgets);

        // Validar si el presupuesto está muy por encima del promedio
        if (planData.budget > avgBudget * 1.5) {
          warnings.push(`Presupuesto ${((planData.budget / avgBudget - 1) * 100).toFixed(1)}% superior al promedio histórico`);
          suggestions.push(`Considerar reducir presupuesto o dividir en múltiples campañas`);
        }

        // Validar si está por debajo del mínimo histórico
        if (planData.budget < minBudget * 0.7) {
          warnings.push(`Presupuesto muy bajo comparado con campañas anteriores`);
          suggestions.push(`Evaluar si el alcance será suficiente para los objetivos`);
        }

        // Sugerir rangos óptimos
        suggestions.push(`Rango óptimo de presupuesto: ${minBudget.toLocaleString()} - ${maxBudget.toLocaleString()} CLP`);
      }

    } catch (error) {
      console.error('Error validando presupuesto:', error);
    }

    return { errors, warnings, suggestions };
  },

  // Validar disponibilidad de fechas
  async validateDates(planData) {
    const errors = [];
    const warnings = [];
    const suggestions = [];

    try {
      if (!planData.mediumId || !planData.startDate || !planData.endDate) {
        return { errors, warnings, suggestions };
      }

      const startDate = new Date(planData.startDate);
      const endDate = new Date(planData.endDate);

      // Validar que la fecha fin sea posterior a la fecha inicio
      if (endDate <= startDate) {
        errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
        return { errors, warnings, suggestions };
      }

      // Calcular duración de la campaña
      const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

      // Validar duración mínima y máxima
      if (durationDays < 7) {
        warnings.push('Campaña muy corta (menos de 7 días)');
        suggestions.push('Considerar extender la duración para mejor impacto');
      }

      if (durationDays > 90) {
        warnings.push('Campaña muy extensa (más de 90 días)');
        suggestions.push('Evaluar dividir en múltiples fases o campañas');
      }

      // Verificar conflictos de fechas con otras campañas
      const { data: conflictingCampaigns, error } = await supabase
          .from('campania')
          .select('id, nombrecampania, fecha_inicio, fecha_fin')
        .eq('id_Producto', planData.mediumId)
        .or(`and(fecha_inicio.lte.${planData.endDate},fecha_fin.gte.${planData.startDate})`);

      if (error) throw error;

      if (conflictingCampaigns && conflictingCampaigns.length > 0) {
        const conflictNames = conflictingCampaigns.map(c => c.nombrecampania).join(', ');
        errors.push(`Conflicto de fechas con campañas existentes: ${conflictNames}`);
        suggestions.push('Considerar fechas alternativas o medios diferentes');
      }

      // Verificar temporada alta/baja
      const month = startDate.getMonth() + 1;
      if ([12, 1, 2].includes(month)) {
        suggestions.push('Temporada alta (Navidad/Año Nuevo) - considerar presupuesto adicional');
      } else if ([7, 8].includes(month)) {
        warnings.push('Temporada baja (invierno) - menor disponibilidad de inventario');
      }

    } catch (error) {
      console.error('Error validando fechas:', error);
      errors.push('Error validando disponibilidad de fechas');
    }

    return { errors, warnings, suggestions };
  },

  // Validar capacidad del medio
  async validateCapacity(planData) {
    const errors = [];
    const warnings = [];

    try {
      if (!planData.mediumId) {
        return { errors, warnings };
      }

      // Obtener información del medio
      const { data: medium, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', planData.mediumId)
        .single();

      if (error) throw error;

      // Aquí irían validaciones específicas del medio
      // Por ejemplo, capacidad máxima, restricciones, etc.

      // Validación de ejemplo: verificar si hay límites de campaña por mes
      const startDate = new Date(planData.startDate);
      const month = startDate.getMonth() + 1;
      const year = startDate.getFullYear();

      const { data: monthlyCampaigns, error: monthlyError } = await supabase
          .from('campania')
          .select('id')
        .eq('id_Producto', planData.mediumId)
        .gte('fecha_inicio', `${year}-${month.toString().padStart(2, '0')}-01`)
        .lt('fecha_inicio', `${year}-${(month + 1).toString().padStart(2, '0')}-01`);

      if (monthlyError) throw monthlyError;

      if (monthlyCampaigns && monthlyCampaigns.length >= 3) {
        warnings.push(`Ya hay ${monthlyCampaigns.length} campañas este mes en este medio`);
      }

    } catch (error) {
      console.error('Error validando capacidad:', error);
    }

    return { errors, warnings };
  },

  // Generar recomendaciones inteligentes
  async generateRecommendations(planData) {
    const suggestions = [];

    try {
      if (!planData.mediumId || !planData.budget) {
        return suggestions;
      }

      // Recomendar medios alternativos con mejor rendimiento/costo
      const alternativeMedia = await this.getAlternativeMedia(planData.mediumId, planData.budget);
      if (alternativeMedia.length > 0) {
        suggestions.push(`Medios alternativos sugeridos: ${alternativeMedia.map(m => m.nombredelproducto).join(', ')}`);
      }

      // Recomendar división de presupuesto
      if (planData.budget > 1000000) {
        suggestions.push('Presupuesto alto - considerar dividir en múltiples medios para mejor alcance');
      }

      // Recomendar duración óptima
      const optimalDuration = await this.getOptimalDuration(planData.mediumId);
      if (optimalDuration) {
        suggestions.push(`Duración óptima recomendada: ${optimalDuration} días`);
      }

    } catch (error) {
      console.error('Error generando recomendaciones:', error);
    }

    return suggestions;
  },

  // Obtener medios alternativos
  async getAlternativeMedia(currentMediumId, budget) {
    try {
      const { data: alternatives, error } = await supabase
        .from('productos')
        .select('id, nombredelproducto')
        .neq('id', currentMediumId)
        .limit(3);

      if (error) throw error;
      return alternatives || [];
    } catch (error) {
      console.error('Error obteniendo medios alternativos:', error);
      return [];
    }
  },

  // Obtener duración óptima para un medio
  async getOptimalDuration(mediumId) {
    try {
      const { data: campaigns, error } = await supabase
        .from('campania')
        .select('fecha_inicio, fecha_fin')
        .eq('id_Producto', mediumId)
        .not('fecha_inicio', 'is', null)
        .not('fecha_fin', 'is', null);

      if (error) throw error;

      if (campaigns && campaigns.length > 0) {
        const durations = campaigns.map(campaign => {
          const start = new Date(campaign.fecha_inicio);
          const end = new Date(campaign.fecha_fin);
          return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        });

        const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
        return Math.round(avgDuration);
      }

      return null;
    } catch (error) {
      console.error('Error obteniendo duración óptima:', error);
      return null;
    }
  },

  // Calcular severidad de validaciones
  calculateSeverity(errors, warnings) {
    if (errors.length > 0) return 'error';
    if (warnings.length > 2) return 'warning';
    if (warnings.length > 0) return 'info';
    return 'success';
  },

  // Obtener estadísticas de planificación
  async getPlanningStats() {
    try {
      const { data: campaigns, error } = await supabase
        .from('campania')
        .select('estado, Presupuesto, fecha_inicio, fecha_fin');

      if (error) throw error;

      const stats = {
        totalCampaigns: campaigns?.length || 0,
        activeCampaigns: campaigns?.filter(c => c.estado === 'live').length || 0,
        totalBudget: campaigns?.reduce((sum, c) => sum + (c.Presupuesto || 0), 0) || 0,
        avgCampaignDuration: 0
      };

      // Calcular duración promedio
      const validCampaigns = campaigns?.filter(c =>
        c.fecha_inicio && c.fecha_fin
      ) || [];

      if (validCampaigns.length > 0) {
        const totalDuration = validCampaigns.reduce((sum, c) => {
          const start = new Date(c.fecha_inicio);
          const end = new Date(c.fecha_fin);
          return sum + Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        }, 0);

        stats.avgCampaignDuration = Math.round(totalDuration / validCampaigns.length);
      }

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas de planificación:', error);
      return {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalBudget: 0,
        avgCampaignDuration: 0
      };
    }
  },

  // Validación completa en tiempo real
  async validatePlanningInRealTime(planData) {
    const validation = await this.validatePlanning(planData);
    
    // Agregar logging para auditoría
    await this.logValidation(planData, validation);
    
    return validation;
  },

  // Registrar validación para auditoría
  async logValidation(planData, validation) {
    try {
      await supabase
        .from('planning_validations')
        .insert({
          plan_data: planData,
          validation_result: validation,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error registrando validación:', error);
    }
  },

  // Obtener sugerencias de IA basadas en machine learning
  async getAISuggestions(planData) {
    try {
      // Simulación de sugerencias basadas en patrones históricos
      const suggestions = [];

      // Análisis de patrones estacionales
      const seasonalPattern = await this.analyzeSeasonalPatterns(planData);
      if (seasonalPattern.recommendation) {
        suggestions.push(seasonalPattern.recommendation);
      }

      // Análisis de rendimiento por segmento
      const segmentAnalysis = await this.analyzeSegmentPerformance(planData);
      suggestions.push(...segmentAnalysis.suggestions);

      // Predicción de demanda
      const demandForecast = await this.forecastDemand(planData);
      if (demandForecast.adjustmentNeeded) {
        suggestions.push(demandForecast.recommendation);
      }

      return suggestions;
    } catch (error) {
      console.error('Error obteniendo sugerencias de IA:', error);
      return [];
    }
  },

  // Analizar patrones estacionales
  async analyzeSeasonalPatterns(planData) {
    try {
      const month = new Date(planData.startDate).getMonth() + 1;
      
      // Patrones estacionales de ejemplo
      const seasonalPatterns = {
        12: { // Diciembre
          recommendation: 'Temporada alta - considera aumentar presupuesto 20-30%',
          multiplier: 1.25
        },
        1: { // Enero
          recommendation: 'Temporada media - presupuesto estándar',
          multiplier: 1.0
        },
        7: { // Julio
          recommendation: 'Temporada baja - considera reducir presupuesto o enfocar en digitales',
          multiplier: 0.8
        }
      };

      return seasonalPatterns[month] || { recommendation: null, multiplier: 1.0 };
    } catch (error) {
      console.error('Error analizando patrones estacionales:', error);
      return { recommendation: null, multiplier: 1.0 };
    }
  },

  // Analizar rendimiento por segmento
  async analyzeSegmentPerformance(planData) {
    try {
      const suggestions = [];
      
      // Simulación de análisis de segmentos
      if (planData.targetAudience?.includes('jovenes')) {
        suggestions.push('Para audiencia joven, prioriza medios digitales y redes sociales');
      }
      
      if (planData.targetAudience?.includes('profesionales')) {
        suggestions.push('Para profesionales, considera LinkedIn y medios especializados');
      }

      return { suggestions };
    } catch (error) {
      console.error('Error analizando rendimiento por segmento:', error);
      return { suggestions: [] };
    }
  },

  // Pronosticar demanda
  async forecastDemand(planData) {
    try {
      // Simulación de pronóstico de demanda
      const currentYear = new Date().getFullYear();
      const lastYearData = await this.getHistoricalDemand(currentYear - 1);
      
      if (lastYearData.trend === 'increasing') {
        return {
          adjustmentNeeded: true,
          recommendation: 'La demanda está en aumento - considera aumentar alcance en 15%'
        };
      } else if (lastYearData.trend === 'decreasing') {
        return {
          adjustmentNeeded: true,
          recommendation: 'La demanda está disminuyendo - enfócate en retención de clientes'
        };
      }

      return { adjustmentNeeded: false };
    } catch (error) {
      console.error('Error pronosticando demanda:', error);
      return { adjustmentNeeded: false };
    }
  },

  // Obtener demanda histórica
  async getHistoricalDemand(year) {
    try {
      const { data } = await supabase
        .from('campania')
        .select('Presupuesto, created_at')
        .gte('created_at', `${year}-01-01`)
        .lt('created_at', `${year + 1}-01-01`);

      const totalBudget = data?.reduce((sum, c) => sum + (c.Presupuesto || 0), 0) || 0;
      
      // Simulación simple de tendencia
      return {
        totalBudget,
        trend: totalBudget > 1000000 ? 'increasing' : 'stable'
      };
    } catch (error) {
      console.error('Error obteniendo demanda histórica:', error);
      return { trend: 'stable' };
    }
  }
};