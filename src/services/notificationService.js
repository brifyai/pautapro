/**
 * Servicio de Notificaciones Inteligentes para CRM
 * Proporciona un sistema avanzado de gestión de notificaciones
 */

import { supabase } from '../config/supabase';

class NotificationService {
  constructor() {
    this.notifications = [];
    this.unreadCount = 0;
    this.listeners = [];
    this.realtimeSubscription = null;
    this.userPreferences = {
      email: true,
      push: true,
      inApp: true,
      types: {
        order: true,
        client: true,
        campaign: true,
        system: true,
        automation: true
      }
    };
    this.loadUserPreferences();
    this.initializeRealtime();
  }

  /**
   * Inicializar suscripción a notificaciones en tiempo real
   */
  initializeRealtime() {
    try {
      this.realtimeSubscription = supabase
        .channel('notifications')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications' 
          }, 
          (payload) => {
            this.handleRealtimeNotification(payload.new);
          }
        )
        .subscribe();
    } catch (error) {
      console.error('Error initializing realtime notifications:', error);
    }
  }

  /**
   * Manejar notificación en tiempo real
   */
  async handleRealtimeNotification(notification) {
    try {
      // Verificar preferencias del usuario
      if (!this.shouldShowNotification(notification)) {
        return;
      }

      // Agregar a la lista local
      this.notifications.unshift(notification);
      this.unreadCount++;

      // Notificar a los listeners
      this.notifyListeners();

      // Mostrar notificación en la app
      if (this.userPreferences.inApp) {
        this.showInAppNotification(notification);
      }

      // Enviar notificación push
      if (this.userPreferences.push) {
        await this.sendPushNotification(notification);
      }

      // Enviar email
      if (this.userPreferences.email) {
        await this.sendEmailNotification(notification);
      }
    } catch (error) {
      console.error('Error handling realtime notification:', error);
    }
  }

  /**
   * Verificar si se debe mostrar la notificación según preferencias
   */
  shouldShowNotification(notification) {
    return this.userPreferences.types[notification.type] !== false;
  }

  /**
   * Mostrar notificación en la aplicación
   */
  showInAppNotification(notification) {
    // Crear notificación del navegador si está disponible
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: false
      });
    }

    // Emitir evento personalizado para componentes React
    window.dispatchEvent(new CustomEvent('newNotification', {
      detail: notification
    }));
  }

  /**
   * Enviar notificación push
   */
  async sendPushNotification(notification) {
    try {
      // Aquí iría la integración con servicio de push notifications
      console.log('Sending push notification:', notification);
      
      // Simulación de envío
      return { success: true };
    } catch (error) {
      console.error('Error sending push notification:', error);
      return { success: false, error };
    }
  }

  /**
   * Enviar notificación por email
   */
  async sendEmailNotification(notification) {
    try {
      // Aquí iría la integración con servicio de email
      console.log('Sending email notification:', notification);
      
      // Simulación de envío
      return { success: true };
    } catch (error) {
      console.error('Error sending email notification:', error);
      return { success: false, error };
    }
  }

  /**
   * Cargar notificaciones del usuario
   */
  async loadNotifications(userId = 'current_user') {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      this.notifications = data || [];
      this.unreadCount = this.notifications.filter(n => !n.read).length;
      this.notifyListeners();

      return this.notifications;
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  /**
   * Crear nueva notificación
   */
  async createNotification(notificationData) {
    try {
      const notification = {
        ...notificationData,
        id: crypto.randomUUID(),
        user_id: notificationData.user_id || 'current_user',
        read: false,
        created_at: new Date().toISOString(),
        metadata: notificationData.metadata || {}
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select();

      if (error) throw error;

      return { success: true, notification: data[0] };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      // Actualizar estado local
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        notification.read_at = new Date().toISOString();
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.notifyListeners();
      }

      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(userId = 'current_user') {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;

      // Actualizar estado local
      this.notifications.forEach(notification => {
        notification.read = true;
        notification.read_at = new Date().toISOString();
      });
      this.unreadCount = 0;
      this.notifyListeners();

      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Eliminar notificación
   */
  async deleteNotification(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      // Actualizar estado local
      const index = this.notifications.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        const notification = this.notifications[index];
        if (!notification.read) {
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
        this.notifications.splice(index, 1);
        this.notifyListeners();
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Crear notificaciones inteligentes basadas en eventos del sistema
   */
  async createSmartNotification(eventType, data) {
    try {
      let notificationData = null;

      switch (eventType) {
        case 'new_order':
          notificationData = {
            title: 'Nueva Orden Creada',
            message: `Se ha creado una nueva orden para ${data.client_name} por $${data.total}`,
            type: 'order',
            priority: 'high',
            action_url: `/ordenes/${data.id}`,
            metadata: { order_id: data.id, client_id: data.client_id }
          };
          break;

        case 'order_status_change':
          notificationData = {
            title: 'Estado de Orden Actualizado',
            message: `La orden #${data.order_id} ha cambiado a "${data.new_status}"`,
            type: 'order',
            priority: 'medium',
            action_url: `/ordenes/${data.order_id}`,
            metadata: { order_id: data.order_id, old_status: data.old_status, new_status: data.new_status }
          };
          break;

        case 'new_client':
          notificationData = {
            title: 'Nuevo Cliente Registrado',
            message: `${data.client_name} se ha registrado en el sistema`,
            type: 'client',
            priority: 'medium',
            action_url: `/clientes/${data.client_id}`,
            metadata: { client_id: data.client_id }
          };
          break;

        case 'campaign_expiring':
          notificationData = {
            title: 'Campaña por Expirar',
            message: `La campaña "${data.campaign_name}" expirará en ${data.days_left} días`,
            type: 'campaign',
            priority: 'high',
            action_url: `/campaigns/${data.campaign_id}`,
            metadata: { campaign_id: data.campaign_id, days_left: data.days_left }
          };
          break;

        case 'client_inactive':
          notificationData = {
            title: 'Cliente Inactivo',
            message: `${data.client_name} no ha tenido actividad en ${data.days_inactive} días`,
            type: 'client',
            priority: 'low',
            action_url: `/clientes/${data.client_id}`,
            metadata: { client_id: data.client_id, days_inactive: data.days_inactive }
          };
          break;

        case 'automation_executed':
          notificationData = {
            title: 'Automatización Ejecutada',
            message: `La regla "${data.rule_name}" se ha ejecutado correctamente`,
            type: 'automation',
            priority: 'low',
            action_url: `/automation`,
            metadata: { rule_id: data.rule_id, rule_name: data.rule_name }
          };
          break;

        case 'system_maintenance':
          notificationData = {
            title: 'Mantenimiento del Sistema',
            message: data.message,
            type: 'system',
            priority: 'high',
            action_url: null,
            metadata: { maintenance_type: data.type }
          };
          break;

        default:
          console.warn(`Unknown event type: ${eventType}`);
          return null;
      }

      if (notificationData) {
        return await this.createNotification(notificationData);
      }
    } catch (error) {
      console.error('Error creating smart notification:', error);
      throw error;
    }
  }

  /**
   * Solicitar permiso para notificaciones del navegador
   */
  async requestBrowserPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  /**
   * Cargar preferencias del usuario
   */
  async loadUserPreferences() {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('notification_preferences')
        .eq('user_id', 'current_user')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.notification_preferences) {
        this.userPreferences = { ...this.userPreferences, ...data.notification_preferences };
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  }

  /**
   * Guardar preferencias del usuario
   */
  async saveUserPreferences(preferences) {
    try {
      this.userPreferences = { ...this.userPreferences, ...preferences };

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: 'current_user',
          notification_preferences: this.userPreferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  }

  /**
   * Obtener notificaciones no leídas
   */
  getUnreadNotifications() {
    return this.notifications.filter(n => !n.read);
  }

  /**
   * Obtener contador de no leídos
   */
  getUnreadCount() {
    return this.unreadCount;
  }

  /**
   * Obtener todas las notificaciones
   */
  getAllNotifications() {
    return this.notifications;
  }

  /**
   * Agregar listener para cambios en notificaciones
   */
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notificar a todos los listeners
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback({
          notifications: this.notifications,
          unreadCount: this.unreadCount
        });
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  /**
   * Obtener estadísticas de notificaciones
   */
  async getNotificationStats() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('type, read, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const stats = data.reduce((acc, notification) => {
        acc.total++;
        acc.byType[notification.type] = (acc.byType[notification.type] || 0) + 1;
        if (notification.read) {
          acc.read++;
        } else {
          acc.unread++;
        }
        return acc;
      }, {
        total: 0,
        read: 0,
        unread: 0,
        byType: {}
      });

      return stats;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return { total: 0, read: 0, unread: 0, byType: {} };
    }
  }

  /**
   * Limpiar notificaciones antiguas
   */
  async cleanupOldNotifications(daysOld = 90) {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('notifications')
        .delete()
        .lt('created_at', cutoffDate)
        .eq('read', true);

      if (error) throw error;

      console.log(`Cleaned up notifications older than ${daysOld} days`);
      return { success: true };
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      throw error;
    }
  }

  /**
   * Destruer servicio
   */
  destroy() {
    if (this.realtimeSubscription) {
      supabase.removeChannel(this.realtimeSubscription);
    }
    this.listeners = [];
  }
}

export default new NotificationService();