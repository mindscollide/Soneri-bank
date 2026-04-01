// src/hooks/useMqttClient.js
import { useRef, useState, useCallback } from "react";
import Paho from "paho-mqtt";
import { secureRandomString } from "../../../utils/formatters";

export const useMqttClient = ({
  onMessageArrivedCallback,
  onConnectionLostCallback,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [subscribedTopics, setSubscribedTopics] = useState([]);
  const clientRef = useRef(null);
  const randomString = secureRandomString();

  const subscribeToTopics = useCallback(
    (topics = []) => {
      const client = clientRef.current;

      if (!client || !client.isConnected()) return;

      topics.forEach((topic) => {
        if (!subscribedTopics.includes(topic)) {
          clientRef.current.subscribe(topic, {
            qos: 0,
            onSuccess: () => {
              console.log(`Subscribed to topic: ${topic}`);
              setSubscribedTopics((prev) =>
                Array.from(new Set([...prev, topic]))
              );
            },
            onFailure: (err) => {
              console.error(`Failed to subscribe: ${topic}`, err?.errorMessage);
            },
          });
        }
      });
    },
    [subscribedTopics]
  );

  const unsubscribeFromTopics = useCallback((topics = []) => {
    const client = clientRef.current;

    if (!client || !client.isConnected()) return;

    topics.forEach((topic) => {
      client.unsubscribe(topic, {
        onSuccess: () => {
          console.log(`Unsubscribed from topic: ${topic}`);
          setSubscribedTopics((prev) => prev.filter((t) => t !== topic));
        },
        onFailure: (err) => {
          console.error(`Failed to unsubscribe: ${topic}`, err?.errorMessage);
        },
      });
    });
  }, []);

  const onMessageArrived = useCallback(
    (message) => {
      try {
        const parsed = JSON.parse(message.payloadString);
        if (parsed.payload.message === "TREASURY_MANAGEMENT_KIBOR")
          console.log("MQTT message arrived:", parsed);
        if (onMessageArrivedCallback) onMessageArrivedCallback(parsed);
      } catch (err) {
        console.error("Failed to parse message:", err);
      }
    },
    [onMessageArrivedCallback]
  );

  const onConnectionLost = useCallback(
    (resObj) => {
      console.warn("MQTT connection lost:", resObj);
      setIsConnected(false);
      setSubscribedTopics([]);
    },
    [onConnectionLostCallback]
  );

  const connectToMqtt = useCallback(
    ({ subscribeID, userID }) => {
      if (!subscribeID || clientRef.current?.isConnected()) {
        console.warn(
          "Already connected or missing subscribeID",
          subscribeID,
          clientRef.current.isConnected()
        );
        return;
      }

      const newClientID = `${randomString}`;
      clientRef.current = new Paho.Client(
        import.meta.env.VITE_MQTT_HOST,
        Number(import.meta.env.VITE_MQTT_PORT),
        newClientID
      );

      clientRef.current.onConnectionLost = onConnectionLost;
      clientRef.current.onMessageArrived = onMessageArrived;

      clientRef.current.onConnected = () => {
        console.log("MQTT connected successfully");
        setIsConnected(true);
        subscribeToTopics([subscribeID]);
      };

      clientRef.current.connect({
        onSuccess: () => console.log("MQTT connecting..."),
        onFailure: (err) => {
          console.log("Connection failed:", err.errorMessage);
          setIsConnected(false);
        },
        reconnect: true,
        userName: import.meta.env.VITE_MQTT_USERNAME,
        password: import.meta.env.VITE_MQTT_PASSWORD,
        cleanSession: true,
        useSSL: false,
      });
    },
    [onMessageArrived, onConnectionLost, randomString, subscribeToTopics]
  );

  // ✅ Derive activeTopics as a Set from the existing subscribedTopics array.
  // This is what useMqttTopics reads via context to know what's currently live.
  const activeTopics = new Set(subscribedTopics);

  return {
    client: clientRef,
    isConnected,
    connectToMqtt,
    subscribeToTopics,
    unsubscribeFromTopics,
    onMessageArrived,
    onConnectionLost,
    setSubscribedTopics,
    activeTopics, // ✅ added — always a Set, never undefined
  };
};
