import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import heic2any from "heic2any";
import {
  Box, Typography, Paper, TextField, Button, Stack, Alert, Collapse, Fade, Divider, IconButton,
} from "@mui/material";
import { useReports } from "../context/useReports.js";
import { useToast } from "../context/useToast.js";
import { useDescripcionValidation } from "../hooks/useValidations.js";
import DashboardLayout from "../components/DashboardLayout.jsx";
import EmotionSelector from "../components/EmotionSelector.jsx";
import { EMOCION_LABELS, EMOCION_ICONS, EMOCION_COLORS } from "../components/emotionData.js";

const TIPOS = [
  { value: "incidente", label: "Incidente", desc: "Reporta un problema o incidencia que necesita atención.", icon: "report", bg: "#fde9ef", fg: "#680036" },
  { value: "sugerencia", label: "Sugerencia", desc: "Propone una mejora para la comunidad universitaria.", icon: "lightbulb", bg: "#fff5db", fg: "#785900" },
  { value: "peticion", label: "Petición", desc: "Solicita un servicio, recurso o acción institucional.", icon: "handshake", bg: "#e8eaf6", fg: "#303f9f" },
  { value: "felicitacion", label: "Felicitación", desc: "Reconoce el buen trabajo de una persona o área.", icon: "celebration", bg: "#e8f7ed", fg: "#1f7a3f" },
];

const STEP_LABELS = ["Tipo de reporte", "Descripción", "Previsualización"];

function StepIndicator({ step }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
      {STEP_LABELS.map((label, i) => {
        const num = i + 1;
        const isDone = step > num;
        const isCurrent = step === num;
        return (
          <Box key={label} sx={{ display: "flex", alignItems: "center", flex: i < STEP_LABELS.length - 1 ? 1 : "none" }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  bgcolor: isDone ? "#1f7a3f" : isCurrent ? "#680036" : "#ECECEF",
                  color: isDone || isCurrent ? "#ffffff" : "#969198",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  boxShadow: isCurrent ? "0 0 0 4px rgba(104,0,54,0.10)" : "none",
                }}
              >
                {isDone ? (
                  <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>check</span>
                ) : (
                  <Typography sx={{ fontWeight: 700, fontSize: 12 }}>{num}</Typography>
                )}
              </Box>
              <Typography
                sx={{
                  fontWeight: isCurrent ? 700 : 500,
                  fontSize: 12,
                  color: isCurrent ? "#18151A" : isDone ? "#77737A" : "#969198",
                  display: { xs: "none", sm: "block" },
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </Typography>
            </Stack>
            {i < STEP_LABELS.length - 1 && (
              <Box
                sx={{
                  flex: 1,
                  height: 2,
                  mx: 1.5,
                  borderRadius: 1,
                  bgcolor: step > num ? "#1f7a3f" : "#ECECEF",
                  transition: "background-color 0.3s",
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

function NewReportPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { crearReporte, loading } = useReports();
  const [step, setStep] = useState(1);
  const [tipo, setTipo] = useState("");
  const [emocion, setEmocion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [imagen, setImagen] = useState([]);
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef(null);

  const descVal = useDescripcionValidation(descripcion);
  const userRole = sessionStorage.getItem("userRole");

  useEffect(() => {
    if (!userRole || userRole !== "estudiante") {
      navigate("/ingreso", { replace: true });
    }
  }, [navigate, userRole]);

  const handleSelectTipo = (value) => {
    setTipo(value);
    setStep(2);
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const processed = [];
    for (const rawFile of files) {
      let file = rawFile;
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isImage = file.type.startsWith('image/');

      if (!isPdf && !isImage) {
        toast(`Formato no permitido en "${file.name}". Usa imágenes o PDF.`, "error");
        continue;
      }

      if (file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif")) {
        toast(`Formato GIF no permitido en "${file.name}".`, "error");
        continue;
      }

      if (!isPdf && /\.(heic|heif)$/i.test(file.name)) {
        try {
          const convertedBlob = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.85,
          });
          const blobResult = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
          file = new File([blobResult], file.name.replace(/\.(heic|heif)$/i, ".jpg"), { type: "image/jpeg" });
        } catch {
          toast(`No se pudo procesar la imagen HEIC "${file.name}".`, "error");
          continue;
        }
      }

      if (file.size > 5 * 1024 * 1024) {
        toast(`El archivo "${file.name}" supera los 5MB.`, "error");
        continue;
      }

      processed.push(file);
    }

    if (!processed.length) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setImagen((prev) => [...prev, ...processed]);
    setError(null);
  };

  const handleRemoveFile = (index) => {
    setImagen((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGoToPreview = () => {
    if (!emocion) { toast("Selecciona como te sientes respecto al reporte.", "warning"); return; }
    if (!descripcion.trim()) { toast("La descripción es requerida.", "warning"); return; }
    if (descripcion.trim().length < 20) { toast("La descripción debe tener al menos 20 caracteres.", "warning"); return; }
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!emocion) { toast("Selecciona como te sientes respecto al reporte.", "warning"); return; }
    if (!descripcion.trim()) { toast("La descripción es requerida.", "warning"); return; }
    if (descripcion.trim().length < 20) { toast("La descripción debe tener al menos 20 caracteres.", "warning"); return; }

    try {
      const emocionLabel = EMOCION_LABELS[emocion] || emocion;
      await crearReporte({ titulo: emocionLabel, emocion, descripcion: descripcion.trim(), tipo, imagenes: imagen });
      setSubmitted(true);
      toast("Reporte enviado correctamente.", "success");
      setTimeout(() => {
        navigate("/dashboard-estudiante");
      }, 1500);
    } catch (err) {
      toast(err.message || "No se pudo guardar el reporte.", "error");
      setError(err.message);
    }
  };

  const selectedTipo = TIPOS.find((t) => t.value === tipo);

  return (
    <DashboardLayout subtitle="Panel estudiantil" currentPage="Nuevo reporte" decor="report">
      <Fade in timeout={350}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box sx={{ width: "100%", maxWidth: 720 }}>
            <Box sx={{ mb: 3 }}>
              <Button
                startIcon={<span className="material-symbols-outlined">arrow_back</span>}
                onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
                sx={{ mb: 1, color: "#680036", textTransform: "none", fontWeight: 600 }}
              >
                {step > 1 ? "Paso anterior" : "Volver"}
              </Button>
              <Typography variant="h4" fontWeight={800} color="#18151A" sx={{ letterSpacing: "-0.02em" }}>
                Nuevo Reporte
              </Typography>
              <Typography variant="body2" color="#77737A" sx={{ mt: 0.5 }}>
                {step === 1 ? "¿Qué tipo de reporte deseas crear?" : step === 2 ? "Cuéntanos qué ocurrió" : "Revisa la información antes de enviar"}
              </Typography>
            </Box>

            <StepIndicator step={step} />

            <Collapse in={step === 1} timeout={300}>
              <Stack spacing={2}>
                {TIPOS.map((t) => (
                  <Paper
                    key={t.value}
                    elevation={0}
                    onClick={() => handleSelectTipo(t.value)}
                    sx={{
                      p: 0,
                      borderRadius: "18px",
                      border: "2px solid #ECECEF",
                      bgcolor: "#FFFFFF",
                      cursor: "pointer",
                      transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                      overflow: "hidden",
                      "&:hover": { borderColor: t.fg, boxShadow: "0 6px 20px rgba(47,0,24,0.08)", transform: "translateY(-2px)" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2.5 }}>
                      <Box sx={{ width: 52, height: 52, borderRadius: "14px", bgcolor: t.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 26, color: t.fg }}>{t.icon}</span>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight={700} color="#18151A">{t.label}</Typography>
                        <Typography variant="body2" color="#77737A" sx={{ mt: 0.25 }}>{t.desc}</Typography>
                      </Box>
                      <span className="material-symbols-outlined" style={{ color: "#969198", fontSize: 22 }}>chevron_right</span>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Collapse>

            <Collapse in={step === 2} timeout={300}>
              <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: "20px", border: "1px solid #ECECEF", bgcolor: "#FFFFFF", boxShadow: "0 1px 4px rgba(47,0,24,0.05)" }}>
                {selectedTipo && (
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 2, py: 1, bgcolor: selectedTipo.bg, borderRadius: 999, mb: 2, mr: 1 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: selectedTipo.fg }}>{selectedTipo.icon}</span>
                    <Typography variant="body2" fontWeight={700} color={selectedTipo.fg}>{selectedTipo.label}</Typography>
                  </Box>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={2.5}>
                    <EmotionSelector tipo={tipo} value={emocion} onChange={setEmocion} />

                    <Box>
                      <TextField
                        fullWidth
                        label="Descripción"
                        multiline
                        minRows={5}
                        maxRows={12}
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Cuéntanos qué pasó, dónde y cuándo..."
                        error={descVal.error}
                        helperText={descVal.helper}
                        inputProps={{ "aria-label": "Descripción del reporte", maxLength: 500 }}
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: "15px" },
                          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E6E3E8" },
                          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#680036" },
                          "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(104,0,54,0.30)" },
                          "& .MuiFormHelperText-root": { fontSize: 11 },
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="body2" fontWeight={600} color="#77737A" sx={{ mb: 1 }}>Evidencia (imagen o PDF) · Opcional</Typography>
                      {imagen.length === 0 ? (
                        <Paper
                          elevation={0}
                          onClick={() => fileInputRef.current?.click()}
                          sx={{
                            border: "2px dashed #E6E3E8",
                            borderRadius: "18px",
                            p: 4,
                            textAlign: "center",
                            cursor: "pointer",
                            transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                            "&:hover": { borderColor: "#680036", bgcolor: "rgba(104,0,54,0.02)" },
                          }}
                        >
                          <Box sx={{ width: 52, height: 52, borderRadius: "50%", bgcolor: "#f7e6eb", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 26, color: "#680036" }}>upload_file</span>
                          </Box>
                          <Typography variant="body2" color="#77737A" sx={{ mt: 1.5, fontWeight: 600 }}>Haz clic para subir imágenes o PDF</Typography>
                          <Typography variant="caption" color="#969198">Puedes seleccionar varios archivos. JPG, PNG, WEBP, HEIC o PDF (máx. 5MB c/u)</Typography>
                        </Paper>
                      ) : (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {imagen.map((file, idx) => (
                            <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: "14px", border: "1px solid #ECECEF", bgcolor: "#FAF9F7" }}>
                              <Box sx={{ width: 44, height: 44, borderRadius: "10px", bgcolor: "#F0EDEF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                                {file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf') ? (
                                  <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#680036" }}>picture_as_pdf</span>
                                ) : (
                                  <Box component="img" src={URL.createObjectURL(file)} alt={file.name} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                )}
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={700} color="#18151A" noWrap>{file.name}</Typography>
                                <Typography variant="caption" color="#77737A">{(file.size / 1024 / 1024).toFixed(2)} MB</Typography>
                              </Box>
                              <IconButton size="small" onClick={() => handleRemoveFile(idx)} sx={{ color: "#ba1a1a", bgcolor: "#fff0f0", "&:hover": { bgcolor: "#ffe5e5" } }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                              </IconButton>
                            </Box>
                          ))}
                          <Button size="small" onClick={() => fileInputRef.current?.click()} sx={{ alignSelf: "flex-start", color: "#680036", textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "rgba(104,0,54,0.06)" } }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6 }}>add</span>
                            Agregar otro archivo
                          </Button>
                        </Box>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/svg+xml,image/bmp,application/pdf"
                        multiple
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                      />
                    </Box>
                    <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ bgcolor: "#FAF9F7", borderRadius: "14px", border: "1px solid #ECECEF", p: 2 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 19, color: "#680036", flexShrink: 0, mt: 0.1 }}>lock</span>
                      <Typography variant="caption" color="#77737A" sx={{ lineHeight: 1.6 }}>
                        Tu reporte es importante. Todos los reportes son tratados con confidencialidad y respeto.
                      </Typography>
                    </Stack>

                    {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
                    {submitted && <Alert severity="success" sx={{ borderRadius: 2 }} icon={<span className="material-symbols-outlined">check_circle</span>}>Reporte enviado correctamente. Redirigiendo al dashboard...</Alert>}

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 1 }}>
                      <Button variant="outlined" onClick={() => setStep(1)} disabled={submitted}
                        sx={{ borderColor: "#E6E3E8", color: "#680036", textTransform: "none", borderRadius: "14px", px: 3, fontWeight: 600, "&:hover": { borderColor: "#680036", bgcolor: "rgba(104,0,54,0.04)" } }}>
                        Volver
                      </Button>
                      <Button type="button" variant="contained" onClick={handleGoToPreview} disabled={submitted || descVal.error || !descripcion.trim() || !emocion}
                        sx={{ bgcolor: "#680036", color: "#ffffff", textTransform: "none", borderRadius: "14px", px: 4, fontWeight: 700, boxShadow: "0 4px 14px rgba(104,0,54,0.24)", "&:hover": { bgcolor: "#56002D" }, "&.Mui-disabled": { bgcolor: "rgba(104,0,54,0.25)" } }}>
                        Continuar a previsualización
                        <span className="material-symbols-outlined" style={{ fontSize: 18, ml: 0.75 }}>chevron_right</span>
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              </Paper>
            </Collapse>

            <Collapse in={step === 3} timeout={300}>
              <Box component="form" onSubmit={handleSubmit}>
                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: "20px", border: "1px solid #ECECEF", bgcolor: "#FFFFFF", boxShadow: "0 1px 4px rgba(47,0,24,0.05)" }}>
                  <Stack spacing={3}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                      <Typography variant="h6" fontWeight={800} color="#18151A">Previsualización de tu reporte</Typography>
                      <Box sx={{ px: 1.75, py: 0.6, borderRadius: 999, bgcolor: "#FFF4CC", border: "1px solid #FCC019" }}>
                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#785900", letterSpacing: "0.06em" }}>LISTO PARA ENVIAR</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {selectedTipo && (
                        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, px: 1.75, py: 0.75, bgcolor: selectedTipo.bg, borderRadius: 999 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16, color: selectedTipo.fg }}>{selectedTipo.icon}</span>
                          <Typography variant="body2" fontWeight={700} color={selectedTipo.fg}>{selectedTipo.label}</Typography>
                        </Box>
                      )}
                      {emocion && (() => {
                        const c = EMOCION_COLORS[tipo] || { bg: "#F7E6EB", fg: "#680036" };
                        return (
                          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, px: 1.75, py: 0.75, bgcolor: c.bg, borderRadius: 999 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: c.fg }}>{EMOCION_ICONS[emocion]}</span>
                            <Typography variant="body2" fontWeight={600} color={c.fg}>{EMOCION_LABELS[emocion] || emocion}</Typography>
                          </Box>
                        );
                      })()}
                    </Box>

                    <Divider sx={{ borderColor: "#ECECEF" }} />

                    <Box>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#969198", letterSpacing: "0.08em", textTransform: "uppercase", mb: 1 }}>Descripción</Typography>
                      <Typography sx={{ fontSize: 14, lineHeight: 1.75, color: "#353136", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {descripcion}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#969198", letterSpacing: "0.08em", textTransform: "uppercase", mb: 1 }}>Evidencia</Typography>
                      {imagen.length === 0 ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, borderRadius: "14px", border: "1px dashed #E6E3E8", p: 2.5 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 24, color: "#969198" }}>image_not_supported</span>
                          <Typography variant="body2" color="#77737A">Este reporte no incluye evidencia.</Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {imagen.map((file, idx) => (
                            <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: "14px", border: "1px solid #ECECEF", bgcolor: "#FAF9F7" }}>
                              <Box sx={{ width: 44, height: 44, borderRadius: "10px", bgcolor: "#F0EDEF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                                {file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf') ? (
                                  <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#680036" }}>picture_as_pdf</span>
                                ) : (
                                  <Box component="img" src={URL.createObjectURL(file)} alt={file.name} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                )}
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={700} color="#18151A" noWrap>{file.name}</Typography>
                                <Typography variant="caption" color="#77737A">{(file.size / 1024 / 1024).toFixed(2)} MB</Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>

                    <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ bgcolor: "#FAF9F7", borderRadius: "14px", border: "1px solid #ECECEF", p: 2 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 19, color: "#680036", flexShrink: 0, mt: 0.1 }}>lock</span>
                      <Typography variant="caption" color="#77737A" sx={{ lineHeight: 1.6 }}>
                        Al enviar, tu reporte será asignado automáticamente al área correspondiente y tratado con confidencialidad.
                      </Typography>
                    </Stack>

                    {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 1 }}>
                      <Button variant="outlined" onClick={() => setStep(2)} disabled={submitted}
                        sx={{ borderColor: "#E6E3E8", color: "#680036", textTransform: "none", borderRadius: "14px", px: 3, fontWeight: 600, "&:hover": { borderColor: "#680036", bgcolor: "rgba(104,0,54,0.04)" } }}>
                        Editar información
                      </Button>
                      <Button type="submit" variant="contained" disabled={loading || submitted}
                        sx={{ bgcolor: "#680036", color: "#ffffff", textTransform: "none", borderRadius: "14px", px: 4, fontWeight: 700, boxShadow: "0 4px 14px rgba(104,0,54,0.24)", "&:hover": { bgcolor: "#56002D" }, "&.Mui-disabled": { bgcolor: "rgba(104,0,54,0.25)" } }}>
                        {loading ? (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18, animation: "spin 1s linear infinite" }}>sync</span>
                            Enviando...
                          </Box>
                        ) : "Enviar reporte"}
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            </Collapse>

            <Collapse in={submitted}>
              <Box sx={{ position: "fixed", inset: 0, bgcolor: "rgba(250,249,247,0.96)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 1300 }}>
                <Box sx={{ width: 80, height: 80, borderRadius: "50%", bgcolor: "#e8f7ed", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  "@keyframes fadeUp": { "0%": { transform: "translateY(14px)", opacity: 0 }, "100%": { transform: "translateY(0)", opacity: 1 } } }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 40, color: "#1f7a3f" }}>check_circle</span>
                </Box>
                <Typography variant="h5" fontWeight={700} color="#18151A" sx={{ mt: 2 }}>Tu reporte fue enviado</Typography>
                <Typography variant="body2" color="#77737A" sx={{ mt: 0.5 }}>Gracias por compartir lo que está ocurriendo.</Typography>
              </Box>
            </Collapse>
          </Box>
        </Box>
      </Fade>
    </DashboardLayout>
  );
}

export default NewReportPage;
