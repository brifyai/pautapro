# Documentación de Pruebas Unitarias

## Overview

Este directorio contiene las pruebas unitarias para los componentes refactorizados y el módulo de rentabilidad inteligente del sistema.

## Estructura de Archivos

```
src/test/
├── setup.js                           # Configuración inicial para pruebas
├── services/
│   └── rentabilidadInteligenteService.test.js  # Pruebas del servicio de rentabilidad
├── components/
│   ├── RentabilidadDashboard.test.jsx   # Pruebas del dashboard de rentabilidad
│   └── CrearOrdenConRentabilidad.test.jsx # Pruebas del componente de creación de órdenes
├── utils/
│   └── sweetAlertUtils.test.js          # Pruebas de las utilidades de SweetAlert2
└── README.md                           # Este archivo
```

## Configuración

### Dependencias Instaladas

- **@testing-library/react**: Para pruebas de componentes React
- **@testing-library/jest-dom**: Para matchers personalizados de DOM
- **@testing-library/user-event**: Para simular interacciones del usuario
- **vitest**: Framework de pruebas
- **@vitest/coverage-v8**: Para reportes de cobertura
- **jsdom**: Para simular el entorno del navegador

### Scripts Disponibles

```bash
# Ejecutar todas las pruebas
npm run test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar pruebas con interfaz gráfica
npm run test:ui

# Ejecutar pruebas una sola vez
npm run test:run

# Generar reporte de cobertura
npm run test:coverage
```

## Pruebas Implementadas

### 1. RentabilidadInteligenteService

**Archivo**: `src/test/services/rentabilidadInteligenteService.test.js`

**Pruebas cubiertas**:
- ✅ Cálculo de rentabilidad de órdenes
- ✅ Análisis de oportunidades de mejora
- ✅ Obtención de métricas de rentabilidad
- ✅ Guardado de análisis de rentabilidad
- ✅ Generación de reportes
- ✅ Obtención de tendencias
- ✅ Manejo de errores

**Cobertura esperada**: >90%

### 2. RentabilidadDashboard

**Archivo**: `src/test/components/RentabilidadDashboard.test.jsx`

**Pruebas cubiertas**:
- ✅ Renderizado del dashboard
- ✅ Mostrar métricas principales
- ✅ Mostrar tendencias
- ✅ Cambio de período de tiempo
- ✅ Generación de reportes
- ✅ Mostrar oportunidades de mejora
- ✅ Manejo de errores
- ✅ Actualización manual de datos
- ✅ Filtros por cliente
- ✅ Indicadores KPI

**Cobertura esperada**: >85%

### 3. CrearOrdenConRentabilidad

**Archivo**: `src/test/components/CrearOrdenConRentabilidad.test.jsx`

**Pruebas cubiertas**:
- ✅ Renderizado del formulario
- ✅ Cálculo de rentabilidad en tiempo real
- ✅ Mostrar oportunidades de mejora
- ✅ Validación de campos
- ✅ Guardado de órdenes
- ✅ Recomendaciones de IA
- ✅ Aplicación de sugerencias
- ✅ Indicadores visuales
- ✅ Manejo de errores
- ✅ Guardado como borrador
- ✅ Histórico de rentabilidad
- ✅ Comparación de escenarios
- ✅ Validación de rangos

**Cobertura esperada**: >85%

### 4. SweetAlertUtils

**Archivo**: `src/test/utils/sweetAlertUtils.test.js`

**Pruebas cubiertas**:
- ✅ Alertas de éxito, error, advertencia, info
- ✅ Diálogos de confirmación
- ✅ Alertas personalizadas
- ✅ Indicadores de carga
- ✅ Notificaciones toast
- ✅ Inputs de texto y contraseña
- ✅ Alertas con temporizador
- ✅ Alertas con HTML
- ✅ Confirmaciones especiales (eliminar, guardar, etc.)
- ✅ Manejo de sesión y permisos
- ✅ Confirmaciones con IA

**Cobertura esperada**: >95%

## Configuración de Cobertura

### Umbrales Mínimos

```javascript
thresholds: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

### Archivos Excluidos

- `node_modules/`
- `src/test/`
- `**/*.d.ts`
- `**/*.config.*`
- `dist/`
- `coverage/`

## Mocks Configurados

### SweetAlert2
```javascript
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
    showLoading: vi.fn(),
    close: vi.fn(),
    update: vi.fn(),
  }
}));
```

### Supabase
```javascript
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    })),
    auth: {
      getUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
    storage: {
      from: vi.fn(),
    },
  }))
}));
```

### APIs del Navegador
- `window.matchMedia`
- `ResizeObserver`
- `IntersectionObserver`
- `localStorage`
- `sessionStorage`

## Buenas Prácticas

### 1. Estructura de una Prueba

```javascript
describe('Componente/Funcionalidad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debe hacer X cuando Y', async () => {
    // Arrange: Configurar el estado inicial
    // Act: Ejecutar la acción
    // Assert: Verificar el resultado
  });
});
```

### 2. Mocks Asíncronos

```javascript
// Mock de servicio
mockService.mockResolvedValue(mockData);

// Esperar actualizaciones asíncronas
await waitFor(() => {
  expect(screen.getByText('Resultado')).toBeInTheDocument();
});
```

### 3. Simulación de Interacciones

```javascript
// Eventos de usuario
fireEvent.change(input, { target: { value: 'nuevo valor' } });
fireEvent.click(button);

// Eventos de usuario más realistas
userEvent.type(input, 'texto');
userEvent.click(button);
```

### 4. Verificaciones

```javascript
// Verificar existencia de elementos
expect(screen.getByText('Texto')).toBeInTheDocument();
expect(screen.getByRole('button')).toBeInTheDocument();

// Verificar llamadas a funciones
expect(mockFunction).toHaveBeenCalledWith(parametros);
expect(mockFunction).toHaveBeenCalledTimes(1);
```

## Ejecución de Pruebas

### Desarrollo

```bash
# Modo watch para desarrollo
npm run test:watch

# Con interfaz gráfica
npm run test:ui
```

### Integración Continua

```bash
# Ejecutar todas las pruebas
npm run test:run

# Con cobertura
npm run test:coverage
```

### Filtrado de Pruebas

```bash
# Pruebas específicas
npm run test -- RentabilidadDashboard

# Por patrón
npm run test -- --grep "rentabilidad"

# Por archivo
npm run test src/test/services/rentabilidadInteligenteService.test.js
```

## Reportes

### Cobertura

Los reportes de cobertura se generan en:
- `coverage/` - Reporte HTML interactivo
- `coverage/lcov.info` - Para integración con CI/CD
- Consola - Resumen de cobertura

### Resultados

Los resultados se muestran en consola con:
- ✅ Pruebas exitosas
- ❌ Pruebas fallidas
- ⏱️ Tiempo de ejecución
- 📊 Porcentaje de cobertura

## Troubleshooting

### Problemas Comunes

1. **Error: "No matching export"**
   - Verificar que las exportaciones/importaciones sean correctas
   - Usar exportaciones con nombre cuando sea necesario

2. **Error: "Cannot read property of undefined"**
   - Verificar que los mocks estén configurados correctamente
   - Asegurar que los componentes tengan todas las props necesarias

3. **Error: "Act is not a function"**
   - Importar `fireEvent` o `userEvent` desde testing-library
   - Verificar que se esté usando la sintaxis correcta

4. **Error: "Found multiple elements"**
   - Usar selectores más específicos
   - Usar `getAllBy` cuando se esperan múltiples elementos

### Depuración

```javascript
// Mostrar el DOM
screen.debug();

// Mostrar un elemento específico
screen.debug(screen.getByTestId('elemento'));

// Pausar ejecución
screen.debug();
await new Promise(resolve => setTimeout(resolve, 1000));
```

## Próximos Pasos

1. **Agregar pruebas para componentes restantes**
   - Dashboard principal
   - Campañas
   - ClientesOptimized
   - CrearOrdenOptimized

2. **Mejorar cobertura**
   - Alcanzar >80% en todos los componentes
   - Agregar pruebas de casos límite

3. **Pruebas de integración**
   - Flujo completo de creación de órdenes
   - Integración con Supabase

4. **Pruebas E2E**
   - Configurar Cypress o Playwright
   - Pruebas de flujo de usuario completo

## Recursos

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)