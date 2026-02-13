import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import NotificationSnackbar from "../elements/NotificationSnackbar";
import { clearAuthResponseMessage } from "../../../store/slicers/authSlicer/authSlicer";
import { clearWatchListResponseMessage } from "../../../store/slicers/watchListSlicer/WatchListSlicer";
export const ResponseMessage = () => {
  const dispatch = useDispatch();

  const sources = [
    {
      key: "auth",
      msg: useSelector((s) => s.authReducer.responseMessage),
      clear: clearAuthResponseMessage,
    },
    {
      key: "watchlist",
      msg: useSelector((s) => s.WatchListReducer.responseMessage),
      clear: clearWatchListResponseMessage,
    },
  ];

  const [messages, setMessages] = useState([]);

  useEffect(
    () => {
      sources.forEach(({ key, msg, clear }) => {
        if (msg && msg !== "") {
          const newItem = {
            id: `${key}-${Date.now()}-${Math.random()}`,
            message: msg,
            source: key,
          };

          setMessages((prev) => {
            const exists = prev.some(
              (m) => m.source === key && m.message === msg
            );
            if (exists) return prev;
            return [...prev, newItem];
          });

          // After 2 seconds, clear slice + remove from local list
          setTimeout(() => {
            if (clear) dispatch(clear());
            setMessages((prev) => prev.filter((m) => m.source !== key));
          }, 3000);
        }
      });
    },
    sources.map((s) => s.msg)
  ); // re-run when any slice msg changes

  return <NotificationSnackbar messages={messages} />;
};
