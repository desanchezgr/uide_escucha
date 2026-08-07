import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import brandingImg from "../assets/branding.png";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: "Inicio", path: "/" },
    { label: "Proceso", path: "proceso" },
    { label: "Reseña", path: "contacto" },
  ];

  const handleNavClick = (path) => {
    if (path === "/") {
      navigate("/");
      return;
    }
    const element = document.getElementById(path);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        bgcolor: "rgba(248, 249, 251, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(235, 214, 219, 0.4)",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: 64,
          }}
        >
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            <Box
              component="img"
              src={brandingImg}
              alt="UIDE"
              sx={{ height: 34, width: "auto", display: "block" }}
            />
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 4,
              alignItems: "center",
            }}
          >
            {navLinks.map((link) => {
              const isActive = link.path === "/"
                ? location.pathname === "/"
                : false;
              return (
                <Typography
                  key={link.label}
                  onClick={() => handleNavClick(link.path)}
                  sx={{
                    cursor: "pointer",
                    color: isActive ? "#680036" : "#77737A",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 14,
                    position: "relative",
                    transition: "color 0.2s",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: -4,
                      left: 0,
                      right: 0,
                      height: 2,
                      borderRadius: 1,
                      bgcolor: "#680036",
                      transform: isActive ? "scaleX(1)" : "scaleX(0)",
                      transition: "transform 0.2s ease",
                    },
                    "&:hover": {
                      color: "#680036",
                      "&::after": { transform: "scaleX(1)" },
                    },
                  }}
                >
                  {link.label}
                </Typography>
              );
            })}
          </Box>

          <Box sx={{ display: "flex", gap: { xs: 0.5, md: 1 }, alignItems: "center" }}>
            <Button
              onClick={() => navigate("/ingreso")}
              size="small"
              sx={{
                bgcolor: "#680036",
                color: "#ffffff",
                fontWeight: 600,
                px: 2.5,
                boxShadow: "0 2px 8px rgba(104, 0, 54, 0.2)",
                "&:hover": {
                  bgcolor: "#56002D",
                  boxShadow: "0 4px 16px rgba(104, 0, 54, 0.25)",
                },
              }}
            >
              Acceso
            </Button>

          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default NavBar;
