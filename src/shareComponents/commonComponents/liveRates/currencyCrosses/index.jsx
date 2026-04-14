import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";

import { convertUTCTimeToLocalTime } from "../../../../utils/timeFunction";
import { clearCurrencyCrossesForManagmentFeed } from "../../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";
import AgGridTable from "../../elements/globalAgGridTable";
import SectionLoader from "../../../elements/soneriLoader/SectionLoader";

// ─── Selectors ───────────────────────────────
const selectFeed = (state) =>
  state.RealtimeActionsSlice.currencyCrossesForManagmentFeed;

const selectCurrencyCrosses = (state) =>
  state.WatchListReducer.GetCurrencyCrosses?.currencyCrossList;

const selectOtherInstruments = (state) =>
  state.WatchListReducer.GetAllOtherInstruments?.currencyCrosses;

const CurrencyCrosses = memo(() => {
  const dispatch = useDispatch();

  const gridApiRef = useRef(null);
  const rowNodeMap = useRef(new Map());
  const pendingUpdates = useRef(new Map()); // ✅ Use Map to deduplicate updates
  const rafRef = useRef(null);
  const isProcessingRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastProcessTime = useRef(0);

  const otherInstruments = useSelector(selectOtherInstruments, shallowEqual);
  const fullFeed = useSelector(selectFeed, shallowEqual);
  const currencyCrosses = useSelector(selectCurrencyCrosses, shallowEqual);

  // ─────────────────────────────
  const buildRowData = useCallback(() => {
    if (!otherInstruments?.length) return [];

    return otherInstruments.map((instrument) => {
      const match = currencyCrosses?.find(
        (wc) => Number(wc.instrumentId) === instrument.instrumentId
      );

      return {
        instrumentID: Number(instrument.instrumentId),
        instrumentName: instrument.name,
        time: match?.time ?? "",
        bid: Number(match?.bid ?? 0),
        ask: Number(match?.ask ?? 0),
      };
    });
  }, [otherInstruments, currencyCrosses]);

  // ─────────────────────────────
  const onGridReady = useCallback(
    (params) => {
      if (!isMountedRef.current) return;

      gridApiRef.current = params.api;
      const rowData = buildRowData();

      if (rowData.length > 0) {
        params.api.setGridOption("rowData", rowData);
      }
    },
    [buildRowData]
  );

  // ─────────────────────────────
  const onFirstDataRendered = useCallback((params) => {
    if (!isMountedRef.current) return;

    rowNodeMap.current.clear();
    params.api.forEachNode((node) => {
      if (node.data?.instrumentID) {
        rowNodeMap.current.set(String(node.data.instrumentID), node);
      }
    });
  }, []);

  // ─────────────────────────────
  // ✅ THROTTLED PROCESSOR - Max 20 updates per second
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
    const timeSinceLastProcess = now - lastProcessTime.current;

    // ✅ Throttle: minimum 50ms between updates (20fps max)
    if (timeSinceLastProcess < 50) {
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
      // ✅ Process in small batches to prevent blocking
      let batchCount = 0;
      const MAX_BATCH_SIZE = 10; // Process max 10 items per frame

      for (const [key, update] of pendingUpdates.current.entries()) {
        if (batchCount >= MAX_BATCH_SIZE) break;

        const node = rowNodeMap.current.get(key);
        if (!node) {
          pendingUpdates.current.delete(key);
          continue;
        }

        const data = node.data;
        const hasChanges =
          data.bid !== update.bid ||
          data.ask !== update.ask ||
          data.time !== update.time;

        if (hasChanges) {
          // ✅ Batch set data values
          node.setDataValue("bid", update.bid);
          node.setDataValue("ask", update.ask);
          node.setDataValue("time", update.time);
        }

        pendingUpdates.current.delete(key);
        batchCount++;
      }

      // ✅ If there are still pending updates, schedule next frame
      if (pendingUpdates.current.size > 0) {
        rafRef.current = requestAnimationFrame(processQueue);
      } else {
        rafRef.current = null;
      }
    } catch (error) {
      console.error("Error processing queue:", error);
      pendingUpdates.current.clear();
      rafRef.current = null;
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  // ─────────────────────────────
  // ✅ Queue updates with deduplication
  const queueFeed = useCallback(
    (feed) => {
      if (!feed?.currencyCrosses || !isMountedRef.current) return;

      const cross = feed.currencyCrosses;
      const key = String(cross.instrumentId);

      // ✅ Deduplicate: only keep the latest update for each instrument
      pendingUpdates.current.set(key, {
        bid: cross.bid,
        ask: cross.ask,
        time: cross.time,
      });

      // ✅ Schedule processing if not already scheduled
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(processQueue);
      }
    },
    [processQueue]
  );

  // ─────────────────────────────
  // ✅ Debounced feed processing
  useEffect(() => {
    if (!fullFeed || !Array.isArray(fullFeed) || fullFeed.length === 0) {
      return;
    }

    // ✅ Process all feeds
    fullFeed.forEach(queueFeed);

    // ✅ Clear Redux state after a delay
    const clearTimeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        dispatch(clearCurrencyCrossesForManagmentFeed());
      }
    }, 200); // Increased delay

    return () => clearTimeout(clearTimeoutId);
  }, [fullFeed, queueFeed, dispatch]);

  // ─────────────────────────────
  // ✅ Cleanup
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
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

  // ─────────────────────────────
  const columnDefs = useMemo(
    () => [
      {
        headerName: "Currency Crosses",
        children: [
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
            valueFormatter: (p) => (p.value != null ? Number(p.value) : "-"),
          },
          {
            headerName: "Ask",
            field: "ask",
            flex: 1,
            cellClass: "offer-cell",
            valueFormatter: (p) => (p.value != null ? Number(p.value) : "-"),
          },
          {
            headerName: "Time",
            field: "time",
            flex: 1,
            cellClass: "section-divider",
            valueFormatter: (p) =>
              p.value ? convertUTCTimeToLocalTime(p.value) : "--:--:--",
          },
        ],
      },
    ],
    []
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
    <div style={{ height: "600px", width: "100%" }}>
      <AgGridTable
        ref={gridApiRef}
        columnDefs={columnDefs}
        className="liveRates-grid"
        getRowId={getRowId}
        onGridReady={onGridReady}
        onFirstDataRendered={onFirstDataRendered}
        domLayout="normal"
        theme="legacy"
        defaultColDef={defaultColDef}
        suppressScrollOnNewData={true}
        suppressAnimationFrame={false}
        suppressColumnVirtualisation={false}
        suppressRowVirtualisation={false}
        loadingOverlayComponent={SectionLoader}
      />
    </div>
  );
});

CurrencyCrosses.displayName = "CurrencyCrosses";

export default CurrencyCrosses;
