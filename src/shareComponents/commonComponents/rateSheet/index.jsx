import React, { lazy, Suspense, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import styles from "./RateSheet.module.css";
import CustomButton from "../elements/globalButton/button";
import { useDispatch } from "react-redux";
import {
  GetIndicativeFBPRatesApi,
  GetKiborDataForRateSheetApi,
  GetRatesForCurrencyNotesForRateSheetApi,
  GetSOFRDataForRateSheetApi,
  GetSpotTTRatesForRateSheetApi,
} from "../../../store/actions/WatchlistAction";
import { useNavigate } from "react-router-dom";
const SpotTTRates = lazy(() => import("./spotTTRates/index"));
const RatesForCurrencyNotes = lazy(() =>
  import("./ratesForCurrencyNotes/index")
);
const SbpConversionRates = lazy(() => import("./sbpConversionRates/index"));
const IndicativeFBPRates = lazy(() => import("./indicativeFBPRates/index"));
const Sofr = lazy(() => import("./sofr/index"));

const RateSheet = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(GetSpotTTRatesForRateSheetApi({ navigate }));
    dispatch(GetRatesForCurrencyNotesForRateSheetApi({ navigate }));
    dispatch(GetKiborDataForRateSheetApi({ navigate }));
    dispatch(GetSOFRDataForRateSheetApi({ navigate }));
    dispatch(GetIndicativeFBPRatesApi({ navigate }));
  }, []);
  return (
    <div className={styles.mainRateSheetContianer}>
      <Row className="d-flex justify-space-between">
        <Col sm={12} md={6} lg={6} className={styles.dateDay}>
          14-Jan-2026 - Wednesday
        </Col>
        <Col
          sm={12}
          md={6}
          lg={6}
          className={"mt-1 d-flex justify-content-end align-items-bottom"}
        >
          <CustomButton
            value={"Export to PDF"}
            applyClass="exportToPDF"
            // disabled={isMarketOn === true ? false : true}
            // onClick={handleClearRates}
            // loading={clearRatesLoading}
          />
        </Col>
      </Row>
      <Row className="mt-2">
        <Col sm={12} md={8} lg={8}>
          <Suspense fallback={<>...Loading</>}>
            <SpotTTRates />
          </Suspense>
        </Col>
        <Col sm={12} md={4} lg={4}>
          <Row>
            <Suspense fallback={<>...Loading</>}>
              <RatesForCurrencyNotes />
            </Suspense>
            <Suspense fallback={<>...Loading</>}>
              <SbpConversionRates />
            </Suspense>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default RateSheet;
