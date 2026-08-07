import { Request, Response } from 'express';
import * as service from '../services/ticket.service';
import * as archivoRepo from '../repositories/archivo.repository';
import * as usuarioRepo from '../repositories/usuario.repository';
import * as notificacionService from '../services/notificacion.service';
import { crearTicketSchema, actualizarTicketSchema } from '../schemas/ticket.schema';
import fs from 'fs';
import path from 'path';
import vision, { ImageAnnotatorClient } from '@google-cloud/vision';
import { logError } from '../utils/logger';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

const KEY_PATH = path.resolve(process.cwd(), 'keys/google-vision.json');

const visionEnabled = fs.existsSync(KEY_PATH) || !!process.env.GOOGLE_VISION_API_KEY;

let visionClient: ImageAnnotatorClient | null = null;

try {
  visionClient = visionEnabled
    ? fs.existsSync(KEY_PATH)
      ? new vision.ImageAnnotatorClient({ keyFilename: KEY_PATH })
      : new vision.ImageAnnotatorClient({
          apiKey: process.env.GOOGLE_VISION_API_KEY,
          fallback: 'rest',
        })
    : null;
} catch (error) {
  logError('inicializar cliente de Google Vision', error as any);
  visionClient = null;
}

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function stats(req: Request, res: Response) {
  const usuarioId = req.user?.rol === 'estudiante' ? req.user?.sub : undefined;
  const data = await service.obtenerStats(usuarioId);
  res.json(data);
}

export async function listar(req: Request, res: Response) {
  const query = req.query as any;
  const filtros = {
    page: query.page,
    limit: query.limit,
    todos: ['1', 'true', 'yes'].includes(String(query.todos || '').toLowerCase()),
    estado: query.estado,
    tipo: query.tipo,
    clasificacion: query.clasificacion,
    urgencia: query.urgencia,
    area: query.area,
    autor: query.autor,
    resueltoPor: query.resuelto_por,
    desde: query.desde,
    hasta: query.hasta,
    campoFecha: (query.campo_fecha === 'actualizacion' ? 'actualizacion' : 'creacion') as 'creacion' | 'actualizacion',
    mesAnio: query.mesAnio,
    busqueda: query.busqueda,
    orden: query.orden,
    direccion: query.direccion,
  } as Parameters<typeof service.listarTicketsPorRol>[1];

  const tickets = await service.listarTicketsPorRol(req.user?.rol || '', filtros, req.user?.sub);
  res.json(tickets);
}

export async function mapaCalor(req: Request, res: Response) {
  try {
    const zonas = await service.obtenerMapaCalor();
    res.json(zonas);
  } catch (error: any) {
    logError('mapa de calor', error);
    res.status(500).json({ error: 'Error al obtener los datos del mapa de calor.' });
  }
}

export async function heatmap(req: Request, res: Response) {
  try {
    const data = await service.obtenerHeatmap();
    const totalReportes = data.reduce((acc: number, r: any) => acc + r.total, 0);
    const maxTotal = Math.max(...data.map((r: any) => r.total), 1);

    const zonas = data.map((r: any) => ({
      zona: r.zona,
      intensidad: Math.min(r.total / maxTotal, 1),
      total: r.total,
      pendientes: r.pendientes,
      en_proceso: r.en_proceso,
      resueltos: r.resueltos,
    }));

    res.json({ zonas, totalReportes });
  } catch (error: any) {
    logError('heatmap', error);
    res.status(500).json({ error: 'Error al obtener datos del heatmap.' });
  }
}

export async function obtener(req: Request, res: Response) {
  const ticket = await service.obtenerTicket(Number(req.params.id));
  
  if (!ticket) {
    res.status(404).json({ error: 'El ticket solicitado no existe.' });
    return;
  }

  if (req.user?.rol === 'estudiante' && ticket.autor_id !== req.user.sub) {
    res.status(403).json({ error: 'Acceso denegado. No tienes permisos para ver este reporte.' });
    return;
  }

  const archivos = await archivoRepo.findArchivosByReporteId(ticket.id);
  res.json({ ...ticket, imagenes: archivos });
}

export async function crear(req: Request, res: Response) {
  if ((req as any).user?.rol !== 'estudiante') {
    res.status(403).json({ error: 'Solo los estudiantes pueden crear reportes.' });
    return;
  }

  try {
    const body = (req.body || {}) as any;
    const datosValidados = crearTicketSchema.parse({
      titulo: body.titulo,
      emocion: body.emocion,
      descripcion: body.descripcion,
      tipo: body.tipo,
      area: body.area,
      zona: body.zona,
      clasificacion: body.clasificacion,
      urgencia: body.urgencia,
      archivos_base64: Array.isArray(body.archivos_base64) ? body.archivos_base64 : body.archivo_base64 ? [body.archivo_base64] : [],
      archivos_nombre: Array.isArray(body.archivos_nombre) ? body.archivos_nombre : body.archivo_nombre ? [body.archivo_nombre] : [],
      archivos_tipo: Array.isArray(body.archivos_tipo) ? body.archivos_tipo : body.archivo_tipo ? [body.archivo_tipo] : [],
      archivo_base64: body.archivo_base64,
      archivo_nombre: body.archivo_nombre,
      archivo_tipo: body.archivo_tipo,
    });

    const ticketData = {
      titulo: datosValidados.titulo || '',
      emocion: datosValidados.emocion,
      descripcion: datosValidados.descripcion,
      tipo: datosValidados.tipo,
      area: datosValidados.area,
      zona: datosValidados.zona,
      clasificacion: datosValidados.clasificacion,
      urgencia: datosValidados.urgencia,
    } as Parameters<typeof service.crearTicket>[0];
    const usuarioId = (req as any).user.sub;
    const nuevoTicket = await service.crearTicket(ticketData, usuarioId);

    const archivosBase64 = datosValidados.archivos_base64.length > 0
      ? datosValidados.archivos_base64
      : datosValidados.archivo_base64
        ? [datosValidados.archivo_base64]
        : [];
    const archivosNombre = datosValidados.archivos_nombre.length > 0
      ? datosValidados.archivos_nombre
      : datosValidados.archivo_nombre
        ? [datosValidados.archivo_nombre]
        : [];
    const archivosTipo = datosValidados.archivos_tipo.length > 0
      ? datosValidados.archivos_tipo
      : datosValidados.archivo_tipo
        ? [datosValidados.archivo_tipo]
        : [];

    for (let i = 0; i < archivosBase64.length; i++) {
      const base64 = archivosBase64[i];
      const nombre = archivosNombre[i];
      const tipo = archivosTipo[i];

      if (!base64 || !nombre) continue;

      const ext = path.extname(nombre).toLowerCase();

      if (ext === '.gif') {
        res.status(400).json({ error: 'El formato GIF no está permitido.' });
        return;
      }

      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (tipo && !allowedMimes.includes(tipo)) {
        res.status(400).json({ error: 'Formato de archivo no permitido. Usa JPG, PNG, WebP o PDF.' });
        return;
      }

      const parts = base64.split(',');
      const base64Clean = parts.length > 1 ? parts[1] : parts[0];

      const sizeInBytes = Math.ceil((base64Clean.length * 3) / 4);
      const maxSize = 10 * 1024 * 1024;
      if (sizeInBytes > maxSize) {
        res.status(400).json({ error: 'Uno de los archivos supera el límite de 10MB.' });
        return;
      }

      const buffer = Buffer.from(base64Clean, 'base64');

      const bufferHeader = buffer.toString('utf8', 0, 2000).toLowerCase();
      const firmasIA = ['chatgpt', 'dall-e', 'midjourney', 'stable diffusion', 'c2pa', 'comfyui'];
      const tieneFirmaIA = firmasIA.some((firma) => bufferHeader.includes(firma));
      if (tieneFirmaIA) {
        res.status(422).json({
          error: `El archivo "${nombre}" fue rechazado: contiene metadatos o marcas de agua de Inteligencia Artificial.`,
        });
        return;
      }

      if (ext !== '.pdf' && visionClient) {
        try {
          const [result] = await Promise.race([
            visionClient.annotateImage({
              image: { content: buffer },
              features: [
                { type: 'SAFE_SEARCH_DETECTION' },
                { type: 'LABEL_DETECTION' },
                { type: 'WEB_DETECTION' },
              ],
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Tiempo de espera de Google Vision agotado.')), 15000)
            ),
          ]) as any[];

          const safeSearch = result.safeSearchAnnotation || {};
          const adultLevel = String(safeSearch.adult || '');
          const violenceLevel = String(safeSearch.violence || '');
          const racyLevel = String(safeSearch.racy || '');
          const spoofLevel = String(safeSearch.spoof || '');

          const esPornoOGore =
            ['LIKELY', 'VERY_LIKELY'].includes(adultLevel) ||
            ['LIKELY', 'VERY_LIKELY'].includes(violenceLevel) ||
            racyLevel === 'VERY_LIKELY';
          if (esPornoOGore) {
            res.status(422).json({
              error: `El archivo "${nombre}" contiene material no permitido (contenido explícito o violencia).`,
            });
            return;
          }

          const esSpoof = spoofLevel === 'LIKELY' || spoofLevel === 'VERY_LIKELY';
          if (esSpoof) {
            res.status(422).json({
              error: `El archivo "${nombre}" fue rechazado: se detectó una ilustración, diseño gráfico o imagen generada por IA. Por favor sube una fotografía real.`,
            });
            return;
          }

          const webDetection = result.webDetection as any;
          const dominiosIA = [
            'midjourney.com',
            'openai.com',
            'civitai.com',
            'stability.ai',
            'nightcafe.studio',
            'bing.com/create',
          ];
          const detectadoEnSitiosIA = (webDetection?.pagesWithMatchingImages || []).some(
            (page: any) => dominiosIA.some((domain) => page.url?.toLowerCase().includes(domain))
          );
          if (detectadoEnSitiosIA) {
            res.status(422).json({
              error: `El archivo "${nombre}" fue rechazado: se detectó una ilustración, diseño gráfico o imagen generada por IA. Por favor sube una fotografía real.`,
            });
            return;
          }

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
          const labels = (result.labelAnnotations || []) as any[];
          const esArteOIA = labels.some((label) => {
            if (!label.description) return false;
            const desc = label.description.toLowerCase();
            const score = label.score || 0;
            return categoriasProhibidas.some((cat) => desc.includes(cat)) && score > 0.45;
          });
          if (esArteOIA) {
            res.status(422).json({
              error: `El archivo "${nombre}" fue rechazado: se detectó una ilustración, diseño gráfico o imagen generada por IA. Por favor sube una fotografía real.`,
            });
            return;
          }
        } catch (visionError) {
          logError('validación de imagen con Google Vision', visionError as any);
        }
      }

      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext || '.png'}`;
      const filePath = path.join(UPLOADS_DIR, filename);

      fs.writeFileSync(filePath, buffer);

      const fileUrl = `/api/reportes/imagen/${filename}`;
      const tipoArchivo = ext === '.pdf' ? 'pdf' : 'imagen';
      await archivoRepo.crearArchivo(nuevoTicket.id, nombre, fileUrl, tipoArchivo);
    }

    const archivos = await archivoRepo.findArchivosByReporteId(nuevoTicket.id);

    try {
      const admins = await usuarioRepo.findAllAdmins();
      const mensaje = `Nuevo reporte creado: ${datosValidados.titulo}`;

      await Promise.all(
        admins.map((admin: { id: number }) =>
          notificacionService.crearNotificacion(
            admin.id,
            nuevoTicket.id,
            'nuevo_reporte',
            mensaje
          )
        )
      );
    } catch (notifError) {
      logError('crear notificaciones de nuevo reporte', notifError as any);
    }

    res.status(201).json({ ...nuevoTicket, imagenes: archivos });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors[0]?.message || 'Datos invalidos.' });
      return;
    }
    logError('crear reporte', error);
    res.status(500).json({ error: 'Error al crear el reporte.' });
  }
}

export async function actualizar(req: Request, res: Response) {
  const datosValidados = actualizarTicketSchema.parse(req.body);
  
  try {
    const actualizado = await service.actualizarTicket(Number(req.params.id), datosValidados, { rol: req.user?.rol || '' });
    
    if (!actualizado) {
      res.status(404).json({ error: 'El ticket que intentas actualizar no existe.' });
      return;
    }
    
    res.json(actualizado);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function eliminar(req: Request, res: Response) {
  try {
    const ticketId = Number(req.params.id);
    const archivos = await archivoRepo.findArchivosByReporteId(ticketId);

    for (const archivo of archivos) {
      const filePathMatch = archivo.ruta_archivo.match(/\/api\/reportes\/imagen\/(.+)/);
      if (filePathMatch) {
        const fullPath = path.join(UPLOADS_DIR, filePathMatch[1]);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    }

    await archivoRepo.eliminarArchivosByReporteId(ticketId);

    const eliminado = await service.eliminarTicket(ticketId);
    
    if (!eliminado) {
      res.status(404).json({ error: 'El ticket que intentas eliminar no existe.' });
      return;
    }
    
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
