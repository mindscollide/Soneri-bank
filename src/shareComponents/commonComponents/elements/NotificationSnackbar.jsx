import React, { useEffect, useRef } from "react";
import { notification } from "antd";
import IconElement from "./IconElement/IconElement";

const NotificationSnackbar = ({ messages }) => {
  const [api, contextHolder] = notification.useNotification();
  const queueRef = useRef([]);
  const shownKeys = useRef(new Set()); // prevent duplicates
  const maxVisible = 3; // threshold

  useEffect(() => {
    if (messages?.length) {
      messages.forEach((msg) => {
        const key = msg.id || `${msg.message}-${msg.timestamp || Date.now()}`;
        // if (shownKeys.current.has(key)) return; // skip duplicate

        shownKeys.current.add(key);

        const newNotif = {
          key,
          message: msg.message,
          description: msg.description,
          className: "custom-notification-snackbar",
          closeIcon: <IconElement iconClass="icon-close" />,
          duration: 3,
          onClose: () => {
            queueRef.current = queueRef.current.filter((n) => n.key !== key);
            shownKeys.current.delete(key);
          },
        };

        queueRef.current.push(newNotif);

        // keep only maxVisible
        if (queueRef.current.length > maxVisible) {
          const removed = queueRef.current.shift();
          api.destroy(removed.key);
        }

        api.open(newNotif);
      });
    }
  }, [messages]);

  return <>{contextHolder}</>;
};

export default NotificationSnackbar;
