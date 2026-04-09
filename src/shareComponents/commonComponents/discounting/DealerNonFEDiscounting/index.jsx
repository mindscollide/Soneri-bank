import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { throttle } from "lodash";
import { buildDiscountingTable } from "../../utils/generateColumnsData";
import { IndexCell } from "../../elements/inputField/IndexCell";
import GlobalTable from "../../elements/table/GlobalTable";
import styles from "./dealerNonFEDiscountingTable.module.css";
import { UpdateDealerDiscountingRates } from "../../../../store/slicers/watchListSlicer/WatchListSlicer";
import {
  clearDealerDiscountingClearRates,
  clearTreasuryDealerNonFeDiscounting,
} from "../../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";

// ─────────────────────────────────────────────
// Constants
const THROTTLE_MS = 100;

const zeroRates = (rows) =>
  rows.map((row) => {
    const updated = { ...row };
    Object.keys(updated).forEach((key) => {
      if (key.startsWith("rate_")) {
        updated[key] = 0;
      }
    });
    return updated;
  });

// ─────────────────────────────────────────────
const DealerNonFeDiscountingTable = () => {
  const dispatch = useDispatch();

  // Local State
  const [dataSource, setDataSource] = useState([]);
  const [columnsData, setColumnsData] = useState([]);

  // Performance Refs
  const dataSourceRef = useRef([]);
  const pendingRatesRef = useRef([]);
  const isTableInitialized = useRef(false);

  // Redux Selectors
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

  // ─────────────────────────────────────────────
  // Core Updater
  const applyRows = useCallback((rows) => {
    dataSourceRef.current = rows;
    setDataSource(rows);
  }, []);

  // 1. Initial Table Build
  useEffect(() => {
    if (getAllTenorsRecords && allInstrumentForTreasuryData) {
      try {
        const { nonFEDiscountingRates = [] } =
          GetDiscountingRatesForDealer || {};
        const getAllInstrument = {
          instruments: allInstrumentForTreasuryData.nonFEDiscountingInstruments,
        };
        const getAllTenorsData = { tenors: getAllTenorsRecords.tenors };

        const { columnsData: cols, rowData } = buildDiscountingTable(
          3,
          nonFEDiscountingRates,
          getAllTenorsData,
          getAllInstrument,
          IndexCell
        );

        if (rowData.length > 0) {
          applyRows(rowData);
          setColumnsData(cols);
          isTableInitialized.current = true;
        }
      } catch (error) {
        console.error("Non-FE Table Build Error:", error);
      }
    }
  }, [
    getAllTenorsRecords,
    allInstrumentForTreasuryData,
    GetDiscountingRatesForDealer,
    applyRows,
  ]);

  // 2. Throttled Batch Processor (Optimized Logic)
  const throttledUpdateRef = useRef(
    throttle(() => {
      const pending = pendingRatesRef.current;
      if (!pending.length) return;

      // Flatten multiple updates into one rate list
      const allRates = pending.flatMap((p) => p.nonFeDiscountingRates ?? []);
      if (!allRates.length) return;

      // O(1) Lookup: "tenorID|instrumentID"
      const rateMap = new Map(
        allRates.map((d) => [`${d.tenorID}|${d.instrumentID}`, d])
      );

      // Identify which tenors actually need a re-render
      const affectedTenors = new Set(allRates.map((d) => String(d.tenorID)));

      const updated = dataSourceRef.current.map((row) => {
        const currentTenorId = String(row.TenorID || row.tenorID);

        if (!affectedTenors.has(currentTenorId)) return row;

        const updatedRow = { ...row };
        Object.keys(row).forEach((key) => {
          if (!key.startsWith("InstrumentID_")) return;

          const instrumentID = row[key];
          const rate = rateMap.get(`${currentTenorId}|${instrumentID}`);

          if (!rate) return;

          const currency = key.split("_")[1];
          updatedRow[`rate_${currency}`] = rate.bidWithSpread;
        });

        return updatedRow;
      });

      applyRows(updated);

      // Clear buffer and sync Redux
      pendingRatesRef.current = [];
      dispatch(clearTreasuryDealerNonFeDiscounting());
    }, THROTTLE_MS)
  );

  // 3. Receive Realtime Buffer Updates
  useEffect(() => {
    if (
      !TreasuryDealerNonFeDiscounting ||
      TreasuryDealerNonFeDiscounting.length === 0
    )
      return;

    pendingRatesRef.current = [
      ...pendingRatesRef.current,
      ...TreasuryDealerNonFeDiscounting,
    ];
    throttledUpdateRef.current();
  }, [TreasuryDealerNonFeDiscounting]);

  // 4. Handle Market Closed
  useEffect(() => {
    if (marketStatus === false && isTableInitialized.current) {
      applyRows(zeroRates(dataSourceRef.current));
    }
  }, [marketStatus, applyRows]);

  // 5. Global Clear Rates
  useEffect(() => {
    if (!ClearRatesData?.areRatesClear) return;

    try {
      if (GetDiscountingRatesForDealer?.nonFEDiscountingRates?.length) {
        const clearedRates =
          GetDiscountingRatesForDealer.nonFEDiscountingRates.map((item) => ({
            ...item,
            rate: "0",
          }));

        dispatch(
          UpdateDealerDiscountingRates({
            ...GetDiscountingRatesForDealer,
            nonFEDiscountingRates: clearedRates,
          })
        );
      } else {
        applyRows(zeroRates(dataSourceRef.current));
      }
      dispatch(clearDealerDiscountingClearRates());
    } catch (error) {
      console.error("Clear Non-FE Rates Error:", error);
    }
  }, [ClearRatesData, GetDiscountingRatesForDealer, dispatch, applyRows]);

  // Cleanup on unmount
  useEffect(() => {
    return () => throttledUpdateRef.current.cancel();
  }, []);

  return (
    <div className={styles.mainDiscountingTable}>
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
