import { useEffect, useRef } from "react";
import { useMqttContext } from "../context/MqttContext";

export const useMqttTopics = (requiredTopics = []) => {
  const { subscribe, unsubscribe, isConnected } = useMqttContext();

  const ownedTopicsRef = useRef([]);

  useEffect(() => {
    if (!isConnected || requiredTopics.length === 0) return;

    ownedTopicsRef.current = requiredTopics;
    subscribe(ownedTopicsRef.current);

    return () => {
      if (ownedTopicsRef.current.length > 0) {
        unsubscribe(ownedTopicsRef.current);
      }
    };
  }, [isConnected, requiredTopics.join(",")]);
};
