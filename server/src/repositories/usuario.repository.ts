import { sql } from '../config/database';

export async function findById(usuarioId: number) {
  const rows = await sql`
    SELECT 
      u.usuario_id AS id,
      u.nombres,
      u.apellidos,
      u.cedula,
      u.rol,
      COALESCE(a.email_institucional, '') AS email,
      COALESCE(a.email_recuperacion, '') AS email_recuperacion
    FROM usuarios u
    LEFT JOIN autenticacion a ON u.usuario_id = a.usuario_id
    WHERE u.usuario_id = ${usuarioId}
  `;
  return rows[0] ?? null;
}

export async function updatePassword(usuarioId: number, newHashedPassword: string) {
  await sql`
    UPDATE autenticacion SET password = ${newHashedPassword}
    WHERE usuario_id = ${usuarioId}
  `;
}

export async function findAllAdmins() {
  const adminRoles = ['admin', 'prorector', 'ti_soporte', 'bibliotecario', 'conserje', 'mantenimiento', 'secretaria', 'bienestar_universitario', 'financiero'];
  const rows = await sql`
    SELECT usuario_id AS id, rol
    FROM usuarios
    WHERE rol = ANY(${adminRoles})
  `;
  return rows;
}

export async function findByRol(rol: string) {
  const rows = await sql`
    SELECT usuario_id AS id
    FROM usuarios
    WHERE rol = ${rol}
  `;
  return rows;
}
