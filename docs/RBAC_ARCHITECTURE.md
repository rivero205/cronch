# 🏗️ ARQUITECTURA RBAC: ADMIN vs SUPER ADMIN

## 📋 RESUMEN EJECUTIVO

Este documento describe la arquitectura de **Control de Acceso Basado en Roles (RBAC)** implementada en el sistema, con una clara separación entre **Admin** (gestión por negocio) y **Super Admin** (gestión global).

---

## 🎭 DEFINICIÓN DE ROLES

### 1. **Manager** (Rol Base)
- **Ámbito**: Su negocio únicamente
- **Permisos**:
  - Ver y crear productos
  - Ver y crear insumos/gastos
  - Ver y crear producción
  - Ver y crear ventas
  - Ver dashboard de su negocio
- **NO puede**:
  - Ver reportes
  - Gestionar usuarios
  - Ver información del negocio

### 2. **Editor** (Gestor Operativo)
- **Ámbito**: Su negocio únicamente
- **Permisos**: Similares a Manager (puede ser extendido en el futuro)
- Actualmente equivalente a Manager

### 3. **Admin** (Administrador de Negocio)
- **Ámbito**: **Solo su negocio**
- **Permisos**:
  - Todo lo que puede hacer un Manager/Editor
  - Ver y gestionar reportes de su negocio
  - Ver y editar información de "Mi Negocio"
  - Ver equipo de trabajo (usuarios de su negocio)
- **NO puede**:
  - Ver otros negocios
  - Ver usuarios de otros negocios
  - Crear o eliminar negocios
  - Cambiar roles de usuarios

### 4. **Super Admin** (Administrador Global) ⭐
- **Ámbito**: **Todo el sistema**
- **Permisos**:
  - Ver y gestionar TODOS los negocios
  - Ver y gestionar TODOS los usuarios
  - Crear/editar/desactivar negocios
  - Cambiar roles de usuarios
  - Asignar usuarios a negocios
  - Ver reportes globales agregados
- **NO tiene**:
  - Vista "Mi Negocio" (no está asignado a un negocio específico)
  - Operaciones transaccionales (productos, ventas, etc. de un negocio específico)

---

## 🗺️ SEPARACIÓN DE VISTAS POR ROL

### Admin (Gestión por Negocio)

#### Navegación:
1. **Dashboard** - Métricas de su negocio
2. **Productos** - Productos de su negocio
3. **Insumos** - Gastos de su negocio
4. **Producción** - Producción de su negocio
5. **Ventas** - Ventas de su negocio
6. **Reportes** - Reportes de su negocio
7. **Mi Negocio** - Información del negocio al que pertenece
8. **Mi Equipo** - Usuarios de su negocio (solo lectura)

#### Características:
- **Contexto**: Todo filtrado por `business_id`
- **Puede editar**: Información de su negocio
- **Vista principal**: Operaciones diarias del negocio

---

### Super Admin (Gestión Global)

#### Navegación:
1. **Dashboard Global** - Métricas agregadas de todos los negocios
2. **Negocios** - CRUD completo de negocios
3. **Usuarios** - Gestión completa de usuarios del sistema
4. **Reportes Globales** - Métricas y análisis del sistema completo

#### Características:
- **Contexto**: Sin filtro de `business_id` (ve todo)
- **Puede gestionar**:
  - Crear/editar/desactivar negocios
  - Cambiar roles de usuarios
  - Activar/desactivar usuarios
  - Asignar usuarios a negocios
- **Vista principal**: Análisis y gestión estratégica

---

## 🔐 IMPLEMENTACIÓN TÉCNICA

### Backend

#### 1. Middleware de Autenticación
```javascript
// server/middleware/authMiddleware.js
- Extrae el token JWT de Supabase
- Obtiene el perfil del usuario desde `profiles`
- Adjunta a `req.user`:
  - id (user_id)
  - role (admin, super_admin, etc.)
  - business_id (null para super_admin)
```

#### 2. Middleware de Roles
```javascript
// server/middleware/roleMiddleware.js
const checkRole = (allowedRoles) => {
  // Verifica si req.user.role está en allowedRoles
  // Retorna 403 si no tiene permisos
}
```

#### 3. RLS Policies (Row-Level Security en Supabase)

**Tabla `businesses`:**
```sql
-- Usuarios ven su propio negocio
-- Super Admin ve todos los negocios
SELECT: business_id = auth.uid().business_id OR role = 'super_admin'

-- Solo Super Admin puede crear negocios
INSERT: role = 'super_admin'

-- Admins pueden actualizar su negocio
-- Super Admin puede actualizar cualquier negocio
UPDATE: (business_id = auth.uid().business_id AND role = 'admin') 
     OR role = 'super_admin'
```

**Tabla `profiles`:**
```sql
-- Super Admin ve todos los usuarios
-- Otros ven solo usuarios de su negocio
SELECT: role = 'super_admin' 
     OR business_id = auth.uid().business_id
```

**Tablas operacionales** (`products`, `expenses`, `sales`, etc.):
```sql
-- Todos los usuarios ven solo datos de su negocio
SELECT/INSERT/UPDATE/DELETE: business_id = auth.uid().business_id
```

#### 4. Endpoints Clave

**Negocios:**
```
GET    /api/businesses/active       - Público (para registro)
GET    /api/businesses              - Super Admin: todos los negocios
GET    /api/businesses/:id          - Admin/Super Admin: un negocio específico
POST   /api/businesses              - Super Admin: crear negocio
PUT    /api/businesses/:id          - Admin (su negocio) / Super Admin (cualquiera)
DELETE /api/businesses/:id          - Super Admin: desactivar negocio
```

**Usuarios:**
```
GET    /api/users                   - Admin: su negocio / Super Admin: todos
PATCH  /api/users/:userId/role      - Super Admin: cambiar rol
PATCH  /api/users/:userId/status    - Super Admin: activar/desactivar
PATCH  /api/users/:userId/business  - Super Admin: asignar a negocio
```

---

### Frontend

#### 1. Navegación Dinámica
```javascript
// client/src/components/Layout.jsx
const isSuperAdmin = hasRole(['super_admin']);
const navItems = isSuperAdmin ? superAdminNavItems : adminNavItems;
```

#### 2. Rutas Protegidas
```javascript
// client/src/App.jsx
<RoleProtectedRoute allowedRoles={['admin']}>
  <Businesses /> {/* Mi Negocio */}
</RoleProtectedRoute>

<RoleProtectedRoute allowedRoles={['super_admin']}>
  <BusinessesAdmin /> {/* Gestión de Negocios */}
</RoleProtectedRoute>
```

#### 3. Vistas Diferenciadas

**Admin:**
- `Businesses.jsx` - Vista de "Mi Negocio" (lectura/edición)
- `Users.jsx` - Vista de equipo (solo lectura)

**Super Admin:**
- `BusinessesAdmin.jsx` - CRUD completo de negocios
- `Users.jsx` - Gestión completa con cambio de roles y estados

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS

### Tabla `businesses` (Extendida)

```sql
businesses
├── id (uuid, PK)
├── name (text) *
├── description (text)
├── address (text)
├── city (text)
├── country (text) DEFAULT 'Colombia'
├── phone (varchar)
├── email (varchar)
├── website (varchar)
├── tax_id (varchar) - RUC/NIT
├── logo_url (text)
├── industry (varchar) - Tipo de negocio
├── employee_count (integer)
├── status (varchar) DEFAULT 'active'
├── created_at (timestamp)
└── updated_at (timestamp)
```

### Tabla `profiles`

```sql
profiles
├── id (uuid, PK, FK → auth.users)
├── business_id (uuid, FK → businesses) - NULL para super_admin
├── first_name (text)
├── last_name (text)
├── phone (varchar)
├── position (varchar)
├── role (varchar) - 'manager', 'editor', 'admin', 'super_admin'
├── is_active (boolean) DEFAULT true
├── created_at (timestamp)
└── updated_at (timestamp)
```

---

## 📊 FLUJO DE DATOS POR ROL

### Admin (Flujo Operativo)
```
1. Login → Supabase Auth
2. Middleware extrae business_id del perfil
3. Todas las queries filtran por business_id
4. Ve solo su negocio y su equipo
5. Reportes generados desde su business_id
```

### Super Admin (Flujo Analítico)
```
1. Login → Supabase Auth
2. Middleware detecta role = 'super_admin'
3. Queries SIN filtro de business_id
4. Ve todos los negocios y usuarios
5. Reportes agregados de todo el sistema
```

---

## 🔍 DIAGNÓSTICO: "Sin Negocio Asignado"

### Posibles Causas:
1. **Usuario no tiene `business_id` en `profiles`**
   - Verificar: `SELECT * FROM profiles WHERE business_id IS NULL;`
   - Solución: Asignar con Super Admin

2. **RLS bloquea lectura de `businesses`**
   - Verificar políticas RLS
   - Ejecutar: `server/rbac_architecture.sql`

3. **Relación incorrecta en el query**
   - El query usa: `business:businesses(id, name)`
   - Verificar que la relación existe en Supabase

### Solución Implementada:
```sql
-- Ver script: server/rbac_architecture.sql
-- Corrige RLS policies
-- Agrega índices
-- Valida usuarios sin business_id
```

---

## 🚀 MIGRACIONES Y SETUP

### 1. Ejecutar SQL de Arquitectura
```bash
# En Supabase SQL Editor:
1. Abrir: server/rbac_architecture.sql
2. Ejecutar todo el script
3. Verificar advertencias sobre usuarios sin business_id
```

### 2. Verificar Datos
```sql
-- Usuarios sin negocio asignado
SELECT id, first_name, last_name, role 
FROM profiles 
WHERE business_id IS NULL;

-- Super Admins (no deberían tener business_id)
SELECT id, first_name, last_name, business_id 
FROM profiles 
WHERE role = 'super_admin';
```

### 3. Asignar Negocio a Usuario
```sql
UPDATE profiles 
SET business_id = '<uuid-del-negocio>' 
WHERE id = '<uuid-del-usuario>';
```

---

## 🎯 MEJORES PRÁCTICAS

### Para Super Admin:
✅ **Sí debería:**
- Crear negocios antes de crear usuarios
- Asignar usuarios a negocios existentes
- Monitorear métricas globales
- Gestionar roles según necesidades

❌ **No debería:**
- Operar ventas/productos directamente
- Tener un `business_id` asignado
- Microgestionar negocios individuales

### Para Admin:
✅ **Sí debería:**
- Gestionar productos y ventas de su negocio
- Monitorear reportes de rendimiento
- Actualizar información de su negocio

❌ **No debería:**
- Ver datos de otros negocios
- Cambiar roles de usuarios
- Crear nuevos negocios

---

## 🔮 FUNCIONALIDADES FUTURAS

### Próximas Implementaciones:
1. **Invitación de Usuarios** (Admins pueden invitar a su negocio)
2. **Reportes Globales Extendidos** (Super Admin)
3. **Dashboard Global con Gráficas** (Super Admin)
4. **Auditoría de Cambios** (Historial de modificaciones)
5. **Permisos Granulares** (Más roles: Contador, Vendedor, etc.)

---

## 📞 CONTACTO Y SOPORTE

### Roles Disponibles:
- `manager` - Operaciones básicas
- `editor` - Operaciones extendidas
- `admin` - Administrador de negocio
- `super_admin` - Administrador global

### Archivos Clave:
- Backend: `server/middleware/roleMiddleware.js`
- Frontend: `client/src/components/Layout.jsx`
- SQL: `server/rbac_architecture.sql`
- Documentación: Este archivo

---

**Última actualización**: Diciembre 2025  
**Versión**: 2.0 - Arquitectura RBAC Completa
