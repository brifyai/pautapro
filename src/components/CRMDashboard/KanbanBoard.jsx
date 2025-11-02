import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  Tooltip,
  Menu,
  Badge,
  LinearProgress,
  Alert,
  Fab,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  DragIndicator as DragIcon,
  Business as ClientIcon,
  ShoppingCart as OrderIcon,
  Campaign as CampaignIcon,
  Assignment as PlanIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  PriorityHigh as PriorityHighIcon,
  LowPriority as LowPriorityIcon,
  MediumPriority as MediumPriorityIcon,
  FilterList as FilterIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';

const KanbanBoard = () => {
  const [boardData, setBoardData] = useState({
    columns: {
      'pending': {
        id: 'pending',
        title: 'Pendiente',
        items: [],
        color: '#FFA726'
      },
      'in-progress': {
        id: 'in-progress',
        title: 'En Progreso',
        items: [],
        color: '#42A5F5'
      },
      'review': {
        id: 'review',
        title: 'En Revisión',
        items: [],
        color: '#AB47BC'
      },
      'completed': {
        id: 'completed',
        title: 'Completado',
        items: [],
        color: '#66BB6A'
      }
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // kanban, list, grid
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState(null);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    priority: 'all',
    assignee: 'all'
  });
  const [settings, setSettings] = useState({
    showAvatars: true,
    showBadges: true,
    compactMode: false,
    dragEnabled: true
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    loadKanbanData();
  }, []);

  const loadKanbanData = async () => {
    try {
      setLoading(true);
      
      // Simular carga de datos desde la API
      const mockData = {
        'pending': [
          {
            id: '1',
            type: 'order',
            title: 'Orden #1234',
            subtitle: 'Cliente: Empresa ABC',
            description: 'Orden de compra de productos digitales',
            priority: 'high',
            assignee: 'Juan Pérez',
            dueDate: '2024-01-15',
            tags: ['urgente', 'vip'],
            avatar: 'JP',
            color: '#F44336'
          },
          {
            id: '2',
            type: 'client',
            title: 'Nuevo Cliente XYZ',
            subtitle: 'Prospecto',
            description: 'Contactar para presentación de servicios',
            priority: 'medium',
            assignee: 'María García',
            dueDate: '2024-01-20',
            tags: ['nuevo', 'prospecto'],
            avatar: 'MG',
            color: '#2196F3'
          }
        ],
        'in-progress': [
          {
            id: '3',
            type: 'campaign',
            title: 'Campaña Verano 2024',
            subtitle: 'Marketing Digital',
            description: 'Campaña de redes sociales para verano',
            priority: 'high',
            assignee: 'Carlos López',
            dueDate: '2024-01-18',
            tags: ['marketing', 'verano'],
            avatar: 'CL',
            color: '#FF9800'
          }
        ],
        'review': [
          {
            id: '4',
            type: 'plan',
            title: 'Plan de Marketing Q1',
            subtitle: 'Estrategia',
            description: 'Revisar y aprobar plan trimestral',
            priority: 'low',
            assignee: 'Ana Martínez',
            dueDate: '2024-01-25',
            tags: ['estrategia', 'q1'],
            avatar: 'AM',
            color: '#4CAF50'
          }
        ],
        'completed': [
          {
            id: '5',
            type: 'order',
            title: 'Orden #1230',
            subtitle: 'Cliente: Empresa DEF',
            description: 'Orden completada y entregada',
            priority: 'medium',
            assignee: 'Luis Rodríguez',
            dueDate: '2024-01-10',
            tags: ['completado'],
            avatar: 'LR',
            color: '#9C27B0'
          }
        ]
      };

      setBoardData(prev => ({
        columns: {
          ...prev.columns,
          ...Object.keys(mockData).reduce((acc, key) => {
            acc[key] = {
              ...prev.columns[key],
              items: mockData[key]
            };
            return acc;
          }, {})
        }
      }));
    } catch (error) {
      console.error('Error loading kanban data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination || !settings.dragEnabled) return;

    const { source, destination } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const sourceColumn = boardData.columns[source.droppableId];
    const destColumn = boardData.columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);

    setBoardData(prev => ({
      columns: {
        ...prev.columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems
        }
      }
    }));

    // Aquí podrías actualizar el estado en la base de datos
    updateItemStatus(removed.id, destination.droppableId);
  };

  const updateItemStatus = async (itemId, newStatus) => {
    try {
      // Simular actualización en la base de datos
      console.log(`Updating item ${itemId} to status ${newStatus}`);
    } catch (error) {
      console.error('Error updating item status:', error);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setItemDialogOpen(true);
  };

  const handleFilterClick = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleSettingsClick = (event) => {
    setSettingsMenuAnchor(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsMenuAnchor(null);
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <PriorityHighIcon color="error" />;
      case 'medium': return <MediumPriorityIcon color="warning" />;
      case 'low': return <LowPriorityIcon color="success" />;
      default: return null;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'order': return <OrderIcon />;
      case 'client': return <ClientIcon />;
      case 'campaign': return <CampaignIcon />;
      case 'plan': return <PlanIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'order': return 'primary';
      case 'client': return 'success';
      case 'campaign': return 'warning';
      case 'plan': return 'info';
      default: return 'default';
    }
  };

  const renderKanbanCard = (item, index) => (
    <Draggable key={item.id} draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            mb: 2,
            cursor: settings.dragEnabled ? 'move' : 'pointer',
            transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: 3,
              transform: 'translateY(-2px)'
            }
          }}
          onClick={() => handleItemClick(item)}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            {settings.dragEnabled && (
              <Box {...provided.dragHandleProps} sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <DragIcon fontSize="small" color="action" />
              </Box>
            )}
            
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              {getPriorityIcon(item.priority)}
              <Typography variant="subtitle2" fontWeight="bold" noWrap>
                {item.title}
              </Typography>
            </Box>

            <Typography variant="body2" color="textSecondary" gutterBottom>
              {item.subtitle}
            </Typography>

            <Typography variant="caption" color="textSecondary" sx={{ 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 1
            }}>
              {item.description}
            </Typography>

            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Chip
                icon={getTypeIcon(item.type)}
                label={item.type}
                size="small"
                color={getTypeColor(item.type)}
                variant="outlined"
              />
              {settings.showBadges && (
                <Badge badgeContent={item.tags?.length || 0} color="secondary">
                  <Typography variant="caption">Etiquetas</Typography>
                </Badge>
              )}
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              {settings.showAvatars && (
                <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                  {item.avatar}
                </Avatar>
              )}
              <Typography variant="caption" color="textSecondary">
                {item.dueDate}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );

  const renderKanbanColumn = (column) => (
    <Paper
      sx={{
        minWidth: 300,
        bgcolor: 'grey.50',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          p: 2,
          bgcolor: column.color,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {column.title}
        </Typography>
        <Chip
          label={column.items.length}
          size="small"
          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
        />
      </Box>
      
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              p: 2,
              minHeight: 400,
              bgcolor: snapshot.isDraggingOver ? 'grey.100' : 'transparent',
              transition: 'background-color 0.2s ease'
            }}
          >
            {column.items.map((item, index) => renderKanbanCard(item, index))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Paper>
  );

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Tablero Kanban
        </Typography>
        
        <Box display="flex" gap={1}>
          <Tooltip title="Filtros">
            <IconButton onClick={handleFilterClick}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Vista">
            <IconButton onClick={handleSettingsClick}>
              {viewMode === 'kanban' ? <ViewModuleIcon /> : <ViewListIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Configuración">
            <IconButton onClick={() => setSettingsMenuAnchor(event.currentTarget)}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Box display="flex" gap={2} overflow="auto" pb={2}>
          {Object.values(boardData.columns).map(column => (
            <Box key={column.id}>
              {renderKanbanColumn(column)}
            </Box>
          ))}
        </Box>
      </DragDropContext>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => console.log('Add new item')}
      >
        <AddIcon />
      </Fab>

      {/* Menú de filtros */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={handleFilterClose}
      >
        <MenuItem onClick={handleFilterClose}>Todos los tipos</MenuItem>
        <MenuItem onClick={handleFilterClose}>Órdenes</MenuItem>
        <MenuItem onClick={handleFilterClose}>Clientes</MenuItem>
        <MenuItem onClick={handleFilterClose}>Campañas</MenuItem>
        <MenuItem onClick={handleFilterClose}>Planes</MenuItem>
      </Menu>

      {/* Menú de configuración */}
      <Menu
        anchorEl={settingsMenuAnchor}
        open={Boolean(settingsMenuAnchor)}
        onClose={handleSettingsClose}
      >
        <MenuItem onClick={() => setViewMode('kanban')}>
          Vista Kanban
        </MenuItem>
        <MenuItem onClick={() => setViewMode('list')}>
          Vista Lista
        </MenuItem>
        <MenuItem onClick={() => setViewMode('grid')}>
          Vista Cuadrícula
        </MenuItem>
        <Divider />
        <MenuItem>
          <FormControlLabel
            control={
              <Switch
                checked={settings.dragEnabled}
                onChange={(e) => setSettings({
                  ...settings,
                  dragEnabled: e.target.checked
                })}
                size="small"
              />
            }
            label="Arrastrar elementos"
          />
        </MenuItem>
        <MenuItem>
          <FormControlLabel
            control={
              <Switch
                checked={settings.showAvatars}
                onChange={(e) => setSettings({
                  ...settings,
                  showAvatars: e.target.checked
                })}
                size="small"
              />
            }
            label="Mostrar avatares"
          />
        </MenuItem>
      </Menu>

      {/* Diálogo de detalles del item */}
      <Dialog open={itemDialogOpen} onClose={() => setItemDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedItem?.title}
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box>
              <Typography variant="body1" gutterBottom>
                {selectedItem.description}
              </Typography>
              <Box display="flex" gap={1} mt={2}>
                <Chip label={selectedItem.type} color={getTypeColor(selectedItem.type)} />
                <Chip label={selectedItem.priority} />
                <Chip label={selectedItem.assignee} />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialogOpen(false)}>Cerrar</Button>
          <Button variant="contained" onClick={() => {
            if (selectedItem) {
              navigate(`/ordenes/${selectedItem.id}`);
              setItemDialogOpen(false);
            }
          }}>
            Ver Detalles
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KanbanBoard;