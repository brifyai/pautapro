# 🔐 Niveles de Acceso - Sistema de Órdenes

## 📋 **ESTRUCTURA DE PERMISOS**

El sistema tiene una estructura de doble nivel para controlar el acceso:
- **Perfiles**: Definen los permisos y capacidades
- **Grupos**: Organizan a los usuarios por áreas funcionales

---

## 👥 **PERFILES DE USUARIO (7 Niveles)**

### **1. 🔥 Super Administrador**
- **ID**: 1
- **Descripción**: Acceso completo a todo el sistema
- **Permisos**:
  - ✅ Configuración completa del sistema
  - ✅ Gestión de todos los usuarios
  - ✅ Acceso a todos los módulos y datos
  - ✅ Configuración de base de datos
  - ✅ Modificación de estructura del sistema
- **Uso**: Dueño del sistema, administrador principal

### **2. 🛠️ Administrador**
- **ID**: 2
- **Descripción**: Acceso completo a configuración y usuarios
- **Permisos**:
  - ✅ Gestión de usuarios y perfiles
  - ✅ Configuración del sistema
  - ✅ Acceso a todos los módulos operativos
  - ✅ Gestión de catálogos y parámetros
  - ❌ Modificación de estructura base
- **Uso**: Administrador del día a día

### **3. 👔 Gerente**
- **ID**: 3
- **Descripción**: Acceso a reportes y aprobaciones
- **Permisos**:
  - ✅ Aprobación de campañas y órdenes
  - ✅ Acceso a todos los reportes
  - ✅ Visibilidad de todas las áreas
  - ✅ Gestión de clientes estratégicos
  - ❌ Configuración del sistema
- **Uso**: Gerencia, dirección de cuentas

### **4. 📊 Planificador**
- **ID**: 4
- **Descripción**: Gestión de planes y campañas
- **Permisos**:
  - ✅ Creación y edición de campañas
  - ✅ Gestión de planes de medios
  - ✅ Coordinación con clientes
  - ✅ Análisis de presupuestos
  - ❌ Aprobación final (requiere gerente)
- **Uso**: Planificación de medios, coordinación

### **5. ⚡ Ejecutivo**
- **ID**: 5
- **Descripción**: Gestión de órdenes y ejecución
- **Permisos**:
  - ✅ Creación y gestión de órdenes
  - ✅ Ejecución de campañas
  - ✅ Contacto con proveedores
  - ✅ Seguimiento de entregas
  - ❌ Modificación de presupuestos
- **Uso**: Ejecución de campañas, operaciones

### **6. 📈 Analista**
- **ID**: 6
- **Descripción**: Acceso a reportes y análisis
- **Permisos**:
  - ✅ Acceso a todos los reportes
  - ✅ Análisis de rendimiento
  - ✅ Exportación de datos
  - ✅ Creación de dashboards
  - ❌ Modificación de datos operativos
- **Uso**: Análisis de datos, Business Intelligence

### **7. 👤 Cliente**
- **ID**: 7
- **Descripción**: Acceso limitado a sus propios datos
- **Permisos**:
  - ✅ Ver sus propias campañas
  - ✅ Aprobar sus propias órdenes
  - ✅ Descargar reportes de sus campañas
  - ✅ Comunicación con la agencia
  - ❌ Acceso a datos de otros clientes
- **Uso**: Clientes externos, portal de clientes

---

## 🏢 **GRUPOS FUNCIONALES (7 Áreas)**

### **1. Administradores**
- **ID**: 1
- **Miembros típicos**: Super Administrador, Administrador
- **Función**: Gestión del sistema

### **2. Gerencia**
- **ID**: 2
- **Miembros típicos**: Gerente
- **Función**: Supervisión y aprobaciones

### **3. Planificación**
- **ID**: 3
- **Miembros típicos**: Planificador
- **Función**: Estrategia y planificación

### **4. Ejecución de Campañas**
- **ID**: 4
- **Miembros típicos**: Ejecutivo
- **Función**: Operaciones y ejecución

### **5. Facturación**
- **ID**: 5
- **Miembros típicos**: Administrador, personal de finanzas
- **Función**: Gestión financiera

### **6. Reportes**
- **ID**: 6
- **Miembros típicos**: Analista
- **Función**: Análisis y reportes

### **7. Clientes**
- **ID**: 7
- **Miembros típicos**: Cliente
- **Función**: Acceso externo de clientes

---

## 🔗 **MATRIZ DE PERMISOS**

| Módulo/Función | Super Admin | Admin | Gerente | Planificador | Ejecutivo | Analista | Cliente |
|----------------|-------------|-------|---------|--------------|-----------|----------|---------|
| **Configuración Sistema** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Gestión de Usuarios** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Clientes** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | 📖¹ |
| **Proveedores** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Campañas** | ✅ | ✅ | ✅ | ✅ | ✅ | 📖 | 📖¹ |
| **Órdenes** | ✅ | ✅ | ✅ | 📖 | ✅ | 📖 | 📖¹ |
| **Planes** | ✅ | ✅ | ✅ | ✅ | 📖 | 📖 | 📖¹ |
| **Reportes** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 📖¹ |
| **Facturación** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | 📖¹ |
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 📖² |

**Leyenda:**
- ✅ = Acceso completo
- 📖 = Solo lectura
- 📖¹ = Solo sus propios datos
- 📖² = Dashboard limitado del cliente
- ❌ = Sin acceso

---

## 👤 **USUARIO ADMINISTRADOR POR DEFECTO**

### **Credenciales Iniciales:**
- **Email**: admin@sistema.cl
- **Contraseña**: (debe ser configurada en primer inicio)
- **Perfil**: Super Administrador (ID: 1)
- **Grupo**: Administradores (ID: 1)

### **Primeros Pasos:**
1. Iniciar sesión como administrador
2. Configurar contraseña segura
3. Crear usuarios adicionales según necesidad
4. Asignar perfiles y grupos apropiados

---

## 🔧 **CONFIGURACIÓN RECOMENDADA**

### **Para Pequeñas Agencias (2-5 personas):**
- 1 Super Administrador
- 1-2 Administradores
- 1 Planificador/Ejecutivo
- 1 Analista (opcional)

### **Para Agencias Medianas (6-20 personas):**
- 1 Super Administrador
- 2 Administradores
- 1-2 Gerentes
- 2-3 Planificadores
- 3-5 Ejecutivos
- 1-2 Analistas

### **Para Agencias Grandes (20+ personas):**
- 1 Super Administrador
- 2-3 Administradores
- 2-4 Gerentes
- 4-6 Planificadores
- 8-12 Ejecutivos
- 2-4 Analistas
- Personal de Facturación

---

## 🚀 **FLUJO DE APROBACIONES**

### **Campaña Nueva:**
1. **Planificador** crea campaña
2. **Gerente** aprueba presupuesto y estrategia
3. **Ejecutivo** recibe campaña para ejecución
4. **Cliente** aprueba (si aplica)

### **Orden de Publicidad:**
1. **Ejecutivo** crea orden
2. **Planificador** verifica alineación con plan
3. **Gerente** aprueba (si monto > umbral)
4. **Ejecutivo** procesa orden

---

## 📱 **ACCESO MÓVIL/CLIENTES**

### **Portal de Clientes:**
- Los usuarios con perfil "Cliente" tienen acceso a un portal simplificado
- Solo ven sus propias campañas y órdenes
- Pueden aprobar y descargar reportes
- Interfaz optimizada para móviles

---

## 🔒 **SEGURIDAD**

### **Control de Acceso:**
- Autenticación requerida para todos los perfiles
- Sesiones con timeout configurable
- Registro de auditoría para acciones críticas
- Encriptación de contraseñas (bcrypt)

### **Restricciones:**
- Los clientes solo ven sus propios datos
- Los ejecutivos solo ven campañas asignadas
- Los gerentes tienen visibilidad completa pero sin configuración
- Los administradores no pueden modificar estructura base del sistema

---

## 📞 **SOPORTE Y MANTENIMIENTO**

### **Para cambios en permisos:**
1. Contactar al Super Administrador
2. Solicitar cambio de perfil/grupo
3. Justificar necesidad del cambio
4. Aprobación y actualización

### **Para problemas de acceso:**
1. Verificar perfil y grupo asignados
2. Confirmar estado del usuario (activo/inactivo)
3. Revisar permisos específicos del módulo
4. Contactar administrador del sistema

**Este sistema de niveles de acceso garantiza la seguridad, integridad y confidencialidad de los datos del Sistema de Órdenes.**