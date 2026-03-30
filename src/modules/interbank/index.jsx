import React, { useEffect, useRef } from "react";
import SpotRates from "./spotRates";
import styles from "./interbank.module.css";
import RateSheet from "./rateSheet";
import ForwardsPremium from "./forwardPremium";
import FeDiscountingTable from "./FeDiscountingTable";
import { Col } from "react-bootstrap";
import NonFeDiscountingTable from "./NonFeDiscountingTable";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getAllTenorsAction,
  getAllTreasuryInstrumentsApi,
  getDealerDashboardApi,
  GetLastAndCurrentPublishUSDRateSheetAction,
  getLastPublishRatesAction,
} from "../../store/actions/WatchlistAction";

const Interbank = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    dispatch(getAllTreasuryInstrumentsApi({ navigate }));
    dispatch(getLastPublishRatesAction({ navigate }));
    dispatch(getAllTenorsAction({ navigate }));
    dispatch(getDealerDashboardApi({ navigate }));
    dispatch(GetLastAndCurrentPublishUSDRateSheetAction({ navigate }));
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
      {/* <ForwardsForTreasuryAndDealer /> */}
    </>
  );
};

export default Interbank;
