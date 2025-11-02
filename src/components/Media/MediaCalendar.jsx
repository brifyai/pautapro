import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Avatar,
  LinearProgress,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Event as EventIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  ViewWeek as WeekViewIcon,
  ViewMonth as MonthViewIcon,
  ViewDay as DayViewIcon
} from '@mui/icons-material';

const MediaCalendar = () => {
  const [mediaData, setMediaData] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // day, week, month
  const [loading, setLoading] = useState(true);
  const [availabilityDialog, setAvailabilityDialog] = useState(false);
  const [filters, setFilters] = useState({
    mediaType: 'todos',
    status: 'todos',
    priceRange: 'todos'
  });

  // Tipos de medios con configuración
  const mediaTypes = {
    tv: { 
      label: 'Televisión', 
      color: '#FF6B6B', 
      icon: '📺',
      avgPrice: 50000,
      peakHours: '18:00-23:00'
    },
    radio: { 
      label: 'Radio', 
      color: '#4ECDC4', 
      icon: '📻',
      avgPrice: 15000,
      peakHours: '07:00-09:00, 17:00-19:00'
    },
    digital: { 
      label: 'Digital', 
      color: '#45B7D1', 
      icon: '💻',
      avgPrice: 25000,
      peakHours: '12:00-14:00, 20:00-22:00'
    },
    print: { 
      label: 'Impresos', 
      color: '#96CEB4', 
      icon: '📰',
      avgPrice: 20000,
      peakHours: 'N/A'
    },
    outdoor: { 
      label: 'Exterior', 
      color: '#FFEAA7', 
      icon: '🏪',
      avgPrice: 35000,
      peakHours: '06:00-22:00'
    },
    social: { 
      label: 'Redes Sociales', 
      color: '#DDA0DD', 
      icon: '📱',
      avgPrice: 18000,
      peakHours: '12:00-14:00, 18:00-21:00'
    }
  };

  // Estados de ocupación
  const occupancyStatus = {
    available: { 
      label: 'Disponible', 
      color: '#4CAF50', 
      icon: '✅',
      threshold: 0
    },
    low: { 
      label: 'Baja ocupación', 
      color: '#8BC34A', 
      icon: '🟢',
      threshold: 25
    },
    medium: { 
      label: 'Ocupación media', 
      color: '#FF9800', 
      icon: '🟡',
      threshold: 50
    },
    high: { 
      label: 'Alta ocupación', 
      color: '#FF5722', 
      icon: '🟠',
      threshold: 75
    },
    full: { 
      label: 'Completo', 
      color: '#F44336', 
      icon: '🔴',
      threshold: 100
    }
  };

  useEffect(() => {
    loadMediaData();
    loadBookings();
  }, [selectedDate, viewMode]);

  const loadMediaData = async () => {
    try {
      setLoading(true);
      // Simular carga de datos - en producción vendría de Supabase
      const mockMediaData = [
        {
          id: 1,
          name: 'Canal 13 - Prime Time',
          type: 'tv',
          capacity: 100,
          currentOccupancy: 85,
          basePrice: 50000,
          peakMultiplier: 1.5,
          description: 'Espacio premium en horario central',
          features: ['Alta audiencia', 'Cobertura nacional', 'HD'],
          contact: 'contacto@canal13.cl'
        },
        {
          id: 2,
          name: 'Radio Cooperativa - Mañana',
          type: 'radio',
          capacity: 50,
          currentOccupancy: 60,
          basePrice: 15000,
          peakMultiplier: 1.3,
          description: 'Programa matutino de alta audiencia',
          features: ['Segmento ejecutivo', 'Live streaming', 'Podcast'],
          contact: 'publicidad@cooperativa.cl'
        },
        {
          id: 3,
          name: 'Instagram - Stories',
          type: 'social',
          capacity: 200,
          currentOccupancy: 45,
          basePrice: 18000,
          peakMultiplier: 1.2,
          description: 'Stories con alto engagement',
          features: ['Targeting avanzado', 'Analytics', 'IG Shopping'],
          contact: 'ads@instagram.com'
        },
        {
          id: 4,
          name: 'El Mercurio - Primera Página',
          type: 'print',
          capacity: 10,
          currentOccupancy: 90,
          basePrice: 20000,
          peakMultiplier: 1.0,
          description: 'Espacio premium en diario líder',
          features: ['Alto prestigio', 'Segmento ABC1', 'Circulación nacional'],
          contact: 'publicidad@emol.com'
        },
        {
          id: 5,
          name: 'Google Ads - Search',
          type: 'digital',
          capacity: 500,
          currentOccupancy: 70,
          basePrice: 25000,
          peakMultiplier: 1.4,
          description: 'Posicionamiento en búsquedas premium',
          features: ['Segmento por intención', 'PPC', 'Analytics avanzado'],
          contact: 'ads@google.com'
        },
        {
          id: 6,
          name: 'Billboard Costanera',
          type: 'outdoor',
          capacity: 20,
          currentOccupancy: 95,
          basePrice: 35000,
          peakMultiplier: 1.2,
          description: 'Ubicación premium en alta circulación',
          features: ['Alta visibilidad', 'LED digital', '24/7'],
          contact: 'publicidad@exterior.cl'
        }
      ];
      
      setMediaData(mockMediaData);
    } catch (error) {
      console.error('Error cargando datos de medios:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      // Simular carga de reservas - en producción vendría de Supabase
      const mockBookings = [
        {
          id: 1,
          mediaId: 1,
          mediaName: 'Canal 13 - Prime Time',
          clientName: 'TechCorp',
          campaignName: 'Lanzamiento Verano 2024',
          startDate: new Date('2024-01-20'),
          endDate: new Date('2024-01-25'),
          status: 'confirmed',
          totalAmount: 750000,
          occupancyPercentage: 15
        },
        {
          id: 2,
          mediaId: 2,
          mediaName: 'Radio Cooperativa - Mañana',
          clientName: 'RetailStore',
          campaignName: 'Ofertas Semanales',
          startDate: new Date('2024-01-18'),
          endDate: new Date('2024-01-22'),
          status: 'confirmed',
          totalAmount: 180000,
          occupancyPercentage: 12
        },
        {
          id: 3,
          mediaId: 3,
          mediaName: 'Instagram - Stories',
          clientName: 'FashionBrand',
          campaignName: 'Colección Primavera',
          startDate: new Date('2024-01-19'),
          endDate: new Date('2024-01-21'),
          status: 'pending',
          totalAmount: 90000,
          occupancyPercentage: 8
        }
      ];
      
      setBookings(mockBookings);
    } catch (error) {
      console.error('Error cargando reservas:', error);
    }
  };

  const getOccupancyStatus = (occupancyPercentage) => {
    if (occupancyPercentage === 0) return occupancyStatus.available;
    if (occupancyPercentage <= 25) return occupancyStatus.low;
    if (occupancyPercentage <= 50) return occupancyStatus.medium;
    if (occupancyPercentage <= 75) return occupancyStatus.high;
    return occupancyStatus.full;
  };

  const calculateDynamicPrice = (media, date) => {
    const mediaType = mediaTypes[media.type];
    let price = media.basePrice;
    
    // Multiplicador por horario pico
    const hour = date.getHours();
    const peakHours = mediaType.peakHours.split(', ');
    const isPeakTime = peakHours.some(range => {
      if (range === 'N/A') return false;
      const [start, end] = range.split('-');
      const currentHour = hour;
      return currentHour >= parseInt(start) && currentHour <= parseInt(end);
    });
    
    if (isPeakTime) {
      price *= media.peakMultiplier;
    }
    
    // Multiplicador por demanda (ocupación alta = precio más alto)
    const demandMultiplier = 1 + (media.currentOccupancy / 100) * 0.5;
    price *= demandMultiplier;
    
    return Math.round(price);
  };

  const getMediaAvailability = (mediaId, startDate, endDate) => {
    const media = mediaData.find(m => m.id === mediaId);
    if (!media) return null;
    
    const mediaBookings = bookings.filter(b => 
      b.mediaId === mediaId && 
      b.status === 'confirmed' &&
      ((startDate >= b.startDate && startDate <= b.endDate) ||
       (endDate >= b.startDate && endDate <= b.endDate) ||
       (startDate <= b.startDate && endDate >= b.endDate))
    );
    
    const totalOccupancy = mediaBookings.reduce((sum, booking) => 
      sum + booking.occupancyPercentage, 0
    );
    
    const availablePercentage = Math.max(0, 100 - totalOccupancy);
    
    return {
      available: availablePercentage > 0,
      availablePercentage,
      totalOccupancy,
      suggestedPrice: calculateDynamicPrice(media, startDate),
      conflicts: mediaBookings
    };
  };

  const filterMedia = () => {
    return mediaData.filter(media => {
      if (filters.mediaType !== 'todos' && media.type !== filters.mediaType) return false;
      
      const status = getOccupancyStatus(media.currentOccupancy);
      if (filters.status !== 'todos' && status.label !== filters.status) return false;
      
      return true;
    });
  };

  const getOptimalMedia = (budget, targetAudience) => {
    const availableMedia = filterMedia().filter(media => {
      const availability = getMediaAvailability(media.id, selectedDate, selectedDate);
      return availability && availability.available;
    });
    
    return availableMedia
      .map(media => ({
        ...media,
        score: calculateMediaScore(media, budget, targetAudience),
        suggestedPrice: calculateDynamicPrice(media, selectedDate)
      }))
      .sort((a, b) => b.score - a.score);
  };

  const calculateMediaScore = (media, budget, targetAudience) => {
    let score = 0;
    
    // Puntuación por disponibilidad
    const availability = 100 - media.currentOccupancy;
    score += availability * 0.3;
    
    // Puntuación por precio
    const priceScore = Math.max(0, 100 - (media.basePrice / budget) * 100);
    score += priceScore * 0.4;
    
    // Puntuación por tipo de medio (simulado)
    const typeScores = { tv: 90, digital: 85, social: 80, radio: 70, outdoor: 65, print: 60 };
    score += typeScores[media.type] * 0.3;
    
    return Math.round(score);
  };

  const filteredMedia = filterMedia();

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Cargando calendario de medios...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Calendario de Ocupación de Medios
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestiona la disponibilidad y optimiza la ocupación de todos los medios publicitarios
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setAvailabilityDialog(true)}
          >
            Filtros
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => {
              loadMediaData();
              loadBookings();
            }}
          >
            Actualizar
          </Button>
        </Box>
      </Box>

      {/* Alertas de ocupación crítica */}
      {filteredMedia.some(media => media.currentOccupancy >= 90) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Alta ocupación detectada</AlertTitle>
          Algunos medios están接近 su capacidad máxima. Considera aumentar precios o activar medios alternativos.
        </Alert>
      )}

      {/* Controles de vista */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="body2">Vista:</Typography>
        <Button
          variant={viewMode === 'day' ? 'contained' : 'outlined'}
          size="small"
          startIcon={<DayViewIcon />}
          onClick={() => setViewMode('day')}
        >
          Día
        </Button>
        <Button
          variant={viewMode === 'week' ? 'contained' : 'outlined'}
          size="small"
          startIcon={<WeekViewIcon />}
          onClick={() => setViewMode('week')}
        >
          Semana
        </Button>
        <Button
          variant={viewMode === 'month' ? 'contained' : 'outlined'}
          size="small"
          startIcon={<MonthViewIcon />}
          onClick={() => setViewMode('month')}
        >
          Mes
        </Button>
      </Box>

      {/* Resumen de ocupación por tipo de medio */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resumen de Ocupación por Tipo
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(mediaTypes).map(([type, config]) => {
            const typeMedia = filteredMedia.filter(m => m.type === type);
            const avgOccupancy = typeMedia.length > 0 
              ? typeMedia.reduce((sum, m) => sum + m.currentOccupancy, 0) / typeMedia.length 
              : 0;
            const status = getOccupancyStatus(avgOccupancy);
            
            return (
              <Grid item xs={12} sm={6} md={4} lg={2} key={type}>
                <Card sx={{ 
                  border: `2px solid ${status.color}`,
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 2 }
                }}>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      {config.icon}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {config.label}
                    </Typography>
                    <Typography variant="h6" color={status.color}>
                      {Math.round(avgOccupancy)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {status.label}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={avgOccupancy}
                      sx={{ mt: 1, height: 4 }}
                      color={avgOccupancy > 75 ? 'error' : avgOccupancy > 50 ? 'warning' : 'success'}
                    />
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Lista de medios con disponibilidad */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Disponibilidad Detallada
        </Typography>
        <Grid container spacing={3}>
          {filteredMedia.map((media) => {
            const mediaType = mediaTypes[media.type];
            const status = getOccupancyStatus(media.currentOccupancy);
            const availability = getMediaAvailability(media.id, selectedDate, selectedDate);
            const suggestedPrice = calculateDynamicPrice(media, selectedDate);
            
            return (
              <Grid item xs={12} md={6} lg={4} key={media.id}>
                <Card sx={{ 
                  height: '100%',
                  border: `2px solid ${status.color}`,
                  position: 'relative'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: mediaType.color }}>
                        {mediaType.icon}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                          {media.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {mediaType.label}
                        </Typography>
                      </Box>
                      <Chip
                        label={status.label}
                        size="small"
                        sx={{
                          backgroundColor: status.color,
                          color: 'white'
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {media.description}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Ocupación actual
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={media.currentOccupancy}
                        sx={{ height: 8, borderRadius: 4 }}
                        color={media.currentOccupancy > 75 ? 'error' : media.currentOccupancy > 50 ? 'warning' : 'success'}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {media.currentOccupancy}% ocupado ({media.capacity - media.currentOccupancy} espacios disponibles)
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Precio base
                        </Typography>
                        <Typography variant="h6">
                          ${media.basePrice.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Precio sugerido hoy
                        </Typography>
                        <Typography variant="h6" color="primary">
                          ${suggestedPrice.toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {media.features.map((feature, index) => (
                        <Chip
                          key={index}
                          label={feature}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={() => setSelectedMedia(media)}
                      >
                        Ver detalles
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        disabled={!availability?.available}
                      >
                        Reservar
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Diálogo de filtros */}
      <Dialog open={availabilityDialog} onClose={() => setAvailabilityDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Filtros de Búsqueda</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              select
              label="Tipo de medio"
              value={filters.mediaType}
              onChange={(e) => setFilters(prev => ({ ...prev, mediaType: e.target.value }))}
              fullWidth
            >
              <MenuItem value="todos">Todos los medios</MenuItem>
              {Object.entries(mediaTypes).map(([key, config]) => (
                <MenuItem key={key} value={key}>
                  {config.icon} {config.label}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              label="Estado de ocupación"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              fullWidth
            >
              <MenuItem value="todos">Todos los estados</MenuItem>
              {Object.entries(occupancyStatus).map(([key, config]) => (
                <MenuItem key={key} value={config.label}>
                  {config.icon} {config.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvailabilityDialog(false)}>Cancelar</Button>
          <Button onClick={() => setAvailabilityDialog(false)} variant="contained">
            Aplicar filtros
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MediaCalendar;