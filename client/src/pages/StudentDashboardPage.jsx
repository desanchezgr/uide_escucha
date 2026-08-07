import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Avatar,
  Skeleton,
  Alert,
  Button,
  Fade,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useReports } from "../context/useReports.js";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { EMOCION_ICONS, EMOCION_COLORS } from "../components/emotionData.js";

const TIPO_META = {
  queja: { icon: "report", bg: "#fde9ef", fg: "#680036" },
  incidente: { icon: "report", bg: "#fde9ef", fg: "#680036" },
  sugerencia: { icon: "lightbulb", bg: "#fff5db", fg: "#785900" },
  felicitacion: { icon: "celebration", bg: "#e8f7ed", fg: "#1f7a3f" },
  peticion: { icon: "handshake", bg: "#e8eaf6", fg: "#303f9f" },
};

const STATUS_META = {
  pendiente: { label: "Pendiente", bg: "#fde9ef", fg: "#680036", dot: "#680036" },
  en_proceso: { label: "En Proceso", bg: "#fff5db", fg: "#785900", dot: "#785900" },
  resuelto: { label: "Resuelto", bg: "#e8f7ed", fg: "#1f7a3f", dot: "#1f7a3f" },
  rechazado: { label: "Rechazado", bg: "#fde9ef", fg: "#ba1a1a", dot: "#ba1a1a" },
};

function DonutChart({ data, total, size = 180, stroke = 22 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const arcs = data.reduce((list, d) => {
    const acc = list.length > 0 ? list[list.length - 1].acc : 0;
    const frac = total > 0 ? d.value / total : 0;
    const len = frac * c;
    list.push({ ...d, dasharray: `${Math.max(len - 3, 1)} ${c}`, offset: -acc * c, acc: acc + frac });
    return list;
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", justifyContent: "center", gap: 3, flex: 1 }}>
      <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0EDEF" strokeWidth={stroke} />
          {arcs.map((a) => (
            <circle
              key={a.label}
              cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={a.color} strokeWidth={stroke} strokeLinecap="round"
              strokeDasharray={a.dasharray} strokeDashoffset={a.offset}
              style={{ transition: "stroke-dasharray 0.7s cubic-bezier(0.16, 1, 0.3, 1)" }}
            />
          ))}
        </svg>
        <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <Typography sx={{ fontWeight: 800, color: "#18151A", fontSize: 32, lineHeight: 1, letterSpacing: "-0.02em" }}>{total}</Typography>
          <Typography sx={{ color: "#77737A", fontSize: 11.5, fontWeight: 500 }}>reportes</Typography>
        </Box>
      </Box>
      <Stack spacing={1.25} sx={{ width: "100%", maxWidth: 260 }}>
        {data.map((d) => (
          <Box key={d.label} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: d.color, flexShrink: 0 }} />
            <Typography variant="body2" color="#353136" fontWeight={600} sx={{ flex: 1 }}>{d.label}</Typography>
            <Typography variant="body2" color="#77737A" fontWeight={700}>{d.value}</Typography>
            <Typography variant="caption" color="#C6C2C8" fontWeight={600} sx={{ width: 40, textAlign: "right" }}>
              {total > 0 ? Math.round((d.value / total) * 100) : 0}%
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function AreaChart({ data, height = 160 }) {
  if (!data || data.length === 0) return null;
  
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const width = 100;
  const padding = 10;
  const chartHeight = height - padding * 2;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = padding + chartHeight - (d.value / maxValue) * chartHeight;
    return { x, y, ...d };
  });
  
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <Box sx={{ width: "100%", height, position: "relative" }}>
      <svg width="100%" height={height} preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#680036" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#680036" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGradient)" />
        <path d={linePath} fill="none" stroke="#680036" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#680036" opacity="0.6" />
        ))}
      </svg>
    </Box>
  );
}

function TimelineDot({ color, isLast }) {
  return (
    <Stack alignItems="center" sx={{ width: 32, flexShrink: 0 }}>
      <Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: color, border: "3px solid #f0e2e8", zIndex: 1, flexShrink: 0 }} />
      {!isLast && <Box sx={{ width: 2, flex: 1, bgcolor: "#f0e2e8", minHeight: 24 }} />}
    </Stack>
  );
}

function TimelineSkeleton() {
  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
      {[0, 1, 2].map((i) => (
        <Box key={i} sx={{ display: "flex", gap: 2, py: 1.5 }}>
          <Stack alignItems="center" sx={{ width: 32, flexShrink: 0 }}>
            <Skeleton variant="circular" width={14} height={14} />
            {i < 2 && <Box sx={{ width: 2, flex: 1, bgcolor: "#f0e2e8", minHeight: 24, mt: 0.5 }} />}
          </Stack>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Skeleton variant="circular" width={28} height={28} />
              <Skeleton variant="text" width="55%" height={20} />
              <Skeleton variant="text" width={60} height={16} sx={{ ml: "auto" }} />
            </Stack>
            <Stack direction="row" spacing={1} sx={{ ml: 5 }}>
              <Skeleton variant="rounded" width={64} height={20} sx={{ borderRadius: 999 }} />
              <Skeleton variant="rounded" width={80} height={20} sx={{ borderRadius: 999 }} />
            </Stack>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function relativeTime(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now - d;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `Hace ${days}d`;
  return d.toLocaleDateString("es-EC", { day: "2-digit", month: "short" });
}

function StudentDashboardPage() {
  const navigate = useNavigate();
  const { reports, loading, error, getReportes } = useReports();

  useEffect(() => {
    const role = sessionStorage.getItem("userRole");
    if (role !== "estudiante") {
      navigate("/ingreso", { replace: true });
      return;
    }
    getReportes({ todos: false, limit: 500 });
  }, [navigate, getReportes]);

  const pendientes = reports.filter((r) => r.estado === "pendiente").length;
  const enProceso = reports.filter((r) => r.estado === "en_proceso").length;
  const resueltos = reports.filter((r) => r.estado === "resuelto").length;

  const [filter, setFilter] = useState("todos");

  const filterTabs = [
    { key: "todos", label: "Mis reportes", count: reports.length },
    { key: "seguimiento", label: "En seguimiento", count: pendientes + enProceso },
    { key: "resueltos", label: "Resueltos", count: resueltos },
  ];

  const filteredReports = reports.filter((r) => {
    if (filter === "seguimiento") return r.estado === "pendiente" || r.estado === "en_proceso";
    if (filter === "resueltos") return r.estado === "resuelto";
    return true;
  });

  // Chart data
  const statusData = useMemo(() => {
    return [
      { label: "Pendientes", value: pendientes, color: "#680036" },
      { label: "En proceso", value: enProceso, color: "#FCC019" },
      { label: "Resueltos", value: resueltos, color: "#1f7a3f" },
      { label: "Rechazados", value: reports.filter(r => r.estado === "rechazado").length, color: "#ba1a1a" },
    ];
  }, [reports, pendientes, enProceso, resueltos]);

  const activityData = useMemo(() => {
    const last30Days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = reports.filter(r => r.creado_en && r.creado_en.startsWith(dateStr)).length;
      last30Days.push({ date: dateStr, value: count });
    }
    return last30Days;
  }, [reports]);

  const summaryItems = [
    { label: "Mis reportes", value: reports.length, icon: "description", color: "#680036", bg: "linear-gradient(135deg, #f7e6eb 0%, #fce4ec 100%)" },
    { label: "Pendientes", value: pendientes, icon: "pending", color: "#ba1a1a", bg: "linear-gradient(135deg, #fde9ef 0%, #ffebee 100%)" },
    { label: "En proceso", value: enProceso, icon: "autorenew", color: "#785900", bg: "linear-gradient(135deg, #fff7d9 0%, #fff9e6 100%)" },
    { label: "Resueltos", value: resueltos, icon: "task_alt", color: "#1f7a3f", bg: "linear-gradient(135deg, #e8f7ed 0%, #f1f8f4 100%)" },
  ];

  return (
    <DashboardLayout subtitle="Panel estudiantil" currentPage="Panel de Control" decor="student">
      <Fade in timeout={350}>
        <Box>
          <Box sx={{ mb: 3.5 }}>
            <Typography variant="h5" fontWeight={800} color="#18151A" sx={{ letterSpacing: "-0.02em" }}>
              Hola de nuevo
            </Typography>
            <Typography variant="body2" color="#77737A" sx={{ mt: 0.5 }}>
              Aquí tienes el historial de tus gestiones institucionales.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, p: 0.5, borderRadius: "999px", bgcolor: "#F7F7F9", border: "1px solid #ECECEF", width: "fit-content", flexWrap: "wrap", mb: 3 }}>
            {filterTabs.map((t) => (
              <Box
                key={t.key}
                onClick={() => setFilter(t.key)}
                sx={{
                  display: "flex", alignItems: "center", gap: 0.75, cursor: "pointer",
                  px: 2, py: 1, borderRadius: "999px",
                  bgcolor: filter === t.key ? "#FCC019" : "transparent",
                  color: filter === t.key ? "#251A00" : "#77737A",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                  "&:hover": { color: filter === t.key ? "#251A00" : "#353136" },
                }}
              >
                <Typography component="span" sx={{ fontWeight: 700, fontSize: 12.5, lineHeight: 1 }}>{t.label}</Typography>
                <Box sx={{ minWidth: 20, height: 20, px: 0.6, borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: filter === t.key ? "rgba(37,26,0,0.14)" : "#ECECEF", fontSize: 10.5, fontWeight: 700, lineHeight: 1 }}>
                  {loading ? "…" : t.count}
                </Box>
              </Box>
            ))}
          </Box>

          {!loading && reports.length > 0 && (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.2fr 1fr" }, gap: 2.5, mb: 3, alignItems: "stretch" }}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "20px",
                  border: "1px solid #ECECEF",
                  bgcolor: "#FFFFFF",
                  p: { xs: 2.5, md: 3 },
                  boxShadow: "0 1px 4px rgba(47,0,24,0.05)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: "11px", bgcolor: "#FFF4CC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#785900" }}>trending_up</span>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="#18151A">Actividad reciente</Typography>
                    <Typography variant="caption" color="#77737A">Últimos 30 días</Typography>
                  </Box>
                </Stack>
                <AreaChart data={activityData} height={180} />
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  borderRadius: "20px",
                  border: "1px solid #ECECEF",
                  bgcolor: "#FFFFFF",
                  p: { xs: 2.5, md: 3 },
                  boxShadow: "0 1px 4px rgba(47,0,24,0.05)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: "11px", bgcolor: "#F7E6EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#680036" }}>pie_chart</span>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="#18151A">Distribución por estado</Typography>
                    <Typography variant="caption" color="#77737A">Tus reportes</Typography>
                  </Box>
                </Stack>
                <DonutChart data={statusData.filter(d => d.value > 0)} total={reports.length} />
              </Paper>
            </Box>
          )}

          <Paper
            elevation={0}
            sx={{
              borderRadius: "20px",
              border: "1px solid #ECECEF",
              bgcolor: "#FFFFFF",
              p: { xs: 2.5, md: 3.5 },
              mb: 3,
              boxShadow: "0 1px 4px rgba(47,0,24,0.05)",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
                gap: { xs: 2.5, md: 0 },
              }}
            >
              {summaryItems.map((item, i) => (
                <Box
                  key={item.label}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.75,
                    px: { md: 2 },
                    borderLeft: { md: i > 0 ? "1px solid #F0EDEF" : "none" },
                  }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "13px",
                      background: item.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: item.color,
                      flexShrink: 0,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 21 }}>{item.icon}</span>
                  </Box>
                  <Box>
                    {loading ? (
                      <Skeleton variant="text" width={36} height={30} />
                    ) : (
                      <Typography sx={{ fontWeight: 800, color: "#18151A", fontSize: 22, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                        {item.value}
                      </Typography>
                    )}
                    <Typography sx={{ color: "#77737A", fontSize: 11.5, fontWeight: 500 }}>
                      {item.label}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              borderRadius: "20px",
              border: "1px solid #ECECEF",
              bgcolor: "#FFFFFF",
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(47,0,24,0.05)",
            }}
          >
            <Box sx={{ px: { xs: 2.5, md: 3.5 }, py: 2.25, borderBottom: "1px solid #F0EDEF", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 34, height: 34, borderRadius: "10px", bgcolor: "#FFF4CC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#785900" }}>history</span>
                </Box>
                <Typography variant="subtitle2" fontWeight={700} color="#18151A">Historial de reportes</Typography>
                <Chip label={filteredReports.length} size="small" sx={{ height: 20, fontSize: 11, bgcolor: "#F0EDEF", color: "#77737A", fontWeight: 600 }} />
              </Stack>
              <Button
                size="small"
                startIcon={<span className="material-symbols-outlined" style={{ fontSize: 17 }}>add</span>}
                onClick={() => navigate("/nuevo-reporte")}
                sx={{
                  bgcolor: "#FCC019",
                  color: "#251A00",
                  fontWeight: 700,
                  borderRadius: "12px",
                  px: 2,
                  textTransform: "none",
                  fontSize: 12,
                  "&:hover": { bgcolor: "#e6ac15" },
                }}
              >
                Nuevo reporte
              </Button>
            </Box>

            {loading && <TimelineSkeleton />}

            {error && (
              <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>{error}</Alert>
            )}

            {!loading && !error && reports.length === 0 && (
              <Box sx={{ py: 8, textAlign: "center", px: 3 }}>
                <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: "#FFF4CC", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 34, color: "#785900" }}>history</span>
                </Box>
                <Typography variant="h6" fontWeight={700} color="#18151A">Aún no tienes reportes</Typography>
                <Typography variant="body2" color="#77737A" sx={{ mt: 0.75, mb: 3, maxWidth: 340, mx: "auto", lineHeight: 1.65 }}>
                  Cuando compartas tu primer reporte, podrás seguir su estado desde aquí.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate("/nuevo-reporte")}
                  sx={{
                    bgcolor: "#FCC019",
                    color: "#251A00",
                    fontWeight: 700,
                    borderRadius: "12px",
                    px: 3.5,
                    py: 1.3,
                    textTransform: "none",
                    boxShadow: "0 4px 14px rgba(252,192,25,0.3)",
                    "&:hover": { bgcolor: "#e6ac15" },
                  }}
                >
                  Crear mi primer reporte
                </Button>
              </Box>
            )}

            {!loading && !error && reports.length > 0 && filteredReports.length === 0 && (
              <Box sx={{ py: 7, textAlign: "center", px: 3 }}>
                <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "#F7F7F9", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 30, color: "#969198" }}>filter_alt_off</span>
                </Box>
                <Typography variant="h6" fontWeight={700} color="#18151A">No hay reportes en este estado</Typography>
                <Typography variant="body2" color="#77737A" sx={{ mt: 0.75, maxWidth: 340, mx: "auto", lineHeight: 1.65 }}>
                  Prueba con otra categoría para ver más de tu historial.
                </Typography>
              </Box>
            )}

            {!loading && !error && filteredReports.length > 0 && (
              <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
                {filteredReports.map((report, idx) => {
                  const tipo = TIPO_META[report.tipo] || TIPO_META.queja;
                  const status = STATUS_META[report.estado] || STATUS_META.pendiente;
                  const isLast = idx === filteredReports.length - 1;
                  return (
                    <Box
                      key={report.id}
                      onClick={() => navigate(`/reporte/${report.id}`)}
                      sx={{
                        display: "flex",
                        gap: 2,
                        cursor: "pointer",
                        py: 1.5,
                        px: 1.5,
                        borderRadius: "14px",
                        transition: "background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                        "&:hover": { bgcolor: "#FAF9F7" },
                      }}
                    >
                      <TimelineDot color={status.dot} isLast={isLast} />
                      <Box sx={{ flex: 1, minWidth: 0, pb: isLast ? 0 : 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                          <Avatar sx={{ bgcolor: tipo.bg, color: tipo.fg, width: 28, height: 28 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{tipo.icon}</span>
                          </Avatar>
                          {report.emocion && (
                            <Box
                              sx={{
                                width: 22, height: 22, borderRadius: "7px",
                                bgcolor: (EMOCION_COLORS[report.tipo] || EMOCION_COLORS.queja).bg,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <span className="material-symbols-outlined" style={{
                                fontSize: 13,
                                color: (EMOCION_COLORS[report.tipo] || EMOCION_COLORS.queja).fg,
                                fontVariationSettings: "'FILL' 1"
                              }}>
                                {EMOCION_ICONS[report.emocion] || "sentiment_neutral"}
                              </span>
                            </Box>
                          )}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={700} color="#18151A" noWrap>
                              {report.issue}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="#969198" sx={{ flexShrink: 0 }}>
                            {relativeTime(report.creado_en)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 5 }}>
                          <Chip label={report.category} size="small" sx={{ bgcolor: tipo.bg, color: tipo.fg, fontWeight: 600, fontSize: 10, height: 20 }} />
                          <Chip label={status.label} size="small" sx={{ bgcolor: status.bg, color: status.fg, fontWeight: 600, fontSize: 10, height: 20 }} />
                        </Stack>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Box>
      </Fade>
    </DashboardLayout>
  );
}

export default StudentDashboardPage;
