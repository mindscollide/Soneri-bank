import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./forwards.module.css";
import { throttle } from "lodash";

import {
  clearTreasuryForwardRates,
  setDealerForwardTenorChanged,
} from "../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";

import GlobalTable from "../../../shareComponents/commonComponents/elements/table/GlobalTable";
import { IndexCell } from "../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import { buildForwardsTable } from "../../../shareComponents/commonComponents/utils/generateColumnsData";
import { useMqttTopics } from "../../../hook/useMqttTopics";

// ─────────────────────────────────────────────
const EMPTY_RATE_VALUE = null;
const THROTTLE_MS = 100;

// ─────────────────────────────────────────────
// Helpers
const extractInstrumentMeta = (referenceRow) => {
  if (!referenceRow) return {};
  return Object.fromEntries(
    Object.entries(referenceRow).filter(
      ([key]) =>
        key.startsWith("InstrumentID_") || key.startsWith("InstrumentName_")
    )
  );
};

const buildMetaFromInstruments = (instrumentList) => {
  const meta = {};
  for (const inst of instrumentList) {
    meta[`InstrumentID_${inst.instrumentName}`] = inst.instrumentID;
    meta[`InstrumentName_${inst.instrumentName}`] = inst.instrumentName;
  }
  return meta;
};

const buildBidAskFromInstruments = (instrumentList) => {
  const bidAsk = {};
  for (const inst of instrumentList) {
    bidAsk[`bid_${inst.instrumentName}`] = EMPTY_RATE_VALUE;
    bidAsk[`ask_${inst.instrumentName}`] = EMPTY_RATE_VALUE;
  }
  return bidAsk;
};

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

const zeroBidAsk = (rows) =>
  rows.map((row) => {
    const updated = { ...row };
    Object.keys(updated).forEach((key) => {
      if (key.startsWith("bid_") || key.startsWith("ask_")) {
        updated[key] = 0;
      }
    });
    return updated;
  });

// ─────────────────────────────────────────────
const Forwards = () => {
  useMqttTopics([`SBL_REAL_TIME_FEED_TREASURY`]);

  const dispatch = useDispatch();

  const [dataSource, setDataSource] = useState([]);
  const [columnsData, setColumnsData] = useState([]);

  const dataSourceRef = useRef([]);
  const instrumentListRef = useRef([]);
  const pendingRatesRef = useRef([]);
  const isTableInitialized = useRef(false);

  // Redux
  const TreasuryForwardRates = useSelector(
    (state) => state.RealtimeActionsSlice.TreasuryForwardRates
  );

  const GetBankForwardForTreasury = useSelector(
    (state) => state.WatchListReducer.GetBankForwardForTreasury
  );

  const allInstrumentForTreasuryData = useSelector(
    (state) => state.WatchListReducer.GetAllInstrumentForTreasury
  );

  const getAllTenorsRecords = useSelector(
    (state) => state.WatchListReducer.getAllTenors
  );

  const marketStatus = useSelector(
    (state) => state.WatchListReducer.getMarketStatus
  );

  const dealerForwardTenorChanged = useSelector(
    (state) => state.RealtimeActionsSlice.dealerForwardTenorChanged
  );

  // ─────────────────────────────────────────────
  const applyRows = useCallback((rows) => {
    dataSourceRef.current = rows;
    setDataSource(rows);
  }, []);

  // ─────────────────────────────────────────────
  // Sync instrument list (FIXED)
  useEffect(() => {
    if (allInstrumentForTreasuryData?.forwardInstruments) {
      instrumentListRef.current =
        allInstrumentForTreasuryData.forwardInstruments;
    }
  }, [allInstrumentForTreasuryData]);

  // ─────────────────────────────────────────────
  // Initial table build
  useEffect(() => {
    if (getAllTenorsRecords && allInstrumentForTreasuryData) {
      try {
        const { forwardRates = [] } = GetBankForwardForTreasury || {};

        const { rowData, columnsData: cols } = buildForwardsTable(
          3,
          forwardRates,
          { tenors: getAllTenorsRecords.tenors },
          {
            instruments: allInstrumentForTreasuryData.forwardInstruments,
          },
          IndexCell
        );

        if (rowData.length) {
          applyRows(rowData);
          setColumnsData(cols);
          isTableInitialized.current = true;
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [
    getAllTenorsRecords,
    allInstrumentForTreasuryData,
    GetBankForwardForTreasury,
    applyRows,
  ]);

  // ─────────────────────────────────────────────
  // Throttled updates (FIXED)
  const throttledUpdateRef = useRef(
    throttle(() => {
      const pending = pendingRatesRef.current;
      if (!pending.length) return;

      const allRates = pending.flatMap((p) => p.forwardRates ?? []);

      if (!allRates.length) return;

      const rateMap = new Map(
        allRates.map((d) => [`${d.tenorID}|${d.instrumentID}`, d])
      );

      const affectedTenors = new Set(allRates.map((d) => String(d.tenorID)));

      const updated = dataSourceRef.current.map((row) => {
        if (!affectedTenors.has(String(row.tenorID))) return row;

        const updatedRow = { ...row };

        Object.keys(row).forEach((key) => {
          if (!key.startsWith("InstrumentID_")) return;

          const rate = rateMap.get(`${row.tenorID}|${row[key]}`);
          if (!rate) return;

          const currency = key.split("_")[1];

          updatedRow[`bid_${currency}`] = rate.bidWithSpread;
          updatedRow[`ask_${currency}`] = rate.askWithSpread;
        });

        return updatedRow;
      });

      applyRows(updated);

      // ✅ clear queue
      pendingRatesRef.current = [];

      dispatch(clearTreasuryForwardRates());
    }, THROTTLE_MS)
  );

  // Cleanup
  useEffect(() => {
    return () => throttledUpdateRef.current.cancel();
  }, []);

  // ─────────────────────────────────────────────
  // Receive MQTT updates (FIXED batching)
  useEffect(() => {
    if (!TreasuryForwardRates) return;

    const payload = Array.isArray(TreasuryForwardRates)
      ? TreasuryForwardRates
      : [TreasuryForwardRates];

    pendingRatesRef.current = [...pendingRatesRef.current, ...payload];

    throttledUpdateRef.current();
  }, [TreasuryForwardRates]);

  // ─────────────────────────────────────────────
  // Market closed
  useEffect(() => {
    if (marketStatus === false) {
      applyRows(zeroBidAsk(dataSourceRef.current));
    }
  }, [marketStatus, applyRows]);

  // ─────────────────────────────────────────────
  // Tenor add/remove
  useEffect(() => {
    if (!dealerForwardTenorChanged || !getAllTenorsRecords) return;
    if (!isTableInitialized.current) return;

    try {
      const { newIsForwardtenorList = [], removedtenorList = [] } =
        dealerForwardTenorChanged;

      const removedSet = new Set(removedtenorList.map((t) => t.tenorID));

      let updatedRows = dataSourceRef.current.filter(
        (row) => !removedSet.has(row.tenorID)
      );

      const existingIDs = new Set(updatedRows.map((r) => r.tenorID));

      const referenceRow = dataSourceRef.current[0] ?? null;

      for (const addedTenor of newIsForwardtenorList) {
        if (existingIDs.has(addedTenor.tenorID)) continue;

        const fullTenor =
          getAllTenorsRecords.tenors.find(
            (t) => t.tenorID === addedTenor.tenorID
          ) ?? addedTenor;

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
      console.error(err);
    }
  }, [dealerForwardTenorChanged, getAllTenorsRecords, applyRows, dispatch]);

  // ─────────────────────────────────────────────
  return (
    <div className={styles.mainForwardTable}>
      <span className="flex-fill mt-3 fs-4 fw-bold color-black mb-1">
        Bank Forwards
      </span>

      <GlobalTable
        columns={columnsData}
        prefixCls={"Dealer_Forwards_Treasury"}
        dataSource={dataSource}
        pagination={false}
        rowHoverBg={"#000"}
        scroll={{ x: "scroll" }}
      />
    </div>
  );
};

export default Forwards;
