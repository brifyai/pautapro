/**
 * Servicio de Recordatorios Automáticos para CRM
 * Proporciona funcionalidades avanzadas de gestión de recordatorios
 */

import { supabase } from '../config/supabase';

class ReminderService {
  constructor() {
    this.reminders = new Map();
    this.activeTimers = new Map();
    this.reminderTypes = [
      'follow_up',
      'meeting',
      'call',
      'email',
      'task',
      'deadline',
      'birthday',
      'anniversary',
      'renewal',
      'payment',
      'custom'
    ];
    
    this.priorityLevels = ['low', 'medium', 'high', 'urgent'];
    this.recurrencePatterns = [
      'once',
      'daily',
      'weekly',
      'monthly',
      'quarterly',
      'yearly'
    ];
    
    this.initializeScheduler();
  }

  /**
   * Inicializar el programador de recordatorios
   */
  initializeScheduler() {
    // Cargar recordatorios activos al iniciar
    this.loadActiveReminders();
    
    // Configurar verificación cada minuto
    setInterval(() => {
      this.checkPendingReminders();
    }, 60000);
  }

  /**
   * Cargar recordatorios activos desde la base de datos
   */
  async loadActiveReminders() {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('active', true)
        .gte('next_reminder', new Date().toISOString())
        .order('next_reminder', { ascending: true });

      if (error) throw error;

      data?.forEach(reminder => {
        this.reminders.set(reminder.id, reminder);
        this.scheduleReminder(reminder);
      });

      console.log(`Loaded ${data?.length || 0} active reminders`);
    } catch (error) {
      console.error('Error loading active reminders:', error);
    }
  }

  /**
   * Crear nuevo recordatorio
   */
  async createReminder(reminderData) {
    try {
      const reminder = {
        id: crypto.randomUUID(),
        ...reminderData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        active: true,
        completed: false,
        notification_sent: false
      };

      // Calcular próxima fecha de recordatorio
      if (!reminder.next_reminder) {
        reminder.next_reminder = this.calculateNextReminder(reminder);
      }

      const { data, error } = await supabase
        .from('reminders')
        .insert([reminder])
        .select();

      if (error) throw error;

      // Agregar al mapa y programar
      this.reminders.set(reminder.id, reminder);
      this.scheduleReminder(reminder);

      return { success: true, reminder: data[0] };
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  }

  /**
   * Actualizar recordatorio existente
   */
  async updateReminder(reminderId, updateData) {
    try {
      const reminder = this.reminders.get(reminderId);
      if (!reminder) {
        throw new Error('Reminder not found');
      }

      const updatedReminder = {
        ...reminder,
        ...updateData,
        updated_at: new Date().toISOString()
      };

      // Recalcular próxima fecha si es necesario
      if (updateData.reminder_date || updateData.recurrence_pattern) {
        updatedReminder.next_reminder = this.calculateNextReminder(updatedReminder);
      }

      const { data, error } = await supabase
        .from('reminders')
        .update(updatedReminder)
        .eq('id', reminderId)
        .select();

      if (error) throw error;

      // Actualizar mapa y reprogramar
      this.reminders.set(reminderId, updatedReminder);
      this.rescheduleReminder(reminderId);

      return { success: true, reminder: data[0] };
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  }

  /**
   * Eliminar recordatorio
   */
  async deleteReminder(reminderId) {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;

      // Eliminar del mapa y cancelar timer
      this.reminders.delete(reminderId);
      this.cancelReminder(reminderId);

      return { success: true };
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  }

  /**
   * Completar recordatorio
   */
  async completeReminder(reminderId) {
    try {
      const reminder = this.reminders.get(reminderId);
      if (!reminder) {
        throw new Error('Reminder not found');
      }

      const updateData = {
        completed: true,
        completed_at: new Date().toISOString()
      };

      // Si es recurrente, calcular próxima fecha
      if (reminder.recurrence_pattern && reminder.recurrence_pattern !== 'once') {
        updateData.next_reminder = this.calculateNextReminder({
          ...reminder,
          reminder_date: new Date().toISOString()
        });
        updateData.notification_sent = false;
      } else {
        updateData.active = false;
      }

      return await this.updateReminder(reminderId, updateData);
    } catch (error) {
      console.error('Error completing reminder:', error);
      throw error;
    }
  }

  /**
   * Programar recordatorio
   */
  scheduleReminder(reminder) {
    const reminderTime = new Date(reminder.next_reminder);
    const now = new Date();
    const timeUntilReminder = reminderTime - now;

    if (timeUntilReminder > 0) {
      // Cancelar timer existente si hay uno
      this.cancelReminder(reminder.id);

      // Programar nuevo timer
      const timer = setTimeout(() => {
        this.triggerReminder(reminder);
      }, timeUntilReminder);

      this.activeTimers.set(reminder.id, timer);
    } else {
      // Si ya pasó la hora, activar inmediatamente
      this.triggerReminder(reminder);
    }
  }

  /**
   * Reprogramar recordatorio
   */
  rescheduleReminder(reminderId) {
    this.cancelReminder(reminderId);
    const reminder = this.reminders.get(reminderId);
    if (reminder && reminder.active && !reminder.completed) {
      this.scheduleReminder(reminder);
    }
  }

  /**
   * Cancelar recordatorio
   */
  cancelReminder(reminderId) {
    const timer = this.activeTimers.get(reminderId);
    if (timer) {
      clearTimeout(timer);
      this.activeTimers.delete(reminderId);
    }
  }

  /**
   * Activar recordatorio
   */
  async triggerReminder(reminder) {
    try {
      console.log(`Triggering reminder: ${reminder.title}`);

      // Enviar notificación
      await this.sendReminderNotification(reminder);

      // Marcar como notificado
      await this.updateReminder(reminder.id, {
        notification_sent: true,
        last_notification: new Date().toISOString()
      });

      // Si no es recurrente, desactivar
      if (!reminder.recurrence_pattern || reminder.recurrence_pattern === 'once') {
        await this.updateReminder(reminder.id, { active: false });
      }

      // Emitir evento para componentes React
      window.dispatchEvent(new CustomEvent('reminderTriggered', {
        detail: reminder
      }));

    } catch (error) {
      console.error('Error triggering reminder:', error);
    }
  }

  /**
   * Verificar recordatorios pendientes
   */
  async checkPendingReminders() {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('active', true)
        .eq('notification_sent', false)
        .lte('next_reminder', now);

      if (error) throw error;

      data?.forEach(reminder => {
        this.triggerReminder(reminder);
      });

    } catch (error) {
      console.error('Error checking pending reminders:', error);
    }
  }

  /**
   * Enviar notificación de recordatorio
   */
  async sendReminderNotification(reminder) {
    try {
      const notificationData = {
        title: `Recordatorio: ${reminder.title}`,
        message: reminder.description || `Tiene un recordatorio programado`,
        type: 'reminder',
        priority: reminder.priority,
        user_id: reminder.assigned_to || 'current_user',
        metadata: {
          reminder_id: reminder.id,
          reminder_type: reminder.type,
          client_id: reminder.client_id,
          due_date: reminder.next_reminder
        }
      };

      // Aquí podrías integrar con el servicio de notificaciones
      console.log('Sending reminder notification:', notificationData);

      // Enviar notificación del navegador si está disponible
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notificationData.title, {
          body: notificationData.message,
          icon: '/favicon.ico',
          tag: reminder.id,
          requireInteraction: reminder.priority === 'urgent'
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending reminder notification:', error);
      throw error;
    }
  }

  /**
   * Calcular próxima fecha de recordatorio
   */
  calculateNextReminder(reminder) {
    const baseDate = new Date(reminder.reminder_date || reminder.next_reminder);
    const pattern = reminder.recurrence_pattern || 'once';

    switch (pattern) {
      case 'once':
        return baseDate.toISOString();
      
      case 'daily':
        const nextDay = new Date(baseDate);
        nextDay.setDate(nextDay.getDate() + 1);
        return nextDay.toISOString();
      
      case 'weekly':
        const nextWeek = new Date(baseDate);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return nextWeek.toISOString();
      
      case 'monthly':
        const nextMonth = new Date(baseDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth.toISOString();
      
      case 'quarterly':
        const nextQuarter = new Date(baseDate);
        nextQuarter.setMonth(nextQuarter.getMonth() + 3);
        return nextQuarter.toISOString();
      
      case 'yearly':
        const nextYear = new Date(baseDate);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        return nextYear.toISOString();
      
      default:
        return baseDate.toISOString();
    }
  }

  /**
   * Obtener recordatorios de un usuario
   */
  async getUserReminders(userId, options = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        type = null,
        priority = null,
        status = 'active'
      } = options;

      let query = supabase
        .from('reminders')
        .select('*')
        .eq('assigned_to', userId)
        .order('next_reminder', { ascending: true })
        .range(offset, offset + limit - 1);

      if (type) {
        query = query.eq('type', type);
      }

      if (priority) {
        query = query.eq('priority', priority);
      }

      if (status === 'active') {
        query = query.eq('active', true).eq('completed', false);
      } else if (status === 'completed') {
        query = query.eq('completed', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting user reminders:', error);
      return [];
    }
  }

  /**
   * Obtener recordatorios de un cliente
   */
  async getClientReminders(clientId, options = {}) {
    try {
      const {
        limit = 20,
        offset = 0,
        active = true
      } = options;

      let query = supabase
        .from('reminders')
        .select('*')
        .eq('client_id', clientId)
        .order('next_reminder', { ascending: true })
        .range(offset, offset + limit - 1);

      if (active) {
        query = query.eq('active', true).eq('completed', false);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting client reminders:', error);
      return [];
    }
  }

  /**
   * Crear recordatorios automáticos basados en reglas
   */
  async createAutomaticReminders() {
    try {
      const rules = await this.getReminderRules();
      
      for (const rule of rules) {
        await this.processReminderRule(rule);
      }
    } catch (error) {
      console.error('Error creating automatic reminders:', error);
    }
  }

  /**
   * Obtener reglas de recordatorios
   */
  async getReminderRules() {
    try {
      const { data, error } = await supabase
        .from('reminder_rules')
        .select('*')
        .eq('active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting reminder rules:', error);
      return [];
    }
  }

  /**
   * Procesar regla de recordatorios
   */
  async processReminderRule(rule) {
    try {
      switch (rule.trigger_type) {
        case 'new_client':
          await this.createClientOnboardingReminders(rule);
          break;
        case 'order_completed':
          await this.createOrderFollowUpReminders(rule);
          break;
        case 'campaign_end':
          await this.createCampaignReminders(rule);
          break;
        case 'birthday':
          await this.createBirthdayReminders(rule);
          break;
        default:
          console.log(`Unknown rule trigger type: ${rule.trigger_type}`);
      }
    } catch (error) {
      console.error('Error processing reminder rule:', error);
    }
  }

  /**
   * Crear recordatorios de onboarding para nuevos clientes
   */
  async createClientOnboardingReminders(rule) {
    try {
      // Obtener clientes nuevos sin recordatorios de onboarding
      const { data: newClients, error } = await supabase
        .from('clientes')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      for (const client of newClients) {
        // Verificar si ya tiene recordatorios de onboarding
        const { data: existingReminders } = await supabase
          .from('reminders')
          .select('*')
          .eq('client_id', client.id_cliente)
          .eq('type', 'follow_up');

        if (!existingReminders?.length) {
          // Crear secuencia de onboarding
          await this.createOnboardingSequence(client, rule);
        }
      }
    } catch (error) {
      console.error('Error creating client onboarding reminders:', error);
    }
  }

  /**
   * Crear secuencia de onboarding
   */
  async createOnboardingSequence(client, rule) {
    const sequence = [
      {
        title: 'Llamada de bienvenida',
        description: 'Realizar llamada de bienvenida al nuevo cliente',
        type: 'call',
        priority: 'high',
        days_after: 1
      },
      {
        title: 'Email de seguimiento',
        description: 'Enviar email con información adicional',
        type: 'email',
        priority: 'medium',
        days_after: 3
      },
      {
        title: 'Reunión de presentación',
        description: 'Agendar reunión para presentar servicios',
        type: 'meeting',
        priority: 'high',
        days_after: 7
      }
    ];

    for (const step of sequence) {
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + step.days_after);

      await this.createReminder({
        client_id: client.id_cliente,
        title: step.title,
        description: step.description,
        type: step.type,
        priority: step.priority,
        reminder_date: reminderDate.toISOString(),
        assigned_to: rule.default_assignee || 'current_user',
        recurrence_pattern: 'once',
        auto_generated: true
      });
    }
  }

  /**
   * Obtener recordatorios próximos
   */
  async getUpcomingReminders(userId = null, hours = 24) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() + hours);

      let query = supabase
        .from('reminders')
        .select(`
          *,
          clientes (nombrecliente, razonsocial)
        `)
        .eq('active', true)
        .eq('completed', false)
        .gte('next_reminder', new Date().toISOString())
        .lte('next_reminder', cutoffDate.toISOString())
        .order('next_reminder', { ascending: true });

      if (userId) {
        query = query.eq('assigned_to', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting upcoming reminders:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas de recordatorios
   */
  async getReminderStats(userId = null) {
    try {
      let query = supabase
        .from('reminders')
        .select('type, priority, completed, created_at');

      if (userId) {
        query = query.eq('assigned_to', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = data.reduce((acc, reminder) => {
        acc.total++;
        
        if (reminder.completed) {
          acc.completed++;
        } else {
          acc.pending++;
        }
        
        acc.byType[reminder.type] = (acc.byType[reminder.type] || 0) + 1;
        acc.byPriority[reminder.priority] = (acc.byPriority[reminder.priority] || 0) + 1;
        
        return acc;
      }, {
        total: 0,
        completed: 0,
        pending: 0,
        byType: {},
        byPriority: {}
      });

      return stats;
    } catch (error) {
      console.error('Error getting reminder stats:', error);
      return {
        total: 0,
        completed: 0,
        pending: 0,
        byType: {},
        byPriority: {}
      };
    }
  }

  /**
   * Solicitar permiso para notificaciones del navegador
   */
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  /**
   * Obtener tipos de recordatorios
   */
  getReminderTypes() {
    return this.reminderTypes;
  }

  /**
   * Obtener niveles de prioridad
   */
  getPriorityLevels() {
    return this.priorityLevels;
  }

  /**
   * Obtener patrones de recurrencia
   */
  getRecurrencePatterns() {
    return this.recurrencePatterns;
  }

  /**
   * Limpiar timers al destruir el servicio
   */
  destroy() {
    this.activeTimers.forEach(timer => clearTimeout(timer));
    this.activeTimers.clear();
    this.reminders.clear();
  }
}

export default new ReminderService();