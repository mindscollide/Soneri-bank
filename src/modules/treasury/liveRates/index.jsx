import { lazy, memo, Suspense } from "react";

import { Col, Row } from "react-bootstrap";
import SectionLoader from "../../../shareComponents/elements/soneriLoader/SectionLoader";

const BankSpotAndUSDParity = lazy(() => import("./bankSpotAndUSDParity/index"));
const CurrencyCrosses = lazy(() =>
  import("../../../shareComponents/commonComponents/liveRates/currencyCrosses")
);
const LiveRates = memo(() => {
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
