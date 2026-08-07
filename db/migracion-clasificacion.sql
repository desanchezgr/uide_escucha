ALTER TABLE reportes
  ADD COLUMN IF NOT EXISTS clasificacion VARCHAR(60),
  ADD COLUMN IF NOT EXISTS urgencia VARCHAR(20) DEFAULT 'media',
  ADD COLUMN IF NOT EXISTS zona VARCHAR(120),
  ADD COLUMN IF NOT EXISTS resuelto_por VARCHAR(60),
  ADD COLUMN IF NOT EXISTS fecha_resolucion TIMESTAMP;

ALTER TABLE reportes ALTER COLUMN tipo_reporte SET DEFAULT 'incidente';

CREATE TABLE IF NOT EXISTS zonas (
  zona_id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  edificio VARCHAR(120),
  x DOUBLE PRECISION,
  y DOUBLE PRECISION,
  z DOUBLE PRECISION
);

INSERT INTO zonas (nombre, edificio, x, y, z)
VALUES
  ('Biblioteca', 'Biblioteca Central', -1.2, 0.1, 0),
  ('Auditorio', 'Auditorio Principal', 0.8, 1.2, 0),
  ('Laboratorio', 'Laboratorio de Ingeniería', 1.6, -0.4, 0),
  ('Cafetería', 'Cafetería Central', -0.4, -1.2, 0),
  ('Bloque A', 'Bloque Académico A', 2.1, 0.7, 0)
ON CONFLICT DO NOTHING;
