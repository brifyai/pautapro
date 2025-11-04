import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  Divider,
  Breadcrumbs,
  Link,
  Tooltip,
  Fab,
  IconButton
} from '@mui/material';
import {
  Assistant as AssistantIcon,
  NavigateNext as NavigateNextIcon,
  Search as SearchIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { Pagination } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import './InformeInversionClienteBruto.css';

const InformeInversionClienteBruto = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ordenes, setOrdenes] = useState([]);
  const [filtros, setFiltros] = useState({
    cliente: '',
    campana: '',
    estado: '',
    fechaInicio: null,
    fechaFin: null
  });

  // Estado para controlar la depuración
  const [debug, setDebug] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [campanas, setCampanas] = useState([]);
  const [agencias, setAgencias] = useState([]);
  const [filteredCampanas, setFilteredCampanas] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);


  useEffect(() => {
    fetchClientes();
    fetchCampanas();
    fetchAgencias();
  }, []);

  useEffect(() => {
    if (filtros.cliente) {
      const campanasDelCliente = campanas.filter(
        campana => campana.id_cliente === filtros.cliente
      );
      setFilteredCampanas(campanasDelCliente);
      
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

  const fetchAgencias = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agencias')
        .select('id, nombreidentificador, nombrefantasia');

      if (error) throw error;
      console.log('Agencias obtenidas:', data);
      setAgencias(data || []);
    } catch (error) {
      console.error('Error al obtener agencias:', error);
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
          fechaCreacion,
          created_at,
          numero_correlativo,
          estado,
          copia,
          usuario_registro,
          alternativas_plan_orden,
          OrdenesUsuarios!left (id_orden_usuario, fecha_asignacion, estado,
            Usuarios (id_usuario, Nombre, Email, id_grupo,
              Grupos (id_grupo, nombre_grupo)
            )
          ),
          Campania!inner (id_campania, nombrecampania, id_cliente, id_producto, presupuesto, id_agencia,
            clientes (id_cliente, nombrecliente, rut, razonsocial),
            productos!id_producto (id, nombredelproducto),
            agencias!id_agencia (id, nombreidentificador, nombrefantasia)
          ),
          Contratos (id, NombreContrato, num_contrato, id_FormadePago, IdProveedor,
            FormaDePago (id, NombreFormadePago),
            proveedores (id_proveedor, nombreproveedor, rutproveedor)
          ),
          Soportes (id_soporte, nombreIdentficiador),
          plan (id, nombre_plan, anio, mes,
            Anios!anio (id, years),
            Meses (Id, Nombre)
          )
        `);

      if (filtros.cliente) {
        query = query.eq('Campania.id_cliente', filtros.cliente);
      }
      
      if (filtros.campana) {
        query = query.eq('Campania.id_campania', filtros.campana);
      }

      if (filtros.estado) {
        query = query.eq('estado', filtros.estado);
      }

      if (filtros.fechaInicio) {
        const fechaInicioFormateada = format(new Date(filtros.fechaInicio), 'yyyy-MM-dd');
        query = query.gte('fechaCreacion', fechaInicioFormateada);
      }

      if (filtros.fechaFin) {
        const fechaFinFormateada = format(new Date(filtros.fechaFin), 'yyyy-MM-dd');
        query = query.lte('fechaCreacion', fechaFinFormateada);
      }

      const { data: ordenesData, error } = await query.order('fechaCreacion', { ascending: false });

      // Depuración detallada
      if (ordenesData && ordenesData.length > 0) {
        console.log('====== DEPURACIÓN DE DATOS ======');
        console.log('Datos de la primera orden:', ordenesData[0]);
        console.log('Estructura completa de Campania:', ordenesData[0].Campania);
        console.log('Id_Agencia en Campania:', ordenesData[0].Campania?.Id_Agencia);
        console.log('Datos de la agencia en Campania:', ordenesData[0].Campania?.Agencia);
        
        // Mostrar todas las propiedades de la orden
        console.log('Propiedades de la orden:', Object.keys(ordenesData[0]));
        
        // Mostrar todas las propiedades de la campaña
        console.log('Propiedades de la campaña:', ordenesData[0].Campania ? Object.keys(ordenesData[0].Campania) : 'No hay campaña');
        
        // Mostrar todas las agencias obtenidas
        console.log('Todas las agencias obtenidas:', agencias);
      }

      if (error) throw error;
      setOrdenes(ordenesData || []);
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

  const exportarExcel = () => {
    const dataToExport = ordenes.map(orden => mapearDatosOrden(orden));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Informe Inversión Cliente Bruto');
    XLSX.writeFile(wb, 'informe_inversion_cliente_bruto.xlsx');
  };

  const mapearDatosOrden = (orden) => {
    
    return {
    'Razón Social Cliente': orden.Campania?.Clientes?.razonSocial || '',
    'AÑO': orden.plan?.anios?.years || '',
    'Mes': orden.plan?.meses?.nombre || '',
    'N° de Ctto.': orden.Contratos?.num_contrato || '',
    'N° de Orden': orden.numero_correlativo || '',
    'Versión': orden.copia || '',
    'Medio': orden.Contratos?.Proveedores?.nombreproveedor || '',
    'Razón Soc.Proveedor': orden.Contratos?.Proveedores?.nombreproveedor || '',
    'RUT Prov.': orden.Contratos?.Proveedores?.rutproveedor || '',
    'Soporte': orden.Soportes?.nombreidentificador || '',
    'Campaña': orden.Campania?.nombrecampania || '',
    'OC Cliente': orden.numero_correlativo || '',
    'Producto': orden.Campania?.Productos?.nombredelproducto || 'No asignado',
    // Asignar directamente el nombre de la agencia según el soporte o la campaña
    'Age.Crea': (() => {
      // Verificar el soporte
      const soporte = orden.Soportes?.nombreidentificador;
      
      // Si el soporte es CANAL 13, mostrar CANAL 13 S.P.A.
      if (soporte === 'CANAL 13') {
        return 'CANAL 13 S.P.A.';
      }
      
      // Si el soporte es ESPERANZA, mostrar MTWEB
      if (soporte === 'ESPERANZA') {
        return 'MTWEB';
      }
      
      // Si el soporte es GOOGLE SEARCH o YOUTUBE, mostrar ORIGEN COMUNICACIONES
      if (soporte === 'GOOGLE SEARCH' || soporte === 'YOUTUBE') {
        return 'ORIGEN COMUNICACIONES';
      }
      
      // Si el soporte es JCDECAUX COMUNICACION, mostrar JCDECAUX
      if (soporte && soporte.includes('JCDECAUX')) {
        return 'JCDECAUX COMUNICACION EXTERIOR CHILE S.A.';
      }
      
      // Por defecto, mostrar el nombre del medio
      const medio = orden.Contratos?.Proveedores?.nombreproveedor;
      if (medio) {
        return medio;
      }
      
      return 'ORIGEN COMUNICACIONES';
    })(),
    'Inv.Bruta': orden.Campania?.Presupuesto ? new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(orden.Campania.Presupuesto) : '',
    'N° Fact.Prov.': '',
    'Fecha Fact.Prov.': '',
    'N° Fact.Age.': '',
    'Fecha Fact.Age.': '',
    'Monto Neto Ft': '',
    'Tipo Ctto.': orden.Contratos?.nombrecontrato || '',
    'Usuario': orden.OrdenesUsuarios?.[0]?.Usuarios?.Nombre || orden.usuario_registro?.Nombre || '',
    'Grupo': orden.OrdenesUsuarios?.[0]?.Usuarios?.Grupos?.nombre_grupo || orden.usuario_registro?.grupo || ''
  }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <div className="agencias-container animate-fade-in">
      {/* Header moderno con gradiente */}
      <Box
        className="modern-header animate-slide-down"
        sx={{
          '@media (max-width: 768px)': {
            padding: '16px 12px',
            height: 'auto',
            minHeight: '60px',
          },
        }}
      >
        <Box
          className="modern-title"
          sx={{
            fontSize: '1rem',
            marginTop: '14px',
            lineHeight: '1',
            '@media (max-width: 768px)': {
              fontSize: '0.9rem',
              marginTop: '8px',
            },
          }}
        >
          📊 INFORME DE INVERSIÓN CLIENTE BRUTO
        </Box>
      </Box>

      {/* Breadcrumbs */}
      <Box sx={{ p: 3, pb: 0 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link component={RouterLink} to="/dashboard" sx={{ color: 'var(--gradient-primary)', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
            Dashboard
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>Reportes</Typography>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>Inversión Cliente Bruto</Typography>
        </Breadcrumbs>
      </Box>

      {/* Contenedor principal */}
      <Box sx={{ p: 0, pt: 0 }}>
        <Paper elevation={0} className="modern-card hover-lift" sx={{ p: 3, mb: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom className="text-gradient" sx={{ fontWeight: 600, mb: 3 }}>
            📈 Filtros de Búsqueda
          </Typography>
        
          <Grid container spacing={{ xs: 2, sm: 3 }} sx={{
            mb: 3,
            '@media (max-width: 768px)': {
              spacing: 1,
            },
          }}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>👥 Cliente</InputLabel>
                <Select
                  value={filtros.cliente}
                  onChange={(e) => handleFiltroChange('cliente', e.target.value)}
                  displayEmpty
                  label="👥 Cliente"
                  sx={{
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--gradient-primary)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--gradient-primary)',
                    },
                  }}
                >
                  <MenuItem value="" disabled>Seleccione un cliente</MenuItem>
                  {clientes.map((cliente) => (
                    <MenuItem key={cliente.id_cliente} value={cliente.id_cliente}>
                      {cliente.nombrecliente}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>🎯 Campaña</InputLabel>
                <Select
                  value={filtros.campana}
                  onChange={(e) => handleFiltroChange('campana', e.target.value)}
                  displayEmpty
                  disabled={!filtros.cliente}
                  label="🎯 Campaña"
                  sx={{
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--gradient-primary)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--gradient-primary)',
                    },
                  }}
                >
                  <MenuItem value="" disabled>Seleccione una campaña</MenuItem>
                  {filteredCampanas.map((campana) => (
                    <MenuItem key={campana.id_campania} value={campana.id_campania}>
                      {campana.nombrecampania}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  value={filtros.fechaInicio}
                  onChange={(newValue) => handleFiltroChange('fechaInicio', newValue)}
                  format="dd/MM/yyyy"
                  label="📅 Fecha Inicio"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        background: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  value={filtros.fechaFin}
                  onChange={(newValue) => handleFiltroChange('fechaFin', newValue)}
                  format="dd/MM/yyyy"
                  label="📅 Fecha Fin"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        background: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>

          <Box sx={{
            display: 'flex',
            gap: 2,
            mb: 3,
            flexWrap: 'wrap',
            '@media (max-width: 768px)': {
              gap: 1,
              '& .MuiButton-root': {
                fontSize: '0.75rem',
                padding: '6px 12px',
                minWidth: 'auto',
              },
            },
          }}>
            <Button
              variant="contained"
              onClick={buscarOrdenes}
              disabled={loading}
              startIcon={<SearchIcon />}
              sx={{
                background: 'var(--gradient-primary)',
                color: '#fff',
                borderRadius: '12px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  background: 'var(--gradient-secondary)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(247, 107, 138, 0.4)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              🔍 Buscar
            </Button>
            <Button
              variant="outlined"
              onClick={limpiarFiltros}
              disabled={loading}
              sx={{
                borderColor: 'var(--gradient-primary)',
                color: 'var(--gradient-primary)',
                borderRadius: '12px',
                fontWeight: 600,
                '&:hover': {
                  borderColor: 'var(--gradient-secondary)',
                  color: 'var(--gradient-secondary)',
                  background: 'rgba(247, 107, 138, 0.1)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              🧹 Limpiar Filtros
            </Button>
            <Button
              variant="contained"
              onClick={exportarExcel}
              disabled={loading || ordenes.length === 0}
              startIcon={<FileDownloadIcon />}
              sx={{
                background: 'var(--gradient-success)',
                color: '#fff',
                borderRadius: '12px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              📊 Exportar Excel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                // Función para depurar los datos
                const debugDatos = () => {
                  console.log('====== DEPURACIÓN MANUAL ======');
                  console.log('Todas las órdenes:', ordenes);

                  if (ordenes.length > 0) {
                    console.log('Primera orden:', ordenes[0]);
                    console.log('Campaña de la primera orden:', ordenes[0].Campania);
                    console.log('Id_Agencia en la campaña:', ordenes[0].Campania?.Id_Agencia);

                    // Mostrar todas las agencias
                    console.log('Todas las agencias:', agencias);

                    // Buscar la agencia correspondiente
                    const agenciaId = ordenes[0].Campania?.Id_Agencia;
                    const agenciaEncontrada = agencias.find(ag => ag.id === agenciaId);
                    console.log('Agencia encontrada:', agenciaEncontrada);

                    // Forzar la actualización de la interfaz con el nombre de la agencia
                    const nuevasOrdenes = [...ordenes];
                    setOrdenes(nuevasOrdenes);
                  }
                };

                // Ejecutar la función de depuración
                debugDatos();

                // Cambiar el estado de depuración
                setDebug(!debug);
              }}
              sx={{
                background: 'var(--gradient-warning)',
                color: '#fff',
                borderRadius: '12px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(250, 112, 154, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(250, 112, 154, 0.4)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              🔧 Depurar
            </Button>
          </Box>
        </Paper>
  
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Paper elevation={0} className="modern-card hover-lift" sx={{ p: 3, mb: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom className="text-gradient" sx={{ fontWeight: 600, mb: 3 }}>
                  📋 Resultados de la Búsqueda ({ordenes.length} registros)
                </Typography>
  
                <TableContainer sx={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  overflowX: 'auto', // Scroll horizontal para móviles
                  '&::-webkit-scrollbar': {
                    width: '8px',
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(0,0,0,0.05)',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'var(--gradient-primary)',
                    borderRadius: '4px',
                  },
                  '@media (max-width: 768px)': {
                    '&::-webkit-scrollbar': {
                      height: '6px',
                    },
                  },
                }}>
                  <Table sx={{
                    minWidth: 1200, // Aumentado para mejor scroll en móviles
                    '@media (max-width: 768px)': {
                      minWidth: 'auto',
                      fontSize: '0.75rem',
                    },
                  }} size="small">
                    <TableHead sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '& .MuiTableCell-head': {
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        borderBottom: 'none',
                        whiteSpace: 'nowrap', // Evitar que los headers se rompan
                        '@media (max-width: 768px)': {
                          fontSize: '0.7rem',
                          padding: '8px 4px',
                          minWidth: '80px',
                        },
                      }
                    }}>
                      <TableRow>
                        <TableCell>🏢 Razón Social Cliente</TableCell>
                        <TableCell>📅 AÑO</TableCell>
                        <TableCell>📅 Mes</TableCell>
                        <TableCell>📄 N° de Ctto.</TableCell>
                        <TableCell>📋 N° de Orden</TableCell>
                        <TableCell>🔄 Versión</TableCell>
                        <TableCell>📺 Medio</TableCell>
                        <TableCell>🏭 Razón Soc.Proveedor</TableCell>
                        <TableCell>🆔 RUT Prov.</TableCell>
                        <TableCell>📺 Soporte</TableCell>
                        <TableCell>🎯 Campaña</TableCell>
                        <TableCell>📋 OC Cliente</TableCell>
                        <TableCell>📦 Producto</TableCell>
                        <TableCell>🏢 Age.Crea</TableCell>
                        <TableCell>💰 Inv.Bruta</TableCell>
                        <TableCell>📄 N° Fact.Prov.</TableCell>
                        <TableCell>📅 Fecha Fact.Prov.</TableCell>
                        <TableCell>📄 N° Fact.Age.</TableCell>
                        <TableCell>📅 Fecha Fact.Age.</TableCell>
                        <TableCell>💵 Monto Neto Ft</TableCell>
                        <TableCell>📋 Tipo Ctto.</TableCell>
                        <TableCell>👤 Usuario</TableCell>
                        <TableCell>👥 Grupo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ordenes
                        .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                        .map((orden, index) => (
                          <TableRow
                            key={orden.id_ordenes_de_comprar}
                            sx={{
                              '&:nth-of-type(odd)': {
                                backgroundColor: 'rgba(102, 126, 234, 0.02)',
                              },
                              '&:hover': {
                                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                transform: { xs: 'none', sm: 'scale(1.01)' }, // Sin transform en móviles
                                transition: 'all 0.2s ease',
                              },
                              '& .MuiTableCell-body': {
                                borderBottom: '1px solid rgba(0,0,0,0.06)',
                                fontSize: '0.875rem',
                                whiteSpace: 'nowrap', // Evitar que el texto se rompa
                                '@media (max-width: 768px)': {
                                  fontSize: '0.7rem',
                                  padding: '8px 4px',
                                  maxWidth: '80px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                },
                              }
                            }}
                          >
                            <TableCell sx={{ fontWeight: 600, color: '#374151' }}>{orden.Campania?.Clientes?.razonSocial}</TableCell>
                            <TableCell>{orden.plan?.anios?.years}</TableCell>
                            <TableCell>{orden.plan?.meses?.nombre}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{orden.Contratos?.num_contrato}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{orden.numero_correlativo}</TableCell>
                            <TableCell>{orden.copia}</TableCell>
                            <TableCell>{orden.Contratos?.Proveedores?.nombreproveedor}</TableCell>
                            <TableCell>{orden.Contratos?.Proveedores?.nombreproveedor}</TableCell>
                            <TableCell>{orden.Contratos?.Proveedores?.rutproveedor}</TableCell>
                            <TableCell>{orden.Soportes?.nombreidentificador}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{orden.Campania?.nombrecampania}</TableCell>
                            <TableCell>{orden.numero_correlativo}</TableCell>
                            <TableCell>{orden.Campania?.Productos?.nombredelproducto}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {(() => {
                                // Verificar el soporte
                                const soporte = orden.Soportes?.nombreidentificador;
  
                                // Si el soporte es CANAL 13, mostrar CANAL 13 S.P.A.
                                if (soporte === 'CANAL 13') {
                                  return 'CANAL 13 S.P.A.';
                                }
  
                                // Si el soporte es ESPERANZA, mostrar MTWEB
                                if (soporte === 'ESPERANZA') {
                                  return 'MTWEB';
                                }
  
                                // Si el soporte es GOOGLE SEARCH o YOUTUBE, mostrar ORIGEN COMUNICACIONES
                                if (soporte === 'GOOGLE SEARCH' || soporte === 'YOUTUBE') {
                                  return 'ORIGEN COMUNICACIONES';
                                }
  
                                // Si el soporte es JCDECAUX COMUNICACION, mostrar JCDECAUX
                                if (soporte && soporte.includes('JCDECAUX')) {
                                  return 'JCDECAUX COMUNICACION EXTERIOR CHILE S.A.';
                                }
  
                                // Por defecto, mostrar el nombre del medio
                                const medio = orden.Contratos?.Proveedores?.nombreproveedor;
                                if (medio) {
                                  return medio;
                                }
  
                                return 'ORIGEN COMUNICACIONES';
                              })()}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'var(--gradient-success)' }}>
                              {orden.Campania?.Presupuesto
                                ? new Intl.NumberFormat('es-CL', {
                                    style: 'currency',
                                    currency: 'CLP',
                                    minimumFractionDigits: 0
                                  }).format(orden.Campania.Presupuesto)
                                : ''}
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell>{orden.Contratos?.nombrecontrato}</TableCell>
                            <TableCell>{orden.OrdenesUsuarios?.[0]?.Usuarios?.nombre || orden.usuario_registro?.nombre}</TableCell>
                            <TableCell>{orden.OrdenesUsuarios?.[0]?.Usuarios?.Grupos?.nombre_grupo || orden.usuario_registro?.grupo}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
  
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 3,
                  '@media (max-width: 768px)': {
                    mt: 2,
                    '& .MuiPagination-root': {
                      transform: 'scale(0.8)',
                    },
                  },
                }}>
                  <Pagination
                    count={Math.ceil(ordenes.length / rowsPerPage)}
                    page={page}
                    onChange={handleChangePage}
                    color="primary"
                    size="small" // Más pequeño en móviles
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: '8px',
                        '&.Mui-selected': {
                          background: 'var(--gradient-primary)',
                          color: 'white',
                          '&:hover': {
                            background: 'var(--gradient-secondary)',
                          },
                        },
                      },
                      '@media (max-width: 768px)': {
                        '& .MuiPaginationItem-root': {
                          minWidth: '32px',
                          height: '32px',
                          fontSize: '0.75rem',
                        },
                      },
                    }}
                  />
                </Box>
              </Paper>
            </>
          )}

      </Box>
    </div>
  );
};

export default InformeInversionClienteBruto;