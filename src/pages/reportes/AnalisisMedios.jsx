import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Breadcrumbs,
  Link,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { supabase } from '../../config/supabase';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as RouterLink } from 'react-router-dom';

export default function AnalisisMedios() {
  const [medios, setMedios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes');

  useEffect(() => {
    fetchMediosData();
  }, [periodoSeleccionado]);

  const fetchMediosData = async () => {
    try {
      // Obtener medios con sus órdenes y contratos relacionados
      const { data: mediosData, error: mediosError } = await supabase
        .from('medios')
        .select(`
          *,
          contratos (
            id,
            num_contrato,
            id_proveedor,
            proveedores (
              id_proveedor,
              nombreproveedor
            ),
            ordenesdepublicidad (
              id_ordenes_de_comprar,
              estado,
              monto_total,
              fechaCreacion,
              created_at,
              alternativas_plan_orden
            )
          )
        `);

      if (mediosError) throw mediosError;

      // Calcular métricas reales para cada medio
      const mediosConMetricas = await Promise.all(
        mediosData.map(async (medio) => {
          const metricas = await calcularMetricasRealesMedio(medio);
          
          return {
            ...medio,
            id: medio.id,
            nombre: medio.NombredelMedio || medio.nombredelmedio,
            alcance: metricas.alcance,
            efectividad: metricas.efectividad,
            inversionTotal: metricas.inversionTotal,
            frecuenciaUso: metricas.frecuenciaUso,
            totalContratos: metricas.totalContratos,
            totalOrdenes: metricas.totalOrdenes,
            ordenesActivas: metricas.ordenesActivas,
            proveedoresAsociados: metricas.proveedoresAsociados
          };
        })
      );

      setMedios(mediosConMetricas);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos de medios:', error);
      setLoading(false);
    }
  };

  const calcularMetricasRealesMedio = async (medio) => {
    try {
      const contratos = medio.contratos || [];
      const todasLasOrdenes = [];
      const proveedoresUnicos = new Set();
      
      // Recolectar todas las órdenes de todos los contratos
      for (const contrato of contratos) {
        if (contrato.proveedores) {
          proveedoresUnicos.add(contrato.proveedores.nombreproveedor);
        }
        
        if (contrato.ordenesdepublicidad) {
          todasLasOrdenes.push(...contrato.ordenesdepublicidad);
        }
      }

      // Calcular totales reales
      const totalContratos = contratos.length;
      const totalOrdenes = todasLasOrdenes.length;
      const ordenesActivas = todasLasOrdenes.filter(o => o.estado === 'activa' || o.estado === null || o.estado === '').length;
      const proveedoresAsociados = proveedoresUnicos.size;

      // Calcular inversión total real
      let inversionTotal = 0;
      for (const orden of todasLasOrdenes) {
        if (orden.monto_total) {
          inversionTotal += orden.monto_total;
        } else {
          // Si no hay monto_total, calcular desde alternativas
          if (orden.alternativas_plan_orden) {
            const alternativasIds = typeof orden.alternativas_plan_orden === 'string'
              ? JSON.parse(orden.alternativas_plan_orden)
              : orden.alternativas_plan_orden;
            
            if (Array.isArray(alternativasIds)) {
              const { data: alternativas } = await supabase
                .from('alternativa')
                .select('total_general, total_neto')
                .in('id', alternativasIds);
              
              if (alternativas) {
                inversionTotal += alternativas.reduce((sum, alt) => sum + (alt.total_neto || alt.total_general || 0), 0);
              }
            }
          }
        }
      }

      // Calcular frecuencia de uso real
      const frecuenciaUso = totalOrdenes;

      // Calcular efectividad basada en completitud de órdenes
      const efectividad = totalOrdenes > 0
        ? ((ordenesActivas / totalOrdenes) * 100).toFixed(2)
        : 0;

      // Calcular alcance estimado basado en inversión y número de órdenes
      const alcance = inversionTotal > 0
        ? Math.floor(inversionTotal * 2.5) // Estimación de alcance = inversión * 2.5
        : 0;

      return {
        alcance,
        efectividad,
        inversionTotal,
        frecuenciaUso,
        totalContratos,
        totalOrdenes,
        ordenesActivas,
        proveedoresAsociados
      };
    } catch (error) {
      console.error('Error calculando métricas reales del medio:', error);
      return {
        alcance: 0,
        efectividad: 0,
        inversionTotal: 0,
        frecuenciaUso: 0,
        totalContratos: 0,
        totalOrdenes: 0,
        ordenesActivas: 0,
        proveedoresAsociados: 0
      };
    }
  };

  const columns = [
    {
      field: 'nombre',
      headerName: 'Medio',
      width: 200,
      valueGetter: (params) => params.row.nombre || 'Sin nombre'
    },
    {
      field: 'alcance',
      headerName: 'Alcance',
      width: 150,
      renderCell: (params) => params.value?.toLocaleString() || '0'
    },
    {
      field: 'efectividad',
      headerName: 'Efectividad',
      width: 130,
      renderCell: (params) => `${params.value || 0}%`
    },
    {
      field: 'inversionTotal',
      headerName: 'Inversión Total',
      width: 150,
      renderCell: (params) => `$${params.value?.toLocaleString() || '0'}`
    },
    {
      field: 'frecuenciaUso',
      headerName: 'Frecuencia de Uso',
      width: 150,
      renderCell: (params) => `${params.value || 0} veces`
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/dashboard" color="inherit">
          Inicio
        </Link>
        <Link component={RouterLink} to="/reportes" color="inherit">
          Reportes
        </Link>
        <Typography color="textPrimary">Análisis de Medios</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Typography variant="h5">
              Análisis de Rendimiento de Medios
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Periodo</InputLabel>
              <Select
                value={periodoSeleccionado}
                label="Periodo"
                onChange={(e) => setPeriodoSeleccionado(e.target.value)}
              >
                <MenuItem value="mes">Último Mes</MenuItem>
                <MenuItem value="trimestre">Último Trimestre</MenuItem>
                <MenuItem value="ano">Último Año</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Alcance Total
                    </Typography>
                    <Typography variant="h4">
                      {medios.reduce((acc, curr) => acc + curr.alcance, 0).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Efectividad Promedio
                    </Typography>
                    <Typography variant="h4">
                      {(medios.reduce((acc, curr) => acc + parseFloat(curr.efectividad), 0) / medios.length).toFixed(2)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Inversión Total
                    </Typography>
                    <Typography variant="h4">
                      ${medios.reduce((acc, curr) => acc + curr.inversionTotal, 0).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Medios Activos
                    </Typography>
                    <Typography variant="h4">
                      {medios.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <div style={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={medios}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
              />
            </div>
          </>
        )}
      </Paper>
    </Container>
  );
}