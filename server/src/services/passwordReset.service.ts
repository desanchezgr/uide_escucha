import crypto from 'crypto';
import bcrypt from 'bcrypt';
import * as resetRepo from '../repositories/passwordReset.repository';
import * as usuarioRepo from '../repositories/usuario.repository';
import * as mfaRepo from '../repositories/mfa.repository';
import * as authRepo from '../repositories/auth.repository';
import { sendPasswordResetEmail } from './email.service';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function forgotPassword(email: string): Promise<{ sent: boolean; message: string }> {
  if (!email || !email.endsWith('@uide.edu.ec')) {
    return { sent: false, message: 'El correo debe ser institucional (@uide.edu.ec).' };
  }

  const usuarioId = await resetRepo.findUsuarioIdByEmail(email);
  if (!usuarioId) {
    return { sent: false, message: 'No hay una cuenta asociada a este correo institucional.' };
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await resetRepo.createToken(usuarioId, tokenHash, expiresAt);

  const emailSent = await sendPasswordResetEmail(email, token);
  if (!emailSent) {
    return { sent: true, message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.' };
  }

  return { sent: true, message: 'Revisa tu bandeja de entrada. Recibirás un enlace para restablecer tu contraseña.' };
}

export async function forgotPasswordByCedula(cedula: string): Promise<{ sent: boolean; message: string }> {
  if (!cedula || cedula.length !== 10) {
    return { sent: false, message: 'Cédula inválida.' };
  }

  const usuario = await authRepo.findUsuarioByCedula(cedula);
  if (!usuario || !usuario.email) {
    return { sent: false, message: 'No hay una cuenta asociada a esta cédula.' };
  }

  const recoveryEmail = await mfaRepo.getRecoveryEmail(usuario.id);
  const targetEmail = recoveryEmail || usuario.email;

  if (!targetEmail || !targetEmail.includes('@')) {
    return { sent: false, message: 'No se encontró un correo de recuperación asociado. Contacta a soporte.' };
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await resetRepo.createToken(usuario.id, tokenHash, expiresAt);

  const emailSent = await sendPasswordResetEmail(targetEmail, token);
  if (!emailSent) {
    return { sent: true, message: 'Si la cédula está registrada, recibirás un enlace en tu correo de recuperación.' };
  }

  return { sent: true, message: 'Revisa tu bandeja de entrada. Recibirás un enlace para restablecer tu contraseña.' };
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  if (!token) {
    throw Object.assign(new Error('Token de restablecimiento requerido.'), { statusCode: 400 });
  }

  const tokenHash = hashToken(token);
  const resetToken = await resetRepo.findValidToken(tokenHash);
  if (!resetToken) {
    throw Object.assign(new Error('Token inválido o expirado.'), { statusCode: 400 });
  }

  if (newPassword.length < 8) {
    throw Object.assign(new Error('La contraseña debe tener al menos 8 caracteres.'), { statusCode: 400 });
  }
  if (newPassword.length > 64) {
    throw Object.assign(new Error('La contraseña debe tener máximo 64 caracteres.'), { statusCode: 400 });
  }
  if (!/[A-Z]/.test(newPassword)) {
    throw Object.assign(new Error('La contraseña debe contener al menos una letra mayúscula.'), { statusCode: 400 });
  }
  if (!/[a-z]/.test(newPassword)) {
    throw Object.assign(new Error('La contraseña debe contener al menos una letra minúscula.'), { statusCode: 400 });
  }
  if (!/\d/.test(newPassword)) {
    throw Object.assign(new Error('La contraseña debe contener al menos un número.'), { statusCode: 400 });
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)) {
    throw Object.assign(new Error('La contraseña debe contener al menos un caracter especial.'), { statusCode: 400 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await usuarioRepo.updatePassword(resetToken.usuario_id, hashedPassword);
  await resetRepo.markTokenAsUsed(resetToken.id);
  await resetRepo.invalidateUserTokens(resetToken.usuario_id);
}
