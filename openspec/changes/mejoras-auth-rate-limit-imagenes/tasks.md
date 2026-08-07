## 1. Rate limiting por cédula

- [ ] 1.1 Modificar `makeRateLimiter` para aceptar `keyPrefix` opcional en rutas auth
- [ ] 1.2 Crear `authKeyGenerator` que extrae cédula de `req.body.cedula` con fallback a IP
- [ ] 1.3 Cambiar `authRateLimiter` para usar key por cédula
- [ ] 1.4 Subir límite global de 1000 a 5000 en `globalRateLimiter`

## 2. Verificación de identidad en backend

- [ ] 2.1 Crear función `verificarIdentidad(cedula, email)` en `auth.service.ts` que consulta BD
- [ ] 2.2 Agregar ruta `POST /api/auth/verificar-identidad` con validación y rate limit
- [ ] 2.3 Probar verificación: email + cédula coinciden, no coinciden, email no existe

## 3. Verificación de identidad en frontend

- [ ] 3.1 Agregar paso de verificación (email + cédula) en `LoginPage.jsx` antes del formulario de contraseña
- [ ] 3.2 Mostrar campos de correo de recuperación y cédula en una sola pantalla
- [ ] 3.3 Conectar paso verificado al formulario de creación de contraseña + MFA

## 4. Validación de imágenes en backend

- [ ] 4.1 Agregar validación de tamaño (máx 5MB) calculando tamaño del base64 en `ticket.controller.ts`
- [ ] 4.2 Agregar validación de tipo MIME (rechazar image/gif) además de extensión

## 5. Preview persistente en listado de tickets

- [ ] 5.1 Modificar listado de tickets en frontend para mostrar thumbnail (120x120) con `ruta_archivo`
- [ ] 5.2 Mostrar placeholder si el ticket no tiene imagen

## 6. Verificación

- [ ] 6.1 Probar rate limit con 3+ solicitudes simulando misma IP y diferentes cédulas
- [ ] 6.2 Probar registro completo con verificación de identidad
- [ ] 6.3 Probar subida de imagen >5MB y .gif desde backend
- [ ] 6.4 Probar que preview de imagen persiste después de recargar página
