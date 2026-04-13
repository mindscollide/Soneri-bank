import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import styles from "../management.module.css";
import { formatCompactDate } from "../../../utils/timeFunction";
import { clearSbpFXRevalRatesForManagmentFeed } from "../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";
import AgGridTable from "../../../shareComponents/commonComponents/elements/globalAgGridTable";
import SectionLoader from "../../../shareComponents/elements/soneriLoader/SectionLoader";

// Selectors
const GetRevalRatesForTreasury = (state) =>
  state.WatchListReducer.GetRevalRatesForTreasury;

const sbpFXRevalRatesForManagementFeed = (state) =>
  state.RealtimeActionsSlice.sbpFXRevalRatesForManagementFeed;

const SBPFXRevalRates = memo(() => {
  const dispatch = useDispatch();

  const gridApiRef = useRef(null);
  const rowNodeMap = useRef(new Map());
  const pendingUpdates = useRef(new Map());
  const rafRef = useRef(null);
  const isProcessingRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastProcessTime = useRef(0);

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
      (a, b) => a.displayOrderPriority - b.displayOrderPriority
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

        // Extract and set tenors
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
        }, {})
      );

      return grouped;
    } catch (error) {
      console.error("Error building row data:", error);
      return [];
    }
  }, [revalRatesList, getUniqueTenors]);

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
      if (node.data?.currencyName) {
        rowNodeMap.current.set(node.data.currencyName, node);
      }
    });
  }, []);

  // ─────────────────────────────
  // ✅ THROTTLED PROCESSOR
  const processQueue = useCallback(() => {
    if (!isMountedRef.current || isProcessingRef.current || !gridApiRef.current) {
      rafRef.current = null;
      return;
    }

    const now = Date.now();
    const timeSinceLastProcess = now - lastProcessTime.current;

    // ✅ Throttle: minimum 50ms between updates
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
      // ✅ Process updates
      for (const [currency, updates] of pendingUpdates.current.entries()) {
        const node = rowNodeMap.current.get(currency);
        if (!node) {
          pendingUpdates.current.delete(currency);
          continue;
        }

        // Apply all tenor updates for this currency
        for (const [tenorKey, value] of Object.entries(updates.tenorValues)) {
          const currentValue = node.data[tenorKey];
          if (currentValue !== value) {
            node.setDataValue(tenorKey, value);
          }
        }

        // Update date if provided
        if (updates.lastModifiedDate) {
          setLatestDate(updates.lastModifiedDate);
        }

        pendingUpdates.current.delete(currency);
      }

      rafRef.current = null;
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
      if (!feed?.revalRates || !isMountedRef.current) return;

      const { currency, tenorId, value, lastModifiedDate } = feed.revalRates;
      const tenorKey = `tenorId_${tenorId}_value`;

      // Get existing pending update for this currency or create new
      const existing = pendingUpdates.current.get(currency) || {
        tenorValues: {},
        lastModifiedDate: null,
      };

      // Update the tenor value
      existing.tenorValues[tenorKey] = Number(value);

      // Update date if provided
      if (lastModifiedDate) {
        existing.lastModifiedDate = lastModifiedDate;
      }

      pendingUpdates.current.set(currency, existing);

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
        dispatch(clearSbpFXRevalRatesForManagmentFeed());
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
  // Generate dynamic columns based on tenors
  const columnDefs = useMemo(() => {
    const baseColumns = [
      {
        headerName: "Currency",
        field: "currencyName",
        cellClass: "instrument-cell",
        pinned: "left",
        width: 80,
      },
    ];

    const tenorColumns = tenors.map((tenor) => ({
      headerName: tenor.tenorName,
      field: `tenorId_${tenor.tenorId}_value`,
      cellClass: "value-cell",
      width: 70,
      valueFormatter: (p) => (p.value != null ? p.value : "-"),
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
    }),
    []
  );

  return (
    <>
      <span
        className={`${styles.tableheaderbar} d-flex justify-content-between`}
      >
        <span>SBP FX Reval Rates</span>
        <span className={styles.management_date}>
          {formatCompactDate(latestDate)}
        </span>
      </span>

      <div style={{ height: "300px", width: "100%" }}>
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

SBPFXRevalRates.displayName = "SBPFXRevalRates";

export default SBPFXRevalRates;