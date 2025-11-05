import supabaseAIService from './supabaseAIService';

/**
 * Servicio de validaciones de negocio para el Asistente IA
 * Valida que todas las operaciones cumplan con las reglas de negocio
 */
export const aiValidationService = {
  // ==================== VALIDACIONES DE CLIENTES ====================

  async validateClientExists(clienteId) {
    try {
      const cliente = await supabaseAIService.getClienteById(clienteId);
      if (!cliente) {
        return {
          valid: false,
          message: `Cliente con ID ${clienteId} no existe en el sistema`
        };
      }
      if (cliente.estado !== 'activo') {
        return {
          valid: false,
          message: `Cliente ${cliente.nombre} está inactivo. Estado: ${cliente.estado}`
        };
      }
      return { valid: true, data: cliente };
    } catch (error) {
      return {
        valid: false,
        message: `Error validando cliente: ${error.message}`
      };
    }
  },

  async validateClientByName(nombreCliente) {
    try {
      const clientes = await supabaseAIService.searchClientes(nombreCliente);
      if (clientes.length === 0) {
        return {
          valid: false,
          message: `No se encontró cliente con nombre similar a "${nombreCliente}"`
        };
      }
      if (clientes.length > 1) {
        return {
          valid: false,
          message: `Se encontraron múltiples clientes: ${clientes.map(c => c.nombre).join(', ')}. Por favor, sé más específico.`,
          suggestions: clientes
        };
      }
      return { valid: true, data: clientes[0] };
    } catch (error) {
      return {
        valid: false,
        message: `Error buscando cliente: ${error.message}`
      };
    }
  },

  // ==================== VALIDACIONES DE PROVEEDORES ====================

  async validateProveedorExists(proveedorId) {
    try {
      const proveedor = await supabaseAIService.getProveedorById(proveedorId);
      if (!proveedor) {
        return {
          valid: false,
          message: `Proveedor con ID ${proveedorId} no existe`
        };
      }
      if (proveedor.estado !== 'activo') {
        return {
          valid: false,
          message: `Proveedor ${proveedor.nombre} está inactivo`
        };
      }
      return { valid: true, data: proveedor };
    } catch (error) {
      return {
        valid: false,
        message: `Error validando proveedor: ${error.message}`
      };
    }
  },

  async validateProveedorByName(nombreProveedor) {
    try {
      const proveedores = await supabaseAIService.searchProveedores(nombreProveedor);
      if (proveedores.length === 0) {
        return {
          valid: false,
          message: `No se encontró proveedor con nombre similar a "${nombreProveedor}"`
        };
      }
      if (proveedores.length > 1) {
        return {
          valid: false,
          message: `Se encontraron múltiples proveedores. Por favor, sé más específico.`,
          suggestions: proveedores
        };
      }
      return { valid: true, data: proveedores[0] };
    } catch (error) {
      return {
        valid: false,
        message: `Error buscando proveedor: ${error.message}`
      };
    }
  },

  // ==================== VALIDACIONES DE MEDIOS ====================

  async validateMedioExists(medioId) {
    try {
      const medio = await supabaseAIService.getMedioById(medioId);
      if (!medio) {
        return {
          valid: false,
          message: `Medio con ID ${medioId} no existe`
        };
      }
      if (medio.estado !== 'activo') {
        return {
          valid: false,
          message: `Medio ${medio.nombre} está inactivo`
        };
      }
      return { valid: true, data: medio };
    } catch (error) {
      return {
        valid: false,
        message: `Error validando medio: ${error.message}`
      };
    }
  },

  async validateMedioByName(nombreMedio) {
    try {
      const medios = await supabaseAIService.searchMedios(nombreMedio);
      if (medios.length === 0) {
        return {
          valid: false,
          message: `No se encontró medio con nombre similar a "${nombreMedio}"`
        };
      }
      if (medios.length > 1) {
        return {
          valid: false,
          message: `Se encontraron múltiples medios. Por favor, sé más específico.`,
          suggestions: medios
        };
      }
      return { valid: true, data: medios[0] };
    } catch (error) {
      return {
        valid: false,
        message: `Error buscando medio: ${error.message}`
      };
    }
  },

  // ==================== VALIDACIONES DE SOPORTES ====================

  async validateSoporteExists(soporteId) {
    try {
      const soporte = await supabaseAIService.getSoporteById(soporteId);
      if (!soporte) {
        return {
          valid: false,
          message: `Soporte con ID ${soporteId} no existe`
        };
      }
      if (soporte.estado !== 'activo') {
        return {
          valid: false,
          message: `Soporte ${soporte.nombre} está inactivo`
        };
      }
      return { valid: true, data: soporte };
    } catch (error) {
      return {
        valid: false,
        message: `Error validando soporte: ${error.message}`
      };
    }
  },

  async validateSoporteByName(nombreSoporte) {
    try {
      const soportes = await supabaseAIService.searchSoportes(nombreSoporte);
      if (soportes.length === 0) {
        return {
          valid: false,
          message: `No se encontró soporte con nombre similar a "${nombreSoporte}"`
        };
      }
      if (soportes.length > 1) {
        return {
          valid: false,
          message: `Se encontraron múltiples soportes. Por favor, sé más específico.`,
          suggestions: soportes
        };
      }
      return { valid: true, data: soportes[0] };
    } catch (error) {
      return {
        valid: false,
        message: `Error buscando soporte: ${error.message}`
      };
    }
  },

  // ==================== VALIDACIONES DE CAMPAÑAS ====================

  async validateCampanaExists(campanaId) {
    try {
      const campana = await supabaseAIService.getCampanaById(campanaId);
      if (!campana) {
        return {
          valid: false,
          message: `Campaña con ID ${campanaId} no existe`
        };
      }
      return { valid: true, data: campana };
    } catch (error) {
      return {
        valid: false,
        message: `Error validando campaña: ${error.message}`
      };
    }
  },

  async validateCampanaByName(nombreCampana) {
    try {
      const campanas = await supabaseAIService.searchCampanas(nombreCampana);
      if (campanas.length === 0) {
        return {
          valid: false,
          message: `No se encontró campaña con nombre similar a "${nombreCampana}"`
        };
      }
      if (campanas.length > 1) {
        return {
          valid: false,
          message: `Se encontraron múltiples campañas. Por favor, sé más específico.`,
          suggestions: campanas
        };
      }
      return { valid: true, data: campanas[0] };
    } catch (error) {
      return {
        valid: false,
        message: `Error buscando campaña: ${error.message}`
      };
    }
  },

  // ==================== VALIDACIONES DE CONTRATOS ====================

  async validateContractExists(clienteId, proveedorId) {
    try {
      const contratos = await supabaseAIService.getContratosByClienteAndProveedor(clienteId, proveedorId);
      if (contratos.length === 0) {
        return {
          valid: false,
          message: `No existe contrato activo entre cliente y proveedor`
        };
      }
      return { valid: true, data: contratos[0] };
    } catch (error) {
      return {
        valid: false,
        message: `Error validando contrato: ${error.message}`
      };
    }
  },

  // ==================== VALIDACIONES DE FECHAS ====================

  validateDatesValid(fechaInicio, fechaFin) {
    try {
      if (!fechaInicio || !fechaFin) {
        return {
          valid: false,
          message: 'Las fechas de inicio y fin son requeridas'
        };
      }

      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      const hoy = new Date();

      if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
        return {
          valid: false,
          message: 'Las fechas no tienen un formato válido'
        };
      }

      if (inicio > fin) {
        return {
          valid: false,
          message: 'La fecha de inicio no puede ser posterior a la fecha de fin'
        };
      }

      if (inicio < hoy) {
        return {
          valid: false,
          message: 'La fecha de inicio no puede ser en el pasado'
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        message: `Error validando fechas: ${error.message}`
      };
    }
  },

  // ==================== VALIDACIONES DE PRESUPUESTO ====================

  async validateBudgetAvailable(clienteId, monto) {
    try {
      if (!monto || monto <= 0) {
        return {
          valid: false,
          message: 'El monto debe ser mayor a 0'
        };
      }

      const cliente = await supabaseAIService.getClienteById(clienteId);
      if (!cliente) {
        return {
          valid: false,
          message: 'Cliente no encontrado'
        };
      }

      // Obtener órdenes activas del cliente
      const ordenes = await supabaseAIService.getOrdenes({
        id_cliente: clienteId
      });

      const ordenesActivas = ordenes.filter(o => 
        !['entregada', 'cancelada', 'cerrada'].includes(o.estado)
      );

      const montoUsado = ordenesActivas.reduce((sum, o) => sum + (o.monto || 0), 0);
      const presupuestoDisponible = (cliente.presupuesto_total || 0) - montoUsado;

      if (monto > presupuestoDisponible) {
        return {
          valid: false,
          message: `Presupuesto insuficiente. Disponible: $${presupuestoDisponible.toLocaleString('es-CL')}, Solicitado: $${monto.toLocaleString('es-CL')}`
        };
      }

      return { valid: true, presupuestoDisponible };
    } catch (error) {
      return {
        valid: false,
        message: `Error validando presupuesto: ${error.message}`
      };
    }
  },

  // ==================== VALIDACIONES DE ÓRDENES ====================

  async validateOrderData(orderData) {
    try {
      const errors = [];

      // Validar cliente
      if (!orderData.id_cliente) {
        errors.push('Cliente es requerido');
      } else {
        const clienteValidation = await this.validateClientExists(orderData.id_cliente);
        if (!clienteValidation.valid) {
          errors.push(clienteValidation.message);
        }
      }

      // Validar campaña
      if (!orderData.id_campania) {
        errors.push('Campaña es requerida');
      } else {
        const campanaValidation = await this.validateCampanaExists(orderData.id_campania);
        if (!campanaValidation.valid) {
          errors.push(campanaValidation.message);
        }
      }

      // Validar medio
      if (!orderData.id_medio) {
        errors.push('Medio es requerido');
      } else {
        const medioValidation = await this.validateMedioExists(orderData.id_medio);
        if (!medioValidation.valid) {
          errors.push(medioValidation.message);
        }
      }

      // Validar soporte
      if (!orderData.id_soporte) {
        errors.push('Soporte es requerido');
      } else {
        const soporteValidation = await this.validateSoporteExists(orderData.id_soporte);
        if (!soporteValidation.valid) {
          errors.push(soporteValidation.message);
        }
      }

      // Validar monto
      if (!orderData.monto || orderData.monto <= 0) {
        errors.push('Monto debe ser mayor a 0');
      }

      // Validar fechas
      if (orderData.fecha_inicio && orderData.fecha_fin) {
        const datesValidation = this.validateDatesValid(orderData.fecha_inicio, orderData.fecha_fin);
        if (!datesValidation.valid) {
          errors.push(datesValidation.message);
        }
      }

      if (errors.length > 0) {
        return {
          valid: false,
          message: 'Errores en los datos de la orden:',
          errors
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        message: `Error validando orden: ${error.message}`
      };
    }
  },

  // ==================== VALIDACIONES DE CAMPAÑAS ====================

  async validateCampaignData(campaignData) {
    try {
      const errors = [];

      // Validar cliente
      if (!campaignData.id_cliente) {
        errors.push('Cliente es requerido');
      } else {
        const clienteValidation = await this.validateClientExists(campaignData.id_cliente);
        if (!clienteValidation.valid) {
          errors.push(clienteValidation.message);
        }
      }

      // Validar nombre
      if (!campaignData.nombrecampania || campaignData.nombrecampania.trim() === '') {
        errors.push('Nombre de campaña es requerido');
      }

      // Validar fechas
      if (campaignData.fecha_inicio && campaignData.fecha_fin) {
        const datesValidation = this.validateDatesValid(campaignData.fecha_inicio, campaignData.fecha_fin);
        if (!datesValidation.valid) {
          errors.push(datesValidation.message);
        }
      }

      // Validar presupuesto
      if (!campaignData.presupuesto_total || campaignData.presupuesto_total <= 0) {
        errors.push('Presupuesto debe ser mayor a 0');
      }

      if (errors.length > 0) {
        return {
          valid: false,
          message: 'Errores en los datos de la campaña:',
          errors
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        message: `Error validando campaña: ${error.message}`
      };
    }
  },

  // ==================== VALIDACIONES DE CLIENTES ====================

  async validateClientData(clientData) {
    try {
      const errors = [];

      // Validar nombre
      if (!clientData.nombre || clientData.nombre.trim() === '') {
        errors.push('Nombre del cliente es requerido');
      }

      // Validar RUT
      if (!clientData.rut || clientData.rut.trim() === '') {
        errors.push('RUT del cliente es requerido');
      }

      // Validar que RUT sea único
      if (clientData.rut) {
        const clientes = await supabaseAIService.getClientes();
        const rutExistente = clientes.find(c => c.rut === clientData.rut);
        if (rutExistente) {
          errors.push(`RUT ${clientData.rut} ya existe en el sistema`);
        }
      }

      if (errors.length > 0) {
        return {
          valid: false,
          message: 'Errores en los datos del cliente:',
          errors
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        message: `Error validando cliente: ${error.message}`
      };
    }
  },

  // ==================== VALIDACIONES DE PROVEEDORES ====================

  async validateProveedorData(proveedorData) {
    try {
      const errors = [];

      // Validar nombre
      if (!proveedorData.nombre || proveedorData.nombre.trim() === '') {
        errors.push('Nombre del proveedor es requerido');
      }

      // Validar RUT
      if (!proveedorData.rut || proveedorData.rut.trim() === '') {
        errors.push('RUT del proveedor es requerido');
      }

      // Validar que RUT sea único
      if (proveedorData.rut) {
        const proveedores = await supabaseAIService.getProveedores();
        const rutExistente = proveedores.find(p => p.rut === proveedorData.rut);
        if (rutExistente) {
          errors.push(`RUT ${proveedorData.rut} ya existe en el sistema`);
        }
      }

      if (errors.length > 0) {
        return {
          valid: false,
          message: 'Errores en los datos del proveedor:',
          errors
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        message: `Error validando proveedor: ${error.message}`
      };
    }
  }
};

export default aiValidationService;
