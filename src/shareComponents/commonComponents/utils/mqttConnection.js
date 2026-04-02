// // src/hooks/useMqttClient.js
// import { useRef, useState, useCallback } from "react";
// import Paho from "paho-mqtt";
// import { secureRandomString } from "../../../utils/formatters";

// export const useMqttClient = ({
//   onMessageArrivedCallback,
//   onConnectionLostCallback,
// }) => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [subscribedTopics, setSubscribedTopics] = useState([]);
//   const clientRef = useRef(null);
//   const randomString = secureRandomString();

//   const subscribeToTopics = useCallback(
//     (topics = []) => {
//       const client = clientRef.current;

//       if (!client || !client.isConnected()) return;

//       topics.forEach((topic) => {
//         if (!subscribedTopics.includes(topic)) {
//           clientRef.current.subscribe(topic, {
//             qos: 0,
//             onSuccess: () => {
//               console.log(`Subscribed to topic: ${topic}`);
//               setSubscribedTopics((prev) =>
//                 Array.from(new Set([...prev, topic]))
//               );
//             },
//             onFailure: (err) => {
//               console.error(`Failed to subscribe: ${topic}`, err?.errorMessage);
//             },
//           });
//         }
//       });
//     },
//     [subscribedTopics]
//   );

//   const unsubscribeFromTopics = useCallback((topics = []) => {
//     const client = clientRef.current;

//     if (!client || !client.isConnected()) return;

//     topics.forEach((topic) => {
//       client.unsubscribe(topic, {
//         onSuccess: () => {
//           console.log(`Unsubscribed from topic: ${topic}`);
//           setSubscribedTopics((prev) => prev.filter((t) => t !== topic));
//         },
//         onFailure: (err) => {
//           console.error(`Failed to unsubscribe: ${topic}`, err?.errorMessage);
//         },
//       });
//     });
//   }, []);

//   const onMessageArrived = useCallback(
//     (message) => {
//       try {
//         const parsed = JSON.parse(message.payloadString);
//         if (parsed.payload.message === "TREASURY_MANAGEMENT_KIBOR")
//           console.log("MQTT message arrived:", parsed);
//         if (onMessageArrivedCallback) onMessageArrivedCallback(parsed);
//       } catch (err) {
//         console.error("Failed to parse message:", err);
//       }
//     },
//     [onMessageArrivedCallback]
//   );

//   const onConnectionLost = useCallback(
//     (resObj) => {
//       console.warn("MQTT connection lost:", resObj);
//       setIsConnected(false);
//       setSubscribedTopics([]);
//     },
//     [onConnectionLostCallback]
//   );

//   const connectToMqtt = useCallback(
//     ({ subscribeID, userID }) => {
//       if (!subscribeID || clientRef.current?.isConnected()) {
//         console.warn(
//           "Already connected or missing subscribeID",
//           subscribeID,
//           clientRef.current.isConnected()
//         );
//         return;
//       }

//       const newClientID = `${randomString}`;
//       clientRef.current = new Paho.Client(
//         import.meta.env.VITE_MQTT_HOST,
//         Number(import.meta.env.VITE_MQTT_PORT),
//         newClientID
//       );

//       clientRef.current.onConnectionLost = onConnectionLost;
//       clientRef.current.onMessageArrived = onMessageArrived;

//       clientRef.current.onConnected = () => {
//         console.log("MQTT connected successfully");
//         setIsConnected(true);
//         subscribeToTopics([subscribeID]);
//       };

//       clientRef.current.connect({
//         onSuccess: () => console.log("MQTT connecting..."),
//         onFailure: (err) => {
//           console.log("Connection failed:", err.errorMessage);
//           setIsConnected(false);
//         },
//         reconnect: true,
//         userName: import.meta.env.VITE_MQTT_USERNAME,
//         password: import.meta.env.VITE_MQTT_PASSWORD,
//         cleanSession: true,
//         useSSL: false,
//       });
//     },
//     [onMessageArrived, onConnectionLost, randomString, subscribeToTopics]
//   );

//   // ✅ Derive activeTopics as a Set from the existing subscribedTopics array.
//   // This is what useMqttTopics reads via context to know what's currently live.
//   const activeTopics = new Set(subscribedTopics);

//   return {
//     client: clientRef,
//     isConnected,
//     connectToMqtt,
//     subscribeToTopics,
//     unsubscribeFromTopics,
//     onMessageArrived,
//     onConnectionLost,
//     setSubscribedTopics,
//     activeTopics, // ✅ added — always a Set, never undefined
//   };
// };

// // src/hooks/useMqttClient.js
// import { useRef, useState, useCallback } from "react";
// import Paho from "paho-mqtt";
// import { secureRandomString } from "../../../utils/formatters";

// export const useMqttClient = ({
//   onMessageArrivedCallback,
//   onConnectionLostCallback,
// }) => {
//   const [isConnected, setIsConnected] = useState(false);

//   // ✅ Use a ref for the live set — no stale closures, no re-render loops
//   const subscribedTopicsRef = useRef(new Set());

//   // ✅ Keep a parallel state Set only for triggering context re-renders
//   const [activeTopics, setActiveTopics] = useState(new Set());

//   const clientRef = useRef(null);
//   const randomString = useRef(secureRandomString()).current; // ✅ stable across renders

//   const subscribeToTopics = useCallback((topics = []) => {
//     const client = clientRef.current;
//     if (!client || !client.isConnected()) return;

//     topics.forEach((topic) => {
//       // ✅ Read from ref — always current, never stale
//       if (subscribedTopicsRef.current.has(topic)) {
//         console.log(`[MQTT] Already subscribed, skipping: ${topic}`);
//         return;
//       }

//       client.subscribe(topic, {
//         qos: 0,
//         onSuccess: () => {
//           console.log(`[MQTT] Subscribed: ${topic}`);
//           subscribedTopicsRef.current.add(topic);
//           // ✅ New Set reference so context consumers re-render
//           setActiveTopics(new Set(subscribedTopicsRef.current));
//         },
//         onFailure: (err) => {
//           console.error(
//             `[MQTT] Failed to subscribe: ${topic}`,
//             err?.errorMessage
//           );
//         },
//       });
//     });
//   }, []); // ✅ no deps — reads ref directly, always stable

//   const unsubscribeFromTopics = useCallback((topics = []) => {
//     const client = clientRef.current;
//     if (!client || !client.isConnected()) return;

//     topics.forEach((topic) => {
//       if (!subscribedTopicsRef.current.has(topic)) {
//         console.log(`[MQTT] Not subscribed, skipping unsubscribe: ${topic}`);
//         return;
//       }

//       client.unsubscribe(topic, {
//         onSuccess: () => {
//           console.log(`[MQTT] Unsubscribed: ${topic}`);
//           subscribedTopicsRef.current.delete(topic);
//           // ✅ New Set reference so context consumers re-render
//           setActiveTopics(new Set(subscribedTopicsRef.current));
//         },
//         onFailure: (err) => {
//           console.error(
//             `[MQTT] Failed to unsubscribe: ${topic}`,
//             err?.errorMessage
//           );
//         },
//       });
//     });
//   }, []); // ✅ no deps — reads ref directly, always stable

//   const onMessageArrived = useCallback(
//     (message) => {
//       try {
//         const parsed = JSON.parse(message.payloadString);
//         if (onMessageArrivedCallback) onMessageArrivedCallback(parsed);
//       } catch (err) {
//         console.error("Failed to parse message:", err);
//       }
//     },
//     [onMessageArrivedCallback]
//   );

//   const onConnectionLost = useCallback(
//     (resObj) => {
//       console.warn("MQTT connection lost:", resObj);
//       setIsConnected(false);
//       subscribedTopicsRef.current.clear();
//       setActiveTopics(new Set());
//     },
//     [onConnectionLostCallback]
//   );

//   const connectToMqtt = useCallback(
//     ({ subscribeID, userID }) => {
//       if (!subscribeID || clientRef.current?.isConnected()) {
//         console.warn("Already connected or missing subscribeID");
//         return;
//       }

//       clientRef.current = new Paho.Client(
//         import.meta.env.VITE_MQTT_HOST,
//         Number(import.meta.env.VITE_MQTT_PORT),
//         randomString
//       );

//       clientRef.current.onConnectionLost = onConnectionLost;
//       clientRef.current.onMessageArrived = onMessageArrived;

//       clientRef.current.onConnected = () => {
//         console.log("MQTT connected successfully");
//         setIsConnected(true);
//         subscribeToTopics([subscribeID]);
//       };

//       clientRef.current.connect({
//         onSuccess: () => console.log("MQTT connecting..."),
//         onFailure: (err) => {
//           console.log("Connection failed:", err.errorMessage);
//           setIsConnected(false);
//         },
//         reconnect: true,
//         userName: import.meta.env.VITE_MQTT_USERNAME,
//         password: import.meta.env.VITE_MQTT_PASSWORD,
//         cleanSession: true,
//         useSSL: false,
//       });
//     },
//     [onMessageArrived, onConnectionLost, subscribeToTopics, randomString]
//   );

//   return {
//     client: clientRef,
//     isConnected,
//     connectToMqtt,
//     subscribeToTopics,
//     unsubscribeFromTopics,
//     onMessageArrived,
//     onConnectionLost,
//     activeTopics, // ✅ always a Set, always fresh
//   };
// };

// src/hooks/useMqttClient.js
import { useRef, useState, useCallback } from "react";
import Paho from "paho-mqtt";
import { secureRandomString } from "../../../utils/formatters";

export const useMqttClient = ({
  onMessageArrivedCallback,
  onConnectionLostCallback,
}) => {
  const [isConnected, setIsConnected] = useState(false);

  // 1. The Source of Truth for subscriptions
  const topicCounts = useRef({}); // e.g., { "SBL_REAL_TIME_FEED_TREASURY": 2 }
  const [activeTopics, setActiveTopics] = useState(new Set());

  const clientRef = useRef(null);
  const randomString = secureRandomString();

  const subscribeToTopics = useCallback((topics = []) => {
    const client = clientRef.current;
    if (!client || !client.isConnected()) return;

    topics.forEach((topic) => {
      // Get current count, default to 0
      const currentCount = topicCounts.current[topic] || 0;

      // Increment the counter synchronously
      topicCounts.current[topic] = currentCount + 1;

      // Only send network request if this is the FIRST component asking for it
      if (currentCount === 0) {
        client.subscribe(topic, {
          qos: 0,
          onSuccess: () => {
            console.log(`Subscribed to topic: ${topic}`);
            setActiveTopics((prev) => new Set([...prev, topic]));
          },
          onFailure: (err) => {
            console.error(`Failed to subscribe: ${topic}`, err?.errorMessage);
            // Revert count on failure
            topicCounts.current[topic] -= 1;
          },
        });
      }
    });
  }, []);

  const unsubscribeFromTopics = useCallback((topics = []) => {
    const client = clientRef.current;
    if (!client || !client.isConnected()) return;

    topics.forEach((topic) => {
      const currentCount = topicCounts.current[topic] || 0;

      // Decrement the counter
      if (currentCount > 0) {
        topicCounts.current[topic] = currentCount - 1;
      }

      // Only send network request if NO components need this topic anymore
      if (topicCounts.current[topic] === 0) {
        client.unsubscribe(topic, {
          onSuccess: () => {
            console.log(`Unsubscribed from topic: ${topic}`);
            setActiveTopics((prev) => {
              const next = new Set(prev);
              next.delete(topic);
              return next;
            });
          },
          onFailure: (err) => {
            console.error(`Failed to unsubscribe: ${topic}`, err?.errorMessage);
          },
        });
        // Clean up the key
        delete topicCounts.current[topic];
      }
    });
  }, []);

  const onMessageArrived = useCallback(
    (message) => {
      try {
        const parsed = JSON.parse(message.payloadString);
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
      // Reset everything on disconnect
      topicCounts.current = {};
      setActiveTopics(new Set());
    },
    [onConnectionLostCallback]
  );

  const connectToMqtt = useCallback(
    ({ subscribeID, userID }) => {
      if (!subscribeID || clientRef.current?.isConnected()) {
        console.warn("Already connected or missing subscribeID");
        return;
      }

      clientRef.current = new Paho.Client(
        import.meta.env.VITE_MQTT_HOST,
        Number(import.meta.env.VITE_MQTT_PORT),
        randomString
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
        // useSSL: false,
        useSSL:
          import.meta.env.VITE_MQTT_PORT === "8883" &&
          import.meta.env.VITE_MQTT_HOST === "Soneritrade.tresmark.com",
      });
    },
    [onMessageArrived, onConnectionLost, subscribeToTopics, randomString]
  );

  return {
    client: clientRef,
    isConnected,
    connectToMqtt,
    subscribeToTopics,
    unsubscribeFromTopics,
    onMessageArrived,
    onConnectionLost,
    activeTopics, // Still exposed for the UI if needed
  };
};
