import { Box, Typography, Stack, Fade } from "@mui/material";
import { useNavigate } from "react-router-dom";

function AuthShell({ children, maxWidth = 430 }) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "#FAF9F7",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(104,0,54,0.045) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          pointerEvents: "none",
        },
      }}
    >
      <Box sx={{ position: "absolute", top: -90, left: -70, width: 300, height: 300, borderRadius: "50%", bgcolor: "rgba(104,0,54,0.05)", pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", bottom: -110, right: -60, width: 340, height: 340, borderRadius: "50%", bgcolor: "rgba(252,192,25,0.09)", pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", top: "20%", right: { xs: "4%", md: "10%" }, width: 88, height: 88, borderRadius: "22px", bgcolor: "rgba(104,0,54,0.045)", transform: "rotate(14deg)", pointerEvents: "none", display: { xs: "none", md: "block" } }} />
      <Box sx={{ position: "absolute", bottom: "16%", left: { xs: "3%", md: "9%" }, width: 64, height: 64, borderRadius: "50%", border: "2px solid rgba(252,192,25,0.28)", pointerEvents: "none", display: { xs: "none", md: "block" } }} />

      <Box sx={{ position: "absolute", top: "16%", left: { md: "20%", lg: "24%" }, display: { xs: "none", md: "flex" }, alignItems: "flex-end", gap: 0.45, pointerEvents: "none" }}>
        {[14, 24, 18, 30, 20].map((h, i) => (
          <Box key={i} sx={{ width: 4, height: h, borderRadius: 2, bgcolor: i === 2 ? "rgba(252,192,25,0.5)" : "rgba(104,0,54,0.26)" }} />
        ))}
      </Box>

      <Box sx={{ position: "absolute", top: "12%", right: { xs: "4%", md: "16%" }, display: { xs: "none", md: "flex" }, gap: 0.9, pointerEvents: "none" }}>
        {[0, 1, 2].map((i) => (
          <Box key={i} sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: i === 1 ? "rgba(252,192,25,0.55)" : "rgba(104,0,54,0.18)" }} />
        ))}
      </Box>

      <Box sx={{ position: "absolute", bottom: "14%", right: { md: "22%", lg: "26%" }, display: { xs: "none", md: "flex" }, gap: 1, pointerEvents: "none" }}>
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "rgba(104,0,54,0.16)" }} />
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "rgba(252,192,25,0.4)" }} />
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "rgba(104,0,54,0.16)" }} />
      </Box>

      <Box sx={{ position: "absolute", top: "34%", left: { md: "8%", lg: "12%" }, width: 168, bgcolor: "#FFFFFF", borderRadius: "16px", border: "1px solid #ECECEF", boxShadow: "0 18px 40px rgba(47,0,24,0.10)", p: 1.75, transform: "rotate(-5deg)", display: { xs: "none", md: "block" }, pointerEvents: "none" }}>
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1.5 }}>
          <Box sx={{ width: 18, height: 18, borderRadius: "50%", bgcolor: "#F7E6EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 11, color: "#680036", fontVariationSettings: "'FILL' 1" }}>person</span>
          </Box>
          <Typography sx={{ fontSize: 9, fontWeight: 700, color: "#18151A" }}>Estudiante</Typography>
          <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "#969198" }} />
          <Typography sx={{ fontSize: 9, color: "#969198" }}>10:42</Typography>
        </Stack>
        <Box sx={{ px: 1.5, py: 1, borderRadius: "12px 12px 12px 4px", bgcolor: "rgba(104,0,54,0.06)", width: "fit-content", mb: 0.75 }}>
          <Box sx={{ width: 96, height: 5, borderRadius: 3, bgcolor: "rgba(104,0,54,0.16)" }} />
        </Box>
        <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="flex-end">
          <Box sx={{ width: 18, height: 18, borderRadius: "50%", bgcolor: "#FFF4CC", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 11, color: "#785900", fontVariationSettings: "'FILL' 1" }}>support_agent</span>
          </Box>
          <Box sx={{ px: 1.5, py: 1, borderRadius: "12px 12px 4px 12px", bgcolor: "rgba(252,192,25,0.16)", width: "fit-content" }}>
            <Box sx={{ width: 78, height: 5, borderRadius: 3, bgcolor: "rgba(120,89,0,0.2)" }} />
          </Box>
        </Stack>
      </Box>

      <Box sx={{ position: "absolute", top: "26%", right: { md: "9%", lg: "14%" }, width: 158, bgcolor: "#FFFFFF", borderRadius: "16px", border: "1px solid #ECECEF", boxShadow: "0 18px 40px rgba(47,0,24,0.10)", p: 1.75, transform: "rotate(4deg)", display: { xs: "none", md: "block" }, pointerEvents: "none" }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
          <Box sx={{ width: 24, height: 24, borderRadius: "8px", bgcolor: "#fde9ef", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#680036" }}>report</span>
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: 10, color: "#18151A" }}>Incidente</Typography>
        </Stack>
        <Box sx={{ width: "88%", height: 6, borderRadius: 3, bgcolor: "#F0EDEF", mb: 0.75 }} />
        <Box sx={{ width: "62%", height: 6, borderRadius: 3, bgcolor: "#F0EDEF", mb: 1.25 }} />
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#FCC019" }} />
          <Typography sx={{ fontSize: 9, color: "#77737A", fontWeight: 600 }}>En seguimiento</Typography>
        </Stack>
      </Box>

      <Box sx={{ position: "absolute", bottom: "30%", left: { md: "12%", lg: "16%" }, width: 54, height: 54, borderRadius: "16px", bgcolor: "#FFFFFF", border: "1px solid #ECECEF", boxShadow: "0 14px 30px rgba(47,0,24,0.10)", display: { xs: "none", md: "flex" }, alignItems: "center", justifyContent: "center", transform: "rotate(-6deg)", pointerEvents: "none" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 26, color: "#680036", fontVariationSettings: "'FILL' 1" }}>shield</span>
      </Box>

      <Box sx={{ position: "absolute", bottom: "32%", right: { md: "10%", lg: "15%" }, px: 2, py: 1, borderRadius: 999, bgcolor: "#FFFFFF", border: "1px solid #ECECEF", boxShadow: "0 12px 28px rgba(47,0,24,0.08)", display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.75, transform: "rotate(3deg)", pointerEvents: "none" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 15, color: "#680036", fontVariationSettings: "'FILL' 1" }}>hearing</span>
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#18151A" }}>Tu voz cuenta</Typography>
      </Box>

      <Box
        component="header"
        sx={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 3, md: 6 },
          height: 64,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          <Box sx={{ width: 38, height: 38, borderRadius: "11px", bgcolor: "#680036", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 21, color: "#FCC019", fontVariationSettings: "'FILL' 1" }}>school</span>
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, letterSpacing: -0.3, lineHeight: 1.1, fontSize: 17, color: "#18151A" }}>Hubi</Typography>
            <Typography sx={{ color: "#969198", fontSize: 9, letterSpacing: "0.05em", textTransform: "uppercase" }}>UIDE Escucha</Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={2.5} alignItems="center">
          <Typography
            onClick={() => navigate("/")}
            sx={{ color: "#77737A", fontSize: 12, fontWeight: 500, cursor: "pointer", "&:hover": { color: "#680036" }, transition: "color 0.2s" }}
          >
            Inicio
          </Typography>
          <Typography sx={{ color: "#969198", fontSize: 12, fontWeight: 500, display: { xs: "none", sm: "block" } }}>
            UIDE · Ayuda
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", px: { xs: 2.5, sm: 4 }, py: { xs: 3, md: 5 } }}>
        <Fade in timeout={400}>
          <Box
            sx={{
              width: "100%",
              maxWidth,
              bgcolor: "#FFFFFF",
              borderRadius: "28px",
              boxShadow: "0 24px 65px rgba(47,0,24,0.08)",
              border: "1px solid rgba(236,236,239,0.9)",
              p: { xs: 3.5, sm: 4.5 },
            }}
          >
            {children}
          </Box>
        </Fade>
      </Box>

      <Box component="footer" sx={{ position: "relative", zIndex: 2, textAlign: "center", pb: 3 }}>
        <Typography sx={{ color: "#969198", fontSize: 11 }}>
          © UIDE Escucha · Tu voz cuenta
        </Typography>
      </Box>
    </Box>
  );
}

export default AuthShell;
