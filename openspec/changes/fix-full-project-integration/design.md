# Diseño Técnico — Integración Completa UIDE Escucha

## Arquitectura de Datos

```
Frontend (React)
  │
  ├─ ReportContext.jsx ─── fetch() ───► Express API
  │                                        │
  │                                   ┌────┴────┐
  │                                   │ Auth MW  │
  │                                   └────┬────┘
  │                                        │
  │                                   Controller
  │                                        │
  │                                   Service
  │                                        │
  │                                   Repository ───► Neon PostgreSQL
  │
  └─ sessionStorage: { token, userRole, userName }
```

## Cambios en Backend

### 1. `server/src/schemas/ticket.schema.ts`
- Eliminar `categoria_id` del schema de creación
- Cambiar enum `'reclamo'` → `'peticion'`
- Renombrar campo `tipo` a `tipo_reporte` (o mantener `tipo` y mapear en repository)
- Eliminar `usuario_id` del schema (viene del JWT)

### 2. `server/src/routes/auth.routes.ts`
- Agregar validación de email con regex `@uide\.edu\.ec$`
- No hardcodear `sede_id: 1` — usar `sede_id` del request o asignar por defecto con opción de elegir
- Agregar fallback seguro para JWT_SECRET

### 3. `server/src/index.ts`
- Agregar `cors` con configuración para desarrollo
- Agregar `helmet` para headers de seguridad

### 4. `server/src/repositories/ticket.repository.ts`
- Corregir interpolación de `sql()` en UPDATE para usar parámetros seguros
- Mapear `tipo` → `tipo_reporte` en queries

## Cambios en Frontend

### 1. `client/src/context/ReportContext.jsx` (REESCRIBIR)
```jsx
// Nuevo flujo:
// 1. Proveer función fetchAuth() que agrega header Authorization
// 2. Proveer función getReportes() que llama GET /api/reportes
// 3. Proveer función crearReporte() que llama POST /api/reportes
// 4. Proveer función eliminarReporte() que llama DELETE /api/reportes/:id
// 5. Estado: { reportes: [], loading: boolean, error: string | null }
```

### 2. `client/src/pages/NewReportPage.jsx`
- Corregir `"student"` → `"estudiante"`
- Conectar formulario a `crearReporte()` del context
- Agregar validación de longitud mínima

### 3. `client/src/pages/StudentDashboardPage.jsx`
- Llamar `getReportes()` al montar
- Mostrar loading spinner
- Mostrar errores si los hay
- Cleanup de sessionStorage en logout

### 4. `client/src/pages/AdminDashboardPage.jsx`
- Llamar `getReportes()` al montar
- Agregar acciones: Ver, Editar estado, Eliminar
- Cleanup de sessionStorage en logout

### 5. Nueva página: `client/src/pages/ReportDetailPage.jsx`
- Mostrar detalle completo del reporte
- Admin: botón para cambiar estado
- Admin: botón para eliminar (solo pendientes)

### 6. `client/src/routes/AppRoutes.jsx`
- Agregar ruta `/reporte/:id` → ReportDetailPage

## Mapeo de Campos

| Frontend (tipo) | Backend (tipo) | BD (tipo_reporte) |
|-----------------|----------------|-------------------|
| `queja` | `queja` | `queja` |
| `sugerencia` | `sugerencia` | `sugerencia` |
| `felicitacion` | `felicitacion` | `felicitacion` |
| `peticion` | `peticion` | `peticion` |

## Flujo de Datos - Crear Reporte

```
1. Usuario llena formulario en NewReportPage
2. Frontend envía POST /api/reportes
   Headers: { Authorization: "Bearer {token}", Content-Type: "application/json" }
   Body: { titulo, descripcion, tipo }
3. Backend valida JWT → extrae usuario_id
4. Backend valida con Zod
5. Repository INSERT: titulo, descripcion, tipo_reporte, sede_id, solicitado_por
6. Retorna reporte creado
7. Frontend redirige al dashboard
```

## Flujo de Datos - Listar Reportes

```
1. Dashboard monta → llama getReportes()
2. Frontend envía GET /api/reportes
   Headers: { Authorization: "Bearer {token}" }
3. Backend valida JWT → extrae rol + usuario_id
4. Si estudiante: WHERE solicitado_por = usuario_id
5. Si admin: sin filtro
6. Retorna array de reportes
7. Frontend renderiza tabla
```
