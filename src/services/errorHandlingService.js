import Swal from 'sweetalert2';

/**
 * Servicio centralizado para manejo de errores
 */
class ErrorHandlingService {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
  }

  /**
   * Maneja un error de manera centralizada
   * @param {Error} error - El error a manejar
   * @param {Object} context - Contexto adicional del error
   */
  handleError(error, context = {}) {
    const errorInfo = {
      message: error.message || 'Error desconocido',
      stack: error.stack,
      timestamp: new Date().toISOString(),
      component: context.component || 'Unknown',
      action: context.action || 'Unknown',
      additionalInfo: context.additionalInfo || {}
    };

    // Agregar al log
    this.addToLog(errorInfo);

    // Imprimir en consola para debugging
    console.error(`Error en ${context.component}:`, error);

    // Mostrar notificación si es necesario
    if (context.showNotification !== false) {
      this.showErrorNotification(errorInfo);
    }

    return errorInfo;
  }

  /**
   * Agrega error al log
   */
  addToLog(errorInfo) {
    this.errorLog.unshift(errorInfo);
    
    // Mantener el log dentro del tamaño máximo
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }
  }

  /**
   * Muestra notificación de error
   */
  showErrorNotification(errorInfo) {
    // Solo mostrar notificación para errores críticos o cuando se solicite explícitamente
    if (errorInfo.additionalInfo.critical || errorInfo.additionalInfo.showNotification) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorInfo.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    }
  }

  /**
   * Obtiene el log de errores
   */
  getErrorLog() {
    return [...this.errorLog];
  }

  /**
   * Limpia el log de errores
   */
  clearErrorLog() {
    this.errorLog = [];
  }

  /**
   * Crea un hook personalizado para componentes React
   */
  createHook(componentName) {
    return (error, context = {}) => {
      return this.handleError(error, {
        component: componentName,
        ...context
      });
    };
  }
}

// Instancia singleton
export const errorHandlingService = new ErrorHandlingService();

/**
 * Hook personalizado para manejo de errores en componentes React
 */
export const useErrorHandler = ({ component = 'Unknown' } = {}) => {
  const handleError = (error, context = {}) => {
    return errorHandlingService.handleError(error, {
      component,
      ...context
    });
  };

  return {
    handleError,
    errorLog: errorHandlingService.getErrorLog(),
    clearLog: errorHandlingService.clearErrorLog.bind(errorHandlingService)
  };
};

export default errorHandlingService;