import React, { lazy, Suspense, useEffect, useMemo, useRef } from "react";
import styles from "./management.module.css";
import { Col, Row } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  GetAllOtherInstrumentsApi,
  getAllTreasuryInstrumentsApi,
  GetCommoditiesForTreasuryApi,
  GetCurrencyCrossesApi,
  GetIndicesForTreasuryApi,
  GetKiborDataForTreasuryApi,
  GetRevalRatesForTreasuryApi,
  GetSOFRDataForTreasuryApi,
  GetSwapsInUSDForTreasuryApi,
  GetUSDParityForTreasuryApi,
} from "../../store/actions/WatchlistAction";
import { IsolatedBlock } from "../../shareComponents/commonComponents/utils/isolateBlock";
import SectionLoader from "../../shareComponents/elements/soneriLoader/SectionLoader";

const USDParityComponent = lazy(() => import("./usdParity/index"));
const Commodities = lazy(() => import("./commodities/index"));
const CurrencyCrosses = lazy(() => import("./currencyCrosses/index"));
const KIBOR = lazy(() => import("./kibor/index"));
const SBPFXRevalRates = lazy(() => import("./sbpFxRevalRates/index"));
const SOFR = lazy(() => import("./sofr/index"));
const StockIndices = lazy(() => import("./stockIndices/index"));
const SwapsInUSD = lazy(() => import("./swapsInUSD/index"));
const News = lazy(() => import("../../shareComponents/commonComponents/news"));
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

  const layout = useMemo(
    () => (
      <div className={styles.managementWrapper}>
        <Row>
          <Col sm={12} md={6} lg={6} className="pe-0">
            <IsolatedBlock>
              <Suspense fallback={<SectionLoader />}>
                <USDParityComponent />
              </Suspense>
            </IsolatedBlock>
          </Col>
          <Col sm={12} md={6} lg={6}>
            <IsolatedBlock>
              <Suspense fallback={<SectionLoader />}>
                <CurrencyCrosses />
              </Suspense>
            </IsolatedBlock>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col sm={12} md={6} lg={6}>
            <IsolatedBlock>
              <Suspense fallback={<SectionLoader />}>
                <Commodities />
              </Suspense>
            </IsolatedBlock>
          </Col>
          <Col sm={12} md={6} lg={6}>
            <IsolatedBlock>
              <Suspense fallback={<SectionLoader />}>
                <StockIndices />
              </Suspense>
            </IsolatedBlock>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col sm={12} md={6} lg={6}>
            <IsolatedBlock>
              <Suspense fallback={<SectionLoader />}>
                <KIBOR />
              </Suspense>
            </IsolatedBlock>
          </Col>
          <Col sm={12} md={6} lg={6}>
            <IsolatedBlock>
              <Suspense fallback={<SectionLoader />}>
                <SOFR />
              </Suspense>
            </IsolatedBlock>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col sm={12} md={6} lg={6}>
            <IsolatedBlock>
              <Suspense fallback={<SectionLoader />}>
                <SBPFXRevalRates />
              </Suspense>
            </IsolatedBlock>
          </Col>
          <Col sm={12} md={6} lg={6}>
            <IsolatedBlock>
              <Suspense fallback={<SectionLoader />}>
                <SwapsInUSD />
              </Suspense>
            </IsolatedBlock>
          </Col>
        </Row>
        <Row className="mt-2">
          <Col sm={12} md={12} lg={12}>
            <IsolatedBlock>
              <Suspense fallback={<SectionLoader />}>
                <News />
              </Suspense>
            </IsolatedBlock>
          </Col>
        </Row>
      </div>
    ),
    []
  );
  return layout;
};

export default Management;
