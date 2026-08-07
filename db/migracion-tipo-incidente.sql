-- Permite el tipo 'incidente' (nuevo default del wizard) en la columna tipo_reporte.
-- Antes: los nuevos reportes sin tipo fallaban por el CHECK constraint (500 en producción).
ALTER TABLE reportes DROP CONSTRAINT IF EXISTS reportes_tipo_reporte_check;
ALTER TABLE reportes
  ADD CONSTRAINT reportes_tipo_reporte_check
  CHECK (tipo_reporte::text = ANY (ARRAY['queja','sugerencia','felicitacion','peticion','incidente']::text[]));

-- Renombra los reportes existentes tipo 'queja' al nuevo tipo 'incidente'.
UPDATE reportes SET tipo_reporte = 'incidente' WHERE tipo_reporte = 'queja';

