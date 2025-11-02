/**
 * Servicio de Automatización Inteligente para CRM
 * Proporciona funcionalidades avanzadas de automatización
 */

import { supabase } from '../config/supabase';

class AutomationService {
  constructor() {
    this.automationRules = [];
    this.taskQueue = [];
    this.isProcessing = false;
    this.notifications = [];
    this.loadAutomationRules();
  }

  /**
   * Cargar reglas de automatización desde la base de datos
   */
  async loadAutomationRules() {
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('active', true)
        .order('priority', { ascending: true });

      if (error) throw error;
      this.automationRules = data || [];
    } catch (error) {
      console.error('Error loading automation rules:', error);
      // Cargar reglas por defecto si hay error
      this.automationRules = this.getDefaultRules();
    }
  }

  /**
   * Reglas de automatización por defecto
   */
  getDefaultRules() {
    return [
      {
        id: 'welcome_email',
        name: 'Email de Bienvenida',
        trigger: 'new_client',
        conditions: {},
        actions: ['send_welcome_email', 'create_followup_task'],
        priority: 1,
        active: true
      },
      {
        id: 'campaign_reminder',
        name: 'Recordatorio de Campaña',
        trigger: 'campaign_expiring',
        conditions: { days_before: 3 },
        actions: ['send_reminder_email', 'notify_manager'],
        priority: 2,
        active: true
      },
      {
        id: 'order_confirmation',
        name: 'Confirmación de Orden',
        trigger: 'new_order',
        conditions: {},
        actions: ['send_confirmation_email', 'update_inventory', 'notify_sales_team'],
        priority: 1,
        active: true
      },
      {
        id: 'client_birthday',
        name: 'Felicitación de Cumpleaños',
        trigger: 'client_birthday',
        conditions: {},
        actions: ['send_birthday_email', 'apply_discount'],
        priority: 3,
        active: true
      },
      {
        id: 'inactive_client',
        name: 'Cliente Inactivo',
        trigger: 'client_inactive',
        conditions: { days_inactive: 30 },
        actions: ['send_reactivation_email', 'create_task'],
        priority: 4,
        active: true
      }
    ];
  }

  /**
   * Procesar evento y ejecutar reglas de automatización
   */
  async processEvent(eventType, data) {
    try {
      const applicableRules = this.automationRules.filter(rule => 
        rule.trigger === eventType && rule.active
      );

      for (const rule of applicableRules) {
        if (await this.evaluateConditions(rule.conditions, data)) {
          await this.executeActions(rule.actions, data, rule);
        }
      }
    } catch (error) {
      console.error('Error processing automation event:', error);
      throw error;
    }
  }

  /**
   * Evaluar condiciones de una regla
   */
  async evaluateConditions(conditions, data) {
    try {
      for (const [key, value] of Object.entries(conditions)) {
        switch (key) {
          case 'days_before':
            if (data.days_until_expiry > value) return false;
            break;
          case 'days_inactive':
            if (data.days_inactive < value) return false;
            break;
          case 'amount_threshold':
            if (data.amount < value) return false;
            break;
          default:
            if (data[key] !== value) return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error evaluating conditions:', error);
      return false;
    }
  }

  /**
   * Ejecutar acciones de automatización
   */
  async executeActions(actions, data, rule) {
    try {
      for (const action of actions) {
        await this.executeAction(action, data, rule);
      }
    } catch (error) {
      console.error('Error executing actions:', error);
      throw error;
    }
  }

  /**
   * Ejecutar una acción específica
   */
  async executeAction(action, data, rule) {
    try {
      switch (action) {
        case 'send_welcome_email':
          await this.sendWelcomeEmail(data);
          break;
        case 'send_reminder_email':
          await this.sendReminderEmail(data);
          break;
        case 'send_confirmation_email':
          await this.sendConfirmationEmail(data);
          break;
        case 'send_birthday_email':
          await this.sendBirthdayEmail(data);
          break;
        case 'send_reactivation_email':
          await this.sendReactivationEmail(data);
          break;
        case 'create_followup_task':
          await this.createFollowupTask(data, rule);
          break;
        case 'create_task':
          await this.createTask(data, rule);
          break;
        case 'update_inventory':
          await this.updateInventory(data);
          break;
        case 'notify_manager':
          await this.notifyManager(data, rule);
          break;
        case 'notify_sales_team':
          await this.notifySalesTeam(data);
          break;
        case 'apply_discount':
          await this.applyDiscount(data);
          break;
        default:
          console.warn(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error(`Error executing action ${action}:`, error);
      throw error;
    }
  }

  /**
   * Enviar email de bienvenida
   */
  async sendWelcomeEmail(clientData) {
    try {
      const emailData = {
        to: clientData.email,
        subject: '¡Bienvenido a PautaPro!',
        template: 'welcome',
        data: {
          clientName: clientData.nombrecliente,
          companyName: clientData.razonsocial,
          loginUrl: `${window.location.origin}/login`
        }
      };

      // Aquí iría la integración con el servicio de email
      console.log('Sending welcome email:', emailData);
      
      // Guardar registro de envío
      await this.logEmailSent(clientData.id_cliente, 'welcome', emailData);
      
      return { success: true, message: 'Email de bienvenida enviado' };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  /**
   * Enviar recordatorio de campaña
   */
  async sendReminderEmail(campaignData) {
    try {
      const emailData = {
        to: campaignData.client_email,
        subject: `Recordatorio: Campaña ${campaignData.nombrecampania}`,
        template: 'campaign_reminder',
        data: {
          campaignName: campaignData.nombrecampania,
          expiryDate: campaignData.fecha_fin,
          daysLeft: campaignData.days_until_expiry
        }
      };

      console.log('Sending reminder email:', emailData);
      await this.logEmailSent(campaignData.id_campania, 'reminder', emailData);
      
      return { success: true, message: 'Email de recordatorio enviado' };
    } catch (error) {
      console.error('Error sending reminder email:', error);
      throw error;
    }
  }

  /**
   * Enviar email de confirmación de orden
   */
  async sendConfirmationEmail(orderData) {
    try {
      const emailData = {
        to: orderData.client_email,
        subject: `Confirmación de Orden #${orderData.id_orden}`,
        template: 'order_confirmation',
        data: {
          orderNumber: orderData.id_orden,
          clientName: orderData.client_name,
          totalAmount: orderData.total,
          items: orderData.items
        }
      };

      console.log('Sending confirmation email:', emailData);
      await this.logEmailSent(orderData.id_orden, 'confirmation', emailData);
      
      return { success: true, message: 'Email de confirmación enviado' };
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      throw error;
    }
  }

  /**
   * Enviar email de cumpleaños
   */
  async sendBirthdayEmail(clientData) {
    try {
      const emailData = {
        to: clientData.email,
        subject: '¡Feliz Cumpleaños!',
        template: 'birthday',
        data: {
          clientName: clientData.nombrecliente,
          discountCode: 'CUMPLEANOS15',
          discountAmount: 15
        }
      };

      console.log('Sending birthday email:', emailData);
      await this.logEmailSent(clientData.id_cliente, 'birthday', emailData);
      
      return { success: true, message: 'Email de cumpleaños enviado' };
    } catch (error) {
      console.error('Error sending birthday email:', error);
      throw error;
    }
  }

  /**
   * Enviar email de reactivación
   */
  async sendReactivationEmail(clientData) {
    try {
      const emailData = {
        to: clientData.email,
        subject: 'Te extrañamos en PautaPro',
        template: 'reactivation',
        data: {
          clientName: clientData.nombrecliente,
          lastActivity: clientData.ultima_actividad,
          specialOffer: 'Te extrañamos 20% de descuento'
        }
      };

      console.log('Sending reactivation email:', emailData);
      await this.logEmailSent(clientData.id_cliente, 'reactivation', emailData);
      
      return { success: true, message: 'Email de reactivación enviado' };
    } catch (error) {
      console.error('Error sending reactivation email:', error);
      throw error;
    }
  }

  /**
   * Crear tarea de seguimiento
   */
  async createFollowupTask(clientData, rule) {
    try {
      const taskData = {
        title: `Seguimiento con ${clientData.nombrecliente}`,
        description: `Contactar al cliente ${clientData.nombrecliente} para seguimiento post-registro.`,
        assigned_to: 'sales_team',
        priority: 'medium',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        client_id: clientData.id_cliente,
        automation_rule_id: rule.id,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select();

      if (error) throw error;
      
      console.log('Follow-up task created:', data[0]);
      return { success: true, task: data[0] };
    } catch (error) {
      console.error('Error creating follow-up task:', error);
      throw error;
    }
  }

  /**
   * Crear tarea genérica
   */
  async createTask(data, rule) {
    try {
      const taskData = {
        title: `Tarea automática: ${rule.name}`,
        description: `Tarea creada automáticamente por la regla: ${rule.name}`,
        assigned_to: 'automation',
        priority: 'low',
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        automation_rule_id: rule.id,
        status: 'pending',
        metadata: data
      };

      const { data: result, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select();

      if (error) throw error;
      
      console.log('Task created:', result[0]);
      return { success: true, task: result[0] };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Actualizar inventario
   */
  async updateInventory(orderData) {
    try {
      // Lógica para actualizar inventario basado en la orden
      console.log('Updating inventory for order:', orderData);
      
      // Aquí iría la lógica real de actualización de inventario
      return { success: true, message: 'Inventario actualizado' };
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  }

  /**
   * Notificar al gerente
   */
  async notifyManager(data, rule) {
    try {
      const notification = {
        title: `Notificación Automática: ${rule.name}`,
        message: `La regla "${rule.name}" se ha ejecutado para ${data.client_name || data.campaign_name || 'elemento'}`,
        type: 'automation',
        user_id: 'manager',
        metadata: data,
        read: false,
        created_at: new Date().toISOString()
      };

      const { data: result, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select();

      if (error) throw error;
      
      console.log('Manager notified:', result[0]);
      return { success: true, notification: result[0] };
    } catch (error) {
      console.error('Error notifying manager:', error);
      throw error;
    }
  }

  /**
   * Notificar al equipo de ventas
   */
  async notifySalesTeam(data) {
    try {
      const notification = {
        title: 'Nueva Orden Creada',
        message: `Se ha creado una nueva orden para ${data.client_name} por $${data.total}`,
        type: 'order',
        user_id: 'sales_team',
        metadata: data,
        read: false,
        created_at: new Date().toISOString()
      };

      const { data: result, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select();

      if (error) throw error;
      
      console.log('Sales team notified:', result[0]);
      return { success: true, notification: result[0] };
    } catch (error) {
      console.error('Error notifying sales team:', error);
      throw error;
    }
  }

  /**
   * Aplicar descuento
   */
  async applyDiscount(clientData) {
    try {
      const discountData = {
        client_id: clientData.id_cliente,
        discount_code: 'CUMPLEANOS15',
        discount_percentage: 15,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        applied_by: 'automation',
        created_at: new Date().toISOString()
      };

      const { data: result, error } = await supabase
        .from('client_discounts')
        .insert([discountData])
        .select();

      if (error) throw error;
      
      console.log('Discount applied:', result[0]);
      return { success: true, discount: result[0] };
    } catch (error) {
      console.error('Error applying discount:', error);
      throw error;
    }
  }

  /**
   * Registrar envío de email
   */
  async logEmailSent(recipientId, type, emailData) {
    try {
      const logData = {
        recipient_id: recipientId,
        recipient_type: type === 'welcome' || 'birthday' || 'reactivation' ? 'client' : 'campaign',
        email_type: type,
        subject: emailData.subject,
        template: emailData.template,
        sent_at: new Date().toISOString(),
        status: 'sent',
        metadata: emailData.data
      };

      const { error } = await supabase
        .from('email_logs')
        .insert([logData]);

      if (error) throw error;
    } catch (error) {
      console.error('Error logging email:', error);
    }
  }

  /**
   * Obtener reglas de automatización
   */
  getAutomationRules() {
    return this.automationRules;
  }

  /**
   * Crear nueva regla de automatización
   */
  async createAutomationRule(ruleData) {
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .insert([{
          ...ruleData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      
      await this.loadAutomationRules();
      return { success: true, rule: data[0] };
    } catch (error) {
      console.error('Error creating automation rule:', error);
      throw error;
    }
  }

  /**
   * Actualizar regla de automatización
   */
  async updateAutomationRule(ruleId, updateData) {
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', ruleId)
        .select();

      if (error) throw error;
      
      await this.loadAutomationRules();
      return { success: true, rule: data[0] };
    } catch (error) {
      console.error('Error updating automation rule:', error);
      throw error;
    }
  }

  /**
   * Eliminar regla de automatización
   */
  async deleteAutomationRule(ruleId) {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
      
      await this.loadAutomationRules();
      return { success: true, message: 'Regla eliminada' };
    } catch (error) {
      console.error('Error deleting automation rule:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de automatización
   */
  async getAutomationStats() {
    try {
      const [emailStats, taskStats, ruleStats] = await Promise.all([
        this.getEmailStats(),
        this.getTaskStats(),
        this.getRuleStats()
      ]);

      return {
        emails: emailStats,
        tasks: taskStats,
        rules: ruleStats
      };
    } catch (error) {
      console.error('Error getting automation stats:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de emails
   */
  async getEmailStats() {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('email_type', 'status')
        .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const stats = data.reduce((acc, email) => {
        acc.total++;
        if (email.status === 'sent') acc.sent++;
        return acc;
      }, { total: 0, sent: 0 });

      return stats;
    } catch (error) {
      console.error('Error getting email stats:', error);
      return { total: 0, sent: 0 };
    }
  }

  /**
   * Obtener estadísticas de tareas
   */
  async getTaskStats() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('status')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const stats = data.reduce((acc, task) => {
        acc.total++;
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, { total: 0, pending: 0, completed: 0, in_progress: 0 });

      return stats;
    } catch (error) {
      console.error('Error getting task stats:', error);
      return { total: 0, pending: 0, completed: 0, in_progress: 0 };
    }
  }

  /**
   * Obtener estadísticas de reglas
   */
  async getRuleStats() {
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('active');

      if (error) throw error;

      const stats = data.reduce((acc, rule) => {
        acc.total++;
        if (rule.active) acc.active++;
        return acc;
      }, { total: 0, active: 0 });

      return stats;
    } catch (error) {
      console.error('Error getting rule stats:', error);
      return { total: 0, active: 0 };
    }
  }
}

export default new AutomationService();