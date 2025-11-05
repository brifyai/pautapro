import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const DashboardTest = () => {
  const [pieData, setPieData] = useState({
    labels: ['Cargando...'],
    datasets: [{
      data: [100],
      backgroundColor: ['#cbd5e1'],
      borderWidth: 0,
    }]
  });

  const [barData, setBarData] = useState({
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{
      label: 'Campañas',
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: '#3b82f6',
      borderWidth: 0,
    }]
  });

  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loadCount, setLoadCount] = useState(0);

  const loadTestData = () => {
    console.log('🧪 Cargando datos de prueba - Load count:', loadCount + 1);
    setLoading(true);
    
    // Simular carga de datos
    setTimeout(() => {
      setPieData({
        labels: ['Cliente A', 'Cliente B', 'Cliente C', 'Cliente D', 'Cliente E'],
        datasets: [{
          data: [30, 25, 20, 15, 10],
          backgroundColor: ['#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#3b82f6'],
          borderWidth: 0,
        }]
      });

      setBarData({
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
          label: 'Campañas',
          data: [12, 19, 8, 15, 22, 18],
          backgroundColor: '#3b82f6',
          borderWidth: 0,
        }]
      });

      setLoading(false);
      setLastUpdate(new Date());
      setLoadCount(prev => prev + 1);
      
      console.log('✅ Datos de prueba cargados - Total loads:', loadCount + 1);
    }, 1000);
  };

  useEffect(() => {
    console.log('🚀 DashboardTest useEffect - Carga inicial');
    loadTestData();
    
    // ABSOLUTAMENTE NINGÚN INTERVALO O ACTUALIZACIÓN AUTOMÁTICA
    console.log('📊 DashboardTest montado - Sin actualizaciones automáticas');
    
    return () => {
      console.log('🧹 DashboardTest desmontado');
    };
  }, []); // Array vacío = ejecutar solo una vez

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 8,
          font: { size: 12 },
          boxWidth: 12,
          boxHeight: 12
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true },
      x: { grid: { display: false } }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🧪 Dashboard de Prueba (Aislado)
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body1">
          Última actualización: {lastUpdate.toLocaleTimeString()}
        </Typography>
        <Typography variant="body1" color="primary">
          N° de cargas: {loadCount}
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={loadTestData}
          disabled={loading}
        >
          Refresh Manual
        </Button>
      </Box>

      {loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Cargando...</Typography>
        </Box>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Gráfico de Pastel (Prueba)
            </Typography>
            <Box sx={{ height: 300 }}>
              <Pie data={pieData} options={pieOptions} />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Gráfico de Barras (Prueba)
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar data={barData} options={barOptions} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          📋 Instrucciones de Prueba:
        </Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li>Los gráficos deben cargar UNA SOLA VEZ al montar el componente</li>
            <li>No deben haber actualizaciones automáticas</li>
            <li>El contador de cargas debe incrementarse SOLO con el botón manual</li>
            <li>Si los gráficos siguen desapareciendo, el problema está en Chart.js o React</li>
            <li>Si los gráficos permanecen estáticos, el problema está en los servicios del Dashboard original</li>
          </ul>
        </Typography>
      </Box>
    </Box>
  );
};

export default DashboardTest;