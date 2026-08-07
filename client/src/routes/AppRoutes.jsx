import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import ForgotPasswordPage from "../pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../pages/ResetPasswordPage.jsx";
import OnboardingPage from "../pages/OnboardingPage.jsx";
import AdminDashboardPage from "../pages/AdminDashboardPage.jsx";
import StudentDashboardPage from "../pages/StudentDashboardPage.jsx";
import NewReportPage from "../pages/NewReportPage.jsx";
import ReportDetailPage from "../pages/ReportDetailPage.jsx";
import ReportesPage from "../pages/ReportesPage.jsx";
import NotificationsPage from "../pages/NotificationsPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import MfaSetupPage from "../pages/MfaSetupPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { ReportProvider } from "../context/ReportContext.jsx";

const ROLES_ADMIN = [
  "admin", "prorector", "ti_soporte", "bibliotecario", "conserje",
  "mantenimiento", "secretaria", "bienestar universitario", "financiero",
];

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/ingreso" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route element={<ProtectedRoute allowedRoles={ROLES_ADMIN} />}>
        <Route path="/dashboard-admin" element={<AdminDashboardPage />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["estudiante"]} />}>
        <Route path="/dashboard-estudiante" element={<StudentDashboardPage />} />
        <Route path="/nuevo-reporte" element={<NewReportPage />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={[...ROLES_ADMIN, "estudiante"]} />}>
        <Route path="/reportes" element={<ReportesPage />} />
        <Route path="/reporte/:id" element={<ReportDetailPage />} />
        <Route path="/notificaciones" element={<NotificationsPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/mfa/setup" element={<MfaSetupPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
