import { useState, useCallback, useRef } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { ToastContext } from "./toastContext.js";

const ICONS = {
  success: "check_circle",
  warning: "warning",
  error: "error",
  info: "info",
};

const COLORS = {
  success: { bg: "#e8f7ed", fg: "#1f7a3f", icon: "#1f7a3f", border: "#c4e8d0" },
  warning: { bg: "#fff5db", fg: "#785900", icon: "#785900", border: "#f0dfa1" },
  error: { bg: "#fde9ef", fg: "#ba1a1a", icon: "#ba1a1a", border: "#f5c8d1" },
  info: { bg: "#e8eaf6", fg: "#303f9f", icon: "#303f9f", border: "#c5cae9" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <Box
        sx={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 10000,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          maxWidth: 400,
          width: "100%",
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => {
          const colors = COLORS[t.type] || COLORS.info;
          return (
            <Box
              key={t.id}
              sx={{
                pointerEvents: "auto",
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
                p: 1.5,
                bgcolor: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: 2,
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                animation: "slideInRight 0.3s ease",
                "@keyframes slideInRight": {
                  "0%": { transform: "translateX(100%)", opacity: 0 },
                  "100%": { transform: "translateX(0)", opacity: 1 },
                },
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20, color: colors.icon, flexShrink: 0, marginTop: 1 }}
              >
                {ICONS[t.type] || ICONS.info}
              </span>
              <Typography variant="body2" color={colors.fg} sx={{ flex: 1, fontWeight: 500 }}>
                {t.message}
              </Typography>
              <IconButton
                size="small"
                onClick={() => removeToast(t.id)}
                sx={{ color: colors.fg, p: 0.25, minWidth: 20, height: 20, "&:hover": { bgcolor: "transparent", opacity: 0.7 } }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              </IconButton>
            </Box>
          );
        })}
      </Box>
    </ToastContext.Provider>
  );
}
