import { lazy, memo, Suspense, useMemo } from "react";

import { Col, Row } from "react-bootstrap";
import SectionLoader from "../../elements/soneriLoader/SectionLoader";
import { useMqttTopics } from "../../../hook/useMqttTopics";

const BankSpotAndUSDParity = lazy(() => import("./bankSpotAndUSDParity/index"));
const CurrencyCrosses = lazy(() => import("./currencyCrosses/index"));
const LiveRates = memo(({ dealerIdForMQTT }) => {
  // ✅ Calculate topics here. Log to see what is being passed to the hook.
  const mqttTopics = useMemo(() => {
    const topics = [
      `SBL_CURRENCY_CROSSES_REAL_TIME_FEED_TREASURY`,
      `SBL_TREASURY_DEALER_RATES_${dealerIdForMQTT}`,
    ];
    console.log(
      "%c[LiveRates] Calculated Topics:",
      "color: #00ff00; font-weight: bold;",
      topics
    );
    return topics;
  }, [dealerIdForMQTT]);

  // 2. Call the hook at the top level
  useMqttTopics(mqttTopics);

  return (
    <Row className="mt-2 mb-4 px-2">
      <Col sm={12} md={8} lg={8} className="pe-0">
        <Suspense fallback={<SectionLoader />}>
          <BankSpotAndUSDParity />
        </Suspense>
      </Col>
      <Col sm={12} md={4} lg={4}>
        <Suspense fallback={<SectionLoader />}>
          <CurrencyCrosses />
        </Suspense>
      </Col>
    </Row>
  );
});

export default LiveRates;
