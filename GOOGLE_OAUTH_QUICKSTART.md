# 🚀 Inicio Rápido - Google OAuth en TurisNow

## ⚡ Configuración Rápida (5 minutos)

### 1️⃣ Obtener Google Client ID

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo
3. Habilita "Google+ API"
4. Crea credenciales OAuth 2.0 (Aplicación web)
5. Agrega orígenes autorizados:
   ```
   http://localhost:5173
   http://localhost:3000
   ```
6. Copia el **Client ID**

---

### 2️⃣ Configurar Backend

#### Opción A: Variable de Entorno (Recomendado)
```powershell
# Windows PowerShell
$env:GOOGLE_CLIENT_ID="tu-client-id.apps.googleusercontent.com"
```

#### Opción B: application.properties
Edita `src/main/resources/application.properties`:
```properties
google.client.id=tu-client-id.apps.googleusercontent.com
```

---

### 3️⃣ Configurar Frontend

Crea archivo `.env` en `frontend-vite/`:
```env
VITE_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
```

---

### 4️⃣ Migrar Base de Datos

Ejecuta el script SQL en tu base de datos PostgreSQL:
```bash
psql -U postgres -d turisnow -f scripts/add_google_oauth_column.sql
```

O manualmente:
```sql
ALTER TABLE usuarios ADD COLUMN google_id VARCHAR(255) UNIQUE;
CREATE INDEX idx_usuarios_google_id ON usuarios(google_id);
```

---

### 5️⃣ Iniciar Aplicación

#### Terminal 1 - Backend
```bash
cd TurisNow
./mvnw spring-boot:run
```

#### Terminal 2 - Frontend
```bash
cd frontend-vite
npm install
npm run dev
```

---

### 6️⃣ Probar

1. Abre [http://localhost:5173](http://localhost:5173)
2. Ve a Login
3. Haz clic en "Sign in with Google"
4. ✅ Listo!

---

## 🔍 Verificar Implementación

### Backend
```bash
# Verificar que el servidor está corriendo
curl http://localhost:9090/api/auth/health
```

### Frontend
```bash
# Verificar que el CLIENT_ID está configurado
echo $VITE_GOOGLE_CLIENT_ID
```

### Base de Datos
```sql
-- Verificar que la columna google_id existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'usuarios' AND column_name = 'google_id';
```

---

## 📝 Checklist de Verificación

- [ ] Client ID obtenido de Google Cloud Console
- [ ] Variable `GOOGLE_CLIENT_ID` configurada en backend
- [ ] Archivo `.env` creado en frontend con `VITE_GOOGLE_CLIENT_ID`
- [ ] Columna `google_id` agregada a tabla `usuarios`
- [ ] Backend corriendo en puerto 9090
- [ ] Frontend corriendo en puerto 5173
- [ ] Botón de Google visible en página de Login
- [ ] Primer login exitoso con cuenta de Google

---

## ❗ Errores Comunes

### "Token de Google inválido"
**Causa:** Client ID diferente en frontend y backend  
**Solución:** Verifica que ambos usen el mismo Client ID

### "Botón de Google no aparece"
**Causa:** Variable `VITE_GOOGLE_CLIENT_ID` no configurada  
**Solución:** Crea archivo `.env` en `frontend-vite/`

### "Error de CORS"
**Causa:** Origen no autorizado en Google Cloud Console  
**Solución:** Agrega `http://localhost:5173` en orígenes autorizados

---

## 📚 Documentación Completa

Para detalles técnicos completos, ver: `GOOGLE_OAUTH_IMPLEMENTATION.md`

---

## 🆘 Soporte

Si encuentras problemas:
1. Verifica el checklist anterior
2. Revisa los logs del backend y frontend
3. Consulta la documentación completa en `GOOGLE_OAUTH_IMPLEMENTATION.md`
