import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Backdrop,
  Fade,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Componente de loading optimizado con diferentes variantes
const LoadingOptimized = ({ 
  variant = 'circular', 
  message = 'Cargando...', 
  size = 40, 
  fullScreen = false,
  showRetry = false,
  onRetry,
  progress = null,
  overlay = false,
  minHeight = '200px'
}) => {
  const renderContent = () => {
    switch (variant) {
      case 'circular':
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CircularProgress size={size} />
            {message && (
              <Typography variant="body2" color="text.secondary" align="center">
                {message}
              </Typography>
            )}
            {showRetry && onRetry && (
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="caption" color="error">
                  Error al cargar
                </Typography>
                <RefreshIcon 
                  sx={{ cursor: 'pointer', color: 'primary.main' }} 
                  onClick={onRetry}
                />
              </Box>
            )}
          </Box>
        );
        
      case 'linear':
        return (
          <Box width="100%">
            {message && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {message}
              </Typography>
            )}
            <LinearProgress 
              variant="determinate" 
              value={progress || 0} 
              sx={{ height: 6, borderRadius: 3 }} 
            />
            {progress !== null && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                {Math.round(progress)}%
              </Typography>
            )}
          </Box>
        );
        
      case 'skeleton':
        return (
          <Box width="100%">
            {message && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {message}
              </Typography>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Paper sx={{ height: 40, borderRadius: 1 }} />
              <Paper sx={{ height: 20, width: '80%', borderRadius: 1 }} />
              <Paper sx={{ height: 20, width: '60%', borderRadius: 1 }} />
            </Box>
          </Box>
        );
        
      default:
        return (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={minHeight}>
            <CircularProgress size={size} />
          </Box>
        );
    }
  };

  const content = renderContent();

  if (fullScreen) {
    return (
      <Fade in={true}>
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
          }}
          open={true}
        >
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
          >
            {content}
          </Box>
        </Backdrop>
      </Fade>
    );
  }

  if (overlay) {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999,
          minHeight
        }}
      >
        <Paper sx={{ p: 3, minWidth: 200 }}>
          {content}
        </Paper>
      </Box>
    );
  }

  return content;
};

export default LoadingOptimized;