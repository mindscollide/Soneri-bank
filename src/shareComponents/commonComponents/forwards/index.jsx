import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import styles from "./forwards.module.css";

import { throttle } from "lodash";

import { useDispatch } from "react-redux";
import { buildForwardsTable } from "../utils/generateColumnsData";
import {
  clearDealerForwardClearRates,
  setDealerForwardTenorChanged,
} from "../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";
import { IndexCell } from "../elements/inputField/IndexCell";
import GlobalTable from "../elements/table/GlobalTable";
import { UpdateDealerForwardRates } from "../../../store/slicers/watchListSlicer/WatchListSlicer";

const Forwards = () => {
  const dispatch = useDispatch();
  const [dataSource, setDataSource] = useState([]);
  const [columnsData, setColumnsData] = useState([]);

  const TreasuryDealerForwardRates = useSelector(
    (state) => state.RealtimeActionsSlice.TreasuryDealerForwardRates
  );
  // const GetCategoryWiseForwardRatesData = null;
  // console.log(
  //   GetCategoryWiseForwardRatesData,
  //   "GetCategoryWiseForwardRatesDataGetCategoryWiseForwardRatesData"
  // );
  const GetBankForwardForTreasuryDealer = useSelector(
    (state) => state.WatchListReducer.GetBankForwardForTreasuryDealer
  );

  const allInstrumentForTreasuryData = useSelector(
    (state) => state.WatchListReducer.GetAllInstrumentForTreasury
  );

  const getAllTenorsRecords = useSelector(
    (state) => state.WatchListReducer.getAllTenors
  );

  // const CategoryForwardRates = useSelector(
  //   (state) => state.RealtimeActionsSlice.CategoryForwardRates
  // );

  // const TreasuryDealerForwardRates = useSelector(
  //   (state) => state.RealtimeActionsSlice.TreasuryDealerForwardRates
  // );

  const dealerForwardTenorChanged = useSelector(
    (state) => state.RealtimeActionsSlice.dealerForwardTenorChanged
  );
  const marketStatus = useSelector(
    (state) => state.WatchListReducer.getMarketStatus
  );

  const ClearRatesData = useSelector(
    (state) => state.RealtimeActionsSlice.DealerForwardClearRates
  );

  // Define the data source for the Ant Design Table
  useEffect(() => {
    if (getAllTenorsRecords !== null && allInstrumentForTreasuryData !== null) {
      try {
        let getAllTenorsData = { tenors: getAllTenorsRecords.tenors };
        let getAllInstrument = {
          instruments: allInstrumentForTreasuryData.forwardInstruments,
        };

        const { forwardRates = [] } =
          GetBankForwardForTreasuryDealer !== null &&
          GetBankForwardForTreasuryDealer;

        const { rowData, columnsData } = buildForwardsTable(
          3,
          forwardRates,
          getAllTenorsData,
          getAllInstrument,
          IndexCell
        );
        if (rowData.length > 0) {
          setDataSource(rowData);
          setColumnsData(columnsData);
        }
      } catch (error) {
        console.log(error, "Error while building discounting table");
      }
    }
  }, [
    allInstrumentForTreasuryData,
    getAllTenorsRecords,
    GetBankForwardForTreasuryDealer,
  ]);

  // useEffect(() => {
  //   if (
  //     categoryFowardsTenorsChanges !== null &&
  //     getAllTenorsRecords !== null &&
  //     allInstrumentForTreasuryData !== null
  //   ) {
  //     try {
  //       const { newIsForwardtenorList = [], removedtenorList = [] } =
  //         categoryFowardsTenorsChanges;
  //       const allTenors = [...(getAllTenorsRecords.tenors || [])];

  //       // Convert arrays of objects to Set of IDs
  //       const removedSet = new Set(
  //         removedtenorList.map((item) => item.tenorID)
  //       );

  //       // Update each tenor's isForwardingApplicable field
  //       const updatedTenors = allTenors.map((tenor) => ({
  //         ...tenor,
  //         isForwardingApplicable: removedSet.has(tenor.tenorID) ? false : true, // leave unchanged if in neither
  //       }));

  //       let getAllTenorsData = { tenors: updatedTenors };
  //       let getAllInstrument = {
  //         instruments: allInstrumentForTreasuryData.forwardInstruments,
  //       };

  //       const { forwardRates = [] } =
  //         GetCategoryWiseForwardRatesData !== null &&
  //         GetCategoryWiseForwardRatesData;
  //       const { rowData, columnsData } = buildForwardsTable(
  //         forwardRates,
  //         getAllTenorsData,
  //         getAllInstrument,
  //         IndexCell
  //       );
  //       if (rowData.length > 0) {
  //         setDataSource(rowData);
  //         setColumnsData(columnsData);
  //       }
  //       dispatch(setCategoryFowardsTenorsChanges(null));
  //       console.log(updatedTenors, "updatedTenorsupdatedTenors");
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }
  // }, [
  //   categoryFowardsTenorsChanges,
  //   getAllTenorsRecords,
  //   allInstrumentForTreasuryData,
  // ]);

  const throttledCategoryForwardUpdate = useMemo(
    () =>
      throttle((forwardRatesUpdate) => {
        const { forwardRates } = forwardRatesUpdate;

        setDataSource((prevData) =>
          prevData.map((row) => {
            let updatedRow = { ...row };

            forwardRates.forEach((d) => {
              Object.keys(row).forEach((key) => {
                if (
                  key.startsWith("InstrumentID_") &&
                  row[key] === d.instrumentID &&
                  row.tenorID === d.tenorID
                ) {
                  const currency = key.split("_")[1]; // e.g., USD
                  updatedRow[`bid_${currency}`] = d.bidWithSpread;
                  updatedRow[`ask_${currency}`] = d.askWithSpread;
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
    if (TreasuryDealerForwardRates) {
      throttledCategoryForwardUpdate(TreasuryDealerForwardRates);
    }
  }, [TreasuryDealerForwardRates, throttledCategoryForwardUpdate]);

  useEffect(() => {
    if (marketStatus !== null && marketStatus === false) {
      setDataSource((prevData) =>
        prevData.map((row) => {
          const updatedRow = { ...row };
          Object.keys(row).forEach((key) => {
            if (key.startsWith("bid_") || key.startsWith("ask_")) {
              updatedRow[key] = 0;
            }
          });
          return updatedRow;
        })
      );
    }
  }, [marketStatus]);

  useEffect(() => {
    if (
      dealerForwardTenorChanged !== null &&
      getAllTenorsRecords !== null &&
      allInstrumentForTreasuryData !== null
    ) {
      try {
        const { newIsForwardtenorList = [], removedtenorList = [] } =
          dealerForwardTenorChanged;
        const allTenors = [...(getAllTenorsRecords.tenors || [])];

        // Convert arrays of objects to Set of IDs
        const removedSet = new Set(
          removedtenorList.map((item) => item.tenorID)
        );

        // Update each tenor's isForwardingApplicable field
        const updatedTenors = allTenors.map((tenor) => ({
          ...tenor,
          isForwardingApplicable: removedSet.has(tenor.tenorID) ? false : true, // leave unchanged if in neither
        }));
        let getAllTenorsData = { tenors: updatedTenors };
        let getAllInstrument = {
          instruments: allInstrumentForTreasuryData.forwardInstruments,
        };

        const { forwardRates = [] } =
          GetBankForwardForTreasuryDealer !== null &&
          GetBankForwardForTreasuryDealer;

        const { rowData, columnsData } = buildForwardsTable(
          3,
          forwardRates,
          getAllTenorsData,
          getAllInstrument,
          IndexCell
        );

        if (rowData.length > 0) {
          setDataSource(rowData);
          setColumnsData(columnsData);
        }
        dispatch(setDealerForwardTenorChanged(null));
      } catch (error) {
        console.log(error);
      }
    }
  }, [
    dealerForwardTenorChanged,
    getAllTenorsRecords,
    allInstrumentForTreasuryData,
  ]);
  GetBankForwardForTreasuryDealer;

  // For clear Forward Rates
  useEffect(() => {
    if (!ClearRatesData?.areRatesClear) return;

    if (GetBankForwardForTreasuryDealer?.forwardRates) {
      // ✅ Clear bid/ask values
      const clearedForwardRates =
        GetBankForwardForTreasuryDealer.forwardRates.map((item) => ({
          ...item,
          bid: 0,
          ask: 0,
        }));

      const newGetCategoryWiseForwardRatesData = {
        ...GetBankForwardForTreasuryDealer,
        forwardRates: clearedForwardRates,
      };

      dispatch(UpdateDealerForwardRates(newGetCategoryWiseForwardRatesData));
    } else {
      // ✅ Fallback: clear current local dataSource if Redux data missing
      setDataSource((prevData) =>
        prevData.map((row) => {
          const updatedRow = { ...row };
          Object.keys(row).forEach((key) => {
            if (key.startsWith("bid_") || key.startsWith("ask_")) {
              updatedRow[key] = 0;
            }
          });
          return updatedRow;
        })
      );
    }

    // ✅ Reset ClearRatesData flag in Redux
    dispatch(clearDealerForwardClearRates());
  }, [ClearRatesData, GetBankForwardForTreasuryDealer, dispatch]);

  // // For clear Forward Rates
  // useEffect(() => {
  //   if (!ClearRatesData?.areRatesClear) return;

  //   if (GetCategoryWiseForwardRatesData?.forwardRates) {
  //     // ✅ Clear bid/ask values
  //     const clearedForwardRates =
  //       GetCategoryWiseForwardRatesData.forwardRates.map((item) => ({
  //         ...item,
  //         bid: 0,
  //         ask: 0,
  //       }));

  //     const newGetCategoryWiseForwardRatesData = {
  //       ...GetCategoryWiseForwardRatesData,
  //       forwardRates: clearedForwardRates,
  //     };

  //     dispatch(
  //       UpdateGetCategoryWiseForwardRates(newGetCategoryWiseForwardRatesData)
  //     );
  //   } else {
  //     // ✅ Fallback: clear current local dataSource if Redux data missing
  //     setDataSource((prevData) =>
  //       prevData.map((row) => {
  //         const updatedRow = { ...row };
  //         Object.keys(row).forEach((key) => {
  //           if (key.startsWith("bid_") || key.startsWith("ask_")) {
  //             updatedRow[key] = 0;
  //           }
  //         });
  //         return updatedRow;
  //       })
  //     );
  //   }

  //   // ✅ Reset ClearRatesData flag in Redux
  //   dispatch(clearCategoryForwardClearRates());
  // }, [ClearRatesData, GetCategoryWiseForwardRatesData, dispatch]);

  return (
    <>
      <div className={styles["mainForwardTable"]}>
        <span className="flex-fill mt-3 fs-4 fw-bold color-black mb-1">
          Bank Forwards
        </span>
        <GlobalTable
          columns={columnsData}
          prefixCls={"Dealer_Forwards_Treasury"}
          dataSource={dataSource}
          pagination={false}
          scroll={{ x: "scroll" }}
        />
      </div>
    </>
  );
};

export default Forwards;
