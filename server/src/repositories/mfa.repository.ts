import { sql } from '../config/database';

export interface MfaData {
  mfa_secret: string | null;
  mfa_enabled: boolean;
  mfa_verified: boolean;
  backup_codes: string[] | null;
}

export async function findMfaByUsuarioId(usuarioId: number): Promise<MfaData | undefined> {
  const rows = await sql`
    SELECT mfa_secret, mfa_enabled, mfa_verified, backup_codes
    FROM autenticacion
    WHERE usuario_id = ${usuarioId}
  `;
  if (!rows[0]) return undefined;
  const row = rows[0];
  return {
    mfa_secret: row.mfa_secret,
    mfa_enabled: row.mfa_enabled,
    mfa_verified: row.mfa_verified,
    backup_codes: row.backup_codes ? JSON.parse(JSON.stringify(row.backup_codes)) : null,
  };
}

export async function updateMfaSecret(usuarioId: number, secret: string): Promise<void> {
  await sql`
    UPDATE autenticacion
    SET mfa_secret = ${secret}, mfa_enabled = FALSE, mfa_verified = FALSE, backup_codes = NULL
    WHERE usuario_id = ${usuarioId}
  `;
}

export async function enableMfa(usuarioId: number, backupCodes: string[]): Promise<void> {
  await sql`
    UPDATE autenticacion
    SET mfa_enabled = TRUE, mfa_verified = TRUE, backup_codes = ${JSON.stringify(backupCodes)}
    WHERE usuario_id = ${usuarioId}
  `;
}

export async function disableMfa(usuarioId: number): Promise<void> {
  await sql`
    UPDATE autenticacion
    SET mfa_secret = NULL, mfa_enabled = FALSE, mfa_verified = FALSE, backup_codes = NULL
    WHERE usuario_id = ${usuarioId}
  `;
}

export async function useBackupCode(usuarioId: number, code: string): Promise<boolean> {
  const rows = await sql`
    SELECT backup_codes FROM autenticacion WHERE usuario_id = ${usuarioId}
  `;
  if (!rows[0]?.backup_codes) return false;

  const codes: string[] = JSON.parse(JSON.stringify(rows[0].backup_codes));
  const index = codes.indexOf(code);
  if (index === -1) return false;

  codes.splice(index, 1);
  await sql`
    UPDATE autenticacion SET backup_codes = ${JSON.stringify(codes)}
    WHERE usuario_id = ${usuarioId}
  `;
  return true;
}

export async function getMfaStatus(usuarioId: number): Promise<{ enabled: boolean; verified: boolean } | undefined> {
  const rows = await sql`
    SELECT mfa_enabled AS enabled, mfa_verified AS verified
    FROM autenticacion WHERE usuario_id = ${usuarioId}
  `;
  return rows[0] as any;
}

export async function hasBackupCodes(usuarioId: number): Promise<boolean> {
  const rows = await sql`
    SELECT backup_codes FROM autenticacion WHERE usuario_id = ${usuarioId}
  `;
  if (!rows[0]?.backup_codes) return false;
  const codes: string[] = JSON.parse(JSON.stringify(rows[0].backup_codes));
  return codes.length > 0;
}

export async function updateRecoveryEmail(usuarioId: number, email: string): Promise<void> {
  await sql`
    UPDATE autenticacion SET email_recuperacion = ${email}
    WHERE usuario_id = ${usuarioId}
  `;
}

export async function getRecoveryEmail(usuarioId: number): Promise<string | null> {
  const rows = await sql`
    SELECT email_recuperacion FROM autenticacion WHERE usuario_id = ${usuarioId}
  `;
  return rows[0]?.email_recuperacion ?? null;
}

export async function checkRecoveryEmailExists(email: string): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM autenticacion WHERE email_recuperacion = ${email}
  `;
  return !!rows[0];
}
