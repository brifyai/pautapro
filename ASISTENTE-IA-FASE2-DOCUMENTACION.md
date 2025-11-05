# 🤖 Asistente IA Ejecutivo - FASE 2: Action Handlers

## 📋 Resumen Ejecutivo

La **FASE 2** implementa 5 handlers especializados que permiten al Asistente IA ejecutar operaciones CRUD completas en todas las entidades principales del sistema PautaPro:

- ✅ **clientActionHandler.js** - Gestión de clientes
- ✅ **providerActionHandler.js** - Gestión de proveedores
- ✅ **mediaActionHandler.js** - Gestión de medios y temas
- ✅ **campaignActionHandler.js** - Gestión de campañas
- ✅ **orderActionHandler.js** - Gestión de órdenes
- ✅ **index.js** - Integración centralizada

---

## 🏗️ Arquitectura de Handlers

### Estructura Base de Cada Handler

```javascript
class EntityActionHandler {
  constructor() {
    this.tableName = 'tabla_principal';
    this.logger = this.createLogger();
  }

  // Métodos CRUD
  async create(data) { }
  async search(filters) { }
  async getById(id) { }
  async update(id, data) { }
  async delete(id, force) { }

  // Métodos Especializados
  async changeStatus(id, newStatus) { }
  async getStats() { }
  async export(filters) { }

  // Métodos Auxiliares
  validateData(data, mode) { }
}
```

---

## 📊 Handlers Implementados

### 1️⃣ Client Action Handler
**Archivo:** [`src/services/aiHandlers/clientActionHandler.js`](src/services/aiHandlers/clientActionHandler.js)

#### Métodos Disponibles:
| Método | Descripción | Parámetros |
|--------|-------------|-----------|
| `createClient()` | Crear nuevo cliente | nombre, email, telefono, direccion, ciudad, region, tipo_cliente |
| `searchClients()` | Buscar clientes | nombre, email, estado, tipo_cliente, limit, offset |
| `getClientById()` | Obtener cliente por ID | id |
| `updateClient()` | Actualizar cliente | id, ...campos |
| `changeClientStatus()` | Cambiar estado | id, estado (activo/inactivo/suspendido) |
| `deleteClient()` | Eliminar cliente | id, force |
| `getClientStats()` | Estadísticas | - |
| `exportClients()` | Exportar a CSV | filters |

#### Ejemplo de Uso:
```javascript
import { clientActionHandler } from './aiHandlers/clientActionHandler';

// Crear cliente
const result = await clientActionHandler.createClient({
  nombre: 'Acme Corp',
  email: 'contacto@acme.com',
  telefono: '+56912345678',
  ciudad: 'Santiago',
  region: 'Metropolitana',
  tipo_cliente: 'Empresa'
});

// Buscar clientes
const search = await clientActionHandler.searchClients({
  nombre: 'Acme',
  estado: 'activo',
  limit: 10
});

// Obtener estadísticas
const stats = await clientActionHandler.getClientStats();
```

---

### 2️⃣ Provider Action Handler
**Archivo:** [`src/services/aiHandlers/providerActionHandler.js`](src/services/aiHandlers/providerActionHandler.js)

#### Métodos Disponibles:
| Método | Descripción | Parámetros |
|--------|-------------|-----------|
| `createProvider()` | Crear nuevo proveedor | nombre, rut, email, telefono, tipo_proveedor, comision |
| `searchProviders()` | Buscar proveedores | nombre, rut, tipo, estado, region, limit, offset |
| `getProviderById()` | Obtener proveedor por ID | id |
| `updateProvider()` | Actualizar proveedor | id, ...campos |
| `changeProviderStatus()` | Cambiar estado | id, estado (activo/inactivo/suspendido/bloqueado) |
| `deleteProvider()` | Eliminar proveedor | id, force |
| `getProviderStats()` | Estadísticas | - |
| `exportProviders()` | Exportar a CSV | filters |
| `getProviderTypes()` | Obtener tipos | - |
| `getRegions()` | Obtener regiones | - |

#### Ejemplo de Uso:
```javascript
import { providerActionHandler } from './aiHandlers/providerActionHandler';

// Crear proveedor
const result = await providerActionHandler.createProvider({
  nombre: 'Medios Digitales SA',
  rut: '76123456-7',
  email: 'ventas@mediosdigitales.cl',
  tipo_proveedor: 'Digital',
  comision_porcentaje: 15
});

// Buscar por región
const providers = await providerActionHandler.searchProviders({
  region: 'Metropolitana',
  estado: 'activo'
});

// Obtener tipos disponibles
const types = await providerActionHandler.getProviderTypes();
```

---

### 3️⃣ Media Action Handler
**Archivo:** [`src/services/aiHandlers/mediaActionHandler.js`](src/services/aiHandlers/mediaActionHandler.js)

#### Métodos Disponibles (Medios):
| Método | Descripción | Parámetros |
|--------|-------------|-----------|
| `createMedia()` | Crear nuevo medio | nombre, tipo_medio, descripcion, costo_base, alcance |
| `searchMedias()` | Buscar medios | nombre, tipo, estado, minCosto, maxCosto, limit, offset |
| `getMediaById()` | Obtener medio por ID | id |
| `updateMedia()` | Actualizar medio | id, ...campos |
| `changeMediaStatus()` | Cambiar estado | id, estado (activo/inactivo/archivado) |
| `deleteMedia()` | Eliminar medio | id, force |
| `getMediaStats()` | Estadísticas | - |
| `exportMedias()` | Exportar a CSV | filters |
| `getMediaTypes()` | Obtener tipos | - |

#### Métodos Disponibles (Temas):
| Método | Descripción | Parámetros |
|--------|-------------|-----------|
| `createTema()` | Crear nuevo tema | nombre, tipo_contenido, duracion_segundos, costo_produccion |
| `searchTemas()` | Buscar temas | nombre, tipo, minDuracion, maxDuracion, limit, offset |
| `getTemaById()` | Obtener tema por ID | id |
| `updateTema()` | Actualizar tema | id, ...campos |
| `changeTemaStatus()` | Cambiar estado | id, estado (activo/inactivo/archivado) |
| `deleteTema()` | Eliminar tema | id, force |
| `getTemaStats()` | Estadísticas | - |
| `exportTemas()` | Exportar a CSV | filters |
| `getContentTypes()` | Obtener tipos | - |

#### Ejemplo de Uso:
```javascript
import { mediaActionHandler } from './aiHandlers/mediaActionHandler';

// Crear medio
const media = await mediaActionHandler.createMedia({
  nombre: 'Radio Cooperativa',
  tipo_medio: 'Radio',
  descripcion: 'Emisora de radio nacional',
  costo_base: 500000,
  alcance_estimado: 1000000
});

// Crear tema
const tema = await mediaActionHandler.createTema({
  nombre: 'Spot Publicitario 30s',
  tipo_contenido: 'Audio',
  duracion_segundos: 30,
  costo_produccion: 50000
});

// Buscar medios por rango de costo
const medios = await mediaActionHandler.searchMedias({
  minCosto: 100000,
  maxCosto: 1000000,
  estado: 'activo'
});
```

---

### 4️⃣ Campaign Action Handler
**Archivo:** [`src/services/aiHandlers/campaignActionHandler.js`](src/services/aiHandlers/campaignActionHandler.js)

#### Métodos Disponibles:
| Método | Descripción | Parámetros |
|--------|-------------|-----------|
| `createCampaign()` | Crear nueva campaña | nombre, cliente_id, fecha_inicio, fecha_fin, presupuesto |
| `searchCampaigns()` | Buscar campañas | nombre, cliente_id, estado, minPresupuesto, maxPresupuesto |
| `getCampaignById()` | Obtener campaña por ID | id |
| `updateCampaign()` | Actualizar campaña | id, ...campos |
| `changeCampaignStatus()` | Cambiar estado | id, estado (planificacion/activa/pausada/finalizada/cancelada) |
| `deleteCampaign()` | Eliminar campaña | id, force |
| `getCampaignPlans()` | Obtener planes | campaignId |
| `getCampaignTemas()` | Obtener temas | campaignId |
| `addTemaToCampaign()` | Agregar tema | campaignId, temaId |
| `getCampaignStats()` | Estadísticas | - |
| `getCampaignSummary()` | Resumen completo | campaignId |
| `calculateSpentBudget()` | Presupuesto gastado | campaignId |
| `exportCampaigns()` | Exportar a CSV | filters |

#### Ejemplo de Uso:
```javascript
import { campaignActionHandler } from './aiHandlers/campaignActionHandler';

// Crear campaña
const campaign = await campaignActionHandler.createCampaign({
  nombre: 'Campaña Verano 2024',
  cliente_id: 5,
  fecha_inicio: '2024-12-01',
  fecha_fin: '2025-02-28',
  presupuesto: 5000000,
  objetivo: 'Aumentar ventas en 30%',
  publico_objetivo: 'Jóvenes 18-35 años'
});

// Obtener resumen completo
const summary = await campaignActionHandler.getCampaignSummary(campaign.data.id);
// Retorna: campaign, totalPlans, totalTemas, budgetSpent, budgetRemaining, budgetPercentage

// Cambiar estado
await campaignActionHandler.changeCampaignStatus(campaign.data.id, 'activa');

// Agregar tema a campaña
await campaignActionHandler.addTemaToCampaign(campaign.data.id, 12);
```

---

### 5️⃣ Order Action Handler
**Archivo:** [`src/services/aiHandlers/orderActionHandler.js`](src/services/aiHandlers/orderActionHandler.js)

#### Métodos Disponibles:
| Método | Descripción | Parámetros |
|--------|-------------|-----------|
| `createOrder()` | Crear nueva orden | cliente_id, proveedor_id, fecha_entrega, monto_total |
| `searchOrders()` | Buscar órdenes | numero_orden, cliente_id, proveedor_id, estado, prioridad |
| `getOrderById()` | Obtener orden por ID | id |
| `updateOrder()` | Actualizar orden | id, ...campos |
| `changeOrderStatus()` | Cambiar estado | id, estado (pendiente/confirmada/en_proceso/entregada/cancelada/rechazada) |
| `changeOrderPriority()` | Cambiar prioridad | id, prioridad (baja/normal/alta/urgente) |
| `deleteOrder()` | Eliminar orden | id, force |
| `getOrderDetails()` | Obtener detalles | orderId |
| `addOrderDetail()` | Agregar detalle | orderId, detail |
| `getOrderStats()` | Estadísticas | - |
| `getPendingOrders()` | Órdenes pendientes | - |
| `getUrgentOrders()` | Órdenes urgentes | - |
| `exportOrders()` | Exportar a CSV | filters |
| `generateOrderNumber()` | Generar número único | - |

#### Ejemplo de Uso:
```javascript
import { orderActionHandler } from './aiHandlers/orderActionHandler';

// Crear orden
const order = await orderActionHandler.createOrder({
  cliente_id: 5,
  proveedor_id: 3,
  fecha_entrega: '2024-12-15',
  monto_total: 1500000,
  prioridad: 'alta',
  descripcion: 'Orden de medios para campaña verano'
});

// Agregar detalles
await orderActionHandler.addOrderDetail(order.data.id, {
  descripcion: 'Spot en Radio Cooperativa',
  cantidad: 10,
  precio_unitario: 150000
});

// Cambiar estado
await orderActionHandler.changeOrderStatus(order.data.id, 'confirmada');

// Cambiar prioridad
await orderActionHandler.changeOrderPriority(order.data.id, 'urgente');

// Obtener órdenes urgentes
const urgent = await orderActionHandler.getUrgentOrders();

// Obtener órdenes pendientes
const pending = await orderActionHandler.getPendingOrders();
```

---

## 🔗 Integración Centralizada

### Archivo Index
**Archivo:** [`src/services/aiHandlers/index.js`](src/services/aiHandlers/index.js)

Proporciona:
1. **Registro centralizado** de todos los handlers
2. **Mapeo de intenciones** a métodos específicos
3. **Ejecución unificada** de acciones
4. **Validación de parámetros** automática

#### Funciones Principales:

```javascript
// 1. Ejecutar intención
import { executeIntention } from './aiHandlers';

const result = await executeIntention('CREATE_CLIENT', {
  nombre: 'Nuevo Cliente',
  email: 'cliente@example.com'
});

// 2. Obtener información de intención
import { getIntentionInfo } from './aiHandlers';

const info = getIntentionInfo('CREATE_CLIENT');
// Retorna: descripción, parámetros requeridos, opcionales, etc.

// 3. Listar todas las intenciones
import { listAvailableIntentions } from './aiHandlers';

const intentions = listAvailableIntentions();

// 4. Filtrar por handler
import { getIntentionsByHandler } from './aiHandlers';

const clientIntentions = getIntentionsByHandler('client');

// 5. Obtener estadísticas de todos los handlers
import { getHandlersStats } from './aiHandlers';

const stats = await getHandlersStats();
```

---

## 📋 Mapeo de Intenciones

### Intenciones de Cliente (8 total)
- `CREATE_CLIENT` - Crear cliente
- `SEARCH_CLIENTS` - Buscar clientes
- `GET_CLIENT` - Obtener cliente
- `GET_CLIENT_STATS` - Estadísticas
- `UPDATE_CLIENT` - Actualizar cliente
- `CHANGE_CLIENT_STATUS` - Cambiar estado
- `DELETE_CLIENT` - Eliminar cliente
- `EXPORT_CLIENTS` - Exportar a CSV

### Intenciones de Proveedor (8 total)
- `CREATE_PROVIDER` - Crear proveedor
- `SEARCH_PROVIDERS` - Buscar proveedores
- `GET_PROVIDER` - Obtener proveedor
- `GET_PROVIDER_STATS` - Estadísticas
- `UPDATE_PROVIDER` - Actualizar proveedor
- `CHANGE_PROVIDER_STATUS` - Cambiar estado
- `DELETE_PROVIDER` - Eliminar proveedor
- `EXPORT_PROVIDERS` - Exportar a CSV

### Intenciones de Medio/Tema (16 total)
- `CREATE_MEDIA` / `CREATE_TEMA` - Crear
- `SEARCH_MEDIAS` / `SEARCH_TEMAS` - Buscar
- `GET_MEDIA` / `GET_TEMA` - Obtener
- `GET_MEDIA_STATS` / `GET_TEMA_STATS` - Estadísticas
- `UPDATE_MEDIA` / `UPDATE_TEMA` - Actualizar
- `CHANGE_MEDIA_STATUS` / `CHANGE_TEMA_STATUS` - Cambiar estado
- `DELETE_MEDIA` / `DELETE_TEMA` - Eliminar
- `EXPORT_MEDIAS` / `EXPORT_TEMAS` - Exportar

### Intenciones de Campaña (8 total)
- `CREATE_CAMPAIGN` - Crear campaña
- `SEARCH_CAMPAIGNS` - Buscar campañas
- `GET_CAMPAIGN` - Obtener campaña
- `GET_CAMPAIGN_STATS` - Estadísticas
- `UPDATE_CAMPAIGN` - Actualizar campaña
- `CHANGE_CAMPAIGN_STATUS` - Cambiar estado
- `DELETE_CAMPAIGN` - Eliminar campaña
- `EXPORT_CAMPAIGNS` - Exportar a CSV

### Intenciones de Orden (10 total)
- `CREATE_ORDER` - Crear orden
- `SEARCH_ORDERS` - Buscar órdenes
- `GET_ORDER` - Obtener orden
- `GET_ORDER_STATS` - Estadísticas
- `UPDATE_ORDER` - Actualizar orden
- `CHANGE_ORDER_STATUS` - Cambiar estado
- `CHANGE_ORDER_PRIORITY` - Cambiar prioridad
- `DELETE_ORDER` - Eliminar orden
- `GET_PENDING_ORDERS` - Órdenes pendientes
- `GET_URGENT_ORDERS` - Órdenes urgentes

**Total: 58 intenciones mapeadas**

---

## 🔄 Flujo de Ejecución

```
Usuario escribe comando
    ↓
NLP Avanzado (advancedNLPService.js)
    ↓
Detecta intención + extrae entidades
    ↓
Action Orchestrator (actionOrchestrator.js)
    ↓
Valida permisos por rol
    ↓
Busca en intentionHandlerMap
    ↓
Ejecuta executeIntention()
    ↓
Selecciona handler correcto
    ↓
Valida parámetros
    ↓
Ejecuta método específico
    ↓
Retorna resultado
    ↓
ChatIA muestra respuesta
```

---

## 🛡️ Validación y Seguridad

### Validación de Datos
Cada handler implementa `validateData()`:
- Parámetros requeridos
- Tipos de datos
- Rangos de valores
- Formatos especiales (email, teléfono, RUT)

### Manejo de Errores
Respuestas estandarizadas:
```javascript
{
  success: boolean,
  data: object | null,
  error: string | null,
  code: string, // VALIDATION_ERROR, DATABASE_ERROR, NOT_FOUND, etc.
  message: string
}
```

### Logging Detallado
Cada handler mantiene logs de:
- Operaciones exitosas
- Errores y excepciones
- Advertencias

---

## 📈 Estadísticas Disponibles

### Por Handler:
- **Clientes:** Total, activos, inactivos, por tipo
- **Proveedores:** Total, activos, por tipo, por región, comisión promedio
- **Medios:** Total, activos, por tipo, costo promedio
- **Temas:** Total, activos, por tipo, duración promedio
- **Campañas:** Total, activas, por estado, presupuesto total/promedio
- **Órdenes:** Total, por estado, por prioridad, monto total/promedio

---

## 🚀 Próximos Pasos (FASE 3)

1. **Mejorar interfaz ChatIA**
   - Visualización de resultados
   - Tablas interactivas
   - Gráficos de estadísticas
   - Confirmación de acciones

2. **Integración con ChatIA**
   - Conectar handlers con componente
   - Manejo de respuestas
   - Feedback visual

3. **Testing exhaustivo**
   - Unit tests para cada handler
   - Integration tests
   - Casos de error

---

## 📚 Referencias

- [`src/services/aiExecutiveService.js`](src/services/aiExecutiveService.js) - NLP base
- [`src/services/advancedNLPService.js`](src/services/advancedNLPService.js) - NLP avanzado
- [`src/services/actionOrchestrator.js`](src/services/actionOrchestrator.js) - Orquestador
- [`src/services/aiHandlers/`](src/services/aiHandlers/) - Directorio de handlers
- [`src/components/chat/ChatIA.jsx`](src/components/chat/ChatIA.jsx) - Interfaz

---

**Última actualización:** 2025-11-05
**Estado:** ✅ FASE 2 COMPLETADA
**Próxima fase:** FASE 3 - Mejora de interfaz ChatIA
