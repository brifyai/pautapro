/**
 * 🧠 Advanced NLP Service - PautaPro
 * 
 * Servicio avanzado de procesamiento de lenguaje natural
 * Utiliza técnicas de:
 * - Análisis semántico profundo
 * - Procesamiento de dependencias sintácticas
 * - Resolución de referencias anafóricas
 * - Análisis de sentimiento
 * - Detección de entidades nombradas (NER)
 * - Desambiguación de palabras
 */

class AdvancedNLPService {
  constructor() {
    this.wordVectors = this.initializeWordVectors();
    this.semanticSimilarityThreshold = 0.7;
    this.contextWindow = 5; // Palabras antes y después para contexto
    this.entityCache = new Map();
    this.relationshipGraph = new Map();
  }

  /**
   * Inicializa vectores de palabras para análisis semántico
   */
  initializeWordVectors() {
    return {
      // Verbos de acción
      crear: { vector: [1, 0, 0, 1, 0], category: 'action', type: 'create' },
      agregar: { vector: [1, 0, 0, 1, 0], category: 'action', type: 'create' },
      nuevo: { vector: [1, 0, 0, 1, 0], category: 'action', type: 'create' },
      generar: { vector: [1, 0, 0, 1, 0], category: 'action', type: 'create' },
      
      buscar: { vector: [0, 1, 0, 0, 0], category: 'action', type: 'read' },
      encontrar: { vector: [0, 1, 0, 0, 0], category: 'action', type: 'read' },
      listar: { vector: [0, 1, 0, 0, 0], category: 'action', type: 'read' },
      mostrar: { vector: [0, 1, 0, 0, 0], category: 'action', type: 'read' },
      
      actualizar: { vector: [0, 0, 1, 0, 0], category: 'action', type: 'update' },
      modificar: { vector: [0, 0, 1, 0, 0], category: 'action', type: 'update' },
      cambiar: { vector: [0, 0, 1, 0, 0], category: 'action', type: 'update' },
      editar: { vector: [0, 0, 1, 0, 0], category: 'action', type: 'update' },
      
      eliminar: { vector: [0, 0, 0, 1, 0], category: 'action', type: 'delete' },
      borrar: { vector: [0, 0, 0, 1, 0], category: 'action', type: 'delete' },
      quitar: { vector: [0, 0, 0, 1, 0], category: 'action', type: 'delete' },
      
      // Entidades
      cliente: { vector: [1, 0, 0, 0, 0], category: 'entity', type: 'cliente' },
      empresa: { vector: [1, 0, 0, 0, 0], category: 'entity', type: 'cliente' },
      compañía: { vector: [1, 0, 0, 0, 0], category: 'entity', type: 'cliente' },
      
      proveedor: { vector: [0, 1, 0, 0, 0], category: 'entity', type: 'proveedor' },
      vendor: { vector: [0, 1, 0, 0, 0], category: 'entity', type: 'proveedor' },
      agencia: { vector: [0, 1, 0, 0, 0], category: 'entity', type: 'proveedor' },
      
      medio: { vector: [0, 0, 1, 0, 0], category: 'entity', type: 'medio' },
      canal: { vector: [0, 0, 1, 0, 0], category: 'entity', type: 'medio' },
      tv: { vector: [0, 0, 1, 0, 0], category: 'entity', type: 'medio' },
      radio: { vector: [0, 0, 1, 0, 0], category: 'entity', type: 'medio' },
      
      campaña: { vector: [0, 0, 0, 1, 0], category: 'entity', type: 'campaña' },
      plan: { vector: [0, 0, 0, 1, 0], category: 'entity', type: 'campaña' },
      proyecto: { vector: [0, 0, 0, 1, 0], category: 'entity', type: 'campaña' },
      
      orden: { vector: [0, 0, 0, 0, 1], category: 'entity', type: 'orden' },
      pedido: { vector: [0, 0, 0, 0, 1], category: 'entity', type: 'orden' },
      oc: { vector: [0, 0, 0, 0, 1], category: 'entity', type: 'orden' }
    };
  }

  /**
   * Análisis semántico profundo del mensaje
   */
  async analyzeSemantics(message) {
    const tokens = this.tokenize(message);
    const posTags = this.performPOSTagging(tokens);
    const dependencies = this.parseDependencies(tokens, posTags);
    const entities = this.extractNamedEntities(tokens, message);
    const sentiment = this.analyzeSentiment(message);
    const semanticRoles = this.extractSemanticRoles(tokens, dependencies);

    return {
      tokens,
      posTags,
      dependencies,
      entities,
      sentiment,
      semanticRoles,
      complexity: this.calculateComplexity(tokens, dependencies)
    };
  }

  /**
   * Tokenización avanzada
   */
  tokenize(message) {
    // Normalizar
    let normalized = message.toLowerCase().trim();
    
    // Separar puntuación
    normalized = normalized.replace(/([.,!?;:])/g, ' $1 ');
    
    // Dividir en tokens
    const tokens = normalized.split(/\s+/).filter(t => t.length > 0);
    
    return tokens;
  }

  /**
   * Part-of-Speech Tagging
   */
  performPOSTagging(tokens) {
    const tags = [];
    const wordVectors = this.wordVectors;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const prevToken = i > 0 ? tokens[i - 1] : null;
      const nextToken = i < tokens.length - 1 ? tokens[i + 1] : null;

      let tag = 'NN'; // Sustantivo por defecto

      if (wordVectors[token]) {
        const wordInfo = wordVectors[token];
        if (wordInfo.category === 'action') tag = 'VB';
        else if (wordInfo.category === 'entity') tag = 'NN';
      } else if (/^\d+$/.test(token)) {
        tag = 'CD'; // Número
      } else if (/^[a-z]+$/.test(token) && token.length <= 3) {
        tag = 'IN'; // Preposición
      } else if (token === 'de' || token === 'en' || token === 'con' || token === 'por') {
        tag = 'IN';
      } else if (token === 'y' || token === 'o' || token === 'pero') {
        tag = 'CC'; // Conjunción
      }

      tags.push({ token, tag, confidence: 0.85 });
    }

    return tags;
  }

  /**
   * Análisis de dependencias sintácticas
   */
  parseDependencies(tokens, posTags) {
    const dependencies = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const tag = posTags[i].tag;

      // Buscar relaciones con palabras cercanas
      for (let j = Math.max(0, i - 3); j < Math.min(tokens.length, i + 4); j++) {
        if (i !== j) {
          const otherToken = tokens[j];
          const otherTag = posTags[j].tag;
          const distance = Math.abs(i - j);

          // Detectar relaciones comunes
          if (tag === 'VB' && otherTag === 'NN') {
            dependencies.push({
              type: 'nsubj', // Sujeto nominal
              head: token,
              dependent: otherToken,
              distance
            });
          } else if (tag === 'NN' && otherTag === 'IN') {
            dependencies.push({
              type: 'prep', // Preposición
              head: token,
              dependent: otherToken,
              distance
            });
          }
        }
      }
    }

    return dependencies;
  }

  /**
   * Extracción de Entidades Nombradas (NER)
   */
  extractNamedEntities(tokens, originalMessage) {
    const entities = [];
    const patterns = {
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      rut: /\d{1,2}\.\d{3}\.\d{3}-[\dkK]/g,
      telefono: /\+?56?9?\d{8,9}/g,
      monto: /\$?\s*(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)/g,
      fecha: /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/g,
      porcentaje: /(\d+(?:[.,]\d{1,2})?)\s*%/g,
      url: /https?:\/\/[^\s]+/g
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      let match;
      while ((match = pattern.exec(originalMessage)) !== null) {
        entities.push({
          type,
          value: match[0],
          position: match.index,
          confidence: 0.95
        });
      }
    }

    // Detectar nombres propios (palabras capitalizadas)
    const words = originalMessage.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (/^[A-Z][a-záéíóú]*/.test(word) && word.length > 2) {
        entities.push({
          type: 'PERSON_OR_ORG',
          value: word,
          position: originalMessage.indexOf(word),
          confidence: 0.7
        });
      }
    }

    return entities;
  }

  /**
   * Análisis de sentimiento
   */
  analyzeSentiment(message) {
    const positiveWords = ['bien', 'bueno', 'excelente', 'perfecto', 'genial', 'rápido', 'eficiente'];
    const negativeWords = ['mal', 'malo', 'terrible', 'lento', 'problema', 'error', 'fallo'];
    const urgentWords = ['urgente', 'rápido', 'ahora', 'inmediato', 'pronto'];

    const lowerMessage = message.toLowerCase();
    let sentiment = 0;
    let urgency = 0;

    for (const word of positiveWords) {
      if (lowerMessage.includes(word)) sentiment += 0.2;
    }

    for (const word of negativeWords) {
      if (lowerMessage.includes(word)) sentiment -= 0.2;
    }

    for (const word of urgentWords) {
      if (lowerMessage.includes(word)) urgency += 0.3;
    }

    return {
      sentiment: Math.max(-1, Math.min(1, sentiment)), // -1 a 1
      urgency: Math.min(1, urgency), // 0 a 1
      tone: sentiment > 0.3 ? 'positive' : sentiment < -0.3 ? 'negative' : 'neutral'
    };
  }

  /**
   * Extracción de roles semánticos
   */
  extractSemanticRoles(tokens, dependencies) {
    const roles = {
      agent: null,      // Quién realiza la acción
      action: null,     // Qué acción se realiza
      patient: null,    // Sobre quién/qué se realiza
      instrument: null, // Con qué se realiza
      location: null,   // Dónde se realiza
      time: null        // Cuándo se realiza
    };

    // Buscar verbos (acciones)
    for (const token of tokens) {
      if (this.wordVectors[token]?.category === 'action') {
        roles.action = token;
        break;
      }
    }

    // Buscar sustantivos (agente, paciente)
    const nouns = tokens.filter(t => this.wordVectors[t]?.category === 'entity');
    if (nouns.length > 0) roles.agent = nouns[0];
    if (nouns.length > 1) roles.patient = nouns[1];

    // Buscar preposiciones (ubicación, instrumento)
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === 'en' && i + 1 < tokens.length) {
        roles.location = tokens[i + 1];
      } else if (tokens[i] === 'con' && i + 1 < tokens.length) {
        roles.instrument = tokens[i + 1];
      }
    }

    return roles;
  }

  /**
   * Calcula la complejidad del mensaje
   */
  calculateComplexity(tokens, dependencies) {
    const tokenCount = tokens.length;
    const dependencyCount = dependencies.length;
    const avgDependencyDistance = dependencyCount > 0
      ? dependencies.reduce((sum, d) => sum + d.distance, 0) / dependencyCount
      : 0;

    // Escala de 0 a 1
    const complexity = Math.min(1, (tokenCount / 20) + (dependencyCount / 10) + (avgDependencyDistance / 10));

    return {
      score: complexity,
      level: complexity < 0.3 ? 'simple' : complexity < 0.6 ? 'moderate' : 'complex'
    };
  }

  /**
   * Resolución de referencias anafóricas
   */
  resolveAnaphora(message, conversationHistory) {
    let resolvedMessage = message;

    // Pronombres comunes
    const pronouns = {
      'lo': 'el elemento anterior',
      'la': 'la entidad anterior',
      'los': 'los elementos anteriores',
      'las': 'las entidades anteriores',
      'ese': 'ese elemento',
      'esa': 'esa entidad',
      'esto': 'esto',
      'eso': 'eso'
    };

    for (const [pronoun, replacement] of Object.entries(pronouns)) {
      if (message.includes(pronoun)) {
        // Buscar en historial
        if (conversationHistory.length > 0) {
          const lastMessage = conversationHistory[conversationHistory.length - 1];
          // Intentar reemplazar con contexto del mensaje anterior
          resolvedMessage = resolvedMessage.replace(pronoun, `[referencia a: ${lastMessage.substring(0, 30)}...]`);
        }
      }
    }

    return resolvedMessage;
  }

  /**
   * Desambiguación de palabras
   */
  disambiguateWord(word, context) {
    const ambiguousWords = {
      'orden': ['orden de compra', 'orden de ejecución', 'orden jerárquica'],
      'plan': ['plan de campaña', 'plan de acción', 'plan de medios'],
      'medio': ['medio de comunicación', 'medio ambiente', 'medio de pago'],
      'soporte': ['soporte técnico', 'soporte publicitario', 'soporte de datos']
    };

    if (!ambiguousWords[word]) return word;

    // Analizar contexto para desambiguar
    const contextWords = context.toLowerCase().split(/\s+/);
    const meanings = ambiguousWords[word];

    // Buscar palabras clave que indiquen significado
    for (const meaning of meanings) {
      const meaningWords = meaning.split(/\s+/);
      const matches = meaningWords.filter(mw => contextWords.includes(mw)).length;
      if (matches > 0) return meaning;
    }

    return meanings[0]; // Significado más común por defecto
  }

  /**
   * Análisis de similitud semántica entre palabras
   */
  calculateSemanticSimilarity(word1, word2) {
    const vec1 = this.wordVectors[word1]?.vector || [0, 0, 0, 0, 0];
    const vec2 = this.wordVectors[word2]?.vector || [0, 0, 0, 0, 0];

    // Similitud del coseno
    const dotProduct = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, v) => sum + v * v, 0));

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Corrección de errores ortográficos
   */
  correctSpelling(word) {
    const commonMisspellings = {
      'clinte': 'cliente',
      'provedor': 'proveedor',
      'campana': 'campaña',
      'orden': 'orden',
      'contrato': 'contrato',
      'agencia': 'agencia',
      'medio': 'medio',
      'soporte': 'soporte'
    };

    return commonMisspellings[word] || word;
  }

  /**
   * Generación de respuestas contextuales
   */
  generateContextualResponse(intention, entities, sentiment, urgency) {
    let response = '';

    // Ajustar tono según sentimiento y urgencia
    const prefix = urgency > 0.5 ? '⚡ ' : sentiment > 0.3 ? '✨ ' : '';
    const suffix = urgency > 0.5 ? ' (procesando con prioridad)' : '';

    switch (intention) {
      case 'CREATE':
        response = `${prefix}Entendido. Voy a crear un ${entities.type}${suffix}`;
        break;
      case 'READ':
        response = `${prefix}Buscando ${entities.type}s${suffix}`;
        break;
      case 'UPDATE':
        response = `${prefix}Actualizando ${entities.type}${suffix}`;
        break;
      case 'DELETE':
        response = `${prefix}Preparando eliminación de ${entities.type}${suffix}`;
        break;
      default:
        response = `${prefix}Procesando tu solicitud${suffix}`;
    }

    return response;
  }

  /**
   * Análisis de patrones de lenguaje
   */
  analyzeLanguagePatterns(message) {
    const patterns = {
      hasNegation: /no\s+|nunca\s+|jamás\s+/i.test(message),
      hasQuestion: /\?/.test(message),
      hasExclamation: /!/.test(message),
      hasConditional: /si\s+|cuando\s+|si\s+no\s+/i.test(message),
      hasComparison: /más\s+que|menos\s+que|igual\s+que|como\s+/i.test(message),
      hasQuantifier: /todos|ninguno|algunos|muchos|pocos/i.test(message),
      hasTimeReference: /hoy|mañana|ayer|semana|mes|año|próximo|anterior/i.test(message)
    };

    return patterns;
  }
}

// Exportar como singleton
const advancedNLPService = new AdvancedNLPService();
export default advancedNLPService;
