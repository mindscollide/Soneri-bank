import { useSelector } from "react-redux";
import styles from "./TreasuryFEDiscountingTable.module.css";
import { useEffect, useMemo, useState } from "react";
import { buildDiscountingTable } from "../../../../shareComponents/commonComponents/utils/generateColumnsData";
import { IndexCell } from "../../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import { throttle } from "lodash";
import GlobalTable from "../../../../shareComponents/commonComponents/elements/table/GlobalTable";

const TreasuryFeDiscountingTable = () => {
  const [dataSource, setDataSource] = useState([]);
  const [columnsData, setColumnsData] = useState([]);

  const GetDiscountingRatesForTreasury = useSelector(
    (state) => state.WatchListReducer.GetDiscountingRatesForTreasury
  );

  const getAllTenorsRecords = useSelector(
    (state) => state.WatchListReducer.getAllTenors
  );
  const allInstrumentForTreasuryData = useSelector(
    (state) => state.WatchListReducer.GetAllInstrumentForTreasury
  );

  //   const CategoryFeDiscounting = useSelector(
  //     (state) => state.RealtimeActionsSlice.CategoryFeDiscounting
  //   );

  const TreasuryFeDiscounting = useSelector(
    (state) => state.RealtimeActionsSlice.TreasuryFeDiscounting
  );

  const marketStatus = useSelector(
    (state) => state.WatchListReducer.getMarketStatus
  );

  //   const ClearRatesData = useSelector(
  //     (state) => state.RealtimeActionsSlice.CategoryDiscountingClearRates
  //   );

  //   console.log("CategoryFeDiscounting MQTT: ", CategoryFeDiscounting);

  useEffect(() => {
    if (getAllTenorsRecords !== null && allInstrumentForTreasuryData !== null) {
      try {
        const { feDiscountingRates = [] } =
          GetDiscountingRatesForTreasury !== null &&
          GetDiscountingRatesForTreasury;
        let getAllInstrument = {
          instruments: allInstrumentForTreasuryData.discountingInstruments,
        };
        let getAllTenorsData = { tenors: getAllTenorsRecords.tenors };

        const { columnsData, rowData } = buildDiscountingTable(
          3,
          feDiscountingRates,
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
    GetDiscountingRatesForTreasury,
  ]);

  // const throttledUpdate = useMemo(
  //   () =>
  //     throttle((discountingUpdate) => {
  //       const { instrumentFEDiscountingData } = discountingUpdate;
  //       console.log(instrumentFEDiscountingData, "instrumentFEDiscountingData");
  //       setDataSource((prevData) =>
  //         prevData.map((row) => {
  //           let updatedRow = { ...row };

  //           instrumentFEDiscountingData.forEach((d) => {
  //             Object.keys(row).forEach((key) => {
  //               if (
  //                 key.startsWith("InstrumentID_") &&
  //                 row[key] === d.instrumentID &&
  //                 row.TenorID === d.tenorID
  //               ) {
  //                 const currency = key.split("_")[1];
  //                 updatedRow[`rate_${currency}`] = d.bidWithSpread;
  //               }
  //             });
  //           });

  //           return updatedRow;
  //         })
  //       );
  //     }, 20),
  //   []
  // );

  const throttledUpdate = useMemo(
    () =>
      throttle((discountingUpdate) => {
        const { feDiscountingRates } = discountingUpdate;
        setDataSource((prevData) =>
          prevData.map((row) => {
            let updatedRow = { ...row };

            feDiscountingRates.forEach((d) => {
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
    if (TreasuryFeDiscounting) {
      throttledUpdate(TreasuryFeDiscounting);
    }
  }, [TreasuryFeDiscounting, throttledUpdate]);

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
  //   useEffect(() => {
  //     if (!ClearRatesData?.areRatesClear) return;

  //     try {
  //       if (GetCategoryWiseDiscountingRates?.feDiscountingRates?.length) {
  //         // 🔹 Reset Redux rates to "0"
  //         const clearedDiscountingRates =
  //           GetCategoryWiseDiscountingRates.feDiscountingRates.map((item) => ({
  //             ...item,
  //             rate: "0",
  //           }));

  //         const updatedData = {
  //           ...GetCategoryWiseDiscountingRates,
  //           feDiscountingRates: clearedDiscountingRates,
  //         };

  //         dispatch(UpdateGetCategoryWiseDiscountingRates(updatedData));

  //         console.log(
  //           clearedDiscountingRates,
  //           "✅ Cleared FE Discounting Rates in Redux"
  //         );
  //       } else {
  //         // 🔹 Fallback: Clear only local dataSource
  //         setDataSource((prevData) =>
  //           prevData.map((row) => {
  //             const updatedRow = { ...row };
  //             for (const key in updatedRow) {
  //               if (key.startsWith("rate_")) {
  //                 updatedRow[key] = "0";
  //               }
  //             }
  //             return updatedRow;
  //           })
  //         );
  //         console.log("✅ Cleared FE Discounting Rates in local dataSource");
  //       }

  //       // 🔹 Always reset clear flag
  //       dispatch(clearCategoryDiscountingClearRates());
  //     } catch (error) {
  //       console.error("❌ Error while clearing FE Discounting Rates:", error);
  //     }
  //   }, [ClearRatesData, GetCategoryWiseDiscountingRates, dispatch]);

  return (
    <div className={styles["mainDiscountingTable"]}>
      <span className="flex-fill mt-3 fs-4 fw-bold color-black mb-1">
        FE Discounting
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

export default TreasuryFeDiscountingTable;
