# Tareas — Integración Completa UIDE Escucha

## Fase 1: Backend - Corregir Schema y Seguridad

- [ ] **1.1** Corregir `server/src/schemas/ticket.schema.ts`
  - Eliminar `categoria_id`
  - Cambiar `'reclamo'` → `'peticion'` en enum
  - Asegurar que campos matcheen con BD

- [ ] **1.2** Corregir `server/src/routes/auth.routes.ts`
  - Agregar validación de email `@uide.edu.ec`
  - Fallback seguro para JWT_SECRET
  - Considerar sede_id en registro

- [ ] **1.3** Agregar CORS y Helmet en `server/src/index.ts`
  - `npm install cors helmet @types/cors`
  - Configurar CORS para localhost:5173
  - Agregar helmet()

- [ ] **1.4** Corregir `server/src/repositories/ticket.repository.ts`
  - Arreglar interpolación de columnas en UPDATE
  - Asegurar mapeo tipo → tipo_reporte

## Fase 2: Frontend - Reescribir Contexto de Datos

- [ ] **2.1** Reescribir `client/src/context/ReportContext.jsx`
  - Leer token de sessionStorage
  - Función fetchAuth() con header Authorization
  - Función getReportes() → GET /api/reportes
  - Función crearReporte(data) → POST /api/reportes
  - Función eliminarReporte(id) → DELETE /api/reportes/:id
  - Estado: { reportes, loading, error }

- [ ] **2.2** Actualizar `client/src/context/useReports.js`
  - Exportar nuevas funciones del context

## Fase 3: Frontend - Conectar Páginas

- [ ] **3.1** Corregir `client/src/pages/NewReportPage.jsx`
  - Cambiar `"student"` → `"estudiante"`
  - Conectar a crearReporte() del context
  - Validación: titulo requerido, tipo requerido, descripción mín 10 chars
  - Redirigir al dashboard al éxito

- [ ] **3.2** Actualizar `client/src/pages/StudentDashboardPage.jsx`
  - Llamar getReportes() al montar (useEffect)
  - Mostrar loading/spinner
  - Mostrar error si existe
  - Renderizar datos reales de la API
  - Cleanup completo en logout (token, userRole, userName)

- [ ] **3.3** Actualizar `client/src/pages/AdminDashboardPage.jsx`
  - Llamar getReportes() al montar
  - Agregar columna de acciones (Ver, Editar, Eliminar)
  - Eliminar llama a eliminarReporte()
  - Cleanup completo en logout

- [ ] **3.4** Crear `client/src/pages/ReportDetailPage.jsx`
  - Fetch GET /api/reportes/:id al montar
  - Mostrar: titulo, descripcion, tipo, estado, fecha, autor
  - Admin: Select para cambiar estado → PATCH /api/reportes/:id
  - Admin: Botón eliminar (solo si pendiente) → DELETE
  - Botón volver al dashboard

## Fase 4: Frontend - Rutas y Navegación

- [ ] **4.1** Actualizar `client/src/routes/AppRoutes.jsx`
  - Agregar ruta `/reporte/:id` → ReportDetailPage
  - Proteger con ProtectedRoute

- [ ] **4.2** Actualizar navegación en dashboards
  - Click en fila de reporte → navegar a `/reporte/:id`

## Fase 5: Seguridad y Variables de Entorno

- [ ] **5.1** Generar JWT_SECRET seguro
  - Usar `openssl rand -hex 32`
  - Actualizar `.env`

- [ ] **5.2** Verificar `.gitignore`
  - Asegurar que `.env` esté ignorado
  - Verificar que no haya credenciales en historial

## Fase 6: Pruebas y Verificación

- [ ] **6.1** Probar login end-to-end
  - Login → redirige a dashboard
  - Token se guarda en sessionStorage

- [ ] **6.2** Probar listar reportes
  - Dashboard muestra reportes reales de la BD
  - Estudiante solo ve los suyos
  - Admin ve todos

- [ ] **6.3** Probar crear reporte
  - Formulario envía POST con token
  - Reporte aparece en el dashboard
  - Validación de campos funciona

- [ ] **6.4** Probar detalle de reporte
  - Navegar a /reporte/:id muestra datos reales
  - Admin puede cambiar estado
  - Admin puede eliminar pendientes

- [ ] **6.5** Probar logout
  - Limpia sessionStorage completamente
  - Redirige a /ingreso
  - Token ya no funciona
