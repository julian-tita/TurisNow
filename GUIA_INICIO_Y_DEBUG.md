# 🚀 Guía de Inicio de TurisNow con Ngrok

## 📋 Pasos para Iniciar la Aplicación

### 1️⃣ Iniciar el Backend (Spring Boot)

En el directorio raíz del proyecto:

```bash
# Opción 1: Con Maven Wrapper (recomendado)
./mvnw spring-boot:run

# Opción 2: Con Maven instalado
mvn spring-boot:run

# Opción 3: Si ya compilaste
java -jar target/TurisNow-0.0.1-SNAPSHOT.jar
```

**El backend se iniciará en:** `http://localhost:9090`

✅ **Verifica que funciona:**
- Abre: http://localhost:9090/swagger-ui.html
- Deberías ver la documentación de la API

---

### 2️⃣ Iniciar Ngrok (Para Webhooks de Mercado Pago)

Ngrok expone tu localhost a internet para que Mercado Pago pueda enviar webhooks.

```bash
# Iniciar ngrok apuntando al puerto del backend
ngrok http 9090
```

**Verás algo como:**
```
Forwarding   https://prohibitive-esta-aciniform.ngrok-free.app -> http://localhost:9090
```

📝 **IMPORTANTE:** Copia la URL HTTPS que te da ngrok (ejemplo: `https://tu-subdominio.ngrok-free.app`)

---

### 3️⃣ Configurar la URL del Webhook

Edita `src/main/resources/application.properties`:

```properties
# Actualiza esta línea con tu URL de ngrok + el endpoint del webhook
mercadopago.webhook.url=https://TU-SUBDOMINIO-NGROK.ngrok-free.app/api/webhooks/mercadopago
```

**Ejemplo:**
```properties
mercadopago.webhook.url=https://prohibitive-esta-aciniform.ngrok-free.app/api/webhooks/mercadopago
```

⚠️ **NOTA:** Cada vez que reinicies ngrok, la URL cambia (a menos que tengas plan pago). Debes:
1. Actualizar `application.properties`
2. Reiniciar el backend

---

### 4️⃣ Iniciar el Frontend (React + Vite)

En el directorio `frontend-vite/`:

```bash
# Instalar dependencias (solo la primera vez)
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

**El frontend se iniciará en:** `http://localhost:5173`

---

## 🔍 Verificar que Todo Funciona

### ✅ Checklist de Verificación:

1. **Backend funcionando:**
   - [ ] http://localhost:9090/swagger-ui.html responde
   - [ ] Los logs muestran: "Started TurisNowApplication"

2. **Ngrok funcionando:**
   - [ ] El comando `ngrok http 9090` está corriendo
   - [ ] Tienes la URL HTTPS
   - [ ] Puedes acceder a: `https://TU-URL-NGROK.ngrok-free.app/swagger-ui.html`

3. **Webhook configurado:**
   - [ ] La propiedad `mercadopago.webhook.url` está actualizada
   - [ ] Backend reiniciado después de cambiar la configuración

4. **Frontend funcionando:**
   - [ ] http://localhost:5173 carga
   - [ ] Puedes navegar por las experiencias

---

## 🐛 Debugging del Flujo de Pago y Reservas

### 📊 Logs Mejorados Implementados

He agregado logs detallados en todo el flujo. Ahora verás:

#### **Cuando se crea el pago:**
```
💳 Iniciando creación de preferencia de pago para usuario: {username}
📤 Enviando preferencia a Mercado Pago:
   Monto total: {monto} ARS
   Items: {cantidad}
   Usuario: {email} ({nombre})
   External Reference: {reference}
   Webhook URL: {webhook}
✅ Preferencia creada en MP: {preferenceId}
✅ Pago guardado en BD con ID: {pagoId}
```

#### **Cuando llega el webhook de Mercado Pago:**
```
📨 Webhook recibido - Topic: payment, ID: {paymentId}
🔍 Consultando payment {paymentId} en Mercado Pago
📊 Payment de MP recibido:
   ID: {id}
   Status: {status}
   External Reference: {reference}
✅ Pago encontrado en BD: {id}
✅ Pago actualizado en BD: {id} - Estado: {estado}
```

#### **Cuando se procesan las reservas:**
```
✅ Procesando pago aprobado: {pagoId}
🛒 Iniciando procesamiento de pago desde carrito - Pago ID: {id}, Usuario: {username}
📦 Se encontraron {cantidad} items en el carrito
🎫 Procesando item 1/{total} - Salida: {salidaId}, Cantidad: {cantidad}
📤 Llamando a reservaService.crearReserva()...
```

#### **Dentro del servicio de reservas:**
```
🎫 Iniciando creación de reserva - Usuario: {userId}, Salida: {salidaId}, Cantidad: {cantidad}
✓ Salida encontrada: {id} - Capacidad disponible: {capacidad}
✓ Usuario encontrado: {id} ({username})
✅ Reserva creada exitosamente: ID {id}
✅ Capacidad actualizada para salida {id}: {anterior} -> {nueva}
```

#### **Resumen final:**
```
📊 Resumen: Se crearon {exitosas} de {totales} reservas
✅ Procesamiento de pago aprobado completado. {cantidad} reservas creadas
```

---

## 🔎 Cómo Diagnosticar Problemas

### Problema: El pago se aprueba pero NO se crean reservas

**1. Verifica los logs del backend**

Busca estos indicadores en los logs:

```bash
# Ver logs en tiempo real (si usas Maven)
./mvnw spring-boot:run

# Buscar errores específicos
grep "❌" logs.txt
grep "procesando pago aprobado" logs.txt
grep "Reserva creada" logs.txt
```

**2. Revisa los logs paso a paso:**

- ✅ **¿Llega el webhook?** → Busca: `📨 Webhook recibido`
- ✅ **¿Se consulta el payment?** → Busca: `🔍 Consultando payment`
- ✅ **¿El pago se marca como APPROVED?** → Busca: `Estado: APPROVED`
- ✅ **¿Se intenta crear reservas?** → Busca: `✅ Procesando pago aprobado`
- ✅ **¿Se encuentran items?** → Busca: `📦 Se encontraron X items`
- ✅ **¿Se llama a crearReserva?** → Busca: `📤 Llamando a reservaService.crearReserva()`
- ❌ **¿Hay errores?** → Busca: `❌` en los logs

**3. Posibles causas del fallo:**

| Síntoma | Causa Probable | Solución |
|---------|----------------|----------|
| No se encuentra el pago en BD | External reference incorrecto | Verificar que el `external_reference` coincide |
| "Ya tienes una reserva activa" | Reserva duplicada | Verificar tabla `reservas` en BD |
| "Capacidad insuficiente" | Stock agotado | Verificar `capacidad_disponible` en tabla `salidas` |
| "Precio no coincide" | Precio cambiado | Verificar precios en tabla `experiencias` |
| Error de transacción | Rollback de BD | Revisar conexión a Supabase |

---

## 🛠️ Comandos Útiles de Debugging

### Consultar la Base de Datos (Supabase)

Puedes usar el SQL Editor en Supabase o conectarte con psql:

```sql
-- Ver pagos recientes
SELECT id, payment_id, estado, monto_total, fecha_creacion 
FROM pagos 
ORDER BY fecha_creacion DESC 
LIMIT 10;

-- Ver reservas recientes
SELECT r.id, r.cantidad_personas, r.estado, r.fecha_reserva, 
       e.titulo as experiencia, u.username
FROM reservas r
JOIN salidas s ON r.salida_id = s.id
JOIN experiencias e ON s.experiencia_id = e.id
JOIN usuarios u ON r.usuario_id = u.id
ORDER BY r.fecha_reserva DESC
LIMIT 10;

-- Ver reservas de un pago específico
SELECT * FROM reservas WHERE pago_id = {PAGO_ID};

-- Ver webhooks recibidos
SELECT id, tipo, recurso_id, estado, fecha_recepcion, mensaje_error
FROM webhook_logs
ORDER BY fecha_recepcion DESC
LIMIT 20;

-- Ver carrito de un usuario
SELECT ci.*, e.titulo, s.fecha_inicio
FROM carrito_items ci
JOIN carritos c ON ci.carrito_id = c.id
JOIN salidas s ON ci.salida_id = s.id
JOIN experiencias e ON s.experiencia_id = e.id
WHERE c.usuario_id = {USUARIO_ID};
```

---

## 📝 Endpoints Útiles para Testing

### Ver estado de un pago:
```bash
curl -H "Authorization: Bearer {TOKEN}" \
  http://localhost:9090/api/pagos/{PAGO_ID}/status
```

### Ver estadísticas de webhooks:
```bash
curl -H "Authorization: Bearer {TOKEN}" \
  http://localhost:9090/api/admin/webhooks/stats
```

### Reintentar webhooks con error:
```bash
curl -X POST -H "Authorization: Bearer {TOKEN}" \
  http://localhost:9090/api/admin/webhooks/retry
```

---

## 🔄 Flujo Completo del Pago

```
1. Usuario agrega items al carrito
   └─> POST /api/carrito/items

2. Usuario inicia checkout
   └─> POST /api/pagos/checkout
       └─> Se crea preferencia en Mercado Pago
       └─> Se guarda registro en tabla 'pagos' (estado: PENDIENTE)
       └─> Se retorna init_point (URL de pago)

3. Usuario paga en Mercado Pago
   └─> MP procesa el pago
   └─> MP envía webhook a tu URL de ngrok

4. Tu backend recibe el webhook
   └─> POST /api/webhooks/mercadopago
       └─> Se registra en 'webhook_logs'
       └─> Se consulta el payment en MP
       └─> Se actualiza el pago en BD (estado: APPROVED)
       └─> Se llama a procesarPagoAprobado()
           └─> Se obtienen items del carrito
           └─> Se crea una reserva por cada item
               └─> Se valida disponibilidad
               └─> Se crea registro en 'reservas'
               └─> Se actualiza capacidad de salida
           └─> Se vacía el carrito

5. Usuario ve sus reservas
   └─> GET /api/reservas/mis-reservas
```

---

## ⚡ Atajos de Inicio Rápido

### Script de inicio completo (Windows PowerShell):

```powershell
# Terminal 1 - Backend
cd E:\REPOS\TurisNow
./mvnw spring-boot:run

# Terminal 2 - Ngrok (después de que arranque el backend)
ngrok http 9090

# Terminal 3 - Frontend
cd E:\REPOS\TurisNow\frontend-vite
npm run dev
```

### Script de inicio completo (Linux/Mac):

```bash
# Terminal 1 - Backend
cd ~/repos/TurisNow
./mvnw spring-boot:run

# Terminal 2 - Ngrok
ngrok http 9090

# Terminal 3 - Frontend
cd ~/repos/TurisNow/frontend-vite
npm run dev
```

---

## 🎯 Testing del Flujo de Reservas

### Escenario de prueba completo:

1. **Preparación:**
   - Asegúrate de tener una experiencia con salidas disponibles en la BD
   - Ten un usuario registrado (o regístrate desde el frontend)

2. **Flujo de prueba:**
   ```
   1. Login en http://localhost:5173
   2. Navega a una experiencia
   3. Agrégala al carrito
   4. Ve al carrito
   5. Click en "Proceder al pago"
   6. Serás redirigido a Mercado Pago
   7. Usa tarjeta de prueba de MP:
      - Número: 5031 7557 3453 0604
      - CVV: 123
      - Fecha: cualquier fecha futura
   8. Completa el pago
   9. MP te redirige de vuelta
   10. Verifica tus reservas en "Mis Reservas"
   ```

3. **Monitorea los logs:**
   - Terminal del backend: logs en tiempo real
   - Busca todos los emojis: 💳 📨 🔍 ✅ ❌ 🎫 📦

---

## 🆘 Problemas Comunes

### ❌ "Webhook no llega"
- ✅ Verifica que ngrok está corriendo
- ✅ Verifica que la URL de ngrok está en `application.properties`
- ✅ Reiniciaste el backend después de cambiar la configuración
- ✅ La URL de ngrok es HTTPS (no HTTP)

### ❌ "Payment not found"
- ✅ El `external_reference` debe coincidir entre el pago y las salidas
- ✅ Verifica en BD: `SELECT * FROM pagos ORDER BY fecha_creacion DESC LIMIT 5;`

### ❌ "Reserva no se crea"
- ✅ Mira los logs detallados que agregamos
- ✅ Verifica que hay capacidad disponible en la salida
- ✅ Verifica que el usuario no tiene ya una reserva activa para esa salida

### ❌ "Carrito no se vacía"
- ✅ Esto indica que las reservas NO se crearon exitosamente
- ✅ Revisa los logs para ver por qué falló la creación de reservas

---

## 📞 Para más ayuda

Si sigues teniendo problemas:

1. **Copia los logs completos** desde que se crea el pago hasta el error
2. **Verifica las tablas en Supabase:**
   - `pagos` → ¿Existe el pago? ¿Qué estado tiene?
   - `reservas` → ¿Se creó la reserva?
   - `webhook_logs` → ¿Qué errores hay?
   - `salidas` → ¿Hay capacidad disponible?
3. **Comparte los logs** para un análisis más detallado

---

**✨ Con estos cambios, ahora tendrás logs súper detallados que te dirán exactamente dónde está fallando el proceso de creación de reservas.**

