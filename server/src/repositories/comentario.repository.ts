import { sql } from '../config/database';
import { CrearComentarioDTO, ActualizarComentarioDTO } from '../schemas/comentario.schema';

export interface ComentarioRow {
  comentario_id: number;
  reporte_id: number;
  usuario_id: number;
  autor_nombre: string;
  autor_rol: string;
  comentario: string;
  fecha_comentario: string;
  archivos?: {
    archivo_id: number;
    nombre_archivo: string;
    ruta_archivo: string;
    tipo_archivo: string;
  }[];
}

const BASE_QUERY = `
  SELECT
    c.comentario_id,
    c.reporte_id,
    c.usuario_id,
    u.nombres AS autor_nombre,
    u.rol AS autor_rol,
    c.comentario,
    c.fecha_comentario
  FROM comentarios c
  JOIN usuarios u ON u.usuario_id = c.usuario_id
`;

export async function findByReporteId(reporteId: number): Promise<ComentarioRow[]> {
  const rows = await sql`
    SELECT * FROM (${sql.unsafe(BASE_QUERY)}) sub
    WHERE sub.reporte_id = ${reporteId}
    ORDER BY sub.fecha_comentario ASC
  `;
  
  const comentarios = rows as ComentarioRow[];
  
  // Cargar archivos adjuntos para cada comentario
  for (const comentario of comentarios) {
    const archivos = await sql`
      SELECT archivo_id, nombre_archivo, ruta_archivo, tipo_archivo
      FROM archivos_comentario
      WHERE comentario_id = ${comentario.comentario_id}
    `;
    comentario.archivos = archivos as any || [];
  }
  
  return comentarios;
}

export async function findById(id: number): Promise<ComentarioRow | null> {
  const rows = await sql`
    SELECT * FROM (${sql.unsafe(BASE_QUERY)}) sub
    WHERE sub.comentario_id = ${id}
  `;
  return (rows[0] as ComentarioRow) ?? null;
}

export async function create(reporteId: number, usuarioId: number, data: CrearComentarioDTO): Promise<ComentarioRow> {
  const rows = await sql`
    INSERT INTO comentarios (reporte_id, usuario_id, comentario)
    VALUES (${reporteId}, ${usuarioId}, ${data.comentario})
    RETURNING comentario_id, reporte_id, usuario_id, comentario, fecha_comentario
  `;

  const inserted = rows[0] as any;
  const autor = await sql`
    SELECT nombres, rol FROM usuarios WHERE usuario_id = ${usuarioId}
  `;

  return {
    comentario_id: inserted.comentario_id,
    reporte_id: inserted.reporte_id,
    usuario_id: inserted.usuario_id,
    autor_nombre: (autor[0] as any).nombres,
    autor_rol: (autor[0] as any).rol,
    comentario: inserted.comentario,
    fecha_comentario: inserted.fecha_comentario,
  };
}

export async function update(id: number, data: ActualizarComentarioDTO): Promise<ComentarioRow | null> {
  await sql`
    UPDATE comentarios SET comentario = ${data.comentario}
    WHERE comentario_id = ${id}
  `;
  return findById(id);
}

export async function remove(id: number): Promise<void> {
  await sql`DELETE FROM comentarios WHERE comentario_id = ${id}`;
}