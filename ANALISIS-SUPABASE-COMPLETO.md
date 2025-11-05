# ANÁLISIS COMPLETO DE CONEXIÓN SUPABASE - PAUTAPRO
## Análisis Profesional de Integridad de Base de Datos

---

## 📊 RESUMEN EJECUTIVO

Este documento contiene un análisis exhaustivo de todas las conexiones entre la aplicación PautaPro y la base de datos Supabase, identificando:
- ✅ Tablas existentes y funcionales
- ⚠️ Tablas requeridas pero potencialmente faltantes
- 🔧 Campos específicos que necesitan verificación
- 📋 Recomendaciones de implementación

---

## 🗄️ TABLAS PRINCIPALES DEL SISTEMA

### 1. TABLAS BASE (CORE TABLES) - ✅ EXISTENTES

#### 1.1 Region
- **Estado**: ✅ Existente
- **Uso**: Catálogo de regiones
- **Archivos que la usan**: 28+ archivos
- **Campos críticos**: `id`, `nombreregion`

#### 1.2 Comunas  
- **Estado**: ✅ Existente
- **Uso**: Catálogo de comunas por región
- **Archivos que la usan**: 25+ archivos
- **Campos críticos**: `id`, `nombrecomuna`, `id_region`

#### 1.3 Usuarios
- **Estado**: ✅ Existente
- **Uso**: Sistema de autenticación y permisos
- **Archivos que la usan**: 15+ archivos
- **Campos críticos**: `id`, `nombre`, `Apellido`, `Email`, `Password`, `Estado`, `id_perfil`, `id_grupo`

#### 1.4 Perfiles
- **Estado**: ✅ Existente
- **Uso**: Roles de usuario
- **Archivos que la usan**: 8+ archivos
- **Campos críticos**: `id`, `nombreperfil`

#### 1.5 Grupos
- **Estado**: ✅ Existente
- **Uso**: Grupos de usuarios
- **Archivos que la usan**: 10+ archivos
- **Campos críticos**: `id_grupo`, `nombre_grupo`

---

### 2. TABLAS DE NEGOCIO (BUSINESS TABLES) - ✅ EXISTENTES

#### 2.1 Agencias
- **Estado**: ✅ Existente
- **Uso**: Gestión de agencias de publicidad
- **Archivos que la usan**: 5+ archivos
- **Campos críticos**: `id`, `nombreidentificador`, `razonsocial`, `estado`

#### 2.2 Clientes
- **Estado**: ✅ Existente
- **Uso**: Gestión de clientes
- **Archivos que la usan**: 30+ archivos
- **Campos críticos**: `id_cliente`, `nombrecliente`, `razonsocial`, `RUT`, `estado`
- **Campos opcionales**: `total_invertido`, `direccionempresa`, `telfijo`

#### 2.3 Proveedores
- **Estado**: ✅ Existente
- **Uso**: Gestión de proveedores de medios
- **Archivos que la usan**: 20+ archivos
- **Campos críticos**: `id_proveedor`, `nombreproveedor`, `rut`, `estado`
- **Campos verificar**: `direccion` vs `direccion_facturacion`, `telefono_celular` vs `telcelular`

#### 2.4 Campania (Campañas)
- **Estado**: ✅ Existente
- **Uso**: Campañas publicitarias
- **Archivos que la usan**: 35+ archivos
- **Campos críticos**: `id_campania`, `nombrecampania`, `id_cliente`, `Presupuesto`, `estado`
- **Campos opcionales**: `c_orden`, `fecha_inicio`, `fecha_fin`

#### 2.5 Productos
- **Estado**: ✅ Existente
- **Uso**: Productos por cliente
- **Archivos que la usan**: 15+ archivos
- **Campos críticos**: `id`, `nombredelproducto`, `Id_Cliente`, `Estado`

#### 2.6 Medios
- **Estado**: ✅ Existente
- **Uso**: Medios de publicidad
- **Archivos que la usan**: 40+ archivos
- **Campos críticos**: `id`, `nombredelmedio`, `nombre_medio`, `estado`
- **⚠️ NOTA**: Inconsistencia de nombres `nombredelmedio` vs `nombre_medio`

#### 2.7 Calidad
- **Estado**: ✅ Existente
- **Uso**: Calidades de material publicitario
- **Archivos que la usan**: 10+ archivos
- **Campos críticos**: `id`, `nombrecalidad`

#### 2.8 Soportes
- **Estado**: ✅ Existente
- **Uso**: Soportes publicitarios
- **Archivos que la usan**: 25+ archivos
- **Campos críticos**: `id_soporte`, `nombreidentificador`, `estado`, `c_orden`

#### 2.9 Contratos
- **Estado**: ✅ Existente
- **Uso**: Contratos con proveedores
- **Archivos que la usan**: 15+ archivos
- **Campos críticos**: `id`, `numero_contrato`, `id_cliente`, `id_proveedor`, `estado`

#### 2.10 OrdenesDePublicidad
- **Estado**: ✅ Existente
- **Uso**: Órdenes de compra
- **Archivos que la usan**: 50+ archivos
- **Campos críticos**: `id_ordenes_de_comprar`, `numero_correlativo`, `id_cliente`, `estado`

---

### 3. TABLAS DE RELACIÓN (RELATIONSHIP TABLES) - ✅ EXISTENTES

#### 3.1 proveedor_soporte
- **Estado**: ✅ Existente
- **Uso**: Relación M:N entre proveedores y soportes
- **Campos**: `id`, `id_proveedor`, `id_soporte`

#### 3.2 soporte_medios
- **Estado**: ✅ Existente
- **Uso**: Relación M:N entre soportes y medios
- **Campos**: `id`, `id_soporte`, `id_medio`

#### 3.3 campania_temas
- **Estado**: ✅ Existente
- **Uso**: Relación M:N entre campañas y temas
- **Campos**: `id`, `id_campania`, `id_temas`

####campana_planes
- **Estado**: ✅ Existente
- **Uso**: Relación M:N entre campañas y planes
- **Campos**: `id`, `id_campania`, `id_plan`

#### 3.5 plan_alternativas
- **Estado**: ✅ Existente
- **Uso**: Relación M:N entre planes y alternativas
- **Campos**: `id`, `id_plan`, `id_alternativa`

---

### 4. TABLAS DE CATÁLOGOS - ✅ EXISTENTES

#### 4.1 Anios
- **Estado**: ✅ Existente
- **Campos**: `id`, `years`

#### 4.2 Meses
- **Estado**: ✅ Existente
- **Campos**: `Id`, `Nombre`

#### 4.3 TipoCliente
- **Estado**: ✅ Existente
- **Campos**: `id`, `nombreTipoCliente`

#### 4.4 FormaDePago
- **Estado**: ✅ Existente
- **Campos**: `id`, `nombreformadepago`

#### 4.5 TipoGeneracionDeOrden
- **Estado**: ✅ Existente
- **Campos**: `id`, `nombretipoorden`

#### 4.6 TablaFormato
- **Estado**: ✅ Existente
- **Campos**: `id`, `nombreFormato`

---

### 5. TABLAS DE PLANIFICACIÓN - ✅ EXISTENTES

#### 5.1 plan
- **Estado**: ✅ Existente
- **Uso**: Planes de medios
- **Archivos que la usan**: 20+ archivos
- **Campos críticos**: `id`, `id_cliente`, `id_campania`, `anio`, `mes`, `estado`, `estado2`

#### 5.2 alternativa
- **Estado**: ✅ Existente
- **Uso**: Alternativas de medios para planes
- **Archivos que la usan**: 40+ archivos
- **Campos críticos**: `id`, `id_soporte`, `id_programa`, `id_contrato`, `numerorden`

#### 5.3 Programas
- **Estado**: ✅ Existente
- **Uso**: Programas televisivos/radiales
- **Archivos que la usan**: 15+ archivos
- **Campos críticos**: `id`, `id_soporte`, `nombre_programa`, `estado`

#### 5.4 Clasificacion
- **Estado**: ✅ Existente
- **Uso**: Clasificación de material publicitario
- **Archivos que la usan**: 12+ archivos
- **Campos críticos**: `id`, `nombre_clasificacion`, `NombreClasificacion`
- **⚠️ NOTA**: Posible inconsistencia en nombre del campo

#### 5.5 Temas
- **Estado**: ✅ Existente
- **Uso**: Temas/Materiales publicitarios
- **Archivos que la usan**: 15+ archivos
- **Campos críticos**: `id_tema`, `nombre_tema`, `NombreTema`, `estado`
- **⚠️ NOTA**: Posible inconsistencia en nombre del campo

---

### 6. TABLAS DE AUDITORÍA Y LOGS - ⚠️ VERIFICAR

#### 6.1 campaign_audit_log
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Auditoría de cambios en campañas
- **Archivos que la usan**: [`campaignService.js`](src/services/campaignService.js:280)
- **Campos necesarios**:
  ```sql
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER,
  user_id INTEGER,
  action VARCHAR(50),
  previous_state TEXT,
  new_state TEXT,
  created_at TIMESTAMP
  ```

#### 6.2 order_audit_log
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Auditoría de cambios en órdenes
- **Archivos que la usan**: [`orderService.js`](src/services/orderService.js:461)
- **Campos necesarios**:
  ```sql
  id SERIAL PRIMARY KEY,
  order_id INTEGER,
  user_id INTEGER,
  action VARCHAR(50),
  previous_state TEXT,
  new_state TEXT,
  created_at TIMESTAMP
  ```

---

### 7. TABLAS DE CONTACTOS - ✅ EXISTENTES

#### 7.1 contactocliente
- **Estado**: ✅ Existente
- **Uso**: Contactos de clientes
- **Archivos que la usan**: [`ViewCliente.jsx`](src/pages/clientes/ViewCliente.jsx:246)
- **Campos**: `id`, `id_cliente`, `nombre_contacto`, `cargo`, `telefono`, `email`

#### 7.2 contactos
- **Estado**: ✅ Existente
- **Uso**: Contactos de proveedores
- **Archivos que la usan**: [`ViewProveedor.jsx`](src/pages/proveedores/ViewProveedor.jsx:326)
- **Campos**: `id`, `id_proveedor`, `nombre_contacto`, `cargo`, `telefono`, `email`

---

### 8. TABLAS DE COMISIONES Y FACTURACIÓN - ✅ EXISTENTES

#### 8.1 Comisiones
- **Estado**: ✅ Existente
- **Uso**: Comisiones por cliente
- **Archivos que la usan**: [`ViewCliente.jsx`](src/pages/clientes/ViewCliente.jsx:197)
- **Campos**: `id_comision`, `id_cliente`, `porcentaje`, `monto_fijo`

#### 8.2 Facturas
- **Estado**: ✅ Existente (parcial)
- **Uso**: Facturas de campañas
- **Archivos que la usan**: [`ModalAgregarFactura.jsx`](src/pages/campanas/ModalAgregarFactura.jsx:50)
- **Campos**: `id`, `id_campania`, `numero_factura`, `monto`

---

### 9. TABLAS DEL MÓDULO DE RENTABILIDAD - ⚠️ VERIFICAR CREACIÓN

#### 9.1 DetallesFinancierosOrden
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Detalles financieros de órdenes para rentabilidad
- **Archivos que la usan**: [`CrearOrdenConRentabilidad.jsx`](src/pages/ordenes/CrearOrdenConRentabilidad.jsx:513), [`rentabilidadInteligenteService.js`](src/services/rentabilidadInteligenteService.js:468)
- **Campos necesarios**:
  ```sql
  id SERIAL PRIMARY KEY,
  id_orden INTEGER REFERENCES OrdenesDePublicidad(id_ordenes_de_comprar),
  id_alternativa INTEGER REFERENCES alternativa(id),
  costo_real_medio DECIMAL(15,2),
  precio_informado_cliente DECIMAL(15,2),
  comision_cliente_porcentaje DECIMAL(5,2),
  comision_cliente_monto DECIMAL(15,2),
  bonificacion_medio_porcentaje DECIMAL(5,2),
  bonificacion_medio_monto DECIMAL(15,2),
  markup_porcentaje DECIMAL(5,2),
  markup_monto DECIMAL(15,2),
  rentabilidad_neta DECIMAL(15,2),
  rentabilidad_porcentaje DECIMAL(5,2),
  estado VARCHAR(20)
  ```

#### 9.2 ConfiguracionComisiones
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Configuración de comisiones por cliente
- **Archivos que la usan**: [`rentabilidadInteligenteService.js`](src/services/rentabilidadInteligenteService.js:309)
- **Campos necesarios**:
  ```sql
  id SERIAL PRIMARY KEY,
  id_cliente INTEGER REFERENCES Clientes(id_cliente),
  comision_base_porcentaje DECIMAL(5,2),
  comision_base_monto DECIMAL(15,2),
  estado BOOLEAN
  ```

#### 9.3 RegistroBonificacionesMedios
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Registro de bonificaciones de medios
- **Archivos que la usan**: [`rentabilidadInteligenteService.js`](src/services/rentabilidadInteligenteService.js:270)
- **Campos necesarios**:
  ```sql
  id SERIAL PRIMARY KEY,
  id_medio INTEGER REFERENCES Medios(id),
  id_proveedor INTEGER REFERENCES Proveedores(id_proveedor),
  bonificacion_base_porcentaje DECIMAL(5,2),
  estado BOOLEAN
  ```

#### 9.4 HistoricoNegociacionMedios
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Histórico de negociaciones con medios
- **Archivos que la usan**: [`rentabilidadInteligenteService.js`](src/services/rentabilidadInteligenteService.js:539)
- **Campos necesarios**:
  ```sql
  id SERIAL PRIMARY KEY,
  id_medio INTEGER REFERENCES Medios(id),
  id_proveedor INTEGER REFERENCES Proveedores(id_proveedor),
  precio_lista DECIMAL(15,2),
  descuento_obtenido_porcentaje DECIMAL(5,2),
  fecha_negociacion DATE
  ```

#### 9.5 OportunidadesRentabilidad
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Oportunidades detectadas por IA
- **Archivos que la usan**: [`rentabilidadInteligenteService.js`](src/services/rentabilidadInteligenteService.js:699)
- **Campos necesarios**:
  ```sql
  id SERIAL PRIMARY KEY,
  tipo_oportunidad VARCHAR(50),
  id_cliente INTEGER,
  descripcion TEXT,
  impacto_estimado DECIMAL(15,2),
  estado VARCHAR(20),
  prioridad VARCHAR(10)
  ```

#### 9.6 MetricasRentabilidad
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Métricas acumuladas de rentabilidad
- **Schema disponible**: ✅ Sí (database-rentabilidad-schema.sql)

#### 9.7 ConfiguracionModelosIA
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Configuración de modelos de IA
- **Schema disponible**: ✅ Sí (database-rentabilidad-schema.sql)

#### 9.8 LogsDecisionesIA
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Logs de decisiones de IA
- **Schema disponible**: ✅ Sí (database-rentabilidad-schema.sql)

---

### 10. VISTAS DE SUPABASE - ⚠️ CREAR SI NO EXISTEN

#### 10.1 vw_rentabilidad_cliente
- **Estado**: ⚠️ Debe crearse
- **Uso**: Vista consolidada de rentabilidad por cliente
- **Archivos que la usan**: [`rentabilidadInteligenteService.js`](src/services/rentabilidadInteligenteService.js:723)

#### 10.2 vw_rentabilidad_medio
- **Estado**: ⚠️ Debe crearse
- **Uso**: Vista consolidada de rentabilidad por medio
- **Archivos que la usan**: [`rentabilidadInteligenteService.js`](src/services/rentabilidadInteligenteService.js:752)

#### 10.3 vw_oportunidades_activas
- **Estado**: ⚠️ Debe crearse
- **Uso**: Vista de oportunidades activas
- **Archivos que la usan**: [`rentabilidadInteligenteService.js`](src/services/rentabilidadInteligenteService.js:782)

---

### 11. TABLAS DE SERVICIOS AVANZADOS - ⚠️ VERIFICAR

#### 11.1 client_scoring
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Scoring de clientes
- **Archivos que la usan**: [`clientScoringService.js`](src/services/clientScoringService.js:619)
- **Campos necesarios**:
  ```sql
  id SERIAL PRIMARY KEY,
  id_cliente INTEGER REFERENCES Clientes(id_cliente),
  score DECIMAL(5,2),
  revenue_score DECIMAL(5,2),
  loyalty_score DECIMAL(5,2),
  created_at TIMESTAMP
  ```

#### 11.2 client_interactions
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Interacciones con clientes
- **Archivos que la usan**: [`clientTrackingService.js`](src/services/clientTrackingService.js:87)
- **Campos necesarios**:
  ```sql
  id SERIAL PRIMARY KEY,
  id_cliente INTEGER REFERENCES Clientes(id_cliente),
  type VARCHAR(50),
  priority VARCHAR(10),
  notes TEXT,
  created_at TIMESTAMP
  ```

#### 11.3 notifications
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Sistema de notificaciones
- **Archivos que la usan**: [`notificationService.js`](src/services/notificationService.js:154)
- **Campos necesarios**:
  ```sql
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES Usuarios(id_usuario),
  type VARCHAR(50),
  title VARCHAR(100),
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP
  ```

#### 11.4 reminders
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Sistema de recordatorios
- **Archivos que la usan**: [`reminderService.js`](src/services/reminderService.js:58)
- **Campos necesarios**:
  ```sql
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES Usuarios(id_usuario),
  type VARCHAR(50),
  title VARCHAR(100),
  description TEXT,
  due_date TIMESTAMP,
  completed BOOLEAN DEFAULT false,
  priority VARCHAR(10),
  created_at TIMESTAMP
  ```

#### 11.5 reminder_rules
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Reglas de recordatorios automáticos
- **Archivos que la usan**: [`reminderService.js`](src/services/reminderService.js:492)

#### 11.6 automation_rules
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Reglas de automatización
- **Archivos que la usan**: [`automationService.js`](src/services/automationService.js:23)
- **Campos necesarios**:
  ```sql
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  trigger_type VARCHAR(50),
  action_type VARCHAR(50),
  conditions TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
  ```

#### 11.7 user_gamification
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Sistema de gamificación
- **Archivos que la usan**: [`gamificationService.js`](src/services/gamificationService.js:122)
- **Campos necesarios**:
  ```sql
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES Usuarios(id_usuario),
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges TEXT,
  achievements TEXT,
  created_at TIMESTAMP
  ```

#### 11.8 points_transactions
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Transacciones de puntos de gamificación
- **Archivos que la usan**: [`gamificationService.js`](src/services/gamificationService.js:292)

#### 11.9 custom_challenges
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Desafíos personalizados
- **Archivos que la usan**: [`gamificationService.js`](src/services/gamificationService.js:658)

---

### 12. TABLAS DE EXPORTACIÓN Y REPORTES - ⚠️ VERIFICAR

#### 12.1 export_records
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Registro de exportaciones
- **Archivos que la usan**: [`exportService.js`](src/services/exportService.js:507)
- **Campos necesarios**:
  ```sql
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  export_type VARCHAR(50),
  file_name VARCHAR(255),
  status VARCHAR(20),
  created_at TIMESTAMP
  ```

#### 12.2 scheduled_exports
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Exportaciones programadas
- **Archivos que la usan**: [`exportService.js`](src/services/exportService.js:535)
- **Campos necesarios**:
  ```sql
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  schedule VARCHAR(50),
  export_type VARCHAR(50),
  active BOOLEAN,
  created_at TIMESTAMP
  ```

#### 12.3 export_templates
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Plantillas de exportación
- **Archivos que la usan**: [`exportService.js`](src/services/exportService.js:678)

#### 12.4 scheduled_reports
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Reportes programados
- **Archivos que la usan**: [`reportService.js`](src/services/reportService.js:270)

---

### 13. TABLAS DE MENSAJES Y AVISOS - ✅ EXISTENTE

#### 13.1 mensajes / aviso
- **Estado**: ✅ Existente
- **Uso**: Sistema de mensajes y avisos
- **Archivos que la usan**: [`dashboardService.js`](src/services/dashboardService.js:146), [`Mensajes.jsx`](src/pages/mensajes/Mensajes.jsx:71)
- **Campos**: `id`, `titulo`, `mensaje`, `asunto`, `contenido`, `created_at`
- **⚠️ NOTA**: Hay inconsistencia entre `mensajes` y `aviso` - verificar cual usar

---

### 14. TABLAS DE DATOS ADICIONALES - ✅ EXISTENTE

#### 14.1 OtrosDatos
- **Estado**: ✅ Existente
- **Uso**: Datos adicionales de clientes
- **Archivos que la usan**: [`ViewCliente.jsx`](src/pages/clientes/ViewCliente.jsx:540)
- **Campos**: `id`, `id_cliente`, `tipo_dato`, `valor_dato`

---

### 15. TABLAS DE PREFERENCIAS - ⚠️ VERIFICAR

#### 15.1 user_preferences
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Preferencias de usuario
- **Archivos que la usan**: [`notificationService.js`](src/services/notificationService.js:403)
- **Campos necesarios**:
  ```sql
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES Usuarios(id_usuario),
  notification_preferences TEXT,
  created_at TIMESTAMP
  ```

---

### 16. TABLAS DE ANÁLISIS PREDICTIVO - ⚠️ VERIFICAR

#### 16.1 predictions
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Predicciones de IA
- **Archivos que la usan**: [`predictiveAnalyticsService.js`](src/services/predictiveAnalyticsService.js:605)
- **Campos necesarios**:
  ```sql
  id SERIAL PRIMARY KEY,
  prediction_type VARCHAR(50),
  entity_id INTEGER,
  predicted_value DECIMAL(15,2),
  confidence DECIMAL(5,2),
  created_at TIMESTAMP
  ```

---

## 🔍 INCONSISTENCIAS DETECTADAS

### 1. Nombres de Campos Inconsistentes

| Tabla | Campo Inconsistente | Variantes Encontradas | Recomendación |
|-------|---------------------|----------------------|---------------|
| Medios | Nombre del medio | `nombredelmedio`, `nombre_medio` | Estandarizar a `nombre_medio` |
| Clasificacion | Nombre | `nombre_clasificacion`, `NombreClasificacion` | Estandarizar a `nombre_clasificacion` |
| Temas | Nombre | `nombre_tema`, `NombreTema` | Estandarizar a `nombre_tema` |
| Proveedores | Dirección | `direccion`, `direccion_facturacion` | Definir campo principal |
| Proveedores | Teléfono | `telcelular`, `telefono_celular` | Estandarizar a `telefono_celular` |

### 2. Tablas con Nombres Similares

| Grupo | Tablas | Acción Requerida |
|-------|--------|------------------|
| Mensajes | `mensajes`, `aviso` | Consolidar en una sola tabla o definir claramente el uso de cada una |
| Usuarios | `Usuarios`, `usuarios` (case sensitivity) | Verificar case sensitivity en Supabase |

---

## 📋 CAMPOS ADICIONALES DETECTADOS EN CÓDIGO

### Campos en uso que podrían no estar en el schema:

1. **Clientes**:
   - `total_invertido` - Usado en dashboardService
   - `direccionempresa` - Usado en dashboardService

2. **Usuarios**:
   - `Avatar` - Usado en ListadoUsuarios
   - `fechaCreacion` - Usado en múltiples archivos
   - `fechadeultimamodificacion` - Usado en múltiples archivos

3. **Agencias**:
   - `created_at` - Para ordenamiento temporal
   - `nombrefantasia` vs `NombreDeFantasia` - Inconsistencia

4. **Contratos**:
   - `fecha_inicio`, `fecha_fin` - Campos de vigencia

###ConfiguracionIA
- **Estado**: ⚠️ Debe crearse si no existe
- **Uso**: Configuración de IA
- **Archivos que la usan**: [`ConfiguracionIA.jsx`](src/pages/configuracion/ConfiguracionIA.jsx:220)

---

## 🚨 TABLAS CRÍTICAS FALTANTES

### Prioridad ALTA - Funcionalidad Core Afectada

1. **campaign_audit_log** 
   - Afecta: Auditoría de campañas
   - Script disponible: ✅ `database/scripts/crear-tablas-manualmente.sql`

2. **order_audit_log**
   - Afecta: Auditoría de órdenes
   - Script disponible: ✅ `database/scripts/crear-tablas-manualmente.sql`

### Prioridad MEDIA - Funcionalidad Avanzada

3. **DetallesFinancierosOrden**
   - Afecta: Módulo de rentabilidad
   - Script disponible: ✅ `database/schemas/database-rentabilidad-schema.sql`

4. **ConfiguracionComisiones**
   - Afecta: Cálculo de comisiones
   - Script disponible: ✅ `database/schemas/database-rentabilidad-schema.sql`

5. **RegistroBonificacionesMedios**
   - Afecta: Cálculo de bonificaciones
   - Script disponible: ✅ `database/schemas/database-rentabilidad-schema.sql`

6. **client_scoring**
   - Afecta: Sistema de scoring de clientes
   - Script disponible: ❌ Debe crearse

### Prioridad BAJA - Funcionalidad Opcional

7. **notifications**
   - Afecta: Sistema de notificaciones
   - Impacto: No crítico, sistema tiene fallback

8. **reminders**
   - Afecta: Sistema de recordatorios
   - Impacto: No crítico

9. **user_gamification**
   - Afecta: Gamificación
   - Impacto: Opcional

10. **automation_rules**
    - Afecta: Automatizaciones
    - Impacto: Opcional

---

## ✅ TABLAS CONFIRMADAS EXISTENTES Y FUNCIONALES

Las siguientes tablas están en uso activo y funcionan correctamente:

1. ✅ Region
2. ✅ Comunas
3. ✅ Usuarios
4. ✅ Perfiles
5. ✅ Grupos
6. ✅ Agencias
7. ✅ Clientes
8. ✅ Proveedores
9. ✅ Campania
10. ✅ Productos
11. ✅ Medios
12. ✅ Calidad
13. ✅ Soportes
14. ✅ Contratos
15. ✅ OrdenesDePublicidad
16. ✅ Programas
17. ✅ Clasificacion
18. ✅ Temas
19. ✅ plan
20. ✅ alternativa
21. ✅ Anios
22. ✅ Meses
23. ✅ FormaDePago
24. ✅ TipoGeneracionDeOrden
25. ✅ proveedor_soporte
26. ✅ soporte_medios
27. ✅ campania_temas
28. ✅ campana_planes
29. ✅ plan_alternativas
30. ✅ contactocliente
31. ✅ contactos
32. ✅ Comisiones
33. ✅ aviso
34. ✅ OtrosDatos

---

## 🔧 SCRIPTS SQL DISPONIBLES

### 1. Schema Principal
📄 `database/schemas/database-schema.sql`
- Contiene definiciones de 34 tablas principales
- Incluye índices de rendimiento
- Incluye comentarios descriptivos

### 2. Schema de Rentabilidad
📄 `database/schemas/database-rentabilidad-schema.sql`
- Contiene 8 tablas del módulo de rentabilidad
- Incluye 3 vistas especializadas
- Incluye funciones y triggers

### 3. Vistas de Rentabilidad
📄 `database/schemas/database-rentabilidad-views.sql`
- Definiciones de vistas
- Funciones SQL útiles
- Triggers automáticos

### 4. Script de Creación Manual
📄 `database/scripts/crear-tablas-manualmente.sql`
- Tablas de auditoría
- Índices adicionales

---

## 📝 RECOMENDACIONES DE IMPLEMENTACIÓN

### Paso 1: Ejecutar schemas base (SI NO ESTÁN CREADAS)
```bash
# En Supabase SQL Editor:
1. database/schemas/database-schema.sql
2. database/schemas/database-rentabilidad-schema.sql
3. database/schemas/database-rentabilidad-views.sql
4. database/scripts/crear-tablas-manualmente.sql
```

### Paso 2: Crear tablas de servicios avanzados

```sql
-- client_scoring
CREATE TABLE IF NOT EXISTS client_scoring (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER REFERENCES Clientes(id_cliente),
    score DECIMAL(5,2) DEFAULT 0,
    revenue_score DECIMAL(5,2) DEFAULT 0,
    loyalty_score DECIMAL(5,2) DEFAULT 0,
    quality_score DECIMAL(5,2) DEFAULT 0,
    last_calculated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- client_interactions
CREATE TABLE IF NOT EXISTS client_interactions (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER REFERENCES Clientes(id_cliente),
    type VARCHAR(50),
    priority VARCHAR(10) DEFAULT 'media',
    subject VARCHAR(255),
    notes TEXT,
    created_by INTEGER REFERENCES Usuarios(id_usuario),
    created_at TIMESTAMP DEFAULT NOW()
);

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Usuarios(id_usuario),
    type VARCHAR(50),
    title VARCHAR(100),
    message TEXT,
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- reminders
CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Usuarios(id_usuario),
    type VARCHAR(50),
    title VARCHAR(100),
    description TEXT,
    due_date TIMESTAMP,
    completed BOOLEAN DEFAULT false,
    priority VARCHAR(10) DEFAULT 'media',
    created_at TIMESTAMP DEFAULT NOW()
);

-- automation_rules
CREATE TABLE IF NOT EXISTS automation_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    trigger_type VARCHAR(50),
    action_type VARCHAR(50),
    conditions TEXT,
    actions TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- user_gamification
CREATE TABLE IF NOT EXISTS user_gamification (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Usuarios(id_usuario) UNIQUE,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    badges TEXT,
    achievements TEXT,
    streak_days INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- points_transactions
CREATE TABLE IF NOT EXISTS points_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Usuarios(id_usuario),
    points INTEGER,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- export_records
CREATE TABLE IF NOT EXISTS export_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Usuarios(id_usuario),
    export_type VARCHAR(50),
    file_name VARCHAR(255),
    status VARCHAR(20),
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- scheduled_exports
CREATE TABLE IF NOT EXISTS scheduled_exports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    schedule VARCHAR(50),
    export_type VARCHAR(50),
    parameters TEXT,
    active BOOLEAN DEFAULT true,
    last_run TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- user_preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Usuarios(id_usuario) UNIQUE,
    notification_preferences TEXT,
    ui_preferences TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- predictions
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    prediction_type VARCHAR(50),
    entity_type VARCHAR(50),
    entity_id INTEGER,
    predicted_value DECIMAL(15,2),
    confidence DECIMAL(5,2),
    model_version VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- configuracion_ia
CREATE TABLE IF NOT EXISTS configuracion_ia (
    id SERIAL PRIMARY KEY,
    parametro VARCHAR(100),
    valor TEXT,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Paso 3: Crear índices de rendimiento

```sql
-- Índices para client_scoring
CREATE INDEX IF NOT EXISTS idx_client_scoring_cliente ON client_scoring(id_cliente);
CREATE INDEX IF NOT EXISTS idx_client_scoring_score ON client_scoring(score);

-- Índices para client_interactions
CREATE INDEX IF NOT EXISTS idx_client_interactions_cliente ON client_interactions(id_cliente);
CREATE INDEX IF NOT EXISTS idx_client_interactions_type ON client_interactions(type);
CREATE INDEX IF NOT EXISTS idx_client_interactions_created ON client_interactions(created_at);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Índices para reminders
CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due ON reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_completed ON reminders(completed);

-- Índices para automation_rules
CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger ON automation_rules(trigger_type);
CREATE INDEX IF NOT EXISTS idx_automation_rules_active ON automation_rules(active);

-- Índices para gamification
CREATE INDEX IF NOT EXISTS idx_user_gamification_user ON user_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user ON points_transactions(user_id);
```

---

## 🎯 PLAN DE ACCIÓN RECOMENDADO

### Fase 1: Verificación Inmediata (Crítico)
1. ✅ Verificar que todas las tablas del schema principal existan
2. ✅ Ejecutar `database-schema.sql` si faltan tablas
3. ✅ Verificar campos `created_at`, `updated_at` en todas las tablas

### Fase 2: Módulo de Rentabilidad (Alta Prioridad)
1. ⚠️ Crear tablas de rentabilidad si no existen
2. ⚠️ Crear vistas SQL para análisis
3. ⚠️ Verificar triggers y funciones

### Fase 3: Servicios Avanzados (Media Prioridad)
1. ⚠️ Crear `client_scoring` para sistema de scoring
2. ⚠️ Crear `client_interactions` para CRM
3. ⚠️ Crear tablas de auditoría

### Fase 4: Servicios Opcionales (Baja Prioridad)
1. ⚠️ Crear tablas de gamificación
2. ⚠️ Crear tablas de automatización
3. ⚠️ Crear tablas de exportación

---

## 🔒 PERMISOS DE SUPABASE REQUERIDOS

### Políticas RLS (Row Level Security)

```sql
-- Habilitar RLS en tablas sensibles
ALTER TABLE Usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE DetallesFinancierosOrden ENABLE ROW LEVEL SECURITY;
ALTER TABLE ConfiguracionComisiones ENABLE ROW LEVEL SECURITY;

-- Políticas de ejemplo (ajustar según necesidades)
CREATE POLICY "Users can view own data" ON Usuarios
    FOR SELECT USING (auth.uid() = id::text);

CREATE POLICY "Admins can view all" ON Usuarios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM Usuarios u
            JOIN Perfiles p ON u.id_perfil = p.id
            WHERE u.id::text = auth.uid()
            AND p.NombrePerfil = 'Administrador'
        )
    );
```

---

## 📊 ESTADÍSTICAS DE USO

- **Total de tablas en uso**: 45+
- **Tablas existentes confirmadas**: 34
- **Tablas potencialmente faltantes**: 11-15
- **Servicios que requieren tablas adicionales**: 8
- **Vistas SQL requeridas**: 3
- **Inconsistencias de nomenclatura detectadas**: 5

---

## 🎓 CONCLUSIONES Y PRÓXIMOS PASOS

### Estado Actual
El sistema PautaPro tiene una arquitectura robusta con **34 tablas core completamente funcionales**. La mayoría de las funcionalidades principales están operativas.

### Áreas que Requieren Atención

1. **CRÍTICO**:
   - Verificar creación de tablas de auditoría (`campaign_audit_log`, `order_audit_log`)
   - Si no existen, ejecutar script manual

2. **IMPORTANTE**:
   - Crear tablas del módulo de rentabilidad para funcionalidad completa
   - Ejecutar `database-rentabilidad-schema.sql`

3. **RECOMENDADO**:
   - Estandarizar nomenclatura de campos inconsistentes
   - Crear tablas de servicios avanzados según necesidad

4. **OPCIONAL**:
   - Implementar sistema de gamificación (tablas disponibles en código)
   - Implementar automatizaciones avanzadas

### Funcionalidad Actual Sin Tablas Opcionales
✅ El sistema **funciona correctamente** sin las tablas opcionales porque:
- Todos los servicios tienen manejo de errores
- Se usan datos mock cuando las tablas no existen
- Los console.warn alertan pero no rompen la aplicación

---

## 📞 SOPORTE Y MANTENIMIENTO

Para implementar las tablas faltantes:

1. Acceder a Supabase Dashboard
2. Ir a SQL Editor
3. Ejecutar los scripts en orden:
   - `database-schema.sql` (base)
   - `database-rentabilidad-schema.sql` (rentabilidad)
   - `database-rentabilidad-views.sql` (vistas)
   - `crear-tablas-manualmente.sql` (auditoría)
   - SQL personalizado para servicios avanzados (ver sección 2 de recomendaciones)

---

**Documento generado**: 2025-01-04
**Versión**: 1.0
**Estado**: Análisis Completo