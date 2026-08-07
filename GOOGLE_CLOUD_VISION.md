# Google Cloud Vision en UIDE Escucha

Este documento recoge la implementación real que ya está en el proyecto para validar imágenes antes de crear un reporte. La lógica se encuentra principalmente en el controlador de tickets y combina una inspección local del contenido con análisis visual de Google Cloud Vision.

## 1. Objetivo implementado

El backend valida imágenes antes de guardar un reporte para bloquear archivos que puedan contener:

- contenido explícito o pornográfico,
- violencia o gore,
- imágenes generadas o manipuladas por IA,
- metadatos o marcas de agua que indiquen herramientas de IA.

## 2. Archivos donde está la implementación

La lógica principal está en:

- server/src/controllers/ticket.controller.ts
- server/src/services/ticket.service.ts
- server/src/repositories/archivo.repository.ts

## 3. Dependencia utilizada

El servidor usa la librería:

```bash
npm install -w server @google-cloud/vision
```

En el proyecto actual, la importación del SDK está en el controlador y la dependencia debería quedar registrada en server/package.json para que el entorno funcione correctamente.

## 4. Inicialización del cliente de Vision

El código implementado inicializa el cliente de dos formas posibles:

1. usando un archivo de credenciales JSON en keys/google-vision.json
2. usando una API Key en la variable GOOGLE_VISION_API_KEY

Este es el bloque real que se usa:

```ts
import vision from '@google-cloud/vision';
import fs from 'fs';
import path from 'path';

const KEY_PATH = path.resolve(process.cwd(), 'keys/google-vision.json');

const visionClient = fs.existsSync(KEY_PATH)
  ? new vision.ImageAnnotatorClient({ keyFilename: KEY_PATH })
  : new vision.ImageAnnotatorClient({
      apiKey: process.env.GOOGLE_VISION_API_KEY,
      fallback: 'rest',
    });
```

### Variables de entorno

Se recomienda tener al menos una de estas opciones:

```env
GOOGLE_VISION_API_KEY=tu_api_key_de_google_cloud
```

Si se usa autenticación por service account, se debe colocar el archivo JSON en keys/google-vision.json.

## 5. Flujo completo del código implementado

La validación se ejecuta dentro de la función crear del controlador y sigue este orden:

1. Se valida que el usuario sea estudiante.
2. Se recibe el body con los archivos en base64 desde req.body.
3. Se normalizan los campos archivos_base64, archivos_nombre y archivos_tipo.
4. Se rechaza el archivo si:
   - tiene extensión .gif,
   - tiene MIME no permitido,
   - supera el límite de 10 MB,
   - contiene marcas o metadatos de IA,
   - falla la validación visual de Google Cloud Vision.
5. Si pasa todas las reglas, se guarda en uploads/ y se registra el archivo asociado al ticket.

## 6. Validación de formato y tamaño

El controlador acepta únicamente estos formatos MIME:

- image/jpeg
- image/png
- image/webp
- application/pdf

Y rechaza explícitamente los GIF.

El tamaño máximo actual es 10 MB. El cálculo se hace con el string base64 recibido:

```ts
const parts = base64.split(',');
const base64Clean = parts.length > 1 ? parts[1] : parts[0];

const sizeInBytes = Math.ceil((base64Clean.length * 3) / 4);
const maxSize = 10 * 1024 * 1024;

if (sizeInBytes > maxSize) {
  return res.status(400).json({ error: 'Uno de los archivos supera el límite de 10MB.' });
}
```

## 7. Filtro previo de marcas de IA

Antes de llamar a Google Vision, el código hace una inspección rápida del buffer en texto UTF-8 para buscar firmas comunes de herramientas de IA:

```ts
const bufferHeader = buffer.toString('utf8', 0, 2000).toLowerCase();
const firmasIA = ['chatgpt', 'dall-e', 'midjourney', 'stable diffusion', 'c2pa', 'comfyui'];

const tieneFirmaIA = firmasIA.some((firma) => bufferHeader.includes(firma));
if (tieneFirmaIA) {
  return res.status(422).json({
    error: `El archivo "${nombre}" fue rechazado: contiene metadatos o marcas de agua de Inteligencia Artificial.`,
  });
}
```

Este paso sirve como filtro rápido y adicional antes del análisis de Vision.

## 8. Llamada real a Google Cloud Vision

Para imágenes que no son PDF, se ejecuta esta llamada:

```ts
const [result] = await visionClient.annotateImage({
  image: { content: buffer },
  features: [
    { type: 'SAFE_SEARCH_DETECTION' },
    { type: 'LABEL_DETECTION' },
    { type: 'WEB_DETECTION' },
  ],
});
```

### 8.1 Safe Search

El código revisa los resultados de safeSearch para detectar:

- adult
- violence
- racy
- spoof

Y rechaza la imagen si alguno de estos niveles es suficientemente alto:

```ts
const adultLevel = String(safeSearch.adult || '');
const violenceLevel = String(safeSearch.violence || '');
const racyLevel = String(safeSearch.racy || '');

const esPornoOGore =
  ['LIKELY', 'VERY_LIKELY'].includes(adultLevel) ||
  ['LIKELY', 'VERY_LIKELY'].includes(violenceLevel) ||
  racyLevel === 'VERY_LIKELY';
```

También se revisa spoofing:

```ts
const spoofLevel = String(safeSearch?.spoof || '');
const esSpoof = spoofLevel === 'LIKELY' || spoofLevel === 'VERY_LIKELY';
```

### 8.2 Detección por coincidencias web

Se revisan páginas con imágenes coincidentes para detectar si la imagen está vinculada a sitios conocidos de IA:

```ts
const dominiosIA = [
  'midjourney.com',
  'openai.com',
  'civitai.com',
  'stability.ai',
  'nightcafe.studio',
  'bing.com/create',
];

const detectadoEnSitiosIA = (webDetection?.pagesWithMatchingImages || []).some((page) =>
  dominiosIA.some((domain) => page.url?.toLowerCase().includes(domain))
);
```

### 8.3 Detección por etiquetas

También se filtran etiquetas que puedan indicar arte digital, diseño gráfico o contenido generado por IA. Este es el bloque que específicamente cubre imágenes con IA:

```ts
const categoriasProhibidas = [
  'clip art',
  'illustration',
  'animated cartoon',
  'artwork',
  'drawing',
  'graphics',
  'digital art',
  'artificial intelligence',
  'cgi',
  'cg artwork',
  'generated image',
  'deepfake',
  'synthetic photo',
  '3d render',
  'graphic design',
  'poster',
  'fictional character',
  'vector',
  'novelty',
  'animation',
  'font',
  'logo',
];
```

La condición final usa un umbral de score mayor a 0.45:

```ts
const esArteOIA = labels.some((label) => {
  if (!label.description) return false;
  const desc = label.description.toLowerCase();
  const score = label.score || 0;

  return categoriasProhibidas.some((cat) => desc.includes(cat)) && score > 0.45;
});
```

## 9. Respuestas de rechazo implementadas

El controlador devuelve respuestas de error en dos casos:

- 400 cuando el archivo no cumple formato, tipo o tamaño,
- 422 cuando se detecta contenido no permitido o señales de IA.

Ejemplos reales del código:

```ts
return res.status(422).json({
  error: `El archivo "${nombre}" fue rechazado: se detectó una ilustración, diseño gráfico o imagen generada por IA. Por favor sube una fotografía real.`,
});
```

```ts
return res.status(422).json({
  error: `El archivo "${nombre}" contiene material no permitido (contenido explícito o violencia).`,
});
```

## 10. Persistencia y almacenamiento

Si la imagen pasa la validación, se guarda físicamente en el directorio uploads/ y se crea un registro asociado al ticket.

El código actual hace lo siguiente:

```ts
const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${item.ext || '.png'}`;
const filePath = path.join(UPLOADS_DIR, filename);

fs.writeFileSync(filePath, item.buffer);

const fileUrl = `/api/reportes/imagen/${filename}`;
const tipoArchivo = item.ext === '.pdf' ? 'pdf' : 'imagen';
await archivoRepo.crearArchivo(nuevoTicket.id, item.nombre, fileUrl, tipoArchivo);
```

## 11. Consideraciones importantes

- La validación no es perfecta; depende de heurísticas de texto, web detection y label detection.
- Puede bloquear imágenes legítimas si el modelo devuelve etiquetas genéricas como illustration o graphics.
- Safe Search es el filtro principal para pornografía y violencia.
- Si se necesita auditoría, conviene registrar result.webDetection y result.labelAnnotations para revisar por qué un archivo fue rechazado.

## 12. Resumen técnico

La implementación actual combina estas capas:

- validación local de formato, MIME y tamaño,
- inspección de firmas de IA en el buffer,
- análisis visual por Google Cloud Vision,
- rechazo automático de contenido explícito, violento o generado por IA,
- persistencia del archivo aprobado y registro en base de datos.
