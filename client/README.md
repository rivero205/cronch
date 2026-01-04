# Cronch - Frontend (PWA)

Interfaz de usuario moderna y responsiva construida con React para la gestión de negocios de alimentos y manufactura.

## ✨ Características

- **Dashboard Real-time**: Visualización de KPIs y ranking de productos.
- **PWA (Progressive Web App)**: Instalable en PC y móviles como una aplicación nativa.
- **Notificaciones**: Sistema de alertas nativas (Browser Notifications) para ventas y recordatorios.
- **Reporting Avanzado**: Gráficos interactivos y filtros por fecha.
- **Gestión Multi-negocio**: Soporte para Super Admins y aislamiento de datos por empresa.

## 🛠️ Tecnologías

- **React 18** + **Vite**
- **Tailwind CSS** (Diseño moderno y responsivo)
- **Lucide React** (Iconografía)
- **Context API** (Gestión de Auth, Toasts y Notificaciones)
- **Supabase Client** (Autenticación y Realtime)
- **Date-fns** (Manipulación de fechas)

## 🚀 Instalación y Desarrollo

### Requisitos previos
- Node.js (v16+)

### Pasos
1. Entrar al directorio:
   ```bash
   cd client
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno (`.env`):
   ```env
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   VITE_API_URL=http://localhost:3000/api
   ```
4. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 📱 PWA & Service Workers
La aplicación incluye un `manifest.json` y un Service Worker (`sw.js`) para permitir la instalación y el manejo de notificaciones en segundo plano.

## 📁 Estructura del Proyecto
- `src/components`: Componentes reutilizables de UI.
- `src/contexts`: Proveedores de estado global (Auth, Notifications).
- `src/pages`: Vistas principales de la aplicación.
- `src/lib`: Configuraciones de librerías externas (Supabase).
- `public/AppIcons`: Recursos visuales oficiales para la instalación en dispositivos.
