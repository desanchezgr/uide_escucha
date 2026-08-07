import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, Typography, TextField, Button, CircularProgress,
} from "@mui/material";
import { useToast } from "../context/useToast.js";
import AuthShell from "../components/AuthShell.jsx";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#F7F7F9",
      borderRadius: "14px",
      height: "52px",
      "& fieldset": { borderColor: "transparent" },
      "&:hover fieldset": { borderColor: "#dcc9d0", borderWidth: "1px" },
      "&.Mui-focused fieldset": { borderColor: "rgba(104,0,54,0.30)", borderWidth: "1px", boxShadow: "0 0 0 4px rgba(104,0,54,0.055)" },
      "&.Mui-error fieldset": { borderColor: "#ba1a1a" },
    },
    "& .MuiInputBase-input": {
      fontSize: 14,
      color: "#18151A",
      "&::placeholder": { color: "#969198", opacity: 1 },
    },
    "& .MuiFormHelperText-root": {
      fontSize: 11, mt: 0.5, mx: 0.5,
    },
  };

  const primaryBtnSx = {
    bgcolor: "#680036",
    color: "#ffffff",
    fontWeight: 700,
    py: 1.7,
    borderRadius: "14px",
    fontSize: 14,
    boxShadow: "0 4px 14px rgba(104, 0, 54, 0.22)",
    textTransform: "none",
    transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
    "&:hover": { bgcolor: "#56002D", transform: "translateY(-1px)", boxShadow: "0 6px 20px rgba(104, 0, 54, 0.28)" },
    "&.Mui-disabled": { bgcolor: "rgba(104, 0, 54, 0.25)", color: "rgba(255, 255, 255, 0.7)", boxShadow: "none" },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast("Ingresa tu correo institucional.", "warning"); return; }
    if (!email.trim().endsWith("@uide.edu.ec")) { toast("Debe ser un correo institucional (@uide.edu.ec).", "warning"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setMessage(data.message || "Revisa tu bandeja de entrada.");
      setSent(true);
    } catch {
      toast("Error de conexión con el servidor.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <Box sx={{ textAlign: "center", mb: 3.5 }}>
        <Typography sx={{ fontWeight: 800, color: "#18151A", letterSpacing: "-0.02em", fontSize: 26, lineHeight: 1.2 }}>
          ¿Olvidaste tu contraseña?
        </Typography>
        <Typography sx={{ color: "#77737A", fontSize: 13, mt: 0.75, lineHeight: 1.6 }}>
          Ingresa tu correo institucional y te enviaremos un enlace para restablecerla.
        </Typography>
      </Box>

      {sent ? (
        <Box sx={{ textAlign: "center" }}>
          <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: "#e8f7ed", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#1f7a3f", fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
          </Box>
          <Typography sx={{ color: "#18151A", fontWeight: 700, mb: 1, fontSize: 16, lineHeight: 1.4 }}>
            {message}
          </Typography>
          <Typography sx={{ color: "#77737A", fontSize: 13, mb: 3, lineHeight: 1.6 }}>
            Si no encuentras el correo, revisa tu carpeta de spam. El enlace expirará en 1 hora.
          </Typography>
          <Button onClick={() => { setSent(false); setEmail(""); }}
            sx={{ color: "#680036", fontWeight: 600, fontSize: 13, textTransform: "none" }}>
            Enviar de nuevo
          </Button>
          <Box sx={{ mt: 2 }}>
            <Link to="/ingreso" style={{ color: "#680036", fontWeight: 600, fontSize: 13, textDecoration: "none" }}
              onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
              onMouseLeave={(e) => e.target.style.textDecoration = "none"}>
              Volver al inicio de sesión
            </Link>
          </Box>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <Typography sx={{ fontWeight: 600, color: "#18151A", mb: 1, fontSize: 13 }}>Correo institucional</Typography>
            <TextField fullWidth placeholder="usuario@uide.edu.ec" value={email}
              onChange={(e) => setEmail(e.target.value)} variant="outlined"
              sx={inputStyles} inputProps={{ "aria-label": "Correo institucional" }} />
          </Box>
          <Button type="submit" fullWidth variant="contained" disabled={loading || !email.trim()}
            sx={primaryBtnSx}>
            {loading ? <CircularProgress size={18} color="inherit" /> : "Enviar enlace"}
          </Button>
          <Box sx={{ textAlign: "center" }}>
            <Button
              onClick={() => navigate("/ingreso")}
              sx={{ color: "#680036", fontWeight: 600, fontSize: 13, textTransform: "none", "&:hover": { bgcolor: "rgba(104, 0, 54, 0.06)" } }}
            >
              Volver al inicio de sesión
            </Button>
          </Box>
        </Box>
      )}
    </AuthShell>
  );
}

export default ForgotPasswordPage;
