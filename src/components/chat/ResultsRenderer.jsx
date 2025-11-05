/**
 * Results Renderer Component
 * Renderiza resultados de acciones del Asistente IA de forma visual
 * Soporta tablas, gráficos, listas y confirmaciones
 */

import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  LinearProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Eye as EyeIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  LocalOffer as LocalOfferIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';

/**
 * Componente principal para renderizar resultados
 */
export const ResultsRenderer = ({ result, onAction }) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  if (!result) return null;

  // Renderizar según tipo de resultado
  if (result.success === false) {
    return <ErrorResult result={result} />;
  }

  if (Array.isArray(result.data)) {
    return (
      <TableResult
        data={result.data}
        message={result.message}
        expandedRow={expandedRow}
        setExpandedRow={setExpandedRow}
        onAction={onAction}
      />
    );
  }

  if (typeof result.data === 'object' && result.data !== null) {
    // Detectar tipo de objeto
    if (result.data.totalClients !== undefined || result.data.totalProviders !== undefined) {
      return <StatsResult data={result.data} message={result.message} />;
    }

    if (result.data.totalPlans !== undefined || result.data.budgetSpent !== undefined) {
      return <CampaignSummaryResult data={result.data} message={result.message} />;
    }

    if (result.data.csv !== undefined || result.data.includes?.(',')) {
      return <ExportResult data={result.data} filename={result.filename} message={result.message} />;
    }

    return <DetailResult data={result.data} message={result.message} onAction={onAction} />;
  }

  return <SuccessResult message={result.message} />;
};

/**
 * Resultado de error
 */
const ErrorResult = ({ result }) => (
  <Alert severity="error" sx={{ mb: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <ErrorIcon />
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          Error: {result.code}
        </Typography>
        <Typography variant="body2">{result.error}</Typography>
        {result.missingParams && (
          <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
            Parámetros faltantes: {result.missingParams.join(', ')}
          </Typography>
        )}
      </Box>
    </Box>
  </Alert>
);

/**
 * Resultado exitoso simple
 */
const SuccessResult = ({ message }) => (
  <Alert severity="success" sx={{ mb: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <CheckCircleIcon />
      <Typography variant="body2">{message}</Typography>
    </Box>
  </Alert>
);

/**
 * Resultado de tabla
 */
const TableResult = ({ data, message, expandedRow, setExpandedRow, onAction }) => {
  if (!data || data.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        No se encontraron resultados
      </Alert>
    );
  }

  const columns = Object.keys(data[0]).filter(key => key !== 'id' && key !== 'agencia_id');
  const maxColumns = 6;
  const displayColumns = columns.slice(0, maxColumns);

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
        {message} ({data.length} resultado{data.length !== 1 ? 's' : ''})
      </Typography>

      <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              {displayColumns.map(col => (
                <TableCell key={col} sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                  {formatColumnName(col)}
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow
                key={row.id || idx}
                sx={{
                  backgroundColor: expandedRow === idx ? '#f9f9f9' : 'transparent',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              >
                {displayColumns.map(col => (
                  <TableCell key={col} sx={{ fontSize: '0.85rem' }}>
                    {formatCellValue(row[col])}
                  </TableCell>
                ))}
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EyeIcon />}
                      onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                      sx={{ fontSize: '0.75rem', padding: '2px 6px' }}
                    >
                      Ver
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {expandedRow !== null && (
        <ExpandedRowDetails row={data[expandedRow]} onClose={() => setExpandedRow(null)} />
      )}
    </Box>
  );
};

/**
 * Detalles de fila expandida
 */
const ExpandedRowDetails = ({ row, onClose }) => (
  <Card sx={{ mt: 2, backgroundColor: '#fafafa' }}>
    <CardHeader
      title="Detalles Completos"
      action={
        <Button size="small" onClick={onClose}>
          Cerrar
        </Button>
      }
    />
    <CardContent>
      <Grid container spacing={2}>
        {Object.entries(row).map(([key, value]) => (
          <Grid item xs={12} sm={6} key={key}>
            <Box>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold' }}>
                {formatColumnName(key)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, wordBreak: 'break-word' }}>
                {formatCellValue(value)}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </CardContent>
  </Card>
);

/**
 * Resultado de estadísticas
 */
const StatsResult = ({ data, message }) => {
  const stats = [
    {
      label: 'Total',
      value: data.totalClients || data.totalProviders || data.totalMedias || data.totalTemas || data.totalCampaigns || data.totalOrders,
      icon: <PeopleIcon />,
      color: '#1976d2'
    },
    {
      label: 'Activos',
      value: data.activeClients || data.activeProviders || data.activeMedias || data.activeTemas || data.activeCampaigns,
      icon: <CheckCircleIcon />,
      color: '#388e3c'
    },
    {
      label: 'Inactivos',
      value: data.inactiveClients || data.inactiveProviders || data.inactiveMedias || data.inactiveTemas,
      icon: <WarningIcon />,
      color: '#f57c00'
    }
  ];

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
        {message}
      </Typography>

      <Grid container spacing={2}>
        {stats.map((stat, idx) => (
          stat.value !== undefined && (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: stat.color, mb: 1 }}>
                    {React.cloneElement(stat.icon, { sx: { fontSize: 32 } })}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )
        ))}
      </Grid>

      {/* Mostrar detalles adicionales si existen */}
      {(data.providersByType || data.mediasByType || data.temasByType || data.campaignsByStatus || data.ordersByStatus) && (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Detalles por Categoría
          </Typography>
          <Grid container spacing={1}>
            {data.providersByType?.map((item, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <Chip
                  label={`${item.tipo_proveedor}: ${item.count}`}
                  variant="outlined"
                  sx={{ width: '100%' }}
                />
              </Grid>
            ))}
            {data.mediasByType?.map((item, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <Chip
                  label={`${item.tipo_medio}: ${item.count}`}
                  variant="outlined"
                  sx={{ width: '100%' }}
                />
              </Grid>
            ))}
            {data.campaignsByStatus?.map((item, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <Chip
                  label={`${item.estado}: ${item.count}`}
                  variant="outlined"
                  sx={{ width: '100%' }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

/**
 * Resultado de resumen de campaña
 */
const CampaignSummaryResult = ({ data, message }) => {
  const budgetPercentage = parseFloat(data.budgetPercentage) || 0;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
        {message}
      </Typography>

      <Card>
        <CardHeader
          title={data.campaign?.nombre_campania}
          subheader={`Estado: ${data.campaign?.estado}`}
        />
        <CardContent>
          <Grid container spacing={2}>
            {/* Información básica */}
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold' }}>
                Cliente
              </Typography>
              <Typography variant="body2">{data.campaign?.cliente_id}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold' }}>
                Período
              </Typography>
              <Typography variant="body2">
                {new Date(data.campaign?.fecha_inicio).toLocaleDateString('es-CL')} -{' '}
                {new Date(data.campaign?.fecha_fin).toLocaleDateString('es-CL')}
              </Typography>
            </Grid>

            {/* Presupuesto */}
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold', display: 'block', mb: 1 }}>
                Presupuesto: ${data.campaign?.presupuesto_total?.toLocaleString('es-CL')}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={budgetPercentage}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption">
                  Gastado: ${data.budgetSpent?.toLocaleString('es-CL')}
                </Typography>
                <Typography variant="caption">
                  Disponible: ${data.budgetRemaining?.toLocaleString('es-CL')}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, fontWeight: 'bold' }}>
                {budgetPercentage.toFixed(1)}% utilizado
              </Typography>
            </Grid>

            {/* Planes y Temas */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 1.5, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold' }}>
                  Planes
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {data.totalPlans}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 1.5, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold' }}>
                  Temas
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {data.totalTemas}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

/**
 * Resultado de detalle (objeto único)
 */
const DetailResult = ({ data, message, onAction }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
        {message}
      </Typography>

      <Card>
        <CardContent>
          <Grid container spacing={2}>
            {Object.entries(data).map(([key, value]) => (
              <Grid item xs={12} sm={6} key={key}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold' }}>
                    {formatColumnName(key)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, wordBreak: 'break-word' }}>
                    {formatCellValue(value)}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

/**
 * Resultado de exportación
 */
const ExportResult = ({ data, filename, message }) => {
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    element.href = URL.createObjectURL(file);
    element.download = filename || 'export.csv';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Alert severity="success" sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {message}
            </Typography>
            <Typography variant="caption">Archivo: {filename}</Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
        >
          Descargar
        </Button>
      </Box>
    </Alert>
  );
};

/**
 * Utilidades de formato
 */
const formatColumnName = (name) => {
  return name
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

const formatCellValue = (value) => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'number') return value.toLocaleString('es-CL');
  if (value instanceof Date) return value.toLocaleDateString('es-CL');
  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
    return new Date(value).toLocaleDateString('es-CL');
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value).substring(0, 50);
};

export default ResultsRenderer;
