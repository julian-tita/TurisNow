# TurisNow - Frontend React

Frontend moderno de TurisNow desarrollado con React, TypeScript y CSS3, que se conecta con el backend Spring Boot.

## 🚀 Características

- **React 18** con TypeScript para mejor desarrollo
- **React Router** para navegación entre páginas
- **Context API** para gestión de estado de autenticación
- **Diseño moderno** con efectos glassmorphism
- **Responsive design** que funciona en todos los dispositivos
- **Validaciones** en tiempo real
- **Manejo de errores** robusto
- **Integración completa** con el backend Spring Boot

## 📁 Estructura del Proyecto

```
frontend-react/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Login.tsx              # Componente de login
│   │   ├── Register.tsx           # Componente de registro
│   │   ├── Dashboard.tsx          # Dashboard principal
│   │   ├── ProtectedRoute.tsx     # Ruta protegida
│   │   ├── LoadingScreen.tsx     # Pantalla de carga
│   │   ├── AuthComponents.css    # Estilos de autenticación
│   │   ├── Dashboard.css         # Estilos del dashboard
│   │   └── LoadingScreen.css     # Estilos de carga
│   ├── contexts/
│   │   └── AuthContext.tsx       # Contexto de autenticación
│   ├── services/
│   │   └── authService.ts        # Servicio de autenticación
│   ├── App.tsx                   # Componente principal
│   ├── App.css                   # Estilos globales
│   ├── index.tsx                 # Punto de entrada
│   └── index.css                 # Estilos base
├── package.json                  # Dependencias y scripts
├── tsconfig.json                 # Configuración TypeScript
└── README.md                     # Este archivo
```

## 🛠️ Instalación

### Prerrequisitos

1. **Node.js** 16.0 o superior
2. **npm** o **yarn**
3. **Backend Spring Boot** ejecutándose en `http://localhost:8080`

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

La aplicación se abrirá automáticamente en `http://localhost:3000`.

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
REACT_APP_API_URL=http://localhost:8080/api/auth
REACT_APP_APP_NAME=TurisNow
```

### Configuración de la API

El frontend se conecta con los siguientes endpoints:

- **Login**: `POST /api/auth/login`
- **Registro**: `POST /api/auth/registro`
- **Health Check**: `GET /api/auth/health`

## 📱 Páginas y Componentes

### 1. Login (`/login`)
- Formulario de inicio de sesión
- Validaciones en tiempo real
- Opción de mostrar/ocultar contraseña
- Recordar usuario

### 2. Registro (`/register`)
- Formulario de registro completo
- Validaciones de email y contraseña
- Confirmación de contraseña
- Términos y condiciones

### 3. Dashboard (`/dashboard`)
- Panel principal con información del usuario
- **3 tarjetas principales**:
  - 🗺️ **Explorar Destinos** - Descubre nuevos lugares
  - 📅 **Mis Viajes** - Gestiona viajes y reservas
  - ⚙️ **Configuración** - Personaliza tu experiencia
- Botón de cerrar sesión

## 🎨 Características del Diseño

- **Glassmorphism** con efectos de cristal
- **Gradientes** modernos y atractivos
- **Animaciones suaves** para mejor UX
- **Iconos Font Awesome** integrados
- **Responsive design** para móviles y tablets
- **Tema consistente** en toda la aplicación

## 🔐 Autenticación

### Context API
- **AuthContext** para gestión global del estado
- **useAuth** hook para acceder a la autenticación
- **Persistencia** en localStorage

### Flujo de Autenticación
1. Usuario ingresa credenciales
2. Validación en tiempo real
3. Petición al backend
4. Almacenamiento del token JWT
5. Redirección al dashboard
6. Verificación de autenticación en rutas protegidas

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm start

# Construcción para producción
npm run build

# Ejecutar tests
npm test

# Eyectar configuración (no recomendado)
npm run eject
```

## 📊 Tecnologías Utilizadas

- **React 18** - Biblioteca principal
- **TypeScript** - Tipado estático
- **React Router** - Navegación
- **CSS3** - Estilos modernos
- **Font Awesome** - Iconos
- **Axios** - Peticiones HTTP (opcional)

## 🔄 Flujo de la Aplicación

1. **Usuario accede** a la aplicación
2. **Redirección automática** a `/login` si no está autenticado
3. **Login/Registro** con validaciones
4. **Autenticación** con el backend
5. **Almacenamiento** del token JWT
6. **Redirección** al dashboard
7. **Navegación** entre páginas protegidas

## 🐛 Solución de Problemas

### Error de Conexión
Si ves errores de conexión:
1. Verifica que el backend esté ejecutándose en el puerto 8080
2. Comprueba la configuración de CORS
3. Revisa la consola del navegador

### Error de Compilación
Si hay errores de TypeScript:
1. Verifica que todas las dependencias estén instaladas
2. Revisa la configuración de `tsconfig.json`
3. Asegúrate de que los tipos estén correctos

## 🚀 Despliegue

### Construcción para Producción

```bash
npm run build
```

Esto creará una carpeta `build` con los archivos optimizados para producción.

### Variables de Entorno de Producción

```env
REACT_APP_API_URL=https://tu-api.com/api/auth
REACT_APP_APP_NAME=TurisNow
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📝 Notas de Desarrollo

- **Componentes funcionales** con hooks
- **TypeScript** para mejor desarrollo
- **CSS Modules** para estilos encapsulados
- **Context API** para estado global
- **React Router** para navegación
- **Responsive design** mobile-first

---

**Desarrollado para TurisNow** - Tu plataforma de viajes favorita 🌍✈️
