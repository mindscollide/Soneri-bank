import { useEffect, useState } from "react";
import CustomButton from "../../../shareComponents/commonComponents/elements/globalButton/button";
import GlobalTable from "../../../shareComponents/commonComponents/elements/table/GlobalTable";
import {
  buildCurrentRatesPayload,
  buildDiscountingTable,
} from "../../../shareComponents/commonComponents/utils/generateColumnsData";
import { InputCell } from "../../../shareComponents/commonComponents/elements/inputField/InputCell";
import { isValidMaxFourNumberAfterPoint } from "../../../utils/formatters";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { PublishFEDiscountingTableApi } from "../../../store/actions/WatchlistAction";
import moment from "moment";
import { formatDateUTCToGMT } from "../../../utils/timeFunction";
import { FeDiscountingPublishedAction } from "../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";

/**
 * FeDiscountingTable component renders a table for displaying and managing
 * discounting rates for financial instruments. It fetches data from the Redux
 * store and allows users to input and publish updated rates.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 *
 * @example
 * return (
 *   <FeDiscountingTable />
 * );
 */
const FeDiscountingTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const marketStatus = useSelector(
    (state) => state.RealtimeActionsSlice.marketStatus
  );

  const [columnsData, setColumnsData] = useState([]);
  const [rowData, setRowData] = useState([]);

  const GetAllInstrumentForTreasury = useSelector(
    (state) => state.WatchListReducer.GetAllInstrumentForTreasury
  );

  const getDashboardForwards = useSelector(
    (state) => state.WatchListReducer.getDealerDashboardData
  );

  const getFeDiscountingData = useSelector(
    (state) => state.RealtimeActionsSlice.FeDiscountingPublished
  );
  const FeDiscountingButtonLoading = useSelector(
    (state) => state.WatchListReducer.publishFeDiscountingLoading
  );

  // console.log(FeDiscountingButtonLoading, "FeDiscountingButtonLoading");

  const getAllTenorsData = useSelector(
    (state) => state.WatchListReducer.getAllTenors
  );

  const onInputChange = (record, instrumentName, value) => {
    const previousValue = record[instrumentName]; // Get previous value from record
    const validated = isValidMaxFourNumberAfterPoint(value, previousValue, 100);

    // Only update if valid or corrected (not false)
    if (validated !== false) {
      const finalValue = typeof validated === "string" ? validated : value;

      setRowData((prevState) =>
        prevState.map((stateData) => {
          if (
            stateData.TenorID === record.TenorID &&
            stateData.instrumentName === record.instrumentName
          ) {
            return {
              ...stateData,
              [instrumentName]: finalValue,
            };
          }
          return stateData;
        })
      );
    }
  };

  useEffect(() => {
    if (
      getAllTenorsData !== null &&
      GetAllInstrumentForTreasury !== null &&
      GetAllInstrumentForTreasury
    ) {
      try {
        const { feDiscountingRates = [] } =
          getDashboardForwards !== null &&
          getDashboardForwards !== undefined &&
          getDashboardForwards;
        const DiscountingInstruments =
          GetAllInstrumentForTreasury?.discountingInstruments;

        const getAllInstrument = { instruments: DiscountingInstruments };
        const { rowData, columnsData } = buildDiscountingTable(
          5,
          feDiscountingRates,
          getAllTenorsData,
          getAllInstrument,
          InputCell,
          onInputChange
        );

        if (rowData.length > 0) {
          setRowData(rowData);
          setColumnsData(columnsData);
          setDate(feDiscountingRates[0]?.dateTime);
        }
      } catch (error) {
        console.log(error, "Error while building discounting table");
      }
    }
  }, [getDashboardForwards, getAllTenorsData, GetAllInstrumentForTreasury]);

  useEffect(() => {
    if (
      getFeDiscountingData !== null &&
      getAllTenorsData !== null &&
      GetAllInstrumentForTreasury !== null
    ) {
      try {
        const { rates } = getFeDiscountingData;

        console.log(
          { rates, getAllTenorsData, GetAllInstrumentForTreasury, InputCell },
          "buildDiscountingTable"
        );
        const DiscountingInstruments =
          GetAllInstrumentForTreasury?.discountingInstruments;

        const getAllInstrument = { instruments: DiscountingInstruments };
        const { rowData, columnsData } = buildDiscountingTable(
          5,
          rates,
          getAllTenorsData,
          getAllInstrument,
          InputCell,
          onInputChange
        );

        if (rowData.length > 0) {
          setRowData(rowData);
          setColumnsData(columnsData);
          setDate(rates[0]?.dateTime);
          dispatch(FeDiscountingPublishedAction(null));
        }
      } catch (error) {
        console.log(error, "Error while building discounting table");
      }
    }
    return () => {
      dispatch(FeDiscountingPublishedAction(null));
    };
  }, [getFeDiscountingData, getAllTenorsData, GetAllInstrumentForTreasury]);

  const handlePublishDiscount = () => {
    const payloadData = buildCurrentRatesPayload(rowData);
    let Data = { CurrentRates: payloadData };

    console.log(payloadData, "payloadDatapayloadDatapayloadData");
    // const checkDoNotempty = payloadData.every(
    //   (item) => item.Rate !== "" && Number(item.Rate) !== 0
    // );

    // if (!checkDoNotempty) {
    //   showMessage("Rate fields cannot be 0 or empty for any currency");
    //   return;
    // }
    dispatch(PublishFEDiscountingTableApi({ navigate, Data }));
  };
  return (
    <>
      <div className="datetime fw-bold text-end mb-2 ff-roboto">
        {date
          ? moment(formatDateUTCToGMT(date)).format("DD MMM YYYY, hh:mm:ss")
          : ""}
        {/* 05 Aug 2025, 11:20:58 */}
      </div>
      <GlobalTable
        prefixCls="DealerAndTreasuryDiscountTable"
        columns={columnsData}
        dataSource={rowData}
        pagination={false}
      />

      <span className="d-flex justify-content-center mt-4">
        <CustomButton
          applyClass="publishForwardsBtn"
          value={"Publish FE Discounting"}
          loading={FeDiscountingButtonLoading}
          disabled={marketStatus === false ? true : false}
          onClick={handlePublishDiscount}
        />
      </span>
    </>
  );
};

export default FeDiscountingTable;
