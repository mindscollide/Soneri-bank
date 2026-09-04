import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { convertUTCTimeToLocalTime } from "../../../utils/timeFunction";
import { IndexCell } from "../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import styles from "../management.module.css";
import AgGridTable from "../../../shareComponents/commonComponents/elements/globalAgGridTable";
import { clearCommoditiesForManagmentFeed } from "../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";
import SectionLoader from "../../../shareComponents/elements/soneriLoader/SectionLoader";
import NoDataOverlay from "../../../shareComponents/elements/soneriLoader/NoDataOverlay";
import DownloadHistoryPopover from "../../../shareComponents/commonComponents/elements/downloadHistoryPopover";
import { useDownloadHistoryContextMenu } from "../../../hook/useDownloadHistoryContextMenu";

// Selectors
const commoditiesForManagementFeed = (state) =>
  state.RealtimeActionsSlice.commoditiesForManagementFeed;

const GetCommoditiesForTreasury = (state) =>
  state.WatchListReducer.GetCommoditiesForTreasury?.commodityList;

const GetAllOtherInstruments = (state) =>
  state.WatchListReducer.GetAllOtherInstruments?.commodities;

const Commodities = memo(() => {
  const dispatch = useDispatch();

  const agGridComponentRef = useRef(null); // ✅ for ref={} prop on AgGridTable
  const gridApiRef = useRef(null); // ✅ for params.api in onGridReady
  const rowNodeMap = useRef(new Map());
  const pendingUpdates = useRef(new Map());
  const rafRef = useRef(null);
  const isProcessingRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastProcessTime = useRef(0);

  const otherInstruments = useSelector(GetAllOtherInstruments, shallowEqual);
  const commodityList = useSelector(GetCommoditiesForTreasury, shallowEqual);
  const fullFeed = useSelector(commoditiesForManagementFeed, shallowEqual);

  // ─────────────────────────────
  // Build initial row data
  const buildRowData = useCallback(() => {
    if (!otherInstruments?.length) return [];

    try {
      return otherInstruments.map((instrument) => {
        const matchedCross = commodityList?.find(
          (wc) => Number(wc.instrumentId) === instrument.instrumentId,
        );

        return {
          instrumentID: Number(instrument.instrumentId),
          instrumentName: instrument.name,
          time: matchedCross?.time ?? "",
          bid: Number(matchedCross?.bid ?? 0),
          ask: Number(matchedCross?.ask ?? 0),
          high: Number(matchedCross?.high ?? 0),
          low: Number(matchedCross?.low ?? 0),
          percentageChange: Number(matchedCross?.percentChange ?? 0),
        };
      });
    } catch (error) {
      console.error("Error building row data:", error);
      return [];
    }
  }, [otherInstruments, commodityList]);

  // ─────────────────────────────
  // Sync data into grid whenever API data arrives — always sets rowData
  // (even when empty, e.g. the API failed/returned nothing), so the grid
  // never gets stuck showing its initial "no rowData yet" loading overlay
  // forever with no data and no error to explain why.
  useEffect(() => {
    if (!gridApiRef.current) return;

    const rowData = buildRowData();
    gridApiRef.current.setGridOption("rowData", rowData);

    if (rowData.length === 0) {
      gridApiRef.current.showNoRowsOverlay();
    } else {
      gridApiRef.current.hideOverlay();
    }

    // Rebuild rowNodeMap so live MQTT updates can target the correct nodes
    rowNodeMap.current.clear();
    gridApiRef.current.forEachNode((node) => {
      if (node.data?.instrumentID) {
        rowNodeMap.current.set(String(node.data.instrumentID), node);
      }
    });
  }, [otherInstruments, commodityList, buildRowData]);

  // ─────────────────────────────
  const onGridReady = useCallback(
    (params) => {
      if (!isMountedRef.current) return;

      gridApiRef.current = params.api; // ✅ store actual AG Grid API

      // Attempt immediate load (works if API already resolved before grid init)
      const rowData = buildRowData();
      params.api.setGridOption("rowData", rowData);

      if (rowData.length === 0) {
        params.api.showNoRowsOverlay();
      } else {
        params.api.hideOverlay();
      }
      // If data isn't ready yet, the useEffect above will handle it when it arrives
    },
    [buildRowData],
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
      if (!feed?.commodities || !isMountedRef.current) return;

      const commodity = feed.commodities;
      const key = String(commodity.instrumentId);

      pendingUpdates.current.set(key, {
        bid: commodity.bid,
        ask: commodity.ask,
        high: commodity.high,
        low: commodity.low,
        percentageChange: commodity.percentChange,
        time: commodity.time,
      });

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(processQueue);
      }
    },
    [processQueue],
  );

  // ─────────────────────────────
  // ✅ Consume feed
  useEffect(() => {
    if (!fullFeed) return;

    if (Array.isArray(fullFeed)) {
      fullFeed.forEach(queueUpdate);
    } else {
      queueUpdate(fullFeed);
    }

    const clearTimeoutId = setTimeout(() => {
      if (isMountedRef.current && dispatch) {
        dispatch(clearCommoditiesForManagmentFeed());
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
        width: 175,
        cellClass: "instrument-cell",
      },
      {
        headerName: "Bid",
        field: "bid",
        flex: 1,
        cellClass: "bid-cell",
        cellRenderer: (p) =>
          p.value != null && p.value !== "-" ? (
            <IndexCell value={Number(p.value)} />
          ) : null,
      },
      {
        headerName: "Ask",
        field: "ask",
        flex: 1,
        cellClass: "offer-cell",
        cellRenderer: (p) =>
          p.value != null && p.value !== "-" ? (
            <IndexCell value={Number(p.value)} />
          ) : null,
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
        flex: 1,
        cellClass: "highLow-cell",
        cellRenderer: (p) =>
          p.value != null && p.value !== "-" ? (
            <IndexCell value={Number(p.value)} />
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
    [PercentageCellRenderer],
  );

  const getRowId = useCallback(
    (params) => String(params.data.instrumentID),
    [],
  );

  const defaultColDef = useMemo(
    () => ({
      resizable: false,
      sortable: false,
      suppressMovable: true,
      editable: false,
    }),
    [],
  );

  const {
    popover,
    onCellContextMenu,
    closePopover,
    handleDownloadHistoryClick,
  } = useDownloadHistoryContextMenu("instrumentName", "Commodities");

  return (
    <>
      <span className={styles.tableheaderbar}>Commodities</span>

      <div
        style={{ height: "235px", width: "100%" }}
        onContextMenu={(e) => e.preventDefault()}>
        <AgGridTable
          ref={agGridComponentRef}
          columnDefs={columnDefs}
          className='usdParityManagement-grid'
          getRowId={getRowId}
          onGridReady={onGridReady}
          onFirstDataRendered={onFirstDataRendered}
          onCellContextMenu={onCellContextMenu}
          domLayout='normal'
          theme='legacy'
          defaultColDef={defaultColDef}
          suppressScrollOnNewData={true}
          suppressAnimationFrame={false}
          suppressCellFocus={true}
          loadingOverlayComponent={SectionLoader}
          noRowsOverlayComponent={NoDataOverlay}
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

Commodities.displayName = "Commodities";

export default Commodities;
