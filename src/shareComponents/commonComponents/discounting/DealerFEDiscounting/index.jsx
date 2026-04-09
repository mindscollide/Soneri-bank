import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { throttle } from "lodash";
import { buildDiscountingTable } from "../../utils/generateColumnsData";
import { IndexCell } from "../../elements/inputField/IndexCell";
import GlobalTable from "../../elements/table/GlobalTable";
import styles from "./dealerFEDiscountingTable.module.css";
import { UpdateDealerDiscountingRates } from "../../../../store/slicers/watchListSlicer/WatchListSlicer";
import {
  clearDealerDiscountingClearRates,
  clearTreasuryDealerFeDiscounting,
} from "../../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";

// ─────────────────────────────────────────────
// Constants & Helpers
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
const DealerFeDiscountingTable = () => {
  const dispatch = useDispatch();

  // Local State
  const [dataSource, setDataSource] = useState([]);
  const [columnsData, setColumnsData] = useState([]);

  // Mutable Refs for high-speed data handling
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
  const TreasuryDealerFeDiscounting = useSelector(
    (state) => state.RealtimeActionsSlice.TreasuryDealerFeDiscounting
  );
  const marketStatus = useSelector(
    (state) => state.WatchListReducer.getMarketStatus
  );
  const ClearRatesData = useSelector(
    (state) => state.RealtimeActionsSlice.DealerDiscountingClearRates
  );

  // ─────────────────────────────────────────────
  // Core State Updater
  const applyRows = useCallback((rows) => {
    dataSourceRef.current = rows;
    setDataSource(rows);
  }, []);

  // ─────────────────────────────────────────────
  // 1. Initial Table Build
  useEffect(() => {
    if (getAllTenorsRecords && allInstrumentForTreasuryData) {
      try {
        const { feDiscountingRates = [] } = GetDiscountingRatesForDealer || {};
        const getAllInstrument = {
          instruments: allInstrumentForTreasuryData.discountingInstruments,
        };
        const getAllTenorsData = { tenors: getAllTenorsRecords.tenors };

        const { columnsData: cols, rowData } = buildDiscountingTable(
          3,
          feDiscountingRates,
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
        console.error("Initial Build Error:", error);
      }
    }
  }, [
    getAllTenorsRecords,
    allInstrumentForTreasuryData,
    GetDiscountingRatesForDealer,
    applyRows,
  ]);

  // ─────────────────────────────────────────────
  // 2. Throttled Batch Processor (O(N) Complexity)
  const throttledUpdateRef = useRef(
    throttle(() => {
      const pending = pendingRatesRef.current;
      if (!pending.length) return;

      // Extract all rates from the accumulated buffer
      const allRates = pending.flatMap((p) => p.feDiscountingRates ?? []);
      if (!allRates.length) return;

      // Build O(1) Lookup Map for instant access
      const rateMap = new Map(
        allRates.map((d) => [`${d.tenorID}|${d.instrumentID}`, d])
      );

      // Track affected tenors to skip unnecessary row clones
      const affectedTenors = new Set(allRates.map((d) => String(d.tenorID)));

      const updated = dataSourceRef.current.map((row) => {
        const currentTenorId = String(row.TenorID || row.tenorID);

        // Performance: Skip row update if this tenor didn't change in this batch
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

      // Clear local buffer
      pendingRatesRef.current = [];
      // Clear Redux buffer so we don't re-process the same data
      dispatch(clearTreasuryDealerFeDiscounting());
    }, THROTTLE_MS)
  );

  // ─────────────────────────────────────────────
  // 3. Receive Array-based MQTT Updates
  useEffect(() => {
    if (
      !TreasuryDealerFeDiscounting ||
      TreasuryDealerFeDiscounting.length === 0
    )
      return;

    // Push the current Redux array buffer into our local processing ref
    pendingRatesRef.current = [
      ...pendingRatesRef.current,
      ...TreasuryDealerFeDiscounting,
    ];
    throttledUpdateRef.current();
  }, [TreasuryDealerFeDiscounting]);

  // ─────────────────────────────────────────────
  // 4. Handle Market Closure
  useEffect(() => {
    if (marketStatus === false && isTableInitialized.current) {
      applyRows(zeroRates(dataSourceRef.current));
    }
  }, [marketStatus, applyRows]);

  // ─────────────────────────────────────────────
  // 5. Handle Global Rate Clear (e.g., from UI button)
  useEffect(() => {
    if (!ClearRatesData?.areRatesClear) return;

    try {
      if (GetDiscountingRatesForDealer?.feDiscountingRates?.length) {
        const clearedDiscountingRates =
          GetDiscountingRatesForDealer.feDiscountingRates.map((item) => ({
            ...item,
            rate: "0",
          }));

        dispatch(
          UpdateDealerDiscountingRates({
            ...GetDiscountingRatesForDealer,
            feDiscountingRates: clearedDiscountingRates,
          })
        );
      } else {
        applyRows(zeroRates(dataSourceRef.current));
      }
      dispatch(clearDealerDiscountingClearRates());
    } catch (error) {
      console.error("Clear Rates Error:", error);
    }
  }, [ClearRatesData, GetDiscountingRatesForDealer, dispatch, applyRows]);

  // Cleanup throttle on unmount
  useEffect(() => {
    return () => throttledUpdateRef.current.cancel();
  }, []);

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

export default DealerFeDiscountingTable;
