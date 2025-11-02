import { supabase } from '../config/supabase';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const reportService = {
  // Configuración de reportes programados
  scheduledReports: {
    'daily_orders': {
      name: 'Órdenes Diarias',
      frequency: 'daily',
      time: '08:00',
      recipients: ['gerente@empresa.com'],
      template: 'daily_orders_template'
    },
    'weekly_performance': {
      name: 'Rendimiento Semanal',
      frequency: 'weekly',
      day: 'monday',
      time: '09:00',
      recipients: ['gerente@empresa.com', 'director@empresa.com'],
      template: 'weekly_performance_template'
    },
    'monthly_revenue': {
      name: 'Ingresos Mensuales',
      frequency: 'monthly',
      day: 1,
      time: '10:00',
      recipients: ['gerente@empresa.com', 'finanzas@empresa.com'],
      template: 'monthly_revenue_template'
    },
    'campaign_status': {
      name: 'Estado de Campañas',
      frequency: 'daily',
      time: '07:00',
      recipients: ['gerente@empresa.com'],
      template: 'campaign_status_template'
    }
  },

  // Generar reporte de órdenes diarias
  async generateDailyOrdersReport(date = new Date()) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: orders, error } = await supabase
        .from('ordenesdepublicidad')
        .select(`
          *,
          campania (
            nombrecampania,
            clientes (nombrecliente)
          )
        `)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reportData = {
        date: date.toISOString().split('T')[0],
        totalOrders: orders?.length || 0,
        ordersByStatus: this.groupByStatus(orders || []),
        orders: orders || [],
        summary: {
          totalValue: this.calculateTotalValue(orders || []),
          avgOrderValue: this.calculateAverageOrderValue(orders || [])
        }
      };

      return reportData;
    } catch (error) {
      console.error('Error generando reporte de órdenes diarias:', error);
      throw error;
    }
  },

  // Generar reporte de rendimiento semanal
  async generateWeeklyPerformanceReport(weekStart = new Date()) {
    try {
      // Ajustar al inicio de semana (lunes)
      const startDate = new Date(weekStart);
      startDate.setDate(startDate.getDate() - startDate.getDay() + 1);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      // Obtener datos de la semana
      const [ordersData, campaignsData, clientsData] = await Promise.all([
        this.getOrdersInRange(startDate, endDate),
        this.getCampaignsInRange(startDate, endDate),
        this.getClientStatsInRange(startDate, endDate)
      ]);

      const reportData = {
        weekStart: startDate.toISOString().split('T')[0],
        weekEnd: endDate.toISOString().split('T')[0],
        orders: ordersData,
        campaigns: campaignsData,
        clients: clientsData,
        performance: {
          totalRevenue: this.calculateTotalValue(ordersData),
          orderGrowth: await this.calculateOrderGrowth(),
          campaignSuccessRate: this.calculateCampaignSuccessRate(campaignsData),
          clientRetentionRate: await this.calculateClientRetentionRate()
        }
      };

      return reportData;
    } catch (error) {
      console.error('Error generando reporte de rendimiento semanal:', error);
      throw error;
    }
  },

  // Generar reporte de ingresos mensuales
  async generateMonthlyRevenueReport(month = new Date().getMonth() + 1, year = new Date().getFullYear()) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      const { data: orders, error } = await supabase
        .from('ordenesdepublicidad')
        .select(`
          *,
          campania (
            nombrecampania,
            Anios (years),
            clientes (nombrecliente)
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      // Agrupar por semana
      const weeklyData = this.groupByWeek(orders || []);

      const reportData = {
        month,
        year,
        totalRevenue: this.calculateTotalValue(orders || []),
        totalOrders: orders?.length || 0,
        weeklyBreakdown: weeklyData,
        topClients: await this.getTopClientsByRevenue(startDate, endDate),
        topCampaigns: await this.getTopCampaignsByRevenue(startDate, endDate),
        revenueByMedium: await this.getRevenueByMedium(startDate, endDate)
      };

      return reportData;
    } catch (error) {
      console.error('Error generando reporte de ingresos mensuales:', error);
      throw error;
    }
  },

  // Generar reporte de estado de campañas
  async generateCampaignStatusReport() {
    try {
      const { data: campaigns, error } = await supabase
        .from('campania')
        .select(`
          *,
          clientes (nombrecliente),
          Anios (years),
          Productos (nombredelproducto)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reportData = {
        date: new Date().toISOString().split('T')[0],
        totalCampaigns: campaigns?.length || 0,
        campaignsByStatus: this.groupCampaignsByStatus(campaigns || []),
        overdueCampaigns: this.getOverdueCampaigns(campaigns || []),
        upcomingDeadlines: this.getUpcomingDeadlines(campaigns || []),
        summary: {
          activeCampaigns: campaigns?.filter(c => c.estado === 'live').length || 0,
          completedThisMonth: await this.getCompletedThisMonth(),
          budgetUtilization: await this.calculateBudgetUtilization()
        }
      };

      return reportData;
    } catch (error) {
      console.error('Error generando reporte de estado de campañas:', error);
      throw error;
    }
  },

  // Exportar reporte a Excel
  exportToExcel(reportData, reportType) {
    try {
      const workbook = XLSX.utils.book_new();

      // Crear diferentes hojas según el tipo de reporte
      switch (reportType) {
        case 'daily_orders':
          this.createDailyOrdersSheet(workbook, reportData);
          break;
        case 'weekly_performance':
          this.createWeeklyPerformanceSheet(workbook, reportData);
          break;
        case 'monthly_revenue':
          this.createMonthlyRevenueSheet(workbook, reportData);
          break;
        case 'campaign_status':
          this.createCampaignStatusSheet(workbook, reportData);
          break;
      }

      const fileName = `${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      return fileName;
    } catch (error) {
      console.error('Error exportando a Excel:', error);
      throw error;
    }
  },

  // Exportar reporte a PDF
  exportToPDF(reportData, reportType) {
    try {
      const doc = new jsPDF();

      // Configurar el documento
      doc.setFontSize(20);
      doc.text(`${this.getReportTitle(reportType)} - ${new Date().toLocaleDateString()}`, 20, 20);

      // Agregar contenido según el tipo de reporte
      switch (reportType) {
        case 'daily_orders':
          this.createDailyOrdersPDF(doc, reportData);
          break;
        case 'weekly_performance':
          this.createWeeklyPerformancePDF(doc, reportData);
          break;
        case 'monthly_revenue':
          this.createMonthlyRevenuePDF(doc, reportData);
          break;
        case 'campaign_status':
          this.createCampaignStatusPDF(doc, reportData);
          break;
      }

      const fileName = `${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      return fileName;
    } catch (error) {
      console.error('Error exportando a PDF:', error);
      throw error;
    }
  },

  // Programar envío automático de reportes
  async scheduleReport(reportType, config) {
    try {
      const { data, error } = await supabase
        .from('scheduled_reports')
        .insert({
          report_type: reportType,
          frequency: config.frequency,
          schedule_time: config.time,
          recipients: config.recipients,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error programando reporte:', error);
      throw error;
    }
  },

  // Obtener reportes programados activos
  async getScheduledReports() {
    try {
      const { data, error } = await supabase
        .from('scheduled_reports')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo reportes programados:', error);
      return [];
    }
  },

  // Ejecutar reportes programados (función para ser llamada por un cron job)
  async executeScheduledReports() {
    try {
      const scheduledReports = await this.getScheduledReports();

      for (const report of scheduledReports) {
        if (this.shouldExecuteReport(report)) {
          await this.generateAndSendReport(report);
        }
      }
    } catch (error) {
      console.error('Error ejecutando reportes programados:', error);
    }
  },

  // Verificar si un reporte debe ejecutarse
  shouldExecuteReport(report) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const currentDate = now.getDate();

    const [reportHour, reportMinute] = report.schedule_time.split(':').map(Number);

    // Verificar hora
    if (currentHour !== reportHour || currentMinute !== reportMinute) {
      return false;
    }

    // Verificar frecuencia
    switch (report.frequency) {
      case 'daily':
        return true;
      case 'weekly':
        return currentDay === this.getDayNumber(report.schedule_day);
      case 'monthly':
        return currentDate === report.schedule_day;
      default:
        return false;
    }
  },

  // Generar y enviar reporte
  async generateAndSendReport(report) {
    try {
      let reportData;

      // Generar el reporte según el tipo
      switch (report.report_type) {
        case 'daily_orders':
          reportData = await this.generateDailyOrdersReport();
          break;
        case 'weekly_performance':
          reportData = await this.generateWeeklyPerformanceReport();
          break;
        case 'monthly_revenue':
          reportData = await this.generateMonthlyRevenueReport();
          break;
        case 'campaign_status':
          reportData = await this.generateCampaignStatusReport();
          break;
      }

      if (reportData) {
        // Exportar a PDF
        const pdfFile = await this.exportToPDF(reportData, report.report_type);

        // Aquí iría la lógica para enviar por email
        // await this.sendReportByEmail(report.recipients, pdfFile, report.report_type);

        console.log(`Reporte ${report.report_type} generado y enviado a:`, report.recipients);
      }
    } catch (error) {
      console.error(`Error generando reporte programado ${report.report_type}:`, error);
    }
  },

  // Funciones auxiliares
  groupByStatus(orders) {
    const statusGroups = {};
    orders.forEach(order => {
      const status = order.estado || 'sin_estado';
      if (!statusGroups[status]) {
        statusGroups[status] = [];
      }
      statusGroups[status].push(order);
    });
    return statusGroups;
  },

  calculateTotalValue(orders) {
    return orders.reduce((total, order) => {
      // Aquí iría la lógica para calcular el valor total de la orden
      // Por ahora retornamos un valor de ejemplo
      return total + (order.total_bruto || 0);
    }, 0);
  },

  calculateAverageOrderValue(orders) {
    if (orders.length === 0) return 0;
    return this.calculateTotalValue(orders) / orders.length;
  },

  // Más funciones auxiliares...
  getOrdersInRange(startDate, endDate) {
    return supabase
      .from('ordenesdepublicidad')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
  },

  getCampaignsInRange(startDate, endDate) {
    return supabase
      .from('campania')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
  },

  getClientStatsInRange(startDate, endDate) {
    // Implementar lógica para estadísticas de clientes
    return Promise.resolve([]);
  },

  calculateOrderGrowth() {
    // Implementar cálculo de crecimiento de órdenes
    return Promise.resolve(0);
  },

  calculateCampaignSuccessRate(campaigns) {
    if (!campaigns || campaigns.length === 0) return 0;
    const successful = campaigns.filter(c => c.estado === 'finalizada').length;
    return (successful / campaigns.length) * 100;
  },

  calculateClientRetentionRate() {
    // Implementar cálculo de retención de clientes
    return Promise.resolve(85);
  },

  groupByWeek(orders) {
    // Implementar agrupación por semana
    return {};
  },

  getTopClientsByRevenue(startDate, endDate) {
    // Implementar top clientes por ingresos
    return Promise.resolve([]);
  },

  getTopCampaignsByRevenue(startDate, endDate) {
    // Implementar top campañas por ingresos
    return Promise.resolve([]);
  },

  getRevenueByMedium(startDate, endDate) {
    // Implementar ingresos por medio
    return Promise.resolve({});
  },

  groupCampaignsByStatus(campaigns) {
    return this.groupByStatus(campaigns);
  },

  getOverdueCampaigns(campaigns) {
    const today = new Date();
    return campaigns.filter(campaign => {
      if (!campaign.fecha_fin) return false;
      const endDate = new Date(campaign.fecha_fin);
      return endDate < today && campaign.estado !== 'finalizada';
    });
  },

  getUpcomingDeadlines(campaigns, days = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return campaigns.filter(campaign => {
      if (!campaign.fecha_fin || campaign.estado === 'finalizada') return false;
      const endDate = new Date(campaign.fecha_fin);
      return endDate <= futureDate && endDate >= new Date();
    });
  },

  getCompletedThisMonth() {
    // Implementar campañas completadas este mes
    return Promise.resolve(0);
  },

  calculateBudgetUtilization() {
    // Implementar cálculo de utilización de presupuesto
    return Promise.resolve(75);
  },

  createDailyOrdersSheet(workbook, data) {
    // Implementar creación de hoja Excel para órdenes diarias
    const worksheet = XLSX.utils.json_to_sheet(data.orders || []);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Órdenes Diarias');
  },

  createWeeklyPerformanceSheet(workbook, data) {
    // Implementar creación de hoja Excel para rendimiento semanal
    const worksheet = XLSX.utils.json_to_sheet([data.performance]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rendimiento Semanal');
  },

  createMonthlyRevenueSheet(workbook, data) {
    // Implementar creación de hoja Excel para ingresos mensuales
    const worksheet = XLSX.utils.json_to_sheet([data]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ingresos Mensuales');
  },

  createCampaignStatusSheet(workbook, data) {
    // Implementar creación de hoja Excel para estado de campañas
    const worksheet = XLSX.utils.json_to_sheet(data.campaignsByStatus || []);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estado de Campañas');
  },

  createDailyOrdersPDF(doc, data) {
    // Implementar creación de PDF para órdenes diarias
    doc.setFontSize(16);
    doc.text(`Total de Órdenes: ${data.totalOrders}`, 20, 40);
    doc.text(`Valor Total: $${data.summary.totalValue.toLocaleString()}`, 20, 50);
  },

  createWeeklyPerformancePDF(doc, data) {
    // Implementar creación de PDF para rendimiento semanal
    doc.setFontSize(16);
    doc.text(`Ingresos Totales: $${data.performance.totalRevenue.toLocaleString()}`, 20, 40);
  },

  createMonthlyRevenuePDF(doc, data) {
    // Implementar creación de PDF para ingresos mensuales
    doc.setFontSize(16);
    doc.text(`Ingresos del Mes: $${data.totalRevenue.toLocaleString()}`, 20, 40);
  },

  createCampaignStatusPDF(doc, data) {
    // Implementar creación de PDF para estado de campañas
    doc.setFontSize(16);
    doc.text(`Total de Campañas: ${data.totalCampaigns}`, 20, 40);
  },

  getReportTitle(reportType) {
    const titles = {
      'daily_orders': 'Reporte de Órdenes Diarias',
      'weekly_performance': 'Reporte de Rendimiento Semanal',
      'monthly_revenue': 'Reporte de Ingresos Mensuales',
      'campaign_status': 'Reporte de Estado de Campañas'
    };
    return titles[reportType] || 'Reporte';
  },

  getDayNumber(dayName) {
    const days = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };
    return days[dayName.toLowerCase()] || 1;
  },

  // Función para generar reportes personalizados (para el Chat IA)
  async generateReport(reportConfig) {
    try {
      const { type, dateRange, filters, format } = reportConfig;
      
      let reportData;
      
      switch (type) {
        case 'ordenes':
          reportData = await this.generateOrdersReport(dateRange, filters);
          break;
        case 'campañas':
          reportData = await this.generateCampaignsReport(dateRange, filters);
          break;
        case 'clientes':
          reportData = await this.generateClientsReport(dateRange, filters);
          break;
        case 'proveedores':
          reportData = await this.generateProvidersReport(dateRange, filters);
          break;
        case 'financiero':
          reportData = await this.generateFinancialReport(dateRange, filters);
          break;
        case 'cruzado':
          reportData = await this.generateCrossReport(dateRange, filters);
          break;
        default:
          throw new Error('Tipo de reporte no válido');
      }

      // Exportar según el formato solicitado
      if (format === 'excel') {
        return this.exportToExcel(reportData, type);
      } else if (format === 'pdf') {
        return this.exportToPDF(reportData, type);
      }

      return reportData;
    } catch (error) {
      console.error('Error generando reporte:', error);
      throw error;
    }
  },

  // Generar reporte de órdenes
  async generateOrdersReport(dateRange, filters = {}) {
    try {
      let query = supabase
        .from('ordenesdepublicidad')
        .select(`
          *,
          campania (
            nombrecampania,
            clientes (nombrecliente)
          ),
          medios (nombremedio),
          soportes (nombresoporte)
        `);

      // Aplicar filtro de rango de fechas
      if (dateRange?.start) {
        query = query.gte('created_at', dateRange.start);
      }
      if (dateRange?.end) {
        query = query.lte('created_at', dateRange.end);
      }

      // Aplicar filtros adicionales
      if (filters.estado) {
        query = query.eq('estado', filters.estado);
      }
      if (filters.id_cliente) {
        query = query.eq('id_cliente', filters.id_cliente);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return {
        type: 'ordenes',
        data: data || [],
        summary: {
          total: data?.length || 0,
          byStatus: this.groupByStatus(data || []),
          totalValue: this.calculateTotalValue(data || []),
          avgValue: this.calculateAverageOrderValue(data || [])
        },
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generando reporte de órdenes:', error);
      throw error;
    }
  },

  // Generar reporte de campañas
  async generateCampaignsReport(dateRange, filters = {}) {
    try {
      let query = supabase
        .from('campania')
        .select(`
          *,
          clientes (nombrecliente),
          Anios (years),
          Productos (nombredelproducto)
        `);

      if (dateRange?.start) {
        query = query.gte('created_at', dateRange.start);
      }
      if (dateRange?.end) {
        query = query.lte('created_at', dateRange.end);
      }

      if (filters.estado) {
        query = query.eq('estado', filters.estado);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return {
        type: 'campañas',
        data: data || [],
        summary: {
          total: data?.length || 0,
          byStatus: this.groupCampaignsByStatus(data || []),
          activeCampaigns: data?.filter(c => c.estado === 'live').length || 0
        },
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generando reporte de campañas:', error);
      throw error;
    }
  },

  // Generar reporte de clientes
  async generateClientsReport(dateRange, filters = {}) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select(`
          *,
          ordenesdepublicidad (
            id_ordenes_de_comprar,
            estado,
            total_bruto
          ),
          campania (
            id_campania,
            nombrecampania,
            estado
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        type: 'clientes',
        data: data || [],
        summary: {
          total: data?.length || 0,
          activeClients: data?.filter(c =>
            c.ordenesdepublicidad?.some(o => o.estado !== 'cerrada') ||
            c.campania?.some(camp => camp.estado === 'live')
          ).length || 0
        },
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generando reporte de clientes:', error);
      throw error;
    }
  },

  // Generar reporte de proveedores
  async generateProvidersReport(dateRange, filters = {}) {
    try {
      const { data, error } = await supabase
        .from('proveedores')
        .select(`
          *,
          medios (
            id_medio,
            nombremedio,
            estado
          ),
          contratos (
            id_contrato,
            estado,
            monto
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        type: 'proveedores',
        data: data || [],
        summary: {
          total: data?.length || 0,
          activeProviders: data?.filter(p => p.estado === 'activo').length || 0
        },
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generando reporte de proveedores:', error);
      throw error;
    }
  },

  // Generar reporte financiero
  async generateFinancialReport(dateRange, filters = {}) {
    try {
      const { data: orders, error } = await supabase
        .from('ordenesdepublicidad')
        .select(`
          *,
          campania (
            nombrecampania,
            clientes (nombrecliente)
          )
        `);

      if (error) throw error;

      const filteredOrders = orders?.filter(order => {
        if (dateRange?.start && new Date(order.created_at) < new Date(dateRange.start)) return false;
        if (dateRange?.end && new Date(order.created_at) > new Date(dateRange.end)) return false;
        return true;
      }) || [];

      return {
        type: 'financiero',
        data: filteredOrders,
        summary: {
          totalRevenue: this.calculateTotalValue(filteredOrders),
          totalOrders: filteredOrders.length,
          avgOrderValue: this.calculateAverageOrderValue(filteredOrders),
          revenueByMonth: this.groupRevenueByMonth(filteredOrders)
        },
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generando reporte financiero:', error);
      throw error;
    }
  },

  // Generar reporte cruzado
  async generateCrossReport(dateRange, filters = {}) {
    try {
      const [orders, campaigns, clients] = await Promise.all([
        this.generateOrdersReport(dateRange, filters),
        this.generateCampaignsReport(dateRange, filters),
        this.generateClientsReport(dateRange, filters)
      ]);

      return {
        type: 'cruzado',
        data: {
          orders: orders.data,
          campaigns: campaigns.data,
          clients: clients.data
        },
        summary: {
          totalOrders: orders.summary.total,
          totalCampaigns: campaigns.summary.total,
          totalClients: clients.summary.total,
          conversionRate: this.calculateConversionRate(orders.data, clients.data)
        },
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generando reporte cruzado:', error);
      throw error;
    }
  },

  // Funciones auxiliares adicionales
  groupRevenueByMonth(orders) {
    const revenueByMonth = {};
    
    orders.forEach(order => {
      if (order.created_at && order.total_bruto) {
        const month = new Date(order.created_at).toISOString().slice(0, 7); // YYYY-MM
        revenueByMonth[month] = (revenueByMonth[month] || 0) + order.total_bruto;
      }
    });

    return revenueByMonth;
  },

  calculateConversionRate(orders, clients) {
    if (!clients || clients.length === 0) return 0;
    
    const clientsWithOrders = new Set(
      orders?.filter(order => order.id_cliente).map(order => order.id_cliente)
    ).size;

    return Math.round((clientsWithOrders / clients.length) * 100);
  }
};