export const URGENCIA_META = {
  critica: { label: "Crítica", fg: "#ba1a1a", bg: "#fdecea", icon: "report" },
  alta: { label: "Alta", fg: "#d97706", bg: "#fff4e5", icon: "priority_high" },
  media: { label: "Media", fg: "#785900", bg: "#FFF4CC", icon: "signal_cellular_alt" },
  baja: { label: "Baja", fg: "#1f7a3f", bg: "#e8f7ed", icon: "arrow_downward" },
};

export function getUrgencia(urgencia) {
  return URGENCIA_META[urgencia] || URGENCIA_META.media;
}

const CLASIFICACION_LABELS = {
  general: "General",
  tecnologia: "Tecnología",
  biblioteca: "Biblioteca",
  limpieza: "Limpieza",
  infraestructura: "Infraestructura",
  administrativo: "Administrativo",
  bienestar: "Bienestar",
  financiero: "Financiero",
  seguridad: "Seguridad",
  academico: "Académico",
  alimentacion: "Alimentación",
};

export function clasificacionLabel(clasificacion) {
  if (!clasificacion) return null;
  return CLASIFICACION_LABELS[String(clasificacion).toLowerCase()] || clasificacion;
}
