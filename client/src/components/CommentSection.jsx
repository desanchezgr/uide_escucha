import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Skeleton,
  IconButton,
} from "@mui/material";

const API_BASE = "/api";

async function safeJsonResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(`Error del servidor (${res.status}): ${text.slice(0, 120)}`);
  }
  return res.json();
}

const ROLES_ADMIN = [
  "admin", "prorector", "ti_soporte", "bibliotecario", "conserje",
  "mantenimiento", "secretaria", "bienestar universitario", "financiero",
];

function CommentSection({ reporteId }) {
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [archivos, setArchivos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const fileInputRef = useRef(null);

  const userRole = sessionStorage.getItem("userRole");
  const isAdmin = ROLES_ADMIN.includes(userRole);

  const fetchComentarios = useCallback(async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE}/reportes/${reporteId}/comentarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await safeJsonResponse(res);
        throw new Error(body.error || "Error al cargar comentarios");
      }
      const data = await safeJsonResponse(res);
      setComentarios(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [reporteId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchComentarios();
  }, [fetchComentarios]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const processed = [];
    for (const file of files) {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isImage = file.type.startsWith('image/');

      if (!isPdf && !isImage) {
        setError(`Formato no permitido en "${file.name}". Sube imágenes o PDF.`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError(`El archivo "${file.name}" supera los 5MB.`);
        continue;
      }

      processed.push(file);
    }

    if (!processed.length) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setArchivos((prev) => [...prev, ...processed]);
    setPreviews((prev) => [...prev, ...processed.map((file) => {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        return null;
      }
      return URL.createObjectURL(file);
    })]);
    setError(null);
  };

  const handleRemoveFile = (index) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEnviar = async () => {
    if (!nuevoComentario.trim()) return;
    setEnviando(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("token");
      let body = { comentario: nuevoComentario.trim() };

      if (archivos.length > 0) {
        const base64Array = [];
        const nombreArray = [];
        const tipoArray = [];
        for (const file of archivos) {
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          base64Array.push(base64);
          nombreArray.push(file.name);
          tipoArray.push(file.type);
        }
        body.archivos_base64 = base64Array;
        body.archivos_nombre = nombreArray;
        body.archivos_tipo = tipoArray;
      }

      const res = await fetch(`${API_BASE}/reportes/${reporteId}/comentarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const body = await safeJsonResponse(res);
        throw new Error(body.error || "Error al enviar comentario");
      }
      const data = await safeJsonResponse(res);
      setComentarios((prev) => [...prev, data]);
      setNuevoComentario("");
      setArchivos([]);
      setPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??";
  };

  const esAdmin = (rol) => ROLES_ADMIN.includes(rol);

  const getAvatarColor = (rol) => {
    return esAdmin(rol) ? "#680036" : "#5f8f6b";
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openImageModal = (url) => setLightbox(url);
  const closeLightbox = () => setLightbox(null);

  return (
    <PaperLike>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 17, color: "#77737A" }}>forum</span>
        <Typography variant="caption" fontWeight={700} color="#77737A" sx={{ textTransform: "uppercase", letterSpacing: 0.6 }}>
          Conversación ({comentarios.length})
        </Typography>
      </Stack>

      {loading ? (
        <Stack spacing={1.5}>
          {[0, 1, 2].map((i) => (
            <Box key={i} sx={{ display: "flex", gap: 1.5 }}>
              <Skeleton variant="circular" width={36} height={36} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="35%" height={16} />
                <Skeleton variant="rounded" width="85%" height={40} sx={{ borderRadius: "12px" }} />
              </Box>
            </Box>
          ))}
        </Stack>
      ) : comentarios.length === 0 ? (
        <Box sx={{ py: 3, textAlign: "center" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 34, color: "#D8D4DA" }}>chat_bubble_outline</span>
          <Typography variant="body2" color="#77737A" sx={{ mt: 1, fontWeight: 500 }}>
            No hay comentarios todavía.
          </Typography>
          <Typography variant="caption" color="#969198">
            {isAdmin ? "Responde al estudiante desde el panel de administración." : "Sé el primero en comentar."}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5} sx={{ mb: 2.5 }}>
          {comentarios.map((c) => {
            const admin = esAdmin(c.autor_rol);
            return (
              <Box
                key={c.comentario_id}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  p: 2,
                  borderRadius: "16px",
                  bgcolor: admin ? "#FAF5F7" : "#F6FAF7",
                  border: "1px solid",
                  borderColor: admin ? "#F0E2E8" : "#E4EEE6",
                  transition: "all 0.15s ease",
                  "&:hover": { borderColor: admin ? "#D9C6CD" : "#C4DAC8" },
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: getAvatarColor(c.autor_rol),
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                    border: "2px solid",
                    borderColor: admin ? "#E8CCD6" : "#C4DAC8",
                  }}
                >
                  {getInitials(c.autor_nombre)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={700} color="#18151A">
                      {c.autor_nombre}
                    </Typography>
                    <Chip
                      label={admin ? "Admin" : "Estudiante"}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: 10,
                        fontWeight: 600,
                        borderRadius: 999,
                        bgcolor: admin ? "#F0DDE6" : "#E0EBE2",
                        color: admin ? "#680036" : "#2D5A3A",
                      }}
                    />
                    <Typography variant="caption" color="#969198">
                      {formatDate(c.fecha_comentario)}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="#353136" sx={{ whiteSpace: "pre-wrap" }}>
                    {c.comentario}
                  </Typography>
                  
                  {/* Mostrar archivos adjuntos si existen */}
                  {(c.archivos || []).length > 0 && (
                    <Box sx={{ mt: 1.5 }}>
                      <Stack spacing={1}>
                        {(c.archivos || []).map((a) => {
                          const isImage = a.tipo_archivo !== 'pdf';
                          const url = a.ruta_archivo.startsWith('http')
                            ? a.ruta_archivo
                            : a.ruta_archivo.startsWith('/')
                              ? a.ruta_archivo
                              : `/${a.ruta_archivo}`;
                          return (
                            <Box
                              key={a.archivo_id}
                              sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1.25,
                                p: 1.5,
                                borderRadius: '12px',
                                bgcolor: '#FFFFFF',
                                border: '1px solid #ECECEF',
                                textDecoration: 'none',
                                transition: 'all 0.15s ease',
                                '&:hover': { borderColor: '#680036', bgcolor: '#FAF9F7' },
                              }}
                              component={isImage ? 'button' : 'a'}
                              href={isImage ? undefined : url}
                              target={isImage ? undefined : '_blank'}
                              rel={isImage ? undefined : 'noopener noreferrer'}
                              onClick={() => {
                                if (isImage) {
                                  openImageModal(url);
                                }
                              }}
                            >
                              <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: '#F0EDEF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#680036' }}>
                                  {isImage ? 'image' : 'picture_as_pdf'}
                                </span>
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="caption" fontWeight={600} color="#18151A" sx={{ wordBreak: 'break-word' }}>
                                  {a.nombre_archivo}
                                </Typography>
                                <Typography variant="caption" color="#77737A">
                                  {isImage ? 'Imagen adjunta' : 'PDF adjunto'}
                                </Typography>
                              </Box>
                              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#969198', marginTop: 2 }}>download</span>
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}

      <Box sx={{ bgcolor: "#F8F9FB", borderRadius: "16px", border: "1px solid #ECECEF", p: 2 }}>
          <Typography variant="body2" fontWeight={700} color="#18151A" sx={{ mb: 1.5 }}>
            {isAdmin ? "Responder al estudiante" : "Escribe un comentario"}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder={isAdmin ? "Escribe tu respuesta al estudiante..." : "Escribe tu comentario..."}
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "14px",
                bgcolor: "#FFFFFF",
                "& fieldset": { borderColor: "#ECECEF" },
                "&:hover fieldset": { borderColor: "#E6E3E8" },
                "&.Mui-focused fieldset": { borderColor: "rgba(104,0,54,0.30)" },
              },
            }}
          />
          
          {/* Adjuntar archivo */}
          {archivos.length === 0 ? (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                sx={{ bgcolor: "#F0EDEF", "&:hover": { bgcolor: "#E8E2E4" } }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#680036" }}>attach_file</span>
              </IconButton>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} color="#18151A" sx={{ fontSize: 13.5 }}>
                  Adjuntar imagen o PDF
                </Typography>
                <Typography variant="caption" color="#77737A">
                  Formatos permitidos: JPG, PNG, WEBP, HEIC o PDF. Máximo 5MB c/u.
                </Typography>
              </Box>
            </Stack>
          ) : (
            <Box sx={{ mt: 1.5, p: 1.5, borderRadius: "12px", bgcolor: "#FFFFFF", border: "1px solid #ECECEF" }}>
              <Stack spacing={1.5}>
                {archivos.map((file, idx) => (
                  <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {previews[idx] ? (
                      <Box component="img" src={previews[idx]} alt={file.name} sx={{ width: 60, height: 60, borderRadius: "8px", objectFit: "cover", border: "1px solid #ECECEF" }} />
                    ) : (
                      <Box sx={{ width: 60, height: 60, borderRadius: "8px", bgcolor: "#F0EDEF", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #ECECEF" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 28, color: "#680036" }}>picture_as_pdf</span>
                      </Box>
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} color="#18151A" noWrap>
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="#77737A">
                        {(file.size / 1024 / 1024).toFixed(2)} MB · listo para enviar
                      </Typography>
                    </Box>
                    <IconButton onClick={() => handleRemoveFile(idx)} size="small" sx={{ color: "#ba1a1a", bgcolor: "#fff0f0", "&:hover": { bgcolor: "#ffe5e5" } }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                    </IconButton>
                  </Box>
                ))}
                <Button size="small" onClick={() => fileInputRef.current?.click()} sx={{ alignSelf: "flex-start", color: "#680036", textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "rgba(104,0,54,0.06)" } }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6 }}>add</span>
                  Agregar otro archivo
                </Button>
              </Stack>
            </Box>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
            multiple
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5 }}>
            <Button
              variant="contained"
              disabled={enviando || !nuevoComentario.trim()}
              onClick={handleEnviar}
              startIcon={<span className="material-symbols-outlined" style={{ fontSize: 17 }}>send</span>}
              sx={{
                bgcolor: "#680036",
                textTransform: "none",
                borderRadius: "12px",
                fontWeight: 700,
                px: 3,
                "&:hover": { bgcolor: "#56002D" },
                "&.Mui-disabled": { bgcolor: "#d9c6cd" },
              }}
            >
              {enviando ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={14} sx={{ color: "#fff" }} />
                  <span>Enviando...</span>
                </Stack>
              ) : "Enviar"}
            </Button>
          </Stack>
        </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: "12px" }}>
          {error}
        </Alert>
      )}

      {lightbox && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            bgcolor: "rgba(24,21,26,0.94)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 0.2s ease",
            "@keyframes fadeIn": {
              "0%": { opacity: 0 },
              "100%": { opacity: 1 },
            },
          }}
          onClick={closeLightbox}
        >
          <IconButton
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            sx={{ position: "absolute", top: 16, right: 16, color: "#ffffff", bgcolor: "rgba(255,255,255,0.1)", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }}
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>close</span>
          </IconButton>
          <Box onClick={(e) => e.stopPropagation()} sx={{ maxWidth: "90vw", maxHeight: "85vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Box
              component="img"
              src={lightbox}
              alt="Vista previa"
              sx={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: "14px", boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}
            />
          </Box>
        </Box>
      )}
    </PaperLike>
  );
}

function PaperLike({ children }) {
  return (
    <Box
      sx={{
        borderRadius: "20px",
        border: "1px solid #ECECEF",
        bgcolor: "#FFFFFF",
        p: { xs: 2.5, md: 2.5 },
        boxShadow: "0 1px 4px rgba(47,0,24,0.05)",
      }}
    >
      {children}
    </Box>
  );
}

export default CommentSection;
