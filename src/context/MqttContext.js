// src/context/MqttContext.js
import { createContext, useContext } from "react";

export const MqttContext = createContext({ unsubscribeAll: () => {} });
export const useMqtt = () => useContext(MqttContext);
