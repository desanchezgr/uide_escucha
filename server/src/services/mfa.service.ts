import { generateSecret, generate, verify, generateURI } from 'otplib';
import QRCode from 'qrcode';
import * as mfaRepo from '../repositories/mfa.repository';

export async function generateSetupData(usuarioId: number, email: string) {
  const secret = generateSecret();
  await mfaRepo.updateMfaSecret(usuarioId, secret);

  const issuer = 'UIDE Escucha';
  const otpauth = generateURI({ issuer, label: email, secret } as any);

  const qrCode = await QRCode.toDataURL(otpauth, {
    width: 300,
    margin: 2,
    color: { dark: '#1c1c1c', light: '#ffffff' },
  });

  const backupCodes = Array.from({ length: 10 }, () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  });

  return {
    secret,
    qrCode,
    backupCodes,
  };
}

export async function verifySetup(usuarioId: number, token: string, backupCodes: string[]) {
  const mfaData = await mfaRepo.findMfaByUsuarioId(usuarioId);
  if (!mfaData?.mfa_secret) {
    throw Object.assign(new Error('No hay configuración MFA pendiente.'), { statusCode: 400 });
  }

  const isValid = await verify({ token, secret: mfaData.mfa_secret });
  if (!isValid) {
    throw Object.assign(new Error('Código de verificación inválido.'), { statusCode: 400 });
  }

  await mfaRepo.enableMfa(usuarioId, backupCodes);
}

export async function validateTotp(usuarioId: number, token: string): Promise<boolean> {
  const mfaData = await mfaRepo.findMfaByUsuarioId(usuarioId);
  if (!mfaData?.mfa_enabled || !mfaData?.mfa_secret) {
    return false;
  }

  const isValid = await verify({ token, secret: mfaData.mfa_secret });
  if (isValid) return true;

  const used = await mfaRepo.useBackupCode(usuarioId, token);
  return used;
}

export async function disableMfa(usuarioId: number, password: string, token: string) {
  const isValid = await validateTotp(usuarioId, token);
  if (!isValid) {
    throw Object.assign(new Error('Código de verificación inválido.'), { statusCode: 400 });
  }

  await mfaRepo.disableMfa(usuarioId);
}

export async function getStatus(usuarioId: number) {
  const status = await mfaRepo.getMfaStatus(usuarioId);
  if (!status) {
    return { enabled: false, verified: false, hasBackupCodes: false };
  }
  const hasCodes = await mfaRepo.hasBackupCodes(usuarioId);
  return {
    enabled: status.enabled,
    verified: status.verified,
    hasBackupCodes: hasCodes,
  };
}

export async function getRecoveryEmail(usuarioId: number): Promise<string | null> {
  return mfaRepo.getRecoveryEmail(usuarioId);
}
