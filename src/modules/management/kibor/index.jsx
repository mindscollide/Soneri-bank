import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import styles from "../management.module.css";

import AgGridTable from "../../../shareComponents/commonComponents/elements/globalAgGridTable";
import SectionLoader from "../../../shareComponents/elements/soneriLoader/SectionLoader";
import { IndexCell } from "../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import { clearKiborForManagmentFeed } from "../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";
import DownloadHistoryPopover from "../../../shareComponents/commonComponents/elements/downloadHistoryPopover";
import { useDownloadHistoryContextMenu } from "../../../hook/useDownloadHistoryContextMenu";

// ── Selectors ──────────────────────────────────────────────────────────────────
const selectKiborList = (state) =>
  state.WatchListReducer.GetKiborDataForTreasury?.kiborList;

const selectKiborFeed = (state) =>
  state.RealtimeActionsSlice.kiborForManagementFeed;

// ── Component ──────────────────────────────────────────────────────────────────
const KIBOR = memo(() => {
  const dispatch = useDispatch();

  // ── Refs ───────────────────────────────────────────────────────────────────
  const agGridComponentRef = useRef(null);
  const gridApiRef = useRef(null);
  const rowNodeMap = useRef(new Map()); // key: displayName → AG Grid node
  const pendingUpdates = useRef(new Map()); // key: displayName → latest values
  const rafRef = useRef(null);
  const isProcessingRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastProcessTime = useRef(0);

  // ── Redux state ────────────────────────────────────────────────────────────
  const kiborList = useSelector(selectKiborList, shallowEqual);
  const fullFeed = useSelector(selectKiborFeed, shallowEqual);

  // ── Build initial row data from REST snapshot ──────────────────────────────
  const buildRowData = useCallback(() => {
    if (!kiborList?.length) return [];

    return kiborList.map((item) => ({
      displayName: item.displayName,
      bid: Number(item.bid ?? 0),
      ask: Number(item.ask ?? 0),
      modifiedDateTime: item.modifiedDateTime ?? "",
    }));
  }, [kiborList]);

  // ── Sync initial data after grid is ready (handles REST → grid race) ───────
  useEffect(() => {
    if (!gridApiRef.current || !kiborList?.length) return;

    const rowData = buildRowData();
    if (rowData.length === 0) return;

    gridApiRef.current.setGridOption("rowData", rowData);

    // Rebuild rowNodeMap so live updates can target nodes by displayName
    rowNodeMap.current.clear();
    gridApiRef.current.forEachNode((node) => {
      if (node.data?.displayName) {
        rowNodeMap.current.set(node.data.displayName, node);
      }
    });
  }, [kiborList, buildRowData]);

  // ── onGridReady ────────────────────────────────────────────────────────────
  const onGridReady = useCallback(
    (params) => {
      if (!isMountedRef.current) return;
      gridApiRef.current = params.api;

      const rowData = buildRowData();
      if (rowData.length > 0) {
        params.api.setGridOption("rowData", rowData);
      }
    },
    [buildRowData],
  );

  // ── onFirstDataRendered ────────────────────────────────────────────────────
  const onFirstDataRendered = useCallback((params) => {
    if (!isMountedRef.current) return;

    rowNodeMap.current.clear();
    params.api.forEachNode((node) => {
      if (node.data?.displayName) {
        rowNodeMap.current.set(node.data.displayName, node);
      }
    });
  }, []);

  // ── Throttled queue processor (RAF-driven) ─────────────────────────────────
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
          data.bid !== update.bid ||
          data.ask !== update.ask ||
          data.modifiedDateTime !== update.modifiedDateTime;

        if (hasChanges) {
          node.setDataValue("bid", update.bid);
          node.setDataValue("ask", update.ask);
          node.setDataValue("modifiedDateTime", update.modifiedDateTime);
        }

        pendingUpdates.current.delete(key);
        batchCount++;
      }

      rafRef.current =
        pendingUpdates.current.size > 0
          ? requestAnimationFrame(processQueue)
          : null;
    } catch (error) {
      console.error("❌ KIBOR queue error:", error);
      pendingUpdates.current.clear();
      rafRef.current = null;
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  // ── Queue a single KIBOR update entry ─────────────────────────────────────
  const queueUpdate = useCallback(
    (feedItem) => {
      if (!isMountedRef.current || !feedItem?.displayName) return;

      pendingUpdates.current.set(feedItem.displayName, {
        bid: Number(feedItem.bid ?? 0),
        ask: Number(feedItem.ask ?? 0),
        modifiedDateTime: feedItem.modifiedDateTime ?? "",
      });

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(processQueue);
      }
    },
    [processQueue],
  );

  // ── Consume MQTT feed ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!fullFeed) return;

    const { kibor } = fullFeed;
    if (!kibor) return;

    const kiborArray = Array.isArray(kibor) ? kibor : [kibor];
    kiborArray.forEach(queueUpdate);

    const clearId = setTimeout(() => {
      if (isMountedRef.current) {
        dispatch(clearKiborForManagmentFeed());
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
        field: "displayName",
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
        headerName: "Applicable Date",
        field: "modifiedDateTime",
        flex: 1,
        cellClass: "percentage-cell",
      },
    ],
    [],
  );

  const getRowId = useCallback((params) => params.data.displayName, []);

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
  } = useDownloadHistoryContextMenu("displayName", "KIBOR");

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <span className={styles.tableheaderbar}>KIBOR</span>

      <div
        style={{ width: "100%", height: "257px" }}
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

KIBOR.displayName = "KIBOR";

export default KIBOR;
