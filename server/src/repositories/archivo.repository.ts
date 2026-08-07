import { sql } from '../config/database';

export interface ArchivoReporte {
  archivo_id: number;
  reporte_id: number;
  nombre_archivo: string;
  ruta_archivo: string;
  tipo_archivo: 'imagen' | 'pdf';
  fecha_subida: string;
}

export async function crearArchivo(
  reporteId: number,
  nombreOriginal: string,
  rutaGuardado: string,
  tipo: 'imagen' | 'documento' | 'pdf' = 'imagen'
): Promise<ArchivoReporte> {
  const rows = await sql`
    INSERT INTO archivos_reporte (reporte_id, nombre_archivo, ruta_archivo, tipo_archivo)
    VALUES (${reporteId}, ${nombreOriginal}, ${rutaGuardado}, ${tipo})
    RETURNING archivo_id, reporte_id, nombre_archivo, ruta_archivo, tipo_archivo, fecha_subida
  `;
  return rows[0] as ArchivoReporte;
}

export async function findArchivosByReporteId(reporteId: number): Promise<ArchivoReporte[]> {
  const rows = await sql`
    SELECT archivo_id, reporte_id, nombre_archivo, ruta_archivo, tipo_archivo, fecha_subida
    FROM archivos_reporte
    WHERE reporte_id = ${reporteId}
    ORDER BY fecha_subida ASC
  `;
  return rows as ArchivoReporte[];
}

export async function eliminarArchivosByReporteId(reporteId: number): Promise<void> {
  await sql`DELETE FROM archivos_reporte WHERE reporte_id = ${reporteId}`;
}

export interface ArchivoComentario {
  archivo_id: number;
  comentario_id: number;
  nombre_archivo: string;
  ruta_archivo: string;
  tipo_archivo: string;
  fecha_subida: string;
}

export async function crearArchivoComentario(
  comentarioId: number,
  nombreOriginal: string,
  rutaGuardado: string,
  tipo: 'imagen' | 'documento' | 'pdf' = 'imagen'
): Promise<ArchivoComentario> {
  const rows = await sql`
    INSERT INTO archivos_comentario (comentario_id, nombre_archivo, ruta_archivo, tipo_archivo)
    VALUES (${comentarioId}, ${nombreOriginal}, ${rutaGuardado}, ${tipo})
    RETURNING archivo_id, comentario_id, nombre_archivo, ruta_archivo, tipo_archivo, fecha_subida
  `;
  return rows[0] as ArchivoComentario;
}

export async function findArchivosByComentarioId(comentarioId: number): Promise<ArchivoComentario[]> {
  const rows = await sql`
    SELECT archivo_id, comentario_id, nombre_archivo, ruta_archivo, tipo_archivo, fecha_subida
    FROM archivos_comentario
    WHERE comentario_id = ${comentarioId}
    ORDER BY fecha_subida ASC
  `;
  return rows as ArchivoComentario[];
}
