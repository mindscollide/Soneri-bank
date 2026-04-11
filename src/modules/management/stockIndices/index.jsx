import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { convertUTCTimeToLocalTime } from "../../../utils/timeFunction";
import { IndexCell } from "../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import styles from "../management.module.css";

import AgGridTable from "../../../shareComponents/commonComponents/elements/globalAgGridTable";
import { clearStockIndicesForManagmentFeed } from "../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";

// Selectors
const stockIndicesForManagementFeed = (state) =>
  state.RealtimeActionsSlice.stockIndicesForManagementFeed;

const GetIndicesForTreasury = (state) =>
  state.WatchListReducer.GetIndicesForTreasury?.stockIndexList;

const GetAllOtherInstruments = (state) =>
  state.WatchListReducer.GetAllOtherInstruments?.stockIndices;

const StockIndices = memo(() => {
  const dispatch = useDispatch();

  const gridApiRef = useRef(null);
  const rowNodeMap = useRef(new Map());
  const pendingUpdates = useRef(new Map());
  const rafRef = useRef(null);
  const isProcessingRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastProcessTime = useRef(0);

  const otherInstruments = useSelector(GetAllOtherInstruments, shallowEqual);
  const stockIndexList = useSelector(GetIndicesForTreasury, shallowEqual);
  const fullFeed = useSelector(stockIndicesForManagementFeed, shallowEqual);

  // ─────────────────────────────
  // Build initial row data
  const buildRowData = useCallback(() => {
    if (!otherInstruments?.length) return [];

    const map = new Map(
      stockIndexList?.map((item) => [Number(item.instrumentId), item]) || []
    );

    return otherInstruments.map((instrument) => {
      const matched = map.get(Number(instrument.instrumentId));

      return {
        instrumentID: Number(instrument.instrumentId),
        instrumentName: instrument.name,
        current: Number(matched?.current ?? 0),
        change: Number(matched?.change ?? 0),
        percentageChange: Number(matched?.percentChange ?? 0),
        high: Number(matched?.high ?? 0),
        low: Number(matched?.low ?? 0),
        volume: Number(matched?.volume ?? 0),
        time: matched?.time ?? "",
      };
    });
  }, [otherInstruments, stockIndexList]);

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
  // ✅ THROTTLED PROCESSOR
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
      // ✅ Process in small batches
      let batchCount = 0;
      const MAX_BATCH_SIZE = 10;

      for (const [key, update] of pendingUpdates.current.entries()) {
        if (batchCount >= MAX_BATCH_SIZE) break;

        const node = rowNodeMap.current.get(key);
        if (!node) {
          pendingUpdates.current.delete(key);
          continue;
        }

        const data = node.data;
        const hasChanges =
          data.current !== update.current ||
          data.change !== update.change ||
          data.percentageChange !== update.percentageChange ||
          data.high !== update.high ||
          data.low !== update.low ||
          data.volume !== update.volume ||
          data.time !== update.time;

        if (hasChanges) {
          node.setDataValue("current", update.current);
          node.setDataValue("change", update.change);
          node.setDataValue("percentageChange", update.percentageChange);
          node.setDataValue("high", update.high);
          node.setDataValue("low", update.low);
          node.setDataValue("volume", update.volume);
          node.setDataValue("time", update.time);
        }

        pendingUpdates.current.delete(key);
        batchCount++;
      }

      // ✅ Schedule next frame if needed
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
  // ✅ Queue with deduplication
  const queueUpdate = useCallback(
    (feed) => {
      if (!feed?.stocK_INDICES || !isMountedRef.current) return;

      const stockIndex = feed.stocK_INDICES;
      const key = String(stockIndex.instrumentId);

      pendingUpdates.current.set(key, {
        current: stockIndex.current,
        change: stockIndex.change,
        percentageChange: stockIndex.percentChange,
        high: stockIndex.high,
        low: stockIndex.low,
        volume: stockIndex.volume,
        time: stockIndex.time,
      });

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(processQueue);
      }
    },
    [processQueue]
  );

  // ─────────────────────────────
  // ✅ Consume feed
  useEffect(() => {
    if (!fullFeed) return;

    // Handle both single object and array
    if (Array.isArray(fullFeed)) {
      fullFeed.forEach(queueUpdate);
    } else {
      queueUpdate(fullFeed);
    }

    const clearTimeoutId = setTimeout(() => {
      if (isMountedRef.current && dispatch) {
        dispatch(clearStockIndicesForManagmentFeed());
      }
    }, 200);

    return () => clearTimeout(clearTimeoutId);
  }, [fullFeed, queueUpdate, dispatch]);

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
  // Custom cell renderer for percentage change
  const PercentageCellRenderer = useCallback((props) => {
    const value = props.value;
    if (value === undefined || value === null || value === "-") return null;

    const numValue = Number(value);
    const cellClassName =
      numValue < 0 ? "color-red" : numValue > 0 ? "color-green" : "color-blue";

    return <IndexCell value={numValue} CellClassName={cellClassName} />;
  }, []);

  // ─────────────────────────────
  const columnDefs = useMemo(
    () => [
      {
        headerName: "Instrument",
        field: "instrumentName",
        cellClass: "instrument-cell",
        flex: 1,
      },
      {
        headerName: "Current",
        field: "current",
        cellClass: "bid-cell",
        flex: 1,
        cellRenderer: (p) =>
          p.value != null && p.value !== "-" ? (
            <IndexCell value={Number(p.value)} />
          ) : null,
      },
      {
        headerName: "Change",
        field: "change",
        cellClass: "offer-cell",
        flex: 1,
        cellRenderer: (p) =>
          p.value != null && p.value !== "-" ? (
            <IndexCell value={Number(p.value)} />
          ) : null,
      },
      {
        headerName: "% Change",
        field: "percentageChange",
        cellClass: "percentage-cell",
        flex: 1,
        cellRenderer: PercentageCellRenderer,
      },
      {
        headerName: "High",
        field: "high",
        flex: 1,
        cellClass: "highLow-cell",
        cellRenderer: (p) =>
          p.value != null && p.value !== "-" ? (
            <IndexCell value={Number(p.value)} />
          ) : null,
      },
      {
        headerName: "Low",
        field: "low",
        cellClass: "highLow-cell",
        flex: 1,
        cellRenderer: (p) =>
          p.value != null && p.value !== "-" ? (
            <IndexCell value={Number(p.value)} />
          ) : null,
      },
      {
        headerName: "Volume",
        field: "volume",
        flex: 1,
        cellRenderer: (p) =>
          p.value != null && p.value !== "-" ? (
            <IndexCell value={Number(p.value)} />
          ) : null,
      },
      {
        headerName: "Time",
        field: "time",
        flex: 1,
        valueFormatter: (p) =>
          p.value ? convertUTCTimeToLocalTime(p.value) : "--:--:--",
      },
    ],
    [PercentageCellRenderer]
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
      <span className={styles.tableheaderbar}>Stock Indices</span>

      <div style={{ height: "235px", width: "100%" }}>
        <AgGridTable
          ref={gridApiRef}
          columnDefs={columnDefs}
          className='usdParityManagement-grid'
          getRowId={getRowId}
          onGridReady={onGridReady}
          onFirstDataRendered={onFirstDataRendered}
          domLayout='normal'
          theme='legacy'
          defaultColDef={defaultColDef}
          suppressScrollOnNewData={true}
          suppressAnimationFrame={false}
          suppressCellSelection={true}
        />
      </div>
    </>
  );
});

StockIndices.displayName = "StockIndices";

export default StockIndices;
