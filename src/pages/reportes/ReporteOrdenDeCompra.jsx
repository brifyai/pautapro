import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import './ReporteOrdenDeCompra.css';
import { Pagination } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const ReporteOrdenDeCompra = () => {
  const [loading, setLoading] = useState(false);
  const [ordenes, setOrdenes] = useState([]);
  const [filtros, setFiltros] = useState({
    cliente: '',
    campana: '',
    estado: '',
    fechaInicio: null,
    fechaFin: null
  });
  const [clientes, setClientes] = useState([]);
  const [campanas, setCampanas] = useState([]);
  const [filteredCampanas, setFilteredCampanas] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  useEffect(() => {
    fetchClientes();
    fetchCampanas();
  }, []);

  useEffect(() => {
    if (filtros.cliente) {
      const campanasDelCliente = campanas.filter(
        campana => campana.id_cliente === filtros.cliente
      );
      setFilteredCampanas(campanasDelCliente);
      
      // Si la campaña seleccionada no pertenece al cliente actual, reset
      if (filtros.campana && !campanasDelCliente.some(c => c.id_campania === filtros.campana)) {
        setFiltros(prev => ({ ...prev, campana: '' }));
      }
    } else {
      setFilteredCampanas([]);
    }
  }, [filtros.cliente, campanas]);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('id_cliente, nombrecliente')
        .order('nombrecliente');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampanas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('campania')
        .select('id_campania, nombrecampania, presupuesto, id_cliente')
        .order('nombrecampania');

      if (error) throw error;
      setCampanas(data || []);
    } catch (error) {
      console.error('Error al cargar campañas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const buscarOrdenes = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('ordenesdepublicidad')
        .select(`
          id_ordenes_de_comprar,
          numero_correlativo,
          monto_total,
          estado,
          created_at,
          id_cliente,
          id_campania,
          id_plan,
          alternativas_plan_orden
        `);

      // Aplicar filtros si existen
      if (filtros.cliente) {
        query = query.eq('id_cliente', filtros.cliente);
      }
      
      if (filtros.campana) {
        query = query.eq('id_campania', filtros.campana);
      }

      if (filtros.estado) {
        query = query.eq('estado', filtros.estado);
      }

      // Aplicar filtro de fecha inicio
      if (filtros.fechaInicio) {
        const fechaInicioFormateada = format(new Date(filtros.fechaInicio), 'yyyy-MM-dd');
        query = query.gte('created_at', fechaInicioFormateada);
      }

      // Aplicar filtro de fecha fin
      if (filtros.fechaFin) {
        const fechaFinFormateada = format(new Date(filtros.fechaFin), 'yyyy-MM-dd');
        query = query.lte('created_at', fechaFinFormateada);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      // Para cada orden, obtener sus alternativas con medios
      const ordenesConMedios = await Promise.all(
        (data || []).map(async (orden) => {
          let alternativasConMedios = [];
          
          // Método 1: Intentar con alternativas_plan_orden (si existe)
          if (orden.alternativas_plan_orden) {
            try {
              let alternativasIds = [];
              
              // Manejar diferentes formatos: [372] o 372 o 372,373
              if (typeof orden.alternativas_plan_orden === 'string') {
                if (orden.alternativas_plan_orden.startsWith('[')) {
                  // Es un JSON array string
                  alternativasIds = JSON.parse(orden.alternativas_plan_orden);
                } else {
                  // Es un string separado por comas
                  alternativasIds = orden.alternativas_plan_orden.split(',').map(id => parseInt(id.trim()));
                }
              } else if (Array.isArray(orden.alternativas_plan_orden)) {
                // Ya es un array
                alternativasIds = orden.alternativas_plan_orden;
              } else if (typeof orden.alternativas_plan_orden === 'number') {
                // Es un número simple
                alternativasIds = [orden.alternativas_plan_orden];
              }
              
              if (alternativasIds.length > 0) {
                const { data: alternativas } = await supabase
                  .from('alternativa')
                  .select(`
                    id,
                    descripcion,
                    costo,
                    id_contrato,
                    contratos!inner(
                      id,
                      numero_contrato,
                      idmedios,
                      proveedores!inner(
                        id_proveedor,
                        nombreproveedor
                      )
                    )
                  `)
                  .in('id', alternativasIds);
                
                if (alternativas) {
                  // Para cada alternativa, obtener el medio
                  alternativasConMedios = await Promise.all(
                    alternativas.map(async (alt) => {
                      let medio = null;
                      if (alt.contratos?.idmedios) {
                        const { data: medioData } = await supabase
                          .from('medios')
                          .select('id, nombre_medio')
                          .eq('id', alt.contratos.idmedios)
                          .single();
                        medio = medioData;
                      }
                      
                      return {
                        ...alt,
                        medio: medio,
                        proveedor: alt.contratos?.proveedores
                      };
                    })
                  );
                }
              }
            } catch (e) {
              console.log('Error procesando alternativas_plan_orden:', e.message);
            }
          }
          
          // Método 2: Si no hay alternativas por plan_orden, buscar por id_plan
          if (alternativasConMedios.length === 0 && orden.id_plan) {
            try {
              const { data: alternativasPlan } = await supabase
                .from('alternativa')
                .select(`
                  id,
                  descripcion,
                  costo,
                  id_contrato,
                  contratos!inner(
                    id,
                    numero_contrato,
                    idmedios,
                    proveedores!inner(
                      id_proveedor,
                      nombreproveedor
                    )
                  )
                `)
                .eq('id_plan', orden.id_plan)
                .limit(10);
              
              if (alternativasPlan) {
                alternativasConMedios = await Promise.all(
                  alternativasPlan.map(async (alt) => {
                    let medio = null;
                    if (alt.contratos?.idmedios) {
                      const { data: medioData } = await supabase
                        .from('medios')
                        .select('id, nombre_medio')
                        .eq('id', alt.contratos.idmedios)
                        .single();
                      medio = medioData;
                    }
                    
                    return {
                      ...alt,
                      medio: medio,
                      proveedor: alt.contratos?.proveedores
                    };
                  })
                );
              }
            } catch (e) {
              console.log('Error procesando alternativas por id_plan:', e.message);
            }
          }
          
          return {
            ...orden,
            alternativas: alternativasConMedios
          };
        })
      );
      
      setOrdenes(ordenesConMedios);
    } catch (error) {
      console.error('Error al buscar órdenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      cliente: '',
      campana: '',
      estado: '',
      fechaInicio: null,
      fechaFin: null
    });
  };

  const calcularTotalOrden = (alternativas) => {
    return alternativas.reduce((total, alt) => total + (alt.valor_total || 0), 0);
  };

  const exportarExcel = () => {
    const dataToExport = ordenes.map(orden => mapearDatosOrden(orden));

    // Crear y descargar el archivo Excel
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, 'reporte_ordenes.xlsx');
  };

  const mapearDatosOrden = (orden) => ({
    'Razón Social CLIENTE': clientes.find(c => c.id_cliente === orden.id_cliente)?.nombrecliente || '',
    'Cliente': clientes.find(c => c.id_cliente === orden.id_cliente)?.nombrecliente || '',
    'AÑO': new Date(orden.created_at).getFullYear() || '',
    'Mes': new Date(orden.created_at).toLocaleDateString('es-CL', { month: 'long' }) || '',
    'N° de Ctto.': 'N/A',
    'N° de Orden': orden.numero_correlativo || orden.id_ordenes_de_comprar || '',
    'Versión': '1',
    'Medio': 'N/A',
    'Razón Soc.Proveedor': 'N/A',
    'Proveedor': 'N/A',
    'RUT Prov.': 'N/A',
    'Soporte': 'N/A',
    'Campaña': campanas.find(c => c.id_campania === orden.id_campania)?.nombrecampania || '',
    'OC Cliente': orden.numero_correlativo || orden.id_ordenes_de_comprar || '',
    'Producto': 'No asignado',
    'Age.Crea': 'ORIGEN COMUNICACIONES',
    'Inversion neta': orden.monto_total ? new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(orden.monto_total) : '',
    'N° Fact.Prov.': '',
    'Fecha Fact.Prov.': '',
    'N° Fact.Age.': '',
    'Fecha Fact.Age.': '',
    'Monto Neto Fact.': '',
    'Tipo Ctto.': 'N/A',
    'Usuario': '',
    'Grupo': '',
    'Estado': orden.estado || ''
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const mostrarEstado = (estado) => {
    if (!estado || estado === '') {
      return 'ACTIVA';
    } else if (estado === 'anulada') {
      return 'ANULADA';
    } else if (estado === 'activa') {
      return 'ACTIVA';
    } else if(estado === null) {
      return 'ACTIVA';
    }
  };

  const paginatedOrdenes = ordenes.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 3 }}>
        Reporte de Órdenes
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium', color: '#2c3e50' }}>
          Filtros
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Cliente</InputLabel>
              <Select
                value={filtros.cliente}
                label="Cliente"
                onChange={(e) => handleFiltroChange('cliente', e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {clientes.map((cliente) => (
                  <MenuItem key={cliente.id_cliente} value={cliente.id_cliente}>
                    {cliente.nombrecliente}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Campaña</InputLabel>
              <Select
                value={filtros.campana}
                label="Campaña"
                onChange={(e) => handleFiltroChange('campana', e.target.value)}
                disabled={!filtros.cliente}
              >
                <MenuItem value="">Todas</MenuItem>
                {filteredCampanas.map((campana) => (
                  <MenuItem key={campana.id_campania} value={campana.id_campania}>
                    {campana.nombrecampania}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={filtros.estado}
                label="Estado"
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="activa">Activa</MenuItem>
                <MenuItem value="anulada">Anulada</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha Inicio"
                value={filtros.fechaInicio}
                onChange={(newValue) => handleFiltroChange('fechaInicio', newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    sx: {
                      '& .MuiInputBase-input': {
                        textAlign: 'left'
                      }
                    }
                  }
                }}
                format="dd/MM/yyyy"
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha Fin"
                value={filtros.fechaFin}
                onChange={(newValue) => handleFiltroChange('fechaFin', newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    sx: {
                      '& .MuiInputBase-input': {
                        textAlign: 'left'
                      }
                    }
                  }
                }}
                format="dd/MM/yyyy"
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="contained"
              onClick={buscarOrdenes}
              disabled={loading}
              sx={{ mr: 1, height: 40 }}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Buscar'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={limpiarFiltros}
              sx={{ height: 40 }}
              fullWidth
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          {ordenes.length > 0 && (
            <Button variant="contained" color="success" onClick={exportarExcel}>
              Exportar a Excel
            </Button>
          )}
        </Box>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resultados
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : ordenes.length > 0 ? (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>RAZÓN SOCIAL</TableCell>
                    <TableCell>CLIENTE</TableCell>
                    <TableCell>AÑO</TableCell>
                    <TableCell>MES</TableCell>
                    <TableCell>N° DE CTTO.</TableCell>
                    <TableCell>N° DE ORDEN</TableCell>
                    <TableCell>VERSIÓN</TableCell>
                    <TableCell>MEDIO</TableCell>
                    <TableCell>RAZÓN SOC. PROVEEDOR</TableCell>
                    <TableCell>PROVEEDOR</TableCell>
                    <TableCell>RUT PROV.</TableCell>
                    <TableCell>SOPORTE</TableCell>
                    <TableCell>CAMPAÑA</TableCell>
                    <TableCell>OC CLIENTE</TableCell>
                    <TableCell>PRODUCTO</TableCell>
                    <TableCell>AGE. CREA</TableCell>
                    <TableCell>INVERSIÓN NETA</TableCell>
                    <TableCell>N° FACT. PROV.</TableCell>
                    <TableCell>FECHA FACT. PROV.</TableCell>
                    <TableCell>N° FACT. AGE.</TableCell>
                    <TableCell>FECHA FACT. AGE.</TableCell>
                    <TableCell>MONTO NETO FACT.</TableCell>
                    <TableCell>TIPO CTTO.</TableCell>
                    <TableCell>USUARIO</TableCell>
                    <TableCell>GRUPO</TableCell>
                    <TableCell>ESTADO</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedOrdenes.map((orden) => {
                    // Obtener el primer medio y proveedor de las alternativas
                    const primerMedio = orden.alternativas?.[0]?.medio;
                    const primerProveedor = orden.alternativas?.[0]?.proveedor;
                    const primerContrato = orden.alternativas?.[0]?.contratos;
                    
                    return (
                      <TableRow key={orden.id_ordenes_de_comprar}>
                        <TableCell>{clientes.find(c => c.id_cliente === orden.id_cliente)?.nombrecliente || 'NA'}</TableCell>
                        <TableCell>{clientes.find(c => c.id_cliente === orden.id_cliente)?.nombrecliente || 'NA'}</TableCell>
                        <TableCell>{new Date(orden.created_at).getFullYear() || 'NA'}</TableCell>
                        <TableCell>{new Date(orden.created_at).toLocaleDateString('es-CL', { month: 'long' }) || 'NA'}</TableCell>
                        <TableCell>{primerContrato?.numero_contrato || 'NA'}</TableCell>
                        <TableCell>{orden.numero_correlativo || orden.id_ordenes_de_comprar || 'NA'}</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>{primerMedio?.nombre_medio || 'NA'}</TableCell>
                        <TableCell>{primerProveedor?.nombreproveedor || 'NA'}</TableCell>
                        <TableCell>{primerProveedor?.nombreproveedor || 'NA'}</TableCell>
                        <TableCell>{primerProveedor?.rut || 'NA'}</TableCell>
                        <TableCell>{orden.alternativas?.[0]?.descripcion || 'NA'}</TableCell>
                        <TableCell>{campanas.find(c => c.id_campania === orden.id_campania)?.nombrecampania || 'NA'}</TableCell>
                        <TableCell>{orden.numero_correlativo || orden.id_ordenes_de_comprar || 'NA'}</TableCell>
                        <TableCell>NA</TableCell>
                        <TableCell>ORIGEN COMUNICACIONES</TableCell>
                        <TableCell>{orden.monto_total ? new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(orden.monto_total) : 'NA'}</TableCell>
                        <TableCell>NA</TableCell>
                        <TableCell>NA</TableCell>
                        <TableCell>NA</TableCell>
                        <TableCell>NA</TableCell>
                        <TableCell>NA</TableCell>
                        <TableCell>NA</TableCell>
                        <TableCell>NA</TableCell>
                        <TableCell>{mostrarEstado(orden.estado)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(ordenes.length / rowsPerPage)}
                page={page}
                onChange={handleChangePage}
                color="primary"
              />
            </Box>
          </>
        ) : (
          <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
            No se encontraron órdenes con los filtros seleccionados
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default ReporteOrdenDeCompra;