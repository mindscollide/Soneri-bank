import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import styles from "../management.module.css";

import { IndexCell } from "../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import { convertUTCTimeToLocalTime } from "../../../utils/timeFunction";
import AgGridTable from "../../../shareComponents/commonComponents/elements/globalAgGridTable";
import SectionLoader from "../../../shareComponents/elements/soneriLoader/SectionLoader";
import { clearUSDParityForManagementFeed } from "../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";

// Selectors
const selectUSDParity = (state) =>
  state.WatchListReducer.GetUSDParityForTreasury?.usdParityCurrencies || [];

const selectSpotInstruments = (state) =>
  state.WatchListReducer.GetAllInstrumentForTreasury?.spotInstruments;

const selectUSDParityFeed = (state) =>
  state.RealtimeActionsSlice.usdParityForManagmentFeed;

const USDParity = memo(() => {
  const dispatch = useDispatch();

  // ── Refs ──────────────────────────────────────────────────────────────
  const gridApiRef = useRef(null);
  const rowNodeMap = useRef(new Map());
  const pendingUpdates = useRef(new Map());
  const rafRef = useRef(null);
  const isProcessingRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastProcessTime = useRef(0);

  // ── Selectors ──────────────────────────────────────────────────────────
  const crossInstruments = useSelector(selectSpotInstruments, shallowEqual);
  const worldCrosses = useSelector(selectUSDParity, shallowEqual);
  const fullFeed = useSelector(selectUSDParityFeed, shallowEqual);

  // ── Build initial row data ─────────────────────────────────────────────
  const buildRowData = useCallback(() => {
    if (!crossInstruments?.length) return [];

    return crossInstruments.map((instrument) => {
      const matched = worldCrosses?.find(
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

  // ── onGridReady ────────────────────────────────────────────────────────
  const onGridReady = useCallback(
    (params) => {
      // console.log("🟢 Grid Ready");
      if (!isMountedRef.current) return;

      gridApiRef.current = params.api;
      const rowData = buildRowData();

      // console.log("📊 Initial Row Data:", rowData);

      if (rowData.length > 0) {
        params.api.setGridOption("rowData", rowData);
      }
    },
    [buildRowData]
  );

  // ── onFirstDataRendered ────────────────────────────────────────────────
  const onFirstDataRendered = useCallback((params) => {
    if (!isMountedRef.current) return;

    rowNodeMap.current.clear();
    params.api.forEachNode((node) => {
      if (node.data?.instrumentID) {
        rowNodeMap.current.set(String(node.data.instrumentID), node);
      }
    });

    // console.log("🗺️ Row Node Map populated:", rowNodeMap.current.size, "nodes");
  }, []);

  // ── Throttled queue processor ──────────────────────────────────────────
  const processQueue = useCallback(() => {
    if (
      !isMountedRef.current ||
      isProcessingRef.current ||
      !gridApiRef.current
    ) {
      rafRef.current = null;
      return;
    }

    const now = Date.now();
    if (now - lastProcessTime.current < 50) {
      rafRef.current = requestAnimationFrame(processQueue);
      return;
    }

    if (pendingUpdates.current.size === 0) {
      rafRef.current = null;
      return;
    }

    isProcessingRef.current = true;
    lastProcessTime.current = now;

    try {
      let batchCount = 0;
      const MAX_BATCH_SIZE = 10;

      // console.log("⚙️ Processing queue, size:", pendingUpdates.current.size);

      for (const [key, update] of pendingUpdates.current.entries()) {
        if (batchCount >= MAX_BATCH_SIZE) break;

        const node = rowNodeMap.current.get(key);
        if (!node) {
          // console.warn("⚠️ Node not found for key:", key);
          pendingUpdates.current.delete(key);
          continue;
        }

        const data = node.data;
        const hasChanges =
          data.bid !== update.bid ||
          data.ask !== update.ask ||
          data.high !== update.high ||
          data.low !== update.low ||
          data.percentageChange !== update.percentageChange ||
          data.time !== update.time;

        if (hasChanges) {
          // console.log("✅ Updating node:", key, update);
          node.setDataValue("bid", update.bid);
          node.setDataValue("ask", update.ask);
          node.setDataValue("high", update.high);
          node.setDataValue("low", update.low);
          node.setDataValue("percentageChange", update.percentageChange);
          node.setDataValue("time", update.time);
        }

        pendingUpdates.current.delete(key);
        batchCount++;
      }

      if (pendingUpdates.current.size > 0) {
        rafRef.current = requestAnimationFrame(processQueue);
      } else {
        rafRef.current = null;
      }
    } catch (error) {
      console.error("❌ Error processing queue:", error);
      pendingUpdates.current.clear();
      rafRef.current = null;
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  // ── Queue update ───────────────────────────────────────────────────────
  const queueUpdate = useCallback(
    (feed) => {
      // console.log("📨 Received feed:", feed);

      if (!isMountedRef.current) {
        // console.warn("⚠️ Component not mounted");
        return;
      }

      // Check different possible feed structures
      let update = null;
      let key = null;

      // Try different feed structures
      if (feed?.instrumentParitySpot) {
        update = feed.instrumentParitySpot;
        key = String(update.instrumentID);
      } else if (feed?.instrumentID) {
        // Direct feed structure
        update = feed;
        key = String(feed.instrumentID);
      } else {
        // console.warn("⚠️ Unknown feed structure:", feed);
        return;
      }

      if (!key || !update) {
        // console.warn("⚠️ Invalid update or key:", { key, update });
        return;
      }

      // console.log("✨ Queueing update for key:", key, update);

      pendingUpdates.current.set(key, {
        bid: Number(update.bid ?? 0),
        ask: Number(update.ask ?? 0),
        high: Number(update.high ?? 0),
        low: Number(update.low ?? 0),
        percentageChange: Number(update.percentageChange ?? 0),
        time: update.time || "",
      });

      // console.log("📦 Pending updates size:", pendingUpdates.current.size);

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(processQueue);
      }
    },
    [processQueue]
  );

  // ── Consume MQTT feed ──────────────────────────────────────────────────
  useEffect(() => {
    // console.log("🔄 Feed effect triggered, fullFeed:", fullFeed);

    if (!fullFeed) {
      // console.log("⏭️ No feed data");
      return;
    }

    // Handle both array and single object feeds
    const feedArray = Array.isArray(fullFeed) ? fullFeed : [fullFeed];

    if (feedArray.length === 0) {
      // console.log("⏭️ Empty feed array");
      return;
    }

    // console.log("🚀 Processing feed array:", feedArray);
    feedArray.forEach(queueUpdate);

    // Increase timeout to give more time for processing
    const clearTimeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        // console.log("🧹 Clearing feed");
        dispatch(clearUSDParityForManagementFeed());
      }
    }, 500); // Increased from 200ms to 500ms

    return () => clearTimeout(clearTimeoutId);
  }, [fullFeed, queueUpdate, dispatch]);

  // ── Cleanup ────────────────────────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    // console.log("🎬 Component mounted");

    return () => {
      // console.log("🛑 Component unmounting");
      isMountedRef.current = false;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      pendingUpdates.current.clear();
      rowNodeMap.current.clear();
      isProcessingRef.current = false;
    };
  }, []);

  // ── Cell renderers ─────────────────────────────────────────────────────
  const PercentChangeCellRenderer = useCallback((params) => {
    const value = Number(params.value);
    const cellClassName =
      value < 0
        ? "color-red justify-center"
        : value > 0
        ? "color-green justify-center"
        : "color-blue justify-center";
    return <IndexCell value={value} CellClassName={cellClassName} />;
  }, []);

  // ── Column defs ────────────────────────────────────────────────────────
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
        cellRenderer: (p) =>
          p.value != null && p.value !== "-" ? (
            <IndexCell value={Number(p.value).toFixed(4)} />
          ) : null,
      },
      {
        headerName: "High",
        field: "high",
        flex: 1,
        cellClass: "highLow-cell",
        cellRenderer: (p) =>
          p.value != null && p.value !== "-" ? (
            <IndexCell value={Number(p.value).toFixed(4)} />
          ) : null,
      },
      {
        headerName: "Low",
        field: "low",
        flex: 1,
        cellClass: "highLow-cell",
        cellRenderer: (p) =>
          p.value != null && p.value !== "-" ? (
            <IndexCell value={Number(p.value).toFixed(4)} />
          ) : null,
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
        valueFormatter: (p) =>
          p.value ? convertUTCTimeToLocalTime(p.value) : "--:--:--",
      },
    ],
    [PercentChangeCellRenderer]
  );

  const getRowId = useCallback(
    (params) => String(params.data.instrumentID),
    []
  );

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
          ref={gridApiRef}
          columnDefs={columnDefs}
          className="usdParityManagement-grid"
          getRowId={getRowId}
          onGridReady={onGridReady}
          onFirstDataRendered={onFirstDataRendered}
          domLayout="normal"
          theme="legacy"
          defaultColDef={defaultColDef}
          suppressScrollOnNewData={true}
          suppressAnimationFrame={false}
          suppressCellFocus={true}
          loadingOverlayComponent={SectionLoader}
        />
      </div>
    </>
  );
});

USDParity.displayName = "USDParity";

export default USDParity;
