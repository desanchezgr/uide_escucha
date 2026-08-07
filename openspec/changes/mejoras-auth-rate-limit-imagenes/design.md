## Context

El rate limit actual usa IP como key para usuarios no autenticados, causando bloqueos cuando múltiples estudiantes desde la misma red (aula) intentan usar el sistema simultáneamente. El registro no verifica identidad (solo cédula). La subida de imágenes solo valida tamaño en frontend y el listado solo muestra nombre de archivo.

## Goals / Non-Goals

**Goals:**
- Rate limit por cédula en rutas auth para aislar a cada estudiante
- Límite global de 5000/5min para absorber 100+ usuarios concurrentes
- Verificación de identidad (email + cédula) antes de crear contraseña
- Validación de tamaño (5MB) y tipo (no GIF) en backend para imágenes
- Preview persistente de imagen en listado de tickets

**Non-Goals:**
- No se cambia el flujo de "olvidé contraseña" (sigue con token por email)
- No se agrega foto de perfil
- No se cambia el storage de imágenes (sigue en disco local)

## Decisions

### 1. Key de rate limit: cédula del body, no IP

Se modificará `keyGenerator` en `rateLimiter.ts` para aceptar un key prefix personalizado. Las rutas auth pasarán `cedula:{numero}` como key extraído del body. El `authRateLimiter` se creará con una función `keyGenerator` específica que lee `req.body.cedula`.

Alternativa considerada: hashear la cédula. Descartado porque el rate limit no expone datos sensibles y añade complejidad innecesaria.

### 2. Verificación de identidad: nuevo endpoint + paso en frontend

Se agrega `POST /api/auth/verificar-identidad` que recibe `{ cedula, email }` y consulta:
- `SELECT FROM autenticacion WHERE email_recuperacion = ${email} AND usuario_id = (SELECT usuario_id FROM usuarios WHERE cedula = ${cedula})`

Si no existe o no coincide → error genérico "Datos incorrectos".
Si coincide → `{ verificado: true }`.

El frontend agrega un paso en el flujo de registro (entre ingreso de cédula y creación de contraseña).

### 3. Validación de imágenes en backend

Se calcula el tamaño del base64 decodificado (`Buffer.from(base64, 'base64').length`) antes de escribir. Si excede 5MB, se rechaza con 400.
Se valida MIME del base64 (cabecera data:image/gif) además de la extensión.

### 4. Preview persistente en listado

El endpoint `GET /api/reportes` ya devuelve `imagenes: [{ ruta_archivo }]`. El frontend ya muestra `<img>` con esa URL. Solo falta que el listado use la primera imagen como thumbnail en vez del nombre de archivo.

## Risks / Trade-offs

- [Rate limit por cédula] Si un atacante conoce cédulas válidas, puede agotar el límite de estudiantes específicos. → El límite por cédula es de 10/min, suficientemente alto para uso normal pero bajo para abuso.
- [Verificación email] Si el usuario no configuró email de recuperación, no podrá usar este flujo. → El email de recuperación se pide durante el registro verificada (pass 1), así que siempre existirá.
- [Imagen en backend] Validar tamaño de base64 requiere decodificarlo primero. → Se puede calcular `base64.length * 0.75` sin decodificar (aproximación rápida).
