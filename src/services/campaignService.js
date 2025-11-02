import { supabase } from '../config/supabase';

export const campaignService = {
  // Estados de campaña con lógica automática mejorada
  campaignStates: {
    'borrador': {
      next: 'revision',
      autoTransition: false,
      color: '#64748b',
      description: 'Campaña en borrador',
      estimatedDays: null,
      notifications: [],
      requirements: ['nombre', 'cliente', 'producto'],
      checklist: ['Definir objetivos', 'Asignar presupuesto', 'Seleccionar medios']
    },
    'revision': {
      next: 'aprobada',
      autoTransition: false,
      color: '#f59e0b',
      description: 'Esperando aprobación',
      estimatedDays: 3,
      notifications: ['gerente', 'cliente'],
      requirements: ['presupuesto_aprobado', 'medios_seleccionados'],
      checklist: ['Revisar presupuesto', 'Validar medios', 'Aprobar creativos']
    },
    'aprobada': {
      next: 'produccion',
      autoTransition: false,
      color: '#3b82f6',
      description: 'Aprobada, lista para producción',
      estimatedDays: 2,
      notifications: ['equipo', 'proveedor'],
      requirements: ['fecha_inicio_definida'],
      checklist: ['Confirmar fechas', 'Asignar recursos', 'Coordinar con proveedores']
    },
    'produccion': {
      next: 'live',
      autoTransition: false,
      color: '#8b5cf6',
      description: 'En producción',
      estimatedDays: 7,
      notifications: ['equipo', 'gerente'],
      requirements: ['materiales_listos'],
      checklist: ['Preparar materiales', 'Configurar sistemas', 'Test de calidad']
    },
    'live': {
      next: 'finalizada',
      autoTransition: true, // Auto por fecha fin
      color: '#10b981',
      description: 'Campaña activa',
      estimatedDays: null,
      notifications: ['cliente', 'equipo'],
      requirements: [],
      checklist: ['Monitorear rendimiento', 'Reportes diarios', 'Optimizaciones']
    },
    'finalizada': {
      next: null,
      autoTransition: false,
      color: '#6b7280',
      description: 'Campaña finalizada',
      estimatedDays: null,
      notifications: ['cliente', 'gerente'],
      requirements: ['reporte_final'],
      checklist: ['Generar reporte final', 'Análisis de resultados', 'Lecciones aprendidas']
    },
    'cancelada': {
      next: null,
      autoTransition: false,
      color: '#ef4444',
      description: 'Campaña cancelada',
      estimatedDays: null,
      notifications: ['gerente', 'cliente'],
      requirements: ['motivo_cancelacion'],
      checklist: ['Documentar motivo', 'Notificar partes afectadas', 'Procesar reembolsos']
    },
    'pausada': {
      next: 'live',
      autoTransition: false,
      color: '#f59e0b',
      description: 'Campaña pausada temporalmente',
      estimatedDays: null,
      notifications: ['gerente'],
      requirements: ['motivo_pausa'],
      checklist: ['Documentar motivo', 'Plan de reactivación']
    }
  },

  // Obtener todas las campañas con estados actualizados
  async getCampaigns() {
    try {
      const { data: campaigns, error } = await supabase
        .from('campania')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Actualizar estados automáticamente
      const updatedCampaigns = await this.updateCampaignStates(campaigns);

      return updatedCampaigns;
    } catch (error) {
      console.error('Error obteniendo campañas:', error);
      return [];
    }
  },

  // Actualizar estados de campañas automáticamente (versión mejorada)
  async updateCampaignStates(campaigns) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updates = [];
    const notifications = [];

    for (const campaign of campaigns) {
      let newState = campaign.estado;
      let needsUpdate = false;
      let notificationData = null;

      // Si está en 'live' y la fecha fin ya pasó, marcar como 'finalizada'
      if (campaign.estado === 'live' && campaign.fecha_fin) {
        const endDate = new Date(campaign.fecha_fin);
        endDate.setHours(0, 0, 0, 0);

        if (endDate < today) {
          newState = 'finalizada';
          needsUpdate = true;
          notificationData = {
            type: 'auto_finalization',
            title: 'Campaña finalizada automáticamente',
            message: `La campaña "${campaign.nombrecampania}" ha finalizado automáticamente según su fecha de término.`
          };
        }
      }

      // Si está en 'produccion' y la fecha inicio ya llegó, marcar como 'live'
      if (campaign.estado === 'produccion' && campaign.fecha_inicio) {
        const startDate = new Date(campaign.fecha_inicio);
        startDate.setHours(0, 0, 0, 0);

        if (startDate <= today) {
          newState = 'live';
          needsUpdate = true;
          notificationData = {
            type: 'auto_activation',
            title: 'Campaña activada automáticamente',
            message: `La campaña "${campaign.nombrecampania}" ha comenzado según su fecha de inicio.`
          };
        }
      }

      // Verificar campañas en revisión que llevan mucho tiempo
      if (campaign.estado === 'revision' && campaign.updated_at) {
        const daysInRevision = Math.floor((today - new Date(campaign.updated_at)) / (1000 * 60 * 60 * 24));
        if (daysInRevision > 7) {
          notificationData = {
            type: 'stalled_review',
            title: 'Campaña estancada en revisión',
            message: `La campaña "${campaign.nombrecampania}" lleva ${daysInRevision} días en revisión.`
          };
          notifications.push({ campaign, notificationData });
        }
      }

      // Verificar campañas próximas a vencer
      if (campaign.estado === 'live' && campaign.fecha_fin) {
        const endDate = new Date(campaign.fecha_fin);
        const daysUntilEnd = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilEnd <= 3 && daysUntilEnd > 0) {
          notificationData = {
            type: 'upcoming_end',
            title: 'Campaña próxima a finalizar',
            message: `La campaña "${campaign.nombrecampania}" finalizará en ${daysUntilEnd} días.`
          };
          notifications.push({ campaign, notificationData });
        }
      }

      if (needsUpdate) {
        try {
          const updateData = {
            estado: newState,
            updated_at: new Date().toISOString()
          };

          // Agregar timestamps específicos según el estado
          if (newState === 'live') {
            updateData.fecha_inicio_real = new Date().toISOString();
          } else if (newState === 'finalizada') {
            updateData.fecha_fin_real = new Date().toISOString();
          }

          await supabase
            .from('campania')
            .update(updateData)
            .eq('id_campania', campaign.id_campania);

          campaign.estado = newState;
          updates.push(campaign);

          // Crear notificación si hay cambio de estado
          if (notificationData) {
            await this.createStateNotification(campaign.id, campaign.estado, newState, notificationData);
          }

        } catch (updateError) {
          console.error(`Error actualizando campaña ${campaign.id}:`, updateError);
        }
      }
    }

    // Enviar notificaciones de advertencia
    for (const { campaign, notificationData } of notifications) {
      await this.createStateNotification(campaign.id, campaign.estado, campaign.estado, notificationData);
    }

    return campaigns;
  },

  // Crear notificación de cambio de estado
  async createStateNotification(campaignId, oldState, newState, notificationData) {
    try {
      await supabase
        .from('mensajes')
        .insert({
          asunto: notificationData.title,
          contenido: notificationData.message,
          tipo: 'sistema',
          prioridad: notificationData.type === 'stalled_review' ? 'alta' : 'media',
          id_campania: campaignId,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error creando notificación de estado:', error);
    }
  },

  // Cambiar estado de campaña manualmente
  async changeCampaignState(campaignId, newState, userId = null) {
    try {
      const updateData = {
        estado: newState,
        updated_at: new Date().toISOString()
      };

      // Agregar información de usuario si está disponible
      if (userId) {
        updateData.last_modified_by = userId;
      }

      const { data, error } = await supabase
        .from('campania')
        .update(updateData)
        .eq('id_campania', campaignId)
        .select()
        .single();

      if (error) throw error;

      // Crear registro de auditoría
      await this.createAuditLog(campaignId, 'estado_cambiado', {
        estado_anterior: data.estado,
        estado_nuevo: newState,
        usuario: userId
      });

      return data;
    } catch (error) {
      console.error('Error cambiando estado de campaña:', error);
      throw error;
    }
  },

  // Crear registro de auditoría
  async createAuditLog(campaignId, action, details) {
    try {
      await supabase
        .from('campaign_audit_log')
        .insert({
          campaign_id: campaignId,
          action: action,
          details: details,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error creando registro de auditoría:', error);
      // No lanzamos error para no interrumpir el flujo principal
    }
  },

  // Obtener campañas por estado
  async getCampaignsByState(state) {
    try {
      const { data, error } = await supabase
        .from('campania')
        .select('*')
        .eq('estado', state)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error obteniendo campañas en estado ${state}:`, error);
      return [];
    }
  },

  // Obtener estadísticas de campañas
  async getCampaignStats() {
    try {
      const { data, error } = await supabase
        .from('campania')
        .select('estado');

      if (error) throw error;

      const stats = {
        borrador: 0,
        revision: 0,
        aprobada: 0,
        produccion: 0,
        live: 0,
        finalizada: 0,
        cancelada: 0
      };

      data?.forEach(campaign => {
        if (stats.hasOwnProperty(campaign.estado)) {
          stats[campaign.estado]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas de campañas:', error);
      return {
        borrador: 0,
        revision: 0,
        aprobada: 0,
        produccion: 0,
        live: 0,
        finalizada: 0,
        cancelada: 0
      };
    }
  },

  // Validar transición de estado
  validateStateTransition(currentState, newState) {
    const currentStateConfig = this.campaignStates[currentState];
    const newStateConfig = this.campaignStates[newState];

    if (!currentStateConfig || !newStateConfig) {
      return { valid: false, message: 'Estado no válido' };
    }

    // Verificar si la transición es permitida
    if (currentStateConfig.next !== newState && !currentStateConfig.autoTransition) {
      return { valid: false, message: 'Transición no permitida' };
    }

    return { valid: true, message: 'Transición válida' };
  },

  // Obtener checklist para un estado específico
  getStateChecklist(state) {
    const stateConfig = this.campaignStates[state];
    return stateConfig?.checklist || [];
  },

  // Verificar requisitos para un estado
  async checkStateRequirements(campaignId, targetState) {
    try {
      const stateConfig = this.campaignStates[targetState];
      if (!stateConfig || !stateConfig.requirements) {
        return { valid: true, missing: [] };
      }

      const { data: campaign, error } = await supabase
        .from('campania')
        .select('*')
        .eq('id_campania', campaignId)
        .single();

      if (error) throw error;

      const missing = [];

      // Verificar requisitos básicos
      if (stateConfig.requirements.includes('nombre') && !campaign.nombrecampania) {
        missing.push('Nombre de la campaña');
      }

      if (stateConfig.requirements.includes('cliente') && !campaign.id_Cliente) {
        missing.push('Cliente asignado');
      }

      if (stateConfig.requirements.includes('producto') && !campaign.id_Producto) {
        missing.push('Producto asignado');
      }

      if (stateConfig.requirements.includes('presupuesto_aprobado') && (!campaign.Presupuesto || campaign.Presupuesto <= 0)) {
        missing.push('Presupuesto aprobado');
      }

      if (stateConfig.requirements.includes('fecha_inicio_definida') && !campaign.fecha_inicio) {
        missing.push('Fecha de inicio definida');
      }

      if (stateConfig.requirements.includes('materiales_listos')) {
        // Verificar si hay materiales asociados
        const { data: materiales } = await supabase
          .from('campania_temas')
          .select('id_temas')
          .eq('id_campania', campaignId);

        if (!materiales || materiales.length === 0) {
          missing.push('Materiales de campaña');
        }
      }

      return {
        valid: missing.length === 0,
        missing
      };
    } catch (error) {
      console.error('Error verificando requisitos de estado:', error);
      return { valid: false, missing: ['Error al verificar requisitos'] };
    }
  },

  // Obtener timeline de estados de una campaña
  async getCampaignTimeline(campaignId) {
    try {
      const { data: logs, error } = await supabase
        .from('campaign_audit_log')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return logs || [];
    } catch (error) {
      console.error('Error obteniendo timeline de campaña:', error);
      return [];
    }
  },

  // Obtener métricas de rendimiento por estado
  async getStateMetrics() {
    try {
      const { data: campaigns, error } = await supabase
        .from('campania')
        .select('estado, created_at, updated_at, Presupuesto');

      if (error) throw error;

      const metrics = {};
      const stateCounts = {};

      // Inicializar métricas para cada estado
      Object.keys(this.campaignStates).forEach(state => {
        metrics[state] = {
          count: 0,
          avgBudget: 0,
          avgTimeInState: 0,
          totalBudget: 0
        };
        stateCounts[state] = 0;
      });

      // Calcular métricas
      campaigns?.forEach(campaign => {
        const state = campaign.estado || 'borrador';
        if (metrics[state]) {
          metrics[state].count++;
          metrics[state].totalBudget += campaign.Presupuesto || 0;
          stateCounts[state]++;
        }
      });

      // Calcular promedios
      Object.keys(metrics).forEach(state => {
        if (stateCounts[state] > 0) {
          metrics[state].avgBudget = metrics[state].totalBudget / stateCounts[state];
        }
      });

      return metrics;
    } catch (error) {
      console.error('Error obteniendo métricas de estados:', error);
      return {};
    }
  },

  // Predecir próxima transición de estado
  async predictNextTransition(campaignId) {
    try {
      const { data: campaign, error } = await supabase
        .from('campania')
        .select('*')
        .eq('id_campania', campaignId)
        .single();

      if (error) throw error;

      const currentState = campaign.estado || 'borrador';
      const stateConfig = this.campaignStates[currentState];

      if (!stateConfig || !stateConfig.next) {
        return null;
      }

      const nextState = stateConfig.next;
      const requirements = await this.checkStateRequirements(campaignId, nextState);

      return {
        nextState,
        canTransition: requirements.valid,
        missingRequirements: requirements.missing,
        estimatedDays: this.campaignStates[nextState]?.estimatedDays || null,
        autoTransition: this.campaignStates[nextState]?.autoTransition || false
      };
    } catch (error) {
      console.error('Error prediciendo próxima transición:', error);
      return null;
    }
  }
};