import React, { lazy, Suspense, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import styles from "./RateSheet.module.css";
import CustomButton from "../elements/globalButton/button";
import { useDispatch } from "react-redux";
import {
  GetAllOtherInstrumentsApi,
  getAllTreasuryInstrumentsApi,
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
const Kibor = lazy(() => import("./kibor/index"));

const RateSheet = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getAllTreasuryInstrumentsApi({ navigate }));
    dispatch(GetAllOtherInstrumentsApi({ navigate }));
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
      <Row className="mt-3">
        <Col sm={12} md={8} lg={8}>
          <Suspense fallback={<>...Loading</>}>
            <SpotTTRates />
          </Suspense>
        </Col>
        <Col sm={12} md={4} lg={4}>
          <div>
            <Suspense fallback={<>...Loading</>}>
              <RatesForCurrencyNotes />
            </Suspense>
          </div>

          <div className="mt-2">
            <Suspense fallback={<>...Loading</>}>
              <SbpConversionRates />
            </Suspense>
          </div>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col sm={12} md={12} lg={12}>
          <IndicativeFBPRates />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col sm={12} md={6} lg={6}>
          <Sofr />
        </Col>
        <Col sm={12} md={6} lg={6}>
          <Kibor />
        </Col>
      </Row>
      <Row className="mt-3 mb-3">
        <Col sm={12} md={12} lg={12} className={styles.importantNote}>
          <div class="fw-bold text-decoration-underline">IMPORTANT NOTE:</div>
          <ul class="color-red">
            <li>
              THE ABOVE RATES ARE ONLY INDICATIVE AND SUBJECT TO CHANGE WITHOUT
              PRIOR NOTICE.
            </li>
            <li>
              FX TRANSACTIONS CUT OFF TIME FOR REPORTING IS 15:30 HOURS
              (MON-THU) AND 14:30 HOURS (FRIDAY).
            </li>
            <li>
              PLEASE CALL DEALING ROOM FOR AMOUNT EQUIVALENT OR MORE THAN
              USD.5,000/=
            </li>
            <li>
              SONERI CAPTURES ABOVE FOREIGN EXCHANGE RATES FROM SOURCES BELIEVED
              TO BE RELIABLE AND DOES NOT ACCEPT ANY LIABILITY FOR CONSEQUENCES
              THAT MAY ARISE USING THESE RATES.
            </li>
          </ul>
        </Col>
      </Row>
    </div>
  );
};

export default RateSheet;
