-- Reset TODAS las contraseñas para forzar re-registro
-- Cualquier persona que ingrese lo hace como si fuera la primera vez
-- Los usuarios, reportes y comentarios se conservan intactos

DELETE FROM autenticacion;

-- Nota: todos los usuarios deberan pasar por el flujo de registro
-- nuevamente (cedula o correo) para crear una contraseña que cumpla:
--   - Minimo 8 caracteres
--   - Maximo 64 caracteres
--   - Una letra mayuscula
--   - Una letra minuscula
--   - Un numero
--   - Un caracter especial

