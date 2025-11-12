import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './assets/css/light-theme.css'

import App from './App.jsx'

// Inicializar optimizador de memoria para reducir consumo de 156MB a <50MB
// DESACTIVADO: Estaba causando re-renders cada 30 segundos que afectaban los gráficos del Dashboard
// import './utils/memoryOptimizer.js'

// Configurar manejo de errores globales para mejor estabilidad
window.addEventListener('error', (event) => {
  console.error('Error global capturado:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promesa rechazada no manejada:', event.reason);
});

createRoot(document.getElementById('root')).render(
  <App />
)
