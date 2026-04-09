import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { throttle } from "lodash";
import styles from "./forwards.module.css";
import { buildForwardsTable } from "../utils/generateColumnsData";
import {
  clearDealerForwardClearRates,
  clearTreasuryDealerForwardRates,
  setDealerForwardTenorChanged,
  setTreasuryFowardsTenorsChanges,
} from "../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";
import { IndexCell } from "../elements/inputField/IndexCell";
import GlobalTable from "../elements/table/GlobalTable";
import { UpdateDealerForwardRates } from "../../../store/slicers/watchListSlicer/WatchListSlicer";
import { useMqttTopics } from "../../../hook/useMqttTopics";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_RATE_VALUE = null;
const THROTTLE_MS = 100;

// ─────────────────────────────────────────────────────────────────────────────
// Pure helpers — defined outside the component so they are never re-created
// ─────────────────────────────────────────────────────────────────────────────

/** Picks InstrumentID_* and InstrumentName_* entries from a table row. */
const extractInstrumentMeta = (referenceRow) => {
  if (!referenceRow) return {};
  return Object.fromEntries(
    Object.entries(referenceRow).filter(
      ([key]) =>
        key.startsWith("InstrumentID_") || key.startsWith("InstrumentName_")
    )
  );
};

/** Builds an instrument-meta map from the master list (fallback path). */
const buildMetaFromInstruments = (instrumentList) => {
  const meta = {};
  for (const inst of instrumentList) {
    meta[`InstrumentID_${inst.instrumentName}`] = inst.instrumentID;
    meta[`InstrumentName_${inst.instrumentName}`] = inst.instrumentName;
  }
  return meta;
};

/** Builds an empty bid/ask map from the master instrument list (fallback path). */
const buildBidAskFromInstruments = (instrumentList) => {
  const bidAsk = {};
  for (const inst of instrumentList) {
    bidAsk[`bid_${inst.instrumentName}`] = EMPTY_RATE_VALUE;
    bidAsk[`ask_${inst.instrumentName}`] = EMPTY_RATE_VALUE;
  }
  return bidAsk;
};

/**
 * Constructs a new row for a tenor being added to the table.
 * Reuses live rates from previousRow when available; falls back to instrumentList.
 */
const buildNewTenorRow = (
  tenor,
  previousRow,
  referenceRow,
  instrumentList = []
) => {
  const sourceRow = referenceRow ?? previousRow ?? null;

  const instrumentMeta = sourceRow
    ? extractInstrumentMeta(sourceRow)
    : buildMetaFromInstruments(instrumentList);

  const bidAskValues = sourceRow
    ? Object.fromEntries(
        Object.entries(sourceRow)
          .filter(([key]) => key.startsWith("bid_") || key.startsWith("ask_"))
          .map(([key]) => [
            key,
            previousRow?.[key] != null ? previousRow[key] : EMPTY_RATE_VALUE,
          ])
      )
    : buildBidAskFromInstruments(instrumentList);

  return {
    tenorID: tenor.tenorID,
    tenorName: tenor.tenorName,
    tenorDays: tenor.tenorDays,
    ...instrumentMeta,
    ...bidAskValues,
  };
};

/** Zeroes all bid_* / ask_* keys in every row. Returns a new array. */
const zeroBidAsk = (rows) =>
  rows.map((row) => {
    const updated = { ...row };
    for (const key of Object.keys(row)) {
      if (key.startsWith("bid_") || key.startsWith("ask_")) updated[key] = 0;
    }
    return updated;
  });

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const Forwards = ({ dealerIdForMQTT }) => {
  const dispatch = useDispatch();

  // ── MQTT ──────────────────────────────────────────────────────────────────
  const mqttTopics = useMemo(
    () => [`SBL_REAL_TIME_FEED_TREASURY_DEALER_${dealerIdForMQTT}`],
    [dealerIdForMQTT]
  );
  useMqttTopics(mqttTopics);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [dataSource, setDataSource] = useState([]);
  const [columnsData, setColumnsData] = useState([]);

  // ── Mutable refs (avoid stale closures inside throttled callbacks) ─────────
  const dataSourceRef = useRef([]); // shadows dataSource without extra renders
  const instrumentListRef = useRef([]); // master instrument list for tenor-sync fallback
  const pendingRatesRef = useRef(null); // latest MQTT payload(s) waiting to flush
  const isTableInitialized = useRef(false);

  // ── Selectors ─────────────────────────────────────────────────────────────
  const TreasuryDealerForwardRates = useSelector(
    (state) => state.RealtimeActionsSlice.TreasuryDealerForwardRates
  );
  const GetBankForwardForTreasuryDealer = useSelector(
    (state) => state.WatchListReducer.GetBankForwardForTreasuryDealer
  );
  const allInstrumentForTreasuryData = useSelector(
    (state) => state.WatchListReducer.GetAllInstrumentForTreasury
  );
  const getAllTenorsRecords = useSelector(
    (state) => state.WatchListReducer.getAllTenors
  );
  const dealerForwardTenorChanged = useSelector(
    (state) => state.RealtimeActionsSlice.dealerForwardTenorChanged
  );
  const marketStatus = useSelector(
    (state) => state.WatchListReducer.getMarketStatus
  );
  const ClearRatesData = useSelector(
    (state) => state.RealtimeActionsSlice.DealerForwardClearRates
  );

  // ── Syncs both the ref and state in one call ───────────────────────────────
  const applyRows = useCallback((rows) => {
    dataSourceRef.current = rows;
    setDataSource(rows);
  }, []);

  // ── Effect 1: Initial / base table build ──────────────────────────────────
  useEffect(() => {
    if (!getAllTenorsRecords || !allInstrumentForTreasuryData) return;
    try {
      const tenorsData = { tenors: getAllTenorsRecords.tenors };
      const instrumentData = {
        instruments: allInstrumentForTreasuryData.forwardInstruments,
      };

      instrumentListRef.current =
        allInstrumentForTreasuryData.forwardInstruments;

      const forwardRates = GetBankForwardForTreasuryDealer?.forwardRates ?? [];

      const { rowData, columnsData: cols } = buildForwardsTable(
        3,
        forwardRates,
        tenorsData,
        instrumentData,
        IndexCell
      );

      if (rowData.length > 0) {
        applyRows(rowData);
        setColumnsData(cols);
        isTableInitialized.current = true;
      }
    } catch (err) {
      console.error("[Forwards] Failed to build table:", err);
    }
  }, [
    allInstrumentForTreasuryData,
    getAllTenorsRecords,
    GetBankForwardForTreasuryDealer,
    applyRows,
  ]);

  // ── Effect 2: Throttled real-time rate updates ────────────────────────────
  // Kept in a ref so it is created once, never goes stale, and can be cancelled.
  const throttledUpdateRef = useRef(
    throttle(() => {
      const pending = pendingRatesRef.current;
      if (!pending?.length) return;

      // Flatten all batched payloads into one rate list
      const allRates = pending.flatMap((p) => p.forwardRates ?? []);
      if (!allRates.length) return;

      // Build a O(1) lookup: "tenorID|instrumentID" → rate object
      const rateMap = new Map(
        allRates.map((d) => [`${d.tenorID}|${d.instrumentID}`, d])
      );

      // Collect which tenorIDs are present so we can skip unaffected rows fast
      const affectedTenors = new Set(allRates.map((d) => String(d.tenorID)));

      const updated = dataSourceRef.current.map((row) => {
        if (!affectedTenors.has(String(row.tenorID))) return row; // fast path

        const updatedRow = { ...row };
        for (const key of Object.keys(row)) {
          if (!key.startsWith("InstrumentID_")) continue;
          const rate = rateMap.get(`${row.tenorID}|${row[key]}`);
          if (!rate) continue;
          const currency = key.split("_")[1];
          updatedRow[`bid_${currency}`] = rate.bidWithSpread;
          updatedRow[`ask_${currency}`] = rate.askWithSpread;
        }
        return updatedRow;
      });

      applyRows(updated);
      dispatch(clearTreasuryDealerForwardRates());
    }, THROTTLE_MS)
  );

  // Cancel pending throttle on unmount to avoid setState on an unmounted component
  useEffect(() => {
    const fn = throttledUpdateRef.current;
    return () => fn.cancel();
  }, []);

  // Enqueue the latest MQTT payload and trigger the throttled flush
  useEffect(() => {
    if (!TreasuryDealerForwardRates?.length) return;
    pendingRatesRef.current = TreasuryDealerForwardRates;
    throttledUpdateRef.current();
  }, [TreasuryDealerForwardRates]);

  // ── Effect 3: Market closed — zero out every rate ─────────────────────────
  useEffect(() => {
    if (marketStatus === false) applyRows(zeroBidAsk(dataSourceRef.current));
  }, [marketStatus, applyRows]);

  // ── Effect 4: Tenor add / remove (incremental, preserves live rates) ───────
  useEffect(() => {
    if (!dealerForwardTenorChanged || !getAllTenorsRecords) return;
    if (!isTableInitialized.current) return; // table not ready yet

    try {
      const { newIsForwardtenorList = [], removedtenorList = [] } =
        dealerForwardTenorChanged;

      const removedSet = new Set(removedtenorList.map((t) => t.tenorID));

      if (!removedSet.size && !newIsForwardtenorList.length) {
        dispatch(setDealerForwardTenorChanged(null));
        return;
      }

      // Remove rows whose tenors are no longer applicable
      let updatedRows = dataSourceRef.current.filter(
        (row) => !removedSet.has(row.tenorID)
      );

      const existingIDs = new Set(updatedRows.map((r) => r.tenorID));
      const referenceRow = dataSourceRef.current[0] ?? null;

      // Add rows for newly applicable tenors
      for (const addedTenor of newIsForwardtenorList) {
        if (existingIDs.has(addedTenor.tenorID)) continue;

        const fullTenor =
          getAllTenorsRecords.tenors.find(
            (t) => t.tenorID === addedTenor.tenorID
          ) ?? addedTenor;

        // Reuse any cached rates if this tenor existed before removal
        const previousRow =
          dataSourceRef.current.find((r) => r.tenorID === addedTenor.tenorID) ??
          null;

        updatedRows.push(
          buildNewTenorRow(
            fullTenor,
            previousRow,
            referenceRow,
            instrumentListRef.current
          )
        );
      }

      updatedRows.sort((a, b) => a.tenorDays - b.tenorDays);
      applyRows(updatedRows);
      dispatch(setDealerForwardTenorChanged(null));
    } catch (err) {
      console.error("[Forwards] Tenor sync error:", err);
    }
  }, [dealerForwardTenorChanged, getAllTenorsRecords, applyRows, dispatch]);

  // ── Effect 5: Clear all rates on demand ───────────────────────────────────
  useEffect(() => {
    if (!ClearRatesData?.areRatesClear) return;

    if (GetBankForwardForTreasuryDealer?.forwardRates) {
      // Keep Redux store consistent
      const clearedRates = GetBankForwardForTreasuryDealer.forwardRates.map(
        (item) => ({ ...item, bid: 0, ask: 0 })
      );
      dispatch(
        UpdateDealerForwardRates({
          ...GetBankForwardForTreasuryDealer,
          forwardRates: clearedRates,
        })
      );
    } else {
      // Fallback: clear local state only
      applyRows(zeroBidAsk(dataSourceRef.current));
    }

    dispatch(clearDealerForwardClearRates());
  }, [ClearRatesData, GetBankForwardForTreasuryDealer, applyRows, dispatch]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles["mainForwardTable"]}>
      <span className="flex-fill mt-3 fs-4 fw-bold color-black mb-1">
        Bank Forwards
      </span>
      <GlobalTable
        columns={columnsData}
        prefixCls="Dealer_Forwards_Treasury"
        dataSource={dataSource}
        pagination={false}
        scroll={{ x: "scroll" }}
      />
    </div>
  );
};

export default Forwards;
