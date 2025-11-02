import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Chip,
  Button,
  Collapse,
  IconButton,
  Grid,
  Tooltip,
  Badge
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { planningService } from '../../services/planningService';
import { useNotifications } from '../Notifications/NotificationSystem';

const PlanningValidator = ({ planData, onValidationComplete, showDetails = true }) => {
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const { showSnackbar } = useNotifications();

  useEffect(() => {
    if (planData) {
      validatePlan();
    }
  }, [planData]);

  const validatePlan = async () => {
    setLoading(true);
    try {
      const result = await planningService.validatePlanningInRealTime(planData);
      setValidation(result);
      
      if (onValidationComplete) {
        onValidationComplete(result);
      }

      // Mostrar notificación según resultado
      if (result.isValid) {
        showSnackbar({
          title: 'Validación exitosa',
          message: 'La planificación cumple con todos los requisitos',
          severity: 'success'
        });
      } else if (result.severity === 'error') {
        showSnackbar({
          title: 'Errores en la planificación',
          message: 'Se encontraron errores que deben ser corregidos',
          severity: 'error'
        });
      }

    } catch (error) {
      console.error('Error en validación:', error);
      showSnackbar({
        title: 'Error de validación',
        message: 'No se pudo completar la validación',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'success': return 'success';
      default: return 'default';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    if (score >= 40) return 'info';
    return 'error';
  };

  const ValidationSection = ({ title, items, type, icon, defaultExpanded = false }) => {
    const isExpanded = expandedSections[title] ?? defaultExpanded;
    const hasItems = items && items.length > 0;

    if (!hasItems && type !== 'suggestions') {
      return null;
    }

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              justifyContent: 'space-between'
            }}
            onClick={() => toggleSection(title)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Badge badgeContent={items?.length || 0} color={getSeverityColor(type)}>
                {icon}
              </Badge>
              <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                {title}
              </Typography>
            </Box>
            <IconButton size="small">
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          
          <Collapse in={isExpanded}>
            <List sx={{ mt: 1 }}>
              {items?.map((item, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {type === 'errors' && <ErrorIcon color="error" />}
                    {type === 'warnings' && <WarningIcon color="warning" />}
                    {type === 'suggestions' && <LightbulbIcon color="info" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={item}
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: type === 'errors' ? 'error.main' : 'text.primary'
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  const MetricsSection = ({ metrics }) => {
    if (!metrics) return null;

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon />
            Métricas de Rendimiento
          </Typography>
          
          <Grid container spacing={2}>
            {metrics.budget && (
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Eficiencia del Presupuesto
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={metrics.budget.budgetEfficiency || 0}
                      sx={{ flex: 1 }}
                      color={metrics.budget.budgetEfficiency > 70 ? 'success' : 'warning'}
                    />
                    <Typography variant="body2" sx={{ minWidth: 40 }}>
                      {Math.round(metrics.budget.budgetEfficiency || 0)}%
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}

            {metrics.synergy && (
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Sinergia de Medios
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={metrics.synergy.synergyScore || 0}
                      sx={{ flex: 1 }}
                      color={metrics.synergy.synergyScore > 70 ? 'success' : 'warning'}
                    />
                    <Typography variant="body2" sx={{ minWidth: 40 }}>
                      {Math.round(metrics.synergy.synergyScore || 0)}%
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}

            {metrics.roi && (
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    ROI Esperado
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon 
                      color={metrics.roi.expectedROI > 150 ? 'success' : 'warning'} 
                      sx={{ fontSize: 20 }}
                    />
                    <Typography variant="body2" fontWeight="bold">
                      {Math.round(metrics.roi.expectedROI || 0)}%
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}

            {metrics.capacity && (
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tasa de Ocupación
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={metrics.capacity.utilizationRate || 0}
                      sx={{ flex: 1 }}
                      color={metrics.capacity.utilizationRate < 80 ? 'success' : 'warning'}
                    />
                    <Typography variant="body2" sx={{ minWidth: 40 }}>
                      {Math.round(metrics.capacity.utilizationRate || 0)}%
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Validando planificación...
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (!validation) {
    return null;
  }

  return (
    <Box>
      {/* Resumen de validación */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Resultado de Validación
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                label={`Score: ${validation.score || 0}/100`}
                color={getScoreColor(validation.score)}
                variant="outlined"
              />
              <Button
                variant="outlined"
                size="small"
                onClick={validatePlan}
                startIcon={<AssessmentIcon />}
              >
                Revalidar
              </Button>
            </Box>
          </Box>

          {/* Alerta principal */}
          <Alert 
            severity={getSeverityColor(validation.severity)}
            sx={{ mb: 2 }}
          >
            <AlertTitle>
              {validation.isValid ? 'Validación Exitosa' : 'Se Requieren Ajustes'}
            </AlertTitle>
            {validation.isValid 
              ? 'La planificación cumple con todos los requisitos y está lista para ejecutarse.'
              : 'Se encontraron problemas que deben ser corregidos antes de proceder.'
            }
          </Alert>

          {/* Resumen de problemas */}
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  {validation.errors?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Errores
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {validation.warnings?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Advertencias
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {validation.suggestions?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sugerencias
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {validation.score || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Score
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {showDetails && (
        <>
          {/* Métricas */}
          <MetricsSection metrics={validation.metrics} />

          {/* Errores */}
          <ValidationSection
            title="Errores Críticos"
            items={validation.errors}
            type="errors"
            icon={<ErrorIcon />}
            defaultExpanded={true}
          />

          {/* Advertencias */}
          <ValidationSection
            title="Advertencias"
            items={validation.warnings}
            type="warnings"
            icon={<WarningIcon />}
            defaultExpanded={validation.errors?.length === 0}
          />

          {/* Sugerencias */}
          <ValidationSection
            title="Sugerencias de Optimización"
            items={validation.suggestions}
            type="suggestions"
            icon={<LightbulbIcon />}
            defaultExpanded={validation.errors?.length === 0 && validation.warnings?.length === 0}
          />
        </>
      )}
    </Box>
  );
};

export default PlanningValidator;