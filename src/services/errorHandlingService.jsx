/**
 * Servicio centralizado para el manejo de errores en la aplicación
 * Proporciona un sistema unificado para registrar, notificar y manejar errores
 */

import React from 'react';

class ErrorHandlingService {
  constructor() {
    this.errorQueue = [];
    this.errorCallbacks = [];
    this.maxQueueSize = 100;
    this.isDevelopment = process.env.NODE_ENV === 'development';
    
    // Configuración inicial
    this.config = {
      enableConsoleLog: true,
      enableErrorQueue: true,
      enableRetry: true,
      maxRetries: 3,
      retryDelay: 1000,
      enableUserNotification: true
    };
  }

  /**
   * Configura el servicio de manejo de errores
   */
  configure(config = {}) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Registra un callback para manejo de errores
   */
  onError(callback) {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Maneja un error de manera centralizada
   */
  handleError(error, context = {}) {
    const errorInfo = this.createErrorInfo(error, context);
    
    // Registrar en consola en desarrollo
    if (this.config.enableConsoleLog) {
      this.logToConsole(errorInfo);
    }

    // Agregar a la cola de errores
    if (this.config.enableErrorQueue) {
      this.addToQueue(errorInfo);
    }

    // Notificar a los callbacks registrados
    this.notifyCallbacks(errorInfo);

    // Enviar a servicio externo si está configurado
    this.sendToExternalService(errorInfo);

    return errorInfo;
  }

  /**
   * Crea un objeto de información de error estandarizado
   */
  createErrorInfo(error, context = {}) {
    const timestamp = new Date().toISOString();
    const errorId = this.generateErrorId();
    
    return {
      id: errorId,
      timestamp,
      message: error?.message || 'Error desconocido',
      stack: error?.stack,
      name: error?.name || 'Error',
      context: {
        component: context.component,
        action: context.action,
        userId: context.userId,
        sessionId: context.sessionId,
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        ...context.additionalData
      },
      severity: context.severity || 'error',
      category: context.category || 'general',
      recoverable: context.recoverable !== false,
      retryCount: context.retryCount || 0,
      userNotified: false
    };
  }

  /**
   * Genera un ID único para el error
   */
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Registra el error en la consola con formato mejorado
   */
  logToConsole(errorInfo) {
    const logMethod = this.getLogMethod(errorInfo.severity);
    
    logMethod.call(console, `🚨 Error [${errorInfo.id}]`, {
      message: errorInfo.message,
      component: errorInfo.context.component,
      action: errorInfo.context.action,
      timestamp: errorInfo.timestamp,
      stack: errorInfo.stack
    });
  }

  /**
   * Obtiene el método de consola apropiado según la severidad
   */
  getLogMethod(severity) {
    switch (severity) {
      case 'critical': return console.error;
      case 'error': return console.error;
      case 'warning': return console.warn;
      case 'info': return console.info;
      default: return console.log;
    }
  }

  /**
   * Agrega el error a la cola interna
   */
  addToQueue(errorInfo) {
    this.errorQueue.push(errorInfo);
    
    // Mantener el tamaño máximo de la cola
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  /**
   * Notifica a todos los callbacks registrados
   */
  notifyCallbacks(errorInfo) {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(errorInfo);
      } catch (callbackError) {
        console.error('Error en callback de manejo de errores:', callbackError);
      }
    });
  }

  /**
   * Envía el error a un servicio externo (si está configurado)
   */
  async sendToExternalService(errorInfo) {
    // Implementar integración con servicios como Sentry, LogRocket, etc.
    if (this.config.externalService) {
      try {
        await this.config.externalService.send(errorInfo);
      } catch (serviceError) {
        console.error('Error al enviar a servicio externo:', serviceError);
      }
    }
  }

  /**
   * Obtiene errores de la cola según filtros
   */
  getErrors(filters = {}) {
    let filteredErrors = [...this.errorQueue];

    if (filters.severity) {
      filteredErrors = filteredErrors.filter(e => e.severity === filters.severity);
    }

    if (filters.category) {
      filteredErrors = filteredErrors.filter(e => e.category === filters.category);
    }

    if (filters.component) {
      filteredErrors = filteredErrors.filter(e => e.context.component === filters.component);
    }

    if (filters.dateFrom) {
      filteredErrors = filteredErrors.filter(e => 
        new Date(e.timestamp) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filteredErrors = filteredErrors.filter(e => 
        new Date(e.timestamp) <= new Date(filters.dateTo)
      );
    }

    return filteredErrors.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }

  /**
   * Limpia la cola de errores
   */
  clearErrors() {
    this.errorQueue = [];
  }

  /**
   * Intenta recuperar de un error automáticamente
   */
  async attemptRecovery(errorInfo, recoveryFunction) {
    if (!errorInfo.recoverable || !recoveryFunction) {
      return false;
    }

    const maxRetries = this.config.maxRetries;
    const retryDelay = this.config.retryDelay;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Intento de recuperación ${attempt}/${maxRetries} para error ${errorInfo.id}`);
        
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        
        const result = await recoveryFunction(errorInfo);
        
        // Marcar error como recuperado
        errorInfo.recovered = true;
        errorInfo.recoveryAttempts = attempt;
        
        return result;
      } catch (recoveryError) {
        console.error(`Error en intento de recuperación ${attempt}:`, recoveryError);
        
        if (attempt === maxRetries) {
          errorInfo.recoveryFailed = true;
          errorInfo.recoveryAttempts = maxRetries;
          return false;
        }
      }
    }
  }

  /**
   * Crea un mensaje amigable para el usuario
   */
  createUserMessage(errorInfo) {
    const messages = {
      'network': 'Error de conexión. Verifique su internet e intente nuevamente.',
      'timeout': 'La operación tardó demasiado tiempo. Intente nuevamente.',
      'permission': 'No tiene permisos para realizar esta acción.',
      'validation': 'Por favor, verifique los datos ingresados.',
      'server': 'Error en el servidor. Intente nuevamente más tarde.',
      'unknown': 'Ocurrió un error inesperado. Intente nuevamente.'
    };

    return messages[errorInfo.category] || messages.unknown;
  }

  /**
   * Genera un reporte de errores para análisis
   */
  generateErrorReport() {
    const errors = this.getErrors();
    const summary = {
      total: errors.length,
      bySeverity: {},
      byCategory: {},
      byComponent: {},
      recent: errors.slice(0, 10)
    };

    errors.forEach(error => {
      // Contar por severidad
      summary.bySeverity[error.severity] = (summary.bySeverity[error.severity] || 0) + 1;
      
      // Contar por categoría
      summary.byCategory[error.category] = (summary.byCategory[error.category] || 0) + 1;
      
      // Contar por componente
      const component = error.context.component || 'unknown';
      summary.byComponent[component] = (summary.byComponent[component] || 0) + 1;
    });

    return summary;
  }
}

// Instancia singleton del servicio
const errorHandlingService = new ErrorHandlingService();

// Exportar la instancia y la clase
export default errorHandlingService;
export { ErrorHandlingService, errorHandlingService };

// Utilidades para componentes React
export const withErrorHandling = (WrappedComponent, errorContext = {}) => {
  return function WithErrorHandlingComponent(props) {
    const handleError = (error, additionalContext = {}) => {
      return errorHandlingService.handleError(error, {
        ...errorContext,
        ...additionalContext,
        component: WrappedComponent.name || 'UnknownComponent'
      });
    };

    return React.createElement(WrappedComponent, { ...props, onError: handleError });
  };
};

// Hook personalizado para manejo de errores
export const useErrorHandler = (context = {}) => {
  const handleError = (error, additionalContext = {}) => {
    return errorHandlingService.handleError(error, {
      ...context,
      ...additionalContext
    });
  };

  const handleAsyncError = async (asyncFunction, additionalContext = {}) => {
    try {
      return await asyncFunction();
    } catch (error) {
      handleError(error, additionalContext);
      throw error;
    }
  };

  return {
    handleError,
    handleAsyncError,
    getErrors: errorHandlingService.getErrors.bind(errorHandlingService),
    clearErrors: errorHandlingService.clearErrors.bind(errorHandlingService),
    generateReport: errorHandlingService.generateErrorReport.bind(errorHandlingService)
  };
};