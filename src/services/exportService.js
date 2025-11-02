/**
 * Servicio de Exportación Avanzada para CRM
 * Proporciona funcionalidades avanzadas de exportación de datos
 */

import { supabase } from '../config/supabase';

class ExportService {
  constructor() {
    this.exportFormats = ['csv', 'xlsx', 'json', 'pdf'];
    this.exportTypes = {
      clients: 'clientes',
      orders: 'ordenes',
      campaigns: 'campanas',
      products: 'productos',
      reports: 'reportes',
      analytics: 'analytics'
    };
    
    this.exportQueue = [];
    this.isProcessing = false;
    this.maxRetries = 3;
  }

  /**
   * Exportar datos a diferentes formatos
   */
  async exportData(exportConfig) {
    try {
      const {
        type,
        format,
        filters = {},
        columns = [],
        dateRange = null,
        customFields = []
      } = exportConfig;

      // Validar configuración
      this.validateExportConfig(exportConfig);

      // Obtener datos
      const data = await this.fetchExportData(type, filters, dateRange);

      // Procesar datos
      const processedData = this.processExportData(data, columns, customFields);

      // Generar archivo según formato
      const fileBlob = await this.generateExportFile(processedData, format, type);

      // Crear registro de exportación
      const exportRecord = await this.createExportRecord(exportConfig, processedData.length);

      // Descargar archivo
      this.downloadFile(fileBlob, this.generateFileName(type, format));

      return {
        success: true,
        exportId: exportRecord.id,
        recordCount: processedData.length,
        fileName: this.generateFileName(type, format)
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  /**
   * Validar configuración de exportación
   */
  validateExportConfig(config) {
    if (!this.exportTypes[config.type]) {
      throw new Error(`Tipo de exportación no válido: ${config.type}`);
    }

    if (!this.exportFormats.includes(config.format)) {
      throw new Error(`Formato de exportación no válido: ${config.format}`);
    }

    if (config.format === 'xlsx' && config.columns.length > 16384) {
      throw new Error('Excel no soporta más de 16,384 columnas');
    }
  }

  /**
   * Obtener datos para exportación
   */
  async fetchExportData(type, filters, dateRange) {
    try {
      let query;
      const tableName = this.exportTypes[type];

      switch (type) {
        case 'clients':
          query = supabase
            .from(tableName)
            .select(`
              *,
              ordenes (id_orden, total, created_at),
              campanas (id_campania, nombrecampania, created_at)
            `);
          break;

        case 'orders':
          query = supabase
            .from(tableName)
            .select(`
              *,
              clientes (nombrecliente, razonsocial, rut),
              campanas (nombrecampania)
            `);
          break;

        case 'campaigns':
          query = supabase
            .from(tableName)
            .select(`
              *,
              clientes (nombrecliente, razonsocial),
              productos (nombredelproducto)
            `);
          break;

        default:
          query = supabase
            .from(tableName)
            .select('*');
      }

      // Aplicar filtros
      if (filters.status) {
        query = query.eq('estado', filters.status);
      }

      if (filters.clientId) {
        query = query.eq('id_cliente', filters.clientId);
      }

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }

      // Aplicar límite para grandes datasets
      if (filters.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(10000); // Límite por defecto
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching export data:', error);
      throw error;
    }
  }

  /**
   * Procesar datos para exportación
   */
  processExportData(data, columns, customFields) {
    if (!data || data.length === 0) {
      return [];
    }

    // Si no se especifican columnas, usar todas las disponibles
    if (columns.length === 0) {
      columns = this.extractAvailableColumns(data[0]);
    }

    return data.map(item => {
      const processedItem = {};

      // Procesar columnas seleccionadas
      columns.forEach(column => {
        const value = this.getNestedValue(item, column);
        processedItem[this.formatColumnName(column)] = this.formatValue(value);
      });

      // Agregar campos personalizados
      customFields.forEach(field => {
        processedItem[field.name] = this.calculateCustomField(item, field);
      });

      return processedItem;
    });
  }

  /**
   * Extraer columnas disponibles de un objeto
   */
  extractAvailableColumns(obj) {
    const columns = [];

    const extractColumns = (currentObj, prefix = '') => {
      Object.keys(currentObj).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof currentObj[key] === 'object' && currentObj[key] !== null && !Array.isArray(currentObj[key])) {
          extractColumns(currentObj[key], fullKey);
        } else {
          columns.push(fullKey);
        }
      });
    };

    extractColumns(obj);
    return columns;
  }

  /**
   * Obtener valor anidado de un objeto
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  /**
   * Formatear nombre de columna
   */
  formatColumnName(column) {
    return column
      .split('.')
      .map(part => part.replace(/([A-Z])/g, ' $1').trim())
      .join(' - ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Formatear valor para exportación
   */
  formatValue(value) {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }

    if (value instanceof Date) {
      return value.toLocaleDateString('es-ES');
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return value;
  }

  /**
   * Calcular campo personalizado
   */
  calculateCustomField(item, field) {
    switch (field.type) {
      case 'formula':
        return this.evaluateFormula(item, field.formula);
      case 'concatenation':
        return this.concatenateFields(item, field.fields);
      case 'calculation':
        return this.performCalculation(item, field.calculation);
      case 'conditional':
        return this.evaluateCondition(item, field.condition);
      default:
        return '';
    }
  }

  /**
   * Evaluar fórmula
   */
  evaluateFormula(item, formula) {
    try {
      // Implementación simple de evaluación de fórmulas
      // En un sistema real, usarías una librería como mathjs
      const safeFormula = formula.replace(/\{(\w+(?:\.\w+)*)\}/g, (match, path) => {
        const value = this.getNestedValue(item, path);
        return typeof value === 'number' ? value : 0;
      });
      
      // Evaluación segura (simplificada)
      return eval(safeFormula);
    } catch (error) {
      console.error('Error evaluating formula:', error);
      return 0;
    }
  }

  /**
   * Concatenar campos
   */
  concatenateFields(item, fields) {
    return fields.map(field => this.getNestedValue(item, field) || '').join(' ');
  }

  /**
   * Realizar cálculo
   */
  performCalculation(item, calculation) {
    const { operation, fields } = calculation;
    const values = fields.map(field => parseFloat(this.getNestedValue(item, field)) || 0);

    switch (operation) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'avg':
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      case 'max':
        return Math.max(...values);
      case 'min':
        return Math.min(...values);
      case 'count':
        return values.length;
      default:
        return 0;
    }
  }

  /**
   * Evaluar condición
   */
  evaluateCondition(item, condition) {
    const { field, operator, value, trueValue, falseValue } = condition;
    const fieldValue = this.getNestedValue(item, field);

    let result = false;
    switch (operator) {
      case 'equals':
        result = fieldValue === value;
        break;
      case 'not_equals':
        result = fieldValue !== value;
        break;
      case 'greater_than':
        result = parseFloat(fieldValue) > parseFloat(value);
        break;
      case 'less_than':
        result = parseFloat(fieldValue) < parseFloat(value);
        break;
      case 'contains':
        result = String(fieldValue).includes(String(value));
        break;
      default:
        result = false;
    }

    return result ? trueValue : falseValue;
  }

  /**
   * Generar archivo de exportación
   */
  async generateExportFile(data, format, type) {
    switch (format) {
      case 'csv':
        return this.generateCSV(data);
      case 'xlsx':
        return this.generateXLSX(data);
      case 'json':
        return this.generateJSON(data);
      case 'pdf':
        return this.generatePDF(data, type);
      default:
        throw new Error(`Formato no soportado: ${format}`);
    }
  }

  /**
   * Generar CSV
   */
  generateCSV(data) {
    if (data.length === 0) {
      return new Blob([''], { type: 'text/csv' });
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * Generar XLSX (simplificado)
   */
  generateXLSX(data) {
    // En un sistema real, usarías una librería como xlsx
    const csvContent = this.generateCSV(data);
    return new Blob([csvContent], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }

  /**
   * Generar JSON
   */
  generateJSON(data) {
    const jsonContent = JSON.stringify(data, null, 2);
    return new Blob([jsonContent], { type: 'application/json' });
  }

  /**
   * Generar PDF (simplificado)
   */
  generatePDF(data, type) {
    // En un sistema real, usarías una librería como jsPDF
    const htmlContent = this.generateHTMLTable(data, type);
    return new Blob([htmlContent], { type: 'text/html' });
  }

  /**
   * Generar tabla HTML para PDF
   */
  generateHTMLTable(data, type) {
    if (data.length === 0) {
      return '<html><body><p>No hay datos para exportar</p></body></html>';
    }

    const headers = Object.keys(data[0]);
    const tableRows = data.map(row => 
      `<tr>${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}</tr>`
    ).join('');

    return `
      <html>
        <head>
          <title>Exportación - ${type}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Exportación - ${type}</h1>
          <p>Fecha: ${new Date().toLocaleDateString('es-ES')}</p>
          <p>Total de registros: ${data.length}</p>
          <table>
            <thead>
              <tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;
  }

  /**
   * Descargar archivo
   */
  downloadFile(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generar nombre de archivo
   */
  generateFileName(type, format) {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    return `export_${type}_${timestamp}.${format}`;
  }

  /**
   * Crear registro de exportación
   */
  async createExportRecord(config, recordCount) {
    try {
      const record = {
        id: crypto.randomUUID(),
        type: config.type,
        format: config.format,
        filters: config.filters,
        columns: config.columns,
        record_count: recordCount,
        status: 'completed',
        created_at: new Date().toISOString(),
        created_by: 'current_user'
      };

      const { data, error } = await supabase
        .from('export_records')
        .insert([record])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating export record:', error);
      return null;
    }
  }

  /**
   * Exportación programada
   */
  async scheduleExport(exportConfig, schedule) {
    try {
      const scheduledExport = {
        id: crypto.randomUUID(),
        ...exportConfig,
        schedule,
        active: true,
        created_at: new Date().toISOString(),
        last_run: null,
        next_run: this.calculateNextRun(schedule)
      };

      const { data, error } = await supabase
        .from('scheduled_exports')
        .insert([scheduledExport])
        .select();

      if (error) throw error;
      return { success: true, scheduledExport: data[0] };
    } catch (error) {
      console.error('Error scheduling export:', error);
      throw error;
    }
  }

  /**
   * Calcular próxima ejecución
   */
  calculateNextRun(schedule) {
    const now = new Date();
    const next = new Date(now);

    switch (schedule.frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      default:
        next.setDate(next.getDate() + 1);
    }

    // Establecer hora específica si se proporciona
    if (schedule.time) {
      const [hours, minutes] = schedule.time.split(':');
      next.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    return next.toISOString();
  }

  /**
   * Ejecutar exportaciones programadas
   */
  async runScheduledExports() {
    try {
      const { data: scheduledExports, error } = await supabase
        .from('scheduled_exports')
        .select('*')
        .eq('active', true)
        .lte('next_run', new Date().toISOString());

      if (error) throw error;

      for (const scheduledExport of scheduledExports || []) {
        try {
          await this.exportData(scheduledExport);
          
          // Actualizar registro
          await supabase
            .from('scheduled_exports')
            .update({
              last_run: new Date().toISOString(),
              next_run: this.calculateNextRun(scheduledExport.schedule)
            })
            .eq('id', scheduledExport.id);

          console.log(`Scheduled export ${scheduledExport.id} completed successfully`);
        } catch (error) {
          console.error(`Error running scheduled export ${scheduledExport.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error running scheduled exports:', error);
    }
  }

  /**
   * Obtener historial de exportaciones
   */
  async getExportHistory(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('export_records')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting export history:', error);
      return [];
    }
  }

  /**
   * Obtener exportaciones programadas
   */
  async getScheduledExports() {
    try {
      const { data, error } = await supabase
        .from('scheduled_exports')
        .select('*')
        .eq('active', true)
        .order('next_run', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting scheduled exports:', error);
      return [];
    }
  }

  /**
   * Eliminar exportación programada
   */
  async deleteScheduledExport(exportId) {
    try {
      const { error } = await supabase
        .from('scheduled_exports')
        .delete()
        .eq('id', exportId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting scheduled export:', error);
      throw error;
    }
  }

  /**
   * Obtener plantillas de exportación
   */
  async getExportTemplates() {
    try {
      const { data, error } = await supabase
        .from('export_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting export templates:', error);
      return [];
    }
  }

  /**
   * Crear plantilla de exportación
   */
  async createExportTemplate(template) {
    try {
      const templateData = {
        ...template,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        created_by: 'current_user'
      };

      const { data, error } = await supabase
        .from('export_templates')
        .insert([templateData])
        .select();

      if (error) throw error;
      return { success: true, template: data[0] };
    } catch (error) {
      console.error('Error creating export template:', error);
      throw error;
    }
  }

  /**
   * Obtener formatos disponibles
   */
  getAvailableFormats() {
    return this.exportFormats;
  }

  /**
   * Obtener tipos disponibles
   */
  getAvailableTypes() {
    return Object.keys(this.exportTypes);
  }

  /**
   * Inicializar servicio
   */
  initialize() {
    // Configurar ejecución de exportaciones programadas cada hora
    setInterval(() => {
      this.runScheduledExports();
    }, 60 * 60 * 1000);

    console.log('Export service initialized');
  }
}

export default new ExportService();