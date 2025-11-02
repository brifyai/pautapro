# Explicación: Cómo se Asignan los Nombres de Rol y Grupo en el Sistema

## Resumen General
Los valores de **Rol** y **Grupo** que aparecen en el header del sistema se asignan a través de un proceso de dos pasos:

1. **En la Base de Datos**: Se almacenan los IDs (`id_perfil` e `id_grupo`)
2. **En la Sesión del Usuario**: Se convierten a nombres legibles cuando el usuario inicia sesión

---

## 1. Estructura de la Base de Datos

### Tabla: `usuarios`
```
id_usuario | Nombre | Apellido | Email | id_perfil | id_grupo | ...
```
- Almacena referencias a través de IDs, no nombres directos

### Tabla: `perfiles`
```
id | nombreperfil | Codigo | ...
1  | Gerente      | GER    | ...
2  | Planificador | PLA    | ...
3  | Analista     | ANA    | ...
```

### Tabla: `grupos`
```
id_grupo | nombre_grupo      | ...
1        | Administración    | ...
2        | Planificación     | ...
3        | Ventas            | ...
4        | Operaciones       | ...
5        | Finanzas          | ...
```

---

## 2. Proceso de Asignación en el Login

### Paso 1: Usuario Inicia Sesión
El usuario ingresa email y contraseña en `/login`

### Paso 2: Servicio de Autenticación Busca el Usuario
**Archivo**: `src/services/authServiceSimple.js` (líneas 5-119)

```javascript
// Busca el usuario en la tabla 'usuarios'
const { data: user } = await supabase
  .from('usuarios')
  .select('*')
  .eq('email', email)
  .single();
```

### Paso 3: Se Crea la Sesión del Usuario
**Archivo**: `src/services/authServiceSimple.js` (líneas 80-109)

```javascript
const userSession = {
  id: user.id,
  email: user.email,
  nombre: user.nombre,
  apellido: user.apellido,
  // ⚠️ ACTUALMENTE HARDCODEADO (PROBLEMA):
  rol: 'Gerente',           // ← Debería venir de perfiles
  grupo: 'Administración',  // ← Debería venir de grupos
  // ... más propiedades
};

localStorage.setItem('user', JSON.stringify(userSession));
```

### Paso 4: El Header Muestra los Valores
**Archivo**: `src/components/layout/Header.jsx` (líneas 105, 117)

```javascript
<span>{user.rol}</span>        {/* Muestra: "Gerente" */}
<span>{user.grupo}</span>      {/* Muestra: "Administración" */}
```

---

## 3. El Problema Actual

Los valores de `rol` y `grupo` están **hardcodeados** en los servicios de autenticación:

### En `authServiceSimple.js` (línea 88-90):
```javascript
rol: 'Gerente',           // ← Fijo para todos los usuarios
grupo: 'Administración',  // ← Fijo para todos los usuarios
```

### En `authServiceAutoDetect.js` (línea 155-157):
```javascript
rol: 'gerente',           // ← Fijo para todos los usuarios
grupo: 'Gerencia',        // ← Fijo para todos los usuarios
```

**Esto significa que TODOS los usuarios ven el mismo rol y grupo, sin importar qué perfil o grupo tengan asignado en la base de datos.**

---

## 4. La Solución Correcta

Para que los nombres de rol y grupo se asignen correctamente desde la base de datos, se debe:

### Opción A: Hacer JOINs en la Consulta de Login

Modificar `authServiceSimple.js` para hacer un JOIN con las tablas `perfiles` y `grupos`:

```javascript
const { data: user } = await supabase
  .from('usuarios')
  .select(`
    *,
    perfiles:id_perfil (
      id,
      nombreperfil
    ),
    grupos:id_grupo (
      id_grupo,
      nombre_grupo
    )
  `)
  .eq('email', email)
  .single();

// Luego usar los valores del JOIN:
const userSession = {
  id: user.id,
  email: user.email,
  nombre: user.nombre,
  apellido: user.apellido,
  rol: user.perfiles?.nombreperfil || 'Sin Perfil',      // ← De la BD
  grupo: user.grupos?.nombre_grupo || 'Sin Grupo',       // ← De la BD
  // ... más propiedades
};
```

### Opción B: Hacer Consultas Separadas

```javascript
// 1. Obtener el usuario
const { data: user } = await supabase
  .from('usuarios')
  .select('*')
  .eq('email', email)
  .single();

// 2. Obtener el perfil
const { data: perfil } = await supabase
  .from('perfiles')
  .select('nombreperfil')
  .eq('id', user.id_perfil)
  .single();

// 3. Obtener el grupo
const { data: grupo } = await supabase
  .from('grupos')
  .select('nombre_grupo')
  .eq('id_grupo', user.id_grupo)
  .single();

// 4. Crear la sesión con los valores reales
const userSession = {
  id: user.id,
  email: user.email,
  nombre: user.nombre,
  apellido: user.apellido,
  rol: perfil?.nombreperfil || 'Sin Perfil',      // ← De la BD
  grupo: grupo?.nombre_grupo || 'Sin Grupo',      // ← De la BD
  // ... más propiedades
};
```

---

## 5. Dónde se Asignan los Perfiles y Grupos a los Usuarios

### En la Página de Gestión de Usuarios
**Archivo**: `src/pages/usuarios/ListadoUsuarios.jsx`

Cuando se crea o edita un usuario, se asignan:
- `id_perfil` (referencia a la tabla `perfiles`)
- `id_grupo` (referencia a la tabla `grupos`)

```javascript
// Líneas 256-274: Selector de Perfil
<TextField
  select
  label="Perfil"
  name="id_perfil"
  value={formData.id_perfil}
>
  {perfiles.map((perfil) => (
    <MenuItem key={perfil.id} value={perfil.id}>
      {perfil.nombreperfil}
    </MenuItem>
  ))}
</TextField>

// Líneas 280-298: Selector de Grupo
<TextField
  select
  label="Grupo"
  name="id_grupo"
  value={formData.id_grupo}
>
  {grupos.map((grupo) => (
    <MenuItem key={grupo.id_grupo} value={grupo.id_grupo}>
      {grupo.nombre_grupo}
    </MenuItem>
  ))}
</TextField>
```

---

## 6. Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ADMINISTRADOR CREA USUARIO EN /usuarios                  │
│    - Asigna id_perfil = 1 (Gerente)                         │
│    - Asigna id_grupo = 1 (Administración)                   │
│    - Se guarda en tabla 'usuarios'                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. USUARIO INICIA SESIÓN EN /login                          │
│    - Ingresa email y contraseña                             │
│    - Se ejecuta authServiceSimple.login()                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. SERVICIO BUSCA EN BD                                     │
│    - SELECT * FROM usuarios WHERE email = 'xxx'            │
│    - Obtiene: id_perfil=1, id_grupo=1                       │
│    - ⚠️ ACTUALMENTE: Ignora estos IDs y usa valores fijos   │
│    - ✅ DEBERÍA: Hacer JOIN para obtener nombres            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. SE CREA SESIÓN EN localStorage                           │
│    - user.rol = 'Gerente' (o el nombre del perfil)          │
│    - user.grupo = 'Administración' (o el nombre del grupo)  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. HEADER MUESTRA LOS VALORES                               │
│    - Badge azul: "Gerente"                                  │
│    - Badge verde: "Administración"                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Resumen

| Aspecto | Ubicación | Estado |
|---------|-----------|--------|
| **Almacenamiento de IDs** | Tabla `usuarios` (id_perfil, id_grupo) | ✅ Correcto |
| **Definición de Perfiles** | Tabla `perfiles` (id, nombreperfil) | ✅ Correcto |
| **Definición de Grupos** | Tabla `grupos` (id_grupo, nombre_grupo) | ✅ Correcto |
| **Asignación en Login** | `authServiceSimple.js` | ⚠️ Hardcodeado |
| **Visualización en Header** | `Header.jsx` | ✅ Correcto (pero recibe datos fijos) |

**Conclusión**: El sistema está bien diseñado, pero los servicios de autenticación no están usando los datos de la base de datos correctamente. Necesitan ser actualizados para hacer JOINs y obtener los nombres reales de perfiles y grupos.