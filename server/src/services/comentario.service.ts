import * as repo from '../repositories/comentario.repository';
import * as ticketRepo from '../repositories/ticket.repository';
import * as notifRepo from '../repositories/notificacion.repository';
import * as mfaRepo from '../repositories/mfa.repository';
import * as archivoRepo from '../repositories/archivo.repository';
import * as usuarioRepo from '../repositories/usuario.repository';
import { sendReportUpdateEmail } from './email.service';
import { obtenerLabelEmocion } from './ticket.service';
import { CrearComentarioDTO, ActualizarComentarioDTO } from '../schemas/comentario.schema';
import { TokenPayload, ROLES_ADMIN } from '../middleware/auth';
import fs from 'fs';
import path from 'path';

export async function listarComentarios(reporteId: number, usuario: TokenPayload) {
  const ticket = await ticketRepo.findById(reporteId);
  if (!ticket) return null;

  if (usuario.rol === 'estudiante' && ticket.autor_id !== usuario.sub) {
    return null;
  }

  return repo.findByReporteId(reporteId);
}

export async function crearComentario(reporteId: number, data: CrearComentarioDTO, usuario: TokenPayload) {
  const ticket = await ticketRepo.findById(reporteId);
  if (!ticket) return null;

  const esAdmin = ROLES_ADMIN.includes(usuario.rol as any);
  if (!esAdmin && usuario.rol !== 'estudiante') {
    throw new Error('No tienes permisos para comentar en este reporte.');
  }
  if (!esAdmin && ticket.autor_id !== usuario.sub) {
    throw new Error('Solo el autor del reporte puede comentar.');
  }

  const comentario = await repo.create(reporteId, usuario.sub, data);

  const reportLabel = ticket.emocion
    ? obtenerLabelEmocion(ticket.emocion)
    : ticket.titulo || 'Sin titulo';

  const filesBase64 = Array.isArray((data as any).archivos_base64) && (data as any).archivos_base64.length > 0
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

  for (let i = 0; i < filesBase64.length; i++) {
    const base64 = filesBase64[i];
    const nombre = filesNombre[i];
    const tipo = filesTipo[i];

    if (!base64 || !nombre) continue;

    const ext = path.extname(nombre).toLowerCase();
    const parts = String(base64).split(',');
    const base64Clean = parts.length > 1 ? parts[1] : parts[0];
    const sizeInBytes = Math.ceil((base64Clean.length * 3) / 4);
    const maxSize = 10 * 1024 * 1024;
    if (sizeInBytes > maxSize) {
      throw new Error('Uno de los archivos supera el límite de 10MB.');
    }
    if (ext === '.gif') {
      throw new Error('El formato GIF no está permitido.');
    }
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (tipo && !allowedMimes.includes(tipo)) {
      throw new Error('Formato de archivo no permitido. Usa JPG, PNG, WebP o PDF.');
    }

    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext || '.png'}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, Buffer.from(base64Clean, 'base64'));

    const fileUrl = `/api/reportes/imagen/${filename}`;
    const tipoArchivo = ext === '.pdf' ? 'pdf' : 'imagen';
    await archivoRepo.crearArchivoComentario(comentario.comentario_id, nombre, fileUrl, tipoArchivo);
  }

  if (esAdmin) {
    await notifRepo.create(
      ticket.autor_id,
      reporteId,
      'comentario_nuevo',
      `Nueva respuesta en tu reporte "${reportLabel}"`
    );

    const recoveryEmail = await mfaRepo.getRecoveryEmail(ticket.autor_id);
    if (recoveryEmail) {
      sendReportUpdateEmail(
        recoveryEmail,
        reportLabel,
        'nuevo comentario',
        reporteId
      ).catch(() => {});
    }
  } else {
    const admins = await usuarioRepo.findAllAdmins();
    await Promise.all(
      admins.map((admin: { id: number }) =>
        notifRepo.create(
          admin.id,
          reporteId,
          'comentario_nuevo',
          `Nuevo comentario del estudiante en el reporte "${reportLabel}"`
        )
      )
    );
  }

  return comentario;
}

export async function actualizarComentario(id: number, data: ActualizarComentarioDTO, usuario: TokenPayload) {
  const existente = await repo.findById(id);
  if (!existente) return null;

  const esAdmin = ROLES_ADMIN.includes(usuario.rol as any);
  if (existente.usuario_id !== usuario.sub && !esAdmin) {
    throw new Error('No puedes modificar un comentario de otro usuario.');
  }

  return repo.update(id, data);
}

export async function eliminarComentario(id: number, usuario: TokenPayload) {
  const existente = await repo.findById(id);
  if (!existente) return false;

  const esAdmin = ROLES_ADMIN.includes(usuario.rol as any);
  if (existente.usuario_id !== usuario.sub && !esAdmin) {
    throw new Error('No puedes eliminar un comentario de otro usuario.');
  }

  await repo.remove(id);
  return true;
}