// context/MqttContext.js
import { createContext, useContext } from "react";

export const MqttContext = createContext({
  subscribe: () => {},
  unsubscribe: () => {},
  isConnected: false,
  activeTopics: new Set(), // ✅ default is a Set, never undefined
  unsubscribeAll: () => {},
});

export const useMqttContext = () => useContext(MqttContext);
