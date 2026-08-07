## ADDED Requirements

### Requirement: Validar tamaño de imagen en backend
El servidor SHALL rechazar archivos de imagen cuyo tamaño exceda 5 MB.
La validación SHALL ocurrir antes de escribir el archivo en disco.
El mensaje de error SHALL ser: "La imagen no puede superar 5MB."

#### Scenario: Imagen excede el límite
- **WHEN** el usuario sube una imagen de más de 5MB
- **THEN** el sistema responde con `{ error: "La imagen no puede superar 5MB." }` y no guarda el archivo

#### Scenario: Imagen dentro del límite
- **WHEN** el usuario sube una imagen de menos de 5MB
- **THEN** el sistema guarda el archivo y responde con el ticket creado

### Requirement: Validar tipo de imagen en backend
El servidor SHALL rechazar archivos .gif por extensión y por tipo MIME.
Los tipos permitidos SHALL ser: image/jpeg, image/png, image/webp, image/bmp.
El mensaje de error SHALL ser: "El formato GIF no está permitido."

#### Scenario: Subida de archivo .gif
- **WHEN** el usuario sube un archivo con extensión .gif o MIME image/gif
- **THEN** el sistema responde con `{ error: "El formato GIF no está permitido." }` y no guarda el archivo

### Requirement: Preview persistente de imagen en listado de tickets
El listado de tickets SHALL mostrar un thumbnail de la imagen subida.
El thumbnail SHALL usar la URL persistente del servidor (ruta_archivo), no un blob URL.
Si el ticket no tiene imagen, el sistema SHALL mostrar un placeholder.

#### Scenario: Ticket con imagen
- **WHEN** el usuario ve el listado de tickets
- **THEN** cada ticket muestra un thumbnail (120x120) de su imagen usando la URL del servidor

#### Scenario: Ticket sin imagen
- **WHEN** el usuario ve un ticket que no tiene imagen adjunta
- **THEN** el sistema muestra un placeholder gris con ícono de imagen
