/**
 * Campaign Action Handler
 * Maneja todas las operaciones relacionadas con campañas
 * Integrado con el Asistente IA Ejecutivo
 */

import { supabase } from '../../config/supabase';

class CampaignActionHandler {
  constructor() {
    this.tableName = 'campanias';
    this.planesTable = 'campana_planes';
    this.temasTable = 'campana_temas';
    this.logger = this.createLogger();
  }

  createLogger() {
    return {
      info: (msg, data) => console.log(`[CampaignHandler] ${msg}`, data || ''),
      error: (msg, err) => console.error(`[CampaignHandler ERROR] ${msg}`, err || ''),
      warn: (msg, data) => console.warn(`[CampaignHandler WARN] ${msg}`, data || '')
    };
  }

  /**
   * Crear nueva campaña
   */
  async createCampaign(data) {
    try {
      this.logger.info('Creando nueva campaña', data);

      // Validar datos
      const validation = this.validateCampaignData(data, 'create');
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          code: 'VALIDATION_ERROR'
        };
      }

      // Preparar datos
      const campaignData = {
        nombre_campania: data.nombre || data.nombre_campania,
        descripcion: data.descripcion || data.description,
        cliente_id: data.cliente_id,
        fecha_inicio: data.fecha_inicio || data.startDate,
        fecha_fin: data.fecha_fin || data.endDate,
        presupuesto_total: data.presupuesto || data.presupuesto_total || 0,
        estado: data.estado_campania || 'planificacion',
        objetivo: data.objetivo,
        publico_objetivo: data.publico_objetivo || data.targetAudience,
        notas: data.notas || data.notes,
        fecha_creacion: new Date().toISOString(),
        agencia_id: data.agencia_id || 1
      };

      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert([campaignData])
        .select();

      if (error) {
        this.logger.error('Error al crear campaña', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info('Campaña creada exitosamente', result[0]);
      return {
        success: true,
        data: result[0],
        message: `Campaña "${campaignData.nombre_campania}" creada exitosamente`
      };
    } catch (err) {
      this.logger.error('Excepción al crear campaña', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Buscar campañas con múltiples filtros
   */
  async searchCampaigns(filters = {}) {
    try {
      this.logger.info('Buscando campañas', filters);

      let query = supabase.from(this.tableName).select('*');

      // Aplicar filtros
      if (filters.nombre) {
        query = query.ilike('nombre_campania', `%${filters.nombre}%`);
      }
      if (filters.cliente_id) {
        query = query.eq('cliente_id', filters.cliente_id);
      }
      if (filters.estado) {
        query = query.eq('estado', filters.estado);
      }
      if (filters.minPresupuesto !== undefined) {
        query = query.gte('presupuesto_total', filters.minPresupuesto);
      }
      if (filters.maxPresupuesto !== undefined) {
        query = query.lte('presupuesto_total', filters.maxPresupuesto);
      }
      if (filters.fechaInicio) {
        query = query.gte('fecha_inicio', filters.fechaInicio);
      }
      if (filters.fechaFin) {
        query = query.lte('fecha_fin', filters.fechaFin);
      }

      // Ordenamiento
      const orderBy = filters.orderBy || 'nombre_campania';
      const orderDirection = filters.orderDirection || 'asc';
      query = query.order(orderBy, { ascending: orderDirection === 'asc' });

      // Paginación
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        this.logger.error('Error al buscar campañas', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info(`Encontradas ${data.length} campañas`);
      return {
        success: true,
        data,
        count: data.length,
        message: `Se encontraron ${data.length} campaña(s)`
      };
    } catch (err) {
      this.logger.error('Excepción al buscar campañas', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Obtener campaña por ID
   */
  async getCampaignById(id) {
    try {
      this.logger.info('Obteniendo campaña por ID', { id });

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error('Error al obtener campaña', error);
        return {
          success: false,
          error: 'Campaña no encontrada',
          code: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        data,
        message: `Campaña "${data.nombre_campania}" obtenida exitosamente`
      };
    } catch (err) {
      this.logger.error('Excepción al obtener campaña', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Actualizar campaña
   */
  async updateCampaign(id, data) {
    try {
      this.logger.info('Actualizando campaña', { id, data });

      // Validar datos
      const validation = this.validateCampaignData(data, 'update');
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          code: 'VALIDATION_ERROR'
        };
      }

      // Preparar datos para actualización
      const updateData = {};
      if (data.nombre) updateData.nombre_campania = data.nombre;
      if (data.descripcion) updateData.descripcion = data.descripcion;
      if (data.fecha_inicio) updateData.fecha_inicio = data.fecha_inicio;
      if (data.fecha_fin) updateData.fecha_fin = data.fecha_fin;
      if (data.presupuesto !== undefined) updateData.presupuesto_total = data.presupuesto;
      if (data.objetivo) updateData.objetivo = data.objetivo;
      if (data.publico_objetivo) updateData.publico_objetivo = data.publico_objetivo;
      if (data.notas) updateData.notas = data.notas;

      const { data: result, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        this.logger.error('Error al actualizar campaña', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info('Campaña actualizada exitosamente', result[0]);
      return {
        success: true,
        data: result[0],
        message: 'Campaña actualizada exitosamente'
      };
    } catch (err) {
      this.logger.error('Excepción al actualizar campaña', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Cambiar estado de la campaña
   */
  async changeCampaignStatus(id, newStatus) {
    try {
      this.logger.info('Cambiando estado de la campaña', { id, newStatus });

      const validStates = ['planificacion', 'activa', 'pausada', 'finalizada', 'cancelada'];
      if (!validStates.includes(newStatus)) {
        return {
          success: false,
          error: `Estado inválido. Estados válidos: ${validStates.join(', ')}`,
          code: 'INVALID_STATE'
        };
      }

      const { data: result, error } = await supabase
        .from(this.tableName)
        .update({ estado: newStatus })
        .eq('id', id)
        .select();

      if (error) {
        this.logger.error('Error al cambiar estado', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info('Estado cambiado exitosamente', result[0]);
      return {
        success: true,
        data: result[0],
        message: `Estado de la campaña cambiado a "${newStatus}"`
      };
    } catch (err) {
      this.logger.error('Excepción al cambiar estado', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Eliminar campaña
   */
  async deleteCampaign(id, force = false) {
    try {
      this.logger.info('Eliminando campaña', { id, force });

      if (!force) {
        const { data: planes, error: planesError } = await supabase
          .from(this.planesTable)
          .select('id')
          .eq('campana_id', id)
          .limit(1);

        if (planesError) {
          this.logger.warn('Error al verificar planes', planesError);
        } else if (planes && planes.length > 0) {
          return {
            success: false,
            error: 'No se puede eliminar una campaña con planes asociados. Use force=true para forzar la eliminación.',
            code: 'HAS_DEPENDENCIES',
            hasPlans: true
          };
        }
      }

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error('Error al eliminar campaña', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info('Campaña eliminada exitosamente');
      return {
        success: true,
        message: 'Campaña eliminada exitosamente'
      };
    } catch (err) {
      this.logger.error('Excepción al eliminar campaña', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Obtener planes de una campaña
   */
  async getCampaignPlans(campaignId) {
    try {
      this.logger.info('Obteniendo planes de campaña', { campaignId });

      const { data, error } = await supabase
        .from(this.planesTable)
        .select('*')
        .eq('campana_id', campaignId);

      if (error) {
        this.logger.error('Error al obtener planes', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info(`Encontrados ${data.length} planes`);
      return {
        success: true,
        data,
        count: data.length,
        message: `Se encontraron ${data.length} plan(es)`
      };
    } catch (err) {
      this.logger.error('Excepción al obtener planes', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Obtener temas de una campaña
   */
  async getCampaignTemas(campaignId) {
    try {
      this.logger.info('Obteniendo temas de campaña', { campaignId });

      const { data, error } = await supabase
        .from(this.temasTable)
        .select('*')
        .eq('campana_id', campaignId);

      if (error) {
        this.logger.error('Error al obtener temas', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info(`Encontrados ${data.length} temas`);
      return {
        success: true,
        data,
        count: data.length,
        message: `Se encontraron ${data.length} tema(s)`
      };
    } catch (err) {
      this.logger.error('Excepción al obtener temas', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Agregar tema a campaña
   */
  async addTemaToCampaign(campaignId, temaId) {
    try {
      this.logger.info('Agregando tema a campaña', { campaignId, temaId });

      const { data, error } = await supabase
        .from(this.temasTable)
        .insert([{
          campana_id: campaignId,
          tema_id: temaId,
          fecha_agregado: new Date().toISOString()
        }])
        .select();

      if (error) {
        this.logger.error('Error al agregar tema', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info('Tema agregado exitosamente', data[0]);
      return {
        success: true,
        data: data[0],
        message: 'Tema agregado a la campaña exitosamente'
      };
    } catch (err) {
      this.logger.error('Excepción al agregar tema', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Obtener estadísticas de campaña
   */
  async getCampaignStats() {
    try {
      this.logger.info('Obteniendo estadísticas de campañas');

      // Total de campañas
      const { count: totalCampaigns } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      // Campañas activas
      const { count: activeCampaigns } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'activa');

      // Campañas por estado
      const { data: campaignsByStatus } = await supabase
        .from(this.tableName)
        .select('estado, count(*)')
        .group_by('estado');

      // Presupuesto total
      const { data: budgetData } = await supabase
        .from(this.tableName)
        .select('presupuesto_total');

      const totalBudget = budgetData && budgetData.length > 0
        ? budgetData.reduce((sum, c) => sum + (c.presupuesto_total || 0), 0)
        : 0;

      const avgBudget = budgetData && budgetData.length > 0
        ? (totalBudget / budgetData.length).toFixed(2)
        : 0;

      const stats = {
        totalCampaigns: totalCampaigns || 0,
        activeCampaigns: activeCampaigns || 0,
        campaignsByStatus: campaignsByStatus || [],
        totalBudget: totalBudget,
        averageBudget: parseFloat(avgBudget)
      };

      this.logger.info('Estadísticas obtenidas', stats);
      return {
        success: true,
        data: stats,
        message: 'Estadísticas de campañas obtenidas exitosamente'
      };
    } catch (err) {
      this.logger.error('Excepción al obtener estadísticas', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Exportar campañas a CSV
   */
  async exportCampaigns(filters = {}) {
    try {
      this.logger.info('Exportando campañas', filters);

      const searchResult = await this.searchCampaigns({ ...filters, limit: 10000 });
      if (!searchResult.success) {
        return searchResult;
      }

      const campaigns = searchResult.data;

      const headers = [
        'ID',
        'Nombre',
        'Cliente ID',
        'Descripción',
        'Fecha Inicio',
        'Fecha Fin',
        'Presupuesto Total',
        'Estado',
        'Objetivo',
        'Público Objetivo',
        'Fecha Creación'
      ];

      const rows = campaigns.map(c => [
        c.id,
        c.nombre_campania,
        c.cliente_id,
        c.descripcion,
        new Date(c.fecha_inicio).toLocaleDateString('es-CL'),
        new Date(c.fecha_fin).toLocaleDateString('es-CL'),
        c.presupuesto_total,
        c.estado,
        c.objetivo,
        c.publico_objetivo,
        new Date(c.fecha_creacion).toLocaleDateString('es-CL')
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
      ].join('\n');

      this.logger.info(`Exportadas ${campaigns.length} campañas`);
      return {
        success: true,
        data: csv,
        filename: `campanas_${new Date().toISOString().split('T')[0]}.csv`,
        message: `${campaigns.length} campaña(s) exportada(s) exitosamente`
      };
    } catch (err) {
      this.logger.error('Excepción al exportar campañas', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Validar datos de la campaña
   */
  validateCampaignData(data, mode = 'create') {
    const errors = [];

    if (mode === 'create') {
      if (!data.nombre && !data.nombre_campania) {
        errors.push('El nombre de la campaña es requerido');
      }
      if (!data.cliente_id) {
        errors.push('El cliente es requerido');
      }
      if (!data.fecha_inicio && !data.startDate) {
        errors.push('La fecha de inicio es requerida');
      }
      if (!data.fecha_fin && !data.endDate) {
        errors.push('La fecha de fin es requerida');
      }
    }

    // Validaciones opcionales
    if (data.presupuesto !== undefined && data.presupuesto < 0) {
      errors.push('El presupuesto no puede ser negativo');
    }

    if (data.fecha_inicio && data.fecha_fin) {
      const inicio = new Date(data.fecha_inicio || data.startDate);
      const fin = new Date(data.fecha_fin || data.endDate);
      if (inicio > fin) {
        errors.push('La fecha de inicio no puede ser posterior a la fecha de fin');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtener estados disponibles
   */
  async getAvailableStates() {
    return {
      success: true,
      data: ['planificacion', 'activa', 'pausada', 'finalizada', 'cancelada'],
      message: 'Estados disponibles obtenidos'
    };
  }

  /**
   * Calcular presupuesto gastado en una campaña
   */
  async calculateSpentBudget(campaignId) {
    try {
      this.logger.info('Calculando presupuesto gastado', { campaignId });

      // Obtener planes de la campaña
      const planesResult = await this.getCampaignPlans(campaignId);
      if (!planesResult.success) {
        return planesResult;
      }

      // Sumar costos de planes
      const totalSpent = planesResult.data.reduce((sum, plan) => {
        return sum + (plan.costo_total || 0);
      }, 0);

      this.logger.info('Presupuesto gastado calculado', { totalSpent });
      return {
        success: true,
        data: {
          totalSpent,
          currency: 'CLP'
        },
        message: 'Presupuesto gastado calculado exitosamente'
      };
    } catch (err) {
      this.logger.error('Excepción al calcular presupuesto', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Obtener resumen de campaña
   */
  async getCampaignSummary(campaignId) {
    try {
      this.logger.info('Obteniendo resumen de campaña', { campaignId });

      // Obtener campaña
      const campaignResult = await this.getCampaignById(campaignId);
      if (!campaignResult.success) {
        return campaignResult;
      }

      const campaign = campaignResult.data;

      // Obtener planes
      const planesResult = await this.getCampaignPlans(campaignId);
      const planes = planesResult.success ? planesResult.data : [];

      // Obtener temas
      const temasResult = await this.getCampaignTemas(campaignId);
      const temas = temasResult.success ? temasResult.data : [];

      // Calcular presupuesto gastado
      const spentResult = await this.calculateSpentBudget(campaignId);
      const spent = spentResult.success ? spentResult.data.totalSpent : 0;

      const summary = {
        campaign,
        totalPlans: planes.length,
        totalTemas: temas.length,
        budgetSpent: spent,
        budgetRemaining: campaign.presupuesto_total - spent,
        budgetPercentage: ((spent / campaign.presupuesto_total) * 100).toFixed(2)
      };

      this.logger.info('Resumen obtenido', summary);
      return {
        success: true,
        data: summary,
        message: 'Resumen de campaña obtenido exitosamente'
      };
    } catch (err) {
      this.logger.error('Excepción al obtener resumen', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }
}

// Exportar instancia singleton
export const campaignActionHandler = new CampaignActionHandler();
export default CampaignActionHandler;
