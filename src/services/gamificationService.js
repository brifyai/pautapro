/**
 * Servicio de Gamificación para CRM
 * Proporciona sistema de puntos, logros, niveles y recompensas
 */

import { supabase } from '../config/supabase';

class GamificationService {
  constructor() {
    this.points = {
      login: 5,
      completeProfile: 10,
      createOrder: 20,
      updateClient: 15,
      completeTask: 10,
      achieveTarget: 50,
      helpColleague: 25,
      perfectWeek: 100,
      milestone: 75
    };

    this.levels = [
      { level: 1, name: 'Novato', minPoints: 0, color: '#9E9E9E' },
      { level: 2, name: 'Aprendiz', minPoints: 100, color: '#64B5F6' },
      { level: 3, name: 'Profesional', minPoints: 250, color: '#4CAF50' },
      { level: 4, name: 'Experto', minPoints: 500, color: '#FF9800' },
      { level: 5, name: 'Maestro', minPoints: 1000, color: '#F44336' },
      { level: 6, name: 'Leyenda', minPoints: 2500, color: '#9C27B0' },
      { level: 7, name: 'Mítico', minPoints: 5000, color: '#FFD700' }
    ];

    this.achievements = [
      {
        id: 'first_login',
        name: 'Primer Paso',
        description: 'Iniciar sesión por primera vez',
        icon: 'login',
        points: 5,
        type: 'milestone'
      },
      {
        id: 'first_order',
        name: 'Primera Venta',
        description: 'Crear tu primera orden',
        icon: 'shopping_cart',
        points: 20,
        type: 'milestone'
      },
      {
        id: 'week_warrior',
        name: 'Guerrero de la Semana',
        description: 'Completar todas las tareas diarias por una semana',
        icon: 'military_tech',
        points: 100,
        type: 'challenge'
      },
      {
        id: 'client_master',
        name: 'Maestro de Clientes',
        description: 'Gestionar 50 clientes',
        icon: 'people',
        points: 75,
        type: 'progress'
      },
      {
        id: 'speed_demon',
        name: 'Demonio de Velocidad',
        description: 'Completar 10 tareas en una hora',
        icon: 'speed',
        points: 50,
        type: 'challenge'
      },
      {
        id: 'helping_hand',
        name: 'Manos Amigas',
        description: 'Ayudar a 5 colegas',
        icon: 'volunteer_activism',
        points: 25,
        type: 'social'
      },
      {
        id: 'perfectionist',
        name: 'Perfeccionista',
        description: 'Mantener un 100% de precisión por un mes',
        icon: 'verified',
        points: 150,
        type: 'challenge'
      },
      {
        id: 'early_bird',
        name: 'Madrugador',
        description: 'Iniciar sesión antes de las 7 AM por 5 días consecutivos',
        icon: 'wb_sunny',
        points: 30,
        type: 'habit'
      }
    ];

    this.leaderboardTypes = ['weekly', 'monthly', 'all_time'];
    this.userStats = new Map();
  }

  /**
   * Inicializar servicio de gamificación
   */
  async initialize(userId) {
    try {
      await this.loadUserStats(userId);
      await this.checkDailyStreak(userId);
      await this.checkAchievements(userId);
    } catch (error) {
      console.error('Error initializing gamification:', error);
    }
  }

  /**
   * Cargar estadísticas del usuario
   */
  async loadUserStats(userId) {
    try {
      const { data, error } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        this.userStats.set(userId, data);
      } else {
        // Crear estadísticas iniciales
        await this.createUserStats(userId);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }

  /**
   * Crear estadísticas iniciales del usuario
   */
  async createUserStats(userId) {
    try {
      const initialStats = {
        user_id: userId,
        total_points: 0,
        current_level: 1,
        current_streak: 0,
        longest_streak: 0,
        achievements_unlocked: [],
        badges_earned: [],
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_gamification')
        .insert([initialStats])
        .select();

      if (error) throw error;

      this.userStats.set(userId, data[0]);
    } catch (error) {
      console.error('Error creating user stats:', error);
    }
  }

  /**
   * Otorgar puntos al usuario
   */
  async awardPoints(userId, action, metadata = {}) {
    try {
      const points = this.points[action] || 0;
      if (points === 0) return;

      const currentStats = this.userStats.get(userId);
      if (!currentStats) return;

      const newTotalPoints = currentStats.total_points + points;
      const newLevel = this.calculateLevel(newTotalPoints);

      // Actualizar estadísticas
      const updatedStats = {
        ...currentStats,
        total_points: newTotalPoints,
        current_level: newLevel.level,
        updated_at: new Date().toISOString()
      };

      // Guardar en base de datos
      const { error } = await supabase
        .from('user_gamification')
        .update(updatedStats)
        .eq('user_id', userId);

      if (error) throw error;

      // Registrar transacción de puntos
      await this.recordPointsTransaction(userId, action, points, metadata);

      // Actualizar caché
      this.userStats.set(userId, updatedStats);

      // Verificar si subió de nivel
      if (newLevel.level > currentStats.current_level) {
        await this.handleLevelUp(userId, newLevel);
      }

      // Emitir evento
      window.dispatchEvent(new CustomEvent('pointsAwarded', {
        detail: { userId, points, action, newTotal: newTotalPoints }
      }));

      return {
        success: true,
        points,
        newTotal: newTotalPoints,
        level: newLevel.level,
        levelUp: newLevel.level > currentStats.current_level
      };
    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  }

  /**
   * Calcular nivel basado en puntos
   */
  calculateLevel(points) {
    for (let i = this.levels.length - 1; i >= 0; i--) {
      if (points >= this.levels[i].minPoints) {
        return this.levels[i];
      }
    }
    return this.levels[0];
  }

  /**
   * Manejar subida de nivel
   */
  async handleLevelUp(userId, newLevel) {
    try {
      // Crear notificación de nivel
      const notification = {
        title: '¡Nuevo Nivel Desbloqueado!',
        message: `Has alcanzado el nivel ${newLevel.level}: ${newLevel.name}`,
        type: 'achievement',
        priority: 'high',
        user_id: userId,
        metadata: {
          level: newLevel.level,
          levelName: newLevel.name,
          color: newLevel.color
        }
      };

      // Aquí integrarías con el servicio de notificaciones
      console.log('Level up notification:', notification);

      // Otorgar puntos bonificación por subir de nivel
      await this.awardPoints(userId, 'milestone', { level: newLevel.level });

      // Emitir evento especial
      window.dispatchEvent(new CustomEvent('levelUp', {
        detail: { userId, level: newLevel }
      }));
    } catch (error) {
      console.error('Error handling level up:', error);
    }
  }

  /**
   * Registrar transacción de puntos
   */
  async recordPointsTransaction(userId, action, points, metadata) {
    try {
      const transaction = {
        user_id: userId,
        action,
        points,
        metadata,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('points_transactions')
        .insert([transaction]);

      if (error) throw error;
    } catch (error) {
      console.error('Error recording points transaction:', error);
    }
  }

  /**
   * Desbloquear logro
   */
  async unlockAchievement(userId, achievementId) {
    try {
      const achievement = this.achievements.find(a => a.id === achievementId);
      if (!achievement) return;

      const currentStats = this.userStats.get(userId);
      if (!currentStats) return;

      // Verificar si ya está desbloqueado
      if (currentStats.achievements_unlocked.includes(achievementId)) {
        return { success: false, message: 'Logro ya desbloqueado' };
      }

      // Actualizar estadísticas
      const updatedStats = {
        ...currentStats,
        achievements_unlocked: [...currentStats.achievements_unlocked, achievementId],
        updated_at: new Date().toISOString()
      };

      // Guardar en base de datos
      const { error } = await supabase
        .from('user_gamification')
        .update(updatedStats)
        .eq('user_id', userId);

      if (error) throw error;

      // Otorgar puntos del logro
      await this.awardPoints(userId, 'achievement', { achievementId });

      // Actualizar caché
      this.userStats.set(userId, updatedStats);

      // Emitir evento
      window.dispatchEvent(new CustomEvent('achievementUnlocked', {
        detail: { userId, achievement }
      }));

      return { success: true, achievement };
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  /**
   * Verificar logros
   */
  async checkAchievements(userId) {
    try {
      const currentStats = this.userStats.get(userId);
      if (!currentStats) return;

      for (const achievement of this.achievements) {
        if (!currentStats.achievements_unlocked.includes(achievement.id)) {
          const unlocked = await this.evaluateAchievement(userId, achievement);
          if (unlocked) {
            await this.unlockAchievement(userId, achievement.id);
          }
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }

  /**
   * Evaluar si se cumple un logro
   */
  async evaluateAchievement(userId, achievement) {
    try {
      switch (achievement.id) {
        case 'first_login':
          return true; // Ya se inició sesión

        case 'first_order':
          const { data: orders } = await supabase
            .from('ordenes')
            .select('id')
            .eq('created_by', userId)
            .limit(1);
          return orders && orders.length > 0;

        case 'client_master':
          const { data: clients } = await supabase
            .from('clientes')
            .select('id')
            .eq('created_by', userId);
          return clients && clients.length >= 50;

        case 'week_warrior':
          // Verificar tareas diarias completadas
          return await this.checkWeeklyTasks(userId);

        case 'speed_demon':
          // Verificar tareas completadas en una hora
          return await this.checkHourlyTasks(userId);

        case 'helping_hand':
          // Verificar ayudas a colegas
          return await this.checkHelpingActions(userId);

        case 'perfectionist':
          // Verificar precisión del 100%
          return await this.checkPerfection(userId);

        case 'early_bird':
          // Verificar inicios de sesión tempranos
          return await this.checkEarlyLogins(userId);

        default:
          return false;
      }
    } catch (error) {
      console.error('Error evaluating achievement:', error);
      return false;
    }
  }

  /**
   * Verificar tareas semanales
   */
  async checkWeeklyTasks(userId) {
    // Implementación simplificada
    return Math.random() > 0.8; // 20% de probabilidad
  }

  /**
   * Verificar tareas por hora
   */
  async checkHourlyTasks(userId) {
    // Implementación simplificada
    return Math.random() > 0.9; // 10% de probabilidad
  }

  /**
   * Verificar ayudas a colegas
   */
  async checkHelpingActions(userId) {
    // Implementación simplificada
    return Math.random() > 0.7; // 30% de probabilidad
  }

  /**
   * Verificar perfección
   */
  async checkPerfection(userId) {
    // Implementación simplificada
    return Math.random() > 0.95; // 5% de probabilidad
  }

  /**
   * Verificar inicios tempranos
   */
  async checkEarlyLogins(userId) {
    // Implementación simplificada
    return Math.random() > 0.8; // 20% de probabilidad
  }

  /**
   * Verificar racha diaria
   */
  async checkDailyStreak(userId) {
    try {
      const currentStats = this.userStats.get(userId);
      if (!currentStats) return;

      const lastLogin = new Date(currentStats.last_login);
      const today = new Date();
      const daysDiff = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));

      let newStreak = currentStats.current_streak;

      if (daysDiff === 1) {
        // Continúa la racha
        newStreak++;
      } else if (daysDiff > 1) {
        // Se rompió la racha
        newStreak = 1;
      } else if (daysDiff === 0) {
        // Ya inició sesión hoy
        return;
      }

      // Actualizar racha
      const updatedStats = {
        ...currentStats,
        current_streak: newStreak,
        longest_streak: Math.max(currentStats.longest_streak, newStreak),
        last_login: today.toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_gamification')
        .update(updatedStats)
        .eq('user_id', userId);

      if (error) throw error;

      this.userStats.set(userId, updatedStats);

      // Otorgar puntos por racha
      if (newStreak >= 7) {
        await this.awardPoints(userId, 'perfectWeek', { streak: newStreak });
      }

      // Emitir evento
      window.dispatchEvent(new CustomEvent('streakUpdated', {
        detail: { userId, streak: newStreak }
      }));

    } catch (error) {
      console.error('Error checking daily streak:', error);
    }
  }

  /**
   * Obtener tabla de líderes
   */
  async getLeaderboard(type = 'weekly', limit = 10) {
    try {
      let dateFilter = new Date();
      
      switch (type) {
        case 'weekly':
          dateFilter.setDate(dateFilter.getDate() - 7);
          break;
        case 'monthly':
          dateFilter.setMonth(dateFilter.getMonth() - 1);
          break;
        case 'all_time':
          dateFilter = new Date(0);
          break;
      }

      const { data, error } = await supabase
        .from('user_gamification')
        .select(`
          *,
          users (name, email, avatar)
        `)
        .gte('updated_at', dateFilter.toISOString())
        .order('total_points', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas del usuario
   */
  async getUserStats(userId) {
    try {
      const stats = this.userStats.get(userId);
      if (!stats) {
        await this.loadUserStats(userId);
        return this.userStats.get(userId);
      }
      return stats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  /**
   * Obtener logros desbloqueados
   */
  async getUserAchievements(userId) {
    try {
      const stats = await this.getUserStats(userId);
      if (!stats) return [];

      return stats.achievements_unlocked.map(achievementId => 
        this.achievements.find(a => a.id === achievementId)
      ).filter(Boolean);
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  /**
   * Obtener progreso de logros
   */
  async getAchievementProgress(userId) {
    try {
      const stats = await this.getUserStats(userId);
      if (!stats) return {};

      const progress = {};
      
      for (const achievement of this.achievements) {
        progress[achievement.id] = {
          achievement,
          unlocked: stats.achievements_unlocked.includes(achievement.id),
          progress: await this.calculateAchievementProgress(userId, achievement)
        };
      }

      return progress;
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      return {};
    }
  }

  /**
   * Calcular progreso de logro
   */
  async calculateAchievementProgress(userId, achievement) {
    try {
      switch (achievement.id) {
        case 'client_master':
          const { data: clients } = await supabase
            .from('clientes')
            .select('id')
            .eq('created_by', userId);
          return Math.min(100, ((clients?.length || 0) / 50) * 100);

        case 'helping_hand':
          const helpingActions = await this.checkHelpingActions(userId);
          return helpingActions ? 100 : 0;

        default:
          return 0;
      }
    } catch (error) {
      console.error('Error calculating achievement progress:', error);
      return 0;
    }
  }

  /**
   * Crear desafío personalizado
   */
  async createCustomChallenge(challengeData) {
    try {
      const challenge = {
        ...challengeData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        active: true
      };

      const { data, error } = await supabase
        .from('custom_challenges')
        .insert([challenge])
        .select();

      if (error) throw error;

      return { success: true, challenge: data[0] };
    } catch (error) {
      console.error('Error creating custom challenge:', error);
      throw error;
    }
  }

  /**
   * Obtener desafíos disponibles
   */
  async getAvailableChallenges(userId) {
    try {
      const [standardChallenges, customChallenges] = await Promise.all([
        // Obtener logros no desbloqueados
        this.getAchievementProgress(userId),
        // Obtener desafíos personalizados
        supabase
          .from('custom_challenges')
          .select('*')
          .eq('active', true)
      ]);

      const availableStandard = Object.entries(standardChallenges)
        .filter(([_, data]) => !data.unlocked && data.progress < 100)
        .map(([_, data]) => data.achievement);

      return [...availableStandard, ...(customChallenges.data || [])];
    } catch (error) {
      console.error('Error getting available challenges:', error);
      return [];
    }
  }

  /**
   * Obtener niveles disponibles
   */
  getLevels() {
    return this.levels;
  }

  /**
   * Obtener logros disponibles
   */
  getAchievements() {
    return this.achievements;
  }

  /**
   * Obtener puntos por acción
   */
  getPointsByAction() {
    return this.points;
  }

  /**
   * Obtener resumen de gamificación
   */
  async getGamificationSummary(userId) {
    try {
      const [stats, achievements, leaderboard] = await Promise.all([
        this.getUserStats(userId),
        this.getUserAchievements(userId),
        this.getLeaderboard('weekly', 5)
      ]);

      const userRank = leaderboard.findIndex(u => u.user_id === userId) + 1;

      return {
        stats,
        achievements,
        leaderboardPosition: userRank || null,
        totalUsers: leaderboard.length,
        nextLevel: this.getNextLevel(stats?.total_points || 0),
        progressToNextLevel: this.getProgressToNextLevel(stats?.total_points || 0)
      };
    } catch (error) {
      console.error('Error getting gamification summary:', error);
      return null;
    }
  }

  /**
   * Obtener siguiente nivel
   */
  getNextLevel(currentPoints) {
    const currentLevel = this.calculateLevel(currentPoints);
    const currentIndex = this.levels.findIndex(l => l.level === currentLevel.level);
    return this.levels[currentIndex + 1] || null;
  }

  /**
   * Obtener progreso al siguiente nivel
   */
  getProgressToNextLevel(currentPoints) {
    const currentLevel = this.calculateLevel(currentPoints);
    const nextLevel = this.getNextLevel(currentPoints);
    
    if (!nextLevel) return 100;

    const currentLevelPoints = currentPoints - currentLevel.minPoints;
    const nextLevelPoints = nextLevel.minPoints - currentLevel.minPoints;
    
    return Math.min(100, (currentLevelPoints / nextLevelPoints) * 100);
  }
}

export default new GamificationService();