import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Stack } from "@mui/material";
import AuthShell from "../components/AuthShell.jsx";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <AuthShell maxWidth={460}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", top: -80, right: -80, width: 200, height: 200, borderRadius: "50%", bgcolor: "rgba(104,0,54,0.05)", filter: "blur(60px)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", bottom: -80, left: -80, width: 200, height: 200, borderRadius: "50%", bgcolor: "rgba(252,192,25,0.1)", filter: "blur(60px)", pointerEvents: "none" }} />

        <Box sx={{ position: "relative", width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
          <Box sx={{ position: "absolute", opacity: 0.1 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 160, fontWeight: 200 }}>map</span>
          </Box>
          <Box sx={{ position: "relative" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 92, color: "#77737A", fontVariationSettings: "'FILL' 1" }}>location_off</span>
          </Box>
          <Box sx={{ position: "absolute", bottom: 12, right: 8, bgcolor: "#F8F9FB", borderRadius: "50%", p: 1.5, boxShadow: "0px 4px 20px rgba(0,0,0,0.06)", border: "1px solid #ECECEF", transform: "rotate(12deg)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 30, color: "#680036" }}>search</span>
          </Box>
        </Box>

        <Box sx={{ px: 2, py: 0.5, border: "1px solid #ECECEF", borderRadius: "9999px", mb: 2 }}>
          <Typography sx={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#77737A" }}>
            Error 404
          </Typography>
        </Box>

        <Typography sx={{ fontWeight: 800, color: "#18151A", mb: 1, textAlign: "center", fontSize: 24, letterSpacing: "-0.02em" }}>
          ¡Ups! Página no encontrada
        </Typography>

        <Typography sx={{ fontSize: 14, lineHeight: 1.6, color: "#77737A", maxWidth: 300, textAlign: "center" }}>
          Parece que el enlace que seguiste no existe o ha sido movido. No te preocupes,{" "}
          <Box component="span" sx={{ fontWeight: 700, color: "#680036" }}>¡tu voz sigue siendo importante para nosotros!</Box>
        </Typography>

        <Stack spacing={1.5} sx={{ width: "100%", mt: 3.5 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate("/")}
            sx={{
              height: 52,
              bgcolor: "#680036",
              borderRadius: "14px",
              fontWeight: 700,
              fontSize: 14,
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(104,0,54,0.22)",
              "&:hover": { bgcolor: "#56002D" },
            }}
            startIcon={<span className="material-symbols-outlined" style={{ fontSize: 20 }}>home</span>}
          >
            Volver al Inicio
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate("/")}
            sx={{
              height: 52,
              borderColor: "#680036",
              color: "#680036",
              borderRadius: "14px",
              fontWeight: 700,
              fontSize: 14,
              textTransform: "none",
              "&:hover": { borderColor: "#680036", bgcolor: "rgba(104,0,54,0.04)" },
            }}
            startIcon={<span className="material-symbols-outlined" style={{ fontSize: 20 }}>bug_report</span>}
          >
            Reportar un problema
          </Button>
        </Stack>

        <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 1, px: 2, py: 1, bgcolor: "#F7F7F9", border: "1px solid #ECECEF", borderRadius: "9999px" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#77737A" }}>info</span>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: "#77737A" }}>
            Sistema UIDE Escucha V2.4
          </Typography>
        </Box>
      </Box>
    </AuthShell>
  );
}

export default NotFoundPage;
