## ADDED Requirements

### Requirement: Rate limit por cédula en rutas de autenticación
El sistema SHALL usar la cédula del cuerpo de la solicitud como key de rate limiting para las rutas `/api/auth/*`.
La key SHALL tener el formato `cedula:{numero_cedula}`.
Si no hay cédula en el body, el sistema SHALL usar la IP como fallback.

#### Scenario: Múltiples estudiantes desde misma IP
- **WHEN** 22 estudiantes desde la misma IP hacen login simultáneamente
- **THEN** cada uno tiene su propio bucket de 10 intentos/minuto

#### Scenario: Sin cédula en body
- **WHEN** la solicitud no incluye cédula en el body
- **THEN** el sistema usa `ip:{direccion_ip}` como key

### Requirement: Aumentar límite global
El límite global SHALL subir de 1000 a 5000 solicitudes por ventana de 5 minutos.

#### Scenario: 100 usuarios navegando simultáneamente
- **WHEN** 100 estudiantes navegan el sitio desde la misma red
- **THEN** el global rate limiter permite al menos 50 solicitudes por usuario antes de bloquear

### Requirement: Diferentes rate limiters por propósito
El sistema SHALL mantener los siguientes rate limiters:
- `globalRateLimiter`: 5000/5min para todas las rutas
- `authRateLimiter`: 10/1min para /api/auth/*, key por cédula
- `criticalRateLimiter`: 5/1min para forgot/reset password, key por IP
- `mfaRateLimiter`: 10/1min para verificación MFA, key por usuario autenticado
- `usersRateLimiter`: 100/15min para CRUD de usuarios

#### Scenario: Auth limiter por cédula
- **WHEN** un mismo estudiante excede 10 intentos de verificar-cedula en 1 minuto
- **THEN** el sistema bloquea solo a ese estudiante (otros estudiantes desde la misma IP no se ven afectados)
