## Why

El sistema se cayó durante una prueba con 22 estudiantes desde el mismo aula porque el rate limit agrupa a todos por IP compartida. Además, el registro permite crear contraseña sin verificar la identidad del usuario, y la subida de imágenes no valida tamaño en backend ni persiste la previsualización al recargar.

## What Changes

- Rate limiting: cambiar key de IP a cédula para rutas auth, subir límite global de 1000 a 5000
- Registro con verificación: nuevo endpoint que valida correo de recuperación + cédula antes de permitir crear contraseña y configurar MFA
- Subida de imágenes: agregar validación de tamaño en backend (5MB), excluir .gif también en backend por MIME, mostrar thumbnail en listado de tickets

## Capabilities

### New Capabilities
- `registro-verificado`: validación de identidad (correo + cédula) antes de crear contraseña y configurar MFA
- `subida-imagenes-segura`: validación de tamaño y tipo en backend, preview persistente en listado

### Modified Capabilities
- `rate-limiting`: cambiar estrategia de key (IP → cédula) para rutas de autenticación

## Impact

- `server/src/middleware/rateLimiter.ts` — keyGenerator usa cédula del body para rutas auth
- `server/src/routes/auth.routes.ts` — nueva ruta POST /verificar-identidad
- `server/src/services/auth.service.ts` — nueva función verificarIdentidad
- `server/src/controllers/ticket.controller.ts` — validación tamaño y tipo en backend
- `client/src/pages/LoginPage.jsx` — nuevo paso de verificación email + cédula
- `client/src/pages/NewReportPage.jsx` — validación existente se mantiene
- `client/src/pages/TicketListPage.jsx` — thumbnail de imagen en lugar de nombre
