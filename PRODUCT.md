# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Comunidad Activa (Estudiantes y Docentes):** Usuarios principales que registran quejas, sugerencias, felicitaciones y peticiones desde sus dispositivos móviles o computadoras. Su situación es reportar incidentes, proponer mejoras o enviar agradecimientos, buscando una respuesta rápida, empática y transparente.
- **Gestores Administrativos (Administrativos y Responsables):** Encargados de revisar, canalizar, cambiar de estado, asignar y resolver los reportes de la comunidad, manteniendo una comunicación fluida mediante comentarios formales.
- **Supervisores de Plataforma (Administradores del Sistema):** Gestionan de forma global los reportes, roles de usuarios, y supervisan el rendimiento institucional y la correcta operación de la plataforma.

## Product Purpose
Proporcionar un canal oficial, directo, confidencial y estructurado de comunicación entre la comunidad universitaria de la UIDE y las áreas administrativas. El éxito de la plataforma se mide por la reducción de los tiempos de resolución de quejas e incidentes, la satisfacción general del usuario y el aumento de la confianza en los canales de atención institucional.

## Positioning
"UIDE Escucha" es el único medio digital centralizado y oficial para la comunidad universitaria de la UIDE que garantiza el seguimiento estructurado de cada petición, queja o felicitación, con respuestas trazables y categorizadas directamente por la institución, eliminando la burocracia física y los correos informales.

## Operating Context
- **Entorno académico y administrativo:** Estudiantes acceden en entornos informales del campus (aulas, pasillos, cafeterías) desde sus teléfonos móviles, o computadoras personales fuera del campus. Los administradores operan en oficinas institucionales utilizando computadoras de escritorio.
- **Rituales diarios:** Revisión diaria y oportuna de nuevos reportes por parte del personal administrativo, quienes actualizan estados (de pendiente a en proceso o resuelto) e interactúan con la comunidad mediante hilos de comentarios formales.

## Capabilities and Constraints
- **Capacidades Confirmadas:**
  - Registro e inicio de sesión con autenticación basada en JWT.
  - Creación de quejas, sugerencias, peticiones y felicitaciones.
  - Carga de imágenes de evidencia (base64, png, jpeg).
  - Listado y filtrado de reportes según rol de usuario.
  - Gestión de comentarios asociados a cada reporte para la resolución de dudas.
- **Restricciones Técnicas:**
  - Autenticación estricta por dominio: correo institucional obligatorio finalizado en `@uide.edu.ec`.
  - Cumplimiento de accesibilidad WCAG 2.1 AA (contraste y legibilidad).
  - Enfoque mobile-first responsivo para asegurar la usabilidad en teléfonos inteligentes.
  - Base de datos relacional PostgreSQL de producción (alojada en Neon).

## Brand Commitments
- **Nombre del Producto:** UIDE Escucha.
- **Identidad Visual:** Integración rigurosa de la paleta institucional de la UIDE.
- **Actitud y Voz:** Formal, elegante, estructurada, transparente, confiable e institucional.
- **Assets de Marca:** `branding.png` (branding principal), `logo-uide.png` (isologo secundario), `Fondo Pagina.jpg.jpeg` (textura visual/fondo de login).

## Evidence on Hand
- **Código Fuente:** `client/` (React 19 / Vite 8 / Material UI 9 / Poppins) y `server/` (Node.js 22 / Express 5 / TypeScript).
- **Esquema de Base de Datos:** `db/schema-postgres.sql` (PostgreSQL).
- **Evidencia API:** Registros de pruebas manuales y respuestas HTTP exitosas documentados en `screenshoots/api-evidence/`.
- **Configuración de Estilos:** `client/src/theme.js` (MUI Theme con fuentes Poppins, colores corporativos y bordes consistentes).

## Product Principles
- **Transparencia Institucional:** Cada reporte tiene un ciclo de vida transparente con estados de progreso claros e inalterables.
- **Accesibilidad sin Barreras:** Interfaz limpia, altamente contrastada y legible para cualquier miembro de la comunidad en cualquier dispositivo.
- **Formalidad y Elegancia:** Un diseño visual estructurado que refleja la excelencia académica y la seriedad institucional de la UIDE.
- **Privacidad y Seguridad:** Autenticación estricta y visualización de reportes restringida según el rol del usuario (estudiantes solo ven los suyos).

## Accessibility & Inclusion
- **Norma de Cumplimiento:** WCAG 2.1 Nivel AA. Se debe garantizar que el contraste de texto cumpla con un mínimo de 4.5:1 para texto normal y 3:1 para texto grande.
- **Navegabilidad:** El sitio debe ser completamente navegable mediante teclado y amigable con lectores de pantalla para usuarios con discapacidades visuales o motrices.
