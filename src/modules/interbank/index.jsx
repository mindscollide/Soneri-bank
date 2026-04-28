import React, { useEffect, useRef } from "react";
import SpotRates from "./spotRates";
import styles from "./interbank.module.css";
import RateSheet from "./rateSheet";
import ForwardsPremium from "./forwardPremium";
import FeDiscountingTable from "./FeDiscountingTable";
import { Col } from "react-bootstrap";
import NonFeDiscountingTable from "./NonFeDiscountingTable";
import { useDispatch } from "react-redux";
import {
  getAllTenorsAction,
  getAllTreasuryInstrumentsApi,
  getDealerDashboardApi,
  GetLastAndCurrentPublishUSDRateSheetAction,
  getLastPublishRatesAction,
} from "../../store/actions/WatchlistAction";
import { useMqttTopics } from "../../hook/useMqttTopics";

const Interbank = () => {
  useMqttTopics(["SBL_DEALER", "SBL_TREASURY"]);
  const dispatch = useDispatch();
  const hasFetched = useRef(false);
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    dispatch(getAllTreasuryInstrumentsApi({}));
    dispatch(getLastPublishRatesAction({}));
    dispatch(getAllTenorsAction({}));
    dispatch(getDealerDashboardApi({}));
    dispatch(GetLastAndCurrentPublishUSDRateSheetAction({}));
  }, []);
  return (
    <>
      <div className={styles.interbankwrapper}>
        <SpotRates />
        <RateSheet />
        <ForwardsPremium />
        <Col sm={12} md={12} lg={12} className="mt-3 position-relative">
          <h6 className="fs-4 fw-bold color-black">FE Discounting %</h6>
          <FeDiscountingTable />
        </Col>
        <Col sm={12} md={12} lg={12} className="mt-3 position-relative">
          <h6 className="fs-4 fw-bold color-black">Non FE Discounting %</h6>
          <NonFeDiscountingTable />
        </Col>
      </div>
    </>
  );
};

export default Interbank;
