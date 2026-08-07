import { sql } from '../config/database';

export async function findByUsuarioId(usuarioId: number) {
  return sql`
    SELECT 
      n.notificacion_id AS id,
      n.usuario_id,
      n.reporte_id,
      n.tipo,
      n.mensaje,
      n.leida,
      n.creado_en,
      r.titulo AS reporte_titulo
    FROM notificaciones n
    LEFT JOIN reportes r ON r.reporte_id = n.reporte_id
    WHERE n.usuario_id = ${usuarioId}
    ORDER BY n.creado_en DESC
  `;
}

export async function countNoLeidas(usuarioId: number) {
  const rows = await sql`
    SELECT COUNT(*)::int AS count
    FROM notificaciones
    WHERE usuario_id = ${usuarioId} AND leida = false
  `;
  return rows[0]?.count ?? 0;
}

export async function create(usuarioId: number, reporteId: number | null, tipo: string, mensaje: string) {
  const rows = await sql`
    INSERT INTO notificaciones (usuario_id, reporte_id, tipo, mensaje)
    VALUES (${usuarioId}, ${reporteId}, ${tipo}, ${mensaje})
    RETURNING notificacion_id AS id
  `;
  return rows[0];
}

export async function marcarLeida(id: number, usuarioId: number) {
  await sql`
    UPDATE notificaciones SET leida = true
    WHERE notificacion_id = ${id} AND usuario_id = ${usuarioId}
  `;
}

export async function marcarTodasLeidas(usuarioId: number) {
  await sql`
    UPDATE notificaciones SET leida = true
    WHERE usuario_id = ${usuarioId} AND leida = false
  `;
}
