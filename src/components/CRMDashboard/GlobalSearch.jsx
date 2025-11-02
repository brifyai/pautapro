import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Divider,
  InputAdornment,
  Popover,
  Button,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  FormGroup
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  ShoppingCart as OrderIcon,
  Campaign as CampaignIcon,
  Category as ProductIcon,
  Assignment as PlanIcon,
  FilterList as FilterIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import searchService from '../../services/searchService';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchSettings, setSearchSettings] = useState({
    types: ['client', 'order', 'campaign', 'product', 'plan'],
    limit: 20,
    sortBy: 'relevance',
    showSuggestions: true,
    showHistory: true
  });
  
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  useEffect(() => {
    loadRecentSearches();
    
    // Manejar atajo de teclado Ctrl+K
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadRecentSearches = () => {
    const searches = searchService.getRecentSearches();
    setRecentSearches(searches);
  };

  const handleSearchClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSearchClose = () => {
    setAnchorEl(null);
    setQuery('');
    setResults([]);
    setSuggestions([]);
  };

  const handleQueryChange = async (event) => {
    const newQuery = event.target.value;
    setQuery(newQuery);

    if (newQuery.trim().length >= 2) {
      await performSearch(newQuery);
    } else {
      setResults([]);
      setSuggestions([]);
    }
  };

  const performSearch = async (searchQuery) => {
    try {
      setLoading(true);
      const searchResults = await searchService.search(searchQuery, searchSettings);
      setResults(searchResults.results);
      setSuggestions(searchResults.suggestions);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result) => {
    navigate(result.url);
    handleSearchClose();
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    performSearch(suggestion);
  };

  const handleRecentSearchClick = (search) => {
    setQuery(search);
    performSearch(search);
  };

  const handleClearHistory = () => {
    searchService.clearRecentSearches();
    setRecentSearches([]);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSettingsSave = () => {
    setSettingsOpen(false);
    // Guardar configuración si es necesario
  };

  const getTypeIcon = (type) => {
    const iconProps = { fontSize: 'small' };
    switch (type) {
      case 'client': return <BusinessIcon {...iconProps} />;
      case 'order': return <OrderIcon {...iconProps} />;
      case 'campaign': return <CampaignIcon {...iconProps} />;
      case 'product': return <ProductIcon {...iconProps} />;
      case 'plan': return <PlanIcon {...iconProps} />;
      default: return <SearchIcon {...iconProps} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'client': return 'primary';
      case 'order': return 'success';
      case 'campaign': return 'warning';
      case 'product': return 'info';
      case 'plan': return 'secondary';
      default: return 'default';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'client': return 'Cliente';
      case 'order': return 'Orden';
      case 'campaign': return 'Campaña';
      case 'product': return 'Producto';
      case 'plan': return 'Plan';
      default: return type;
    }
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <strong key={index}>{part}</strong> : part
    );
  };

  const renderSearchResults = () => {
    if (loading) {
      return <LinearProgress />;
    }

    if (query.length < 2) {
      return (
        <Box p={2}>
          <Typography variant="body2" color="textSecondary" align="center">
            Escribe al menos 2 caracteres para buscar
          </Typography>
        </Box>
      );
    }

    if (results.length === 0 && !loading) {
      return (
        <Box p={2}>
          <Typography variant="body2" color="textSecondary" align="center">
            No se encontraron resultados para "{query}"
          </Typography>
          {suggestions.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Sugerencias:
              </Typography>
              {suggestions.map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  sx={{ m: 0.5 }}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          )}
        </Box>
      );
    }

    return (
      <List dense>
        {results.map((result, index) => (
          <React.Fragment key={result.id}>
            <ListItemButton onClick={() => handleResultClick(result)}>
              <ListItemIcon>
                <Avatar sx={{ bgcolor: `${getTypeColor(result.type)}.main` }}>
                  {getTypeIcon(result.type)}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle2">
                      {highlightMatch(result.title, query)}
                    </Typography>
                    <Chip 
                      label={getTypeLabel(result.type)} 
                      size="small" 
                      color={getTypeColor(result.type)}
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {highlightMatch(result.subtitle, query)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {result.description}
                    </Typography>
                  </Box>
                }
              />
              <ArrowForwardIcon color="action" fontSize="small" />
            </ListItemButton>
            {index < results.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    );
  };

  const renderRecentSearches = () => {
    if (recentSearches.length === 0) {
      return (
        <Box p={2}>
          <Typography variant="body2" color="textSecondary" align="center">
            No hay búsquedas recientes
          </Typography>
        </Box>
      );
    }

    return (
      <List dense>
        {recentSearches.map((search, index) => (
          <React.Fragment key={index}>
            <ListItemButton onClick={() => handleRecentSearchClick(search)}>
              <ListItemIcon>
                <HistoryIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={search} />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  // Eliminar búsqueda específica
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </ListItemButton>
            {index < recentSearches.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    );
  };

  return (
    <Box>
      <TextField
        ref={searchRef}
        placeholder="Buscar global (Ctrl+K)..."
        variant="outlined"
        size="small"
        value={query}
        onChange={handleQueryChange}
        onClick={handleSearchClick}
        onFocus={handleSearchClick}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {query && (
                <IconButton size="small" onClick={() => setQuery('')}>
                  <ClearIcon />
                </IconButton>
              )}
              <Tooltip title="Configuración de búsqueda">
                <IconButton size="small" onClick={() => setSettingsOpen(true)}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
          sx: {
            bgcolor: 'background.paper',
            borderRadius: 2,
            minWidth: 300
          }
        }}
        sx={{ minWidth: 300 }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleSearchClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          style: { width: '500px', maxHeight: '600px' }
        }}
      >
        <Box>
          <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
            <Tab label="Resultados" />
            <Tab label="Recientes" />
          </Tabs>
          
          <Divider />
          
          {activeTab === 0 && renderSearchResults()}
          {activeTab === 1 && (
            <Box>
              <Box p={1} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">
                  Búsquedas recientes
                </Typography>
                <Button size="small" onClick={handleClearHistory}>
                  Limpiar
                </Button>
              </Box>
              {renderRecentSearches()}
            </Box>
          )}
        </Box>
      </Popover>

      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Configuración de Búsqueda</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={2}>
            <FormControl fullWidth>
              <InputLabel>Tipos de búsqueda</InputLabel>
              <Select
                multiple
                value={searchSettings.types}
                onChange={(e) => setSearchSettings({
                  ...searchSettings,
                  types: e.target.value
                })}
                renderValue={(selected) => (
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selected.map((value) => (
                      <Chip key={value} label={getTypeLabel(value)} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="client">Clientes</MenuItem>
                <MenuItem value="order">Órdenes</MenuItem>
                <MenuItem value="campaign">Campañas</MenuItem>
                <MenuItem value="product">Productos</MenuItem>
                <MenuItem value="plan">Planes</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={searchSettings.sortBy}
                onChange={(e) => setSearchSettings({
                  ...searchSettings,
                  sortBy: e.target.value
                })}
              >
                <MenuItem value="relevance">Relevancia</MenuItem>
                <MenuItem value="date">Fecha</MenuItem>
                <MenuItem value="name">Nombre</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Límite de resultados"
              type="number"
              value={searchSettings.limit}
              onChange={(e) => setSearchSettings({
                ...searchSettings,
                limit: parseInt(e.target.value)
              })}
              inputProps={{ min: 5, max: 100 }}
            />

            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={searchSettings.showSuggestions}
                    onChange={(e) => setSearchSettings({
                      ...searchSettings,
                      showSuggestions: e.target.checked
                    })}
                  />
                }
                label="Mostrar sugerencias"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={searchSettings.showHistory}
                    onChange={(e) => setSearchSettings({
                      ...searchSettings,
                      showHistory: e.target.checked
                    })}
                  />
                }
                label="Mostrar historial"
              />
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancelar</Button>
          <Button onClick={handleSettingsSave} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GlobalSearch;