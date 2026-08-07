import { useMemo } from "react";

export function useNombreValidation(value) {
  return useMemo(() => {
    if (!value) return { error: false, helper: "" };
    if (value.length < 3) return { error: true, helper: "Minimo 3 caracteres." };
    if (value.length > 50) return { error: true, helper: "Maximo 50 caracteres." };
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value))
      return { error: true, helper: "Solo se permiten letras y espacios." };
    return { error: false, helper: "" };
  }, [value]);
}

export function useEmailValidation(value) {
  return useMemo(() => {
    if (!value) return { error: false, helper: "" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return { error: true, helper: "Formato de correo invalido." };
    if (!value.endsWith("@uide.edu.ec"))
      return { error: true, helper: "Debe ingresar un correo institucional (@uide.edu.ec)." };
    return { error: false, helper: "" };
  }, [value]);
}

export function usePasswordValidation(value) {
  const checks = useMemo(() => {
    if (!value) return { isValid: false, checks: [] };
    const rules = [
      { label: "Minimo 8 caracteres", pass: value.length >= 8 },
      { label: "Maximo 64 caracteres", pass: value.length <= 64 },
      { label: "Una letra mayuscula", pass: /[A-Z]/.test(value) },
      { label: "Una letra minuscula", pass: /[a-z]/.test(value) },
      { label: "Un numero", pass: /\d/.test(value) },
      { label: "Un caracter especial", pass: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value) },
    ];
    return {
      isValid: rules.every((r) => r.pass),
      checks: rules,
      passedCount: rules.filter((r) => r.pass).length,
      totalCount: rules.length,
    };
  }, [value]);

  const error = useMemo(() => {
    if (!value) return false;
    return !checks.isValid;
  }, [value, checks]);

  return { error, checks };
}

export function useDescripcionValidation(value) {
  return useMemo(() => {
    const count = value ? value.length : 0;
    if (!value) return { error: false, helper: `${count} / 500 caracteres`, count };
    if (count < 20) return { error: true, helper: `Minimo 20 caracteres — ${count} / 500`, count };
    if (count > 500) return { error: true, helper: `Maximo 500 caracteres — ${count} / 500`, count };
    return { error: false, helper: `${count} / 500 caracteres`, count };
  }, [value]);
}
