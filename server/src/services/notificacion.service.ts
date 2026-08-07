import * as repo from '../repositories/notificacion.repository';
import * as usuarioRepo from '../repositories/usuario.repository';

export async function listarNotificaciones(usuarioId: number) {
  return repo.findByUsuarioId(usuarioId);
}

export async function contarNoLeidas(usuarioId: number) {
  return repo.countNoLeidas(usuarioId);
}

export async function marcarComoLeida(id: number, usuarioId: number) {
  await repo.marcarLeida(id, usuarioId);
}

export async function marcarTodasComoLeidas(usuarioId: number) {
  await repo.marcarTodasLeidas(usuarioId);
}

export async function crearNotificacion(usuarioId: number, reporteId: number | null, tipo: string, mensaje: string) {
  return repo.create(usuarioId, reporteId, tipo, mensaje);
}

export async function notificarAreaYAdmins(reporte: { id?: number; area?: string | null; titulo?: string }, tipo: string, mensaje: string) {
  const admins = await usuarioRepo.findAllAdmins();
  const targetUsers = new Set<number>();

  if (reporte.area) {
    const areaUsers = await usuarioRepo.findByRol(reporte.area);
    areaUsers.forEach((u: { id: number }) => targetUsers.add(u.id));
  }

  admins.forEach((admin: { id: number }) => targetUsers.add(admin.id));

  await Promise.all(Array.from(targetUsers).map((userId) => crearNotificacion(userId, reporte.id ?? null, tipo, mensaje)));
}
