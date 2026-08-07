import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Box, Typography, TextField, Button, Stack, CircularProgress, InputAdornment, IconButton,
} from "@mui/material";
import { useToast } from "../context/useToast.js";
import { usePasswordValidation } from "../hooks/useValidations.js";
import AuthShell from "../components/AuthShell.jsx";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const toast = useToast();

  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const passwordVal = usePasswordValidation(password);

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

  useEffect(() => {
    const validateToken = async () => {
      try {
        const res = await fetch(`/api/auth/reset-password/${token}/validate`);
        const data = await res.json();
        if (data.valid) {
          setTokenValid(true);
        } else {
          setTokenError(data.error || "Token inválido o expirado.");
        }
      } catch {
        setTokenError("Error al validar el token.");
      } finally {
        setValidating(false);
      }
    };
    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast("Las contraseñas no coinciden.", "warning");
      return;
    }
    if (!passwordVal.checks.isValid) {
      toast("La contraseña debe cumplir todos los requisitos de seguridad.", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al restablecer la contraseña.");
      setSuccess(true);
      toast("Contraseña restablecida correctamente.", "success");
      setTimeout(() => navigate("/ingreso"), 2000);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <AuthShell>
        <Box sx={{ textAlign: "center", py: 3 }}>
          <CircularProgress size={32} sx={{ color: "#680036" }} />
        </Box>
      </AuthShell>
    );
  }

  if (!tokenValid) {
    return (
      <AuthShell>
        <Box sx={{ textAlign: "center" }}>
          <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: "#fef1f1", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#ba1a1a" }}>link_off</span>
          </Box>
          <Typography sx={{ color: "#18151A", fontWeight: 700, mb: 1, fontSize: 18 }}>
            Enlace inválido o expirado
          </Typography>
          <Typography sx={{ color: "#77737A", fontSize: 13, mb: 3, lineHeight: 1.6 }}>
            {tokenError || "El enlace de restablecimiento ya no es válido. Solicita uno nuevo."}
          </Typography>
          <Button onClick={() => navigate("/forgot-password")} sx={primaryBtnSx}>
            Solicitar nuevo enlace
          </Button>
        </Box>
      </AuthShell>
    );
  }

  if (success) {
    return (
      <AuthShell>
        <Box sx={{ textAlign: "center" }}>
          <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: "#e8f7ed", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#1f7a3f", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </Box>
          <Typography sx={{ color: "#18151A", fontWeight: 700, mb: 1, fontSize: 18 }}>
            Contraseña actualizada
          </Typography>
          <Typography sx={{ color: "#77737A", fontSize: 13, mb: 3, lineHeight: 1.6 }}>
            Tu contraseña se ha restablecido correctamente. Redirigiendo al inicio de sesión...
          </Typography>
        </Box>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <Box sx={{ textAlign: "center", mb: 3.5 }}>
        <Typography sx={{ fontWeight: 800, color: "#18151A", letterSpacing: "-0.02em", fontSize: 26, lineHeight: 1.2 }}>
          Restablecer contraseña
        </Typography>
        <Typography sx={{ color: "#77737A", fontSize: 13, mt: 0.75, lineHeight: 1.6 }}>
          Crea una nueva contraseña segura para tu cuenta.
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Box>
          <Typography sx={{ fontWeight: 600, color: "#18151A", mb: 1, fontSize: 13 }}>Nueva contraseña</Typography>
          <TextField fullWidth placeholder="Ingresa tu nueva contraseña"
            type={showPassword ? "text" : "password"} value={password}
            onChange={(e) => setPassword(e.target.value)} variant="outlined"
            sx={inputStyles} inputProps={{ "aria-label": "Nueva contraseña" }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "#969198" }}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showPassword ? "visibility_off" : "visibility"}</span>
                  </IconButton>
                </InputAdornment>
              ),
            }} />
        </Box>

        {password.length > 0 && (
          <Box sx={{ px: 0.5 }}>
            <Stack spacing={0.6}>
              {passwordVal.checks.checks.map((check) => (
                <Stack key={check.label} direction="row" spacing={0.8} alignItems="center">
                  <Box component="span" className="material-symbols-outlined"
                    sx={{ fontSize: 16, color: check.pass ? "#1f7a3f" : "#ba1a1a", fontVariationSettings: "'FILL' 1" }}>
                    {check.pass ? "check_circle" : "cancel"}
                  </Box>
                  <Typography sx={{ fontSize: 12, color: check.pass ? "#1f7a3f" : "#77737A", fontWeight: check.pass ? 600 : 400 }}>
                    {check.label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}

        <Box>
          <Typography sx={{ fontWeight: 600, color: "#18151A", mb: 1, fontSize: 13 }}>Confirmar contraseña</Typography>
          <TextField fullWidth placeholder="Confirma tu nueva contraseña" type={showPassword ? "text" : "password"}
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} variant="outlined"
            error={!!confirmPassword && password !== confirmPassword}
            helperText={confirmPassword && password !== confirmPassword ? "Las contraseñas no coinciden." : ""}
            sx={inputStyles} inputProps={{ "aria-label": "Confirmar contraseña" }} />
        </Box>

        <Button type="submit" fullWidth variant="contained"
          disabled={loading || !password || !confirmPassword || password !== confirmPassword || !passwordVal.checks.isValid}
          sx={primaryBtnSx}>
          {loading ? <CircularProgress size={18} color="inherit" /> : "Restablecer contraseña"}
        </Button>

        <Box sx={{ textAlign: "center" }}>
          <Link to="/ingreso" style={{ color: "#680036", fontWeight: 600, fontSize: 13, textDecoration: "none" }}
            onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
            onMouseLeave={(e) => e.target.style.textDecoration = "none"}>
            Volver al inicio de sesión
          </Link>
        </Box>
      </Box>
    </AuthShell>
  );
}

export default ResetPasswordPage;
