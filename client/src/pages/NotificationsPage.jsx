import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  CircularProgress,
} from "@mui/material";
import { useNotifications } from "../context/useNotifications.js";
import DashboardLayout from "../components/DashboardLayout.jsx";

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
  if (days < 7) return `Hace ${days}d`;
  if (days < 30) return `Hace ${Math.floor(days / 7)} sem`;
  return d.toLocaleDateString("es-EC", { day: "2-digit", month: "short" });
}

function getNotifIcon(tipo) {
  switch (tipo) {
    case "estado_cambio":
      return { icon: "swap_vert", bg: "#fff5db", fg: "#785900" };
    case "comentario_nuevo":
      return { icon: "chat", bg: "#e8f7ed", fg: "#1f7a3f" };
    case "nuevo_reporte":
      return { icon: "add_circle", bg: "#f7e6eb", fg: "#680036" };
    default:
      return { icon: "notifications", bg: "#f7e6eb", fg: "#680036" };
  }
}

function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleClick = (notif) => {
    if (!notif.leida) {
      markAsRead(notif.id);
    }
    if (notif.reporte_id) {
      navigate(`/reporte/${notif.reporte_id}`);
    }
  };

  return (
    <DashboardLayout subtitle="Notificaciones" currentPage="Notificaciones" decor="notifications">
      <Paper elevation={0} sx={{ bgcolor: "#ffffff", borderRadius: "20px", border: "1px solid #ECECEF", p: { xs: 2.5, md: 3 }, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ width: 36, height: 36, borderRadius: "12px", bgcolor: "#F7E6EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#680036" }}>notifications</span>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#18151A" sx={{ lineHeight: 1.2 }}>Notificaciones</Typography>
              <Typography variant="caption" color="#77737A">
                {unreadCount > 0
                  ? `Tienes ${unreadCount} notificacion${unreadCount !== 1 ? "es" : ""} sin leer`
                  : "No tienes notificaciones pendientes"}
              </Typography>
            </Box>
          </Stack>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={markAllAsRead}
              sx={{
                textTransform: "none", fontWeight: 600, borderRadius: "12px", color: "#680036",
                border: "1px solid #ECECEF", px: 2,
                "&:hover": { bgcolor: "#F7F7F9", borderColor: "#680036" },
              }}
            >
              Marcar todas leidas
            </Button>
          )}
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: "20px", border: "1px solid #ECECEF", overflow: "hidden" }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: "#680036" }} />
          </Box>
        )}

        {!loading && notifications.length === 0 && (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 56, color: "#D8D4DA" }}>notifications_off</span>
            <Typography variant="h6" fontWeight={700} color="#18151A" sx={{ mt: 1.5 }}>
              No hay notificaciones
            </Typography>
            <Typography variant="body2" color="#77737A" sx={{ mt: 0.5 }}>
              Cuando haya actividad en tus reportes, aparecera aqui.
            </Typography>
          </Box>
        )}

        {!loading && notifications.length > 0 && (
          <Stack spacing={0}>
            {notifications.map((notif) => {
              const meta = getNotifIcon(notif.tipo);
              return (
                <Box
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  sx={{
                    display: "flex",
                    gap: 2,
                    px: 2.5,
                    py: 2,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    bgcolor: notif.leida ? "transparent" : "rgba(104,0,54,0.03)",
                    borderBottom: "1px solid #ECECEF",
                    "&:hover": { bgcolor: "#F7F7F9" },
                  }}
                >
                  <Box sx={{ width: 40, height: 40, borderRadius: "12px", bgcolor: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: meta.fg }}>{meta.icon}</span>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Typography variant="body2" color="#18151A" fontWeight={notif.leida ? 500 : 700} sx={{ flex: 1 }}>
                        {notif.mensaje}
                      </Typography>
                      {!notif.leida && (
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#ba1a1a", flexShrink: 0, mt: 0.6, boxShadow: "0 0 0 2px rgba(186,26,26,0.2)" }} />
                      )}
                    </Stack>
                    <Typography variant="caption" color="#969198" sx={{ mt: 0.25, display: "block" }}>
                      {relativeTime(notif.creado_en)}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Paper>
    </DashboardLayout>
  );
}

export default NotificationsPage;
