import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as authRepo from '../repositories/auth.repository';
import * as usuarioRepo from '../repositories/usuario.repository';
import * as mfaRepo from '../repositories/mfa.repository';
import { sendEmailVerificationEmail } from './email.service';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@uide\.edu\.ec$/;

function validateStrongPassword(password: string): void {
  if (password.length < 8) {
    throw Object.assign(new Error('La contraseña debe tener al menos 8 caracteres.'), { statusCode: 400 });
  }
  if (password.length > 64) {
    throw Object.assign(new Error('La contraseña debe tener maximo 64 caracteres.'), { statusCode: 400 });
  }
  if (!/[A-Z]/.test(password)) {
    throw Object.assign(new Error('La contraseña debe contener al menos una letra mayuscula.'), { statusCode: 400 });
  }
  if (!/[a-z]/.test(password)) {
    throw Object.assign(new Error('La contraseña debe contener al menos una letra minuscula.'), { statusCode: 400 });
  }
  if (!/\d/.test(password)) {
    throw Object.assign(new Error('La contraseña debe contener al menos un numero.'), { statusCode: 400 });
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    throw Object.assign(new Error('La contraseña debe contener al menos un caracter especial.'), { statusCode: 400 });
  }
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET no configurado o demasiado corto (mínimo 32 caracteres).');
  }
  return secret;
}

function generateToken(usuarioId: number, email: string, rol: string, extra: Record<string, any> = {}) {
  return jwt.sign(
    { sub: usuarioId, email, rol, ...extra },
    getJwtSecret(),
    { expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as any }
  );
}

function generateTempToken(usuarioId: number, email: string, rol: string) {
  return jwt.sign(
    { sub: usuarioId, email, rol, mfa_pending: true },
    getJwtSecret(),
    { expiresIn: '5m' }
  );
}

function buildResponse(usuarioId: number, email: string, rol: string, nombre: string) {
  const token = generateToken(usuarioId, email, rol);
  return { token, usuario: { id: usuarioId, nombre, rol } };
}

async function checkMfaAndRespond(usuarioId: number, email: string, rol: string, nombre: string) {
  const mfaStatus = await mfaRepo.getMfaStatus(usuarioId);
  if (mfaStatus?.enabled) {
    const tempToken = generateTempToken(usuarioId, email, rol);
    return { mfaRequired: true, tempToken, usuario: { id: usuarioId, nombre, rol } };
  }

  const onboardingNeeded = await needsOnboarding(usuarioId);
  if (onboardingNeeded) {
    const tempToken = generateTempToken(usuarioId, email, rol);
    return { onboardingRequired: true, tempToken, usuario: { id: usuarioId, nombre, rol } };
  }

  return buildResponse(usuarioId, email, rol, nombre);
}

export async function saveRecoveryEmail(usuarioId: number, email: string): Promise<void> {
  if (!email || !email.endsWith('@uide.edu.ec')) {
    throw Object.assign(new Error('El correo debe ser institucional (@uide.edu.ec).'), { statusCode: 400 });
  }

  const exists = await mfaRepo.checkRecoveryEmailExists(email);
  if (exists) {
    throw Object.assign(new Error('Este correo ya está registrado como correo de recuperación.'), { statusCode: 409 });
  }

  await mfaRepo.updateRecoveryEmail(usuarioId, email);
}

export async function needsOnboarding(usuarioId: number): Promise<boolean> {
  const mfaStatus = await mfaRepo.getMfaStatus(usuarioId);
  if (mfaStatus?.enabled) return false;
  const recoveryEmail = await mfaRepo.getRecoveryEmail(usuarioId);
  return !recoveryEmail;
}

export async function login(email: string, password: string) {
  if (!email || !password) {
    throw Object.assign(new Error('Email y contraseña son requeridos.'), { statusCode: 400 });
  }

  const usuario = await authRepo.findUsuarioByEmail(email);
  if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
    throw Object.assign(new Error('Contraseña incorrecta.'), { statusCode: 401 });
  }

  return buildResponse(usuario.id, usuario.email, usuario.rol, usuario.nombre);
}

export async function verificarCedula(cedula: string) {
  if (!cedula || cedula.length !== 10) {
    throw Object.assign(new Error('Cédula inválida.'), { statusCode: 400 });
  }

  const estudiante = await authRepo.findEstudianteByCedula(cedula);
  if (!estudiante) {
    return { encontrado: false };
  }

  const tieneCuenta = await authRepo.findCedulaExistsConPassword(cedula);

  return {
    encontrado: true,
    nombres: estudiante.nombres,
    tieneCuenta,
  };
}

// ──── Verificación de correo institucional vía magic link ────

function generateVerificationToken(cedula: string, email: string): string {
  return jwt.sign(
    { sub: cedula, email, type: 'email-verification' },
    getJwtSecret(),
    { expiresIn: '1h' }
  );
}

export async function verificarIdentidad(cedula: string, email: string) {
  if (!cedula || cedula.length !== 10) {
    throw Object.assign(new Error('Cédula inválida.'), { statusCode: 400 });
  }
  if (!email || !email.endsWith('@uide.edu.ec')) {
    throw Object.assign(new Error('El correo debe ser institucional (@uide.edu.ec).'), { statusCode: 400 });
  }

  const existe = await mfaRepo.checkRecoveryEmailExists(email);
  if (existe) {
    return { enviado: false, error: 'Este correo ya está registrado como correo de recuperación.' };
  }

  const token = generateVerificationToken(cedula, email);
  const sent = await sendEmailVerificationEmail(email, cedula, token);

  if (!sent) {
    return { enviado: true, message: 'Revisa tu bandeja de entrada. Recibirás un enlace para verificar tu identidad.' };
  }

  return { enviado: true, message: 'Revisa tu bandeja de entrada. Te enviamos un enlace de verificación.' };
}

export async function verifyEmailToken(cedula: string, token: string) {
  if (!token) {
    throw Object.assign(new Error('Token de verificación requerido.'), { statusCode: 400 });
  }

  let payload: any;
  try {
    payload = jwt.verify(token, getJwtSecret());
  } catch {
    throw Object.assign(new Error('Token inválido o expirado.'), { statusCode: 401 });
  }

  if (payload.type !== 'email-verification') {
    throw Object.assign(new Error('Token no es de verificación de correo.'), { statusCode: 400 });
  }

  if (payload.sub !== cedula) {
    throw Object.assign(new Error('El token no corresponde a esta cédula.'), { statusCode: 400 });
  }

  return { verificado: true, email: payload.email };
}

export async function registroPorCedula(cedula: string, password: string, emailRecuperacion?: string) {
  if (!cedula || !password) {
    throw Object.assign(new Error('Cédula y contraseña son requeridos.'), { statusCode: 400 });
  }
  validateStrongPassword(password);

  const estudiante = await authRepo.findEstudianteByCedula(cedula);
  if (!estudiante) {
    throw Object.assign(new Error('Cédula no encontrada en la lista de estudiantes habilitados.'), { statusCode: 404 });
  }

  const yaExisteConPassword = await authRepo.findCedulaExistsConPassword(cedula);
  if (yaExisteConPassword) {
    throw Object.assign(new Error('Ya tienes una cuenta registrada. Inicia sesión con tu cédula y contraseña.'), { statusCode: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const emailGenerado = `${cedula}@cedula.uide.edu.ec`;

  const usuarioExistente = await authRepo.findUsuarioIdByCedula(cedula);
  const nuevoUsuarioId = usuarioExistente ?? await authRepo.insertUsuario(
    estudiante.nombres, '', cedula, 'estudiante', 2
  );

  await authRepo.insertAutenticacion(nuevoUsuarioId, emailGenerado, hashedPassword, emailRecuperacion);

  const token = generateToken(nuevoUsuarioId, emailGenerado, 'estudiante');
  return { onboardingRequired: true, token, usuario: { id: nuevoUsuarioId, nombre: estudiante.nombres, rol: 'estudiante' } };
}

export async function loginPorCedula(cedula: string, password: string) {
  if (!cedula || !password) {
    throw Object.assign(new Error('Cédula y contraseña son requeridos.'), { statusCode: 400 });
  }

  const usuario = await authRepo.findUsuarioByCedula(cedula);
  if (!usuario) {
    throw Object.assign(new Error('Cédula no encontrada.'), { statusCode: 404 });
  }
  if (!usuario.password) {
    throw Object.assign(new Error('Debes registrarte primero. Crea una cuenta con tu cédula.'), { statusCode: 401 });
  }
  if (!(await bcrypt.compare(password, usuario.password))) {
    throw Object.assign(new Error('Contraseña incorrecta.'), { statusCode: 401 });
  }

  return checkMfaAndRespond(usuario.id, usuario.email, usuario.rol, usuario.nombre);
}

export async function verificarEmailAdmin(email: string) {
  if (!email) {
    throw Object.assign(new Error('Email es requerido.'), { statusCode: 400 });
  }

  if (!EMAIL_REGEX.test(email)) {
    return { error: 'El correo debe ser institucional (@uide.edu.ec).' };
  }

  const personal = await authRepo.findPersonalByEmail(email);
  if (!personal) {
    return { error: 'El correo no corresponde a un miembro del personal administrativo habilitado.' };
  }

  const tieneCuenta = await authRepo.findEmailExistsConPassword(email);

  return {
    encontrado: true,
    nombres: personal.nombres,
    rol: personal.rol,
    tieneCuenta,
  };
}

export async function registroPorEmailAdmin(email: string, password: string) {
  if (!email || !password) {
    throw Object.assign(new Error('Email y contraseña son requeridos.'), { statusCode: 400 });
  }
  validateStrongPassword(password);
  if (!EMAIL_REGEX.test(email)) {
    throw Object.assign(new Error('El correo debe ser institucional (@uide.edu.ec).'), { statusCode: 400 });
  }

  const personal = await authRepo.findPersonalByEmail(email);
  if (!personal) {
    throw Object.assign(new Error('El correo no corresponde a un miembro del personal habilitado.'), { statusCode: 404 });
  }

  const yaExisteConPassword = await authRepo.findEmailExistsConPassword(email);
  if (yaExisteConPassword) {
    throw Object.assign(new Error('Ya tienes una cuenta registrada. Inicia sesión con tu correo y contraseña.'), { statusCode: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const usuarioExistente = await authRepo.findUsuarioIdByEmail(email)
    ?? await authRepo.findUsuarioIdByNombreYRol(personal.nombres, personal.rol);
  const nuevoUsuarioId = usuarioExistente ?? await authRepo.insertUsuario(
    personal.nombres, '', null, personal.rol, 1
  );

  await authRepo.insertAutenticacion(nuevoUsuarioId, email, hashedPassword);

  return buildResponse(nuevoUsuarioId, email, personal.rol, personal.nombres);
}

export async function loginPorEmailAdmin(email: string, password: string) {
  if (!email || !password) {
    throw Object.assign(new Error('Email y contraseña son requeridos.'), { statusCode: 400 });
  }

  const usuario = await authRepo.findUsuarioByEmail(email);
  if (!usuario) {
    throw Object.assign(new Error('Correo no encontrado.'), { statusCode: 404 });
  }
  if (!usuario.password) {
    throw Object.assign(new Error('Debes registrarte primero. Crea una cuenta con tu correo.'), { statusCode: 401 });
  }
  if (!(await bcrypt.compare(password, usuario.password))) {
    throw Object.assign(new Error('Contraseña incorrecta.'), { statusCode: 401 });
  }

  return checkMfaAndRespond(usuario.id, usuario.email, usuario.rol, usuario.nombre);
}

export async function verifyMfaWithTempToken(tempToken: string, code: string) {
  if (!tempToken || !code) {
    throw Object.assign(new Error('Token y código requeridos.'), { statusCode: 400 });
  }

  let payload: any;
  try {
    payload = jwt.verify(tempToken, getJwtSecret());
  } catch {
    throw Object.assign(new Error('Token temporal inválido o expirado.'), { statusCode: 401 });
  }

  if (!payload.mfa_pending) {
    throw Object.assign(new Error('Token no es de verificación MFA.'), { statusCode: 400 });
  }

  const { validateTotp } = await import('./mfa.service');
  const isValid = await validateTotp(payload.sub, code);
  if (!isValid) {
    throw Object.assign(new Error('Código de verificación inválido.'), { statusCode: 401 });
  }

  const { findUsuarioByEmail } = await import('../repositories/auth.repository');
  const usuario = await findUsuarioByEmail(payload.email);
  if (!usuario) {
    throw Object.assign(new Error('Usuario no encontrado.'), { statusCode: 404 });
  }

  return buildResponse(usuario.id, usuario.email, usuario.rol, usuario.nombre);
}

export async function obtenerPerfil(usuarioId: number) {
  const usuario = await usuarioRepo.findById(usuarioId);
  if (!usuario) {
    throw Object.assign(new Error('Usuario no encontrado.'), { statusCode: 404 });
  }
  return usuario;
}

export async function cambiarContrasenia(usuarioId: number, currentPassword: string, newPassword: string) {
  if (!currentPassword || !newPassword) {
    throw Object.assign(new Error('Contraseña actual y nueva son requeridas.'), { statusCode: 400 });
  }
  validateStrongPassword(newPassword);

  const { sql } = await import('../config/database');
  const authRows = await sql`
    SELECT password FROM autenticacion WHERE usuario_id = ${usuarioId}
  `;
  if (!authRows[0]) {
    throw Object.assign(new Error('No hay método de autenticación configurado.'), { statusCode: 400 });
  }

  const valid = await bcrypt.compare(currentPassword, authRows[0].password);
  if (!valid) {
    throw Object.assign(new Error('La contraseña actual es incorrecta.'), { statusCode: 401 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await usuarioRepo.updatePassword(usuarioId, hashedPassword);
}
