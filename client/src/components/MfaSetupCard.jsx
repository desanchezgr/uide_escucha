import { useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Divider,
  Alert,
  Fade,
} from "@mui/material";
import { useToast } from "../context/useToast.js";

const API_BASE = "/api";

const mfaSubSteps = [
  { num: 1, title: "Descarga una app autenticadora", desc: "Instala Google Authenticator, Microsoft Authenticator o Authy en tu celular.", icon: "download" },
  { num: 2, title: "Escanea el código QR", desc: "Abre la app, toca '+' o 'Agregar cuenta' y escanea el código de abajo.", icon: "qr_code_scanner" },
  { num: 3, title: "Ingresa el código de 6 dígitos", desc: "La app generará un código de 6 dígitos. Ingrésalo para verificar que funciona.", icon: "pin" },
];

function MfaSetupCard({ onComplete }) {
  const toast = useToast();
  const [step, setStep] = useState("intro");
  const [setupData, setSetupData] = useState(null);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [loadingSetup, setLoadingSetup] = useState(false);
  const [error, setError] = useState("");
  const [mfaSuccess, setMfaSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedBackup, setSavedBackup] = useState(false);
  const inputRefs = useRef([]);

  const handleStartSetup = async () => {
    setLoadingSetup(true);
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE}/mfa/setup`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al iniciar configuración");
      const data = await res.json();
      setSetupData(data);
      setCode(["", "", "", "", "", ""]);
      setError("");
      setMfaSuccess(false);
      setStep("scan");
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
    setError("");
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newCode.join("").length === 6) {
      handleVerify(newCode);
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
      handleVerify(newCode);
    }
  };

  const handleVerify = async (fullCodeOverride) => {
    const fullCode = Array.isArray(fullCodeOverride) ? fullCodeOverride.join("") : (fullCodeOverride || code.join(""));
    if (fullCode.length !== 6) return;

    setVerifying(true);
    setError("");
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE}/mfa/verify-setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ token: fullCode, backupCodes: setupData?.backupCodes || [] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Código incorrecto. Intenta de nuevo.");
        setCode(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 200);
        return;
      }
      setMfaSuccess(true);
      setTimeout(() => setStep("backup"), 800);
    } catch (err) {
      setError(err.message || "Error al verificar el código.");
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
    toast("Autenticación en dos pasos activada.", "success");
    onComplete?.();
  };

  const cardBtnSx = {
    background: "#680036",
    color: "#ffffff",
    fontWeight: 700,
    py: 1.4,
    borderRadius: "14px",
    fontSize: 14,
    boxShadow: "0 4px 16px rgba(104, 0, 54, 0.25)",
    textTransform: "none",
    "&:hover": { transform: "translateY(-1px)", boxShadow: "0 6px 24px rgba(104, 0, 54, 0.35)" },
    "&.Mui-disabled": { background: "rgba(104, 0, 54, 0.25)", color: "rgba(255, 255, 255, 0.6)", boxShadow: "none" },
  };

  if (loadingSetup) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <CircularProgress sx={{ color: "#680036", mb: 2 }} />
        <Typography sx={{ color: "#77737A", fontSize: 13 }}>Preparando configuración de seguridad...</Typography>
      </Box>
    );
  }

  if (step === "intro") {
    return (
      <Fade in timeout={400}>
        <Box sx={{ textAlign: "center" }}>
          <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "rgba(104,0,54,0.08)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#680036", fontVariationSettings: "'FILL' 1" }}>shield_lock</span>
          </Box>
          <Typography sx={{ color: "#18151A", fontWeight: 700, mb: 0.5, fontSize: 20 }}>
            Autenticación en dos pasos
          </Typography>
          <Typography sx={{ color: "#77737A", fontSize: 12, mb: 3, lineHeight: 1.7 }}>
            Esta capa extra de seguridad protege tu cuenta. Cada vez que inicies sesión necesitarás tu contraseña <strong>y</strong> un código temporal generado por una app en tu celular.
          </Typography>

          <PaperNeeds />

          <Button fullWidth variant="contained" onClick={handleStartSetup}
            startIcon={<span className="material-symbols-outlined" style={{ fontSize: 20 }}>shield_person</span>}
            sx={cardBtnSx}>
            Comenzar configuración
          </Button>
        </Box>
      </Fade>
    );
  }

  if (step === "scan") {
    const fullCode = code.join("");
    const isComplete = fullCode.length === 6;
    return (
      <Fade in timeout={400}>
        <Box>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography sx={{ color: "#18151A", fontWeight: 700, mb: 1, fontSize: 19 }}>
              Configura tu autenticador
            </Typography>
            <Typography sx={{ color: "#77737A", fontSize: 12, lineHeight: 1.6 }}>
              Sigue estos 3 pasos para vincular tu cuenta con la app autenticadora.
            </Typography>
          </Box>

          <Stack spacing={1.5} sx={{ mb: 3 }}>
            {mfaSubSteps.map((subStep) => {
              const isActive = subStep.num === 3;
              const isDoneStep = mfaSuccess || subStep.num < 3;
              return (
                <Box key={subStep.num} sx={{
                  p: 1.5, borderRadius: "14px",
                  border: isActive ? "2px solid #680036" : "1px solid #ECECEF",
                  bgcolor: isActive ? "rgba(104,0,54,0.03)" : isDoneStep ? "rgba(31,122,63,0.04)" : "#ffffff",
                  transition: "all 0.3s",
                }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{
                      width: 26, height: 26, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      bgcolor: isDoneStep ? "#1f7a3f" : isActive ? "#680036" : "#ECECEF",
                      color: "#ffffff", fontWeight: 700, fontSize: 12,
                    }}>
                      {isDoneStep ? (
                        <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>check</span>
                      ) : (subStep.num)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 700, color: "#18151A", fontSize: 12, mb: 0.2 }}>{subStep.title}</Typography>
                      <Typography sx={{ color: "#77737A", fontSize: 10.5, lineHeight: 1.5 }}>{subStep.desc}</Typography>
                    </Box>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: isActive ? "#680036" : "#77737A", opacity: isActive ? 1 : 0.4 }}>{subStep.icon}</span>
                  </Stack>
                </Box>
              );
            })}
          </Stack>

          {setupData?.qrCode && !mfaSuccess && (
            <Fade in timeout={500}>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Typography sx={{ color: "#18151A", fontWeight: 600, mb: 1.5, fontSize: 13 }}>
                  Escanea este código con tu app autenticadora
                </Typography>
                <Box sx={{ p: 1.5, bgcolor: "#ffffff", borderRadius: "14px", border: "2px solid #680036", display: "inline-block" }}>
                  <img src={setupData.qrCode} alt="Código QR para MFA" style={{ width: 168, height: 168, display: "block" }} />
                </Box>

                <Box sx={{ bgcolor: "#F7F7F9", borderRadius: "14px", p: 1.5, mt: 1.5, border: "1px solid #ECECEF" }}>
                  <Typography sx={{ color: "#77737A", fontSize: 9, fontWeight: 700, mb: 0.5, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    ¿No puedes escanear? Ingresa este código manualmente
                  </Typography>
                  <Typography sx={{ color: "#18151A", fontWeight: 600, fontSize: 12, fontFamily: "monospace", userSelect: "all", wordBreak: "break-all" }}>
                    {setupData?.secret}
                  </Typography>
                </Box>
              </Box>
            </Fade>
          )}

          {mfaSuccess && (
            <Fade in timeout={400}>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: "#e8f7ed", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 30, color: "#1f7a3f", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </Box>
                <Typography sx={{ color: "#1f7a3f", fontWeight: 700, fontSize: 14 }}>Código verificado correctamente</Typography>
                <Typography sx={{ color: "#77737A", fontSize: 11, mt: 0.5 }}>Redirigiendo a códigos de respaldo...</Typography>
              </Box>
            </Fade>
          )}

          {!mfaSuccess && (
            <>
              <Divider sx={{ mb: 2.5 }} />

              <Typography sx={{ color: "#18151A", fontWeight: 600, mb: 1.5, fontSize: 13, textAlign: "center" }}>
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
                          color: "#18151A", borderRadius: "12px", bgcolor: "#F7F7F9",
                          "& .MuiOutlinedInput-input": { textAlign: "center", p: 0, lineHeight: "56px", caretColor: "#680036" },
                          "& fieldset": { borderColor: error ? "#ba1a1a" : digit ? "#680036" : "#ECECEF", borderWidth: digit ? 2 : 1 },
                        },
                      },
                    }}
                    inputProps={{ maxLength: 1, inputMode: "numeric", "aria-label": `Digito ${index + 1}` }}
                  />
                ))}
              </Stack>

              {error && (
                <Fade in>
                  <Alert severity="error" sx={{ borderRadius: "12px", mb: 1.5, fontSize: 11 }}>
                    {error}
                  </Alert>
                </Fade>
              )}

              {verifying && (
                <Box sx={{ textAlign: "center", mb: 1.5 }}>
                  <CircularProgress size={18} sx={{ color: "#680036" }} />
                  <Typography sx={{ color: "#77737A", fontSize: 11, mt: 0.5 }}>Verificando código...</Typography>
                </Box>
              )}

              <Button fullWidth variant="contained" onClick={() => handleVerify()}
                disabled={verifying || !isComplete}
                sx={cardBtnSx}>
                {verifying ? <CircularProgress size={18} color="inherit" /> : "Verificar código"}
              </Button>

              <Typography sx={{ color: "#77737A", fontSize: 10, textAlign: "center", mt: 1.5 }}>
                El código cambia cada 30 segundos. Asegúrate de ingresarlo antes de que caduque.
              </Typography>
            </>
          )}
        </Box>
      </Fade>
    );
  }

  if (step === "backup") {
    return (
      <Fade in timeout={400}>
        <Box sx={{ textAlign: "center" }}>
          <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "#e8f7ed", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#1f7a3f", fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          </Box>
          <Typography sx={{ color: "#18151A", fontWeight: 700, mb: 0.5, fontSize: 20 }}>
            ¡Todo listo!
          </Typography>
          <Typography sx={{ color: "#77737A", fontSize: 12, mb: 2.5, lineHeight: 1.7 }}>
            La autenticación en dos pasos quedó activada. Ahora guarda tus códigos de respaldo en un lugar seguro.
          </Typography>

          <Alert severity="warning" icon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>warning</span>}
            sx={{ borderRadius: "12px", mb: 2, fontSize: 11, textAlign: "left" }}>
            <strong>Importante:</strong> Estos códigos solo se muestran esta vez. Si pierdes el acceso a tu app autenticadora, los códigos de respaldo son la <strong>única forma</strong> de recuperar tu cuenta.
          </Alert>

          <Box sx={{ p: 2, bgcolor: "#F7F7F9", borderRadius: "14px", mb: 2, border: "1px solid #ECECEF" }}>
            <Typography sx={{ color: "#77737A", fontSize: 9, fontWeight: 700, mb: 1, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Tus códigos de respaldo
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.75 }}>
              {setupData?.backupCodes?.map((c, i) => (
                <Typography key={i} sx={{
                  fontFamily: "monospace", fontSize: 12.5, letterSpacing: "0.06em",
                  color: "#18151A", bgcolor: "#ffffff", px: 1, py: 0.7, borderRadius: "10px",
                  border: "1px solid #ECECEF", textAlign: "center",
                }}>
                  {c}
                </Typography>
              ))}
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
            <Button fullWidth variant="outlined" onClick={handleCopyBackup}
              sx={{ fontWeight: 600, borderColor: "#ECECEF", color: "#18151A", py: 1.1, borderRadius: "12px", fontSize: 13, textTransform: "none", "&:hover": { borderColor: "#680036", bgcolor: "rgba(104,0,54,0.04)" } }}>
              <span className="material-symbols-outlined" style={{ fontSize: 17, marginRight: 5 }}>content_copy</span>
              {copied ? "Copiado" : "Copiar"}
            </Button>
            <Button fullWidth variant="outlined" onClick={handleDownloadBackup}
              sx={{ fontWeight: 600, borderColor: "#ECECEF", color: "#18151A", py: 1.1, borderRadius: "12px", fontSize: 13, textTransform: "none", "&:hover": { borderColor: "#680036", bgcolor: "rgba(104,0,54,0.04)" } }}>
              <span className="material-symbols-outlined" style={{ fontSize: 17, marginRight: 5 }}>download</span>
              Descargar
            </Button>
          </Stack>

          <Button fullWidth variant="contained" onClick={handleFinish} disabled={!savedBackup} sx={cardBtnSx}
            startIcon={<span className="material-symbols-outlined" style={{ fontSize: 20 }}>rocket_launch</span>}>
            {savedBackup ? "Continuar" : "Descarga o copia los códigos para continuar"}
          </Button>

          {!savedBackup && (
            <Typography sx={{ color: "#77737A", fontSize: 10, mt: 1 }}>
              Debes descargar o copiar los códigos antes de continuar
            </Typography>
          )}
        </Box>
      </Fade>
    );
  }

  return null;
}

function PaperNeeds() {
  return (
    <Box sx={{ p: 2, borderRadius: "14px", mb: 2.5, textAlign: "left", border: "1px solid #ECECEF", bgcolor: "#F7F7F9" }}>
      <Typography sx={{ color: "#77737A", fontSize: 9, fontWeight: 700, mb: 1.5, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Qué necesitas
      </Typography>
      <Stack spacing={1.25}>
        {[
          { icon: "smartphone", text: "Un celular con acceso a la tienda de aplicaciones" },
          { icon: "download", text: "Una app autenticadora gratuita (Google/Microsoft Authenticator o Authy)" },
          { icon: "photo_camera", text: "La cámara de tu celular para escanear un código QR" },
        ].map((item) => (
          <Stack key={item.text} direction="row" spacing={1.25} alignItems="center">
            <span className="material-symbols-outlined" style={{ fontSize: 17, color: "#680036", fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
            <Typography sx={{ color: "#18151A", fontSize: 11 }}>{item.text}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

export default MfaSetupCard;
