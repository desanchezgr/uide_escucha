import { useCallback, useEffect, useMemo, useState } from "react";
import { NotificationContext } from "./notificationContext.js";
import { apiFetch } from "../utils/api.js";

function authHeaders() {
  const token = sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiFetch("/notificaciones", {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    try {
      const res = await apiFetch("/notificaciones/no-leidas", {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch {
      //
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      await apiFetch(`/notificaciones/${id}/leer`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      //
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiFetch("/notificaciones/leer-todas", {
        method: "PATCH",
        headers: authHeaders(),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
      setUnreadCount(0);
    } catch {
      //
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      fetchUnreadCount,
      markAsRead,
      markAllAsRead,
    }),
    [notifications, unreadCount, loading, fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}


