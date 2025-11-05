import React, { useState, useEffect } from 'react';
import './ConfiguracionIA.css';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Alert,
  AlertTitle,
  Box,
  Chip,
  Grid,
  Paper,
  Typography,
  IconButton,
  LinearProgress,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  SmartToy as AIIcon,
  Api as ApiIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Campaign as CampaignIcon,
  ShoppingCart as ShoppingCartIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { supabase } from '../../config/supabase';
import Swal from 'sweetalert2';

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement);

const ConfiguracionIA = () => {
  const [config, setConfig] = useState({
    groqApiKey: '',
    selectedModel: 'gemma2-9b-it',
    maxTokens: 4096,
    temperature: 0.7,
    aiEnabled: true,
    modules: {
      dashboard: true,
      planificacion: true,
      ordenes: true,
      campanas: true,
      reportes: true,
      asistenteIA: true
    }
  });

  const [stats, setStats] = useState({
    totalModels: 7,
    activeModules: 6,
    apiCallsToday: 0,
    lastOptimization: new Date()
  });

  const [pieData, setPieData] = useState({
    labels: ['Dashboard', 'Planificación', 'Órdenes', 'Campañas', 'Reportes', 'Asistente IA'],
    datasets: [{
      data: [16, 16, 16, 16, 16, 20],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'],
      borderWidth: 0,
    }]
  });

  const [barData, setBarData] = useState({
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [{
      label: 'Llamadas API',
      data: [12, 19, 15, 25, 22, 8, 5],
      backgroundColor: '#3b82f6',
      borderWidth: 0,
    }]
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Modelos disponibles de Groq
  const availableModels = [
    { value: 'gemma2-9b-it', label: 'Gemma 2 9B (Recomendado)', description: 'Modelo balanceado para análisis y recomendaciones' },
    { value: 'gemma-7b-it', label: 'Gemma 7B', description: 'Modelo rápido para tareas simples' },
    { value: 'llama3-8b-8192', label: 'Llama 3 8B', description: 'Modelo versátil con buen rendimiento' },
    { value: 'llama3-70b-8192', label: 'Llama 3 70B', description: 'Modelo avanzado para análisis complejos' },
    { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B', description: 'Modelo experto en razonamiento lógico' },
    { value: 'llama3-groq-8b-8192-tool-use-preview', label: 'Llama 3 8B Tool Use', description: 'Modelo con capacidades de herramientas' },
    { value: 'llama3-groq-70b-8192-tool-use-preview', label: 'Llama 3 70B Tool Use', description: 'Modelo avanzado con herramientas' }
  ];

  const pieOptions = {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          drawBorder: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Funciones donde se usa la IA
  const aiFunctions = [
    {
      module: 'Dashboard',
      icon: <DashboardIcon />,
      functions: [
        'Análisis de rentabilidad automática',
        'Recomendaciones de optimización',
        'Detección de oportunidades de mejora',
        'Análisis de tendencias'
      ]
    },
    {
      module: 'Planificación',
      icon: <AssessmentIcon />,
      functions: [
        'Generación automática de alternativas',
        'Optimización de presupuestos',
        'Análisis de competencia',
        'Recomendaciones estratégicas'
      ]
    },
    {
      module: 'Órdenes',
      icon: <ShoppingCartIcon />,
      functions: [
        'Cálculo inteligente de rentabilidad',
        'Optimización automática de precios',
        'Análisis de viabilidad',
        'Recomendaciones de mejora'
      ]
    },
    {
      module: 'Campañas',
      icon: <CampaignIcon />,
      functions: [
        'Análisis de rendimiento predictivo',
        'Optimización de targeting',
        'Recomendaciones de mejora',
        'Análisis de ROI'
      ]
    },
    {
      module: 'Reportes',
      icon: <AssessmentIcon />,
      functions: [
        'Generación automática de insights',
        'Análisis de tendencias avanzado',
        'Recomendaciones estratégicas',
        'Predicciones de rendimiento'
      ]
    },
    {
      module: 'AsistenteIA',
      icon: <AIIcon />,
      functions: [
        '🤖 Asistente IA PautaPro - Control total',
        'Procesamiento de lenguaje natural avanzado',
        'Ejecución de comandos de voz y texto',
        'Gestión inteligente de clientes y proveedores',
        'Análisis semántico y detección de intenciones',
        'Integración con todas las entidades del sistema'
      ]
    }
  ];

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      // Intentar cargar desde Supabase primero
      const { data, error } = await supabase
        .from('configuracion_ia')
        .select('*')
        .single();

      if (error && error.code === 'PGRST116') { // No rows returned - tabla existe pero está vacía
        // Usar configuración por defecto y guardarla en BD
        const defaultConfig = {
          groqApiKey: '',
          selectedModel: 'gemma2-9b-it',
          maxTokens: 4096,
          temperature: 0.7,
          aiEnabled: true,
          modules: {
            dashboard: true,
            planificacion: true,
            ordenes: true,
            campanas: true,
            reportes: true,
            asistenteIA: true
          }
        };

        // Intentar crear registro por defecto en BD
        try {
          const defaultConfigData = {
            groq_api_key: defaultConfig.groqApiKey,
            selected_model: defaultConfig.selectedModel,
            max_tokens: defaultConfig.maxTokens,
            temperature: defaultConfig.temperature,
            ai_enabled: defaultConfig.aiEnabled,
            modules: defaultConfig.modules,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          await supabase
            .from('configuracion_ia')
            .insert([defaultConfigData]);

          console.log('Configuración por defecto creada en BD');
        } catch (insertError) {
          console.warn('No se pudo crear configuración por defecto en BD:', insertError);
        }

        setConfig(defaultConfig);
        return;
      }

      if (error) {
        // Error diferente a "no rows" - tabla no existe o error de conexión
        console.error('Error cargando configuración de BD:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error de Base de Datos',
          text: 'No se pudo acceder a la configuración de IA. Verifica que la tabla configuracion_ia existe.',
          timer: 3000,
          showConfirmButton: false
        });

        // Usar configuración por defecto como último recurso
        setConfig({
          groqApiKey: '',
          selectedModel: 'gemma2-9b-it',
          maxTokens: 4096,
          temperature: 0.7,
          aiEnabled: true,
          modules: {
            dashboard: true,
            planificacion: true,
            ordenes: true,
            campanas: true,
            reportes: true,
            asistenteIA: true
          }
        });
        return;
      }

      // Configuración cargada exitosamente desde BD
      setConfig({
        groqApiKey: data.groq_api_key || '',
        selectedModel: data.selected_model || 'gemma2-9b-it',
        maxTokens: data.max_tokens || 4096,
        temperature: data.temperature || 0.7,
        aiEnabled: data.ai_enabled ?? true,
        modules: {
          dashboard: data.modules?.dashboard ?? true,
          planificacion: data.modules?.planificacion ?? true,
          ordenes: data.modules?.ordenes ?? true,
          campanas: data.modules?.campanas ?? true,
          reportes: data.modules?.reportes ?? true,
          asistenteIA: data.modules?.asistenteIA ?? true
        }
      });

    } catch (error) {
      console.error('Error loading config:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la configuración de IA'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const configData = {
        groq_api_key: config.groqApiKey,
        selected_model: config.selectedModel,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        ai_enabled: config.aiEnabled,
        modules: config.modules,
        updated_at: new Date().toISOString()
      };

      // Intentar guardar en Supabase
      const { error } = await supabase
        .from('configuracion_ia')
        .upsert(configData, { onConflict: 'id' });

      if (error) {
        console.error('Error guardando configuración en BD:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Error al Guardar',
          text: 'No se pudo guardar la configuración en la base de datos. Verifica que la tabla configuracion_ia existe.',
          timer: 3000,
          showConfirmButton: false
        });
        return;
      }

      // Éxito - configuración guardada en BD
      await Swal.fire({
        icon: 'success',
        title: 'Configuración Guardada',
        text: 'Los cambios han sido guardados exitosamente en la base de datos',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error saving config:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la configuración en la base de datos'
      });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!config.groqApiKey) {
      await Swal.fire({
        icon: 'warning',
        title: 'API Key Requerida',
        text: 'Por favor ingrese la API Key de Groq'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${config.groqApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Conexión Exitosa',
          text: 'La API Key de Groq es válida',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        throw new Error('API Key inválida');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error de Conexión',
        text: 'La API Key de Groq no es válida o hay problemas de conexión'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModuleToggle = (module) => {
    setConfig(prev => ({
      ...prev,
      modules: {
        ...prev.modules,
        [module]: !prev.modules[module]
      }
    }));
  };

  const getTrendIcon = (value) => {
    if (value > 0) return <TrendingUpIcon sx={{ color: 'green', fontSize: 16 }} />;
    if (value < 0) return <TrendingDownIcon sx={{ color: 'red', fontSize: 16 }} />;
    return null;
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return <ErrorIcon />;
      case 'warning': return <WarningIcon />;
      case 'success': return <CheckCircleIcon />;
      default: return <InfoIcon />;
    }
  };

  return (
    <div className="dashboard">
      {/* Header con última actualización */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
          <AIIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          CONFIGURACIÓN DE INTELIGENCIA ARTIFICIAL
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </Typography>
          <Tooltip title="Actualizar datos">
            <IconButton onClick={() => setLastUpdate(new Date())} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Grid de estadísticas mejoradas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Modelos Disponibles
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.totalModels}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {availableModels.length} modelos Groq
                    </Typography>
                  </Box>
                </Box>
                <AIIcon sx={{ fontSize: 40, color: '#3b82f6', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Módulos Activos
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.activeModules}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Chip
                      label={`${Object.values(config.modules).filter(Boolean).length} habilitados`}
                      size="small"
                      color="success"
                    />
                  </Box>
                </Box>
                <SettingsIcon sx={{ fontSize: 40, color: '#10b981', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Llamadas API Hoy
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.apiCallsToday}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Última: {stats.lastOptimization.toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
                <ApiIcon sx={{ fontSize: 40, color: '#f59e0b', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Estado del Sistema
                  </Typography>
                  <Typography variant="h4" component="div">
                    {config.aiEnabled ? 'Activo' : 'Inactivo'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      IA {config.aiEnabled ? 'habilitada' : 'deshabilitada'}
                    </Typography>
                  </Box>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: config.aiEnabled ? '#10b981' : '#ef4444', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Grid de gráficos y contenido */}
      <Grid container spacing={3}>
        {/* Configuración General */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Configuración General
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="API Key de Groq"
                    type="password"
                    value={config.groqApiKey}
                    onChange={(e) => setConfig(prev => ({ ...prev, groqApiKey: e.target.value }))}
                    helperText="Obtén tu API Key en https://console.groq.com/"
                    InputProps={{
                      startAdornment: <ApiIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Modelo de IA</InputLabel>
                    <Select
                      value={config.selectedModel}
                      onChange={(e) => setConfig(prev => ({ ...prev, selectedModel: e.target.value }))}
                      label="Modelo de IA"
                    >
                      {availableModels.map((model) => (
                        <MenuItem key={model.value} value={model.value}>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {model.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {model.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Máx. Tokens"
                    type="number"
                    value={config.maxTokens}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                    inputProps={{ min: 1, max: 32768 }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Temperatura"
                    type="number"
                    value={config.temperature}
                    onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    inputProps={{ min: 0, max: 2, step: 0.1 }}
                    helperText="0 = Determinista, 2 = Creativo"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.aiEnabled}
                        onChange={(e) => setConfig(prev => ({ ...prev, aiEnabled: e.target.checked }))}
                        color="primary"
                      />
                    }
                    label="Habilitar Inteligencia Artificial en todo el sistema"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Acciones Rápidas */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Acciones
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="outlined"
                  onClick={testConnection}
                  disabled={loading || !config.groqApiKey}
                  startIcon={<RefreshIcon />}
                  fullWidth
                >
                  {loading ? 'Probando...' : 'Probar Conexión'}
                </Button>

                <Button
                  variant="contained"
                  onClick={saveConfig}
                  disabled={saving}
                  startIcon={<SaveIcon sx={{ color: 'white !important' }} />}
                  fullWidth
                >
                  {saving ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Estado de la Configuración */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Chip
                  label={config.aiEnabled ? "IA Habilitada" : "IA Deshabilitada"}
                  color={config.aiEnabled ? "success" : "default"}
                  size="small"
                />
                <Chip
                  label={config.groqApiKey ? "API Key Configurada" : "API Key Requerida"}
                  color={config.groqApiKey ? "success" : "warning"}
                  size="small"
                />
                <Chip
                  label={`Modelo: ${availableModels.find(m => m.value === config.selectedModel)?.label || config.selectedModel}`}
                  color="info"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Módulos Habilitados */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Módulos con IA Habilitada
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(config.modules).map(([module, enabled]) => (
                  <Grid item xs={12} sm={6} md={4} key={module}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={enabled}
                          onChange={() => handleModuleToggle(module)}
                          color="primary"
                          disabled={!config.aiEnabled}
                        />
                      }
                      label={
                        <Typography variant="body2" fontWeight={500}>
                          {module === 'asistenteIA' ? '🤖 Asistente IA PautaPro' : module.charAt(0).toUpperCase() + module.slice(1)}
                        </Typography>
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Funciones de IA por Módulo */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Funciones de IA por Módulo
              </Typography>
              {aiFunctions.map((module, index) => {
                const moduleKey = module.module.toLowerCase();
                const isEnabled = config.modules[moduleKey] || config.modules[moduleKey.replace('asistenteia', 'asistenteIA')] || false;
                return (
                  <Accordion key={index} disabled={!isEnabled || !config.aiEnabled}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box display="flex" alignItems="center">
                        {module.icon}
                        <Typography variant="h6" sx={{ ml: 2 }}>
                          {module.module === 'AsistenteIA' ? '🤖 Asistente IA PautaPro' : module.module}
                        </Typography>
                        {!isEnabled && (
                          <Chip label="Deshabilitado" size="small" color="default" sx={{ ml: 2 }} />
                        )}
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {module.functions.map((func, funcIndex) => (
                          <ListItem key={funcIndex}>
                            <ListItemIcon>
                              <AIIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText primary={func} />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </div>
  );
};

export default ConfiguracionIA;