import * as repo from '../repositories/ticket.repository';
import { FiltrosTickets } from '../repositories/ticket.repository';
import * as notifRepo from '../repositories/notificacion.repository';
import * as mfaRepo from '../repositories/mfa.repository';
import * as usuarioRepo from '../repositories/usuario.repository';
import { sendReportUpdateEmail } from './email.service';
import { CrearTicketDTO, ActualizarTicketDTO } from '../schemas/ticket.schema';
import { clasificarIncidente } from '../config/clasificacion';

const ROLES_CON_AREA = [
  'ti_soporte', 'bibliotecario', 'conserje', 'mantenimiento',
  'secretaria', 'bienestar universitario', 'financiero',
];

export async function obtenerStats(usuarioId?: number) {
  return repo.getStats(usuarioId);
}

export async function listarTicketsPorRol(rol: string, filtros?: FiltrosTickets, autorId?: number) {
  if (rol === 'estudiante') {
    if (!autorId) return { data: [], total: 0, page: 1, totalPages: 1, porEstado: {} };
    return repo.listar({ ...filtros, autorId });
  }
  if (rol === 'prorector' || rol === 'admin') {
    return repo.listar(filtros);
  }
  if (ROLES_CON_AREA.includes(rol)) {
    return repo.listar({ ...filtros, area: rol });
  }
  return { data: [], total: 0, page: 1, totalPages: 1, porEstado: {} };
}

export async function obtenerMapaCalor() {
  return repo.findForMapaCalor();
}

export async function obtenerHeatmap() {
  return repo.findForHeatmap();
}

export async function listarTicketsDeEstudiante(usuarioId: number, filtros?: FiltrosTickets) {
  return repo.listar({ ...filtros, autorId: usuarioId });
}

export async function obtenerTicket(id: number) {
  const ticket = await repo.findById(id);
  return ticket ?? null;
}

export async function crearTicket(data: CrearTicketDTO, usuarioId: number) {
  const clasif = clasificarIncidente(data.titulo || '', data.descripcion);
  const clasificacion = data.clasificacion || clasif.clasificacion;
  const urgencia = data.urgencia || clasif.urgencia;
  const area = data.area || clasif.area || null;

  const nuevo = await repo.create({ ...data, clasificacion, urgencia, area: area as any, tipo: data.tipo || 'incidente' }, usuarioId);

  if (area) {
    const areaUsers = await usuarioRepo.findByRol(area);
    const reportLabel = data.emocion ? obtenerLabelEmocion(data.emocion) : data.titulo || 'Sin título';
    for (const u of areaUsers) {
      if (u.id === usuarioId) continue;
      await notifRepo.create(
        u.id,
        nuevo.id,
        'area_asignada',
        `Se te ha asignado el reporte "${reportLabel}" del área: ${area}`
      );
    }
  }

  return nuevo;
}

export async function actualizarTicket(id: number, data: ActualizarTicketDTO, actor?: { rol?: string }) {
  const existente = await repo.findById(id);
  if (!existente) return null;

  if (existente.estado === 'resuelto' || existente.estado === 'rechazado') {
    throw new Error('No es posible modificar un ticket que ya se encuentra cerrado de forma definitiva.');
  }

  const pasandoAResuelto = data.estado === 'resuelto' && existente.estado !== 'resuelto';
  if (pasandoAResuelto) {
    (data as any).resuelto_por = actor?.rol || null;
    (data as any).fecha_resolucion = new Date().toISOString();
  }

  const areaCambio = data.area && data.area !== existente.area;
  if (areaCambio && existente.estado !== 'resuelto' && existente.estado !== 'rechazado') {
    data.estado = 'pendiente';
  }

  const actualizado = await repo.update(id, data);

  if (areaCambio) {
    const AREA_LABELS: Record<string, string> = {
      ti_soporte: 'Soporte TI',
      bibliotecario: 'Biblioteca',
      conserje: 'Limpieza',
      mantenimiento: 'Mantenimiento',
      secretaria: 'Secretaría',
      'bienestar universitario': 'Bienestar',
      financiero: 'Financiero',
    };
    const areaLabel = AREA_LABELS[data.area || existente.area] || data.area || existente.area;
    const reportLabel = existente.emocion
      ? obtenerLabelEmocion(existente.emocion)
      : existente.titulo || 'Sin título';

    await notifRepo.create(
      existente.autor_id,
      id,
      'area_cambio',
      `Tu reporte "${reportLabel}" ha sido reasignado al área: ${areaLabel}`
    );

    const recoveryEmail = await mfaRepo.getRecoveryEmail(existente.autor_id);
    if (recoveryEmail) {
      sendReportUpdateEmail(
        recoveryEmail,
        reportLabel,
        `reasignación de área a "${areaLabel}"`,
        id
      ).catch(() => {});
    }

    const usuariosNuevaArea = await usuarioRepo.findByRol(data.area || '');
    for (const u of usuariosNuevaArea) {
      if (u.id === existente.autor_id) continue;
      await notifRepo.create(
        u.id,
        id,
        'area_asignada',
        `Se te ha asignado el reporte "${reportLabel}" del área: ${areaLabel}`
      );
    }
  } else if (data.estado && data.estado !== existente.estado) {
    const estadoLabels: Record<string, string> = {
      pendiente: 'Pendiente',
      en_proceso: 'En Proceso',
      resuelto: 'Resuelto',
      rechazado: 'Rechazado',
    };
    const nuevoLabel = estadoLabels[data.estado] || data.estado;
    const reportLabel = existente.emocion
      ? obtenerLabelEmocion(existente.emocion)
      : existente.titulo || 'Sin título';
    await notifRepo.create(
      existente.autor_id,
      id,
      'estado_cambio',
      `Tu reporte "${reportLabel}" ha cambiado a estado: ${nuevoLabel}`
    );

    const recoveryEmail = await mfaRepo.getRecoveryEmail(existente.autor_id);
    if (recoveryEmail) {
      sendReportUpdateEmail(
        recoveryEmail,
        reportLabel,
        `cambio de estado a "${nuevoLabel}"`,
        id
      ).catch(() => {});
    }
  }

  return actualizado;
}

export async function eliminarTicket(id: number) {
  const existente = await repo.findById(id);
  if (!existente) return false;

  if (existente.estado !== 'pendiente') {
    throw new Error('Solo se permite eliminar reportes que permanezcan en estado estrictamente pendiente.');
  }

  await repo.remove(id);
  return true;
}

export function obtenerLabelEmocion(emocion: string): string {
  const EMOCION_LABELS: Record<string, string> = {
    'molesto:1': 'Molesto', 'disgustado:2': 'Disgustado', 'enojado:3': 'Enojado', 'frustrado:4': 'Frustrado',
    'contento:1': 'Contento', 'satisfecho:2': 'Satisfecho', 'feliz:3': 'Feliz', 'euforico:4': 'Eufórico',
    'idea:1': 'Idea', 'mejora:2': 'Mejora', 'innovacion:3': 'Innovación', 'propuesta:4': 'Propuesta',
    'solicitud:1': 'Solicitud', 'necesidad:2': 'Necesidad', 'urgencia:3': 'Urgencia', 'colaboracion:4': 'Colaboración',
  };
  return EMOCION_LABELS[emocion] || emocion;
}
