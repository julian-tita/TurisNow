# ✅ Configuración Completada - Google OAuth

## 🎉 Client ID Configurado

**Client ID:** `660781855519-carf8j12spidnaar1gpsoon8dr12qhtu.apps.googleusercontent.com`

### ✅ Archivos Actualizados

1. **Backend** (`application.properties`):
   ```properties
   google.client.id=660781855519-carf8j12spidnaar1gpsoon8dr12qhtu.apps.googleusercontent.com
   ```

2. **Frontend** (`.env`):
   ```env
   VITE_GOOGLE_CLIENT_ID=660781855519-carf8j12spidnaar1gpsoon8dr12qhtu.apps.googleusercontent.com
   ```

---

## 📊 Migración de Base de Datos (IMPORTANTE)

### Opción 1: Supabase Dashboard (Recomendado)

1. Ve a [Supabase Dashboard](https://app.supabase.com/)
2. Selecciona tu proyecto: `stoked-woods-439013-p0`
3. Ve a **SQL Editor**
4. Copia y pega el siguiente SQL:

```sql
-- Agregar columna google_id
ALTER TABLE usuarios 
ADD COLUMN google_id VARCHAR(255);

-- Agregar constraint unique
ALTER TABLE usuarios 
ADD CONSTRAINT usuarios_google_id_unique UNIQUE (google_id);
```

5. Haz clic en **RUN**
6. ✅ Listo!

### Opción 2: Usar script preparado

```bash
# Desde la raíz del proyecto
psql "postgresql://postgres:7MsD1C-9@db.efnwzwxcsafmtxrafggw.supabase.co:5432/postgres" -f scripts/supabase_google_oauth_migration.sql
```

### Verificar Migración

Ejecuta en Supabase SQL Editor:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuarios' AND column_name = 'google_id';
```

**Resultado esperado:**
```
column_name | data_type         | is_nullable
google_id   | character varying | YES
```

---

## 🚀 Iniciar Aplicación

### Terminal 1 - Backend
```powershell
cd "c:\Users\Faun0\Documents\Proyecto\Nueva carpeta\TurisNow"
.\mvnw spring-boot:run
```

### Terminal 2 - Frontend
```powershell
cd "c:\Users\Faun0\Documents\Proyecto\Nueva carpeta\TurisNow\frontend-vite"
npm run dev
```

---

## ✅ Checklist Final

- [x] Client ID configurado en backend
- [x] Client ID configurado en frontend
- [ ] **Migración SQL ejecutada en Supabase** ⚠️ PENDIENTE
- [ ] Backend iniciado (puerto 9090)
- [ ] Frontend iniciado (puerto 5173)
- [ ] Probar login con Google

---

## 🧪 Probar Implementación

1. Abre http://localhost:5173
2. Ve a la página de Login
3. Haz clic en el botón "Sign in with Google"
4. Selecciona tu cuenta de Google
5. ✅ Deberías ser redirigido a la aplicación

---

## ⚠️ IMPORTANTE - Migración Pendiente

**ANTES DE PROBAR EL LOGIN CON GOOGLE:**

Debes ejecutar la migración SQL en Supabase para agregar la columna `google_id` a la tabla `usuarios`.

**Sin esta migración, el login con Google NO funcionará.**

---

## 📝 Orígenes Autorizados Configurados

✅ http://localhost:5173  
✅ http://localhost:3000

Si usas otro puerto, agrégalo en Google Cloud Console.

---

## 🔒 Credenciales de Google

**Client ID:** `660781855519-carf8j12spidnaar1gpsoon8dr12qhtu.apps.googleusercontent.com`  
**Client Secret:** `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`  
**Project ID:** `stoked-woods-439013-p0`

⚠️ **NOTA:** Estas credenciales son sensibles. No las compartas públicamente.

---

## 📚 Archivos de Referencia

- Guía rápida: `GOOGLE_OAUTH_QUICKSTART.md`
- Documentación completa: `GOOGLE_OAUTH_IMPLEMENTATION.md`
- Script migración: `scripts/supabase_google_oauth_migration.sql`
- Credenciales: `client_secret_660781855519-carf8j12spidnaar1gpsoon8dr12qhtu.apps.googleusercontent.com.json`
