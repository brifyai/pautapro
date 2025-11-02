# 📋 Guía para Encontrar Órdenes en http://localhost:5173/ordenes/revisar

## 🔍 **PROBLEMA IDENTIFICADO**
Las órdenes existen en la base de datos, pero no todas las campañas tienen órdenes asignadas.

## 📊 **DATOS CONFIRMADOS**
- ✅ **371 órdenes** en estado "activo" existen
- ✅ **21 clientes** disponibles
- ✅ **Múltiples campañas** pero solo algunas tienen órdenes

## 🎯 **PASOS PARA ENCONTRAR LAS ÓRDENES**

### Paso 1: Seleccionar el Cliente Correcto
1. En la página de revisión de órdenes, selecciona el cliente: **"Empresa Ejemplo S.A."**
   - Este cliente tiene campañas con órdenes confirmadas

### Paso 2: Seleccionar la Campaña con Órdenes
1. Busca la campaña: **"Campaña Navidad 2024"**
   - Esta campaña tiene 1 orden confirmada
2. O busca la campaña: **"Cordillera Foods - Urban Branding - Nov-Dic 2025"**
   - Esta campaña tiene 19 órdenes confirmadas

### Paso 3: Ver las Órdenes
Una vez seleccionada la campaña correcta, verás las órdenes en la tabla.

## 🚀 **SOLUCIÓN RÁPIDA**

### Cliente con Órdenes Confirmadas:
- **Nombre:** Empresa Ejemplo S.A.
- **ID:** 1

### Campañas con Órdenes:
1. **"Campaña Navidad 2024"** (ID: 1) → 1 orden
2. **"Cordillera Foods - Urban Branding - Nov-Dic 2025"** (ID: 63) → 19 órdenes

## 💡 **TIP ADICIONAL**
- No todas las campañas tienen órdenes asignadas
- Las órdenes están distribuidas en pocas campañas específicas
- Usa los clientes y campañas mencionadas arriba para encontrar las órdenes rápidamente

## ✅ **VERIFICACIÓN**
Si sigues estos pasos, deberías ver:
- La tabla de órdenes con datos
- Los botones de acción (Imprimir, Anular, etc.) habilitados
- Los detalles de cada orden

---
**El sistema está funcionando correctamente, solo necesita seleccionar las campañas que tienen órdenes asignadas.**