// // hooks/useMqttTopics.js
// import { useEffect, useRef } from "react";
// import { useMqttContext } from "../context/MqttContext";

// /**
//  * Component-scoped MQTT subscription manager.
//  *
//  * On mount:
//  *   1. Unsubscribes any currently active topics NOT in `requiredTopics`
//  *   2. Subscribes to topics in `requiredTopics` not already active
//  *
//  * On unmount:
//  *   - Unsubscribes only the topics this component subscribed
//  *
//  * @param {string[]} requiredTopics - Topics this component needs
//  */
// export const useMqttTopics = (requiredTopics = []) => {
//   const { subscribe, unsubscribe, isConnected, activeTopics } =
//     useMqttContext();
//   const ownedTopicsRef = useRef([]);

//   useEffect(() => {
//     if (!isConnected) return;

//     // ✅ Guard: if activeTopics is not yet a Set, treat it as empty
//     const currentActive =
//       activeTopics instanceof Set ? activeTopics : new Set();
//     const required = new Set(requiredTopics);

//     // Step 1: unsubscribe active topics NOT in required list
//     const toUnsub = [...currentActive].filter((t) => !required.has(t));
//     if (toUnsub.length) {
//       unsubscribe(toUnsub);
//       console.log("[useMqttTopics] Unsubscribed:", toUnsub);
//     }

//     // Step 2: subscribe to required topics not already active
//     const toSub = requiredTopics.filter((t) => !currentActive.has(t));
//     if (toSub.length) {
//       subscribe(toSub);
//       console.log("[useMqttTopics] Subscribed:", toSub);
//     }

//     ownedTopicsRef.current = toSub;

//     return () => {
//       if (ownedTopicsRef.current.length) {
//         unsubscribe(ownedTopicsRef.current);
//         console.log("[useMqttTopics] Unmount cleanup:", ownedTopicsRef.current);
//         ownedTopicsRef.current = [];
//       }
//     };
//   }, [isConnected, requiredTopics.join(",")]);
// };

// hooks/useMqttTopics.js
import { useEffect, useRef } from "react";
import { useMqttContext } from "../context/MqttContext";

export const useMqttTopics = (requiredTopics = []) => {
  const { subscribe, unsubscribe, isConnected } = useMqttContext();

  // Keep a ref of what THIS specific component asked for
  const ownedTopicsRef = useRef([]);

  useEffect(() => {
    if (!isConnected || requiredTopics.length === 0) return;

    ownedTopicsRef.current = requiredTopics;

    // 1. Subscribe to what this component needs
    subscribe(ownedTopicsRef.current);

    // 2. Unsubscribe from what this component needed on unmount
    return () => {
      if (ownedTopicsRef.current.length > 0) {
        unsubscribe(ownedTopicsRef.current);
      }
    };
  }, [isConnected, requiredTopics.join(",")]);
};
