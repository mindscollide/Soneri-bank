import React, { useEffect, useState } from "react";
import InputFIeld from "../../../shareComponents/commonComponents/elements/inputField/InputField";
import { Col, Row } from "react-bootstrap";
import { NumericFormat } from "react-number-format";
import CustomButton from "../../../shareComponents/commonComponents/elements/globalButton/button";
import { useDispatch, useSelector } from "react-redux";
import { AddDealerSpreadApi } from "../../../store/actions/WatchlistAction";

const PublshDealerSpreads = () => {
  const dispatch = useDispatch();
  const [bidSpreads, setBidSpreads] = useState("");
  const [askSpreads, setAskSpreads] = useState("");
  const dealerId = localStorage.getItem("userID");

  const GetSingleDealersSpread = useSelector(
    (state) => state.WatchListReducer.GetSingleDealersSpread
  );
  const spreadsForSingleUser = useSelector(
    (state) => state.RealtimeActionsSlice.spreadsForSingleUser
  );

  const handlePublishSpreads = () => {
    const Data = {
      BidSpread: bidSpreads !== "" ? Number(bidSpreads) : 0,
      AskSpread: askSpreads !== "" ? Number(askSpreads) : 0,
      DealerId: Number(dealerId),
    };
    console.log(Data, "PublshDealerSpreads");
    dispatch(AddDealerSpreadApi({ Data }));
  };
  const handleChangeSpreads = (event) => {
    console.log({ event }, "handleChangeSpreads");

    const { name, value } = event.target;
    console.log({ name, value }, "handleChangeSpreads");

    if (name === "bidValue") {
      setBidSpreads(value);
      return;
    }
    if (name === "askValue") {
      setAskSpreads(value);
      return;
    }
  };
  useEffect(() => {
    if (GetSingleDealersSpread) {
      const { dealersSpread } = GetSingleDealersSpread;

      setBidSpreads(dealersSpread?.bidSpread || "");
      setAskSpreads(dealersSpread?.askSpread || "");
    }
  }, [GetSingleDealersSpread]);

  // MQTT When spread is applied
  useEffect(() => {
    if (spreadsForSingleUser && spreadsForSingleUser !== null) {
      const { currentRateSheetRates } = spreadsForSingleUser;

      setBidSpreads(currentRateSheetRates?.currentBid || "");
      setAskSpreads(currentRateSheetRates?.currentAsk || "");
    }
  }, [spreadsForSingleUser]);
  return (
    <>
      <Row>
        <Col>
          <div className="fs-sm fw-bold color-secondary">Bid Spread</div>
          <NumericFormat
            min={1}
            value={bidSpreads}
            name="bidValue"
            customInput={InputFIeld}
            decimalScale={2} // max 2 digits after decimal
            allowNegative={false}
            placeholder={"0.00"}
            applyClass={"bidAskInput"}
            onChange={handleChangeSpreads}
            isAllowed={({ floatValue, value }) => {
              if (floatValue === undefined) return true;

              const [intPart, decimalPart] = value.split(".");

              return (
                floatValue >= 0 &&
                floatValue <= 99 &&
                intPart.length <= 2 && // max 2 digits before decimal
                (!decimalPart || decimalPart.length <= 2) // max 2 after decimal
              );
            }}
          />
        </Col>
        <Col>
          <div className="fs-sm fw-bold color-secondary">Ask Spread</div>
          <NumericFormat
            min={1}
            type="text"
            value={askSpreads}
            decimalScale={2}
            onChange={handleChangeSpreads}
            customInput={InputFIeld}
            name="askValue"
            placeholder={"0.00"}
            allowNegative={false}
            applyClass={"bidAskInput"}
            isAllowed={({ floatValue, value }) => {
              if (floatValue === undefined) return true;

              const [intPart, decimalPart] = value.split(".");

              return (
                floatValue >= 0 &&
                floatValue <= 99 &&
                intPart.length <= 2 && // max 2 digits before decimal
                (!decimalPart || decimalPart.length <= 2) // max 2 after decimal
              );
            }}
          />
        </Col>
        <Col>
          <CustomButton
            value={"Publish"}
            applyClass="publishBtnDealerHeader"
            // disabled={isMarketOn === true ? false : true}
            onClick={handlePublishSpreads}
            // loading={publishNewRatesLoading}
          />
        </Col>
      </Row>
    </>
  );
};

export default PublshDealerSpreads;
