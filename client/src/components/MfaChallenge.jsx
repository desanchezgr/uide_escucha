import { useState, useRef, useEffect } from "react";
import { Box, Typography, TextField, Button, Stack, CircularProgress } from "@mui/material";

function MfaChallenge({ onSubmit, loading, error, onUseBackupCode }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(0, 1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
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
    }
  };

  const fullCode = code.join("");
  const isComplete = fullCode.length === 6;

  const handleSubmit = () => {
    if (isComplete) onSubmit(fullCode);
  };

  return (
    <Box sx={{ textAlign: "center" }}>
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          bgcolor: "rgba(104, 0, 54, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 2,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#680036", fontVariationSettings: "'FILL' 1" }}>
          shield
        </span>
      </Box>

      <Typography sx={{ color: "#18151A", fontWeight: 700, mb: 0.5, fontSize: 16 }}>
        Verificación en dos pasos
      </Typography>
      <Typography sx={{ color: "#77737A", fontSize: 13, mb: 3, lineHeight: 1.6 }}>
        Ingresa el código de 6 dígitos generado por tu aplicación de autenticación.
      </Typography>

      <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mb: 3 }}>
        {code.map((digit, index) => (
          <TextField
            key={index}
            inputRef={(el) => { inputRefs.current[index] = el; }}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            variant="outlined"
            slotProps={{
              input: {
                sx: {
                  width: 46,
                  height: 54,
                  textAlign: "center",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#18151A",
                  borderRadius: "14px",
                  bgcolor: "#F7F7F9",
                  "& .MuiOutlinedInput-input": { textAlign: "center", p: 0 },
                  "& fieldset": { borderColor: digit ? "#680036" : "#ECECEF", borderWidth: digit ? 2 : 1 },
                  "&.Mui-focused fieldset": { borderColor: "rgba(104,0,54,0.30)", borderWidth: 1, boxShadow: "0 0 0 4px rgba(104,0,54,0.055)" },
                },
              },
            }}
            inputProps={{ maxLength: 1, inputMode: "numeric", "aria-label": `Digito ${index + 1}` }}
          />
        ))}
      </Stack>

      {error && (
        <Typography sx={{ color: "#ba1a1a", fontSize: 12, mb: 2, fontWeight: 500 }}>
          {error}
        </Typography>
      )}

      <Button
        fullWidth
        variant="contained"
        onClick={handleSubmit}
        disabled={loading || !isComplete}
        sx={{
          bgcolor: "#680036",
          color: "#ffffff",
          fontWeight: 700,
          py: 1.7,
          borderRadius: "14px",
          fontSize: 14,
          boxShadow: "0 4px 14px rgba(104, 0, 54, 0.22)",
          textTransform: "none",
          transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
          mb: 1.5,
          "&:hover": { bgcolor: "#56002D", transform: "translateY(-1px)", boxShadow: "0 6px 20px rgba(104, 0, 54, 0.28)" },
          "&.Mui-disabled": { bgcolor: "rgba(104, 0, 54, 0.25)", color: "rgba(255, 255, 255, 0.7)", boxShadow: "none" },
        }}
      >
        {loading ? <CircularProgress size={18} color="inherit" /> : "Verificar"}
      </Button>

      {onUseBackupCode && (
        <Button
          size="small"
          onClick={onUseBackupCode}
          sx={{ color: "#680036", fontWeight: 600, fontSize: 12, textTransform: "none", "&:hover": { bgcolor: "rgba(104, 0, 54, 0.06)" } }}
        >
          Usar código de respaldo
        </Button>
      )}
    </Box>
  );
}

export default MfaChallenge;
