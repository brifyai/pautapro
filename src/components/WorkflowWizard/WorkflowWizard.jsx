import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Container,
  Paper,
  IconButton,
  Fade,
  Grow,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  Home as HomeIcon,
  AddShoppingCart as OrderIcon,
  Campaign as CampaignIcon,
  People as PeopleIcon,
  Assignment as PlanIcon,
  Lightbulb as LightbulbIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import OrderFlowSteps from './OrderFlowSteps';
import './WorkflowWizard.css';

const WorkflowWizard = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [workflowData, setWorkflowData] = useState({});
  const [showWelcome, setShowWelcome] = useState(true);

  const workflows = [
    {
      id: 'order',
      title: 'Crear Nueva Orden',
      description: 'Guía paso a paso para crear una nueva orden de compra',
      icon: <OrderIcon />,
      color: '#4CAF50',
      steps: [
        'Seleccionar Cliente',
        'Elegir Campaña',
        'Configurar Productos',
        'Revisar Detalles',
        'Confirmar Orden'
      ]
    },
    {
      id: 'planning',
      title: 'Planificación de Medios',
      description: 'Asistente para planificar campañas y medios',
      icon: <CampaignIcon />,
      color: '#2196F3',
      steps: [
        'Seleccionar Cliente',
        'Elegir Campaña',
        'Definir Plan',
        'Configurar Temas',
        'Crear Alternativas',
        'Revisar Planificación'
      ]
    },
    {
      id: 'client',
      title: 'Gestión de Clientes',
      description: 'Administrar información de clientes',
      icon: <PeopleIcon />,
      color: '#FF9800',
      steps: [
        'Buscar Cliente',
        'Ver/Editar Datos',
        'Historial de Órdenes',
        'Actualizar Información'
      ]
    }
  ];

  const handleFlowSelect = (flow) => {
    setSelectedFlow(flow);
    setShowWelcome(false);
    setActiveStep(0);
  };

  const handleNext = () => {
    if (selectedFlow && activeStep < selectedFlow.steps.length - 1) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prevStep) => prevStep - 1);
    } else {
      setShowWelcome(true);
      setSelectedFlow(null);
      setActiveStep(0);
    }
  };

  const handleReset = () => {
    setShowWelcome(true);
    setSelectedFlow(null);
    setActiveStep(0);
    setWorkflowData({});
  };

  const handleComplete = () => {
    // Lógica para completar el flujo
    console.log('Flujo completado:', selectedFlow.id, workflowData);
    // Navegar a la página correspondiente
    switch (selectedFlow.id) {
      case 'order':
        navigate('/ordenes/crear');
        break;
      case 'planning':
        navigate('/planificacion');
        break;
      case 'client':
        navigate('/clientes');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const renderWelcomeScreen = () => (
    <Container maxWidth="md">
      <Fade in={showWelcome} timeout={800}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Box textAlign="center" mb={4}>
            <Avatar sx={{ 
              bgcolor: 'primary.main', 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 2 
            }}>
              <LightbulbIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              ¡Bienvenido al Asistente Inteligente!
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              Te guiaré paso a paso para completar tus tareas de forma sencilla y rápida.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Selecciona una de las siguientes opciones para comenzar:
            </Typography>
          </Box>

          <List>
            {workflows.map((workflow, index) => (
              <Slide 
                in={showWelcome} 
                direction="up" 
                timeout={600 + index * 100}
                key={workflow.id}
              >
                <Card 
                  sx={{ 
                    mb: 2, 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                  onClick={() => handleFlowSelect(workflow)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={3}>
                      <Avatar sx={{ bgcolor: workflow.color, width: 60, height: 60 }}>
                        {workflow.icon}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                          {workflow.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {workflow.description}
                        </Typography>
                        <Box mt={1}>
                          <Chip 
                            label={`${workflow.steps.length} pasos`} 
                            size="small" 
                            variant="outlined"
                            color="primary"
                          />
                        </Box>
                      </Box>
                      <ArrowForwardIcon color="action" />
                    </Box>
                  </CardContent>
                </Card>
              </Slide>
            ))}
          </List>

          <Box textAlign="center" mt={4}>
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/dashboard')}
              size="large"
            >
              Volver al Dashboard
            </Button>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );

  const renderWorkflowStep = () => {
    if (!selectedFlow) return null;

    const currentStep = selectedFlow.steps[activeStep];
    const progress = ((activeStep + 1) / selectedFlow.steps.length) * 100;

    return (
      <Container maxWidth="lg">
        <Grow in={!!selectedFlow} timeout={500}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            {/* Header con progreso */}
            <Box mb={4}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ bgcolor: selectedFlow.color }}>
                  {selectedFlow.icon}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {selectedFlow.title}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="body2" color="text.secondary">
                      Paso {activeStep + 1} de {selectedFlow.steps.length}
                    </Typography>
                    <Chip 
                      label={`${Math.round(progress)}% completado`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Box>
                <IconButton onClick={handleReset} color="action">
                  <HomeIcon />
                </IconButton>
              </Box>

              {/* Stepper visual */}
              <Stepper 
                activeStep={activeStep} 
                alternativeLabel
                sx={{ mb: 3 }}
              >
                {selectedFlow.steps.map((step, index) => (
                  <Step key={index}>
                    <StepLabel>{step}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Barra de progreso */}
              <Box 
                sx={{ 
                  height: 4, 
                  bgcolor: 'grey.200', 
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <Box 
                  sx={{ 
                    height: '100%', 
                    bgcolor: selectedFlow.color,
                    width: `${progress}%`,
                    transition: 'width 0.5s ease'
                  }}
                />
              </Box>
            </Box>

            {/* Contenido del paso actual */}
            <Box mb={4}>
              <Typography variant="h6" gutterBottom sx={{ color: selectedFlow.color }}>
                {currentStep}
              </Typography>
              
              {/* Renderizar contenido específico según el flujo seleccionado */}
              <Box sx={{
                minHeight: 300,
                p: 3,
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: '2px dashed',
                borderColor: 'grey.300'
              }}>
                {selectedFlow.id === 'order' ? (
                  <OrderFlowSteps
                    step={activeStep}
                    workflowData={workflowData}
                    setWorkflowData={setWorkflowData}
                    onStepComplete={handleNext}
                  />
                ) : (
                  <Box>
                    <Typography variant="body1" color="text.secondary" textAlign="center">
                      Contenido del paso: {currentStep}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
                      Este flujo estará disponible próximamente
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Botones de navegación */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                size="large"
              >
                {activeStep === 0 ? 'Cambiar Flujo' : 'Anterior'}
              </Button>

              <Box display="flex" gap={2}>
                <Button
                  variant="text"
                  onClick={() => navigate('/dashboard')}
                  color="secondary"
                >
                  Cancelar
                </Button>
                
                {activeStep === selectedFlow.steps.length - 1 ? (
                  <Button
                    variant="contained"
                    endIcon={<CheckIcon />}
                    onClick={handleComplete}
                    size="large"
                    sx={{ bgcolor: selectedFlow.color }}
                  >
                    Completar
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleNext}
                    size="large"
                    sx={{ bgcolor: selectedFlow.color }}
                  >
                    Siguiente
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Grow>
      </Container>
    );
  };

  return (
    <Box className="workflow-wizard" sx={{ minHeight: '100vh', py: 3, bgcolor: 'background.default' }}>
      {showWelcome ? renderWelcomeScreen() : renderWorkflowStep()}
    </Box>
  );
};

export default WorkflowWizard;