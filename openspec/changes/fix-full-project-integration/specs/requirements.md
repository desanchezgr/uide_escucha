# Especificaciones — Integración Completa UIDE Escucha

## 1. Autenticación

### Login
- **Endpoint**: `POST /api/auth/login`
- **Request**: `{ email: string, password: string }`
- **Response**: `{ token: string, usuario: { id, nombre, rol } }`
- **Validación**: Email formato válido, password mínimo 6 caracteres
- **Errores**: 400 (campos faltantes), 401 (credenciales inválidas)

### Registro
- **Endpoint**: `POST /api/auth/register`
- **Request**: `{ nombres, apellidos, email, password }`
- **Response**: `{ token: string, usuario: { id, nombre, rol } }`
- **Validación**: 
  - Email debe terminar en `@uide.edu.ec`
  - Password mínimo 6 caracteres
  - Todos los campos son requeridos
- **Errores**: 400 (validación), 409 (email ya existe)

## 2. Reportes

### Listar reportes
- **Endpoint**: `GET /api/reportes`
- **Auth**: Requerido (JWT)
- **Response**: `[{ id, titulo, descripcion, tipo, estado, creado_en, autor_id, autor_nombre }]`
- **Comportamiento**: 
  - Estudiante ve solo los suyos
  - Admin ve todos

### Obtener reporte
- **Endpoint**: `GET /api/reportes/:id`
- **Auth**: Requerido (JWT)
- **Response**: Objeto reporte completo
- **Comportamiento**: Estudiante solo ve los suyos

### Crear reporte
- **Endpoint**: `POST /api/reportes`
- **Auth**: Requerido (JWT)
- **Request**: `{ titulo, descripcion, tipo }`
- **Validación Zod**:
  - `titulo`: string, 1-200 caracteres
  - `descripcion`: string, 1-2000 caracteres
  - `tipo`: enum `'queja' | 'sugerencia' | 'felicitacion' | 'peticion'`
- **Response**: Objeto reporte creado
- **Nota**: `sede_id` se asigna del usuario, `solicitado_por` del JWT

### Actualizar reporte
- **Endpoint**: `PATCH /api/reportes/:id`
- **Auth**: Requerido + Admin
- **Request**: `{ titulo?, descripcion?, tipo?, estado? }`
- **Validación**: No se puede modificar reporte resuelto
- **Response**: Objeto reporte actualizado

### Eliminar reporte
- **Endpoint**: `DELETE /api/reportes/:id`
- **Auth**: Requerido + Admin
- **Restricción**: Solo reportes pendientes
- **Response**: `{ message: "Reporte eliminado" }`

## 3. Frontend - Páginas

### LoginPage (`/ingreso`)
- Formulario con email + password
- Botón "Iniciar Sesión"
- Link a registro
- Botón "Recuperar contraseña" (deshabilitado, tooltip "En desarrollo")
- **Validación cliente**: Email formato, password mín 6 chars

### RegisterPage (`/registro`)
- Formulario: nombres, apellidos, email, password
- **Validación cliente**: 
  - Email debe ser `@uide.edu.ec`
  - Password mín 6 chars
  - Todos los campos requeridos

### Dashboard Estudiante (`/dashboard-estudiante`)
- Tabla con TUS reportes (titulo, tipo, estado, fecha)
- Botón "Nuevo Reporte"
- Click en reporte → detalle
- Logout limpia sessionStorage completamente

### Dashboard Admin (`/dashboard-admin`)
- Tabla con TODOS los reportes
- Columnas: titulo, estudiante, tipo, estado, fecha
- Acciones: Ver detalle, Editar estado, Eliminar
- Logout limpia sessionStorage completamente

### Nuevo Reporte (`/nuevo-reporte`)
- Formulario: titulo, tipo (select), descripcion
- **Validación**: titulo requerido, tipo requerido, descripción mín 10 chars
- Submit → `POST /api/reportes` con token
- Éxito → redirige al dashboard
- Error → muestra mensaje

### Detalle Reporte (nueva ruta `/reporte/:id`)
- Muestra titulo, descripcion, tipo, estado, fecha, autor
- Admin puede cambiar estado
- Admin puede eliminar (solo pendientes)

## 4. Seguridad

### Requerido
- JWT_SECRET: generar cadena aleatoria ≥32 caracteres
- CORS: habilitar para desarrollo (localhost:5173)
- Helmet: headers de seguridad básicos

### Deseado
- Rate limiting específico para login (5 intentos/15min)
- Validación de email @uide.edu.ec en backend
- Token en httpOnly cookie (futuro)

## 5. Base de Datos

### Schema Zod correcto
```typescript
crearTicketSchema = z.object({
  titulo: z.string().min(1).max(200),
  descripcion: z.string().min(1).max(2000),
  tipo: z.enum(['queja', 'sugerencia', 'felicitacion', 'peticion']),
})

actualizarTicketSchema = z.object({
  titulo: z.string().min(1).max(200).optional(),
  descripcion: z.string().min(1).max(2000).optional(),
  tipo: z.enum(['queja', 'sugerencia', 'felicitacion', 'peticion']).optional(),
  estado: z.enum(['pendiente', 'en_proceso', 'resuelto', 'rechazado']).optional(),
})
```

### Columnas válidas para update
Solo: `titulo`, `descripcion`, `tipo_reporte`, `estado`
