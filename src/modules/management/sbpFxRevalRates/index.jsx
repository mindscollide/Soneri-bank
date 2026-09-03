import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import styles from "../management.module.css";
import { formatCompactDate } from "../../../utils/timeFunction";
import { clearSbpFXRevalRatesForManagmentFeed } from "../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";
import AgGridTable from "../../../shareComponents/commonComponents/elements/globalAgGridTable";
import SectionLoader from "../../../shareComponents/elements/soneriLoader/SectionLoader";
import { IndexCell } from "../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import DownloadHistoryPopover from "../../../shareComponents/commonComponents/elements/downloadHistoryPopover";
import { useDownloadHistoryContextMenu } from "../../../hook/useDownloadHistoryContextMenu";

// Selectors
const GetRevalRatesForTreasury = (state) =>
  state.WatchListReducer.GetRevalRatesForTreasury;

const sbpFXRevalRatesForManagementFeed = (state) =>
  state.RealtimeActionsSlice.sbpFXRevalRatesForManagementFeed;

const SBPFXRevalRates = memo(() => {
  const dispatch = useDispatch();

  const agGridComponentRef = useRef(null);
  const gridApiRef = useRef(null);
  const rowNodeMap = useRef(new Map());
  const isMountedRef = useRef(true);

  const [latestDate, setLatestDate] = useState("");
  const [tenors, setTenors] = useState([]);

  const revalRatesList = useSelector(GetRevalRatesForTreasury, shallowEqual);
  const fullFeed = useSelector(sbpFXRevalRatesForManagementFeed, shallowEqual);

  // ─────────────────────────────
  // Get unique tenors
  const getUniqueTenors = useCallback((data) => {
    const tenorMap = new Map();
    data.forEach((item) => {
      if (!tenorMap.has(item.tenorId)) {
        tenorMap.set(item.tenorId, {
          tenorId: item.tenorId,
          tenorName: item.tenorName,
          displayOrderPriority: item.displayOrderPriority,
        });
      }
    });
    return Array.from(tenorMap.values()).sort(
      (a, b) => a.displayOrderPriority - b.displayOrderPriority,
    );
  }, []);

  // ─────────────────────────────
  // Build row data from API
  const buildRowData = useCallback(() => {
    if (!revalRatesList?.revalRatesList) return [];

    try {
      const { revalRatesList: revalRatesListData } = revalRatesList;

      if (revalRatesListData.length > 0) {
        const apiDate = revalRatesListData[0]?.lastModifiedDate;
        if (apiDate) setLatestDate(apiDate);

        const uniqueTenors = getUniqueTenors(revalRatesListData);
        setTenors(uniqueTenors);
      }

      const grouped = Object.values(
        revalRatesListData.reduce((acc, item) => {
          const { currency, tenorId, value } = item;
          if (!acc[currency]) {
            acc[currency] = { currencyName: currency };
          }
          acc[currency][`tenorId_${tenorId}_value`] = value;
          return acc;
        }, {}),
      );

      return grouped;
    } catch (error) {
      console.error("Error building row data:", error);
      return [];
    }
  }, [revalRatesList, getUniqueTenors]);

  // ─────────────────────────────
  // Shared helper: rebuild rowNodeMap after grid has rendered rows
  const rebuildRowNodeMap = useCallback(() => {
    if (!gridApiRef.current) return;
    rowNodeMap.current.clear();
    gridApiRef.current.forEachNode((node) => {
      if (node.data?.currencyName) {
        rowNodeMap.current.set(node.data.currencyName, node);
      }
    });
  }, []);

  // ─────────────────────────────
  // Only set rowData here — let onRowDataUpdated rebuild the map
  useEffect(() => {
    if (!gridApiRef.current) return;
    const rowData = buildRowData();
    gridApiRef.current.setGridOption("rowData", rowData || []);
  }, [revalRatesList, buildRowData]);

  // ─────────────────────────────
  // onGridReady — just set data, map built by onRowDataUpdated
  const onGridReady = useCallback(
    (params) => {
      if (!isMountedRef.current) return;
      gridApiRef.current = params.api;
      const rowData = buildRowData();
      params.api.setGridOption("rowData", rowData || []);
    },
    [buildRowData],
  );

  // ─────────────────────────────
  // Fires once on first render — delegate to shared helper
  const onFirstDataRendered = useCallback(() => {
    if (!isMountedRef.current) return;
    rebuildRowNodeMap();
  }, [rebuildRowNodeMap]);

  // ─────────────────────────────
  // Fires every time rowData changes — rebuilds map & manages overlays
  const onRowDataUpdated = useCallback(
    (params) => {
      if (!isMountedRef.current) return;
      rebuildRowNodeMap();
      const hasRows = params.api.getDisplayedRowCount() > 0;
      if (hasRows) {
        params.api.hideOverlay();
      } else {
        params.api.showNoRowsOverlay();
      }
    },
    [rebuildRowNodeMap],
  );

  // ─────────────────────────────
  // Apply MQTT update directly — no throttling
  // Apply MQTT update directly — no throttling
  const applyUpdate = useCallback((feed) => {
    if (!feed?.revalRates || !isMountedRef.current || !gridApiRef.current)
      return;

    const { currency, tenorId, value, lastModifiedDate } = feed.revalRates;
    const tenorKey = `tenorId_${tenorId}_value`;

    const node = rowNodeMap.current.get(currency);
    if (!node) return;

    const newValue = Number(value ?? 0);

    // ✅ updateData replaces the whole row data object and forces cell re-render
    // setDataValue is blocked by editable: false — that's why UI wasn't updating
    node.updateData({ ...node.data, [tenorKey]: newValue });

    if (lastModifiedDate) {
      setLatestDate(lastModifiedDate);
    }
  }, []);

  // ─────────────────────────────
  // Consume feed
  useEffect(() => {
    if (!fullFeed) return;

    applyUpdate(fullFeed);

    const clearTimeoutId = setTimeout(() => {
      if (isMountedRef.current && dispatch) {
        dispatch(clearSbpFXRevalRatesForManagmentFeed());
      }
    }, 100);

    return () => clearTimeout(clearTimeoutId);
  }, [fullFeed, applyUpdate, dispatch]);

  // ─────────────────────────────
  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      rowNodeMap.current.clear();
    };
  }, []);

  // ─────────────────────────────
  const columnDefs = useMemo(() => {
    const baseColumns = [
      {
        headerName: "Currency",
        field: "currencyName",
        cellClass: "instrument-cell",
        pinned: "left",
        width: 120,
      },
    ];

    const tenorColumns = tenors.map((tenor) => ({
      headerName: tenor.tenorName,
      field: `tenorId_${tenor.tenorId}_value`,
      cellClass: "value-cell",
      flex: 1,

      valueFormatter: (p) => {
        <IndexCell value={p.value} />;
      },
    }));

    return [...baseColumns, ...tenorColumns];
  }, [tenors]);

  const getRowId = useCallback((params) => params.data.currencyName, []);

  const defaultColDef = useMemo(
    () => ({
      resizable: false,
      sortable: false,
      suppressMovable: true,
      editable: false,
      minWidth: 90,
    }),
    [],
  );

  const {
    popover,
    onCellContextMenu,
    closePopover,
    handleDownloadHistoryClick,
  } = useDownloadHistoryContextMenu("currencyName", "SBPFXRevalRates");

  return (
    <>
      <span
        className={`${styles.tableheaderbar} d-flex justify-content-between`}>
        <span>SBP FX Reval Rates</span>
        <span className={styles.management_date}>
          {formatCompactDate(latestDate)}
        </span>
      </span>

      <div
        style={{ height: "300px", width: "100%" }}
        onContextMenu={(e) => e.preventDefault()}>
        <AgGridTable
          ref={agGridComponentRef}
          columnDefs={columnDefs}
          className='usdParityManagement-grid'
          getRowId={getRowId}
          onGridReady={onGridReady}
          onFirstDataRendered={onFirstDataRendered}
          onRowDataUpdated={onRowDataUpdated}
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

SBPFXRevalRates.displayName = "SBPFXRevalRates";

export default SBPFXRevalRates;
