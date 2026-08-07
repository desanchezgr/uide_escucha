import { Navigate, Outlet, useLocation } from "react-router-dom";

const ROLES_ADMIN = [
  "admin", "prorector", "ti_soporte", "bibliotecario", "conserje",
  "mantenimiento", "secretaria", "bienestar universitario", "financiero",
];

function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation();
  const role = sessionStorage.getItem("userRole");

  if (!role) {
    return <Navigate to="/ingreso" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(role)) {
    if (ROLES_ADMIN.includes(role)) {
      return <Navigate to="/dashboard-admin" replace />;
    }
    if (role === "estudiante") {
      return <Navigate to="/dashboard-estudiante" replace />;
    }
    return <Navigate to="/ingreso" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
