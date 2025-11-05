import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Memory as MemoryIcon,
  Refresh as RefreshIcon,
  DeleteSweep as CleanupIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { getMemoryInfo, isMemoryHigh, cleanupMemory } from '../utils/memoryOptimizer';

const MemoryMonitor = ({ showDetails = false }) => {
  const [memoryInfo, setMemoryInfo] = useState({
    used: 0,
    total: 0,
    limit: 0,
    percentage: 0
  });
  const [isHigh, setIsHigh] = useState(false);
  const [lastCleanup, setLastCleanup] = useState(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      try {
        const info = getMemoryInfo();
        if (info.error) {
          console.warn('Memory monitor:', info.error);
          return;
        }
        
        setMemoryInfo(info);
        setIsHigh(isMemoryHigh());
      } catch (error) {
        console.error('Error updating memory info:', error);
      }
    };

    // Actualizar inmediatamente
    updateMemoryInfo();

    // Configurar intervalo de actualización
    const interval = setInterval(updateMemoryInfo, 5000); // Cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const handleCleanup = async () => {
    try {
      cleanupMemory();
      setLastCleanup(new Date());
      
      // Actualizar información después de la limpieza
      setTimeout(() => {
        const info = getMemoryInfo();
        if (!info.error) {
          setMemoryInfo(info);
          setIsHigh(isMemoryHigh());
        }
      }, 1000);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  const getMemoryColor = (percentage) => {
    if (percentage >= 90) return '#d32f2f'; // Rojo
    if (percentage >= 70) return '#f57c00'; // Naranja
    if (percentage >= 50) return '#fbc02d'; // Amarillo
    return '#388e3c'; // Verde
  };

  const getMemoryStatus = () => {
    if (memoryInfo.used === 0) return { text: 'No disponible', color: 'default' };
    if (isHigh) return { text: 'Alto', color: 'error' };
    if (memoryInfo.percentage >= 70) return { text: 'Medio', color: 'warning' };
    return { text: 'Óptimo', color: 'success' };
  };

  const status = getMemoryStatus();

  if (memoryInfo.used === 0) {
    return (
      <Card sx={{ minWidth: 275, maxWidth: 400 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1}>
            <MemoryIcon />
            <Typography variant="h6">Monitor de Memoria</Typography>
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            Memory API no disponible en este navegador
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ minWidth: 275, maxWidth: 400 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <MemoryIcon />
            <Typography variant="h6">Monitor de Memoria</Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Actualizar">
              <IconButton size="small" onClick={() => window.location.reload()}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Limpiar Memoria">
              <IconButton size="small" onClick={handleCleanup} color="warning">
                <CleanupIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="textSecondary">
              Uso Actual
            </Typography>
            <Chip 
              label={status.text} 
              color={status.color} 
              size="small" 
              variant="outlined"
            />
          </Box>
          
          <LinearProgress
            variant="determinate"
            value={Math.min(memoryInfo.percentage, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getMemoryColor(memoryInfo.percentage),
                borderRadius: 4,
              }
            }}
          />
          
          <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
            {memoryInfo.used} MB / {memoryInfo.limit} MB
          </Typography>
          
          <Typography variant="body2" color="textSecondary">
            {memoryInfo.percentage}% utilizado
          </Typography>
        </Box>

        {showDetails && (
          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Detalles:
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Usada:</Typography>
              <Typography variant="body2" fontWeight="bold">{memoryInfo.used} MB</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Total:</Typography>
              <Typography variant="body2" fontWeight="bold">{memoryInfo.total} MB</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Límite:</Typography>
              <Typography variant="body2" fontWeight="bold">{memoryInfo.limit} MB</Typography>
            </Box>
          </Box>
        )}

        {isHigh && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <InfoIcon fontSize="small" />
              <Typography variant="body2">
                Uso de memoria elevado. Considera limpiar la memoria o cerrar pestañas no utilizadas.
              </Typography>
            </Box>
          </Alert>
        )}

        {lastCleanup && (
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Última limpieza: {lastCleanup.toLocaleTimeString()}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default MemoryMonitor;