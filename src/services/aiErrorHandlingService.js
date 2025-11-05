/**
 * Servicio de manejo de errores para el Asistente IA
 * Convierte errores técnicos en mensajes amigables para el usuario
 */
export const aiErrorHandlingService = {
  // ==================== TIPOS DE ERRORES ====================

  errorTypes: {
    SUPABASE_ERROR: 'supabase_error',
    VALIDATION_ERROR: 'validation_error',
    NOT_FOUND_ERROR: 'not_found_error',
    PERMISSION_ERROR: 'permission_error',
    NETWORK_ERROR: 'network_error',
    DUPLICATE_ERROR: 'duplicate_error',
    CONSTRAINT_ERROR: 'constraint_error',
    UNKNOWN_ERROR: 'unknown_error'
  },

  // ==================== CLASIFICACIÓN DE ERRORES ====================

  classifyError(error) {
    if (!error) return this.errorTypes.UNKNOWN_ERROR;

    const message = error.message?.toLowerCase() || '';
    const code = error.code?.toLowerCase() || '';

    // Errores de red
    if (message.includes('network') || message.includes('fetch') || code === 'network_error') {
      return this.errorTypes.NETWORK_ERROR;
    }

    // Errores de permiso
    if (message.includes('permission') || message.includes('unauthorized') || code === '403' || code === '401') {
      return this.errorTypes.PERMISSION_ERROR;
    }

    // Errores de no encontrado
    if (message.includes('not found') || message.includes('no rows') || code === '404') {
      return this.errorTypes.NOT_FOUND_ERROR;
    }

    // Errores de duplicado
    if (message.includes('duplicate') || message.includes('unique') || code === '23505') {
      return this.errorTypes.DUPLICATE_ERROR;
    }

    // Errores de restricción
    if (message.includes('constraint') || message.includes('foreign key') || code === '23503') {
      return this.errorTypes.CONSTRAINT_ERROR;
    }

    // Errores de validación
    if (message.includes('validation') || message.includes('invalid')) {
      return this.errorTypes.VALIDATION_ERROR;
    }

    // Errores de Supabase
    if (error.status || error.statusText) {
      return this.errorTypes.SUPABASE_ERROR;
    }

    return this.errorTypes.UNKNOWN_ERROR;
  },

  // ==================== MANEJO DE ERRORES ESPECÍFICOS ====================

  handleSupabaseError(error) {
    const errorType = this.classifyError(error);

    switch (errorType) {
      case this.errorTypes.PERMISSION_ERROR:
        return {
          type: errorType,
          userMessage: '❌ No tienes permisos para realizar esta acción. Contacta al administrador.',
          technicalMessage: error.message,
          severity: 'error',
          action: 'contact_admin'
        };

      case this.errorTypes.NOT_FOUND_ERROR:
        return {
          type: errorType,
          userMessage: '❌ El registro que buscas no existe en el sistema.',
          technicalMessage: error.message,
          severity: 'warning',
          action: 'retry_search'
        };

      case this.errorTypes.DUPLICATE_ERROR:
        return {
          type: errorType,
          userMessage: '❌ Este registro ya existe en el sistema. Verifica los datos e intenta nuevamente.',
          technicalMessage: error.message,
          severity: 'warning',
          action: 'check_duplicates'
        };

      case this.errorTypes.CONSTRAINT_ERROR:
        return {
          type: errorType,
          userMessage: '❌ No se puede realizar esta acción porque hay registros relacionados. Verifica las dependencias.',
          technicalMessage: error.message,
          severity: 'error',
          action: 'check_dependencies'
        };

      case this.errorTypes.NETWORK_ERROR:
        return {
          type: errorType,
          userMessage: '❌ Error de conexión. Verifica tu conexión a internet e intenta nuevamente.',
          technicalMessage: error.message,
          severity: 'error',
          action: 'retry'
        };

      case this.errorTypes.VALIDATION_ERROR:
        return {
          type: errorType,
          userMessage: '❌ Los datos no son válidos. Verifica que todos los campos sean correctos.',
          technicalMessage: error.message,
          severity: 'warning',
          action: 'validate_data'
        };

      default:
        return {
          type: this.errorTypes.UNKNOWN_ERROR,
          userMessage: '❌ Ha ocurrido un error inesperado. Por favor, intenta nuevamente.',
          technicalMessage: error.message,
          severity: 'error',
          action: 'retry'
        };
    }
  },

  handleValidationError(error) {
    return {
      type: this.errorTypes.VALIDATION_ERROR,
      userMessage: `❌ Error de validación: ${error.message}`,
      technicalMessage: error.message,
      severity: 'warning',
      action: 'validate_data',
      errors: error.errors || []
    };
  },

  handleNotFoundError(entityType, identifier) {
    return {
      type: this.errorTypes.NOT_FOUND_ERROR,
      userMessage: `❌ No se encontró ${entityType} con identificador "${identifier}". Verifica que exista en el sistema.`,
      technicalMessage: `${entityType} not found: ${identifier}`,
      severity: 'warning',
      action: 'search_again'
    };
  },

  handlePermissionError(action, resource) {
    return {
      type: this.errorTypes.PERMISSION_ERROR,
      userMessage: `❌ No tienes permiso para ${action} ${resource}. Contacta al administrador.`,
      technicalMessage: `Permission denied: ${action} on ${resource}`,
      severity: 'error',
      action: 'contact_admin'
    };
  },

  handleNetworkError() {
    return {
      type: this.errorTypes.NETWORK_ERROR,
      userMessage: '❌ Error de conexión con el servidor. Verifica tu conexión a internet e intenta nuevamente.',
      technicalMessage: 'Network connection failed',
      severity: 'error',
      action: 'retry'
    };
  },

  handleDuplicateError(field, value) {
    return {
      type: this.errorTypes.DUPLICATE_ERROR,
      userMessage: `❌ Ya existe un registro con ${field} = "${value}". Usa un valor diferente.`,
      technicalMessage: `Duplicate value: ${field} = ${value}`,
      severity: 'warning',
      action: 'change_value'
    };
  },

  handleConstraintError(constraint) {
    return {
      type: this.errorTypes.CONSTRAINT_ERROR,
      userMessage: `❌ No se puede realizar esta acción debido a restricciones de integridad. ${constraint}`,
      technicalMessage: `Constraint violation: ${constraint}`,
      severity: 'error',
      action: 'check_dependencies'
    };
  },

  // ==================== CONVERSIÓN A MENSAJE AMIGABLE ====================

  getUserFriendlyMessage(error) {
    if (!error) {
      return '❌ Ha ocurrido un error desconocido.';
    }

    const handled = this.handleSupabaseError(error);
    return handled.userMessage;
  },

  // ==================== SUGERENCIAS DE RECUPERACIÓN ====================

  getSuggestions(errorType) {
    const suggestions = {
      [this.errorTypes.NETWORK_ERROR]: [
        '🔄 Verifica tu conexión a internet',
        '🔄 Intenta nuevamente en unos segundos',
        '🔄 Recarga la página si el problema persiste'
      ],
      [this.errorTypes.NOT_FOUND_ERROR]: [
        '🔍 Verifica que el registro exista en el sistema',
        '🔍 Intenta con un nombre o identificador diferente',
        '🔍 Busca en la lista completa de registros'
      ],
      [this.errorTypes.DUPLICATE_ERROR]: [
        '✏️ Verifica que los datos sean únicos',
        '✏️ Busca si el registro ya existe',
        '✏️ Usa valores diferentes para los campos únicos'
      ],
      [this.errorTypes.PERMISSION_ERROR]: [
        '👤 Verifica tu rol de usuario',
        '👤 Contacta al administrador para obtener permisos',
        '👤 Intenta con una cuenta con más permisos'
      ],
      [this.errorTypes.CONSTRAINT_ERROR]: [
        '🔗 Verifica que no haya registros relacionados',
        '🔗 Elimina o actualiza los registros dependientes',
        '🔗 Contacta al soporte técnico si el problema persiste'
      ],
      [this.errorTypes.VALIDATION_ERROR]: [
        '✓ Verifica que todos los campos sean válidos',
        '✓ Revisa el formato de los datos',
        '✓ Completa todos los campos requeridos'
      ]
    };

    return suggestions[errorType] || [
      '🔄 Intenta nuevamente',
      '📞 Contacta al soporte técnico',
      '🏠 Vuelve a la página principal'
    ];
  },

  // ==================== LOGGING Y AUDITORÍA ====================

  logError(error, context = {}) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      type: this.classifyError(error),
      message: error.message,
      code: error.code,
      stack: error.stack,
      context
    };

    console.error('🚨 Error en Asistente IA:', errorInfo);

    // Aquí se podría enviar a un servicio de logging remoto
    // logService.sendError(errorInfo);

    return errorInfo;
  },

  // ==================== MANEJO DE ERRORES EN OPERACIONES ====================

  async handleOperationError(operation, error, context = {}) {
    const errorInfo = this.logError(error, { operation, ...context });
    const handled = this.handleSupabaseError(error);
    const suggestions = this.getSuggestions(handled.type);

    return {
      success: false,
      error: handled,
      suggestions,
      errorInfo
    };
  },

  // ==================== VALIDACIÓN DE RESPUESTA ====================

  validateResponse(response, expectedFields = []) {
    if (!response) {
      return {
        valid: false,
        error: this.handleNotFoundError('respuesta', 'vacía')
      };
    }

    const missingFields = expectedFields.filter(field => !(field in response));

    if (missingFields.length > 0) {
      return {
        valid: false,
        error: {
          type: this.errorTypes.VALIDATION_ERROR,
          userMessage: `❌ La respuesta no contiene los campos esperados: ${missingFields.join(', ')}`,
          technicalMessage: `Missing fields: ${missingFields.join(', ')}`,
          severity: 'error'
        }
      };
    }

    return { valid: true };
  },

  // ==================== MANEJO DE ERRORES EN BATCH ====================

  handleBatchErrors(results) {
    const errors = results.filter(r => !r.success);
    const successes = results.filter(r => r.success);

    if (errors.length === 0) {
      return {
        allSuccess: true,
        message: `✅ Todas las operaciones se completaron exitosamente (${successes.length})`
      };
    }

    if (successes.length === 0) {
      return {
        allSuccess: false,
        message: `❌ Todas las operaciones fallaron (${errors.length})`,
        errors: errors.map(e => e.error)
      };
    }

    return {
      partialSuccess: true,
      message: `⚠️ ${successes.length} operaciones exitosas, ${errors.length} fallidas`,
      successes,
      errors: errors.map(e => e.error)
    };
  },

  // ==================== RETRY LOGIC ====================

  async retryOperation(operation, maxRetries = 3, delayMs = 1000) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`Intento ${attempt}/${maxRetries} falló:`, error.message);

        if (attempt < maxRetries) {
          // Esperar antes de reintentar (backoff exponencial)
          await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)));
        }
      }
    }

    return this.handleOperationError('retry', lastError, { maxRetries });
  },

  // ==================== FORMATEO DE ERRORES PARA MOSTRAR ====================

  formatErrorForDisplay(error) {
    const handled = this.handleSupabaseError(error);
    const suggestions = this.getSuggestions(handled.type);

    return {
      title: '⚠️ Error',
      message: handled.userMessage,
      suggestions,
      severity: handled.severity,
      action: handled.action
    };
  }
};

export default aiErrorHandlingService;
