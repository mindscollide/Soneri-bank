import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "../RateSheet.module.css";
import "../rateSheetAgGrid.css";
import AgGridTable from "../../elements/globalAgGridTable";
import SectionLoader from "../../../elements/soneriLoader/SectionLoader";
import NoDataOverlay from "../../../elements/soneriLoader/NoDataOverlay";
import { useDispatch, useSelector } from "react-redux";
import { clearTreasuryRateSheetCurrencyNotes } from "../../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";

// Selectors
const GetRatesForCurrencyNotesForRateSheet = (state) =>
  state.WatchListReducer.GetRatesForCurrencyNotesForRateSheet?.currencyNotes;

const GetAllInstrumentForTreasury = (state) =>
  state.WatchListReducer.GetAllInstrumentForTreasury?.crossInstruments;

const treasuryRateSheetCurrencyNotes = (state) =>
  state.RealtimeActionsSlice.treasuryRateSheetCurrencyNotes;

const toFixedOrDash = ({ value }) => (value ? Number(value).toFixed(2) : "-");
const PROCESS_THROTTLE_MS = 200;

const RatesForCurrencyNotes = memo(forwardRef((_props, ref) => {
  const dispatch = useDispatch();

  // State
  const [processedData, setProcessedData] = useState([]);

  // Refs
  const dataRef = useRef([]);
  const pendingUpdatesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const isInitializedRef = useRef(false);
  const lastProcessRef = useRef(0);

  const fullFeed = useSelector(treasuryRateSheetCurrencyNotes);
  const currencyNotes = useSelector(GetRatesForCurrencyNotesForRateSheet);
  const instruments = useSelector(GetAllInstrumentForTreasury);

  // ✅ Sync helper
  const applyRows = useCallback((rows) => {
    dataRef.current = rows;
    setProcessedData(rows);
  }, []);

  // ✅ Initialize base data
  useEffect(() => {
    if (!currencyNotes?.length || !instruments?.length) return;

    const enriched = currencyNotes.map((item) => {
      const matchedInstrument = instruments.find(
        (inst) => inst.instrumentID === item.instrumentID,
      );

      return {
        instrumentID: item.instrumentID,
        instrumentName: matchedInstrument?.instrumentName || "",
        buying: Number(item.bid ?? 0),
        selling: Number(item.offer ?? 0),
        version: 0,
      };
    });

    applyRows(enriched);
    isInitializedRef.current = true;
  }, [currencyNotes, instruments, applyRows]);

  // ✅ RAF batch processor (throttled — a rate sheet only needs to
  // repaint a few times a second, not on every animation frame)
  const processQueue = useCallback(() => {
    const updates = pendingUpdatesRef.current;

    if (!updates.length) {
      animationFrameRef.current = null;
      return;
    }

    const now = Date.now();
    if (now - lastProcessRef.current < PROCESS_THROTTLE_MS) {
      animationFrameRef.current = requestAnimationFrame(processQueue);
      return;
    }
    lastProcessRef.current = now;

    pendingUpdatesRef.current = [];

    // 🔥 Flatten updates
    const flatUpdates = updates.map((u) => u?.currencyNotes).filter(Boolean);

    if (!flatUpdates.length) {
      animationFrameRef.current = requestAnimationFrame(processQueue);
      return;
    }

    // 🔥 O(1) lookup map
    const updateMap = new Map(flatUpdates.map((u) => [u.instrumentID, u]));

    let changed = false;
    const updated = dataRef.current.map((row) => {
      const update = updateMap.get(row.instrumentID);
      if (!update) return row;

      if (
        Number(row.buying) === Number(update.bid) &&
        Number(row.selling) === Number(update.offer)
      ) {
        return row;
      }

      changed = true;
      return {
        ...row,
        buying: update.bid,
        selling: update.offer,
        version: (row.version || 0) + 1,
      };
    });

    if (changed) {
      applyRows(updated);
    }

    // ✅ Clear redux queue
    dispatch(clearTreasuryRateSheetCurrencyNotes());

    animationFrameRef.current = requestAnimationFrame(processQueue);
  }, [applyRows, dispatch]);

  // ✅ Enqueue updates
  useEffect(() => {
    if (!fullFeed?.length) return;

    pendingUpdatesRef.current = fullFeed;

    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(processQueue);
    }
  }, [fullFeed, processQueue]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Columns
  const columnDefs = useMemo(
    () => [
      {
        headerName: "Currency",
        field: "instrumentName",
        width: 150,
        cellClass: "rs-first-col",
      },
      {
        headerName: "Buying",
        field: "buying",
        flex: 1,
        valueFormatter: toFixedOrDash,
      },
      {
        headerName: "Selling",
        field: "selling",
        flex: 1,
        valueFormatter: toFixedOrDash,
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

  useImperativeHandle(
    ref,
    () => ({
      getExportData: () => ({
        headers: columnDefs.map((col) => col.headerName),
        rows: processedData.map((row) =>
          columnDefs.map((col) =>
            col.valueFormatter
              ? col.valueFormatter({ value: row[col.field] })
              : (row[col.field] ?? "-"),
          ),
        ),
      }),
    }),
    [columnDefs, processedData],
  );

  return (
    <>
      <span className={styles.tableheaderbar}>Rates For Currency Notes</span>

      <AgGridTable
        className='rsAgGrid'
        style={{
          height:
            32 + (processedData.length === 0 ? 4 : processedData.length) * 32,
        }}
        rowData={processedData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={(p) => String(p.data.instrumentID)}
        suppressColumnVirtualisation={true}
        animateRows={false}
        loadingOverlayComponent={SectionLoader}
        noRowsOverlayComponent={NoDataOverlay}
      />
    </>
  );
}));

RatesForCurrencyNotes.displayName = "RatesForCurrencyNotes";

export default RatesForCurrencyNotes;
