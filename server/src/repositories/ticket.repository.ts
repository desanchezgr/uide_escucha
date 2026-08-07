import { sql } from '../config/database';
import { CrearTicketDTO, ActualizarTicketDTO } from '../schemas/ticket.schema';

const BASE_QUERY = `
  SELECT 
    r.reporte_id AS id, 
    r.titulo, 
    r.descripcion, 
    r.tipo_reporte AS tipo, 
    r.area,
    r.estado, 
    r.fecha_creacion AS creado_en,
    r.emocion,
    r.clasificacion,
    r.urgencia,
    r.zona,
    r.resuelto_por,
    r.fecha_resolucion,
    r.fecha_actualizacion AS actualizado_en,
    u.usuario_id AS autor_id,
    u.nombres AS autor_nombre
  FROM reportes r
  JOIN usuarios u ON u.usuario_id = r.solicitado_por
`;

export interface FiltrosTickets {
  page?: number;
  limit?: number;
  todos?: boolean;
  estado?: string;
  clasificacion?: string;
  urgencia?: string;
  tipo?: string;
  area?: string;
  autorId?: number;
  autor?: string;
  resueltoPor?: string;
  desde?: string;
  hasta?: string;
  campoFecha?: 'creacion' | 'actualizacion';
  mesAnio?: string;
  busqueda?: string;
  orden?: string;
  direccion?: 'asc' | 'desc';
}

const ORDEN_EXPR: Record<string, string> = {
  fecha: 'sub.creado_en',
  actualizacion: 'sub.actualizado_en',
  titulo: 'sub.titulo',
  area: 'sub.area',
  estado:
    "CASE sub.estado WHEN 'pendiente' THEN 1 WHEN 'en_proceso' THEN 2 WHEN 'resuelto' THEN 3 WHEN 'rechazado' THEN 4 ELSE 5 END",
  urgencia:
    "CASE sub.urgencia WHEN 'critica' THEN 1 WHEN 'alta' THEN 2 WHEN 'media' THEN 3 WHEN 'baja' THEN 4 ELSE 5 END",
};

export async function findById(id: number) {
  const rows = await sql`SELECT * FROM (${sql.unsafe(BASE_QUERY)}) sub WHERE sub.id = ${id}`;
  return rows[0] ?? null;
}

export async function listar(filtros: FiltrosTickets = {}) {
  const page = Math.max(1, Number(filtros.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(filtros.limit) || 10));

  const conds: string[] = [];
  const values: any[] = [];

  const addCond = (cond: string, value: any) => {
    values.push(value);
    conds.push(cond.replace('$n', `$${values.length}`));
  };

  if (filtros.autorId) addCond('sub.autor_id = $n', filtros.autorId);
  if (filtros.estado) addCond('sub.estado = $n', filtros.estado);
  if (filtros.tipo) addCond('sub.tipo = $n', filtros.tipo);
  if (filtros.clasificacion) addCond('LOWER(sub.clasificacion) = LOWER($n)', filtros.clasificacion);
  if (filtros.urgencia) addCond('sub.urgencia = $n', filtros.urgencia);
  if (filtros.area) addCond('sub.area = $n', filtros.area);
  if (filtros.autor) {
    values.push(`%${filtros.autor}%`);
    conds.push(`sub.autor_nombre ILIKE $${values.length}`);
  }
  if (filtros.resueltoPor) {
    values.push(`%${filtros.resueltoPor}%`);
    conds.push(`sub.resuelto_por ILIKE $${values.length}`);
  }

  const fechaCol = filtros.campoFecha === 'actualizacion' ? 'sub.actualizado_en' : 'sub.creado_en';
  if (filtros.desde) addCond(`${fechaCol} >= $n`, filtros.desde);
  if (filtros.hasta) addCond(`${fechaCol} <= $n`, filtros.hasta);
  if (filtros.mesAnio) {
    const [y, m] = String(filtros.mesAnio).split('-');
    if (y && m) {
      values.push(`${y}-${m}-01`);
      conds.push(`sub.creado_en >= date_trunc('month', $${values.length}::date)`);
      values.push(`${y}-${m}-01`);
      conds.push(`sub.creado_en < date_trunc('month', $${values.length}::date) + interval '1 month'`);
    }
  }
  if (filtros.busqueda) {
    values.push(`%${filtros.busqueda}%`);
    conds.push(
      `(sub.titulo ILIKE $${values.length} OR sub.descripcion ILIKE $${values.length} OR sub.autor_nombre ILIKE $${values.length} OR sub.id::text ILIKE $${values.length})`
    );
  }

  const whereClause = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const base = `(${BASE_QUERY}) sub ${whereClause}`;

  const [totalRow] = await sql.query(`SELECT COUNT(*)::int AS total FROM ${base}`, values);
  const total = totalRow?.total ?? 0;

  const porEstado = { pendiente: 0, en_proceso: 0, resuelto: 0, rechazado: 0 };
  const estadoRows = await sql.query(
    `SELECT sub.estado, COUNT(*)::int AS n FROM ${base} GROUP BY sub.estado`,
    values
  );
  for (const r of estadoRows) {
    if (r.estado && Object.prototype.hasOwnProperty.call(porEstado, r.estado)) {
      porEstado[r.estado as keyof typeof porEstado] = r.n;
    }
  }

  const ordenExpr = ORDEN_EXPR[filtros.orden || 'fecha'] || ORDEN_EXPR.fecha;
  const direccion = String(filtros.direccion || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  let data: any[];
  if (filtros.todos) {
    data = await sql.query(`SELECT * FROM ${base} ORDER BY ${ordenExpr} ${direccion}`, values);
  } else {
    values.push(limit);
    values.push((page - 1) * limit);
    data = await sql.query(
      `SELECT * FROM ${base} ORDER BY ${ordenExpr} ${direccion} LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
  }

  return { data, total, page, totalPages: Math.max(1, Math.ceil(total / limit)), porEstado };
}

export async function findForMapaCalor() {
  return sql`
    SELECT
      z.zona_id AS id,
      z.nombre,
      z.edificio,
      z.x,
      z.y,
      z.z,
      COUNT(r.reporte_id)::int AS total
    FROM zonas z
    LEFT JOIN reportes r ON r.zona = z.nombre
    GROUP BY z.zona_id, z.nombre, z.edificio, z.x, z.y, z.z
    ORDER BY z.zona_id
  `;
}

export async function findForHeatmap() {
  return sql`
    SELECT
      COALESCE(r.area, 'sin_asignar') AS zona,
      COUNT(r.reporte_id)::int AS total,
      COUNT(r.reporte_id) FILTER (WHERE r.estado = 'pendiente')::int AS pendientes,
      COUNT(r.reporte_id) FILTER (WHERE r.estado = 'en_proceso')::int AS en_proceso,
      COUNT(r.reporte_id) FILTER (WHERE r.estado = 'resuelto')::int AS resueltos
    FROM reportes r
    WHERE r.estado = 'pendiente' OR r.estado = 'en_proceso'
    GROUP BY r.area
    ORDER BY total DESC
  `;
}

export async function create(data: CrearTicketDTO, usuarioId: number) {
  const rows = await sql`
    INSERT INTO reportes (titulo, descripcion, tipo_reporte, area, emocion, sede_id, solicitado_por, clasificacion, urgencia, zona) 
    VALUES (${data.titulo || ''}, ${data.descripcion}, ${data.tipo}, ${data.area}, ${data.emocion}, 1, ${usuarioId}, ${data.clasificacion || 'general'}, ${data.urgencia || 'media'}, ${data.zona || null})
    RETURNING reporte_id AS id, titulo, descripcion, tipo_reporte AS tipo, area, estado, emocion, fecha_creacion AS creado_en, clasificacion, urgencia, zona
  `;
  return rows[0];
}

export async function update(id: number, data: ActualizarTicketDTO & { resuelto_por?: string | null; fecha_resolucion?: string }) {
  const entradas = Object.entries(data).filter(([, v]) => v !== undefined);
  if (entradas.length === 0) return findById(id);

  const allowedColumns: Record<string, string> = {
    titulo: 'titulo',
    descripcion: 'descripcion',
    tipo: 'tipo_reporte',
    estado: 'estado',
    emocion: 'emocion',
    area: 'area',
    zona: 'zona',
    clasificacion: 'clasificacion',
    urgencia: 'urgencia',
    resuelto_por: 'resuelto_por',
    fecha_resolucion: 'fecha_resolucion',
  };

  const validEntries = entradas.filter(([k]) => allowedColumns[k]);
  if (validEntries.length === 0) return findById(id);

  const setClauses = validEntries.map(([k, v], i) => `${allowedColumns[k]} = $${i + 1}`);
  const values = validEntries.map(([, v]) => v);

  await sql.query(
    `UPDATE reportes SET ${setClauses.join(', ')} WHERE reporte_id = $${validEntries.length + 1}`,
    [...values, id]
  );
  return findById(id);
}

export async function getStats(usuarioId?: number) {
  if (usuarioId) {
    const rows = await sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE estado = 'pendiente')::int AS pendientes,
        COUNT(*) FILTER (WHERE estado = 'en_proceso')::int AS "enProceso",
        COUNT(*) FILTER (WHERE estado = 'resuelto')::int AS resueltos,
        COUNT(*) FILTER (WHERE estado = 'rechazado')::int AS rechazados,
        ROUND(COUNT(*) FILTER (WHERE estado = 'resuelto') * 100.0 / NULLIF(COUNT(*), 0))::int AS resueltos_pct,
        COUNT(*) FILTER (WHERE fecha_creacion >= date_trunc('month', CURRENT_DATE))::int AS este_mes,
        COALESCE(COUNT(*) FILTER (WHERE urgencia IN ('critica', 'alta'))::int, 0) AS urgentes,
        COALESCE(COUNT(DISTINCT clasificacion)::int, 0) AS clasificaciones
      FROM reportes
      WHERE solicitado_por = ${usuarioId}
    `;
    return rows[0] ?? { total: 0, pendientes: 0, enProceso: 0, resueltos: 0, rechazados: 0, resueltos_pct: 0, este_mes: 0, urgentes: 0, clasificaciones: 0 };
  }
  const rows = await sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE estado = 'pendiente')::int AS pendientes,
      COUNT(*) FILTER (WHERE estado = 'en_proceso')::int AS "enProceso",
      COUNT(*) FILTER (WHERE estado = 'resuelto')::int AS resueltos,
      COUNT(*) FILTER (WHERE estado = 'rechazado')::int AS rechazados,
      ROUND(COUNT(*) FILTER (WHERE estado = 'resuelto') * 100.0 / NULLIF(COUNT(*), 0))::int AS resueltos_pct,
      COUNT(*) FILTER (WHERE fecha_creacion >= date_trunc('month', CURRENT_DATE))::int AS este_mes,
      COALESCE(COUNT(*) FILTER (WHERE urgencia IN ('critica', 'alta'))::int, 0) AS urgentes,
      COALESCE(COUNT(DISTINCT clasificacion)::int, 0) AS clasificaciones
    FROM reportes
  `;
  return rows[0] ?? { total: 0, pendientes: 0, enProceso: 0, resueltos: 0, rechazados: 0, resueltos_pct: 0, este_mes: 0, urgentes: 0, clasificaciones: 0 };
}

export async function remove(id: number) {
  await sql`DELETE FROM reportes WHERE reporte_id = ${id}`;
}
