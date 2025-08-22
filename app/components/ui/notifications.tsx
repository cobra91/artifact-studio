"use client";

import { createContext, ReactNode, useContext, useState } from "react";

import { Toast } from "./feedback";

interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll,
    }}>
      {children}
      
             {/* Notification Container */}
       <div className="fixed top-4 right-4 z-[9999] space-y-2">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className="transition-all duration-300"
            style={{
              transform: `translateX(${index * 10}px)`,
              zIndex: 1000 - index,
            }}
          >
            <Toast
              message={notification.message}
              type={notification.type}
              duration={notification.duration ?? 3000}
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Hook utilitaire pour les notifications rapides
export const useQuickNotifications = () => {
  const { addNotification } = useNotifications();

  return {
    success: (message: string, duration = 3000) => 
      addNotification({ message, type: "success", duration }),
    error: (message: string, duration = 5000) => 
      addNotification({ message, type: "error", duration }),
    warning: (message: string, duration = 4000) => 
      addNotification({ message, type: "warning", duration }),
    info: (message: string, duration = 3000) => 
      addNotification({ message, type: "info", duration }),
  };
};
