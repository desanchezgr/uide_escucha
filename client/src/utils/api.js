const API_BASE = "/api";

function getToken() {
  return sessionStorage.getItem("token");
}

function handleUnauthorized() {
  sessionStorage.clear();
  if (window.location.pathname !== "/ingreso") {
    window.location.href = "/ingreso";
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error("Tu sesión expiró. Inicia sesión nuevamente.");
  }
  return res;
}

export { API_BASE };
