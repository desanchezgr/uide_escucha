import { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import TextMui from "../components/TextMui";

const API_BASE = "/api";

function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function FadeInSection({ children, delay = 0, sx = {} }) {
  const [ref, inView] = useInView();
  return (
    <Box
      ref={ref}
      sx={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(8px)",
        transition: `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        "@media (prefers-reduced-motion: reduce)": { opacity: 1, transform: "none", transition: "none" },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

const SectionWrapper = ({ children, sx = {} }) => (
  <Box sx={{ width: "100%", ...sx }}>
    <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 3, sm: 6, lg: 8 } }}>
      {children}
    </Box>
  </Box>
);

function MiniReportCard() {
  return (
    <Box
      sx={{
        width: 190,
        bgcolor: "#FFFFFF",
        borderRadius: "16px",
        border: "1px solid #ECECEF",
        boxShadow: "0 14px 34px rgba(47,0,24,0.10)",
        p: 1.75,
        transform: "rotate(-5deg)",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Box sx={{ width: 24, height: 24, borderRadius: "8px", bgcolor: "#fde9ef", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#680036" }}>report</span>
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: 10, color: "#18151A" }}>Incidente</Typography>
      </Stack>
      <Box sx={{ width: "85%", height: 6, borderRadius: 3, bgcolor: "#F0EDEF", mb: 0.75 }} />
      <Box sx={{ width: "60%", height: 6, borderRadius: 3, bgcolor: "#F0EDEF", mb: 1.25 }} />
      <Stack direction="row" spacing={0.75} alignItems="center">
        <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#FCC019" }} />
        <Typography sx={{ fontSize: 9, color: "#77737A", fontWeight: 600 }}>En proceso</Typography>
      </Stack>
    </Box>
  );
}

function MiniStatusPill() {
  return (
    <Box
      sx={{
        bgcolor: "#FFFFFF",
        borderRadius: "999px",
        border: "1px solid #ECECEF",
        boxShadow: "0 10px 26px rgba(47,0,24,0.08)",
        px: 1.75,
        py: 1,
        display: "flex",
        alignItems: "center",
        gap: 0.9,
        transform: "rotate(-3deg)",
        width: "fit-content",
      }}
    >
      <Box sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: "#e8f7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 13, color: "#1f7a3f", fontVariationSettings: "'FILL' 1" }}>task_alt</span>
      </Box>
      <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#18151A" }}>Resuelto</Typography>
    </Box>
  );
}

function HeroSection() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setLoaded(true); }, []);

  const floatTransition = (delay) =>
    `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`;

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        bgcolor: "#FAF9F7",
        width: "100%",
        pt: { xs: 8, md: 4 },
        pb: { xs: 10, md: 4 },
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(104,0,54,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        },
      }}
    >
      <Box sx={{ position: "absolute", top: -140, right: -120, width: 420, height: 420, borderRadius: "50%", bgcolor: "rgba(104,0,54,0.05)", pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", bottom: -160, left: -110, width: 460, height: 460, borderRadius: "50%", bgcolor: "rgba(252,192,25,0.08)", pointerEvents: "none" }} />

      <Box sx={{ maxWidth: 1280, mx: "auto", width: "100%", px: { xs: 3, sm: 6, lg: 8 }, position: "relative", zIndex: 2 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { md: "1.05fr 0.95fr" },
            gap: { xs: 6, md: 8, lg: 10 },
            alignItems: "center",
          }}
        >
          <Box sx={{ textAlign: { xs: "center", md: "left" }, maxWidth: 620, mx: { xs: "auto", md: 0 } }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 2.25,
                py: 0.8,
                borderRadius: 999,
                bgcolor: "rgba(104,0,54,0.06)",
                border: "1px solid rgba(104,0,54,0.10)",
                mb: 4,
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateY(0)" : "translateY(8px)",
                transition: floatTransition(100),
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 15, color: "#680036", fontVariationSettings: "'FILL' 1" }}>
                hearing
              </span>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#680036", letterSpacing: "0.07em" }}>
                UIDE ESCUCHA
              </Typography>
            </Box>

            <Typography
              sx={{
                fontWeight: 800,
                color: "#18151A",
                mb: 3,
                lineHeight: 1.05,
                fontSize: { xs: 42, sm: 56, md: 60, lg: 74 },
                letterSpacing: "-0.03em",
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateY(0)" : "translateY(8px)",
                transition: floatTransition(220),
              }}
            >
              Tu voz también{" "}
              <Box component="span" sx={{ color: "#680036" }}>
                construye
              </Box>
            </Typography>

            <Typography
              sx={{
                color: "#77737A",
                mb: 5,
                fontSize: { xs: 16, md: 18 },
                lineHeight: 1.75,
                maxWidth: 500,
                mx: { xs: "auto", md: 0 },
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateY(0)" : "translateY(8px)",
                transition: floatTransition(340),
              }}
            >
              Tu canal de comunicación entre tú y la universidad 100% unidos
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent={{ xs: "center", md: "flex-start" }}
              sx={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateY(0)" : "translateY(8px)",
                transition: floatTransition(460),
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/ingreso")}
                sx={{
                  bgcolor: "#680036",
                  color: "#ffffff",
                  fontWeight: 700,
                  px: 4.5,
                  py: 1.8,
                  borderRadius: "14px",
                  fontSize: 15,
                  boxShadow: "0 6px 20px rgba(104, 0, 54, 0.24)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  textTransform: "none",
                  transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                  "&:hover": {
                    bgcolor: "#56002D",
                    transform: "translateY(-2px)",
                    boxShadow: "0 10px 28px rgba(104, 0, 54, 0.28)",
                  },
                  "& .arrow-icon": { transition: "transform 0.22s ease" },
                  "&:hover .arrow-icon": { transform: "translateX(3px)" },
                }}
              >
                Conocer Hubi
                <Box component="span" className="material-symbols-outlined arrow-icon" sx={{ fontSize: 18 }}>
                  arrow_forward
                </Box>
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => document.getElementById("proceso")?.scrollIntoView({ behavior: "smooth" })}
                sx={{
                  borderColor: "#680036",
                  color: "#680036",
                  fontWeight: 700,
                  px: 4,
                  py: 1.8,
                  borderRadius: "14px",
                  fontSize: 15,
                  borderWidth: 1.5,
                  textTransform: "none",
                  transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                  "&:hover": {
                    borderColor: "#56002D",
                    bgcolor: "rgba(104,0,54,0.04)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Ver el proceso
              </Button>
            </Stack>
          </Box>

          <Box
            sx={{
              position: "relative",
              display: { xs: "none", md: "block" },
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(8px)",
              transition: floatTransition(300),
            }}
          >
            <Box sx={{ position: "absolute", top: 26, right: 26, width: "100%", height: "100%", borderRadius: "28px", border: "2px solid rgba(252,192,25,0.5)", transform: "rotate(3deg)" }} />
            <Box
              component="img"
              src="/images/campus-loja.avif"
              alt="Campus UIDE Loja"
              sx={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                aspectRatio: "3 / 2",
                objectFit: "cover",
                borderRadius: "28px",
                display: "block",
                border: "6px solid #FFFFFF",
                boxShadow: "0 30px 60px rgba(47,0,24,0.22)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -20,
                right: -14,
                zIndex: 2,
                bgcolor: "#FFFFFF",
                borderRadius: "999px",
                border: "1px solid #ECECEF",
                boxShadow: "0 10px 26px rgba(47,0,24,0.10)",
                px: 1.75,
                py: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                transform: "rotate(-2deg)",
              }}
            >
              <Box sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: "#F7E6EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 13, color: "#680036", fontVariationSettings: "'FILL' 1" }}>school</span>
              </Box>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#18151A" }}>Campus UIDE · Loja</Typography>
            </Box>
            <Box sx={{ position: "absolute", top: -28, right: -6, zIndex: 3, transform: "rotate(4deg)" }}>
              <MiniStatusPill />
            </Box>
            <Box sx={{ position: "absolute", bottom: 48, left: -28, zIndex: 3 }}>
              <MiniReportCard />
            </Box>
          </Box>
        </Box>

        <Box
          component="img"
          src="/images/campus-loja.avif"
          alt="Campus UIDE Loja"
          sx={{
            display: { xs: "block", md: "none" },
            width: "100%",
            aspectRatio: "3 / 2",
            objectFit: "cover",
            borderRadius: "20px",
            border: "5px solid #FFFFFF",
            boxShadow: "0 18px 40px rgba(47,0,24,0.16)",
            mt: 6,
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.7s ease 300ms",
          }}
        />
      </Box>
    </Box>
  );
}

function AboutSection() {
  return (
    <Box sx={{ width: "100%", py: { xs: 10, md: 16 }, bgcolor: "#FFFFFF", position: "relative", overflow: "hidden" }}>
      <Box sx={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(104,0,54,0.03) 1px, transparent 1px)", backgroundSize: "26px 26px", pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", top: -120, right: -100, width: 320, height: 320, borderRadius: "50%", bgcolor: "rgba(252,192,25,0.08)", filter: "blur(60px)", pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", bottom: -110, left: -90, width: 300, height: 300, borderRadius: "50%", bgcolor: "rgba(104,0,54,0.05)", filter: "blur(55px)", pointerEvents: "none" }} />

      <SectionWrapper>
        <FadeInSection>
          <Box sx={{ textAlign: "center", maxWidth: 780, mx: "auto", position: "relative", zIndex: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: 28, md: 38 }, color: "#18151A", mb: 3, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              ¿Qué es <Box component="span" sx={{ color: "#680036" }}>Hubi</Box>?
            </Typography>
            <Typography sx={{ color: "#4A444D", fontSize: { xs: 15, md: 17 }, lineHeight: 1.8, mx: "auto", maxWidth: 660, mb: { xs: 5, md: 6 } }}>
              Hubi es la herramienta digital de la UIDE que conecta la voz de la comunidad universitaria con las áreas responsables, facilitando el registro, gestión y seguimiento de reportes para mejorar juntos nuestro entorno.
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1.5 }}>
              {[
                { icon: "assignment", label: "Registro" },
                { icon: "account_tree", label: "Gestión" },
                { icon: "task_alt", label: "Seguimiento" },
              ].map((item) => (
                <Box key={item.label} sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, px: 2.25, py: 0.9, borderRadius: 999, border: "1px solid rgba(104,0,54,0.16)", bgcolor: "rgba(104,0,54,0.03)", color: "#680036", transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)", "&:hover": { bgcolor: "#680036", color: "#ffffff", transform: "translateY(-2px)" } }}>
                  <Box component="span" className="material-symbols-outlined" sx={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>{item.icon}</Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{item.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </FadeInSection>
      </SectionWrapper>
    </Box>
  );
}

function StatsSection() {
  const [stats, setStats] = useState({ total: 0, resueltos_pct: 0, este_mes: 0 });

  useEffect(() => {
    fetch(`${API_BASE}/reportes/stats`)
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  const items = [
    { icon: "description", iconBg: "#F7E6EB", iconColor: "#680036", value: stats.total, label: "Reportes Gestionados", sub: "casos atendidos en el semestre" },
    { icon: "task_alt", iconBg: "#FFF4CC", iconColor: "#785900", value: `${stats.resueltos_pct}%`, label: "Casos Resueltos", sub: "con respuesta formal a cada estudiante", featured: true },
    { icon: "date_range", iconBg: "#F7E6EB", iconColor: "#680036", value: stats.este_mes, label: "Este Mes", sub: "nuevos reportes recibidos" },
  ];

  return (
    <Box sx={{ width: "100%", py: { xs: 10, md: 16 }, bgcolor: "#F8F9FB", position: "relative", overflow: "hidden" }}>
      <Box sx={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(104,0,54,0.035) 1px, transparent 1px)", backgroundSize: "26px 26px", pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", top: -90, left: -90, width: 300, height: 300, borderRadius: "50%", bgcolor: "rgba(104,0,54,0.05)", filter: "blur(50px)", pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", bottom: -110, right: -80, width: 320, height: 320, borderRadius: "50%", bgcolor: "rgba(252,192,25,0.10)", filter: "blur(60px)", pointerEvents: "none" }} />

      <SectionWrapper>
        <Box sx={{ display: "grid", gridTemplateColumns: { md: "0.9fr 1.1fr" }, gap: { xs: 6, md: 9 }, alignItems: "center", position: "relative", zIndex: 1 }}>
          <FadeInSection>
            <Box>
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 2, py: 0.7, borderRadius: 999, bgcolor: "#FFF4CC", border: "1px solid rgba(252,192,25,0.4)", mb: 2.5 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#785900" }} />
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#785900", letterSpacing: "0.07em" }}>NUESTRO IMPACTO</Typography>
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: 26, md: 34 }, color: "#18151A", mb: 2, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                Una comunidad que escucha
              </Typography>
              <Typography sx={{ color: "#77737A", fontSize: { xs: 14, md: 15 }, lineHeight: 1.75, maxWidth: 420 }}>
                Cada reporte se convierte en una acción concreta. Revisamos, respondemos y resolvemos para que tu voz impulse el cambio en la UIDE.
              </Typography>

              <Box sx={{ position: "relative", mt: 4, maxWidth: 440 }}>
                <Box sx={{ position: "absolute", top: -14, right: -14, width: "100%", height: "100%", borderRadius: "22px", border: "2px solid rgba(104,0,54,0.14)", transform: "rotate(-2deg)" }} />
                <Box component="img" src="/images/foto-loja-3-1.avif" alt="Estudiantes en la UIDE"
                  sx={{ position: "relative", width: "100%", aspectRatio: "16 / 10", objectFit: "cover", borderRadius: "22px", display: "block", boxShadow: "0 20px 44px rgba(47,0,24,0.14)" }} />
                <Box sx={{ position: "absolute", bottom: -16, left: 16, bgcolor: "#FFFFFF", borderRadius: "14px", border: "1px solid #ECECEF", boxShadow: "0 12px 30px rgba(47,0,24,0.12)", px: 2, py: 1.25, display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ width: 30, height: 30, borderRadius: "9px", bgcolor: "#F7E6EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#680036", fontVariationSettings: "'FILL' 1" }}>forum</span>
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: 14, color: "#18151A", lineHeight: 1.1 }}>{stats.total}</Typography>
                    <Typography sx={{ fontSize: 9, color: "#77737A", fontWeight: 600 }}>reportes gestionados</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </FadeInSection>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {items.map((item, i) => (
              <FadeInSection key={item.label} delay={i * 90}>
                <Box
                  sx={{
                    bgcolor: item.featured ? "#FFF9E6" : "#FFFFFF",
                    p: { xs: 2.5, md: 3.5 },
                    borderRadius: "20px",
                    border: item.featured ? "1px solid rgba(252,192,25,0.55)" : "1px solid #ECECEF",
                    display: "flex",
                    alignItems: "center",
                    gap: 2.5,
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                    transition: "transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: item.featured ? "0 16px 36px rgba(252,192,25,0.16)" : "0 12px 32px rgba(47,0,24,0.08)",
                    },
                  }}
                >
                  <Box sx={{ position: "absolute", top: -20, right: -20, width: 90, height: 90, borderRadius: "50%", bgcolor: item.featured ? "rgba(252,192,25,0.14)" : "rgba(104,0,54,0.05)", pointerEvents: "none" }} />
                  <Box
                    sx={{
                      width: 58, height: 58, borderRadius: "16px",
                      bgcolor: item.iconBg, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      color: item.iconColor, flexShrink: 0,
                      boxShadow: item.featured ? "0 6px 16px rgba(120,89,0,0.14)" : "none",
                    }}
                  >
                    <Box component="span" className="material-symbols-outlined" sx={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}>
                      {item.icon}
                    </Box>
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                      <Typography sx={{ fontWeight: 800, color: "#18151A", fontSize: { xs: 30, md: 34 }, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                        {item.value}
                      </Typography>
                      {item.featured && (
                        <Box sx={{ px: 1, py: 0.25, borderRadius: 999, bgcolor: "#FCC019" }}>
                          <Typography sx={{ fontSize: 9, fontWeight: 700, color: "#251A00", letterSpacing: "0.04em" }}>DESTACADO</Typography>
                        </Box>
                      )}
                    </Box>
                    <Typography sx={{ color: "#18151A", fontSize: 14, fontWeight: 700, mt: 0.5 }}>
                      {item.label}
                    </Typography>
                    <Typography sx={{ color: item.featured ? "#785900" : "#969198", fontSize: 12, mt: 0.25 }}>
                      {item.sub}
                    </Typography>
                  </Box>
                </Box>
              </FadeInSection>
            ))}
          </Box>
        </Box>
      </SectionWrapper>
    </Box>
  );
}

function StepsSection() {
  const steps = [
    { number: "1", icon: "assignment", title: "Registro", desc: "Ingresa los detalles de tu reporte o sugerencia a través de nuestro formulario seguro." },
    { number: "2", icon: "account_tree", title: "Asignación", desc: "El sistema asigna tu caso automáticamente al departamento correspondiente." },
    { number: "3", icon: "travel_explore", title: "Investigación", desc: "Un equipo especializado analiza la información y busca una solución efectiva." },
    { number: "4", icon: "task_alt", title: "Resolución", desc: "Recibes una notificación formal con la resolución tomada y las acciones realizadas.", isIcon: true },
  ];

  return (
    <Box id="proceso" sx={{ width: "100%", py: { xs: 10, md: 16 }, bgcolor: "#FAF9F7", position: "relative", overflow: "hidden" }}>
      <Box sx={{ position: "absolute", top: -100, right: -90, width: 300, height: 300, borderRadius: "50%", bgcolor: "rgba(104,0,54,0.05)", filter: "blur(60px)", pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", bottom: -80, left: -70, width: 240, height: 240, borderRadius: "50%", bgcolor: "rgba(252,192,25,0.08)", filter: "blur(50px)", pointerEvents: "none" }} />

      <SectionWrapper>
        <FadeInSection>
          <Box sx={{ textAlign: "center", mb: { xs: 6, md: 9 }, position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 2, py: 0.7, borderRadius: 999, bgcolor: "rgba(104,0,54,0.06)", border: "1px solid rgba(104,0,54,0.10)", mb: 2.5 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#680036", fontVariationSettings: "'FILL' 1" }}>description</span>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#680036", letterSpacing: "0.07em" }}>PROCESO</Typography>
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: 26, md: 34 }, color: "#18151A", mb: 1.5, letterSpacing: "-0.02em" }}>
              ¿Cómo hacer un reporte?
            </Typography>
            <Typography sx={{ color: "#77737A", maxWidth: 520, mx: "auto", fontSize: { xs: 14, md: 15 }, lineHeight: 1.7 }}>
              En pocos pasos puedes enviar tu reporte y nosotros nos encargamos del resto.
            </Typography>
          </Box>
        </FadeInSection>

        <Box sx={{ position: "relative", maxWidth: 1040, mx: "auto", zIndex: 1 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
              gap: { xs: 3, md: 3.5 },
            }}
          >
            {steps.map((step, i) => (
              <FadeInSection key={step.title} delay={i * 90}>
                <Box
                  sx={{
                    bgcolor: "#FFFFFF",
                    borderRadius: "20px",
                    border: "1px solid #ECECEF",
                    p: 3.5,
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: step.isIcon ? "0 18px 40px rgba(252,192,25,0.18)" : "0 18px 40px rgba(104,0,54,0.12)",
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      bgcolor: step.isIcon ? "#FCC019" : "#680036",
                    },
                  }}
                >
                  <Typography sx={{ position: "absolute", top: 10, right: 14, fontSize: 44, fontWeight: 800, color: "rgba(104,0,54,0.05)", lineHeight: 1, letterSpacing: "-0.03em" }}>
                    {step.number}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "14px",
                        bgcolor: step.isIcon ? "#FFF4CC" : "#F7E6EB",
                        color: step.isIcon ? "#785900" : "#680036",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box component="span" className="material-symbols-outlined" sx={{ fontSize: 24, fontVariationSettings: "'FILL' 1" }}>
                        {step.icon}
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        bgcolor: step.isIcon ? "#FCC019" : "#680036",
                        color: step.isIcon ? "#251A00" : "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: 13,
                        boxShadow: step.isIcon ? "0 4px 12px rgba(252,192,25,0.3)" : "0 4px 12px rgba(104,0,54,0.22)",
                      }}
                    >
                      {step.number}
                    </Box>
                  </Box>

                  <Typography sx={{ fontWeight: 800, color: "#18151A", fontSize: 17, mb: 1, letterSpacing: "-0.01em" }}>
                    {step.title}
                  </Typography>
                  <Typography sx={{ color: "#77737A", fontSize: 13, lineHeight: 1.7, flex: 1 }}>
                    {step.desc}
                  </Typography>

                  <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 2.5 }}>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#969198", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      Paso {i + 1}
                    </Typography>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: step.isIcon ? "#785900" : "#680036", fontVariationSettings: "'FILL' 1" }}>
                      {step.isIcon ? "verified" : "arrow_forward"}
                    </span>
                  </Stack>
                </Box>
              </FadeInSection>
            ))}
          </Box>
        </Box>
      </SectionWrapper>
    </Box>
  );
}

function TestimonialSection() {
  return (
    <Box id="contacto" sx={{ width: "100%", py: { xs: 9, md: 13 }, overflow: "hidden", bgcolor: "#F8F9FB" }}>
      <SectionWrapper>
        <FadeInSection>
          <Box
            sx={{
              background: "linear-gradient(120deg, #2F0018 0%, #56002D 55%, #680036 100%)",
              borderRadius: { xs: "24px", md: "28px" },
              p: { xs: 4, md: 7 },
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              alignItems: "center",
              gap: { xs: 4, md: 6 },
            }}
          >
            <Box sx={{ position: "absolute", top: -70, right: -70, width: 220, height: 220, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
            <Box sx={{ position: "absolute", bottom: -50, left: -50, width: 170, height: 170, borderRadius: "50%", bgcolor: "rgba(252,192,25,0.05)", pointerEvents: "none" }} />
            <Box sx={{ position: "absolute", top: { xs: 8, md: 16 }, right: { xs: 12, md: 24 }, opacity: 0.07, pointerEvents: "none" }}>
              <Box component="span" className="material-symbols-outlined" sx={{ fontSize: { xs: 110, md: 160 }, fontVariationSettings: "'FILL' 1", color: "#ffffff" }}>
                format_quote
              </Box>
            </Box>

            <Box
              sx={{
                width: { xs: 88, md: 104 },
                height: { xs: 88, md: 104 },
                borderRadius: "50%",
                flexShrink: 0,
                position: "relative",
                zIndex: 1,
                bgcolor: "rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid rgba(252,192,25,0.45)",
              }}
            >
              <TextMui value="MJ" sx={{ color: "#FCC019", fontWeight: 800, fontSize: { xs: 26, md: 32 } }} />
            </Box>

            <Box sx={{ position: "relative", zIndex: 1, textAlign: { xs: "center", lg: "left" }, flex: 1 }}>
              <Stack direction="row" spacing={0.4} justifyContent={{ xs: "center", lg: "flex-start" }} sx={{ mb: 2.5 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className="material-symbols-outlined" style={{ fontSize: 20, color: "#FCC019", fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
                <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: 12, ml: 1, alignSelf: "center" }}>Experiencia verificada</Typography>
              </Stack>
              <Typography
                sx={{
                  color: "#ffffff",
                  fontSize: { xs: 17, md: 20 },
                  fontWeight: 500,
                  mb: 3,
                  lineHeight: 1.7,
                  letterSpacing: "-0.01em",
                }}
              >
                “Sentí que mi preocupación fue escuchada de verdad. El proceso fue totalmente transparente y recibí una respuesta clara en menos de dos días.”
              </Typography>
              <Box>
                <Typography sx={{ color: "#ffffff", fontWeight: 700, fontSize: { xs: 14, md: 15 } }}>
                  María José Delgado
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: 12, mt: 0.25, letterSpacing: "0.02em" }}>
                  Estudiante de Derecho, 8vo Semestre
                </Typography>
              </Box>
            </Box>

            <Box sx={{ position: "relative", zIndex: 1, flexShrink: 0, display: { xs: "none", lg: "block" } }}>
              <Box
                component="img"
                src="/images/foto-loja-3-1.avif"
                alt="Campus UIDE"
                sx={{
                  width: 340,
                  height: 260,
                  objectFit: "cover",
                  borderRadius: "22px",
                  border: "3px solid rgba(252,192,25,0.35)",
                  boxShadow: "0 20px 44px rgba(0,0,0,0.28)",
                  display: "block",
                }}
              />
            </Box>
          </Box>
        </FadeInSection>
      </SectionWrapper>
    </Box>
  );
}

function CTASection() {
  const navigate = useNavigate();
  return (
    <Box sx={{ width: "100%", py: { xs: 12, md: 18 }, position: "relative", overflow: "hidden", bgcolor: "#2F0018" }}>
      <Box
        component="img"
        src="/images/foto-loja-2-1.avif"
        alt=""
        sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(110deg, rgba(47,0,24,0.94) 0%, rgba(86,0,45,0.84) 50%, rgba(104,0,54,0.76) 100%)",
        }}
      />
      <SectionWrapper>
        <FadeInSection>
          <Box sx={{ textAlign: "center", position: "relative", zIndex: 1, maxWidth: 620, mx: "auto" }}>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 2, py: 0.7, borderRadius: 999, bgcolor: "rgba(252,192,25,0.12)", border: "1px solid rgba(252,192,25,0.35)", mb: 3 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#FCC019", fontVariationSettings: "'FILL' 1" }}>favorite</span>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#FCC019", letterSpacing: "0.07em" }}>ÚNETE A LA COMUNIDAD</Typography>
            </Box>
            <Typography sx={{ color: "#ffffff", fontWeight: 800, fontSize: { xs: 28, md: 40 }, mb: 2.5, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              ¿Listo para hacer la diferencia?
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.72)", fontSize: { xs: 14, md: 16 }, mb: { xs: 5, md: 6 }, lineHeight: 1.7, maxWidth: 460, mx: "auto" }}>
              Tu participación es fundamental para mantener la excelencia y la transparencia en nuestra institución.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/ingreso")}
              sx={{
                bgcolor: "#FCC019",
                color: "#251A00",
                fontWeight: 700,
                px: 4.5,
                py: 1.7,
                borderRadius: "14px",
                fontSize: 14,
                boxShadow: "0 6px 20px rgba(252, 192, 25, 0.32)",
                textTransform: "none",
                transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                "&:hover": { bgcolor: "#e6ac15", transform: "translateY(-2px)", boxShadow: "0 10px 28px rgba(252, 192, 25, 0.36)" },
              }}
            >
              Inicia un reporte
            </Button>

            <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap" sx={{ mt: { xs: 4, md: 5 } }}>
              {[
                { icon: "lock", label: "100% Confidencial" },
                { icon: "visibility", label: "Seguimiento total" },
                { icon: "verified_user", label: "Respuesta garantizada" },
              ].map((item) => (
                <Box key={item.label} sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, px: 2, py: 0.9, borderRadius: 999, bgcolor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 15, color: "#FCC019", fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{item.label}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </FadeInSection>
      </SectionWrapper>
    </Box>
  );
}

function HomePage() {
  return (
    <Box sx={{ bgcolor: "#F8F9FB", minHeight: "100dvh" }}>
      <NavBar />
      <main>
        <HeroSection />
        <AboutSection />
        <StatsSection />
        <StepsSection />
        <TestimonialSection />
        <CTASection />
      </main>
      <Footer />
    </Box>
  );
}

export default HomePage;
