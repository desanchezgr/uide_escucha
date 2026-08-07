import { useCallback, useMemo, useState } from "react";
import { ReportContext } from "./reportContext.js";
import { apiFetch } from "../utils/api.js";

async function safeJsonResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(`Error del servidor (${res.status}): ${text.slice(0, 120)}`);
  }
  return res.json();
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  };
}

function mapReport(raw) {
  const statusMap = {
    pendiente: "Pendiente",
    en_proceso: "En Proceso",
    resuelto: "Resuelto",
    rechazado: "Rechazado",
  };
  const tipoMap = {
    queja: "Queja",
    incidente: "Incidente",
    sugerencia: "Sugerencia",
    felicitacion: "Felicitacion",
    peticion: "Peticion",
  };
  const EMOCION_LABELS = {
    "molesto:1": "Molesto",
    "disgustado:2": "Disgustado",
    "enojado:3": "Enojado",
    "frustrado:4": "Frustrado",
    "contento:1": "Contento",
    "satisfecho:2": "Satisfecho",
    "feliz:3": "Feliz",
    "euforico:4": "Euforico",
    "idea:1": "Idea",
    "mejora:2": "Mejora",
    "innovacion:3": "Innovacion",
    "propuesta:4": "Propuesta",
    "solicitud:1": "Solicitud",
    "necesidad:2": "Necesidad",
    "urgencia:3": "Urgencia",
    "colaboracion:4": "Colaboracion",
  };

  const emocionLabel = raw.emocion ? EMOCION_LABELS[raw.emocion] : null;
  const issue = emocionLabel || raw.titulo || "Sin titulo";

  return {
    id: raw.id,
    student: raw.autor_nombre || "Sin autor",
    issue,
    titulo: raw.titulo || "",
    emocion: raw.emocion || "",
    emocionLabel: emocionLabel || "",
    category: tipoMap[raw.tipo] || raw.tipo,
    date: new Date(raw.creado_en).toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    creado_en: raw.creado_en,
    status: statusMap[raw.estado] || raw.estado,
    description: raw.descripcion,
    tipo: raw.tipo,
    area: raw.area,
    estado: raw.estado,
    autor_id: raw.autor_id,
    imagenes: raw.imagenes || [],
    clasificacion: raw.clasificacion || "",
    urgencia: raw.urgencia || "",
    zona: raw.zona || "",
    resuelto_por: raw.resuelto_por || "",
    fecha_resolucion: raw.fecha_resolucion || "",
    actualizado_en: raw.actualizado_en || "",
    actualizado: raw.actualizado_en
      ? new Date(raw.actualizado_en).toLocaleDateString("es-EC", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "",
  };
}

export function ReportProvider({ children }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getReportes = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (params.todos !== false) qs.set("todos", "1");
      for (const [k, v] of Object.entries(params)) {
        if (k === "todos" || v === undefined || v === "" || v === null) continue;
        qs.set(k, v);
      }
      const query = qs.toString();
      const res = await apiFetch(`/reportes${query ? `?${query}` : ""}`, {
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await safeJsonResponse(res);
        throw new Error(data.error || "Error al obtener reportes");
      }
      const body = await safeJsonResponse(res);
      const list = Array.isArray(body) ? body : body.data || [];
      setReports(list.map(mapReport));
      return body;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const buscarReportes = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (
          v === undefined || v === null || v === "" ||
          v === "todos" || v === "all" || v === "cualquiera"
        ) {
          continue;
        }
        qs.set(k, v);
      }
      const res = await apiFetch(`/reportes?${qs.toString()}`, {
        headers: authHeaders(),
      });
      if (!res.ok) {
        const body = await safeJsonResponse(res);
        throw new Error(body.error || "Error al obtener reportes");
      }
      const body = await safeJsonResponse(res);
      const list = Array.isArray(body) ? body : body.data || [];
      return {
        data: list.map(mapReport),
        total: Array.isArray(body) ? list.length : body.total ?? list.length,
        page: body.page ?? 1,
        totalPages: body.totalPages ?? 1,
        porEstado: body.porEstado || {},
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const crearReporte = useCallback(async ({ titulo, emocion, descripcion, tipo, area, imagenes }) => {
    setLoading(true);
    setError(null);
    try {
      const body = { titulo: titulo || "", emocion, descripcion, tipo, area };

      const files = Array.isArray(imagenes) ? imagenes : imagenes ? [imagenes] : [];
      if (files.length) {
        body.archivos_base64 = [];
        body.archivos_nombre = [];
        body.archivos_tipo = [];
        for (const file of files) {
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          body.archivos_base64.push(base64);
          body.archivos_nombre.push(file.name);
          body.archivos_tipo.push(file.type);
        }
      }

      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No hay sesión activa. Inicia sesión nuevamente.");
      const res = await apiFetch("/reportes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const respBody = await safeJsonResponse(res);
        throw new Error(respBody.error || "Error al crear reporte");
      }
      const data = await safeJsonResponse(res);
      setReports((prev) => [mapReport(data), ...prev]);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const eliminarReporte = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/reportes/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const body = await safeJsonResponse(res);
        throw new Error(body.error || "Error al eliminar reporte");
      }
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getGlobalStats = useCallback(async () => {
    try {
      const res = await apiFetch("/reportes/stats", { headers: authHeaders() });
      if (!res.ok) return null;
      return await safeJsonResponse(res);
    } catch {
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({ reports, loading, error, getReportes, buscarReportes, crearReporte, eliminarReporte, getGlobalStats }),
    [reports, loading, error, getReportes, buscarReportes, crearReporte, eliminarReporte, getGlobalStats]
  );

  return (
    <ReportContext.Provider value={value}>{children}</ReportContext.Provider>
  );
}
