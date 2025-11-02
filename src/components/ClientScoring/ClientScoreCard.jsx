import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Avatar,
  Grid,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon,
  Star as StarIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Lightbulb as LightbulbIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import clientScoringService from '../../services/clientScoringService';
import { useNotifications } from '../Notifications/NotificationSystem';

const ClientScoreCard = ({ clientId, clientName, showDetails = false, compact = false }) => {
  const [scoring, setScoring] = useState(null);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { showSnackbar } = useNotifications();

  useEffect(() => {
    if (clientId) {
      loadClientScore();
    }
  }, [clientId]);

  const loadClientScore = async () => {
    setLoading(true);
    try {
      const scoreData = await clientScoringService.getClientScore(clientId);
      setScoring(scoreData);
    } catch (error) {
      console.error('Error cargando scoring del cliente:', error);
      showSnackbar({
        title: 'Error',
        message: 'No se pudo cargar el scoring del cliente',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRefreshScore = async () => {
    handleMenuClose();
    await loadClientScore();
    showSnackbar({
      title: 'Scoring actualizado',
      message: 'El scoring del cliente ha sido actualizado',
      severity: 'success'
    });
  };

  const handleViewDetails = () => {
    handleMenuClose();
    setDetailsOpen(true);
  };

  const getLevelIcon = (level) => {
    const levelData = clientScoringService.clientLevels[level.toLowerCase()];
    return levelData?.icon || '👤';
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'primary';
    if (score >= 55) return 'warning';
    if (score >= 40) return 'info';
    return 'error';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon sx={{ color: 'green', fontSize: 16 }} />;
      case 'down':
        return <TrendingDownIcon sx={{ color: 'red', fontSize: 16 }} />;
      default:
        return <TimelineIcon sx={{ color: 'gray', fontSize: 16 }} />;
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LinearProgress sx={{ flex: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Cargando scoring...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!scoring) {
    return null;
  }

  const levelData = clientScoringService.clientLevels[scoring.level?.toLowerCase()] || clientScoringService.clientLevels.prospect;

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: levelData.color, width: 32, height: 32 }}>
          <Typography variant="body2">
            {getLevelIcon(scoring.level)}
          </Typography>
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight="bold">
            {scoring.level}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={scoring.totalScore}
              sx={{ flex: 1, height: 4 }}
              color={getScoreColor(scoring.totalScore)}
            />
            <Typography variant="caption" sx={{ minWidth: 30 }}>
              {scoring.totalScore}
            </Typography>
          </Box>
        </Box>
        {scoring.trends && getTrendIcon(scoring.trends.direction)}
      </Box>
    );
  }

  return (
    <>
      <Card sx={{ height: '100%', position: 'relative' }}>
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: levelData.color, width: 48, height: 48 }}>
                <Typography variant="h4">
                  {getLevelIcon(scoring.level)}
                </Typography>
              </Avatar>
              <Box>
                <Typography variant="h6" component="div">
                  {clientName || 'Cliente'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Nivel: {scoring.level}
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
          </Box>

          {/* Score Principal */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Puntaje Total
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4" fontWeight="bold" color={getScoreColor(scoring.totalScore) + '.main'}>
                  {scoring.totalScore}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  /100
                </Typography>
                {scoring.trends && getTrendIcon(scoring.trends.direction)}
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={scoring.totalScore}
              sx={{ height: 8, borderRadius: 4 }}
              color={getScoreColor(scoring.totalScore)}
            />
          </Box>

          {/* Métricas Rápidas */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Riesgo de Churn
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={scoring.riskLevel?.riskLevel || 'Bajo'}
                    size="small"
                    color={getRiskColor(scoring.riskLevel?.riskLevel)}
                    variant="outlined"
                  />
                  <Typography variant="caption">
                    {scoring.riskLevel?.probability || 0}%
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Última Actualización
                </Typography>
                <Typography variant="body2">
                  {new Date(scoring.calculatedAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Beneficios */}
          {showDetails && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Beneficios del Nivel
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {levelData.benefits.map((benefit, index) => (
                  <Chip
                    key={index}
                    label={benefit}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 24 }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Menú de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRefreshScore}>
          <RefreshIcon sx={{ mr: 1 }} />
          Actualizar Scoring
        </MenuItem>
        <MenuItem onClick={handleViewDetails}>
          <AssessmentIcon sx={{ mr: 1 }} />
          Ver Detalles
        </MenuItem>
      </Menu>

      {/* Diálogo de detalles */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: levelData.color }}>
              <Typography variant="body1">
                {getLevelIcon(scoring.level)}
              </Typography>
            </Avatar>
            <Box>
              <Typography variant="h6">
                Detalles de Scoring - {clientName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nivel {scoring.level} • {scoring.totalScore}/100 puntos
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Breakdown de scores */}
          <Typography variant="h6" gutterBottom>
            Desglose de Puntuación
          </Typography>
          <List sx={{ mb: 3 }}>
            {Object.entries(scoring.breakdown).map(([key, value]) => {
              const factor = clientScoringService.scoringFactors[key];
              if (!factor) return null;

              return (
                <ListItem key={key}>
                  <ListItemIcon>
                    <StarIcon color={value > factor.maxScore * 0.7 ? 'primary' : 'disabled'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={key.charAt(0).toUpperCase() + key.slice(1)}
                    secondary={`${value}/${factor.maxScore} puntos (${Math.round((value / factor.maxScore) * 100)}%)`}
                  />
                  <LinearProgress
                    variant="determinate"
                    value={(value / factor.maxScore) * 100}
                    sx={{ width: 100 }}
                    color={value > factor.maxScore * 0.7 ? 'primary' : 'default'}
                  />
                </ListItem>
              );
            })}
          </List>

          <Divider sx={{ my: 2 }} />

          {/* Recomendaciones */}
          <Typography variant="h6" gutterBottom>
            Recomendaciones
          </Typography>
          {scoring.recommendations && scoring.recommendations.length > 0 ? (
            <List>
              {scoring.recommendations.map((rec, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {rec.type === 'urgent' && <WarningIcon color="error" />}
                    {rec.type === 'engagement' && <InfoIcon color="info" />}
                    {rec.type === 'upsell' && <TrendingUpIcon color="success" />}
                    {rec.type === 'retention' && <CheckCircleIcon color="primary" />}
                    {!['urgent', 'engagement', 'upsell', 'retention'].includes(rec.type) && <LightbulbIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={rec.title}
                    secondary={rec.description}
                  />
                  <Chip
                    label={rec.priority}
                    size="small"
                    color={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'default'}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">
              <AlertTitle>Sin recomendaciones</AlertTitle>
              El cliente tiene un rendimiento óptimo según el análisis actual.
            </Alert>
          )}

          {/* Factores de riesgo */}
          {scoring.riskLevel?.riskFactors && scoring.riskLevel.riskFactors.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Factores de Riesgo
              </Typography>
              <List>
                {scoring.riskLevel.riskFactors.map((factor, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText primary={factor} />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientScoreCard;