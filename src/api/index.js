const express = require('express');
const { app, authenticateToken, requirePermission, withLogging, supabase, logger } = require('./server');

// Importar rutas
const clientesRoutes = require('./routes/clientes');
const ordenesRoutes = require('./routes/ordenes');
const reportesRoutes = require('./routes/reportes');

// === CONFIGURACIÓN DE RUTAS ===

// Ruta de autenticación OAuth 2.0
app.post('/oauth/token', async (req, res) => {
  try {
    const { grant_type, client_id, client_secret, scope } = req.body;

    // Validar grant type
    if (grant_type !== 'client_credentials') {
      return res.status(400).json({
        error: 'Grant type no soportado',
        code: 'UNSUPPORTED_GRANT_TYPE'
      });
    }

    // Verificar credenciales del cliente
    const { data: client, error } = await supabase
      .from('oauth_clients')
      .select(`
        *,
        Permisos (scope)
      `)
      .eq('client_id', client_id)
      .eq('client_secret', client_secret)
      .eq('active', true)
      .single();

    if (error || !client) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generar token de acceso
    const accessToken = generarJWT({
      client_id: client.id,
      scope: scope || client.Permisos?.scope,
      type: 'access_token'
    });

    // Generar token de refresh si es necesario
    const refreshToken = generarJWT({
      client_id: client.id,
      type: 'refresh_token'
    });

    // Guardar tokens en base de datos
    await supabase
      .from('oauth_tokens')
      .insert({
        client_id: client.id,
        access_token: accessToken,
        refresh_token: refreshToken,
        scope: scope || client.Permisos?.scope,
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString() // 1 hora
      });

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: scope || client.Permisos?.scope
    });

  } catch (error) {
    logger.error('Error en OAuth token endpoint:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'OAUTH_ERROR'
    });
  }
});

// Ruta para renovar tokens
app.post('/oauth/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        error: 'Refresh token requerido',
        code: 'REFRESH_TOKEN_REQUIRED'
      });
    }

    // Verificar y decodificar refresh token
    const decoded = verificarJWT(refresh_token);
    if (!decoded || decoded.type !== 'refresh_token') {
      return res.status(401).json({
        error: 'Refresh token inválido',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Buscar token en base de datos
    const { data: tokenData, error } = await supabase
      .from('oauth_tokens')
      .select(`
        *,
        OAuthClients (client_id)
      `)
      .eq('refresh_token', refresh_token)
      .eq('used', false)
      .single();

    if (error || !tokenData) {
      return res.status(401).json({
        error: 'Refresh token no válido o ya utilizado',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Marcar refresh token como utilizado
    await supabase
      .from('oauth_tokens')
      .update({ used: true })
      .eq('id', tokenData.id);

    // Generar nuevos tokens
    const newAccessToken = generarJWT({
      client_id: tokenData.client_id,
      scope: tokenData.scope,
      type: 'access_token'
    });

    const newRefreshToken = generarJWT({
      client_id: tokenData.client_id,
      type: 'refresh_token'
    });

    // Guardar nuevo refresh token
    await supabase
      .from('oauth_tokens')
      .insert({
        client_id: tokenData.client_id,
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        scope: tokenData.scope,
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
      });

    res.json({
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: tokenData.scope
    });

  } catch (error) {
    logger.error('Error en refresh token endpoint:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'REFRESH_ERROR'
    });
  }
});

// === MIDDLEWARE DE AUTENTICACIÓN PARA OAuth ===
const authenticateOAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token de autorización requerido',
      code: 'AUTHORIZATION_REQUIRED'
    });
  }

  const token = authHeader.substring(7);
  const decoded = verificarJWT(token);

  if (!decoded || decoded.type !== 'access_token') {
    return res.status(401).json({
      error: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }

  req.user = decoded;
  next();
};

// === ENDPOINTS DE AUTENTICACIÓN ===
app.post('/oauth/validate', authenticateOAuth, (req, res) => {
  res.json({
    valid: true,
    scope: req.user.scope,
    client_id: req.user.client_id
  });
});

// === RUTAS DE LA API ===
app.use('/api/v2/clientes', clientesRoutes);
app.use('/api/v2/ordenes', ordenesRoutes);
app.use('/api/v2/reportes', reportesRoutes);

// === ENDPOINTS ADICIONALES ===

// Métricas de API para monitoreo
app.get('/api/metrics', authenticateOAuth, withLogging(async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
    // Calcular fecha de inicio según período
    let startDate = new Date();
    switch (period) {
      case '1h':
        startDate.setHours(startDate.getHours() - 1);
        break;
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 1);
    }

    // Obtener métricas de la base de datos
    const { data: requestMetrics } = await supabase
      .from('api_logs')
      .select('*')
      .gte('created_at', startDate.toISOString());

    const { data: activeTokens } = await supabase
      .from('oauth_tokens')
      .select('*')
      .gte('expires_at', new Date().toISOString())
      .eq('used', false);

    // Procesar métricas
    const metrics = {
      period,
      total_requests: requestMetrics?.length || 0,
      successful_requests: requestMetrics?.filter(r => r.status_code < 400).length || 0,
      error_requests: requestMetrics?.filter(r => r.status_code >= 400).length || 0,
      unique_ips: new Set(requestMetrics?.map(r => r.ip_address)).size,
      average_response_time: requestMetrics?.length > 0 
        ? requestMetrics.reduce((sum, r) => sum + (r.response_time || 0), 0) / requestMetrics.length 
        : 0,
      top_endpoints: calcularTopEndpoints(requestMetrics || []),
      status_distribution: calcularStatusDistribution(requestMetrics || []),
      active_tokens: activeTokens?.length || 0,
      generated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    logger.error('Error generando métricas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'METRICS_ERROR'
    });
  }
}));

// Webhooks - registrar nuevo webhook
app.post('/api/v2/webhooks', authenticateToken, withLogging(async (req, res) => {
  try {
    const { url, events, secret } = req.body;

    // Validaciones
    if (!url || !events || !Array.isArray(events)) {
      return res.status(400).json({
        error: 'URL y eventos son obligatorios',
        code: 'VALIDATION_ERROR'
      });
    }

    // Verificar que la URL es válida
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        error: 'URL inválida',
        code: 'INVALID_URL'
      });
    }

    // Registrar webhook
    const { data: webhook, error } = await supabase
      .from('webhooks')
      .insert({
        url,
        eventos: events,
        secret: secret || generarWebhookSecret(),
        activo: true,
        creado_por: req.user.id_usuario || req.user.apiKey?.id,
        fecha_creacion: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creando webhook:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'DATABASE_ERROR'
      });
    }

    // Enviar evento de prueba
    try {
      await enviarWebhook('webhook.registrado', {
        webhook_id: webhook.id,
        url: webhook.url,
        eventos: webhook.eventos
      });
    } catch (webhookError) {
      logger.warn('Error enviando webhook de prueba:', webhookError);
    }

    res.status(201).json({
      success: true,
      message: 'Webhook registrado exitosamente',
      data: {
        id: webhook.id,
        url: webhook.url,
        eventos: webhook.eventos,
        secret: webhook.secret
      }
    });

  } catch (error) {
    logger.error('Error inesperado en POST /webhooks:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}));

// Listar webhooks
app.get('/api/v2/webhooks', authenticateToken, withLogging(async (req, res) => {
  try {
    const { activo = 'true' } = req.query;

    const query = supabase
      .from('webhooks')
      .select('*')
      .order('fecha_creacion', { ascending: false });

    if (activo !== 'all') {
      query.eq('activo', activo === 'true');
    }

    const { data: webhooks, error } = await query;

    if (error) {
      logger.error('Error consultando webhooks:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'DATABASE_ERROR'
      });
    }

    res.json({
      success: true,
      data: webhooks || []
    });

  } catch (error) {
    logger.error('Error inesperado en GET /webhooks:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}));

// === MANEJO DE ERRORES ===

// 404 para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    code: 'ENDPOINT_NOT_FOUND',
    path: req.originalUrl
  });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  logger.error('Error no manejado:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  res.status(500).json({
    error: 'Error interno del servidor',
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { 
      details: error.message,
      stack: error.stack 
    })
  });
});

// === FUNCIONES AUXILIARES ===

function generarJWT(payload) {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    payload, 
    process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    { expiresIn: '1h' }
  );
}

function verificarJWT(token) {
  try {
    const jwt = require('jsonwebtoken');
    return jwt.verify(
      token, 
      process.env.JWT_SECRET || 'fallback-secret-change-in-production'
    );
  } catch (error) {
    return null;
  }
}

function generarWebhookSecret() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

function calcularTopEndpoints(requests) {
  const endpointCounts = {};
  requests.forEach(req => {
    const endpoint = `${req.method} ${req.endpoint}`;
    endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
  });
  
  return Object.entries(endpointCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([endpoint, count]) => ({ endpoint, count }));
}

function calcularStatusDistribution(requests) {
  const distribution = {};
  requests.forEach(req => {
    const statusGroup = Math.floor(req.status_code / 100) * 100;
    const statusKey = `${statusGroup}xx`;
    distribution[statusKey] = (distribution[statusKey] || 0) + 1;
  });
  return distribution;
}

// === CONFIGURACIÓN Y ARRANQUE ===

// Configurar puerto
const PORT = process.env.API_PORT || 3001;

// Iniciar servidor si se ejecuta directamente
if (require.main === module) {
  const server = app.listen(PORT, () => {
    logger.info(`🚀 PautaPro API v2.0.0 iniciada en puerto ${PORT}`);
    logger.info(`📚 Documentación: http://localhost:${PORT}/api/docs`);
    logger.info(`❤️  Health check: http://localhost:${PORT}/api/health`);
    logger.info(`📊 Métricas: http://localhost:${PORT}/api/metrics`);
    
    if (process.env.NODE_ENV === 'production') {
      logger.info('🌍 Modo: PRODUCCIÓN');
    } else {
      logger.info('🛠️  Modo: DESARROLLO');
    }
  });

  // Manejar cierre graceful
  process.on('SIGTERM', () => {
    logger.info('🔄 Cerrando servidor...');
    server.close(() => {
      logger.info('✅ Servidor cerrado correctamente');
      process.exit(0);
    });
  });
}

// Exportar para uso en otros módulos
module.exports = app;

// === FUNCIONES EXPORTADAS ===
module.exports = {
  app,
  authenticateToken,
  requirePermission,
  withLogging,
  supabase,
  logger
};