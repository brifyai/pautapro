/**
 * Componente para visualizar y gestionar el historial de versiones de órdenes
 * Permite ver todas las versiones de una orden y comparar cambios
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Badge,
  Alert,
  Divider,
  Grid,
  Card,
  CardContent,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/material';
import {
  History as HistoryIcon,
  Visibility as VisibilityIcon,
  Compare as CompareIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { ordenVersionamientoService } from '../../services/ordenVersionamientoService';
import { SweetAlertUtils } from '../../utils/sweetAlertUtils';

const HistorialVersionesOrden = ({ 
  numeroOrdenBase, 
  open, 
  onClose, 
  onVerOrden,
  onCompararVersiones 
}) => {
  const [loading, setLoading] = useState(false);
  const [versiones, setVersiones] = useState([]);
  const [versionSeleccionada, setVersionSeleccionada] = useState(null);
  const [showComparacion, setShowComparacion] = useState(false);
  const [comparacionData, setComparacionData] = useState(null);

  useEffect(() => {
    if (open && numeroOrdenBase) {
      cargarHistorialVersiones();
    }
  }, [open, numeroOrdenBase]);

  const cargarHistorialVersiones = async () => {
    setLoading(true);
    try {
      const historial = await ordenVersionamientoService.obtenerHistorialVersiones(numeroOrdenBase);
      setVersiones(historial);
    } catch (error) {
      console.error('Error cargando historial de versiones:', error);
      SweetAlertUtils.showError('Error', 'No se pudo cargar el historial de versiones', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerVersion = (version) => {
    setVersionSeleccionada(version);
    if (onVerOrden) {
      onVerOrden(version);
    }
  };

  const handleCompararVersiones = async (version1, version2) => {
    try {
      SweetAlertUtils.showLoading('Comparando versiones...');
      
      // Simular comparación (en una implementación real, esto haría una comparación detallada)
      const comparacion = {
        version1,
        version2,
        diferencias: [
          {
            campo: 'alternativas_plan_orden',
            valorAnterior: JSON.stringify(version1.alternativas_plan_orden || []),
            valorNuevo: JSON.stringify(version2.alternativas_plan_orden || []),
            tipo: 'cambio'
          },
          {
            campo: 'estado',
            valorAnterior: version1.estado,
            valorNuevo: version2.estado,
            tipo: version1.estado !== version2.estado ? 'cambio' : 'igual'
          }
        ],
        resumen: {
          totalCambios: version1.estado !== version2.estado ? 1 : 0,
          fechaComparacion: new Date().toISOString()
        }
      };

      setComparacionData(comparacion);
      setShowComparacion(true);
      SweetAlertUtils.close();

    } catch (error) {
      SweetAlertUtils.close();
      SweetAlertUtils.showError('Error', 'No se pudo comparar las versiones', error);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'completada': return 'success';
      case 'produccion': return 'warning';
      case 'aprobada': return 'info';
      case 'pendiente': return 'default';
      case 'cancelada': return 'error';
      default: return 'default';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'completada': return <CheckCircleIcon />;
      case 'produccion': return <ScheduleIcon />;
      case 'aprobada': return <CheckCircleIcon />;
      case 'pendiente': return <PendingIcon />;
      case 'cancelada': return <CancelIcon />;
      default: return <InfoIcon />;
    }
  };

  const getVersionInfo = (numeroOrden) => {
    return ordenVersionamientoService.parsearNumeroOrden(numeroOrden);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ComparacionDialog = () => {
    if (!comparacionData) return null;

    return (
      <Dialog 
        open={showComparacion} 
        onClose={() => setShowComparacion(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CompareIcon />
            <Typography variant="h6">
              Comparación de Versiones
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Versión Anterior
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {comparacionData.version1.numero_correlativo}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {formatearFecha(comparacionData.version1.created_at)}
                  </Typography>
                  <Chip
                    label={comparacionData.version1.estado}
                    color={getEstadoColor(comparacionData.version1.estado)}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Versión Nueva
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {comparacionData.version2.numero_correlativo}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {formatearFecha(comparacionData.version2.created_at)}
                  </Typography>
                  <Chip
                    label={comparacionData.version2.estado}
                    color={getEstadoColor(comparacionData.version2.estado)}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Diferencias Detectadas ({comparacionData.resumen.totalCambios})
          </Typography>

          {comparacionData.diferencias.map((diff, index) => (
            <Card key={index} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  {diff.campo.replace(/_/g, ' ').toUpperCase()}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={5}>
                    <Typography variant="body2" color="textSecondary">
                      Valor Anterior:
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      backgroundColor: 'error.light', 
                      padding: 1, 
                      borderRadius: 1,
                      wordBreak: 'break-all'
                    }}>
                      {diff.valorAnterior}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <ArrowForwardIcon color="action" />
                    </Box>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography variant="body2" color="textSecondary">
                      Valor Nuevo:
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      backgroundColor: 'success.light', 
                      padding: 1, 
                      borderRadius: 1,
                      wordBreak: 'break-all'
                    }}>
                      {diff.valorNuevo}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowComparacion(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <HistoryIcon />
              <Typography variant="h6">
                Historial de Versiones - {numeroOrdenBase}
              </Typography>
              <Badge badgeContent={versiones.length} color="primary">
                <Chip label="Versiones" size="small" />
              </Badge>
            </Box>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography>Cargando historial...</Typography>
            </Box>
          ) : versiones.length === 0 ? (
            <Alert severity="info">
              No se encontraron versiones para esta orden.
            </Alert>
          ) : (
            <>
              {/* Vista de Timeline */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Línea de Tiempo de Versiones
                </Typography>
                <Timeline>
                  {versiones.map((version, index) => {
                    const versionInfo = getVersionInfo(version.numero_correlativo);
                    const isLast = index === versiones.length - 1;
                    
                    return (
                      <TimelineItem key={version.id_ordenes_de_comprar}>
                        <TimelineSeparator>
                          <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                          <Card 
                            variant={isLast ? "elevation" : "outlined"}
                            sx={{ 
                              mb: 2,
                              border: isLast ? '2px solid #206e43' : undefined
                            }}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Box>
                                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {version.numero_correlativo}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                    <Chip
                                      label={versionInfo.esOriginal ? 'Original' : `Versión ${versionInfo.version}`}
                                      color={versionInfo.esOriginal ? 'primary' : 'default'}
                                      size="small"
                                    />
                                    <Chip
                                      label={version.estado}
                                      color={getEstadoColor(version.estado)}
                                      size="small"
                                      icon={getEstadoIcon(version.estado)}
                                    />
                                    {isLast && (
                                      <Chip
                                        label="Actual"
                                        color="success"
                                        size="small"
                                      />
                                    )}
                                  </Box>
                                </Box>
                                
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Tooltip title="Ver detalles">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleVerVersion(version)}
                                      color="primary"
                                    >
                                      <VisibilityIcon />
                                    </IconButton>
                                  </Tooltip>
                                  
                                  {index > 0 && (
                                    <Tooltip title="Comparar con anterior">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleCompararVersiones(versiones[index - 1], version)}
                                        color="secondary"
                                      >
                                        <CompareIcon />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                              </Box>
                              
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                Creada: {formatearFecha(version.created_at)}
                              </Typography>
                              
                              {version.usuario_registro && (
                                <Typography variant="body2" color="textSecondary">
                                  Usuario: {version.usuario_registro.nombre}
                                </Typography>
                              )}
                              
                              {version.observaciones && (
                                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                  "{version.observaciones}"
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </TimelineContent>
                      </TimelineItem>
                    );
                  })}
                </Timeline>
              </Box>

              {/* Vista de Tabla */}
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Vista Detallada
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Versión</TableCell>
                      <TableCell>Número Completo</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Fecha Creación</TableCell>
                      <TableCell>Usuario</TableCell>
                      <TableCell>Alternativas</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {versiones.map((version, index) => {
                      const versionInfo = getVersionInfo(version.numero_correlativo);
                      
                      return (
                        <TableRow 
                          key={version.id_ordenes_de_comprar}
                          sx={{ 
                            backgroundColor: index === 0 ? '#f8fff8' : 'inherit' 
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={versionInfo.esOriginal ? 'Original' : `V${versionInfo.version}`}
                                color={versionInfo.esOriginal ? 'primary' : 'default'}
                                size="small"
                              />
                              {index === 0 && (
                                <Chip
                                  label="Actual"
                                  color="success"
                                  size="small"
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {version.numero_correlativo}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={version.estado}
                              color={getEstadoColor(version.estado)}
                              size="small"
                              icon={getEstadoIcon(version.estado)}
                            />
                          </TableCell>
                          <TableCell>
                            {formatearFecha(version.created_at)}
                          </TableCell>
                          <TableCell>
                            {version.usuario_registro?.nombre || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              badgeContent={Array.isArray(version.alternativas_plan_orden) 
                                ? version.alternativas_plan_orden.length 
                                : JSON.parse(version.alternativas_plan_orden || '[]').length
                              } 
                              color="primary"
                            >
                              <Typography variant="body2">
                                Alternativas
                              </Typography>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Ver detalles">
                                <IconButton
                                  size="small"
                                  onClick={() => handleVerVersion(version)}
                                  color="primary"
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                            
                              {index > 0 && (
                                <Tooltip title="Comparar con anterior">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleCompararVersiones(versiones[index - 1], version)}
                                    color="secondary"
                                  >
                                    <CompareIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              <Tooltip title="Exportar PDF">
                                <IconButton
                                  size="small"
                                  color="info"
                                >
                                  <DownloadIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <ComparacionDialog />
    </>
  );
};

export default HistorialVersionesOrden;