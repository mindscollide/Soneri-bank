import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { convertUTCTimeToLocalTime } from "../../../utils/timeFunction";
import { IndexCell } from "../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import styles from "../management.module.css";
import { clearCurrencyCrossesForManagmentFeed } from "../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";
import AgGridTable from "../../../shareComponents/commonComponents/elements/globalAgGridTable";
import SectionLoader from "../../../shareComponents/elements/soneriLoader/SectionLoader";
import DownloadHistoryPopover from "../../../shareComponents/commonComponents/elements/downloadHistoryPopover";
import { useDownloadHistoryContextMenu } from "../../../hook/useDownloadHistoryContextMenu";

// Selectors
const currencyCrossesForManagementFeed = (state) =>
  state.RealtimeActionsSlice.currencyCrossesForManagmentFeed;

const SelectGetCurrencyCrosses = (state) =>
  state.WatchListReducer.GetCurrencyCrosses?.currencyCrossList;

const GetAllOtherInstruments = (state) =>
  state.WatchListReducer.GetAllOtherInstruments?.currencyCrosses;

const CurrencyCrosses = memo(() => {
  const dispatch = useDispatch();

  const agGridComponentRef = useRef(null); // for ref={} prop on AgGridTable
  const gridApiRef = useRef(null); // for params.api in onGridReady
  const rowNodeMap = useRef(new Map());
  const pendingUpdates = useRef(new Map());
  const rafRef = useRef(null);
  const isProcessingRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastProcessTime = useRef(0);

  const otherInstruments = useSelector(GetAllOtherInstruments, shallowEqual);
  const currencyCrosses = useSelector(SelectGetCurrencyCrosses, shallowEqual);
  const fullFeed = useSelector(currencyCrossesForManagementFeed, shallowEqual);

  // ─────────────────────────────
  // Build initial row data
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
        high: Number(match?.high ?? 0),
        low: Number(match?.low ?? 0),
        percentageChange: Number(match?.percentChange ?? 0),
      };
    });
  }, [otherInstruments, currencyCrosses]);

  // ─────────────────────────────
  // ✅ FIX: Sync data into grid whenever API data arrives (handles race condition)
  useEffect(() => {
    if (!gridApiRef.current || !otherInstruments?.length) return;

    const rowData = buildRowData();
    if (rowData.length === 0) return;

    gridApiRef.current.setGridOption("rowData", rowData);

    // Rebuild rowNodeMap so live MQTT updates can target the correct nodes
    rowNodeMap.current.clear();
    gridApiRef.current.forEachNode((node) => {
      if (node.data?.instrumentID) {
        rowNodeMap.current.set(String(node.data.instrumentID), node);
      }
    });
  }, [otherInstruments, currencyCrosses]);

  // ─────────────────────────────
  const onGridReady = useCallback(
    (params) => {
      if (!isMountedRef.current) return;

      gridApiRef.current = params.api; // ✅ stores actual AG Grid API

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
          data.bid !== update.bid ||
          data.ask !== update.ask ||
          data.high !== update.high ||
          data.low !== update.low ||
          data.percentageChange !== update.percentageChange ||
          data.time !== update.time;

        if (hasChanges) {
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
      if (!feed?.currencyCrosses || !isMountedRef.current) return;

      const cross = feed.currencyCrosses;
      const key = String(cross.instrumentId);

      pendingUpdates.current.set(key, {
        bid: cross.bid,
        ask: cross.ask,
        high: cross.high,
        low: cross.low,
        percentageChange: cross.percentChange,
        time: cross.time,
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
    if (!fullFeed || !Array.isArray(fullFeed) || fullFeed.length === 0) {
      return;
    }

    fullFeed.forEach(queueUpdate);

    const clearTimeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        dispatch(clearCurrencyCrossesForManagmentFeed());
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
        cellClass: "highLow-cell",
        flex: 1,
        cellRenderer: (p) =>
          p.value != null && p.value !== "-" ? (
            <IndexCell value={Number(p.value).toFixed(4)} />
          ) : null,
      },
      {
        headerName: "Low",
        field: "low",
        cellClass: "highLow-cell",
        flex: 1,
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
        cellRenderer: PercentageCellRenderer,
      },
      {
        headerName: "Time",
        field: "time",
        flex: 1,
        cellClass: "percentage-cell",
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

  const {
    popover,
    onCellContextMenu,
    closePopover,
    handleDownloadHistoryClick,
  } = useDownloadHistoryContextMenu("instrumentName");

  return (
    <>
      <span className={styles.tableheaderbar}>Currency Crosses</span>

      <div
        style={{ height: "300px", width: "100%" }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <AgGridTable
          ref={agGridComponentRef} // ✅ separate ref for the component instance
          columnDefs={columnDefs}
          className="usdParityManagement-grid"
          getRowId={getRowId}
          onGridReady={onGridReady}
          onFirstDataRendered={onFirstDataRendered}
          onCellContextMenu={onCellContextMenu}
          domLayout="normal"
          theme="legacy"
          defaultColDef={defaultColDef}
          suppressScrollOnNewData={true}
          suppressAnimationFrame={false}
          suppressCellFocus={true}
          loadingOverlayComponent={SectionLoader}
        />
      </div>

      <DownloadHistoryPopover
        popover={popover}
        onDownload={handleDownloadHistoryClick}
        onClose={closePopover}
      />
    </>
  );
});

CurrencyCrosses.displayName = "CurrencyCrosses";

export default CurrencyCrosses;
