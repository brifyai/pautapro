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
  Link
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { supabase } from '../../config/supabase';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as RouterLink } from 'react-router-dom';

export default function RendimientoCampanas() {
  const [campanas, setCampanas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampanas();
  }, []);

  const fetchCampanas = async () => {
    try {
      // Obtener campañas con sus órdenes relacionadas para cálculos reales
      const { data, error } = await supabase
        .from('campania')
        .select(`
          *,
          clientes!inner (
            id_cliente,
            nombrecliente,
            razonSocial
          ),
          ordenesdepublicidad (
            id_ordenes_de_comprar,
            estado,
            monto_total,
            fechaCreacion,
            created_at,
            alternativas_plan_orden
          )
        `)
        .order('fechaCreacion', { ascending: false });

      if (error) throw error;

      // Calcular métricas reales para cada campaña
      const campanasConMetricas = await Promise.all(
        data.map(async (campana) => {
          const metricas = await calcularMetricasReales(campana);
          
          return {
            ...campana,
            id: campana.id_campania,
            nombre: campana.NombreCampania || campana.nombrecampania,
            fechaInicio: campana.fechaCreacion,
            fechaFin: campana.fechaCreacion,
            rendimiento: metricas.rendimiento,
            impactoEstimado: metricas.impactoEstimado,
            roi: metricas.roi,
            totalOrdenes: metricas.totalOrdenes,
            inversionTotal: metricas.inversionTotal,
            ordenesActivas: metricas.ordenesActivas,
            ordenesCompletadas: metricas.ordenesCompletadas
          };
        })
      );

      setCampanas(campanasConMetricas);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar campañas:', error);
      setLoading(false);
    }
  };

  const calcularMetricasReales = async (campana) => {
    try {
      const ordenes = campana.ordenesdepublicidad || [];
      
      // Calcular totales reales
      const totalOrdenes = ordenes.length;
      const ordenesActivas = ordenes.filter(o => o.estado === 'activa' || o.estado === null || o.estado === '').length;
      const ordenesCompletadas = ordenes.filter(o => o.estado === 'completada').length;
      
      // Calcular inversión total real
      let inversionTotal = 0;
      for (const orden of ordenes) {
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

      // Calcular rendimiento basado en completitud
      const rendimiento = totalOrdenes > 0
        ? (ordenesCompletadas / totalOrdenes) * 100
        : 0;

      // Calcular impacto estimado basado en inversión y alcance
      const impactoEstimado = inversionTotal > 0
        ? Math.floor(inversionTotal * 1.5) // Estimación de impacto = inversión * 1.5
        : 0;

      // Calcular ROI basado en inversión y completitud
      const roi = inversionTotal > 0
        ? ((impactoEstimado - inversionTotal) / inversionTotal * 100).toFixed(2)
        : 0;

      return {
        rendimiento,
        impactoEstimado,
        roi,
        totalOrdenes,
        inversionTotal,
        ordenesActivas,
        ordenesCompletadas
      };
    } catch (error) {
      console.error('Error calculando métricas reales:', error);
      return {
        rendimiento: 0,
        impactoEstimado: 0,
        roi: 0,
        totalOrdenes: 0,
        inversionTotal: 0,
        ordenesActivas: 0,
        ordenesCompletadas: 0
      };
    }
  };

  const columns = [
    { field: 'nombre', headerName: 'Nombre de Campaña', width: 220 },
    { field: 'fechaInicio', headerName: 'Fecha Inicio', width: 120 },
    {
      field: 'totalOrdenes',
      headerName: 'Total Órdenes',
      width: 120,
      renderCell: (params) => params.value || 0
    },
    {
      field: 'ordenesActivas',
      headerName: 'Órdenes Activas',
      width: 120,
      renderCell: (params) => params.value || 0
    },
    {
      field: 'ordenesCompletadas',
      headerName: 'Órdenes Completadas',
      width: 140,
      renderCell: (params) => params.value || 0
    },
    {
      field: 'inversionTotal',
      headerName: 'Inversión Total',
      width: 150,
      renderCell: (params) => {
        const value = params.value || 0;
        return new Intl.NumberFormat('es-CL', {
          style: 'currency',
          currency: 'CLP',
          minimumFractionDigits: 0
        }).format(value);
      }
    },
    {
      field: 'rendimiento',
      headerName: 'Rendimiento',
      width: 130,
      renderCell: (params) => {
        const value = params.value || 0;
        return `${value.toFixed(2)}%`;
      }
    },
    {
      field: 'impactoEstimado',
      headerName: 'Impacto Estimado',
      width: 150,
      renderCell: (params) => {
        const value = params.value || 0;
        return new Intl.NumberFormat('es-CL').format(value);
      }
    },
    {
      field: 'roi',
      headerName: 'ROI',
      width: 120,
      renderCell: (params) => {
        const value = parseFloat(params.value) || 0;
        const color = value >= 0 ? '#4caf50' : '#f44336';
        return (
          <span style={{ color, fontWeight: 'bold' }}>
            {value.toFixed(2)}%
          </span>
        );
      }
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
        <Typography color="textPrimary">Rendimiento de Campañas</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Análisis de Rendimiento de Campañas
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Campañas
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#1976d2' }}>
                      {campanas.length}
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
                    <Typography variant="h4" sx={{ color: '#2e7d32' }}>
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0
                      }).format(campanas.reduce((acc, curr) => acc + (curr.inversionTotal || 0), 0))}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Rendimiento Promedio
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#ed6c02' }}>
                      {campanas.length > 0
                        ? (campanas.reduce((acc, curr) => acc + (curr.rendimiento || 0), 0) / campanas.length).toFixed(2)
                        : 0}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      ROI Promedio
                    </Typography>
                    <Typography variant="h4" sx={{
                      color: campanas.length > 0 && (campanas.reduce((acc, curr) => acc + parseFloat(curr.roi || 0), 0) / campanas.length) >= 0
                        ? '#2e7d32'
                        : '#d32f2f'
                    }}>
                      {campanas.length > 0
                        ? (campanas.reduce((acc, curr) => acc + parseFloat(curr.roi || 0), 0) / campanas.length).toFixed(2)
                        : 0}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <div style={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={campanas}
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