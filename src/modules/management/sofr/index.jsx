import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import styles from "../management.module.css";

import AgGridTable from "../../../shareComponents/commonComponents/elements/globalAgGridTable";
import SectionLoader from "../../../shareComponents/elements/soneriLoader/SectionLoader";
import { IndexCell } from "../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import { formatCompactDate } from "../../../utils/timeFunction";
import { clearSofrForManagmentFeed } from "../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";
import DownloadHistoryPopover from "../../../shareComponents/commonComponents/elements/downloadHistoryPopover";
import { useDownloadHistoryContextMenu } from "../../../hook/useDownloadHistoryContextMenu";

// ── Selectors ──────────────────────────────────────────────────────────────────
const selectSofrList = (state) =>
  state.WatchListReducer.GetSOFRDataForTreasury?.sofrList;

const selectSofrFeed = (state) =>
  state.RealtimeActionsSlice.sofrForManagementFeed;

// ── Component ──────────────────────────────────────────────────────────────────
const SOFR = memo(() => {
  const dispatch = useDispatch();

  // ── Refs ───────────────────────────────────────────────────────────────────
  const agGridComponentRef = useRef(null);
  const gridApiRef = useRef(null);
  const rowNodeMap = useRef(new Map()); // key: tenor → AG Grid node
  const pendingUpdates = useRef(new Map()); // key: tenor → latest values
  const rafRef = useRef(null);
  const isProcessingRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastProcessTime = useRef(0);

  // ── Local state (header date only — not re-rendered on every tick) ─────────
  const [latestDate, setLatestDate] = useState("");

  // ── Redux state ────────────────────────────────────────────────────────────
  const sofrList = useSelector(selectSofrList, shallowEqual);
  const fullFeed = useSelector(selectSofrFeed, shallowEqual);

  // ── Build initial row data from REST snapshot ──────────────────────────────
  const buildRowData = useCallback(() => {
    if (!sofrList?.length) return [];

    return sofrList.map((item) => ({
      tenor: item.tenor,
      rate: Number(item.rate ?? 0),
      change: Number(item.change ?? 0),
      lastModifiedDate: item.lastModifiedDate ?? "",
    }));
  }, [sofrList]);

  // ── Sync initial data after grid ready (REST → grid race) ─────────────────
  useEffect(() => {
    if (!gridApiRef.current || !sofrList?.length) return;

    const rowData = buildRowData();
    if (!rowData.length) return;

    gridApiRef.current.setGridOption("rowData", rowData);

    // Seed date header
    if (sofrList[0]?.lastModifiedDate) {
      setLatestDate(sofrList[0].lastModifiedDate);
    }

    // Rebuild rowNodeMap keyed by tenor
    rowNodeMap.current.clear();
    gridApiRef.current.forEachNode((node) => {
      if (node.data?.tenor) {
        rowNodeMap.current.set(node.data.tenor, node);
      }
    });
  }, [sofrList, buildRowData]);

  // ── onGridReady ────────────────────────────────────────────────────────────
  const onGridReady = useCallback(
    (params) => {
      if (!isMountedRef.current) return;
      gridApiRef.current = params.api;

      const rowData = buildRowData();
      if (rowData.length) {
        params.api.setGridOption("rowData", rowData);
      }
    },
    [buildRowData]
  );

  // ── onFirstDataRendered ────────────────────────────────────────────────────
  const onFirstDataRendered = useCallback((params) => {
    if (!isMountedRef.current) return;

    rowNodeMap.current.clear();
    params.api.forEachNode((node) => {
      if (node.data?.tenor) {
        rowNodeMap.current.set(node.data.tenor, node);
      }
    });
  }, []);

  // ── Throttled RAF queue processor ──────────────────────────────────────────
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

    if (!pendingUpdates.current.size) {
      rafRef.current = null;
      return;
    }

    isProcessingRef.current = true;
    lastProcessTime.current = now;

    try {
      const MAX_BATCH = 10;
      let batchCount = 0;

      for (const [key, update] of pendingUpdates.current.entries()) {
        if (batchCount >= MAX_BATCH) break;

        const node = rowNodeMap.current.get(key);
        if (!node) {
          pendingUpdates.current.delete(key);
          continue;
        }

        const data = node.data;
        const hasChanges =
          data.rate !== update.rate ||
          data.change !== update.change ||
          data.lastModifiedDate !== update.lastModifiedDate;

        if (hasChanges) {
          node.setDataValue("rate", update.rate);
          node.setDataValue("change", update.change);
          node.setDataValue("lastModifiedDate", update.lastModifiedDate);
        }

        pendingUpdates.current.delete(key);
        batchCount++;
      }

      rafRef.current =
        pendingUpdates.current.size > 0
          ? requestAnimationFrame(processQueue)
          : null;
    } catch (err) {
      console.error("❌ SOFR queue error:", err);
      pendingUpdates.current.clear();
      rafRef.current = null;
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  // ── Queue a single SOFR update entry ──────────────────────────────────────
  const queueUpdate = useCallback(
    (feedItem) => {
      if (!isMountedRef.current || !feedItem?.tenor) return;

      pendingUpdates.current.set(feedItem.tenor, {
        rate: Number(feedItem.rate ?? 0),
        change: Number(feedItem.change ?? 0),
        lastModifiedDate: feedItem.lastModifiedDate ?? "",
      });

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(processQueue);
      }
    },
    [processQueue]
  );

  // ── Consume MQTT feed ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!fullFeed) return;

    // Slice now stores a single object: { sofr: [...] | {} }
    const { sofr } = fullFeed;
    if (!sofr) return;

    const sofrArray = Array.isArray(sofr) ? sofr : [sofr];
    sofrArray.forEach(queueUpdate);

    // Update date header from feed if present
    const firstWithDate = sofrArray.find((f) => f.lastModifiedDate);
    if (firstWithDate) {
      setLatestDate(firstWithDate.lastModifiedDate);
    }

    const clearId = setTimeout(() => {
      if (isMountedRef.current) {
        dispatch(clearSofrForManagmentFeed());
      }
    }, 500);

    return () => clearTimeout(clearId);
  }, [fullFeed, queueUpdate, dispatch]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
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

  // ── Column definitions ─────────────────────────────────────────────────────
  const columnDefs = useMemo(
    () => [
      {
        headerName: "Tenor",
        field: "tenor",
        flex: 1,
        cellClass: "instrument-cell",
      },
      {
        headerName: "Rate",
        field: "rate",
        flex: 1,
        cellClass: "bid-cell",
        cellRenderer: (p) =>
          p.value != null && p.value !== "-" ? (
            <IndexCell value={Number(p.value).toFixed(4)} />
          ) : null,
      },
      {
        headerName: "Change",
        field: "change",
        flex: 1,
        cellClass: "offer-cell",
        cellRenderer: (p) =>
          p.value != null && p.value !== "-" ? (
            <IndexCell value={Number(p.value).toFixed(4)} />
          ) : null,
      },
    ],
    []
  );

  const getRowId = useCallback((params) => params.data.tenor, []);

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
  } = useDownloadHistoryContextMenu("tenor", "SOFR");

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <span
        className={`${styles.tableheaderbar} d-flex justify-content-between`}
      >
        <span>SOFR</span>
        <span className={styles.management_date}>
          {formatCompactDate(latestDate)}
        </span>
      </span>

      <div
        style={{ width: "100%", height: "257px" }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <AgGridTable
          ref={agGridComponentRef}
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

SOFR.displayName = "SOFR";

export default SOFR;
