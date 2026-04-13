import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import styles from "./forwards.module.css";

import {
  clearTreasuryDealerForwardRates,
  setDealerForwardTenorChanged,
} from "../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";

import { IndexCell } from "../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import { buildForwardsAgGridTable } from "../../../shareComponents/commonComponents/utils/generateColumnsData";
import AgGridTable from "../../../shareComponents/commonComponents/elements/globalAgGridTable";
import { useMqttTopics } from "../../../hook/useMqttTopics";

const Forwards = memo(({ dealerIdForMQTT }) => {
  const dispatch = useDispatch();

  useMqttTopics([`SBL_REAL_TIME_FEED_TREASURY_DEALER_${dealerIdForMQTT}`]);

  // ─────────────────────────────
  // REFS
  const gridRef = useRef(null);
  const gridApiRef = useRef(null);
  const rowNodeMap = useRef(new Map());
  const pendingUpdates = useRef(new Map());
  const rafRef = useRef(null);
  const isMountedRef = useRef(true);

  // ─────────────────────────────
  // SELECTORS
  const TreasuryDealerForwardRates = useSelector(
    (state) => state.RealtimeActionsSlice.TreasuryDealerForwardRates,
    shallowEqual
  );

  const GetBankForwardForTreasuryDealer = useSelector(
    (state) => state.WatchListReducer.GetBankForwardForTreasuryDealer,
    shallowEqual
  );

  const allInstrumentForTreasuryData = useSelector(
    (state) => state.WatchListReducer.GetAllInstrumentForTreasury,
    shallowEqual
  );

  const getAllTenorsRecords = useSelector(
    (state) => state.WatchListReducer.getAllTenors,
    shallowEqual
  );

  const dealerForwardTenorChanged = useSelector(
    (state) => state.RealtimeActionsSlice.dealerForwardTenorChanged,
    shallowEqual
  );

  // ─────────────────────────────
  // INITIAL TABLE BUILD (STABLE)
  const { rowData, columnDefs } = useMemo(() => {
    return buildForwardsAgGridTable(
      3,
      GetBankForwardForTreasuryDealer?.forwardRates || [],
      { tenors: getAllTenorsRecords?.tenors || [] },
      { instruments: allInstrumentForTreasuryData?.forwardInstruments || [] },
      IndexCell
    );
  }, [
    getAllTenorsRecords,
    allInstrumentForTreasuryData,
    GetBankForwardForTreasuryDealer,
  ]);

  // ─────────────────────────────
  // BUILD NODE MAP
  const buildNodeMap = useCallback((api) => {
    rowNodeMap.current.clear();

    api.forEachNode((node) => {
      if (node.data?.tenorID) {
        rowNodeMap.current.set(String(node.data.tenorID), node);
      }
    });
  }, []);

  // ─────────────────────────────
  // GRID READY
  const onGridReady = useCallback((params) => {
    gridApiRef.current = params.api;
  }, []);

  // ─────────────────────────────
  // FIRST DATA RENDERED
  const onFirstDataRendered = useCallback(
    (params) => {
      buildNodeMap(params.api);
    },
    [buildNodeMap]
  );

  // ─────────────────────────────
  // REBUILD NODE MAP WHEN DATA CHANGES
  useEffect(() => {
    const api = gridApiRef.current;
    if (!api) return;

    buildNodeMap(api);
  }, [rowData, buildNodeMap]);

  // ─────────────────────────────
  // HFT PROCESSOR
  const processQueue = useCallback(() => {
    const api = gridApiRef.current;

    if (!api || rowNodeMap.current.size === 0) {
      rafRef.current = requestAnimationFrame(processQueue);
      return;
    }

    if (pendingUpdates.current.size === 0) {
      rafRef.current = null;
      return;
    }

    for (const [key, update] of pendingUpdates.current.entries()) {
      const [tenorID, instrumentName] = key.split("|");
      const node = rowNodeMap.current.get(String(tenorID));

      if (node) {
        node.setDataValue(`bid_${instrumentName}`, update.bid);
        node.setDataValue(`ask_${instrumentName}`, update.ask);

        // ✅ delete only when applied
        pendingUpdates.current.delete(key);
      }
    }

    rafRef.current = null;
  }, []);

  // ─────────────────────────────
  // MQTT FEED HANDLER
  useEffect(() => {
    if (
      !TreasuryDealerForwardRates ||
      !allInstrumentForTreasuryData?.forwardInstruments
    )
      return;

    const feeds = Array.isArray(TreasuryDealerForwardRates)
      ? TreasuryDealerForwardRates
      : [TreasuryDealerForwardRates];

    feeds.forEach((feed) => {
      feed.forwardRates?.forEach((rate) => {
        const inst = allInstrumentForTreasuryData.forwardInstruments.find(
          (i) => Number(i.instrumentID) === Number(rate.instrumentID)
        );

        if (inst) {
          const key = `${String(rate.tenorID)}|${inst.instrumentName}`;

          pendingUpdates.current.set(key, {
            bid: rate.bidWithSpread,
            ask: rate.askWithSpread,
          });
        }
      });
    });

    if (!rafRef.current && pendingUpdates.current.size > 0) {
      rafRef.current = requestAnimationFrame(processQueue);
    }

    const clearId = setTimeout(() => {
      if (isMountedRef.current) {
        dispatch(clearTreasuryDealerForwardRates());
      }
    }, 50);

    return () => clearTimeout(clearId);
  }, [
    TreasuryDealerForwardRates,
    allInstrumentForTreasuryData,
    dispatch,
    processQueue,
  ]);

  // ─────────────────────────────
  // TENOR ADD / REMOVE
  useEffect(() => {
    const api = gridApiRef.current;
    if (!api || !dealerForwardTenorChanged) return;

    const { newIsForwardtenorList = [], removedtenorList = [] } =
      dealerForwardTenorChanged;

    const removedSet = new Set(removedtenorList.map((t) => t.tenorID));

    const existingRows = [];
    api.forEachNode((node) => node.data && existingRows.push(node.data));

    const toRemove = existingRows.filter((row) => removedSet.has(row.tenorID));

    const instrumentList =
      allInstrumentForTreasuryData?.forwardInstruments || [];

    const referenceRow = existingRows[0] || null;

    const toAdd = newIsForwardtenorList.map((tenor) => ({
      tenorID: tenor.tenorID,
      tenorName: tenor.tenorName,
      ...Object.fromEntries(
        instrumentList.flatMap((inst) => [
          [`bid_${inst.instrumentName}`, null],
          [`ask_${inst.instrumentName}`, null],
        ])
      ),
    }));

    if (toAdd.length || toRemove.length) {
      api.applyTransaction({ add: toAdd, remove: toRemove });

      setTimeout(() => buildNodeMap(api), 0);
    }

    dispatch(setDealerForwardTenorChanged(null));
  }, [
    dealerForwardTenorChanged,
    allInstrumentForTreasuryData,
    buildNodeMap,
    dispatch,
  ]);

  // ─────────────────────────────
  // CLEANUP
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ─────────────────────────────
  const defaultColDef = useMemo(
    () => ({
      resizable: false,
      sortable: false,
      suppressMovable: true,
    }),
    []
  );

  return (
    <div className={styles.mainForwardTable}>
      <span className="flex-fill mt-3 fs-4 fw-bold color-black mb-1">
        Bank Forwards
      </span>

      <div style={{ width: "100%", height: "600px" }}>
        <AgGridTable
          ref={gridRef}
          rowData={rowData}
          className="liveRates-grid"
          columnDefs={columnDefs}
          getRowId={(p) => String(p.data.tenorID)}
          onGridReady={onGridReady}
          onFirstDataRendered={onFirstDataRendered}
          defaultColDef={defaultColDef}
          animateRows={false}
          suppressColumnVirtualisation={true}
        />
      </div>
    </div>
  );
});

Forwards.displayName = "Forwards";
export default Forwards;
