import React, { useEffect, useState, Suspense } from "react";
import "./SpotRates.css";
import { Col, Row } from "react-bootstrap";
import moment from "moment";
import { NumericFormat } from "react-number-format";
import {
  formatCurrencyInput,
  isValidNumberUnderMaxNumber,
} from "../../../utils/formatters";
import { formatDateUTCToGMT } from "../../../utils/timeFunction";
import GlobalModal from "../../../shareComponents/commonComponents/elements/globalModal/Modal";
import CustomButton from "../../../shareComponents/commonComponents/elements/globalButton/button";
import SwitchButton from "../../../shareComponents/commonComponents/elements/switchButton/SwitchBtn";
import InputFIeld from "../../../shareComponents/commonComponents/elements/inputField/InputField";
import { useDispatch, useSelector } from "react-redux";
import { useNotification } from "../../../context/NotificationProvider";
import { useNavigate } from "react-router-dom";
import {
  clearRatesAction,
  marketOnOffAction,
  PublishNewRatesAction,
} from "../../../store/actions/WatchlistAction";
import { setPublishedSpotRates } from "../../../store/slicers/modalSlicer/modalSlicer";
import { currentRatePublishedAction } from "../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";

const SpotRates = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showMessage } = useNotification();
  const [isMarketOn, setIsMarketOn] = useState(false);

  const getLastPublishRates = useSelector(
    (state) => state.WatchListReducer.getLastPublishRates
  );
  const currentUpdatedRates = useSelector(
    (state) => state.RealtimeActionsSlice.currentRatesPublished
  );

  const marketStatus = useSelector(
    (state) => state.WatchListReducer.getMarketStatus
  );

  const publishedSpotRates = useSelector(
    (state) => state.modalReducer.publishedSpotRates
  );
  const publishNewRatesLoading = useSelector(
    (state) => state.WatchListReducer.publishNewRatesLoading
  );
  const clearRatesLoading = useSelector(
    (state) => state.WatchListReducer.clearRatesLoading
  );

  const [currentRates, setCurrentRates] = useState({
    askValue: "",
    bidValue: "",
    dateTime: "",
  });

  const [copyCurrentRates, setCopyCurrentRates] = useState({
    askValue: "",
    bidValue: "",
    dateTime: "",
  });

  const [lastPublishRates, setLastPublishRates] = useState({
    askValue: "",
    bidValue: "",
    dateTime: "",
  });
  const [refreshInterval, setRefreshInterval] = useState(1);

  useEffect(() => {
    if (getLastPublishRates && getLastPublishRates !== null) {
      try {
        const {
          lastAsk,
          lastBid,
          refreshInterval,
          lastPublishDateTime,
          currentAsk,
          // isMarketON,
          currentBid,
          currentValueDateTime,
        } = getLastPublishRates;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLastPublishRates({
          ...lastPublishRates,
          askValue: lastAsk,
          bidValue: lastBid,
          dateTime: lastPublishDateTime,
        });
        setCurrentRates({
          ...currentRates,
          askValue: currentAsk,
          bidValue: currentBid,
          dateTime: currentValueDateTime,
        });
        setCopyCurrentRates({
          ...copyCurrentRates,
          askValue: currentAsk,
          bidValue: currentBid,
          dateTime: currentValueDateTime,
        });
        // dispatch(marketStatusUpdated(isMarketON));
        setRefreshInterval(refreshInterval);
      } catch (error) {
        console.log(error);
      }
    }
  }, [getLastPublishRates]);

  useEffect(() => {
    if (currentUpdatedRates !== null) {
      try {
        const {
          lastAsk,
          lastBid,
          refreshInterval,
          lastPublishDateTime,
          currentAsk,
          currentBid,
          currentValueDateTime,
          // eslint-disable-next-line no-unsafe-optional-chaining
        } = currentUpdatedRates?.currentUSDRates;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLastPublishRates({
          ...lastPublishRates,
          askValue: lastAsk,
          bidValue: lastBid,
          dateTime: lastPublishDateTime,
        });
        setCurrentRates({
          ...currentRates,
          askValue: currentAsk,
          bidValue: currentBid,
          dateTime: currentValueDateTime,
        });
        setCopyCurrentRates({
          ...copyCurrentRates,
          askValue: currentAsk,
          bidValue: currentBid,
          dateTime: currentValueDateTime,
        });
        setRefreshInterval(refreshInterval);
        dispatch(currentRatePublishedAction(null));
      } catch (error) {
        console.log(error);
      }
    }
  }, [currentUpdatedRates]);
  // // console.log(getLastPublishRates, "getLastPublishRatesgetLastPublishRates");

  useEffect(() => {
    if (marketStatus !== null) {
      try {
        setIsMarketOn(marketStatus);
        if (getLastPublishRates !== null) {
          setLastPublishRates({
            ...lastPublishRates,
            askValue: getLastPublishRates?.lastAsk,
            bidValue: getLastPublishRates?.lastBid,
          });
          setCurrentRates({
            ...currentRates,
            askValue: getLastPublishRates?.currentAsk,
            bidValue: getLastPublishRates?.currentBid,
          });
          setCopyCurrentRates({
            ...copyCurrentRates,
            askValue: getLastPublishRates?.currentAsk,
            bidValue: getLastPublishRates?.currentBid,
          });
          setRefreshInterval(getLastPublishRates.refreshInterval);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }, [marketStatus]);

  const handleChangeMarketStatus = (checked) => {
    console.log(checked, "checkedchecked");
    // dispatch(marketStatusUpdated(checked));
    let Data = { IsOn: checked };
    dispatch(marketOnOffAction({ Data, navigate }));
  };

  const handleClearRates = () => {
    let Data = { value: 1 };
    dispatch(clearRatesAction({ Data, navigate }));
    console.log("first");
  };

  const handleChangeCurrentRate = (event) => {
    const { name, value } = event.target;

    if (name === "refreshInterval") {
      const validated = isValidNumberUnderMaxNumber(value, 30);
      if (validated) setRefreshInterval(value);
      return;
    }

    setCurrentRates((prev) => ({
      ...prev,
      [name]: value, // handles bidValue and askValue dynamically
    }));
  };

  const handlePublishRates = () => {
    //Object destructuring
    const { bidValue, askValue } = currentRates;
    const { bidValue: copyBidVal, askValue: copyAskVal } = copyCurrentRates;

    const bid = Number(bidValue);
    const ask = Number(askValue);
    const lastBid = Number(lastPublishRates.bidValue);
    const lastAsk = Number(lastPublishRates.askValue);

    // Step 1: Validate required fields
    if (!bid || !ask) {
      showMessage("Please fill all required fields");

      return;
    }
    if (!refreshInterval) {
      showMessage("Please enter the Refresh Interval value");

      return;
    }

    // Step 2: Ask value must be greater than Bid
    if (ask <= bid) {
      showMessage("Ask value must be greater than Bid value.");

      return;
    }

    // if copyBidVal and copyAskVal is 0 that means dealer or treasury update the first time rate in the morning
    const isFirstLogin2 = Number(copyBidVal) === 0 || Number(copyAskVal) === 0;

    // Helper to get allowed bid/ask range based on percentage

    const getBidAskRange = (baseBid, baseAsk, percent) => {
      console.log("Check Value again");

      const bidRange = baseBid * percent;
      const askRange = baseAsk * percent;
      return {
        minBid: baseBid - bidRange,
        maxBid: baseBid + bidRange,
        minAsk: baseAsk - askRange,
        maxAsk: baseAsk + askRange,
      };
    };

    //Helper to check whether current values are out of range

    const checkOutOfRange = (minBid, maxBid, minAsk, maxAsk) => {
      console.log("Check Value again");

      return {
        isBidOutOfRange: bid < minBid || bid > maxBid,
        isAskOutOfRange: ask < minAsk || ask > maxAsk,
      };
    };

    // Helper to dispatch the publish action
    const dispatchPublishAction = () => {
      const Data = {
        CurrentBid: bid,
        CurrentAsk: ask,
        RefreshInterval: Number(refreshInterval),
      };
      dispatch(PublishNewRatesAction({ Data, navigate }));
    };

    if (isFirstLogin2) {
      console.log("Checking");

      // we will compare the bid and ask rate from the last rate and the compare percentage will 2.5%

      // Step 5: Decide percentage range based on date match
      const percent = 0.025; // 0.25% or 2.5%

      // Step 6: Calculate allowed range
      const { minBid, maxBid, minAsk, maxAsk } = getBidAskRange(
        lastBid,
        lastAsk,
        percent
      );

      // Step 7: Check if current values fall outside allowed range
      const { isBidOutOfRange, isAskOutOfRange } = checkOutOfRange(
        minBid,
        maxBid,
        minAsk,
        maxAsk
      );

      // Step 8: If out of range → show modal instead of publish
      if (isBidOutOfRange || isAskOutOfRange) {
        dispatch(setPublishedSpotRates(true));
        return;
      }

      // Step 9: All conditions passed → Dispatch API publish
      dispatchPublishAction();
      return;
    } else {
      console.log("Checking");
      // there will compare the values from the current and ask rate which is store in copyCurrentRates ask and bid from the 0.25%

      // === CASE: First Login (check from API's last published rates) ===
      const lastApiBid = Number(copyCurrentRates?.bidValue);
      const lastApiAsk = Number(copyCurrentRates?.askValue);

      if (lastApiBid && lastApiAsk) {
        const percent = 0.0025; // Use 0.25% range on first login

        const { minBid, maxBid, minAsk, maxAsk } = getBidAskRange(
          lastApiBid,
          lastApiAsk,
          percent
        );
        const { isBidOutOfRange, isAskOutOfRange } = checkOutOfRange(
          minBid,
          maxBid,
          minAsk,
          maxAsk
        );

        // Step 10: If out of range → show modal
        if (isBidOutOfRange || isAskOutOfRange) {
          dispatch(setPublishedSpotRates(true));
          return;
        }

        // Step 11: Allowed → Api to publish
        dispatchPublishAction();
        return;
      }
    }

    // === CASE: First login, but no historical rates available  Api to publish ===
    dispatchPublishAction();
  };

  return (
    <>
      <Row>
        <Col sm={12} md={12} lg={12}>
          <div className="card-box p-0  h-auto">
            <div className="box-header p-2 bg-Yorange-light color-dark">
              <div className="d-flex align-items-center">
                <div className="flex-fill fs-6 fw-bold color-black">
                  Spot Rates (USD/PKR)
                </div>
                <div className="d-flex align-items-center">
                  <div className="form-check form-switch me-3">
                    <SwitchButton
                      labelValue={"OFF / ON  "}
                      checked={isMarketOn}
                      onChange={handleChangeMarketStatus}
                    />
                  </div>
                  <CustomButton
                    value={"Clear Rates"}
                    applyClass="clearRates"
                    disabled={isMarketOn === true ? false : true}
                    onClick={handleClearRates}
                    loading={clearRatesLoading}
                  />
                </div>
              </div>
            </div>
            <div className="box-content-wrapper h-auto">
              <div className="row m-0">
                <div className="col-12 mb-2 px-0">
                  <div className="d-flex justify-content-end">
                    <div className="col-6">
                      <div className="d-flex align-items-center justify-content-end refresh-interval-wrapper">
                        <span className="updloadrates-hd fs-6 me-1">
                          Refresh Interval
                        </span>
                        <InputFIeld
                          min={1}
                          onChange={handleChangeCurrentRate}
                          name="refreshInterval"
                          value={refreshInterval}
                          disabled={isMarketOn === true ? false : true}
                          type="number"
                          applyClass="RefreshInterval"
                        />

                        <CustomButton
                          value={"Publish"}
                          applyClass="publishBtn"
                          disabled={isMarketOn === true ? false : true}
                          onClick={handlePublishRates}
                          loading={publishNewRatesLoading}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row m-0">
                {/* last updated column Begin */}
                <div className="col-md-6 col-sm-12 ps-1 pe-1 rate-box">
                  <div className="rate box-header d-flex align-items-center px-2">
                    <div className="fw-bold fs-6 ">Last Published @</div>
                    <div className="datetime ms-auto ">
                      {lastPublishRates.dateTime !== "" &&
                        moment(
                          formatDateUTCToGMT(lastPublishRates.dateTime)
                        ).format("DD MMM YYYY, hh:mm:ss")}
                    </div>
                  </div>
                  <div className="rate-box-content">
                    <div className="table-responsive h-auto">
                      <table className="table text-center fs-6">
                        <thead className="">
                          <tr>
                            <th className="fs-6 bg-black color-white">Bid</th>
                            <th className="fs-6 bg-black color-white">Ask</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border-0">
                              <NumericFormat
                                min={1}
                                disabled={true}
                                value={lastPublishRates.bidValue}
                                name="bidValue"
                                decimalScale={2}
                                type="text"
                                allowNegative={false}
                                className={
                                  "text-center form-control mt-4 d-block fs-5 fw-bold mb-0"
                                }
                              />
                            </td>
                            <td className="border-0">
                              <NumericFormat
                                min={1}
                                disabled={true}
                                type="text"
                                value={lastPublishRates.askValue}
                                decimalScale={2}
                                name="askValue"
                                allowNegative={false}
                                className={
                                  "text-center form-control  mt-4 d-block fs-5 fw-bold mb-0"
                                }
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                {/* last updated column Begin */}
                {/* last updated column Begin */}
                <div className="col-md-6 col-sm-12 ps-1 pe-1 rate-box">
                  <div className="rate box-header d-flex align-items-center px-2">
                    <div className="fw-bold fs-6">Current Value @</div>
                    <div className="datetime ms-auto ">
                      {currentRates.dateTime !== "" &&
                        moment(
                          formatDateUTCToGMT(currentRates.dateTime)
                        ).format("DD MMM YYYY, hh:mm:ss")}
                    </div>
                  </div>
                  <div className="rate-box-content">
                    <div className=" h-auto">
                      <table className="table mb-0 text-center fs-6">
                        <thead className="">
                          <tr>
                            <th className="fs-6 bg-black color-white">Bid</th>
                            <th className="fs-6 bg-black color-white">Ask</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border-0">
                              <NumericFormat
                                name="bidValue"
                                value={currentRates.bidValue}
                                onValueChange={(values) =>
                                  handleChangeCurrentRate({
                                    target: {
                                      name: "bidValue",
                                      value: values.floatValue,
                                    },
                                  })
                                }
                                decimalScale={2}
                                fixedDecimalScale={false}
                                allowNegative={false}
                                isAllowed={({ floatValue }) =>
                                  floatValue === undefined ||
                                  (floatValue >= 1 && floatValue <= 1000)
                                }
                                disabled={!isMarketOn}
                                type="text"
                                className="text-center form-control mt-4 d-block fs-5 fw-bold mb-0"
                              />
                            </td>
                            <td className="border-0">
                              <NumericFormat
                                name="askValue"
                                value={currentRates.askValue}
                                onValueChange={(values) =>
                                  handleChangeCurrentRate({
                                    target: {
                                      name: "askValue",
                                      value: values.floatValue,
                                    },
                                  })
                                }
                                decimalScale={2}
                                fixedDecimalScale={false}
                                allowNegative={false}
                                isAllowed={({ floatValue }) =>
                                  floatValue === undefined ||
                                  (floatValue >= 1 && floatValue <= 1000)
                                }
                                disabled={!isMarketOn}
                                type="text"
                                className="text-center form-control mt-4 d-block fs-5 fw-bold mb-0"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                {/* last updated column Begin */}
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <GlobalModal
        show={publishedSpotRates}
        backdrop="static"
        onHide={() => {
          dispatch(setPublishedSpotRates(false));
          // setError({ tenorName: "", noOfDays: "" });
          // setCreateTenor({
          //   tenorName: "",
          //   noOfDays: 0,
          // });
        }}
        centered={true}
        footerClassName="d-block border-0"
        modalBody={
          <>
            <Row>
              <Col
                sm={12}
                md={12}
                lg={12}
                className="mb-4 d-flex justify-content-center"
              >
                <div className="color-blue fw-bold fs-5">Published Rate</div>
              </Col>
            </Row>
            <Row>
              <Col sm={12} md={12} lg={12} className="mb-2">
                <div className="color-black fw-semibold fs-6">
                  There is some unusual change in rates. Do you want to proceed?
                </div>
              </Col>
            </Row>
          </>
        }
        modalFooter={
          <>
            <Row>
              <Col
                sm={12}
                md={12}
                lg={12}
                className="d-flex justify-content-center gap-2"
              >
                {CustomButton && (
                  <Suspense fallback={<div>Loading button...</div>}>
                    <CustomButton
                      value={"Yes"}
                      applyClass={"createTenorModalFooterBtn"}
                      onClick={() => {
                        const bid = Number(currentRates.bidValue);
                        const ask = Number(currentRates.askValue);
                        const refresh = Number(refreshInterval);

                        const Data = {
                          CurrentBid: bid,
                          CurrentAsk: ask,
                          RefreshInterval: refresh,
                        };

                        dispatch(PublishNewRatesAction({ Data, navigate }));
                        dispatch(setPublishedSpotRates(false));
                      }}
                    />
                    <CustomButton
                      value={"No"}
                      onClick={() => {
                        dispatch(setPublishedSpotRates(false));
                      }}
                      applyClass={"cancelTenorModalFooterBtn"}
                    />
                  </Suspense>
                )}
              </Col>
            </Row>
          </>
        }
      />
    </>
  );
};

export default SpotRates;
