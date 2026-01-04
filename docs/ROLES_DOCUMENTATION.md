# 🔐 Sistema de Roles - Cronch

## Definición de Roles

### 🔴 Super Administrador (super_admin)
**Acceso Total al Sistema**

- ✅ Acceso absoluto a toda la plataforma
- ✅ Configuraciones críticas del sistema
- ✅ Logs de seguridad y auditoría
- ✅ Eliminación definitiva de datos
- ✅ Gestión de otros administradores
- ✅ Creación y gestión de negocios
- ✅ Todas las funcionalidades de Admin

**Páginas accesibles:**
- Dashboard (vista completa)
- Productos (CRUD completo)
- Insumos (CRUD completo)
- Producción (CRUD completo + historial)
- Ventas (CRUD completo + historial)
- Reportes (históricos completos)
- Mi Negocio (configuración)
- Usuarios (gestión completa)

---

### 🟠 Administrador (admin)
**Gestión Operativa Diaria**

- ✅ Gestiona operación diaria de la plataforma
- ✅ Crear, editar y dar de baja usuarios
- ✅ Configurar parámetros del negocio
- ✅ Acceso a reportes históricos completos
- ✅ Ver y analizar tendencias
- ✅ Gestión completa de productos e insumos
- ❌ No tiene acceso a configuraciones técnicas del sistema
- ❌ No puede eliminar otros administradores

**Páginas accesibles:**
- Dashboard (vista completa)
- Productos (CRUD completo)
- Insumos (CRUD completo)
- Producción (CRUD completo + historial)
- Ventas (CRUD completo + historial)
- Reportes (históricos completos)
- Mi Negocio (solo visualización)
- Usuarios (gestión de managers)

---

### 🟢 Editor/Gestor (manager)
**Gestión de Contenido del Día**

- ✅ Crear, editar y eliminar registros del día actual
- ✅ Gestión de productos (CRUD)
- ✅ Registro de insumos del día
- ✅ Registro de producción del día
- ✅ Registro de ventas del día
- ✅ Dashboard solo con datos del día/semana actual
- ❌ **NO tiene acceso a reportes históricos**
- ❌ **NO puede cambiar configuraciones del sistema**
- ❌ **NO puede gestionar usuarios**
- ❌ **NO puede ver información del negocio**

**Páginas accesibles:**
- Dashboard (solo datos recientes: hoy/semana)
- Productos (CRUD completo)
- Insumos (solo del día actual)
- Producción (solo del día actual)
- Ventas (solo del día actual)

---

## Matriz de Permisos

| Funcionalidad | Manager | Admin | Super Admin |
|--------------|---------|-------|-------------|
| **Dashboard** | Día/Semana actual | Completo con histórico | Completo |
| **Productos** | ✅ CRUD | ✅ CRUD | ✅ CRUD |
| **Insumos** | ✅ Solo día actual | ✅ Histórico completo | ✅ Histórico completo |
| **Producción** | ✅ Solo día actual | ✅ Histórico completo | ✅ Histórico completo |
| **Ventas** | ✅ Solo día actual | ✅ Histórico completo | ✅ Histórico completo |
| **Reportes** | ❌ Sin acceso | ✅ Todos los reportes | ✅ Todos los reportes |
| **Mi Negocio** | ❌ Sin acceso | 👁️ Solo vista | ✅ Configuración |
| **Usuarios** | ❌ Sin acceso | ✅ Gestionar managers | ✅ Gestión completa |
| **Configuración Sistema** | ❌ Sin acceso | ❌ Sin acceso | ✅ Acceso total |

---

## Comandos SQL Útiles

### Cambiar rol de un usuario

```sql
-- Convertir a Super Admin
UPDATE public.profiles 
SET role = 'super_admin' 
WHERE id = 'user-id-aqui';

-- Convertir a Admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = 'user-id-aqui';

-- Convertir a Manager
UPDATE public.profiles 
SET role = 'manager' 
WHERE id = 'user-id-aqui';
```

### Ver todos los usuarios por rol

```sql
SELECT 
  p.role,
  COUNT(*) as cantidad,
  STRING_AGG(p.first_name || ' ' || p.last_name, ', ') as usuarios
FROM public.profiles p
GROUP BY p.role
ORDER BY 
  CASE p.role 
    WHEN 'super_admin' THEN 1 
    WHEN 'admin' THEN 2 
    WHEN 'manager' THEN 3 
  END;
```

### Listar usuarios con detalles

```sql
SELECT 
  p.id,
  u.email,
  p.first_name,
  p.last_name,
  p.role,
  CASE 
    WHEN p.role = 'super_admin' THEN '🔴 Super Admin'
    WHEN p.role = 'admin' THEN '🟠 Admin'
    WHEN p.role = 'manager' THEN '🟢 Manager'
  END as rol_nombre,
  p.is_active,
  p.created_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY 
  CASE p.role 
    WHEN 'super_admin' THEN 1 
    WHEN 'admin' THEN 2 
    WHEN 'manager' THEN 3 
  END,
  p.first_name;
```

---

## Aplicar el Nuevo Sistema de Roles

### 1. Ejecutar el script de actualización

Ve a **Supabase Dashboard** → **SQL Editor** y ejecuta:
```
server/update_roles_system.sql
```

Este script:
- ✅ Convierte todos los usuarios `user` a `manager`
- ✅ Actualiza el constraint de la tabla
- ✅ Actualiza el trigger para usar `manager` por defecto
- ✅ Verifica los cambios

### 2. Reiniciar la aplicación

```bash
# Terminal 1: Cliente
cd client
npm run dev

# Terminal 2: Servidor
cd server
npm run dev
```

### 3. Verificar funcionamiento

**Como Manager:**
- ✅ Verás: Dashboard, Productos, Insumos, Producción, Ventas
- ❌ NO verás: Reportes, Mi Negocio, Usuarios

**Como Admin:**
- ✅ Verás todo excepto configuraciones críticas

**Como Super Admin:**
- ✅ Verás y podrás hacer absolutamente todo

---

## Notas Importantes

⚠️ **Rol por defecto al registrar:** Ahora es `manager`

⚠️ **Managers no ven datos antiguos:** El dashboard de managers solo muestra datos recientes para evitar sobrecarga

⚠️ **Solo Admin+ puede gestionar usuarios:** Los managers no pueden crear o modificar otros usuarios

⚠️ **Eliminación de rol `user`:** El rol `user` ya no existe, todos fueron convertidos a `manager`

---

## Próximos Pasos Recomendados

1. 🔹 Implementar filtrado de fechas en el backend para managers (solo permitir consultar datos del día actual)
2. 🔹 Añadir indicador visual del rol en el perfil del usuario
3. 🔹 Crear logs de auditoría para acciones de super_admin
4. 🔹 Implementar soft-delete en lugar de eliminación definitiva (excepto para super_admin)
