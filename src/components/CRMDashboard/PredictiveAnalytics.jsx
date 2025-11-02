import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Alert,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Event as EventIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import predictiveAnalyticsService from '../../services/predictiveAnalyticsService';

const PredictiveAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedClient, setSelectedClient] = useState('');
  const [clients, setClients] = useState([]);
  
  const [churnData, setChurnData] = useState([]);
  const [salesForecast, setSalesForecast] = useState(null);
  const [leadScores, setLeadScores] = useState([]);
  const [marketTrends, setMarketTrends] = useState(null);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    loadAnalyticsData();
    loadClients();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos de pronóstico de ventas
      const forecast = await predictiveAnalyticsService.predictSalesForecast(selectedPeriod, 12);
      setSalesForecast(forecast);
      
      // Cargar tendencias del mercado
      const trends = await predictiveAnalyticsService.analyzeMarketTrends();
      setMarketTrends(trends);
      
      // Cargar scores de leads para clientes activos
      await loadLeadScores();
      
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      // Simulación de carga de clientes
      const mockClients = [
        { id: '1', name: 'Empresa ABC', razonsocial: 'ABC S.A.' },
        { id: '2', name: 'Empresa XYZ', razonsocial: 'XYZ Ltda.' },
        { id: '3', name: 'Empresa DEF', razonsocial: 'DEF Corp.' }
      ];
      setClients(mockClients);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadLeadScores = async () => {
    try {
      const scores = [];
      for (const client of clients) {
        const score = await predictiveAnalyticsService.calculateLeadScore(client.id);
        scores.push({ ...score, clientName: client.name });
      }
      setLeadScores(scores);
    } catch (error) {
      console.error('Error loading lead scores:', error);
    }
  };

  const analyzeClientChurn = async () => {
    if (!selectedClient) return;
    
    try {
      const churnPrediction = await predictiveAnalyticsService.predictCustomerChurn(selectedClient);
      setChurnData(prev => [...prev.filter(c => c.clientId !== selectedClient), churnPrediction]);
    } catch (error) {
      console.error('Error analyzing client churn:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleClientChange = (event) => {
    setSelectedClient(event.target.value);
  };

  const handlePeriodChange = (event) => {
    setSelectedPeriod(event.target.value);
    loadAnalyticsData();
  };

  const handleViewDetails = (prediction) => {
    setSelectedPrediction(prediction);
    setDetailDialogOpen(true);
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'critical': return '#F44336';
      case 'high': return '#FF9800';
      case 'medium': return '#FFC107';
      case 'low': return '#4CAF50';
      case 'minimal': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const getLeadCategoryColor = (category) => {
    switch (category) {
      case 'hot': return '#F44336';
      case 'warm': return '#FF9800';
      case 'cool': return '#2196F3';
      case 'cold': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const renderSalesForecast = () => {
    if (!salesForecast) return null;

    const chartData = salesForecast.forecast.map(item => ({
      period: `Mes ${item.period}`,
      value: Math.round(item.value),
      lower: Math.round(item.confidenceIntervals?.[item.period - 1]?.lower || 0),
      upper: Math.round(item.confidenceIntervals?.[item.period - 1]?.upper || 0)
    }));

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Pronóstico de Ventas
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="body2" color="textSecondary">
              Precisión: {Math.round(salesForecast.accuracy)}%
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select value={selectedPeriod} onChange={handlePeriodChange}>
                <MenuItem value="monthly">Mensual</MenuItem>
                <MenuItem value="quarterly">Trimestral</MenuItem>
                <MenuItem value="yearly">Anual</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <RechartsTooltip />
              <Area
                type="monotone"
                dataKey="upper"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="value"
                stackId="2"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="lower"
                stackId="3"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
          
          <Box mt={2}>
            <Typography variant="body2" color="textSecondary">
              Tendencia de crecimiento: {salesForecast.trends?.growth > 0 ? '+' : ''}{Math.round(salesForecast.trends?.growth || 0)}%
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderChurnAnalysis = () => {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Análisis de Churn de Clientes
          </Typography>
          
          <Box display="flex" gap={2} mb={3}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Seleccionar Cliente</InputLabel>
              <Select value={selectedClient} onChange={handleClientChange} label="Seleccionar Cliente">
                {clients.map(client => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={analyzeClientChurn}
              disabled={!selectedClient}
              startIcon={<AssessmentIcon />}
            >
              Analizar
            </Button>
          </Box>

          {churnData.length > 0 && (
            <List>
              {churnData.map((churn) => (
                <React.Fragment key={churn.clientId}>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: getRiskLevelColor(churn.riskLevel) }}>
                        <WarningIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={`Cliente: ${clients.find(c => c.id === churn.clientId)?.name || 'Desconocido'}`}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Probabilidad de Churn: {Math.round(churn.churnProbability)}%
                          </Typography>
                          <Chip
                            label={churn.riskLevel}
                            size="small"
                            sx={{
                              bgcolor: getRiskLevelColor(churn.riskLevel),
                              color: 'white',
                              mt: 1
                            }}
                          />
                        </Box>
                      }
                    />
                    <IconButton onClick={() => handleViewDetails(churn)}>
                      <VisibilityIcon />
                    </IconButton>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderLeadScoring = () => {
    const scoreDistribution = leadScores.reduce((acc, lead) => {
      acc[lead.category] = (acc[lead.category] || 0) + 1;
      return acc;
    }, {});

    const pieData = Object.entries(scoreDistribution).map(([category, count]) => ({
      name: category,
      value: count,
      color: getLeadCategoryColor(category)
    }));

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Scoring de Leads
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Leads por Categoría
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Categoría</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leadScores.slice(0, 5).map((lead) => (
                      <TableRow key={lead.clientId}>
                        <TableCell>{lead.clientName}</TableCell>
                        <TableCell>{Math.round(lead.totalScore)}</TableCell>
                        <TableCell>
                          <Chip
                            label={lead.category}
                            size="small"
                            sx={{
                              bgcolor: getLeadCategoryColor(lead.category),
                              color: 'white'
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderMarketTrends = () => {
    if (!marketTrends) return null;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Tendencias del Mercado
          </Typography>
          
          <Box mb={3}>
            {marketTrends.insights?.slice(0, 3).map((insight, index) => (
              <Alert key={index} severity="info" sx={{ mb: 1 }}>
                <Typography variant="body2">{insight}</Typography>
              </Alert>
            ))}
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Índices de Tendencia
          </Typography>
          <Grid container spacing={2}>
            {marketTrends.trendIndices && Object.entries(marketTrends.trendIndices).map(([key, value]) => (
              <Grid item xs={6} md={3} key={key}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6">
                    {Math.round(value)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {key}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Análisis Predictivo
      </Typography>

      <Box mb={3}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Ventas" />
          <Tab label="Churn" />
          <Tab label="Lead Scoring" />
          <Tab label="Mercado" />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {tabValue === 0 && (
          <Grid item xs={12}>
            {renderSalesForecast()}
          </Grid>
        )}
        
        {tabValue === 1 && (
          <Grid item xs={12}>
            {renderChurnAnalysis()}
          </Grid>
        )}
        
        {tabValue === 2 && (
          <Grid item xs={12}>
            {renderLeadScoring()}
          </Grid>
        )}
        
        {tabValue === 3 && (
          <Grid item xs={12}>
            {renderMarketTrends()}
          </Grid>
        )}
      </Grid>

      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles de Predicción</DialogTitle>
        <DialogContent>
          {selectedPrediction && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedPrediction.clientId && `Cliente: ${clients.find(c => c.id === selectedPrediction.clientId)?.name}`}
              </Typography>
              
              {selectedPrediction.churnProbability !== undefined && (
                <Box mb={2}>
                  <Typography variant="subtitle2">Probabilidad de Churn</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={selectedPrediction.churnProbability}
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    {Math.round(selectedPrediction.churnProbability)}% - {selectedPrediction.riskLevel}
                  </Typography>
                </Box>
              )}

              {selectedPrediction.recommendations && (
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>Recomendaciones</Typography>
                  <List>
                    {selectedPrediction.recommendations.map((rec, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          {rec.priority === 'urgent' && <WarningIcon color="error" />}
                          {rec.priority === 'high' && <WarningIcon color="warning" />}
                          {rec.priority === 'medium' && <InfoIcon color="info" />}
                          {rec.priority === 'low' && <CheckCircleIcon color="success" />}
                        </ListItemIcon>
                        <ListItemText
                          primary={rec.action}
                          secondary={rec.reason}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PredictiveAnalytics;