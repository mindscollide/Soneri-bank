import React, { useMemo } from "react";
import DealerNonFeDiscounting from "./DealerNonFEDiscounting";
import DealerFeDiscountingTable from "./DealerFEDiscounting";
import { useMqttTopics } from "../../../hook/useMqttTopics";

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
        <DealerFeDiscountingTable />
      </div>
      <div>
        <DealerNonFeDiscounting />
      </div>
    </>
  );
};

export default DealerDiscounting;
