import React, { lazy, Suspense, useMemo } from "react";
// import DealerNonFeDiscounting from "./DealerNonFEDiscounting";
// import DealerFeDiscountingTable from "./DealerFEDiscounting";
import { useMqttTopics } from "../../../hook/useMqttTopics";
import SectionLoader from "../../elements/soneriLoader/SectionLoader";

// 🔹 Lazy load components
const DealerFeDiscountingTable = lazy(() => import("./DealerFEDiscounting"));
const DealerNonFeDiscounting = lazy(() => import("./DealerNonFEDiscounting"));

const DealerDiscounting = ({ dealerIdForMQTT }) => {
  // ✅ Calculate topics here. Log to see what is being passed to the hook.
  const mqttTopics = useMemo(() => {
    const topics = [`SBL_REAL_TIME_FEED_TREASURY_DEALER_${dealerIdForMQTT}`];
    console.log(
      "%c[LiveRates] Calculated Topics:",
      "color: #00ff00; font-weight: bold;",
      topics
    );
    return topics;
  }, [dealerIdForMQTT]);
  useMqttTopics(mqttTopics);
  return (
    <>
      <div>
        <Suspense fallback={<SectionLoader />}>
          <DealerFeDiscountingTable />
        </Suspense>
      </div>
      <div>
        <Suspense fallback={<SectionLoader />}>
          <DealerNonFeDiscounting />
        </Suspense>
      </div>
    </>
  );
};

export default DealerDiscounting;
