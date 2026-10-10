// src/hooks/useMqttClient.js
import { useRef, useState, useCallback, useEffect } from "react";
import Paho from "paho-mqtt";
import { secureRandomString } from "../../../utils/formatters";

// Lifecycle logs (connect / reconnect / lost / failed / disconnect) with a
// timestamp, so flapping connections are easy to read in the console.
// NOTE: main.jsx silences console.* unless VITE_ENV is "DEV" or "UAT".
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

  // Connection lifecycle bookkeeping (sirf logging ke liye)
  const connectedAtRef = useRef(null); // last successful connect ka waqt
  const reconnectCountRef = useRef(0);
  const [activeTopics, setActiveTopics] = useState(new Set());

  // Source of truth for subscriptions, e.g. { "SBL_REAL_TIME_FEED_TREASURY": 2 }
  // NOTE: ye connection lost par reset NAHI hota, taake reconnect ke baad
  // saare topics dobara subscribe ho saken.
  const topicCounts = useRef({});

  const clientRef = useRef(null);

  // 1. ClientId sirf EK baar generate hota hai (har render par nahi)
  const clientIdRef = useRef(null);
  if (!clientIdRef.current) clientIdRef.current = secureRandomString();

  // 2. Latest callbacks ref mein, taake stale closure ka masla na ho
  const messageCbRef = useRef(onMessageArrivedCallback);
  const connectionLostCbRef = useRef(onConnectionLostCallback);
  messageCbRef.current = onMessageArrivedCallback;
  connectionLostCbRef.current = onConnectionLostCallback;

  // Base topic (subscribeID) jo connect ke waqt milta hai
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

  // Broker ko actual SUBSCRIBE request bhejta hai
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

  // Reconnect ke baad saare tracked topics dobara subscribe karo
  const resubscribeAll = useCallback(() => {
    Object.keys(topicCounts.current).forEach((topic) => {
      if (topicCounts.current[topic] > 0) sendSubscribe(topic);
    });
  }, [sendSubscribe]);

  const subscribeToTopics = useCallback(
    (topics = []) => {
      const client = clientRef.current;

      topics.forEach((topic) => {
        const currentCount = topicCounts.current[topic] || 0;
        topicCounts.current[topic] = currentCount + 1;

        // Network request sirf pehle component ke liye, aur sirf jab connected ho.
        // Agar connected nahi hai to count save rehta hai aur onConnected
        // mein resubscribeAll() isay subscribe kar dega.
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
      // Real-time feed mein har message par console.log NAHI karna (tab slow hota hai)
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
    // UI ke liye active topics clear, lekin topicCounts SAFE rakhe hain
    // taake reconnect par resubscribeAll() kaam kar sake.
    setActiveTopics(new Set());
    connectionLostCbRef.current?.(resObj);
  }, []);

  const connectToMqtt = useCallback(
    ({ subscribeID } = {}) => {
      if (!subscribeID) {
        console.warn("Missing subscribeID");
        return;
      }

      // Client pehle se bana hua hai (connected ho ya Paho auto-reconnect kar raha ho)
      // to naya client NAHI banana, warna duplicate connections ek doosre ko kick karte hain.
      if (clientRef.current) {
        console.warn("MQTT client already exists, skipping new connection");
        return;
      }

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

      // Ye har successful connect AUR har auto-reconnect par call hota hai
      client.onConnected = (reconnect) => {
        connectedAtRef.current = Date.now();
        if (reconnect) reconnectCountRef.current += 1;
        mqttLog(reconnect ? "RECONNECTED" : "CONNECTED", {
          clientId: clientIdRef.current,
          reconnectCount: reconnectCountRef.current,
          topicsToResubscribe: Object.keys(topicCounts.current),
        });
        setIsConnected(true);

        // Base topic ko sirf ek baar count mein register karo
        if (!baseTopicRegisteredRef.current && baseTopicRef.current) {
          topicCounts.current[baseTopicRef.current] =
            (topicCounts.current[baseTopicRef.current] || 0) + 1;
          baseTopicRegisteredRef.current = true;
        }

        // Har connect/reconnect par saare topics dobara subscribe
        resubscribeAll();
      };

      clientRef.current = client;

      client.connect({
        onFailure: (err) => {
          mqttLog("CONNECT FAILED", {
            errorCode: err?.errorCode,
            errorMessage: err?.errorMessage,
          });
          setIsConnected(false);
          // Pehli connect fail ho to Paho retry nahi karta,
          // isliye client clear karo taake dobara connectToMqtt call ho sake.
          try {
            client.disconnect();
          } catch {
            // client abhi connected nahi tha — disconnect throw karna normal hai
          }
          clientRef.current = null;
        },
        reconnect: true,
        keepAliveInterval: 20, // load balancer/nginx idle timeout se chota
        timeout: 10,
        userName: import.meta.env.VITE_MQTT_USERNAME,
        password: import.meta.env.VITE_MQTT_PASSWORD,
        // Hum khud resubscribe karte hain, aur ClientId per-session hai,
        // is liye cleanSession true rakhna behtar hai (broker par orphan sessions nahi bantay).
        cleanSession: true,
        useSSL: import.meta.env.VITE_MQTT_PORT === "8883",
      });
    },
    [onMessageArrived, onConnectionLost, resubscribeAll],
  );

  const disconnectMqtt = useCallback(() => {
    const client = clientRef.current;
    if (client) {
      mqttLog("DISCONNECTING (disconnectMqtt called)");
      try {
        client.disconnect(); // is se auto-reconnect bhi band ho jata hai
      } catch {
        // already disconnected
      }
    }
    clientRef.current = null;
    baseTopicRef.current = null;
    baseTopicRegisteredRef.current = false;
    topicCounts.current = {};
    setIsConnected(false);
    setActiveTopics(new Set());
  }, []);

  // Component unmount par connection band karo.
  // NOTE: StrictMode (dev) effects ko mount -> cleanup -> mount chalata hai.
  // Agar cleanup foran disconnect + clientRef=null kar de, to connect abhi
  // in-flight hota hai (disconnect throw karta hai), Dashboard ka hasFetched
  // guard dobara connectToMqtt nahi chalata, aur jab connection complete hota
  // hai to sendSubscribe/subscribeToTopics ko clientRef null milta hai —
  // yani connected dikhta hai magar koi topic subscribe nahi hota.
  // Isliye disconnect ek tick delay hota hai aur remount par cancel ho jata hai;
  // asli unmount (logout etc.) par ye chal jata hai.
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
        if (client) {
          mqttLog("DISCONNECTING (component unmounted)");
          try {
            client.disconnect();
          } catch {
            // already disconnected
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
