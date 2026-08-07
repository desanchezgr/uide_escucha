import { Box, Container, Typography, Stack } from "@mui/material";
import brandingImg from "../assets/branding.png";

const socialIcons = [
  { icon: "public", label: "Web" },
  { icon: "mail", label: "Email" },
  { icon: "phone", label: "Phone" },
];

const resourceLinks = ["Privacidad", "Términos de Uso", "Soporte Técnico", "Directorio"];

function Footer() {
  return (
    <Box
      component="footer"
      id="contacto"
      sx={{ bgcolor: "#FFFFFF", borderTop: "1px solid #ECECEF" }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            gap: { xs: 4, md: 6 },
          }}
        >
          <Box sx={{ maxWidth: 280 }}>
            <Box
              component="img"
              src={brandingImg}
              alt="UIDE"
              sx={{ height: 28, width: "auto", mb: 1.5, display: "block" }}
            />
            <Typography
              sx={{ color: "#77737A", fontSize: 11, lineHeight: 1.7, mb: 3 }}
            >
              Sistema institucional para la gestión transparente de denuncias,
              reportes y sugerencias.
            </Typography>
            <Stack direction="row" spacing={1}>
              {socialIcons.map((item) => (
                <Box
                  key={item.label}
                  component="span"
                  className="material-symbols-outlined"
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: "rgba(104, 0, 54, 0.1)",
                    color: "#680036",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: 16,
                    transition: "all 0.2s",
                    "&:hover": { bgcolor: "#680036", color: "#ffffff" },
                  }}
                >
                  {item.icon}
                </Box>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: { xs: 5, md: 8 },
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: "#680036",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  mb: 2,
                }}
              >
                Recursos
              </Typography>
              <Stack spacing={1}>
                {resourceLinks.map((item) => (
                  <Typography
                    key={item}
                    component="a"
                    href="#"
                    sx={{
                      color: "#77737A",
                      fontSize: 11,
                      cursor: "pointer",
                      textDecoration: "none",
                      "&:hover": { color: "#680036", textDecoration: "underline" },
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Stack>
            </Box>
            <Box>
              <Typography
                sx={{
                  color: "#680036",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  mb: 2,
                }}
              >
                Sede Central
              </Typography>
              <Typography
                sx={{ color: "#77737A", fontSize: 11, lineHeight: 1.7 }}
              >
                Campus Principal UIDE
                <br />
                Av. Universitaria s/n
                <br />
                Quito, Ecuador
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>

      <Box sx={{ borderTop: "1px solid #ECECEF", py: 2 }}>
        <Container maxWidth="lg" sx={{ textAlign: "center" }}>
          <Typography sx={{ color: "#77737A", fontSize: 10, opacity: 0.7 }}>
            © 2024 Universidad - Sistema de Transparencia y Denuncias. Todos los
            derechos reservados.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default Footer;
