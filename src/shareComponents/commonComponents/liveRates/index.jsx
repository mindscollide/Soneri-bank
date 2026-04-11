import { lazy, memo, Suspense, useMemo } from "react";
import { Col, Row } from "react-bootstrap";
import SectionLoader from "../../elements/soneriLoader/SectionLoader";
import { useMqttTopics } from "../../../hook/useMqttTopics";
import { useSelector } from "react-redux";

const BankSpotAndUSDParity = lazy(() => import("./bankSpotAndUSDParity/index"));
const BankSpotAndUSDParityForTreasury = lazy(() =>
  import("../../../modules/treasury/liveRates/bankSpotAndUSDParity/index")
);
const CurrencyCrosses = lazy(() => import("./currencyCrosses/index"));

const LiveRates = memo(({ dealerIdForMQTT }) => {
  const dealerValue = useSelector(
    (state) => state.WatchListReducer.dealerValue,
    (prev, next) => prev?.value === next?.value // ✅ Add equality check
  );

  // ✅ Memoize topics properly
  const mqttTopics = useMemo(() => {
    const topics = [
      `SBL_CURRENCY_CROSSES_REAL_TIME_FEED_TREASURY`,
      dealerValue?.value === 0
        ? `SBL_REAL_TIME_FEED_TREASURY`
        : `SBL_TREASURY_DEALER_RATES_${dealerIdForMQTT}`,
    ];
    return topics;
  }, [dealerValue?.value, dealerIdForMQTT]); // ✅ Fixed dependencies

  useMqttTopics(mqttTopics);

  return (
    <Row className="mt-2 mb-4 px-2">
      <Col sm={12} md={8} lg={8} className="pe-0">
        <Suspense fallback={<SectionLoader />}>
          {dealerValue?.value === 0 ? (
            <BankSpotAndUSDParityForTreasury />
          ) : (
            <BankSpotAndUSDParity />
          )}
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

LiveRates.displayName = 'LiveRates';

export default LiveRates;