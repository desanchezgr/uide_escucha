import { sql } from '../config/database';

export interface UsuarioAuth {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: string;
}

export interface EstudianteHabilitado {
  cedula: string;
  nombres: string;
}

export interface PersonalHabilitado {
  email: string;
  nombres: string;
  rol: string;
}

export async function findUsuarioByEmail(email: string): Promise<UsuarioAuth | undefined> {
  const rows = await sql`
    SELECT 
      u.usuario_id AS id, 
      u.nombres AS nombre, 
      a.email_institucional AS email, 
      a.password, 
      u.rol 
    FROM autenticacion a
    INNER JOIN usuarios u ON a.usuario_id = u.usuario_id
    WHERE a.email_institucional = ${email}
  `;
  return rows[0] as UsuarioAuth | undefined;
}

export async function findEmailExists(email: string): Promise<boolean> {
  const rows = await sql`
    SELECT auth_id FROM autenticacion WHERE email_institucional = ${email}
  `;
  return rows.length > 0;
}

export async function findEstudianteByCedula(cedula: string): Promise<EstudianteHabilitado | undefined> {
  const rows = await sql`
    SELECT cedula, nombres FROM estudiantes_habilitados WHERE cedula = ${cedula}
  `;
  return rows[0] as EstudianteHabilitado | undefined;
}

export async function findCedulaExistsConPassword(cedula: string): Promise<boolean> {
  const rows = await sql`
    SELECT u.usuario_id FROM usuarios u
    INNER JOIN autenticacion a ON u.usuario_id = a.usuario_id
    WHERE u.cedula = ${cedula}
      AND a.password IS NOT NULL
  `;
  return rows.length > 0;
}

export async function findCedulaExistsEnUsuarios(cedula: string): Promise<boolean> {
  const rows = await sql`
    SELECT u.usuario_id FROM usuarios u
    INNER JOIN autenticacion a ON u.usuario_id = a.usuario_id
    WHERE u.cedula = ${cedula}
  `;
  return rows.length > 0;
}

export async function findUsuarioIdByCedula(cedula: string): Promise<number | null> {
  const rows = await sql`
    SELECT usuario_id FROM usuarios WHERE cedula = ${cedula}
  `;
  return rows[0]?.usuario_id ?? null;
}

export async function findUsuarioIdByNombreYRol(nombres: string, rol: string): Promise<number | null> {
  const rows = await sql`
    SELECT u.usuario_id FROM usuarios u
    LEFT JOIN autenticacion a ON u.usuario_id = a.usuario_id
    WHERE u.nombres = ${nombres} AND u.rol = ${rol} AND u.cedula IS NULL
      AND a.usuario_id IS NULL
    LIMIT 1
  `;
  return rows[0]?.usuario_id ?? null;
}

export async function findUsuarioByCedula(cedula: string): Promise<UsuarioAuth | undefined> {
  const rows = await sql`
    SELECT 
      u.usuario_id AS id, 
      u.nombres || ' ' || u.apellidos AS nombre,
      COALESCE(a.email_institucional, '') AS email,
      COALESCE(a.password, '') AS password,
      u.rol
    FROM usuarios u
    LEFT JOIN autenticacion a ON u.usuario_id = a.usuario_id
    WHERE u.cedula = ${cedula}
  `;
  return rows[0] as UsuarioAuth | undefined;
}

export async function findPersonalByEmail(email: string): Promise<PersonalHabilitado | undefined> {
  const rows = await sql`
    SELECT email, nombres, rol FROM personal_habilitado WHERE email = ${email}
  `;
  return rows[0] as PersonalHabilitado | undefined;
}

export async function findEmailExistsConPassword(email: string): Promise<boolean> {
  const rows = await sql`
    SELECT usuario_id FROM autenticacion
    WHERE email_institucional = ${email}
      AND password IS NOT NULL
  `;
  return rows.length > 0;
}

export async function findEmailExistsEnUsuarios(email: string): Promise<boolean> {
  const rows = await sql`
    SELECT usuario_id FROM autenticacion WHERE email_institucional = ${email}
  `;
  return rows.length > 0;
}

export async function findUsuarioIdByEmail(email: string): Promise<number | null> {
  const rows = await sql`
    SELECT usuario_id FROM autenticacion WHERE email_institucional = ${email}
  `;
  return rows[0]?.usuario_id ?? null;
}

export async function insertUsuario(nombres: string, apellidos: string, cedula: string | null, rol: string, sedeId: number): Promise<number> {
  const userResult = await sql`
    INSERT INTO usuarios (sede_id, nombres, apellidos, cedula, rol)
    VALUES (${sedeId}, ${nombres}, ${apellidos}, ${cedula}, ${rol})
    RETURNING usuario_id
  `;
  return userResult[0].usuario_id;
}

export async function insertAutenticacion(usuarioId: number, email: string, hashedPassword: string, emailRecuperacion?: string): Promise<void> {
  await sql`
    INSERT INTO autenticacion (usuario_id, email_institucional, password, email_recuperacion)
    VALUES (${usuarioId}, ${email}, ${hashedPassword}, ${emailRecuperacion || null})
    ON CONFLICT (usuario_id) DO UPDATE SET
      email_institucional = EXCLUDED.email_institucional,
      password = EXCLUDED.password,
      email_recuperacion = COALESCE(EXCLUDED.email_recuperacion, autenticacion.email_recuperacion)
  `;
}
