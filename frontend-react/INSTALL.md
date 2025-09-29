# 🚀 Instalación del Frontend React

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 16.0 o superior
- **npm** (viene con Node.js)
- **Backend Spring Boot** ejecutándose en `http://localhost:8080`

## 📦 Instalación Paso a Paso

### 1. Instalar Dependencias

```bash
# Navegar al directorio del frontend React
cd frontend-react

# Instalar todas las dependencias
npm install
```

### 2. Verificar Backend

Asegúrate de que tu backend Spring Boot esté ejecutándose:

```bash
# En la raíz del proyecto TurisNow
mvn spring-boot:run
```

El backend debe estar disponible en `http://localhost:8080`

### 3. Iniciar el Frontend

```bash
# Iniciar el servidor de desarrollo
npm start
```

La aplicación se abrirá automáticamente en `http://localhost:3000`

## 🔧 Configuración Opcional

### Variables de Entorno

Crea un archivo `.env` en `frontend-react/`:

```env
REACT_APP_API_URL=http://localhost:8080/api/auth
REACT_APP_APP_NAME=TurisNow
```

### Configuración de CORS

Asegúrate de que tu backend tenga CORS configurado para `http://localhost:3000`:

```java
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
```

## 🚀 Scripts Disponibles

```bash
# Desarrollo (puerto 3000)
npm start

# Construcción para producción
npm run build

# Ejecutar tests
npm test

# Analizar el bundle
npm run build && npx serve -s build
```

## 📱 Navegación

Una vez iniciado, puedes navegar a:

- **Login**: `http://localhost:3000/login`
- **Registro**: `http://localhost:3000/register`
- **Dashboard**: `http://localhost:3000/dashboard` (requiere autenticación)

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error de conexión con el backend
1. Verifica que el backend esté ejecutándose en el puerto 8080
2. Comprueba la configuración de CORS
3. Revisa la consola del navegador para errores

### Puerto 3000 ocupado
```bash
# Usar un puerto diferente
PORT=3001 npm start
```

## 🔄 Flujo de Desarrollo

1. **Inicia el backend** Spring Boot
2. **Inicia el frontend** React
3. **Abre** `http://localhost:3000`
4. **Prueba** el login/registro
5. **Verifica** el dashboard

## 📊 Estructura de Archivos

```
frontend-react/
├── public/           # Archivos públicos
├── src/
│   ├── components/   # Componentes React
│   ├── contexts/     # Contextos (Auth)
│   ├── services/     # Servicios (API)
│   └── ...
├── package.json      # Dependencias
└── README.md         # Documentación
```

## ✅ Verificación

Para verificar que todo funciona correctamente:

1. ✅ Backend ejecutándose en puerto 8080
2. ✅ Frontend ejecutándose en puerto 3000
3. ✅ Login funciona correctamente
4. ✅ Registro funciona correctamente
5. ✅ Dashboard se muestra después del login
6. ✅ Logout funciona correctamente

## 🆘 Soporte

Si tienes problemas:

1. Revisa la consola del navegador
2. Verifica que el backend esté ejecutándose
3. Comprueba la configuración de CORS
4. Asegúrate de que todas las dependencias estén instaladas

---

¡Listo para desarrollar! 🎉
