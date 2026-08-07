-- Reset total de todos los usuarios del sistema
-- Obliga a que TODOS (estudiantes y administradores) tengan que
-- crear una nueva contraseña y completar onboarding

-- 1. Permitir password NULL
ALTER TABLE autenticacion ALTER COLUMN password DROP NOT NULL;

-- 2. Limpiar contraseñas, MFA y recovery emails
UPDATE autenticacion
SET
  password = NULL,
  mfa_secret = NULL,
  mfa_enabled = FALSE,
  mfa_verified = FALSE,
  backup_codes = NULL,
  email_recuperacion = NULL;

-- 3. Invalida todos los tokens de restablecimiento pendientes
UPDATE password_reset_tokens
SET usado = TRUE
WHERE usado = FALSE;
