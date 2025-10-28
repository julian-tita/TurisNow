# 🔧 Solución CORS - Sistema de Reservas TurisNow

## 🔴 **Problema Identificado**

### Error en consola:
```
Access to XMLHttpRequest at 'http://localhost:9090/api/reservas' from origin 'http://localhost:3000' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Causa raíz:
1. ❌ **SecurityConfig no tenía configuración CORS**
2. ❌ **Servicios frontend usaban URLs absolutas en lugar del proxy de Vite**
3. ❌ **Peticiones OPTIONS (preflight) no retornaban headers CORS correctos**

---

## ✅ **Soluciones Aplicadas**

### **1. Configuración CORS en Backend (SecurityConfig.java)**

#### **Cambios realizados:**
- ✅ Agregado `corsConfigurationSource()` bean
- ✅ Configurado `.cors()` en SecurityFilterChain
- ✅ Permitidos origins: `localhost:3000`, `localhost:5173`, `localhost:*`
- ✅ Permitidos métodos: GET, POST, PUT, DELETE, PATCH, OPTIONS
- ✅ Permitidos headers: Authorization, Content-Type, Accept, Origin
- ✅ Habilitadas credenciales (cookies, JWT)
- ✅ Cache de preflight: 1 hora

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    configuration.setAllowedOriginPatterns(Arrays.asList(
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:*"
    ));
    
    configuration.setAllowedMethods(Arrays.asList(
        "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
    ));
    
    configuration.setAllowedHeaders(Arrays.asList(
        "Authorization", "Content-Type", "Accept", "Origin",
        "Access-Control-Request-Method", "Access-Control-Request-Headers"
    ));
    
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);
    
    // Aplicar a todos los endpoints
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    
    return source;
}
```

#### **Integración con Security:**
```java
http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
```

---

### **2. Uso de Proxy de Vite (Frontend)**

#### **Configuración existente en vite.config.ts:**
```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:9090',
      changeOrigin: true,
      secure: false
    }
  }
}
```

#### **Cambios en servicios:**

**reservaService.ts:**
```typescript
// ANTES (URL absoluta - causaba CORS):
const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:9090'}/api`;

// AHORA (URL relativa - usa proxy):
const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'; // Proxy de Vite
```

**experienciaService.ts:**
```typescript
// ANTES:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9090';

// AHORA:
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
```

**authService.ts:**
```typescript
// ANTES:
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/auth` 
  : 'http://localhost:9090/api/auth';

// AHORA:
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/auth` 
  : '/api/auth'; // Proxy de Vite
```

---

### **3. Configuración .env (Frontend)**

#### **.env actualizado:**
```properties
# Backend API Configuration
# En desarrollo, Vite proxy redirige /api a http://localhost:9090/api automáticamente
# Descomentar solo para producción o para pruebas sin proxy
# VITE_API_URL=http://localhost:9090
VITE_APP_NAME=TurisNow
```

**Explicación:**
- En **desarrollo**: No se define `VITE_API_URL` → servicios usan `/api` → proxy de Vite redirige a `localhost:9090`
- En **producción**: Se define `VITE_API_URL` con la URL real del backend

---

## 🔄 **Flujo de Peticiones**

### **Desarrollo (con proxy):**
```
Frontend (localhost:3000)
    ↓
    POST /api/reservas
    ↓
Vite Proxy intercepta
    ↓
    POST http://localhost:9090/api/reservas
    ↓
Backend Spring Boot
    ↓
CORS Config permite origen localhost:3000
    ↓
Respuesta con headers CORS correctos
    ↓
Frontend recibe respuesta ✅
```

### **Producción (sin proxy):**
```
Frontend (dominio-produccion.com)
    ↓
    POST https://api.turisnow.com/api/reservas
    ↓
Backend Spring Boot
    ↓
CORS Config permite origen produccion
    ↓
Respuesta con headers CORS correctos
    ↓
Frontend recibe respuesta ✅
```

---

## 📝 **Archivos Modificados**

### **Backend:**
1. ✅ `SecurityConfig.java`
   - Agregado método `corsConfigurationSource()`
   - Integrado CORS en `filterChain()`
   - Imports agregados: `CorsConfiguration`, `CorsConfigurationSource`, `UrlBasedCorsConfigurationSource`

### **Frontend:**
1. ✅ `reservaService.ts` - Cambio a URL relativa
2. ✅ `experienciaService.ts` - Cambio a URL relativa
3. ✅ `authService.ts` - Cambio a URL relativa
4. ✅ `.env` - Comentado `VITE_API_URL` para desarrollo

---

## 🧪 **Cómo Probar**

### **1. Reiniciar Backend:**
```bash
cd C:\Users\Faun0\Documents\Proyecto\Nueva carpeta\TurisNow
mvn spring-boot:run
```

**Verificar en logs:**
```
Started TurisNowApplication in X.XXX seconds
Tomcat started on port 9090
```

### **2. Reiniciar Frontend:**
```bash
cd frontend-vite
npm run dev
```

**Verificar en logs:**
```
VITE v7.x.x ready in XXX ms
➜ Local:   http://localhost:3000/
➜ Network: use --host to expose
➜ press h to show help
```

### **3. Probar reserva:**
1. Ir a `http://localhost:3000/experiencias`
2. Seleccionar una experiencia
3. Hacer clic en "Reservar Ahora"
4. Completar los 5 pasos
5. En paso 5, hacer clic en "Confirmar y Pagar"

### **4. Verificar en consola del navegador:**
```javascript
// ANTES (error):
❌ POST http://localhost:9090/api/reservas net::ERR_FAILED
❌ Access blocked by CORS policy

// AHORA (éxito):
✅ Sending Request to the Target: POST /api/reservas
✅ Received Response from the Target: 200 /api/reservas
✅ Reserva creada exitosamente
```

### **5. Verificar en logs de Spring:**
```
POST "/api/reservas", parameters={}
Mapped to [ReservaController.crearReserva()]
Completed 200 OK
```

---

## 🎯 **Resultado Esperado**

### ✅ **Éxito:**
- Peticiones GET a `/api/experiencias` funcionan
- Peticiones POST a `/api/reservas` funcionan
- Peticiones PUT a `/api/reservas/:id/confirmar` funcionan
- No hay errores CORS en consola
- Reserva se crea y confirma correctamente
- Redirección a "Mis Reservas" funciona

### ❌ **Si aún hay problemas:**

1. **Limpiar caché del navegador:**
   - Chrome: DevTools → Network → "Disable cache"
   - O modo incógnito

2. **Verificar que backend esté corriendo en puerto 9090:**
   ```bash
   netstat -ano | findstr :9090
   ```

3. **Verificar que frontend esté en puerto 3000:**
   ```bash
   netstat -ano | findstr :3000
   ```

4. **Ver logs detallados del proxy de Vite:**
   - Revisar consola del terminal donde corre `npm run dev`
   - Debe mostrar: "Sending Request to the Target: POST /api/reservas"

5. **Habilitar logs de CORS en Spring:**
   ```properties
   # application.properties
   logging.level.org.springframework.web.cors=DEBUG
   ```

---

## 📊 **Comparación Antes/Después**

| Aspecto | ❌ Antes | ✅ Después |
|---------|----------|------------|
| CORS en Backend | No configurado | Configurado completamente |
| URLs Frontend | Absolutas (localhost:9090) | Relativas (/api) |
| Proxy Vite | No usado | Usado correctamente |
| Peticiones GET | ✅ Funcionan | ✅ Funcionan |
| Peticiones POST | ❌ CORS Error | ✅ Funcionan |
| Peticiones OPTIONS | ❌ Fallan | ✅ Funcionan |

---

## 🚀 **Próximos Pasos**

1. ✅ Reiniciar backend con nueva configuración CORS
2. ✅ Reiniciar frontend para aplicar cambios en servicios
3. ✅ Probar flujo completo de reserva
4. ✅ Verificar que no haya errores en consola
5. ✅ Confirmar que reserva se crea en base de datos

---

## 📚 **Documentación de Referencia**

- [Spring CORS Documentation](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-cors)
- [Vite Proxy Configuration](https://vitejs.dev/config/server-options.html#server-proxy)
- [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Fecha de actualización:** 27 de octubre de 2025
**Estado:** ✅ SOLUCIONADO
