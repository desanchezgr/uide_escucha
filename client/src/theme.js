import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#680036" },
    secondary: { main: "#785900" },
    error: { main: "#ba1a1a" },
    background: { default: "#f8f9fb", paper: "#ffffff" },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    allVariants: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    h4: { fontWeight: 800, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 700,
          borderRadius: 14,
          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        },
        sizeLarge: { padding: "12px 24px", fontSize: "0.875rem" },
        sizeMedium: { padding: "10px 20px", fontSize: "0.8125rem" },
        sizeSmall: { padding: "6px 14px", fontSize: "0.75rem" },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 14,
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            "& .MuiOutlinedInput-input": {
              padding: "14px 16px",
            },
            "&.Mui-focused fieldset": {
              borderColor: "rgba(104,0,54,0.30)",
              boxShadow: "0 0 0 4px rgba(104,0,54,0.055)",
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: "0 1px 4px rgba(47,0,24,0.06)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },
  },
});

export default theme;
