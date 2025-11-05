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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { supabase } from '../../config/supabase';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as RouterLink } from 'react-router-dom';

export default function EfectividadProveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodoAnalisis, setPeriodoAnalisis] = useState('mes');

  useEffect(() => {
    fetchProveedoresData();
  }, [periodoAnalisis]);

  const fetchProveedoresData = async () => {
    try {
      // Obtener proveedores con sus contratos y órdenes relacionadas
      const { data: proveedoresData, error: proveedoresError } = await supabase
        .from('proveedores')
        .select(`
          *,
          contratos (
            id,
            num_contrato,
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

      if (proveedoresError) throw proveedoresError;

      // Calcular métricas reales para cada proveedor
      const proveedoresConMetricas = await Promise.all(
        proveedoresData.map(async (proveedor) => {
          const metricas = await calcularMetricasRealesProveedor(proveedor);
          
          return {
            ...proveedor,
            id: proveedor.id_proveedor,
            nombre: proveedor.nombreproveedor || proveedor.nombre,
            cumplimientoPlazos: metricas.cumplimientoPlazos,
            calidadServicio: metricas.calidadServicio,
            volumenNegocios: metricas.volumenNegocios,
            satisfaccionCliente: metricas.satisfaccionCliente,
            totalContratos: metricas.totalContratos,
            totalOrdenes: metricas.totalOrdenes,
            ordenesActivas: metricas.ordenesActivas,
            inversionTotal: metricas.inversionTotal
          };
        })
      );

      setProveedores(proveedoresConMetricas);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos de proveedores:', error);
      setLoading(false);
    }
  };

  const calcularMetricasRealesProveedor = async (proveedor) => {
    try {
      const contratos = proveedor.contratos || [];
      const todasLasOrdenes = [];
      
      // Recolectar todas las órdenes de todos los contratos
      for (const contrato of contratos) {
        if (contrato.ordenesdepublicidad) {
          todasLasOrdenes.push(...contrato.ordenesdepublicidad);
        }
      }

      // Calcular totales reales
      const totalContratos = contratos.length;
      const totalOrdenes = todasLasOrdenes.length;
      const ordenesActivas = todasLasOrdenes.filter(o => o.estado === 'activa' || o.estado === null || o.estado === '').length;

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

      // Calcular cumplimiento de plazos basado en órdenes activas vs totales
      const cumplimientoPlazos = totalOrdenes > 0
        ? ((ordenesActivas / totalOrdenes) * 100).toFixed(2)
        : 0;

      // Calcular calidad de servicio basada en inversión y número de contratos
      let calidadServicio = 0;
      if (totalContratos > 0 && inversionTotal > 0) {
        // Calidad basada en volumen de negocio y consistencia
        const avgInversionPerContract = inversionTotal / totalContratos;
        calidadServicio = Math.min(5, Math.max(1,
          (avgInversionPerContract > 1000000 ? 5 :
           avgInversionPerContract > 500000 ? 4 :
           avgInversionPerContract > 100000 ? 3 :
           avgInversionPerContract > 50000 ? 2 : 1)
        )).toFixed(1);
      }

      // Volumen de negocios es la inversión total
      const volumenNegocios = inversionTotal;

      // Calcular satisfacción del cliente basada en cumplimiento y calidad
      const satisfaccionCliente = (parseFloat(cumplimientoPlazos) * 0.6 + (parseFloat(calidadServicio) / 5 * 100) * 0.4).toFixed(2);

      return {
        cumplimientoPlazos,
        calidadServicio,
        volumenNegocios,
        satisfaccionCliente,
        totalContratos,
        totalOrdenes,
        ordenesActivas,
        inversionTotal
      };
    } catch (error) {
      console.error('Error calculando métricas reales del proveedor:', error);
      return {
        cumplimientoPlazos: 0,
        calidadServicio: 0,
        volumenNegocios: 0,
        satisfaccionCliente: 0,
        totalContratos: 0,
        totalOrdenes: 0,
        ordenesActivas: 0,
        inversionTotal: 0
      };
    }
  };

  const columns = [
    {
      field: 'nombre',
      headerName: 'Proveedor',
      width: 200,
      valueGetter: (params) => params.row.nombre || 'Sin nombre'
    },
    {
      field: 'cumplimientoPlazos',
      headerName: 'Cumplimiento',
      width: 130,
      renderCell: (params) => `${params.value || 0}%`
    },
    {
      field: 'calidadServicio',
      headerName: 'Calidad',
      width: 150,
      renderCell: (params) => (
        <Rating
          value={parseFloat(params.value) || 0}
          precision={0.1}
          readOnly
          size="small"
        />
      )
    },
    {
      field: 'volumenNegocios',
      headerName: 'Volumen de Negocios',
      width: 180,
      renderCell: (params) => `$${params.value?.toLocaleString() || '0'}`
    },
    {
      field: 'satisfaccionCliente',
      headerName: 'Satisfacción',
      width: 130,
      renderCell: (params) => `${params.value || 0}%`
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
        <Typography color="textPrimary">Efectividad de Proveedores</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Typography variant="h5">
              Análisis de Efectividad de Proveedores
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Periodo de Análisis</InputLabel>
              <Select
                value={periodoAnalisis}
                label="Periodo de Análisis"
                onChange={(e) => setPeriodoAnalisis(e.target.value)}
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
                      Cumplimiento Promedio
                    </Typography>
                    <Typography variant="h4">
                      {(proveedores.reduce((acc, curr) => acc + parseFloat(curr.cumplimientoPlazos), 0) / proveedores.length).toFixed(2)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Calidad Promedio
                    </Typography>
                    <Typography variant="h4">
                      {(proveedores.reduce((acc, curr) => acc + parseFloat(curr.calidadServicio), 0) / proveedores.length).toFixed(1)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Volumen Total
                    </Typography>
                    <Typography variant="h4">
                      ${proveedores.reduce((acc, curr) => acc + curr.volumenNegocios, 0).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Satisfacción Promedio
                    </Typography>
                    <Typography variant="h4">
                      {(proveedores.reduce((acc, curr) => acc + parseFloat(curr.satisfaccionCliente), 0) / proveedores.length).toFixed(2)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <div style={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={proveedores}
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