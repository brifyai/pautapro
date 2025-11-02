/**
 * Servicio de Seguimiento de Clientes para CRM
 * Proporciona funcionalidades avanzadas de seguimiento y gestión de relaciones
 */

import { supabase } from '../config/supabase';

class ClientTrackingService {
  constructor() {
    this.interactionTypes = [
      'call',
      'email',
      'meeting',
      'visit',
      'note',
      'task',
      'reminder',
      'opportunity',
      'issue'
    ];
    
    this.priorityLevels = ['low', 'medium', 'high', 'urgent'];
    
    this.interactionTemplates = {
      call: {
        title: 'Llamada telefónica',
        icon: 'phone',
        color: '#2196F3'
      },
      email: {
        title: 'Correo electrónico',
        icon: 'email',
        color: '#4CAF50'
      },
      meeting: {
        title: 'Reunión',
        icon: 'people',
        color: '#FF9800'
      },
      visit: {
        title: 'Visita',
        icon: 'location_on',
        color: '#9C27B0'
      },
      note: {
        title: 'Nota',
        icon: 'note',
        color: '#607D8B'
      },
      task: {
        title: 'Tarea',
        icon: 'assignment',
        color: '#795548'
      },
      reminder: {
        title: 'Recordatorio',
        icon: 'notification_important',
        color: '#F44336'
      },
      opportunity: {
        title: 'Oportunidad',
        icon: 'trending_up',
        color: '#00BCD4'
      },
      issue: {
        title: 'Problema',
        icon: 'warning',
        color: '#FF5722'
      }
    };
  }

  /**
   * Obtener todas las interacciones de un cliente
   */
  async getClientInteractions(clientId, options = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        type = null,
        dateRange = null,
        priority = null
      } = options;

      let query = supabase
        .from('client_interactions')
        .select(`
          *,
          users (name, email),
          interaction_tags (tag_name)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (type) {
        query = query.eq('type', type);
      }

      if (priority) {
        query = query.eq('priority', priority);
      }

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        interactions: data || [],
        total: data?.length || 0
      };
    } catch (error) {
      console.error('Error getting client interactions:', error);
      throw error;
    }
  }

  /**
   * Crear nueva interacción con cliente
   */
  async createInteraction(interactionData) {
    try {
      const interaction = {
        ...interactionData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: interactionData.user_id || 'current_user'
      };

      const { data, error } = await supabase
        .from('client_interactions')
        .insert([interaction])
        .select();

      if (error) throw error;

      // Actualizar última interacción del cliente
      await this.updateClientLastInteraction(interactionData.client_id, interaction.id);

      // Crear notificación si es necesario
      if (interactionData.priority === 'urgent' || interactionData.type === 'issue') {
        await this.createInteractionNotification(interaction);
      }

      return { success: true, interaction: data[0] };
    } catch (error) {
      console.error('Error creating interaction:', error);
      throw error;
    }
  }

  /**
   * Actualizar interacción existente
   */
  async updateInteraction(interactionId, updateData) {
    try {
      const { data, error } = await supabase
        .from('client_interactions')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', interactionId)
        .select();

      if (error) throw error;

      return { success: true, interaction: data[0] };
    } catch (error) {
      console.error('Error updating interaction:', error);
      throw error;
    }
  }

  /**
   * Eliminar interacción
   */
  async deleteInteraction(interactionId) {
    try {
      const { error } = await supabase
        .from('client_interactions')
        .delete()
        .eq('id', interactionId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error deleting interaction:', error);
      throw error;
    }
  }

  /**
   * Obtener timeline de cliente
   */
  async getClientTimeline(clientId, options = {}) {
    try {
      const {
        limit = 20,
        offset = 0,
        includeOrders = true,
        includeCampaigns = true
      } = options;

      const interactions = await this.getClientInteractions(clientId, { limit, offset });
      
      let timeline = interactions.interactions.map(interaction => ({
        ...interaction,
        timelineType: 'interaction',
        timestamp: new Date(interaction.created_at)
      }));

      if (includeOrders) {
        const orders = await this.getClientOrders(clientId);
        timeline = timeline.concat(orders.map(order => ({
          ...order,
          timelineType: 'order',
          timestamp: new Date(order.created_at)
        })));
      }

      if (includeCampaigns) {
        const campaigns = await this.getClientCampaigns(clientId);
        timeline = timeline.concat(campaigns.map(campaign => ({
          ...campaign,
          timelineType: 'campaign',
          timestamp: new Date(campaign.created_at)
        })));
      }

      // Ordenar por timestamp
      timeline.sort((a, b) => b.timestamp - a.timestamp);

      return {
        timeline,
        total: timeline.length
      };
    } catch (error) {
      console.error('Error getting client timeline:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de interacciones
   */
  async getInteractionStats(clientId, dateRange = null) {
    try {
      let query = supabase
        .from('client_interactions')
        .select('type, priority, created_at')
        .eq('client_id', clientId);

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        byType: {},
        byPriority: {},
        recentActivity: 0,
        lastInteraction: null
      };

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      data?.forEach(interaction => {
        // Estadísticas por tipo
        stats.byType[interaction.type] = (stats.byType[interaction.type] || 0) + 1;
        
        // Estadísticas por prioridad
        stats.byPriority[interaction.priority] = (stats.byPriority[interaction.priority] || 0) + 1;
        
        // Actividad reciente
        const interactionDate = new Date(interaction.created_at);
        if (interactionDate > thirtyDaysAgo) {
          stats.recentActivity++;
        }
        
        // Última interacción
        if (!stats.lastInteraction || interactionDate > new Date(stats.lastInteraction)) {
          stats.lastInteraction = interaction.created_at;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting interaction stats:', error);
      throw error;
    }
  }

  /**
   * Obtener próximos seguimientos
   */
  async getUpcomingFollowUps(clientId = null, days = 7) {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      let query = supabase
        .from('client_interactions')
        .select(`
          *,
          clients (nombrecliente, razonsocial)
        `)
        .eq('type', 'reminder')
        .gte('follow_up_date', new Date().toISOString())
        .lte('follow_up_date', futureDate.toISOString())
        .order('follow_up_date', { ascending: true });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting upcoming follow-ups:', error);
      throw error;
    }
  }

  /**
   * Crear recordatorio de seguimiento
   */
  async createFollowUpReminder(clientId, reminderData) {
    try {
      const reminder = {
        client_id: clientId,
        type: 'reminder',
        title: reminderData.title,
        description: reminderData.description,
        follow_up_date: reminderData.follow_up_date,
        priority: reminderData.priority || 'medium',
        assigned_to: reminderData.assigned_to || 'current_user',
        user_id: 'current_user',
        status: 'pending'
      };

      return await this.createInteraction(reminder);
    } catch (error) {
      console.error('Error creating follow-up reminder:', error);
      throw error;
    }
  }

  /**
   * Obtener clientes con seguimiento pendiente
   */
  async getClientsNeedingFollowUp(days = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          client_interactions (
            id,
            created_at,
            type
          )
        `)
        .lt('last_interaction_date', cutoffDate.toISOString())
        .eq('estado', 'activo');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting clients needing follow-up:', error);
      throw error;
    }
  }

  /**
   * Actualizar última interacción del cliente
   */
  async updateClientLastInteraction(clientId, interactionId) {
    try {
      const { error } = await supabase
        .from('clientes')
        .update({
          last_interaction_date: new Date().toISOString(),
          last_interaction_id: interactionId,
          updated_at: new Date().toISOString()
        })
        .eq('id_cliente', clientId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating client last interaction:', error);
    }
  }

  /**
   * Crear notificación de interacción
   */
  async createInteractionNotification(interaction) {
    try {
      const notificationData = {
        title: `Nueva interacción: ${this.interactionTemplates[interaction.type]?.title || interaction.type}`,
        message: interaction.description || interaction.title,
        type: 'client',
        priority: interaction.priority,
        user_id: interaction.assigned_to || 'current_user',
        metadata: {
          interaction_id: interaction.id,
          client_id: interaction.client_id
        }
      };

      // Aquí podrías integrar con el servicio de notificaciones
      console.log('Creating interaction notification:', notificationData);
    } catch (error) {
      console.error('Error creating interaction notification:', error);
    }
  }

  /**
   * Obtener órdenes del cliente
   */
  async getClientOrders(clientId) {
    try {
      const { data, error } = await supabase
        .from('ordenes')
        .select('*')
        .eq('id_cliente', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting client orders:', error);
      return [];
    }
  }

  /**
   * Obtener campañas del cliente
   */
  async getClientCampaigns(clientId) {
    try {
      const { data, error } = await supabase
        .from('campanas')
        .select('*')
        .eq('id_cliente', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting client campaigns:', error);
      return [];
    }
  }

  /**
   * Generar reporte de seguimiento
   */
  async generateTrackingReport(clientId, options = {}) {
    try {
      const {
        dateRange = {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        },
        includeStats = true,
        includeTimeline = true,
        includeFollowUps = true
      } = options;

      const report = {
        clientId,
        generatedAt: new Date().toISOString(),
        dateRange
      };

      if (includeStats) {
        report.stats = await this.getInteractionStats(clientId, dateRange);
      }

      if (includeTimeline) {
        const timelineResult = await this.getClientTimeline(clientId, {
          includeOrders: true,
          includeCampaigns: true
        });
        report.timeline = timelineResult.timeline;
      }

      if (includeFollowUps) {
        report.upcomingFollowUps = await this.getUpcomingFollowUps(clientId, 30);
      }

      return report;
    } catch (error) {
      console.error('Error generating tracking report:', error);
      throw error;
    }
  }

  /**
   * Obtener plantillas de interacción
   */
  getInteractionTemplates() {
    return this.interactionTemplates;
  }

  /**
   * Obtener tipos de interacción
   */
  getInteractionTypes() {
    return this.interactionTypes;
  }

  /**
   * Obtener niveles de prioridad
   */
  getPriorityLevels() {
    return this.priorityLevels;
  }

  /**
   * Calcular score de seguimiento del cliente
   */
  async calculateTrackingScore(clientId) {
    try {
      const stats = await this.getInteractionStats(clientId);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      let score = 0;
      
      // Puntos por cantidad de interacciones
      score += Math.min(stats.total * 2, 20);
      
      // Puntos por actividad reciente
      score += Math.min(stats.recentActivity * 3, 30);
      
      // Puntos por diversidad de tipos de interacción
      const typeCount = Object.keys(stats.byType).length;
      score += Math.min(typeCount * 5, 25);
      
      // Puntos por última interacción (más reciente = más puntos)
      if (stats.lastInteraction) {
        const daysSinceLastInteraction = Math.floor(
          (new Date() - new Date(stats.lastInteraction)) / (1000 * 60 * 60 * 24)
        );
        score += Math.max(0, 25 - daysSinceLastInteraction);
      }
      
      return Math.min(100, Math.max(0, score));
    } catch (error) {
      console.error('Error calculating tracking score:', error);
      return 0;
    }
  }
}

export default new ClientTrackingService();