import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BugReportIcon from '@mui/icons-material/BugReport';

const ClienteDebugInfo = ({ open, onClose, clienteId }) => {
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && clienteId) {
      fetchDebugInfo();
    }
  }, [open, clienteId]);

  const fetchDebugInfo = async () => {
    setLoading(true);
    try {
      // 1. Obtener cliente específico
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id_cliente', clienteId)
        .single();

      // 2. Obtener todos los clientes para comparar
      const { data: todosClientes, error: todosError } = await supabase
        .from('clientes')
        .select('*')
        .limit(5);

      // 3. Analizar estructura
      const estructura = cliente ? Object.keys(cliente) : [];

      setDebugData({
        cliente: cliente || null,
        todosLosClientes: todosClientes || [],
        estructura: estructura,
        errores: {
          cliente: clienteError?.message,
          todos: todosError?.message
        }
      });
    } catch (error) {
      console.error('Error en debug:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCampoComparacion = (campo) => {
    const nombresAlternativos = {
      'razonsocial': ['razonSocial', 'razon_social'],
      'rut': ['RUT'],
      'direccion': ['direccionEmpresa', 'direccion_empresa'],
      'nombrerepresentantelegal': ['nombreRepresentanteLegal', 'nombre_representante_legal'],
      'apellidorepresentante': ['apellidoRepresentante', 'apellido_representante']
    };

    const alternativos = nombresAlternativos[campo] || [];
    const tieneAlternativos = alternativos.some(alt => debugData?.cliente?.[alt] !== undefined);

    return (
      <Box key={campo} sx={{ mb: 1 }}>
        <Typography variant="body2" component="span">
          <strong>{campo}:</strong> {debugData?.cliente?.[campo] !== undefined ? 
            `${debugData.cliente[campo]} (${typeof debugData.cliente[campo]})` : 
            <Chip label="NO ENCONTRADO" size="small" color="error" />
          }
        </Typography>
        {tieneAlternativos && (
          <Typography variant="caption" display="block" sx={{ ml: 2 }}>
            Alternativos: {alternativos.map(alt => 
              `${alt}: ${debugData?.cliente?.[alt] || 'undefined'}`
            ).join(' | ')}
          </Typography>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>Cargando información de depuración...</DialogTitle>
        <DialogContent>
          <Typography>Cargando datos del cliente...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <BugReportIcon sx={{ mr: 1 }} />
          Depuración de Cliente ID: {clienteId}
        </Box>
      </DialogTitle>
      <DialogContent>
        {debugData?.errores?.cliente && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error obteniendo cliente: {debugData.errores.cliente}
          </Alert>
        )}

        {debugData?.cliente ? (
          <>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Información Completa del Cliente</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Campo</TableCell>
                        <TableCell>Valor</TableCell>
                        <TableCell>Tipo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(debugData.cliente).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell component="th" scope="row">
                            <strong>{key}</strong>
                          </TableCell>
                          <TableCell>{value !== null ? String(value) : 'NULL'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={typeof value} 
                              size="small" 
                              color={value !== null ? 'primary' : 'default'} 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Análisis de Campos Esperados</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Análisis de los campos que debería tener el cliente según el frontend:
                </Typography>
                
                {[
                  'id_cliente', 'nombrecliente', 'nombrefantasia', 'id_grupo', 'razonsocial',
                  'id_tipo_cliente', 'rut', 'id_region', 'id_comuna', 'estado', 'id_tablaformato',
                  'id_moneda', 'valor', 'giro', 'direccion', 'nombrerepresentantelegal',
                  'apellidorepresentante', 'rut_representante', 'telcelular', 'telfijo',
                  'email', 'web_cliente'
                ].map(renderCampoComparacion)}
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Todos los Clientes (Primeros 5)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Razón Social</TableCell>
                        <TableCell>RUT</TableCell>
                        <TableCell>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {debugData.todosLosClientes.map((cliente) => (
                        <TableRow key={cliente.id_cliente}>
                          <TableCell>{cliente.id_cliente}</TableCell>
                          <TableCell>{cliente.nombrecliente || '-'}</TableCell>
                          <TableCell>{cliente.razonsocial || cliente.razonSocial || '-'}</TableCell>
                          <TableCell>{cliente.rut || cliente.RUT || '-'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={cliente.estado ? 'Activo' : 'Inactivo'} 
                              size="small" 
                              color={cliente.estado ? 'success' : 'default'} 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </>
        ) : (
          <Alert severity="warning">
            No se encontró información para el cliente ID: {clienteId}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClienteDebugInfo;