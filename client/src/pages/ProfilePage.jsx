import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  CircularProgress,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  InputAdornment,
  Divider,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Fade,
} from "@mui/material";
import { useToast } from "../context/useToast.js";
import { usePasswordValidation } from "../hooks/useValidations.js";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { apiFetch } from "../utils/api.js";

const ROLE_LABELS = {
  estudiante: "Estudiante",
  admin: "Administrador",
  prorector: "Prorector",
  ti_soporte: "Soporte TI",
  bibliotecario: "Bibliotecario",
  conserje: "Conserje",
  mantenimiento: "Mantenimiento",
  secretaria: "Secretaria",
  "bienestar universitario": "Bienestar Universitario",
  financiero: "Financiero",
};

const ROLE_ICONS = {
  estudiante: "school",
  admin: "admin_panel_settings",
  prorector: "account_balance",
  ti_soporte: "computer",
  bibliotecario: "menu_book",
  conserje: "cleaning_services",
  mantenimiento: "build",
  secretaria: "description",
  "bienestar universitario": "favorite",
  financiero: "account_balance_wallet",
};

const AREA_LABELS = {
  ti_soporte: "Soporte TI",
  bibliotecario: "Biblioteca",
  conserje: "Limpieza",
  mantenimiento: "Mantenimiento",
  secretaria: "Secretaría",
  "bienestar universitario": "Bienestar",
  financiero: "Financiero",
};

const ROLES_ADMIN = [
  "admin", "prorector", "ti_soporte", "bibliotecario", "conserje",
  "mantenimiento", "secretaria", "bienestar universitario", "financiero",
];

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    bgcolor: "#F7F7F9",
    "& fieldset": { borderColor: "transparent" },
    "&:hover fieldset": { borderColor: "#E6E3E8" },
    "&.Mui-focused fieldset": { borderColor: "rgba(104,0,54,0.30)", boxShadow: "0 0 0 3px rgba(104,0,54,0.055)" },
  },
};

function SectionCard({ title, subtitle, icon, children, action }) {
  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: "20px", border: "1px solid #ECECEF", overflow: "hidden", mb: 2.5, boxShadow: "0 1px 4px rgba(47,0,24,0.05)" }}
    >
      <Box sx={{ px: { xs: 2.5, md: 3 }, py: 2, borderBottom: "1px solid #ECECEF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          {icon && (
            <Box sx={{ width: 32, height: 32, borderRadius: "10px", bgcolor: "#F7E6EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 17, color: "#680036" }}>{icon}</span>
            </Box>
          )}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="#18151A" sx={{ lineHeight: 1.25 }}>{title}</Typography>
            {subtitle && <Typography variant="caption" color="#77737A">{subtitle}</Typography>}
          </Box>
        </Stack>
        {action}
      </Box>
      <Box sx={{ p: { xs: 2.5, md: 3 } }}>{children}</Box>
    </Paper>
  );
}

function ProfileInfoTile({ icon, label, value, primary }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: "14px",
        border: "1px solid",
        bgcolor: primary ? "#F7E6EB" : "#F8F9FB",
        borderColor: primary ? "rgba(104,0,54,0.14)" : "#F0EDEF",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: 34, height: 34, borderRadius: "11px", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          bgcolor: primary ? "#680036" : "#FFFFFF",
          border: primary ? "none" : "1px solid #ECECEF",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 17, color: primary ? "#FCC019" : "#77737A" }}>
          {icon}
        </span>
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" fontWeight={700} color="#77737A" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontSize: 9.5, display: "block" }}>
          {label}
        </Typography>
        <Tooltip title={value}>
          <Typography variant="body2" fontWeight={700} color={primary ? "#680036" : "#18151A"} sx={{ mt: 0.25, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {value}
          </Typography>
        </Tooltip>
      </Box>
    </Box>
  );
}

function ProfileHero({ isAdmin, fullName, roleLabel, roleIcon, initial, email, areaLabel, cedula }) {
  const tiles = [
    { key: "rol", icon: "badge", label: "Rol", value: roleLabel, primary: true },
    ...(areaLabel ? [{ key: "area", icon: "domain", label: "Área", value: areaLabel }] : []),
    ...(isAdmin ? [] : [{ key: "cedula", icon: "credit_card", label: "Cédula", value: cedula || "—" }]),
    { key: "correo", icon: "mail", label: "Correo institucional", value: email || "—" },
  ];

  return (
    <Box sx={{ mb: 3, borderRadius: "24px", overflow: "hidden", border: "1px solid", borderColor: isAdmin ? "rgba(104,0,54,0.2)" : "#F0E2E8", boxShadow: "0 1px 4px rgba(47,0,24,0.05)" }}>
      <Box
        sx={{
          position: "relative",
          height: { xs: 116, md: 148 },
          background: isAdmin
            ? "linear-gradient(120deg, #2F0018 0%, #680036 100%)"
            : "linear-gradient(120deg, #F7E9EF 0%, #FFF6E3 100%)",
          overflow: "hidden",
        }}
      >
        {isAdmin ? (
          <>
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <Box sx={{ position: "absolute", top: -30, right: "12%", width: 140, height: 140, border: "1px solid rgba(252,192,25,0.25)", transform: "rotate(45deg)" }} />
            <Box sx={{ position: "absolute", bottom: -50, right: "30%", width: 120, height: 120, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)" }} />
          </>
        ) : (
          <>
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle at 85% 15%, rgba(252,192,25,0.30), transparent 45%)",
              }}
            />
            <Box sx={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 8% 95%, rgba(104,0,54,0.10), transparent 50%)" }} />
            <Box sx={{ position: "absolute", top: -40, right: "8%", width: 150, height: 150, borderRadius: "50%", border: "1px solid rgba(252,192,25,0.35)" }} />
          </>
        )}
        <Box sx={{ position: "absolute", right: { xs: 18, md: 30 }, bottom: -16, opacity: isAdmin ? 0.9 : 0.55 }}>
          <span className="material-symbols-outlined" style={{ fontSize: { xs: 92, md: 120 }, color: isAdmin ? "rgba(252,192,25,0.22)" : "rgba(104,0,54,0.13)" }}>
            {roleIcon}
          </span>
        </Box>
        <Box
          sx={{
            position: "absolute",
            left: 0, right: 0, bottom: 0,
            height: 3,
            background: "linear-gradient(90deg, #FCC019 0%, rgba(252,192,25,0.15) 60%, transparent 100%)",
          }}
        />
      </Box>

      <Box sx={{ px: { xs: 2.5, md: 3.5 }, pb: 3, bgcolor: "#FFFFFF" }}>
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2.5, mt: -40 }}>
          <Avatar
            sx={{
              width: 88,
              height: 88,
              bgcolor: "#680036",
              color: "#ffffff",
              fontSize: 34,
              fontWeight: 800,
              border: "4px solid",
              borderColor: "#FCC019",
              boxShadow: "0 8px 24px rgba(104,0,54,0.22)",
              flexShrink: 0,
            }}
          >
            {initial}
          </Avatar>
          <Box sx={{ minWidth: 0, pb: 0.5 }}>
            <Typography variant="h5" fontWeight={800} color="#18151A" sx={{ lineHeight: 1.2, letterSpacing: "-0.02em", fontSize: { xs: 22, md: 26 } }}>
              {fullName}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.75, flexWrap: "wrap", rowGap: 0.75 }}>
              <Chip
                icon={<span className="material-symbols-outlined" style={{ fontSize: 15 }}>{roleIcon}</span>}
                label={roleLabel}
                size="small"
                sx={{
                  bgcolor: "#FFF4CC",
                  color: "#785900",
                  fontWeight: 700,
                  fontSize: 12,
                  height: 26,
                  borderRadius: 999,
                  ".MuiChip-icon": { color: "#785900" },
                }}
              />
              {areaLabel && (
                <Chip
                  icon={<span className="material-symbols-outlined" style={{ fontSize: 14 }}>domain</span>}
                  label={areaLabel}
                  size="small"
                  sx={{
                    bgcolor: "#F0EDEF",
                    color: "#353136",
                    fontWeight: 600,
                    fontSize: 12,
                    height: 26,
                    borderRadius: 999,
                    ".MuiChip-icon": { color: "#77737A" },
                  }}
                />
              )}
              {email && (
                <Typography variant="caption" color="#77737A" noWrap sx={{ maxWidth: { xs: 200, md: 260 }, ml: 0.5 }}>
                  {email}
                </Typography>
              )}
            </Stack>
          </Box>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 1.5, mt: 2.5, pt: 2.5, borderTop: "1px solid #F0EDEF" }}>
          {tiles.map((t) => (
            <Box
              key={t.key}
              sx={{
                p: 1.75,
                borderRadius: "14px",
                border: "1px solid",
                bgcolor: t.primary ? "#F7E6EB" : "#F8F9FB",
                borderColor: t.primary ? "rgba(104,0,54,0.14)" : "#F0EDEF",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 26, height: 26, borderRadius: "9px", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    bgcolor: t.primary ? "#680036" : "#FFFFFF",
                    border: t.primary ? "none" : "1px solid #ECECEF",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: t.primary ? "#FCC019" : "#77737A" }}>
                    {t.icon}
                  </span>
                </Box>
                <Typography variant="caption" fontWeight={700} color="#77737A" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontSize: 9.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {t.label}
                </Typography>
              </Box>
              <Tooltip title={t.value}>
                <Typography variant="body2" fontWeight={700} color={t.primary ? "#680036" : "#18151A"} sx={{ mt: 0.75, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 13.5 }}>
                  {t.value}
                </Typography>
              </Tooltip>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function ProfileSkeleton() {
  return (
    <Box>
      <Box sx={{ mb: 3, borderRadius: "24px", border: "1px solid #ECECEF", overflow: "hidden" }}>
        <Skeleton variant="rectangular" height={148} sx={{ bgcolor: "#F2E7EC" }} />
        <Box sx={{ px: 3, pb: 3, bgcolor: "#FFFFFF" }}>
          <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2.5, mt: -40 }}>
            <Skeleton variant="circular" width={88} height={88} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" height={28} />
              <Skeleton variant="text" width="25%" height={18} sx={{ mt: 0.5 }} />
            </Box>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 1.5, mt: 2.5, pt: 2.5 }}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: "14px" }} />
            ))}
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "7fr 5fr" }, gap: 2.5, alignItems: "start" }}>
        <Skeleton variant="rounded" height={380} sx={{ borderRadius: "20px" }} />
        <Skeleton variant="rounded" height={240} sx={{ borderRadius: "20px" }} />
      </Box>
    </Box>
  );
}

function ProfilePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const passwordVal = usePasswordValidation(newPassword);

  const [mfaStatus, setMfaStatus] = useState(null);
  const [mfaLoading, setMfaLoading] = useState(true);
  const [mfaToggling, setMfaToggling] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableToken, setDisableToken] = useState("");
  const [showDisablePass, setShowDisablePass] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/ingreso", { replace: true });
      return;
    }
    const load = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [profileRes, mfaRes] = await Promise.all([
          apiFetch("/usuarios/perfil", { headers }),
          apiFetch("/mfa/status", { headers }),
        ]);
        if (!profileRes.ok) throw new Error("Error al cargar perfil");
        const profileData = await profileRes.json();
        setProfile(profileData);
        if (mfaRes.ok) {
          const mfaData = await mfaRes.json();
          setMfaStatus(mfaData);
        }
      } catch (err) {
        toast(err.message, "error");
      } finally {
        setLoading(false);
        setMfaLoading(false);
      }
    };
    load();
  }, [navigate, toast]);

  const handleMfaToggle = async (e, checked) => {
    if (checked) {
      navigate("/mfa/setup");
      return;
    }
    setDisableDialogOpen(true);
  };

  const handleDisableMfa = async () => {
    if (!disablePassword.trim() || !disableToken.trim()) {
      toast("Contraseña y codigo de verificacion requeridos.", "warning");
      return;
    }
    setMfaToggling(true);
    try {
      const token = sessionStorage.getItem("token");
      const res = await apiFetch("/mfa/disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: disablePassword, token: disableToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al desactivar MFA");
      toast("MFA desactivado correctamente.", "success");
      setMfaStatus({ enabled: false, verified: false, hasBackupCodes: false });
      setDisableDialogOpen(false);
      setDisablePassword("");
      setDisableToken("");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setMfaToggling(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast("Las contraseñas nuevas no coinciden.", "error");
      return;
    }
    if (!passwordVal.checks.isValid) {
      toast("La nueva contraseña no cumple todos los requisitos de seguridad.", "error");
      return;
    }
    setSaving(true);
    try {
      const token = sessionStorage.getItem("token");
      const res = await apiFetch("/usuarios/cambiar-contrasenia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cambiar contraseña");
      toast("Contraseña actualizada correctamente.", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout subtitle="Mi Perfil" currentPage="Mi Perfil" decor="profile">
        <Fade in timeout={350}>
          <Box sx={{ maxWidth: 860, mx: "auto" }}>
            <ProfileSkeleton />
          </Box>
        </Fade>
      </DashboardLayout>
    );
  }

  const fullName = [profile?.nombres, profile?.apellidos].filter(Boolean).join(" ") || "Usuario";
  const initial = (profile?.nombres?.charAt(0) || "U").toUpperCase();
  const roleLabel = ROLE_LABELS[profile?.rol] || profile?.rol || "Usuario";
  const roleIcon = ROLE_ICONS[profile?.rol] || "person";
  const isAdmin = ROLES_ADMIN.includes(profile?.rol);
  const areaLabel = AREA_LABELS[profile?.rol] || (profile?.rol === "prorector" ? "Gestión General" : "");

  const recEmail = profile?.email_recuperacion;
  const instEmail = profile?.email;
  const isSynthetic = instEmail?.endsWith("@cedula.uide.edu.ec");
  const displayEmail = recEmail || (!isSynthetic ? instEmail : "");

  return (
    <DashboardLayout subtitle="Mi Perfil" currentPage="Mi Perfil" decor="profile">
      <Fade in timeout={350}>
        <Box sx={{ maxWidth: 980, mx: "auto" }}>
          <ProfileHero
            isAdmin={isAdmin}
            fullName={fullName}
            roleLabel={roleLabel}
            roleIcon={roleIcon}
            initial={initial}
            email={displayEmail}
            areaLabel={areaLabel}
            cedula={profile?.cedula}
          />

          <SectionCard title="Información personal" subtitle="Datos de tu cuenta institucional." icon="badge">
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
              <ProfileInfoTile icon="person" label="Nombre completo" value={fullName} primary />
              {!isAdmin && (
                <ProfileInfoTile icon="credit_card" label="Cédula" value={profile?.cedula || "—"} />
              )}
              <ProfileInfoTile icon="badge" label="Rol" value={roleLabel} />
              {areaLabel && (
                <ProfileInfoTile icon="domain" label="Área" value={areaLabel} />
              )}
              {instEmail && !isSynthetic && (
                <ProfileInfoTile icon="mail" label="Correo institucional" value={instEmail} />
              )}
              {recEmail && (
                <ProfileInfoTile icon="vpn_key" label="Correo de recuperación" value={recEmail} />
              )}
            </Box>
          </SectionCard>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "7fr 5fr" }, gap: 2.5, alignItems: "start" }}>
          <SectionCard title="Seguridad" subtitle="Mantén tu cuenta protegida cambiando tu contraseña periódicamente." icon="lock">
            <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 460 }}>
              <Stack spacing={2.5}>
                <TextField
                  label="Contraseña actual"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  fullWidth
                  size="small"
                  placeholder="Ingresa tu contraseña actual"
                  helperText=" "
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#77737A" }}>lock_open</span>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowCurrent(!showCurrent)} edge="end" size="small">
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                            {showCurrent ? "visibility_off" : "visibility"}
                          </span>
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />
                <TextField
                  label="Nueva contraseña"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  fullWidth
                  size="small"
                  placeholder="Crea una contraseña segura"
                  helperText={
                    newPassword.length > 0 && newPassword.length < 8
                      ? "Debe tener al menos 8 caracteres"
                      : " "
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#77737A" }}>lock</span>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowNew(!showNew)} edge="end" size="small">
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                            {showNew ? "visibility_off" : "visibility"}
                          </span>
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />
                {newPassword.length > 0 && (
                  <Box sx={{ px: 0.5 }}>
                    <Stack spacing={0.6}>
                      {passwordVal.checks.checks.map((check) => (
                        <Stack key={check.label} direction="row" spacing={0.8} alignItems="center">
                          <Box
                            component="span"
                            className="material-symbols-outlined"
                            sx={{
                              fontSize: 16,
                              color: check.pass ? "#1f7a3f" : "#ba1a1a",
                              fontVariationSettings: "'FILL' 1",
                            }}
                          >
                            {check.pass ? "check_circle" : "cancel"}
                          </Box>
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: check.pass ? "#1f7a3f" : "#77737A",
                              fontWeight: check.pass ? 600 : 400,
                            }}
                          >
                            {check.label}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                )}
                <TextField
                  label="Confirmar nueva contraseña"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  fullWidth
                  size="small"
                  placeholder="Repite la nueva contraseña"
                  error={confirmPassword.length > 0 && newPassword !== confirmPassword}
                  helperText={
                    confirmPassword.length > 0 && newPassword !== confirmPassword
                      ? "Las contraseñas no coinciden"
                      : " "
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#77737A" }}>verified_user</span>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end" size="small">
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                            {showConfirm ? "visibility_off" : "visibility"}
                          </span>
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />

                <Divider />

                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={1}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || !passwordVal.checks.isValid}
                    sx={{
                      bgcolor: "#680036",
                      textTransform: "none",
                      borderRadius: "14px",
                      fontWeight: 700,
                      py: 1.25,
                      px: 4,
                      boxShadow: "0 4px 14px rgba(104,0,54,0.22)",
                      "&:hover": { bgcolor: "#56002D", boxShadow: "0 6px 20px rgba(104,0,54,0.3)" },
                      "&.Mui-disabled": { bgcolor: "#d9c6cd" },
                    }}
                  >
                    {saving ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={16} sx={{ color: "#fff" }} />
                        <span>Guardando...</span>
                      </Stack>
                    ) : "Actualizar contraseña"}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </SectionCard>

          <Paper
            elevation={0}
            sx={{ position: "relative", borderRadius: "20px", border: "1px solid #ECECEF", overflow: "hidden", boxShadow: "0 1px 4px rgba(47,0,24,0.05)" }}
          >
            <Box sx={{ height: 4, background: "linear-gradient(90deg, #680036, #FCC019)" }} />
            {mfaLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress size={20} sx={{ color: "#680036" }} />
              </Box>
            ) : (
              <Box sx={{ p: { xs: 2.5, md: 3 } }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "14px",
                      bgcolor: mfaStatus?.enabled ? "#e8f7ed" : "#F7E6EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: 22,
                        color: mfaStatus?.enabled ? "#1f7a3f" : "#680036",
                        fontVariationSettings: "'FILL' 1",
                      }}
                    >
                      {mfaStatus?.enabled ? "verified_user" : "shield"}
                    </span>
                  </Box>
                  <Switch
                    checked={!!mfaStatus?.enabled}
                    onChange={handleMfaToggle}
                    disabled={mfaToggling}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "#1f7a3f" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#a5d6a7" },
                    }}
                  />
                </Box>
                <Typography variant="subtitle1" fontWeight={700} color="#18151A" sx={{ mt: 2, lineHeight: 1.25 }}>
                  Autenticación en dos pasos
                </Typography>
                <Typography variant="body2" color="#77737A" sx={{ mt: 0.5, lineHeight: 1.55 }}>
                  {mfaStatus?.enabled
                    ? "Tu cuenta está protegida con autenticación en dos pasos."
                    : "Añade una capa adicional de seguridad a tu cuenta."}
                </Typography>
                {mfaStatus?.enabled && (
                  <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap", rowGap: 0.75 }}>
                    {mfaStatus.verified && (
                      <Chip
                        icon={<span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>}
                        label="Verificado"
                        size="small"
                        sx={{ bgcolor: "#e8f7ed", color: "#1f7a3f", fontWeight: 600, fontSize: 11, borderRadius: 999 }}
                      />
                    )}
                    {mfaStatus.hasBackupCodes ? (
                      <Chip
                        icon={<span className="material-symbols-outlined" style={{ fontSize: 14 }}>vpn_key</span>}
                        label="Con códigos de respaldo"
                        size="small"
                        sx={{ bgcolor: "#fff5db", color: "#785900", fontWeight: 600, fontSize: 11, borderRadius: 999 }}
                      />
                    ) : (
                      <Chip
                        icon={<span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>}
                        label="Sin códigos de respaldo"
                        size="small"
                        sx={{ bgcolor: "#fde9ef", color: "#ba1a1a", fontWeight: 600, fontSize: 11, borderRadius: 999 }}
                      />
                    )}
                  </Stack>
                )}
              </Box>
            )}
          </Paper>
          </Box>

          <Dialog
            open={disableDialogOpen}
            onClose={() => { if (!mfaToggling) { setDisableDialogOpen(false); setDisablePassword(""); setDisableToken(""); } }}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle sx={{ fontWeight: 700, color: "#18151A" }}>
              Desactivar MFA
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2.5} sx={{ mt: 1 }}>
                <Typography variant="body2" color="#77737A">
                  Para desactivar la autenticación en dos pasos, ingresa tu contraseña actual y un código de verificación de tu aplicación autenticadora.
                </Typography>
                <TextField
                  label="Contraseña actual"
                  type={showDisablePass ? "text" : "password"}
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  fullWidth
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowDisablePass(!showDisablePass)} edge="end" size="small">
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                            {showDisablePass ? "visibility_off" : "visibility"}
                          </span>
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />
                <TextField
                  label="Código de verificación"
                  value={disableToken}
                  onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  fullWidth
                  size="small"
                  placeholder="000000"
                  inputProps={{ inputMode: "numeric", autoComplete: "one-time-code", maxLength: 6 }}
                  sx={inputSx}
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <Button
                onClick={() => { setDisableDialogOpen(false); setDisablePassword(""); setDisableToken(""); }}
                disabled={mfaToggling}
                sx={{ color: "#77737A", textTransform: "none", fontWeight: 600, borderRadius: "12px" }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleDisableMfa}
                disabled={mfaToggling || !disablePassword || !disableToken}
                sx={{
                  bgcolor: "#ba1a1a",
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: "12px",
                  "&:hover": { bgcolor: "#d32f2f" },
                  "&.Mui-disabled": { bgcolor: "#d9c6cd" },
                }}
              >
                {mfaToggling ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Desactivar"}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </DashboardLayout>
  );
}

export default ProfilePage;
