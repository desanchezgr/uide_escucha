import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, TextField, Button, Stack, CircularProgress,
  Divider, Paper, Alert, LinearProgress, Fade,
} from "@mui/material";
import { useToast } from "../context/useToast.js";
import fondoPagina from "/images/foto-loja-2-1.avif";

const API_BASE = "/api";

const ROLES_ADMIN = [
  "admin", "prorector", "ti_soporte", "bibliotecario", "conserje",
  "mantenimiento", "secretaria", "bienestar universitario", "financiero",
];

const STEP_EMAIL = "email";
const STEP_MFA_INTRO = "mfa-intro";
const STEP_MFA_SCAN = "mfa-scan";
const STEP_MFA_BACKUP = "mfa-backup";

const mfaSubSteps = [
  { num: 1, title: "Descarga una app autenticadora", desc: "Instala Google Authenticator, Microsoft Authenticator o Authy en tu celular desde la tienda de aplicaciones.", icon: "download" },
  { num: 2, title: "Escanea el código QR", desc: "Abre la app, toca '+' o 'Agregar cuenta' y escanea el código QR que aparece abajo.", icon: "qr_code_scanner" },
  { num: 3, title: "Ingresa el código de 6 dígitos", desc: "La app generará un código de 6 dígitos. Ingrésalo aquí para verificar que todo funciona correctamente.", icon: "pin" },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState("loading");
  const [checking, setChecking] = useState(true);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);

  const [setupData, setSetupData] = useState(null);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [mfaError, setMfaError] = useState("");
  const [mfaSuccess, setMfaSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedBackup, setSavedBackup] = useState(false);
  const [loadingSetup, setLoadingSetup] = useState(false);
  const inputRefs = useRef([]);

  const navigateAfterLogin = () => {
    const role = sessionStorage.getItem("userRole");
    const adminRoles = ["admin", "prorector", "ti_soporte", "bibliotecario", "conserje", "mantenimiento", "secretaria", "bienestar universitario", "financiero"];
    navigate(adminRoles.includes(role) ? "/dashboard-admin" : "/dashboard-estudiante");
  };

  const isAdmin = ROLES_ADMIN.includes(sessionStorage.getItem("userRole"));

  const checkOnboardingStatus = async () => {
    setChecking(true);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) { navigate("/ingreso"); return; }

      const [mfaRes, emailRes] = await Promise.all([
        fetch(`${API_BASE}/mfa/status`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/mfa/recovery-email`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const mfaData = mfaRes.ok ? await mfaRes.json() : { enabled: false };
      const emailData = emailRes.ok ? await emailRes.json() : { email: null };

      if (mfaData.enabled) {
        navigateAfterLogin();
        return;
      }

      if (isAdmin) {
        setStep(STEP_MFA_INTRO);
      } else if (emailData.email) {
        setStep(STEP_MFA_INTRO);
      } else {
        setStep(STEP_EMAIL);
      }
    } catch {
      setStep(isAdmin ? STEP_MFA_INTRO : STEP_EMAIL);
    } finally {
      setChecking(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { checkOnboardingStatus(); }, []);

  const handleSaveEmail = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.endsWith("@uide.edu.ec")) {
      setEmailError("El correo debe ser institucional (@uide.edu.ec).");
      return;
    }
    setEmailError("");
    setEmailSaving(true);
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE}/auth/recovery-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json();
        setEmailError(data.error || "Error al guardar el correo.");
        return;
      }
      setStep(STEP_MFA_INTRO);
    } catch {
      setEmailError("Error de conexión con el servidor.");
    } finally {
      setEmailSaving(false);
    }
  };

  const handleStartMfa = async () => {
    setLoadingSetup(true);
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE}/mfa/setup`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al iniciar configuración MFA");
      const data = await res.json();
      setSetupData(data);
      setCode(["", "", "", "", "", ""]);
      setMfaError("");
      setMfaSuccess(false);
      setStep(STEP_MFA_SCAN);
      setTimeout(() => inputRefs.current[0]?.focus(), 400);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoadingSetup(false);
    }
  };

  const handleDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(0, 1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setMfaError("");
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newCode.join("").length === 6) {
      handleVerifyMfa(newCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split("");
      setCode(newCode);
      inputRefs.current[5]?.focus();
      handleVerifyMfa(newCode);
    }
  };

  const handleVerifyMfa = async (fullCodeOverride) => {
    const fullCode = Array.isArray(fullCodeOverride) ? fullCodeOverride.join("") : (fullCodeOverride || code.join(""));
    if (fullCode.length !== 6) return;

    setVerifying(true);
    setMfaError("");
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE}/mfa/verify-setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ token: fullCode, backupCodes: setupData?.backupCodes || [] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMfaError(data.error || "Código incorrecto. Intenta de nuevo.");
        setCode(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 200);
        return;
      }
      setMfaSuccess(true);
      setTimeout(() => setStep(STEP_MFA_BACKUP), 800);
    } catch (err) {
      setMfaError(err.message || "Error al verificar el código.");
      setCode(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 200);
    } finally {
      setVerifying(false);
    }
  };

  const handleDownloadBackup = () => {
    if (!setupData?.backupCodes) return;
    const content = setupData.backupCodes.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "uide-escucha-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
    setSavedBackup(true);
  };

  const handleCopyBackup = () => {
    if (!setupData?.backupCodes) return;
    navigator.clipboard.writeText(setupData.backupCodes.join("\n"));
    setCopied(true);
    setSavedBackup(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinish = () => {
    toast("Configuración completada. Bienvenido.", "success");
    navigateAfterLogin();
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#F7F7F9", borderRadius: "10px", height: "48px",
      "& fieldset": { borderColor: "transparent" },
      "&:hover fieldset": { borderColor: "#dcc9d0", borderWidth: "1.5px" },
      "&.Mui-focused fieldset": { borderColor: "#680036", borderWidth: "1.5px" },
      "&.Mui-error fieldset": { borderColor: "#ba1a1a" },
    },
    "& .MuiInputBase-input": { fontSize: 14, color: "#18151A", "&::placeholder": { color: "#969198", opacity: 1 } },
    "& .MuiFormHelperText-root": { fontSize: 11, mt: 0.5, mx: 0.5 },
  };

  const mainSteps = isAdmin
    ? [
        { key: STEP_MFA_INTRO, number: 1, label: "Autenticación en dos pasos", desc: "Protege tu cuenta con verificación adicional" },
        { key: STEP_MFA_BACKUP, number: 2, label: "Códigos de respaldo", desc: "Guarda los códigos para emergencias" },
      ]
    : [
        { key: STEP_EMAIL, number: 1, label: "Correo de recuperación", desc: "Configura tu correo para recuperar el acceso" },
        { key: STEP_MFA_INTRO, number: 2, label: "Autenticación en dos pasos", desc: "Protege tu cuenta con verificación adicional" },
        { key: STEP_MFA_BACKUP, number: 3, label: "Códigos de respaldo", desc: "Guarda los códigos para emergencias" },
      ];

  const getCurrentStepIndex = () => {
    if (!isAdmin && (step === STEP_EMAIL || step === "loading" || checking)) return 0;
    if (step === STEP_MFA_INTRO || step === STEP_MFA_SCAN || loadingSetup) return isAdmin ? 0 : 1;
    return isAdmin ? 1 : 2;
  };

  const currentStepIndex = getCurrentStepIndex();
  const progressPercent = isAdmin
    ? (step === STEP_MFA_BACKUP ? 100 : step === STEP_MFA_SCAN ? 66 : step === STEP_MFA_INTRO ? 33 : 0)
    : (step === STEP_MFA_BACKUP ? 100 : step === STEP_MFA_SCAN ? 66 : step === STEP_MFA_INTRO ? 33 : 0);

  if (checking) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#ffffff" }}>
        <CircularProgress sx={{ color: "#680036" }} />
      </Box>
    );
  }

  if (loadingSetup) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: { xs: "column", md: "row" }, bgcolor: "#ffffff" }}>
        <Box sx={{
          width: { xs: "100%", md: "50%" },
          minHeight: { xs: 200, md: "100vh" },
          backgroundImage: `linear-gradient(135deg, rgba(104, 0, 54, 0.95) 0%, rgba(74, 0, 38, 0.92) 100%), url(${fondoPagina})`,
          backgroundSize: "cover", backgroundPosition: "center",
          display: "flex", flexDirection: "column",
          p: { xs: 5, md: 8 }, position: "relative", color: "#ffffff",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: "#fcc019", fontVariationSettings: "'FILL' 1" }}>school</span>
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.2, fontSize: 20 }}>Hubi</Typography>
              <Typography sx={{ opacity: 0.6, fontSize: 10, letterSpacing: "0.04em" }}>Plataforma UIDE Escucha</Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ width: { xs: "100%", md: "50%" }, display: "flex", alignItems: "center", justifyContent: "center", p: 6, bgcolor: "#ffffff" }}>
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress sx={{ color: "#680036", mb: 2 }} />
            <Typography sx={{ color: "#77737A", fontSize: 14 }}>Preparando configuración de seguridad...</Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: { xs: "column", md: "row" }, bgcolor: "#ffffff" }}>
      <Box sx={{
        width: { xs: "100%", md: "50%" },
        minHeight: { xs: 200, md: "100vh" },
        backgroundImage: `linear-gradient(135deg, rgba(104, 0, 54, 0.95) 0%, rgba(74, 0, 38, 0.92) 100%), url(${fondoPagina})`,
        backgroundSize: "cover", backgroundPosition: "center",
        display: "flex", flexDirection: "column",
        p: { xs: 5, md: 8 }, position: "relative", color: "#ffffff",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: "#fcc019", fontVariationSettings: "'FILL' 1" }}>school</span>
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.2, fontSize: 20 }}>Hubi</Typography>
            <Typography sx={{ opacity: 0.6, fontSize: 10, letterSpacing: "0.04em" }}>Plataforma UIDE Escucha</Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", py: { xs: 4, md: 0 }, maxWidth: 440, mx: { xs: "auto", md: 0 } }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" fontWeight={800} sx={{ lineHeight: 1.15, mb: 2, fontSize: { xs: 28, sm: 34, md: 40 }, letterSpacing: "-0.025em" }}>
              Configura tu cuenta
            </Typography>
            <Box sx={{ width: 50, height: 3.5, bgcolor: "#fcc019", borderRadius: 2, mb: 3 }} />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Stack spacing={2.5}>
              {mainSteps.map((s, i) => {
                const isCurrent = i === currentStepIndex;
                const isDone = i < currentStepIndex;
                const isPending = i > currentStepIndex;

                return (
                  <Stack key={s.key} direction="row" spacing={2} alignItems="flex-start">
                    <Box sx={{
                      width: 32, height: 32, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all 0.4s ease",
                      bgcolor: isDone ? "#1f7a3f" : isCurrent ? "#680036" : "rgba(255,255,255,0.15)",
                      border: isPending ? "2px solid rgba(255,255,255,0.2)" : "none",
                      boxShadow: isCurrent ? "0 0 0 4px rgba(104, 0, 54, 0.3)" : isDone ? "0 0 0 4px rgba(31, 122, 63, 0.2)" : "none",
                    }}>
                      {isDone ? (
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#ffffff", fontVariationSettings: "'FILL' 1" }}>check</span>
                      ) : (
                        <Typography sx={{ color: isCurrent ? "#ffffff" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 13 }}>
                          {s.number}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <Typography sx={{
                        fontWeight: isCurrent ? 700 : 400, fontSize: 14,
                        color: isDone ? "rgba(255,255,255,0.5)" : "#ffffff",
                        textDecoration: isDone ? "line-through" : "none",
                        transition: "all 0.3s",
                      }}>
                        {s.label}
                      </Typography>
                      {isCurrent && (
                        <Typography sx={{ opacity: 0.55, fontSize: 11, mt: 0.3 }}>{s.desc}</Typography>
                      )}
                    </Box>
                  </Stack>
                );
              })}
            </Stack>
          </Box>
        </Box>
      </Box>

      <Box sx={{ width: { xs: "100%", md: "50%" }, display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 4, md: 6 }, bgcolor: "#ffffff" }}>
        <Box sx={{ maxWidth: 480, width: "100%" }}>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              mb: 4, height: 4, borderRadius: 2,
              bgcolor: "#ECECEF",
              "& .MuiLinearProgress-bar": {
                bgcolor: "#680036", borderRadius: 2,
                transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              },
            }}
          />

          <Fade in={step === STEP_EMAIL} mountOnEnter unmountOnExit timeout={300}>
            <Box>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: "rgba(104,0,54,0.08)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#680036", fontVariationSettings: "'FILL' 1" }}>mail</span>
                </Box>
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, bgcolor: "rgba(104,0,54,0.06)", px: 1.5, py: 0.5, borderRadius: 1, mb: 1.5 }}>
                  <Typography sx={{ color: "#680036", fontWeight: 700, fontSize: 11 }}>Paso 1 de 3</Typography>
                </Box>
                <Typography sx={{ color: "#18151A", fontWeight: 700, mb: 0.5, fontSize: 22 }}>
                  Correo de recuperación
                </Typography>
                <Typography sx={{ color: "#77737A", fontSize: 13, lineHeight: 1.7, maxWidth: 380, mx: "auto" }}>
                  Ingresa tu correo institucional <strong>@uide.edu.ec</strong>. Lo usaremos para ayudarte a recuperar tu contraseña si algún día la olvidas.
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: 600, color: "#18151A", mb: 1, fontSize: 13 }}>Correo institucional</Typography>
                <TextField fullWidth placeholder="usuario@uide.edu.ec" value={email}
                  onChange={(e) => setEmail(e.target.value)} variant="outlined"
                  error={!!emailError} helperText={emailError || ""}
                  sx={inputStyles} inputProps={{ "aria-label": "Correo institucional" }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveEmail(); }} />
              </Box>

              <Button fullWidth variant="contained" onClick={handleSaveEmail}
                disabled={emailSaving || !email.trim()}
                sx={{
                  background: "#680036", color: "#ffffff", fontWeight: 700,
                  py: 1.6, borderRadius: "10px", fontSize: 14,
                  boxShadow: "0 4px 16px rgba(104, 0, 54, 0.25)", textTransform: "none",
                  "&:hover": { transform: "translateY(-1px)", boxShadow: "0 6px 24px rgba(104, 0, 54, 0.35)" },
                  "&.Mui-disabled": { background: "rgba(104, 0, 54, 0.25)", color: "rgba(255, 255, 255, 0.6)", boxShadow: "none" },
                }}>
                {emailSaving ? <CircularProgress size={18} color="inherit" /> : "Guardar y continuar"}
              </Button>

              <Typography sx={{ color: "#77737A", fontSize: 11, textAlign: "center", mt: 2 }}>
                Solo se aceptan correos con dominio @uide.edu.ec
              </Typography>
            </Box>
          </Fade>

          <Fade in={step === STEP_MFA_INTRO} mountOnEnter unmountOnExit timeout={300}>
            <Box sx={{ textAlign: "center" }}>
              <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: "rgba(104,0,54,0.08)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#680036", fontVariationSettings: "'FILL' 1" }}>shield_lock</span>
              </Box>
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, bgcolor: "rgba(104,0,54,0.06)", px: 1.5, py: 0.5, borderRadius: 1, mb: 1.5 }}>
                <Typography sx={{ color: "#680036", fontWeight: 700, fontSize: 11 }}>Paso 2 de 3</Typography>
              </Box>
              <Typography sx={{ color: "#18151A", fontWeight: 700, mb: 1, fontSize: 22 }}>
                Autenticación en dos pasos
              </Typography>
              <Typography sx={{ color: "#77737A", fontSize: 13, mb: 4, lineHeight: 1.7, maxWidth: 400, mx: "auto" }}>
                Esta capa extra de seguridad protege tu cuenta. Cada vez que inicies sesión necesitarás tu contraseña <strong>y</strong> un código temporal generado por una app en tu celular. Así, aunque alguien sepa tu contraseña, no podrá entrar sin tu celular.
              </Typography>

              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3, textAlign: "left", borderColor: "#ECECEF", bgcolor: "#F7F7F9" }}>
                <Typography sx={{ color: "#77737A", fontSize: 10, fontWeight: 700, mb: 1.5, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Que necesitas
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    { icon: "smartphone", text: "Un celular con acceso a la tienda de aplicaciones" },
                    { icon: "download", text: "Una app autenticadora gratuita (Google/Microsoft Authenticator o Authy)" },
                    { icon: "camera", text: "La camara de tu celular para escanear un codigo QR" },
                  ].map((item) => (
                    <Stack key={item.text} direction="row" spacing={1.5} alignItems="center">
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#680036", fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                      <Typography sx={{ color: "#18151A", fontSize: 12 }}>{item.text}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>

              <Button fullWidth variant="contained" onClick={handleStartMfa}
                startIcon={<span className="material-symbols-outlined" style={{ fontSize: 20 }}>shield_person</span>}
                sx={{
                  background: "#680036", color: "#ffffff", fontWeight: 700,
                  py: 1.5, borderRadius: "10px", fontSize: 15,
                  boxShadow: "0 4px 16px rgba(104, 0, 54, 0.25)", textTransform: "none",
                  "&:hover": { transform: "translateY(-1px)", boxShadow: "0 6px 24px rgba(104, 0, 54, 0.35)" },
                }}>
                Comenzar configuración
              </Button>
            </Box>
          </Fade>

          <Fade in={step === STEP_MFA_SCAN} mountOnEnter unmountOnExit timeout={300}>
            <Box>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, bgcolor: "rgba(104,0,54,0.06)", px: 1.5, py: 0.5, borderRadius: 1, mb: 2 }}>
                  <Typography sx={{ color: "#680036", fontWeight: 700, fontSize: 11 }}>Paso 2 de 3</Typography>
                </Box>
                <Typography sx={{ color: "#18151A", fontWeight: 700, mb: 1, fontSize: 22 }}>
                  Configura tu autenticador
                </Typography>
                <Typography sx={{ color: "#77737A", fontSize: 13, lineHeight: 1.7, maxWidth: 400, mx: "auto" }}>
                  Sigue estos 3 pasos para vincular tu cuenta con la app autenticadora.
                </Typography>
              </Box>

              <Stack spacing={2} sx={{ mb: 3 }}>
                {mfaSubSteps.map((subStep) => {
                  const isActive = subStep.num === 3;
                  const isDoneStep = mfaSuccess || (subStep.num < 3);
                  return (
                    <Paper
                      key={subStep.num}
                      variant="outlined"
                      sx={{
                        p: 2, borderRadius: 2,
                        borderColor: isActive ? "#680036" : isDoneStep ? "#1f7a3f" : "#ECECEF",
                        bgcolor: isActive ? "rgba(104,0,54,0.03)" : isDoneStep ? "rgba(31,122,63,0.04)" : "#ffffff",
                        borderWidth: isActive ? 2 : 1,
                        transition: "all 0.3s",
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Box sx={{
                          width: 28, height: 28, borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                          bgcolor: isDoneStep ? "#1f7a3f" : isActive ? "#680036" : "#ECECEF",
                          color: "#ffffff", fontWeight: 700, fontSize: 13,
                          transition: "all 0.3s",
                        }}>
                          {isDoneStep ? (
                            <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>check</span>
                          ) : (
                            subStep.num
                          )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontWeight: 700, color: "#18151A", fontSize: 13, mb: 0.3 }}>
                            {subStep.title}
                          </Typography>
                          <Typography sx={{ color: "#77737A", fontSize: 11, lineHeight: 1.5 }}>
                            {subStep.desc}
                          </Typography>
                        </Box>
                        <span className="material-symbols-outlined" style={{ fontSize: 20, color: isActive ? "#680036" : "#77737A", opacity: isActive ? 1 : 0.4 }}>{subStep.icon}</span>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>

              {setupData?.qrCode && !mfaSuccess && (
                <Fade in timeout={400}>
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Typography sx={{ color: "#18151A", fontWeight: 600, mb: 2, fontSize: 14 }}>
                      Escanea este código con tu app autenticadora
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: "#ffffff", borderRadius: 2, border: "2px solid #680036", display: "inline-block", boxShadow: "0 4px 20px rgba(104,0,54,0.1)" }}>
                      <img src={setupData.qrCode} alt="QR MFA" style={{ width: 200, height: 200, display: "block" }} />
                    </Box>

                    <Box sx={{ bgcolor: "#F7F7F9", borderRadius: 2, p: 2, mt: 2, border: "1px solid #ECECEF", maxWidth: 360, mx: "auto" }}>
                      <Typography sx={{ color: "#77737A", fontSize: 10, fontWeight: 700, mb: 0.5, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        ¿No puedes escanear? Ingresa este código manualmente
                      </Typography>
                      <Typography sx={{ color: "#18151A", fontWeight: 600, fontSize: 13, fontFamily: "monospace", userSelect: "all", wordBreak: "break-all" }}>
                        {setupData?.secret}
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
              )}

              {mfaSuccess && (
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <Fade in timeout={400}>
                    <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "#e8f7ed", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#1f7a3f", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </Box>
                  </Fade>
                  <Typography sx={{ color: "#1f7a3f", fontWeight: 700, fontSize: 15 }}>
                    Código verificado correctamente
                  </Typography>
                  <Typography sx={{ color: "#77737A", fontSize: 12, mt: 0.5 }}>
                    Redirigiendo a códigos de respaldo...
                  </Typography>
                </Box>
              )}

              {!mfaSuccess && (
                <>
                  <Divider sx={{ mb: 3 }} />

                  <Typography sx={{ color: "#18151A", fontWeight: 600, mb: 2, fontSize: 14, textAlign: "center" }}>
                    Ingresa el código de 6 dígitos que aparece en tu app
                  </Typography>

                  <Stack direction="row" spacing={1.75} justifyContent="center" sx={{ mb: 2 }}>
                    {code.map((digit, index) => (
                      <TextField key={index}
                        inputRef={(el) => { inputRefs.current[index] = el; }}
                        value={digit}
                        onChange={(e) => handleDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        variant="outlined"
                        slotProps={{
                          input: {
                            sx: {
                              width: 48, height: 56, textAlign: "center", fontSize: 22, fontWeight: 700,
                              color: "#18151A", borderRadius: "10px", bgcolor: "#F7F7F9",
                              "& .MuiOutlinedInput-input": { textAlign: "center", p: 0, lineHeight: "56px", caretColor: "#680036" },
                              "& fieldset": { borderColor: mfaError ? "#ba1a1a" : digit ? "#680036" : "#ECECEF", borderWidth: digit ? 2 : 1 },
                            },
                          },
                        }}
                        inputProps={{ maxLength: 1, inputMode: "numeric", "aria-label": `Digito ${index + 1}` }}
                      />
                    ))}
                  </Stack>

                  {mfaError && (
                    <Fade in>
                      <Alert severity="error" sx={{ borderRadius: 2, mb: 2, fontSize: 12 }}>
                        {mfaError}
                      </Alert>
                    </Fade>
                  )}

                  {verifying && (
                    <Box sx={{ textAlign: "center", mb: 2 }}>
                      <CircularProgress size={20} sx={{ color: "#680036" }} />
                      <Typography sx={{ color: "#77737A", fontSize: 12, mt: 1 }}>Verificando código...</Typography>
                    </Box>
                  )}

                  <Button fullWidth variant="contained" onClick={() => handleVerifyMfa()}
                    disabled={verifying || code.join("").length !== 6}
                    sx={{
                      background: "#680036", color: "#ffffff", fontWeight: 700,
                      py: 1.4, borderRadius: "10px", fontSize: 14,
                      boxShadow: "0 4px 16px rgba(104, 0, 54, 0.25)", textTransform: "none",
                      "&:hover": { transform: "translateY(-1px)", boxShadow: "0 6px 24px rgba(104, 0, 54, 0.35)" },
                      "&.Mui-disabled": { background: "rgba(104, 0, 54, 0.25)", color: "rgba(255, 255, 255, 0.6)", boxShadow: "none" },
                    }}>
                    {verifying ? <CircularProgress size={18} color="inherit" /> : "Verificar código"}
                  </Button>

                  <Typography sx={{ color: "#77737A", fontSize: 10, textAlign: "center", mt: 1.5 }}>
                    El código cambia cada 30 segundos. Asegúrate de ingresarlo antes de que caduque.
                  </Typography>
                </>
              )}
            </Box>
          </Fade>

          <Fade in={step === STEP_MFA_BACKUP} mountOnEnter unmountOnExit timeout={300}>
            <Box sx={{ textAlign: "center" }}>
              <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: "#e8f7ed", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#1f7a3f", fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              </Box>
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, bgcolor: "#e8f7ed", px: 1.5, py: 0.5, borderRadius: 1, mb: 1.5 }}>
                <Typography sx={{ color: "#1f7a3f", fontWeight: 700, fontSize: 11 }}>Paso 3 de 3</Typography>
              </Box>
              <Typography sx={{ color: "#18151A", fontWeight: 700, mb: 0.5, fontSize: 22 }}>
                ¡Todo listo!
              </Typography>
              <Typography sx={{ color: "#77737A", fontSize: 13, mb: 3, lineHeight: 1.7, maxWidth: 400, mx: "auto" }}>
                La autenticación en dos pasos quedó activada. Ahora guarda tus códigos de respaldo en un lugar seguro.
              </Typography>

              <Alert severity="warning" icon={<span className="material-symbols-outlined" style={{ fontSize: 20 }}>warning</span>}
                sx={{ borderRadius: 2, mb: 3, fontSize: 12, textAlign: "left" }}>
                <strong>Importante:</strong> Estos códigos solo se muestran esta vez. Si pierdes el acceso a tu app autenticadora, los códigos de respaldo son la <strong>única forma</strong> de recuperar tu cuenta. Guárdalos en un lugar seguro, no los compartas con nadie.
              </Alert>

              <Paper variant="outlined" sx={{ p: 2.5, bgcolor: "#F7F7F9", borderRadius: 2, mb: 3, borderColor: "#ECECEF" }}>
                <Typography sx={{ color: "#77737A", fontSize: 10, fontWeight: 700, mb: 1.5, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Tus códigos de respaldo
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                  {setupData?.backupCodes?.map((c, i) => (
                    <Typography key={i} sx={{
                      fontFamily: "monospace", fontSize: 14, letterSpacing: "0.08em",
                      color: "#18151A", bgcolor: "#ffffff", px: 1.5, py: 0.8, borderRadius: 1,
                      border: "1px solid #ECECEF", textAlign: "center",
                    }}>
                      {c}
                    </Typography>
                  ))}
                </Box>
              </Paper>

              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Button fullWidth variant="outlined" onClick={handleCopyBackup}
                  sx={{ fontWeight: 600, borderColor: "#ECECEF", color: "#18151A", py: 1.2, borderRadius: "10px", textTransform: "none", "&:hover": { borderColor: "#680036", bgcolor: "rgba(104,0,54,0.04)" } }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6 }}>content_copy</span>
                  {copied ? "Copiado" : "Copiar"}
                </Button>
                <Button fullWidth variant="outlined" onClick={handleDownloadBackup}
                  sx={{ fontWeight: 600, borderColor: "#ECECEF", color: "#18151A", py: 1.2, borderRadius: "10px", textTransform: "none", "&:hover": { borderColor: "#680036", bgcolor: "rgba(104,0,54,0.04)" } }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6 }}>download</span>
                  Descargar
                </Button>
              </Stack>

              <Button fullWidth variant="contained" onClick={handleFinish} disabled={!savedBackup}
                sx={{
                  background: "#680036", color: "#ffffff", fontWeight: 700,
                  py: 1.5, borderRadius: "10px", fontSize: 15,
                  boxShadow: "0 4px 16px rgba(104, 0, 54, 0.25)", textTransform: "none",
                  "&:hover": { transform: "translateY(-1px)", boxShadow: "0 6px 24px rgba(104, 0, 54, 0.35)" },
                  "&.Mui-disabled": { background: "rgba(104, 0, 54, 0.25)", color: "rgba(255, 255, 255, 0.6)", boxShadow: "none" },
                }}
                startIcon={<span className="material-symbols-outlined" style={{ fontSize: 20 }}>rocket_launch</span>}>
                {savedBackup ? "Ir al dashboard" : "Descarga o copia los códigos para continuar"}
              </Button>

              {!savedBackup && (
                <Typography sx={{ color: "#77737A", fontSize: 11, mt: 1 }}>
                  Debes descargar o copiar los códigos antes de continuar
                </Typography>
              )}
            </Box>
          </Fade>
        </Box>
      </Box>
    </Box>
  );
}

export default OnboardingPage;
