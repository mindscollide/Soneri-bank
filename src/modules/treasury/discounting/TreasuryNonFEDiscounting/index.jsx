import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { throttle } from "lodash";
import { buildDiscountingTable } from "../../../../shareComponents/commonComponents/utils/generateColumnsData";
import { IndexCell } from "../../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import GlobalTable from "../../../../shareComponents/commonComponents/elements/table/GlobalTable";
import styles from "./treasuryNonFEDiscountingTable.module.css";
import { clearTreasuryNonFeDiscounting } from "../../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";

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
const TreasuryNonFeDiscountingTable = () => {
  const dispatch = useDispatch();

  // Local State
  const [dataSource, setDataSource] = useState([]);
  const [columnsData, setColumnsData] = useState([]);

  // Mutable Refs for extreme performance
  const dataSourceRef = useRef([]);
  const pendingRatesRef = useRef([]);
  const isTableInitialized = useRef(false);

  // Redux Selectors
  const GetDiscountingRatesForTreasury = useSelector(
    (state) => state.WatchListReducer.GetDiscountingRatesForTreasury
  );
  const getAllTenorsRecords = useSelector(
    (state) => state.WatchListReducer.getAllTenors
  );
  const allInstrumentForTreasuryData = useSelector(
    (state) => state.WatchListReducer.GetAllInstrumentForTreasury
  );
  const TreasuryNonFeDiscounting = useSelector(
    (state) => state.RealtimeActionsSlice.TreasuryNonFeDiscounting
  );
  const marketStatus = useSelector(
    (state) => state.WatchListReducer.getMarketStatus
  );

  // ─────────────────────────────────────────────
  // Sync Ref and State
  const applyRows = useCallback((rows) => {
    dataSourceRef.current = rows;
    setDataSource(rows);
  }, []);

  // 1. Initial Table Build
  useEffect(() => {
    if (getAllTenorsRecords && allInstrumentForTreasuryData) {
      try {
        const { nonFEDiscountingRates = [] } =
          GetDiscountingRatesForTreasury || {};
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
        console.error("Initial Build Error:", error);
      }
    }
  }, [
    getAllTenorsRecords,
    allInstrumentForTreasuryData,
    GetDiscountingRatesForTreasury,
    applyRows,
  ]);

  // 2. Optimized Throttled Update (The Engine)
  const throttledUpdateRef = useRef(
    throttle(() => {
      const pending = pendingRatesRef.current;
      if (!pending.length) return;

      // Flatten updates and build O(1) Lookup Map
      const allRates = pending.flatMap((p) => p.nonFeDiscountingRates ?? []);
      if (!allRates.length) return;

      // Unique Key: "tenorID|instrumentID"
      const rateMap = new Map(
        allRates.map((d) => [`${d.tenorID}|${d.instrumentID}`, d])
      );

      // Performance: Only clone rows that actually have an update in this batch
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

      // Clear buffers
      pendingRatesRef.current = [];
      dispatch(clearTreasuryNonFeDiscounting());
    }, THROTTLE_MS)
  );

  // 3. Receive Array-based Realtime Updates
  useEffect(() => {
    if (!TreasuryNonFeDiscounting || TreasuryNonFeDiscounting.length === 0)
      return;

    pendingRatesRef.current = [
      ...pendingRatesRef.current,
      ...TreasuryNonFeDiscounting,
    ];
    throttledUpdateRef.current();
  }, [TreasuryNonFeDiscounting]);

  // 4. Handle Market Status
  useEffect(() => {
    if (marketStatus === false && isTableInitialized.current) {
      applyRows(zeroRates(dataSourceRef.current));
    }
  }, [marketStatus, applyRows]);

  // Cleanup
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

export default TreasuryNonFeDiscountingTable;
