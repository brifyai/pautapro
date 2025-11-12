import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  BugReport as BugReportIcon,
  Home as HomeIcon
} from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Generar un ID único para el error
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return { 
      hasError: true,
      errorId,
      error: error.message || 'Error desconocido'
    };
  }

  componentDidCatch(error, errorInfo) {
    // Actualizar el estado con información detallada del error
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log del error para debugging
    console.error('Error Boundary capturó un error:', error, errorInfo);

    // Opcional: Enviar error a un servicio de monitoreo
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    try {
      // Aquí podrías integrar con un servicio como Sentry, LogRocket, etc.
      const errorData = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // Por ahora, solo lo guardamos en localStorage para debugging
      const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      existingErrors.push(errorData);
      
      // Mantener solo los últimos 10 errores
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10);
      }
      
      localStorage.setItem('app_errors', JSON.stringify(existingErrors));
    } catch (e) {
      console.error('Error al registrar el error:', e);
    }
  };

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0'
            }}
          >
            <Box mb={3}>
              <BugReportIcon 
                sx={{ 
                  fontSize: 64, 
                  color: '#f44336',
                  mb: 2 
                }} 
              />
            </Box>

            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              <AlertTitle>¡Ups! Algo salió mal</AlertTitle>
              <Typography variant="body2">
                La aplicación encontró un error inesperado. Hemos registrado el problema para solucionarlo.
              </Typography>
            </Alert>

            <Typography variant="h6" gutterBottom>
              Error ID: {this.state.errorId}
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph>
              {this.state.error?.toString() || 'Ocurrió un error inesperado en la aplicación.'}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={this.handleRetry}
              >
                Reintentar
              </Button>
              
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<HomeIcon />}
                onClick={this.handleGoHome}
              >
                Ir al Inicio
              </Button>
              
              <Button
                variant="outlined"
                color="warning"
                onClick={this.handleReload}
              >
                Recargar Página
              </Button>
            </Box>

            {isDevelopment && this.state.errorInfo && (
              <Box sx={{ mt: 4, textAlign: 'left' }}>
                <Typography variant="h6" gutterBottom color="error">
                  Información de Depuración (Modo Desarrollo)
                </Typography>
                
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', fontSize: '0.8rem' }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {this.state.error && this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </Paper>
              </Box>
            )}

            <Box sx={{ mt: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Si el problema persiste, contacte al equipo de soporte con el Error ID mostrado arriba.
              </Typography>
            </Box>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;