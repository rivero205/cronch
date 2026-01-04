# 🍴 CRUNCH - Sistema de Gestión de Negocio

Sistema completo de gestión para negocios de alimentos y bebidas que permite el seguimiento de producción, ventas, gastos y generación de reportes financieros.

## 📋 Características

- **Dashboard Interactivo**: Vista general con métricas clave del negocio
- **Gestión de Producción**: Registro y seguimiento de producción diaria
- **Control de Ventas**: Seguimiento de ventas por producto y período
- **Administración de Gastos**: Control de insumos y gastos operacionales
- **Reportes Financieros**: Generación de reportes detallados con análisis de ganancias

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19.2** - Librería de interfaz de usuario
- **Vite** - Build tool y desarrollo rápido
- **React Router DOM** - Navegación entre páginas
- **Tailwind CSS** - Framework de estilos
- **Lucide React** - Iconos
- **date-fns** - Manejo de fechas

### Backend
- **Node.js** - Entorno de ejecución
- **Express 5.2** - Framework web
- **MySQL2** - Base de datos
- **CORS** - Manejo de cross-origin requests
- **dotenv** - Variables de entorno

## 📁 Estructura del Proyecto

```
CRUNCH/
├── client/                 # Aplicación frontend
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── api.js         # Cliente API
│   │   └── main.jsx       # Punto de entrada
│   └── package.json
│
└── server/                # API Backend
    ├── routes/           # Definición de rutas
    ├── services/         # Lógica de negocio
    ├── repositories/     # Capa de acceso a datos
    ├── schema.sql        # Esquema de base de datos
    ├── seed_data.sql     # Datos de prueba
    └── package.json
```

## 📊 Modelo de Datos

El sistema utiliza MySQL con las siguientes tablas:

- **products**: Catálogo de productos (comida, bebida, etc.)
- **daily_production**: Registro de producción diaria
- **daily_sales**: Registro de ventas diarias
- **expenses**: Gastos e insumos

## 🚀 Requisitos Previos

- Node.js (versión 16 o superior)
- MySQL (versión 5.7 o superior)
- npm o yarn

## ⚙️ Instalación

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd CRUNCH
```

### 2. Configurar la Base de Datos

```bash
# Crear la base de datos en MySQL
mysql -u root -p

CREATE DATABASE crunch_db;
exit;

# Ejecutar el esquema
mysql -u root -p crunch_db < server/schema.sql

# (Opcional) Cargar datos de prueba
mysql -u root -p crunch_db < server/seed_data.sql
```

### 3. Configurar el Backend

```bash
cd server

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=crunch_db
PORT=3001
```

### 4. Configurar el Frontend

```bash
cd client

# Instalar dependencias
npm install
```

## 🏃 Ejecución

### Modo Desarrollo

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Modo Producción

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run build
npm run preview
```

## 📝 Scripts Disponibles

### Frontend (client/)
- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Genera build de producción
- `npm run preview` - Preview del build de producción
- `npm run lint` - Ejecuta ESLint

### Backend (server/)
- `npm run dev` - Inicia servidor con nodemon (auto-reload)
- `npm start` - Inicia servidor en modo producción

## 🔌 API Endpoints

### Productos
- `GET /api/products` - Obtener todos los productos
- `POST /api/products` - Crear nuevo producto

### Producción
- `GET /api/production` - Obtener registros de producción
- `POST /api/production` - Registrar producción

### Ventas
- `GET /api/sales` - Obtener registros de ventas
- `POST /api/sales` - Registrar venta

### Gastos
- `GET /api/expenses` - Obtener gastos
- `POST /api/expenses` - Registrar gasto

### Reportes
- `GET /api/reports?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Generar reporte

## 🎨 Capturas de Pantalla

_(Puedes agregar capturas de pantalla aquí)_

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia ISC.

## 📧 Contacto

Para preguntas o sugerencias, por favor abre un issue en el repositorio.

---

⭐ Si este proyecto te resulta útil, considera darle una estrella en GitHub!