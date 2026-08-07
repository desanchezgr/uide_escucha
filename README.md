# UIDE Escucha

Plataforma web institucional para que la comunidad de la UIDE registre quejas, sugerencias, felicitaciones y peticiones, y sean gestionadas de forma eficiente por el equipo administrativo.

**Integrantes:**
- Santiago Rios
- Aurora Zhuma
- Maria Guanca
- Derky Sánchez

**Curso:** Middleware y Seguridad en Bases de Datos

---

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React 19, Vite 8, Material UI 9 |
| Backend | Node.js 22, Express 5, TypeScript |
| Base de datos | PostgreSQL 16 (Neon) |
| Auth | JWT (jsonwebtoken) + bcrypt |

---

## Funcionalidades

- **Registro e inicio de sesión** con autenticación JWT
- **Roles de usuario:** estudiante, docente, administrativo, admin, responsable
- **Gestión de reportes:** crear, listar, actualizar y eliminar quejas, sugerencias, felicitaciones y peticiones
- **Control de acceso:** los estudiantes solo ven sus propios reportes, los administradores gestionan todos
- **Dashboard** con resumen de reportes por estado

---

## Requisitos

- [Node.js](https://nodejs.org/) 22 LTS
- [PostgreSQL](https://www.postgresql.org/) 16 (o cuenta [Neon](https://neon.tech))
- [Git](https://git-scm.com/)

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd uide_escucha
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar el archivo `.env` con tus credenciales de base de datos:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
JWT_SECRET=tu_secreto_minimo_32_caracteres
JWT_EXPIRES_IN=1h
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

### 4. Crear la base de datos

```bash
psql -U tu_usuario -d tu_db < db/schema-postgres.sql
psql -U tu_usuario -d tu_db < db/seed-postgres.sql
```

### 5. Iniciar el proyecto

```bash
npm run dev
```

El frontend estará disponible en http://localhost:5173 y el backend en http://localhost:3000.

---

## Estructura del Proyecto

```
uide_escucha/
├── client/                  # Frontend
│   └── src/
│       ├── pages/           # Vistas: Login, Registro, Dashboards
│       ├── routes/          # Enrutamiento y rutas protegidas
│       ├── components/      # Componentes reutilizables (MUI)
│       └── context/         # Estado global
├── server/                  # Backend
│   └── src/
│       ├── config/          # Conexión a base de datos
│       ├── middleware/       # Autenticación, rate limiting, logs
│       ├── routes/          # Endpoints de la API
│       ├── controllers/     # Lógica de controladores
│       ├── services/        # Lógica de negocio
│       ├── repositories/    # Consultas a la base de datos
│       └── schemas/         # Validación con Zod
├── db/
│   ├── schema-postgres.sql  # Script de creación de tablas (PostgreSQL)
│   ├── seed-postgres.sql    # Datos de prueba (PostgreSQL)
│   └── modelo-eer.png       # Diagrama del modelo de datos
└── package.json             # Configuración del monorepo
```

---

## Modelo de Datos

El esquema completo está en `db/schema-postgres.sql` y el diagrama EER en `db/modelo-eer.png`.

| Tabla | Descripción |
|-------|-------------|
| `sedes` | Sedes de la universidad |
| `usuarios` | Datos personales de los usuarios |
| `autenticacion` | Credenciales de acceso (email y contraseña hasheada) |
| `reportes` | Quejas, sugerencias, felicitaciones y peticiones |
| `sesiones` | Control de sesiones activas |
| `archivos_reporte` | Archivos adjuntos a los reportes |
| `comentarios` | Comentarios de seguimiento en reportes |
| `asignaciones` | Asignación de reportes a responsables |
| `audit_log` | Registro de auditoría del sistema |

---

## API

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Iniciar sesión |
| `POST` | `/api/auth/register` | Crear una cuenta nueva |

### Reportes

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/reportes/` | Listar reportes |
| `GET` | `/api/reportes/:id` | Ver detalle de un reporte |
| `POST` | `/api/reportes/` | Crear un reporte |
| `PATCH` | `/api/reportes/:id` | Actualizar un reporte |
| `DELETE` | `/api/reportes/:id` | Eliminar un reporte |

### Salud del Servidor

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Verificar estado del servidor |

---

## Capturas de Pantalla

### Auth Service (`/api/auth`)

![Login](screenshoots/02-login-page.png)
![Registro](screenshoots/03-register-page.png)

---

### Reportes Service (`/api/reportes`)

![Dashboard Admin](screenshoots/04-admin-dashboard.png)
![Lista Admin](screenshoots/05-admin-reports-list.png)
![Dashboard Estudiante](screenshoots/07-student-dashboard.png)
![Detalle Admin](screenshoots/06-report-detail-admin.png)
![Nuevo Reporte 1](screenshoots/09-new-report-step1.png)
![Nuevo Reporte 2](screenshoots/10-new-report-step2-form.png)

---

### Health Service (`/health`)

![Health](screenshoots/14-api-health-200.png)

---

### Control de Errores

![401](screenshoots/15-api-401.png)
![404](screenshoots/16-api-404.png)

---

### Códigos HTTP

![200](screenshoots/200.png)
![401](screenshoots/401.png)
![404](screenshoots/404.png)
![422](screenshoots/422.png)

---

## Datos de Prueba

El script `db/seed-postgres.sql` carga 22 usuarios de prueba. Algunos ejemplos:

| Email | Contraseña | Rol |
|-------|-----------|-----|
| camendoza@uide.edu.ec | password123 | Admin |
| desanchez@uide.edu.ec | password123 | Admin |
| mssanchez@uide.edu.ec | password123 | Estudiante |
| mjcoronel@uide.edu.ec | password123 | Estudiante |

---

## Licencia

Proyecto académico — UIDE Escucha 2026
