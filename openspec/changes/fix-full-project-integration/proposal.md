# Propuesta: Integración Completa del Proyecto UIDE Escucha

## Resumen

Corregir todos los bugs críticos, conectar el frontend con el backend, y completar las funcionalidades pendientes para que el sistema funcione end-to-end.

## Problema Actual

El proyecto tiene una arquitectura correcta pero está **desconectado**:
- El frontend opera 100% con datos mock (no llama a la API)
- El frontend nunca envía el token JWT en peticiones protegidas
- El schema Zod es incompatible con la base de datos
- Existen bugs de validación de roles y campos

## Alcance

### Bugs Críticos a Corregir

| # | Bug | Archivo | Línea |
|---|-----|---------|-------|
| 1 | Frontend no envía token JWT | `ReportContext.jsx` | 1-38 |
| 2 | `"student"` vs `"estudiante"` | `NewReportPage.jsx` | 18 |
| 3 | Zod schema requiere `categoria_id` (no existe en BD) | `ticket.schema.ts` | 7-8 |
| 4 | Zod enum `reclamo` debería ser `peticion` | `ticket.schema.ts` | 6 |
| 5 | ReportContext usa datos mock | `ReportContext.jsx` | 5-22 |
| 6 | NewReportPage no envía POST a API | `NewReportPage.jsx` | 23-48 |
| 7 | Logout no limpia token | `StudentDashboardPage.jsx` | 73 |
| 8 | Register hardcodea `sede_id: 1` | `auth.routes.ts` | 88-89 |

### Funcionalidades Incompletas

| # | Funcionalidad | Estado |
|---|---------------|--------|
| 1 | Dashboard estudiantil con datos reales | Mock |
| 2 | Dashboard admin con datos reales | Mock |
| 3 | Crear reporte via API | No conectado |
| 4 | Ver detalle de reporte | No existe UI |
| 5 | Actualizar reporte | No existe UI |
| 6 | Eliminar reporte | No existe UI |

### Seguridad

| # | Problema | Severidad |
|---|----------|-----------|
| 1 | JWT_SECRET es placeholder | Alta |
| 2 | Sin CORS configurado | Alta |
| 3 | Sin Helmet headers | Media |
| 4 | Token en sessionStorage | Baja |

## No incluido

- Gestión de usuarios (CRUD admin)
- Subida de archivos
- Comentarios en reportes
- Asignación de reportes
- Audit log
- Recuperación de contraseña

## Criterios de Aceptación

1. Login → Dashboard muestra reportes reales de la BD
2. Crear reporte → Se guarda en la BD y aparece en el dashboard
3. Ver reporte → Muestra detalle completo
4. Admin puede actualizar/eliminar reportes
5. Todos los endpoints validan JWT correctamente
6. Schema Zod es compatible con la BD
