import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import styles from "./forwards.module.css";
import { throttle } from "lodash";
import { useDispatch } from "react-redux";
import {
  clearCategoryForwardClearRates,
  setCategoryFowardsTenorsChanges,
} from "../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";
import GlobalTable from "../../../shareComponents/commonComponents/elements/table/GlobalTable";
import { IndexCell } from "../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import { buildForwardsTable } from "../../../shareComponents/commonComponents/utils/generateColumnsData";

const Forwards = () => {
  const dispatch = useDispatch();
  const [dataSource, setDataSource] = useState([]);
  const [columnsData, setColumnsData] = useState([]);

  // const GetCategoryWiseForwardRatesData = useSelector(
  //   (state) => state.categoryReducer.GetCategoryWiseForwardRates
  // );
  const TreasuryForwardRates = useSelector(
    (state) => state.RealtimeActionsSlice.TreasuryForwardRates
  );
  // const GetCategoryWiseForwardRatesData = null;
  // console.log(
  //   GetCategoryWiseForwardRatesData,
  //   "GetCategoryWiseForwardRatesDataGetCategoryWiseForwardRatesData"
  // );
  const GetBankForwardForTreasury = useSelector(
    (state) => state.WatchListReducer.GetBankForwardForTreasury
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

  const marketStatus = useSelector(
    (state) => state.WatchListReducer.getMarketStatus
  );

  // const ClearRatesData = useSelector(
  //   (state) => state.RealtimeActionsSlice.CategoryForwardClearRates
  // );
  // const categoryFowardsTenorsChanges = useSelector(
  //   (state) => state.RealtimeActionsSlice.categoryFowardsTenorsChanges
  // );

  // Define the columns structure for the Ant Design Table
  // Define the data source for the Ant Design Table
  useEffect(() => {
    if (getAllTenorsRecords !== null && allInstrumentForTreasuryData !== null) {
      try {
        let getAllTenorsData = { tenors: getAllTenorsRecords.tenors };
        let getAllInstrument = {
          instruments: allInstrumentForTreasuryData.forwardInstruments,
        };

        const { forwardRates = [] } =
          GetBankForwardForTreasury !== null && GetBankForwardForTreasury;
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
    GetBankForwardForTreasury,
  ]);
  const updateForwardRates = useMemo(
    () =>
      throttle(
        (treasuryForwardRates, setDataSource) => {
          const { forwardRates = [] } = treasuryForwardRates;
          if (forwardRates.length === 0) return;

          setDataSource((prevData) =>
            prevData.map((row) => {
              let updatedRow = { ...row };

              forwardRates.forEach((d) => {
                Object.keys(row).forEach((key) => {
                  if (
                    key.startsWith("InstrumentID_") &&
                    row[key] === d.instrumentID &&
                    row.tenorID === d.tenorID // fallback
                  ) {
                    const currency = key.split("_")[1];
                    updatedRow[`bid_${currency}`] = d.bidWithSpread;
                    updatedRow[`ask_${currency}`] = d.askWithSpread;
                  }
                });
              });

              return updatedRow;
            })
          );
        },
        2,
        { leading: true, trailing: true }
      ),
    [] // sirf ek baar banega
  );
  useEffect(() => {
    if (TreasuryForwardRates) {
      updateForwardRates(TreasuryForwardRates, setDataSource);
    }
  }, [TreasuryForwardRates, updateForwardRates, marketStatus]);
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

  // const throttledCategoryForwardUpdate = useMemo(
  //   () =>
  //     throttle((forwardRatesUpdate) => {
  //       const { instrumentForwardsData } = forwardRatesUpdate;

  //       setDataSource((prevData) =>
  //         prevData.map((row) => {
  //           let updatedRow = { ...row };

  //           instrumentForwardsData.forEach((d) => {
  //             Object.keys(row).forEach((key) => {
  //               if (
  //                 key.startsWith("InstrumentID_") &&
  //                 row[key] === d.instrumentID &&
  //                 row.tenorID === d.tenorID
  //               ) {
  //                 const currency = key.split("_")[1]; // e.g., USD
  //                 updatedRow[`bid_${currency}`] = d.bidWithSpread;
  //                 updatedRow[`ask_${currency}`] = d.askWithSpread;
  //               }
  //             });
  //           });

  //           return updatedRow;
  //         })
  //       );
  //     }, 20),
  //   []
  // );

  // useEffect(() => {
  //   if (CategoryForwardRates) {
  //     throttledCategoryForwardUpdate(CategoryForwardRates);
  //   }
  // }, [CategoryForwardRates, throttledCategoryForwardUpdate]);

  // useEffect(() => {
  //   if (marketStatus !== null && marketStatus === false) {
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
  // }, [marketStatus]);

  // For clear Forward Rates
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
          className="Dealer_Forwards_Treasury"
          dataSource={dataSource}
          pagination={false}
          rowHoverBg={"#000"}
          scroll={{ x: "scroll" }}
        />
      </div>
    </>
  );
};

export default Forwards;
