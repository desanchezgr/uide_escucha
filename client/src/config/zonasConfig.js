/**
 * Configuración de zonas del campus UIDE para el mapa de calor 3D.
 *
 * Los "id" deben coincidir EXACTAMENTE con los valores de la columna `area` en la tabla reportes.
 * Áreas reales en la BD: bibliotecario, conserje, ti_soporte, mantenimiento,
 * bienestar universitario, secretaria, financiero, null (sin asignar).
 *
 * Las coordenadas X/Z son APROXIMADAS y requieren calibración visual manual:
 * 1. Cargar el modelo en el componente 3D
 * 2. Activar modo debug con ejes/grid visibles
 * 3. Ajustar valores comparando contra client/public/gbl/plano_uide.jpeg
 *
 * Área total del terreno: 13,820 m² (~118m x ~117m)
 * Referencia: client/public/gbl/plano_uide.jpeg
 */
const ZONAS = [
  // ── Edificios académicos (fila A-B, parte superior) ────────────
  { id: "ti_soporte", nombre: "Soporte TI", x: -4, z: -20, match: ["ti_soporte", "soporte", "tecnologia", "informatica", "red", "equipo", "computador"] },
  { id: "secretaria", nombre: "Secretaría", x: 22, z: -4, match: ["secretaria", "secretaría", "coordinacion", "coordinación", "decano", "rectoria", "rectoría"] },
  { id: "financiero", nombre: "Financiero", x: 22, z: 4, match: ["financiero", "financiera", "factura", "pago", "matricula", "matrícula", "inscripcion", "inscripción", "certificado", "contabilidad"] },

  // ── Edificios de servicios (fila C-D) ──────────────────────────
  { id: "bibliotecario", nombre: "Biblioteca", x: -20, z: 2, match: ["bibliotecario", "biblioteca", "libro", "estudio", "investigacion", "investigación", "lectura", "academico", "académico"] },
  { id: "conserje", nombre: "Limpieza", x: 14, z: -12, match: ["conserje", "limpieza", "aseo", "barrido", "limpiez"] },
  { id: "mantenimiento", nombre: "Mantenimiento", x: -8, z: -6, match: ["mantenimiento", "reparacion", "reparación", "arreglo", "infraestructura", "electricidad", "plomeria", "plomería"] },
  { id: "bienestar universitario", nombre: "Bienestar Universitario", x: 4, z: -10, match: ["bienestar", "bienestar universitario", "psicologia", "psicológico", "apoyo", "orientacion", "orientación", "convivencia"] },

  // ── Zona general ───────────────────────────────────────────────
  { id: "sin_asignar", nombre: "Sin Asignar", x: 0, z: 10, match: [] },
];

export default ZONAS;
