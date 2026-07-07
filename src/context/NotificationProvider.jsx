import React, { createContext, useContext, useState, useCallback } from "react";
import NotificationSnackbar from "../shareComponents/commonComponents/elements/NotificationSnackbar";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showMessage = useCallback((msgText) => {
    const newMsg = {
      id: Date.now(), // Unique ID for the snackbar logic
      message: msgText,
      description: "", // Optional
    };

    // Update to an array so the Snackbar's useEffect triggers correctly
    setNotifications((prev) => [...prev, newMsg]);

    // Clean up after the duration
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== newMsg.id));
    }, 4000);
  }, []);

  return (
    <NotificationContext.Provider value={{ showMessage }}>
      {children}
      {/* Changed 'message' to 'messages' to match the snackbar component */}
      <NotificationSnackbar messages={notifications} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
