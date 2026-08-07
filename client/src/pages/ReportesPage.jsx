import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Stack, Chip, TextField, InputAdornment,
  Button, Alert, IconButton, Tooltip, Skeleton, Fade, MenuItem,
} from "@mui/material";
import { useReports } from "../context/useReports.js";
import { useToast } from "../context/useToast.js";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { EMOCION_ICONS, EMOCION_COLORS } from "../components/emotionData.js";
import { getUrgencia, clasificacionLabel } from "../components/reportMeta.js";

const ACCENT = "#680036";
const ACCENT_LIGHT = "#f7e6eb";
const SURFACE = "#FAF9F7";
const CARD = "#FFFFFF";
const BORDER = "#ECEADF";
const TEXT_PRIMARY = "#1C1917";
const TEXT_SECONDARY = "#78716C";
const TEXT_MUTED = "#A8A29E";

const TIPO_META = {
  queja:      { bg: "#fef2f2", fg: "#991B1B", icon: "report", label: "Queja" },
  sugerencia: { bg: "#fefce8", fg: "#854D0E", icon: "lightbulb", label: "Sugerencia" },
  felicitacion:{ bg: "#f0fdf4", fg: "#166534", icon: "celebration", label: "Felicitación" },
  peticion:   { bg: "#eff6ff", fg: "#1E40AF", icon: "handshake", label: "Petición" },
  incidente:  { bg: "#fef2f2", fg: "#991B1B", icon: "warning", label: "Incidente" },
};

const AREA_LABELS = {
  ti_soporte: "Soporte TI", bibliotecario: "Biblioteca", conserje: "Limpieza",
  mantenimiento: "Mantenimiento", secretaria: "Secretaría",
  "bienestar universitario": "Bienestar", financiero: "Financiero",
};
const AREA_OPTIONS = Object.entries(AREA_LABELS).map(([value, label]) => ({ value, label }));

const STATUS_META = {
  pendiente:  { label: "Pendiente",  dot: "#B91C1C", bg: "#fef2f2", fg: "#991B1B" },
  en_proceso: { label: "En proceso", dot: "#D97706", bg: "#fefce8", fg: "#854D0E" },
  resuelto:   { label: "Resuelto",   dot: "#15803D", bg: "#f0fdf4", fg: "#166534" },
  rechazado:  { label: "Rechazado",  dot: "#DC2626", bg: "#fef2f2", fg: "#991B1B" },
};

const ROLES_ADMIN = [
  "admin", "prorector", "ti_soporte", "bibliotecario", "conserje",
  "mantenimiento", "secretaria", "bienestar universitario", "financiero",
];

const ORDEN_OPTIONS = [
  { value: "fecha", label: "Más recientes" },
  { value: "actualizacion", label: "Última actualización" },
  { value: "urgencia", label: "Prioridad" },
  { value: "estado", label: "Estado" },
];

const EMPTY_FILTERS = { estado: "todos", tipo: "todos", urgencia: "todos", area: "todos", desde: "", hasta: "" };

function ChipSelect({ label, value, onChange, options }) {
  return (
    <TextField
      select size="small" label={label} value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{
        minWidth: { xs: "100%", sm: 150 },
        "& .MuiOutlinedInput-root": {
          borderRadius: "10px", bgcolor: CARD,
          fontSize: 13, fontWeight: 500,
          "& fieldset": { borderColor: BORDER },
          "&:hover fieldset": { borderColor: "#D6D3D1" },
          "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: 1.5 },
        },
        "& .MuiInputLabel-root": { fontSize: 13, color: TEXT_SECONDARY, "&.Mui-focused": { color: ACCENT } },
      }}
    >
      {options.map((o) => (
        <MenuItem key={o.value} value={o.value} sx={{ fontSize: 13 }}>{o.label}</MenuItem>
      ))}
    </TextField>
  );
}

function getPageNumbers(current, last) {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  const set = new Set([1, last]);
  for (let p = current - 1; p <= current + 1; p++) {
    if (p >= 1 && p <= last) set.add(p);
  }
  const sorted = [...set].sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push("...");
    out.push(p);
    prev = p;
  }
  return out;
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = getPageNumbers(page, totalPages);
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <IconButton
        size="small" disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        sx={{ width: 32, height: 32, color: ACCENT, "&.Mui-disabled": { color: "#D6D3D1" } }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
      </IconButton>
      {pages.map((p, i) =>
        p === "..." ? (
          <Typography key={`e${i}`} sx={{ color: TEXT_MUTED, px: 0.5, fontSize: 13 }}>…</Typography>
        ) : (
          <Box
            key={p}
            onClick={() => onChange(p)}
            sx={{
              minWidth: 32, height: 32, borderRadius: "8px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700,
              bgcolor: p === page ? ACCENT : "transparent",
              color: p === page ? "#fff" : TEXT_SECONDARY,
              border: p === page ? "none" : `1px solid ${BORDER}`,
              transition: "all 0.15s ease",
              "&:hover": { bgcolor: p === page ? "#56002D" : SURFACE },
            }}
          >
            {p}
          </Box>
        )
      )}
      <IconButton
        size="small" disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        sx={{ width: 32, height: 32, color: ACCENT, "&.Mui-disabled": { color: "#D6D3D1" } }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
      </IconButton>
    </Stack>
  );
}

function ListSkeleton() {
  return (
    <Stack spacing={1.5}>
      {[0, 1, 2, 3].map((i) => (
        <Paper key={i} elevation={0} sx={{ p: 2.5, borderRadius: "14px", border: `1px solid ${BORDER}`, bgcolor: CARD }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: "10px" }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="45%" height={20} />
              <Skeleton variant="text" width="75%" height={16} sx={{ mt: 0.5 }} />
              <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                <Skeleton variant="rounded" width={72} height={22} sx={{ borderRadius: 999 }} />
                <Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: 999 }} />
              </Stack>
            </Box>
          </Box>
        </Paper>
      ))}
    </Stack>
  );
}

function GridSkeleton() {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }, gap: 2 }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Paper key={i} elevation={0} sx={{ p: 2.5, borderRadius: "14px", border: `1px solid ${BORDER}`, bgcolor: CARD, height: 220 }}>
          <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: "10px", mb: 2 }} />
          <Skeleton variant="text" width="50%" height={18} />
          <Skeleton variant="text" width="90%" height={14} sx={{ mt: 0.5 }} />
          <Skeleton variant="text" width="65%" height={14} sx={{ mt: 0.25 }} />
          <Stack direction="row" spacing={1} sx={{ mt: "auto", pt: 2 }}>
            <Skeleton variant="rounded" width={64} height={22} sx={{ borderRadius: 999 }} />
            <Skeleton variant="rounded" width={56} height={22} sx={{ borderRadius: 999 }} />
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}

function GridCard({ report, isAdmin, onOpen, onDelete }) {
  const tipo = TIPO_META[report.tipo] || TIPO_META.queja;
  const sm = STATUS_META[report.estado] || STATUS_META.pendiente;
  return (
    <Paper
      elevation={0} onClick={onOpen}
      sx={{
        position: "relative", display: "flex", flexDirection: "column",
        height: 230, p: 2.5, borderRadius: "14px",
        border: `1px solid ${BORDER}`, bgcolor: CARD, cursor: "pointer",
        transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(28,25,23,0.06)", borderColor: "#D6D3D1" },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: tipo.bg, color: tipo.fg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{tipo.icon}</span>
        </Box>
        <Chip label={sm.label} size="small"
          sx={{ height: 22, fontSize: 10, fontWeight: 600, bgcolor: sm.bg, color: sm.fg, borderRadius: "6px" }} />
      </Box>

      <Typography variant="caption" fontWeight={600} color={TEXT_MUTED}>#{report.id}</Typography>

      <Typography variant="body2" fontWeight={700} color={TEXT_PRIMARY} sx={{ mt: 0.5, lineHeight: 1.35, minHeight: 34,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {report.issue}
      </Typography>

      <Typography variant="caption" color={TEXT_MUTED} sx={{ mt: 0.5, display: "block" }}>
        {report.student} · {report.date}
      </Typography>

      <Box sx={{ mt: "auto", pt: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {report.urgencia && (() => {
            const u = getUrgencia(report.urgencia);
            return <Chip label={u.label} size="small" sx={{ height: 20, fontSize: 10, bgcolor: u.bg, color: u.fg, fontWeight: 600, borderRadius: "6px" }} />;
          })()}
          {isAdmin && report.area && (
            <Chip label={AREA_LABELS[report.area] || report.area} size="small"
              sx={{ height: 20, fontSize: 10, bgcolor: "#F5F5F4", color: TEXT_SECONDARY, fontWeight: 500, borderRadius: "6px", maxWidth: 80,
                "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }} />
          )}
        </Box>
        {isAdmin && report.estado === "pendiente" && (
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(report.id); }}
            sx={{ width: 28, height: 28, color: TEXT_MUTED, "&:hover": { color: "#DC2626" } }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
          </IconButton>
        )}
      </Box>
    </Paper>
  );
}

function ReportesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { loading, error, buscarReportes, eliminarReporte, getGlobalStats } = useReports();
  const userRole = sessionStorage.getItem("userRole");
  const isAdmin = ROLES_ADMIN.includes(userRole);
  const isSuperAdmin = userRole === "admin" || userRole === "prorector";

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [search, setSearch] = useState("");
  const [debSearch, setDebSearch] = useState("");
  const [autorText, setAutorText] = useState("");
  const [debAutor, setDebAutor] = useState("");
  const [resueltoText, setResueltoText] = useState("");
  const [debResuelto, setDebResuelto] = useState("");
  const [orden, setOrden] = useState("fecha");
  const [direccion, setDireccion] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewMode, setViewMode] = useState("grid");
  const [reloadKey, setReloadKey] = useState(0);

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [globalStats, setGlobalStats] = useState(null);
  const [porEstado, setPorEstado] = useState({});

  useEffect(() => {
    const t = setTimeout(() => setDebSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => { setDebAutor(autorText); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [autorText]);

  useEffect(() => {
    const t = setTimeout(() => { setDebResuelto(resueltoText); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [resueltoText]);

  useEffect(() => {
    getGlobalStats().then((s) => { if (s) setGlobalStats(s); });
  }, [getGlobalStats]);

  const updateFilter = useCallback((key, value) => {
    setFilters((p) => ({ ...p, [key]: value }));
    setPage(1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    buscarReportes({
      page, limit, orden, direccion,
      busqueda: debSearch, autor: debAutor, resuelto_por: debResuelto,
      estado: filters.estado, tipo: filters.tipo, urgencia: filters.urgencia,
      area: filters.area, desde: filters.desde, hasta: filters.hasta,
    })
      .then((res) => {
        if (cancelled) return;
        setData(res.data);
        setTotal(res.total);
        setPorEstado(res.porEstado || {});
        const computedTotalPages = res.totalPages || Math.max(1, Math.ceil(res.total / limit));
        setTotalPages(computedTotalPages);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [page, limit, orden, direccion, debSearch, debAutor, debResuelto, filters, reloadKey, buscarReportes]);

  const hasActiveFilters =
    debSearch !== "" || debAutor !== "" || debResuelto !== "" ||
    filters.estado !== "todos" || filters.tipo !== "todos" || filters.urgencia !== "todos" ||
    filters.area !== "todos" || filters.desde !== "" || filters.hasta !== "";

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSearch(""); setDebSearch("");
    setAutorText(""); setDebAutor("");
    setResueltoText(""); setDebResuelto("");
    setOrden("fecha"); setDireccion("desc");
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este reporte?")) return;
    try {
      await eliminarReporte(id);
      toast("Reporte eliminado.", "success");
      if (data.length === 1 && page > 1) setPage(page - 1);
      else setReloadKey((k) => k + 1);
    } catch (err) { toast(err.message, "error"); }
  };

  const stats = useMemo(() => {
    if (!isAdmin && porEstado) {
      return {
        total: total,
        pendientes: porEstado.pendiente || 0,
        enProceso: porEstado.en_proceso || 0,
        resueltos: porEstado.resuelto || 0,
      };
    }
    return {
      total: globalStats?.total ?? total,
      pendientes: globalStats?.pendientes ?? 0,
      enProceso: globalStats?.enProceso ?? 0,
      resueltos: globalStats?.resueltos ?? 0,
    };
  }, [isAdmin, globalStats, total, porEstado]);

  const summaryItems = [
    { label: "Total", value: stats.total, icon: "summarize", fg: ACCENT },
    { label: "Pendientes", value: stats.pendientes, icon: "pending", fg: "#B91C1C" },
    { label: "En proceso", value: stats.enProceso, icon: "autorenew", fg: "#D97706" },
    { label: "Resueltos", value: stats.resueltos, icon: "check_circle", fg: "#15803D" },
  ];

  const desde = total === 0 ? 0 : (page - 1) * limit + 1;
  const hasta = Math.min(page * limit, total);

  return (
    <DashboardLayout subtitle={isAdmin ? "Gestión institucional" : "Panel estudiantil"} currentPage="Reportes" decor="report">
      <Fade in timeout={300}>
        <Box sx={{ maxWidth: 1280, mx: "auto" }}>

          {/* ── Header ── */}
          <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={800} color={TEXT_PRIMARY} sx={{ letterSpacing: "-0.03em", fontSize: { xs: "1.5rem", sm: "1.75rem" } }}>
                {isAdmin ? "Reportes" : "Mis Reportes"}
              </Typography>
              <Typography variant="body2" color={TEXT_SECONDARY} sx={{ mt: 0.5 }}>
                {isAdmin ? "Gestiona y da seguimiento a los reportes del sistema." : "Revisa el estado de tus reportes."}
              </Typography>
            </Box>
            {!isAdmin && (
              <Button
                variant="contained" startIcon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>}
                onClick={() => navigate("/nuevo-reporte")}
                sx={{
                  bgcolor: ACCENT, color: "#fff", fontWeight: 600, fontSize: 13,
                  borderRadius: "10px", px: 2.5, py: 1, textTransform: "none",
                  boxShadow: "0 2px 8px rgba(104,0,54,0.2)",
                  "&:hover": { bgcolor: "#56002D", boxShadow: "0 4px 12px rgba(104,0,54,0.3)" },
                }}
              >
                Nuevo reporte
              </Button>
            )}
          </Box>

          {/* ── Stats ── */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }, gap: 1.5, mb: 3 }}>
            {summaryItems.map((s) => (
              <Paper key={s.label} elevation={0} sx={{
                p: 2, borderRadius: "12px", border: `1px solid ${BORDER}`, bgcolor: CARD,
                display: "flex", alignItems: "center", gap: 1.5,
              }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: "10px",
                  bgcolor: `${s.fg}10`, color: s.fg,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{s.icon}</span>
                </Box>
                <Box>
                  {loading ? (
                    <Skeleton variant="text" width={32} height={28} />
                  ) : (
                    <Typography sx={{ fontWeight: 800, color: s.fg, fontSize: 22, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                      {s.value}
                    </Typography>
                  )}
                  <Typography sx={{ color: TEXT_MUTED, fontSize: 11, fontWeight: 500 }}>{s.label}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>

          {/* ── Search + Controls ── */}
          <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: "14px", border: `1px solid ${BORDER}`, bgcolor: CARD, mb: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} sx={{ mb: 1.5 }}>
              <TextField
                size="small" placeholder="Buscar reportes..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px", bgcolor: SURFACE,
                    "& fieldset": { borderColor: BORDER },
                    "&:hover fieldset": { borderColor: "#D6D3D1" },
                    "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: 1.5 },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: TEXT_MUTED }}>search</span>
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
                <ChipSelect label="Ordenar" value={orden} onChange={(v) => { setOrden(v); setPage(1); }} options={ORDEN_OPTIONS} />
                <Tooltip title={direccion === "asc" ? "Ascendente" : "Descendente"}>
                  <IconButton
                    size="small"
                    onClick={() => { setDireccion((d) => d === "asc" ? "desc" : "asc"); setPage(1); }}
                    sx={{
                      width: 34, height: 34, borderRadius: "8px",
                      border: `1px solid ${BORDER}`, bgcolor: CARD, color: ACCENT,
                      "&:hover": { bgcolor: SURFACE },
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      {direccion === "asc" ? "arrow_upward" : "arrow_downward"}
                    </span>
                  </IconButton>
                </Tooltip>
                <Box sx={{
                  display: "flex", gap: 0.25, p: 0.25, borderRadius: "8px",
                  border: `1px solid ${BORDER}`, bgcolor: SURFACE,
                }}>
                  {[
                    { key: "list", icon: "view_agenda" },
                    { key: "grid", icon: "grid_view" },
                  ].map((v) => (
                    <Box key={v.key}
                      onClick={() => setViewMode(v.key)}
                      sx={{
                        width: 30, height: 30, borderRadius: "6px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        bgcolor: viewMode === v.key ? ACCENT : "transparent",
                        color: viewMode === v.key ? "#fff" : TEXT_MUTED,
                        transition: "all 0.15s ease",
                        "&:hover": { color: viewMode === v.key ? "#fff" : TEXT_PRIMARY },
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{v.icon}</span>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Stack>

            {/* ── Status chips ── */}
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
              {[
                { key: "todos", label: "Todos" },
                { key: "pendiente", label: "Pendiente" },
                { key: "en_proceso", label: "En proceso" },
                { key: "resuelto", label: "Resuelto" },
                { key: "rechazado", label: "Rechazado" },
              ].map((f) => {
                const active = filters.estado === f.key;
                const sm = STATUS_META[f.key];
                const isActive = active && sm;
                return (
                  <Chip
                    key={f.key} label={f.label}
                    onClick={() => updateFilter("estado", f.key)}
                    sx={{
                      height: 30, fontSize: 12, fontWeight: 600, borderRadius: "8px",
                      bgcolor: active ? (isActive ? sm.bg : ACCENT_LIGHT) : "transparent",
                      color: active ? (isActive ? sm.fg : ACCENT) : TEXT_SECONDARY,
                      border: `1px solid ${active ? (isActive ? sm.fg + "30" : ACCENT + "40") : BORDER}`,
                      "&:hover": { bgcolor: isActive ? sm.bg : ACCENT_LIGHT },
                      cursor: "pointer", transition: "all 0.15s ease",
                    }}
                  />
                );
              })}
            </Box>

            {/* ── Secondary row: type + date + admin filters ── */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5, alignItems: "center" }}>
              <ChipSelect label="Tipo" value={filters.tipo} onChange={(v) => updateFilter("tipo", v)}
                options={[
                  { value: "todos", label: "Todos" },
                  { value: "incidente", label: "Incidente" },
                  { value: "sugerencia", label: "Sugerencia" },
                  { value: "peticion", label: "Petición" },
                  { value: "felicitacion", label: "Felicitación" },
                ]} />
              <ChipSelect label="Prioridad" value={filters.urgencia} onChange={(v) => updateFilter("urgencia", v)}
                options={[
                  { value: "todos", label: "Todas" },
                  { value: "critica", label: "Crítica" },
                  { value: "alta", label: "Alta" },
                  { value: "media", label: "Media" },
                  { value: "baja", label: "Baja" },
                ]} />
              <TextField
                size="small" type="date" placeholder="Desde"
                value={filters.desde} onChange={(e) => updateFilter("desde", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  minWidth: { xs: "calc(50% - 4px)", sm: 140 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px", bgcolor: CARD, fontSize: 13,
                    "& fieldset": { borderColor: BORDER },
                    "&:hover fieldset": { borderColor: "#D6D3D1" },
                    "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: 1.5 },
                  },
                  "& .MuiInputLabel-root": { fontSize: 13, color: TEXT_SECONDARY, "&.Mui-focused": { color: ACCENT } },
                }} />
              <TextField
                size="small" type="date" placeholder="Hasta"
                value={filters.hasta} onChange={(e) => updateFilter("hasta", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  minWidth: { xs: "calc(50% - 4px)", sm: 140 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px", bgcolor: CARD, fontSize: 13,
                    "& fieldset": { borderColor: BORDER },
                    "&:hover fieldset": { borderColor: "#D6D3D1" },
                    "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: 1.5 },
                  },
                  "& .MuiInputLabel-root": { fontSize: 13, color: TEXT_SECONDARY, "&.Mui-focused": { color: ACCENT } },
                }} />
              {isSuperAdmin && (
                <ChipSelect label="Área" value={filters.area} onChange={(v) => updateFilter("area", v)}
                  options={[{ value: "todos", label: "Todas" }, ...AREA_OPTIONS]} />
              )}
              {isAdmin && (
                <TextField
                  size="small" label="Estudiante" placeholder="Buscar..."
                  value={autorText} onChange={(e) => setAutorText(e.target.value)}
                  sx={{
                    minWidth: { xs: "100%", sm: 150 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px", bgcolor: CARD, fontSize: 13,
                      "& fieldset": { borderColor: BORDER },
                      "&:hover fieldset": { borderColor: "#D6D3D1" },
                      "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: 1.5 },
                    },
                    "& .MuiInputLabel-root": { fontSize: 13, color: TEXT_SECONDARY, "&.Mui-focused": { color: ACCENT } },
                  }} />
              )}
              {isAdmin && (
                <TextField
                  size="small" label="Responsable" placeholder="Buscar..."
                  value={resueltoText} onChange={(e) => setResueltoText(e.target.value)}
                  sx={{
                    minWidth: { xs: "100%", sm: 150 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px", bgcolor: CARD, fontSize: 13,
                      "& fieldset": { borderColor: BORDER },
                      "&:hover fieldset": { borderColor: "#D6D3D1" },
                      "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: 1.5 },
                    },
                    "& .MuiInputLabel-root": { fontSize: 13, color: TEXT_SECONDARY, "&.Mui-focused": { color: ACCENT } },
                  }} />
              )}
              {hasActiveFilters && (
                <Button
                  size="small" onClick={clearFilters}
                  startIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>}
                  sx={{
                    color: ACCENT, fontWeight: 600, fontSize: 12, textTransform: "none",
                    borderRadius: "8px", px: 1.5,
                    "&:hover": { bgcolor: ACCENT_LIGHT },
                  }}
                >
                  Limpiar
                </Button>
              )}
            </Box>
          </Paper>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "10px", fontSize: 13 }}>{error}</Alert>}

          {/* ── Results bar ── */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
            <Typography variant="body2" color={TEXT_MUTED} fontWeight={500} sx={{ fontSize: 13 }}>
              {total === 0
                ? "Sin resultados"
                : total <= limit
                  ? `${total} reporte${total !== 1 ? "s" : ""}`
                  : `Mostrando ${desde}–${hasta} de ${total} reportes`}
              {hasActiveFilters && " (filtrado)"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <TextField
                select size="small" label="Mostrar" value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                sx={{
                  minWidth: 90,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px", bgcolor: CARD, fontSize: 13,
                    "& fieldset": { borderColor: BORDER },
                    "&.Mui-focused fieldset": { borderColor: ACCENT },
                  },
                  "& .MuiInputLabel-root": { fontSize: 12, color: TEXT_SECONDARY, "&.Mui-focused": { color: ACCENT } },
                }}
              >
                {[10, 20, 50].map((n) => (
                  <MenuItem key={n} value={n} sx={{ fontSize: 13 }}>{n}</MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>

          {/* ── Content ── */}
          {loading && (viewMode === "grid" ? <GridSkeleton /> : <ListSkeleton />)}

          {!loading && !error && data.length === 0 && (
            <Paper elevation={0} sx={{ py: 8, px: 3, borderRadius: "14px", textAlign: "center", border: `1px solid ${BORDER}`, bgcolor: CARD }}>
              <Box sx={{ width: 56, height: 56, borderRadius: "14px", bgcolor: SURFACE, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: TEXT_MUTED }}>search_off</span>
              </Box>
              <Typography variant="subtitle1" fontWeight={700} color={TEXT_PRIMARY}>
                No se encontraron reportes
              </Typography>
              <Typography variant="body2" color={TEXT_SECONDARY} sx={{ mt: 0.75, mb: hasActiveFilters ? 2.5 : 0, maxWidth: 320, mx: "auto" }}>
                {hasActiveFilters ? "Ajusta los filtros o intenta otra búsqueda." : "Aún no hay reportes registrados."}
              </Typography>
              {hasActiveFilters && (
                <Button variant="text" onClick={clearFilters}
                  sx={{ color: ACCENT, fontWeight: 600, textTransform: "none", fontSize: 13, "&:hover": { bgcolor: ACCENT_LIGHT } }}>
                  Limpiar filtros
                </Button>
              )}
            </Paper>
          )}

          {viewMode === "grid" ? (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }, gap: 2 }}>
              {data.map((report) => (
                <GridCard key={report.id} report={report} isAdmin={isAdmin}
                  onOpen={() => navigate(`/reporte/${report.id}`)} onDelete={handleDelete} />
              ))}
            </Box>
          ) : (
            <Stack spacing={1}>
              {data.map((report) => {
                const tipo = TIPO_META[report.tipo] || TIPO_META.queja;
                const sm = STATUS_META[report.estado] || STATUS_META.pendiente;
                return (
                  <Paper
                    key={report.id} elevation={0}
                    onClick={() => navigate(`/reporte/${report.id}`)}
                    sx={{
                      p: { xs: 1.75, sm: 2.25 }, borderRadius: "12px",
                      border: `1px solid ${BORDER}`, bgcolor: CARD, cursor: "pointer",
                      transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                      "&:hover": { borderColor: "#D6D3D1", boxShadow: "0 4px 16px rgba(28,25,23,0.05)", transform: "translateY(-1px)" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                      <Box sx={{
                        width: 40, height: 40, borderRadius: "10px", flexShrink: 0,
                        bgcolor: tipo.bg, color: tipo.fg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{tipo.icon}</span>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                          <Typography variant="body2" fontWeight={700} color={TEXT_PRIMARY} noWrap sx={{ minWidth: 0, flex: 1, fontSize: 14 }}>
                            {report.issue}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 0.75, flexShrink: 0, alignItems: "center" }}>
                            {report.urgencia && (() => {
                              const u = getUrgencia(report.urgencia);
                              return <Chip label={u.label} size="small" sx={{ height: 20, fontSize: 10, bgcolor: u.bg, color: u.fg, fontWeight: 600, borderRadius: "6px" }} />;
                            })()}
                          </Box>
                        </Box>
                        <Typography variant="caption" color={TEXT_MUTED} sx={{ mt: 0.25, display: "block", fontSize: 12 }}>
                          {report.student} · {report.date}
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1, flexWrap: "wrap", rowGap: 0.5 }}>
                          <Chip label={sm.label} size="small"
                            sx={{ height: 22, fontSize: 10, fontWeight: 600, bgcolor: sm.bg, color: sm.fg, borderRadius: "6px" }} />
                          {report.emocion && report.emocionLabel && (
                            <Chip
                              icon={<span className="material-symbols-outlined" style={{ fontSize: 13, fontVariationSettings: "'FILL' 1" }}>{EMOCION_ICONS[report.emocion] || "sentiment_neutral"}</span>}
                              label={report.emocionLabel} size="small"
                              sx={{ height: 22, fontSize: 10, bgcolor: (EMOCION_COLORS[report.tipo] || EMOCION_COLORS.queja).bg, color: (EMOCION_COLORS[report.tipo] || EMOCION_COLORS.queja).fg, fontWeight: 500, borderRadius: "6px", "& .MuiChip-icon": { color: "inherit" } }}
                            />
                          )}
                          {report.area && (
                            <Chip label={AREA_LABELS[report.area] || report.area} size="small"
                              sx={{ height: 22, fontSize: 10, bgcolor: "#F5F5F4", color: TEXT_SECONDARY, fontWeight: 500, borderRadius: "6px", maxWidth: 120,
                                "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }} />
                          )}
                          {isAdmin && report.resuelto_por && (
                            <Chip
                              icon={<span className="material-symbols-outlined" style={{ fontSize: 12 }}>task_alt</span>}
                              label={AREA_LABELS[report.resuelto_por] || report.resuelto_por} size="small"
                              sx={{ height: 22, fontSize: 10, bgcolor: "#f0fdf4", color: "#166534", fontWeight: 500, borderRadius: "6px", "& .MuiChip-icon": { color: "inherit", fontSize: 12 } }} />
                          )}
                        </Stack>
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          )}

          {/* ── Bottom pagination ── */}
          {total > limit && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 1 }}>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </Box>
          )}
        </Box>
      </Fade>
    </DashboardLayout>
  );
}

export default ReportesPage;
