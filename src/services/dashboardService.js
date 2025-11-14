import { supabase } from '../config/supabase';

export const dashboardService = {
  // Obtener estadísticas principales del dashboard
  async getDashboardStats() {
    try {
      // Obtener cantidad de agencias activas
      const { data: agencias, error: agenciasError } = await supabase
        .from('agencias')
        .select('id')
        .eq('estado', true);

      if (agenciasError) throw agenciasError;

      // Obtener cantidad de clientes
      const { data: clientes, error: clientesError } = await supabase
        .from('clientes')
        .select('id_cliente');

      if (clientesError) throw clientesError;

      // Obtener cantidad de campañas activas
      const { data: campanas, error: campanasError } = await supabase
        .from('campania')
        .select('id_campania')
        .eq('estado', true);

      if (campanasError) throw campanasError;

      // Obtener cantidad de medios
      const { data: medios, error: mediosError } = await supabase
        .from('medios')
        .select('id_medio');

      if (mediosError) throw mediosError;

      return {
        agencias: agencias?.length || 0,
        clientes: clientes?.length || 0,
        campanas: campanas?.length || 0,
        medios: medios?.length || 0
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del dashboard:', error);
      return {
        agencias: 0,
        clientes: 0,
        campanas: 0,
        medios: 0
      };
    }
  },

  // Obtener datos para el gráfico de distribución de clientes
  async getClientDistribution() {
    try {
      const { data: clientes, error } = await supabase
        .from('clientes')
        .select('razonsocial, total_invertido')
        .order('total_invertido', { ascending: false })
        .limit(10);

      if (error) {
        console.warn('Tabla clientes no encontrada, usando datos de ejemplo:', error);
        return {
          labels: ['Cliente A', 'Cliente B', 'Cliente C', 'Cliente D', 'Cliente E'],
          datasets: [{
            data: [30, 25, 20, 15, 10],
            backgroundColor: [
              '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
              '#3b82f6'
            ],
            borderWidth: 0,
          }]
        };
      }

      // Calcular porcentajes basados en inversión total
      const totalInvertido = clientes?.reduce((sum, cliente) =>
        sum + (cliente.total_invertido || 0), 0) || 1;

      const labels = clientes?.map(cliente => cliente.razonsocial) || [];
      const data = clientes?.map(cliente => {
        const porcentaje = ((cliente.total_invertido || 0) / totalInvertido) * 100;
        return Math.round(porcentaje * 100) / 100; // Redondear a 2 decimales
      }) || [];

      return {
        labels,
        datasets: [{
          data,
          backgroundColor: [
            '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
            '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af',
            '#1e3a8a', '#3b82f6'
          ],
          borderWidth: 0,
        }]
      };
    } catch (error) {
      console.error('Error obteniendo distribución de clientes:', error);
      return {
        labels: ['Sin datos'],
        datasets: [{
          data: [100],
          backgroundColor: ['#cbd5e1'],
          borderWidth: 0,
        }]
      };
    }
  },

  // Obtener lista de clientes recientes
  async getRecentClients() {
    try {
      const { data: clientes, error } = await supabase
        .from('clientes')
        .select('razonsocial, direccion, telfijo, created_at')
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) {
        console.warn('Tabla clientes no encontrada, usando datos de ejemplo:', error);
        return [
          { name: 'Cliente Ejemplo A', address: 'Dirección Ejemplo 123', phone: '+56 9 1234 5678', created_at: new Date().toISOString() },
          { name: 'Cliente Ejemplo B', address: 'Dirección Ejemplo 456', phone: '+56 9 8765 4321', created_at: new Date(Date.now() - 86400000).toISOString() },
          { name: 'Cliente Ejemplo C', address: 'Dirección Ejemplo 789', phone: '+56 9 2468 1357', created_at: new Date(Date.now() - 172800000).toISOString() }
        ];
      }

      return clientes?.map(cliente => ({
        name: cliente.razonsocial || 'Sin nombre',
        address: cliente.direccion || 'Dirección no especificada',
        phone: cliente.telfijo || 'Teléfono no especificado',
        created_at: cliente.created_at || new Date().toISOString()
      })) || [];
    } catch (error) {
      console.error('Error obteniendo clientes recientes:', error);
      return [];
    }
  },

  // Obtener mensajes recientes
  async getRecentMessages() {
    try {
      const { data: mensajes, error } = await supabase
        .from('mensajes')
        .select('asunto, contenido, created_at')
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) {
        console.warn('Tabla mensajes no encontrada, usando datos de ejemplo:', error);
        return [
          { title: 'Bienvenido al sistema', date: new Date().toLocaleDateString() },
          { title: 'Nueva campaña creada', date: new Date(Date.now() - 86400000).toLocaleDateString() },
          { title: 'Reporte generado', date: new Date(Date.now() - 172800000).toLocaleDateString() }
        ];
      }

      return mensajes?.map(mensaje => ({
        title: mensaje.asunto || 'Mensaje sin título',
        date: new Date(mensaje.created_at).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      })) || [];
    } catch (error) {
      console.error('Error obteniendo mensajes recientes:', error);
      return [];
    }
  },

  // Obtener datos mensuales de campañas para el gráfico de barras
  async getMonthlyCampaignData() {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data, error } = await supabase
        .from('campania')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Agrupar por mes
      const monthlyData = {};
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

      // Inicializar los últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        monthlyData[monthKey] = 0;
      }

      // Contar campañas por mes
      data?.forEach(campaign => {
        const date = new Date(campaign.created_at);
        const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        if (monthlyData.hasOwnProperty(monthKey)) {
          monthlyData[monthKey]++;
        }
      });

      return {
        labels: Object.keys(monthlyData),
        datasets: [{
          label: 'Campañas',
          data: Object.values(monthlyData),
          backgroundColor: '#3b82f6',
          borderWidth: 0,
          borderRadius: 4
        }]
      };
    } catch (error) {
      console.error('Error obteniendo datos mensuales de campañas:', error);
      return {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
          label: 'Campañas',
          data: [0, 0, 0, 0, 0, 0],
          backgroundColor: '#3b82f6',
          borderWidth: 0,
        }]
      };
    }
  },

  // Obtener presupuesto total de todas las campañas
  async getTotalBudget() {
    try {
      const { data, error } = await supabase
        .from('campania')
        .select('presupuesto')
        .not('presupuesto', 'is', null);

      if (error) throw error;

      const totalBudget = data?.reduce((sum, campaign) => sum + (campaign.presupuesto || 0), 0) || 0;
      return totalBudget;
    } catch (error) {
      console.error('Error obteniendo presupuesto total:', error);
      return 0;
    }
  },

  // Obtener crecimiento mensual
  async getMonthlyGrowth() {
    try {
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const lastMonth = new Date(thisMonth);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const [thisMonthData, lastMonthData] = await Promise.all([
        supabase
          .from('campania')
          .select('id_campania')
          .gte('created_at', thisMonth.toISOString()),
        supabase
          .from('campania')
          .select('id_campania')
          .gte('created_at', lastMonth.toISOString())
          .lt('created_at', thisMonth.toISOString())
      ]);

      const thisMonthCount = thisMonthData.data?.length || 0;
      const lastMonthCount = lastMonthData.data?.length || 0;

      if (lastMonthCount === 0) return thisMonthCount > 0 ? 100 : 0;

      const growth = ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
      return Math.round(growth * 10) / 10;
    } catch (error) {
      console.error('Error calculando crecimiento mensual:', error);
      return 0;
    }
  },

  // Obtener duración promedio de campañas
  async getAvgCampaignDuration() {
    try {
      const { data, error } = await supabase
        .from('campania')
        .select('fecha_inicio, fecha_fin')
        .not('fecha_inicio', 'is', null)
        .not('fecha_fin', 'is', null);

      if (error) {
        console.warn('Tabla campania no encontrada, usando dato de ejemplo:', error);
        return 30; // 30 días promedio
      }

      if (!data || data.length === 0) return 0;

      const totalDuration = data.reduce((sum, campaign) => {
        const start = new Date(campaign.fecha_inicio);
        const end = new Date(campaign.fecha_fin);
        const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return sum + duration;
      }, 0);

      return Math.round(totalDuration / data.length);
    } catch (error) {
      console.error('Error obteniendo duración promedio:', error);
      return 0;
    }
  },

  // Obtener el medio con mejor rendimiento
  async getTopPerformingMedium() {
    try {
      const { data, error } = await supabase
        .from('campania')
        .select(`
          presupuesto,
          productos (
            id,
            nombredelproducto
          )
        `)
        .not('presupuesto', 'is', null)
        .eq('estado', true);

      if (error) {
        console.warn('Error consultando medio con mejor rendimiento, usando dato de ejemplo:', error);
        return 'Televisión';
      }

      if (!data || data.length === 0) return 'N/A';

      // Agrupar por medio y calcular presupuesto total
      const mediumPerformance = {};
      data.forEach(campaign => {
        const mediumName = campaign.productos?.nombredelproducto || 'Sin medio';
        if (!mediumPerformance[mediumName]) {
          mediumPerformance[mediumName] = 0;
        }
        mediumPerformance[mediumName] += campaign.presupuesto || 0;
      });

      // Encontrar el medio con mayor presupuesto
      const topMedium = Object.entries(mediumPerformance)
        .sort(([,a], [,b]) => b - a)[0];

      return topMedium ? topMedium[0] : 'N/A';
    } catch (error) {
      console.error('Error obteniendo medio con mejor rendimiento:', error);
      return 'N/A';
    }
  }
};