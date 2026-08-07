import { useEffect, useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Chip,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Skeleton,
  Fade,
  Tooltip,
} from "@mui/material";
import { useToast } from "../context/useToast.js";
import { useReports } from "../context/useReports.js";
import CommentSection from "../components/CommentSection";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { EMOCION_LABELS, EMOCION_ICONS, EMOCION_COLORS } from "../components/emotionData.js";
import { getUrgencia, clasificacionLabel } from "../components/reportMeta.js";
import { apiFetch } from "../utils/api.js";


const ESTADOS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en_proceso", label: "En Proceso" },
  { value: "resuelto", label: "Resuelto" },
  { value: "rechazado", label: "Rechazado" },
];

const TIPOS = {
  queja: { label: "Queja", icon: "report", bg: "#fde9ef", fg: "#680036" },
  incidente: { label: "Incidente", icon: "report", bg: "#fde9ef", fg: "#680036" },
  sugerencia: { label: "Sugerencia", icon: "lightbulb", bg: "#fff5db", fg: "#785900" },
  felicitacion: { label: "Felicitación", icon: "celebration", bg: "#e8f7ed", fg: "#1f7a3f" },
  peticion: { label: "Petición", icon: "handshake", bg: "#e8eaf6", fg: "#303f9f" },
};

const AREA_LABELS = {
  ti_soporte: "Soporte TI", bibliotecario: "Biblioteca", conserje: "Limpieza",
  mantenimiento: "Mantenimiento", secretaria: "Secretaría",
  "bienestar universitario": "Bienestar", financiero: "Financiero",
};

const STATUS_META = {
  pendiente: { label: "Pendiente", dot: "#680036" },
  en_proceso: { label: "En proceso", dot: "#FCC019" },
  resuelto: { label: "Resuelto", dot: "#1f7a3f" },
  rechazado: { label: "Rechazado", dot: "#ba1a1a" },
};

const ESTADO_META = {
  pendiente: { label: "Pendiente", icon: "schedule", copy: "Tu reporte está esperando revisión." },
  en_proceso: { label: "En proceso", icon: "settings", copy: "El área responsable está revisando tu reporte." },
  resuelto: { label: "Resuelto", icon: "check_circle", copy: "Tu reporte ha sido atendido." },
  rechazado: { label: "Rechazado", icon: "cancel", copy: "El reporte no cumple con los criterios para continuar." },
};

const RANK = { pendiente: 0, en_proceso: 1, resuelto: 2, rechazado: 2 };

const ROLES_ADMIN = [
  "admin", "prorector", "ti_soporte", "bibliotecario", "conserje",
  "mantenimiento", "secretaria", "bienestar universitario", "financiero",
];

const formatDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-EC", { day: "2-digit", month: "long", year: "numeric" });
};

function StatusDot({ estado }) {
  const meta = STATUS_META[estado] || STATUS_META.pendiente;
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, px: 1.25, py: 0.55, borderRadius: 999, bgcolor: "#F0EDEF" }}>
      <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: meta.dot, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#353136", whiteSpace: "nowrap" }}>{meta.label}</Typography>
    </Box>
  );
}

function InfoRow({ icon, label, children }) {
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 17, color: "#969198" }}>{icon}</span>
        <Typography variant="caption" fontWeight={700} color="#77737A" sx={{ textTransform: "uppercase", letterSpacing: 0.6 }}>
          {label}
        </Typography>
      </Stack>
      <Box sx={{ pl: 3.25, color: "#353136", lineHeight: 1.6, fontSize: 14.5 }}>{children}</Box>
    </Box>
  );
}

function getImageUrl(ruta) {
  if (!ruta) return "";
  if (ruta.startsWith("http")) return ruta;
  if (ruta.startsWith("/")) return ruta;
  return `/${ruta}`;
}

function ImageGallery({ images }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, goNext, goPrev]);

  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }}>
        {images.map((img, index) => (
          <Box key={img.archivo_id || index}>
            <Box
              onClick={() => openLightbox(index)}
              sx={{
                width: 120,
                height: 120,
                borderRadius: "14px",
                overflow: "hidden",
                border: "1px solid #ECECEF",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#680036",
                  transform: "scale(1.03)",
                  boxShadow: "0 4px 16px rgba(104,0,54,0.16)",
                },
              }}
            >
              <Box
                component="img"
                src={getImageUrl(img.ruta_archivo)}
                alt={img.nombre_archivo}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
            <Typography variant="caption" color="#77737A" sx={{ mt: 0.5, display: "block", textAlign: "center", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {img.nombre_archivo}
            </Typography>
          </Box>
        ))}
      </Stack>

      {lightboxOpen && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            bgcolor: "rgba(24,21,26,0.94)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 0.2s ease",
            "@keyframes fadeIn": {
              "0%": { opacity: 0 },
              "100%": { opacity: 1 },
            },
          }}
          onClick={closeLightbox}
        >
          <IconButton
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            sx={{ position: "absolute", top: 16, right: 16, color: "#ffffff", bgcolor: "rgba(255,255,255,0.1)", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }}
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>close</span>
          </IconButton>

          {images.length > 1 && (
            <>
              <IconButton
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                sx={{ position: "absolute", left: 16, color: "#ffffff", bgcolor: "rgba(255,255,255,0.1)", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }}
                aria-label="Anterior"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 32 }}>chevron_left</span>
              </IconButton>
              <IconButton
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                sx={{ position: "absolute", right: 16, color: "#ffffff", bgcolor: "rgba(255,255,255,0.1)", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }}
                aria-label="Siguiente"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 32 }}>chevron_right</span>
              </IconButton>
            </>
          )}

          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{ maxWidth: "90vw", maxHeight: "85vh", display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <Box
              component="img"
              src={getImageUrl(images[currentIndex]?.ruta_archivo)}
              alt={images[currentIndex]?.nombre_archivo || "Imagen"}
              sx={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: "14px", boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}
            />
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", mt: 1.5, textAlign: "center" }}>
              {images[currentIndex]?.nombre_archivo}
              {images.length > 1 && ` (${currentIndex + 1} / ${images.length})`}
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
}

/* ---------- Estado del reporte (Estudiante) ---------- */

function StateChip({ state, current }) {
  const meta = ESTADO_META[state];
  const active = state === current;
  const done = RANK[state] < RANK[current];
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        height: 38,
        px: 1.5,
        borderRadius: 999,
        bgcolor: active ? "#FFF9E6" : "#FFFFFF",
        border: active ? "1.5px solid #FCC019" : "1px solid #ECECEF",
        boxShadow: active ? "0 0 0 3px rgba(252,192,25,0.14)" : "none",
        color: active ? "#251A00" : done ? "#353136" : "#969198",
        whiteSpace: "nowrap",
      }}
    >
      {done && !active ? (
        <Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: "#FCC019", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 11, color: "#251A00" }}>check</span>
        </Box>
      ) : (
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: active ? "#785900" : done ? "#353136" : "#C6C2C8" }}>{meta.icon}</span>
      )}
      <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>{meta.label}</Typography>
      {active && (
        <Box sx={{ ml: 0.5, px: 1, py: 0.5, borderRadius: 999, bgcolor: "#FCC019" }}>
          <Typography sx={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.5, lineHeight: 1 }}>ACTUAL</Typography>
        </Box>
      )}
    </Box>
  );
}

function Connector({ done }) {
  const c = done ? "#FCC019" : "#E4E2E6";
  return (
    <Box sx={{ position: "relative", width: 26, height: 38, mx: 0.5, flexShrink: 0 }}>
      <Box sx={{ position: "absolute", left: 0, right: 8, top: "50%", transform: "translateY(-50%)", height: 2, bgcolor: c }} />
      <span className="material-symbols-outlined" style={{ position: "absolute", right: -2, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: done ? "#785900" : "#C6C2C8" }}>chevron_right</span>
    </Box>
  );
}

function ForkConnector({ done }) {
  const c = done ? "#FCC019" : "#E4E2E6";
  return (
    <Box sx={{ position: "relative", width: 26, height: 84, mx: 0.5, flexShrink: 0 }}>
      <Box sx={{ position: "absolute", left: 0, right: "50%", top: 19, height: 2, bgcolor: c }} />
      <Box sx={{ position: "absolute", left: "50%", top: 19, width: 2, height: 46, bgcolor: c }} />
      <Box sx={{ position: "absolute", left: "50%", right: 0, top: 65, height: 2, bgcolor: c }} />
    </Box>
  );
}

function DesktopLifecycle({ current }) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.25 }}>
        <Typography variant="caption" fontWeight={700} color="#77737A" sx={{ textTransform: "uppercase", letterSpacing: 0.6 }}>Proceso</Typography>
        <Typography variant="caption" fontWeight={700} color="#77737A" sx={{ textTransform: "uppercase", letterSpacing: 0.6 }}>Resultado</Typography>
      </Stack>
      <Stack direction="row" alignItems="center">
        <StateChip state="pendiente" current={current} />
        <Connector done={RANK["pendiente"] < RANK[current]} />
        <StateChip state="en_proceso" current={current} />
        <ForkConnector done={RANK["en_proceso"] < RANK[current]} />
        <Stack spacing={0.75}>
          <StateChip state="resuelto" current={current} />
          <StateChip state="rechazado" current={current} />
        </Stack>
      </Stack>
    </Box>
  );
}

function MobileIndicator({ state, current }) {
  const meta = ESTADO_META[state];
  const active = state === current;
  const done = RANK[state] < RANK[current];
  if (active) {
    return (
      <Box sx={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid #FCC019", bgcolor: "#FFF9E6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 13, color: "#785900" }}>{meta.icon}</span>
      </Box>
    );
  }
  if (done) {
    return (
      <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: "#FCC019", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 13, color: "#251A00" }}>check</span>
      </Box>
    );
  }
  return (
    <Box sx={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid #E4E2E6", bgcolor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 13, color: "#C6C2C8" }}>{meta.icon}</span>
    </Box>
  );
}

function MobileLifecycle({ current }) {
  const RH = 36;
  const RAIL = 14;
  const label = (state) => ESTADO_META[state].label;
  return (
    <Box sx={{ display: "flex", gap: 1.5 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: 24, flexShrink: 0 }}>
        <MobileIndicator state="pendiente" current={current} />
        <Box sx={{ width: 2, height: RAIL, bgcolor: "#E4E2E6" }} />
        <MobileIndicator state="en_proceso" current={current} />
        <Box sx={{ position: "relative", width: 24, height: RH * 2 }}>
          <Box sx={{ position: "absolute", left: 11, top: 0, bottom: 0, width: 2, bgcolor: "#E4E2E6" }} />
          <Box sx={{ position: "absolute", left: 12, top: RH / 2, width: 12, height: 2, bgcolor: "#E4E2E6" }} />
          <Box sx={{ position: "absolute", left: 12, top: RH / 2 + RH, width: 12, height: 2, bgcolor: "#E4E2E6" }} />
        </Box>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, height: RH }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: RANK["pendiente"] < RANK[current] ? "#353136" : current === "pendiente" ? "#251A00" : "#77737A" }}>{label("pendiente")}</Typography>
          {current === "pendiente" && <ActBadge />}
        </Box>
        <Box sx={{ height: RAIL }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, height: RH }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: RANK["en_proceso"] < RANK[current] ? "#353136" : current === "en_proceso" ? "#251A00" : "#77737A" }}>{label("en_proceso")}</Typography>
          {current === "en_proceso" && <ActBadge />}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, height: RH }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: current === "resuelto" ? "#251A00" : "#77737A" }}>{label("resuelto")}</Typography>
          {current === "resuelto" && <ActBadge />}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, height: RH }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: current === "rechazado" ? "#251A00" : "#77737A" }}>{label("rechazado")}</Typography>
          {current === "rechazado" && <ActBadge />}
        </Box>
      </Box>
    </Box>
  );
}

function ActBadge() {
  return (
    <Box sx={{ px: 1, py: 0.5, borderRadius: 999, bgcolor: "#FCC019" }}>
      <Typography sx={{ fontSize: 8.5, fontWeight: 800, letterSpacing: 0.5, lineHeight: 1 }}>ACTUAL</Typography>
    </Box>
  );
}

function EstadoDelReporte({ report }) {
  const current = report.estado;
  const meta = ESTADO_META[current] || ESTADO_META.pendiente;
  const closed = current === "resuelto" || current === "rechazado";
  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: "20px", border: "1px solid #ECECEF", bgcolor: "#FFFFFF", p: 2.5, boxShadow: "0 1px 4px rgba(47,0,24,0.05)" }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: "10px", bgcolor: "#FFF4CC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 19, color: "#785900" }}>sync_alt</span>
        </Box>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} color="#18151A">Estado del reporte</Typography>
          <Typography variant="caption" color="#77737A">Sigue el avance de tu reporte</Typography>
        </Box>
      </Stack>

      {closed ? (
        <Box
          sx={{
            p: 2,
            borderRadius: "14px",
            bgcolor: current === "resuelto" ? "#e8f7ed" : "#fde9ef",
            border: "1px solid",
            borderColor: current === "resuelto" ? "#bfe6c8" : "#efb6c2",
            display: "flex",
            gap: 1.5,
            alignItems: "flex-start",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22, color: current === "resuelto" ? "#1f7a3f" : "#ba1a1a" }}>{meta.icon}</span>
          <Box>
            <Typography variant="body2" fontWeight={700} color="#18151A">
              {current === "resuelto" ? "Tu reporte fue resuelto" : "Este reporte fue rechazado"}
            </Typography>
            <Typography variant="caption" color="#353136" sx={{ display: "block", mt: 0.25 }}>{meta.copy}</Typography>
          </Box>
        </Box>
      ) : (
        <>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <DesktopLifecycle current={current} />
          </Box>
          <Box sx={{ display: { xs: "block", sm: "none" } }}>
            <MobileLifecycle current={current} />
          </Box>
          <Box sx={{ mt: 2.5, p: 2, borderRadius: "14px", bgcolor: "#FFF9E6", border: "1px solid #FCC019", display: "flex", gap: 1.5, alignItems: "flex-start" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#785900" }}>{meta.icon}</span>
            <Box>
              <Typography variant="body2" fontWeight={700} color="#251A00">{meta.label}</Typography>
              <Typography variant="caption" color="#353136" sx={{ display: "block", mt: 0.25 }}>{meta.copy}</Typography>
            </Box>
          </Box>
        </>
      )}
    </Paper>
  );
}

/* ---------- Gestión del reporte (Admin) ---------- */

function SummaryCell({ label, children }) {
  return (
    <Box sx={{ p: 1.25, borderRadius: "12px", bgcolor: "#F8F9FB", border: "1px solid #F0EDEF" }}>
      <Typography variant="caption" fontWeight={700} color="#77737A" sx={{ textTransform: "uppercase", letterSpacing: 0.6, fontSize: 10, display: "block", mb: 0.5 }}>{label}</Typography>
      <Box sx={{ fontSize: 13, fontWeight: 600, color: "#353136", lineHeight: 1.4 }}>{children}</Box>
    </Box>
  );
}

function GestionReporte({ report, nuevoEstado, setNuevoEstado, nuevaArea, setNuevaArea, updating, onUpdate, onDelete }) {
  const closed = report.estado === "resuelto" || report.estado === "rechazado";
  const areaLabel = report.area ? (AREA_LABELS[report.area] || report.area) : "—";
  const estadoCambio = nuevoEstado !== report.estado;
  const areaCambio = Boolean(nuevaArea) && nuevaArea !== report.area;
  const cambios = estadoCambio || areaCambio;

  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: "20px", border: "1px solid #ECECEF", bgcolor: "#FFFFFF", p: 2.5, boxShadow: "0 1px 4px rgba(47,0,24,0.05)" }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: "10px", bgcolor: "#680036", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 19, color: "#fff" }}>admin_panel_settings</span>
        </Box>
        <Box>
          <Typography variant="subtitle2" fontWeight={800} color="#18151A">Gestión del reporte</Typography>
          <Typography variant="caption" color="#77737A">Panel operativo institucional</Typography>
        </Box>
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 2 }}>
        <SummaryCell label="Estado actual">
          <StatusDot estado={report.estado} />
        </SummaryCell>
        <SummaryCell label="Área actual">{areaLabel}</SummaryCell>
      </Box>

      {closed ? (
        <Alert severity={report.estado === "resuelto" ? "success" : "error"} sx={{ borderRadius: "12px", fontWeight: 500, fontSize: 13 }}>
          {report.estado === "resuelto"
            ? "Este reporte fue resuelto y está cerrado de forma definitiva."
            : "Este reporte fue rechazado y está cerrado de forma definitiva."}
        </Alert>
      ) : (
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" fontWeight={700} color="#77737A" sx={{ textTransform: "uppercase", letterSpacing: 0.6, display: "block", mb: 1 }}>
                Cambiar estado
              </Typography>
              <TextField
                select
                size="small"
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value)}
                inputProps={{ "aria-label": "Seleccionar estado" }}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: "12px", bgcolor: "#F7F7F9", "& fieldset": { borderColor: "transparent" }, "&:hover fieldset": { borderColor: "#E6E3E8" }, "&.Mui-focused fieldset": { borderColor: "rgba(104,0,54,0.30)" } },
                }}
              >
                {ESTADOS.map((e) => (
                  <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>
                ))}
              </TextField>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" fontWeight={700} color="#77737A" sx={{ textTransform: "uppercase", letterSpacing: 0.6, display: "block", mb: 1 }}>
                Reasignar área
              </Typography>
              <TextField
                select
                size="small"
                value={nuevaArea || ""}
                onChange={(e) => setNuevaArea(e.target.value)}
                inputProps={{ "aria-label": "Seleccionar área" }}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: "12px", bgcolor: "#F7F7F9", "& fieldset": { borderColor: "transparent" }, "&:hover fieldset": { borderColor: "#E6E3E8" }, "&.Mui-focused fieldset": { borderColor: "rgba(104,0,54,0.30)" } },
                }}
              >
                <MenuItem value="">Mantener área actual</MenuItem>
                {Object.entries(AREA_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </TextField>
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between">
            <Box>
              {cambios ? (
                <Typography variant="caption" color="#77737A">
                  {[estadoCambio ? "Estado" : null, areaCambio ? "Área" : null].filter(Boolean).join(" y ")} pendiente{estadoCambio && areaCambio ? "s" : ""} de actualizar.
                </Typography>
              ) : (
                <Typography variant="caption" color="#969198">Sin cambios pendientes.</Typography>
              )}
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              {report.estado === "pendiente" && onDelete && (
                <Button
                  size="small"
                  color="error"
                  startIcon={<span className="material-symbols-outlined" style={{ fontSize: 17 }}>delete</span>}
                  onClick={onDelete}
                  sx={{ textTransform: "none", fontWeight: 600, color: "#ba1a1a", border: "1px solid #f5c6cb", borderRadius: "12px", px: 1.5, "&:hover": { bgcolor: "#fff5f5" } }}
                >
                  Eliminar
                </Button>
              )}
              <Button
                variant="contained"
                disabled={updating || !cambios}
                onClick={onUpdate}
                sx={{
                  bgcolor: cambios ? "#680036" : "#d9c6cd",
                  color: "#ffffff",
                  textTransform: "none",
                  borderRadius: "12px",
                  fontWeight: 700,
                  px: 3,
                  "&:hover": { bgcolor: cambios ? "#56002D" : "#d9c6cd" },
                  "&.Mui-disabled": { color: "#ffffff" },
                }}
              >
                {updating ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={14} sx={{ color: "#fff" }} />
                    <span>Guardando...</span>
                  </Stack>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: 17, marginRight: 6 }}>save</span>
                    {areaCambio && estadoCambio ? "Actualizar estado y área" : areaCambio ? "Reasignar área" : estadoCambio ? "Actualizar estado" : "Guardar cambios"}
                  </>
                )}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      )}
    </Paper>
  );
}

/* ---------- Página ---------- */

function ReportDetailSkeleton() {
  return (
    <Box>
      <Skeleton variant="text" width={140} height={24} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="45%" height={34} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="30%" height={20} sx={{ mb: 3 }} />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "55fr 45fr" }, gap: { xs: 2, md: 3 }, alignItems: "start" }}>
        <Paper elevation={0} sx={{ borderRadius: "20px", border: "1px solid #ECECEF", p: 3 }}>
          <Skeleton variant="text" width="30%" height={18} sx={{ mb: 1.5 }} />
          <Skeleton variant="text" width="90%" height={22} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="70%" height={22} sx={{ mb: 3 }} />
          <Skeleton variant="text" width="25%" height={18} sx={{ mb: 1.5 }} />
          <Skeleton variant="rounded" width={120} height={120} sx={{ borderRadius: "14px" }} />
        </Paper>
        <Paper elevation={0} sx={{ borderRadius: "20px", border: "1px solid #ECECEF", p: 3 }}>
          <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={70} sx={{ borderRadius: "14px", mb: 1.5 }} />
          <Skeleton variant="rounded" height={70} sx={{ borderRadius: "14px" }} />
        </Paper>
      </Box>
    </Box>
  );
}

function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [nuevaArea, setNuevaArea] = useState("");
  const [updating, setUpdating] = useState(false);
  const [reportIds, setReportIds] = useState([]);

  const isAdmin = ROLES_ADMIN.includes(sessionStorage.getItem("userRole"));

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/ingreso", { replace: true });
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/reportes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || "Error al obtener reporte");
        }
        const data = await res.json();
        if (!cancelled) {
          setReport(data);
          setNuevoEstado(data.estado);
          setNuevaArea(data.area || "");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          toast(err.message, "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    apiFetch("/reportes?limit=500&orden=fecha&direccion=desc", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((body) => {
        const list = Array.isArray(body) ? body : body.data || [];
        setReportIds(list.map((r) => r.id || r.reporte_id));
      })
      .catch(() => {});
  }, []);

  const handleUpdateStatus = async () => {
    const cambios = {};
    if (nuevoEstado !== report.estado) {
      cambios.estado = nuevoEstado;
    }
    if (nuevaArea && nuevaArea !== report.area) {
      cambios.area = nuevaArea;
    }
    
    if (Object.keys(cambios).length === 0) return;
    
    setUpdating(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("token");
      const res = await apiFetch(`/reportes/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cambios),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Error al actualizar");
      }
      const data = await res.json();
      setReport(data);

      const mensajes = [];
      if (cambios.estado) mensajes.push("Estado actualizado");
      if (cambios.area) mensajes.push("Área reasignada");
      toast(`${mensajes.join(" y ")} correctamente.`, "success");

      // Recargar el reporte completo para conservar adjuntos luego de la actualización.
      const refreshed = await apiFetch(`/reportes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (refreshed.ok) {
        const refreshedData = await refreshed.json();
        setReport(refreshedData);
        setNuevoEstado(refreshedData.estado);
        setNuevaArea(refreshedData.area || "");
      }
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Eliminar este reporte permanentemente?")) return;
    try {
      const token = sessionStorage.getItem("token");
      const res = await apiFetch(`/reportes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Error al eliminar");
      }
      toast("Reporte eliminado.", "success");
      navigate(isAdmin ? "/dashboard-admin" : "/dashboard-estudiante");
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    }
  };

  const currentId = Number(id);
  const currentIndex = reportIds.indexOf(currentId);
  const prevId = currentIndex > 0 ? reportIds[currentIndex - 1] : null;
  const nextId = currentIndex >= 0 && currentIndex < reportIds.length - 1 ? reportIds[currentIndex + 1] : null;

  if (loading) {
    return (
      <DashboardLayout subtitle={isAdmin ? "Gestión institucional" : "Panel estudiantil"} currentPage="Reportes" decor="report">
        <ReportDetailSkeleton />
      </DashboardLayout>
    );
  }

  if (error && !report) {
    return (
      <DashboardLayout subtitle={isAdmin ? "Gestión institucional" : "Panel estudiantil"} currentPage="Reportes" decor="report">
        <Alert severity="error" sx={{ borderRadius: "14px", mb: 2 }}>{error}</Alert>
        <Button onClick={() => navigate(-1)} startIcon={<span className="material-symbols-outlined">arrow_back</span>} sx={{ color: "#680036", textTransform: "none", fontWeight: 600, borderRadius: "12px", "&:hover": { bgcolor: "rgba(104,0,54,0.06)" } }}>
          Volver
        </Button>
      </DashboardLayout>
    );
  }

  const title = (() => {
    const emocionLabel = report.emocion ? EMOCION_LABELS[report.emocion] : null;
    return emocionLabel || report.titulo || "Sin título";
  })();
  const reportDate = formatDate(report.creado_en || report.date);

  return (
    <DashboardLayout subtitle={isAdmin ? "Gestión institucional" : "Panel estudiantil"} currentPage="Reportes" decor="report">
      <Fade in timeout={350}>
        <Box>
          <Box sx={{ mb: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
            <Button
              startIcon={<span className="material-symbols-outlined">arrow_back</span>}
              onClick={() => navigate(-1)}
              sx={{ color: "#680036", textTransform: "none", fontWeight: 600, borderRadius: "10px", px: 1.5, "&:hover": { bgcolor: "rgba(104,0,54,0.06)" } }}
            >
              Volver
            </Button>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Tooltip title={prevId ? "Reporte anterior" : "No hay anteriores"}>
                <span>
                  <IconButton
                    size="small"
                    disabled={!prevId}
                    onClick={() => prevId && navigate(`/reporte/${prevId}`, { replace: true })}
                    sx={{ color: "#680036", "&.Mui-disabled": { color: "#D6D3D1" } }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_left</span>
                  </IconButton>
                </span>
              </Tooltip>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#78716C", minWidth: 60, textAlign: "center" }}>
                {currentIndex >= 0 ? `${currentIndex + 1} / ${reportIds.length}` : "—"}
              </Typography>
              <Tooltip title={nextId ? "Siguiente reporte" : "No hay siguientes"}>
                <span>
                  <IconButton
                    size="small"
                    disabled={!nextId}
                    onClick={() => nextId && navigate(`/reporte/${nextId}`, { replace: true })}
                    sx={{ color: "#680036", "&.Mui-disabled": { color: "#D6D3D1" } }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_right</span>
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
              {(() => {
                const t = TIPOS[report.tipo] || TIPOS.queja;
                return (
                  <Chip
                    icon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>{t.icon}</span>}
                    label={t.label}
                    size="small"
                    sx={{ bgcolor: t.bg, color: t.fg, fontWeight: 600, fontSize: 12, borderRadius: 999, "& .MuiChip-icon": { color: t.fg } }}
                  />
                );
              })()}
              {report.emocion && EMOCION_LABELS[report.emocion] && (
                <Chip
                  icon={<span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>{EMOCION_ICONS[report.emocion] || "sentiment_neutral"}</span>}
                  label={EMOCION_LABELS[report.emocion]}
                  size="small"
                  sx={{ bgcolor: (EMOCION_COLORS[report.tipo] || EMOCION_COLORS.queja).bg, color: (EMOCION_COLORS[report.tipo] || EMOCION_COLORS.queja).fg, fontWeight: 600, fontSize: 12, borderRadius: 999 }}
                />
              )}
              <StatusDot estado={report.estado} />
              {report.urgencia && (() => {
                const u = getUrgencia(report.urgencia);
                return (
                  <Chip
                    icon={<span className="material-symbols-outlined" style={{ fontSize: 15 }}>{u.icon}</span>}
                    label={`Urgencia: ${u.label}`}
                    size="small"
                    sx={{ bgcolor: u.bg, color: u.fg, fontWeight: 700, fontSize: 12, borderRadius: 999, "& .MuiChip-icon": { color: u.fg } }}
                  />
                );
              })()}
              {report.clasificacion && (
                <Chip
                  label={clasificacionLabel(report.clasificacion)}
                  size="small"
                  sx={{ bgcolor: "#F0EDEF", color: "#353136", fontWeight: 600, fontSize: 12, borderRadius: 999 }}
                />
              )}
            </Box>

            <Typography variant="h4" fontWeight={800} color="#18151A" sx={{ mt: 1.5, mb: 1, lineHeight: 1.2, letterSpacing: "-0.02em", fontSize: { xs: 26, md: 32 } }}>
              {title}
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <span className="material-symbols-outlined" style={{ fontSize: 15, color: "#77737A" }}>person</span>
                <Typography variant="body2" color="#353136" fontWeight={600}>
                  {report.autor_nombre || report.student}
                </Typography>
                <Chip label="Estudiante" size="small" sx={{ height: 20, fontSize: 10, bgcolor: "#F0EDEF", color: "#680036", fontWeight: 600, borderRadius: 999 }} />
              </Stack>
              <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "#C6C2C8", display: { xs: "none", sm: "block" } }} />
              <Stack direction="row" spacing={0.5} alignItems="center">
                <span className="material-symbols-outlined" style={{ fontSize: 15, color: "#77737A" }}>calendar_today</span>
                <Typography variant="body2" color="#77737A">{reportDate}</Typography>
              </Stack>
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "minmax(0,55fr) minmax(0,45fr)" },
              gap: { xs: 2, md: 3 },
              alignItems: "start",
            }}
          >
            <Box sx={{ order: { xs: 2, md: 1 }, minWidth: 0 }}>
              <Paper
                elevation={0}
                sx={{ borderRadius: "20px", border: "1px solid #ECECEF", bgcolor: "#FFFFFF", p: { xs: 2.5, md: 3 }, boxShadow: "0 1px 4px rgba(47,0,24,0.05)" }}
              >
                <Stack spacing={3}>
                  <InfoRow icon="description" label="Descripción">
                    {report.description || report.descripcion}
                  </InfoRow>

                  {report.area && (
                    <InfoRow icon="business" label="Área destinataria">
                      <Chip
                        label={AREA_LABELS[report.area] || report.area}
                        size="small"
                        sx={{ height: 24, fontSize: 12, bgcolor: "#f7e6eb", color: "#680036", fontWeight: 600, borderRadius: 999 }}
                      />
                    </InfoRow>
                  )}

                  {report.clasificacion && (
                    <InfoRow icon="sell" label="Clasificación">
                      {clasificacionLabel(report.clasificacion)}
                    </InfoRow>
                  )}

                  {report.urgencia && (
                    <InfoRow icon="priority_high" label="Urgencia">
                      {getUrgencia(report.urgencia).label}
                    </InfoRow>
                  )}

                  {report.zona && (
                    <InfoRow icon="place" label="Zona">
                      {report.zona}
                    </InfoRow>
                  )}

                  {report.resuelto_por && (
                    <InfoRow icon="verified" label="Resuelto por">
                      {report.resuelto_por}
                    </InfoRow>
                  )}

                  {report.imagenes && report.imagenes.length > 0 && (() => {
                    const imagenes = report.imagenes.filter((img) => !/\.pdf$/i.test(img.nombre_archivo || img.ruta_archivo || ''));
                    const pdfs = report.imagenes.filter((img) => /\.pdf$/i.test(img.nombre_archivo || img.ruta_archivo || ''));
                    const total = imagenes.length + pdfs.length;
                    const labelImagenes = `${total} archivo${total !== 1 ? 's' : ''}`;
                    return (
                      <InfoRow icon={pdfs.length > 0 ? 'folder_zip' : 'image'} label={`Evidencia (${labelImagenes})`}>
                        <Stack spacing={1.5} sx={{ width: '100%' }}>
                          {imagenes.length > 0 && (
                            <Box>
                              <ImageGallery images={imagenes} />
                            </Box>
                          )}
                          {pdfs.length > 0 && (
                            <Stack spacing={1}>
                              {pdfs.map((pdf) => (
                                <Box
                                  key={pdf.archivo_id || pdf.ruta_archivo}
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    p: 1.5,
                                    borderRadius: '12px',
                                    bgcolor: '#FFFFFF',
                                    border: '1px solid #ECECEF',
                                    textDecoration: 'none',
                                    transition: 'all 0.15s ease',
                                    '&:hover': { borderColor: '#680036', bgcolor: '#FAF9F7' },
                                  }}
                                  component="a"
                                  href={getImageUrl(pdf.ruta_archivo)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Box sx={{ width: 44, height: 44, borderRadius: '10px', bgcolor: '#F0EDEF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#680036' }}>picture_as_pdf</span>
                                  </Box>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body2" fontWeight={700} color="#18151A" noWrap>
                                      {pdf.nombre_archivo}
                                    </Typography>
                                    <Typography variant="caption" color="#77737A">
                                      Haz clic para abrir o descargar el PDF
                                    </Typography>
                                  </Box>
                                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#969198' }}>download</span>
                                </Box>
                              ))}
                            </Stack>
                          )}
                        </Stack>
                      </InfoRow>
                    );
                  })()}

                  {error && <Alert severity="error" sx={{ borderRadius: "12px" }}>{error}</Alert>}
                </Stack>
              </Paper>
            </Box>

            <Box sx={{ order: { xs: 1, md: 2 }, minWidth: 0, height: { md: 'calc(100vh - 8px)' }, overflow: { md: 'auto' }, position: { md: 'sticky' }, top: { md: 8 }, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flex: '0 0 auto' }}>
                {isAdmin ? (
                  <GestionReporte
                    report={report}
                    nuevoEstado={nuevoEstado}
                    setNuevoEstado={setNuevoEstado}
                    nuevaArea={nuevaArea}
                    setNuevaArea={setNuevaArea}
                    updating={updating}
                    onUpdate={handleUpdateStatus}
                    onDelete={handleDelete}
                  />
                ) : (
                  <EstadoDelReporte report={report} />
                )}
              </Box>
              <Box sx={{ mt: 2.5, flex: '1 1 auto' }}>
                <CommentSection reporteId={report.id} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Fade>
    </DashboardLayout>
  );
}

export default ReportDetailPage;
