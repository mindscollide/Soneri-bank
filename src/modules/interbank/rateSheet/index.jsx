import React, { useEffect, useState, Suspense } from "react";
import "./rateSheet.css";
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
import { useDispatch, useSelector } from "react-redux";
import { PublishCurrentUSDRateSheetAction } from "../../../store/actions/WatchlistAction";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../context/NotificationProvider";
import { setPublishedSpotRateSheet } from "../../../store/slicers/modalSlicer/modalSlicer";

const RateSheet = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showMessage } = useNotification();
  const [isMarketOn, setIsMarketOn] = useState(false);
  const getLastPublishRatesSheet = useSelector(
    (state) => state.WatchListReducer.getLastPublishRatesSheet
  );

  const marketStatus = useSelector(
    (state) => state.WatchListReducer.getMarketStatus
  );

  const publishedSpotRateSheet = useSelector(
    (state) => state.modalReducer.publishedSpotRateSheet
  );

  const PublishCurrentUSDRateSheetLoading = useSelector(
    (state) => state.WatchListReducer.PublishCurrentUSDRateSheetLoading
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
    if (getLastPublishRatesSheet && getLastPublishRatesSheet !== null) {
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
        } = getLastPublishRatesSheet;
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
        // setRefreshInterval(refreshInterval);
      } catch (error) {
        console.log(error);
      }
    }
  }, [getLastPublishRatesSheet]);

  //   useEffect(() => {
  //     if (currentUpdatedRates !== null) {
  //       try {
  //         const {
  //           lastAsk,
  //           lastBid,
  //           refreshInterval,
  //           lastPublishDateTime,
  //           currentAsk,
  //           currentBid,
  //           currentValueDateTime,
  //           // eslint-disable-next-line no-unsafe-optional-chaining
  //         } = currentUpdatedRates?.currentUSDRates;
  //         // eslint-disable-next-line react-hooks/set-state-in-effect
  //         setLastPublishRates({
  //           ...lastPublishRates,
  //           askValue: lastAsk,
  //           bidValue: lastBid,
  //           dateTime: lastPublishDateTime,
  //         });
  //         setCurrentRates({
  //           ...currentRates,
  //           askValue: currentAsk,
  //           bidValue: currentBid,
  //           dateTime: currentValueDateTime,
  //         });
  //         setCopyCurrentRates({
  //           ...copyCurrentRates,
  //           askValue: currentAsk,
  //           bidValue: currentBid,
  //           dateTime: currentValueDateTime,
  //         });
  //         setRefreshInterval(refreshInterval);
  //         // dispatch(currentRatePublishedAction(null));
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     }
  //   }, [currentUpdatedRates]);
  //   // console.log(getLastPublishRates, "getLastPublishRatesgetLastPublishRates");

  useEffect(() => {
    if (marketStatus !== null) {
      try {
        setIsMarketOn(marketStatus);
        if (getLastPublishRatesSheet !== null) {
          setLastPublishRates({
            ...lastPublishRates,
            askValue: getLastPublishRatesSheet?.lastAsk,
            bidValue: getLastPublishRatesSheet?.lastBid,
          });
          setCurrentRates({
            ...currentRates,
            askValue: getLastPublishRatesSheet?.currentAsk,
            bidValue: getLastPublishRatesSheet?.currentBid,
          });
          setCopyCurrentRates({
            ...copyCurrentRates,
            askValue: getLastPublishRatesSheet?.currentAsk,
            bidValue: getLastPublishRatesSheet?.currentBid,
          });
          setRefreshInterval(getLastPublishRatesSheet.refreshInterval);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }, [marketStatus]);

  const handleChangeCurrentRate = (event) => {
    let name = event.target.name;
    let value = event.target.value;

    if (name === "bidValue") {
      setCurrentRates({
        ...currentRates,
        bidValue: formatCurrencyInput(value),
      });
    } else if (name === "askValue") {
      setCurrentRates({
        ...currentRates,
        askValue: formatCurrencyInput(value),
      });
    } else if (name === "refreshInterval") {
      const validated = isValidNumberUnderMaxNumber(value, 30);
      if (validated) {
        setRefreshInterval(value);
      }
    }
  };

  const handlePublishRates = () => {
    try {
      //Object destructuring
      const { bidValue, askValue, dateTime } = currentRates;
      const { bidValue: copyBidVal, askValue: copyAskVal } = copyCurrentRates;

      const bid = Number(bidValue);
      const ask = Number(askValue);
      const lastBid = Number(lastPublishRates.bidValue);
      const lastAsk = Number(lastPublishRates.askValue);
      console.log("Check Value again", currentRates);
      console.log("Check Value again", { bid, ask, lastBid, lastAsk });

      // Step 1: Validate required fields
      if (!bid || !ask) {
        console.log("Check Value again");

        const handleClick = () => {
          showMessage("Please fill all required fields");
        };

        handleClick();
        return;
      }

      // Step 2: Ask value must be greater than Bid
      if (ask <= bid) {
        console.log("Check Value again Ask is less than bid");
        const handleClick = () => {
          showMessage("Ask value must be greater than Bid value.");
        };

        handleClick();
        return;
      }

      // Step 3: Format and compare current and last publish dates
      const currentDate = moment(formatDateUTCToGMT(dateTime)).format(
        "DD MMM YYYY"
      );
      const lastDate = moment(
        formatDateUTCToGMT(lastPublishRates.dateTime)
      ).format("DD MMM YYYY");

      // if copyBidVal and copyAskVal is 0 that means dealer or treasury update the first time rate in the morning
      const isFirstLogin2 =
        Number(copyBidVal) === 0 || Number(copyAskVal) === 0;

      // Step 4: Determine if it's the first time login (no last published data)
      const isFirstLogin =
        !copyBidVal || !copyAskVal || copyBidVal === 0 || copyAskVal === 0;

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
        console.log("Check Value again", { minBid, maxBid, minAsk, maxAsk });

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
        };
        dispatch(PublishCurrentUSDRateSheetAction({ Data, navigate }));
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
          dispatch(setPublishedSpotRateSheet(true));
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
            // dispatch(setPublishedSpotRates(true));
            return;
          }

          // Step 11: Allowed → Api to publish
          dispatchPublishAction();
          return;
        }
      }

      // === CASE: First login, but no historical rates available  Api to publish ===
      dispatchPublishAction();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Row>
        <Col sm={12} md={12} lg={12}>
          <div className="card-box p-0  h-auto">
            <div className="box-content-wrapper h-auto">
              <div className="row m-0">
                <div className="col-12 mb-2 px-0">
                  <div className="d-flex justify-content-end">
                    <div className="col-12 mt-4">
                      <div className="d-flex align-items-center justify-content-between refresh-interval-wrapper">
                        <span className="rate-sheet-sec fs-4 color-black fw-bold">
                          Rate Sheet
                        </span>
                        <CustomButton
                          value={"Publish"}
                          applyClass="publishBtn"
                          // disabled={isMarketOn === true ? false : true}
                          disabled={true}
                          onClick={handlePublishRates}
                          loading={PublishCurrentUSDRateSheetLoading}
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
                    <div className="fw-bold fs-6 ff-roboto">
                      Last Published @
                    </div>
                    <div className="datetime  ms-auto ">
                      {/* {} */}
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
                                  "text-center form-control ff-roboto mt-4 d-block fs-5 fw-bold mb-0"
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
                                // onChange={handleChangeCurrentRate}
                                name="askValue"
                                allowNegative={false}
                                className={
                                  "text-center form-control ff-roboto  mt-4 d-block fs-5 fw-bold mb-0"
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
                    <div className="fw-bold fs-6 ff-roboto">
                      Current Value @
                    </div>
                    <div className="datetime  ms-auto ">
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
                                min={1}
                                disabled={isMarketOn === true ? false : true}
                                value={currentRates.bidValue}
                                onChange={handleChangeCurrentRate}
                                name="bidValue"
                                decimalScale={2}
                                type="text"
                                allowNegative={false}
                                className={
                                  "text-center form-control ff-roboto mt-4 d-block fs-5 fw-bold mb-0"
                                }
                              />
                            </td>
                            <td className="border-0">
                              <NumericFormat
                                min={1}
                                disabled={isMarketOn === true ? false : true}
                                type="text"
                                value={currentRates.askValue}
                                decimalScale={2}
                                onChange={handleChangeCurrentRate}
                                name="askValue"
                                allowNegative={false}
                                className={
                                  "text-center form-control ff-roboto  mt-4 d-block fs-5 fw-bold mb-0"
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
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <GlobalModal
        show={publishedSpotRateSheet}
        backdrop="static"
        onHide={() => {
          dispatch(setPublishedSpotRateSheet(false));
          setError({ tenorName: "", noOfDays: "" });
          setCreateTenor({
            tenorName: "",
            noOfDays: 0,
          });
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
                        // const refresh = Number(refreshInterval);

                        const Data = {
                          CurrentBid: bid,
                          CurrentAsk: ask,
                          // RefreshInterval: refresh,
                        };

                        dispatch(
                          PublishCurrentUSDRateSheetAction({ Data, navigate })
                        );
                        dispatch(publishedSpotRateSheet(false));
                      }}
                    />
                    <CustomButton
                      value={"No"}
                      onClick={() => {
                        dispatch(setPublishedSpotRateSheet(false));
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

export default RateSheet;
