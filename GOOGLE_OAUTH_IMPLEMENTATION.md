# Implementación de Google OAuth en TurisNow

## ✅ Implementación Completada

Se ha implementado exitosamente la autenticación con Google OAuth 2.0 en TurisNow, permitiendo a los usuarios iniciar sesión usando sus cuentas de Google.

---

## 📋 Archivos Modificados/Creados

### Backend (Spring Boot)

#### 1. **pom.xml**
- ✅ Agregada dependencia `com.google.api-client:google-api-client:2.2.0`

#### 2. **Usuario.java** (modelo)
- ✅ Agregado campo `googleId` (String, unique, nullable)
- Permite vincular cuentas de Google con usuarios existentes

#### 3. **UsuarioRepository.java**
- ✅ Agregado método `findByGoogleId(String googleId)`

#### 4. **GoogleLoginRequest.java** (nuevo DTO)
- ✅ DTO para recibir el token de Google desde el frontend
- Campo: `credential` (token JWT de Google)

#### 5. **AuthService.java**
- ✅ Agregado método `googleAuth(GoogleLoginRequest request)`
- Verifica token de Google usando `GoogleIdTokenVerifier`
- Busca usuario por `googleId` o `email`
- Crea nuevo usuario si no existe
- Vincula cuenta de Google a usuario existente si coincide email
- Genera token JWT propio del sistema

#### 6. **AuthController.java**
- ✅ Agregado endpoint `POST /api/auth/google`
- Recibe `GoogleLoginRequest` y devuelve `AuthResponse`

#### 7. **application.properties**
- ✅ Agregada configuración `google.client.id=${GOOGLE_CLIENT_ID:your-google-client-id-here}`

### Frontend (React + Vite + TypeScript)

#### 8. **GoogleLoginButton.tsx** (nuevo componente)
- ✅ Componente React que renderiza el botón de Google
- Carga script de Google Identity Services dinámicamente
- Maneja callback del token de Google
- Callbacks personalizables: `onSuccess`, `onError`

#### 9. **authService.ts**
- ✅ Agregado método `loginWithGoogle(credential: string)`
- Envía token a `POST /api/auth/google`
- Procesa respuesta y retorna `AuthResponse`

#### 10. **AuthContext.tsx**
- ✅ Agregado método `loginWithGoogle` al contexto
- Actualiza estado de usuario y token
- Guarda en localStorage

#### 11. **Login.tsx**
- ✅ Integrado componente `GoogleLoginButton`
- Agregado separador "O continúa con"
- Redirección según rol después de login exitoso

#### 12. **.env.example**
- ✅ Archivo de ejemplo con documentación
- Variable `VITE_GOOGLE_CLIENT_ID`
- Instrucciones para obtener Client ID

---

## 🔧 Configuración Requerida

### 1. Google Cloud Console

Para que la autenticación funcione, debes configurar Google Cloud Console:

#### Paso 1: Crear Proyecto
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombre sugerido: "TurisNow"

#### Paso 2: Habilitar API
1. En el menú lateral, ve a **APIs y servicios** > **Biblioteca**
2. Busca "Google+ API" o "Google Identity"
3. Haz clic en **Habilitar**

#### Paso 3: Crear Credenciales OAuth 2.0
1. Ve a **APIs y servicios** > **Credenciales**
2. Clic en **+ CREAR CREDENCIALES** > **ID de cliente de OAuth 2.0**
3. Tipo de aplicación: **Aplicación web**
4. Nombre: "TurisNow Web Client"

#### Paso 4: Configurar Orígenes Autorizados
Agregar los siguientes URIs autorizados de JavaScript:

**Desarrollo:**
```
http://localhost:5173
http://localhost:3000
```

**Producción:**
```
https://tudominio.com
```

#### Paso 5: Copiar Client ID
1. Una vez creado, copia el **Client ID**
2. Tiene formato: `123456789-abcdefgh.apps.googleusercontent.com`

---

### 2. Configuración Backend

#### Opción A: Variable de entorno (Recomendado para producción)
```bash
# Windows (PowerShell)
$env:GOOGLE_CLIENT_ID="tu-client-id.apps.googleusercontent.com"

# Linux/Mac
export GOOGLE_CLIENT_ID="tu-client-id.apps.googleusercontent.com"
```

#### Opción B: application.properties
Edita `src/main/resources/application.properties`:
```properties
google.client.id=tu-client-id.apps.googleusercontent.com
```

⚠️ **Importante:** No commitear el Client ID real en Git si es un repositorio público.

---

### 3. Configuración Frontend

#### Crear archivo .env
En la carpeta `frontend-vite/`, crea un archivo `.env`:

```env
VITE_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
```

⚠️ **Importante:** 
- El archivo `.env` NO debe incluirse en Git (ya está en `.gitignore`)
- Usa `.env.example` como plantilla
- En producción, configura esta variable en tu servidor/hosting

---

## 🚀 Cómo Usar

### Para Usuarios

1. Ve a la página de Login
2. Verás el botón "Sign in with Google"
3. Haz clic en el botón
4. Selecciona tu cuenta de Google
5. Acepta los permisos
6. Serás redirigido automáticamente a la aplicación

### Para Desarrolladores

#### Iniciar Backend
```bash
cd TurisNow
./mvnw spring-boot:run
```

#### Iniciar Frontend
```bash
cd frontend-vite
npm install
npm run dev
```

#### Verificar Implementación
1. Backend debería estar en `http://localhost:9090`
2. Frontend debería estar en `http://localhost:5173`
3. Probar endpoint: `POST http://localhost:9090/api/auth/google`

---

## 🔐 Flujo de Autenticación

```
┌─────────┐                 ┌──────────┐                 ┌─────────┐
│ Usuario │                 │ Frontend │                 │ Backend │
└────┬────┘                 └────┬─────┘                 └────┬────┘
     │                           │                            │
     │ 1. Clic en botón Google   │                            │
     ├──────────────────────────>│                            │
     │                           │                            │
     │ 2. Popup Google OAuth     │                            │
     │<──────────────────────────│                            │
     │                           │                            │
     │ 3. Autoriza en Google     │                            │
     ├──────────────────────────>│                            │
     │                           │                            │
     │ 4. Google devuelve token  │                            │
     │<──────────────────────────│                            │
     │                           │                            │
     │                           │ 5. POST /api/auth/google   │
     │                           ├───────────────────────────>│
     │                           │    { credential: "..." }   │
     │                           │                            │
     │                           │ 6. Verifica token Google   │
     │                           │                            │─┐
     │                           │                            │ │
     │                           │                            │<┘
     │                           │                            │
     │                           │ 7. Busca/Crea usuario      │
     │                           │                            │─┐
     │                           │                            │ │
     │                           │                            │<┘
     │                           │                            │
     │                           │ 8. Genera JWT propio       │
     │                           │                            │─┐
     │                           │                            │ │
     │                           │                            │<┘
     │                           │                            │
     │                           │ 9. { token, user }         │
     │                           │<───────────────────────────│
     │                           │                            │
     │ 10. Login exitoso         │                            │
     │<──────────────────────────│                            │
     │                           │                            │
     │ 11. Redirige a Home/Admin │                            │
     │<──────────────────────────│                            │
```

---

## 📊 Lógica de Vinculación de Cuentas

El sistema implementa vinculación inteligente de cuentas:

### Escenario 1: Usuario nuevo (no existe en BD)
```
Google ID: 123456789
Email: juan@gmail.com
→ Crea nuevo usuario con googleId y email
```

### Escenario 2: Usuario existe por email (sin Google vinculado)
```
BD: { email: "juan@gmail.com", googleId: null }
Google: { id: "123456789", email: "juan@gmail.com" }
→ Vincula: Actualiza googleId = "123456789"
```

### Escenario 3: Usuario existe con Google ya vinculado
```
BD: { email: "juan@gmail.com", googleId: "123456789" }
Google: { id: "123456789", email: "juan@gmail.com" }
→ Login directo
```

---

## 🗃️ Migración de Base de Datos

Después de la implementación, ejecuta esta migración SQL:

```sql
-- Agregar columna google_id a la tabla usuarios
ALTER TABLE usuarios 
ADD COLUMN google_id VARCHAR(255) UNIQUE;

-- Índice para búsquedas rápidas por Google ID
CREATE INDEX idx_usuarios_google_id ON usuarios(google_id);
```

---

## 🧪 Pruebas

### Caso de Prueba 1: Login con cuenta nueva
1. Usuario sin cuenta en TurisNow
2. Hace login con Google
3. ✅ Se crea cuenta automáticamente
4. ✅ Se genera JWT
5. ✅ Redirige a Home

### Caso de Prueba 2: Vinculación de cuenta existente
1. Usuario tiene cuenta con email `user@gmail.com`
2. Hace login con Google usando mismo email
3. ✅ Se vincula cuenta de Google
4. ✅ Próximo login puede usar Google o credenciales normales

### Caso de Prueba 3: Token inválido
1. Usuario intenta con token manipulado
2. ✅ Backend rechaza: "Token de Google inválido"

### Caso de Prueba 4: Client ID incorrecto
1. Frontend tiene CLIENT_ID equivocado
2. ✅ Google no muestra popup o muestra error

---

## 🔒 Consideraciones de Seguridad

### ✅ Implementado
- ✅ Verificación de token en backend (NUNCA confiar en frontend)
- ✅ Validación de audience (Client ID) en token
- ✅ Uso de HTTPS en producción (configurar en deployment)
- ✅ No se guarda el token de Google (solo se usa para verificar)
- ✅ Generación de JWT propio del sistema

### 🚨 Recomendaciones Adicionales
- [ ] Configurar CORS correctamente para producción
- [ ] Rotar JWT secret periódicamente
- [ ] Implementar refresh tokens
- [ ] Agregar rate limiting en endpoint `/auth/google`
- [ ] Logs de intentos de autenticación fallidos
- [ ] Notificación al usuario cuando se vincula cuenta de Google

---

## ❓ Troubleshooting

### Error: "VITE_GOOGLE_CLIENT_ID no está configurado"
**Solución:** Crea archivo `.env` en `frontend-vite/` con la variable.

### Error: "Token de Google inválido"
**Posibles causas:**
1. Client ID del backend ≠ Client ID del frontend
2. Token expirado (tokens de Google expiran en 1 hora)
3. Origen no autorizado en Google Cloud Console

**Solución:** Verifica que `GOOGLE_CLIENT_ID` sea el mismo en frontend y backend.

### Error: "No se pudo conectar con el servidor"
**Solución:** Verifica que el backend esté corriendo en `http://localhost:9090`.

### Botón de Google no aparece
**Posibles causas:**
1. Script de Google no se cargó
2. Client ID faltante en `.env`
3. Bloqueador de ads/trackers

**Solución:** 
1. Abre consola del navegador
2. Verifica errores de carga del script
3. Desactiva bloqueadores temporalmente

---

## 📚 Referencias

- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [Google API Client Java](https://github.com/googleapis/google-api-java-client)
- [OAuth 2.0 Documentation](https://oauth.net/2/)

---

## ✨ Próximas Mejoras

- [ ] Agregar botón de Google también en página de Registro
- [ ] Implementar desvinculación de cuenta de Google en perfil
- [ ] Mostrar en perfil si usuario tiene Google vinculado
- [ ] Permitir vincular múltiples métodos de autenticación
- [ ] Implementar "Sign in with Apple" y otras alternativas
- [ ] Agregar analytics de métodos de login más usados

---

**Implementación completada el:** [Fecha]  
**Documentado por:** GitHub Copilot  
**Versión:** 1.0
