import { sql } from '../config/database';

export async function createToken(usuarioId: number, tokenHash: string, expiresAt: Date): Promise<void> {
  await sql`
    INSERT INTO password_reset_tokens (usuario_id, token_hash, expires_at)
    VALUES (${usuarioId}, ${tokenHash}, ${expiresAt.toISOString()})
  `;
}

export async function findValidToken(tokenHash: string): Promise<{ id: number; usuario_id: number } | undefined> {
  const rows = await sql`
    SELECT id, usuario_id
    FROM password_reset_tokens
    WHERE token_hash = ${tokenHash}
      AND usado = FALSE
      AND expires_at > NOW()
    ORDER BY creado_en DESC
    LIMIT 1
  `;
  return rows[0] as any;
}

export async function markTokenAsUsed(tokenId: number): Promise<void> {
  await sql`
    UPDATE password_reset_tokens SET usado = TRUE WHERE id = ${tokenId}
  `;
}

export async function invalidateUserTokens(usuarioId: number): Promise<void> {
  await sql`
    UPDATE password_reset_tokens SET usado = TRUE WHERE usuario_id = ${usuarioId} AND usado = FALSE
  `;
}

export async function findUsuarioIdByEmail(email: string): Promise<number | null> {
  const rows = await sql`
    SELECT u.usuario_id FROM usuarios u
    INNER JOIN autenticacion a ON u.usuario_id = a.usuario_id
    WHERE (a.email_institucional = ${email} OR a.email_recuperacion = ${email})
      AND u.activo = TRUE
  `;
  return rows[0]?.usuario_id ?? null;
}
