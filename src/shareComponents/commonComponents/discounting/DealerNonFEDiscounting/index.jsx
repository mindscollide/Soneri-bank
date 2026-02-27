import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { buildDiscountingTable } from "../../utils/generateColumnsData";
import { IndexCell } from "../../elements/inputField/IndexCell";
import { throttle } from "lodash";
import GlobalTable from "../../elements/table/GlobalTable";
import { Col, Row } from "react-bootstrap";
import styles from "./dealerNonFEDiscountingTable.module.css";
import { UpdateDealerDiscountingRates } from "../../../../store/slicers/watchListSlicer/WatchListSlicer";
import { clearDealerDiscountingClearRates } from "../../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";

const DealerNonFeDiscountingTable = () => {
  const dispatch = useDispatch();
  const [dataSource, setDataSource] = useState([]);
  const [columnsData, setColumnsData] = useState([]);

  const GetDiscountingRatesForDealer = useSelector(
    (state) => state.WatchListReducer.GetDiscountingRatesForDealer
  );

  const getAllTenorsRecords = useSelector(
    (state) => state.WatchListReducer.getAllTenors
  );
  const allInstrumentForTreasuryData = useSelector(
    (state) => state.WatchListReducer.GetAllInstrumentForTreasury
  );

  const TreasuryDealerNonFeDiscounting = useSelector(
    (state) => state.RealtimeActionsSlice.TreasuryDealerNonFeDiscounting
  );

  const marketStatus = useSelector(
    (state) => state.WatchListReducer.getMarketStatus
  );

  const ClearRatesData = useSelector(
    (state) => state.RealtimeActionsSlice.DealerDiscountingClearRates
  );

  useEffect(() => {
    if (getAllTenorsRecords !== null && allInstrumentForTreasuryData !== null) {
      try {
        const { nonFEDiscountingRates = [] } =
          GetDiscountingRatesForDealer !== null && GetDiscountingRatesForDealer;
        let getAllInstrument = {
          instruments: allInstrumentForTreasuryData.nonFEDiscountingInstruments,
        };
        let getAllTenorsData = { tenors: getAllTenorsRecords.tenors };

        const { columnsData, rowData } = buildDiscountingTable(
          3,
          nonFEDiscountingRates,
          getAllTenorsData,
          getAllInstrument,
          IndexCell
        );

        if (rowData.length > 0) {
          setDataSource(rowData);
          setColumnsData(columnsData);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }, [
    getAllTenorsRecords,
    allInstrumentForTreasuryData,
    GetDiscountingRatesForDealer,
  ]);

  const throttledUpdate = useMemo(
    () =>
      throttle((discountingUpdate) => {
        const { nonFeDiscountingRates } = discountingUpdate;
        setDataSource((prevData) =>
          prevData.map((row) => {
            let updatedRow = { ...row };

            nonFeDiscountingRates.forEach((d) => {
              Object.keys(row).forEach((key) => {
                if (
                  key.startsWith("InstrumentID_") &&
                  row[key] === d.instrumentID &&
                  row.TenorID === d.tenorID
                ) {
                  const currency = key.split("_")[1];
                  updatedRow[`rate_${currency}`] = d.bidWithSpread;
                }
              });
            });

            return updatedRow;
          })
        );
      }, 20),
    []
  );

  useEffect(() => {
    if (TreasuryDealerNonFeDiscounting) {
      throttledUpdate(TreasuryDealerNonFeDiscounting);
    }
  }, [TreasuryDealerNonFeDiscounting, throttledUpdate]);

  useEffect(() => {
    if (marketStatus !== null && marketStatus === false) {
      // Market closed: set all rates to 0
      setDataSource((prevData) =>
        prevData.map((row) => {
          const updatedRow = { ...row };
          Object.keys(updatedRow).forEach((key) => {
            if (key.startsWith("rate_")) {
              updatedRow[key] = 0;
            }
          });
          return updatedRow;
        })
      );
    }
  }, [marketStatus]);

  // ✅ For clear FE Discounting Rates
  useEffect(() => {
    if (!ClearRatesData?.areRatesClear) return;

    try {
      if (GetDiscountingRatesForDealer?.nonFEDiscountingRates?.length) {
        // 🔹 Reset Redux rates to "0"
        const clearedDiscountingRates =
          GetDiscountingRatesForDealer.nonFEDiscountingRates.map((item) => ({
            ...item,
            rate: "0",
          }));

        const updatedData = {
          ...GetDiscountingRatesForDealer,
          nonFEDiscountingRates: clearedDiscountingRates,
        };

        dispatch(UpdateDealerDiscountingRates(updatedData));

        console.log(
          clearedDiscountingRates,
          "✅ Cleared FE Discounting Rates in Redux"
        );
      } else {
        // 🔹 Fallback: Clear only local dataSource
        setDataSource((prevData) =>
          prevData.map((row) => {
            const updatedRow = { ...row };
            for (const key in updatedRow) {
              if (key.startsWith("rate_")) {
                updatedRow[key] = "0";
              }
            }
            return updatedRow;
          })
        );
        console.log("✅ Cleared FE Discounting Rates in local dataSource");
      }

      // 🔹 Always reset clear flag
      dispatch(clearDealerDiscountingClearRates());
    } catch (error) {
      console.error("❌ Error while clearing FE Discounting Rates:", error);
    }
  }, [ClearRatesData, GetDiscountingRatesForDealer, dispatch]);

  return (
    <div className={styles["mainDiscountingTable"]}>
      <span className="flex-fill mt-3 fs-4 fw-bold color-black mb-1">
        Non FE Discounting
      </span>
      <GlobalTable
        columns={columnsData}
        dataSource={dataSource}
        prefixCls="Dealer_FE_Discounting"
        pagination={false}
      />
    </div>
  );
};

export default DealerNonFeDiscountingTable;
