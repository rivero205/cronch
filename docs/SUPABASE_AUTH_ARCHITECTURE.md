# 🔐 ARQUITECTURA DE AUTENTICACIÓN Y AUTORIZACIÓN - CRONCH

## 📋 Índice

1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Roles y Estados](#roles-y-estados)
5. [Flujos de Usuario](#flujos-de-usuario)
6. [Modelo de Base de Datos](#modelo-de-base-de-datos)
7. [Row Level Security (RLS)](#row-level-security-rls)
8. [Edge Functions](#edge-functions)
9. [Frontend - Componentes](#frontend-componentes)
10. [Configuración y Deployment](#configuración-y-deployment)
11. [Casos Edge y Riesgos](#casos-edge-y-riesgos)
12. [Testing](#testing)

---

## 🎯 Visión General

El sistema de autenticación de **Cronch** implementa un flujo de **aprobación manual por Admin** para garantizar que solo usuarios legítimos accedan a cada empresa. 

### Características Principales

✅ **Registro con aprobación manual** - Los usuarios no pueden acceder hasta ser aprobados por un Admin  
✅ **Confirmación de email desacoplada** - Solo se envía después de la aprobación  
✅ **Estados granulares** - `pending`, `approved`, `active`  
✅ **RLS nativo de Supabase** - Seguridad a nivel de base de datos  
✅ **Edge Functions** - Lógica de aprobación, rechazo e invitaciones  
✅ **Auditoría completa** - Registro de todos los cambios de estado  

---

## 🧠 Stack Tecnológico

### Backend
- **Supabase Auth** - Gestión de usuarios y autenticación
- **PostgreSQL** - Base de datos con RLS
- **Supabase Edge Functions** - Lógica serverless (Deno)

### Frontend
- **React** - UI framework
- **Supabase JS Client** - Conexión con backend
- **React Router** - Navegación
- **Tailwind CSS** - Estilos

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Register   │  │    Login     │  │    Users     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                  │              │
│           └────────────────┴──────────────────┘              │
│                           │                                  │
│                    AuthContext                               │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                   Supabase Client
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                    SUPABASE BACKEND                          │
│                           │                                  │
│  ┌────────────────────────▼─────────────────────────┐       │
│  │              Supabase Auth                        │       │
│  │  (auth.users - email/password)                    │       │
│  └────────────────────────┬─────────────────────────┘       │
│                           │                                  │
│  ┌────────────────────────▼─────────────────────────┐       │
│  │           PostgreSQL Database                     │       │
│  │  ┌──────────────┐  ┌──────────────┐             │       │
│  │  │  businesses  │  │   profiles   │             │       │
│  │  └──────────────┘  └──────────────┘             │       │
│  │  ┌──────────────┐  ┌──────────────┐             │       │
│  │  │ invitations  │  │    audit     │             │       │
│  │  └──────────────┘  └──────────────┘             │       │
│  │                                                   │       │
│  │  + RLS Policies (seguridad por rol/estado)       │       │
│  │  + Triggers (auto-crear perfil, auditoría)       │       │
│  └───────────────────────────────────────────────────┘       │
│                                                               │
│  ┌───────────────────────────────────────────────────┐       │
│  │            Edge Functions (Deno)                  │       │
│  │  ┌──────────────┐  ┌──────────────┐              │       │
│  │  │ approve-user │  │ reject-user  │              │       │
│  │  └──────────────┘  └──────────────┘              │       │
│  │  ┌──────────────┐  ┌──────────────┐              │       │
│  │  │ invite-user  │  │ notify-admin │              │       │
│  │  └──────────────┘  └──────────────┘              │       │
│  └───────────────────────────────────────────────────┘       │
└───────────────────────────────────────────────────────────────┘
```

### Separación de Responsabilidades

| Componente | Responsabilidad |
|------------|----------------|
| **Supabase Auth** | Autenticación (login, signup, tokens) |
| **PostgreSQL + RLS** | Autorización (permisos por rol/estado) |
| **Edge Functions** | Lógica de negocio (aprobaciones, invitaciones) |
| **Triggers** | Automatización (crear perfiles, auditoría) |
| **Frontend** | UI/UX, validaciones, llamadas a Edge Functions |

---

## 🎭 Roles y Estados

### Roles del Sistema

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **super_admin** | Administrador del sistema | Crea empresas, asigna admins, acceso total |
| **admin** | Administrador de empresa | Aprueba/rechaza usuarios, invita, gestiona equipo |
| **manager** | Usuario operativo | Acceso a funcionalidades de la empresa |

**⚠️ IMPORTANTE: NO se pueden agregar roles adicionales sin modificar la arquitectura.**

### Estados de Usuario

| Estado | Descripción | Puede Acceder |
|--------|-------------|---------------|
| **pending** | Registrado, esperando aprobación | ❌ NO |
| **approved** | Aprobado por Admin, esperando confirmación de email | ❌ NO |
| **active** | Email confirmado, cuenta completamente activa | ✅ SÍ |

### Transiciones de Estado

```
┌──────────┐
│ REGISTRO │
└────┬─────┘
     │
     ▼
┌──────────┐       ADMIN APRUEBA       ┌──────────┐
│ pending  │──────────────────────────>│ approved │
└────┬─────┘                           └────┬─────┘
     │                                      │
     │ ADMIN RECHAZA                        │ USUARIO CONFIRMA EMAIL
     │                                      │
     ▼                                      ▼
┌──────────┐                           ┌──────────┐
│ DELETED  │                           │  active  │
└──────────┘                           └──────────┘
```

---

## 🔄 Flujos de Usuario

### 1. Flujo de Registro Normal

```
1. Usuario accede a /register
   └─> Selecciona empresa del dropdown
   └─> Completa datos: nombre, apellido, email, teléfono, cargo, contraseña

2. Frontend llama a supabase.auth.signUp()
   └─> Metadata incluye: business_id, first_name, last_name, etc.
   └─> Email NO se confirma automáticamente

3. Trigger en DB (handle_new_user)
   └─> Crea registro en profiles con status = 'pending'
   └─> is_active = false

4. Frontend llama a Edge Function: notify-admin-new-user
   └─> Obtiene admins de la empresa
   └─> Envía email a cada admin notificando nuevo usuario pendiente

5. Usuario ve modal: "Registro exitoso, espera aprobación"
   └─> Se hace logout automático
   └─> Redirige a /login

6. Admin accede a /users → Tab "Pendientes"
   └─> Ve usuario pendiente
   └─> Puede "Aprobar" o "Rechazar"

7. Si Admin APRUEBA:
   └─> Llama a Edge Function: approve-user
   └─> Estado → 'approved'
   └─> Supabase envía email de confirmación
   
8. Usuario recibe email con link de confirmación
   └─> Click en link confirma email
   └─> Trigger (activate_user_on_email_confirm)
   └─> Estado → 'active'
   └─> is_active = true

9. Usuario ahora puede hacer login
   └─> RLS permite acceso solo si status = 'active'
```

### 2. Flujo de Invitación

```
1. Admin accede a /users → Click "Invitar Usuario"

2. Completa formulario:
   └─> Email (requerido)
   └─> Nombre, apellido, teléfono, cargo (opcionales)
   └─> Rol (admin o manager)

3. Frontend llama a Edge Function: invite-user
   └─> Genera token único
   └─> Crea registro en tabla 'invitations'
   └─> Envía email con link de invitación

4. Usuario invitado recibe email
   └─> Click en link: /register?invitation=TOKEN

5. Frontend detecta parámetro 'invitation'
   └─> Valida token
   └─> Pre-completa formulario con datos de invitación
   └─> Empresa ya está seleccionada

6. Usuario completa registro
   └─> Metadata incluye: invitation_id
   └─> Trigger detecta invitación
   └─> Marca invitación como 'accepted'

7. Sigue el mismo flujo de aprobación que registro normal
```

### 3. Flujo de Rechazo

```
1. Admin accede a /users → Tab "Pendientes"

2. Click "Rechazar" en usuario pendiente
   └─> Puede agregar razón (opcional)

3. Frontend llama a Edge Function: reject-user
   └─> Registra en tabla audit
   └─> Elimina registro de profiles
   └─> Elimina usuario de auth.users

4. Usuario recibe email de notificación (opcional)
   └─> "Tu solicitud ha sido rechazada"
```

---

## 💾 Modelo de Base de Datos

### Tabla: `businesses`

```sql
CREATE TABLE public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    super_admin_id UUID REFERENCES auth.users(id),
    address TEXT,
    phone TEXT,
    email TEXT,
    logo_url TEXT
);
```

### Tabla: `profiles`

```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    
    -- Información personal
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    position TEXT,
    
    -- Autorización
    role TEXT DEFAULT 'manager' CHECK (role IN ('super_admin', 'admin', 'manager')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active')),
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    
    CONSTRAINT valid_admin_must_have_business CHECK (
        role = 'super_admin' OR business_id IS NOT NULL
    )
);
```

### Tabla: `invitations`

```sql
CREATE TABLE public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    position TEXT,
    role TEXT DEFAULT 'manager' CHECK (role IN ('admin', 'manager')),
    
    token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_pending_invitation UNIQUE (business_id, email, status)
);
```

### Tabla: `user_status_audit`

```sql
CREATE TABLE public.user_status_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES auth.users(id),
    old_status TEXT,
    new_status TEXT NOT NULL,
    old_role TEXT,
    new_role TEXT,
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔒 Row Level Security (RLS)

### Principios de RLS

1. **Usuarios NO activos no pueden ver nada** (excepto su propio perfil)
2. **Super Admins ven todo**
3. **Admins ven solo su empresa**
4. **Managers ven solo usuarios activos de su empresa**

### Políticas Críticas

#### Profiles - Bloqueo de Acceso

```sql
-- Policy: Usuarios activos pueden ver perfiles de su empresa
CREATE POLICY "active_users_view_team_profiles" 
ON profiles FOR SELECT 
TO authenticated
USING (
    business_id IN (
        SELECT business_id FROM profiles
        WHERE id = auth.uid()
        AND status = 'active' -- CRÍTICO: Solo usuarios activos
    )
    AND status = 'active' -- Solo ven usuarios activos
);
```

#### Businesses - Acceso Público Limitado

```sql
-- Policy: Cualquiera puede ver empresas activas (para dropdown de registro)
CREATE POLICY "public_view_active_businesses" 
ON businesses FOR SELECT 
TO public
USING (status = 'active');
```

#### Invitations - Solo Admins

```sql
-- Policy: Admins pueden crear invitaciones para su empresa
CREATE POLICY "admin_insert_invitations" 
ON invitations FOR INSERT 
TO authenticated
WITH CHECK (
    business_id IN (
        SELECT business_id FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
        AND status = 'active' -- CRÍTICO: Solo admins activos
    )
    AND invited_by = auth.uid()
);
```

---

## ⚡ Edge Functions

### 1. approve-user

**Endpoint:** `/functions/v1/approve-user`  
**Método:** POST  
**Auth:** Bearer token (Admin activo)

**Request:**
```json
{
  "userId": "uuid-del-usuario"
}
```

**Lógica:**
1. Verifica que el caller sea admin activo de la empresa
2. Verifica que el usuario a aprobar sea de la misma empresa
3. Verifica que esté en estado `pending`
4. Actualiza estado a `approved`
5. Genera link de confirmación de email
6. Envía email de confirmación

**Response:**
```json
{
  "success": true,
  "message": "Usuario aprobado exitosamente",
  "data": {
    "userId": "uuid",
    "status": "approved"
  }
}
```

### 2. reject-user

**Endpoint:** `/functions/v1/reject-user`  
**Método:** POST  
**Auth:** Bearer token (Admin activo)

**Request:**
```json
{
  "userId": "uuid-del-usuario",
  "reason": "Razón del rechazo (opcional)"
}
```

**Lógica:**
1. Verifica permisos del admin
2. Registra en `user_status_audit`
3. Elimina perfil de `profiles`
4. Elimina usuario de `auth.users` (via admin API)
5. Envía email de notificación (opcional)

### 3. invite-user

**Endpoint:** `/functions/v1/invite-user`  
**Método:** POST  
**Auth:** Bearer token (Admin activo)

**Request:**
```json
{
  "email": "nuevo@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+56912345678",
  "position": "Vendedor",
  "role": "manager"
}
```

**Lógica:**
1. Verifica que el email no esté registrado
2. Verifica que no exista invitación pendiente
3. Genera token único
4. Crea registro en `invitations` con expires_at = +7 días
5. Envía email con link de invitación

### 4. notify-admin-new-user

**Endpoint:** `/functions/v1/notify-admin-new-user`  
**Método:** POST  
**Auth:** API Key

**Request:**
```json
{
  "userId": "uuid-del-usuario-pendiente",
  "businessId": "uuid-de-empresa"
}
```

**Lógica:**
1. Obtiene información del usuario pendiente
2. Obtiene admins activos de la empresa
3. Envía email a cada admin notificando nuevo registro

---

## 🎨 Frontend - Componentes

### AuthContext

**Ubicación:** `client/src/contexts/AuthContext.jsx`

**Responsabilidades:**
- Gestionar sesión de usuario
- Cargar perfil desde `profiles`
- **Bloquear acceso si status ≠ 'active'**
- Proveer helpers: `canAccess()`, `getUserRole()`, `hasRole()`

**Métodos Clave:**
```javascript
signUp(email, password, metadata) // Registro con metadata
signIn(email, password)            // Login
signOut()                          // Logout
canAccess()                        // Verifica status = 'active'
getUserStatus()                    // Devuelve 'pending' | 'approved' | 'active'
```

### Register.jsx

**Ubicación:** `client/src/pages/Register.jsx`

**Flujo:**
1. Cargar empresas desde `businesses` (públicas)
2. Validar formulario
3. Llamar `supabase.auth.signUp()` con metadata
4. Cerrar sesión inmediatamente (`signOut()`)
5. Llamar Edge Function `notify-admin-new-user`
6. Mostrar modal de confirmación

**Cambio Crítico:**
```javascript
// Después de signUp, cerrar sesión
await supabase.auth.signOut();

// Mostrar modal de aprobación pendiente
setShowConfirmationModal(true);
```

### Users.jsx

**Ubicación:** `client/src/pages/Users.jsx`

**Características:**
- **Tab "Activos"** - Lista usuarios con status = 'active'
- **Tab "Pendientes"** - Lista usuarios con status = 'pending'
- Botones "Aprobar" y "Rechazar" para cada usuario pendiente
- Llamadas a Edge Functions `approve-user` y `reject-user`

**Permisos:**
- Solo **admins** y **super_admins** ven tab "Pendientes"
- Managers solo ven tab "Activos"

### EmailConfirmationModal.jsx

**Ubicación:** `client/src/components/EmailConfirmationModal.jsx`

**Cambio:**
- Mensaje actualizado a "Espera aprobación del Admin"
- Explica el flujo completo: aprobación → email → confirmación → acceso

---

## ⚙️ Configuración y Deployment

### Variables de Entorno

#### Frontend (.env)
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

#### Supabase Edge Functions
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
SUPABASE_ANON_KEY=tu-anon-key
FRONTEND_URL=https://tu-app.com
NOTIFICATION_WEBHOOK_URL=https://tu-servicio-de-emails.com/webhook
```

### Deployment

#### 1. Aplicar Migraciones SQL

```bash
# Conectar a Supabase SQL Editor y ejecutar:
supabase_auth_complete.sql
```

#### 2. Desplegar Edge Functions

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Deploy functions
cd supabase/functions
supabase functions deploy approve-user
supabase functions deploy reject-user
supabase functions deploy invite-user
supabase functions deploy notify-admin-new-user
```

#### 3. Configurar Supabase Auth

**En Dashboard de Supabase → Authentication → Settings:**

- ✅ **Enable email confirmations:** ON
- ❌ **Auto confirm users:** OFF (CRÍTICO)
- ✅ **Email confirmation template:** Personalizar mensaje

#### 4. Desactivar Confirmación Automática

**Importante:** Supabase debe tener `ENABLE_EMAIL_CONFIRMATION=true` pero `DISABLE_SIGNUP_CONFIRMATION=false` para que NO confirme automáticamente en signup.

---

## ⚠️ Casos Edge y Riesgos

### 1. Usuario Aprobado pero NO Confirma Email

**Problema:** Usuario en estado `approved` nunca confirma email.  
**Solución:**  
- Agregar job/cron que detecte usuarios en `approved` > 7 días
- Enviar reminder o revocar aprobación

### 2. Usuario Confirma Email sin Estar Aprobado

**Problema:** Bug en configuración de Supabase permite confirmación sin aprobación.  
**Mitigación:**  
- RLS bloquea acceso si `status != 'active'`
- Trigger `activate_user_on_email_confirm` solo activa si `status = 'approved'`

### 3. Admin Se Auto-Aprueba

**Problema:** Admin malicioso crea cuenta y se auto-aprueba.  
**Mitigación:**  
- Edge Function `approve-user` verifica que caller y target sean diferentes
- Agregar validación: `user_id != auth.uid()`

### 4. Invitación Expirada

**Problema:** Usuario intenta usar link de invitación expirado.  
**Solución:**  
- Frontend valida `expires_at` antes de permitir registro
- Mostrar mensaje: "Invitación expirada, contacta al administrador"

### 5. Múltiples Admins Aprueban Simultáneamente

**Problema:** Race condition si 2 admins aprueban al mismo usuario.  
**Mitigación:**  
- UPDATE en SQL verifica `WHERE status = 'pending'` (atómico)
- Si ya está aprobado, devuelve error

### 6. Usuario Pendiente Intenta Login

**Problema:** Usuario en `pending` intenta hacer login.  
**Solución:**  
- `loadUserProfile()` detecta `status != 'active'`
- Hace `signOut()` automático
- Muestra mensaje: "Tu cuenta está pendiente de aprobación"

---

## 🧪 Testing

### Tests Unitarios (SQL)

```sql
-- Test 1: Verificar que usuario pending no puede ver datos
BEGIN;
  SET ROLE authenticated;
  SET request.jwt.claims.sub = '<user-id-pending>';
  
  SELECT count(*) FROM businesses WHERE status = 'active';
  -- Debe devolver solo empresas públicas, no datos sensibles
ROLLBACK;

-- Test 2: Verificar que trigger crea perfil en pending
BEGIN;
  INSERT INTO auth.users (email, encrypted_password, raw_user_meta_data)
  VALUES ('test@example.com', 'hash', '{"business_id": "..."}');
  
  SELECT status FROM profiles WHERE email = 'test@example.com';
  -- Debe devolver 'pending'
ROLLBACK;
```

### Tests de Edge Functions

```javascript
// Test approve-user
const response = await fetch('/functions/v1/approve-user', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ userId: 'pending-user-id' })
});

expect(response.status).toBe(200);
expect(response.json().success).toBe(true);
```

### Tests de Integración (Frontend)

```javascript
// Test flujo de registro
it('debe mostrar modal de aprobación después de registro', async () => {
  render(<Register />);
  
  fillForm({
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@example.com',
    password: 'Password123!'
  });
  
  clickSubmit();
  
  expect(screen.getByText(/espera aprobación/i)).toBeInTheDocument();
});
```

---

## 📊 Métricas y Monitoreo

### KPIs a Monitorear

1. **Tiempo promedio de aprobación** - Desde registro hasta aprobación
2. **Tasa de rechazo** - % de usuarios rechazados vs aprobados
3. **Usuarios pendientes activos** - Cantidad de usuarios en `pending`
4. **Confirmaciones de email fallidas** - % de usuarios en `approved` > 7 días

### Alertas

- ⚠️ Usuarios en `pending` > 48 horas sin aprobación
- ⚠️ Usuarios en `approved` > 7 días sin confirmar email
- 🚨 Invitaciones expiradas sin usar > 50%

---

## 🔄 Próximas Mejoras

- [ ] Implementar invitaciones con link único
- [ ] Agregar notificaciones push (además de email)
- [ ] Panel de auditoría para Super Admins
- [ ] Exportar usuarios pendientes a CSV
- [ ] Agregar campo "Notas del Admin" al aprobar/rechazar
- [ ] Implementar "Solicitar Re-aprobación" para usuarios rechazados

---

## 📞 Soporte

Para dudas o issues:
- Revisar logs en Supabase Dashboard → Logs
- Verificar RLS policies en SQL Editor
- Consultar tabla `user_status_audit` para historial

---

**Documentación creada el:** 3 de Enero, 2026  
**Versión:** 1.0.0  
**Autor:** GitHub Copilot
