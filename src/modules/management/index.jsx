import React, { lazy, Suspense, useEffect, useRef } from "react";
import styles from "./management.module.css";
import { Col, Row } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  GetAllOtherInstrumentsApi,
  getAllTenorsAction,
  getAllTreasuryInstrumentsApi,
  GetBankSpotForTreasuryApi,
  GetCommoditiesForTreasuryApi,
  GetCurrencyCrossesApi,
  GetIndicesForTreasuryApi,
  GetKiborDataForTreasuryApi,
  GetRevalRatesForTreasuryApi,
  GetSOFRDataForTreasuryApi,
  GetSwapsInUSDForTreasuryApi,
  GetUSDParityForTreasuryApi,
} from "../../store/actions/WatchlistAction";

const LiveRates = lazy(() =>
  import("../../shareComponents/commonComponents/liveRates/index")
);
const USDParityComponent = lazy(() => import("./usdParity/index"));
const Commodities = lazy(() => import("./commodities/index"));
const CurrencyCrosses = lazy(() => import("./currencyCrosses/index"));
const KIBOR = lazy(() => import("./kibor/index"));
const SBPFXRevalRates = lazy(() => import("./sbpFxRevalRates/index"));
const SOFR = lazy(() => import("./sofr/index"));
const StockIndices = lazy(() => import("./stockIndices/index"));
const SwapsInUSD = lazy(() => import("./swapsInUSD/index"));

const Management = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Inital UseEffect as soon as user Clicks on Management Tab
  const hasFetched = useRef(false);
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    dispatch(getAllTreasuryInstrumentsApi({ navigate }));
    dispatch(GetAllOtherInstrumentsApi({ navigate }));
    dispatch(GetUSDParityForTreasuryApi({ navigate }));
    dispatch(GetCurrencyCrossesApi({ navigate }));
    dispatch(GetCommoditiesForTreasuryApi({ navigate }));
    dispatch(GetIndicesForTreasuryApi({ navigate }));
    dispatch(GetKiborDataForTreasuryApi({ navigate }));
    dispatch(GetSOFRDataForTreasuryApi({ navigate }));
    dispatch(GetRevalRatesForTreasuryApi({ navigate }));
    dispatch(GetSwapsInUSDForTreasuryApi({ navigate }));
  }, []);
  return (
    <div className={styles.managementWrapper}>
      <Row>
        <Col sm={12} md={6} lg={6} className="pe-0">
          <Suspense fallback={<>...Loading</>}>
            <USDParityComponent />
          </Suspense>
        </Col>
        <Col sm={12} md={6} lg={6}>
          <Suspense fallback={<>...Loading</>}>
            <CurrencyCrosses />
          </Suspense>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col sm={12} md={6} lg={6}>
          <Suspense fallback={<>...Loading</>}>
            <Commodities />
          </Suspense>
        </Col>
        <Col sm={12} md={6} lg={6}>
          <Suspense fallback={<>...Loading</>}>
            <StockIndices />
          </Suspense>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col sm={12} md={6} lg={6}>
          <Suspense fallback={<>...Loading</>}>
            <KIBOR />
          </Suspense>
        </Col>
        <Col sm={12} md={6} lg={6}>
          <Suspense fallback={"...Loading"}>
            <SOFR />
          </Suspense>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col sm={12} md={6} lg={6}>
          <Suspense fallback={<>...Loading</>}>
            <SBPFXRevalRates />
          </Suspense>
        </Col>
        <Col sm={12} md={6} lg={6}>
          <Suspense fallback={<>...Loading</>}>
            <SwapsInUSD />
          </Suspense>
        </Col>
      </Row>
      <Row>
        <Col>News</Col>
      </Row>
    </div>
  );
};

export default Management;
