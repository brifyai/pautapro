const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const winston = require('winston');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');

// Configuración de logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/api-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/api-combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Inicialización de Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configurado para producción
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://pautapro.com', 'https://app.pautapro.com']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 1000 : 10000, // requests por windowMs
  message: {
    error: 'Demasiadas solicitudes desde esta IP',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Parse JSON con límite de tamaño
app.use(express.json({ 
  limit: '10mb',
  strict: true
}));

// Middleware de logging de requests
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('API Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      apiKey: req.get('X-API-Key') ? 'present' : 'missing'
    });
  });
  
  next();
});

// Middleware de autenticación
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const apiKey = req.headers['x-api-key'];
  
  try {
    if (apiKey) {
      // Autenticación por API Key
      const { data: apiKeyData, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('key', apiKey)
        .eq('active', true)
        .single();
      
      if (error || !apiKeyData) {
        return res.status(401).json({
          error: 'API Key inválida o expirada',
          code: 'INVALID_API_KEY'
        });
      }
      
      // Verificar límites de rate limiting para API key
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const { count: requestCount } = await supabase
        .from('api_logs')
        .select('*', { count: 'exact', head: true })
        .eq('api_key_id', apiKeyData.id)
        .gte('created_at', oneHourAgo.toISOString());
      
      if (requestCount >= apiKeyData.hourly_limit) {
        return res.status(429).json({
          error: 'Límite de requests por hora excedido',
          code: 'HOURLY_LIMIT_EXCEEDED'
        });
      }
      
      // Actualizar última actividad
      await supabase
        .from('api_keys')
        .update({ last_used: now.toISOString() })
        .eq('id', apiKeyData.id);
      
      req.user = { apiKey: apiKeyData };
      req.apiKeyId = apiKeyData.id;
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      // Autenticación por JWT (para usuarios autenticados)
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const { data: userData, error } = await supabase
          .from('usuarios')
          .select(`
            *,
            Perfiles (*),
            Grupos (*)
          `)
          .eq('id_usuario', decoded.userId)
          .single();
        
        if (error || !userData) {
          return res.status(401).json({
            error: 'Token inválido',
            code: 'INVALID_TOKEN'
          });
        }
        
        req.user = userData;
      } catch (jwtError) {
        return res.status(401).json({
          error: 'Token inválido',
          code: 'INVALID_TOKEN'
        });
      }
    } else {
      return res.status(401).json({
        error: 'Token de autorización requerido',
        code: 'AUTHORIZATION_REQUIRED'
      });
    }
    
    next();
  } catch (error) {
    logger.error('Error de autenticación:', error);
    res.status(500).json({
      error: 'Error interno de autenticación',
      code: 'AUTH_INTERNAL_ERROR'
    });
  }
};

// Middleware de autorización por permisos
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }
    
    // Verificar si el usuario tiene el permiso requerido
    const userPermissions = req.user.Perfiles?.permissions || [];
    
    if (!userPermissions.includes(permission)) {
      logger.warn('Acceso denegado por permisos insuficientes', {
        userId: req.user.id_usuario,
        requiredPermission: permission,
        userPermissions
      });
      
      return res.status(403).json({
        error: 'Permisos insuficientes',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: permission
      });
    }
    
    next();
  };
};

// Log de actividad de API
const logApiActivity = async (req, apiKeyId, statusCode, endpoint) => {
  try {
    await supabase
      .from('api_logs')
      .insert({
        api_key_id: apiKeyId,
        endpoint: endpoint,
        method: req.method,
        status_code: statusCode,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        request_size: JSON.stringify(req.body).length,
        response_time: Date.now()
      });
  } catch (error) {
    logger.error('Error loggeando actividad de API:', error);
  }
};

// Wrapper para logging automático
const withLogging = (handler) => {
  return async (req, res) => {
    const start = Date.now();
    
    try {
      await handler(req, res);
      const duration = Date.now() - start;
      
      // Log de request exitoso
      logger.info('API Request Success', {
        method: req.method,
        endpoint: req.path,
        duration: `${duration}ms`,
        status: res.statusCode
      });
      
      // Log en BD si es API key
      if (req.apiKeyId) {
        await logApiActivity(req, req.apiKeyId, res.statusCode, req.path);
      }
      
    } catch (error) {
      const duration = Date.now() - start;
      
      logger.error('API Request Error', {
        method: req.method,
        endpoint: req.path,
        duration: `${duration}ms`,
        error: error.message,
        stack: error.stack
      });
      
      // Log error en BD
      if (req.apiKeyId) {
        await logApiActivity(req, req.apiKeyId, 500, req.path);
      }
      
      throw error;
    }
  };
};

// Documentación de API
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Información de la API
app.get('/api', (req, res) => {
  res.json({
    name: 'PautaPro API',
    version: '2.0.0',
    description: 'API Empresarial para Integración de Sistemas',
    documentation: '/api/docs',
    status: 'production_ready',
    endpoints: {
      clientes: '/api/v2/clientes',
      ordenes: '/api/v2/ordenes', 
      campañas: '/api/v2/campañas',
      reportes: '/api/v2/reportes',
      analytics: '/api/v2/analytics',
      webhooks: '/api/v2/webhooks'
    }
  });
});

module.exports = {
  app,
  authenticateToken,
  requirePermission,
  withLogging,
  supabase,
  logger
};