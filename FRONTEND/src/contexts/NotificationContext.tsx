import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useSocket } from "./SocketContext";

export interface Notification {
  id: string;
  type: "chat" | "appointment" | "announcement";
  message: string;
  read?: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notif: Notification) => void;
  markAllAsRead: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { socket } = useSocket();

  const addNotification = useCallback((notif: Notification) => {
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Listen for real-time events
  useEffect(() => {
    if (!socket) return;
    const handleChat = (data: any) => {
      addNotification({
        id: data.id || `${Date.now()}-chat`,
        type: "chat",
        message: data.message || "New chat message received!",
        createdAt: data.createdAt || new Date().toISOString(),
      });
    };
    const handleAppointment = (data: any) => {
      addNotification({
        id: data.id || `${Date.now()}-appointment`,
        type: "appointment",
        message: data.message || "Appointment updated!",
        createdAt: data.createdAt || new Date().toISOString(),
      });
    };
    const handleAnnouncement = (data: any) => {
      addNotification({
        id: data.id || `${Date.now()}-announcement`,
        type: "announcement",
        message: data.message || "New announcement added!",
        createdAt: data.createdAt || new Date().toISOString(),
      });
    };
    socket.on("chat:new", handleChat);
    socket.on("appointment:updated", handleAppointment);
    socket.on("announcement:new", handleAnnouncement);
    return () => {
      socket.off("chat:new", handleChat);
      socket.off("appointment:updated", handleAppointment);
      socket.off("announcement:new", handleAnnouncement);
    };
  }, [socket, addNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAllAsRead, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};