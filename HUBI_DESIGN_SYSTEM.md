# HUBI — DESIGN SYSTEM UNIFICADO
## UIDE Escucha

> Documento maestro de diseño para Landing, Login, Dashboard Estudiante, Dashboard Admin, Reportes Admin, Detalle de Reportes, Perfil y Generación de Reportes.

---

# 1. IDENTIDAD VISUAL GLOBAL

## Personalidad

Hubi debe sentirse:

- Humano
- Seguro
- Universitario
- Moderno
- Cercano
- Premium
- Claro
- Con identidad propia

Evitar:

- Apariencia de ERP universitario
- Dashboards SaaS genéricos
- Exceso de gradientes
- Neón
- Exceso de tarjetas
- Interfaces excesivamente corporativas
- Colores aleatorios sin significado

## Paleta base

```css
--burgundy-900: #2F0018;
--burgundy-800: #430022;
--burgundy-700: #56002D;
--burgundy-600: #680036;

--gold-500: #FCC019;
--gold-100: #FFF4CC;

--ink: #18151A;
--text: #353136;
--muted: #77737A;
--muted-light: #969198;

--surface: #FFFFFF;
--background: #F8F9FB;
--warm-background: #FAF9F7;
--soft: #F7F7F9;
--border: #ECECEF;
```

## Tipografía

Usar una sans serif moderna y limpia.

Jerarquía:

- H1: 36–56px / 700–800 / tracking negativo
- H2: 26–34px / 700
- H3: 18–22px / 600–700
- Body: 14–16px / 400–500
- Metadata: 11–13px / 400–600
- Labels: 10–12px / 600

## Geometría

- Cards principales: 18–26px
- Inputs: 12–14px
- Botones: 12–14px
- Pills: 999px
- Superficies grandes: 24–32px

## Roles

### Estudiante

Visual:

- Más abierto
- Más cálido
- Oro como acento de interacción
- Burgundy como identidad
- Geometría suave
- Lenguaje personal

### Admin

Visual:

- Más estructurado
- Burgundy como acción principal
- Mayor densidad
- Geometría más precisa
- Lenguaje operativo

---

# 2. LANDING PAGE

## Dirección

La Landing es la parte más expresiva de Hubi.

Debe transmitir:

> Tu voz cuenta. Hubi conecta tu experiencia con la universidad.

## Hero

Composición central con mucho espacio.

```text
NAVIGATION

          objetos flotantes

       Tu voz también
        construye UIDE

     Comparte. Participa.
          Sé escuchado.

        [ Conocer Hubi ]

     fragmentos de producto
```

Usar:

- Micro textura
- Objetos UI flotantes
- Tarjetas físicas
- Líneas orgánicas
- Burgundy + oro
- Mucho blanco

Evitar un hero tradicional con imagen stock.

## Integraciones / funciones

Inspirarse en mosaicos de aplicaciones:

- Reportes
- Seguimiento
- Participación
- Privacidad
- Comunidad
- Escucha

Cards pequeñas con iconografía consistente.

## Prueba social

Usar testimonios o mensajes cortos de comunidad si existen.

No inventar testimonios reales.

## Footer

Footer editorial amplio.

Puede reutilizar objetos visuales de Hubi flotando de manera sutil.

---

# 3. LOGIN

## Concepto

El Login es:

> La puerta de entrada a Hubi.

No usar Split Auth 50/50.

Usar una escena completa con formulario central.

```text
HUBI                                         UIDE · Ayuda

     objeto            ┌─────────────────┐
                       │ Bienvenido      │
   líneas              │                 │
                       │ correo          │      ilustración
   bloque              │ contraseña      │
                       │                 │
                       │ [ Ingresar ]    │
                       └─────────────────┘

                     © UIDE Escucha
```

## Fondo

```css
background: #FAF9F7;
```

Con micro textura muy sutil.

## Card

```css
width: 390px-430px;
padding: 42px 36px;
background: #FFFFFF;
border-radius: 26px-32px;
box-shadow: 0 24px 65px rgba(47,0,24,.08);
```

## Formulario

Campos:

- Correo institucional
- Contraseña

Inputs:

```css
height: 52px;
background: #F7F7F9;
border-radius: 13px;
```

Focus:

```css
border: 1px solid rgba(104,0,54,.30);
box-shadow: 0 0 0 4px rgba(104,0,54,.055);
```

CTA:

```css
background: #680036;
color: #FFFFFF;
```

## Escena

Objetos posibles:

- Escucha
- Privacidad
- Reporte
- Comunidad
- Líneas de conversación
- Bloques oro/burgundy

El formulario siempre debe tener la mayor jerarquía.

---

# 4. DASHBOARD ESTUDIANTE

## Objetivo

Responder rápidamente:

- ¿Qué está pasando con mis reportes?
- ¿Qué puedo hacer?
- ¿Cuál es mi actividad reciente?

## Dirección

Inspiración de dashboard visual y ligero.

No usar sidebar permanente.

Usar navbar horizontal.

## Estructura

```text
NAVBAR

Hola, Aurora

[ Mis reportes ] [ En seguimiento ] [ Resueltos ]

Actividad / evolución

Reportes recientes

CTA Nuevo reporte
```

## KPI cards

Cards suaves y amplias.

Usar gradientes atmosféricos muy sutiles.

No usar colores saturados.

## CTA

Acciones principales del estudiante:

```css
background: #FCC019;
color: #251A00;
```

## Gráficas

Si existen datos personales útiles:

- evolución
- actividad
- estados

No agregar analítica sin utilidad real.

---

# 5. DASHBOARD ADMIN

## Objetivo

Responder:

- ¿Qué está ocurriendo?
- ¿Qué requiere atención?
- ¿Qué cambió?
- ¿Dónde debo actuar?

## Dirección

Más estructurado que Student.

Usar Command Bar superior.

No copiar sidebar SaaS genérico.

## Estructura

```text
COMMAND BAR

Resumen

[ Nuevos ] [ En revisión ] [ Prioritarios ]

Tendencias / actividad

Áreas / categorías

Requiere atención
```

## Acción principal

Admin:

```css
background: #680036;
color: #FFFFFF;
```

---

# 6. REPORTES ADMIN — LISTADO

## Propósito

Dashboard = entender.

Reportes = encontrar y gestionar casos.

## Header

```text
Reportes del sistema
Gestiona, filtra y da seguimiento a los reportes recibidos.
```

## Tabs de estado

- Todos
- Nuevos
- En revisión
- En seguimiento
- Resueltos

No convertirlos en KPI cards.

## Toolbar

```text
[ Buscar... ] [ Estado ] [ Tipo ] [ Facultad ] [ Más filtros ] [ Grid/List ]
```

## Grid

3–4 columnas desktop.

Cada card muestra:

- ID
- Asunto
- Área
- Fecha
- Prioridad
- Estado
- Responsable
- Acción

## Card

```css
background: #FFFFFF;
border-radius: 18px-22px;
padding: 20px;
```

Hover:

```css
transform: translateY(-3px);
box-shadow: 0 16px 34px rgba(104,0,54,.08);
```

## Marcador superior

Cada card puede tener un icono de categoría sobresaliendo del borde superior.

No usar arcoíris.

## Prioridad

Alta:
burgundy suave.

Media:
oro suave.

Baja:
neutral.

## Estado

Usar dot + texto:

- Recibido
- En revisión
- En seguimiento
- Resuelto
- Cerrado

No usar porcentajes de progreso.

## List View

Columnas:

```text
ID | Reporte | Tipo | Facultad | Fecha | Prioridad | Estado | Responsable | Acción
```

---

# 7. REPORT DETAIL — ARQUITECTURA COMPARTIDA

## Concepto

```text
INFORMACIÓN DEL REPORTE | SEGUIMIENTO / GESTIÓN
```

Desktop:

- izquierda 55%
- derecha 45%

El panel derecho puede ser sticky.

No limitar a 720px.

## Estudiante

Pregunta principal:

> ¿Qué pasó con lo que reporté?

Prioridades:

1. Estado
2. Última actualización
3. Reporte original
4. Evidencias
5. Conversación
6. Historial

## Admin

Pregunta principal:

> ¿Qué debo hacer con este reporte?

Prioridades:

1. Prioridad
2. Estado
3. Contexto
4. Responsable
5. Conversación
6. Actividad
7. Acciones

---

# 8. REPORT DETAIL — ESTUDIANTE

## Header

```text
← Volver a mis reportes

Tu reporte de infraestructura
Así está lo que compartiste.

[ ● En seguimiento ]
```

El asunto tiene mayor jerarquía que el ID.

## Status summary

```text
● En seguimiento

Tu reporte está siendo revisado
por el área correspondiente.

Última actualización · Hoy, 10:42
```

## Contenido

Secciones:

- Tipo
- Fecha
- Área
- Ubicación
- Descripción
- Emoción, si existe
- Evidencias

## Conversación

Panel derecho:

```text
Seguimiento

[ Conversación ] [ Historial ]
```

Tipos:

### Mensaje estudiante

Alineado derecha.

Fondo oro suave.

### Respuesta administración

Alineado izquierda.

Fondo burgundy muy suave.

### Evento sistema

Centrado, estilo timeline.

Ejemplo:

```text
● Estado actualizado
Pendiente → En proceso
21 mayo · 09:15
```

## Composer

```text
[ adjuntar ] Escribe un mensaje... [ ↑ ]
```

Send estudiante:

```css
background: #FCC019;
```

---

# 9. ESTADO DEL REPORTE — ESTUDIANTE

Esta sección complementa el Report Detail existente.

No reemplaza el status summary.

## Estados

- Pendiente
- En proceso
- Resuelto
- Rechazado

## Regla semántica

NO:

```text
Pendiente → En proceso → Resuelto → Rechazado
```

SÍ:

```text
                    ┌→ Resuelto
Pendiente → Proceso ┤
                    └→ Rechazado
```

Resuelto y Rechazado son resultados finales alternativos.

## Desktop

```text
Estado del reporte

PROCESO                              RESULTADO

[ Pendiente ] → [ EN PROCESO ] → [ Resuelto ]
                                   [ Rechazado ]
```

## Active state

Solo el estado actual recibe énfasis fuerte.

Ejemplo En proceso:

```css
background: #FFF9E6;
border: 1px solid #FCC019;
```

Mostrar:

```text
ACTUAL
```

## Estados

### Pendiente

Icon:
`schedule`

Copy:

> Tu reporte está esperando revisión.

### En proceso

Icon:
`settings`

Copy:

> El área responsable está revisando tu reporte.

### Resuelto

Icon:
`check_circle`

Copy:

> Tu reporte ha sido atendido.

### Rechazado

Icon:
`cancel`

Copy:

> El reporte no cumple con los criterios para continuar.

## Mobile

Timeline vertical:

```text
✓ Pendiente
│
● En proceso
│
├ ○ Resuelto
└ ○ Rechazado
```

---

# 10. REPORT DETAIL — ADMIN

## Header

```text
← Volver a reportes

Reporte #0421
Infraestructura · Ingeniería

[ Alta ] ● En revisión
```

## Management summary

```text
ESTADO           PRIORIDAD
En revisión      Alta

RESPONSABLE      ÁREA
María Ruiz       Infraestructura

RECIBIDO         ACTUALIZADO
18 Jul           Hoy 10:42
```

## Panel derecho

```text
Gestión del reporte

[ Conversación ] [ Actividad ]
```

## Activity

Timeline:

```text
10:42 María Ruiz respondió.
10:35 Estado actualizado.
09:58 Asignado a Infraestructura.
09:24 Reporte recibido.
```

## Acciones

- Asignar
- Actualizar estado
- Solicitar información
- Resolver

Acción principal:
burgundy.

---

# 11. REPORTES COMPLETADOS

## Student

Header:

```text
Tu reporte fue resuelto
Gracias por compartir lo que estaba ocurriendo.
```

Resolution:

```text
Así se resolvió

El área correspondiente realizó...
22 Jul · 14:30
```

La resolución tiene mayor jerarquía que la conversación antigua.

## Admin

Mantener información operacional:

- Estado
- Responsable
- Área
- Tiempo de resolución

Restringir acciones según lógica existente.

---

# 12. PERFIL

## Concepto

Perfil = identidad + cuenta + seguridad.

No es un dashboard.

## Hero

Banner horizontal con avatar superpuesto.

### Student

Hero claro:

- burgundy muy suave
- oro atmosférico
- líneas orgánicas

Avatar ring:
oro.

### Admin

Hero:

```css
background: linear-gradient(120deg,#2F0018,#680036);
```

Geometría más técnica.

## Información

Student:

- Nombre
- Correo institucional
- Carrera
- Facultad
- Campus
- Rol
- Estado

Admin:

- Nombre
- Correo
- Rol
- Área
- Campus
- Estado
- Nivel de acceso, si existe

No inventar información que el sistema no maneje.

## MFA

Usar banner horizontal:

```text
[ shield ]

Autenticación en dos pasos

Añade una capa adicional de seguridad.

[ Administrar ]
```

Student:
oro suave.

Admin:
burgundy suave.

## Acceso

Opcional según implementación:

- Contraseña
- Último acceso
- Sesiones activas

---

# 13. CREACIÓN DE REPORTE

## Concepto

Crear un reporte debe sentirse como una conversación guiada.

No:

> Completa este formulario.

Sí:

```text
¿Qué quieres compartir?
↓
¿Con qué área se relaciona?
↓
Cuéntanos qué ocurrió.
↓
Revisa.
↓
Envía.
```

## Flujo maestro

```text
1. Tipo de reporte
2. Área y descripción
3. Previsualización
4. Confirmación
```

Mantener 3 pasos visuales principales.

---

# 14. CREATE REPORT — STEPPER

Desktop:

```text
[ ✓ ]────────[ 2 ]────────[ 3 ]

Tipo         Área y        Previsualización
de reporte   descripción
```

Completed:
burgundy + check.

Current:
burgundy.

Future:
neutral.

Mobile:

```text
Paso 2 de 3
Área y descripción

●────────●────────○
```

---

# 15. PASO 1 — TIPO DE REPORTE

Heading:

```text
Nuevo reporte
¿Qué tipo de reporte deseas crear?
```

Opciones:

- Queja
- Sugerencia
- Petición
- Felicitación

Usar categorías reales si difieren.

## Card

Horizontal:

```text
▌ [icon] Queja
          Reporta un problema o situación
          que necesita atención.             →
```

Card completa clickable.

## Iconos

- Queja: `report_problem`
- Sugerencia: `lightbulb`
- Petición: `handshake`
- Felicitación: `celebration`

## Selección

Preferir:

seleccionar → Continuar

en vez de navegar instantáneamente.

## Trust banner

```text
Tu reporte es importante.
Todos los reportes son tratados con confidencialidad y respeto.
```

---

# 16. PASO 2 — ÁREA Y DESCRIPCIÓN

## Área

Pregunta:

```text
¿A qué área va dirigido?
Selecciona el área que mejor se relacione con tu reporte.
```

Grid desktop:
4 columnas.

Posibles áreas:

- Soporte Técnico / TI
- Biblioteca
- Limpieza y Conserjería
- Mantenimiento e Infraestructura
- Secretaría General
- Bienestar Universitario
- Colecturía / Financiero

Usar solo áreas reales.

## Area Card

Vertical:

```text
[ visual ]

Limpieza y Conserjería

Higiene, limpieza de espacios
y logística.

[ seleccionar ]
```

Selected:

```css
border: 1.5px solid #680036;
background: rgba(104,0,54,.018);
```

## Context chips

Después de seleccionar:

```text
[ Queja ] [ Limpieza y Conserjería ]
```

---

# 17. EMOCIÓN

Pregunta:

```text
¿Cómo te sientes con esta situación?
Tu sentir nos ayuda a entender mejor lo ocurrido.
```

Posibles:

- Molesto
- Disgustado
- Enojado
- Frustrado

La selección usa burgundy.

No inferir prioridad a partir de emoción.

## Adaptación por categoría

Queja:
mostrar emoción.

Sugerencia:
opcional.

Petición:
opcional.

Felicitación:
no mostrar emociones negativas.

El formulario debe adaptarse al tipo de reporte.

---

# 18. DESCRIPCIÓN

```text
Descríbelo con tus palabras
Cuéntanos qué pasó, dónde y cuándo.
```

Textarea:

```css
min-height: 160px;
border-radius: 15px;
border: 1px solid #E6E3E8;
```

Placeholder:

```text
Empieza a escribir aquí...
```

Counter si existe límite:

```text
0 / 500
```

---

# 19. EVIDENCIA

```text
Evidencia fotográfica · Opcional
Agrega imágenes que nos ayuden a entender mejor tu reporte.
```

Dropzone:

```text
[ upload ]

Arrastra y suelta tus imágenes aquí
o haz clic para seleccionar
```

Después:

```text
[ img ] [ img ] [ + ]
```

Mostrar errores por archivo, no como error global.

---

# 20. PRIVACIDAD

Si existe anonimato:

```text
Privacidad del reporte

○ Compartir mi identidad
○ Enviar de forma anónima
```

Explicar claramente qué significa cada opción.

No ocultar anonimato en un checkbox pequeño.

Trust:

```text
Tu información está protegida.
Tratamos los reportes con confidencialidad y respeto.
```

---

# 21. PASO 3 — PREVISUALIZACIÓN

Heading:

```text
Previsualización de tu reporte
Revisa la información antes de enviarla.
```

Desktop:
2 columnas.

```text
ASÍ SE VERÁ             RESUMEN

Queja                    Tipo
Área                     Área
Emoción                  Emoción
Descripción              Evidencia
Evidencia                Privacidad
```

## Main preview

Debe parecerse al Report Detail que verá posteriormente.

## Resumen

Label/value sin bordes de tabla.

## Acciones

```text
[ Editar reporte ] [ Enviar reporte ]
```

Editar:
neutral con borde burgundy.

Enviar:

```css
background: #680036;
color: #FFFFFF;
```

No perder datos al regresar.

---

# 22. CONFIRMACIÓN DE ENVÍO

Después de enviar:

```text
✓

Tu reporte fue enviado

Gracias por compartir lo que está ocurriendo.
Puedes seguir su estado desde Mis reportes.

Reporte #0421

[ Ver mi reporte ]
[ Volver al inicio ]
```

No usar confetti excesivo.

La confirmación debe sentirse tranquila y segura.

`Ver mi reporte` conecta directamente con Report Detail.

---

# 23. RELACIÓN ENTRE PANTALLAS

## Student Journey

```text
LANDING
↓
LOGIN
↓
STUDENT DASHBOARD
↓
NUEVO REPORTE
↓
TIPO
↓
ÁREA + DESCRIPCIÓN
↓
PREVISUALIZACIÓN
↓
CONFIRMACIÓN
↓
REPORT DETAIL
↓
SEGUIMIENTO
↓
RESOLUCIÓN
```

## Admin Journey

```text
LOGIN
↓
ADMIN DASHBOARD
↓
REQUIERE ATENCIÓN
↓
REPORTES
↓
REPORT DETAIL
↓
GESTIONAR
↓
RESPONDER
↓
RESOLVER
```

---

# 24. MOTION SYSTEM

## General

Motion debe:

- explicar
- orientar
- confirmar

No decorar constantemente.

## Duraciones

Microinteraction:
180–240ms

Cards:
220–300ms

Page sections:
350–550ms

Large initial compositions:
600–900ms

## Hover cards

```css
transform: translateY(-2px);
```

Admin Report cards pueden llegar a -3px.

## No usar

- bounce
- parallax excesivo
- elementos flotando constantemente
- animaciones largas
- shaking agresivo

---

# 25. LOADING

Usar skeletons estructurales.

No depender de spinner central.

Ejemplos:

- Report cards skeleton
- Detail skeleton
- Message skeleton
- Profile information skeleton

---

# 26. EMPTY STATES

Siempre explicar:

1. Qué ocurrió
2. Qué puede hacer el usuario

Ejemplo:

```text
No encontramos reportes.

Prueba cambiando los filtros
o realiza una nueva búsqueda.

[ Limpiar filtros ]
```

---

# 27. ACCESSIBILITY

Todos los controles deben soportar:

- teclado
- focus visible
- labels
- estados selected
- errores asociados
- contraste suficiente

Nunca depender solo del color.

Status:

icon + label + tratamiento visual.

---

# 28. RESPONSIVE

## Desktop

Usar amplitud.

No comprimir innecesariamente contenido en cards pequeñas.

## Tablet

Reducir decoración antes de reducir legibilidad.

## Mobile

Priorizar flujo vertical.

Evitar trasladar layouts desktop literalmente.

### Report Detail Mobile

```text
Header
Status
Report
Evidence
Status lifecycle
[ Abrir seguimiento ]
```

Conversación puede abrirse fullscreen.

### Create Report Mobile

Una columna.

Stepper compacto.

Acciones importantes sticky cuando sea útil.

---

# 29. ICONOGRAFÍA

Preferir Material Symbols.

Ejemplos:

```text
report_problem
lightbulb
handshake
celebration
schedule
settings
check_circle
cancel
shield
verified_user
security
cloud_upload
add_photo_alternate
computer
menu_book
cleaning_services
build
favorite
payments
send
arrow_upward
arrow_forward_ios
more_vert
search
filter_alt
```

No mezclar múltiples familias de iconos.

---

# 30. REGLAS DE COLOR

## Burgundy

Usar para:

- identidad Hubi
- admin actions
- login
- selección
- estados institucionales
- navegación activa

## Gold

Usar para:

- acciones Student
- atención
- nuevos elementos
- highlights cálidos
- microdetalles premium

No usar oro para todo.

## Semantic Green

Solo:

- resuelto
- éxito
- activo cuando semánticamente corresponde

## Semantic Red

Solo:

- rechazo
- error
- acciones críticas

Usarlo suavemente.

---

# 31. REGLAS DE SUPERFICIES

No convertir toda la aplicación en:

card dentro de card dentro de card.

Preferir:

- whitespace
- divisores sutiles
- agrupación tipográfica
- fondos suaves

Las cards deben aparecer cuando realmente existe un objeto o módulo.

---

# 32. REGLAS DE COPY

Hubi habla de forma:

- clara
- humana
- respetuosa
- breve

Evitar:

- jerga técnica
- lenguaje burocrático
- lenguaje excesivamente alegre ante situaciones delicadas

Bueno:

> Cuéntanos qué ocurrió.

Evitar:

> ¡Genial! Cuéntanos todo 😄

---

# 33. PRIVACIDAD

Nunca prometer más de lo que el sistema realmente garantiza.

Si un reporte es anónimo:

Admin debe ver:

```text
Estudiante anónimo
```

No:

- nombre
- avatar
- email

Student puede ver:

```text
Tú
```

---

# 34. PRINCIPIOS FINALES

## Landing

Expresa Hubi.

## Login

Da entrada a Hubi.

## Student Dashboard

Orienta al estudiante.

## Admin Dashboard

Prioriza información.

## Create Report

Guía una conversación.

## Reports Admin

Permite encontrar casos.

## Report Detail Student

Explica qué está ocurriendo.

## Report Detail Admin

Permite gestionar.

## Profile

Administra identidad y seguridad.


---

# 35. REGLA MAESTRA

Hubi debe sentirse como UN SOLO PRODUCTO.

No como una colección de templates.

Cada pantalla puede tener un carácter diferente,
pero todas deben compartir:

- tipografía
- color
- geometría
- iconografía
- lenguaje
- motion
- jerarquía
- principios de privacidad


La diferenciación principal es:

```text
LANDING
expresiva

LOGIN
calma

STUDENT
humana y personal

ADMIN
estructurada y operacional
```


El sistema completo debe comunicar:

> ESCUCHAR

> PARTICIPAR

> DAR SEGUIMIENTO

> ACTUAR
