
// src/hooks/useMqttClient.js
import { useRef, useState, useCallback, useEffect } from "react";
import Paho from "paho-mqtt";
import { secureRandomString } from "../../../utils/formatters";
import { decryptField } from "../../../utils/encryption";

// Lifecycle logs
const mqttLog = (event, details) => {
  const t = new Date();
  const time = `${t.toLocaleTimeString("en-GB")}.${String(
    t.getMilliseconds(),
  ).padStart(3, "0")}`;

  console.log(`[MQTT ${time}] ${event}`, details ?? "");
};

export const useMqttClient = ({
  onMessageArrivedCallback,
  onConnectionLostCallback,
} = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [activeTopics, setActiveTopics] = useState(new Set());

  // Connection lifecycle bookkeeping
  const connectedAtRef = useRef(null);
  const reconnectCountRef = useRef(0);

  // Subscription source of truth
  const topicCounts = useRef({});

  const clientRef = useRef(null);

  // Prevent duplicate connection initialization
  const isConnectingRef = useRef(false);

  // ClientId generated only once
  const clientIdRef = useRef(null);
  if (!clientIdRef.current) {
    clientIdRef.current = secureRandomString();
  }

  // Latest callbacks refs
  const messageCbRef = useRef(onMessageArrivedCallback);
  const connectionLostCbRef = useRef(onConnectionLostCallback);

  messageCbRef.current = onMessageArrivedCallback;
  connectionLostCbRef.current = onConnectionLostCallback;

  // Base topic
  const baseTopicRef = useRef(null);
  const baseTopicRegisteredRef = useRef(false);

  const addActiveTopic = (topic) =>
    setActiveTopics((prev) => new Set([...prev, topic]));

  const removeActiveTopic = (topic) =>
    setActiveTopics((prev) => {
      const next = new Set(prev);
      next.delete(topic);
      return next;
    });

  // Actual broker subscribe request
  const sendSubscribe = useCallback((topic) => {
    const client = clientRef.current;
    if (!client || !client.isConnected()) return;

    client.subscribe(topic, {
      qos: 0,
      onSuccess: () => {
        console.log(`Subscribed to topic: ${topic}`);
        addActiveTopic(topic);
      },
      onFailure: (err) => {
        console.error(`Failed to subscribe: ${topic}`, err?.errorMessage);
      },
    });
  }, []);

  // Resubscribe all tracked topics after reconnect
  const resubscribeAll = useCallback(() => {
    Object.keys(topicCounts.current).forEach((topic) => {
      if (topicCounts.current[topic] > 0) {
        sendSubscribe(topic);
      }
    });
  }, [sendSubscribe]);

  const subscribeToTopics = useCallback(
    (topics = []) => {
      const client = clientRef.current;

      topics.forEach((topic) => {
        const currentCount = topicCounts.current[topic] || 0;
        topicCounts.current[topic] = currentCount + 1;

        if (currentCount === 0 && client && client.isConnected()) {
          sendSubscribe(topic);
        }
      });
    },
    [sendSubscribe],
  );

  const unsubscribeFromTopics = useCallback((topics = []) => {
    const client = clientRef.current;

    topics.forEach((topic) => {
      const currentCount = topicCounts.current[topic] || 0;
      if (currentCount === 0) return;

      topicCounts.current[topic] = currentCount - 1;

      if (topicCounts.current[topic] === 0) {
        delete topicCounts.current[topic];

        if (client && client.isConnected()) {
          client.unsubscribe(topic, {
            onSuccess: () => {
              console.log(`Unsubscribed from topic: ${topic}`);
              removeActiveTopic(topic);
            },
            onFailure: (err) => {
              console.error(
                `Failed to unsubscribe: ${topic}`,
                err?.errorMessage,
              );
            },
          });
        } else {
          removeActiveTopic(topic);
        }
      }
    });
  }, []);

  const onMessageArrived = useCallback((message) => {
    try {
      const parsed = JSON.parse(message.payloadString);

      // No console logging for every real-time message
      messageCbRef.current?.(parsed);
    } catch (err) {
      console.error("Failed to parse message:", err);
    }
  }, []);

  const onConnectionLost = useCallback((resObj) => {
    const upFor = connectedAtRef.current
      ? `${((Date.now() - connectedAtRef.current) / 1000).toFixed(1)}s`
      : "n/a";

    mqttLog("DISCONNECTED (connection lost)", {
      errorCode: resObj?.errorCode,
      errorMessage: resObj?.errorMessage,
      wasConnectedFor: upFor,
      willAutoReconnect: true,
    });

    connectedAtRef.current = null;
    setIsConnected(false);

    // Clear UI topics but preserve topicCounts for reconnect
    setActiveTopics(new Set());

    connectionLostCbRef.current?.(resObj);
  }, []);

  // Connect to MQTT
  const connectToMqtt = useCallback(
    async ({ subscribeID } = {}) => {
      if (!subscribeID) {
        console.warn("Missing subscribeID");
        return;
      }

      // Prevent duplicate clients and concurrent initialization
      if (clientRef.current || isConnectingRef.current) {
        console.warn("MQTT client already exists or connecting, skipping");
        return;
      }

      // Lock immediately before async decryption
      isConnectingRef.current = true;

      try {
        // Decrypt MQTT credentials
        const userName = await decryptField(
          import.meta.env.VITE_MQTT_USERNAME,
        );

        const password = await decryptField(
          import.meta.env.VITE_MQTT_PASSWORD,
        );

        baseTopicRef.current = subscribeID;

        mqttLog("CONNECTING", {
          host: import.meta.env.VITE_MQTT_HOST,
          port: Number(import.meta.env.VITE_MQTT_PORT),
          clientId: clientIdRef.current,
          baseTopic: subscribeID,
        });

        const client = new Paho.Client(
          import.meta.env.VITE_MQTT_HOST,
          Number(import.meta.env.VITE_MQTT_PORT),
          clientIdRef.current,
        );

        client.onConnectionLost = onConnectionLost;
        client.onMessageArrived = onMessageArrived;

        // Called on every successful connect and auto-reconnect
        client.onConnected = (reconnect) => {
          isConnectingRef.current = false;

          connectedAtRef.current = Date.now();

          if (reconnect) {
            reconnectCountRef.current += 1;
          }

          mqttLog(reconnect ? "RECONNECTED" : "CONNECTED", {
            clientId: clientIdRef.current,
            reconnectCount: reconnectCountRef.current,
            topicsToResubscribe: Object.keys(topicCounts.current),
          });

          setIsConnected(true);

          // Register base topic only once
          if (!baseTopicRegisteredRef.current && baseTopicRef.current) {
            topicCounts.current[baseTopicRef.current] =
              (topicCounts.current[baseTopicRef.current] || 0) + 1;

            baseTopicRegisteredRef.current = true;
          }

          // Resubscribe all topics
          resubscribeAll();
        };

        clientRef.current = client;

        client.connect({
          onFailure: (err) => {
            isConnectingRef.current = false;

            mqttLog("CONNECT FAILED", {
              errorCode: err?.errorCode,
              errorMessage: err?.errorMessage,
            });

            setIsConnected(false);

            try {
              client.disconnect();
            } catch {
              // Client may not be connected
            }

            if (clientRef.current === client) {
              clientRef.current = null;
            }
          },

          reconnect: true,
          keepAliveInterval: 20,
          timeout: 10,
          userName,
          password,
          cleanSession: true,
          useSSL: import.meta.env.VITE_MQTT_PORT === "8883",
        });
      } catch (error) {
        isConnectingRef.current = false;

        console.error("MQTT connection initialization failed:", error);

        setIsConnected(false);
        clientRef.current = null;
      }
    },
    [onMessageArrived, onConnectionLost, resubscribeAll],
  );

  // Manual disconnect
  const disconnectMqtt = useCallback(() => {
    const client = clientRef.current;

    isConnectingRef.current = false;

    if (client) {
      mqttLog("DISCONNECTING (disconnectMqtt called)");

      try {
        client.disconnect();
      } catch {
        // Already disconnected
      }
    }

    clientRef.current = null;
    baseTopicRef.current = null;
    baseTopicRegisteredRef.current = false;
    topicCounts.current = {};

    setIsConnected(false);
    setActiveTopics(new Set());
  }, []);

  // Component unmount handling
  // StrictMode cleanup delay preserved
  const disconnectTimerRef = useRef(null);

  useEffect(() => {
    if (disconnectTimerRef.current) {
      clearTimeout(disconnectTimerRef.current);
      disconnectTimerRef.current = null;
    }

    return () => {
      disconnectTimerRef.current = setTimeout(() => {
        disconnectTimerRef.current = null;

        const client = clientRef.current;

        isConnectingRef.current = false;

        if (client) {
          mqttLog("DISCONNECTING (component unmounted)");

          try {
            client.disconnect();
          } catch {
            // Already disconnected
          }

          clientRef.current = null;
        }
      }, 0);
    };
  }, []);

  return {
    client: clientRef,
    isConnected,
    connectToMqtt,
    disconnectMqtt,
    subscribeToTopics,
    unsubscribeFromTopics,
    onMessageArrived,
    onConnectionLost,
    activeTopics,
  };
};
