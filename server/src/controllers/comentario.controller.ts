import { Request, Response } from 'express';
import * as service from '../services/comentario.service';
import { crearComentarioSchema, actualizarComentarioSchema } from '../schemas/comentario.schema';
import { logError } from '../utils/logger';
import fs from 'fs';
import path from 'path';
import * as archivoRepo from '../repositories/archivo.repository';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function listar(req: Request, res: Response) {
  try {
    const reporteId = Number(req.params.reporteId);
    const comentarios = await service.listarComentarios(reporteId, req.user!);

    if (comentarios === null) {
      res.status(404).json({ error: 'El reporte solicitado no existe.' });
      return;
    }

    res.json(comentarios);
  } catch (error: any) {
    logError('listar comentarios', error);
    res.status(500).json({ error: 'Error al obtener comentarios.' });
  }
}

export async function crear(req: Request, res: Response) {
  try {
    const reporteId = Number(req.params.reporteId);
    const data = crearComentarioSchema.parse(req.body);

    const comentario = await service.crearComentario(reporteId, data, req.user!);

    if (comentario === null) {
      res.status(404).json({ error: 'El reporte al que intentas responder no existe.' });
      return;
    }

    const archivosBase64 = Array.isArray((data as any).archivos_base64) && (data as any).archivos_base64.length > 0
      ? (data as any).archivos_base64
      : (data as any).archivo_base64
        ? [(data as any).archivo_base64]
        : [];
    const filesNombre = Array.isArray((data as any).archivos_nombre) && (data as any).archivos_nombre.length > 0
      ? (data as any).archivos_nombre
      : (data as any).archivo_nombre
        ? [(data as any).archivo_nombre]
        : [];
    const filesTipo = Array.isArray((data as any).archivos_tipo) && (data as any).archivos_tipo.length > 0
      ? (data as any).archivos_tipo
      : (data as any).archivo_tipo
        ? [(data as any).archivo_tipo]
        : [];

    const savedFiles = [];
    for (let i = 0; i < archivosBase64.length; i++) {
      const base64 = archivosBase64[i];
      const nombre = filesNombre[i];
      const tipo = filesTipo[i];

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
      const parts = String(base64).split(',');
      const base64Clean = parts.length > 1 ? parts[1] : parts[0];
      const sizeInBytes = Math.ceil((base64Clean.length * 3) / 4);
      if (sizeInBytes > 5 * 1024 * 1024) {
        res.status(400).json({ error: 'Uno de los archivos supera el límite de 5MB.' });
        return;
      }
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext || '.png'}`;
      const filePath = path.join(UPLOADS_DIR, filename);
      fs.writeFileSync(filePath, Buffer.from(base64Clean, 'base64'));
      const fileUrl = `/api/reportes/imagen/${filename}`;
      const tipoArchivo = ext === '.pdf' ? 'pdf' : 'imagen';
      const archivo = await archivoRepo.crearArchivoComentario(comentario.comentario_id, nombre, fileUrl, tipoArchivo);
      savedFiles.push(archivo);
    }

    const archivoAdjunto = savedFiles[0] || null;
    res.status(201).json({ ...comentario, archivo: archivoAdjunto });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors[0]?.message || 'Datos invalidos.' });
      return;
    }
    if (error.message?.includes('No tienes permisos') || error.message?.includes('Solo el autor')) {
      res.status(403).json({ error: error.message });
      return;
    }
    logError('crear comentario', error);
    res.status(500).json({ error: 'Error al crear comentario.' });
  }
}

export async function actualizar(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const data = actualizarComentarioSchema.parse(req.body);

    const comentario = await service.actualizarComentario(id, data, req.user!);

    if (comentario === null) {
      res.status(404).json({ error: 'El comentario que intentas modificar no existe.' });
      return;
    }

    res.json(comentario);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors[0]?.message || 'Datos invalidos.' });
      return;
    }
    if (error.message?.includes('No puedes')) {
      res.status(403).json({ error: error.message });
      return;
    }
    logError('actualizar comentario', error);
    res.status(500).json({ error: 'Error al actualizar comentario.' });
  }
}

export async function eliminar(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const result = await service.eliminarComentario(id, req.user!);

    if (!result) {
      res.status(404).json({ error: 'El comentario que intentas eliminar no existe.' });
      return;
    }

    res.status(204).send();
  } catch (error: any) {
    if (error.message?.includes('No puedes')) {
      res.status(403).json({ error: error.message });
      return;
    }
    logError('eliminar comentario', error);
    res.status(500).json({ error: 'Error al eliminar comentario.' });
  }
}