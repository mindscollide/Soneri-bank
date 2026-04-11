import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { store } from "../../../store/store";
import styles from "../management.module.css";

import { IndexCell } from "../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import { convertUTCTimeToLocalTime } from "../../../utils/timeFunction";
import AgGridTable from "../../../shareComponents/commonComponents/elements/globalAgGridTable";

// Selectors
const selectUSDParity = (state) =>
  state.WatchListReducer.GetUSDParityForTreasury?.usdParityCurrencies || [];

const selectSpotInstruments = (state) =>
  state.WatchListReducer.GetAllInstrumentForTreasury?.spotInstruments;

const selectUSDParityFeed = (state) =>
  state.RealtimeActionsSlice.usdParityForManagmentFeed;

const USDParity = memo(() => {
  const gridRef = useRef(null);
  const rowNodeMap = useRef(new Map());
  const pendingUpdates = useRef(new Map());
  const rafRef = useRef(null);
  const isMountedRef = useRef(true);
  const isGridReadyRef = useRef(false); // ✅ NEW
  const lastProcessTime = useRef(0);
  const processQueueRef = useRef(null);
  const lastFeedRef = useRef(null);

  const crossInstruments = useSelector(selectSpotInstruments, shallowEqual);
  const worldCrosses = useSelector(selectUSDParity, shallowEqual);

  // --- Cell Renderers ---
  const IndexCellRenderer = useCallback((params) => {
    if (!params.value || params.value === "-") return null;
    return <IndexCell value={params.value} />;
  }, []);

  const PercentChangeCellRenderer = useCallback((params) => {
    // if (params.value || params.value === "-") return null;
    const value = Number(params.value);
    const cellClassName =
      value < 0
        ? "color-red justify-center"
        : value > 0
        ? "color-green justify-center"
        : "color-blue justify-center";
    return <IndexCell value={value} CellClassName={cellClassName} />;
  }, []);

  const TimeCellRenderer = useCallback((params) => {
    // if (!params.value) return "--:--:--";
    return convertUTCTimeToLocalTime(params.value);
  }, []);

  // --- Columns ---
  const columnDefs = useMemo(
    () => [
      {
        headerName: "Instrument",
        field: "instrumentName",
        flex: 1,
        cellClass: "instrument-cell",
      },
      {
        headerName: "Bid",
        field: "bid",
        flex: 1,
        cellClass: "bid-cell",
        cellRenderer: (p) =>
          p.value != null && p.value !== "-" ? (
            <IndexCell value={Number(p.value).toFixed(4)} />
          ) : null,
      },
      {
        headerName: "Ask",
        field: "ask",
        flex: 1,
        cellClass: "offer-cell",
        cellRenderer: IndexCellRenderer,
      },
      {
        headerName: "High",
        field: "high",
        flex: 1,
        cellClass: "highLow-cell",
        cellRenderer: IndexCellRenderer,
      },
      {
        headerName: "Low",
        field: "low",
        flex: 1,
        cellClass: "highLow-cell",
        cellRenderer: IndexCellRenderer,
      },
      {
        headerName: "% Change",
        field: "percentageChange",
        flex: 1,
        cellClass: "percentage-cell",
        cellRenderer: PercentChangeCellRenderer,
      },
      {
        headerName: "Time",
        field: "time",
        flex: 1,
        cellRenderer: TimeCellRenderer,
      },
    ],
    [IndexCellRenderer, PercentChangeCellRenderer, TimeCellRenderer]
  );

  // --- Row Data ---
  const rowData = useMemo(() => {
    if (!crossInstruments?.length || !worldCrosses?.length) return [];

    return crossInstruments.map((instrument) => {
      const matched = worldCrosses.find(
        (wc) => Number(wc.instrumentID) === Number(instrument.instrumentID)
      );

      return {
        instrumentID: Number(instrument.instrumentID),
        instrumentName: instrument.instrumentName,
        time: matched?.time ?? "",
        bid: Number(matched?.bid ?? 0),
        ask: Number(matched?.ask ?? 0),
        high: Number(matched?.high ?? 0),
        low: Number(matched?.low ?? 0),
        percentageChange: Number(matched?.percentageChange ?? 0),
      };
    });
  }, [crossInstruments, worldCrosses]);

  // --- Map Nodes ---
  const updateNodeMap = useCallback(() => {
    const api = gridRef.current?.api;
    if (!api) return;

    rowNodeMap.current.clear();
    api.forEachNode((node) => {
      if (node.data?.instrumentID) {
        rowNodeMap.current.set(Number(node.data.instrumentID), node);
      }
    });
  }, []);

  // --- Process Queue ---
  const processQueue = useCallback(() => {
    const api = gridRef.current?.api;

    if (!isMountedRef.current || !api || !isGridReadyRef.current) {
      rafRef.current = null;
      return;
    }

    if (pendingUpdates.current.size === 0) {
      rafRef.current = null;
      return;
    }

    const now = Date.now();
    if (now - lastProcessTime.current < 50) {
      rafRef.current = requestAnimationFrame(() => processQueueRef.current?.());
      return;
    }

    lastProcessTime.current = now;

    pendingUpdates.current.forEach((update, instrumentID) => {
      const node = rowNodeMap.current.get(Number(instrumentID));

      if (node && node.data) {
        node.setDataValue("bid", update.bid);
        node.setDataValue("ask", update.ask);
        node.setDataValue("high", update.high);
        node.setDataValue("low", update.low);
        node.setDataValue("percentageChange", update.percentageChange);
        node.setDataValue("time", update.time);

        // ✅ remove only after success
        pendingUpdates.current.delete(instrumentID);
      }
    });

    if (pendingUpdates.current.size > 0) {
      rafRef.current = requestAnimationFrame(() => processQueueRef.current?.());
    } else {
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    processQueueRef.current = processQueue;
  }, [processQueue]);

  // --- Store Subscription ---
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      if (!isMountedRef.current) return;

      const feed = selectUSDParityFeed(store.getState());
      if (!feed || feed === lastFeedRef.current) return;

      lastFeedRef.current = feed;

      const update = feed.instrumentParitySpot;
      if (!update) return;

      const id = Number(update.instrumentID);

      pendingUpdates.current.set(id, {
        bid: update.bid,
        ask: update.ask,
        high: update.high,
        low: update.low,
        percentageChange: update.percentageChange,
        time: update.time,
      });

      // ✅ Only schedule (no force mapping here)
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() =>
          processQueueRef.current?.()
        );
      }
    });

    return unsubscribe;
  }, []);

  // --- Grid Ready ---
  const onGridReady = useCallback(() => {
    isGridReadyRef.current = true;

    setTimeout(() => {
      updateNodeMap();

      if (pendingUpdates.current.size > 0 && !rafRef.current) {
        rafRef.current = requestAnimationFrame(() =>
          processQueueRef.current?.()
        );
      }
    }, 100);
  }, [updateNodeMap]);

  const onFirstDataRendered = useCallback(() => {
    updateNodeMap();
  }, [updateNodeMap]);

  // --- RowData Change ---
  useEffect(() => {
    if (gridRef.current?.api && rowData?.length > 0) {
      setTimeout(() => {
        updateNodeMap();

        if (pendingUpdates.current.size > 0 && !rafRef.current) {
          rafRef.current = requestAnimationFrame(() =>
            processQueueRef.current?.()
          );
        }
      }, 50);
    }
  }, [rowData, updateNodeMap]);

  // --- Cleanup ---
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      pendingUpdates.current.clear();
      rowNodeMap.current.clear();
    };
  }, []);

  const defaultColDef = useMemo(
    () => ({
      resizable: false,
      sortable: false,
      suppressMovable: true,
      editable: false,
    }),
    []
  );

  return (
    <>
      <span className={styles.tableheaderbar}>USD Parity</span>

      <div style={{ width: "100%", height: "300px" }}>
        <AgGridTable
          ref={gridRef}
          columnDefs={columnDefs}
          rowData={rowData}
          getRowId={(params) => String(params.data.instrumentID)}
          onGridReady={onGridReady}
          onFirstDataRendered={onFirstDataRendered}
          animateRows={false}
          headerHeight={35}
          rowHeight={32}
          domLayout='normal'
          theme='legacy'
          defaultColDef={defaultColDef}
          className='usdParityManagement-grid'
        />
      </div>
    </>
  );
});

USDParity.displayName = "USDParity";

export default USDParity;
