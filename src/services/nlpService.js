/**
 * Servicio de Procesamiento de Lenguaje Natural para el Asistente IA
 * Extrae entidades y crea estructuras de datos completas desde instrucciones en lenguaje natural
 */

export const nlpService = {
  // Patrones para extracción de entidades
  patterns: {
    cliente: [
      /(?:cliente|para|de)\s+([A-Z][a-zÁ-ú\s]+)/gi,
      /(?:cliente|para)\s+["']([^"']+)["']/gi,
      /cliente\s*[:]\s*([A-Z][a-zÁ-ú\s]+)/gi
    ],
    producto: [
      /(?:producto|servicio)\s+([A-Z][a-zÁ-ú\s]+)/gi,
      /(?:producto|servicio)\s+["']([^"']+)["']/gi,
      /producto\s*[:]\s*([A-Z][a-zÁ-ú\s]+)/gi
    ],
    medio: [
      /(?:medio|canal|por)\s+([A-Z][a-zÁ-ú\s]+)/gi,
      /(?:medio|canal)\s+["']([^"']+)["']/gi,
      /medio\s*[:]\s*([A-Z][a-zÁ-ú\s]+)/gi
    ],
    monto: [
      /\$(\d+(?:\.\d{3})*(?:,\d+)?)/g,
      /(?:monto|valor|costo|precio)\s*[:]\s*\$?\s*(\d+(?:\.\d{3})*(?:,\d+)?)/gi,
      /(?:monto|valor|costo|precio)\s+(\d+(?:\.\d{3})*(?:,\d+)?)/gi
    ],
    mes: [
      /(?:mes|en|para)\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/gi,
      /(?:mes|en|para)\s+(\d{1,2})/gi
    ],
    anio: [
      /(?:año|años)\s+(\d{4})/gi,
      /(?:año|años)\s*[:]\s*(\d{4})/gi,
      /\/(\d{4})/gi
    ],
    duracion: [
      /(\d+)\s*(?:días|dia|día)/gi,
      /(?:duración|duracion)\s*[:]\s*(\d+)/gi
    ],
    cantidad: [
      /(\d+)\s*(?:unidades|unidad|uds|ud)/gi,
      /(?:cantidad|cant)\s*[:]\s*(\d+)/gi
    ]
  },

  // Mapeo de meses a números
  monthMap: {
    'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5, 'junio': 6,
    'julio': 7, 'agosto': 8, 'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
  },

  // Sinónimos y variaciones
  synonyms: {
    orden: ['orden', 'ordenes', 'pedido', 'pedidos', 'solicitud', 'solicitudes'],
    crear: ['crear', 'nueva', 'nuevo', 'generar', 'hacer', 'realizar', 'ejecutar'],
    cliente: ['cliente', 'clientes', 'empresa', 'compañía', 'organización'],
    producto: ['producto', 'productos', 'servicio', 'servicios', 'item', 'items'],
    medio: ['medio', 'medios', 'canal', 'canales', 'plataforma', 'plataformas'],
    campaña: ['campaña', 'campañas', 'campana', 'campanas', 'promoción', 'promociones']
  },

  /**
   * Extrae entidades de una instrucción en lenguaje natural
   */
  extractEntities(text) {
    const entities = {
      cliente: null,
      producto: null,
      medio: null,
      monto: null,
      mes: null,
      anio: new Date().getFullYear(),
      duracion: null,
      cantidad: null,
      tipo: null,
      accion: null
    };

    const lowerText = text.toLowerCase();

    // Detectar tipo de acción
    if (this.synonyms.orden.some(syn => lowerText.includes(syn))) {
      entities.tipo = 'orden';
      entities.accion = 'crear';
    } else if (this.synonyms.campaña.some(syn => lowerText.includes(syn))) {
      entities.tipo = 'campaña';
      entities.accion = 'crear';
    }

    // Extraer cliente
    for (const pattern of this.patterns.cliente) {
      const match = text.match(pattern);
      if (match && match[1]) {
        entities.cliente = match[1].trim();
        break;
      }
    }

    // Extraer producto
    for (const pattern of this.patterns.producto) {
      const match = text.match(pattern);
      if (match && match[1]) {
        entities.producto = match[1].trim();
        break;
      }
    }

    // Extraer medio
    for (const pattern of this.patterns.medio) {
      const match = text.match(pattern);
      if (match && match[1]) {
        entities.medio = match[1].trim();
        break;
      }
    }

    // Extraer monto
    for (const pattern of this.patterns.monto) {
      const match = text.match(pattern);
      if (match && match[1]) {
        entities.monto = this.parseAmount(match[1]);
        break;
      }
    }

    // Extraer mes
    for (const pattern of this.patterns.mes) {
      const match = text.match(pattern);
      if (match && match[1]) {
        if (isNaN(match[1])) {
          // Es nombre de mes
          entities.mes = this.monthMap[match[1].toLowerCase()];
        } else {
          // Es número de mes
          entities.mes = parseInt(match[1]);
        }
        break;
      }
    }

    // Extraer año
    for (const pattern of this.patterns.anio) {
      const match = text.match(pattern);
      if (match && match[1]) {
        entities.anio = parseInt(match[1]);
        break;
      }
    }

    // Extraer duración
    for (const pattern of this.patterns.duracion) {
      const match = text.match(pattern);
      if (match && match[1]) {
        entities.duracion = parseInt(match[1]);
        break;
      }
    }

    // Extraer cantidad
    for (const pattern of this.patterns.cantidad) {
      const match = text.match(pattern);
      if (match && match[1]) {
        entities.cantidad = parseInt(match[1]);
        break;
      }
    }

    return entities;
  },

  /**
   * Convierte texto de monto a número
   */
  parseAmount(amountText) {
    // Eliminar puntos y reemplazar coma por punto
    const cleanAmount = amountText.replace(/\./g, '').replace(',', '.');
    const amount = parseFloat(cleanAmount);
    return isNaN(amount) ? null : amount;
  },

  /**
   * Valida si las entidades extraídas son suficientes para crear una orden
   */
  validateOrderEntities(entities) {
    const required = ['cliente', 'producto', 'medio'];
    const missing = required.filter(field => !entities[field]);
    
    return {
      valid: missing.length === 0,
      missing,
      confidence: this.calculateConfidence(entities, required)
    };
  },

  /**
   * Calcula el nivel de confianza en la extracción
   */
  calculateConfidence(entities, required) {
    const present = required.filter(field => entities[field]).length;
    return Math.round((present / required.length) * 100);
  },

  /**
   * Genera estructura de datos para orden completa
   */
  generateOrderStructure(entities) {
    const currentDate = new Date();
    const targetDate = new Date(entities.anio, (entities.mes || currentDate.getMonth()) - 1, 1);
    
    return {
      // Datos básicos de la orden
      orden: {
        id_cliente: null, // Se resolverá con búsqueda de cliente
        id_campana: null, // Se creará o buscará
        id_medio: null, // Se resolverá con búsqueda de medio
        estado: 'solicitada',
        fecha_inicio: targetDate.toISOString(),
        fecha_termino: entities.duracion ? 
          new Date(targetDate.getTime() + entities.duracion * 24 * 60 * 60 * 1000).toISOString() : 
          new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).toISOString(),
        presupuesto: entities.monto || 0,
        descripcion: `Orden generada por IA para ${entities.cliente} - ${entities.producto}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      
      // Datos de campaña
      campana: {
        nombrecampania: `Campaña ${entities.producto} - ${entities.cliente}`,
        id_cliente: null, // Se resolverá
        fecha_inicio: targetDate.toISOString(),
        fecha_termino: entities.duracion ? 
          new Date(targetDate.getTime() + entities.duracion * 24 * 60 * 60 * 1000).toISOString() : 
          new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).toISOString(),
        presupuesto_total: entities.monto || 0,
        objetivos: `Promoción de ${entities.producto} para ${entities.cliente}`,
        estado: 'borrador'
      },
      
      // Alternativas (detalles de la orden)
      alternativas: [{
        id_medio: null, // Se resolverá
        id_soporte: null, // Se generará por defecto
        id_contrato: null, // Se buscará o creará
        tipo_item: entities.producto,
        cantidad: entities.cantidad || 1,
        valor_unitario: entities.monto || 0,
        total_bruto: entities.monto || 0,
        total_neto: entities.monto || 0,
        descuento_pl: 0,
        calendar: this.generateCalendar(targetDate)
      }]
    };
  },

  /**
   * Genera calendario para un mes
   */
  generateCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const calendar = [];
    for (let day = 1; day <= daysInMonth; day++) {
      calendar.push({
        dia: day.toString().padStart(2, '0'),
        cantidad: 1, // Por defecto 1 unidad por día
        activo: true
      });
    }
    
    return calendar;
  },

  /**
   * Procesa instrucción completa y devuelve estructura lista para ejecución
   */
  async processInstruction(text) {
    try {
      // Extraer entidades
      const entities = this.extractEntities(text);
      
      // Validar entidades
      const validation = this.validateOrderEntities(entities);
      
      if (!validation.valid) {
        return {
          success: false,
          entities,
          validation,
          message: `Faltan datos requeridos: ${validation.missing.join(', ')}`
        };
      }
      
      // Generar estructura completa
      const structure = this.generateOrderStructure(entities);
      
      return {
        success: true,
        entities,
        structure,
        validation,
        confidence: validation.confidence,
        message: `He extraído la siguiente información:\n` +
                `• Cliente: ${entities.cliente}\n` +
                `• Producto: ${entities.producto}\n` +
                `• Medio: ${entities.medio}\n` +
                `• Monto: $${(entities.monto || 0).toLocaleString('es-CL')}\n` +
                `• Mes: ${entities.mes || 'actual'}\n` +
                `• Año: ${entities.anio}\n` +
                `• Duración: ${entities.duracion || '1 mes'}\n\n` +
                `Confianza: ${validation.confidence}%\n\n` +
                `¿Deseas que proceda con la creación de la orden?`
      };
      
    } catch (error) {
      console.error('Error procesando instrucción:', error);
      return {
        success: false,
        error: error.message,
        message: 'Ha ocurrido un error al procesar tu instrucción. Por favor, intenta ser más específico.'
      };
    }
  },

  /**
   * Sugiere correcciones para instrucciones incompletas
   */
  suggestCorrections(entities, missing) {
    const suggestions = [];
    
    if (missing.includes('cliente')) {
      suggestions.push('Especifica el nombre del cliente, ej: "para Empresa XYZ"');
    }
    
    if (missing.includes('producto')) {
      suggestions.push('Indica el producto o servicio, ej: "producto Marketing Digital"');
    }
    
    if (missing.includes('medio')) {
      suggestions.push('Menciona el medio o canal, ej: "por Televisión" o "en Radio"');
    }
    
    if (!entities.monto) {
      suggestions.push('Agrega el monto o presupuesto, ej: "$1.000.000"');
    }
    
    return suggestions;
  }
};

export default nlpService;