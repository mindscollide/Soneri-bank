import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";

import styles from "../RateSheet.module.css";
import "../rateSheetAgGrid.css";
import AgGridTable from "../../elements/globalAgGridTable";

import { clearTreasuryRateSheetSpotTTRates } from
  "../../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";

const PROCESS_THROTTLE_MS = 200;

// Selectors
const selectSpotTTRates = (state) =>
  state.WatchListReducer.GetSpotTTRatesForRateSheet;

const selectSpotTTRatesFeed = (state) =>
  state.RealtimeActionsSlice.treasuryRateSheetSpotTTRates;

const dashIfEmpty = ({ value }) =>
  value === 0 || value === null || value === undefined || value === ""
    ? "-"
    : value;

const SpotTTRates = memo(() => {
  const dispatch = useDispatch();
  const tableRef = useRef(null);

  /*
   * React state is used only for:
   * 1. Initial grid data
   * 2. Calculating the grid height
   *
   * Live updates go directly to AG Grid through transactions.
   */
  const [initialRows, setInitialRows] = useState([]);

  const pendingUpdatesRef = useRef(new Map());
  const processTimerRef = useRef(null);
  const isGridReadyRef = useRef(false);
  const isBaseDataReadyRef = useRef(false);

  const spotTTRatesData = useSelector(selectSpotTTRates);
  const fullFeed = useSelector(selectSpotTTRatesFeed);

  const getRowId = useCallback(
    (params) => String(params.data.instrumentID),
    [],
  );

  const handleGridReady = useCallback(() => {
    isGridReadyRef.current = true;
  }, []);

  /*
   * Process queued updates.
   *
   * pendingUpdatesRef is a Map:
   * instrumentID -> latest update
   *
   * Therefore, if one currency updates 20 times during the throttle
   * window, only its most recent value is sent to AG Grid.
   */
  const processPendingUpdates = useCallback(() => {
    processTimerRef.current = null;

    if (
      !isGridReadyRef.current ||
      !isBaseDataReadyRef.current ||
      pendingUpdatesRef.current.size === 0
    ) {
      return;
    }

    const changedRows = Array.from(
      pendingUpdatesRef.current.values(),
    );

    pendingUpdatesRef.current.clear();

    tableRef.current?.updateRows(changedRows);

    dispatch(clearTreasuryRateSheetSpotTTRates());
  }, [dispatch]);

  const scheduleUpdateProcessing = useCallback(() => {
    if (processTimerRef.current !== null) return;

    processTimerRef.current = window.setTimeout(
      processPendingUpdates,
      PROCESS_THROTTLE_MS,
    );
  }, [processPendingUpdates]);

  /*
   * Initialize or completely replace the base dataset.
   *
   * A normal rowData update is appropriate here because this is a
   * complete server snapshot, not a live price update.
   */
  useEffect(() => {
    const rows = spotTTRatesData?.spotTTRates;

    if (!Array.isArray(rows)) return;

    const normalizedRows = rows.map((item) => ({
      ...item,
      instrumentID: item.instrumentID,
    }));

    pendingUpdatesRef.current.clear();
    setInitialRows(normalizedRows);

    isBaseDataReadyRef.current = true;
  }, [spotTTRatesData]);

  /*
   * Collect incoming feed updates.
   *
   * Multiple updates for the same instrumentID are automatically
   * collapsed into one latest update.
   */
  useEffect(() => {
    if (!Array.isArray(fullFeed) || fullFeed.length === 0) {
      return;
    }

    fullFeed.forEach((feedItem) => {
      const update = feedItem?.spotTTRates;

      if (
        !update ||
        update.instrumentID === null ||
        update.instrumentID === undefined
      ) {
        return;
      }

      const rowId = String(update.instrumentID);

      /*
       * Merge with the current row data so the transaction contains
       * a complete row object, not only bid and offer.
       */
      const existingRow =
        tableRef.current?.getRowNode(rowId)?.data;

      pendingUpdatesRef.current.set(rowId, {
        ...existingRow,
        ...update,
        instrumentID: update.instrumentID,
      });
    });

    scheduleUpdateProcessing();
  }, [fullFeed, scheduleUpdateProcessing]);

  useEffect(() => {
    return () => {
      isGridReadyRef.current = false;
      isBaseDataReadyRef.current = false;
      pendingUpdatesRef.current.clear();

      if (processTimerRef.current !== null) {
        window.clearTimeout(processTimerRef.current);
        processTimerRef.current = null;
      }
    };
  }, []);

  const columnDefs = useMemo(
    () => [
      {
        headerName: "Currency",
        field: "currencyName",
        flex: 1,
        cellClass: "rs-first-col",
      },
      {
        headerName: "Symbol",
        field: "currencyCode",
        flex: 1,
      },
      {
        headerName: "Buying",
        field: "bid",
        flex: 1,
        valueFormatter: dashIfEmpty,
      },
      {
        headerName: "Selling",
        field: "offer",
        flex: 1,
        valueFormatter: dashIfEmpty,
      },
    ],
    [],
  );

  const defaultColDef = useMemo(
    () => ({
      resizable: false,
      sortable: false,
      suppressMovable: true,
    }),
    [],
  );

  const gridStyle = useMemo(
    () => ({
      height: 32 + Math.max(initialRows.length, 1) * 32,
    }),
    [initialRows.length],
  );

  return (
    <>
      <span className={styles.tableheaderbar}>
        Spot TT Rates
      </span>

      <AgGridTable
        ref={tableRef}
        className="rsAgGrid"
        style={gridStyle}
        rowData={initialRows}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={getRowId}
        onGridReady={handleGridReady}
        animateRows={false}
        asyncTransactionWaitMillis={50}
      />
    </>
  );
});

SpotTTRates.displayName = "SpotTTRates";

export default SpotTTRates;