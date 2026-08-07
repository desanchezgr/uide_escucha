import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  InputAdornment,
  IconButton,
  CircularProgress,
  Fade,
} from "@mui/material";
import { useToast } from "../context/useToast.js";
import { usePasswordValidation } from "../hooks/useValidations.js";
import MfaChallenge from "../components/MfaChallenge.jsx";
import MfaSetupCard from "../components/MfaSetupCard.jsx";

function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState("cedula");

  const [cedula, setCedula] = useState("");
  const [cedulaVerificando, setCedulaVerificando] = useState(false);
  const [cedulaResultado, setCedulaResultado] = useState(null);
  const [cedulaError, setCedulaError] = useState("");

  const [identidadEmail, setIdentidadEmail] = useState("");
  const [identidadVerificando, setIdentidadVerificando] = useState(false);
  const [identidadVerificado, setIdentidadVerificado] = useState(false);
  const [identidadEnviado, setIdentidadEnviado] = useState(false);
  const [identidadMensaje, setIdentidadMensaje] = useState("");
  const [identidadError, setIdentidadError] = useState("");

  const [emailInput, setEmailInput] = useState("");
  const [emailVerificando, setEmailVerificando] = useState(false);
  const [emailResultado, setEmailResultado] = useState(null);
  const [emailError, setEmailError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const passwordVal = usePasswordValidation(password);

  const [mfaTempToken, setMfaTempToken] = useState(null);
  const [mfaError, setMfaError] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const [mfaSetupActive, setMfaSetupActive] = useState(false);

  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const vtoken = searchParams.get("vtoken");
    const urlCedula = searchParams.get("cedula");
    if (!vtoken || !urlCedula) return;

    const verifyFromLink = async () => {
      setIdentidadVerificando(true);
      try {
        setCedula(urlCedula);
        const res = await fetch("/api/auth/verify-email-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cedula: urlCedula, token: vtoken }),
        });
        const data = await res.json();
        if (!res.ok) {
          setIdentidadError(data.error || "Enlace de verificación inválido o expirado.");
          return;
        }
        const cedulaRes = await fetch("/api/auth/verificar-cedula", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cedula: urlCedula }),
        });
        const cedulaData = await cedulaRes.json();
        if (!cedulaRes.ok || !cedulaData.encontrado) {
          setIdentidadError("No se pudo verificar la cédula desde el enlace.");
          return;
        }
        setCedulaResultado({
          encontrado: true,
          nombres: cedulaData.nombres,
          tieneCuenta: cedulaData.tieneCuenta,
        });
        setIdentidadEmail(data.email || "");
        setIdentidadVerificado(true);
        window.history.replaceState({}, "", "/ingreso");
        toast("Correo verificado. Ahora crea tu contraseña.", "success");
      } catch {
        setIdentidadError("Error al verificar el enlace.");
      } finally {
        setIdentidadVerificando(false);
      }
    };
    verifyFromLink();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const resetCedula = () => {
    setCedula("");
    setCedulaResultado(null);
    setCedulaError("");
    setIdentidadEmail("");
    setIdentidadVerificado(false);
    setIdentidadError("");
    setPassword("");
    setConfirmPassword("");
    setMfaSetupActive(false);
  };

  const resetEmail = () => {
    setEmailInput("");
    setEmailResultado(null);
    setEmailError("");
    setPassword("");
    setConfirmPassword("");
    setMfaSetupActive(false);
  };

  const handleSwitchTab = (newTab) => {
    setTab(newTab);
    resetCedula();
    resetEmail();
  };

  const handleVerificarCedula = async () => {
    if (!cedula.trim() || cedula.trim().length !== 10) {
      setCedulaError("Ingresa un número de cédula válido (10 dígitos).");
      return;
    }
    setCedulaError("");
    setCedulaVerificando(true);
    setCedulaResultado(null);

    try {
      const res = await fetch("/api/auth/verificar-cedula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula: cedula.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setCedulaError(data.error || "Error al verificar cédula.");
        return;
      }

      if (!data.encontrado) {
        setCedulaResultado({ encontrado: false });
      } else {
        setCedulaResultado({
          encontrado: true,
          nombres: data.nombres,
          tieneCuenta: data.tieneCuenta,
        });
      }
    } catch {
      setCedulaError("Error de conexión con el servidor.");
    } finally {
      setCedulaVerificando(false);
    }
  };

  const handleVerificarIdentidad = async () => {
    if (!identidadEmail.trim() || !identidadEmail.trim().endsWith("@uide.edu.ec")) {
      setIdentidadError("Ingresa un correo institucional @uide.edu.ec.");
      return;
    }
    setIdentidadError("");
    setIdentidadVerificando(true);
    try {
      const res = await fetch("/api/auth/verificar-identidad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula: cedula.trim(), email: identidadEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setIdentidadError(data.error || "Error al verificar identidad."); return; }
      if (data.error) { setIdentidadError(data.error); return; }
      setIdentidadEnviado(true);
      setIdentidadMensaje(data.message || "Revisa tu correo institucional.");
    } catch {
      setIdentidadError("Error de conexión con el servidor.");
    } finally {
      setIdentidadVerificando(false);
    }
  };

  const handleVerificarEmail = async () => {
    if (!emailInput.trim()) {
      setEmailError("Ingresa un correo electrónico.");
      return;
    }
    setEmailError("");
    setEmailVerificando(true);
    setEmailResultado(null);

    try {
      const res = await fetch("/api/auth/verificar-email-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setEmailError(data.error || "Error al verificar correo.");
        return;
      }

      if (data.error) {
        setEmailResultado({ encontrado: false, mensaje: data.error });
      } else {
        setEmailResultado({
          encontrado: true,
          nombres: data.nombres,
          rol: data.rol,
          tieneCuenta: data.tieneCuenta,
        });
      }
    } catch {
      setEmailError("Error de conexión con el servidor.");
    } finally {
      setEmailVerificando(false);
    }
  };

  const handleLoginEmail = async () => {
    if (!password) { toast("Ingresa una contraseña.", "warning"); return; }
    if (!emailResultado.tieneCuenta && password !== confirmPassword) {
      toast("Las contraseñas no coinciden.", "warning"); return;
    }
    if (!emailResultado.tieneCuenta && !passwordVal.checks.isValid) {
      toast("La contraseña debe cumplir todos los requisitos de seguridad.", "warning"); return;
    }

    setLoading(true);
    try {
      if (!emailResultado.tieneCuenta) {
        const res = await fetch("/api/auth/registro-email-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailInput.trim(), password }),
        });
        const data = await res.json();
        if (!res.ok) { toast(data.error || "Error al registrar.", "error"); return; }
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("userRole", data.usuario.rol);
        sessionStorage.setItem("userName", data.usuario.nombre);
        toast("Cuenta creada correctamente. Configura tu seguridad.", "success");
        setLoading(false);
        setMfaSetupActive(true);
        return;
      } else {
        const res = await fetch("/api/auth/login-email-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailInput.trim(), password }),
        });
        const data = await res.json();
        if (!res.ok) { toast(data.error || "Contraseña incorrecta.", "error"); return; }
        if (data.mfaRequired) {
          setMfaTempToken(data.tempToken);
          setUseBackupCode(false);
          setBackupCode("");
          setLoading(false);
          return;
        }
        if (data.onboardingRequired) {
          sessionStorage.setItem("token", data.tempToken);
          sessionStorage.setItem("userRole", data.usuario.rol);
          sessionStorage.setItem("userName", data.usuario.nombre);
          toast("Completa la configuración de tu cuenta.", "info");
          setLoading(false);
          setMfaSetupActive(true);
          return;
        }
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("userRole", data.usuario.rol);
        sessionStorage.setItem("userName", data.usuario.nombre);
        toast("Inicio de sesión exitoso.", "success");
        setTimeout(navigateAfterLogin, 300);
      }
    } catch { toast("Error de conexión con el servidor.", "error"); }
    finally { setLoading(false); }
  };

  const handleForgotPasswordCedula = async () => {
    setForgotLoading(true);
    setForgotMsg("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula: cedula.trim() }),
      });
      const data = await res.json();
      setForgotMsg(data.message || "Revisa tu correo de recuperacion.");
    } catch {
      toast("Error de conexion con el servidor.", "error");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotPasswordEmail = async () => {
    setForgotLoading(true);
    setForgotMsg("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim() }),
      });
      const data = await res.json();
      setForgotMsg(data.message || "Revisa tu bandeja de entrada.");
    } catch {
      toast("Error de conexion con el servidor.", "error");
    } finally {
      setForgotLoading(false);
    }
  };

  const navigateAfterLogin = () => {
    const role = sessionStorage.getItem("userRole");
    const adminRoles = ["admin", "prorector", "ti_soporte", "bibliotecario", "conserje", "mantenimiento", "secretaria", "bienestar universitario", "financiero"];
    navigate(adminRoles.includes(role) ? "/dashboard-admin" : "/dashboard-estudiante");
  };

  const handleMfaSubmit = async (code) => {
    setMfaLoading(true);
    setMfaError("");
    try {
      const res = await fetch("/api/auth/verify-mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken: mfaTempToken, code }),
      });
      const data = await res.json();
      if (!res.ok) { setMfaError(data.error || "Código inválido."); return; }
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("userRole", data.usuario.rol);
      sessionStorage.setItem("userName", data.usuario.nombre);
      toast("Inicio de sesión exitoso.", "success");
      setTimeout(navigateAfterLogin, 300);
    } catch { setMfaError("Error de conexión con el servidor."); }
    finally { setMfaLoading(false); }
  };

  const handleMfaBackupSubmit = async () => {
    if (!backupCode.trim()) { setMfaError("Ingresa un código de respaldo."); return; }
    await handleMfaSubmit(backupCode.trim());
  };

  const handleLoginCedula = async () => {
    if (!password) { toast("Ingresa una contraseña.", "warning"); return; }
    if (!cedulaResultado.tieneCuenta && password !== confirmPassword) {
      toast("Las contraseñas no coinciden.", "warning"); return;
    }
    if (!cedulaResultado.tieneCuenta && !passwordVal.checks.isValid) {
      toast("La contraseña debe cumplir todos los requisitos de seguridad.", "warning"); return;
    }

    setLoading(true);
    try {
      if (!cedulaResultado.tieneCuenta) {
        const res = await fetch("/api/auth/registro-cedula", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cedula: cedula.trim(), password, email_recuperacion: identidadEmail.trim() }),
        });
        const data = await res.json();
        if (!res.ok) { toast(data.error || "Error al registrar.", "error"); return; }
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("userRole", data.usuario.rol);
        sessionStorage.setItem("userName", data.usuario.nombre);
        if (data.onboardingRequired) {
          toast("Cuenta creada. Configura tu seguridad.", "info");
          setLoading(false);
          setMfaSetupActive(true);
          return;
        }
        toast("Cuenta creada correctamente.", "success");
        setTimeout(navigateAfterLogin, 300);
      } else {
        const res = await fetch("/api/auth/login-cedula", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cedula: cedula.trim(), password }),
        });
        const data = await res.json();
        if (!res.ok) { toast(data.error || "Contraseña incorrecta.", "error"); return; }
        if (data.mfaRequired) {
          setMfaTempToken(data.tempToken);
          setUseBackupCode(false);
          setBackupCode("");
          setLoading(false);
          return;
        }
        if (data.onboardingRequired) {
          sessionStorage.setItem("token", data.tempToken);
          sessionStorage.setItem("userRole", data.usuario.rol);
          sessionStorage.setItem("userName", data.usuario.nombre);
          toast("Completa la configuración de tu cuenta.", "info");
          setLoading(false);
          setMfaSetupActive(true);
          return;
        }
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("userRole", data.usuario.rol);
        sessionStorage.setItem("userName", data.usuario.nombre);
        toast("Inicio de sesión exitoso.", "success");
        setTimeout(navigateAfterLogin, 300);
      }
    } catch { toast("Error de conexión con el servidor.", "error"); }
    finally { setLoading(false); }
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
          backgroundImage: "radial-gradient(rgba(104,0,54,0.04) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 12% 30%, rgba(104,0,54,0.06) 0%, transparent 52%)," +
            "radial-gradient(ellipse at 90% 78%, rgba(252,192,25,0.08) 0%, transparent 45%)," +
            "linear-gradient(165deg, #FDFCFB 0%, #FAF9F7 55%, #F8F3F1 100%)",
          pointerEvents: "none",
        },
      }}
    >
      <Box sx={{ position: "absolute", zIndex: 1, inset: 0, backgroundImage: "url(/images/foto-loja-3-1.avif)", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.14, pointerEvents: "none",
        maskImage: "linear-gradient(to right, black 0%, transparent 90%)", WebkitMaskImage: "linear-gradient(to right, black 0%, transparent 90%)" }} />

      <Box
        component="img"
        src="/images/Gemini_Generated_Image_w37knpw37knpw37k-Photoroom.png"
        alt=""
        sx={{
          position: "absolute",
          zIndex: 1,
          top: "50%",
          right: { sm: 0, lg: -20 },
          transform: "translateY(-50%)",
          height: { sm: "72%", lg: "84%" },
          width: "auto",
          maxWidth: { sm: "46%", lg: "38%" },
          objectFit: "contain",
          opacity: 0.16,
          filter: "blur(4px)",
          pointerEvents: "none",
          userSelect: "none",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 78%)",
          display: { xs: "none", sm: "block" },
        }}
      />

      <Box sx={{ position: "absolute", zIndex: 1, top: "30%", left: { sm: "9%" }, display: { xs: "none", sm: "block" }, pointerEvents: "none", transform: "rotate(-6deg)" }}>
        <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "18px", border: "1px solid #ECECEF", boxShadow: "0 18px 40px rgba(47,0,24,0.10)", p: 2, width: 190 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.2 }}>
            <Box sx={{ width: 26, height: 26, borderRadius: "8px", bgcolor: "#fde9ef", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#680036" }}>report</span>
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 11, color: "#18151A" }}>Reporte #0241</Typography>
            <Box sx={{ ml: "auto", width: 8, height: 8, borderRadius: "50%", bgcolor: "#FCC019" }} />
          </Stack>
          <Box sx={{ width: "88%", height: 5, borderRadius: 3, bgcolor: "#F0EDEF", mb: 0.6 }} />
          <Box sx={{ width: "60%", height: 5, borderRadius: 3, bgcolor: "#F0EDEF", mb: 1.2 }} />
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.6, px: 1.2, py: 0.5, borderRadius: 999, bgcolor: "#FFF4CC" }}>
            <Typography sx={{ fontSize: 9, fontWeight: 700, color: "#785900" }}>En seguimiento</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ position: "absolute", zIndex: 1, top: "20%", right: { sm: "17%", lg: "15%" }, display: { xs: "none", sm: "block" }, pointerEvents: "none" }}>
        <Stack spacing={0.8}>
          <Box sx={{ bgcolor: "rgba(104,0,54,0.07)", borderRadius: "14px 14px 14px 4px", px: 2, py: 1.2, maxWidth: 200 }}>
            <Typography sx={{ fontSize: 10.5, color: "#680036", fontWeight: 600, lineHeight: 1.5 }}>Estudiante: "Quiero reportar un problema..."</Typography>
          </Box>
          <Box sx={{ bgcolor: "#FFFFFF", border: "1px solid #ECECEF", borderRadius: "14px 14px 4px 14px", px: 2, py: 1.2, maxWidth: 200, ml: "auto", boxShadow: "0 10px 24px rgba(47,0,24,0.06)" }}>
            <Typography sx={{ fontSize: 10.5, color: "#353136", fontWeight: 600, lineHeight: 1.5 }}>Bienestar: "Recibimos tu reporte ✓"</Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ position: "absolute", zIndex: 1, bottom: "13%", right: { sm: "14%", lg: "12%" }, display: { xs: "none", sm: "block" }, pointerEvents: "none", transform: "rotate(3deg)" }}>
        <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "18px", border: "1px solid #ECECEF", boxShadow: "0 18px 40px rgba(47,0,24,0.10)", p: 2, width: 170 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.2 }}>
            <Box sx={{ width: 26, height: 26, borderRadius: "8px", bgcolor: "#e8f7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#1f7a3f", fontVariationSettings: "'FILL' 1" }}>task_alt</span>
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 11, color: "#18151A" }}>Reporte #0187</Typography>
            <Box sx={{ ml: "auto", width: 8, height: 8, borderRadius: "50%", bgcolor: "#1f7a3f" }} />
          </Stack>
          <Box sx={{ width: "82%", height: 5, borderRadius: 3, bgcolor: "#F0EDEF", mb: 0.6 }} />
          <Box sx={{ width: "55%", height: 5, borderRadius: 3, bgcolor: "#F0EDEF", mb: 1.2 }} />
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.6, px: 1.2, py: 0.5, borderRadius: 999, bgcolor: "#e8f7ed" }}>
            <Typography sx={{ fontSize: 9, fontWeight: 700, color: "#1f7a3f" }}>Resuelto</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ position: "absolute", zIndex: 1, bottom: "12%", left: { sm: "10%" }, display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1, bgcolor: "rgba(255,255,255,0.85)", backdropFilter: "blur(6px)", border: "1px solid #ECECEF", borderRadius: "999px", px: 1.6, py: 0.9, boxShadow: "0 10px 26px rgba(47,0,24,0.08)", pointerEvents: "none" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 15, color: "#680036", fontVariationSettings: "'FILL' 1" }}>lock</span>
        <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "#18151A" }}>100% Confidencial</Typography>
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
              maxWidth: 430,
              bgcolor: "#FFFFFF",
              borderRadius: "28px",
              boxShadow: "0 24px 65px rgba(47,0,24,0.08)",
              border: "1px solid rgba(236,236,239,0.9)",
              p: { xs: "28px 24px", sm: "42px 36px" },
            }}
          >
            <Box sx={{ textAlign: "center", mb: 3.5 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: "18px", bgcolor: mfaSetupActive ? "rgba(104,0,54,0.08)" : "#F7E6EB", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2, transform: "rotate(-4deg)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: "#680036", fontVariationSettings: "'FILL' 1" }}>{mfaSetupActive ? "shield_lock" : "hearing"}</span>
              </Box>
              <Typography sx={{ fontWeight: 800, color: "#18151A", letterSpacing: "-0.02em", fontSize: 26, lineHeight: 1.2 }}>
                {mfaSetupActive ? "Protege tu cuenta" : "Bienvenido"}
              </Typography>
              <Typography sx={{ color: "#77737A", fontSize: 13, mt: 0.75, lineHeight: 1.6 }}>
                {mfaSetupActive
                  ? "Un último paso antes de entrar a Hubi. Configura la autenticación en dos pasos."
                  : "Accede a Hubi y comparte tu voz con la universidad."}
              </Typography>
            </Box>

            {!mfaTempToken && !mfaSetupActive && (
              <Box sx={{ display: "flex", mb: 3.5, p: 0.5, borderRadius: "999px", bgcolor: "#F7F7F9", border: "1px solid #ECECEF" }}>
                {[
                  { key: "cedula", label: "Cédula", sub: "Estudiantes" },
                  { key: "correo", label: "Correo", sub: "Administrativos" },
                ].map((t) => (
                  <Box
                    key={t.key}
                    onClick={() => handleSwitchTab(t.key)}
                    sx={{
                      flex: 1,
                      py: 1.1,
                      textAlign: "center",
                      cursor: "pointer",
                      borderRadius: "999px",
                      transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                      bgcolor: tab === t.key ? "#680036" : "transparent",
                      color: tab === t.key ? "#ffffff" : "#77737A",
                      "&:hover": { color: tab === t.key ? "#ffffff" : "#353136" },
                    }}
                  >
                    <Typography component="span" sx={{ fontWeight: 700, fontSize: 12, display: "block", lineHeight: 1.2 }}>
                      {t.label}
                    </Typography>
                    <Typography component="span" sx={{ fontWeight: 400, fontSize: 10, opacity: 0.75, display: "block", lineHeight: 1.2 }}>
                      {t.sub}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            {mfaSetupActive ? (
              <MfaSetupCard onComplete={navigateAfterLogin} />
            ) : mfaTempToken ? (
              <Box>
                {!useBackupCode ? (
                  <MfaChallenge
                    onSubmit={handleMfaSubmit}
                    loading={mfaLoading}
                    error={mfaError}
                    onUseBackupCode={() => setUseBackupCode(true)}
                  />
                ) : (
                  <Box sx={{ textAlign: "center" }}>
                    <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "#FFF4CC", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#785900" }}>vpn_key</span>
                    </Box>
                    <Typography sx={{ color: "#18151A", fontWeight: 700, mb: 0.5, fontSize: 16 }}>
                      Código de respaldo
                    </Typography>
                    <Typography sx={{ color: "#77737A", fontSize: 13, mb: 3, lineHeight: 1.6 }}>
                      Ingresa uno de tus códigos de respaldo de 8 caracteres.
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Código de respaldo"
                      value={backupCode}
                      onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                      variant="outlined"
                      error={!!mfaError}
                      helperText={mfaError || ""}
                      sx={{
                        mb: 2,
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#F7F7F9", borderRadius: "14px", height: "52px",
                          "& fieldset": { borderColor: "transparent" },
                          "&:hover fieldset": { borderColor: "#dcc9d0", borderWidth: "1px" },
                          "&.Mui-focused fieldset": { borderColor: "rgba(104,0,54,0.30)", borderWidth: "1px", boxShadow: "0 0 0 4px rgba(104,0,54,0.055)" },
                        },
                        "& .MuiInputBase-input": { fontSize: 14, color: "#18151A", textAlign: "center", letterSpacing: "0.15em", fontFamily: "monospace" },
                      }}
                      inputProps={{ inputMode: "text", autoComplete: "off", "aria-label": "Código de respaldo" }}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleMfaBackupSubmit}
                      disabled={mfaLoading || !backupCode.trim()}
                      sx={{ ...primaryBtnSx, mb: 1.5 }}
                    >
                      {mfaLoading ? <CircularProgress size={18} color="inherit" /> : "Verificar"}
                    </Button>
                    <Button size="small" onClick={() => { setUseBackupCode(false); setMfaError(""); }}
                      sx={{ color: "#680036", fontWeight: 600, fontSize: 12, textTransform: "none" }}>
                      Usar código de autenticación
                    </Button>
                  </Box>
                )}
              </Box>
            ) : tab === "cedula" ? (
              <>
                {!cedulaResultado && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: "#18151A", mb: 1, fontSize: 13 }}>Número de cédula</Typography>
                      <TextField fullWidth placeholder="Ingresa tu número de cédula" value={cedula}
                        onChange={(e) => { const val = e.target.value.replace(/\D/g, "").slice(0, 10); setCedula(val); }}
                        variant="outlined" error={!!cedulaError} helperText={cedulaError || ""}
                        sx={inputStyles} inputProps={{ "aria-label": "Número de cédula", inputMode: "numeric" }}
                        onKeyDown={(e) => { if (e.key === "Enter") handleVerificarCedula(); }} />
                    </Box>
                    <Button fullWidth variant="contained" onClick={handleVerificarCedula}
                      disabled={cedulaVerificando || cedula.length !== 10}
                      sx={primaryBtnSx}>
                      {cedulaVerificando ? <CircularProgress size={18} color="inherit" /> : "Validar"}
                    </Button>
                  </Box>
                )}

                {cedulaResultado && !cedulaResultado.encontrado && (
                  <Box sx={{ textAlign: "center" }}>
                    <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "#fef1f1", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#ba1a1a" }}>search_off</span>
                    </Box>
                    <Typography sx={{ color: "#18151A", fontWeight: 700, mb: 1, fontSize: 16 }}>Cédula no encontrada</Typography>
                    <Typography sx={{ color: "#77737A", fontSize: 13, mb: 3, lineHeight: 1.6 }}>No estás en la lista de estudiantes habilitados.</Typography>
                    <Button fullWidth size="small" onClick={resetCedula} sx={{ color: "#680036", fontWeight: 600, fontSize: 13, textTransform: "none" }}>Intentar con otra cédula</Button>
                  </Box>
                )}

                {cedulaResultado && cedulaResultado.encontrado && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <Box sx={{ p: 2, borderRadius: "14px", bgcolor: "#F7F7F9", border: "1px solid #ECECEF", display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "rgba(104,0,54,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 19, color: "#680036", fontVariationSettings: "'FILL' 1" }}>person</span>
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ color: "#969198", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em" }}>ESTUDIANTE</Typography>
                        <Typography sx={{ color: "#18151A", fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{cedulaResultado.nombres}</Typography>
                      </Box>
                    </Box>

                    {!cedulaResultado.tieneCuenta && !identidadVerificado && !identidadEnviado && (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Box>
                          <Typography sx={{ fontWeight: 700, color: "#18151A", fontSize: 14 }}>Verifica tu identidad</Typography>
                          <Typography sx={{ color: "#77737A", fontSize: 12, lineHeight: 1.5, mt: 0.5 }}>
                            Ingresa tu correo institucional para verificar tu identidad antes de crear una contraseña.
                          </Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 600, color: "#18151A", mb: 1, fontSize: 13 }}>Correo institucional</Typography>
                          <TextField fullWidth placeholder="usuario@uide.edu.ec" value={identidadEmail}
                            onChange={(e) => setIdentidadEmail(e.target.value)} variant="outlined"
                            error={!!identidadError} helperText={identidadError || ""}
                            sx={inputStyles} inputProps={{ "aria-label": "Correo institucional" }} />
                        </Box>
                        <Button fullWidth variant="contained" onClick={handleVerificarIdentidad}
                          disabled={identidadVerificando || !identidadEmail.trim()}
                          sx={primaryBtnSx}>
                          {identidadVerificando ? <CircularProgress size={18} color="inherit" /> : "Enviar enlace de verificación"}
                        </Button>
                      </Box>
                    )}

                    {identidadEnviado && !identidadVerificado && (
                      <Box sx={{ textAlign: "center" }}>
                        <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: "#e8f7ed", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#1f7a3f", fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
                        </Box>
                        <Typography sx={{ color: "#18151A", fontWeight: 700, mb: 1, fontSize: 16, lineHeight: 1.4 }}>
                          {identidadMensaje}
                        </Typography>
                        <Typography sx={{ color: "#77737A", fontSize: 13, mb: 0.5, lineHeight: 1.6 }}>
                          Enviamos un enlace a <strong>{identidadEmail}</strong>
                        </Typography>
                        <Typography sx={{ color: "#969198", fontSize: 12, mb: 3, lineHeight: 1.5 }}>
                          Haz clic en el enlace del correo para verificar tu identidad y continuar con el registro.
                        </Typography>
                        <Button size="small" onClick={() => { setIdentidadEnviado(false); setIdentidadError(""); }}
                          sx={{ color: "#680036", fontWeight: 600, fontSize: 13, textTransform: "none" }}>
                          Usar otro correo
                        </Button>
                      </Box>
                    )}

                    {(cedulaResultado.tieneCuenta || identidadVerificado) && (
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: "#18151A", mb: 1, fontSize: 13 }}>{cedulaResultado.tieneCuenta ? "Contraseña" : "Nueva contraseña"}</Typography>
                        {cedulaResultado.tieneCuenta && (
                          <Box sx={{ textAlign: "right", mb: 0.5 }}>
                            <Button
                              onClick={handleForgotPasswordCedula}
                              disabled={forgotLoading}
                              sx={{ color: "#680036", fontWeight: 600, fontSize: 12, textTransform: "none", p: 0, minWidth: "auto",
                                "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}
                            >
                              {forgotLoading ? <CircularProgress size={12} sx={{ color: "#680036", mr: 0.5 }} /> : null}
                              ¿Olvidaste tu contraseña?
                            </Button>
                            {forgotMsg && (
                              <Typography sx={{ color: "#1f7a3f", fontSize: 11, mt: 0.5 }}>{forgotMsg}</Typography>
                            )}
                          </Box>
                        )}
                        <TextField fullWidth placeholder={cedulaResultado.tieneCuenta ? "Ingresa tu contraseña" : "Crea una contraseña"}
                          type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                          variant="outlined" sx={inputStyles} inputProps={{ "aria-label": "Contraseña" }}
                          InputProps={{ endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "#969198" }}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showPassword ? "visibility_off" : "visibility"}</span>
                              </IconButton>
                            </InputAdornment>
                          )}} />
                      </Box>
                    )}

                    {(cedulaResultado.tieneCuenta || identidadVerificado) && !cedulaResultado.tieneCuenta && password.length > 0 && (
                      <Box>
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

                    {(cedulaResultado.tieneCuenta || identidadVerificado) && !cedulaResultado.tieneCuenta && (
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: "#18151A", mb: 1, fontSize: 13 }}>Confirmar contraseña</Typography>
                        <TextField fullWidth placeholder="Confirma tu contraseña" type={showPassword ? "text" : "password"}
                          value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} variant="outlined"
                          error={!!confirmPassword && password !== confirmPassword}
                          helperText={confirmPassword && password !== confirmPassword ? "Las contraseñas no coinciden." : ""}
                          sx={inputStyles} inputProps={{ "aria-label": "Confirmar contraseña" }} />
                      </Box>
                    )}

                    {(cedulaResultado.tieneCuenta || identidadVerificado) && (
                      <Button fullWidth variant="contained" onClick={handleLoginCedula} disabled={loading || !password || (!cedulaResultado.tieneCuenta && !passwordVal.checks.isValid)}
                        sx={primaryBtnSx}>
                        {loading ? <CircularProgress size={18} color="inherit" /> : (cedulaResultado.tieneCuenta ? "Ingresar" : "Crear cuenta e ingresar")}
                      </Button>
                    )}

                    <Button size="small" onClick={resetCedula} sx={{ color: "#680036", fontWeight: 600, fontSize: 13, textTransform: "none", alignSelf: "center", "&:hover": { bgcolor: "rgba(104, 0, 54, 0.06)" } }}>Usar otra cédula</Button>
                  </Box>
                )}
              </>
            ) : tab === "correo" ? (
              <>
                {!emailResultado && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: "#18151A", mb: 1, fontSize: 13 }}>Correo institucional</Typography>
                      <TextField fullWidth placeholder="usuario@uide.edu.ec" value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)} variant="outlined"
                        error={!!emailError} helperText={emailError || ""}
                        sx={inputStyles} inputProps={{ "aria-label": "Correo institucional" }}
                        onKeyDown={(e) => { if (e.key === "Enter") handleVerificarEmail(); }} />
                    </Box>
                    <Button fullWidth variant="contained" onClick={handleVerificarEmail}
                      disabled={emailVerificando || !emailInput.trim()}
                      sx={primaryBtnSx}>
                      {emailVerificando ? <CircularProgress size={18} color="inherit" /> : "Validar"}
                    </Button>
                  </Box>
                )}

                {emailResultado && !emailResultado.encontrado && (
                  <Box sx={{ textAlign: "center" }}>
                    <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "#fef1f1", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#ba1a1a" }}>cancel</span>
                    </Box>
                    <Typography sx={{ color: "#18151A", fontWeight: 700, mb: 1, fontSize: 16 }}>Correo no válido</Typography>
                    <Typography sx={{ color: "#77737A", fontSize: 13, mb: 3, lineHeight: 1.6 }}>{emailResultado.mensaje}</Typography>
                    <Button fullWidth size="small" onClick={resetEmail} sx={{ color: "#680036", fontWeight: 600, fontSize: 13, textTransform: "none" }}>Intentar con otro correo</Button>
                  </Box>
                )}

                {emailResultado && emailResultado.encontrado && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <Box sx={{ p: 2, borderRadius: "14px", bgcolor: "#F7F7F9", border: "1px solid #ECECEF", display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "rgba(104,0,54,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 19, color: "#680036", fontVariationSettings: "'FILL' 1" }}>badge</span>
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ color: "#969198", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{emailResultado.rol}</Typography>
                        <Typography sx={{ color: "#18151A", fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{emailResultado.nombres}</Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: "#18151A", mb: 1, fontSize: 13 }}>{emailResultado.tieneCuenta ? "Contraseña" : "Nueva contraseña"}</Typography>
                      {emailResultado.tieneCuenta && (
                        <Box sx={{ textAlign: "right", mb: 0.5 }}>
                          <Button
                            onClick={handleForgotPasswordEmail}
                            disabled={forgotLoading}
                            sx={{ color: "#680036", fontWeight: 600, fontSize: 12, textTransform: "none", p: 0, minWidth: "auto",
                              "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}
                          >
                            {forgotLoading ? <CircularProgress size={12} sx={{ color: "#680036", mr: 0.5 }} /> : null}
                            ¿Olvidaste tu contraseña?
                          </Button>
                          {forgotMsg && (
                            <Typography sx={{ color: "#1f7a3f", fontSize: 11, mt: 0.5 }}>{forgotMsg}</Typography>
                          )}
                        </Box>
                      )}
                      <TextField fullWidth placeholder={emailResultado.tieneCuenta ? "Ingresa tu contraseña" : "Crea una contraseña"}
                        type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                        variant="outlined" sx={inputStyles} inputProps={{ "aria-label": "Contraseña" }}
                        InputProps={{ endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "#969198" }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showPassword ? "visibility_off" : "visibility"}</span>
                            </IconButton>
                          </InputAdornment>
                        )}} />
                    </Box>
                    {!emailResultado.tieneCuenta && password.length > 0 && (
                      <Box>
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
                    {!emailResultado.tieneCuenta && (
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: "#18151A", mb: 1, fontSize: 13 }}>Confirmar contraseña</Typography>
                        <TextField fullWidth placeholder="Confirma tu contraseña" type={showPassword ? "text" : "password"}
                          value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} variant="outlined"
                          error={!!confirmPassword && password !== confirmPassword}
                          helperText={confirmPassword && password !== confirmPassword ? "Las contraseñas no coinciden." : ""}
                          sx={inputStyles} inputProps={{ "aria-label": "Confirmar contraseña" }} />
                      </Box>
                    )}
                    <Button fullWidth variant="contained" onClick={handleLoginEmail} disabled={loading || !password || (!emailResultado.tieneCuenta && !passwordVal.checks.isValid)}
                      sx={primaryBtnSx}>
                      {loading ? <CircularProgress size={18} color="inherit" /> : (emailResultado.tieneCuenta ? "Ingresar" : "Crear cuenta e ingresar")}
                    </Button>
                    <Button size="small" onClick={resetEmail} sx={{ color: "#680036", fontWeight: 600, fontSize: 13, textTransform: "none", alignSelf: "center", "&:hover": { bgcolor: "rgba(104, 0, 54, 0.06)" } }}>Usar otro correo</Button>
                  </Box>
                )}
              </>
            ) : null}
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

export default LoginPage;
