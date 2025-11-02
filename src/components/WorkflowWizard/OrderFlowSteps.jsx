import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import {
  Box,
  TextField,
  Autocomplete,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const OrderFlowSteps = ({ step, workflowData, setWorkflowData, onStepComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [campanas, setCampanas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedCampana, setSelectedCampana] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    if (step === 0) {
      fetchClientes();
    }
  }, [step]);

  useEffect(() => {
    if (selectedCliente && step === 1) {
      fetchCampanas();
    }
  }, [selectedCliente, step]);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('id_cliente, nombrecliente, rut, razonsocial')
        .order('nombrecliente');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      setError('Error al cargar clientes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampanas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('campania')
        .select(`
          *,
          productos!id_producto (
            id,
            nombredelproducto
          ),
          anios!id_anio (
            id,
            years
          )
        `)
        .eq('id_cliente', selectedCliente.id_cliente)
        .order('nombrecampania');

      if (error) throw error;
      setCampanas(data || []);
    } catch (error) {
      setError('Error al cargar campañas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClienteSelect = (cliente) => {
    setSelectedCliente(cliente);
    setWorkflowData(prev => ({ ...prev, cliente }));
    onStepComplete();
  };

  const handleCampanaSelect = (campana) => {
    setSelectedCampana(campana);
    setWorkflowData(prev => ({ ...prev, campana }));
    onStepComplete();
  };

  const addOrderItem = () => {
    const newItem = {
      id: Date.now(),
      producto: '',
      cantidad: 1,
      precio_unitario: 0,
      descuento: 0,
      total: 0
    };
    setOrderItems([...orderItems, newItem]);
  };

  const updateOrderItem = (id, field, value) => {
    setOrderItems(items => 
      items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'cantidad' || field === 'precio_unitario' || field === 'descuento') {
            updatedItem.total = (updatedItem.cantidad * updatedItem.precio_unitario) - updatedItem.descuento;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const removeOrderItem = (id) => {
    setOrderItems(items => items.filter(item => item.id !== id));
  };

  const calculateOrderTotal = () => {
    return orderItems.reduce((total, item) => total + item.total, 0);
  };

  // Renderizado según el paso actual
  const renderStepContent = () => {
    switch (step) {
      case 0: // Seleccionar Cliente
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Paso 1: Seleccionar Cliente
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Busca y selecciona el cliente para esta orden. Puedes usar el buscador para encontrar rápidamente al cliente.
            </Typography>
            
            <Autocomplete
              options={clientes}
              getOptionLabel={(option) => `${option.nombrecliente} - ${option.razonsocial}`}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="subtitle1">{option.nombrecliente}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.razonsocial} • RUT: {option.rut}
                    </Typography>
                  </Box>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar cliente..."
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              )}
              onChange={(event, newValue) => {
                if (newValue) {
                  handleClienteSelect(newValue);
                }
              }}
              loading={loading}
              fullWidth
            />

            {selectedCliente && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Cliente Seleccionado
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Nombre</Typography>
                      <Typography variant="body1">{selectedCliente.nombrecliente}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Razón Social</Typography>
                      <Typography variant="body1">{selectedCliente.razonsocial}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">RUT</Typography>
                      <Typography variant="body1">{selectedCliente.rut}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case 1: // Elegir Campaña
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Paso 2: Elegir Campaña
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Selecciona la campaña asociada a esta orden. Solo se muestran las campañas del cliente seleccionado.
            </Typography>

            <Typography variant="subtitle1" gutterBottom>
              Cliente: {selectedCliente?.nombrecliente}
            </Typography>

            <Grid container spacing={2}>
              {campanas.map((campana) => (
                <Grid item xs={12} md={6} key={campana.id_campania}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => handleCampanaSelect(campana)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {campana.nombrecampania}
                      </Typography>
                      <Box display="flex" gap={1} mb={2}>
                        <Chip label={campana.anios?.years} size="small" color="primary" />
                        <Chip label={campana.productos?.nombredelproducto} size="small" variant="outlined" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {campana.descripcion || 'Sin descripción'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {selectedCampana && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Campaña Seleccionada
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Campaña</Typography>
                      <Typography variant="body1">{selectedCampana.nombrecampania}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Año</Typography>
                      <Typography variant="body1">{selectedCampana.anios?.years}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Producto</Typography>
                      <Typography variant="body1">{selectedCampana.productos?.nombredelproducto}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case 2: // Configurar Productos
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Paso 3: Configurar Productos
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Agrega los productos que incluirá esta orden. Puedes especificar cantidad, precio unitario y descuentos.
            </Typography>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addOrderItem}
              sx={{ mb: 3 }}
            >
              Agregar Producto
            </Button>

            {orderItems.length > 0 && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="center">Cantidad</TableCell>
                      <TableCell align="right">Precio Unitario</TableCell>
                      <TableCell align="right">Descuento</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Nombre del producto"
                            value={item.producto}
                            onChange={(e) => updateOrderItem(item.id, 'producto', e.target.value)}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            size="small"
                            value={item.cantidad}
                            onChange={(e) => updateOrderItem(item.id, 'cantidad', parseInt(e.target.value) || 0)}
                            inputProps={{ min: 1, style: { textAlign: 'center' } }}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={item.precio_unitario}
                            onChange={(e) => updateOrderItem(item.id, 'precio_unitario', parseFloat(e.target.value) || 0)}
                            inputProps={{ min: 0, step: 0.01, style: { textAlign: 'right' } }}
                            sx={{ width: 100 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={item.descuento}
                            onChange={(e) => updateOrderItem(item.id, 'descuento', parseFloat(e.target.value) || 0)}
                            inputProps={{ min: 0, step: 0.01, style: { textAlign: 'right' } }}
                            sx={{ width: 100 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight="bold">
                            ${item.total.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            onClick={() => removeOrderItem(item.id)}
                            size="small"
                          >
                            <RemoveIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} align="right">
                        <Typography variant="h6">Total:</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" color="primary">
                          ${calculateOrderTotal().toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {orderItems.length > 0 && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    setWorkflowData(prev => ({ ...prev, items: orderItems, total: calculateOrderTotal() }));
                    onStepComplete();
                  }}
                >
                  Continuar
                </Button>
              </Box>
            )}
          </Box>
        );

      case 3: // Revisar Detalles
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Paso 4: Revisar Detalles de la Orden
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Revisa cuidadosamente todos los detalles de la orden antes de confirmar.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Información del Cliente
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1"><strong>Nombre:</strong> {workflowData.cliente?.nombrecliente}</Typography>
                    <Typography variant="body1"><strong>Razón Social:</strong> {workflowData.cliente?.razonsocial}</Typography>
                    <Typography variant="body1"><strong>RUT:</strong> {workflowData.cliente?.rut}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Información de la Campaña
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1"><strong>Campaña:</strong> {workflowData.campana?.nombrecampania}</Typography>
                    <Typography variant="body1"><strong>Año:</strong> {workflowData.campana?.anios?.years}</Typography>
                    <Typography variant="body1"><strong>Producto:</strong> {workflowData.campana?.productos?.nombredelproducto}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Detalles de Productos
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Producto</TableCell>
                            <TableCell align="center">Cantidad</TableCell>
                            <TableCell align="right">Precio Unitario</TableCell>
                            <TableCell align="right">Descuento</TableCell>
                            <TableCell align="right">Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {workflowData.items?.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.producto}</TableCell>
                              <TableCell align="center">{item.cantidad}</TableCell>
                              <TableCell align="right">${item.precio_unitario.toFixed(2)}</TableCell>
                              <TableCell align="right">${item.descuento.toFixed(2)}</TableCell>
                              <TableCell align="right">${item.total.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={4} align="right">
                              <Typography variant="h6">Total de la Orden:</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="h6" color="primary">
                                ${workflowData.total?.toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="large"
                onClick={onStepComplete}
              >
                Confirmar y Crear Orden
              </Button>
            </Box>
          </Box>
        );

      case 4: // Confirmar Orden
        return (
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom>
              Paso 5: Confirmar Orden
            </Typography>
            <Alert severity="success" sx={{ mb: 3 }}>
              ¡Orden creada exitosamente!
            </Alert>
            <Typography variant="body1" paragraph>
              La orden ha sido creada y está lista para ser procesada.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Número de orden: #{Date.now()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total: ${workflowData.total?.toFixed(2)}
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box className="workflow-step-content">
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : (
        renderStepContent()
      )}
    </Box>
  );
};

export default OrderFlowSteps;