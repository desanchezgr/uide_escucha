import { Box, Typography } from "@mui/material";

const EMOCIONES = {
  queja: [
    { value: "molesto:1", label: "Molesto", icon: "sentiment_dissatisfied", desc: "Algo no esta bien" },
    { value: "disgustado:2", label: "Disgustado", icon: "sentiment_very_dissatisfied", desc: "Me incomoda esta situacion" },
    { value: "enojado:3", label: "Enojado", icon: "mood_bad", desc: "Esto me enfada bastante" },
    { value: "frustrado:4", label: "Frustrado", icon: "sentiment_extremely_dissatisfied", desc: "Ya no lo soporto mas" },
  ],
  incidente: [
    { value: "molesto:1", label: "Molesto", icon: "sentiment_dissatisfied", desc: "Algo no esta bien" },
    { value: "disgustado:2", label: "Disgustado", icon: "sentiment_very_dissatisfied", desc: "Me incomoda esta situacion" },
    { value: "enojado:3", label: "Enojado", icon: "mood_bad", desc: "Esto me enfada bastante" },
    { value: "frustrado:4", label: "Frustrado", icon: "sentiment_extremely_dissatisfied", desc: "Ya no lo soporto mas" },
  ],
  felicitacion: [
    { value: "contento:1", label: "Contento", icon: "sentiment_satisfied", desc: "Me gusta como funciona" },
    { value: "satisfecho:2", label: "Satisfecho", icon: "sentiment_very_satisfied", desc: "Supero mis expectativas" },
    { value: "feliz:3", label: "Feliz", icon: "mood", desc: "Estoy muy contento con esto" },
    { value: "euforico:4", label: "Euforico", icon: "sentiment_excited", desc: "Esto es increiblemente bueno" },
  ],
  sugerencia: [
    { value: "idea:1", label: "Idea", icon: "lightbulb", desc: "Tengo una propuesta" },
    { value: "mejora:2", label: "Mejora", icon: "trending_up", desc: "Algo puede ser mejor" },
    { value: "innovacion:3", label: "Innovacion", icon: "auto_awesome", desc: "Una forma nueva de hacerlo" },
    { value: "propuesta:4", label: "Propuesta", icon: "edit_note", desc: "Asi podria funcionar" },
  ],
  peticion: [
    { value: "solicitud:1", label: "Solicitud", icon: "help", desc: "Necesito apoyo con esto" },
    { value: "necesidad:2", label: "Necesidad", icon: "priority_high", desc: "Es importante para mi" },
    { value: "urgencia:3", label: "Urgencia", icon: "campaign", desc: "Requiero atencion rapida" },
    { value: "colaboracion:4", label: "Colaboracion", icon: "diversity_3", desc: "Juntos podemos lograrlo" },
  ],
};

const COLOR_BARS = {
  queja: ["#f5a623", "#e8871e", "#d4521e", "#ba1a1a"],
  incidente: ["#f5a623", "#e8871e", "#d4521e", "#ba1a1a"],
  felicitacion: ["#fcc019", "#7bc67e", "#3d9140", "#1f7a3f"],
  sugerencia: ["#ffd54f", "#ffb74d", "#ff8a65", "#f57c00"],
  peticion: ["#64b5f6", "#42a5f5", "#1e88e5", "#1565c0"],
};

function EmotionSelector({ tipo, value, onChange }) {
  const opciones = EMOCIONES[tipo] || EMOCIONES.queja;
  const colores = COLOR_BARS[tipo] || COLOR_BARS.queja;

  return (
    <Box>
      <Typography
        variant="body2"
        fontWeight={700}
        color="#18151A"
        sx={{ mb: 1.5, fontSize: 14 }}
      >
        Como te sientes?
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {opciones.map((opcion, idx) => {
          const isSelected = value === opcion.value;
          const barColor = colores[idx];
          return (
            <Box
              key={opcion.value}
              onClick={() => onChange(opcion.value)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(opcion.value);
                }
              }}
              sx={{
                flex: { xs: "1 1 calc(50% - 6px)", sm: "1 1 calc(25% - 9px)" },
                minWidth: 110,
                maxWidth: 180,
                cursor: "pointer",
                borderRadius: "18px",
                border: "2px solid",
                borderColor: isSelected ? barColor : "transparent",
                bgcolor: isSelected ? `${barColor}12` : "#F7F7F9",
                p: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                userSelect: "none",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                "&:hover": {
                  bgcolor: isSelected ? `${barColor}18` : "#ECECEF",
                  transform: "translateY(-2px)",
                },
                "&:focus-visible": {
                  outline: "2px solid rgba(104,0,54,0.35)",
                  outlineOffset: 2,
                },
              }}
            >
              {isSelected && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    bgcolor: barColor,
                    borderRadius: "0 0 2px 2px",
                  }}
                />
              )}

              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor: isSelected ? `${barColor}22` : "#ECECEF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background-color 0.25s ease",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 28,
                    color: isSelected ? barColor : "#77737A",
                    fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0",
                    transition: "color 0.25s ease",
                  }}
                >
                  {opcion.icon}
                </span>
              </Box>

              <Typography
                sx={{
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: 13,
                  color: isSelected ? barColor : "#18151A",
                  textAlign: "center",
                  transition: "color 0.2s ease",
                }}
              >
                {opcion.label}
              </Typography>

              <Typography
                sx={{
                  fontSize: 10,
                  color: isSelected ? `${barColor}aa` : "#969198",
                  textAlign: "center",
                  lineHeight: 1.2,
                  transition: "color 0.2s ease",
                }}
              >
                {opcion.desc}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default EmotionSelector;
