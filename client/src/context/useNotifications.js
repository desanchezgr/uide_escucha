import { useContext } from "react";
import { NotificationContext } from "./notificationContext.js";

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications debe usarse dentro de NotificationProvider");
  return ctx;
}
