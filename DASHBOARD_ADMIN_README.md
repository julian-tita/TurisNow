# Dashboard Administrativo - TurisNow

## 🎯 Descripción

Se ha implementado un Dashboard Administrativo completo para usuarios con rol de `ADMIN`. Cuando un usuario con rol de administrador inicia sesión, es automáticamente redirigido a `/admin/dashboard`.

## 📁 Estructura de Archivos Creados

```
frontend-react/src/
├── components/
│   ├── AdminRoute.tsx                    # Ruta protegida para admins
│   ├── Login.tsx                         # Modificado: Redirige según rol
│   └── admin/
│       ├── DashboardAdmin.tsx            # Dashboard principal admin
│       ├── DashboardAdmin.css            # Estilos del dashboard
│       ├── UsersManagement.tsx           # Gestión de usuarios
│       ├── ExperiencesManagement.tsx     # Gestión de experiencias
│       └── Management.css                # Estilos compartidos
└── App.tsx                                # Modificado: Nueva ruta /admin/dashboard

scripts/
└── create_admin_user.sql                  # Script SQL para crear usuarios
```

## 🚀 Características Implementadas

### 1. **Dashboard Principal** (`/admin/dashboard`)
   - ✅ KPIs generales (Today's Money, Users, Clients, Sales)
   - ✅ Gráficos placeholder (Website View, Daily Sales, Completed Tasks)
   - ✅ Tabla de proyectos con progreso
   - ✅ Timeline de órdenes

### 2. **Gestión de Usuarios** (pestaña Usuarios)
   - ✅ Listado completo de usuarios
   - ✅ Búsqueda por nombre, email o username
   - ✅ Filtro por rol (USER/ADMIN)
   - ✅ Estadísticas: Total, Activos, Admins, Inactivos
   - ✅ Cambio de rol en tiempo real
   - ✅ Activar/Desactivar usuarios
   - ✅ Eliminar usuarios
   - ✅ Botones de acción (Ver, Editar, Activar/Desactivar, Eliminar)

### 3. **Gestión de Experiencias** (pestaña Experiencias)
   - ✅ Listado completo de experiencias turísticas
   - ✅ Búsqueda por título, destino o descripción
   - ✅ Filtro por categoría
   - ✅ Estadísticas: Total, Activas, Categorías, Precio Promedio
   - ✅ Activar/Desactivar experiencias
   - ✅ Eliminar experiencias
   - ✅ Botones de acción

### 4. **Navegación y Seguridad**
   - ✅ Sidebar lateral con menú de navegación
   - ✅ Ruta protegida exclusiva para ADMIN
   - ✅ Redirección automática según rol en login
   - ✅ Protección de rutas con `AdminRoute`

## 🔐 Sistema de Autenticación y Roles

### Flujo de Login:
1. Usuario ingresa credenciales en `/login`
2. Backend valida y retorna el token + datos de usuario (incluyendo `rol`)
3. Frontend verifica el rol:
   - **Si `rol === 'ADMIN'`** → Redirige a `/admin/dashboard`
   - **Si `rol === 'USER'`** → Redirige a `/dashboard`

### Protección de Rutas:
- **`ProtectedRoute`**: Para usuarios autenticados (cualquier rol)
- **`AdminRoute`**: Solo para usuarios con `rol === 'ADMIN'`

## 📋 Pasos para Probar

### 1. Crear Usuarios en la Base de Datos

Ejecuta el script SQL en PostgreSQL:

```bash
# En PostgreSQL (psql):
\c turisnow
\i scripts/create_admin_user.sql
```

O copia y pega el contenido del archivo `scripts/create_admin_user.sql` en tu cliente PostgreSQL.

### 2. Iniciar el Backend

```bash
cd "c:\Users\Faun0\Documents\Proyecto\Nueva carpeta\TurisNow"
mvn spring-boot:run
```

**Asegúrate de que:**
- PostgreSQL esté corriendo en `localhost:5432`
- La base de datos `turisnow` exista
- El usuario `postgres` con contraseña `123456` tenga permisos

### 3. Iniciar el Frontend

```bash
cd frontend-react
npm start
```

### 4. Probar el Login

#### **Como Administrador:**
- **Email:** `admin@turisnow.com`
- **Contraseña:** `admin123`
- **Resultado:** Redirige a `/admin/dashboard` con acceso completo

#### **Como Usuario Normal:**
- **Email:** `usuario@turisnow.com`
- **Contraseña:** `admin123`
- **Resultado:** Redirige a `/dashboard` (usuario normal)

## 🎨 Características del Diseño

### Sidebar
- Fondo oscuro con gradiente
- Navegación con iconos FontAwesome
- Hover effects y transiciones suaves
- Indicador visual del menú activo

### KPI Cards
- Iconos coloridos con gradientes
- Animación hover (levanta la tarjeta)
- Indicadores de cambio positivo/negativo
- Diseño responsive

### Tablas de Gestión
- Diseño moderno tipo Material Design
- Búsqueda y filtros en tiempo real
- Acciones inline con botones coloridos
- Responsive con scroll horizontal en móviles

### Estadísticas
- Cards con iconos temáticos
- Colores diferenciados por tipo
- Valores calculados dinámicamente

## 🔧 Próximos Pasos (Sugerencias)

### Backend:
1. Crear endpoints REST para:
   - `GET /api/admin/users` - Listar usuarios
   - `PUT /api/admin/users/{id}/role` - Cambiar rol
   - `PUT /api/admin/users/{id}/status` - Activar/Desactivar
   - `DELETE /api/admin/users/{id}` - Eliminar usuario
   - `GET /api/admin/experiences` - Listar experiencias
   - `PUT /api/admin/experiences/{id}/status` - Activar/Desactivar
   - `DELETE /api/admin/experiences/{id}` - Eliminar experiencia
   - `GET /api/admin/stats` - Obtener estadísticas

### Frontend:
1. Conectar las tablas con APIs reales (actualmente usan datos mock)
2. Implementar modales para:
   - Crear nuevo usuario
   - Editar usuario
   - Ver detalles completos
   - Crear/editar experiencia
3. Agregar gráficos reales con Chart.js o Recharts
4. Implementar paginación real con backend
5. Agregar notificaciones toast para feedback de acciones

## 🐛 Solución de Problemas

### Error 401 en Login:
- ✅ **Solucionado**: El backend ahora busca por `email` en lugar de `username`
- Verifica que el archivo `AuthService.java` use `findByEmail()`

### Puerto 9090 ocupado:
```bash
# En Windows PowerShell:
netstat -ano | findstr :9090
taskkill /PID <PID> /F
```

### Base de datos no conecta:
1. Verifica que PostgreSQL esté corriendo
2. Verifica credenciales en `application.properties`
3. Crea la base de datos si no existe:
```sql
CREATE DATABASE turisnow;
```

## 📸 Capturas de Funcionalidades

### Vista General del Dashboard Admin:
- KPIs en la parte superior
- Gráficos en el medio
- Proyectos y órdenes en la parte inferior

### Gestión de Usuarios:
- Barra de búsqueda y filtros
- 4 tarjetas de estadísticas
- Tabla con todos los usuarios
- Cambio de rol con selector dropdown
- Botones de acción coloridos

### Gestión de Experiencias:
- Similar a usuarios pero con datos de experiencias
- Campos específicos: destino, precio, duración, categoría
- Filtro por categoría dinámica

## ✨ Créditos

Desarrollado siguiendo el diseño de Material Tailwind Dashboard React.
Adaptado para TurisNow con funcionalidades específicas de gestión turística.

---

**¿Necesitas ayuda?** Revisa los logs del backend y frontend para más detalles de errores.
