import { useState } from "react";
import { Box, Typography, Button, Stack, IconButton, Drawer, Badge } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/useNotifications.js";

const ROLES_ADMIN = [
  "admin", "prorector", "ti_soporte", "bibliotecario", "conserje",
  "mantenimiento", "secretaria", "bienestar universitario", "financiero",
];

const DECORATIONS = {
  default: [
    { top: 40, right: -60, width: 360, height: 360, radius: "50%", bg: "rgba(104,0,54,0.07)" },
    { bottom: 60, left: -60, width: 440, height: 440, radius: "50%", bg: "rgba(252,192,25,0.08)" },
    { top: "30%", left: "5%", width: 140, height: 140, radius: "0", bg: "rgba(104,0,54,0.05)", rotate: true },
    { bottom: "25%", right: "8%", width: 100, height: 100, radius: "50%", border: "3px solid rgba(252,192,25,0.12)" },
  ],
  admin: [
    { top: -40, right: -80, width: 500, height: 500, radius: "50%", bg: "rgba(104,0,54,0.08)" },
    { bottom: 80, left: -60, width: 300, height: 300, radius: "0", bg: "rgba(104,0,54,0.05)", rotate: true },
    { bottom: "15%", right: "20%", width: 160, height: 160, radius: "50%", border: "3px solid rgba(104,0,54,0.12)" },
    { top: "40%", left: "15%", width: 80, height: 80, radius: "50%", bg: "rgba(104,0,54,0.06)" },
    { top: "10%", left: "30%", width: 200, height: 200, radius: "50%", bg: "rgba(252,192,25,0.05)" },
  ],
  student: [
    { top: 20, left: -80, width: 420, height: 420, radius: "50%", bg: "rgba(252,192,25,0.09)" },
    { bottom: 20, right: -60, width: 350, height: 350, radius: "50%", bg: "rgba(104,0,54,0.05)" },
    { top: "15%", right: "12%", width: 100, height: 100, radius: "50%", border: "3px solid rgba(252,192,25,0.14)" },
    { bottom: "35%", left: "10%", width: 120, height: 120, radius: "0", bg: "rgba(252,192,25,0.05)", rotate: true },
  ],
  profile: [
    { top: 60, right: -60, width: 300, height: 300, radius: "50%", bg: "rgba(104,0,54,0.06)" },
    { bottom: 100, left: -50, width: 280, height: 280, radius: "50%", bg: "rgba(252,192,25,0.07)" },
    { top: "50%", left: "15%", width: 100, height: 100, radius: "0", bg: "rgba(104,0,54,0.04)", rotate: true },
    { bottom: "20%", right: "5%", width: 80, height: 80, radius: "50%", border: "3px solid rgba(252,192,25,0.1)" },
  ],
  notifications: [
    { top: -20, right: -40, width: 280, height: 280, radius: "50%", bg: "rgba(104,0,54,0.06)" },
    { bottom: 40, left: -50, width: 320, height: 320, radius: "50%", bg: "rgba(252,192,25,0.07)" },
    { top: "30%", right: "10%", width: 80, height: 80, radius: "50%", border: "3px solid rgba(104,0,54,0.1)" },
    { bottom: "40%", left: "8%", width: 60, height: 60, radius: "50%", bg: "rgba(104,0,54,0.05)" },
  ],
  report: [
    { top: 20, right: -60, width: 380, height: 380, radius: "50%", bg: "rgba(104,0,54,0.06)" },
    { bottom: 80, left: -40, width: 300, height: 300, radius: "50%", bg: "rgba(252,192,25,0.06)" },
    { top: "25%", right: "18%", width: 100, height: 100, radius: "0", bg: "rgba(104,0,54,0.04)", rotate: true },
    { bottom: "30%", left: "12%", width: 80, height: 80, radius: "50%", border: "3px solid rgba(252,192,25,0.1)" },
  ],
};

function DashboardLayout({ children, subtitle, showNewReport = false, currentPage = "Panel de Control", decor = "default" }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = ROLES_ADMIN.includes(sessionStorage.getItem("userRole"));
  const userName = sessionStorage.getItem("userName") || "";
  const { unreadCount } = useNotifications();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/ingreso", { replace: true });
  };

  const navItems = [
    { icon: "dashboard", label: "Panel de Control", path: isAdmin ? "/dashboard-admin" : "/dashboard-estudiante" },
    { icon: "description", label: "Reportes", path: "/reportes" },
    { icon: "notifications", label: "Notificaciones", path: "/notificaciones", badge: unreadCount },
    { icon: "person", label: "Mi Perfil", path: "/perfil" },
  ];

  const sidebarContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", gap: 3, px: 3, py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 2.5, borderBottom: "1px solid rgba(252,192,25,0.2)" }}>
        <Box
          sx={{
            width: 40, height: 40, borderRadius: "999px",
            background: "linear-gradient(135deg, #FCC019 0%, #E6A800 100%)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            boxShadow: "0 3px 10px rgba(252,192,25,0.35), inset 0 1px 0 rgba(255,255,255,0.35)",
          }}
        >
          <span className="material-symbols-outlined" style={{ color: "#2F0018", fontSize: 21, fontVariationSettings: "'FILL' 1" }}>school</span>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body1" fontWeight={800} sx={{ color: "#ffffff", lineHeight: 1.2, fontSize: 15, letterSpacing: "-0.01em" }}>
            {userName || "Usuario"}
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 500 }}>
            {subtitle}
          </Typography>
        </Box>
      </Box>

      <Stack spacing={0.5}>
        {navItems.map(({ icon, label, path, badge }) => {
          const isActive = label === currentPage;
          return (
            <Box
              key={label}
              onClick={() => { navigate(path); setMobileOpen(false); }}
              sx={{
                display: "flex", alignItems: "center", gap: 1.5,
                px: 1.75, py: 1.2, borderRadius: "999px",
                bgcolor: isActive ? "#fcc019" : "transparent",
                color: isActive ? "#251a00" : "rgba(255,255,255,0.78)",
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: isActive ? "0 4px 14px rgba(252,192,25,0.30)" : "none",
                "&:hover": {
                  bgcolor: isActive ? "#fcc019" : "rgba(255,255,255,0.10)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              <Badge badgeContent={badge} color="error" invisible={!badge}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
              </Badge>
              <Typography variant="body2" fontWeight={isActive ? 700 : 500}>{label}</Typography>
            </Box>
          );
        })}
      </Stack>

      <Stack spacing={1.2} sx={{ mt: "auto" }}>
        {showNewReport && (
          <Button
            fullWidth
            onClick={() => { navigate("/nuevo-reporte"); setMobileOpen(false); }}
            startIcon={<span className="material-symbols-outlined" style={{ fontSize: 19 }}>add</span>}
            sx={{
              background: "linear-gradient(135deg, #FCC019 0%, #E6A800 100%)",
              color: "#251a00", fontWeight: 700,
              borderRadius: "999px", py: 1.2, textTransform: "none",
              boxShadow: "0 6px 18px rgba(252,192,25,0.30)",
              "&:hover": { background: "linear-gradient(135deg, #E6A800 0%, #FCC019 100%)", transform: "translateY(-1px)" },
            }}
          >
            Nuevo reporte
          </Button>
        )}
        <Button
          fullWidth
          onClick={handleLogout}
          startIcon={<span className="material-symbols-outlined" style={{ fontSize: 19 }}>logout</span>}
          sx={{
            bgcolor: "rgba(255,255,255,0.10)", color: "#ffffff",
            fontWeight: 600, borderRadius: "999px", py: 1.15, textTransform: "none",
            border: "1px solid rgba(255,255,255,0.14)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.18)" },
          }}
        >
          Cerrar sesion
        </Button>
      </Stack>
    </Box>
  );

  if (!isAdmin) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fb" }}>
        {/* Navbar horizontal en el header (estudiante) */}
        <Box
          sx={{
            px: { xs: 1, md: 3 },
            pt: { xs: 1, md: 2 },
            pb: { xs: 1, md: 2 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, md: 1.5 },
              px: { xs: 1.5, md: 2 },
              py: 1.25,
              maxWidth: 1240,
              mx: "auto",
              width: "100%",
              borderRadius: "999px",
              background: "linear-gradient(135deg, #430022 0%, #56002D 45%, #680036 100%)",
              border: "1px solid rgba(252,192,25,0.28)",
              boxShadow: "0 10px 34px rgba(104,0,54,0.30), inset 0 1px 0 rgba(255,255,255,0.10)",
              transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer", flexShrink: 0, pl: { md: 1 } }}
              onClick={() => navigate("/dashboard-estudiante")}
            >
              <Box
                sx={{
                  width: 38, height: 38, borderRadius: "999px",
                  background: "linear-gradient(135deg, #FCC019 0%, #E6A800 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 3px 10px rgba(252,192,25,0.40), inset 0 1px 0 rgba(255,255,255,0.35)",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  "&:hover": { transform: "translateY(-1px) rotate(-4deg)" },
                }}
              >
                <span className="material-symbols-outlined" style={{ color: "#2F0018", fontSize: 21, fontVariationSettings: "'FILL' 1" }}>school</span>
              </Box>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography fontWeight={800} sx={{ fontSize: 15, lineHeight: 1.15, color: "#ffffff", letterSpacing: "-0.01em" }}>
                  UIDE <Box component="span" sx={{ color: "#FCC019" }}>Escucha</Box>
                </Typography>
                <Typography sx={{ fontSize: 10.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.2, fontWeight: 500 }}>
                  {userName || subtitle}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ width: "1px", height: 26, bgcolor: "rgba(255,255,255,0.16)", display: { xs: "none", md: "block" } }} />

            <Stack direction="row" spacing={0.5} sx={{ ml: { md: 1 }, display: { xs: "none", md: "flex" } }}>
              {navItems.map(({ icon, label, path, badge }) => {
                const isActive = label === currentPage;
                return (
                  <Box
                    key={label}
                    onClick={() => navigate(path)}
                    sx={{
                      position: "relative",
                      display: "flex", alignItems: "center", gap: 1,
                      px: 1.6, py: 0.85, borderRadius: "999px",
                      bgcolor: isActive ? "#fcc019" : "transparent",
                      color: isActive ? "#251a00" : "rgba(255,255,255,0.82)",
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      boxShadow: isActive ? "0 4px 14px rgba(252,192,25,0.40)" : "none",
                      "&:hover": {
                        bgcolor: isActive ? "#fcc019" : "rgba(255,255,255,0.10)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <Badge badgeContent={badge} color="error" invisible={!badge}>
                      <span className="material-symbols-outlined" style={{ fontSize: 19, fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
                    </Badge>
                    <Typography variant="body2" fontWeight={isActive ? 700 : 500}>{label}</Typography>
                  </Box>
                );
              })}
            </Stack>

            <Box sx={{ flex: 1 }} />

            {showNewReport && (
              <Button
                onClick={() => navigate("/nuevo-reporte")}
                startIcon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>}
                sx={{
                  background: "linear-gradient(135deg, #FCC019 0%, #E6A800 100%)",
                  color: "#251a00", fontWeight: 700, fontSize: 13.5,
                  borderRadius: "999px", px: 2.5, py: 0.95, textTransform: "none",
                  display: { xs: "none", sm: "inline-flex" },
                  boxShadow: "0 6px 18px rgba(252,192,25,0.35)",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  "&:hover": { background: "linear-gradient(135deg, #E6A800 0%, #FCC019 100%)", transform: "translateY(-1px)", boxShadow: "0 8px 22px rgba(252,192,25,0.45)" },
                }}
              >
                Nuevo reporte
              </Button>
            )}

            <Box sx={{ width: "1px", height: 24, bgcolor: "rgba(255,255,255,0.16)", display: { xs: "none", sm: "block" } }} />

            <IconButton
              onClick={() => navigate("/notificaciones")}
              sx={{
                color: "rgba(255,255,255,0.85)", borderRadius: "999px",
                display: { xs: "flex", md: "none" },
                "&:hover": { bgcolor: "rgba(255,255,255,0.12)", color: "#ffffff" },
              }}
              aria-label="Notificaciones"
            >
              <Badge badgeContent={unreadCount} color="error" invisible={!unreadCount}>
                <span className="material-symbols-outlined">notifications</span>
              </Badge>
            </IconButton>

            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ color: "#ffffff", borderRadius: "999px", display: { xs: "flex", md: "none" }, "&:hover": { bgcolor: "rgba(255,255,255,0.12)" } }}
              aria-label="Menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </IconButton>

            <IconButton
              onClick={handleLogout}
              sx={{
                color: "rgba(255,255,255,0.75)", borderRadius: "999px",
                "&:hover": { bgcolor: "rgba(255,255,255,0.12)", color: "#ffffff" },
              }}
              aria-label="Cerrar sesion"
            >
              <span className="material-symbols-outlined">logout</span>
            </IconButton>
          </Box>
        </Box>

        {/* Mobile drawer */}
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ display: { xs: "block", md: "none" } }}
          PaperProps={{ sx: { background: "linear-gradient(180deg, #2F0018 0%, #56002D 50%, #680036 100%)", color: "#ffffff", width: 260 } }}
        >
          {sidebarContent}
        </Drawer>

        {/* Contenido */}
        <Box sx={{ position: "relative", p: { xs: 2, md: 4 }, minHeight: "calc(100vh - 72px)", maxWidth: 1280, mx: "auto", width: "100%" }}>
          {(DECORATIONS[decor] || DECORATIONS.default).map((d, i) => (
            <Box key={i} sx={{ position: "absolute", pointerEvents: "none", ...d, borderRadius: d.radius, bgcolor: d.bg, transform: d.rotate ? "rotate(45deg)" : undefined }} />
          ))}
          <Box sx={{ position: "relative", zIndex: 1 }}>
            {children}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fb", display: "flex", gap: { md: 2.5 } }}>
      {/* Desktop sidebar */}
      <Box
        sx={{
          width: 260,
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          display: { xs: "none", md: "block" },
          p: 2,
        }}
      >
        <Box
          sx={{
            height: "100%",
            borderRadius: "28px",
            background: "linear-gradient(180deg, #2F0018 0%, #56002D 50%, #680036 100%)",
            color: "#ffffff",
            border: "1px solid rgba(252,192,25,0.22)",
            boxShadow: "0 12px 40px rgba(104,0,54,0.22)",
            overflow: "hidden",
            display: "flex",
          }}
        >
          {sidebarContent}
        </Box>
      </Box>

      {/* Mobile drawer */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: "block", md: "none" } }}
        PaperProps={{ sx: { background: "linear-gradient(180deg, #2F0018 0%, #56002D 50%, #680036 100%)", color: "#ffffff", width: 260 } }}
      >
        {sidebarContent}
      </Drawer>

      {/* Main content */}
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Mobile header */}
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            alignItems: "center",
            gap: 1.5,
            px: 2,
            py: 1.5,
            bgcolor: "#680036",
            color: "#ffffff",
            boxShadow: "0 2px 12px rgba(104,0,54,0.12)",
          }}
        >
          <IconButton onClick={() => setMobileOpen(true)} sx={{ color: "#ffffff" }}>
            <span className="material-symbols-outlined">menu</span>
          </IconButton>
          <Typography variant="h6" fontWeight={700} sx={{ flex: 1, fontSize: 16 }}>UIDE Escucha</Typography>
          <IconButton onClick={handleLogout} sx={{ color: "rgba(255,255,255,0.75)", "&:hover": { color: "#ffffff" } }}>
            <span className="material-symbols-outlined">logout</span>
          </IconButton>
        </Box>

        <Box sx={{ position: "relative", p: { xs: 2, md: 4 }, minHeight: "100%", maxWidth: 1280, mx: "auto", width: "100%" }}>
          {(DECORATIONS[decor] || DECORATIONS.default).map((d, i) => (
            <Box key={i} sx={{ position: "absolute", pointerEvents: "none", ...d, borderRadius: d.radius, bgcolor: d.bg, transform: d.rotate ? "rotate(45deg)" : undefined }} />
          ))}
          <Box sx={{ position: "relative", zIndex: 1 }}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardLayout;
