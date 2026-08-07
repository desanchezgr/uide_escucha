import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Stack, Chip, Alert,
  IconButton, Tooltip, Skeleton, Fade,
} from "@mui/material";
import { useReports } from "../context/useReports.js";
import { useToast } from "../context/useToast.js";
import DashboardLayout from "../components/DashboardLayout.jsx";
import CampusHeatmap3D from "../components/CampusHeatmap3D.jsx";
import { getUrgencia, clasificacionLabel } from "../components/reportMeta.js";

const ROLES_ADMIN = [
  "admin", "prorector", "ti_soporte", "bibliotecario", "conserje",
  "mantenimiento", "secretaria", "bienestar universitario", "financiero",
];

const AREA_LABELS = {
  ti_soporte: "Soporte TI", bibliotecario: "Biblioteca", conserje: "Limpieza",
  mantenimiento: "Mantenimiento", secretaria: "Secretaría",
  "bienestar universitario": "Bienestar", financiero: "Financiero",
};

const TIPO_COLORS = {
  queja: { bg: "#fde9ef", fg: "#680036", icon: "report" },
  incidente: { bg: "#fde9ef", fg: "#680036", icon: "report" },
  sugerencia: { bg: "#fff5db", fg: "#785900", icon: "lightbulb" },
  felicitacion: { bg: "#e8f7ed", fg: "#1f7a3f", icon: "celebration" },
  peticion: { bg: "#e8eaf6", fg: "#303f9f", icon: "handshake" },
};

const STATUS_META = {
  pendiente: { label: "Pendiente", dot: "#680036" },
  en_proceso: { label: "En proceso", dot: "#FCC019" },
  resuelto: { label: "Resuelto", dot: "#1f7a3f" },
  rechazado: { label: "Rechazado", dot: "#ba1a1a" },
};

function StatusDot({ estado }) {
  const meta = STATUS_META[estado] || STATUS_META.pendiente;
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: meta.dot, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#353136", whiteSpace: "nowrap" }}>{meta.label}</Typography>
    </Stack>
  );
}

function AnimatedBar({ pct, color }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setW(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);
  return (
    <Box sx={{ height: 10, borderRadius: 999, bgcolor: "#F0EDEF", overflow: "hidden" }}>
      <Box
        sx={{
          width: `${w}%`,
          height: "100%",
          borderRadius: 999,
          background: `linear-gradient(90deg, ${color}, ${color}D9)`,
          transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </Box>
  );
}

function Donut({ data, total, size = 168, stroke = 20 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const arcs = data.filter((d) => d.value > 0).reduce((list, d) => {
    const acc = list.length > 0 ? list[list.length - 1].acc : 0;
    const frac = total > 0 ? d.value / total : 0;
    const len = frac * c;
    list.push({ ...d, dasharray: `${Math.max(len - 2, 1)} ${c}`, offset: -acc * c, acc: acc + frac });
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
          <Typography sx={{ fontWeight: 800, color: "#18151A", fontSize: 30, lineHeight: 1, letterSpacing: "-0.02em" }}>{total}</Typography>
          <Typography sx={{ color: "#77737A", fontSize: 11.5, fontWeight: 500 }}>reportes</Typography>
        </Box>
      </Box>
      <Stack spacing={1.25} sx={{ width: "100%", maxWidth: 250 }}>
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

function AreasChart({ data, max }) {
  return (
    <Stack spacing={2}>
      {data.map((a, i) => {
        const pct = max > 0 ? Math.round((a.value / max) * 100) : 0;
        return (
          <Box key={a.label}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 0.75 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 22, height: 22, borderRadius: "8px", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800,
                    bgcolor: i === 0 ? "#F7E6EB" : "#F0EDEF",
                    color: i === 0 ? "#680036" : "#77737A",
                  }}
                >
                  {i + 1}
                </Box>
                <Typography variant="body2" color="#353136" fontWeight={600} noWrap>{a.label}</Typography>
              </Box>
              <Typography variant="body2" color="#77737A" fontWeight={700} sx={{ whiteSpace: "nowrap" }}>
                {a.value} <Box component="span" sx={{ color: "#C6C2C8", fontWeight: 600, fontSize: 11 }}>reportes</Box>
              </Typography>
            </Box>
            <AnimatedBar pct={pct} color={i === 0 ? "#680036" : "#9A6B80"} />
          </Box>
        );
      })}
    </Stack>
  );
}

function RecentSkeleton() {
  return (
    <Stack spacing={0}>
      {[0, 1, 2, 3].map((i) => (
        <Box key={i} sx={{ display: "flex", gap: 2, px: { xs: 2, md: 2.5 }, py: 2, alignItems: "center" }}>
          <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: "12px", flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" height={18} />
            <Skeleton variant="text" width="60%" height={14} sx={{ mt: 0.5 }} />
          </Box>
          <Skeleton variant="rounded" width={74} height={22} sx={{ borderRadius: 999 }} />
        </Box>
      ))}
    </Stack>
  );
}

function AdminDashboardPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { reports, loading, error, getReportes, eliminarReporte, getGlobalStats } = useReports();
  const userRole = sessionStorage.getItem("userRole");
  const isAdmin = ROLES_ADMIN.includes(userRole);
  const isSuperAdmin = userRole === "admin" || userRole === "prorector";
  const [globalStats, setGlobalStats] = useState(null);

  useEffect(() => {
    if (!ROLES_ADMIN.includes(userRole)) {
      navigate("/ingreso", { replace: true });
      return;
    }
    getReportes();
    getGlobalStats().then((s) => { if (s) setGlobalStats(s); });
  }, [navigate, getReportes, userRole, getGlobalStats]);

  const handleDelete = async (id) => {
    if (!window.confirm("Eliminar este reporte?")) return;
    try {
      await eliminarReporte(id);
      toast("Reporte eliminado correctamente.", "success");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const stats = useMemo(() => {
    if (globalStats) {
      return {
        total: globalStats.total || 0,
        pendientes: globalStats.pendientes || 0,
        enProceso: globalStats.enProceso || 0,
        resueltos: globalStats.resueltos || 0,
        rechazados: globalStats.rechazados || 0,
        urgentes: globalStats.urgentes || 0,
      };
    }
    const pendientes = reports.filter((r) => r.estado === "pendiente").length;
    const enProceso = reports.filter((r) => r.estado === "en_proceso").length;
    const resueltos = reports.filter((r) => r.estado === "resuelto").length;
    const rechazados = reports.filter((r) => r.estado === "rechazado").length;
    const urgentes = reports.filter((r) => r.urgencia === "critica" || r.urgencia === "alta").length;
    const total = reports.length;
    return { total, pendientes, enProceso, resueltos, rechazados, urgentes };
  }, [globalStats, reports]);

  const summaryItems = [
    { label: "Total", value: stats.total, fg: "#680036" },
    { label: "Pendientes", value: stats.pendientes, fg: "#680036" },
    { label: "En proceso", value: stats.enProceso, fg: "#785900" },
    { label: "Resueltos", value: stats.resueltos, fg: "#1f7a3f" },
    { label: "Rechazados", value: stats.rechazados, fg: "#ba1a1a" },
    { label: "Urgentes", value: stats.urgentes, fg: "#d97706" },
  ];

  const distribution = [
    { label: "Pendientes", value: stats.pendientes, color: "#680036" },
    { label: "En proceso", value: stats.enProceso, color: "#785900" },
    { label: "Resueltos", value: stats.resueltos, color: "#1f7a3f" },
    { label: "Rechazados", value: stats.rechazados, color: "#ba1a1a" },
  ];

  const areaCounts = useMemo(() => {
    const map = {};
    reports.forEach((r) => {
      if (!r.area) return;
      const key = AREA_LABELS[r.area] || r.area;
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [reports]);
  const areaMax = Math.max(...areaCounts.map((a) => a.value), 1);

  const today = new Date().toLocaleDateString("es-EC", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const areaLabel = AREA_LABELS[userRole] || (userRole === "prorector" ? "Todas las áreas" : "Gestión");

  const [filter, setFilter] = useState("nuevos");
  const [recentPage, setRecentPage] = useState(1);
  const RECENT_PER_PAGE = 10;

  const handleFilterChange = (key) => { setFilter(key); setRecentPage(1); };

  const adminTabs = [
    { key: "nuevos", label: "Nuevos", count: stats.pendientes },
    { key: "revision", label: "En revisión", count: stats.enProceso },
    { key: "resueltos", label: "Resueltos", count: stats.resueltos },
  ];

  const areaFiltered = useMemo(() => {
    if (!isAdmin || isSuperAdmin) return reports;
    return reports.filter((r) => r.area === userRole);
  }, [reports, isAdmin, isSuperAdmin, userRole]);

  const recentFiltered = areaFiltered.filter((r) => {
    if (filter === "nuevos") return r.estado === "pendiente";
    if (filter === "revision") return r.estado === "en_proceso";
    if (filter === "resueltos") return r.estado === "resuelto";
    return true;
  });

  const recentTotal = recentFiltered.length;
  const recentTotalPages = Math.max(1, Math.ceil(recentTotal / RECENT_PER_PAGE));
  const recentPaged = recentFiltered.slice((recentPage - 1) * RECENT_PER_PAGE, recentPage * RECENT_PER_PAGE);

  return (
    <DashboardLayout subtitle="Gestión institucional" decor="admin">
      <Fade in timeout={350}>
        <Box>
          <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 2, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="body2" color="#77737A" sx={{ mb: 0.5, textTransform: "capitalize" }}>{today}</Typography>
              <Typography variant="h5" fontWeight={800} color="#18151A" sx={{ letterSpacing: "-0.02em" }}>
                Panel de Control
              </Typography>
              <Typography variant="body2" color="#77737A" sx={{ mt: 0.5 }}>
                Resumen de métricas y gestión institucional.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, bgcolor: "#F7E6EB", px: 2, py: 1.25, borderRadius: "14px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#680036" }}>folder</span>
              <Box>
                <Typography variant="caption" color="#680036" fontWeight={700} sx={{ display: "block", lineHeight: 1.2 }}>{areaLabel}</Typography>
                <Typography variant="caption" color="#8A515E">{stats.pendientes} pendiente{stats.pendientes !== 1 ? "s" : ""}</Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, p: 0.5, borderRadius: "999px", bgcolor: "#F7F7F9", border: "1px solid #ECECEF", width: "fit-content", flexWrap: "wrap", mb: 2.5 }}>
            {adminTabs.map((t) => (
              <Box
                key={t.key}
                onClick={() => handleFilterChange(t.key)}
                sx={{
                  display: "flex", alignItems: "center", gap: 0.75, cursor: "pointer",
                  px: 2, py: 1, borderRadius: "999px",
                  bgcolor: filter === t.key ? "#680036" : "transparent",
                  color: filter === t.key ? "#ffffff" : "#77737A",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                  "&:hover": { color: filter === t.key ? "#ffffff" : "#353136" },
                }}
              >
                <Typography component="span" sx={{ fontWeight: 700, fontSize: 12.5, lineHeight: 1 }}>{t.label}</Typography>
                <Box sx={{ minWidth: 20, height: 20, px: 0.6, borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: filter === t.key ? "rgba(255,255,255,0.2)" : "#ECECEF", fontSize: 10.5, fontWeight: 700, lineHeight: 1 }}>
                  {loading ? "…" : t.count}
                </Box>
              </Box>
            ))}
          </Box>

          <Paper
            elevation={0}
            sx={{ borderRadius: "20px", border: "1px solid #ECECEF", bgcolor: "#FFFFFF", p: { xs: 2, md: 2.5 }, mb: 2.5, boxShadow: "0 1px 4px rgba(47,0,24,0.05)" }}
          >
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(6, 1fr)" }, gap: 1 }}>
              {summaryItems.map((s, i) => (
                <Box
                  key={s.label}
                  sx={{ textAlign: "center", py: 1, borderLeft: { md: i > 0 ? "1px solid #F0EDEF" : "none" } }}
                >
                  {loading ? (
                    <Skeleton variant="text" width={40} height={34} sx={{ mx: "auto" }} />
                  ) : (
                    <Typography sx={{ fontWeight: 800, color: s.fg, fontSize: 26, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                      {s.value}
                    </Typography>
                  )}
                  <Typography sx={{ color: "#77737A", fontSize: 11.5, fontWeight: 500 }}>{s.label}</Typography>
                </Box>
              ))}
            </Box>

            {!loading && stats.pendientes > 0 && (
              <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #F0EDEF", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 30, height: 30, borderRadius: "10px", bgcolor: "#fde9ef", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#ba1a1a" }}>priority_high</span>
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={700} color="#18151A">
                      {stats.pendientes} reporte{stats.pendientes !== 1 ? "s" : ""} requiere{stats.pendientes === 1 ? "" : "n"} atención
                    </Typography>
                    <Typography variant="caption" color="#77737A">Revisa los casos pendientes para darles seguimiento.</Typography>
                  </Box>
                </Stack>
                <ButtonLink onClick={() => navigate("/reportes")}>Revisar pendientes</ButtonLink>
              </Box>
            )}
          </Paper>

          {!loading && stats.total > 0 && (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2.5, mb: 2.5, alignItems: "stretch" }}>
              <Paper elevation={0} sx={{ borderRadius: "20px", border: "1px solid #ECECEF", bgcolor: "#FFFFFF", p: { xs: 2, md: 2.5 }, display: "flex", flexDirection: "column", boxShadow: "0 1px 4px rgba(47,0,24,0.05)" }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: "11px", bgcolor: "#F7E6EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#680036" }}>pie_chart</span>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="#18151A">Distribución por estado</Typography>
                    <Typography variant="caption" color="#77737A">Reportes por etapa de gestión</Typography>
                  </Box>
                </Stack>
                <Donut data={distribution} total={stats.total} />
              </Paper>

              {areaCounts.length > 0 && (
                <Paper elevation={0} sx={{ borderRadius: "20px", border: "1px solid #ECECEF", bgcolor: "#FFFFFF", p: { xs: 2, md: 2.5 }, display: "flex", flexDirection: "column", boxShadow: "0 1px 4px rgba(47,0,24,0.05)" }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                    <Box sx={{ width: 34, height: 34, borderRadius: "11px", bgcolor: "#F7E6EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#680036" }}>leaderboard</span>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} color="#18151A">Áreas más activas</Typography>
                      <Typography variant="caption" color="#77737A">Top áreas por reportes registrados</Typography>
                    </Box>
                  </Stack>
                  <AreasChart data={areaCounts} max={areaMax} />
                </Paper>
              )}
            </Box>
          )}

          <CampusHeatmap3D />

          <Paper elevation={0} sx={{ borderRadius: "20px", border: "1px solid #ECECEF", overflow: "hidden", boxShadow: "0 1px 4px rgba(47,0,24,0.05)" }}>
            <Box sx={{ px: { xs: 2, md: 2.5 }, py: 2, borderBottom: "1px solid #ECECEF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 32, height: 32, borderRadius: "10px", bgcolor: "#F7E6EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#680036" }}>receipt_long</span>
                </Box>
                <Typography variant="subtitle2" fontWeight={700} color="#18151A">Reportes recientes</Typography>
                <Chip label={recentFiltered.length} size="small" sx={{ height: 20, fontSize: 11, bgcolor: "#F0EDEF", color: "#353136", fontWeight: 600 }} />
              </Stack>
              <Typography variant="caption" fontWeight={600} color="#680036" sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                onClick={() => navigate("/reportes")}>Ver todos</Typography>
            </Box>

            {loading && <RecentSkeleton />}
            {error && <Alert severity="error" sx={{ m: 2, borderRadius: "12px" }}>{error}</Alert>}

            {!loading && !error && recentFiltered.length === 0 && (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 52, color: "#D8D4DA" }}>inbox</span>
                <Typography variant="h6" fontWeight={700} color="#18151A" sx={{ mt: 1.5 }}>No hay reportes en este estado</Typography>
                <Typography variant="body2" color="#77737A" sx={{ mt: 0.5 }}>Prueba con otra categoría del filtro.</Typography>
              </Box>
            )}

            <Stack spacing={0} divider={<Box sx={{ height: "1px", bgcolor: "#F0EDEF" }} />}>
              {recentPaged.map((report) => {
                const tipo = TIPO_COLORS[report.tipo] || TIPO_COLORS.queja;
                return (
                  <Box
                    key={report.id}
                    sx={{ display: "flex", alignItems: "center", gap: 1.5, px: { xs: 2, md: 2.5 }, py: 1.5, cursor: "pointer", transition: "all 0.15s ease", "&:hover": { bgcolor: "#F8F9FB" } }}
                    onClick={() => navigate(`/reporte/${report.id}`)}
                  >
                    <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: tipo.bg, color: tipo.fg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{tipo.icon}</span>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} color="#18151A" noWrap>{report.issue}</Typography>
                      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
                        <Typography variant="caption" color="#969198" noWrap>{report.student}</Typography>
                        <Typography variant="caption" color="#C6C2C8">·</Typography>
                        <Typography variant="caption" color="#969198">{report.date}</Typography>
                        {report.area && (
                          <>
                            <Typography variant="caption" color="#C6C2C8">·</Typography>
                            <Chip label={AREA_LABELS[report.area] || report.area} size="small"
                              sx={{ height: 18, fontSize: 10, bgcolor: "#F0EDEF", color: "#353136", fontWeight: 600, maxWidth: 90,
                                "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }} />
                          </>
                        )}
                      </Stack>
                    </Box>
                    <Box sx={{ flexShrink: 0 }}>
                      <StatusDot estado={report.estado} />
                    </Box>
                  </Box>
                );
              })}
            </Stack>

            {recentTotalPages > 1 && (
              <Box sx={{ px: { xs: 2, md: 2.5 }, py: 1.5, borderTop: "1px solid #F0EDEF", display: "flex", justifyContent: "center", alignItems: "center", gap: 0.5 }}>
                <IconButton size="small" disabled={recentPage <= 1} onClick={() => setRecentPage((p) => p - 1)}
                  sx={{ color: "#680036", "&.Mui-disabled": { color: "#D8D4DA" } }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_left</span>
                </IconButton>
                {Array.from({ length: Math.min(recentTotalPages, 5) }, (_, i) => {
                  let p;
                  if (recentTotalPages <= 5) p = i + 1;
                  else if (recentPage <= 3) p = i + 1;
                  else if (recentPage >= recentTotalPages - 2) p = recentTotalPages - 4 + i;
                  else p = recentPage - 2 + i;
                  return (
                    <Box key={p} onClick={() => setRecentPage(p)}
                      sx={{ minWidth: 30, height: 30, borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700,
                        bgcolor: p === recentPage ? "#680036" : "transparent", color: p === recentPage ? "#ffffff" : "#77737A",
                        "&:hover": { bgcolor: p === recentPage ? "#56002D" : "#F0EDEF" } }}>
                      {p}
                    </Box>
                  );
                })}
                <IconButton size="small" disabled={recentPage >= recentTotalPages} onClick={() => setRecentPage((p) => p + 1)}
                  sx={{ color: "#680036", "&.Mui-disabled": { color: "#D8D4DA" } }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_right</span>
                </IconButton>
              </Box>
            )}
          </Paper>
        </Box>
      </Fade>
    </DashboardLayout>
  );
}

function ButtonLink({ children, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        bgcolor: "#680036", color: "#ffffff", fontWeight: 700, fontSize: 13,
        px: 2.5, py: 1.2, borderRadius: "12px", cursor: "pointer",
        "&:hover": { bgcolor: "#56002D" },
      }}
    >
      {children}
    </Box>
  );
}

export default AdminDashboardPage;
