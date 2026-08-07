import { useContext } from "react";
import { ReportContext } from "./reportContext.js";

export function useReports() {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error("useReports debe usarse dentro de un ReportProvider");
  }
  return context;
}
